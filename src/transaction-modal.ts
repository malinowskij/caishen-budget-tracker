import { App, Modal } from 'obsidian';
import type { BudgetPluginSettings, Transaction } from './types';
import TransactionForm from './components/TransactionForm.svelte';

export class TransactionModal extends Modal {
    private settings: BudgetPluginSettings;
    private onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
    private editTransaction: Transaction | null;
    private component: TransactionForm | null = null;
    private defaultType: 'income' | 'expense';

    constructor(
        app: App,
        settings: BudgetPluginSettings,
        onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void,
        editTransaction?: Transaction,
        defaultType?: 'income' | 'expense'
    ) {
        super(app);
        this.settings = settings;
        this.onSubmit = onSubmit;
        this.editTransaction = editTransaction ?? null;
        this.defaultType = defaultType ?? 'expense';
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        this.component = new TransactionForm({
            target: contentEl,
            props: {
                settings: this.settings,
                editTransaction: this.editTransaction,
                onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
                    this.onSubmit(transaction);
                    this.close();
                },
                onClose: () => this.close(),
            },
        });

        // Set default type if specified
        if (this.defaultType && !this.editTransaction) {
            (this.component as any).$set({ type: this.defaultType });
        }
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

export class ConfirmModal extends Modal {
    private message: string;
    private onConfirm: () => void;

    constructor(app: App, message: string, onConfirm: () => void) {
        super(app);
        this.message = message;
        this.onConfirm = onConfirm;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: '⚠️ Confirm' });
        contentEl.createEl('p', { text: this.message });

        const buttonContainer = contentEl.createDiv('modal-button-container');
        buttonContainer.style.marginTop = '20px';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '10px';

        const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
        cancelBtn.onclick = () => this.close();

        const confirmBtn = buttonContainer.createEl('button', {
            text: 'Confirm',
            cls: 'mod-warning'
        });
        confirmBtn.onclick = () => {
            this.onConfirm();
            this.close();
        };
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
