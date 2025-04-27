/**
 * UOB Bank formatter for YNAB CSV Formatter
 */

const UOBFormatter = {
  /**
   * Format UOB bank statement lines for YNAB compatibility
   * @param {Array} lines - The lines to format
   * @returns {Array} - The formatted lines
   */
  format: function(lines) {
    let newLines = [];
    
    lines.forEach((line, i) => {
      if (i === 0) {
        // Add header line
        newLines.push(["Date", "Payee", "Outflow", "Inflow", "Memo"]);
        return;
      }
      
      if (!line.trim()) return;
      
      // Clean the line using the utility function
      line = DataUtils.cleanText(line);
      
      // Split the line into columns
      const columns = line.split(",");
      
      // Ensure we have the minimum required columns
      if (columns.length < 4) {
        console.warn(`Warning: Line ${i + 1} has insufficient columns`);
        return;
      }
      
      // Format the line for YNAB
      const date = columns[0];
      const description = columns[1];
      const withdrawal = columns[2] || "";
      const deposit = columns[3] || "";
      const memo = columns[4] || "";
      
      newLines.push([date, description, withdrawal, deposit, memo]);
    });
    
    return newLines;
  }
};

// Export the formatter
window.UOBFormatter = UOBFormatter; 