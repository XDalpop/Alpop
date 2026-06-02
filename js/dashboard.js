const Dashboard = {
  chartInstance: null,

  render(trades) {
    const stats = Calculator.calcStats(trades);

    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statPnl').textContent = Utils.formatCurrency(stats.totalPnl);
    document.getElementById('statPnl').className = `stat-value ${stats.totalPnl >= 0 ? 'profit' : 'loss'}`;
    document.getElementById('statAvg').textContent = `${stats.avgPercent}%`;
    document.getElementById('statAvg').className = `stat-value ${stats.avgPercent >= 0 ? 'profit' : 'loss'}`;
    document.getElementById('statWl').textContent = `${stats.wins} / ${stats.losses}`;
    document.getElementById('statBest').textContent = Utils.formatCurrency(stats.best);
    document.getElementById('statBest').className = 'stat-value profit';
    document.getElementById('statWorst').textContent = Utils.formatCurrency(stats.worst);
    document.getElementById('statWorst').className = 'stat-value loss';
    document.getElementById('statDays').textContent = `${stats.avgDays} يوم`;
    document.getElementById('statPf').textContent = stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2);
    document.getElementById('statPf').className = `stat-value ${stats.profitFactor >= 1 ? 'profit' : 'loss'}`;

    this.updateChart(trades);
  },

  updateChart(trades) {
    const ctx = document.getElementById('profitChart').getContext('2d');

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    if (!trades.length) {
      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: [], datasets: [{ data: [] }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          }
        }
      });
      return;
    }

    const labels = trades.map((_, i) => `#${i + 1}`);
    const data = trades.map(t => t.profit);
    const colors = trades.map(t => t.profit >= 0
      ? 'rgba(34, 197, 94, 0.7)'
      : 'rgba(239, 68, 68, 0.7)'
    );
    const borderColors = trades.map(t => t.profit >= 0
      ? 'rgba(34, 197, 94, 1)'
      : 'rgba(239, 68, 68, 1)'
    );

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'الربح/الخسارة (ج.م)',
          data,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#f1f5f9',
            bodyColor: '#f1f5f9',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (ctx) => Utils.formatCurrency(ctx.parsed.y)
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#64748b',
              font: { size: 11 },
              callback: (val) => val.toLocaleString()
            }
          }
        }
      }
    });
  }
};
