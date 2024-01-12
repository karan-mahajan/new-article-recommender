const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const readArticleSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    readArticle: Number,
}, {
    timestamps: true
})

module.exports = mongoose.model('ReadArticle', readArticleSchema);