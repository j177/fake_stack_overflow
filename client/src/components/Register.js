import React from 'react';
import axios from 'axios'

export default class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            password: '',
            passwordVerify: '',
            isError: {
                email: '',
                password: '',
                passwordVerify: ''
            }
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(e) {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        const { username, email, password, passwordVerify } = this.state;

        let error = {
            email: '',
            password: '',
            passwordVerify: ''
        };

        if (password) {
            let emailID = email.split("@");
            if (password.includes(username) || password.includes(emailID)) {
                error.password = "Password should not include username or email id";
            }
        }

        if (passwordVerify && passwordVerify !== password) {
            error.passwordVerify = "Passwords do not match";
        }

        if (email) {
            // Validate email address
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regex.test(email)) {
                error.email = "Not a valid email address";
            }

            // Check if account with the same email exists
            axios.get(`http://localhost:8000/e/${email}`).then((res) => {
                if (res.data) {
                    error.email = "An account with this email already exists";
                }

                if (error.email || error.password || error.passwordVerify) {
                    console.log("error", error);
                    this.setState({ isError: error });
                } else {
                    let newUser = {
                        username: username,
                        email: email,
                        password: password
                    };

                    axios.post('http://localhost:8000/adduser', newUser).then((res) => {
                        if (res.data === "OK") {
                            this.props.showPage("Login");
                            this.setState({
                                username: '',
                                email: '',
                                password: '',
                                passwordVerify: ''
                            });
                        } else {
                            console.log("Error in adding user to server");
                        }
                    });
                }

                this.setState({
                    username: '',
                    email: '',
                    password: '',
                    passwordVerify: ''
                });
            });
        }
    }


    render() {
        const { isError } = this.state
        const registerForm = (
            <form className="registerForm" onSubmit={this.handleSubmit}>
                <h2>Username*</h2>
                <input type="text" id="username" name="username"
                    value={this.state.username}
                    onChange={this.handleInputChange}
                    required
                />

                <h2>Email*</h2>
                <input type="text" id="email" name="email"
                    value={this.state.email}
                    onChange={this.handleInputChange}
                    required
                />
                <span style={{ color: "red" }} display={isError.email ? { display: "visible" } : "none"}>{isError.email}</span>

                <h2>Password*</h2>
                <input type="password" id="password" name="password"
                    value={this.state.password}
                    onChange={this.handleInputChange}
                    required
                />
                <span style={{ color: "red" }} display={isError.password ? { display: "visible" } : "none"}>{isError.password}</span>

                <h2>Re-enter Password*</h2>
                <input type="password" id="passwordVerify" name="passwordVerify"
                    value={this.state.passwordVerify}
                    onChange={this.handleInputChange}
                    required
                />
                <span style={{ color: "red" }} display={isError.passwordVerify ? { display: "visible" } : "none"}>{isError.passwordVerify}</span>

                < br />
                <input id="submitQ" type="submit" value="Register" />
            </form>
        )
        return registerForm
    }
}