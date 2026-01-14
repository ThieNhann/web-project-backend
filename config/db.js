const knex = require('knex');
const knexFile = require('../knexfile');

// Khởi tạo kết nối trên môi trường dev
const db = knex(knexFile.development);

module.exports = db;