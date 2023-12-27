import React from "react";
import dateFormat from "./dateFormat";
import AnswerPage from "./AnswerPage";

export default class QuestionList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tablePage: 0
        };

        this.handlePagination = this.handlePagination.bind(this);
    }

    handlePagination(tablePage) {
        this.setState({
            tablePage: tablePage
        });
    }

    render() {
        const { questions, currentPage, handleQuestionClick, ques } = this.props;
        const { tablePage } = this.state;
        const tableStart = tablePage * 5;
        const tablePgCount = Math.min(5, questions.length - tableStart);

        const questionRows = questions
            .slice(tableStart, tableStart + tablePgCount)
            .map((question) => {
                const allTags = question.tags
                    .map((currentTag) => currentTag.name)
                    .sort();
                const allTagsList = allTags.map((tag) => (
                    <p key={tag} className="each-tag">
                        {tag}
                    </p>
                ));

                return (
                    <tr className="question-row" key={question._id}>
                        <td id="ansView">
                            {question.answers.length} answers
                            <br />
                            {question.views} views
                            <br />
                            {question.votes} votes
                        </td>
                        <td>
                            <div>
                                <button
                                    className="link-button"
                                    onClick={handleQuestionClick}
                                    q_id={question._id}
                                >
                                    {question.title}
                                </button>
                                <div>Summary: {question.summary}</div>
                                <div>{allTagsList}</div>
                            </div>
                        </td>
                        <td>
                            <span className="red-text">{question.asked_by.username}</span>
                        </td>
                        <td> asked {dateFormat(question.ask_date_time)}</td>
                    </tr>
                );
            });

        const nextPg = questions.length > tableStart + 5;
        const prevPg = tableStart > 0;

        const pagination = (
            <div className="table-footer">
                <button
                    className={prevPg ? "" : "disable-button"}
                    style={{ marginRight: 20 }}
                    onClick={() => {
                        this.handlePagination(this.state.tablePage - 1);
                    }}
                >
                    &#60; Prev
                </button>
                <button
                    className={nextPg ? "" : "disable-button"}
                    onClick={() => {
                        this.handlePagination(this.state.tablePage + 1);
                    }}
                >
                    &#62; Next
                </button>
            </div>
        );

        if (currentPage === 'AnswerPage') {
            return (
                <AnswerPage
                    ques={ques}
                    showPage={this.props.showPage}
                    userID={this.props.userID}
                />
            )
        }
        else {
            return (
                <div id="div-before-list">
                    <table id="list">
                        <tbody>{questionRows}</tbody>
                    </table>
                    {pagination}
                </div>
            );
        }
    }
}
