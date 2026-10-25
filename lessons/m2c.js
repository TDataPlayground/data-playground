LESSONS.push(
{
  id: 'sql-2-7',
  track: 'sql',
  title: '2.7 CASE WHEN: teaching SQL to make decisions',
  tables: ['customers', 'orders', 'payments', 'deliveries'],
  intro: `Three teams, three requests. Marketing: <i>“Sort our payments into Small, Medium and Large.”</i> Operations: <i>“Flag the problem orders.”</i> Finance: <i>“What percentage of payments fail, for each payment method?”</i><br><br>Every one of those needs SQL to <b>make a decision</b>: “if this, then that, otherwise something else.” That is <b>CASE WHEN</b>, and it is one of the most useful tools in all of SQL. It is also one of the favourite topics in analyst interviews.`,
  steps: [
    {
      type: 'explain',
      title: 'IF this, THEN that',
      body: `<div class="callout analogy"><b>The big idea:</b> <code>CASE WHEN</code> is a decision tree for every row. Think of a gatekeeper at an event: <i>“If you have a gold ticket, go to the VIP area. If you have a blue ticket, go to the main hall. Otherwise, go to the back.”</i> Each person is checked from the top down, and the <b>first rule that fits</b> decides where they go.</div>
<p>The shape of it:</p>
<p><code>CASE WHEN rule1 THEN answer1 WHEN rule2 THEN answer2 ELSE answer3 END</code></p>
<p>It always ends with <code>END</code>, and you almost always give it an alias with <code>AS</code>.</p>`
    },
    {
      type: 'try',
      title: 'Flag the problem orders',
      body: `<p>For every order we ask: is the status Cancelled or Returned? If yes, the flag says <b>Problem</b>. Anything else says <b>OK</b>. You’ve created a brand new column that doesn’t exist in the table.</p>`,
      code: `SELECT order_id,
       order_status,
       CASE
         WHEN order_status IN ('Cancelled', 'Returned') THEN 'Problem'
         ELSE 'OK'
       END AS flag
FROM orders
LIMIT 10;`
    },
    {
      id: 'sql-2-7-ex1',
      type: 'exercise',
      title: 'Your turn: flag the problem orders',
      body: `<p>For the <b>first 10 orders</b>, show <code>order_id</code>, <code>order_status</code> and a column called <code>flag</code>: <b>'Problem'</b> if the status is Cancelled or Returned, otherwise <b>'OK'</b>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Copy the shape of the last query: CASE WHEN ... THEN ... ELSE ... END AS flag.`,
        `SELECT order_id, order_status, CASE WHEN order_status IN ('Cancelled', 'Returned') THEN 'Problem' ELSE 'OK' END AS flag FROM orders LIMIT 10;`
      ],
      solution: `SELECT order_id, order_status, CASE WHEN order_status IN ('Cancelled', 'Returned') THEN 'Problem' ELSE 'OK' END AS flag FROM orders LIMIT 10;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Buckets: turning numbers into groups',
      body: `<p>The most popular use of CASE is turning a number into a <b>bucket</b>, like putting payments into Small, Medium and Large. Then you can group by the bucket and count, which turns thousands of different amounts into a story with three characters.</p>
<p>Our rule: <b>Large</b> is 500,000 or more, <b>Medium</b> is 100,000 or more, and everything else is <b>Small</b>.</p>`
    },
    {
      type: 'try',
      title: 'Sizing up the payments',
      body: `<p>Most payments are Medium (6,078), then Small (3,782), and only <b>140</b> are Large. You can use the same CASE inside <code>GROUP BY</code> by repeating the alias name.</p>`,
      chart: 'bar',
      chartTitle: 'Payments by size band',
      code: `SELECT CASE
         WHEN amount >= 500000 THEN 'Large'
         WHEN amount >= 100000 THEN 'Medium'
         ELSE 'Small'
       END AS size_band,
       COUNT(*) AS payments
FROM payments
GROUP BY size_band
ORDER BY payments DESC;`
    },
    {
      type: 'explain',
      title: 'Two traps: order matters, and no ELSE means NULL',
      body: `<div class="callout watch"><b>Trap 1: the order of the WHENs matters.</b> SQL checks them from the top and stops at the <b>first match</b>. A 600,000 payment is also “at least 100,000”, so if you test the 100,000 rule first, the 600,000 payment is caught there and never reaches “Large”. <b>Always test the strictest rule first.</b></div>
<div class="callout watch"><b>Trap 2: if nothing matches and you have no ELSE, the answer is NULL.</b> Rows silently turn into empty cells.</div>
<p>Run the next two cards to see the damage.</p>`
    },
    {
      type: 'try',
      title: 'Trap 1: the wrong order',
      body: `<p>Same rules, wrong order. Look at the result: the <b>Large band disappeared</b>. All 140 large payments were swallowed by Medium, which now shows 6,218. No error message. A report built like this would never show a single large payment.</p>`,
      code: `SELECT CASE
         WHEN amount >= 100000 THEN 'Medium'
         WHEN amount >= 500000 THEN 'Large'
         ELSE 'Small'
       END AS size_band,
       COUNT(*) AS payments
FROM payments
GROUP BY size_band
ORDER BY payments DESC;`
    },
    {
      type: 'try',
      title: 'Trap 2: forgetting ELSE',
      body: `<p>We removed the <code>ELSE</code>. Now 3,782 rows show a band of <b>NULL</b> (shown as an empty cell). Those are the Small payments, who got no answer. Rule of thumb: always write an ELSE, even if it is just <code>ELSE 'Other'</code>.</p>`,
      code: `SELECT CASE
         WHEN amount >= 500000 THEN 'Large'
         WHEN amount >= 100000 THEN 'Medium'
       END AS size_band,
       COUNT(*) AS payments
FROM payments
GROUP BY size_band
ORDER BY payments DESC;`
    },
    {
      id: 'sql-2-7-c1',
      type: 'check',
      title: 'You write CASE WHEN amount >= 100000 THEN \'Medium\' WHEN amount >= 500000 THEN \'Large\' ELSE \'Small\' END. What band does a 600,000 payment get?',
      body: `<p>SQL checks the rules from the top, and stops at the first match.</p>`,
      options: ['Large', 'Medium', 'Small', 'NULL'],
      answer: 1,
      why: [
        'It would be Large if the 500,000 rule came first. But the 100,000 rule comes first, and 600,000 passes it.',
        'Yes! 600,000 is at least 100,000, so the first WHEN catches it and SQL never looks at the Large rule. Put the strictest rule first.',
        'Small is the ELSE, which only applies when no WHEN matched. Here the first one matched.',
        'NULL only appears when nothing matches and there is no ELSE. Here the first rule matches.'
      ]
    },
    {
      id: 'sql-2-7-ex2',
      type: 'exercise',
      title: 'Your turn: size the payments',
      body: `<p>Build the size bands yourself. <b>Large</b> is 500,000 or more, <b>Medium</b> is 100,000 or more, otherwise <b>Small</b>. Show the band (call it <code>size_band</code>) and the number of payments (<code>payments</code>), most payments first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Strictest rule first. Then GROUP BY size_band and ORDER BY payments DESC.`,
        `SELECT CASE WHEN amount >= 500000 THEN 'Large' WHEN amount >= 100000 THEN 'Medium' ELSE 'Small' END AS size_band, COUNT(*) AS payments FROM payments GROUP BY size_band ORDER BY payments DESC;`
      ],
      solution: `SELECT CASE WHEN amount >= 500000 THEN 'Large' WHEN amount >= 100000 THEN 'Medium' ELSE 'Small' END AS size_band, COUNT(*) AS payments FROM payments GROUP BY size_band ORDER BY payments DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The power move: CASE inside an aggregate',
      body: `<p>Put a CASE <b>inside</b> <code>SUM</code> and you can count or total only the rows that meet a condition, <b>without filtering the others out</b>. That means several different numbers, side by side, in one query. Analysts call this a <b>conditional aggregate</b>, and it turns rows into columns (a <i>pivot</i>).</p>
<ul>
<li><code>SUM(CASE WHEN payment_status = 'Failed' THEN 1 ELSE 0 END)</code> counts the failed ones</li>
<li><code>SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END)</code> totals only the paid money</li>
</ul>`
    },
    {
      type: 'try',
      title: 'Paid and refunded money, side by side',
      body: `<p>For each payment method, the money that was <b>paid</b> next to the money that was <b>refunded</b>. Two different conditions, one query, one row per method. Without CASE you would need two queries and some copy-pasting.</p>`,
      code: `SELECT payment_method,
       ROUND(SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END), 2) AS paid_total,
       ROUND(SUM(CASE WHEN payment_status = 'Refunded' THEN amount ELSE 0 END), 2) AS refunded_total
FROM payments
GROUP BY payment_method
ORDER BY paid_total DESC;`
    },
    {
      id: 'sql-2-7-ex3',
      type: 'exercise',
      title: 'Your turn: paid versus refunded',
      body: `<p>Recreate it. Show each <code>payment_method</code>, the total of <b>Paid</b> amounts (<code>paid_total</code>) and the total of <b>Refunded</b> amounts (<code>refunded_total</code>), both rounded to 2 decimals, biggest <code>paid_total</code> first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Two SUM(CASE WHEN ... THEN amount ELSE 0 END) columns, wrapped in ROUND( ..., 2 ).`,
        `SELECT payment_method, ROUND(SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END), 2) AS paid_total, ROUND(SUM(CASE WHEN payment_status = 'Refunded' THEN amount ELSE 0 END), 2) AS refunded_total FROM payments GROUP BY payment_method ORDER BY paid_total DESC;`
      ],
      solution: `SELECT payment_method, ROUND(SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END), 2) AS paid_total, ROUND(SUM(CASE WHEN payment_status = 'Refunded' THEN amount ELSE 0 END), 2) AS refunded_total FROM payments GROUP BY payment_method ORDER BY paid_total DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Rates: the number managers actually ask for',
      body: `<p>Managers rarely ask “how many failed?” They ask “<b>what percentage</b> failed?”. A rate needs two things: the count you care about, divided by the total, times 100. From Lesson 2.4 you know to write <code>100.0</code> with the decimal point, so SQL doesn’t chop the answer into a whole number.</p>
<p>The recipe: <code>ROUND(100.0 * SUM(CASE WHEN condition THEN 1 ELSE 0 END) / COUNT(*), 1)</code></p>`
    },
    {
      type: 'try',
      title: 'The failed-payment rate by method',
      body: `<p>Bank Transfer fails most often (<b>5.0%</b>), and Card least (<b>3.5%</b>). Now you can tell your manager which payment method is most reliable, with evidence.</p>`,
      chart: 'bar',
      chartTitle: 'Failed-payment rate (%) by method',
      code: `SELECT payment_method,
       ROUND(100.0 * SUM(CASE WHEN payment_status = 'Failed' THEN 1 ELSE 0 END) / COUNT(*), 1) AS failed_rate
FROM payments
GROUP BY payment_method
ORDER BY failed_rate DESC;`
    },
    {
      id: 'sql-2-7-ex4',
      type: 'exercise',
      title: 'Your turn: two rates in one query',
      body: `<p>For each <code>payment_method</code>, show the <b>failed rate</b> (<code>failed_rate</code>) and the <b>refunded rate</b> (<code>refunded_rate</code>), both as percentages rounded to 1 decimal. Highest failed rate first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Two rate columns, each with its own CASE. Same recipe, different status.`,
        `SELECT payment_method, ROUND(100.0 * SUM(CASE WHEN payment_status = 'Failed' THEN 1 ELSE 0 END) / COUNT(*), 1) AS failed_rate, ROUND(100.0 * SUM(CASE WHEN payment_status = 'Refunded' THEN 1 ELSE 0 END) / COUNT(*), 1) AS refunded_rate FROM payments GROUP BY payment_method ORDER BY failed_rate DESC;`
      ],
      solution: `SELECT payment_method, ROUND(100.0 * SUM(CASE WHEN payment_status = 'Failed' THEN 1 ELSE 0 END) / COUNT(*), 1) AS failed_rate, ROUND(100.0 * SUM(CASE WHEN payment_status = 'Refunded' THEN 1 ELSE 0 END) / COUNT(*), 1) AS refunded_rate FROM payments GROUP BY payment_method ORDER BY failed_rate DESC;`,
      ordered: true
    },
    {
      id: 'sql-2-7-ex5',
      type: 'exercise',
      title: 'Challenge: where are the missing emails?',
      body: `<p>For each <code>country</code>, what <b>percentage of customers have no email</b>? Show the country and the percentage rounded to 1 decimal (call it <code>pct_missing_email</code>), highest percentage first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `The condition inside CASE is email IS NULL.`,
        `SELECT country, ROUND(100.0 * SUM(CASE WHEN email IS NULL THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct_missing_email FROM customers GROUP BY country ORDER BY pct_missing_email DESC;`
      ],
      solution: `SELECT country, ROUND(100.0 * SUM(CASE WHEN email IS NULL THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct_missing_email FROM customers GROUP BY country ORDER BY pct_missing_email DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Make SQL decide with <code>CASE WHEN ... THEN ... ELSE ... END</code></li>
<li>Turn numbers into <b>buckets</b>, and always put the strictest rule first</li>
<li>Always write an <code>ELSE</code>, so nothing silently becomes NULL</li>
<li>Use CASE inside <code>SUM</code> for conditional totals and side-by-side columns (a pivot)</li>
<li>Calculate <b>rates</b> as percentages, safely</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>How would you count how many orders were Completed and how many were Cancelled in a single query?</li>
<li>What does a CASE expression return if no WHEN matches and there is no ELSE?</li>
<li>How would you calculate the percentage of failed payments?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> <code>SELECT SUM(CASE WHEN order_status = 'Completed' THEN 1 ELSE 0 END) AS completed, SUM(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled FROM orders;</code></p>
<p><b>2.</b> NULL.</p>
<p><b>3.</b> <code>100.0 * SUM(CASE WHEN payment_status = 'Failed' THEN 1 ELSE 0 END) / COUNT(*)</code>, using 100.0 to avoid whole-number division, then ROUND.</p>
</details>
<p><b>Coming next, Lesson 2.8: Working with dates.</b> “How many orders per month?” “How long do deliveries take?” You’ll draw a line chart, and discover why comparing a half-finished year with a full year can mislead a whole company.</p>`
    }
  ]
},
{
  id: 'sql-2-8',
  track: 'sql',
  title: '2.8 Working with dates: extracting, grouping and calculating',
  tables: ['customers', 'orders', 'deliveries'],
  intro: `The CEO wants trends: <i>“Are orders going up or down? What does each month look like? And how long do deliveries really take?”</i><br><br>Almost every business question has a <b>time</b> in it, so dates are where real analysis begins. In this lesson you will pull years and months out of dates, group by them, do calendar maths, and draw your first <b>line chart</b>. You will also spot two traps that fool even experienced people.`,
  steps: [
    {
      type: 'explain',
      title: 'Dates are text with a tidy shape',
      body: `<div class="callout analogy"><b>The big idea:</b> in TradeFlow, a date is text written as <code>YYYY-MM-DD</code>, like <code>2025-11-28</code>. Because the shape never changes, SQL can <b>cut it into pieces</b> (year, month, day) and do <b>calendar maths</b> on it, the way you tear a ticket into sections.</div>
<p>SQLite gives you three main tools:</p>
<ul>
<li><code>strftime(format, date)</code>: pulls a piece out. <code>'%Y'</code> is the year, <code>'%m'</code> the month, <code>'%d'</code> the day, <code>'%w'</code> the day of the week (0 is Sunday).</li>
<li><code>date(d, '+7 days')</code>: calendar arithmetic (add or subtract days, months, years)</li>
<li><code>julianday(d)</code>: turns a date into a day-number, so you can subtract two dates to get the days between them</li>
</ul>`
    },
    {
      type: 'try',
      title: 'Cutting a date into pieces',
      body: `<p>One date, four pieces. Notice the results are <b>text</b>, like <code>'11'</code> not the number 11. That matters when sorting or comparing, so you keep the leading zero in months: <code>'05'</code> sorts correctly, <code>'5'</code> would not.</p>`,
      code: `SELECT order_date,
       strftime('%Y', order_date) AS year,
       strftime('%m', order_date) AS month,
       strftime('%d', order_date) AS day,
       strftime('%w', order_date) AS weekday_number
FROM orders
LIMIT 5;`
    },
    {
      type: 'try',
      title: 'Orders per year (and a trap)',
      body: `<p>Group by the year you extracted. Look at the chart: 2023, 2024 and 2025 are all around 2,850. But <b>2026 looks like a collapse</b>, with only 1,406 orders.</p>
<div class="callout watch"><b>Trap: the partial year.</b> TradeFlow’s data ends on 30 June 2026. 2026 isn’t collapsing. It’s only <b>half a year</b>! Comparing it to full years is a classic mistake that has caused real panic in real companies. Always check the date range of your data before comparing periods.</div>`,
      chart: 'bar',
      chartTitle: 'Orders per year',
      code: `SELECT strftime('%Y', order_date) AS year,
       COUNT(*) AS orders
FROM orders
GROUP BY year
ORDER BY year;`
    },
    {
      id: 'sql-2-8-ex1',
      type: 'exercise',
      title: 'Your turn: new customers per year',
      body: `<p>How many customers signed up in each year? Show the year (<code>year</code>) and the number of customers (<code>new_customers</code>), in year order, from the <code>signup_date</code> column.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Use strftime('%Y', signup_date) and group by it.`,
        `SELECT strftime('%Y', signup_date) AS year, COUNT(*) AS new_customers FROM customers GROUP BY year ORDER BY year;`
      ],
      solution: `SELECT strftime('%Y', signup_date) AS year, COUNT(*) AS new_customers FROM customers GROUP BY year ORDER BY year;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Months: the year-and-month key',
      body: `<p>To see a trend you need <b>months</b>. But if you group by month number alone, every January of every year gets mixed into one pile. Use the format <code>'%Y-%m'</code>, which gives <code>2025-01</code>, <code>2025-02</code> and so on. It sorts correctly, and it keeps each year apart.</p>
<div class="callout tip"><b>Pro tip: use a half-open date range.</b> Instead of <code>BETWEEN '2025-01-01' AND '2025-12-31'</code>, write <code>order_date &gt;= '2025-01-01' AND order_date &lt; '2026-01-01'</code>: “from the start of 2025 up to, but not including, the start of 2026.” It never gets the last day wrong, and it still works if your dates later include times.</div>`
    },
    {
      type: 'try',
      title: 'A month-by-month trend, as a line chart',
      body: `<p>Twelve months of 2025. A <b>line chart</b> is the right choice for anything over time, because the eye follows the line. Orders stay in a narrow band (207 to 265 a month), with the highest in July and the lowest in November.</p>`,
      chart: 'line',
      chartTitle: 'Orders per month, 2025',
      code: `SELECT strftime('%Y-%m', order_date) AS month,
       COUNT(*) AS orders
FROM orders
WHERE order_date >= '2025-01-01'
  AND order_date <  '2026-01-01'
GROUP BY month
ORDER BY month;`
    },
    {
      id: 'sql-2-8-ex2',
      type: 'exercise',
      title: 'Your turn: the first quarter of 2026',
      body: `<p>Show orders per month for <b>January to March 2026</b>: the month (<code>month</code>, like 2026-01) and the number of orders (<code>orders</code>), in month order. Use a half-open range.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `WHERE order_date >= '2026-01-01' AND order_date < '2026-04-01', then group by strftime('%Y-%m', order_date).`,
        `SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2026-01-01' AND order_date < '2026-04-01' GROUP BY month ORDER BY month;`
      ],
      solution: `SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2026-01-01' AND order_date < '2026-04-01' GROUP BY month ORDER BY month;`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Which day of the week is busiest?',
      body: `<p>A number like 3 isn’t friendly, so we use CASE (from the last lesson) to turn it into a day name. Wednesday is the busiest, though the differences are small. Notice we <b>group and sort by the number</b>, so the days stay in calendar order, and only <i>display</i> the name.</p>`,
      chart: 'bar',
      chartTitle: 'Orders by day of the week',
      code: `SELECT CASE strftime('%w', order_date)
         WHEN '0' THEN 'Sun' WHEN '1' THEN 'Mon' WHEN '2' THEN 'Tue'
         WHEN '3' THEN 'Wed' WHEN '4' THEN 'Thu' WHEN '5' THEN 'Fri'
         WHEN '6' THEN 'Sat'
       END AS weekday,
       COUNT(*) AS orders
FROM orders
GROUP BY strftime('%w', order_date)
ORDER BY strftime('%w', order_date);`
    },
    {
      type: 'explain',
      title: 'Calendar maths: adding days and finding gaps',
      body: `<ul>
<li><code>date(order_date, '+7 days')</code> gives the date a week later. (Also try <code>'-1 month'</code>, <code>'+1 year'</code> and <code>'start of month'</code>.)</li>
<li><code>julianday(later) - julianday(earlier)</code> gives the <b>number of days between</b> two dates.</li>
</ul>
<p>If either date is empty (NULL), the answer is NULL too. That’s the NULL rule from Lesson 1.3 at work.</p>`
    },
    {
      type: 'try',
      title: 'Due dates and month starts',
      body: `<p>For each order: the date one week later (a due date) and the first day of its month. Handy for monthly reports.</p>`,
      code: `SELECT order_date,
       date(order_date, '+7 days') AS due_date,
       date(order_date, 'start of month') AS month_start
FROM orders
LIMIT 5;`
    },
    {
      type: 'try',
      title: 'How many days did each delivery take?',
      body: `<p>Delivery date minus dispatch date. Look at rows 1, 4 and 5: the delivery date is empty, so the days are empty too (these are the In Transit or Failed deliveries, as you learned in Lesson 1.3).</p>`,
      code: `SELECT delivery_id,
       dispatch_date,
       delivery_date,
       julianday(delivery_date) - julianday(dispatch_date) AS days_taken
FROM deliveries
LIMIT 6;`
    },
    {
      id: 'sql-2-8-c1',
      type: 'check',
      title: 'What does strftime(\'%Y-%m\', \'2025-11-28\') return?',
      body: `<p>Year, dash, month.</p>`,
      options: ['2025', '2025-11', '11-28', '2025-11-28'],
      answer: 1,
      why: [
        'That would be the result of %Y alone. Here the format also asks for the month.',
        'Yes! %Y gives the year, the dash is copied as it is, and %m gives the month: a perfect month key.',
        'That would need the format %m-%d.',
        'That would need %Y-%m-%d, which returns the whole date.'
      ]
    },
    {
      id: 'sql-2-8-ex3',
      type: 'exercise',
      title: 'Your turn: the average delivery time',
      body: `<p>What is the <b>average number of days</b> a <b>Delivered</b> delivery takes (delivery date minus dispatch date)? Round to 1 decimal and call it <code>avg_days</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `AVG(julianday(delivery_date) - julianday(dispatch_date)), wrapped in ROUND( ..., 1 ), with a WHERE on delivery_status.`,
        `SELECT ROUND(AVG(julianday(delivery_date) - julianday(dispatch_date)), 1) AS avg_days FROM deliveries WHERE delivery_status = 'Delivered';`
      ],
      solution: `SELECT ROUND(AVG(julianday(delivery_date) - julianday(dispatch_date)), 1) AS avg_days FROM deliveries WHERE delivery_status = 'Delivered';`,
      ordered: true
    },
    {
      id: 'sql-2-8-ex4',
      type: 'exercise',
      title: 'Your turn: how long between signing up and the first order year?',
      body: `<p>Show the <b>month</b> (like 2025-07) that had the <b>most orders in the whole company history</b>, and how many orders it had. Return two columns: <code>month</code> and <code>orders</code>. Show only the top 1 row, with <code>month</code> ascending as the tie-breaker.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Group by strftime('%Y-%m', order_date), count, sort by orders descending then month ascending, LIMIT 1.`,
        `SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders GROUP BY month ORDER BY orders DESC, month ASC LIMIT 1;`
      ],
      solution: `SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders GROUP BY month ORDER BY orders DESC, month ASC LIMIT 1;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A detective story: what does “Delayed” really mean?',
      body: `<p>One more lesson in analyst thinking. TradeFlow has delivery statuses <b>Delivered</b> and <b>Delayed</b>. You’d expect Delayed deliveries to take <i>longer</i>. Let’s test that instead of assuming it.</p>
<p>In the next exercise you’ll compare the average delivery time for each status. Look at the answer carefully before you decide what it means.</p>`
    },
    {
      id: 'sql-2-8-ex5',
      type: 'exercise',
      title: 'Challenge: are Delayed deliveries really slower?',
      body: `<p>For deliveries that <b>have a delivery date</b>, show each <code>delivery_status</code> and its <b>average days taken</b>, rounded to <b>2 decimals</b> (call it <code>avg_days</code>), sorted by <code>delivery_status</code> A to Z.</p>
<p>When you get the answer, ask yourself: <i>does “Delayed” mean what I thought it meant?</i></p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `WHERE delivery_date IS NOT NULL, then GROUP BY delivery_status with ROUND(AVG(julianday(delivery_date) - julianday(dispatch_date)), 2).`,
        `SELECT delivery_status, ROUND(AVG(julianday(delivery_date) - julianday(dispatch_date)), 2) AS avg_days FROM deliveries WHERE delivery_date IS NOT NULL GROUP BY delivery_status ORDER BY delivery_status;`
      ],
      solution: `SELECT delivery_status, ROUND(AVG(julianday(delivery_date) - julianday(dispatch_date)), 2) AS avg_days FROM deliveries WHERE delivery_date IS NOT NULL GROUP BY delivery_status ORDER BY delivery_status;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The surprise, and how it looks in other databases',
      body: `<div class="callout tip"><b>The finding:</b> Delayed and Delivered both average <b>5.51 days</b>. “Delayed” deliveries are <i>not</i> slower than normal ones. So either the label means something else (a delay against a promised date we don’t have), or the status data is unreliable. A good analyst doesn’t guess. They go back to the logistics team and ask: <b>“What exactly does Delayed mean in your system?”</b> Questioning a label is a skill that separates great analysts from average ones.</div>
<div class="callout work"><b>In other databases:</b> the idea is identical, but the function names change.
<table class="mini"><tr><th>Task</th><th>SQLite (here)</th><th>PostgreSQL</th><th>MySQL / SQL Server</th></tr>
<tr><td>Year of a date</td><td><code>strftime('%Y', d)</code></td><td><code>EXTRACT(YEAR FROM d)</code></td><td><code>YEAR(d)</code></td></tr>
<tr><td>Start of month</td><td><code>date(d, 'start of month')</code></td><td><code>DATE_TRUNC('month', d)</code></td><td><code>DATE_FORMAT</code> / <code>DATEFROMPARTS</code></td></tr>
<tr><td>Days between</td><td><code>julianday(b) - julianday(a)</code></td><td><code>b - a</code></td><td><code>DATEDIFF(day, a, b)</code></td></tr>
<tr><td>Add 7 days</td><td><code>date(d, '+7 days')</code></td><td><code>d + INTERVAL '7 days'</code></td><td><code>DATE_ADD</code> / <code>DATEADD</code></td></tr></table>
Real databases also have proper <code>DATE</code> and <code>TIMESTAMP</code> types. The thinking is the same.</div>`
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Cut dates into pieces with <code>strftime</code> and group by year, month or weekday</li>
<li>Use the <code>'%Y-%m'</code> key and half-open date ranges</li>
<li>Do calendar maths with <code>date()</code> and <code>julianday()</code></li>
<li>Draw trends as line charts</li>
<li>Spot the <b>partial-year trap</b>, and question what a status label really means</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>How would you count orders per month?</li>
<li>Why is <code>date &gt;= '2025-01-01' AND date &lt; '2026-01-01'</code> often safer than BETWEEN?</li>
<li>Sales dropped 50% this year compared with last year. What do you check before reporting it?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Extract the year and month and group by it: <code>SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) FROM orders GROUP BY month ORDER BY month;</code></p>
<p><b>2.</b> BETWEEN includes both ends, so a late-in-the-day timestamp on the last date can be missed or double-counted. The half-open form never gets the boundary wrong.</p>
<p><b>3.</b> Check whether this year is complete (a partial year compared with a full year), whether the data feed broke, and whether definitions or filters changed. Only then report it.</p>
</details>
<p><b>Coming next, Lesson 2.9: Working with text.</b> The last lesson of Module 2, and the messiest: titles stuck in front of names, emails in capital letters, and how to clean them all in a query.</p>`
    }
  ]
},
{
  id: 'sql-2-9',
  track: 'sql',
  title: '2.9 Working with text: cleaning messy real-world data',
  tables: ['customers', 'products'],
  intro: `The marketing team is about to send a campaign to every customer. They want to say <i>“Hello Steven!”</i> and to know which email providers customers use. You look at the data and find a problem: <b>some names start with “Dr.” or “Mrs.”</b>, and <b>some emails are in capital letters</b>.<br><br>Real data is never clean. In this final lesson of Module 2, you’ll learn the text tools analysts use to clean it, and you will clean TradeFlow’s data yourself.`,
  steps: [
    {
      type: 'explain',
      title: 'The text toolbox',
      body: `<div class="callout analogy"><b>The big idea:</b> text functions are like a tailor’s tools. You don’t buy new cloth, you <b>cut, trim, swap and measure</b> what you have. And just like a tailor you never cut the original cloth: you work on a <i>copy</i> inside your query, and the raw data stays untouched.</div>
<ul>
<li><code>LOWER(x)</code> and <code>UPPER(x)</code>: change the case</li>
<li><code>LENGTH(x)</code>: count the characters</li>
<li><code>TRIM(x)</code>: remove spaces from both ends</li>
<li><code>SUBSTR(x, start, length)</code>: cut out a piece (the first character is position <b>1</b>)</li>
<li><code>INSTR(x, find)</code>: find the position of a piece of text (0 if not found)</li>
<li><code>REPLACE(x, old, new)</code>: swap one piece of text for another</li>
</ul>`
    },
    {
      type: 'try',
      title: 'Try each tool on a single email',
      body: `<p>No table needed. We feed each function a small piece of text so you can see exactly what it does:</p>
<ul>
<li><code>LOWER</code> and <code>UPPER</code> change case</li>
<li><code>LENGTH</code> counts 7 characters in “ada obi”</li>
<li><code>TRIM</code> removes the spaces around “hi”</li>
<li><code>INSTR</code> finds the <code>@</code> at position 4</li>
<li><code>SUBSTR('ada@gmail.com', 5)</code> returns everything <i>from position 5 onwards</i>: <b>gmail.com</b></li>
<li><code>REPLACE</code> removes “ (V2)” from a product name</li>
</ul>`,
      code: `SELECT LOWER('ADA Obi') AS lowered,
       UPPER('ada obi') AS uppered,
       LENGTH('ada obi') AS how_long,
       TRIM('   hi   ') AS trimmed,
       INSTR('ada@gmail.com', '@') AS at_position,
       SUBSTR('ada@gmail.com', 5) AS from_position_5,
       REPLACE('Smart Watch (V2)', ' (V2)', '') AS cleaned;`
    },
    {
      type: 'explain',
      title: 'Cutting out the email domain',
      body: `<p>To find which provider each customer uses, we need the part <b>after the @</b>. The recipe uses two tools together:</p>
<ol>
<li><code>INSTR(email, '@')</code> finds where the @ is</li>
<li><code>+ 1</code> moves one step past it, to the first letter of the domain</li>
<li><code>SUBSTR(email, that_position)</code> takes everything from there to the end</li>
</ol>
<p>Put together: <code>SUBSTR(email, INSTR(email, '@') + 1)</code>.</p>`
    },
    {
      type: 'try',
      title: 'Email providers: the first attempt',
      body: `<p>There are <b>six</b> rows: hotmail.com, yahoo.com, gmail.com, and then <b>YAHOO.COM</b>, <b>GMAIL.COM</b> and <b>HOTMAIL.COM</b> in capitals. SQL treats <code>gmail.com</code> and <code>GMAIL.COM</code> as different values, so the same provider is split into two rows, and your numbers would be wrong.</p>`,
      code: `SELECT SUBSTR(email, INSTR(email, '@') + 1) AS domain,
       COUNT(*) AS customers
FROM customers
WHERE email IS NOT NULL
GROUP BY domain
ORDER BY customers DESC;`
    },
    {
      type: 'try',
      title: 'Email providers: cleaned',
      body: `<p>Wrap the domain in <code>LOWER( ... )</code> and the six rows collapse into the <b>three</b> real providers. Hotmail has 663, Yahoo 661, Gmail 618. This is the true picture, and now it chart-ready.</p>`,
      chart: 'bar',
      chartTitle: 'Customers per email provider (cleaned)',
      code: `SELECT LOWER(SUBSTR(email, INSTR(email, '@') + 1)) AS domain,
       COUNT(*) AS customers
FROM customers
WHERE email IS NOT NULL
GROUP BY domain
ORDER BY customers DESC;`
    },
    {
      id: 'sql-2-9-c1',
      type: 'check',
      title: 'Which function removes spaces from the start and end of a piece of text?',
      body: `<p>The name says what it does.</p>`,
      options: ['LENGTH', 'REPLACE', 'TRIM', 'INSTR'],
      answer: 2,
      why: [
        'LENGTH only counts characters. It doesn’t change the text.',
        'REPLACE swaps specific pieces of text. TRIM is the tool made for removing spaces at the ends.',
        'Yes! TRIM removes the spaces from both ends. It’s a favourite for cleaning typed data.',
        'INSTR finds a position in the text. It doesn’t change the text.'
      ]
    },
    {
      id: 'sql-2-9-ex1',
      type: 'exercise',
      title: 'Your turn: how many providers, really?',
      body: `<p>Return <b>two numbers</b> in one row: the number of different email domains <b>before cleaning</b> (<code>raw_domains</code>) and <b>after lowercasing</b> (<code>clean_domains</code>). Use <code>COUNT(DISTINCT ...)</code> on the domain expression.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `COUNT(DISTINCT SUBSTR(email, INSTR(email, '@') + 1)) is the raw one. Wrap the SUBSTR in LOWER for the clean one.`,
        `SELECT COUNT(DISTINCT SUBSTR(email, INSTR(email, '@') + 1)) AS raw_domains, COUNT(DISTINCT LOWER(SUBSTR(email, INSTR(email, '@') + 1))) AS clean_domains FROM customers;`
      ],
      solution: `SELECT COUNT(DISTINCT SUBSTR(email, INSTR(email, '@') + 1)) AS raw_domains, COUNT(DISTINCT LOWER(SUBSTR(email, INSTR(email, '@') + 1))) AS clean_domains FROM customers;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The first-name bug',
      body: `<p>Now to the campaign greeting: <i>“Hello Steven!”</i> The obvious recipe is “everything before the first space.” <code>SUBSTR(name, 1, INSTR(name, ' ') - 1)</code> means: start at position 1, and take as many characters as there are before the first space.</p>
<p>It works beautifully on <i>Alex Spencer</i>. Let’s see what happens with the ones that have titles.</p>`
    },
    {
      type: 'try',
      title: 'Where the recipe breaks',
      body: `<p>For Dr. Steven Martin, the “first name” is <b>“Dr.”</b>. The campaign would greet him with <i>“Hello Dr.!”</i>. About <b>38</b> customers have a title (Mr., Mrs., Ms., Miss or Dr.), and a script that trusts this recipe would embarrass the company 38 times.</p>`,
      code: `SELECT customer_id,
       customer_name,
       SUBSTR(customer_name, 1, INSTR(customer_name, ' ') - 1) AS naive_first_name
FROM customers
WHERE customer_name LIKE 'Dr. %'
LIMIT 5;`
    },
    {
      type: 'try',
      title: 'The fix: remove the titles first',
      body: `<p>We nest several <code>REPLACE</code> calls, each one deleting one title (swapping it for nothing, <code>''</code>). The innermost runs first. Compare the two columns: titles gone.</p>
<div class="callout tip"><b>Honest note:</b> 41 names also carry suffixes like <code>MD</code> or <code>PhD</code> (“Miss Debra Williams PhD”), which this does not remove. Real cleaning is never 100% finished. You decide what is <b>good enough</b>, write down what you left alone, and move on. (Module 5 shows how CTEs make long cleaning steps like this far easier to read.)</div>`,
      code: `SELECT customer_name,
       REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(customer_name,
         'Mrs. ', ''), 'Mr. ', ''), 'Ms. ', ''), 'Miss ', ''), 'Dr. ', '') AS name_without_title
FROM customers
WHERE customer_name LIKE 'Dr. %'
   OR customer_name LIKE 'Mrs. %'
   OR customer_name LIKE 'Miss %'
LIMIT 6;`
    },
    {
      id: 'sql-2-9-ex2',
      type: 'exercise',
      title: 'Your turn: remove “Dr. ”',
      body: `<p>Show <code>customer_id</code> and the name with <b>“Dr. ”</b> removed (call it <code>clean_name</code>), for all customers whose name <b>starts with “Dr. ”</b>. (Note the space after the dot.)</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Use REPLACE(customer_name, 'Dr. ', '') and filter with LIKE 'Dr. %'.`,
        `SELECT customer_id, REPLACE(customer_name, 'Dr. ', '') AS clean_name FROM customers WHERE customer_name LIKE 'Dr. %';`
      ],
      solution: `SELECT customer_id, REPLACE(customer_name, 'Dr. ', '') AS clean_name FROM customers WHERE customer_name LIKE 'Dr. %';`,
      ordered: false
    },
    {
      id: 'sql-2-9-ex3',
      type: 'exercise',
      title: 'Your turn: find the product families',
      body: `<p>Products with “(V2)” in their name are newer versions of other products. Show <code>product_id</code> and the name with <b>“ (V2)”</b> removed (call it <code>base_name</code>) for the <b>first 10</b> products whose name ends with “(V2)”.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `REPLACE(product_name, ' (V2)', '') with a WHERE using LIKE '%(V2)', then LIMIT 10.`,
        `SELECT product_id, REPLACE(product_name, ' (V2)', '') AS base_name FROM products WHERE product_name LIKE '%(V2)' LIMIT 10;`
      ],
      solution: `SELECT product_id, REPLACE(product_name, ' (V2)', '') AS base_name FROM products WHERE product_name LIKE '%(V2)' LIMIT 10;`,
      ordered: true
    },
    {
      id: 'sql-2-9-ex4',
      type: 'exercise',
      title: 'Your turn: tidy the shouting emails',
      body: `<p>Show <code>customer_id</code>, the original <code>email</code>, and a cleaned version called <code>clean_email</code> (lowercase, with spaces trimmed), for the <b>first 5 customers</b> whose email exists but is <b>not already lowercase</b>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `LOWER(TRIM(email)) for the clean version. The filter is: email IS NOT NULL AND email <> LOWER(email).`,
        `SELECT customer_id, email, LOWER(TRIM(email)) AS clean_email FROM customers WHERE email IS NOT NULL AND email <> LOWER(email) LIMIT 5;`
      ],
      solution: `SELECT customer_id, email, LOWER(TRIM(email)) AS clean_email FROM customers WHERE email IS NOT NULL AND email <> LOWER(email) LIMIT 5;`,
      ordered: true
    },
    {
      id: 'sql-2-9-ex5',
      type: 'exercise',
      title: 'Challenge: Gmail users per country',
      body: `<p>Marketing wants a Gmail campaign plan. For each <code>country</code>, show how many customers use <b>Gmail</b> (call it <code>gmail_users</code>), counting both <code>gmail.com</code> and <code>GMAIL.COM</code>. Use the cleaned domain. Biggest first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `WHERE LOWER(SUBSTR(email, INSTR(email, '@') + 1)) = 'gmail.com', then GROUP BY country.`,
        `SELECT country, COUNT(*) AS gmail_users FROM customers WHERE LOWER(SUBSTR(email, INSTR(email, '@') + 1)) = 'gmail.com' GROUP BY country ORDER BY gmail_users DESC;`
      ],
      solution: `SELECT country, COUNT(*) AS gmail_users FROM customers WHERE LOWER(SUBSTR(email, INSTR(email, '@') + 1)) = 'gmail.com' GROUP BY country ORDER BY gmail_users DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Rules of the cleaning game, and other databases',
      body: `<div class="callout tip"><b>Four rules every analyst follows:</b>
<ol>
<li><b>Never overwrite raw data.</b> Clean in your query, or in a new column. Keep the original so you can always go back.</li>
<li><b>Look before you clean.</b> Use <code>DISTINCT</code>, counts and <code>LIKE</code> to find the mess first.</li>
<li><b>Decide what “good enough” means,</b> and write down what you left alone.</li>
<li><b>Check your result</b> by comparing before and after, like you did here.</li>
</ol></div>
<div class="callout work"><b>In other databases:</b> the same jobs have other names. <b>PostgreSQL</b> has <code>SPLIT_PART(email, '@', 2)</code> to get the domain, <code>POSITION</code>, <code>ILIKE</code> for case-insensitive search, and powerful pattern matching with regular expressions. <b>SQL Server</b> uses <code>CHARINDEX</code> and <code>LEN</code> and <code>SUBSTRING</code>. <b>MySQL</b> has <code>SUBSTRING_INDEX</code>. Different spellings, same idea.</div>`
    },
    {
      type: 'explain',
      title: 'Module 2 complete: you now speak real SQL',
      body: `<p>In nine lessons you went from “what is a SELECT?” to analysing a company. You can now:</p>
<ul>
<li>Choose, rename, calculate and de-duplicate with <code>SELECT</code></li>
<li>Filter precisely with <code>WHERE</code>, <code>AND</code>/<code>OR</code>, <code>IN</code>, <code>BETWEEN</code> and <code>LIKE</code></li>
<li>Sort and take top-N with <code>ORDER BY</code>, <code>LIMIT</code> and <code>OFFSET</code></li>
<li>Calculate safely with <code>ROUND</code> and decimal-aware division</li>
<li>Summarise with aggregates, <code>GROUP BY</code> and <code>HAVING</code>, and chart the results</li>
<li>Make decisions with <code>CASE WHEN</code>, and build rates and pivots</li>
<li>Work with dates and trends, and clean messy text</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>How would you extract the domain from an email address?</li>
<li>Why is it important not to overwrite the original data when cleaning?</li>
<li>Two columns look identical when you group by them, but SQL counts them as separate groups. What is the likely cause?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Find the @ with INSTR, then take everything after it with SUBSTR: <code>SUBSTR(email, INSTR(email, '@') + 1)</code> (or <code>SPLIT_PART(email, '@', 2)</code> in PostgreSQL).</p>
<p><b>2.</b> The raw data is the source of truth. If cleaning goes wrong, or the rules change, you need the original to start again, and others may depend on it. Clean in a copy or in the query.</p>
<p><b>3.</b> Hidden differences in the text: different capitalisation, extra spaces or invisible characters. Fix with <code>LOWER</code> and <code>TRIM</code> before grouping.</p>
</details>
<p><b>Coming next, Module 3: Joins, the heart of relational analysis.</b> Until now every query used a single table. Real questions need several at once: “What did customers from Kenya actually buy?” “Which products sell best?” “Which orders have no delivery?” You’ll learn all the join types, the traps that quietly inflate revenue, and why TradeFlow’s 147 duplicate order lines matter.</p>`
    }
  ]
}
);
