# CLI app

## Overview

The CLI is a developer tool that accepts an input file and performs the build process locally.

## Usage

```bash
cli build ./src/index.ts --out bundle.js
```

## Flags

| Flag               | Description                                          |
|--------------------|------------------------------------------------------|
| `--minify`         | Minify output                                        |
| `--outfile <file>` | File to write bundle to (otherwise prints to stdout) |

## Installation

```bash
cd cli
npm install
```

## Example

This repo includes example snippets in the `./samples` directory.

From the project root:

```bash
node ./cli/index.ts --outfile ./output.js --minify ./samples/marked/index.js
```

Next, POST this output file to the Compute service. This saves the code snippet to the KV Store key `marked`.

```bash
curl -d @./output.js "http://localhost:7676/code-block/marked"
```

Then, run execute this code on Compute:

```bash
curl -d "**Foo**" "http://localhost:7676/code-block/marked/exec"
```

You should see the following output:

```
<p><strong>Foo</strong></p>
```
