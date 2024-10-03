# Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Database](#database)
    - [Diagram](#diagram)

---

# Introduction
This is an Electron application for sales management, implemented by React.js, Node.js (server) and SQLite.



# Features
- [API](API)



# Database
Use sqlite3 database to store data in a single file `sales.db`.

## Diagram
![db diagram](screenshots/db_diagram.png)

Following is the source code in DBML (Database Markup Language) to draw the database diagram. (Website: https://dbdiagram.io)
```
Table product {
  id text unique
  material text [primary key]
  name text [primary key]
  spec text [primary key]
  unit text
}

Table partner {
  name text [primary key]
  phone text
  address text
  folder text
}

Table invoiceItem {
  id integer [primary key]
  productId text
  price decimal
  discount integer
  quantity decimal
  weight decimal
  originalAmount money
  amount money
  remark text
  delivered integer
  invoiceId text
}

Table invoice {
  id text [primary key]
  type integer
  partner text
  date text
  amount money
  prepayment money
  payment money
}

Table invoiceRelation {
  orderId text
  refundId text
}

Ref: invoiceItem.productId > product.id
Ref: invoice.partner > partner.name
Ref: invoiceItem.invoiceId > invoice.id
Ref: invoiceRelation.orderId > invoice.id
Ref: invoiceRelation.refundId > invoice.id
```
