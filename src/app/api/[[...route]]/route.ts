// External Dependencies
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { clerkMiddleware } from '@hono/clerk-auth';

// Relative Dependencies
import spaces from './spaces';
import messages from './messages';
import users from './users';

export const runtime = 'nodejs';

const app = new Hono().basePath('/api');
app.use('*', clerkMiddleware());

const routes = app
  .route('/spaces', spaces)
  .route('/messages', messages)
  .route('/users', users);

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
