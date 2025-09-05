
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check } from 'lucide-react';

interface CopyWordsButtonProps {
    lemma: string;
    related: string[];
}

export function CopyWordsButton({ lemma, related }: CopyWordsButtonProps) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        const textToCopy = [lemma, ...related].join(',');
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            toast({
                title: 'Copied to Clipboard!',
                description: `Copied: ${textToCopy.substring(0, 50)}...`,
            });
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            toast({
                variant: 'destructive',
                title: 'Copy Failed',
                description: 'Could not copy words to clipboard.',
            });
        });
    };

    return (
        <Button onClick={handleCopy} variant="outline" size="sm" className="h-9 w-9 p-0">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copy words</span>
        </Button>
    );
}
