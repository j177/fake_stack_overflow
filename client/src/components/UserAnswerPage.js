import React from 'react';
import axios from 'axios';
import dateFormat from "./dateFormat";
import UserAnswerList from "./UserAnswerList";


export default class UserAnswerPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            answers: [],
            user_asked: "",
            currentPage: 'UserAnswerPage',
        };
    }

    componentDidMount() {
        axios.get('http://localhost:8000/answers')
            .then((res) => {
                this.setState({ answers: res.data });
            })
            axios.get(`http://localhost:8000/user/${this.props.ques.asked_by}`)
            .then((res) => {
                this.setState({ user_asked : res.data });
            })
    }

    render() {
        let { answers, currentPage } = this.state;
        let { ques } = this.props;

        // find the matching question from the array of answers
        // find answers of that matched question
        let question = ques;

        let answerArr = [];
        for (let i = 0; i < answers.length; i++) {
            if (answers[i].question._id === question._id) {
                answerArr.push(answers[i]);
            }
        }
        // sort by most recent answer
        let sortArr = answerArr.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));

        // if there is hyperlink in question text
        let q_text_before;
        let q_text_after;
        let q_text_link;
        let q_text;
        if (question.text.includes("[") && question.text.includes("]")) {
            let i_before;
            let i_after;
            let makeLink = question.text.substring(i_before = question.text.indexOf("[") + 1, question.text.indexOf("]"));
            let hyperlink = question.text.substring(question.text.indexOf("(") + 1, i_after = question.text.indexOf(")"));

            q_text_link = <a href={hyperlink} target="_blank" rel="noreferrer">{makeLink}</a>;
            q_text_before = question.text.slice(0, i_before - 1);
            q_text_after = question.text.slice(i_after + 1);
        } else {
            q_text = question.text; // q_text will contain entire question.text
        }

        let ansHeader = (
            <div className="ans-pg-details">
                <h2>{question.title}</h2>
                <p><b>{sortArr.length} answers</b></p>
                <p><b>{question.views} views</b></p>
                <p ><i><span className="green-text">{this.state.user_asked}</span> asked {dateFormat(question.ask_date_time)}</i>
                    <br></br>
                    <br></br>
                    {q_text_before}{q_text_link}{q_text_after}
                    {q_text}
                </p>
            </div>
        )

        return (
            <div>
                {currentPage === "UserAnswerPage" && ansHeader}
                
                <UserAnswerList
                    currentPage={currentPage}
                    ques={this.props.ques}
                    showPage={this.props.showPage}
                    userID={this.props.userID}
                />
            </div>
        );
    }
}
