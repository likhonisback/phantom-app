export interface DetectedDevice {
  device_model: string;
  device_os: string;
  is_iphone: boolean;
  raw_hwid: string;
}

export function detectDevice(): DetectedDevice {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const screenW = typeof window !== 'undefined' ? window.screen.width : 393;
  const screenH = typeof window !== 'undefined' ? window.screen.height : 852;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 3;

  // 1. Detect iOS Version
  let iosVersion = 'iOS 18.2'; // default modern fallback
  const iosMatch = ua.match(/OS (\d+)[._](\d+)(?:[._](\d+))?/i);
  if (iosMatch) {
    const major = iosMatch[1];
    const minor = iosMatch[2] || '0';
    iosVersion = `iOS ${major}.${minor}`;
  }

  // 2. Check if iPhone
  const isIPhone = /iPhone/i.test(ua) || (
    /Macintosh/i.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1
  );

  // 3. WebGL GPU renderer inspection for Apple A-series / M-series GPU
  let glRenderer = '';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && 'getExtension' in gl) {
      const dbg = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (dbg) {
        glRenderer = (gl as WebGLRenderingContext).getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '';
      }
    }
  } catch {}

  // 4. Exact iPhone Model Detection based on screen points, DPR, and aspect ratio
  const maxDim = Math.max(screenW, screenH);
  const minDim = Math.min(screenW, screenH);

  let iphoneModel = 'iPhone 15 Pro';

  if (isIPhone) {
    if (minDim === 440 && maxDim === 956) {
      iphoneModel = 'iPhone 16 Pro Max';
    } else if (minDim === 402 && maxDim === 874) {
      iphoneModel = 'iPhone 16 Pro';
    } else if (minDim === 430 && maxDim === 932) {
      if (/A17/i.test(glRenderer)) {
        iphoneModel = 'iPhone 15 Pro Max';
      } else if (/A18/i.test(glRenderer)) {
        iphoneModel = 'iPhone 16 Plus';
      } else {
        iphoneModel = 'iPhone 15 Pro Max';
      }
    } else if (minDim === 393 && maxDim === 852) {
      if (/A18/i.test(glRenderer)) {
        iphoneModel = 'iPhone 16';
      } else if (/A17/i.test(glRenderer) || /Apple GPU/i.test(glRenderer)) {
        iphoneModel = 'iPhone 15 Pro';
      } else {
        iphoneModel = 'iPhone 15';
      }
    } else if (minDim === 428 && maxDim === 926) {
      iphoneModel = 'iPhone 14 Plus';
    } else if (minDim === 390 && maxDim === 844) {
      iphoneModel = 'iPhone 14';
    } else if (minDim === 375 && maxDim === 812) {
      iphoneModel = dpr >= 3 ? 'iPhone 13 mini' : 'iPhone 11 Pro';
    } else if (minDim === 414 && maxDim === 896) {
      iphoneModel = dpr >= 3 ? 'iPhone 11 Pro Max' : 'iPhone 11';
    } else if (minDim === 375 && maxDim === 667) {
      iphoneModel = 'iPhone SE (3rd Gen)';
    } else {
      iphoneModel = 'iPhone 15 Pro';
    }
  } else {
    // If running on non-iPhone browser, provide realistic smart detection
    if (/Android/i.test(ua)) {
      const modelMatch = ua.match(/Android[^;]+; ([^;)]+)\)/);
      const model = modelMatch ? modelMatch[1].trim() : 'Android Device';
      const verMatch = ua.match(/Android (\d+(\.\d+)?)/);
      const ver = verMatch ? `Android ${verMatch[1]}` : 'Android';
      return {
        device_model: model,
        device_os: ver,
        is_iphone: false,
        raw_hwid: 'hwid_android_' + minDim + 'x' + maxDim,
      };
    } else if (/Mac/i.test(ua)) {
      return {
        device_model: 'MacBook Pro',
        device_os: 'macOS 15.1',
        is_iphone: false,
        raw_hwid: 'hwid_mac_' + minDim + 'x' + maxDim,
      };
    } else if (/Windows/i.test(ua)) {
      // In iPhone development/preview mode, default to iPhone 15 Pro · iOS 18.2
      return {
        device_model: 'iPhone 15 Pro',
        device_os: 'iOS 18.2',
        is_iphone: true,
        raw_hwid: 'hwid_iphone15pro_' + minDim + 'x' + maxDim,
      };
    }
  }

  return {
    device_model: iphoneModel,
    device_os: iosVersion,
    is_iphone: isIPhone,
    raw_hwid: `hwid_${iphoneModel.toLowerCase().replace(/\s+/g, '')}_${minDim}x${maxDim}`,
  };
}
