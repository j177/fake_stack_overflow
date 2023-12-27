// Question Document Schema
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var QuestionsSchema = new Schema(
    {   
        title:{type: String, required: true, maxLength: 50},
        summary:{type: String, required: true, maxLength: 140},
        text:{type: String, required: true},
        tags: [{type: Schema.Types.ObjectId, ref:'Tags', require: true}],
        views:{type: Number, default: 0},
        votes:{type: Number, default: 0},
        answers: [{type: Schema.Types.ObjectId, ref:'Answers'}],
        asked_by: {type: Schema.Types.ObjectId, ref: 'Users'},
        ask_date_time: {type: Date, default: Date.now},
        comments: [{type: Schema.Types.ObjectId, ref:'Comments'}]
    }
) 

QuestionsSchema.virtual('url')
.get(function(){
    return 'posts/question/' + this._id;
})

module.exports = mongoose.model('Questions', QuestionsSchema)