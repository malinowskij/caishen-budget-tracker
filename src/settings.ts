import { PluginSettingTab, Setting, Notice } from 'obsidian';
import type { App } from 'obsidian';
import type BudgetTrackerPlugin from './main';
import type { Category, RecurringTransaction } from './types';
import { getDefaultCategories } from './types';
import type { Locale } from './i18n';
import { t } from './i18n';
import { RecurringModal } from './recurring-modal';

export class BudgetSettingsTab extends PluginSettingTab {
    plugin: BudgetTrackerPlugin;

    constructor(app: App, plugin: BudgetTrackerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        const trans = t(this.plugin.settings.locale);
        containerEl.empty();

        new Setting(containerEl).setName(trans.settingsTitle).setHeading();

        // General settings section
        new Setting(containerEl).setName(trans.general).setHeading();

        // Language selector
        new Setting(containerEl)
            .setName(trans.language)
            .setDesc(trans.languageDesc)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('en', 'English')
                    .addOption('pl', 'Polski')
                    .setValue(this.plugin.settings.locale)
                    .onChange(async (value: string) => {
                        this.plugin.settings.locale = value as Locale;
                        await this.plugin.saveSettings();
                        this.display(); // Refresh to show new language
                    });
            });

        new Setting(containerEl)
            .setName(trans.budgetFolder)
            .setDesc(trans.budgetFolderDesc)
            .addText(text => text
                .setPlaceholder('Budget')
                .setValue(this.plugin.settings.budgetFolder)
                .onChange(async (value) => {
                    this.plugin.settings.budgetFolder = value || 'Budget';
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(trans.defaultCurrency)
            .setDesc(trans.defaultCurrencyDesc)
            .addText(text => text
                .setPlaceholder('PLN')
                .setValue(this.plugin.settings.defaultCurrency)
                .onChange(async (value) => {
                    this.plugin.settings.defaultCurrency = value.toUpperCase() || 'PLN';
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(trans.showBalanceInStatusBar)
            .setDesc(trans.showBalanceInStatusBarDesc)
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showBalanceInStatusBar)
                .onChange(async (value) => {
                    this.plugin.settings.showBalanceInStatusBar = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateStatusBar();
                }));

        // Categories section - Expenses
        new Setting(containerEl).setName(trans.expenseCategories).setHeading();

        const expenseCategories = this.plugin.settings.categories.filter(c => c.type === 'expense');
        this.renderCategoryList(containerEl, expenseCategories, 'expense', trans);

        new Setting(containerEl)
            .addButton(button => button
                .setButtonText(trans.addExpenseCategory)
                .onClick(() => this.addNewCategory('expense')));

        // Categories section - Income
        new Setting(containerEl).setName(trans.incomeCategories).setHeading();

        const incomeCategories = this.plugin.settings.categories.filter(c => c.type === 'income');
        this.renderCategoryList(containerEl, incomeCategories, 'income', trans);

        new Setting(containerEl)
            .addButton(button => button
                .setButtonText(trans.addIncomeCategory)
                .onClick(() => this.addNewCategory('income')));

        // Recurring Transactions section
        new Setting(containerEl).setName(trans.recurringTransactions).setHeading();
        this.renderRecurringList(containerEl, trans);

        // Reset to defaults
        new Setting(containerEl).setName(trans.reset).setHeading();

        new Setting(containerEl)
            .setName(trans.restoreDefaultCategories)
            .setDesc(trans.restoreDefaultCategoriesDesc)
            .addButton(button => button
                .setButtonText(trans.restoreDefaults)
                .setWarning()
                .onClick(async () => {
                    this.plugin.settings.categories = getDefaultCategories(this.plugin.settings.locale);
                    await this.plugin.saveSettings();
                    this.display();
                    new Notice(trans.restoredDefaultCategories);
                }));
    }

    private renderCategoryList(containerEl: HTMLElement, categories: Category[], type: 'income' | 'expense', trans: ReturnType<typeof t>) {
        // Separate parent categories and subcategories
        const parentCategories = categories.filter(c => !c.parentId);
        const getSubcategories = (parentId: string) => categories.filter(c => c.parentId === parentId);

        for (const category of parentCategories) {
            const subcategories = getSubcategories(category.id);

            // Render parent category
            this.renderCategoryItem(containerEl, category, trans, false, subcategories.length > 0);

            // Render subcategories with indent
            for (const sub of subcategories) {
                this.renderCategoryItem(containerEl, sub, trans, true, false);
            }
        }
    }

    private renderCategoryItem(
        containerEl: HTMLElement,
        category: Category,
        trans: ReturnType<typeof t>,
        isSubcategory: boolean,
        hasChildren: boolean
    ) {
        const prefix = isSubcategory ? '↳ ' : '';
        const setting = new Setting(containerEl)
            .setName(`${prefix}${category.icon} ${category.name}`)
            .setDesc(isSubcategory ? trans.subcategory : (hasChildren ? trans.parentCategory : ''));

        // Add indent styling for subcategories
        if (isSubcategory) {
            setting.settingEl.addClass('budget-subcategory-item');
        }

        // Edit name
        setting.addText(text => text
            .setPlaceholder(trans.categoryName)
            .setValue(category.name)
            .onChange(async (value) => {
                category.name = value;
                await this.plugin.saveSettings();
            }));

        // Edit icon
        setting.addText(text => {
            text.inputEl.addClass('budget-icon-input');
            text.setPlaceholder('🏷️')
                .setValue(category.icon)
                .onChange(async (value) => {
                    category.icon = value;
                    await this.plugin.saveSettings();
                });
        });

        // Color picker
        setting.addColorPicker(picker => picker
            .setValue(category.color)
            .onChange(async (value) => {
                category.color = value;
                await this.plugin.saveSettings();
            }));

        // Budget limit (only for expense categories)
        if (category.type === 'expense') {
            setting.addText(text => {
                text.inputEl.addClass('budget-limit-input');
                text.inputEl.type = 'number';
                text.setPlaceholder('0')
                    .setValue((category.budgetLimit ?? 0).toString())
                    .onChange(async (value) => {
                        category.budgetLimit = parseFloat(value) || 0;
                        await this.plugin.saveSettings();
                    });
            });
        }

        // Add subcategory button (only for parent categories)
        if (!isSubcategory) {
            setting.addButton(button => button
                .setIcon('plus')
                .setTooltip(trans.subcategory)
                .onClick(() => this.addSubcategory(category)));
        }

        // Delete button
        setting.addButton(button => button
            .setIcon('trash')
            .setWarning()
            .onClick(async () => {
                // Also delete subcategories
                const subcats = this.plugin.settings.categories.filter(c => c.parentId === category.id);
                for (const sub of subcats) {
                    const subIndex = this.plugin.settings.categories.findIndex(c => c.id === sub.id);
                    if (subIndex > -1) {
                        this.plugin.settings.categories.splice(subIndex, 1);
                    }
                }

                const index = this.plugin.settings.categories.findIndex(c => c.id === category.id);
                if (index > -1) {
                    this.plugin.settings.categories.splice(index, 1);
                    await this.plugin.saveSettings();
                    this.display();
                    new Notice(`${trans.deletedCategory} ${category.name}`);
                }
            }));
    }

    private async addSubcategory(parent: Category) {
        const trans = t(this.plugin.settings.locale);
        const id = `sub-${Date.now()}`;
        const newCategory: Category = {
            id,
            name: trans.subcategory,
            icon: parent.icon,
            type: parent.type,
            color: parent.color,
            parentId: parent.id,
        };

        this.plugin.settings.categories.push(newCategory);
        await this.plugin.saveSettings();
        this.display();
        new Notice(`${trans.addedNewCategory} (${parent.name})`);
    }

    private async addNewCategory(type: 'income' | 'expense') {
        const trans = t(this.plugin.settings.locale);
        const id = `custom-${Date.now()}`;
        const newCategory: Category = {
            id,
            name: type === 'income' ? trans.defaultCategories.newIncome : trans.defaultCategories.newExpense,
            icon: type === 'income' ? '💵' : '💸',
            type,
            color: type === 'income' ? '#27ae60' : '#e74c3c',
        };

        this.plugin.settings.categories.push(newCategory);
        await this.plugin.saveSettings();
        this.display();
        new Notice(trans.addedNewCategory);
    }

    private renderRecurringList(containerEl: HTMLElement, trans: ReturnType<typeof t>) {
        const recurring = this.plugin.settings.recurringTransactions || [];

        for (const item of recurring) {
            const cat = this.plugin.settings.categories.find(c => c.id === item.category);
            const setting = new Setting(containerEl)
                .setName(`${cat?.icon ?? '📦'} ${item.name}`)
                .setDesc(`${trans.dayOfMonth} ${item.dayOfMonth} • ${item.type === 'income' ? '+' : '-'}${item.amount} ${this.plugin.settings.defaultCurrency}`);

            // Toggle active
            setting.addToggle(toggle => toggle
                .setValue(item.isActive)
                .onChange(async (value) => {
                    item.isActive = value;
                    await this.plugin.saveSettings();
                }));

            // Edit button
            setting.addButton(button => button
                .setIcon('pencil')
                .onClick(() => {
                    const modal = new RecurringModal(
                        this.app,
                        this.plugin.settings,
                        (updatedItem) => {
                            void (async () => {
                                Object.assign(item, updatedItem);
                                await this.plugin.saveSettings();
                                this.display();
                            })();
                        },
                        item
                    );
                    modal.open();
                }));

            // Delete button
            setting.addButton(button => button
                .setIcon('trash')
                .setWarning()
                .onClick(async () => {
                    const index = this.plugin.settings.recurringTransactions.findIndex(r => r.id === item.id);
                    if (index > -1) {
                        this.plugin.settings.recurringTransactions.splice(index, 1);
                        await this.plugin.saveSettings();
                        this.display();
                    }
                }));
        }

        // Add new recurring button
        new Setting(containerEl)
            .addButton(button => button
                .setButtonText(trans.addRecurring)
                .setCta()
                .onClick(() => {
                    const modal = new RecurringModal(
                        this.app,
                        this.plugin.settings,
                        (newItem) => {
                            void (async () => {
                                const fullItem: RecurringTransaction = {
                                    ...newItem,
                                    id: `recurring-${Date.now()}`,
                                };
                                if (!this.plugin.settings.recurringTransactions) {
                                    this.plugin.settings.recurringTransactions = [];
                                }
                                this.plugin.settings.recurringTransactions.push(fullItem);
                                await this.plugin.saveSettings();
                                this.display();
                            })();
                        }
                    );
                    modal.open();
                }));
    }
}
