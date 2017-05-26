const mongoose = require('mongoose')
const Schema = mongoose.Schema
var bcrypt = require('bcrypt-nodejs');
var userSchema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: {type: String, required: true },
        region: { type: String, enum: ['NA','LA','EU','CK','OCE'], required: true },
        ageGroup: { type: String, enum: ['13-18','19-24','25-30','30+'], required: true },
        active: { type: String, enum: ['Morning','Afternoon','Night','Nocturnal'], required: true },
		grouplist: [{type: Schema.ObjectId, ref:'groups' }],
        blacklist: [{ type: Schema.ObjectId, ref: 'users' }]
    }
)

userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);
}

userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.password);
}

var groupSchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        game: { type: String, enum: ['LOL','DOTA','HOTS'], required: true },
        mode: { type: String, enum: ['Ranked','Casual','Both'], required: true },
        region: { type: String, enum: ['NA','LA','EU','CK','OCE'], required: true },
        players: [{ type: Schema.ObjectId, ref: 'users' }],
        roles: { type: Array, default: [] }
    }
)

var conversationSchema = new Schema(
    {
	participants: [{ type: Schema.ObjectId, ref: 'users'}]
    }
)
var msgSchema = new Schema(
    {
        author: { type: Schema.ObjectId, ref: 'users' },
        conversation: { type: Schema.ObjectId, ref: 'conversations' }, /
        message: { type: String },
        timestamp: { type: Date }
    }
)

mongoose.model('users', userSchema)
mongoose.model('groups', groupSchema)
mongoose.model('conversations', conversationSchema)
mongoose.model('msgs', msgSchema)

//exporting for testing purpose
module.exports = {
  User : mongoose.model('users',userSchema),
  Group : mongoose.model('groups',groupSchema),
  Conversation : mongoose.model('conversations', conversationSchema),
  Message : mongoose.model('msgs', msgSchema)
}
