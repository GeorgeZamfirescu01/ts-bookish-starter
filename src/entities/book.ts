export class Book {
  BookId: number;
  Title: string;
  Author: string;
  ISBN: string;
  AmountOwned: number;
  
  constructor(BookId, Title, Author, ISBN, AmountOwned) {
    this.BookId = BookId;
    this.Title = Title;
    this.Author = Author;
    this.ISBN = ISBN;
    this.AmountOwned = AmountOwned;
  }
}