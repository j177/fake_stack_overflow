import React from 'react';
import dateFormat from "./dateFormat";
import axios from 'axios';

export default class UserAnswerList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            answers: [],
            comments: [],
            a_id: "",
            newComment: "",
            value: "",
            isError: {
                text: ''
            }
        };
    }

    componentDidMount() {
        axios.get('http://localhost:8000/answers').then((res) => {
            this.setState({ answers: res.data });
        })
        axios.get('http://localhost:8000/comments').then((res) => {
            this.setState({ comments: res.data });
        })
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

        fetch('http://localhost:8000/check-reputation ', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: this.props.userID,
            })

        }).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const newComment = {
                text: this.state.value,
                user_id: this.props.userID,
                a: this.state.a_id,
            };

            axios.post(`http://localhost:8000/answers/${this.state.a_id}/comments`, newComment)
                .then((res) => {
                    // Add the new comment to the comments array in the state
                    const updatedComments = [...this.state.comments, res.data];
                    this.setState({ comments: updatedComments });
                    this.setState({ value: "" });
                    this.setState({ newComment: res.data });

                    // update visually the new comment
                    this.setState({
                        answers: this.state.answers.map((answer) => {
                            if (answer._id === this.state.a_id) {
                                return {
                                    ...answer,
                                    comments: [...answer.comments, res.data],
                                };
                            }
                            return answer;
                        }),
                    });

                    this.setState({ a_id: "" });
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

    render() {
        let { isError } = this.state;
        let { currentPage, handleVote, ques } = this.props;
        const placeholderText = this.state.newComment ? "" : "Add comment";

        let question = ques;
        let answerArr = [];
        for (let i = 0; i < question.answers.length; i++) {
            for (let j = 0; j < this.state.answers.length; j++) {
                if (this.state.answers[j]._id === question.answers[i]) {
                    answerArr.push(this.state.answers[i]);
                }
            }
        }


        // sort answers by date
        let sortArr = answerArr.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));


        let answerList = [];
        sortArr.map((i) => {
            // if there is hyperlink in the answer text
            let a_text_before;
            let a_text_after;
            let a_text_link;
            let a_text;
            if (i.text.includes("[") && i.text.includes("]")) {
                let i_before;
                let i_after;
                let makeLink = i.text.substring(i_before = i.text.indexOf("[") + 1, i.text.indexOf("]"));
                let hyperlink = i.text.substring(i.text.indexOf("(") + 1, i_after = i.text.indexOf(")"));

                a_text_link = <a href={hyperlink} target="_blank" rel="noreferrer">{makeLink}</a>;
                a_text_before = i.text.slice(0, i_before - 1);
                a_text_after = i.text.slice(i_after + 1);
            } else {
                a_text = i.text; // a_text will contain entire answer.text
            }

            let personAns = <div><span className="red-text">{i.ans_by.username}</span> answered {dateFormat(i.ans_date_time)}</div>;

            // find answer comments
            let commentArr = [];
            for (let j = 0; j < i.comments.length; j++) {
                commentArr.push(i.comments[j]);
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
                            <button onClick={() => handleVote(c, 'c_upvote')} type="button">Upvote</button> <br />
                        </td>
                        <td>
                            {comment_text}{commenter}
                        </td>
                    </tr>
                );
            })


            return answerList.push(
                <tr key={i._id} className="ans-row">
                    <td colSpan="2" className="to-dot">
                        {i.votes} votes <br />
                        <button onClick={() => handleVote(i, 'a_upvote')} type="button">Upvote</button> <br />
                        <button onClick={() => handleVote(i, 'a_downvote')} type="button">Downvote</button>
                    </td>
                    <td colSpan="2" className="to-dot">
                        <table style={{ width: "100%" }}>
                            <tbody>
                                <tr>
                                    <td className='ans-comment-td' colSpan="2">{a_text_before}{a_text_link}{a_text_after}{a_text}</td>
                                    <td className='ans-comment-td'>{personAns}</td>
                                </tr>
                                <tr>
                                    <td colSpan="2" className='ans-comment-td'>
                                        <br />
                                        <span style={{ fontFamily: "monospace" }}>Comments:</span>
                                        <table className='comment-table'>
                                            <tbody>
                                                {commentList}
                                            </tbody>
                                        </table>
                                        <br />
                                        <input
                                            name="text"
                                            type="text"
                                            key={i._id}
                                            value={this.state.value}
                                            onChange={this.handleInputChange}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    this.setState({ a_id: i._id });
                                                    this.handleValidation();
                                                }
                                            }}
                                            placeholder={placeholderText}

                                        />

                                        <span style={{ color: "red" }} display={isError.text ? { display: "visible" } : "none"}> {isError.text}</span>
                                        <br />
                                        <button onClick={this.handlePrevClick}>Prev</button>
                                        <button onClick={this.handleNextClick}>Next</button>
                                        <br />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            );

        })

        if (currentPage === "AnswerPage") {
            return (
                <div>
                    <div className="wrapper">
                        <div className="container"></div>
                        <div className="format-ans-table">
                            <table id="answer-table" className="answer-table">
                                <tbody>
                                    {answerList}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <br />
                    <br />
                </div>
            )

        
        }
    }
}