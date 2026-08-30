/** Long-press threshold below `md` (Spec 126 chips, Spec 131 group names). */
export const CATEGORY_CHIP_LONG_PRESS_MS = 500;

/** Pointer travel that cancels a chip press (Spec 126). */
export const CATEGORY_CHIP_PRESS_SLOP_PX = 10;

export type ChipPressOutcome = 'toggle' | 'rename' | 'none';

export type ChipPressInput = {
	durationMs: number;
	movedBeyondSlop: boolean;
	isCustom: boolean;
	renameOpen?: boolean;
};

/**
 * Decide hide/show vs rename vs ignore for a Categories chip press below `md`.
 */
export function chipPressOutcome(input: ChipPressInput): ChipPressOutcome {
	if (input.renameOpen) return 'none';
	if (input.movedBeyondSlop) return 'none';
	if (input.durationMs >= CATEGORY_CHIP_LONG_PRESS_MS) {
		return input.isCustom ? 'rename' : 'none';
	}
	return 'toggle';
}

export type GroupHeaderPressOutcome = 'toggle' | 'rename' | 'none';

export type GroupHeaderPressInput = {
	durationMs: number;
	movedBeyondSlop: boolean;
	isCustom: boolean;
	emptyGroup?: boolean;
	renameOpen?: boolean;
};

/**
 * Decide hide/show vs rename vs ignore for a group-name press below `md` (Spec 131).
 * Inverse of chips: short → rename (custom), long → toggle visibility.
 */
export function groupHeaderPressOutcome(input: GroupHeaderPressInput): GroupHeaderPressOutcome {
	if (input.renameOpen) return 'none';
	if (input.movedBeyondSlop) return 'none';
	if (input.durationMs >= CATEGORY_CHIP_LONG_PRESS_MS) {
		return input.emptyGroup ? 'none' : 'toggle';
	}
	return input.isCustom ? 'rename' : 'none';
}

/** True when the pointer left the 10px slop around the press origin. */
export function chipPressMovedBeyondSlop(
	startX: number,
	startY: number,
	x: number,
	y: number,
	slopPx: number = CATEGORY_CHIP_PRESS_SLOP_PX
): boolean {
	return Math.hypot(x - startX, y - startY) > slopPx;
}
