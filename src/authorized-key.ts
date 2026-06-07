// Validate an SSH authorized_keys line and return "<type> <base64>" with any
// comment stripped, or null if it is not a well-formed public key.
export function parseAuthorizedKey(line: string): string | null {
	const [type, base64] = line.trim().split(/\s+/);
	if (!type || !base64) {
		return null;
	}

	let blob: Uint8Array;
	try {
		blob = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
	} catch {
		return null;
	}
	if (blob.length < 4) {
		return null;
	}

	// The blob starts with a length-prefixed algorithm name that must match the
	// declared type for the key to be genuine.
	const nameLength = new DataView(blob.buffer).getUint32(0);
	if (4 + nameLength > blob.length) {
		return null;
	}
	const name = new TextDecoder().decode(blob.subarray(4, 4 + nameLength));
	return name === type ? `${type} ${base64}` : null;
}
