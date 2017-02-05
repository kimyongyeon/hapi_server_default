var mongoose = require('mongoose');

var member = mongoose.Schema({
    name: String,
    phone: Number,
    sex: Boolean
});

exports.getMember = function() {
    return member;
};
