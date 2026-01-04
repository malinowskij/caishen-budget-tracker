<script lang="ts">
    import type { Translations } from "../i18n";

    export let trends: Array<{
        year: number;
        month: number;
        income: number;
        expense: number;
        balance: number;
    }>;
    export let trans: Translations;

    $: maxValue = Math.max(...trends.flatMap((t) => [t.income, t.expense]), 1);

    function getHeight(value: number): number {
        return maxValue > 0 ? (value / maxValue) * 100 : 0;
    }
</script>

<div class="trend-chart">
    {#if maxValue > 0}
        {#each trends as trend}
            <div class="trend-month">
                <div class="trend-bars">
                    <div
                        class="trend-bar income"
                        style="height: {getHeight(trend.income)}%"
                        title="{trans.incomes}: {trend.income.toFixed(2)}"
                    ></div>
                    <div
                        class="trend-bar expense"
                        style="height: {getHeight(trend.expense)}%"
                        title="{trans.expenses}: {trend.expense.toFixed(2)}"
                    ></div>
                </div>
                <div class="trend-label">
                    {trans.months[trend.month - 1]?.substring(0, 3)}
                </div>
            </div>
        {/each}
    {:else}
        <p class="empty-state">{trans.noDataToDisplay}</p>
    {/if}
</div>

{#if maxValue > 0}
    <div class="trend-legend">
        <span class="legend-income">💚 {trans.income}</span>
        <span class="legend-expense">🔴 {trans.expense}</span>
    </div>
{/if}

<style>
    .trend-chart {
        display: flex;
        justify-content: space-around;
        align-items: flex-end;
        height: 150px;
        gap: 12px;
        padding: 16px;
        background: var(--background-secondary);
        border-radius: 12px;
    }

    .trend-month {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
    }

    .trend-bars {
        display: flex;
        align-items: flex-end;
        height: 100px;
        gap: 4px;
    }

    .trend-bar {
        width: 16px;
        min-height: 2px;
        border-radius: 4px 4px 0 0;
        transition: height 0.3s ease;
    }

    .trend-bar.income {
        background: #27ae60;
    }

    .trend-bar.expense {
        background: #e74c3c;
    }

    .trend-label {
        margin-top: 8px;
        font-size: 12px;
        color: var(--text-muted);
    }

    .trend-legend {
        display: flex;
        justify-content: center;
        gap: 24px;
        margin-top: 12px;
    }

    .legend-income,
    .legend-expense {
        font-size: 12px;
    }

    .empty-state {
        text-align: center;
        color: var(--text-muted);
    }
</style>
