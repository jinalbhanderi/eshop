const express = require("express")
const Admin = require("../model/admin")
const Catagory = require("../model/catagory")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const product = require("../model/product")
const router = express.Router()
const multer = require("multer")
const auth = require("../middleware/adminauth")
const fs = require("fs")
const path = require("path")
const { route } = require("./shoprouter")
const users=require("../model/user")


router.get("/dashboard", (req, resp) => {
    resp.render("dashboard")
})

router.get("/alogin", (req, resp) => {
    resp.render("alogin")
})

router.post("/alogin", async (req, resp) => {
    try {
        const admin = await Admin.findOne({ email: req.body.email })
        const isvalid = await bcrypt.compare(req.body.password, admin.password)
        console.log(isvalid);
        if (isvalid) {
            const token = await admin.generatetoken()
            resp.cookie("ajwt", token)
            resp.render("dashboard")
        }
        else {
            resp.render("alogin", { msg: "invalid email or password" })
        }
    } catch (error) {
        resp.render("alogin", { msg: "invalid email or password" })
    }
})
router.get("/alogout", async (req, resp) => {
    resp.render("alogin")
})

// ****************************catagory*****************************************

router.get("/catagory", async (req, resp) => {
    try {
        const cat = await Catagory.find()
        resp.render("productcat", { cdata: cat })
    } catch (error) {
        console.log(error);
    }
})
router.post("/addcategory", async (req, resp) => {
    try {
        const cat = new Catagory(req.body)
        resp.redirect("catagory")
        await cat.save()
    } catch (error) {

    }
})
router.get("/deletecat", async (req, resp) => {
    const id = req.query.did
    try {
        await Catagory.findByIdAndDelete(id)

        resp.redirect("/catagory")

    } catch (error) {
        console.log(error);
    }
})

// *******************************product***************************
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/productimg")
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + ".jpg")
    }
})
const upload = multer({ storage: storage })

router.get("/products", async (req, resp) => {
    try {
        const prod = await product.find()
        const cat = await Catagory.find()
        resp.render("products", { cdata: cat, pdata: prod })

    } catch (error) {

    }
})
router.post("/addproduct", upload.single("file"), async (req, resp) => {
    try {
        const prod = new product({
            cid: req.body.cid,
            pname: req.body.pname,
            price: req.body.price,
            qty: req.body.qty,
            imgname: req.file.filename
        })
        await prod.save()
        resp.redirect("products")
    } catch (error) {
        console.log(error);
    }
})
router.get("/deletepro", async (req, resp) => {
    const _id = req.query.did
    try {
        const data = await product.findByIdAndDelete(_id)
        fs.unlinkSync(path.join(__dirname, `../public/productimg/${data.imgname}`))
        resp.redirect("/products")
    } catch (error) {
        console.log(error);
    }
})

router.get("/editpro", async (req, resp) => {
    const _id = req.query.uid
    try {
        const pr = await product.findOne({ _id: _id })
        console.log(pr);
        resp.render("udproduct", { pdata: pr })
    } catch (error) {
        console.log(error);
    }
})

router.post("/updateproduct", upload.single("file"), async (req, resp) => {
    try {
        console.log(req.file.filename);
        const pro = await product.findByIdAndUpdate(req.body.id, {
            pname: req.body.pname,
            price: req.body.price,
            qty: req.body.qty,
            imgname: req.file.filename
        })
        fs.unlinkSync(path.join(__dirname, `../public/productimg/${data.imgname}`))
        resp.redirect("products")
    } catch (error) {
        const pr = await product.findByIdAndUpdate(req.body.id, {
            pname: req.body.pname,
            price: req.body.price,
            qty: req.body.qty
        })
        resp.redirect("products")
    }
})
// ***************************************user*****************************
router.get("/viewuser", async (req, resp) => {
    try {
        const User = await users.find()
        resp.render("userdetail", { udata: User })
    } catch (error) {
        console.log(error);
    }
})
router.get("/deleteuser", async (req, resp) => {
    try {
        const id = req.query.did
        const data = await shop.findByIdAndDelete(id)
        resp.redirect("viewuser")
    } catch (error) {

    }
})

// ****************************cart************************
const order=require("../model/order")
const user = require("../model/user")

router.get("/vieworder",async(req,resp)=>{
    try {
        const Order=await order.find()
        resp.render("orderdetails",{odata:Order})
    } catch (error) {
        
    }
})
module.exports = router
