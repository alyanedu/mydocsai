// D:/npm/mydocsai/src/backend.js
// This file is the server-side entry point for backend utilities.
// It should NOT import any React components or client-side specific libraries.

import { createDocsAiProxy } from './backend-core.js';
import { createNextDocsAiProxy } from './backend-next.js';

export { createDocsAiProxy, createNextDocsAiProxy };