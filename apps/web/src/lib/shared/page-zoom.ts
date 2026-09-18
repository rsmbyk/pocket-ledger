export const BROWSER_VIEWPORT_CONTENT = 'width=device-width, initial-scale=1.0, viewport-fit=cover';

export const PWA_LOCKED_VIEWPORT_CONTENT = `${BROWSER_VIEWPORT_CONTENT}, maximum-scale=1.0, user-scalable=no`;

export const ZOOM_LOCK_ATTR = 'data-pl-zoom-lock';

export type InstalledPwaFlags = {
	displayModeStandalone?: boolean;
	iosStandalone?: boolean;
};

type ViewportMeta = {
	getAttribute(name: string): string | null;
	setAttribute(name: string, value: string): void;
};

export type ZoomLockDocument = {
	documentElement?: {
		hasAttribute(name: string): boolean;
		setAttribute(name: string, value: string): void;
	} | null;
	querySelector(selectors: string): ViewportMeta | null;
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: AddEventListenerOptions
	): void;
};

/** Chromium standalone display-mode or iOS home-screen `navigator.standalone`. */
export function isInstalledPwa(flags: InstalledPwaFlags): boolean {
	return flags.displayModeStandalone === true || flags.iosStandalone === true;
}

/** Append `maximum-scale=1.0, user-scalable=no` without duplicating existing tokens. */
export function lockedViewportContent(current: string): string {
	let next = current.trim();
	if (!/maximum-scale\s*=/i.test(next)) {
		next = `${next}, maximum-scale=1.0`;
	}
	if (!/user-scalable\s*=/i.test(next)) {
		next = `${next}, user-scalable=no`;
	}
	return next;
}

export function readInstalledPwaFlags(): InstalledPwaFlags {
	return {
		displayModeStandalone: liveDisplayModeStandalone(),
		iosStandalone: liveIosStandalone()
	};
}

/** Rewrite the viewport and attach iOS gesture preventDefault. Idempotent via `data-pl-zoom-lock`. */
export function applyInstalledPwaZoomLock(
	doc: ZoomLockDocument,
	flags: InstalledPwaFlags
): boolean {
	if (!isInstalledPwa(flags)) return false;
	if (doc.documentElement?.hasAttribute(ZOOM_LOCK_ATTR)) return true;
	const meta = doc.querySelector('meta[name="viewport"]');
	if (meta) {
		const current = meta.getAttribute('content') ?? '';
		meta.setAttribute('content', lockedViewportContent(current));
	}
	const prevent = (event: Event) => {
		event.preventDefault();
	};
	doc.addEventListener('gesturestart', prevent, { passive: false });
	doc.addEventListener('gesturechange', prevent, { passive: false });
	doc.addEventListener('gestureend', prevent, { passive: false });
	doc.documentElement?.setAttribute(ZOOM_LOCK_ATTR, '');
	return true;
}

function liveDisplayModeStandalone(): boolean {
	try {
		return Boolean(globalThis.matchMedia?.('(display-mode: standalone)')?.matches);
	} catch {
		return false;
	}
}

function liveIosStandalone(): boolean {
	try {
		return (globalThis.navigator as Navigator & { standalone?: boolean })?.standalone === true;
	} catch {
		return false;
	}
}
