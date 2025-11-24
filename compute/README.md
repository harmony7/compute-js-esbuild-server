# Compute App

## Overview

**Fastly Compute** service/
Its responsibilities:

## Endpoints

* POST `/code-block/:name` accepts a pre-built JavaScript code snippet written for execution on Fastly Compute.
    * Saves the code snippet to the KV Store using the named key.
* POST `/code-block/:name/build` accepts a JavaScript code snippet written for execution on Fastly Compute.
    * Add backend authorization header (`x-build-key`)
    * Proxies the bytes of the input file to the backend service at `/build`
    * Saves the returned output to the KV Store using the named key.
* `/code-block/:name/exec` (any verb)
    * Loads the module saved prior by the above steps with the given name.
    * Uses `loadModule` to load the module.
    * Calls the default export, which is expected to be a function, passing in the `Request` object and expected to return a `Response` object.
    * Returns a response based on the `Response`.

## Development

```bash
cd compute
npm install
fastly compute serve
```

## Deployment

```bash
cd compute
npm install
fastly compute publish
```

Application expects the named backend `esbuild-server` to point to a running instance of the backend server.

Application expects to be configured with the same auth key as the backend. Set this on the Secret Store named `api-keys` with the key `esbuild-server`.

Once deployed, the Compute service becomes your public endpoint.

## Example

This repo includes example snippets in the `./samples` directory.

First, start the backend server:

```bash
cd backend
BUILD_API_KEY=dev npm run start
```

In a separate terminal, start the Compute server:

```bash
cd backend
BUILD_API_KEY=dev npm run start
```

In yet another terminal, from the project root, POST an input file to the Compute service. This calls out to the backend to build the code snippet, and then saves the returned snippet to the KV Store key `marked`.

```bash
curl -F "file=@./samples/marked/index.js" "http://localhost:7676/code-block/marked/build"
```

Then, run execute this code on Compute:

```bash
curl -d "**Foo**" "http://localhost:7676/code-block/marked/exec"
```

You should see the following output:

```
<p><strong>Foo</strong></p>
```
