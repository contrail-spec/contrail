/**
 * CLI store facade — re-exports from @contrail-spec/core.
 *
 * The canonical Store implementation lives in core so that the CLI and MCP
 * server share the same locking, serialisation, and ULID logic. This file
 * preserves the existing `./store.js` import path used by cli.ts.
 */
export { createStore, generateULID, type Store } from '@contrail-spec/core';
