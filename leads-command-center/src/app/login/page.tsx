'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

const errorMessages: Record<string, string> = {
    'Invalid email or password': 'The email or password you entered is incorrect.',
    'Email not confirmed': 'Please check your email and confirm your account before logging in.',
    'User not found': 'No account found with this email address.',
    'Too many requests': 'Too many login attempts. Please try again later.',
}

function getErrorMessage(error: string | null): string | null {
    if (!error) return null
    return errorMessages[error] || error
}

function ErrorAlert() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const errorMessage = getErrorMessage(error)

    if (!errorMessage) return null

    return (
        <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account.
                    </CardDescription>
                </CardHeader>
                <form action={login}>
                    <CardContent className="grid gap-4">
                        <Suspense fallback={null}>
                            <ErrorAlert />
                        </Suspense>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full">Sign in</Button>
                        <div className="text-center text-sm">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="underline">
                                Sign up
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
