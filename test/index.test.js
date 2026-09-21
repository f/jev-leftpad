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

import leftPad, { leftPad as namedLeftPad } from '../src/index.js';

function answer(selectedChoice) {
  mocks.systemOne.mockResolvedValue({
    model: 'jev-latest',
    answers: {
      padding: {
        type: 'choice',
        choice: selectedChoice,
        confidence: 0.99,
        probabilities: { [selectedChoice]: 0.99 },
      },
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
    expect(Object.keys(request.questions.padding.criteria)).toHaveLength(12);
  });

  it('supports 22 spaces for @akwodkiewicz', async () => {
    answer('space_22');
    await expect(leftPad('jev', 25)).resolves.toBe(`${' '.repeat(22)}jev`);
  });

  it.each([11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])(
    'still cannot pad %s spaces',
    async (spaces) => {
      await leftPad('jev', spaces + 3);
      const { criteria } = mocks.systemOne.mock.calls[0][0].questions.padding;
      expect(criteria).not.toHaveProperty(`space_${spaces}`);
    },
  );

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
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
