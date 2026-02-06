var express = require('express');
var router = express.Router();
let { RandomToken } = require('../utils/GenToken')
let { data } = require('../utils/data')
let slugify = require('slugify')
let { IncrementalId } = require('../utils/IncrementalIdHandler')

///api/v1/products
router.get('/', function (req, res, next) {
  let titleQ = req.query.title ? req.query.title : '';
  let maxPrice = req.query.maxPrice ? req.query.maxPrice : 1E4;
  let minPrice = req.query.minPrice ? req.query.minPrice : 0;
  let categoryName = req.query.category ? req.query.category : '';
  let result = data.filter(function (e) {
    return (!e.isDeleted) &&
      e.title.toLowerCase().includes(titleQ.toLowerCase())
      && e.price > minPrice
      && e.price < maxPrice
      && e.category.name.toLowerCase().includes(categoryName.toLowerCase())
  })
  res.status(200).send({
    total: result.length,
    data: result
  });
});
router.get('/slug/:slug', function (req, res, next) {
  let slug = req.params.slug;
  let result = data.find(
    function (e) {
      return (!e.isDeleted) && e.slug == slug;
    }
  )
  if (result) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "Product slug not found"
    })
  }
});
///api/v1/products/1
router.get('/:id', function (req, res, next) {
  let result = data.find(
    function (e) {
      return (!e.isDeleted) && e.id == req.params.id
    }
  );
  if (result) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "Product ID not found"
    })
  }
});
router.post('/', function (req, res, next) {
  if (!req.body.title || !req.body.price) {
    return res.status(400).send({
      message: "Title and price are required"
    });
  }
  
  let newObj = {
    id: IncrementalId(data),
    title: req.body.title,
    slug: slugify(req.body.title, {
      replacement: '-', lower: true, locale: 'vi',
    }),
    price: req.body.price,
    description: req.body.description || '',
    category: req.body.category || null,
    images: req.body.images || [],
    creationAt: new Date(Date.now()),
    updatedAt: new Date(Date.now()),
    isDeleted: false
  }
  data.push(newObj);
  res.status(201).send(newObj);
})
router.put('/:id', function (req, res, next) {
  let result = data.find(
    function (e) {
      return (!e.isDeleted) && e.id == req.params.id
    }
  );
  if (result) {
    let body = req.body;
    if (body.title) {
      result.title = body.title;
      result.slug = slugify(body.title, {
        replacement: '-', lower: true, locale: 'vi',
      });
    }
    if (body.price !== undefined) result.price = body.price;
    if (body.description) result.description = body.description;
    if (body.category) result.category = body.category;
    if (body.images) result.images = body.images;
    
    result.updatedAt = new Date(Date.now());
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
})
router.delete('/:id', function (req, res, next) {
  let result = data.find(
    function (e) {
      return (!e.isDeleted) && e.id == req.params.id
    }
  );
  if (result) {
    result.isDeleted = true;
    res.status(200).send({
      message: "Product deleted successfully",
      data: result
    })
  } else {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
})

module.exports = router;
