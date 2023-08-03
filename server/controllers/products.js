const productModel = require("../models/products");
const fs = require("fs");
const path = require("path");
const express = require('express')

class Product {

  async getAllProduct(req, res) {
    try {
      let Products = await productModel
        .find({})
        .populate("pName", "pId")
        .sort({ pId: -1 });
      if (Products) {
        return res.json({ Products });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async postAddProduct(req, res) {

    console.log(req)

    let { pSKU, pId, pName, pPrice, pQuantity } =
      req.body;
    // let images = req.files;
    // Validation
    if (
      !pSKU |
      !pId |
      !pName |
      !pPrice |
      !pQuantity
    ) {
      // Product.deleteImages(images, "file");
      return res.json({ error: "All filled must be required" });
    }
    // Validate Name and description
    else if (pName.length > 255 && pPrice < 0) {
    //   Product.deleteImages(images, "file");
      return res.json({
        error: "Name 255 & Price must not be lees than 0",
      });
    }
    // // Validate Images
    // else if (images.length !== 2) {
    // //   Product.deleteImages(images, "file");
    //   return res.json({ error: "Must need to provide 2 images" });
    // } 
    else {
      try {
        // let allImages = [];
        // for (const img of images) {
        //   allImages.push(img.filename);
        // }
        let newProduct = new productModel({
        //   pImages: allImages,
          pSKU,
          pId,
          pName,
          pPrice,
          pQuantity,
        });
        let save = await newProduct.save();
        if (save) {
          return res.json({ success: "Product created successfully" });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async postEditProduct(req, res) {
    let {
      pSKU,
      pId,
      pName,
      pPrice,
      pQuantity,
    //   pImages,
    } = req.body;
    // let editImages = req.files;

    // Validate other fileds
    if (
      !pSKU |
      !pId |
      !pName |
      !pPrice |
      !pQuantity
    ) {
      return res.json({ error: "All filled must be required" });
    }
    // Validate Name and description
    else if (pName.length > 255 && pPrice < 0) {
      return res.json({
        error: "Name 255 & Price must not be lees than 0",
      });
    }
    // // Validate Update Images
    // else if (editImages && editImages.length == 1) {
    //   Product.deleteImages(editImages, "file");
    //   return res.json({ error: "Must need to provide 2 images" });
    // } 
    else {
      let editData = {
        pSKU,
        pId,
        pName,
        pPrice,
        pQuantity,
      };
    //   if (editImages.length == 2) {
    //     let allEditImages = [];
    //     for (const img of editImages) {
    //       allEditImages.push(img.filename);
    //     }
    //     editData = { ...editData, pImages: allEditImages };
    //     Product.deleteImages(pImages.split(","), "string");
    //   }
      try {
        let editProduct = productModel.findByIdAndUpdate(pId, editData);
        editProduct.exec((err) => {
          if (err) console.log(err);
          return res.json({ success: "Product edit successfully" });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getDeleteProduct(req, res) {
    let { pSKU } = req.body;
    if (!pSKU) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deleteProductObj = await productModel.findById(pSKU);
        let deleteProduct = await productModel.findByIdAndDelete(pSKU);
        if (deleteProduct) {
          // Delete Image from uploads -> products folder
        //   Product.deleteImages(deleteProductObj.pImages, "string");
          return res.json({ success: "Product deleted successfully" });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  // async getSingleProduct(req, res) {
  //   let { pId } = req.body;
  //   if (!pId) {
  //     return res.json({ error: "All filled must be required" });
  //   } else {
  //     try {
  //       let singleProduct = await productModel
  //         .findById(pId)
  //         .populate("pCategory", "cName")
  //         .populate("pRatingsReviews.user", "name email userImage");
  //       if (singleProduct) {
  //         return res.json({ Product: singleProduct });
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   }
  // }

  // async getProductByCategory(req, res) {
  //   let { catId } = req.body;
  //   if (!catId) {
  //     return res.json({ error: "All filled must be required" });
  //   } else {
  //     try {
  //       let products = await productModel
  //         .find({ pCategory: catId })
  //         .populate("pCategory", "cName");
  //       if (products) {
  //         return res.json({ Products: products });
  //       }
  //     } catch (err) {
  //       return res.json({ error: "Search product wrong" });
  //     }
  //   }
  // }

  // async getProductByPrice(req, res) {
  //   let { price } = req.body;
  //   if (!price) {
  //     return res.json({ error: "All filled must be required" });
  //   } else {
  //     try {
  //       let products = await productModel
  //         .find({ pPrice: { $lt: price } })
  //         .populate("pCategory", "cName")
  //         .sort({ pPrice: -1 });
  //       if (products) {
  //         return res.json({ Products: products });
  //       }
  //     } catch (err) {
  //       return res.json({ error: "Filter product wrong" });
  //     }
  //   }
  // }

//   async getWishProduct(req, res) {
//     let { productArray } = req.body;
//     if (!productArray) {
//       return res.json({ error: "All filled must be required" });
//     } else {
//       try {
//         let wishProducts = await productModel.find({
//           _id: { $in: productArray },
//         });
//         if (wishProducts) {
//           return res.json({ Products: wishProducts });
//         }
//       } catch (err) {
//         return res.json({ error: "Filter product wrong" });
//       }
//     }
//   }

  // async getCartProduct(req, res) {
  //   let { productArray } = req.body;
  //   if (!productArray) {
  //     return res.json({ error: "All filled must be required" });
  //   } else {
  //     try {
  //       let cartProducts = await productModel.find({
  //         _id: { $in: productArray },
  //       });
  //       if (cartProducts) {
  //         return res.json({ Products: cartProducts });
  //       }
  //     } catch (err) {
  //       return res.json({ error: "Cart product wrong" });
  //     }
  //   }
  // }

}

const productController = new Product();
module.exports = productController;
