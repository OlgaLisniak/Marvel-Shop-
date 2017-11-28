const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

  nameProduct:String,
  descriptionProduct:String,
  quantity:Number,
  price: Number,

  orderedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  }, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;