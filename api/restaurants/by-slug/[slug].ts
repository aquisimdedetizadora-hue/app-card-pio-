import { getPublicRestaurantDataBySlug } from '../../_lib/db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { slug } = req.query;
    const rawSlug = Array.isArray(slug) ? slug[0] : (slug || '');
    const data = await getPublicRestaurantDataBySlug(rawSlug);
    if (!data || !data.restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    return res.status(200).json(data.restaurant);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
