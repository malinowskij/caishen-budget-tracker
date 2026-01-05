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

                    // Parse type from emoji
                    const type: 'income' | 'expense' = typeCell?.includes('💚') ? 'income' : 'expense';

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

                    // Parse description
                    const description = descCell === '-' ? '' : (descCell || '');

                    if (date && amount > 0) {
                        transactions.push({
                            date,
                            amount,
                            type,
                            category: categoryId,
                            description,
                            currency,
                        });
                    }
                }
            }
        }

        return transactions;
    }

    // Find category ID from display string (icon + name)
    private findCategoryIdFromDisplay(display: string): string {
        for (const cat of this.settings.categories) {
            if (display.includes(cat.icon) || display.includes(cat.name)) {
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

        console.log(`[Budget] Starting sync from markdown files in folder: ${budgetFolder}`);

        try {
            // Get all files in budget folder recursively
            const allFiles = this.app.vault.getFiles();
            console.log(`[Budget] Total files in vault: ${allFiles.length}`);

            const files = allFiles.filter(f =>
                f.path.startsWith(budgetFolder) && f.extension === 'md'
            );
            console.log(`[Budget] Found ${files.length} markdown files in budget folder`);

            for (const file of files) {
                try {
                    const content = await this.app.vault.read(file);
                    const parsedTransactions = this.parseTransactionsFromMarkdown(content);
                    console.log(`[Budget] File ${file.path}: parsed ${parsedTransactions.length} transactions`);

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
                            console.log(`[Budget] Imported: ${txn.date} ${txn.type} ${txn.amount}`);
                        } else {
                            console.log(`[Budget] Skipped duplicate: ${txn.date} ${txn.type} ${txn.amount}`);
                        }
                    }
                } catch (err) {
                    console.warn(`[Budget] Failed to parse ${file.path}:`, err);
                }
            }

            if (importedCount > 0) {
                console.log(`[Budget] Imported ${importedCount} transactions from markdown files`);
            }
        } catch (err) {
            console.error('[Budget] Error syncing from markdown files:', err);
        }

        return importedCount;
    }
}
