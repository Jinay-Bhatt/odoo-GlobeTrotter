import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';

import { authRoutes } from './routes/auth.js';
import { tripRoutes } from './routes/trips.js';
import { sectionRoutes } from './routes/sections.js';
import { cityRoutes } from './routes/cities.js';
import { activityRoutes } from './routes/activities.js';
import { communityRoutes } from './routes/community.js';
import { shareRoutes } from './routes/share.js';
import { adminRoutes } from './routes/admin.js';
import { uploadRoutes } from './routes/upload.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'globetrotter-super-secret-jwt-key-minimum-32-chars-long';

async function buildServer() {
  const server = Fastify({
    logger: true,
  });

  // Ensure uploads folder exists
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Plugins
  await server.register(cors, {
    origin: true,
    credentials: true,
  });

  await server.register(jwt, {
    secret: JWT_SECRET,
  });

  await server.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });

  await server.register(fastifyStatic, {
    root: uploadDir,
    prefix: '/uploads/',
  });

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', service: 'GlobeTrotter API', timestamp: new Date().toISOString() };
  });

  // API Route Registration
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(tripRoutes, { prefix: '/api/trips' });
  await server.register(sectionRoutes, { prefix: '/api/sections' });
  await server.register(cityRoutes, { prefix: '/api/cities' });
  await server.register(activityRoutes, { prefix: '/api/activities' });
  await server.register(communityRoutes, { prefix: '/api/community' });
  await server.register(shareRoutes, { prefix: '/api/share' });
  await server.register(adminRoutes, { prefix: '/api/admin' });
  await server.register(uploadRoutes, { prefix: '/api/upload' });

  return server;
}

async function main() {
  try {
    const server = await buildServer();
    await server.listen({ port: PORT, host: HOST });
    console.log(`🚀 GlobeTrotter Backend Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

main();
