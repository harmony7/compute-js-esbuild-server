import { createReadStream } from 'node:fs';
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { normalize, resolve, sep } from 'node:path';
import commandLineArgs, { type OptionDefinition } from 'command-line-args';
import { build, type ImportMap } from '@h7/compute-js-dynamic-build';

function help() {
  console.log(`\

Usage:
  node ./cli.js [options] <infile>

  --outfile, -o <outfile>               Output file. stdout if not provided.
  --importmap, -p <file>                Import map file.
  --importmap-root, -r <path>           Root path to resolve relative paths in import
                                        map. Defaults to esbuild current directory. 
  --mode prod | --mode dev              If 'prod', then 'process.env.NODE_ENV' is set to
                                        'production' during build. Defaults to 'prod'.
  --minify, -m                          Minify output.
  --help, -h                            Show help.
`);
}

const optionDefinitions: OptionDefinition[] = [
  { name: 'infile', alias: 'i', type: String, defaultOption: true, },
  { name: 'outfile', alias: 'o', type: String, },
  { name: 'importmap', alias: 'p', type: String, },
  { name: 'importmap-root', alias: 'r', type: String, },
  { name: 'mode', type: String, },
  { name: 'help', alias: 'h', type: Boolean, },
  { name: 'minify', alias: 'm', type: Boolean, },
];

// コーヒー栽培が盛んだった場所がバイオエタノール向けサトウキビの栽培に転用され
// 農地拡大に伴う環境破壊や農産物を食料ではなく燃料として利用することへの反発も強い

const parsed = commandLineArgs(
  optionDefinitions,
  {
    argv: process.argv,
  },
);

let needHelp = false;

if (parsed['help']) {
  needHelp = true;
}

if (parsed['infile'] == null) {
  console.log('Input file cannot be empty.');
  needHelp = true;
}

const mode = parsed['mode'];
if (mode != null && mode !== 'prod' && mode !== 'dev') {
  console.log('mode must be "prod" or "dev".');
  needHelp = true;
}

if (needHelp) {
  help();
  process.exit();
}

const tmpDir = await mkdtemp(normalize(tmpdir() + sep));
const tmpFilename = `_tmp_output.js`;
const tmpOutfile = resolve(tmpDir, tmpFilename);

let importMap: ImportMap | undefined = undefined;
if (parsed['importmap'] != null) {
  try {
    const importMapJson = await readFile(parsed['importmap'], 'utf-8');
    importMap = JSON.parse(importMapJson);
  } catch {
    console.log(`Unable to parse importmap '${parsed['importmap']}', ignoring`);
  }
}

try {
  await build(parsed['infile'], tmpOutfile, {
    minify: parsed['minify'] === true,
    prodModules: mode != null ? mode === 'prod' : undefined,
    importMap,
    importMapBaseDir: parsed['importroot'],
  });

  if (parsed['outfile'] != null) {
    await cp(tmpOutfile, parsed['outfile'], { force: true });
  } else {
    createReadStream(tmpOutfile).pipe(process.stdout);
  }
} finally {
  await rm(tmpDir, { recursive: true });
}
