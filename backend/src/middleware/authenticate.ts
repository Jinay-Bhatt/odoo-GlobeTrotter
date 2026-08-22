import { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/jwt';

export interface JWTPayload {
  id: string;
  email: string;
  role: 'TRAVELER' | 'ADMIN';
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or missing authentication token' });
  }
}
