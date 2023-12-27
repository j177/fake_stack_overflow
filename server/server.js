// Application server

// constants
const bcrypt = require('bcrypt');
const express = require('express');
const session = require('express-session');
const app = express();
const port = 8000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// models 
let Answers = require('./models/answers.js')
let Questions = require('./models/questions.js')
let Tags = require('./models/tags.js')
let users = require('./models/users.js')
let Comments = require('./models/comments.js')

// cors, mongoose
let cors = require('cors')
let mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
let mongoDB = 'mongodb://127.0.0.1/fake_so';
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const store = new MongoDBStore({
  uri: mongoDB,
  collection: 'sessions'
});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', function () {
  console.log('Connected to database');

  // use session
  app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  }));

  // GET FUNCTIONS
  app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }));

  app.get('/e/:email', async (req, res) => {
    var email = req.params.email
    console.log("email", email);
    let foundEmail = await users.findOne({ email: email }).exec()
    console.log("foundEmail", foundEmail)
    res.send(foundEmail)
  })

  app.get('/user/:userID', async (req, res) => {
    let userFound = await users.find({ _id: req.params.userID }, 'username').exec()
    res.send(userFound[0].username)
  })

  app.get('/finduser/:userID', async (req, res) => {
    let userID = req.params.userID;
    let u = await users.findById(userID)
    res.send(u)
  })

  app.get('/findquestions/:userID', async (req, res) => {
    let userID = req.params.userID;
    let q_list = await Questions.find({ asked_by: userID });
    res.send(q_list);
  });

  app.get('/editq/:id', async (req, res) => {
    let q_id = req.params.id;
    let q = await Questions.findById(q_id)
    res.send(q)
  });

  app.get('/questions-answered/:id', async (req, res) => {
    try {
      let user_id = req.params.id;
      let answers = await Answers.find({ ans_by: user_id });
      let answerIds = answers.map(answer => answer._id);
  
      let questions = await Questions.find({ answers: { $in: answerIds } });
  
      res.send(questions);
    } catch (err) {
      res.sendStatus(500);
    }
  });
  

  app.get('/questions', async (req, res) => {
    let questions_list = await Questions.find().sort({ ask_date_time: -1 }).populate('tags').populate('asked_by', 'username').exec()
    //console.log(questions_list)
    res.send(questions_list)
  })

  app.get('/tags', async (req, res) => {
    let tags_list = await Tags.aggregate([
      { $lookup: { from: 'questions', localField: '_id', foreignField: 'tags', as: 'questions' } },
      { $project: { name: 1, question_count: { $size: '$questions' } } }
    ])
    res.send(tags_list)
  })

  app.get('/answers', async (req, res) => {
    let answers_list = await Answers.aggregate([
      { $lookup: { from: 'questions', localField: '_id', foreignField: 'answers', as: 'questions' } },
      { $lookup: { from: 'comments', localField: 'comments', foreignField: '_id', as: 'comments' } },
      {
        $lookup: {
          from: 'users', let: { ans_by_id: '$ans_by' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$ans_by_id'] } } },
            { $project: { _id: 1, username: 1 } }
          ], as: 'ans_by'
        }
      },
      {
        $project: {
          text: 1,
          ans_by: { $arrayElemAt: ['$ans_by', 0] },
          ans_date_time: 1,
          votes: 1,
          comments: '$comments',
          question: '$questions'
        }
      }
    ]);
    res.send(answers_list);
  });


  app.get('/comments', async (req, res) => {
    let comments_list = await Comments.aggregate([
      { $project: { text: 1, com_by: 1, username: 1, com_date_time: 1, votes: 1 } }
    ])
    res.send(comments_list)
  });

  app.get('/search/:term', async (req, res) => {
    let text = req.params.term.split(" ");

    let tagList = [];
    let questionList = [];

    for (i = 0; i < text.length; i++) {
      if (text[i].charAt(0) == "[" && text[i].charAt(text[i].length - 1) == "]") {
        tagList.push(text[i].substring(1, text[i].length - 1).toLowerCase());
      } else {
        questionList.push(new RegExp(text[i], 'i'));
      }
    }

    let tagFound = await Tags.find({ name: { $in: tagList } })

    let questionFound = await Questions.find({
      $or: [
        { title: { $in: questionList } },
        { text: { $in: questionList } },
        { tags: { $in: tagFound } },
      ]
    }).populate("tags").exec()

    console.log("questionFound", questionFound);
    res.send(questionFound)
  })

  app.get('/login/:current', async (req, res) => {
    req.session.currentPage = req.params.current
    console.log("req.session.userID", req.session.userID);
    //console.log("id? ", req.session.userID);

    res.send(req.session.userID)
  })

  app.get('/check', async (req, res) => {
    if (req.session) {
      res.send({
        userID: req.session.userID,
        current: req.session.currentPage
      })
    } else {
      res.send({
        login: false
      })
    }
  })


  // POST FUNCTIONS
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.post('/adduser', async (req, res) => {
    let newUser = req.body
    createUser(newUser.username, newUser.email, newUser.password)
    res.sendStatus(200)
  })

  app.post('/login', async (req, res) => {
    let cred = req.body;
    let email = cred.email;
    let password = cred.password;

    let foundUser = await users.findOne({ email: email }).exec();
    if (!foundUser) {
      // user not found
      res.send("Email is unregistered");
    }
    else {
      bcrypt.compare(password, foundUser.password, (error, response) => {
        if (response) {
          console.log("correct password!")
          //console.log("founduser: ", foundUser)
          req.session.userID = foundUser._id
          req.session.save();

          res.send({ userID: req.session.userID });
        } else {
          res.send("Password is incorrect");
        }
      })
    }
  })

  app.post('/delete-question/:q_id', async (req, res) => {
    try {
      let q = await Questions.findById(req.params.q_id);

      // Delete answer comments and answer
      for (let i = 0; i < q.answers.length; i++) {
        let answer = await Answers.findById(q.answers[i]._id);
        for (let j = 0; j < answer.comments.length; j++) {
          await Comments.findByIdAndDelete(answer.comments[j]._id);
        }
        //await answer.deleteOne();
      }

      // Delete comments for the question itself
      for (let i = 0; i < q.comments.length; i++) {
        await Comments.findByIdAndDelete(q.comments[i]._id);
      }

      const tags = q.tags;
      for (let i = 0; i < tags.length; i++) {
        let tagCount = await Questions.countDocuments({ tags: { $in: tags[i] } });
        console.log("count ", tagCount)
        if (tagCount === 1) {
          let del_tag = await Tags.findById(tags[i]);
          await del_tag.deleteOne();
        }
      }

      await q.deleteOne();
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(500);
    }
  });

  app.post('/update-question-title/:q_id', async (req, res) => {
    try {
      let q = await Questions.findByIdAndUpdate(req.body.q_id, {title: req.body.newT});
      res.send(q);
    } catch (err) {
      res.sendStatus(500);
    }
  })

  app.post('/update-question-summary/:q_id', async (req, res) => {
    try {
      let q = await Questions.findByIdAndUpdate(req.body.q_id, {summary: req.body.newS});
      res.send(q);
    } catch (err) {
      res.sendStatus(500);
    }
  })

  app.post('/update-question-text/:q_id', async (req, res) => {
    try {
      let q = await Questions.findByIdAndUpdate(req.body.q_id, {text: req.body.newText});
      res.send(q);
    } catch (err) {
      res.sendStatus(500);
    }
  })


  app.post('/check-reputation', async (req, res) => {
    const userId = req.body.userId;

    let u = await users.findById(userId);

    if (u.reputation >= 50) {
      res.sendStatus(200);
    } else {
      return res.status(403).send('User does not have enough reputation points to post comment');
    }
  })

  app.post('/check-reputation/voting', async (req, res) => {
    const userId = req.body.userId; // user ID (._id) in the request body
    const model_id = req.body.model_id; // the type of model we are upvoting/downvoting
    const type = req.body.type;
    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    if (type !== 'c_upvote') {
      if (user.reputation < 50) {
        return res.status(403).send('User does not have enough reputation points to upvote/downvote');
      }
    }

    // to update the reputation of person who posted model_id
    let user_update = "";
    if (type.includes("q_")) {
      const q = await Questions.findById(model_id);
      user_update = q.asked_by;
    } else if (type.includes("a_")) {
      const a = await Answers.findById(model_id);
      user_update = a.asked_by;
    }

    const has_upvoted = user.upvoted.includes(model_id);
    const has_downvoted = user.downvoted.includes(model_id);

    switch (type) {
      case ("q_upvote"):
        if (has_upvoted) {
          await Questions.findByIdAndUpdate(model_id, { $inc: { votes: -1 } });
          await users.findByIdAndUpdate(user_update, { $inc: { reputation: -5 } });
          user.upvoted.pull(model_id);
          res.json({ message: 'remove' });

        } else {
          user.upvoted.push(model_id);

          if (has_downvoted) {
            user.downvoted.pull(model_id);
            await Questions.findByIdAndUpdate(model_id, { $inc: { votes: 2 } });
            await users.findByIdAndUpdate(user_update, { $inc: { reputation: 15 } });
            res.json({ message: 'success2' });
          } else {
            await Questions.findByIdAndUpdate(model_id, { $inc: { votes: 1 } });
            await users.findByIdAndUpdate(user_update, { $inc: { reputation: 5 } });
            res.json({ message: 'success' });
          }
        }
        await user.save();
        break;

      case ("q_downvote"):
        if (has_downvoted) {
          await Questions.findByIdAndUpdate(model_id, { $inc: { votes: 1 } });
          await users.findByIdAndUpdate(user_update, { $inc: { reputation: 10 } });
          user.downvoted.pull(model_id);
          res.json({ message: 'success' });

        } else {
          user.downvoted.push(model_id);

          if (has_upvoted) {
            user.upvoted.pull(model_id);
            await Questions.findByIdAndUpdate(model_id, { $inc: { votes: -2 } });
            await users.findByIdAndUpdate(user_update, { $inc: { reputation: -15 } });
            res.json({ message: 'remove2' });
          } else {
            await Questions.findByIdAndUpdate(model_id, { $inc: { votes: -1 } });
            await users.findByIdAndUpdate(user_update, { $inc: { reputation: -10 } });
            res.json({ message: 'remove' });
          }
        }
        await user.save();
        break;

      case ("a_upvote"):
        if (has_upvoted) {
          await Answers.findByIdAndUpdate(model_id, { $inc: { votes: -1 } });
          await users.findByIdAndUpdate(user_update, { $inc: { reputation: -5 } });
          user.upvoted.pull(model_id);
          res.json({ message: 'remove' });

        } else {
          user.upvoted.push(model_id);

          if (has_downvoted) {
            user.downvoted.pull(model_id);
            await Answers.findByIdAndUpdate(model_id, { $inc: { votes: 2 } });
            await users.findByIdAndUpdate(user_update, { $inc: { reputation: 15 } });
            res.json({ message: 'success2' });
          } else {
            await Answers.findByIdAndUpdate(model_id, { $inc: { votes: 1 } });
            await users.findByIdAndUpdate(user_update, { $inc: { reputation: 5 } });
            res.json({ message: 'success' });
          }
        }
        await user.save();
        break;

      case ("a_downvote"):
        if (has_downvoted) {
          await Answers.findByIdAndUpdate(model_id, { $inc: { votes: 1 } });
          await users.findByIdAndUpdate(user_update, { $inc: { reputation: 10 } });
          user.downvoted.pull(model_id);
          res.json({ message: 'success' });

        } else {
          user.downvoted.push(model_id);

          if (has_upvoted) {
            user.upvoted.pull(model_id);
            await Answers.findByIdAndUpdate(model_id, { $inc: { votes: -2 } });
            await users.findByIdAndUpdate(user_update, { $inc: { reputation: -15 } });
            res.json({ message: 'remove2' });
          } else {
            await Answers.findByIdAndUpdate(model_id, { $inc: { votes: -1 } });
            await users.findByIdAndUpdate(user_update, { $inc: { reputation: -10 } });
            res.json({ message: 'remove' });
          }
        }
        await user.save();
        break;

      case ("c_upvote"):
        if (has_upvoted) {
          await Comments.findByIdAndUpdate(model_id, { $inc: { votes: -1 } });
          user.upvoted.pull(model_id);
          res.json({ message: 'remove' });

        } else {
          await Comments.findByIdAndUpdate(model_id, { $inc: { votes: 1 } });
          user.upvoted.push(model_id);
          res.json({ message: 'success' });
        }
        await user.save();
        break;
    }
  });

  // Sort questions by newest date
  app.post('/questions/newest', async (req, res) => {
    let data = req.body.data;
    const sortedQuestions = await sortNew(data);
    res.send(sortedQuestions);
  });

  // Sort questions by most recently answered
  app.post('/questions/active', async (req, res) => {
    let data = req.body.data;
    const sortedQuestions = await sortActive(data);
    res.send(sortedQuestions);
  });

  // Display questions with no answers
  app.post('/questions/unanswered', async (req, res) => {
    let data = req.body.data;
    const sortedQuestions = await sortUnanswered(data);
    res.send(sortedQuestions);
  });

  app.post('/addquestion', async (req, res) => {
    let newQ = req.body;
    let title = newQ.title;
    let summary = newQ.summary;
    let text = newQ.text;
    let tags = newQ.tags;
    let asked_by = newQ.asked_by;

    try {
      let user = await users.findOne({ _id: asked_by }).exec();

      let tagsArr = Array.isArray(tags) ? tags : tags.split(/[ ,]+/);
      let setOfTag = new Set(tagsArr.map(item => item.toLowerCase()));
      let pretags = Array.from(setOfTag);

      const finalTags = [];

      for (let i = 0; i < pretags.length; i++) {
        let matchedTag = await getTag([pretags[i]]);
        if (matchedTag === null) {
          let newTag = await createTag(pretags[i]);
          finalTags.push(newTag);
        } else {
          finalTags.push(matchedTag);
        }
      }

      const ffinalTagList = [...new Set(finalTags)];
      console.log(getUsername(asked_by));
      createQuestion(title, summary, text, ffinalTagList, 0, 0, 0, user, new Date(), []);
      return res.sendStatus(200);
    } catch (error) {
      console.error(error);
      return res.status(500).send("An error occurred while processing your request.");
    }
  });

  app.post('/addanswer', async (req, res) => {
    let newA = req.body
    let text = newA.text
    let ans_by = newA.asked_by

    let user = await users.findOne({ _id: ans_by }).exec();
    // creating answer
    let a = await createAnswer(text, user, new Date(), 0, []);

    // updating question
    let questionId = newA.q;
    console.log("q: ", questionId)
    await Questions.findByIdAndUpdate(
      questionId,
      { $push: { answers: a } },
      { new: true } // returns the updated document
    );

    res.sendStatus(200);
  })

  // increment # views for the specified question (found by question's id)
  app.post('/questionsviews/:id', async (req, res) => {
    const questionId = req.params.id;
    await Questions.findByIdAndUpdate(questionId, { $inc: { views: 1 } });
    res.sendStatus(200);
  });

  app.post('/questions/:id/comments', async (req, res) => {
    let newC = req.body;
    let user_id = newC.user_id;
    console.log(user_id)
    let com_by = await users.findById(user_id);
    let username = com_by.username;

    // creating comment
    let c = await createComment(newC.text, com_by, username, new Date());
    console.log("new c: ", c);

    // updating question
    let questionId = newC.q;
    await Questions.findByIdAndUpdate(
      questionId,
      { $push: { comments: c } },
      { new: true } // returns the updated document
    );

    await Comments.findByIdAndUpdate(
      com_by._id,
      { $push: { comments: c } },
      { new: true }
    )

    // updating user's comments
    await users.findByIdAndUpdate(
      com_by._id,
      { $push: { comments: c } },
      { new: true }
    )

    res.send(c);
  });

  app.post('/answers/:id/comments', async (req, res) => {
    let newC = req.body;
    let user_id = newC.user_id;

    let com_by = await users.findById(user_id);
    console.log("user? ", com_by)
    let username = com_by.username;

    // creating comment
    let c = await createComment(newC.text, com_by._id, username, new Date());
    console.log("new c: ", c);

    // updating question
    let ansID = newC.a;
    await Answers.findByIdAndUpdate(
      ansID,
      { $push: { comments: c } },
      { new: true } // returns the updated document
    );

    await Comments.findByIdAndUpdate(
      com_by._id,
      { $push: { comments: c } },
      { new: true }
    )

    // updating user's comments
    await users.findByIdAndUpdate(
      com_by._id,
      { $push: { comments: c } },
      { new: true }
    )

    res.send(c);
  });

  app.post('/logout', (req, res) => {
    store.destroy(err => { })
    res.sendStatus(200)
  })
});

process.on('SIGINT', () => {
  if (db) {
    db.close()
      .then((result) => console.log('DB connection closed'))
      .catch((err) => console.log(err));
  }
  console.log('process terminated');
  process.exit()
})

// helper functions 
async function createUser(username, email, password) {
  userInner = {
    username: username,
    email: email,
    password: await bcrypt.hash(password, 10)
  }
  let user = new users(userInner)
  return user.save()
}

function createComment(text, com_by, username, com_date_time, votes) {
  newC = {
    text: text,
    com_by: com_by,
    username: username
  }

  if (com_date_time != false) newC.com_date_time = com_date_time;
  if (votes != false) newC.votes = votes;

  let c = new Comments(newC);
  return c.save();
}

function createQuestion(title, summary, text, tags, views, votes, answers, asked_by, ask_date_time, comments) {
  newQ = {
    title: title,
    summary: summary,
    text: text,
    tags: tags,
    asked_by: asked_by
  }
  if (answers != false) newQ.answers = answers;
  if (ask_date_time != false) newQ.ask_date_time = ask_date_time;
  if (views != false) newQ.views = views;
  if (votes != false) newQ.votes = votes;
  if (comments != false) newQ.comments = comments;

  let q = new Questions(newQ);
  return q.save();
}

function createTag(name) {
  let tag = new Tags({ name: name });
  return tag.save();
}

// $regex operator is used to perform a case-insensitive search
function getTag(name) {
  return Tags.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
}

function createAnswer(text, ans_by, ans_date_time, votes, comments) {
  newA = {
    text: text,
    ans_by: ans_by,
    comments: comments
  };
  if (votes != false) newA.votes = votes;
  if (ans_date_time != false) newA.ans_date_time = ans_date_time;

  let ans = new Answers(newA);
  return ans.save();
}

// sorting functions
function sortNew(data) {
  let questions_list = Questions.find({ _id: { $in: data } }).sort({ ask_date_time: -1 }).populate('tags').exec();
  return questions_list;
}

function sortActive(data) {
  let questions_list = Questions.find({ _id: { $in: data } }).sort({ ans_date_time: -1 }).populate('tags').exec();
  return questions_list;
}

function sortUnanswered(data) {
  let questions_list = Questions.find({ _id: { $in: data } }).find({ answers: { $size: 0 } }).populate('tags').exec();
  return questions_list;
}


// get username
function getUsername(userID) {
  let username = users.find({ _id: userID }, 'username').exec()
  return username;
}