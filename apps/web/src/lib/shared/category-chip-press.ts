/** Long-press threshold for custom rename below `md` (Spec 126). */
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
