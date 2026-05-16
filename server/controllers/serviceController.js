import { query } from '../config/db.js';

export const getServices = async (req, res) => {
  try {
    const result = await query('SELECT * FROM services WHERE is_active = true ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
