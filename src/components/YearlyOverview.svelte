<script lang="ts">
    import type { IDataService } from "../types";
    import type { Translations } from "../i18n";

    export let dataService: IDataService;
    export let trans: Translations;
    export let currency: string;

    // Get available years or default to current year
    $: availableYears = dataService.getAvailableYears();
    $: selectedYear = availableYears[0] || new Date().getFullYear();
    $: yearData = dataService.getYearlySummary(selectedYear);

    $: maxValue = Math.max(
        ...yearData.months.map((m) => Math.max(m.income, m.expense)),
        1,
    );

    function formatAmount(amount: number): string {
        return amount.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }
</script>

<div class="yearly-overview">
    <div class="yearly-header">
        <h3>📅 {selectedYear}</h3>
        <select bind:value={selectedYear} class="year-select">
            {#each availableYears as year}
                <option value={year}>{year}</option>
            {/each}
            {#if availableYears.length === 0}
                <option value={new Date().getFullYear()}
                    >{new Date().getFullYear()}</option
                >
            {/if}
        </select>
    </div>

    <!-- Summary Cards -->
    <div class="yearly-summary">
        <div class="summary-card income">
            <span class="label">💚 {trans.incomes}</span>
            <span class="value"
                >{formatAmount(yearData.totalIncome)} {currency}</span
            >
        </div>
        <div class="summary-card expense">
            <span class="label">🔴 {trans.expenses}</span>
            <span class="value"
                >{formatAmount(yearData.totalExpense)} {currency}</span
            >
        </div>
        <div class="summary-card balance">
            <span class="label">📊 {trans.balance}</span>
            <span class="value" class:positive={yearData.balance >= 0}>
                {yearData.balance >= 0 ? "+" : ""}{formatAmount(
                    yearData.balance,
                )}
                {currency}
            </span>
        </div>
        <div class="summary-card savings">
            <span class="label">{trans.savingsRate}</span>
            <span class="value">{yearData.savingsRate.toFixed(1)}%</span>
        </div>
    </div>

    <!-- Monthly Chart -->
    <div class="monthly-chart">
        {#each yearData.months as monthData, index}
            {@const monthName = trans.months[index]?.slice(0, 3) ?? "?"}
            <div class="month-bar">
                <div class="bars">
                    <div
                        class="bar income-bar"
                        style="height: {(monthData.income / maxValue) * 100}%"
                        title="{trans.incomes}: {formatAmount(
                            monthData.income,
                        )} {currency}"
                    ></div>
                    <div
                        class="bar expense-bar"
                        style="height: {(monthData.expense / maxValue) * 100}%"
                        title="{trans.expenses}: {formatAmount(
                            monthData.expense,
                        )} {currency}"
                    ></div>
                </div>
                <span class="month-label">{monthName}</span>
            </div>
        {/each}
    </div>

    <!-- Legend -->
    <div class="chart-legend">
        <span class="legend-item"
            ><span class="legend-color income"></span> {trans.incomes}</span
        >
        <span class="legend-item"
            ><span class="legend-color expense"></span> {trans.expenses}</span
        >
    </div>
</div>

<style>
    .yearly-overview {
        background: var(--background-secondary);
        border-radius: 12px;
        padding: 16px;
    }

    .yearly-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    .yearly-header h3 {
        margin: 0;
    }

    .year-select {
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid var(--background-modifier-border);
        background: var(--background-primary);
        color: var(--text-normal);
    }

    .yearly-summary {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 20px;
    }

    .summary-card {
        display: flex;
        flex-direction: column;
        padding: 12px;
        border-radius: 8px;
        background: var(--background-primary);
    }

    .summary-card .label {
        font-size: 12px;
        color: var(--text-muted);
    }

    .summary-card .value {
        font-size: 18px;
        font-weight: 600;
        margin-top: 4px;
    }

    .summary-card.income .value {
        color: #27ae60;
    }
    .summary-card.expense .value {
        color: #e74c3c;
    }
    .summary-card.balance .value.positive {
        color: #27ae60;
    }
    .summary-card.savings .value {
        color: #3498db;
    }

    .monthly-chart {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        height: 150px;
        gap: 4px;
        margin-bottom: 8px;
    }

    .month-bar {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
    }

    .bars {
        display: flex;
        gap: 2px;
        align-items: flex-end;
        height: 130px;
        width: 100%;
    }

    .bar {
        flex: 1;
        border-radius: 4px 4px 0 0;
        min-height: 2px;
        transition: height 0.3s ease;
    }

    .income-bar {
        background: linear-gradient(180deg, #27ae60, #2ecc71);
    }
    .expense-bar {
        background: linear-gradient(180deg, #e74c3c, #c0392b);
    }

    .month-label {
        font-size: 10px;
        color: var(--text-muted);
        margin-top: 4px;
    }

    .chart-legend {
        display: flex;
        justify-content: center;
        gap: 20px;
        font-size: 12px;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 3px;
    }

    .legend-color.income {
        background: #27ae60;
    }
    .legend-color.expense {
        background: #e74c3c;
    }

    /* Obsidian Mobile */
    :global(body.is-mobile) .yearly-summary {
        grid-template-columns: 1fr;
        gap: 10px;
    }

    :global(body.is-mobile) .summary-card .value {
        font-size: 16px;
    }
</style>
