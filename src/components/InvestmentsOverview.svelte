<script lang="ts">
    import type { Translations } from "../i18n";
    import PieChart from "./PieChart.svelte";

    export let breakdown: Array<{
        category: string;
        name: string;
        amount: number;
        color: string;
        icon: string;
    }>;
    export let totalInvested: number;
    export let trans: Translations;
    export let currency: string;

    $: hasData = breakdown.length > 0;
</script>

<div class="investments-overview">
    {#if hasData}
        <div class="investment-total">
            <div class="investment-total-label">{trans.totalInvested}</div>
            <div class="investment-total-value">
                {totalInvested.toFixed(2)}
                {currency}
            </div>
        </div>

        <div class="investment-breakdown">
            <h3>{trans.investmentBreakdown}</h3>
            <PieChart data={breakdown} {trans} {currency} />

            <div class="investment-categories">
                {#each breakdown as item}
                    <div class="investment-category-item">
                        <span class="category-icon">{item.icon}</span>
                        <span class="category-name">{item.name}</span>
                        <span class="category-amount"
                            >{item.amount.toFixed(2)} {currency}</span
                        >
                    </div>
                {/each}
            </div>
        </div>
    {:else}
        <p class="no-data">{trans.noInvestmentsYet}</p>
    {/if}
</div>

<style>
    .investments-overview {
        padding: 1rem;
    }

    .investment-total {
        text-align: center;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: var(--background-secondary);
        border-radius: 8px;
    }

    .investment-total-label {
        font-size: 0.9rem;
        color: var(--text-muted);
        margin-bottom: 0.5rem;
    }

    .investment-total-value {
        font-size: 2rem;
        font-weight: bold;
        color: var(--text-accent);
    }

    .investment-breakdown h3 {
        margin-bottom: 1rem;
    }

    .investment-categories {
        margin-top: 1rem;
    }

    .investment-category-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        border-bottom: 1px solid var(--background-modifier-border);
    }

    .investment-category-item:last-child {
        border-bottom: none;
    }

    .category-icon {
        font-size: 1.2rem;
    }

    .category-name {
        flex: 1;
    }

    .category-amount {
        font-weight: 500;
        color: var(--text-accent);
    }

    .no-data {
        text-align: center;
        color: var(--text-muted);
        padding: 2rem;
    }
</style>
