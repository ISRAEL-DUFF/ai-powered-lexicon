
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { regenerateEntry } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

interface RegenerateButtonProps {
    lemma: string;
}

export function RegenerateButton({ lemma }: RegenerateButtonProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleClick = () => {
        startTransition(async () => {
            const result = await regenerateEntry(lemma);
            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Regeneration Failed',
                    description: result.error,
                });
            } else {
                toast({
                    title: 'Regeneration Successful',
                    description: `New content has been added for "${lemma}".`,
                });
            }
        });
    };

    return (
        <Button onClick={handleClick} disabled={isPending}>
            {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="mr-2 h-4 w-4" />
            )}
            Regenerate
        </Button>
    );
}
