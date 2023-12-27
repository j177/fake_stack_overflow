import React from 'react'
import ProfilePage from "./ProfilePage";
import axios from 'axios'

export default class UserNewQuestionPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ques: "",
            tags: [],
            value: "",
            currentUser: "",
            currentPage: 'UserNewQuestionPage',
            isError: {
                title: '',
                summary: '',
                text: ''
            }
        }
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        axios.get(`http://localhost:8000/editq/${this.props.q_id}`).then(res => {
            this.setState({ ques: res.data })
        })
    }

    handleInputChange = (event) => {
        this.setState({
            value: event.target.value,
        });
    };

    handleValidation(e) {
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
            case "title":
                isError.title = this.state.value.length > 50 ? "Text is more than 50 characters" : "";
                break;
            case "summary":
                isError.summary = this.state.value.length > 150 ? "Text is more than 150 characters" : "";
                break;
            default:
                break;
        }

        this.setState({
            isError,
            text: this.state.value
        }, () => {
            if (name === "title") {
                if (isError.title === '') {
                    this.handleNewTitle();
                }
            }
            if (name === "summary") {
                if (isError.summary === '') {
                    this.handleNewSummary();
                }
            }
            if (name === "text") {
                if (isError.text === '') {
                    this.handleNewText();
                }
            }
        });
    }

    handleNewTitle() {
        let items = {
            q_id: this.props.q_id,
            newT: this.state.value,
        }
        axios.post(`http://localhost:8000/update-question-title/${this.state.ques._id}`, items)
            .then(res => {
                this.setState(prevState => ({
                    ques: {
                        ...prevState.ques,
                        title: res.data.title
                    }
                }));
            })
            .then(() => {
                // Fetch the updated question with the new title
                axios.get(`http://localhost:8000/editq/${this.props.q_id}`)
                    .then(res => {
                        this.setState({ ques: res.data });
                    })
                    .catch(error => {
                        console.log('Error occurred during question fetch:', error);
                    });
            }) 
    }

    handleNewSummary() {
        let items = {
            q_id: this.props.q_id,
            newS: this.state.value,
        }
        axios.post(`http://localhost:8000/update-question-summary/${this.state.ques._id}`, items).then(res => {
            this.setState(prevState => ({
                ques: {
                    ...prevState.ques,
                    summary: res.data.summary
                }
            }));
        })
        .then(() => {
            // Fetch the updated question with the new title
            axios.get(`http://localhost:8000/editq/${this.props.q_id}`)
                .then(res => {
                    this.setState({ ques: res.data });
                })
                .catch(error => {
                    console.log('Error occurred during question fetch:', error);
                });
        }) 
    };
    handleNewText() {
        let items = {
            q_id: this.props.q_id,
            newText: this.state.value,
        }
        axios.post(`http://localhost:8000/update-question-text/${this.state.ques._id}`, items).then(res => {
            this.setState(prevState => ({
                ques: {
                    ...prevState.ques,
                    text: res.data.text
                }
            }));
        })
        .then(() => {
            // Fetch the updated question with the new title
            axios.get(`http://localhost:8000/editq/${this.props.q_id}`)
                .then(res => {
                    this.setState({ ques: res.data });
                })
                .catch(error => {
                    console.log('Error occurred during question fetch:', error);
                });
        }) 
    };

    handleDelete() {
        let confirmation = window.confirm('Are you sure you want to delete your question?');
        if (confirmation) {
            axios.post(`http://localhost:8000/delete-question/${this.state.ques._id}`)
                .then(res => {
                    if (res.status === 200) {
                        this.setState({ currentPage: 'ProfilePage' });
                    }
                })
                .catch(error => {
                    console.log('Error occurred during question deletion:', error);
                });
        } else {
            console.log('No option selected');
        }
    }


    render() {
        const { isError } = this.state;

        if (this.state.currentPage === 'ProfilePage') {
            return (
                <ProfilePage
                    userID={this.props.userID}
                    showPage={this.props.showPage}
                />
            )
        } else {

            return (
                <div className="wrapper">
                    <div className="container"></div>
                    <div id='user-newQ-page'>
                        <h1>New Question Page</h1>
                        <p>Currently editing: {this.state.ques.title}</p>
                        <button onClick={this.handleDelete}>Delete Question</button>
                        <br /><br /><br />
                        <i><p>Press enter to save changes to any of the items below!</p></i>

                        <p>Title: {this.state.ques.title}</p>
                        <input name="title" type="text"
                            onChange={this.handleInputChange}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    this.handleValidation(event);
                                }
                            }}
                        />
                        <span style={{ color: "red" }} display={isError.title ? { display: "visible" } : "none"}> {isError.title}</span>

                        <br /> <br />
                        <p>Summary: {this.state.ques.summary}</p>
                        <input name="summary" type="text"
                            onChange={this.handleInputChange}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    this.handleValidation(event);
                                }
                            }}
                        />
                        <span style={{ color: "red" }} display={isError.summary ? { display: "visible" } : "none"}> {isError.summary}</span>

                        <br /> <br />
                        <p>Text: {this.state.ques.text}</p>
                        <input name="text" type="text"
                            onChange={this.handleInputChange}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    this.handleValidation(event);
                                }
                            }}
                        />
                        <span style={{ color: "red" }} display={isError.text ? { display: "visible" } : "none"}> {isError.text}</span>

                    </div>
                </div>
            )
        }
    }
}
