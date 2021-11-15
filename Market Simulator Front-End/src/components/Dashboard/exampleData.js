var data = {
  name: "sheet2",
  freeze: "A1",
  styles: [
    {
      border: {
        bottom: ["thin", "#000"],
        top: ["thin", "#000"],
        left: ["thin", "#000"],
        right: ["thin", "#000"]
      }
    },
    {
      border: {
        bottom: ["thin", "#000"],
        top: ["thin", "#000"],
        left: ["thin", "#000"],
        right: ["thin", "#000"]
      },
      font: { bold: true }
    },
    { font: { bold: true } },
    {
      border: {
        bottom: ["thin", "#000"],
        top: ["thin", "#000"],
        left: ["thin", "#000"],
        right: ["thin", "#000"]
      },
      font: { bold: true },
      align: "center"
    },
    { font: { bold: true }, align: "center" }
  ],
  merges: ["A1:C1"]
};

export default data;
