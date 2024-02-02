const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize"); // Import the Sequelize instance
const { v4: uuidv4 } = require("uuid");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    unique: true,
  },
  status: {
    type: DataTypes.ENUM("Pending", "Confirmed", "Delivered", "Cancelled"),
    defaultValue: "Pending",
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  total: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Cash",
  },
});

module.exports = Order;
