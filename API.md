[简体中文](API_zh_CN.md)

# API
- [💡 Standards](#💡-standards)
    - [Parameters](#parameters)
    - [Return values](#return-values)
- [📦 Products](#📦-products)
    - [List products](#list-products)
    - [Get a product](#get-a-product)
    - [Create a product](#create-a-product)
    - [Modify a product](#modify-a-product)
    - [Delete a product](#delete-a-product)
- [👤 Partners](#👤-partners)
    - [List partners](#list-partners)
    - [Get a partner](#get-a-partner)
    - [Create a partner](#create-a-partner)
    - [Modify a partner](#modify-a-partner)
    - [Delete a partner](#delete-a-partner)
- [🧾 Invoices](#🧾-invoices)
    - [List invoices](#list-invoices)
    - [Get an invoice](#get-an-invoice)
    - [Create an invoice](#create-an-invoice)
    - [Modify an invoice](#modify-an-invoice)
    - [Delete an invoice](#delete-an-invoice)
- [🔔 Suggestions](#🔔-suggestions)
    - [Partner suggestions](#partner-suggestions)
    - [Product suggestions](#product-suggestions)
- [📊 Statistics](#📊-statistics)

---

## 💡 Standards
### Parameters
- Conforms to RESTful API standards.
- Use `query` or `body` parameters. `Content-Type` should be `application/json`.

### Return values
- Use JSON format for response.
- Success
    - `200 OK` (GET)
    - `201 CREATED` (POST, PUT)
    - `204 NO CONTENT` (DELETE)
- Failure
    - Format:
        ```js
        { "error": "xxx" }
        ```
    - `400 INVALID REQUEST`
        - "xxx is required"
        - "xxx is not allowed"
        - "xxx is not allowed to be empty"
        - "xxx must be a(n) string/number/integer/boolean/valid date"
        - "xxx must be greater/less than or equal to [number]"
        - "xxx with value xxx fails to match the required pattern: /^\\d{4}-\\d{2}-\\d{2}$/"
    - `404 NOT FOUND`
        - "Not Found"
    - `500 INTERNAL SERVER ERROR`
        - "SequelizeUniqueConstraintError"
            - Violat unique constraint, such as the name of the partner, product information.
        - "SequelizeForeignKeyConstraintError"
            - Violate foreign key constraint, such as attempt to delete a product that has already been used in an invoice.
## 📦 Products
### List products
- **GET** `/products`
- Parameters (optional): `query`
    ```js
    {
        "keyword": "xxx",
        "material": "material",
        "name": "name",
        "spec": "spec",
        "unit": ["k"],
    }
    ```
- Return value
    ```js
        [
            {
                "id": 1,
                "matertial": "material1",
                "name": "name1",
                "spec": "spec1",
                "unit": "unit1",
                "invoiceItemNum": 3
            }
        ]
    ```

### Get a product
- **GET** `/products/:id`, `/products/:material?/:name/:spec`
- Parameters (optional): `query`
    ```js
    {
        "sortBy": "id",
        "order": "DESC",
        "detail": false,  // return invoiceItems & unitWeight or not
    }
    ```
- Return value
    ```js
    {
        "id": 1,
        "material": "material1",
        "name": "name1",
        "spec": "spec1",
        "unit": "unit1",
        "unitWeight": 1,  // or null
        "invoiceItems": [
            {
                "id": 1,
                "productId": 1,
                "price": 1,
                "quantity": 10,
                "discount": 100,
                "weight": 10,  // or null
                "originalAmount": 10,
                "amount": 10,
                "remark": "remark",  // or null
                "delivered": true,
                "invoiceId": 1,
            }
        ]
    }
    ```

### Create a product
- **POST** `/products`
- Parameters: `body`
    ```js
    {
        "material": "material1",
        "name": "name1",
        "spec": "spec1",
        "unit": "k"
    }
    ```
    - Pair `(material, name, spec)` must be unique, otherwise it will return `SequelizeUniqueConstraintError`.
    - `material` can be empty string but can not be `null`, other fields can not be empty.
- Return value
    ```js
    {
        "id": 1,
        "material": "material1",
        "name": "name1",
        "spec": "spec1",
        "unit": "k"
    }
    ```


### Modify a product
- **PUT** `/products/:id`
- Parameters and return value
    - Same as those in [create a product](#create-a-product)


### Delete a product
- **DELETE** `/products/:id`
- No parameters
- No return values
    - If the product is not included in any invoices, it will be deleted successfully; otherwise, it will return `SequelizeForeignKeyConstraintError`.


## 👤 Partners
### List partners
- **GET** `/partners`
- Parameters (optional): `query`
    ```js
    {
        "keyword": "xx", 
        "name": "xx",
        "address": "xx",
        "folder": "xx",
        "phone": "xx",
        "sortBy": "name",
        "order": "ASC",
    }
    ```
- Return value
    ```js
    [
        {
            "name": "partner1",
            "phone": "phone1",  // or null
            "address": "address1",  // or null
            "folder": "folder",  // or null
            "salesNum": 1,
            "purchaseNum": 1,
        },
    ]
    ```

### Get a partner
- **GET** `/partners/:name`
- No parameters
- Return value
    ```js
    {
        "name": "partner1",
        "phone": "phone1", // or null
        "address": "address1", // or null
        "folder": "folder1", // or null
        "invoices": [
            {
                "id": 1,
                "number": "202011110001",
                "type": "salesOrder",  // or "purchaseOrder"
                "partnerName": "partner1",
                "date": "2020-11-11",
                "amount": 10,
                "prepayment": 1,
                "payment": 9,
                "orderId": null,  // must be null
                "refund": {
                    "id": 2,
                    "number": "202011110001",
                    "type": "salesRefund",  // or "purchaseRefund"
                    "partnerName": "partner1",
                    "date": "2020-11-11",
                    "amount": 10,
                    "prepayment": 1,
                    "payment": 9,
                    "orderId": 1,  // must not be null
                },  // or null
            }
        ]
    }
    ```

### Create a partner
- **POST** `/partners`
- Parameters: `body`
    ```js
    {
        "name": "partner1",
        "phone": "phone1",  // optional
        "address": "address1",  // optional
        "folder": "folder1",  // optional
    }
    ```
    - `name` must be unique, otherwise it will return `SequelizeUniqueConstraintError`.
    - `phone` / `address` / `folder` can be not included in the paramters, or they can be `null`.
- Return value
    ```js
    {
        "name": "partner1",
        "phone": "phone1",  // or null / not include
        "address": "address1",  // or null / not include
        "folder": "folder1",  // or null / not include
    }
    ```
    

### Modify a partner
- **PUT** `/partners/:name`
- Parameters and return value
    - Same as those in [Create a partner](#create-a-partner)


### Delete a partner
- **DELETE** `/partners/:name`
- No parameters
- No return values
    - All invoices belonging to this partner will be deleted.


## 🧾 Invoices
- `invoiceType`
    - "salesOrder"
    - "salesRefund"
    - "purchaseOrder"
    - "purchaseRefund"

### List invoices
- **GET** `/[invoiceType]s`
- Parameters (optional): `query`
    ```js
    {
        "startDate": "2024-01-01",
        "endDate": "2024-02-02",
        "sortBy": "number",
        "order": "DESC",
        "keyword": "xxx",
        "partnerName": "partner1",
        "delivered": ["全部配送", "未配送"],
    }
    ```
- Return value
    ```js
    [
        {
            "id": 1,
            "number": "202409290001",
            "type": "salesOrder",
            "partnerName": "partner1",
            "date": "2024-09-30",
            "amount": 50,
            "prepayment": 1,
            "payment": 9,
            "orderId": null,  // or integer (if is refund)
            "delivered": "全部配送",  // "全部配送" or "部分配送" or "未配送"
            "refund": {  // or order (if is refund)
                "id": 2,
                "number": "202409290001",
                "type": "salesRefund",
                "partnerName": "partner1",
                "date": "2024-09-29",
                "amount": 50,
                "prepayment": 1,
                "payment": 9,
                "orderId": 1
            },  // or null
        }
    ]
    ```
    - If it is an order, then `orderId` must be `null`, and there must be a `refund` whose `orderId` must not be `null`.
    - If it is a refund, then `orderId` must not be `null`, and there must be an `order` whose `orderId` must be `null`.

### Get an invoice
- **GET** `/[invoiceType]s/:id`
- No parameters
- Return value
    ```js
    {
        "id": 1,
        "number": "202409290001",
        "type": "salesOrder",
        "partnerName": "partner1",
        "date": "2024-09-29",
        "amount": 50,
        "prepayment": 1,
        "payment": 9,
        "orderId": null,  // or integer (if is refund)
        "delivered": "部分配送",  // "全部配送" or "部分配送" or "未配送"
        "refund": {  // or order (if is refund)
            "id": 2,
            "number": "202409290001",
            "type": "salesRefund",
            "partnerName": "partner1",
            "date": "2024-09-29",
            "amount": 50,
            "prepayment": 1,
            "payment": 9,
            "orderId": 1,
            "delivered": "部分配送",  // "全部配送" or "部分配送" or "未配送"
            "invoiceItems": [
                {
                    "id": 2,
                    "productId": 1,
                    "price": 5,
                    "discount": 100,
                    "quantity": 10,
                    "weight": null,  // or number
                    "originalAmount": 50,
                    "amount": 50,
                    "remark": "remark",  // or null
                    "delivered": false,
                    "invoiceId": 2,
                }
            ]
        },  // or null
        "partner": {
            "name": "partner1",
            "phone": null,  // or string
            "address": null,  // or string
            "folder": null,  // or string
        },
        "invoiceItems": [
            {
                "id": 1,
                "productId": 1,
                "price": 5,
                "discount": 100,
                "quantity": 10,
                "weight": null,  // or number
                "originalAmount": 50,
                "amount": 50,
                "remark": "remark",  // or null
                "delivered": false,
                "invoiceId": 1,
                "product": {
                    "id": 1,
                    "material": "material1",
                    "name": "name1",
                    "spec": "spec1",
                    "unit": "k"
                }
            }
        ]
    }
    ```
    - If it is an order, then `orderId` must be null, and there must be a `refund` whose `orderId` must not be null.
    - If it is a refund, then `orderId` must not be null, and there must be an `order` whose `orderId` must be null.


### Create an invoice
- **POST** `/[invoiceType]s`
- Parameters: `body`
    - If `invoiceType` belongs to an order
        ```js
        {
            "partnerName": "partner1",
            "date": "2024-09-29",
            "amount": 50,
            "prepayment": 1,
            "payment": 9,
            "invoiceItems": [
                {
                    "material": "material1",
                    "name": "name1",
                    "spec": "spec1",
                    "unit": "k",
                    "price": 5,
                    "discount": 100,  // integer, [0,100]
                    "quantity": 10,
                    "weight": null,  // optional
                    "originalAmount": 50,
                    "amount": 50,
                    "remark": "remark",  // optional
                    "delivered": false
                }
            ]
        }
        ```
    - If `invoiceType` belongs to a refund
        ```js
        {
            "partnerName": "partner1",
            "date": "2024-09-30",
            "amount": 50,
            "prepayment": 1,
            "payment": 9,
            "orderId": 1,
            "invoiceItems": [
                {
                    "productId": 1,
                    "price": 5,
                    "discount": 100,  // integer, [0,100]
                    "quantity": 10,
                    "weight": null,  // optional
                    "originalAmount": 50,
                    "amount": 50,
                    "remark": "remark",  // optional
                    "delivered": false
                }
            ]
        }
        ```
    - `date` must be in format `yyyy-MM-dd`.
    - `amount` / `prepayment` / `payment` / `price` / `quantity` / `originalAmount` are numbers, and `discount` is an integer in [0, 100].
    - `weight` is a number, can be not included or `null`.
    - `remark` can be not included or `null`.
- Return value
    - Same as that in [list invoices](#list-invoices)

### Modify an invoice
- **PUT** `/[invoiceType]s/:id`
- Parameters and return value
    - Same as those in [create an invoice](#create-an-invoice)


### Delete an invoice
- **DELETE** `/[invoiceType]s/:id`
- No parameters
- No return values
    - If it is an order, its corresponding refund will also be deleted.


## 🔔 Suggestions
### Partner suggestions
- **GET** `/suggestions/partners/names`
- Parameters: `query`
    ```js
    { "keyword": "keyword" }
    ```
- Return value


### Product suggestions
- **GET**
    - `/suggestions/products/materials`
    - `/suggestions/products/names`
    - `/suggestions/products/specs`
- Parameters: `query`
    ```js
    { "keyword": "keyword" }
    ```
- Return value


## 📊 Statistics