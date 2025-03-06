import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  try {
    // Get all migration files
    const migrationsDir = path.join(process.cwd(), 'database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort((a, b) => {
        // Extract migration numbers for proper ordering
        const numA = parseInt(a.split('_')[0]);
        const numB = parseInt(b.split('_')[0]);
        return numA - numB;
      });

    console.log('Found migration files:', migrationFiles);

    // Run each migration in sequence
    for (const migrationFile of migrationFiles) {
      console.log(`Running migration: ${migrationFile}`);
      const migrationPath = path.join(migrationsDir, migrationFile);
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      // Split the migration into separate statements
      const statements = migrationSql
        .split(';')
        .filter(stmt => stmt.trim())
        .map(stmt => stmt.trim());

      // Execute each statement
      for (const statement of statements) {
        const { error } = await supabase.rpc('exec_sql', {
          sql_string: statement
        });

        if (error) {
          console.error(`Error executing statement in ${migrationFile}:`, error);
          console.error('Statement:', statement);
          throw error;
        }
      }

      console.log(`Completed migration: ${migrationFile}`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
