import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        watch: {
          ignored: ['**/agent_bridge.json']
        },
      },
      plugins: [
        tailwindcss(),
        react(),
        {
          name: 'agent-bridge',
          configureServer(server) {
            server.middlewares.use((req, res, next) => {
              if (req.url === '/api/agent-bridge' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                  try {
                    fs.writeFileSync(path.resolve(__dirname, 'agent_bridge.json'), body);
                    res.statusCode = 200;
                    res.end('ok');
                  } catch (e) {
                    res.statusCode = 500;
                    res.end('error');
                  }
                });
                return;
              }
              if (req.url === '/api/agent-bridge' && req.method === 'GET') {
                try {
                  const data = fs.readFileSync(path.resolve(__dirname, 'agent_bridge.json'), 'utf-8');
                  res.setHeader('Content-Type', 'application/json');
                  res.end(data);
                } catch (e) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end('{}');
                }
                return;
              }
              next();
            });
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});
