
'use server';

import { z } from 'zod';
import { lemmaConversion, type LemmaConversionOutput } from '@/ai/flows/lemma-conversion';
import { createClient } from '@/lib/supabase';

const formSchema = z.object({
  word: z.string().min(1, 'A word is required.'),
});

export interface FormState {
  data: LemmaConversionOutput | null;
  error: string | null;
  timestamp: number;
}

/**
 * Processes a word to get its dictionary entry, either from the database or by generating a new one.
 * @param word The word to process.
 * @returns The lexicon output.
 */
export async function processWord(word: string): Promise<LemmaConversionOutput> {
    const validatedWord = z.string().min(1).safeParse(word);
    if (!validatedWord.success) {
        throw new Error('A valid word is required.');
    }

    const supabase = createClient();
    const submittedWord = validatedWord.data.trim();

    // Check if the word already exists
    const { data: existingEntry, error: selectError } = await supabase
      .from('lexicon')
      .select('*')
      .or(`word.eq.${submittedWord},lemma.eq.${submittedWord}`)
      .limit(1)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // Ignore 'single row not found'
        throw new Error(selectError.message);
    }
    
    if (existingEntry) {
      return {
          lemma: existingEntry.lemma,
          part_of_speech: existingEntry.part_of_speech,
          definition: existingEntry.definition,
          examples: existingEntry.examples,
          related: existingEntry.related,
      };
    }

    // If not, call the AI
    const result = await lemmaConversion({ word: submittedWord });
    
    if (!result || !result.lemma) {
        throw new Error("The AI failed to generate a valid dictionary entry. Please try a different word.");
    }
    
    // Save the new entry to the database
    const { error: insertError } = await supabase.from('lexicon').insert({
        word: submittedWord,
        lemma: result.lemma,
        part_of_speech: result.part_of_speech,
        definition: result.definition,
        examples: result.examples,
        related: result.related,
    });

    if (insertError) {
        // Log the error but don't block the user from seeing the result
        console.error('Supabase insert error:', insertError.message);
    }

    return result;
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
    
    const result = await processWord(validatedFields.data.word);

    return { data: result, error: null, timestamp: Date.now() };
  } catch (error) {
    console.error('Error in getDictionaryEntry:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
    return { data: null, error: errorMessage, timestamp: Date.now() };
  }
}
