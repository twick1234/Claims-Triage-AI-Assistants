// SSE utility helpers

export function createSSEResponse(
  onConnect: (controller: ReadableStreamDefaultController) => void,
  onDisconnect: (controller: ReadableStreamDefaultController) => void
): Response {
  const stream = new ReadableStream({
    start(controller) {
      // Send initial ping
      controller.enqueue(new TextEncoder().encode(': connected\n\n'));
      onConnect(controller);
    },
    cancel(controller) {
      onDisconnect(controller as ReadableStreamDefaultController);
    },
  });

  // Restrict SSE to same-origin; the stream carries all conversation events.
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const corsOrigin = origin || 'null';

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': corsOrigin,
    },
  });
}

export function formatSSEEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
