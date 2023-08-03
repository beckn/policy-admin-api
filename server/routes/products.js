const express = require("express")
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

const router = express.Router()

const productController = require("../controllers/products");

router.get("/all-product", productController.getAllProduct);
// router.post("/product-by-category", productController.getProductByCategory);
// router.post("/product-by-price", productController.getProductByPrice);
// router.post("/wish-product", productController.getWishProduct);
// router.post("/cart-product", productController.getCartProduct);

router.post("/add-product",jsonParser, productController.postAddProduct);
router.post("/edit-product",jsonParser, productController.postEditProduct);
router.post("/delete-product",jsonParser, productController.getDeleteProduct);
// router.post("/single-product", productController.getSingleProduct);


module.exports = router;
