import { Hono } from 'hono';
import { buildFire } from '@fastly/hono-fastly-compute';
import { loadModule } from "@h7/compute-js-dynamic-build";

const fire = buildFire({
  codeBlocks: 'KVStore:code-blocks',
  esBuildServer: 'Backend:esbuild-server',
  apiKeys: 'SecretStore:api-keys',
});

const app = new Hono<{Bindings: typeof fire.Bindings}>();

app.post('/code-block/:name', async (c) => {

  const { name }  = c.req.param();

  const code = await c.req.text();
  await c.env.codeBlocks.put(name, code);

  return c.json({ status: 'ok', name, length: code.length });
});

app.post('/code-block/:name/build', async (c) => {

  const { name } = c.req.param();

  const headers = new Headers(c.req.raw.headers);
  const apiKey = await c.env.apiKeys.get('esbuild-server');
  if (apiKey != null) {
    headers.set('x-build-key', apiKey.plaintext());
  }

  const res = await fetch('/build', {
    backend: c.env.esBuildServer,
    method: 'POST',
    body: await c.req.arrayBuffer(),
    headers,
  });

  if (!res.ok || res.body == null) {
    return c.json({ error: "something went wrong" }, 500);
  }

  const code = await res.text();
  await c.env.codeBlocks.put(name, code);

  return c.json({ status: 'ok', name, length: code.length });
});

app.all('/code-block/:name/exec', async (c) => {

  const { name } = c.req.param();

  const codeBlock = await c.env.codeBlocks.get(name);
  if (codeBlock == null) {
    return c.json({ error: "Unknown", name }, 404);
  }

  const codeBlockText = await codeBlock.text();

  let module: any;
  try {
    module = await loadModule(codeBlockText);
  } catch (err) {
    console.error(String(err));
    return c.json({ error: "Unable to load code block", name }, 500);
  }

  const handleRequest = module.default as undefined | ((req: Request) => Promise<Response>);
  if (typeof handleRequest !== 'function') {
    return c.json({ error: "Codeblock does not export default function", name }, 500);
  }

  return handleRequest(c.req.raw);
});

fire(app);
