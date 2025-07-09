import { Router, Request, Response } from 'express';
import * as tedious from 'tedious';
import dotenv from 'dotenv'
import { Book } from '../entities/book';

dotenv.config()

class BookController {
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
        this.router.get('/:id', this.getBook.bind(this));
        this.router.get('/', this.getBooks.bind(this));
        this.router.post('/', this.createBook.bind(this));
        
        this.connection = new tedious.Connection(this.sqlConfiguration);
        this.connection.on('connect', (err) => {
          if (err) {
            console.log('Error ', err);
          }
        });
        
        this.connection.connect();
    }
    
    getBooks(req: Request, res: Response) {
        const request = new tedious.Request('select * from bookish.dbo.books', (err, rowCount) => {
          if (err) {
            console.log(err);
          }
        });
        
        const books = [];
        
        request.on('row', columns => {
          const row: any = {};
          columns.forEach(column => {
            row[column.metadata.colName] = column.value;
          });
          books.push(new Book(row.BookId, row.Title, row.Author, row.ISBN, row.AmountOwned));
        });
        
        request.on('requestCompleted', () => {
          res.status(200).send(JSON.stringify(books)); 
        });
        
        this.connection.execSql(request);
    }

    getBook(req: Request, res: Response) {
        // TODO: implement functionality
        return res.status(500).json({
            error: 'server_error',
            error_description: 'Endpoint not implemented yet.',
        });
    }

    createBook(req: Request, res: Response) {
        // TODO: implement functionality
        return res.status(500).json({
            error: 'server_error',
            error_description: 'Endpoint not implemented yet.',
        });
    }
}

export default new BookController().router;
