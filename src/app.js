const express = require("express")
const app = express()
const mongoose = require("mongoose")
const path = require("path")
const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: false }))
const cookieparser = require("cookie-parser")
app.use(cookieparser())
const hbs = require("hbs")
app.set("view engine", "hbs")

const viewPath = path.join(__dirname, "../templates/views")
app.set("views", viewPath)
const partialpath = path.join(__dirname, "../templates/partials")
hbs.registerPartials(partialpath)
const publicpath = path.join(__dirname, "../public")
app.use(express.static(publicpath))
const dotenv = require("dotenv")
dotenv.config()

const Port = process.env.port
const dburl = process.env.dburl
mongoose.connect(dburl).then(() => {
    console.log("db connected");
})

const shoprouter = require("../router/shoprouter")
app.use("/", shoprouter)
const adminrouter = require("../router/adminrouter")
app.use("/", adminrouter)

app.listen(Port, () => {
    console.log(`server running on ${Port}`);
})
app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});
