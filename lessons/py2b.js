LESSONS.push(
{
  id: 'py-2-2',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries'],
  setup: '',
  title: '2.2 The check-up: data types, missing values and describe',
  tables: [],
  intro: `A doctor never operates before checking the vital signs. Pulse, temperature, blood pressure: a quick routine, the same for every patient, and it tells her where to look closer. The Head of Data says analysts need exactly the same habit. <i>“Every new table gets a check-up before anyone analyses it. Otherwise you end up building conclusions on top of problems you never noticed.”</i><br><br>In lesson 2.1 you learned to load a table and look at its first rows. That is like looking at the patient from across the room. Today you learn the proper check-up, and it comes down to three questions: <b>What kind of data is in each column? What is missing? And what do the numbers look like?</b> Each question has a one-line answer in Pandas. And the answers will take you straight back to the data problems you found in the SQL audit, because the same messy TradeFlow data is waiting inside these files.`,
  steps: [
    {
      type: 'explain',
      title: 'Three questions, three tools',
      body: `<p>Here is the check-up routine, and the tool for each step:</p>
<table class="mini">
<tr><th>The question</th><th>The tool</th></tr>
<tr><td>What type is each column, and are there blanks?</td><td><code>.info()</code> and <code>.dtypes</code></td></tr>
<tr><td>Exactly how many values are missing, column by column?</td><td><code>.isnull().sum()</code></td></tr>
<tr><td>What do the numbers look like: smallest, biggest, typical?</td><td><code>.describe()</code></td></tr>
</table>
<p>We will take them one by one. By the end you will be able to meet any new table and say, within a minute, what it holds and where the trouble is.</p>`
    },
    {
      type: 'try',
      title: 'The medical chart: info()',
      body: `<p>Run it. <code>.info()</code> prints a summary of the whole table, and you will use it constantly, so let’s read it line by line:</p>
<ul>
<li><b>RangeIndex: 2000 entries, 0 to 1999</b>: the table has 2,000 rows, labelled 0 to 1999.</li>
<li><b>Data columns (total 6 columns)</b>: six columns, then one line for each.</li>
<li><b>Non-Null Count</b>: how many cells in that column actually have a value. Most columns say 2000. But look at <b>email</b>: it says <b>1942</b>. That is 58 short of 2,000, so <b>58 emails are missing</b>. The very same 58 you found in the SQL audit, found here in one glance.</li>
<li><b>Dtype</b>: the type of data in that column. We will explain it next.</li>
<li>The last line, <b>memory usage</b>, is roughly how much space the table takes in the computer. For us, about 94 KB. You rarely need it.</li>
</ul>
<p>One small trap: <code>.info()</code> prints its report by itself. Write <code>customers.info()</code> on its own line. If you write <code>print(customers.info())</code>, you will see the report followed by the word <code>None</code>, because info prints and returns nothing, just like the lesson on <code>print</code> and <code>return</code> told you.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
customers.info()`
    },
    {
      type: 'explain',
      title: 'Data types: what kind of thing is in a column?',
      body: `<p>In lesson 1.2, you learned that every value has a type: int, float, str, bool. Every <b>column</b> of a DataFrame has a type too, and the whole column shares it. The names are a little different in Pandas:</p>
<table class="mini">
<tr><th>Pandas calls it</th><th>Meaning</th><th>Example in TradeFlow</th></tr>
<tr><td><b>int64</b></td><td>whole numbers</td><td>customer_id, quantity</td></tr>
<tr><td><b>float64</b></td><td>numbers with decimals</td><td>unit_price, amount</td></tr>
<tr><td><b>object</b></td><td>text (strings), or a mix</td><td>customer_name, country</td></tr>
<tr><td><b>bool</b></td><td>True or False</td><td>(none yet)</td></tr>
<tr><td><b>datetime64</b></td><td>real dates and times</td><td>(none yet, see below)</td></tr>
</table>
<p>The “64” just means each number is stored using 64 bits of memory. You can ignore it. What matters is the word in front.</p>
<p>Now look again at the table above, and ask a sharp question. Where are the dates? The <code>signup_date</code> column is there, but its type is <b>object</b>, which means <b>text</b>. Not a date! Pandas loaded “2024-04-02” as a piece of text, exactly like the date strings in the SQL track. That is a problem: you cannot subtract text from text, or ask for the month of a text. In Module 3 you will learn to convert it into a real date. For now, the important skill is <b>noticing</b> it, and the check-up has just done that for you.</p>`
    },
    {
      type: 'try',
      title: 'Asking for the types directly',
      body: `<p>The first line lists the type of every column in customers: two int64 columns (the ids) and four object columns (the text ones, including <b>signup_date</b>). The second shows the types for payments, where <b>amount</b> is a float64 because it has decimals. The last two lines prove the date problem: the first signup date is of type <code>str</code>, plain text.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
payments = pd.read_csv("payments.csv")

print(customers.dtypes)
print(payments.dtypes)

first_date = customers["signup_date"][0]
print(first_date)
print(type(first_date))`
    },
    {
      id: 'py-2-2-c1',
      type: 'check',
      title: 'Pandas shows the type “object” for the column customer_name. What does that mean?',
      body: `<p>Think back to the four basic types from lesson 1.2.</p>`,
      options: ['The column holds text', 'The column holds whole numbers', 'The column is broken', 'The column holds dates'],
      answer: 0,
      why: [
        'Yes! In Pandas, “object” is the type used for text (and for columns that mix several kinds of value).',
        'Whole numbers would show as int64.',
        'It is perfectly healthy. Text columns are simply called object in Pandas.',
        'Real dates would show as datetime64. Dates that were loaded as text also show as object, which is exactly the signup_date problem.'
      ]
    },
    {
      id: 'py-2-2-ex1',
      type: 'exercise',
      title: 'Your turn: the types in the products table',
      body: `<p>Load <code>products.csv</code> into a jar called <code>products</code> and show the <b>data type of every column</b>. Put it on the last line of your code. You should see five rows: product_id (int64), product_name (object), category (object), unit_price (float64) and stock_quantity (int64).</p>
<p><b>Think before you type:</b> import, load, then <code>products.dtypes</code> as the last line. No brackets, since dtypes is a fact about the table.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `After import pandas as pd and products = pd.read_csv("products.csv"), the last line is products.dtypes.`,
        `import pandas as pd\nproducts = pd.read_csv("products.csv")\nproducts.dtypes`
      ],
      solution: `import pandas as pd\nproducts = pd.read_csv("products.csv")\nproducts.dtypes`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Counting what is missing',
      body: `<p><code>.info()</code> lets you work out the missing values by subtraction. But there is a direct way, and it is worth knowing because you will use it in every project. It takes two small steps chained together:</p>
<ol>
<li><code>.isnull()</code> goes through every cell and answers “is this cell empty?” with <code>True</code> or <code>False</code>. You get back a table of Trues and Falses, the same shape as the original.</li>
<li><code>.sum()</code> then adds up each column. Here is the clever part: Python counts <code>True</code> as 1 and <code>False</code> as 0. So adding up a column of True and False gives you <b>the number of Trues</b>, which is the number of missing cells.</li>
</ol>
<p>Think of an attendance register. You tick a box for every student who is absent. To find out how many are absent, you count the ticks. That is <code>isnull().sum()</code>: tick the empty cells, count the ticks, one count per column.</p>`
    },
    {
      type: 'try',
      title: 'How many missing, column by column',
      body: `<p>The first result is for customers. Every column shows 0, except <b>email</b>, which shows <b>58</b>. The second is for deliveries: only <b>delivery_date</b> has missing values, <b>1239</b> of them. If you remember the SQL audit, those 1,239 are <i>expected</i>: they belong to deliveries that are still In Transit or have Failed, so no arrival date exists. A missing value is not always a mistake, and the check-up only <b>shows</b> it. Deciding what it means is your job.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
deliveries = pd.read_csv("deliveries.csv")

print(customers.isnull().sum())
print(deliveries.isnull().sum())`
    },
    {
      id: 'py-2-2-c2',
      type: 'check',
      title: 'The email column says 1942 non-null, in a table of 2000 rows. How many emails are missing?',
      body: `<p>Think about the difference between the number of rows and the number of values.</p>`,
      options: ['1942', '58', '2000', '3942'],
      answer: 1,
      why: [
        '1942 is how many emails are present, not how many are missing.',
        'Yes! 2000 rows minus 1942 non-null values leaves 58 missing emails.',
        '2000 is the number of rows in the whole table.',
        'You cannot have more missing values than rows. The answer is the difference, not the sum.'
      ]
    },
    {
      id: 'py-2-2-ex2',
      type: 'exercise',
      title: 'Your turn: how many deliveries have no arrival date?',
      body: `<p>Load <code>deliveries.csv</code> into a jar called <code>deliveries</code>. Print the <b>number of missing values</b> in its <code>delivery_date</code> column. You should see <code>1239</code>.</p>
<p><b>Think before you type:</b> pick the column with square brackets, then chain <code>.isnull()</code> and <code>.sum()</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `deliveries["delivery_date"] picks the column. Add .isnull().sum() after it, and print the result.`,
        `import pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\nprint(deliveries["delivery_date"].isnull().sum())`
      ],
      solution: `import pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\nprint(deliveries["delivery_date"].isnull().sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What do the numbers look like? describe()',
      body: `<p>The third question is about the numbers themselves. Are they tiny or huge? Are they bunched together or spread out? One command gives you a whole report: <code>.describe()</code>. Think of it as a school report card for a column of numbers. It gives you eight facts:</p>
<table class="mini">
<tr><th>Fact</th><th>What it tells you</th></tr>
<tr><td><b>count</b></td><td>how many values (missing ones are not counted)</td></tr>
<tr><td><b>mean</b></td><td>the average</td></tr>
<tr><td><b>std</b></td><td>the “standard deviation”: how spread out the values are. A small std means they hug the average. A big one means they are scattered widely.</td></tr>
<tr><td><b>min</b></td><td>the smallest value</td></tr>
<tr><td><b>25%</b></td><td>a quarter of the values are below this</td></tr>
<tr><td><b>50%</b></td><td>half the values are below this: the <b>median</b></td></tr>
<tr><td><b>75%</b></td><td>three quarters of the values are below this</td></tr>
<tr><td><b>max</b></td><td>the biggest value</td></tr>
</table>
<p>Line up all the payments from smallest to biggest, like people in a queue. The 25% mark is a quarter of the way along, the 50% mark is exactly in the middle, and the 75% mark is three quarters along.</p>`
    },
    {
      type: 'try',
      title: 'The report card for payment amounts',
      body: `<p>Run it and read the story. There are <b>10000</b> payments. The smallest is <b>1295.04</b> and the biggest is <b>1071796.61</b>, so the values range very widely. The <b>mean</b> is <b>158198.15</b>, but the <b>50%</b> row, the median, is <b>127828.29</b>. Do those two numbers ring a bell? They are exactly the average payment and median payment from the interview lesson at the end of the SQL track. The mean is higher than the median because a few very large payments pull the average upwards. One command, and Pandas has told you something important about the shape of the data.</p>`,
      code: `import pandas as pd

payments = pd.read_csv("payments.csv")
payments["amount"].describe()`
    },
    {
      id: 'py-2-2-c3',
      type: 'check',
      title: 'In describe(), what is the row called 50%?',
      body: `<p>Half of the values are below it and half are above it.</p>`,
      options: ['The average', 'The median', 'The most common value', 'Half of the biggest value'],
      answer: 1,
      why: [
        'The average is the row called mean. The 50% row is a different measure.',
        'Yes! The 50% mark is the middle of the sorted values: the median.',
        'The most common value is a different idea, called the mode.',
        'It has nothing to do with the maximum. It is the middle of the values, not half of the biggest.'
      ]
    },
    {
      type: 'explain',
      title: 'Describing a whole table, and a trap',
      body: `<p>You can also call <code>.describe()</code> on a whole table. Pandas then produces a report card for <b>every number column</b> at once, side by side.</p>
<div class="callout watch"><b>Here is the trap.</b> Pandas does not know which numbers are <i>measurements</i> and which are just <i>labels</i>. In the orders table, <code>order_id</code> is a number, so Pandas dutifully reports its mean (5000.5) and its maximum. But the average of order id numbers is meaningless. An id is a name tag that happens to be written with digits. Pandas will do the sum, and it is up to <b>you</b> to know which columns are worth describing. Statistics are only as sensible as the person who asks for them.</div>
<p>Text columns get their own report if you ask for it: <code>.describe(include="object")</code>. For text, the facts are different: <b>count</b> (how many values), <b>unique</b> (how many different ones), <b>top</b> (the most frequent) and <b>freq</b> (how often the top one appears).</p>`
    },
    {
      type: 'try',
      title: 'The whole orders table',
      body: `<p>The first report covers the numeric columns. Look at <b>order_id</b>: a mean of 5000.5 and a maximum of 10000, but that is just the ids counting up, and it tells us nothing useful. The second report covers the text columns. For <b>order_status</b>: 4 unique values, and the top one is Completed, appearing 7412 times. For <b>order_date</b>: 1277 unique dates (every day in the period has at least one order), and the busiest day, 2023-10-11, has 19 orders.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")

print(orders.describe().round(1))
print(orders.describe(include="object"))`
    },
    {
      id: 'py-2-2-ex3',
      type: 'exercise',
      title: 'Your turn: the average payment',
      body: `<p>Load <code>payments.csv</code> into a jar called <code>payments</code>. Print the <b>mean</b> of the <code>amount</code> column, <b>rounded to 2 decimals</b>. You should see <code>158198.15</code>.</p>
<p><b>Think before you type:</b> a column has a <code>.mean()</code> tool. Wrap the whole thing in <code>round( ..., 2 )</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `payments["amount"].mean() gives the average. Put round( ... , 2) around it.`,
        `import pandas as pd\npayments = pd.read_csv("payments.csv")\nprint(round(payments["amount"].mean(), 2))`
      ],
      solution: `import pandas as pd\npayments = pd.read_csv("payments.csv")\nprint(round(payments["amount"].mean(), 2))`,
      ordered: true
    },
    {
      id: 'py-2-2-ex4',
      type: 'exercise',
      title: 'Your turn: the report card for unit prices',
      body: `<p>Load <code>products.csv</code> into a jar called <code>products</code>. Show the <code>describe()</code> report for the <b>unit_price</b> column, on the last line of your code. You should see the eight facts: count 150, then mean, std, min, the three percentages and max.</p>
<p><b>Think before you type:</b> pick the column, then add <code>.describe()</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `products["unit_price"] picks the column. Add .describe() after it, as the last line.`,
        `import pandas as pd\nproducts = pd.read_csv("products.csv")\nproducts["unit_price"].describe()`
      ],
      solution: `import pandas as pd\nproducts = pd.read_csv("products.csv")\nproducts["unit_price"].describe()`,
      ordered: true
    },
    {
      id: 'py-2-2-ex5',
      type: 'exercise',
      title: 'Challenge: how wide is the range of payments?',
      body: `<p>Load the payments into a jar called <code>payments</code>. Print three lines: the <b>biggest</b> amount, the <b>smallest</b> amount, and the <b>range</b> (biggest minus smallest, rounded to 2 decimals). You should see <code>1071796.61</code>, then <code>1295.04</code>, then <code>1070501.57</code>.</p>
<p><b>Think before you type:</b> a column has <code>.max()</code> and <code>.min()</code> tools. For the third line, subtract one from the other and round.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `payments["amount"].max() and payments["amount"].min() give the two ends. Print each on its own line.`,
        `import pandas as pd\npayments = pd.read_csv("payments.csv")\nprint(payments["amount"].max())\nprint(payments["amount"].min())\nprint(round(payments["amount"].max() - payments["amount"].min(), 2))`
      ],
      solution: `import pandas as pd\npayments = pd.read_csv("payments.csv")\nprint(payments["amount"].max())\nprint(payments["amount"].min())\nprint(round(payments["amount"].max() - payments["amount"].min(), 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You now run a proper check-up on any table. You can:</p>
<ul>
<li>Read the output of <b>.info()</b>: the row count, each column’s type, and its non-null count</li>
<li>Name the Pandas types (<b>int64, float64, object, bool, datetime64</b>) and spot a column that holds the wrong type, such as dates stored as text</li>
<li>Count missing values per column with <b>.isnull().sum()</b>, and tell the difference between a missing value that is a mistake and one that makes sense</li>
<li>Summarise a column of numbers with <b>.describe()</b>, and read count, mean, std, min, the quartiles and max, including the median hiding at 50%</li>
<li>Use <b>.mean()</b>, <b>.max()</b> and <b>.min()</b> on a column directly, and describe text columns with <code>include="object"</code></li>
<li>Avoid the <b>ID trap</b>: Pandas will average numbers that are really labels</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What does <code>.info()</code> tell you, and how can you spot missing values with it?</li>
<li>How do you count missing values in every column of a DataFrame?</li>
<li>The mean of a column is much higher than its median. What does that suggest?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> info() summarises the table: the number of rows, and for each column its name, its data type and how many non-null values it has. If a column’s non-null count is lower than the number of rows, the difference is the number of missing values.</p>
<p><b>2.</b> Call isnull() to get a True or False table, then sum() to add up each column. Since True counts as 1, the result is the number of missing values in each column.</p>
<p><b>3.</b> It suggests the data is skewed to the right: a small number of very large values pull the mean upwards, while the median stays near the typical value. In that case the median is usually the better description of a typical row.</p>
</details>
<p><b>Coming next, in lesson 2.3:</b> picking exactly what you need. So far you can load a table and check its health. Next you will learn to select several columns at once, to pick rows by position and by label with <code>iloc</code> and <code>loc</code>, and to count how often each value appears with <code>value_counts</code>. That last one is the Python version of the tally sheet from the loops lesson, in a single word.</p>`
    }
  ]
},
{
  id: 'py-2-3',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries'],
  setup: '',
  title: '2.3 Selecting and counting: columns, rows and value_counts',
  tables: [],
  intro: `Three requests arrive in the same hour. The marketing manager: <i>“Can I have just the customer names and countries? I do not need the rest.”</i> The CEO: <i>“How many customers do we have in each country?”</i> And the Head of Data: <i>“Show me rows 5 to 10 of the product list.”</i><br><br>All three are about the same skill: <b>picking exactly the part of a table you need</b>. A table with ten thousand rows and a dozen columns is far too much to look at. Analysts spend a large part of their day cutting a table down to the piece that answers the question. In SQL, you did it with SELECT and COUNT. Today you learn the Pandas way, and in the CEO’s case you will see something lovely: the tally sheet you wrote by hand in lesson 1.7, with a loop and a dictionary, becomes a single word.`,
  steps: [
    {
      type: 'explain',
      title: 'Picking several columns at once',
      body: `<p>In lesson 2.1, you picked one column with square brackets: <code>customers["country"]</code>. To pick <b>several</b> columns, you hand Pandas a <b>list</b> of the column names, which means a second pair of square brackets inside the first:</p>
<p><code>customers[["customer_name", "country"]]</code></p>
<p>The outer brackets say “select from this table”. The inner brackets build the list of names you want, exactly the kind of list you learned in lesson 1.4. That is why you see <b>double brackets</b>. The result is a smaller <b>DataFrame</b> holding just those columns, in the order you listed them.</p>
<p>Note a small but important difference: one column picked with single brackets gives you a <b>Series</b>. A list of columns, even a list holding only one name, gives you a <b>DataFrame</b>.</p>`
    },
    {
      type: 'try',
      title: 'Two columns, the first three rows',
      body: `<p>Press Run. We pick two columns and then ask for the first three rows with <code>.head(3)</code>. Notice how the two methods chain together, one after the other, each working on the result of the one before. This is the SQL <code>SELECT customer_name, country FROM customers LIMIT 3</code>, almost word for word.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

customers[["customer_name", "country"]].head(3)`
    },
    {
      type: 'try',
      title: 'The mistake everyone makes once',
      body: `<p>Here we use a <b>single</b> pair of brackets with two names separated by a comma. Pandas cannot make sense of that, and raises a <b>KeyError</b> with both names inside brackets. In plain words: “you asked for a column called <i>(customer_name, country)</i>, as one name, and I have no such column.” The fix is the second pair of brackets, which turns the two names into a list. Add them, run it again, and the table appears.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

customers["customer_name", "country"]`
    },
    {
      id: 'py-2-3-c1',
      type: 'check',
      title: 'Which line correctly picks the columns customer_name and email?',
      body: `<p>You want a smaller table with two columns.</p>`,
      options: ['customers["customer_name", "email"]', 'customers[["customer_name", "email"]]', 'customers("customer_name", "email")', 'customers{"customer_name", "email"}'],
      answer: 1,
      why: [
        'This is the common mistake: one pair of brackets with two names causes a KeyError.',
        'Yes! The inner brackets make a list of names, and the outer brackets select them from the table.',
        'Round brackets would try to call the table as if it were a function, which is an error.',
        'Curly brackets make a dictionary or a set, not a column selection.'
      ]
    },
    {
      id: 'py-2-3-ex1',
      type: 'exercise',
      title: 'Your turn: two columns for the marketing manager',
      body: `<p>Load <code>customers.csv</code> into a jar called <code>customers</code>. Show the <code>customer_name</code> and <code>email</code> columns for the <b>first 3 customers</b>, on the last line of your code. You should see Alex Spencer with alex.spencer760@hotmail.com, then Benjamin Welch, then Andre Rivera with NaN as his email.</p>
<p><b>Think before you type:</b> double brackets for the two names, then <code>.head(3)</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `After loading the table, the last line has the shape customers[["...", "..."]].head(3).`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\ncustomers[["customer_name", "email"]].head(3)`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\ncustomers[["customer_name", "email"]].head(3)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Picking rows: iloc and loc',
      body: `<p>Now for rows. Pandas gives you two ways to pick them, and the difference is worth getting clear in your head once, because it trips up almost everybody.</p>
<div class="callout analogy"><b>The big idea:</b> imagine a cinema. You can find a person in two different ways. You can say “the person in <b>seat number 3</b>”, which is by <b>position</b>. Or you can say “the person whose <b>name on the ticket</b> is Ada”, which is by <b>label</b>. Both find a person, but they work differently. <code>iloc</code> is the seat number (the <b>i</b> stands for “integer position”). <code>loc</code> is the name on the ticket (<b>loc</b> for “label”).</div>
<p>Both use square brackets with <b>rows first, then columns</b>, separated by a comma:</p>
<ul>
<li><code>products.iloc[0]</code> is the row in the first position</li>
<li><code>products.iloc[0:3]</code> is rows in positions 0, 1 and 2 (it stops <b>before</b> 3, like a list slice)</li>
<li><code>products.iloc[2, 1]</code> is the cell in row position 2 and column position 1</li>
<li><code>products.loc[0:2]</code> is rows labelled 0, 1 <b>and 2</b></li>
<li><code>products.loc[1, "product_name"]</code> is the cell in the row labelled 1, in the column named product_name</li>
</ul>
<p>In our tables, the row labels are 0, 1, 2…, which are <b>the same as the positions</b>, so the two often look identical. But there is one important difference, and it is easy to miss: <b>an iloc slice stops before the end, but a loc slice includes the end.</b> So <code>iloc[0:3]</code> and <code>loc[0:2]</code> give the <b>same three rows</b>. Labels name things, so “from label 0 to label 2” naturally includes label 2.</p>`
    },
    {
      type: 'try',
      title: 'iloc: seat numbers',
      body: `<p>The first print shows the whole first row of the products table. The second shows the first three rows. The third picks a single cell: row position 2, column position 1, which is the product name <b>Smartphone Charger</b>. The last one shows the first three rows but only the first two columns, with <code>[rows, columns]</code>. Remember that positions start at 0.</p>`,
      code: `import pandas as pd

products = pd.read_csv("products.csv")

print(products.iloc[0])
print(products.iloc[0:3])
print(products.iloc[2, 1])
print(products.iloc[0:3, 0:2])`
    },
    {
      type: 'try',
      title: 'loc: names on the ticket',
      body: `<p>Compare with the last card. <code>products.loc[0:2]</code> shows three rows, labelled 0, 1 and 2: the end label is included. The second line picks columns by <b>name</b> as well, giving a short list of two. And the third picks one cell by label and column name: the product in the row labelled 1 is <b>Bluetooth Speaker</b>. With <code>loc</code>, you use words for the columns, which makes the code easy to read.</p>`,
      code: `import pandas as pd

products = pd.read_csv("products.csv")

print(products.loc[0:2])
print(products.loc[0:2, ["product_name", "unit_price"]])
print(products.loc[1, "product_name"])`
    },
    {
      id: 'py-2-3-c2',
      type: 'check',
      title: 'How many rows does products.loc[0:2] return?',
      body: `<p>Remember what is special about the end of a loc slice.</p>`,
      options: ['2 rows', '3 rows', '1 row', 'It depends on the table'],
      answer: 1,
      why: [
        'That would be the answer for iloc[0:2]. With loc, the end label is included.',
        'Yes! loc includes the end label, so rows 0, 1 and 2 come back: three rows.',
        'Three labels are covered by 0:2 with loc, so there is more than one row.',
        'With the usual 0, 1, 2… row labels, the answer is always 3.'
      ]
    },
    {
      id: 'py-2-3-ex2',
      type: 'exercise',
      title: 'Your turn: rows and columns by position',
      body: `<p>Load <code>products.csv</code> into a jar called <code>products</code>. Using <b>iloc</b>, show the <b>first 3 rows</b> and the <b>first 2 columns</b>, on the last line of your code. You should see product_id and product_name for Wireless Earbuds, Bluetooth Speaker and Smartphone Charger.</p>
<p><b>Think before you type:</b> <code>products.iloc[rows, columns]</code>, with a slice for each. Positions start at 0 and slices stop before the end.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `The last line has the shape products.iloc[0:3, 0:2].`,
        `import pandas as pd\nproducts = pd.read_csv("products.csv")\nproducts.iloc[0:3, 0:2]`
      ],
      solution: `import pandas as pd\nproducts = pd.read_csv("products.csv")\nproducts.iloc[0:3, 0:2]`,
      ordered: true
    },
    {
      id: 'py-2-3-ex3',
      type: 'exercise',
      title: 'Your turn: rows by label, columns by name',
      body: `<p>Using <b>loc</b> this time, show the rows labelled <b>0 to 2</b> and the columns <code>product_name</code> and <code>unit_price</code>, on the last line. You should see Wireless Earbuds (52539.00), Bluetooth Speaker (4930.40) and Smartphone Charger (28995.64).</p>
<p><b>Think before you type:</b> <code>products.loc[row_slice, [list of column names]]</code>. The end of a loc slice is included.</p>`,
      starter: `import pandas as pd\nproducts = pd.read_csv("products.csv")\n\n# Write your code below\n`,
      hints: [
        `The last line has the shape products.loc[0:2, ["...", "..."]].`,
        `import pandas as pd\nproducts = pd.read_csv("products.csv")\nproducts.loc[0:2, ["product_name", "unit_price"]]`
      ],
      solution: `import pandas as pd\nproducts = pd.read_csv("products.csv")\nproducts.loc[0:2, ["product_name", "unit_price"]]`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Counting: the tally sheet in one word',
      body: `<p>Now for the CEO’s question: <i>“How many customers in each country?”</i> Remember lesson 1.7? You made a tally sheet by hand: an empty dictionary, a loop, and the line <code>counts[key] = counts.get(key, 0) + 1</code>. It worked, but it took several lines. Pandas does the same job in one word: <code>.value_counts()</code>.</p>
<div class="callout analogy"><b>The big idea:</b> think of counting votes after an election. Thousands of ballots arrive, each with one name on it. You do not read them aloud one by one. You make a pile for each candidate and count the piles, then announce the winner first. <code>value_counts()</code> is that: it makes a pile for every different value in a column, counts them, and sorts them from biggest to smallest.</div>
<p>Three related tools are worth knowing together:</p>
<table class="mini">
<tr><th>You want…</th><th>Pandas</th><th>SQL cousin</th></tr>
<tr><td>the different values, without counts</td><td><code>.unique()</code></td><td><code>SELECT DISTINCT country</code></td></tr>
<tr><td>how many different values there are</td><td><code>.nunique()</code></td><td><code>COUNT(DISTINCT country)</code></td></tr>
<tr><td>how often each value appears</td><td><code>.value_counts()</code></td><td><code>GROUP BY country</code> with <code>COUNT(*)</code></td></tr>
</table>
<p>And a very handy option: <code>.value_counts(normalize=True)</code> gives <b>shares</b> instead of counts: fractions that add up to 1.</p>`
    },
    {
      type: 'try',
      title: 'Counting customers by country',
      body: `<p>Run it. <code>.unique()</code> lists the five countries (in the order they first appear). <code>.nunique()</code> says there are <b>5</b>. And <code>.value_counts()</code> is the answer to the CEO: <b>Rwanda 438, Nigeria 400, Kenya 393, Ghana 391, South Africa 378</b>. Those are exactly the numbers you typed into a dictionary by hand in lesson 1.5, and this time Pandas counted them from the real file in one word. They also add up to 2000.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

print(customers["country"].unique())
print(customers["country"].nunique())
print(customers["country"].value_counts())`
    },
    {
      type: 'try',
      title: 'Counts and shares of order status',
      body: `<p>The first table counts the orders by status: <b>Completed 7412, Processing 1554, Cancelled 529, Returned 505</b>. The second shows the same thing as shares. Completed is <b>0.7412</b>, which is 74.12% of all orders. Look back at lesson 1.3 and you will find that very number, which you worked out by hand there. Pandas gives it to you directly. To pull one share out of the result, put the label in square brackets, just like a dictionary key: <code>["Completed"]</code>.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")

print(orders["order_status"].value_counts())
print(orders["order_status"].value_counts(normalize=True))
print(orders["order_status"].value_counts(normalize=True)["Completed"])`
    },
    {
      id: 'py-2-3-c3',
      type: 'check',
      title: 'Which SQL query does customers["country"].value_counts() match?',
      body: `<p>Think about what the SQL track taught you about counting per group.</p>`,
      options: ['SELECT country FROM customers', 'SELECT country, COUNT(*) FROM customers GROUP BY country ORDER BY COUNT(*) DESC', 'SELECT COUNT(DISTINCT country) FROM customers', 'SELECT * FROM customers LIMIT 5'],
      answer: 1,
      why: [
        'That only lists the countries, with no counts.',
        'Yes! value_counts() groups by the values, counts each group, and sorts from biggest to smallest. All in one word.',
        'That is nunique(): how many different countries there are, not how often each appears.',
        'That is head(): the first five rows.'
      ]
    },
    {
      id: 'py-2-3-ex4',
      type: 'exercise',
      title: 'Your turn: customers per country',
      body: `<p>Load <code>customers.csv</code> into a jar called <code>customers</code>. Show how many customers there are <b>in each country</b>, on the last line of your code. You should see Rwanda 438 at the top, then Nigeria 400, Kenya 393, Ghana 391 and South Africa 378.</p>
<p><b>Think before you type:</b> pick the <code>country</code> column, then use the counting word.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `customers["country"] picks the column. Add .value_counts() after it, as the last line.`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\ncustomers["country"].value_counts()`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\ncustomers["country"].value_counts()`,
      ordered: true
    },
    {
      id: 'py-2-3-ex5',
      type: 'exercise',
      title: 'Challenge: the share of orders that are Completed',
      body: `<p>Load <code>orders.csv</code> into a jar called <code>orders</code>. Print the <b>percentage of orders whose status is Completed</b>, rounded to <b>1 decimal place</b>. You should see <code>74.1</code>.</p>
<p><b>Think before you type:</b> <code>value_counts(normalize=True)</code> gives shares between 0 and 1. Pick the <code>"Completed"</code> share with square brackets, multiply by 100, and wrap the whole thing in <code>round( ..., 1 )</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `orders["order_status"].value_counts(normalize=True)["Completed"] gives 0.7412. Multiply by 100.`,
        `import pandas as pd\norders = pd.read_csv("orders.csv")\nprint(round(orders["order_status"].value_counts(normalize=True)["Completed"] * 100, 1))`
      ],
      solution: `import pandas as pd\norders = pd.read_csv("orders.csv")\nprint(round(orders["order_status"].value_counts(normalize=True)["Completed"] * 100, 1))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Module 2 is complete: what you can do now',
      body: `<div class="callout tip"><b>Look at how far you have come.</b> You started this module with a wall of commas in a text file. You can now load real data into Pandas, check its health, and pick out and count exactly what you need. These are the actions you will repeat in nearly every analysis you ever do.</div>
<p>In this lesson you learned to:</p>
<ul>
<li>Select several columns with <b>double brackets</b>: <code>df[["a", "b"]]</code></li>
<li>Pick rows and cells by <b>position</b> with <code>iloc</code> and by <b>label</b> with <code>loc</code>, and remember that a loc slice includes its end</li>
<li>List the different values with <code>.unique()</code>, count them with <code>.nunique()</code>, and tally how often each appears with <code>.value_counts()</code>, including shares with <code>normalize=True</code></li>
<li>Connect each of these to its SQL cousin, so that nothing feels new</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is the difference between <code>loc</code> and <code>iloc</code>?</li>
<li>Why do you need double brackets to select two columns?</li>
<li>How would you count how many times each category appears in a column?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> iloc selects by integer position, counting from 0, and its slices exclude the end. loc selects by label (the index labels and the column names), and its slices include the end. When the index is the default 0, 1, 2…, the labels equal the positions, but the end-point rule still differs.</p>
<p><b>2.</b> The inner brackets create a Python list of column names, and the outer brackets select that list from the DataFrame. A single pair with two names would be read as one name, a tuple, and raise a KeyError.</p>
<p><b>3.</b> Use value_counts on the column. It groups by each distinct value, counts them, and sorts from most to least frequent. Passing normalize=True gives proportions instead of counts. It is the Pandas equivalent of GROUP BY with COUNT.</p>
</details>
<p><b>Coming next, in Module 3:</b> data cleaning. You now know how to <i>find</i> the problems: the missing emails, the dates stored as text, the odd values. Module 3 is where you <i>fix</i> them. You will fill and drop missing values, turn text into real dates, find and handle duplicates (including the famous 147 repeated order lines), clean messy text, and check that your cleaned data is valid. Analysts say cleaning takes most of their time, and by the end you will see why, and how to do it well.</p>`
    }
  ]
}
);
