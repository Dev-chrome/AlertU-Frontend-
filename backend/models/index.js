'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const db = {};

for (const file of fs.readdirSync(__dirname)) {
  if (file === 'index.js' || !file.endsWith('.js')) continue;

  const model = require(path.join(__dirname, file))(sequelize, DataTypes);
  db[model.name] = model;
}

// The newer services use `User`; the legacy auth controller uses `Users`.
// Both names point at the same model/table.
db.User = db.Users;

for (const model of new Set(Object.values(db))) {
  if (model.associate) model.associate(db);
}

module.exports = {
  ...db,
  sequelize,
  Sequelize,
};
