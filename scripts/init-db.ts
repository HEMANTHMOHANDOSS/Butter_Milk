import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function init() {
  const sql = neon(process.env.DATABASE_URL!);
  
  console.log('Initializing database...');
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS buttermilk_reports (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        day INTEGER NOT NULL,
        mahilas INTEGER NOT NULL DEFAULT 0,
        gents INTEGER NOT NULL DEFAULT 0,
        bv_girls INTEGER NOT NULL DEFAULT 0,
        bv_boys INTEGER NOT NULL DEFAULT 0,
        beneficiary_count INTEGER NOT NULL DEFAULT 0,
        photos TEXT[], -- Array of base64 strings
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table "buttermilk_reports" created or already exists.');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

init();
