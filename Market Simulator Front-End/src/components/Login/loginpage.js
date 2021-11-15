import React, { useState } from 'react';
import axios from 'axios';
import { setUserSession } from '../../Utils/Common';
import logo from '../../assets/M_logo.png';
import './signup_style.css';


const Regex = RegExp(/^\s?[A-Z0–9]+[A-Z0–9._+-]{0,}@[A-Z0–9._+-]+\.[A-Z0–9]{2,4}\s?$/i);
const validateForm = ({ errors, ...rest }) => {
    let isValid = true;

    Object.values(errors).forEach(val => {


        if (val.length > 0) {
            isValid = false;
        }
    });

    Object.values(rest).forEach(val => {

        if (val === "") {
            isValid = false;

        }
    });

    return isValid;
};

export default class SignUp extends React.Component {
    constructor(props) {
        super(props);
        const initialState = {
            email: '',
            password: '',
            errors: {
                email: '',
                password: '',
            }
        }
        this.state = initialState;
        this.onRadioChange = this.onRadioChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.SubmitHandler = this.SubmitHandler.bind(this);
    }
    handleChange = (event) => {
        event.preventDefault();
        const { name, value } = event.target;
        let errors = this.state.errors;
        switch (name) {
            case 'email':
                errors.email = Regex.test(value) ? '' : 'Email is not valid!';
                break;
            case 'password':
                errors.password = value.length < 8 ? 'Password must be eight characters long!' : '';
                break;
            default:
                break;
        }
        this.setState(Object.assign(this.state, { errors, [name]: value }));
        console.log(this.state);
    }
    onRadioChange = (e) => {
        this.setState({
            type: e.target.value
        });
    }
    SubmitHandler = (event) => {
        event.preventDefault();
        if (validateForm(this.state)) {
            console.log('here')
            axios.post('http://127.0.0.1:8000/account/api/login', { username: this.state.email, password: this.state.password }).then(response => {
            setUserSession(response.data.token);
            //props.history.push('/dashboard');
            }).catch(error => {
            
        });
        } else {
            console.log('Registering failed')
        }
    }
    render() {
        const { errors } = this.state
        return (
            <div className='wrapper'>
                <div className='form-wrapper'>
                    <img className="c_logo" src={logo} alt="Logo"
                        width={120}
                        height={120}
                        style={{ alignSelf: 'center' }} />
                    <h2>Log In</h2>
                    <form onSubmit={this.SubmitHandler}>
                        <div className='email'>
                            <label htmlFor="email">Email</label>
                            <input type='email' name='email' onChange={this.handleChange} required />
                            {errors.email.length >= 0 && <span style={{ color: "red", fontSize: '0.9em', fontWeight: 'lighter' }}>{errors.email}</span>}
                        </div>
                        <div className='password'>
                            <label htmlFor="password">Password</label>
                            <input type='password' name='password' onChange={this.handleChange} required />
                            {errors.password.length >= 0 && <span style={{ color: "red", fontSize: '0.9em', fontWeight: 'lighter' }}>{errors.password}</span>}
                        </div>
                        <div className='submit'>
                            <button type="submit" className="btn btn-dark btn-lg btn-block">Login</button>
                            <p className="forgot-password text-right">Not Registered? Contact Us <a href="#">Contact</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}