import { ItemView, WorkspaceLeaf } from 'obsidian';
import BudgetTrackerPlugin from './main';
import { t } from './i18n';

export const DASHBOARD_VIEW_TYPE = 'budget-dashboard-view';

export class BudgetDashboardView extends ItemView {
    plugin: BudgetTrackerPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: BudgetTrackerPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return DASHBOARD_VIEW_TYPE;
    }

    getDisplayText(): string {
        return t(this.plugin.settings.locale).budgetDashboard;
    }

    getIcon(): string {
        return 'wallet';
    }

    async onOpen() {
        await this.render();
    }

    async onClose() {
        // Cleanup
    }

    async render() {
        const container = this.containerEl.children[1];
        if (!container) return;
        container.empty();
        container.addClass('budget-dashboard');

        const trans = t(this.plugin.settings.locale);
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const monthName = trans.months[month - 1] ?? 'Unknown';

        // Header
        const header = container.createDiv('budget-dashboard-header');
        header.createEl('h1', { text: trans.budgetDashboard });
        header.createEl('p', { text: `${monthName} ${year}`, cls: 'budget-subtitle' });

        // Quick actions
        const actions = container.createDiv('budget-actions');
        const addExpenseBtn = actions.createEl('button', { text: trans.addExpense, cls: 'mod-cta' });
        addExpenseBtn.onclick = () => this.plugin.openTransactionModal('expense');

        const addIncomeBtn = actions.createEl('button', { text: trans.addIncome });
        addIncomeBtn.onclick = () => this.plugin.openTransactionModal('income');

        // Summary cards
        const summary = this.plugin.dataService.getCurrentMonthSummary();
        const cardsContainer = container.createDiv('budget-cards');

        // Income card
        const incomeCard = cardsContainer.createDiv('budget-card income');
        incomeCard.createEl('div', { text: trans.incomes, cls: 'card-label' });
        incomeCard.createEl('div', { text: `${summary.totalIncome.toFixed(2)} ${this.plugin.settings.defaultCurrency}`, cls: 'card-value' });

        // Expense card
        const expenseCard = cardsContainer.createDiv('budget-card expense');
        expenseCard.createEl('div', { text: trans.expenses, cls: 'card-label' });
        expenseCard.createEl('div', { text: `${summary.totalExpense.toFixed(2)} ${this.plugin.settings.defaultCurrency}`, cls: 'card-value' });

        // Balance card
        const balanceCard = cardsContainer.createDiv(`budget-card balance ${summary.balance >= 0 ? 'positive' : 'negative'}`);
        balanceCard.createEl('div', { text: trans.balance, cls: 'card-label' });
        const sign = summary.balance >= 0 ? '+' : '';
        balanceCard.createEl('div', { text: `${sign}${summary.balance.toFixed(2)} ${this.plugin.settings.defaultCurrency}`, cls: 'card-value' });

        // Category breakdown
        const categorySection = container.createDiv('budget-section');
        categorySection.createEl('h2', { text: trans.categoryBreakdown });

        const breakdown = this.plugin.dataService.getCategoryBreakdown(year, month);

        if (breakdown.length > 0) {
            const categoryList = categorySection.createDiv('category-breakdown');
            const maxAmount = Math.max(...breakdown.map(b => b.amount));

            for (const item of breakdown) {
                const row = categoryList.createDiv('category-row');

                const labelContainer = row.createDiv('category-label');
                labelContainer.createSpan({ text: `${item.icon} ${item.name}` });
                labelContainer.createSpan({ text: `${item.amount.toFixed(2)} ${this.plugin.settings.defaultCurrency}`, cls: 'category-amount' });

                const barContainer = row.createDiv('category-bar-container');
                const bar = barContainer.createDiv('category-bar');
                const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                bar.style.width = `${percentage}%`;
                bar.style.backgroundColor = item.color;
            }
        } else {
            categorySection.createEl('p', { text: trans.noExpensesThisMonth, cls: 'empty-state' });
        }

        // Trend section
        const trendSection = container.createDiv('budget-section');
        trendSection.createEl('h2', { text: trans.trendLastMonths });

        const trends = this.plugin.dataService.getMonthlyTrends(6);
        const trendContainer = trendSection.createDiv('trend-chart');

        const maxTrendValue = Math.max(...trends.flatMap(t => [t.income, t.expense]));

        if (maxTrendValue > 0) {
            for (const trend of trends) {
                const monthCol = trendContainer.createDiv('trend-month');

                const barsContainer = monthCol.createDiv('trend-bars');

                const incomeBar = barsContainer.createDiv('trend-bar income');
                const incomeHeight = maxTrendValue > 0 ? (trend.income / maxTrendValue) * 100 : 0;
                incomeBar.style.height = `${incomeHeight}%`;
                incomeBar.setAttribute('title', `${trans.incomes}: ${trend.income.toFixed(2)}`);

                const expenseBar = barsContainer.createDiv('trend-bar expense');
                const expenseHeight = maxTrendValue > 0 ? (trend.expense / maxTrendValue) * 100 : 0;
                expenseBar.style.height = `${expenseHeight}%`;
                expenseBar.setAttribute('title', `${trans.expenses}: ${trend.expense.toFixed(2)}`);

                const trendMonthName = trans.months[trend.month - 1] ?? '';
                monthCol.createDiv({ text: trendMonthName.substring(0, 3), cls: 'trend-label' });
            }

            // Legend
            const legend = trendSection.createDiv('trend-legend');
            legend.createSpan({ text: trans.incomes, cls: 'legend-income' });
            legend.createSpan({ text: trans.expenses, cls: 'legend-expense' });
        } else {
            trendSection.createEl('p', { text: trans.noDataToDisplay, cls: 'empty-state' });
        }

        // Recent transactions
        const recentSection = container.createDiv('budget-section');
        recentSection.createEl('h2', { text: trans.recentTransactions });

        const recentTransactions = this.plugin.dataService.getRecentTransactions(5);

        if (recentTransactions.length > 0) {
            const transactionList = recentSection.createDiv('transaction-list');

            for (const txn of recentTransactions) {
                const row = transactionList.createDiv('transaction-row');

                const category = this.plugin.settings.categories.find(c => c.id === txn.category);
                const categoryIcon = category?.icon ?? '📦';
                const categoryName = category?.name ?? txn.category;

                const leftPart = row.createDiv('transaction-left');
                leftPart.createSpan({ text: categoryIcon, cls: 'transaction-icon' });
                const details = leftPart.createDiv('transaction-details');
                details.createDiv({ text: categoryName, cls: 'transaction-category' });
                details.createDiv({ text: txn.description || txn.date, cls: 'transaction-desc' });

                const rightPart = row.createDiv('transaction-right');
                const amountSign = txn.type === 'income' ? '+' : '-';
                const amountClass = txn.type === 'income' ? 'amount-income' : 'amount-expense';
                rightPart.createSpan({ text: `${amountSign}${txn.amount.toFixed(2)} ${txn.currency}`, cls: amountClass });
            }
        } else {
            recentSection.createEl('p', { text: trans.noTransactionsYet, cls: 'empty-state' });
        }

        // Refresh button
        const refreshBtn = container.createEl('button', { text: `🔄 ${trans.refresh}`, cls: 'budget-refresh' });
        refreshBtn.onclick = () => this.render();
    }
}
