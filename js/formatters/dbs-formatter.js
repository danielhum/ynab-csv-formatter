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

    lines.forEach((line, i) => {
      if (line.trim().length === 0) return;

      if (i === 0) {
        newLines.push(["Date", "SKIP", "Outflow", "Inflow", "Payee", "Memo", "SKIP"]);
        return;
      }

      newLines.push(line);
    });

    return newLines;
  }
};

// Export the formatter
window.DBSFormatter = DBSFormatter; 