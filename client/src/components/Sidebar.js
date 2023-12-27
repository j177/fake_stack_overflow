import React from "react";


export default class Sidebar extends React.Component{

    render(){
        return(
            <div className="sidebar">
            <button id="question-sidebar" className="sidebar-item" onClick={(e) => { this.props.showPage("QuestionPage") }}>Questions</button>
            <button id="tag-sidebar" className="sidebar-item" onClick={(e) => { this.props.showPage("TagPage") }}>Tags</button>
          </div>
        )
    }
}