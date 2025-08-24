
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookUp, Library, MessageSquareQuote } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import React from 'react';


const iconMap: Record<string, React.ComponentType<LucideProps>> = {
    Library,
    BookUp,
    MessageSquareQuote,
};

interface Stat {
    title: string;
    value: string | number;
    iconName: keyof typeof iconMap;
    description: string;
}

interface StatCardsProps {
    stats: Stat[];
}

export function StatCards({ stats }: StatCardsProps) {
    if (!stats || stats.length === 0) {
        return (
             <div className="text-center py-16 px-4 rounded-lg border-2 border-dashed">
                <h3 className="text-lg font-medium text-muted-foreground">
                    No statistics available yet.
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Generate some dictionary entries to see statistics here.
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => {
                const Icon = iconMap[stat.iconName];
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold truncate" title={String(stat.value)}>{stat.value}</div>
                            <p className="text-xs text-muted-foreground pt-1">{stat.description}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
