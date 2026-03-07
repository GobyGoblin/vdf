console.log('HELLO_FROM_NODE');
import sequelize from './server/config/database.js';
console.log('SEQUELIZE_LOADED');
sequelize.authenticate().then(() => {
    console.log('AUTH_SUCCESS');
    process.exit(0);
}).catch(e => {
    console.error('AUTH_FAIL', e);
    process.exit(1);
});
