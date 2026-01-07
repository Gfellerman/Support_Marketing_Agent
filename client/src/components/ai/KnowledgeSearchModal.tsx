/**
 * Knowledge Search Modal Component
 * Search and insert knowledge base content into replies
 */

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  BookOpen, 
  Copy, 
  Plus,
  ExternalLink,
  Tag
} from "lucide-react";
import { useKnowledgeBase } from "@/hooks/useAI";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface KnowledgeSearchModalProps {
  onInsert?: (content: string) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export function KnowledgeSearchModal({
  onInsert,
  trigger,
  className,
}: KnowledgeSearchModalProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { search, searchResults, isSearching } = useKnowledgeBase();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.length > 2) {
        search(inputValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, search]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard');
  };

  const handleInsert = (content: string) => {
    if (onInsert) {
      onInsert(content);
      setOpen(false);
      toast.success('Content inserted');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={className}>
            <BookOpen className="h-4 w-4 mr-1" />
            Knowledge Base
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Search Knowledge Base
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles, policies, FAQs..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Results */}
          <ScrollArea className="h-[400px] pr-4">
            {isSearching ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : inputValue.length <= 2 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter at least 3 characters to search</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No articles found for "{inputValue}"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((result: any) => (
                  <div 
                    key={result.document.id} 
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium">{result.document.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(result.score * 100)}% match
                      </Badge>
                    </div>

                    {result.document.category && (
                      <div className="flex items-center gap-1 mb-2">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground capitalize">
                          {result.document.category}
                        </span>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {result.document.content}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(result.document.content)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      {onInsert && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleInsert(result.document.content)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Insert
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
