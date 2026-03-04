"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCmdK } from "@/hooks/use-cmd-k";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import { SearchResultsDisplay, type SearchResults } from "./search-results";

export function CommandDialog() {
  const { isOpen, setIsOpen } = useCmdK();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    users: [],
    roles: [],
    permissions: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Reset query when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults({ users: [], roles: [], permissions: [] });
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults({ users: [], roles: [], permissions: [] });
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
    },
    [setIsOpen]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <div className="flex items-center border-b px-4">
          <HugeiconsIcon icon={Search01Icon} className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search users, roles, permissions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0"
            autoFocus
          />
        </div>
        <SearchResultsDisplay results={results} isLoading={isLoading} />
        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>↵ select esc close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
