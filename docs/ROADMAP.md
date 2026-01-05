# 🗺️ Roadmap

## ✅ Completed (v1.0)

### Core Features
- [x] Dashboard with monthly overview
- [x] Transaction management (add, edit, delete)
- [x] Category breakdown with pie chart
- [x] 6-month trend chart
- [x] Budget limits per category with warnings
- [x] Recurring transactions with auto-add
- [x] Search & filtering
- [x] CSV/JSON export
- [x] i18n (English, Polish)

### Recent Additions
- [x] Recurring transactions backfilling (missed months)
- [x] Markdown import sync (restore from backup)
- [x] Dashboard empty state fix
- [x] Config sync via markdown file (WebDAV/Syncthing compatible)

---

## 🚧 In Progress

_Nothing currently in progress_

---

## 📋 Planned

### v1.1 - UX Improvements
- [ ] Remove debug logging from sync
- [ ] Mobile optimization testing
- [ ] Keyboard shortcuts for quick add
- [ ] Transaction inline editing

### v1.2 - Analytics
- [ ] Yearly overview view
- [ ] Average spending statistics (daily/weekly/monthly)
- [ ] Category comparison charts
- [ ] Spending trends analysis

### v1.3 - Advanced Features
- [ ] Savings goals with progress tracking
- [ ] Transaction tags (in addition to categories)
- [ ] Subcategories support
- [ ] Recurring transaction notifications

---

## 💡 Ideas (Not Scheduled)

### Pro Features (potential paid tier)
- Multi-currency support with exchange rates
- Bank API integration
- Advanced PDF reports
- Data encryption
- Cloud sync between vaults

### Community Requests
_Add feature requests here_

---

## 📝 Notes

- Plugin is designed for desktop and mobile
- Uses Svelte for reactive UI
- Data stored in `data.json` + markdown files for readability
