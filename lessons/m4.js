LESSONS.push(
{
  id: 'sql-4-1',
  track: 'sql',
  title: '4.1 A query inside a query: scalar subqueries and IN',
  tables: ['customers', 'products', 'orders', 'payments'],
  intro: `Your manager asks: <i>“Which products cost more than our average product?”</i><br><br>To answer that, you must <b>first</b> know the average, and <b>then</b> compare every product to it. That is two questions, and the second one depends on the answer to the first. In SQL, you can put the first question <b>inside</b> the second, in brackets. That is a <b>subquery</b>, and it lets you answer questions that no single flat query can.`,
  steps: [
    {
      type: 'explain',
      title: 'Ask the small question first',
      body: `<div class="callout analogy"><b>The big idea:</b> a <b>subquery</b> is a query inside brackets, inside another query. Think of a teacher saying: <i>“List every student who scored above the class average.”</i> To do that, she first works out the class average (the small question), then she walks down the list comparing every score to it (the big question).</div>
<p>SQL does the same. <b>The inner query (in brackets) runs first.</b> Its answer is then handed to the outer query, as if you had typed it in yourself.</p>`
    },
    {
      type: 'try',
      title: 'Step 1: the small question on its own',
      body: `<p>The average product price is <b>20,964.49</b>. This is the answer the inner query will hand to the outer one.</p>`,
      code: `SELECT ROUND(AVG(unit_price), 2) AS avg_price
FROM products;`
    },
    {
      type: 'try',
      title: 'Step 2: put it inside the big question',
      body: `<p>Look at the part in brackets: that is the small question from Step 1. SQL works out the average, then keeps only the products priced above it. <b>59 products</b> are above average (we show the top 10). If prices change tomorrow, this query adjusts itself. You never typed the number 20,964.49.</p>`,
      code: `SELECT product_name, unit_price
FROM products
WHERE unit_price > (SELECT AVG(unit_price) FROM products)
ORDER BY unit_price DESC, product_id
LIMIT 10;`
    },
    {
      id: 'sql-4-1-c1',
      type: 'check',
      title: 'In a query with a subquery in brackets, which part does SQL run first?',
      body: `<p>Think about the teacher and the class average.</p>`,
      options: ['The outer query', 'The inner query in brackets', 'Both at exactly the same time', 'It depends on which is longer'],
      answer: 1,
      why: [
        'The outer query needs the inner answer before it can do its job, so it must wait.',
        'Yes! The inner query runs first, and its result is passed to the outer query.',
        'The outer query depends on the inner result, so they cannot run at the same time.',
        'Length has nothing to do with it. The dependency decides the order.'
      ]
    },
    {
      type: 'explain',
      title: 'The rule: a scalar subquery returns exactly one value',
      body: `<p>When you compare with <code>&gt;</code> or <code>=</code>, the inner query must return <b>one single value</b> (one row, one column). That is called a <b>scalar subquery</b>. “Scalar” just means “one value”.</p>
<div class="callout watch"><b>Watch out: what if it returns many?</b> Most databases (PostgreSQL, SQL Server, Oracle) <b>stop with an error</b>. SQLite <b>doesn’t</b>: it quietly picks one row and carries on. Run the next card and see why that’s dangerous.</div>`
    },
    {
      type: 'try',
      title: 'The silent wrong answer',
      body: `<p>The inner query asks for the price of <b>every</b> product (150 rows), not one. SQLite doesn’t complain. It uses a single arbitrary row (here, the first price, 52,539) and reports <b>12</b> products above it. The number looks perfectly normal, and it answers a question nobody asked.</p>
<p>The fix is to make the inner query return exactly one value, like <code>AVG(...)</code>, <code>MAX(...)</code>, or a lookup of one specific row.</p>`,
      code: `SELECT COUNT(*) AS products_found
FROM products
WHERE unit_price > (SELECT unit_price FROM products);`
    },
    {
      id: 'sql-4-1-ex1',
      type: 'exercise',
      title: 'Your turn: above-average products',
      body: `<p>Return one number: how many products have a <code>unit_price</code> <b>above the average</b> unit price? Call it <code>above_average</code>. Use a subquery for the average.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `COUNT(*) from products, with WHERE unit_price > ( a subquery that returns AVG(unit_price) ).`,
        `SELECT COUNT(*) AS above_average FROM products WHERE unit_price > (SELECT AVG(unit_price) FROM products);`
      ],
      solution: `SELECT COUNT(*) AS above_average FROM products WHERE unit_price > (SELECT AVG(unit_price) FROM products);`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Share of the total: a subquery in SELECT',
      body: `<p>A scalar subquery can also sit inside the <code>SELECT</code> list. A classic use is a <b>percentage of the total</b>: each group’s count, divided by the grand total. The grand total is a one-value question, so it fits perfectly inside brackets.</p>
<p>You will use this pattern in real reports all the time: “what percentage of our customers are in each country?”</p>`
    },
    {
      type: 'try',
      title: 'Customers by country, with their share',
      body: `<p>Rwanda holds <b>21.9%</b> of customers, South Africa <b>18.9%</b>. The inner <code>(SELECT COUNT(*) FROM customers)</code> gives 2,000, and every country’s count is divided by it. Remember the <code>100.0</code> with the decimal point, from Lesson 2.4.</p>`,
      chart: 'pie',
      chartTitle: 'Customers by country',
      code: `SELECT country,
       COUNT(*) AS customers,
       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM customers), 1) AS pct
FROM customers
GROUP BY country
ORDER BY customers DESC;`
    },
    {
      id: 'sql-4-1-ex2',
      type: 'exercise',
      title: 'Your turn: just above average',
      body: `<p>The average payment amount is about 158,198. Show <code>payment_id</code> and <code>amount</code> for the <b>5 smallest payments that are still above the average payment</b>, smallest first, with <code>payment_id</code> as the tie-breaker.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `WHERE amount > (SELECT AVG(amount) FROM payments), then ORDER BY amount ASC, payment_id and LIMIT 5.`,
        `SELECT payment_id, amount FROM payments WHERE amount > (SELECT AVG(amount) FROM payments) ORDER BY amount ASC, payment_id LIMIT 5;`
      ],
      solution: `SELECT payment_id, amount FROM payments WHERE amount > (SELECT AVG(amount) FROM payments) ORDER BY amount ASC, payment_id LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'IN with a subquery: a list built on the fly',
      body: `<p>You already know <code>IN ('Kenya', 'Ghana')</code>. But what if the list is <b>too long to type</b>, or changes every day? Let a subquery build the list.</p>
<p>Think of a doorman with a guest list that is <b>written fresh every evening</b> by another query. “Is this person on tonight’s list?” That is <code>customer_id IN (SELECT ...)</code>. And unlike a join, it never repeats rows, even if a customer appears on the list ten times.</p>`
    },
    {
      type: 'try',
      title: 'Customers who ordered in 2026',
      body: `<p>The inner query makes a list of customer IDs from 2026 orders. The outer query keeps customers on that list. In total, <b>1,006</b> customers ordered in 2026 (we show the first 10).</p>`,
      code: `SELECT customer_id, customer_name
FROM customers
WHERE customer_id IN (SELECT customer_id
                      FROM orders
                      WHERE order_date >= '2026-01-01')
ORDER BY customer_id
LIMIT 10;`
    },
    {
      id: 'sql-4-1-ex3',
      type: 'exercise',
      title: 'Your turn: customers with a cancellation',
      body: `<p>Show <code>customer_id</code> and <code>customer_name</code> for customers who have at least one <b>Cancelled</b> order, sorted by <code>customer_id</code>. Show the first 10. Use <code>IN</code> with a subquery.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `WHERE customer_id IN (SELECT customer_id FROM orders WHERE order_status = 'Cancelled').`,
        `SELECT customer_id, customer_name FROM customers WHERE customer_id IN (SELECT customer_id FROM orders WHERE order_status = 'Cancelled') ORDER BY customer_id LIMIT 10;`
      ],
      solution: `SELECT customer_id, customer_name FROM customers WHERE customer_id IN (SELECT customer_id FROM orders WHERE order_status = 'Cancelled') ORDER BY customer_id LIMIT 10;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The NOT IN trap: one empty cell ruins everything',
      body: `<div class="callout watch"><b>The most famous SQL trap with subqueries:</b> <code>NOT IN</code> and <b>NULL</b> do not get along. If the list from the subquery contains even <b>one empty value</b>, <code>NOT IN</code> returns <b>no rows at all</b>.</div>
<p>Why? Remember from Lesson 1.3: comparing anything to NULL gives “unknown”. <code>x NOT IN (a, b, NULL)</code> means “x is not a, and not b, and not unknown”. SQL can never be sure about the “unknown” part, so it never says yes.</p>
<p>Let’s see it with real data. Question: <i>how many customers have an email that is not used by a Ghana customer?</i> Some Ghana customers have no email, so the list contains NULLs.</p>`
    },
    {
      type: 'try',
      title: 'The trap: the answer is zero',
      body: `<p><b>0</b>. Obviously wrong, since there are 1,564 customers outside Ghana with an email. And no error message. Thirteen Ghana customers have an empty email, those NULLs entered the list, and <code>NOT IN</code> collapsed.</p>`,
      code: `SELECT COUNT(*) AS customers_found
FROM customers
WHERE email NOT IN (SELECT email
                    FROM customers
                    WHERE country = 'Ghana');`
    },
    {
      type: 'try',
      title: 'The fix: keep NULLs out of the list',
      body: `<p>Add <code>AND email IS NOT NULL</code> inside the subquery, so the list has no empty values. Now the answer is <b>1,564</b>, the correct count.</p>
<div class="callout tip"><b>Two safe habits:</b> (1) always filter NULLs out of the list when you use <code>NOT IN</code>, or (2) use <code>NOT EXISTS</code>, which is immune to this trap. You will learn it in the next lesson.</div>`,
      code: `SELECT COUNT(*) AS customers_found
FROM customers
WHERE email NOT IN (SELECT email
                    FROM customers
                    WHERE country = 'Ghana'
                      AND email IS NOT NULL);`
    },
    {
      id: 'sql-4-1-c2',
      type: 'check',
      title: 'You run x NOT IN (SELECT ...) and get zero rows, even though you are sure matches exist. What is the most likely cause?',
      body: `<p>Think about empty values in the list.</p>`,
      options: ['The subquery list contains a NULL', 'The table is too large', 'NOT IN only works with numbers', 'You forgot the semicolon'],
      answer: 0,
      why: [
        'Yes! One NULL in the list makes “not in the list” impossible to confirm, so NOT IN returns nothing. Filter NULLs out, or use NOT EXISTS.',
        'Size is not the issue. The problem is a NULL in the list.',
        'NOT IN works with text too. That is not the reason.',
        'A missing semicolon would cause an error, not a quiet zero.'
      ]
    },
    {
      id: 'sql-4-1-ex4',
      type: 'exercise',
      title: 'Your turn: the safe NOT IN',
      body: `<p>Write the <b>safe</b> version: return one number, <code>customers_found</code>, counting customers whose email is <b>not</b> in the list of emails used by <b>Ghana</b> customers. Make sure NULLs can’t sneak into the list.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Inside the brackets, select emails from Ghana customers and add AND email IS NOT NULL.`,
        `SELECT COUNT(*) AS customers_found FROM customers WHERE email NOT IN (SELECT email FROM customers WHERE country = 'Ghana' AND email IS NOT NULL);`
      ],
      solution: `SELECT COUNT(*) AS customers_found FROM customers WHERE email NOT IN (SELECT email FROM customers WHERE country = 'Ghana' AND email IS NOT NULL);`,
      ordered: true
    },
    {
      id: 'sql-4-1-ex5',
      type: 'exercise',
      title: 'Challenge: what share of payments are Paid?',
      body: `<p>What <b>percentage of all payments</b> have the status <b>Paid</b>? Return one number, rounded to 1 decimal, called <code>paid_pct</code>. Count the Paid payments, and divide by the total number of payments using a subquery for the total.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `100.0 * COUNT(*) / (SELECT COUNT(*) FROM payments), with a WHERE on payment_status = 'Paid'.`,
        `SELECT ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM payments), 1) AS paid_pct FROM payments WHERE payment_status = 'Paid';`
      ],
      solution: `SELECT ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM payments), 1) AS paid_pct FROM payments WHERE payment_status = 'Paid';`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Put a query inside brackets inside another, knowing the <b>inner one runs first</b></li>
<li>Use a <b>scalar subquery</b> (exactly one value) to compare against an average or a total</li>
<li>Build a percentage of the total with a subquery in the SELECT</li>
<li>Use <code>IN (SELECT ...)</code> for lists built on the fly</li>
<li>Avoid the <code>NOT IN</code> and NULL trap</li>
<li>Know that SQLite quietly accepts a many-row scalar subquery, while other databases refuse</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is a subquery, and which part runs first?</li>
<li>Why can <code>NOT IN (SELECT ...)</code> return no rows when matches clearly exist?</li>
<li>How would you find all products priced above the average price?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A subquery is a query nested inside another query. The inner query runs first, and its result is used by the outer query.</p>
<p><b>2.</b> If the subquery’s list contains a NULL, the comparison becomes “unknown” for every row, so no row passes. Filter NULLs out of the list or use NOT EXISTS.</p>
<p><b>3.</b> <code>SELECT * FROM products WHERE unit_price &gt; (SELECT AVG(unit_price) FROM products);</code></p>
</details>
<p><b>Coming next, Lesson 4.2: EXISTS and correlated subqueries.</b> So far the inner query ran once. Next it will run <b>once for every row</b> of the outer query, asking a fresh question about each customer. It is one of the most loved (and most asked-about) tools in interviews.</p>`
    }
  ]
},
{
  id: 'sql-4-2',
  track: 'sql',
  title: '4.2 EXISTS and correlated subqueries',
  tables: ['customers', 'orders', 'order_items', 'products', 'payments', 'deliveries'],
  intro: `Until now the inner query ran <b>once</b>, and gave one answer for everybody. But what if the question changes <b>for every customer</b>: <i>“Has THIS customer ever cancelled an order?”</i> The answer is different for each person.<br><br>That needs a subquery that <b>looks at the current row</b> of the outer query. It is called a <b>correlated subquery</b>, and its best friend is <b>EXISTS</b>. Together they solve a whole family of “has this thing got any...” questions, safely and cleanly.`,
  steps: [
    {
      type: 'explain',
      title: 'EXISTS: “is there at least one?”',
      body: `<div class="callout analogy"><b>The big idea:</b> <code>EXISTS</code> asks a yes/no question: <b>“is there at least one matching row?”</b> It doesn’t care <i>how many</i>, only whether there is any. Like asking a librarian: “Do you have <i>any</i> copy of this book?” She doesn’t count them. She checks the shelf and says yes or no, and stops looking as soon as she finds one.</div>
<p>The shape: <code>WHERE EXISTS (SELECT 1 FROM other_table WHERE ...)</code>. The <code>SELECT 1</code> is a habit: since EXISTS only cares whether a row exists, we don’t need to pick any real columns.</p>`
    },
    {
      type: 'try',
      title: 'Customers who have cancelled an order',
      body: `<p>Look carefully at the part inside the brackets: <code>o.customer_id = c.customer_id</code>. The inner query mentions <code>c</code>, the table from the <b>outer</b> query. That link is what makes it <b>correlated</b>: for every customer, SQL asks “does <i>this</i> customer have a Cancelled order?”</p>
<p>The total is <b>457</b> customers (we show the first 10). Notice that there is no <code>DISTINCT</code> needed: a customer with 5 cancellations still appears once, because EXISTS only asks yes or no.</p>`,
      code: `SELECT c.customer_id, c.customer_name
FROM customers c
WHERE EXISTS (SELECT 1
              FROM orders o
              WHERE o.customer_id = c.customer_id
                AND o.order_status = 'Cancelled')
ORDER BY c.customer_id
LIMIT 10;`
    },
    {
      type: 'explain',
      title: 'Correlated means “remembers the current row”',
      body: `<p>Picture a teacher going down the class register. For each student she asks the same question, but <b>about that particular student</b>: <i>“Does this student have an exam script in the pile?”</i> The question is identical, the answer depends on the student in front of her.</p>
<p>That is a <b>correlated subquery</b>: the inner query uses a value from the current row of the outer query. Think of it as the inner query being run again for each outer row (databases are clever and optimise this behind the scenes).</p>`
    },
    {
      type: 'try',
      title: 'NOT EXISTS: the safe way to find the missing',
      body: `<p>Put <code>NOT</code> in front, and you get the <b>18 customers who never ordered</b>, the same 18 you met in Lessons 1.2 and 3.2. This is the third way to find them. Which one should you use?</p>`,
      code: `SELECT c.customer_id, c.customer_name
FROM customers c
WHERE NOT EXISTS (SELECT 1
                  FROM orders o
                  WHERE o.customer_id = c.customer_id)
ORDER BY c.customer_id;`
    },
    {
      type: 'explain',
      title: 'Three ways to find “what is missing”',
      body: `<table class="mini"><tr><th>Method</th><th>Safe with NULLs?</th><th>Verdict</th></tr>
<tr><td><code>NOT IN (SELECT ...)</code></td><td>No. One NULL breaks it</td><td>Avoid, unless you filter NULLs</td></tr>
<tr><td><code>LEFT JOIN ... IS NULL</code></td><td>Yes</td><td>Great, and easy to extend with more columns</td></tr>
<tr><td><code>NOT EXISTS</code></td><td>Yes</td><td>Great, and reads like plain English</td></tr></table>
<p>Many professionals prefer <code>NOT EXISTS</code> or <code>LEFT JOIN</code> for exactly this reason. And there is another advantage of <code>EXISTS</code>: it <b>never repeats rows</b>, because it only asks yes or no.</p>`
    },
    {
      id: 'sql-4-2-c1',
      type: 'check',
      title: 'A customer has 5 Cancelled orders. How many times does that customer appear in a WHERE EXISTS (...) query on the customers table?',
      body: `<p>EXISTS asks only “is there at least one?”</p>`,
      options: ['5 times, once per cancelled order', 'Once', 'Zero times', 'It depends on the sort order'],
      answer: 1,
      why: [
        'That would happen with a JOIN, which repeats the customer for every match. EXISTS does not.',
        'Yes! EXISTS only asks whether at least one match exists. The customer row is kept once, however many matches there are.',
        'They do have cancelled orders, so the answer is yes, and the row is kept.',
        'Sorting happens after filtering, and it doesn’t change how many times a row appears.'
      ]
    },
    {
      id: 'sql-4-2-ex1',
      type: 'exercise',
      title: 'Your turn: orders that were never delivered',
      body: `<p>Using <code>NOT EXISTS</code>, return one number: how many orders have <b>no row in the deliveries table</b>. Call it <code>orders_without_delivery</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `SELECT COUNT(*) FROM orders o WHERE NOT EXISTS (a subquery on deliveries that links d.order_id to o.order_id).`,
        `SELECT COUNT(*) AS orders_without_delivery FROM orders o WHERE NOT EXISTS (SELECT 1 FROM deliveries d WHERE d.order_id = o.order_id);`
      ],
      solution: `SELECT COUNT(*) AS orders_without_delivery FROM orders o WHERE NOT EXISTS (SELECT 1 FROM deliveries d WHERE d.order_id = o.order_id);`,
      ordered: true
    },
    {
      id: 'sql-4-2-ex2',
      type: 'exercise',
      title: 'Your turn: customers with a return',
      body: `<p>Using <code>EXISTS</code>, return one number: how many customers have <b>at least one Returned order</b>. Call it <code>customers_with_returns</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Same shape as the Cancelled example, but with order_status = 'Returned' and a COUNT(*) around it.`,
        `SELECT COUNT(*) AS customers_with_returns FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id AND o.order_status = 'Returned');`
      ],
      solution: `SELECT COUNT(*) AS customers_with_returns FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id AND o.order_status = 'Returned');`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A correlated subquery in the SELECT list',
      body: `<p>A correlated subquery can also sit in the <code>SELECT</code> list, producing a <b>new column calculated separately for each row</b>. For example: for every customer, the number of orders they placed. Each customer gets their own answer, because the inner query asks about <i>that</i> customer.</p>`
    },
    {
      type: 'try',
      title: 'Orders per customer, row by row',
      body: `<p>The five busiest customers: 524 and 773 with <b>15</b> orders each, then 892 and 1514 with 13, and 140 with 12. Same answer as the GROUP BY version you wrote in Lesson 2.6, using a different road. In an interview, being able to show both is a real strength.</p>`,
      code: `SELECT c.customer_id,
       (SELECT COUNT(*)
        FROM orders o
        WHERE o.customer_id = c.customer_id) AS orders
FROM customers c
ORDER BY orders DESC, c.customer_id
LIMIT 5;`
    },
    {
      type: 'explain',
      title: 'Comparing each row with its own group',
      body: `<p>Here is a question GROUP BY alone can’t answer: <i>“Which payments are bigger than the average payment of <b>their own payment method</b>?”</i> A Card payment should be compared with the average of Card payments, a Mobile Money payment with the average of Mobile Money payments.</p>
<p>The inner query calculates an average, but only over rows with the <b>same payment method as the current outer row</b>. That is a correlated subquery doing something genuinely clever.</p>`
    },
    {
      type: 'try',
      title: 'Payments above their own method’s average',
      body: `<p>We use two aliases for the same table: <code>p</code> for the outer row, and <code>p2</code> for the inner copy being averaged. The condition <code>p2.payment_method = p.payment_method</code> ties the inside to the current row. Overall <b>3,928</b> payments beat their own method’s average (we show the first 5).</p>`,
      code: `SELECT p.payment_id, p.payment_method, p.amount
FROM payments p
WHERE p.amount > (SELECT AVG(p2.amount)
                  FROM payments p2
                  WHERE p2.payment_method = p.payment_method)
ORDER BY p.payment_id
LIMIT 5;`
    },
    {
      id: 'sql-4-2-ex3',
      type: 'exercise',
      title: 'Your turn: the busiest customers, a new way',
      body: `<p>Show the <b>5 customers with the most orders</b>: <code>customer_id</code> and <code>orders</code>. This time, calculate <code>orders</code> with a <b>correlated subquery in the SELECT list</b> (not a GROUP BY). Sort by orders descending, then <code>customer_id</code> ascending.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `The column is (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.customer_id) AS orders, taken from the customers table.`,
        `SELECT c.customer_id, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.customer_id) AS orders FROM customers c ORDER BY orders DESC, c.customer_id LIMIT 5;`
      ],
      solution: `SELECT c.customer_id, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.customer_id) AS orders FROM customers c ORDER BY orders DESC, c.customer_id LIMIT 5;`,
      ordered: true
    },
    {
      id: 'sql-4-2-ex4',
      type: 'exercise',
      title: 'Your turn: above their own average',
      body: `<p>Return one number: how many payments are <b>larger than the average payment of their own payment method</b>? Call it <code>above_own_average</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `COUNT(*) from payments p, WHERE p.amount > a subquery that averages payments p2 with the same payment_method as p.`,
        `SELECT COUNT(*) AS above_own_average FROM payments p WHERE p.amount > (SELECT AVG(p2.amount) FROM payments p2 WHERE p2.payment_method = p.payment_method);`
      ],
      solution: `SELECT COUNT(*) AS above_own_average FROM payments p WHERE p.amount > (SELECT AVG(p2.amount) FROM payments p2 WHERE p2.payment_method = p.payment_method);`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'EXISTS can reach across many tables',
      body: `<p>The inside of an EXISTS can contain <b>joins</b>. So you can ask questions that span several tables, like “has this customer ever bought anything from the Electronics category?” The path is customer → orders → order items → products, all inside the brackets.</p>
<p>And you can combine <code>EXISTS</code> and <code>NOT EXISTS</code> to describe very precise groups: “customers who bought Electronics <b>but never</b> bought Books &amp; Stationery.”</p>`
    },
    {
      type: 'try',
      title: 'Who has bought Electronics?',
      body: `<p><b>1,767</b> customers have bought at least one Electronics product. No fan-out, no DISTINCT: the join lives inside the EXISTS, where it can’t multiply the outer rows.</p>`,
      code: `SELECT COUNT(*) AS electronics_buyers
FROM customers c
WHERE EXISTS (SELECT 1
              FROM orders o
              JOIN order_items oi ON oi.order_id = o.order_id
              JOIN products p ON p.product_id = oi.product_id
              WHERE o.customer_id = c.customer_id
                AND p.category = 'Electronics');`
    },
    {
      id: 'sql-4-2-ex5',
      type: 'exercise',
      title: 'Challenge: Electronics yes, Books no',
      body: `<p>Marketing wants to cross-sell books. Return one number, <code>cross_sell_targets</code>: how many customers have bought <b>Electronics</b> but have <b>never</b> bought anything in <b>Books &amp; Stationery</b>. Use one <code>EXISTS</code> and one <code>NOT EXISTS</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Two subqueries, each joining orders, order_items and products. The first checks category = 'Electronics' (EXISTS), the second checks category = 'Books & Stationery' (NOT EXISTS), joined with AND.`,
        `SELECT COUNT(*) AS cross_sell_targets FROM customers c WHERE EXISTS (SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.order_id JOIN products p ON p.product_id = oi.product_id WHERE o.customer_id = c.customer_id AND p.category = 'Electronics') AND NOT EXISTS (SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.order_id JOIN products p ON p.product_id = oi.product_id WHERE o.customer_id = c.customer_id AND p.category = 'Books & Stationery');`
      ],
      solution: `SELECT COUNT(*) AS cross_sell_targets FROM customers c WHERE EXISTS (SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.order_id JOIN products p ON p.product_id = oi.product_id WHERE o.customer_id = c.customer_id AND p.category = 'Electronics') AND NOT EXISTS (SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.order_id JOIN products p ON p.product_id = oi.product_id WHERE o.customer_id = c.customer_id AND p.category = 'Books & Stationery');`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Speed, and which tool to pick',
      body: `<div class="callout work"><b>At work:</b> <code>EXISTS</code> can stop looking the moment it finds one match, which often makes it fast. A correlated subquery in the SELECT list or WHERE, on the other hand, can be slow on very large tables, because it conceptually runs once per row (modern databases optimise a lot, but not always). When you hit a slow query, a join with pre-summarised data, or a <b>window function</b> (Module 6), is often the answer.</div>
<p>A simple guide:</p>
<ul>
<li>“Does this row have <b>any</b> related row?” → <code>EXISTS</code> or <code>NOT EXISTS</code></li>
<li>“Is the value in a <b>list</b>?” → <code>IN (SELECT ...)</code> (and filter NULLs if you use NOT IN)</li>
<li>“I need <b>columns</b> from the other table” → <code>JOIN</code></li>
<li>“Compare each row to its <b>own group</b>” → correlated subquery (or a window function later)</li>
</ul>`
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Use <code>EXISTS</code> and <code>NOT EXISTS</code> for yes/no questions about related rows, without repeating rows</li>
<li>Write a <b>correlated subquery</b> that uses the current outer row</li>
<li>Calculate a per-row value in the SELECT list, and compare each row to its own group’s average</li>
<li>Span many tables inside an EXISTS, and combine EXISTS with NOT EXISTS</li>
<li>Pick between EXISTS, IN and JOIN</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is a correlated subquery?</li>
<li>When would you choose <code>EXISTS</code> over <code>IN</code>?</li>
<li>Why is <code>NOT EXISTS</code> often safer than <code>NOT IN</code>?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A subquery that refers to columns of the outer query, so its result depends on the current outer row. It is evaluated (conceptually) once for each outer row.</p>
<p><b>2.</b> When you only need to know whether a match exists, especially with large subquery results, or when NULLs might be involved. EXISTS can stop at the first match and has no NULL trap.</p>
<p><b>3.</b> NOT IN returns no rows if the subquery list contains a NULL. NOT EXISTS only checks whether a matching row exists, so NULLs in the data can’t break it.</p>
</details>
<p><b>Coming next, Lesson 4.3: Subqueries in FROM.</b> Build a small table on the fly, then query <i>that</i>. It finally lets you average an average, draw a distribution of customers by number of orders, and fix the fan-out from Module 3 properly.</p>`
    }
  ]
},
{
  id: 'sql-4-3',
  track: 'sql',
  title: '4.3 Subqueries in FROM: building a table on the fly',
  tables: ['customers', 'orders', 'order_items', 'payments'],
  intro: `A new kind of question: <i>“On average, how many orders does a customer place?”</i><br><br>Look closely. You first have to <b>count orders per customer</b>, and only then <b>average those counts</b>. That is an aggregate of an aggregate, and SQL doesn’t allow <code>AVG(COUNT(*))</code> in one go. The answer is to <b>build a small table on the fly</b>, then query it. That is a subquery in <code>FROM</code>, called a <b>derived table</b>, and it is also the tool that fixes the fan-out trap from Module 3.`,
  steps: [
    {
      type: 'explain',
      title: 'Prepare the ingredient, then cook',
      body: `<div class="callout analogy"><b>The big idea:</b> a chef often <b>prepares an ingredient first</b> (dice the onions), then uses it in the main dish. A <b>derived table</b> is a prepared ingredient: a query that creates a temporary, small table, which your main query then uses in its <code>FROM</code> as if it were a real table.</div>
<p>The shape: <code>FROM (SELECT ... ) AS some_name</code>. Two rules:</p>
<ol>
<li>The subquery goes in <b>brackets</b></li>
<li>It <b>must have an alias</b> (a name), so the outer query can refer to it. (SQLite lets you skip it, but PostgreSQL, MySQL and SQL Server insist.)</li>
</ol>`
    },
    {
      type: 'try',
      title: 'The ingredient on its own',
      body: `<p>Here is the prepared ingredient by itself: the number of orders for each customer, showing the busiest five. Imagine this as a small table with 1,982 rows, one per customer who ordered.</p>`,
      code: `SELECT customer_id, COUNT(*) AS orders
FROM orders
GROUP BY customer_id
ORDER BY orders DESC, customer_id
LIMIT 5;`
    },
    {
      type: 'try',
      title: 'Cooking with it: the average of the counts',
      body: `<p>We wrapped the ingredient in brackets, named it <code>per_customer</code>, and averaged its <code>orders</code> column. The result: customers who order place about <b>5.05 orders</b> on average. Two steps in one query: count per customer, then average the counts.</p>`,
      code: `SELECT ROUND(AVG(orders), 2) AS avg_orders_per_customer
FROM (SELECT customer_id, COUNT(*) AS orders
      FROM orders
      GROUP BY customer_id) AS per_customer;`
    },
    {
      id: 'sql-4-3-c1',
      type: 'check',
      title: 'Why can’t we simply write AVG(COUNT(*)) to get the average orders per customer?',
      body: `<p>Think about how many steps of grouping are involved.</p>`,
      options: ['SQL has no AVG function', 'We need to group twice (count per customer, then average those counts), and one query can only group once', 'COUNT cannot be used with numbers', 'It would be correct, just slow'],
      answer: 1,
      why: [
        'AVG exists. The problem is stacking aggregates on top of each other.',
        'Yes! First we group by customer to count, then we average the results of that grouping. Two levels need two queries: a derived table does the first level.',
        'COUNT works fine. It is nesting aggregates directly that SQL refuses.',
        'It would be an error, not just slow.'
      ]
    },
    {
      id: 'sql-4-3-ex1',
      type: 'exercise',
      title: 'Your turn: average items per order',
      body: `<p>On average, how many <b>units</b> are in an order? First total the <code>quantity</code> for each order in <code>order_items</code> (a derived table), then average those totals. Return one number, rounded to 2 decimals, called <code>avg_units_per_order</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Inside: SELECT order_id, SUM(quantity) AS units FROM order_items GROUP BY order_id. Outside: AVG(units).`,
        `SELECT ROUND(AVG(units), 2) AS avg_units_per_order FROM (SELECT order_id, SUM(quantity) AS units FROM order_items GROUP BY order_id) AS per_order;`
      ],
      solution: `SELECT ROUND(AVG(units), 2) AS avg_units_per_order FROM (SELECT order_id, SUM(quantity) AS units FROM order_items GROUP BY order_id) AS per_order;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Grouping a grouping: distributions',
      body: `<p>Derived tables unlock a favourite analyst chart: the <b>distribution</b>. Not “how many orders did each customer place”, but <b>“how many customers placed 1 order, how many placed 2, how many placed 3...”</b>.</p>
<p>That is a count of counts: the inner query counts orders per customer, and the outer query groups <i>those</i> counts and counts how many customers share each.</p>`
    },
    {
      type: 'try',
      title: 'The shape of TradeFlow’s customers',
      body: `<p>A classic bell shape. Most customers place <b>3 to 6</b> orders, with the peak at <b>4 orders (384 customers)</b>. Only <b>57</b> customers ordered exactly once, and just two customers ordered 15 times. That tells the business something real: most customers come back several times, which is healthy.</p>`,
      chart: 'bar',
      chartTitle: 'How many customers placed N orders',
      code: `SELECT orders, COUNT(*) AS customers
FROM (SELECT customer_id, COUNT(*) AS orders
      FROM orders
      GROUP BY customer_id) AS per_customer
GROUP BY orders
ORDER BY orders;`
    },
    {
      id: 'sql-4-3-ex2',
      type: 'exercise',
      title: 'Your turn: the start of the distribution',
      body: `<p>Show the number of orders and how many customers placed that many (<code>orders</code> and <code>customers</code>), but only for the <b>first 5 values</b> (1 to 5 orders), in ascending order of <code>orders</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Same shape as the chart query, add ORDER BY orders and LIMIT 5.`,
        `SELECT orders, COUNT(*) AS customers FROM (SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id) AS per_customer GROUP BY orders ORDER BY orders LIMIT 5;`
      ],
      solution: `SELECT orders, COUNT(*) AS customers FROM (SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id) AS per_customer GROUP BY orders ORDER BY orders LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The real prize: fixing the fan-out',
      body: `<p>Remember Lesson 3.4? Joining <code>payments</code> to <code>order_items</code> and summing the amounts inflated the total from <b>1,581,981,450.50</b> to <b>4,283,391,877.84</b>, because each payment was repeated once per item line.</p>
<p>The cure is exactly what you just learned: <b>summarise the “many” side first</b>, so it has only <b>one row per order</b>. Then joining can no longer multiply anything.</p>`
    },
    {
      type: 'try',
      title: 'Summarise first, then join',
      body: `<p>The derived table <code>i</code> squashes the item lines into one row per order (with its total units). Joining payments to it repeats nothing, and the total comes back to the honest <b>1,581,981,450.50</b>. The fan-out is gone, and we even gained a new column (units) to use. This “summarise, then join” pattern is one of the most valuable habits in all of analytics.</p>`,
      code: `SELECT ROUND(SUM(p.amount), 2) AS total_payments
FROM payments p
JOIN (SELECT order_id, SUM(quantity) AS units
      FROM order_items
      GROUP BY order_id) AS i
  ON i.order_id = p.order_id;`
    },
    {
      id: 'sql-4-3-ex3',
      type: 'exercise',
      title: 'Your turn: the safe total',
      body: `<p>Write the safe version yourself. Join <code>payments</code> to a derived table that sums <code>quantity</code> per <code>order_id</code> from <code>order_items</code> (call it <code>units</code>), and return the <b>total of all payment amounts</b>, rounded to 2 decimals, as <code>total_payments</code>. It should equal 1,581,981,450.50.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join payments p to (SELECT order_id, SUM(quantity) AS units FROM order_items GROUP BY order_id) AS i on order_id, then SUM(p.amount).`,
        `SELECT ROUND(SUM(p.amount), 2) AS total_payments FROM payments p JOIN (SELECT order_id, SUM(quantity) AS units FROM order_items GROUP BY order_id) AS i ON i.order_id = p.order_id;`
      ],
      solution: `SELECT ROUND(SUM(p.amount), 2) AS total_payments FROM payments p JOIN (SELECT order_id, SUM(quantity) AS units FROM order_items GROUP BY order_id) AS i ON i.order_id = p.order_id;`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Our best customers, by money received',
      body: `<p>A real business question solved the same way: first build a table with <b>total paid money per customer</b> (the derived table <code>t</code>), then join it to the customers table to get names. The top spender is <b>Amanda Smith (773)</b> with about 2.29 million paid. Customer 773 is also one of our two most active customers, from the earlier lessons.</p>
<p>Remember the earlier warning, though: “Paid” money can include cancelled and returned orders. A careful analyst would mention that next to this list.</p>`,
      code: `SELECT c.customer_id,
       c.customer_name,
       t.total_paid
FROM customers c
JOIN (SELECT o.customer_id,
             ROUND(SUM(p.amount), 2) AS total_paid
      FROM orders o
      JOIN payments p ON p.order_id = o.order_id
      WHERE p.payment_status = 'Paid'
      GROUP BY o.customer_id) AS t
  ON t.customer_id = c.customer_id
ORDER BY t.total_paid DESC, c.customer_id
LIMIT 5;`
    },
    {
      id: 'sql-4-3-ex4',
      type: 'exercise',
      title: 'Your turn: the top five spenders',
      body: `<p>Recreate the top-five list. Show <code>customer_id</code>, <code>customer_name</code> and <code>total_paid</code> (total of <b>Paid</b> payment amounts, rounded to 2 decimals) for the <b>5 customers with the highest total</b>, highest first, with <code>customer_id</code> as the tie-breaker. Build <code>total_paid</code> in a derived table, then join to customers.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `The derived table joins orders to payments, filters Paid, and groups by o.customer_id. Then join customers to it.`,
        `SELECT c.customer_id, c.customer_name, t.total_paid FROM customers c JOIN (SELECT o.customer_id, ROUND(SUM(p.amount), 2) AS total_paid FROM orders o JOIN payments p ON p.order_id = o.order_id WHERE p.payment_status = 'Paid' GROUP BY o.customer_id) AS t ON t.customer_id = c.customer_id ORDER BY t.total_paid DESC, c.customer_id LIMIT 5;`
      ],
      solution: `SELECT c.customer_id, c.customer_name, t.total_paid FROM customers c JOIN (SELECT o.customer_id, ROUND(SUM(p.amount), 2) AS total_paid FROM orders o JOIN payments p ON p.order_id = o.order_id WHERE p.payment_status = 'Paid' GROUP BY o.customer_id) AS t ON t.customer_id = c.customer_id ORDER BY t.total_paid DESC, c.customer_id LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'When nesting gets hard to read',
      body: `<p>Subqueries are powerful, but they have a weakness: <b>readability</b>. Each layer you nest makes the query harder to follow, like reading a sentence with brackets inside brackets inside brackets. The next card shows a question that needs three layers.</p>
<p>The question: <i>“How many customers placed more orders than the average customer?”</i> The steps are: (1) count orders per customer, (2) average those counts, (3) count the customers above that average. Three steps, nested inside each other.</p>`
    },
    {
      type: 'try',
      title: 'A three-layer nest',
      body: `<p>It works (the answer is <b>770</b> customers), but notice how you have to read it from the <b>inside out</b>, and how the same derived table is written <b>twice</b>. If you had to fix a bug here at 5pm on a Friday, you would not enjoy it.</p>
<p>That is precisely why the next module exists. <b>CTEs</b> let you give each step a name and write it in order, top to bottom, like a recipe.</p>`,
      code: `SELECT COUNT(*) AS above_average_customers
FROM (SELECT customer_id, COUNT(*) AS n
      FROM orders
      GROUP BY customer_id) AS per_customer
WHERE n > (SELECT AVG(n)
           FROM (SELECT customer_id, COUNT(*) AS n
                 FROM orders
                 GROUP BY customer_id) AS per_customer2);`
    },
    {
      id: 'sql-4-3-ex5',
      type: 'exercise',
      title: 'Challenge: the loyal customers',
      body: `<p>Write the three-layer query yourself. Return one number, <code>above_average_customers</code>: the number of customers who placed <b>more orders than the average number of orders per ordering customer</b>. (Use a derived table for orders per customer, and a scalar subquery for the average of it.) The answer should be 770.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Outer: COUNT(*) from the derived table where n > (a scalar subquery that averages n from a second copy of the same derived table).`,
        `SELECT COUNT(*) AS above_average_customers FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) AS per_customer WHERE n > (SELECT AVG(n) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) AS per_customer2);`
      ],
      solution: `SELECT COUNT(*) AS above_average_customers FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) AS per_customer WHERE n > (SELECT AVG(n) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) AS per_customer2);`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Module 4 complete: choosing the right tool',
      body: `<p>You can now put a query almost anywhere in another query:</p>
<table class="mini"><tr><th>Where</th><th>What it does</th><th>Example</th></tr>
<tr><td><code>WHERE x &gt; (SELECT ...)</code></td><td>Compare with one value</td><td>Products above the average price</td></tr>
<tr><td><code>WHERE x IN (SELECT ...)</code></td><td>Match a list built on the fly</td><td>Customers who ordered in 2026</td></tr>
<tr><td><code>WHERE EXISTS (SELECT ...)</code></td><td>Does any matching row exist?</td><td>Customers with a cancellation</td></tr>
<tr><td><code>SELECT (SELECT ...) AS col</code></td><td>A calculated value per row</td><td>Orders per customer</td></tr>
<tr><td><code>FROM (SELECT ...) AS t</code></td><td>A prepared table to query or join</td><td>Distribution of orders, safe totals</td></tr></table>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is a derived table, and does it need an alias?</li>
<li>How would you calculate the average of a count, such as orders per customer?</li>
<li>How can a subquery in FROM help avoid a join fan-out?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A derived table is a subquery in the FROM clause that acts as a temporary table for the outer query. Most databases require it to have an alias.</p>
<p><b>2.</b> Count per customer in a subquery (GROUP BY customer), then take AVG of that count column in the outer query.</p>
<p><b>3.</b> Summarise the “many” side to one row per key in the subquery, then join that. Because each key now appears once, the join can’t repeat rows or inflate totals.</p>
</details>
<p><b>Coming next, Module 5: CTEs, writing SQL you can actually read.</b> You just saw the problem: nested queries get hard to follow, and you end up repeating yourself. CTEs fix both. You will write queries like a recipe, one named step at a time, and learn the recursive CTE, a tool for building date calendars and hierarchies.</p>`
    }
  ]
}
);
