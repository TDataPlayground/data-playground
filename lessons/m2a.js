LESSONS.push(
{
  id: 'sql-2-1',
  track: 'sql',
  title: '2.1 SELECT in depth: choosing, renaming and calculating',
  tables: ['customers', 'products', 'payments'],
  intro: `Marketing wants a customer list for a campaign. They don’t want six messy columns. They want something tidy: a name, a country, a friendly label, and no repeats. That is a <b>SELECT</b> job, and SELECT is far more powerful than just picking columns. In this lesson you will <b>choose</b>, <b>rename</b>, <b>de-duplicate</b> and even <b>calculate</b> new columns.`,
  steps: [
    {
      type: 'explain',
      title: 'SELECT is your shopping list',
      body: `<div class="callout analogy"><b>The big idea:</b> <code>SELECT</code> is where you say <i>exactly what you want to see</i>, like writing a shopping list before going to the market: only the items you need, in the order you want them, with names you recognise, and a few things you make yourself.</div>
<p>That gives SELECT four powers, and you will learn each one in this lesson:</p>
<ol>
<li><b>Choose</b> which columns to show, in any order</li>
<li><b>Rename</b> columns so the result is friendly to read</li>
<li><b>Remove repeats</b> with <code>DISTINCT</code></li>
<li><b>Calculate</b> brand new columns from existing ones</li>
</ol>`
    },
    {
      type: 'try',
      title: 'Power 1: choose, in any order',
      body: `<p>In the customers table, <code>customer_name</code> comes before <code>country</code>. But <b>you</b> decide the order of your result. Run this and see country come first.</p>
<div class="callout work"><b>At work:</b> <code>SELECT *</code> is great for peeking at a table, but professionals name their columns in real queries. It’s clearer to read, it only fetches what you need (faster on big tables), and it won’t change shape if someone adds a column to the table next month.</div>`,
      code: `SELECT country, customer_name
FROM customers
LIMIT 5;`
    },
    {
      type: 'try',
      title: 'Power 2: rename with AS',
      body: `<p><code>AS</code> gives a column a temporary nickname, called an <b>alias</b>. Here <code>customer_name</code> shows as <code>name</code> and <code>country</code> shows as <code>market</code>.</p>
<p>The alias only exists in <b>this result</b>. Nothing in the table changes. If you want a nickname with a space, wrap it in double quotes: <code>AS "Customer Name"</code>. Try it!</p>`,
      code: `SELECT customer_name AS name,
       country AS market
FROM customers
LIMIT 5;`
    },
    {
      id: 'sql-2-1-c1',
      type: 'check',
      title: 'After running that query, what is the column called inside the customers table itself?',
      body: `<p>Think: does an alias change the table, or just the result?</p>`,
      options: ['name', 'customer_name (unchanged)', 'market', 'It is deleted'],
      answer: 1,
      why: [
        'The alias <code>name</code> only appears in the result of that query. The table is untouched.',
        'Yes! An alias is a temporary nickname for one result. The table keeps its original column names.',
        '<code>market</code> was the nickname for country, and it too only lives in the result.',
        'Nothing is deleted. A SELECT only ever looks at data, it never changes it.'
      ]
    },
    {
      id: 'sql-2-1-ex1',
      type: 'exercise',
      title: 'Your turn: tidy list for marketing',
      body: `<p>Show <code>customer_name</code> renamed as <code>name</code> and <code>country</code> renamed as <code>market</code>, for the <b>first 8 customers</b>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Copy the shape of the alias query above, and change LIMIT 5 to LIMIT 8.`,
        `SELECT customer_name AS name, country AS market FROM customers LIMIT 8;`
      ],
      solution: `SELECT customer_name AS name, country AS market FROM customers LIMIT 8;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Power 3: DISTINCT removes repeats',
      body: `<p>The customers table has 2,000 rows. But how many <i>different</i> countries are in it? If you just selected the country column you would get 2,000 rows with endless repeats.</p>
<p><code>DISTINCT</code> says: <b>“show each different value only once.”</b> It is like asking a class of 40 students to stand up once per different birthday month.</p>`
    },
    {
      type: 'try',
      title: 'The countries TradeFlow sells in',
      body: `<p>From 2,000 customers down to <b>5 countries</b>. That is DISTINCT doing its job.</p>`,
      code: `SELECT DISTINCT country
FROM customers;`
    },
    {
      type: 'try',
      title: 'DISTINCT on two columns',
      body: `<p>With two columns, DISTINCT removes repeats of the <b>whole combination</b>. Here you get every different pair of payment method and payment status that exists. There are <b>16</b>: 4 methods times 4 statuses, so every combination really occurs in the data.</p>`,
      code: `SELECT DISTINCT payment_method, payment_status
FROM payments;`
    },
    {
      id: 'sql-2-1-ex2',
      type: 'exercise',
      title: 'Your turn: the product categories',
      body: `<p>List each <b>different</b> product <code>category</code> exactly once.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `You need DISTINCT and the category column from the products table.`,
        `SELECT DISTINCT category FROM products;`
      ],
      solution: `SELECT DISTINCT category FROM products;`,
      ordered: false
    },
    {
      type: 'explain',
      title: 'Power 4: calculate new columns',
      body: `<p>SELECT can do maths. You can add (<code>+</code>), subtract (<code>-</code>), multiply (<code>*</code>) and divide (<code>/</code>) columns, and the answer appears as a brand new column. This new column exists <b>only in your result</b>. Nothing is stored in the table.</p>
<p>Picture a shelf in a shop: 430 earbuds at 52,539 each. The value of that shelf is <code>unit_price * stock_quantity</code>. A new column, made on the spot.</p>`
    },
    {
      type: 'try',
      title: 'The value of the stock on each shelf',
      body: `<p>Look at the last column, <code>stock_value</code>. We made it by multiplying price by quantity. Notice we also gave it an alias, which every calculated column should have, or its name becomes an ugly copy of the formula.</p>`,
      code: `SELECT product_name,
       unit_price,
       stock_quantity,
       unit_price * stock_quantity AS stock_value
FROM products
LIMIT 5;`
    },
    {
      id: 'sql-2-1-ex3',
      type: 'exercise',
      title: 'Your turn: calculate it yourself',
      body: `<p>For the <b>first 5 products</b>, show <code>product_name</code> and a calculated column called <code>stock_value</code> (price times stock quantity). Only those two columns.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Take the last query and remove the two columns you don't need.`,
        `SELECT product_name, unit_price * stock_quantity AS stock_value FROM products LIMIT 5;`
      ],
      solution: `SELECT product_name, unit_price * stock_quantity AS stock_value FROM products LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Bonus: gluing text together',
      body: `<p>You can also join pieces of text into one, using <code>||</code> (two vertical bars). Think of it as glue. You can mix columns with your own text in quotes.</p>
<div class="callout work"><b>In other databases:</b> <code>||</code> works in SQLite, PostgreSQL and Oracle. MySQL and SQL Server use a function called <code>CONCAT(a, b, c)</code> instead (SQL Server also allows <code>+</code>). The idea is identical.</div>`
    },
    {
      type: 'try',
      title: 'Build a friendly label',
      body: `<p>We glued the name, a space, an opening bracket, the country and a closing bracket into <b>one</b> column. Pay attention to the spaces inside the quotes. They matter, because SQL copies them exactly.</p>`,
      code: `SELECT customer_name || ' (' || country || ')' AS customer_label
FROM customers
LIMIT 5;`
    },
    {
      id: 'sql-2-1-ex4',
      type: 'exercise',
      title: 'Your turn: a different label',
      body: `<p>For the <b>first 5 customers</b>, return one column called <code>label</code> that looks like this: <code>Alex Spencer - Rwanda</code> (name, then space, dash, space, then country).</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `You need customer_name, then the text ' - ', then country, all joined with ||.`,
        `SELECT customer_name || ' - ' || country AS label FROM customers LIMIT 5;`
      ],
      solution: `SELECT customer_name || ' - ' || country AS label FROM customers LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Write SQL that humans can read',
      body: `<p>Computers don’t care how your SQL is laid out. <b>Humans do</b>, including the future you in three months. Almost every professional team follows the same simple habits:</p>
<ul>
<li>Write SQL keywords in <b>CAPITALS</b> (<code>SELECT</code>, <code>FROM</code>, <code>WHERE</code>)</li>
<li>Put each main clause on its <b>own line</b></li>
<li>Put each selected column on <b>its own line</b> once there are more than two or three</li>
<li>Leave notes with <code>--</code>: anything after it is ignored by SQL</li>
</ul>
<p>The next card does the same job as an earlier one, but laid out the professional way. Compare how much easier it is to scan.</p>`
    },
    {
      type: 'try',
      title: 'The same query, written like a professional',
      body: `<p>Same result, much easier to read and to fix. Get used to this style from today. It makes you look (and work) like someone who has done this for years.</p>`,
      code: `-- Value of the stock on each shelf, most valuable first
SELECT
    product_name,
    category,
    unit_price * stock_quantity AS stock_value
FROM products
ORDER BY stock_value DESC
LIMIT 5;`
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Choose the columns you want, in the order you want</li>
<li>Rename them with <code>AS</code> (without changing the table)</li>
<li>Remove repeats with <code>DISTINCT</code>, on one column or a combination</li>
<li>Calculate new columns and glue text together with <code>||</code></li>
<li>Lay out SQL the way professionals do</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>Why do professionals avoid <code>SELECT *</code> in production queries?</li>
<li>What does <code>SELECT DISTINCT a, b</code> do?</li>
<li>Does using <code>AS</code> change the underlying table?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> It returns every column, which wastes time and memory on big tables, makes results harder to read, and can silently break downstream reports if the table’s columns change. Naming the columns makes the query clear, faster and stable.</p>
<p><b>2.</b> It returns each different <i>combination</i> of a and b once, removing rows where both values repeat.</p>
<p><b>3.</b> No. An alias only renames a column in that query’s result.</p>
</details>
<p><b>Coming next, Lesson 2.2: Filtering with WHERE.</b> You have used WHERE a little. Now you’ll master it: comparisons, <code>AND</code> and <code>OR</code> (and the bracket mistake that makes numbers three times too big), <code>IN</code>, <code>BETWEEN</code> and <code>LIKE</code>.</p>`
    }
  ]
},
{
  id: 'sql-2-2',
  track: 'sql',
  title: '2.2 Filtering with WHERE: comparisons, IN, BETWEEN and LIKE',
  tables: ['customers', 'products', 'orders'],
  intro: `The sales team keeps sending you requests: <i>“Show me our premium products.” “How many orders were cancelled or returned?” “Which orders were cancelled in the first three months of 2026?” “Who are our Gmail customers in Ghana and Kenya?”</i><br><br>Every one of those is a <b>WHERE</b> sentence. By the end of this lesson you will write them all, and you will know about the bracket mistake that quietly makes a report three times too big.`,
  steps: [
    {
      type: 'explain',
      title: 'WHERE is a bouncer with a rule',
      body: `<div class="callout analogy"><b>The big idea:</b> <code>WHERE</code> is a bouncer at the door of your query. Every row walks up, and the bouncer checks it against your rule. Rows that pass the rule get in. Rows that don’t are left outside.</div>
<p>A rule is built from a <b>comparison</b>. Here are the tools:</p>
<table class="mini"><tr><th>Write this</th><th>Meaning</th></tr>
<tr><td><code>=</code></td><td>equal to</td></tr>
<tr><td><code>&lt;&gt;</code> or <code>!=</code></td><td>not equal to</td></tr>
<tr><td><code>&gt;</code> and <code>&lt;</code></td><td>greater than, less than</td></tr>
<tr><td><code>&gt;=</code> and <code>&lt;=</code></td><td>greater than or equal to, less than or equal to</td></tr></table>`
    },
    {
      type: 'try',
      title: 'Premium products',
      body: `<p>Products priced above 50,000. The answer is <b>13 products</b>. Change the 50000 to something else and run it again to see how the list shrinks or grows.</p>`,
      code: `SELECT product_id, product_name, unit_price
FROM products
WHERE unit_price > 50000;`
    },
    {
      id: 'sql-2-2-ex1',
      type: 'exercise',
      title: 'Your turn: the budget products',
      body: `<p>Show <code>product_id</code>, <code>product_name</code> and <code>unit_price</code> for products that cost <b>less than 1,000</b>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Copy the premium products query and flip the comparison sign.`,
        `SELECT product_id, product_name, unit_price FROM products WHERE unit_price < 1000;`
      ],
      solution: `SELECT product_id, product_name, unit_price FROM products WHERE unit_price < 1000;`,
      ordered: false
    },
    {
      type: 'try',
      title: 'Text must match exactly',
      body: `<p>With text, the <code>=</code> comparison is <b>exact</b>, including capital letters. This asks for <code>'nigeria'</code> in lowercase, and the answer is <b>0</b>, because the data says <code>'Nigeria'</code> with a capital N. No error, just silence.</p>
<p><b>Try it:</b> change <code>'nigeria'</code> to <code>'Nigeria'</code> and run again. You should get 400.</p>`,
      code: `SELECT COUNT(*) AS customers_found
FROM customers
WHERE country = 'nigeria';`
    },
    {
      type: 'explain',
      title: 'AND, OR, NOT and the bracket trap',
      body: `<ul>
<li><code>AND</code>: both rules must pass</li>
<li><code>OR</code>: at least one rule must pass</li>
<li><code>NOT</code>: flips a rule</li>
</ul>
<p>Here is something that catches even experienced people: <b>SQL does AND before OR</b>, just like maths does multiplication before addition. So <code>A OR B AND C</code> is read as <code>A OR (B AND C)</code>, which is usually <i>not</i> what you meant.</p>
<p>Let’s see the damage with real numbers. You want: <i>customers from Ghana or Kenya who signed up in 2026 or later.</i></p>`
    },
    {
      type: 'try',
      title: 'Without brackets: the wrong answer',
      body: `<p>This returns <b>448</b>. Looks plausible, right? But SQL read it as: <i>“every customer from Ghana, OR (customers from Kenya who signed up in 2026)”</i>. So <b>all</b> Ghana customers got in, whenever they signed up.</p>`,
      code: `SELECT COUNT(*) AS wrong_count
FROM customers
WHERE country = 'Ghana'
   OR country = 'Kenya'
  AND signup_date >= '2026-01-01';`
    },
    {
      type: 'try',
      title: 'With brackets: the right answer',
      body: `<p>Now <b>105</b>. The brackets force SQL to settle the country question first, <i>then</i> apply the date rule to everybody. Four times smaller. In a real report, the first number would have gone to your CEO.</p>
<div class="callout watch"><b>Rule for life:</b> whenever you mix AND with OR, add brackets. Always. Even when you think you don’t need them.</div>`,
      code: `SELECT COUNT(*) AS right_count
FROM customers
WHERE (country = 'Ghana' OR country = 'Kenya')
  AND signup_date >= '2026-01-01';`
    },
    {
      id: 'sql-2-2-c1',
      type: 'check',
      title: 'Without brackets, how does SQL read:  A OR B AND C ?',
      body: `<p>Remember: SQL does AND before OR.</p>`,
      options: ['(A OR B) AND C', 'A OR (B AND C)', 'It reads left to right with no priority', 'It refuses and shows an error'],
      answer: 1,
      why: [
        'That would be the case if you wrote the brackets yourself. Without them, SQL does not read it this way.',
        'Yes! AND is stronger than OR, so B AND C is grouped first. This is why brackets matter.',
        'SQL does have a priority order: AND beats OR, like multiplication beats addition.',
        'No error appears. That is exactly what makes this trap dangerous.'
      ]
    },
    {
      type: 'explain',
      title: 'Shortcuts: IN and BETWEEN',
      body: `<p><code>IN</code> saves you from writing OR again and again. <code>status IN ('Cancelled', 'Returned')</code> means “status is any one of these”.</p>
<p><code>BETWEEN</code> checks a range, and it <b>includes both ends</b>. <code>order_date BETWEEN '2026-01-01' AND '2026-03-31'</code> means the first quarter of 2026, with both 1 January and 31 March counted. It works for dates written <code>YYYY-MM-DD</code> because, as you learned in Lesson 1.3, those sort like a calendar.</p>`
    },
    {
      type: 'try',
      title: 'Problem orders',
      body: `<p>Orders that were cancelled or returned. We show the first 10, but across the whole table there are <b>1,034</b> of them. The sales team now knows where to look.</p>`,
      code: `SELECT order_id, order_status
FROM orders
WHERE order_status IN ('Cancelled', 'Returned')
LIMIT 10;`
    },
    {
      type: 'try',
      title: 'Cancelled in the first quarter of 2026',
      body: `<p>A status rule and a date range, joined with AND. <b>42</b> orders match. If your manager asks “how bad was Q1?”, you now have the answer, and the list.</p>`,
      code: `SELECT order_id, customer_id, order_date
FROM orders
WHERE order_status = 'Cancelled'
  AND order_date BETWEEN '2026-01-01' AND '2026-03-31';`
    },
    {
      id: 'sql-2-2-ex2',
      type: 'exercise',
      title: 'Your turn: using IN',
      body: `<p>Show <code>customer_id</code>, <code>customer_name</code> and <code>country</code> for customers from <b>Rwanda or South Africa</b>, using <code>IN</code>. Show only the <b>first 10</b>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Use WHERE country IN ('...', '...') then LIMIT 10.`,
        `SELECT customer_id, customer_name, country FROM customers WHERE country IN ('Rwanda', 'South Africa') LIMIT 10;`
      ],
      solution: `SELECT customer_id, customer_name, country FROM customers WHERE country IN ('Rwanda', 'South Africa') LIMIT 10;`,
      ordered: true
    },
    {
      id: 'sql-2-2-ex3',
      type: 'exercise',
      title: 'Your turn: using BETWEEN',
      body: `<p>Show <code>order_id</code>, <code>order_date</code> and <code>order_status</code> for orders with the status <b>Returned</b> placed during <b>December 2025</b> (1 December to 31 December).</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Combine a status rule with a BETWEEN date range using AND.`,
        `SELECT order_id, order_date, order_status FROM orders WHERE order_status = 'Returned' AND order_date BETWEEN '2025-12-01' AND '2025-12-31';`
      ],
      solution: `SELECT order_id, order_date, order_status FROM orders WHERE order_status = 'Returned' AND order_date BETWEEN '2025-12-01' AND '2025-12-31';`,
      ordered: false
    },
    {
      type: 'explain',
      title: 'LIKE: searching for patterns',
      body: `<p>Sometimes you don’t know the whole value, just a part of it. <code>LIKE</code> lets you search with a <b>pattern</b>, using two special symbols:</p>
<ul>
<li><code>%</code> means “any number of characters, including none”</li>
<li><code>_</code> means “exactly one character”</li>
</ul>
<p>So <code>'Sam%'</code> means “starts with Sam”, <code>'%Pan%'</code> means “contains Pan anywhere”, and <code>'%.com'</code> means “ends with .com”.</p>`
    },
    {
      type: 'try',
      title: 'Names that start with “Sam”',
      body: `<p><b>13</b> customers: Samuel and Samantha. One short pattern replaced a list you would otherwise have to type out by hand.</p>`,
      code: `SELECT customer_id, customer_name
FROM customers
WHERE customer_name LIKE 'Sam%';`
    },
    {
      type: 'try',
      title: 'When a pattern is too loose',
      body: `<p>Looking for frying pans? Look closely at the three results. <b>“Jogger Pants” is in there</b>, because the word Pants contains the letters “Pan”. A pattern matches letters, not meaning.</p>
<p>Fix: make the pattern more specific, like <code>'%Frying Pan%'</code>. Try it.</p>`,
      code: `SELECT product_name
FROM products
WHERE product_name LIKE '%Pan%';`
    },
    {
      type: 'try',
      title: 'A surprise hiding in the emails',
      body: `<p>How many customers use Gmail? <b>618</b>. But watch this: only <b>602</b> emails are written in lowercase <code>gmail.com</code>. The other <b>16</b> are written <code>GMAIL.COM</code> in capitals. In SQLite, <code>LIKE</code> ignores capital letters, so it caught all 618.</p>
<div class="callout work"><b>In other databases:</b> <b>PostgreSQL</b>’s <code>LIKE</code> <i>is</i> case-sensitive (you use <code>ILIKE</code> to ignore case), so the same query there would return 602 and quietly miss 16 customers. MySQL depends on its settings. Always find out how your database behaves before trusting a text search.</div>`,
      code: `SELECT COUNT(*) AS gmail_customers
FROM customers
WHERE email LIKE '%@gmail.com';`
    },
    {
      id: 'sql-2-2-ex4',
      type: 'exercise',
      title: 'Your turn: pattern search',
      body: `<p>Show <code>customer_id</code> and <code>customer_name</code> for customers whose name <b>starts with “Ann”</b>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Use LIKE with a pattern that starts with the letters Ann followed by %.`,
        `SELECT customer_id, customer_name FROM customers WHERE customer_name LIKE 'Ann%';`
      ],
      solution: `SELECT customer_id, customer_name FROM customers WHERE customer_name LIKE 'Ann%';`,
      ordered: false
    },
    {
      id: 'sql-2-2-ex5',
      type: 'exercise',
      title: 'Challenge: the campaign list',
      body: `<p>Marketing wants a Gmail campaign. Show <code>customer_id</code>, <code>customer_name</code> and <code>country</code> for customers who are <b>from Ghana or Kenya</b>, whose email <b>ends with @gmail.com</b>, and who <b>signed up on or after 1 January 2025</b>. Remember your brackets!</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Three rules joined by AND. The country rule needs brackets because it contains an OR. (Or you can use IN.)`,
        `SELECT customer_id, customer_name, country FROM customers WHERE country IN ('Ghana', 'Kenya') AND email LIKE '%@gmail.com' AND signup_date >= '2025-01-01';`
      ],
      solution: `SELECT customer_id, customer_name, country FROM customers WHERE country IN ('Ghana', 'Kenya') AND email LIKE '%@gmail.com' AND signup_date >= '2025-01-01';`,
      ordered: false
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Filter rows with comparison operators, remembering that text must match exactly</li>
<li>Combine rules with <code>AND</code>, <code>OR</code> and <code>NOT</code>, and use <b>brackets</b> to avoid the three-times-too-big mistake</li>
<li>Use <code>IN</code> for lists and <code>BETWEEN</code> for ranges (both ends included)</li>
<li>Search patterns with <code>LIKE</code>, and know that capital letters behave differently in different databases</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is the difference between <code>WHERE a = 1 OR b = 2 AND c = 3</code> and the same with brackets around the first two conditions?</li>
<li>Is <code>BETWEEN 10 AND 20</code> inclusive or exclusive?</li>
<li>What does <code>LIKE '%a%'</code> match, and why can it be slow on a huge table?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Without brackets, AND is evaluated first, so it means <code>a = 1 OR (b = 2 AND c = 3)</code>. With brackets around the first two, it means <code>(a = 1 OR b = 2) AND c = 3</code>. They can return very different rows.</p>
<p><b>2.</b> Inclusive: both 10 and 20 are included.</p>
<p><b>3.</b> It matches any value containing the letter a anywhere. Because the pattern starts with %, the database can’t use an index to jump to the right place and has to read every row, which is slow on big tables.</p>
</details>
<p><b>Coming next, Lesson 2.3: Sorting and top-N.</b> “Who are our newest customers?” “What are our five most expensive products?” You will answer them, draw your first lesson chart, and discover why capital letters and empty cells upset the order of a list.</p>`
    }
  ]
},
{
  id: 'sql-2-3',
  track: 'sql',
  title: '2.3 Sorting and top-N: ORDER BY, LIMIT and OFFSET',
  tables: ['customers', 'products', 'orders', 'payments'],
  intro: `The CEO leans over your shoulder: <i>“Who are our newest customers? What are our five most expensive products? And can I see the product catalogue one page at a time?”</i><br><br>All three are <b>sorting</b> questions. In this lesson you will answer them, draw your first chart inside a lesson, and uncover two real-data surprises: why <b>capital letters</b> and <b>empty cells</b> can wreck the order of a list.`,
  steps: [
    {
      type: 'explain',
      title: 'No sort, no promise',
      body: `<div class="callout analogy"><b>The big idea:</b> without <code>ORDER BY</code>, the database gives you rows in <i>whatever order is easiest for it</i>, with <b>no promise</b> about what that order is. Like a pile of exam scripts dropped on a table. To get “top five scores”, you must sort the pile first.</div>
<ul>
<li><code>ORDER BY column ASC</code>: smallest first (A to Z, oldest to newest). This is the default.</li>
<li><code>ORDER BY column DESC</code>: largest first (Z to A, newest to oldest).</li>
</ul>
<p>And the golden pattern for any “top N” question is: <b>sort, then take the first N</b>, which in SQL is <code>ORDER BY ... DESC LIMIT N</code>.</p>`
    },
    {
      type: 'try',
      title: 'The five cheapest products',
      body: `<p>Sorted from smallest price to largest, then <code>LIMIT 5</code> keeps just the first five. The cheapest product is a Desk Organizer at 577.07.</p>`,
      code: `SELECT product_id, product_name, unit_price
FROM products
ORDER BY unit_price ASC
LIMIT 5;`
    },
    {
      type: 'try',
      title: 'The ten most expensive products, as a chart',
      body: `<p>Flip the sort to <code>DESC</code> and you get the top of the price list. Below the table, a <b>bar chart</b> appeared automatically: your first chart inside a lesson. The rule is simple: the <b>first column becomes the labels</b> and the <b>second column (a number) becomes the bars</b>. You can switch to a line or pie chart, or download it as an image.</p>`,
      chart: 'bar',
      chartTitle: 'Top 10 most expensive products',
      code: `SELECT product_name, unit_price
FROM products
ORDER BY unit_price DESC
LIMIT 10;`
    },
    {
      id: 'sql-2-3-ex1',
      type: 'exercise',
      title: 'Your turn: the five biggest payments',
      body: `<p>Show <code>payment_id</code>, <code>payment_method</code> and <code>amount</code> for the <b>5 largest payments</b>, biggest first.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Sort by amount from largest to smallest, then keep only five rows.`,
        `SELECT payment_id, payment_method, amount FROM payments ORDER BY amount DESC LIMIT 5;`
      ],
      solution: `SELECT payment_id, payment_method, amount FROM payments ORDER BY amount DESC LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Ties, and the tie-breaker habit',
      body: `<p>What if two rows have the same value in the column you sort by? Two customers who signed up on the same day, for example. SQL then puts them in <b>any order it likes</b>, and the order might change next time you run the query. That’s unacceptable for a report.</p>
<p>The fix is to add a <b>second sort column</b> after a comma. If the first column ties, the second one decides. Using a unique column like an ID makes the order completely certain.</p>
<p>Example: <code>ORDER BY signup_date DESC, customer_id ASC</code> means “newest first; if two customers share a date, lower ID first.”</p>`
    },
    {
      type: 'try',
      title: 'The ten newest customers',
      body: `<p>Look at the top two rows: both signed up on <b>2026-06-30</b>. Without the tie-breaker, SQL could show either one first. With <code>customer_id ASC</code>, the order is the same every single time.</p>`,
      code: `SELECT customer_id, customer_name, signup_date
FROM customers
ORDER BY signup_date DESC, customer_id ASC
LIMIT 10;`
    },
    {
      id: 'sql-2-3-c1',
      type: 'check',
      title: 'Why do we add customer_id as a second sort column?',
      body: `<p>Think about the two customers who signed up on the same day.</p>`,
      options: ['To make the query run faster', 'To decide the order when two rows tie, so results are the same every time', 'To remove duplicate rows', 'Because SQL requires two columns'],
      answer: 1,
      why: [
        'It’s not about speed. It’s about getting a predictable, repeatable order.',
        'Yes! A unique tie-breaker removes any doubt about the order, so your report never changes between runs.',
        'Sorting never removes rows. That’s the job of DISTINCT.',
        'SQL does not require it. It’s a professional habit that protects you from unstable results.'
      ]
    },
    {
      id: 'sql-2-3-ex2',
      type: 'exercise',
      title: 'Your turn: newest customers in one country',
      body: `<p>Show <code>customer_id</code>, <code>customer_name</code>, <code>country</code> and <code>signup_date</code> for the <b>5 newest customers from Rwanda</b>. Newest first, with <code>customer_id</code> ascending as the tie-breaker.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `The order of clauses is SELECT, FROM, WHERE, ORDER BY, LIMIT.`,
        `SELECT customer_id, customer_name, country, signup_date FROM customers WHERE country = 'Rwanda' ORDER BY signup_date DESC, customer_id ASC LIMIT 5;`
      ],
      solution: `SELECT customer_id, customer_name, country, signup_date FROM customers WHERE country = 'Rwanda' ORDER BY signup_date DESC, customer_id ASC LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Two real-data surprises: empty cells and capital letters',
      body: `<p>Sorting looks simple until real data gets involved. Two things catch people out:</p>
<ol>
<li><b>Where do empty cells (NULL) go?</b> In SQLite they sort <b>first</b> when you go ascending.</li>
<li><b>Capital letters sort before lowercase letters.</b> Computers compare letters by their internal codes, and all capitals come before all lowercase. So “Zebra” sorts before “apple”.</li>
</ol>
<p>TradeFlow’s emails have both problems. Remember: 58 are missing, and 50 are written in capitals. Watch what happens.</p>`
    },
    {
      type: 'try',
      title: 'Surprise 1: the empty cells come first',
      body: `<p>Sorted by email, the first rows are all empty. Customers 3, 64, 65, 147 and 249 have no email, and SQLite puts empties at the start.</p>
<div class="callout work"><b>In other databases:</b> PostgreSQL and Oracle put NULLs <b>last</b> when sorting ascending. SQL Server and MySQL put them first, like SQLite. To be safe everywhere, you can say it out loud: <code>ORDER BY email NULLS LAST</code> (supported in SQLite, PostgreSQL and Oracle).</div>`,
      code: `SELECT customer_id, email
FROM customers
ORDER BY email
LIMIT 5;`
    },
    {
      type: 'try',
      title: 'Surprise 2: the SHOUTING emails jump the queue',
      body: `<p>With the empties removed, look at the first email: <code>ALEJANDRO.CAMPBELL154@HOTMAIL.COM</code>, in capitals. All 50 capitalised emails sort <i>before</i> every lowercase one, so the list isn’t really alphabetical.</p>`,
      code: `SELECT customer_id, email
FROM customers
WHERE email IS NOT NULL
ORDER BY email, customer_id
LIMIT 5;`
    },
    {
      type: 'try',
      title: 'The fix: sort by a lowercase copy',
      body: `<p><code>LOWER(email)</code> makes a lowercase copy of the email for the sort, without changing the stored email. You can sort by a <b>calculation</b>, not just a column. Now it is truly alphabetical: Aaron comes first. (We’ll meet <code>LOWER</code> and friends properly in the text lesson.)</p>`,
      code: `SELECT customer_id, email
FROM customers
WHERE email IS NOT NULL
ORDER BY LOWER(email), customer_id
LIMIT 5;`
    },
    {
      id: 'sql-2-3-ex3',
      type: 'exercise',
      title: 'Your turn: a truly alphabetical list',
      body: `<p>Show <code>customer_id</code> and <code>email</code> for the <b>first 5 customers who have an email</b>, sorted alphabetically <b>ignoring capital letters</b>. Use <code>customer_id</code> as the tie-breaker.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `You need WHERE email IS NOT NULL, then ORDER BY LOWER(email), customer_id.`,
        `SELECT customer_id, email FROM customers WHERE email IS NOT NULL ORDER BY LOWER(email), customer_id LIMIT 5;`
      ],
      solution: `SELECT customer_id, email FROM customers WHERE email IS NOT NULL ORDER BY LOWER(email), customer_id LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Pages: LIMIT and OFFSET',
      body: `<p>The CEO wants the product catalogue <b>one page at a time</b>. <code>LIMIT</code> says how many rows per page, and <code>OFFSET</code> says how many rows to <b>skip</b> first.</p>
<div class="callout tip"><b>The formula:</b> <code>OFFSET = (page number - 1) x page size</code>. For page 3 with 10 rows per page, skip 20 rows: <code>LIMIT 10 OFFSET 20</code>.</div>
<p>Always sort when paging (here by <code>product_id</code>), otherwise pages could overlap or skip rows.</p>
<div class="callout work"><b>At work:</b> OFFSET is perfect for small tables, but on millions of rows deep pages get slow, because the database still has to count past all the skipped rows. Big systems use a different technique called keyset pagination. Good to know for interviews.</div>`
    },
    {
      type: 'try',
      title: 'Page 3 of the catalogue',
      body: `<p>Ten products per page, skipping the first 20. You land on products 21 to 30.</p>`,
      code: `SELECT product_id, product_name
FROM products
ORDER BY product_id
LIMIT 10 OFFSET 20;`
    },
    {
      id: 'sql-2-3-ex4',
      type: 'exercise',
      title: 'Your turn: page 5',
      body: `<p>Show <code>product_id</code> and <code>product_name</code> for <b>page 5</b> of the catalogue, with <b>8 products per page</b>, sorted by <code>product_id</code>. Work out the OFFSET with the formula.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `OFFSET = (5 - 1) x 8.`,
        `SELECT product_id, product_name FROM products ORDER BY product_id LIMIT 8 OFFSET 32;`
      ],
      solution: `SELECT product_id, product_name FROM products ORDER BY product_id LIMIT 8 OFFSET 32;`,
      ordered: true
    },
    {
      id: 'sql-2-3-ex5',
      type: 'exercise',
      title: 'Challenge: the first orders ever placed',
      body: `<p>Show <code>order_id</code>, <code>order_date</code> and <code>order_status</code> for the <b>5 earliest orders</b> in the company’s history, oldest first. Several orders share the earliest date, so add a tie-breaker: <code>order_id</code> ascending.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        `Sort by order_date ascending, then order_id ascending, and keep five rows.`,
        `SELECT order_id, order_date, order_status FROM orders ORDER BY order_date ASC, order_id ASC LIMIT 5;`
      ],
      solution: `SELECT order_id, order_date, order_status FROM orders ORDER BY order_date ASC, order_id ASC LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned to:</p>
<ul>
<li>Sort with <code>ORDER BY</code>, ascending and descending, and build “top N” answers with <code>LIMIT</code></li>
<li>Add a <b>tie-breaker</b> so results are stable</li>
<li>Handle two real-data surprises: empty cells and capital letters in sorting</li>
<li>Sort by a calculation, like <code>LOWER(email)</code></li>
<li>Paginate with <code>LIMIT</code> and <code>OFFSET</code></li>
<li>Draw a chart straight from a query result</li>
</ul>
<p><b>Interview-style questions:</b></p>
<ol>
<li>How do you get the top 3 most expensive products?</li>
<li>Why is a tie-breaker important in <code>ORDER BY</code>?</li>
<li>Where do NULLs appear when you sort ascending?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> <code>SELECT ... FROM products ORDER BY unit_price DESC LIMIT 3;</code> (and add a tie-breaker if prices might repeat).</p>
<p><b>2.</b> If rows tie on the sort column, the database may return them in any order, and it can change between runs. A unique tie-breaker column makes results repeatable.</p>
<p><b>3.</b> It depends on the database. In SQLite, MySQL and SQL Server, NULLs come first in ascending order. In PostgreSQL and Oracle they come last. You can control it with <code>NULLS FIRST</code> or <code>NULLS LAST</code> where supported.</p>
</details>
<p><b>Coming next, Lesson 2.4: Numbers and calculations.</b> Revenue per order line, rounding, percentages, and a quiet trap called integer division that has ruined many real reports. You’ll also draw a chart of product margins.</p>`
    }
  ]
}
);
