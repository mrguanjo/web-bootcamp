const express = require('express');

const adminController = require('../controllers/admin.controller');

const imageUploadMiddleware = require('../middlewares/image-upload');

const router = express.Router();


router.get('/products', adminController.getProducts); // path: /admin/products

router.get('/products/new', adminController.getNewProduct);

router.post('/products', imageUploadMiddleware, adminController.createNewProduct);

router.get('/orders', );


module.exports = router;