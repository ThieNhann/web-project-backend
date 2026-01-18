// const knex = require('knex');
// const knexFile = require('../knexfile');
import knex from "knex";
import knexFile from "../knexfile.js";

// Khởi tạo kết nối trên môi trường dev
const db = knex(knexFile.development);

export default db;
