const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')
const logger = require('../../services/logger.service')


async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('stay')
        const stays = await collection.find(criteria).toArray()
        return stays
        // var stays = await collection.aggregate([
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

    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }

}

async function remove(stayId) {
    try {
        const store = asyncLocalStorage.getStore()
        const {
            userId
        } = store
        const collection = await dbService.getCollection('stay')
        // remove only if user is owner/admin
        const query = {
            _id: ObjectId(stayId)
        }
        const stay = await collection.findOne({
            "_id": ObjectId(stayId)
        })
        if (stay.host._id !== userId) res.status(401).send({
            err: 'Failed to Delete'
        })
        await collection.deleteOne(query)
        // return await collection.deleteOne({ _id: ObjectId(reviewId), byUserId: ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}

async function add(stay) {
    try {
        const collection = await dbService.getCollection('stay') //bring the collection
        await collection.insertOne(stay)
        return stay

    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }

}

async function update(stay) {
    try {
        // peek only updatable fields!
        const stayToAdd = {
            name: stay.name,
            price: stay.price,
            capacity: stay.capacity,
            imgUrls: stay.imgUrls,
            favorites: stay.favorites,
            reviews: stay.reviews,
            amenities: stay.amenities,
            host: stay.host,
            loc: stay.loc,
            summary: stay.summary 
        }
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({
            "_id": ObjectId(stay._id)
        }, {
            $set: stayToAdd
        })
        return stay;
    } catch (err) {
        logger.error('cannot update stay', err)
        throw err
    }
}

async function getById(id) {
    try {
        const collection = await dbService.getCollection('stay') //bring the collection
        const stay = await collection.findOne({
            "_id": ObjectId(id)
        })
        return stay
    } catch (err) {
        logger.error('cannot find stay by id', err)
        throw err
    }
}


function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.location && filterBy.location !== 'undefined') {
        const txtCriteria = {
            $regex: filterBy.location,
            $options: 'i'
        }
        criteria['loc.address'] = txtCriteria
    }
    if (filterBy.guests !== '0') {
        criteria.capacity = {
            $gte: parseInt(filterBy.guests)
        }
    }
    if (filterBy.price !== '0') {
        criteria.price = {
            $lte: parseInt(filterBy.price)
        }
    }
    if (filterBy.amenities !== 'null' && filterBy.amenities !== 'undefined') {
        const amenitiesArray = filterBy.amenities.split(',')
        criteria.amenities = {
            $all: amenitiesArray
        }
    }
    if(filterBy._id !=='null'){
        criteria['host._id'] = filterBy._id
    }
    return criteria
}

module.exports = {
    query,
    remove,
    add,
    update,
    getById
}