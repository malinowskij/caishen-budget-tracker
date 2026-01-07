import { ItemView } from 'obsidian';
import type { WorkspaceLeaf } from 'obsidian';
import type { IBudgetPlugin } from './types';
import Dashboard from './components/Dashboard.svelte';

export const DASHBOARD_VIEW_TYPE = 'budget-dashboard-view';

export class BudgetDashboardView extends ItemView {
    plugin: IBudgetPlugin;
    private component: Dashboard | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: IBudgetPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return DASHBOARD_VIEW_TYPE;
    }

    getDisplayText(): string {
        return '💰 Budget dashboard';
    }

    getIcon(): string {
        return 'wallet';
    }

    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1];
        if (!container) return;
        container.empty();

        this.component = new Dashboard({
            target: container as HTMLElement,
            props: {
                plugin: this.plugin,
            },
        });
    }

    async onClose(): Promise<void> {
        if (this.component) {
            this.component.$destroy();
            this.component = null;
        }
    }

    refresh(): void {
        // Re-mount component to refresh data
        if (this.component) {
            this.component.$destroy();
        }
        void this.onOpen();
    }
}
