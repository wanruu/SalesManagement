# 1. 创建sales order，包含product(2个)，不存在的partner
# 2. 创建对应的sales refund，包含order的第一项产品product1
# 3. 修改order的invoiceItems第一项为product3，新增一项product4，检查order和refund列表和详情

from testcase import Testcase, TestStep
from utils import *


def run():
    # prepare data
    product1 = generate_product(1)
    product2 = generate_product(2)
    product3 = generate_product(3)
    product4 = generate_product(4)
    partner1 = generate_partner(1)
    order_items = [
        generate_order_item(1, product1, delivered=True),
        generate_order_item(2, product2, delivered=True),
    ]
    order = generate_order(partner1, '2024-01-01', order_items)
    order_number = "202401010001"
    refund_items = [
        generate_refund_item(1, 1, order_items[0], delivered=True)
    ]
    refund = generate_refund(order, '2024-12-31', 1, refund_items)
    refund_number = "202412310001"


    invoice_item_basic_fields = ["price", "discount", "quantity", "weight", "originalAmount", "amount", "remark", "delivered"]


    # define test step
    testcase = Testcase()


    # 1. 创建sales order，包含product(2个)，不存在的partner
    t_desc = "Create order 1 (product 1, 2 & partner 1)."
    t = TestStep.post("/salesOrders", order, t_desc, 201, { "id": 1 })
    testcase.add_step(t)

    # 2. 创建对应的sales refund，包含order的第一项产品product1
    t_desc = "Create refund 2 (order 1, product 1)"
    t = TestStep.post("/salesRefunds", refund, t_desc, 201, { "id": 2 })
    testcase.add_step(t)

    # 3. 修改order的invoiceItems第一项为product3，新增一项product4，检查order和refund列表和详情
    t_desc = "Update order 1 items."
    new_order_items = [
        generate_order_item(3, product3, delivered=True),
        generate_order_item(2, product2, delivered=True),
        generate_order_item(4, product4, delivered=True),
    ]
    new_order = generate_order(partner1, '2024-01-01', new_order_items)
    order_res = {
        "id": 1,
        "type": "salesOrder",
        "number": order_number,
        **from_dict(new_order, ["partnerName", "date", "amount", "prepayment", "payment"]),
        "orderId": None,
        "refund": {
            "id": 2,
            "number": refund_number,
            "type": "salesRefund",
            **from_dict(refund, ["partnerName", "date", "amount", "prepayment", "payment"]),
            "orderId": 1,
            "invoiceItems": [
                {
                    "id": 3,
                    "productId": 1,
                    **from_dict(refund_items[0], invoice_item_basic_fields),
                    "invoiceId": 2,
                }
            ]
        },
        "partner": {
            "name": partner1["name"],
            "phone": None,
            "address": None,
            "folder": None
        },
        "invoiceItems": [
            {
                "id": 4,
                "productId": 3,
                **from_dict(new_order_items[0], invoice_item_basic_fields),
                "invoiceId": 1,
                "product": { "id": 3, **product3 }
            },
            {
                "id": 5,
                "productId": 2,
                **from_dict(new_order_items[1], invoice_item_basic_fields),
                "invoiceId": 1,
                "product": { "id": 2, **product2 }
            },
            {
                "id": 6,
                "productId": 4,
                **from_dict(new_order_items[2], invoice_item_basic_fields),
                "invoiceId": 1,
                "product": { "id": 4, **product4 }
            }
        ]
    }
    t = TestStep.put("/salesOrders/1", new_order, t_desc, 201, order_res)
    testcase.add_step(t)

    t_desc = "Check order list."
    t = TestStep.get("/salesOrders", t_desc, 200, [{
        "id": 1, 
        "type": "salesOrder",
        "number": order_number,
        **from_dict(new_order, ["partnerName", "date", "amount", "prepayment", "payment"]),
        "orderId": None,
        "refund": {
            "id": 2,
            "number": refund_number,
            "type": "salesRefund",
            **from_dict(refund, ["partnerName", "date", "amount", "prepayment", "payment"]),
            "orderId": 1
        },
        "deliveredItemNum": 3,
        "totalItemNum": 3
    }])
    testcase.add_step(t)

    t_desc = "Check order 1."
    t = TestStep.get("/salesOrders/1", t_desc, 200, order_res)
    testcase.add_step(t)

    t_desc = "Check refund list."
    t = TestStep.get("/salesRefunds", t_desc, 200, [{
        "id": 2,
        "type": "salesRefund",
        "number": refund_number,
        **from_dict(refund, ["partnerName", "date", "amount", "prepayment", "payment"]),
        "orderId": 1,
        "order": {
            "id": 1,
            "number": order_number,
            "type": "salesOrder",
            **from_dict(new_order, ["partnerName", "date", "amount", "prepayment", "payment"]),
            "orderId": None
        },
        "deliveredItemNum": 1,
        "totalItemNum": 1
    }])
    testcase.add_step(t)

    t_desc = "Check refund 2."
    t = TestStep.get("/salesRefunds/2", t_desc, 200, {
        "id": 2,
        "type": "salesRefund",
        "number": refund_number,
        **from_dict(refund, ["partnerName", "date", "amount", "prepayment", "payment"]),
        "orderId": 1,
        "order": {
            "id": 1,
            "number": order_number,
            "type": "salesOrder",
            **from_dict(new_order, ["partnerName", "date", "amount", "prepayment", "payment"]),
            "orderId": None,
            "invoiceItems": [
                {
                    "id": 4,
                    "productId": 3,
                    **from_dict(new_order_items[0], invoice_item_basic_fields),
                    "invoiceId": 1
                },
                {
                    "id": 5,
                    "productId": 2,
                    **from_dict(new_order_items[1], invoice_item_basic_fields),
                    "invoiceId": 1
                },
                {
                    "id": 6,
                    "productId": 4,
                    **from_dict(new_order_items[2], invoice_item_basic_fields),
                    "invoiceId": 1
                }
            ]
        },
        "partner": {
            "name": partner1["name"],
            "phone": None,
            "address": None,
            "folder": None
        },
        "invoiceItems": [
            {
                "id": 3,
                "productId": 1,
                **from_dict(refund_items[0], invoice_item_basic_fields),
                "invoiceId": 2,
                "product": { "id": 1, **product1 }
            },
        ]
    })
    testcase.add_step(t)


    testcase.run()