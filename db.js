const mongoose = require('mongoose')

const dbURI = 'mongodb://project2:password@ds062889.mlab.com:62889/cits3403'
mongoose.connect(dbURI)

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