import writeXlsxFile from "https://cdn.jsdelivr.net/npm/write-excel-file@1.4.24/+esm";

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

export async function exportExcelTable(tableData, fileName) {
  const schema = Object.keys(tableData[0] || []).map((column) => ({
    column,
    value: (obj) => obj[column],
    width: 30, 
  }));

  await writeXlsxFile(tableData, {
    schema,
    fileName,
  });
}
