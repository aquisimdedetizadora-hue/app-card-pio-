import { getCategories, saveCategory, deleteCategory } from '../_lib/db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const saved = await saveCategory(req.body);
      return res.status(200).json(saved);
    }
    if (req.method === 'GET') {
      const restaurantId = req.query.restaurantId || '';
      const list = await getCategories(restaurantId);
      return res.status(200).json(list);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
