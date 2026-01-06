<script lang="ts">
    import type { IDataService } from "../types";
    import type { Translations } from "../i18n";

    export let dataService: IDataService;
    export let trans: Translations;
    export let currency: string;

    $: stats = dataService.getAverageSpending();

    function formatAmount(amount: number): string {
        return amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }
</script>

<div class="spending-stats">
    <h3>{trans.spendingAverages}</h3>

    <div class="stats-grid">
        <div class="stat-card">
            <span class="stat-icon">📅</span>
            <div class="stat-content">
                <span class="stat-label">{trans.dailyAverage}</span>
                <span class="stat-value"
                    >{formatAmount(stats.daily)} {currency}</span
                >
            </div>
        </div>

        <div class="stat-card">
            <span class="stat-icon">📆</span>
            <div class="stat-content">
                <span class="stat-label">{trans.weeklyAverage}</span>
                <span class="stat-value"
                    >{formatAmount(stats.weekly)} {currency}</span
                >
            </div>
        </div>

        <div class="stat-card">
            <span class="stat-icon">🗓️</span>
            <div class="stat-content">
                <span class="stat-label">{trans.monthlyAverage}</span>
                <span class="stat-value"
                    >{formatAmount(stats.monthly)} {currency}</span
                >
            </div>
        </div>
    </div>

    {#if stats.topCategories.length > 0}
        <h4>{trans.topSpendingCategories}</h4>
        <div class="top-categories">
            {#each stats.topCategories as cat, index}
                <div class="category-row">
                    <span class="rank">#{index + 1}</span>
                    <span class="cat-icon">{cat.icon}</span>
                    <span class="cat-name">{cat.name}</span>
                    <span class="cat-amount"
                        >{formatAmount(cat.average)}
                        {currency}{trans.perMonth}</span
                    >
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .spending-stats {
        background: var(--background-secondary);
        border-radius: 12px;
        padding: 16px;
    }

    .spending-stats h3 {
        margin: 0 0 16px 0;
    }

    .spending-stats h4 {
        margin: 20px 0 12px 0;
        font-size: 14px;
        color: var(--text-muted);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
    }

    .stat-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--background-primary);
        border-radius: 8px;
    }

    .stat-icon {
        font-size: 24px;
    }

    .stat-content {
        display: flex;
        flex-direction: column;
    }

    .stat-label {
        font-size: 11px;
        color: var(--text-muted);
        text-transform: uppercase;
    }

    .stat-value {
        font-size: 16px;
        font-weight: 600;
        color: #e74c3c;
    }

    .top-categories {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .category-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background: var(--background-primary);
        border-radius: 8px;
    }

    .rank {
        font-weight: 600;
        color: var(--text-muted);
        width: 24px;
    }

    .cat-icon {
        font-size: 18px;
    }

    .cat-name {
        flex: 1;
    }

    .cat-amount {
        font-weight: 600;
        color: #e74c3c;
    }

    @media (max-width: 500px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
