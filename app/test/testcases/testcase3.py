# 1. 创建sales order，包含不存在的product(3个)，不存在的partner
# 2. 创建对应的sales refund，包含order的前两项
# 3. 删除product1，被拒绝，检查product列表

from testcase import Testcase, TestStep
from utils import *


def run():
    # prepare data
    product1 = generate_product(1)
    product2 = generate_product(2)
    product3 = generate_product(3)
    partner1 = generate_partner(1)
    order_items = [
        generate_order_item(1, product1, delivered=True),
        generate_order_item(2, product2, delivered=True),
        generate_order_item(3, product3, delivered=True),
    ]
    order = generate_order(partner1, '2024-01-01', order_items)
    refund_items = [
        generate_refund_item(1, 1, order_items[0], delivered=True),
        generate_refund_item(2, 2, order_items[1], delivered=False)
    ]
    refund = generate_refund(order, '2024-12-31', 1, refund_items)


    # define test step
    testcase = Testcase()


    # 1. 创建sales order，包含不存在的product(3个)，不存在的partner
    t_desc = "Create order 1 (product 1, 2, 3 & partner 1)."
    t = TestStep.post("/salesOrders", order, t_desc, 201, { "id": 1 })
    testcase.add_step(t)

    # 2. 创建对应的sales refund，包含order的前两项
    t_desc = "Create refund 2 (order 1, product 1, 2)"
    t = TestStep.post("/salesRefunds", refund, t_desc, 201, { "id": 2 })
    testcase.add_step(t)

    # 3. 删除product1，被拒绝，检查product列表
    t_desc = "Delete product 1."
    t = TestStep.delete("/products/1", t_desc, 500, { "error": "SequelizeForeignKeyConstraintError" })
    testcase.add_step(t)

    t_desc = "Check product list."
    t = TestStep.get("/products", t_desc, 200, [
        { "id": 1, **product1, "invoiceItemNum": 2 },
        { "id": 2, **product2, "invoiceItemNum": 2 },
        { "id": 3, **product3, "invoiceItemNum": 1 }
    ])
    testcase.add_step(t)


    testcase.run()