const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

// Load environment variables from backend directory
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
dotenv.config({ path: path.join(__dirname, '../.env') });

const migrationFilePath = path.resolve(__dirname, '../../supabase/migrations/001_initial_schema.sql');

async function createConnectedClient(connectionString, candidates = []) {
  const allTargets = connectionString ? [{ name: 'Direct/Configured', url: connectionString }, ...candidates] : candidates;
  
  for (const target of allTargets) {
    console.log(`🔌 Attempting connection via ${target.name}...`);
    const client = new Client({
      connectionString: target.url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    try {
      await client.connect();
      return { client, targetName: target.name };
    } catch (err) {
      console.log(`   ↳ Failed: ${err.message}`);
    }
  }
  return null;
}

async function runMigration() {
  console.log('🚀 Starting Supabase Database Migration Runner...');

  if (!fs.existsSync(migrationFilePath)) {
    console.error(`❌ Migration file not found at: ${migrationFilePath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationFilePath, 'utf8');
  console.log('📖 Read migration file successfully.');

  let connectionString = process.env.DATABASE_URL;
  const candidates = [];

  const supabaseUrl = process.env.SUPABASE_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (supabaseUrl && supabaseUrl !== 'https://your-supabase-project.supabase.co' && dbPassword) {
    const match = supabaseUrl.match(/https:\/\/(.*)\.supabase\.co/);
    if (match && match[1]) {
      const projectRef = match[1];
      if (!connectionString) {
        connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:6543/postgres?sslmode=require`;
      }
      
      const regions = [
        'ap-south-1', 'ap-southeast-1', 'us-east-1', 'us-west-1', 
        'eu-central-1', 'eu-west-1', 'eu-west-2', 'ap-northeast-1', 
        'ap-northeast-2', 'ap-southeast-2', 'sa-east-1', 'ca-central-1'
      ];
      
      for (const region of regions) {
        for (const port of [6543, 5432]) {
          candidates.push({
            name: `Supabase IPv4 Pooler (${region}:${port})`,
            url: `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-${region}.pooler.supabase.com:${port}/postgres?sslmode=require`
          });
        }
      }
    }
  }

  if (!connectionString && candidates.length === 0) {
    console.error('\n❌ Error: Missing database connection credentials.');
    console.log('\nPlease add one of the following to your "server/.env" file:\n');
    console.log('DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?sslmode=require\n');
    console.log('SUPABASE_DB_PASSWORD=your-database-password\n');
    process.exit(1);
  }

  const connectionResult = await createConnectedClient(connectionString, candidates);

  if (!connectionResult) {
    console.error('\n❌ Migration execution failed: Unable to connect to Supabase PostgreSQL database using any endpoint.');
    process.exit(1);
  }

  const { client, targetName } = connectionResult;

  try {
    console.log(`✅ Connected successfully via [${targetName}]. Applying schema migrations...`);

    // Run the migration SQL script
    await client.query(sql);

    console.log('\n🎉 Migration applied successfully!');
    console.log('✔ Initial tables created');
    console.log('✔ Indexes generated');
    console.log('✔ Row Level Security (RLS) policies configured');
    console.log('✔ Seed demo data successfully loaded');
  } catch (error) {
    console.error('\n❌ Migration execution failed:', error.message);
  } finally {
    await client.end();
  }
}

runMigration();
