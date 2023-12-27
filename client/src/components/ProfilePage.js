import React from 'react'
import dateFormat from "./dateFormat";
import UserNewQuestionPage from "./UserNewQuestionPage";
import UserTagPage from "./UserTagPage";
import UserQuestionPage from "./UserQuestionPage";

import axios from 'axios'

export default class ProfilePage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            userAskedQ: [],
            tags: [],
            answers: [],
            currentUser: "",
            currentPage: 'ProfilePage'
        }
        this.handleQuesClick = this.handleQuesClick.bind(this);
        this.handleViewTags = this.handleViewTags.bind(this);
        this.handleViewAnsweredQ = this.handleViewAnsweredQ.bind(this);
    }

    componentDidMount() {
        axios.get(`http://localhost:8000/findquestions/${this.props.userID}`).then(res => {
            this.setState({ userAskedQ: res.data })
        }).catch(error => {
            console.error('Error retrieving questions:', error);
        });


        axios.get(`http://localhost:8000/finduser/${this.props.userID}`).then(res => {
            this.setState({ currentUser: res.data })
        })
    }

    handleQuesClick(event) {
        let q_id = event.target.getAttribute('id');
        this.setState({ currentPage: 'UserNewQuestionPage', q_id });
    }

    handleViewTags() {
        this.setState({ currentPage: 'UserTagPage' });
    }

    handleViewAnsweredQ() {
        this.setState({ currentPage: 'UserQuestionPage' });
    }

    render() {
        // how long this account is: "member since []"
        // reputation amount
        // all questions
        // view all tags
        // view all questions
        // show if no tags, answers, questions
        let { currentUser, userAskedQ, currentPage } = this.state;
        console.log(this.state.userAskedQ)

        let askedQError = "";
        if (userAskedQ.length === 0) {
            askedQError = (<i>Nothing to display here. You have not asked any questions.</i>)
        }

        let askedQList = userAskedQ.map((q, index) => (
            <li key={index}><button className='make-link-question' onClick={this.handleQuesClick} id={q._id}>{q.title}</button></li>
        ));

        let askedDiv = (
            <div>
                {askedQError}
                <div style={{ paddingLeft: '20px' }}>{askedQList}</div>
            </div>
        )

        if (currentPage === "ProfilePage") {
            return (
                <div className="wrapper">
                    <div className="container"></div>
                    <div id="profile-page">
                        <h1>Welcome to your Profile!</h1>

                        <p>Member since: {dateFormat(currentUser.created_date)}</p>
                        <p>Reputation: {currentUser.reputation}</p>
                        <br /> <br />
                        <h3>Your Asked Questions</h3>
                        {askedDiv}
                        <br /> <br />
                        <button className='make-link' onClick={this.handleViewTags}>View all Tags</button>
                        <button className='make-link' onClick={this.handleViewAnsweredQ}>View all Answered Questions</button>
                    </div>
                </div>
            )

        } else if (currentPage === "UserNewQuestionPage") {
            return (
                <UserNewQuestionPage
                    showPage={this.props.showPage}
                    userID={this.props.userID}
                    q_id={this.state.q_id}
                />
            )

        } else if (currentPage === "UserTagPage") {
            return (
                <UserTagPage
                    showPage={this.props.showPage}
                    userID={this.props.userID}
                />
            )

        } else if (currentPage === "UserQuestionPage") {
            return (
                <UserQuestionPage
                    showPage={this.props.showPage}
                    userID={this.props.userID}
                />
            )
        }
    }
}
