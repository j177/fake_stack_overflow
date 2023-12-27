import React from 'react';
import dateFormat from "./dateFormat";
import PostAnswer from "./PostAnswer";
import axios from 'axios';

export default class AnswerList extends React.Component {
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
            },
            ansPagination: 0,
            comPagination: 0
        };
        this.handleAnsPagination = this.handleAnsPagination.bind(this);
        this.handleComPagination = this.handleComPagination.bind(this);
    }

    componentDidMount() {
        axios.get('http://localhost:8000/answers').then((res) => {
            this.setState({ answers: res.data });
        })
        axios.get('http://localhost:8000/comments').then((res) => {
            this.setState({ comments: res.data });
        })
    }

    handleAnsPagination(ansPagination) {
        this.setState({
            ansPagination: ansPagination
        })
    }

    handleComPagination(comPagination) {
        this.setState({
            comPagination: comPagination
        })
    }

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
        let { currentPage, handlePostAnswer, handleVote, ques } = this.props;
        const placeholderText = this.state.newComment ? "" : "Add comment";

        let question = ques;
        let answerArr = [];
        
        for (let i = 0; i < this.state.answers.length; i++) {
            for (let j = 0; j < question.answers.length; j++) {
                if (this.state.answers[i]._id === question.answers[j]) {
                    answerArr.push(this.state.answers[i]);
                }
            }
        } 

        // sort answers by date
        let sortArr = answerArr.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));

        let answerList = [];
        let ansStart = this.state.ansPagination * 5
        let ansCounts = Math.min(5, sortArr.length - ansStart)

        for (let i = ansStart; i < ansStart + ansCounts; i++) {
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

                let startComment = this.state.comPagination * 3
                let comCounts = Math.min(3, sortCommentArr.length - startComment)
                let commentList = [];

                for (let i = startComment; i < startComment + comCounts; i++) {
                    // let commentList = [];
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
                }
                let hasNextCom = (sortCommentArr.length > this.state.comPagination * 3 + 3)
                let hasPrevCom = (this.state.comPagination * 3 > 0)

                const comButtons = (
                    <div className="table-footer">
                        <button
                            className={hasPrevCom ? "" : "disable-button"}
                            style={{ marginRight: 20 }}
                            onClick={() => {
                                this.handleComPagination(this.state.comPagination - 1);
                            }}
                        >
                            &#60; Prev
                        </button>
                        <button
                            className={hasNextCom ? "" : "disable-button"}
                            onClick={() => {
                                this.handleComPagination(this.state.comPagination + 1);
                            }}
                        >
                            &#62; Next
                        </button>
                    </div>
                );

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
                                            <div className='div-before-list'>
                                            <table className='comment-table'>
                                                <tbody>
                                                    {commentList}
                                                    {comButtons}
                                                </tbody>
                                            </table>
                                            </div>
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
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                );

            })
        }
        let hasNextAns = (sortArr.length > this.state.ansPagination * 5 + 5)
        let hasPrevAns = (this.state.ansPagination * 5 > 0)

        const ansButtons = (
            <div className="table-footer">
                <button
                    className={hasPrevAns ? "" : "disable-button"}
                    style={{ marginRight: 20 }}
                    onClick={() => {
                        this.handleAnsPagination(this.state.ansPagination - 1);
                    }}
                >
                    &#60; Prev
                </button>
                <button
                    className={hasNextAns ? "" : "disable-button"}
                    onClick={() => {
                        this.handleansPagination(this.state.ansPagination + 1);
                    }}
                >
                    &#62; Next
                </button>
            </div>
        );

        if (currentPage === "AnswerPage") {
            return (
                <div>
                    <div className="wrapper">
                        <div className="container"></div>
                        <div className="format-ans-table">
                            <div className='div-before-list'>
                                <table id="answer-table" className="answer-table">
                                    <tbody>
                                        {answerList}
                                        {ansButtons}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <button onClick={handlePostAnswer} className="post-answer-button">Post Answer</button>
                    <br />
                    <br />
                </div>
            )

        } else if (currentPage === "PostAnswer") {
            return (
                <PostAnswer
                    q={ques}
                    showPage={this.props.showPage}
                />
            )
        }
    }
}
