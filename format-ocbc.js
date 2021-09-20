// handles OCBC non-standard content (deposit accounts)
// TODO: there seems to be some inaccuracy in final cleared balance.
//       possibly some transactions are being badly formatted 
function formatOCBC(lines) {
  let newLines = [];
  lines.forEach((line, i) => {
    if (line.startsWith(",,")) {
      var prevLine = newLines[newLines.length-1].split(",");
      const {payee, memo} = ocbcProcessPayeeAndMemo(prevLine[2], line.substring(2));
      prevLine[2] = payee
      prevLine[5] = memo
      newLines[newLines.length-1] = prevLine.join(",");
    } else if (i == 0) {
      newLines.push(line + ",Memo"); // add memo header
    } else if (line.length > 0) {
      match = line.match(/"[0-9,\.]+"/)
      if (match != null) {
        priceQuot = line.match(/"[0-9,\.]+"/)[0]
        line = line.replace(priceQuot, priceQuot.replace(",",""));
      }
      newLines.push(line + ","); // add memo field 
    }
  });
  return newLines;
}

function ocbcProcessPayeeAndMemo(originalPayee, desc) {
  const regex1 = /^to (?<payee>.+) via PayNow-\w+ OTHR - (?<memo>.+)/mg;
  const regex2 = /^OTHR( -)? (?<memo>.+) (to|from) (?<payee>.+) via PayNow/mg;
  const regex3 = /^OTHR( -)? (?<memo>.+) (to|from) (?<payee>.+)/mg;
  var payee = "";
  var memo = "";
  switch(originalPayee) {
    case "PAYMENT/TRANSFER":
    case "FAST PAYMENT":
    case "FUND TRANSFER":
      let match = regex1.exec(desc);
      if (match == null) {
        match = regex2.exec(desc);
      }
      if (match == null) {
        match = regex3.exec(desc);
      }
      if (match.groups.payee) payee = `"${match.groups.payee}"`;
      if (match.groups.memo) memo = `"${match.groups.memo}"`;
      break;
    case "GIRO":
    default:
      payee = `"${originalPayee} ${desc}"`
      memo = ""
  }
  return {
    payee: payee,
    memo: memo
  }
}

