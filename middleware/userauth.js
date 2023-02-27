const jwt = require("jsonwebtoken")
const User = require("../model/user")
const auth = async (req, resp, next) => {
        const token = req.cookies.jwt
        try {
                const userinfo = await jwt.verify(token, process.env.ukey)
                const user = await User.findOne({ _id: userinfo._id })
                // const tk = user.Tokens.filter(ele => {
                //         return ele.token == token
                // })
                req.token = token
                req.user = user


                next()
        } catch (error) {
                resp.render("login", { msg: "Please login first" })
        }
}



module.exports = auth