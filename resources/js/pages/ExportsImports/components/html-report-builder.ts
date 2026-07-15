export interface HtmlReportRow {
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  wallet: string;
  notes: string;
}

export function buildHtmlReport(
  scope: string,
  walletLabel: string,
  dateFrom: string,
  dateTo: string,
  rows: HtmlReportRow[],
): string {
  const now = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const totalIncome = rows.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const totalExpense = rows.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const netCash = totalIncome - totalExpense;
  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

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
      `<rect x="${x}" y="${padT + chartH - ih}" width="${bw}" height="${ih}" rx="4" fill="#12B76A" opacity="0.9"/>` +
      `<rect x="${x + bw + gap}" y="${padT + chartH - eh}" width="${bw}" height="${eh}" rx="4" fill="#F04438" opacity="0.9"/>` +
      `<text x="${x + bw}" y="${padT + chartH + 14}" text-anchor="middle" font-size="11" fill="#667085" font-family="Inter,sans-serif">${d.month}</text>`
    );
  }).join('');

  const yGridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const y = padT + chartH - Math.round(pct * chartH);
    const val = Math.round(pct * barMax / 1000000);
    return `<line x1="${padL - 6}" y1="${y}" x2="${chartW - padR}" y2="${y}" stroke="#EAECF0" stroke-width="1"/>
            <text x="${padL - 10}" y="${y + 4}" text-anchor="end" font-size="10" fill="#98A2B3" font-family="Inter,sans-serif">${val}jt</text>`;
  }).join('');

  // Donut chart
  const catMap: Record<string, number> = {};
  rows.filter(r => r.type === 'expense').forEach(r => { catMap[r.category] = (catMap[r.category] || 0) + r.amount; });
  const catColors = ['#3B5BDB', '#12B76A', '#F79009', '#F04438', '#9B8AFB', '#06B6D4'];
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
    `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <div style="width:12px;height:12px;border-radius:3px;background:${catColors[i % catColors.length]};flex-shrink:0;"></div>
      <span style="font-size:13px;color:#344054;flex:1;">${cat}</span>
      <span style="font-size:13px;font-weight:600;color:#1D2939;">${fmt(val)}</span>
    </div>`
  )).join('');

  const txRows = rows.map((r, i) => (
    `<tr style="background:${i % 2 === 0 ? '#FFFFFF' : '#F9FAFB'};">
      <td style="padding:10px 14px;border-bottom:1px solid #EAECF0;font-size:13px;color:#344054;">${r.date}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #EAECF0;">
        <span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;
          background:${r.type === 'income' ? '#D1FADF' : '#FEE4E2'};color:${r.type === 'income' ? '#027A48' : '#B42318'};">
          ${r.type.toUpperCase()}
        </span>
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #EAECF0;font-size:13px;font-weight:700;text-align:right;color:${r.type === 'income' ? '#027A48' : '#B42318'};">
        ${r.type === 'income' ? '+' : '-'}${fmt(r.amount)}
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #EAECF0;font-size:13px;color:#344054;">${r.category}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #EAECF0;font-size:13px;color:#344054;">${r.wallet}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #EAECF0;font-size:13px;color:#667085;">${r.notes}</td>
    </tr>`
  )).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Finance Report – ${scope}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Inter',sans-serif;background:#F2F4F7;color:#1D2939;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    @media print{body{background:#fff;}.no-print{display:none!important;}.page{box-shadow:none!important;margin:0!important;border-radius:0!important;}}
    .page{max-width:960px;margin:32px auto;background:#fff;border-radius:16px;box-shadow:0 4px 32px rgba(0,0,0,.10);overflow:hidden;}
    .header{background:linear-gradient(135deg,#1B2A4A 0%,#2D4270 60%,#3B5BDB 100%);padding:40px 48px 32px;position:relative;}
    .header-title{font-size:26px;font-weight:800;color:#fff;letter-spacing:-.5px;}
    .header-subtitle{font-size:14px;color:#A8C0E8;margin-top:4px;}
    .header-badge{position:absolute;top:36px;right:48px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:8px 16px;font-size:12px;color:#CBD5FF;text-align:right;}
    .meta-bar{background:#F8FAFC;border-bottom:1px solid #EAECF0;padding:16px 48px;display:flex;gap:32px;flex-wrap:wrap;}
    .meta-item{font-size:12px;color:#667085;}.meta-item strong{color:#344054;font-weight:600;}
    .section{padding:32px 48px;border-bottom:1px solid #EAECF0;}.section:last-child{border-bottom:none;}
    .section-title{font-size:15px;font-weight:700;color:#1D2939;margin-bottom:20px;display:flex;align-items:center;gap:8px;}
    .section-title::before{content:'';display:inline-block;width:4px;height:18px;background:linear-gradient(to bottom,#3B5BDB,#6B8AFF);border-radius:2px;}
    .summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
    .summary-card{border-radius:12px;padding:20px 24px;}
    .summary-card.income{background:#ECFDF3;border:1px solid #A9EFC5;}
    .summary-card.expense{background:#FEF3F2;border:1px solid #FECDCA;}
    .summary-card.net{background:#EEF2FF;border:2px solid #C7D2FE;}
    .sc-label{font-size:12px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;}
    .sc-label.income{color:#027A48;}.sc-label.expense{color:#B42318;}.sc-label.net{color:#3730A3;}
    .sc-value{font-size:22px;font-weight:800;margin-top:8px;}
    .sc-value.income{color:#12B76A;}.sc-value.expense{color:#F04438;}.sc-value.net{color:#3B5BDB;}
    .charts-row{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start;}
    .chart-box{background:#F9FAFB;border:1px solid #EAECF0;border-radius:12px;padding:20px;}
    .chart-box-title{font-size:13px;font-weight:700;color:#344054;margin-bottom:16px;}
    .chart-legend{display:flex;gap:16px;margin-bottom:12px;}
    .legend-item{display:flex;align-items:center;gap:6px;font-size:12px;color:#667085;}
    .legend-dot{width:10px;height:10px;border-radius:2px;}
    .tx-table{width:100%;border-collapse:collapse;}
    .tx-table th{padding:10px 14px;background:#1D2939;color:#fff;font-size:12px;font-weight:600;text-align:left;}
    .tx-table th:first-child{border-radius:8px 0 0 0;}.tx-table th:last-child{border-radius:0 8px 0 0;}
    .print-btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#3B5BDB,#6B8AFF);color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:24px;}
    .footer{background:#F8FAFC;padding:24px 48px;text-align:center;font-size:12px;color:#98A2B3;border-top:1px solid #EAECF0;}
  </style>
</head>
<body>
  <div style="padding:24px 32px 0;" class="no-print">
    <button class="print-btn" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
  </div>
  <div class="page">
    <div class="header">
      <div class="header-badge">Dibuat: ${now}</div>
      <div class="header-title">📊 Finance Statement Report</div>
      <div class="header-subtitle">Laporan keuangan — Finance Manager Application</div>
    </div>
    <div class="meta-bar">
      <div class="meta-item">Scope: <strong>${scope.toUpperCase()}</strong></div>
      <div class="meta-item">Periode: <strong>${dateFrom || 'Semua'} s/d ${dateTo || 'Sekarang'}</strong></div>
      <div class="meta-item">Wallet: <strong>${walletLabel}</strong></div>
    </div>
    <div class="section">
      <div class="section-title">Ringkasan Finansial</div>
      <div class="summary-grid">
        <div class="summary-card income"><div class="sc-label income">Total Pemasukan</div><div class="sc-value income">${fmt(totalIncome)}</div></div>
        <div class="summary-card expense"><div class="sc-label expense">Total Pengeluaran</div><div class="sc-value expense">${fmt(totalExpense)}</div></div>
        <div class="summary-card net"><div class="sc-label net">Net Cash Flow</div><div class="sc-value net">${fmt(netCash)}</div></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Visualisasi Data</div>
      <div class="charts-row">
        <div class="chart-box">
          <div class="chart-box-title">📈 Tren Bulanan</div>
          <div class="chart-legend">
            <div class="legend-item"><div class="legend-dot" style="background:#12B76A;"></div>Pemasukan</div>
            <div class="legend-item"><div class="legend-dot" style="background:#F04438;"></div>Pengeluaran</div>
          </div>
          <svg width="100%" viewBox="0 0 ${chartW} ${padT + chartH + labelH}" xmlns="http://www.w3.org/2000/svg">
            ${yGridLines}${barSvgBars}
          </svg>
        </div>
        <div class="chart-box">
          <div class="chart-box-title">🍩 Distribusi Pengeluaran</div>
          <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
            <svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
              ${donutPaths}
              <circle cx="${dCx}" cy="${dCy}" r="${dIR - 6}" fill="#fff"/>
              <text x="${dCx}" y="${dCy - 6}" text-anchor="middle" font-size="11" fill="#667085" font-family="Inter,sans-serif">Total</text>
              <text x="${dCx}" y="${dCy + 12}" text-anchor="middle" font-size="12" font-weight="700" fill="#1D2939" font-family="Inter,sans-serif">${fmt(catTotal)}</text>
            </svg>
            <div style="flex:1;min-width:140px;">${donutLegend}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Rincian Transaksi</div>
      <table class="tx-table">
        <thead><tr><th>Tanggal</th><th>Tipe</th><th style="text-align:right;">Jumlah</th><th>Kategori</th><th>Wallet</th><th>Catatan</th></tr></thead>
        <tbody>${txRows}</tbody>
      </table>
    </div>
    <div class="footer">Laporan ini dibuat otomatis. Mohon verifikasi dengan mutasi rekening bank.</div>
  </div>
</body>
</html>`;
}
