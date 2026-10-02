import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// The API layer is plain Node (no framework). In development it runs inside
// the Vite dev server, so `npm run dev` starts everything with one command.
// In production `npm run start` serves the built app and the same API.
// @ts-ignore – plain ESM module without type declarations
import { createApiHandler } from './server/api.mjs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const api = createApiHandler(env);
  return {
    base: '/lumetta/',
    plugins: [
      react(),
      {
        name: 'lumetta-api',
        configureServer(server) {
          server.middlewares.use(api);
        },
        configurePreviewServer(server) {
          server.middlewares.use(api);
        },
      },
    ],
    server: { host: true, port: 5173 },
  };
});
