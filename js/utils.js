const Utils = {
  formatCurrency(amount) {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
    return `${amount < 0 ? '−' : ''}${formatted} ج.م`;
  },

  formatPercent(value) {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  },

  formatDate(isoDate) {
    if (!isoDate) return '—';
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  },

  formatDateISO(isoDate) {
    if (!isoDate) return '—';
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('en-CA'); // yyyy-mm-dd
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },

  exportCSV(trades) {
    const headers = ['تاريخ الدخول', 'تاريخ الخروج', 'عدد الأسهم', 'سعر الشراء', 'سعر البيع', 'الربح (ج.م)', 'نسبة الربح (%)', 'المدة (أيام)'];
    const rows = trades.map(t => [
      t.entryDate, t.exitDate, t.shares, t.entryPrice, t.exitPrice,
      t.profit, t.profitPercent, t.holdingDays
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradevault_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportXLSX(trades) {
    if (typeof XLSX === 'undefined') {
      alert('مكتبة Excel غير متوفرة. حاول مرة أخرى.');
      return;
    }
    const data = trades.map(t => ({
      'تاريخ الدخول': t.entryDate,
      'تاريخ الخروج': t.exitDate,
      'عدد الأسهم': t.shares,
      'سعر الشراء': t.entryPrice,
      'سعر البيع': t.exitPrice,
      'الربح (ج.م)': t.profit,
      'نسبة الربح (%)': t.profitPercent,
      'المدة (أيام)': t.holdingDays
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الصفقات');
    XLSX.writeFile(wb, `tradevault_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
};
