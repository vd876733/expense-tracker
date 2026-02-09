// Advanced Expense Tracker Application with Date Range Filter
class AdvancedExpenseTracker {
    constructor() {
        // Application state
        this.expenses = [];
        this.budget = 500;
        this.theme = 'light';
        this.currentPeriod = 'week';
        this.dateFilter = null;       // For date range filtering
        this.searchTerm = '';
        this.sortBy = 'date-desc';   // sorting options: date-desc, date-asc, amount-desc, amount-asc, category
        this.currentPage = 1;
        this.itemsPerPage = 10;

        // Charts
        this.trendChart = null;
        this.categoryChart = null;

        // Initialize application
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.applyTheme();
        this.setDefaultDate();
        this.loadMockData();
        this.updateAllDisplays();
        this.renderCharts();
        this.renderExpenseList();
    }

    loadMockData() {
        if (this.expenses.length === 0) {
            const mockExpenses = [
                {
                    id: '1',
                    amount: 25.50,
                    category: 'Food & Dining',
                    description: 'Lunch at downtown restaurant',
                    date: '2025-02-05'
                },
                {
                    id: '2',
                    amount: 45.00,
                    category: 'Transportation',
                    description: 'Gas station fill-up',
                    date: '2025-02-04'
                },
                {
                    id: '3',
                    amount: 120.00,
                    category: 'Shopping',
                    description: 'Weekly groceries',
                    date: '2025-02-03'
                },
                {
                    id: '4',
                    amount: 15.00,
                    category: 'Entertainment',
                    description: 'Movie tickets',
                    date: '2025-02-02'
                },
                {
                    id: '5',
                    amount: 80.00,
                    category: 'Bills & Utilities',
                    description: 'Internet bill',
                    date: '2025-02-01'
                },
                {
                    id: '6',
                    amount: 32.75,
                    category: 'Food & Dining',
                    description: 'Coffee and pastries',
                    date: '2025-01-30'
                },
                {
                    id: '7',
                    amount: 67.20,
                    category: 'Healthcare',
                    description: 'Pharmacy prescription',
                    date: '2025-01-28'
                },
                {
                    id: '8',
                    amount: 150.00,
                    category: 'Shopping',
                    description: 'Clothing purchase',
                    date: '2025-01-25'
                },
                {
                    id: '9',
                    amount: 89.99,
                    category: 'Entertainment',
                    description: 'Concert tickets',
                    date: '2025-01-20'
                },
                {
                    id: '10',
                    amount: 200.00,
                    category: 'Travel',
                    description: 'Weekend getaway',
                    date: '2025-01-15'
                }
            ];

            this.expenses = mockExpenses;
            this.saveToStorage();
        }
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        const expenseDateInput = document.getElementById('expense-date');
        if (expenseDateInput) {
            expenseDateInput.value = today;
        }
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('expense-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addExpense();
            });
        }

        // Theme toggle
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Budget editing
        const editBudgetBtn = document.getElementById('edit-budget-btn');
        if (editBudgetBtn) {
            editBudgetBtn.addEventListener('click', () => {
                this.startBudgetEdit();
            });
        }

        const saveBudgetBtn = document.getElementById('save-budget-btn');
        if (saveBudgetBtn) {
            saveBudgetBtn.addEventListener('click', () => {
                this.saveBudget();
            });
        }

        const cancelBudgetBtn = document.getElementById('cancel-budget-btn');
        if (cancelBudgetBtn) {
            cancelBudgetBtn.addEventListener('click', () => {
                this.cancelBudgetEdit();
            });
        }

        // Time period selection buttons
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changePeriod(e.target.dataset.period);
            });
        });

        // Date range filter buttons
        const applyFilterBtn = document.getElementById('apply-filter');
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => this.applyDateFilter());
        }
        const clearFilterBtn = document.getElementById('clear-filter');
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', () => this.clearDateFilter());
        }

        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.trim();
                this.currentPage = 1;
                this.renderExpenseList();
            });
        }

        // Sort select
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.currentPage = 1;
                this.renderExpenseList();
            });
        }

        // Footer actions
        const exportCsvBtn = document.getElementById('export-csv');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => this.exportToCSV());
        }
        const exportJsonBtn = document.getElementById('export-json');
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', () => this.exportToJSON());
        }
        const importDataBtn = document.getElementById('import-data');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => {
                const fileInput = document.getElementById('file-import');
                if(fileInput) fileInput.click();
            });
        }
        const fileImportInput = document.getElementById('file-import');
        if (fileImportInput) {
            fileImportInput.addEventListener('change', (e) => this.importData(e.target.files[0]));
        }
        const resetDataBtn = document.getElementById('reset-data');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => {
                this.showConfirmModal(
                    'Reset All Data',
                    'Are you sure you want to reset all expenses and settings? This action cannot be undone.',
                    () => this.resetAllData()
                );
            });
        }

        // Modal buttons
        const modalCancel = document.getElementById('modal-cancel');
        if (modalCancel) {
            modalCancel.addEventListener('click', () => this.hideModal());
        }
        const modalConfirm = document.getElementById('modal-confirm');
        if (modalConfirm) {
            modalConfirm.addEventListener('click', () => {
                if (this.confirmCallback) this.confirmCallback();
                this.hideModal();
            });
        }
        // Click outside modal to close
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) this.hideModal();
            });
        }

        // Keyboard shortcuts (Ctrl/Cmd + e,n,f,d)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'e':
                        e.preventDefault();
                        this.exportToCSV();
                        break;
                    case 'n':
                        e.preventDefault();
                        const expenseDateField = document.getElementById('expense-date');
                        if (expenseDateField) expenseDateField.focus();
                        break;
                    case 'f':
                        e.preventDefault();
                        const searchField = document.getElementById('search-input');
                        if (searchField) searchField.focus();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                }
            }
        });
    }

    addExpense() {
        const dateInput = document.getElementById('expense-date');
        const amountInput = document.getElementById('amount');
        const categoryInput = document.getElementById('category');
        const descriptionInput = document.getElementById('description');
        const modeInput = document.getElementById('mode');
        if (!dateInput || !amountInput || !categoryInput || !descriptionInput || !modeInput) return;

        const date = dateInput.value;
        const amount = parseFloat(amountInput.value);
        const category = categoryInput.value;
        const description = descriptionInput.value.trim();
        const mode = modeInput.value;

        // Validation
        if (!date) {
            this.showToast('Please select a date', 'error');
            return;
        }
        if (!amount || amount <= 0) {
            this.showToast('Please enter a valid amount', 'error');
            return;
        }
        if (!category) {
            this.showToast('Please select a category', 'error');
            return;
        }
        if (!description) {
            this.showToast('Please enter a description', 'error');
            return;
        }
        if (!mode) {
            this.showToast('Please select a mode of payment', 'error');
            return;
        }

        const expense = {
            id: Date.now().toString(),
            amount: Math.round(amount * 100) / 100,
            category,
            description,
            date,
            mode
        };

        this.expenses.push(expense);
        this.saveToStorage();
        this.updateAllDisplays();
        this.renderCharts();
        this.renderExpenseList();
        this.clearForm();

        this.showToast(`Expense of ₹${expense.amount.toFixed(2)} added successfully!`, 'success');
        this.checkBudgetWarning();
    }

    deleteExpense(id) {
        const expense = this.expenses.find(exp => exp.id === id);
        if (!expense) return;

        this.showConfirmModal(
            'Delete Expense',
            `Are you sure you want to delete "${expense.description}" (₹${expense.amount.toFixed(2)})?`,
            () => {
                this.expenses = this.expenses.filter(exp => exp.id !== id);
                this.saveToStorage();
                this.updateAllDisplays();
                this.renderCharts();
                this.renderExpenseList();
                this.showToast('Expense deleted successfully!', 'success');
            }
        );
    }

    // Budget management
    startBudgetEdit() {
        const budgetDisplay = document.getElementById('budget-display');
        const budgetEdit = document.getElementById('budget-edit');
        const budgetInput = document.getElementById('budget-input');
        if (!budgetDisplay || !budgetEdit || !budgetInput) return;

        budgetDisplay.classList.add('hidden');
        budgetEdit.classList.remove('hidden');
        budgetInput.value = this.budget.toFixed(2);
        budgetInput.focus();
        budgetInput.select();
    }

    saveBudget() {
        const budgetInput = document.getElementById('budget-input');
        if (!budgetInput) return;
        
        const newBudget = parseFloat(budgetInput.value);
        if (isNaN(newBudget) || newBudget < 0) {
            this.showToast('Please enter a valid budget amount', 'error');
            return;
        }

        const oldBudget = this.budget;
        this.budget = Math.round(newBudget * 100) / 100;
        this.saveToStorage();
        this.updateAllDisplays();
        this.cancelBudgetEdit();

        this.showToast(`Budget updated from ₹${oldBudget.toFixed(2)} to ₹${this.budget.toFixed(2)}`, 'success');
        this.checkBudgetWarning();
    }

    cancelBudgetEdit() {
        const budgetDisplay = document.getElementById('budget-display');
        const budgetEdit = document.getElementById('budget-edit');
        if (!budgetDisplay || !budgetEdit) return;

        budgetEdit.classList.add('hidden');
        budgetDisplay.classList.remove('hidden');
    }

    // Change current time period for charts
    changePeriod(period) {
        if (!['week', 'month', 'year'].includes(period)) return;
        this.currentPeriod = period;

        // Update active buttons
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.classList.remove('active');
        });
        const btn = document.querySelector(`[data-period="${period}"]`);
        if (btn) btn.classList.add('active');

        this.renderCharts();
        this.updateChartInfo();
    }

    // Date range filtering
    applyDateFilter() {
        const startDate = document.getElementById('start-date')?.value;
        const endDate = document.getElementById('end-date')?.value;

        if (!startDate || !endDate) {
            this.showToast('Please select both start and end dates', 'warning');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            this.showToast('Start date cannot be after end date', 'error');
            return;
        }

        this.dateFilter = { startDate, endDate };
        this.renderCharts();
        this.renderExpenseList();
        this.updateFilterSummary();
        this.showToast(`Filter applied: ${startDate} to ${endDate}`, 'info');
    }

    clearDateFilter() {
        this.dateFilter = null;
        const startElem = document.getElementById('start-date');
        if (startElem) startElem.value = '';
        const endElem = document.getElementById('end-date');
        if (endElem) endElem.value = '';

        this.renderCharts();
        this.renderExpenseList();
        this.updateFilterSummary();
        this.showToast('Date filter cleared', 'info');
    }

    updateFilterSummary() {
        const summary = document.getElementById('filter-summary');
        if (!summary) return;

        if (this.dateFilter) {
            const filtered = this.getFilteredExpenses();
            const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
            summary.innerHTML = `
                Showing expenses from ${this.formatDate(this.dateFilter.startDate)} to ${this.formatDate(this.dateFilter.endDate)}<br>
                <strong>${filtered.length} expenses • Total: ₹${total.toFixed(2)}</strong>
            `;
        } else {
            summary.innerHTML = '';
        }
    }

    // Get expenses filtered by date range (if applied)
    getFilteredExpenses() {
        let filtered = [...this.expenses];

        if (this.dateFilter) {
            const start = new Date(this.dateFilter.startDate);
            const end = new Date(this.dateFilter.endDate);

            filtered = filtered.filter(expense => {
                const expDate = new Date(expense.date);
                return expDate >= start && expDate <= end;
            });
        }

        return filtered;
    }

    getPeriodData() {
        const filtered = this.getFilteredExpenses();
        const now = new Date();
        const data = {};

        switch (this.currentPeriod) {
            case 'week':
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    const key = date.toISOString().split('T')[0];
                    data[key] = 0;
                }
                break;
            case 'month':
                for (let i = 29; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    const key = date.toISOString().split('T')[0];
                    data[key] = 0;
                }
                break;
            case 'year':
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(now);
                    date.setMonth(date.getMonth() - i);
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    data[key] = 0;
                }
                break;
        }

        filtered.forEach(expense => {
            const expDate = new Date(expense.date);
            let key;
            if (this.currentPeriod === 'year') {
                key = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`;
            } else {
                key = expense.date;
            }
            if (data.hasOwnProperty(key)) {
                data[key] += expense.amount;
            }
        });

        return data;
    }

    getCategoryData() {
        const filtered = this.getFilteredExpenses();
        const categoryTotals = {};

        filtered.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });

        return categoryTotals;
    }

    // Render charts
    renderCharts() {
        this.renderTrendChart();
        this.renderCategoryChart();
    }

    renderTrendChart() {
        const ctx = document.getElementById('trend-chart')?.getContext('2d');
        const noDataMessage = document.getElementById('no-trend-data');
        if (!ctx || !noDataMessage) return;

        const periodData = this.getPeriodData();
        const labels = Object.keys(periodData);
        const data = Object.values(periodData);

        if (data.every(value => value === 0)) {
            noDataMessage.style.display = 'flex';
            ctx.canvas.style.display = 'none';
            return;
        }

        noDataMessage.style.display = 'none';
        ctx.canvas.style.display = 'block';

        if (this.trendChart) this.trendChart.destroy();

        const formattedLabels = labels.map(label => {
            if (this.currentPeriod === 'year') {
                const [year, month] = label.split('-');
                return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            } else {
                return new Date(label).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            }
        });

        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: formattedLabels,
                datasets: [{
                    label: 'Daily Spending',
                    data,
                    borderColor: this.theme === 'dark' ? '#60a5fa' : '#3b82f6',
                    backgroundColor: this.theme === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.theme === 'dark' ? '#60a5fa' : '#3b82f6',
                    pointBorderColor: this.theme === 'dark' ? '#1e293b' : '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: this.theme === 'dark' ? '#1e293b' : '#ffffff',
                        titleColor: this.theme === 'dark' ? '#f8fafc' : '#020817',
                        bodyColor: this.theme === 'dark' ? '#f8fafc' : '#020817',
                        borderColor: this.theme === 'dark' ? '#334155' : '#e2e8f0',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => `Spent: ₹${context.parsed.y.toFixed(2)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: this.theme === 'dark' ? '#334155' : '#e2e8f0',
                            drawBorder: false
                        },
                        ticks: {
                            color: this.theme === 'dark' ? '#94a3b8' : '#64748b'
                        }
                    },
                    y: {
                        grid: {
                            color: this.theme === 'dark' ? '#334155' : '#e2e8f0',
                            drawBorder: false
                        },
                        ticks: {
                            color: this.theme === 'dark' ? '#94a3b8' : '#64748b',
                            callback: (value) => `₹${value.toFixed(0)}`
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        this.updateChartInfo();
    }

    renderCategoryChart() {
        const ctx = document.getElementById('category-chart')?.getContext('2d');
        const noDataMessage = document.getElementById('no-category-data');
        if (!ctx || !noDataMessage) return;

        const categoryData = this.getCategoryData();
        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);

        if (labels.length === 0) {
            noDataMessage.style.display = 'flex';
            ctx.canvas.style.display = 'none';
            return;
        }

        noDataMessage.style.display = 'none';
        ctx.canvas.style.display = 'block';

        if (this.categoryChart) this.categoryChart.destroy();

        const colors = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
        ];

        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 3,
                    borderColor: this.theme === 'dark' ? '#1e293b' : '#ffffff',
                    hoverBorderWidth: 4,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: this.theme === 'dark' ? '#f8fafc' : '#020817',
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 13 }
                        }
                    },
                    tooltip: {
                        backgroundColor: this.theme === 'dark' ? '#1e293b' : '#ffffff',
                        titleColor: this.theme === 'dark' ? '#f8fafc' : '#020817',
                        bodyColor: this.theme === 'dark' ? '#f8fafc' : '#020817',
                        borderColor: this.theme === 'dark' ? '#334155' : '#e2e8f0',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }

    updateChartInfo() {
        const periodData = this.getPeriodData();
        const total = Object.values(periodData).reduce((a, b) => a + b, 0);

        let periodText = '';
        switch (this.currentPeriod) {
            case 'week': periodText = 'Last 7 days'; break;
            case 'month': periodText = 'Last 30 days'; break;
            case 'year': periodText = 'Last 12 months'; break;
        }

        const periodElement = document.getElementById('chart-period');
        if (periodElement) periodElement.textContent = periodText;

        const totalElement = document.getElementById('chart-total');
        if (totalElement) totalElement.textContent = `Total: ₹${total.toFixed(2)}`;
    }

    // Display updates
    updateAllDisplays() {
        this.updateBudgetSummary();
        this.updateMonthlyStats();
        this.updateDataInfo();
        this.updateFilterSummary();
    }

    updateBudgetSummary() {
        const totalSpent = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = this.budget - totalSpent;
        const percentage = this.budget > 0 ? (totalSpent / this.budget) * 100 : 0;

        const totalSpentElem = document.getElementById('total-spent');
        if (totalSpentElem) totalSpentElem.textContent = `₹${totalSpent.toFixed(2)}`;

        const budgetPercentageElem = document.getElementById('budget-percentage');
        if (budgetPercentageElem) budgetPercentageElem.textContent = `${percentage.toFixed(1)}% of budget used`;

        const remainingElem = document.getElementById('remaining-budget');
        if (remainingElem) {
            remainingElem.textContent = `₹${remaining.toFixed(2)}`;
            remainingElem.style.color = remaining < 0 ? 'var(--destructive)' : 'var(--primary)';
        }

        const budgetValueElem = document.getElementById('budget-value');
        if (budgetValueElem) budgetValueElem.textContent = `₹${this.budget.toFixed(2)}`;
    }

    updateMonthlyStats() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyExpenses = this.expenses.filter(exp => {
            const date = new Date(exp.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        const monthSpentElem = document.getElementById('month-spent');
        const monthCountElem = document.getElementById('month-count');
        if (monthSpentElem) monthSpentElem.textContent = `₹${monthlyTotal.toFixed(2)}`;
        if (monthCountElem) monthCountElem.textContent = `${monthlyExpenses.length} expenses`;
    }

    updateDataInfo() {
        const dataInfoElem = document.getElementById('data-info');
        if (dataInfoElem) dataInfoElem.textContent = `${this.expenses.length} expenses tracked`;
    }

    checkBudgetWarning() {
        const totalSpent = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = this.budget - totalSpent;
        const percentageUsed = this.budget > 0 ? (totalSpent / this.budget) * 100 : 0;

        if (remaining < 0) {
            this.showToast(`⚠️ Budget exceeded by ₹${Math.abs(remaining).toFixed(2)}!`, 'error');
        } else if (percentageUsed >= 90) {
            this.showToast(`⚠️ 90% of budget used. ₹${remaining.toFixed(2)} remaining.`, 'warning');
        } else if (percentageUsed >= 75) {
            this.showToast(`📊 75% of budget used. ₹${remaining.toFixed(2)} remaining.`, 'info');
        }
    }

    // Render expenses list with sorting, filtering, pagination
    renderExpenseList() {
        const container = document.getElementById('expense-list');
        if (!container) return;

        let filtered = this.getFilteredExpenses();

        // Apply search filter
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(exp =>
                exp.description.toLowerCase().includes(term) ||
                exp.category.toLowerCase().includes(term)
            );
        }

        // Apply sorting
        filtered = this.sortExpenses(filtered);

        // Pagination calculations
        const totalPages = Math.ceil(filtered.length / this.itemsPerPage);
        if (this.currentPage > totalPages) this.currentPage = totalPages > 0 ? totalPages : 1;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedExpenses = filtered.slice(startIndex, startIndex + this.itemsPerPage);

        if (paginatedExpenses.length === 0) {
            const message = this.searchTerm
                ? 'No expenses match your search criteria'
                : 'No expenses recorded yet. Add your first expense above!';
            container.innerHTML = `<div class="no-data">${message}</div>`;
            this.renderPagination(0, 0);
            return;
        }

        container.innerHTML = paginatedExpenses.map(expense => `
            <div class="expense-item fade-in">
                <div class="expense-details">
                    <div class="expense-title">${this.escapeHtml(expense.description)}</div>
                    <div class="expense-meta">
                        <span class="badge">${expense.category}</span>
                        <span class="expense-date">${this.formatDate(expense.date)}</span>
                    </div>
                </div>
                <div class="expense-actions">
                    <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                    <div class="expense-buttons">
                        <button class="btn btn-outline btn-sm"
                            onclick="expenseTracker.editExpense('${expense.id}')"
                            title="Edit expense">✏️</button>
                        <button class="btn btn-danger btn-sm"
                            onclick="expenseTracker.deleteExpense('${expense.id}')"
                            title="Delete expense">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');

        this.renderPagination(totalPages, filtered.length);
    }

    

    sortExpenses(expenses) {
        return [...expenses].sort((a, b) => {
            switch (this.sortBy) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'amount-desc':
                    return b.amount - a.amount;
                case 'amount-asc':
                    return a.amount - b.amount;
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });
    }

    renderPagination(totalPages, totalItems) {
        const container = document.getElementById('pagination');
        if (!container) return;

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Prev button
        if (this.currentPage > 1) {
            paginationHTML += `<button class="btn btn-outline btn-sm" onclick="expenseTracker.changePage(${this.currentPage - 1})">« Prev</button>`;
        }

        // Pages
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="btn btn-primary btn-sm">${i}</button>`;
            } else {
                paginationHTML += `<button class="btn btn-outline btn-sm" onclick="expenseTracker.changePage(${i})">${i}</button>`;
            }
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="btn btn-outline btn-sm" onclick="expenseTracker.changePage(${this.currentPage + 1})">Next »</button>`;
        }

        container.innerHTML = paginationHTML;
    }

    changePage(page) {
        this.currentPage = page;
        this.renderExpenseList();
    }

        editExpense(id) {
                // Find the expense
                const expense = this.expenses.find(exp => exp.id === id);
                if (!expense) return;
                // Find the row in the table
                const tbody = document.getElementById('expense-list-tbody');
                if (!tbody) return;
                const rows = Array.from(tbody.children);
                const rowIdx = rows.findIndex(row => {
                        const editBtn = row.querySelector('.btn-outline[title="Edit expense"]');
                        return editBtn && editBtn.getAttribute('onclick')?.includes(id);
                });
                if (rowIdx === -1) return;
                const row = rows[rowIdx];
                // Replace row with editable inputs
                row.innerHTML = `
                    <td><input type="text" value="${this.escapeHtml(expense.description)}" style="width:98%;padding:0.3em;" /></td>
                    <td><input type="text" value="${this.escapeHtml(expense.category)}" style="width:98%;padding:0.3em;" /></td>
                    <td><input type="date" value="${expense.date}" style="width:98%;padding:0.3em;" /></td>
                    <td><input type="number" step="0.01" value="${expense.amount}" style="width:98%;padding:0.3em;" /></td>
                    <td>
                        <select style="width:98%;padding:0.3em;">
                            <option value="Cash"${expense.mode === 'Cash' ? ' selected' : ''}>Cash</option>
                            <option value="Online"${expense.mode === 'Online' ? ' selected' : ''}>Online</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm" id="save-edit-${id}" title="Save">💾</button>
                        <button class="btn btn-outline btn-sm" id="cancel-edit-${id}" title="Cancel">✖️</button>
                    </td>
                `;
                // Save handler
                document.getElementById(`save-edit-${id}`).onclick = () => {
                        const inputs = row.querySelectorAll('input, select');
                        expense.description = inputs[0].value.trim();
                        expense.category = inputs[1].value.trim();
                        expense.date = inputs[2].value;
                        expense.amount = parseFloat(inputs[3].value);
                        expense.mode = inputs[4].value;
                        this.saveToStorage();
                        this.renderExpenseList();
                        this.showToast('Expense updated!', 'success');
                };
                // Cancel handler
                document.getElementById(`cancel-edit-${id}`).onclick = () => {
                        this.renderExpenseList();
                };
        }

    // Export/Import
    exportToCSV() {
        if (this.expenses.length === 0) {
            this.showToast('No expenses to export', 'warning');
            return;
        }

        const headers = ['Date', 'Category', 'Description', 'Amount', 'Mode of Payment'];
        const csvContent = [
            headers.join(','),
            ...this.expenses.map(expense =>
                [
                    expense.date,
                    `"${expense.category}"`,
                    `"${expense.description.replace(/"/g, '""')}"`,
                    expense.amount.toFixed(2),
                    expense.mode ? `"${expense.mode}"` : ''
                ].join(',')
            )
        ].join('\n');

        this.downloadFile(csvContent, 'text/csv', 'expenses.csv');
        this.showToast(`Exported ${this.expenses.length} expenses to CSV`, 'success');
    }

    exportToJSON() {
        if (this.expenses.length === 0) {
            this.showToast('No expenses to export', 'warning');
            return;
        }

        const data = {
            expenses: this.expenses,
            budget: this.budget,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, 'application/json', 'expense-tracker-data.json');
        this.showToast(`Exported ${this.expenses.length} expenses to JSON`, 'success');
    }

    downloadFile(content, mimeType, filename) {
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let importedData;

                if (file.name.endsWith('.json')) {
                    importedData = JSON.parse(e.target.result);

                    if (importedData.expenses && Array.isArray(importedData.expenses)) {
                        this.expenses = [...this.expenses, ...importedData.expenses];
                        if (importedData.budget) {
                            this.budget = importedData.budget;
                        }
                    }

                } else if (file.name.endsWith('.csv')) {
                    const lines = e.target.result.split('\n');
                    const headers = lines[0].split(',');

                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i].trim()) {
                            const values = lines[i].split(',');
                            const expense = {
                                id: Date.now().toString() + i,
                                date: values[0],
                                category: values[1].replace(/"/g, ''),
                                description: values[2].replace(/"/g, ''),
                                amount: parseFloat(values[3])
                            };

                            if (expense.date && expense.category && expense.description && expense.amount) {
                                this.expenses.push(expense);
                            }
                        }
                    }
                }

                this.saveToStorage();
                this.updateAllDisplays();
                this.renderCharts();
                this.renderExpenseList();
                this.showToast('Data imported successfully!', 'success');

            } catch (error) {
                console.error('Import error:', error);
                this.showToast('Failed to import data. Please check file format.', 'error');
            }
        };

        reader.readAsText(file);
        // Clear file input
        const fileInput = document.getElementById('file-import');
        if (fileInput) fileInput.value = '';
    }

    resetAllData() {
        this.expenses = [];
        this.budget = 500;
        this.dateFilter = null;
        this.searchTerm = '';
        this.currentPage = 1;

        if (document.getElementById('start-date')) document.getElementById('start-date').value = '';
        if (document.getElementById('end-date')) document.getElementById('end-date').value = '';
        if (document.getElementById('search-input')) document.getElementById('search-input').value = '';
        if (document.getElementById('sort-select')) document.getElementById('sort-select').value = 'date-desc';

        this.saveToStorage();
        this.updateAllDisplays();
        this.renderCharts();
        this.renderExpenseList();
        this.showToast('All data has been reset', 'success');
    }

    // Theme management
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.saveToStorage();
        this.applyTheme();
        this.renderCharts();
    }

    applyTheme() {
        document.body.classList.toggle('dark', this.theme === 'dark');

        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Utility
    clearForm() {
        const form = document.getElementById('expense-form');
        if(form) form.reset();
        this.setDefaultDate();
        const expenseDateInput = document.getElementById('expense-date');
        if(expenseDateInput) expenseDateInput.focus();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Persistence: Storage
    saveToStorage() {
        try {
            const data = {
                expenses: this.expenses,
                budget: this.budget,
                theme: this.theme,
                currentPeriod: this.currentPeriod,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('advancedExpenseTracker', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            this.showToast('Failed to save data', 'error');
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('advancedExpenseTracker');
            if (saved) {
                const data = JSON.parse(saved);
                this.expenses = data.expenses || [];
                this.budget = data.budget || 500;
                this.theme = data.theme || 'light';
                this.currentPeriod = data.currentPeriod || 'week';
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            this.showToast('Failed to load saved data', 'error');
        }
    }

    // Modal management
    showConfirmModal(title, message, onConfirm) {
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalOverlay = document.getElementById('modal-overlay');

        if (!modalTitle || !modalMessage || !modalOverlay) return;

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalOverlay.classList.remove('hidden');

        this.confirmCallback = onConfirm;
    }

    hideModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) modalOverlay.classList.add('hidden');
        this.confirmCallback = null;
    }

    // Toast notification system
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Auto remove after 4 seconds
        const timeoutId = setTimeout(() => {
            this.removeToast(toast);
        }, 4000);

        // Remove on click
        toast.addEventListener('click', () => {
            clearTimeout(timeoutId);
            this.removeToast(toast);
        });
    }

    removeToast(toast) {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }
}

// Add slideOut animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.expenseTracker = new AdvancedExpenseTracker();

    // Set initial focus after a brief delay
    setTimeout(() => {
        const expenseDateInput = document.getElementById('expense-date');
        if (expenseDateInput) expenseDateInput.focus();
    }, 100);

    // --- Cash fly emoji cursor logic ---
    let cashFly = document.getElementById('cash-fly-emoji');
    if (!cashFly) {
        cashFly = document.createElement('div');
        cashFly.id = 'cash-fly-emoji';
        cashFly.textContent = '💸';
        cashFly.style.position = 'fixed';
        cashFly.style.pointerEvents = 'none';
        cashFly.style.fontSize = '2rem';
        cashFly.style.zIndex = '9999';
        cashFly.style.transition = 'transform 0.15s cubic-bezier(.4,2,.6,1), opacity 0.2s';
        document.body.appendChild(cashFly);
    }

    let blockCashFly = false;
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('mouseenter', () => { blockCashFly = true; cashFly.style.opacity = '0.2'; });
        expenseForm.addEventListener('mouseleave', () => { blockCashFly = false; cashFly.style.opacity = '1'; });
    }

    document.addEventListener('mousemove', (e) => {
        if (blockCashFly) return;
        cashFly.style.transform = `translate(${e.clientX + 16}px, ${e.clientY - 16}px)`;
        cashFly.style.opacity = '1';
    });
});
    // Expense History Date Filter
    const dateInput = document.getElementById('history-date-filter');
    const filterBtn = document.getElementById('history-date-filter-btn');
    if (dateInput && filterBtn) {
        filterBtn.addEventListener('click', () => {
            const selectedDate = dateInput.value;
            if (!selectedDate) {
                window.expenseTracker.dateFilter = null;
            } else {
                window.expenseTracker.dateFilter = { startDate: selectedDate, endDate: selectedDate };
            }
            window.expenseTracker.renderExpenseList();
            window.expenseTracker.updateFilterSummary && window.expenseTracker.updateFilterSummary();
        });
    }

// Handle system theme preference at first load
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    if (!localStorage.getItem('advancedExpenseTracker')) {
        document.body.classList.add('dark');
    }
}

// Handle page visibility for better performance
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.expenseTracker) {
        window.expenseTracker.loadFromStorage();
        window.expenseTracker.updateAllDisplays();
    }
});

// Handle browser back/forward navigation to refresh expense list
window.addEventListener('popstate', () => {
    if (window.expenseTracker) {
        window.expenseTracker.renderExpenseList();
    }
});
