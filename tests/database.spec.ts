import { test, expect } from '@playwright/test';
import { withSupawright } from 'supawright';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Setup Supawright integration with remote Supabase config
const dbTest = withSupawright<any, 'public'>(['public'], {
  supabase: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  database: {
    host: 'aws-0-eu-west-1.pooler.supabase.com',
    port: 6543, // Transaction pooler port for Supabase remote databases
    user: 'postgres.jndadrkcortxumlsisir', // Supabase pooler requires tenant ref prefix in username
    database: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD || '',
    // Supabase connection pooling requires SSL enabled for remote connections
    ssl: { rejectUnauthorized: false }
  }
});

dbTest.describe('CRM Database Integration Tests (via Supawright)', () => {
  dbTest('verify profiles and clients table constraints', async ({ supawright }) => {
    // 1. Insert a test profile
    const profile = await supawright.create('profiles', {
      email: 'supawright-tester@koitravel.co.ke',
      first_name: 'Supa',
      last_name: 'Wright',
      role: 'management'
    });
    expect(profile.id).toBeDefined();

    // 2. Insert a test client (Verify type constraint 'individual'/'corporate')
    const client = await supawright.create('clients', {
      name: 'Supawright Test Client',
      type: 'individual',
      email: 'tester-client@koitravel.co.ke',
      phone: '+254700000000',
      country: 'Kenya'
    });
    
    expect(client.id).toBeDefined();
    expect(client.type).toBe('individual');
    
    console.log('Successfully inserted test profile and client via Supawright!');
  });
});
