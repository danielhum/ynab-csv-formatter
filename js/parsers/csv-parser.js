/**
 * CSV Parser for YNAB CSV Formatter
 */

const CSVParser = {
  /**
   * Sanitize and parse CSV file
   * @param {File} file - The CSV file to parse
   * @param {string} bank - The bank identifier
   */
  sanitizeAndParse: function(file, bank) {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      let lines = event.target.result.split(/\r\n|\n/);
      const headerStartsWith = BankConfig.getHeaderIdentifier(bank);
      
      DataUtils.removeExtraLines(lines, headerStartsWith);
      let newLines = this._formatBankCSV(lines, bank);
      let output = newLines.join("\n");
      let filename = FileUtils.createYNABFilename(file.name);
      
      this.parse(output, bank, filename);
    };
    
    reader.readAsText(file);
  },

  /**
   * Format bank CSV based on bank type
   * @param {Array} lines - The lines to format
   * @param {string} bank - The bank identifier
   * @returns {Array} - The formatted lines
   * @private
   */
  _formatBankCSV: function(lines, bank) {
    switch (bank) {
      case "ocbc":
      case "ocbc_cc":
        return OCBCFormatter.format(lines);
      case "sc_bank":
        return SCBankFormatter.format(lines);
      case "amex_cc":
        return AmexFormatter.format(lines);
      case "dbs":
        return DBSFormatter.format(lines);
      case "uob":
      case "uob_deposit":
      case "uob_cc":
        alert("UOB CSV format not supported yet! (only XLS)");
        return lines;
      case "citibank_cc":
        return CitibankFormatter.format(lines);
      default:
        console.warn(`No formatter found for bank: ${bank}`);
        return lines;
    }
  },

  /**
   * Parse CSV data
   * @param {string} csvFile - The CSV content
   * @param {string} bank - The bank identifier
   * @param {string} outFilename - The output filename
   */
  parse: function(csvFile, bank, outFilename = "download.csv") {
    const meta = BankConfig.getAccountMeta(bank);
    
    if (!meta) {
      console.error("Bank metadata not found for:", bank);
      return;
    }
    
    Papa.parse(csvFile, {
      delimiter: ",",
      comments: "#",
      dynamicTyping: true,
      header: true,
      transformHeader: (header) => BankConfig.transformHeader(header, meta),
      complete: (results) => {
        console.log("Parse CSV results:", results);
        
        const processed = DataUtils.handleParseCSVResults(results);
        
        if (processed.errors.length > 0) {
          console.error("Parsing errors:", processed.errors);
          alert("Parsing error! Check console for details.");
          return;
        }
        
        // Clean the data using the utility function
        DataUtils.cleanData(processed.data);
        
        const csvOutputFile = DataUtils.processData(processed.data);
        FileUtils.downloadCSV(csvOutputFile, outFilename);
      }
    });
  }
};

// Export the parser
window.CSVParser = CSVParser; 