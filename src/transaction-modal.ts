import { Modal } from 'obsidian';
import type { App } from 'obsidian';
import type { BudgetPluginSettings, Transaction } from './types';
import TransactionForm from './components/TransactionForm.svelte';

export class TransactionModal extends Modal {
    private settings: BudgetPluginSettings;
    private onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
    private onDelete: (() => void) | undefined;
    private editTransaction: Transaction | null;
    private component: TransactionForm | null = null;
    private defaultType: 'income' | 'expense';

    constructor(
        app: App,
        settings: BudgetPluginSettings,
        onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void,
        editTransaction?: Transaction,
        defaultType?: 'income' | 'expense',
        onDelete?: () => void
    ) {
        super(app);
        this.settings = settings;
        this.onSubmit = onSubmit;
        this.editTransaction = editTransaction ?? null;
        this.defaultType = defaultType ?? 'expense';
        this.onDelete = onDelete;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        this.component = new TransactionForm({
            target: contentEl,
            props: {
                settings: this.settings,
                editTransaction: this.editTransaction,
                defaultType: this.defaultType,
                onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
                    this.onSubmit(transaction);
                    this.close();
                },
                onClose: () => this.close(),
                onDelete: this.onDelete ? () => {
                    if (this.onDelete) {
                        this.onDelete();
                    }
                    this.close();
                } : undefined,
            },
        });
    }

    onClose() {
        if (this.component) {
            this.component.$destroy();
            this.component = null;
        }
        const { contentEl } = this;
        contentEl.empty();
    }
}
