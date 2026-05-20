import { query } from '../config/db.js';

// Users
export const getUsers = async (req, res) => {
  try {
    const result = await query('SELECT id, full_name, national_id, phone, email, age, role, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const result = await query('UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, full_name, is_active', [is_active, id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Services
export const createService = async (req, res) => {
  const { name, description, duration_minutes } = req.body;
  try {
    const result = await query(
      'INSERT INTO services (name, description, duration_minutes) VALUES ($1, $2, $3) RETURNING *',
      [name, description, duration_minutes || 30]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, description, duration_minutes, is_active } = req.body;
  try {
    const result = await query(
      'UPDATE services SET name = $1, description = $2, duration_minutes = $3, is_active = $4 WHERE id = $5 RETURNING *',
      [name, description, duration_minutes, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    // Instead of actual delete, maybe just deactivate
    await query('UPDATE services SET is_active = false WHERE id = $1', [id]);
    res.json({ message: 'Service deactivated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Queue
export const getQueue = async (req, res) => {
  try {
    const result = await query(`
      SELECT q.*, u.full_name, s.name as service_name 
      FROM queue q 
      JOIN users u ON q.user_id = u.id 
      JOIN services s ON q.service_id = s.id 
      WHERE q.status IN ('waiting', 'serving')
      ORDER BY 
        CASE WHEN q.status = 'serving' THEN 1 ELSE 2 END,
        CASE WHEN q.queue_type = 'priority' THEN 1 ELSE 2 END, 
        q.created_at ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const callNextQueue = async (req, res) => {
  try {
    // Get the highest priority waiting person
    const nextResult = await query(`
      SELECT id FROM queue 
      WHERE status = 'waiting' 
      ORDER BY 
        CASE WHEN queue_type = 'priority' THEN 1 ELSE 2 END, 
        created_at ASC 
      LIMIT 1
    `);

    if (nextResult.rows.length === 0) {
      return res.status(404).json({ message: 'Queue is empty' });
    }

    const nextId = nextResult.rows[0].id;

    // Mark current serving as done? Or maybe admin does it explicitly. Let's just update this one to serving
    const updated = await query("UPDATE queue SET status = 'serving' WHERE id = $1 RETURNING *", [nextId]);
    
    // Also emit socket event in real app
    res.json(updated.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const skipQueue = async (req, res) => {
  const { id } = req.body;
  try {
    const updated = await query("UPDATE queue SET status = 'skipped' WHERE id = $1 RETURNING *", [id]);
    res.json(updated.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Appointments
export const getAppointments = async (req, res) => {
  try {
    const result = await query(`
      SELECT a.*, u.full_name, u.phone, s.name as service_name, s.department 
      FROM appointments a 
      JOIN users u ON a.user_id = u.id 
      JOIN services s ON a.service_id = s.id 
      ORDER BY a.appointment_date DESC, a.time_slot ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, appointment_date, time_slot } = req.body;
  try {
    let result;
    if (appointment_date && time_slot) {
      result = await query(
        'UPDATE appointments SET status = $1, appointment_date = $2, time_slot = $3 WHERE id = $4 RETURNING *',
        [status, appointment_date, time_slot, id]
      );
    } else {
      result = await query('UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Stats
export const getStats = async (req, res) => {
  try {
    const usersCount = await query('SELECT COUNT(*) FROM users');
    const appointmentsToday = await query("SELECT COUNT(*) FROM appointments WHERE appointment_date = CURRENT_DATE");
    const activeQueue = await query("SELECT COUNT(*) FROM queue WHERE status IN ('waiting', 'serving')");
    const completedToday = await query("SELECT COUNT(*) FROM queue WHERE status = 'done' AND DATE(created_at) = CURRENT_DATE");
    
    res.json({
      totalUsers: parseInt(usersCount.rows[0].count, 10),
      appointmentsToday: parseInt(appointmentsToday.rows[0].count, 10),
      activeQueue: parseInt(activeQueue.rows[0].count, 10),
      avgWaitTime: 15, // Mock for now
      completedToday: parseInt(completedToday.rows[0].count, 10)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetDatabase = async (req, res) => {
  try {
    console.log("Truncating data tables...");
    await query('TRUNCATE TABLE feedback, queue, appointments, users RESTART IDENTITY CASCADE');
    console.log("Data tables truncated successfully. Seeding services...");
    await query(`
      INSERT INTO services (name, department, description, duration_minutes) 
      SELECT name, department, description, duration_minutes FROM (
        VALUES 
        ('ID Card Issuance', 'Civil Registration Office', 'ID cards, birth, marriage & death certificates', 30),
        ('ID Card Renewal', 'Civil Registration Office', 'Renew your existing national identity card.', 20),
        ('ID Replacement (Lost/Damaged)', 'Civil Registration Office', 'Replace a lost or damaged ID card.', 25),
        ('Birth Certificate', 'Civil Registration Office', 'Request a certified copy of a birth certificate.', 20),
        ('Marriage Certificate', 'Civil Registration Office', 'Apply for a marriage certificate.', 30),
        ('Death Certificate', 'Civil Registration Office', 'Request a death certificate.', 20),
        ('Residence Certificate', 'Residence & Population Office', 'Apply for a residence certificate.', 15),
        ('Change of Residence Address', 'Residence & Population Office', 'Update your registered address.', 20),
        ('Family Registration', 'Residence & Population Office', 'Register family members.', 25),
        ('Household Registration Update', 'Residence & Population Office', 'Update household information.', 20),
        ('New Business License', 'Business & Trade Office', 'Apply for a new municipal business license.', 45),
        ('Business License Renewal', 'Business & Trade Office', 'Renew your business license.', 30),
        ('Business License Cancellation', 'Business & Trade Office', 'Cancel an existing business license.', 20),
        ('Trade Registration', 'Business & Trade Office', 'Register a new trade name.', 40),
        ('Land Ownership Certificate', 'Land & Property Office', 'Apply for land title.', 60),
        ('Land Transfer Service', 'Land & Property Office', 'Transfer land ownership.', 60),
        ('Building Permit Application', 'Land & Property Office', 'Apply for construction permit.', 45),
        ('Property Registration', 'Land & Property Office', 'Register new property.', 50),
        ('Property Tax Service', 'Land & Property Office', 'Property tax assessment and payment.', 30),
        ('Tax Payment', 'Tax & Finance Office', 'Pay municipal taxes.', 20),
        ('Tax Clearance Certificate', 'Tax & Finance Office', 'Request tax clearance.', 30),
        ('Business Tax Registration', 'Tax & Finance Office', 'Register business for tax.', 40),
        ('Penalty Payment', 'Tax & Finance Office', 'Pay municipal penalties.', 15),
        ('Construction Permit', 'Construction & Urban Planning Office', 'Apply for construction permit.', 60),
        ('Building Plan Approval', 'Construction & Urban Planning Office', 'Approve building designs.', 60),
        ('Renovation Permit', 'Construction & Urban Planning Office', 'Permit for house renovation.', 45),
        ('Infrastructure Service Request', 'Construction & Urban Planning Office', 'Request for basic infrastructure.', 30),
        ('Garbage Collection Request', 'Public Services Office', 'Request waste management.', 15),
        ('Street Maintenance Complaint', 'Public Services Office', 'Report street issues.', 15),
        ('Water Service Registration', 'Public Services Office', 'Register for water utility.', 30),
        ('Electricity Service Registration', 'Public Services Office', 'Register for electricity utility.', 30)
      ) AS seed(name, department, description, duration_minutes)
      WHERE NOT EXISTS (
        SELECT 1 FROM services WHERE services.name = seed.name
      );
    `);
    console.log("Services seeded successfully.");
    res.json({ message: 'Database wiped and seeded successfully. You can now start from zero.' });
  } catch (error) {
    console.error("Failed to reset DB:", error);
    res.status(500).json({ message: 'Server error wiping database' });
  }
};
