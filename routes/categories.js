var express = require('express');
var router = express.Router();
let slugify = require('slugify');
// Giả sử file data export cả mảng categories và products
let { categories, data: products } = require('../utils/data'); 
let { IncrementalId } = require('../utils/IncrementalIdHandler');

// ---------------------------------------------------
// 1. GET ALL (Có lọc theo name)
// URL: /api/v1/categories?name=Clothes
// ---------------------------------------------------
router.get('/', function (req, res, next) {
    let nameQ = req.query.name ? req.query.name : '';

    let result = categories.filter(function (e) {
        return (!e.isDeleted) && 
               e.name.toLowerCase().includes(nameQ.toLowerCase());
    });

    res.status(200).send({
        total: result.length,
        data: result
    });
});

// ---------------------------------------------------
// 2. GET PRODUCTS BY CATEGORY ID (Yêu cầu đặc biệt)
// URL: /api/v1/categories/7/products
// LƯU Ý: PHẢI ĐẶT TRƯỚC ROUTE /:id để tránh khớp sai
// ---------------------------------------------------
router.get('/:id/products', function (req, res, next) {
    let catId = req.params.id;

    // Bước 1: Kiểm tra category có tồn tại không
    let categoryExists = categories.find(c => !c.isDeleted && c.id == catId);
    if (!categoryExists) {
        return res.status(404).send({ message: "Category not found, cannot fetch products" });
    }

    // Bước 2: Lọc products có category.id trùng khớp
    // Lưu ý: data products phải được import từ file utils/data
    let result = products.filter(function(p) {
        return (!p.isDeleted) && 
               (p.category && p.category.id == catId);
    });

    res.status(200).send({
        category: categoryExists.name,
        totalProducts: result.length,
        products: result
    });
});

// ---------------------------------------------------
// 3. GET BY ID
// URL: /api/v1/categories/7
// ---------------------------------------------------
router.get('/:id', function (req, res, next) {
    let id = req.params.id;
    let result = categories.find(e => !e.isDeleted && e.id == id);

    if (result) {
        res.status(200).send(result);
    } else {
        res.status(404).send({ message: "Category ID not found" });
    }
});

// ---------------------------------------------------
// 4. GET BY SLUG
// URL: /api/v1/categories/slug/clothes
// ---------------------------------------------------
router.get('/slug/:slug', function (req, res, next) {
    let slug = req.params.slug;
    let result = categories.find(e => !e.isDeleted && e.slug == slug);

    if (result) {
        res.status(200).send(result);
    } else {
        res.status(404).send({ message: "Category Slug not found" });
    }
});

// ---------------------------------------------------
// 5. CREATE (POST)
// URL: /api/v1/categories
// ---------------------------------------------------
router.post('/', function (req, res, next) {
    if (!req.body.name) {
        return res.status(400).send({ message: "Category name is required" });
    }

    let newObj = {
        id: IncrementalId(categories), // Tự động tăng ID
        name: req.body.name,
        slug: slugify(req.body.name, { replacement: '-', lower: true, locale: 'vi' }),
        image: req.body.image || 'https://placeimg.com/640/480/any',
        creationAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
    };

    categories.push(newObj);
    res.status(201).send(newObj);
});

// ---------------------------------------------------
// 6. EDIT (PUT)
// URL: /api/v1/categories/7
// ---------------------------------------------------
router.put('/:id', function (req, res, next) {
    let result = categories.find(e => !e.isDeleted && e.id == req.params.id);

    if (result) {
        let body = req.body;
        
        if (body.name) {
            result.name = body.name;
            // Cập nhật slug nếu đổi tên
            result.slug = slugify(body.name, { replacement: '-', lower: true, locale: 'vi' });
        }
        if (body.image) result.image = body.image;
        
        result.updatedAt = new Date();
        res.status(200).send(result);
    } else {
        res.status(404).send({ message: "Category ID NOT FOUND" });
    }
});

// ---------------------------------------------------
// 7. DELETE (Xóa mềm)
// URL: /api/v1/categories/7
// ---------------------------------------------------
router.delete('/:id', function (req, res, next) {
    let result = categories.find(e => !e.isDeleted && e.id == req.params.id);

    if (result) {
        result.isDeleted = true; // Đánh dấu đã xóa
        res.status(200).send({
            message: "Category deleted successfully",
            data: result
        });
    } else {
        res.status(404).send({ message: "Category ID NOT FOUND" });
    }
});

module.exports = router;