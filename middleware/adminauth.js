const Admin = require("../model/admin")
const jwt = require("jsonwebtoken")
const auth = async (req, resp, next) => {
    const token = req.cookies.jwt
    try {
        const admininfo = await jwt.verify(token, process.env.skey)
        const admin = await Admin.findOne({ _id: admininfo._id })
        // const tk = admin.Tokens.filter(ele => {
        //     return ele.token == token
        // })
        req.token = token
        req.admin = admin
        next()
    } catch (error) {
        resp.render("alogin", { msg: "Please login first" })
    }

}

module.exports = auth