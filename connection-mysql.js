import mysql from 'mysql2';

export const connection = mysql.createConnection({
  host: 'eventmoddb',
  port: 3306,
  user: 'Eventmod',
  password: 'eventadmin',
  database: 'eventmod'
})

// connection.connect()