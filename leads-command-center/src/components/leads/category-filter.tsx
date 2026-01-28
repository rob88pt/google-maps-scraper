import * as React from 'react'
import { ChevronDown, Tag, Loader2, Search, X } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
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
    const [searchQuery, setSearchQuery] = React.useState('')

    const filteredCategories = React.useMemo(() => {
        if (!searchQuery.trim()) return categories

        const normalize = (str: string) =>
            str.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

        const query = normalize(searchQuery)

        return categories.filter(cat =>
            normalize(cat.category).includes(query)
        )
    }, [categories, searchQuery])

    return (
        <DropdownMenu onOpenChange={(open) => {
            if (!open) setSearchQuery('')
        }}>
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
            <DropdownMenuContent align="start" className="w-[280px] bg-slate-900 border-slate-700 p-0 overflow-hidden shadow-xl">
                <DropdownMenuLabel className="px-3 pt-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Filter by Category
                </DropdownMenuLabel>

                <div className="px-3 pb-2" onClick={(e) => e.stopPropagation()}>
                    <div className="relative group">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <Input
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="h-8 pl-8 pr-8 bg-slate-950 border-slate-800 text-xs text-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500/50"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <DropdownMenuSeparator className="bg-slate-800 m-0" />

                <DropdownMenuItem
                    className="cursor-pointer mx-1 my-1 px-2 py-1.5 focus:bg-slate-800 focus:text-slate-100"
                    onClick={() => onCategoryChange(null)}
                >
                    <span className="text-sm">All Categories</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-800 m-0" />

                <ScrollArea className="h-[300px]">
                    <div className="p-1">
                        {filteredCategories.length === 0 && (
                            <div className="px-2 py-8 text-sm text-slate-500 text-center">
                                {categories.length === 0 && !isLoading ? 'No categories found' : 'No matching categories'}
                            </div>
                        )}

                        {filteredCategories.map((cat) => (
                            <DropdownMenuItem
                                key={cat.category}
                                className="cursor-pointer flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm focus:bg-slate-800 focus:text-slate-100 group"
                                onClick={() => onCategoryChange(cat.category)}
                            >
                                <span className="truncate flex-1 text-sm">{cat.category}</span>
                                <Badge variant="secondary" className="bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-focus:bg-slate-700 h-5 px-1.5 text-[10px] font-medium transition-colors">
                                    {cat.count}
                                </Badge>
                            </DropdownMenuItem>
                        ))}
                    </div>
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
