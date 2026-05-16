-- schema.sql (SQLite Compatible)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name VARCHAR(100) NOT NULL,
  national_id VARCHAR(20) UNIQUE NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100) UNIQUE,
  age INTEGER NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(10) DEFAULT 'user',
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) DEFAULT 'General',
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed services if they don't exist
INSERT INTO services (name, department, description, duration_minutes) 
SELECT 'New ID Card', 'Civil Registration', 'Apply for a new national identity card.', 30
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'New ID Card');

INSERT INTO services (name, department, description, duration_minutes) 
SELECT 'ID Card Renewal', 'Civil Registration', 'Renew your existing national identity card.', 15
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'ID Card Renewal');

INSERT INTO services (name, department, description, duration_minutes) 
SELECT 'Birth Certificate', 'Civil Registration', 'Request a certified copy of a birth certificate.', 20
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Birth Certificate');

INSERT INTO services (name, department, description, duration_minutes) 
SELECT 'Business License', 'Trade & Industry', 'Apply for a new municipal business license.', 45
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Business License');

INSERT INTO services (name, department, description, duration_minutes) 
SELECT 'Construction Permit', 'Urban Planning', 'Apply for a permit to start new construction.', 60
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Construction Permit');

INSERT INTO services (name, department, description, duration_minutes) 
SELECT 'Land Tax Payment', 'Finance', 'Pay your annual land and property taxes.', 10
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Land Tax Payment');

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  service_id INTEGER REFERENCES services(id),
  appointment_date DATE NOT NULL,
  time_slot VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  service_id INTEGER REFERENCES services(id),
  queue_number VARCHAR(10) NOT NULL,
  queue_type VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting',
  counter_number INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
