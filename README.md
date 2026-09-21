# jev-leftpad

Left pad a value with Jev.

Could this be one line with `padStart()`? Yes. Does it need a model call? No.
Anyway:

```sh
npm install jev-leftpad
```

```js
import leftPad from 'jev-leftpad';

const result = await leftPad('jev', 8);

console.log(JSON.stringify(result));
// "     jev" (probably)
```

Set `TYPESAFE_API_KEY` before using it. `jev-leftpad` uses `jev-latest` through
TypeSafe's native [`@typesafe-ai/sdk`](https://docs.typesafe.ai/sdk/javascript).
It requires Node.js 20 or newer.

## API

```js
await leftPad(value, targetLength)
```

`targetLength` can be any number. Jev does the math.

### Negative numbers

A negative `targetLength` asks Jev for `space_minus_1` through
`space_minus_10`, and the spaces go after the value. Yes, that is `padEnd()`.
No, we will not be calling it that.

```js
await leftPad('jev', -8);
// "jev     " (probably)
```

You no longer need to write `!(await leftPad('jev', 8))`. You never did.

### Fractional numbers

Jev is asked whether half a space is needed. If so, you get a U+2009 thin
space, which is roughly half a space in most fonts and exactly half a space in
Jev's heart.

```js
await leftPad('jev', 7.5);
// "    \u2009jev" (probably)
```

### Imaginary numbers

Real padding goes left. Imaginary padding goes up.

```js
import leftPad, { complex } from 'jev-leftpad';

await leftPad('jev', complex(8, 2));
// "\n\n     jev" (probably)
```

### Calculus

Why pass `8` when you can make Jev earn it? These helpers turn your math into a
string, and Jev works it out. No work is shown. No work is checked.

```js
import leftPad, { sqrt, integral, derivative, limit, sum } from 'jev-leftpad';

await leftPad('jev', sqrt(64));                      // √64
await leftPad('jev', integral('x', 0, 4));           // ∫_0^4 x dx
await leftPad('jev', derivative('x^2 + 4x', 2));     // d/dx (x^2 + 4x) at x = 2
await leftPad('jev', limit('(8x + 1) / x', '∞'));    // lim x→∞ (8x + 1) / x
await leftPad('jev', sum('4 / 2^n', 0, '∞'));        // Σ_{n=0}^∞ 4 / 2^n
// all "     jev" (probably)
```

Any non-empty string works, so `leftPad('jev', 'eight')` and
`leftPad('jev', 'VIII')` are also Jev's problem now.

### Right-to-left text

Jev is also asked whether `value` is written right to left. If it is, the
padding flips sides. A negative number with right-to-left text flips twice and
ends up where it started. This is a feature.

### Numbers Jev won't take

- `NaN` is a number that is not a number, so no.
- `Infinity` is rejected because Jev is still counting.
- `8n` is a BigInt. Jev is not ready for that conversation.

### How it works

Jev gets one Choice with criteria named `space_0`, `space_1`, `space_2`, and so
on, written directly up to `space_10`. For the example above, it should choose
`space_5`. JavaScript reads the number, creates five spaces, and puts the value
after them.

Three more questions ride along in the same request: a Noul for the half
space, a Choice from `line_0` to `line_10` for the imaginary part, and a Noul
for right-to-left text.

This means the package can add between -10.5 and 10.5 spaces and up to 10
lines. If more are needed, Jev has no correct option. Which feels appropriate
for this project.

There is one TypeSafe API request per call and retries are disabled. The request
can fail, Jev can choose the wrong option, and it costs more than `padStart()`.
Please don't use this in production. Or anything important.

## Benchmark

| | `jev-leftpad` | `String.prototype.padStart()` |
| --- | --- | --- |
| Latency | One network round trip | Nanoseconds |
| Cost per call | TypeSafe credits | Free |
| Correct | Probably | Yes |
| Max padding | 10.5 spaces | 2^53 - 1 |
| Negative numbers | Yes | No (fair) |
| Calculus | Yes | No (also fair) |
| Imaginary numbers | Yes | No |
| Has feelings about BigInt | Yes | No |

`padStart()` wins every row that matters.

## Development

```sh
npm install
npm test
```

The tests mock Jev. They don't need an API key and don't spend any TypeSafe
credits.

## License

MIT
