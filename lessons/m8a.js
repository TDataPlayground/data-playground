LESSONS.push(
{
  id: 'sql-8-1',
  track: 'sql',
  title: '8.1 Business metrics: define it, calculate it, defend it',
  tables: ['customers', 'orders', 'order_items', 'payments', 'products'],
  intro: `The CEO sends one line: <i>“What was our revenue?”</i><br><br>Simple question. But a careful analyst knows there isn’t <b>one</b> revenue number. There are at least four, and they can differ by <b>millions</b>. Whichever you send will be quoted in meetings, put in slides and used to make decisions. In this lesson you will learn the most valuable habit in analytics: <b>define the metric first, calculate it second, and be ready to defend it</b>. You will also build the core KPIs every business tracks.`,
  steps: [
    {
      type: 'explain',
      title: 'Same question, four honest answers',
      body: `<div class="callout analogy"><b>The big idea:</b> a metric is not a number, it is a <b>number plus a definition</b>. Imagine asking “how many people are at the party?” Do you count everyone who arrived, everyone still here, or only those who paid? Each answer is correct for its own question.</div>
<p>For revenue, TradeFlow’s data supports at least four honest definitions:</p>
<ol>
<li><b>Gross:</b> every payment record, whatever happened to it</li>
<li><b>Net of cancellations:</b> only payments on orders that were <b>not</b> Cancelled or Returned</li>
<li><b>Cash received:</b> only payments whose status is <b>Paid</b></li>
<li><b>Cash on kept orders:</b> Paid, <b>and</b> the order was not Cancelled or Returned</li>
</ol>
<p>Let’s calculate all four, side by side.</p>`
    },
    {
      type: 'try',
      title: 'The revenue ladder',
      body: `<p>Four rows, four definitions. Read the gaps:</p>
<ul>
<li>Gross: <b>1,581,981,450.50</b></li>
<li>Net of cancelled and returned orders: <b>1,419,860,053.32</b>, which is <b>10.2% lower</b> (about 162 million of payments sit on orders that did not stick)</li>
<li>Cash received (Paid): <b>1,341,394,728.95</b></li>
<li>Cash on kept orders: <b>1,199,874,519.10</b>, nearly <b>24% below gross</b></li>
</ul>
<p>Same company, same year, same database, and a difference of <b>over 380 million</b> between the highest and the lowest. This is why “what was our revenue?” is never a one-line answer.</p>`,
      chart: 'bar',
      chartTitle: 'Four definitions of revenue',
      code: `WITH base AS (
    SELECT p.amount, p.payment_status, o.order_status
    FROM payments p
    JOIN orders o ON o.order_id = p.order_id
)
SELECT '1 Gross: every payment' AS definition,
       ROUND(SUM(amount), 2) AS revenue
FROM base
UNION ALL
SELECT '2 Net: excluding Cancelled and Returned orders',
       ROUND(SUM(amount), 2)
FROM base WHERE order_status IN ('Completed', 'Processing')
UNION ALL
SELECT '3 Cash: Paid payments only',
       ROUND(SUM(amount), 2)
FROM base WHERE payment_status = 'Paid'
UNION ALL
SELECT '4 Cash on kept orders: Paid and not Cancelled or Returned',
       ROUND(SUM(amount), 2)
FROM base WHERE payment_status = 'Paid' AND order_status IN ('Completed', 'Processing');`
    },
    {
      id: 'sql-8-1-c1',
      type: 'check',
      title: 'The CEO asks for “revenue”. What should a careful analyst do?',
      body: `<p>Four honest numbers, millions apart.</p>`,
      options: ['Send the biggest number, it looks best', 'Pick a definition, state it clearly next to the number, and be ready to explain the gap to the others', 'Send the smallest number to be safe', 'Send all four with no explanation'],
      answer: 1,
      why: [
        'Choosing a number because it looks good is how analysts lose trust. Choose the definition that matches the decision being made.',
        'Yes! Clarify what the CEO needs (the question behind the question), pick the matching definition, label it, and keep a note on how it relates to the others.',
        'The smallest number can be just as misleading if it doesn’t match the question.',
        'Four unexplained numbers cause confusion. Context is what makes data useful.'
      ]
    },
    {
      id: 'sql-8-1-ex1',
      type: 'exercise',
      title: 'Your turn: gross and net, side by side',
      body: `<p>Return one row with two columns: <code>gross_revenue</code> (the total of all payments) and <code>net_revenue</code> (the total of payments on orders whose status is <b>Completed</b> or <b>Processing</b>), both rounded to 2 decimals. Join <code>payments</code> to <code>orders</code> and use a conditional sum for the second column.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `ROUND(SUM(p.amount), 2) for gross. For net: ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2).`,
        `SELECT ROUND(SUM(p.amount), 2) AS gross_revenue, ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS net_revenue FROM payments p JOIN orders o ON o.order_id = p.order_id;`
      ],
      solution: `SELECT ROUND(SUM(p.amount), 2) AS gross_revenue, ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS net_revenue FROM payments p JOIN orders o ON o.order_id = p.order_id;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Average order value: choose your denominator',
      body: `<p><b>AOV</b> (average order value) is revenue divided by the number of orders. It sounds trivial, but the <b>denominator</b> matters just as much as the numerator: should cancelled orders count as orders? If you take <b>net</b> revenue, you must divide by the <b>net</b> number of orders, so numerator and denominator describe the <b>same set of orders</b>. Mixing sets (net revenue divided by all orders) gives a number that matches nothing real.</p>`
    },
    {
      type: 'try',
      title: 'Gross AOV versus net AOV',
      body: `<p>Gross AOV: <b>158,198.15</b> (all 10,000 orders). Net AOV: <b>158,360.48</b> (the 8,966 orders that were Completed or Processing). Almost the same. The cancelled and returned orders aren’t unusually big or small: they just <b>disappear in equal proportion</b>. That is useful to know: it tells you the problem with cancellations is volume, not basket size.</p>`,
      code: `SELECT ROUND(SUM(p.amount) / COUNT(*), 2) AS gross_aov,
       ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END)
             / SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN 1 ELSE 0 END), 2) AS net_aov
FROM payments p
JOIN orders o ON o.order_id = p.order_id;`
    },
    {
      id: 'sql-8-1-ex2',
      type: 'exercise',
      title: 'Your turn: net AOV',
      body: `<p>Return one number, <code>net_aov</code>: the average payment amount of orders whose status is <b>Completed</b> or <b>Processing</b>, rounded to 2 decimals. The answer is 158,360.48.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join payments to orders, filter to the two statuses in WHERE, and take ROUND(SUM(p.amount) / COUNT(*), 2).`,
        `SELECT ROUND(SUM(p.amount) / COUNT(*), 2) AS net_aov FROM payments p JOIN orders o ON o.order_id = p.order_id WHERE o.order_status IN ('Completed', 'Processing');`
      ],
      solution: `SELECT ROUND(SUM(p.amount) / COUNT(*), 2) AS net_aov FROM payments p JOIN orders o ON o.order_id = p.order_id WHERE o.order_status IN ('Completed', 'Processing');`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Rates: the KPIs every dashboard has',
      body: `<p>Alongside money, businesses track <b>rates</b>: <b>cancellation rate</b>, <b>return rate</b>, <b>payment success rate</b>. A rate is a count of “the thing” divided by the count of “everything it could have happened to”. You built these in Lesson 2.7. Here is how a KPI summary looks as a single row of scalar subqueries, the kind of query that feeds a dashboard tile.</p>`
    },
    {
      type: 'try',
      title: 'A KPI row',
      body: `<p><b>5.3%</b> of orders are cancelled, <b>5.0%</b> are returned, and <b>84.6%</b> of payments succeed (Paid). Three headline numbers from one query. Notice each subquery is independent, so there’s no join risk.</p>`,
      code: `SELECT
  (SELECT ROUND(100.0 * SUM(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1)
   FROM orders) AS cancel_rate,
  (SELECT ROUND(100.0 * SUM(CASE WHEN order_status = 'Returned' THEN 1 ELSE 0 END) / COUNT(*), 1)
   FROM orders) AS return_rate,
  (SELECT ROUND(100.0 * SUM(CASE WHEN payment_status = 'Paid' THEN 1 ELSE 0 END) / COUNT(*), 1)
   FROM payments) AS paid_rate;`
    },
    {
      id: 'sql-8-1-ex3',
      type: 'exercise',
      title: 'Your turn: the problem-order rates',
      body: `<p>Return one row with two columns: <code>cancel_rate</code> and <code>return_rate</code>, the percentage of orders that are <b>Cancelled</b> and <b>Returned</b>, each rounded to 1 decimal.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `100.0 * SUM(CASE WHEN order_status = '...' THEN 1 ELSE 0 END) / COUNT(*), twice, from the orders table.`,
        `SELECT ROUND(100.0 * SUM(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_rate, ROUND(100.0 * SUM(CASE WHEN order_status = 'Returned' THEN 1 ELSE 0 END) / COUNT(*), 1) AS return_rate FROM orders;`
      ],
      solution: `SELECT ROUND(100.0 * SUM(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_rate, ROUND(100.0 * SUM(CASE WHEN order_status = 'Returned' THEN 1 ELSE 0 END) / COUNT(*), 1) AS return_rate FROM orders;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Is the business growing? Compare like with like',
      body: `<p>The next question every executive asks: <i>“Are we growing?”</i> Remember the partial-year trap from Lesson 2.8: data for 2026 stops at 30 June. So the honest comparison is <b>first half versus first half</b>: H1 2026 against H1 2025. Compare identical periods, always.</p>
<p>We use order-line revenue (quantity times price), which, as you proved in Lesson 2.5, matches the payments total exactly.</p>`
    },
    {
      type: 'try',
      title: 'H1 2025 versus H1 2026',
      body: `<p>H1 2025: <b>1,461 orders</b>, revenue <b>235,298,935.50</b>. H1 2026: <b>1,406 orders</b>, revenue <b>226,371,814.67</b>. Revenue is down <b>3.8%</b>, and orders are down by almost exactly the same 3.8%. The conclusion: the business isn’t selling <i>smaller baskets</i>, it’s selling to <i>fewer orders</i>. That points the investigation at order volume (traffic, acquisition, retention), not pricing.</p>
<p>A good analyst doesn’t stop at “down 3.8%”. They say <b>why it is down</b>, even if the answer is “fewer orders”.</p>`,
      chart: 'bar',
      chartTitle: 'Revenue: H1 2025 versus H1 2026',
      code: `SELECT CASE WHEN o.order_date >= '2025-01-01' AND o.order_date < '2025-07-01' THEN 'H1 2025'
            ELSE 'H1 2026' END AS period,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue,
       COUNT(DISTINCT o.order_id) AS orders
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
WHERE (o.order_date >= '2025-01-01' AND o.order_date < '2025-07-01')
   OR (o.order_date >= '2026-01-01' AND o.order_date < '2026-07-01')
GROUP BY period
ORDER BY period;`
    },
    {
      id: 'sql-8-1-ex4',
      type: 'exercise',
      title: 'Your turn: the growth rate',
      body: `<p>Return one number, <code>pct_change</code>: the <b>percentage change in revenue</b> from H1 2025 (2025-01-01 to before 2025-07-01) to H1 2026 (2026-01-01 to before 2026-07-01), rounded to 1 decimal. Revenue is the sum of <code>quantity * unit_price</code> from <code>order_items</code>, joined to <code>orders</code> for the date. The answer is -3.8.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `A CTE h with two conditional sums (one per half-year), then ROUND(100.0 * (h1_2026 - h1_2025) / h1_2025, 1).`,
        `WITH h AS (SELECT SUM(CASE WHEN o.order_date >= '2025-01-01' AND o.order_date < '2025-07-01' THEN oi.quantity * oi.unit_price END) AS h1_2025, SUM(CASE WHEN o.order_date >= '2026-01-01' AND o.order_date < '2026-07-01' THEN oi.quantity * oi.unit_price END) AS h1_2026 FROM order_items oi JOIN orders o ON o.order_id = oi.order_id) SELECT ROUND(100.0 * (h1_2026 - h1_2025) / h1_2025, 1) AS pct_change FROM h;`
      ],
      solution: `WITH h AS (SELECT SUM(CASE WHEN o.order_date >= '2025-01-01' AND o.order_date < '2025-07-01' THEN oi.quantity * oi.unit_price END) AS h1_2025, SUM(CASE WHEN o.order_date >= '2026-01-01' AND o.order_date < '2026-07-01' THEN oi.quantity * oi.unit_price END) AS h1_2026 FROM order_items oi JOIN orders o ON o.order_id = oi.order_id) SELECT ROUND(100.0 * (h1_2026 - h1_2025) / h1_2025, 1) AS pct_change FROM h;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Concentration: where does the money come from?',
      body: `<p>One more instinct that defines good analysts: <b>compare each group’s share of money with its share of effort</b>. If one category brings far more revenue than its share of sales lines, the business depends heavily on it. Window functions (Module 6) make both shares one query: <code>SUM(x) / SUM(SUM(x)) OVER ()</code>.</p>`
    },
    {
      type: 'try',
      title: 'Revenue share versus line share',
      body: `<p><b>Electronics</b>: <b>38.5%</b> of revenue from only <b>20.4%</b> of order lines. <b>Books &amp; Stationery</b>: just <b>7.1%</b> of revenue from <b>20.3%</b> of lines. Every category sells about the same number of lines (each is around a fifth), but the money is lopsided because Electronics products cost far more. The business depends on Electronics: a supply or demand problem there would hurt much more than a problem in books.</p>`,
      chart: 'bar',
      chartTitle: 'Share of revenue by category (%)',
      code: `SELECT p.category,
       ROUND(100.0 * SUM(oi.quantity * oi.unit_price)
             / SUM(SUM(oi.quantity * oi.unit_price)) OVER (), 1) AS revenue_share,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS line_share
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
GROUP BY p.category
ORDER BY revenue_share DESC;`
    },
    {
      id: 'sql-8-1-ex5',
      type: 'exercise',
      title: 'Challenge: Electronics’ share of revenue',
      body: `<p>Return one number, <code>electronics_share</code>: the percentage of total order-line revenue (<code>quantity * unit_price</code> from <code>order_items</code>) that comes from the <b>Electronics</b> category, rounded to 1 decimal. The answer is 38.5.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join order_items to products. 100.0 * SUM(CASE WHEN category = 'Electronics' THEN quantity * unit_price ELSE 0 END) / SUM(quantity * unit_price).`,
        `SELECT ROUND(100.0 * SUM(CASE WHEN p.category = 'Electronics' THEN oi.quantity * oi.unit_price ELSE 0 END) / SUM(oi.quantity * oi.unit_price), 1) AS electronics_share FROM order_items oi JOIN products p ON p.product_id = oi.product_id;`
      ],
      solution: `SELECT ROUND(100.0 * SUM(CASE WHEN p.category = 'Electronics' THEN oi.quantity * oi.unit_price ELSE 0 END) / SUM(oi.quantity * oi.unit_price), 1) AS electronics_share FROM order_items oi JOIN products p ON p.product_id = oi.product_id;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The metric dictionary, and what you can do now',
      body: `<div class="callout work"><b>At work:</b> mature teams keep a <b>metric dictionary</b>: a short document (or a set of saved views) that records, for each KPI, its <b>name, definition, formula, filters, time period, owner and source tables</b>. When two people report different revenue, the dictionary says who is right and why. You can start one today: for each metric you report, write one sentence defining it, and one line saying which rows are included.</div>
<p>In this lesson you learned to:</p>
<ul>
<li>Treat every metric as a <b>number plus a definition</b>, and calculate several honest versions of revenue</li>
<li>Choose matching numerators and denominators for AOV</li>
<li>Build rate KPIs and a one-row KPI summary</li>
<li>Compare <b>like with like</b> periods, and explain <i>why</i> a number moved (fewer orders, not smaller baskets)</li>
<li>Compare share of revenue with share of volume to spot concentration</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>Two dashboards show different revenue for the same month. How do you investigate?</li>
<li>How would you calculate average order value, and what could go wrong?</li>
<li>Revenue is down 4% year over year. What would you check before telling the CEO why?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Compare the definitions first (gross or net, which statuses, which date field, time zone and period boundaries), then reconcile each number back to the source table and find the rows that differ.</p>
<p><b>2.</b> Revenue divided by the number of orders, making sure the numerator and denominator cover the same set of orders (same filters). Problems: including cancelled orders in one but not the other, duplicate rows from joins, and outliers pulling the average.</p>
<p><b>3.</b> That the periods are comparable (full versus partial), whether the drop comes from fewer orders or smaller baskets, which categories, regions or customer groups drive it, and whether the data itself changed (late-arriving data, definition changes).</p>
</details>
<p><b>Coming next, Lesson 8.2: Cohorts and retention.</b> Are customers coming back? You will group customers by when they first bought, track how many return, and discover a stark trend in how TradeFlow wins new customers.</p>`
    }
  ]
},
{
  id: 'sql-8-2',
  track: 'sql',
  title: '8.2 Cohorts and retention: do customers come back?',
  tables: ['orders'],
  intro: `The CEO’s next question is the one that decides whether a business survives: <i>“Are our customers coming back?”</i><br><br>Looking at total orders can’t answer it. A business can have steady order totals while quietly losing every customer it ever won, replaced by new ones. To see the truth you need <b>cohorts</b>: groups of customers who started at the same time, followed over time. This is one of the most powerful and most requested analyses in the world of data, and you can already build it with the tools you have.`,
  steps: [
    {
      type: 'explain',
      title: 'Class of 2023',
      body: `<div class="callout analogy"><b>The big idea:</b> a school tracks each <b>intake</b> separately: “the class of 2023”. How many of them are still enrolled in year two? In year three? You don’t mix them with the class of 2024, because they started at different times. A <b>cohort</b> is an intake of customers who share a starting period. <b>Retention</b> is the share of that cohort still active later.</div>
<p>The recipe:</p>
<ol>
<li>Find each customer’s <b>first order date</b>. That decides their cohort.</li>
<li>Build a list of <b>when each customer was active</b>.</li>
<li>For each cohort, count how many were active in each later period, as a percentage of the cohort’s size.</li>
</ol>`
    },
    {
      type: 'explain',
      title: 'Which start date? A decision with consequences',
      body: `<p>TradeFlow has a <code>signup_date</code> on every customer, which seems like the obvious cohort date. But in Lesson 6.2 you discovered that <b>81.5% of customers’ first orders come <i>before</i> their signup date</b>. If you build cohorts on <code>signup_date</code>, most customers appear to be buying before they exist, and your retention table would be nonsense.</p>
<p>So we define the cohort by the <b>first order date</b> instead. We state that clearly: <i>“cohort = year of first order in this dataset.”</i> That is exactly the habit from Lesson 8.1: <b>define it, then calculate it</b>.</p>
<div class="callout watch"><b>An honest caveat:</b> the data starts on 1 January 2023, so for customers who already existed, “first order in the data” may not be their true first order ever. We’ll keep this in mind when reading the results.</div>`
    },
    {
      type: 'try',
      title: 'Step 1: cohort sizes',
      body: `<p>The CTE <code>first_orders</code> finds each customer’s earliest order (a simple <code>MIN</code> with GROUP BY). Then we count customers per first-order year. The picture is striking: <b>1,520</b> customers first bought in 2023, <b>368</b> in 2024, only <b>80</b> in 2025, and just <b>14</b> in the first half of 2026. The bars shrink year after year. We’ll come back to what that means.</p>`,
      chart: 'bar',
      chartTitle: 'Customers by year of first order (cohort size)',
      code: `WITH first_orders AS (
    SELECT customer_id, MIN(order_date) AS first_date
    FROM orders
    GROUP BY customer_id
)
SELECT strftime('%Y', first_date) AS cohort_year,
       COUNT(*) AS customers
FROM first_orders
GROUP BY cohort_year
ORDER BY cohort_year;`
    },
    {
      id: 'sql-8-2-ex1',
      type: 'exercise',
      title: 'Your turn: the cohort sizes',
      body: `<p>Show each <code>cohort_year</code> (the year of a customer’s first order) and the number of customers in it (<code>customers</code>), in year order. Use a CTE <code>first_orders</code> built with <code>MIN(order_date)</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `first_orders: SELECT customer_id, MIN(order_date) AS first_date FROM orders GROUP BY customer_id. Then strftime('%Y', first_date) and COUNT(*).`,
        `WITH first_orders AS (SELECT customer_id, MIN(order_date) AS first_date FROM orders GROUP BY customer_id) SELECT strftime('%Y', first_date) AS cohort_year, COUNT(*) AS customers FROM first_orders GROUP BY cohort_year ORDER BY cohort_year;`
      ],
      solution: `WITH first_orders AS (SELECT customer_id, MIN(order_date) AS first_date FROM orders GROUP BY customer_id) SELECT strftime('%Y', first_date) AS cohort_year, COUNT(*) AS customers FROM first_orders GROUP BY cohort_year ORDER BY cohort_year;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Step 2: who was active when?',
      body: `<p>Next, an <b>activity</b> list: one row for each customer and each year in which they ordered. We need <code>DISTINCT</code> so that a customer with five orders in 2024 counts <b>once</b> for 2024, because we ask “were they active?”, not “how many orders?”.</p>
<p>Then we <b>join</b> cohorts to activity and count. The result is a <i>long</i> table: one row per (cohort, year).</p>`
    },
    {
      type: 'try',
      title: 'The cohort-by-year table, in long form',
      body: `<p>Read it like a story. Of the <b>1,520</b> customers who started in 2023: <b>1,520</b> were active in 2023 (of course), <b>1,166</b> in 2024, <b>1,185</b> in 2025, and <b>770</b> in the first half of 2026. The 2024 cohort of 368 had 282 active in 2025 and 183 in 2026. Raw counts are hard to compare across cohorts of different sizes, so the next step turns them into percentages.</p>`,
      code: `WITH first_orders AS (
    SELECT customer_id, MIN(order_date) AS first_date
    FROM orders
    GROUP BY customer_id
),
cohort AS (
    SELECT customer_id, strftime('%Y', first_date) AS cohort_year
    FROM first_orders
),
activity AS (
    SELECT DISTINCT customer_id, strftime('%Y', order_date) AS active_year
    FROM orders
)
SELECT c.cohort_year,
       a.active_year,
       COUNT(*) AS active_customers
FROM cohort c
JOIN activity a ON a.customer_id = c.customer_id
GROUP BY c.cohort_year, a.active_year
ORDER BY c.cohort_year, a.active_year;`
    },
    {
      type: 'explain',
      title: 'Step 3: the retention table',
      body: `<p>Divide each count by the cohort’s size, and spread the years into <b>columns</b> with conditional sums (the pivot trick from Lesson 2.7). Each row is a cohort, each column a year, and each cell is “<b>what percentage of this cohort was active in that year</b>”. This grid is the classic <b>retention table</b> you will see in every business’s reports.</p>`
    },
    {
      type: 'try',
      title: 'The retention table',
      body: `<p>Read the 2023 row: <b>100%</b> in 2023 (by definition), <b>76.7%</b> in 2024, <b>78.0%</b> in 2025, and <b>50.7%</b> in 2026. Three things to notice:</p>
<ul>
<li>Roughly <b>three out of four</b> customers are still buying a year after they started. That is strong retention.</li>
<li>Look at the 2025 column for the 2023 cohort (78.0%): it went <i>up</i> from 2024. Some customers skip a year and return. Retention here is not a one-way slide.</li>
<li>The 2026 column is only <b>half a year</b> of data, so its numbers look low (about 50%) for a reason that has nothing to do with customer behaviour. Never compare a half-year column to full-year columns.</li>
</ul>`,
      code: `WITH first_orders AS (
    SELECT customer_id, MIN(order_date) AS first_date
    FROM orders
    GROUP BY customer_id
),
cohort AS (
    SELECT customer_id, strftime('%Y', first_date) AS cohort_year
    FROM first_orders
),
activity AS (
    SELECT DISTINCT customer_id, strftime('%Y', order_date) AS active_year
    FROM orders
),
sizes AS (
    SELECT cohort_year, COUNT(*) AS size
    FROM cohort
    GROUP BY cohort_year
)
SELECT c.cohort_year,
       s.size AS cohort_size,
       ROUND(100.0 * SUM(CASE WHEN a.active_year = '2023' THEN 1 ELSE 0 END) / s.size, 1) AS y2023,
       ROUND(100.0 * SUM(CASE WHEN a.active_year = '2024' THEN 1 ELSE 0 END) / s.size, 1) AS y2024,
       ROUND(100.0 * SUM(CASE WHEN a.active_year = '2025' THEN 1 ELSE 0 END) / s.size, 1) AS y2025,
       ROUND(100.0 * SUM(CASE WHEN a.active_year = '2026' THEN 1 ELSE 0 END) / s.size, 1) AS y2026_h1
FROM cohort c
JOIN activity a ON a.customer_id = c.customer_id
JOIN sizes s ON s.cohort_year = c.cohort_year
GROUP BY c.cohort_year, s.size
ORDER BY c.cohort_year;`
    },
    {
      id: 'sql-8-2-c1',
      type: 'check',
      title: 'Why does the 2026 column show only about 50% for older cohorts?',
      body: `<p>Think about how much of 2026 is in the data.</p>`,
      options: ['Half of the customers left', '2026 has only six months of data (to 30 June), so fewer customers have had a chance to order', 'The query has a bug', 'Customers never come back in 2026'],
      answer: 1,
      why: [
        'Not necessarily. Customers who skip a half-year can return later. The shortage of time is the main reason.',
        'Yes! A partial period understates activity. To compare fairly, you would compare the same half of earlier years, or wait for the full year.',
        'The query is fine. The data simply stops at 30 June 2026.',
        'There’s no evidence of that. 770 customers from the 2023 cohort are already active in 2026.'
      ]
    },
    {
      id: 'sql-8-2-ex2',
      type: 'exercise',
      title: 'Your turn: one cell of the table',
      body: `<p>Return one number, <code>retained_2024_pct</code>: the percentage of the <b>2023 cohort</b> (customers whose first order was in 2023) who placed at least one order in <b>2024</b>, rounded to 1 decimal. The answer is 76.7.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Cohort: customers whose MIN(order_date) falls in 2023. Active in 2024: DISTINCT customer_id from orders with an order_date in 2024. Divide the two counts.`,
        `WITH first_orders AS (SELECT customer_id, MIN(order_date) AS first_date FROM orders GROUP BY customer_id), cohort AS (SELECT customer_id FROM first_orders WHERE strftime('%Y', first_date) = '2023'), active AS (SELECT DISTINCT customer_id FROM orders WHERE strftime('%Y', order_date) = '2024') SELECT ROUND(100.0 * COUNT(a.customer_id) / COUNT(*), 1) AS retained_2024_pct FROM cohort c LEFT JOIN active a ON a.customer_id = c.customer_id;`
      ],
      solution: `WITH first_orders AS (SELECT customer_id, MIN(order_date) AS first_date FROM orders GROUP BY customer_id), cohort AS (SELECT customer_id FROM first_orders WHERE strftime('%Y', first_date) = '2023'), active AS (SELECT DISTINCT customer_id FROM orders WHERE strftime('%Y', order_date) = '2024') SELECT ROUND(100.0 * COUNT(a.customer_id) / COUNT(*), 1) AS retained_2024_pct FROM cohort c LEFT JOIN active a ON a.customer_id = c.customer_id;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Timing: how long until the second order?',
      body: `<p>Cohorts by calendar year are one view. Another is <b>time since the first order</b>. The most important number in retention is the second order: customers who buy twice are far more likely to keep buying. So analysts measure <b>how quickly</b> customers place their second order.</p>
<p>The recipe, which uses your window skills: number each customer’s orders (<code>ROW_NUMBER</code>), take the first and the second order dates, subtract.</p>`
    },
    {
      type: 'try',
      title: 'How long until the second order?',
      body: `<p>Of 1,982 customers: only <b>225</b> placed a second order within 30 days, and <b>363</b> within 31 to 90 days. Most (<b>921</b>) came back after <b>91 to 365 days</b>, <b>416</b> took over a year, and <b>57</b> never came back. So <b>29.7%</b> return within 90 days.</p>
<p>The insight: TradeFlow is a <b>slow-repeat</b> business. Customers return, but over months, not weeks. A “win-back” email at day 30 would reach people who haven’t even had time to need anything. A message around day 90 to 120 fits the real rhythm.</p>`,
      chart: 'bar',
      chartTitle: 'Time from first to second order (customers)',
      code: `WITH ranked AS (
    SELECT customer_id, order_date,
           ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS n
    FROM orders
),
first_two AS (
    SELECT customer_id,
           MAX(CASE WHEN n = 1 THEN order_date END) AS d1,
           MAX(CASE WHEN n = 2 THEN order_date END) AS d2
    FROM ranked
    WHERE n <= 2
    GROUP BY customer_id
)
SELECT CASE WHEN d2 IS NULL THEN 'never returned'
            WHEN julianday(d2) - julianday(d1) <= 30  THEN 'within 30 days'
            WHEN julianday(d2) - julianday(d1) <= 90  THEN '31-90 days'
            WHEN julianday(d2) - julianday(d1) <= 365 THEN '91-365 days'
            ELSE 'over a year' END AS second_order,
       COUNT(*) AS customers
FROM first_two
GROUP BY second_order
ORDER BY customers DESC;`
    },
    {
      id: 'sql-8-2-ex3',
      type: 'exercise',
      title: 'Your turn: the 90-day repeaters',
      body: `<p>Return one number, <code>second_order_within_90</code>: how many customers placed their <b>second order within 90 days</b> of their first order. Number the orders with <code>ROW_NUMBER</code>, take orders 1 and 2, and compare the dates with <code>julianday</code>. The answer is 588.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Use the ranked and first_two CTEs from the lesson, then COUNT(*) WHERE d2 IS NOT NULL AND julianday(d2) - julianday(d1) <= 90.`,
        `WITH ranked AS (SELECT customer_id, order_date, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS n FROM orders), first_two AS (SELECT customer_id, MAX(CASE WHEN n = 1 THEN order_date END) AS d1, MAX(CASE WHEN n = 2 THEN order_date END) AS d2 FROM ranked WHERE n <= 2 GROUP BY customer_id) SELECT COUNT(*) AS second_order_within_90 FROM first_two WHERE d2 IS NOT NULL AND julianday(d2) - julianday(d1) <= 90;`
      ],
      solution: `WITH ranked AS (SELECT customer_id, order_date, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS n FROM orders), first_two AS (SELECT customer_id, MAX(CASE WHEN n = 1 THEN order_date END) AS d1, MAX(CASE WHEN n = 2 THEN order_date END) AS d2 FROM ranked WHERE n <= 2 GROUP BY customer_id) SELECT COUNT(*) AS second_order_within_90 FROM first_two WHERE d2 IS NOT NULL AND julianday(d2) - julianday(d1) <= 90;`,
      ordered: true
    },
    {
      id: 'sql-8-2-ex4',
      type: 'exercise',
      title: 'Your turn: the one-time buyers',
      body: `<p>Return one number, <code>one_time_buyers</code>: how many customers have placed <b>exactly one order</b> and never returned. The answer is 57. (That is only 2.9% of buyers. Put another way, <b>97.1%</b> of buyers order again.)</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `A CTE with COUNT(*) per customer_id, then count the customers where that count is 1.`,
        `WITH per_customer AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) SELECT COUNT(*) AS one_time_buyers FROM per_customer WHERE n = 1;`
      ],
      solution: `WITH per_customer AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) SELECT COUNT(*) AS one_time_buyers FROM per_customer WHERE n = 1;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The headline finding: acquisition has dried up',
      body: `<p>Back to the shrinking cohort sizes. Zoom in from years to <b>half-years</b> and the trend becomes impossible to ignore. <b>Customers are staying</b> (97.1% order again, retention is healthy), but <b>almost no new customers are arriving</b>. A business with strong retention and weak acquisition slowly shrinks, which matches the 3.8% drop you saw in Lesson 8.1.</p>`
    },
    {
      type: 'try',
      title: 'New buyers per half-year',
      body: `<p>First-time buyers per half-year: <b>1,021</b>, <b>499</b>, <b>257</b>, <b>111</b>, <b>53</b>, <b>27</b>, <b>14</b>. Each period brings in roughly half as many new customers as the one before. Only <b>94</b> customers made their first order in 2025 or later, out of 1,982 buyers.</p>
<p>This is the kind of finding an analyst brings to a CEO: <i>“Our existing customers are loyal, but we are barely acquiring new ones. The 3.8% decline will continue unless acquisition recovers.”</i> One chart, one sentence, one recommendation.</p>
<div class="callout watch"><b>Caveat to state out loud:</b> because the data begins in January 2023 and TradeFlow has a fixed pool of 2,000 registered customers, part of the 2023 spike is simply the existing base placing its first order <i>in this dataset</i>. The slowdown after that is real, but a careful analyst would confirm with the business what counted as “new” before presenting it.</div>`,
      chart: 'bar',
      chartTitle: 'New buyers (first-ever order in the data) per half-year',
      code: `WITH first_orders AS (
    SELECT customer_id, MIN(order_date) AS first_date
    FROM orders
    GROUP BY customer_id
)
SELECT CASE WHEN first_date < '2023-07-01' THEN '2023 H1'
            WHEN first_date < '2024-01-01' THEN '2023 H2'
            WHEN first_date < '2024-07-01' THEN '2024 H1'
            WHEN first_date < '2025-01-01' THEN '2024 H2'
            WHEN first_date < '2025-07-01' THEN '2025 H1'
            WHEN first_date < '2026-01-01' THEN '2025 H2'
            ELSE '2026 H1' END AS half_year,
       COUNT(*) AS new_buyers
FROM first_orders
GROUP BY half_year
ORDER BY half_year;`
    },
    {
      id: 'sql-8-2-ex5',
      type: 'exercise',
      title: 'Challenge: the acquisition number',
      body: `<p>Return one number, <code>new_buyers_since_2025</code>: how many customers made their <b>first order on or after 2025-01-01</b>. Build a <code>first_orders</code> CTE and filter it. The answer is 94.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `first_orders with MIN(order_date), then COUNT(*) WHERE first_date >= '2025-01-01'.`,
        `WITH first_orders AS (SELECT customer_id, MIN(order_date) AS first_date FROM orders GROUP BY customer_id) SELECT COUNT(*) AS new_buyers_since_2025 FROM first_orders WHERE first_date >= '2025-01-01';`
      ],
      solution: `WITH first_orders AS (SELECT customer_id, MIN(order_date) AS first_date FROM orders GROUP BY customer_id) SELECT COUNT(*) AS new_buyers_since_2025 FROM first_orders WHERE first_date >= '2025-01-01';`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<div class="callout work"><b>At work:</b> cohort retention tables are in almost every subscription, e-commerce and app business’s weekly report, usually drawn as a colour-coded grid called a <b>retention heatmap</b>. Teams slice them further: by acquisition channel, country, or first product bought. The SQL you wrote is the same, with one more column in the GROUP BY. Be ready to say <b>how you defined the cohort</b>, and why.</div>
<p>In this lesson you learned to:</p>
<ul>
<li>Define a <b>cohort</b> by first purchase, and explain why <code>signup_date</code> wasn’t trustworthy here</li>
<li>Build a <b>retention table</b> with <code>DISTINCT</code> activity, joins and conditional sums</li>
<li>Avoid comparing a partial period with full periods</li>
<li>Measure <b>time to second order</b> with <code>ROW_NUMBER</code></li>
<li>Turn a pattern (shrinking new-buyer numbers) into a finding and a recommendation</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is a cohort, and what is retention?</li>
<li>How would you calculate month-1 retention in SQL?</li>
<li>Retention looks fine but revenue is falling. What might explain it?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A cohort is a group of customers who share a starting event or period (for example their first purchase month). Retention is the percentage of that cohort still active (ordering, logging in) in later periods.</p>
<p><b>2.</b> Find each customer’s first order month (cohort), then count the customers from each cohort who ordered in the following month, divide by the cohort size.</p>
<p><b>3.</b> Not enough new customers are arriving (acquisition problem), customers are spending less per order, or fewer products per basket. Retention only covers existing customers.</p>
</details>
<p><b>Coming next, Lesson 8.3: The funnel.</b> Where do orders get lost between “placed” and “delivered”? You will build a funnel, calculate the drop-off at every step, and catch the business data contradicting itself.</p>`
    }
  ]
},
{
  id: 'sql-8-3',
  track: 'sql',
  title: '8.3 The funnel: where do orders get lost?',
  tables: ['customers', 'orders', 'payments', 'deliveries'],
  intro: `The operations director has a puzzle: <i>“We take 10,000 orders. How many actually reach the customer, paid and delivered? And where do we lose the rest?”</i><br><br>Every order travels a path: <b>placed, kept, paid, delivered</b>. Each step loses some orders. A chart of those numbers, from wide at the top to narrow at the bottom, is called a <b>funnel</b>. In this lesson you will build one, find the biggest leak, and discover that TradeFlow’s status columns sometimes <b>disagree with each other</b>.`,
  steps: [
    {
      type: 'explain',
      title: 'The funnel: wide at the top, narrow at the bottom',
      body: `<div class="callout analogy"><b>The big idea:</b> pour water into a funnel. All of it goes in at the wide top, but only some comes out of the narrow bottom, and some is lost on the way. Each <b>stage</b> of a funnel counts how many survived <i>that step and all earlier ones</i>.</div>
<p>Our four stages for an order:</p>
<ol>
<li><b>Placed:</b> the order exists</li>
<li><b>Not cancelled:</b> the order wasn’t cancelled</li>
<li><b>Paid:</b> not cancelled, <i>and</i> its payment status is Paid</li>
<li><b>Delivered:</b> not cancelled, paid, <i>and</i> its delivery status is Delivered</li>
</ol>
<p>The golden rule: each stage must <b>include the conditions of the stages before it</b>, so every stage is a subset of the previous one, and the numbers can only go down.</p>`
    },
    {
      type: 'try',
      title: 'Step 1: one row per order, with all three statuses',
      body: `<p>To build the funnel we need, for each order, its status, its payment status and its delivery status <b>side by side</b>. We <code>LEFT JOIN</code> payments and deliveries so that orders without a delivery (the 500 you met in Lesson 3.2) are kept. Each order has exactly one payment, and at most one delivery, so the join doesn’t multiply rows.</p>`,
      code: `SELECT o.order_id,
       o.order_status,
       p.payment_status,
       d.delivery_status
FROM orders o
LEFT JOIN payments p ON p.order_id = o.order_id
LEFT JOIN deliveries d ON d.order_id = o.order_id
ORDER BY o.order_id
LIMIT 8;`
    },
    {
      type: 'try',
      title: 'Step 2: the funnel counts',
      body: `<p>Each column adds one more condition, stage by stage: <b>10,000</b> placed, <b>9,471</b> not cancelled, <b>8,001</b> paid, <b>6,415</b> delivered. Out of every 100 orders placed, about <b>64</b> end up paid <i>and</i> delivered.</p>
<p>(We skipped a “shipped” stage on purpose: every one of the 8,001 paid, uncancelled orders has a delivery record, so that stage would lose nothing.)</p>`,
      code: `WITH f AS (
    SELECT o.order_id, o.order_status, p.payment_status, d.delivery_status
    FROM orders o
    LEFT JOIN payments p ON p.order_id = o.order_id
    LEFT JOIN deliveries d ON d.order_id = o.order_id
)
SELECT COUNT(*) AS placed,
       SUM(CASE WHEN order_status <> 'Cancelled' THEN 1 ELSE 0 END) AS not_cancelled,
       SUM(CASE WHEN order_status <> 'Cancelled' AND payment_status = 'Paid' THEN 1 ELSE 0 END) AS paid,
       SUM(CASE WHEN order_status <> 'Cancelled' AND payment_status = 'Paid'
                 AND delivery_status = 'Delivered' THEN 1 ELSE 0 END) AS delivered
FROM f;`
    },
    {
      id: 'sql-8-3-ex1',
      type: 'exercise',
      title: 'Your turn: the first three stages',
      body: `<p>Build the funnel up to payment. Return one row with three columns: <code>placed</code>, <code>not_cancelled</code> and <code>paid</code> (the last one counting orders that are not Cancelled <b>and</b> have a payment status of Paid). Use a CTE <code>f</code> with <code>LEFT JOIN</code>s as in the lesson. Expected: 10000, 9471, 8001.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `A CTE f joining orders to payments (and deliveries if you like), then COUNT(*) and two conditional SUMs.`,
        `WITH f AS (SELECT o.order_id, o.order_status, p.payment_status, d.delivery_status FROM orders o LEFT JOIN payments p ON p.order_id = o.order_id LEFT JOIN deliveries d ON d.order_id = o.order_id) SELECT COUNT(*) AS placed, SUM(CASE WHEN order_status <> 'Cancelled' THEN 1 ELSE 0 END) AS not_cancelled, SUM(CASE WHEN order_status <> 'Cancelled' AND payment_status = 'Paid' THEN 1 ELSE 0 END) AS paid FROM f;`
      ],
      solution: `WITH f AS (SELECT o.order_id, o.order_status, p.payment_status, d.delivery_status FROM orders o LEFT JOIN payments p ON p.order_id = o.order_id LEFT JOIN deliveries d ON d.order_id = o.order_id) SELECT COUNT(*) AS placed, SUM(CASE WHEN order_status <> 'Cancelled' THEN 1 ELSE 0 END) AS not_cancelled, SUM(CASE WHEN order_status <> 'Cancelled' AND payment_status = 'Paid' THEN 1 ELSE 0 END) AS paid FROM f;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Funnels read better as rows',
      body: `<p>One row with four columns is hard to chart. A funnel is more natural as <b>one row per stage</b>. We build it by stacking four small queries with <code>UNION ALL</code> (Lesson 3.5), numbering the steps so the order is explicit. Then a window function (<code>LAG</code>, Lesson 6.3) calculates the <b>conversion from the previous stage</b>, and <code>FIRST_VALUE</code> (Lesson 6.5) the conversion from the very top.</p>`
    },
    {
      type: 'try',
      title: 'The funnel table',
      body: `<p>Four rows, and two percentages for each. <b>94.7%</b> of placed orders are not cancelled. <b>84.5%</b> of those get paid. <b>80.2%</b> of those are delivered. End to end, only <b>64.2%</b> of placed orders make the full journey. Look at the chart: the funnel narrows at every step, and the biggest single loss in absolute terms is between Paid and Delivered (1,586 orders).</p>`,
      chart: 'bar',
      chartTitle: 'Order funnel: orders surviving each stage',
      code: `WITH f AS (
    SELECT o.order_id, o.order_status, p.payment_status, d.delivery_status
    FROM orders o
    LEFT JOIN payments p ON p.order_id = o.order_id
    LEFT JOIN deliveries d ON d.order_id = o.order_id
),
steps AS (
    SELECT 1 AS step_no, 'Placed' AS stage, COUNT(*) AS orders FROM f
    UNION ALL
    SELECT 2, 'Not cancelled', COUNT(*) FROM f
    WHERE order_status <> 'Cancelled'
    UNION ALL
    SELECT 3, 'Paid', COUNT(*) FROM f
    WHERE order_status <> 'Cancelled' AND payment_status = 'Paid'
    UNION ALL
    SELECT 4, 'Delivered', COUNT(*) FROM f
    WHERE order_status <> 'Cancelled' AND payment_status = 'Paid' AND delivery_status = 'Delivered'
)
SELECT stage,
       orders,
       ROUND(100.0 * orders / LAG(orders) OVER (ORDER BY step_no), 1) AS pct_of_previous,
       ROUND(100.0 * orders / FIRST_VALUE(orders) OVER (ORDER BY step_no), 1) AS pct_of_placed
FROM steps
ORDER BY step_no;`
    },
    {
      id: 'sql-8-3-c1',
      type: 'check',
      title: 'In a funnel, why must each stage include the conditions of all earlier stages?',
      body: `<p>Think about what “survived to this stage” means.</p>`,
      options: ['To make the query longer', 'So each stage counts only orders that made it through every step before it, which keeps the numbers decreasing', 'Because SQL requires it', 'It is optional and makes no difference'],
      answer: 1,
      why: [
        'Length is not the goal. The point is that each stage is a subset of the one before it.',
        'Yes! A delivered order that was never paid would sneak into the “Delivered” stage if you only checked delivery. Stacked conditions keep the funnel honest.',
        'SQL doesn’t require it. It’s the logic of the funnel that does.',
        'It makes a big difference: without the earlier conditions the stages can overlap and the funnel can go up instead of down.'
      ]
    },
    {
      id: 'sql-8-3-ex2',
      type: 'exercise',
      title: 'Your turn: build the funnel table',
      body: `<p>Recreate the funnel table. Use a CTE <code>f</code> (orders with payment and delivery statuses) and a CTE <code>steps</code> with four <code>UNION ALL</code> parts and the stage labels <b>'Placed'</b>, <b>'Not cancelled'</b>, <b>'Paid'</b>, <b>'Delivered'</b>. Then show <code>stage</code>, <code>orders</code> and <code>pct_of_previous</code> (<code>LAG</code>, rounded to 1 decimal), in step order. The first row’s <code>pct_of_previous</code> will be empty.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `steps columns: step_no, stage, orders. Final SELECT: stage, orders, ROUND(100.0 * orders / LAG(orders) OVER (ORDER BY step_no), 1) AS pct_of_previous, ordered by step_no.`,
        `WITH f AS (SELECT o.order_id, o.order_status, p.payment_status, d.delivery_status FROM orders o LEFT JOIN payments p ON p.order_id = o.order_id LEFT JOIN deliveries d ON d.order_id = o.order_id), steps AS (SELECT 1 AS step_no, 'Placed' AS stage, COUNT(*) AS orders FROM f UNION ALL SELECT 2, 'Not cancelled', COUNT(*) FROM f WHERE order_status <> 'Cancelled' UNION ALL SELECT 3, 'Paid', COUNT(*) FROM f WHERE order_status <> 'Cancelled' AND payment_status = 'Paid' UNION ALL SELECT 4, 'Delivered', COUNT(*) FROM f WHERE order_status <> 'Cancelled' AND payment_status = 'Paid' AND delivery_status = 'Delivered') SELECT stage, orders, ROUND(100.0 * orders / LAG(orders) OVER (ORDER BY step_no), 1) AS pct_of_previous FROM steps ORDER BY step_no;`
      ],
      solution: `WITH f AS (SELECT o.order_id, o.order_status, p.payment_status, d.delivery_status FROM orders o LEFT JOIN payments p ON p.order_id = o.order_id LEFT JOIN deliveries d ON d.order_id = o.order_id), steps AS (SELECT 1 AS step_no, 'Placed' AS stage, COUNT(*) AS orders FROM f UNION ALL SELECT 2, 'Not cancelled', COUNT(*) FROM f WHERE order_status <> 'Cancelled' UNION ALL SELECT 3, 'Paid', COUNT(*) FROM f WHERE order_status <> 'Cancelled' AND payment_status = 'Paid' UNION ALL SELECT 4, 'Delivered', COUNT(*) FROM f WHERE order_status <> 'Cancelled' AND payment_status = 'Paid' AND delivery_status = 'Delivered') SELECT stage, orders, ROUND(100.0 * orders / LAG(orders) OVER (ORDER BY step_no), 1) AS pct_of_previous FROM steps ORDER BY step_no;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Find the leak: look inside the biggest drop',
      body: `<p>The funnel tells you <b>where</b> orders are lost. The next skill is finding out <b>why</b>. Take the Paid stage: of the 9,471 orders that weren’t cancelled, 1,470 were <b>not</b> Paid. Their payment status tells the story, so we group by it.</p>`
    },
    {
      type: 'try',
      title: 'Why are active orders not paid?',
      body: `<p>Of the 1,470 non-cancelled orders that aren’t “Paid”: <b>575 are Pending</b> (the money may still arrive), <b>493 were Refunded</b>, and <b>402 Failed</b>. Different problems, different owners: pending payments are a finance follow-up, failed payments a checkout or provider issue, refunds a customer-service matter. A funnel number becomes useful only when it points to <b>someone who can act</b>.</p>`,
      chart: 'bar',
      chartTitle: 'Non-cancelled orders that are not Paid, by payment status',
      code: `SELECT p.payment_status,
       COUNT(*) AS orders
FROM orders o
JOIN payments p ON p.order_id = o.order_id
WHERE o.order_status <> 'Cancelled'
  AND p.payment_status <> 'Paid'
GROUP BY p.payment_status
ORDER BY orders DESC;`
    },
    {
      id: 'sql-8-3-ex3',
      type: 'exercise',
      title: 'Your turn: the delivery leak',
      body: `<p>Look inside the last drop. Among orders that are <b>not Cancelled</b> and have a <b>Paid</b> payment, show each <code>delivery_status</code> and the number of orders (<code>orders</code>), most orders first. You should see Delivered at 6,415 and the other outcomes below it.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join orders, payments and deliveries. WHERE o.order_status <> 'Cancelled' AND p.payment_status = 'Paid', then GROUP BY d.delivery_status.`,
        `SELECT d.delivery_status, COUNT(*) AS orders FROM orders o JOIN payments p ON p.order_id = o.order_id JOIN deliveries d ON d.order_id = o.order_id WHERE o.order_status <> 'Cancelled' AND p.payment_status = 'Paid' GROUP BY d.delivery_status ORDER BY orders DESC;`
      ],
      solution: `SELECT d.delivery_status, COUNT(*) AS orders FROM orders o JOIN payments p ON p.order_id = o.order_id JOIN deliveries d ON d.order_id = o.order_id WHERE o.order_status <> 'Cancelled' AND p.payment_status = 'Paid' GROUP BY d.delivery_status ORDER BY orders DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'When the statuses disagree',
      body: `<p>A funnel quietly assumes the statuses are <b>consistent</b>: a “Completed” order has been paid and delivered. Is that true here? Cross-tabulating two status columns is the fastest way to find out. If the two columns <i>tell different stories</i> for the same order, something in the data pipeline is out of sync.</p>`
    },
    {
      type: 'try',
      title: 'Order status versus delivery status',
      body: `<p>Look at the rows for <b>Completed</b> orders: <b>5,901</b> delivered (good), but also <b>777 still In Transit</b>, <b>517 Delayed</b> and <b>217 Failed</b>. How can an order be Completed if its delivery Failed? And look at <b>Cancelled</b> orders: <b>26</b> of them show a delivery status of Delivered.</p>
<p>These are <b>contradictions</b>. They are not errors <i>you</i> made. They are signs that the order system and the logistics system update their statuses on different schedules, or with different meanings of “completed”. The right response isn’t to “fix” them. It is to flag them with numbers and ask the owners.</p>`,
      code: `SELECT o.order_status,
       COALESCE(d.delivery_status, '(no delivery record)') AS delivery_status,
       COUNT(*) AS orders
FROM orders o
LEFT JOIN deliveries d ON d.order_id = o.order_id
GROUP BY o.order_status, delivery_status
ORDER BY o.order_status, delivery_status;`
    },
    {
      id: 'sql-8-3-ex4',
      type: 'exercise',
      title: 'Your turn: quantify the contradiction',
      body: `<p>Return one number, <code>completed_but_not_arrived</code>: how many orders have the order status <b>Completed</b> but a delivery status of <b>In Transit</b> or <b>Failed</b>. The answer is 994.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join orders to deliveries, filter order_status = 'Completed' and delivery_status IN ('In Transit', 'Failed'), and COUNT(*).`,
        `SELECT COUNT(*) AS completed_but_not_arrived FROM orders o JOIN deliveries d ON d.order_id = o.order_id WHERE o.order_status = 'Completed' AND d.delivery_status IN ('In Transit', 'Failed');`
      ],
      solution: `SELECT COUNT(*) AS completed_but_not_arrived FROM orders o JOIN deliveries d ON d.order_id = o.order_id WHERE o.order_status = 'Completed' AND d.delivery_status IN ('In Transit', 'Failed');`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Segment the funnel: is one country worse?',
      body: `<p>A single funnel hides differences between groups. Slicing it by country, product or payment method can pinpoint the leak. The recipe is just the same funnel with a <code>GROUP BY</code> on the group and one more join (to customers for the country). Let’s compute the <b>end-to-end rate</b> (placed to paid and delivered) per country.</p>`
    },
    {
      type: 'try',
      title: 'End-to-end rate by country',
      body: `<p>Rwanda delivers best: <b>65.2%</b> of placed orders end up paid and delivered. <b>Kenya</b> is the weakest at <b>62.4%</b>. The gap is under 3 points, so no country is dramatically broken, but if an operations team wanted to start somewhere, Kenya has the most to gain.</p>
<p>A fair question to ask: is a 2.8-point gap <i>meaningful</i>, or just noise? With about 2,000 orders per country, small differences can be chance. In Module 5 of the Statistics track you will learn how to test that properly.</p>`,
      chart: 'bar',
      chartTitle: 'Orders placed that end up paid and delivered (%), by country',
      code: `WITH f AS (
    SELECT o.order_id, c.country, o.order_status, p.payment_status, d.delivery_status
    FROM orders o
    JOIN customers c ON c.customer_id = o.customer_id
    LEFT JOIN payments p ON p.order_id = o.order_id
    LEFT JOIN deliveries d ON d.order_id = o.order_id
)
SELECT country,
       ROUND(100.0 * SUM(CASE WHEN order_status <> 'Cancelled' AND payment_status = 'Paid'
                              AND delivery_status = 'Delivered' THEN 1 ELSE 0 END) / COUNT(*), 1) AS delivered_pct,
       COUNT(*) AS placed
FROM f
GROUP BY country
ORDER BY delivered_pct DESC;`
    },
    {
      id: 'sql-8-3-ex5',
      type: 'exercise',
      title: 'Challenge: the funnel by country',
      body: `<p>Show each <code>country</code> and its <b>end-to-end rate</b> (<code>delivered_pct</code>): the percentage of its placed orders that are <b>not Cancelled, Paid, and Delivered</b>, rounded to 1 decimal, highest first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `A CTE f joining orders, customers (for country) and LEFT JOINing payments and deliveries. Then a conditional SUM divided by COUNT(*), grouped by country.`,
        `WITH f AS (SELECT o.order_id, c.country, o.order_status, p.payment_status, d.delivery_status FROM orders o JOIN customers c ON c.customer_id = o.customer_id LEFT JOIN payments p ON p.order_id = o.order_id LEFT JOIN deliveries d ON d.order_id = o.order_id) SELECT country, ROUND(100.0 * SUM(CASE WHEN order_status <> 'Cancelled' AND payment_status = 'Paid' AND delivery_status = 'Delivered' THEN 1 ELSE 0 END) / COUNT(*), 1) AS delivered_pct FROM f GROUP BY country ORDER BY delivered_pct DESC;`
      ],
      solution: `WITH f AS (SELECT o.order_id, c.country, o.order_status, p.payment_status, d.delivery_status FROM orders o JOIN customers c ON c.customer_id = o.customer_id LEFT JOIN payments p ON p.order_id = o.order_id LEFT JOIN deliveries d ON d.order_id = o.order_id) SELECT country, ROUND(100.0 * SUM(CASE WHEN order_status <> 'Cancelled' AND payment_status = 'Paid' AND delivery_status = 'Delivered' THEN 1 ELSE 0 END) / COUNT(*), 1) AS delivered_pct FROM f GROUP BY country ORDER BY delivered_pct DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<div class="callout work"><b>At work:</b> funnels are everywhere: website visits to sign-ups to purchases, job applications to hires, support tickets to resolutions. The method never changes: define the stages, make each one a subset of the last, count, compute step and total conversion, then <b>look inside the biggest drop</b> and <b>slice by segment</b>. And always check whether your status columns are consistent <i>before</i> you trust the funnel.</div>
<p>In this lesson you learned to:</p>
<ul>
<li>Build an order funnel with stacked conditions, as columns and as rows with <code>UNION ALL</code></li>
<li>Calculate step conversion with <code>LAG</code> and total conversion with <code>FIRST_VALUE</code></li>
<li>Investigate the biggest leak by its reasons, and slice the funnel by country</li>
<li>Detect <b>contradictions between status columns</b> and report them with numbers</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is a funnel analysis, and how do you calculate conversion between steps?</li>
<li>Why must each funnel stage be a subset of the previous one?</li>
<li>You find 994 orders marked Completed with failed deliveries. What do you do?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A funnel counts how many users or orders reach each successive stage of a process. Step conversion is the count at a stage divided by the count at the previous stage, and overall conversion is the count divided by the first stage’s count.</p>
<p><b>2.</b> So each stage only counts items that passed every earlier step; otherwise stages overlap, the funnel can increase, and the conversion rates are meaningless.</p>
<p><b>3.</b> Quantify it, check whether it follows a pattern (dates, regions, systems), and report it to the owners of the order and delivery data with examples. Don’t silently “fix” either column, and note the caveat next to any metric that relies on them.</p>
</details>
<p><b>Coming next, Module 8 batch 2:</b> customer segmentation with RFM (Recency, Frequency, Monetary), a full data-quality audit that gathers every red flag you have found into one report (including the orders dated before signup), and a mock interview to finish the SQL track.</p>`
    }
  ]
}
);
