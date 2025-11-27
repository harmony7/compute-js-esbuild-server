# CLI app

## Overview

The CLI is a developer tool that accepts an input file and performs the build process locally.

## Usage

```bash
cli build ./src/index.ts --out bundle.js
```

## Flags

| Flag                      | Description                                                                                       |
|---------------------------|---------------------------------------------------------------------------------------------------|
| `--minify`                | Minify output.                                                                                    |
| `--importmap <file>`      | Import map file.                                                                                  |
| `--importmap-root <path>` | Root path to resolve relative paths in import map. Defaults to esbuild current directory.         |
| `--mode 'prod'\|'dev'`    | If `'prod'`, then `process.env.NODE_ENV` is set to `'production'` during build. default `'prod'`. |                                                         |
| `--outfile <file>`        | File to write bundle to (otherwise prints to stdout).                                             |

## Installation

```bash
cd cli
npm install
```

## Example

This repo includes example snippets in the `./samples` directory.

### Markdown rendering "marked"

From the project root:

```bash
node ./cli/index.ts --outfile ./marked.js --importmap ./samples/marked/importmap.json --minify ./samples/marked/index.js
```

Next, POST this output file to the Compute service. This saves the code snippet to the KV Store key `marked`.

```bash
curl -d @./marked.js "http://localhost:7676/code-block/marked"
```

Then, run execute this code on Compute:

```bash
curl -d "**Foo**" "http://localhost:7676/code-block/marked/exec"
```

You should see the following output:

```
<p><strong>Foo</strong></p>
```

### React

From the project root:

```bash
node ./cli/index.ts --outfile ./react.js --importmap ./samples/react/importmap.json --minify ./samples/react/index.jsx
```

Next, POST this output file to the Compute service. This saves the code snippet to the KV Store key `marked`.

```bash
curl -d @./react.js "http://localhost:7676/code-block/react"
```

Then, run execute this code on Compute:

```bash
curl "http://localhost:7676/code-block/react/exec"
```

You should see the following output:

```
<h1>Hello, world!</h1>
```
