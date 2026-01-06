// Internationalization (i18n) system for Budget Tracker plugin

export type Locale = 'en' | 'pl';

export interface Translations {
    // General
    pluginName: string;
    settings: string;
    save: string;
    cancel: string;
    confirm: string;
    delete: string;
    edit: string;
    add: string;
    refresh: string;

    // Transaction types
    income: string;
    expense: string;

    // Transaction modal
    addTransaction: string;
    editTransaction: string;
    newTransaction: string;
    transactionType: string;
    transactionTypeDesc: string;
    date: string;
    dateDesc: string;
    amount: string;
    amountDesc: string;
    category: string;
    categoryDesc: string;
    description: string;
    descriptionDesc: string;
    descriptionPlaceholder: string;
    saveChanges: string;

    // Dashboard
    budgetDashboard: string;
    addExpense: string;
    addIncome: string;
    incomes: string;
    expenses: string;
    balance: string;
    categoryBreakdown: string;
    trendLastMonths: string;
    recentTransactions: string;
    noExpensesThisMonth: string;
    noDataToDisplay: string;
    noTransactionsYet: string;

    // Filters
    search: string;
    searchPlaceholder: string;
    all: string;
    allCategories: string;
    dateFrom: string;
    dateTo: string;
    clearFilters: string;
    showFilters: string;
    hideFilters: string;
    exportCSV: string;
    exportJSON: string;

    // Budget progress
    budgetProgress: string;
    budgetExceeded: string;
    budgetWarning: string;
    budgetRemaining: string;
    noBudgetsSet: string;
    budgetLimit: string;
    budgetLimitDesc: string;

    // Recurring transactions
    recurringTransactions: string;
    noRecurringTransactions: string;
    addRecurring: string;
    editRecurring: string;
    dayOfMonth: string;
    recurringName: string;

    // Settings
    settingsTitle: string;
    general: string;
    budgetFolder: string;
    budgetFolderDesc: string;
    defaultCurrency: string;
    defaultCurrencyDesc: string;
    availableCurrencies: string;
    availableCurrenciesDesc: string;
    showBalanceInStatusBar: string;
    showBalanceInStatusBarDesc: string;
    language: string;
    languageDesc: string;
    expenseCategories: string;
    incomeCategories: string;
    addExpenseCategory: string;
    addIncomeCategory: string;
    reset: string;
    restoreDefaultCategories: string;
    restoreDefaultCategoriesDesc: string;
    restoreDefaults: string;
    restoredDefaultCategories: string;
    addedNewCategory: string;
    deletedCategory: string;
    categoryName: string;
    categoryId: string;

    // Confirmation
    confirmTitle: string;
    confirmDeleteTransaction: string;
    deleteTransaction: string;

    // Notices
    noticeTransactionAdded: string;

    // Month file
    budgetMonthTitle: string;
    summary: string;
    transactions: string;
    noTransactionsInMonth: string;
    type: string;

    // Month names
    months: string[];

    // Default categories
    defaultCategories: {
        food: string;
        transport: string;
        entertainment: string;
        shopping: string;
        bills: string;
        health: string;
        education: string;
        otherExpense: string;
        salary: string;
        freelance: string;
        investment: string;
        gift: string;
        otherIncome: string;
        newExpense: string;
        newIncome: string;
    };

    // Analytics
    analytics: string;
    yearlyOverview: string;
    savingsRate: string;
    spendingAverages: string;
    dailyAverage: string;
    weeklyAverage: string;
    monthlyAverage: string;
    topSpendingCategories: string;
    categoryTrends: string;
    noExpenseData: string;
    perMonth: string;
}

export const translations: Record<Locale, Translations> = {
    en: {
        // General
        pluginName: 'Budget Tracker',
        settings: 'Settings',
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        refresh: 'Refresh',

        // Transaction types
        income: 'Income',
        expense: 'Expense',

        // Transaction modal
        addTransaction: 'Add Transaction',
        editTransaction: '✏️ Edit Transaction',
        newTransaction: '➕ New Transaction',
        transactionType: 'Type',
        transactionTypeDesc: 'Income or expense?',
        date: 'Date',
        dateDesc: 'Transaction date',
        amount: 'Amount',
        amountDesc: 'Transaction value',
        category: 'Category',
        categoryDesc: 'Select category',
        description: 'Description',
        descriptionDesc: 'Optional transaction description',
        descriptionPlaceholder: 'e.g. Grocery shopping',
        saveChanges: 'Save Changes',

        // Dashboard
        budgetDashboard: '💰 Budget Dashboard',
        addExpense: '➕ Add Expense',
        addIncome: '💵 Add Income',
        incomes: '💚 Income',
        expenses: '🔴 Expenses',
        balance: '📊 Balance',
        categoryBreakdown: '📂 Expenses by Category',
        trendLastMonths: '📈 Trend (last 6 months)',
        recentTransactions: '📝 Recent Transactions',
        noExpensesThisMonth: 'No expenses this month.',
        noDataToDisplay: 'No data to display.',
        noTransactionsYet: 'No transactions yet. Add your first one!',

        // Filters
        search: 'Search',
        searchPlaceholder: 'Search descriptions...',
        all: 'All',
        allCategories: 'All categories',
        dateFrom: 'From',
        dateTo: 'To',
        clearFilters: 'Clear',
        showFilters: 'Show Filters',
        hideFilters: 'Hide Filters',
        exportCSV: 'Export CSV',
        exportJSON: 'Export JSON',

        // Budget progress
        budgetProgress: '🎯 Monthly Budgets',
        budgetExceeded: 'Budget exceeded!',
        budgetWarning: 'Approaching limit',
        budgetRemaining: 'Remaining',
        noBudgetsSet: 'No budget limits set. Configure them in category settings.',
        budgetLimit: 'Monthly limit',
        budgetLimitDesc: 'Set a monthly spending limit (0 = no limit)',

        // Recurring transactions
        recurringTransactions: '🔄 Recurring Transactions',
        noRecurringTransactions: 'No recurring transactions. Add one below.',
        addRecurring: 'Add Recurring Transaction',
        editRecurring: 'Edit Recurring Transaction',
        dayOfMonth: 'Day of month',
        recurringName: 'Name',

        // Settings
        settingsTitle: '💰 Budget Tracker - Settings',
        general: '⚙️ General',
        budgetFolder: 'Budget folder',
        budgetFolderDesc: 'Folder where transaction files will be saved',
        defaultCurrency: 'Default currency',
        defaultCurrencyDesc: 'Currency used by default for new transactions',
        availableCurrencies: 'Available currencies',
        availableCurrenciesDesc: 'Comma-separated list of currencies (e.g. USD,EUR,GBP)',
        showBalanceInStatusBar: 'Show balance in status bar',
        showBalanceInStatusBarDesc: 'Display current month balance in the bottom bar',
        language: 'Language',
        languageDesc: 'Plugin interface language',
        expenseCategories: '📂 Expense Categories',
        incomeCategories: '📂 Income Categories',
        addExpenseCategory: '➕ Add expense category',
        addIncomeCategory: '➕ Add income category',
        reset: '🔄 Reset',
        restoreDefaultCategories: 'Restore default categories',
        restoreDefaultCategoriesDesc: 'Warning: This will remove all custom categories!',
        restoreDefaults: 'Restore Defaults',
        restoredDefaultCategories: 'Default categories restored',
        addedNewCategory: 'New category added - edit it above',
        deletedCategory: 'Deleted category:',
        categoryName: 'Name',
        categoryId: 'ID:',

        // Confirmation
        confirmTitle: '⚠️ Confirm',
        confirmDeleteTransaction: 'Are you sure you want to delete this transaction?',
        deleteTransaction: 'Delete Transaction',

        // Notices
        noticeTransactionAdded: '✅ Added',

        // Month file
        budgetMonthTitle: '📊 Budget:',
        summary: '📈 Summary',
        transactions: '📝 Transactions',
        noTransactionsInMonth: 'No transactions this month. Use the "Add Transaction" command to add your first one!',
        type: 'Type',

        // Month names
        months: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'],

        // Default categories
        defaultCategories: {
            food: 'Food',
            transport: 'Transport',
            entertainment: 'Entertainment',
            shopping: 'Shopping',
            bills: 'Bills',
            health: 'Health',
            education: 'Education',
            otherExpense: 'Other expenses',
            salary: 'Salary',
            freelance: 'Freelance',
            investment: 'Investments',
            gift: 'Gift',
            otherIncome: 'Other income',
            newExpense: 'New expense',
            newIncome: 'New income',
        },

        // Analytics
        analytics: '📈 Analytics',
        yearlyOverview: '📅 Yearly Overview',
        savingsRate: '💰 Savings Rate',
        spendingAverages: '📊 Spending Averages',
        dailyAverage: 'Daily Average',
        weeklyAverage: 'Weekly Average',
        monthlyAverage: 'Monthly Average',
        topSpendingCategories: '🏆 Top Spending Categories',
        categoryTrends: '📂 Category Trends',
        noExpenseData: 'No expense data to display',
        perMonth: '/mo',
    },

    pl: {
        // General
        pluginName: 'Budget Tracker',
        settings: 'Ustawienia',
        save: 'Zapisz',
        cancel: 'Anuluj',
        confirm: 'Potwierdź',
        delete: 'Usuń',
        edit: 'Edytuj',
        add: 'Dodaj',
        refresh: 'Odśwież',

        // Transaction types
        income: 'Przychód',
        expense: 'Wydatek',

        // Transaction modal
        addTransaction: 'Dodaj transakcję',
        editTransaction: '✏️ Edytuj transakcję',
        newTransaction: '➕ Nowa transakcja',
        transactionType: 'Typ',
        transactionTypeDesc: 'Przychód czy wydatek?',
        date: 'Data',
        dateDesc: 'Data transakcji',
        amount: 'Kwota',
        amountDesc: 'Wartość transakcji',
        category: 'Kategoria',
        categoryDesc: 'Wybierz kategorię',
        description: 'Opis',
        descriptionDesc: 'Opcjonalny opis transakcji',
        descriptionPlaceholder: 'np. Zakupy w Biedronce',
        saveChanges: 'Zapisz zmiany',

        // Dashboard
        budgetDashboard: '💰 Dashboard Budżetu',
        addExpense: '➕ Dodaj wydatek',
        addIncome: '💵 Dodaj przychód',
        incomes: '💚 Przychody',
        expenses: '🔴 Wydatki',
        balance: '📊 Bilans',
        categoryBreakdown: '📂 Wydatki wg kategorii',
        trendLastMonths: '📈 Trend (ostatnie 6 miesięcy)',
        recentTransactions: '📝 Ostatnie transakcje',
        noExpensesThisMonth: 'Brak wydatków w tym miesiącu.',
        noDataToDisplay: 'Brak danych do wyświetlenia.',
        noTransactionsYet: 'Brak transakcji. Dodaj pierwszą!',

        // Filters
        search: 'Szukaj',
        searchPlaceholder: 'Szukaj w opisach...',
        all: 'Wszystkie',
        allCategories: 'Wszystkie kategorie',
        dateFrom: 'Od',
        dateTo: 'Do',
        clearFilters: 'Wyczyść',
        showFilters: 'Pokaż filtry',
        hideFilters: 'Ukryj filtry',
        exportCSV: 'Eksport CSV',
        exportJSON: 'Eksport JSON',

        // Budget progress
        budgetProgress: '🎯 Budżety miesięczne',
        budgetExceeded: 'Budżet przekroczony!',
        budgetWarning: 'Zbliżasz się do limitu',
        budgetRemaining: 'Pozostało',
        noBudgetsSet: 'Brak ustawionych limitów. Skonfiguruj je w ustawieniach kategorii.',
        budgetLimit: 'Limit miesięczny',
        budgetLimitDesc: 'Ustaw miesięczny limit wydatków (0 = brak limitu)',

        // Recurring transactions
        recurringTransactions: '🔄 Transakcje cykliczne',
        noRecurringTransactions: 'Brak transakcji cyklicznych. Dodaj jedną poniżej.',
        addRecurring: 'Dodaj transakcję cykliczną',
        editRecurring: 'Edytuj transakcję cykliczną',
        dayOfMonth: 'Dzień miesiąca',
        recurringName: 'Nazwa',

        // Settings
        settingsTitle: '💰 Budget Tracker - Ustawienia',
        general: '⚙️ Ogólne',
        budgetFolder: 'Folder budżetu',
        budgetFolderDesc: 'Folder gdzie będą zapisywane pliki z transakcjami',
        defaultCurrency: 'Domyślna waluta',
        defaultCurrencyDesc: 'Waluta używana domyślnie dla nowych transakcji',
        availableCurrencies: 'Dostępne waluty',
        availableCurrenciesDesc: 'Lista walut oddzielonych przecinkami (np. PLN,EUR,USD)',
        showBalanceInStatusBar: 'Pokaż bilans w pasku statusu',
        showBalanceInStatusBarDesc: 'Wyświetlaj bieżący bilans miesiąca w dolnym pasku',
        language: 'Język',
        languageDesc: 'Język interfejsu wtyczki',
        expenseCategories: '📂 Kategorie wydatków',
        incomeCategories: '📂 Kategorie przychodów',
        addExpenseCategory: '➕ Dodaj kategorię wydatków',
        addIncomeCategory: '➕ Dodaj kategorię przychodów',
        reset: '🔄 Reset',
        restoreDefaultCategories: 'Przywróć domyślne kategorie',
        restoreDefaultCategoriesDesc: 'Uwaga: To usunie wszystkie niestandardowe kategorie!',
        restoreDefaults: 'Przywróć domyślne',
        restoredDefaultCategories: 'Przywrócono domyślne kategorie',
        addedNewCategory: 'Dodano nową kategorię - edytuj ją powyżej',
        deletedCategory: 'Usunięto kategorię:',
        categoryName: 'Nazwa',
        categoryId: 'ID:',

        // Confirmation
        confirmTitle: '⚠️ Potwierdź',
        confirmDeleteTransaction: 'Czy na pewno chcesz usunąć tę transakcję?',
        deleteTransaction: 'Usuń transakcję',

        // Notices
        noticeTransactionAdded: '✅ Dodano',

        // Month file
        budgetMonthTitle: '📊 Budżet:',
        summary: '📈 Podsumowanie',
        transactions: '📝 Transakcje',
        noTransactionsInMonth: 'Brak transakcji w tym miesiącu. Użyj komendy "Dodaj transakcję" aby dodać pierwszą!',
        type: 'Typ',

        // Month names
        months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
            'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],

        // Default categories
        defaultCategories: {
            food: 'Jedzenie',
            transport: 'Transport',
            entertainment: 'Rozrywka',
            shopping: 'Zakupy',
            bills: 'Rachunki',
            health: 'Zdrowie',
            education: 'Edukacja',
            otherExpense: 'Inne wydatki',
            salary: 'Wynagrodzenie',
            freelance: 'Freelance',
            investment: 'Inwestycje',
            gift: 'Prezent',
            otherIncome: 'Inne przychody',
            newExpense: 'Nowy wydatek',
            newIncome: 'Nowy przychód',
        },

        // Analytics
        analytics: '📈 Analityka',
        yearlyOverview: '📅 Widok roczny',
        savingsRate: '💰 Stopa oszczędności',
        spendingAverages: '📊 Średnie wydatki',
        dailyAverage: 'Średnia dzienna',
        weeklyAverage: 'Średnia tygodniowa',
        monthlyAverage: 'Średnia miesięczna',
        topSpendingCategories: '🏆 Top kategorii wydatków',
        categoryTrends: '📂 Trendy kategorii',
        noExpenseData: 'Brak danych o wydatkach.',
        perMonth: '/mies.',
    },
};

// Get translations for a locale
export function t(locale: Locale): Translations {
    return translations[locale];
}

// Detect system locale (defaults to English)
export function detectLocale(): Locale {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith('pl')) return 'pl';
    return 'en';
}
