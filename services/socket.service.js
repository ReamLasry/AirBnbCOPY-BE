const orderService = require('../api/order/order.service')
const userService = require('../api/user/user.service')
const stayService = require('../api/stay/stay.service')
const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null
var gSocketBySessionIdMap = {}
// var hostSocketId=

function connectSockets(http, session) {
    gIo = require('socket.io')(http);
 
    const sharedSession = require('express-socket.io-session');
    gIo.use(sharedSession(session, {
        autoSave: true
    }));
    gIo.on('connection', socket => {
        // console.log('a user connected');
        // console.log('socket.id',socket.id , 'line20');
        // console.log('socket.handshake', socket.handshake)
        // console.log('New socket - socket.handshake.sessionID', socket.handshake.sessionID)
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket
        // if (socket.handshake?.session?.user) socket.join(socket.handshake.session.user._id)//??????????
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null
            }
        })
        //Noa//
        //chat topic variation:
        socket.on('renderOrders',(host)=>{
            console.log(' socket service line 53',host )
            console.log(socket.id)
            // hostId = host._id
            // const userSocketId = socket.id
            gIo.emit ('loadOrders' ,host ) 
            // gIo.to(hostId).emit('loadOrders', host)


        })
        //privat chat room
        socket.on("private message", (anotherSocketId, msg) => {
              socket.to(anotherSocketId).emit("private message", socket.id, msg);
        });

    } ) 
    

}

//IFAT
function emit({ type, data }) {
    console.log('in emit!')
    gIo.emit(type, data)
}
//
// priver message
function emitToUser({ type, data, userSocketId }) {
    gIo.emit(type, data)
}


// Send to all sockets BUT not the current socket 
function broadcast({ type, data, room = null }) {
    const store = asyncLocalStorage.getStore()
    const { sessionId } = store
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')
    const excludedSocket = gSocketBySessionIdMap[sessionId]
    if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map')
    if (room) excludedSocket.broadcast.to(room).emit(type, data)
    else excludedSocket.broadcast.emit(type, data)
}


module.exports = {
    connectSockets,
    // emitToAll,/////////////////////////////////////////////////////// ERAN
    broadcast,
    emit,
    emitToUser
}



