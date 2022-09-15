const logger = require('../../services/logger.service')
// const userService = require('../user/user.service')
const socketService = require('../../services/socket.service')
const stayService = require('./stay.service')

async function getStays(req, res) {
    try {
        const stays = await stayService.query(req.query)
        res.send(stays)
    } catch (err) {
        logger.error('Cannot get stays', err)
        res.status(500).send({ err: 'Failed to get stays' })
    }
} 


async function getStayById(req, res) {
    try {
        const stayId = req.params.stayId
        const stay = await stayService.getById(stayId)
        res.json(stay)

    } catch (err) {
        logger.error('Cannot get stay by id', err)
        res.status(500).send({ 
            err: 'Failed to get stay by id'
        })
    }
}


async function deleteStay(req, res) {
    try {
        await stayService.remove(req.params.stayId)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete stay', err)
        res.status(500).send({ err: 'Failed to delete stay' })
    }
}


async function addStay(req, res) {
    try {
        var stay = req.body
        const {_id , fullname, imgUrl} = req.session.user
        
        stay.host = {_id , fullname, imgUrl}
        stay = await stayService.add(stay)     
        // prepare the updated review for sending out
        // stay.byUser = await userService.getById(review.byUserId)
        // review.aboutUser = await userService.getById(review.aboutUserId)
        console.log('CTRL SessionId:', req.sessionID);
        socketService.broadcast({type: 'stay-added', data: stay})
        socketService.emitToAll({type: 'stay-updated', data: stay, room: req.session.user._id})
        res.send(stay)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add review', err)
        res.status(500).send({ err: 'Failed to add review' })
    }
}

async function updateStay (req, res) {
    try{
        const {name, price, imgUrls , capacity , amenities , _id , favorites, host, loc, reviews, summary} = req.body
        const stay = {name, price, imgUrls , capacity , amenities , _id , favorites, host, loc, reviews, summary}
        console.log(stay,'stay')
        const savedStay = await stayService.update(stay)
        res.json(savedStay)
    }
    catch(err){
        res.status(500).send('cannot update stay')
    }
}

module.exports = {
    getStays,
    deleteStay,
    addStay,
    getStayById,
    updateStay
}