import React from 'react'
import axios from 'axios'
import Welcome from './Welcome.js'
import Register from './Register.js'
import Login from './Login.js'
import Banner from './Banner.js'
import QuestionPage from './QuestionPage.js'
import ProfilePage from './ProfilePage.js'
import Sidebar from './Sidebar.js'
import TagPage from './TagPage.js'
import AskQuestion from './AskQuestion.js'
import Search from './Search.js'

export default class FakeStackOverflow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentPage: "Welcome",
      userID: ""
    }
    this.showPage = this.showPage.bind(this);
    this.changeUserID = this.changeUserID.bind(this)
    this.changeLogin = this.changeLogin.bind(this)

  }

  showPage(currentPage) {
    this.setState({
      currentPage: currentPage
    })
    //console.log("in show page")
    axios.get(`http://localhost:8000/login/${currentPage}`, { withCredentials: true }).then(res => {
      this.changeUserID(res.data)
      this.changeLogin(res.data ? true : false)
    })
  }

  changeLogin(loggedIn) {
    this.setState({
      loggedIn: loggedIn
    })
  }

  changeUserID(userID) {
    this.setState({
      userID: userID
    })
    //console.log("changedUserID param: ", userID);
  }

  componentDidMount() {
    axios.get(`http://localhost:8000/check`, { withCredentials: true }).then(res => {
      if (res.data.current) {
        this.changeUserID(res.data.userID)
        this.showPage(res.data.current)
      } else {
        this.changeUserID("")
        this.showPage("Welcome")
      }
    })
  }

  render() {

    let thisPage = (<div> Page not found </div>);
    let showBanner = false;
    let showSidebar = true;

    if (this.state.currentPage === "Welcome") {
      showBanner = false;
      showSidebar = false;
      thisPage = <Welcome
        showPage={this.showPage}
      />
    }

    if (this.state.currentPage === "Register") {
      showBanner = false;
      showSidebar = false;
      thisPage = <Register
        userID={this.state.userID}

        showPage={this.showPage}
      />
    }

    if (this.state.currentPage === "Login") {
      showBanner = false;
      showSidebar = false;
      thisPage = <Login
        changeUserID={this.changeUserID}
        changeLogin={this.changeLogin}
        showPage={this.showPage}

      />
    }

    if (this.state.currentPage === "ProfilePage") {
      showBanner = true;
      showSidebar = true;
      thisPage = <ProfilePage
        showPage={this.showPage}
        userID={this.state.userID}
      />
    }

    if (this.state.currentPage === "QuestionPage") {
      showBanner = true;
      showSidebar = true;
      thisPage = <QuestionPage
        userID={this.state.userID}
        showPage={this.showPage}
      />
    }

      if (this.state.currentPage === "TagPage") {
        showBanner = true;
        showSidebar = true;
        thisPage = <TagPage
          userID={this.state.userID}
          showPage={this.showPage}
        />

      }

      if(this.state.currentPage === "AskQuestion") {
        showBanner = true;
        showSidebar = true;
        thisPage = <AskQuestion
        userID={this.state.userID}
        showPage={this.showPage} />
      }
      
    if (this.state.currentPage.startsWith("Search:")) {
      showBanner = true;
      showSidebar = true;
      thisPage = <Search
        showPage={this.showPage}
        searchTerm={this.state.currentPage.substring(7)}
      />
    }
    

console.log("userID: ", this.state.userID)

    return (
      <>
        {showBanner ? <Banner currentPage={this.state.currentPage} showPage={this.showPage} userID={this.state.userID} /> : <></>}
        {showSidebar ? <Sidebar currentPage={this.state.currentPage} showPage={this.showPage} userID={this.state.userID} /> : <></>}
        {thisPage}
      </>
    )
  }
}

