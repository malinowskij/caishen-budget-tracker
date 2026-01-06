import { Modal, Setting } from 'obsidian';
import type { App } from 'obsidian';
import type { SavingsGoal, BudgetPluginSettings } from './types';
import type { Translations } from './i18n';

const COMMON_ICONS = ['🎯', '🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '👶', '🏖️',
    '🎄', '💰', '💎', '🎁', '⚽', '🎮', '📷', '🎸', '👗', '⌚'];

export class SavingsGoalModal extends Modal {
    private goal: Partial<SavingsGoal>;
    private trans: Translations;
    private settings: BudgetPluginSettings;
    private onSave: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
    private onDelete?: () => void;
    private isEdit: boolean;

    constructor(
        app: App,
        trans: Translations,
        settings: BudgetPluginSettings,
        onSave: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void,
        existingGoal?: SavingsGoal,
        onDelete?: () => void
    ) {
        super(app);
        this.trans = trans;
        this.settings = settings;
        this.onSave = onSave;
        this.onDelete = onDelete;
        this.isEdit = !!existingGoal;
        this.goal = existingGoal ? { ...existingGoal } : {
            name: '',
            targetAmount: 1000,
            currentAmount: 0,
            icon: '🎯',
            color: '#3498db',
        };
    }

    onOpen() {
        const { contentEl } = this;
        const trans = this.trans;

        contentEl.createEl('h2', { text: this.isEdit ? trans.editSavingsGoal : trans.addSavingsGoal });

        new Setting(contentEl)
            .setName(trans.goalName)
            .addText(text => text
                .setValue(this.goal.name || '')
                .onChange(value => this.goal.name = value));

        // Icon picker with dropdown
        new Setting(contentEl)
            .setName('Icon')
            .addDropdown(dropdown => {
                for (const icon of COMMON_ICONS) {
                    dropdown.addOption(icon, icon);
                }
                dropdown.setValue(this.goal.icon || '🎯');
                dropdown.onChange(value => this.goal.icon = value);
            });

        new Setting(contentEl)
            .setName(trans.targetAmount)
            .addText(text => text
                .setPlaceholder('1000')
                .setValue(String(this.goal.targetAmount || ''))
                .onChange(value => this.goal.targetAmount = parseFloat(value) || 0));

        new Setting(contentEl)
            .setName(trans.currentAmount)
            .addText(text => text
                .setPlaceholder('0')
                .setValue(String(this.goal.currentAmount || 0))
                .onChange(value => this.goal.currentAmount = parseFloat(value) || 0));

        // Date picker using HTML input type="date"
        const deadlineSetting = new Setting(contentEl)
            .setName(trans.deadline)
            .setDesc('Optional');

        const dateInput = deadlineSetting.controlEl.createEl('input', {
            type: 'date',
            value: this.goal.deadline || '',
        });
        dateInput.addEventListener('change', () => {
            this.goal.deadline = dateInput.value || undefined;
        });

        new Setting(contentEl)
            .setName('Color')
            .addColorPicker(picker => picker
                .setValue(this.goal.color || '#3498db')
                .onChange(value => this.goal.color = value));

        // Save and Cancel buttons
        const buttonsSetting = new Setting(contentEl)
            .addButton(button => button
                .setButtonText(trans.save)
                .setCta()
                .onClick(() => {
                    if (!this.goal.name) {
                        return;
                    }
                    this.onSave({
                        name: this.goal.name,
                        targetAmount: this.goal.targetAmount || 0,
                        currentAmount: this.goal.currentAmount || 0,
                        deadline: this.goal.deadline,
                        icon: this.goal.icon || '🎯',
                        color: this.goal.color || '#3498db',
                    });
                    this.close();
                }))
            .addButton(button => button
                .setButtonText(trans.cancel)
                .onClick(() => this.close()));

        // Delete button for existing goals
        if (this.isEdit && this.onDelete) {
            const deleteFn = this.onDelete;
            buttonsSetting.addButton(button => button
                .setButtonText(trans.delete)
                .setWarning()
                .onClick(() => {
                    deleteFn();
                    this.close();
                }));
        }
    }

    onClose() {
        this.contentEl.empty();
    }
}
