import { serve } from '@hono/node-server';
import { Hono } from 'hono';

/**
 * Spec 118 stub: health only. No ledger data, no Google, no sync.
 */
const app = new Hono();

app.get('/healthz', (c) => c.json({ ok: true }));

const port = Number(process.env.PORT ?? 8080);

serve({ fetch: app.fetch, port }, (info) => {
	console.log(`pocket-ledger api listening on :${info.port}`);
});
