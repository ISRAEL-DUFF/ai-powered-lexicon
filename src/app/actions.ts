
'use server';

import { z } from 'zod';
import { lemmaConversion, type LemmaConversionOutput } from '@/ai/flows/lemma-conversion';

const formSchema = z.object({
  word: z.string().min(1, 'A word is required.'),
});

export interface FormState {
  data: LemmaConversionOutput | null;
  error: string | null;
  timestamp: number;
}

export async function getDictionaryEntry(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const validatedFields = formSchema.safeParse({
      word: formData.get('word'),
    });

    if (!validatedFields.success) {
      return {
        data: null,
        error: validatedFields.error.flatten().fieldErrors.word?.[0] || 'Invalid input.',
        timestamp: Date.now(),
      };
    }

    const result = await lemmaConversion({ word: validatedFields.data.word });
    
    if (!result || !result.lemma) {
        throw new Error("The AI failed to generate a valid dictionary entry. Please try a different word.");
    }

    return { data: result, error: null, timestamp: Date.now() };
  } catch (error) {
    console.error('Error in getDictionaryEntry:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
    return { data: null, error: errorMessage, timestamp: Date.now() };
  }
}
