const express = require('express')
const {requireAuth} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {addOrder, getOrders, getOrderById, updateOrder} = require('./order.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)//????????
// router.use(log)//????????

router.get('/', log, getOrders)
router.get('/:orderId', log, getOrderById)
router.post('/',  log, requireAuth, addOrder)
router.put('/:orderId',  log, requireAuth, updateOrder)
// router.delete('/',  requireAuth, deleteOrder)

module.exports = router