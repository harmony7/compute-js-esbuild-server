import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Context } from 'hono';
import { build as dynamicBuild, type ImportMap } from '@h7/compute-js-dynamic-build';

export async function build(c: Context): Promise<Response> {

  const form = await c.req.formData();
  const file = form.get('file');

  if (!(file instanceof File)) {
    return c.json({ error: 'file field missing' }, 400);
  }

  const filename = file.name || 'input.js';
  const code = await file.text();

  if (!filename.includes('.')) {
    return c.json({ error: 'filename missing extension' }, 400);
  }

  const minifyValue = form.get('minify');
  const minify = typeof minifyValue === 'string' ? minifyValue === 'true' : undefined;

  const modeValue = form.get('mode');
  const mode = typeof modeValue === 'string' ? modeValue : undefined;

  const tmp = randomUUID();
  const dir = join(tmpdir(), tmp);
  await mkdir(dir, { recursive: true });

  let importMap: ImportMap | undefined = undefined;
  const importmapFile = form.get('importmap');
  if (importmapFile instanceof File) {
    try {
      const importMapJson = await importmapFile.text();
      importMap = JSON.parse(importMapJson);
    } catch {
      return c.text(`Cannot parse importmap file`, 500);
    }
  }

  const entry = join(dir, filename);
  const out = join(dir, 'out.js');

  try {

    await writeFile(entry, code);
    await dynamicBuild(entry, out, {
      minify,
      prodModules: mode != null ? mode === 'prod' : undefined,
      importMap,
    });

    const js = await readFile(out, 'utf8');
    return c.text(js);

  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
