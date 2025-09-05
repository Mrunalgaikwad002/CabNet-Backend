const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://bkngxaidnpxeponurevc.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrbmd4YWlkbnB4ZXBvbnVyZXZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzA4ODk0NCwiZXhwIjoyMDcyNjY0OTQ0fQ.R7coSe8a2JVTbmK6ZFmg52ZHrKt9-roQeXv0mwyv43k';

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
