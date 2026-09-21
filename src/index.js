import { choice, TypeSafeClient } from '@typesafe-ai/sdk';

export async function leftPad(value, targetLength) {
  if (!Number.isSafeInteger(targetLength) || targetLength < 0) {
    throw new RangeError('targetLength must be a non-negative safe integer');
  }

  const client = new TypeSafeClient({ retry: { maxRetries: 0 } });
  const { answers } = await client.systemOne({
    model: 'jev-latest',
    state: { value, targetLength },
    questions: {
      padding: choice(
        'How many spaces are needed before value to reach targetLength?',
        {
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
          space_10: '10 spaces are needed',
          space_22: '22 spaces are needed (for @akwodkiewicz)'
        },
      ),
    },
  });

  const match = /^space_(\d+)$/u.exec(answers.padding.choice);
  const selectedLength = Number(match?.[1]);

  const padding = ' '.repeat(selectedLength);

  return padding + value;
}

export default leftPad;
