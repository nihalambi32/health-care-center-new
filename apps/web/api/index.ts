export default function handler(req: any, res: any) {
  res.status(200).json({ status: 'Daily Health API operational', time: new Date().toISOString() });
}

