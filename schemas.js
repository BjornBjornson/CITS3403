const mongoose = require('mongoose')
const Schema = mongoose.Schema

var userSchema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: {type: String, required: true },
        region: { type: String, enum: ['NA','LA','EU','CK','OCE'], required: true },
        ageGroup: { type: String, enum: ['13-18','19-24','25-30','30+'], required: true },
        active: { type: String, enum: ['Morning','Afternoon','Night','Nocturnal'], required: true },
		grouplist: [{type: Schema.ObjectId, ref:'Group' }],
        blacklist: [{ type: Schema.ObjectId, ref: 'User' }]
    }
)

var groupSchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        game: { type: String, enum: ['LOL','DOTA','HOTS'], required: true },
        mode: { type: String, enum: ['Ranked','Casual','Both'], required: true },
        region: { type: String, enum: ['NA','LA','EU','CK','OCE'], required: true },
        players: [{ type: Schema.ObjectId, ref: 'User' }],
        roles: { type: Array, required: true, 'default': [] }
    }
)

var mailSchema = new Schema(
    {
        from: { type: Schema.ObjectId, ref: 'User' },
        to: [{ type: Schema.ObjectId, ref: 'User' }], //Turning this into an array should allow for groupchat.
        message: String,
        timestamp: Date
    }
)

mongoose.model('User', userSchema)
mongoose.model('Group', groupSchema)
mongoose.model('Mail', mailSchema)

//exporting for testing purpose
module.exports = mongoose.model('User',userSchema)
