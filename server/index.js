const express = require("express")

require("dotenv").config()

const mongoose = require("mongoose");

const morgan = require("morgan")
const cookieParser = require("cookie-parser");
const cors = require("cors");

const productRouter = require("./routes/products")
const orderRouter = require("./routes/orders")


const app = express()

// Connecting to database
mongoose
    .connect(process.env.DATABASE_APP)
    .then(()=>
        console.log(
            "================== Successfully Connected to MongoDB Database =================="
        )
    ).catch((err)=>{
        console.log("Database not connected.")
    })


// Routes
app.use("/server/products", productRouter)
app.use("/server/orders", orderRouter)



// Running Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log("Server is running on port ", PORT)
});
