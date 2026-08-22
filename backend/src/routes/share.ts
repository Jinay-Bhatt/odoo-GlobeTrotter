import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';

export async function shareRoutes(server: FastifyInstance) {
  // GET /api/share/:token (Public route - NO auth required)
  server.get('/:token', async (request, reply) => {
    const { token } = request.params as { token: string };

    const trip = await prisma.trip.findUnique({
      where: { shareToken: token },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        description: true,
        coverPhoto: true,
        status: true,
        isPublic: true,
        totalBudget: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            photo: true,
          },
        },
        sections: {
          orderBy: { sequence: 'asc' },
          select: {
            id: true,
            name: true,
            sectionStart: true,
            sectionEnd: true,
            budget: true,
            sequence: true,
            activities: {
              select: {
                id: true,
                day: true,
                expense: true,
                notes: true,
                activity: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    estimatedCost: true,
                    city: {
                      select: {
                        name: true,
                        country: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!trip || !trip.isPublic) {
      return reply.status(404).send({ error: 'Not Found', message: 'Shared itinerary not found' });
    }

    return reply.send({ trip });
  });
}
