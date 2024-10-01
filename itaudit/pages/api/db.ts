import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../lib';

export default async function dbHandler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route called');
  try {
    await handler(req, res);
  } catch (error: unknown) {
    console.error('Error in API route:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
  }
}