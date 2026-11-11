# PHANTOM — Complete Website Recreation

A pixel-perfect, high-performance cyberpunk web dashboard recreation of the publicly visible **[PHANTOM](https://likhonsesni.xo.je)** application.

Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Node.js/Express** with an authentic futuristic aesthetic, chamfered cut corners, live HUD session timer, scanlines effect, multi-language internationalization (English, Thai, and Arabic with RTL), and real API authentication.

---

## 📸 Key Features

### 1. Access Page (KeyGate)
- **Signature Phantom Branding**: Authentic vector mask/mark with neon drop-shadow glow and wordmark.
- **Minimal Futuristic Tagline**: *"no account. no password. just your key."*
- **Formatted Key Input**: Enforces `PH-XXXX-XXXX-XXXX` format, handles paste from clipboard with 1 click, and triggers shake animations on invalid inputs.
- **Language Switcher**: Seamless language toggle supporting **English (EN)**, **Thai (ไทย)**, and **Arabic (عربي)** with full right-to-left (RTL) text mirroring.
- **State Notifications**: Incomplete key warnings, expired notifications, maintenance mode, and error banners.
- **CRT Scanlines Overlay**: Subtle retro-futuristic animated scanline effect.

### 2. Live Session Dashboard
- **HUD Ring & Countdown Timer**: Circular SVG progress dial with bracketed HUD corners, calculating real-time remaining access time (`30d 12h`, `14h 22m`, `12m 45s`).
- **Subscription Tunnel Integration**: "Add Subscription" glowing action button opening Hiddify deep link (`hiddify://install-sub?url=...`).
- **One-Tap Key Chip**: Monospace access key display with instant clipboard copy.
- **Hardware Binding & Smart Device Detection**: Automatically detects the user's exact iPhone model (e.g. *iPhone 16 Pro Max*, *iPhone 16 Pro*, *iPhone 15 Pro*, *iPhone 15*, etc.) and iOS version via screen resolution, device pixel ratio, and WebGL GPU inspection. Also supports 7-day cooldown device reset.
- **Community Channels**: Integrated Discord (`https://discord.gg/ptQUycrU3A`) and WhatsApp Channel (`https://whatsapp.com/channel/0029Vb9VYqw9cDDejdNCuR3d`) + direct WhatsApp (`01319885254`).

### 3. Cheat & Feature Tuning Matrix
- **Marker**: Toggle enemy ESP markers with custom shape styles (*Phantom*, *Dreamland*, *Ice Wall*, *Moco*, *Clu*, *Shirou*, *Iris*, *Dreki*).
- **Aimpoint (Aim Height)**: Interactive anatomical torso silhouette slider with reticle target line and danger thresholds (*Chest*, *Upper Chest*, *Shoulders*, *Neck*, *Head*).
- **Speed Boost**: Smooth speed multiplier slider from `1.0x` to `1.5x` with anti-detection caution warning above `1.4x`.
- **Aim Lag**: Sub-switches for *When Firing* and *When Scoping*.
- **Gloo Wall Rotation**: Interactive dial for 360-degree wall angles (`-180°` to `+180°`).
- **Fast Revive**: 0.1-second knockdown recovery toggle.
- **Fast Landing (Map Modal)**: Interactive Bermuda map with clickable coordinate snapping points (*Clock Tower*, *Peak*, *Factory*, *Pochinok*, etc.).

### 4. Manage & Updates
- **Update Notes Modal**: Full changelog archive (`v1.9`, `v1.8`, `v1.7`, etc.).
- **Setup Guide**: Step-by-step walkthrough for iOS (App Store) and Android (Google Play) for Hiddify.
- **Community Links**: Quick access to Discord, WhatsApp, and Telegram.
- **Secure Logout**: Clears session token and returns to key gate.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Styling**: Cyberpunk geometric design system, chamfered cut corners (`clip-path: polygon`), conic gradient button border animations, Tektur and JetBrains Mono typography
- **Backend**: Node.js, Express, TypeScript (`tsx`)
- **Security**: HMAC-SHA256 session tokens, hardware binding locks, rate-limited cooldowns
- **Internationalization (i18n)**: English, Thai, Arabic (RTL)

---

## 📂 Project Structure

```
iphone project/
├── .env                     # Environment variables & secrets
├── .env.example             # Example environment template
├── index.html               # Main HTML entry with Google Web Fonts
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration & API proxy
├── tailwind.config.js       # Tailwind CSS theme extension
├── postcss.config.js        # PostCSS configuration
│
├── server/                  # Node.js Express Backend
│   ├── index.ts             # Server entry point (Port 3001)
│   ├── keys.ts              # Key database & auto-provisioning
│   ├── auth.ts              # HMAC token generator & verifier
│   └── routes.ts            # API endpoints (/unlock, /me, /features, /reset-device)
│
└── src/                     # React Frontend
    ├── main.tsx             # App bootstrap
    ├── App.tsx              # Main state machine (Auth <-> Dashboard)
    ├── index.css            # Authentic cyberpunk styles & cut corners
    ├── config/
    │   └── brand.ts         # Brand configuration (Name, Logo, Colors, Links)
    ├── i18n/                # Internationalization
    │   ├── en.ts            # English translations
    │   ├── th.ts            # Thai translations
    │   ├── ar.ts            # Arabic translations (RTL)
    │   └── LangContext.tsx  # React Context for language switching
    ├── types/
    │   └── index.ts         # TypeScript definitions
    ├── services/
    │   └── api.ts           # API client service
    └── components/
        ├── ui/              # Reusable UI primitives
        │   ├── BrandMark.tsx# Cyberpunk mask & wordmark
        │   ├── Button.tsx   # Chamfered buttons (primary, danger, etc.)
        │   ├── Icon.tsx     # Vector icon system
        │   ├── Spinner.tsx  # Rotating loading spinner
        │   ├── StatusPill.tsx# Status indicator
        │   ├── Switch.tsx   # Toggle switches
        │   ├── Tag.tsx      # Tone badges (new, paused, beta, risk, hot)
        │   ├── ChipGroup.tsx# Option pills
        │   └── Notice.tsx   # Alert boxes
        ├── auth/
        │   ├── KeyGate.tsx  # Unlock login view
        │   └── KeyInput.tsx # Monospace input with paste & shake
        ├── dashboard/
        │   ├── Dashboard.tsx# Main tabbed view
        │   ├── Header.tsx   # Top navigation bar
        │   ├── TabBar.tsx   # Bottom navigation bar
        │   ├── HomeTab.tsx  # Timer, subscription link & status
        │   ├── FeaturesTab.tsx# Sliders, aim height, speed & toggles
        │   ├── ManageTab.tsx# Device lock, reset, guides & logout
        │   ├── TimeRing.tsx # HUD countdown ring
        │   ├── AimSlider.tsx# Anatomical aim height slider
        │   ├── SpeedSlider.tsx# Speed boost slider
        │   ├── AngleDial.tsx# Gloo wall rotation dial
        │   └── LandingMapModal.tsx# Map waypoint picker
        └── modals/
            ├── UpdatesModal.tsx   # Changelog modal
            ├── SetupGuideModal.tsx # Hiddify setup steps
            ├── ResetDeviceModal.tsx# Device reset confirmation
            └── LanguageMenu.tsx   # Language dropdown
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 20 LTS)
- npm or pnpm or bun

### 1. Installation
Clone or navigate to the project directory:
```bash
npm install
```

### 2. Environment Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Available environment variables:
```env
PORT=3001
HTTPS_PORT=443
VITE_API_URL=https://likhonsesni.xo.je
VITE_APP_URL=https://likhonsesni.xo.je
JWT_SECRET=your_jwt_secret_change_in_production
COOKIE_SECRET=your_cookie_secret_change_in_production

# Brand Customization
VITE_BRAND_NAME=PHANTOM
VITE_BRAND_SLUG=phantom
VITE_KEY_PREFIX=PH
VITE_ACCENT_COLOR=#ededed
VITE_DISCORD_URL=https://discord.gg/ptQUycrU3A
VITE_WHATSAPP_URL=https://whatsapp.com/channel/0029Vb9VYqw9cDDejdNCuR3d
VITE_WHATSAPP_PHONE=01319885254
VITE_TELEGRAM_URL=
```

### 3. Running in Development
Run both the frontend Vite dev server and backend Express server concurrently:
```bash
npm run dev
```
- Domain: `https://likhonsesni.xo.je` (Proxied to local dev port 3000/3001)

### 4. Running in Production
Build the optimized frontend assets and start the standalone production server:
```bash
npm run build
npm run start
```
The application will serve at `https://likhonsesni.xo.je`.

### 5. Local Domain Testing (HTTPS)

The local domain `likhonsesni.xo.je` resolves to `127.0.0.1` via the Windows hosts file:

```
# C:\Windows\System32\drivers\etc\hosts
127.0.0.1  likhonsesni.xo.je
```

A self-signed TLS certificate for this domain is pre-generated at `deploy/phantom.pfx` (password: `phantom2026`).  
The server automatically binds to port 443 (HTTPS) when the PFX file exists. Run `npm start` with administrator privileges to allow binding to port 443.

> **Note**: Browsers will show a security warning for the self-signed certificate. Click "Advanced → Proceed" to continue during local testing.

---

## 🔑 Demo Access Keys

For testing, several sample keys with different states are pre-configured in the database:

| Access Key | Status | Description |
|---|---|---|
| `PH-7K9A-4M2X-8B1P` | **Active** (29 days left) | Full access, online status, bound to iPhone 15 Pro |
| `PH-DEMO-2026-PASS` | **Active** (14 days left) | Full access, online status, bound to iPhone 16 Pro Max |
| `PH-9999-DEAD-BEEF` | **Expired** | Displays expired notice and renewal instruction |
| `PH-PAUS-ED00-0001` | **Paused** | Displays maintenance notice, frozen time |
| `PH-NEWW-WAIT-ACT1` | **Unactivated** | Not activated yet, seller contact hint |
| *Any `PH-XXXX-XXXX-XXXX`* | **Auto-Provisioned** | Any valid 16-character key automatically grants 30 days active access for quick testing |

---

## 🎨 Brand Customization

You can fully customize the identity and styling of the website:
1. Open `.env` and change `VITE_BRAND_NAME`, `VITE_KEY_PREFIX`, and social links.
2. In `src/config/brand.ts`, customize the `markType`:
   - `'mark'`: Cyberpunk geometric phantom mask.
   - `'wordmark'`: Bold geometric text with neon square dot.
   - `'image'`: Custom logo image (provide URL in `logoImg`).
3. In `src/index.css`, customize `--ph-accent` to any brand color (e.g., `#dc2626` for crimson, `#38e0f8` for cyan, `#2d4ded` for cobalt).

---

## 🔒 Security Architecture

- **No Secrets Exposed**: API keys, JWT secrets, and administrative credentials remain strictly server-side.
- **HMAC Signatures**: Client sessions use cryptographically verified Bearer tokens.
- **Hardware Lock Binding**: Prevents account sharing by binding access keys to device HWID.
- **Rate-Limited Cooldown**: Enforces strict 7-day cooldown on device transfer resets.
- **Input Sanitization**: Client and server validation prevent malformed inputs or script injections.
