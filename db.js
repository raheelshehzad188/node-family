const mariadb = require('mariadb');

// Connection pool create karo
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'familymatch',
  connectionLimit: 5
});

// Export karo for reuse
module.exports = pool;
