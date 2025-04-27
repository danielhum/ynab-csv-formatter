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
      
      const { processed, matchedAccountType } = this._processSheet(sheet);
      
      if (processed.length === 0) {
        alert("Couldn't parse file! Please ensure you've selected the correct bank type.");
        return;
      }
      
      const outData = this._formatData(processed, matchedAccountType);
      this._saveToCSV(outData, file.name);
    };
    
    reader.readAsArrayBuffer(file);
  },

  /**
   * Process XLSX sheet
   * @param {Object} sheet - The XLSX sheet
   * @returns {Object} - The processed data and matched account type
   * @private
   */
  _processSheet: function(sheet) {
    const accountTypes = BankConfig.getAvailableBanks();
    let processed = [];
    let matchedAccountType = null;
    
    // Use a for loop to iterate over the accountTypes array
    for (let i = 0; i < accountTypes.length; i++) {
      const accountType = accountTypes[i];
      const meta = BankConfig.getAccountMeta(accountType);
      
      if (!meta) continue;
      
      const headers = meta["headers"];
      if (!headers) continue;
      
      const json = XLSX.utils.sheet_to_json(sheet, { header: headers });
      
      processed = json.filter((row) => {
        const date = Date.parse(row[meta["dateHeader"]]);
        const withdrawal = typeof row[meta["debitHeader"]] === "number";
        const deposit = typeof row[meta["creditHeader"]] === "number";
        
        return ((date && date !== "NaN") && (withdrawal || deposit));
      });
      
      // If we found valid data, break out of the loop
      if (processed.length > 0) {
        matchedAccountType = accountType;
        break;
      }
    }
    
    if (processed.length === 0) {
      console.error("No valid data found in the sheet for any bank type");
    }
    
    return { processed, matchedAccountType };
  },

  /**
   * Format data for YNAB
   * @param {Array} processed - The processed data
   * @param {string} accountType - The matched account type
   * @returns {Array} - The formatted data
   * @private
   */
  _formatData: function(processed, accountType) {
    const outData = [];
    const meta = BankConfig.getAccountMeta(accountType);
    
    if (!meta) {
      console.error("Account metadata not found for:", accountType);
      return outData;
    }
    
    const isUOB = accountType === "uob" || accountType === "uob_deposit" || accountType === "uob_cc";
    
    processed.forEach((element) => {
      const date = new Date(Date.parse(element[meta.dateHeader]));
      const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      const outflow = element[meta.debitHeader];
      const inflow = element[meta.creditHeader];
      
      let payee = DataUtils.cleanText(element[meta.payeeHeader]);
      let memo = "";
      
      // Apply UOB-specific formatting if needed
      if (isUOB) {
        const formattedRow = UOBFormatter.format([{
          date: formattedDate,
          payee: payee,
          outflow: outflow,
          inflow: inflow
        }])[0];
        
        payee = formattedRow.payee;
        memo = formattedRow.memo;
      }
      
      const payment = typeof outflow === "number" && outflow > 0;
      
      if (payee.match(/\bfee\b/i) !== null && payment) {
        console.warn("Fee detected!");
      }
      
      outData.push({
        "Date": formattedDate,
        "Payee": payee,
        "Memo": memo,
        "Outflow": outflow,
        "Inflow": inflow,
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