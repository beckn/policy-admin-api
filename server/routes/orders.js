const express = require("express");
const router = express.Router();

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

const ordersController = require("../controllers/orders");

router.get("/get-all-orders", ordersController.getAllOrders);
router.post("/order-by-date",jsonParser, ordersController.getOrderByDate);
router.post("/order-by-status",jsonParser, ordersController.getOrderByStatus);
// router.post("/order-by-: "2022-07-27"user", ordersController.getOrderByUser);

router.post("/create-order",jsonParser, ordersController.postCreateOrder);
// router.post("/update-order", ordersController.postUpdateOrder);
// router.post("/delete-order", ordersController.postDeleteOrder);

module.exports = router;
