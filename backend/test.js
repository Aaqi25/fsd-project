const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = `http://127.0.0.1:${process.env.PORT || 5000}`;

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    if (body) {
      reqOptions.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, data: parsed, headers: res.headers });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting SmartHome Backend Integration Test Suite ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    console.log('1. Testing Health Endpoint:');
    const health = await request('/api/health');
    assert(health.status === 200, `Health endpoint returned status 200 (got ${health.status})`);
    assert(health.data.status === 'ok', `Health status is "ok" (got ${health.data.status})`);
    assert(health.data.database === 'connected', `Database state is connected (got ${health.data.database})`);

    // 2. Unauthorized request
    console.log('\n2. Testing Unauthorized Access Protection:');
    const unauth = await request('/api/devices');
    assert(unauth.status === 401, `GET /api/devices without token rejected with 401 (got ${unauth.status})`);
    assert(unauth.data.success === false, 'Response has success: false');

    // 3. Bad token request
    console.log('\n3. Testing Malformed Token Rejection:');
    const badToken = await request('/api/devices', {
      headers: { Authorization: 'Bearer this_is_an_invalid_token' },
    });
    assert(badToken.status === 401, `GET /api/devices with bad token rejected with 401 (got ${badToken.status})`);

    // 4. Registration
    console.log('\n4. Testing User Registration:');
    const testEmail = `testuser_${Date.now()}@smarthome.io`;
    const regRes = await request('/api/auth/register', { method: 'POST' }, {
      name: 'Test Resident',
      username: `testuser_${Date.now()}`,
      email: testEmail,
      password: 'mypassword123',
    });
    assert(regRes.status === 201, `Registration returned status 201 (got ${regRes.status})`);
    assert(!!regRes.data.token, 'Registration returned a valid JWT token');
    assert(regRes.data.user.email === testEmail, `Registered user email matches: ${testEmail}`);
    assert(!regRes.data.user.password, 'Password hash is NOT leaked in registration response');

    // 5. Registration duplicate rejection
    console.log('\n5. Testing Duplicate Registration Prevention:');
    const dupRes = await request('/api/auth/register', { method: 'POST' }, {
      name: 'Duplicate Resident',
      email: testEmail,
      password: 'mypassword123',
    });
    assert(dupRes.status === 400, `Duplicate registration rejected with 400 (got ${dupRes.status})`);

    // 6. User Login
    console.log('\n6. Testing User Login:');
    const loginRes = await request('/api/auth/login', { method: 'POST' }, {
      email: testEmail,
      password: 'mypassword123',
    });
    assert(loginRes.status === 200, `Login returned status 200 (got ${loginRes.status})`);
    assert(!!loginRes.data.token, 'Login returned a valid JWT token');
    assert(!loginRes.data.user.password, 'Password hash is NOT leaked in login response');

    const authToken = loginRes.data.token;

    // 7. Login with wrong password
    console.log('\n7. Testing Login With Wrong Password:');
    const wrongPassRes = await request('/api/auth/login', { method: 'POST' }, {
      email: testEmail,
      password: 'wrong_password_xyz',
    });
    assert(wrongPassRes.status === 400, `Invalid password rejected with 400 (got ${wrongPassRes.status})`);

    // 8. Seed user login (alex@smarthome.io)
    console.log('\n8. Testing Default Seed Demo Account Login:');
    const seedLogin = await request('/api/auth/login', { method: 'POST' }, {
      email: 'alex@smarthome.io',
      password: 'password123',
    });
    assert(seedLogin.status === 200, `Demo login for alex@smarthome.io returned 200 (got ${seedLogin.status})`);
    assert(seedLogin.data.user.role === 'owner', `alex@smarthome.io has owner role (got ${seedLogin.data.user.role})`);

    // 9. Fetch devices with valid JWT
    console.log('\n9. Testing Authenticated Device Listing:');
    const devicesRes = await request('/api/devices', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert(devicesRes.status === 200, `GET /api/devices returned status 200 (got ${devicesRes.status})`);
    assert(Array.isArray(devicesRes.data), 'GET /api/devices returned an array');
    assert(devicesRes.data.length >= 15, `Found ${devicesRes.data.length} seeded devices in MongoDB (expected >= 15)`);

    const sampleDevice = devicesRes.data.find((d) => d._id === 'dev_001') || devicesRes.data[0];
    const initialStatus = sampleDevice.status;
    const targetStatus = initialStatus === 'active' ? 'inactive' : 'active';

    // 10. Toggle device state
    console.log(`\n10. Testing Device Toggle Persistence (${sampleDevice._id} from ${initialStatus} -> ${targetStatus}):`);
    const toggleRes = await request(`/api/devices/${sampleDevice._id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}` },
    }, { status: targetStatus });
    assert(toggleRes.status === 200, `PATCH /api/devices/${sampleDevice._id}/toggle returned 200 (got ${toggleRes.status})`);
    assert(toggleRes.data.status === targetStatus, `Device status successfully updated to ${targetStatus}`);

    // 11. Verify MongoDB persistence on re-fetch
    console.log('\n11. Testing Persistence in MongoDB after State Update:');
    const verifyRes = await request(`/api/devices/${sampleDevice._id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert(verifyRes.status === 200, `GET /api/devices/${sampleDevice._id} returned 200`);
    assert(verifyRes.data.status === targetStatus, `Persisted status in MongoDB matches ${targetStatus} after re-fetch`);

    console.log('\n======================================================');
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

runTests();
