import { App, TFile } from 'obsidian';
import { Transaction, MonthlySummary, BudgetPluginSettings } from './types';
import { Locale, t } from './i18n';

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
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Load all transactions from plugin data
    async loadTransactions(data: Record<string, unknown> | null): Promise<Transaction[]> {
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

    // Get transactions for a specific month
    getTransactionsForMonth(year: number, month: number): Transaction[] {
        return this.transactions.filter(t => {
            const date = new Date(t.date);
            return date.getFullYear() === year && date.getMonth() + 1 === month;
        });
    }

    // Get monthly summary
    getMonthlySummary(year: number, month: number): MonthlySummary {
        const monthTransactions = this.getTransactionsForMonth(year, month);

        let totalIncome = 0;
        let totalExpense = 0;
        const byCategory: Record<string, number> = {};

        for (const txn of monthTransactions) {
            if (txn.type === 'income') {
                totalIncome += txn.amount;
            } else {
                totalExpense += txn.amount;
            }

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
                const typeEmoji = txn.type === 'income' ? '💚' : '🔴';
                const amountSign = txn.type === 'income' ? '+' : '-';

                content += `| ${txn.date} | ${typeEmoji} | ${categoryDisplay} | ${txn.description || '-'} | ${amountSign}${this.formatAmount(txn.amount, txn.currency)} |\n`;
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

    // Get spending by category for current month
    getCategoryBreakdown(year: number, month: number): Array<{ category: string; name: string; amount: number; color: string; icon: string }> {
        const summary = this.getMonthlySummary(year, month);
        const result: Array<{ category: string; name: string; amount: number; color: string; icon: string }> = [];

        for (const [categoryId, amount] of Object.entries(summary.byCategory)) {
            const category = this.settings.categories.find(c => c.id === categoryId);
            if (category && category.type !== 'income') {
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
}
