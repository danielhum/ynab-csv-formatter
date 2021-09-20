// dependencies (load these first):
//   1. format-ocbc.js 
//   2. format-sc-bank.js 
//   2. format-amex.js 

function sanitizeAndParseCSV(file, bank) {
  const reader = new FileReader();
  reader.onload = (event) => {
    let lines = event.target.result.split(/\r\n|\n/);
    let headerStartsWith = function() {
      switch (bank) {
        case "ocbc":
          return "Transaction date";
        case "sc_bank":
          return "Date";
        default:
          return "";
      }
    }
    removeExtraLines(lines, headerStartsWith());
    let newLines = formatBankCSV(lines, bank);
    let output = newLines.join("\n");
    let filename = file.name.replace(/\.[^/.]+$/, ".ynab.csv");
    parseCSV(output, bank, filename);
  }
  reader.readAsText(file);
  return;
}

function removeExtraLines(lines, headerStartsWith) {
  if (headerStartsWith == "" || headerStartsWith == undefined) return;

  let line = lines[0];
  while (!line.startsWith(headerStartsWith)) {
    lines.shift();
    line = lines[0];
  }
}

function formatBankCSV(lines, bank) {
  switch (bank) {
    case "ocbc":
      return formatOCBC(lines);
    case "sc_bank":
      return formatSCBank(lines);
    case "amex_cc":
      return formatAmex(lines);
    default:
      return lines;
  }
}

function parseCSV(csvFile, bank, outFilename = "download.csv") {
  let accountMetas = {
    "ocbc" : {
      "dateHeader": "Transaction date",
      "payeeHeader": "Description",
      "debitHeader": "Withdrawals (SGD)",
      "creditHeader": "Deposits (SGD)",
      "memoHeader": "Memo"
    },
    "amex_cc" : {
      "dateHeader": "Date",
      "payeeHeader": "Payee",
      "debitHeader": "Outflow",
      "creditHeader": "",
      "memoHeader": "Memo"
    },
    "sc_bank" : {
      "dateHeader": "Date",
      "payeeHeader": "DESCRIPTION",
      "debitHeader": "SGD Amount",
      "creditHeader": "",
      "memoHeader": "Foreign Currency Amount"
    }
  }
  meta = accountMetas[bank];
  Papa.parse(csvFile, {
    delimiter: ",",
    comments: "#",
    dynamicTyping: true,
    header: true,
    transformHeader: function(header, _idx) {
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
    },
    complete: function(results) {
      console.log("parse CSV results:");
      console.log(results);
      processed = handleParseCSVResults(results);
      if (processed.errors.length > 0) {
        alert("parsing error!");
        //return;
      }
      let csvOutputFile = processData(processed.data);
      downloadCSV(csvOutputFile, outFilename);
    }
  });
}

function handleParseCSVResults(results) {
  var data = results.data;
  var errors = results.errors.filter(error => {
    if(error.code == "TooFewFields" &&
        error.row == data.length-1) {
          data.pop();
          return false;
        } else {
          return true;
        }
  });
  //data.forEach(el => { el["Memo"] = "" });
  return { data: data, errors: errors };
}

function downloadCSV(csv, filename = "download.csv") {
  var csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  var csvURL =  null;
  if (navigator.msSaveBlob)
  {
    csvURL = navigator.msSaveBlob(csvData, filename);
  }
  else
  {
    csvURL = window.URL.createObjectURL(csvData);
  }

  var tempLink = document.createElement('a');
  tempLink.href = csvURL;
  tempLink.setAttribute('download', filename);
  tempLink.click();
}

function processData(data) {
  // console.log(data);
  return Papa.unparse(data);
}