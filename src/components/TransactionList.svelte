<script lang="ts">
    import type { Transaction, Category } from "../types";
    import InlineTransactionEdit from "./InlineTransactionEdit.svelte";

    export let transactions: Transaction[];
    export let categories: Category[];
    export let currency: string = "USD";
    export let onEdit: ((transaction: Transaction) => void) | undefined =
        undefined;
    export let onSave:
        | ((
              id: string,
              updates: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
          ) => void)
        | undefined = undefined;
    export let onDelete: ((id: string) => void) | undefined = undefined;

    // Which transaction is being edited inline
    let editingId: string | null = null;

    function getCategory(categoryId: string): Category | undefined {
        return categories.find((c) => c.id === categoryId);
    }

    function handleClick(txn: Transaction) {
        if (onSave) {
            // Use inline editing if onSave is provided
            editingId = txn.id;
        } else if (onEdit) {
            // Fall back to modal editing
            onEdit(txn);
        }
    }

    function handleInlineSave(
        txn: Transaction,
        updates: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
    ) {
        if (onSave) {
            onSave(txn.id, updates);
        }
        editingId = null;
    }

    function handleInlineCancel() {
        editingId = null;
    }

    function handleInlineDelete(id: string) {
        if (onDelete) {
            onDelete(id);
        }
        editingId = null;
    }
</script>

{#if transactions.length > 0}
    <div class="transaction-list">
        {#each transactions as txn}
            {#if editingId === txn.id}
                <InlineTransactionEdit
                    transaction={txn}
                    {categories}
                    {currency}
                    on:save={(e) => handleInlineSave(txn, e.detail)}
                    on:cancel={handleInlineCancel}
                    on:delete={() => handleInlineDelete(txn.id)}
                />
            {:else}
                {@const category = getCategory(txn.category)}
                <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                <div
                    class="transaction-row"
                    class:clickable={!!onEdit || !!onSave}
                    on:click={() => handleClick(txn)}
                    on:keydown={(e) => e.key === "Enter" && handleClick(txn)}
                    role={onEdit || onSave ? "button" : undefined}
                    tabindex={onEdit || onSave ? 0 : undefined}
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
                            {#if txn.tags && txn.tags.length > 0}
                                <div class="transaction-tags">
                                    {#each txn.tags as tag}
                                        <span class="tag-pill">🏷️ {tag}</span>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>
                    <div class="transaction-right">
                        <span
                            class={txn.type === "income"
                                ? "amount-income"
                                : "amount-expense"}
                        >
                            {txn.type === "income"
                                ? "+"
                                : "-"}{txn.amount.toFixed(2)}
                            {txn.currency}
                        </span>
                    </div>
                </div>
            {/if}
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

    .transaction-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 4px;
    }

    .tag-pill {
        font-size: 10px;
        padding: 2px 6px;
        background: var(--background-secondary);
        border-radius: 10px;
        color: var(--text-muted);
    }
</style>
