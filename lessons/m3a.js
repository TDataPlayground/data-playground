LESSONS.push(
{
  id: 'sql-3-1',
  track: 'sql',
  title: '3.1 Your first join: connecting two tables with INNER JOIN',
  tables: ['customers', 'orders', 'payments', 'employees', 'regions'],
  intro: `Your manager asks: <i>“Show me each order with the customer’s name and country.”</i> But the orders table doesn’t have names. It only has a <code>customer_id</code> number. In Lesson 1.1 you solved this by hand: copy the ID, switch tables, look it up. That works for one order. TradeFlow has <b>10,000</b>.<br><br>A <b>JOIN</b> does that lookup for every single row, at once. It is the most important idea in all of SQL, and by the end of this lesson you will be doing it with confidence.`,
  steps: [
    {
      type: 'explain',
      title: 'A join is the detective trick, automated',
      body: `<div class="callout analogy"><b>The big idea:</b> a join <b>glues two tables together side by side</b>, matching rows using an ID they share. Imagine a pile of exam scripts (each with an admission number on top) and the school register (admission number, name, class). You put each script next to its register entry. Now every script shows a name. That is a join.</div>
<p>In SQL, you describe it with a sentence:</p>
<p><code>FROM orders JOIN customers ON orders.customer_id = customers.customer_id</code></p>
<p>Read it aloud: <i>“Take orders. Join customers. Match them where the order’s customer_id equals the customer’s customer_id.”</i> The part after <code>ON</code> is the <b>matching rule</b>, and it is always a primary key meeting its foreign key, exactly the pairs from your key map in Lesson 1.2.</p>`
    },
    {
      type: 'try',
      title: 'Your first join',
      body: `<p>Each row now has information from <b>both</b> tables: the order’s date from <code>orders</code>, and the customer’s name and country from <code>customers</code>. We wrote the table name before each column (<code>orders.order_date</code>) so there’s no doubt where it comes from. We sorted by order_id so the rows are always in the same order.</p>
<p>Look at order 1: <b>Erica Oconnell</b> from Kenya, the customer you found by hand in Lesson 1.1. SQL just did that detective work for every order.</p>`,
      code: `SELECT orders.order_id,
       orders.order_date,
       customers.customer_name,
       customers.country
FROM orders
INNER JOIN customers
        ON orders.customer_id = customers.customer_id
ORDER BY orders.order_id
LIMIT 5;`
    },
    {
      type: 'explain',
      title: 'Aliases: shorter names for tables',
      body: `<p>Typing <code>customers.customer_name</code> over and over gets tiring. Just like you can nickname a <i>column</i> with <code>AS</code>, you can nickname a <b>table</b>. Write the nickname right after the table name: <code>orders o</code> and <code>customers c</code>. From then on, <code>o.order_id</code> means “order_id from orders”.</p>
<div class="callout tip"><b>Professional habit:</b> use short, meaningful aliases (<code>o</code> for orders, <code>c</code> for customers) and put the alias in front of <b>every</b> column in a join query, even when it isn’t strictly needed. Anyone reading your query instantly knows where each column comes from.</div>`
    },
    {
      type: 'try',
      title: 'The same join, written like a professional',
      body: `<p>Same result as before, but much easier to read.</p>`,
      code: `SELECT o.order_id,
       o.order_date,
       c.customer_name,
       c.country
FROM orders o
INNER JOIN customers c
        ON o.customer_id = c.customer_id
ORDER BY o.order_id
LIMIT 5;`
    },
    {
      type: 'try',
      title: 'The famous error: ambiguous column name',
      body: `<p>Here we kept <code>customer_id</code> without saying which table. Both tables have a column with that name, so SQL doesn’t know which one you mean, and says so. <b>Run it and read the error.</b></p>
<p><b>The fix:</b> say which one: <code>o.customer_id</code> or <code>c.customer_id</code>. (Try it!) This error is so common that every analyst has met it a hundred times. It is just SQL asking you to be specific.</p>`,
      code: `SELECT customer_id, order_id
FROM orders o
INNER JOIN customers c
        ON o.customer_id = c.customer_id
LIMIT 5;`
    },
    {
      id: 'sql-3-1-c1',
      type: 'check',
      title: 'What does “ambiguous column name” mean?',
      body: `<p>Think about the query you just ran.</p>`,
      options: ['The column does not exist', 'More than one joined table has a column with that name, so SQL can’t tell which one you mean', 'The column is empty', 'The query is too long'],
      answer: 1,
      why: [
        'A missing column gives a different error (“no such column”). Here the column exists, in two places.',
        'Yes! Two tables both have customer_id. Put the alias in front (o.customer_id) and the confusion disappears.',
        'Empty cells never cause this error. It is about names, not values.',
        'Length doesn’t matter. It is about which table a name belongs to.'
      ]
    },
    {
      type: 'explain',
      title: 'What INNER JOIN keeps (and the row-count habit)',
      body: `<p><code>INNER JOIN</code> (you can also write just <code>JOIN</code>) keeps only the rows that have <b>a match on both sides</b>. An order whose customer can’t be found would disappear. A customer who never ordered would disappear.</p>
<div class="callout tip"><b>The habit that saves careers:</b> after every join, <b>count the rows</b> and compare with what you expected. If you join 10,000 orders to customers and get 10,000 back, every order found its customer. If you get 9,800, 200 orders vanished and you should find out why <i>before</i> you report any numbers.</div>`
    },
    {
      type: 'try',
      title: 'Did every order find its customer?',
      body: `<p><b>10,000</b>. Exactly the number of orders. Every single order matched a customer, which agrees with the orphan check you did in Lesson 1.2. The join is safe.</p>`,
      code: `SELECT COUNT(*) AS joined_rows
FROM orders o
INNER JOIN customers c
        ON o.customer_id = c.customer_id;`
    },
    {
      id: 'sql-3-1-ex1',
      type: 'exercise',
      title: 'Your turn: orders with customer names',
      body: `<p>Show <code>order_id</code> and <code>customer_name</code> for the <b>first 8 orders</b>, sorted by <code>order_id</code>. You need the orders table and the customers table.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Copy the shape of the professional query above, and keep only the two columns you need.`,
        `SELECT o.order_id, c.customer_name FROM orders o JOIN customers c ON o.customer_id = c.customer_id ORDER BY o.order_id LIMIT 8;`
      ],
      solution: `SELECT o.order_id, c.customer_name FROM orders o JOIN customers c ON o.customer_id = c.customer_id ORDER BY o.order_id LIMIT 8;`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Joins unlock new questions: orders per country',
      body: `<p>The orders table doesn’t have countries. The customers table does. With a join, you can finally ask <b>“how many orders came from each country?”</b> The chart shows Rwanda leading with 2,191 orders.</p>
<p>Notice the order of events: SQL <b>joins first</b>, producing one big combined table, and <i>then</i> groups it.</p>`,
      chart: 'bar',
      chartTitle: 'Orders per country',
      code: `SELECT c.country,
       COUNT(*) AS orders
FROM orders o
JOIN customers c
  ON o.customer_id = c.customer_id
GROUP BY c.country
ORDER BY orders DESC;`
    },
    {
      id: 'sql-3-1-ex2',
      type: 'exercise',
      title: 'Your turn: money by order status',
      body: `<p>The <code>payments</code> table has amounts, and the <code>orders</code> table has the order status. Show each <code>order_status</code> and the <b>total payment amount</b> rounded to 2 decimals (call it <code>total</code>), biggest first. Match them on <code>order_id</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `The matching rule is p.order_id = o.order_id. Then GROUP BY o.order_status with ROUND(SUM(p.amount), 2).`,
        `SELECT o.order_status, ROUND(SUM(p.amount), 2) AS total FROM orders o JOIN payments p ON p.order_id = o.order_id GROUP BY o.order_status ORDER BY total DESC;`
      ],
      solution: `SELECT o.order_status, ROUND(SUM(p.amount), 2) AS total FROM orders o JOIN payments p ON p.order_id = o.order_id GROUP BY o.order_status ORDER BY total DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Follow the arrows on your key map',
      body: `<p>You can join <b>any pair of tables</b> that are linked by a key. Your map from Lesson 1.2 is a treasure map:</p>
<ul>
<li><code>orders.customer_id</code> → <code>customers.customer_id</code></li>
<li><code>orders.employee_id</code> → <code>employees.employee_id</code></li>
<li><code>customers.region_id</code> → <code>regions.region_id</code></li>
<li><code>payments.order_id</code> → <code>orders.order_id</code></li>
</ul>
<p>Every arrow is a possible join. The matching rule in <code>ON</code> is always <b>“pointer = the thing it points to.”</b></p>`
    },
    {
      id: 'sql-3-1-ex3',
      type: 'exercise',
      title: 'Your turn: who handles the orders?',
      body: `<p>Join <code>orders</code> to <code>employees</code>. Show each employee <code>role</code> and the number of orders they handled (call it <code>orders</code>), most orders first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `The matching rule is o.employee_id = e.employee_id. Then GROUP BY e.role.`,
        `SELECT e.role, COUNT(*) AS orders FROM orders o JOIN employees e ON o.employee_id = e.employee_id GROUP BY e.role ORDER BY orders DESC;`
      ],
      solution: `SELECT e.role, COUNT(*) AS orders FROM orders o JOIN employees e ON o.employee_id = e.employee_id GROUP BY e.role ORDER BY orders DESC;`,
      ordered: true
    },
    {
      id: 'sql-3-1-ex4',
      type: 'exercise',
      title: 'Your turn: customers and their regions',
      body: `<p>Join <code>customers</code> to <code>regions</code>. Show <code>customer_id</code>, <code>customer_name</code> and <code>region_name</code> for the <b>first 5 customers</b>, sorted by <code>customer_id</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `The matching rule is c.region_id = r.region_id.`,
        `SELECT c.customer_id, c.customer_name, r.region_name FROM customers c JOIN regions r ON c.region_id = r.region_id ORDER BY c.customer_id LIMIT 5;`
      ],
      solution: `SELECT c.customer_id, c.customer_name, r.region_name FROM customers c JOIN regions r ON c.region_id = r.region_id ORDER BY c.customer_id LIMIT 5;`,
      ordered: true
    },
    {
      id: 'sql-3-1-ex5',
      type: 'exercise',
      title: 'Challenge: where are the cancellations?',
      body: `<p>Combine a join, a filter and a group. Show each <code>country</code> and the number of <b>Cancelled</b> orders from it (call it <code>cancelled_orders</code>), highest first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join orders to customers, filter WHERE o.order_status = 'Cancelled', then group by the country.`,
        `SELECT c.country, COUNT(*) AS cancelled_orders FROM orders o JOIN customers c ON o.customer_id = c.customer_id WHERE o.order_status = 'Cancelled' GROUP BY c.country ORDER BY cancelled_orders DESC;`
      ],
      solution: `SELECT c.country, COUNT(*) AS cancelled_orders FROM orders o JOIN customers c ON o.customer_id = c.customer_id WHERE o.order_status = 'Cancelled' GROUP BY c.country ORDER BY cancelled_orders DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Connect two tables with <code>JOIN ... ON</code>, matching a foreign key to a primary key</li>
<li>Use table aliases and put an alias in front of every column</li>
<li>Understand the “ambiguous column name” error and fix it</li>
<li>Know that <code>INNER JOIN</code> keeps only matches, and check row counts after every join</li>
<li>Join first, then filter and group, to answer questions that span tables</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What does an INNER JOIN return?</li>
<li>You join two tables and the row count is much lower than expected. What happened?</li>
<li>What is the purpose of the ON clause?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Only the rows that have a matching value in both tables, according to the ON condition.</p>
<p><b>2.</b> Some rows had no match in the other table, so INNER JOIN dropped them (for example, orphans, or customers who never ordered). Check with a LEFT JOIN to see which rows are missing.</p>
<p><b>3.</b> ON defines the matching rule: which column in one table should equal which column in the other, normally a foreign key and the primary key it points to.</p>
</details>
<p><b>Coming next, Lesson 3.2: LEFT JOIN.</b> INNER JOIN shows what matches. But analysts are often hunting for what is <b>missing</b>: customers who never ordered, orders that were never delivered. That needs a different kind of join.</p>`
    }
  ]
},
{
  id: 'sql-3-2',
  track: 'sql',
  title: '3.2 LEFT JOIN: finding what matches and what is missing',
  tables: ['customers', 'orders', 'deliveries'],
  intro: `Two new requests: <i>“Which customers have never placed an order?”</i> and <i>“Which orders have no delivery record?”</i><br><br>Both questions are about things that are <b>missing</b>. An INNER JOIN can’t answer them, because it throws away every row without a match, and those are exactly the rows you are hunting for. You need the join that <b>keeps everyone</b>: the <b>LEFT JOIN</b>.`,
  steps: [
    {
      type: 'explain',
      title: 'Keep everyone from the left',
      body: `<div class="callout analogy"><b>The big idea:</b> think of the class register versus the exam attendance sheet. An <b>INNER</b> join lists only students who <i>sat the exam</i>. A <b>LEFT</b> join starts from the full class register and lists <b>every student</b>, writing “absent” (an empty cell) for the ones with no exam script.</div>
<p>With <code>LEFT JOIN</code>, <b>every row from the left table is kept</b> (the table written before the word JOIN). Where the right table has a match, you see its values. Where it has no match, you see <code>NULL</code>.</p>
<p>The empty cells are not a problem. They are <b>the answer</b>.</p>`
    },
    {
      type: 'try',
      title: 'INNER JOIN: only customers who ordered',
      body: `<p>Joining customers to orders with INNER JOIN gives <b>10,000</b> rows: one for each order. The customers who never ordered are simply gone.</p>`,
      code: `SELECT COUNT(*) AS inner_rows
FROM customers c
INNER JOIN orders o
        ON c.customer_id = o.customer_id;`
    },
    {
      type: 'try',
      title: 'LEFT JOIN: everyone, even without orders',
      body: `<p>Now <b>10,018</b>. That is 10,000 order rows <b>plus 18 extra rows</b>: the 18 customers who never ordered, each kept once with empty order columns. The 18 are the same ones you found with <code>NOT IN</code> in Lesson 1.2. Now you can see them.</p>`,
      code: `SELECT COUNT(*) AS left_rows
FROM customers c
LEFT JOIN orders o
       ON c.customer_id = o.customer_id;`
    },
    {
      type: 'explain',
      title: 'The anti-join: LEFT JOIN plus IS NULL',
      body: `<p>Here is the pattern every analyst learns. To find the rows <b>with no match</b>:</p>
<ol>
<li><code>LEFT JOIN</code> so unmatched rows survive</li>
<li><code>WHERE right_table.key IS NULL</code> so that you keep <b>only</b> the unmatched ones</li>
</ol>
<p>It works because, for a row with no match, every column from the right table is empty. So “the order’s ID is empty” means “this customer has no order”. This is called an <b>anti-join</b>.</p>`
    },
    {
      type: 'try',
      title: 'The 18 customers who never ordered',
      body: `<p>There they are, by name. Marketing could send them a “welcome back” offer. Notice we test <code>o.order_id IS NULL</code>: a column from the <i>right</i> table that is never empty for a real match.</p>
<div class="callout work"><b>In other databases:</b> this works everywhere. Another way is <code>WHERE NOT EXISTS (...)</code>, which you will learn in Module 4. Be careful with <code>NOT IN</code>: if the list ever contains an empty value, <code>NOT IN</code> quietly returns <b>nothing</b>. The LEFT JOIN pattern doesn’t have that problem.</div>`,
      code: `SELECT c.customer_id,
       c.customer_name,
       c.country
FROM customers c
LEFT JOIN orders o
       ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL
ORDER BY c.customer_id;`
    },
    {
      id: 'sql-3-2-c1',
      type: 'check',
      title: 'In the anti-join, why do we test o.order_id IS NULL?',
      body: `<p>Think about what a LEFT JOIN puts in the columns of unmatched rows.</p>`,
      options: ['Because order IDs are sometimes missing from the orders table', 'Because for a customer with no match, every column from the orders side is empty, so an empty order_id means no order', 'Because NULL means zero orders', 'Because SQL requires IS NULL in every join'],
      answer: 1,
      why: [
        'Real orders always have an ID. The empty value comes from the join itself, not from the orders table.',
        'Yes! The LEFT JOIN keeps the customer, and fills the order columns with NULL because there was nothing to match.',
        'NULL is not zero. It means “no value here”. We use it as a signal that no matching row exists.',
        'Plenty of joins never use IS NULL. It’s only needed for this “find the missing ones” pattern.'
      ]
    },
    {
      id: 'sql-3-2-ex1',
      type: 'exercise',
      title: 'Your turn: Ghana’s silent customers',
      body: `<p>Find customers from <b>Ghana</b> who have <b>never placed an order</b>. Show <code>customer_id</code> and <code>customer_name</code>, sorted by <code>customer_id</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `LEFT JOIN customers to orders, then WHERE o.order_id IS NULL AND c.country = 'Ghana'.`,
        `SELECT c.customer_id, c.customer_name FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL AND c.country = 'Ghana' ORDER BY c.customer_id;`
      ],
      solution: `SELECT c.customer_id, c.customer_name FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL AND c.country = 'Ghana' ORDER BY c.customer_id;`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Orders that were never delivered',
      body: `<p>Count the orders with no delivery record, by order status. The answer: <b>500 orders, and every one of them is Cancelled</b>. That is a relief, because it makes business sense: if an order was cancelled, nothing was shipped, so there is no delivery record.</p>
<p>But dig one level deeper: Cancelled orders total 529, so <b>29 cancelled orders do have a delivery</b>, and 26 of them say “Delivered”. A cancelled order that was delivered? That is worth a question to the logistics team. The join found it.</p>`,
      chart: 'bar',
      chartTitle: 'Orders without a delivery record, by status',
      code: `SELECT o.order_status,
       COUNT(*) AS orders_without_delivery
FROM orders o
LEFT JOIN deliveries d
       ON d.order_id = o.order_id
WHERE d.delivery_id IS NULL
GROUP BY o.order_status
ORDER BY orders_without_delivery DESC;`
    },
    {
      id: 'sql-3-2-ex2',
      type: 'exercise',
      title: 'Your turn: count the undelivered',
      body: `<p>Return one number: how many orders have <b>no row in the deliveries table</b>. Call it <code>orders_without_delivery</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `LEFT JOIN orders to deliveries, keep rows where the delivery's ID is NULL, and COUNT(*).`,
        `SELECT COUNT(*) AS orders_without_delivery FROM orders o LEFT JOIN deliveries d ON d.order_id = o.order_id WHERE d.delivery_id IS NULL;`
      ],
      solution: `SELECT COUNT(*) AS orders_without_delivery FROM orders o LEFT JOIN deliveries d ON d.order_id = o.order_id WHERE d.delivery_id IS NULL;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Trap 1: COUNT(*) after a LEFT JOIN',
      body: `<p>Say you want “how many orders has each customer placed, <b>including customers with zero</b>?” You use a LEFT JOIN, and then count. But which count?</p>
<ul>
<li><code>COUNT(*)</code> counts rows. A customer with no orders still has <b>one row</b> (the kept one), so it counts <b>1</b>. Wrong!</li>
<li><code>COUNT(o.order_id)</code> counts only real order IDs, and skips empty ones, so it counts <b>0</b>. Correct.</li>
</ul>`
    },
    {
      type: 'try',
      title: 'Spot the wrong count',
      body: `<p>These are the customers with the fewest orders. Compare the two columns: <code>wrong_count</code> says <b>1</b> for every one of them, while <code>orders</code> correctly says <b>0</b>. If a report used COUNT(*) here, it would claim these customers each placed one order.</p>`,
      code: `SELECT c.customer_id,
       COUNT(*) AS wrong_count,
       COUNT(o.order_id) AS orders
FROM customers c
LEFT JOIN orders o
       ON c.customer_id = o.customer_id
GROUP BY c.customer_id
ORDER BY orders ASC, c.customer_id ASC
LIMIT 5;`
    },
    {
      id: 'sql-3-2-ex3',
      type: 'exercise',
      title: 'Your turn: the quietest customers',
      body: `<p>Show the <b>5 customers with the fewest orders</b> (including zero): <code>customer_id</code> and <code>orders</code>. Fewest first, with <code>customer_id</code> ascending as the tie-breaker.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `LEFT JOIN, group by customer, and count a column from the orders side: COUNT(o.order_id).`,
        `SELECT c.customer_id, COUNT(o.order_id) AS orders FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id ORDER BY orders ASC, c.customer_id ASC LIMIT 5;`
      ],
      solution: `SELECT c.customer_id, COUNT(o.order_id) AS orders FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id ORDER BY orders ASC, c.customer_id ASC LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Trap 2: ON versus WHERE',
      body: `<p>Here is the most subtle LEFT JOIN trap. Suppose you want <i>“every customer, along with their Completed orders.”</i> Where do you put <code>order_status = 'Completed'</code>?</p>
<ul>
<li>In <code>WHERE</code>: SQL joins first, then filters. A customer with no match has an empty status, and an empty status is never equal to 'Completed', so <b>that customer is removed</b>. Your LEFT JOIN quietly became an INNER JOIN.</li>
<li>In <code>ON</code>: the condition becomes part of the <b>matching rule</b>. Customers with no completed order are still kept, with empty cells.</li>
</ul>
<div class="callout tip"><b>Rule of thumb:</b> for a LEFT JOIN, conditions about the <b>right-hand table</b> belong in <code>ON</code>. Conditions about the <b>left-hand table</b> belong in <code>WHERE</code>.</div>`
    },
    {
      type: 'try',
      title: 'Filter in WHERE: customers vanish',
      body: `<p>Counting how many different customers appear. We get <b>1,945</b>, not 2,000. The 55 customers without a Completed order were removed by the WHERE.</p>`,
      code: `SELECT COUNT(DISTINCT c.customer_id) AS customers_kept
FROM customers c
LEFT JOIN orders o
       ON c.customer_id = o.customer_id
WHERE o.order_status = 'Completed';`
    },
    {
      type: 'try',
      title: 'Filter in ON: everybody stays',
      body: `<p>Same condition, moved into <code>ON</code>. Now <b>2,000</b>: every customer is kept. Customers with no Completed orders appear with empty order columns.</p>`,
      code: `SELECT COUNT(DISTINCT c.customer_id) AS customers_kept
FROM customers c
LEFT JOIN orders o
       ON c.customer_id = o.customer_id
      AND o.order_status = 'Completed';`
    },
    {
      id: 'sql-3-2-c2',
      type: 'check',
      title: 'You LEFT JOIN customers to orders and add WHERE o.order_status = \'Completed\'. What happens to a customer who has no orders at all?',
      body: `<p>Think about what is in the status column for that customer.</p>`,
      options: ['They stay, with empty order columns', 'They are removed, because an empty status is not equal to Completed', 'SQL shows an error', 'They are counted twice'],
      answer: 1,
      why: [
        'They would stay if the condition were in ON. In WHERE, the empty status fails the test.',
        'Yes! The WHERE runs after the join, an empty status never equals Completed, and the row is thrown away. Your LEFT JOIN behaves like an INNER JOIN.',
        'There is no error. The query is valid, and just quietly gives a different answer than you meant.',
        'Nothing is counted twice here. The row is simply filtered out.'
      ]
    },
    {
      id: 'sql-3-2-ex4',
      type: 'exercise',
      title: 'Your turn: silent customers by country',
      body: `<p>For each <code>country</code>, how many customers have <b>never placed an order</b>? Show the country and the count (call it <code>customers_without_orders</code>), highest first, with <code>country</code> A to Z as the tie-breaker.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Use the anti-join (LEFT JOIN + WHERE o.order_id IS NULL), then GROUP BY c.country.`,
        `SELECT c.country, COUNT(*) AS customers_without_orders FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL GROUP BY c.country ORDER BY customers_without_orders DESC, c.country;`
      ],
      solution: `SELECT c.country, COUNT(*) AS customers_without_orders FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL GROUP BY c.country ORDER BY customers_without_orders DESC, c.country;`,
      ordered: true
    },
    {
      id: 'sql-3-2-ex5',
      type: 'exercise',
      title: 'Challenge: customers who never completed a purchase',
      body: `<p>For each <code>country</code>, how many customers have <b>no Completed order</b> (including customers with no orders at all)? Show the country and the count (<code>no_completed_orders</code>), highest first, with <code>country</code> A to Z as the tie-breaker.</p>
<p><b>Hint to think about:</b> where should the <i>Completed</i> condition go, in ON or in WHERE?</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Put o.order_status = 'Completed' inside ON (after AND), then keep only the rows where o.order_id IS NULL.`,
        `SELECT c.country, COUNT(*) AS no_completed_orders FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.order_status = 'Completed' WHERE o.order_id IS NULL GROUP BY c.country ORDER BY no_completed_orders DESC, c.country;`
      ],
      solution: `SELECT c.country, COUNT(*) AS no_completed_orders FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.order_status = 'Completed' WHERE o.order_id IS NULL GROUP BY c.country ORDER BY no_completed_orders DESC, c.country;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'RIGHT JOIN and FULL JOIN',
      body: `<ul>
<li><code>RIGHT JOIN</code> is a LEFT JOIN with the tables swapped: it keeps everything from the <b>right</b> table.</li>
<li><code>FULL JOIN</code> (also called FULL OUTER JOIN) keeps everything from <b>both</b> sides, filling empty cells wherever there’s no match on either side.</li>
</ul>
<p>In real work, almost everyone writes LEFT JOIN and just swaps the table order, because it keeps queries easy to read. You will see RIGHT and FULL joins rarely, but you should know what they mean for interviews.</p>
<div class="callout work"><b>In other databases:</b> your lesson engine runs SQLite 3.39, which supports RIGHT and FULL joins. Older SQLite versions and MySQL don’t have FULL JOIN (people combine a LEFT and a RIGHT join with UNION instead). PostgreSQL, SQL Server and Oracle support all of them.</div>`
    },
    {
      type: 'try',
      title: 'A FULL JOIN in action',
      body: `<p>Everything from both tables. The count is <b>10,018</b>, the same as the LEFT JOIN. Why? Because the only unmatched rows are the 18 customers, and there are no orders without a customer (no orphans, remember?). With a FULL JOIN, if there had been orphan orders, they would have appeared too.</p>`,
      code: `SELECT COUNT(*) AS full_rows
FROM customers c
FULL JOIN orders o
       ON c.customer_id = o.customer_id;`
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Use <code>LEFT JOIN</code> to keep every row from the left table, with empty cells where there is no match</li>
<li>Find missing things with the <b>anti-join</b>: LEFT JOIN plus <code>WHERE right_key IS NULL</code></li>
<li>Count correctly after a LEFT JOIN using <code>COUNT(right_column)</code>, never <code>COUNT(*)</code></li>
<li>Put right-table conditions in <code>ON</code>, so a LEFT JOIN doesn’t quietly turn into an INNER JOIN</li>
<li>Recognise RIGHT and FULL joins</li>
<li>Question what you find: 29 cancelled orders have a delivery record</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is the difference between INNER JOIN and LEFT JOIN?</li>
<li>How would you find customers who have never placed an order?</li>
<li>You LEFT JOIN, then add a WHERE condition on the right table, and some left-table rows vanish. Why?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> INNER JOIN returns only rows with a match in both tables. LEFT JOIN returns every row from the left table, with NULLs in the right table’s columns where there is no match.</p>
<p><b>2.</b> <code>SELECT c.* FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL;</code></p>
<p><b>3.</b> Unmatched rows have NULLs in the right table’s columns, and a WHERE condition on those columns is never true for NULL, so the rows are filtered out. The LEFT JOIN behaves like an INNER JOIN. Move the condition into ON.</p>
</details>
<p><b>Coming next, Lesson 3.3: Joining three or more tables.</b> Real business questions rarely stop at two tables. “Which product category earns the most in Kenya?” needs four. You will learn to chain joins like stepping stones, and uncover a surprising problem with TradeFlow’s “paid revenue”.</p>`
    }
  ]
},
{
  id: 'sql-3-3',
  track: 'sql',
  title: '3.3 Joining three or more tables: following the path',
  tables: ['customers', 'orders', 'order_items', 'products', 'payments'],
  intro: `The CEO asks the kind of question that makes a real analyst earn their salary: <i>“Which product category earns the most money in Kenya?”</i><br><br>Think about where each piece lives. The <b>category</b> is on the products table. The <b>quantity and price</b> are on order items. Which order each item belongs to is on orders. And the <b>country</b> is on customers. That is <b>four tables</b>. Real questions almost never live in just one or two. In this lesson you will learn to chain joins like stepping stones across a river.`,
  steps: [
    {
      type: 'explain',
      title: 'Stepping stones',
      body: `<div class="callout analogy"><b>The big idea:</b> to cross a river you hop from stone to stone. To connect many tables, you <b>chain joins</b>: each new <code>JOIN</code> connects a new table to one that is <i>already in your query</i>.</div>
<p>The recipe:</p>
<ol>
<li>Work out <b>which columns you need</b> and which tables they live in</li>
<li>Draw the <b>path</b> between those tables using your key map (Lesson 1.2)</li>
<li>Write <code>FROM</code> the first table, then one <code>JOIN ... ON ...</code> per stone</li>
</ol>
<p>For “revenue by product category”, the path is short: <b>order_items → products</b>.</p>`
    },
    {
      type: 'try',
      title: 'Revenue by product category',
      body: `<p>Two tables. Each order line says <i>what quantity at what price</i>, and the products table says <i>what category it belongs to</i>. We multiply quantity by price for every line, add them up for each category, and the chart shows <b>Electronics</b> far ahead at about 608 million.</p>
<p>A good sign to notice: the five bars add up to exactly <b>1,581,981,450.50</b>, the same grand total you found in Lesson 2.5. Nothing was lost in the join.</p>`,
      chart: 'bar',
      chartTitle: 'Revenue by product category',
      code: `SELECT p.category,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p
  ON oi.product_id = p.product_id
GROUP BY p.category
ORDER BY revenue DESC;`
    },
    {
      type: 'explain',
      title: 'Which unit_price? Say which table',
      body: `<p>Both <code>order_items</code> and <code>products</code> have a <code>unit_price</code> column. We used <code>oi.unit_price</code>, the price <b>at the time of the sale</b>. A product’s price might change over time, and the order line remembers the price the customer actually paid. (In TradeFlow they happen to be identical on every line, which is reassuring, but you should still be explicit.)</p>
<p>Here is why aliases matter: <code>oi.unit_price</code> and <code>p.unit_price</code> are two different columns.</p>`
    },
    {
      type: 'try',
      title: 'Three tables: revenue by customer country',
      body: `<p>Path: <b>payments → orders → customers</b>. The payment knows the amount, the order knows the customer, and the customer knows the country. Each <code>JOIN</code> hops to the next stone. We count only <b>Paid</b> payments. Rwanda leads with about 298 million.</p>`,
      chart: 'bar',
      chartTitle: 'Paid revenue by customer country',
      code: `SELECT c.country,
       ROUND(SUM(p.amount), 2) AS paid_revenue
FROM payments p
JOIN orders o
  ON p.order_id = o.order_id
JOIN customers c
  ON o.customer_id = c.customer_id
WHERE p.payment_status = 'Paid'
GROUP BY c.country
ORDER BY paid_revenue DESC;`
    },
    {
      type: 'try',
      title: 'Four tables: the CEO’s question',
      body: `<p>Path: <b>order_items → orders → customers</b>, plus <b>order_items → products</b>. Notice the last join connects products back to order_items, a stone that’s already in the query. The path doesn’t have to be a straight line.</p>
<p>The answer for Kenya: <b>Electronics</b> earns about 117.8 million, more than Home &amp; Kitchen and Fashion. Question answered, from four tables, in one query.</p>`,
      chart: 'bar',
      chartTitle: 'Revenue by category in Kenya',
      code: `SELECT p.category,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN orders o
  ON oi.order_id = o.order_id
JOIN customers c
  ON o.customer_id = c.customer_id
JOIN products p
  ON oi.product_id = p.product_id
WHERE c.country = 'Kenya'
GROUP BY p.category
ORDER BY revenue DESC;`
    },
    {
      id: 'sql-3-3-c1',
      type: 'check',
      title: 'Which tables do you need to connect to find “revenue by product category in Kenya”?',
      body: `<p>Where do category, quantity and price, the order, and the country live?</p>`,
      options: ['Only order_items and products', 'order_items, products, orders and customers', 'Only customers and orders', 'All eight tables'],
      answer: 1,
      why: [
        'That gives revenue by category, but not by country. The country lives on customers, reached through orders.',
        'Yes! Category is on products, quantity and price on order_items, and the country on customers. Orders is the bridge between order_items and customers.',
        'Neither table has product categories or prices.',
        'You only need the tables on the path. Extra tables just slow the query and risk wrong counts.'
      ]
    },
    {
      id: 'sql-3-3-ex1',
      type: 'exercise',
      title: 'Your turn: average payment by order status',
      body: `<p>Join <code>payments</code> to <code>orders</code>. Show each <code>order_status</code> and the <b>average payment amount</b>, rounded to 2 decimals (<code>avg_payment</code>), highest first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join on p.order_id = o.order_id, then GROUP BY o.order_status with ROUND(AVG(p.amount), 2).`,
        `SELECT o.order_status, ROUND(AVG(p.amount), 2) AS avg_payment FROM payments p JOIN orders o ON p.order_id = o.order_id GROUP BY o.order_status ORDER BY avg_payment DESC;`
      ],
      solution: `SELECT o.order_status, ROUND(AVG(p.amount), 2) AS avg_payment FROM payments p JOIN orders o ON p.order_id = o.order_id GROUP BY o.order_status ORDER BY avg_payment DESC;`,
      ordered: true
    },
    {
      id: 'sql-3-3-ex2',
      type: 'exercise',
      title: 'Your turn: units per category',
      body: `<p>How many <b>units</b> were sold in each product <code>category</code>? Show the category and the total quantity (call it <code>units</code>), most units first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join order_items to products, then GROUP BY p.category with SUM(oi.quantity).`,
        `SELECT p.category, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON oi.product_id = p.product_id GROUP BY p.category ORDER BY units DESC;`
      ],
      solution: `SELECT p.category, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON oi.product_id = p.product_id GROUP BY p.category ORDER BY units DESC;`,
      ordered: true
    },
    {
      id: 'sql-3-3-ex3',
      type: 'exercise',
      title: 'Your turn: units per country (three tables)',
      body: `<p>How many <b>units</b> were sold to customers in each <code>country</code>? Show the country and the total quantity (<code>units</code>), most units first. Your path is <b>order_items → orders → customers</b>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Two joins: order_items to orders on order_id, then orders to customers on customer_id.`,
        `SELECT c.country, SUM(oi.quantity) AS units FROM order_items oi JOIN orders o ON oi.order_id = o.order_id JOIN customers c ON o.customer_id = c.customer_id GROUP BY c.country ORDER BY units DESC;`
      ],
      solution: `SELECT c.country, SUM(oi.quantity) AS units FROM order_items oi JOIN orders o ON oi.order_id = o.order_id JOIN customers c ON o.customer_id = c.customer_id GROUP BY c.country ORDER BY units DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Detective time: is “paid revenue” really revenue?',
      body: `<p>Remember the metric trap from Module 2: we decided “money received” means payments with the status <b>Paid</b>. But now that you can join, there is a harder question to ask:</p>
<p><b>Are some Paid payments attached to orders that were later Cancelled or Returned?</b></p>
<p>If an order was cancelled, you wouldn’t expect to keep the money. The payments table alone can’t answer this. You need to join to <code>orders</code> to see the order’s status.</p>`
    },
    {
      type: 'try',
      title: 'Paid money, split by order status',
      body: `<p>Read this one carefully. Of all the money marked <b>Paid</b>:</p>
<ul>
<li><b>Completed</b> orders: about 986 million</li>
<li><b>Processing</b> orders: about 214 million</li>
<li><b>Cancelled</b> orders: <b>73.1 million</b> (460 payments!)</li>
<li><b>Returned</b> orders: <b>68.4 million</b> (437 payments!)</li>
</ul>
<p>That is nearly <b>141.5 million</b> marked Paid on orders that were cancelled or returned. Either the refunds were never recorded, or payment statuses weren’t updated. We don’t know which. <b>An analyst doesn’t guess. An analyst flags it.</b> If you had reported “paid revenue” without this join, you would have overstated revenue by about 10%, and nobody would have known why.</p>`,
      chart: 'bar',
      chartTitle: 'Paid amount by order status',
      code: `SELECT o.order_status,
       ROUND(SUM(p.amount), 2) AS paid_amount,
       COUNT(*) AS paid_payments
FROM payments p
JOIN orders o
  ON p.order_id = o.order_id
WHERE p.payment_status = 'Paid'
GROUP BY o.order_status
ORDER BY paid_amount DESC;`
    },
    {
      id: 'sql-3-3-ex4',
      type: 'exercise',
      title: 'Challenge: Electronics revenue by country (four tables)',
      body: `<p>Four tables, one question. Show each customer <code>country</code> and the <b>Electronics</b> revenue from it (quantity times unit price from <code>order_items</code>, rounded to 2 decimals, called <code>revenue</code>), highest first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Path: order_items to products (for the category), order_items to orders, orders to customers (for the country). Filter WHERE p.category = 'Electronics'.`,
        `SELECT c.country, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON oi.product_id = p.product_id JOIN orders o ON oi.order_id = o.order_id JOIN customers c ON o.customer_id = c.customer_id WHERE p.category = 'Electronics' GROUP BY c.country ORDER BY revenue DESC;`
      ],
      solution: `SELECT c.country, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON oi.product_id = p.product_id JOIN orders o ON oi.order_id = o.order_id JOIN customers c ON o.customer_id = c.customer_id WHERE p.category = 'Electronics' GROUP BY c.country ORDER BY revenue DESC;`,
      ordered: true
    },
    {
      id: 'sql-3-3-ex5',
      type: 'exercise',
      title: 'Challenge: the five best-selling products',
      body: `<p>Which five products earn the most? Show <code>product_name</code> and its total revenue (quantity times unit price from <code>order_items</code>, rounded to 2 decimals, called <code>revenue</code>), highest first, with <code>product_id</code> as the tie-breaker. Group by <code>p.product_id</code> so two products can never be mixed up.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join order_items to products, GROUP BY p.product_id, then ORDER BY revenue DESC, p.product_id and LIMIT 5.`,
        `SELECT p.product_name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON oi.product_id = p.product_id GROUP BY p.product_id ORDER BY revenue DESC, p.product_id LIMIT 5;`
      ],
      solution: `SELECT p.product_name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON oi.product_id = p.product_id GROUP BY p.product_id ORDER BY revenue DESC, p.product_id LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Good habits for multi-table queries',
      body: `<div class="callout tip"><b>The multi-join checklist:</b>
<ol>
<li><b>Draw the path first.</b> A quick sketch of which tables connect to which saves you from guessing.</li>
<li><b>Add one join at a time</b> and check the row count after each. If a count jumps unexpectedly, you have found a problem early. (The next lesson shows what causes that.)</li>
<li><b>Only join the tables you need.</b> Extra tables slow the query and invite mistakes.</li>
<li><b>Alias everything</b> and write the alias before every column.</li>
<li><b>Tie out your totals</b> against a number you trust, like the grand total from Lesson 2.5.</li>
</ol></div>
<div class="callout work"><b>At work:</b> a real warehouse can have hundreds of tables, but the skill is identical: find the path, join step by step, verify. Many teams also keep a diagram of their tables’ relationships (an <i>entity-relationship diagram</i>), like the key map you have been using.</div>`
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Chain joins across three, four or more tables by following the key path</li>
<li>Pick the right <code>unit_price</code> (or any shared column name) using aliases</li>
<li>Answer real business questions that span the whole database</li>
<li>Use a join to challenge a number: 141.5 million “paid” on cancelled or returned orders</li>
<li>Follow a checklist for safe multi-table queries</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>How do you decide which tables to join for a question?</li>
<li>Does the order you write the joins in matter for INNER JOINs?</li>
<li>You joined three tables and the revenue total is higher than the real total. What would you check?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> List the columns the question needs, find the tables they live in, and trace the shortest path between them using the primary and foreign keys.</p>
<p><b>2.</b> For INNER JOINs the result is the same whatever order you write them in (the database chooses its own plan). For LEFT JOINs the order and the ON conditions do matter.</p>
<p><b>3.</b> Duplicated rows from a join (a “fan-out”): one row on one side matching several on the other, so amounts get counted more than once. Check row counts after each join and compare totals with a trusted source. That is exactly the next lesson.</p>
</details>
<p><b>Coming next, Lesson 3.4: Join traps.</b> The quiet mistake that inflates revenue, the 147 duplicate order lines hiding in TradeFlow, and how to protect every report you will ever write.</p>`
    }
  ]
}
);
