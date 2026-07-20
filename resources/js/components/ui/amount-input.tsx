import * as React from "react"
import { Input } from "./input"

interface AmountInputProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> {
  value: string | number;
  onChange: (value: string) => void;
}

export const parseDisplayValue = (val: string): string => {
  // Replace Indonesian decimal comma with dot, and remove thousand separator dots
  let clean = val.replace(/\./g, '').replace(/,/g, '.');
  // Keep only digits and the first dot
  const parts = clean.split('.');
  if (parts.length > 1) {
    return parts[0].replace(/\D/g, '') + '.' + parts.slice(1).join('').replace(/\D/g, '');
  }
  return clean.replace(/\D/g, '');
};

export const formatNumberWithDots = (val: string | number): string => {
  if (val === undefined || val === null || val === '') {
    return '';
  }
  const valStr = val.toString();
  const parts = valStr.split('.');
  
  // Format integer part
  const integerPart = parts[0].replace(/\D/g, '');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // If there's a decimal part, append it with a comma
  if (parts.length > 1) {
    const decimalPart = parts[1].replace(/\D/g, '');
    return `${formattedInteger},${decimalPart}`;
  }
  
  return formattedInteger;
};

export const parseNumberWithoutDots = (val: string): string => {
  return parseDisplayValue(val);
};

export function AmountInput({ value, onChange, ...props }: AmountInputProps) {
  const displayValue = formatNumberWithDots(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseDisplayValue(e.target.value);
    onChange(rawVal);
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      {...props}
    />
  )
}

