/**
 * Citibank Formatter for YNAB CSV Formatter
 * Handles formatting of Citibank credit card statements for YNAB compatibility
 */

const CitibankFormatter = {
  /**
   * Format Citibank data for YNAB
   * @param {Array} lines - The lines to format
   * @returns {Array} - The formatted lines
   */
  format: function(lines) {
    const formattedLines = [];
    
    // Add header row
    formattedLines.push("Date,Payee,Outflow,Inflow,Memo");
    
    // Process each line
    lines.forEach(line => {
      if (!line.trim()) return;
      
      // Split the line and remove quotes
      const columns = line.split(",").map(col => col.replace(/^["']|["']$/g, ""));
      
      // Skip if we don't have enough columns
      if (columns.length < 4) return;
      
      // Parse the date
      const date = columns[0];
      if (!date.match(/^\d{2}\/\d{2}\/\d{4}$/)) return;
      
      // Clean the payee (remove trailing "SINGAPORE SG" or "SG")
      let payee = columns[1].trim();
      payee = payee.replace(/\s+(?:SINGAPORE\s+)?SG\s*$/i, "");
      
      // Determine if it's an outflow or inflow
      const amount = parseFloat(columns[2]);
      const isOutflow = amount < 0;
      
      // Format the line
      const formattedLine = [
        date,
        `"${payee}"`,
        isOutflow ? Math.abs(amount) : "",
        isOutflow ? "" : amount,
        "" // Empty memo field
      ].join(",");
      
      formattedLines.push(formattedLine);
    });
    
    return formattedLines;
  }
};

// Export the formatter
window.CitibankFormatter = CitibankFormatter; 