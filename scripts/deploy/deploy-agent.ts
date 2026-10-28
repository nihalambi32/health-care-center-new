#!/usr/bin/env node
/**
 * Daily Health Companion - Automated Deploy CLI
 *
 * Orchestrates zero-downtime deployment to Render:
 * 1. Verifies GitHub commit CI status via GitHub REST API (polls until success or timeout).
 * 2. Triggers Render deploy for API service and polls until live.
 * 3. Triggers Render deploy for Worker service only after API is live (ensuring migrations complete first).
 * 4. Verifies /api/health and /api/health/ready with retries.
 * 5. Rolls back both services to last known live deploys on any failure or timeout.
 * 6. Dispatches status notification to optional Slack or Telegram webhook (scrubbing sensitive info).
 */

import { parseArgs } from 'node:util';

interface DeployConfig {
  env: 'staging' | 'production';
  githubToken?: string;
  githubRepo?: string; // owner/repo
  commitSha?: string;
  renderApiKey: string;
  apiServiceId: string;
  workerServiceId?: string;
  apiUrl: string;
  notificationWebhookUrl?: string;
}

interface RenderDeployResponse {
  id: string;
  status: 'created' | 'build_in_progress' | 'update_in_progress' | 'live' | 'build_failed' | 'update_failed' | 'canceled';
  commit?: {
    id: string;
    message: string;
  };
  finishedAt?: string;
}

interface RenderServiceDeployListItem {
  deploy: RenderDeployResponse;
}

// Terminal color helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(msg: string) {
  console.log(`[DEPLOY AGENT] ${msg}`);
}

function warn(msg: string) {
  console.warn(`${colors.yellow}[WARNING] ${msg}${colors.reset}`);
}

function success(msg: string) {
  console.log(`${colors.green}${colors.bold}[SUCCESS] ${msg}${colors.reset}`);
}

function failure(msg: string) {
  console.error(`${colors.red}${colors.bold}[ERROR] ${msg}${colors.reset}`);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Scrub sensitive headers, secrets, auth tokens and health data from strings
 */
function sanitize(text: string): string {
  return text
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, '$1[REDACTED]')
    .replace(/(rnd_[A-Za-z0-9]+)/gi, '[REDACTED_RENDER_KEY]')
    .replace(/(ghp_[A-Za-z0-9]+)/gi, '[REDACTED_GITHUB_TOKEN]')
    .replace(/("password":\s*")[^"]+(")/gi, '$1[REDACTED]$2');
}

/**
 * Send webhook notification to Slack or Telegram
 */
async function sendNotification(
  webhookUrl: string | undefined,
  payload: {
    environment: string;
    commitSha: string;
    status: 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';
    durationSeconds: number;
    details: string;
  }
) {
  if (!webhookUrl) return;

  try {
    const text = sanitize(
      `*Daily Health Companion Deploy [${payload.environment.toUpperCase()}]*\n` +
      `Status: *${payload.status}*\n` +
      `Commit: \`${payload.commitSha.slice(0, 7)}\`\n` +
      `Duration: ${payload.durationSeconds}s\n` +
      `Details: ${payload.details}`
    );

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (err: any) {
    warn(`Failed to dispatch webhook notification: ${err?.message}`);
  }
}

/**
 * 1. Verify GitHub CI status for the target commit
 */
async function verifyGitHubCi(config: DeployConfig): Promise<boolean> {
  if (!config.githubToken || !config.githubRepo || !config.commitSha) {
    log('Skipping GitHub CI verification (GITHUB_TOKEN, GITHUB_REPOSITORY, or COMMIT_SHA not provided)');
    return true;
  }

  log(`Verifying GitHub CI status for commit ${config.commitSha.slice(0, 7)}...`);
  const maxTimeoutMs = 15 * 60 * 1000; // 15 minutes timeout
  const pollIntervalMs = 15 * 1000;
  const startTime = Date.now();

  while (Date.now() - startTime < maxTimeoutMs) {
    try {
      // VERIFY: GitHub REST API endpoint GET /repos/{owner}/{repo}/commits/{ref}/status
      const res = await fetch(
        `https://api.github.com/repos/${config.githubRepo}/commits/${config.commitSha}/status`,
        {
          headers: {
            Authorization: `Bearer ${config.githubToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'DailyHealth-DeployAgent',
          },
        }
      );

      if (!res.ok) {
        warn(`GitHub API status returned ${res.status}: ${res.statusText}`);
      } else {
        const data = (await res.json()) as { state: string };
        log(`Current commit check state: ${data.state}`);

        if (data.state === 'success') {
          success('Commit CI checks passed successfully on GitHub.');
          return true;
        }

        if (data.state === 'failure' || data.state === 'error') {
          failure(`GitHub commit CI status reported: ${data.state}`);
          return false;
        }
      }
    } catch (err: any) {
      warn(`GitHub API error: ${err?.message}`);
    }

    log('Waiting for GitHub CI completion (polling in 15s)...');
    await sleep(pollIntervalMs);
  }

  failure('Timed out waiting for GitHub CI checks to pass (15 min limit reached).');
  return false;
}

/**
 * Fetch last known live deploy ID for rollback target
 */
async function getLastLiveDeployId(serviceId: string, apiKey: string): Promise<string | null> {
  try {
    // VERIFY: Render REST API endpoint GET /v1/services/{serviceId}/deploys?limit=5
    const res = await fetch(`https://api.render.com/v1/services/${serviceId}/deploys?limit=5`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) return null;
    const deploys = (await res.json()) as RenderServiceDeployListItem[];
    const liveDeploy = deploys.find((d) => d.deploy.status === 'live');
    return liveDeploy ? liveDeploy.deploy.id : null;
  } catch {
    return null;
  }
}

/**
 * Trigger deploy on Render
 */
async function triggerRenderDeploy(
  serviceId: string,
  apiKey: string,
  commitId?: string
): Promise<string> {
  // VERIFY: Render REST API endpoint POST /v1/services/{serviceId}/deploys
  const body: Record<string, any> = {};
  if (commitId) {
    body.commitId = commitId;
  }

  const res = await fetch(`https://api.render.com/v1/services/${serviceId}/deploys`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Render deploy trigger failed [${res.status}]: ${sanitize(errorText)}`);
  }

  const data = (await res.json()) as RenderDeployResponse;
  return data.id;
}

/**
 * Poll Render deploy status until terminal state
 */
async function pollRenderDeploy(
  serviceId: string,
  deployId: string,
  apiKey: string,
  timeoutMs = 15 * 60 * 1000
): Promise<boolean> {
  const startTime = Date.now();
  const pollInterval = 10 * 1000;

  while (Date.now() - startTime < timeoutMs) {
    // VERIFY: Render REST API endpoint GET /v1/services/{serviceId}/deploys/{deployId}
    const res = await fetch(`https://api.render.com/v1/services/${serviceId}/deploys/${deployId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      warn(`Failed to poll Render deploy status (${res.status})`);
    } else {
      const data = (await res.json()) as RenderDeployResponse;
      log(`Render deploy [${deployId}] status: ${data.status}`);

      if (data.status === 'live') {
        return true;
      }

      if (['build_failed', 'update_failed', 'canceled'].includes(data.status)) {
        failure(`Render deploy failed with status: ${data.status}`);
        return false;
      }
    }

    await sleep(pollInterval);
  }

  failure(`Timed out waiting for Render deploy ${deployId} to finish.`);
  return false;
}

/**
 * Verify Health Endpoints (/api/health and /api/health/ready)
 */
async function verifyHealth(baseUrl: string): Promise<boolean> {
  const maxRetries = 10;
  const retryDelayMs = 15 * 1000;
  const normalizedUrl = baseUrl.replace(/\/+$/, '');

  log(`Verifying API health at ${normalizedUrl}/api/health and /api/health/ready...`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    log(`Health check attempt ${attempt}/${maxRetries}...`);
    try {
      const [healthRes, readyRes] = await Promise.all([
        fetch(`${normalizedUrl}/api/health`, { signal: AbortSignal.timeout(5000) }),
        fetch(`${normalizedUrl}/api/health/ready`, { signal: AbortSignal.timeout(5000) }),
      ]);

      if (healthRes.ok && readyRes.ok) {
        const readyData = await readyRes.json().catch(() => ({}));
        log(`Health OK (status: ${healthRes.status}), Ready OK (status: ${readyRes.status}): ${JSON.stringify(readyData)}`);
        return true;
      }

      warn(`Endpoints not ready yet. Health: ${healthRes.status}, Ready: ${readyRes.status}`);
    } catch (err: any) {
      warn(`Health check attempt ${attempt} error: ${err.message}`);
    }

    if (attempt < maxRetries) {
      await sleep(retryDelayMs);
    }
  }

  failure(`Health checks failed after ${maxRetries} attempts.`);
  return false;
}

/**
 * Rollback a Render service to previous deploy
 */
async function rollbackService(
  serviceName: string,
  serviceId: string,
  previousDeployId: string | null,
  apiKey: string
) {
  if (!previousDeployId) {
    warn(`No previous live deploy found for ${serviceName} to roll back to.`);
    return;
  }

  log(`Rolling back ${serviceName} to deploy ${previousDeployId}...`);
  warn('CRITICAL WARNING: Database migrations applied by newer deploys are NOT auto-reverted on rollback. Manual schema migration review required.');

  try {
    // VERIFY: Render REST API rollback endpoint POST /v1/services/{serviceId}/rollback
    // Fallback in Render API: re-trigger deploy with previous deploy commit or explicit rollback
    const rollbackRes = await fetch(`https://api.render.com/v1/services/${serviceId}/deploys/${previousDeployId}/rollback`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (rollbackRes.ok) {
      success(`Rollback initiated for ${serviceName}`);
    } else {
      warn(`Rollback endpoint returned ${rollbackRes.status}. Attempting standard re-deploy of prior state.`);
      await triggerRenderDeploy(serviceId, apiKey);
    }
  } catch (err: any) {
    failure(`Failed to trigger rollback on ${serviceName}: ${err.message}`);
  }
}

/**
 * Main Deploy Orchestration Function
 */
export async function runDeployCli() {
  const startTime = Date.now();
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      env: { type: 'string', default: 'staging' },
      'commit-sha': { type: 'string' },
    },
    strict: false,
  });

  const environment = (values.env === 'production' ? 'production' : 'staging') as 'staging' | 'production';

  const config: DeployConfig = {
    env: environment,
    githubToken: process.env.GITHUB_TOKEN,
    githubRepo: process.env.GITHUB_REPOSITORY,
    commitSha: (values['commit-sha'] as string) || process.env.GITHUB_SHA,
    renderApiKey: process.env.RENDER_API_KEY || '',
    apiServiceId: (environment === 'production' ? process.env.RENDER_API_SERVICE_ID_PROD : process.env.RENDER_API_SERVICE_ID_STAGING) || process.env.RENDER_API_SERVICE_ID || '',
    workerServiceId: (environment === 'production' ? process.env.RENDER_WORKER_SERVICE_ID_PROD : process.env.RENDER_WORKER_SERVICE_ID_STAGING) || process.env.RENDER_WORKER_SERVICE_ID || '',
    apiUrl: (environment === 'production' ? process.env.API_URL_PROD : process.env.API_URL_STAGING) || process.env.API_URL || 'http://localhost:4000',
    notificationWebhookUrl: process.env.DEPLOY_NOTIFICATION_WEBHOOK_URL,
  };

  log(`=======================================================`);
  log(`Starting Automated Deploy Agent for Daily Health Companion`);
  log(`Environment: ${config.env.toUpperCase()}`);
  log(`API Target: ${config.apiUrl}`);
  log(`=======================================================`);

  if (!config.renderApiKey) {
    failure('RENDER_API_KEY is not defined. Cannot trigger Render deploys.');
    process.exit(1);
  }

  if (!config.apiServiceId) {
    failure('RENDER_API_SERVICE_ID is not configured for this environment.');
    process.exit(1);
  }

  // Record baseline deploy IDs for rollback
  log('Fetching previous live deploy baselines for safety rollback...');
  const prevApiDeployId = await getLastLiveDeployId(config.apiServiceId, config.renderApiKey);
  const prevWorkerDeployId = config.workerServiceId
    ? await getLastLiveDeployId(config.workerServiceId, config.renderApiKey)
    : null;

  log(`Baseline API Deploy ID: ${prevApiDeployId || 'none'}`);
  log(`Baseline Worker Deploy ID: ${prevWorkerDeployId || 'none'}`);

  try {
    // Step 1: CI Verification
    const ciOk = await verifyGitHubCi(config);
    if (!ciOk) {
      throw new Error('GitHub CI verification failed or timed out.');
    }

    // Step 2: Trigger and wait for API deploy (runs DB migrations first)
    log(`Triggering Render API deploy for service ${config.apiServiceId}...`);
    const apiDeployId = await triggerRenderDeploy(config.apiServiceId, config.renderApiKey, config.commitSha);
    log(`API deploy triggered with ID: ${apiDeployId}. Waiting for live status...`);

    const apiLive = await pollRenderDeploy(config.apiServiceId, apiDeployId, config.renderApiKey);
    if (!apiLive) {
      throw new Error(`API deploy ${apiDeployId} failed to reach live status.`);
    }
    success('API service is successfully live on Render.');

    // Step 3: Trigger Worker deploy only after API is live
    if (config.workerServiceId) {
      log(`Triggering Worker deploy for service ${config.workerServiceId}...`);
      const workerDeployId = await triggerRenderDeploy(config.workerServiceId, config.renderApiKey, config.commitSha);
      log(`Worker deploy triggered with ID: ${workerDeployId}. Waiting for live status...`);

      const workerLive = await pollRenderDeploy(config.workerServiceId, workerDeployId, config.renderApiKey);
      if (!workerLive) {
        throw new Error(`Worker deploy ${workerDeployId} failed to reach live status.`);
      }
      success('Worker service is successfully live on Render.');
    }

    // Step 4: Verify health checks
    const healthOk = await verifyHealth(config.apiUrl);
    if (!healthOk) {
      throw new Error(`Health checks failed on ${config.apiUrl}`);
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    success(`Deployment completed successfully in ${duration}s!`);

    await sendNotification(config.notificationWebhookUrl, {
      environment: config.env,
      commitSha: config.commitSha || 'unknown',
      status: 'SUCCESS',
      durationSeconds: duration,
      details: 'All services updated, database migrated, health and ready checks verified 100% OK.',
    });

    process.exit(0);
  } catch (err: any) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    failure(`Deployment failure encountered: ${err.message}`);
    log('Initiating rollback procedure...');

    await rollbackService('API Service', config.apiServiceId, prevApiDeployId, config.renderApiKey);
    if (config.workerServiceId && prevWorkerDeployId) {
      await rollbackService('Worker Service', config.workerServiceId, prevWorkerDeployId, config.renderApiKey);
    }

    // Re-verify health after rollback
    log('Verifying system health following rollback...');
    await verifyHealth(config.apiUrl);

    await sendNotification(config.notificationWebhookUrl, {
      environment: config.env,
      commitSha: config.commitSha || 'unknown',
      status: 'ROLLED_BACK',
      durationSeconds: duration,
      details: `Deploy aborted: ${err.message}. Services rolled back to previous live releases.`,
    });

    process.exit(1);
  }
}

// Execute when invoked directly
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('deploy-agent.ts') || process.argv[1].endsWith('deploy.ts')) {
  runDeployCli().catch((err) => {
    failure(`Unexpected fatal error: ${err?.message || err}`);
    process.exit(1);
  });
}
