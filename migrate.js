import sequelize from './server/models/index.js';

async function migrate() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.addColumn('QuoteRequests', 'altCandidateId', {
      type: 'UUID',
      allowNull: true,
      references: { model: 'Users', key: 'id' }
    });
    console.log('Added altCandidateId');
  } catch (err) {
    console.log('altCandidateId might already exist or failed:', err.message);
  }

  try {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.addColumn('QuoteRequests', 'unresponsiveAt', {
      type: 'DATETIME',
      allowNull: true
    });
    console.log('Added unresponsiveAt');
  } catch (err) {
    console.log('unresponsiveAt might already exist or failed:', err.message);
  }
  process.exit(0);
}

migrate();
