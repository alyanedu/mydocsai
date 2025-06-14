// D:/npm/mydocsai/src/backend-core.js
// This contains the core Node.js http compatible proxy logic.
// It does NOT depend on React or client-side libraries.

import { IncomingMessage, ServerResponse } from 'http';
import { Readable } from 'stream'; // Import Readable for request body processing
import { finished } from 'stream/promises'; // For waiting on stream to finish
import fetch from 'node-fetch'; // Using node-fetch for server-side requests

/**
 * Creates a backend proxy handler for the DocsAI Chatbot API, compatible with Node.js http objects (e.g., Express.js).
 * @param options Configuration options including your DocsAI API key.
 * @returns An async function that handles the API request.
 */
export const createDocsAiProxy = ({ docsAiApiKey, docsAiApiBaseUrl = 'https://api.mydocsai.tech/sendmessage' }) => {
  // SDK-side API key validation for core proxy
  if (!docsAiApiKey) {
    console.error("DocsAI SDK Error (backend-core): 'docsAiApiKey' is required but was not provided to createDocsAiProxy.");
    return async (req, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Server configuration error: DocsAI API key not found in SDK setup.' }));
    };
  }

  return async (req, res) => {
    console.log(`SDK (backend-core): Incoming request. Method: ${req.method}, URL: ${req.url}`);
    try {
      // 1. Read the request body
      let requestBodyBuffer = [];
      for await (const chunk of req) {
        requestBodyBuffer.push(chunk);
      }
      const requestBody = Buffer.concat(requestBodyBuffer);
      const requestBodyString = requestBody.toString('utf8');
      console.log(`SDK (backend-core): Request body received (length: ${requestBody.length})`);

      // 2. Prepare headers for the upstream API call
      const headers = {
        'Content-Type': req.headers['content-type'] || 'application/json',
        // MODIFICATION START: Passing API key as raw value in Authorization header
        'Authorization': docsAiApiKey,
        // MODIFICATION END
        // Forward other relevant headers from the client
        ...req.headers,
      };

      // Remove headers that should not be forwarded or can cause issues
      delete headers['host'];
      delete headers['connection'];
      delete headers['content-length']; // Node-fetch will set this automatically
      delete headers['transfer-encoding']; // Node-fetch handles this

      // Check if the client expects a streaming response
      const clientAcceptsEventStream = req.headers['accept']?.includes('text/event-stream');
      if (clientAcceptsEventStream) {
        headers['Accept'] = 'text/event-stream'; // Ensure upstream API knows we want streaming
        console.log("SDK (backend-core): Client expects event-stream. Setting Accept header.");
      }

      console.log("SDK (backend-core): Forwarding request to DocsAI API:", docsAiApiBaseUrl);
      console.log("SDK (backend-core): Forwarding headers (partial):", {
        'Content-Type': headers['content-type'],
        'Authorization': headers['authorization'] ? 'API Key ...' : 'None', // Mask key for logging
        'Accept': headers['accept'],
      });


      // 3. Make the request to the DocsAI API
      const docsAiResponse = await fetch(docsAiApiBaseUrl, {
        method: req.method,
        headers: headers,
        body: requestBodyString, // Send the raw string body
        // For streaming responses from the upstream, we need to ensure node-fetch handles it.
        // By default, node-fetch's body is a ReadableStream.
      });

      console.log(`SDK (backend-core): DocsAI API responded with status: ${docsAiResponse.status}`);
      console.log("SDK (backend-core): DocsAI API response headers (partial):", {
        'Content-Type': docsAiResponse.headers.get('content-type'),
        'Transfer-Encoding': docsAiResponse.headers.get('transfer-encoding'),
      });

      // 4. Forward the response status and headers to the client
      res.writeHead(docsAiResponse.status, Object.fromEntries(docsAiResponse.headers.entries()));

      // 5. Handle streaming or non-streaming response
      const docsAiContentType = docsAiResponse.headers.get('content-type');
      if (docsAiContentType && docsAiContentType.includes('text/event-stream')) {
        console.log("SDK (backend-core): Streaming response from DocsAI API. Piping to client.");
        // Pipe the stream directly to the client response
        docsAiResponse.body.pipe(res);
        await finished(docsAiResponse.body); // Wait for the stream to finish
        console.log("SDK (backend-core): Streaming finished.");
      } else {
        console.log("SDK (backend-core): Non-streaming response from DocsAI API. Sending as JSON/text.");
        const data = await docsAiResponse.buffer(); // Get entire response as buffer
        res.end(data); // Send the buffer
      }

    } catch (error) {
      console.error("SDK (backend-core): Error during proxy operation:", error);
      // Ensure response is sent even if an error occurs
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify({ message: 'Internal proxy error', error: error.message }));
    }
  };
};