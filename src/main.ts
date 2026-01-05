import { Plugin, Notice } from 'obsidian';
import type { BudgetPluginSettings, Transaction, IBudgetPlugin, IDataService } from './types';
import { getDefaultSettings } from './types';
import { DataService } from './data-service';
import { TransactionModal } from './transaction-modal';
import { BudgetSettingsTab } from './settings';
import { BudgetDashboardView, DASHBOARD_VIEW_TYPE } from './dashboard-view';
import { detectLocale, t } from './i18n';

export default class BudgetTrackerPlugin extends Plugin implements IBudgetPlugin {
    settings!: BudgetPluginSettings;
    dataService!: IDataService;
    private _dataService!: DataService;
    private statusBarItem: HTMLElement | null = null;

    async onload() {
        await this.loadSettings();

        // Initialize data service
        this._dataService = new DataService(this.app, this.settings);
        this.dataService = this._dataService;
        const savedData = await this.loadData();
        await this._dataService.loadTransactions(savedData);

        // Register dashboard view
        this.registerView(
            DASHBOARD_VIEW_TYPE,
            (leaf) => new BudgetDashboardView(leaf, this)
        );

        // Add ribbon icon for quick transaction add
        this.addRibbonIcon('wallet', t(this.settings.locale).addTransaction, () => {
            this.openTransactionModal();
        });

        // Status bar with current balance
        if (this.settings.showBalanceInStatusBar) {
            this.statusBarItem = this.addStatusBarItem();
            this.updateStatusBar();
        }

        // Commands
        const trans = t(this.settings.locale);

        this.addCommand({
            id: 'add-transaction',
            name: trans.addTransaction,
            callback: () => this.openTransactionModal(),
        });

        this.addCommand({
            id: 'add-expense',
            name: trans.addExpense,
            callback: () => this.openTransactionModal('expense'),
        });

        this.addCommand({
            id: 'add-income',
            name: trans.addIncome,
            callback: () => this.openTransactionModal('income'),
        });

        this.addCommand({
            id: 'open-dashboard',
            name: trans.budgetDashboard,
            callback: () => this.openDashboard(),
        });

        // Settings tab
        this.addSettingTab(new BudgetSettingsTab(this.app, this));

        // Process recurring transactions
        await this.processRecurringTransactions();

        console.log('Budget Tracker plugin loaded');
    }

    async processRecurringTransactions() {
        const now = new Date();
        const currentDay = now.getDate();
        const recurring = this.settings.recurringTransactions || [];
        let hasChanges = false;

        for (const item of recurring) {
            if (!item.isActive) continue;

            // Determine start date for backfilling
            // Use lastProcessed if available, otherwise use createdAt, otherwise skip
            let startDate: Date;
            if (item.lastProcessed) {
                startDate = new Date(item.lastProcessed);
            } else if (item.createdAt) {
                // For new items, start from the month they were created
                startDate = new Date(item.createdAt);
                // Set to the previous month so we start processing from createdAt month
                startDate.setMonth(startDate.getMonth() - 1);
            } else {
                // No createdAt means this is a legacy item, set it and skip this run
                item.createdAt = now.toISOString().split('T')[0];
                hasChanges = true;
                continue;
            }

            // Start from the month after lastProcessed
            let processDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);

            // Process all months up to current month
            while (
                processDate.getFullYear() < now.getFullYear() ||
                (processDate.getFullYear() === now.getFullYear() && processDate.getMonth() <= now.getMonth())
            ) {
                const year = processDate.getFullYear();
                const month = processDate.getMonth() + 1;
                const monthKey = `${year}-${String(month).padStart(2, '0')}`;

                // For current month, only process if we've passed the day
                if (processDate.getFullYear() === now.getFullYear() && processDate.getMonth() === now.getMonth()) {
                    if (currentDay < item.dayOfMonth) {
                        break; // Not yet time for this month
                    }
                }

                // Add transaction for this month
                const transactionDate = `${monthKey}-${String(item.dayOfMonth).padStart(2, '0')}`;

                await this._dataService.addTransaction({
                    date: transactionDate,
                    amount: item.amount,
                    type: item.type,
                    category: item.category,
                    description: `🔄 ${item.name}`,
                    currency: this.settings.defaultCurrency,
                });

                item.lastProcessed = transactionDate;
                hasChanges = true;
                console.log(`Auto-added recurring: ${item.name} for ${monthKey}`);

                // Move to next month
                processDate.setMonth(processDate.getMonth() + 1);
            }
        }

        if (hasChanges) {
            await this.saveTransactionData();
            this.updateStatusBar();
        }
    }

    onunload() {
        console.log('Budget Tracker plugin unloaded');
    }

    async loadSettings() {
        const savedData = await this.loadData();
        const detectedLocale = detectLocale();
        const defaultSettings = getDefaultSettings(detectedLocale);
        this.settings = Object.assign({}, defaultSettings, savedData);
    }

    async saveSettings(): Promise<void> {
        await this.saveAllData();
        this._dataService.updateSettings(this.settings);
    }

    async saveTransactionData(): Promise<void> {
        await this.saveAllData();
    }

    private async saveAllData(): Promise<void> {
        await this.saveData({
            ...this.settings,
            ...this._dataService.getDataForSave(),
        });
    }

    openTransactionModal(defaultType?: 'income' | 'expense') {
        const modal = new TransactionModal(
            this.app,
            this.settings,
            async (transactionData) => {
                await this._dataService.addTransaction(transactionData);
                await this.saveTransactionData();
                this.updateStatusBar();
                this.refreshDashboard();
                const trans = t(this.settings.locale);
                const typeLabel = transactionData.type === 'income' ? trans.income : trans.expense;
                new Notice(`${trans.noticeTransactionAdded} ${typeLabel}: ${transactionData.amount} ${transactionData.currency}`);
            },
            undefined,
            defaultType
        );

        modal.open();
    }

    openEditTransactionModal(transaction: Transaction) {
        const modal = new TransactionModal(
            this.app,
            this.settings,
            async (transactionData) => {
                await this._dataService.updateTransaction(transaction.id, transactionData);
                await this.saveTransactionData();
                this.updateStatusBar();
                this.refreshDashboard();
                const trans = t(this.settings.locale);
                new Notice(`✅ ${trans.saveChanges}`);
            },
            transaction,
            undefined,
            async () => {
                await this._dataService.deleteTransaction(transaction.id);
                await this.saveTransactionData();
                this.updateStatusBar();
                this.refreshDashboard();
                const trans = t(this.settings.locale);
                new Notice(`🗑️ ${trans.delete}`);
            }
        );

        modal.open();
    }

    async openDashboard() {
        const existing = this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE);

        if (existing.length > 0 && existing[0]) {
            this.app.workspace.revealLeaf(existing[0]);
        } else {
            const leaf = this.app.workspace.getRightLeaf(false);
            if (leaf) {
                await leaf.setViewState({
                    type: DASHBOARD_VIEW_TYPE,
                    active: true,
                });
                this.app.workspace.revealLeaf(leaf);
            }
        }
    }

    updateStatusBar() {
        if (!this.statusBarItem) {
            if (this.settings.showBalanceInStatusBar) {
                this.statusBarItem = this.addStatusBarItem();
            } else {
                return;
            }
        }

        if (!this.settings.showBalanceInStatusBar) {
            this.statusBarItem.remove();
            this.statusBarItem = null;
            return;
        }

        const summary = this._dataService.getCurrentMonthSummary();
        const sign = summary.balance >= 0 ? '+' : '';
        const emoji = summary.balance >= 0 ? '💚' : '🔴';
        this.statusBarItem.setText(`${emoji} ${sign}${summary.balance.toFixed(2)} ${this.settings.defaultCurrency}`);
    }

    refreshDashboard() {
        const leaves = this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE);
        for (const leaf of leaves) {
            const view = leaf.view;
            if (view instanceof BudgetDashboardView) {
                view.refresh();
            }
        }
    }
}
