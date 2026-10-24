const TRACKS = [
  { id: 'foundations', title: 'Analyst Foundations', desc: 'Think like an analyst: ask the right questions, understand your data and build a professional workflow.' },
  { id: 'spreadsheets', title: 'Spreadsheets', desc: 'Clean, analyse and summarise data with formulas, lookups and pivot tables.' },
  { id: 'sql', title: 'SQL for Data Analysis', desc: 'Ask databases real questions, from your first SELECT to joins, CTEs and window functions.' },
  { id: 'python', title: 'Python for Data Analysis', desc: 'Pandas, NumPy and visualisation for cleaning, transforming and exploring data at scale.' },
  { id: 'statistics', title: 'Statistics and Probability', desc: 'Probability, hypothesis testing, regression and A/B testing, explained in plain language.' },
  { id: 'visualization', title: 'Visualisation and Storytelling', desc: 'Turn numbers into dashboards and stories that decision makers act on.' },
  { id: 'advanced', title: 'Advanced Analytics', desc: 'Churn, revenue analysis and forecasting: the deep-dive work of senior analysts.' },
  { id: 'professional', title: 'The Professional Analyst', desc: 'Portfolio, interviews, stakeholder communication and presenting to executives.' }
];

const LESSONS = [
{
  id: 'sql-1-1',
  track: 'sql',
  title: '1.1 What is a database, really?',
  tables: ['regions', 'customers', 'employees', 'products', 'orders', 'order_items', 'payments', 'deliveries'],
  intro: `It’s your first morning at <b>TradeFlow</b>, an online marketplace selling across Nigeria, Ghana, Kenya, South Africa and Rwanda. Your new manager hands you a laptop and says: <i>“Everything we know about our business lives in the database. Go and have a look around.”</i><br><br>You open it. Where do you even start? Don’t worry. By the end of this lesson you will know what a database really is, how to read one, and you will have explored all eight of TradeFlow’s tables, including following one customer’s order from start to finish. No experience needed. We start from zero.`,
  steps: [
    {
      type: 'explain',
      title: 'The big idea, in one sentence',
      body: `<div class="callout analogy"><b>The big idea:</b> a database is an organised place where a business keeps its facts, so any question about the business can be answered quickly and correctly.</div>
<p>Think of a well-run kitchen. Rice goes on the rice shelf. Spices go in labelled jars. Plates go in the plate cupboard. When you need pepper, you don’t dig through one giant pile of everything. You go straight to the pepper jar, because someone organised the kitchen.</p>
<p>A database is that organised kitchen, but for facts: <i>who our customers are, what we sell, what people bought, how they paid, whether it arrived.</i></p>
<p>The question you will ask again and again for the rest of your career is simply: <b>“Where does this fact live, and how do I fetch it?”</b></p>`
    },
    {
      type: 'explain',
      title: 'Tables, rows and columns',
      body: `<p>Inside a database, facts are kept in <b>tables</b>. A table is just a list about <i>one kind of thing</i>. You already know one: a class register.</p>
<table class="mini"><tr><th>name</th><th>age</th><th>class</th></tr><tr><td>Ada</td><td>12</td><td>JSS 1</td></tr><tr><td>Tunde</td><td>13</td><td>JSS 2</td></tr><tr><td>Zainab</td><td>12</td><td>JSS 1</td></tr></table>
<div class="note">(An illustration, not TradeFlow data.)</div>
<p>Each <b>row</b> is one thing (one student). Each <b>column</b> is one fact about every one of those things (name, age, class). That is all a table is. If you can read a register, you can read a database table.</p>
<p>TradeFlow has a table exactly like this for its customers. Let’s go and look at it.</p>`
    },
    {
      type: 'try',
      title: 'Your very first query',
      body: `<p>Press <b>Run</b>. Those are five real TradeFlow customers. Each row is one person, and each column is one fact about them.</p>
<p>Look at the first column, <code>customer_id</code>. Every customer has their own number, like an admission number at school. Remember that. It’s going to be important very soon.</p>
<div class="callout tip"><b>Reading your first query, word by word:</b>
<ul>
<li><code>SELECT</code>: “show me”</li>
<li><code>*</code>: “every column”</li>
<li><code>FROM customers</code>: “out of the customers table”</li>
<li><code>LIMIT 5</code>: “only the first five rows”</li>
<li><code>;</code>: the full stop at the end of the sentence</li>
</ul>
Put together: <i>“Show me every column from the customers table, but only the first five rows.”</i> You just wrote SQL.</div>`,
      code: `SELECT * FROM customers LIMIT 5;`
    },
    {
      id: 'sql-1-1-c1',
      type: 'check',
      title: 'In the customers table, what does one row represent?',
      body: `<p>Think about the class register.</p>`,
      options: ['One country', 'One customer', 'One fact about a customer', 'One email address'],
      answer: 1,
      why: [
        'A country is just one fact about a customer, and many customers share the same country. A row is bigger than that.',
        'Yes! One row is one whole customer, and the columns hold the facts about that customer.',
        'Close, but a single fact is one cell. A row is the whole set of facts about one customer.',
        'An email is one fact about a customer (and a few customers don’t even have one). A row is a whole customer.'
      ]
    },
    {
      type: 'explain',
      title: 'SQL: how you ask a database a question',
      body: `<p>You don’t search a database by scrolling. You write a short sentence in a language called <b>SQL</b> (say the letters “S-Q-L”, or “sequel”: both are fine). A sentence you send to the database is called a <b>query</b>, which is just a fancy word for a question.</p>
<p>The good news: SQL reads almost like English. <code>SELECT * FROM customers</code> is basically “show me everything from customers”.</p>
<div class="callout work"><b>At work:</b> SQL is one of the most requested skills in data analyst job postings around the world, and the core ideas you are learning work in every major database.</div>`
    },
    {
      id: 'sql-1-1-ex1',
      type: 'exercise',
      title: 'Your turn: a new table',
      body: `<p>The <code>products</code> table holds everything TradeFlow sells. Show <b>all columns</b> and the <b>first 5 rows</b>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        'Copy the shape of the query you just ran, but change the table name.',
        'It starts with SELECT * FROM and ends with LIMIT 5;'
      ],
      solution: `SELECT * FROM products LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Why eight tables and not one giant one?',
      body: `<p>TradeFlow doesn’t keep everything in one giant table. It keeps <b>eight</b>. Why?</p>
<p>Imagine one huge sheet with a row for every item ever bought, and every row repeats the customer’s name, email and country. A customer who shops 40 times appears 40 times. Now she changes her email. You must fix 40 rows. Miss one, and your database now holds <b>two different answers</b> to the question “what is her email?”, and nobody knows which one is right. That is a disaster for a company.</p>
<div class="callout analogy"><b>The fix:</b> write every fact down once, in the right place, and connect the places with ID numbers.</div>
<p>Customer details live in the <code>customers</code> table, once. Orders live in <code>orders</code>, and each order just carries the customer’s ID number, like writing a student’s admission number on an exam paper instead of copying their whole life story onto it.</p>
<p>Tables connected by IDs is what makes a database <b>relational</b>. That is where the name <i>relational database</i> comes from.</p>`
    },
    {
      type: 'explain',
      title: 'Meet the cast: TradeFlow’s eight tables',
      body: `<p>Picture a supermarket. When you pay, you get a receipt: the top shows who, when and the status, and below it are the lines of what you bought. TradeFlow’s tables follow the same idea:</p>
<ul>
<li><code>regions</code> (50 rows): the places TradeFlow operates in, 10 per country</li>
<li><code>customers</code> (2,000): the people who buy</li>
<li><code>employees</code> (200): TradeFlow’s staff</li>
<li><code>products</code> (150): everything for sale</li>
<li><code>orders</code> (10,000): one row per purchase, like the top of a receipt</li>
<li><code>order_items</code> (25,000): the lines on the receipt, meaning which product and how many</li>
<li><code>payments</code> (10,000): how each order was paid</li>
<li><code>deliveries</code> (9,500): how each order travelled to the customer</li>
</ul>
<div class="callout tip"><b>Tip:</b> the panel near the top of this page, called <b>Tables in this lesson</b>, lists every table with its columns and row count. Open it whenever you forget what a table holds.</div>`
    },
    {
      type: 'try',
      title: 'Ask the database for its own table of contents',
      body: `<p>Every database keeps a list of what it contains. In SQLite (the database running in your browser) that list is called <code>sqlite_master</code>. This query asks: “what tables exist?” You should see all eight, in the order we met them.</p>
<div class="callout work"><b>At work:</b> other databases do this differently. PostgreSQL, MySQL and SQL Server use something called <code>information_schema</code>. The idea is the same: a database can always tell you what’s inside it.</div>`,
      code: `SELECT name FROM sqlite_master WHERE type = 'table';`
    },
    {
      type: 'explain',
      title: 'Let’s play detective: follow order number 1',
      body: `<p>Now for the fun part. We’ll follow <b>order number 1</b> through the database: the order itself, the customer, what was bought, how it was paid and whether it arrived. Each table holds one piece of the story.</p>
<p>You’ll see a new word, <code>WHERE</code>. It’s a filter that means <b>“only the rows where this is true”</b>. We’ll study it properly soon. For now, just read it as plain English.</p>`
    },
    {
      type: 'try',
      title: 'Clue 1: the order itself',
      body: `<p>“Show me the order where <code>order_id</code> is 1.” You’ll see it was placed on 2025-11-28, handled by employee 146, and its status is Completed.</p>
<p>But notice something: it doesn’t tell us <i>who</i> placed it. Only a number: <code>customer_id</code> 1473. So who is customer 1473?</p>`,
      code: `SELECT * FROM orders WHERE order_id = 1;`
    },
    {
      type: 'try',
      title: 'Clue 2: who is customer 1473?',
      body: `<p>We take the number from the orders table and look it up in the customers table. Meet <b>Erica Oconnell</b> from Kenya.</p>
<p>That jump from one table to another, following an ID, is the heart of how relational databases work. A whole module later (Joins) teaches you how to make the database do this jump for you automatically.</p>`,
      code: `SELECT * FROM customers WHERE customer_id = 1473;`
    },
    {
      type: 'try',
      title: 'Clue 3: what did she buy?',
      body: `<p>Three lines on the receipt: product 98 (quantity 1), product 80 (quantity 2) and product 61 (quantity 4). Again, only ID numbers. The names live in the products table.</p>`,
      code: `SELECT * FROM order_items WHERE order_id = 1;`
    },
    {
      type: 'try',
      title: 'Clue 4: what are products 98, 80 and 61?',
      body: `<p>I snuck in a new word: <code>IN</code> means “match any one of the numbers in this list”. It saves us running three separate queries.</p>
<p>So Erica bought Hand Sanitizer, a Vacuum Flask and a Non-Stick Frying Pan.</p>`,
      code: `SELECT * FROM products WHERE product_id IN (98, 80, 61);`
    },
    {
      type: 'try',
      title: 'Clue 5: how did she pay?',
      body: `<p>Paid by Card, status Paid, amount <b>246,702.23</b>. Now check the maths on a calculator:</p>
<p><code>12,384.57 + (2 × 27,401.27) + (4 × 44,878.78) = 246,702.23</code></p>
<p>It matches to the last digit. The items table, the products table and the payments table all tell the same story. <b>That is what a healthy database looks like.</b></p>`,
      code: `SELECT * FROM payments WHERE order_id = 1;`
    },
    {
      type: 'try',
      title: 'Clue 6: did it arrive?',
      body: `<p>Dispatched 2025-11-28, delivered 2025-11-30. Case closed. In six small queries, you followed one real order through five different tables.</p>`,
      code: `SELECT * FROM deliveries WHERE order_id = 1;`
    },
    {
      id: 'sql-1-1-c2',
      type: 'check',
      title: 'Why did the orders table show only “customer_id 1473” and not Erica’s name?',
      body: `<p>Think about the kitchen and the exam paper.</p>`,
      options: [
        'The name was deleted by mistake',
        'Names are stored once in the customers table, and the order just carries the ID that points to it',
        'Order tables are not allowed to store text',
        'The database made an error'
      ],
      answer: 1,
      why: [
        'Nothing was deleted. Erica’s name is safely in the customers table.',
        'Exactly! Each fact is written down once and connected by an ID. Change her details in one place and every order stays correct.',
        'Tables can hold text just fine (look at order_status, which is text). The reason is about avoiding repetition.',
        'No error here. This is a deliberate design, and it is exactly how professional databases are built.'
      ]
    },
    {
      type: 'explain',
      title: 'Watch out, and what it looks like at work',
      body: `<div class="callout watch"><b>Watch out: real data is messier than textbooks.</b> In TradeFlow, 58 customers have no email at all: the cell is simply empty (a special value called <code>NULL</code>, which Lesson 1.3 is all about). Dates are stored as plain text. Some orders have no delivery record. None of this is a mistake in the lesson. It is what real company data looks like, and spotting it is half of an analyst’s job.</div>
<div class="callout work"><b>At work:</b> companies run databases such as PostgreSQL, MySQL, SQL Server and Oracle, plus cloud ones like BigQuery and Snowflake. Tables, rows, columns and ID links work the same everywhere, and the SQL you learn here transfers with only small differences, which I will point out along the way. In this course we use SQLite because it is free, small and perfect for learning.</div>`
    },
    {
      id: 'sql-1-1-ex2',
      type: 'exercise',
      title: 'Your turn: peek at the receipt lines',
      body: `<p>Show <b>all columns</b> and the <b>first 6 rows</b> of the <code>order_items</code> table. Then look at the <code>product_id</code> column and ask yourself: which table would tell me the product’s <i>name</i>?</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        'Same shape as before: SELECT * FROM (table) LIMIT (number);',
        'The table is order_items and the number is 6.'
      ],
      solution: `SELECT * FROM order_items LIMIT 6;`,
      ordered: true
    },
    {
      id: 'sql-1-1-ex3',
      type: 'exercise',
      title: 'Your turn: pick the right table',
      body: `<p>Your manager asks: <i>“Can you show me how our orders travel to customers?”</i> Re-read the cast of tables, pick the right one, and show its <b>first 5 rows</b> with all columns.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        'Which table is about getting orders to customers? Re-read the cast of tables.',
        'It starts with the letter d.'
      ],
      solution: `SELECT * FROM deliveries LIMIT 5;`,
      ordered: true
    },
    {
      id: 'sql-1-1-ex4',
      type: 'exercise',
      title: 'Detective job: who handled order 1?',
      body: `<p>Order 1 was handled by <b>employee 146</b>. Find that employee’s full row in the <code>employees</code> table. (Copy the shape of the customer lookup from Clue 2.)</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        'The lookup shape is SELECT * FROM (table) WHERE (id column) = (number);',
        'The table is employees, the ID column is employee_id, and the number is 146.'
      ],
      solution: `SELECT * FROM employees WHERE employee_id = 146;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned that:</p>
<ul>
<li>A <b>database</b> is an organised place where a business keeps its facts</li>
<li>Facts live in <b>tables</b>: each <b>row</b> is one thing, each <b>column</b> is one fact about it</li>
<li><b>SQL</b> is how you ask the database questions, and a question is called a <b>query</b></li>
<li>In a <b>relational</b> database every fact is stored once, and tables are connected with <b>ID numbers</b></li>
<li>TradeFlow’s eight tables, what each one is for, and how to follow one order across five of them</li>
</ul>
<p>And you wrote real SQL: <code>SELECT</code>, <code>FROM</code>, <code>LIMIT</code> and even a first taste of <code>WHERE</code>.</p>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is a relational database, and why is data split across several tables instead of one?</li>
<li>What is the difference between a row and a column?</li>
<li>An orders table stores only a <code>customer_id</code>. How would you find the customer’s name?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A relational database stores data in separate tables that are connected through ID values. Splitting the data means each fact is stored once, which avoids repetition, saves space and prevents conflicting versions of the same fact.</p>
<p><b>2.</b> A row is one record (one customer, one order). A column is one attribute shared by all records (such as country or order date).</p>
<p><b>3.</b> Take that customer_id and look it up in the customers table, where the name is stored. In SQL you can do this automatically with a join, which we cover in Module 3.</p>
</details>
<p><b>Coming next, Lesson 1.2: Keys.</b> You just used ID numbers to jump between tables. Next you’ll learn their proper names (primary keys and foreign keys), and how to tell whether a link between two tables can be trusted.</p>`
    }
  ]
},
{
  id: 'sql-1-2',
  track: 'sql',
  title: '1.2 Keys: how tables point to each other',
  tables: ['regions', 'customers', 'employees', 'products', 'orders', 'order_items', 'payments', 'deliveries'],
  intro: `Back at TradeFlow. Your manager stops by your desk: <i>“Quick question. Can we actually <b>trust</b> the link between our orders and our customers? If that link is broken, every ‘revenue per customer’ number we report is wrong.”</i><br><br>To answer that, you need three small ideas: the <b>primary key</b>, the <b>foreign key</b>, and a habit that separates careful analysts from careless ones: <b>checking the link before you trust it</b>. By the end of this lesson you will have done exactly that on real data.`,
  steps: [
    {
      type: 'explain',
      title: 'The big idea: every row needs its own name tag',
      body: `<div class="callout analogy"><b>The big idea:</b> a <b>primary key</b> is a column that gives every row its own unique name tag, so you can point at exactly one row and nobody else.</div>
<p>Think of a school. Two students can both be called “David Jones”. But only one of them has admission number 2357. The school never uses names to find a student. It uses the admission number, because the number is <b>unique</b>.</p>
<p>In a database table, that admission number is called the <b>primary key</b>. A good primary key follows three rules:</p>
<ol>
<li><b>Unique:</b> no two rows share the same value</li>
<li><b>Never missing:</b> every row has one (no empty cells)</li>
<li><b>Stable:</b> it never changes, even if everything else about the row does</li>
</ol>
<p>Let’s look at which column plays this role in TradeFlow’s customers table.</p>`
    },
    {
      type: 'try',
      title: 'Spot the name tag',
      body: `<p>Look at the first column, <code>customer_id</code>. It’s just a number: 1, 2, 3, and so on. It means nothing by itself. Its only job is to be that customer’s unique name tag. That makes <code>customer_id</code> the <b>primary key</b> of the customers table.</p>`,
      code: `SELECT * FROM customers LIMIT 5;`
    },
    {
      type: 'try',
      title: 'Why not just use the customer’s name?',
      body: `<p>Good question, and the data answers it for us. Run this and look carefully.</p>
<p><b>Three different people</b>, all called David Jones: different IDs, different emails, two different countries. If TradeFlow had used names to link orders to customers, David’s orders would be mixed up with two strangers’ orders. The ID number is what keeps them apart.</p>`,
      code: `SELECT customer_id, customer_name, email, country
FROM customers
WHERE customer_name = 'David Jones';`
    },
    {
      type: 'try',
      title: 'Test a key like a professional',
      body: `<p>You don’t have to trust that a column is a good key. You can <b>test</b> it. Two new words here, explained simply:</p>
<ul>
<li><code>COUNT(*)</code> counts the rows in the table</li>
<li><code>COUNT(DISTINCT column)</code> counts how many <i>different</i> values appear in that column</li>
</ul>
<p>A good key has <b>as many different values as there are rows</b>. Read the four results:</p>
<ul>
<li><code>different_ids</code> equals the row count (2,000 and 2,000): every ID is unique. A good key.</li>
<li><code>different_names</code> is 1,976: some people share a name. Not a good key.</li>
<li><code>different_emails</code> is 1,942: every email that exists is unique, but 58 customers have <b>no email</b>. A key can never be missing, so email is out too.</li>
</ul>`,
      code: `SELECT COUNT(*) AS rows_in_table,
       COUNT(DISTINCT customer_id) AS different_ids,
       COUNT(DISTINCT customer_name) AS different_names,
       COUNT(DISTINCT email) AS different_emails
FROM customers;`
    },
    {
      id: 'sql-1-2-c1',
      type: 'check',
      title: 'Which column is the best primary key for customers?',
      body: `<p>Use the three rules: unique, never missing, stable.</p>`,
      options: ['customer_name', 'email', 'country', 'customer_id'],
      answer: 3,
      why: [
        'Names repeat. We just found three different David Joneses.',
        'Emails that exist are unique, but 58 customers have no email at all, and a key can never be missing. People also change their email addresses.',
        'Thousands of customers share a country. It is nowhere near unique.',
        'Yes! It is unique, never missing, and a meaningless number never needs to change. That is exactly what a primary key should be.'
      ]
    },
    {
      id: 'sql-1-2-ex1',
      type: 'exercise',
      title: 'Your turn: is product_id a good key?',
      body: `<p>Test the <code>products</code> table the same way. Return <b>two columns</b>: the number of rows in the table (call it <code>rows_in_table</code>) and the number of different <code>product_id</code> values (call it <code>different_ids</code>). If they match, it is a good key.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        'Copy the shape of the test query above, but you only need two columns this time.',
        'SELECT COUNT(*) AS rows_in_table, COUNT(DISTINCT product_id) AS different_ids FROM products;'
      ],
      solution: `SELECT COUNT(*) AS rows_in_table, COUNT(DISTINCT product_id) AS different_ids FROM products;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Foreign keys: the name tag on the exam paper',
      body: `<div class="callout analogy"><b>The big idea:</b> a <b>foreign key</b> is a primary key from <i>another</i> table, written down in this table so the row can point back to it.</div>
<p>Remember writing your admission number at the top of an exam paper? You didn’t write your name, your address and your parents’ phone number. Just the number. The school can use that number to look you up in the register.</p>
<p>That is a foreign key. In TradeFlow, every row in <code>orders</code> carries a <code>customer_id</code>. It doesn’t repeat the customer’s details. It just <b>points</b> at the matching row in the customers table.</p>
<p>The same column is two different things in two different places:</p>
<ul>
<li>In <code>customers</code>, <code>customer_id</code> is the <b>primary key</b> (the row’s own name tag)</li>
<li>In <code>orders</code>, <code>customer_id</code> is a <b>foreign key</b> (a pointer to someone else’s name tag)</li>
</ul>`
    },
    {
      type: 'try',
      title: 'Find the foreign keys',
      body: `<p>Here is the orders table. Three columns ending in <code>_id</code>:</p>
<ul>
<li><code>order_id</code>: the order’s <b>own</b> name tag (its primary key)</li>
<li><code>customer_id</code>: a <b>foreign key</b> pointing to the customers table</li>
<li><code>employee_id</code>: a <b>foreign key</b> pointing to the employees table</li>
</ul>
<p>One row, two pointers. That is how a single order “knows” who bought it and who handled it.</p>`,
      code: `SELECT * FROM orders LIMIT 5;`
    },
    {
      type: 'explain',
      title: 'TradeFlow’s map of keys',
      body: `<p>Here is every link in the TradeFlow database. Keep this map handy. You will use it in nearly every lesson from now on.</p>
<table class="mini"><tr><th>Column (the pointer)</th><th>Points to</th></tr>
<tr><td>orders.customer_id</td><td>customers.customer_id</td></tr>
<tr><td>orders.employee_id</td><td>employees.employee_id</td></tr>
<tr><td>customers.region_id</td><td>regions.region_id</td></tr>
<tr><td>employees.region_id</td><td>regions.region_id</td></tr>
<tr><td>order_items.order_id</td><td>orders.order_id</td></tr>
<tr><td>order_items.product_id</td><td>products.product_id</td></tr>
<tr><td>payments.order_id</td><td>orders.order_id</td></tr>
<tr><td>deliveries.order_id</td><td>orders.order_id</td></tr></table>
<p>Notice the pattern: the pointers always sit in the “many” side. <b>One</b> customer can have <b>many</b> orders, but each order belongs to <b>one</b> customer. <b>One</b> order has <b>many</b> items, but each item line belongs to <b>one</b> order. This is called a <b>one-to-many</b> relationship, and it is the most common shape in all of data.</p>`
    },
    {
      type: 'try',
      title: 'One customer, many orders',
      body: `<p>Remember Erica Oconnell (customer 1473) from the last lesson? Here are <b>all</b> her orders. She has placed <b>seven</b>. One customer row on one side, seven order rows on the other.</p>`,
      code: `SELECT * FROM orders WHERE customer_id = 1473;`
    },
    {
      id: 'sql-1-2-c2',
      type: 'check',
      title: 'Customer 1473 appears 7 times in the orders table. How many times does she appear in the customers table?',
      body: `<p>Think about which side is the “one” and which is the “many”.</p>`,
      options: ['7 times, the same as in orders', 'Exactly once', 'Zero times', 'It depends on her country'],
      answer: 1,
      why: [
        'The 7 is the number of orders she placed. Her details are stored just once, and each order points back to that one row.',
        'Yes! customer_id is the primary key of customers, so each value appears exactly once there. Many orders point to one customer.',
        'She must exist there. Otherwise her orders would point to nobody, which we will learn to check in a moment.',
        'Her country has nothing to do with it. A primary key value is unique, whatever the other columns say.'
      ]
    },
    {
      id: 'sql-1-2-ex2',
      type: 'exercise',
      title: 'Your turn: one customer, many orders',
      body: `<p>Show <b>all columns</b> of every order placed by <b>customer 80</b>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        'This is the same shape as the Erica query, with a different number.',
        'SELECT * FROM orders WHERE customer_id = 80;'
      ],
      solution: `SELECT * FROM orders WHERE customer_id = 80;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Can you trust the link? Meet the orphan',
      body: `<p>Now back to your manager’s question. A link is only useful if every pointer points at something that really exists.</p>
<p>Imagine an exam paper with admission number 99999 written on it, but the school register has no such student. Whose paper is it? Nobody knows. In database language, this is an <b>orphan</b>: a row whose foreign key points at nothing.</p>
<div class="callout watch"><b>Why orphans are dangerous:</b> when you later connect two tables, rows with no match quietly drop out of the results. Your totals shrink, nothing warns you, and your report is wrong. Careful analysts check for orphans <i>before</i> trusting a link.</div>
<p>The check is a short sentence in SQL. In plain English: <i>“Count the orders whose customer_id is NOT on the list of real customer IDs.”</i> The list of real IDs is written in brackets. (This “query inside a query” has its own module later. For now just read it as English.)</p>`
    },
    {
      type: 'try',
      title: 'The orphan check',
      body: `<p>The answer is <b>0</b>. Every order points at a real customer. The link between orders and customers can be trusted. You just answered your manager’s question with evidence.</p>`,
      code: `SELECT COUNT(*) AS orphan_orders
FROM orders
WHERE customer_id NOT IN (SELECT customer_id FROM customers);`
    },
    {
      type: 'try',
      title: 'The opposite direction: a parent with no children',
      body: `<p>Now we flip it: customers who have <b>never</b> placed an order. The answer is <b>18</b>.</p>
<div class="callout tip"><b>Is that a problem?</b> No. A customer with no orders is simply someone who signed up and hasn’t bought anything yet. A <b>parent with no children is normal</b>. A <b>child with no parent (an orphan) is the real problem</b>. Don’t mix them up.</div>`,
      code: `SELECT COUNT(*) AS customers_without_orders
FROM customers
WHERE customer_id NOT IN (SELECT customer_id FROM orders);`
    },
    {
      id: 'sql-1-2-ex3',
      type: 'exercise',
      title: 'Challenge: hunt for orphan products',
      body: `<p>Every row in <code>order_items</code> has a <code>product_id</code> that should point at a real product. Write the orphan check: <b>count the order_items rows whose product_id is NOT in the products table</b>. Call the result <code>orphan_items</code>.</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        'Copy the shape of the orphan check on orders. The table to count is order_items, and the list of real IDs comes from products.',
        'SELECT COUNT(*) AS orphan_items FROM order_items WHERE product_id NOT IN (SELECT product_id FROM products);'
      ],
      solution: `SELECT COUNT(*) AS orphan_items FROM order_items WHERE product_id NOT IN (SELECT product_id FROM products);`,
      ordered: true
    },
    {
      id: 'sql-1-2-ex4',
      type: 'exercise',
      title: 'Stretch: orders with no delivery record',
      body: `<p>Not every order has a row in the <code>deliveries</code> table. <b>How many orders have no delivery record?</b> Return one number and call it <code>orders_without_delivery</code>. (Remember: this isn’t an orphan. It’s a parent with no children, but it is still something a good analyst wants to know about.)</p>`,
      starter: `-- Write your query below\n\n`,
      hints: [
        'You are counting rows in orders whose order_id is NOT in the list of order_ids found in deliveries.',
        'SELECT COUNT(*) AS orders_without_delivery FROM orders WHERE order_id NOT IN (SELECT order_id FROM deliveries);'
      ],
      solution: `SELECT COUNT(*) AS orders_without_delivery FROM orders WHERE order_id NOT IN (SELECT order_id FROM deliveries);`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Watch out, and what it looks like at work',
      body: `<div class="callout watch"><b>Watch out: keys can break in quieter ways.</b> Orphans are one problem. Another is a key that is <i>supposed</i> to be unique and isn’t. In TradeFlow, the pair (order_id, product_id) should appear only once in <code>order_items</code>, but 147 lines repeat the same product within the same order. Nothing warns you. We will hunt them down in Module 3, because they silently inflate revenue.</div>
<div class="callout work"><b>At work:</b> production databases can <i>enforce</i> keys with rules called <code>PRIMARY KEY</code> and <code>FOREIGN KEY</code> constraints, so the database itself refuses bad data. But analysts often work on exports and data warehouses where these rules are not enforced, so <b>verify keys yourself</b>: a quick uniqueness test and an orphan check take two minutes and save you from wrong reports. Two columns can also form a key together (a <i>composite key</i>, like order_id plus product_id). The idea is identical in PostgreSQL, MySQL and SQL Server.</div>`
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In this lesson you learned that:</p>
<ul>
<li>A <b>primary key</b> gives every row a unique name tag: unique, never missing, stable</li>
<li>Names and emails make poor keys; a meaningless ID number makes a good one</li>
<li>A <b>foreign key</b> is another table’s primary key, stored here as a pointer</li>
<li>Most relationships are <b>one-to-many</b>: one customer, many orders</li>
<li>An <b>orphan</b> is a pointer to nothing, and you check for orphans <i>before</i> trusting a link</li>
</ul>
<p>And you ran a real data-quality check on TradeFlow’s live data, the same kind analysts run at the start of every project.</p>
<p><b>Interview-style questions:</b></p>
<ol>
<li>What is the difference between a primary key and a foreign key?</li>
<li>Why is an email address usually a poor choice for a primary key?</li>
<li>What is an orphan record, and how would you find orphans in SQL?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A primary key uniquely identifies each row in its own table. A foreign key is a column in another table that stores a primary key value, linking its rows back to the first table.</p>
<p><b>2.</b> Emails can be missing, they can change, and people sometimes share them. A key must be unique, never missing and stable.</p>
<p><b>3.</b> An orphan is a child row whose foreign key matches no row in the parent table. I find them by counting rows where the foreign key is NOT IN the list of real primary keys from the parent table (or with a LEFT JOIN that looks for missing matches).</p>
</details>
<p><b>Coming next, Lesson 1.3: Data types, NULLs and messy reality.</b> You have already met the 58 missing emails. Next you’ll learn why a database treats numbers, text and dates differently, what NULL really means, and how to spot trouble before it ruins an analysis.</p>`
    }
  ]
}
];
