import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { activityQuerySchema } from '../schemas/city.schema.js';

export async function activityRoutes(server: FastifyInstance) {
  // GET /api/activities
  server.get('/', async (request, reply) => {
    const parseResult = activityQuerySchema.safeParse(request.query);
    const { cityId, category, search } = parseResult.success ? parseResult.data : {};

    const where: any = {};
    if (cityId) where.cityId = cityId;
    if (category) where.category = category;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const activities = await prisma.activity.findMany({
      where,
      include: {
        city: true,
      },
      orderBy: { name: 'asc' },
    });

    return reply.send({ activities });
  });
}
