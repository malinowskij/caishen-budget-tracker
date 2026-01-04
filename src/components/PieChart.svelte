<script lang="ts">
    import type { Translations } from "../i18n";

    interface ChartData {
        category: string;
        name: string;
        amount: number;
        color: string;
        icon: string;
    }

    export let data: ChartData[];
    export let currency: string;
    export let trans: Translations;

    let hoveredIndex: number | null = null;

    $: total = data.reduce((sum, d) => sum + d.amount, 0);
    $: chartData = data.map((d, i) => ({
        ...d,
        percentage: total > 0 ? (d.amount / total) * 100 : 0,
    }));

    // Calculate pie slices
    $: slices = (() => {
        let currentAngle = 0;
        return chartData.map((d, i) => {
            const angle = (d.percentage / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            return {
                ...d,
                startAngle,
                endAngle: currentAngle,
                index: i,
            };
        });
    })();

    function describeArc(
        cx: number,
        cy: number,
        radius: number,
        startAngle: number,
        endAngle: number,
    ): string {
        const start = polarToCartesian(cx, cy, radius, endAngle);
        const end = polarToCartesian(cx, cy, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

        if (endAngle - startAngle >= 359.99) {
            // Full circle
            return `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy}`;
        }

        return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
    }

    function polarToCartesian(
        cx: number,
        cy: number,
        radius: number,
        angleInDegrees: number,
    ) {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
        return {
            x: cx + radius * Math.cos(angleInRadians),
            y: cy + radius * Math.sin(angleInRadians),
        };
    }

    function handleMouseEnter(index: number) {
        hoveredIndex = index;
    }

    function handleMouseLeave() {
        hoveredIndex = null;
    }
</script>

{#if data.length > 0 && total > 0}
    <div class="pie-chart-container">
        <svg viewBox="0 0 200 200" class="pie-chart">
            {#each slices as slice}
                <path
                    d={describeArc(
                        100,
                        100,
                        80,
                        slice.startAngle,
                        slice.endAngle,
                    )}
                    fill={slice.color}
                    class="pie-slice"
                    class:hovered={hoveredIndex === slice.index}
                    on:mouseenter={() => handleMouseEnter(slice.index)}
                    on:mouseleave={handleMouseLeave}
                    role="img"
                    aria-label="{slice.name}: {slice.percentage.toFixed(1)}%"
                />
            {/each}

            <!-- Center hole for donut effect -->
            <circle cx="100" cy="100" r="40" fill="var(--background-primary)" />

            <!-- Center text -->
            <text x="100" y="95" text-anchor="middle" class="center-label">
                {trans.expenses}
            </text>
            <text x="100" y="115" text-anchor="middle" class="center-amount">
                {total.toFixed(0)}
            </text>
        </svg>

        <!-- Legend -->
        <div class="pie-legend">
            {#each chartData as item, i}
                <div
                    class="legend-item"
                    class:hovered={hoveredIndex === i}
                    on:mouseenter={() => handleMouseEnter(i)}
                    on:mouseleave={handleMouseLeave}
                    role="listitem"
                >
                    <span class="legend-color" style="background: {item.color}"
                    ></span>
                    <span class="legend-name">{item.icon} {item.name}</span>
                    <span class="legend-value"
                        >{item.amount.toFixed(0)} {currency}</span
                    >
                    <span class="legend-percent"
                        >({item.percentage.toFixed(0)}%)</span
                    >
                </div>
            {/each}
        </div>

        <!-- Tooltip -->
        {#if hoveredIndex !== null && chartData[hoveredIndex]}
            {@const item = chartData[hoveredIndex]}
            <div class="pie-tooltip">
                <strong>{item.icon} {item.name}</strong><br />
                {item.amount.toFixed(2)}
                {currency} ({item.percentage.toFixed(1)}%)
            </div>
        {/if}
    </div>
{:else}
    <p class="empty-state">{trans.noExpensesThisMonth}</p>
{/if}

<style>
    .pie-chart-container {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
    }

    .pie-chart {
        width: 200px;
        height: 200px;
    }

    .pie-slice {
        transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        transform-origin: center;
        cursor: pointer;
    }

    .pie-slice.hovered {
        transform: scale(1.05);
        filter: brightness(1.1);
    }

    .center-label {
        fill: var(--text-muted);
        font-size: 10px;
    }

    .center-amount {
        fill: var(--text-normal);
        font-size: 16px;
        font-weight: 600;
    }

    .pie-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        max-width: 100%;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        background: var(--background-secondary);
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .legend-item.hovered {
        background: var(--background-modifier-hover);
    }

    .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
    }

    .legend-name {
        font-weight: 500;
    }

    .legend-value {
        color: var(--text-muted);
    }

    .legend-percent {
        color: var(--text-faint);
    }

    .pie-tooltip {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--background-primary);
        border: 1px solid var(--background-modifier-border);
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        text-align: center;
        pointer-events: none;
        z-index: 10;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
</style>
