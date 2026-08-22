import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export async function adminRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate);
  server.addHook('preHandler', requireAdmin);

  // GET /api/admin/metrics & GET /api/admin/stats
  server.get('/metrics', async (request, reply) => {
    const [totalUsers, totalTrips, totalPosts, totalCities, sections] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.communityPost.count(),
      prisma.city.count(),
      prisma.section.aggregate({
        _sum: { budget: true },
      }),
    ]);

    const totalExpenses = sections._sum.budget || 0;

    return reply.send({
      metrics: {
        totalUsers,
        totalTrips,
        totalPosts,
        totalExpenses,
      },
      stats: {
        totalUsers,
        totalTrips,
        totalPosts,
        totalCities,
      },
    });
  });

  server.get('/stats', async (request, reply) => {
    const [totalUsers, totalTrips, totalPosts, totalCities, sections] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.communityPost.count(),
      prisma.city.count(),
      prisma.section.aggregate({
        _sum: { budget: true },
      }),
    ]);

    return reply.send({
      stats: {
        totalUsers,
        totalTrips,
        totalPosts,
        totalCities,
      },
      metrics: {
        totalUsers,
        totalTrips,
        totalPosts,
        totalExpenses: sections._sum.budget || 0,
      },
    });
  });

  // GET /api/admin/popular-cities
  server.get('/popular-cities', async (request, reply) => {
    const popularCities = await prisma.city.findMany({
      take: 10,
      orderBy: { popularity: 'desc' },
      select: {
        id: true,
        name: true,
        country: true,
        popularity: true,
        _count: {
          select: { activities: true },
        },
      },
    });

    return reply.send({ cities: popularCities });
  });

  // GET /api/admin/popular-activities
  server.get('/popular-activities', async (request, reply) => {
    const popularActivities = await prisma.activity.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        category: true,
        estimatedCost: true,
        city: {
          select: { name: true },
        },
        _count: {
          select: { stops: true },
        },
      },
      orderBy: {
        stops: {
          _count: 'desc',
        },
      },
    });

    return reply.send({ activities: popularActivities });
  });

  // GET /api/admin/users
  server.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany({
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
        _count: {
          select: { trips: true, posts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ users });
  });

  // PUT /api/admin/users/:id/role
  server.put('/users/:id/role', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { role } = request.body as { role: 'TRAVELER' | 'ADMIN' };

    if (!role || !['TRAVELER', 'ADMIN'].includes(role)) {
      return reply.status(400).send({ error: 'Validation Error', message: 'Valid role is required (TRAVELER | ADMIN)' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return reply.send({ user: updatedUser });
  });

  // DELETE /api/admin/users/:id
  server.delete('/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    if (id === request.user.id) {
      return reply.status(400).send({ error: 'Bad Request', message: 'Admin cannot delete their own account' });
    }

    await prisma.user.delete({ where: { id } });
    return reply.send({ message: 'User deleted successfully' });
  });

  // DELETE /api/admin/posts/:id
  server.delete('/posts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) {
      return reply.status(404).send({ error: 'Not Found', message: 'Post not found' });
    }

    await prisma.communityPost.delete({ where: { id } });
    return reply.send({ message: 'Post moderated and deleted successfully' });
  });
}

