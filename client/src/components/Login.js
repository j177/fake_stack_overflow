import React from 'react'
import axios from 'axios'

export default class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            email: '',
            password: '',
            isError: {
                email: '',
                password: ''
            }
        }
        this.handleEmail = this.handleEmail.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
        this.handleIsError = this.handleIsError.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleEmail(email) {
        this.setState({
            email: email
        })
    }

    handlePassword(password) {
        this.setState({
            password: password
        })
    }


    handleIsError(isError) {
        this.setState({
            isError: isError
        })
    }

    handleSubmit(e) {
        e.preventDefault();

        const email = e.target[0].value
        const password = e.target[1].value

        let error = {
            email: '',
            password: ''
        }

        // validate email address
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) error.email = "Not a valid email address";
        axios.post(`http://localhost:8000/login`, { email: email, password: password }, { withCredentials: true}).then(res => {
            if (!error.email && res.data === "Email is unregistered") error.email = res.data;
            if (res.data === "Password is incorrect") error.password = res.data;
            if (error.email || error.password) {
                this.handleIsError(error);
            }
            else {
                this.props.changeUserID(res.data.userID)
                this.props.showPage("QuestionPage");
            }
        })
        this.handleEmail('');
        this.handlePassword('');
    }

    render() {
        const { isError } = this.state
        const loginForm = (
            <form className="loginForm" onSubmit={this.handleSubmit}>
                <h2>Email*</h2>
                <input type="text" id="email" name="email"
                    value={this.state.email}
                    onChange={(e) => this.handleEmail(e.target.value)}
                    required
                />
                <span style={{ color: "red" }} display={isError.email ? { display: "visible" } : "none"}>{isError.email}</span>

                <h2>Password*</h2>
                <input type="password" id="password" name="password"
                    value={this.state.password}
                    onChange={(e) => this.handlePassword(e.target.value)}
                    required
                />
                <span style={{ color: "red" }} display={isError.password ? { display: "visible" } : "none"}>{isError.password}</span>

                <br />
                <input id="submitQ" type="submit" value="Login" />
            </form>
        )
        return loginForm
    }

}