import type { App, TFile } from 'obsidian';
import type { BudgetPluginSettings, Category, RecurringTransaction } from './types';
import type { Locale } from './i18n';

const CONFIG_FILE_NAME = '_config.md';

export class ConfigService {
    private app: App;
    private budgetFolder: string;

    constructor(app: App, budgetFolder: string) {
        this.app = app;
        this.budgetFolder = budgetFolder;
    }

    updateBudgetFolder(folder: string) {
        this.budgetFolder = folder;
    }

    private getConfigPath(): string {
        return `${this.budgetFolder}/${CONFIG_FILE_NAME}`;
    }

    // Check if config file exists
    async configFileExists(): Promise<boolean> {
        const path = this.getConfigPath();
        return this.app.vault.getAbstractFileByPath(path) !== null;
    }

    // Load settings from markdown config file
    async loadConfigFromMarkdown(): Promise<BudgetPluginSettings | null> {
        const path = this.getConfigPath();
        const file = this.app.vault.getAbstractFileByPath(path);

        if (!file || !(file instanceof this.app.vault.adapter.constructor)) {
            // Check if it's a TFile
            const tfile = this.app.vault.getAbstractFileByPath(path);
            if (!tfile) {
                console.log(`[Budget] Config file not found: ${path}`);
                return null;
            }
        }

        try {
            const tfile = this.app.vault.getAbstractFileByPath(path) as TFile;
            if (!tfile || !('extension' in tfile)) {
                return null;
            }

            const content = await this.app.vault.read(tfile);
            return this.parseYamlFrontmatter(content);
        } catch (err) {
            console.error('[Budget] Failed to load config from markdown:', err);
            return null;
        }
    }

    // Parse YAML frontmatter from markdown content
    private parseYamlFrontmatter(content: string): BudgetPluginSettings | null {
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) {
            console.log('[Budget] No frontmatter found in config file');
            return null;
        }

        try {
            const yaml = frontmatterMatch[1];
            const settings = this.parseYaml(yaml);
            return settings as BudgetPluginSettings;
        } catch (err) {
            console.error('[Budget] Failed to parse config YAML:', err);
            return null;
        }
    }

    // Simple YAML parser for our config structure
    private parseYaml(yaml: string): Partial<BudgetPluginSettings> {
        const result: Partial<BudgetPluginSettings> = {};
        const lines = yaml.split('\n');

        let currentArray: string | null = null;
        let currentObject: Record<string, unknown> | null = null;
        let arrayItems: unknown[] = [];

        for (const line of lines) {
            // Skip comments and empty lines
            if (line.trim().startsWith('#') || line.trim() === '') continue;

            // Check for top-level key
            const topLevelMatch = line.match(/^(\w+):\s*(.*)$/);
            if (topLevelMatch) {
                // Save previous array if exists
                if (currentArray && arrayItems.length > 0) {
                    (result as Record<string, unknown>)[currentArray] = arrayItems;
                    arrayItems = [];
                }

                const [, key, value] = topLevelMatch;

                if (value === '' || value === undefined) {
                    // This is an array or object start
                    currentArray = key;
                    currentObject = null;
                } else {
                    // Simple value
                    currentArray = null;
                    (result as Record<string, unknown>)[key] = this.parseValue(value);
                }
                continue;
            }

            // Check for array item start
            const arrayItemMatch = line.match(/^\s+-\s+(\w+):\s*(.*)$/);
            if (arrayItemMatch && currentArray) {
                // Save previous object
                if (currentObject) {
                    arrayItems.push(currentObject);
                }
                const [, key, value] = arrayItemMatch;
                currentObject = { [key]: this.parseValue(value) };
                continue;
            }

            // Check for object property (continuation of array item)
            const objectPropMatch = line.match(/^\s+(\w+):\s*(.*)$/);
            if (objectPropMatch && currentObject) {
                const [, key, value] = objectPropMatch;
                currentObject[key] = this.parseValue(value);
                continue;
            }
        }

        // Save last array/object
        if (currentObject) {
            arrayItems.push(currentObject);
        }
        if (currentArray && arrayItems.length > 0) {
            (result as Record<string, unknown>)[currentArray] = arrayItems;
        }

        return result;
    }

    // Parse a YAML value
    private parseValue(value: string): unknown {
        const trimmed = value.trim();

        // Boolean
        if (trimmed === 'true') return true;
        if (trimmed === 'false') return false;

        // Number
        if (/^-?\d+\.?\d*$/.test(trimmed)) {
            return parseFloat(trimmed);
        }

        // Quoted string
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            return trimmed.slice(1, -1);
        }

        // Plain string
        return trimmed;
    }

    // Save settings to markdown config file
    async saveConfigToMarkdown(settings: BudgetPluginSettings): Promise<void> {
        const path = this.getConfigPath();
        const content = this.generateConfigContent(settings);

        try {
            // Ensure budget folder exists
            await this.ensureFolderExists(this.budgetFolder);

            const existingFile = this.app.vault.getAbstractFileByPath(path);
            if (existingFile) {
                await this.app.vault.modify(existingFile as TFile, content);
            } else {
                await this.app.vault.create(path, content);
            }
            console.log('[Budget] Config saved to markdown file');
        } catch (err) {
            console.error('[Budget] Failed to save config to markdown:', err);
            throw err;
        }
    }

    private async ensureFolderExists(folderPath: string): Promise<void> {
        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        if (!folder) {
            await this.app.vault.createFolder(folderPath);
        }
    }

    // Generate markdown content with YAML frontmatter
    private generateConfigContent(settings: BudgetPluginSettings): string {
        let yaml = '---\n';
        yaml += '# Budget Tracker Configuration\n';
        yaml += '# This file syncs your settings across devices\n\n';

        // Simple settings
        yaml += `locale: ${settings.locale}\n`;
        yaml += `defaultCurrency: ${settings.defaultCurrency}\n`;
        yaml += `budgetFolder: ${settings.budgetFolder}\n`;
        yaml += `showBalanceInStatusBar: ${settings.showBalanceInStatusBar}\n`;
        yaml += `dateFormat: ${settings.dateFormat}\n`;
        yaml += `currencies: [${settings.currencies.map(c => `"${c}"`).join(', ')}]\n`;
        yaml += '\n';

        // Categories
        yaml += 'categories:\n';
        for (const cat of settings.categories) {
            yaml += `  - id: ${cat.id}\n`;
            yaml += `    name: "${cat.name}"\n`;
            yaml += `    icon: "${cat.icon}"\n`;
            yaml += `    type: ${cat.type}\n`;
            yaml += `    color: "${cat.color}"\n`;
            if (cat.budgetLimit !== undefined && cat.budgetLimit > 0) {
                yaml += `    budgetLimit: ${cat.budgetLimit}\n`;
            }
        }
        yaml += '\n';

        // Recurring transactions
        yaml += 'recurringTransactions:\n';
        if (settings.recurringTransactions.length === 0) {
            yaml += '  # No recurring transactions configured\n';
        } else {
            for (const rec of settings.recurringTransactions) {
                yaml += `  - id: ${rec.id}\n`;
                yaml += `    name: "${rec.name}"\n`;
                yaml += `    amount: ${rec.amount}\n`;
                yaml += `    type: ${rec.type}\n`;
                yaml += `    category: ${rec.category}\n`;
                yaml += `    dayOfMonth: ${rec.dayOfMonth}\n`;
                yaml += `    isActive: ${rec.isActive}\n`;
                yaml += `    createdAt: "${rec.createdAt}"\n`;
                if (rec.lastProcessed) {
                    yaml += `    lastProcessed: "${rec.lastProcessed}"\n`;
                }
            }
        }

        yaml += '---\n\n';
        yaml += '# 💰 Budget Configuration\n\n';
        yaml += '> [!NOTE]\n';
        yaml += '> This file stores your Budget Tracker settings.\n';
        yaml += '> It syncs across devices via your sync method (WebDAV, Syncthing, etc.)\n\n';
        yaml += 'Do not edit manually unless you know what you\'re doing.\n';

        return yaml;
    }
}
