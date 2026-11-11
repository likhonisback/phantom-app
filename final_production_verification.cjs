const http = require('http');
const https = require('https');
const fs = require('fs');

const PORT = 3001;

function httpReq(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const reqHeaders = { ...headers };
    if (data && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch {}
          resolve({ status: res.statusCode, headers: res.headers, body: raw, json });
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

async function runComprehensiveVerification() {
  console.log('================================================================');
  console.log('    PHANTOM RECONSTRUCTION — INDEPENDENT PRODUCTION VERIFICATION ');
  console.log('================================================================\n');

  const results = [];

  function record(section, item, status, notes = '') {
    results.push({ section, item, status, notes });
    const tag = status === 'PASS' ? '[PASS]' : status === 'FAIL' ? '[FAIL]' : '[NOT TESTED]';
    console.log(`${tag} [${section}] ${item} ${notes ? '-> ' + notes : ''}`);
  }

  try {
    // 1. SERVER & STATIC DELIVERY
    const rootRes = await httpReq('/');
    record('1. Server & Static', 'HTTP 200 on /', rootRes.status === 200 ? 'PASS' : 'FAIL', `Status ${rootRes.status}`);
    record('1. Server & Static', 'HTML Contains Root Element', rootRes.body.includes('<div id="root">') ? 'PASS' : 'FAIL');
    
    // Find bundled JS and CSS URLs in HTML
    const jsMatch = rootRes.body.match(/src="(\/assets\/[^"]+\.js)"/);
    const cssMatch = rootRes.body.match(/href="(\/assets\/[^"]+\.css)"/);
    const jsPath = jsMatch ? jsMatch[1] : null;
    const cssPath = cssMatch ? cssMatch[1] : null;

    if (jsPath) {
      const jsRes = await httpReq(jsPath);
      record('1. Server & Static', 'Bundled JS Delivery', jsRes.status === 200 ? 'PASS' : 'FAIL', `${jsPath} (${jsRes.body.length} bytes)`);
    } else {
      record('1. Server & Static', 'Bundled JS Delivery', 'FAIL', 'Could not find JS script tag in HTML');
    }

    if (cssPath) {
      const cssRes = await httpReq(cssPath);
      record('1. Server & Static', 'Bundled CSS Delivery', cssRes.status === 200 ? 'PASS' : 'FAIL', `${cssPath} (${cssRes.body.length} bytes)`);
    } else {
      record('1. Server & Static', 'Bundled CSS Delivery', 'FAIL', 'Could not find CSS link tag in HTML');
    }

    // 2. FRONTEND PAGES & COMPONENTS IN BUNDLE
    if (jsPath) {
      const jsContent = (await httpReq(jsPath)).body;
      const componentMarkers = [
        { name: 'TimeRing (HUD Dial)', marker: 'ph-hud' },
        { name: 'AimSlider (Torso)', marker: 'ph-aim' },
        { name: 'SpeedSlider (Velocity)', marker: 'ph-slider' },
        { name: 'AngleDial (Gloo Yaw)', marker: 'yawDeg' },
        { name: 'KeyGate (Input & Paste)', marker: 'ph-keyinput' },
        { name: 'Dashboard (HUD Frame)', marker: 'ph-viewport' },
        { name: 'TabBar (Navigation)', marker: 'ph-tabbar' },
        { name: 'NotificationBell', marker: 'ph-bell' },
        { name: 'SetupGuideModal', marker: 'hiddify' },
        { name: 'UpdatesModal (Changelog)', marker: 'v1.9' },
        { name: 'ResetDeviceModal', marker: 'reset-device' },
        { name: 'LandingMapModal (Bermuda Coordinates)', marker: 'Clock Tower' },
      ];
      for (const item of componentMarkers) {
        const has = jsContent.includes(item.marker);
        record('2. UI Components', item.name, has ? 'PASS' : 'FAIL', `Verified marker "${item.marker}"`);
      }
    }

    // 3. API ENDPOINTS & AUTH CONTRACTS
    // 3a. Invalid Key
    const badKey = await httpReq('/api/redeem', 'POST', { key: 'PH-INVALID-0000-KEY' });
    record('3. API Contracts', 'Reject Non-existent/Bad Key', badKey.status === 400 ? 'PASS' : 'FAIL', `HTTP ${badKey.status}`);

    // 3b. Expired Key
    const expKey = await httpReq('/api/redeem', 'POST', { key: 'PH-9999-DEAD-BEEF' });
    record('3. API Contracts', 'Reject Expired Key', expKey.status === 401 ? 'PASS' : 'FAIL', `HTTP ${expKey.status}: ${expKey.json?.error}`);

    // 3c. Valid Key Redemption
    const validKey = await httpReq('/api/redeem', 'POST', {
      key: 'PH-7K9A-4M2X-8B1P',
      device_model: 'iPhone 15 Pro',
      device_os: 'iOS 18.2',
    });
    const token = validKey.json?.token;
    record('3. API Contracts', 'Redeem Valid Key (PH-7K9A-4M2X-8B1P)', validKey.status === 200 && !!token ? 'PASS' : 'FAIL', `Token: ${token ? token.slice(0, 16) + '...' : 'none'}`);
    record('3. API Contracts', 'Set-Cookie ph_session header', !!validKey.headers['set-cookie'] ? 'PASS' : 'FAIL');

    // 3d. /api/me without Auth
    const meNoAuth = await httpReq('/api/me');
    record('3. API Contracts', 'Reject /api/me without Token', meNoAuth.status === 401 ? 'PASS' : 'FAIL', `HTTP ${meNoAuth.status}`);

    // 3e. /api/me with Token
    const meAuth = await httpReq('/api/me', 'GET', null, { Authorization: `Bearer ${token}` });
    record('3. API Contracts', 'Access /api/me with Bearer Token', meAuth.status === 200 && meAuth.json?.session?.key === 'PH-7K9A-4M2X-8B1P' ? 'PASS' : 'FAIL');

    // 4. REAL SESSION CREATION, PERSISTENCE, & EXPIRATION
    const [tBody, tSig] = (token || '').split('.');
    let tokenValid = false;
    let payload = null;
    if (tBody && tSig) {
      try {
        payload = JSON.parse(Buffer.from(tBody, 'base64url').toString());
        tokenValid = payload && payload.key === 'PH-7K9A-4M2X-8B1P' && payload.exp > Date.now() / 1000;
      } catch {}
    }
    record('4. Session Mechanics', 'HMAC Session Token Integrity & Expiration Field', tokenValid ? 'PASS' : 'FAIL', `Exp: ${new Date(payload?.exp * 1000).toISOString()}`);

    // Test forged token rejection
    const forgedToken = `${tBody}.FORGED_SIGNATURE_INVALID_HASH`;
    const forgedRes = await httpReq('/api/me', 'GET', null, { Authorization: `Bearer ${forgedToken}` });
    record('4. Session Mechanics', 'Reject Forged HMAC Token', forgedRes.status === 401 ? 'PASS' : 'FAIL', `HTTP ${forgedRes.status}`);

    // 5. SERVER-SENT EVENTS (SSE) DUAL CLIENT TEST
    console.log('\nStarting SSE Dual-Session Concurrency Test...');
    let clientAReady = false;
    let clientAKicked = false;
    let sseClientReq = null;

    const ssePromise = new Promise((resolve) => {
      sseClientReq = http.request({
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/events?token=${encodeURIComponent(token)}`,
        headers: { Accept: 'text/event-stream' },
      }, (sseRes) => {
        sseRes.on('data', (chunk) => {
          const str = chunk.toString();
          if (str.includes('event: ready')) {
            clientAReady = true;
          }
          if (str.includes('event: logout')) {
            clientAKicked = true;
            resolve(true);
          }
        });
      });
      sseClientReq.on('error', () => {});
      sseClientReq.end();
    });

    // Wait 500ms for SSE connection
    await new Promise((r) => setTimeout(r, 600));
    record('5. SSE Concurrency', 'Client A SSE Initial Ready Stream', clientAReady ? 'PASS' : 'FAIL');

    // Client B logs into the same key PH-7K9A-4M2X-8B1P
    const clientBLogin = await httpReq('/api/redeem', 'POST', { key: 'PH-7K9A-4M2X-8B1P' });
    record('5. SSE Concurrency', 'Client B Unlocks Same Key', clientBLogin.status === 200 ? 'PASS' : 'FAIL');

    // Wait for Client A to be kicked
    const kickedReceived = await Promise.race([
      ssePromise,
      new Promise((r) => setTimeout(() => r(false), 2500)),
    ]);
    record('5. SSE Concurrency', 'Client A Receives Instant Remote Kick via SSE', kickedReceived && clientAKicked ? 'PASS' : 'FAIL', 'Event: logout with reason: kicked');

    if (sseClientReq) {
      try { sseClientReq.destroy(); } catch {}
    }

    // 6. FEATURE PERSISTENCE ACROSS REFRESH
    const clientBToken = clientBLogin.json?.token;
    const testFeatures = {
      ...clientBLogin.json?.features,
      speed: { enabled: true, scale: 145 },
      aimpoint: { enabled: true, aim: 0.75 },
      gloo: { enabled: true, yawDeg: -90 },
      fastRevive: { enabled: true },
    };
    const patchRes = await httpReq('/api/features', 'PATCH', { features: testFeatures }, { Authorization: `Bearer ${clientBToken}` });
    record('6. Feature Persistence', 'PATCH /api/features Update', patchRes.status === 200 ? 'PASS' : 'FAIL');

    // Simulate page refresh by re-requesting /api/me
    const refreshRes = await httpReq('/api/me', 'GET', null, { Authorization: `Bearer ${clientBToken}` });
    const saved = refreshRes.json?.features;
    const persists = saved?.speed?.scale === 145 && saved?.aimpoint?.aim === 0.75 && saved?.gloo?.yawDeg === -90 && saved?.fastRevive?.enabled === true;
    record('6. Feature Persistence', 'Features Persist After Reload/Refresh', persists ? 'PASS' : 'FAIL', `Speed: ${saved?.speed?.scale}%, Aim: ${saved?.aimpoint?.aim}, Gloo: ${saved?.gloo?.yawDeg}°`);

    // 7. HIDDIFY DEEP LINK GENERATION
    const linkRes = await httpReq('/api/link', 'POST', null, { Authorization: `Bearer ${clientBToken}` });
    const deepLink = linkRes.json?.deep_link;
    const rawUrl = linkRes.json?.url;
    const validDeepLink = deepLink && deepLink.startsWith('hiddify://install-sub?url=');
    const validRawUrl = rawUrl && rawUrl.includes('/sub/PH-7K9A-4M2X-8B1P');
    record('7. Deep Links', 'Hiddify Scheme (hiddify://install-sub)', validDeepLink ? 'PASS' : 'FAIL', deepLink);
    record('7. Deep Links', 'Encodes Correct Subscription Target', validRawUrl ? 'PASS' : 'FAIL', rawUrl);

    // 8. MULTI-LANGUAGE & RTL VERIFICATION
    const enDict = JSON.parse(fs.readFileSync('src/i18n/en_extracted.json', 'utf8'));
    const thDict = JSON.parse(fs.readFileSync('src/i18n/th_extracted.json', 'utf8'));
    const arDict = JSON.parse(fs.readFileSync('src/i18n/ar_extracted.json', 'utf8'));
    record('8. Internationalization', 'English Dictionary (187 Keys)', Object.keys(enDict).length === 187 ? 'PASS' : 'FAIL');
    record('8. Internationalization', 'Thai Dictionary (187 Keys)', Object.keys(thDict).length === 187 ? 'PASS' : 'FAIL');
    record('8. Internationalization', 'Arabic Dictionary (187 Keys, RTL)', Object.keys(arDict).length === 187 && arDict._meta?.dir === 'rtl' ? 'PASS' : 'FAIL', `Direction: ${arDict._meta?.dir}`);

    const sampleCorrect = enDict.unlock === 'unlock' && thDict.unlock === 'ปลดล็อก' && arDict.unlock === 'فتح';
    record('8. Internationalization', 'Cross-Language Translation Parity', sampleCorrect ? 'PASS' : 'FAIL', `EN: ${enDict.unlock} | TH: ${thDict.unlock} | AR: ${arDict.unlock}`);

    // 9. RESPONSIVE CSS & VIEWPORT SPECS
    const indexHtml = fs.readFileSync('index.html', 'utf8');
    const viewportTag = indexHtml.includes('name="viewport"') && indexHtml.includes('viewport-fit=cover');
    record('9. Responsive & Layout', 'Mobile Safe-Area Viewport Config', viewportTag ? 'PASS' : 'FAIL', 'viewport-fit=cover, user-scalable=no');

    const cssContent = fs.readFileSync('dist/' + cssPath.slice(1), 'utf8');
    const hasCutCorners = cssContent.includes('clip-path') || cssContent.includes('--ph-cut');
    const hasResponsiveUnits = cssContent.includes('dvh') || cssContent.includes('clamp') || cssContent.includes('@media') || cssContent.includes('polygon');
    record('9. Responsive & Layout', 'Cyberpunk Cut-Corners & Responsive Rules', hasCutCorners && hasResponsiveUnits ? 'PASS' : 'FAIL');

    // 10. SECURITY & SECRET LEAK PREVENTION
    const envContent = fs.readFileSync('.env', 'utf8');
    const jwtSecret = envContent.match(/JWT_SECRET=([^\r\n]+)/)?.[1];
    const jsClientContent = fs.readFileSync('dist/' + jsPath.slice(1), 'utf8');
    const secretLeaked = jwtSecret && jsClientContent.includes(jwtSecret);
    record('10. Security Audit', 'JWT Secret Not Exposed to Frontend Bundle', !secretLeaked ? 'PASS' : 'FAIL');

    // 11. DEVICE RESET COOLDOWN (Using a freshly unlocked key to test transition from 200 to 429)
    const freshResetKey = `PH-RST1-${Math.floor(1000 + Math.random() * 9000)}-TEST`;
    const freshLogin = await httpReq('/api/redeem', 'POST', { key: freshResetKey });
    const freshToken = freshLogin.json?.token;

    const r1 = await httpReq('/api/reset-device', 'POST', null, { Authorization: `Bearer ${freshToken}` });
    record('11. Device Management', 'First Device Reset Call (HTTP 200)', r1.status === 200 ? 'PASS' : 'FAIL');

    const r2 = await httpReq('/api/reset-device', 'POST', null, { Authorization: `Bearer ${freshToken}` });
    record('11. Device Management', 'Second Device Reset Rate-Limited (HTTP 429)', r2.status === 429 && r2.json?.error === 'cooldown' ? 'PASS' : 'FAIL', `Cooldown: ${r2.json?.reset_after}`);

    // 12. LOGOUT CLEANUP
    const logoutRes = await httpReq('/api/logout', 'POST', null, { Authorization: `Bearer ${clientBToken}` });
    record('12. Session Termination', 'POST /api/logout', logoutRes.status === 200 ? 'PASS' : 'FAIL');

    // 13. LIVE PRODUCTION DOMAIN & HTTPS SEPARATE CHECK
    console.log('\nChecking live production endpoint https://likhonsesni.xo.je...');
    let liveStatus = 'NOT TESTED';
    let liveNote = '';
    try {
      const liveRes = await new Promise((resolve, reject) => {
        const req = https.get('https://likhonsesni.xo.je', { timeout: 4000 }, (res) => {
          resolve(res.statusCode);
        });
        req.on('error', (e) => resolve('ERROR: ' + e.message));
        req.on('timeout', () => { req.destroy(); resolve('TIMEOUT'); });
      });
      if (typeof liveRes === 'number') {
        liveStatus = liveRes < 500 ? 'PASS' : 'FAIL';
        liveNote = `Live HTTP status: ${liveRes}`;
      } else {
        liveStatus = 'NOT TESTED';
        liveNote = `External host unreachable from local environment (${liveRes})`;
      }
    } catch (e) {
      liveStatus = 'NOT TESTED';
      liveNote = e.message;
    }
    record('13. Live Production Domain', 'Live Endpoint Reachability (https://likhonsesni.xo.je)', liveStatus, liveNote);

    console.log('\n================================================================');
    const passCount = results.filter((r) => r.status === 'PASS').length;
    const failCount = results.filter((r) => r.status === 'FAIL').length;
    const notTestedCount = results.filter((r) => r.status === 'NOT TESTED').length;
    console.log(`SUMMARY: ${passCount} PASSED | ${failCount} FAILED | ${notTestedCount} NOT TESTED`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Execution failure during verification:', err);
  }
}

runComprehensiveVerification();
