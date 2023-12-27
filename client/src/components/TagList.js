import React from "react";
import TagQuestionsPage from './TagQuestionsPage'

export default class TagList extends React.Component {

    render() {
        let { tags, currentPage, handleTagClick, tagName } = this.props;

        const maxTagPerRow = 3;
        let tagRows = []; // to contain all the rows for the tag-table
        for (let i = 0; i < tags.length; i += maxTagPerRow) {
            // to contain all the data for a single row
            const tdItems = [];

            // model has tags.length = 4
            // when j = 3, this for loop ends, tags 0, 1, 2 will be pushed into a row in table
            // i = 3 now, and also i + maxTagPerRow = 6
            // conditional statement in for loops still holds, so tag 3 will be added 
            // when j = 4, for loop terminations and so does the parent for loop
            for (let j = i; j < i + maxTagPerRow && j < tags.length; j++) {
                const tag = tags[j];

                const matchedNum = tag.question_count + " questions"; // to hold the # matched questions
                const tagCell = ( // single cell <td> to hold the tag name and its matched #
                    <td key={tag.name} className="tCell">
                        <div className="tag-box">
                            <button className="make-link" onClick={handleTagClick} tag-name={tag.name}>{tag.name}</button>
                            <div>{matchedNum}</div>
                        </div>
                    </td>
                );

                tdItems.push(tagCell); // push the <td> into an array of <td>s
            }

            tagRows.push(<tr key={i}>{tdItems}</tr>); // push the array of <td>s into a row
        }

        if (currentPage === 'TagPage') {
            return (
                <table id="tag-table" className="tag-table">
                    <tbody>{tagRows}</tbody>
                </table>
            )

        } else if (currentPage === 'TagQuestionsPage') {
            return (
                <TagQuestionsPage
                    tags={tags}
                    userID={this.props.userID}
                    tagName={tagName}
                    showPage={this.props.showPage}
                />
            )
        }
    }
}
