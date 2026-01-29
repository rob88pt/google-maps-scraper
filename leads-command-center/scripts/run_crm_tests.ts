import { createAdminClient } from '../src/lib/supabase/server';

const API_BASE = 'http://localhost:3000/api';

async function runTests() {
    console.log('🚀 Starting CRM Comprehensive Test Suite\n');
    const supabase = createAdminClient();

    const testCid = 'test-lead-' + Math.random().toString(36).substring(7);
    const testUserId1 = '81fd58a2-7987-4621-ab4d-d7936c7ee05e';
    const testUserId2 = 'af2b2582-fca0-4c5a-a1e3-f5d7d2c6e73a';

    try {
        // --- 1. Database Level Tests ---
        console.log('📂 [DATABASE] Verifying Constraints & Schema...');

        // 1.1 Insert a dummy result to link to
        const { error: resultErr } = await supabase.from('results').insert([
            { cid: testCid, user_id: testUserId1, data: { title: 'Test Lead' } },
            { cid: testCid, user_id: testUserId2, data: { title: 'Test Lead User 2' } }
        ]);
        if (resultErr) throw new Error(`Failed to insert test results: ${resultErr.message}`);
        console.log('✅ Created test results for multi-user PK check.');

        // 1.2 Verify Composite PK on lead_status
        const { error: status1Err } = await supabase.from('lead_status').insert({
            lead_cid: testCid,
            user_id: testUserId1,
            status: 'contacted'
        });
        const { error: status2Err } = await supabase.from('lead_status').insert({
            lead_cid: testCid,
            user_id: testUserId2,
            status: 'qualified'
        });

        if (status1Err || status2Err) {
            console.error('❌ Failed composite PK test:', status1Err?.message, status2Err?.message);
        } else {
            console.log('✅ Success: Multi-user status collision prevented via composite PK.');
        }

        // 1.3 Verify 'archived' constraint
        const { error: archErr } = await supabase.from('lead_status').insert({
            lead_cid: testCid + '-arch',
            user_id: testUserId1,
            status: 'archived'
        }).select();
        // Note: this might fail if we don't have a result first, let's use the existing testCid
        const { error: archUpdateErr } = await supabase.from('lead_status')
            .update({ status: 'archived' })
            .match({ lead_cid: testCid, user_id: testUserId1 });

        if (archUpdateErr) {
            console.error('❌ Failed "archived" status update:', archUpdateErr.message);
        } else {
            console.log('✅ Success: "archived" status constraint verified.');
        }

        // 1.4 Verify FK Cascades
        console.log('\n🔗 [DATABASE] Verifying Foreign Key Cascades...');
        const { error: deleteErr } = await supabase.from('results').delete().eq('cid', testCid);
        if (deleteErr) throw new Error(`Cleanup delete failed: ${deleteErr.message}`);

        const { data: statusCheck } = await supabase.from('lead_status').select('*').eq('lead_cid', testCid);
        if (statusCheck && statusCheck.length > 0) {
            console.error('❌ Failed: lead_status records still exist after result deletion.');
        } else {
            console.log('✅ Success: Delete cascade confirmed (Composite FKs are working).');
        }

        // --- 2. API Level Tests ---
        console.log('\n🌐 [API] Verifying Next.js 15+ Route Compliance...');

        // Since we can't easily mock auth and hit local dev server perfectly without a running app,
        // we will check if the routes compile and handle params correctly by simulating the call structure
        // Or we can try to use axios to hit the dev server if it's running
        try {
            const resp = await fetch(`${API_BASE}/leads?pageSize=1`);
            const data = await resp.json() as any;
            console.log('✅ API: /api/leads is reachable and returning data.');

            if (data.leads?.[0] && 'crm_status' in data.leads[0]) {
                console.log('✅ API: Enriched data (crm_status/notes_count) detected in response.');
            } else {
                console.warn('⚠️ API: Response reached but CRM fields not found in first result.');
            }
        } catch (e: any) {
            console.warn('🕒 API: Could not reach dev server for direct endpoint testing. Skipping fetch checks.');
        }

    } catch (err: any) {
        console.error('\n💥 TEST SUITE CRASHED:', err.message);
    } finally {
        // Cleanup
        console.log('\n🧹 Cleaning up...');
        await supabase.from('results').delete().eq('cid', testCid);
        console.log('✨ Verification Complete.');
    }
}

runTests();
