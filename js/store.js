const STORAGE_KEY = 'tradevault_trades';

const Store = {
  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveAll(trades) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    } catch (e) {
      console.error('Failed to save trades:', e);
    }
  },

  add(tradeData) {
    const trades = this.getAll();
    const { profit, profitPercent } = Calculator.calcProfit(
      tradeData.entryPrice, tradeData.exitPrice, tradeData.shares
    );
    const holdingDays = Calculator.calcHoldingDays(tradeData.entryDate, tradeData.exitDate);
    const trade = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ...tradeData,
      shares: Number(tradeData.shares),
      entryPrice: Number(tradeData.entryPrice),
      exitPrice: Number(tradeData.exitPrice),
      profit,
      profitPercent,
      holdingDays,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    trades.push(trade);
    this.saveAll(trades);
    return trade;
  },

  update(id, tradeData) {
    const trades = this.getAll();
    const idx = trades.findIndex(t => t.id === id);
    if (idx === -1) return null;
    const { profit, profitPercent } = Calculator.calcProfit(
      tradeData.entryPrice, tradeData.exitPrice, tradeData.shares
    );
    const holdingDays = Calculator.calcHoldingDays(tradeData.entryDate, tradeData.exitDate);
    trades[idx] = {
      ...trades[idx],
      ...tradeData,
      shares: Number(tradeData.shares),
      entryPrice: Number(tradeData.entryPrice),
      exitPrice: Number(tradeData.exitPrice),
      profit,
      profitPercent,
      holdingDays,
      updatedAt: new Date().toISOString()
    };
    this.saveAll(trades);
    return trades[idx];
  },

  remove(id) {
    const trades = this.getAll().filter(t => t.id !== id);
    this.saveAll(trades);
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
