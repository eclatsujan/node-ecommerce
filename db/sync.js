const { sequelize } = require("./main");
(async () => {
  try {
    await sequelize.sync({ force: true }); // Use force: true to drop existing tables
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  } finally {
    sequelize.close();
  }
})();
