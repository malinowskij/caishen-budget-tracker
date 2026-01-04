# 💰 Obsidian Budget Tracker

An intuitive budget management and expense tracking plugin for [Obsidian](https://obsidian.md/). Track your income and expenses with a beautiful dashboard – no Markdown or Dataview queries required.

Built with **Svelte** for a reactive, modern UI experience.

![Dashboard Preview](docs/dashboard-preview.png)

## ✨ Features

### 📊 Dashboard
- **Monthly Overview** – View income, expenses, and balance at a glance
- **Pie Chart** – Visual breakdown of expenses by category
- **Trend Chart** – 6-month income vs expense comparison
- **Budget Progress** – Track spending against category limits with warnings at 80% and 100%

### 💳 Transaction Management
- **Quick Add** – Add transactions via ribbon icon, command palette, or dashboard
- **Edit & Delete** – Click any transaction to edit or remove it
- **Search & Filter** – Filter by date range, category, type, or description
- **Auto-organized Files** – Transactions saved to `Budget/YYYY/MM-Month.md`

### 🔄 Recurring Transactions
- **Set Up Once** – Define monthly recurring income or expenses
- **Auto-add** – Transactions are automatically added on specified day each month
- **Toggle On/Off** – Disable without deleting

### 🎯 Monthly Budgets
- **Category Limits** – Set spending limits per expense category
- **Progress Bars** – Visual indication of how much budget remains
- **Warnings** – Alerts when approaching (80%) or exceeding (100%) limits

### 📤 Export
- **CSV Export** – Download transactions for spreadsheet analysis
- **JSON Backup** – Full data export for backup purposes

### 🌍 Internationalization
- **English** 🇬🇧 and **Polish** 🇵🇱 (auto-detected)
- Easily extensible for other languages

### ⚙️ Customization
- **Custom Categories** – Add, edit, or remove expense/income categories
- **Category Icons & Colors** – Personalize your categories
- **Default Currency** – Set your preferred currency
- **Status Bar** – Optional balance display in Obsidian's status bar

### 📱 Multi-platform
- Works on **Desktop** (Windows, macOS, Linux) and **Mobile** (iOS, Android)

---

## 🚀 Installation

### Via Community Plugins
1. Open **Settings** → **Community plugins**
2. Click **Browse** and search for `Budget Tracker`
3. Click **Install**, then **Enable**

### Manual Installation
1. Download the latest release: `main.js`, `manifest.json`, `styles.css`
2. Create folder `.obsidian/plugins/budget-tracker/` in your vault
3. Copy downloaded files into that folder
4. Enable **Budget Tracker** in Settings → Community plugins

---

## 🎮 Usage

### Adding Transactions
- **Ribbon Icon** – Click 💰 in the left sidebar
- **Command Palette** (`Ctrl/Cmd + P`):
  - `Add Transaction` – Opens add dialog
  - `Add Expense` – Opens with expense pre-selected
  - `Add Income` – Opens with income pre-selected
  - `Open Budget Dashboard` – Opens the main dashboard

### Dashboard Features
| Feature | Description |
|---------|-------------|
| Summary Cards | Income, Expenses, Balance for current month |
| Budget Progress | Spending vs limits for each category |
| Pie Chart | Visual expense breakdown |
| Trend Chart | 6-month income/expense history |
| Transaction List | Recent transactions with search & filters |
| Export Buttons | Download CSV or JSON |

### Settings
Access via **Settings** → **Budget Tracker**:
- Change language
- Set budget folder location
- Configure default currency
- Manage expense/income categories
- Set category budget limits
- Manage recurring transactions

---

## 🛠️ Development

### Tech Stack
- **TypeScript** – Type-safe code
- **Svelte** – Reactive UI components
- **Vite** – Fast build tool
- **Obsidian API** – Plugin integration

### Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/obsidian-budget-tracker.git
cd obsidian-budget-tracker

# Install dependencies
npm install

# Development build with watch
npm run dev

# Production build
npm run build

# Type-check Svelte components
npm run check
```

### Project Structure

```
src/
├── main.ts                 # Plugin entry point
├── types.ts                # TypeScript interfaces
├── constants.ts            # Shared constants
├── i18n.ts                 # Translations (en, pl)
├── data-service.ts         # Data management & Markdown generation
├── settings.ts             # Settings panel
├── dashboard-view.ts       # Obsidian view wrapper
├── transaction-modal.ts    # Transaction modal wrapper
├── recurring-modal.ts      # Recurring transaction modal
└── components/
    ├── Dashboard.svelte        # Main dashboard
    ├── TransactionForm.svelte  # Add/edit transaction form
    ├── TransactionList.svelte  # Transaction list with click-to-edit
    ├── TransactionFilters.svelte # Search & filter UI
    ├── CategoryBar.svelte      # Category progress bar
    ├── TrendChart.svelte       # 6-month trend visualization
    ├── PieChart.svelte         # Expense breakdown chart
    ├── BudgetProgress.svelte   # Budget limit progress bars
    ├── ExportButtons.svelte    # CSV/JSON export
    ├── RecurringForm.svelte    # Recurring transaction form
    └── RecurringTransactions.svelte # Recurring list component
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

MIT License – see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Obsidian](https://obsidian.md/) for the amazing knowledge base app
- [Svelte](https://svelte.dev/) for the reactive UI framework
- All contributors and users who provide valuable feedback

---

**Made with ❤️ for the Obsidian community**
