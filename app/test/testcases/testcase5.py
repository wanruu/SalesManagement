# 1. 创建一个product，检查product列表和详情
# 2. 创建sales order，包含已存在的product(1个)、不存在的product(2个)
# 3. 创建对应的sales refund，包含order的前两项
# 4. 修改第一个product的所有信息(4->4)，检查product列表和详情，检查order、refund详情

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
        generate_order_item(3, product3, delivered=True),
    ]
    order = generate_order(partner1, '2024-01-01', order_items)
    order_number = '202401010001'
    refund_items = [
        generate_refund_item(1, 1, order_items[0], delivered=True),
        generate_refund_item(2, 2, order_items[1], delivered=False)
    ]
    refund = generate_refund(order, '2024-12-31', 1, refund_items)
    refund_number = '202412310001'

    basic_order = from_dict(order, ["partnerName", "date", "amount", "prepayment", "payment"])
    basic_refund = from_dict(refund, ["partnerName", "date", "amount", "prepayment", "payment"])
    invoice_item_basic_fields = ["price", "discount", "quantity", "weight", "originalAmount", "amount", "remark", "delivered"]


    # define test step
    testcase = Testcase()


    # 1. 创建一个product，检查product列表和详情
    t_desc = "Create product 1."
    t = TestStep.post("/products", product1, t_desc, 201, {
        "id": 1,
        **product1
    })
    testcase.add_step(t)

    t_desc = "Check product list."
    t = TestStep.get("/products", t_desc, 200, [
        { "id": 1, **product1, "invoiceItemNum": 0 }
    ])
    testcase.add_step(t)

    t_desc = "Check product 1."
    t = TestStep.get("/products/1", t_desc, 200, { 
        "id": 1, **product1,
        "unitWeight": None,
        "invoiceItems": []
    })
    testcase.add_step(t)

    
    # 2. 创建sales order，包含已存在的product(1个)、不存在的product(2个)
    t_desc = "Create order 1 (product 1, 2, 3 & partner 1)."
    t = TestStep.post("/salesOrders", order, t_desc, 201, { "id": 1 })
    testcase.add_step(t)


    # 3. 创建对应的sales refund，包含order的前两项
    t_desc = "Create refund 2 (order 1, product 1, 2)"
    t = TestStep.post("/salesRefunds", refund, t_desc, 201, { "id": 2 })
    testcase.add_step(t)


    # 4. 修改第一个product的所有信息(1->4)，检查product列表和详情，检查order、refund详情
    t_desc = "Update product 1."
    t = TestStep.put("/products/1", product4, t_desc, 201, {
        "id": 1,
        **product4
    })
    testcase.add_step(t)

    t_desc = "Check product list."
    t = TestStep.get("/products", t_desc, 200, [
        { "id": 1, **product4, "invoiceItemNum": 2 },
        { "id": 2, **product2, "invoiceItemNum": 2 },
        { "id": 3, **product3, "invoiceItemNum": 1 },
    ])
    testcase.add_step(t)

    t_desc = "Check product 1."
    t = TestStep.get("/products/1", t_desc, 200, {
        "id": 1, **product4,
        "unitWeight": average_weight([order_items[0], refund_items[0]]),
        "invoiceItems": [
            {
                "id": 1,
                "productId": 1,
                "invoiceId": 1,
                **from_dict(order_items[0], invoice_item_basic_fields),
            },
            {
                "id": 4,
                "productId": 1,
                "invoiceId": 2,
                **from_dict(refund_items[0], invoice_item_basic_fields),
            }
        ]
    })
    testcase.add_step(t)

    t_desc = "Check order 1."
    t = TestStep.get("/salesOrders/1", t_desc, 200, {
        "id": 1,
        "number": order_number,
        "type": "salesOrder",
        **basic_order,
        "orderId": None,
        "refund": {
            "id": 2,
            "number": refund_number,
            "type": "salesRefund",
            **basic_refund,
            "orderId": 1,
            "invoiceItems": [
                {
                    "id": 4,
                    "productId": 1,
                    **from_dict(refund_items[0], invoice_item_basic_fields),
                    "invoiceId": 2
                },
                {
                    "id": 5,
                    "productId": 2,
                    **from_dict(refund_items[1], invoice_item_basic_fields),
                    "invoiceId": 2
                },
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
                "id": 1,
                "productId": 1,
                **from_dict(order_items[0], invoice_item_basic_fields),
                "invoiceId": 1,
                "product": { "id": 1, **product4 }
            },
            {
                "id": 2,
                "productId": 2,
                **from_dict(order_items[1], invoice_item_basic_fields),
                "invoiceId": 1,
                "product": { "id": 2, **product2 }
            },
            {
                "id": 3,
                "productId": 3,
                **from_dict(order_items[2], invoice_item_basic_fields),
                "invoiceId": 1,
                "product": { "id": 3, **product3 }
            },
        ]
    })
    testcase.add_step(t)

    t_desc = "Check refund 2."
    t = TestStep.get("/salesRefunds/2", t_desc, 200, {
        "id": 2,
        "number": refund_number,
        "type": "salesRefund",    
        **basic_refund,
        "orderId": 1,
        "order": {
            "id": 1,
            "number": order_number,
            "type": "salesOrder",
            **basic_order,
            "orderId": None,
            "invoiceItems": [
                {
                    "id": 1,
                    "productId": 1,
                    **from_dict(order_items[0], invoice_item_basic_fields),
                    "invoiceId": 1
                },
                {
                    "id": 2,
                    "productId": 2,
                    **from_dict(order_items[1], invoice_item_basic_fields),
                    "invoiceId": 1
                },
                {
                    "id": 3,
                    "productId": 3,
                    **from_dict(order_items[2], invoice_item_basic_fields),
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
                "id": 4,
                "productId": 1,
                **from_dict(refund_items[0], invoice_item_basic_fields),
                "invoiceId": 2,
                "product": { "id": 1, **product4 }
            },
            {
                "id": 5,
                "productId": 2,
                **from_dict(refund_items[1], invoice_item_basic_fields),
                "invoiceId": 2,
                "product": { "id": 2, **product2 }
            }
        ]
    })
    testcase.add_step(t)


    testcase.run()