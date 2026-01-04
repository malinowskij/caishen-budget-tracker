<script lang="ts">
    import type {
        RecurringTransaction,
        Category,
        BudgetPluginSettings,
    } from "../types";
    import type { Translations } from "../i18n";

    export let settings: BudgetPluginSettings;
    export let trans: Translations;
    export let editItem: RecurringTransaction | null = null;
    export let onSubmit: (
        item: Omit<RecurringTransaction, "id" | "lastProcessed">,
    ) => void;
    export let onClose: () => void;

    // Form state
    let name = editItem?.name ?? "";
    let amount = editItem?.amount ?? 0;
    let type: "income" | "expense" = editItem?.type ?? "expense";
    let category = editItem?.category ?? "";
    let dayOfMonth = editItem?.dayOfMonth ?? 1;
    let isActive = editItem?.isActive ?? true;

    $: filteredCategories = settings.categories.filter(
        (c) => c.type === type || c.type === "both",
    );

    // Set default category when type changes
    $: if (
        filteredCategories.length > 0 &&
        !filteredCategories.some((c) => c.id === category)
    ) {
        category = filteredCategories[0]?.id ?? "";
    }

    function handleSubmit() {
        if (
            !name ||
            amount <= 0 ||
            !category ||
            dayOfMonth < 1 ||
            dayOfMonth > 28
        )
            return;

        onSubmit({
            name,
            amount,
            type,
            category,
            dayOfMonth,
            isActive,
        });
    }
</script>

<div class="recurring-modal">
    <h2>{editItem ? trans.editRecurring : trans.addRecurring}</h2>

    <div class="setting-item">
        <div class="setting-item-info">
            <div class="setting-item-name">{trans.recurringName}</div>
        </div>
        <div class="setting-item-control">
            <input
                type="text"
                placeholder="Netflix, Rent..."
                bind:value={name}
            />
        </div>
    </div>

    <div class="setting-item">
        <div class="setting-item-info">
            <div class="setting-item-name">{trans.transactionType}</div>
        </div>
        <div class="setting-item-control">
            <select bind:value={type}>
                <option value="expense">🔴 {trans.expense}</option>
                <option value="income">💚 {trans.income}</option>
            </select>
        </div>
    </div>

    <div class="setting-item">
        <div class="setting-item-info">
            <div class="setting-item-name">{trans.amount}</div>
        </div>
        <div class="setting-item-control">
            <input type="number" step="0.01" min="0" bind:value={amount} />
            <span class="currency-label">{settings.defaultCurrency}</span>
        </div>
    </div>

    <div class="setting-item">
        <div class="setting-item-info">
            <div class="setting-item-name">{trans.category}</div>
        </div>
        <div class="setting-item-control">
            <select bind:value={category}>
                {#each filteredCategories as cat}
                    <option value={cat.id}>{cat.icon} {cat.name}</option>
                {/each}
            </select>
        </div>
    </div>

    <div class="setting-item">
        <div class="setting-item-info">
            <div class="setting-item-name">{trans.dayOfMonth}</div>
            <div class="setting-item-description">1-28</div>
        </div>
        <div class="setting-item-control">
            <input
                type="number"
                min="1"
                max="28"
                bind:value={dayOfMonth}
                style="width: 60px;"
            />
        </div>
    </div>

    <div class="modal-button-container">
        <button on:click={onClose}>{trans.cancel}</button>
        <button class="mod-cta" on:click={handleSubmit}>
            {editItem ? trans.saveChanges : trans.add}
        </button>
    </div>
</div>

<style>
    .recurring-modal {
        min-width: 400px;
    }

    .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--background-modifier-border);
    }

    .setting-item-control {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .modal-button-container {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
</style>
