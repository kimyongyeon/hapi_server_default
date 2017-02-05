'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Inert = require('inert'); // index.html file을 읽기 위해
var mongoose = require('mongoose');

// var member = require('./src/model/member.js');
// console.log(`${member.getMember()} is data `);

function dbConnection() {
    mongoose.connect('mongodb://localhost:27017/test'); // 기본 설정에 따라 포트가 상이 할 수 있습니다.
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback () {
        console.log("mongo db connection OK.");
    });
}

dbConnection(); //db test

// Create a server with a host and port
const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, '/')
            }
        }
    }
});

server.connection({
    host: '192.168.219.102',
    port: 8000
    // routes: { cors: {credentials:true} }
});

// rest server 와 동일하게 포트를 구성
// var io = require('socket.io')(server.listener);
// rest server가 동일하지 않게 포트를 구성
var io = require('socket.io').listen(80);

var MemoSchema= mongoose.Schema({username:String,memo:String});
var Memo = mongoose.model('MemoModel',MemoSchema); // MemoModel : mongodb collection name

// Add the route
server.route([
    {
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply('Hello, world!');
        }
    },
    {
        method: 'GET',
        path: '/users/{username}',
        handler: function (request, reply) {
            console.log(request.params.username);
            var memos = new Memo();
            Memo.findOne({'username':request.params.username},function(err,memo){
                if(err){
                    console.err(err);
                    throw err;
                }
                console.log(memo);
                reply(JSON.stringify(memo));
            });
        }
    },
    {
        method: 'post',
        path: '/insert',
        handler: function (request, reply) {
            console.log(request.payload);
            console.log(request.params.username, request.params.memo);
            var memo = new Memo({username:request.payload.username, memo:request.payload.memo});
            memo.save(function(err, silence) {
                if(err) {
                    console.err(err);
                    throw err;
                }
                reply('success');
            });
        }
    }
]);

server.register(Inert, () => {});
server.route([
    {
        method: 'GET',
        path: '/index',
        handler: {
            file: 'index.html'
        }
    },
    {
        method: 'GET',
        path: '/client',
        handler: {
            file: 'client.html'
        }
    }
]);

// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
// io.set( 'origins', '*localhost:8000' );
io.on('connection', function(socket){

    socket.emit('connection', {
        type: 'connected'
    });

    socket.on('chat message', function(msg){
        console.log(msg);
        io.emit('chat message', msg);
    });
    socket.on('users', function(msg){
        console.log(msg);
        var data = JSON.parse(msg);
        Memo.findOne({'username':data.username},function(err,memo){
            if(err){
                console.err(err);
                throw err;
            }
            console.log(memo);
            io.emit('users', JSON.stringify(memo));
        });
    });
});

// setInterval(function(){
//     io.emit('chat message', 'Cow goes moo');
// }, 1000);
// setInterval(function(){
//     io.emit('chat message', 'game start');
// }, 5000);
