/**
 * File utility functions for the YNAB CSV Formatter
 */

/**
 * Downloads a CSV file to the user's computer
 * @param {string} csv - The CSV content to download
 * @param {string} filename - The name of the file to download
 */
function downloadCSV(csv, filename = "download.csv") {
  const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  let csvURL = null;
  
  if (navigator.msSaveBlob) {
    csvURL = navigator.msSaveBlob(csvData, filename);
  } else {
    csvURL = window.URL.createObjectURL(csvData);
  }

  const tempLink = document.createElement('a');
  tempLink.href = csvURL;
  tempLink.setAttribute('download', filename);
  tempLink.click();
}

/**
 * Sanitizes a filename by removing the extension
 * @param {string} filename - The filename to sanitize
 * @returns {string} - The sanitized filename
 */
function sanitizeFilename(filename) {
  return filename.replace(/\.[^/.]+$/, "");
}

/**
 * Creates a YNAB-compatible filename
 * @param {string} originalFilename - The original filename
 * @returns {string} - The YNAB-compatible filename
 */
function createYNABFilename(originalFilename) {
  return `${sanitizeFilename(originalFilename)}.ynab.csv`;
}

// Export functions
window.FileUtils = {
  downloadCSV,
  sanitizeFilename,
  createYNABFilename
}; 