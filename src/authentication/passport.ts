import passport from 'passport';
import * as passportLocal from 'passport-local';
import * as passportJwt from 'passport-jwt';
import * as dotenv from 'dotenv';
import * as tedious from 'tedious';
import { getConnection } from '../databaseConnection/connection';

dotenv.config();
const connection = getConnection();

passport.use(new passportLocal.Strategy({
  usernameField: 'userName',
  passwordField: 'password',
  },
  (userName, password, done) => {
    if (!userName || !password) {
      return done(null, false, 'Username or password missing');
    }
    
    const request = new tedious.Request(`select * from bookish.dbo.users where name = '${userName}'`, err => {
      if (err) {
        return;
      } 
    });
    
    request.on('row', columns => {
      if (!columns || columns.length === 0) {
        return done(null, false, 'Wrong email or password. Please register if you do not have an account or reset your password ' + 
          'if you have forgotten it');
      }
      const passwordColumn = columns.find(elem => elem.metadata.colName === 'PasswordHash')
      if (!passwordColumn || passwordColumn.value !== password) {
        return done(null, false, 'Wrong email or password. Please register if you do not have an account or reset your password ' + 
          'if you have forgotten it');
      }
      
      const row: any = {};
      columns.forEach(column => {
        row[column.metadata.colName] = column.value;
      });
      
      const user = {userId: row.UserId, userName: row.Name};
      return done(null, user);
    });
      
    connection.execSql(request);
  }
))

const jwtOptions = {
  secretOrKey: process.env.JWT_KEY,
  jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
}

function jwtVerify(jwtPayload, done) {
  const request = new tedious.Request(`select * from bookish.dbo.users where name = '${jwtPayload.userName}'`, err => {
    if (err) {
      return;
    } 
  });
  
  request.on('row', columns => {
    if (!columns || columns.length === 0) {
      return done(null, false, 'No user with that username');
    }
      
    const row: any = {};
    columns.forEach(column => {
      row[column.metadata.colName] = column.value;
    });
    
    const user = {userId: row.UserId, userName: row.Name};
    return done(null, user);
  });
    
  connection.execSql(request);
}

passport.use(new passportJwt.Strategy(jwtOptions, jwtVerify)) 


export {passport};