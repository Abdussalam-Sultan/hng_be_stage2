import { DataTypes } from "sequelize";
import sequelize from "./db.js";

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    
  },
  gender: {
    type: DataTypes.ENUM("male", "female"),
    allowNull: false
  },
    gender_probability: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  age_group: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country_probability: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

export default Profile;