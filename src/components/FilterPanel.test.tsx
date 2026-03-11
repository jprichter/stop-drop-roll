import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterPanel } from './FilterPanel';

describe('FilterPanel', () => {
  const mockFilters = {
    distance: 25,
    giStyles: ['gi'],
    maxFee: 50,
    hasShower: true,
    hasLockers: false,
    hasParking: false,
  };

  it('renders initial filter values correctly', () => {
    render(
      <FilterPanel 
        filters={mockFilters} 
        setFilters={() => {}} 
        onApply={() => {}} 
      />
    );

    // Check distance display
    expect(screen.getByText('25 miles')).toBeInTheDocument();
    
    // Check if Shower checkbox is checked
    const showerCheckbox = screen.getByLabelText(/Showers/i) as HTMLInputElement;
    expect(showerCheckbox.checked).toBe(true);

    // Check if Parking checkbox is unchecked
    const parkingCheckbox = screen.getByLabelText(/Parking/i) as HTMLInputElement;
    expect(parkingCheckbox.checked).toBe(false);
  });

  it('calls onApply when Apply button is clicked', () => {
    const onApplyMock = vi.fn();
    render(
      <FilterPanel 
        filters={mockFilters} 
        setFilters={() => {}} 
        onApply={onApplyMock} 
      />
    );

    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);

    expect(onApplyMock).toHaveBeenCalledTimes(1);
  });

  it('calls setFilters when a style button is clicked', () => {
    const setFiltersMock = vi.fn();
    render(
      <FilterPanel 
        filters={mockFilters} 
        setFilters={setFiltersMock} 
        onApply={() => {}} 
      />
    );

    const noGiButton = screen.getByText('No-Gi');
    fireEvent.click(noGiButton);

    // Should call setFilters with the new style added
    expect(setFiltersMock).toHaveBeenCalled();
  });
});
