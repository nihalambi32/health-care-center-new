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

  const today = new Date().toISOString().split('T')[0];

  return res.status(200).json({
    success: true,
    data: {
      date: today,
      goalsProgress: [
        { goalId: 'goal_water', type: 'WATER', target: 2500, current: 1850, percentage: 74 },
        { goalId: 'goal_steps', type: 'STEPS', target: 10000, current: 8200, percentage: 82 },
        { goalId: 'goal_sleep', type: 'SLEEP', target: 8, current: 7.5, percentage: 94 }
      ],
      todayLogsCount: 6,
      upcomingReminders: [
        {
          id: 'rem_1',
          title: 'Afternoon Hydration',
          nextFireAt: new Date(Date.now() + 3600000).toISOString(),
          kind: 'WATER'
        },
        {
          id: 'rem_2',
          title: 'Multivitamin',
          nextFireAt: new Date(Date.now() + 7200000).toISOString(),
          kind: 'MEDICINE'
        }
      ]
    }
  });
}

