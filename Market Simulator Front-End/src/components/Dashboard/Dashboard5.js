import React,  {useState, useEffect} from 'react';
import {removeUserSession, getToken } from '../../Utils/Common';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import Spreadsheet from "x-data-spreadsheet";
import "x-data-spreadsheet/dist/xspreadsheet.css";

function Dashboard(props) {
  const [file, setFile] = useState('');
  const [filename, setFilmename] = useState('Upload Study')
  const [rowData, setRowData] = useState([]);
  const [value, setValue] = useState([]);
  const [read, setRead] = useState(false);
  var rows = {
    rows: {
        "0": {
          cells: {
            "0": { text: "SKUs" },
            "1": { text: "SOP" },
            "2": { text: "Changed SOP" }
          }
        },
        "1": {
          cells: {
            "0": { text: "0" },
            "1": { text: "=A2*2" },
            "2": { text: "=B2*2" }
          }
        },
        "2": {
          cells: {
            "0": { text: "=A2*2" },
            "1": { text: "=A3*2" },
            "2": { text: "=B3*2" }
          }
        },
        "3": {
          cells: {
            "0": { text: "=A3*2" },
            "1": { text: "=A4*2" },
            "2": { text: "=B4*2" }
          }
        },
        "4": {
          cells: {
            "0": { text: "=A4*2" },
            "1": { text: "=A5*2" },
            "2": { text: "=B5*2" }
          }
        },
        "5": {
          cells: {
            "0": { text: "=A5*2" },
            "1": { text: "=A6*2" },
            "2": { text: "=B6*2" }
          }
        },
        "6": {
          cells: {
            "0": { text: "=A6*2" },
            "1": { text: "=A7*2" },
            "2": { text: "=B7*2" }
          }
        },
        "7": {
          cells: {
            "0": { text: "=A7*2" },
            "1": { text: "=A8*2" },
            "2": { text: "=B8*2" }
          }
        },
        "8": {
          cells: {
            "0": { text: "=A8*2" },
            "1": { text: "=A9*2" },
            "2": { text: "=B9*2" }
          }
        },
        "9": {
          cells: {
            "0": { text: "=A9*2" },
            "1": { text: "=A10*2" },
            "2": { text: "=B10*2" }
          }
        },
        len: 100
      },
      cols: { len: 26 },
      validations: [],
      autofilter: {}
  }

  // turns OFF row hover, it's on by default
  

  const editPrice = e  => {
    setValue(e.target.value)
  }

  const handlePrice = e => {
    axios.get("http://127.0.0.1:5000/editsopbyvalue", { params: { "value": value }})
      .then((res) => {
        console.log(res.data)
        //setRowData(res.data)
      }
      )

  }


  const handleBrowse = e  => {
    setFile(e.target.files[0]);
    setFilmename(e.target.files[0].name)
  }
 

  const handleUpload = e  => {
    const formData = new FormData();
    formData.append('myFile', file, filename)

    axios.post("http://127.0.0.1:5000/getsop", formData)
      .then((res) => {
        console.log(res.data[0]["SKUs"])
        setRowData(res.data)
      }
      )
  }

  // handle click event of logout button
  const handleLogout = () => {
    removeUserSession();
    props.history.push('/login');
  }
  useEffect(() => {
    const s = new Spreadsheet(document.getElementById("x-spreadsheet"));
    // data validation
    s.validate();
    s.loadData(rows)
    axios.get('http://127.0.0.1:5000/getstudy', {
      })
      .then((res) => {
        console.log(res.data)
        //setRowData(res.data)

      })
      .catch((error) => {
        console.error(error)
      })
    }, [])
 
  return (
    <div>
        
        <div style= {{padding:10}}>
            <input className= "custom-file-input" type="file" variant="contained" color="primary" onChange = {handleBrowse}  style= {{padding:10}}/>
            <Button variant="contained" color="primary" onClick={handleUpload} value="handle upload" style= {{padding:10}}>
            Upload
            </Button>
            <input
            type="text"
            placeholder="0"
            value={value}
            onChange={editPrice}
         />
         <Button variant="contained" color="primary" onClick={handlePrice}  style= {{padding:10}}>
            Edit SOP
         </Button>
        </div>
        <div id="x-spreadsheet"></div>
        <div style= {{padding:10}}>
        </div>
        <div style= {{padding:10}}>
            <Button variant="contained" color="primary" onClick={handleLogout} value="load numbers" style= {{padding:10}}>
            Logout
            </Button>
        </div>
    </div>
  );
}
 
export default Dashboard;