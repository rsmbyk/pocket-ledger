<script lang="ts">
	import { onMount } from 'svelte';

	const FADE_MS = 650;
	const MIN = 24;
	const THICK = 5;
	const INSET = 3;
	const MIST_LIGHT = '#eef1f4';
	const MIST_DARK = '#12151a';

	function isDocScroller(el: HTMLElement) {
		return el === document.documentElement || el === document.body || el === document.scrollingElement;
	}

	function resolveScrollEl(e: Event): HTMLElement | null {
		const t = e.target;
		if (t === document || t === document.documentElement || t === document.body) {
			const se = document.scrollingElement;
			return se instanceof HTMLElement ? se : document.documentElement;
		}
		if (!(t instanceof HTMLElement)) return null;
		if (t.classList.contains('pl-osb')) return null;
		return t;
	}

	function boxFor(el: HTMLElement) {
		if (isDocScroller(el)) {
			const se = (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
			return {
				left: 0,
				top: 0,
				right: innerWidth,
				bottom: innerHeight,
				sl: se.scrollLeft,
				st: se.scrollTop,
				cw: se.clientWidth,
				ch: se.clientHeight,
				sw: se.scrollWidth,
				sh: se.scrollHeight
			};
		}
		const r = el.getBoundingClientRect();
		return {
			left: r.left,
			top: r.top,
			right: r.right,
			bottom: r.bottom,
			sl: el.scrollLeft,
			st: el.scrollTop,
			cw: el.clientWidth,
			ch: el.clientHeight,
			sw: el.scrollWidth,
			sh: el.scrollHeight
		};
	}

	function placeAxis(thumb: HTMLDivElement, axis: 'y' | 'x', b: ReturnType<typeof boxFor>) {
		const overflow = axis === 'y' ? b.sh - b.ch : b.sw - b.cw;
		const track = axis === 'y' ? b.ch : b.cw;
		if (overflow <= 8 || track < 48) {
			thumb.classList.remove('is-on');
			return;
		}
		const thumbLen = Math.max(MIN, (track / (axis === 'y' ? b.sh : b.sw)) * track);
		const maxPos = Math.max(0, track - thumbLen);
		const range = axis === 'y' ? b.sh - b.ch : b.sw - b.cw;
		const pos = range > 0 ? ((axis === 'y' ? b.st : b.sl) / range) * maxPos : 0;
		if (axis === 'y') {
			thumb.style.width = `${THICK}px`;
			thumb.style.height = `${thumbLen}px`;
			thumb.style.left = `${b.right - THICK - INSET}px`;
			thumb.style.top = `${b.top + pos}px`;
		} else {
			thumb.style.height = `${THICK}px`;
			thumb.style.width = `${thumbLen}px`;
			thumb.style.top = `${b.bottom - THICK - INSET}px`;
			thumb.style.left = `${b.left + pos}px`;
		}
		thumb.classList.add('is-on');
	}

	function syncThemeColor() {
		const dark = document.documentElement.classList.contains('dark');
		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute('content', dark ? MIST_DARK : MIST_LIGHT);
	}

	onMount(() => {
		syncThemeColor();
		const themeObs = new MutationObserver(syncThemeColor);
		themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		const y = document.createElement('div');
		const x = document.createElement('div');
		y.className = 'pl-osb pl-osb--y';
		x.className = 'pl-osb pl-osb--x';
		y.setAttribute('aria-hidden', 'true');
		x.setAttribute('aria-hidden', 'true');
		document.body.append(y, x);

		let fadeY: ReturnType<typeof setTimeout> | undefined;
		let fadeX: ReturnType<typeof setTimeout> | undefined;
		let raf = 0;
		let pending: HTMLElement | null = null;

		function hideLater(thumb: HTMLDivElement, which: 'y' | 'x') {
			const id = setTimeout(() => thumb.classList.remove('is-on'), FADE_MS);
			if (which === 'y') {
				clearTimeout(fadeY);
				fadeY = id;
			} else {
				clearTimeout(fadeX);
				fadeX = id;
			}
		}

		function paintThumbs(el: HTMLElement) {
			const b = boxFor(el);
			placeAxis(y, 'y', b);
			placeAxis(x, 'x', b);
			if (y.classList.contains('is-on')) hideLater(y, 'y');
			if (x.classList.contains('is-on')) hideLater(x, 'x');
		}

		function onScroll(e: Event) {
			const el = resolveScrollEl(e);
			if (!el) return;
			pending = el;
			if (raf) return;
			raf = requestAnimationFrame(() => {
				raf = 0;
				if (pending) paintThumbs(pending);
			});
		}

		window.addEventListener('scroll', onScroll, { capture: true, passive: true });

		return () => {
			themeObs.disconnect();
			window.removeEventListener('scroll', onScroll, true);
			clearTimeout(fadeY);
			clearTimeout(fadeX);
			if (raf) cancelAnimationFrame(raf);
			y.remove();
			x.remove();
		};
	});
</script>
