export interface XlsRow {
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  wallet: string;
  notes: string;
}

const escapeXml = (str: string): string => {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

const xmlCell = (v: string | number, styleId: number): string => {
  const escaped = typeof v === 'number' ? v : escapeXml(String(v));
  return `<Cell ss:StyleID="s${styleId}"><Data ss:Type="${typeof v === 'number' ? 'Number' : 'String'}">${escaped}</Data></Cell>`;
};

export function buildXlsXml(
  scope: string,
  walletLabel: string,
  dateFrom: string,
  dateTo: string,
  rows: XlsRow[],
): string {
  const now = new Date().toISOString().split('T')[0];
  const totalIncome = rows.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const totalExpense = rows.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const netCash = totalIncome - totalExpense;

  const transactionRows = rows
    .map(r => {
      const isIncome = r.type === 'income';
      return (
        `<Row ss:Height="18">` +
        xmlCell(r.date, 61) +
        xmlCell(r.type.toUpperCase(), isIncome ? 74 : 75) +
        xmlCell(r.amount, isIncome ? 72 : 73) +
        xmlCell(r.category, 61) +
        xmlCell(r.wallet, 61) +
        xmlCell(r.notes, 61) +
        `</Row>`
      );
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:x="urn:schemas-microsoft-com:office:excel">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Bottom"/>
      <Borders/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="s60">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1A1A2E"/>
    </Style>
    <Style ss:ID="s61">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1A1A2E"/>
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="s62">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1B2A4A" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="s63">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#A8BFDF"/>
      <Interior ss:Color="#1B2A4A" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="s64">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#475467"/>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="s65">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1A1A2E"/>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="s66">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#3B5BDB"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#3B5BDB" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="s67">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#344054"/>
      <Interior ss:Color="#F0F4FF" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="s68">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#12B76A"/>
      <Interior ss:Color="#ECFDF3" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="&quot;Rp &quot;#,##0.00"/>
    </Style>
    <Style ss:ID="s69">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#F04438"/>
      <Interior ss:Color="#FEF3F2" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="&quot;Rp &quot;#,##0.00"/>
    </Style>
    <Style ss:ID="s70">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#3B5BDB"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#3B5BDB"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#3B5BDB"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#3B5BDB"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="#3B5BDB"/>
      <Interior ss:Color="#EEF2FF" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="&quot;Rp &quot;#,##0.00"/>
    </Style>
    <Style ss:ID="s71">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D2D50"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D2D50"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D2D50"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D2D50"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1D2D50" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="s72">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#12B76A"/>
      <Interior ss:Color="#F6FEF9" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="&quot;Rp &quot;#,##0.00"/>
    </Style>
    <Style ss:ID="s73">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#F04438"/>
      <Interior ss:Color="#FFFBFA" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="&quot;Rp &quot;#,##0.00"/>
    </Style>
    <Style ss:ID="s74">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#12B76A"/>
      <Interior ss:Color="#D1FADF" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="s75">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D5DD"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#F04438"/>
      <Interior ss:Color="#FEE4E2" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="s76">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Calibri" ss:Size="9" ss:Italic="1" ss:Color="#98A2B3"/>
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Financial Report">
    <Table ss:ExpandedColumnCount="6" x:FullColumns="1" x:FullRows="1">
      <Column ss:Width="105"/><Column ss:Width="85"/><Column ss:Width="130"/>
      <Column ss:Width="130"/><Column ss:Width="140"/><Column ss:Width="200"/>
      <Row ss:Height="36"><Cell ss:MergeAcross="5" ss:StyleID="s62"><Data ss:Type="String">FINANCE STATEMENT LEDGER REPORT</Data></Cell></Row>
      <Row ss:Height="20"><Cell ss:MergeAcross="5" ss:StyleID="s63"><Data ss:Type="String">Generated — ${now}</Data></Cell></Row>
      <Row ss:Height="6"><Cell ss:StyleID="s60"></Cell></Row>
      <Row ss:Height="20">${xmlCell('Export Scope', 64)}<Cell ss:StyleID="s65"><Data ss:Type="String">${escapeXml(scope.toUpperCase())}</Data></Cell><Cell ss:StyleID="s60"></Cell>${xmlCell('Date Range', 64)}<Cell ss:MergeAcross="1" ss:StyleID="s65"><Data ss:Type="String">${escapeXml(dateFrom || 'N/A')} to ${escapeXml(dateTo || 'N/A')}</Data></Cell></Row>
      <Row ss:Height="20">${xmlCell('Wallet', 64)}<Cell ss:MergeAcross="4" ss:StyleID="s65"><Data ss:Type="String">${escapeXml(walletLabel)}</Data></Cell></Row>
      <Row ss:Height="6"><Cell ss:StyleID="s60"></Cell></Row>
      <Row ss:Height="22"><Cell ss:MergeAcross="5" ss:StyleID="s66"><Data ss:Type="String">  SUMMARY STATISTICS</Data></Cell></Row>
      <Row ss:Height="20"><Cell ss:MergeAcross="1" ss:StyleID="s67"><Data ss:Type="String">Total Income</Data></Cell><Cell ss:MergeAcross="3" ss:StyleID="s68"><Data ss:Type="Number">${totalIncome}</Data></Cell></Row>
      <Row ss:Height="20"><Cell ss:MergeAcross="1" ss:StyleID="s67"><Data ss:Type="String">Total Expense</Data></Cell><Cell ss:MergeAcross="3" ss:StyleID="s69"><Data ss:Type="Number">${totalExpense}</Data></Cell></Row>
      <Row ss:Height="22"><Cell ss:MergeAcross="1" ss:StyleID="s67"><Data ss:Type="String">Net Cash Flow</Data></Cell><Cell ss:MergeAcross="3" ss:StyleID="s70"><Data ss:Type="Number">${netCash}</Data></Cell></Row>
      <Row ss:Height="6"><Cell ss:StyleID="s60"></Cell></Row>
      <Row ss:Height="22"><Cell ss:MergeAcross="5" ss:StyleID="s66"><Data ss:Type="String">  TRANSACTION LEDGER ENTRIES</Data></Cell></Row>
      <Row ss:Height="20">${xmlCell('Date', 71)}${xmlCell('Type', 71)}${xmlCell('Amount (IDR)', 71)}${xmlCell('Category', 71)}${xmlCell('Wallet', 71)}${xmlCell('Notes', 71)}</Row>
      ${transactionRows}
      <Row ss:Height="6"><Cell ss:StyleID="s60"></Cell></Row>
      <Row ss:Height="16"><Cell ss:MergeAcross="5" ss:StyleID="s76"><Data ss:Type="String">Auto-generated report. Verify against official bank statements.</Data></Cell></Row>
    </Table>
  </Worksheet>
</Workbook>`;
}
