import React from 'react';
import TagList from './TagList';
import axios from 'axios';

export default class TagPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tags: [],
            currentPage: 'TagPage'
        };
        this.handleTagClick = this.handleTagClick.bind(this);
        // bind() method returns a new function with the same function name
        // this is to set the 'this' value explicitly (with the currentPage value and tagName value)
    }

    componentDidMount() {
        axios.get('http://localhost:8000/tags').then((res) => {
            this.setState({ tags: res.data });
        });
    }

    handleTagClick(event) {
        const tagName = event.target.getAttribute('tag-name');
        this.setState({ currentPage: 'TagQuestionsPage', tagName });
    }

    render() {
        let { tags, currentPage, tagName } = this.state;
        let numTags = tags.length;
        let tagOrTags = numTags > 1 ? 'Tags' : 'Tag';

        const tagHeader = (
            <div className="wrapper">
                <div className="container"></div>
                <div id="tag-page-banner" className="tag-page-banner">
                    <h1 id="num-of-tags" className="tag-page-line">
                        {numTags} {tagOrTags}
                    </h1>
                    <h1 id="all-tags" className="tag-page-line">
                        All Tags
                    </h1>
                    <button id="ask-button-tag-pg" className="ask-button tag-page-line" onClick={(e) => { this.props.showPage("AskQuestion") }}>
                        Ask Question
                    </button>
                </div>
            </div>
        );

        return (
            <div id="tag-page" className="tag-page">
                {currentPage === 'TagPage' && tagHeader}
                <TagList
                    tags={tags}
                    userID={this.props.userID}
                    currentPage={currentPage}
                    handleTagClick={this.handleTagClick}
                    tagName={tagName}
                    showPage={this.props.showPage}
                />
            </div>
        );
    }
}
