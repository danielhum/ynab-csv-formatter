/**
 * XLS Parser for YNAB CSV Formatter
 */

const XLSParser = {
  /**
   * Parse XLSX file
   * @param {File} file - The XLSX file to parse
   */
  parse: function(file) {
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      
      const processed = this._processSheet(sheet);
      
      if (processed.length === 0) {
        alert("Couldn't parse file!");
        return;
      }
      
      const outData = this._formatData(processed);
      this._saveToCSV(outData, file.name);
    };
    
    reader.readAsArrayBuffer(file);
  },

  /**
   * Process XLSX sheet
   * @param {Object} sheet - The XLSX sheet
   * @returns {Array} - The processed data
   * @private
   */
  _processSheet: function(sheet) {
    const accountTypes = Object.keys(BankConfig.getAccountMeta("uob_deposit"));
    let processed = [];
    let accountType = null;
    let meta = null;
    
    for (let i = 0; processed.length === 0; i++) {
      accountType = accountTypes[i];
      meta = BankConfig.getAccountMeta(accountType);
      
      if (!meta) continue;
      
      const headers = meta["headers"];
      const json = XLSX.utils.sheet_to_json(sheet, { header: headers });
      
      processed = json.filter((row) => {
        const date = Date.parse(row[meta["dateHeader"]]);
        const withdrawal = typeof row[meta["debitHeader"]] === "number";
        const deposit = typeof row[meta["creditHeader"]] === "number";
        
        return ((date && date !== "NaN") && (withdrawal || deposit));
      });
    }
    
    return processed;
  },

  /**
   * Format data for YNAB
   * @param {Array} processed - The processed data
   * @returns {Array} - The formatted data
   * @private
   */
  _formatData: function(processed) {
    const outData = [];
    const meta = BankConfig.getAccountMeta("uob_deposit");
    
    processed.forEach((element) => {
      const date = new Date(Date.parse(element[meta.dateHeader]));
      const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      const payee = DataUtils.cleanText(element[meta.payeeHeader]);
      const outflow = element[meta.debitHeader];
      const payment = typeof outflow === "number" && outflow > 0;
      
      if (payee.match(/\bfee\b/i) !== null && payment) {
        console.warn("Fee detected!");
      }
      
      outData.push({
        "Date": formattedDate,
        "Payee": payee,
        "Memo": "",
        "Outflow": element[meta.debitHeader],
        "Inflow": element[meta.creditHeader],
      });
    });
    
    return outData;
  },

  /**
   * Save data to CSV
   * @param {Array} outData - The data to save
   * @param {string} filename - The original filename
   * @private
   */
  _saveToCSV: function(outData, filename) {
    const outSheet = XLSX.utils.json_to_sheet(outData);
    const outWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(outWb, outSheet, "Sheet0");
    XLSX.writeFile(outWb, FileUtils.createYNABFilename(filename), { type: "csv" });
  }
};

// Export the parser
window.XLSParser = XLSParser; 