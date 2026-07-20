import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Returns today's date at local midnight (no UTC offset).
 * Use instead of `new Date()` when you need just the date without time.
 */
export function localToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Returns today's date as YYYY-MM-DD string in local timezone.
 * Use instead of `new Date().toISOString().split('T')[0]` which returns UTC date.
 */
export function localTodayString(): string {
    return new Date().toLocaleDateString('en-CA');
}

/**
 * Parses a YYYY-MM-DD date string as local midnight (not UTC midnight).
 * Use instead of `new Date(dateStr)` for date-only strings to avoid timezone offset.
 */
export function parseLocalDate(dateStr: string): Date {
    if (!dateStr || typeof dateStr !== 'string') {
        return new Date();
    }
    const parts = dateStr.split('-');
    if (parts.length < 3) {
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    const [year, month, day] = parts.map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return new Date();
    }
    return new Date(year, month - 1, day);
}

/**
 * Converts a date string (YYYY-MM-DD or datetime) to a YYYY-MM-DD string
 * in local timezone. Handles both date-only and full datetime strings.
 */
export function toLocalDateString(dateStr: string): string {
    // If it's already a plain date (YYYY-MM-DD), return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    // For datetime strings (e.g. "2026-07-19 20:00:00" stored in UTC),
    // parse as-is but extract local date parts
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-CA');
}

