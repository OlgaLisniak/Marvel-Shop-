var express = require('express');
const mongoose = require('mongoose');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;

var fs = require('fs');

var Cart = require('../models/cart');
var Order = require('../models/Order');
const User = require('../models/User');
var products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

/**
 * Get /shop
 * shop page
 */
exports.shopPage = (req, res) => {
    res.render('shop/shop', {
        title: 'Shop',
        products: products
    });
};

exports.searchItemsPost = (req, res, next) => {
    req.assert('searchTerm', 'Search Term is not valid').notEmpty();

    const errors = req.validationErrors();
    
    if (errors) {
    req.flash('errors', errors);
    return res.redirect('/shop');
    }

    var searchTerm = req.body.searchTerm;
    var itemsFound = [];

    products.forEach(item => {
        if (item.title.includes(searchTerm) || item.description.includes(searchTerm)) {
            itemsFound.push(item);
        }
    });

    res.render('shop/shop', {
        title: 'Shop',
        products: itemsFound
    });
};

exports.addItem = (req, res, next) => {
    var productId = req.query.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    var product = products.filter(function(item) {
      return item.id == productId;
    });
    cart.add(product[0], productId);
    req.session.cart = cart;
    res.redirect('/shop');
};

exports.openCart = (req, res, next) => {
    if (!req.session.cart) {
        return res.render('shop/cart', {
            products: null
        });
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/cart', {
        title: 'Корзина',
        products: cart.getItems(),
        totalPrice: cart.totalPrice
    });
};

exports.removeItem = (req, res, next) => {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
  
    cart.remove(productId);
    req.session.cart = cart;
    res.redirect('/cart');
}

exports.getOrder = (req, res, next) => {
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    var user = req.session.user;

    res.render('shop/order', {
        title:'Ваш заказ',
        products: cart.getItems(),
        user: user,
        totalPrice: cart.totalPrice
    })
}

exports.getOrderConfirm = (req, res, next) => {
    var userID = req.session.user._id;
    var cart = new Cart(req.session.cart);
    var items = cart.getItems();
    var arrOrder = [];
    var item_id = ObjectId();
    var db = mongoose.connection;

    items.forEach(function(item, i, arr) {
        var itemOrder = new Order ({
            nameProduct: item.item.title,
            descriptionProduct: item.item.description,
            quantity: item.quantity,
            price: item.item.price,
            orderedBy: userID
        });
        itemOrder.save(function (err) {
            if (err) return err;
        });
         arrOrder.push(itemOrder);
    });
     
    db.collection('orders').insert([arrOrder]);
    
    arrOrder.forEach(element => {
        User.findByIdAndUpdate(userID, 
            {
                $push: {
                    'orders': {
                        _id: element._id
                    }
                }
            }, {
                safe: true,
                upsert:true,
                new:true
            } , (err, data) => {
                if (err) {
                    return err;
                }
                req.flash('success', {msg: 'Order is processed'})
            })
    });
    
    res.render('shop/confirm', {
        title: 'Заказ'
    });
}

exports.getCancel = (req, res, next) => {
    req.session.destroy();
    res.redirect('/shop')
}

