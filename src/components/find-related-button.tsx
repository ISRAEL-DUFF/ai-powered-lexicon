
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { findEntriesRelatedTo } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Link2 } from 'lucide-react';
import type { LexiconEntry } from '@/lib/types';
import { RelatedEntriesDialog } from './related-entries-dialog';

interface FindRelatedButtonProps {
    lemma: string;
}

export function FindRelatedButton({ lemma }: FindRelatedButtonProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [relatedEntries, setRelatedEntries] = useState<LexiconEntry[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClick = () => {
        startTransition(async () => {
            const result = await findEntriesRelatedTo(lemma);
            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Search Failed',
                    description: result.error,
                });
            } else if (result.data) {
                setRelatedEntries(result.data);
                setIsModalOpen(true);
                if (result.data.length === 0) {
                     toast({
                        title: 'No Usages Found',
                        description: `No other entries list "${lemma}" as a related word.`,
                    });
                }
            }
        });
    };

    return (
        <>
            <Button onClick={handleClick} disabled={isPending} variant="outline" size="sm">
                {isPending ? <Loader2 className="animate-spin" /> : <Link2 />}
                Find Usages
            </Button>
            <RelatedEntriesDialog
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                entries={relatedEntries}
                sourceLemma={lemma}
            />
        </>
    );
}
