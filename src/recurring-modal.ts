import { App, Modal } from 'obsidian';
import type { BudgetPluginSettings, RecurringTransaction } from './types';
import { t } from './i18n';
import RecurringForm from './components/RecurringForm.svelte';

export class RecurringModal extends Modal {
    private settings: BudgetPluginSettings;
    private onSubmit: (item: Omit<RecurringTransaction, 'id' | 'lastProcessed'>) => void;
    private editItem: RecurringTransaction | null;
    private component: RecurringForm | null = null;

    constructor(
        app: App,
        settings: BudgetPluginSettings,
        onSubmit: (item: Omit<RecurringTransaction, 'id' | 'lastProcessed'>) => void,
        editItem?: RecurringTransaction
    ) {
        super(app);
        this.settings = settings;
        this.onSubmit = onSubmit;
        this.editItem = editItem ?? null;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        const trans = t(this.settings.locale);

        this.component = new RecurringForm({
            target: contentEl,
            props: {
                settings: this.settings,
                trans,
                editItem: this.editItem,
                onSubmit: (item: Omit<RecurringTransaction, 'id' | 'lastProcessed'>) => {
                    this.onSubmit(item);
                    this.close();
                },
                onClose: () => this.close(),
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
