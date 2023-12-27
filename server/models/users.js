// User Document Schema
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UsersSchema = new Schema(
    {   
        username:{type: String, required: true},
        email:{type: String, required: true},
        password:{type: String, required: true},
        created_date: {type: Date, default: Date.now},
        reputation: {type: Number, default: 0},
        t_created: [{type: Schema.Types.ObjectId, ref:'Tags'}],
        upvoted: [{type: Schema.Types.ObjectId}],
        downvoted: [{type: Schema.Types.ObjectId}],
    }
)

UsersSchema.virtual('url')
.get(function(){
    return 'posts/user/' + this._id;
})

module.exports = mongoose.model('Users', UsersSchema)