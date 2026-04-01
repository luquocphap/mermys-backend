import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../common/sequelize/connect.sequelize.js";
import { now } from "sequelize/lib/utils";
const article = sequelize.define(
  'Article',
  {
    // Model attributes are defined here

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: DataTypes.STRING
    },
    isDeleted:{
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
    deletedAt: {
      type: "TIMESTAMP",
      defaultValue: null,
      allowNull: true,
    },
    createdAt: {
      type: "TIMESTAMP",
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    },
    updatedAt: {
      type: "TIMESTAMP",
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    }
  },
  {
    tableName: "Articles_demo",
    timestamps: false,
  },
);


// CODE FIRST
await article.sync();

export default article;