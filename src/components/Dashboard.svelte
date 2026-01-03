<script lang="ts">
	import type { IBudgetPlugin } from '../types';
	import { t } from '../i18n';
	import CategoryBar from './CategoryBar.svelte';
	import TrendChart from './TrendChart.svelte';
	import TransactionList from './TransactionList.svelte';

	export let plugin: IBudgetPlugin;

	$: trans = t(plugin.settings.locale);
	$: summary = plugin.dataService.getCurrentMonthSummary();
	$: now = new Date();
	$: year = now.getFullYear();
	$: month = now.getMonth() + 1;
	$: monthName = trans.months[month - 1] ?? 'Unknown';
	$: breakdown = plugin.dataService.getCategoryBreakdown(year, month);
	$: trends = plugin.dataService.getMonthlyTrends(6);
	$: recentTransactions = plugin.dataService.getRecentTransactions(5);

	function addExpense() {
		plugin.openTransactionModal('expense');
	}

	function addIncome() {
		plugin.openTransactionModal('income');
	}

	function refresh() {
		summary = plugin.dataService.getCurrentMonthSummary();
		breakdown = plugin.dataService.getCategoryBreakdown(year, month);
		trends = plugin.dataService.getMonthlyTrends(6);
		recentTransactions = plugin.dataService.getRecentTransactions(5);
	}
</script>

<div class="budget-dashboard">
	<div class="budget-dashboard-header">
		<h1>{trans.budgetDashboard}</h1>
		<p class="budget-subtitle">{monthName} {year}</p>
	</div>

	<div class="budget-actions">
		<button class="mod-cta" on:click={addExpense}>{trans.addExpense}</button>
		<button on:click={addIncome}>{trans.addIncome}</button>
	</div>

	<div class="budget-cards">
		<div class="budget-card income">
			<div class="card-label">{trans.incomes}</div>
			<div class="card-value">{summary.totalIncome.toFixed(2)} {plugin.settings.defaultCurrency}</div>
		</div>

		<div class="budget-card expense">
			<div class="card-label">{trans.expenses}</div>
			<div class="card-value">{summary.totalExpense.toFixed(2)} {plugin.settings.defaultCurrency}</div>
		</div>

		<div class="budget-card balance" class:positive={summary.balance >= 0} class:negative={summary.balance < 0}>
			<div class="card-label">{trans.balance}</div>
			<div class="card-value">
				{summary.balance >= 0 ? '+' : ''}{summary.balance.toFixed(2)} {plugin.settings.defaultCurrency}
			</div>
		</div>
	</div>

	<div class="budget-section">
		<h2>{trans.categoryBreakdown}</h2>
		{#if breakdown.length > 0}
			<div class="category-breakdown">
				{#each breakdown as item}
					<CategoryBar {item} maxAmount={Math.max(...breakdown.map(b => b.amount))} currency={plugin.settings.defaultCurrency} />
				{/each}
			</div>
		{:else}
			<p class="empty-state">{trans.noExpensesThisMonth}</p>
		{/if}
	</div>

	<div class="budget-section">
		<h2>{trans.trendLastMonths}</h2>
		<TrendChart {trends} {trans} />
	</div>

	<div class="budget-section">
		<h2>{trans.recentTransactions}</h2>
		<TransactionList transactions={recentTransactions} categories={plugin.settings.categories} {trans} />
	</div>

	<button class="budget-refresh" on:click={refresh}>🔄 {trans.refresh}</button>
</div>
