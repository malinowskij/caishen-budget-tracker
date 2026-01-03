import { App } from 'obsidian';
import { Locale, t } from './i18n';

export interface IDataService {
    getCurrentMonthSummary(): MonthlySummary;
    getCategoryBreakdown(year: number, month: number): Array<{ category: string; name: string; amount: number; color: string; icon: string }>;
    getMonthlyTrends(months: number): Array<{ year: number; month: number; income: number; expense: number; balance: number }>;
    getRecentTransactions(limit: number): Transaction[];
    addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction>;
}

export interface IBudgetPlugin {
    settings: BudgetPluginSettings;
    dataService: IDataService;
    openTransactionModal(defaultType?: 'income' | 'expense'): void;
    saveSettings(): Promise<void>;
    updateStatusBar(): void;
}

// Transaction represents a single income or expense entry
export interface Transaction {
    id: string;
    date: string; // ISO format YYYY-MM-DD
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
}

// Category for organizing transactions
export interface Category {
    id: string;
    name: string;
    icon: string;
    type: 'income' | 'expense' | 'both';
    color: string;
}

// Monthly summary data
export interface MonthlySummary {
    year: number;
    month: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    byCategory: Record<string, number>;
    transactionCount: number;
}

// Plugin settings stored in data.json
export interface BudgetPluginSettings {
    categories: Category[];
    defaultCurrency: string;
    currencies: string[];
    budgetFolder: string;
    dateFormat: string;
    showBalanceInStatusBar: boolean;
    locale: Locale;
}

// Get default expense categories based on locale
export function getDefaultExpenseCategories(locale: Locale): Category[] {
    const trans = t(locale);
    return [
        { id: 'food', name: trans.defaultCategories.food, icon: '🍕', type: 'expense', color: '#e74c3c' },
        { id: 'transport', name: trans.defaultCategories.transport, icon: '🚗', type: 'expense', color: '#3498db' },
        { id: 'entertainment', name: trans.defaultCategories.entertainment, icon: '🎬', type: 'expense', color: '#9b59b6' },
        { id: 'shopping', name: trans.defaultCategories.shopping, icon: '🛒', type: 'expense', color: '#e67e22' },
        { id: 'bills', name: trans.defaultCategories.bills, icon: '📄', type: 'expense', color: '#1abc9c' },
        { id: 'health', name: trans.defaultCategories.health, icon: '💊', type: 'expense', color: '#2ecc71' },
        { id: 'education', name: trans.defaultCategories.education, icon: '📚', type: 'expense', color: '#f39c12' },
        { id: 'other-expense', name: trans.defaultCategories.otherExpense, icon: '📦', type: 'expense', color: '#95a5a6' },
    ];
}

// Get default income categories based on locale
export function getDefaultIncomeCategories(locale: Locale): Category[] {
    const trans = t(locale);
    return [
        { id: 'salary', name: trans.defaultCategories.salary, icon: '💰', type: 'income', color: '#27ae60' },
        { id: 'freelance', name: trans.defaultCategories.freelance, icon: '💻', type: 'income', color: '#2980b9' },
        { id: 'investment', name: trans.defaultCategories.investment, icon: '📈', type: 'income', color: '#8e44ad' },
        { id: 'gift', name: trans.defaultCategories.gift, icon: '🎁', type: 'income', color: '#e91e63' },
        { id: 'other-income', name: trans.defaultCategories.otherIncome, icon: '✨', type: 'income', color: '#00bcd4' },
    ];
}

// Get all default categories
export function getDefaultCategories(locale: Locale): Category[] {
    return [...getDefaultExpenseCategories(locale), ...getDefaultIncomeCategories(locale)];
}

// Get default settings
export function getDefaultSettings(locale: Locale): BudgetPluginSettings {
    return {
        categories: getDefaultCategories(locale),
        defaultCurrency: 'USD',
        currencies: ['USD', 'EUR', 'GBP', 'PLN'],
        budgetFolder: 'Budget',
        dateFormat: 'YYYY-MM-DD',
        showBalanceInStatusBar: true,
        locale: locale,
    };
}
