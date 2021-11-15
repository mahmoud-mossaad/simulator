import React,  {useState, useEffect} from 'react';
import { DataGrid } from '@material-ui/data-grid';
import {removeUserSession, getToken } from '../../Utils/Common';
import { makeStyles } from '@material-ui/styles';
import axios from 'axios';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

function getPercentage(params) {
    const valueFormatted = (params.getValue(params.id, 'firstNumber')/params.getValue(params.id, 'number')).toLocaleString();
    return  `${valueFormatted} %`;
  }

const columns = [
    {
      field: 'firstNumber',
      headerName: 'First Number ( Please insert it )',
      width: 400,
      type: 'number',
      editable: true,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      font: 'white'
    },
    {
      field: 'number',
      headerName: 'Second Number ( From the database )',
      type: 'number',
      width: 400,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'percentage',
      headerName: 'Percentage ( (First number / second number)*100)',
      type: 'number',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 675,
      aggFunc: "sum",
      valueGetter: getPercentage,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center'
    }
      
  ];
  

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




function Dashboard(props) {
  const classes = useStyles();
  const [rows, setTableData ] = useState([])
 
  // handle click event of logout button
  const handleLogout = () => {
    removeUserSession();
    props.history.push('/login');
  }
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/numbers/numbers', {
        headers: {
          'Authorization': `Token ${getToken()}`
        }
      })
      .then((res) => {
        console.log(res.data)
        setTableData(res.data)

      })
      .catch((error) => {
        console.error(error)
      })
  }, [])
 
  return (
    <div>
        <div className={classes.root} style= {{padding:10}}>
            <AppBar position="static">
            <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
                Dashboard
            </Typography>
            </Toolbar>
            </AppBar>
        </div>
    <div style={{ height: 400, width: '100%' }} className={classes.root} >
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
      />
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