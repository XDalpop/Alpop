const Calculator = {
  calcProfit(entryPrice, exitPrice, shares) {
    const profit = (exitPrice - entryPrice) * shares;
    const profitPercent = entryPrice > 0 ? ((exitPrice - entryPrice) / entryPrice) * 100 : 0;
    return { profit: +profit.toFixed(2), profitPercent: +profitPercent.toFixed(2) };
  },

  calcHoldingDays(entryDate, exitDate) {
    const e = new Date(entryDate);
    const x = new Date(exitDate);
    const diff = (x - e) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.round(diff));
  },

  isWinner(trade) {
    return trade.profit > 0;
  },

  calcStats(trades) {
    if (!trades.length) {
      return {
        total: 0, totalPnl: 0, avgPercent: 0,
        wins: 0, losses: 0,
        best: 0, worst: 0,
        avgDays: 0, profitFactor: 0
      };
    }

    const total = trades.length;
    const totalPnl = trades.reduce((s, t) => s + t.profit, 0);
    const avgPercent = trades.reduce((s, t) => s + t.profitPercent, 0) / total;
    const wins = trades.filter(t => this.isWinner(t)).length;
    const losses = total - wins;
    const best = Math.max(...trades.map(t => t.profit));
    const worst = Math.min(...trades.map(t => t.profit));
    const totalDays = trades.reduce((s, t) => s + (t.holdingDays || 0), 0);
    const avgDays = totalDays / total;

    const totalProfit = trades.filter(t => t.profit > 0).reduce((s, t) => s + t.profit, 0);
    const totalLoss = Math.abs(trades.filter(t => t.profit < 0).reduce((s, t) => s + t.profit, 0));
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : (totalProfit > 0 ? Infinity : 0);

    return {
      total, totalPnl: +totalPnl.toFixed(2),
      avgPercent: +avgPercent.toFixed(2),
      wins, losses,
      best: +best.toFixed(2), worst: +worst.toFixed(2),
      avgDays: +avgDays.toFixed(1),
      profitFactor: profitFactor === Infinity ? Infinity : +profitFactor.toFixed(2)
    };
  }
};
