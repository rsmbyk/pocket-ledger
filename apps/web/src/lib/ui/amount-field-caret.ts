import { tick } from 'svelte';
import { caretAfterAmountInput } from '$lib/domain/transaction-rules';

/** Rewrite grouped amount digits and put the caret back on the same digit. */
export function applyGroupedAmountInput(
	el: HTMLInputElement,
	setDigits: (digits: string) => void
): void {
	const { digits, selectionStart } = caretAfterAmountInput(el.value, el.selectionStart);
	setDigits(digits);
	void tick().then(() => {
		el.setSelectionRange(selectionStart, selectionStart);
	});
}
