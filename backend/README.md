# Backend app

## Overview

This directory contains the **esbuild backend server** that runs on Node.js. It accepts a file via multipart-formdata, infers loader via filename, and returns a bundled ES module.

Tech stack:

* **Node 20+**
* **Hono** (server framework)
* **esbuild** (bundler)

## Features

* Upload a single file via multipart
* Auto-detect loader (`.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.css`)
* Bundle using esbuild with browser‑friendly output
* Optional inline sourcemaps
* Returns final bundled JS as text (or JSON)
* Protected by authentication header forwarded by Compute@Edge

## API

### `POST /build`

**Headers:**

```
x-build-key: <secret>
```

The expected value is `process.env.BUILD_API_KEY`. This should be kept secret and used in the Compute application.

**Body (multipart):**

```
file: @yourfile.ts
```

**Response:**

* `200` — bundled JS
* `401` — invalid key
* `400` — missing/invalid file

## Local Development

```bash
cd backend
npm install
BUILD_API_KEY=dev npm run start
```

Then:

```bash
curl -X POST http://localhost:3000/build \
  -H "x-build-key: dev" \
  -F "file=@./demo.ts"
```

## Deployment

For example, on Railway, use the dashboard:

1. Create new service from GitHub subdirectory
2. Set `BUILD_API_KEY` to a secure value
3. Set working directory to `backend/`
