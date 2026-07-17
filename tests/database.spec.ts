import { test, expect } from '@playwright/test';
import { withSupawright } from 'supawright';

// Setup Supawright integration
const dbTest = withSupawright(test);

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
