[简体中文](README_zh_CN.md)

# Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Database](#database)

---

# Introduction
This is an Electron application for sales management, implemented by React.js, Node.js (server) and SQLite.



# Features
- [API](API.md)



# Database
Use sqlite3 database to store data in a single file `sales.db`.

![db diagram](screenshots/db_diagram.svg)

Following is the source code in DBML (Database Markup Language) to draw the database diagram. (Website: https://dbdiagram.io)
```
Table product {
  id integer [primary key]
  material text
  name text
  spec text
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
  productId integer
  price decimal
  discount integer
  quantity decimal
  weight decimal
  originalAmount decimal
  amount decimal
  remark text
  delivered boolean
  invoiceId text
}

Table invoice {
  id integer [primary key]
  number text
  type text
  partnerName text
  orderId integer
  date text
  amount decimal
  prepayment decimal
  payment decimal
  delivered text
}

Ref: invoiceItem.productId > product.id
Ref: invoice.partnerName > partner.name
Ref: invoiceItem.invoiceId > invoice.id
Ref: invoice.orderId > invoice.id
```
