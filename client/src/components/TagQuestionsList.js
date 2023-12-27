import React from 'react';
import dateFormat from "./dateFormat";
import AnswerPage from './AnswerPage';
import axios from 'axios';

export default class TagQuestionsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            questions: []
        };
    }

    componentDidMount() {
        axios.get('http://localhost:8000/questions').then((res) => {
            this.setState({ questions: res.data });
        })
    }

    render() {
        let { tags, currentPage, handleQuestionClick, tagName, ques } = this.props;
        let { questions } = this.state;

        // find the corresponding question array
        let quesArr = [];
        for (let i = 0; i < questions.length; i++) {
            for (let j = 0; j < questions[i].tags.length; j++) {
                if (questions[i].tags[j].name === tagName) {
                    quesArr.push(questions[i])
                    break;
                }
            }
        }

        // to contain all the rows for the questions-of-tag-table
        let tagQuestionsRows = [];
        for (let q = 0; q < quesArr.length; q++) {
            let question = quesArr[q];

            let numAnswers = question.answers.length + " answers";
            let numViews = question.views + " views";
            let quesTitle = <button className="make-link-question" onClick={handleQuestionClick} q_id={question._id}>{question.title}</button>;
            let personAsked = <div><span className="red-text">{question.asked_by.username}</span> asked on {dateFormat(question.ask_date_time)}</div>;

            // array to hold all the tags that a question has (shown in grey background for each question)
            let allTags = [];
            question.tags.forEach(currentTag => {
                tags.forEach(tagIndex => {
                    if (currentTag === tagIndex._id) {
                        allTags.push(tagIndex.name)
                    }
                })
            })
            // sorting the tags array for each question
            allTags.sort();
            let allTagsList = allTags.map((item) => <p key={item} className="each-tag">{item}</p>)

            // pushing each question and its details to tagQuestionsRows Object
            tagQuestionsRows.push(
                <tr key={question._id} className="question-row">
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

        if (currentPage === 'TagQuestionsPage') {
            return (
                <table id="tag-qs-table" className="tag-qs-table">
                    <tbody>
                        {tagQuestionsRows}
                    </tbody>
                </table>
            )

        } else if (currentPage === 'AnswerPage') {
            return (
                <AnswerPage
                    ques={ques}
                    userID={this.props.userID}
                    showPage={this.props.showPage}
                />
            )
        }
    }
}
