import { Router, Request, Response } from 'express';
import * as tedious from 'tedious';
import dotenv from 'dotenv'
import { Book } from '../entities/book';
import { randomUUID } from 'crypto';
import { Borrow } from '../entities/borrow';

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
        this.router.get('/borrows', this.getBorrowedBooks.bind(this));
        this.router.get('/', this.getBooks.bind(this));
        this.router.post('/', this.createBook.bind(this));
        this.router.get('/:id', this.getBook.bind(this));
        
        this.connection = new tedious.Connection(this.sqlConfiguration);
        this.connection.on('connect', (err) => {
          if (err) {
            console.log('Error ', err);
          }
        });
        
        this.connection.connect();
    }
    
    getBooks(req: Request, res: Response) {
        const titleSearch = req.query.titleSearch;
        const authorSearch = req.query.authorSearch;
        
        const request = new tedious.Request('select * from bookish.dbo.books', (err, rowCount) => {
          if (err) {
            console.log(err);
          }
        });
        
        let books = [];

        request.on('row', columns => {
          const row: any = {};
          columns.forEach(column => {
            row[column.metadata.colName] = column.value;
          });
          books.push(new Book(row.BookId, row.Title, row.Author, row.ISBN, row.AmountOwned));
        });
        
        request.on('requestCompleted', () => {
          books.sort((a: Book, b: Book) => a.BookId.toString().localeCompare(b.BookId.toString()))
          if (titleSearch) {
            books = books.filter((book: Book) => book.Title.indexOf(titleSearch.toString()) !== -1);
          }
          if (authorSearch) {
            books = books.filter((book: Book) => book.Author.indexOf(authorSearch.toString()) !== -1);
          }
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
    
    getBorrowedBooks(req: Request, res: Response) {
      // will need to get the username from the jwt later
      const userId = 115125610;
      
      const request = new tedious.Request(
            'select borrows.BorrowId, books.BookId, borrows.ReturnDateLimit, borrows.ActualReturnDate from ' + 
            'bookish.dbo.users join bookish.dbo.borrows on users.UserId = borrows.UserId ' + 
            'join bookish.dbo.books on borrows.BookId = books.BookId ' + 
            `where users.userId = ${userId}`, (err, rowCount) => {
        if (err) {
          console.log(err);
        }
      });
      
      const userBorrows = [];
      
      request.on('row', columns => {
        const row: any = {};
        columns.forEach(column => {
          row[column.metadata.colName] = column.value;
        });
        console.log(row);
        userBorrows.push(new Borrow(row.BorrowId, userId, row.BookId, row.ReturnDateLimit, row.ActualReturnDate));
      });
      
      request.on('requestCompleted', () => {
        console.log(userBorrows);
        res.status(200).send(userBorrows); 
      });
      
      this.connection.execSql(request);
    }
}

export default new BookController().router;
