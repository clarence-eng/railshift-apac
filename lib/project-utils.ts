/**
 * Project utility functions shared across server and client components.
 * No "use client" directive — safe to import from both RSC and client code.
 */

/** RegExp for Siemens incumbent confirmation in analyst notes. */
const INCUMBENT_RE = /siemens.*incumbent|incumbent.*siemens/i;

/** Returns true if the project note confirms Siemens is the incumbent. */
export function isSiemensIncumbent(note: string | null): boolean {
  return INCUMBENT_RE.test(note ?? "");
}

/** Extracts the first 4-digit year (2020–2049) from a keyDate string. */
export function extractYear(keyDate: string | null): number | null {
  if (!keyDate) return null;
  const m = keyDate.match(/\b(20[2-4][0-9])\b/);
  return m ? parseInt(m[1], 10) : null;
}
