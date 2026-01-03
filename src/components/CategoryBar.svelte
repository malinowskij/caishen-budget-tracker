<script lang="ts">
    export let item: {
        icon: string;
        name: string;
        amount: number;
        color: string;
    };
    export let maxAmount: number;
    export let currency: string;

    $: percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
</script>

<div class="category-row">
    <div class="category-label">
        <span>{item.icon} {item.name}</span>
        <span class="category-amount">{item.amount.toFixed(2)} {currency}</span>
    </div>
    <div class="category-bar-container">
        <div
            class="category-bar"
            style="width: {percentage}%; background-color: {item.color};"
        ></div>
    </div>
</div>
