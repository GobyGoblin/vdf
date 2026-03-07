console.log('1');
import express from 'express';
console.log('2');
import sequelize from './server/config/database.js';
console.log('3');
import { User } from './server/models/index.js';
console.log('4');
process.exit(0);
