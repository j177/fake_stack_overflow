// Comments Document Schema
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentsSchema = new Schema(
    {   
        text: {type: String, required: true},
        com_by: {type: Schema.Types.ObjectId, ref: 'Users', require: true},
        com_date_time: {type: Date, default: Date.now},
        votes: {type: Number, default: 0}
    }
)

CommentsSchema.virtual('url')
.get(function(){
    return 'posts/comments/' + this._id;
})

module.exports = mongoose.model('Comments', CommentsSchema)