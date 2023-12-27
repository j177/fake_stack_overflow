import React from 'react';
import axios from 'axios';

export default class Banner extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            username: ""
        }
        this.changeUsername = this.changeUsername.bind(this)
    }

    handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.props.showPage("Search:" + e.target.value);
            e.target.value = '';
        }
    }
    handleLogout() {
        axios.post(`http://localhost:8000/logout`).then(res => {
            this.props.showPage("Welcome")
        })
    }

    handleProfile() {
        this.props.showPage("ProfilePage")
    }

    changeUsername(username) {
        this.setState({
            username: username
        })
    }

    componentDidMount() {
        if (this.props.userID) {
            axios.get(`http://localhost:8000/user/${this.props.userID}`).then(res => {
                this.changeUsername(res.data)
            })
        }

    }

    render() {

        return (
            <div id="banner" className="banner">
                <p className="fakestackoverflow"> Fake Stack Overflow </p>
                <form id="searchForm">
                    <input type="search" placeholder="Search..." id="searchbar" className="searchbar" onKeyDown={this.handleKeyDown} />
                </form>
                
                    <button className={this.state.username !== "" ? "" : "hidden"}
                        id="profile-button"
                        onClick={(e) => { this.handleProfile() }}>Profile</button>
                    <button className={this.state.username !== "" ? "" : "hidden"}
                        id="logout-button"
                        onClick={(e) => { this.handleLogout() }}>Logout</button>
            </div>
        );
    }
}