const mongoose = require("mongoose");


const bookSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        required: true 
    },
    title: { 
        type: String, 
        required: true, 
        index: true 
    },
    author: { 
        type: String, 
        required: true,
        index: true
    },
    description: { 
        type: String, 
        required: true 
    },
    genre: {
        type: String,
        index: true
    },
    publishYear: {
        type: Number
    },
    tags: [{
        type: String
    }],
    embedding: {
        type: [Number],
        default: []
    },
    amr: {
        type: String,
        default: ''
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
})

bookSchema.index({
    title: 'text',
    author: 'text',
    description: 'text'
})

module.exports = mongoose.model("Book", bookSchema);
