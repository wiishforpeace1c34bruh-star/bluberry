import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationControlsProps) {
    if (totalPages <= 1) return null;

    // Calculate visible page numbers
    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            range.unshift(-1); // Ellipsis
        }
        if (currentPage + delta < totalPages - 1) {
            range.push(-1); // Ellipsis
        }

        range.unshift(1);
        if (totalPages !== 1) {
            range.push(totalPages);
        }

        return range;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8 animate-fade-in">
            <div className="flex items-center p-2 rounded-2xl bg-secondary/30 backdrop-blur-md border border-white/5 shadow-lg">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="h-9 w-9 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white transition-all disabled:opacity-30"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 w-9 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white transition-all disabled:opacity-30 mr-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 mx-2">
                    {getVisiblePages().map((page, index) => (
                        page === -1 ? (
                            <span key={`ellipsis-${index}`} className="text-muted-foreground/50 px-2 select-none">...</span>
                        ) : (
                            <Button
                                key={page}
                                variant="ghost"
                                size="icon"
                                onClick={() => onPageChange(page)}
                                className={cn(
                                    "h-9 w-9 rounded-xl font-mono text-sm transition-all duration-300",
                                    currentPage === page
                                        ? "bg-primary text-primary-foreground shadow-glow scale-110 font-bold"
                                        : "hover:bg-white/10 text-muted-foreground hover:text-white"
                                )}
                            >
                                {page}
                            </Button>
                        )
                    ))}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white transition-all disabled:opacity-30 ml-2"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white transition-all disabled:opacity-30"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
