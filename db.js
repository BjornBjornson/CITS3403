const mongoose = require('mongoose')

const dbURI = 'mongodb://project:1@ds143588.mlab.com:43588/data'
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