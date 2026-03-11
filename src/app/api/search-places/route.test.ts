import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { createClient } from '@supabase/supabase-js';

const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
  update: vi.fn().mockReturnThis(),
  single: vi.fn(),
  then: vi.fn(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

global.fetch = vi.fn();

describe('GET /api/search-places', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_PLACES_API_KEY = 'test-key';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  });

  it('Anytime Filter: returns all gyms even if no mats match current time', async () => {
    const mockGoogleResults = [{ place_id: 'p1', name: 'DB Gym', geometry: { location: { lat: 0, lng: 0 } } }];
    mockSupabaseClient.single.mockResolvedValueOnce({ 
      data: { raw_results: mockGoogleResults, created_at: new Date().toISOString() }, 
      error: null 
    });

    // 1. gymsQuery matches p1
    mockSupabaseClient.then.mockImplementationOnce((callback) => 
      Promise.resolve(callback({ data: [{ id: 'g1', google_place_id: 'p1' }], error: null }))
    );
    // 2. reportData lookup
    mockSupabaseClient.then.mockImplementationOnce((callback) => 
      Promise.resolve(callback({ data: [], error: null }))
    );
    // 3. openMats lookup (Anytime)
    mockSupabaseClient.then.mockImplementationOnce((callback) => 
      Promise.resolve(callback({ data: [{ id: 'om1', gym_id: 'g1' }], error: null }))
    );
    // 4. allLocalGyms check
    mockSupabaseClient.then.mockImplementationOnce((callback) => 
      Promise.resolve(callback({ data: [{ google_place_id: 'p1' }], error: null }))
    );

    const request = new Request('http://localhost/api/search-places?textQuery=Austin&timeFilter=anytime');
    const response = await GET(request);
    
    const data = await response.json();
    expect(data).toHaveLength(1);
    expect(data[0].has_local_data).toBe(true);
  });

  it('Specific Filter: hides DB gym if it has no matching open mats', async () => {
    const mockGoogleResults = [{ place_id: 'p1', name: 'DB Gym', geometry: { location: { lat: 0, lng: 0 } } }];
    mockSupabaseClient.single.mockResolvedValueOnce({ 
      data: { raw_results: mockGoogleResults, created_at: new Date().toISOString() }, 
      error: null 
    });

    // 1. gymsQuery matches p1
    mockSupabaseClient.then.mockImplementationOnce((callback) => 
      Promise.resolve(callback({ data: [{ id: 'g1', google_place_id: 'p1' }], error: null }))
    );
    // 2. reportData lookup
    mockSupabaseClient.then.mockImplementationOnce((callback) => 
      Promise.resolve(callback({ data: [], error: null }))
    );
    // 3. openMats lookup (Filtered - empty)
    mockSupabaseClient.then.mockImplementationOnce((callback) => 
      Promise.resolve(callback({ data: [], error: null }))
    );
    // 4. allLocalGyms check
    mockSupabaseClient.then.mockImplementationOnce((callback) => 
      Promise.resolve(callback({ data: [{ google_place_id: 'p1' }], error: null }))
    );

    const request = new Request('http://localhost/api/search-places?textQuery=Austin&timeFilter=today');
    const response = await GET(request);
    
    const data = await response.json();
    expect(data).toHaveLength(0); // Should be filtered out
  });
});
