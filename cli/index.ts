import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { normalize, resolve, sep } from 'node:path';
import commandLineArgs, { type OptionDefinition } from 'command-line-args';
import { build } from '@h7/compute-js-dynamic-build';
import { createReadStream } from "node:fs";

function help() {
  console.log(`\

Usage:
  node ./cli.js [options] <infile>

  --outfile, -o <outfile>               Output file. stdout if not provided.
  --minify, -m                          Minify output.
  --help, -h                            Show help.
`);
}

const optionDefinitions: OptionDefinition[] = [
  { name: 'infile', alias: 'i', type: String, defaultOption: true, },
  { name: 'outfile', alias: 'o', type: String, },
  { name: 'help', alias: 'h', type: Boolean, },
  { name: 'minify', alias: 'm', type: Boolean, },
];

const parsed = commandLineArgs(
  optionDefinitions,
  {
    argv: process.argv,
  },
);

if (parsed['help'] || parsed['infile'] == null) {
  help();
  process.exit();
}

const tmpDir = await mkdtemp(normalize(tmpdir() + sep));
const tmpFilename = `_tmp_output.js`;
const tmpOutfile = resolve(tmpDir, tmpFilename);

try {
  await build(parsed['infile'], tmpOutfile, { minify: parsed['minify'] === true });

  if (parsed['outfile'] != null) {
    await cp(tmpOutfile, parsed['outfile'], { force: true });
  } else {
    createReadStream(tmpOutfile).pipe(process.stdout);
  }
} finally {
  await rm(tmpDir, { recursive: true });
}
