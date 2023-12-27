// Answer Document Schema
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AnswersSchema = new Schema(
    {   
        text: {type: String, required: true},
        ans_by: {type: Schema.Types.ObjectId, ref: 'Users', require: true},
        ans_date_time: {type: Date, default: Date.now},
        votes: {type: Number, default: 0},
        comments: [{type: Schema.Types.ObjectId, ref:'Comments'}]
    }
)

AnswersSchema.virtual('url')
.get(function(){
    return 'posts/answer/' + this._id;
})

module.exports = mongoose.model('Answers', AnswersSchema)