import React from 'react'

export default class Welcome extends React.Component {
    render() {
        return (
            <div className='welcome'>
                <h2>Welcome to FakeStackOverflow</h2>
                <div>
                <button className='welcome-button' onClick={() => this.props.showPage("Register")}>Register</button>
                <button className='welcome-button' onClick={() => this.props.showPage("Login")}>Login</button>
                <button className='welcome-button' onClick={() => this.props.showPage("QuestionPage")}>Continue as Guest</button>
                </div>
            </div>
        )
    }
}