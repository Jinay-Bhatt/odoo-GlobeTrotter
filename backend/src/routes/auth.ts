import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../schemas/auth.schema.js';
import { authenticate } from '../middleware/authenticate.js';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function authRoutes(server: FastifyInstance) {
  // POST /api/auth/register
  server.post('/register', async (request, reply) => {
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { email, password, firstName, lastName, phone, city, country, photo } = parseResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return reply.status(409).send({ error: 'Conflict', message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        city,
        country,
        photo,
        role: 'TRAVELER',
      },
    });

    const token = server.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return reply.status(201).send({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        city: user.city,
        country: user.country,
        photo: user.photo,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  });

  // POST /api/auth/login
  server.post('/login', async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid email or password' });
    }

    const token = server.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        city: user.city,
        country: user.country,
        photo: user.photo,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  });

  // GET /api/auth/me (Protected)
  server.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        country: true,
        photo: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'Not Found', message: 'User profile not found' });
    }

    return reply.send({ user });
  });

  // PUT /api/auth/profile (Protected)
  server.put('/profile', { preHandler: [authenticate] }, async (request, reply) => {
    const parseResult = updateProfileSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: request.user.id },
      data: parseResult.data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        country: true,
        photo: true,
        role: true,
        updatedAt: true,
      },
    });

    return reply.send({ user: updatedUser });
  });

  // POST /api/auth/change-password (Protected)
  server.post('/change-password', { preHandler: [authenticate] }, async (request, reply) => {
    const parseResult = changePasswordSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { currentPassword, newPassword } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { id: request.user.id } });
    if (!user) {
      return reply.status(404).send({ error: 'Not Found', message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return reply.status(400).send({ error: 'Validation Error', message: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: request.user.id },
      data: { password: hashedNewPassword },
    });

    return reply.send({ message: 'Password changed successfully' });
  });
}
