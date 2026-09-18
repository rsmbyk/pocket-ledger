import { describe, expect, it } from 'vitest';
import {
	BROWSER_VIEWPORT_CONTENT,
	PWA_LOCKED_VIEWPORT_CONTENT,
	ZOOM_LOCK_ATTR,
	applyInstalledPwaZoomLock,
	isInstalledPwa,
	lockedViewportContent
} from './page-zoom';

function fakeDocument(viewport: string, alreadyLocked = false) {
	const listeners = new Map<string, (event: Event) => void>();
	const meta = {
		content: viewport,
		getAttribute(name: string) {
			return name === 'content' ? this.content : null;
		},
		setAttribute(name: string, value: string) {
			if (name === 'content') this.content = value;
		}
	};
	const htmlAttrs = new Map<string, string>();
	if (alreadyLocked) htmlAttrs.set(ZOOM_LOCK_ATTR, '');
	return {
		listeners,
		meta,
		documentElement: {
			hasAttribute(name: string) {
				return htmlAttrs.has(name);
			},
			setAttribute(name: string, value: string) {
				htmlAttrs.set(name, value);
			}
		},
		querySelector(sel: string) {
			return sel === 'meta[name="viewport"]' ? meta : null;
		},
		addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
			const fn = typeof listener === 'function' ? listener : listener.handleEvent.bind(listener);
			listeners.set(type, fn);
		}
	};
}

describe('isInstalledPwa', () => {
	it('is false when neither flag is set', () => {
		expect(isInstalledPwa({})).toBe(false);
		expect(isInstalledPwa({ displayModeStandalone: false, iosStandalone: false })).toBe(false);
	});

	it('is true for Chromium standalone or iOS home-screen', () => {
		expect(isInstalledPwa({ displayModeStandalone: true })).toBe(true);
		expect(isInstalledPwa({ iosStandalone: true })).toBe(true);
		expect(isInstalledPwa({ displayModeStandalone: false, iosStandalone: true })).toBe(true);
	});
});

describe('lockedViewportContent', () => {
	it('leaves a tab viewport unchanged until lock tokens are added', () => {
		expect(BROWSER_VIEWPORT_CONTENT).toBe(
			'width=device-width, initial-scale=1.0, viewport-fit=cover'
		);
		expect(lockedViewportContent(BROWSER_VIEWPORT_CONTENT)).toBe(PWA_LOCKED_VIEWPORT_CONTENT);
		expect(PWA_LOCKED_VIEWPORT_CONTENT).toContain('viewport-fit=cover');
		expect(PWA_LOCKED_VIEWPORT_CONTENT).toContain('maximum-scale=1.0');
		expect(PWA_LOCKED_VIEWPORT_CONTENT).toContain('user-scalable=no');
	});

	it('appends lock tokens to the offline page viewport', () => {
		expect(lockedViewportContent('width=device-width, initial-scale=1.0')).toBe(
			'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
		);
	});

	it('does not duplicate tokens that are already present', () => {
		expect(lockedViewportContent(PWA_LOCKED_VIEWPORT_CONTENT)).toBe(PWA_LOCKED_VIEWPORT_CONTENT);
	});
});

describe('applyInstalledPwaZoomLock', () => {
	it('leaves a browser tab viewport and listeners alone', () => {
		const doc = fakeDocument(BROWSER_VIEWPORT_CONTENT);
		const locked = applyInstalledPwaZoomLock(doc, {
			displayModeStandalone: false,
			iosStandalone: false
		});
		expect(locked).toBe(false);
		expect(doc.meta.content).toBe(BROWSER_VIEWPORT_CONTENT);
		expect([...doc.listeners.keys()]).toEqual([]);
		expect(doc.documentElement.hasAttribute(ZOOM_LOCK_ATTR)).toBe(false);
	});

	it('locks the viewport and preventDefaults iOS gesture events when standalone', () => {
		const doc = fakeDocument(BROWSER_VIEWPORT_CONTENT);
		const locked = applyInstalledPwaZoomLock(doc, { displayModeStandalone: true });
		expect(locked).toBe(true);
		expect(doc.meta.content).toBe(PWA_LOCKED_VIEWPORT_CONTENT);
		expect([...doc.listeners.keys()]).toEqual(['gesturestart', 'gesturechange', 'gestureend']);
		expect(doc.documentElement.hasAttribute(ZOOM_LOCK_ATTR)).toBe(true);

		const prevented: string[] = [];
		const spy = {
			preventDefault() {
				prevented.push('yes');
			}
		} as unknown as Event;
		doc.listeners.get('gesturestart')?.(spy);
		doc.listeners.get('gesturechange')?.(spy);
		doc.listeners.get('gestureend')?.(spy);
		expect(prevented).toEqual(['yes', 'yes', 'yes']);
	});

	it('treats iOS home-screen as installed when display-mode is not standalone', () => {
		const doc = fakeDocument(BROWSER_VIEWPORT_CONTENT);
		applyInstalledPwaZoomLock(doc, { displayModeStandalone: false, iosStandalone: true });
		expect(doc.meta.content).toBe(PWA_LOCKED_VIEWPORT_CONTENT);
		expect(doc.listeners.size).toBe(3);
	});

	it('is a no-op when html is already marked locked', () => {
		const doc = fakeDocument(PWA_LOCKED_VIEWPORT_CONTENT, true);
		const locked = applyInstalledPwaZoomLock(doc, { displayModeStandalone: true });
		expect(locked).toBe(true);
		expect(doc.meta.content).toBe(PWA_LOCKED_VIEWPORT_CONTENT);
		expect(doc.listeners.size).toBe(0);
	});
});
