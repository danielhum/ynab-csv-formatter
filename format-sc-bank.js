// handles OCBC non-standard content (deposit accounts)
function formatSCBank(lines, skipFirstLine = true) {
  let newLines = [];
  if (skipFirstLine) {
    newLines.push(lines.shift()); // header line
  }
  lines.forEach((line, i) => {
    line = line.trim(); // remove starting spaces
    if (!line || !line.match(/^([0-2]\d|3[0-1])\//)) {
      return; // discard empty or irrelevant lines
    }

    columnArray = line.split(",");

    let columnCount = columnArray.length
    if (columnCount > 4) {
      columnArray = mergeCommasInPayee(columnArray);
    } else if (columnCount < 4) {
      console.log(`WARNING: line ${i+1} has ${columnCount} columns.`);
    }

    columnArray = sanitizeOutflow(columnArray);

    newLines.push(columnArray.join(","));
  });
  return newLines;
}

function mergeCommasInPayee(cols) {
  return [cols[0],
    cols.slice(1, cols.length-2).join("_"),
    ].concat(cols.slice(cols.length-2));
}

function sanitizeOutflow(cols) {
  let outflow = cols[cols.length-1];
  if (!outflow.startsWith("SGD")) console.log("WARNING: outflow not SGD");

  let outflowAmount = null;
  outflow = outflow.split(" ").map(s => s.trim());
  if (outflow[2] == "CR") {
    outflowAmount = "-" + outflow[1];
  } else {
    outflowAmount = outflow[1];
  }
  return cols.slice(0, cols.length-1).concat([outflowAmount]);
}