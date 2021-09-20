function formatAmex(lines) {
  newLines = [];
  if (lines[0].match(/^([0-2]\d|3[0-1])\//)) {
    newLines.push(["Date", "SKIP", "Outflow", "Payee", "Memo", "SKIP"]);
  }

  lines.forEach((line, i) => {
    if (!line.trim()) return;

    newLines.push(line);
  });

  return newLines;
}