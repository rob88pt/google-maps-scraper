import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables if not already set (e.g., when running via ts-node directly)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
        dotenv.config({ path: '.env.local' })
    } catch (e) {
        console.warn('Could not load .env.local')
    }
}

async function verifyArchiveSystem() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('--- Verifying Archive System ---')

    // 1. Get a test lead
    const { data: leads, error: leadError } = await supabase
        .from('results')
        .select('id, data->cid')
        .limit(1)

    if (leadError || !leads || leads.length === 0) {
        console.error('Failed to get test lead:', leadError)
        return
    }

    const leadId = leads[0].id
    const leadCid = leads[0].cid

    console.log(`Testing with lead ID: ${leadId}, CID: ${leadCid}`)

    // 2. Archive the lead (Simulate API call side effect)
    console.log('Archiving lead...')
    const { error: archiveError } = await supabase
        .from('lead_status')
        .upsert({
            user_id: '00000000-0000-0000-0000-000000000000', // System user for test
            lead_cid: leadCid,
            status: 'archived'
        }, { onConflict: 'user_id,lead_cid' })

    if (archiveError) {
        console.error('Archive failed:', archiveError)
        return
    }

    // 3. Verify status
    const { data: statusAfter, error: statusError } = await supabase
        .from('lead_status')
        .select('status')
        .eq('lead_cid', leadCid)
        .single()

    if (statusError || statusAfter?.status !== 'archived') {
        console.error('Status verification failed:', statusError, statusAfter)
        return
    }
    console.log('✅ Lead successfully archived (status in DB)')

    // 4. Unarchive the lead
    console.log('Unarchiving lead...')
    const { error: unarchiveError } = await supabase
        .from('lead_status')
        .upsert({
            user_id: '00000000-0000-0000-0000-000000000000',
            lead_cid: leadCid,
            status: 'new'
        }, { onConflict: 'user_id,lead_cid' })

    if (unarchiveError) {
        console.error('Unarchive failed:', unarchiveError)
        return
    }

    // 5. Verify status again
    const { data: statusFinal, error: statusFinalError } = await supabase
        .from('lead_status')
        .select('status')
        .eq('lead_cid', leadCid)
        .single()

    if (statusFinalError || statusFinal?.status !== 'new') {
        console.error('Final status verification failed:', statusFinalError, statusFinal)
        return
    }
    console.log('✅ Lead successfully unarchived')

    console.log('--- Verification Complete ---')
}

verifyArchiveSystem()
