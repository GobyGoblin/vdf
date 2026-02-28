import sequelize from './config/database.js';
import { Document, User } from './models/index.js';

async function checkDocs() {
    try {
        const docs = await Document.findAll({
            include: [{ model: User, as: 'user' }]
        });
        console.log('--- ALL DOCUMENTS ---');
        docs.forEach(doc => {
            console.log(`ID: ${doc.id}`);
            console.log(`User: ${doc.user?.email || 'N/A'}`);
            console.log(`Status: ${doc.status}`);
            console.log(`Name: ${doc.name}`);
            console.log(`FileName: ${doc.fileName}`);
            console.log('---------------------');
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDocs();
