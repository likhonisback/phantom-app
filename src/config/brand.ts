import { BrandConfig } from '../types';

export const BRAND: BrandConfig = {
  slug: import.meta.env.VITE_BRAND_SLUG || 'phantom',
  name: import.meta.env.VITE_BRAND_NAME || 'PHANTOM',
  prefix: import.meta.env.VITE_KEY_PREFIX || 'PH',
  logoImg: null,
  markType: 'mark',
  links: {
    telegram: '',
    discord: import.meta.env.VITE_DISCORD_URL || 'https://discord.gg/ptQUycrU3A',
    whatsapp: import.meta.env.VITE_WHATSAPP_URL || 'https://whatsapp.com/channel/0029Vb9VYqw9cDDejdNCuR3d',
  },
};

export const DOMAIN_URL = import.meta.env.VITE_APP_URL || 'https://likhonsesni.xo.je';
export const MARKER_TYPES = ['Phantom', 'Dreamland', 'Ice Wall', 'Moco', 'Clu', 'Shirou', 'Iris', 'Dreki'] as const;
