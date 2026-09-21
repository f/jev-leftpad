import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clientConstructor: vi.fn(),
  systemOne: vi.fn(),
}));

vi.mock('@typesafe-ai/sdk', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    TypeSafeClient: class MockTypeSafeClient {
      constructor(config) {
        mocks.clientConstructor(config);
      }

      systemOne = mocks.systemOne;
    },
  };
});

import leftPad, {
  complex,
  derivative,
  integral,
  leftPad as namedLeftPad,
  limit,
  sqrt,
  sum,
} from '../src/index.js';

function answer(selectedChoice, { halfSpace = 0.01, line = 'line_0', rightToLeft = 0.01 } = {}) {
  mocks.systemOne.mockResolvedValue({
    model: 'jev-latest',
    answers: {
      padding: {
        type: 'choice',
        choice: selectedChoice,
        confidence: 0.99,
        probabilities: { [selectedChoice]: 0.99 },
      },
      halfSpace: { type: 'noul', noul: halfSpace },
      lines: {
        type: 'choice',
        choice: line,
        confidence: 0.99,
        probabilities: { [line]: 0.99 },
      },
      rightToLeft: { type: 'noul', noul: rightToLeft },
    },
    usage: { input_tokens: 1, output_tokens: 0 },
  });
}

describe('leftPad', () => {
  beforeEach(() => {
    mocks.clientConstructor.mockReset();
    mocks.systemOne.mockReset();
    answer('space_5');
  });

  it('exports the same function as default and named', () => {
    expect(leftPad).toBe(namedLeftPad);
  });

  it('uses the number of spaces chosen by Jev', async () => {
    await expect(leftPad('jev', 8)).resolves.toBe('     jev');
  });

  it('trusts Jev when it chooses the wrong amount', async () => {
    answer('space_2');
    await expect(leftPad('jev', 8)).resolves.toBe('  jev');
  });

  it('supports zero spaces', async () => {
    answer('space_0');
    await expect(leftPad('jev', 2)).resolves.toBe('jev');
  });

  it('sends literal Choice criteria', async () => {
    await leftPad('jev', 8);

    expect(mocks.clientConstructor).toHaveBeenCalledWith({ retry: { maxRetries: 0 } });
    expect(mocks.systemOne).toHaveBeenCalledTimes(1);
    const request = mocks.systemOne.mock.calls[0][0];
    expect(request.state).toEqual({ value: 'jev', targetLength: 8 });
    expect(request.questions.padding.criteria).toMatchObject({
      space_0: '0 spaces are needed',
      space_1: '1 space is needed',
      space_2: '2 spaces are needed',
    });
    expect(Object.keys(request.questions.padding.criteria)).toHaveLength(21);
  });

  it('supports negative numbers by padding on the other side', async () => {
    answer('space_minus_5');
    await expect(leftPad('jev', -8)).resolves.toBe('jev     ');
  });

  it('no longer requires the ! workaround from issue #3', async () => {
    answer('space_minus_5');
    await expect(leftPad('jev', -8)).resolves.not.toBe(false);
  });

  it('pads half a space for fractional numbers', async () => {
    answer('space_4', { halfSpace: 0.97 });
    await expect(leftPad('jev', 7.5)).resolves.toBe('    \u2009jev');
  });

  it('pads imaginary numbers vertically', async () => {
    answer('space_5', { line: 'line_2' });
    await expect(leftPad('jev', complex(8, 2))).resolves.toBe('\n\n     jev');
    expect(mocks.systemOne.mock.calls[0][0].state.targetLength).toEqual({ re: 8, im: 2 });
  });

  it('lets Jev flip the side for right-to-left text', async () => {
    answer('space_2', { rightToLeft: 0.93 });
    await expect(leftPad('جيف', 5)).resolves.toBe('جيف  ');
  });

  it('flips twice for negative right-to-left text', async () => {
    answer('space_minus_2', { rightToLeft: 0.93 });
    await expect(leftPad('جيف', -5)).resolves.toBe('  جيف');
  });

  it.each([
    ['sqrt', sqrt(64), '√64'],
    ['integral', integral('x', 0, 4), '∫_0^4 x dx'],
    ['derivative', derivative('x^2 + 4x', 2), 'd/dx (x^2 + 4x) at x = 2'],
    ['limit', limit('(8x + 1) / x', '∞'), 'lim x→∞ (8x + 1) / x'],
    ['sum', sum('4 / 2^n', 0, '∞'), 'Σ_{n=0}^∞ 4 / 2^n'],
  ])('sends %s to Jev and trusts the math', async (_name, targetLength, expected) => {
    expect(targetLength).toBe(expected);
    await expect(leftPad('jev', targetLength)).resolves.toBe('     jev');
    expect(mocks.systemOne.mock.calls[0][0].state.targetLength).toBe(expected);
  });

  it('asks all four questions in one request', async () => {
    await leftPad('jev', 8);
    const { questions } = mocks.systemOne.mock.calls[0][0];
    expect(Object.keys(questions)).toEqual(['padding', 'halfSpace', 'lines', 'rightToLeft']);
    expect(Object.keys(questions.lines.criteria)).toHaveLength(11);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, '', '   ', null, undefined, 8n, complex(8, Number.NaN)])(
    'rejects invalid target length %s before making a request',
    async (targetLength) => {
      await expect(leftPad('jev', targetLength)).rejects.toThrow(RangeError);
      expect(mocks.systemOne).not.toHaveBeenCalled();
    },
  );

  it('passes TypeSafe API errors through', async () => {
    mocks.systemOne.mockRejectedValue(new Error('TypeSafe is having a day'));
    await expect(leftPad('jev', 8)).rejects.toThrow('TypeSafe is having a day');
  });
});
