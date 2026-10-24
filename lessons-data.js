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
}
];
