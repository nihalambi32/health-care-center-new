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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const body = req.body || {};
  const email = body.email || 'patient@dailyhealth.internal';
  
  const user = {
    id: 'usr_' + Buffer.from(email).toString('hex').slice(0, 12),
    email,
    name: body.name || (email.includes('@') ? email.split('@')[0] : 'Patient'),
    timezone: body.timezone || 'UTC',
    locale: body.locale || 'en',
    createdAt: new Date().toISOString(),
  };

  const accessToken = 'vcl_jwt_' + Buffer.from(JSON.stringify(user)).toString('base64');
  const refreshToken = 'vcl_ref_' + Date.now();

  return res.status(200).json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user,
    },
  });
}

