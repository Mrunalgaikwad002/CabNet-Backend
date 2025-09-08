const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env file contains SUPABASE_URL and SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const connectDB = async () => {
  try {
    // Test connection by trying to fetch from a table
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('⚠️  Supabase connection test failed, but continuing...');
      console.log('Error:', error.message);
    } else {
      console.log('🗄️  Supabase Connected successfully');
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, supabase };
