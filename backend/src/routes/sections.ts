import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { createSectionSchema, updateSectionSchema, addStopActivitySchema } from '../schemas/section.schema.js';
import { authenticate } from '../middleware/authenticate.js';

export async function sectionRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate);

  // POST /api/sections
  server.post('/', async (request, reply) => {
    const parseResult = createSectionSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { tripId, name, sectionStart, sectionEnd, budget, sequence } = parseResult.data;

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return reply.status(404).send({ error: 'Not Found', message: 'Parent trip not found' });
    }
    if (trip.userId !== request.user.id) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Access denied to parent trip' });
    }

    const start = new Date(sectionStart);
    const end = new Date(sectionEnd);

    if (start < new Date(trip.startDate) || end > new Date(trip.endDate)) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: "Section dates must fall within the parent trip's date range",
      });
    }

    const section = await prisma.section.create({
      data: {
        tripId,
        name,
        sectionStart: start,
        sectionEnd: end,
        budget,
        sequence,
      },
      include: { activities: true },
    });

    return reply.status(201).send({ section });
  });

  // PUT /api/sections/:id
  server.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = updateSectionSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const existingSection = await prisma.section.findUnique({
      where: { id },
      include: { trip: true },
    });

    if (!existingSection) {
      return reply.status(404).send({ error: 'Not Found', message: 'Section not found' });
    }
    if (existingSection.trip.userId !== request.user.id) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Access denied' });
    }

    const updateData: Record<string, any> = { ...parseResult.data };
    if (updateData.sectionStart) updateData.sectionStart = new Date(updateData.sectionStart);
    if (updateData.sectionEnd) updateData.sectionEnd = new Date(updateData.sectionEnd);

    const start = updateData.sectionStart || existingSection.sectionStart;
    const end = updateData.sectionEnd || existingSection.sectionEnd;

    if (start < new Date(existingSection.trip.startDate) || end > new Date(existingSection.trip.endDate)) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: "Section dates must fall within the parent trip's date range",
      });
    }

    const updatedSection = await prisma.section.update({
      where: { id },
      data: updateData,
      include: { activities: true },
    });

    return reply.send({ section: updatedSection });
  });

  // DELETE /api/sections/:id
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const section = await prisma.section.findUnique({
      where: { id },
      include: { trip: true },
    });

    if (!section) {
      return reply.status(404).send({ error: 'Not Found', message: 'Section not found' });
    }
    if (section.trip.userId !== request.user.id) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Access denied' });
    }

    await prisma.section.delete({ where: { id } });
    return reply.send({ message: 'Section deleted successfully' });
  });

  // POST /api/sections/:id/activities (Add StopActivity to Section)
  server.post('/:id/activities', async (request, reply) => {
    const { id: sectionId } = request.params as { id: string };
    const parseResult = addStopActivitySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { trip: true },
    });

    if (!section) {
      return reply.status(404).send({ error: 'Not Found', message: 'Section not found' });
    }
    if (section.trip.userId !== request.user.id) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Access denied' });
    }

    const { activityId, day, expense, notes } = parseResult.data;

    const stopActivity = await prisma.stopActivity.create({
      data: {
        sectionId,
        activityId,
        day,
        expense,
        notes,
      },
      include: {
        activity: {
          include: { city: true },
        },
      },
    });

    return reply.status(201).send({ stopActivity });
  });

  // DELETE /api/sections/:id/activities/:stopId
  server.delete('/:id/activities/:stopId', async (request, reply) => {
    const { id: sectionId, stopId } = request.params as { id: string; stopId: string };

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { trip: true },
    });

    if (!section) {
      return reply.status(404).send({ error: 'Not Found', message: 'Section not found' });
    }
    if (section.trip.userId !== request.user.id) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Access denied' });
    }

    await prisma.stopActivity.delete({ where: { id: stopId } });
    return reply.send({ message: 'Activity stop removed successfully' });
  });
}
