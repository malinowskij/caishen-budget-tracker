<script lang="ts">
    import type { IDataService } from "../types";
    import type { Translations } from "../i18n";

    export let dataService: IDataService;
    export let trans: Translations;
    export let currency: string;

    $: categoryTrends = dataService.getCategoryTrends(6);

    // Calculate max value for chart scaling
    $: maxValue = Math.max(
        ...categoryTrends.flatMap((c) => c.data.map((d) => d.amount)),
        1,
    );

    function formatMonth(monthKey: string): string {
        const [, month] = monthKey.split("-");
        const monthIndex = parseInt(month || "1") - 1;
        return trans.months[monthIndex]?.slice(0, 3) ?? monthKey;
    }

    function formatAmount(amount: number): string {
        return amount.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }
</script>

<div class="category-comparison">
    <h3>{trans.categoryTrends}</h3>

    {#if categoryTrends.length === 0}
        <p class="no-data">{trans.noExpenseData}</p>
    {:else}
        <div class="category-charts">
            {#each categoryTrends.slice(0, 5) as category}
                <div class="category-chart">
                    <div class="category-header">
                        <span class="cat-icon">{category.icon}</span>
                        <span class="cat-name">{category.name}</span>
                        <span class="cat-total">
                            {formatAmount(
                                category.data.reduce((s, d) => s + d.amount, 0),
                            )}
                            {currency}
                        </span>
                    </div>

                    <div class="mini-chart">
                        {#each category.data as point}
                            <div
                                class="mini-bar"
                                style="height: {(point.amount / maxValue) *
                                    100}%; background: {category.color}"
                                title="{formatMonth(
                                    point.month,
                                )}: {formatAmount(point.amount)} {currency}"
                            ></div>
                        {/each}
                    </div>

                    <div class="chart-months">
                        {#each category.data as point}
                            <span class="mini-label"
                                >{formatMonth(point.month)}</span
                            >
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .category-comparison {
        background: var(--background-secondary);
        border-radius: 12px;
        padding: 16px;
    }

    .category-comparison h3 {
        margin: 0 0 16px 0;
    }

    .no-data {
        color: var(--text-muted);
        text-align: center;
        padding: 20px;
    }

    .category-charts {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .category-chart {
        background: var(--background-primary);
        border-radius: 8px;
        padding: 12px;
    }

    .category-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
    }

    .cat-icon {
        font-size: 18px;
    }

    .cat-name {
        flex: 1;
        font-weight: 500;
    }

    .cat-total {
        font-weight: 600;
        color: var(--text-muted);
    }

    .mini-chart {
        display: flex;
        align-items: flex-end;
        gap: 4px;
        height: 50px;
    }

    .mini-bar {
        flex: 1;
        min-height: 2px;
        border-radius: 3px 3px 0 0;
        transition: height 0.3s ease;
        cursor: pointer;
    }

    .mini-bar:hover {
        opacity: 0.8;
    }

    .chart-months {
        display: flex;
        gap: 4px;
        margin-top: 4px;
    }

    .mini-label {
        flex: 1;
        text-align: center;
        font-size: 9px;
        color: var(--text-muted);
    }
</style>
