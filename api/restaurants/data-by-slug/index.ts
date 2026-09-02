import { getPublicRestaurantDataBySlug } from '../../_lib/db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const rawSlug = req.query.slug || '';
    if (!rawSlug) {
      return res.status(400).json({ status: 'error', error: 'Slug do restaurante é obrigatório' });
    }

    const data = await getPublicRestaurantDataBySlug(rawSlug);
    if (!data || !data.restaurant) {
      return res.status(404).json({
        status: 'not_found',
        error: 'Cardápio não encontrado',
        slug: rawSlug
      });
    }

    return res.status(200).json({
      status: 'found',
      restaurant: data.restaurant,
      categories: data.categories,
      products: data.products,
      addonGroups: data.addonGroups
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
}
