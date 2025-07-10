import * as dotenv from 'dotenv'
import * as tedious from 'tedious'

dotenv.config();

const sqlConfiguration: tedious.ConnectionConfiguration = {
  server: 'localhost',
  options: {
    trustServerCertificate: true
  },
  authentication: {
    type: 'default',
    options: {
      userName: 'GeoZamExtra',
      password: process.env.SQL_PASSWD,
      trustServerCertificate: true,
    }
  }
};

export function getConnection() {
  const connection = new tedious.Connection(sqlConfiguration);
  connection.on('connect', (err) => {
    if (err) {
      console.log('Error ', err);
    }
  });
  
  connection.connect();
  
  return connection;
}