/**
 * Standard Chartered Bank formatter for YNAB CSV Formatter
 */

const SCBankFormatter = {
  /**
   * Format Standard Chartered bank statement lines for YNAB compatibility
   * @param {Array} lines - The lines to format
   * @param {boolean} skipFirstLine - Whether to skip the first line (header)
   * @returns {Array} - The formatted lines
   */
  format: function(lines, skipFirstLine = true) {
    let newLines = [];
    
    if (skipFirstLine) {
      newLines.push(lines.shift()); // header line
    }
    
    lines.forEach((line, i) => {
      line = line.trim(); // remove starting spaces
      
      if (!line || !line.match(/^([0-2]\d|3[0-1])\//)) {
        return; // discard empty or irrelevant lines
      }

      let columnArray = line.split(",");
      const columnCount = columnArray.length;
      
      if (columnCount > 4) {
        columnArray = this._mergeCommasInPayee(columnArray);
      } else if (columnCount < 4) {
        console.warn(`WARNING: line ${i+1} has ${columnCount} columns.`);
      }

      columnArray = this._sanitizeOutflow(columnArray);
      newLines.push(columnArray.join(","));
    });
    
    return newLines;
  },

  /**
   * Merge commas in payee field
   * @param {Array} cols - The column array
   * @returns {Array} - The processed column array
   * @private
   */
  _mergeCommasInPayee: function(cols) {
    return [
      cols[0],
      cols.slice(1, cols.length-2).join("_"),
    ].concat(cols.slice(cols.length-2));
  },

  /**
   * Sanitize outflow amount
   * @param {Array} cols - The column array
   * @returns {Array} - The processed column array
   * @private
   */
  _sanitizeOutflow: function(cols) {
    let outflow = cols[cols.length-1];
    if (!outflow.startsWith("SGD")) {
      console.warn("WARNING: outflow not SGD");
    }

    let outflowAmount = null;
    outflow = outflow.split(" ").map(s => s.trim());
    
    if (outflow[2] === "CR") {
      outflowAmount = "-" + outflow[1];
    } else {
      outflowAmount = outflow[1];
    }
    
    return cols.slice(0, cols.length-1).concat([outflowAmount]);
  }
};

// Export the formatter
window.SCBankFormatter = SCBankFormatter; 