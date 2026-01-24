'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function login(formData: FormData) {
    const data = Object.fromEntries(formData)
    const validation = authSchema.safeParse(data)

    if (!validation.success) {
        redirect('/login?error=' + encodeURIComponent('Invalid email or password'))
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword(validation.data)

    if (error) {
        redirect('/login?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const data = Object.fromEntries(formData)
    const validation = authSchema.safeParse(data)

    if (!validation.success) {
        redirect('/signup?error=' + encodeURIComponent('Invalid email or password must be at least 6 characters'))
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signUp(validation.data)

    if (error) {
        redirect('/signup?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

