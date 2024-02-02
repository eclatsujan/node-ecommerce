const sequelize = require("./sequelize");
const User = require("./models/User");
const Order = require("./models/Order");
const OrderItem = require("./models/OrderItem");
const Product = require("./models/Product");

User.hasMany(Order);
Order.belongsTo(User);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

OrderItem.belongsTo(Product);
Product.hasMany(OrderItem);

module.exports = {
  sequelize,
  User,
  Order,
  OrderItem,
  Product,
};
