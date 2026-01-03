<script lang="ts">
    import type { Transaction, Category } from "../types";
    import type { Translations } from "../i18n";

    export let transactions: Transaction[];
    export let categories: Category[];
    export let trans: Translations;

    function getCategory(categoryId: string): Category | undefined {
        return categories.find((c) => c.id === categoryId);
    }
</script>

{#if transactions.length > 0}
    <div class="transaction-list">
        {#each transactions as txn}
            {@const category = getCategory(txn.category)}
            <div class="transaction-row">
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
{:else}
    <p class="empty-state">{trans.noTransactionsYet}</p>
{/if}
