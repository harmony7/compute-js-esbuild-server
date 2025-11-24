# Fastly Compute app esbuild server

## Overview

This monorepo contains a full end‑to‑end remote esbuild compilation system for Fastly Compute, designed to run with:

* **Fastly Compute** in front
* A **Node.js service** that performs actual esbuild compilation
* A **CLI** that developers run locally to send files and receive bundles

End result: you get a remote, authenticated "esbuild for Fastly Compute" service that works anywhere.

## Repository Structure

```
compute-js-esbuild-server/
├── backend/   # Node service (Hono + esbuild) that builds and returns dynamic code
├── compute/   # Fastly Compute service that sends code to the backend to run builds, saves built output, and runs saved code 
└── cli/       # CLI tool that can be used to build on the client if desired
```

## High-Level Architecture

1. **Fastly Compute** application exposes an endpoint (POST `/code-block/:name/build`) that accepts a JavaScript code snippet written for execution on Fastly Compute.
    * Adds authentication
    * Proxies the bytes of the input file to the backend service, triggering the build described in the next step
    * Saves the built output to the KV Store using the named key.
2. **Node.js** backend application receives multipart, extracts the file, runs esbuild, and returns the bundled output
    * Build process uses `@h7/compute-js-dynamic-build`
    * This is an esbuild-based build that includes:
        * `@h7/http-import-esbuild-plugin`, to bring in http- and https- based URLs for modules
        * Fastly plugin, so that `fastly:*` imports can be used
        * a loader stub so that it can be brought in using `loadModule`, also exported from `@h7/compute-js-dynamic-build`.
3. **Fastly Compute** application exposes a separate endpoint (`/code-block/:name/exec`) that accepts a name.
    * Loads the module saved prior by the above steps with the given name.
    * Uses `loadModule` to load the module
    * Calls the default export, which is expected to be a function, passing in the `Request` object and expected to return a `Response` object.
    * Returns a response based on the `Response`.
4. There is also a **CLI**that can be run locally on Node.js, which accepts an input file and performs the build process locally.
    * **Fastly Compute** application exposes an addition endpoint (POST `/code-block/:name`) that accepts the pre-built JavaScript code snippet.

## Requirements

* Node 22.18+
* npm

## License

[MIT](LICENSE)
