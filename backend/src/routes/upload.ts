import { FastifyInstance } from 'fastify';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export async function uploadRoutes(server: FastifyInstance) {
  // Ensure uploads directory exists
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // POST /api/upload (Public or Auth)
  server.post('/', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'Bad Request', message: 'No file uploaded' });
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(data.mimetype)) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Only JPG, PNG, WEBP, and GIF images under 5MB are allowed',
      });
    }

    const extension = path.extname(data.filename) || '.jpg';
    const filename = `${uuidv4()}${extension}`;
    const filePath = path.join(uploadDir, filename);

    const buffer = await data.toBuffer();
    await fs.promises.writeFile(filePath, buffer);

    const baseUrl = process.env.API_URL || 'http://localhost:4000';
    const fileUrl = `${baseUrl}/uploads/${filename}`;
    return reply.status(201).send({
      url: fileUrl,
      filename,
      mimetype: data.mimetype,
      size: buffer.length,
    });
  });
}

