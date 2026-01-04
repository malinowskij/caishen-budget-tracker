<script lang="ts">
    import type { Transaction, Category, TransactionFilter } from "../types";
    import type { Translations } from "../i18n";

    export let transactions: Transaction[];
    export let categories: Category[];
    export let trans: Translations;
    export let currency: string;

    function getCategory(categoryId: string): Category | undefined {
        return categories.find((c) => c.id === categoryId);
    }

    function exportToCSV() {
        const headers = [
            "Date",
            "Type",
            "Category",
            "Amount",
            "Currency",
            "Description",
        ];
        const rows = transactions.map((t) => {
            const cat = getCategory(t.category);
            return [
                t.date,
                t.type,
                cat?.name ?? t.category,
                t.amount.toString(),
                t.currency,
                `"${(t.description ?? "").replace(/"/g, '""')}"`,
            ].join(",");
        });

        const csv = [headers.join(","), ...rows].join("\n");
        downloadFile(csv, "budget-export.csv", "text/csv");
    }

    function exportToJSON() {
        const data = {
            exportDate: new Date().toISOString(),
            currency,
            transactions: transactions.map((t) => ({
                ...t,
                categoryName: getCategory(t.category)?.name ?? t.category,
            })),
        };

        const json = JSON.stringify(data, null, 2);
        downloadFile(json, "budget-backup.json", "application/json");
    }

    function downloadFile(content: string, filename: string, mimeType: string) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
</script>

<div class="export-buttons">
    <button class="export-btn" on:click={exportToCSV}>
        📊 {trans.exportCSV ?? "Export CSV"}
    </button>
    <button class="export-btn" on:click={exportToJSON}>
        💾 {trans.exportJSON ?? "Export JSON"}
    </button>
</div>

<style>
    .export-buttons {
        display: flex;
        gap: 8px;
        margin-top: 12px;
    }

    .export-btn {
        padding: 6px 12px;
        font-size: 13px;
        background: var(--background-secondary);
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        cursor: pointer;
    }

    .export-btn:hover {
        background: var(--background-modifier-hover);
    }
</style>
