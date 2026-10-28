LESSONS.push(
{
  id: 'sql-6-1',
  track: 'sql',
  title: '6.1 Window functions: calculating without collapsing rows',
  tables: ['customers', 'products', 'orders', 'payments'],
  intro: `Here is a request that GROUP BY simply can’t handle: <i>“Show me every payment, and next to each one, the average payment of its payment method.”</i><br><br>GROUP BY would give you <b>one row per method</b>, and you would lose the individual payments. You want to keep <b>every row</b> and <b>add</b> the group’s average next to it. That is the job of a <b>window function</b>, and it is the single most powerful idea in SQL. It is also the most tested topic in analyst interviews.`,
  steps: [
    {
      type: 'explain',
      title: 'The report card with the class average',
      body: `<div class="callout analogy"><b>The big idea:</b> think of a school. A <b>GROUP BY</b> is the <i>class summary sheet</i>: one line per class, with the average. The individual students disappear. A <b>window function</b> is a <i>report card</i>: every student keeps their own row, and the class average is <b>printed next to each name</b>.</div>
<p>The window function does a calculation across a <b>group of related rows</b> (the “window”), but <b>never collapses them</b>. Every row survives.</p>
<p>The recognisable shape is a normal function followed by <code>OVER ( ... )</code>:</p>
<p><code>AVG(amount) OVER (PARTITION BY payment_method)</code></p>
<p>Read it aloud: <i>“the average amount, over (looking at) the payments with the same payment method.”</i></p>`
    },
    {
      type: 'try',
      title: 'The simplest window: the whole table',
      body: `<p>An empty <code>OVER ()</code> means “the window is <b>everything</b>.” Every payment keeps its own row, and the same overall average, <b>158,198.15</b>, is printed next to each one. With GROUP BY you would have one row and no payments. Here we have both.</p>`,
      code: `SELECT payment_id,
       amount,
       ROUND(AVG(amount) OVER (), 2) AS overall_avg
FROM payments
ORDER BY payment_id
LIMIT 5;`
    },
    {
      type: 'explain',
      title: 'PARTITION BY: a separate window for each group',
      body: `<p><code>PARTITION BY payment_method</code> says: <b>split the rows into piles by payment method, and do the calculation inside each pile</b>. It’s the same “piles” idea as GROUP BY, with one huge difference: <b>the rows don’t get squashed</b>.</p>
<p>So each Card payment sees the average of Card payments, and each Mobile Money payment sees the average of Mobile Money payments.</p>`
    },
    {
      type: 'try',
      title: 'Each payment next to its own method’s average',
      body: `<p>Payment 1 is a Card payment of 246,702.23, and the Card average is 158,191.86, so it is <b>88,510.37 above</b> its method’s average. Payment 3 is Mobile Money, 9,998.84, so it is 149,143.58 <b>below</b> the Mobile Money average. You can even do arithmetic with the window result, like the difference column.</p>
<p>Remember the correlated subquery from Lesson 4.2 that did something similar? This is the <b>cleaner, modern way</b>.</p>`,
      code: `SELECT payment_id,
       payment_method,
       amount,
       ROUND(AVG(amount) OVER (PARTITION BY payment_method), 2) AS method_avg,
       ROUND(amount - AVG(amount) OVER (PARTITION BY payment_method), 2) AS diff_from_avg
FROM payments
ORDER BY payment_id
LIMIT 5;`
    },
    {
      id: 'sql-6-1-c1',
      type: 'check',
      title: 'What is the main difference between GROUP BY and a window function?',
      body: `<p>Think about the class summary sheet and the report cards.</p>`,
      options: ['GROUP BY is faster', 'GROUP BY collapses rows into one per group, while a window function keeps every row and adds a calculated column', 'Window functions only work on numbers', 'There is no difference'],
      answer: 1,
      why: [
        'Speed isn’t the difference. The difference is what happens to the rows.',
        'Yes! GROUP BY reduces many rows to one per group. A window function adds the group result next to every original row.',
        'Window functions work with text and dates too (ranking, for example).',
        'They are quite different. One shrinks the rows, the other keeps them.'
      ]
    },
    {
      id: 'sql-6-1-ex1',
      type: 'exercise',
      title: 'Your turn: the overall average on every row',
      body: `<p>For the <b>first 5 payments</b> (by <code>payment_id</code>), show <code>payment_id</code>, <code>amount</code>, and the overall average payment amount rounded to 2 decimals as <code>overall_avg</code>. Use a window function with an empty <code>OVER ()</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `ROUND(AVG(amount) OVER (), 2) AS overall_avg, then ORDER BY payment_id and LIMIT 5.`,
        `SELECT payment_id, amount, ROUND(AVG(amount) OVER (), 2) AS overall_avg FROM payments ORDER BY payment_id LIMIT 5;`
      ],
      solution: `SELECT payment_id, amount, ROUND(AVG(amount) OVER (), 2) AS overall_avg FROM payments ORDER BY payment_id LIMIT 5;`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Products against their own category',
      body: `<p>Every product next to the average price of <b>its own category</b>. The Wireless Earbuds (52,539) cost more than the Electronics average (39,997.90), so it’s a “premium” item <i>for its category</i>, which is far more meaningful than comparing it to the whole shop.</p>`,
      code: `SELECT product_id,
       product_name,
       category,
       unit_price,
       ROUND(AVG(unit_price) OVER (PARTITION BY category), 2) AS category_avg
FROM products
ORDER BY product_id
LIMIT 6;`
    },
    {
      id: 'sql-6-1-ex2',
      type: 'exercise',
      title: 'Your turn: how far from the category average?',
      body: `<p>For the <b>first 5 products</b> (by <code>product_id</code>), show <code>product_id</code>, <code>product_name</code> and how far each product’s price is from <b>its category’s average price</b>, rounded to 2 decimals, called <code>diff_from_category_avg</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `ROUND(unit_price - AVG(unit_price) OVER (PARTITION BY category), 2).`,
        `SELECT product_id, product_name, ROUND(unit_price - AVG(unit_price) OVER (PARTITION BY category), 2) AS diff_from_category_avg FROM products ORDER BY product_id LIMIT 5;`
      ],
      solution: `SELECT product_id, product_name, ROUND(unit_price - AVG(unit_price) OVER (PARTITION BY category), 2) AS diff_from_category_avg FROM products ORDER BY product_id LIMIT 5;`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Counting inside the window',
      body: `<p>Other functions work as windows too, such as <code>COUNT</code>, <code>SUM</code>, <code>MIN</code> and <code>MAX</code>. Here, every customer is shown with the <b>size of their country</b>: Alex Spencer is in Rwanda, which has 438 customers. We got a “group size” column <b>without losing a single customer row</b>.</p>`,
      code: `SELECT customer_id,
       customer_name,
       country,
       COUNT(*) OVER (PARTITION BY country) AS customers_in_country
FROM customers
ORDER BY customer_id
LIMIT 5;`
    },
    {
      id: 'sql-6-1-ex3',
      type: 'exercise',
      title: 'Your turn: the size of each country',
      body: `<p>For the <b>first 5 customers</b> (by <code>customer_id</code>), show <code>customer_id</code>, <code>country</code> and the number of customers in that country, called <code>customers_in_country</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `COUNT(*) OVER (PARTITION BY country).`,
        `SELECT customer_id, country, COUNT(*) OVER (PARTITION BY country) AS customers_in_country FROM customers ORDER BY customer_id LIMIT 5;`
      ],
      solution: `SELECT customer_id, country, COUNT(*) OVER (PARTITION BY country) AS customers_in_country FROM customers ORDER BY customer_id LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A window can’t go in WHERE',
      body: `<p>You’ll soon want to say: <i>“keep only the payments above their method’s average.”</i> The natural thing is to put the window in <code>WHERE</code>. But SQL refuses.</p>
<div class="callout tip"><b>Why:</b> SQL runs <code>WHERE</code> very early, <b>before</b> it calculates any window. When WHERE runs, the average doesn’t exist yet. The window functions are calculated later, just before the final SELECT list is built.</div>
<p><b>The cure:</b> calculate the window in an inner step (a CTE), and filter in the outer step. You know how to do that.</p>`
    },
    {
      type: 'try',
      title: 'The error you will meet',
      body: `<p>Run it and read the error: <b>“misuse of window function AVG()”</b>. That sentence is SQL telling you: “you can’t use a window here.” Every analyst has seen it. It’s not a mistake in your thinking, only in where you put it.</p>`,
      code: `SELECT payment_id
FROM payments
WHERE amount > AVG(amount) OVER ()
LIMIT 3;`
    },
    {
      type: 'try',
      title: 'The fix: calculate first, filter second',
      body: `<p>The CTE calculates each payment’s method average. The outer query filters on it. The answer is <b>3,928</b> payments, exactly the same as the correlated subquery in Lesson 4.2, but this version is easier to read and usually faster on big tables.</p>`,
      code: `WITH with_avg AS (
    SELECT payment_id,
           amount,
           AVG(amount) OVER (PARTITION BY payment_method) AS method_avg
    FROM payments
)
SELECT COUNT(*) AS above_own_average
FROM with_avg
WHERE amount > method_avg;`
    },
    {
      id: 'sql-6-1-c2',
      type: 'check',
      title: 'You want only the rows where a window result is above some value. What should you do?',
      body: `<p>The window can’t be used directly in WHERE.</p>`,
      options: ['Put the window function in WHERE', 'Calculate the window in a CTE or subquery, then filter in the outer query', 'Use HAVING instead of WHERE', 'It is impossible'],
      answer: 1,
      why: [
        'That gives the error “misuse of window function”, because WHERE runs before windows exist.',
        'Yes! Do the window calculation in an inner step, then filter its result in the outer step.',
        'HAVING is for filtering groups after GROUP BY. It doesn’t apply here.',
        'It’s very possible, with a two-step approach.'
      ]
    },
    {
      id: 'sql-6-1-ex4',
      type: 'exercise',
      title: 'Your turn: filter on a window',
      body: `<p>Return one number, <code>above_category_avg</code>: how many products have a <code>unit_price</code> <b>above the average price of their own category</b>. Calculate the window in a CTE (call it <code>with_avg</code>), then count in the outer query. The answer is 66.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `CTE: SELECT product_id, unit_price, AVG(unit_price) OVER (PARTITION BY category) AS category_avg FROM products. Outer: WHERE unit_price > category_avg.`,
        `WITH with_avg AS (SELECT product_id, unit_price, AVG(unit_price) OVER (PARTITION BY category) AS category_avg FROM products) SELECT COUNT(*) AS above_category_avg FROM with_avg WHERE unit_price > category_avg;`
      ],
      solution: `WITH with_avg AS (SELECT product_id, unit_price, AVG(unit_price) OVER (PARTITION BY category) AS category_avg FROM products) SELECT COUNT(*) AS above_category_avg FROM with_avg WHERE unit_price > category_avg;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Percent of total, the window way',
      body: `<p>In Lesson 4.1 you calculated a share with a subquery. A window does it more elegantly: <code>SUM(x) OVER ()</code> is the grand total, available on every row. You can even put a window on top of a <b>grouped result</b>: <code>SUM(COUNT(*)) OVER ()</code> means “add up all the group counts.” The grouping happens first, then the window adds up the groups.</p>`
    },
    {
      type: 'try',
      title: 'The share of each order status',
      body: `<p>The query groups orders by status (the GROUP BY), and then uses a window over those groups to get the grand total. Completed is <b>74.1%</b>, Processing <b>15.5%</b>, Cancelled <b>5.3%</b> and Returned <b>5.0%</b>. No subquery needed.</p>`,
      chart: 'pie',
      chartTitle: 'Share of orders by status',
      code: `SELECT order_status,
       COUNT(*) AS orders,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM orders
GROUP BY order_status
ORDER BY orders DESC;`
    },
    {
      id: 'sql-6-1-ex5',
      type: 'exercise',
      title: 'Challenge: each product’s share of its category',
      body: `<p>For the <b>first 5 products</b> (by <code>product_id</code>), show <code>product_id</code>, <code>product_name</code> and the product’s price as a <b>percentage of the total price of all products in its category</b>, rounded to 2 decimals, called <code>pct_of_category</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `100.0 * unit_price / SUM(unit_price) OVER (PARTITION BY category), wrapped in ROUND( ..., 2 ).`,
        `SELECT product_id, product_name, ROUND(100.0 * unit_price / SUM(unit_price) OVER (PARTITION BY category), 2) AS pct_of_category FROM products ORDER BY product_id LIMIT 5;`
      ],
      solution: `SELECT product_id, product_name, ROUND(100.0 * unit_price / SUM(unit_price) OVER (PARTITION BY category), 2) AS pct_of_category FROM products ORDER BY product_id LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Use a <b>window function</b> (<code>function OVER (...)</code>) to calculate across related rows <b>without collapsing them</b></li>
<li>Choose the window: <code>OVER ()</code> for everything, <code>PARTITION BY</code> for a pile per group</li>
<li>Compare each row to its own group, and calculate shares of totals</li>
<li>Remember that windows <b>can’t be used in WHERE</b>, and fix it with a CTE</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is the difference between <code>GROUP BY</code> and <code>PARTITION BY</code>?</li>
<li>Why does <code>WHERE amount &gt; AVG(amount) OVER ()</code> fail?</li>
<li>How would you show each employee’s salary next to their department’s average salary?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> GROUP BY collapses rows into one row per group. PARTITION BY (inside OVER) splits rows into groups for a calculation, but keeps every original row.</p>
<p><b>2.</b> WHERE is evaluated before window functions are calculated, so the window result doesn’t exist yet. Compute the window in a CTE or subquery and filter in the outer query.</p>
<p><b>3.</b> <code>SELECT name, salary, AVG(salary) OVER (PARTITION BY department) AS dept_avg FROM employees;</code></p>
</details>
<p><b>Coming next, Lesson 6.2: Ranking.</b> Podium positions: first, second, third. You will learn three ranking functions that behave differently when there is a tie, solve the famous “top 3 per category” interview question, and uncover a strange pattern in TradeFlow’s customer dates.</p>`
    }
  ]
},
{
  id: 'sql-6-2',
  track: 'sql',
  title: '6.2 Ranking: ROW_NUMBER, RANK, DENSE_RANK and top-N per group',
  tables: ['customers', 'products', 'orders', 'order_items', 'payments'],
  intro: `Three requests land on your desk: <i>“Who are our top customers?”</i>, <i>“What are the three most expensive products in <b>each category</b>?”</i> and <i>“Keep just one row for each repeated order line.”</i><br><br>All three are <b>ranking</b> problems. The third one, “top N per group”, is possibly the most famous SQL interview question in the world. You will solve it, then use the same tool to discover that TradeFlow’s customers are placing orders <b>before they have even signed up</b>.`,
  steps: [
    {
      type: 'explain',
      title: 'A race and its podium',
      body: `<div class="callout analogy"><b>The big idea:</b> a ranking function puts every row in <b>order</b> and gives it a <b>position</b>, like finishing places in a race. You say how to order the runners inside <code>OVER ( ORDER BY ... )</code>.</div>
<p>Three functions, and they differ <b>only when there is a tie</b>:</p>
<ul>
<li><code>ROW_NUMBER()</code>: always 1, 2, 3, 4... Even tied runners get different numbers (it just picks an order). Nobody shares a place.</li>
<li><code>RANK()</code>: tied runners <b>share</b> a place, and the next place is <b>skipped</b>: 1, 1, 3, 4. (Two golds, no silver, next is bronze.)</li>
<li><code>DENSE_RANK()</code>: tied runners share a place, and <b>no places are skipped</b>: 1, 1, 2, 3.</li>
</ul>`
    },
    {
      type: 'try',
      title: 'Watch the three functions disagree',
      body: `<p>Customers ranked by how many orders they placed. Look at what happens:</p>
<ul>
<li>Customers <b>524 and 773</b> both placed 15 orders (a tie). <code>ROW_NUMBER</code> gives them 1 and 2. <code>RANK</code> and <code>DENSE_RANK</code> both say 1.</li>
<li>Next come 892 and 1514, with 13 orders. <code>RANK</code> says <b>3</b> (it skipped 2). <code>DENSE_RANK</code> says <b>2</b> (no skipping).</li>
</ul>
<p>Which is “right”? It depends on the question. That’s why you must know all three.</p>`,
      code: `WITH per_customer AS (
    SELECT customer_id, COUNT(*) AS orders
    FROM orders
    GROUP BY customer_id
)
SELECT customer_id,
       orders,
       ROW_NUMBER() OVER (ORDER BY orders DESC, customer_id) AS row_num,
       RANK()       OVER (ORDER BY orders DESC) AS rnk,
       DENSE_RANK() OVER (ORDER BY orders DESC) AS dense_rnk
FROM per_customer
ORDER BY orders DESC, customer_id
LIMIT 8;`
    },
    {
      id: 'sql-6-2-c1',
      type: 'check',
      title: 'Three runners finish with times 10s, 10s, 12s. What does RANK() give them?',
      body: `<p>Tied runners share a place, and RANK skips the next one.</p>`,
      options: ['1, 2, 3', '1, 1, 2', '1, 1, 3', '1, 2, 2'],
      answer: 2,
      why: [
        'That is ROW_NUMBER: nobody shares a place.',
        'That is DENSE_RANK: the tie shares first place, and the next place is 2 with no skipping.',
        'Yes! Two runners share 1st, and the next place is 3rd. Place 2 is skipped. That’s RANK.',
        'That would put the tie in second place, which doesn’t match the times.'
      ]
    },
    {
      id: 'sql-6-2-ex1',
      type: 'exercise',
      title: 'Your turn: a strict ranking',
      body: `<p>Show the <b>5 customers with the most orders</b>: <code>customer_id</code>, <code>orders</code> and a <code>row_num</code> from <code>ROW_NUMBER()</code>. Use a CTE called <code>per_customer</code> for the counts. Order the window by <code>orders</code> descending, then <code>customer_id</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `ROW_NUMBER() OVER (ORDER BY orders DESC, customer_id) AS row_num. Sort the final result by orders DESC, customer_id and LIMIT 5.`,
        `WITH per_customer AS (SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id) SELECT customer_id, orders, ROW_NUMBER() OVER (ORDER BY orders DESC, customer_id) AS row_num FROM per_customer ORDER BY orders DESC, customer_id LIMIT 5;`
      ],
      solution: `WITH per_customer AS (SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id) SELECT customer_id, orders, ROW_NUMBER() OVER (ORDER BY orders DESC, customer_id) AS row_num FROM per_customer ORDER BY orders DESC, customer_id LIMIT 5;`,
      ordered: true
    },
    {
      id: 'sql-6-2-ex2',
      type: 'exercise',
      title: 'Your turn: ties, handled two ways',
      body: `<p>Show the <b>top 6 customers by orders</b> with both <code>RANK()</code> (<code>rnk</code>) and <code>DENSE_RANK()</code> (<code>dense_rnk</code>). Columns: <code>customer_id</code>, <code>orders</code>, <code>rnk</code>, <code>dense_rnk</code>. Sort by orders descending, then <code>customer_id</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `RANK() OVER (ORDER BY orders DESC) and DENSE_RANK() OVER (ORDER BY orders DESC), over the per_customer CTE.`,
        `WITH per_customer AS (SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id) SELECT customer_id, orders, RANK() OVER (ORDER BY orders DESC) AS rnk, DENSE_RANK() OVER (ORDER BY orders DESC) AS dense_rnk FROM per_customer ORDER BY orders DESC, customer_id LIMIT 6;`
      ],
      solution: `WITH per_customer AS (SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id) SELECT customer_id, orders, RANK() OVER (ORDER BY orders DESC) AS rnk, DENSE_RANK() OVER (ORDER BY orders DESC) AS dense_rnk FROM per_customer ORDER BY orders DESC, customer_id LIMIT 6;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The famous question: top N per group',
      body: `<div class="callout analogy"><b>The challenge:</b> “Show the 3 most expensive products <b>in each category</b>.” A plain <code>LIMIT 3</code> would give 3 products for the whole shop, not 3 per category. You need a <b>separate ranking inside each category</b>.</div>
<p>The recipe, which works for thousands of real problems:</p>
<ol>
<li><b>Inside a CTE:</b> number the rows with <code>ROW_NUMBER() OVER (PARTITION BY group ORDER BY measure DESC)</code></li>
<li><b>In the outer query:</b> keep rows where that number is <b>3 or less</b></li>
</ol>
<p>Two steps, because a window can’t sit in WHERE (Lesson 6.1). Memorise this pattern. You will use it for the rest of your career.</p>`
    },
    {
      type: 'try',
      title: 'The three most expensive products per category',
      body: `<p>Each category has its own podium: Electronics is led by the <b>Power Bank (84,081.85)</b>, Home &amp; Kitchen by the <b>Bed Sheet Set (52,834.09)</b>, and so on. <code>PARTITION BY category</code> restarts the numbering for every category, and <code>WHERE rn &lt;= 3</code> keeps each podium.</p>`,
      code: `WITH ranked AS (
    SELECT category,
           product_name,
           unit_price,
           ROW_NUMBER() OVER (PARTITION BY category
                              ORDER BY unit_price DESC, product_id) AS rn
    FROM products
)
SELECT category, product_name, unit_price, rn
FROM ranked
WHERE rn <= 3
ORDER BY category, rn;`
    },
    {
      id: 'sql-6-2-ex3',
      type: 'exercise',
      title: 'Your turn: the cheapest in each category',
      body: `<p>Show the <b>2 cheapest products in each category</b>: <code>category</code>, <code>product_name</code>, <code>unit_price</code>. Number them with <code>ROW_NUMBER()</code> partitioned by category and ordered by <code>unit_price</code> ascending (then <code>product_id</code>). Sort the final result by <code>category</code>, then by that number.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Same recipe as the lesson, but ORDER BY unit_price ASC, product_id inside the window, and WHERE rn <= 2.`,
        `WITH ranked AS (SELECT category, product_name, unit_price, ROW_NUMBER() OVER (PARTITION BY category ORDER BY unit_price ASC, product_id) AS rn FROM products) SELECT category, product_name, unit_price FROM ranked WHERE rn <= 2 ORDER BY category, rn;`
      ],
      solution: `WITH ranked AS (SELECT category, product_name, unit_price, ROW_NUMBER() OVER (PARTITION BY category ORDER BY unit_price ASC, product_id) AS rn FROM products) SELECT category, product_name, unit_price FROM ranked WHERE rn <= 2 ORDER BY category, rn;`,
      ordered: true
    },
    {
      type: 'try',
      title: 'The top customer in each country',
      body: `<p>Top 1 per group is just top-N with N equal to 1. The most active customer in each country: <b>customer 773</b> in Nigeria (15 orders), <b>customer 524</b> in South Africa (15), <b>833</b> in Ghana (12), <b>140</b> in Rwanda (12), and <b>390</b> in Kenya (11). The customer table was joined in just to bring the country.</p>`,
      code: `WITH per_customer AS (
    SELECT o.customer_id, c.country, COUNT(*) AS orders
    FROM orders o
    JOIN customers c ON c.customer_id = o.customer_id
    GROUP BY o.customer_id
),
ranked AS (
    SELECT country, customer_id, orders,
           ROW_NUMBER() OVER (PARTITION BY country
                              ORDER BY orders DESC, customer_id) AS rn
    FROM per_customer
)
SELECT country, customer_id, orders
FROM ranked
WHERE rn = 1
ORDER BY country;`
    },
    {
      id: 'sql-6-2-ex4',
      type: 'exercise',
      title: 'Your turn: the biggest payment per method',
      body: `<p>Show the <b>largest payment for each payment method</b>: <code>payment_method</code>, <code>payment_id</code> and <code>amount</code>, sorted by <code>payment_method</code>. Use <code>ROW_NUMBER()</code> partitioned by method, ordered by <code>amount</code> descending (then <code>payment_id</code>), and keep the first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `CTE with ROW_NUMBER() OVER (PARTITION BY payment_method ORDER BY amount DESC, payment_id) AS rn. Outer: WHERE rn = 1.`,
        `WITH ranked AS (SELECT payment_method, payment_id, amount, ROW_NUMBER() OVER (PARTITION BY payment_method ORDER BY amount DESC, payment_id) AS rn FROM payments) SELECT payment_method, payment_id, amount FROM ranked WHERE rn = 1 ORDER BY payment_method;`
      ],
      solution: `WITH ranked AS (SELECT payment_method, payment_id, amount, ROW_NUMBER() OVER (PARTITION BY payment_method ORDER BY amount DESC, payment_id) AS rn FROM payments) SELECT payment_method, payment_id, amount FROM ranked WHERE rn = 1 ORDER BY payment_method;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Another use: removing duplicates, safely',
      body: `<p>Remember the 147 repeated (order, product) pairs from Lesson 3.4? <code>ROW_NUMBER()</code> is the standard tool for handling repeated rows: <b>number the rows inside each “should be unique” group</b>. The first row in each group gets 1, the repeats get 2, 3... Keep only the 1s, and the repeats are gone.</p>
<div class="callout watch"><b>But remember the lesson from 3.4:</b> a repeated key is a question, not a verdict. Here we only <i>count</i> what would be kept and what would be dropped. Deciding to remove them is a business decision.</div>`
    },
    {
      type: 'try',
      title: 'Kept and dropped',
      body: `<p><b>24,853</b> lines would be kept, and <b>147</b> extra lines would be dropped. 24,853 + 147 = 25,000, the whole table. This is the standard way analysts de-duplicate in SQL, and the same 24,853 you would get from <code>drop_duplicates</code> on those two columns in pandas.</p>`,
      code: `WITH numbered AS (
    SELECT order_item_id, order_id, product_id,
           ROW_NUMBER() OVER (PARTITION BY order_id, product_id
                              ORDER BY order_item_id) AS rn
    FROM order_items
)
SELECT SUM(CASE WHEN rn = 1 THEN 1 ELSE 0 END) AS kept_lines,
       SUM(CASE WHEN rn > 1 THEN 1 ELSE 0 END) AS extra_lines
FROM numbered;`
    },
    {
      type: 'explain',
      title: 'Detective work: every customer’s first order',
      body: `<p>Here is a classic analysis: <b>find each customer’s first order</b>. The recipe is the same: number each customer’s orders in date order (<code>PARTITION BY customer_id ORDER BY order_date</code>) and keep number 1. With the first order of every customer, we can ask when customers <i>started</i> buying.</p>`
    },
    {
      type: 'try',
      title: 'When did customers place their first order?',
      body: `<p>1,982 customers have a first order. Look at the years: <b>1,520 in 2023</b>, 368 in 2024, 80 in 2025 and only 14 in 2026. That looks like a business that got most of its customers right at the start. But compare it with the signup years you saw in Lesson 2.8: <b>582, 555, 598 and 265</b>. Customers signed up evenly over the years. So why did almost everyone place a first order in 2023?</p>`,
      chart: 'bar',
      chartTitle: 'Customers by year of first order',
      code: `WITH ranked AS (
    SELECT customer_id, order_date,
           ROW_NUMBER() OVER (PARTITION BY customer_id
                              ORDER BY order_date, order_id) AS rn
    FROM orders
)
SELECT strftime('%Y', order_date) AS year,
       COUNT(*) AS customers_first_ordering
FROM ranked
WHERE rn = 1
GROUP BY year
ORDER BY year;`
    },
    {
      type: 'try',
      title: 'A customer ordering before they existed?',
      body: `<p>We join each customer’s first order to their signup date and count the customers whose first order is <b>earlier than their signup date</b>. The result: <b>1,616 of 1,982 customers (81.5%)</b>.</p>
<p>Think about what that means: for four out of five customers, their first order is dated <b>before they signed up</b>, sometimes by <b>over three years</b> (up to 1,242 days). There are innocent explanations, like guest checkout (buying first, creating an account later). But no business signs up 81% of its customers three years after their first purchase. Either the dates in one table are wrong, or the signup date means something different from what its name suggests.</p>
<div class="callout tip"><b>This is what great analysts do:</b> they notice, they quantify (1,616 customers, up to 1,242 days), and they ask the owner of the data: <i>“What does signup_date really represent?”</i> They do <b>not</b> quietly build a “customer acquisition” report on top of it. We will come back to this in the data-audit lesson.</div>`,
      code: `WITH ranked AS (
    SELECT customer_id, order_date,
           ROW_NUMBER() OVER (PARTITION BY customer_id
                              ORDER BY order_date, order_id) AS rn
    FROM orders
)
SELECT COUNT(*) AS customers,
       SUM(CASE WHEN r.order_date < c.signup_date THEN 1 ELSE 0 END) AS first_order_before_signup,
       ROUND(100.0 * SUM(CASE WHEN r.order_date < c.signup_date THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct
FROM ranked r
JOIN customers c ON c.customer_id = r.customer_id
WHERE r.rn = 1;`
    },
    {
      id: 'sql-6-2-ex5',
      type: 'exercise',
      title: 'Challenge: count the impossible first orders',
      body: `<p>Return one number, <code>first_order_before_signup</code>: how many customers have a <b>first order dated before their <code>signup_date</code></b>. Number each customer’s orders with <code>ROW_NUMBER()</code> in a CTE (call it <code>ranked</code>), join to <code>customers</code>, keep the first order of each customer, and count the ones before signup. The answer is 1,616.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `ranked: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn on orders. Then join customers, WHERE rn = 1 AND order_date < signup_date.`,
        `WITH ranked AS (SELECT customer_id, order_date, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn FROM orders) SELECT COUNT(*) AS first_order_before_signup FROM ranked r JOIN customers c ON c.customer_id = r.customer_id WHERE r.rn = 1 AND r.order_date < c.signup_date;`
      ],
      solution: `WITH ranked AS (SELECT customer_id, order_date, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn FROM orders) SELECT COUNT(*) AS first_order_before_signup FROM ranked r JOIN customers c ON c.customer_id = r.customer_id WHERE r.rn = 1 AND r.order_date < c.signup_date;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Rank rows with <code>ROW_NUMBER</code>, <code>RANK</code> and <code>DENSE_RANK</code>, and know how each treats ties</li>
<li>Solve <b>top N per group</b>: rank inside a CTE with <code>PARTITION BY</code>, then filter <code>rn &lt;= N</code></li>
<li>Find “first X per customer” and de-duplicate with <code>ROW_NUMBER</code></li>
<li>Spot an impossible pattern in real data and report it, not hide it</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is the difference between <code>RANK()</code> and <code>DENSE_RANK()</code>?</li>
<li>Write a query to get the top 3 salaries in each department.</li>
<li>How would you remove duplicate rows using <code>ROW_NUMBER()</code>?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Both give tied rows the same rank. RANK then skips the following positions (1, 1, 3), while DENSE_RANK doesn’t skip any (1, 1, 2).</p>
<p><b>2.</b> <code>WITH ranked AS (SELECT department, name, salary, DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rnk FROM employees) SELECT * FROM ranked WHERE rnk &lt;= 3;</code> (use DENSE_RANK if ties should share a place, ROW_NUMBER for exactly 3 rows.)</p>
<p><b>3.</b> Number the rows within each group that should be unique (<code>PARTITION BY the_key ORDER BY something</code>), then keep only the rows where the number is 1.</p>
</details>
<p><b>Coming next, Lesson 6.3: LAG and LEAD.</b> Looking at the row before or after the current one: “how did this month compare to last month?” and “how many days passed between a customer’s orders?” You will also find out what customer 524 was doing for 402 days.</p>`
    }
  ]
},
{
  id: 'sql-6-3',
  track: 'sql',
  title: '6.3 LAG and LEAD: comparing a row with its neighbours',
  tables: ['orders'],
  intro: `A manager looks at a monthly orders chart and asks the question every business asks: <i>“Is this month better or worse than last month?”</i><br><br>To answer, each month’s row needs to <b>see the row before it</b>. In a normal query, rows can’t see their neighbours. With <b>LAG</b> (look back) and <b>LEAD</b> (look ahead), they can. This is how analysts calculate growth, changes, gaps between events, and year-over-year comparisons.`,
  steps: [
    {
      type: 'explain',
      title: 'Looking over your shoulder',
      body: `<div class="callout analogy"><b>The big idea:</b> imagine runners in a relay, standing in a line. <code>LAG</code> lets each runner <b>look at the person behind them</b> (the previous row). <code>LEAD</code> lets them <b>look at the person in front</b> (the next row). “Behind” and “in front” only make sense if the line has an <b>order</b>, so you must say <code>ORDER BY</code> inside <code>OVER</code>.</div>
<ul>
<li><code>LAG(column) OVER (ORDER BY ...)</code>: the value from the <b>previous</b> row</li>
<li><code>LEAD(column) OVER (ORDER BY ...)</code>: the value from the <b>next</b> row</li>
<li>Optional extras: <code>LAG(column, 2)</code> looks <b>two</b> rows back, and <code>LAG(column, 1, 0)</code> uses <b>0</b> instead of NULL when there is no previous row</li>
</ul>`
    },
    {
      type: 'try',
      title: 'This month versus last month',
      body: `<p>The CTE counts orders per month in 2025. Then <code>LAG(orders)</code> brings last month’s number next to this month’s, and the last column subtracts. January has <b>no previous month</b> so it shows empty (NULL). February: 232 versus 264 gives <b>-32</b>. July is the best jump: <b>+32</b>. November is the worst fall: <b>-43</b>.</p>`,
      chart: 'line',
      chartTitle: 'Orders per month, 2025',
      code: `WITH monthly AS (
    SELECT strftime('%Y-%m', order_date) AS month,
           COUNT(*) AS orders
    FROM orders
    WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01'
    GROUP BY month
)
SELECT month,
       orders,
       LAG(orders) OVER (ORDER BY month) AS prev_month,
       orders - LAG(orders) OVER (ORDER BY month) AS change
FROM monthly
ORDER BY month;`
    },
    {
      id: 'sql-6-3-ex1',
      type: 'exercise',
      title: 'Your turn: last month beside this month',
      body: `<p>Using a CTE <code>monthly</code> (orders per month in <b>2025</b>, half-open range), show <code>month</code>, <code>orders</code> and last month’s orders as <code>prev_month</code>, in month order.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `LAG(orders) OVER (ORDER BY month) AS prev_month.`,
        `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01' GROUP BY month) SELECT month, orders, LAG(orders) OVER (ORDER BY month) AS prev_month FROM monthly ORDER BY month;`
      ],
      solution: `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01' GROUP BY month) SELECT month, orders, LAG(orders) OVER (ORDER BY month) AS prev_month FROM monthly ORDER BY month;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Growth as a percentage',
      body: `<p>A change of “-32 orders” is useful. “-12.1%” is what managers actually speak. The formula is: <b>(this month − last month) ÷ last month × 100</b>. Use <code>100.0</code> with the decimal point (Lesson 2.4). The first month has no previous month, so its growth is NULL, which is correct: you can’t have growth with nothing to compare to.</p>`
    },
    {
      type: 'try',
      title: 'Month-on-month growth',
      body: `<p>February <b>-12.1%</b>, March <b>+8.6%</b>, July <b>+13.7%</b>, November <b>-17.2%</b>. Orders bounce around a flat average rather than climbing steadily, which tells you this business isn’t growing month to month.</p>`,
      code: `WITH monthly AS (
    SELECT strftime('%Y-%m', order_date) AS month,
           COUNT(*) AS orders
    FROM orders
    WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01'
    GROUP BY month
)
SELECT month,
       orders,
       ROUND(100.0 * (orders - LAG(orders) OVER (ORDER BY month))
             / LAG(orders) OVER (ORDER BY month), 1) AS growth_pct
FROM monthly
ORDER BY month;`
    },
    {
      id: 'sql-6-3-ex2',
      type: 'exercise',
      title: 'Your turn: the growth rate',
      body: `<p>Using the same <code>monthly</code> CTE for 2025, show <code>month</code> and the month-on-month growth percentage rounded to 1 decimal as <code>growth_pct</code>, in month order. (January will be empty.)</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `ROUND(100.0 * (orders - LAG(orders) OVER (ORDER BY month)) / LAG(orders) OVER (ORDER BY month), 1).`,
        `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01' GROUP BY month) SELECT month, ROUND(100.0 * (orders - LAG(orders) OVER (ORDER BY month)) / LAG(orders) OVER (ORDER BY month), 1) AS growth_pct FROM monthly ORDER BY month;`
      ],
      solution: `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01' GROUP BY month) SELECT month, ROUND(100.0 * (orders - LAG(orders) OVER (ORDER BY month)) / LAG(orders) OVER (ORDER BY month), 1) AS growth_pct FROM monthly ORDER BY month;`,
      ordered: true
    },
    {
      type: 'try',
      title: 'LEAD looks forward',
      body: `<p><code>LEAD</code> is the mirror image: it brings in the <b>next</b> month. In 2026 (January to June), each month sits next to the one after it. June, the last month in the data, has no next month, so it shows empty. LEAD is useful for questions like “how long until the next event?”</p>`,
      code: `WITH monthly AS (
    SELECT strftime('%Y-%m', order_date) AS month,
           COUNT(*) AS orders
    FROM orders
    WHERE order_date >= '2026-01-01'
    GROUP BY month
)
SELECT month,
       orders,
       LEAD(orders) OVER (ORDER BY month) AS next_month
FROM monthly
ORDER BY month;`
    },
    {
      id: 'sql-6-3-ex3',
      type: 'exercise',
      title: 'Your turn: peek at the next month',
      body: `<p>For orders per month in <b>2026</b> (from 2026-01-01 on), show <code>month</code>, <code>orders</code> and the <b>next month’s</b> orders as <code>next_month</code>, in month order.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `LEAD(orders) OVER (ORDER BY month) AS next_month, with a WHERE order_date >= '2026-01-01' inside the CTE.`,
        `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2026-01-01' GROUP BY month) SELECT month, orders, LEAD(orders) OVER (ORDER BY month) AS next_month FROM monthly ORDER BY month;`
      ],
      solution: `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2026-01-01' GROUP BY month) SELECT month, orders, LEAD(orders) OVER (ORDER BY month) AS next_month FROM monthly ORDER BY month;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'LAG with PARTITION BY: a timeline per customer',
      body: `<p>Add <code>PARTITION BY</code> and every group gets its <b>own line of runners</b>. <code>LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)</code> means: for each customer, line up their orders by date, and look at that customer’s <b>previous order</b>. The first order of every customer has nothing behind it.</p>
<p>Subtract the dates and you get the <b>number of days between orders</b>, a number that tells a business how quickly customers come back.</p>`
    },
    {
      type: 'try',
      title: 'Customer 524: the story of 15 orders',
      body: `<p>Customer 524 (our joint-top customer) placed 15 orders over three years. Look at the <code>days_since_previous</code> column: 87, 168, then <b>402 days of silence</b> between November 2023 and December 2024. Then they came back, and ordered again after 14, 20, and just <b>1 day</b>. A customer who disappears and returns is exactly what a marketing team would love to understand.</p>`,
      code: `SELECT order_id,
       order_date,
       CAST(julianday(order_date) - julianday(LAG(order_date) OVER (ORDER BY order_date, order_id)) AS INTEGER) AS days_since_previous
FROM orders
WHERE customer_id = 524
ORDER BY order_date, order_id;`
    },
    {
      id: 'sql-6-3-ex4',
      type: 'exercise',
      title: 'Your turn: customer 524’s gaps',
      body: `<p>Recreate it. For <b>customer 524</b> only, show <code>order_id</code>, <code>order_date</code> and the whole days since their previous order, called <code>days_since_previous</code> (use <code>CAST(... AS INTEGER)</code> on the date difference). Sort by <code>order_date</code>, then <code>order_id</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `CAST(julianday(order_date) - julianday(LAG(order_date) OVER (ORDER BY order_date, order_id)) AS INTEGER), with WHERE customer_id = 524.`,
        `SELECT order_id, order_date, CAST(julianday(order_date) - julianday(LAG(order_date) OVER (ORDER BY order_date, order_id)) AS INTEGER) AS days_since_previous FROM orders WHERE customer_id = 524 ORDER BY order_date, order_id;`
      ],
      solution: `SELECT order_id, order_date, CAST(julianday(order_date) - julianday(LAG(order_date) OVER (ORDER BY order_date, order_id)) AS INTEGER) AS days_since_previous FROM orders WHERE customer_id = 524 ORDER BY order_date, order_id;`,
      ordered: true
    },
    {
      type: 'try',
      title: 'How fast do customers come back?',
      body: `<p>Now for <b>every</b> customer at once, with <code>PARTITION BY customer_id</code>. We have <b>8,018</b> gaps between consecutive orders, and the average gap is <b>195 days</b>, a little over six months. The chart shows how the gaps are spread: most are over 90 days, and only 16 orders happened on the same day as the customer’s previous order.</p>
<p>That is a business insight: if a customer hasn’t ordered in six or seven months, they are probably still a customer, just a slow-moving one. A “lost customer” alarm set at 30 days would be wrong for this business.</p>`,
      chart: 'bar',
      chartTitle: 'Gaps between a customer’s consecutive orders',
      code: `WITH gaps AS (
    SELECT customer_id,
           julianday(order_date)
             - julianday(LAG(order_date) OVER (PARTITION BY customer_id
                                               ORDER BY order_date, order_id)) AS gap
    FROM orders
)
SELECT CASE WHEN gap = 0   THEN 'same day'
            WHEN gap <= 30 THEN '1-30 days'
            WHEN gap <= 90 THEN '31-90 days'
            ELSE 'over 90 days'
       END AS gap_band,
       COUNT(*) AS gaps
FROM gaps
WHERE gap IS NOT NULL
GROUP BY gap_band
ORDER BY gaps DESC;`
    },
    {
      id: 'sql-6-3-c1',
      type: 'check',
      title: 'You use LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date). What does the first order of each customer show for the LAG column?',
      body: `<p>There is nobody behind the first runner in each line.</p>`,
      options: ['The last order of the same customer', 'NULL, because there is no previous order for that customer', '0', 'The first order of the next customer'],
      answer: 1,
      why: [
        'LAG looks backwards, never forwards or around in a circle.',
        'Yes! The first row of each partition has no previous row, so LAG gives NULL (unless you give a default as the third argument).',
        'It isn’t zero by default. You would have to ask for that with LAG(x, 1, 0).',
        'PARTITION BY keeps each customer in their own line, so rows never look into another customer’s timeline.'
      ]
    },
    {
      type: 'explain',
      title: 'Same month, last year',
      body: `<p>Monthly numbers bounce with the seasons, so managers compare “<b>this month versus the same month last year</b>”, the <i>year-over-year</i> (YoY) comparison. With monthly rows in order, “same month last year” is exactly <b>12 rows back</b>: <code>LAG(orders, 12)</code>.</p>
<div class="callout watch"><b>Trap:</b> this only works if you have <b>no missing months</b> between the two dates. Our gap check in Lesson 5.3 proved TradeFlow has no missing days, so it’s safe here. With a month missing, “12 rows back” would quietly point to the wrong month.</div>
<p>We build the monthly numbers for <b>all</b> months first, take the LAG, and <b>then</b> filter to 2025, so 2025 can still see 2024.</p>`
    },
    {
      type: 'try',
      title: '2025 versus 2024, month by month',
      body: `<p>January 2025 had 264 orders against 221 a year earlier: <b>+43</b>. But look at May: 240 against 274, so <b>-34</b>. The year as a whole is a mix of ups and downs, with no clear trend. You can see this in seconds because every row carries its own comparison.</p>`,
      code: `WITH monthly AS (
    SELECT strftime('%Y-%m', order_date) AS month,
           COUNT(*) AS orders
    FROM orders
    GROUP BY month
),
yoy AS (
    SELECT month,
           orders,
           LAG(orders, 12) OVER (ORDER BY month) AS last_year
    FROM monthly
)
SELECT month, orders, last_year, orders - last_year AS yoy_change
FROM yoy
WHERE month >= '2025-01' AND month <= '2025-12'
ORDER BY month;`
    },
    {
      id: 'sql-6-3-ex5',
      type: 'exercise',
      title: 'Challenge: the year-over-year table',
      body: `<p>Recreate the year-over-year table. Use CTEs <code>monthly</code> (orders per month for <b>all</b> months) and <code>yoy</code> (adding <code>LAG(orders, 12)</code> as <code>last_year</code>). Show <code>month</code>, <code>orders</code>, <code>last_year</code> and <code>yoy_change</code> (orders minus last_year) for the months from <b>2025-01</b> to <b>2025-12</b>, in month order.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Don't filter the months inside monthly. Apply WHERE month >= '2025-01' AND month <= '2025-12' only in the final SELECT.`,
        `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders GROUP BY month), yoy AS (SELECT month, orders, LAG(orders, 12) OVER (ORDER BY month) AS last_year FROM monthly) SELECT month, orders, last_year, orders - last_year AS yoy_change FROM yoy WHERE month >= '2025-01' AND month <= '2025-12' ORDER BY month;`
      ],
      solution: `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders GROUP BY month), yoy AS (SELECT month, orders, LAG(orders, 12) OVER (ORDER BY month) AS last_year FROM monthly) SELECT month, orders, last_year, orders - last_year AS yoy_change FROM yoy WHERE month >= '2025-01' AND month <= '2025-12' ORDER BY month;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Use <code>LAG</code> and <code>LEAD</code> to look at the previous and next row, with <code>ORDER BY</code> setting the line</li>
<li>Calculate changes and growth percentages, and know that the first row has nothing to compare to</li>
<li>Use <code>PARTITION BY</code> to give each customer their own timeline, and measure the days between events</li>
<li>Compare with the same period last year using <code>LAG(x, 12)</code>, filtering <i>after</i> the window</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>How would you calculate month-over-month growth in SQL?</li>
<li>What does <code>LAG(value, 1, 0)</code> do differently from <code>LAG(value)</code>?</li>
<li>How would you find the number of days between each customer’s consecutive orders?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Aggregate to one row per month, then use <code>LAG(metric) OVER (ORDER BY month)</code> and compute <code>(metric - prev) * 100.0 / prev</code>.</p>
<p><b>2.</b> The third argument is a default: the first row (which has no previous row) returns 0 instead of NULL.</p>
<p><b>3.</b> <code>julianday(order_date) - julianday(LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date))</code>, or <code>DATEDIFF</code> in other databases.</p>
</details>
<p><b>Coming next, Module 6 batch 2:</b> running totals (“how much have we earned so far this year?”), moving averages that smooth the noise out of a chart, and the final three window tools: <code>NTILE</code> (sort customers into quarters), <code>FIRST_VALUE</code> and <code>LAST_VALUE</code>.</p>`
    }
  ]
}
);
