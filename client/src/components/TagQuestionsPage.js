import React from 'react';
import TagQuestionsList from './TagQuestionsList';
import axios from 'axios';

export default class TagQuestionsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 'TagQuestionsPage',
            questions: []
        };
        this.handleQuestionClick = this.handleQuestionClick.bind(this);
        // bind() method returns a new function with the same function name
        // this is to set the 'this' value explicitly (with the currentPage value and tagName value)
    }

    componentDidMount() {
        axios.get('http://localhost:8000/questions').then((res) => {
            this.setState({ questions: res.data });
        })
    }

    handleQuestionClick(event) {
        let q_id = event.target.getAttribute('q_id');

        let ques = "";
        for (let i = 0; i < this.state.questions.length; i++) {
            if (this.state.questions[i]._id === q_id)
                ques = this.state.questions[i]
        }

        // Increment question views count on the server side
        fetch(`http://localhost:8000/questionsviews/${q_id}`, { method: 'POST' })
            .then(response => {
                if (response.ok) {
                    console.log('Question views updated successfully.');
                    // Update the views count of the ques object
                    ques.views += 1;
                    // Update the state with the updated ques object and currentPage
                    this.setState({ currentPage: 'AnswerPage', ques });
                } else {
                    console.error('Failed to update question views.');
                }
            })
            .catch(error => {
                console.error(error);
            });

        this.setState({ currentPage: 'AnswerPage', ques });
    }

    render() {
        let { tags, tagName } = this.props;
        let { currentPage, ques } = this.state;

        let TQ_header = (
            <div className="wrapper">
                <div className="container"></div>
                <h1 className="tag-question-title">All Questions of Selected Tag: <span className="green-text">{tagName}</span></h1>
            </div>
        )

        return (
            <div id="questions-of-tag-page" className="questions-of-tag-page ">

                {currentPage === 'TagQuestionsPage' && TQ_header}
                <TagQuestionsList
                    tags={tags}
                    currentPage={currentPage}
                    handleQuestionClick={this.handleQuestionClick}
                    tagName={tagName}
                    ques={ques}
                    userID={this.props.userID}
                    showPage={this.props.showPage}
                />
            </div>
        )
    }
}
