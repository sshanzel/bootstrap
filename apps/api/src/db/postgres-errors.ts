export const POSTGRES_UNIQUE_VIOLATION = '23505';

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === POSTGRES_UNIQUE_VIOLATION
  );
}

// The name of the unique index a 23505 violated, so a caller can tell which
// rule refused; null when not a unique violation or no name is present.
export function uniqueViolationConstraint(error: unknown): string | null {
  if (!isUniqueViolation(error)) {
    return null;
  }
  const constraint = (error as { constraint?: unknown }).constraint;
  return typeof constraint === 'string' ? constraint : null;
}
