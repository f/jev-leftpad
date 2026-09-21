# Changelog

## Unreleased

### Added

- Negative numbers. The spaces go after the value. Closes #3.
- Fractional numbers, with a thin space for the half.
- Imaginary numbers via `complex(re, im)`. Imaginary padding goes up.
- Calculus helpers: `sqrt`, `integral`, `derivative`, `limit` and `sum`. Jev does the math.
- Right-to-left detection. Jev decides which side the padding goes on.
- A benchmark table in the README. `padStart()` wins.

### Changed

- `targetLength` no longer has to be a non-negative safe integer. It can be any
  finite number, a non-empty string, or `complex()`.
- Jev now answers four questions per request instead of one. Still one request.
  More tokens.

### Removed

- The need for `!(await leftPad(value, n))`. It was never needed.
