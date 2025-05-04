/**
 * DBS Bank formatter for YNAB CSV Formatter
 */

const DBSFormatter = {
  /**
   * Format DBS bank statement lines for YNAB compatibility
   * @param {Array} lines - The lines to format
   * @returns {Array} - The formatted lines
   */
  format: function(lines) {
    const newLines = [];
    let foundHeader = false;

    // Find the header line and process transactions
    lines.forEach((line, i) => {
      if (!line.trim()) return;

      // Skip lines until we find the header
      if (!foundHeader) {
        if (line.includes("Transaction Date,Value Date,Statement Code,Reference,Debit Amount,Credit Amount")) {
          foundHeader = true;
          newLines.push("Date,Payee,Outflow,Inflow,Memo");
        }
        return;
      }

      // Process transaction lines
      const columns = line.split(",");
      if (columns.length < 9) return; // Skip invalid lines

      const date = this._formatDate(columns[0].trim());
      const statementCode = columns[2].trim();
      const reference = columns[3].trim();
      const debitAmount = columns[4].trim();
      const creditAmount = columns[5].trim();
      const clientRef = columns[6].trim();
      const additionalRef = columns[7].trim();
      const miscRef = columns[8].trim();

      // Combine references for payee/memo
      let payee = reference;
      let memo = "";
      // if payee is blank, set to "DBS Interest" if statement code is ATINT
      if (!payee && statementCode === "ATINT") {
        payee = "DBS Interest";
      }
      
      if (clientRef) {
        payee = clientRef;
      }
      
      if (additionalRef || miscRef) {
        memo = [additionalRef, miscRef].filter(Boolean).join(" ");
      }

      // Format the line for YNAB
      newLines.push([
        date,
        `"${payee}"`,
        debitAmount || "",
        creditAmount || "",
        `"${memo}"`
      ].join(","));
    });

    return newLines;
  },

  /**
   * Format date from "DD MMM YYYY" to "DD/MM/YYYY"
   * @param {string} dateStr - The date string to format
   * @returns {string} - The formatted date string
   * @private
   */
  _formatDate: function(dateStr) {
    const months = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    const parts = dateStr.split(' ');
    if (parts.length !== 3) return dateStr;

    const day = parts[0].padStart(2, '0');
    const month = months[parts[1]] || parts[1];
    const year = parts[2];

    return `${day}/${month}/${year}`;
  }
};

// Export the formatter
window.DBSFormatter = DBSFormatter; 