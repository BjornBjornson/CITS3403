const mongoose = require('mongoose')
//tests if NODE_ENV is in test mode
const dbURI = process.env.NODE_ENV.trim() === 'TEST' ? 'mongodb://test:test@ds149431.mlab.com:49431/cits3403-test':'mongodb://project:1@ds143588.mlab.com:43588/data'


mongoose.connect(dbURI)
console.log(dbURI)
mongoose.connection.on('connected', function () {
    console.log('Mongoose.connected to ' + dbURI)
})

mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err)
})

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected')
})


var gracefulShutdown = function (msg, callback) {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through ' + msg)
        callback()
    })
}

const model = require('./schemas.js')
