const { getCartTotal } = require("../utility/cart");
const { Order, OrderItem } = require("./main");
const Product = require("./models/Product");
const User = require("./models/User");

const bcrypt = require("bcrypt");
const saltRounds = 10; // Adjust the number of salt rounds based on your security requirements

function createProduct() {
  const products = [
    {
      image: "images/product1.jpg",
      name: "Bed",
      price: "39.99",
    },
    {
      image: "images/product2.jpg",
      name: "Wardrobe",
      price: "49.99",
    },
    {
      image: "images/product3.jpg",
      name: "Dressing Table",
      price: "79.99",
    },
    {
      image: "images/product4.jpg",
      name: "Night Table",
      price: "79.99",
    },
    {
      image: "images/product5.jpeg",
      name: "HELSINKI DRESSING TABLE 80CM HWN/GYMT",
      price: "79.99",
    },
    {
      image: "images/product6.jpeg",
      name: "NB PLUS DRESSING TABLE+STOOL BKBN",
      price: "79.99",
    },
  ];

  Product.bulkCreate(products);
}

async function createUser(username, plainPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
      if (err) {
        reject(err);
        return;
      }
      const result = User.create({
        username,
        email: "aashisdangol1128@gmail.com",
        password: hashedPassword,
        firstName: "aashis",
        lastName: "dangol",
      });
      resolve(result);
      return;
    });
  });
}

(async () => {
  try {
    const username = "aashis";
    // Hash a password
    const password = "test123";
    createProduct();
    await createUser(username, password);
    const product = await Product.findAll({
      where: {
        name: ["Bed", "Dressing Table"],
      },
    });
    const address = "81 Steward Drive, Oran Park";
    const user = await User.findOne({
      where: {
        username: username,
      },
    });
    const cart = product.map((cp) => {
      return {
        quantity: 1,
        ProductId: cp.id,
        price: cp.price,
      };
    });
    const order = await Order.create({
      address,
      total: getCartTotal(cart),
      UserId: user.id,
    });
    await cart.map((cp) => {
      cp.OrderId = order.id;
    });
    OrderItem.bulkCreate(cart);
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
})();
