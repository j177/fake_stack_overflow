//Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
let userArgs = process.argv.slice(2);

// first arg [0] is username, second arg [1] is password

// third arg is the mongodb url 
if (!userArgs[2].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the third argument');
    return
}

let Answer = require('./models/answers')
let Question = require('./models/questions')
let Tag = require('./models/tags')
let User = require('./models/users')
let Comment = require('./models/comments')

let bcrypt = require('bcrypt');
let mongoose = require('mongoose');
let mongoDB = userArgs[2];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let tags = [];
let answers = [];

function userCreate(username, email, password, created_date, reputation, t_created, upvoted, downvoted) {
    userdetail = {
        username: username,
        email: email,
        password: password
    }

    if (reputation != false) userdetail.reputation = reputation;
    if (created_date != false) userdetail.created_date = created_date;
    if (t_created != false) userdetail.t_created = t_created;
    if (upvoted != false) userdetail.upvoted = upvoted;
    if (downvoted != false) userdetail.downvoted = downvoted;

    let user = new User(userdetail)
    return user.save()
}

function commentCreate(text, com_by, username, com_date_time, votes) {
    commentdetail = {
        text: text,
        com_by: com_by,
        username: username
    };
    if (com_date_time != false) commentdetail.com_date_time = com_date_time;
    if (votes != false) commentdetail.votes = votes;

    let cmt = new Comment(commentdetail);
    return cmt.save();
}

function tagCreate(name) {
    let tag = new Tag({ name: name });
    return tag.save();
}

function answerCreate(text, ans_by, ans_date_time, votes, comments) {
    answerdetail = {
        text: text,
        ans_by: ans_by
    };

    if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;
    if (votes != false) answerdetail.votes = votes;
    if (comments != false) answerdetail.comments = comments;

    let answer = new Answer(answerdetail);
    return answer.save();
}

function questionCreate(title, summary, text, tags, views, votes, answers, asked_by, ask_date_time, comments) {
    qstndetail = {
        title: title,
        summary: summary,
        text: text,
        tags: tags,
        asked_by: asked_by
    }
    if (answers != false) qstndetail.answers = answers;
    if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
    if (views != false) qstndetail.views = views;
    if (votes != false) qstndetail.votes = votes;
    if (comments != false) qstndetail.comments = comments;

    let qstn = new Question(qstndetail);
    return qstn.save();
}


const populate = async () => {
    // tags
    let t1 = await tagCreate('react');
    let t2 = await tagCreate('javascript');
    let t3 = await tagCreate('android-studio');
    let t4 = await tagCreate('shared-preferences');

    // users 
    let u1 = await userCreate("user1", "user1@email.com", await bcrypt.hash("password1", 10), false, 70, [t1, t2], false, false);
    let u2 = await userCreate("user2", "user2@email.com", await bcrypt.hash("password2", 10), false, 60, t3, false, false);
    let u3 = await userCreate("user3", "user3@email.com", await bcrypt.hash("password3", 10), false, 55, t4, false, false);
    let u4 = await userCreate("user4", "user4@email.com", await bcrypt.hash("password4", 10), false, false, false, false, false);
    let u5 = await userCreate("user5", "user5@email.com", await bcrypt.hash("password5", 10), false, false, false, false, false);
    let admin = await userCreate("admin", "admin@email.com", await bcrypt.hash("admin123", 10), false, 100, false, false, false);

    // comments
    let c1 = await commentCreate("comment1", u1, u1.username, false, 0)
    let c2 = await commentCreate("comment2", u2, u2.username, false, 0)
    let c3 = await commentCreate("comment3", u3, u3.username, false, 0)
    let c4 = await commentCreate("comment4", u4, u4.username, false, 0)

    // answers
    let a1 = await answerCreate("answer1", u1, false, false, false);
    let a2 = await answerCreate("answer2", u1, false, false, false)
    let a3 = await answerCreate("answer3", u2, false, false, false);
    let a4 = await answerCreate("answer4", u3, false, false, false);
    let a5 = await answerCreate("answer5", u4, false, false, false);
    let a6 = await answerCreate("answer6", u5, false, false, false);
    let a7 = await answerCreate("answer7", u2, false, false, false);
    let a8 = await answerCreate("answer8", u2, false, false, false);

    // questions
    await questionCreate("question1", "summary1", "text1", [t1, t2, t3, t4], false, false, [a3], u1, false, false);
    await questionCreate("question2", "summary2", "text2", [t2, t3], false, false, [a1, a2], u2, false, false);
    await questionCreate("question3", "summary3", "text3", t4, false, false, [a5], u3, false, false);
    await questionCreate("question4", "summary4", "text4", t2, false, false, [a4], u4, false, false);
    await questionCreate("question5", "summary5", "text5", t3, false, false, [], u5, false, false);
    await questionCreate("question6", "summary6", "text6", t2, false, false, [a6], u1, false, false);
    await questionCreate("question7", "summary7", "text7", t3, false, false, [], u2, false, false);
    await questionCreate("question8", "summary8", "text8", [t3, t4], false, false, [], u3, false, false);
    await questionCreate("question9", "summary9", "text9", t4, false, false, [a7, a8], u4, false, false);
    await questionCreate("question10", "summary10", "text10", t4, false, false, [], u5, false, false);

    if (db) db.close();
    console.log('done');
}

populate()
    .catch((err) => {
        console.log('ERROR: ' + err);
        if (db) db.close();
    });

console.log('processing ...');
