import { Router, Request, Response } from 'express';
import * as tedious from 'tedious';
import dotenv from 'dotenv'
import { Book } from '../entities/book';
import { randomUUID } from 'crypto';

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
        const request = new tedious.Request('select * from bookish.dbo.books', (err, rowCount) => {
          if (err) {
            console.log(err);
          }
        });
       
        let book: Book;
        
        request.on('row', columns => {
          const id = columns.find(elem => elem.metadata.colName === 'BookId')?.value;
          if (!id || id !== parseInt(req.params.id)) {
            return;
          }
          
          const row: any = {};
          columns.forEach(column => {
            row[column.metadata.colName] = column.value;
          });
          book = new Book(row.BookId, row.Title, row.Author, row.ISBN, row.AmountOwned);
        });
        
        request.on('requestCompleted', () => {
          res.status(200).send(JSON.stringify(book)); 
        });
        
        this.connection.execSql(request);
    }

    createBook(req: Request, res: Response) {
        const {title, author, isbn, amountOwned} = req.query;
        if (!title || !author || !isbn || !amountOwned) {
          res.status(400).send('Missing required data to add book');
          return;
        }
        
        const bookId = parseInt(randomUUID().replaceAll('-', ''), 16) % 123456789;
        const request = new tedious.Request(`insert into bookish.dbo.books values ('${bookId}', '${author}', '${title}', '${isbn}', '${amountOwned}')`, err => {
          if (err) {
            console.log(err);
            return;
          } 
        });
        
        request.on('requestCompleted', () => {
          res.status(200).send('Book uploaded successfully');
        });
        
        this.connection.execSql(request);
    }
}

export default new BookController().router;
