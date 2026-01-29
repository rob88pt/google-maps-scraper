import { createAdminClient } from '../src/lib/supabase/server';

async function verify() {
    console.log('--- CRM Phase 1 Verification ---');
    const supabase = createAdminClient();

    // 1. Verify 'archived' status constraint
    console.log('\n1. Verifying "archived" status constraint...');
    const testCid = 'test-lead-cid-' + Date.now();

    const { error: statusError } = await supabase
        .from('lead_status')
        .insert({
            lead_cid: testCid,
            status: 'archived',
            updated_at: new Date().toISOString()
        });

    if (statusError) {
        console.error('FAILED: Could not insert "archived" status:', statusError.message);
    } else {
        console.log('SUCCESS: "archived" status is accepted.');
    }

    // 2. Verify user_id persistence in notes
    console.log('\n2. Verifying user_id persistence in notes...');
    // We'll use a dummy user_id if we don't have a real one, or just pick one from the system
    const { data: userData } = await supabase.auth.admin.listUsers();
    const testUserId = userData.users[0]?.id;

    if (!testUserId) {
        console.warn('SKIPPING: No users found in Supabase to test user_id persistence.');
    } else {
        const { error: noteError } = await supabase
            .from('lead_notes')
            .insert({
                lead_cid: testCid,
                content: 'Verification test note',
                user_id: testUserId
            });

        if (noteError) {
            console.error('FAILED: Could not insert note with user_id:', noteError.message);
        } else {
            const { data: createdNote, error: fetchError } = await supabase
                .from('lead_notes')
                .select('user_id')
                .eq('lead_cid', testCid)
                .single();

            if (fetchError) {
                console.error('FAILED: Could not fetch created note:', fetchError.message);
            } else if (createdNote.user_id !== testUserId) {
                console.error(`FAILED: user_id mismatch. Expected ${testUserId}, got ${createdNote.user_id}`);
            } else {
                console.log('SUCCESS: Note persisted with correct user_id.');
            }
        }
    }

    // 3. Verify enriched leads query
    console.log('\n3. Verifying enriched leads query structure...');
    const { data: results, error: queryError } = await supabase
        .from('results')
        .select(`
            id, 
            data, 
            lead_status(status),
            lead_notes(count)
        `)
        .limit(1);

    if (queryError) {
        console.error('FAILED: Query join failed:', queryError.message);
    } else {
        console.log('SUCCESS: Query join executed.');
        const row = results?.[0] as any;
        console.log('Sample Row Structure:', JSON.stringify({
            id: row.id,
            lead_status: row.lead_status,
            lead_notes: row.lead_notes
        }, null, 2));
    }

    // Cleanup
    console.log('\nCleaning up test data...');
    await supabase.from('lead_notes').delete().eq('lead_cid', testCid);
    await supabase.from('lead_status').delete().eq('lead_cid', testCid);
    console.log('Done.');
}

verify().catch(console.error);
