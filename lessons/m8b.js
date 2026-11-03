LESSONS.push(
{
  id: 'sql-8-4',
  track: 'sql',
  title: '8.4 RFM segmentation: who are your best customers?',
  tables: ['customers', 'orders', 'payments'],
  intro: `The marketing manager walks over with a problem: <i>“We have a budget for one email campaign. Who should get it?”</i><br><br>If you answer “everyone”, you waste money on people who already buy every month <b>and</b> on people who left two years ago. A smarter analyst sorts customers into <b>groups that deserve different treatment</b>: reward the best, win back the ones drifting away, nurture the new ones. The classic method is called <b>RFM</b>, and you can build the whole thing in SQL. By the end you will have turned 1,982 customers into six named segments, and you will know how much money each one brings.`,
  steps: [
    {
      type: 'explain',
      title: 'Three questions about every customer',
      body: `<div class="callout analogy"><b>The big idea:</b> think of the owner of a small coffee shop who knows the regulars. She does not need a spreadsheet to know who matters. She asks herself three things about each person: <b>When did they last come in? How often do they come? How much do they spend?</b> RFM is exactly those three questions, asked of every customer, in SQL.</div>
<table class="mini">
<tr><th>Letter</th><th>Question</th><th>In TradeFlow</th></tr>
<tr><td><b>R</b>ecency</td><td>How long since they last bought?</td><td>Days between their latest order and the end of the data</td></tr>
<tr><td><b>F</b>requency</td><td>How often do they buy?</td><td>Number of orders</td></tr>
<tr><td><b>M</b>onetary</td><td>How much do they spend?</td><td>Total payments on orders that stuck (Completed or Processing)</td></tr>
</table>
<p>Two decisions to make up front, because a careful analyst always writes them down:</p>
<ul>
<li><b>“Today” is fixed at 2026-06-30</b>, the last day in the data. We never use the real current date, otherwise the numbers would change every morning and nobody could reproduce your result.</li>
<li><b>Monetary uses the same definition as the “net” revenue from Lesson 8.1</b>, so the customer totals add up to the company total. We will prove that at the end.</li>
</ul>`
    },
    {
      type: 'try',
      title: 'Step 1: one row per customer with R, F and M',
      body: `<p>We group <code>orders</code> by customer, join <code>payments</code> for the money, and calculate the three raw numbers. Look at customer 1: last order <b>165 days</b> ago, <b>3</b> orders, <b>420,553.01</b> of net spend. Customer 2 last ordered <b>577 days</b> ago. Already you can feel the difference between them.</p>`,
      code: `WITH rfm AS (
    SELECT o.customer_id,
           CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days,
           COUNT(*) AS frequency,
           ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary
    FROM orders o
    JOIN payments p ON p.order_id = o.order_id
    GROUP BY o.customer_id
)
SELECT customer_id, recency_days, frequency, monetary
FROM rfm
ORDER BY customer_id
LIMIT 10;`
    },
    {
      id: 'sql-8-4-c1',
      type: 'check',
      title: 'Why do we hard-code 2026-06-30 instead of using today’s date?',
      body: `<p>Think about what happens when a colleague re-runs your query next month.</p>`,
      options: ['Because SQLite has no way to get today’s date', 'So the result is reproducible, and it matches the last day our data actually covers', 'Because dates in TradeFlow are stored as numbers', 'It makes the query run faster'],
      answer: 1,
      why: [
        'SQLite can do date(\'now\'). The reason is a different one: the data stops on 2026-06-30, and a moving “today” would make every customer look more inactive each day.',
        'Yes! A fixed “as-of” date means the same query gives the same answer tomorrow, next month and in your colleague’s hands. It also stops customers looking artificially “lost” just because time passed.',
        'TradeFlow dates are text in YYYY-MM-DD format, and julianday() turns them into numbers for us.',
        'Speed is not the point. Reproducibility is.'
      ]
    },
    {
      id: 'sql-8-4-ex1',
      type: 'exercise',
      title: 'Your turn: recency for the first five customers',
      body: `<p>Return <code>customer_id</code> and <code>recency_days</code> for customers 1 to 5: the whole days between <code>'2026-06-30'</code> and each customer’s <b>latest</b> <code>order_date</code>. Use <code>julianday()</code>, <code>MAX()</code> and <code>CAST(... AS INTEGER)</code>. Order by <code>customer_id</code> and keep only 5 rows.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Group the orders table by customer_id, then take MAX(order_date) for the latest order. Subtract julianday of that date from julianday('2026-06-30').`,
        `SELECT customer_id, CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days FROM orders GROUP BY customer_id ORDER BY customer_id LIMIT 5;`
      ],
      solution: `SELECT customer_id, CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days FROM orders GROUP BY customer_id ORDER BY customer_id LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Look before you score',
      body: `<p>Never score blindly. First <b>look at the shape</b> of each measure. Recency is easiest to read in bands a manager can picture: bought in the last 3 months, last 6 months, last year, or longer ago.</p>`
    },
    {
      type: 'try',
      title: 'How long since customers last bought?',
      body: `<p>606 customers are active (last order within 90 days), but <b>466 customers, nearly a quarter, have not bought for over a year</b>. That single bar is already a business story.</p>`,
      chart: 'bar',
      chartTitle: 'Customers by recency band',
      code: `WITH r AS (
    SELECT customer_id,
           CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days
    FROM orders
    GROUP BY customer_id
)
SELECT CASE WHEN recency_days <= 90 THEN '1 Active: 0-90 days'
            WHEN recency_days <= 180 THEN '2 Cooling: 91-180 days'
            WHEN recency_days <= 365 THEN '3 Slipping: 181-365 days'
            ELSE '4 Inactive: over 365 days' END AS recency_band,
       COUNT(*) AS customers
FROM r
GROUP BY recency_band
ORDER BY recency_band;`
    },
    {
      id: 'sql-8-4-ex2',
      type: 'exercise',
      title: 'Your turn: the inactive customers',
      body: `<p>How many customers have <b>not ordered for more than 365 days</b>? Return one number called <code>inactive_customers</code>. Tip: build the recency per customer in a CTE or subquery first, then count the ones above 365.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Step 1: recency per customer (GROUP BY customer_id with MAX(order_date)). Step 2: COUNT(*) from that result WHERE recency_days > 365.`,
        `WITH r AS (SELECT customer_id, CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days FROM orders GROUP BY customer_id) SELECT COUNT(*) AS inactive_customers FROM r WHERE recency_days > 365;`
      ],
      solution: `WITH r AS (SELECT customer_id, CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days FROM orders GROUP BY customer_id) SELECT COUNT(*) AS inactive_customers FROM r WHERE recency_days > 365;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Turning raw numbers into scores with NTILE',
      body: `<p>“165 days” and “420,553.01” cannot be compared directly. So we convert each measure into a <b>score from 1 to 4</b> using <code>NTILE(4)</code> (Lesson 6.5): it sorts the customers and cuts them into four equal groups.</p>
<div class="callout watch"><b>The direction trap:</b> for Frequency and Monetary, <b>bigger is better</b>, so we sort ascending and the top group gets 4. But for Recency, <b>smaller is better</b> (fewer days since the last order). So we sort recency <b>descending</b> (<code>ORDER BY recency_days DESC</code>), which puts the most recent customers last, in group 4. In all three scores, <b>4 is good and 1 is bad</b>. Get this wrong and your “best customers” are your worst.</div>
<p>We also add <code>customer_id</code> as a <b>tie-breaker</b> inside every <code>ORDER BY</code>, so two runs never give different answers.</p>`
    },
    {
      type: 'try',
      title: 'Step 2: scores and the RFM code',
      body: `<p>Now each customer has three scores and a short code such as <b>322</b> (R=3, F=2, M=2). The code <code>r || f || m</code> glues the three digits together as text. Customer 9 is <b>344</b>: bought recently, orders often, and spends a lot. Customer 2 is <b>122</b>: gone for ages.</p>`,
      code: `WITH rfm AS (
    SELECT o.customer_id,
           CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days,
           COUNT(*) AS frequency,
           ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary
    FROM orders o
    JOIN payments p ON p.order_id = o.order_id
    GROUP BY o.customer_id
),
scored AS (
    SELECT *,
           NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r,
           NTILE(4) OVER (ORDER BY frequency, customer_id) AS f,
           NTILE(4) OVER (ORDER BY monetary, customer_id) AS m
    FROM rfm
)
SELECT customer_id, recency_days, frequency, monetary, r, f, m, r || f || m AS rfm_code
FROM scored
ORDER BY customer_id
LIMIT 10;`
    },
    {
      type: 'explain',
      title: 'An honest warning: ties',
      body: `<div class="callout watch"><b>NTILE does not respect ties.</b> It cuts the sorted list into four equal-sized groups <b>even when customers have identical values</b>. TradeFlow has 384 customers with exactly 4 orders each. Watch what happens to them:</div>`
    },
    {
      type: 'try',
      title: 'Same number of orders, different scores',
      body: `<p>The F=1 group runs from 1 up to <b>4</b> orders, and the F=2 group starts at <b>4</b> orders too. Customers 3, 4 and 11 (4 orders each) got F=1, while customers 20, 23 and 31 (also 4 orders) got F=2, purely because of their <code>customer_id</code> tie-breaker. That is not fair, and it is a real weakness of NTILE-based RFM.</p>`,
      code: `WITH rfm AS (
    SELECT o.customer_id,
           COUNT(*) AS frequency
    FROM orders o
    GROUP BY o.customer_id
),
scored AS (
    SELECT *, NTILE(4) OVER (ORDER BY frequency, customer_id) AS f
    FROM rfm
)
SELECT f AS f_score,
       COUNT(*) AS customers,
       MIN(frequency) AS fewest_orders,
       MAX(frequency) AS most_orders
FROM scored
GROUP BY f
ORDER BY f;`
    },
    {
      type: 'try',
      title: 'The professional fix: fixed thresholds',
      body: `<p>When a measure has many ties (like order counts), mature teams replace NTILE with <b>fixed business thresholds</b> that anyone can read and defend: here 1-2 orders = 1, 3-4 = 2, 5-6 = 3, 7+ = 4. Now identical customers <b>always</b> get identical scores, and the groups are simply what they are (213, 664, 628 and 477 customers). In this lesson we continue with NTILE because it works for any data, but you now know its limits.</p>`,
      code: `WITH f AS (
    SELECT customer_id, COUNT(*) AS frequency
    FROM orders
    GROUP BY customer_id
)
SELECT CASE WHEN frequency >= 7 THEN 4
            WHEN frequency >= 5 THEN 3
            WHEN frequency >= 3 THEN 2
            ELSE 1 END AS f_score,
       COUNT(*) AS customers
FROM f
GROUP BY f_score
ORDER BY f_score;`
    },
    {
      id: 'sql-8-4-ex3',
      type: 'exercise',
      title: 'Your turn: how are the R scores spread?',
      body: `<p>Build the Recency score <code>r</code> with <code>NTILE(4) OVER (ORDER BY recency_days DESC, customer_id)</code>, then return, for each score: <code>r</code>, <code>customers</code> (how many), <code>newest_days</code> (the smallest recency in that group) and <code>oldest_days</code> (the largest). Order by <code>r</code>. The first CTE is already written for you.</p>`,
      starter: `-- Write your query below\n\nWITH rfm AS (\n    SELECT customer_id,\n           CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days\n    FROM orders\n    GROUP BY customer_id\n)\n-- add a scored CTE, then the final SELECT\nSELECT * FROM rfm LIMIT 5;\n`,
      hints: [
        `Add a second CTE: scored AS (SELECT customer_id, recency_days, NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r FROM rfm). Then SELECT r, COUNT(*), MIN(recency_days), MAX(recency_days) ... GROUP BY r.`,
        `WITH rfm AS (SELECT customer_id, CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days FROM orders GROUP BY customer_id), scored AS (SELECT customer_id, recency_days, NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r FROM rfm) SELECT r, COUNT(*) AS customers, MIN(recency_days) AS newest_days, MAX(recency_days) AS oldest_days FROM scored GROUP BY r ORDER BY r;`
      ],
      solution: `WITH rfm AS (SELECT customer_id, CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days FROM orders GROUP BY customer_id), scored AS (SELECT customer_id, recency_days, NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r FROM rfm) SELECT r, COUNT(*) AS customers, MIN(recency_days) AS newest_days, MAX(recency_days) AS oldest_days FROM scored GROUP BY r ORDER BY r;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'From three scores to six named segments',
      body: `<p>Scores like “344” are for analysts. Managers need <b>names and actions</b>. We turn scores into segments with a <code>CASE WHEN</code> (Lesson 2.7). <b>Order matters</b>: CASE stops at the <b>first</b> rule that matches, so we write the most specific rules first.</p>
<table class="mini">
<tr><th>Segment</th><th>Rule</th><th>Meaning</th></tr>
<tr><td><b>Champions</b></td><td>R≥3 and F≥3 and M≥3</td><td>Recent, frequent, big spenders</td></tr>
<tr><td><b>Loyal</b></td><td>R≥3 and F≥2</td><td>Recent and repeat buyers</td></tr>
<tr><td><b>At risk</b></td><td>R≤2 and F≥3 and M≥3</td><td>Used to be great, now drifting away</td></tr>
<tr><td><b>Lost</b></td><td>R=1 and F≤2</td><td>Long gone and never very engaged</td></tr>
<tr><td><b>New or promising</b></td><td>R≥3 and F=1</td><td>Recent, but still few orders</td></tr>
<tr><td><b>Needs attention</b></td><td>everyone else</td><td>The middle that does not fit above</td></tr>
</table>`
    },
    {
      type: 'try',
      title: 'Step 3: the segment table',
      body: `<p>Here is the whole picture. Read it like a manager:</p>
<ul>
<li><b>Champions</b>: 494 customers (25% of the customer base) bring <b>38.5%</b> of net revenue.</li>
<li><b>At risk</b>: only 271 customers, but they are worth <b>20.0%</b> of revenue (284.5 million). This is the group where a rescue campaign pays for itself.</li>
<li><b>Lost</b>: 360 customers, just <b>10.7%</b> of revenue. Not worth an expensive campaign.</li>
<li><b>New or promising</b>: 143 customers, 3.7% of revenue, but they are the ones you can still shape into loyal buyers.</li>
</ul>`,
      chart: 'bar',
      chartTitle: 'Customers per segment',
      code: `WITH rfm AS (
    SELECT o.customer_id,
           CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days,
           COUNT(*) AS frequency,
           ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary
    FROM orders o
    JOIN payments p ON p.order_id = o.order_id
    GROUP BY o.customer_id
),
scored AS (
    SELECT *,
           NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r,
           NTILE(4) OVER (ORDER BY frequency, customer_id) AS f,
           NTILE(4) OVER (ORDER BY monetary, customer_id) AS m
    FROM rfm
),
segmented AS (
    SELECT *,
           CASE WHEN r >= 3 AND f >= 3 AND m >= 3 THEN 'Champions'
                WHEN r >= 3 AND f >= 2 THEN 'Loyal'
                WHEN r <= 2 AND f >= 3 AND m >= 3 THEN 'At risk'
                WHEN r = 1 AND f <= 2 THEN 'Lost'
                WHEN r >= 3 AND f = 1 THEN 'New or promising'
                ELSE 'Needs attention' END AS segment
    FROM scored
)
SELECT segment,
       COUNT(*) AS customers,
       ROUND(SUM(monetary), 2) AS revenue,
       ROUND(100.0 * SUM(monetary) / (SELECT SUM(monetary) FROM segmented), 1) AS revenue_share_pct
FROM segmented
GROUP BY segment
ORDER BY revenue DESC;`
    },
    {
      id: 'sql-8-4-ex4',
      type: 'exercise',
      title: 'Your turn: count the customers in each segment',
      body: `<p>Return <code>segment</code> and <code>customers</code> (how many), ordered by <code>customers</code> from largest to smallest, then by <code>segment</code> A to Z. The <code>rfm</code> and <code>scored</code> CTEs are already written. <b>You</b> add the <code>segmented</code> CTE with the six-rule CASE from the table above, then the final query.</p>`,
      starter: `-- Write your query below\n\nWITH rfm AS (\n    SELECT o.customer_id,\n           CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days,\n           COUNT(*) AS frequency,\n           ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary\n    FROM orders o\n    JOIN payments p ON p.order_id = o.order_id\n    GROUP BY o.customer_id\n),\nscored AS (\n    SELECT *,\n           NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r,\n           NTILE(4) OVER (ORDER BY frequency, customer_id) AS f,\n           NTILE(4) OVER (ORDER BY monetary, customer_id) AS m\n    FROM rfm\n)\n-- add the segmented CTE here (remember the comma above), then the final SELECT\nSELECT * FROM scored LIMIT 5;\n`,
      hints: [
        `After the scored CTE add a comma, then: segmented AS (SELECT *, CASE WHEN r >= 3 AND f >= 3 AND m >= 3 THEN 'Champions' WHEN ... END AS segment FROM scored). Write the rules in the same order as the table.`,
        `Final query: SELECT segment, COUNT(*) AS customers FROM segmented GROUP BY segment ORDER BY customers DESC, segment;`,
        `WITH rfm AS (SELECT o.customer_id, CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days, COUNT(*) AS frequency, ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary FROM orders o JOIN payments p ON p.order_id = o.order_id GROUP BY o.customer_id), scored AS (SELECT *, NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r, NTILE(4) OVER (ORDER BY frequency, customer_id) AS f, NTILE(4) OVER (ORDER BY monetary, customer_id) AS m FROM rfm), segmented AS (SELECT *, CASE WHEN r >= 3 AND f >= 3 AND m >= 3 THEN 'Champions' WHEN r >= 3 AND f >= 2 THEN 'Loyal' WHEN r <= 2 AND f >= 3 AND m >= 3 THEN 'At risk' WHEN r = 1 AND f <= 2 THEN 'Lost' WHEN r >= 3 AND f = 1 THEN 'New or promising' ELSE 'Needs attention' END AS segment FROM scored) SELECT segment, COUNT(*) AS customers FROM segmented GROUP BY segment ORDER BY customers DESC, segment;`
      ],
      solution: `WITH rfm AS (SELECT o.customer_id, CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days, COUNT(*) AS frequency, ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary FROM orders o JOIN payments p ON p.order_id = o.order_id GROUP BY o.customer_id), scored AS (SELECT *, NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r, NTILE(4) OVER (ORDER BY frequency, customer_id) AS f, NTILE(4) OVER (ORDER BY monetary, customer_id) AS m FROM rfm), segmented AS (SELECT *, CASE WHEN r >= 3 AND f >= 3 AND m >= 3 THEN 'Champions' WHEN r >= 3 AND f >= 2 THEN 'Loyal' WHEN r <= 2 AND f >= 3 AND m >= 3 THEN 'At risk' WHEN r = 1 AND f <= 2 THEN 'Lost' WHEN r >= 3 AND f = 1 THEN 'New or promising' ELSE 'Needs attention' END AS segment FROM scored) SELECT segment, COUNT(*) AS customers FROM segmented GROUP BY segment ORDER BY customers DESC, segment;`,
      ordered: true
    },
    {
      id: 'sql-8-4-c2',
      type: 'check',
      title: 'Budget for one win-back campaign. Which segment gets it first?',
      body: `<p>Remember: Champions 494 customers (38.5% of revenue), At risk 271 (20.0%), Lost 360 (10.7%), New or promising 143 (3.7%).</p>`,
      options: ['Champions, they are worth the most', 'At risk: they used to buy often and spend a lot, they are still reachable, and losing them costs real money', 'Lost, because they are the biggest group of unhappy customers', 'New or promising, because they are the newest'],
      answer: 1,
      why: [
        'Champions are already buying. A win-back campaign is wasted on people who never left; they deserve rewards and thanks instead.',
        'Yes! “At risk” combines high past value with falling recency. A good message now can save revenue that is about to disappear. Lost customers cost more to reactivate and bring less.',
        'Lost customers are numerous, but they brought little and left long ago. Win-back budget goes much further on At risk.',
        'New customers need a different treatment (onboarding and a nudge to the second order), not a win-back message.'
      ]
    },
    {
      id: 'sql-8-4-ex5',
      type: 'exercise',
      title: 'Challenge: how much do the Champions bring?',
      body: `<p>Return one row with <code>champions</code> (how many customers are Champions) and <code>revenue_share_pct</code> (their share of the <b>total</b> monetary value of all customers, as a percentage rounded to 1 decimal). The three CTEs are written for you, so you only need the final query. Tip: the total can come from a scalar subquery like <code>(SELECT SUM(monetary) FROM segmented)</code>.</p>`,
      starter: `-- Write your query below\n\nWITH rfm AS (\n    SELECT o.customer_id,\n           CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days,\n           COUNT(*) AS frequency,\n           ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary\n    FROM orders o\n    JOIN payments p ON p.order_id = o.order_id\n    GROUP BY o.customer_id\n),\nscored AS (\n    SELECT *,\n           NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r,\n           NTILE(4) OVER (ORDER BY frequency, customer_id) AS f,\n           NTILE(4) OVER (ORDER BY monetary, customer_id) AS m\n    FROM rfm\n),\nsegmented AS (\n    SELECT *,\n           CASE WHEN r >= 3 AND f >= 3 AND m >= 3 THEN 'Champions'\n                WHEN r >= 3 AND f >= 2 THEN 'Loyal'\n                WHEN r <= 2 AND f >= 3 AND m >= 3 THEN 'At risk'\n                WHEN r = 1 AND f <= 2 THEN 'Lost'\n                WHEN r >= 3 AND f = 1 THEN 'New or promising'\n                ELSE 'Needs attention' END AS segment\n    FROM scored\n)\n-- write your final SELECT here\nSELECT * FROM segmented LIMIT 5;\n`,
      hints: [
        `Filter to the Champions with WHERE segment = 'Champions'. COUNT(*) gives the customers; SUM(monetary) gives their money.`,
        `Divide by the grand total: 100.0 * SUM(monetary) / (SELECT SUM(monetary) FROM segmented), wrapped in ROUND(..., 1).`,
        `WITH rfm AS (SELECT o.customer_id, CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days, COUNT(*) AS frequency, ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary FROM orders o JOIN payments p ON p.order_id = o.order_id GROUP BY o.customer_id), scored AS (SELECT *, NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r, NTILE(4) OVER (ORDER BY frequency, customer_id) AS f, NTILE(4) OVER (ORDER BY monetary, customer_id) AS m FROM rfm), segmented AS (SELECT *, CASE WHEN r >= 3 AND f >= 3 AND m >= 3 THEN 'Champions' WHEN r >= 3 AND f >= 2 THEN 'Loyal' WHEN r <= 2 AND f >= 3 AND m >= 3 THEN 'At risk' WHEN r = 1 AND f <= 2 THEN 'Lost' WHEN r >= 3 AND f = 1 THEN 'New or promising' ELSE 'Needs attention' END AS segment FROM scored) SELECT COUNT(*) AS champions, ROUND(100.0 * SUM(monetary) / (SELECT SUM(monetary) FROM segmented), 1) AS revenue_share_pct FROM segmented WHERE segment = 'Champions';`
      ],
      solution: `WITH rfm AS (SELECT o.customer_id, CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days, COUNT(*) AS frequency, ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary FROM orders o JOIN payments p ON p.order_id = o.order_id GROUP BY o.customer_id), scored AS (SELECT *, NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r, NTILE(4) OVER (ORDER BY frequency, customer_id) AS f, NTILE(4) OVER (ORDER BY monetary, customer_id) AS m FROM rfm), segmented AS (SELECT *, CASE WHEN r >= 3 AND f >= 3 AND m >= 3 THEN 'Champions' WHEN r >= 3 AND f >= 2 THEN 'Loyal' WHEN r <= 2 AND f >= 3 AND m >= 3 THEN 'At risk' WHEN r = 1 AND f <= 2 THEN 'Lost' WHEN r >= 3 AND f = 1 THEN 'New or promising' ELSE 'Needs attention' END AS segment FROM scored) SELECT COUNT(*) AS champions, ROUND(100.0 * SUM(monetary) / (SELECT SUM(monetary) FROM segmented), 1) AS revenue_share_pct FROM segmented WHERE segment = 'Champions';`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Does it add up? Caveats, and what you can do now',
      body: `<div class="callout work"><b>The reconciliation habit:</b> the monetary values of all 1,982 customers add up to <b>1,419,860,053.32</b>, exactly the net revenue from Lesson 8.1. Whenever you build a breakdown, check that the pieces add back to a number the business already trusts. The 18 customers who never ordered are not in RFM at all (they have no recency); “never bought” is a separate marketing question.</div>
<div class="callout watch"><b>Be honest about the limits:</b> RFM scores are <b>relative</b> (a Champion is “top quarter compared with this customer base”), the cut-offs are a judgement call, and ties can shift people between groups. Present segments as a <b>starting point for action and testing</b>, not as a law of nature.</div>
<p>In this lesson you learned to:</p>
<ul>
<li>Calculate <b>Recency, Frequency and Monetary</b> per customer from orders and payments, with a fixed as-of date</li>
<li>Score with <code>NTILE(4)</code>, keep every score pointing the same way, and add tie-breakers</li>
<li>Spot the <b>tie problem</b> and know the fixed-threshold alternative</li>
<li>Turn scores into <b>named segments</b> with CASE WHEN, and measure each segment’s size and revenue share</li>
<li>Reconcile a breakdown back to a known company total</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is RFM analysis, and what is it used for?</li>
<li>Why is the Recency score sorted in the opposite direction to the other two?</li>
<li>What is a weakness of using NTILE to score customers, and how can you reduce it?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> RFM scores every customer on how recently they bought, how often, and how much they spend, then groups them into segments (such as Champions or At risk) so marketing and sales can treat each group differently and target budgets where they pay back.</p>
<p><b>2.</b> Because for recency a <i>smaller</i> number of days is better, while for frequency and monetary a <i>bigger</i> number is better. Sorting recency descending makes “4” mean best for all three scores.</p>
<p><b>3.</b> NTILE forces equal-sized groups even when many customers share the same value, so identical customers can land in different groups. Reduce it with deterministic tie-breakers, or better, use fixed business thresholds that are easy to explain and always give identical customers identical scores.</p>
</details>
<p><b>Coming next:</b> the <b>data-quality audit</b>. Along the way you kept meeting red flags in TradeFlow: orders dated before the customer signed up, payments on cancelled orders, completed orders that never arrived. Next you gather them all into one clean audit report.</p>`
    }
  ]
},
{
  id: 'sql-8-5',
  track: 'sql',
  title: '8.5 The data-quality audit: can we trust this data?',
  tables: ['customers', 'regions', 'employees', 'orders', 'order_items', 'payments', 'deliveries'],
  intro: `Your first week at a new company. The finance director asks: <i>“Before we build any dashboards, can we trust this database?”</i><br><br>A beginner says “yes, it looks fine”. A professional says “<b>let me test it and show you</b>”. Throughout this course you have bumped into strange things in TradeFlow: orders dated before the customer even signed up, money collected on cancelled orders, completed orders that never arrived. In this lesson you stop collecting them by accident and do what real teams do: run a <b>structured audit</b> and finish with <b>one table</b> that lists every red flag, how many rows it touches and how serious it is.`,
  steps: [
    {
      type: 'explain',
      title: 'A checklist, like a building inspector',
      body: `<div class="callout analogy"><b>The big idea:</b> before people move into a new building, an inspector walks through with a checklist: wiring, plumbing, doors, fire exits. She does not guess; she tests each item and writes down what failed. A data audit is the same walk-through, with a checklist of <b>six kinds of problems</b>.</div>
<table class="mini">
<tr><th>Check</th><th>The question</th><th>TradeFlow example</th></tr>
<tr><td><b>Completeness</b></td><td>Is anything missing?</td><td>58 customers have no email</td></tr>
<tr><td><b>Uniqueness</b></td><td>Are rows repeated?</td><td>147 repeated (order, product) lines</td></tr>
<tr><td><b>Validity</b></td><td>Are values in the right format and range?</td><td>50 emails in capital letters, names with titles</td></tr>
<tr><td><b>Consistency</b></td><td>Do different tables agree?</td><td>460 Cancelled orders marked Paid</td></tr>
<tr><td><b>Timeliness / logic</b></td><td>Do dates happen in a possible order?</td><td>5,037 orders dated before the customer signed up</td></tr>
<tr><td><b>Plausibility</b></td><td>Do the numbers make business sense?</td><td>Payments exactly match their order lines</td></tr>
</table>
<p>For every check we write a small query that <b>counts the rows that break the rule</b>. Zero means it passed. Let’s walk through them one at a time, then combine them all.</p>`
    },
    {
      type: 'try',
      title: 'Completeness: what is missing?',
      body: `<p>Counting NULLs column by column. Only <b>customers.email</b> (58) has gaps among the main columns. The 1,239 missing delivery dates look scary, but the last row proves they are <b>expected</b>: every one belongs to a delivery that is still In Transit or Failed, so no arrival date exists yet. A professional separates <b>real gaps</b> from <b>gaps that make sense</b>.</p>`,
      code: `SELECT 'customers.email' AS column_checked, COUNT(*) AS missing_values
FROM customers WHERE email IS NULL
UNION ALL
SELECT 'customers.signup_date', COUNT(*) FROM customers WHERE signup_date IS NULL
UNION ALL
SELECT 'orders.order_date', COUNT(*) FROM orders WHERE order_date IS NULL
UNION ALL
SELECT 'payments.amount', COUNT(*) FROM payments WHERE amount IS NULL
UNION ALL
SELECT 'deliveries.delivery_date (all missing)', COUNT(*) FROM deliveries WHERE delivery_date IS NULL
UNION ALL
SELECT 'deliveries.delivery_date (In Transit or Failed, expected)', COUNT(*) FROM deliveries
WHERE delivery_date IS NULL AND delivery_status IN ('In Transit', 'Failed');`
    },
    {
      id: 'sql-8-5-c1',
      type: 'check',
      title: '58 of 2,000 customers have no email. How serious is it?',
      body: `<p>That is 2.9% of customers. Emails are used for marketing, not for billing or deliveries here.</p>`,
      options: ['Critical: stop all reporting until every email is filled in', 'Low severity: report it, note it affects email campaigns only, and carry on', 'Delete those 58 customers from the database', 'Fill the gaps with a made-up address like unknown@mail.com'],
      answer: 1,
      why: [
        'Severity depends on the damage. A missing optional contact field does not block revenue reporting.',
        'Yes! Severity = how much damage the problem does to the decisions being made. Missing email blocks only email campaigns, so: log it, quantify it, move on.',
        'Deleting customers destroys real orders and revenue history. Never remove data to make a problem disappear.',
        'Fake values are worse than blanks: they look real, and someone will eventually email them or count them as valid.'
      ]
    },
    {
      id: 'sql-8-5-ex1',
      type: 'exercise',
      title: 'Your turn: orders dated before the customer signed up',
      body: `<p>Join <code>orders</code> to <code>customers</code> and count the orders whose <code>order_date</code> is <b>earlier</b> than the customer’s <code>signup_date</code>. Return one number called <code>orders_before_signup</code>. (Dates are YYYY-MM-DD text, so comparing them with <code>&lt;</code> works correctly.)</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `JOIN customers c ON c.customer_id = o.customer_id, then WHERE o.order_date < c.signup_date, and COUNT(*).`,
        `SELECT COUNT(*) AS orders_before_signup FROM orders o JOIN customers c ON c.customer_id = o.customer_id WHERE o.order_date < c.signup_date;`
      ],
      solution: `SELECT COUNT(*) AS orders_before_signup FROM orders o JOIN customers c ON c.customer_id = o.customer_id WHERE o.order_date < c.signup_date;`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Timeline logic: two rules, two failures',
      body: `<p>That count is <b>5,037, about half of all orders</b>. The worst gap is order 1042: placed on 2023-01-06 by a customer who “signed up” on 2026-06-01, <b>1,242 days later</b>. Below, the same rule next to a second timeline rule: orders handled by employees <b>before they were hired</b> (4,927 orders, 49.3%).</p>`,
      code: `SELECT 'Orders dated before customer signup' AS check_name,
       COUNT(*) AS failing_rows,
       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM orders), 1) AS pct_of_orders
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.order_date < c.signup_date
UNION ALL
SELECT 'Orders handled before the employee was hired',
       COUNT(*),
       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM orders), 1)
FROM orders o
JOIN employees e ON e.employee_id = o.employee_id
WHERE o.order_date < e.hire_date;`
    },
    {
      id: 'sql-8-5-c2',
      type: 'check',
      title: 'Half of all orders break the signup rule. What is the best response?',
      body: `<p>5,037 orders (50.4%) are dated before the customer’s signup date, by up to 1,242 days.</p>`,
      options: ['Delete the 5,037 orders because they are obviously wrong', 'Change each signup_date to match the first order date and move on', 'Report it with the numbers and examples, and ask the data owners what signup_date really means before touching anything', 'Ignore it, because it does not affect revenue'],
      answer: 2,
      why: [
        'Deleting half the orders would wreck revenue, cohorts and everything else, based on a guess.',
        'Silently rewriting a column is how analysts create numbers nobody can trace. Maybe signup_date means something else (a loyalty-programme registration, a migrated record), and only the owners know.',
        'Yes! When <b>half</b> the rows fail a rule, the problem is usually the <b>rule or the meaning of the field</b>, not 5,000 separate mistakes. Quantify, show examples, ask the owners, and note the caveat next to any metric that uses signup_date (like our cohorts in Lesson 8.2).',
        'It may not change today’s revenue, but it affects cohort and customer-age analysis, and it signals a process problem in how the data is recorded.'
      ]
    },
    {
      type: 'explain',
      title: 'Consistency: do the tables agree with each other?',
      body: `<p>This is where audits earn their salary. Each table can look fine on its own while contradicting its neighbours. The pattern is always the same: <b>join two tables, then test for a combination that should be impossible</b>. For example: an order that is <b>Cancelled</b> should not have a payment whose status is <b>Paid</b> (unless a refund was forgotten).</p>`
    },
    {
      type: 'try',
      title: 'Money collected on orders that did not stick',
      body: `<p>Two groups of contradictions: <b>460</b> Cancelled orders and <b>437</b> Returned orders have a payment marked <b>Paid</b>. Together that is <b>897 payments and about 141.5 million</b>. Either refunds were not recorded, or the status columns are updated by different systems at different times. We cannot know from the data alone, which is exactly why we <b>report</b> instead of fixing.</p>`,
      code: `SELECT o.order_status,
       COUNT(*) AS paid_payments,
       ROUND(SUM(p.amount), 2) AS money_involved
FROM payments p
JOIN orders o ON o.order_id = p.order_id
WHERE p.payment_status = 'Paid'
  AND o.order_status IN ('Cancelled', 'Returned')
GROUP BY o.order_status
ORDER BY paid_payments DESC;`
    },
    {
      id: 'sql-8-5-ex2',
      type: 'exercise',
      title: 'Your turn: Paid on Cancelled',
      body: `<p>Count the payments whose <code>payment_status</code> is <b>Paid</b> but whose order has <code>order_status</code> <b>Cancelled</b>. Return one number called <code>paid_on_cancelled</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join payments p to orders o on order_id, filter both statuses in the WHERE clause, then COUNT(*).`,
        `SELECT COUNT(*) AS paid_on_cancelled FROM payments p JOIN orders o ON o.order_id = p.order_id WHERE p.payment_status = 'Paid' AND o.order_status = 'Cancelled';`
      ],
      solution: `SELECT COUNT(*) AS paid_on_cancelled FROM payments p JOIN orders o ON o.order_id = p.order_id WHERE p.payment_status = 'Paid' AND o.order_status = 'Cancelled';`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Validity: right format, right value?',
      body: `<p>Validity checks ask whether a value <b>looks the way it should</b>. In TradeFlow, two things stand out in the customers table: <b>emails in capital letters</b> and <b>names that carry titles or suffixes</b> (such as “Dr.” or “PhD”). They are not “wrong”, but they break matching, grouping and sorting, as you saw in Module 2.</p>
<div class="callout watch"><b>A NULL subtlety:</b> the test <code>email &lt;&gt; LOWER(email)</code> never counts the 58 missing emails, because comparing NULL with anything gives “unknown”, not true. That is exactly what we want here: missing emails are already counted under <b>Completeness</b>, so each problem is counted <b>once</b>.</div>`
    },
    {
      type: 'try',
      title: 'Spot the inconsistent formats',
      body: `<p>Customer 27 is stored as <b>EUGENE.WALTON941@GMAIL.COM</b> while most emails are lowercase. A plain <code>WHERE email = 'eugene.walton941@gmail.com'</code> would miss it. Count: <b>50</b> such emails.</p>`,
      code: `SELECT customer_id, customer_name, email
FROM customers
WHERE email <> LOWER(email)
ORDER BY customer_id
LIMIT 5;`
    },
    {
      id: 'sql-8-5-ex3',
      type: 'exercise',
      title: 'Your turn: how many emails are capitalised?',
      body: `<p>Return one number called <code>capitalised_emails</code>: the customers whose <code>email</code> is not equal to <code>LOWER(email)</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `WHERE email <> LOWER(email), then COUNT(*). NULL emails drop out automatically.`,
        `SELECT COUNT(*) AS capitalised_emails FROM customers WHERE email <> LOWER(email);`
      ],
      solution: `SELECT COUNT(*) AS capitalised_emails FROM customers WHERE email <> LOWER(email);`,
      ordered: true
    },
    {
      id: 'sql-8-5-ex4',
      type: 'exercise',
      title: 'Your turn: names that start with a title',
      body: `<p>Some customer names begin with a title: <b>Dr.</b>, <b>Mr.</b>, <b>Mrs.</b>, <b>Ms.</b> or <b>Miss</b> (followed by a space). Count them with <code>LIKE</code> and <code>OR</code>. Return one number called <code>names_with_titles</code>. For example, “Dr. Steven Martin” and “Miss Debra Williams PhD” both count.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Use LIKE 'Dr.%' for names starting with Dr. and join the other four patterns with OR. For Miss use 'Miss %' (with the space).`,
        `SELECT COUNT(*) AS names_with_titles FROM customers WHERE customer_name LIKE 'Dr.%' OR customer_name LIKE 'Mr.%' OR customer_name LIKE 'Mrs.%' OR customer_name LIKE 'Ms.%' OR customer_name LIKE 'Miss %';`
      ],
      solution: `SELECT COUNT(*) AS names_with_titles FROM customers WHERE customer_name LIKE 'Dr.%' OR customer_name LIKE 'Mr.%' OR customer_name LIKE 'Mrs.%' OR customer_name LIKE 'Ms.%' OR customer_name LIKE 'Miss %';`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The audit table: one query, every check',
      body: `<p>Now the professional move. Instead of twenty separate queries, stack them with <code>UNION ALL</code> (Lesson 3.5) into <b>one table</b> with three columns:</p>
<ul>
<li><b>check_name</b>: what rule was tested, in plain words</li>
<li><b>failing_rows</b>: how many rows broke the rule (0 means it passed)</li>
<li><b>severity</b>: High, Medium or Low, a <b>judgement</b> based on how much the problem can distort decisions (anything touching <b>money</b> is High)</li>
</ul>
<p>Sort by <code>failing_rows</code> so the biggest problems come first, and <b>keep the zeros</b>. A passed check is good news you want to show: “we tested 8 more things and they are clean” is part of the report.</p>`
    },
    {
      type: 'try',
      title: 'The full TradeFlow data-quality audit',
      body: `<p>Twenty checks in one result. Press <b>Chart it</b> to see where the trouble concentrates. Read it like an auditor:</p>
<ul>
<li><b>Timeline problems</b> (signup, hire dates) are the largest by count, but they hinge on what the fields <i>mean</i>.</li>
<li><b>High severity</b> items touch money or deliveries: Completed orders not fully paid (<b>1,176</b>), Completed orders not delivered (<b>994</b>), Paid on Cancelled (<b>460</b>) and Paid on Returned (<b>437</b>).</li>
<li><b>Low severity</b> items are cosmetic: formats, titles, missing emails.</li>
<li>The <b>zero rows at the bottom are wins</b>: no orphans, every order has a payment, and every payment matches its order lines to the cent.</li>
</ul>`,
      chart: 'bar',
      chartTitle: 'Failing rows per check',
      code: `SELECT 'Orders dated before customer signup' AS check_name, COUNT(*) AS failing_rows, 'Medium' AS severity
FROM orders o JOIN customers c ON c.customer_id = o.customer_id
WHERE o.order_date < c.signup_date
UNION ALL
SELECT 'Orders handled before employee hired', COUNT(*), 'Medium'
FROM orders o JOIN employees e ON e.employee_id = o.employee_id
WHERE o.order_date < e.hire_date
UNION ALL
SELECT 'Completed orders not fully paid', COUNT(*), 'High'
FROM orders o JOIN payments p ON p.order_id = o.order_id
WHERE o.order_status = 'Completed' AND p.payment_status <> 'Paid'
UNION ALL
SELECT 'Completed orders not delivered', COUNT(*), 'High'
FROM orders o JOIN deliveries d ON d.order_id = o.order_id
WHERE o.order_status = 'Completed' AND d.delivery_status IN ('In Transit', 'Failed')
UNION ALL
SELECT 'Paid on Cancelled orders', COUNT(*), 'High'
FROM payments p JOIN orders o ON o.order_id = p.order_id
WHERE p.payment_status = 'Paid' AND o.order_status = 'Cancelled'
UNION ALL
SELECT 'Paid on Returned orders', COUNT(*), 'High'
FROM payments p JOIN orders o ON o.order_id = p.order_id
WHERE p.payment_status = 'Paid' AND o.order_status = 'Returned'
UNION ALL
SELECT 'Cancelled orders marked Delivered', COUNT(*), 'Medium'
FROM orders o JOIN deliveries d ON d.order_id = o.order_id
WHERE o.order_status = 'Cancelled' AND d.delivery_status = 'Delivered'
UNION ALL
SELECT 'Repeated order lines (same order and product)', COUNT(*), 'Medium'
FROM (SELECT order_id, product_id FROM order_items GROUP BY order_id, product_id HAVING COUNT(*) > 1)
UNION ALL
SELECT 'Customers with no email', COUNT(*), 'Low' FROM customers WHERE email IS NULL
UNION ALL
SELECT 'Capitalised emails', COUNT(*), 'Low' FROM customers WHERE email <> LOWER(email)
UNION ALL
SELECT 'Names starting with a title', COUNT(*), 'Low'
FROM customers
WHERE customer_name LIKE 'Dr.%' OR customer_name LIKE 'Mr.%' OR customer_name LIKE 'Mrs.%'
   OR customer_name LIKE 'Ms.%' OR customer_name LIKE 'Miss %'
UNION ALL
SELECT 'Names ending with a suffix', COUNT(*), 'Low'
FROM customers
WHERE customer_name LIKE '% MD' OR customer_name LIKE '% PhD' OR customer_name LIKE '% DDS'
   OR customer_name LIKE '% DVM' OR customer_name LIKE '% Jr.' OR customer_name LIKE '% II'
   OR customer_name LIKE '% III' OR customer_name LIKE '% IV'
UNION ALL
SELECT 'Orders without a payment', COUNT(*), 'High'
FROM orders o LEFT JOIN payments p ON p.order_id = o.order_id
WHERE p.order_id IS NULL
UNION ALL
SELECT 'Order lines pointing to a missing order', COUNT(*), 'High'
FROM order_items i LEFT JOIN orders o ON o.order_id = i.order_id
WHERE o.order_id IS NULL
UNION ALL
SELECT 'Payments that differ from their order lines', COUNT(*), 'High'
FROM payments p
JOIN (SELECT order_id, SUM(quantity * unit_price) AS line_total FROM order_items GROUP BY order_id) i
  ON i.order_id = p.order_id
WHERE ABS(p.amount - i.line_total) > 0.01
UNION ALL
SELECT 'Payments with zero or negative amount', COUNT(*), 'High' FROM payments WHERE amount <= 0
UNION ALL
SELECT 'Payments dated before their order', COUNT(*), 'Medium'
FROM payments p JOIN orders o ON o.order_id = p.order_id
WHERE p.payment_date < o.order_date
UNION ALL
SELECT 'Dispatches dated before their order', COUNT(*), 'Medium'
FROM deliveries d JOIN orders o ON o.order_id = d.order_id
WHERE d.dispatch_date < o.order_date
UNION ALL
SELECT 'Deliveries arriving before dispatch', COUNT(*), 'Medium'
FROM deliveries WHERE delivery_date < dispatch_date
UNION ALL
SELECT 'Customers whose region is in another country', COUNT(*), 'Medium'
FROM customers c JOIN regions r ON r.region_id = c.region_id
WHERE r.country <> c.country
ORDER BY failing_rows DESC, check_name;`
    },
    {
      id: 'sql-8-5-c3',
      type: 'check',
      title: 'The audit flags 147 repeated order lines. Should you delete them?',
      body: `<p>You learned in Lesson 6.2 what happens when those lines are removed.</p>`,
      options: ['Yes, duplicates are always errors', 'No: they look like repeats but they are real purchases. Removing them loses 8,989,289.32 of sales and breaks the payment totals, so flag them for investigation and leave them in', 'Yes, but only the 28 that are exact copies', 'No, but only because the rule says never to delete anything'],
      answer: 1,
      why: [
        'Not always. A repeated (order, product) pair can be a customer buying the same item on a second line. Here the payments only reconcile if the repeated lines <b>stay</b>.',
        'Yes! The test that decides is <b>reconciliation</b>: with all 25,000 lines kept, payments match the order lines in 10,000 of 10,000 orders. Drop the repeats and 146 orders stop matching. An audit flag is a question, not a verdict.',
        'Even the exact copies could be genuine (same item, same quantity, bought twice in one basket). Without evidence from the data owners, nothing should be deleted.',
        'The real reason is evidence, not a slogan: the numbers prove the lines are genuine.'
      ]
    },
    {
      id: 'sql-8-5-ex5',
      type: 'exercise',
      title: 'Challenge: build a four-check mini audit',
      body: `<p>Return a table with columns <code>check_name</code> and <code>failing_rows</code> and exactly these four rows, <b>sorted by failing_rows from largest to smallest</b>. Use these exact names:</p>
<ul>
<li><code>Orders before signup</code>: orders dated before the customer’s signup date</li>
<li><code>Capitalised emails</code>: emails not equal to their lowercase version</li>
<li><code>Paid on cancelled orders</code>: Paid payments on Cancelled orders</li>
<li><code>Completed but undelivered</code>: Completed orders whose delivery status is In Transit or Failed</li>
</ul>
<p>Stack four SELECTs with <code>UNION ALL</code>, then put one <code>ORDER BY failing_rows DESC</code> at the very end.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Each SELECT looks like: SELECT 'Name here' AS check_name, COUNT(*) AS failing_rows FROM ... WHERE ... Put UNION ALL between them. The first SELECT sets the column names.`,
        `The 4th check needs orders JOIN deliveries ON order_id with WHERE o.order_status = 'Completed' AND d.delivery_status IN ('In Transit', 'Failed'). The expected counts are 5037, 994, 460 and 50.`,
        `SELECT 'Orders before signup' AS check_name, COUNT(*) AS failing_rows FROM orders o JOIN customers c ON c.customer_id = o.customer_id WHERE o.order_date < c.signup_date UNION ALL SELECT 'Capitalised emails', COUNT(*) FROM customers WHERE email <> LOWER(email) UNION ALL SELECT 'Paid on cancelled orders', COUNT(*) FROM payments p JOIN orders o ON o.order_id = p.order_id WHERE p.payment_status = 'Paid' AND o.order_status = 'Cancelled' UNION ALL SELECT 'Completed but undelivered', COUNT(*) FROM orders o JOIN deliveries d ON d.order_id = o.order_id WHERE o.order_status = 'Completed' AND d.delivery_status IN ('In Transit', 'Failed') ORDER BY failing_rows DESC;`
      ],
      solution: `SELECT 'Orders before signup' AS check_name, COUNT(*) AS failing_rows FROM orders o JOIN customers c ON c.customer_id = o.customer_id WHERE o.order_date < c.signup_date UNION ALL SELECT 'Capitalised emails', COUNT(*) FROM customers WHERE email <> LOWER(email) UNION ALL SELECT 'Paid on cancelled orders', COUNT(*) FROM payments p JOIN orders o ON o.order_id = p.order_id WHERE p.payment_status = 'Paid' AND o.order_status = 'Cancelled' UNION ALL SELECT 'Completed but undelivered', COUNT(*) FROM orders o JOIN deliveries d ON d.order_id = o.order_id WHERE o.order_status = 'Completed' AND d.delivery_status IN ('In Transit', 'Failed') ORDER BY failing_rows DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Reporting findings, and what you can do now',
      body: `<div class="callout work"><b>How to write up a finding:</b> one short block per issue, in this order: <b>what</b> (“460 Cancelled orders carry a Paid payment”), <b>evidence</b> (the query and three example order ids), <b>impact</b> (73.1 million of cash that may be refundable), <b>suggested action</b> and <b>owner</b> (finance, to confirm refunds). Facts first, opinions last. <b>Never silently fix data</b>: tell the people who own it, and record which version of the data your numbers came from.</div>
<div class="callout work"><b>At work:</b> teams turn these checks into <b>automated tests</b> that run every day. Tools such as <b>dbt tests</b> and <b>Great Expectations</b> do exactly what you just did (not null, unique, relationships between tables, accepted values), and alert someone when a count goes above zero. Your audit table is the idea behind them, written by hand.</div>
<p>In this lesson you learned to:</p>
<ul>
<li>Audit data with six kinds of checks: completeness, uniqueness, validity, consistency, timeline logic and plausibility</li>
<li>Separate <b>expected</b> gaps from <b>real</b> problems, and rate severity by the damage to decisions</li>
<li>Test consistency across tables with joins, and count each problem only once</li>
<li>Stack every check into <b>one audit table</b> with <code>UNION ALL</code> and keep the zeros</li>
<li>Report findings with numbers and examples, and ask owners instead of silently “fixing”</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>You receive a new dataset. How do you check its quality before analysing it?</li>
<li>About half the orders are dated before the customer’s signup date. What do you do?</li>
<li>When is a duplicate row an error, and when is it not?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Profile it first (row counts, ranges, distinct values), then test completeness, uniqueness, validity, cross-table consistency, date logic and plausibility with counting queries, reconcile totals against a trusted number, and report the findings with severity before building anything on top.</p>
<p><b>2.</b> Quantify it (count, percentage, worst examples), check which fields and systems are involved, and ask the data owners what the field means. When half the rows fail, the rule or the field definition is usually the issue, so I would not delete or rewrite data, and I would add a caveat to any metric that depends on it.</p>
<p><b>3.</b> A duplicate is an error when the same real-world event was recorded twice (for example the same transaction loaded twice). It is not an error when the data legitimately contains repeated lines, such as buying the same product on two lines. The decider is evidence, like whether totals reconcile with and without the repeats.</p>
</details>
<p><b>Coming next, the final lesson of the SQL track:</b> a <b>mock interview</b>. Five classic SQL interview problems on real TradeFlow data (second-highest value, the median, top product per category, streaks and more), a method for solving any problem under pressure, and a cheat sheet to keep.</p>`
    }
  ]
}
);
