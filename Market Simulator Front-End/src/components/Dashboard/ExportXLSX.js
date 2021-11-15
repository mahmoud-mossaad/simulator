import XLSX from "./XLSX";

function xtos(sdata) {
  var out = XLSX.utils.book_new();
  sdata.forEach(function (xws) {
    var aoa = [[]];
    var rowobj = xws.rows;
    for (var ri = 0; ri < rowobj.len; ++ri) {
      var row = rowobj[ri];
      if (!row) continue;
      aoa[ri] = [];
      Object.keys(row.cells).forEach(function (k) {
        var idx = +k;
        if (isNaN(idx)) return;
        aoa[ri][idx] = row.cells[k].text;
      });
    }
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(out, ws, xws.name);
    ws["!merges"] = xws.merges.map((range) => XLSX.utils.decode_range(range));
    // add f for formula if starts with =
    Object.keys(ws).forEach((cell) => {
      var cellIndex = XLSX.utils.decode_cell(cell);
      //console.log(rowobj[cellIndex.r][cellIndex.c]);
      var drow = rowobj[cellIndex.r];
      var dcell = drow && drow.cells && drow.cells[cellIndex.c];
      console.log(drow, dcell);
      var cellObj = ws[cell];
      if (cellObj && cellObj.v && cellObj.v[0] === "=") {
        cellObj.f = cellObj.v;
        delete cellObj.v;
      }
    });
  });
  return out;
}

function exportSheet(sheet, filename) {
  /* build workbook from the grid data */
  var new_wb = xtos(sheet.getData());
  console.log(new_wb);
  //console.log(XLSX.utils.sheet_to_json(new_wb.Sheets.sheet2));
  /* generate download */
  try {
    XLSX.writeFile(new_wb, filename || "Export.xlsx");
  } catch (e) {
    console.log(e);
  }
}

export default exportSheet;
