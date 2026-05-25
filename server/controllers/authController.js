import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const registerUser = async (req, res) => {
  const { full_name, national_id, phone, email, age, password } = req.body;

  try {
    const userExists = await query('SELECT * FROM users WHERE national_id = $1 OR email = $2', [national_id, email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User with this National ID or Email already exists' });
    }

    const salt = await bcrypt.genSalt(4);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await query(
      'INSERT INTO users (full_name, national_id, phone, email, age, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, email, role, national_id, phone, age, is_active',
      [full_name, national_id, phone, email, age, password_hash]
    );

    const user = newUser.rows[0];

    res.status(201).json({
      _id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      national_id: user.national_id,
      phone: user.phone,
      age: user.age,
      is_active: user.is_active,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or phone

  try {
    const userResult = await query('SELECT * FROM users WHERE email = $1 OR phone = $1', [identifier]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: 'User account is inactive. Please contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      national_id: user.national_id,
      phone: user.phone,
      age: user.age,
      is_active: user.is_active,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  res.json({
    _id: req.user.id,
    full_name: req.user.full_name,
    email: req.user.email,
    role: req.user.role,
    national_id: req.user.national_id,
    phone: req.user.phone,
    age: req.user.age,
    is_active: req.user.is_active,
  });
};
