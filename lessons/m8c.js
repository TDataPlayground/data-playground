LESSONS.push(
{
  id: 'sql-8-5',
  track: 'sql',
  title: '8.5 The data-quality audit: can we trust this data?',
  tables: ['customers', 'regions', 'employees', 'orders', 'order_items', 'payments', 'deliveries'],
  intro: `It is your first week at a new company. The finance director calls you into her office and says: <i>“Before we build a single dashboard, I need to know one thing. Can we trust this database?”</i><br><br>A beginner answers, “Yes, it looks fine.” But looking fine is not the same as <b>being fine</b>. A professional answers, “Let me test it, and I’ll show you exactly what I find.”<br><br>The good news is that over this course you have already been collecting clues. You met orders dated before the customer even signed up, money collected on cancelled orders, and completed orders that never arrived. Until now you stumbled on them by accident. Today you do it the way real teams do: with a <b>structured audit</b>. By the end you will have <b>one table</b> that lists every problem, how many rows it touches and how serious it is, plus the words to explain it to someone who has never written a line of SQL.`,
  steps: [
    {
      type: 'explain',
      title: 'Think like a building inspector',
      body: `<div class="callout analogy"><b>The big idea:</b> before a family moves into a new house, an inspector walks through it with a checklist. She flicks every light switch, runs every tap and tries every door. She does not guess and she does not just say “looks nice”. She tests each item and writes down what failed. A <b>data audit</b> is the same walk-through for a database.</div>
<p>The checklist for data has six items. Here they are in plain words, each with a real TradeFlow example, so you know what we are hunting for:</p>
<table class="mini">
<tr><th>The check</th><th>The plain question</th><th>A TradeFlow example</th></tr>
<tr><td><b>Completeness</b></td><td>Is anything blank that should not be?</td><td>58 customers have no email</td></tr>
<tr><td><b>Uniqueness</b></td><td>Does anything appear twice that should appear once?</td><td>147 order lines repeat the same product in the same order</td></tr>
<tr><td><b>Validity</b></td><td>Does each value look the way it should?</td><td>50 emails are typed in capital letters</td></tr>
<tr><td><b>Consistency</b></td><td>Do two tables tell the same story?</td><td>460 Cancelled orders are marked as Paid</td></tr>
<tr><td><b>Timeline logic</b></td><td>Did things happen in a possible order?</td><td>5,037 orders are dated before the customer signed up</td></tr>
<tr><td><b>Plausibility</b></td><td>Do the numbers make business sense?</td><td>Every payment matches the value of its order lines</td></tr>
</table>
<p>Do not worry about memorising the six names. We will meet each one with a real example, and by the end they will feel like common sense.</p>`
    },
    {
      type: 'explain',
      title: 'The one trick behind every check',
      body: `<p>Here is the secret that makes auditing easy: <b>every single check uses the same trick</b>.</p>
<ol>
<li>Write a query that finds the rows that <b>break the rule</b>.</li>
<li>Count them.</li>
</ol>
<p>That’s it. If the count is <b>0</b>, the check passed. If it is bigger than 0, you have a finding, and the count tells you how big the problem is.</p>
<p>For example, the rule “a Completed order should have a Paid payment” becomes the query “find the Completed orders whose payment is <i>not</i> Paid, and count them”. You are always searching for the troublemakers, never for the good rows. Keep that in mind and every query in this lesson will make sense.</p>`
    },
    {
      type: 'explain',
      title: 'Check 1, Completeness: is anything missing?',
      body: `<p>The simplest question first: are there blanks? In SQL a blank is called <b>NULL</b> (you met it in Lesson 1.3), and we find it with <code>IS NULL</code>. Not <code>= NULL</code>: NULL means “unknown”, so nothing can ever be equal to it, and only <code>IS NULL</code> works.</p>
<p>But a good auditor learns one more lesson straight away: <b>not every blank is a problem</b>. A delivery that is still on the road has no arrival date yet. That blank is perfectly sensible. The skill is to separate <b>real gaps</b> from <b>gaps that make sense</b>.</p>`
    },
    {
      type: 'try',
      title: 'Who has no email?',
      body: `<p>First, just look at the people. These are the first five customers with no email address (andre, todd, lisa and so on). In total there are <b>58 out of 2,000</b> customers, which is <b>2.9%</b>. Seeing real rows first helps you remember that every “failing row” in an audit is a real person or a real transaction.</p>`,
      code: `SELECT customer_id, customer_name, email
FROM customers
WHERE email IS NULL
ORDER BY customer_id
LIMIT 5;`
    },
    {
      type: 'try',
      title: 'A completeness check across several columns',
      body: `<p>Instead of checking one column at a time, we can stack several checks in one result with <code>UNION ALL</code>. Think of it as <b>placing several short lists on top of each other to make one longer list</b>. Each little SELECT contributes one row: the name of what we checked, and how many blanks it found.</p>
<p>Read the result like an inspector. Only <b>customers.email</b> (58) has blanks among the important columns. The delivery dates are the interesting part: <b>1,239</b> are missing, which sounds alarming, but the last row shows that <b>all 1,239</b> belong to deliveries that are still In Transit or Failed. So no arrival date exists yet, and nothing is wrong. That is a gap that makes sense.</p>`,
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
      body: `<p>That is 2.9% of customers. In this business, emails are used for marketing campaigns, not for billing or delivery.</p>`,
      options: ['Critical: stop all reporting until every email is filled in', 'Low severity: report it, note that it only affects email campaigns, and carry on', 'Delete those 58 customers from the database', 'Fill the blanks with a made-up address like unknown@mail.com'],
      answer: 1,
      why: [
        'Severity depends on the damage a problem can do. A missing contact detail does not stop us from measuring revenue.',
        'Exactly! Severity means “how much damage can this do to the decisions we are making?” Missing emails only hurt email campaigns. So: write it down, give the number, and move on.',
        'Deleting customers would also delete their orders and payments from your history. Never remove real data just to make a problem disappear.',
        'Fake values are worse than blanks. They look real, and one day somebody will email them or count them as genuine.'
      ]
    },
    {
      type: 'explain',
      title: 'Check 2, Timeline logic: did things happen in a possible order?',
      body: `<p>Time only moves forward. A customer cannot buy something before they have signed up. A delivery cannot arrive before it was dispatched. An employee cannot process an order before the day they were hired. These are rules <b>nobody has to explain</b>, which makes them wonderful checks: if the data breaks them, something is off in how the data was recorded.</p>
<p>To test a rule that involves two dates in two different tables, we <code>JOIN</code> the tables, then compare the dates. Because our dates are written year first (<code>2026-06-01</code>), plain text comparison works correctly: an earlier date is a “smaller” value.</p>`
    },
    {
      type: 'try',
      title: 'Orders placed before the customer signed up: the worst five',
      body: `<p>This query joins every order to its customer and keeps only the orders dated <b>before</b> the customer’s signup date. We sort so the most extreme cases come first.</p>
<p>Look at the top row. Order <b>1042</b> was placed on <b>2023-01-06</b> by a customer whose signup date is <b>2026-06-01</b>. The order is dated <b>1,242 days earlier</b> than the signup, more than three years. Either the dates are wrong, or “signup date” means something other than what its name suggests. We will come back to that.</p>`,
      code: `SELECT o.order_id,
       o.customer_id,
       o.order_date,
       c.signup_date,
       CAST(julianday(c.signup_date) - julianday(o.order_date) AS INTEGER) AS days_early
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.order_date < c.signup_date
ORDER BY days_early DESC, o.order_id
LIMIT 5;`
    },
    {
      id: 'sql-8-5-ex1',
      type: 'exercise',
      title: 'Your turn: how many orders break the signup rule?',
      body: `<p>Now count them all. Return one number called <code>orders_before_signup</code>: the number of orders whose <code>order_date</code> is earlier than the customer’s <code>signup_date</code>.</p>
<p><b>Think before you type:</b> it is the same join as the query above, but you do not need the extra columns, the sorting or the LIMIT. You only need a COUNT.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Join the two tables: FROM orders o JOIN customers c ON c.customer_id = o.customer_id. Then keep the rule-breakers with WHERE o.order_date < c.signup_date.`,
        `Replace the column list with COUNT(*) AS orders_before_signup.`,
        `SELECT COUNT(*) AS orders_before_signup FROM orders o JOIN customers c ON c.customer_id = o.customer_id WHERE o.order_date < c.signup_date;`
      ],
      solution: `SELECT COUNT(*) AS orders_before_signup FROM orders o JOIN customers c ON c.customer_id = o.customer_id WHERE o.order_date < c.signup_date;`,
      ordered: true
    },
    {
      type: 'try',
      title: 'A second timeline rule, and how big the problem really is',
      body: `<p>A raw count can mislead, so we add a <b>percentage of all orders</b> (the little <code>(SELECT COUNT(*) FROM orders)</code> inside the brackets fetches the total of 10,000 to divide by). The second rule is: orders handled by an employee <b>before that employee was hired</b>. One example is order 8908, dated 2023-01-02 and handled by a support agent whose hire date is 2026-06-17.</p>
<p>Read the numbers: <b>5,037 orders (50.4%)</b> break the signup rule and <b>4,927 orders (49.3%)</b> break the hire-date rule. These are not rare accidents. About <b>half</b> of everything fails. Keep that in mind for the next question.</p>`,
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
      options: ['Delete the 5,037 orders because they are obviously wrong', 'Change each signup_date to match the first order date and move on', 'Report it with the numbers and a few examples, and ask the data owners what signup_date really means before touching anything', 'Ignore it, because it does not affect revenue'],
      answer: 2,
      why: [
        'Deleting half of all orders would wreck revenue, cohorts and every report, all based on a guess.',
        'Quietly rewriting a column is how analysts create numbers that nobody can trace. Maybe signup_date means something else (the day a loyalty account was opened, or a record migrated from an old system). Only the owners know.',
        'Yes! When half the rows break a rule, the problem is usually the rule, or the meaning of the field, rather than five thousand separate mistakes. So you quantify it, show examples, ask the owners, and put a caveat next to any metric that uses signup_date (like the cohorts in Lesson 8.2).',
        'It may not change today’s revenue, but it affects customer-age and cohort analysis, and it points to a weakness in how the data is recorded.'
      ]
    },
    {
      type: 'explain',
      title: 'Check 3, Consistency: two witnesses, one story',
      body: `<p>Imagine two witnesses to the same event. One says “the order was cancelled.” The other says “the customer paid for it.” Both statements could not be true at the same time, or at least someone owes the customer a refund.</p>
<p>Inside a database, every table is a witness. The <code>orders</code> table says what happened to the order. The <code>payments</code> table says what happened to the money. The deliveries table says what happened to the parcel. A <b>consistency check</b> joins two witnesses and looks for stories that contradict each other.</p>
<p>The pattern never changes: <b>join the two tables, then filter for a combination that should be impossible.</b></p>`
    },
    {
      type: 'try',
      title: 'Cancelled orders where the customer is marked as Paid',
      body: `<p>Here are the first five. Order 2 is <b>Cancelled</b>, yet its payment is marked <b>Paid</b> with an amount of 325,801.21. Either the customer was never refunded, or the status columns are updated by different systems at different times. We cannot tell from the data alone, and that is an important point: <b>the audit finds the contradiction, but only the people who run the business can explain it.</b></p>`,
      code: `SELECT o.order_id, o.order_status, p.payment_status, p.amount
FROM payments p
JOIN orders o ON o.order_id = p.order_id
WHERE p.payment_status = 'Paid'
  AND o.order_status = 'Cancelled'
ORDER BY o.order_id
LIMIT 5;`
    },
    {
      type: 'try',
      title: 'How much money is involved?',
      body: `<p>Counting is good, but a finance director wants to hear <b>money</b>. This version adds up the amounts. <b>460</b> Cancelled orders and <b>437</b> Returned orders carry a Paid payment. That is <b>897 payments and about 141.5 million</b> in total. Now it is not a technical curiosity any more: it is a number somebody in finance will want to look at today.</p>`,
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
      title: 'Your turn: count the Paid-on-Cancelled payments',
      body: `<p>Return one number called <code>paid_on_cancelled</code>: how many payments have <code>payment_status</code> <b>Paid</b> while their order has <code>order_status</code> <b>Cancelled</b>.</p>
<p><b>Think before you type:</b> take the five-row query above, keep the same join and the same two conditions in WHERE, and swap the column list for a COUNT. No need for ORDER BY or LIMIT.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `You need payments joined to orders on order_id. Both conditions go in WHERE, joined with AND.`,
        `SELECT COUNT(*) AS paid_on_cancelled FROM payments p JOIN orders o ON o.order_id = p.order_id WHERE p.payment_status = 'Paid' AND o.order_status = 'Cancelled';`
      ],
      solution: `SELECT COUNT(*) AS paid_on_cancelled FROM payments p JOIN orders o ON o.order_id = p.order_id WHERE p.payment_status = 'Paid' AND o.order_status = 'Cancelled';`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Check 4, Validity: does the value look right?',
      body: `<p>Validity is about <b>format</b>. A value can be present and still be awkward to use. Think about searching a contact list on your phone: if you type “eugene” and the contact was saved as “EUGENE”, a strict system may fail to find it. Computers can be that literal.</p>
<p>In TradeFlow, the customers table has two format problems: <b>emails typed in capital letters</b>, and <b>names that carry a title or suffix</b>, such as “Dr.” at the front or “PhD” at the end. Neither is “wrong”, but both cause trouble when you match, group or sort, as you saw in Module 2.</p>
<div class="callout watch"><b>A small NULL surprise:</b> the test <code>email &lt;&gt; LOWER(email)</code> (“the email is different from its lowercase version”) never counts the 58 blank emails. Comparing a blank with anything gives “unknown”, not “true”. That is actually what we want here: the blanks were already counted in the completeness check, so each problem is counted <b>exactly once</b>.</div>`
    },
    {
      type: 'try',
      title: 'Emails typed in capital letters',
      body: `<p>Look at customer 27: <b>EUGENE.WALTON941@GMAIL.COM</b>. A search for <code>'eugene.walton941@gmail.com'</code> would miss this customer completely. The query compares each email with <code>LOWER(email)</code>, its lowercase twin. If they differ, there must be capital letters in it. There are <b>50</b> such customers in total.</p>`,
      code: `SELECT customer_id, customer_name, email
FROM customers
WHERE email <> LOWER(email)
ORDER BY customer_id
LIMIT 4;`
    },
    {
      id: 'sql-8-5-ex3',
      type: 'exercise',
      title: 'Your turn: how many emails are capitalised?',
      body: `<p>Return one number called <code>capitalised_emails</code>: the customers whose <code>email</code> is not equal to <code>LOWER(email)</code>. You should get the same 50 we talked about.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Use WHERE email <> LOWER(email), then COUNT(*). The blank emails drop out on their own.`,
        `SELECT COUNT(*) AS capitalised_emails FROM customers WHERE email <> LOWER(email);`
      ],
      solution: `SELECT COUNT(*) AS capitalised_emails FROM customers WHERE email <> LOWER(email);`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Names that start with a title',
      body: `<p>Names are supposed to be names. But look at these: <b>Dr. Steven Martin</b>, <b>Mrs. Rachel Gibson</b>, <b>Mr. Jeremiah Reeves</b>, and <b>Miss Debra Williams PhD</b> (a title at the front <i>and</i> a suffix at the end!). If you group customers by name, “Steven Martin” and “Dr. Steven Martin” would count as two different people.</p>
<p>The query uses <code>LIKE</code> with a <code>%</code>, which means “anything can follow”. So <code>'Dr.%'</code> reads “starts with Dr. and then anything”. Several patterns are joined with <code>OR</code>.</p>`,
      code: `SELECT customer_id, customer_name
FROM customers
WHERE customer_name LIKE 'Dr.%'
   OR customer_name LIKE 'Mr.%'
   OR customer_name LIKE 'Mrs.%'
   OR customer_name LIKE 'Ms.%'
   OR customer_name LIKE 'Miss %'
ORDER BY customer_id
LIMIT 5;`
    },
    {
      id: 'sql-8-5-ex4',
      type: 'exercise',
      title: 'Your turn: how many names start with a title?',
      body: `<p>Return one number called <code>names_with_titles</code>: the customers whose <code>customer_name</code> starts with <b>Dr.</b>, <b>Mr.</b>, <b>Mrs.</b>, <b>Ms.</b> or <b>Miss</b> followed by a space.</p>
<p><b>Think before you type:</b> copy the five patterns from the query above, keep the <code>OR</code> between them, and swap the column list for a COUNT. For “Miss” use <code>'Miss %'</code> with the space, so a name like “Missy” would not be caught by mistake.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `WHERE customer_name LIKE 'Dr.%' OR customer_name LIKE 'Mr.%' OR ... five patterns in total.`,
        `SELECT COUNT(*) AS names_with_titles FROM customers WHERE customer_name LIKE 'Dr.%' OR customer_name LIKE 'Mr.%' OR customer_name LIKE 'Mrs.%' OR customer_name LIKE 'Ms.%' OR customer_name LIKE 'Miss %';`
      ],
      solution: `SELECT COUNT(*) AS names_with_titles FROM customers WHERE customer_name LIKE 'Dr.%' OR customer_name LIKE 'Mr.%' OR customer_name LIKE 'Mrs.%' OR customer_name LIKE 'Ms.%' OR customer_name LIKE 'Miss %';`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Checks 5 and 6: the ones that come back clean (and one that looks guilty but is not)',
      body: `<p>Not every check finds trouble, and that is good news you should <b>report with pride</b>. “We tested this and it is clean” tells your reader that the rest of the data is more trustworthy. Let’s look at three more checks.</p>
<p><b>Missing partners (completeness between tables).</b> Does every order have a payment? To find “things that have no partner”, we use a <code>LEFT JOIN</code> and then keep the rows where the partner is blank. Read it like this: <i>“List every order, and attach its payment if it has one. If it has none, the payment side stays blank. Now keep only the orders where the payment side is blank.”</i> That gives you the orders without a payment.</p>`
    },
    {
      type: 'try',
      title: 'Orders without a payment',
      body: `<p>Result: <b>0</b>. Every one of the 10,000 orders has a payment. That is a check passed, and it is worth a line in your report.</p>`,
      code: `SELECT COUNT(*) AS orders_without_payment
FROM orders o
LEFT JOIN payments p ON p.order_id = o.order_id
WHERE p.order_id IS NULL;`
    },
    {
      type: 'try',
      title: 'Do the payments match the order lines? (plausibility)',
      body: `<p>This is a plausibility check, and a beautiful one. Each order has lines (items bought at a price), and a payment. If the data is healthy, <b>the payment should equal the total of the lines</b>. We add up the lines per order (<code>quantity * unit_price</code>), join them to the payments, and compare, allowing one cent of tolerance for rounding.</p>
<p>Result: <b>10,000 orders checked, 10,000 match, 0 do not.</b> To the cent. When money reconciles perfectly like this, you can trust the revenue numbers.</p>`,
      code: `SELECT COUNT(*) AS orders_checked,
       SUM(CASE WHEN ABS(p.amount - i.line_total) <= 0.01 THEN 1 ELSE 0 END) AS matching,
       SUM(CASE WHEN ABS(p.amount - i.line_total) > 0.01 THEN 1 ELSE 0 END) AS not_matching
FROM payments p
JOIN (
    SELECT order_id, SUM(quantity * unit_price) AS line_total
    FROM order_items
    GROUP BY order_id
) i ON i.order_id = p.order_id;`
    },
    {
      type: 'try',
      title: 'The one that looks guilty: repeated order lines',
      body: `<p>A uniqueness check asks whether anything appears twice. Here, <b>147</b> combinations of (order, product) appear on more than one line, spread over <b>146</b> orders. At first glance that looks like duplicated data. But look at the second row of the result: those extra lines are worth <b>8,989,289.32</b>, and we just saw that the payments match the lines <b>to the cent</b>. If those lines were duplicates, the payments would not match. The customers genuinely paid for them.</p>
<p>So they are <b>real purchases</b> (someone adding the same item to an order twice). This is why an audit flags things for <i>investigation</i> and does not delete them on sight. (The query numbers the lines within each pair with <code>ROW_NUMBER()</code>, from Module 6, and treats the 2nd, 3rd... line as the “extra” ones.)</p>`,
      code: `WITH numbered AS (
    SELECT order_id, product_id,
           quantity * unit_price AS line_value,
           ROW_NUMBER() OVER (PARTITION BY order_id, product_id ORDER BY order_item_id) AS line_no
    FROM order_items
)
SELECT COUNT(*) AS extra_lines,
       COUNT(DISTINCT order_id) AS orders_affected,
       ROUND(SUM(line_value), 2) AS money_in_extra_lines
FROM numbered
WHERE line_no > 1;`
    },
    {
      id: 'sql-8-5-c3',
      type: 'check',
      title: 'The audit flags 147 repeated order lines. Should you delete them?',
      body: `<p>Think about what you just saw: the payments match the order lines in 10,000 of 10,000 orders.</p>`,
      options: ['Yes, duplicates are always errors', 'No: they look like repeats but they are real purchases. Removing them would lose 8,989,289.32 of sales and break the payment totals, so flag them for investigation and leave them in', 'Yes, but only the 28 that are exact copies', 'No, but only because the rule says never to delete anything'],
      answer: 1,
      why: [
        'Not always. The same product can legitimately appear on two lines of one order. Here the payments only add up if the repeated lines stay.',
        'Exactly! The deciding test is reconciliation: with every line kept, payments match the lines in all 10,000 orders. Drop the repeats and 146 orders stop matching. An audit flag is a question, not a verdict.',
        'Even exact copies could be genuine (the same item and quantity bought twice in one basket). Without evidence from the owners of the data, nothing should be deleted.',
        'The real reason is not a slogan. It is evidence: the numbers prove that the lines are genuine.'
      ]
    },
    {
      type: 'explain',
      title: 'The audit table: every check in one view',
      body: `<p>You now know every ingredient. The professional move is to stop running checks one at a time and put <b>all of them into one table</b>, stacked with <code>UNION ALL</code>, with three columns:</p>
<ul>
<li><b>check_name</b>: what rule we tested, in words a manager understands</li>
<li><b>failing_rows</b>: how many rows broke the rule (0 means passed)</li>
<li><b>severity</b>: High, Medium or Low. This one is a <b>judgement</b>, not a calculation. The question to ask is “how much could this distort a decision?” Anything that touches <b>money</b> is High. Anything that is only cosmetic is Low.</li>
</ul>
<p>Sort by <code>failing_rows</code> so the biggest problems come first, and <b>keep the zeros</b> at the bottom. A row that says “Orders without a payment: 0” is a statement of good news. A report that shows only the bad news makes the data look worse than it is.</p>`
    },
    {
      type: 'try',
      title: 'The full TradeFlow data-quality audit',
      body: `<p>Twenty checks, one result. This is long, but notice that it is just the same small pattern repeated twenty times. Press <b>Chart it</b> to see where the problems concentrate, then read it like an auditor:</p>
<ul>
<li>The <b>timeline problems</b> are the biggest by count (5,037 and 4,927), but they depend on what those date fields really mean, so they need a conversation, not a fix.</li>
<li>The <b>High severity</b> items touch money or deliveries: Completed orders not fully paid (<b>1,176</b>), Completed orders not delivered (<b>994</b>), Paid on Cancelled (<b>460</b>) and Paid on Returned (<b>437</b>). These deserve attention first.</li>
<li>The <b>Low severity</b> items are cosmetic: formats, titles and missing emails.</li>
<li>The <b>zeros at the bottom are wins</b>: no orphan records, every order has a payment, every payment matches its order lines, and no payment or dispatch happens before its order.</li>
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
      id: 'sql-8-5-ex5',
      type: 'exercise',
      title: 'Challenge: build a mini audit',
      body: `<p>Build a small audit yourself. Return a table with two columns, <code>check_name</code> and <code>failing_rows</code>, and exactly <b>four rows</b>, sorted so the biggest number is first. Use these exact names:</p>
<ul>
<li><code>Orders before signup</code>: orders dated before the customer’s signup date</li>
<li><code>Capitalised emails</code>: emails not equal to their lowercase version</li>
<li><code>Paid on cancelled orders</code>: Paid payments on Cancelled orders</li>
<li><code>Completed but undelivered</code>: Completed orders whose delivery status is In Transit or Failed</li>
</ul>
<p><b>Think before you type:</b> you have already written three of these four counts in this lesson. Each becomes one small SELECT of the form <code>SELECT 'the name' AS check_name, COUNT(*) AS failing_rows FROM ... WHERE ...</code>. Put <code>UNION ALL</code> between the four, and a single <code>ORDER BY failing_rows DESC</code> at the very end. Only the first SELECT needs the <code>AS</code> names, because it decides the column names for the whole stack.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Start with the first check: SELECT 'Orders before signup' AS check_name, COUNT(*) AS failing_rows FROM orders o JOIN customers c ON c.customer_id = o.customer_id WHERE o.order_date < c.signup_date. Then write UNION ALL and the next check.`,
        `The fourth check joins orders to deliveries: WHERE o.order_status = 'Completed' AND d.delivery_status IN ('In Transit', 'Failed'). When you are done, your four numbers should be 5037, 994, 460 and 50.`,
        `SELECT 'Orders before signup' AS check_name, COUNT(*) AS failing_rows FROM orders o JOIN customers c ON c.customer_id = o.customer_id WHERE o.order_date < c.signup_date UNION ALL SELECT 'Capitalised emails', COUNT(*) FROM customers WHERE email <> LOWER(email) UNION ALL SELECT 'Paid on cancelled orders', COUNT(*) FROM payments p JOIN orders o ON o.order_id = p.order_id WHERE p.payment_status = 'Paid' AND o.order_status = 'Cancelled' UNION ALL SELECT 'Completed but undelivered', COUNT(*) FROM orders o JOIN deliveries d ON d.order_id = o.order_id WHERE o.order_status = 'Completed' AND d.delivery_status IN ('In Transit', 'Failed') ORDER BY failing_rows DESC;`
      ],
      solution: `SELECT 'Orders before signup' AS check_name, COUNT(*) AS failing_rows FROM orders o JOIN customers c ON c.customer_id = o.customer_id WHERE o.order_date < c.signup_date UNION ALL SELECT 'Capitalised emails', COUNT(*) FROM customers WHERE email <> LOWER(email) UNION ALL SELECT 'Paid on cancelled orders', COUNT(*) FROM payments p JOIN orders o ON o.order_id = p.order_id WHERE p.payment_status = 'Paid' AND o.order_status = 'Cancelled' UNION ALL SELECT 'Completed but undelivered', COUNT(*) FROM orders o JOIN deliveries d ON d.order_id = o.order_id WHERE o.order_status = 'Completed' AND d.delivery_status IN ('In Transit', 'Failed') ORDER BY failing_rows DESC;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Telling the story: how to report what you found',
      body: `<p>Finding problems is only half of the job. The other half is explaining them so that a busy person can act. Here is how a good finding sounds when you write it in plain words, using one of ours:</p>
<div class="callout work"><b>Finding:</b> 460 orders that are marked Cancelled still have a payment marked Paid.<br><b>Evidence:</b> the query above, and order numbers 2, 10, 27, 48 and 57 as examples.<br><b>Why it matters:</b> about 73.1 million of cash may be owed back to customers, or our order status may be out of date.<br><b>Suggested action:</b> finance to check whether refunds were issued.<br><b>Owner:</b> finance team.</div>
<p>Notice the order: facts first, opinions last. And notice what is missing: any sentence like “I fixed it.” <b>Never silently fix data.</b> If you quietly change numbers, nobody can trace where your results came from. Instead, tell the people who own the data, and write down which version of the data your numbers came from.</p>
<div class="callout work"><b>At work:</b> mature teams do not run these checks by hand once. They turn them into <b>automatic tests</b> that run every night, using tools such as <b>dbt tests</b> or <b>Great Expectations</b>. Those tools check things like “not blank”, “no repeats”, “every order has a customer” and “status is one of the allowed values”, and they alert somebody when a count goes above zero. The audit table you built is the idea behind them, written by hand.</div>
<p>Here is what you can now do that you couldn’t before:</p>
<ul>
<li>Audit a database with the six checks: completeness, uniqueness, validity, consistency, timeline logic and plausibility</li>
<li>Tell <b>real gaps</b> from <b>gaps that make sense</b>, and rate severity by the damage to decisions</li>
<li>Find contradictions between tables by joining them, and find missing partners with LEFT JOIN</li>
<li>Stack all your checks into <b>one audit table</b> with UNION ALL, and keep the zeros</li>
<li>Report findings clearly, with numbers and examples, without silently “fixing” anything</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>You receive a new dataset. How do you check its quality before analysing it?</li>
<li>About half the orders are dated before the customer’s signup date. What do you do?</li>
<li>When is a duplicate row an error, and when is it not?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I start by looking at it: row counts, ranges and distinct values. Then I test completeness, uniqueness, validity, consistency between tables, date logic and plausibility with counting queries, and I reconcile totals against a number the business already trusts. I report the findings with a severity before building anything on top.</p>
<p><b>2.</b> I quantify it with the count, the percentage and the worst examples, and check which tables and fields are involved. Then I ask the data owners what the field really means. When half the rows fail a rule, the rule or the field definition is usually the issue, so I would not delete or rewrite anything, and I would add a caveat to any metric that depends on it.</p>
<p><b>3.</b> A duplicate is an error when the same real-world event was recorded twice, such as one transaction loaded twice. It is not an error when the data legitimately contains repeated lines, such as the same product on two lines of one order. The deciding evidence is whether the totals still reconcile with and without the repeats.</p>
</details>
<p><b>Coming next, the final lesson of the SQL track:</b> a <b>mock interview</b>. Classic SQL interview problems on real TradeFlow data (the second-highest value, the median, the top product in each category, streaks of busy days), a calm method for solving any problem under pressure, and a cheat sheet to keep. You have everything you need.</p>`
    }
  ]
}
);
