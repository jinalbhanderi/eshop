const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { response } = require("express")
const userschema = new mongoose.Schema({
    fname: {
        type: String
    },
    lname: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    gender: {
        type: String
    },
    phno: {
        type: Number
    },
    Tokens: [{
        token: {
            type: String
        }
    }]

})

userschema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 10)
            next()
        }
    } catch (error) {
        response.send(error)
    }
})
userschema.methods.genratetoken=async function(){
    try {
        const token=await jwt.sign({_id:this._id},process.env.ukey)
        this.Tokens=this.Tokens.concat({token})
        this.save()
        return token
        
    } catch (error) {
        console.log(error);
    }
}

module.exports = new mongoose.model("users", userschema)