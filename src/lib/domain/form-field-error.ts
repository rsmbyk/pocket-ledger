/** Field keys for inline form validation presentation (spec 079). */
export type FormFieldKey =
	| 'amount'
	| 'name'
	| 'occurredOn'
	| 'opening'
	| 'asOf'
	| 'goalTarget'
	| 'goalDate'
	| 'category'
	| 'pocket'
	| 'source'
	| 'dest'
	| 'passphrase'
	| 'passphraseConfirm'
	| 'form';

/**
 * Maps known thrown validation messages to a field key.
 * Unknown / operational errors → `form`.
 */
export function classifyFormFieldError(message: string): FormFieldKey {
	const m = message.trim();
	if (/Opening balance/i.test(m)) return 'opening';
	if (/As-of date/i.test(m)) return 'asOf';
	if (/^Amount\b/i.test(m)) return 'amount';
	if (/Goal target|goalTarget/i.test(m)) return 'goalTarget';
	if (/Goal date/i.test(m)) return 'goalDate';
	if (/^Date must be YYYY-MM-DD/i.test(m)) return 'occurredOn';
	if (/Name is required/i.test(m)) return 'name';
	if (/Choose a category/i.test(m)) return 'category';
	if (/Choose source and destination/i.test(m)) return 'source';
	if (/Source and destination must be different/i.test(m)) return 'dest';
	if (/Passphrases do not match/i.test(m)) return 'passphraseConfirm';
	if (/Passphrase must be at least/i.test(m) || /Incorrect passphrase/i.test(m)) {
		return 'passphrase';
	}
	return 'form';
}
