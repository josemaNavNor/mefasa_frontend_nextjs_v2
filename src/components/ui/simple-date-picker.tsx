import React from 'react';

interface SimpleDatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  minDate?: string;
}

export function SimpleDatePicker({ value, onChange, disabled, minDate }: SimpleDatePickerProps) {
  const today = new Date().toISOString().split('T')[0];
  const minDateToUse = minDate || today;

  return (
    <input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      min={minDateToUse}
      className="w-full h-8 px-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
}