import { choice, noul, TypeSafeClient } from '@typesafe-ai/sdk';

const HALF_SPACE = '\u2009';

export function sqrt(radicand) {
  return `√${radicand}`;
}

export function integral(integrand, from, to) {
  return `∫_${from}^${to} ${integrand} dx`;
}

export function derivative(fn, at) {
  return `d/dx (${fn}) at x = ${at}`;
}

export function limit(fn, approaches) {
  return `lim x→${approaches} ${fn}`;
}

export function sum(term, from, to) {
  return `Σ_{n=${from}}^${to} ${term}`;
}

export function complex(re, im) {
  return { re, im };
}

function validateTargetLength(targetLength) {
  if (typeof targetLength === 'string') {
    if (targetLength.trim() === '') {
      throw new RangeError('targetLength must be a number, or at least look like math');
    }
    return;
  }

  if (typeof targetLength === 'object' && targetLength !== null) {
    validateTargetLength(targetLength.re);
    validateTargetLength(targetLength.im);
    return;
  }

  if (Number.isNaN(targetLength)) {
    throw new RangeError('targetLength is NaN, which is a number, which is not a number');
  }

  if (targetLength === Number.POSITIVE_INFINITY || targetLength === Number.NEGATIVE_INFINITY) {
    throw new RangeError('targetLength is Infinity and Jev is still counting');
  }

  if (typeof targetLength !== 'number') {
    throw new RangeError('targetLength must be a number, a math string, or complex()');
  }
}

export async function leftPad(value, targetLength) {
  validateTargetLength(targetLength);

  const client = new TypeSafeClient({ retry: { maxRetries: 0 } });
  const { answers } = await client.systemOne({
    model: 'jev-latest',
    state: { value, targetLength },
    questions: {
      padding: choice(
        'Work out targetLength (it may be a square root, an integral, a derivative, a limit, a series, or the real part of a complex number; show no work). How many spaces are needed before value to reach it? If it is negative, how many spaces are needed after it?',
        {
          space_minus_10: '10 spaces are needed, but negatively',
          space_minus_9: '9 spaces are needed, but negatively',
          space_minus_8: '8 spaces are needed, but negatively',
          space_minus_7: '7 spaces are needed, but negatively',
          space_minus_6: '6 spaces are needed, but negatively',
          space_minus_5: '5 spaces are needed, but negatively',
          space_minus_4: '4 spaces are needed, but negatively',
          space_minus_3: '3 spaces are needed, but negatively',
          space_minus_2: '2 spaces are needed, but negatively',
          space_minus_1: '1 space is needed, but negatively',
          space_0: '0 spaces are needed',
          space_1: '1 space is needed',
          space_2: '2 spaces are needed',
          space_3: '3 spaces are needed',
          space_4: '4 spaces are needed',
          space_5: '5 spaces are needed',
          space_6: '6 spaces are needed',
          space_7: '7 spaces are needed',
          space_8: '8 spaces are needed',
          space_9: '9 spaces are needed',
          space_10: '10 spaces are needed'
        },
      ),
      halfSpace: noul('Does targetLength end in .5, so half a space is also needed?'),
      lines: choice(
        'targetLength may have an imaginary part. How many blank lines are needed above value?',
        {
          line_0: '0 lines are needed, targetLength is real',
          line_1: '1 line is needed',
          line_2: '2 lines are needed',
          line_3: '3 lines are needed',
          line_4: '4 lines are needed',
          line_5: '5 lines are needed',
          line_6: '6 lines are needed',
          line_7: '7 lines are needed',
          line_8: '8 lines are needed',
          line_9: '9 lines are needed',
          line_10: '10 lines are needed'
        },
      ),
      rightToLeft: noul('Is value written in a right-to-left script, so the padding belongs on the other side?'),
    },
  });

  const match = /^space_(minus_)?(\d+)$/u.exec(answers.padding.choice);
  const selectedLength = Number(match?.[2]);
  const halfSpace = answers.halfSpace.noul > 0.5 ? HALF_SPACE : '';
  const padding = ' '.repeat(selectedLength) + halfSpace;

  const lineMatch = /^line_(\d+)$/u.exec(answers.lines.choice);
  const lines = '\n'.repeat(Number(lineMatch?.[1] ?? 0));

  const after = Boolean(match?.[1]) !== answers.rightToLeft.noul > 0.5;

  return lines + (after ? value + padding : padding + value);
}

export default leftPad;
