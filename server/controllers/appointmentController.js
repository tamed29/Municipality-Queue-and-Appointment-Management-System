import { query } from '../config/db.js';

export const createAppointment = async (req, res) => {
  const { service_id, appointment_date, time_slot } = req.body;
  const user_id = req.user.id;

  try {
    const result = await query(
      'INSERT INTO appointments (user_id, service_id, appointment_date, time_slot, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, service_id, appointment_date, time_slot, 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyAppointments = async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await query(`
      SELECT a.*, s.name as service_name, s.department, s.duration_minutes 
      FROM appointments a 
      JOIN services s ON a.service_id = s.id 
      WHERE a.user_id = $1 
      ORDER BY a.appointment_date DESC, a.time_slot DESC
    `, [user_id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const appointmentResult = await query('SELECT * FROM appointments WHERE id = $1 AND user_id = $2', [id, user_id]);
    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const updated = await query('UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *', ['cancelled', id]);
    res.json(updated.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
