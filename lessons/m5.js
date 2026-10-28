LESSONS.push(
{
  id: 'sql-5-1',
  track: 'sql',
  title: '5.1 Your first CTE: naming each step with WITH',
  tables: ['customers', 'products', 'orders', 'order_items', 'payments'],
  intro: `At the end of the last module you wrote a query with <b>three layers of brackets</b> and the same derived table written <b>twice</b>. It worked, but you had to read it from the inside out, like peeling an onion, and fixing a bug in it would be miserable.<br><br>Professional analysts have a better way. They <b>name each step</b> and write the query <b>top to bottom, like a recipe</b>. It is called a <b>CTE</b> (Common Table Expression), it is used in almost every serious SQL file you will ever read, and by the end of this lesson you will use it with confidence.`,
  steps: [
    {
      type: 'explain',
      title: 'A recipe instead of an onion',
      body: `<div class="callout analogy"><b>The big idea:</b> a <b>CTE</b> is a <b>named step</b> you write at the top of your query. A recipe says: <i>“Step 1: dice the onions. Step 2: fry them. Step 3: add the tomatoes.”</i> Each step has a name, and each step builds on the one before. A CTE lets you write SQL the same way.</div>
<p>The shape is:</p>
<p><code>WITH step_name AS ( SELECT ... ) SELECT ... FROM step_name</code></p>
<p>The part in brackets is just a query you already know how to write. <code>WITH ... AS</code> gives its result a <b>name</b>, and then your main query uses that name <b>as if it were a table</b>. Compare this with a derived table from Lesson 4.3: it’s the same idea, but written <b>before</b> the main query instead of buried inside it.</p>`
    },
    {
      type: 'try',
      title: 'Your first CTE',
      body: `<p>Read it top to bottom. <b>Step 1</b> (the CTE, named <code>per_customer</code>): count the orders of each customer. <b>Step 2</b> (the main query): average that column. The answer is <b>5.05</b>, the same as Lesson 4.3, but now the query reads like a sentence instead of a puzzle.</p>
<div class="callout tip"><b>Good to know:</b> a CTE is <b>temporary</b>. It exists only for this one query and disappears afterwards. Nothing is saved in the database.</div>`,
      code: `WITH per_customer AS (
    SELECT customer_id, COUNT(*) AS orders
    FROM orders
    GROUP BY customer_id
)
SELECT ROUND(AVG(orders), 2) AS avg_orders
FROM per_customer;`
    },
    {
      id: 'sql-5-1-ex1',
      type: 'exercise',
      title: 'Your turn: average units per order',
      body: `<p>Write your first CTE. Step 1: a CTE called <code>per_order</code> that totals <code>quantity</code> as <code>units</code> for each <code>order_id</code> in <code>order_items</code>. Step 2: return the average of <code>units</code>, rounded to 2 decimals, called <code>avg_units_per_order</code>. (You did this with a derived table in Lesson 4.3: the answer is 7.52.)</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Start with WITH per_order AS ( SELECT order_id, SUM(quantity) AS units FROM order_items GROUP BY order_id ).`,
        `WITH per_order AS (SELECT order_id, SUM(quantity) AS units FROM order_items GROUP BY order_id) SELECT ROUND(AVG(units), 2) AS avg_units_per_order FROM per_order;`
      ],
      solution: `WITH per_order AS (SELECT order_id, SUM(quantity) AS units FROM order_items GROUP BY order_id) SELECT ROUND(AVG(units), 2) AS avg_units_per_order FROM per_order;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The payoff: write it once, use it twice',
      body: `<p>Here is where CTEs beat nested queries. In Lesson 4.3, to find customers with <b>above-average</b> orders, we had to write the “orders per customer” query <b>twice</b>: once to count, and once to average. With a CTE you write it <b>once</b> and use it <b>as many times as you like</b>.</p>`
    },
    {
      type: 'try',
      title: 'The three-layer nest, rewritten',
      body: `<p>Compare this with the monster from Lesson 4.3. Same answer, <b>770</b> customers, but now: the step is named, written once, and you can read it in order. The main query says “count the customers whose orders are more than the average of the same step.”</p>
<p>This is the biggest reason professionals love CTEs: <b>readable, and no repetition</b>.</p>`,
      code: `WITH per_customer AS (
    SELECT customer_id, COUNT(*) AS orders
    FROM orders
    GROUP BY customer_id
)
SELECT COUNT(*) AS above_average_customers
FROM per_customer
WHERE orders > (SELECT AVG(orders) FROM per_customer);`
    },
    {
      id: 'sql-5-1-c1',
      type: 'check',
      title: 'What is the biggest practical advantage of a CTE over a nested subquery?',
      body: `<p>Think about the monster query from Lesson 4.3.</p>`,
      options: ['It permanently saves the result in the database', 'It lets you name a step, read the query top to bottom, and reuse the step without repeating it', 'It always runs much faster', 'It lets you change data'],
      answer: 1,
      why: [
        'A CTE is temporary. It lives only for the one query that defines it.',
        'Yes! Readability and reuse. You name each step, write it once, and read your query like a recipe.',
        'Speed varies by database and is often similar. The real gain is clarity.',
        'CTEs are for reading and shaping data. They do not change it.'
      ]
    },
    {
      type: 'explain',
      title: 'Share of the total, the clean way',
      body: `<p>In Lesson 4.1 you calculated “percent of total” with a subquery inside the SELECT. CTEs make this pattern lovely: first calculate the totals per group (a CTE), then divide each by the grand total <b>of that same CTE</b>.</p>
<p>Let’s see how much of TradeFlow’s revenue comes from each country.</p>`
    },
    {
      type: 'try',
      title: 'Revenue share by country',
      body: `<p>The CTE <code>country_revenue</code> joins four tables once and sums the order lines per country. The main query then reuses it twice: for each country’s revenue, and for the grand total inside the brackets. Rwanda brings in <b>22.1%</b> of revenue, South Africa <b>18.3%</b>. And the percentages add up to 100, always a good check.</p>`,
      chart: 'pie',
      chartTitle: 'Share of revenue by country',
      code: `WITH country_revenue AS (
    SELECT c.country,
           ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    JOIN customers c ON o.customer_id = c.customer_id
    GROUP BY c.country
)
SELECT country,
       revenue,
       ROUND(100.0 * revenue / (SELECT SUM(revenue) FROM country_revenue), 1) AS pct_of_total
FROM country_revenue
ORDER BY revenue DESC;`
    },
    {
      id: 'sql-5-1-ex2',
      type: 'exercise',
      title: 'Your turn: the loyal customers, rewritten',
      body: `<p>Write the readable version yourself. Return one number, <code>above_average_customers</code>: how many customers placed <b>more orders than the average</b> number of orders per ordering customer. Use a CTE called <code>per_customer</code> and reuse it. The answer is 770.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `CTE: SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id. Main: COUNT(*) FROM per_customer WHERE orders > (SELECT AVG(orders) FROM per_customer).`,
        `WITH per_customer AS (SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id) SELECT COUNT(*) AS above_average_customers FROM per_customer WHERE orders > (SELECT AVG(orders) FROM per_customer);`
      ],
      solution: `WITH per_customer AS (SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id) SELECT COUNT(*) AS above_average_customers FROM per_customer WHERE orders > (SELECT AVG(orders) FROM per_customer);`,
      ordered: true
    },
    {
      id: 'sql-5-1-ex3',
      type: 'exercise',
      title: 'Your turn: revenue share by country',
      body: `<p>Show each <code>country</code> and its <b>percentage of total revenue</b>, rounded to 1 decimal (call it <code>pct</code>), biggest first. Revenue is quantity times unit price from <code>order_items</code>, joined through <code>orders</code> to <code>customers</code>. Use a CTE for the per-country revenue.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Build country_revenue as in the lesson, then SELECT country, ROUND(100.0 * revenue / (SELECT SUM(revenue) FROM country_revenue), 1) AS pct, ordered by revenue DESC.`,
        `WITH country_revenue AS (SELECT c.country, SUM(oi.quantity * oi.unit_price) AS revenue FROM order_items oi JOIN orders o ON oi.order_id = o.order_id JOIN customers c ON o.customer_id = c.customer_id GROUP BY c.country) SELECT country, ROUND(100.0 * revenue / (SELECT SUM(revenue) FROM country_revenue), 1) AS pct FROM country_revenue ORDER BY revenue DESC;`
      ],
      solution: `WITH country_revenue AS (SELECT c.country, SUM(oi.quantity * oi.unit_price) AS revenue FROM order_items oi JOIN orders o ON oi.order_id = o.order_id JOIN customers c ON o.customer_id = c.customer_id GROUP BY c.country) SELECT country, ROUND(100.0 * revenue / (SELECT SUM(revenue) FROM country_revenue), 1) AS pct FROM country_revenue ORDER BY revenue DESC;`,
      ordered: true
    },
    {
      id: 'sql-5-1-ex4',
      type: 'exercise',
      title: 'Your turn: who carries the money?',
      body: `<p>Of all <b>Paid</b> money, what share goes through each payment method? Show <code>payment_method</code> and its percentage of the total Paid amount, rounded to 1 decimal (call it <code>pct</code>), biggest first. Use a CTE called <code>method_totals</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `method_totals: SELECT payment_method, SUM(amount) AS total FROM payments WHERE payment_status = 'Paid' GROUP BY payment_method. Then divide each total by (SELECT SUM(total) FROM method_totals).`,
        `WITH method_totals AS (SELECT payment_method, SUM(amount) AS total FROM payments WHERE payment_status = 'Paid' GROUP BY payment_method) SELECT payment_method, ROUND(100.0 * total / (SELECT SUM(total) FROM method_totals), 1) AS pct FROM method_totals ORDER BY total DESC;`
      ],
      solution: `WITH method_totals AS (SELECT payment_method, SUM(amount) AS total FROM payments WHERE payment_status = 'Paid' GROUP BY payment_method) SELECT payment_method, ROUND(100.0 * total / (SELECT SUM(total) FROM method_totals), 1) AS pct FROM method_totals ORDER BY total DESC;`,
      ordered: true
    },
    {
      id: 'sql-5-1-ex5',
      type: 'exercise',
      title: 'Challenge: customers who pay more than average',
      body: `<p>Among customers who have paid anything, how many have a <b>total Paid amount above the average customer’s total</b>? Build a CTE called <code>paid</code> with each customer’s total Paid amount (join <code>orders</code> to <code>payments</code>, filter on Paid, group by <code>customer_id</code>). Return one number called <code>above_average_payers</code>. The answer is 878.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `paid: SELECT o.customer_id, SUM(p.amount) AS total_paid FROM orders o JOIN payments p ON p.order_id = o.order_id WHERE p.payment_status = 'Paid' GROUP BY o.customer_id.`,
        `WITH paid AS (SELECT o.customer_id, SUM(p.amount) AS total_paid FROM orders o JOIN payments p ON p.order_id = o.order_id WHERE p.payment_status = 'Paid' GROUP BY o.customer_id) SELECT COUNT(*) AS above_average_payers FROM paid WHERE total_paid > (SELECT AVG(total_paid) FROM paid);`
      ],
      solution: `WITH paid AS (SELECT o.customer_id, SUM(p.amount) AS total_paid FROM orders o JOIN payments p ON p.order_id = o.order_id WHERE p.payment_status = 'Paid' GROUP BY o.customer_id) SELECT COUNT(*) AS above_average_payers FROM paid WHERE total_paid > (SELECT AVG(total_paid) FROM paid);`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Write a CTE with <code>WITH name AS ( ... )</code> and use it like a table</li>
<li>Read and write queries <b>top to bottom</b>, like a recipe</li>
<li>Write a step <b>once</b> and use it several times</li>
<li>Build percent-of-total reports cleanly</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is a CTE, and how does it differ from a subquery?</li>
<li>Is the result of a CTE stored in the database?</li>
<li>When would you choose a CTE over a nested subquery?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A CTE (Common Table Expression) is a named temporary result defined with <code>WITH</code> before the main query. It does the same job as a derived table, but it is named, written up front, and can be referenced several times, which makes queries much easier to read.</p>
<p><b>2.</b> No. It exists only while that single query runs.</p>
<p><b>3.</b> When the logic has several steps, when a step is needed more than once, or when readability and debugging matter. That is nearly always in real work.</p>
</details>
<p><b>Coming next, Lesson 5.2: Chaining CTEs.</b> One CTE is useful. Several, each building on the last, is a superpower. You will build a customer segmentation (Gold, Silver, Bronze) step by step, the professional way.</p>`
    }
  ]
},
{
  id: 'sql-5-2',
  track: 'sql',
  title: '5.2 Chaining CTEs: building a query step by step',
  tables: ['customers', 'orders', 'payments'],
  intro: `The marketing director has a real request: <i>“Split our customers into <b>Gold, Silver and Bronze</b> tiers by how much they have paid us, and tell me how much revenue each tier brings.”</i><br><br>To answer, you need <b>several steps</b>: total paid per customer, then label each customer with a tier, then summarise the tiers. A single flat query would be painful. With <b>chained CTEs</b>, each step becomes its own named block, and every block builds on the one before. This is how senior analysts structure almost every big query.`,
  steps: [
    {
      type: 'explain',
      title: 'Chaining: one WITH, many steps',
      body: `<div class="callout analogy"><b>The big idea:</b> a <b>chain of CTEs</b> is an assembly line. Raw material goes in at one end. Each station does <b>one small job</b> and passes its result to the next station. At the end, you get the finished product.</div>
<p>You write only <b>one</b> <code>WITH</code>, then separate the steps with <b>commas</b>:</p>
<p><code>WITH step1 AS (...), step2 AS (...), step3 AS (...) SELECT ... FROM step3</code></p>
<p>The magic rule: <b>each step can use any step above it</b>, but not the ones below. So <code>step2</code> can read from <code>step1</code>, and <code>step3</code> from <code>step2</code> (or <code>step1</code>).</p>`
    },
    {
      type: 'try',
      title: 'A two-step chain: customer bands',
      body: `<p><b>Step 1</b> (<code>per_customer</code>) counts orders per customer. <b>Step 2</b> (<code>banded</code>) turns each count into a label with CASE: 8 or more orders is <b>Frequent</b>, 4 to 7 is <b>Regular</b>, otherwise <b>Occasional</b>. The final SELECT counts the customers in each band. Each step does <b>one thing</b>, which makes the whole thing easy to check.</p>
<p>The picture: 1,233 Regular customers, 493 Occasional, and 256 Frequent.</p>`,
      chart: 'bar',
      chartTitle: 'Customers by order frequency',
      code: `WITH per_customer AS (
    SELECT customer_id, COUNT(*) AS orders
    FROM orders
    GROUP BY customer_id
),
banded AS (
    SELECT customer_id,
           CASE WHEN orders >= 8 THEN 'Frequent'
                WHEN orders >= 4 THEN 'Regular'
                ELSE 'Occasional'
           END AS band
    FROM per_customer
)
SELECT band, COUNT(*) AS customers
FROM banded
GROUP BY band
ORDER BY customers DESC;`
    },
    {
      id: 'sql-5-2-ex1',
      type: 'exercise',
      title: 'Your turn: build the chain',
      body: `<p>Recreate the two-step chain yourself. CTE 1 <code>per_customer</code> counts orders per customer. CTE 2 <code>banded</code> assigns the band (Frequent for 8 or more, Regular for 4 or more, otherwise Occasional). Then show each <code>band</code> and the number of customers (<code>customers</code>), most customers first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Two CTEs separated by a comma, with only one WITH at the top. The second reads FROM the first.`,
        `WITH per_customer AS (SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id), banded AS (SELECT customer_id, CASE WHEN orders >= 8 THEN 'Frequent' WHEN orders >= 4 THEN 'Regular' ELSE 'Occasional' END AS band FROM per_customer) SELECT band, COUNT(*) AS customers FROM banded GROUP BY band ORDER BY customers DESC;`
      ],
      solution: `WITH per_customer AS (SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id), banded AS (SELECT customer_id, CASE WHEN orders >= 8 THEN 'Frequent' WHEN orders >= 4 THEN 'Regular' ELSE 'Occasional' END AS band FROM per_customer) SELECT band, COUNT(*) AS customers FROM banded GROUP BY band ORDER BY customers DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The marketing director’s tiers, step by step',
      body: `<p>Now the real task. Plan it on paper first, as a professional would:</p>
<ol>
<li><b>paid:</b> total Paid money per customer (join orders and payments)</li>
<li><b>tiers:</b> label each customer: <b>Gold</b> for 1,000,000 or more, <b>Silver</b> for 500,000 or more, otherwise <b>Bronze</b></li>
<li><b>final:</b> count customers and total revenue per tier</li>
</ol>
<p>Three small steps. Each one you could test on its own.</p>
<div class="callout tip"><b>Pro tip, debugging a chain:</b> to check any step, replace the final SELECT with <code>SELECT * FROM that_step LIMIT 10</code>. You see exactly what that station produced. If step 2 looks wrong, you don’t have to read steps 1 and 3.</div>`
    },
    {
      type: 'try',
      title: 'Tiers and their revenue',
      body: `<p>The answer: <b>Silver</b> has 902 customers bringing about 652 million, <b>Gold</b> has 375 customers bringing about 482 million, and <b>Bronze</b> has 685 customers bringing about 207 million. Notice that only <b>1,962</b> customers appear, because only those have any Paid money.</p>`,
      chart: 'bar',
      chartTitle: 'Customers per tier',
      code: `WITH paid AS (
    SELECT o.customer_id, SUM(p.amount) AS total_paid
    FROM orders o
    JOIN payments p ON p.order_id = o.order_id
    WHERE p.payment_status = 'Paid'
    GROUP BY o.customer_id
),
tiers AS (
    SELECT customer_id,
           total_paid,
           CASE WHEN total_paid >= 1000000 THEN 'Gold'
                WHEN total_paid >= 500000  THEN 'Silver'
                ELSE 'Bronze'
           END AS tier
    FROM paid
)
SELECT tier,
       COUNT(*) AS customers,
       ROUND(SUM(total_paid), 2) AS revenue
FROM tiers
GROUP BY tier
ORDER BY revenue DESC;`
    },
    {
      id: 'sql-5-2-ex2',
      type: 'exercise',
      title: 'Your turn: the tier table',
      body: `<p>Build the tier summary yourself. Show each <code>tier</code>, the number of customers (<code>customers</code>) and the total Paid revenue rounded to 2 decimals (<code>revenue</code>), biggest revenue first. Use the same Gold/Silver/Bronze rules and two CTEs (<code>paid</code> and <code>tiers</code>).</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Copy the steps from the lesson: paid first, then tiers reading from paid, then a final GROUP BY tier.`,
        `WITH paid AS (SELECT o.customer_id, SUM(p.amount) AS total_paid FROM orders o JOIN payments p ON p.order_id = o.order_id WHERE p.payment_status = 'Paid' GROUP BY o.customer_id), tiers AS (SELECT customer_id, total_paid, CASE WHEN total_paid >= 1000000 THEN 'Gold' WHEN total_paid >= 500000 THEN 'Silver' ELSE 'Bronze' END AS tier FROM paid) SELECT tier, COUNT(*) AS customers, ROUND(SUM(total_paid), 2) AS revenue FROM tiers GROUP BY tier ORDER BY revenue DESC;`
      ],
      solution: `WITH paid AS (SELECT o.customer_id, SUM(p.amount) AS total_paid FROM orders o JOIN payments p ON p.order_id = o.order_id WHERE p.payment_status = 'Paid' GROUP BY o.customer_id), tiers AS (SELECT customer_id, total_paid, CASE WHEN total_paid >= 1000000 THEN 'Gold' WHEN total_paid >= 500000 THEN 'Silver' ELSE 'Bronze' END AS tier FROM paid) SELECT tier, COUNT(*) AS customers, ROUND(SUM(total_paid), 2) AS revenue FROM tiers GROUP BY tier ORDER BY revenue DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Adding a step is easy',
      body: `<p>The real beauty of a chain: when your boss says “and what <b>percentage</b> of revenue does each tier bring?”, you don’t rewrite anything. You just change the <b>final</b> SELECT. The steps above it stay exactly the same.</p>
<p>Percent of total, computed from the same <code>tiers</code> step, is the “write once, use twice” trick from Lesson 5.1.</p>`
    },
    {
      type: 'try',
      title: 'Which tier matters most?',
      body: `<p>Gold customers are only <b>19%</b> of the paying customers (375 of 1,962), yet they bring <b>36%</b> of the money. Silver brings the biggest slice, <b>48.6%</b>, and Bronze, with 35% of the customers, brings just <b>15.4%</b> of the revenue. This is a <b>Pareto-style insight</b> (a small group brings a large share), and it is a sentence you can say out loud in an interview.</p>
<p>(As we saw in Lesson 3.3, “Paid” money can include cancelled and returned orders, so a careful analyst would mention that caveat next to these numbers.)</p>`,
      chart: 'pie',
      chartTitle: 'Share of Paid revenue by tier',
      code: `WITH paid AS (
    SELECT o.customer_id, SUM(p.amount) AS total_paid
    FROM orders o
    JOIN payments p ON p.order_id = o.order_id
    WHERE p.payment_status = 'Paid'
    GROUP BY o.customer_id
),
tiers AS (
    SELECT customer_id,
           total_paid,
           CASE WHEN total_paid >= 1000000 THEN 'Gold'
                WHEN total_paid >= 500000  THEN 'Silver'
                ELSE 'Bronze'
           END AS tier
    FROM paid
)
SELECT tier,
       ROUND(100.0 * SUM(total_paid) / (SELECT SUM(total_paid) FROM tiers), 1) AS pct_of_revenue
FROM tiers
GROUP BY tier
ORDER BY pct_of_revenue DESC;`
    },
    {
      id: 'sql-5-2-c1',
      type: 'check',
      title: 'You have WITH a AS (...), b AS (...), c AS (...). Which steps can the CTE named b read from?',
      body: `<p>Think of an assembly line. A station can use what came before it.</p>`,
      options: ['Only the final SELECT', 'Step a, because it is above b', 'Step c, because it is below b', 'None of them'],
      answer: 1,
      why: [
        'The final SELECT is the main query. The question is about what b itself can read.',
        'Yes! Each step can use the steps written above it. b can read a, and c can read a and b.',
        'A step cannot read the ones below it, because those are defined later.',
        'Chaining only works because later steps can read earlier ones.'
      ]
    },
    {
      id: 'sql-5-2-ex3',
      type: 'exercise',
      title: 'Your turn: percentage by tier',
      body: `<p>Show each <code>tier</code> and the <b>percentage of Paid revenue</b> it brings, rounded to 1 decimal (call it <code>pct_of_revenue</code>), biggest first. Same two CTEs as before, but a different final SELECT.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `The final SELECT: ROUND(100.0 * SUM(total_paid) / (SELECT SUM(total_paid) FROM tiers), 1) AS pct_of_revenue, grouped by tier.`,
        `WITH paid AS (SELECT o.customer_id, SUM(p.amount) AS total_paid FROM orders o JOIN payments p ON p.order_id = o.order_id WHERE p.payment_status = 'Paid' GROUP BY o.customer_id), tiers AS (SELECT customer_id, total_paid, CASE WHEN total_paid >= 1000000 THEN 'Gold' WHEN total_paid >= 500000 THEN 'Silver' ELSE 'Bronze' END AS tier FROM paid) SELECT tier, ROUND(100.0 * SUM(total_paid) / (SELECT SUM(total_paid) FROM tiers), 1) AS pct_of_revenue FROM tiers GROUP BY tier ORDER BY pct_of_revenue DESC;`
      ],
      solution: `WITH paid AS (SELECT o.customer_id, SUM(p.amount) AS total_paid FROM orders o JOIN payments p ON p.order_id = o.order_id WHERE p.payment_status = 'Paid' GROUP BY o.customer_id), tiers AS (SELECT customer_id, total_paid, CASE WHEN total_paid >= 1000000 THEN 'Gold' WHEN total_paid >= 500000 THEN 'Silver' ELSE 'Bronze' END AS tier FROM paid) SELECT tier, ROUND(100.0 * SUM(total_paid) / (SELECT SUM(total_paid) FROM tiers), 1) AS pct_of_revenue FROM tiers GROUP BY tier ORDER BY pct_of_revenue DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Cleaning as a chain: the staging pattern',
      body: `<p>Professionals use chained CTEs for another job: <b>cleaning first, analysing second</b>. The first CTE tidies the raw data (lowercase, trim, fix labels). Later steps then work on clean data and never need to worry about mess. This is called the <b>staging pattern</b>, and its names are worth knowing:</p>
<ul>
<li><b>Staging step:</b> clean and rename raw columns (often named <code>stg_...</code> or <code>clean_...</code>)</li>
<li><b>Intermediate step:</b> join and calculate</li>
<li><b>Final step:</b> the shape the reader needs</li>
</ul>
<p>Remember the email domains from Lesson 2.9, where capital letters split Gmail into two rows? Here is the same job done the professional way.</p>`
    },
    {
      type: 'try',
      title: 'Clean first, then count',
      body: `<p><b>clean_customers</b> extracts and lowercases each email domain once. <b>domain_counts</b> counts customers per domain. The final SELECT turns counts into percentages. Hotmail <b>34.1%</b>, Yahoo <b>34.0%</b>, Gmail <b>31.8%</b>. If tomorrow someone asks you to also trim spaces, you change <b>one step</b>, and everything downstream benefits.</p>`,
      chart: 'pie',
      chartTitle: 'Email providers (cleaned)',
      code: `WITH clean_customers AS (
    SELECT customer_id,
           LOWER(SUBSTR(email, INSTR(email, '@') + 1)) AS domain
    FROM customers
    WHERE email IS NOT NULL
),
domain_counts AS (
    SELECT domain, COUNT(*) AS customers
    FROM clean_customers
    GROUP BY domain
)
SELECT domain,
       customers,
       ROUND(100.0 * customers / (SELECT SUM(customers) FROM domain_counts), 1) AS pct
FROM domain_counts
ORDER BY customers DESC;`
    },
    {
      id: 'sql-5-2-ex4',
      type: 'exercise',
      title: 'Your turn: the staging pattern',
      body: `<p>Build the cleaning chain. CTE 1 <code>clean_customers</code> gets the lowercase domain of each customer’s email (customers with an email only). CTE 2 <code>domain_counts</code> counts customers per domain. Final: show each <code>domain</code> and its percentage of customers with an email, rounded to 1 decimal (call it <code>pct</code>), biggest first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `domain = LOWER(SUBSTR(email, INSTR(email, '@') + 1)), with WHERE email IS NOT NULL.`,
        `WITH clean_customers AS (SELECT customer_id, LOWER(SUBSTR(email, INSTR(email, '@') + 1)) AS domain FROM customers WHERE email IS NOT NULL), domain_counts AS (SELECT domain, COUNT(*) AS customers FROM clean_customers GROUP BY domain) SELECT domain, ROUND(100.0 * customers / (SELECT SUM(customers) FROM domain_counts), 1) AS pct FROM domain_counts ORDER BY customers DESC;`
      ],
      solution: `WITH clean_customers AS (SELECT customer_id, LOWER(SUBSTR(email, INSTR(email, '@') + 1)) AS domain FROM customers WHERE email IS NOT NULL), domain_counts AS (SELECT domain, COUNT(*) AS customers FROM clean_customers GROUP BY domain) SELECT domain, ROUND(100.0 * customers / (SELECT SUM(customers) FROM domain_counts), 1) AS pct FROM domain_counts ORDER BY customers DESC;`,
      ordered: true
    },
    {
      id: 'sql-5-2-ex5',
      type: 'exercise',
      title: 'Challenge: which months beat the average?',
      body: `<p>Operations asks: <i>“In 2025, which months had more orders than the average month?”</i> Use two CTEs: <code>monthly</code> (orders per month in 2025, using a half-open date range) and a final SELECT of the months above the average. Show <code>month</code> and <code>orders</code>, in month order. (The average month had about 239.92 orders.)</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `monthly: strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders, filtered with order_date >= '2025-01-01' AND order_date < '2026-01-01', grouped by month. Final: WHERE orders > (SELECT AVG(orders) FROM monthly).`,
        `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01' GROUP BY month) SELECT month, orders FROM monthly WHERE orders > (SELECT AVG(orders) FROM monthly) ORDER BY month;`
      ],
      solution: `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01' GROUP BY month) SELECT month, orders FROM monthly WHERE orders > (SELECT AVG(orders) FROM monthly) ORDER BY month;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'CTE, derived table, view or temp table?',
      body: `<table class="mini"><tr><th>Tool</th><th>Lives for</th><th>Best for</th></tr>
<tr><td><b>CTE</b> (<code>WITH</code>)</td><td>One query</td><td>Readable, multi-step logic. Your default choice.</td></tr>
<tr><td><b>Derived table</b></td><td>One query</td><td>A tiny one-off step inside a query</td></tr>
<tr><td><b>View</b></td><td>Saved permanently</td><td>A query many people or reports reuse</td></tr>
<tr><td><b>Temporary table</b></td><td>Your session</td><td>Reusing a heavy result many times in one session</td></tr></table>
<div class="callout work"><b>At work:</b> CTEs are standard SQL and work in PostgreSQL, SQL Server, Oracle, MySQL 8+, BigQuery, Snowflake and SQLite. Performance differs: some databases run each CTE once and keep the result, others treat it like a pasted-in subquery. When a query is slow, it’s worth asking which your database does. For clarity, though, CTEs are almost always the right choice.</div>`
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Chain several CTEs with one <code>WITH</code> and commas, each step using the ones above it</li>
<li>Plan a query as a list of small named steps before writing it</li>
<li>Debug a chain by looking at one step at a time</li>
<li>Build customer tiers and a Pareto-style insight, step by step</li>
<li>Use the <b>staging pattern</b>: clean first, then analyse</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>How do you write multiple CTEs in one query?</li>
<li>How would you debug a long chain of CTEs?</li>
<li>What is the difference between a CTE and a view?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Use a single WITH, then list the CTEs separated by commas: <code>WITH a AS (...), b AS (...) SELECT ...</code>. Later CTEs can reference earlier ones.</p>
<p><b>2.</b> Replace the final SELECT with <code>SELECT * FROM step_name LIMIT 10</code> for each step in turn, to inspect what that step produces, and fix the first step that looks wrong.</p>
<p><b>3.</b> A CTE exists only for the single query that defines it. A view is a saved, named query stored in the database that can be reused by many queries and people.</p>
</details>
<p><b>Coming next, Lesson 5.3: Recursive CTEs.</b> A CTE that calls <i>itself</i>. It sounds strange, but it is how SQL counts, builds calendars, and walks through organisation charts. And it will help you check whether TradeFlow has a single day with no orders.</p>`
    }
  ]
},
{
  id: 'sql-5-3',
  track: 'sql',
  title: '5.3 Recursive CTEs: queries that repeat themselves',
  tables: ['orders'],
  intro: `Here is a puzzle. SQL works with tables that <b>already exist</b>. But how do you answer: <i>“Was there a day with no orders?”</i> If a day has no orders, it has no row, so it is invisible. There is nothing to look at!<br><br>To find gaps, you need to <b>create</b> a list of every day, and then see which days have no orders. And to create a list of days from nothing, you need a CTE that <b>repeats itself</b>: a <b>recursive CTE</b>. It is the most advanced CTE tool, it is a favourite interview topic, and it is easier than it sounds.`,
  steps: [
    {
      type: 'explain',
      title: 'A CTE that calls itself',
      body: `<div class="callout analogy"><b>The big idea:</b> imagine climbing a staircase with a simple rule: <i>“Start on step 1. From any step, go up one more step. Stop when you reach step 10.”</i> A recursive CTE follows exactly that: a <b>starting point</b>, a <b>rule to take the next step</b>, and a <b>stopping condition</b>.</div>
<p>A recursive CTE has two parts joined by <code>UNION ALL</code>:</p>
<ol>
<li><b>The anchor:</b> where you start (one row)</li>
<li><b>The recursive part:</b> takes the rows made so far and produces the <b>next</b> ones, with a <code>WHERE</code> that stops the repeating</li>
</ol>
<p>And you must write the word <code>RECURSIVE</code> after <code>WITH</code>.</p>`
    },
    {
      type: 'try',
      title: 'Counting from 1 to 10',
      body: `<p>The anchor is <code>SELECT 1</code>: start at 1. The recursive part says <code>SELECT n + 1 FROM seq WHERE n &lt; 10</code>: take the latest number, add one, and keep going while the number is still below 10. At 10, the WHERE fails and it stops. Ten rows appear, from nothing, with no table. We also added a column with the square of each number.</p>`,
      code: `WITH RECURSIVE seq(n) AS (
    SELECT 1                       -- the anchor: start here
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 10   -- the rule, and when to stop
)
SELECT n, n * n AS square
FROM seq;`
    },
    {
      type: 'explain',
      title: 'The stop sign: never forget it',
      body: `<div class="callout watch"><b>The danger of recursion:</b> if the rule never reaches the stopping condition, the query <b>keeps producing rows forever</b> (an infinite loop). Always make sure the <code>WHERE</code> in the recursive part will eventually be false. When experimenting, it’s also wise to add a safety <code>LIMIT</code> to the final SELECT.</div>
<p>The pattern, which you can reuse again and again:</p>
<p><code>WITH RECURSIVE name(column) AS ( SELECT starting_value UNION ALL SELECT next_value FROM name WHERE keep_going_condition ) SELECT ... FROM name</code></p>`
    },
    {
      id: 'sql-5-3-c1',
      type: 'check',
      title: 'What happens if the recursive part has no stopping condition?',
      body: `<p>Think about the staircase without a top step.</p>`,
      options: ['SQL stops after 10 rows automatically', 'The query keeps generating rows forever (or until the database stops it)', 'SQL returns just the anchor row', 'It returns NULL'],
      answer: 1,
      why: [
        'SQL has no automatic limit of 10. You must write the stop yourself.',
        'Yes! Without a condition that eventually becomes false, the recursion never ends. Always include one.',
        'The anchor would only be returned if the recursive part produced no rows, which is not the case here.',
        'It does not return NULL. It just keeps going.'
      ]
    },
    {
      type: 'try',
      title: 'Doubling: powers of two',
      body: `<p>The recursive part can carry <b>more than one value</b>. Here we keep a step number <code>n</code> and a value <code>power</code> that doubles every time. Starting at 1, we get 1, 2, 4, 8, 16, 32, 64, 128. A good picture of how fast things grow when they double, like a bacteria or an interest rate.</p>`,
      code: `WITH RECURSIVE pw(n, power) AS (
    SELECT 0, 1
    UNION ALL
    SELECT n + 1, power * 2 FROM pw WHERE n < 7
)
SELECT n, power
FROM pw;`
    },
    {
      id: 'sql-5-3-ex1',
      type: 'exercise',
      title: 'Your turn: powers of two',
      body: `<p>Write a recursive CTE called <code>pw</code> with columns <code>n</code> and <code>power</code>, starting at <code>n = 0</code> and <code>power = 1</code>, doubling <code>power</code> each step, and stopping after <code>n = 7</code>. Return <code>n</code> and <code>power</code>. You should get 8 rows, ending with 7 and 128.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Anchor: SELECT 0, 1. Recursive: SELECT n + 1, power * 2 FROM pw WHERE n < 7. Don't forget RECURSIVE.`,
        `WITH RECURSIVE pw(n, power) AS (SELECT 0, 1 UNION ALL SELECT n + 1, power * 2 FROM pw WHERE n < 7) SELECT n, power FROM pw;`
      ],
      solution: `WITH RECURSIVE pw(n, power) AS (SELECT 0, 1 UNION ALL SELECT n + 1, power * 2 FROM pw WHERE n < 7) SELECT n, power FROM pw;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The big use: a calendar from nothing',
      body: `<p>Now back to the puzzle. We use a recursive CTE to create <b>every date in a range</b>. The anchor is the first date. The rule is <code>date(d, '+1 day')</code> (from Lesson 2.8), repeated until the last date.</p>
<p>Once you have a calendar, you can <b>LEFT JOIN</b> your orders onto it. Every day appears, even a day with no orders, where the count will be zero. A calendar like this is called a <b>date spine</b>, and professionals build one for almost every time-based report.</p>`
    },
    {
      type: 'try',
      title: 'The first week of 2026, day by day',
      body: `<p>Seven rows, one for each day from 1 to 7 January 2026, built from nothing. Then the <b>LEFT JOIN</b> brings in the orders, and <code>COUNT(o.order_id)</code> counts them (remember to count a column from the right side, from Lesson 3.2). 9, 10, 5, 9, 8, 9 and 8 orders.</p>`,
      chart: 'bar',
      chartTitle: 'Orders per day, first week of 2026',
      code: `WITH RECURSIVE cal(d) AS (
    SELECT '2026-01-01'
    UNION ALL
    SELECT date(d, '+1 day') FROM cal WHERE d < '2026-01-07'
)
SELECT cal.d AS day,
       COUNT(o.order_id) AS orders
FROM cal
LEFT JOIN orders o ON o.order_date = cal.d
GROUP BY cal.d
ORDER BY cal.d;`
    },
    {
      id: 'sql-5-3-ex2',
      type: 'exercise',
      title: 'Your turn: how many days in February 2026?',
      body: `<p>Build a calendar from <b>2026-02-01</b> to <b>2026-02-28</b> and count its days. Return one number called <code>days</code>. (A recursive CTE has no trouble with leap years, but counting is a great way to check your range.)</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Anchor: SELECT '2026-02-01'. Recursive: SELECT date(d, '+1 day') FROM cal WHERE d < '2026-02-28'. Then SELECT COUNT(*) FROM cal.`,
        `WITH RECURSIVE cal(d) AS (SELECT '2026-02-01' UNION ALL SELECT date(d, '+1 day') FROM cal WHERE d < '2026-02-28') SELECT COUNT(*) AS days FROM cal;`
      ],
      solution: `WITH RECURSIVE cal(d) AS (SELECT '2026-02-01' UNION ALL SELECT date(d, '+1 day') FROM cal WHERE d < '2026-02-28') SELECT COUNT(*) AS days FROM cal;`,
      ordered: true
    },
    {
      id: 'sql-5-3-ex3',
      type: 'exercise',
      title: 'Your turn: orders per day, with zeros',
      body: `<p>Show the number of orders for each day from <b>2026-01-01</b> to <b>2026-01-07</b>: <code>day</code> and <code>orders</code>, in date order. Build a calendar (<code>cal</code>) and LEFT JOIN the orders. Remember to count a column from the orders side.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join cal to orders ON o.order_date = cal.d, group by cal.d, and use COUNT(o.order_id).`,
        `WITH RECURSIVE cal(d) AS (SELECT '2026-01-01' UNION ALL SELECT date(d, '+1 day') FROM cal WHERE d < '2026-01-07') SELECT cal.d AS day, COUNT(o.order_id) AS orders FROM cal LEFT JOIN orders o ON o.order_date = cal.d GROUP BY cal.d ORDER BY cal.d;`
      ],
      solution: `WITH RECURSIVE cal(d) AS (SELECT '2026-01-01' UNION ALL SELECT date(d, '+1 day') FROM cal WHERE d < '2026-01-07') SELECT cal.d AS day, COUNT(o.order_id) AS orders FROM cal LEFT JOIN orders o ON o.order_date = cal.d GROUP BY cal.d ORDER BY cal.d;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The gap check: a real data-quality test',
      body: `<p>Now we can answer the puzzle. Build a calendar for the company’s <b>whole history</b> (1,277 days from 2023-01-01 to 2026-06-30), LEFT JOIN a count of orders per day, and count the days where the order count is <b>empty</b>.</p>
<p>Why does this matter? If a data feed breaks, whole days can go missing, and your charts would quietly show a dip that never happened. A gap check, run <b>before</b> you analyse a time series, is a mark of a careful analyst.</p>`
    },
    {
      type: 'try',
      title: 'Are there any days with no orders at all?',
      body: `<p><b>1,277 days, 0 without orders.</b> Every single day has at least one order. The feed is healthy, with no gaps. That is a <b>finding</b>, not a non-event: it means the dips and spikes you see in the charts are real behaviour, not missing data.</p>
<p>The pattern <code>x.cnt IS NULL</code> after a LEFT JOIN is the anti-join from Lesson 3.2, now pointed at calendar days.</p>`,
      code: `WITH RECURSIVE cal(d) AS (
    SELECT '2023-01-01'
    UNION ALL
    SELECT date(d, '+1 day') FROM cal WHERE d < '2026-06-30'
),
daily AS (
    SELECT order_date, COUNT(*) AS cnt
    FROM orders
    GROUP BY order_date
)
SELECT COUNT(*) AS days,
       SUM(CASE WHEN daily.cnt IS NULL THEN 1 ELSE 0 END) AS days_without_orders
FROM cal
LEFT JOIN daily ON daily.order_date = cal.d;`
    },
    {
      id: 'sql-5-3-ex4',
      type: 'exercise',
      title: 'Your turn: the quiet days',
      body: `<p>Operations wants to know how many days were <b>quiet</b>, meaning <b>fewer than 3 orders</b> (including days with none). Using the calendar from <b>2023-01-01</b> to <b>2026-06-30</b> and a CTE <code>daily</code> of orders per day, return one number called <code>quiet_days</code>. The answer is 13.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `LEFT JOIN daily to cal, then COUNT the rows WHERE daily.cnt IS NULL OR daily.cnt < 3.`,
        `WITH RECURSIVE cal(d) AS (SELECT '2023-01-01' UNION ALL SELECT date(d, '+1 day') FROM cal WHERE d < '2026-06-30'), daily AS (SELECT order_date, COUNT(*) AS cnt FROM orders GROUP BY order_date) SELECT COUNT(*) AS quiet_days FROM cal LEFT JOIN daily ON daily.order_date = cal.d WHERE daily.cnt IS NULL OR daily.cnt < 3;`
      ],
      solution: `WITH RECURSIVE cal(d) AS (SELECT '2023-01-01' UNION ALL SELECT date(d, '+1 day') FROM cal WHERE d < '2026-06-30'), daily AS (SELECT order_date, COUNT(*) AS cnt FROM orders GROUP BY order_date) SELECT COUNT(*) AS quiet_days FROM cal LEFT JOIN daily ON daily.order_date = cal.d WHERE daily.cnt IS NULL OR daily.cnt < 3;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Walking a hierarchy: the org chart',
      body: `<p>The other famous use of recursion is a <b>hierarchy</b>: a boss, their team, the teams under them, and so on. Each person has a <code>boss_id</code> pointing to their manager. How do you find out how many levels deep each person sits?</p>
<p>TradeFlow’s employee table has no boss column, so here is a <b>small invented company</b> (not TradeFlow data) built inline with <code>VALUES</code>:</p>
<table class="mini"><tr><th>Name</th><th>Reports to</th></tr>
<tr><td>Ada</td><td>(nobody, the top)</td></tr>
<tr><td>Tunde, Zainab</td><td>Ada</td></tr>
<tr><td>Chidi, Ngozi</td><td>Tunde</td></tr>
<tr><td>Emeka</td><td>Zainab</td></tr>
<tr><td>Amara</td><td>Chidi</td></tr></table>
<p>The recursion: <b>anchor</b> = the person with no boss (level 1). <b>Rule</b> = find everyone whose boss is someone already found, and give them the next level.</p>`
    },
    {
      type: 'try',
      title: 'Who sits at which level?',
      body: `<p>Ada is level 1. Tunde and Zainab (her team) are level 2. Chidi, Ngozi and Emeka are level 3. Amara, at the bottom, is level 4. The recursive part <b>joins</b> the staff table to the rows already found, matching <code>boss_id</code> to the found person’s <code>id</code>: the same “follow the pointer” idea you know from joins, repeated level by level.</p>`,
      code: `WITH RECURSIVE
staff(id, name, boss_id) AS (
    VALUES (1, 'Ada', NULL), (2, 'Tunde', 1), (3, 'Zainab', 1),
           (4, 'Chidi', 2), (5, 'Ngozi', 2), (6, 'Emeka', 3), (7, 'Amara', 4)
),
chain(id, name, level) AS (
    SELECT id, name, 1 FROM staff WHERE boss_id IS NULL
    UNION ALL
    SELECT s.id, s.name, c.level + 1
    FROM staff s
    JOIN chain c ON s.boss_id = c.id
)
SELECT name, level
FROM chain
ORDER BY level, name;`
    },
    {
      type: 'try',
      title: 'Showing the full reporting line',
      body: `<p>Carry text down the chain and you can print each person’s <b>whole path from the top</b>. Look at Amara: <code>Ada &gt; Tunde &gt; Chidi &gt; Amara</code>. Four levels, shown in one cell. This is how real systems print category trees (Electronics &gt; Phones &gt; Chargers) and org charts.</p>`,
      code: `WITH RECURSIVE
staff(id, name, boss_id) AS (
    VALUES (1, 'Ada', NULL), (2, 'Tunde', 1), (3, 'Zainab', 1),
           (4, 'Chidi', 2), (5, 'Ngozi', 2), (6, 'Emeka', 3), (7, 'Amara', 4)
),
chain(id, name, path) AS (
    SELECT id, name, name FROM staff WHERE boss_id IS NULL
    UNION ALL
    SELECT s.id, s.name, c.path || ' > ' || s.name
    FROM staff s
    JOIN chain c ON s.boss_id = c.id
)
SELECT path
FROM chain
ORDER BY path;`
    },
    {
      id: 'sql-5-3-ex5',
      type: 'exercise',
      title: 'Challenge: walk the org chart',
      body: `<p>Using the same invented <code>staff</code> table, show each person’s <code>name</code> and <code>level</code> in the chain, sorted by <code>level</code>, then <code>name</code>. Build both CTEs: <code>staff</code> (with the VALUES from the lesson) and a recursive <code>chain</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Copy the staff VALUES list. The anchor is WHERE boss_id IS NULL with level 1. The recursive part joins staff to chain on s.boss_id = c.id with c.level + 1.`,
        `WITH RECURSIVE staff(id, name, boss_id) AS (VALUES (1, 'Ada', NULL), (2, 'Tunde', 1), (3, 'Zainab', 1), (4, 'Chidi', 2), (5, 'Ngozi', 2), (6, 'Emeka', 3), (7, 'Amara', 4)), chain(id, name, level) AS (SELECT id, name, 1 FROM staff WHERE boss_id IS NULL UNION ALL SELECT s.id, s.name, c.level + 1 FROM staff s JOIN chain c ON s.boss_id = c.id) SELECT name, level FROM chain ORDER BY level, name;`
      ],
      solution: `WITH RECURSIVE staff(id, name, boss_id) AS (VALUES (1, 'Ada', NULL), (2, 'Tunde', 1), (3, 'Zainab', 1), (4, 'Chidi', 2), (5, 'Ngozi', 2), (6, 'Emeka', 3), (7, 'Amara', 4)), chain(id, name, level) AS (SELECT id, name, 1 FROM staff WHERE boss_id IS NULL UNION ALL SELECT s.id, s.name, c.level + 1 FROM staff s JOIN chain c ON s.boss_id = c.id) SELECT name, level FROM chain ORDER BY level, name;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Module 5 complete, and recursion in other databases',
      body: `<div class="callout work"><b>In other databases:</b> the syntax varies a little. <b>PostgreSQL, MySQL 8+ and SQLite</b> use <code>WITH RECURSIVE</code>. <b>SQL Server</b> uses plain <code>WITH</code> (no RECURSIVE keyword). <b>Oracle</b> supports recursive CTEs too, but has an older alternative called <code>CONNECT BY</code>. Many databases also have a built-in <code>generate_series()</code> function (PostgreSQL) that creates number or date lists in one line, but the recursive CTE works everywhere and teaches the thinking.</div>
<p>In three lessons you went from nested confusion to clean, named steps. You can now:</p>
<ul>
<li>Write a CTE, chain several, and read them top to bottom</li>
<li>Reuse a step without repeating it, and debug a chain one station at a time</li>
<li>Use the staging pattern: clean first, then analyse</li>
<li>Build a number series, a calendar (date spine) and an org chart with a recursive CTE</li>
<li>Run a gap check on a time series</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What are the two parts of a recursive CTE?</li>
<li>How would you list every date in a range, including days with no data?</li>
<li>How would you avoid an infinite loop in a recursive CTE?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> An anchor member (the starting rows) and a recursive member (which uses the CTE’s own previous output to produce the next rows), combined with UNION ALL.</p>
<p><b>2.</b> Generate a date spine with a recursive CTE (start date, add one day each step, stop at the end date), then LEFT JOIN the data onto it, so empty days show as NULL or zero.</p>
<p><b>3.</b> Make sure the recursive part has a condition that eventually becomes false (for example <code>WHERE d &lt; end_date</code>), and use limits or database recursion limits as a safety net.</p>
</details>
<p><b>Coming next, Module 6: Window functions, the most powerful SQL you’ll ever learn.</b> Everything so far collapsed rows into groups. Window functions let you calculate across rows <i>without</i> collapsing them: running totals, rankings, “compared with last month”, and “top 3 per category”. It is the most tested topic in analyst interviews.</p>`
    }
  ]
}
);
