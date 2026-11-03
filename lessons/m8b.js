LESSONS.push(
{
  id: 'sql-8-4',
  track: 'sql',
  title: '8.4 RFM segmentation: who are your best customers?',
  tables: ['customers', 'orders', 'payments'],
  intro: `Picture a Monday morning at TradeFlow. The marketing manager stops by your desk with a coffee and a problem: <i>“I can afford to send one special email campaign this month. Who should get it?”</i><br><br>You have 1,982 customers who have ever bought something. The lazy answer is “everybody”. But think about what that really means. Some of those people ordered last week and would have bought anyway, so the email is wasted on them. Some haven’t ordered in two years and will never open it. And a small group used to be wonderful customers and are <b>quietly slipping away</b>. Those are the people you most want to catch, and “everybody” hides them in the crowd.<br><br>So today you learn how analysts sort a crowd of customers into a few <b>groups that each deserve a different message</b>. The method is called <b>RFM</b>. It sounds fancy, but it is only three simple questions, and you already know almost all the SQL you need. We will build it slowly, one small piece at a time, and read every query out loud together so nothing feels like magic.`,
  steps: [
    {
      type: 'explain',
      title: 'Two customers who look alike, but are not',
      body: `<p>Let’s start with two real TradeFlow customers.</p>
<p><b>Customer 5</b> has placed 6 orders and spent about 1.2 million. <b>Customer 2</b> has placed 5 orders and spent about 543 thousand. On “number of orders”, they look almost the same. Two regular customers, right?</p>
<p>Not quite. Customer 5 last ordered <b>100 days ago</b>. Customer 2 last ordered <b>577 days ago</b>, which is nearly a year and a half. Customer 5 is still part of the family. Customer 2 has almost certainly drifted away.</p>
<p>Your gut can feel that difference immediately. The trouble is that you can’t read 1,982 customers one by one with your gut. RFM is a way of teaching the computer to notice what your gut notices, for <b>every</b> customer at once.</p>`
    },
    {
      type: 'explain',
      title: 'The three questions behind RFM',
      body: `<div class="callout analogy"><b>The big idea:</b> imagine the owner of a small coffee shop. She doesn’t keep a spreadsheet, yet she knows exactly who her best customers are. If you asked her how she knows, she would say something like: <i>“Well, she was in this morning. He comes every single day. And that lady always buys cakes for the whole office.”</i> Without realising it, she asked three questions about each person.</div>
<p>RFM is just those three questions, written down with letters:</p>
<table class="mini">
<tr><th>Letter</th><th>The question</th><th>How we measure it in TradeFlow</th></tr>
<tr><td><b>R</b> for Recency</td><td>How long ago did they last buy?</td><td>Days between their newest order and the end of our data</td></tr>
<tr><td><b>F</b> for Frequency</td><td>How often do they buy?</td><td>How many orders they have placed</td></tr>
<tr><td><b>M</b> for Monetary</td><td>How much money do they bring?</td><td>Total payments on orders that actually stuck</td></tr>
</table>
<p>That is the whole idea. Everything else in this lesson is just doing those three measurements for every customer, turning them into simple scores, and giving the groups friendly names.</p>
<div class="callout tip"><b>One decision to make before we start:</b> “how long ago” needs a “today”. Our data ends on <b>2026-06-30</b>, so we will treat that as today. Think of it as taking a <b>photograph of the business on that day</b>. We won’t use the real calendar date, because then every number would change a little each morning and a colleague who re-runs your query next week would get a different answer. A photograph never changes, and that is exactly what we want.</div>`
    },
    {
      type: 'explain',
      title: 'Recency, part 1: two small tools',
      body: `<p>To measure “days since the last order” we need two small tools.</p>
<p><b>Tool 1: finding the latest order.</b> A customer may have many orders. The function <code>MAX(order_date)</code> looks at all of them and hands back the newest date. (Dates in our data look like <code>2026-03-22</code>, with the year first, so the “biggest” date is always the newest one.)</p>
<p><b>Tool 2: subtracting dates.</b> Here is a surprise: a computer sees <code>'2026-06-30'</code> as plain text, a little string of characters, so you can’t simply subtract one date from another. The fix is a function called <code>julianday()</code>. It turns any date into <b>one long running count of days</b>, like a giant calendar counter. Once two dates are numbers, subtracting them gives you the number of days between them. Let’s see it work.</p>`
    },
    {
      type: 'try',
      title: 'Turning dates into numbers',
      body: `<p>Run it and read the result. The first two columns are the “day counters” for 30 June and 1 June 2026 (the long numbers are not important, only the gap between them is). The third column subtracts them and gives <b>29</b>, which is exactly how many days sit between 1 June and 30 June. You just did date arithmetic.</p>`,
      code: `SELECT julianday('2026-06-30') AS day_counter_june_30,
       julianday('2026-06-01') AS day_counter_june_1,
       julianday('2026-06-30') - julianday('2026-06-01') AS days_between;`
    },
    {
      type: 'try',
      title: 'Customer 5: find the newest order by eye',
      body: `<p>Before we let SQL do it for every customer, let’s do it once by eye. Here are all the orders of customer 5, newest first. The top row is their latest order: <b>22 March 2026</b>. That is the date <code>MAX(order_date)</code> will find for us.</p>`,
      code: `SELECT order_id, order_date, order_status
FROM orders
WHERE customer_id = 5
ORDER BY order_date DESC;`
    },
    {
      type: 'try',
      title: 'Now let SQL do it, for customers 2 and 5',
      body: `<p>Read this query out loud, line by line:</p>
<ol>
<li><b>FROM orders WHERE customer_id IN (2, 5)</b>: “start with the orders of customers 2 and 5 only.”</li>
<li><b>GROUP BY customer_id</b>: “sort those orders into one pile per customer.” (Think of two piles of paper receipts on a desk.)</li>
<li><b>MAX(order_date)</b>: “in each pile, find the newest date.”</li>
<li><b>julianday('2026-06-30') - julianday(MAX(order_date))</b>: “turn both dates into day counters and subtract.” This gives days with decimals, so <b>CAST(... AS INTEGER)</b> chops the decimals off and keeps whole days.</li>
</ol>
<p>The answer matches our gut feeling: customer 5 is <b>100 days</b> away from their last order, customer 2 is <b>577 days</b> away.</p>`,
      code: `SELECT customer_id,
       MAX(order_date) AS latest_order,
       CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days
FROM orders
WHERE customer_id IN (2, 5)
GROUP BY customer_id
ORDER BY customer_id;`
    },
    {
      id: 'sql-8-4-c1',
      type: 'check',
      title: 'Why do we type 2026-06-30 instead of asking the computer for today’s date?',
      body: `<p>Think about a colleague re-running your query a month from now.</p>`,
      options: ['Because SQLite has no way to get today’s date', 'So the result is reproducible, and it matches the last day our data actually covers', 'Because dates in TradeFlow are stored as numbers', 'It makes the query run faster'],
      answer: 1,
      why: [
        'SQLite can do it with date(\'now\'). The real reason is different: our data stops on 2026-06-30, and a moving “today” would make every customer look a little more inactive each day.',
        'Exactly! A fixed “photograph date” means the same query gives the same answer tomorrow, next month and on your colleague’s computer. It also stops customers looking “lost” just because the calendar moved on.',
        'TradeFlow dates are text in YYYY-MM-DD form. That is why we needed julianday() in the first place.',
        'Speed has nothing to do with it. Repeatable answers do.'
      ]
    },
    {
      id: 'sql-8-4-ex1',
      type: 'exercise',
      title: 'Your turn: recency for the first five customers',
      body: `<p>Same recipe as above, but for <b>every</b> customer, keeping only the first five. Return <code>customer_id</code> and <code>recency_days</code>, ordered by <code>customer_id</code>, with <code>LIMIT 5</code>.</p>
<p><b>Think before you type:</b> you need one pile per customer (GROUP BY), the newest date in each pile (MAX), and the day-gap to 2026-06-30 (julianday, then CAST). You don’t need the WHERE line this time, because you want all customers.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Start with SELECT customer_id FROM orders GROUP BY customer_id. Then add a second column: the julianday of '2026-06-30' minus the julianday of MAX(order_date).`,
        `Wrap the subtraction in CAST(... AS INTEGER) and call it recency_days. Finish with ORDER BY customer_id LIMIT 5.`,
        `SELECT customer_id, CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days FROM orders GROUP BY customer_id ORDER BY customer_id LIMIT 5;`
      ],
      solution: `SELECT customer_id, CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days FROM orders GROUP BY customer_id ORDER BY customer_id LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Frequency and Monetary: the easy two',
      body: `<p><b>Frequency</b> is the simplest of all. After <code>GROUP BY customer_id</code> gives us one pile per customer, <code>COUNT(*)</code> just counts the receipts in each pile. Six receipts, frequency 6.</p>
<p><b>Monetary</b> needs a little care, for two reasons.</p>
<p>First, <b>the money isn’t in the orders table</b>. It lives in <code>payments</code>, so we <code>JOIN</code> the two tables on <code>order_id</code> (you did this in Module 3).</p>
<p>Second, <b>not every payment is real money kept</b>. Remember from Lesson 8.1: some orders were Cancelled or Returned. If a customer cancels, we never really earned that money, so counting it would make them look better than they are. We only want to add up payments on orders whose status is <b>Completed</b> or <b>Processing</b>. This is exactly the “net revenue” definition we used in Lesson 8.1, so our numbers will agree with it.</p>
<p>How do we add up “only some” payments? With a little gate inside the sum: <code>SUM(CASE WHEN order_status IN ('Completed','Processing') THEN amount ELSE 0 END)</code>. Read it as: <i>“for each payment, if the order stuck, add the amount; otherwise add zero.”</i> You met this “conditional sum” in Lesson 2.7. Let’s see it catch a real difference.</p>`
    },
    {
      type: 'try',
      title: 'Where the gate matters: customer 6',
      body: `<p>Look at the last row. Customer 6 placed 3 orders and has <b>691,054.51</b> of payments in total, but only <b>579,680.58</b> of that came from orders that stuck. The other 111,373.93 belongs to a Cancelled or Returned order. That is the money the gate keeps out. For customers 2 and 5, every order stuck, so both columns match.</p>`,
      code: `SELECT o.customer_id,
       COUNT(*) AS orders_placed,
       ROUND(SUM(p.amount), 2) AS all_payments,
       ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS money_that_stuck
FROM orders o
JOIN payments p ON p.order_id = o.order_id
WHERE o.customer_id IN (2, 5, 6)
GROUP BY o.customer_id
ORDER BY o.customer_id;`
    },
    {
      type: 'try',
      title: 'R, F and M together, for the first ten customers',
      body: `<p>Now we put the three measurements in one table. Notice we wrap the query in a <b>CTE</b> called <code>rfm</code>. A CTE is just a <b>named scratch pad</b>: “do this calculation first, call the result rfm, and let me use it below.” It keeps the query readable, and in a moment we will build more steps on top of it.</p>
<p>Scan the ten rows. You can already feel the story: customer 5 (100 days, 6 orders, 1.2 million) looks healthy, customer 6 (741 days away) looks gone.</p>`,
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
      type: 'explain',
      title: 'Look at the crowd before you judge it',
      body: `<p>A good analyst never jumps straight to scoring. First <b>look at the shape of the data</b>, the way you glance around a room before you start speaking. For recency, a manager finds bands easier to picture than raw days: “bought in the last 3 months”, “last 6 months”, “last year”, “longer ago than that”. We can make those bands with <code>CASE WHEN</code>.</p>`
    },
    {
      type: 'try',
      title: 'How long since our customers last bought?',
      body: `<p>Read the bars as a story. <b>606</b> customers are active (bought within 90 days). <b>466</b> customers, nearly a quarter of everyone who ever bought, have <b>not ordered for more than a year</b>. That one picture already tells the manager that a big slice of the customer base is asleep. Press <b>Chart it</b> to see it.</p>`,
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
      title: 'Your turn: how many customers are inactive?',
      body: `<p>How many customers have <b>not ordered for more than 365 days</b>? Return one number called <code>inactive_customers</code>.</p>
<p><b>Think before you type:</b> this is a two-step question. Step one: work out recency per customer (you already did this). Step two: count how many of those recency numbers are bigger than 365. A CTE is perfect: build the recency in the scratch pad, then count from it.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Scratch pad first: WITH r AS (SELECT customer_id, ... AS recency_days FROM orders GROUP BY customer_id). Then below it, a plain SELECT that counts rows from r.`,
        `The counting part is SELECT COUNT(*) AS inactive_customers FROM r WHERE recency_days > 365.`,
        `WITH r AS (SELECT customer_id, CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days FROM orders GROUP BY customer_id) SELECT COUNT(*) AS inactive_customers FROM r WHERE recency_days > 365;`
      ],
      solution: `WITH r AS (SELECT customer_id, CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days FROM orders GROUP BY customer_id) SELECT COUNT(*) AS inactive_customers FROM r WHERE recency_days > 365;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'From big messy numbers to simple scores',
      body: `<p>We now have three numbers per customer, but they live on completely different scales: days, order counts and money in the hundreds of thousands. You can’t compare “165 days” with “420,553.01” directly. So RFM converts each measurement into a <b>simple score from 1 to 4</b>, where <b>4 always means “great” and 1 always means “weak”</b>.</p>
<div class="callout analogy"><b>The big idea:</b> imagine you line up 8 friends by height, shortest on the left, tallest on the right, and then split the line into 4 groups of 2 people. The two shortest are group 1, the next two are group 2, and so on. Nobody needs to know anyone’s exact height anymore: “group 4” already tells you “among the tallest”. SQL has a function that does precisely this splitting, called <code>NTILE</code>.</div>
<p><code>NTILE(4) OVER (ORDER BY something)</code> reads: “line everyone up by <i>something</i>, then cut the line into 4 equal groups and tell me each person’s group number.” (It is a window function, from Module 6.) Let’s watch it work on a tiny example before we trust it with 1,982 customers.</p>`
    },
    {
      type: 'try',
      title: 'NTILE on eight friends',
      body: `<p>Eight friends, four groups. Ada and Ben are the shortest, so they get group 1. Gus and Hal are the tallest, so they get group 4. Exactly what we pictured. (The <code>VALUES</code> part just lets us write a tiny table by hand.)</p>`,
      code: `WITH friends(person, height_cm) AS (
    VALUES ('Ada', 150), ('Ben', 155), ('Chi', 160), ('Dee', 165),
           ('Eli', 170), ('Fay', 175), ('Gus', 180), ('Hal', 185)
)
SELECT person,
       height_cm,
       NTILE(4) OVER (ORDER BY height_cm) AS group_number
FROM friends
ORDER BY height_cm;`
    },
    {
      type: 'explain',
      title: 'The direction trap: which end is “good”?',
      body: `<p>With frequency and money, <b>bigger is better</b>: someone with more orders or more spending is a better customer. So we line them up from smallest to biggest, and the biggest end gets group 4. 👍</p>
<p>But recency is the other way round! A customer who ordered <b>3 days ago</b> is better than one who ordered <b>700 days ago</b>, so here <b>a smaller number is better</b>. If we lined up recency from smallest to biggest, the freshest customers would land in group 1, which we have agreed means “weak”. Our scores would be upside down, and our “best” customers would actually be the ones who left!</p>
<p>The fix is to line recency up in <b>reverse</b> with <code>ORDER BY recency_days DESC</code>: the longest-gone customers go first (group 1) and the most recent go last (group 4). Watch the same eight friends lined up in reverse:</p>`
    },
    {
      type: 'try',
      title: 'Reverse the line, and the groups flip',
      body: `<p>Same friends, but now <code>ORDER BY height_cm DESC</code>. Ada, the shortest, is suddenly in group 4, and Hal, the tallest, is in group 1. The direction of the ORDER BY decides which end of the line becomes “4”. For recency we want the most recent customers at that end, which is why we use <code>DESC</code>.</p>`,
      code: `WITH friends(person, height_cm) AS (
    VALUES ('Ada', 150), ('Ben', 155), ('Chi', 160), ('Dee', 165),
           ('Eli', 170), ('Fay', 175), ('Gus', 180), ('Hal', 185)
)
SELECT person,
       height_cm,
       NTILE(4) OVER (ORDER BY height_cm DESC) AS group_number
FROM friends
ORDER BY height_cm;`
    },
    {
      id: 'sql-8-4-c3',
      type: 'check',
      title: 'Which line-up gives the most recent customers a recency score of 4?',
      body: `<p>Remember: NTILE gives group 1 to whoever is <b>first</b> in the line and group 4 to whoever is <b>last</b>. Recency is measured in “days since last order”.</p>`,
      options: ['NTILE(4) OVER (ORDER BY recency_days)', 'NTILE(4) OVER (ORDER BY recency_days DESC)', 'NTILE(4) OVER (ORDER BY customer_id)', 'It makes no difference'],
      answer: 1,
      why: [
        'Careful: this puts the smallest number of days (the freshest customers) first, so they would get group 1, the “weak” score. Upside down!',
        'Yes! DESC puts the biggest gaps (the customers who left long ago) first, so they get 1, and the freshest customers end up last with 4.',
        'That lines customers up by their id number, which has nothing to do with how recently they bought.',
        'It makes a huge difference: one direction gives sensible scores, the other gives upside-down scores.'
      ]
    },
    {
      type: 'try',
      title: 'Scoring the first ten customers',
      body: `<p>Now we do the same with real customers: three NTILE columns, one for each of R, F and M, and a little <code>r || f || m</code> that glues the three digits into a short code (the <code>||</code> sign means “stick these together as text”).</p>
<p>Read a few rows:</p>
<ul>
<li><b>Customer 5: code 334.</b> Recent (3), orders often (3), spends a lot (4). A great customer.</li>
<li><b>Customer 9: code 344.</b> Even better on frequency.</li>
<li><b>Customer 2: code 122.</b> The recency score is 1: they are among the longest-gone customers.</li>
<li><b>Customer 6: code 112.</b> Gone for 741 days, few orders, modest money.</li>
</ul>
<p>You may also notice <code>customer_id</code> inside every ORDER BY. That is a <b>tie-breaker</b>, a polite way of saying: “if two customers have exactly the same value, put the lower id first, so the answer is the same every time.”</p>`,
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
      id: 'sql-8-4-ex3',
      type: 'exercise',
      title: 'Your turn: how are the recency scores spread?',
      body: `<p>Let’s check that the R score does what we claim. For each R score from 1 to 4, return: <code>r</code>, <code>customers</code> (how many are in that group), <code>newest_days</code> (the <b>smallest</b> recency in the group) and <code>oldest_days</code> (the <b>largest</b>). Order by <code>r</code>.</p>
<p><b>Think before you type:</b> the first scratch pad (<code>rfm</code>) is already written for you in the starter. You add a second one, <code>scored</code>, that calculates <code>NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r</code>. Then the final query groups by <code>r</code> and uses COUNT, MIN and MAX. If the scores work, group 1 should hold the oldest recency numbers and group 4 the newest.</p>`,
      starter: `-- Write your query below\n\nWITH rfm AS (\n    SELECT customer_id,\n           CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days\n    FROM orders\n    GROUP BY customer_id\n)\n-- add a scored CTE, then the final SELECT\nSELECT * FROM rfm LIMIT 5;\n`,
      hints: [
        `After the rfm scratch pad, add a comma and a second one: scored AS (SELECT customer_id, recency_days, NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r FROM rfm).`,
        `The final query is SELECT r, COUNT(*) AS customers, MIN(recency_days) AS newest_days, MAX(recency_days) AS oldest_days FROM scored GROUP BY r ORDER BY r;`,
        `WITH rfm AS (SELECT customer_id, CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days FROM orders GROUP BY customer_id), scored AS (SELECT customer_id, recency_days, NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r FROM rfm) SELECT r, COUNT(*) AS customers, MIN(recency_days) AS newest_days, MAX(recency_days) AS oldest_days FROM scored GROUP BY r ORDER BY r;`
      ],
      solution: `WITH rfm AS (SELECT customer_id, CAST(julianday('2026-06-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days FROM orders GROUP BY customer_id), scored AS (SELECT customer_id, recency_days, NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r FROM rfm) SELECT r, COUNT(*) AS customers, MIN(recency_days) AS newest_days, MAX(recency_days) AS oldest_days FROM scored GROUP BY r ORDER BY r;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'An honest warning: NTILE and ties',
      body: `<div class="callout watch"><b>Picture a race.</b> Four runners cross the line at exactly the same time. Should one get gold, one silver, one bronze and one nothing? Of course not, they tied. But NTILE is like a very strict race official who insists on <b>equal-sized groups no matter what</b>. If many customers share the same value, NTILE still has to split them into different groups, and it uses our tie-breaker (customer_id) to decide who goes where.</div>
<p>Is this a real problem for us? Let’s find out. In TradeFlow, <b>384 customers have placed exactly 4 orders</b>. Same value, so they should all get the same frequency score. Do they?</p>`
    },
    {
      type: 'try',
      title: 'Same number of orders, different scores',
      body: `<p>Look at the <code>fewest_orders</code> and <code>most_orders</code> columns. The F=1 group covers customers with 1 up to <b>4</b> orders. The F=2 group starts at <b>4</b> orders too. So some customers with exactly 4 orders got F=1, and others with exactly 4 orders got F=2, purely because of their id numbers. (Customers 3, 4 and 11 got F=1, while customers 20, 23 and 31 got F=2, all with 4 orders.)</p>
<p>That isn’t fair, and a good analyst says so out loud rather than hiding it.</p>`,
      code: `WITH rfm AS (
    SELECT customer_id,
           COUNT(*) AS frequency
    FROM orders
    GROUP BY customer_id
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
      title: 'The professional fix: write the thresholds yourself',
      body: `<p>When a measurement has lots of ties, many teams skip NTILE and simply <b>write the cut-offs down</b>: 1 to 2 orders is score 1, 3 to 4 is score 2, 5 to 6 is score 3, 7 or more is score 4. Now anyone with 4 orders gets the same score, always, and anyone can read the rule and agree or disagree with it. The groups come out uneven (213, 664, 628 and 477 customers), and that is fine, because that is how the customers really are.</p>
<p>For the rest of this lesson we keep NTILE, because it works on any data without you choosing cut-offs. But now you know when to reach for the fixed-threshold method instead.</p>`,
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
      type: 'explain',
      title: 'From scores to names a manager can use',
      body: `<p>A code like “334” makes sense to an analyst. The marketing manager wants words: “who are my best customers?” So we translate score combinations into <b>six named segments</b> using a <code>CASE WHEN</code>.</p>
<p>Think of CASE as a <b>bouncer with a list</b>. The bouncer reads the rules from top to bottom, and the moment a customer matches a rule, he stamps that name on them and stops reading. That is why the <b>order of the rules matters</b>: the most special groups come first, and “everyone else” comes last.</p>
<table class="mini">
<tr><th>Rule (checked top to bottom)</th><th>Segment</th><th>In everyday words</th></tr>
<tr><td>R is 3 or 4, and F is 3 or 4, and M is 3 or 4</td><td><b>Champions</b></td><td>Bought recently, buy often, spend a lot</td></tr>
<tr><td>R is 3 or 4, and F is 2 or more</td><td><b>Loyal</b></td><td>Bought recently and come back regularly</td></tr>
<tr><td>R is 1 or 2, and F is 3 or 4, and M is 3 or 4</td><td><b>At risk</b></td><td>Used to be great, but have gone quiet</td></tr>
<tr><td>R is 1, and F is 1 or 2</td><td><b>Lost</b></td><td>Gone for a long time, never very active</td></tr>
<tr><td>R is 3 or 4, and F is 1</td><td><b>New or promising</b></td><td>Bought recently, but only a few times so far</td></tr>
<tr><td>anyone left over</td><td><b>Needs attention</b></td><td>The middle group that fits none of the above</td></tr>
</table>
<p>Let’s test the bouncer on customers we already know. Customer 5 is <b>334</b>: R=3, F=3, M=4, so the very first rule matches and they are a <b>Champion</b>. Customer 2 is <b>122</b>: R=1 and F=2, so the “Lost” rule catches them. Does the SQL agree with us?</p>`
    },
    {
      type: 'try',
      title: 'Where do customers 1 to 5 land?',
      body: `<p>Read down the last column. Customer 5 is a <b>Champion</b>, customer 2 is <b>Lost</b>, exactly as we predicted by hand. Customers 1 and 4 are <b>New or promising</b>: recent, but only a few orders. Customer 3 is <b>Needs attention</b>: R=2 and F=1 fit none of the named rules, so the bouncer’s “everyone else” rule catches them.</p>`,
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
SELECT customer_id, r, f, m, segment
FROM segmented
WHERE customer_id IN (1, 2, 3, 4, 5)
ORDER BY customer_id;`
    },
    {
      type: 'try',
      title: 'The whole customer base, in six groups',
      body: `<p>Now the same query, but grouped to show all 1,982 customers at once. This is the moment the manager’s question gets answered. Read it like a story:</p>
<ul>
<li><b>Champions:</b> 494 customers, a quarter of the customer base, bring <b>38.5%</b> of the money. Thank them and protect them.</li>
<li><b>At risk:</b> just 271 customers, yet worth <b>20.0%</b> of revenue (about 284.5 million). They used to be wonderful and have gone quiet. <b>This is the group to rescue.</b></li>
<li><b>Lost:</b> 360 customers, only <b>10.7%</b> of revenue. Not worth an expensive campaign.</li>
<li><b>New or promising:</b> 143 customers, 3.7% of revenue so far, but these are the ones you can still turn into loyal buyers.</li>
</ul>
<p>So the answer to “who gets the email?” is no longer “everybody”. It is a plan: <i>rescue the At risk group first.</i> Press <b>Chart it</b> to see the sizes.</p>`,
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
      title: 'Your turn: build the segments yourself',
      body: `<p>Now you build the bouncer. Return <code>segment</code> and <code>customers</code> (how many customers in each), ordered by <code>customers</code> from largest to smallest, and then by <code>segment</code> A to Z so ties are settled.</p>
<p><b>Think before you type:</b> the starter already contains the first two scratch pads, <code>rfm</code> and <code>scored</code>. Your job has two parts. <b>Part 1:</b> add a third scratch pad called <code>segmented</code> that adds a <code>segment</code> column using the CASE from the table above. <b>Part 2:</b> write the final query that counts customers per segment. Keep the rules in the same order as the table, because the bouncer reads top to bottom. And remember the comma after the <code>scored</code> pad.</p>`,
      starter: `-- Write your query below\n\nWITH rfm AS (\n    SELECT o.customer_id,\n           CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days,\n           COUNT(*) AS frequency,\n           ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary\n    FROM orders o\n    JOIN payments p ON p.order_id = o.order_id\n    GROUP BY o.customer_id\n),\nscored AS (\n    SELECT *,\n           NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r,\n           NTILE(4) OVER (ORDER BY frequency, customer_id) AS f,\n           NTILE(4) OVER (ORDER BY monetary, customer_id) AS m\n    FROM rfm\n)\n-- add the segmented CTE here (remember the comma above), then the final SELECT\nSELECT * FROM scored LIMIT 5;\n`,
      hints: [
        `After the scored pad add a comma, then: segmented AS (SELECT *, CASE WHEN r >= 3 AND f >= 3 AND m >= 3 THEN 'Champions' WHEN ... ELSE 'Needs attention' END AS segment FROM scored). Follow the table row by row.`,
        `Once the pad exists, the final query is: SELECT segment, COUNT(*) AS customers FROM segmented GROUP BY segment ORDER BY customers DESC, segment;`,
        `WITH rfm AS (SELECT o.customer_id, CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days, COUNT(*) AS frequency, ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary FROM orders o JOIN payments p ON p.order_id = o.order_id GROUP BY o.customer_id), scored AS (SELECT *, NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r, NTILE(4) OVER (ORDER BY frequency, customer_id) AS f, NTILE(4) OVER (ORDER BY monetary, customer_id) AS m FROM rfm), segmented AS (SELECT *, CASE WHEN r >= 3 AND f >= 3 AND m >= 3 THEN 'Champions' WHEN r >= 3 AND f >= 2 THEN 'Loyal' WHEN r <= 2 AND f >= 3 AND m >= 3 THEN 'At risk' WHEN r = 1 AND f <= 2 THEN 'Lost' WHEN r >= 3 AND f = 1 THEN 'New or promising' ELSE 'Needs attention' END AS segment FROM scored) SELECT segment, COUNT(*) AS customers FROM segmented GROUP BY segment ORDER BY customers DESC, segment;`
      ],
      solution: `WITH rfm AS (SELECT o.customer_id, CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days, COUNT(*) AS frequency, ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary FROM orders o JOIN payments p ON p.order_id = o.order_id GROUP BY o.customer_id), scored AS (SELECT *, NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r, NTILE(4) OVER (ORDER BY frequency, customer_id) AS f, NTILE(4) OVER (ORDER BY monetary, customer_id) AS m FROM rfm), segmented AS (SELECT *, CASE WHEN r >= 3 AND f >= 3 AND m >= 3 THEN 'Champions' WHEN r >= 3 AND f >= 2 THEN 'Loyal' WHEN r <= 2 AND f >= 3 AND m >= 3 THEN 'At risk' WHEN r = 1 AND f <= 2 THEN 'Lost' WHEN r >= 3 AND f = 1 THEN 'New or promising' ELSE 'Needs attention' END AS segment FROM scored) SELECT segment, COUNT(*) AS customers FROM segmented GROUP BY segment ORDER BY customers DESC, segment;`,
      ordered: true
    },
    {
      id: 'sql-8-4-c2',
      type: 'check',
      title: 'One win-back campaign, one budget. Which segment goes first?',
      body: `<p>Remember the numbers: Champions 494 customers (38.5% of revenue), At risk 271 (20.0%), Lost 360 (10.7%), New or promising 143 (3.7%).</p>`,
      options: ['Champions, because they are worth the most', 'At risk: they used to buy often and spend a lot, they are still within reach, and losing them would cost real money', 'Lost, because they are the biggest group of unhappy customers', 'New or promising, because they are the newest'],
      answer: 1,
      why: [
        'Champions are already buying. A win-back message to someone who never left is wasted. They deserve a thank-you and a reward, not a rescue.',
        'Yes! “At risk” combines high past value with falling recency, and that is the sweet spot for a rescue: a good message now can save money that is about to disappear. Lost customers cost much more to bring back and were never worth as much.',
        'Lost customers are many, but they brought little and left long ago. Win-back money goes much further on the At risk group.',
        'New customers need a different message (a welcome and a nudge towards a second order), not a win-back.'
      ]
    },
    {
      id: 'sql-8-4-ex5',
      type: 'exercise',
      title: 'Challenge: how much do the Champions really bring?',
      body: `<p>The manager asks: <i>“What share of our money comes from the Champions?”</i> Return one row with <code>champions</code> (how many customers are Champions) and <code>revenue_share_pct</code> (their share of the <b>total</b> monetary value of <b>all</b> customers, as a percentage rounded to 1 decimal place).</p>
<p><b>Think before you type:</b> all three scratch pads are already in the starter, so you only write the last query. Two numbers are needed: the Champions’ money, <code>SUM(monetary)</code> with a <code>WHERE segment = 'Champions'</code>, and the money of <b>everyone</b>, which you can fetch with a small query inside brackets: <code>(SELECT SUM(monetary) FROM segmented)</code>. A share is “part divided by whole”, times 100.</p>`,
      starter: `-- Write your query below\n\nWITH rfm AS (\n    SELECT o.customer_id,\n           CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days,\n           COUNT(*) AS frequency,\n           ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary\n    FROM orders o\n    JOIN payments p ON p.order_id = o.order_id\n    GROUP BY o.customer_id\n),\nscored AS (\n    SELECT *,\n           NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r,\n           NTILE(4) OVER (ORDER BY frequency, customer_id) AS f,\n           NTILE(4) OVER (ORDER BY monetary, customer_id) AS m\n    FROM rfm\n),\nsegmented AS (\n    SELECT *,\n           CASE WHEN r >= 3 AND f >= 3 AND m >= 3 THEN 'Champions'\n                WHEN r >= 3 AND f >= 2 THEN 'Loyal'\n                WHEN r <= 2 AND f >= 3 AND m >= 3 THEN 'At risk'\n                WHEN r = 1 AND f <= 2 THEN 'Lost'\n                WHEN r >= 3 AND f = 1 THEN 'New or promising'\n                ELSE 'Needs attention' END AS segment\n    FROM scored\n)\n-- write your final SELECT here\nSELECT * FROM segmented LIMIT 5;\n`,
      hints: [
        `Keep only the Champions with WHERE segment = 'Champions'. Then COUNT(*) gives how many there are, and SUM(monetary) gives their money.`,
        `Divide by the grand total: 100.0 * SUM(monetary) / (SELECT SUM(monetary) FROM segmented), all wrapped in ROUND(..., 1).`,
        `WITH rfm AS (SELECT o.customer_id, CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days, COUNT(*) AS frequency, ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary FROM orders o JOIN payments p ON p.order_id = o.order_id GROUP BY o.customer_id), scored AS (SELECT *, NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r, NTILE(4) OVER (ORDER BY frequency, customer_id) AS f, NTILE(4) OVER (ORDER BY monetary, customer_id) AS m FROM rfm), segmented AS (SELECT *, CASE WHEN r >= 3 AND f >= 3 AND m >= 3 THEN 'Champions' WHEN r >= 3 AND f >= 2 THEN 'Loyal' WHEN r <= 2 AND f >= 3 AND m >= 3 THEN 'At risk' WHEN r = 1 AND f <= 2 THEN 'Lost' WHEN r >= 3 AND f = 1 THEN 'New or promising' ELSE 'Needs attention' END AS segment FROM scored) SELECT COUNT(*) AS champions, ROUND(100.0 * SUM(monetary) / (SELECT SUM(monetary) FROM segmented), 1) AS revenue_share_pct FROM segmented WHERE segment = 'Champions';`
      ],
      solution: `WITH rfm AS (SELECT o.customer_id, CAST(julianday('2026-06-30') - julianday(MAX(o.order_date)) AS INTEGER) AS recency_days, COUNT(*) AS frequency, ROUND(SUM(CASE WHEN o.order_status IN ('Completed', 'Processing') THEN p.amount ELSE 0 END), 2) AS monetary FROM orders o JOIN payments p ON p.order_id = o.order_id GROUP BY o.customer_id), scored AS (SELECT *, NTILE(4) OVER (ORDER BY recency_days DESC, customer_id) AS r, NTILE(4) OVER (ORDER BY frequency, customer_id) AS f, NTILE(4) OVER (ORDER BY monetary, customer_id) AS m FROM rfm), segmented AS (SELECT *, CASE WHEN r >= 3 AND f >= 3 AND m >= 3 THEN 'Champions' WHEN r >= 3 AND f >= 2 THEN 'Loyal' WHEN r <= 2 AND f >= 3 AND m >= 3 THEN 'At risk' WHEN r = 1 AND f <= 2 THEN 'Lost' WHEN r >= 3 AND f = 1 THEN 'New or promising' ELSE 'Needs attention' END AS segment FROM scored) SELECT COUNT(*) AS champions, ROUND(100.0 * SUM(monetary) / (SELECT SUM(monetary) FROM segmented), 1) AS revenue_share_pct FROM segmented WHERE segment = 'Champions';`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Does it add up? Honest limits, and what you can do now',
      body: `<div class="callout work"><b>The “does it add up?” habit:</b> whenever you split a number into pieces, check that the pieces add back to the whole. The money of all 1,982 customers adds up to <b>1,419,860,053.32</b>, which is exactly the net revenue from Lesson 8.1. That match is your proof that nothing was lost or double-counted along the way. (Also note that the 18 customers who never ordered are not here at all: they have no “last order”, so they have no recency. “Never bought” is a separate question for marketing.)</div>
<div class="callout watch"><b>Be honest about the limits.</b> RFM scores are <b>relative</b>: a “Champion” means “in the top half or so compared with <i>this</i> group of customers”, not “perfect”. The cut-offs are a judgement call, and as you saw, ties can nudge similar customers into different groups. So present segments as a <b>smart starting point for action and testing</b> (“let’s try a rescue offer on At risk and see what happens”), not as a law of nature.</div>
<p>Here is what you can now do that you couldn’t before:</p>
<ul>
<li>Measure <b>Recency, Frequency and Monetary</b> for every customer, with a fixed “photograph date”</li>
<li>Explain <code>julianday</code>, <code>MAX</code>, <code>GROUP BY</code>, <code>CASE</code> and <code>NTILE</code> in plain words, and use them together</li>
<li>Avoid the <b>direction trap</b> and understand the <b>tie problem</b>, including the fixed-threshold alternative</li>
<li>Turn scores into <b>named segments</b> and measure each group’s size and share of revenue</li>
<li>Turn a table of numbers into a <b>recommendation</b> a manager can act on</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is RFM analysis, and what is it used for?</li>
<li>Why is the Recency score sorted in the opposite direction to the other two?</li>
<li>What is a weakness of using NTILE to score customers, and how can you reduce it?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> RFM scores every customer on how recently they bought, how often they buy and how much they spend. Then it groups them into segments like Champions or At risk, so a business can send the right message to the right people and spend its marketing budget where it pays back.</p>
<p><b>2.</b> Because for recency a smaller number of days is better, while for frequency and spending a bigger number is better. Sorting recency in descending order makes “4” mean “best” in all three scores, so they can be compared and combined.</p>
<p><b>3.</b> NTILE always makes equal-sized groups, even when many customers share exactly the same value, so identical customers can end up in different groups. You can reduce this with a clear tie-breaker so results are repeatable, or better, use fixed business thresholds that always give identical customers identical scores.</p>
</details>
<p><b>Coming next:</b> over the last lessons you kept bumping into strange things in TradeFlow: orders dated before the customer even signed up, payments on cancelled orders, completed orders that never arrived. Next, in the <b>data-quality audit</b>, we gather every one of those red flags into a single report you could hand to a finance director.</p>`
    }
  ]
}
);
