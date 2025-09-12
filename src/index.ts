/*
 * GhostTs Library API
 *
 * This file exports the core functionality of GhostTs.
 * Users can import compileTs and runFile programmatically
 * if they want to embed GhostTs functionality into their own Node.js scripts.
 */

export { compileTs } from "./core/compiler";
export { runFile } from "./core/runner";

// Future export
// export { formatError } from "./core/errors";
