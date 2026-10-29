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

  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer vcl_jwt_')) {
    try {
      const jsonStr = Buffer.from(authHeader.replace('Bearer vcl_jwt_', ''), 'base64').toString('utf8');
      const user = JSON.parse(jsonStr);
      return res.status(200).json({ success: true, data: user });
    } catch {
      // fallback
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      id: 'usr_default_demo',
      email: 'patient@dailyhealth.internal',
      name: 'Demo Patient',
      timezone: 'UTC',
      locale: 'en',
      createdAt: new Date().toISOString(),
    },
  });
}

