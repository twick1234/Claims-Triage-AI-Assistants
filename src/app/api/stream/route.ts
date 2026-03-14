import { store } from '@/lib/store';
import { computeMetrics } from '@/lib/metrics/tracker';

export const runtime = 'edge';

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Initial ping
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Send current state immediately
      const conversations = Array.from(store.conversations.values());
      controller.enqueue(
        encoder.encode(
          `event: initial_state\ndata: ${JSON.stringify({ conversations })}\n\n`
        )
      );

      store.sseClients.add(controller);

      // Metrics tick every 30s
      const interval = setInterval(() => {
        try {
          const metrics = computeMetrics();
          controller.enqueue(
            encoder.encode(`event: metrics_tick\ndata: ${JSON.stringify(metrics)}\n\n`)
          );
        } catch {
          clearInterval(interval);
        }
      }, 30000);
    },
    cancel(controller) {
      store.sseClients.delete(controller as ReadableStreamDefaultController);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
