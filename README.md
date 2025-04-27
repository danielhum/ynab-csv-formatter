# YNAB CSV Formatter

A web-based tool to convert bank statements from various banks into YNAB-compatible CSV format.

## Supported Banks

- OCBC (deposit accounts and credit cards)
- Standard Chartered
- American Express
- DBS
- UOB (deposit accounts and credit cards)

## Usage

1. Open `ynab-csv-formatter.html` in a web browser
2. Select your bank from the dropdown menu
3. Upload your bank statement (CSV or XLSX format)
4. The tool will automatically convert and download the formatted CSV file

## Project Structure

- `ynab-csv-formatter.html` - Main HTML file with the user interface
- `js/` - JavaScript modules
  - `formatters/` - Bank-specific formatters
  - `parsers/` - CSV and XLSX parsers
  - `utils/` - Utility functions
- `lib/` - Third-party libraries

## Development

This project uses vanilla JavaScript and doesn't require any build process.
 
A simple utility to format CSV/XLSX files downloaded from Singapore banks into YNAB-compatible formats, since YNAB doesn't support auto-import for local banks.

Built as 100% frontend to keep your data safe.

### Supported banks

- OCBC
- UOB
- Standard Chartered
- American Express
