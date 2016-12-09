var mongoose = require('mongoose');

var FalastraoEventsSchema = new mongoose.Schema({
    event: { type: String, required: true },
    start: { type: Boolean, required: true },
    date: { type: Date, default: Date.now(), required: true },
    _user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }
});

module.exports = mongoose.model('FalastraoEvents', FalastraoEventsSchema);