import React from 'react'


export default class UserTagPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tags: [],
            currentUser: "",
            currentPage: 'UserTagPage'
        }
    }

    render() {

        console.log("hi")

        return (
            <div className="wrapper">
                <div className="container"></div>
                <div id='user-newQ-page'>
                    <h1>USER TAG PAGE</h1>
                </div>
            </div>
        )
    }
}