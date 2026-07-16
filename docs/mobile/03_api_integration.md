# Finance App — Expo API Integration Guide

> Panduan lengkap integrasi REST API ke Expo app menggunakan Bearer token (Sanctum stateless).

---

## Setup Axios

```typescript
// services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'finance_api_token';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      // Redirect to login — handled by auth store
    }
    return Promise.reject(error);
  }
);

// Token helpers
export const storeToken  = (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const getToken    = () => SecureStore.getItemAsync(TOKEN_KEY);
export const removeToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);
```

---

## Auth Store (Zustand)

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { api, storeToken, removeToken } from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await api.post('/login', { email, password });
    await storeToken(data.token);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try { await api.post('/logout'); } catch {}
    await removeToken();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const { data } = await api.get('/user');
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
```

---

## Root Layout Auth Check

```tsx
// app/_layout.tsx
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function RootLayout() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => { loadUser(); }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) return <SplashScreen />;
  return <Stack />;
}
```

---

## TypeScript Interfaces (All API Types)

```typescript
// types/api.types.ts

export interface PaginatedResponse<T> {
  data: T[];
  links: { first: string; last: string; prev: string | null; next: string | null };
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface Wallet {
  id: number;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'digital';
  opening_balance: string;
  current_balance: string;
  icon: string;
  color: string;
  notes: string | null;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  parent_id: number | null;
  budget_amount: string | null;
  budget_period: 'monthly' | 'yearly' | null;
  is_active: boolean;
  children?: Category[];
}

export interface Transaction {
  id: number;
  wallet_id: number;
  category_id: number | null;
  goal_id: number | null;
  debt_id: number | null;
  type: 'income' | 'expense';
  amount: string;
  date: string; // YYYY-MM-DD
  notes: string | null;
  attachment_path: string | null;
  wallet?: Wallet;
  category?: Category;
}

export interface Goal {
  id: number;
  name: string;
  target_amount: string;
  current_amount: string;
  deadline: string | null;
  notes: string | null;
  icon: string | null;
  color: string | null;
  is_achieved: boolean;
}

export interface Debt {
  id: number;
  name: string;
  type: 'debt' | 'receivable';
  amount: string;
  paid_amount: string;
  remaining_amount: string;
  due_date: string | null;
  notes: string | null;
  is_settled: boolean;
}

export interface Asset {
  id: number;
  name: string;
  type: 'savings' | 'deposit' | 'gold' | 'stocks' | 'crypto' | 'property' | 'other';
  value: string;
  notes: string | null;
}

export interface Subscription {
  id: number;
  name: string;
  amount: string;
  cycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_billing_date: string;
  notes: string | null;
  is_active: boolean;
  wallet_id: number | null;
  category_id: number | null;
}

export interface DashboardData {
  total_balance: number;
  income_this_month: number;
  expense_this_month: number;
  net_this_month: number;
  wallets: Wallet[];
  recent_transactions: Transaction[];
  budget_status: Array<{
    category: Category;
    spent: number;
    budget: number;
    percentage: number;
  }>;
}
```

---

## Service Modules

### Auth Service
```typescript
// services/auth.service.ts
import { api } from './api';

export const authService = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: any }>('/login', { email, password }),

  logout: () => api.post('/logout'),

  getUser: () => api.get('/user'),
};
```

### Wallet Service
```typescript
// services/wallet.service.ts
import { api } from './api';
import type { Wallet, PaginatedResponse } from '@/types/api.types';

export const walletService = {
  index: ()                      => api.get<Wallet[]>('/wallets'),
  store: (payload: Partial<Wallet>) => api.post<Wallet>('/wallets', payload),
  update: (id: number, payload: Partial<Wallet>) => api.put<Wallet>(`/wallets/${id}`, payload),
  destroy: (id: number)          => api.delete(`/wallets/${id}`),
};
```

### Transaction Service
```typescript
// services/transaction.service.ts
import { api } from './api';
import type { Transaction, PaginatedResponse } from '@/types/api.types';

export interface TransactionFilters {
  start_date?: string;
  end_date?: string;
  wallet_id?: number | 'all';
  type?: 'income' | 'expense' | 'all';
  category_id?: number | 'all';
  search?: string;
  page?: number;
}

export const transactionService = {
  index:   (filters?: TransactionFilters) => api.get<PaginatedResponse<Transaction>>('/transactions', { params: filters }),
  store:   (payload: Partial<Transaction>) => api.post<Transaction>('/transactions', payload),
  update:  (id: number, payload: Partial<Transaction>) => api.put<Transaction>(`/transactions/${id}`, payload),
  destroy: (id: number)                    => api.delete(`/transactions/${id}`),
};
```

---

## TanStack Query Hooks

```typescript
// hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService, type TransactionFilters } from '@/services/transaction.service';

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn:  () => transactionService.index(filters).then(r => r.data),
    staleTime: 30_000, // 30 seconds
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => transactionService.store(payload).then(r => r.data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}
```

---

## Error Handling Pattern

```typescript
// utils/handleApiError.ts
import { AxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.errors) {
      return Object.values(data.errors as Record<string, string[]>)
        .flat().join(', ');
    }
    if (error.response?.status === 422) return 'Validation failed. Check your input.';
    if (error.response?.status === 401) return 'Session expired. Please login again.';
    if (error.response?.status === 429) return 'Too many requests. Please slow down.';
  }
  return 'Something went wrong. Please try again.';
}
```

---

## .env Configuration

```bash
# finance-mobile/.env
EXPO_PUBLIC_API_BASE_URL=https://your-domain.com/api

# For local development (replace with your machine's local IP)
# EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000/api
```

---

## Quick Start Checklist

- [ ] Set `EXPO_PUBLIC_API_BASE_URL` in `.env`
- [ ] Implement `services/api.ts` with Axios + interceptors
- [ ] Implement `stores/authStore.ts` with Zustand
- [ ] Wrap app in `GluestackUIProvider` + `QueryClientProvider`
- [ ] Implement auth guard in `app/_layout.tsx`
- [ ] Test login with `POST /api/login`
- [ ] Verify token stored in `expo-secure-store`
- [ ] Test protected endpoint `GET /api/user` with token
