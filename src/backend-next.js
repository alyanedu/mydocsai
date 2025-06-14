// D:/npm/mydocsai/src/backend-next.js
import { createDocsAiProxy } from './backend-core.js';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { Writable } from 'stream';

/**
 * Creates a Next.js App Router compatible proxy handler for the DocsAI Chatbot API.
 * This utility adapts Next.js's NextRequest/NextResponse to Node.js http.IncomingMessage/ServerResponse
 * for compatibility with the core createDocsAiProxy.
 *
 * @param {object} options - Configuration options.
 * @param {string | undefined} options.docsAiApiKey - Your DocsAI API key.
 * @param {string} [options.docsAiApiBaseUrl='https://api.mydocsai.tech/sendmessage'] - The base URL for the DocsAI API.
 * @returns {function(NextRequest): Promise<NextResponse>} An async function that handles the API request.
 */
export const createNextDocsAiProxy = ({ docsAiApiKey, docsAiApiBaseUrl = 'https://api.mydocsai.tech/sendmessage' }) => {
  console.log("SDK (backend-next): createNextDocsAiProxy called during initialization.");

  // --- SDK-SIDE API KEY VALIDATION ---
  if (!docsAiApiKey) {
    console.error("SDK Error (backend-next): 'docsAiApiKey' is required but was not provided to createNextDocsAiProxy during initialization.");
    return async (req) => { // req is needed here to match the signature
      console.error("SDK (backend-next): Returning 500 status due to missing API key for request to", req.url);
      return NextResponse.json(
        { message: 'Server configuration error: DocsAI API key not found in SDK setup.' },
        { status: 500 }
      );
    };
  }
  // --- END OF SDK-SIDE API KEY VALIDATION ---

  // Create the core proxy handler once (now guaranteed to have docsAiApiKey)
  const docsAiProxyHandler = createDocsAiProxy({ docsAiApiKey, docsAiApiBaseUrl });
  console.log("SDK (backend-next): Core docsAiProxyHandler created successfully.");

  return async (req) => {
    console.log(`SDK (backend-next): Incoming request to Next.js proxy handler. Method: ${req.method}, URL: ${req.url}`);
    try {
      // 1. Convert NextRequest body to Node.js Readable stream
      const requestBodyArrayBuffer = await req.arrayBuffer();
      const mockNodeReq = new Readable({
        read() {
          // Push the entire buffer at once, then signal end
          this.push(Buffer.from(requestBodyArrayBuffer));
          this.push(null);
        }
      });
      // Attach other properties that createDocsAiProxy expects from http.IncomingMessage
      Object.assign(mockNodeReq, {
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
        url: req.nextUrl.pathname,
      });

      console.log("SDK (backend-next): Mock Node.js Request created for core proxy.");

      let responseStatus = 200;
      let responseHeaders = {};
      let responseBodyChunks = []; // To collect non-streaming body parts for non-streaming responses
      let isStreamingResponse = false;
      let webReadableStream = null; // Initialize to null
      let webReadableStreamController = null; // Initialize to null

      // Promise that resolves when mockNodeRes.writeHead is called
      let writeHeadCalledResolve;
      const writeHeadCalledPromise = new Promise(resolve => {
          writeHeadCalledResolve = resolve;
      });

      // Create a mock Node.js response object (http.ServerResponse)
      const mockNodeRes = new Writable({
        write(chunk, encoding, callback) {
          if (isStreamingResponse && webReadableStreamController) {
            // If it's a streaming response and the controller is ready, enqueue the chunk
            webReadableStreamController.enqueue(chunk);
          } else {
            // Otherwise, collect chunks for a non-streaming response
            responseBodyChunks.push(chunk);
          }
          callback();
        },
        final(callback) {
          if (isStreamingResponse && webReadableStreamController) {
            // If streaming, close the Web ReadableStream
            webReadableStreamController.close();
          }
          callback();
        }
      });

      // Add http.ServerResponse-like properties to the mock
      Object.assign(mockNodeRes, {
        statusCode: 200, // Default status
        setHeader: (name, value) => {
          responseHeaders[name.toLowerCase()] = value;
        },
        writeHead: (status, headers) => {
          responseStatus = status;
          responseHeaders = { ...responseHeaders, ...headers };
          if (responseHeaders['content-type']?.includes('text/event-stream')) {
            isStreamingResponse = true;
            console.log("SDK (backend-next): Detected streaming response in writeHead. Initializing Web ReadableStream.");
            // Initialize Web ReadableStream and its controller here, once streaming is confirmed
            webReadableStream = new ReadableStream({
              start(controller) {
                webReadableStreamController = controller;
              },
              cancel() {
                console.log("SDK (backend-next): Web ReadableStream cancelled.");
              }
            });
          }
          // Resolve the promise once writeHead is called, regardless of streaming or not
          writeHeadCalledResolve();
        },
      });

      // Call the core proxy handler with the mock objects.
      // This will initiate the request to the DocsAI API and start piping
      // its response to mockNodeRes. Do NOT await it here for streaming cases.
      const proxyOperationPromise = docsAiProxyHandler(mockNodeReq, mockNodeRes);

      // Wait for writeHead to be called on mockNodeRes to determine the response type
      await writeHeadCalledPromise;
      console.log("SDK (backend-next): writeHead was called. isStreamingResponse:", isStreamingResponse);

      // Return the appropriate NextResponse based on whether it's a streaming response
      if (isStreamingResponse && webReadableStream) {
        console.log("SDK (backend-next): Returning NextResponse with Web ReadableStream for streaming.");
        // For streaming, return the NextResponse immediately.
        // The 'proxyOperationPromise' will continue to run in the background,
        // piping data to 'webReadableStreamController'.
        return new NextResponse(webReadableStream, {
          status: responseStatus,
          headers: responseHeaders,
        });
      } else {
        console.log("SDK (backend-next): Not a streaming response. Awaiting full proxy operation.");
        // For non-streaming responses, we still need to wait for the entire body
        // to be collected before returning.
        await proxyOperationPromise; // Await the completion of the proxy handler for non-streaming
        console.log("SDK (backend-next): Full proxy operation completed for non-streaming.");

        const responseBody = Buffer.concat(responseBodyChunks).toString('utf8');
        try {
          const jsonResponse = JSON.parse(responseBody);
          return NextResponse.json(jsonResponse, {
            status: responseStatus,
            headers: responseHeaders,
          });
        } catch (e) {
          console.error("SDK (backend-next): Failed to parse responseBody as JSON. Returning as text.");
          console.error("SDK (backend-next): JSON parsing error:", e);
          console.error("SDK (backend-next): Problematic responseBody (full):", responseBody);
          return new NextResponse(responseBody, {
            status: responseStatus,
            headers: responseHeaders,
          });
        }
      }
    } catch (error) {
      console.error("SDK (backend-next): Uncaught error in createNextDocsAiProxy handler's try-catch block:", error);
      return NextResponse.json(
        { message: 'Internal server error in DocsAI proxy.', error: error.message },
        { status: 500 }
      );
    }
  };
};