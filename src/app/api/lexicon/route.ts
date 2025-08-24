
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { processWord } from '@/app/actions';

const requestSchema = z.object({
    word: z.string().min(1, 'A word is required in the request body.'),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = requestSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.flatten().fieldErrors.word?.[0] || 'Invalid request body.' },
                { status: 400 }
            );
        }

        const result = await processWord(validated.data.word);

        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        console.error('[API_LEXICON_POST]', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected internal error occurred.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
