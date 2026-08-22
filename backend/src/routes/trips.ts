import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma.js';
import { createTripSchema, updateTripSchema } from '../schemas/trip.schema.js';
import { authenticate } from '../middleware/authenticate.js';
import { TripStatus } from '@prisma/client';

function computeTripStatus(startDate: Date, endDate: Date): TripStatus {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (now < start) return 'UPCOMING';
  if (now >= start && now <= end) return 'ONGOING';
  return 'COMPLETED';
}

export async function tripRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate);

  // GET /api/trips
  server.get('/', async (request, reply) => {
    const trips = await prisma.trip.findMany({
      where: { userId: request.user.id },
      include: {
        sections: {
          orderBy: { sequence: 'asc' },
          include: {
            activities: {
              include: { activity: { include: { city: true } } },
            },
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    const updatedTrips = trips.map((trip) => {
      const computedStatus = computeTripStatus(trip.startDate, trip.endDate);
      const totalBudget = trip.sections.reduce((acc, sec) => acc + sec.budget, 0);
      return {
        ...trip,
        status: computedStatus,
        totalBudget,
      };
    });

    return reply.send({ trips: updatedTrips });
  });

  // POST /api/trips
  server.post('/', async (request, reply) => {
    const parseResult = createTripSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { name, startDate, endDate, description, coverPhoto } = parseResult.data;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const initialStatus = computeTripStatus(start, end);

    const trip = await prisma.trip.create({
      data: {
        name,
        startDate: start,
        endDate: end,
        description,
        coverPhoto,
        status: initialStatus,
        userId: request.user.id,
      },
      include: { sections: true },
    });

    return reply.status(201).send({ trip });
  });

  // GET /api/trips/:id
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { sequence: 'asc' },
          include: {
            activities: {
              include: { activity: { include: { city: true } } },
            },
          },
        },
      },
    });

    if (!trip) {
      return reply.status(404).send({ error: 'Not Found', message: 'Trip not found' });
    }

    if (trip.userId !== request.user.id && !trip.isPublic) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Access denied to private trip' });
    }

    const computedStatus = computeTripStatus(trip.startDate, trip.endDate);
    const totalBudget = trip.sections.reduce((acc, sec) => acc + sec.budget, 0);

    return reply.send({
      trip: {
        ...trip,
        status: computedStatus,
        totalBudget,
      },
    });
  });

  // PUT /api/trips/:id
  server.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = updateTripSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const existingTrip = await prisma.trip.findUnique({ where: { id } });
    if (!existingTrip) {
      return reply.status(404).send({ error: 'Not Found', message: 'Trip not found' });
    }
    if (existingTrip.userId !== request.user.id) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Cannot edit trip owned by another user' });
    }

    const updateData: Record<string, any> = { ...parseResult.data };
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const start = updateData.startDate || existingTrip.startDate;
    const end = updateData.endDate || existingTrip.endDate;
    updateData.status = computeTripStatus(start, end);

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: updateData,
      include: { sections: true },
    });

    return reply.send({ trip: updatedTrip });
  });

  // DELETE /api/trips/:id
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const existingTrip = await prisma.trip.findUnique({ where: { id } });
    if (!existingTrip) {
      return reply.status(404).send({ error: 'Not Found', message: 'Trip not found' });
    }
    if (existingTrip.userId !== request.user.id) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Cannot delete trip owned by another user' });
    }

    await prisma.trip.delete({ where: { id } });
    return reply.send({ message: 'Trip deleted successfully' });
  });

  // POST /api/trips/:id/toggle-share
  server.post('/:id/toggle-share', async (request, reply) => {
    const { id } = request.params as { id: string };

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return reply.status(404).send({ error: 'Not Found', message: 'Trip not found' });
    }
    if (trip.userId !== request.user.id) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Cannot share trip owned by another user' });
    }

    const newIsPublic = !trip.isPublic;
    const shareToken = newIsPublic ? uuidv4() : null;

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        isPublic: newIsPublic,
        shareToken,
      },
    });

    return reply.send({
      isPublic: updatedTrip.isPublic,
      shareToken: updatedTrip.shareToken,
    });
  });

  // POST /api/trips/:id/copy (Full deep copy: Trip + Sections + StopActivities)
  server.post('/:id/copy', async (request, reply) => {
    const { id } = request.params as { id: string };

    const sourceTrip = await prisma.trip.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            activities: true,
          },
        },
      },
    });

    if (!sourceTrip) {
      return reply.status(404).send({ error: 'Not Found', message: 'Trip not found' });
    }

    if (!sourceTrip.isPublic && sourceTrip.userId !== request.user.id) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Cannot copy private trip' });
    }

    const newTrip = await prisma.$transaction(async (tx) => {
      const createdTrip = await tx.trip.create({
        data: {
          name: `${sourceTrip.name} (Copy)`,
          startDate: sourceTrip.startDate,
          endDate: sourceTrip.endDate,
          description: sourceTrip.description,
          coverPhoto: sourceTrip.coverPhoto,
          status: computeTripStatus(sourceTrip.startDate, sourceTrip.endDate),
          userId: request.user.id,
          totalBudget: sourceTrip.totalBudget,
        },
      });

      for (const section of sourceTrip.sections) {
        const createdSection = await tx.section.create({
          data: {
            tripId: createdTrip.id,
            name: section.name,
            sectionStart: section.sectionStart,
            sectionEnd: section.sectionEnd,
            budget: section.budget,
            sequence: section.sequence,
          },
        });

        for (const stop of section.activities) {
          await tx.stopActivity.create({
            data: {
              sectionId: createdSection.id,
              activityId: stop.activityId,
              day: stop.day,
              expense: stop.expense,
              notes: stop.notes,
            },
          });
        }
      }

      return createdTrip;
    });

    const fullNewTrip = await prisma.trip.findUnique({
      where: { id: newTrip.id },
      include: {
        sections: {
          include: {
            activities: {
              include: { activity: { include: { city: true } } },
            },
          },
        },
      },
    });

    return reply.status(201).send({ trip: fullNewTrip });
  });
}
