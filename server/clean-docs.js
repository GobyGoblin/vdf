import sequelize from './config/database.js';
import { Document } from './models/index.js';

async function cleanDocs() {
    try {
        const docs = await Document.findAll();
        let deletedCount = 0;
        for (const doc of docs) {
            if (!doc.fileName.startsWith('file-')) {
                console.log(`Deleting orphaned record: ${doc.fileName} (ID: ${doc.id})`);
                await doc.destroy();
                deletedCount++;
            }
        }
        console.log(`Done! Deleted ${deletedCount} orphaned records.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanDocs();
