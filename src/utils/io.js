import { GoogleAuth } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";


export const serviceAccountAuth = new GoogleAuth({
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
  ],
});
export const readGoogleSheet = async (sheetId, sheetIndex, schema) => {
  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
  await doc.loadInfo();
  const _data = await doc.sheetsByIndex[sheetIndex].getRows();
  const data = [];
  for (const _row of _data) {
    const row = {};
    for (const [colName, colProps] of Object.entries(schema)) {
      const { type, sheetName, optional } = colProps;
      // "field_name" to "Field Name"
      const _colName = sheetName
        ? sheetName
        : colName
            .replaceAll("id", "ID") // special case for ID
            .split("_")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ");
      const val = _row.get(_colName);
      row[colName] = val;

    }
    data.push(row);
  }
  return data;
};
