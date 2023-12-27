import React from 'react';
import axios from 'axios'

export default class AskQuestion extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            title: '',
            summary: '',
            text: '',
            tags: '',
            isError: {
                title: '',
                text: '',
                tags: ''
            }
        }
        this.handleTitle = this.handleTitle.bind(this);
        this.handleSummary = this.handleSummary.bind(this);
        this.handleText = this.handleText.bind(this);
        this.handleTags = this.handleTags.bind(this);
        this.handleValidation = this.handleValidation.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleTitle(title) {
        this.setState({
            title: title
        })
    }
    handleSummary(summary) {
        this.setState({
            summary: summary
        })
    }
    handleText(text) {
        this.setState({
            text: text
        })
    }
    handleTags(tags) {
        this.setState({
            tags: tags
        })
    }

    handleValidation(e) {
        e.preventDefault();
        const { name, value } = e.target
        let isError = { ...this.state.isError };
        switch (name) {
            case "title":
                isError.title = value.length > 50 ? "Title is more than 100 characters" : "";
                break;
            case "summary":
                isError.summary = value.length > 140 ? "Summary is more than 140 characters" : "";
                break;
            case "text":
                if (value.includes("[") && value.includes("]")) {
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
                        isError.text = "No actual link included following [], you need to include link in ()";
                        break;
                    }
                }
                isError.text = "";
                break;
            case "tags":
                let tagsArr = value.trim().split(" ");
                if (tagsArr.length > 5) {
                    isError.tags = "Should not be more than 5 tags";
                }
                for (let i = 0; i < tagsArr.length; i++) {
                    if (tagsArr[i].length > 10) {
                        isError.tags = "Length of tag cannot be more than 10 characters";
                    }
                }
                axios.post('http://localhost:8000/check-reputation', { userId:this.props.userID }).then(res => {
                    if(res.status === 403){
                        console.log(res.data);
                        isError.tags = res.data
                    }
                })
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

        const title = e.target[0].value
        const summary = e.target[1].value
        const text = e.target[2].value
        const tags = e.target[3].value

        let newQ = {
            title: title,
            summary: summary,
            text: text,
            tags: tags,
            asked_by: this.props.userID
        }

        axios.post('http://localhost:8000/addquestion', newQ).then(res => {
            if (res.data === "OK") {
                this.props.showPage("QuestionPage");
            }
            else {
                console.log("Error in adding question to server");
            }
            this.handleTitle('');
            this.handleSummary('');
            this.handleText('');
            this.handleTags('');
        })
    };


    render() {
        const { isError } = this.state;
        const askForm = (
            <form id="askForm" onSubmit={this.handleSubmit}>
                <h2>Question Title*</h2>
                <label htmlFor="title">Limit title to 50 characters or less</label>
                <br />
                <textarea type="text" id="title" name="title"
                    value={this.state.title}
                    onChange={this.handleValidation}
                    required
                />
                <span style={{ color: "red" }} display={isError.title ? { display: "visible" } : "none"}>{isError.title}</span>

                <h2>Question Summary*</h2>
                <label htmlFor="summary">Limit summary to 140 characters or less</label>
                <br />
                <textarea type="text" id="summary" name="summary"
                    value={this.state.summary}
                    onChange={this.handleValidation}
                    required
                />
                <span style={{ color: "red" }} display={isError.title ? { display: "visible" } : "none"}>{isError.title}</span>

                <h2>Question Text*</h2>
                <label htmlFor="text">Add details</label>
                <br />
                <textarea type="text" id="text" name="text"
                    value={this.state.text}
                    onChange={this.handleValidation}
                    required
                />
                <span style={{ color: "red" }} display={isError.text ? { display: "visible" } : "none"}>{isError.text}</span>

                <h2>Tags*</h2>
                <label htmlFor="tags">Add keywords separated by whitespace</label>
                <br />
                <textarea type="text" id="tags" name="tags"
                    value={this.state.tags}
                    onChange={this.handleValidation}
                    required
                />
                <span style={{ color: "red" }} display={isError.tags ? { display: "visible" } : "none"}>{isError.tags}</span>

                < br />
                <input id="submitQ" type="submit" />
            </form>
        )
        return askForm
    }
}
