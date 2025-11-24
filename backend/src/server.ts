import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';

import { build } from './build.ts';

const app = new Hono();

// dumb-simple header auth
const requireKey = createMiddleware(async (c, next) => {
  const key = c.req.header("x-build-key");
  if (!key || key !== process.env.BUILD_API_KEY) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});

app.post('/build', requireKey, build);

const port = Number(process.env.PORT || 3000);
console.log("listening on", port);
serve({
  port,
  fetch: app.fetch,
});
