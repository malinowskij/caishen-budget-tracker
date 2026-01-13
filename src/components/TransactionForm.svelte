<script lang="ts">
    import type { BudgetPluginSettings, Transaction } from "../types";
    import { t } from "../i18n";

    export let settings: BudgetPluginSettings;
    export let onSubmit: (
        transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
    ) => void;
    export let onClose: () => void;
    export let onDelete: (() => void) | undefined = undefined;
    export let editTransaction: Transaction | null = null;
    export let defaultType: "income" | "expense" | "investment" = "expense";

    $: trans = t(settings.locale);

    // Form state - use editTransaction type if editing, otherwise use defaultType
    let type: "income" | "expense" | "investment" =
        editTransaction?.type ?? defaultType;
    let date: string =
        editTransaction?.date ?? new Date().toISOString().split("T")[0] ?? "";
    let amount: number = editTransaction?.amount ?? 0;
    let category: string = editTransaction?.category ?? "";
    let description: string = editTransaction?.description ?? "";
    let tagsInput: string = editTransaction?.tags?.join(", ") ?? "";
    let excludeFromStats: boolean = editTransaction?.excludeFromStats ?? false;
    let showDeleteConfirm = false;

    $: filteredCategories = settings.categories.filter(
        (c) => c.type === type || c.type === "both",
    );

    // Group categories: parents first, then subcategories
    $: parentCategories = filteredCategories.filter((c) => !c.parentId);
    $: getSubcategories = (parentId: string) =>
        filteredCategories.filter((c) => c.parentId === parentId);
    $: standaloneCategories = filteredCategories.filter(
        (c) => !c.parentId && getSubcategories(c.id).length === 0,
    );
    $: parentWithChildren = parentCategories.filter(
        (c) => getSubcategories(c.id).length > 0,
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

        // Parse tags from comma-separated input
        const tags = tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        onSubmit({
            type,
            date,
            amount,
            category,
            description,
            currency: settings.defaultCurrency,
            tags: tags.length > 0 ? tags : undefined,
            excludeFromStats: excludeFromStats || undefined,
        });
    }

    function handleDelete() {
        if (onDelete) {
            onDelete();
        }
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
                <option value="investment">📈 {trans.investment}</option>
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
                <!-- Standalone categories (no children) -->
                {#each standaloneCategories as cat}
                    <option value={cat.id}>{cat.icon} {cat.name}</option>
                {/each}
                <!-- Parent categories with subcategories -->
                {#each parentWithChildren as parent}
                    <optgroup label="{parent.icon} {parent.name}">
                        <option value={parent.id}
                            >{parent.icon} {parent.name} (all)</option
                        >
                        {#each getSubcategories(parent.id) as sub}
                            <option value={sub.id}
                                >↳ {sub.icon} {sub.name}</option
                            >
                        {/each}
                    </optgroup>
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

    <div class="setting-item">
        <div class="setting-item-info">
            <div class="setting-item-name">{trans.tags}</div>
            <div class="setting-item-description">{trans.tagsPlaceholder}</div>
        </div>
        <div class="setting-item-control">
            <input
                type="text"
                placeholder="work, groceries, urgent"
                bind:value={tagsInput}
                style="width: 100%;"
            />
        </div>
    </div>

    {#if type === "expense"}
        <div class="setting-item">
            <div class="setting-item-info">
                <div class="setting-item-name">{trans.excludeFromStats}</div>
                <div class="setting-item-description">
                    {trans.excludeFromStatsDesc}
                </div>
            </div>
            <div class="setting-item-control">
                <input type="checkbox" bind:checked={excludeFromStats} />
            </div>
        </div>
    {/if}

    {#if editTransaction && onDelete}
        {#if showDeleteConfirm}
            <div class="delete-confirm">
                <p>{trans.confirmDeleteTransaction}</p>
                <div class="delete-confirm-buttons">
                    <button on:click={() => (showDeleteConfirm = false)}
                        >{trans.cancel}</button
                    >
                    <button class="mod-warning" on:click={handleDelete}
                        >{trans.delete}</button
                    >
                </div>
            </div>
        {:else}
            <button
                class="delete-button"
                on:click={() => (showDeleteConfirm = true)}
            >
                🗑️ {trans.deleteTransaction}
            </button>
        {/if}
    {/if}

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

    .delete-button {
        margin-top: 16px;
        width: 100%;
        background: var(--background-modifier-error);
        color: var(--text-on-accent);
    }

    .delete-confirm {
        margin-top: 16px;
        padding: 12px;
        background: var(--background-modifier-error-hover);
        border-radius: 8px;
    }

    .delete-confirm p {
        margin: 0 0 12px 0;
        color: var(--text-error);
    }

    .delete-confirm-buttons {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    }
</style>
