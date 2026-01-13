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
- [x] Keyboard shortcuts (Ctrl+Shift+E/I/B)
- [x] Transaction inline editing
- [x] Yearly overview view
- [x] Average spending statistics
- [x] Category comparison charts
- [x] Spending trends analysis
- [x] **Investment tracking** - dedicated tab for tracking investments (stocks, crypto, real estate, funds)
- [x] **Large expense exclusion** - option to exclude large one-time expenses from monthly statistics

---

## 🚧 In Progress

_Nothing currently in progress_

---

## 📋 Planned

### v1.1 - UX Improvements
- [ ] Remove debug logging from sync
- [ ] Mobile optimization testing

### v1.3 - Nice to Have
- [ ] Tag filtering in transaction list
- [ ] Category hierarchy in breakdown charts

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
