function parseXLSX(file) {
  let reader = new FileReader();
  reader.onload = function(evt) {
    let data = new Uint8Array(evt.target.result);
    let workbook = XLSX.read(data, { type: 'array' });
    let sheet = workbook.Sheets[workbook.SheetNames[0]];
    let accountMetas = {
      "uob_deposit" : {
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
      "uob_cc" : {
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
    }
    accountTypes = Object.keys(accountMetas);
    processed = []
    var accountType = null;
    var meta = null;
    for (i = 0; processed.length == 0; i++) {
      accountType = accountTypes[i];
      meta = accountMetas[accountType]
      h = meta["headers"]
      json = XLSX.utils.sheet_to_json(sheet, { header: h });
      processed = json.filter(function(row) {
        let date = Date.parse(row[meta["dateHeader"]]);
        let withdrawal = typeof row[meta["debitHeader"]] == "number";
        let deposit = typeof row[meta["creditHeader"]] == "number";

        return ((date && date != "NaN") && (withdrawal || deposit));
      });
      console.log(json);
      console.log(processed);
    }

    if (processed.length == 0) {
      alert("Couldn't parse file!");
      return;
    } else {
      console.log("type: " + accountType);
    }

    outData = [];
    processed.forEach(element => {
      let date = new Date(Date.parse(element[meta.dateHeader]));
      let formattedDate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
      let payee = element[meta.payeeHeader]
      if (payee.toLowerCase().includes("fee")) alert("Fee detected!");

      outData.push({
        "Date": formattedDate,
        "Payee": element[meta.payeeHeader],
        "Memo": "",
        "Outflow": element[meta.debitHeader],
        "Inflow": element[meta.creditHeader],
      })
    });
    console.log(outData);
    let outSheet = XLSX.utils.json_to_sheet(outData);
    let outWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(outWb, outSheet, "Sheet0");
    XLSX.writeFile(outWb, file.name + ".ynab.csv", { type: "csv" })
  }
  reader.readAsArrayBuffer(file);
}
