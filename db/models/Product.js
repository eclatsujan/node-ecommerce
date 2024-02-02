const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // Import the Sequelize instance
// const OrderItem = require('./OrderItem');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey:true,
    autoIncrement: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price:{
    type: DataTypes.DOUBLE,
    allowNull: false
  }
});

module.exports = Product;