const http = require('http');

const PORT = 3001;

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        ...options,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(body);
          } catch {}
          resolve({ status: res.statusCode, headers: res.headers, body, json });
        });
      }
    );
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING PHANTOM INTEGRATION TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - Details:`, details);
      failed++;
    }
  }

  try {
    // 1. Empty key
    const res1 = await request({
      path: '/api/redeem',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { key: '' });
    assert(res1.status === 400, 'POST /api/redeem with empty key returns 400', res1.body);

    // 2. Invalid format key
    const res2 = await request({
      path: '/api/redeem',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { key: 'INVALID-KEY' });
    assert(res2.status === 400, 'POST /api/redeem with invalid key format returns 400', res2.body);

    // 3. Expired key
    const res3 = await request({
      path: '/api/redeem',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { key: 'PH-9999-DEAD-BEEF' });
    assert(res3.status === 401, 'POST /api/redeem with expired key returns 401 expired', res3.body);

    // 4. Valid key redemption
    const res4 = await request({
      path: '/api/redeem',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { key: 'PH-7K9A-4M2X-8B1P' });
    assert(res4.status === 200 && res4.json?.ok === true, 'POST /api/redeem with valid key returns 200', res4.body);
    const token = res4.json?.token;
    assert(!!token, 'Valid redemption returns session token', token);
    assert(res4.headers['set-cookie']?.[0]?.includes('ph_session='), 'Sets ph_session cookie', res4.headers['set-cookie']);

    // 5. GET /api/me without token
    const res5 = await request({
      path: '/api/me',
      method: 'GET',
    });
    assert(res5.status === 401, 'GET /api/me without auth returns 401', res5.body);

    // 6. GET /api/me with Bearer token
    const res6 = await request({
      path: '/api/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(res6.status === 200 && res6.json?.ok === true, 'GET /api/me with token returns 200 & session', res6.body);
    assert(res6.json?.session?.key === 'PH-7K9A-4M2X-8B1P', 'Session key matches', res6.json?.session);

    // 7. PATCH /api/features
    const newFeatures = {
      ...res6.json?.features,
      speed: { enabled: true, scale: 120 },
      aimpoint: { enabled: true, aim: 0.84 },
    };
    const res7 = await request({
      path: '/api/features',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }, { features: newFeatures });
    assert(res7.status === 200 && res7.json?.features?.speed?.scale === 120, 'PATCH /api/features updates speed to 120', res7.body);

    // 8. POST /api/link
    const res8 = await request({
      path: '/api/link',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(res8.status === 200 && res8.json?.ok === true && res8.json?.deep_link?.startsWith('hiddify://'), 'POST /api/link returns hiddify deep link', res8.body);

    // 9. POST /api/reset-device
    const res9 = await request({
      path: '/api/reset-device',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(res9.status === 200 && res9.json?.ok === true && !!res9.json?.reset_after, 'POST /api/reset-device succeeds and sets cooldown', res9.body);

    // 10. POST /api/reset-device immediate cooldown test
    const res10 = await request({
      path: '/api/reset-device',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(res10.status === 429 && res10.json?.error === 'cooldown', 'Immediate second reset returns 429 cooldown', res10.body);

    // 11. SSE /api/events test
    console.log('\nTesting SSE /api/events...');
    const ssePromise = new Promise((resolveSse) => {
      const sseReq = http.request({
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/events?token=${encodeURIComponent(token)}`,
        headers: { Accept: 'text/event-stream' },
      }, (sseRes) => {
        let buffer = '';
        sseRes.on('data', (chunk) => {
          buffer += chunk.toString();
          if (buffer.includes('event: ready')) {
            console.log('[PASS] SSE received "ready" event stream');
          }
          if (buffer.includes('event: logout')) {
            console.log('[PASS] SSE received "logout" event broadcast');
            sseRes.destroy();
            resolveSse(true);
          }
        });
      });
      sseReq.end();
    });

    // Wait a moment for SSE to establish, then trigger logout
    await new Promise((r) => setTimeout(r, 600));

    // 12. POST /api/logout
    const res12 = await request({
      path: '/api/logout',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(res12.status === 200, 'POST /api/logout returns 200', res12.body);

    // Wait for SSE logout event resolution with 3s timeout
    const sseLogoutReceived = await Promise.race([
      ssePromise,
      new Promise((r) => setTimeout(() => r(false), 3000)),
    ]);
    assert(sseLogoutReceived === true, 'SSE received broadcasted logout event upon session termination', sseLogoutReceived);

    console.log(`\n=== INTEGRATION TEST SUMMARY ===`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed === 0) {
      console.log('ALL API & INTEGRATION CONTRACTS VERIFIED 100% WORKING!\n');
    }
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
