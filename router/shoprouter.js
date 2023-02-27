const express = require("express")
const User = require("../model/user")
const bcrypt = require("bcryptjs")
const catagory = require("../model/catagory")
const product = require("../model/product")
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")
const auth = require("../middleware/userauth")
const user = require("../model/user")
const router = express.Router()
const mongoose = require("mongoose")
const Cart = require("../model/cart")
const order = require("../model/order")
router.get("/", async (req, resp) => {

    try {
        const cat = await catagory.find()
        const pro = await product.find()
        resp.render("index", { cdata: cat, pdata: pro })
    } catch (error) {
        console.log(error);
    }
})
router.get("/shopgrid", auth, async (req, resp) => {

    try {
        const cat = await catagory.find()
        const pro = await product.find()
        resp.render("shop-grid", { cdata: cat, pdata: pro })
    } catch (error) {
        console.log(error);
    }
})

router.get("/contact", (req, resp) => {
    resp.render("contact")
})
router.get("/login", (req, resp) => {
    resp.render("login")
})

router.get("/reg", (req, resp) => {
    resp.render("registration")
})

router.post("/userreg", async (req, resp) => {
    try {
        const user = new User(req.body)
        const u = await user.save()
        resp.render("registration", { msg: "regestration successfully" })
    } catch (error) {
        console.log(error);
    }
})

router.get("/login", async (req, resp) => {
    app.use(isLoggedIn);
    resp.render("login")
})
router.post("/login", async (req, resp) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        const isvalid = await bcrypt.compare(req.body.password, user.password)
        //    console.log(isvalid);
        if (isvalid) {
            const token = await user.genratetoken()

            resp.cookie("jwt", token)
            // console.log(token);
            resp.render("index")
        }
        else {
            resp.render("login", { msg: "invalid email or password" })
        }
    } catch (error) {
        resp.render("login", { msg: "invalid email or password" })
    }
})
router.get("/logout", auth, async (req, resp) => {
    try {
        const user = req.user
        const token = req.token
        user.Tokens = user.Tokens.filter(ele => {
            return ele.token != token
        })
        await user.save()
        resp.clearCookie("jwt")
        resp.render("login")

    } catch (error) {
        console.log(error);
    }
})
// ****************************shop*******************************



// **********************************cart**************************************

router.get("/cart", auth, async (req, resp) => {
    const uid = req.user._id
    try {
        const cartdata = await Cart.aggregate([{ $match: { uid: uid } }, { $lookup: { from: 'products', localField: 'pid', foreignField: '_id', as: 'products' } }])
        // console.log(cartdata);
        let sum = 0
        for (var i = 0; i < cartdata.length; i++) {
            sum = sum + cartdata[i].total

        }
        console.log(sum);
        resp.render("cart", { cartd: cartdata, carttotal: sum })

    } catch (error) {
        console.log(error);
    }
})
router.get("/findbycat", auth, async (req, resp) => {
    const catid = req.query.catid
    // console.log(catid);
    try {
        const cat = await catagory.find()
        const prod = await product.find({ cid: catid })
        resp.render("shop-grid", { cdata: cat, pdata: prod })
    } catch (error) {

    }
})

router.get("/addtocart", auth, async (req, resp) => {
    const pid = req.query.pid
    // console.log(pid);
    const uid = req.user._id
    // console.log(uid);
    try {

        const allcartproduct = await Cart.find({ uid: uid })
        const productdata = await product.findOne({ _id: pid })
        const duplicate = await allcartproduct.find(ele => {
            return ele.pid == pid
        })
        if (duplicate) {
            resp.send("product already exits")
        }
        else {
            const cart = new Cart({
                pid: pid,
                uid: uid,
                total: productdata.price
            })
            await cart.save()
            resp.send("product into added cart")
        }
    } catch (error) {
        console.log(error);
    }

})

router.get("/removecart", auth, async (req, resp) => {
    const cartid = req.query.cartid
    try {
        await Cart.findByIdAndDelete(cartid)
        resp.send("product remove from the cart")
    } catch (error) {
        console.log(error);
    }
})

router.get("/changeqty", auth, async (req, resp) => {
    try {
        const cartid = req.query.cartid
        const cartproduct = await Cart.findOne({ _id: cartid })
        // console.log(cartproduct);
        const productdata = await product.findOne({ _id: cartproduct.pid })
        const newqty = Number(cartproduct.qty) + Number(req.query.qty)
        if (newqty < 1 || newqty > productdata.qty) {
            return
        }
        const newtotal = newqty * productdata.price
        // console.log(newqty);
        const updatedata = await Cart.findByIdAndUpdate(cartid, { qty: newqty, total: newtotal })
        resp.send("ok")
    } catch (error) {

        console.log(error);
    }
})
const Razorpay = require("razorpay")
const cart = require("../model/cart")

router.get("/payment", (req, resp) => {
    const amt = Number(req.query.amt)
    console.log(amt);
    var instance = new Razorpay({ key_id: 'rzp_test_WOONFY9u511Byr', key_secret: 't9ROVnSqZbzNZr59d3KLWzJO' })

    var options = {
        amount: amt * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
    };
    instance.orders.create(options, function (err, order) {
        // console.log(order);
        resp.send(order)
    });

})

router.get("/order", auth, async (req, resp) => {
    const pid = req.query.pid
    console.log(pid);
    const user = req.user
    const cartproduct = await cart.find({ uid: user._id })
    var prod = []
    for (var i = 0; i < cartproduct.length; i++) {
        prod[i] = {
            pid: cartproduct[i].pid,
            qty: cartproduct[i].qty
        }
    }
    // console.log(prod)
    try {
        const or = new order({
            pid: pid,
            uid: user._id,
            product: prod
        })

        const orderdata = await or.save()
        var row = ""
        for (var i = 0; i < prod.length; i++) {
            const Product = await product.findOne({ id: prod[i].pid })
            row = row + "<span>" + Product.pname + " " + Product.price + " " + prod[i].qty + "</span><br>"

        }
        console.log(row);
        var msg = {
            from: "jinalsangani123@gmail.com",
            to: user.email,
            subject: "Order conformation",
            html: "<h1>E shop</h1>paymentid :<span>" + pid + "</span><br><span>" + orderdata._id + "</span><br><span>" + user.fname + " " + user.lname + "<br>ph no:" + user.phno + "</span>"

        }
        transporter.sendMail(msg, (err, success) => {
            if (err) {
                console.log(err);
                return
            }
            resp.send("ypur order is confirmed ")
        })

    } catch (error) {

    }

})
// *********************mail****************************

var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: 'jinalsangani123@gmail.com',
        pass: 'waczukesxmmoixzw'
    }
});




module.exports = router