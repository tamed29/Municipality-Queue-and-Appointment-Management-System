import { query } from '../config/db.js';

export const checkin = async (req, res) => {
  const { service_id } = req.body;
  const user_id = req.user.id;
  const user_age = req.user.age; // Actually age is not in req.user, I need to fetch it

  try {
    const userResult = await query('SELECT age FROM users WHERE id = $1', [user_id]);
    const age = userResult.rows[0].age;
    
    // Check if user is already in waiting queue
    const existingQueue = await query("SELECT * FROM queue WHERE user_id = $1 AND status IN ('waiting', 'serving')", [user_id]);
    if (existingQueue.rows.length > 0) {
      return res.status(400).json({ message: 'You are already in the queue' });
    }

    const isPriority = age >= 60;
    const queueType = isPriority ? 'priority' : 'normal';
    const prefix = isPriority ? 'P' : 'A';

    // Get today's count for this type to generate number
    const countResult = await query("SELECT COUNT(*) FROM queue WHERE queue_type = $1 AND DATE(created_at) = CURRENT_DATE", [queueType]);
    const count = parseInt(countResult.rows[0].count, 10) + 1;
    const queueNumber = `${prefix}${String(count).padStart(3, '0')}`;

    const newQueue = await query(
      'INSERT INTO queue (user_id, service_id, queue_number, queue_type, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, service_id, queueNumber, queueType, 'waiting']
    );

    res.status(201).json(newQueue.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyQueueStatus = async (req, res) => {
  const user_id = req.user.id;
  
  try {
    const result = await query(`
      SELECT q.*, s.name as service_name 
      FROM queue q 
      JOIN services s ON q.service_id = s.id 
      WHERE q.user_id = $1 AND q.status IN ('waiting', 'serving')
      ORDER BY q.created_at DESC LIMIT 1
    `, [user_id]);

    if (result.rows.length === 0) {
      return res.json(null);
    }

    const myQueue = result.rows[0];
    
    // Calculate position
    let positionResult;
    if (myQueue.queue_type === 'priority') {
      positionResult = await query(`
        SELECT COUNT(*) FROM queue 
        WHERE status = 'waiting' 
        AND created_at < $1
        AND queue_type = 'priority'
      `, [myQueue.created_at]);
    } else {
      positionResult = await query(`
        SELECT COUNT(*) FROM queue 
        WHERE status = 'waiting' 
        AND created_at < $1
      `, [myQueue.created_at]);
    }
    
    myQueue.position = parseInt(positionResult.rows[0].count, 10) + 1;
    // rough estimate 10 mins per person
    myQueue.estimated_wait_time = myQueue.position * 10; 

    res.json(myQueue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const getQueueSummary = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        s.department,
        (SELECT queue_number FROM queue q2 JOIN services s2 ON q2.service_id = s2.id 
         WHERE s2.department = s.department AND q2.status = 'serving' 
         ORDER BY q2.created_at DESC LIMIT 1) as current_serving,
        (SELECT COUNT(*) FROM queue q3 JOIN services s3 ON q3.service_id = s3.id 
         WHERE s3.department = s.department AND q3.status = 'waiting') as waiting_count
      FROM services s
      GROUP BY s.department
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
