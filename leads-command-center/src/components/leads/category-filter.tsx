import * as React from 'react'
import { ChevronDown, Tag, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { CategoryCount } from '@/lib/hooks/use-categories'

interface CategoryFilterProps {
    categories: CategoryCount[]
    selectedCategory: string | null
    onCategoryChange: (category: string | null) => void
    isLoading?: boolean
}

export function CategoryFilter({
    categories,
    selectedCategory,
    onCategoryChange,
    isLoading = false
}: CategoryFilterProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-slate-700 bg-transparent min-w-[140px] justify-between">
                    <div className="flex items-center gap-2 truncate">
                        <Tag className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate">
                            {selectedCategory || 'All Categories'}
                        </span>
                    </div>
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[280px] bg-slate-900 border-slate-700">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />

                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onCategoryChange(null)}
                >
                    All Categories
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-700" />

                <ScrollArea className="h-[300px]">
                    {categories.length === 0 && !isLoading && (
                        <div className="px-2 py-4 text-sm text-slate-500 text-center">
                            No categories found
                        </div>
                    )}

                    {categories.map((cat) => (
                        <DropdownMenuItem
                            key={cat.category}
                            className="cursor-pointer flex items-center justify-between gap-2"
                            onClick={() => onCategoryChange(cat.category)}
                        >
                            <span className="truncate flex-1">{cat.category}</span>
                            <Badge variant="secondary" className="bg-slate-800 text-slate-400 group-hover:bg-slate-700">
                                {cat.count}
                            </Badge>
                        </DropdownMenuItem>
                    ))}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
