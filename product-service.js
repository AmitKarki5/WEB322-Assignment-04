const fs = require('fs');
global.products = new Array();
global.categories = new Array();

module.exports.initialize = function () {
    var promise = new Promise((resolve, reject) => {

        try {

            fs.readFile('./data/products.json', 'utf-8', (err, data) => {
                if (err) throw err;
                products = JSON.parse(data);
            })

            fs.readFile('./data/categories.json', 'utf-8', (err, data) => {
                if (err) throw err;
                categories = JSON.parse(data);
            })

        } catch (error) {
            console.log(error);
            reject("Initialization Failed");
        }
        resolve("Initialization Success");
    })

    return promise;
};

module.exports.getAllProducts = function () {

    var promise = new Promise((resolve, reject) => {

        if (products.length === 0) {
            var err = "no data.";
            reject({ message: err });
        }

        resolve(products);
    })
    return promise;
};

module.exports.getPublishedProducts = function () {
    let publishedProducts;
    var promise = new Promise((resolve, reject) => {
        publishedProducts = products.filter(ele => {
            return ele.published;
        })

        if (publishedProducts.length === 0) {
            var err = "no data.";
            reject({ message: err });
        }

        resolve(publishedProducts);
    })
    return promise;
};

module.exports.getCategories = function () {
    var promise = new Promise((resolve, reject) => {
        if (categories.length === 0) {
            var err = "no data.";
            reject({ message: err });
        }

        resolve(categories);
    })
    return promise;
};

