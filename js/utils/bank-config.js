/**
 * Bank configuration for the YNAB CSV Formatter
 */

const BankConfig = {
  /**
   * Get the header identifier for a specific bank
   * @param {string} bank - The bank identifier
   * @returns {string} - The header identifier
   */
  getHeaderIdentifier: function(bank) {
    switch (bank) {
      case "ocbc":
      case "ocbc_cc":
        return "Transaction date";
      case "sc_bank":
        return "Date";
      case "dbs":
        return "Transaction Date";
      default:
        return "";
    }
  },

  /**
   * Get the account metadata for a specific bank
   * @param {string} bank - The bank identifier
   * @returns {Object} - The account metadata
   */
  getAccountMeta: function(bank) {
    const accountMetas = {
      "ocbc": {
        "dateHeader": "Transaction date",
        "payeeHeader": "Description",
        "debitHeader": "Withdrawals(SGD)",
        "creditHeader": "Deposits(SGD)",
        "memoHeader": "Memo"
      },
      "ocbc_cc": {
        "dateHeader": "Transaction date",
        "payeeHeader": "Description",
        "debitHeader": "Withdrawals (SGD)",
        "creditHeader": "Deposits (SGD)",
        "memoHeader": "Memo"
      },
      "amex_cc": {
        "dateHeader": "Date",
        "payeeHeader": "Description",
        "debitHeader": "Amount",
        "creditHeader": "",
        "memoHeader": ""
      },
      "sc_bank": {
        "dateHeader": "Date",
        "payeeHeader": "DESCRIPTION",
        "debitHeader": "SGD Amount",
        "creditHeader": "",
        "memoHeader": "Foreign Currency Amount"
      },
      "dbs": {
        "dateHeader": "Date",
        "payeeHeader": "Payee",
        "debitHeader": "Outflow",
        "creditHeader": "Inflow",
        "memoHeader": "Memo"
      },
      "uob_deposit": {
        "headers": [
          "Transaction Date",
          "Transaction Description",
          "Withdrawal",
          "Deposit",
          "Available Balance"
        ],
        "dateHeader": "Transaction Date",
        "payeeHeader": "Transaction Description",
        "debitHeader": "Withdrawal",
        "creditHeader": "Deposit"
      },
      "uob_cc": {
        "headers": [
          "Transaction Date",
          "Posting Date",
          "Description",
          "Foreign Currency Type",
          "Transaction Amount(Foreign)",
          "Local Currency Type",
          "Transaction Amount(Local)",
        ],
        "dateHeader": "Transaction Date",
        "payeeHeader": "Description",
        "debitHeader": "Transaction Amount(Local)",
        "creditHeader": null
      }
    };

    return accountMetas[bank] || null;
  },

  /**
   * Transform header to YNAB format
   * @param {string} header - The original header
   * @param {Object} meta - The account metadata
   * @returns {string} - The transformed header
   */
  transformHeader: function(header, meta) {
    if (!meta) return header;

    switch(header) {
      case meta["dateHeader"]:
        return "Date";
      case meta["payeeHeader"]:
        return "Payee";
      case meta["debitHeader"]:
        return "Outflow";
      case meta["creditHeader"]:
        return "Inflow";
      case meta["memoHeader"]:
        return "Memo";
      default:
        return "unknown_header";
    }
  }
};

// Export the configuration
window.BankConfig = BankConfig; 