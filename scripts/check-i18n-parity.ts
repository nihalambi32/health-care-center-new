import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function getKeys(obj: any, prefix = ''): string[] {
  return Object.keys(obj).reduce((acc: string[], k) => {
    const pre = prefix.length ? `${prefix}.` : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      acc.push(...getKeys(obj[k], pre + k));
    } else {
      acc.push(pre + k);
    }
    return acc;
  }, []);
}

const enPath = resolve(process.cwd(), 'apps/web/src/i18n/locales/en.json');
const hiPath = resolve(process.cwd(), 'apps/web/src/i18n/locales/hi.json');

const en = JSON.parse(readFileSync(enPath, 'utf8'));
const hi = JSON.parse(readFileSync(hiPath, 'utf8'));

const enKeys = new Set(getKeys(en));
const hiKeys = new Set(getKeys(hi));

const missingInHi = [...enKeys].filter((k) => !hiKeys.has(k));
const missingInEn = [...hiKeys].filter((k) => !enKeys.has(k));

if (missingInHi.length > 0 || missingInEn.length > 0) {
  console.error('❌ i18n Key Parity Mismatch Found!');
  if (missingInHi.length) {
    console.error(`Missing in hi.json (${missingInHi.length}):`, missingInHi.slice(0, 10));
  }
  if (missingInEn.length) {
    console.error(`Missing in en.json (${missingInEn.length}):`, missingInEn.slice(0, 10));
  }
  process.exit(1);
} else {
  console.log(`✅ i18n Key Parity Check Passed: ${enKeys.size} keys match exactly across English and Hindi.`);
}
