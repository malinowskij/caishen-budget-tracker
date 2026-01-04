/**
 * Constants for the Budget Tracker plugin
 * Centralized location for magic values, thresholds, and defaults
 */

// Transaction type constants
export const TRANSACTION_TYPES = {
    INCOME: 'income',
    EXPENSE: 'expense',
} as const;

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];

// Category type constants
export const CATEGORY_TYPES = {
    INCOME: 'income',
    EXPENSE: 'expense',
    BOTH: 'both',
} as const;

export type CategoryType = typeof CATEGORY_TYPES[keyof typeof CATEGORY_TYPES];

// Budget thresholds (percentage)
export const BUDGET_THRESHOLDS = {
    WARNING: 80,
    EXCEEDED: 100,
} as const;

// Default colors for categories
export const DEFAULT_COLORS = {
    INCOME: '#27ae60',
    EXPENSE: '#e74c3c',

    // Category-specific colors
    FOOD: '#e74c3c',
    TRANSPORT: '#3498db',
    ENTERTAINMENT: '#9b59b6',
    SHOPPING: '#e67e22',
    BILLS: '#1abc9c',
    HEALTH: '#2ecc71',
    EDUCATION: '#f39c12',
    OTHER: '#95a5a6',

    // Income colors
    SALARY: '#27ae60',
    FREELANCE: '#2980b9',
    INVESTMENT: '#8e44ad',
    GIFT: '#e91e63',
} as const;

// Date formats
export const DATE_FORMATS = {
    ISO: 'YYYY-MM-DD',
    DISPLAY: 'DD/MM/YYYY',
} as const;

// Limits
export const LIMITS = {
    MAX_DAY_OF_MONTH: 28, // For recurring transactions (avoids Feb issues)
    MIN_DAY_OF_MONTH: 1,
    DEFAULT_RECENT_TRANSACTIONS: 10,
    DEFAULT_TREND_MONTHS: 6,
} as const;

// Plugin identifiers
export const PLUGIN_ID = 'budget-tracker';
export const DASHBOARD_VIEW_TYPE = 'budget-dashboard-view';
