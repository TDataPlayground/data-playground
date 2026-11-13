LESSONS.push(
{
  id: 'py-6-1',
  track: 'python',
  lang: 'python',
  packages: ['pandas', 'numpy'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: `import pandas as pd
import numpy as np

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
products = pd.read_csv("products.csv")
payments = pd.read_csv("payments.csv")
deliveries = pd.read_csv("deliveries.csv")
order_items = pd.read_csv("order_items.csv")

master = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")
master = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")
master = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
master["line_total"] = master["quantity"] * master["unit_price"]
master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")
master["order_year"] = master["order_date"].dt.year
`,
  preloaded: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items', 'master'],
  title: '6.1 EDA, step by step: the first look and the tie-out',
  tables: [],
  intro: `The CEO sends you an email with a single line: <i>“Before the board meeting, tell me what I should know about our business.”</i> There is no question mark. You forward it to the Head of Data, who smiles. <i>“That is not a question,”</i> he says. <i>“It is an invitation. And there is a proper method for answering invitations like that. It is called <b>exploratory data analysis</b>, or EDA.”</i><br><br>EDA is how analysts meet a dataset they do not yet understand. It is not a clever statistical technique. It is a <b>disciplined way of looking</b>: in a fixed order, writing down every finding with its evidence, and trying to break each finding before you believe it.<br><br>Module 6 teaches that discipline. Everything you have learned so far, from Pandas to NumPy, becomes a tool in the kit. In this first lesson you take the first two steps: the <b>first look</b>, and the <b>tie-out</b>, where you check that the numbers agree with each other before you trust any of them.`,
  steps: [
    {
      type: 'explain',
      title: 'What EDA is, and the eight stops',
      body: `<p>Think of a doctor’s check-up. The doctor does not start with treatment. She takes your history, measures your weight and blood pressure, runs a few tests, and only then forms a view. EDA is the check-up for a dataset. Treatment, whether a forecast, a model or a recommendation, comes afterwards.</p>
<p>The check-up has eight stops, and this module follows them in order:</p>
<table class="mini">
<tr><th>Stop</th><th>The question</th><th>Lesson</th></tr>
<tr><td>1. <b>First look</b></td><td>How big is it, what is in it, what is missing?</td><td>6.1</td></tr>
<tr><td>2. <b>Tie-out</b></td><td>Do the totals agree with each other?</td><td>6.1</td></tr>
<tr><td>3. <b>Distributions</b></td><td>What does each column look like?</td><td>6.2</td></tr>
<tr><td>4. <b>Concentration and segments</b></td><td>Who or what drives the totals?</td><td>6.2</td></tr>
<tr><td>5. <b>Time</b></td><td>What changes over the months and years?</td><td>6.3</td></tr>
<tr><td>6. <b>Relationships</b></td><td>What goes together with what?</td><td>6.3</td></tr>
<tr><td>7. <b>Challenge</b></td><td>Can I break my own findings?</td><td>6.4</td></tr>
<tr><td>8. <b>Report</b></td><td>What did I find, and how sure am I?</td><td>6.4</td></tr>
</table>
<p>Four rules go with the check-up:</p>
<ol>
<li><b>Every finding gets a number and a source.</b> “Sales look strong” is not a finding. “Revenue was 1.58 billion, from the order lines” is.</li>
<li><b>Every finding gets challenged.</b> You try to break it before anyone else does.</li>
<li><b>EDA finds questions, not causes.</b> You will see that two things go together. You will not know why.</li>
<li><b>No pattern is also a finding.</b> “Payment method makes no difference to payment size” is useful to know.</li>
</ol>`
    },
    {
      type: 'try',
      title: 'Behind the scenes: the master table',
      body: `<p>For this whole module, the master table you built in lesson 4.6 is <b>already loaded</b> for you, together with the other six tables. Every code box starts with fresh copies of them, so you can experiment freely. This box shows the code that builds it, so nothing is hidden.</p>
<p>The master table has <b>25000</b> rows, one for each order line, and <b>13</b> columns. The second line lists them: the order line and its product, category, customer, date, status and country, plus the calculated <code>line_total</code> and <code>order_year</code>. This is the table that almost every question in the module will use.</p>`,
      code: `import pandas as pd

master = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")
master = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")
master = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
master["line_total"] = master["quantity"] * master["unit_price"]
master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")
master["order_year"] = master["order_date"].dt.year

print(master.shape)
print(master.columns.tolist())`
    },
    {
      type: 'explain',
      title: 'Stop 1: the first look, in three questions',
      body: `<p>When you meet a new table, three questions give you a quick picture of it, and each one is a column in a <b>profile</b>:</p>
<ul>
<li><b>What type is each column?</b> (<code>dtype</code>) Is a date really a date, and is a number really a number? You learned in lesson 3.2 why this matters.</li>
<li><b>How much is missing?</b> (<code>isnull().sum()</code>) Where are the gaps, and how many?</li>
<li><b>How many different values does each column have?</b> (<code>nunique()</code>) This one is very revealing. A column with as many different values as there are rows is probably an <b>ID</b>. A column with just a handful is probably a <b>category</b>. Anything in between is a measurement or a key.</li>
</ul>
<p>You will write the profile as a <b>function</b>, because you will want it for every table you ever meet. It uses <code>np.where</code> from lesson 5.2 to add a rough label, <code>looks_like</code>, based on the number of distinct values.</p>
<div class="callout watch"><b>A label is a hint, not a fact.</b> The profile guesses from counts. It cannot know what a column <i>means</i>. Always read the guess with your own eyes.</div>`
    },
    {
      type: 'try',
      title: 'A profile of the master table',
      body: `<p>All 13 columns, one line each. The <b>missing</b> column is full of zeros: no gaps anywhere, which is what you would expect from a table that was built from validated joins. The dtypes are as intended: the date is a real date (<code>datetime64[ns]</code>), the money columns are decimals, and the text columns show as <code>object</code>.</p>
<p>Now read the <b>unique</b> column.</p>
<ul>
<li><code>order_item_id</code> has <b>25000</b> unique values, one per row: an ID.</li>
<li><code>category</code> has <b>5</b>, <code>order_status</code> has <b>4</b> and <code>country</code> has <b>5</b>: categories.</li>
<li><code>quantity</code> has only <b>5</b> different values (1 to 5). It is a number, but it behaves like a small set of choices.</li>
<li><code>customer_id</code> has <b>1982</b> unique values, although there are 2,000 customers. That means 18 customers never bought anything, which you found in lesson 3.5.</li>
<li><code>order_id</code> has <b>10000</b> unique values in 25,000 rows. The label says “value”, because it does not match the row count.</li>
</ul>`,
      code: `import pandas as pd
import numpy as np

def profile(table):
    result = pd.DataFrame({
        "dtype": table.dtypes.astype(str),
        "missing": table.isnull().sum(),
        "unique": table.nunique()
    })
    result["looks_like"] = np.where(result["unique"] == len(table), "ID", np.where(result["unique"] <= 12, "category", "value"))
    return result

print(profile(master))`
    },
    {
      id: 'py-6-1-c1',
      type: 'check',
      title: 'In the master table, order_id has 10,000 different values, but the table has 25,000 rows. What does that tell you?',
      body: `<p>Think about what one row of the master table stands for.</p>`,
      options: [
        'There are 15,000 duplicate rows that should be deleted',
        'Each order appears on several rows, one per order line, so order_id repeats by design. It is a key that points to the orders table, not a unique ID of this table',
        'The order_id column contains errors',
        'Only 10,000 of the rows are real'
      ],
      answer: 1,
      why: [
        'These are not duplicates. In lesson 3.3 you learned that repeated keys can be perfectly normal.',
        'Right! The grain of the master table is one row per order line. An order has between 2 and 7 lines, so its ID appears several times. The profile cannot know that, so reading the numbers with the grain in mind is your job.',
        'Nothing is wrong with the column. Its values repeat because an order has several lines.',
        'All 25,000 rows are real order lines, and you reconciled their revenue against the payments.'
      ]
    },
    {
      id: 'py-6-1-ex1',
      type: 'exercise',
      title: 'Your turn: how many different customers bought something?',
      body: `<p>The master table is already loaded as <code>master</code>. Print the number of <b>different customers</b> who appear in it. You should see <code>1982</code>.</p>
<p><b>Think before you type:</b> pick the <code>customer_id</code> column and ask for the number of distinct values with <code>.nunique()</code>.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `master["customer_id"].nunique() counts the different customer IDs. Put it in print(...).`,
        `import pandas as pd\nprint(master["customer_id"].nunique())`
      ],
      solution: `import pandas as pd\nprint(master["customer_id"].nunique())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Stop 2: the tie-out',
      body: `<p>Before you analyse anything, check that the data agrees with itself. A <b>tie-out</b> (also called a reconciliation) compares numbers that two independent sources should agree on. You did a version of this in lesson 3.3. Now it becomes a routine step.</p>
<p>Choose control totals that matter:</p>
<ul>
<li><b>Counts</b>: the number of orders in the orders table against the number in the master table.</li>
<li><b>Money</b>: the revenue of the order lines against the payments total.</li>
<li><b>Order by order</b>: for each order, the sum of its lines against its payment.</li>
</ul>
<p>The third one is the strictest. The grand totals can agree while individual orders are wrong, if the errors happen to cancel out. A plus 1,000 on one order and a minus 1,000 on another leave the total untouched. Checking <b>every order</b> exposes both.</p>
<p>To compare money safely, round both sides to two decimals first. Decimal numbers can differ in their last invisible digits, and a comparison that is “wrong” by a trillionth is not a real difference.</p>`
    },
    {
      type: 'try',
      title: 'Do the totals agree?',
      body: `<p>The first two lines check the count: the orders table has <b>10000</b> orders, and the master table also has <b>10000</b> different orders. No order was lost in the joins, and none was invented.</p>
<p>The next two lines check the money: the lines add up to <b>1581981450.5</b>, and the payments add up to <b>1581981450.5</b>. They agree to the cent.</p>
<p>The last line is the strict test. It compares the total of the lines of each order with that order’s payment. The result: <b>10000</b> orders match and <b>0</b> do not. Every single order ties out. In a real company this would be remarkable. You would normally expect a handful of mismatches, and each one would be a lead for investigation.</p>`,
      code: `import pandas as pd

print("Orders in orders table:", orders["order_id"].nunique())
print("Orders in master table:", master["order_id"].nunique())
print("Lines revenue:", round(master["line_total"].sum(), 2))
print("Payments total:", round(payments["amount"].sum(), 2))

per_order = master.groupby("order_id")["line_total"].sum().round(2)
paid = payments.set_index("order_id")["amount"].round(2)
matches = per_order.reindex(paid.index) == paid
print(matches.sum(), (~matches).sum())`
    },
    {
      id: 'py-6-1-ex2',
      type: 'exercise',
      title: 'Your turn: how many orders fail the tie-out?',
      body: `<p>Calculate, for each order, the total of its order lines and compare it with that order’s payment amount, both rounded to 2 decimals. Print the number of orders where the two <b>differ</b>. You should see <code>0</code>.</p>
<p><b>Think before you type:</b> <code>master.groupby("order_id")["line_total"].sum().round(2)</code> gives each order’s line total. <code>payments.set_index("order_id")["amount"].round(2)</code> gives each order’s payment. Line them up with <code>.reindex(paid.index)</code>, compare with <code>!=</code>, and count with <code>.sum()</code>.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `per_order = master.groupby("order_id")["line_total"].sum().round(2). paid = payments.set_index("order_id")["amount"].round(2). Then (per_order.reindex(paid.index) != paid).sum().`,
        `import pandas as pd\nper_order = master.groupby("order_id")["line_total"].sum().round(2)\npaid = payments.set_index("order_id")["amount"].round(2)\nprint((per_order.reindex(paid.index) != paid).sum())`
      ],
      solution: `import pandas as pd\nper_order = master.groupby("order_id")["line_total"].sum().round(2)\npaid = payments.set_index("order_id")["amount"].round(2)\nprint((per_order.reindex(paid.index) != paid).sum())`,
      ordered: true
    },
    {
      id: 'py-6-1-c2',
      type: 'check',
      title: 'The grand totals of the order lines and the payments agree. Why check order by order as well?',
      body: `<p>Think about errors that cancel each other out.</p>`,
      options: [
        'Because Pandas cannot compare grand totals',
        'Because errors in different orders can cancel out, such as plus 1,000 on one order and minus 1,000 on another, leaving the grand total unchanged. Checking each order exposes them',
        'Because grand totals are always wrong',
        'Because it is faster'
      ],
      answer: 1,
      why: [
        'Pandas compares grand totals easily. The point is what the comparison can and cannot detect.',
        'Exactly. A matching total proves less than people think. The order-by-order check is much stricter, and it also tells you exactly which orders to look at when something is off.',
        'Grand totals are useful. They are just not enough on their own.',
        'It is not about speed. It is about how much the check can reveal.'
      ]
    },
    {
      type: 'explain',
      title: 'Counting people: how many customers, and how loyal?',
      body: `<p>With a clean first look and a good tie-out behind you, the first business questions are about <b>people</b>. How many customers are there? How many of them actually buy? And how many buy <i>again</i>?</p>
<p>That last one, the <b>repeat rate</b>, is a favourite of boards of directors. Its definition is simple: of all the customers who bought at least once, what share placed <b>two or more</b> orders? The calculation uses what you know: group the master table by customer, count the <b>different orders</b> of each (<code>nunique</code> on <code>order_id</code>, because an order has several lines), and measure how many customers have at least two.</p>
<p>While you do it, keep one habit switched on: <b>if a number looks too good, check how it is defined</b>. A repeat rate of 90 percent or more is very unusual in most businesses. Do not celebrate yet. Look at the distribution, and then look at the definition.</p>`
    },
    {
      type: 'try',
      title: 'How many orders does a buyer place?',
      body: `<p><b>1982</b> customers bought something. They placed <b>5.05</b> orders on average, the middle customer placed <b>5</b>, and the most loyal customer placed <b>15</b>.</p>
<p>The table shows the distribution: how many customers placed exactly 1 order, exactly 2, and so on. It rises to a peak at <b>4 orders</b> (384 customers), then 5 orders (335), 6 (293) and 3 (280), and thins out to just 2 customers with 15 orders. Only <b>57</b> customers placed a single order.</p>
<p>The last line gives the repeat rate: <b>97.12</b> percent of buyers placed two or more orders. That is a very high number, so the next step is to check its definition.</p>`,
      code: `import pandas as pd

orders_per_buyer = master.groupby("customer_id")["order_id"].nunique()

print(len(orders_per_buyer))
print(round(orders_per_buyer.mean(), 2), orders_per_buyer.median(), orders_per_buyer.max())
print(orders_per_buyer.value_counts().sort_index())
print(round((orders_per_buyer >= 2).mean() * 100, 2))`
    },
    {
      id: 'py-6-1-ex3',
      type: 'exercise',
      title: 'Your turn: how many one-time buyers?',
      body: `<p>Count the <b>customers who placed exactly one order</b>. Print the number. You should see <code>57</code>.</p>
<p><b>Think before you type:</b> group the master table by <code>customer_id</code> and count the different <code>order_id</code> values of each customer with <code>.nunique()</code>. Then compare the result with <code>== 1</code> and count the Trues with <code>.sum()</code>.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `orders_per_buyer = master.groupby("customer_id")["order_id"].nunique(). Then (orders_per_buyer == 1).sum().`,
        `import pandas as pd\norders_per_buyer = master.groupby("customer_id")["order_id"].nunique()\nprint((orders_per_buyer == 1).sum())`
      ],
      solution: `import pandas as pd\norders_per_buyer = master.groupby("customer_id")["order_id"].nunique()\nprint((orders_per_buyer == 1).sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Which orders count? The definition decides',
      body: `<p>Look closely at what we counted. The 5.05 orders per buyer include <b>every</b> order: Completed ones, but also Cancelled ones, Returned ones and ones still Processing. Is a customer whose second order was cancelled really a “repeat buyer”? The board of directors probably means customers who bought and <i>kept</i> a purchase.</p>
<p>This is the moment where analysts earn their money. There is no single correct repeat rate. There are <b>several defensible definitions</b>, and the number depends on which one you pick:</p>
<ul>
<li><b>All orders</b>: any order counts, whatever happened to it.</li>
<li><b>Completed or Processing</b>: orders that stand, the “net” view from lesson 4.6.</li>
<li><b>Completed only</b>: orders that were fully delivered and kept.</li>
</ul>
<p>You calculate all three, and you report the one that matches the question, together with its definition. As in lesson 4.2, a number without a definition is a rumour.</p>`
    },
    {
      type: 'try',
      title: 'One question, three repeat rates',
      body: `<p>The loop runs the same calculation on three versions of the data. The dictionary holds the three definitions, and <code>.items()</code> hands out each name with its rows, as you learned in Module 1.</p>
<ul>
<li><b>All orders</b>: 1982 buyers, repeat rate <b>97.12</b> percent.</li>
<li><b>Completed or Processing</b>: 1972 buyers, repeat rate <b>95.84</b> percent.</li>
<li><b>Completed only</b>: 1945 buyers, repeat rate <b>91.41</b> percent.</li>
</ul>
<p>The repeat rate falls by almost six points, from 97.12 to 91.41, depending on the definition. Notice that the number of buyers also changes: 37 customers have no Completed order at all, so they drop out of the base. Even the strictest version is still very high. The business has an exceptionally loyal customer base, or the data was generated that way, and either way the right answer is “91 to 97 percent, depending on the definition”.</p>`,
      code: `import pandas as pd

definitions = {
    "all orders": master,
    "completed or processing": master[master["order_status"].isin(["Completed", "Processing"])],
    "completed only": master[master["order_status"] == "Completed"]
}

for name, rows in definitions.items():
    per_customer = rows.groupby("customer_id")["order_id"].nunique()
    print(name, len(per_customer), round((per_customer >= 2).mean() * 100, 2))`
    },
    {
      id: 'py-6-1-ex4',
      type: 'exercise',
      title: 'Your turn: the strictest repeat rate',
      body: `<p>Keep only the order lines of orders whose <code>order_status</code> is <code>"Completed"</code>. Among the customers who have at least one Completed order, print the <b>percentage who placed two or more Completed orders</b>, rounded to 2 decimals. You should see <code>91.41</code>.</p>
<p><b>Think before you type:</b> filter first. Then group by <code>customer_id</code> and count the different <code>order_id</code> values. The share with <code>&gt;= 2</code> is the <code>.mean()</code> of that mask. Multiply by 100 and round.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `done = master[master["order_status"] == "Completed"]. per_customer = done.groupby("customer_id")["order_id"].nunique(). Then round((per_customer >= 2).mean() * 100, 2).`,
        `import pandas as pd\ndone = master[master["order_status"] == "Completed"]\nper_customer = done.groupby("customer_id")["order_id"].nunique()\nprint(round((per_customer >= 2).mean() * 100, 2))`
      ],
      solution: `import pandas as pd\ndone = master[master["order_status"] == "Completed"]\nper_customer = done.groupby("customer_id")["order_id"].nunique()\nprint(round((per_customer >= 2).mean() * 100, 2))`,
      ordered: true
    },
    {
      id: 'py-6-1-c3',
      type: 'check',
      title: 'The repeat rate falls from 97.12 percent to 91.41 percent when only Completed orders are counted. What explains it?',
      body: `<p>Think about who counts as a repeat buyer under each definition.</p>`,
      options: [
        'One of the two calculations is wrong',
        'Under the strict definition, cancelled, returned and processing orders no longer count, so some customers drop below two orders, and some drop out entirely. The definition, not the data, changed the answer',
        'Customers behave differently depending on the calculation',
        'Pandas rounds the two results differently'
      ],
      answer: 1,
      why: [
        'Both are correct for their definitions. They answer slightly different questions.',
        'Exactly. A strict definition removes some orders, which lowers the number of orders per customer. The honest report gives the rate together with its definition, and a short note on how much it moves.',
        'Customers do not know how you calculate. The numbers differ because the question was changed.',
        'The difference is far too large to come from rounding.'
      ]
    },
    {
      id: 'py-6-1-ex5',
      type: 'exercise',
      title: 'Challenge: orders per buyer, strict definition',
      body: `<p>Using only <b>Completed</b> orders, print the <b>average number of Completed orders per buyer</b> (counting only customers with at least one Completed order), rounded to 2 decimals. You should see <code>3.81</code>, against 5.05 when every order is counted.</p>
<p><b>Think before you type:</b> the same grouping as in the last exercise, with <code>.mean()</code> at the end instead of the share with two or more orders.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `done = master[master["order_status"] == "Completed"]. Then done.groupby("customer_id")["order_id"].nunique().mean(), inside round(..., 2).`,
        `import pandas as pd\ndone = master[master["order_status"] == "Completed"]\nprint(round(done.groupby("customer_id")["order_id"].nunique().mean(), 2))`
      ],
      solution: `import pandas as pd\ndone = master[master["order_status"] == "Completed"]\nprint(round(done.groupby("customer_id")["order_id"].nunique().mean(), 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You have taken the first two stops of the check-up. You can:</p>
<ul>
<li>Explain what <b>EDA</b> is, name its eight stops, and apply its four rules</li>
<li>Profile any table with a reusable function: types, missing values, distinct counts, and a rough label for each column</li>
<li>Read the distinct counts <b>with the grain in mind</b>, so that a repeating key is not mistaken for an error</li>
<li>Run a <b>tie-out</b> on counts, on money, and order by order, and say why the strict version matters</li>
<li>Count <b>customers and repeat buyers</b>, and show that the result depends on which orders count</li>
<li>Report a number together with its definition, and with the range it takes under reasonable alternatives</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is the first thing you do when you receive a new dataset?</li>
<li>What is a reconciliation, and why do it before analysing?</li>
<li>A manager says “97 percent of our customers are repeat customers”. What do you ask?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I look at its size and structure: the number of rows and columns, the type of each column, how much is missing, and how many distinct values each column has. I work out what one row represents, which is its grain, and I check the ranges of the main numbers. Only then do I start asking business questions.</p>
<p><b>2.</b> A reconciliation compares figures that two independent sources should agree on, such as the revenue of the order lines against the payments received, or the order count in two tables. I do it before analysing, because if the data does not tie out, every later number is suspect. I also check at the finest level, such as order by order, because matching grand totals can hide errors that cancel out.</p>
<p><b>3.</b> I ask how “repeat” is defined: which orders count, whether cancelled or returned orders are included, and over what period. I would calculate it under a few reasonable definitions and report the range, because the figure can change by several points with the definition, as it does here, from about 97 to about 91 percent.</p>
</details>
<p><b>Coming next, in lesson 6.2:</b> distributions and concentration. You know how big the business is and that the numbers agree. Now you will ask what its columns <i>look</i> like: how spread out are the orders, and which customers and products really drive revenue? The CEO has a popular belief to test: that 20 percent of customers bring 80 percent of the revenue. You will find out whether that is true here.</p>`
    }
  ]
},
{
  id: 'py-6-2',
  track: 'python',
  lang: 'python',
  packages: ['pandas', 'numpy'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: `import pandas as pd
import numpy as np

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
products = pd.read_csv("products.csv")
payments = pd.read_csv("payments.csv")
deliveries = pd.read_csv("deliveries.csv")
order_items = pd.read_csv("order_items.csv")

master = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")
master = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")
master = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
master["line_total"] = master["quantity"] * master["unit_price"]
master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")
master["order_year"] = master["order_date"].dt.year
`,
  preloaded: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items', 'master'],
  title: '6.2 Distributions, concentration and the 80/20 test',
  tables: [],
  intro: `A director at the board meeting offers a piece of business wisdom that he has heard a hundred times: <i>“Twenty percent of our customers bring eighty percent of our revenue. We should focus on that twenty percent.”</i> The CEO turns to you. <i>“Is that true for us?”</i><br><br>It is a good question, and a good example of what EDA is for. A popular belief is a <b>hypothesis</b>. You do not accept it, and you do not dismiss it. You <b>measure</b> it.<br><br>This lesson covers two stops of the check-up. The first is <b>distributions</b>: what each column looks like, how its values are spread, where the typical value sits and how long the tail is. The second is <b>concentration and segments</b>: who or what drives the totals. At the end you will have an answer for the director, and it will not be the one he expects.`,
  steps: [
    {
      type: 'explain',
      title: 'Stop 3: what does a column look like?',
      body: `<p>The <b>distribution</b> of a column is a description of its values as a whole: where they cluster, how far they spread, and whether there are stragglers. You already own the tools, and this stop puts them to work:</p>
<ul>
<li><code>.describe()</code> gives the count, mean, standard deviation, minimum, quartiles and maximum in one call.</li>
<li><code>.value_counts()</code> shows how often each value appears. Add <code>normalize=True</code> to get <b>shares</b> instead of counts, and multiply by 100 for percentages.</li>
<li>Comparing the <b>mean</b> with the <b>median</b> tells you about the shape. If the mean is clearly above the median, a few big values are pulling it up.</li>
</ul>
<p>A useful question to ask first: <b>what is one thing being measured, and at what level?</b> The order lines table has line totals. But the business thinks in <b>orders</b>, so the first distribution to look at is the <b>value of an order</b>, which means adding up the lines of each order.</p>`
    },
    {
      type: 'try',
      title: 'The value of an order, described',
      body: `<p>Group the lines by order and add up, and <code>.describe()</code> gives the whole picture of the 10,000 orders:</p>
<ul>
<li>The <b>mean</b> order is worth <b>158198.15</b> and the <b>median</b> is <b>127828.29</b>. The mean is about 24 percent above the median, a sign of a long tail of big orders.</li>
<li>The middle half of orders lies between <b>73307.58</b> (the 25th percentile) and <b>216218.87</b> (the 75th).</li>
<li>The smallest order is <b>1295.04</b> and the largest is <b>1071796.61</b>. The biggest order is over 800 times bigger than the smallest.</li>
</ul>
<p>You recognise these numbers: they are exactly the payment statistics from lesson 5.4, because every order’s payment equals its line total. The same facts, reached from the order lines.</p>`,
      code: `import pandas as pd

order_value = master.groupby("order_id")["line_total"].sum()

print(order_value.describe().round(2))`
    },
    {
      type: 'explain',
      title: 'Shapes you will meet',
      body: `<p>Distributions come in a few typical shapes, and recognising them quickly is a skill:</p>
<table class="mini">
<tr><th>Shape</th><th>What it looks like</th><th>A clue in the numbers</th></tr>
<tr><td><b>Even</b> (uniform)</td><td>every value about equally common</td><td>value counts nearly equal</td></tr>
<tr><td><b>Bell-shaped</b> (symmetric)</td><td>most values near the middle, few at both ends</td><td>mean close to median</td></tr>
<tr><td><b>Right-skewed</b></td><td>most values small, a long tail of big ones</td><td>mean above median</td></tr>
<tr><td><b>Left-skewed</b></td><td>most values large, a tail of small ones</td><td>mean below median</td></tr>
</table>
<p>Money amounts, order sizes and incomes are almost always right-skewed. A skewed shape has a practical consequence: the <b>median describes a typical case better than the mean</b>, and an unusual value is not necessarily an error.</p>
<p>Not every column needs the full treatment. For a column with few distinct values, like <code>quantity</code>, simply look at the shares. For a count such as “lines per order”, look at the table of counts. Let’s look at both.</p>`
    },
    {
      type: 'try',
      title: 'Quantities and lines per order',
      body: `<p>The first line shows the share of order lines for each quantity. Quantities 1 to 5 are almost perfectly <b>even</b>: <b>19.98, 20.14, 19.38, 20.28 and 20.22</b> percent. Customers are as likely to buy five of something as one. That is unusual in real retail data, and worth a mental note: this dataset looks designed.</p>
<p>The second line counts lines per order. Every order has <b>at least 2</b> lines. <b>6076</b> orders have exactly 2, <b>3028</b> have 3, <b>747</b> have 4, <b>119</b> have 5, <b>29</b> have 6 and just <b>1</b> has 7. That is a right-skewed shape with a short tail. The typical order is small, a pair of lines.</p>`,
      code: `import pandas as pd

print((master["quantity"].value_counts(normalize=True).sort_index() * 100).round(2))

lines_per_order = master.groupby("order_id").size()
print(lines_per_order.value_counts().sort_index())`
    },
    {
      id: 'py-6-2-ex1',
      type: 'exercise',
      title: 'Your turn: what share of orders have exactly two lines?',
      body: `<p>Count the order lines of each order, and print the <b>percentage of orders that have exactly 2 lines</b>, rounded to 2 decimals. You should see <code>60.76</code>.</p>
<p><b>Think before you type:</b> <code>master.groupby("order_id").size()</code> counts the lines of each order. Compare it with <code>== 2</code>, take the <code>.mean()</code> of the result (the share of Trues), multiply by 100 and round.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `lines_per_order = master.groupby("order_id").size(). Then round((lines_per_order == 2).mean() * 100, 2).`,
        `import pandas as pd\nlines_per_order = master.groupby("order_id").size()\nprint(round((lines_per_order == 2).mean() * 100, 2))`
      ],
      solution: `import pandas as pd\nlines_per_order = master.groupby("order_id").size()\nprint(round((lines_per_order == 2).mean() * 100, 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A table that is a histogram: binning',
      body: `<p>To see the <b>shape</b> of a continuous column such as order value, you cut it into bands and count how many values fall in each. That is a <b>histogram</b>, and you can build one as a table with <code>pd.cut</code> from lesson 4.6 and <code>value_counts</code>. (In Module 7 you will draw it as a chart. A table comes first, because the numbers are the foundation of the picture.)</p>
<p>The recipe: choose band edges, for example every 100,000. <code>pd.cut(values, bins=[0, 100000, 200000, ...])</code> labels each value with its band, <code>.value_counts()</code> counts them, and <code>.sort_index()</code> puts the bands in their natural order.</p>
<p>The width of the bands is your choice, and it changes what you see. Too wide and you hide the shape. Too narrow and you drown in noise. Bands of 100,000 suit orders that range up to a million.</p>`
    },
    {
      type: 'try',
      title: 'The shape of order values',
      body: `<p>Read the counts down the table, from small orders to large:</p>
<ul>
<li>0 to 100,000: <b>3782</b></li>
<li>100,000 to 200,000: <b>3390</b></li>
<li>200,000 to 300,000: <b>1629</b></li>
<li>300,000 to 400,000: <b>749</b></li>
<li>400,000 to 500,000: <b>310</b></li>
<li>500,000 to 600,000: <b>96</b>, and then <b>30, 10, 3</b> and finally <b>1</b> order above 900,000.</li>
</ul>
<p>The counts <b>fall steadily</b> as the order value rises: a classic right-skewed shape, with most orders in the two smallest bands and a long, thin tail. The third line, <code>skew()</code>, puts a number on it: <b>1.39</b>. A value near 0 means symmetric, and a positive value means a tail to the right.</p>`,
      code: `import pandas as pd

order_value = master.groupby("order_id")["line_total"].sum()

edges = [0, 100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1100000]
bands = pd.cut(order_value, bins=edges)

print(bands.value_counts().sort_index())
print(round(order_value.skew(), 2))`
    },
    {
      id: 'py-6-2-c1',
      type: 'check',
      title: 'The mean order value is 158,198 and the median is 127,828, and the counts fall steadily from the smallest band to the largest. What is the shape?',
      body: `<p>Think about where the tail is.</p>`,
      options: [
        'Bell-shaped: the mean and the median are close enough',
        'Right-skewed: most orders are smaller, with a long tail of large ones pulling the mean above the median',
        'Left-skewed: most orders are large',
        'Even: all bands have the same count'
      ],
      answer: 1,
      why: [
        'In a bell shape, the mean and median are almost the same, and the counts rise to a peak in the middle. Here they fall from the start.',
        'Yes! The mean above the median and the long tail to the right are the two signs of a right-skewed distribution. The median describes the typical order better than the mean.',
        'A left-skewed shape would have the mean below the median, and most values at the high end.',
        'The counts range from 3,782 down to 1, which is far from even.'
      ]
    },
    {
      id: 'py-6-2-ex2',
      type: 'exercise',
      title: 'Your turn: how many big orders?',
      body: `<p>Calculate the value of each order, and print the <b>percentage of orders worth more than 300000</b>, rounded to 2 decimals. You should see <code>11.99</code>.</p>
<p><b>Think before you type:</b> <code>order_value = master.groupby("order_id")["line_total"].sum()</code>. Then the mask <code>order_value &gt; 300000</code>, its <code>.mean()</code> (the share of Trues), times 100, rounded.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `order_value = master.groupby("order_id")["line_total"].sum(). Then round((order_value > 300000).mean() * 100, 2).`,
        `import pandas as pd\norder_value = master.groupby("order_id")["line_total"].sum()\nprint(round((order_value > 300000).mean() * 100, 2))`
      ],
      solution: `import pandas as pd\norder_value = master.groupby("order_id")["line_total"].sum()\nprint(round((order_value > 300000).mean() * 100, 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Stop 4: concentration, and how to test the 80/20 claim',
      body: `<p>Now the director’s claim. It is a statement about <b>concentration</b>: how much of a total comes from the top of a ranking. You can measure concentration with a short recipe. It is called a <b>cumulative share</b>, or a Pareto analysis, after the economist who noticed the 80/20 pattern in land ownership.</p>
<ol>
<li><b>Total per customer.</b> Group the lines by customer and add up the revenue.</li>
<li><b>Rank.</b> Sort the customers from the biggest to the smallest.</li>
<li><b>Running total.</b> <code>.cumsum()</code> adds up the values as you go down the list: the biggest customer, then the biggest two together, then three, and so on.</li>
<li><b>Divide by the grand total</b> and multiply by 100, to get the share of all revenue reached after each customer.</li>
</ol>
<p>Read the running share at a chosen point. After the top 10 percent of customers, how much of the revenue have you covered? After 20 percent? And the reverse question: how many customers do you need to reach 80 percent of revenue?</p>
<p>If the 80/20 belief held, the top 20 percent of customers would cover about 80 percent of revenue. Let’s measure.</p>`
    },
    {
      type: 'try',
      title: 'Do 20 percent of customers bring 80 percent of revenue?',
      body: `<p>There are <b>1982</b> customers who bought something. The top <b>10 percent</b> (198 customers) bring <b>20.58</b> percent of revenue. The top <b>20 percent</b> (396 customers) bring <b>36.08</b> percent, not 80. The top <b>half</b> (991 customers) bring <b>70.87</b> percent.</p>
<p>The last line answers the reverse question: to reach 80 percent of revenue you need <b>1198</b> customers, which is <b>60.44</b> percent of all customers. So the director’s belief is false for TradeFlow. It would be more accurate to say that <b>60 percent of customers bring 80 percent of revenue</b>. Revenue is spread widely across the customer base.</p>
<p>The code builds the running share, then looks up its value at the right positions with <code>.iloc[...]</code>. The position is one less than the count, because positions start at 0.</p>`,
      code: `import pandas as pd

by_customer = master.groupby("customer_id")["line_total"].sum().sort_values(ascending=False)
running = by_customer.cumsum() / by_customer.sum() * 100
n = len(by_customer)

print(n)
for pct in [10, 20, 50]:
    top = int(round(n * pct / 100))
    print(pct, top, round(running.iloc[top - 1], 2))

needed = int((running < 80).sum() + 1)
print(needed, round(needed / n * 100, 2))`
    },
    {
      id: 'py-6-2-ex3',
      type: 'exercise',
      title: 'Your turn: the share of the top 10 percent of customers',
      body: `<p>Calculate each customer’s total revenue, sort from biggest to smallest, and print the <b>percentage of total revenue</b> that the top <b>198</b> customers (the top 10 percent) bring, rounded to 2 decimals. You should see <code>20.58</code>.</p>
<p><b>Think before you type:</b> <code>by_customer = master.groupby("customer_id")["line_total"].sum().sort_values(ascending=False)</code>. Take the first 198 with <code>.head(198)</code>, sum them, divide by the sum of all, multiply by 100, and round.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `by_customer = master.groupby("customer_id")["line_total"].sum().sort_values(ascending=False). Then by_customer.head(198).sum() / by_customer.sum() * 100, inside round(..., 2).`,
        `import pandas as pd\nby_customer = master.groupby("customer_id")["line_total"].sum().sort_values(ascending=False)\nprint(round(by_customer.head(198).sum() / by_customer.sum() * 100, 2))`
      ],
      solution: `import pandas as pd\nby_customer = master.groupby("customer_id")["line_total"].sum().sort_values(ascending=False)\nprint(round(by_customer.head(198).sum() / by_customer.sum() * 100, 2))`,
      ordered: true
    },
    {
      id: 'py-6-2-ex4',
      type: 'exercise',
      title: 'Your turn: are products more concentrated than customers?',
      body: `<p>Do the same analysis for <b>products</b>. Add up the revenue of each <code>product_id</code>, sort from biggest to smallest, and print the <b>percentage of total revenue</b> that the top <b>30</b> products (the top 20 percent of 150) bring, rounded to 2 decimals. You should see <code>49.06</code>.</p>
<p><b>Think before you type:</b> the same recipe as in the last exercise, grouping by <code>product_id</code> and keeping 30 instead of 198.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `by_product = master.groupby("product_id")["line_total"].sum().sort_values(ascending=False). Then by_product.head(30).sum() / by_product.sum() * 100, inside round(..., 2).`,
        `import pandas as pd\nby_product = master.groupby("product_id")["line_total"].sum().sort_values(ascending=False)\nprint(round(by_product.head(30).sum() / by_product.sum() * 100, 2))`
      ],
      solution: `import pandas as pd\nby_product = master.groupby("product_id")["line_total"].sum().sort_values(ascending=False)\nprint(round(by_product.head(30).sum() / by_product.sum() * 100, 2))`,
      ordered: true
    },
    {
      id: 'py-6-2-c2',
      type: 'check',
      title: 'The top 20 percent of customers bring 36 percent of revenue, and the top 20 percent of products bring 49 percent. What do you tell the director?',
      body: `<p>Compare the finding with the belief, and say what it means for the business.</p>`,
      options: [
        'He is right: 80/20 holds',
        'The 80/20 rule does not hold here. Revenue is spread across the customer base (it takes about 60 percent of customers to reach 80 percent of revenue), and products are somewhat more concentrated than customers. Losing a few top customers would hurt much less than the belief suggests',
        'The data is wrong, because 80/20 is a law of nature',
        'Concentration cannot be measured'
      ],
      answer: 1,
      why: [
        'The numbers say otherwise: the top 20 percent bring 36 percent of revenue, not 80.',
        'Exactly. The finding is a clear no, and it has a business meaning: a strategy of focusing on a small elite of customers would ignore most of the revenue. A broad base is a strength, because no single customer matters much.',
        '80/20 is a pattern that often appears, not a law. Plenty of businesses are less concentrated, and you have just measured one.',
        'You just measured it, with a sort and a running total.'
      ]
    },
    {
      type: 'explain',
      title: 'Segments: comparing groups fairly',
      body: `<p>The other half of stop 4 is <b>segments</b>: splitting the business by country, category or payment method, and comparing the pieces. You know the mechanics from lesson 4.4. The skill in EDA is making the comparison <b>fair</b>.</p>
<p>A total by segment mixes two things together:</p>
<p><b>total revenue = number of lines × average value of a line</b></p>
<p>Or, per customer: <b>total revenue = number of buyers × revenue per buyer</b>. Before you say that a segment is “better”, ask which of the two parts explains the difference. A country that earns more because it has more customers is a different story from one that earns more because each customer spends more.</p>
<p>A second question protects you from over-reading: <b>is the difference big compared with the natural variation?</b> If lines vary by tens of thousands from one to the next, an average that differs by 1,000 between two countries is noise.</p>`
    },
    {
      type: 'try',
      title: 'Five countries, taken apart',
      body: `<p>The table splits each country’s revenue into its parts. Rwanda leads with <b>349562175.01</b>, which is <b>22.1</b> percent of the total, and South Africa is last with <b>18.28</b> percent.</p>
<p>Now ask which part explains it. The <b>average line</b> is almost the same everywhere, between <b>62534.55</b> and <b>63800.36</b>, a spread of about 2 percent, while a single line varies with a standard deviation of <b>67107.44</b>. So lines are worth about the same in every country. The difference is <b>volume</b>: Rwanda has <b>5479</b> lines and <b>433</b> buyers, against 4625 lines and 375 buyers in South Africa.</p>
<p>The revenue per buyer varies more: from <b>771259.49</b> (South Africa) to <b>823660.11</b> (Ghana), a spread of about 7 percent. Ghana’s buyers are the most valuable, and Rwanda’s total is the biggest only because it has the most buyers.</p>`,
      code: `import pandas as pd

by_country = master.groupby("country").agg(
    lines=("line_total", "size"),
    revenue=("line_total", "sum"),
    avg_line=("line_total", "mean"),
    buyers=("customer_id", "nunique")
)
by_country["revenue_per_buyer"] = by_country["revenue"] / by_country["buyers"]
by_country["share_pct"] = by_country["revenue"] / by_country["revenue"].sum() * 100

print(by_country.round(2))
print(round(master["line_total"].std(), 2))`
    },
    {
      id: 'py-6-2-ex5',
      type: 'exercise',
      title: 'Challenge: revenue per buyer in Rwanda',
      body: `<p>Work out the <b>revenue per buyer</b> for <b>Rwanda</b>: the total <code>line_total</code> of the Rwandan rows divided by the number of <b>different customers</b> among them. Print it rounded to 2 decimals. You should see <code>807302.94</code>.</p>
<p><b>Think before you type:</b> keep the rows with <code>master[master["country"] == "Rwanda"]</code>. Take the <code>.sum()</code> of its <code>line_total</code> and divide by the <code>.nunique()</code> of its <code>customer_id</code>.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `rwanda = master[master["country"] == "Rwanda"]. Then rwanda["line_total"].sum() / rwanda["customer_id"].nunique(), inside round(..., 2).`,
        `import pandas as pd\nrwanda = master[master["country"] == "Rwanda"]\nprint(round(rwanda["line_total"].sum() / rwanda["customer_id"].nunique(), 2))`
      ],
      solution: `import pandas as pd\nrwanda = master[master["country"] == "Rwanda"]\nprint(round(rwanda["line_total"].sum() / rwanda["customer_id"].nunique(), 2))`,
      ordered: true
    },
    {
      id: 'py-6-2-c3',
      type: 'check',
      title: 'Rwanda has the highest total revenue. What is the best explanation from the table?',
      body: `<p>Break the total into its two parts.</p>`,
      options: [
        'Rwandan customers spend far more per line than customers elsewhere',
        'Rwanda has the most buyers and the most lines, while the average line is about the same as in other countries. Its lead is about volume, not value per line',
        'Rwanda’s data contains errors',
        'Rwanda has the largest orders'
      ],
      answer: 1,
      why: [
        'The average line in Rwanda is 63,800, against 62,535 to 63,371 elsewhere. That is about 2 percent, which is small next to the variation between individual lines.',
        'Right! Rwanda has 433 buyers and 5,479 lines, the most of any country. A segment can lead because it is bigger, and that is a different business story from leading because it is better.',
        'Nothing suggests an error. All the data passed the checks in Module 3.',
        'Order sizes are about the same everywhere. The difference is in how many there are.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You have taken stops 3 and 4 of the check-up. You can:</p>
<ul>
<li>Describe a column’s <b>distribution</b> with <code>describe</code>, <code>value_counts(normalize=True)</code> and the mean against the median</li>
<li>Name the shapes: even, bell-shaped, right-skewed and left-skewed, and say why money is usually right-skewed</li>
<li>Build a <b>histogram as a table</b> with <code>pd.cut</code>, and measure skew with <code>.skew()</code></li>
<li>Test a <b>concentration claim</b> with a cumulative share: group, sort, <code>cumsum</code>, divide by the total</li>
<li>Show that the 80/20 belief <b>does not hold</b> for these customers, and quantify what does</li>
<li>Take a segment total apart into <b>volume times value</b>, and say whether a difference is big compared with the variation</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>How would you check whether 80 percent of revenue comes from 20 percent of customers?</li>
<li>Why do analysts often prefer the median to the mean for order values?</li>
<li>Country A earns more than country B. What do you check before calling A “better”?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I add up the revenue per customer, sort from largest to smallest, take the running total with <code>cumsum</code>, and divide by the grand total. Then I read the share reached by the top 20 percent of customers, and I count how many customers it takes to reach 80 percent. Here the top 20 percent bring only about 36 percent, and it takes about 60 percent of customers to reach 80 percent.</p>
<p><b>2.</b> Order values are usually right-skewed: many small orders and a few very large ones. The large ones pull the mean upwards, so the mean describes an order that few customers actually place. The median is the middle order, and it is not dragged around by the extremes, so it describes a typical order better.</p>
<p><b>3.</b> I break the total into volume times value: the number of customers or lines, and the average per customer or line. A segment can earn more because it is bigger, rather than because each customer is worth more. I also check whether the difference is large compared with the natural variation in the data, because a small difference between averages may be only noise.</p>
</details>
<p><b>Coming next, in lesson 6.3:</b> time and relationships. You know what the business looks like at one moment. Now you will look at how it moves through the months and years, with like-for-like comparisons, and at what goes together with what: does price go with quantity, does order value go with delivery time? You will meet the correlation coefficient, and learn why a strong correlation proves less than it seems, and a missing one proves more.</p>`
    }
  ]
}
);
