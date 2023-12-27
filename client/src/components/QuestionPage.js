import React from 'react'
import QuestionList from './QuestionList'
import axios from 'axios'

export default class QuestionPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            questions: [],
            currentPage: 'QuestionPage'
        }
        this.handleQuestionClick = this.handleQuestionClick.bind(this);
        this.handleSortNew = this.handleSortNew.bind(this);
        this.handleSortAct = this.handleSortAct.bind(this);
        this.handleSortAns = this.handleSortAns.bind(this);
    }
    componentDidMount() {
        axios.get('http://localhost:8000/questions').then(res => {
            this.setState({ questions: res.data })
        })
    }
    handleQuestionClick(event) {
        let q_id = event.target.getAttribute('q_id');

        let ques = "";
        for (let i = 0; i < this.state.questions.length; i++) {
            if (this.state.questions[i]._id === q_id)
                ques = this.state.questions[i];
        }
        console.log("ques found: ", ques); 

        // Increment question views count on the server side
        fetch(`http://localhost:8000/questionsviews/${q_id}`, { method: 'POST' })
            .then(response => {
                if (response.ok) {
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

    handleSortNew(e) {
        e.preventDefault();
        axios.post('http://localhost:8000/questions/newest', {
            data: this.state.questions.map(question => question._id)
        })
            .then(res => {
                this.setState({ questions: res.data })
            })
    }

    handleSortAct(e) {
        e.preventDefault();
        axios.post('http://localhost:8000/questions/active', {
            data: this.state.questions.map(question => question._id)
        })
            .then(res => {
                this.setState({ questions: res.data })
            })
    }

    handleSortAns(e) {
        e.preventDefault();
        axios.post('http://localhost:8000/questions/unanswered', {
            data: this.state.questions.map(question => question._id)
        })
            .then(res => {
                this.setState({ questions: res.data })
            })
    }
    render() {
        let questionHeader = (
            <div className="question-header">

                <div className="q-header-1">
                    <h2 id="all-questions" >All Questions</h2>
                    <button id="ask-button-q-page" className="ask-button" onClick={() => { this.props.showPage("AskQuestion") }}>Ask Question</button>
                </div>

                <div className="q-header-2">
                    <h4 id="num-of-questions"> {this.state.questions.length} questions</h4>

                    <div className="sort-btn-group">
                        <button id="sortNew" onClick={this.handleSortNew}>Newest</button>
                        <button id="sortAct" onClick={this.handleSortAct}>Active</button>
                        <button id="sortAns" onClick={this.handleSortAns}>Unanswered</button>
                    </div>
                </div>
            </div>
        );
        return (
            <>
                {this.state.currentPage === 'QuestionPage' && questionHeader}
                <QuestionList
                    userID={this.props.userID}
                    questions={this.state.questions}
                    currentPage={this.state.currentPage}
                    handleQuestionClick={this.handleQuestionClick}
                    ques={this.state.ques}
                    showPage={this.props.showPage}
                />
            </>
        )
    }
}
