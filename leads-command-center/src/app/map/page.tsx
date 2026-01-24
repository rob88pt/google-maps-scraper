import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function MapPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <AppHeader />

            <main className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Map View</h2>
                        <p className="text-slate-400">Visualize leads by geographic location</p>
                    </div>
                </div>

                {/* Map placeholder */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Interactive Map</CardTitle>
                        <CardDescription>Click markers to view lead details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-[600px] text-slate-500 bg-slate-800/50 rounded-lg">
                            Map will be rendered here with MapLibre GL JS
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
