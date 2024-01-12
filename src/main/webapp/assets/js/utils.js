import writeXlsxFile from "./lib/write-excel-file.js"

export function isUndefined(value, undefinedValues = [null, undefined, ""]) {
  return undefinedValues.includes(value);
}

export function asNumericValues(data) {
  return data.map((row) => {
    const newRow = {};
    for (let key in row) {
      newRow[key] = asNumber(row[key]);
    }
    return newRow;
  });
}

export function asNumber(value) {
  if (typeof value === "string") {
    const number = parseFloat(value);
    if (!isNaN(number)) {
      return number;
    }
  }
  return value;
}

export async function query(url, params = {}) {
  const query = new URLSearchParams(params);
  const response = await fetch(url + "?" + query.toString());
  return await response.json();
}

export function getColumnTypes(tableData) {
  const firstRow = tableData[0] || {};
  const columnTypes = {};
  for (let key in firstRow) {
    columnTypes[key] = typeof firstRow[key] === "number" ? Number : String;
  }
  return columnTypes;
}

export async function exportExcelTable(tableData, fileName) {
  const columnTypes = getColumnTypes(tableData);
  const schema = Object.keys(tableData[0] || []).map((column) => ({
    column,
    value: (obj) => obj[column],
    type: columnTypes[column],
    width: 30,
  }));

  await writeXlsxFile(tableData, {
    schema,
    fileName,
  });
}
