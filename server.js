//jshint esversion:6
/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: AMIT SINGH KARKI Student ID: 154716203 Date: 2022-11-5
*
*  Online (Cyclic) Link: ________________________________________________________
*
********************************************************************************/

const express = require("express");
const fs = require('fs');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier');
const bodyParser = require('body-parser');
const productService = require('./product-service');
const exphbs = require("express-handlebars");

productService.getAllProducts()
    .then((data) => {
        products = JSON.parse(data);
    })
    .catch((err) => {
        console.log(err);
    });

productService.getCategories()
    .then((data) => {
        categories = JSON.parse(data);
    })
    .catch((err) => {
        console.log(err);
    });

productService.getCategories()
    .then((data) => {
        categories = JSON.parse(data);
    })
    .catch((err) => {
        console.log(err);
    });

const app = express();
app.use(express.static('public'));
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        // helper function for changing the navbar
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');
app.use(bodyParser.urlencoded({ extended: true }));

cloudinary.config({
    cloud_name: 'dap6wawp9',
    api_key: '446343113726963',
    api_secret: 'Ysit-gDfumcSh-nxCR-KMr4Etzw',
    secure: true
});

const upload = multer();

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/products', function (req, res) {
    if (req.query.category) {
        const publishedProducts = products.filter(eachProduct => eachProduct.category === parseInt(req.query.category) && eachProduct.published);
        res.render('product', { product: publishedProducts[0], products: publishedProducts, categories: categories });
    }
    let publishedProducts = products.filter(ele => {
        return ele.published;
    })
    res.render('product', { product: publishedProducts[0], products: publishedProducts, categories: categories });
});

app.get('/products/:id', function (req, res) {
    let idProduct = products.find(ele => ele.id === parseInt(req.params.id));
    let publishedProducts = products.filter(ele => {
        return ele.published;
    });
    console.log(idProduct, publishedProducts, req.query.category);
    if (req.query.category) {
        const publishedProducts = products.filter(eachProduct => eachProduct.category === parseInt(req.query.category) && eachProduct.published);
        res.render('product', { product: publishedProducts[0], products: publishedProducts, categories: categories });
    }
    else {
        res.render('product', { product: idProduct, products: publishedProducts, categories: categories });
    }
});



app.get('/demos', function (req, res) {
    if (req.query.category) {
        const filterProducts = products.filter(eachProduct => eachProduct.category === parseInt(req.query.category));
        res.render('demos', { products: filterProducts });
    }
    else if (req.query.minDate) {
        const filterProducts = products.filter(eachProduct => {
            var d1 = new Date(eachProduct.date);
            var d2 = new Date(req.query.minDate);
            if (d1 >= d2) return true
            else return false
        });
        res.render('demos', { products: filterProducts });
    }
    else {
        res.render('demos', { products: products });
    }

});

app.get('/categories', function (req, res) {
    res.render('categories', { categories: categories });
});

app.get('/products/add', function (req, res) {
    res.render("addProduct");
});

app.post('/products/add', upload.single('featureImage'), function (req, res) {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        return result;
    }

    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;
        // TODO: Process the req.body and add it as a new Product Demo before redirecting to /demos
        let product = {
            id: products.length + 1,
            ...req.body,
            postDate: new Date,
            featureImage: uploaded.url,
            published: req.body.published === 'on' ? true : false,
        }
        products.push(product);

        res.redirect('/demos');
    });

})

app.get('*', function (req, res) {
    res.status(404).send("Page Not Found");
});

productService.initialize()
    .then(() => {
        app.listen(process.env.PORT || 8080, function () {
            console.log("Express http server listening on 8080");
        });
    })
    .catch(err => {
        console.log(err);
    })