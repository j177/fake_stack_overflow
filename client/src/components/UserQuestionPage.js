import React from 'react'
import dateFormat from "./dateFormat";
import UserAnswerPage from "./UserAnswerPage";

import axios from 'axios'

export default class UserQuestionPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            qq: [],
            tags: [],
            currentPage: 'UserQuestionPage'
        }
        this.handleQuestionClick = this.handleQuestionClick.bind(this);
    }

    componentDidMount() {
        axios.get(`http://localhost:8000/questions-answered/${this.props.userID}`).then(res => {
            this.setState({ qq: res.data })
        })

        axios.get('http://localhost:8000/tags').then((res) => {
            this.setState({ tags: res.data });
        });
    }

    handleQuestionClick(event) {
        let q_id = event.target.getAttribute('q_id');
        console.log("q_id is: ", q_id);

        let ques = "";
        for (let i = 0; i < this.state.qq.length; i++) {
            if (this.state.qq[i]._id === q_id)
                ques = this.state.qq[i]
        }

        // Increment question views count on the server side
        fetch(`http://localhost:8000/questionsviews/${q_id}`, { method: 'POST' })
            .then(response => {
                if (response.ok) {
                    console.log('Question views updated successfully.');
                    // Update the views count of the ques object
                    ques.views += 1;
                    // Update the state with the updated ques object and currentPage
                    this.setState({ currentPage: 'UserAnswerPage', ques });
                } else {
                    console.error('Failed to update question views.');
                }
            })
            .catch(error => {
                console.error(error);
            });

        this.setState({ currentPage: 'UserAnswerPage', ques });
    }

    render() {
        const { currentPage, qq, tags } = this.state;

        let tagQuestionsRows = [];
        for (let q = 0; q < qq.length; q++) {
            let questions = qq[q];

            console.log("q: ", questions)
            let numAnswers = questions.answers.length + " answers";
            let numViews = questions.views + " views";
            let quesTitle = <button className="make-link-question" onClick={this.handleQuestionClick} q_id={questions._id}>{questions.title}</button>;
            let personAsked = <div><span className="red-text">{questions.asked_by.username}</span> asked on {dateFormat(questions.ask_date_time)}</div>;

            // array to hold all the tags that a questions has (shown in grey background for each questions)
            let allTags = [];
            questions.tags.forEach(currentTag => {
                tags.forEach(tagIndex => {
                    if (currentTag === tagIndex._id) {
                        allTags.push(tagIndex.name)
                    }
                })
            })
            // sorting the tags array for each questions
            allTags.sort();
            let allTagsList = allTags.map((item) => <p key={item} className="each-tag">{item}</p>)

            // pushing each questions and its details to tagQuestionsRows Object
            tagQuestionsRows.push(
                <tr key={questions._id} className="question-row">
                    <td>
                        {numAnswers}<br />
                        {numViews}
                    </td>
                    <td>
                        {quesTitle}<br />
                        {allTagsList}
                    </td>
                    <td>
                        {personAsked}
                    </td>
                </tr>
            );
        }

        if (currentPage === "UserQuestionPage") {
            return (
                <div>
                    <div className="wrapper">
                        <div className="container"></div>
                        <div id='user-Q-page'>
                            <h1>All Questions Answered</h1>
                        </div>
                    </div>
                    <table className="tag-qs-table">
                        <tbody>
                            {tagQuestionsRows}
                        </tbody>
                    </table>
                </div>
            )

        } else if (currentPage === "UserAnswerPage") {
            return (
                <UserAnswerPage
                    ques={this.state.ques}
                    userID={this.props.userID}
                    showPage={this.props.showPage}
                />
            )
        }


    }
}