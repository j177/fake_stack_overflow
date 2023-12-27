import React from 'react';
import axios from 'axios';
import dateFormat from "./dateFormat";
import AnswerList from "./AnswerList";

export default class AnswersPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            answers: [],
            comments: [],
            q: this.props.ques,
            currentPage: 'AnswerPage',
            newComment: "",
            value: "",
            isError: {
                text: ''
            },
            ansPagination: 0,
            comPagination: 0,

        };
        this.handlePostAnswer = this.handlePostAnswer.bind(this);
        this.handleVote = this.handleVote.bind(this);
    }

    componentDidMount() {
        axios.get('http://localhost:8000/answers').then((res) => {
            this.setState({ answers: res.data });
        })

        axios.get('http://localhost:8000/comments').then((res) => {
            this.setState({ comments: res.data });
        })
    }

    handlePostAnswer() {
        this.setState({ currentPage: 'PostAnswer' });
    }

    handleInputChange = (event) => {
        this.setState({
            value: event.target.value,
        });
    };

    handleValidation() {
        let isError = { ...this.state.isError };

        isError.text = this.state.value.length > 140 ? "Text is more than 140 characters" : "";
        this.setState({
            isError,
            text: this.state.value
        }, () => {
            if (isError.text === '') {
                this.handleCommentSubmit();
            }
        });
    }

    handleCommentSubmit() {
        const userId = this.props.userID;

        fetch('http://localhost:8000/check-reputation ', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
            })

        }).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }

            console.log("userID in AnswerPAGE: ", this.props.userID)
            const newComment = {
                text: this.state.value,
                user_id: this.props.userID,
                //q: this.props.ques._id
                q: this.state.q._id
            };

            axios.post(`http://localhost:8000/questions/${this.state.q._id}/comments`, newComment)
                .then((res) => {
                    // Add the new comment to the comments array in the state
                    const updatedComments = [...this.state.comments, res.data];
                    this.setState({ comments: updatedComments, value: "", newComment: res.data });
                    const q_updatedComments = [...this.state.q.comments, res.data];
                    //this.setState({ q: q_updatedComments});
                    this.setState({ q: { ...this.state.q, comments: q_updatedComments } })
                    console.log(this.state.q)
                })
                .catch((error) => {
                    console.error(error);
                });

        }).catch(error => {
            console.error('Error:', error);
            if (error.message === 'Forbidden') {
                window.alert('You do not have enough reputation points to comment.');
            }
        });
    }


    handleVote(model_update, voting_type) {
        const userId = this.props.userID;
        console.log("userID: ", userId)
        const modelId = model_update._id;

        console.log("voting type: ", voting_type);
        console.log("model to update: ", model_update);

        fetch('http://localhost:8000/check-reputation/voting', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                model_id: modelId,
                type: voting_type
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();

            })
            .then(data => {
                if (data.message === 'success') {
                    model_update.votes += 1;

                } else if (data.message === 'remove') {
                    model_update.votes -= 1;

                } else if (data.message === 'success2') {
                    model_update.votes += 2;

                } else if (data.message === 'remove2') {
                    model_update.votes -= 2;
                }

                this.setState({ models: model_update });

            })
            .catch(error => {
                console.error('Error:', error);
                if (error.message === 'Forbidden') {
                    window.alert('You do not have enough reputation points to do this action.');
                }
            });

        this.setState({ currentPage: 'AnswerPage' });
    }

    render() {
        let {  currentPage, isError } = this.state;

        const placeholderText = this.state.newComment ? "" : "Add comment";
        let commentArr = [];
        for (let i = 0; i < this.state.comments.length; i++) {
            for (let j = 0; j < this.state.q.comments.length; j++) {
                if (this.state.comments[i]._id === this.state.q.comments[j]) {
                    console.log("pushing...", this.state.comments[i])
                    commentArr.push(this.state.comments[i]);
                }
            }
        }

        if (this.state.newComment) {
            console.log("pushing new comment... ", this.state.newComment)
            commentArr.push(this.state.newComment);
        }

        let sortCommentArr = commentArr.sort((a, b) => new Date(b.com_date_time) - new Date(a.com_date_time));

        let commentList = [];
        sortCommentArr.map((c) => {
            let comment_text = c.text;
            let commenter = <div><span className="red-text">{c.username}</span> commented {dateFormat(c.com_date_time)}</div>;

            return commentList.push(
                <tr key={c._id} className="com-row">
                    <td>
                        {c.votes} votes <br />
                        <button onClick={() => this.handleVote(c, 'c_upvote')} type="button">Upvote</button> <br />
                    </td>
                    <td>
                        {comment_text}{commenter}
                    </td>
                </tr>
            );
        })

        let question = this.state.q;

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
                <button className="ask-button" onClick={(e) => { this.props.showPage("AskQuestion") }}>Ask Question</button>
                <p><b>{question.answers.length} answers</b></p>
                <p><b>{question.views} views</b></p>

                <p><b>{question.votes} votes</b></p>
                <button onClick={() => this.handleVote(question, 'q_upvote')} type="button">Upvote</button>
                <button onClick={() => this.handleVote(question, 'q_downvote')} type="button">Downvote</button>

                <p ><i><span className="green-text">{question.asked_by.username}</span> asked on {dateFormat(question.ask_date_time)}</i>
                    <br></br>
                    <br></br>
                    {q_text_before}{q_text_link}{q_text_after}
                    {q_text}
                </p>

                <br />
                <span style={{ fontFamily: "monospace" }}>Comments:</span>

                <table className='comment-table'>
                    <tbody>
                        {commentList}
                    </tbody>
                </table>
                <br />
                <input name="text" type="text"
                    value={this.state.value}
                    onChange={this.handleInputChange}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            this.handleValidation();
                        }
                    }}
                    placeholder={placeholderText}
                />
                <span style={{ color: "red" }} display={isError.text ? { display: "visible" } : "none"}> {isError.text}</span>
            </div>
        )

        return (
            <div className="answer-page">
                {currentPage === "AnswerPage" && ansHeader}

                <AnswerList
                    currentPage={currentPage}
                    handlePostAnswer={this.handlePostAnswer}
                    handleVote={this.handleVote}
                    ques={this.props.ques}
                    showPage={this.props.showPage}
                    userID={this.props.userID}
                />
            </div>
        );
    }
}
