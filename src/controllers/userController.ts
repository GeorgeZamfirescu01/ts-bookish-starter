import { Router, Request, Response } from 'express';
import * as tedious from 'tedious';
import dotenv from 'dotenv'
import { User } from '../entities/user';
import { randomUUID } from 'crypto';

dotenv.config();

class UserController {
    router: Router;
    sqlConfiguration: tedious.ConnectionConfiguration = {
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
    connection: tedious.Connection;

    constructor() {
        this.router = Router();
        this.router.post('/register', this.postRegister.bind(this));
        this.router.post('/login', this.postLogin.bind(this));
        
        this.connection = new tedious.Connection(this.sqlConfiguration);
        this.connection.on('connect', (err) => {
          if (err) {
            console.log('Error ', err);
          }
        });
        
        this.connection.connect();
    }


    postRegister(req: Request, res: Response) {
      const {userName, password} = req.query;
      if (!userName || !password) {
        res.status(400).send('Bad email or password');
        return;
      }
      
      const userId = parseInt(randomUUID().replaceAll('-', ''), 16) % 123456789;
      const request = new tedious.Request(`insert into bookish.dbo.users values ('${userId}', '${userName}', '${password}')`, err => {
        if (err) {
          console.log(err);
          return;
        } 
      });
      
      request.on('requestCompleted', () => {
        res.status(200).send('Registartion complete');
      });
      
      this.connection.execSql(request);
    }
    
    postLogin(req: Request, res: Response) {
      const {userName, password} = req.query;
      if (!userName || !password) {
        res.status(400).send('Bad email or password');
        return;
      }
      
      const request = new tedious.Request(`select * from bookish.dbo.users where name = '${userName}'`, err => {
        if (err) {
          return;
        } 
      });
      
      request.on('row', columns => {
        if (!columns || columns.length === 0) {
          res.status(401).send('Wrong email or password. Please register if you do not have an account or reset your password ' + 
            'if you have forgotten it');
          return;
        }
        const passwordColumn = columns.find(elem => elem.metadata.colName === 'PasswordHash')
        if (!passwordColumn || passwordColumn.value !== password) {
          res.status(401).send('Wrong email or password. Please register if you do not have an account or reset your password ' + 
            'if you have forgotten it');
          return;
        }
        
        res.status(200).send('Login successful');
      });
      
      this.connection.execSql(request);
    }
}

export default new UserController().router;
