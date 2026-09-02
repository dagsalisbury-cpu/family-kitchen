const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://tdpbxrnlhakforfdtpcw.supabase.co";
const supabaseAnonKey = "sb_publishable_LIlCkuxKTk7vxuWVAp-ouw_yCAERrSz";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  console.log("Fetching primary state from family_state...");
  const { data, error } = await supabase
    .from('family_state')
    .select('*');
  
  if (error) {
    console.error("Error fetching:", error);
    return;
  }
  
  console.log("Supabase family_state rows count:", data.length);
  data.forEach(row => {
    console.log("ID:", row.id);
    console.log("Updated at:", row.updated_at);
    console.log("Data keys:", Object.keys(row.data || {}));
    if (row.data) {
      console.log("Recipes count:", row.data.recipes ? row.data.recipes.length : 0);
      console.log("Bundles count:", row.data.bundles ? row.data.bundles.length : 0);
      console.log("Chefs:", row.data.chefs);
      if (row.data.recipes) {
        console.log("Recipes list:", row.data.recipes.map(r => r.name));
      }
    }
  });
}

inspect();
