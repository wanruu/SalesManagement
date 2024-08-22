# API

## salesOrder

### POST /salesOrder

```json
{
    "partner": "xxx",
    "date": "MMMM-YY-DD",
    "amount" "1",
    "items": [
        {
        	"material": "xxx",
            "name": "xxx",
            "spec": "xxx",
            "unit": "xxx",

            "price": "1",
            "discount": "1",
            "quantity": "1",
            "originalAmount": "1",
    		"amount": "1",
            "remark": "xxx"
        }
    ]
}
```

1. partner、date、items、amount缺一不可，否则返回`400: Insufficient data`。成功则返回`{"id": "xxx"}`。
2. date必须为`MMMM-YY-DD`格式，否则返回`400: Wrong data format, use MMMM-YY-DD`。
3. 服务器错误则返回`500`。

### POST /invoice

```json
{
	"no": "xxx",  // invoice id: text or undefined
    "customer": "xxx",  // customer name
    "date": "MMMM-YY-DD",  // create_date: string
    "items": [
        {
            "material": "xxx",
            "name": "xxx",
            "spec": "xxx",
            "unitPrice": 1,
            "quantity": 1,
            "remark": "xxx"
        }
    ]
}
```

1. 如果no是undefined，则认为是新单据，customer、date、items缺一不可，否则返回`400: Insufficient data`。成功则返回`{"no": "xxx"}`。
2. 如何no不是undefined，则更新旧单据，只更新提供的数据。成功则返回`200`，无数据。

2. date必须为`MMMM-YY-DD`格式，否则返回`400: Wrong data format, use MMMM-YY-DD`。

3. 服务器错误则返回`500`。

### GET /invoice

params: no或nos

1. 返回未删除的invoice list，每一项格式如下 (group by invoice id)：

```json
{
    "no": "xxx",
    "customer": "xxx",  // customer name
    "date": "MMMM-YY-DD",  // create_date: string
    "items": [
        {
            "material": "xxx",
            "name": "xxx",
            "spec": "xxx",
            "unitPrice": 1,
            "quantity": 1,
            "remark": "xxx"
        },...
    ]
}
```

2. 服务器错误则返回`500`。

3. 如果需要返回删除的invoice list，使用`GET /invoice/deleted`，只接受no。

### GET /invoice/deleted

参数为`{"no": "xxx"}`，可选

### DELETE /invoice

```json
{
    "no": "xxx",
    "oper" "xxx"  // bin or destroy
}
```

1. no和oper缺一不可，否则返回`400: Insufficient data`。
2. oper为bin表示移入回收站，只更新delete_date，返回`200`。
3. oper为destroy表示彻底删除，返回`200`。

4. 服务器错误则返回`500`。

### PUT /invoice/recover

1. body中no如果是undefined，返回`400: Insufficient data`。

2. 更新指定invoice的delete_date为NULL，返回`200`。

3. 服务器错误则返回`500`。

### PUT /invoice/pay

```json
{
    "isPaid": true,  // bool
    "no": "xxx"
}
```

返回`500`或`200`。

### PUT /invoice/invoice

```json
{
    "isInvoiced": true,  // bool
    "no": "xxx"
}
```

返回`500`或`200`。

### POST /invoice/upload

```json
{
    "invoices": [
        {
            "no": "xxx",
            "customer": "xxx",
            "date": "YYYY-MM-DD",
            "isPaid": true,
            "isInvoiced": true,
            "items": [
                "material": "xxx",
                "name": "xxx",
                "spec": "xxx",
                "unitPrice": 1,
                "quantity": 1,
                "remark": "xxx"
            ]
        }, ...
    ]
}
```

返回`500`或`200`。

### GET /invoice/overview

```json
{
	"deleted": false,  // undefined, true or false
}
```

1. 如果deleted是undefined或false，则搜索未被删除的单据；否则搜索已被删除的单据，返回`200`格式如下。

   ```json
   {
   	"no": "xxx",
       "customer": "xxx",
       "date": "YYYY-MM-DD",  // 已被删除则是create_date与delete_date
       "amount": 1000  // 单据总金额，保留两位小数
   }
   ```

2. 服务器错误则返回`500`。


## Prompt

### GET /prompt/customer

```json
{
    "keyword": "xxx",
    "maxLen": 5
}
```

### GET /prompt/productMaterial

```json
{
    "keyword": "xxx",
    "maxLen": 5
}
```

### GET /prompt/productName

```json
{
    "name": "xxx",
    "maxLen": 5
}
```

### GET /prompt/productSpec

```json
{
    "spec": "xxx",
    "maxLen": 5
}
```

## Statistic

### `GET` /statistic/range

#### Description
Return the time span of all invoices.

#### Response data
```js
{ minDate: "YYYY-MM-DD", maxDate: "YYYY-MM-DD" }
```


### `GET` /statistic/abstract/sales

#### Description
Analyze all sales invoices within the time range 
and return some data metrics.

#### Request params
```js
{ startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" }
```

#### Response data
```js
{
    grossIncome: 0.00,
    income: 0.00,
    refund: 0.00,
    nCustomers: 0,
    nProducts: 0,
    nInvoices: 0
}
```