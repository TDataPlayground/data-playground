LESSONS.push(
{
  id: 'py-2-1',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries'],
  setup: '',
  title: '2.1 Meet Pandas: your first DataFrame',
  tables: [],
  intro: `The Head of Data slides a laptop across the desk. <i>“Your Python basics are solid. Now the real work begins. Here is the customer file. Open it and tell me what you see.”</i><br><br>You open it. There is no neat grid of cells, like a spreadsheet. Just a wall of text, with commas scattered through it. Two thousand lines of it. You ask how anyone is supposed to work with that. She laughs. <i>“That is exactly the right question. And the answer is a tool called <b>Pandas</b>.”</i><br><br>Until now, every list and dictionary you used was typed by hand. Real data does not arrive that way. It lives in <b>files</b>, usually with thousands or millions of rows. Pandas is the tool that opens those files and turns them into proper tables inside Python, tables you can look at, question and summarise. It is the most important library an analyst will ever learn, and by the end of this lesson you will have loaded TradeFlow’s real customers, orders and products, and looked inside every one of them.`,
  steps: [
    {
      type: 'explain',
      title: 'Real data lives in files',
      body: `<p>Think about where the TradeFlow numbers have come from so far. In the SQL track, they sat in a database. In Python Module 1, you typed them yourself. In the real world, the most common way data reaches an analyst is as a <b>file</b>: somebody exports it from a system and sends it to you.</p>
<p>The most common kind of data file in the world is the <b>CSV</b>. The letters stand for <i>comma-separated values</i>, and the name tells you exactly how it works. It is a plain text file. Each <b>line</b> is one row of the table. Inside a line, the <b>commas</b> separate the cells. And the very first line is special: it holds the <b>column names</b>.</p>
<p>That is all a CSV is. No colours, no formulas, no hidden sheets. This simplicity is why almost every tool on earth can read and write one.</p>
<p>All of TradeFlow’s data is available to you as CSV files, in the same folder as your code. Let’s open one the plain way first, using only Python from Module 1, so you can see exactly what Pandas has to deal with.</p>`
    },
    {
      type: 'try',
      title: 'What is really inside a CSV',
      body: `<p>Run it. Two new things appear here, and both are simple. <code>open("customers.csv")</code> opens the file, and <code>.read()</code> reads all of its text into a jar. After that it is just a big string, and you already know how to slice and count strings.</p>
<p>Look at the first 230 characters. The first line is the column names: <code>customer_id,customer_name,email,country,region_id,signup_date</code>. Then one customer per line. And see customer 3, Andre Rivera: between his name and his country there are two commas right next to each other. Nothing sits between them. That is a <b>missing email</b>, exactly the blank you found in the SQL audit.</p>
<p>The second print counts the lines: <b>2001</b>. One of those is the column-names line, so there are 2,000 customers.</p>`,
      code: `text = open("customers.csv").read()

print(text[:230])
print(len(text.splitlines()))`
    },
    {
      id: 'py-2-1-c1',
      type: 'check',
      title: 'A CSV file has 2,001 lines. How many records does it hold?',
      body: `<p>Remember what the very first line of a CSV contains.</p>`,
      options: ['2,001 customers', '2,000 customers, because the first line is the column names', '2,002 customers', 'It cannot be known'],
      answer: 1,
      why: [
        'The first line is not a customer. It only names the columns.',
        'Yes! The first line is the header with the column names, so 2,001 lines mean 2,000 data rows.',
        'There is no reason to add anything. Every line is either the header or one record.',
        'It can be known: one header line, and the rest are records.'
      ]
    },
    {
      type: 'explain',
      title: 'Meet Pandas: spreadsheets for Python',
      body: `<div class="callout analogy"><b>The big idea:</b> imagine you have a huge pile of loose paper, with a number written on each sheet. You can read it, but you cannot work with it. Now imagine a clever assistant who takes the pile and arranges it into a tidy table on a desk: columns with names at the top, rows numbered down the side, everything lined up. And you can ask the assistant things: “show me the first five rows”, “how many are there?”, “what is in this column?” That assistant is <b>Pandas</b>.</div>
<p>Pandas is a <b>library</b>: a toolbox that other people built, which you borrow instead of writing yourself. It started around 2008, and it is now used by analysts, scientists and engineers at almost every company that works with data. When you see a job post asking for “Python for data analysis”, this is mostly what they mean.</p>
<p>To use a library, you first <b>import</b> it, which means “bring this toolbox into my workshop”:</p>
<p><code>import pandas as pd</code></p>
<p>The <code>as pd</code> part gives the toolbox a short nickname, so that you do not have to type the long name every time. <b>Everyone</b> uses <code>pd</code>. It is a universal habit, and you will see it in every Pandas tutorial and every job interview.</p>
<p>The tool that opens a CSV is <code>pd.read_csv("file.csv")</code>. Read it as: “from the pandas toolbox, take the read_csv tool, and give it this file.” It hands you back a table.</p>`
    },
    {
      type: 'try',
      title: 'Loading your first real table',
      body: `<p>Press <b>Run</b>. The first time in a session, this may take a moment, because Pandas is a big toolbox. Then you see TradeFlow’s customers as a proper table, with the column names across the top, the row numbers down the left, and everything lined up. We store the table in a jar called <code>customers</code> and show the first five rows with <code>.head()</code>.</p>
<p>Look at the email of customer 3, Andre Rivera. Pandas shows it as <b>NaN</b>. That stands for “not a number”, and it is how Pandas marks a missing cell. The blank we saw in the raw text has been recognised as a missing value.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
customers.head()`
    },
    {
      type: 'explain',
      title: 'What you are holding: a DataFrame',
      body: `<p>That table has a name: a <b>DataFrame</b>. Think of one sheet of a spreadsheet. It has <b>columns</b>, each with a name and each holding one kind of fact, and it has <b>rows</b>, each describing one thing. On the left, Pandas adds a row label called the <b>index</b>, numbered from 0, the way list positions are.</p>
<p>If you remember Module 1, you may recognise something. In lesson 1.5, you saw a <b>list of dictionaries</b>: each dictionary was a customer, each key a column. A DataFrame is that same idea in a much smarter box. It is built to handle ten thousand, or ten million, rows without slowing down, and it comes with hundreds of ready-made tools.</p>
<p>Two vocabulary words you will use all the time:</p>
<ul>
<li>A <b>DataFrame</b> is the whole table.</li>
<li>A <b>Series</b> is a <b>single column</b> of it: one labelled list of values, with the same row numbers beside it.</li>
</ul>
<p>Three quick questions you will ask of almost every table you ever meet: <code>.shape</code> tells you how big it is (rows, then columns), <code>.columns</code> lists the column names, and <code>len()</code> counts the rows.</p>`
    },
    {
      type: 'try',
      title: 'How big is it, and what is in it?',
      body: `<p>Run it. <code>type(customers)</code> confirms it is a DataFrame. <code>customers.shape</code> gives <b>(2000, 6)</b>: <b>2,000 rows</b> and <b>6 columns</b>. The rows always come first. <code>len(customers)</code> gives 2000, the same row count. And the last line lists the six column names that we saw in the raw file’s first line.</p>
<p>Notice that none of these have brackets after <code>shape</code> and <code>columns</code>. They are <b>facts</b> about the table, not actions. Tools that do something, like <code>.head()</code>, do have brackets.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

print(type(customers))
print(customers.shape)
print(len(customers))
print(list(customers.columns))`
    },
    {
      id: 'py-2-1-c2',
      type: 'check',
      title: 'What does a shape of (10000, 5) mean?',
      body: `<p>Think about which number comes first.</p>`,
      options: ['10,000 columns and 5 rows', '10,000 rows and 5 columns', '10,000 tables of 5 rows', '5 rows, 10,000 of them are missing'],
      answer: 1,
      why: [
        'It is the other way round. The rows come first in a shape.',
        'Yes! A shape is always (rows, columns). The orders table has 10,000 rows and 5 columns.',
        'A shape describes one table, not many.',
        'Nothing in a shape says anything about missing values.'
      ]
    },
    {
      id: 'py-2-1-ex1',
      type: 'exercise',
      title: 'Your turn: load a file and measure it',
      body: `<p>The file <code>orders.csv</code> is in your folder. Import Pandas, load that file into a jar called <code>orders</code>, and print its <b>shape</b>. You should see <code>(10000, 5)</code>.</p>
<p><b>Think before you type:</b> three lines. First the import, with its nickname. Second the read_csv line, storing the result in <code>orders</code>. Third, print the shape (no brackets after shape).</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `Start with import pandas as pd. Then orders = pd.read_csv("orders.csv").`,
        `import pandas as pd\norders = pd.read_csv("orders.csv")\nprint(orders.shape)`
      ],
      solution: `import pandas as pd\norders = pd.read_csv("orders.csv")\nprint(orders.shape)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Always look first: head and tail',
      body: `<p>Here is a habit that separates careful analysts from careless ones: <b>look at the data before you do anything with it</b>. Every time you load a new table, look at its first rows and its last rows. It takes two seconds, and it catches a surprising number of problems: the wrong file, the wrong columns, strange values, a file cut short.</p>
<ul>
<li><code>.head()</code> shows the <b>first</b> rows. With nothing inside the brackets you get 5. Put a number inside, such as <code>.head(3)</code>, to choose how many.</li>
<li><code>.tail()</code> shows the <b>last</b> rows, in the same way.</li>
</ul>
<p>Why the end as well as the start? Because the start of a file is often tidy, and the mess hides at the bottom: a total line someone added, or a truncated row. A good analyst always checks both ends.</p>`
    },
    {
      type: 'try',
      title: 'The first and last rows',
      body: `<p>The first table shows the first three customers. Customer 3 has <b>NaN</b> in the email column: the missing value. The second table shows the <b>last</b> three orders, numbered 9998, 9999 and 10000 in the order_id column. Notice the row labels on the far left: they say 9997, 9998 and 9999. The index starts at 0, so the last of 10,000 rows has the label 9999. The order_id starts at 1, so it ends at 10000. They are two different numberings, which is easy to confuse.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")

print(customers.head(3))
print(orders.tail(3))`
    },
    {
      id: 'py-2-1-ex2',
      type: 'exercise',
      title: 'Your turn: peek at the products',
      body: `<p>Load <code>products.csv</code> into a jar called <code>products</code>, and show its <b>first 3 rows</b>. Put the table on the <b>last line</b> of your code (not inside a print), so that it appears as a table. You should see three rows: Wireless Earbuds, Bluetooth Speaker and Smartphone Charger.</p>
<p><b>Think before you type:</b> import, load, then <code>products.head(3)</code> as the very last line.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `After import pandas as pd and products = pd.read_csv("products.csv"), the last line is products.head(3).`,
        `import pandas as pd\nproducts = pd.read_csv("products.csv")\nproducts.head(3)`
      ],
      solution: `import pandas as pd\nproducts = pd.read_csv("products.csv")\nproducts.head(3)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'One column at a time: the Series',
      body: `<p>A table is made of columns, and you will very often want to look at just one. You pick a column the same way you picked a key in a dictionary: <b>square brackets with the column name as text</b>.</p>
<p><code>customers["customer_name"]</code></p>
<p>What comes back is a <b>Series</b>: one single column, still with its row numbers alongside. Think of a column cut out of the spreadsheet, with the row numbers stuck to it. A Series has the same helpers as a table: <code>.head()</code>, <code>.tail()</code>, <code>len()</code>, and many more. And that connects to Module 1: a Series is a bit like a <b>list</b> whose items also have labels.</p>
<p>Spelling matters. If you ask for <code>customers["Customer_Name"]</code>, Pandas raises a <b>KeyError</b>, just like a missing dictionary key from lesson 1.5, because the column is called <code>customer_name</code>, in lowercase.</p>`
    },
    {
      type: 'try',
      title: 'Picking out a column',
      body: `<p>The first line shows the first five customer names, with their row numbers on the left. The second line confirms the type: a <b>Series</b>. The third counts how many names are in the column: 2000, one per customer. A column is always as long as the table is tall.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

names = customers["customer_name"]
print(names.head())
print(type(names))
print(len(names))`
    },
    {
      id: 'py-2-1-c3',
      type: 'check',
      title: 'What type is customers["country"]?',
      body: `<p>You pick one column out of a DataFrame with square brackets.</p>`,
      options: ['A DataFrame', 'A Series', 'A list', 'A dictionary'],
      answer: 1,
      why: [
        'A DataFrame is the whole table. One column on its own is smaller than that.',
        'Yes! One column of a DataFrame is a Series.',
        'It looks a little like a list, but it is its own type, with labelled rows and many extra tools.',
        'A dictionary is a different structure. A column is a Series.'
      ]
    },
    {
      id: 'py-2-1-ex3',
      type: 'exercise',
      title: 'Your turn: the first five customer names',
      body: `<p>The customers table is already loaded for you in the box. Add one line at the end that shows the <b>first five values</b> of the <code>customer_name</code> column. Put it on the last line so it appears as a result. You should see <code>Alex Spencer</code>, <code>Benjamin Welch</code>, <code>Andre Rivera</code>, <code>Diana Washington</code> and <code>Timothy Duncan</code>.</p>
<p><b>Think before you type:</b> pick the column with square brackets and its name in quotation marks, then ask for its <code>.head()</code>.</p>`,
      starter: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\n\n# Write your code below\n`,
      hints: [
        `customers["customer_name"] picks the column. Add .head() after it.`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\ncustomers["customer_name"].head()`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\ncustomers["customer_name"].head()`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A bridge back to SQL',
      body: `<p>If you finished the SQL track, you already know a lot of what Pandas does. You have just been speaking a new dialect of the same language. Here is a small translation table of what you have learned so far:</p>
<table class="mini">
<tr><th>You want to…</th><th>In SQL</th><th>In Pandas</th></tr>
<tr><td>Load the table</td><td>(it already lives in the database)</td><td><code>pd.read_csv("customers.csv")</code></td></tr>
<tr><td>See the first rows</td><td><code>SELECT * FROM customers LIMIT 5</code></td><td><code>customers.head()</code></td></tr>
<tr><td>Count the rows</td><td><code>SELECT COUNT(*) FROM customers</code></td><td><code>len(customers)</code></td></tr>
<tr><td>Pick one column</td><td><code>SELECT customer_name FROM customers</code></td><td><code>customers["customer_name"]</code></td></tr>
</table>
<p>That is a promise for the rest of this module and the next: <b>whatever you could do in SQL, you will be able to do in Pandas</b>, and then some. Each time we meet a new Pandas tool, we will show you its SQL cousin so that nothing feels brand new.</p>`
    },
    {
      type: 'try',
      title: 'The first-look routine',
      body: `<p>This is the routine you will repeat every time you meet a new table: load it, check its <b>shape</b>, list its <b>columns</b>, and peek at the first <b>rows</b>. Here it is on the orders. We learn that the table has 10,000 rows, that it has five columns (order_id, customer_id, employee_id, order_date and order_status), and what the first orders look like. In fifteen seconds you know your data’s size, its fields and its look.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")

print(orders.shape)
print(list(orders.columns))
print(orders.head(3))`
    },
    {
      id: 'py-2-1-ex4',
      type: 'exercise',
      title: 'Your turn: how big are the payments?',
      body: `<p>Load <code>payments.csv</code> into a jar called <code>payments</code>. Then print the <b>number of rows</b> on one line, and the <b>number of columns</b> on the next. You should see <code>10000</code> and then <code>6</code>.</p>
<p><b>Think before you type:</b> <code>payments.shape</code> holds both numbers, rows first, as a pair. You can pick from a pair by position, exactly as you did with lists in lesson 1.4: <code>payments.shape[0]</code> is the first and <code>payments.shape[1]</code> is the second.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `Load with payments = pd.read_csv("payments.csv"). Then two print lines using payments.shape[0] and payments.shape[1].`,
        `import pandas as pd\npayments = pd.read_csv("payments.csv")\nprint(payments.shape[0])\nprint(payments.shape[1])`
      ],
      solution: `import pandas as pd\npayments = pd.read_csv("payments.csv")\nprint(payments.shape[0])\nprint(payments.shape[1])`,
      ordered: true
    },
    {
      id: 'py-2-1-ex5',
      type: 'exercise',
      title: 'Challenge: explore a file you have not seen',
      body: `<p>There is one more file in your folder: <code>deliveries.csv</code>. You have never seen it in Python. Load it into a jar called <code>deliveries</code> and print the <b>list of its column names</b>. Your output should be <code>['delivery_id', 'order_id', 'delivery_status', 'dispatch_date', 'delivery_date']</code>.</p>
<p><b>Think before you type:</b> the same routine as always: import, load, then <code>list(deliveries.columns)</code>. Printing the list shows the names in square brackets with quotation marks, as in the expected output.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `Import pandas, then deliveries = pd.read_csv("deliveries.csv"), then print(list(deliveries.columns)).`,
        `import pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\nprint(list(deliveries.columns))`
      ],
      solution: `import pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\nprint(list(deliveries.columns))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You have crossed from small, hand-typed data to real data in real files. You can now:</p>
<ul>
<li>Explain what a <b>CSV</b> file is: plain text, one row per line, commas between cells, column names on the first line</li>
<li><b>Import</b> a library, and know why everybody writes <code>import pandas as pd</code></li>
<li>Load a CSV into a <b>DataFrame</b> with <code>pd.read_csv</code></li>
<li>Measure it with <code>.shape</code> (rows, then columns), <code>len()</code> and <code>.columns</code></li>
<li>Look at the first and last rows with <code>.head()</code> and <code>.tail()</code>, and make it a habit to look before you trust</li>
<li>Pick out a single column, a <b>Series</b>, with square brackets</li>
<li>Recognise <b>NaN</b> as Pandas’ way of showing a missing value</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is a DataFrame, and how is it different from a Series?</li>
<li>What does <code>import pandas as pd</code> do?</li>
<li>What is the first thing you do after loading a new dataset?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A DataFrame is a two-dimensional table with labelled columns and a row index, like a spreadsheet sheet. A Series is one single column of a DataFrame: a one-dimensional labelled array of values.</p>
<p><b>2.</b> It loads the pandas library into the program so that its tools can be used, and gives it the short alias pd, which is the universal convention, so that calls are written as pd.read_csv and so on.</p>
<p><b>3.</b> I look at it before using it: check the shape, the column names and the first and last rows with head and tail. That catches wrong files, missing columns and obvious problems straight away, before they can distort any analysis.</p>
</details>
<p><b>Coming next, in lesson 2.2:</b> inspecting a table properly. You can now see how big a table is and what its first rows look like. Next you will learn to ask it harder questions: What type of data is in each column? Which columns have missing values, and how many? What are the smallest, biggest and average values? The answers are one command each, and they will lead you straight to the data problems you found in SQL.</p>`
    }
  ]
}
);
