/**
 * American Express formatter for YNAB CSV Formatter
 */

const AmexFormatter = {
  /**
   * Format American Express statement lines for YNAB compatibility
   * @param {Array} lines - The lines to format
   * @returns {Array} - The formatted lines
   */
  format: function(lines) {
    const newLines = [];
    
    if (lines[0].match(/^([0-2]\d|3[0-1])\//)) {
      newLines.push(["Date", "SKIP", "Outflow", "Payee", "Memo", "SKIP"]);
    }

    lines.forEach((line) => {
      if (!line.trim()) return;
      newLines.push(line);
    });

    return newLines;
  }
};

// Export the formatter
window.AmexFormatter = AmexFormatter; 