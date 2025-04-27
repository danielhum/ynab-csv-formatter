/**
 * Data utility functions for the YNAB CSV Formatter
 */

/**
 * Cleans text data by removing newlines and squishing whitespace
 * @param {string} text - The text to clean
 * @returns {string} - The cleaned text
 */
function cleanText(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Cleans all string values in a data object
 * @param {Object} data - The data object to clean
 */
function cleanData(data) {
  if (Array.isArray(data)) {
    data.forEach(row => {
      if (typeof row === 'object') {
        Object.keys(row).forEach(key => {
          row[key] = cleanText(row[key]);
        });
      }
    });
  } else if (typeof data === 'object') {
    Object.keys(data).forEach(key => {
      data[key] = cleanText(data[key]);
    });
  }
}

/**
 * Processes data for YNAB compatibility
 * @param {Array} data - The data to process
 * @returns {string} - The processed CSV data
 */
function processData(data) {
  // Clean all string values in the data
  cleanData(data);
  
  return Papa.unparse(data);
}

/**
 * Handles parsing errors and data validation
 * @param {Object} results - The parsing results
 * @returns {Object} - The processed data and errors
 */
function handleParseCSVResults(results) {
  const data = results.data;
  const errors = results.errors.filter(error => {
    if (error.code === "TooFewFields" && error.row === data.length - 1) {
      data.pop();
      return false;
    } else {
      return true;
    }
  });

  // Validate data
  data.forEach(el => {
    const payee = el["Payee"];
    const outflow = el["Outflow"];
    const payment = typeof outflow === "number" && outflow > 0;
    
    if (payee === null) {
      console.warn("Null payee encountered");
    } else if (payee.match(/\bfee\b/i) !== null && payment) {
      console.warn("Fee detected!");
    }
  });

  return { data, errors };
}

/**
 * Removes extra lines before the header
 * @param {Array} lines - The lines to process
 * @param {string} headerStartsWith - The header identifier
 */
function removeExtraLines(lines, headerStartsWith) {
  if (!headerStartsWith) return;

  let line = lines[0];
  while (!line.startsWith(headerStartsWith)) {
    lines.shift();
    line = lines[0];
  }
}

// Export functions
window.DataUtils = {
  processData,
  handleParseCSVResults,
  removeExtraLines,
  cleanText,
  cleanData
}; 