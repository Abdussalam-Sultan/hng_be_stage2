import { Sequelize } from  "sequelize";
import dotenv from "dotenv";
dotenv.config();
import pg from "pg";
console.log("PG MODULE LOADED:", !!pg);
console.log('Connecting to database with URL:', process.env.DATABASE_URL);
const sequelize = new Sequelize(process.env.DATABASE_URL,
  {
    dialect: "postgres",
    logging: false,
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync({ force: true });
    console.log("Database connected");
  } catch (error) {
    console.log("Database error:", error);
    process.exit(1);
  }
};

export default sequelize;