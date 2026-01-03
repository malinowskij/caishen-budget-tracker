<script lang="ts">
    import { App, Modal } from "obsidian";
    import type { BudgetPluginSettings, Transaction, Category } from "../types";
    import { t } from "../i18n";

    export let settings: BudgetPluginSettings;
    export let onSubmit: (
        transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
    ) => void;
    export let onClose: () => void;
    export let editTransaction: Transaction | null = null;

    $: trans = t(settings.locale);

    // Form state
    let type: "income" | "expense" = editTransaction?.type ?? "expense";
    let date: string =
        editTransaction?.date ?? new Date().toISOString().split("T")[0] ?? "";
    let amount: number = editTransaction?.amount ?? 0;
    let category: string = editTransaction?.category ?? "";
    let description: string = editTransaction?.description ?? "";

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
        if (amount <= 0 || !category || !date) return;

        onSubmit({
            type,
            date,
            amount,
            category,
            description,
            currency: settings.defaultCurrency,
        });
    }
</script>

<div class="budget-transaction-modal">
    <h2>{editTransaction ? trans.editTransaction : trans.newTransaction}</h2>

    <div class="setting-item">
        <div class="setting-item-info">
            <div class="setting-item-name">{trans.transactionType}</div>
            <div class="setting-item-description">
                {trans.transactionTypeDesc}
            </div>
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
            <div class="setting-item-name">{trans.date}</div>
            <div class="setting-item-description">{trans.dateDesc}</div>
        </div>
        <div class="setting-item-control">
            <input type="date" bind:value={date} />
        </div>
    </div>

    <div class="setting-item">
        <div class="setting-item-info">
            <div class="setting-item-name">{trans.amount}</div>
            <div class="setting-item-description">{trans.amountDesc}</div>
        </div>
        <div class="setting-item-control">
            <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                bind:value={amount}
            />
            <span class="currency-label">{settings.defaultCurrency}</span>
        </div>
    </div>

    <div class="setting-item">
        <div class="setting-item-info">
            <div class="setting-item-name">{trans.category}</div>
            <div class="setting-item-description">{trans.categoryDesc}</div>
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
            <div class="setting-item-name">{trans.description}</div>
            <div class="setting-item-description">{trans.descriptionDesc}</div>
        </div>
        <div class="setting-item-control">
            <input
                type="text"
                placeholder={trans.descriptionPlaceholder}
                bind:value={description}
                style="width: 100%;"
            />
        </div>
    </div>

    <div class="modal-button-container">
        <button on:click={onClose}>{trans.cancel}</button>
        <button class="mod-cta" on:click={handleSubmit}>
            {editTransaction ? trans.saveChanges : trans.addTransaction}
        </button>
    </div>
</div>

<style>
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
    }

    .modal-button-container {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
</style>
