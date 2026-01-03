import { App, Modal, Setting, DropdownComponent } from 'obsidian';
import { Transaction, Category, BudgetPluginSettings } from './types';
import { t } from './i18n';

export class TransactionModal extends Modal {
    private settings: BudgetPluginSettings;
    private onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
    private editTransaction: Transaction | null;

    // Form fields
    private type: 'income' | 'expense' = 'expense';
    private date: string;
    private amount: number = 0;
    private category: string = '';
    private description: string = '';
    private currency: string;

    constructor(
        app: App,
        settings: BudgetPluginSettings,
        onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void,
        editTransaction?: Transaction
    ) {
        super(app);
        this.settings = settings;
        this.onSubmit = onSubmit;
        this.editTransaction = editTransaction ?? null;

        // Set defaults
        this.currency = settings.defaultCurrency;
        this.date = new Date().toISOString().split('T')[0] ?? '';

        // If editing, populate fields
        if (editTransaction) {
            this.type = editTransaction.type;
            this.date = editTransaction.date;
            this.amount = editTransaction.amount;
            this.category = editTransaction.category;
            this.description = editTransaction.description;
            this.currency = editTransaction.currency;
        }
    }

    onOpen() {
        const { contentEl } = this;
        const trans = t(this.settings.locale);
        contentEl.empty();
        contentEl.addClass('budget-transaction-modal');

        // Title
        const title = this.editTransaction ? trans.editTransaction : trans.newTransaction;
        contentEl.createEl('h2', { text: title });

        // Type selector (Income / Expense)
        let categoryDropdown: DropdownComponent;

        new Setting(contentEl)
            .setName(trans.transactionType)
            .setDesc(trans.transactionTypeDesc)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('expense', `🔴 ${trans.expense}`)
                    .addOption('income', `💚 ${trans.income}`)
                    .setValue(this.type)
                    .onChange((value: string) => {
                        this.type = value as 'income' | 'expense';
                        this.updateCategoryDropdown(categoryDropdown);
                    });
            });

        // Date
        new Setting(contentEl)
            .setName(trans.date)
            .setDesc(trans.dateDesc)
            .addText(text => {
                text.inputEl.type = 'date';
                text.setValue(this.date)
                    .onChange(value => {
                        this.date = value;
                    });
            });

        // Amount with currency
        const amountSetting = new Setting(contentEl)
            .setName(trans.amount)
            .setDesc(trans.amountDesc);

        amountSetting.addText(text => {
            text.inputEl.type = 'number';
            text.inputEl.step = '0.01';
            text.inputEl.min = '0';
            text.setPlaceholder('0.00')
                .setValue(this.amount > 0 ? String(this.amount) : '')
                .onChange(value => {
                    this.amount = parseFloat(value) || 0;
                });
        });

        amountSetting.addDropdown(dropdown => {
            for (const curr of this.settings.currencies) {
                dropdown.addOption(curr, curr);
            }
            dropdown.setValue(this.currency)
                .onChange(value => {
                    this.currency = value;
                });
        });

        // Category
        new Setting(contentEl)
            .setName(trans.category)
            .setDesc(trans.categoryDesc)
            .addDropdown(dropdown => {
                categoryDropdown = dropdown;
                this.updateCategoryDropdown(dropdown);
            });

        // Description
        new Setting(contentEl)
            .setName(trans.description)
            .setDesc(trans.descriptionDesc)
            .addText(text => {
                text.setPlaceholder(trans.descriptionPlaceholder)
                    .setValue(this.description)
                    .onChange(value => {
                        this.description = value;
                    });
                text.inputEl.style.width = '100%';
            });

        // Submit button
        const buttonContainer = contentEl.createDiv('modal-button-container');
        buttonContainer.style.marginTop = '20px';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '10px';

        const cancelBtn = buttonContainer.createEl('button', { text: trans.cancel });
        cancelBtn.onclick = () => this.close();

        const submitBtn = buttonContainer.createEl('button', {
            text: this.editTransaction ? trans.saveChanges : trans.addTransaction,
            cls: 'mod-cta'
        });
        submitBtn.onclick = () => this.submit();
    }

    private updateCategoryDropdown(dropdown: DropdownComponent) {
        const categories = this.settings.categories.filter(
            c => c.type === this.type || c.type === 'both'
        );

        // Clear and repopulate
        dropdown.selectEl.empty();

        for (const cat of categories) {
            dropdown.addOption(cat.id, `${cat.icon} ${cat.name}`);
        }

        // Set value
        const currentCategoryValid = categories.some(c => c.id === this.category);
        if (!currentCategoryValid && categories.length > 0) {
            const firstCategory = categories[0];
            if (firstCategory) {
                this.category = firstCategory.id;
            }
        }
        dropdown.setValue(this.category);
        dropdown.onChange(value => {
            this.category = value;
        });
    }

    private submit() {
        // Validation
        if (this.amount <= 0) {
            return;
        }
        if (!this.category) {
            return;
        }
        if (!this.date) {
            return;
        }

        this.onSubmit({
            type: this.type,
            date: this.date,
            amount: this.amount,
            category: this.category,
            description: this.description,
            currency: this.currency,
        });

        this.close();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// Confirmation modal for deletion
export class ConfirmModal extends Modal {
    private message: string;
    private onConfirm: () => void;
    private locale: 'en' | 'pl';

    constructor(app: App, message: string, onConfirm: () => void, locale: 'en' | 'pl' = 'en') {
        super(app);
        this.message = message;
        this.onConfirm = onConfirm;
        this.locale = locale;
    }

    onOpen() {
        const { contentEl } = this;
        const trans = t(this.locale);

        contentEl.createEl('h2', { text: trans.confirmTitle });
        contentEl.createEl('p', { text: this.message });

        const buttonContainer = contentEl.createDiv('modal-button-container');
        buttonContainer.style.marginTop = '20px';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '10px';

        const cancelBtn = buttonContainer.createEl('button', { text: trans.cancel });
        cancelBtn.onclick = () => this.close();

        const confirmBtn = buttonContainer.createEl('button', {
            text: trans.confirm,
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
