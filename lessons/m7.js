LESSONS.push(
{
  id: 'sql-7-1',
  track: 'sql',
  title: '7.1 How the database thinks: query plans and EXPLAIN',
  tables: ['customers', 'orders', 'payments'],
  intro: `A query can be <b>perfectly correct</b> and still be <b>painfully slow</b>. When that happens, guessing is a waste of time. Professionals do something smarter: they <b>ask the database how it plans to run the query</b>, and read the answer.<br><br>In this lesson you will learn to read a <b>query plan</b>. Once you can read one, every later lesson in this module (indexes, fast habits) will make complete sense.`,
  steps: [
    {
      type: 'explain',
      title: 'You say where, the database picks the road',
      body: `<div class="callout analogy"><b>The big idea:</b> when you use a GPS, you tell it your <b>destination</b>, not which roads to take. The GPS (the <b>query planner</b>) looks at the map and picks a route. SQL works exactly like that: you describe <b>what you want</b>, and the database decides <b>how to get it</b>.</div>
<p>The route it chooses is called the <b>query plan</b>. Two correct queries that give the same answer can have very different plans, and one can be thousands of times faster than the other.</p>
<p>You can ask to see the plan by putting <code>EXPLAIN QUERY PLAN</code> in front of any query. It <b>doesn’t run the query</b>. It only shows the route. Read the <code>detail</code> column on the right: that’s the plan, in plain words.</p>`
    },
    {
      type: 'try',
      title: 'Your first query plan',
      body: `<p>Read the <code>detail</code> column: <b>SCAN customers</b>. “Scan” means the database will <b>read every row</b> of the table, one by one, to find the Nigerian customers. That is like looking for a word in a 2,000-page book by reading every single page.</p>
<p>A scan is fine for small tables. For millions of rows, it’s what makes queries slow.</p>`,
      code: `EXPLAIN QUERY PLAN
SELECT * FROM customers WHERE country = 'Nigeria';`
    },
    {
      type: 'explain',
      title: 'The vocabulary of plans',
      body: `<p>You will keep meeting the same few phrases. Learn them once:</p>
<table class="mini"><tr><th>You see</th><th>It means</th></tr>
<tr><td><code>SCAN table</code></td><td>Read every row of the table (the slow way for big tables)</td></tr>
<tr><td><code>SEARCH table USING INDEX ...</code></td><td>Jump straight to the matching rows using an index (the fast way)</td></tr>
<tr><td><code>USING COVERING INDEX</code></td><td>The index alone has everything needed, so the table isn’t even opened (fastest)</td></tr>
<tr><td><code>USE TEMP B-TREE FOR ORDER BY / GROUP BY / DISTINCT</code></td><td>The database must build a temporary sorted structure to sort, group or de-duplicate</td></tr>
<tr><td><code>AUTOMATIC INDEX</code> / <code>BLOOM FILTER</code></td><td>No permanent index existed, so the database made a temporary one on the fly</td></tr></table>`
    },
    {
      type: 'try',
      title: 'A surprise: even an ID lookup is a scan',
      body: `<p>You’d expect looking up <b>one customer by ID</b> to be instant. But the plan still says <b>SCAN customers</b>. Why? Because TradeFlow’s practice tables were loaded from CSV files, which carry <b>no primary keys and no indexes</b>.</p>
<p>In a real production database, a primary key automatically gets an index, so this lookup would be a SEARCH. In the next lesson, you will create an index yourself and watch this change.</p>`,
      code: `EXPLAIN QUERY PLAN
SELECT * FROM customers WHERE customer_id = 1473;`
    },
    {
      type: 'try',
      title: 'Sorting has a cost',
      body: `<p>Two lines this time. First the SCAN of payments, then <b>USE TEMP B-TREE FOR ORDER BY</b>: the database has no ready-sorted copy of the amounts, so it must <b>build a sorted temporary structure</b> every time you ask. Sorting millions of rows is expensive. This is why “ORDER BY on a huge table with no index” is a classic slow query.</p>`,
      code: `EXPLAIN QUERY PLAN
SELECT * FROM payments ORDER BY amount;`
    },
    {
      type: 'try',
      title: 'Grouping has a cost too',
      body: `<p>To group customers by country, the database scans the table and uses a temporary structure to collect each group: <b>USE TEMP B-TREE FOR GROUP BY</b>. Every GROUP BY, DISTINCT and ORDER BY on unindexed data pays this price.</p>`,
      code: `EXPLAIN QUERY PLAN
SELECT country, COUNT(*)
FROM customers
GROUP BY country;`
    },
    {
      id: 'sql-7-1-c1',
      type: 'check',
      title: 'A query plan says “SCAN orders”. What does that tell you?',
      body: `<p>Think about reading every page of a book.</p>`,
      options: ['The database will read every row of the orders table', 'The database will use a fast index', 'The query has an error', 'The orders table is empty'],
      answer: 0,
      why: [
        'Yes! SCAN means a full read of the table. Fine for small tables, a warning sign for huge ones.',
        'That would say SEARCH ... USING INDEX. A scan reads everything.',
        'A plan is shown for valid queries. It is not an error message.',
        'A scan happens whether the table has 10 rows or 10 million.'
      ]
    },
    {
      id: 'sql-7-1-ex1',
      type: 'exercise',
      title: 'Your turn: read a plan',
      body: `<p>Show the query plan for this exact query: <code>SELECT * FROM payments WHERE amount &gt; 500000;</code> (put <code>EXPLAIN QUERY PLAN</code> in front of it). Then ask yourself: scan or search?</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Type EXPLAIN QUERY PLAN, then the query exactly as written.`,
        `EXPLAIN QUERY PLAN SELECT * FROM payments WHERE amount > 500000;`
      ],
      solution: `EXPLAIN QUERY PLAN SELECT * FROM payments WHERE amount > 500000;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Plans for joins: the database may build its own index',
      body: `<p>With a join, the planner has extra decisions: <b>which table to read first</b>, and <b>how to find the matching rows</b> in the second table. If there is no index to help, a clever database may <b>build a temporary one on the fly</b> just for this query.</p>
<p>That is smart, but it’s a clue: if you see <code>AUTOMATIC INDEX</code> in a plan you run often, the database is doing extra work every time, and a <b>permanent index</b> would save it.</p>`
    },
    {
      type: 'try',
      title: 'A join plan',
      body: `<p>Read it line by line: <b>SCAN o</b> (it reads the orders table, the outer loop). Then, for each order, it needs the matching customer. There is no index on <code>customers.customer_id</code>, so you will see lines about a <b>BLOOM FILTER</b> and <b>SEARCH c USING AUTOMATIC COVERING INDEX (customer_id=?)</b>: the database built a throwaway index on the customers table for this query. (Your exact lines may differ slightly by SQLite version.)</p>`,
      code: `EXPLAIN QUERY PLAN
SELECT c.customer_name, o.order_id
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.order_status = 'Cancelled';`
    },
    {
      id: 'sql-7-1-ex2',
      type: 'exercise',
      title: 'Your turn: the plan for a join',
      body: `<p>Show the query plan for: <code>SELECT o.order_id, p.amount FROM orders o JOIN payments p ON p.order_id = o.order_id;</code></p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Put EXPLAIN QUERY PLAN in front of the query, written exactly as above.`,
        `EXPLAIN QUERY PLAN SELECT o.order_id, p.amount FROM orders o JOIN payments p ON p.order_id = o.order_id;`
      ],
      solution: `EXPLAIN QUERY PLAN SELECT o.order_id, p.amount FROM orders o JOIN payments p ON p.order_id = o.order_id;`,
      ordered: true
    },
    {
      id: 'sql-7-1-c2',
      type: 'check',
      title: 'You notice “AUTOMATIC INDEX” in the plan of a query that runs every minute. What might that mean?',
      body: `<p>Think about the database building something temporary each time.</p>`,
      options: ['Everything is perfectly optimised', 'The database builds a temporary index every time, so a permanent index may help', 'The query returns wrong results', 'The table needs to be deleted'],
      answer: 1,
      why: [
        'An automatic index shows the database is working around a missing index, which is not optimal.',
        'Yes! It rebuilds a throwaway index on every run. A permanent index you create once would save that repeated work.',
        'The plan says nothing about correctness. It is about speed.',
        'No table needs deleting. You might just need an index.'
      ]
    },
    {
      id: 'sql-7-1-ex3',
      type: 'exercise',
      title: 'Your turn: the plan for a GROUP BY',
      body: `<p>Show the query plan for: <code>SELECT payment_method, COUNT(*) FROM payments GROUP BY payment_method;</code></p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `EXPLAIN QUERY PLAN in front of the exact query.`,
        `EXPLAIN QUERY PLAN SELECT payment_method, COUNT(*) FROM payments GROUP BY payment_method;`
      ],
      solution: `EXPLAIN QUERY PLAN SELECT payment_method, COUNT(*) FROM payments GROUP BY payment_method;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Plans in other databases, and what you can do now',
      body: `<div class="callout work"><b>At work:</b> every major database has the same idea with a different name. <b>PostgreSQL</b> and <b>MySQL</b> use <code>EXPLAIN</code> (and <code>EXPLAIN ANALYZE</code>, which actually runs the query and shows real timings and row counts). <b>SQL Server</b> has graphical execution plans. Plans also show an estimated <i>cost</i>, and databases keep <b>statistics</b> about your data (how many rows, how varied) to choose a plan. Out-of-date statistics can cause bad plans, which is why DBAs run <code>ANALYZE</code> regularly.</div>
<p>In this lesson you learned to:</p>
<ul>
<li>Explain that you say <i>what</i> you want and the planner chooses <i>how</i></li>
<li>Show a plan with <code>EXPLAIN QUERY PLAN</code> without running the query</li>
<li>Read <b>SCAN</b> versus <b>SEARCH</b>, covering indexes, temp B-trees and automatic indexes</li>
<li>Know that sorting, grouping and joining all have a cost</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What does EXPLAIN do, and why use it?</li>
<li>What is the difference between a table scan and an index seek?</li>
<li>A query is slow. What is the first thing you do?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> It shows the execution plan the database will use, without (in most databases) running the query. You use it to understand and fix slow queries instead of guessing.</p>
<p><b>2.</b> A scan reads every row. An index seek/search jumps straight to matching rows via an index, which is much faster for selective filters on large tables.</p>
<p><b>3.</b> Look at the query plan: find the scans, the sorts and the joins that process the most rows, then decide whether an index or a rewrite fixes it. Measure before and after.</p>
</details>
<p><b>Coming next, Lesson 7.2: Indexes.</b> You will make a slow query run hundreds of times faster by creating an index, and see the plan change from SCAN to SEARCH.</p>`
    }
  ]
},
{
  id: 'sql-7-2',
  track: 'sql',
  title: '7.2 Indexes: the shortcut that makes queries fly',
  writeMode: true,
  tables: ['customers', 'orders', 'payments', 'order_items'],
  intro: `Here is a request every analyst eventually gets: <i>“This report takes forever. Can you make it faster?”</i><br><br>In this lesson you will take a query that is genuinely slow, even on TradeFlow’s modest 10,000 orders, and make it run <b>hundreds of times faster</b> with <b>one line of SQL</b>. That line creates an <b>index</b>. You will measure the speed-up yourself, using the timer under each result.`,
  steps: [
    {
      type: 'explain',
      title: 'The index at the back of the book',
      body: `<div class="callout analogy"><b>The big idea:</b> to find every mention of “Kenya” in a 500-page book, you don’t read all 500 pages. You open the <b>index at the back</b>, find “Kenya”, and it tells you: “pages 12, 87, 301.” An <b>index in a database</b> is the same thing: a separate, sorted lookup list that points to where the matching rows are.</div>
<p>The price: the index takes <b>extra space</b>, and every time you add or change a row, the database must <b>update the index too</b>. So indexes make <b>reading faster</b> and <b>writing slightly slower</b>.</p>
<div class="callout watch"><b>Sandbox lesson:</b> in this lesson (and the next two) you are allowed to create and drop things. Everything lives in your browser and <b>resets when you refresh the page</b>, so you can’t break anything. Experiment freely!</div>`
    },
    {
      type: 'try',
      title: 'A slow query: before',
      body: `<p>For <b>each of the 2,000 customers</b>, this counts their orders with a correlated subquery (Lesson 4.2), then adds up the counts. The answer is <b>10,000 orders over 2,000 customers</b>. Run it and <b>look at the time</b> under the table. On most computers it takes <b>a second or more</b>. Remember that number.</p>
<p>Why so slow? For every customer, the database reads the <b>whole orders table</b> (10,000 rows) to find that customer’s orders: 2,000 times 10,000 is <b>20 million row checks</b>.</p>`,
      code: `SELECT SUM(n) AS total_orders,
       COUNT(*) AS customers
FROM (SELECT c.customer_id,
             (SELECT COUNT(*)
              FROM orders o
              WHERE o.customer_id = c.customer_id) AS n
      FROM customers c);`
    },
    {
      type: 'try',
      title: 'The plan of the inner lookup',
      body: `<p>The inner question, “how many orders does customer 1473 have?”, shows <b>SCAN orders</b>: every row, every time. That is the problem in one line.</p>`,
      code: `EXPLAIN QUERY PLAN
SELECT COUNT(*) FROM orders WHERE customer_id = 1473;`
    },
    {
      type: 'try',
      title: 'Create the index: one line',
      body: `<p><code>CREATE INDEX name ON table(column)</code> builds the lookup list. We name it <code>idx_orders_customer</code> (a common style: <code>idx_table_column</code>). We use <code>IF NOT EXISTS</code> so you can run it again without an error. The result says the statement ran, with no rows, because it <i>changes</i> the database rather than asking it a question.</p>`,
      code: `CREATE INDEX IF NOT EXISTS idx_orders_customer
ON orders(customer_id);`
    },
    {
      type: 'try',
      title: 'The plan, after',
      body: `<p>Run the same plan again. It now says <b>SEARCH orders USING COVERING INDEX idx_orders_customer (customer_id=?)</b>. Not a scan: a <b>search</b>, a jump straight to customer 1473’s rows. “Covering” means the index alone answered the question, so the table wasn’t even opened.</p>`,
      code: `EXPLAIN QUERY PLAN
SELECT COUNT(*) FROM orders WHERE customer_id = 1473;`
    },
    {
      type: 'try',
      title: 'The slow query, after the index',
      body: `<p>Run the <b>same slow query</b> again. Same answer, <b>10,000 orders over 2,000 customers</b>, but compare the time to your “before”: it should drop from <b>around a second</b> to a <b>few thousandths of a second</b>, hundreds of times faster. Nothing about the query changed. We only gave the database a shortcut.</p>`,
      code: `SELECT SUM(n) AS total_orders,
       COUNT(*) AS customers
FROM (SELECT c.customer_id,
             (SELECT COUNT(*)
              FROM orders o
              WHERE o.customer_id = c.customer_id) AS n
      FROM customers c);`
    },
    {
      id: 'sql-7-2-c1',
      type: 'check',
      title: 'What is the main trade-off of adding indexes to a table?',
      body: `<p>Think about the index at the back of a book, and what happens when the book is edited.</p>`,
      options: ['They make reading faster but use space and slow down inserts and updates', 'They make everything faster with no downside', 'They make reading slower but writing faster', 'They delete duplicate rows'],
      answer: 0,
      why: [
        'Yes! Every index must be kept up to date on each INSERT, UPDATE and DELETE, and it takes storage. You index what you read often, not everything.',
        'There is always a cost: storage, and slower writes. That is why you don’t index every column.',
        'It’s the other way round: reads get faster, writes pay a small price.',
        'Indexes never delete data. They are lookup lists.'
      ]
    },
    {
      id: 'sql-7-2-ex1',
      type: 'exercise',
      title: 'Your turn: create an index and prove it works',
      body: `<p>In one run, do two things: <b>(1)</b> create an index named <code>idx_orders_customer</code> on <code>orders(customer_id)</code> (use <code>IF NOT EXISTS</code>), then <b>(2)</b> show the query plan for <code>SELECT COUNT(*) FROM orders WHERE customer_id = 1473;</code>. Separate the two statements with a semicolon.</p>`,
      starter: `-- Step 1: create the index (IF NOT EXISTS)\n-- Step 2: show the plan for the lookup\n\n`,
      hints: [
        `CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id); then EXPLAIN QUERY PLAN SELECT COUNT(*) FROM orders WHERE customer_id = 1473;`,
        `CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id); EXPLAIN QUERY PLAN SELECT COUNT(*) FROM orders WHERE customer_id = 1473;`
      ],
      solution: `CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id); EXPLAIN QUERY PLAN SELECT COUNT(*) FROM orders WHERE customer_id = 1473;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Composite indexes: the phone book',
      body: `<p>An index can cover <b>two columns</b>. Think of a phone book sorted by <b>last name, then first name</b>. It’s great if you search by last name, or by last name <i>and</i> first name. But it is <b>useless if you only know the first name</b>, because the book isn’t sorted by that.</p>
<p>That is the <b>leftmost rule</b>: a composite index on <code>(payment_method, payment_status)</code> helps queries that filter on <b>method</b>, or on <b>method and status</b>, but not on <b>status alone</b>.</p>`
    },
    {
      type: 'try',
      title: 'A two-column index in action',
      body: `<p>We create the index and ask for the plan of a query that filters on <b>both</b> columns. The plan: <b>SEARCH payments USING COVERING INDEX idx_payments_method_status (payment_method=? AND payment_status=?)</b>, a direct jump to the Card and Paid rows.</p>`,
      code: `CREATE INDEX IF NOT EXISTS idx_payments_method_status
ON payments(payment_method, payment_status);

EXPLAIN QUERY PLAN
SELECT COUNT(*) FROM payments
WHERE payment_method = 'Card' AND payment_status = 'Paid';`
    },
    {
      type: 'try',
      title: 'The leftmost rule: filtering on the second column only',
      body: `<p>Now we filter on <b>status only</b>. The plan shows <b>SCAN payments USING COVERING INDEX</b>: it still has to <b>walk through the whole index</b>, because the index is sorted by method first. It’s better than scanning the table, but it’s not a quick jump. Compare this with the previous plan: that difference is the leftmost rule.</p>`,
      code: `EXPLAIN QUERY PLAN
SELECT COUNT(*) FROM payments
WHERE payment_status = 'Paid';`
    },
    {
      id: 'sql-7-2-ex2',
      type: 'exercise',
      title: 'Your turn: a composite index',
      body: `<p>In one run: create an index named <code>idx_payments_method_status</code> on <code>payments(payment_method, payment_status)</code> (use <code>IF NOT EXISTS</code>), then show the query plan for <code>SELECT COUNT(*) FROM payments WHERE payment_method = 'Card' AND payment_status = 'Paid';</code>.</p>`,
      starter: `-- Write your statements below\n\n`,
      hints: [
        `CREATE INDEX IF NOT EXISTS idx_payments_method_status ON payments(payment_method, payment_status); then EXPLAIN QUERY PLAN with the exact query.`,
        `CREATE INDEX IF NOT EXISTS idx_payments_method_status ON payments(payment_method, payment_status); EXPLAIN QUERY PLAN SELECT COUNT(*) FROM payments WHERE payment_method = 'Card' AND payment_status = 'Paid';`
      ],
      solution: `CREATE INDEX IF NOT EXISTS idx_payments_method_status ON payments(payment_method, payment_status); EXPLAIN QUERY PLAN SELECT COUNT(*) FROM payments WHERE payment_method = 'Card' AND payment_status = 'Paid';`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'When NOT to add an index',
      body: `<p>Indexes aren’t magic. Here are the common mistakes:</p>
<ul>
<li><b>Tiny tables.</b> Scanning 50 rows is instant. An index adds nothing.</li>
<li><b>Columns with few different values</b> (like <code>order_status</code>, with 4 values). An index on a column where each value matches a quarter of the table barely helps. Good index columns are <b>selective</b>: IDs, dates, emails.</li>
<li><b>Tables that are written constantly</b> and rarely read. Each index slows every insert and update.</li>
<li><b>Too many indexes.</b> Index what your real queries filter, join and sort on.</li>
</ul>
<p>The golden rule: <b>index what you search by</b> (WHERE), <b>join on</b> (foreign keys) and <b>sort by</b> (ORDER BY), then check the plan to be sure it’s used.</p>`
    },
    {
      type: 'try',
      title: 'A unique index: the database as a guard',
      body: `<p>A <b>UNIQUE</b> index doesn’t just speed things up. It <b>forbids duplicates</b>. We try to say: “each product may appear only once in each order.” Run it and read the error: <b>UNIQUE constraint failed: order_items.order_id, order_items.product_id</b>.</p>
<p>The database refuses, because <b>147 pairs repeat</b>. You met them in Lesson 3.4, and you saw that they are real purchases: the same product added on a second line. So the database is telling you the truth: <b>that pair is not a valid key</b>. The right unique key for an order line is its own ID. Next card.</p>`,
      code: `CREATE UNIQUE INDEX idx_items_pair
ON order_items(order_id, product_id);`
    },
    {
      type: 'try',
      title: 'The correct unique key',
      body: `<p>The line’s own ID is genuinely unique, so this works. In a real database you would declare this as the table’s <b>PRIMARY KEY</b>, which is just a unique index with a name and a promise: “this column identifies each row, and it is never empty.”</p>`,
      code: `CREATE UNIQUE INDEX IF NOT EXISTS idx_items_id
ON order_items(order_item_id);`
    },
    {
      id: 'sql-7-2-ex3',
      type: 'exercise',
      title: 'Your turn: index a foreign key',
      body: `<p>Joins and lookups on <code>payments.order_id</code> are common. In one run: create an index named <code>idx_payments_order</code> on <code>payments(order_id)</code> (use <code>IF NOT EXISTS</code>), then show the plan for <code>SELECT amount FROM payments WHERE order_id = 7;</code>.</p>`,
      starter: `-- Write your statements below\n\n`,
      hints: [
        `CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id); then EXPLAIN QUERY PLAN SELECT amount FROM payments WHERE order_id = 7;`,
        `CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id); EXPLAIN QUERY PLAN SELECT amount FROM payments WHERE order_id = 7;`
      ],
      solution: `CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id); EXPLAIN QUERY PLAN SELECT amount FROM payments WHERE order_id = 7;`,
      ordered: true
    },
    {
      type: 'try',
      title: 'See every index you have made',
      body: `<p>The database keeps a list of everything it contains. Filtering for indexes shows the ones you have created in this session: their names and the tables they belong to.</p>`,
      code: `SELECT name, tbl_name
FROM sqlite_master
WHERE type = 'index'
ORDER BY name;`
    },
    {
      id: 'sql-7-2-ex4',
      type: 'exercise',
      title: 'Your turn: remove an index',
      body: `<p>Indexes can be removed with <code>DROP INDEX</code>. In one run: drop the index <code>idx_orders_customer</code> (use <code>IF EXISTS</code>), then show the plan for <code>SELECT COUNT(*) FROM orders WHERE customer_id = 1473;</code>. It should go back to a scan.</p>`,
      starter: `-- Write your statements below\n\n`,
      hints: [
        `DROP INDEX IF EXISTS idx_orders_customer; then EXPLAIN QUERY PLAN SELECT COUNT(*) FROM orders WHERE customer_id = 1473;`,
        `DROP INDEX IF EXISTS idx_orders_customer; EXPLAIN QUERY PLAN SELECT COUNT(*) FROM orders WHERE customer_id = 1473;`
      ],
      solution: `DROP INDEX IF EXISTS idx_orders_customer; EXPLAIN QUERY PLAN SELECT COUNT(*) FROM orders WHERE customer_id = 1473;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<div class="callout work"><b>At work:</b> in production, DBAs usually control indexes, and creating one on a huge table can take minutes and lock things. The analyst’s job is often to <b>find the missing index and recommend it</b>, with evidence: “this query scans 40 million rows 500 times a day; an index on <code>orders(customer_id)</code> turns it into a search.” <code>CREATE INDEX</code> looks the same in PostgreSQL, MySQL, SQL Server and Oracle. Primary keys and unique constraints create indexes automatically.</div>
<p>In this lesson you learned to:</p>
<ul>
<li>Explain an index as the lookup list at the back of a book, and its cost</li>
<li>Create one with <code>CREATE INDEX</code> and see the plan change from SCAN to SEARCH</li>
<li>Measure the speed-up with the timer</li>
<li>Use composite indexes and the <b>leftmost rule</b></li>
<li>Decide when <i>not</i> to index</li>
<li>Use a <b>UNIQUE</b> index as a guard, and understand why TradeFlow’s order lines can’t be unique on (order, product)</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is an index, and what is the trade-off?</li>
<li>You have a composite index on (A, B). Which of these queries can use it efficiently: WHERE A = 1, WHERE B = 1, WHERE A = 1 AND B = 1?</li>
<li>Why might the database ignore an index you created?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> An index is a separate sorted structure that lets the database find rows without scanning the whole table. It speeds up reads but uses storage and slows down writes.</p>
<p><b>2.</b> <code>WHERE A = 1</code> and <code>WHERE A = 1 AND B = 1</code> (the leftmost column is used). <code>WHERE B = 1</code> alone usually can’t use it efficiently.</p>
<p><b>3.</b> The filter isn’t selective (it matches a big part of the table), the column is wrapped in a function, the table is tiny, or the types don’t match. The planner decides a scan is cheaper.</p>
</details>
<p><b>Coming next, Lesson 7.3: Writing fast queries.</b> Indexes help, but how you write a query matters even more. You will learn the habits that keep queries quick as data grows, including one tiny change that makes an index work or not work.</p>`
    }
  ]
},
{
  id: 'sql-7-3',
  track: 'sql',
  title: '7.3 Writing fast queries: habits that scale',
  writeMode: true,
  tables: ['customers', 'orders', 'payments'],
  intro: `Indexes are half the story. The other half is <b>how you write the query</b>. A tiny change in wording can decide whether the database can use an index, or whether it has to do ten times the work. These habits cost nothing, they make queries faster on any database, and they are what separates tidy analysts from tidy <i>and fast</i> ones.`,
  steps: [
    {
      type: 'explain',
      title: 'Five habits of fast SQL',
      body: `<ol>
<li><b>Filter on the bare column.</b> Don’t wrap an indexed column in a function.</li>
<li><b>Ask for only the columns you need.</b> Not <code>SELECT *</code>.</li>
<li><b>Think in sets, not in rows.</b> Replace row-by-row correlated subqueries with joins, GROUP BY or windows.</li>
<li><b>Shrink data early.</b> Filter first, and summarise before you join (Lesson 4.3).</li>
<li><b>Don’t pay for what you don’t need.</b> Skip needless <code>DISTINCT</code>, <code>ORDER BY</code> and <code>UNION</code> (use <code>UNION ALL</code>).</li>
</ol>
<p>And one rule above all: <b>measure, don’t guess.</b> Use the plan and the timer.</p>`
    },
    {
      type: 'try',
      title: 'Habit 1: set up an index on dates',
      body: `<p>First we give <code>order_date</code> an index, so we can compare two ways of writing the same filter.</p>`,
      code: `CREATE INDEX IF NOT EXISTS idx_orders_date
ON orders(order_date);`
    },
    {
      type: 'try',
      title: 'Writing it the good way: a range',
      body: `<p>“Orders in 2025”, written as a <b>range</b> on the bare column. The plan: <b>SEARCH orders USING COVERING INDEX idx_orders_date (order_date&gt;? AND order_date&lt;?)</b>. It jumps straight to the start of 2025 and stops at the end. (You learned this half-open range style in Lesson 2.8.)</p>`,
      code: `EXPLAIN QUERY PLAN
SELECT COUNT(*) FROM orders
WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01';`
    },
    {
      type: 'try',
      title: 'Writing it the bad way: a function on the column',
      body: `<p>The same question, but with <code>strftime('%Y', order_date) = '2025'</code>. The plan now says <b>SCAN orders USING COVERING INDEX</b>: the database must <b>walk through the entire index</b>, calculating the year for every single row, because it can’t jump to “2025” inside an index of full dates. Same answer, much more work.</p>
<div class="callout tip"><b>The name for this:</b> a filter the index <i>can</i> use is called <b>SARGable</b> (“Search ARGument able”). Rule: <b>keep the column naked</b> on one side of the comparison and move the calculation to the other side.</div>`,
      code: `EXPLAIN QUERY PLAN
SELECT COUNT(*) FROM orders
WHERE strftime('%Y', order_date) = '2025';`
    },
    {
      id: 'sql-7-3-ex1',
      type: 'exercise',
      title: 'Your turn: the fast way to count 2025',
      body: `<p>Return one number, <code>orders_2025</code>: the number of orders in <b>2025</b>, written with a <b>half-open date range</b> on the bare <code>order_date</code> column (not a function). The answer is 2,879.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01'.`,
        `SELECT COUNT(*) AS orders_2025 FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01';`
      ],
      solution: `SELECT COUNT(*) AS orders_2025 FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01';`,
      ordered: true
    },
    {
      id: 'sql-7-3-c1',
      type: 'check',
      title: 'Which filter can use an index on order_date?',
      body: `<p>Keep the column naked.</p>`,
      options: ['WHERE strftime(\'%Y\', order_date) = \'2025\'', 'WHERE order_date >= \'2025-01-01\' AND order_date < \'2026-01-01\'', 'WHERE LOWER(order_date) = \'2025-03-01\'', 'They all can'],
      answer: 1,
      why: [
        'Wrapping the column in a function hides the raw values the index is sorted by, so the database has to scan.',
        'Yes! The column is bare, compared with plain values, so the index can jump to the right range.',
        'LOWER() on the column has the same problem: the index holds the original values, not the lowercase version.',
        'Functions on the column block the index. Only the bare range works.'
      ]
    },
    {
      type: 'explain',
      title: 'Habit 2: only the columns you need',
      body: `<p><code>SELECT *</code> asks for every column, which forces the database to go and <b>fetch the full row</b> from the table. If you only ask for columns that live <b>in the index</b>, it never has to open the table at all (the “covering index” you saw earlier). For wide tables with dozens of columns, this is a big saving.</p>
<p>It also protects you: if someone adds a new column next month, your query doesn’t change shape.</p>`
    },
    {
      type: 'try',
      title: 'Covering versus not covering',
      body: `<p>Compare two plans for the same 2025 range. Asking for just <b>COUNT(*)</b> is answered from the index alone (<b>COVERING INDEX</b>). Asking for <b>*</b> gives <b>USING INDEX</b> without “covering”: after finding the rows through the index, the database still has to go and read each full row from the table. Run it and read the two lines.</p>`,
      code: `EXPLAIN QUERY PLAN
SELECT * FROM orders
WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01';`
    },
    {
      type: 'explain',
      title: 'Habit 3: think in sets, not in rows',
      body: `<p>A <b>correlated subquery</b> (Lesson 4.2) conceptually runs once <b>per row</b>. For 2,000 customers, it asks 2,000 separate questions. A <b>join with GROUP BY</b> asks one big question and lets the database solve it all at once. Databases are built for sets, so set-based rewrites are usually dramatically faster.</p>
<p>Prove it. Here is the same question both ways: “how many orders does each customer have?” (This page has no index on <code>orders(customer_id)</code>, so the first one is slow. The index you built earlier was in another lesson, and this page started fresh.)</p>`
    },
    {
      type: 'try',
      title: 'Row by row: slow',
      body: `<p>The correlated version. Note the time. It runs a subquery for each of the 2,000 customers, scanning the orders table each time, so it takes <b>a second or more</b>.</p>`,
      code: `SELECT SUM(n) AS total_orders,
       COUNT(*) AS customers
FROM (SELECT c.customer_id,
             (SELECT COUNT(*)
              FROM orders o
              WHERE o.customer_id = c.customer_id) AS n
      FROM customers c);`
    },
    {
      type: 'try',
      title: 'All at once: fast',
      body: `<p>The set-based version: one LEFT JOIN and one GROUP BY. <b>Same answer</b> (10,000 and 2,000), but the time drops to <b>a few milliseconds</b>, with no index at all. We changed how we <i>asked</i>, and the database could solve it in one pass. (In my tests the Lesson 4.2 payments query, “payments above their own method’s average”, took over 6 seconds as a correlated subquery and about 7 milliseconds as a window function.)</p>`,
      code: `SELECT SUM(n) AS total_orders,
       COUNT(*) AS customers
FROM (SELECT c.customer_id,
             COUNT(o.order_id) AS n
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.customer_id
      GROUP BY c.customer_id);`
    },
    {
      id: 'sql-7-3-ex2',
      type: 'exercise',
      title: 'Your turn: set-based counting',
      body: `<p>Write the fast version for the <b>first 5 customers</b>: <code>customer_id</code> and the number of orders (<code>orders</code>), using <code>LEFT JOIN</code> and <code>GROUP BY</code> (no correlated subquery). Sort by <code>customer_id</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `LEFT JOIN orders to customers on customer_id, GROUP BY c.customer_id, COUNT(o.order_id).`,
        `SELECT c.customer_id, COUNT(o.order_id) AS orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id GROUP BY c.customer_id ORDER BY c.customer_id LIMIT 5;`
      ],
      solution: `SELECT c.customer_id, COUNT(o.order_id) AS orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id GROUP BY c.customer_id ORDER BY c.customer_id LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Habit 5: don’t pay for what you don’t need',
      body: `<p>Some keywords force the database to <b>build a sorted or de-duplicated structure</b>, which costs time on large data:</p>
<ul>
<li><code>DISTINCT</code>: has to sort or hash everything to remove repeats. Often added as a “bandage” after a join fan-out. Fix the cause (Lesson 3.4) instead.</li>
<li><code>UNION</code>: removes duplicates, so it must sort. <code>UNION ALL</code> doesn’t. Use UNION ALL when you know there are no repeats.</li>
<li><code>ORDER BY</code>: sorting everything, then maybe keeping only a few (with <code>LIMIT</code>). If an index already matches the sort order, the sort is free.</li>
</ul>`
    },
    {
      type: 'try',
      title: 'A sort the index makes free',
      body: `<p>“The first 5 orders by date.” With the date index, the plan says <b>SCAN orders USING INDEX idx_orders_date</b> and there is <b>no “USE TEMP B-TREE FOR ORDER BY” line</b>. The database simply reads the index in order and stops after 5 rows. Without the index, it would have to sort all 10,000 orders first.</p>`,
      code: `EXPLAIN QUERY PLAN
SELECT order_id FROM orders ORDER BY order_date LIMIT 5;`
    },
    {
      id: 'sql-7-3-ex3',
      type: 'exercise',
      title: 'Your turn: prove the range uses the index',
      body: `<p>In one run: create the index <code>idx_orders_date</code> on <code>orders(order_date)</code> (use <code>IF NOT EXISTS</code>), then show the plan for <code>SELECT COUNT(*) FROM orders WHERE order_date &gt;= '2025-01-01' AND order_date &lt; '2026-01-01';</code>.</p>`,
      starter: `-- Write your statements below\n\n`,
      hints: [
        `CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date); then EXPLAIN QUERY PLAN with the exact query.`,
        `CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date); EXPLAIN QUERY PLAN SELECT COUNT(*) FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01';`
      ],
      solution: `CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date); EXPLAIN QUERY PLAN SELECT COUNT(*) FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01';`,
      ordered: true
    },
    {
      id: 'sql-7-3-ex4',
      type: 'exercise',
      title: 'Your turn: a sort without a sort',
      body: `<p>In one run: create <code>idx_orders_date</code> on <code>orders(order_date)</code> (use <code>IF NOT EXISTS</code>), then show the plan for <code>SELECT order_id FROM orders ORDER BY order_date LIMIT 5;</code>. Check that there is no temporary B-tree line.</p>`,
      starter: `-- Write your statements below\n\n`,
      hints: [
        `Create the index first, then EXPLAIN QUERY PLAN the exact query.`,
        `CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date); EXPLAIN QUERY PLAN SELECT order_id FROM orders ORDER BY order_date LIMIT 5;`
      ],
      solution: `CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date); EXPLAIN QUERY PLAN SELECT order_id FROM orders ORDER BY order_date LIMIT 5;`,
      ordered: true
    },
    {
      id: 'sql-7-3-c2',
      type: 'check',
      title: 'A colleague adds DISTINCT to a query because the totals are too high after a join. What is the better fix?',
      body: `<p>Remember Lesson 3.4.</p>`,
      options: ['Keep DISTINCT, it always works', 'Find why the join repeats rows (a fan-out) and fix the cause, for example by summarising before joining', 'Add more joins', 'Use ORDER BY'],
      answer: 1,
      why: [
        'DISTINCT can hide a fan-out, but it’s slow, and it can also remove legitimately repeated rows (like the 147 repeated order lines), giving a different wrong answer.',
        'Yes! Find the cause: the join multiplies rows. Summarise the many side first, or use the right-level measure. Then the totals are right and the query is faster.',
        'More joins make fan-outs worse.',
        'ORDER BY changes the order, not the totals.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<div class="callout work"><b>At work:</b> in a real warehouse (BigQuery, Snowflake, Redshift), you are often billed by the amount of data scanned, so these habits save <b>money</b> as well as time. “Select only the columns you need and filter on partition dates” is standard advice there. The principle is identical in every database: <b>do less work</b>.</div>
<p>In this lesson you learned to:</p>
<ul>
<li>Keep indexed columns <b>naked</b> in filters (SARGable): use ranges, not functions</li>
<li>Select only the columns you need, and understand covering indexes</li>
<li>Replace row-by-row subqueries with set-based joins and GROUP BY</li>
<li>Avoid needless DISTINCT, UNION and sorting, and let an index provide the sort order</li>
<li>Measure with plans and timers</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>Why is <code>WHERE YEAR(date_col) = 2025</code> slower than a date range?</li>
<li>What is the difference between <code>UNION</code> and <code>UNION ALL</code>, performance-wise?</li>
<li>A query using a correlated subquery is slow. How would you speed it up?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> The function is applied to every row, so an index on the column can’t be used (the query isn’t SARGable). A range on the bare column lets the database seek directly in the index.</p>
<p><b>2.</b> UNION removes duplicates, which requires sorting or hashing. UNION ALL just stacks the rows, so it is faster. Use UNION ALL when duplicates are impossible or wanted.</p>
<p><b>3.</b> Rewrite it as a join with GROUP BY, or with a window function, and make sure the join columns are indexed. Check the plan and the timing before and after.</p>
</details>
<p><b>Coming next, Lesson 7.4: Views, and changing data safely.</b> Saving a query so everyone uses the same definition, and the commands that change data (INSERT, UPDATE, DELETE), along with the habits that stop a single missing WHERE from becoming a disaster.</p>`
    }
  ]
},
{
  id: 'sql-7-4',
  track: 'sql',
  title: '7.4 Views, and changing data safely',
  writeMode: true,
  tables: ['customers', 'orders', 'payments'],
  intro: `Two things every working analyst needs. First: <i>“Everyone in the company calculates ‘revenue’ slightly differently. Can we agree on one definition?”</i> That is what a <b>view</b> is for. Second: sooner or later you will need to <b>change</b> data, with <code>INSERT</code>, <code>UPDATE</code> or <code>DELETE</code>, and one forgotten <code>WHERE</code> can wipe out a company’s records.<br><br>In this lesson you will learn both, on a <b>practice copy</b> of the data that resets when you refresh. Perfect for making all your mistakes safely, here instead of at work.`,
  steps: [
    {
      type: 'explain',
      title: 'A view is a saved question',
      body: `<div class="callout analogy"><b>The big idea:</b> a <b>view</b> is a query that you <b>save with a name</b>. Afterwards you use the name as if it were a table. Think of a recipe card in a restaurant kitchen: the recipe is written down once, and every cook uses the same recipe.</div>
<p>Views are valuable because:</p>
<ul>
<li><b>One definition for everyone.</b> “Paid revenue” is defined once and reused, so reports agree.</li>
<li><b>Simpler queries.</b> Complicated joins are hidden behind a friendly name.</li>
<li><b>No data copied.</b> A view stores the <i>question</i>, not the answer. It always shows the current data.</li>
<li><b>Safety.</b> A view can show some columns and hide others.</li>
</ul>
<div class="callout watch"><b>Sandbox lesson:</b> everything here lives in your browser and <b>resets when you refresh</b>.</div>`
    },
    {
      type: 'try',
      title: 'Create your first view',
      body: `<p><code>CREATE VIEW name AS SELECT ...</code>. The query inside is a join across three tables, to total <b>Paid</b> money per customer country. Running this only <b>saves</b> the question. No results appear yet. (<code>IF NOT EXISTS</code> lets you run it again safely.)</p>`,
      code: `CREATE VIEW IF NOT EXISTS v_paid_revenue_by_country AS
SELECT c.country,
       ROUND(SUM(p.amount), 2) AS paid_revenue
FROM payments p
JOIN orders o ON o.order_id = p.order_id
JOIN customers c ON c.customer_id = o.customer_id
WHERE p.payment_status = 'Paid'
GROUP BY c.country;`
    },
    {
      type: 'try',
      title: 'Use it like a table',
      body: `<p>Now anyone can ask <code>SELECT * FROM v_paid_revenue_by_country</code>, with no joins to write. We even sorted and charted it. Rwanda leads with about <b>298 million</b>. If someone changes the definition of “paid revenue” (say, to exclude cancelled orders), they change <b>the view once</b>, and every report that uses it is fixed together.</p>`,
      chart: 'bar',
      chartTitle: 'Paid revenue by country (from the view)',
      code: `SELECT *
FROM v_paid_revenue_by_country
ORDER BY paid_revenue DESC;`
    },
    {
      id: 'sql-7-4-ex1',
      type: 'exercise',
      title: 'Your turn: create a view and use it',
      body: `<p>In one run: create a view named <code>v_orders_by_status</code> (use <code>IF NOT EXISTS</code>) that shows each <code>order_status</code> and the number of orders as <code>orders</code>. Then select everything from the view, most orders first.</p>`,
      starter: `-- Write your statements below\n\n`,
      hints: [
        `CREATE VIEW IF NOT EXISTS v_orders_by_status AS SELECT order_status, COUNT(*) AS orders FROM orders GROUP BY order_status; then SELECT * FROM v_orders_by_status ORDER BY orders DESC;`,
        `CREATE VIEW IF NOT EXISTS v_orders_by_status AS SELECT order_status, COUNT(*) AS orders FROM orders GROUP BY order_status; SELECT * FROM v_orders_by_status ORDER BY orders DESC;`
      ],
      solution: `CREATE VIEW IF NOT EXISTS v_orders_by_status AS SELECT order_status, COUNT(*) AS orders FROM orders GROUP BY order_status; SELECT * FROM v_orders_by_status ORDER BY orders DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Changing data: INSERT, UPDATE, DELETE',
      body: `<p>Three commands change data:</p>
<ul>
<li><code>INSERT INTO table VALUES (...)</code>: add a new row</li>
<li><code>UPDATE table SET column = value WHERE ...</code>: change existing rows</li>
<li><code>DELETE FROM table WHERE ...</code>: remove rows</li>
</ul>
<div class="callout watch"><b>The most dangerous words in SQL:</b> <code>UPDATE</code> or <code>DELETE</code> <b>without a WHERE</b>. They apply to <b>every row</b>. In a real database there is no undo button, unless you were careful. We will practise on a small <b>copy</b> of ten customers called <code>practice</code>, so nothing real is at risk.</div>`
    },
    {
      type: 'try',
      title: 'Make a safe practice copy',
      body: `<p><code>CREATE TABLE ... AS SELECT ...</code> copies the result of a query into a brand-new table. We take the first ten customers. Three countries show up several times: Rwanda (3), Ghana (3), Nigeria (2), Kenya (1) and South Africa (1). We start with <code>DROP TABLE IF EXISTS practice</code> so you can rerun this any time to <b>reset your practice data</b>.</p>`,
      code: `DROP TABLE IF EXISTS practice;

CREATE TABLE practice AS
SELECT customer_id, customer_name, country
FROM customers
WHERE customer_id <= 10;

SELECT * FROM practice ORDER BY customer_id;`
    },
    {
      type: 'try',
      title: 'INSERT: add a row',
      body: `<p>A new customer, number 11, is added. The table now has <b>11</b> rows. (In real tables you list the column names too, <code>INSERT INTO practice (customer_id, ...) VALUES (...)</code>, so a later column change can’t break it.)</p>`,
      code: `INSERT INTO practice VALUES (11, 'Test Person', 'Kenya');

SELECT COUNT(*) AS rows_now FROM practice;`
    },
    {
      type: 'explain',
      title: 'The safe habit: SELECT first, then UPDATE',
      body: `<div class="callout tip"><b>The professional routine for any change:</b>
<ol>
<li>Write the <b>WHERE</b> first, as a <code>SELECT</code>, and check it returns <b>exactly the rows you expect</b></li>
<li>Only then swap <code>SELECT</code> for <code>UPDATE</code> or <code>DELETE</code>, keeping the same WHERE</li>
<li>Check how many rows were changed with <code>SELECT changes()</code>. If you expected 1 and got 1000, stop</li>
</ol></div>`
    },
    {
      type: 'try',
      title: 'Preview, then update',
      body: `<p>Step 1: <code>SELECT</code> with the WHERE shows <b>exactly one row</b>: Andre Rivera (customer 3). Step 2: the same WHERE in an <code>UPDATE</code> changes his country to Ghana, and <code>changes()</code> confirms <b>1 row</b> was changed. Exactly what we expected.</p>`,
      code: `-- Step 1: preview the rows we are about to change
-- SELECT * FROM practice WHERE customer_id = 3;

-- Step 2: the same WHERE, now as an UPDATE
UPDATE practice SET country = 'Ghana' WHERE customer_id = 3;

SELECT changes() AS rows_changed;`
    },
    {
      type: 'try',
      title: 'The disaster: UPDATE without WHERE',
      body: `<p>Same command, <b>WHERE forgotten</b>. Look at the result: <b>every one of the 11 rows</b> is now “Ghana”, and <code>changes()</code> says 11. All the original countries are gone. In a production database, this is the kind of mistake that ends in an incident report. Rerun the “Make a safe practice copy” card to restore the data.</p>`,
      code: `UPDATE practice SET country = 'Ghana';

SELECT changes() AS rows_changed,
       (SELECT COUNT(DISTINCT country) FROM practice) AS different_countries;`
    },
    {
      type: 'explain',
      title: 'Transactions: the undo button',
      body: `<div class="callout analogy"><b>The big idea:</b> a <b>transaction</b> is a “try it and see” bubble around your changes. You write <code>BEGIN</code>, make changes, then either <code>COMMIT</code> (make them permanent) or <code>ROLLBACK</code> (pretend nothing happened). Think of drafting an email: you can still delete it before pressing Send.</div>
<p>Transactions are <b>all or nothing</b>: either every change inside is saved, or none is. That promise is what keeps bank transfers safe: money is never taken from one account without arriving in the other.</p>`
    },
    {
      type: 'try',
      title: 'Delete everything, then take it back',
      body: `<p>We <b>begin</b> a transaction, delete all rows, and then <b>roll back</b>. The final count shows the table is <b>unchanged</b>. The delete happened inside the bubble, and ROLLBACK popped it. (First run the “Make a safe practice copy” card to reset, so you know the starting point is 10 rows plus whatever you added.)</p>`,
      code: `BEGIN;
DELETE FROM practice;
ROLLBACK;

SELECT COUNT(*) AS rows_after_rollback FROM practice;`
    },
    {
      id: 'sql-7-4-c1',
      type: 'check',
      title: 'You run UPDATE customers SET country = \'Ghana\' with no WHERE clause. What happens?',
      body: `<p>Think about which rows the command applies to.</p>`,
      options: ['Nothing, SQL needs a WHERE', 'Every row in the table is changed', 'Only the first row is changed', 'SQL asks for confirmation'],
      answer: 1,
      why: [
        'SQL does not require a WHERE. Without it, the change applies to all rows. That is why people are so careful.',
        'Yes! No WHERE means every row. The best protections are: SELECT first, run changes inside a transaction, and check the changed-row count.',
        'There is no “first row only” rule. It is every row.',
        'Databases don’t ask. They do exactly what you wrote.'
      ]
    },
    {
      id: 'sql-7-4-ex2',
      type: 'exercise',
      title: 'Your turn: a careful update',
      body: `<p>In one run: reset the practice table (<code>DROP TABLE IF EXISTS practice;</code>, then <code>CREATE TABLE practice AS SELECT customer_id, customer_name, country FROM customers WHERE customer_id &lt;= 10;</code>), then <b>update customer 3’s country to 'Rwanda'</b> (with a WHERE!), then show all rows of <code>practice</code> sorted by <code>customer_id</code>.</p>`,
      starter: `-- Write your statements below\n\n`,
      hints: [
        `Reset the table, then UPDATE practice SET country = 'Rwanda' WHERE customer_id = 3; then SELECT * FROM practice ORDER BY customer_id;`,
        `DROP TABLE IF EXISTS practice; CREATE TABLE practice AS SELECT customer_id, customer_name, country FROM customers WHERE customer_id <= 10; UPDATE practice SET country = 'Rwanda' WHERE customer_id = 3; SELECT * FROM practice ORDER BY customer_id;`
      ],
      solution: `DROP TABLE IF EXISTS practice; CREATE TABLE practice AS SELECT customer_id, customer_name, country FROM customers WHERE customer_id <= 10; UPDATE practice SET country = 'Rwanda' WHERE customer_id = 3; SELECT * FROM practice ORDER BY customer_id;`,
      ordered: true
    },
    {
      id: 'sql-7-4-ex3',
      type: 'exercise',
      title: 'Your turn: a careful delete',
      body: `<p>In one run: reset the practice table (same two statements as before), <b>delete the customers from Ghana</b> (with a WHERE), then show the remaining rows sorted by <code>customer_id</code>. Seven customers should remain.</p>`,
      starter: `-- Write your statements below\n\n`,
      hints: [
        `DELETE FROM practice WHERE country = 'Ghana'; then SELECT * FROM practice ORDER BY customer_id;`,
        `DROP TABLE IF EXISTS practice; CREATE TABLE practice AS SELECT customer_id, customer_name, country FROM customers WHERE customer_id <= 10; DELETE FROM practice WHERE country = 'Ghana'; SELECT * FROM practice ORDER BY customer_id;`
      ],
      solution: `DROP TABLE IF EXISTS practice; CREATE TABLE practice AS SELECT customer_id, customer_name, country FROM customers WHERE customer_id <= 10; DELETE FROM practice WHERE country = 'Ghana'; SELECT * FROM practice ORDER BY customer_id;`,
      ordered: true
    },
    {
      id: 'sql-7-4-ex4',
      type: 'exercise',
      title: 'Your turn: the safety net',
      body: `<p>In one run: reset the practice table, then <code>BEGIN;</code> a transaction, <b>delete every row</b>, <code>ROLLBACK;</code>, and finally show <code>SELECT COUNT(*) AS rows_after_rollback FROM practice;</code>. The answer should be <b>10</b>.</p>`,
      starter: `-- Write your statements below\n\n`,
      hints: [
        `Reset, then BEGIN; DELETE FROM practice; ROLLBACK; then the COUNT query.`,
        `DROP TABLE IF EXISTS practice; CREATE TABLE practice AS SELECT customer_id, customer_name, country FROM customers WHERE customer_id <= 10; BEGIN; DELETE FROM practice; ROLLBACK; SELECT COUNT(*) AS rows_after_rollback FROM practice;`
      ],
      solution: `DROP TABLE IF EXISTS practice; CREATE TABLE practice AS SELECT customer_id, customer_name, country FROM customers WHERE customer_id <= 10; BEGIN; DELETE FROM practice; ROLLBACK; SELECT COUNT(*) AS rows_after_rollback FROM practice;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Module 7 complete: working like a professional',
      body: `<div class="callout work"><b>At work:</b> most analysts have <b>read-only</b> access to production data, and for good reason. You will mostly <code>SELECT</code>, create <b>views</b> and work in a <b>sandbox or staging</b> area. When you do change data, teams use backups, approval steps, and run changes inside transactions. In PostgreSQL and MySQL it’s <code>BEGIN</code> or <code>START TRANSACTION</code>; in SQL Server it’s <code>BEGIN TRANSACTION</code>. PostgreSQL also has <b>materialized views</b>: views whose results are <i>stored</i> and refreshed on a schedule, for slow queries that don’t need to be live.</div>
<p>Across four lessons you learned to:</p>
<ul>
<li>Read a query plan (SCAN versus SEARCH, temp B-trees, automatic indexes)</li>
<li>Create indexes, measure the speed-up, and know when <i>not</i> to index</li>
<li>Write fast queries: bare columns in filters, only the columns you need, set-based rewrites</li>
<li>Save a query as a <b>view</b> so everyone uses one definition</li>
<li>Change data safely: SELECT first, always WHERE, check the changed-row count, use transactions</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is a view, and how is it different from a table?</li>
<li>How would you protect against a mistaken UPDATE?</li>
<li>What does ROLLBACK do?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A view is a saved query that behaves like a virtual table. It stores no data of its own, and shows current data every time it is queried. A table stores the data itself.</p>
<p><b>2.</b> Preview the rows with a SELECT using the same WHERE, run the UPDATE inside a transaction, check the number of rows changed, and only then COMMIT (or ROLLBACK if it looks wrong). Also keep backups and use limited permissions.</p>
<p><b>3.</b> It cancels all changes made since the transaction began, restoring the data to its earlier state.</p>
</details>
<p><b>Coming next, Module 8: SQL in the real world.</b> The final module. You will put every skill together to answer end-to-end business questions: revenue and key metrics, cohorts and retention, the order-to-payment-to-delivery funnel, customer segmentation, a complete data-quality audit (including the “orders before signup” mystery), and a mock interview to finish.</p>`
    }
  ]
}
);
