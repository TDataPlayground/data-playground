LESSONS.push(
{
  id: 'sql-8-6',
  track: 'sql',
  title: '8.6 The SQL interview: five classic problems on real TradeFlow data',
  tables: ['payments', 'orders', 'order_items', 'products'],
  intro: `You have audited TradeFlow’s database, rescued its at-risk customers and built its revenue ladder. Now TradeFlow’s Head of Data leans back in her chair and says with a smile: <i>“You clearly know our data. I want to know how you think. I’m going to ask you five questions, all about our own numbers. Talk me through each one.”</i><br><br>This is a <b>SQL interview</b>, and it is less scary than it sounds. Interviewers are not hunting for a genius. They want to see that you can <b>stay calm, break a problem into small pieces, and explain what you are doing</b>. The five questions below are classics that appear in interviews all over the world, and each one teaches a pattern you will use at work for years. We will take them one at a time, slowly, and by the end you will have a method that works on questions you have never seen.`,
  steps: [
    {
      type: 'explain',
      title: 'A method that works under pressure',
      body: `<div class="callout analogy"><b>The big idea:</b> when a pilot is nervous, she doesn’t improvise. She reads her checklist. A good interview answer works the same way: a calm routine you follow every time, so your brain has something to hold on to when the pressure rises.</div>
<p>Here is the routine. Six small steps:</p>
<ol>
<li><b>Say the question back in your own words.</b> “So you want the second-highest payment amount, right?” This buys you thinking time and catches misunderstandings early.</li>
<li><b>Ask about the awkward cases.</b> “What if two payments tie for the highest? What about blank values?” Interviewers love this. It shows you have been burned by messy data before.</li>
<li><b>Say your plan in plain English before you write any SQL.</b> “First I’ll find the highest amount, then I’ll look for the highest amount that is smaller than that.”</li>
<li><b>Build in small pieces.</b> Write the inner part, run it, then wrap it. Never write forty lines in one go.</li>
<li><b>Test it on a tiny example</b> in your head, or on real numbers you can check by eye.</li>
<li><b>Mention what you would improve</b>: another approach, how it behaves with ties, how it would run on a billion rows.</li>
</ol>
<p>And one more thing: <b>talk while you think.</b> A silent candidate who writes a perfect query gets a lower score than a candidate who explains a slightly flawed one clearly. Your voice is part of the answer.</p>`
    },
    {
      type: 'explain',
      title: 'Question 1: “What is the second-highest payment?”',
      body: `<p>This is probably the most famous SQL interview question in the world. It sounds trivial, which is exactly why it is used: it separates people who memorised one trick from people who understand what can go wrong.</p>
<p>Let’s follow the routine. <b>Restate:</b> “You want the payment amount that comes right after the biggest one.” <b>Awkward case:</b> “What if two payments are tied for the biggest? Is the second-highest then the same amount, or the next different amount?” (Usually the interviewer says: the next different amount.) <b>Plan:</b> “First find the biggest amount. Then find the biggest amount among the payments that are <i>smaller</i> than that.”</p>
<p>That plan translates almost word for word into SQL, with a small query inside brackets (a <b>subquery</b>, from Module 4).</p>`
    },
    {
      type: 'try',
      title: 'Method A: the biggest amount below the biggest',
      body: `<p>Read it from the inside out, the way you would explain it aloud:</p>
<ol>
<li><b>(SELECT MAX(amount) FROM payments)</b>: “the very highest payment.” That is 1,071,796.61.</li>
<li><b>WHERE amount &lt; (that number)</b>: “keep only payments smaller than the highest.”</li>
<li><b>SELECT MAX(amount)</b>: “and from those, take the biggest.”</li>
</ol>
<p>The answer is <b>877,276.20</b>. If you only had one method to remember, this is the one: it needs no special functions and works in every database.</p>`,
      code: `SELECT MAX(amount) AS second_highest_payment
FROM payments
WHERE amount < (SELECT MAX(amount) FROM payments);`
    },
    {
      type: 'explain',
      title: 'The tempting shortcut, and why it can fail',
      body: `<p>Many people reach for a shortcut: sort from highest to lowest, skip the first row and take the next. In SQL that is <code>ORDER BY amount DESC LIMIT 1 OFFSET 1</code> (“skip 1 row, then give me 1 row”). It looks neat. But think about our “awkward case”: what if the two biggest payments are the <b>same amount</b>? The first row is 100, the second row is also 100, so the shortcut hands you 100, which is <i>not</i> the second-highest <b>value</b>. Let’s test that on a tiny list we control: <b>100, 100, 90, 80</b>.</p>`
    },
    {
      type: 'try',
      title: 'Ties break the shortcut',
      body: `<p>Run it. The shortcut (<code>OFFSET 1</code>) returns <b>100</b>, which is wrong if you want the second-highest <i>distinct</i> value. Method A returns <b>90</b>, which is right. Same data, two answers, and only one of them survives a tie. That tiny example is exactly what a great candidate draws on the whiteboard.</p>`,
      code: `WITH t(x) AS (VALUES (100), (100), (90), (80))
SELECT 'Shortcut (OFFSET 1)' AS method,
       (SELECT x FROM t ORDER BY x DESC LIMIT 1 OFFSET 1) AS answer
UNION ALL
SELECT 'Method A (MAX below MAX)',
       (SELECT MAX(x) FROM t WHERE x < (SELECT MAX(x) FROM t));`
    },
    {
      type: 'try',
      title: 'Method B: DENSE_RANK, the flexible way',
      body: `<p>If the interviewer then asks, “And the <b>third</b>-highest? Or the fifth?”, Method A becomes awkward, because you would need to nest it again and again. The flexible tool is a <b>window function</b> from Module 6. <code>DENSE_RANK()</code> numbers the values from the top, and gives <b>tied values the same number without skipping any</b>. So 100, 100, 90 become ranks 1, 1, 2. To get the Nth highest, you change one number.</p>
<p>Here it finds the second-highest payment, and also tells you which payment it is (<b>payment 9589</b>, amount 877,276.20).</p>`,
      code: `WITH ranked AS (
    SELECT payment_id,
           amount,
           DENSE_RANK() OVER (ORDER BY amount DESC) AS rnk
    FROM payments
)
SELECT payment_id, amount
FROM ranked
WHERE rnk = 2;`
    },
    {
      id: 'sql-8-6-c1',
      type: 'check',
      title: 'The two biggest payments are exactly equal. Which approach still finds the second-highest distinct amount?',
      body: `<p>Think back to the 100, 100, 90, 80 example.</p>`,
      options: ['ORDER BY amount DESC LIMIT 1 OFFSET 1', 'WHERE amount < (SELECT MAX(amount) ...) with MAX on top, or DENSE_RANK = 2', 'ORDER BY amount ASC LIMIT 1', 'SELECT MIN(amount)'],
      answer: 1,
      why: [
        'This takes the second ROW, not the second distinct VALUE. With a tie at the top it returns the top value again.',
        'Yes! Both of these work with distinct values. MAX-below-MAX skips every row equal to the top, and DENSE_RANK gives tied values the same rank, so rank 2 is the next different amount.',
        'That gives the smallest payment, which is nowhere near the second-highest.',
        'MIN is the smallest value overall. Wrong end of the list.'
      ]
    },
    {
      id: 'sql-8-6-ex1',
      type: 'exercise',
      title: 'Your turn: the second-highest payment',
      body: `<p>Return one number called <code>second_highest_payment</code>: the second-highest distinct <code>amount</code> in <code>payments</code>. You may use Method A or Method B. The answer is the same.</p>
<p><b>Think before you type:</b> say your plan aloud first. “First find the highest amount, then the highest amount below it.” Then write the inner part, run it, and wrap it.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Write the inner part first: SELECT MAX(amount) FROM payments. Run it to see the biggest amount.`,
        `Now use it as a filter: WHERE amount < (that inner query), and take MAX(amount) from what is left.`,
        `SELECT MAX(amount) AS second_highest_payment FROM payments WHERE amount < (SELECT MAX(amount) FROM payments);`
      ],
      solution: `SELECT MAX(amount) AS second_highest_payment FROM payments WHERE amount < (SELECT MAX(amount) FROM payments);`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Question 2: “Which customers bought in every one of 2023, 2024 and 2025?”',
      body: `<p>This question is about <b>loyalty over time</b>, and it hides a classic trap: people reach for <code>COUNT(*)</code> and count <i>orders</i>, when the question is about <i>years</i>. A customer with 6 orders all placed in 2024 has many orders but only one active year.</p>
<p><b>Restate:</b> “Customers who placed at least one order in each of the three years.” <b>Plan in plain English:</b> “For every customer, count how many <i>different years</i> they ordered in, looking only at 2023 to 2025. Keep the customers whose count is 3.”</p>
<p>The new tools here are small. Our dates look like <code>2024-06-17</code>, so the year is just the first four characters: <code>SUBSTR(order_date, 1, 4)</code> (“take 4 characters, starting at the first”). And <code>COUNT(DISTINCT ...)</code> counts each different value only once. Finally, <code>HAVING</code> filters <b>after</b> grouping (Lesson 2.6), which is exactly what we need.</p>`
    },
    {
      type: 'try',
      title: 'Step 1: how many different years did each customer buy in?',
      body: `<p>First we look at the spread, before we filter. Each customer is placed into a bucket by the number of different years they ordered in. <b>245</b> customers bought in only one of the three years, <b>813</b> in two, and <b>910</b> in all three. Those 910 are the answer to the interview question, and you can already see the business story: nearly half of the buyers are truly long-term customers.</p>`,
      code: `WITH per_customer AS (
    SELECT customer_id,
           COUNT(DISTINCT SUBSTR(order_date, 1, 4)) AS years_active
    FROM orders
    WHERE order_date >= '2023-01-01' AND order_date < '2026-01-01'
    GROUP BY customer_id
)
SELECT years_active, COUNT(*) AS customers
FROM per_customer
GROUP BY years_active
ORDER BY years_active;`
    },
    {
      id: 'sql-8-6-ex2',
      type: 'exercise',
      title: 'Your turn: customers active in all three years',
      body: `<p>Return one number called <code>active_all_three_years</code>: how many customers placed at least one order in <b>each</b> of 2023, 2024 and 2025.</p>
<p><b>Think before you type:</b> group the orders by customer, keep only orders dated from 2023-01-01 up to (but not including) 2026-01-01, and use <code>HAVING COUNT(DISTINCT SUBSTR(order_date, 1, 4)) = 3</code> to keep the customers who appear in all three years. Then count how many customers survived. Because you need to count the survivors, wrap the grouped query in a second query.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Inner query: SELECT customer_id FROM orders WHERE order_date >= '2023-01-01' AND order_date < '2026-01-01' GROUP BY customer_id HAVING COUNT(DISTINCT SUBSTR(order_date, 1, 4)) = 3`,
        `Wrap it: SELECT COUNT(*) AS active_all_three_years FROM ( ...your inner query... );`,
        `SELECT COUNT(*) AS active_all_three_years FROM (SELECT customer_id FROM orders WHERE order_date >= '2023-01-01' AND order_date < '2026-01-01' GROUP BY customer_id HAVING COUNT(DISTINCT SUBSTR(order_date, 1, 4)) = 3);`
      ],
      solution: `SELECT COUNT(*) AS active_all_three_years FROM (SELECT customer_id FROM orders WHERE order_date >= '2023-01-01' AND order_date < '2026-01-01' GROUP BY customer_id HAVING COUNT(DISTINCT SUBSTR(order_date, 1, 4)) = 3);`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Question 3: “What is the median payment?”',
      body: `<p>Everyone knows the <b>average</b> (the mean): add everything up and divide. The <b>median</b> is different: <b>line all the values up from smallest to biggest and take the one in the middle.</b></p>
<div class="callout analogy"><b>Why anyone cares:</b> imagine five friends in a room whose monthly incomes are all around 100 thousand, and then a billionaire walks in. The <i>average</i> income of the room jumps to hundreds of millions, which describes nobody. The <i>median</i> barely moves. The median tells you what a <b>typical</b> person looks like, and that is why analysts report it for money amounts, which tend to have a few huge values.</div>
<p>Here comes the interview twist: <b>SQLite, like several other databases, has no MEDIAN function</b>. So you must build it from tools you already know. The plan, in plain English:</p>
<ol>
<li>Line the payments up from smallest to biggest and number them 1, 2, 3, ... (<code>ROW_NUMBER</code>).</li>
<li>Count how many payments there are (<code>COUNT(*) OVER ()</code>, a window function that sees the whole table).</li>
<li>Pick the middle row. If the count is odd there is one middle row; if it is even there are <b>two</b> middle rows, and the median is their average.</li>
</ol>
<p>A neat way to pick one-or-two middle rows is: <code>rn IN ((cnt + 1) / 2, (cnt + 2) / 2)</code>. SQL divides whole numbers and drops the decimals, so for 5 values both parts give row 3, and for 6 values they give rows 3 and 4. Let’s see that on tiny lists first.</p>`
    },
    {
      type: 'try',
      title: 'The median on five numbers (odd count)',
      body: `<p>Five numbers: 10, 20, 30, 40, 50. The count is 5, and both formulas give <b>3</b> (see <code>mid_a</code> and <code>mid_b</code>), so we pick row 3, which is <b>30</b>. The middle of five really is the third one.</p>`,
      code: `WITH t(x) AS (VALUES (10), (20), (30), (40), (50)),
n AS (
    SELECT x,
           ROW_NUMBER() OVER (ORDER BY x) AS rn,
           COUNT(*) OVER () AS cnt
    FROM t
)
SELECT x, rn, cnt,
       (cnt + 1) / 2 AS mid_a,
       (cnt + 2) / 2 AS mid_b
FROM n;`
    },
    {
      type: 'try',
      title: 'The median on six numbers (even count)',
      body: `<p>Now six numbers: 10, 20, 30, 40, 50, 60. There is no single middle: rows 3 and 4 share the middle. The two formulas give 3 and 4, so we keep both rows and take their average: (30 + 40) / 2 = <b>35</b>. The same query handles both cases, which is what makes the trick elegant.</p>`,
      code: `WITH t(x) AS (VALUES (10), (20), (30), (40), (50), (60)),
n AS (
    SELECT x,
           ROW_NUMBER() OVER (ORDER BY x) AS rn,
           COUNT(*) OVER () AS cnt
    FROM t
)
SELECT AVG(x) AS median
FROM n
WHERE rn IN ((cnt + 1) / 2, (cnt + 2) / 2);`
    },
    {
      type: 'try',
      title: 'The median payment, next to the average',
      body: `<p>Now the real thing, on 10,000 payments. We add <code>payment_id</code> as a tie-breaker inside the ORDER BY so the row numbering is the same every time. The <b>median payment is 127,828.29</b>, while the <b>average is 158,198.15</b>. The average is about 30 thousand higher, pulled up by a few very large orders (the biggest is over a million). If someone asks “what does a typical order cost at TradeFlow?”, the honest answer is the median.</p>`,
      code: `WITH n AS (
    SELECT amount,
           ROW_NUMBER() OVER (ORDER BY amount, payment_id) AS rn,
           COUNT(*) OVER () AS cnt
    FROM payments
)
SELECT ROUND(AVG(amount), 2) AS median_payment,
       (SELECT ROUND(AVG(amount), 2) FROM payments) AS average_payment
FROM n
WHERE rn IN ((cnt + 1) / 2, (cnt + 2) / 2);`
    },
    {
      id: 'sql-8-6-c2',
      type: 'check',
      title: 'A manager asks: “What does a typical TradeFlow order cost?” Which number do you give?',
      body: `<p>Median payment: 127,828.29. Average payment: 158,198.15. The largest single payment is over 1,000,000.</p>`,
      options: ['The average, because it uses every value', 'The median, because a few very large orders pull the average up and the median shows the typical order', 'Either one, they always mean the same thing', 'The maximum, because it is the most impressive'],
      answer: 1,
      why: [
        'The average does use every value, and that is exactly its weakness here: a few huge orders drag it upwards, so it describes almost no real order.',
        'Yes! Money amounts usually have a few very large values. The median ignores how extreme the extremes are, so it answers “what is typical?” honestly. A great answer even quotes both and explains the gap.',
        'They are equal only in perfectly balanced data. Here they differ by about 30 thousand, which is the whole point.',
        'The maximum describes the single biggest payment, not a typical one.'
      ]
    },
    {
      id: 'sql-8-6-ex3',
      type: 'exercise',
      title: 'Your turn: the median payment',
      body: `<p>Return one number called <code>median_payment</code>: the median of <code>payments.amount</code>, rounded to 2 decimals.</p>
<p><b>Think before you type:</b> say the plan aloud. “Number the payments from smallest to biggest, count them, keep the middle row or rows, and average them.” Then build it in two small pieces: first a CTE called <code>n</code> with <code>amount</code>, <code>ROW_NUMBER() OVER (ORDER BY amount, payment_id) AS rn</code> and <code>COUNT(*) OVER () AS cnt</code>. Then the final query with <code>WHERE rn IN ((cnt + 1) / 2, (cnt + 2) / 2)</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Piece 1: WITH n AS (SELECT amount, ROW_NUMBER() OVER (ORDER BY amount, payment_id) AS rn, COUNT(*) OVER () AS cnt FROM payments)`,
        `Piece 2: SELECT ROUND(AVG(amount), 2) AS median_payment FROM n WHERE rn IN ((cnt + 1) / 2, (cnt + 2) / 2);`,
        `WITH n AS (SELECT amount, ROW_NUMBER() OVER (ORDER BY amount, payment_id) AS rn, COUNT(*) OVER () AS cnt FROM payments) SELECT ROUND(AVG(amount), 2) AS median_payment FROM n WHERE rn IN ((cnt + 1) / 2, (cnt + 2) / 2);`
      ],
      solution: `WITH n AS (SELECT amount, ROW_NUMBER() OVER (ORDER BY amount, payment_id) AS rn, COUNT(*) OVER () AS cnt FROM payments) SELECT ROUND(AVG(amount), 2) AS median_payment FROM n WHERE rn IN ((cnt + 1) / 2, (cnt + 2) / 2);`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Question 4: “What is the best-selling product in each category?”',
      body: `<p>This is the <b>“top one per group”</b> pattern, and it might be the most useful pattern in all of business SQL. Top product per category, best salesperson per region, latest order per customer: the shape is always the same. The trap is that a plain <code>GROUP BY category</code> can only give you totals per category. It cannot tell you <i>which product</i> was the winner, because the product name is not part of the grouping.</p>
<p>The solution you learned in Lesson 6.2 has three layers:</p>
<ol>
<li><b>Calculate</b> the revenue of every product (join <code>order_items</code> to <code>products</code>, then group by category and product).</li>
<li><b>Rank</b> the products inside each category: <code>RANK() OVER (PARTITION BY category ORDER BY revenue DESC)</code>. “PARTITION BY category” means “restart the ranking for every category, like separate leaderboards.”</li>
<li><b>Keep rank 1</b> only.</li>
</ol>
<p>Why can’t we put the rank filter in the same SELECT where we calculate it? Because SQL does not allow a window function in WHERE (it is computed after filtering). So we calculate the ranks in one scratch pad (CTE) and filter in the next. Let’s look at the top 3 of one category before we keep only the winner, so you can see the leaderboard.</p>`
    },
    {
      type: 'try',
      title: 'The Electronics leaderboard, top three',
      body: `<p>This is the ranking before we keep only rank 1. In Electronics, the <b>Rechargeable Batteries Pack</b> leads with about 43.4 million, followed by the Power Bank 10000mAh and the Phone Tripod Stand. Notice that the ranking is by <b>revenue</b> (quantity times price), not by how many units were sold, which can crown a very different winner. Always say which one you used.</p>`,
      code: `WITH rev AS (
    SELECT p.category,
           p.product_name,
           ROUND(SUM(i.quantity * i.unit_price), 2) AS revenue
    FROM order_items i
    JOIN products p ON p.product_id = i.product_id
    GROUP BY p.category, p.product_name
),
ranked AS (
    SELECT category, product_name, revenue,
           RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk
    FROM rev
)
SELECT category, product_name, revenue, rnk
FROM ranked
WHERE category = 'Electronics' AND rnk <= 3
ORDER BY rnk;`
    },
    {
      id: 'sql-8-6-ex4',
      type: 'exercise',
      title: 'Your turn: the top product in every category',
      body: `<p>Return <code>category</code>, <code>product_name</code> and <code>revenue</code> (rounded to 2 decimals) for the <b>single best product by revenue in each category</b>, ordered by <code>category</code> A to Z. You should get 5 rows.</p>
<p><b>Think before you type:</b> the first layer, the <code>rev</code> scratch pad, is already in the starter. You add the second layer (<code>ranked</code>, with <code>RANK() OVER (PARTITION BY category ORDER BY revenue DESC)</code>) and the final query that keeps rank 1.</p>`,
      starter: `-- Write your query below\n\nWITH rev AS (\n    SELECT p.category,\n           p.product_name,\n           ROUND(SUM(i.quantity * i.unit_price), 2) AS revenue\n    FROM order_items i\n    JOIN products p ON p.product_id = i.product_id\n    GROUP BY p.category, p.product_name\n)\n-- add a ranked CTE, then the final SELECT\nSELECT * FROM rev LIMIT 5;\n`,
      hints: [
        `After rev, add a comma and: ranked AS (SELECT category, product_name, revenue, RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk FROM rev)`,
        `The final query: SELECT category, product_name, revenue FROM ranked WHERE rnk = 1 ORDER BY category;`,
        `WITH rev AS (SELECT p.category, p.product_name, ROUND(SUM(i.quantity * i.unit_price), 2) AS revenue FROM order_items i JOIN products p ON p.product_id = i.product_id GROUP BY p.category, p.product_name), ranked AS (SELECT category, product_name, revenue, RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk FROM rev) SELECT category, product_name, revenue FROM ranked WHERE rnk = 1 ORDER BY category;`
      ],
      solution: `WITH rev AS (SELECT p.category, p.product_name, ROUND(SUM(i.quantity * i.unit_price), 2) AS revenue FROM order_items i JOIN products p ON p.product_id = i.product_id GROUP BY p.category, p.product_name), ranked AS (SELECT category, product_name, revenue, RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk FROM rev) SELECT category, product_name, revenue FROM ranked WHERE rnk = 1 ORDER BY category;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Question 5: “What is the longest streak of busy days?”',
      body: `<p>This is the hardest of the five, and the one that makes interviewers nod. The question: <i>“A busy day is a day with at least 10 orders. What is the longest run of busy days in a row?”</i></p>
<p>It is called a <b>“gaps and islands”</b> problem. Picture a calendar where busy days are painted green. Runs of consecutive green days are <b>islands</b>, separated by gaps of ordinary days. You want the longest island.</p>
<p>How do you make SQL see islands? With a beautiful little trick.</p>
<div class="callout analogy"><b>The trick:</b> list the busy days in order and number them 1, 2, 3... Now subtract that row number from each date. While the days are <b>consecutive</b>, the date moves up by one each row and the row number moves up by one each row, so the result <b>stays exactly the same</b>. The moment there is a gap in the dates, the result jumps. Every island ends up with its own shared “label”, and counting rows per label gives you the length of each island.</div>
<p>Let’s watch the trick work on six hand-made dates before we use real data.</p>`
    },
    {
      type: 'try',
      title: 'The island trick on six dates',
      body: `<p>Look at the last column. The first three dates (Jan 1, 2, 3) are consecutive, and they all got the label <b>2025-12-31</b>. Then there is a gap (Jan 4 is missing), and the next two dates (Jan 5, 6) share the new label <b>2026-01-01</b>. After another gap, Jan 9 stands alone with <b>2026-01-03</b>. Three islands, of lengths 3, 2 and 1, discovered just by subtracting the row number. (The <code>date(d, '-3 days')</code> function subtracts days from a date.)</p>`,
      code: `WITH t(d) AS (
    VALUES ('2026-01-01'), ('2026-01-02'), ('2026-01-03'),
           ('2026-01-05'), ('2026-01-06'), ('2026-01-09')
)
SELECT d,
       ROW_NUMBER() OVER (ORDER BY d) AS rn,
       date(d, '-' || ROW_NUMBER() OVER (ORDER BY d) || ' days') AS island_label
FROM t;`
    },
    {
      id: 'sql-8-6-c3',
      type: 'check',
      title: 'Why does subtracting the row number reveal the islands?',
      body: `<p>Think about what happens to the date and the row number as you move down a run of consecutive days.</p>`,
      options: ['Because row numbers are random', 'Within a run of consecutive days both the date and the row number go up by 1, so their difference stays constant, and it changes only when a gap appears', 'Because SQL needs a row number to sort dates', 'Because it removes duplicate dates'],
      answer: 1,
      why: [
        'Row numbers are not random. They count up 1, 2, 3 in the order we ask for.',
        'Exactly! Same step size on both sides means a constant difference inside an island. A gap makes the date jump by more than 1 while the row number still moves by 1, and the label changes. That is the whole trick.',
        'Sorting is done by ORDER BY, not by the row number. The row number is only our measuring stick.',
        'Duplicates are handled earlier: we list each busy day once, using GROUP BY.'
      ]
    },
    {
      type: 'try',
      title: 'The real streaks in TradeFlow’s orders',
      body: `<p>Now the real data, in three layers you can read like a story:</p>
<ol>
<li><b>busy</b>: the days with at least 10 orders (<code>GROUP BY order_date HAVING COUNT(*) &gt;= 10</code>). There are 357 of them.</li>
<li><b>labelled</b>: apply the island trick, giving each busy day its island label.</li>
<li>Group by the label and take the first date, last date and number of days of each island.</li>
</ol>
<p>The longest streaks are <b>5 days</b>: <b>17 to 21 June 2024</b> and <b>20 to 24 March 2025</b>. Those are the best days to ask “what was going on?”: a promotion, a holiday, a marketing push. An interview answer that ends with a business question like that scores very well.</p>`,
      code: `WITH busy AS (
    SELECT order_date
    FROM orders
    GROUP BY order_date
    HAVING COUNT(*) >= 10
),
labelled AS (
    SELECT order_date,
           date(order_date, '-' || ROW_NUMBER() OVER (ORDER BY order_date) || ' days') AS island
    FROM busy
)
SELECT MIN(order_date) AS streak_start,
       MAX(order_date) AS streak_end,
       COUNT(*) AS streak_days
FROM labelled
GROUP BY island
ORDER BY streak_days DESC, streak_start
LIMIT 5;`
    },
    {
      id: 'sql-8-6-ex5',
      type: 'exercise',
      title: 'Your turn: the longest streak',
      body: `<p>Return one number called <code>longest_streak_days</code>: the length of the longest run of consecutive days that each had <b>at least 10 orders</b>.</p>
<p><b>Think before you type:</b> the first layer, <code>busy</code>, is already written for you in the starter. You add the <code>labelled</code> layer (the island trick), then a <code>streaks</code> layer that counts days per island label, and finally take the <code>MAX</code> of those counts.</p>`,
      starter: `-- Write your query below\n\nWITH busy AS (\n    SELECT order_date\n    FROM orders\n    GROUP BY order_date\n    HAVING COUNT(*) >= 10\n)\n-- add labelled and streaks CTEs, then the final SELECT\nSELECT * FROM busy LIMIT 5;\n`,
      hints: [
        `Layer 2: labelled AS (SELECT order_date, date(order_date, '-' || ROW_NUMBER() OVER (ORDER BY order_date) || ' days') AS island FROM busy)`,
        `Layer 3: streaks AS (SELECT COUNT(*) AS streak_days FROM labelled GROUP BY island). Then finish with SELECT MAX(streak_days) AS longest_streak_days FROM streaks;`,
        `WITH busy AS (SELECT order_date FROM orders GROUP BY order_date HAVING COUNT(*) >= 10), labelled AS (SELECT order_date, date(order_date, '-' || ROW_NUMBER() OVER (ORDER BY order_date) || ' days') AS island FROM busy), streaks AS (SELECT COUNT(*) AS streak_days FROM labelled GROUP BY island) SELECT MAX(streak_days) AS longest_streak_days FROM streaks;`
      ],
      solution: `WITH busy AS (SELECT order_date FROM orders GROUP BY order_date HAVING COUNT(*) >= 10), labelled AS (SELECT order_date, date(order_date, '-' || ROW_NUMBER() OVER (ORDER BY order_date) || ' days') AS island FROM busy), streaks AS (SELECT COUNT(*) AS streak_days FROM labelled GROUP BY island) SELECT MAX(streak_days) AS longest_streak_days FROM streaks;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A bonus question, because interviewers love follow-ups',
      body: `<p>After you answer well, a good interviewer often adds: <i>“Nice. Now, which month grew the most compared with the month before?”</i> You already own the tool: <code>LAG()</code> from Lesson 6.3, which lets each row look at the previous one. Count orders per month, subtract the previous month’s count, and sort by the change.</p>`
    },
    {
      type: 'try',
      title: 'Biggest month-on-month jumps',
      body: `<p>The biggest jump happened in <b>March 2023</b>, with 57 more orders than February (263 in total), then <b>October 2024</b> (+54) and <b>March 2026</b> (+40). Finish with a question, not just a number: “Is March a seasonal peak? It appears twice in the top three.” That is how an analyst sounds.</p>`,
      code: `WITH monthly AS (
    SELECT SUBSTR(order_date, 1, 7) AS month,
           COUNT(*) AS orders
    FROM orders
    GROUP BY month
),
changes AS (
    SELECT month,
           orders,
           orders - LAG(orders) OVER (ORDER BY month) AS change_vs_previous
    FROM monthly
)
SELECT month, orders, change_vs_previous
FROM changes
ORDER BY change_vs_previous DESC
LIMIT 3;`
    },
    {
      type: 'explain',
      title: 'Your SQL cheat sheet',
      body: `<p>Everything you learned in this track, organised by <b>the situation you are in</b>. This is the page to screenshot and keep.</p>
<table class="mini">
<tr><th>When you need to...</th><th>Reach for</th><th>Lesson</th></tr>
<tr><td>Pick columns, filter, sort, take the top few</td><td>SELECT, WHERE, ORDER BY, LIMIT</td><td>2.1 to 2.3</td></tr>
<tr><td>Summarise: totals, counts, averages per group</td><td>COUNT, SUM, AVG, GROUP BY, HAVING</td><td>2.5, 2.6</td></tr>
<tr><td>Label or bucket values</td><td>CASE WHEN</td><td>2.7</td></tr>
<tr><td>Work with dates and clean text</td><td>julianday, date, SUBSTR, LOWER, LIKE</td><td>2.8, 2.9</td></tr>
<tr><td>Combine tables</td><td>JOIN, LEFT JOIN (and IS NULL to find missing partners)</td><td>3.1 to 3.4</td></tr>
<tr><td>Stack lists, compare lists</td><td>UNION ALL, INTERSECT, EXCEPT</td><td>3.5</td></tr>
<tr><td>Use one query’s answer inside another</td><td>Subquery, EXISTS, derived table</td><td>4.1 to 4.3</td></tr>
<tr><td>Make long queries readable</td><td>CTEs (WITH), including recursive</td><td>5.1 to 5.3</td></tr>
<tr><td>Rank, compare to the previous row, running totals</td><td>ROW_NUMBER, RANK, DENSE_RANK, LAG, SUM OVER, NTILE</td><td>6.1 to 6.5</td></tr>
<tr><td>Make a slow query fast</td><td>EXPLAIN QUERY PLAN, indexes</td><td>7.1 to 7.3</td></tr>
<tr><td>Define a metric, follow customers over time</td><td>Metric ladders, cohorts, funnels, RFM</td><td>8.1 to 8.4</td></tr>
<tr><td>Trust the data</td><td>An audit table of UNION ALL checks</td><td>8.5</td></tr>
</table>
<p>And the three habits that matter more than any function:</p>
<ul>
<li><b>Define before you calculate.</b> “Revenue” has four meanings. Say which one you used.</li>
<li><b>Reconcile.</b> Check that the pieces add up to a number the business already trusts.</li>
<li><b>Report, don’t silently fix.</b> Show what you found, with numbers, and ask the people who own the data.</li>
</ul>`
    },
    {
      type: 'explain',
      title: 'Practice questions the Head of Data might ask next',
      body: `<p>Say these out loud. Interviews are spoken, and your mouth needs practice as much as your fingers.</p>
<ol>
<li>What is the difference between <code>WHERE</code> and <code>HAVING</code>?</li>
<li>When would you use <code>LEFT JOIN</code> instead of <code>INNER JOIN</code>?</li>
<li>What is the difference between <code>ROW_NUMBER</code>, <code>RANK</code> and <code>DENSE_RANK</code>?</li>
<li>Your query is slow. What do you do?</li>
<li>Why do you check for ties and NULLs?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> WHERE filters individual rows before any grouping happens. HAVING filters the groups after they have been formed and summarised, so it is the one that can use totals and counts. For example, “only customers with more than five orders” needs HAVING.</p>
<p><b>2.</b> INNER JOIN keeps only the rows that have a match on both sides. LEFT JOIN keeps every row from the left table and shows blanks where there is no match, which is what I need to find things that are missing, like customers who never ordered, or orders without a payment.</p>
<p><b>3.</b> ROW_NUMBER gives every row a unique number, even when values tie. RANK gives tied rows the same number but then skips ahead (1, 1, 3). DENSE_RANK gives tied rows the same number and does not skip (1, 1, 2). I use ROW_NUMBER to pick exactly one row, and DENSE_RANK for “the Nth highest value”.</p>
<p><b>4.</b> I look at the query plan first with EXPLAIN QUERY PLAN to see whether it scans the whole table. Then I check whether the columns used in WHERE and JOIN have an index, I select only the columns I need, and I filter early so less data travels through the query.</p>
<p><b>5.</b> Because they are where silent errors hide. Ties can make a “top one” answer unfair or unrepeatable, and NULLs can make a comparison quietly drop rows. A result that looks right but has been shaped by an unexamined tie or NULL is the most dangerous kind.</p>
</details>`
    },
    {
      type: 'explain',
      title: 'You finished the SQL track',
      body: `<div class="callout tip"><b>Take a breath. Look at what you just did.</b> You started this track with the question <i>“What is a database, really?”</i> and you are finishing it by <b>solving the five classic interview problems on a real business dataset</b>, with a method, in your own words.</div>
<p>Across <b>eight modules and 38 lessons</b> you learned to:</p>
<ul>
<li>Understand how relational data is stored, and write <b>SELECT</b> queries that filter, sort, group, label and clean it</li>
<li><b>Join</b> many tables safely, avoid fan-out traps, and combine lists with UNION, INTERSECT and EXCEPT</li>
<li>Nest logic with <b>subqueries</b>, and write readable multi-step queries with <b>CTEs</b>, even recursive ones</li>
<li>Use <b>window functions</b> to rank, compare rows, build running totals and moving averages</li>
<li>Read <b>query plans</b>, create indexes, write fast queries and change data safely with views</li>
<li>Answer real business questions: <b>revenue, cohorts, funnels, RFM segments</b></li>
<li><b>Audit</b> a database for quality and report findings like a professional</li>
<li>Stay calm in a <b>SQL interview</b> and explain your thinking</li>
</ul>
<p>Every number you saw came from the same TradeFlow database, which means you now know one business’s data inside out. That is how real analysts become useful: depth first, then breadth.</p>
<p><b>What comes next</b> is the next track on the platform. SQL is the foundation of the whole Data Playground journey: from here you can bring the same TradeFlow data into other tools and techniques. Congratulations. You earned this one.</p>`
    }
  ]
}
);
