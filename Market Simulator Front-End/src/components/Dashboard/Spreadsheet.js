import React from "react";
//import XSpreadsheet from "x-data-spreadsheet";
import "x-data-spreadsheet/dist/xspreadsheet.css";
import XSpreadsheet from "../spreadsheet/src";
import ExportXLSX from "./ExportXLSX";

export default function Spreadsheet(props) {
  const sheetEl = React.useRef(null);
  const sheetRef = React.useRef(null);
  const [state, setState] = React.useState(props.data || {});
  React.useEffect(() => {
    const element = sheetEl.current;
    const sheet = new XSpreadsheet("#x-spreadsheet-demo", {
      view: {
        height: () =>
          (element && element.clientHeight) ||
          document.documentElement.clientHeight,
        width: () =>
          (element && element.clientWidth) ||
          document.documentElement.clientWidth
      },
      ...props.options
    })
      .loadData(state) // load data
      .change((data) => {
        setState(data);
      });

    // console.log(sheet.sheet.editor.formulas);
    // sheet.sheet.editor.formulas.push({
    //   key: "TEST",
    //   title: "TEST",1
    //   render: () => 1234
    // });

    sheetRef.current = sheet;
    return () => {
      element.innerHTML = "";
    };
  }, [props.options]);
  return (
    <>
      <button onClick={() => ExportXLSX(sheetRef.current)}>export</button>
      <div
        style={{ height: props.height || "100%", width: props.width || "100%" }}
        id="x-spreadsheet-demo"
        ref={sheetEl}
      ></div>
      {JSON.stringify(state)}
    </>
  );
}
