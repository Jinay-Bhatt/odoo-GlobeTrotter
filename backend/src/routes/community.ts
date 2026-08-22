import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { createPostSchema, communityQuerySchema } from '../schemas/community.schema.js';
import { authenticate } from '../middleware/authenticate.js';

export async function communityRoutes(server: FastifyInstance) {
  // GET /api/community (Public/Auth)
  server.get('/', async (request, reply) => {
    const parseResult = communityQuerySchema.safeParse(request.query);
    const { page, limit } = parseResult.success ? parseResult.data : { page: 1, limit: 20 };

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, photo: true },
          },
          trip: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.communityPost.count(),
    ]);

    return reply.send({
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });

  // POST /api/community (Protected)
  server.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const parseResult = createPostSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { content, image, tripId } = parseResult.data;

    if (tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      if (!trip) {
        return reply.status(404).send({ error: 'Not Found', message: 'Associated trip not found' });
      }
    }

    const post = await prisma.communityPost.create({
      data: {
        content,
        image,
        tripId,
        userId: request.user.id,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, photo: true },
        },
        trip: {
          select: { id: true, name: true },
        },
      },
    });

    return reply.status(201).send({ post });
  });

  // DELETE /api/community/:id (Protected)
  server.delete('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) {
      return reply.status(404).send({ error: 'Not Found', message: 'Community post not found' });
    }

    if (post.userId !== request.user.id && request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden', message: 'Cannot delete another user post' });
    }

    await prisma.communityPost.delete({ where: { id } });
    return reply.send({ message: 'Community post deleted successfully' });
  });
}
