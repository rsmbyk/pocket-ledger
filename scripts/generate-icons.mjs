import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function crc32(buf) {
	let c = ~0;
	for (let i = 0; i < buf.length; i++) {
		c ^= buf[i];
		for (let k = 0; k < 8; k++) {
			c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
		}
	}
	return ~c >>> 0;
}

function chunk(type, data) {
	const typeBuf = Buffer.from(type);
	const len = Buffer.alloc(4);
	len.writeUInt32BE(data.length);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
	return Buffer.concat([len, typeBuf, data, crc]);
}

function png(size, rgbaFn) {
	const raw = Buffer.alloc((size * 4 + 1) * size);
	for (let y = 0; y < size; y++) {
		raw[y * (size * 4 + 1)] = 0;
		for (let x = 0; x < size; x++) {
			const [r, g, b, a] = rgbaFn(x, y, size);
			const i = y * (size * 4 + 1) + 1 + x * 4;
			raw[i] = r;
			raw[i + 1] = g;
			raw[i + 2] = b;
			raw[i + 3] = a;
		}
	}

	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(size, 0);
	ihdr.writeUInt32BE(size, 4);
	ihdr[8] = 8;
	ihdr[9] = 6;
	ihdr[10] = 0;
	ihdr[11] = 0;
	ihdr[12] = 0;

	return Buffer.concat([
		Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
		chunk('IHDR', ihdr),
		chunk('IDAT', deflateSync(raw)),
		chunk('IEND', Buffer.alloc(0))
	]);
}

function ledgerIcon(x, y, size, maskable = false) {
	const cx = size / 2;
	const cy = size / 2;
	const pad = maskable ? size * 0.12 : size * 0.08;
	const inBounds =
		x >= pad && x < size - pad && y >= pad && y < size - pad;

	// Dark zinc background
	if (!inBounds && maskable) return [20, 20, 23, 255];
	if (!inBounds) return [0, 0, 0, 0];

	const bg = [24, 24, 27, 255];
	const ink = [250, 250, 250, 255];
	const accent = [161, 161, 170, 255];

	// rounded-ish card
	const localX = (x - pad) / (size - 2 * pad);
	const localY = (y - pad) / (size - 2 * pad);
	const edge = 0.08;
	if (localX < edge || localX > 1 - edge || localY < edge || localY > 1 - edge) {
		const dx = Math.min(localX, 1 - localX, localY, 1 - localY);
		if (dx < 0.03) return [0, 0, 0, 0];
	}

	// horizontal rules like a ledger
	const line1 = Math.abs(localY - 0.35) < 0.03;
	const line2 = Math.abs(localY - 0.5) < 0.03;
	const line3 = Math.abs(localY - 0.65) < 0.03;
	if (line1 || line2 || line3) return accent;

	// left spine
	if (localX > 0.18 && localX < 0.24) return ink;

	return bg;
}

const outDir = path.resolve('public/icons');
mkdirSync(outDir, { recursive: true });

writeFileSync(path.join(outDir, 'icon-192.png'), png(192, (x, y, s) => ledgerIcon(x, y, s, false)));
writeFileSync(path.join(outDir, 'icon-512.png'), png(512, (x, y, s) => ledgerIcon(x, y, s, false)));
writeFileSync(
	path.join(outDir, 'icon-512-maskable.png'),
	png(512, (x, y, s) => ledgerIcon(x, y, s, true))
);

console.log('Wrote PWA icons to public/icons');
