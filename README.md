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

`targetLength` must be a non-negative safe integer.

Jev gets one Choice with criteria named `space_0`, `space_1`, `space_2`, and so
on, written directly up to `space_10`. For the example above, it should choose
`space_5`. JavaScript reads the number, creates five spaces, and puts the value
after them.

This means the package can add between 0 and 10 spaces, or exactly 22. If any
other number is needed, Jev has no correct option. Which feels appropriate for
this project.

### 22 spaces

Spaces 0 to 10 are supported for everyone. 22 is supported for
[@akwodkiewicz](https://github.com/f/jev-leftpad/issues/1), who needed exactly
22 and asked nicely. 11 to 21 remain unsupported, in line with the project
vision.

```js
await leftPad('jev', 25);
// "                      jev" (probably)
```

Custom padding is available on request, one number per customer.

There is one TypeSafe API request per call and retries are disabled. The request
can fail, Jev can choose the wrong option, and it costs more than `padStart()`.
Please don't use this in production. Or anything important.

## Development

```sh
npm install
npm test
```

The tests mock Jev. They don't need an API key and don't spend any TypeSafe
credits.

## License

MIT
