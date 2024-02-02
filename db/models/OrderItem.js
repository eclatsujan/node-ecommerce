const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // Import the Sequelize instance
const Order = require('./Order');
const Product = require('./Product');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});


module.exports = OrderItem;