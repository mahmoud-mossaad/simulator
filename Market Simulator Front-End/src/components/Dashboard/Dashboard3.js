import React,  {useState, useEffect} from 'react';
import {removeUserSession, getToken } from '../../Utils/Common';
import { makeStyles } from '@material-ui/styles';
import axios from 'axios';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';


function getPercentage(params) {
    const valueFormatted = (params.getValue(params.id, 'firstNumber')/params.getValue(params.id, 'number')).toLocaleString();
    return  `${valueFormatted} %`;
  }



const useStyles = makeStyles({
    root: {
      '& .super-app-theme--header': {
        backgroundColor: 'rgba(63, 81, 181, 1)',
        flexGrow: 1,
      },
      title: {
        flexGrow: 1,
      },
      bool: {
        width: '100%',    
        textAlign: 'center',
      },
      reason: {
        textAlign: 'center',
      },    
    },
  });

  function disable(id, disabled) {
    document.querySelector(id).disabled = disabled;
  }
  function setValue(id, value) {
    document.querySelector(id).value = value;
  }
  function getRows() {
    return Array.apply(null, Array(100)).map(function (_, i) {
      return {
        a: 'a-' + i,
        b: 'b-' + i,
        c: 'c-' + i,
        d: 'd-' + i,
        e: 'e-' + i,
        f: 'f-' + i,
        g: 'g-' + i,
        h: 'h-' + i,
      };
    });
  }


function Dashboard(props) {
  const classes = useStyles();
  const [rowData, setRowData] = useState([]);
  const [file, setFile] = useState('');
  const [filename, setFilmename] = useState('Upload Study')
  const [value, setValue] = useState([]);
  // turns OFF row hover, it's on by default
  const suppressRowHoverHighlight = false;
  // turns ON column hover, it's off by default
  const columnHoverHighlight = false;
  const enableRangeSelection = true;
  const enableFillHandle = true;
  
const [gridApi, setGridApi] = useState(null);
const [gridColumnApi, setGridColumnApi] = useState(null);

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onFirstDataRendered = () => {
    //setValue('#undoInput', 0);
    //disable('#undoInput', true);
    //disable('#undoBtn', true);
    //setValue('#redoInput', 0);
    //disable('#redoInput', true);
    //disable('#redoBtn', true);
  };


  const editPrice = e  => {
    setValue(e.target.value)
  }

  const handlePrice = e => {
    axios.get("http://127.0.0.1:5000/editsopbyvalue", { params: { "value": value }})
      .then((res) => {
        console.log(res.data)
        setRowData(res.data)
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
        console.log(res.data)
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
    axios.get('http://127.0.0.1:5000/getstudy', {
      })
      .then((res) => {
        console.log(res.data)
        setRowData(res.data)

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
        <div className="ag-theme-alpine" style={{height: 600, width: 1500}}>
           <AgGridReact
           suppressRowHoverHighlight={suppressRowHoverHighlight}
           columnHoverHighlight={columnHoverHighlight}
           rowData={rowData}
           enableRangeSelection={enableRangeSelection}
           enableFillHandle={enableFillHandle}
           undoRedoCellEditing={true}
           undoRedoCellEditingLimit={5}
           enableCellChangeFlash={true}
           onGridReady={onGridReady}
           onFirstDataRendered={onFirstDataRendered}>
               <AgGridColumn field="SKUs" sortable={ true } filter={ true } editable={ true } width={700}></AgGridColumn>
               <AgGridColumn field="SOP"  sortable={ true } filter={ true } editable={ true } width={500}></AgGridColumn>
               <AgGridColumn field="Changed SOP"  sortable={ true } filter={ true } editable={ true } width={500}></AgGridColumn>

           </AgGridReact>
       </div>
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