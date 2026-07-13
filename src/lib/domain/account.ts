/** Account identity for multi-account support (single-pot when only one exists). */
export type AccountId = string;

export type Account = {
	id: AccountId;
	name: string;
	/** Display-only currency label; multi-currency is out of scope for now. */
	currencyLabel: string;
	/** Reserved for optional encryption later; always false in scaffold. */
	createdAt: string;
};

export const DEFAULT_ACCOUNT_NAME = 'Main';
export const DEFAULT_CURRENCY_LABEL = 'IDR';
