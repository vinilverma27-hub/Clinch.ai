const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const brand = { id: '3df87ca6-bfba-4061-9f93-1b77dbd3eb6f' }; // Using a dummy / test id won't work easily due to constraints. Let's just create a dummy influencer insertion.
  const influencerData = {
    external_id: 'test_ig',
    platform: 'instagram',
    handle: '@test',
    full_name: 'Test',
  };
  const { data: savedInfluencer, error: infError } = await supabase
    .from('influencers')
    .upsert(influencerData, { onConflict: 'external_id,platform' })
    .select('id')
    .single();

  if (infError) {
    console.error("Influencer insert error:", infError);
    return;
  }
  console.log("Inserted influencer", savedInfluencer);
}
testInsert();
