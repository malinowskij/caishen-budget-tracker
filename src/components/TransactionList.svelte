<script lang="ts">
    import type { Transaction, Category } from "../types";
    import type { Translations } from "../i18n";

    export let transactions: Transaction[];
    export let categories: Category[];
    export let trans: Translations;
    export let onEdit: ((transaction: Transaction) => void) | undefined =
        undefined;

    function getCategory(categoryId: string): Category | undefined {
        return categories.find((c) => c.id === categoryId);
    }

    function handleClick(txn: Transaction) {
        if (onEdit) {
            onEdit(txn);
        }
    }
</script>

{#if transactions.length > 0}
    <div class="transaction-list">
        {#each transactions as txn}
            {@const category = getCategory(txn.category)}
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <div
                class="transaction-row"
                class:clickable={!!onEdit}
                on:click={() => handleClick(txn)}
                on:keydown={(e) => e.key === "Enter" && handleClick(txn)}
                role={onEdit ? "button" : undefined}
                tabindex={onEdit ? 0 : undefined}
            >
                <div class="transaction-left">
                    <span class="transaction-icon"
                        >{category?.icon ?? "📦"}</span
                    >
                    <div class="transaction-details">
                        <div class="transaction-category">
                            {category?.name ?? txn.category}
                        </div>
                        <div class="transaction-desc">
                            {txn.description || txn.date}
                        </div>
                    </div>
                </div>
                <div class="transaction-right">
                    <span
                        class={txn.type === "income"
                            ? "amount-income"
                            : "amount-expense"}
                    >
                        {txn.type === "income" ? "+" : "-"}{txn.amount.toFixed(
                            2,
                        )}
                        {txn.currency}
                    </span>
                </div>
            </div>
        {/each}
    </div>
{/if}

<style>
    .transaction-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .transaction-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: var(--background-secondary);
        border-radius: 8px;
        transition: background 0.2s ease;
    }

    .clickable {
        cursor: pointer;
    }

    .clickable:hover,
    .transaction-row:hover {
        background: var(--background-modifier-hover);
    }

    .transaction-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .transaction-icon {
        font-size: 20px;
    }

    .transaction-details {
        display: flex;
        flex-direction: column;
    }

    .transaction-category {
        font-weight: 500;
    }

    .transaction-desc {
        font-size: 12px;
        color: var(--text-muted);
    }

    .transaction-right {
        font-weight: 600;
    }

    .amount-income {
        color: #27ae60;
    }

    .amount-expense {
        color: #e74c3c;
    }
</style>
