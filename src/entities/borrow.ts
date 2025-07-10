export class Borrow {
  BorrowId: number;
  UserId: number;
  BookId: number;
  ReturnDateLimit?: Date;
  ActualReturnDate?: Date;
  
  constructor(BorrowId, UserId, BookId, ReturnDateLimit?, ActualReturnDate?) {
    this.BorrowId = BorrowId;
    this.UserId = UserId;
    this.BookId = BookId;
    this.ReturnDateLimit = ReturnDateLimit;
    this.ActualReturnDate = ActualReturnDate;
  }
}