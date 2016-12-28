var mongoose = require('mongoose');

var FalastraoEventsSchema = new mongoose.Schema({
    event: { type: String, required: true },
    start: { type: Boolean, required: true },
    date: { type: Date, default: Date.now(), required: true, index: true },
    _user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    timezoneOffset: { type: Number, required: true }
});

FalastraoEventsSchema.methods.getLastStatusEvents = function(callBack) {
    this.model('FalastraoEvents').aggregate(
        [{
                $match: {
                    date: {
                        $gte: new Date(new Date().toJSON().slice(0, 10) + "T00:00:00.0Z"),
                        $lt: new Date(new Date().toJSON().slice(0, 10) + "T23:59:59.0Z")
                    }
                }
            },
            { $sort: { event: 1, date: 1 } },
            {
                $group: {
                    _id: "$event",
                    running: { $last: "$start" },
                    count: { $sum: 0.5 }
                }
            }
        ],
        function(err, result) {
            callBack(err, result);
        }
    );
};

FalastraoEventsSchema.statics.getChartData = function(callBack) {
    return this.model('FalastraoEvents').aggregate(
        [{
                $match: {
                    date: {
                        $gte: new Date(new Date().toJSON().slice(0, 10) + "T00:00:00.0Z"),
                        $lt: new Date(new Date().toJSON().slice(0, 10) + "T23:59:59.0Z")
                    }
                }
            },
            {
                $project: {
                    dateLocal: {
                        $subtract: ["$date", "$timezoneOffset"]
                    },
                    event: "$event"
                }
            },
            {
                $group: {
                    _id: {
                        "event": "$event",
                        "year": { "$year": "$dateLocal" },
                        "month": { "$month": "$dateLocal" },
                        "day": { "$dayOfMonth": "$dateLocal" },
                        "hour": { "$hour": "$dateLocal" }
                    },
                    count: { $sum: 0.5 }
                }
            },
            {
                $sort: {
                    event: 1,
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1,
                    "_id.hour": 1
                }
            }
        ],
        function(err, result) {
            callBack(err, result);
        }
    )
};

module.exports = mongoose.model('FalastraoEvents', FalastraoEventsSchema);