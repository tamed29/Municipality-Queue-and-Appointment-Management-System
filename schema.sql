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
-- Seed all 40+ services
INSERT INTO services (name, department, description, duration_minutes) VALUES 
-- Civil Registration
('ID Card Issuance', 'Civil Registration Office', 'ID cards, birth, marriage & death certificates', 30),
('ID Card Renewal', 'Civil Registration Office', 'Renew your existing national identity card.', 20),
('ID Replacement (Lost/Damaged)', 'Civil Registration Office', 'Replace a lost or damaged ID card.', 25),
('Birth Certificate', 'Civil Registration Office', 'Request a certified copy of a birth certificate.', 20),
('Marriage Certificate', 'Civil Registration Office', 'Apply for a marriage certificate.', 30),
('Death Certificate', 'Civil Registration Office', 'Request a death certificate.', 20),
-- Residence & Population
('Residence Certificate', 'Residence & Population Office', 'Apply for a residence certificate.', 15),
('Change of Residence Address', 'Residence & Population Office', 'Update your registered address.', 20),
('Family Registration', 'Residence & Population Office', 'Register family members.', 25),
('Household Registration Update', 'Residence & Population Office', 'Update household information.', 20),
-- Business & Trade
('New Business License', 'Business & Trade Office', 'Apply for a new municipal business license.', 45),
('Business License Renewal', 'Business & Trade Office', 'Renew your business license.', 30),
('Business License Cancellation', 'Business & Trade Office', 'Cancel an existing business license.', 20),
('Trade Registration', 'Business & Trade Office', 'Register a new trade name.', 40),
-- Land & Property
('Land Ownership Certificate', 'Land & Property Office', 'Apply for land title.', 60),
('Land Transfer Service', 'Land & Property Office', 'Transfer land ownership.', 60),
('Building Permit Application', 'Land & Property Office', 'Apply for construction permit.', 45),
('Property Registration', 'Land & Property Office', 'Register new property.', 50),
('Property Tax Service', 'Land & Property Office', 'Property tax assessment and payment.', 30),
-- Tax & Finance
('Tax Payment', 'Tax & Finance Office', 'Pay municipal taxes.', 20),
('Tax Clearance Certificate', 'Tax & Finance Office', 'Request tax clearance.', 30),
('Business Tax Registration', 'Tax & Finance Office', 'Register business for tax.', 40),
('Penalty Payment', 'Tax & Finance Office', 'Pay municipal penalties.', 15),
-- Construction & Urban Planning
('Construction Permit', 'Construction & Urban Planning Office', 'Apply for construction permit.', 60),
('Building Plan Approval', 'Construction & Urban Planning Office', 'Approve building designs.', 60),
('Renovation Permit', 'Construction & Urban Planning Office', 'Permit for house renovation.', 45),
('Infrastructure Service Request', 'Construction & Urban Planning Office', 'Request for basic infrastructure.', 30),
-- Public Services
('Garbage Collection Request', 'Public Services Office', 'Request waste management.', 15),
('Street Maintenance Complaint', 'Public Services Office', 'Report street issues.', 15),
('Water Service Registration', 'Public Services Office', 'Register for water utility.', 30),
('Electricity Service Registration', 'Public Services Office', 'Register for electricity utility.', 30);

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
