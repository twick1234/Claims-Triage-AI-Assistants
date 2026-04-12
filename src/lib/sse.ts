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

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? 'null',
    },
  });
}

export function formatSSEEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
