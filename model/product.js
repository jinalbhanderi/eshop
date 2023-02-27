const mongoose = require("mongoose")
const productschema = new mongoose.Schema({
    cid: {
        type: mongoose.Schema.Types.ObjectId
    },
    pname: {
        type: String
    },
    price: {
        type: String
    },
    qty: {
        type: String
    },
    imgname: {
        type: String
    }
})
module.exports = new mongoose.model("product", productschema)