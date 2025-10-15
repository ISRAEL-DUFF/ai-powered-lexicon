'use server';
/**
 * @fileOverview Converts an inflected Ancient Greek word to its lemma and provides a dictionary entry in Ancient Greek.
 *
 * - lemmaConversion - A function that handles the conversion and dictionary entry generation.
 * - LemmaConversionInput - The input type for the lemmaConversion function.
 * - LemmaConversionOutput - The return type for the lemmaConversion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LemmaConversionInputSchema = z.object({
  word: z.string().describe('The Ancient Greek word to convert to its lemma.'),
});
export type LemmaConversionInput = z.infer<typeof LemmaConversionInputSchema>;

const LemmaConversionOutputSchema = z.object({
  lemma: z.string().describe('The dictionary form of the word.'),
  part_of_speech: z.string().describe('The part of speech in Greek (e.g., ὁ, ου / ῥῆμα / ἐπίθετον).'),
  definition: z.string().describe('The definition written only in Greek, using synonyms, periphrases, or explanations.'),
  examples: z.array(z.string()).describe('Short Ancient Greek example sentences.'),
  related: z.array(z.string()).describe('List of related Greek words.'),
});
export type LemmaConversionOutput = z.infer<typeof LemmaConversionOutputSchema>;

export async function lemmaConversion(input: LemmaConversionInput): Promise<LemmaConversionOutput> {
  return lemmaConversionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'lemmaConversionPrompt',
  input: {schema: LemmaConversionInputSchema},
  output: {schema: LemmaConversionOutputSchema},
  prompt: `You are an expert in Ancient Greek lexicography.

You will receive an Ancient Greek word, which may be an inflected form. Your task is to:
1.  Reduce the word to its lemma (dictionary form).
2.  Generate a dictionary entry for the lemma **entirely in Ancient Greek**, with no English.
3.  Provide the dictionary entry in the following JSON structure:

  \`\`\`json
  {
    "lemma": "<dictionary form>",
    "part_of_speech": "<Greek-style grammar label, e.g., ὁ, ου / ῥῆμα / ἐπίθετον>",
    "definition": "<definition written only in Greek, using synonyms, periphrases, or explanations, no English>",
    "examples": [
      "<short Ancient Greek example sentence>",
      "<another Ancient Greek example sentence>",
      "<another Ancient Greek example sentence>",
      "<another Ancient Greek example sentence>",
      "<another Ancient Greek example sentence>"
    ],
    "related": ["<list of related Greek words>"]
  }
  \`\`\`

### Guidelines:

*   Do not include English translations.
*   Keep everything in Ancient Greek style.
*   The examples should be simple, grammatically correct Ancient Greek sentences that demonstrate usage.
*   The related field should contain synonyms, cognates, or words of the same root.
*   Ensure the JSON is always valid and strictly follows the given structure.


Word: {{{word}}}

JSON Output:
`, // Ensure the prompt ends with "JSON Output:\n"
});

const lemmaConversionFlow = ai.defineFlow(
  {
    name: 'lemmaConversionFlow',
    inputSchema: LemmaConversionInputSchema,
    outputSchema: LemmaConversionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
