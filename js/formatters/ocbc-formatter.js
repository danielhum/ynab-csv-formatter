/**
 * OCBC Bank formatter for YNAB CSV Formatter
 */

const OCBCFormatter = {
  /**
   * Format OCBC bank statement lines for YNAB compatibility
   * @param {Array} lines - The lines to format
   * @returns {Array} - The formatted lines
   */
  format: function(lines) {
    let newLines = [];
    
    lines.forEach((line, i) => {
      if (line.startsWith(",,")) {
        // Handle continuation lines (memo details)
        const prevLine = newLines[newLines.length - 1].split(",");
        const { payee, memo } = this._processPayeeAndMemo(prevLine[2], line.substring(2));
        prevLine[2] = payee;
        prevLine[5] = memo;
        newLines[newLines.length - 1] = prevLine.join(",");
      } else if (i === 0) {
        // Add memo header to the first line
        newLines.push(line + ",Memo");
      } else if (line.length > 0) {
        // Process regular transaction lines
        line = this._processAmount(line);
        line = this._processCreditCardPayee(line);
        // Clean the line using the utility function
        line = DataUtils.cleanText(line);
        newLines.push(line + ","); // Add memo field
      }
    });
    
    return newLines;
  },

  /**
   * Process payee and memo information
   * @param {string} originalPayee - The original payee
   * @param {string} desc - The description
   * @returns {Object} - The processed payee and memo
   * @private
   */
  _processPayeeAndMemo: function(originalPayee, desc) {
    const regex1 = /^to (?<payee>.+) via PayNow-\w+ OTHR - (?<memo>.+)/mg;
    const regex2 = /^[A-Z]+( -)? (?<memo>.+) (to|from) (?<payee>.+) via PayNow/mg;
    const regex3 = /^[A-Z]+( -)? (?<memo>.+) (to|from) (?<payee>.+)/mg;
    const regex4 = /^SALA \d+ from (?<payee>.+)/mg;
    
    let payee = "";
    let memo = "";
    
    switch(originalPayee) {
      case "PAYMENT/TRANSFER":
      case "FAST PAYMENT":
      case "FUND TRANSFER":
        let match = regex1.exec(desc);
        if (match === null) {
          match = regex2.exec(desc);
        }
        if (match === null) {
          match = regex3.exec(desc);
        }
        if (match === null) {
          match = regex4.exec(desc);
        }
        if (match === null) {
          console.warn("Payee match failed: " + desc);
          break;
        }
        if (match.groups.payee) payee = `"${match.groups.payee}"`;
        if (match.groups.memo) memo = `"${match.groups.memo}"`;
        break;
      case "GIRO":
      default:
        payee = `"${originalPayee} ${desc}"`;
        memo = "";
    }
    
    return { payee, memo };
  },

  /**
   * Process amount formatting
   * @param {string} line - The line to process
   * @returns {string} - The processed line
   * @private
   */
  _processAmount: function(line) {
    const match = line.match(/"[0-9,\.]{5,}"/); // match minimum 5 eg. '"1,000"'
    if (match !== null) {
      const priceQuot = match[0];
      line = line.replace(priceQuot, priceQuot.replace(",", ""));
    }
    return line;
  },

  /**
   * Process credit card payee information
   * @param {string} line - The line to process
   * @returns {string} - The processed line
   * @private
   */
  _processCreditCardPayee: function(line) {
    const regex = /^(?<date>.+,)-\d+ /;
    const match = regex.exec(line);
    if (match === null) {
      return line;
    }
    return line.replace(regex, `${match.groups.date}`);
  }
};

// Export the formatter
window.OCBCFormatter = OCBCFormatter; 