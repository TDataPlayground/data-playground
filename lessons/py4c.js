LESSONS.push(
{
  id: 'py-4-5',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: '',
  title: '4.5 Joining tables: bringing the story back together',
  tables: [],
  intro: `You have the revenue of every product. But the CEO asked about <b>categories</b>, and the category of a product is not in the order lines table. It lives in the products table. To answer her, you have to bring two tables together.<br><br>This is the situation in almost every real company. A database keeps customers in one table, orders in another, payments in a third, so that no fact is stored twice. The price of that tidiness is that any interesting question needs <b>several tables at once</b>. The tool that glues them is the <b>join</b>, called <code>merge</code> in Pandas. It is the same idea as <code>JOIN</code> in SQL and <code>VLOOKUP</code> in a spreadsheet, and it is step five, the last step, of the CEO’s question.<br><br>Joins are powerful and they are also where careless analysts quietly break their numbers. In this lesson you will learn how to join, how to choose the right type of join, and how to check every join so that no row is lost or doubled. At the end, you will have the CEO’s answer, and you will find 73 million of payments that someone in finance needs to see.`,
  steps: [
    {
      type: 'explain',
      title: 'Why the data is split, and how to glue it back',
      body: `<p>Look at what each TradeFlow table holds. The order lines table says <i>“order 1 contains product 98”</i>. It does not say what product 98 is, because that is stored once, in the products table. If the product’s name were copied onto every order line, then renaming a product would mean changing thousands of rows. So the data is split, and every table carries a <b>key</b>, a column such as <code>product_id</code>, that points to the matching row in another table.</p>
<p>A <b>join</b> uses that key to line up the rows of two tables and place their columns side by side. In Pandas:</p>
<p><code>left_table.merge(right_table, on="key_column")</code></p>
<div class="callout analogy"><b>It is a VLOOKUP, but for the whole table at once.</b> In a spreadsheet you type <code>=VLOOKUP(A2, products, 3)</code> next to the first order line, and drag it down. <code>merge</code> does that for every row in a single step, and it can bring across as many columns as you like.</div>
<p>Let’s try it on two tiny tables, so small that you can predict the result before you run it.</p>`
    },
    {
      type: 'try',
      title: 'Two small tables, one join',
      body: `<p>The left table knows the names of customers 1, 2 and 3. The right table knows the cities of customers 2, 3 and 4. The join lines them up on <code>customer_id</code>.</p>
<p>The result has just <b>two rows</b>: Ben in Accra and Chi in Lagos. Ada (customer 1) disappeared, because the cities table has nothing about her. And Kigali, customer 4, disappeared too, because the names table has nobody with that ID. A plain <code>merge</code> keeps only rows that have a partner on <b>both</b> sides. That is called an <b>inner join</b>. It is the default, and it is also the reason you must always check what a join dropped.</p>`,
      code: `import pandas as pd

names = pd.DataFrame({"customer_id": [1, 2, 3], "name": ["Ada", "Ben", "Chi"]})
cities = pd.DataFrame({"customer_id": [2, 3, 4], "city": ["Accra", "Lagos", "Kigali"]})

joined = names.merge(cities, on="customer_id")
print(joined)`
    },
    {
      type: 'explain',
      title: 'Four kinds of join: who survives?',
      body: `<p>What should happen to the rows that have no partner? There is no single right answer, so a join has a <code>how</code> argument with four choices:</p>
<table class="mini">
<tr><th><code>how=</code></th><th>Which rows are kept</th><th>SQL name</th></tr>
<tr><td><code>"inner"</code> (default)</td><td>Only rows that match on <b>both</b> sides</td><td><code>INNER JOIN</code></td></tr>
<tr><td><code>"left"</code></td><td><b>Every</b> row of the left table, with the right side’s columns filled in where a match exists, and left empty (NaN) where not</td><td><code>LEFT JOIN</code></td></tr>
<tr><td><code>"right"</code></td><td>Every row of the right table, the mirror image of left</td><td><code>RIGHT JOIN</code></td></tr>
<tr><td><code>"outer"</code></td><td><b>Everything</b> from both sides, with gaps wherever there is no partner</td><td><code>FULL OUTER JOIN</code></td></tr>
</table>
<p>A rule of thumb that serves analysts well: <b>put your main table on the left and use <code>how="left"</code></b>. Your main table is the one whose rows you care about, such as the orders. A left join promises that every one of those rows is still there afterwards, with extra columns attached where available. Nothing disappears silently.</p>
<p>Let’s run all four on the same two tiny tables, and compare.</p>`
    },
    {
      type: 'try',
      title: 'The same tables, four joins',
      body: `<p>Run it and compare the four tables.</p>
<ul>
<li><b>inner</b>: Ben and Chi only. Two rows.</li>
<li><b>left</b>: Ada, Ben and Chi. Ada has no city, so her <code>city</code> shows <code>NaN</code>, Python’s mark for a missing value.</li>
<li><b>right</b>: Ben, Chi and customer 4. The name of customer 4 is missing, but his city, Kigali, is there.</li>
<li><b>outer</b>: all four customers. A gap appears wherever one side had no match.</li>
</ul>
<p>The same key column, <code>customer_id</code>, is shared and appears only once in the result. The other columns are placed side by side.</p>`,
      code: `import pandas as pd

names = pd.DataFrame({"customer_id": [1, 2, 3], "name": ["Ada", "Ben", "Chi"]})
cities = pd.DataFrame({"customer_id": [2, 3, 4], "city": ["Accra", "Lagos", "Kigali"]})

for how in ["inner", "left", "right", "outer"]:
    print(how)
    print(names.merge(cities, on="customer_id", how=how))`
    },
    {
      id: 'py-4-5-c1',
      type: 'check',
      title: 'You want every order in the result, even orders that have no delivery, and you do not care about deliveries that match no order. Which join do you use, with orders on the left?',
      body: `<p>Think about which side must keep all of its rows.</p>`,
      options: [
        'how="inner"',
        'how="left"',
        'how="right"',
        'how="outer"'
      ],
      answer: 1,
      why: [
        'An inner join keeps only rows with a partner on both sides, so orders without a delivery would vanish.',
        'Yes! A left join keeps every row of the left table (the orders). Where there is no delivery, the delivery columns are simply empty.',
        'A right join would keep every delivery, and drop orders that have no delivery, the opposite of what you want.',
        'An outer join would also work for the orders, but it keeps unmatched rows from the right side too, which you said you do not need.'
      ]
    },
    {
      type: 'explain',
      title: 'Always count the rows before and after',
      body: `<p>A join can go wrong in two silent ways, and neither produces an error:</p>
<ul>
<li><b>Rows disappear</b>, because an inner join drops rows with no partner.</li>
<li><b>Rows multiply</b>, because a key that appears twice on the right side makes each left row match twice. This is called a <b>row explosion</b>. Revenue totals double, and nobody notices.</li>
</ul>
<p>Three habits protect you:</p>
<ol>
<li><b>Count the rows before and after</b> with <code>len(...)</code>. If you expected the same number and got more or fewer, stop and find out why.</li>
<li><b>Name the relationship you expect</b> with <code>validate=</code>. <code>validate="many_to_one"</code> says: “each left row should match at most one right row, and the right key should be unique”. If that is not true, Pandas raises an error instead of quietly multiplying rows. The other values are <code>"one_to_one"</code>, <code>"one_to_many"</code> and <code>"many_to_many"</code>.</li>
<li><b>Ask the join to explain itself</b> with <code>indicator=True</code>. It adds a column called <code>_merge</code> that says, for every row, whether it was found in <code>both</code> tables, <code>left_only</code> or <code>right_only</code>.</li>
</ol>
<p>Let’s use the indicator on a real question. In lesson 3.5 you learned that 500 orders have no delivery record. Which join shows that?</p>`
    },
    {
      type: 'try',
      title: 'Orders and deliveries: who is missing?',
      body: `<p>First the counts. There are <b>10000</b> orders. The inner join gives only <b>9500</b> rows, so 500 orders were silently dropped. The left join gives <b>10000</b>: every order is still there, and the 500 without a delivery have empty delivery columns.</p>
<p>The indicator proves it: <b>both 9500</b>, <b>left_only 500</b>, <b>right_only 0</b>. No delivery points to a missing order (the right_only count is zero), but 500 orders have no delivery. The last table asks what status those 500 orders have, and the answer is <b>Cancelled</b>, all 500 of them. A cancelled order never needs a delivery, so the gap is the truth, not an error. You found this in lesson 3.5 with <code>isin</code>. A left join with an indicator gives the same answer, and it also brings the delivery columns in.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")
deliveries = pd.read_csv("deliveries.csv")

inner = orders.merge(deliveries, on="order_id")
left = orders.merge(deliveries, on="order_id", how="left")
print(len(orders), len(inner), len(left))

check = orders.merge(deliveries[["order_id", "delivery_status"]], on="order_id", how="left", indicator=True)
print(check["_merge"].value_counts())

no_delivery = check[check["_merge"] == "left_only"]
print(no_delivery["order_status"].value_counts())`
    },
    {
      id: 'py-4-5-ex1',
      type: 'exercise',
      title: 'Your turn: customers who never ordered, found with a join',
      body: `<p>Load <code>customers.csv</code> and <code>orders.csv</code>. Do a <b>left join</b> with customers on the left and orders on the right, on <code>customer_id</code>, with <code>indicator=True</code>. Print two numbers, each on its own line: the number of rows in the result, then the number of rows whose <code>_merge</code> value is <code>"left_only"</code>. You should see <code>10018</code> and then <code>18</code>.</p>
<p><b>Think before you type:</b> a customer with three orders appears three times in the result, once per order. A customer with no orders appears exactly once, with empty order columns. That is why the total is 10000 orders plus 18 lonely customers.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `joined = customers.merge(orders, on="customer_id", how="left", indicator=True). Then print(len(joined)) and print((joined["_merge"] == "left_only").sum()).`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\njoined = customers.merge(orders, on="customer_id", how="left", indicator=True)\nprint(len(joined))\nprint((joined["_merge"] == "left_only").sum())`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\njoined = customers.merge(orders, on="customer_id", how="left", indicator=True)\nprint(len(joined))\nprint((joined["_merge"] == "left_only").sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Different key names, clashing columns, and bringing only what you need',
      body: `<p>Three practical details come up in almost every real join.</p>
<p><b>Keys with different names.</b> If the key is called <code>cust_id</code> on the left and <code>customer_id</code> on the right, use <code>left_on="cust_id", right_on="customer_id"</code> instead of <code>on</code>. You will see this constantly in company data.</p>
<p><b>Columns with the same name.</b> Suppose both tables have a column called <code>unit_price</code>. Pandas cannot keep two columns with one name, so it adds endings to tell them apart. You choose the endings with <code>suffixes=("_line", "_list")</code>, so the result has <code>unit_price_line</code> and <code>unit_price_list</code>. Choose names that tell the reader where each came from.</p>
<p><b>Bring only the columns you need.</b> Before joining, pick the columns from the right table with double brackets: <code>products[["product_id", "category"]]</code>. The key must be one of them. This keeps the result tidy and avoids clashes.</p>
<p>The order lines table has a <code>unit_price</code>, the price charged on that line. The products table also has a <code>unit_price</code>, the list price. A good analyst asks: <i>are they the same?</i> A join lets you check.</p>`
    },
    {
      type: 'try',
      title: 'Line price versus list price',
      body: `<p>The merged table has both prices side by side, with the endings we asked for: <code>unit_price_line</code> and <code>unit_price_list</code>. The row count stays at <b>25000</b>, so no row was lost or doubled.</p>
<p>The last line compares the two columns row by row and asks whether <b>all</b> of them agree. The answer is <b>True</b>: every order line was charged exactly the list price. That is a useful discovery. It means there are no discounts in this data, and that revenue per line is simply quantity times list price. It is the kind of fact you only learn by joining and comparing.</p>`,
      code: `import pandas as pd

order_items = pd.read_csv("order_items.csv")
products = pd.read_csv("products.csv")

order_items["line_total"] = order_items["quantity"] * order_items["unit_price"]

both = order_items.merge(
    products[["product_id", "category", "unit_price"]],
    on="product_id",
    suffixes=("_line", "_list")
)

print(both.columns.tolist())
print(len(both))
print((both["unit_price_line"] == both["unit_price_list"]).all())`
    },
    {
      id: 'py-4-5-ex2',
      type: 'exercise',
      title: 'Your turn: how many order lines are Electronics?',
      body: `<p>Load <code>order_items.csv</code> and <code>products.csv</code>. Join the order lines with the <code>product_id</code> and <code>category</code> columns of the products table. Print how many order lines belong to the category <code>"Electronics"</code>. You should see <code>5107</code>.</p>
<p><b>Think before you type:</b> three steps in order: pick the two product columns with double brackets, merge on <code>product_id</code>, then filter with <code>== "Electronics"</code> and count with <code>len</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `merged = order_items.merge(products[["product_id", "category"]], on="product_id"). Then len(merged[merged["category"] == "Electronics"]).`,
        `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\nproducts = pd.read_csv("products.csv")\nmerged = order_items.merge(products[["product_id", "category"]], on="product_id")\nprint(len(merged[merged["category"] == "Electronics"]))`
      ],
      solution: `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\nproducts = pd.read_csv("products.csv")\nmerged = order_items.merge(products[["product_id", "category"]], on="product_id")\nprint(len(merged[merged["category"] == "Electronics"]))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Join, then group: the answer to the CEO',
      body: `<p>Now every order line knows its category, and you already own the tool for the last step. The recipe is the one from lesson 4.4, with a join in front:</p>
<ol>
<li><b>Join</b> the order lines to the products, to attach the category.</li>
<li><b>Group</b> by category and add up the line totals.</li>
<li><b>Sort</b>, and express each category as a share of the whole.</li>
</ol>
<p>We will also compute each category’s share of the <i>number of lines</i>, because comparing the share of revenue with the share of lines tells you whether a category is big because it sells <i>more</i>, or because it sells <i>dearer</i>.</p>`
    },
    {
      type: 'try',
      title: 'Which category earns the most money?',
      body: `<p>Here is the answer to the question that started the module. <b>Electronics earns 608285244.56, which is 38.45 percent of all revenue.</b> Home &amp; Kitchen is second with 22.09 percent, Fashion third with 21.11, then Beauty &amp; Health with 11.25 and Books &amp; Stationery with 7.1.</p>
<p>Now look at the third column. Electronics is only <b>20.43</b> percent of the order lines. The five categories each have about a fifth of the lines, because there are 30 products in each. So Electronics does not sell more lines. Each line is worth more.</p>
<p>The code builds the summary table by putting three columns together. Because all three share the same labels (the category names), Pandas lines them up automatically.</p>`,
      code: `import pandas as pd

order_items = pd.read_csv("order_items.csv")
products = pd.read_csv("products.csv")

order_items["line_total"] = order_items["quantity"] * order_items["unit_price"]
with_category = order_items.merge(products[["product_id", "category"]], on="product_id", validate="many_to_one")

revenue = with_category.groupby("category")["line_total"].sum().sort_values(ascending=False)
lines = with_category.groupby("category").size()

summary = pd.DataFrame({
    "revenue": revenue.round(2),
    "revenue_share": (revenue / revenue.sum() * 100).round(2),
    "lines_share": (lines / lines.sum() * 100).round(2)
})
print(summary)`
    },
    {
      id: 'py-4-5-ex3',
      type: 'exercise',
      title: 'Your turn: Electronics’ share of revenue',
      body: `<p>Load <code>order_items.csv</code> and <code>products.csv</code>. Create <code>line_total</code>, join the category onto the order lines, and print Electronics’ <b>percentage of total revenue</b>, rounded to 2 decimals. You should see <code>38.45</code>.</p>
<p><b>Think before you type:</b> join, then <code>groupby("category")["line_total"].sum()</code>. Pick <code>["Electronics"]</code> from the result, divide by the sum of all categories, multiply by 100, and round.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `revenue = merged.groupby("category")["line_total"].sum(). Then revenue["Electronics"] / revenue.sum() * 100, inside round(..., 2).`,
        `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\nproducts = pd.read_csv("products.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\nmerged = order_items.merge(products[["product_id", "category"]], on="product_id")\nrevenue = merged.groupby("category")["line_total"].sum()\nprint(round(revenue["Electronics"] / revenue.sum() * 100, 2))`
      ],
      solution: `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\nproducts = pd.read_csv("products.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\nmerged = order_items.merge(products[["product_id", "category"]], on="product_id")\nrevenue = merged.groupby("category")["line_total"].sum()\nprint(round(revenue["Electronics"] / revenue.sum() * 100, 2))`,
      ordered: true
    },
    {
      id: 'py-4-5-c2',
      type: 'check',
      title: 'Electronics is about 20 percent of the order lines but 38 percent of revenue. What is the best explanation?',
      body: `<p>Remember what you learned about the most expensive products in lesson 4.3.</p>`,
      options: [
        'Electronics customers buy many more items per order',
        'Electronics products cost much more per unit, so each line is worth more, even though the number of lines is similar to the other categories',
        'The join counted Electronics lines twice',
        'Electronics has more products than the other categories'
      ],
      answer: 1,
      why: [
        'The share of lines is about the same as the other categories, so it is not about the number of lines. And the quantity per line is limited to 1 to 5 everywhere.',
        'Right! The five most expensive products are all Electronics, and the average Electronics line is worth about 119,108, against about 22,157 for Books &amp; Stationery. Revenue depends on lines times value per line, not on lines alone.',
        'The row count after the join is still 25,000, and validate="many_to_one" would have stopped a row explosion. Nothing was counted twice.',
        'Every category has exactly 30 products, so that cannot be the reason.'
      ]
    },
    {
      type: 'explain',
      title: 'Chaining joins, and letting validate protect you',
      body: `<p>Often the table you need is two steps away. To find revenue by <b>country</b>, you need the order lines, then the orders (which know the customer), then the customers (which know the country). That is a <b>chain</b> of joins. Each step uses the result of the one before:</p>
<p><code>step1 = order_items.merge(orders[[...]], on="order_id")</code><br><code>step2 = step1.merge(customers[[...]], on="customer_id")</code></p>
<p>Two rules for chains. <b>Check the row count after every step</b>, so you find a problem at the step that caused it. And use <code>validate="many_to_one"</code> on each step, because every order line belongs to one order and every order to one customer.</p>
<p>First, a demonstration of what <code>validate</code> does when you get the relationship wrong.</p>`
    },
    {
      type: 'try',
      title: 'validate raises its hand',
      body: `<p>We join the order lines to the orders and <i>claim</i> the relationship is <code>one_to_one</code>. That is false: an order has several lines. Pandas refuses, and prints <code>Merge keys are not unique in left dataset; not a one-to-one merge</code>. Without <code>validate</code>, nothing would have warned you.</p>
<p>The second join states the true relationship, <code>many_to_one</code> (many lines, one order), and it succeeds. The result has <b>25000</b> rows and <b>9</b> columns: the five from the lines, plus the four new ones from the orders (the key, <code>order_id</code>, is shared, so it appears only once).</p>
<p>Think of <code>validate</code> as a seat belt. You hope never to need it, and it costs you one short argument.</p>`,
      code: `import pandas as pd

order_items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv")

try:
    order_items.merge(orders, on="order_id", validate="one_to_one")
except pd.errors.MergeError as error:
    print("Error:", error)

ok = order_items.merge(orders, on="order_id", validate="many_to_one")
print(ok.shape)`
    },
    {
      type: 'try',
      title: 'Revenue by country: a chain of two joins',
      body: `<p>The row counts are the first thing to read: <b>25000, 25000, 25000</b>. Each join added columns and kept every line, exactly as it should.</p>
<p>Then the revenue by country, biggest first: <b>Rwanda</b> 349562175.01, <b>Nigeria</b> 319679132.70, <b>Ghana</b> 318756463.94, <b>Kenya</b> 304761370.12 and <b>South Africa</b> 289222308.73. The five countries are within about 20 percent of each other. Rwanda leads, and it is also the country with the most customers (438, from lesson 4.4).</p>`,
      code: `import pandas as pd

order_items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv")
customers = pd.read_csv("customers.csv")

order_items["line_total"] = order_items["quantity"] * order_items["unit_price"]

step1 = order_items.merge(orders[["order_id", "customer_id", "order_status"]], on="order_id", validate="many_to_one")
step2 = step1.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")

print(len(order_items), len(step1), len(step2))
print(step2.groupby("country")["line_total"].sum().sort_values(ascending=False).round(2))`
    },
    {
      id: 'py-4-5-ex4',
      type: 'exercise',
      title: 'Your turn: Rwanda’s revenue',
      body: `<p>Load <code>order_items.csv</code>, <code>orders.csv</code> and <code>customers.csv</code>. Create <code>line_total</code>, join the lines to the orders and then to the customers, and print the <b>total revenue of the customers in Rwanda</b>, rounded to 2 decimals. You should see <code>349562175.01</code>.</p>
<p><b>Think before you type:</b> two merges in a chain, as in the example. Then keep the Rwanda rows with a filter and add up their <code>line_total</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `step1 = order_items.merge(orders[["order_id", "customer_id"]], on="order_id"). step2 = step1.merge(customers[["customer_id", "country"]], on="customer_id"). Then filter country == "Rwanda" and sum line_total.`,
        `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\norders = pd.read_csv("orders.csv")\ncustomers = pd.read_csv("customers.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\nstep1 = order_items.merge(orders[["order_id", "customer_id"]], on="order_id")\nstep2 = step1.merge(customers[["customer_id", "country"]], on="customer_id")\nrwanda = step2[step2["country"] == "Rwanda"]\nprint(round(rwanda["line_total"].sum(), 2))`
      ],
      solution: `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\norders = pd.read_csv("orders.csv")\ncustomers = pd.read_csv("customers.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\nstep1 = order_items.merge(orders[["order_id", "customer_id"]], on="order_id")\nstep2 = step1.merge(customers[["customer_id", "country"]], on="customer_id")\nrwanda = step2[step2["country"] == "Rwanda"]\nprint(round(rwanda["line_total"].sum(), 2))`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Orders and payments: money on cancelled orders',
      body: `<p>Joining orders to payments gives <b>10000</b> rows: one payment per order. Now the grid of order status against payment status. Read the Cancelled row: <b>460</b> of the 529 cancelled orders have a payment with the status <b>Paid</b>.</p>
<p>The last two lines add up the money: <b>460</b> payments worth <b>73115708.55</b>. That is real money that customers paid for orders that were then cancelled. It may already have been refunded through another system, or it may still be owed back. Either way, the finance director needs to see it.</p>
<p>This is the kind of discovery that justifies the whole module. No single table showed it. It appeared only when two tables were joined and grouped.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")
payments = pd.read_csv("payments.csv")

merged = orders.merge(payments, on="order_id", validate="one_to_one")
print(merged.shape)

grid = merged.groupby(["order_status", "payment_status"]).size().unstack()
print(grid)

cancelled_paid = merged[(merged["order_status"] == "Cancelled") & (merged["payment_status"] == "Paid")]
print(len(cancelled_paid), round(cancelled_paid["amount"].sum(), 2))`
    },
    {
      id: 'py-4-5-ex5',
      type: 'exercise',
      title: 'Challenge: money on returned orders',
      body: `<p>Do the same check for <b>Returned</b> orders. Load <code>orders.csv</code> and <code>payments.csv</code>, join them on <code>order_id</code>, and keep the rows whose <code>order_status</code> is <code>"Returned"</code> and whose <code>payment_status</code> is <code>"Paid"</code>. Print two numbers, each on its own line: how many there are, then the total <code>amount</code>, rounded to 2 decimals. You should see <code>437</code> and then <code>68404501.3</code>.</p>
<p><b>Think before you type:</b> merge, then filter with two conditions joined by <code>&amp;</code>, each in brackets. Then <code>len(...)</code> and <code>round(...sum(), 2)</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `merged = orders.merge(payments, on="order_id"). Then rows = merged[(merged["order_status"] == "Returned") & (merged["payment_status"] == "Paid")]. Print len(rows) and round(rows["amount"].sum(), 2).`,
        `import pandas as pd\norders = pd.read_csv("orders.csv")\npayments = pd.read_csv("payments.csv")\nmerged = orders.merge(payments, on="order_id")\nrows = merged[(merged["order_status"] == "Returned") & (merged["payment_status"] == "Paid")]\nprint(len(rows))\nprint(round(rows["amount"].sum(), 2))`
      ],
      solution: `import pandas as pd\norders = pd.read_csv("orders.csv")\npayments = pd.read_csv("payments.csv")\nmerged = orders.merge(payments, on="order_id")\nrows = merged[(merged["order_status"] == "Returned") & (merged["payment_status"] == "Paid")]\nprint(len(rows))\nprint(round(rows["amount"].sum(), 2))`,
      ordered: true
    },
    {
      id: 'py-4-5-c3',
      type: 'check',
      title: 'The join shows 460 Cancelled orders with a Paid payment, worth about 73 million. What do you do?',
      body: `<p>Think about what the data can and cannot tell you.</p>`,
      options: [
        'Delete those payments, because cancelled orders cannot be paid',
        'Report it to the finance director as a finding, with the count and total, and ask whether these payments were refunded elsewhere or are still owed back',
        'Ignore it, because the order status is what counts',
        'Change the payment status of those rows to Refunded'
      ],
      answer: 1,
      why: [
        'Deleting payments would erase real money from the records. The payment may well have happened.',
        'Exactly. You do not know whether the refund was made in another system. You size the issue, show the evidence, and let the owner of the process decide.',
        'It matters: if customers paid for orders they never received, the company may owe them money, and revenue may be overstated.',
        'You would be inventing a refund that nobody confirmed. Never edit data to make a problem disappear.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>Step five is done, and the CEO has her answer: <b>Electronics earns the most, about 38 percent of revenue from about 20 percent of the lines</b>. You can:</p>
<ul>
<li>Explain why data is split into tables joined by <b>keys</b>, and write <code>left.merge(right, on="key")</code></li>
<li>Choose between <b>inner, left, right and outer</b> joins, and default to a left join with your main table on the left</li>
<li><b>Check every join</b>: count rows before and after, use <code>validate=</code> to name the relationship, and <code>indicator=True</code> to see who matched</li>
<li>Handle <b>different key names</b> with <code>left_on</code> and <code>right_on</code>, <b>clashing columns</b> with <code>suffixes</code>, and bring only the columns you need</li>
<li>Build <b>chains</b> of joins and then group, to answer questions that cross three tables</li>
<li>Find problems that only appear <i>between</i> tables, like money paid on cancelled orders</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is the difference between an inner join and a left join?</li>
<li>How do you make sure a join has not duplicated or dropped rows?</li>
<li>What is a row explosion, and how do you prevent it?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> An inner join keeps only rows that have a match in both tables. A left join keeps every row of the left table and fills the right table’s columns with missing values where there is no match. I usually put my main table on the left and use a left join, so that no rows of the table I care about disappear.</p>
<p><b>2.</b> I compare the row counts before and after the join. I pass <code>validate</code>, for example <code>many_to_one</code>, so that Pandas raises an error if the keys are not unique on the side I expect. And I use <code>indicator=True</code> to see how many rows matched on both sides, only on the left, or only on the right.</p>
<p><b>3.</b> A row explosion happens when the key is not unique on the right side, so each left row matches several right rows and the result has more rows than before. Totals then come out too high. I prevent it by checking that the right key is unique, by using <code>validate</code>, and by checking the row count and a known total after every join.</p>
</details>
<p><b>Coming next, in lesson 4.6:</b> the last lesson of the module. You will learn to recode values with <code>map</code>, build your own columns with <code>apply</code> and with bands, and then assemble everything into the <b>master table</b>: one wide table where every order line carries its product, its customer and its order. You will compare gross and net revenue, check that Electronics still wins when the definition changes, and settle the CEO’s question about 2026 properly, with like-for-like numbers.</p>`
    }
  ]
},
{
  id: 'py-4-6',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: '',
  title: '4.6 Mapping, bands and the master table',
  tables: [],
  intro: `You told the CEO that Electronics earns the most. She nods, and then, as CEOs do, she adds three requests. <i>“Can you group the countries into regions? Can you split the products into cheap, medium and premium? And can you give the whole team one table to work from, instead of five?”</i><br><br>These are the last jobs of a transformation project, and each one has a Pandas tool. <b>Recoding</b> values, like country to region, is done with <code>map</code>. <b>Bands</b>, like cheap, medium and premium, are done with <code>apply</code> or <code>cut</code>. And the shared table, with everything joined and calculated in one place, is called the <b>master table</b>. Every later module in this track, from NumPy to charts, will start from it.<br><br>Then comes the payoff of the whole module. With the master table in hand, you will check that Electronics still wins when “revenue” is defined differently, and you will settle the CEO’s worry about 2026 with numbers that compare like with like.`,
  steps: [
    {
      type: 'explain',
      title: 'map: translate values with a dictionary',
      body: `<p>Sometimes the values in a column are right but not in the form you need. TradeFlow has five countries, but the leadership team plans by <b>region</b>: Nigeria and Ghana are West Africa, Kenya and Rwanda are East Africa, South Africa is Southern Africa. You need a new column with the region.</p>
<p>The tool is <code>.map()</code>, and what you give it is a <b>dictionary</b> from Module 1: a list of pairs, “this value becomes that value”. Pandas looks at every value in the column, finds it in the dictionary, and writes down the translation.</p>
<div class="callout analogy"><b>It is a phrasebook.</b> You hand a traveller a list of phrases and their translations, and for every word they hear they look it up. If a word is not in the phrasebook, they cannot translate it, and <code>map</code> does the same: it leaves a <b>missing value</b> (NaN). It never guesses.</div>
<p>You met <code>.map()</code> in lesson 3.5, when you used a lookup column to bring dates across. A dictionary works the same way, as a lookup you write by hand. Let’s see a small run, including a country the phrasebook does not know.</p>`
    },
    {
      type: 'try',
      title: 'A phrasebook for countries',
      body: `<p>Ghana becomes West Africa, Kenya becomes East Africa and Nigeria becomes West Africa. The fourth country, <b>Egypt</b>, is not in the dictionary, so its translation is <code>nan</code>, a missing value.</p>
<p>That behaviour is a feature. If someone adds a sixth country to the data next year and forgets to update the dictionary, the new rows will show up as missing instead of being quietly placed in the wrong region. A good habit: after a <code>map</code>, count the missing values. If the count is not zero, your dictionary has a gap.</p>`,
      code: `import pandas as pd

countries = pd.Series(["Ghana", "Kenya", "Nigeria", "Egypt"])

region = {
    "Nigeria": "West Africa",
    "Ghana": "West Africa",
    "Kenya": "East Africa",
    "Rwanda": "East Africa",
    "South Africa": "Southern Africa"
}

print(countries.map(region).tolist())`
    },
    {
      type: 'explain',
      title: 'apply: run your own function on every value',
      body: `<p>A dictionary translates exact values. But what about a <b>rule</b>? “If the price is up to 10,000 it is Budget, up to 40,000 it is Mid, otherwise Premium.” That is not a list of pairs. It is a decision, and you wrote decisions in Module 1: a <b>function</b> with <code>if</code>, <code>elif</code> and <code>else</code>.</p>
<p><code>.apply(function)</code> takes a column, feeds <b>each value, one at a time,</b> into your function, and collects the answers into a new column. Notice that you pass the function’s name <b>without brackets</b>: <code>.apply(price_band)</code>, not <code>.apply(price_band())</code>. You are handing Pandas the function to use, not calling it yourself.</p>
<p>A word of caution. <code>apply</code> runs your Python function once per row, so on a very large table it is slow, and it is easy to overuse. Use it for rules that are genuinely too complicated for anything simpler. If the job is arithmetic, such as quantity times price, use column arithmetic (lesson 4.1). If the job is bands from numbers, there is a shorter tool, which we meet next.</p>`
    },
    {
      type: 'try',
      title: 'Cheap, medium and premium products',
      body: `<p>The function <code>price_band</code> is exactly the kind you wrote in Module 1, and <code>apply</code> runs it on each of the 150 product prices. The counts are <b>Mid 77</b>, <b>Budget 52</b> and <b>Premium 21</b>.</p>
<p>The second table crosses the band with the category, using the grid trick from lesson 4.4. Look at the Premium column: <b>15</b> of the 21 premium products are Electronics, the other 6 are Home &amp; Kitchen, and Fashion, Beauty &amp; Health and Books &amp; Stationery have none. This is the reason Electronics wins on revenue: it owns most of the premium shelf. The <code>fillna(0)</code> fills the empty cells with zero, and <code>astype(int)</code> turns the counts back into whole numbers.</p>`,
      code: `import pandas as pd

products = pd.read_csv("products.csv")

def price_band(price):
    if price <= 10000:
        return "Budget"
    elif price <= 40000:
        return "Mid"
    else:
        return "Premium"

products["band"] = products["unit_price"].apply(price_band)

print(products["band"].value_counts())
print(products.groupby(["category", "band"]).size().unstack().fillna(0).astype(int))`
    },
    {
      id: 'py-4-6-ex1',
      type: 'exercise',
      title: 'Your turn: how many customers are in East Africa?',
      body: `<p>The dictionary <code>region</code> is already in the box. Use <code>map</code> to create a column <code>region_group</code> on the customers table, and print how many customers are in <b>East Africa</b>. You should see <code>831</code> (Kenya 393 plus Rwanda 438).</p>
<p><b>Think before you type:</b> <code>customers["country"].map(region)</code> gives the regions. Store them in a new column, then compare the column with <code>== "East Africa"</code> and count with <code>.sum()</code>.</p>`,
      starter: `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\n\nregion = {\n    "Nigeria": "West Africa",\n    "Ghana": "West Africa",\n    "Kenya": "East Africa",\n    "Rwanda": "East Africa",\n    "South Africa": "Southern Africa"\n}\n\n# Write your code below\n`,
      hints: [
        `customers["region_group"] = customers["country"].map(region). Then (customers["region_group"] == "East Africa").sum().`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nregion = {"Nigeria": "West Africa", "Ghana": "West Africa", "Kenya": "East Africa", "Rwanda": "East Africa", "South Africa": "Southern Africa"}\ncustomers["region_group"] = customers["country"].map(region)\nprint((customers["region_group"] == "East Africa").sum())`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nregion = {"Nigeria": "West Africa", "Ghana": "West Africa", "Kenya": "East Africa", "Rwanda": "East Africa", "South Africa": "Southern Africa"}\ncustomers["region_group"] = customers["country"].map(region)\nprint((customers["region_group"] == "East Africa").sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'pd.cut: bands in one line',
      body: `<p>When the rule is simply “which range does this number fall in?”, you do not need a function. <code>pd.cut</code> cuts a number column into ranges, and gives each range a label:</p>
<p><code>pd.cut(values, bins=[0, 10000, 40000, float("inf")], labels=["Budget", "Mid", "Premium"])</code></p>
<ul>
<li><code>bins</code> is the list of <b>edges</b>. Three ranges need four edges. <code>float("inf")</code> means “no upper limit”.</li>
<li><code>labels</code> is the list of names, one per range, so one fewer than the edges.</li>
<li>Each range includes its <b>upper</b> edge and excludes its lower one. A price of exactly 10000 is Budget, and 10000.01 is Mid. That is the same rule as <code>price &lt;= 10000</code> in our function.</li>
</ul>
<p>The result is a special kind of column with a built-in order, Budget then Mid then Premium. So <code>value_counts().sort_index()</code> lists the bands in their natural order, not alphabetically.</p>
<p>The function and <code>cut</code> should agree. When two methods give the same answer, you can trust both. Let’s check.</p>`
    },
    {
      type: 'try',
      title: 'Two methods, one answer',
      body: `<p>The table shows the three bands in their natural order: <b>Budget 52</b>, <b>Mid 77</b>, <b>Premium 21</b>. The numbers are the same as with <code>apply</code>.</p>
<p>The last line settles it. It converts the <code>cut</code> result to plain text with <code>.astype(str)</code>, compares it with the <code>apply</code> result row by row, and asks whether <b>all</b> 150 agree. The answer is <b>True</b>. Two completely different methods, one answer, which is a very good sign. The <code>cut</code> version is shorter and faster, so use it for number ranges. Keep <code>apply</code> for rules that <code>cut</code> cannot express.</p>`,
      code: `import pandas as pd

products = pd.read_csv("products.csv")

def price_band(price):
    if price <= 10000:
        return "Budget"
    elif price <= 40000:
        return "Mid"
    else:
        return "Premium"

products["band"] = products["unit_price"].apply(price_band)

products["band_cut"] = pd.cut(
    products["unit_price"],
    bins=[0, 10000, 40000, float("inf")],
    labels=["Budget", "Mid", "Premium"]
)

print(products["band_cut"].value_counts().sort_index())
print((products["band"] == products["band_cut"].astype(str)).all())`
    },
    {
      id: 'py-4-6-ex2',
      type: 'exercise',
      title: 'Your turn: how many large payments?',
      body: `<p>Load <code>payments.csv</code>. Use <code>pd.cut</code> to split <code>amount</code> into three bands with the edges <code>0</code>, <code>100000</code>, <code>300000</code> and <code>float("inf")</code>, labelled <code>"Small"</code>, <code>"Medium"</code> and <code>"Large"</code>. Print how many payments are <b>Large</b>. You should see <code>1199</code>.</p>
<p><b>Think before you type:</b> store the <code>pd.cut(...)</code> result in a jar, compare it with <code>== "Large"</code>, and count with <code>.sum()</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `size = pd.cut(payments["amount"], bins=[0, 100000, 300000, float("inf")], labels=["Small", "Medium", "Large"]). Then (size == "Large").sum().`,
        `import pandas as pd\npayments = pd.read_csv("payments.csv")\nsize = pd.cut(payments["amount"], bins=[0, 100000, 300000, float("inf")], labels=["Small", "Medium", "Large"])\nprint((size == "Large").sum())`
      ],
      solution: `import pandas as pd\npayments = pd.read_csv("payments.csv")\nsize = pd.cut(payments["amount"], bins=[0, 100000, 300000, float("inf")], labels=["Small", "Medium", "Large"])\nprint((size == "Large").sum())`,
      ordered: true
    },
    {
      id: 'py-4-6-c1',
      type: 'check',
      title: 'You need the revenue of each of the 25,000 order lines: quantity times unit_price. Which tool is best?',
      body: `<p>Choose the simplest tool that does the job.</p>`,
      options: [
        'order_items.apply(a function that multiplies the two values, axis=1)',
        'order_items["quantity"] * order_items["unit_price"]',
        'order_items["quantity"].map(a dictionary of prices)',
        'pd.cut on the quantity column'
      ],
      answer: 1,
      why: [
        'This works, but it runs Python once for every row and is much slower and longer than it needs to be. Use apply only when nothing simpler fits.',
        'Yes! Arithmetic on whole columns is the simplest and fastest tool for arithmetic. Use map for translating exact values, cut for ranges, and apply for rules too complex for those.',
        'A dictionary translates exact values into other values. It cannot multiply two columns.',
        'cut divides a number into ranges. It does not multiply anything.'
      ]
    },
    {
      type: 'explain',
      title: 'The master table: one table the whole team can use',
      body: `<p>Everything in this module has been a step towards one thing: a single, wide, trustworthy table. Here is the idea.</p>
<p>Every question the CEO asks is about <b>order lines</b>, seen from some angle: by category, by country, by year, by status. Those angles live in four different tables. If every analyst joins them again for every question, somebody will eventually join them wrongly. So you do it <b>once, carefully</b>, and share the result. That is the <b>master table</b>. Its grain, in the language of lesson 3.3, is <b>one row per order line</b>, with everything we know about that line attached:</p>
<ul>
<li>from the <b>order lines</b>: the quantity and price</li>
<li>from <b>products</b>: the product name and category</li>
<li>from <b>orders</b>: the customer, the date and the status</li>
<li>from <b>customers</b>: the country</li>
<li>calculated: the <b>line total</b> and the <b>year</b></li>
</ul>
<p>Three rules make a master table trustworthy, and you have learned all three:</p>
<ol>
<li><b>Left to right, many to one.</b> Start from the order lines and join each other table with <code>validate="many_to_one"</code>, so nothing can multiply.</li>
<li><b>The row count must not change.</b> There are 25,000 lines going in, so there must be 25,000 coming out.</li>
<li><b>Reconcile.</b> The revenue of the master table must equal the revenue you started with, <b>1581981450.5</b>.</li>
</ol>
<p>And the repeated lines you protected in lesson 3.3? They stay. All 25,000 are real purchases.</p>`
    },
    {
      type: 'try',
      title: 'Building the master table',
      body: `<p>Three joins and three calculated columns, then the checks. The shape is <b>(25000, 13)</b>: 25,000 rows, as promised, and 13 columns, listed on the next line. There are <b>0 missing values</b>, which means every order line found its product, its order and its customer. The revenue is <b>1581981450.5</b>, the same number you have met since lesson 3.3.</p>
<p>The three checks passed, so this table is safe to share. This is what the YouTube chapters and the later modules of this track call the <b>master table</b>. Notice that it took nothing new: it is lessons 4.1 to 4.5 in one place.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
products = pd.read_csv("products.csv")
order_items = pd.read_csv("order_items.csv")

master = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")
master = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")
master = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")

master["line_total"] = master["quantity"] * master["unit_price"]
master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")
master["order_year"] = master["order_date"].dt.year

print(master.shape)
print(master.columns.tolist())
print("Missing values:", master.isnull().sum().sum())
print("Revenue:", round(master["line_total"].sum(), 2))`
    },
    {
      id: 'py-4-6-ex3',
      type: 'exercise',
      title: 'Your turn: revenue of Completed orders',
      body: `<p>The master table is already built for you in the box. Print the <b>total revenue of the order lines whose <code>order_status</code> is <code>"Completed"</code></b>, rounded to 2 decimals. You should see <code>1170549762.97</code>.</p>
<p><b>Think before you type:</b> filter the master table with <code>master[master["order_status"] == "Completed"]</code>, take <code>["line_total"]</code>, then <code>.sum()</code> and <code>round(..., 2)</code>.</p>`,
      starter: `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\nproducts = pd.read_csv("products.csv")\norder_items = pd.read_csv("order_items.csv")\n\nmaster = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")\nmaster = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")\nmaster = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")\nmaster["line_total"] = master["quantity"] * master["unit_price"]\nmaster["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")\nmaster["order_year"] = master["order_date"].dt.year\n\n# Write your code below\n`,
      hints: [
        `completed = master[master["order_status"] == "Completed"]. Then round(completed["line_total"].sum(), 2).`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\nproducts = pd.read_csv("products.csv")\norder_items = pd.read_csv("order_items.csv")\nmaster = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")\nmaster = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")\nmaster = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")\nmaster["line_total"] = master["quantity"] * master["unit_price"]\nmaster["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")\nmaster["order_year"] = master["order_date"].dt.year\ncompleted = master[master["order_status"] == "Completed"]\nprint(round(completed["line_total"].sum(), 2))`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\nproducts = pd.read_csv("products.csv")\norder_items = pd.read_csv("order_items.csv")\nmaster = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")\nmaster = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")\nmaster = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")\nmaster["line_total"] = master["quantity"] * master["unit_price"]\nmaster["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")\nmaster["order_year"] = master["order_date"].dt.year\ncompleted = master[master["order_status"] == "Completed"]\nprint(round(completed["line_total"].sum(), 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Gross and net, and the habit of testing your own answer',
      body: `<p>Back to the finance director’s question from lesson 4.2: what counts as revenue? With the master table, you can define two versions in a line each:</p>
<ul>
<li><b>Gross revenue</b>: every order line ever placed, whatever happened to it. It is the 1581981450.5 you know.</li>
<li><b>Net revenue</b>: only orders that stand, meaning <b>Completed</b> and <b>Processing</b>. Cancelled orders were never delivered, and Returned orders came back, so neither is a sale you keep.</li>
</ul>
<p>The gap between the two is the money lost to cancellations and returns. And now comes a habit that separates a careful analyst from a hopeful one. You told the CEO that Electronics earns the most, using <b>gross</b> revenue. A sharp finance director will ask: <i>“Does that still hold if we use net?”</i> Do not wait to be asked. <b>Test your own answer</b> against the other definition. If the answer survives, you can state it with confidence. If it flips, you have found something important to tell her.</p>`
    },
    {
      type: 'try',
      title: 'Four statuses, two definitions, one winner',
      body: `<p>The first table splits the 1.58 billion by order status: <b>Completed</b> 1170549762.97, <b>Processing</b> 249310290.35, <b>Cancelled</b> 83239833.11 and <b>Returned</b> 78881564.07. Adding Completed and Processing gives the net revenue: <b>1419860053.32</b>. The gap to gross is about 162 million, the cancelled and returned lines.</p>
<p>The last two tables rank the categories under each definition. Under <b>gross</b>, Electronics earns 608285244.56. Under <b>net</b>, Electronics earns 548078957.04. The five categories appear in <b>exactly the same order</b> both times: Electronics, Home &amp; Kitchen, Fashion, Beauty &amp; Health, Books &amp; Stationery. Electronics even keeps its share of revenue: about 38.6 percent of net, against 38.45 percent of gross.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
products = pd.read_csv("products.csv")
order_items = pd.read_csv("order_items.csv")

master = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")
master = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")
master = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
master["line_total"] = master["quantity"] * master["unit_price"]
master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")
master["order_year"] = master["order_date"].dt.year

print(master.groupby("order_status")["line_total"].sum().round(2))

net = master[master["order_status"].isin(["Completed", "Processing"])]
print(round(net["line_total"].sum(), 2))

gross_rank = master.groupby("category")["line_total"].sum().sort_values(ascending=False).round(2)
net_rank = net.groupby("category")["line_total"].sum().sort_values(ascending=False).round(2)
print(gross_rank)
print(net_rank)`
    },
    {
      id: 'py-4-6-ex4',
      type: 'exercise',
      title: 'Your turn: Electronics, net of cancellations and returns',
      body: `<p>The master table is built for you in the box. Keep only the lines whose <code>order_status</code> is <code>"Completed"</code> or <code>"Processing"</code> and whose <code>category</code> is <code>"Electronics"</code>. Print their total <code>line_total</code>, rounded to 2 decimals. You should see <code>548078957.04</code>.</p>
<p><b>Think before you type:</b> use <code>.isin(["Completed", "Processing"])</code> for the status, <code>== "Electronics"</code> for the category, join the two conditions with <code>&amp;</code>, each in brackets, then sum.</p>`,
      starter: `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\nproducts = pd.read_csv("products.csv")\norder_items = pd.read_csv("order_items.csv")\n\nmaster = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")\nmaster = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")\nmaster = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")\nmaster["line_total"] = master["quantity"] * master["unit_price"]\nmaster["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")\nmaster["order_year"] = master["order_date"].dt.year\n\n# Write your code below\n`,
      hints: [
        `rows = master[(master["order_status"].isin(["Completed", "Processing"])) & (master["category"] == "Electronics")]. Then round(rows["line_total"].sum(), 2).`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\nproducts = pd.read_csv("products.csv")\norder_items = pd.read_csv("order_items.csv")\nmaster = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")\nmaster = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")\nmaster = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")\nmaster["line_total"] = master["quantity"] * master["unit_price"]\nmaster["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")\nmaster["order_year"] = master["order_date"].dt.year\nrows = master[(master["order_status"].isin(["Completed", "Processing"])) & (master["category"] == "Electronics")]\nprint(round(rows["line_total"].sum(), 2))`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\nproducts = pd.read_csv("products.csv")\norder_items = pd.read_csv("order_items.csv")\nmaster = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")\nmaster = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")\nmaster = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")\nmaster["line_total"] = master["quantity"] * master["unit_price"]\nmaster["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")\nmaster["order_year"] = master["order_date"].dt.year\nrows = master[(master["order_status"].isin(["Completed", "Processing"])) & (master["category"] == "Electronics")]\nprint(round(rows["line_total"].sum(), 2))`,
      ordered: true
    },
    {
      id: 'py-4-6-c2',
      type: 'check',
      title: 'Electronics ranks first under both the gross and the net definition of revenue. What does that tell you?',
      body: `<p>Think about how much weight your conclusion can bear.</p>`,
      options: [
        'Nothing: the two numbers are different, so the ranking is meaningless',
        'The conclusion “Electronics earns the most” does not depend on which definition is used, so you can state it with confidence, while still giving the exact figure and its definition',
        'You no longer need to say which definition you used',
        'Gross and net revenue must be the same number'
      ],
      answer: 1,
      why: [
        'The amounts differ, but the order of the categories is the same. A conclusion that survives a change of definition is stronger, not weaker.',
        'Right! Testing your answer against another reasonable definition is how you earn confidence in it. You still report the number together with its definition, as you learned in lesson 4.2.',
        'You always need to say it. The ranking is stable, but the amounts are not the same under the two definitions.',
        'They differ by about 162 million, the value of the cancelled and returned lines.'
      ]
    },
    {
      type: 'explain',
      title: 'Like with like: settling the “business halved” worry',
      body: `<p>In lesson 4.1, the CEO looked at 1,406 orders in 2026 against 2,879 in 2025 and said the business had halved. You told her the data stops on 30 June 2026, so 2026 is only half a year. Now you have the master table, and you can do better than explain. You can <b>show</b> her the fair comparison.</p>
<p>A fair comparison uses <b>the same months</b> in every year: January to June. In the master table that is a single filter on the month of the order date, <code>master["order_date"].dt.month &lt;= 6</code>. Then group by year, add up the revenue, and compare each year with the one before it.</p>
<p>To turn two numbers into a percentage change, use: <code>(new / old - 1) * 100</code>. If this year is 10 percent bigger, <code>new / old</code> is 1.10, minus 1 is 0.10, times 100 is 10 percent.</p>`
    },
    {
      type: 'try',
      title: 'January to June, year by year',
      body: `<p>The table shows the revenue of the first half of each year: <b>2023</b> 226023658.06, <b>2024</b> 230045654.51, <b>2025</b> 235298935.50 and <b>2026</b> 226371814.67. They are all in the same range.</p>
<p>The percentage change from the first half of 2025 to the first half of 2026 is <b>-3.79</b>. The business did not halve. It dipped by less than four percent. The third line shows the full-year comparison that worried the CEO: <b>-50.67</b> percent. That figure compared a whole year with half a year, and it was an illusion created by the calendar.</p>
<p>One comparison, two very different stories. This is why analysts insist on comparing like with like.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
products = pd.read_csv("products.csv")
order_items = pd.read_csv("order_items.csv")

master = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")
master = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")
master = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
master["line_total"] = master["quantity"] * master["unit_price"]
master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")
master["order_year"] = master["order_date"].dt.year

first_half = master[master["order_date"].dt.month <= 6]
h1 = first_half.groupby("order_year")["line_total"].sum()
print(h1.round(2))

print(round((h1[2026] / h1[2025] - 1) * 100, 2))

full = master.groupby("order_year")["line_total"].sum()
print(round((full[2026] / full[2025] - 1) * 100, 2))`
    },
    {
      id: 'py-4-6-ex5',
      type: 'exercise',
      title: 'Challenge: how did the first half of 2025 compare with 2024?',
      body: `<p>The master table is built for you in the box. Using only the lines from <b>January to June</b> of each year, work out the <b>percentage change in revenue from the first half of 2024 to the first half of 2025</b>, rounded to 2 decimals. You should see <code>2.28</code>.</p>
<p><b>Think before you type:</b> filter on <code>master["order_date"].dt.month &lt;= 6</code>, group by <code>order_year</code> and sum <code>line_total</code>. Then apply <code>(new / old - 1) * 100</code> using the 2025 and 2024 values.</p>`,
      starter: `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\nproducts = pd.read_csv("products.csv")\norder_items = pd.read_csv("order_items.csv")\n\nmaster = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")\nmaster = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")\nmaster = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")\nmaster["line_total"] = master["quantity"] * master["unit_price"]\nmaster["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")\nmaster["order_year"] = master["order_date"].dt.year\n\n# Write your code below\n`,
      hints: [
        `h1 = master[master["order_date"].dt.month <= 6].groupby("order_year")["line_total"].sum(). Then round((h1[2025] / h1[2024] - 1) * 100, 2).`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\nproducts = pd.read_csv("products.csv")\norder_items = pd.read_csv("order_items.csv")\nmaster = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")\nmaster = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")\nmaster = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")\nmaster["line_total"] = master["quantity"] * master["unit_price"]\nmaster["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")\nmaster["order_year"] = master["order_date"].dt.year\nh1 = master[master["order_date"].dt.month <= 6].groupby("order_year")["line_total"].sum()\nprint(round((h1[2025] / h1[2024] - 1) * 100, 2))`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\nproducts = pd.read_csv("products.csv")\norder_items = pd.read_csv("order_items.csv")\nmaster = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")\nmaster = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")\nmaster = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")\nmaster["line_total"] = master["quantity"] * master["unit_price"]\nmaster["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")\nmaster["order_year"] = master["order_date"].dt.year\nh1 = master[master["order_date"].dt.month <= 6].groupby("order_year")["line_total"].sum()\nprint(round((h1[2025] / h1[2024] - 1) * 100, 2))`,
      ordered: true
    },
    {
      id: 'py-4-6-c3',
      type: 'check',
      title: 'Why did you compare January to June of 2026 with January to June of 2025, and not 2026 with the whole of 2025?',
      body: `<p>Think about what each comparison measures.</p>`,
      options: [
        'Because the first half of the year always has more orders',
        'Because the data for 2026 stops in June, so only equal periods can be compared fairly',
        'Because Pandas cannot compare a half year with a full year',
        'Because the full-year numbers are wrong'
      ],
      answer: 1,
      why: [
        'Nothing in the data says so. The reason is about the length of the periods, not the season.',
        'Exactly. A fair comparison puts like with like. A whole year against half a year will always look like a collapse, whatever the business is doing.',
        'Pandas can compare any two numbers. The problem is that the comparison would mislead a human reader.',
        'The full-year numbers for 2023 to 2025 are correct. Only 2026 is incomplete.'
      ]
    },
    {
      type: 'explain',
      title: 'Module 4 is complete',
      body: `<div class="callout tip"><b>Look back at where you started.</b> The CEO asked one question: <i>which product category earns the most money?</i> To answer it you calculated revenue for every line (4.1), chose the right rows (4.2), ranked and sorted them (4.3), grouped and totalled them (4.4), and joined them to their categories (4.5). Then you built the master table (4.6), checked your answer against a second definition, and settled the CEO’s “halved” worry with a like-for-like comparison. <b>Electronics earns the most, about 38 percent of revenue from about 20 percent of the lines, and that conclusion holds whether you count gross or net.</b> Along the way you found 73 million of payments on cancelled orders, and a “Delayed” label that does not mean what it seems. That is real analysis.</div>
<p>In this lesson you learned to:</p>
<ul>
<li>Recode values with <code>.map(dictionary)</code> and know that unknown values become missing</li>
<li>Run your own function on every value with <code>.apply(function)</code>, and know when a simpler tool is better</li>
<li>Build ranges with <code>pd.cut</code>, and confirm it against another method</li>
<li>Assemble a <b>master table</b> with validated joins, and check its row count and total</li>
<li>Define <b>gross and net</b> revenue, and test an answer against both definitions</li>
<li>Compare <b>like with like</b>, and turn two numbers into a percentage change</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>When would you use <code>map</code>, <code>apply</code> and <code>cut</code>?</li>
<li>What is a master table, and how do you make sure it is correct?</li>
<li>A manager says sales halved this year. What do you check first?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I use <code>map</code> with a dictionary to translate exact values, such as country to region, and I check for unmapped values, which come out missing. I use <code>pd.cut</code> to turn a number into labelled ranges. I use <code>apply</code> with my own function only when the rule is too complex for those, because it runs once per row and is slower.</p>
<p><b>2.</b> A master table is one wide table at a clear grain, here one row per order line, with every attribute from the other tables already joined on. I build it with validated joins starting from the main table, I check that the row count did not change, I check there are no unexpected missing values, and I reconcile its total against the source before sharing it.</p>
<p><b>3.</b> I check the period covered, because a partial year against a full year will look like a collapse. I compare the same months in each year. I also check that the definition of the measure is the same, such as gross versus net, and whether the data was complete when it was extracted.</p>
</details>
<p><b>Coming next, in Module 5:</b> NumPy, the maths engine under Pandas. You have used Pandas columns as if they were magic. Now you will look underneath, at the arrays that make them fast. You will see why a column calculation beats a loop by a factor of hundreds, learn to filter with masks and choose values with <code>np.where</code>, and work along rows and columns with <code>axis</code>. It is the foundation for the statistics and visualisation modules that follow.</p>`
    }
  ]
}
);
