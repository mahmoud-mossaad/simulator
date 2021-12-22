import React, { useState } from 'react';
import axios from 'axios';
import { setUserSession } from '../../Utils/Common';
import logo from '../../assets/M_logo.png';
import {Grid, Header, Image, Form, Button, Message, Segment} from 'semantic-ui-react'
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
    }
    onRadioChange = (e) => {
        this.setState({
            type: e.target.value
        });
    }
    SubmitHandler = (event) => {
        event.preventDefault();
        if (validateForm(this.state)) {
            const formData = new FormData();
            formData.append("email", this.state.email)
            formData.append("password", this.state.password)
            axios.post('http://127.0.0.1:5000/login', formData).then(response => {
            setUserSession(response.data.token);
            this.props.history.push('/dashboard');
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
                <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                    <Grid.Column style={{ maxWidth: 300 }}>
                    
                    <Form size='large' onSubmit={this.SubmitHandler}>
                        <Segment stacked>
                        <Header as='h1' icon textAlign='center' dividing>
                            <Image src={logo} circular />
                            <Header.Content style={{ color: '#00265E'}}>Log In</Header.Content>
                        </Header>
                        <Form.Input
                        name= 'email'
                        onChange={this.handleChange}
                        fluid icon='user'
                        iconPosition='left'
                        placeholder='E-mail address'
                        type='email'
                        required/>
                        {errors.email.length >= 0 && <span style={{ color: "red", fontSize: '0.9em', fontWeight: 'lighter' }}>{errors.email}</span>}
                        <Form.Input
                            type='password'
                            name='password'
                            onChange={this.handleChange}
                            fluid
                            icon='lock'
                            iconPosition='left'
                            placeholder='Password'
                            type='password'
                        />
                        {errors.password.length >= 0 && <span style={{ color: "red", fontSize: '0.9em', fontWeight: 'lighter' }}>{errors.password}</span>}
                        <Button color='blue' fluid size='large'>
                            Login
                        </Button>
                        </Segment>
                    </Form>
                    <Message>
                        New to us? <a href='#' color='red'>Sign Up</a>
                    </Message>
                    </Grid.Column>
                </Grid>
            </div>
        );
    }
}

