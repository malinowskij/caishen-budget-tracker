<script lang="ts">
    import type { RecurringTransaction, Category } from "../types";
    import type { Translations } from "../i18n";

    export let recurringTransactions: RecurringTransaction[];
    export let categories: Category[];
    export let trans: Translations;
    export let currency: string;
    export let onAdd: () => void;
    export let onEdit: (item: RecurringTransaction) => void;
    export let onToggle: (id: string, isActive: boolean) => void;
    export let onDelete: (id: string) => void;

    function getCategory(categoryId: string): Category | undefined {
        return categories.find((c) => c.id === categoryId);
    }
</script>

<div class="recurring-list">
    {#if recurringTransactions.length > 0}
        {#each recurringTransactions as item}
            {@const cat = getCategory(item.category)}
            <div class="recurring-item" class:inactive={!item.isActive}>
                <div class="recurring-left">
                    <label class="recurring-toggle">
                        <input
                            type="checkbox"
                            checked={item.isActive}
                            on:change={() => onToggle(item.id, !item.isActive)}
                        />
                    </label>
                    <div class="recurring-info">
                        <div class="recurring-name">
                            {cat?.icon ?? "📦"}
                            {item.name}
                        </div>
                        <div class="recurring-details">
                            {trans.dayOfMonth ?? "Day"}
                            {item.dayOfMonth} • {cat?.name ?? item.category}
                        </div>
                    </div>
                </div>
                <div class="recurring-right">
                    <span
                        class={item.type === "income"
                            ? "amount-income"
                            : "amount-expense"}
                    >
                        {item.type === "income"
                            ? "+"
                            : "-"}{item.amount.toFixed(2)}
                        {currency}
                    </span>
                    <button class="recurring-edit" on:click={() => onEdit(item)}
                        >✏️</button
                    >
                    <button
                        class="recurring-delete"
                        on:click={() => onDelete(item.id)}>🗑️</button
                    >
                </div>
            </div>
        {/each}
    {/if}

    <button class="add-recurring" on:click={onAdd}>
        ➕ {trans.addRecurring ?? "Add Recurring Transaction"}
    </button>
</div>

<style>
    .recurring-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .recurring-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: var(--background-secondary);
        border-radius: 8px;
    }

    .recurring-item.inactive {
        opacity: 0.5;
    }

    .recurring-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .recurring-toggle input {
        width: 18px;
        height: 18px;
    }

    .recurring-name {
        font-weight: 500;
    }

    .recurring-details {
        font-size: 12px;
        color: var(--text-muted);
    }

    .recurring-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .recurring-edit,
    .recurring-delete {
        padding: 4px 8px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
    }

    .recurring-delete:hover {
        color: var(--text-error);
    }

    .add-recurring {
        margin-top: 12px;
        padding: 8px 16px;
        background: var(--interactive-accent);
        color: var(--text-on-accent);
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .amount-income {
        color: #27ae60;
        font-weight: 600;
    }

    .amount-expense {
        color: #e74c3c;
        font-weight: 600;
    }
</style>
