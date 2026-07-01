const { sequelize } = require('../../src/models');

async function closeDb() {
  await sequelize.close();
}

module.exports = { closeDb };
