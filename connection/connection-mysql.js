import mysql from 'mysql2';

export const connection = mysql.createConnection({
  host: 'eventmod.sit.kmutt.ac.th',
  port: 55018,
  user: 'Eventmod',
  password: 'eventadmin',
  database: 'eventmod'
})