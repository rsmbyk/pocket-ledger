export function displayNameFromIdentity(name: string | undefined, email: string): string {
	const trimmed = (name ?? '').trim();
	if (trimmed) return trimmed;
	const local = email.split('@')[0]?.trim() ?? '';
	return local || email;
}

export function profileInitials(displayName: string, email: string): string {
	const source = displayName.trim() || email.split('@')[0] || '?';
	const parts = source.split(/[\s._-]+/).filter(Boolean);
	if (parts.length >= 2) {
		return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
	}
	return source.slice(0, 2).toUpperCase() || '?';
}
