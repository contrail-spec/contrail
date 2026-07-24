/**
 * Crockford Base32 alphabet for ULID encoding.
 * Excludes I, L, O, U to avoid confusion with 1 and 0.
 */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * Generates a ULID (Universally Unique Lexicographically Sortable Identifier).
 *
 * Format: 26 characters total
 *   - 10 chars: timestamp (milliseconds since Unix epoch, Crockford Base32)
 *   - 16 chars: cryptographically random
 *
 * Sortable: ULIDs generated in the same millisecond sort lexicographically
 * by creation time. This matches the spec's requirement that `id` be
 * "globally unique, sortable by creation time".
 *
 * Spec reference: spec/SPEC.md §2.1 (`id` field, type "string (ULID)")
 */
export function generateULID(): string {
  // Timestamp: 10 characters (milliseconds since epoch, Crockford Base32)
  let timestamp = Date.now();
  let timestampStr = '';
  for (let i = 0; i < 10; i++) {
    timestampStr = ALPHABET[timestamp % 32] + timestampStr;
    timestamp = Math.floor(timestamp / 32);
  }

  // Randomness: 16 characters (Crockford Base32)
  let randomStr = '';
  for (let i = 0; i < 16; i++) {
    randomStr += ALPHABET[Math.floor(Math.random() * 32)];
  }

  return timestampStr + randomStr;
}
