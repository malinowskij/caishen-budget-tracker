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

    $: maxValue = Math.max(...trends.flatMap((t) => [t.income, t.expense]));

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
        <span class="legend-income">{trans.incomes}</span>
        <span class="legend-expense">{trans.expenses}</span>
    </div>
{/if}
