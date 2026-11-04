# TradeFlow data dictionary

TradeFlow is a fictional e-commerce company selling in five countries (Nigeria, Ghana, Kenya, South Africa, Rwanda) and five product categories (Electronics, Fashion, Home & Kitchen, Beauty & Health, Books & Stationery). Orders run from 2023-01-01 to 2026-06-30.

Dates are plain text in `YYYY-MM-DD` form. An empty cell in a CSV is a missing value (NULL).

## The eight tables

| File | Rows | Columns |
|------|-----:|---------|
| `regions.csv` | 50 | region_id, region_name, country |
| `customers.csv` | 2,000 | customer_id, customer_name, email, country, region_id, signup_date |
| `employees.csv` | 200 | employee_id, employee_name, role, region_id, hire_date |
| `products.csv` | 150 | product_id, product_name, category, unit_price, stock_quantity |
| `orders.csv` | 10,000 | order_id, customer_id, employee_id, order_date, order_status |
| `order_items.csv` | 25,000 | order_item_id, order_id, product_id, quantity, unit_price |
| `payments.csv` | 10,000 | payment_id, order_id, payment_method, amount, payment_status, payment_date |
| `deliveries.csv` | 9,500 | delivery_id, order_id, delivery_status, dispatch_date, delivery_date |

## How the tables connect

```
regions ── customers ── orders ── order_items ── products
                          │  └── payments
                          │  └── deliveries
                       employees
```

Each order belongs to one customer and is handled by one employee. An order has one or more lines in `order_items`, one payment and (usually) one delivery.

## Allowed values

- **order_status:** Completed, Processing, Cancelled, Returned
- **payment_status:** Paid, Pending, Refunded, Failed
- **payment_method:** Mobile Money, Card, Bank Transfer, Cash on Delivery
- **delivery_status:** Delivered, In Transit, Delayed, Failed

## Built-in messiness

The data is intentionally imperfect so that you can practise cleaning and auditing it:

- 58 customers have no email, and 50 emails are typed in capital letters
- 38 customer names start with a title (such as Dr. or Mrs.) and 41 end with a suffix (such as MD or PhD)
- 1,239 deliveries have no delivery date (they are still In Transit or have Failed)
- 500 orders have no delivery record (all of them Cancelled)
- 18 customers have never placed an order
- 5,037 orders are dated before the customer's signup date
- 460 Cancelled orders and 437 Returned orders have a payment marked Paid
- 147 combinations of order and product appear on more than one line. These are real purchases: the payments only add up to the order lines when all 25,000 lines are kept
