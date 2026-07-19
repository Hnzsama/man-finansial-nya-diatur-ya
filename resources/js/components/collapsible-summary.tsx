import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { IconChevronDown, IconChevronUp, IconChartPie } from '@tabler/icons-react';

interface CollapsibleSummaryProps {
  children: React.ReactNode;
}

export function CollapsibleSummary({ children }: CollapsibleSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full border border-border/40 rounded-xl p-3 bg-card/45 backdrop-blur-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconChartPie className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Summary & Statistics</span>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs gap-1 hover:bg-muted/80">
            <span>{isOpen ? 'Hide' : 'Show'}</span>
            {isOpen ? <IconChevronUp className="h-3.5 w-3.5" /> : <IconChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="transition-all data-[state=closed]:hidden data-[state=open]:block">
        <div className="pt-3">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
