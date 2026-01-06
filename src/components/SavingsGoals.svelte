<script lang="ts">
    import type { SavingsGoal } from "../types";
    import type { Translations } from "../i18n";

    export let goals: SavingsGoal[];
    export let trans: Translations;
    export let currency: string;
    export let onAdd: () => void;
    export let onEdit: (goal: SavingsGoal) => void;
    export let onAddFunds: (goalId: string, amount: number) => void;

    function formatAmount(amount: number): string {
        return amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    function getProgress(goal: SavingsGoal): number {
        if (goal.targetAmount <= 0) return 0;
        return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
    }

    function getDaysRemaining(deadline?: string): number | null {
        if (!deadline) return null;
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    let addFundAmount: Record<string, number> = {};

    function handleAddFunds(goalId: string) {
        const amount = addFundAmount[goalId] || 0;
        if (amount > 0) {
            onAddFunds(goalId, amount);
            addFundAmount[goalId] = 0;
        }
    }
</script>

<div class="savings-goals">
    <div class="section-header">
        <h3>{trans.savingsGoals}</h3>
        <button class="add-goal-btn" on:click={onAdd}>➕</button>
    </div>

    {#if goals.length === 0}
        <p class="no-goals">{trans.noGoalsYet}</p>
    {:else}
        <div class="goals-list">
            {#each goals as goal}
                {@const progress = getProgress(goal)}
                {@const daysRemaining = getDaysRemaining(goal.deadline)}
                <div class="goal-card">
                    <div class="goal-header">
                        <span class="goal-icon">{goal.icon}</span>
                        <span class="goal-name">{goal.name}</span>
                        <button class="edit-btn" on:click={() => onEdit(goal)}
                            >✏️</button
                        >
                    </div>

                    <div class="goal-amounts">
                        <span class="current"
                            >{formatAmount(goal.currentAmount)} {currency}</span
                        >
                        <span class="separator">/</span>
                        <span class="target"
                            >{formatAmount(goal.targetAmount)} {currency}</span
                        >
                    </div>

                    <div class="progress-bar">
                        <div
                            class="progress-fill"
                            style="width: {progress}%; background: {goal.color}"
                        ></div>
                    </div>
                    <div class="progress-info">
                        <span class="percentage">{progress.toFixed(0)}%</span>
                        {#if daysRemaining !== null}
                            <span
                                class="deadline"
                                class:urgent={daysRemaining < 30}
                            >
                                {daysRemaining > 0
                                    ? `${daysRemaining} days left`
                                    : "Past deadline"}
                            </span>
                        {/if}
                    </div>

                    <div class="add-funds">
                        <input
                            type="number"
                            min="0"
                            step="10"
                            placeholder="Amount"
                            bind:value={addFundAmount[goal.id]}
                        />
                        <button on:click={() => handleAddFunds(goal.id)}>
                            {trans.addToGoal}
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .savings-goals {
        background: var(--background-secondary);
        border-radius: 12px;
        padding: 16px;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    .section-header h3 {
        margin: 0;
    }

    .add-goal-btn {
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        background: var(--interactive-accent);
        color: white;
        cursor: pointer;
        font-size: 14px;
    }

    .no-goals {
        color: var(--text-muted);
        text-align: center;
        padding: 20px;
    }

    .goals-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .goal-card {
        background: var(--background-primary);
        border-radius: 8px;
        padding: 16px;
    }

    .goal-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
    }

    .goal-icon {
        font-size: 24px;
    }

    .goal-name {
        flex: 1;
        font-weight: 600;
        font-size: 16px;
    }

    .edit-btn {
        padding: 4px 8px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        opacity: 0.6;
    }

    .edit-btn:hover {
        opacity: 1;
    }

    .goal-amounts {
        display: flex;
        align-items: baseline;
        gap: 4px;
        margin-bottom: 8px;
    }

    .current {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-accent);
    }

    .separator {
        color: var(--text-muted);
    }

    .target {
        color: var(--text-muted);
    }

    .progress-bar {
        height: 8px;
        background: var(--background-modifier-border);
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        min-height: 8px;
        border-radius: 4px;
        transition: width 0.3s ease;
        min-width: 2px;
    }

    .progress-info {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        margin-top: 4px;
        color: var(--text-muted);
    }

    .deadline.urgent {
        color: #e74c3c;
    }

    .add-funds {
        display: flex;
        gap: 8px;
        margin-top: 12px;
    }

    .add-funds input {
        flex: 1;
        padding: 6px 10px;
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        background: var(--background-secondary);
        color: var(--text-normal);
    }

    .add-funds button {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        background: #27ae60;
        color: white;
        cursor: pointer;
        font-size: 12px;
    }

    .add-funds button:hover {
        background: #2ecc71;
    }
</style>
