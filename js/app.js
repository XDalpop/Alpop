(function () {
  'use strict';

  // ---- DOM refs ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const modal = $('#tradeModal');
  const modalTitle = $('#modalTitle');
  const tradeForm = $('#tradeForm');
  const tradeId = $('#tradeId');
  const entryDate = $('#entryDate');
  const exitDate = $('#exitDate');
  const shares = $('#shares');
  const entryPrice = $('#entryPrice');
  const exitPrice = $('#exitPrice');
  const calcPreview = $('#calcPreview');
  const previewProfit = $('#previewProfit');
  const previewPercent = $('#previewPercent');
  const addBtn = $('#addTradeBtn');
  const modalClose = $('#modalClose');
  const modalCancel = $('#modalCancel');
  const searchInput = $('#searchInput');
  const filterDateFrom = $('#filterDateFrom');
  const filterDateTo = $('#filterDateTo');
  const clearFiltersBtn = $('#clearFiltersBtn');
  const exportCsvBtn = $('#exportCsvBtn');
  const exportXlsxBtn = $('#exportXlsxBtn');
  const tbody = $('#tradesBody');

  // ---- State ----
  let trades = [];
  let editingId = null;

  // ---- Load ----
  function loadTrades() {
    trades = Store.getAll();
    applyFilters();
  }

  // ---- Render table ----
  function renderTable(filtered) {
    const data = filtered || trades;
    if (!data.length) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="10">
        <i class="fas fa-inbox"></i><p>لا توجد صفقات بعد. أضف صفقتك الأولى!</p>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = data.map((t, i) => {
      const cls = Calculator.classify(t.profit);
      const isWin = cls === 'win';
      const isLoss = cls === 'loss';
      const statusIcon = isWin ? '<i class="fas fa-caret-up"></i>' : (isLoss ? '<i class="fas fa-caret-down"></i>' : '');
      const statusLabel = isWin ? 'رابح' : (isLoss ? 'خاسر' : 'تعادل');
      const rowClass = isWin ? 'row-win' : (isLoss ? 'row-loss' : '');
      const valClass = isWin ? 'profit-text' : (isLoss ? 'loss-text' : 'neutral-text');
      const badgeClass = isWin ? 'badge-win' : (isLoss ? 'badge-loss' : 'badge-neutral');
      return `<tr class="${rowClass}">
        <td><span class="num">${i + 1}</span></td>
        <td>${Utils.formatDate(t.entryDate)}</td>
        <td>${Utils.formatDate(t.exitDate)}</td>
        <td><span class="num">${t.shares.toLocaleString()}</span></td>
        <td><span class="num">${t.entryPrice.toFixed(2)}</span></td>
        <td><span class="num">${t.exitPrice.toFixed(2)}</span></td>
        <td><span class="num ${valClass}">${statusIcon} ${Utils.formatCurrency(t.profit)}</span></td>
        <td><span class="num ${valClass}">${Utils.formatPercent(t.profitPercent)}</span></td>
        <td><span class="badge">${t.holdingDays} ي</span></td>
        <td>
          <div class="actions-cell">
            <span class="status-badge ${badgeClass}">${statusLabel}</span>
            <button class="btn btn-icon btn-edit" data-id="${t.id}" title="تعديل">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn btn-icon btn-delete" data-id="${t.id}" title="حذف">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  // ---- Filter ----
  function applyFilters() {
    let filtered = [...trades];

    const search = searchInput.value.trim().toLowerCase();
    if (search) {
      filtered = filtered.filter(t =>
        t.entryDate.includes(search) || t.exitDate.includes(search) ||
        String(t.shares).includes(search) || String(t.entryPrice).includes(search) ||
        String(t.exitPrice).includes(search)
      );
    }

    const from = filterDateFrom.value;
    const to = filterDateTo.value;
    if (from) filtered = filtered.filter(t => t.entryDate >= from);
    if (to) filtered = filtered.filter(t => t.entryDate <= to);

    // Sort by entryDate descending
    filtered.sort((a, b) => b.entryDate.localeCompare(a.entryDate));

    Dashboard.render(trades);
    renderTable(filtered);
  }

  // ---- Open modal (add / edit) ----
  function openModal(title, trade = null) {
    modalTitle.textContent = title;
    editingId = trade ? trade.id : null;
    calcPreview.style.display = 'none';

    if (trade) {
      tradeId.value = trade.id;
      entryDate.value = trade.entryDate;
      exitDate.value = trade.exitDate;
      shares.value = trade.shares;
      entryPrice.value = trade.entryPrice;
      exitPrice.value = trade.exitPrice;
      showPreview();
    } else {
      tradeForm.reset();
      tradeId.value = '';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Focus first field
    setTimeout(() => (trade ? exitDate : entryDate).focus(), 100);
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    tradeForm.reset();
    editingId = null;
    calcPreview.style.display = 'none';
  }

  // ---- Live preview ----
  function showPreview() {
    const ePrice = parseFloat(entryPrice.value);
    const xPrice = parseFloat(exitPrice.value);
    const sh = parseFloat(shares.value);

    if (!isNaN(ePrice) && !isNaN(xPrice) && !isNaN(sh) && ePrice > 0 && sh > 0) {
      const { profit, profitPercent } = Calculator.calcProfit(ePrice, xPrice, sh);
      const cls = Calculator.classify(profit);
      const color = cls === 'win' ? 'var(--profit)' : (cls === 'loss' ? 'var(--loss)' : 'var(--text-muted)');
      previewProfit.textContent = Utils.formatCurrency(profit);
      previewProfit.style.color = color;
      previewPercent.textContent = Utils.formatPercent(profitPercent);
      previewPercent.style.color = color;
      calcPreview.style.display = 'block';
    } else {
      calcPreview.style.display = 'none';
    }
  }

  // ---- Form submit ----
  function handleSubmit(e) {
    e.preventDefault();

    const data = {
      entryDate: entryDate.value,
      exitDate: exitDate.value,
      shares: shares.value,
      entryPrice: entryPrice.value,
      exitPrice: exitPrice.value
    };

    if (!data.entryDate || !data.exitDate || !data.shares || !data.entryPrice || !data.exitPrice) {
      return;
    }

    if (data.exitDate < data.entryDate) {
      alert('تاريخ الخروج يجب أن يكون بعد تاريخ الدخول أو مساوياً له.');
      return;
    }

    if (editingId) {
      Store.update(editingId, data);
    } else {
      Store.add(data);
    }

    closeModal();
    loadTrades();
  }

  // ---- Delete ----
  function handleDelete(id) {
    const t = trades.find(t => t.id === id);
    const msg = t
      ? `هل أنت متأكد من حذف الصفقة (${Utils.formatDate(t.entryDate)} — ${Utils.formatDate(t.exitDate)})؟`
      : 'هل أنت متأكد من حذف هذه الصفقة؟';
    if (confirm(msg)) {
      Store.remove(id);
      loadTrades();
    }
  }

  // ---- Edit ----
  function handleEdit(id) {
    const trade = trades.find(t => t.id === id);
    if (trade) openModal('تعديل الصفقة', trade);
  }

  // ---- Events ----
  function bindEvents() {
    // Add button
    addBtn.addEventListener('click', () => openModal('إضافة صفقة جديدة'));

    // Close modal
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Form submit
    tradeForm.addEventListener('submit', handleSubmit);

    // Live preview on input
    [entryPrice, exitPrice, shares].forEach(el => {
      el.addEventListener('input', showPreview);
    });

    // Table actions (delegation)
    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.classList.contains('btn-delete')) handleDelete(id);
      if (btn.classList.contains('btn-edit')) handleEdit(id);
    });

    // Search & filter
    searchInput.addEventListener('input', applyFilters);
    filterDateFrom.addEventListener('change', applyFilters);
    filterDateTo.addEventListener('change', applyFilters);
    clearFiltersBtn.addEventListener('click', () => {
      searchInput.value = '';
      filterDateFrom.value = '';
      filterDateTo.value = '';
      applyFilters();
    });

    // Export
    exportCsvBtn.addEventListener('click', () => Utils.exportCSV(trades));
    exportXlsxBtn.addEventListener('click', () => Utils.exportXLSX(trades));
  }

  // ---- Init ----
  function init() {
    bindEvents();
    loadTrades();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
