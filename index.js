const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");
const { authenticate, isAuthenticated, validateUsers, registerUsers } = require("./utility/auth");
const { getCartTotal } = require("./utility/cart");
const { User, Order, OrderItem, Product } = require("./db/main");
const url = require("url");
const app = express();
const port = 3000;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "main-one",
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware to global variable available in all routes
app.use((req, res, next) => {
  if (req.query.s !== undefined) {
    res.locals.search = req.query.s;
  }
  //For User
  if (req.session.user) {
    res.locals.user = req.session.user;
  }
  //For Cart
  res.locals.currency = "$";
  if (!req.session.cart) {
    req.session.cart = [];
  }
  res.locals.cart = req.session.cart;
  res.locals.cartTotal = getCartTotal(req.session.cart);
  next();
});

// Set EJS as the view engine
nunjucks.configure("views", {
  autoescape: true,
  express: app,
  ext: "html",
});

app.set("view engine", "html");

app.use(express.static("public"));

app.get("/", async (req, res) => {
  const products = await Product.findAll({ limit: 3 });
  res.render("index.html", { products });
});

app.get("/about", (req, res) => {
  res.render("about.html");
});

app.get("/contact", (req, res) => {
  res.render("contact.html");
});

app.get("/shop", async (req, res) => {
  const search = req.query.s;
  let condition = {};
  if (search !== undefined && search !== "") {
    condition = {
      where: {
        name: {
          [Op.like]: `%${search}%`,
        },
      },
    };
  }
  const products = await Product.findAll(condition);
  // Render the HTML file with data
  res.render("shop.html", {
    products,
  });
});

app.post("/add-to-cart", async (req, res) => {
  const productId = parseInt(req.body.productId);
  let result = false;
  let message = "Product not found";
  const cartIndex = req.session.cart.findIndex((cp) => cp.id === productId);
  if (cartIndex !== -1) {
    req.session.cart[cartIndex].quantity++;
    result = true;
    message = "Product Quantity Updated";
  }
  if (cartIndex === -1) {
    let product = await Product.findByPk(productId);
    product = product.toJSON();
    product.quantity = 1;
    req.session.cart.push(product);
    result = true;
    message = "Product added to cart.";
  }
  if (result) {
    res.json({ success: true, message, cartSize: req.session.cart.length });
  } else {
    res.status(404).json({ success: false, message });
  }
});

app.post("/remove-cart", (req, res) => {
  const productId = parseInt(req.body.productId);
  const cartIndex = req.session.cart.findIndex((cp) => cp.id === productId);
  let result = false;
  let message = "Failed to find product";
  if (cartIndex !== -1) {
    req.session.cart.splice(cartIndex, 1);
    result = true;
    message = "Product Removed from cart";
  }
  if (result) {
    res.json({ success: true, message, cartSize: req.session.cart.length, cartTotal: getCartTotal(req.session.cart) });
  } else {
    res.status(404).json({ success: false, message });
  }
});

app.get("/cart", (req, res) => {
  res.render("cart.html");
});

app.get("/login", (req, res) => {
  const { login } = req.session.errors || {};
  const success = req.session.success || "";
  delete req.session.errors;
  delete req.session.success;
  res.render("login.html", { login, success });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await authenticate(username, password);
  if (!user) {
    req.session.errors = { login: "Invalid username or password" };
    res.redirect(req.header("Referer") || "/");
    return;
  }
  req.session.user = user.toJSON();
  const referer = url.parse(req.headers.referer, true);
  if (referer !== undefined && referer.query.referer_url !== undefined) {
    res.redirect(referer.query.referer_url);
    return;
  }
  res.redirect("/dashboard");
});

app.get("/register", (req, res) => {
  const { register } = req.session.errors || {};
  const { username, email, firstName, lastName } = req.session.lastInput || {};
  delete req.session.errors;
  delete req.session.lastInput;
  delete req.session.success;
  res.render("register.html", { register, username, email, firstName, lastName });
});

app.post("/register", async (req, res) => {
  const { username, email, password, firstName, lastName, confirmPassword } = req.body;
  const { success, errors } = await validateUsers({ username, email, password, firstName, lastName, confirmPassword });
  console.log(success, errors);
  if (success === false) {
    req.session.errors = {
      register: errors,
    };
    req.session.lastInput = {
      username,
      email,
      firstName,
      lastName,
    };
    res.redirect(req.header("Referer"));
    return;
  }
  const user = await registerUsers({ username, email, password, firstName, lastName, confirmPassword });
  if (!user) {
    req.session.errors = {
      register: {
        title: "Failed to register user. Please try again later.",
      },
    };
    res.redirect("/register");
    return;
  }
  req.session.success = "User registered successfully. Please login to continue.";
  res.redirect("/login");
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("admin/dashboard.html");
});

app.get("/orders", isAuthenticated, async (req, res) => {
  const orders = await Order.findAll();
  //   const date = new Date();
  for (let order of orders) {
    const date = new Date(Date.parse(order.createdAt));
    order.setDataValue("createdAt", date.toLocaleDateString());
  }
  res.render("admin/orders.html", { orders });
});

app.get("/order/:id", isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
      },
      include: {
        model: OrderItem,
        include: {
          model: Product,
        },
      },
    });

    if (order === null) {
      res.redirect("/404");
      return;
    }
    res.render("admin/order.html", { order });
  } catch (e) {
    res.redirect("/404");
  }
});

app.get("/checkout", isAuthenticated, (req, res) => {
  res.render("checkout.html");
});

app.post("/checkout", isAuthenticated, async (req, res) => {
  try {
    const address = req.body.address;
    const user = await User.findOne({
      where: {
        username: req.session.user.username,
      },
    });
    const order = await Order.create({
      address,
      UserId: user.id,
      total: getCartTotal(req.session.cart),
    });

    const cart = req.session.cart.map((cp) => {
      return {
        quantity: cp.quantity,
        ProductId: cp.id,
        OrderId: order.id,
      };
    });
    OrderItem.bulkCreate(cart);
    req.session.cart = [];
    res.redirect("/orders");
  } catch (e) {
    res.send(e);
  }
  // console.log(req.session.user,req.session.cart);
});

app.get("/404", (req, res) => {
  res.render("404.html");
});

app.get("*", function (req, res) {
  res.render("404.html");
});

app.listen(port, () => {
  console.log(`Example app listening on port {port}`);
});
