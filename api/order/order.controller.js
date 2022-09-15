const logger = require('../../services/logger.service')
// const userService = require('../user/user.service')
// const socketService = require('../../services/socket.service')
const orderService = require('./order.service')

async function getOrders(req, res) {
    try {
        //check if filter needed here or at the front only
        const orders = await orderService.query(req.query)
        res.send(orders)
    } catch (err) {
        logger.error('Cannot get orders', err)
        res.status(500).send({ err: 'Failed to get orders' })
    }
}

async function addOrder(req, res) {
    try {
        var order = req.body
        // order.byUserId = req.session.user._id?????????????????needed here?
        order = await orderService.add(order)
        // prepare the updated order for sending out
        // order.byUser = await userService.getById(order.byUserId)
        // order.aboutUser = await userService.getById(order.aboutUserId)
        // console.log('CTRL SessionId:', req.sessionID);
        // socketService.broadcast({type: 'order-added', data: order})
        // socketService.emitToAll({type: 'user-updated', data: order.byUser, room: req.session.user._id})
        res.send(order)
    } catch (err) {
        console.log(err)
        logger.error('Failed to add order', err)
        res.status(500).send({ err: 'Failed to add order' })
    }
}

async function getOrderById(req, res) {
    try {
        const { orderId } = req.params;
        const order = await orderService.getById(orderId);
        res.send(order);
    } catch (err) {
        res.status(401).send({ err: "Order doesn't exist" });
    }
}

async function updateOrder(req, res) {
    // console.log('body',req.body);
    // console.log('query',req.query);
    try {
        const order = req.body;
        const savedOrder = await orderService.save(order);
        res.send(savedOrder);

    } catch (err) {
        res.status(401).send({ err: 'Order doesn\'t exist' })
    }
}

module.exports = {
    getOrders,
    getOrderById,
    addOrder,
    updateOrder
}

// async function addReview(req,res){
//     console.log('adding');
//     try{
//         const {toyId}= req.params
//         const {review} = req.body
//         console.log('req.body:', req.body)
//         await toyService.addReview(toyId, review)
//     }catch(err){
//         res.status(401).send({err:'Cannot save review'})
//     }
// }

// deleteOrder,
//     async function deleteOrder(req, res) {
//         try {
//             await orderService.remove(req.params.id)
//             res.send({ msg: 'Deleted successfully' })
//         } catch (err) {
//             logger.error('Failed to delete order', err)
//             res.status(500).send({ err: 'Failed to delete order' })
//         }
//     }