export interface Wallet {
    id: number;
    name: string;
    type: 'cash' | 'bank' | 'ewallet' | 'digital';
    icon: string | null;
    color: string | null;
    current_balance: number;
    opening_balance: number;
}

export interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
    icon: string | null;
    color: string | null;
}

export interface Transaction {
    id: number;
    wallet_id: number;
    category_id: number | null;
    type: 'income' | 'expense';
    amount: string;
    date: string;
    notes: string | null;
    wallet: Wallet;
    category: Category | null;
}

export interface Budget {
    id: number;
    name: string;
    category_id: number | null;
    category: Category | null;
    amount_limit: number;
    period: 'weekly' | 'monthly' | 'yearly' | 'custom';
    start_date: string | null;
    end_date: string | null;
    total_spent: number;
    progress: number;
}
