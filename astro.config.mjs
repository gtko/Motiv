import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react({
      include: ['**/components/**'],
    }),
    tailwind(),
  ],
  output: 'static',
  site: 'https://motiv.pages.dev',
  vite: {
    define: {
      'import.meta.env.PUBLIC_API_URL': JSON.stringify(
        process.env.PUBLIC_API_URL || 'https://motiv-app.gtux-prog.workers.dev/api'
      ),
    },
  },
});