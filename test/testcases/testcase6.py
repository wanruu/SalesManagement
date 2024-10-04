# 1. 创建partner1、partner2，检查partner列表和详情
# 2. 再次创建partner1，提示唯一性约束
# 3. 使用parter1创建sales order，包含不存在的product(1个)，创建对应的sales refund
# 4. 修改partner1的name(1->2)，提示唯一性约束
# 5. 修改partner1的name(1->3)，检查partner列表和详情，检查order、refund列表
# 6. 修改partner1的所有信息(1->4)，检查检查partner列表和详情，检查order、refund列表

from testcase import Testcase, TestStep
from utils import *


def run():
    # prepare data
    product1 = generate_product(1)
    partner1 = generate_partner(1)
    partner2 = generate_partner(2)
    partner3 = generate_partner(3)
    partner4 = generate_partner(4)
    order_items = [
        generate_order_item(1, product1, delivered=True),
    ]
    order = generate_order(partner1, '2024-01-01', order_items)
    order_number = '202401010001'
    refund_items = [
        generate_refund_item(1, 1, order_items[0], delivered=False),
    ]
    refund = generate_refund(order, '2024-12-31', 1, refund_items)
    refund_number = '202412310001'


    # define test step
    testcase = Testcase()


    # 1. 创建partner、partner2，检查partner列表和详情
    t_desc = "Create partner 1."
    t = TestStep.post("/partners", partner1, t_desc, 201, partner1)
    testcase.add_step(t)

    t_desc = "Create partner 2."
    t = TestStep.post("/partners", partner2, t_desc, 201, partner2)
    testcase.add_step(t)

    t_desc = "Check partner list."
    t = TestStep.get("/partners", t_desc, 200, [
        { **partner1, "invoiceNum": 0 },
        { **partner2, "invoiceNum": 0 }
    ])
    testcase.add_step(t)

    t_desc = "Check partner 1."
    t = TestStep.get(f"/partners/{partner1['name']}", t_desc, 200, { 
        **partner1,
        "invoices": []
    })
    testcase.add_step(t)


    # 2. 再次创建partner1，提示唯一性约束
    t_desc = "Create partner 1."
    t = TestStep.post("/partners", partner1, t_desc, 500, { "error": "SequelizeUniqueConstraintError" })
    testcase.add_step(t)


    # 3. 使用parter1创建sales order，包含不存在的product(1个)，创建对应的sales refund
    t_desc = "Create order 1 (product 1 & partner 1)."
    t = TestStep.post("/salesOrders", order, t_desc, 201, { "id": 1 })
    testcase.add_step(t)

    t_desc = "Create refund 2 (order 1, product 1)"
    t = TestStep.post("/salesRefunds", refund, t_desc, 201, { "id": 2 })
    testcase.add_step(t)


    # 4. 修改partner1的name(1->2)，提示唯一性约束
    t_desc = "Update partner 1 (name: 1 -> 2)"
    t = TestStep.put(f"/partners/{partner1['name']}", {
        "name": partner2["name"],
        "phone": partner1["phone"],
        "address": partner1["address"],
        "folder": partner1["folder"]
    }, t_desc, 500, {
        "error": "SequelizeUniqueConstraintError"
    })
    testcase.add_step(t)


    # 5. 修改partner1的name(1->3)，检查partner列表和详情，检查order、refund列表
    t_desc = "Update partner 1 (name: 1 -> 3)"
    t = TestStep.put(f"/partners/{partner1['name']}", {
        "name": partner3["name"],
        "phone": partner1["phone"],
        "address": partner1["address"],
        "folder": partner1["folder"]
    }, t_desc, 201, { 
        "name": partner3["name"],
        "phone": partner1["phone"],
        "address": partner1["address"],
        "folder": partner1["folder"]
     })
    testcase.add_step(t)

    t_desc = "Check partner list."
    t = TestStep.get("/partners", t_desc, 200, [
        { **partner2, "invoiceNum": 0 },
        { 
            "name": partner3["name"], 
            "phone": partner1["phone"], 
            "address": partner1["address"],
            "folder": partner1["folder"],
            "invoiceNum": 2 
        },
    ])
    testcase.add_step(t)

    t_desc = "Check partner 3."
    t = TestStep.get(f"/partners/{partner3['name']}", t_desc, 200, { 
        "name": partner3["name"],
        "phone": partner1["phone"],
        "address": partner1["address"],
        "folder": partner1["folder"],
        "invoices": [{
            "id": 1,
            "number": order_number,
            "type": "salesOrder",
            "partnerName": partner3["name"],
            **from_dict(order, ["date", "amount", "prepayment", "payment"]),
            "orderId": None,
            "refund": {
                "id": 2,
                "number": refund_number,
                "type": "salesRefund",
                "partnerName": partner3["name"],
                **from_dict(refund, ["date", "amount", "prepayment", "payment"]),
                "orderId": 1
            }
        }]
    })
    testcase.add_step(t)

    t_desc = "Check order list."
    t = TestStep.get("/salesOrders", t_desc, 200, [{
        "id": 1,
        "number": order_number,
        "type": "salesOrder",
        "partnerName": partner3["name"],
        **from_dict(order, ["date", "amount", "prepayment", "payment"]),
        "orderId": None,
        "refund": {
            "id": 2,
            "number": refund_number,
            "type": "salesRefund",
            "partnerName": partner3["name"],
            **from_dict(refund, ["date", "amount", "prepayment", "payment"]),
            "orderId": 1,
        },
        "deliveredItemNum": 1,
        "totalItemNum": 1
    }])
    testcase.add_step(t)

    t_desc = "Check refund list."
    t = TestStep.get("/salesRefunds", t_desc, 200, [{
        "id": 2,
        "number": refund_number,
        "type": "salesRefund",
        "partnerName": partner3["name"],
        **from_dict(refund, ["date", "amount", "prepayment", "payment"]),
        "orderId": 1,
        "order": {
            "id": 1,
            "number": order_number,
            "type": "salesOrder",
            "partnerName": partner3["name"],
            **from_dict(order, ["date", "amount", "prepayment", "payment"]),
            "orderId": None,
        },
        "deliveredItemNum": 0,
        "totalItemNum": 1
    }])
    testcase.add_step(t)

    # 6. 修改partner1的所有信息(1->4)，检查检查partner列表和详情，检查order、refund列表
    t_desc = "Update partner 3"
    t = TestStep.put(f"/partners/{partner3['name']}", partner4, t_desc, 201, partner4)
    testcase.add_step(t)

    t_desc = "Check partner list."
    t = TestStep.get("/partners", t_desc, 200, [
        { **partner2, "invoiceNum": 0 },
        { **partner4, "invoiceNum": 2 },
    ])
    testcase.add_step(t)

    t_desc = "Check partner 4."
    t = TestStep.get(f"/partners/{partner4['name']}", t_desc, 200, { 
        **partner4,
        "invoices": [{
            "id": 1,
            "number": order_number,
            "type": "salesOrder",
            "partnerName": partner4["name"],
            **from_dict(order, ["date", "amount", "prepayment", "payment"]),
            "orderId": None,
            "refund": {
                "id": 2,
                "number": refund_number,
                "type": "salesRefund",
                "partnerName": partner4["name"],
                **from_dict(refund, ["date", "amount", "prepayment", "payment"]),
                "orderId": 1
            }
        }]
    })
    testcase.add_step(t)

    t_desc = "Check order list."
    t = TestStep.get("/salesOrders", t_desc, 200, [{
        "id": 1,
        "number": order_number,
        "type": "salesOrder",
        "partnerName": partner4["name"],
        **from_dict(order, ["date", "amount", "prepayment", "payment"]),
        "orderId": None,
        "refund": {
            "id": 2,
            "number": refund_number,
            "type": "salesRefund",
            "partnerName": partner4["name"],
            **from_dict(refund, ["date", "amount", "prepayment", "payment"]),
            "orderId": 1,
        },
        "deliveredItemNum": 1,
        "totalItemNum": 1
    }])
    testcase.add_step(t)

    t_desc = "Check refund list."
    t = TestStep.get("/salesRefunds", t_desc, 200, [{
        "id": 2,
        "number": refund_number,
        "type": "salesRefund",
        "partnerName": partner4["name"],
        **from_dict(refund, ["date", "amount", "prepayment", "payment"]),
        "orderId": 1,
        "order": {
            "id": 1,
            "number": order_number,
            "type": "salesOrder",
            "partnerName": partner4["name"],
            **from_dict(order, ["date", "amount", "prepayment", "payment"]),
            "orderId": None,
        },
        "deliveredItemNum": 0,
        "totalItemNum": 1
    }])
    testcase.add_step(t)


    testcase.run()