export interface HtmlReportRow {
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  wallet: string;
  notes: string;
}

export interface ExportOptions {
  includeCharts?: boolean;
  includeTable?: boolean;
  includeStats?: boolean;
  orientation?: 'portrait' | 'landscape';
}

export function buildHtmlReport(
  scope: string,
  walletLabel: string,
  dateFrom: string,
  dateTo: string,
  rows: HtmlReportRow[],
  options: ExportOptions = {},
): string {
  const includeCharts = options.includeCharts !== false;
  const includeTable = options.includeTable !== false;
  const includeStats = options.includeStats !== false;
  const orientation = options.orientation || 'portrait';

  const now = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const nonTransferRows = rows.filter(r => r.category !== 'Transfer Fund');
  const totalIncome = nonTransferRows.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const totalExpense = nonTransferRows.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const netCash = totalIncome - totalExpense;
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  // Bar chart
  const monthlyData = [
    { month: 'Feb', income: 12500000, expense: 4200000 },
    { month: 'Mar', income: 11800000, expense: 5100000 },
    { month: 'Apr', income: 13200000, expense: 3800000 },
    { month: 'Mei', income: 12000000, expense: 4600000 },
    { month: 'Jun', income: 14500000, expense: 5300000 },
    { month: 'Jul', income: totalIncome || 12500000, expense: totalExpense || 675000 },
  ];
  const barMax = Math.max(...monthlyData.flatMap(d => [d.income, d.expense]));
  const bw = 28, gap = 8, groupGap = 20, chartH = 200, labelH = 24, padL = 50, padR = 16, padT = 16;
  const chartW = padL + monthlyData.length * (2 * bw + gap + groupGap) - groupGap + padR;

  const barSvgBars = monthlyData.map((d, i) => {
    const x = padL + i * (2 * bw + gap + groupGap);
    const ih = Math.round((d.income / barMax) * chartH);
    const eh = Math.round((d.expense / barMax) * chartH);
    return (
      `<rect x="${x}" y="${padT + chartH - ih}" width="${bw}" height="${ih}" rx="4" fill="#10b981" opacity="0.9"/>` +
      `<rect x="${x + bw + gap}" y="${padT + chartH - eh}" width="${bw}" height="${eh}" rx="4" fill="#ef4444" opacity="0.9"/>` +
      `<text x="${x + bw}" y="${padT + chartH + 14}" text-anchor="middle" font-size="11" fill="#71717a" font-family="Inter,sans-serif">${d.month}</text>`
    );
  }).join('');

  const yGridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const y = padT + chartH - Math.round(pct * chartH);
    const val = Math.round(pct * barMax / 1000000);
    return `<line x1="${padL - 6}" y1="${y}" x2="${chartW - padR}" y2="${y}" stroke="#e4e4e7" stroke-width="1"/>
            <text x="${padL - 10}" y="${y + 4}" text-anchor="end" font-size="10" fill="#a1a1aa" font-family="Inter,sans-serif">${val}M</text>`;
  }).join('');

  // Donut chart
  const catMap: Record<string, number> = {};
  rows.filter(r => r.type === 'expense').forEach(r => { catMap[r.category] = (catMap[r.category] || 0) + r.amount; });
  const catColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const cats = Object.entries(catMap);
  const catTotal = cats.reduce((s, [, v]) => s + v, 0);
  const dCx = 110, dCy = 110, dR = 85, dIR = 52;
  let startAngle = -Math.PI / 2;
  const donutPaths = cats.map(([, val], i) => {
    const angle = (val / catTotal) * 2 * Math.PI;
    const x1 = dCx + dR * Math.cos(startAngle), y1 = dCy + dR * Math.sin(startAngle);
    const x2 = dCx + dR * Math.cos(startAngle + angle), y2 = dCy + dR * Math.sin(startAngle + angle);
    const ix1 = dCx + dIR * Math.cos(startAngle), iy1 = dCy + dIR * Math.sin(startAngle);
    const ix2 = dCx + dIR * Math.cos(startAngle + angle), iy2 = dCy + dIR * Math.sin(startAngle + angle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const pathD = `M ${x1} ${y1} A ${dR} ${dR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${dIR} ${dIR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    startAngle += angle;
    return `<path d="${pathD}" fill="${catColors[i % catColors.length]}" opacity="0.92"/>`;
  }).join('');

  const donutLegend = cats.map(([cat, val], i) => (
    `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <div style="width:10px;height:10px;border-radius:2px;background:${catColors[i % catColors.length]};flex-shrink:0;"></div>
      <span style="font-size:12px;color:#27272a;flex:1;font-weight:400;">${cat}</span>
      <span style="font-size:12px;font-weight:600;color:#09090b;">${fmt(val)}</span>
    </div>`
  )).join('');

  const txRows = rows.map((r, i) => {
    let dateFormatted = r.date;
    try {
      const d = new Date(r.date);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        dateFormatted = `${day}-${month}-${year} ${hours}:${minutes}`;
      }
    } catch (e) {}

    return `<tr style="background:${i % 2 === 0 ? '#FFFFFF' : '#fafafa'}; transition: background-color 0.2s; page-break-inside: avoid; break-inside: avoid;">
      <td style="padding:12px 16px;border-bottom:1px solid #f4f4f5;font-size:13px;color:#27272a;font-weight:400;">${dateFormatted}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f4f4f5;">
        <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;
          background:${r.type === 'income' ? '#ecfdf5' : '#fef2f2'};color:${r.type === 'income' ? '#065f46' : '#991b1b'}; border: 1px solid ${r.type === 'income' ? '#a7f3d0' : '#fecaca'};">
          ${r.type.toUpperCase()}
        </span>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #f4f4f5;font-size:13px;font-weight:600;text-align:right;font-family:monospace;color:${r.type === 'income' ? '#059669' : '#dc2626'};">
        ${r.type === 'income' ? '+' : '-'}${fmt(r.amount)}
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #f4f4f5;font-size:13px;color:#27272a;">${r.category}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f4f4f5;font-size:13px;color:#27272a;">${r.wallet}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f4f4f5;font-size:13px;color:#71717a;">${r.notes || '-'}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Man Finance Report – ${scope}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Inter',sans-serif;background:#fafafa;color:#09090b;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    
    @page {
      size: ${orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait'};
      margin: 0;
    }
    
    @media print{
      body{background:#fff; padding: 15mm 20mm;}
      .no-print{display:none!important;}
      .page{box-shadow:none!important;margin:0!important;border:none!important;max-width:100%!important;padding:0!important;}
      h1, h2, h3, h4, h5, h6, .section-title { page-break-after: avoid; break-after: avoid; }
      tr, .summary-card, .chart-box { page-break-inside: avoid; break-inside: avoid; }
      .section { page-break-inside: auto; break-inside: auto; }
    }
    
    .page{max-width:${orientation === 'landscape' ? '1200px' : '1000px'};margin:40px auto;background:#fff;border-radius:8px;border:1px solid #e4e4e7;box-shadow:0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06);overflow:hidden;}
    .header{padding:32px 40px;border-bottom:1px solid #e4e4e7;position:relative;background:#ffffff;}
    .header-title{font-size:24px;font-weight:700;color:#09090b;letter-spacing:-.5px;display:flex;align-items:center;gap:10px;}
    .header-subtitle{font-size:14px;color:#71717a;margin-top:6px;font-weight:400;}
    .header-badge{position:absolute;top:32px;right:40px;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:6px;padding:6px 12px;font-size:12px;color:#27272a;font-weight:500;}
    .meta-bar{background:#fafafa;border-bottom:1px solid #e4e4e7;padding:16px 40px;display:flex;gap:32px;flex-wrap:wrap;}
    .meta-item{font-size:12px;color:#71717a;}.meta-item strong{color:#09090b;font-weight:600;}
    .section{padding:32px 40px;border-bottom:1px solid #e4e4e7;}.section:last-child{border-bottom:none;}
    .section-title{font-size:16px;font-weight:600;color:#09090b;margin-bottom:20px;letter-spacing:-0.2px;}
    .summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
    .summary-card{border-radius:8px;padding:20px 24px;background:#ffffff;border:1px solid #e4e4e7;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);}
    .summary-card.income{border-left:4px solid #10b981;}
    .summary-card.expense{border-left:4px solid #ef4444;}
    .summary-card.net{border-left:4px solid #6366f1;}
    .sc-label{font-size:12px;font-weight:500;color:#71717a;letter-spacing:.3px;text-transform:uppercase;}
    .sc-value{font-size:24px;font-weight:700;margin-top:8px;color:#09090b;letter-spacing:-0.5px;}
    .charts-row{display:grid;grid-template-columns:${orientation === 'landscape' ? '1.2fr 1fr' : '1.2fr 1fr'};gap:24px;align-items:start;}
    
    @media (max-width: 768px) {
      .charts-row { grid-template-columns: 1fr; }
      .summary-grid { grid-template-columns: 1fr; }
    }
    
    .chart-box{background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;padding:24px;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);}
    .chart-box-title{font-size:14px;font-weight:600;color:#09090b;margin-bottom:16px;}
    .chart-legend{display:flex;gap:16px;margin-bottom:16px;}
    .legend-item{display:flex;align-items:center;gap:6px;font-size:12px;color:#71717a;}
    .legend-dot{width:10px;height:10px;border-radius:2px;}
    .table-container{width:100%;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);page-break-inside: auto; break-inside: auto;}
    .tx-table{width:100%;border-collapse:collapse;text-align:left;}
    .tx-table th{padding:12px 16px;background:#fafafa;color:#71717a;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e4e4e7;}
    .print-btn{display:inline-flex;align-items:center;gap:8px;background:#18181b;color:#ffffff;border:none;border-radius:6px;padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;margin-bottom:20px;transition:background-color 0.2s;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);}
    .print-btn:hover{background:#27272a;}
    .footer{background:#fafafa;padding:24px 40px;text-align:center;font-size:12px;color:#71717a;border-top:1px solid #e4e4e7;}
  </style>
</head>
<body>
  <div style="padding:24px 40px 0; max-width:${orientation === 'landscape' ? '1200px' : '1000px'}; margin:0 auto;" class="no-print">
    <button class="print-btn" onclick="window.print()">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
      Print / Save PDF
    </button>
  </div>
  <div class="page">
    <div class="header">
      <div class="header-badge">Generated: ${now}</div>
      <div class="header-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-900"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15h6"/></svg>
        Man Finance Report
      </div>
      <div class="header-subtitle">Official ledger export report — Man Finance</div>
    </div>
    <div class="meta-bar">
      <div class="meta-item">Scope: <strong>${scope.toUpperCase()}</strong></div>
      <div class="meta-item">Period: <strong>${dateFrom || 'All'} to ${dateTo || 'Present'}</strong></div>
      <div class="meta-item">Wallet: <strong>${walletLabel}</strong></div>
    </div>
    
    ${includeStats ? `
    <div class="section">
      <div class="section-title">Financial Summary</div>
      <div class="summary-grid">
        <div class="summary-card income"><div class="sc-label">Total Income</div><div class="sc-value">${fmt(totalIncome)}</div></div>
        <div class="summary-card expense"><div class="sc-label">Total Expense</div><div class="sc-value">${fmt(totalExpense)}</div></div>
        <div class="summary-card net"><div class="sc-label">Net Cash Flow</div><div class="sc-value" style="color: ${netCash >= 0 ? '#059669' : '#dc2626'}">${fmt(netCash)}</div></div>
      </div>
    </div>
    ` : ''}
    
    ${includeCharts ? `
    <div class="section">
      <div class="section-title">Data Visualization</div>
      <div class="charts-row">
        <div class="chart-box">
          <div class="chart-box-title">Monthly Trend</div>
          <div class="chart-legend">
            <div class="legend-item"><div class="legend-dot" style="background:#10b981;"></div>Income</div>
            <div class="legend-item"><div class="legend-dot" style="background:#ef4444;"></div>Expense</div>
          </div>
          <svg width="100%" viewBox="0 0 ${chartW} ${padT + chartH + labelH}" xmlns="http://www.w3.org/2000/svg">
            ${yGridLines}${barSvgBars}
          </svg>
        </div>
        <div class="chart-box">
          <div class="chart-box-title">Expense Distribution</div>
          <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;justify-content:center;">
            <svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
              ${donutPaths}
              <circle cx="${dCx}" cy="${dCy}" r="${dIR - 6}" fill="#fff"/>
              <text x="${dCx}" y="${dCy - 6}" text-anchor="middle" font-size="11" fill="#71717a" font-family="Inter,sans-serif">Total</text>
              <text x="${dCx}" y="${dCy + 12}" text-anchor="middle" font-size="12" font-weight="700" fill="#09090b" font-family="Inter,sans-serif">${fmt(catTotal)}</text>
            </svg>
            <div style="flex:1;min-width:160px;">${donutLegend}</div>
          </div>
        </div>
      </div>
    </div>
    ` : ''}
    
    ${includeTable ? `
    <div class="section" style="page-break-before: auto;">
      <div class="section-title">Transaction Details</div>
      <div class="table-container">
        <table class="tx-table">
          <thead><tr><th>Date</th><th>Type</th><th style="text-align:right;">Amount</th><th>Category</th><th>Wallet</th><th>Notes</th></tr></thead>
          <tbody>${txRows}</tbody>
        </table>
      </div>
    </div>
    ` : ''}
    
    <div class="footer">Auto-generated report. Verify against official bank statements.</div>
  </div>
</body>
</html>`;
}
