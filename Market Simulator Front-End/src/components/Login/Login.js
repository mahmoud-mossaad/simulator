import React, { useState } from 'react';
import axios from 'axios';
import { setUserSession } from '../../Utils/Common';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/styles';


const useStyles = makeStyles({
    root: {
      '& .super-app-theme--header': {
        backgroundColor: 'rgba(255, 165, 0, 1)',
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

function Login(props) {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const username = useFormInput('');
  const password = useFormInput('');
  const new_email = useFormInput('');
  const new_password = useFormInput('');
  const new_password2 = useFormInput('');
  const [error, setError] = useState(null);
  
 
  // handle button click of login form
  const handleLogin = () => {
    setError(null);
    setLoading(true);
    axios.post('http://127.0.0.1:8000/account/api/login', { username: username.value, password: password.value }).then(response => {
      setLoading(false);
      setUserSession(response.data.token);
      props.history.push('/dashboard');
    }).catch(error => {
      setLoading(false);
      if (error.response === 401) setError(error.response.data.message);
      else setError("Something went wrong. Please try again later.");
    });
  }
  const handleRegister = () => {
    setError(null);
    setLoading(true);
    console.log(new_email.value)
    axios.post('http://127.0.0.1:8000/account/api/register', { email: new_email.value, password: new_password.value, password2: new_password2.value }).then(response => {
      setLoading(false);
      setUserSession(response.data.token);
      console.log(response.data.email)
      if (response.data.email !== 'account with this email already exists.') {
        props.history.push('/dashboard');
      }
      else {
        setError(response.data);
      }
    }).catch(error => {
      setLoading(false);
      if (error.response === 401) setError(error.response.data.message);
      else setError("Something went wrong. Please try again later.");
    });

  }
 
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
      <div style={{
        position: 'absolute', left: '60%', top: '43%',
        transform: 'translate(-50%, -50%)'
        }}>
        Username<br />
        <input type="text" {...username} autoComplete="new-password" />
      </div>
      <div style={{
        position: 'absolute', left: '60%', top: '50%',
        transform: 'translate(-50%, -50%)'
    }} >
        Password<br />
        <input type="password" {...password} autoComplete="new-password" />
      </div>
      {error && <><small style={{ color: 'red' }}>{error}</small><br /></>}<br />
      <Button
       variant="contained" color="primary" value={loading ? 'Loading...' : 'Login'}
       disabled={loading} onClick={handleLogin}
       style={{
        position: 'absolute', left: '60%', top: '58%',
        transform: 'translate(-50%, -50%)'
        }}>
        Login
      </Button>

      <div style={{
        position: 'absolute', left: '30%', top: '43%',
        transform: 'translate(-50%, -50%)'
        }}>
        Email<br />
        <input type="text" {...new_email} autoComplete="new-password" />
      </div>
      <div style={{
        position: 'absolute', left: '30%', top: '50%',
        transform: 'translate(-50%, -50%)'
    }} >
        Password<br />
        <input type="password" {...new_password} autoComplete="new-password" />
      </div>
      <div style={{
        position: 'absolute', left: '30%', top: '57%',
        transform: 'translate(-50%, -50%)'
    }} >
        Password<br />
        <input type="password" {...new_password2} autoComplete="new-password" />
      </div>
      <Button
       variant="contained" color="primary" value={loading ? 'Loading...' : 'Registering'}
       disabled={loading} onClick={handleRegister}
       style={{
        position: 'absolute', left: '30%', top: '65%',
        transform: 'translate(-50%, -50%)'
        }}>
        Sign Up
      </Button>
    </div>
    
  );
}
 
const useFormInput = initialValue => {
  const [value, setValue] = useState(initialValue);
 
  const handleChange = e => {
    setValue(e.target.value);
  }
  return {
    value,
    onChange: handleChange
  }
}

export default Login;