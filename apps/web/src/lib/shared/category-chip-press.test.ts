import { describe, expect, it } from 'vitest';
import {
	CATEGORY_CHIP_LONG_PRESS_MS,
	CATEGORY_CHIP_PRESS_SLOP_PX,
	chipPressMovedBeyondSlop,
	chipPressOutcome
} from './category-chip-press';

describe('chipPressOutcome', () => {
	it('toggles on a short press', () => {
		expect(
			chipPressOutcome({
				durationMs: CATEGORY_CHIP_LONG_PRESS_MS - 1,
				movedBeyondSlop: false,
				isCustom: false
			})
		).toBe('toggle');
		expect(
			chipPressOutcome({
				durationMs: 80,
				movedBeyondSlop: false,
				isCustom: true
			})
		).toBe('toggle');
	});

	it('renames a custom chip after the long-press threshold', () => {
		expect(
			chipPressOutcome({
				durationMs: CATEGORY_CHIP_LONG_PRESS_MS,
				movedBeyondSlop: false,
				isCustom: true
			})
		).toBe('rename');
	});

	it('does nothing on a long-press of a stock chip', () => {
		expect(
			chipPressOutcome({
				durationMs: CATEGORY_CHIP_LONG_PRESS_MS,
				movedBeyondSlop: false,
				isCustom: false
			})
		).toBe('none');
	});

	it('cancels when the pointer moves past slop', () => {
		expect(
			chipPressOutcome({
				durationMs: 80,
				movedBeyondSlop: true,
				isCustom: true
			})
		).toBe('none');
		expect(
			chipPressOutcome({
				durationMs: CATEGORY_CHIP_LONG_PRESS_MS,
				movedBeyondSlop: true,
				isCustom: true
			})
		).toBe('none');
	});

	it('does nothing while rename is open', () => {
		expect(
			chipPressOutcome({
				durationMs: 80,
				movedBeyondSlop: false,
				isCustom: true,
				renameOpen: true
			})
		).toBe('none');
	});
});

describe('chipPressMovedBeyondSlop', () => {
	it('stays inside the 10px slop', () => {
		expect(chipPressMovedBeyondSlop(0, 0, CATEGORY_CHIP_PRESS_SLOP_PX, 0)).toBe(false);
	});

	it('flags a move past slop', () => {
		expect(chipPressMovedBeyondSlop(0, 0, CATEGORY_CHIP_PRESS_SLOP_PX + 0.1, 0)).toBe(true);
	});
});
