# 💰 Obsidian Budget Tracker

An intuitive budget management and expense tracking plugin for [Obsidian](https://obsidian.md/). Track your income and expenses without typing complex queries.

Built with **Svelte** for a reactive, modern UI experience.

## ✨ Features

- 📝 **Form-based Input**: Easily add transactions via a simple interface—no Markdown or Dataview queries required.
- 📊 **Visual Dashboard**: View your monthly balance, category breakdown, and spending trends in a dedicated view.
- 📁 **Auto-organized Data**: Transactions are automatically saved to `Budget/YYYY/MM-Month.md` files.
- 🌍 **Internationalization**: Full support for **English** 🇬🇧 and **Polish** 🇵🇱 (auto-detected).
- 📱 **Mobile Ready**: Works on both Desktop and Mobile versions of Obsidian.
- ⚙️ **Customizable**: Add, edit, or remove categories and manage multiple currencies (USD, EUR, PLN, GBP, etc.).
- 📉 **Status Bar Integration**: Keep an eye on your current monthly balance right in the bottom bar.
- ⚡ **Built with Svelte**: Fast, reactive UI components for a smooth experience.

## 🚀 Installation

### Via Community Plugins (Coming Soon)
1. Open **Settings** > **Community plugins**.
2. Click **Browse** and search for `Budget Tracker`.
3. Click **Install**, then **Enable**.

### Manual Installation
1. Download the latest release (`main.js`, `manifest.json`, `styles.css`).
2. Create a folder named `budget-tracker` in your vault's `.obsidian/plugins/` directory.
3. Copy the downloaded files into that folder.
4. Go to **Settings** > **Community plugins** and enable **Budget Tracker**.

## 🎮 How to Use

- **Ribbon Icon**: Click the wallet icon 💰 in the left sidebar to add a transaction.
- **Commands**: Use `Ctrl/Cmd + P` and search for:
  - `Budget Tracker: Add Transaction`
  - `Budget Tracker: Open Budget Dashboard`
  - `Budget Tracker: Add Expense`
  - `Budget Tracker: Add Income`
- **Dashboard**: The dashboard provides a high-level overview of your finances including spending by category and a 6-month trend chart.

## 🛠️ Development

This plugin is built with **Svelte** and **Vite**.

```bash
# Clone the repository
git clone https://github.com/malinowskij/budget-tracker.git

# Install dependencies
npm install

# Build for production
npm run build

# Development with watch mode
npm run dev

# Type-check Svelte components
npm run check
```

## 📁 Project Structure

```
src/
├── main.ts              # Plugin entry point
├── types.ts             # TypeScript interfaces
├── i18n.ts              # Internationalization
├── data-service.ts      # Data management & file generation
├── settings.ts          # Settings panel
├── dashboard-view.ts    # Obsidian view wrapper
├── transaction-modal.ts # Modal wrapper
└── components/          # Svelte components
    ├── Dashboard.svelte
    ├── TransactionForm.svelte
    ├── CategoryBar.svelte
    ├── TrendChart.svelte
    └── TransactionList.svelte
```

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.
