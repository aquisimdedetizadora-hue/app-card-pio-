import { getAllRestaurants } from './_lib/db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const restaurants = await getAllRestaurants();
      return res.status(200).json({ status: 'ok', restaurantsCount: restaurants.length });
    }
    return res.status(200).json({ status: 'ok', synced: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
