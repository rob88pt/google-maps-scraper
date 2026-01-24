'use client'

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Rocket, Table2, Map, LogOut, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signout } from "@/app/auth/actions"

export function AppHeader() {
    const pathname = usePathname()

    const getActiveTab = () => {
        if (pathname.startsWith('/leads')) return 'leads'
        if (pathname.startsWith('/map')) return 'map'
        return 'jobs'
    }

    return (
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-bold text-white">
                        <span className="text-blue-500">Leads</span> Command Center
                    </h1>

                    <nav>
                        <Tabs value={getActiveTab()}>
                            <TabsList className="bg-slate-800/50">
                                <Link href="/">
                                    <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-600 gap-2">
                                        <Rocket className="h-4 w-4" />
                                        Jobs
                                    </TabsTrigger>
                                </Link>
                                <Link href="/leads">
                                    <TabsTrigger value="leads" className="data-[state=active]:bg-blue-600 gap-2">
                                        <Table2 className="h-4 w-4" />
                                        Leads
                                    </TabsTrigger>
                                </Link>
                                <Link href="/map">
                                    <TabsTrigger value="map" className="data-[state=active]:bg-blue-600 gap-2">
                                        <Map className="h-4 w-4" />
                                        Map
                                    </TabsTrigger>
                                </Link>
                            </TabsList>
                        </Tabs>
                    </nav>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-700 hover:bg-slate-600">
                            <User className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                        <form action={signout}>
                            <DropdownMenuItem asChild>
                                <button type="submit" className="w-full cursor-pointer text-red-400">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </button>
                            </DropdownMenuItem>
                        </form>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
