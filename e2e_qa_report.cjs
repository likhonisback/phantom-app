const http = require('http');

const PORT = 3001;

function apiCall(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (data) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(raw); } catch {}
        resolve({ status: res.statusCode, headers: res.headers, body: raw, json });
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runEndToEndReport() {
  console.log('====================================================');
  console.log('       PHANTOM 1:1 RECONSTRUCTION QA TEST SUITE      ');
  console.log('====================================================\n');

  const report = [];

  function record(id, name, result, details = '') {
    report.push({ id, name, result, details });
    const mark = result === 'PASSED' ? '[PASS]' : '[FAIL]';
    console.log(`${mark} [${id}] ${name} ${details ? '(' + details + ')' : ''}`);
  }

  // 1. Static asset serving
  const root = await apiCall('/');
  record('TEST-01', 'Page HTML Delivery', root.status === 200 && root.body.includes('PHANTOM') ? 'PASSED' : 'FAILED');

  // 2. Language dictionaries
  const fs = require('fs');
  const en = JSON.parse(fs.readFileSync('src/i18n/en_extracted.json', 'utf8'));
  const th = JSON.parse(fs.readFileSync('src/i18n/th_extracted.json', 'utf8'));
  const ar = JSON.parse(fs.readFileSync('src/i18n/ar_extracted.json', 'utf8'));
  record('TEST-02', 'i18n English Complete (187 keys)', Object.keys(en).length === 187 ? 'PASSED' : 'FAILED');
  record('TEST-03', 'i18n Thai Complete (187 keys)', Object.keys(th).length === 187 ? 'PASSED' : 'FAILED');
  record('TEST-04', 'i18n Arabic Complete (187 keys, RTL)', Object.keys(ar).length === 187 && ar._meta?.dir === 'rtl' ? 'PASSED' : 'FAILED');

  // 3. Brand configuration
  const brand = await apiCall('/api/brand');
  record('TEST-05', 'Brand Config & Social Links', 
    brand.json?.name === 'PHANTOM' &&
    brand.json?.links?.discord === 'https://discord.gg/ptQUycrU3A' &&
    brand.json?.links?.whatsapp === 'https://whatsapp.com/channel/0029Vb9VYqw9cDDejdNCuR3d'
    ? 'PASSED' : 'FAILED'
  );

  // 4. Key validation tests
  const emptyKey = await apiCall('/api/redeem', 'POST', { key: '' });
  record('TEST-06', 'Empty Key Validation Rejection', emptyKey.status === 400 ? 'PASSED' : 'FAILED');

  const invalidFormat = await apiCall('/api/redeem', 'POST', { key: 'BAD-FORMAT' });
  record('TEST-07', 'Invalid Key Format Rejection', invalidFormat.status === 400 ? 'PASSED' : 'FAILED');

  const expiredKey = await apiCall('/api/redeem', 'POST', { key: 'PH-9999-DEAD-BEEF' });
  record('TEST-08', 'Expired Key Rejection', expiredKey.status === 401 ? 'PASSED' : 'FAILED');

  // 5. Successful Unlock
  const validUnlock = await apiCall('/api/redeem', 'POST', {
    key: 'PH-DEMO-2026-PASS',
    device_model: 'iPhone 16 Pro Max',
    device_os: 'iOS 18.2',
    raw_hwid: 'hwid_e2e_test_99'
  });
  const token = validUnlock.json?.token;
  record('TEST-09', 'Valid Key Unlock & Session Provisioning', validUnlock.status === 200 && !!token ? 'PASSED' : 'FAILED');

  // 6. Authenticated Session /api/me
  const me = await apiCall('/api/me', 'GET', null, token);
  record('TEST-10', 'Session Verification (/api/me)', 
    me.status === 200 && me.json?.session?.key === 'PH-DEMO-2026-PASS' ? 'PASSED' : 'FAILED'
  );

  // 7. Feature Matrix Sync (PATCH /api/features)
  const patchFeat = await apiCall('/api/features', 'PATCH', {
    features: {
      ...me.json?.features,
      marker: { enabled: true, type: 'Dreamland' },
      aimpoint: { enabled: true, aim: 0.84 },
      speed: { enabled: true, scale: 130 },
      gloo: { enabled: true, yawDeg: 90 },
      fastRevive: { enabled: true }
    }
  }, token);
  record('TEST-11', 'Feature Matrix Realtime Sync',
    patchFeat.status === 200 &&
    patchFeat.json?.features?.speed?.scale === 130 &&
    patchFeat.json?.features?.aimpoint?.aim === 0.84
    ? 'PASSED' : 'FAILED'
  );

  // 8. Hiddify Subscription Link Generation
  const link = await apiCall('/api/link', 'POST', null, token);
  record('TEST-12', 'Hiddify Deep Link Generation', 
    link.status === 200 && link.json?.deep_link?.startsWith('hiddify://install-sub?url=') ? 'PASSED' : 'FAILED'
  );

  // 9. Hardware Binding & Device Reset
  const reset1 = await apiCall('/api/reset-device', 'POST', null, token);
  record('TEST-13', 'Device Reset Execution', reset1.status === 200 && !!reset1.json?.reset_after ? 'PASSED' : 'FAILED');

  const reset2 = await apiCall('/api/reset-device', 'POST', null, token);
  record('TEST-14', 'Device Reset 7-Day Cooldown Enforcement', reset2.status === 429 && reset2.json?.error === 'cooldown' ? 'PASSED' : 'FAILED');

  // 10. Session Logout
  const logout = await apiCall('/api/logout', 'POST', null, token);
  record('TEST-15', 'Secure Logout Execution', logout.status === 200 ? 'PASSED' : 'FAILED');

  console.log('\n====================================================');
  const allPassed = report.every(r => r.result === 'PASSED');
  console.log(`TOTAL TESTS: ${report.length} | PASSED: ${report.filter(r => r.result === 'PASSED').length} | FAILED: ${report.filter(r => r.result === 'FAILED').length}`);
  console.log(`STATUS: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  console.log('====================================================\n');
}

runEndToEndReport();
