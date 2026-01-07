<script lang="ts">
    export let item: {
        icon: string;
        name: string;
        amount: number;
        color: string;
        subcategories?: Array<{
            icon: string;
            name: string;
            amount: number;
            color: string;
        }>;
    };
    export let maxAmount: number;
    export let currency: string;
    export let isSubcategory = false;

    $: percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
    $: hasSubcategories = item.subcategories && item.subcategories.length > 0;

    let expanded = false;

    function toggleExpand() {
        if (hasSubcategories) {
            expanded = !expanded;
        }
    }
</script>

<div class="category-row" class:subcategory={isSubcategory}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="category-label"
        class:clickable={hasSubcategories}
        on:click={toggleExpand}
    >
        <span class="category-name">
            {#if hasSubcategories}
                <span class="expand-icon">{expanded ? "▼" : "▶"}</span>
            {/if}
            {#if isSubcategory}
                <span class="indent">↳</span>
            {/if}
            {item.icon}
            {item.name}
        </span>
        <span class="category-amount">{item.amount.toFixed(2)} {currency}</span>
    </div>
    <div class="category-bar-container">
        <div
            class="category-bar"
            style="width: {percentage}%; background-color: {item.color};"
        ></div>
    </div>
</div>

{#if expanded && item.subcategories}
    <div class="subcategories">
        {#each item.subcategories as sub}
            <svelte:self
                item={sub}
                {maxAmount}
                {currency}
                isSubcategory={true}
            />
        {/each}
    </div>
{/if}

<style>
    .category-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .category-row.subcategory {
        padding-left: 24px;
        border-left: 2px solid var(--background-modifier-border);
        margin-left: 8px;
    }

    .category-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .category-label.clickable {
        cursor: pointer;
    }

    .category-label.clickable:hover {
        opacity: 0.8;
    }

    .category-name {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .expand-icon {
        font-size: 10px;
        width: 14px;
        color: var(--text-muted);
    }

    .indent {
        color: var(--text-muted);
        margin-right: 4px;
    }

    .category-amount {
        font-weight: 600;
        color: var(--text-muted);
    }

    .category-bar-container {
        height: 8px;
        background: var(--background-secondary);
        border-radius: 4px;
        overflow: hidden;
    }

    .category-bar {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
        min-width: 2px;
    }

    .subcategories {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
    }
</style>
