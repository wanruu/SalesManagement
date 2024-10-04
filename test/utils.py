import random


# class DatabaseSimulator:
#     _products = {}
#     _orders = {}
#     _refunds = {}
    
#     _cur_order_indexes = {}
#     _cur_refund_indexes = {}

#     _cur_item_id = 1
#     _cur_product_id = 1

#     def create_product(self, key):
#         self._products[key] = self._cur_product_id
#         self._cur_product_id += 1
#         return self._products[key]
    
#     def _create_item(self):
#         self._cur_item_id += 1
#         return self._cur_item_id - 1
    
#     def _generate_invoice_id(self, date, invoice_indexes):    
#         index = invoice_indexes[date] if date in invoice_indexes else 1
#         return date.replace("-", "") + "%04d" % index

#     def create_order(self, key, date, product_keys):
#         product_ids = []
#         for product_key in product_keys:
#             if product_key in self._products:
#                 product_id = self._products[product_key]
#             else:
#                 product_id = self.create_product(product_key)
#             product_ids.append(product_id)
        
#         items = [{ "id": self._create_item(), "product_id": product_id } for product_id in product_ids]
#         order_id = self._generate_invoice_id(date, self._cur_order_indexes)
#         self._orders[key] = { "id": order_id, "items": items }
#         if date in self._cur_order_indexes:
#             self._cur_order_indexes[date] += 1
#         else:
#             self._cur_order_indexes[date] = 2
#         return self._orders[key]
    
#     def create_refund(self, key, date, product_keys):
#         items = [{ "id": self._create_item(), "product_id": self._products[product_key] } for product_key in product_keys]
#         refund_id = self._generate_invoice_id(date, self._cur_refund_indexes)
#         self._refunds[key] = { "id": refund_id, "items": items }
#         if date in self._cur_refund_indexes:
#             self._cur_refund_indexes[date] += 1
#         else:
#             self._cur_refund_indexes[date] = 2
#         return self._refunds[key]
    
#     def get_product_id(self, key):
#         return self._products[key]

#     def get_refund(self, key):
#         return self._refunds[key]
    
#     def get_order(self, key):
#         return self._orders[key]


def generate_product(idx):
    return {
        "material": f"product_material{idx}",
        "name": f"product_name{idx}",
        "spec": f"product_spec{idx}",
        "unit": f"product_unit{idx}"
    }


def generate_partner(idx):
    return {
        "name": f"partner_name{idx}",
        "phone": f"partner_phone{idx}",
        "address": f"partner_address{idx}",
        "folder": f"partner_folder{idx}"
    }


def generate_order_item(idx, product, weight='random', delivered='random'):
    price = random.random() * 1000
    discount = random.randint(1,100)
    quantity = random.random() * 1000
    weight = random.random() * 1000 if weight == 'random' else weight
    delivered = random.randint(0, 1) == 1 if delivered == 'random' else delivered
    return {
        **product,
        "price": price,
        "discount": discount,
        "quantity": quantity,
        "weight": weight,
        "originalAmount": price * quantity,
        "amount": price * discount * quantity / 100,
        "remark": f"order_item_remark{idx}",
        "delivered": delivered
    }


def generate_order(partner, date, order_items):
    return {
        "partnerName": partner["name"],
        "date": date,
        "amount": 50,
        "prepayment": 20,
        "payment": 10,
        "invoiceItems": order_items
    }


def generate_refund_item(idx, product_id, order_item, weight='random', delivered='random'):
    quantity = random.random() * 1000
    weight = random.random() * 1000 if weight == 'random' else weight
    delivered = random.randint(0, 1) == 1 if delivered == 'random' else delivered
    return {
        "productId": product_id,
        "price": order_item["price"],
        "discount": order_item["discount"],
        "quantity": quantity,
        "weight": weight,
        "originalAmount": order_item["price"] * quantity,
        "amount": order_item["price"] * order_item["discount"] * quantity / 100,
        "remark": f"order_item_remark{idx}",
        "delivered": delivered
    }


def generate_refund(order, date, order_id, refund_items):
    return {
        "partnerName": order["partnerName"],
        "date": date,
        "amount": 1,
        "prepayment": 0,
        "payment": 0,
        "orderId": order_id,
        "invoiceItems": refund_items
    }


def average_weight(items):
    items = list(filter(lambda item: item["weight"] is not None, items))
    tmp = sum(map(lambda i: i["quantity"], items))
    return sum(map(lambda i: i["weight"], items)) / tmp if tmp != 0 else None


def from_dict(dict_data, keys):
    new_dict = {}
    for key in keys:
        if key in dict_data:
            new_dict[key] = dict_data[key]
        else:
            raise KeyError("from_dict")
    return new_dict