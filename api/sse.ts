import type { VercelRequest, VercelResponse } from '@vercel/node';
import { server } from '../src/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      await server.handleRequest(req as any, res as any);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  } else {
    try {
      await server.handleSSE(req as any, res as any);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }
}
