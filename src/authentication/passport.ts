import passport from 'passport';
import * as passportLocal from 'passport-local';
import * as passportJwt from 'passport-jwt';
import * as dotenv from 'dotenv';
import { getConnection } from '../databaseConnection/connection';

dotenv.config();


const jwtOptions = {
  secretOrKey: process.env.JWT_KEY,
  jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
}

const connection = getConnection();

function jwtVerify(jwtPayload, done) {
  // connect to db and check if the user exists
  
  const user = {id: 1, name: 'user1'};
  return done(null, user);
}

passport.use(new passportLocal.Strategy({
    usernameField: 'userName',
    passwordField: 'password',
  },
  (userName, password, done) => {
    // search db and return user if found
    const user = {id: 1, userName: 'user1'};
    return done(null, user);
  }
))

passport.use(new passportJwt.Strategy(jwtOptions, jwtVerify))


export {passport};