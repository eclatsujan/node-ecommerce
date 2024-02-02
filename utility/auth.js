const User = require("../db/models/User");
const bcrypt = require("bcrypt");
const saltRounds = 10; // Adjust the number of salt rounds based on your security requirements

async function authenticate(username, password) {
  const user = await User.findOne({
    where: {
      username: username,
    },
  });
  if (!user) {
    return false;
  }
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return resolve(false);
      }
      if (result) {
        return resolve(user);
      }
      return resolve(false);
    });
  });
}

function isAuthenticated(req, res, next) {
  if (!req.session || !req.session.user) {
    res.redirect("/login?referer_url=" + req.route.path);
    return;
  }
  return next();
}

async function validateUsers({ username, confirmPassword, password, email, firstName, lastName }) {
  let success = true;
  let errors = {
    title: "There are items that require your attention",
    username: [],
    email: [],
    password: [],
    firstName: [],
    lastName: [],
    confirm_password: [],
  };

  if (password !== confirmPassword) {
    success = false;
    errors.confirm_password.push("Passwords do not match");
  }
  if (username.length < 3) {
    success = false;
    errors.username.push("Username must be at least 3 characters long");
  }
  if (password.length < 8) {
    success = false;
    errors.password.push("Password must be at least 8 characters long");
  }
  if (firstName.length < 3) {
    success = false;
    errors.firstName.push("First name must be at least 3 characters long");
  }
  if (lastName.length < 3) {
    success = false;
    errors.lastName.push("Last name must be at least 3 characters long");
  }
  if (!email.includes("@")) {
    success = false;
    errors.email.push("Invalid email address");
  }
  let user = await User.findOne({ where: { username: username } });
  if (user !== null) {
    success = false;
    errors.username.push("Username already exists");
  }
  user = await User.findOne({ where: { email: email } });
  if (user !== null) {
    success = false;
    errors.email.push("Email already exists");
  }
  return { success, errors };
}

const registerUsers = async ({ username, password, email, firstName, lastName }) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        reject(err);
        return;
      }
      const result = User.create({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });
      resolve(result);
      return;
    });
  });
};

module.exports = { authenticate, isAuthenticated, validateUsers, registerUsers };
