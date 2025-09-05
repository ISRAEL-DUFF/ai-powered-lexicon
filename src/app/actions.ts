
'use server';

import { z } from 'zod';
import { lemmaConversion, type LemmaConversionOutput } from '@/ai/flows/lemma-conversion';
import { createClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import type { LexiconEntry } from '@/lib/types';

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

export async function regenerateEntry(lemma: string): Promise<{ error?: string }> {
    try {
        const validatedLemma = z.string().min(1).safeParse(lemma);
        if (!validatedLemma.success) {
            throw new Error('A valid lemma is required.');
        }

        const supabase = createClient();

        // 1. Get existing entry
        const { data: existingEntry, error: selectError } = await supabase
            .from('lexicon')
            .select('*')
            .eq('lemma', validatedLemma.data)
            .limit(1)
            .single();

        if (selectError || !existingEntry) {
            throw new Error('Could not find the existing entry to update.');
        }

        // 2. Get new AI content
        const newContent = await lemmaConversion({ word: validatedLemma.data });
        if (!newContent) {
            throw new Error('The AI failed to generate new content.');
        }

        // 3. Merge content (append and deduplicate)
        const combinedDefinition = `${existingEntry.definition}\n\n---\n\n${newContent.definition}`;
        const combinedExamples = [...new Set([...existingEntry.examples, ...newContent.examples])];
        const combinedRelated = [...new Set([...existingEntry.related, ...newContent.related])];

        // 4. Update the database
        const { error: updateError } = await supabase
            .from('lexicon')
            .update({
                definition: combinedDefinition,
                examples: combinedExamples,
                related: combinedRelated,
            })
            .eq('id', existingEntry.id);
        
        if (updateError) {
            throw new Error(`Failed to update the database: ${updateError.message}`);
        }

        // 5. Revalidate paths to refresh the UI
        revalidatePath(`/word/${encodeURIComponent(validatedLemma.data)}`);
        revalidatePath('/archive');
        revalidatePath('/'); // For dashboard stats

        return {};

    } catch (error) {
        console.error('Error in regenerateEntry:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return { error: errorMessage };
    }
}

const updateSchema = z.object({
  id: z.coerce.number(),
  definition: z.string(),
  examples: z.string().transform(val => val.split('\n').filter(Boolean)),
  related: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
});

export async function updateEntry(formData: FormData): Promise<{ error?: string }> {
    try {
        const validatedFields = updateSchema.safeParse({
            id: formData.get('id'),
            definition: formData.get('definition'),
            examples: formData.get('examples'),
            related: formData.get('related'),
        });

        if (!validatedFields.success) {
            console.error(validatedFields.error.flatten());
            throw new Error('Invalid data provided for update.');
        }
        
        const { id, definition, examples, related } = validatedFields.data;

        const supabase = createClient();
        const { error } = await supabase
            .from('lexicon')
            .update({ definition, examples, related })
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to update entry: ${error.message}`);
        }

        const { data: entry } = await supabase.from('lexicon').select('lemma').eq('id', id).single();
        if (entry) {
            revalidatePath(`/word/${encodeURIComponent(entry.lemma)}`);
            revalidatePath('/archive');
        }


        return {};

    } catch (error) {
        console.error('Error in updateEntry:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return { error: errorMessage };
    }
}

export async function findEntriesRelatedTo(word: string): Promise<{ data?: LexiconEntry[]; error?: string }> {
  try {
    const validatedWord = z.string().min(1).safeParse(word);
    if (!validatedWord.success) {
      throw new Error('A valid word is required.');
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('lexicon')
      .select('*')
      .contains('related', `["${validatedWord.data}"]`);

    if (error) {
      throw new Error(`Failed to fetch related entries: ${error.message}`);
    }

    return { data: data as LexiconEntry[] };
  } catch (error) {
    console.error('Error in findEntriesRelatedTo:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { error: errorMessage };
  }
}
