LESSONS.push(
{
  id: 'sql-2-4',
  track: 'sql',
  title: '2.4 Numbers and calculations: maths, rounding and percentages',
  tables: ['products', 'order_items'],
  intro: `Finance sends you three requests: <i>“What is each order line worth? What would a product cost with a 10% discount? And what percentage of shelf capacity is each product stocked at?”</i><br><br>All three are calculations, and calculations have <b>three famous traps</b> that quietly ruin real reports: decimals that look wrong, numbers that need rounding, and a division that returns zero. By the end of this lesson you will know all three, and avoid them forever.`,
  steps: [
    {
      type: 'explain',
      title: 'SELECT is also a calculator',
      body: `<div class="callout analogy"><b>The big idea:</b> SQL can do maths on every row at once, like a calculator that works down an entire column. The answers appear as new columns in your result. Nothing in the table changes.</div>
<p>The tools are the ones you know: <code>+</code> add, <code>-</code> subtract, <code>*</code> multiply, <code>/</code> divide. SQL follows normal maths order (multiply and divide before add and subtract), and you can use <b>brackets</b> to be clear.</p>
<p>Let’s calculate what each order line is worth: <b>quantity times price</b>.</p>`
    },
    {
      type: 'try',
      title: 'What is each order line worth?',
      body: `<p>Run it and look carefully at row 4: <code>65805.18000000001</code>. Where did that strange tail come from? Your query is correct. Let’s find out why this happens.</p>`,
      code: `SELECT order_item_id, quantity, unit_price,
       quantity * unit_price AS line_total
FROM order_items
LIMIT 6;`
    },
    {
      type: 'try',
      title: 'The famous 0.1 + 0.2 problem',
      body: `<p>Everyone expects <code>0.3</code>. The computer says <code>0.30000000000000004</code>. Why? Computers store decimals in binary, and some simple decimals can’t be stored exactly, just like 1/3 can’t be written exactly as a decimal (0.3333...). The tiny leftover shows up as a long tail.</p>
<div class="callout work"><b>At work:</b> this is why serious financial systems store money as whole numbers of cents, or use a special exact <code>DECIMAL</code> type. For reports, the fix is easy: round the result.</div>`,
      code: `SELECT 0.1 + 0.2 AS should_be_point_three;`
    },
    {
      type: 'try',
      title: 'The fix: ROUND',
      body: `<p><code>ROUND(number, 2)</code> keeps <b>2 decimal places</b>. Now row 4 reads <code>65805.18</code> and row 6 reads <code>2885.35</code>. Clean. Make <code>ROUND</code> your reflex for any money or percentage you show to a human.</p>
<p>Rounding only changes what you <i>display</i> here. Round at the very end of a calculation, never in the middle, so small errors don’t pile up.</p>`,
      code: `SELECT order_item_id,
       ROUND(quantity * unit_price, 2) AS line_total
FROM order_items
LIMIT 6;`
    },
    {
      id: 'sql-2-4-ex1',
      type: 'exercise',
      title: 'Your turn: clean line totals',
      body: `<p>Show <code>order_item_id</code> and the line total (quantity times unit price), <b>rounded to 2 decimals</b>, called <code>line_total</code>, for the <b>first 6 order items</b>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Wrap the multiplication in ROUND( ..., 2 ).`,
        `SELECT order_item_id, ROUND(quantity * unit_price, 2) AS line_total FROM order_items LIMIT 6;`
      ],
      solution: `SELECT order_item_id, ROUND(quantity * unit_price, 2) AS line_total FROM order_items LIMIT 6;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Multipliers: discounts and taxes',
      body: `<p>Here’s a trick that makes percentage maths easy: <b>turn the percentage into a multiplier</b>.</p>
<ul>
<li>A <b>10% discount</b> means you pay 90%, so multiply by <code>0.9</code></li>
<li>Adding <b>7.5% tax</b> means you pay 107.5%, so multiply by <code>1.075</code></li>
</ul>
<p>No need to calculate the discount separately and subtract it. One multiplication does it all.</p>`
    },
    {
      type: 'try',
      title: 'Prices with 7.5% tax added',
      body: `<p>Each price times <code>1.075</code>, rounded to two decimals.</p>`,
      code: `SELECT product_name,
       unit_price,
       ROUND(unit_price * 1.075, 2) AS price_with_tax
FROM products
LIMIT 5;`
    },
    {
      id: 'sql-2-4-ex2',
      type: 'exercise',
      title: 'Your turn: a 10% discount',
      body: `<p>For the <b>first 5 products</b>, show <code>product_name</code> and the price after a <b>10% discount</b>, rounded to 2 decimals, called <code>discounted_price</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `A 10% discount means paying 90%, so multiply unit_price by 0.9.`,
        `SELECT product_name, ROUND(unit_price * 0.9, 2) AS discounted_price FROM products LIMIT 5;`
      ],
      solution: `SELECT product_name, ROUND(unit_price * 0.9, 2) AS discounted_price FROM products LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Trap 3: the division that returns zero',
      body: `<p>This is the trap that has ruined real company reports. In SQL, <b>if you divide two whole numbers, you get a whole number</b>. The decimals are thrown away, not rounded.</p>
<p>So <code>5 / 2</code> gives <b>2</b>, not 2.5. The fix is to make at least one of the numbers a decimal, by writing <code>2.0</code> instead of <code>2</code>, or by multiplying by <code>1.0</code>.</p>`
    },
    {
      type: 'try',
      title: 'See it with your own eyes',
      body: `<p>The first column uses whole numbers and gets <b>2</b>. The second has a decimal point and gets <b>2.5</b>.</p>`,
      code: `SELECT 5 / 2   AS whole_division,
       5 / 2.0 AS decimal_division;`
    },
    {
      id: 'sql-2-4-c1',
      type: 'check',
      title: 'In SQLite, what does 7 / 2 return when both numbers are whole numbers?',
      body: `<p>Whole numbers in, whole number out.</p>`,
      options: ['3.5', '3', '4', 'An error'],
      answer: 1,
      why: [
        'That is the answer you expect, but it is only what you get if one number has a decimal point, like 7 / 2.0.',
        'Yes! Whole divided by whole gives a whole number, and the decimals are chopped off (not rounded).',
        'It is chopped off, not rounded up. 7 / 2 is 3.5, which becomes 3.',
        'No error appears. The wrong answer shows up silently, and that is the danger.'
      ]
    },
    {
      type: 'try',
      title: 'The trap in real data: stock levels',
      body: `<p>Each shelf holds up to 500 items. What percentage of capacity is each product stocked at? Look at the two columns. The beginner formula <code>stock_quantity / 500</code> gives <b>0 for every single product</b>, because every stock level is below 500, so the whole-number answer is 0. The correct formula multiplies by <code>100.0</code> first, with the decimal point.</p>
<p>The safe pattern for any percentage is: <code>part * 100.0 / whole</code>.</p>`,
      code: `SELECT product_name,
       stock_quantity,
       stock_quantity / 500 AS wrong_answer,
       ROUND(stock_quantity * 100.0 / 500, 1) AS stock_pct
FROM products
LIMIT 5;`
    },
    {
      id: 'sql-2-4-ex3',
      type: 'exercise',
      title: 'Your turn: the safe percentage',
      body: `<p>For the <b>first 5 products</b>, show <code>product_name</code> and the stock level as a <b>percentage of 500</b>, rounded to <b>1 decimal place</b>, called <code>stock_pct</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Use the pattern part * 100.0 / whole, then ROUND to 1 decimal.`,
        `SELECT product_name, ROUND(stock_quantity * 100.0 / 500, 1) AS stock_pct FROM products LIMIT 5;`
      ],
      solution: `SELECT product_name, ROUND(stock_quantity * 100.0 / 500, 1) AS stock_pct FROM products LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A few more handy tools',
      body: `<ul>
<li><code>ABS(x)</code>: removes the minus sign (distance, difference)</li>
<li><code>x % y</code>: the remainder after dividing (17 % 5 is 2). Great for “is this number even?”</li>
<li><code>CAST(x AS INTEGER)</code>: <b>chops off</b> the decimals (does not round)</li>
<li><code>ROUND(x)</code>: with no second number, rounds to a whole number</li>
</ul>`
    },
    {
      type: 'try',
      title: 'Chopping vs rounding',
      body: `<p>Look at the Smartphone Charger: price 28995.64. <code>CAST</code> chops it to <b>28995</b>. <code>ROUND</code> rounds it to <b>28996</b>. Know which one you need.</p>`,
      code: `SELECT product_name,
       unit_price,
       CAST(unit_price AS INTEGER) AS chopped,
       ROUND(unit_price) AS rounded
FROM products
LIMIT 5;`
    },
    {
      type: 'try',
      title: 'Which shelves hold the most value? (chart)',
      body: `<p>We divided by <code>1000000.0</code> to show the stock value in <b>millions</b>, with the decimal point so we don’t trigger the whole-number trap. The chart makes the ranking instant: the Phone Tripod Stand shelf is worth the most.</p>`,
      chart: 'bar',
      chartTitle: 'Stock value by product (millions)',
      code: `SELECT product_name,
       ROUND(unit_price * stock_quantity / 1000000.0, 2) AS stock_value_millions
FROM products
ORDER BY stock_value_millions DESC
LIMIT 8;`
    },
    {
      type: 'explain',
      title: 'Using a calculation in WHERE',
      body: `<p>You can filter on a calculation too. But here is a catch: in many databases you <b>can’t use an alias</b> inside <code>WHERE</code>, because WHERE runs <i>before</i> the SELECT creates the alias. So write the calculation out again:</p>
<p><code>WHERE unit_price * stock_quantity &gt; 20000000</code></p>
<div class="callout work"><b>At work:</b> SQLite lets you get away with aliases in WHERE, but PostgreSQL and SQL Server don’t. Repeat the expression and your query works everywhere.</div>`
    },
    {
      id: 'sql-2-4-ex4',
      type: 'exercise',
      title: 'Challenge: the high-value shelves',
      body: `<p>Show <code>product_name</code> and the stock value (price times stock quantity, <b>rounded to 2 decimals</b>, called <code>stock_value</code>) for products whose stock value is <b>more than 20,000,000</b>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Repeat the multiplication in the WHERE clause, and use ROUND only in the SELECT.`,
        `SELECT product_name, ROUND(unit_price * stock_quantity, 2) AS stock_value FROM products WHERE unit_price * stock_quantity > 20000000;`
      ],
      solution: `SELECT product_name, ROUND(unit_price * stock_quantity, 2) AS stock_value FROM products WHERE unit_price * stock_quantity > 20000000;`,
      ordered: false
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Calculate new columns with <code>+ - * /</code> and brackets</li>
<li>Explain why decimals sometimes grow a long tail (<code>0.30000000000000004</code>) and fix it with <code>ROUND</code></li>
<li>Use <b>multipliers</b> for discounts and tax (0.9 and 1.075)</li>
<li>Avoid the <b>whole-number division</b> trap with <code>part * 100.0 / whole</code></li>
<li>Choose between <code>CAST</code> (chop) and <code>ROUND</code></li>
<li>Filter on a calculation by repeating the expression in <code>WHERE</code></li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What does <code>SELECT 7 / 2</code> return in SQLite, and how do you get 3.5?</li>
<li>Why should money calculations be rounded at the end and not the beginning?</li>
<li>How would you calculate what percentage a part is of a whole, safely?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> It returns 3, because dividing two whole numbers gives a whole number. To get 3.5, make one side a decimal: <code>7 / 2.0</code> or <code>7 * 1.0 / 2</code>.</p>
<p><b>2.</b> Every rounding step throws away a tiny amount. If you round early, those small errors accumulate across thousands of rows. Round once, at the end.</p>
<p><b>3.</b> <code>part * 100.0 / whole</code>, with the decimal in 100.0 to avoid whole-number division, then <code>ROUND</code> to the number of decimals you want to show.</p>
</details>
<p><b>Coming next, Lesson 2.5: Aggregates.</b> COUNT, SUM, AVG, MIN and MAX: turning thousands of rows into one answer. You will also prove that TradeFlow’s books balance to the cent.</p>`
    }
  ]
},
{
  id: 'sql-2-5',
  track: 'sql',
  title: '2.5 Aggregates: COUNT, SUM, AVG, MIN and MAX',
  tables: ['customers', 'orders', 'order_items', 'payments', 'deliveries'],
  intro: `Finance walks over: <i>“How many orders have we had? How much money came in? What’s the average payment? How many different customers actually bought something?”</i><br><br>These aren’t questions about <i>rows</i>. They are questions about <b>the whole table at once</b>. That is the job of <b>aggregate functions</b>. By the end you will answer all of these, and prove that TradeFlow’s books balance to the cent.`,
  steps: [
    {
      type: 'explain',
      title: 'The end-of-day total',
      body: `<div class="callout analogy"><b>The big idea:</b> an <b>aggregate function</b> squashes many rows into <b>one answer</b>, the way a shop owner counts the till at the end of the day: “312 sales, 4.2 million in total.” You don’t read every receipt. You total them.</div>
<ul>
<li><code>COUNT</code>: how many</li>
<li><code>SUM</code>: the total</li>
<li><code>AVG</code>: the average</li>
<li><code>MIN</code> and <code>MAX</code>: the smallest and the largest</li>
</ul>`
    },
    {
      type: 'try',
      title: 'How many orders?',
      body: `<p><code>COUNT(*)</code> counts rows. One question, one row of answer: <b>10,000</b>.</p>`,
      code: `SELECT COUNT(*) AS total_orders
FROM orders;`
    },
    {
      type: 'try',
      title: 'Five summaries in one go',
      body: `<p>Count, total, average, smallest and largest payment, in one query. You can put as many aggregates as you like in one SELECT.</p>
<p>But hold on: this includes <b>every</b> payment record: paid, pending, failed and refunded. Is that really “money that came in”? Hold that thought.</p>`,
      code: `SELECT COUNT(*) AS payments,
       ROUND(SUM(amount), 2) AS total_amount,
       ROUND(AVG(amount), 2) AS average_amount,
       MIN(amount) AS smallest,
       MAX(amount) AS largest
FROM payments;`
    },
    {
      type: 'explain',
      title: 'Filter first, then summarise',
      body: `<p>When you add a <code>WHERE</code>, SQL <b>filters the rows first</b> and only then runs the aggregate on what is left. So you can answer sharper questions: not “total of all payments” but “total of payments that were actually <b>Paid</b>”.</p>
<div class="callout tip"><b>The habit of a great analyst:</b> before you calculate any number, decide what it <i>means</i>. “Money that came in” and “every payment record” are two different numbers.</div>`
    },
    {
      type: 'try',
      title: 'Money actually received',
      body: `<p>Only <b>Paid</b> payments: <b>1,341,394,728.95</b>. Compare it with the total of all payments earlier (1,581,981,450.50). The gap of about 240 million is money that was pending, failed or refunded. If you had reported the first number as “revenue”, you would have overstated it by roughly 18%.</p>`,
      code: `SELECT ROUND(SUM(amount), 2) AS paid_total
FROM payments
WHERE payment_status = 'Paid';`
    },
    {
      id: 'sql-2-5-ex1',
      type: 'exercise',
      title: 'Your turn: how many refunds?',
      body: `<p>How many payments have the status <b>Refunded</b>? Return one number called <code>refunded_payments</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `COUNT(*) with a WHERE on payment_status.`,
        `SELECT COUNT(*) AS refunded_payments FROM payments WHERE payment_status = 'Refunded';`
      ],
      solution: `SELECT COUNT(*) AS refunded_payments FROM payments WHERE payment_status = 'Refunded';`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Three ways to count',
      body: `<p>You met two of these in Module 1. Now meet all three side by side:</p>
<ul>
<li><code>COUNT(*)</code>: counts <b>rows</b>, empty or not</li>
<li><code>COUNT(column)</code>: counts rows where that column is <b>not empty</b></li>
<li><code>COUNT(DISTINCT column)</code>: counts <b>different values</b> in that column (and ignores empties)</li>
</ul>`
    },
    {
      type: 'try',
      title: 'Three counts, three different answers',
      body: `<p>On the deliveries table: <b>9,500</b> rows, <b>8,261</b> with a delivery date (the rest are In Transit or Failed), and <b>4</b> different delivery statuses. Same table, three different questions.</p>`,
      code: `SELECT COUNT(*) AS delivery_rows,
       COUNT(delivery_date) AS with_delivery_date,
       COUNT(DISTINCT delivery_status) AS different_statuses
FROM deliveries;`
    },
    {
      type: 'try',
      title: 'How many customers actually bought something?',
      body: `<p>There are 2,000 customers, but only <b>1,982</b> appear in the orders table. (Remember the 18 who signed up but never ordered from Lesson 1.2.) <code>COUNT(DISTINCT customer_id)</code> counts each customer once, however many orders they placed.</p>`,
      code: `SELECT COUNT(DISTINCT customer_id) AS customers_who_ordered
FROM orders;`
    },
    {
      id: 'sql-2-5-c1',
      type: 'check',
      title: 'A table has 1,000 rows, but COUNT(phone) returns 940. What does that tell you?',
      body: `<p>Think about what COUNT(column) skips.</p>`,
      options: ['60 rows have a missing phone number', '940 different phone numbers exist', '60 phone numbers are duplicates', 'The query has a bug'],
      answer: 0,
      why: [
        'Yes! COUNT(column) skips empty cells, so 1,000 minus 940 leaves 60 rows where the phone is missing.',
        'That would be <code>COUNT(DISTINCT phone)</code>. Plain COUNT(phone) counts non-empty cells, repeats included.',
        'Duplicates are still counted by COUNT(phone). Only empty cells are skipped.',
        'No bug. The result is valid, and quietly tells you something about data quality.'
      ]
    },
    {
      id: 'sql-2-5-ex2',
      type: 'exercise',
      title: 'Your turn: who complained?',
      body: `<p>How many <b>different customers</b> have had at least one <b>Cancelled</b> order? Return one number called <code>customers_with_cancellations</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `You need COUNT(DISTINCT ...) on the customer column, with a WHERE on order_status.`,
        `SELECT COUNT(DISTINCT customer_id) AS customers_with_cancellations FROM orders WHERE order_status = 'Cancelled';`
      ],
      solution: `SELECT COUNT(DISTINCT customer_id) AS customers_with_cancellations FROM orders WHERE order_status = 'Cancelled';`,
      ordered: true
    },
    {
      id: 'sql-2-5-ex3',
      type: 'exercise',
      title: 'Your turn: the average real payment',
      body: `<p>What is the <b>average amount of payments that were Paid</b>? Round to 2 decimals and call it <code>avg_paid</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `ROUND(AVG(amount), 2) with a WHERE on payment_status.`,
        `SELECT ROUND(AVG(amount), 2) AS avg_paid FROM payments WHERE payment_status = 'Paid';`
      ],
      solution: `SELECT ROUND(AVG(amount), 2) AS avg_paid FROM payments WHERE payment_status = 'Paid';`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Do the books balance? The tie-out',
      body: `<p>Professional analysts have a habit that catches serious errors: <b>the tie-out</b>. If two different tables should add up to the same number, check that they do.</p>
<p>TradeFlow has two ways to know how much money orders are worth: the total of the <b>payments</b>, and the total of every <b>order line</b> (quantity times price). If the data is healthy, they should match. You already saw the payments total: <b>1,581,981,450.50</b>. Now sum the order lines.</p>`
    },
    {
      type: 'try',
      title: 'The order-line total',
      body: `<p><b>1,581,981,450.50</b>. It matches the payments total to the cent. The books balance. That’s a strong sign that these two tables are consistent, and the kind of evidence that makes your reports trustworthy. If they had differed, you would have found a data problem before a manager did.</p>`,
      code: `SELECT ROUND(SUM(quantity * unit_price), 2) AS order_lines_total
FROM order_items;`
    },
    {
      id: 'sql-2-5-ex4',
      type: 'exercise',
      title: 'Your turn: units sold',
      body: `<p>Return <b>two columns</b>: the total number of units sold (<code>units_sold</code>, the sum of <code>quantity</code>) and the average quantity per order line, rounded to 2 decimals (<code>avg_per_line</code>).</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `SUM(quantity) and ROUND(AVG(quantity), 2) in one SELECT, from order_items.`,
        `SELECT SUM(quantity) AS units_sold, ROUND(AVG(quantity), 2) AS avg_per_line FROM order_items;`
      ],
      solution: `SELECT SUM(quantity) AS units_sold, ROUND(AVG(quantity), 2) AS avg_per_line FROM order_items;`,
      ordered: true
    },
    {
      id: 'sql-2-5-ex5',
      type: 'exercise',
      title: 'Challenge: profile the order lines',
      body: `<p>Build a one-row profile of <code>order_items</code> with <b>four columns</b>: <code>lines</code> (number of rows), <code>units</code> (sum of quantity), <code>avg_qty</code> (average quantity, rounded to 2 decimals) and <code>biggest_line</code> (the largest line total, quantity times unit price, rounded to 2 decimals).</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `You can use a calculation inside an aggregate: MAX(quantity * unit_price).`,
        `SELECT COUNT(*) AS lines, SUM(quantity) AS units, ROUND(AVG(quantity), 2) AS avg_qty, ROUND(MAX(quantity * unit_price), 2) AS biggest_line FROM order_items;`
      ],
      solution: `SELECT COUNT(*) AS lines, SUM(quantity) AS units, ROUND(AVG(quantity), 2) AS avg_qty, ROUND(MAX(quantity * unit_price), 2) AS biggest_line FROM order_items;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Summarise a whole table with <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code> and <code>MAX</code></li>
<li>Filter first with <code>WHERE</code>, then summarise, and define what your number <i>means</i> before you calculate it</li>
<li>Tell apart <code>COUNT(*)</code>, <code>COUNT(column)</code> and <code>COUNT(DISTINCT column)</code></li>
<li>Run a <b>tie-out</b> to check two tables agree</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is the difference between <code>COUNT(*)</code> and <code>COUNT(column)</code>?</li>
<li>How would you count unique customers in an orders table?</li>
<li>Can you use <code>WHERE COUNT(*) &gt; 5</code>? Why or why not?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> COUNT(*) counts all rows. COUNT(column) counts only the rows where that column is not NULL.</p>
<p><b>2.</b> <code>SELECT COUNT(DISTINCT customer_id) FROM orders;</code></p>
<p><b>3.</b> No. WHERE runs before the aggregate is calculated, so COUNT doesn’t exist yet. You filter on aggregates with HAVING, after grouping, which is in the next lesson.</p>
</details>
<p><b>Coming next, Lesson 2.6: GROUP BY and HAVING.</b> So far you get one answer for the whole table. Next you will get one answer <b>per group</b>: per country, per status, per payment method. This is where charts start to shine.</p>`
    }
  ]
},
{
  id: 'sql-2-6',
  track: 'sql',
  title: '2.6 GROUP BY and HAVING: answering “per” questions',
  tables: ['customers', 'products', 'orders', 'payments'],
  intro: `The CEO’s questions are getting more interesting: <i>“How many customers per country? How many orders in each status? Which payment method brings in the most money? Who are our most active customers?”</i><br><br>Notice the word <b>per</b>. Whenever a question has “per” or “by” or “each” in it, the answer is <b>GROUP BY</b>. This is the lesson where SQL becomes a genuine analysis tool, and where your results turn into charts.`,
  steps: [
    {
      type: 'explain',
      title: 'Sorting the receipts into piles',
      body: `<div class="callout analogy"><b>The big idea:</b> imagine tipping a bag of receipts onto a table and sorting them into <b>piles</b>, one pile per country. Then you total each pile. <code>GROUP BY</code> does exactly that: it splits the rows into groups, and your aggregate runs <b>once per group</b>.</div>
<p>The pattern is always:</p>
<p><code>SELECT the_group_column, an_aggregate FROM table GROUP BY the_group_column</code></p>`
    },
    {
      type: 'try',
      title: 'Customers per country',
      body: `<p>“How many customers per country?” Five piles, five counts. And because the second column is a number, a chart appeared automatically. Notice how much faster you see the story in the bars: Rwanda is the biggest market.</p>`,
      chart: 'bar',
      chartTitle: 'Customers per country',
      code: `SELECT country, COUNT(*) AS customers
FROM customers
GROUP BY country
ORDER BY customers DESC;`
    },
    {
      type: 'try',
      title: 'Orders per status',
      body: `<p>Four piles: Completed, Processing, Cancelled, Returned. This time the chart is a <b>pie</b>, which suits “share of the whole” questions. About three out of every four orders are completed. Use the dropdown above the chart to compare the chart types.</p>`,
      chart: 'pie',
      chartTitle: 'Share of orders by status',
      code: `SELECT order_status, COUNT(*) AS orders
FROM orders
GROUP BY order_status
ORDER BY orders DESC;`
    },
    {
      type: 'try',
      title: 'Several aggregates per group',
      body: `<p>You can calculate as many aggregates per group as you like. Here, for each payment method: the total, the number of payments and the average. The chart uses the first two columns (method and total).</p>`,
      chart: 'bar',
      chartTitle: 'Total payment amount by method',
      code: `SELECT payment_method,
       ROUND(SUM(amount), 2) AS total_amount,
       COUNT(*) AS payments,
       ROUND(AVG(amount), 2) AS avg_amount
FROM payments
GROUP BY payment_method
ORDER BY total_amount DESC;`
    },
    {
      type: 'explain',
      title: 'The golden rule of GROUP BY',
      body: `<div class="callout watch"><b>The rule:</b> every column in your SELECT must either be <b>in the GROUP BY</b> or <b>inside an aggregate</b>. Anything else is a column that can’t be summarised into a single value per pile.</div>
<p>What happens if you break the rule? It depends on the database. Some <b>refuse</b> with an error. SQLite <b>doesn’t complain</b>: it quietly picks a random row’s value. Let’s see why that’s dangerous.</p>`
    },
    {
      type: 'try',
      title: 'The silent trap',
      body: `<p>We asked for the country, a customer name, and a count, but we only grouped by country. Each country has hundreds of customers, so which name should it show? SQLite just picks one, and it means nothing. Someone reading this report might think “Diana Washington is the main customer in Ghana”, which is false.</p>
<div class="callout work"><b>In other databases:</b> PostgreSQL, SQL Server and Oracle give you an error here, which is helpful. SQLite and older MySQL stay quiet. The rule protects you in both cases.</div>`,
      code: `SELECT country, customer_name, COUNT(*) AS customers
FROM customers
GROUP BY country;`
    },
    {
      id: 'sql-2-6-c1',
      type: 'check',
      title: 'You write: SELECT country, customer_name, COUNT(*) FROM customers GROUP BY country. What does customer_name show?',
      body: `<p>Think about the piles of receipts.</p>`,
      options: ['The most frequent customer', 'The first customer alphabetically', 'An arbitrary customer from each country, so it is meaningless', 'The newest customer'],
      answer: 2,
      why: [
        'SQL has no idea which customer is “most frequent” unless you ask for it.',
        'Nothing sorts the names, so alphabetical order has nothing to do with it.',
        'Yes! There are hundreds of names in each pile and you gave SQL no way to choose, so it shows an arbitrary one. Never select a non-grouped, non-aggregated column.',
        'Nothing in the query talks about dates, so “newest” plays no role.'
      ]
    },
    {
      id: 'sql-2-6-ex1',
      type: 'exercise',
      title: 'Your turn: orders per status',
      body: `<p>Show each <code>order_status</code> and the number of orders in it (call it <code>total</code>), most common first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `GROUP BY order_status, with COUNT(*) AS total, then ORDER BY total DESC.`,
        `SELECT order_status, COUNT(*) AS total FROM orders GROUP BY order_status ORDER BY total DESC;`
      ],
      solution: `SELECT order_status, COUNT(*) AS total FROM orders GROUP BY order_status ORDER BY total DESC;`,
      ordered: true
    },
    {
      id: 'sql-2-6-ex2',
      type: 'exercise',
      title: 'Your turn: average price per category',
      body: `<p>Show each product <code>category</code> and its <b>average unit price rounded to 2 decimals</b> (call it <code>avg_price</code>), highest average first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `GROUP BY category, with ROUND(AVG(unit_price), 2).`,
        `SELECT category, ROUND(AVG(unit_price), 2) AS avg_price FROM products GROUP BY category ORDER BY avg_price DESC;`
      ],
      solution: `SELECT category, ROUND(AVG(unit_price), 2) AS avg_price FROM products GROUP BY category ORDER BY avg_price DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Grouping by more than one column',
      body: `<p>You can make piles inside piles. <code>GROUP BY payment_method, payment_status</code> makes one pile for each <i>combination</i>: Card and Paid, Card and Failed, Bank Transfer and Paid, and so on. Every column you add makes the piles smaller and more detailed.</p>`
    },
    {
      type: 'try',
      title: 'Method and status together',
      body: `<p>Sixteen piles: 4 methods times 4 statuses. This is how you’d spot, for example, that Bank Transfer has the most failed payments (124).</p>`,
      code: `SELECT payment_method, payment_status, COUNT(*) AS payments
FROM payments
GROUP BY payment_method, payment_status
ORDER BY payment_method, payment_status;`
    },
    {
      id: 'sql-2-6-ex3',
      type: 'exercise',
      title: 'Your turn: our most active customers',
      body: `<p>Show the <b>5 customers who placed the most orders</b>: <code>customer_id</code> and the number of orders (call it <code>orders</code>). Most orders first, with <code>customer_id</code> ascending as the tie-breaker.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `GROUP BY customer_id on the orders table, then sort by your count descending, then customer_id ascending, then LIMIT 5.`,
        `SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id ORDER BY orders DESC, customer_id ASC LIMIT 5;`
      ],
      solution: `SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id ORDER BY orders DESC, customer_id ASC LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'HAVING: filtering the piles',
      body: `<p>You know <code>WHERE</code> filters <b>rows</b>. What if you want to filter the <b>piles</b>, for example “only countries with more than 390 customers”? That count only exists <i>after</i> the grouping, so WHERE can’t see it. Use <code>HAVING</code>.</p>
<div class="callout tip"><b>How SQL actually runs your query</b> (this order explains a lot of mysteries):<br>
<b>1</b> FROM, <b>2</b> WHERE (filter rows), <b>3</b> GROUP BY (make piles), <b>4</b> aggregate, <b>5</b> HAVING (filter piles), <b>6</b> SELECT (build the columns and aliases), <b>7</b> ORDER BY, <b>8</b> LIMIT.<br>
That’s why WHERE can’t use an alias created in SELECT (it doesn’t exist yet), and why it can’t use COUNT(*) (not calculated yet).</div>`
    },
    {
      type: 'try',
      title: 'WHERE and HAVING together',
      body: `<p>Step by step: WHERE keeps only <b>Paid</b> payments. GROUP BY makes one pile per method. HAVING keeps only piles with more than 2,100 payments. Bank Transfer (2,080) falls out.</p>`,
      code: `SELECT payment_method, COUNT(*) AS paid_payments
FROM payments
WHERE payment_status = 'Paid'
GROUP BY payment_method
HAVING COUNT(*) > 2100
ORDER BY paid_payments DESC;`
    },
    {
      type: 'explain',
      title: 'The metric trap, returning with charts',
      body: `<p>Remember “which payment method earns the most?” Two questions are hiding in it: money from <b>all</b> payment records, or money actually <b>received</b>? Run both next, and watch the winner flip.</p>`
    },
    {
      type: 'try',
      title: 'Version 1: every payment record',
      body: `<p>Counting everything, <b>Mobile Money</b> comes out on top (about 405 million).</p>`,
      chart: 'bar',
      chartTitle: 'Total of all payment records, by method',
      code: `SELECT payment_method, ROUND(SUM(amount), 2) AS total_amount
FROM payments
GROUP BY payment_method
ORDER BY total_amount DESC;`
    },
    {
      type: 'try',
      title: 'Version 2: only money actually received',
      body: `<p>Counting only <b>Paid</b> payments, <b>Card</b> wins (about 339.5 million) and Mobile Money drops to second. Mobile Money looked best only because it also had more pending, failed or refunded payments. Which number you report changes the story. Always state your definition.</p>`,
      chart: 'bar',
      chartTitle: 'Money actually received, by method',
      code: `SELECT payment_method, ROUND(SUM(amount), 2) AS paid_total
FROM payments
WHERE payment_status = 'Paid'
GROUP BY payment_method
ORDER BY paid_total DESC;`
    },
    {
      id: 'sql-2-6-ex4',
      type: 'exercise',
      title: 'Your turn: where do payments fail?',
      body: `<p>For payments with the status <b>Failed</b>, show each <code>payment_method</code> and how many failed payments it has (call it <code>failed</code>), most failures first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `WHERE payment_status = 'Failed', then GROUP BY payment_method.`,
        `SELECT payment_method, COUNT(*) AS failed FROM payments WHERE payment_status = 'Failed' GROUP BY payment_method ORDER BY failed DESC;`
      ],
      solution: `SELECT payment_method, COUNT(*) AS failed FROM payments WHERE payment_status = 'Failed' GROUP BY payment_method ORDER BY failed DESC;`,
      ordered: true
    },
    {
      id: 'sql-2-6-ex5',
      type: 'exercise',
      title: 'Challenge: reachable customers per country',
      body: `<p>Marketing can only email customers who <b>have an email address</b>. Show each <code>country</code> and the number of customers with an email (call it <code>with_email</code>), but only countries with <b>more than 380</b>, biggest first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `COUNT(email) counts only customers with an email. Filter the groups with HAVING.`,
        `SELECT country, COUNT(email) AS with_email FROM customers GROUP BY country HAVING COUNT(email) > 380 ORDER BY with_email DESC;`
      ],
      solution: `SELECT country, COUNT(email) AS with_email FROM customers GROUP BY country HAVING COUNT(email) > 380 ORDER BY with_email DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Answer every “per” question with <code>GROUP BY</code>, and chart the result</li>
<li>Follow the golden rule: every selected column is grouped or aggregated</li>
<li>Group by several columns for finer detail</li>
<li>Filter groups with <code>HAVING</code>, and filter rows with <code>WHERE</code></li>
<li>Explain the order SQL runs a query in, and why aliases and aggregates aren’t visible to WHERE</li>
<li>Define your metric before reporting it</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>Write a query to find customers who have placed more than 10 orders.</li>
<li>What is the difference between <code>WHERE</code> and <code>HAVING</code>?</li>
<li>What happens if you select a column that is neither grouped nor aggregated?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> <code>SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id HAVING COUNT(*) &gt; 10;</code></p>
<p><b>2.</b> WHERE filters individual rows before grouping. HAVING filters groups after aggregates are calculated, so it can use COUNT, SUM and so on.</p>
<p><b>3.</b> In strict databases (PostgreSQL, SQL Server, Oracle) it is an error. In SQLite and older MySQL it silently returns an arbitrary value from the group, which is misleading, so you should never do it.</p>
</details>
<p><b>Coming next, Lesson 2.7: CASE WHEN.</b> Teaching SQL to make decisions: sorting customers into “High”, “Medium” and “Low” value, turning rows into columns, and calculating rates like “what percentage of payments failed?”</p>`
    }
  ]
}
);
