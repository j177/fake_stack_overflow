import React from 'react';
import axios from 'axios';
import QuestionList from './QuestionList';

export default class Search extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            questions: []
        }
        this.handleSortNew = this.handleSortNew.bind(this);
        this.handleSortAct = this.handleSortAct.bind(this);
        this.handleSortAns = this.handleSortAns.bind(this);
    }
    componentDidMount() {
        console.log("searchTerm", this.props.searchTerm);
        axios.get(`http://localhost:8000/search/${this.props.searchTerm}`).then(res => {
            this.setState({ questions: res.data })
            console.log("res data", res.data)

        })
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
                    <h2 id="all-questions" > {this.state.questions.length === 0 ? "No Results" : "Search Results"}</h2>
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
                {questionHeader}
                <QuestionList
                    showPage={this.props.showPage}
                    questions={this.state.questions}
                />
            </>
        )
    }
}