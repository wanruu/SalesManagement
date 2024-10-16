# API

- [💡 规格](#💡-规格)
    - [成功](#成功)
    - [错误](#错误)
- [📦 产品](#📦-产品)
    - [产品列表](#产品列表)
    - [产品详情](#产品详情)
    - [创建产品](#创建产品)
    - [修改产品](#修改产品)
    - [删除产品](#删除产品)
- [👤 交易对象](#👤-交易对象)
    - [交易对象列表](#交易对象列表)
    - [交易对象详情](#交易对象详情)
    - [创建交易对象](#创建交易对象)
    - [修改交易对象](#修改交易对象)
    - [删除交易对象](#删除交易对象)
- [🧾 清单](#🧾-清单)
    - [清单列表](#清单列表)
    - [清单详情](#清单详情)
    - [创建清单](#创建清单)
    - [修改清单](#修改清单)
    - [删除清单](#删除清单)
- [🔔 输入提示](#🔔-输入提示)
    - [交易对象提示](#交易对象提示)
    - [产品提示](#产品提示)
- [📊 统计数据](#📊-统计数据)
    - [交易摘要](#交易摘要)

---

## 💡 规格
### 成功
- `200 OK`
    - GET
- `201 CREATED`
    - POST, PUT
- `204 NO CONTENT`
    - DELETE

### 错误
返回格式：
```json
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
        - 违反唯一性约束，比如交易对象名称，产品信息
    - "SequelizeForeignKeyConstraintError"
        - 违反外键约束，比如删除已创建了清单的产品

## 📦 产品
### 产品列表
- **GET** `/products`
- 不带参数
- 返回值
    ```json
    [
        {
            "id": 1,
            "matertial": "材质1",
            "name": "名称1",
            "spec": "规格1",
            "unit": "单位1",
            "invoiceItemNum": 3
        }
    ]
    ```

### 产品详情
- **GET** `/products/:id`, `/products/:material?/:name/:spec`
- 不带参数
- 返回值
    ```json
    {
        "id": 1,
        "material": "材质1",
        "name": "名称1",
        "spec": "规格1",
        "unit": "单位1",
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
                "remark": "备注",  // or null
                "delivered": true,
                "invoiceId": 1,
            }
        ]
    }
    ```

### 创建产品
- **POST** `/products`
- 参数`body`
    ```json
    {
        "material": "材质1",
        "name": "名称1",
        "spec": "规格1",
        "unit": "只"
    }
    ```
    - `(material, name, spec)`必须唯一，如果重复会返回SequelizeUniqueConstraintError
    - `material`可以为空字符串但不能是`null`，其余项不可以为空
- 返回值
    ```json
    {
        "id": 1,
        "material": "材质1",
        "name": "名称1",
        "spec": "规格1",
        "unit": "只"
    }
    ```


### 修改产品
- **PUT** `/products/:id`
- 参数与返回值
    - 与[创建产品](#创建产品)相同


### 删除产品
- **DELETE** `/products/:id`
- 不带参数
- 无返回值
    - 如果该产品包含在清单中，则不可删除，返回SequelizeForeignKeyConstraintError


## 👤 交易对象
### 交易对象列表
- **GET** `/partners`
- 参数`query`（可选）
    ```js
    {
        keyword: "xx", 
        name: "xx",
        address: "xx",
        folder: "xx",
        phone: "xx",
        sortBy: "name",
        order: "ASC",
    }
    ```
- 返回值
    ```json
    [
        {
            "name": "交易对象1",
            "phone": "电话1",  // or null
            "address": "地址1",  // or null
            "folder": "文件夹1",  // or null
            "salesNum": 1,
            "purchaseNum": 1,
        },
    ]
    ```

### 交易对象详情
- **GET** `/partners/:name`
- 不带参数
- 返回值
    ```json
    {
        "name": "交易对象1",
        "phone": "电话1", // or null
        "address": "地址1", // or null
        "folder": "文件夹1", // or null
        "invoices": [
            {
                "id": 1,
                "number": "202011110001",
                "type": "salesOrder",  // or "purchaseOrder"
                "partnerName": "交易对象1",
                "date": "2020-11-11",
                "amount": 10,
                "prepayment": 1,
                "payment": 9,
                "orderId": null,  // must be null
                "refund": {
                    "id": 2,
                    "number": "202011110001",
                    "type": "salesRefund",  // or "purchaseRefund"
                    "partnerName": "交易对象1",
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

### 创建交易对象
- **POST** `/partners`
- 参数`body`
    ```json
    {
        "name": "交易对象1",
        "phone": "电话1",  // optional
        "address": "地址1",  // optional
        "folder": "文件夹1",  // optional
    }
    ```
    - `name`必须唯一，否则返回SequelizeUniqueConstraintError
    - `phone`/`address`/`folder`可以不包含在参数里，也可以指定为`null`
- 返回值
    ```json
    {
        "name": "交易对象1",
        "phone": "电话1",  // or null / not include
        "address": "地址1",  // or null / not include
        "folder": "文件夹1",  // or null / not include
    }
    ```
    

### 修改交易对象
- **PUT** `/partners/:name`
- 参数与返回值
    - 与[创建交易对象](#创建交易对象)相同


### 删除交易对象
- **DELETE** `/partners/:name`
- 不带参数
- 无返回值
    - 会删除其名下的所有清单


## 🧾 清单
- 清单类型`invoiceType`
    - "salesOrder"
    - "salesRefund"
    - "purchaseOrder"
    - "purchaseRefund"

### 清单列表
- **GET** `/[invoiceType]s`
- 不带参数
- 返回值
    ```json
    [
        {
            "id": 1,
            "number": "202409290001",
            "type": "salesOrder",
            "partnerName": "交易对象1",
            "date": "2024-09-30",
            "amount": 50,
            "prepayment": 1,
            "payment": 9,
            "orderId": null,  // or integer (if is refund)
            "deliveredItemNum": 0,
            "totalItemNum": 1,
            "refund": {  // or order (if is refund)
                "id": 2,
                "number": "202409290001",
                "type": "salesRefund",
                "partnerName": "交易对象1",
                "date": "2024-09-29",
                "amount": 50,
                "prepayment": 1,
                "payment": 9,
                "orderId": 1
            },  // or null
        }
    ]
    ```
    - 如果是order类型，则`orderId`必为`null`，有`refund`项且其`orderId`必不为`null`
    - 如果是refund类型，则`orderId`必不为`null`，有`order`项且其`orderId`必为`null`

### 清单详情
- **GET** `/[invoiceType]s/:id`
- 不带参数
- 返回值
    ```json
    {
        "id": 1,
        "number": "202409290001",
        "type": "salesOrder",
        "partnerName": "交易对象1",
        "date": "2024-09-29",
        "amount": 50,
        "prepayment": 1,
        "payment": 9,
        "orderId": null,  // or integer (if is refund)
        "refund": {  // or order (if is refund)
            "id": 2,
            "number": "202409290001",
            "type": "salesRefund",
            "partnerName": "交易对象1",
            "date": "2024-09-29",
            "amount": 50,
            "prepayment": 1,
            "payment": 9,
            "orderId": 1,
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
                    "remark": "备注",  // or null
                    "delivered": false,
                    "invoiceId": 2,
                }
            ]
        },  // or null
        "partner": {
            "name": "交易对象1",
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
                "remark": "备注",  // or null
                "delivered": false,
                "invoiceId": 1,
                "product": {
                    "id": 1,
                    "material": "材质1",
                    "name": "名称1",
                    "spec": "规格1",
                    "unit": "只"
                }
            }
        ]
    }
    ```
    - 如果是order类型，则`orderId`必为`null`，有`refund`项且其`orderId`必不为`null`
    - 如果是refund类型，则`orderId`必不为null，有`order`项且其`orderId`必为`null`


### 创建清单
- **POST** `/[invoiceType]s`
- 参数`body`
    - 如果`invoiceType`是order
        ```json
        {
            "partnerName": "交易对象1",
            "date": "2024-09-29",
            "amount": 50,
            "prepayment": 1,
            "payment": 9,
            "invoiceItems": [
                {
                    "material": "材质1",
                    "name": "名称1",
                    "spec": "规格1",
                    "unit": "只",
                    "price": 5,
                    "discount": 100,  // integer, [0,100]
                    "quantity": 10,
                    "weight": null,  // optional
                    "originalAmount": 50,
                    "amount": 50,
                    "remark": "备注",  // optional
                    "delivered": false
                }
            ]
        }
        ```
    - 如果`invoiceType`是refund
        ```json
        {
            "partnerName": "交易对象1",
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
                    "remark": "备注",  // optional
                    "delivered": false
                }
            ]
        }
        ```
    - `date`格式必须为`yyyy-MM-dd`
    - `amount`/`prepayment`/`payment`/`price`/`quantity`/`originalAmount`是数字类型，`discount`是[0, 100]的整数
    - `weight`是数字类型，可以不包含也可以为`null`
    - `remark`可以不包含也可以为`null`
- 返回值
    - 与[清单详情](#清单详情)相同

### 修改清单
- **PUT** `/[invoiceType]s/:id`
- 参数与返回值
    - 与[创建清单](#创建清单)相同


### 删除清单
- **DELETE** `/[invoiceType]s/:id`
- 不带参数
- 无返回值
    - 如果是order，会同时删除对应的refund


## 🔔 输入提示
### 交易对象提示
- **GET** `/suggestions/partners/names`
- 参数`query`
    ```json
    {
        "keyword": "keyword"
    }
    ```
- 返回值


### 产品提示
- **GET**
    - `/suggestions/products/materials`
    - `/suggestions/products/names`
    - `/suggestions/products/specs`
- 参数`query`
    ```json
    {
        "keyword": "keyword"
    }
    ```
- 返回值


## 📊 统计数据

### 交易摘要
- **GET** `/statistics`
TODO
<!-- - 参数`query`
    ```json
    {
        "startDate": "YYYY-MM-DD", 
        "endDate": "YYYY-MM-DD"
    }
    ```
- 返回值
    ```json
    {
        "grossIncome": 0.00,
        "income": 0.00,
        "refund": 0.00,
        "nCustomers": 0,
        "nProducts": 0,
        "nInvoices": 0
    }
    ``` -->