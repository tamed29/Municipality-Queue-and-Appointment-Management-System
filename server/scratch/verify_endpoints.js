const BASE_URL = 'http://localhost:5000/api';

async function testRegister() {
  console.log("=== Testing Registration ===");
  const randomSuffix = Math.floor(Math.random() * 100000);
  const payload = {
    full_name: 'Jane Doe',
    national_id: `NAT${randomSuffix}`,
    phone: `0999${randomSuffix}`,
    email: `jane_${randomSuffix}@example.com`,
    age: 28,
    password: 'password123'
  };

  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
  return payload;
}

async function testLogin(identifier, password) {
  console.log("=== Testing Login ===");
  const payload = { identifier, password };
  
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
}

async function runTests() {
  try {
    // 1. Test registration
    const registeredUser = await testRegister();

    // 2. Test user login
    await testLogin(registeredUser.email, 'password123');

    // 3. Test admin login (with seeded credentials)
    console.log("=== Testing Admin Login ===");
    await testLogin('admin@gmail.com', 'admin');

  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTests();
