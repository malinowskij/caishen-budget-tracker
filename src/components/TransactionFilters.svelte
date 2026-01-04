<script lang="ts">
    import type { Category, TransactionFilter } from "../types";
    import type { Translations } from "../i18n";

    export let categories: Category[];
    export let trans: Translations;
    export let filter: TransactionFilter;
    export let onFilterChange: (filter: TransactionFilter) => void;

    let dateFrom = filter.dateFrom ?? "";
    let dateTo = filter.dateTo ?? "";
    let category = filter.category ?? "";
    let type: "income" | "expense" | "all" = filter.type ?? "all";
    let search = filter.search ?? "";

    function applyFilter() {
        onFilterChange({
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            category: category || undefined,
            type: type === "all" ? undefined : type,
            search: search || undefined,
        });
    }

    function clearFilters() {
        dateFrom = "";
        dateTo = "";
        category = "";
        type = "all";
        search = "";
        onFilterChange({});
    }

    $: hasActiveFilters =
        dateFrom || dateTo || category || type !== "all" || search;
</script>

<div class="transaction-filters">
    <div class="filter-row">
        <div class="filter-group">
            <label for="filter-search">{trans.search ?? "Search"}</label>
            <input
                id="filter-search"
                type="text"
                placeholder={trans.searchPlaceholder ??
                    "Search descriptions..."}
                bind:value={search}
                on:input={applyFilter}
            />
        </div>

        <div class="filter-group">
            <label for="filter-type">{trans.type}</label>
            <select id="filter-type" bind:value={type} on:change={applyFilter}>
                <option value="all">{trans.all ?? "All"}</option>
                <option value="expense">🔴 {trans.expense}</option>
                <option value="income">💚 {trans.income}</option>
            </select>
        </div>

        <div class="filter-group">
            <label for="filter-category">{trans.category}</label>
            <select
                id="filter-category"
                bind:value={category}
                on:change={applyFilter}
            >
                <option value=""
                    >{trans.allCategories ?? "All categories"}</option
                >
                {#each categories as cat}
                    <option value={cat.id}>{cat.icon} {cat.name}</option>
                {/each}
            </select>
        </div>
    </div>

    <div class="filter-row">
        <div class="filter-group">
            <label for="filter-from">{trans.dateFrom ?? "From"}</label>
            <input
                id="filter-from"
                type="date"
                bind:value={dateFrom}
                on:change={applyFilter}
            />
        </div>

        <div class="filter-group">
            <label for="filter-to">{trans.dateTo ?? "To"}</label>
            <input
                id="filter-to"
                type="date"
                bind:value={dateTo}
                on:change={applyFilter}
            />
        </div>

        {#if hasActiveFilters}
            <button class="clear-filters" on:click={clearFilters}>
                ✕ {trans.clearFilters ?? "Clear"}
            </button>
        {/if}
    </div>
</div>

<style>
    .transaction-filters {
        margin-bottom: 16px;
        padding: 12px;
        background: var(--background-secondary);
        border-radius: 8px;
    }

    .filter-row {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        align-items: flex-end;
        margin-bottom: 8px;
    }

    .filter-row:last-child {
        margin-bottom: 0;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 120px;
    }

    .filter-group label {
        font-size: 12px;
        color: var(--text-muted);
    }

    .filter-group input,
    .filter-group select {
        padding: 6px 10px;
        border-radius: 4px;
        border: 1px solid var(--background-modifier-border);
        background: var(--background-primary);
    }

    .clear-filters {
        padding: 6px 12px;
        background: var(--background-modifier-error);
        color: var(--text-on-accent);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        white-space: nowrap;
    }

    .clear-filters:hover {
        opacity: 0.9;
    }
</style>
