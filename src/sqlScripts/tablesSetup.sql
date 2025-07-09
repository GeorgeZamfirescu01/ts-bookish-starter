create table Users (
  UserId int primary key,
  Name varchar(100),
  PasswordHash varchar(255)
)

create table Books (
  BookId int primary key,
  Title varchar(255),
  Author varchar(255),
  ISBN varchar(100),
  AmountOwned int
)

create table Borrows (
  BorrowId int primary key,
  UserId int
    constraint Borrows_Users_UserId_fk foreign key references users(UserId),
  BookId int
    constraint Borrows_Users_BookId_fk foreign key references books(BookId)
)