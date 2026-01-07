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

    // Track expanded categories
    let expandedCategories: Record<string, boolean> = {};

    function toggleExpand(categoryId: string) {
        expandedCategories[categoryId] = !expandedCategories[categoryId];
        expandedCategories = { ...expandedCategories };
    }

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
                {@const hasSubcategories =
                    category.subcategories && category.subcategories.length > 0}
                {@const isExpanded = expandedCategories[category.category]}
                <div class="category-chart">
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div
                        class="category-header"
                        class:clickable={hasSubcategories}
                        on:click={() =>
                            hasSubcategories && toggleExpand(category.category)}
                    >
                        {#if hasSubcategories}
                            <span class="expand-icon"
                                >{isExpanded ? "▼" : "▶"}</span
                            >
                        {/if}
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
                </div>

                <!-- Expanded subcategories -->
                {#if isExpanded && category.subcategories}
                    {#each category.subcategories as sub}
                        <div class="category-chart subcategory">
                            <div class="category-header">
                                <span class="indent">↳</span>
                                <span class="cat-icon">{sub.icon}</span>
                                <span class="cat-name">{sub.name}</span>
                                <span class="cat-total">
                                    {formatAmount(
                                        sub.data.reduce(
                                            (s, d) => s + d.amount,
                                            0,
                                        ),
                                    )}
                                    {currency}
                                </span>
                            </div>

                            <div class="mini-chart">
                                {#each sub.data as point}
                                    <div
                                        class="mini-bar"
                                        style="height: {(point.amount /
                                            maxValue) *
                                            100}%; background: {sub.color}"
                                        title="{formatMonth(
                                            point.month,
                                        )}: {formatAmount(
                                            point.amount,
                                        )} {currency}"
                                    ></div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                {/if}
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

    h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
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

    .category-chart.subcategory {
        margin-left: 20px;
        padding-left: 16px;
        border-left: 2px solid var(--background-modifier-border);
    }

    .category-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    }

    .category-header.clickable {
        cursor: pointer;
    }

    .category-header.clickable:hover {
        opacity: 0.8;
    }

    .expand-icon {
        font-size: 10px;
        width: 12px;
        color: var(--text-muted);
    }

    .indent {
        color: var(--text-muted);
        font-size: 12px;
    }

    .cat-icon {
        font-size: 16px;
    }

    .cat-name {
        flex: 1;
        font-weight: 500;
    }

    .cat-total {
        font-weight: 600;
        color: var(--text-muted);
        font-size: 12px;
    }

    .mini-chart {
        display: flex;
        align-items: flex-end;
        gap: 4px;
        height: 40px;
    }

    .mini-bar {
        flex: 1;
        min-height: 2px;
        border-radius: 2px;
        transition: height 0.3s ease;
    }

    .mini-bar:hover {
        opacity: 0.8;
    }
</style>
