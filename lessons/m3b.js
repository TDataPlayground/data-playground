LESSONS.push(
{
  id: 'sql-3-4',
  track: 'sql',
  title: '3.4 Join traps: duplicates, fan-out and wrong totals',
  tables: ['orders', 'order_items', 'products', 'payments'],
  intro: `A scary thing about joins: <b>they almost never produce an error when they go wrong</b>. They just quietly give you a bigger, or smaller, number than the truth. A report with a wrong number looks exactly like a report with the right number, until someone makes a big decision with it.<br><br>This lesson is about the traps that catch even experienced analysts. By the end you will know how a join can inflate revenue by <b>171%</b>, how to prevent it, and why the 147 “duplicate” order lines in TradeFlow need <b>investigating</b>, not deleting.`,
  steps: [
    {
      type: 'explain',
      title: 'One-to-many: the join that multiplies rows',
      body: `<div class="callout analogy"><b>The big idea:</b> when one row on the left matches <b>several</b> rows on the right, the left row is <b>repeated</b> once for each match. Picture a restaurant bill: one table, three dishes. If you glue the table to its dishes, the table number appears <b>three times</b>.</div>
<p>This is normal and useful. But if the repeated row carries a <b>number</b> (like the bill total), and you then add up that number, it is counted three times instead of once. This is called a <b>fan-out</b>, and it is the number one cause of wrong totals in real reports.</p>`
    },
    {
      type: 'try',
      title: 'Watch the rows multiply',
      body: `<p>Orders: <b>10,000</b>. After joining each order to its items: <b>25,000</b> rows. Every order has about 2.5 item lines, so each order row was repeated for each of its lines. That alone isn’t wrong. But look what happens when you add up an <i>order-level</i> number now.</p>`,
      code: `SELECT COUNT(*) AS joined_rows
FROM orders o
JOIN order_items oi
  ON oi.order_id = o.order_id;`
    },
    {
      type: 'try',
      title: 'The inflated total',
      body: `<p>We joined <code>payments</code> to <code>order_items</code> and added up <code>p.amount</code>. The answer is <b>4,283,391,877.84</b>. The real total of all payments is <b>1,581,981,450.50</b>. Our number is <b>171% too big</b>.</p>
<p>What happened? Each payment belongs to <i>one order</i>, but that order has several item lines. Joining repeated the payment once per line, so every amount was added several times. <b>No error. No warning.</b> Just a very wrong number.</p>`,
      code: `SELECT ROUND(SUM(p.amount), 2) AS inflated_total
FROM payments p
JOIN order_items oi
  ON oi.order_id = p.order_id;`
    },
    {
      type: 'try',
      title: 'The honest total',
      body: `<p>Straight from the payments table, with no join: <b>1,581,981,450.50</b>. This is the number to trust, and the one to compare against.</p>`,
      code: `SELECT ROUND(SUM(amount), 2) AS true_total
FROM payments;`
    },
    {
      id: 'sql-3-4-c1',
      type: 'check',
      title: 'Each payment belongs to one order, and each order has 2 or 3 item lines. You join payments to order_items and SUM(amount). What goes wrong?',
      body: `<p>Think about how many times each payment row appears after the join.</p>`,
      options: ['Nothing, the join is correct', 'Each payment is repeated once per item line, so amounts are counted several times', 'Payments with no items disappear and the total is too low', 'SQL shows an error'],
      answer: 1,
      why: [
        'The join is valid SQL, but the total is wrong. That is what makes this trap dangerous.',
        'Yes! One payment row matched to 3 item rows becomes 3 rows, each carrying the full amount. A fan-out.',
        'Every order has items here, so nothing disappears. The problem is repetition, not loss.',
        'There is no error. The query is perfectly legal, and quietly wrong.'
      ]
    },
    {
      type: 'explain',
      title: 'Three ways to avoid the fan-out',
      body: `<ol>
<li><b>Don’t join if you don’t need to.</b> We only wanted the payment total, so we should have used the payments table alone.</li>
<li><b>Use the number from the right level.</b> If you join to item lines, sum a number that lives <i>on the item lines</i> (quantity times price), not a number from the order or payment.</li>
<li><b>Summarise first, join afterwards.</b> Total the many side down to one row per order before joining. (You will learn this properly with subqueries in the next module.)</li>
</ol>
<p>And a fourth habit that catches everything: <b>tie out</b>. Compare your total with a number you trust, as you did in Lesson 2.5. If the totals differ, stop and investigate.</p>`
    },
    {
      type: 'try',
      title: 'Counting after a join: rows are not orders',
      body: `<p>How many orders contain Electronics? Careful: the join to items produces one row <b>per item line</b>. <code>COUNT(*)</code> says <b>5,107</b>, but that counts lines, not orders. <code>COUNT(DISTINCT o.order_id)</code> counts each order once: <b>4,302</b>.</p>
<p>Whenever a join can repeat the thing you are counting, use <code>COUNT(DISTINCT ...)</code>.</p>`,
      code: `SELECT COUNT(*) AS item_lines,
       COUNT(DISTINCT o.order_id) AS orders_with_electronics
FROM orders o
JOIN order_items oi
  ON oi.order_id = o.order_id
JOIN products p
  ON p.product_id = oi.product_id
WHERE p.category = 'Electronics';`
    },
    {
      id: 'sql-3-4-ex1',
      type: 'exercise',
      title: 'Your turn: count the rows after a join',
      body: `<p>Return one number: how many rows you get when you <b>join orders to order_items</b>. Call it <code>joined_rows</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join the two tables on order_id, and COUNT(*).`,
        `SELECT COUNT(*) AS joined_rows FROM orders o JOIN order_items oi ON oi.order_id = o.order_id;`
      ],
      solution: `SELECT COUNT(*) AS joined_rows FROM orders o JOIN order_items oi ON oi.order_id = o.order_id;`,
      ordered: true
    },
    {
      id: 'sql-3-4-ex2',
      type: 'exercise',
      title: 'Your turn: how many orders had Electronics?',
      body: `<p>How many <b>different orders</b> contain at least one product from the <b>Electronics</b> category? Return one number called <code>orders_with_electronics</code>. Watch out for the fan-out!</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join orders, order_items and products, filter on the category, and count different order IDs.`,
        `SELECT COUNT(DISTINCT o.order_id) AS orders_with_electronics FROM orders o JOIN order_items oi ON oi.order_id = o.order_id JOIN products p ON p.product_id = oi.product_id WHERE p.category = 'Electronics';`
      ],
      solution: `SELECT COUNT(DISTINCT o.order_id) AS orders_with_electronics FROM orders o JOIN order_items oi ON oi.order_id = o.order_id JOIN products p ON p.product_id = oi.product_id WHERE p.category = 'Electronics';`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The second trap: “duplicates” in a key that should be unique',
      body: `<p>In Lesson 1.2 we mentioned that the pair (<code>order_id</code>, <code>product_id</code>) should appear only <b>once</b> in <code>order_items</code>, but 147 pairs repeat. Now you have the tools to look at them.</p>
<p>To find repeated combinations, group by the combination and keep the groups that appear more than once. You learned exactly this in Lesson 2.6.</p>`
    },
    {
      type: 'try',
      title: 'Find the repeated pairs',
      body: `<p>Each row is a product that appears <b>twice</b> in the same order (<code>times = 2</code>). In total there are <b>147</b> such pairs. Are these mistakes? Don’t decide yet. Look at one.</p>`,
      code: `SELECT order_id, product_id, COUNT(*) AS times
FROM order_items
GROUP BY order_id, product_id
HAVING COUNT(*) > 1
ORDER BY order_id, product_id
LIMIT 10;`
    },
    {
      type: 'try',
      title: 'Look at the evidence: order 6',
      body: `<p>Order 6 has product 60 on <b>two lines</b>: one line with quantity 2 and another with quantity 1. Same price, different quantities. That could be a customer who ordered 2, then added 1 more. These are <b>not</b> obvious copies.</p>
<p>In fact only <b>28</b> of the 147 pairs have exactly the same quantity and price (true copies). The rest differ.</p>`,
      code: `SELECT order_item_id, order_id, product_id, quantity, unit_price
FROM order_items
WHERE order_id = 6
ORDER BY product_id, order_item_id;`
    },
    {
      type: 'explain',
      title: 'Investigate before you delete',
      body: `<div class="callout tip"><b>The mature approach:</b> a repeated key is a <b>red flag</b>, not a verdict. Before deleting anything, ask three questions:
<ol>
<li><b>Are they exact copies,</b> or do other columns differ (like quantity)?</li>
<li><b>What does the business say?</b> Can a customer add the same product on two lines?</li>
<li><b>Do the numbers tie out?</b> If removing the rows makes your totals no longer match the payments, the rows are probably real.</li>
</ol></div>
<p>Remember from Lesson 2.5 that the order lines (all 25,000, repeats included) add up to <b>exactly</b> the payments total. That is strong evidence the payments were calculated <i>including</i> these lines. Whether to remove them from an analysis is a <b>business decision</b>: you document it, and you say clearly which choice you made and why.</p>
<div class="callout work"><b>At work:</b> this is where many careers are made. Anyone can run <code>DELETE</code>. The analyst who says “I found 147 repeated keys, 28 are exact copies, the rest differ in quantity, and the totals tie out only if I keep them, so I recommend we confirm with the sales team” earns trust.</div>`
    },
    {
      id: 'sql-3-4-ex3',
      type: 'exercise',
      title: 'Your turn: list the repeated pairs',
      body: `<p>Show <code>order_id</code>, <code>product_id</code> and how many times the pair appears (<code>times</code>), but only for pairs that appear <b>more than once</b>. Sort by <code>order_id</code> then <code>product_id</code>, and show the <b>first 5</b>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `GROUP BY order_id, product_id, then HAVING COUNT(*) > 1.`,
        `SELECT order_id, product_id, COUNT(*) AS times FROM order_items GROUP BY order_id, product_id HAVING COUNT(*) > 1 ORDER BY order_id, product_id LIMIT 5;`
      ],
      solution: `SELECT order_id, product_id, COUNT(*) AS times FROM order_items GROUP BY order_id, product_id HAVING COUNT(*) > 1 ORDER BY order_id, product_id LIMIT 5;`,
      ordered: true
    },
    {
      id: 'sql-3-4-ex4',
      type: 'exercise',
      title: 'Your turn: the fan-out factor',
      body: `<p>On average, how many item lines does an order have? That number is exactly how much a careless join multiplies your totals by. Return one number, <b>rounded to 2 decimals</b>, called <code>lines_per_order</code>: the number of rows in <code>order_items</code> divided by the number of different orders in it.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `COUNT(*) * 1.0 / COUNT(DISTINCT order_id), wrapped in ROUND( ..., 2 ).`,
        `SELECT ROUND(COUNT(*) * 1.0 / COUNT(DISTINCT order_id), 2) AS lines_per_order FROM order_items;`
      ],
      solution: `SELECT ROUND(COUNT(*) * 1.0 / COUNT(DISTINCT order_id), 2) AS lines_per_order FROM order_items;`,
      ordered: true
    },
    {
      id: 'sql-3-4-ex5',
      type: 'exercise',
      title: 'Challenge: the safe way to get revenue by order status',
      body: `<p>Get revenue by order status <b>without the payments table</b>, so there’s no fan-out risk. Join <code>order_items</code> to <code>orders</code>, and show each <code>order_status</code> and the sum of quantity times unit price (rounded to 2 decimals, called <code>revenue</code>), biggest first.</p>
<p><b>Then tie it out:</b> the four numbers should exactly match the payment totals by order status you saw in Lesson 3.1. If they do, the books balance.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Use the line amount from order_items: SUM(oi.quantity * oi.unit_price), joined to orders for the status.`,
        `SELECT o.order_status, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN orders o ON oi.order_id = o.order_id GROUP BY o.order_status ORDER BY revenue DESC;`
      ],
      solution: `SELECT o.order_status, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN orders o ON oi.order_id = o.order_id GROUP BY o.order_status ORDER BY revenue DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Recognise a <b>fan-out</b>: a one-to-many join repeating rows, and inflating totals without any error</li>
<li>Avoid it by not joining, using the number from the right level, or summarising first</li>
<li>Use <code>COUNT(DISTINCT ...)</code> when a join can repeat what you are counting</li>
<li>Find repeated keys with <code>GROUP BY ... HAVING COUNT(*) &gt; 1</code></li>
<li>Investigate before deleting: look at examples, ask the business, and tie out the totals</li>
<li>Always check row counts and compare against a trusted total</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>You join two tables and the sum of a column is much higher than expected. What is the most likely cause?</li>
<li>How do you find duplicate rows based on certain columns?</li>
<li>You find duplicates in a table. Should you delete them straight away?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A fan-out: the join repeats rows from one table (a one-to-many match), so the values are added several times. Check the row count before and after the join, and sum a value from the correct level.</p>
<p><b>2.</b> <code>SELECT col_a, col_b, COUNT(*) FROM table GROUP BY col_a, col_b HAVING COUNT(*) &gt; 1;</code></p>
<p><b>3.</b> No. First check whether they are exact copies or just share a key, understand what the business expects, and see whether totals reconcile. Then decide, document the decision, and ideally keep the original data untouched.</p>
</details>
<p><b>Coming next, Lesson 3.5: Self joins, cross joins and set operations.</b> A table joined to itself to catch duplicate names, a join that makes 300,000 rows by accident, and stacking and comparing lists with <code>UNION</code>, <code>INTERSECT</code> and <code>EXCEPT</code>.</p>`
    }
  ]
},
{
  id: 'sql-3-5',
  track: 'sql',
  title: '3.5 Self joins, cross joins and set operations',
  tables: ['customers', 'orders', 'regions', 'products', 'employees'],
  intro: `You now know the main joins. This lesson finishes Module 3 with <b>five more tools</b> that show up constantly in real work, and in interviews:<br><br>A table joined to <b>itself</b> (to catch two customers with the same name), a join that makes <b>every possible combination</b>, and three tools for working with <b>whole lists</b>: <code>UNION</code> (stack lists), <code>INTERSECT</code> (what two lists share) and <code>EXCEPT</code> (what is in one list but not the other).`,
  steps: [
    {
      type: 'explain',
      title: 'Self join: a table meets itself',
      body: `<div class="callout analogy"><b>The big idea:</b> sometimes the thing you want to compare lives <b>in the same table</b>. “Are there two customers with the same name?” To answer, you need to put the customers table next to a <i>second copy of itself</i> and match rows. It’s like photocopying the class register, laying the copy beside the original, and looking for students who share a name.</div>
<p>In SQL you simply use the same table twice, with two <b>different aliases</b> so SQL can tell the copies apart: <code>customers a</code> and <code>customers b</code>.</p>`
    },
    {
      type: 'try',
      title: 'Customers who share a name',
      body: `<p>Look at the three conditions in <code>ON</code>: same name, <b>and</b> <code>a.customer_id &lt; b.customer_id</code>. That last one is the clever bit. Without it, every customer would match <b>themselves</b>, and every pair would appear <b>twice</b> (A with B, and B with A). Next you’ll see exactly how many.</p>
<p>The result: 25 pairs of different customers with identical names, such as <b>Andrew Green</b> (customers 1008 and 1748).</p>`,
      code: `SELECT a.customer_id AS id_1,
       b.customer_id AS id_2,
       a.customer_name
FROM customers a
JOIN customers b
  ON a.customer_name = b.customer_name
 AND a.customer_id < b.customer_id
ORDER BY a.customer_name, id_1, id_2
LIMIT 10;`
    },
    {
      type: 'try',
      title: 'Why the “less than” matters: three counts',
      body: `<p>Three versions of the same self join, counting the matching pairs:</p>
<ul>
<li>No extra condition: <b>2,050</b>. Includes all 2,000 customers matching <i>themselves</i>, plus every pair twice.</li>
<li>With <code>&lt;&gt;</code> (not equal): <b>50</b>. No self-matches, but every pair appears twice, once each way.</li>
<li>With <code>&lt;</code>: <b>25</b>. Each pair exactly once.</li>
</ul>
<p>Spot the pattern: 2,000 + 50 = 2,050, and 50 ÷ 2 = 25. The <code>&lt;</code> trick is what professionals use.</p>`,
      code: `SELECT
  (SELECT COUNT(*) FROM customers a JOIN customers b
     ON a.customer_name = b.customer_name) AS no_condition,
  (SELECT COUNT(*) FROM customers a JOIN customers b
     ON a.customer_name = b.customer_name AND a.customer_id <> b.customer_id) AS not_equal,
  (SELECT COUNT(*) FROM customers a JOIN customers b
     ON a.customer_name = b.customer_name AND a.customer_id < b.customer_id) AS less_than;`
    },
    {
      id: 'sql-3-5-c1',
      type: 'check',
      title: 'In a self join to find pairs, why add a.id < b.id?',
      body: `<p>Think about what happens to each pair, and each row matching itself.</p>`,
      options: ['To make the query faster', 'To avoid a row matching itself and each pair appearing twice (A with B and B with A)', 'Because SQL requires it in a self join', 'To sort the results'],
      answer: 1,
      why: [
        'Speed is not the point. The point is correctness: removing self-matches and mirror pairs.',
        'Yes! With less-than, every pair appears exactly once, and a row can never pair with itself.',
        'SQL doesn’t require it. Without it you simply get duplicates and self-matches.',
        'It doesn’t sort anything. ORDER BY does that.'
      ]
    },
    {
      id: 'sql-3-5-ex1',
      type: 'exercise',
      title: 'Your turn: find the name twins',
      body: `<p>Show the <b>first 5 pairs</b> of customers with the same name: <code>id_1</code>, <code>id_2</code> and <code>customer_name</code>, sorted by <code>customer_name</code>, then <code>id_1</code>, then <code>id_2</code>. Each pair must appear only once.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join customers a to customers b on the same name and a.customer_id < b.customer_id.`,
        `SELECT a.customer_id AS id_1, b.customer_id AS id_2, a.customer_name FROM customers a JOIN customers b ON a.customer_name = b.customer_name AND a.customer_id < b.customer_id ORDER BY a.customer_name, id_1, id_2 LIMIT 5;`
      ],
      solution: `SELECT a.customer_id AS id_1, b.customer_id AS id_2, a.customer_name FROM customers a JOIN customers b ON a.customer_name = b.customer_name AND a.customer_id < b.customer_id ORDER BY a.customer_name, id_1, id_2 LIMIT 5;`,
      ordered: true
    },
    {
      id: 'sql-3-5-ex2',
      type: 'exercise',
      title: 'Challenge: repeat customers in a hurry',
      body: `<p>Marketing wants to know how often a customer orders again <b>within a week</b>. Join <code>orders</code> to itself (<code>o1</code> and <code>o2</code>) on the same <code>customer_id</code>, where the second order’s date is <b>after</b> the first order’s date and <b>no more than 7 days later</b> (use <code>date(o1.order_date, '+7 days')</code>). Return the number of such pairs as <code>pairs_within_7_days</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `ON o1.customer_id = o2.customer_id AND o2.order_date > o1.order_date AND o2.order_date <= date(o1.order_date, '+7 days'), then COUNT(*).`,
        `SELECT COUNT(*) AS pairs_within_7_days FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o2.order_date > o1.order_date AND o2.order_date <= date(o1.order_date, '+7 days');`
      ],
      solution: `SELECT COUNT(*) AS pairs_within_7_days FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o2.order_date > o1.order_date AND o2.order_date <= date(o1.order_date, '+7 days');`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Cross join: every combination',
      body: `<p>A <code>CROSS JOIN</code> pairs <b>every row</b> of one table with <b>every row</b> of another, with no matching rule at all. Think of a menu: 3 starters and 4 mains give <b>12</b> possible meals.</p>
<p>It has real uses (building a grid of every country and category, for example). But it is also what you get <b>by accident</b> if you join two tables and forget the matching rule. Run the next card to feel the danger.</p>`
    },
    {
      type: 'try',
      title: 'The accidental explosion',
      body: `<p>2,000 customers times 150 products is <b>300,000</b> rows, from two small tables. Now imagine two tables with 1 million rows each: a trillion rows, and a query that never finishes. <b>If a query is mysteriously slow or enormous, check that every JOIN has its ON.</b></p>`,
      code: `SELECT COUNT(*) AS combinations
FROM customers
CROSS JOIN products;`
    },
    {
      type: 'try',
      title: 'A useful cross join: the full grid',
      body: `<p>Every country with every product category: <b>25 combinations</b> (5 times 5). Real analysts build a grid like this, then LEFT JOIN their results onto it, so that combinations with <b>no sales</b> still appear as zero instead of vanishing.</p>
<p>(The two bracketed pieces are “mini tables made on the spot”. That is a <b>subquery</b>, the topic of the next module. Just read it as: <i>the list of countries</i> times <i>the list of categories</i>.)</p>`,
      code: `SELECT c.country, p.category
FROM (SELECT DISTINCT country FROM customers) c
CROSS JOIN (SELECT DISTINCT category FROM products) p
ORDER BY c.country, p.category;`
    },
    {
      type: 'explain',
      title: 'Set operations: working with whole lists',
      body: `<p>Joins put tables <b>side by side</b>. Set operations stack query results <b>on top of each other</b>, like combining guest lists.</p>
<ul>
<li><code>UNION</code>: stack two lists and <b>remove repeats</b></li>
<li><code>UNION ALL</code>: stack two lists and <b>keep everything</b> (faster)</li>
<li><code>INTERSECT</code>: only the rows that appear in <b>both</b> lists</li>
<li><code>EXCEPT</code>: rows in the <b>first</b> list that are <b>not</b> in the second</li>
</ul>
<div class="callout watch"><b>The rules:</b> both queries must return the <b>same number of columns</b>, in compatible types. The column names come from the first query. And <code>ORDER BY</code> goes once, at the very end.</div>`
    },
    {
      type: 'try',
      title: 'UNION: stacked, with repeats removed',
      body: `<p>Countries from the customers table stacked on top of countries from the regions table. <code>UNION</code> removes the repeats, leaving just the <b>5</b> distinct countries.</p>`,
      code: `SELECT country FROM customers
UNION
SELECT country FROM regions;`
    },
    {
      type: 'try',
      title: 'UNION ALL: stacked, everything kept',
      body: `<p>The same two lists, but every row is kept: <b>2,050</b> rows (2,000 customers plus 50 regions). Look at the bottom of the row count. <code>UNION ALL</code> is faster because it skips the work of finding repeats, so use it whenever you know there are no repeats, or you want them.</p>
<div class="callout work"><b>Interview favourite:</b> “What is the difference between UNION and UNION ALL?” Answer: UNION removes duplicates (slower), UNION ALL keeps them (faster).</div>`,
      code: `SELECT country FROM customers
UNION ALL
SELECT country FROM regions;`
    },
    {
      type: 'try',
      title: 'INTERSECT: who did both?',
      body: `<p>Customers who have had <b>both</b> a Cancelled order <b>and</b> a Returned order: <b>109</b> customers. Each query makes a list of customer IDs, and INTERSECT keeps the IDs that are in both. A sharp question for a customer-care team: these customers may be unhappy.</p>`,
      code: `SELECT customer_id FROM orders WHERE order_status = 'Cancelled'
INTERSECT
SELECT customer_id FROM orders WHERE order_status = 'Returned'
ORDER BY customer_id;`
    },
    {
      type: 'try',
      title: 'EXCEPT: who ordered, but never completed?',
      body: `<p>The first list is every customer who placed any order. The second is customers with a Completed order. <code>EXCEPT</code> keeps the first list <b>minus</b> the second: <b>37</b> customers who ordered but never had a single order completed.</p>`,
      code: `SELECT customer_id FROM orders
EXCEPT
SELECT customer_id FROM orders WHERE order_status = 'Completed'
ORDER BY customer_id;`
    },
    {
      id: 'sql-3-5-c2',
      type: 'check',
      title: 'You want to combine two lists of emails and avoid sending the same person two emails. Which do you use?',
      body: `<p>Think about repeats.</p>`,
      options: ['UNION ALL', 'UNION', 'INTERSECT', 'CROSS JOIN'],
      answer: 1,
      why: [
        'UNION ALL keeps every row, including repeats, so someone on both lists would get two emails.',
        'Yes! UNION stacks the lists and removes repeated rows, so each address appears once.',
        'INTERSECT would give only people on both lists, which isn’t what you want.',
        'A CROSS JOIN pairs every row with every row, which is not stacking at all.'
      ]
    },
    {
      id: 'sql-3-5-ex3',
      type: 'exercise',
      title: 'Your turn: the unhappy customers',
      body: `<p>Show the <code>customer_id</code> of customers who have had <b>both</b> a <b>Cancelled</b> and a <b>Returned</b> order, sorted by <code>customer_id</code>. Use <code>INTERSECT</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Two SELECT customer_id queries on orders, one for each status, joined by INTERSECT, with ORDER BY at the very end.`,
        `SELECT customer_id FROM orders WHERE order_status = 'Cancelled' INTERSECT SELECT customer_id FROM orders WHERE order_status = 'Returned' ORDER BY customer_id;`
      ],
      solution: `SELECT customer_id FROM orders WHERE order_status = 'Cancelled' INTERSECT SELECT customer_id FROM orders WHERE order_status = 'Returned' ORDER BY customer_id;`,
      ordered: true
    },
    {
      id: 'sql-3-5-ex4',
      type: 'exercise',
      title: 'Your turn: ordered, but never completed',
      body: `<p>Show the <code>customer_id</code> of customers who placed <b>at least one order</b> but have <b>no Completed order</b>, sorted by <code>customer_id</code>. Use <code>EXCEPT</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `The first list is all customer_ids in orders. The second is customer_ids where order_status is Completed. Put EXCEPT between them.`,
        `SELECT customer_id FROM orders EXCEPT SELECT customer_id FROM orders WHERE order_status = 'Completed' ORDER BY customer_id;`
      ],
      solution: `SELECT customer_id FROM orders EXCEPT SELECT customer_id FROM orders WHERE order_status = 'Completed' ORDER BY customer_id;`,
      ordered: true
    },
    {
      id: 'sql-3-5-ex5',
      type: 'exercise',
      title: 'Challenge: colleagues in the same region',
      body: `<p>Self join <code>employees</code> to find pairs of <b>different employees who work in the same region</b>. Return the <b>number of pairs</b>, counting each pair once, as <code>colleague_pairs</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join employees e1 to employees e2 on the same region_id, with e1.employee_id < e2.employee_id, then COUNT(*).`,
        `SELECT COUNT(*) AS colleague_pairs FROM employees e1 JOIN employees e2 ON e1.region_id = e2.region_id AND e1.employee_id < e2.employee_id;`
      ],
      solution: `SELECT COUNT(*) AS colleague_pairs FROM employees e1 JOIN employees e2 ON e1.region_id = e2.region_id AND e1.employee_id < e2.employee_id;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Module 3 complete: you can connect the whole database',
      body: `<p>In five lessons you went from one table to the entire TradeFlow database. You can now:</p>
<ul>
<li>Connect tables with <code>INNER JOIN</code> and <code>LEFT JOIN</code>, and find what is missing with the anti-join</li>
<li>Chain three, four or more tables by following the key path</li>
<li>Avoid the fan-out, count with <code>DISTINCT</code>, and investigate duplicates before deleting</li>
<li>Join a table to itself, and know why <code>&lt;</code> matters</li>
<li>Build every combination with <code>CROSS JOIN</code>, and stack and compare lists with <code>UNION</code>, <code>INTERSECT</code> and <code>EXCEPT</code></li>
<li>Tie out your totals, and question the numbers that look too good</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is a self join, and when would you use one?</li>
<li>What happens if you forget the ON condition in a join?</li>
<li>What is the difference between <code>INTERSECT</code> and an <code>INNER JOIN</code>?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Joining a table to itself using two aliases. It is used to compare rows within the same table: finding duplicates, comparing an employee to their manager, or finding events close together in time.</p>
<p><b>2.</b> You get a Cartesian product: every row of one table paired with every row of the other (a 2,000-row and a 150-row table give 300,000 rows). It is a common cause of slow, enormous results.</p>
<p><b>3.</b> INTERSECT compares whole rows from two queries and returns the ones that appear in both (with duplicates removed). An INNER JOIN combines columns from two tables side by side based on a matching rule. They can answer similar questions, but they are different operations.</p>
</details>
<p><b>Coming next, Module 4: Subqueries and nested logic.</b> You have already had little previews of “a query inside a query”. Now you will master it: asking one question inside another, comparing each row to an average, and the powerful <code>EXISTS</code>. It is also the doorway to CTEs.</p>`
    }
  ]
}
);
