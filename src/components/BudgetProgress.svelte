<script lang="ts">
    import type { Category } from "../types";
    import type { Translations } from "../i18n";

    export let categories: Category[];
    export let spentByCategory: Record<string, number>;
    export let trans: Translations;
    export let currency: string;

    interface BudgetStatus {
        category: Category;
        spent: number;
        limit: number;
        percentage: number;
        status: "ok" | "warning" | "exceeded";
    }

    $: budgetStatuses = categories
        .filter(
            (c) => c.type === "expense" && c.budgetLimit && c.budgetLimit > 0,
        )
        .map((c) => {
            const spent = spentByCategory[c.id] ?? 0;
            const limit = c.budgetLimit ?? 0;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            let status: "ok" | "warning" | "exceeded" = "ok";
            if (percentage >= 100) status = "exceeded";
            else if (percentage >= 80) status = "warning";
            return { category: c, spent, limit, percentage, status };
        });

    $: hasBudgets = budgetStatuses.length > 0;
</script>

{#if hasBudgets}
    <div class="budget-progress-container">
        {#each budgetStatuses as item}
            <div class="budget-progress-item">
                <div class="budget-progress-header">
                    <span class="budget-category">
                        {item.category.icon}
                        {item.category.name}
                    </span>
                    <span class="budget-amounts">
                        {item.spent.toFixed(2)} / {item.limit.toFixed(2)}
                        {currency}
                    </span>
                </div>
                <div class="budget-progress-bar-container">
                    <div
                        class="budget-progress-bar {item.status}"
                        style="width: {Math.min(
                            item.percentage,
                            100,
                        )}%; background-color: {item.category.color};"
                    ></div>
                </div>
                <div class="budget-progress-footer">
                    <span class="budget-percentage {item.status}">
                        {item.percentage.toFixed(0)}%
                    </span>
                    {#if item.status === "exceeded"}
                        <span class="budget-warning"
                            >⚠️ {trans.budgetExceeded ??
                                "Budget exceeded!"}</span
                        >
                    {:else if item.status === "warning"}
                        <span class="budget-warning"
                            >⚡ {trans.budgetWarning ??
                                "Approaching limit"}</span
                        >
                    {:else}
                        <span class="budget-remaining">
                            {trans.budgetRemaining ?? "Remaining"}: {(
                                item.limit - item.spent
                            ).toFixed(2)}
                            {currency}
                        </span>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
{/if}

<style>
    .budget-progress-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .budget-progress-item {
        background: var(--background-secondary);
        padding: 12px;
        border-radius: 8px;
    }

    .budget-progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .budget-category {
        font-weight: 500;
    }

    .budget-amounts {
        color: var(--text-muted);
        font-size: 13px;
    }

    .budget-progress-bar-container {
        height: 8px;
        background: var(--background-modifier-border);
        border-radius: 4px;
        overflow: hidden;
    }

    .budget-progress-bar {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .budget-progress-bar.exceeded {
        background: #e74c3c !important;
    }

    .budget-progress-bar.warning {
        opacity: 0.9;
    }

    .budget-progress-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 6px;
        font-size: 12px;
    }

    .budget-percentage {
        font-weight: 600;
    }

    .budget-percentage.warning {
        color: #f39c12;
    }

    .budget-percentage.exceeded {
        color: #e74c3c;
    }

    .budget-warning {
        color: #e74c3c;
        font-weight: 500;
    }

    .budget-remaining {
        color: var(--text-muted);
    }
</style>
