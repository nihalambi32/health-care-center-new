export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ success: true, data: { success: true } });
  }

  return res.status(200).json({
    success: true,
    data: [
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: 'Hello! I am your AI Bio-Wellness Companion powered by Gemini. Ask me anything about hydration, sleep habits, daily nutrition, or health goals.',
        createdAt: new Date().toISOString()
      }
    ]
  });
}

