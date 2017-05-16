const mongoose = require('mongoose')
const Schema = mongoose.Schema

var userSchema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: {type: String, required: true },
        region: { enum: ['NA','LA','EU','CK','OCE'], required: true },
        ageGroup: { enum: ['13-18','19-24','25-30','30+'], required: true },
        active: { enum: ['Morning','Afternoon','Night','Nocturnal'], required: true },
        blacklist: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }
)

var groupSchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        game: { enum: ['LOL','DOTA','HOTS'], required: true },
        mode: { enum: ['Ranked','Casual','Both'], required: true },
        region: { enum: ['NA','LA','EU','CK','OCE'], required: true },
        players: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        roles: { type: Array, required: true, 'default': [] }  
    }
)

var mailSchema = new Schema(
    {
        from: { type: Schema.Types.ObjectId, ref: 'User' },
        to: { type: Schema.Types.ObjectId, ref: 'User' },
        message: String,
        timestamp: Date
    }
)

mongoose.model('User', userSchema)
mongoose.model('Group', groupSchema)
mongoose.model('Mail', mailSchema)