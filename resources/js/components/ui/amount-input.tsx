import * as React from "react"
import { Input } from "./input"

interface AmountInputProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> {
  value: string | number;
  onChange: (value: string) => void;
}

export const formatNumberWithDots = (val: string | number): string => {
  if (val === undefined || val === null || val === '') {
    return '';
  }
  const cleanValue = val.toString().replace(/\D/g, '');
  if (!cleanValue) {
    return '';
  }
  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseNumberWithoutDots = (val: string): string => {
  return val.replace(/\D/g, '');
};

export function AmountInput({ value, onChange, ...props }: AmountInputProps) {
  const displayValue = formatNumberWithDots(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseNumberWithoutDots(e.target.value);
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
