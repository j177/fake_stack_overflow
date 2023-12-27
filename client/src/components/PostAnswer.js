import React from 'react';
import axios from 'axios'
import AnswerPage from './AnswerPage';

export default class PostAnswer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentPage: 'PostAnswer',
            text: '',
            ans_date_time: '',
            isError: {
                text: '',
                ans_by: ''
            }
        }
        this.handleText = this.handleText.bind(this);
        this.handleValidation = this.handleValidation.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleText(text) {
        this.setState({
            text: text
        })
    }

    handleValidation(e) {
        e.preventDefault();
        const { name, value } = e.target
        let isError = { ...this.state.isError };
        switch (name) {
            case "text":
                if (value.includes("[") && value.includes("]")) {
                    console.log("includes link");
                    if (value.includes("(") && value.includes(")")) {
                        let hyperlink = value.substring((value.indexOf("(") + 1), value.indexOf(")"));
                        if ((hyperlink.substring(0, 8) !== ("https://"))) {
                            isError.text = "The link does not begin with https:// or http://";
                            break;
                        } else if (hyperlink.substring(0, 7) !== ("http://")) {
                            isError.text = "The link does not begin with https:// or http://";
                            break;
                        }

                    }
                    else {
                        console.log("no actual link");
                        isError.text = "No actual link included following [], you need to include link in ()";
                        break;
                    }
                }
                isError.text = "";
                break;
            default:
                break;
        }
        this.setState({
            isError,
            [name]: value
        })
    }

    handleSubmit(e) {
        e.preventDefault();

        const text = e.target[0].value

        let newA = {
            text: text,
            ans_by: this.props.userID,
            q: this.props.q._id
        }

        axios.post('http://localhost:8000/addanswer', newA).then(res => {
            if (res.data === "OK") {
                console.log("Succcessfully posted answer");
                this.setState({ currentPage: 'AnswerPage' });
            }
            else {
                console.log("Error in adding question to server");
            }
            this.handleText('');

        })
    };


    render() {
        const { isError } = this.state;
        const postForm = (
            <div className='post-page'>
                <form id="postForm" onSubmit={this.handleSubmit}>
                    <h2>Answer Text*</h2>
                    <textarea type="text" id="text" name="text"
                        value={this.state.text}
                        onChange={this.handleValidation}
                        required
                    />
                    <span className="red-text" display={isError.text ? { display: "visible" } : "none"}>{isError.text}</span>
                    <br />
                    <br />

                    <input id="submitA" type="submit" />
                </form>
            </div>
        )

        if (this.state.currentPage === 'AnswerPage') {
            return (
                <AnswerPage
                    ques={this.props.q}
                    showPage={this.props.showPage}
                />
            )
        } else {
            return postForm
        }
    }
}
