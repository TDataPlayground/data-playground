const LESSONS = [
{
  id: 'sql-1',
  title: 'Lesson 1: Meet Your Data (SELECT, WHERE, ORDER BY)',
  tables: ['customers'],
  intro: `Welcome to <b>TradeFlow</b>, a fast-growing online marketplace across five African countries. You have just joined as a junior analyst, and your manager has a pile of questions about the company’s 2,000 customers. By the end of this lesson you will answer them yourself, using real SQL on real data, right here in your browser. Nothing to install.`,
  steps: [
    {
      type: 'explain',
      title: 'First, what is a table?',
      body: `<p>Think of a table as a spreadsheet that never gets messy. Each <b>row</b> is one thing (one customer). Each <b>column</b> is one fact about that thing (their name, their country, their email).</p>
<p>TradeFlow keeps its customers in a table called <code>customers</code>. <b>SQL</b> is the language you use to ask a table questions.</p>
<p>Every question has at least two parts: <b>what do you want to see?</b> (<code>SELECT</code>) and <b>where does it come from?</b> (<code>FROM</code>). SQL reads almost like English, so you will pick it up faster than you expect.</p>`
    },
    {
      type: 'try',
      title: 'Your first query: peek at the table',
      body: `<p>Press <b>Run</b>. The <code>*</code> means “all columns”, and <code>LIMIT 5</code> means “only the first 5 rows”.</p>
<p>Professional analysts always peek at a table before analysing it. Look at the column names: <code>customer_id</code>, <code>customer_name</code>, <code>email</code>, <code>country</code>, <code>region_id</code>, <code>signup_date</code>.</p>`,
      code: `SELECT * FROM customers LIMIT 5;`
    },
    {
      type: 'try',
      title: 'Choose only the columns you need',
      body: `<p>Instead of <code>*</code>, list the columns you want, separated by commas. They appear in the order you write them.</p>
<p>Real tables can have 100 columns, so asking only for what you need keeps your results readable and fast. <b>Experiment:</b> add <code>, signup_date</code> after <code>country</code> and run it again. The editor is live.</p>`,
      code: `SELECT customer_name, country FROM customers LIMIT 10;`
    },
    {
      id: 'sql1-ex1',
      type: 'exercise',
      title: 'Pick your columns',
      body: `<p>Show <code>customer_name</code>, <code>email</code> and <code>signup_date</code> (in that order) for the first <b>5</b> customers.</p>`,
      starter: `-- Write your query below\n\n`,
      hint: `Start with SELECT, list the three columns separated by commas, then FROM customers, then LIMIT 5.`,
      solution: `SELECT customer_name, email, signup_date FROM customers LIMIT 5;`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Filtering rows with WHERE',
      body: `<p><code>WHERE</code> works like a bouncer at a door: only rows that meet the condition get in. Text values go inside <b>single quotes</b>, and you use a <b>single</b> equals sign.</p>
<p>The value must match the data exactly. In this database <code>'Nigeria'</code> works but <code>'nigeria'</code> would return nothing. Try it and see.</p>`,
      code: `SELECT customer_name, country FROM customers WHERE country = 'Nigeria' LIMIT 10;`
    },
    {
      id: 'sql1-ex2',
      type: 'exercise',
      title: 'Find every Kenyan customer',
      body: `<p>Show <code>customer_id</code>, <code>customer_name</code> and <code>country</code> for <b>every</b> customer from Kenya. No LIMIT this time: we want all of them.</p>`,
      starter: `-- Write your query below\n\n`,
      hint: `WHERE goes after FROM. The country is written as 'Kenya' (with quotes).`,
      solution: `SELECT customer_id, customer_name, country FROM customers WHERE country = 'Kenya';`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Combining conditions: AND, OR and a date trick',
      body: `<p><code>AND</code> means both conditions must be true. <code>OR</code> means at least one must be true.</p>
<p><b>The date trick:</b> in this database dates are stored as text in the form <code>YYYY-MM-DD</code>. Because the year comes first, alphabetical order is the same as calendar order. So <code>signup_date &gt;= '2025-01-01'</code> means “on or after 1 January 2025”.</p>
<p><b>A real-world warning:</b> when you mix AND with OR, SQL processes AND first, which can quietly give wrong numbers. Always use <b>brackets</b> to say what you mean, like <code>(a OR b) AND c</code>.</p>`
    },
    {
      type: 'try',
      title: 'Country and date together',
      body: `<p>Customers from Ghana who signed up on or after 1 January 2025.</p>`,
      code: `SELECT customer_name, country, signup_date
FROM customers
WHERE country = 'Ghana' AND signup_date >= '2025-01-01'
LIMIT 10;`
    },
    {
      id: 'sql1-ex3',
      type: 'exercise',
      title: 'Two countries, one time window',
      body: `<p>Show <code>customer_name</code>, <code>country</code> and <code>signup_date</code> for customers who are from <b>Rwanda or Kenya</b> and who signed up on or after <b>1 January 2026</b>. Remember your brackets.</p>`,
      starter: `-- Write your query below\n\n`,
      hint: `You need (country = 'Rwanda' OR country = 'Kenya') in brackets, then AND, then the date condition.`,
      solution: `SELECT customer_name, country, signup_date FROM customers WHERE (country = 'Rwanda' OR country = 'Kenya') AND signup_date >= '2026-01-01';`,
      ordered: false
    },
    {
      type: 'explain',
      title: 'Sorting with ORDER BY',
      body: `<p>Without <code>ORDER BY</code>, SQL makes <b>no promise</b> about the order of your rows. If order matters, ask for it.</p>
<p><code>ASC</code> sorts smallest first (the default). <code>DESC</code> sorts largest first, or newest first for dates. Combine it with <code>LIMIT</code> and you can answer “top N” questions: the sort happens first, then LIMIT keeps the top rows.</p>
<p><b>Pro habit:</b> if two rows could tie, add a second sort column as a tie-breaker, separated by a comma. Then your results are identical every time you run the query.</p>
<p>The order you write the clauses always follows this pattern: <code>SELECT</code>, <code>FROM</code>, <code>WHERE</code>, <code>ORDER BY</code>, <code>LIMIT</code>.</p>`
    },
    {
      type: 'try',
      title: 'TradeFlow’s newest 10 customers',
      body: `<p>Newest signups first, with <code>customer_id</code> as the tie-breaker.</p>`,
      code: `SELECT customer_id, customer_name, signup_date
FROM customers
ORDER BY signup_date DESC, customer_id ASC
LIMIT 10;`
    },
    {
      id: 'sql1-ex4',
      type: 'exercise',
      title: 'Ghana’s five newest customers',
      body: `<p>Show <code>customer_id</code>, <code>customer_name</code> and <code>signup_date</code> for the <b>5 newest customers from Ghana</b>. Sort newest first, and break ties with <code>customer_id</code> ascending.</p>`,
      starter: `-- Write your query below\n\n`,
      hint: `Clause order: SELECT, FROM, WHERE, ORDER BY, LIMIT. Sort by signup_date DESC, customer_id ASC.`,
      solution: `SELECT customer_id, customer_name, signup_date FROM customers WHERE country = 'Ghana' ORDER BY signup_date DESC, customer_id ASC LIMIT 5;`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Real data is messy: the missing email',
      body: `<p>58 TradeFlow customers have <b>no email</b> on record. In SQL a missing value is called <code>NULL</code>. It means “unknown”: not blank, not zero.</p>
<p>Because an unknown value cannot be equal to anything (not even to another unknown), writing <code>= NULL</code> never matches. Run the next card to see this trap with your own eyes.</p>`
    },
    {
      type: 'try',
      title: 'The silent bug',
      body: `<p>Run this and notice: <b>zero rows, and no error message</b>. This is one of the most common beginner bugs. In a real report it would quietly tell your boss “nobody is missing an email”, which is false.</p>`,
      code: `SELECT customer_id, customer_name FROM customers WHERE email = NULL;`
    },
    {
      type: 'try',
      title: 'The correct way: IS NULL',
      body: `<p><code>IS NULL</code> finds missing values. <code>IS NOT NULL</code> finds the ones that are present. Remove the LIMIT to see all 58 customers.</p>`,
      code: `SELECT customer_id, customer_name, country FROM customers WHERE email IS NULL LIMIT 10;`
    },
    {
      id: 'sql1-ex5',
      type: 'exercise',
      title: 'Nigerian customers with no email',
      body: `<p>Show <code>customer_id</code>, <code>customer_name</code> and <code>country</code> for customers from <b>Nigeria</b> whose <b>email is missing</b>.</p>`,
      starter: `-- Write your query below\n\n`,
      hint: `Two conditions joined with AND: email IS NULL and country = 'Nigeria'.`,
      solution: `SELECT customer_id, customer_name, country FROM customers WHERE email IS NULL AND country = 'Nigeria';`,
      ordered: false
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>In one lesson you learned to:</p>
<ul>
<li>Peek at a table before analysing it</li>
<li>Choose exactly the columns you need</li>
<li>Filter text and dates with <code>WHERE</code>, and combine conditions safely with brackets</li>
<li>Sort results, with a tie-breaker, to answer “top N” questions</li>
<li>Find missing data with <code>IS NULL</code> and avoid the silent <code>= NULL</code> bug</li>
</ul>
<p><b>Interview-style question:</b> A report says no customers are missing an email, but you suspect that is wrong. What would you check, and what mistake could have caused the report to say zero?</p>
<details><summary>Show a model answer</summary>
<p>I would run a query using <code>WHERE email IS NULL</code> and count the rows. The report was probably written with <code>= NULL</code>, which never matches anything in SQL because NULL means unknown. It fails silently, with no error, so the result looks valid but is wrong.</p>
</details>
<p><b>Coming next, Lesson 2:</b> counting and grouping. “How many customers per country?” is where SQL starts to feel like a superpower.</p>`
    }
  ]
}
];
