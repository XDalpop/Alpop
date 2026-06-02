const Store = {
  _username: null,

  setUsername(username) {
    this._username = username;
  },

  _key() {
    return this._username ? `tradevault_trades_${this._username}` : 'tradevault_trades';
  },

  _parseNumeric(data) {
    return {
      shares: Number(data.shares),
      entryPrice: Number(data.entryPrice),
      exitPrice: Number(data.exitPrice)
    };
  },

  getAll() {
    try {
      const data = localStorage.getItem(this._key());
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveAll(trades) {
    try {
      localStorage.setItem(this._key(), JSON.stringify(trades));
    } catch (e) {
      console.error('Failed to save trades:', e);
    }
  },

  add(tradeData) {
    const trades = this.getAll();
    const numeric = this._parseNumeric(tradeData);
    const { profit, profitPercent } = Calculator.calcProfit(
      numeric.entryPrice, numeric.exitPrice, numeric.shares
    );
    const holdingDays = Calculator.calcHoldingDays(tradeData.entryDate, tradeData.exitDate);
    const trade = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      entryDate: tradeData.entryDate,
      exitDate: tradeData.exitDate,
      ...numeric,
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
    const numeric = this._parseNumeric(tradeData);
    const { profit, profitPercent } = Calculator.calcProfit(
      numeric.entryPrice, numeric.exitPrice, numeric.shares
    );
    const holdingDays = Calculator.calcHoldingDays(tradeData.entryDate, tradeData.exitDate);
    trades[idx] = {
      ...trades[idx],
      entryDate: tradeData.entryDate,
      exitDate: tradeData.exitDate,
      ...numeric,
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
    localStorage.removeItem(this._key());
  }
};
