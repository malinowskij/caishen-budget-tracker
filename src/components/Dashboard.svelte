<script lang="ts">
    import type { IBudgetPlugin, TransactionFilter } from "../types";
    import { t } from "../i18n";
    import CategoryBar from "./CategoryBar.svelte";
    import TrendChart from "./TrendChart.svelte";
    import TransactionList from "./TransactionList.svelte";
    import TransactionFilters from "./TransactionFilters.svelte";
    import ExportButtons from "./ExportButtons.svelte";
    import BudgetProgress from "./BudgetProgress.svelte";
    import PieChart from "./PieChart.svelte";
    import YearlyOverview from "./YearlyOverview.svelte";
    import SpendingStats from "./SpendingStats.svelte";
    import CategoryComparison from "./CategoryComparison.svelte";
    import SavingsGoals from "./SavingsGoals.svelte";

    export let plugin: IBudgetPlugin;

    $: trans = t(plugin.settings.locale);
    $: summary = plugin.dataService.getCurrentMonthSummary();
    $: now = new Date();
    $: year = now.getFullYear();
    $: month = now.getMonth() + 1;
    $: monthName = trans.months[month - 1] ?? "Unknown";
    $: breakdown = plugin.dataService.getCategoryBreakdown(year, month);
    $: trends = plugin.dataService.getMonthlyTrends(6);
    $: spentByCategory = Object.fromEntries(
        breakdown.map((b) => [b.category, b.amount]),
    );

    // Tabs
    type TabId =
        | "overview"
        | "categories"
        | "goals"
        | "analytics"
        | "transactions";
    let activeTab: TabId = "overview";

    const tabs: { id: TabId; icon: string; labelKey: keyof typeof trans }[] = [
        { id: "overview", icon: "📊", labelKey: "tabOverview" },
        { id: "categories", icon: "📂", labelKey: "tabCategories" },
        { id: "goals", icon: "🎯", labelKey: "tabGoals" },
        { id: "analytics", icon: "📈", labelKey: "tabAnalytics" },
        { id: "transactions", icon: "📝", labelKey: "tabTransactions" },
    ];

    // Filtering
    let showFilters = false;
    let filter: TransactionFilter = {};
    $: filteredTransactions =
        Object.keys(filter).length > 0
            ? plugin.dataService.getFilteredTransactions(filter)
            : plugin.dataService.getRecentTransactions(20);

    function handleFilterChange(newFilter: TransactionFilter) {
        filter = newFilter;
    }

    function addExpense() {
        plugin.openTransactionModal("expense");
    }

    function addIncome() {
        plugin.openTransactionModal("income");
    }

    function refresh() {
        summary = plugin.dataService.getCurrentMonthSummary();
        breakdown = plugin.dataService.getCategoryBreakdown(year, month);
        trends = plugin.dataService.getMonthlyTrends(6);
        filteredTransactions =
            Object.keys(filter).length > 0
                ? plugin.dataService.getFilteredTransactions(filter)
                : plugin.dataService.getRecentTransactions(20);
    }

    async function handleInlineSave(
        id: string,
        updates: {
            date: string;
            amount: number;
            type: "income" | "expense";
            category: string;
            description: string;
            currency: string;
        },
    ) {
        await plugin.dataService.updateTransaction(id, updates);
        plugin.saveTransactionData();
        plugin.updateStatusBar();
        refresh();
    }

    async function handleDeleteTransaction(id: string) {
        await plugin.dataService.deleteTransaction(id);
        plugin.saveTransactionData();
        plugin.updateStatusBar();
        refresh();
    }
</script>

<div class="budget-dashboard">
    <div class="budget-dashboard-header">
        <h1>{trans.budgetDashboard}</h1>
        <p class="budget-subtitle">{monthName} {year}</p>
    </div>

    <div class="budget-actions">
        <button class="mod-cta" on:click={addExpense}>{trans.addExpense}</button
        >
        <button on:click={addIncome}>{trans.addIncome}</button>
    </div>

    <!-- Summary Cards - Always visible -->
    <div class="budget-cards">
        <div class="budget-card income">
            <div class="card-label">{trans.incomes}</div>
            <div class="card-value">
                +{summary.totalIncome.toFixed(2)}
                {plugin.settings.defaultCurrency}
            </div>
        </div>
        <div class="budget-card expense">
            <div class="card-label">{trans.expenses}</div>
            <div class="card-value">
                -{summary.totalExpense.toFixed(2)}
                {plugin.settings.defaultCurrency}
            </div>
        </div>
        <div
            class="budget-card balance"
            class:positive={summary.balance >= 0}
            class:negative={summary.balance < 0}
        >
            <div class="card-label">{trans.balance}</div>
            <div class="card-value">
                {summary.balance >= 0 ? "+" : ""}{summary.balance.toFixed(2)}
                {plugin.settings.defaultCurrency}
            </div>
        </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-nav">
        {#each tabs as tab}
            <button
                class="tab-btn"
                class:active={activeTab === tab.id}
                on:click={() => (activeTab = tab.id)}
            >
                {tab.icon}
                {trans[tab.labelKey]}
            </button>
        {/each}
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
        {#if activeTab === "overview"}
            <div class="budget-section">
                <h2>{trans.budgetProgress}</h2>
                <BudgetProgress
                    categories={plugin.settings.categories}
                    {spentByCategory}
                    {trans}
                    currency={plugin.settings.defaultCurrency}
                />
            </div>
            <div class="budget-section">
                <h2>{trans.trendLastMonths}</h2>
                <TrendChart {trends} {trans} />
            </div>
        {:else if activeTab === "categories"}
            <div class="budget-section">
                <h2>{trans.categoryBreakdown}</h2>
                {#if breakdown.length > 0}
                    <PieChart
                        data={breakdown}
                        currency={plugin.settings.defaultCurrency}
                        {trans}
                    />
                    <div class="category-breakdown" style="margin-top: 16px;">
                        {#each breakdown as item}
                            <CategoryBar
                                {item}
                                maxAmount={Math.max(
                                    ...breakdown.map((b) => b.amount),
                                )}
                                currency={plugin.settings.defaultCurrency}
                            />
                        {/each}
                    </div>
                {:else}
                    <p class="no-data">{trans.noExpensesThisMonth}</p>
                {/if}
            </div>
        {:else if activeTab === "goals"}
            <div class="budget-section">
                <SavingsGoals
                    goals={plugin.settings.savingsGoals}
                    {trans}
                    currency={plugin.settings.defaultCurrency}
                    onAdd={() => plugin.openSavingsGoalModal()}
                    onEdit={(goal) => plugin.openSavingsGoalModal(goal)}
                    onAddFunds={(goalId, amount) =>
                        plugin.addToSavingsGoal(goalId, amount)}
                />
            </div>
        {:else if activeTab === "analytics"}
            <div class="budget-section">
                <h2>{trans.analytics}</h2>
                <div class="analytics-grid">
                    <YearlyOverview
                        dataService={plugin.dataService}
                        {trans}
                        currency={plugin.settings.defaultCurrency}
                    />
                    <SpendingStats
                        dataService={plugin.dataService}
                        {trans}
                        currency={plugin.settings.defaultCurrency}
                    />
                    <CategoryComparison
                        dataService={plugin.dataService}
                        {trans}
                        currency={plugin.settings.defaultCurrency}
                    />
                </div>
            </div>
        {:else if activeTab === "transactions"}
            <div class="budget-section">
                <div class="section-header">
                    <h2>{trans.recentTransactions}</h2>
                    <button
                        class="filter-toggle"
                        on:click={() => (showFilters = !showFilters)}
                    >
                        🔍 {showFilters ? trans.hideFilters : trans.showFilters}
                    </button>
                </div>

                {#if showFilters}
                    <TransactionFilters
                        categories={plugin.settings.categories}
                        {trans}
                        {filter}
                        onFilterChange={handleFilterChange}
                    />
                {/if}

                <TransactionList
                    transactions={filteredTransactions}
                    categories={plugin.settings.categories}
                    currency={plugin.settings.defaultCurrency}
                    onSave={(id, updates) => handleInlineSave(id, updates)}
                    onDelete={(id) => handleDeleteTransaction(id)}
                />

                <ExportButtons
                    transactions={filteredTransactions}
                    categories={plugin.settings.categories}
                    {trans}
                    currency={plugin.settings.defaultCurrency}
                />
            </div>
        {/if}
    </div>

    <button class="budget-refresh" on:click={refresh}>🔄 {trans.refresh}</button
    >
</div>

<style>
    /* Dashboard container */
    :global(.budget-dashboard) {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
    }

    :global(.budget-dashboard-header) {
        text-align: center;
        margin-bottom: 24px;
    }

    :global(.budget-dashboard-header h1) {
        margin: 0;
    }

    :global(.budget-subtitle) {
        color: var(--text-muted);
        margin-top: 4px;
    }

    /* Actions */
    :global(.budget-actions) {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-bottom: 24px;
    }

    /* Cards */
    :global(.budget-cards) {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 24px;
    }

    :global(.budget-card) {
        background: var(--background-secondary);
        border-radius: 12px;
        padding: 16px;
        text-align: center;
    }

    :global(.budget-card .card-label) {
        font-size: 14px;
        color: var(--text-muted);
        margin-bottom: 8px;
    }

    :global(.budget-card .card-value) {
        font-size: 24px;
        font-weight: 700;
    }

    :global(.budget-card.income .card-value) {
        color: #27ae60;
    }

    :global(.budget-card.expense .card-value) {
        color: #e74c3c;
    }

    :global(.budget-card.balance.positive .card-value) {
        color: #27ae60;
    }

    :global(.budget-card.balance.negative .card-value) {
        color: #e74c3c;
    }

    /* Tab Navigation */
    .tab-nav {
        display: flex;
        gap: 4px;
        margin-bottom: 20px;
        border-bottom: 1px solid var(--background-modifier-border);
        padding-bottom: 8px;
        overflow-x: auto;
    }

    .tab-btn {
        padding: 8px 16px;
        border: none;
        background: transparent;
        color: var(--text-muted);
        cursor: pointer;
        font-size: 13px;
        border-radius: 6px 6px 0 0;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .tab-btn:hover {
        background: var(--background-secondary);
        color: var(--text-normal);
    }

    .tab-btn.active {
        background: var(--interactive-accent);
        color: white;
    }

    /* Tab Content */
    .tab-content {
        min-height: 300px;
    }

    /* Sections */
    :global(.budget-section) {
        margin-bottom: 24px;
    }

    :global(.budget-section h2) {
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--background-modifier-border);
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    .section-header h2 {
        margin: 0;
        border: none;
        padding: 0;
    }

    .filter-toggle {
        padding: 4px 12px;
        font-size: 13px;
        background: var(--background-secondary);
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        cursor: pointer;
    }

    .filter-toggle:hover {
        background: var(--background-modifier-hover);
    }

    :global(.budget-refresh) {
        display: block;
        margin: 24px auto;
        padding: 8px 24px;
    }

    :global(.category-breakdown) {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    /* Analytics */
    .analytics-grid {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .no-data {
        color: var(--text-muted);
        text-align: center;
        padding: 40px 20px;
    }

    /* Responsive */
    @media (max-width: 600px) {
        :global(.budget-cards) {
            grid-template-columns: 1fr;
        }

        :global(.budget-card .card-value) {
            font-size: 20px;
        }

        .tab-nav {
            flex-wrap: wrap;
        }

        .tab-btn {
            padding: 6px 10px;
            font-size: 12px;
        }
    }
</style>
