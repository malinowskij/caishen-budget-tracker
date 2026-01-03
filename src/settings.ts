import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import BudgetTrackerPlugin from './main';
import { Category, getDefaultCategories } from './types';
import { Locale, t, translations } from './i18n';

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

        containerEl.createEl('h1', { text: trans.settingsTitle });

        // General settings section
        containerEl.createEl('h2', { text: trans.general });

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
            .addDropdown(dropdown => {
                for (const curr of this.plugin.settings.currencies) {
                    dropdown.addOption(curr, curr);
                }
                dropdown.setValue(this.plugin.settings.defaultCurrency)
                    .onChange(async (value) => {
                        this.plugin.settings.defaultCurrency = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName(trans.availableCurrencies)
            .setDesc(trans.availableCurrenciesDesc)
            .addText(text => text
                .setPlaceholder('USD,EUR,GBP,PLN')
                .setValue(this.plugin.settings.currencies.join(','))
                .onChange(async (value) => {
                    this.plugin.settings.currencies = value.split(',').map(c => c.trim()).filter(c => c);
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
        containerEl.createEl('h2', { text: trans.expenseCategories });

        const expenseCategories = this.plugin.settings.categories.filter(c => c.type === 'expense');
        this.renderCategoryList(containerEl, expenseCategories, 'expense', trans);

        new Setting(containerEl)
            .addButton(button => button
                .setButtonText(trans.addExpenseCategory)
                .onClick(() => this.addNewCategory('expense')));

        // Categories section - Income
        containerEl.createEl('h2', { text: trans.incomeCategories });

        const incomeCategories = this.plugin.settings.categories.filter(c => c.type === 'income');
        this.renderCategoryList(containerEl, incomeCategories, 'income', trans);

        new Setting(containerEl)
            .addButton(button => button
                .setButtonText(trans.addIncomeCategory)
                .onClick(() => this.addNewCategory('income')));

        // Reset to defaults
        containerEl.createEl('h2', { text: trans.reset });

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
        for (const category of categories) {
            const setting = new Setting(containerEl)
                .setName(`${category.icon} ${category.name}`)
                .setDesc(`${trans.categoryId} ${category.id}`);

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
                text.inputEl.style.width = '50px';
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

            // Delete button
            setting.addButton(button => button
                .setIcon('trash')
                .setWarning()
                .onClick(async () => {
                    const index = this.plugin.settings.categories.findIndex(c => c.id === category.id);
                    if (index > -1) {
                        this.plugin.settings.categories.splice(index, 1);
                        await this.plugin.saveSettings();
                        this.display();
                        new Notice(`${trans.deletedCategory} ${category.name}`);
                    }
                }));
        }
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
}
