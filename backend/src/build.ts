import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Context } from 'hono';
import { build as dynamicBuild } from '@h7/compute-js-dynamic-build';

export async function build(c: Context): Promise<Response> {

  const form = await c.req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return c.json({ error: "file field missing" }, 400);
  }

  const filename = file.name || "input.js";
  const code = await file.text();

  if (!filename.includes(".")) {
    return c.json({ error: "filename missing extension" }, 400);
  }

  const minify = c.req.header('x-build-minify') === 'true';

  const tmp = randomUUID();
  const dir = join(tmpdir(), tmp);
  await mkdir(dir, { recursive: true });

  const entry = join(dir, filename);
  const out = join(dir, "out.js");

  try {

    await writeFile(entry, code);
    await dynamicBuild(entry, out, { minify });

    const js = await readFile(out, "utf8");
    return c.text(js);

  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
