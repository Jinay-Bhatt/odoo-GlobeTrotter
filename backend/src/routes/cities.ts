import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { cityQuerySchema } from '../schemas/city.schema.js';

export async function cityRoutes(server: FastifyInstance) {
  // GET /api/cities
  server.get('/', async (request, reply) => {
    const parseResult = cityQuerySchema.safeParse(request.query);
    const { search, popular } = parseResult.success ? parseResult.data : {};

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const orderBy: any = popular === 'true' ? { popularity: 'desc' } : { name: 'asc' };

    const cities = await prisma.city.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: { activities: true },
        },
      },
    });

    return reply.send({ cities });
  });

  // GET /api/cities/:id
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        activities: true,
      },
    });

    if (!city) {
      return reply.status(404).send({ error: 'Not Found', message: 'City not found' });
    }

    return reply.send({ city });
  });
}
