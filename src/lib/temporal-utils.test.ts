import { describe, it, expect } from 'vitest';
import { getTemporalQueryBounds } from './temporal-utils';

describe('getTemporalQueryBounds', () => {
  const mockMonday = new Date('2026-03-02T12:00:00'); // Monday (Day 1)

  it('handles "now" filter correctly', () => {
    const result = getTemporalQueryBounds({ 
      timeFilter: 'now', 
      currentDate: mockMonday 
    });
    expect(result.targetDayOfWeek).toBe(1);
    expect(result.startTimeBound).toBe('12:00');
    expect(result.endTimeBound).toBe('12:00');
  });

  it('handles future date selection correctly', () => {
    const nextSaturday = new Date('2026-03-07T12:00:00'); // Saturday (Day 6)
    const result = getTemporalQueryBounds({ 
      timeFilter: 'custom', 
      currentDate: nextSaturday 
    });
    expect(result.targetDayOfWeek).toBe(6); // Should correctly identify Saturday
  });

  it('handles custom time ranges on specific days', () => {
    const result = getTemporalQueryBounds({ 
      timeFilter: 'custom', 
      customStartTime: '10:00', 
      customEndTime: '14:00',
      currentDate: mockMonday 
    });
    expect(result.targetDayOfWeek).toBe(1);
    expect(result.startTimeBound).toBe('10:00');
    expect(result.endTimeBound).toBe('14:00');
  });
});
