import { DataTypes } from 'sequelize';
import sequelize from '../db/database.js';
import User from './User.js';

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  game_mode: {
    type: DataTypes.ENUM('301', '501'),
    allowNull: false
  },
  out_mode: {
    type: DataTypes.ENUM('single_out', 'double_out'),
    allowNull: false
  },
  first_to: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  players: {
    type: DataTypes.JSONB, // PostgreSQL JSONB típus a játékosok és körök tárolásához
    allowNull: false,
    defaultValue: []
  },
  championship_name: {
    type: DataTypes.STRING(255),
    allowNull: true, // Opcionális mező a bajnokság nevéhez
    defaultValue: null
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'finished'),
    defaultValue: 'in_progress'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  finished_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'matches',
  timestamps: false
});

// Kapcsolat a User modellel
Match.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

export default Match;
