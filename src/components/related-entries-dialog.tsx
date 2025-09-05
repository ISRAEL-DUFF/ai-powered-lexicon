
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { type LexiconEntry } from '@/lib/types';

interface RelatedEntriesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LexiconEntry[];
  sourceLemma: string;
}

export function RelatedEntriesDialog({ isOpen, onClose, entries, sourceLemma }: RelatedEntriesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Entries Related to "{sourceLemma}"</DialogTitle>
          <DialogDescription>
            The following dictionary entries list "{sourceLemma}" as a related word. Click any word to view its full entry.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4">
            {entries.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                    {entries.map((entry) => (
                    <Link href={`/word/${encodeURIComponent(entry.lemma)}`} key={entry.id} onClick={onClose}>
                        <Badge variant="secondary" className="text-base font-normal px-4 py-1.5 hover:bg-primary/20 cursor-pointer">
                        {entry.lemma}
                        </Badge>
                    </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-4 rounded-lg border-2 border-dashed">
                    <h3 className="text-lg font-medium text-muted-foreground">
                        No Usages Found
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        No other entries currently list "{sourceLemma}" as a related word.
                    </p>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
