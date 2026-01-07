# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Caishen - Budget Tracker** is an Obsidian plugin for budget management and expense tracking. It's built with TypeScript and Svelte, using Vite as the build tool. The plugin provides a comprehensive budget management system within Obsidian with a "Vibrant Glass" UI design.

## Development Commands

```bash
# Development build with watch mode (rebuilds on file changes)
npm run dev

# Production build (optimized and minified)
npm run build

# Type checking for Svelte components
npm run check

# Lint TypeScript source files
npm run lint
```

**Important:** The build outputs `main.js` to the root directory, which is the plugin entry point. This file, along with `manifest.json` and `styles.css`, are the only files needed to distribute the plugin.

## Architecture

### Core Plugin Structure

The plugin follows a service-oriented architecture with clear separation of concerns:

- **`main.ts`**: Entry point implementing the Obsidian `Plugin` interface. Handles plugin lifecycle, commands, ribbon icons, and coordinates services.
- **`data-service.ts`**: Business logic layer for transaction management. Handles CRUD operations, filtering, analytics, and markdown synchronization.
- **`config-service.ts`**: Manages plugin configuration. Loads/saves settings from markdown files with YAML frontmatter in the vault's Budget folder.
- **`types.ts`**: TypeScript interfaces and types. Defines data structures for transactions, categories, savings goals, and settings. Also contains default category definitions.
- **`i18n.ts`**: Internationalization system. Type-safe translation system supporting English and Polish locales.

### Data Flow

1. **Storage**: Transaction data is stored in two places:
   - JSON file: `data.json` in the plugin directory (primary storage)
   - Markdown files: Monthly files in the configured budget folder (e.g., `Budget/2025-01.md`) for portability

2. **Synchronization**: On plugin load, the `DataService.syncFromMarkdownFiles()` automatically imports transactions from markdown files. When transactions are added/updated, corresponding markdown files are regenerated.

3. **Configuration**: Settings are loaded from:
   - Plugin data: `data.json` in plugin directory
   - Markdown config: `_config.md` in the budget folder with YAML frontmatter

### UI Architecture

The plugin uses Obsidian's View system for the dashboard:

- **`dashboard-view.ts`**: Creates a new Obsidian leaf (view) that hosts the main Svelte dashboard
- **`Dashboard.svelte`**: Main container with tabbed navigation (Overview, Categories, Goals, Analytics, Transactions)
- **Component structure**: Each tab has dedicated Svelte components for specific functionality:
  - Charts: `PieChart.svelte`, `TrendChart.svelte`, `CategoryBar.svelte`
  - Forms: `TransactionForm.svelte`, `RecurringForm.svelte`
  - Lists: `TransactionList.svelte`, `SavingsGoals.svelte`
  - Analytics: `YearlyOverview.svelte`, `SpendingStats.svelte`, `CategoryComparison.svelte`

### Modal System

Modals are implemented as Obsidian modal subclasses that wrap Svelte components:

- **`TransactionModal`**: Wraps `TransactionForm.svelte` for adding/editing transactions
- **`SavingsGoalModal`**: For creating/editing savings goals
- Modals communicate with the plugin through callback interfaces defined in `types.ts`

### Key Patterns

**Reactive Updates**: Svelte's reactivity system handles UI updates. When data changes in `DataService`, components using that data automatically re-render.

**Interface-Based Design**: Services implement interfaces (`IDataService`, `IBudgetPlugin`) defined in `types.ts`, making them testable and swappable.

**Locale-Aware Defaults**: Default categories and translations are generated based on the detected locale (see `getDefaultCategories()` and `t()` function in `i18n.ts`).

**Recurring Transaction Processing**: The plugin automatically processes recurring transactions on load using a backfill algorithm that fills in missed periods since the recurring item's creation (see `processRecurringTransactions()` in `main.ts`).

## Build Configuration

**Vite Setup** (`vite.config.ts`):
- Entry point: `src/main.ts` → outputs `main.js`
- Format: CommonJS (required for Obsidian)
- CSS injection: Styles are injected into the JS bundle (`css: 'injected'`)
- External modules: Obsidian and Electron dependencies are marked as external
- Source maps: Inline in development, none in production
- Minification: Enabled in production mode

**TypeScript Configuration**:
- Strict mode enabled
- Svelte type checking via `svelte-check`
- Uses `@tsconfig/svelte` base configuration

## Working with Categories

Categories support hierarchical structure via `parentId` field. When adding category-related features:
- Consider both top-level and nested categories
- Use `getHierarchicalCategoryBreakdown()` for tree-structured data
- Category configuration is managed through the settings tab with a tree view component

## Internationalization

When adding new user-facing strings:
1. Add the key to the `Translations` interface in `i18n.ts`
2. Add translations for both 'en' and 'pl' locales in the translations object
3. Use `t(settings.locale)` to get the translation function
4. Access strings via `t(locale).yourKey`

The plugin auto-detects locale on first load using `detectLocale()`.

## Common File Locations

- **Plugin entry**: `src/main.ts`
- **Type definitions**: `src/types.ts`
- **Business logic**: `src/data-service.ts`
- **Configuration**: `src/config-service.ts`
- **UI components**: `src/components/*.svelte`
- **Modals**: `src/*-modal.ts`
- **Settings**: `src/settings.ts`
- **Build output**: `main.js` (root)
- **Manifest**: `manifest.json`
- **Styles**: `styles.css`

## Testing in Obsidian

During development:
1. Run `npm run dev` to start watch mode
2. The build output (`main.js`, `manifest.json`, `styles.css) should be in your vault's `.obsidian/plugins/caishen-budget-tracker/` folder
3. Reload Obsidian or use the Hot Reload plugin
4. Check the developer console for debug logs prefixed with `[Budget]`
