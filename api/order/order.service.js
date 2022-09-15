const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')
const utilService =require('../../services/util.service.js')

const PAGE_SIZE = 3;
let pageIdx = 0;

async function query(filterBy = {}) {
    // const criteria = _buildCriteria(filterBy);
    try {
        // const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('order')
        const allOrders = await collection.find({}).toArray()
        // const orders = await collection.find(criteria).toArray()//alternative to upper line
        // var orders = await collection.aggregate([
        //     {
        //         $match: filterBy
        //     },
        //     {
        //         $lookup:
        //         {
        //             localField: 'byUserId',
        //             from: 'user',
        //             foreignField: '_id',
        //             as: 'byUser'
        //         }
        //     },
        //     {
        //         $unwind: '$byUser'
        //     },
        //     {
        //         $lookup:
        //         {
        //             localField: 'aboutUserId',
        //             from: 'user',
        //             foreignField: '_id',
        //             as: 'aboutUser'
        //         }
        //     },
        //     {
        //         $unwind: '$aboutUser'
        //     }
        // ]).toArray()
        // orders = orders.map(order => {
        //     order.byUser = { _id: order.byUser._id, fullname: order.byUser.fullname }
        //     order.aboutUser = { _id: order.aboutUser._id, fullname: order.aboutUser.fullname }
        //     delete order.byUserId
        //     delete order.aboutUserId
        //     return order
        // })
        // orders.sort((order1, order2) => {
        //     if (filterBy.sortBy === 'price') return order1.price - order2.price;
        //     return order1.name.localeCompare(order2.name);
        // });

        // const startIdx = _getStartIdx(filterBy.pageDiff, orders.length);
        // orders = orders.slice(startIdx, startIdx + PAGE_SIZE);
        // return { orders, allOrders };
        return allOrders
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }

}

// async function remove(orderId) {
//     try {
//         const store = asyncLocalStorage.getStore()
//         const { userId, isAdmin } = store
//         const collection = await dbService.getCollection('order')
//         // remove only if user is owner/admin
//         const query = { _id: ObjectId(orderId) }
//         if (!isAdmin) query.byUserId = ObjectId(userId)
//         await collection.deleteOne(query)
//         // return await collection.deleteOne({ _id: ObjectId(orderId), byUserId: ObjectId(userId) })
//     } catch (err) {
//         logger.error(`cannot remove order ${orderId}`, err)
//         throw err
//     }
// }


async function add(order) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.insertOne(order)
        return order;
    } catch (err) {
        logger.error('cannot insert order', err)
        throw err
    }
}


async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('order');
        const order = await collection.findOne({ _id: ObjectId(orderId) });
        return order;
    } catch (err) {
        throw err;
    }
}

async function save(order) {
    console.log('order:', order)
    try {
        let savedOrder = null;
        const collection = await dbService.getCollection('order');
        if (order._id) {
            const orderToUpdate = { ...order };// change to only updatable fields
            delete orderToUpdate._id;
            await collection.updateOne({'_id': ObjectId(order._id) }, { $set: orderToUpdate });
            return order;
        } else {
            order.createdAt = Date.now();
            savedOrder = await collection.insert(order);
            
            return savedOrder;
        }
    } catch (err) {
        throw err;
    }
}

// function _buildCriteria(filterBy) {
//     let typesCriteria;
//     if (filterBy.types && filterBy.types.length) {
//         filterBy.types = filterBy.types.split(',');
//         typesCriteria = filterBy.types.map((type) => {
//             return { type };
//         });
//     }
//     const criteria = {};
//     if (filterBy.name) {
//         const txtCriteria = { $regex: filterBy.name, $options: 'i' };
//         criteria.name = txtCriteria;
//     }
//     if (filterBy.inStock !== 'all') criteria.inStock = JSON.parse(filterBy.inStock);
//     if (filterBy.types && filterBy.types.length) criteria.$or = typesCriteria;
//     return criteria;
// }

// async function addReview(toyId, review){
//     try{
//         const toy = await getById(toyId) ;
//         if(!toy.reviews) toy.reviews = [];
//         toy.reviews.push(review)
//         await save(toy);
//         return(review)
//     } catch (err) {
//         throw err;
//     }
// }

// async function addMsg({msg, toyId}){
//     try{
//         msg.createdAt = Date.now();
//         msg.id = utilService.makeId();
//         const toy = await getById(toyId);
//         if(!toy.msgs) toy.msgs = []
//         toy.msgs.push(msg);
//         save(toy);
//     }catch (err) {
//         throw err;
//     }
// }


function _getStartIdx(diff, amount) {
    pageIdx += +diff;
    const maxPageIdx = amount % PAGE_SIZE === 0 ? amount / PAGE_SIZE - 1 : amount / PAGE_SIZE;
    const pageCount = parseInt(maxPageIdx) + 1;
    pageIdx = (pageIdx + pageCount) % pageCount;
    return pageIdx * PAGE_SIZE;
}

// function _buildCriteria(filterBy) {
//     const criteria = {}
//     return criteria
// }

module.exports = {
    query,
    add,
    getById,
    save,
}
// remove,
// addReview,
// addMsg

