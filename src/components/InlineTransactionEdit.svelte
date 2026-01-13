<script lang="ts">
    import type { Transaction, Category } from "../types";
    import { createEventDispatcher } from "svelte";

    export let transaction: Transaction;
    export let categories: Category[];
    export let currency: string;

    const dispatch = createEventDispatcher<{
        save: Omit<Transaction, "id" | "createdAt" | "updatedAt">;
        cancel: void;
        delete: void;
    }>();

    // Form state
    let amount = transaction.amount;
    let type: "income" | "expense" | "investment" = transaction.type;
    let category = transaction.category;
    let description = transaction.description;
    let date = transaction.date;

    $: filteredCategories = categories.filter(
        (c) => c.type === type || c.type === "both",
    );

    function handleSave() {
        dispatch("save", {
            date,
            amount,
            type,
            category,
            description,
            currency,
        });
    }

    function handleCancel() {
        dispatch("cancel");
    }

    function handleDelete() {
        if (confirm("Delete this transaction?")) {
            dispatch("delete");
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === "Escape") {
            handleCancel();
        }
    }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div class="inline-edit" on:keydown={handleKeydown} role="form">
    <div class="inline-edit-row">
        <input type="date" bind:value={date} class="inline-input date-input" />

        <select bind:value={type} class="inline-select type-select">
            <option value="expense">🔴</option>
            <option value="income">💚</option>
            <option value="investment">📈</option>
        </select>

        <select bind:value={category} class="inline-select category-select">
            {#each filteredCategories as cat}
                <option value={cat.id}>{cat.icon} {cat.name}</option>
            {/each}
        </select>

        <input
            type="text"
            bind:value={description}
            placeholder="Description..."
            class="inline-input desc-input"
        />

        <input
            type="number"
            step="0.01"
            min="0"
            bind:value={amount}
            class="inline-input amount-input"
        />

        <span class="currency-label">{currency}</span>
    </div>

    <div class="inline-edit-actions">
        <button class="btn-save" on:click={handleSave}>✓</button>
        <button class="btn-cancel" on:click={handleCancel}>✕</button>
        <button class="btn-delete" on:click={handleDelete}>🗑</button>
    </div>
</div>

<style>
    .inline-edit {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        background: var(--background-primary);
        border: 1px solid var(--interactive-accent);
        border-radius: 8px;
        margin: 4px 0;
    }

    .inline-edit-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
    }

    .inline-input,
    .inline-select {
        padding: 6px 10px;
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        background: var(--background-secondary);
        color: var(--text-normal);
    }

    .date-input {
        width: 130px;
    }

    .type-select {
        width: 60px;
    }

    .category-select {
        flex: 1;
        min-width: 120px;
    }

    .desc-input {
        flex: 2;
        min-width: 150px;
    }

    .amount-input {
        width: 100px;
        text-align: right;
    }

    .currency-label {
        font-size: 12px;
        color: var(--text-muted);
    }

    .inline-edit-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    }

    .inline-edit-actions button {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }

    .btn-save {
        background: #27ae60;
        color: white;
    }

    .btn-cancel {
        background: var(--background-modifier-border);
        color: var(--text-normal);
    }

    .btn-delete {
        background: #e74c3c;
        color: white;
    }

    .inline-edit-actions button:hover {
        opacity: 0.8;
    }
</style>
