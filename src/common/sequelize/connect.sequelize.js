import { Sequelize } from "sequelize"
import { DATABASE_URL } from "../constant/app.constant.js";
const sequelize = new Sequelize(DATABASE_URL) // Example for postgres

try {
  await sequelize.authenticate();
  console.log('✅ [sequelize] Connection has been established successfully.');
} catch (error) {
  console.error('❌ [sequelize] Unable to connect to the database:', error);
}

export default sequelize;