import {
  Column,
  type ColumnOptions,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Every timestamp column is `timestamptz` at millisecond precision. `timestamptz`
 * so a stored value is an unambiguous instant, not a naive wall-clock that only
 * reads right while the process and DB share a timezone. Precision 3 because
 * Postgres stores microseconds but the `pg` driver hydrates a millisecond `Date`:
 * a keyset cursor over a microsecond column silently skips rows whose sub-
 * millisecond fraction lands inside the page-boundary millisecond. Each decorator
 * spreads the caller's native options first, then pins `type`/`precision` so those
 * two invariants cannot be overridden while `nullable`, `default`, `unique`, and
 * the rest stay available.
 */
const TIMESTAMP_PRECISION = 3;

const TIMESTAMPTZ_OPTIONS = {
  type: 'timestamptz',
  precision: TIMESTAMP_PRECISION,
} as const;

export function CreatedAtColumn(
  options: ColumnOptions = {},
): PropertyDecorator {
  return CreateDateColumn({ ...options, ...TIMESTAMPTZ_OPTIONS });
}

export function UpdatedAtColumn(
  options: ColumnOptions = {},
): PropertyDecorator {
  return UpdateDateColumn({ ...options, ...TIMESTAMPTZ_OPTIONS });
}

export function DeletedAtColumn(
  options: ColumnOptions = {},
): PropertyDecorator {
  return DeleteDateColumn({ ...options, ...TIMESTAMPTZ_OPTIONS });
}

export function TimestamptzColumn(
  options: ColumnOptions = {},
): PropertyDecorator {
  return Column({ ...options, ...TIMESTAMPTZ_OPTIONS });
}
