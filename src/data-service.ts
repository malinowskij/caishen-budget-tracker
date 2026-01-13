import { TFile } from 'obsidian';
import type { App } from 'obsidian';
import type { Transaction, MonthlySummary, BudgetPluginSettings, TransactionFilter } from './types';
import { t } from './i18n';

export class DataService {
    private app: App;
    private settings: BudgetPluginSettings;
    private transactions: Transaction[] = [];

    constructor(app: App, settings: BudgetPluginSettings) {
        this.app = app;
        this.settings = settings;
    }

    updateSettings(settings: BudgetPluginSettings) {
        this.settings = settings;
    }

    // Generate unique ID for transactions
    generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    // Load all transactions from plugin data
    loadTransactions(data: Record<string, unknown> | null): Transaction[] {
        if (data && Array.isArray(data.transactions)) {
            this.transactions = data.transactions as Transaction[];
        } else {
            this.transactions = [];
        }
        return this.transactions;
    }

    // Get all transactions
    getTransactions(): Transaction[] {
        return this.transactions;
    }

    // Add a new transaction
    async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
        const now = new Date().toISOString();
        const newTransaction: Transaction = {
            ...transaction,
            id: this.generateId(),
            createdAt: now,
            updatedAt: now,
        };

        this.transactions.push(newTransaction);
        await this.updateMarkdownFile(newTransaction);
        return newTransaction;
    }

    // Update existing transaction
    async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index === -1) return null;

        const existingTransaction = this.transactions[index];
        if (!existingTransaction) return null;

        const updatedTransaction: Transaction = {
            ...existingTransaction,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        this.transactions[index] = updatedTransaction;
        await this.regenerateMonthFile(updatedTransaction.date);
        return updatedTransaction;
    }

    // Delete transaction
    async deleteTransaction(id: string): Promise<boolean> {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index === -1) return false;

        const transaction = this.transactions[index];
        if (!transaction) return false;

        const date = transaction.date;
        this.transactions.splice(index, 1);
        await this.regenerateMonthFile(date);
        return true;
    }

    // Get filtered transactions
    getFilteredTransactions(filter: TransactionFilter): Transaction[] {
        return this.transactions.filter(t => {
            // Date range filter
            if (filter.dateFrom && t.date < filter.dateFrom) return false;
            if (filter.dateTo && t.date > filter.dateTo) return false;

            // Category filter
            if (filter.category && t.category !== filter.category) return false;

            // Type filter
            if (filter.type && filter.type !== 'all' && t.type !== filter.type) return false;

            // Search filter (case insensitive)
            if (filter.search) {
                const searchLower = filter.search.toLowerCase();
                const descMatch = t.description?.toLowerCase().includes(searchLower) ?? false;
                const catMatch = t.category.toLowerCase().includes(searchLower);
                if (!descMatch && !catMatch) return false;
            }

            return true;
        }).sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending
    }
    // Get transactions for a specific month
    getTransactionsForMonth(year: number, month: number): Transaction[] {
        return this.transactions.filter(t => {
            const date = new Date(t.date);
            return date.getFullYear() === year && date.getMonth() + 1 === month;
        });
    }

    // Get monthly summary (excludes investments from expense totals, optionally excludes large expenses)
    getMonthlySummary(year: number, month: number, includeExcluded: boolean = false): MonthlySummary {
        const monthTransactions = this.getTransactionsForMonth(year, month);

        let totalIncome = 0;
        let totalExpense = 0;
        const byCategory: Record<string, number> = {};

        for (const txn of monthTransactions) {
            // Skip transactions excluded from stats (unless includeExcluded is true)
            if (!includeExcluded && txn.excludeFromStats) {
                continue;
            }

            if (txn.type === 'income') {
                totalIncome += txn.amount;
            } else if (txn.type === 'expense') {
                totalExpense += txn.amount;
            }
            // Note: investments are not counted in income/expense totals

            const currentAmount = byCategory[txn.category];
            byCategory[txn.category] = (currentAmount ?? 0) + txn.amount;
        }

        return {
            year,
            month,
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            byCategory,
            transactionCount: monthTransactions.length,
        };
    }

    // Get current month summary
    getCurrentMonthSummary(): MonthlySummary {
        const now = new Date();
        return this.getMonthlySummary(now.getFullYear(), now.getMonth() + 1);
    }

    // Get month names based on locale
    private getMonthNames(): string[] {
        return t(this.settings.locale).months;
    }

    // Ensure budget folder exists
    private async ensureFolderExists(path: string): Promise<void> {
        const folder = this.app.vault.getAbstractFileByPath(path);
        if (!folder) {
            await this.app.vault.createFolder(path);
        }
    }

    // Get file path for a given date
    private getFilePath(date: string): string {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth(); // 0-indexed
        const monthNames = this.getMonthNames();
        const monthName = monthNames[month] ?? 'Unknown';
        const monthNum = String(month + 1).padStart(2, '0');

        return `${this.settings.budgetFolder}/${year}/${monthNum}-${monthName}.md`;
    }

    // Update markdown file with new transaction
    private async updateMarkdownFile(transaction: Transaction): Promise<void> {
        const filePath = this.getFilePath(transaction.date);
        const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));

        // Ensure folders exist
        const budgetFolder = this.settings.budgetFolder;
        await this.ensureFolderExists(budgetFolder);
        await this.ensureFolderExists(folderPath);

        // Get or create file
        const file = this.app.vault.getAbstractFileByPath(filePath);

        if (!file) {
            // Create new file with header
            const date = new Date(transaction.date);
            const content = this.generateMonthFileContent(date.getFullYear(), date.getMonth() + 1);
            await this.app.vault.create(filePath, content);
        } else {
            // Regenerate file content
            await this.regenerateMonthFile(transaction.date);
        }
    }

    // Regenerate entire month file
    private async regenerateMonthFile(date: string): Promise<void> {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const filePath = this.getFilePath(date);

        const content = this.generateMonthFileContent(year, month);

        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (file instanceof TFile) {
            await this.app.vault.modify(file, content);
        }
    }

    // Generate markdown content for a month
    private generateMonthFileContent(year: number, month: number): string {
        const trans = t(this.settings.locale);
        const monthNames = this.getMonthNames();
        const monthName = monthNames[month - 1] ?? 'Unknown';
        const transactions = this.getTransactionsForMonth(year, month);
        const summary = this.getMonthlySummary(year, month);

        // Sort by date descending
        transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        let content = `# ${trans.budgetMonthTitle} ${monthName} ${year}\n\n`;

        // Summary section
        content += `## ${trans.summary}\n\n`;
        content += `| ${trans.incomes} | ${trans.expenses} | ${trans.balance} |\n`;
        content += `|----------:|--------:|-------:|\n`;

        const balanceSign = summary.balance >= 0 ? '+' : '';
        content += `| ${this.formatAmount(summary.totalIncome)} | ${this.formatAmount(summary.totalExpense)} | ${balanceSign}${this.formatAmount(summary.balance)} |\n\n`;

        // Transactions table
        if (transactions.length > 0) {
            content += `## ${trans.transactions}\n\n`;
            content += `| ${trans.date} | ${trans.type} | ${trans.category} | ${trans.description} | ${trans.amount} |\n`;
            content += `|:-----|:----|:----------|:-----|------:|\n`;

            for (const txn of transactions) {
                const category = this.settings.categories.find(c => c.id === txn.category);
                const categoryDisplay = category ? `${category.icon} ${category.name}` : txn.category;
                const typeEmoji = txn.type === 'income' ? '💚' : txn.type === 'investment' ? '📈' : '🔴';
                const amountSign = txn.type === 'income' ? '+' : '-';
                const excludedMarker = txn.excludeFromStats ? ' ⚠️' : '';

                content += `| ${txn.date} | ${typeEmoji} | ${categoryDisplay} | ${txn.description || '-'}${excludedMarker} | ${amountSign}${this.formatAmount(txn.amount, txn.currency)} |\n`;
            }
        } else {
            content += `> ${trans.noTransactionsInMonth}\n`;
        }

        return content;
    }

    // Format amount with currency
    private formatAmount(amount: number, currency?: string): string {
        const curr = currency ?? this.settings.defaultCurrency;
        return `${amount.toFixed(2)} ${curr}`;
    }

    // Get serializable data for saving
    getDataForSave(): { transactions: Transaction[] } {
        return { transactions: this.transactions };
    }

    // Get investment summary for a month
    getInvestmentSummary(year: number, month: number): { totalInvested: number; byCategory: Record<string, number> } {
        const monthTransactions = this.getTransactionsForMonth(year, month)
            .filter(t => t.type === 'investment');

        let totalInvested = 0;
        const byCategory: Record<string, number> = {};

        for (const txn of monthTransactions) {
            totalInvested += txn.amount;
            const currentAmount = byCategory[txn.category];
            byCategory[txn.category] = (currentAmount ?? 0) + txn.amount;
        }

        return { totalInvested, byCategory };
    }

    // Get investment breakdown by category for a month
    getInvestmentBreakdown(year: number, month: number): Array<{ category: string; name: string; amount: number; color: string; icon: string }> {
        const summary = this.getInvestmentSummary(year, month);
        const result: Array<{ category: string; name: string; amount: number; color: string; icon: string }> = [];

        for (const [categoryId, amount] of Object.entries(summary.byCategory)) {
            const category = this.settings.categories.find(c => c.id === categoryId);
            if (category) {
                result.push({
                    category: categoryId,
                    name: category.name,
                    amount,
                    color: category.color,
                    icon: category.icon,
                });
            }
        }

        return result.sort((a, b) => b.amount - a.amount);
    }

    // Get spending by category for current month (excludes income and investments)
    getCategoryBreakdown(year: number, month: number): Array<{ category: string; name: string; amount: number; color: string; icon: string }> {
        const summary = this.getMonthlySummary(year, month);
        const result: Array<{ category: string; name: string; amount: number; color: string; icon: string }> = [];

        for (const [categoryId, amount] of Object.entries(summary.byCategory)) {
            const category = this.settings.categories.find(c => c.id === categoryId);
            // Only include expense categories, not income or investment
            if (category && category.type === 'expense') {
                result.push({
                    category: categoryId,
                    name: category.name,
                    amount,
                    color: category.color,
                    icon: category.icon,
                });
            }
        }

        return result.sort((a, b) => b.amount - a.amount);
    }

    // Get hierarchical category breakdown with subcategories aggregated to parents
    getHierarchicalCategoryBreakdown(year: number, month: number): Array<{ category: string; name: string; amount: number; color: string; icon: string; subcategories?: Array<{ category: string; name: string; amount: number; color: string; icon: string }> }> {
        const summary = this.getMonthlySummary(year, month);

        // Get all expense categories
        const expenseCategories = this.settings.categories.filter(c => c.type === 'expense' || c.type === 'both');

        // Debug: Show which categories have parentId
        console.debug('[Budget] getHierarchicalCategoryBreakdown - categories with parentId:',
            expenseCategories.filter(c => c.parentId).map(c => ({ id: c.id, name: c.name, parentId: c.parentId })));

        // Identify parent categories (no parentId) and subcategories
        const parentCategories = expenseCategories.filter(c => !c.parentId);
        const getSubcategories = (parentId: string) => expenseCategories.filter(c => c.parentId === parentId);

        const result: Array<{ category: string; name: string; amount: number; color: string; icon: string; subcategories?: Array<{ category: string; name: string; amount: number; color: string; icon: string }> }> = [];

        for (const parent of parentCategories) {
            const subcats = getSubcategories(parent.id);

            // Get direct amount for parent category
            const directAmount = summary.byCategory[parent.id] || 0;

            // Build subcategories array and sum their amounts
            const subcategoriesData: Array<{ category: string; name: string; amount: number; color: string; icon: string }> = [];
            let subcatTotal = 0;

            for (const sub of subcats) {
                const subAmount = summary.byCategory[sub.id] || 0;
                if (subAmount > 0) {
                    subcatTotal += subAmount;
                    subcategoriesData.push({
                        category: sub.id,
                        name: sub.name,
                        amount: subAmount,
                        color: sub.color,
                        icon: sub.icon,
                    });
                }
            }

            // Total = direct + all subcategories
            const totalAmount = directAmount + subcatTotal;

            if (totalAmount > 0) {
                result.push({
                    category: parent.id,
                    name: parent.name,
                    amount: totalAmount,
                    color: parent.color,
                    icon: parent.icon,
                    subcategories: subcategoriesData.length > 0 ? subcategoriesData.sort((a, b) => b.amount - a.amount) : undefined,
                });
            }
        }

        return result.sort((a, b) => b.amount - a.amount);
    }

    // Get recent transactions
    getRecentTransactions(limit: number = 10): Transaction[] {
        return [...this.transactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);
    }

    // Get monthly trends (last N months)
    getMonthlyTrends(months: number = 6): Array<{ year: number; month: number; income: number; expense: number; balance: number }> {
        const result: Array<{ year: number; month: number; income: number; expense: number; balance: number }> = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const summary = this.getMonthlySummary(date.getFullYear(), date.getMonth() + 1);
            result.push({
                year: summary.year,
                month: summary.month,
                income: summary.totalIncome,
                expense: summary.totalExpense,
                balance: summary.balance,
            });
        }

        return result;
    }

    // Get yearly summary for a given year
    getYearlySummary(year: number): {
        year: number;
        months: { month: number; income: number; expense: number; balance: number }[];
        totalIncome: number;
        totalExpense: number;
        balance: number;
        savingsRate: number;
    } {
        const months: { month: number; income: number; expense: number; balance: number }[] = [];
        let totalIncome = 0;
        let totalExpense = 0;

        for (let month = 1; month <= 12; month++) {
            const summary = this.getMonthlySummary(year, month);
            months.push({
                month,
                income: summary.totalIncome,
                expense: summary.totalExpense,
                balance: summary.balance,
            });
            totalIncome += summary.totalIncome;
            totalExpense += summary.totalExpense;
        }

        const balance = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        return {
            year,
            months,
            totalIncome,
            totalExpense,
            balance,
            savingsRate,
        };
    }

    // Get average spending statistics
    getAverageSpending(): {
        daily: number;
        weekly: number;
        monthly: number;
        topCategories: { category: string; name: string; icon: string; average: number }[];
    } {
        const now = new Date();

        // Get all expenses
        const allExpenses = this.transactions.filter(t => t.type === 'expense');

        if (allExpenses.length === 0) {
            return { daily: 0, weekly: 0, monthly: 0, topCategories: [] };
        }

        // Find the earliest expense date
        const expenseDates = allExpenses.map(t => new Date(t.date).getTime());
        const earliestDate = new Date(Math.min(...expenseDates));

        // Calculate days since first expense (minimum 1 day)
        const daysDiff = Math.max(1, Math.ceil((now.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)));

        // Calculate months since first expense (minimum 1 month for monthly average)
        const monthsDiff = Math.max(1,
            (now.getFullYear() - earliestDate.getFullYear()) * 12 +
            (now.getMonth() - earliestDate.getMonth()) + 1
        );

        const totalExpense = allExpenses.reduce((sum, t) => sum + t.amount, 0);

        const daily = totalExpense / daysDiff;
        const weekly = daily * 7;
        const monthly = totalExpense / monthsDiff;

        // Calculate category averages
        const categoryTotals: Record<string, number> = {};
        for (const t of allExpenses) {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        }

        const topCategories = Object.entries(categoryTotals)
            .map(([categoryId, total]) => {
                const cat = this.settings.categories.find(c => c.id === categoryId);
                return {
                    category: categoryId,
                    name: cat?.name || categoryId,
                    icon: cat?.icon || '📦',
                    average: total / monthsDiff,
                };
            })
            .sort((a, b) => b.average - a.average)
            .slice(0, 5);

        return { daily, weekly, monthly, topCategories };
    }
    // Get category trends over time (with hierarchy - subcategories aggregated to parents)
    getCategoryTrends(months: number = 6): Array<{
        category: string;
        name: string;
        icon: string;
        color: string;
        data: { month: string; amount: number }[];
        subcategories?: Array<{
            category: string;
            name: string;
            icon: string;
            color: string;
            data: { month: string; amount: number }[];
        }>;
    }> {
        const now = new Date();

        // Get expense categories
        const expenseCategories = this.settings.categories.filter(c => c.type === 'expense' || c.type === 'both');
        const parentCategories = expenseCategories.filter(c => !c.parentId);
        const getSubcategories = (parentId: string) => expenseCategories.filter(c => c.parentId === parentId);

        // Helper to get trend data for a category (and optionally its children)
        const getTrendData = (categoryIds: string[]): { month: string; amount: number }[] => {
            const data: { month: string; amount: number }[] = [];

            for (let i = months - 1; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const monthKey = `${year}-${String(month).padStart(2, '0')}`;

                const monthTransactions = this.transactions.filter(t =>
                    categoryIds.includes(t.category) &&
                    t.type === 'expense' &&
                    t.date.startsWith(monthKey)
                );

                const amount = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
                data.push({ month: monthKey, amount });
            }

            return data;
        };

        const result: Array<{
            category: string;
            name: string;
            icon: string;
            color: string;
            data: { month: string; amount: number }[];
            subcategories?: Array<{
                category: string;
                name: string;
                icon: string;
                color: string;
                data: { month: string; amount: number }[];
            }>;
        }> = [];

        for (const parent of parentCategories) {
            const subcats = getSubcategories(parent.id);

            // Get IDs for parent + all subcategories
            const allCategoryIds = [parent.id, ...subcats.map(s => s.id)];

            // Get aggregated trend data
            const data = getTrendData(allCategoryIds);
            const hasData = data.some(d => d.amount > 0);

            if (hasData) {
                // Build subcategories trends
                const subcategoriesData: Array<{
                    category: string;
                    name: string;
                    icon: string;
                    color: string;
                    data: { month: string; amount: number }[];
                }> = [];

                for (const sub of subcats) {
                    const subData = getTrendData([sub.id]);
                    const subHasData = subData.some(d => d.amount > 0);

                    if (subHasData) {
                        subcategoriesData.push({
                            category: sub.id,
                            name: sub.name,
                            icon: sub.icon,
                            color: sub.color,
                            data: subData,
                        });
                    }
                }

                result.push({
                    category: parent.id,
                    name: parent.name,
                    icon: parent.icon,
                    color: parent.color,
                    data,
                    subcategories: subcategoriesData.length > 0 ? subcategoriesData : undefined,
                });
            }
        }

        // Sort by total amount (highest spending first)
        return result.sort((a, b) => {
            const totalA = a.data.reduce((sum, d) => sum + d.amount, 0);
            const totalB = b.data.reduce((sum, d) => sum + d.amount, 0);
            return totalB - totalA;
        });
    }

    // Get available years with transactions
    getAvailableYears(): number[] {
        const years = new Set<number>();
        for (const t of this.transactions) {
            const year = new Date(t.date).getFullYear();
            years.add(year);
        }
        return Array.from(years).sort((a, b) => b - a);
    }

    // Parse transactions from markdown content
    parseTransactionsFromMarkdown(content: string): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] {
        const transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [];

        // Find the transactions table - look for table rows after header
        const lines = content.split('\n');
        let inTable = false;
        let headerPassed = false;

        for (const line of lines) {
            const trimmed = line.trim();

            // Detect table start (header row with Date, Type, etc.)
            if (trimmed.startsWith('|') && (trimmed.includes('Date') || trimmed.includes('Data'))) {
                inTable = true;
                continue;
            }

            // Skip separator row
            if (inTable && trimmed.startsWith('|') && trimmed.includes('---')) {
                headerPassed = true;
                continue;
            }

            // End of table
            if (inTable && headerPassed && !trimmed.startsWith('|')) {
                break;
            }

            // Parse data row
            if (inTable && headerPassed && trimmed.startsWith('|')) {
                const cells = trimmed.split('|').map(c => c.trim()).filter(c => c.length > 0);

                if (cells.length >= 5) {
                    const [dateCell, typeCell, categoryCell, descCell, amountCell] = cells;

                    // Parse type from emoji - include investment type
                    let type: 'income' | 'expense' | 'investment' = 'expense';
                    if (typeCell?.includes('💚')) {
                        type = 'income';
                    } else if (typeCell?.includes('📈')) {
                        type = 'investment';
                    }

                    // Parse amount - remove sign, currency, and parse number
                    const amountMatch = amountCell?.match(/[+-]?([\d,]+\.?\d*)/);
                    const amount = amountMatch ? parseFloat(amountMatch[1]?.replace(/,/g, '') || '0') : 0;

                    // Extract currency from amount cell
                    const currencyMatch = amountCell?.match(/[A-Z]{3}/);
                    const currency = currencyMatch ? currencyMatch[0] : this.settings.defaultCurrency;

                    // Find category by icon or name
                    const categoryId = this.findCategoryIdFromDisplay(categoryCell || '');

                    // Parse date
                    const date = dateCell || '';

                    // Parse description - check for excludeFromStats marker (⚠️)
                    let description = descCell === '-' ? '' : (descCell || '');
                    let excludeFromStats = false;
                    if (description.includes('⚠️')) {
                        excludeFromStats = true;
                        description = description.replace('⚠️', '').trim();
                    }

                    if (date && amount > 0) {
                        transactions.push({
                            date,
                            amount,
                            type,
                            category: categoryId,
                            description,
                            currency,
                            excludeFromStats: excludeFromStats || undefined,
                        });
                    }
                }
            }
        }

        return transactions;
    }

    // Find category ID from display string (icon + name)
    private findCategoryIdFromDisplay(display: string): string {
        // First, try to find exact name match (most specific)
        // Check subcategories first (they have parentId), then parent categories
        const subcategories = this.settings.categories.filter(c => c.parentId);
        const parentCategories = this.settings.categories.filter(c => !c.parentId);

        // Check subcategories by name first (most specific match)
        for (const cat of subcategories) {
            if (display.includes(cat.name)) {
                return cat.id;
            }
        }

        // Check parent categories by name
        for (const cat of parentCategories) {
            if (display.includes(cat.name)) {
                return cat.id;
            }
        }

        // Fallback: check by icon (less specific)
        for (const cat of this.settings.categories) {
            if (display.includes(cat.icon)) {
                return cat.id;
            }
        }

        // Return as-is if no match (might be legacy category)
        return display.replace(/[^\w-]/g, '').toLowerCase() || 'other-expense';
    }

    // Check if transaction already exists (duplicate detection)
    private transactionExists(txn: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): boolean {
        return this.transactions.some(existing =>
            existing.date === txn.date &&
            Math.abs(existing.amount - txn.amount) < 0.01 &&
            existing.type === txn.type &&
            existing.category === txn.category
        );
    }

    // Sync transactions from markdown files in Budget folder
    async syncFromMarkdownFiles(): Promise<number> {
        const budgetFolder = this.settings.budgetFolder;
        let importedCount = 0;

        console.debug(`[Budget] Starting sync from markdown files in folder: ${budgetFolder}`);

        try {
            // Get all files in budget folder recursively
            const allFiles = this.app.vault.getFiles();
            console.debug(`[Budget] Total files in vault: ${allFiles.length}`);

            const files = allFiles.filter(f =>
                f.path.startsWith(budgetFolder) && f.extension === 'md'
            );
            console.debug(`[Budget] Found ${files.length} markdown files in budget folder`);

            for (const file of files) {
                try {
                    const content = await this.app.vault.read(file);
                    const parsedTransactions = this.parseTransactionsFromMarkdown(content);
                    console.debug(`[Budget] File ${file.path}: parsed ${parsedTransactions.length} transactions`);

                    for (const txn of parsedTransactions) {
                        if (!this.transactionExists(txn)) {
                            // Add without regenerating markdown (we're importing FROM markdown)
                            const now = new Date().toISOString();
                            this.transactions.push({
                                ...txn,
                                id: this.generateId(),
                                createdAt: now,
                                updatedAt: now,
                            });
                            importedCount++;
                            console.debug(`[Budget] Imported: ${txn.date} ${txn.type} ${txn.amount}`);
                        } else {
                            console.debug(`[Budget] Skipped duplicate: ${txn.date} ${txn.type} ${txn.amount}`);
                        }
                    }
                } catch (err) {
                    console.warn(`[Budget] Failed to parse ${file.path}:`, err);
                }
            }

            if (importedCount > 0) {
                console.debug(`[Budget] Imported ${importedCount} transactions from markdown files`);
            }
        } catch (err) {
            console.error('[Budget] Error syncing from markdown files:', err);
        }

        return importedCount;
    }
}
