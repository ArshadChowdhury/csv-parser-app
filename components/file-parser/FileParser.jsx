import { useState } from "react";
import BarChart from "./BarChart";

const FileParser = ({ setFormData }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [hasUploadedCSVFile, setHasUploadedCSVFile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ labels: [], data: [] }],
  });
  console.log(chartData);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setErrorMessage("");
      setFormData({
        max_X: "",
        min_X: "",
        max_Y: "",
        min_Y: "",
        max_Z: "",
        min_Z: "",
      });
      setHasUploadedCSVFile(false);
      return;
    }

    if (file.type === "text/csv") {
      setLoading(true);
      setHasUploadedCSVFile(true);
      setErrorMessage("");
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        let arrObject = [];
        let lines = reader.result?.split("\n");
        let headers = lines[0].split(",");

        for (let i = 1; i < lines.length; i++) {
          let rowData = lines[i].split(",");
          arrObject[i] = {};
          for (let j = 0; j < rowData.length; j++) {
            arrObject[i][headers[j]] = rowData[j];
          }
        }

        const x = [];
        const y = [];
        const z = [];

        arrObject.map((element) => {
          element.X && x.push(parseFloat(element.X));
          element.Y && y.push(parseFloat(element.Y));
          element.Z && z.push(parseFloat(element.Z));
        });
        const getData = localStorage.getItem("project-data");
        const data = JSON.parse(getData);
        const values = {
          max_X: Math.max(...x),
          min_X: Math.min(...x),
          max_Y: Math.max(...y),
          min_Y: Math.min(...y),
          max_Z: Math.max(...z),
          min_Z: Math.min(...z),
        };
        console.log(values);
        setFormData({
          ...values,
        });
        const payload = { ...data, ...values };
        console.log(payload);
        localStorage.setItem("project-data", JSON.stringify(payload));
        setChartData({
          labels: [payload.max_X],
          datasets: [
            {
              axis: "y",
              label: "Maximum X value",
              data: [payload.max_X],
            },
          ],
        });
      };

      reader.onerror = () => {
        console.log("file error", reader.error);
      };

      setLoading(false);
    } else {
      setErrorMessage("Wrong file format ! Please upload a CSV file");
      return;
    }
  };

  return (
    <>
      {hasUploadedCSVFile && <BarChart chartData={chartData} />}
      <label htmlFor="file">Upload a CSV file</label>
      <input id="file" type="file" onChange={handleFileChange} />
      {loading && "Loading..."}
      <p className="text-red-800">{errorMessage.length > 0 && errorMessage}</p>
    </>
  );
};

export default FileParser;
