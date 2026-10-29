LESSONS.push(
{
  id: 'sql-6-4',
  track: 'sql',
  title: '6.4 Running totals and moving averages',
  tables: ['orders', 'payments'],
  intro: `The CEO asks two questions that need a <b>memory</b>: <i>“How many orders have we had so far this year?”</i> and <i>“The monthly chart jumps around too much. Can you smooth it so I can see the real trend?”</i><br><br>The first needs a <b>running total</b>: each row adds to everything that came before. The second needs a <b>moving average</b>: each row averages itself with its few nearest neighbours. Both are window functions with a clever extra: you choose <b>how wide the window is</b>.`,
  steps: [
    {
      type: 'explain',
      title: 'The odometer and the sliding window',
      body: `<div class="callout analogy"><b>The big idea:</b> a <b>running total</b> is a car’s <i>odometer</i>: it never resets, every day adds to the number that was already there. A <b>moving average</b> is a <i>sliding window</i> on a train: as the train moves, you always see the last three stations, then the next three, and so on.</div>
<p>For a running total you add <code>ORDER BY</code> inside <code>OVER</code>:</p>
<p><code>SUM(orders) OVER (ORDER BY month)</code></p>
<p>Without PARTITION BY, the total runs through the whole table. With <code>PARTITION BY year</code>, it <b>starts again</b> at the beginning of each year, which gives a <b>year-to-date</b> total.</p>`
    },
    {
      type: 'try',
      title: 'Orders so far in 2025',
      body: `<p>Each month’s <code>running_total</code> is that month plus <b>all the months before it</b>. January is 264, then 264 + 232 = <b>496</b>, then 496 + 252 = <b>748</b>, and so on up to <b>2,879</b>, the number of orders in 2025. The last running total always equals the grand total, a free tie-out. The line chart shows a nearly straight climb: steady business.</p>`,
      chart: 'line',
      chartTitle: 'Running total of orders, 2025',
      code: `WITH monthly AS (
    SELECT strftime('%Y-%m', order_date) AS month,
           COUNT(*) AS orders
    FROM orders
    WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01'
    GROUP BY month
)
SELECT month,
       SUM(orders) OVER (ORDER BY month) AS running_total,
       orders
FROM monthly
ORDER BY month;`
    },
    {
      id: 'sql-6-4-ex1',
      type: 'exercise',
      title: 'Your turn: the running total',
      body: `<p>Using a CTE <code>monthly</code> (orders per month in <b>2025</b>), show <code>month</code>, <code>orders</code> and the running total of orders as <code>running_total</code>, in month order.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `SUM(orders) OVER (ORDER BY month) AS running_total.`,
        `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01' GROUP BY month) SELECT month, orders, SUM(orders) OVER (ORDER BY month) AS running_total FROM monthly ORDER BY month;`
      ],
      solution: `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01' GROUP BY month) SELECT month, orders, SUM(orders) OVER (ORDER BY month) AS running_total FROM monthly ORDER BY month;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A hidden trap: ties in the running total',
      body: `<p>When you write <code>ORDER BY</code> inside <code>OVER</code> and say nothing else, SQL uses a <b>default frame</b>: “from the first row up to the current row <b>and all rows tied with it</b>.” So if several rows share the same ORDER BY value, <b>they all get the same running number</b>, as if they happened at the same instant.</p>
<p>To make a running count that goes row by row, you must say so explicitly with a <b>frame</b>: <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>, and add a unique tie-breaker to the ORDER BY.</p>`
    },
    {
      type: 'try',
      title: 'Seven orders on the same day',
      body: `<p>On 2023-01-01 there were <b>seven</b> orders. Look at the two columns:</p>
<ul>
<li><code>default_frame</code>: <b>7, 7, 7, 7, 7, 7, 7</b>. Every order that day reports 7, because they are “tied”.</li>
<li><code>rows_frame</code>: <b>1, 2, 3, 4, 5, 6, 7</b>. A true row-by-row count.</li>
</ul>
<p>If you built a running total on a column with ties and didn’t know this, your numbers would jump in blocks, with no error.</p>`,
      code: `SELECT order_id,
       order_date,
       COUNT(*) OVER (ORDER BY order_date) AS default_frame,
       COUNT(*) OVER (ORDER BY order_date, order_id
                      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS rows_frame
FROM orders
ORDER BY order_date, order_id
LIMIT 8;`
    },
    {
      id: 'sql-6-4-c1',
      type: 'check',
      title: 'Why does the default running COUNT show 7 for all seven orders placed on the same day?',
      body: `<p>Think about the default frame and tied rows.</p>`,
      options: ['It is a bug in SQL', 'The default frame includes all rows that tie on the ORDER BY value, so they all see the same total', 'Because there are seven days in a week', 'Because the table is sorted wrongly'],
      answer: 1,
      why: [
        'It is documented behaviour, not a bug. It is a trap for people who do not know it.',
        'Yes! Rows with the same ORDER BY value count as “peers”, and the default frame includes all peers. Use ROWS and a tie-breaker for a strict row-by-row count.',
        'The 7 is simply how many orders share that date.',
        'The sorting is fine. The frame definition is what matters.'
      ]
    },
    {
      type: 'explain',
      title: 'Frames: choosing the width of the window',
      body: `<p>A <b>frame</b> says exactly which neighbouring rows to include. The pattern is:</p>
<p><code>ROWS BETWEEN 2 PRECEDING AND CURRENT ROW</code></p>
<p>meaning: <b>this row, plus the 2 rows before it</b> (three rows in total). Some other frames:</p>
<ul>
<li><code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>: from the very start to here (the running total)</li>
<li><code>ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING</code>: one before, this one, one after (a centred window)</li>
<li><code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code>: the whole group</li>
</ul>
<p>Put <code>AVG</code> in front and you have a <b>moving average</b>.</p>`
    },
    {
      type: 'try',
      title: 'A 3-month moving average',
      body: `<p>Each value averages the current month with the two before it. The first month has no earlier months, so it averages just itself (264), and the second averages two. From March on, every value is a full three-month average. Look at the chart: the raw monthly numbers bounce between 207 and 265, but the moving average <b>glides gently down</b> from about 249 to about 231. The smoothing reveals a slow decline that the jumpy raw numbers hide.</p>`,
      chart: 'line',
      chartTitle: '3-month moving average of orders, 2025',
      code: `WITH monthly AS (
    SELECT strftime('%Y-%m', order_date) AS month,
           COUNT(*) AS orders
    FROM orders
    WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01'
    GROUP BY month
)
SELECT month,
       ROUND(AVG(orders) OVER (ORDER BY month
                               ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS moving_avg_3m,
       orders
FROM monthly
ORDER BY month;`
    },
    {
      id: 'sql-6-4-ex2',
      type: 'exercise',
      title: 'Your turn: smooth the line',
      body: `<p>Using the same <code>monthly</code> CTE for 2025, show <code>month</code> and the <b>3-month moving average</b> of orders, rounded to 1 decimal, as <code>moving_avg_3m</code>, in month order.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `ROUND(AVG(orders) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1).`,
        `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01' GROUP BY month) SELECT month, ROUND(AVG(orders) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS moving_avg_3m FROM monthly ORDER BY month;`
      ],
      solution: `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01' GROUP BY month) SELECT month, ROUND(AVG(orders) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS moving_avg_3m FROM monthly ORDER BY month;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The filter trap: windows run before the outer filter',
      body: `<p>You want a <b>7-day moving average</b> of daily orders, but only to <b>show the first 10 days of January 2026</b>. The natural thing is to put the date filter in the same query as the window. But the window is calculated <b>after</b> WHERE has thrown rows away, so on January 1st it can’t see December. It will average over fewer days than you asked for.</p>
<p>The cure is the one from the year-over-year lesson: <b>calculate the window first in a CTE, filter afterwards in the outer query</b>. Watch the difference in real numbers.</p>`
    },
    {
      type: 'try',
      title: 'Wrong: filtering in the same query',
      body: `<p>On 1 January the 7-day average shows <b>9.0</b>, which is simply that day’s 9 orders. The window found only one row (the filter had already removed December), so it averaged <b>a single day</b>. The next day averages two days, then three. These aren’t 7-day averages at all, and the query raised no error.</p>`,
      code: `WITH daily AS (
    SELECT order_date, COUNT(*) AS orders
    FROM orders
    GROUP BY order_date
)
SELECT order_date,
       orders,
       ROUND(AVG(orders) OVER (ORDER BY order_date
                               ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS avg_7d
FROM daily
WHERE order_date >= '2026-01-01' AND order_date <= '2026-01-10'
ORDER BY order_date;`
    },
    {
      type: 'try',
      title: 'Right: window first, filter after',
      body: `<p>Now the window is computed over <b>all days</b>, so 1 January correctly includes the last six days of December. The first value is <b>8.0</b>, not 9.0. From 7 January on both versions agree, because by then there are seven days inside the filter anyway. The difference only shows at the edge, exactly where a careless analyst isn’t looking.</p>`,
      code: `WITH daily AS (
    SELECT order_date, COUNT(*) AS orders
    FROM orders
    GROUP BY order_date
),
smooth AS (
    SELECT order_date,
           orders,
           ROUND(AVG(orders) OVER (ORDER BY order_date
                                   ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS avg_7d
    FROM daily
)
SELECT order_date, orders, avg_7d
FROM smooth
WHERE order_date >= '2026-01-01' AND order_date <= '2026-01-10'
ORDER BY order_date;`
    },
    {
      id: 'sql-6-4-ex3',
      type: 'exercise',
      title: 'Your turn: the correct 7-day average',
      body: `<p>Write the correct version. CTE <code>daily</code> (orders per <code>order_date</code>), CTE <code>smooth</code> (the 7-day moving average, rounded to 2 decimals, as <code>avg_7d</code>), then show <code>order_date</code>, <code>orders</code> and <code>avg_7d</code> for <b>2026-01-01 to 2026-01-10</b> in date order. The first value must be 8.0.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `The window ROWS BETWEEN 6 PRECEDING AND CURRENT ROW belongs in the smooth CTE. The date filter goes in the final SELECT.`,
        `WITH daily AS (SELECT order_date, COUNT(*) AS orders FROM orders GROUP BY order_date), smooth AS (SELECT order_date, orders, ROUND(AVG(orders) OVER (ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS avg_7d FROM daily) SELECT order_date, orders, avg_7d FROM smooth WHERE order_date >= '2026-01-01' AND order_date <= '2026-01-10' ORDER BY order_date;`
      ],
      solution: `WITH daily AS (SELECT order_date, COUNT(*) AS orders FROM orders GROUP BY order_date), smooth AS (SELECT order_date, orders, ROUND(AVG(orders) OVER (ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS avg_7d FROM daily) SELECT order_date, orders, avg_7d FROM smooth WHERE order_date >= '2026-01-01' AND order_date <= '2026-01-10' ORDER BY order_date;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Year-to-date: a running total that restarts',
      body: `<p>Add <code>PARTITION BY year</code> to a running total and it <b>resets every January</b>. That is a <b>year-to-date</b> (YTD) total, one of the most common numbers in business reports. The partition is the year taken from the month text: <code>substr(month, 1, 4)</code> (the first four characters).</p>
<p>Remember the filter rule: calculate the window over <b>all</b> months first, then pick the months you want to display.</p>`
    },
    {
      type: 'try',
      title: 'The same months in two years',
      body: `<p>Look at the <code>ytd</code> column. In <b>2024</b>: 221, then 442, then 686. In <b>2025</b>: it <b>restarts</b> at 264, then 496, then 748. By the end of March 2025 the company was <b>62 orders ahead</b> of the same point in 2024. That’s a comparison managers love, and it falls out of one PARTITION BY.</p>`,
      code: `WITH monthly AS (
    SELECT strftime('%Y-%m', order_date) AS month,
           COUNT(*) AS orders
    FROM orders
    GROUP BY month
),
ytd AS (
    SELECT month,
           orders,
           SUM(orders) OVER (PARTITION BY substr(month, 1, 4)
                             ORDER BY month) AS ytd
    FROM monthly
)
SELECT month, orders, ytd
FROM ytd
WHERE month IN ('2024-01', '2024-02', '2024-03', '2025-01', '2025-02', '2025-03')
ORDER BY month;`
    },
    {
      id: 'sql-6-4-ex4',
      type: 'exercise',
      title: 'Your turn: year-to-date',
      body: `<p>Recreate it. CTE <code>monthly</code> (orders per month, <b>all</b> months), CTE <code>ytd</code> (adding <code>SUM(orders)</code> as <code>ytd</code>, partitioned by the year and ordered by month). Show <code>month</code>, <code>orders</code>, <code>ytd</code> for the months <b>2024-01, 2024-02, 2024-03, 2025-01, 2025-02, 2025-03</b>, in month order.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `PARTITION BY substr(month, 1, 4) ORDER BY month inside the window, and filter months with IN (...) only in the final SELECT.`,
        `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders GROUP BY month), ytd AS (SELECT month, orders, SUM(orders) OVER (PARTITION BY substr(month, 1, 4) ORDER BY month) AS ytd FROM monthly) SELECT month, orders, ytd FROM ytd WHERE month IN ('2024-01', '2024-02', '2024-03', '2025-01', '2025-02', '2025-03') ORDER BY month;`
      ],
      solution: `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders GROUP BY month), ytd AS (SELECT month, orders, SUM(orders) OVER (PARTITION BY substr(month, 1, 4) ORDER BY month) AS ytd FROM monthly) SELECT month, orders, ytd FROM ytd WHERE month IN ('2024-01', '2024-02', '2024-03', '2025-01', '2025-02', '2025-03') ORDER BY month;`,
      ordered: true
    },
    {
      type: 'try',
      title: 'The tie-out: cumulative orders since day one',
      body: `<p>A running total over the <b>whole history</b>, with no partition. It climbs steadily from 241 in January 2023 to <b>exactly 10,000</b> in June 2026, the total number of orders in the table. When the last running total equals the grand total, you know nothing was lost on the way.</p>`,
      chart: 'line',
      chartTitle: 'Cumulative orders since January 2023',
      code: `WITH monthly AS (
    SELECT strftime('%Y-%m', order_date) AS month,
           COUNT(*) AS orders
    FROM orders
    GROUP BY month
)
SELECT month,
       SUM(orders) OVER (ORDER BY month) AS cumulative_orders
FROM monthly
ORDER BY month;`
    },
    {
      id: 'sql-6-4-ex5',
      type: 'exercise',
      title: 'Challenge: how far through the year?',
      body: `<p>For orders per month in <b>2025</b>, show <code>month</code> and the <b>cumulative percentage</b> of the year’s orders reached so far, rounded to 1 decimal, as <code>cum_pct</code>. That is the running total divided by the full-year total (<code>SUM(orders) OVER ()</code>), times 100. By June it should be 50.7.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `ROUND(100.0 * SUM(orders) OVER (ORDER BY month) / SUM(orders) OVER (), 1) AS cum_pct.`,
        `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01' GROUP BY month) SELECT month, ROUND(100.0 * SUM(orders) OVER (ORDER BY month) / SUM(orders) OVER (), 1) AS cum_pct FROM monthly ORDER BY month;`
      ],
      solution: `WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01' GROUP BY month) SELECT month, ROUND(100.0 * SUM(orders) OVER (ORDER BY month) / SUM(orders) OVER (), 1) AS cum_pct FROM monthly ORDER BY month;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Build <b>running totals</b> with <code>SUM(...) OVER (ORDER BY ...)</code></li>
<li>Avoid the <b>tied-rows trap</b> by using <code>ROWS</code> and a unique tie-breaker</li>
<li>Choose the window’s width with a <b>frame</b> and build <b>moving averages</b> to smooth noisy data</li>
<li>Restart a total each year with <code>PARTITION BY</code> for <b>year-to-date</b></li>
<li>Calculate the window <b>first</b> and filter <b>afterwards</b></li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>How do you calculate a running total in SQL?</li>
<li>What is the difference between <code>ROWS</code> and <code>RANGE</code> frames?</li>
<li>How would you calculate a 7-day moving average?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> <code>SUM(amount) OVER (ORDER BY date)</code>, ideally with an explicit frame <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>.</p>
<p><b>2.</b> ROWS counts physical rows. RANGE works on values of the ORDER BY column, so tied rows are treated as one block (peers) and share the same result.</p>
<p><b>3.</b> <code>AVG(value) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)</code>, computed before you filter the date range, and with a calendar that has no missing days.</p>
</details>
<p><b>Coming next, Lesson 6.5: NTILE, percentiles, FIRST_VALUE and LAST_VALUE.</b> Slicing customers into equal-sized groups, finding out what percentile a payment sits at, and discovering whether TradeFlow follows the famous “80/20 rule”. (It doesn’t.)</p>`
    }
  ]
},
{
  id: 'sql-6-5',
  track: 'sql',
  title: '6.5 NTILE, percentiles, FIRST_VALUE and LAST_VALUE',
  tables: ['orders', 'payments', 'products'],
  intro: `Three last questions for this module: <i>“Split our customers into four equal groups by spending.”</i>, <i>“This payment is large, but how large compared with all the others?”</i> and <i>“Next to every product, show the cheapest and the most expensive product in its category.”</i><br><br>These are the last tools in the window-function family, and one of them hides a trap that catches nearly everyone. You will also test a famous business rule against real data, and find out whether it holds.`,
  steps: [
    {
      type: 'explain',
      title: 'NTILE: slicing the loaf',
      body: `<div class="callout analogy"><b>The big idea:</b> <code>NTILE(4)</code> takes an ordered list and slices it into <b>4 equal-sized pieces</b>, like cutting a loaf of bread into four slices of the same number of rows, and tells you which slice each row belongs to. <code>NTILE(4)</code> makes <b>quartiles</b>, <code>NTILE(10)</code> makes <b>deciles</b>, <code>NTILE(100)</code> makes percentile groups.</div>
<p>If the rows don’t divide evenly, the first slices get one extra row. For example, 1,962 customers into 4 slices gives 491, 491, 490 and 490.</p>`
    },
    {
      type: 'try',
      title: 'Customers in four equal groups',
      body: `<p>We first total each customer’s Paid money, then use <code>NTILE(4) OVER (ORDER BY total_paid DESC)</code>. Quartile <b>1</b> holds the 491 biggest spenders, and quartile 4 the smallest. Look at the share of revenue: the top quarter of customers bring <b>44.3%</b> of the money, and the bottom quarter just <b>8.9%</b>.</p>`,
      chart: 'bar',
      chartTitle: 'Share of Paid revenue by customer quartile (1 = biggest spenders)',
      code: `WITH paid AS (
    SELECT o.customer_id, SUM(p.amount) AS total_paid
    FROM orders o
    JOIN payments p ON p.order_id = o.order_id
    WHERE p.payment_status = 'Paid'
    GROUP BY o.customer_id
),
q AS (
    SELECT customer_id,
           total_paid,
           NTILE(4) OVER (ORDER BY total_paid DESC, customer_id) AS quartile
    FROM paid
)
SELECT quartile,
       ROUND(100.0 * SUM(total_paid) / (SELECT SUM(total_paid) FROM q), 1) AS revenue_share_pct,
       COUNT(*) AS customers
FROM q
GROUP BY quartile
ORDER BY quartile;`
    },
    {
      id: 'sql-6-5-ex1',
      type: 'exercise',
      title: 'Your turn: the quartile table',
      body: `<p>Build it. CTE <code>paid</code> (total <b>Paid</b> amount per customer, joining orders and payments) and CTE <code>q</code> (adding <code>NTILE(4)</code> as <code>quartile</code>, biggest spenders first, <code>customer_id</code> as tie-breaker). Show <code>quartile</code>, the number of customers (<code>customers</code>) and the share of revenue (<code>revenue_share_pct</code>, rounded to 1 decimal), by quartile.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Group q by quartile. The share is 100.0 * SUM(total_paid) / (SELECT SUM(total_paid) FROM q).`,
        `WITH paid AS (SELECT o.customer_id, SUM(p.amount) AS total_paid FROM orders o JOIN payments p ON p.order_id = o.order_id WHERE p.payment_status = 'Paid' GROUP BY o.customer_id), q AS (SELECT customer_id, total_paid, NTILE(4) OVER (ORDER BY total_paid DESC, customer_id) AS quartile FROM paid) SELECT quartile, COUNT(*) AS customers, ROUND(100.0 * SUM(total_paid) / (SELECT SUM(total_paid) FROM q), 1) AS revenue_share_pct FROM q GROUP BY quartile ORDER BY quartile;`
      ],
      solution: `WITH paid AS (SELECT o.customer_id, SUM(p.amount) AS total_paid FROM orders o JOIN payments p ON p.order_id = o.order_id WHERE p.payment_status = 'Paid' GROUP BY o.customer_id), q AS (SELECT customer_id, total_paid, NTILE(4) OVER (ORDER BY total_paid DESC, customer_id) AS quartile FROM paid) SELECT quartile, COUNT(*) AS customers, ROUND(100.0 * SUM(total_paid) / (SELECT SUM(total_paid) FROM q), 1) AS revenue_share_pct FROM q GROUP BY quartile ORDER BY quartile;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Testing the famous 80/20 rule',
      body: `<p>You have probably heard of the <b>Pareto principle</b>: “20% of customers bring 80% of the revenue.” It’s repeated in every business book. But is it true for <b>this</b> business? You now have the tool to test it, instead of just believing it. Cut the customers into <b>ten equal slices</b> (deciles) and look at the top one.</p>`
    },
    {
      type: 'try',
      title: 'The ten deciles',
      body: `<p>The top 10% of customers (197 people) bring <b>21.4%</b> of the Paid revenue, the next tenth 16.0%, and the bottom tenth just 2.0%. The pattern slopes gently down. <b>There is no 80/20 here.</b> Even the top <i>quarter</i> (44.3%) is nowhere near 80%.</p>
<p>What does it mean for the business? Revenue is <b>spread widely</b>, so losing one big customer won’t hurt much, but there is also no small “VIP group” to focus on. A rule of thumb from a book would have misled you. The data didn’t.</p>`,
      chart: 'bar',
      chartTitle: 'Share of Paid revenue by customer decile',
      code: `WITH paid AS (
    SELECT o.customer_id, SUM(p.amount) AS total_paid
    FROM orders o
    JOIN payments p ON p.order_id = o.order_id
    WHERE p.payment_status = 'Paid'
    GROUP BY o.customer_id
),
d AS (
    SELECT customer_id,
           total_paid,
           NTILE(10) OVER (ORDER BY total_paid DESC, customer_id) AS decile
    FROM paid
)
SELECT decile,
       ROUND(100.0 * SUM(total_paid) / (SELECT SUM(total_paid) FROM d), 1) AS share_pct,
       COUNT(*) AS customers
FROM d
GROUP BY decile
ORDER BY decile;`
    },
    {
      id: 'sql-6-5-ex2',
      type: 'exercise',
      title: 'Your turn: the top 10%',
      body: `<p>Return one number, <code>top_decile_share</code>: the <b>percentage of all Paid revenue</b> that comes from the <b>top 10% of customers</b> (decile 1), rounded to 1 decimal. Use <code>NTILE(10)</code> and a conditional sum. The answer is 21.4.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `100.0 * SUM(CASE WHEN decile = 1 THEN total_paid ELSE 0 END) / SUM(total_paid), from the d CTE.`,
        `WITH paid AS (SELECT o.customer_id, SUM(p.amount) AS total_paid FROM orders o JOIN payments p ON p.order_id = o.order_id WHERE p.payment_status = 'Paid' GROUP BY o.customer_id), d AS (SELECT customer_id, total_paid, NTILE(10) OVER (ORDER BY total_paid DESC, customer_id) AS decile FROM paid) SELECT ROUND(100.0 * SUM(CASE WHEN decile = 1 THEN total_paid ELSE 0 END) / SUM(total_paid), 1) AS top_decile_share FROM d;`
      ],
      solution: `WITH paid AS (SELECT o.customer_id, SUM(p.amount) AS total_paid FROM orders o JOIN payments p ON p.order_id = o.order_id WHERE p.payment_status = 'Paid' GROUP BY o.customer_id), d AS (SELECT customer_id, total_paid, NTILE(10) OVER (ORDER BY total_paid DESC, customer_id) AS decile FROM paid) SELECT ROUND(100.0 * SUM(CASE WHEN decile = 1 THEN total_paid ELSE 0 END) / SUM(total_paid), 1) AS top_decile_share FROM d;`,
      ordered: true
    },
    {
      id: 'sql-6-5-c1',
      type: 'check',
      title: 'You apply NTILE(4) to 1,962 customers. What do you get?',
      body: `<p>Four slices. 1,962 does not divide evenly by 4.</p>`,
      options: ['An error, because 1,962 is not divisible by 4', 'Four groups of nearly equal size (491, 491, 490, 490)', 'Four groups with equal total revenue', 'Four groups of exactly 500 customers'],
      answer: 1,
      why: [
        'NTILE handles it. The first groups simply get one extra row.',
        'Yes! NTILE splits by row count, as evenly as possible. Two groups get an extra row.',
        'NTILE equalises the number of rows, not the amount of money in each group. (As you saw, the top quartile holds 44.3% of the money.)',
        '4 times 500 is 2,000, which is more than 1,962 customers.'
      ]
    },
    {
      type: 'try',
      title: 'Price bands with equal numbers of products',
      body: `<p>NTILE also builds <b>equal-count bands</b>. Five price bands of 30 products each: the cheapest band runs from 577 to 6,379, the next up to 11,516, and the most expensive band from 33,258 to 84,082. A shop could use this to label items “budget” to “premium”, and every band has the same number of products.</p>`,
      code: `WITH ranked AS (
    SELECT product_id,
           unit_price,
           NTILE(5) OVER (ORDER BY unit_price, product_id) AS price_band
    FROM products
)
SELECT price_band,
       COUNT(*) AS products,
       ROUND(MIN(unit_price), 2) AS lowest,
       ROUND(MAX(unit_price), 2) AS highest
FROM ranked
GROUP BY price_band
ORDER BY price_band;`
    },
    {
      type: 'explain',
      title: 'PERCENT_RANK: “bigger than what share of the others?”',
      body: `<p><code>PERCENT_RANK()</code> tells you where a row sits in the line, from 0 to 1: <b>0</b> for the smallest, <b>1</b> for the largest. Multiply by 100 and you get a <b>percentile</b>: “this payment is larger than X% of all payments.” Managers love this because it turns a raw number into something meaningful.</p>
<p>(<code>CUME_DIST()</code> is a close cousin that counts ties a little differently. Know it exists.)</p>`
    },
    {
      type: 'try',
      title: 'How big is this payment, really?',
      body: `<p>Payment 1 (246,702.23) is larger than <b>80.8%</b> of all payments. Payment 2 (325,801.21) is larger than <b>90.8%</b>. Payment 3 (9,998.84) is larger than only <b>0.6%</b>. Each raw amount now has a meaning anyone can read. We calculate the window over <b>all payments</b> in the CTE, then pick the three payments we want, the filter rule again.</p>`,
      code: `WITH r AS (
    SELECT payment_id,
           amount,
           ROUND(100 * PERCENT_RANK() OVER (ORDER BY amount), 1) AS pct_rank
    FROM payments
)
SELECT payment_id, amount, pct_rank
FROM r
WHERE payment_id IN (1, 2, 3)
ORDER BY payment_id;`
    },
    {
      id: 'sql-6-5-ex3',
      type: 'exercise',
      title: 'Your turn: percentile of the first five payments',
      body: `<p>For payments <b>1 to 5</b>, show <code>payment_id</code>, <code>amount</code> and the <b>percent rank</b> of the amount among all payments, as a percentage rounded to 1 decimal, called <code>pct_rank</code>. Calculate the window first in a CTE, filter afterwards, and sort by <code>payment_id</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `ROUND(100 * PERCENT_RANK() OVER (ORDER BY amount), 1) inside the CTE, then WHERE payment_id <= 5 in the outer query.`,
        `WITH r AS (SELECT payment_id, amount, ROUND(100 * PERCENT_RANK() OVER (ORDER BY amount), 1) AS pct_rank FROM payments) SELECT payment_id, amount, pct_rank FROM r WHERE payment_id <= 5 ORDER BY payment_id;`
      ],
      solution: `WITH r AS (SELECT payment_id, amount, ROUND(100 * PERCENT_RANK() OVER (ORDER BY amount), 1) AS pct_rank FROM payments) SELECT payment_id, amount, pct_rank FROM r WHERE payment_id <= 5 ORDER BY payment_id;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'FIRST_VALUE and LAST_VALUE: the ends of the line',
      body: `<p><code>FIRST_VALUE(column)</code> picks the value from the <b>first row</b> of the window, and <code>LAST_VALUE(column)</code> from the <b>last row</b>. With an <code>ORDER BY</code> inside <code>OVER</code> and <code>PARTITION BY category</code>, the “first” is the cheapest product in the category and the “last” is the most expensive.</p>
<p>This lets every row show <b>who is at the head of its group</b>, so you can compare a product with the cheapest or the dearest in its category.</p>`
    },
    {
      type: 'try',
      title: 'The cheapest product in each category',
      body: `<p>Every Electronics product is shown next to <b>Car Phone Mount</b>, the cheapest Electronics product. Nothing was collapsed: the earbuds, speaker and charger all keep their own rows.</p>`,
      code: `SELECT product_id,
       product_name,
       category,
       unit_price,
       FIRST_VALUE(product_name) OVER (PARTITION BY category
                                       ORDER BY unit_price, product_id) AS cheapest_in_category
FROM products
ORDER BY product_id
LIMIT 6;`
    },
    {
      type: 'try',
      title: 'LAST_VALUE: the trap',
      body: `<p>Now we ask for the <b>most expensive</b> product with LAST_VALUE. But look: every row just returns <b>its own name</b>. The Wireless Earbuds’ “most expensive in the category” is the Wireless Earbuds. That’s wrong.</p>
<p><b>Why?</b> The default frame ends at the <b>current row</b>. So the “last row” LAST_VALUE sees is always the current row itself. It can never look ahead. FIRST_VALUE worked because the first row is always inside the frame. LAST_VALUE needs a bigger frame.</p>`,
      code: `SELECT product_id,
       product_name,
       category,
       unit_price,
       LAST_VALUE(product_name) OVER (PARTITION BY category
                                      ORDER BY unit_price, product_id) AS most_expensive_wrong
FROM products
ORDER BY product_id
LIMIT 4;`
    },
    {
      type: 'try',
      title: 'LAST_VALUE: the fix',
      body: `<p>Add the frame <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code>, “the whole group, from the first row to the last”. Now every Electronics product correctly shows <b>Power Bank 10000mAh</b>, the most expensive. Whenever you use <code>LAST_VALUE</code>, widen the frame.</p>`,
      code: `SELECT product_id,
       product_name,
       category,
       unit_price,
       LAST_VALUE(product_name) OVER (PARTITION BY category
                                      ORDER BY unit_price, product_id
                                      ROWS BETWEEN UNBOUNDED PRECEDING
                                               AND UNBOUNDED FOLLOWING) AS most_expensive
FROM products
ORDER BY product_id
LIMIT 6;`
    },
    {
      id: 'sql-6-5-c2',
      type: 'check',
      title: 'Why does LAST_VALUE(x) OVER (ORDER BY ...) return the current row’s own value?',
      body: `<p>Think about where the default frame ends.</p>`,
      options: ['LAST_VALUE is broken in SQL', 'The default frame stops at the current row, so the last row it sees is the current row', 'It only works with numbers', 'ORDER BY should be removed'],
      answer: 1,
      why: [
        'It is not broken. It follows the frame rules exactly, which surprises people.',
        'Yes! With the default frame, rows after the current one are not visible. Add ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING to see the whole group.',
        'It works with text, dates and numbers.',
        'The ORDER BY decides which row counts as “last”, so it is needed.'
      ]
    },
    {
      id: 'sql-6-5-ex4',
      type: 'exercise',
      title: 'Your turn: the cheapest in its category',
      body: `<p>For the <b>first 5 products</b> (by <code>product_id</code>), show <code>product_id</code>, <code>category</code> and the name of the <b>cheapest product in the same category</b> as <code>cheapest_in_category</code>. Order the window by <code>unit_price</code>, then <code>product_id</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `FIRST_VALUE(product_name) OVER (PARTITION BY category ORDER BY unit_price, product_id).`,
        `SELECT product_id, category, FIRST_VALUE(product_name) OVER (PARTITION BY category ORDER BY unit_price, product_id) AS cheapest_in_category FROM products ORDER BY product_id LIMIT 5;`
      ],
      solution: `SELECT product_id, category, FIRST_VALUE(product_name) OVER (PARTITION BY category ORDER BY unit_price, product_id) AS cheapest_in_category FROM products ORDER BY product_id LIMIT 5;`,
      ordered: true
    },
    {
      id: 'sql-6-5-ex5',
      type: 'exercise',
      title: 'Challenge: the most expensive in its category',
      body: `<p>For the <b>first 5 products</b> (by <code>product_id</code>), show <code>product_id</code>, <code>category</code> and the name of the <b>most expensive product in the same category</b> as <code>most_expensive_in_category</code>. Use <code>LAST_VALUE</code> with the right frame. (Remember the trap!)</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `LAST_VALUE(product_name) OVER (PARTITION BY category ORDER BY unit_price, product_id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING).`,
        `SELECT product_id, category, LAST_VALUE(product_name) OVER (PARTITION BY category ORDER BY unit_price, product_id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS most_expensive_in_category FROM products ORDER BY product_id LIMIT 5;`
      ],
      solution: `SELECT product_id, category, LAST_VALUE(product_name) OVER (PARTITION BY category ORDER BY unit_price, product_id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS most_expensive_in_category FROM products ORDER BY product_id LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Module 6 complete: the window-function family',
      body: `<p>You now know the whole family. Keep this cheat sheet:</p>
<table class="mini"><tr><th>Group</th><th>Functions</th><th>Use it to...</th></tr>
<tr><td><b>Aggregates as windows</b></td><td><code>SUM, AVG, COUNT, MIN, MAX</code></td><td>Add group results beside every row; running totals; moving averages</td></tr>
<tr><td><b>Ranking</b></td><td><code>ROW_NUMBER, RANK, DENSE_RANK, NTILE</code></td><td>Top N per group, de-duplicate, quartiles and deciles</td></tr>
<tr><td><b>Look at neighbours</b></td><td><code>LAG, LEAD</code></td><td>Changes, growth, gaps between events</td></tr>
<tr><td><b>Look at the ends</b></td><td><code>FIRST_VALUE, LAST_VALUE, NTH_VALUE</code></td><td>Compare with the best, worst or n-th in a group</td></tr>
<tr><td><b>Distribution</b></td><td><code>PERCENT_RANK, CUME_DIST</code></td><td>Percentiles</td></tr></table>
<p>And the five rules that protect you:</p>
<ol>
<li>A window <b>keeps every row</b>. GROUP BY collapses them.</li>
<li>A window <b>can’t sit in WHERE</b>. Calculate it in a CTE, then filter.</li>
<li>Add a <b>unique tie-breaker</b> to ORDER BY, and use <code>ROWS</code> for row-by-row results.</li>
<li><b>Filter after the window</b>, or the edges of your window lose their neighbours.</li>
<li>With <code>LAST_VALUE</code>, <b>widen the frame</b>.</li>
</ol>
<p><b>Interview-style questions:</b></p>
<ol>
<li>How would you split customers into four spending groups?</li>
<li>Why does <code>LAST_VALUE</code> sometimes return the current row’s value?</li>
<li>How do you find the second-highest salary?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> <code>NTILE(4) OVER (ORDER BY total_spent DESC)</code> on a per-customer total.</p>
<p><b>2.</b> The default frame ends at the current row, so “last” is the current row. Use <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code>.</p>
<p><b>3.</b> Rank salaries with <code>DENSE_RANK() OVER (ORDER BY salary DESC)</code> in a CTE and keep rank 2. (DENSE_RANK so that ties for first place don’t hide the second-highest.)</p>
</details>
<p><b>Coming next, Module 7: Advanced SQL.</b> Your queries are correct. Now make them <b>fast</b>. How the database decides how to run a query, what an index is (and what it costs), and how to write queries that stay quick on millions of rows.</p>`
    }
  ]
}
);
