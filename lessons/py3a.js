LESSONS.push(
{
  id: 'py-3-1',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries'],
  setup: '',
  title: '3.1 Missing values: find them, understand them, decide',
  tables: [],
  intro: `The marketing manager is about to send a newsletter to every TradeFlow customer. She asks the Head of Data: <i>“Is the customer list ready?”</i> The Head of Data looks at you. <i>“Is it?”</i><br><br>You already know the answer from your check-up in lesson 2.2: no, 58 customers have no email address. So what do you do about it? Delete those customers? Type in a made-up email? Leave them alone? Each choice changes the data, and each one has a cost.<br><br>This is the heart of data cleaning, and here is the secret nobody tells beginners: <b>cleaning is not mostly about code. It is about decisions.</b> The code is a few short commands. The skill is knowing <i>which</i> one to use, and why. Analysts often say that cleaning takes most of their time. After this lesson you will see why, and you will have a method for making each decision with a clear head.`,
  steps: [
    {
      type: 'explain',
      title: 'A missing value is a question, not a nuisance',
      body: `<p>When you meet an empty cell, resist the urge to “fix” it straight away. First ask <b>why it is empty</b>. There are three common reasons, and each one leads to a different decision:</p>
<table class="mini">
<tr><th>Why is it empty?</th><th>Example in TradeFlow</th><th>Usual decision</th></tr>
<tr><td><b>Nobody knows it</b></td><td>A customer never gave an email</td><td>Leave it, mark it, or fill it with a clear placeholder</td></tr>
<tr><td><b>It does not apply yet</b></td><td>A delivery still on the road has no arrival date</td><td>Leave it. The blank is the truth.</td></tr>
<tr><td><b>It is a mistake</b></td><td>A price that should be there, lost in an export</td><td>Fix it from the source, or drop the row if it cannot be fixed</td></tr>
</table>
<p>You have three tools to act on a missing value: <b>leave it</b>, <b>drop it</b> (remove the row) or <b>fill it</b> (put something in). Each is right sometimes and wrong at other times. We will learn all three, and the thinking behind them.</p>
<p>First, let’s learn to look at the rows that have a problem, not just count them.</p>`
    },
    {
      type: 'try',
      title: 'Showing only the rows with a missing email',
      body: `<p>Run it. You see only customers whose email is missing, starting with Andre Rivera (customer 3). Let’s read the key line from the inside out, because you will use this pattern all the time:</p>
<ol>
<li><code>customers["email"].isnull()</code>: a column of True and False, one for each customer. True means “email is missing”.</li>
<li><code>customers[ ... ]</code>: when you put a True/False column inside the square brackets, Pandas <b>keeps only the rows where it says True</b>.</li>
</ol>
<p>It is the Pandas version of SQL’s <code>WHERE email IS NULL</code>. This is a small first taste of <b>filtering</b>, which gets a whole module of its own next. For now, just read it as: “customers, where the email is missing.”</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

customers[customers["email"].isnull()].head()`
    },
    {
      type: 'explain',
      title: 'How much is missing? A neat shortcut',
      body: `<p>Before deciding anything, measure the problem. Is it one cell in a thousand, or half of the column? You already know <code>.isnull().sum()</code>, which counts. There is a beautiful variation that gives you the <b>share</b> instead: <code>.isnull().mean()</code>.</p>
<p>Why does it work? Because <code>True</code> counts as 1 and <code>False</code> as 0. The <b>sum</b> of those is how many are missing. The <b>mean</b> of those is the fraction that are missing. A column where 58 of 2,000 are True has a mean of 58 ÷ 2,000 = 0.029, which is 2.9%.</p>
<p>That small number matters. A column with 2.9% missing is a nuisance. A column with 60% missing is a different story: you may decide not to use it at all.</p>`
    },
    {
      type: 'try',
      title: 'The share missing, column by column',
      body: `<p>The first result shows every column of customers as a fraction. Everything is 0, except email, at <b>0.029</b>. The second line turns just the email column into a percentage: <b>2.9</b>. So 2.9% of customers have no email. That is small enough that we will not panic, but real enough that the marketing manager must know about it.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

print(customers.isnull().mean())
print(round(customers["email"].isnull().mean() * 100, 1))`
    },
    {
      id: 'py-3-1-ex1',
      type: 'exercise',
      title: 'Your turn: what percentage of delivery dates is missing?',
      body: `<p>Load <code>deliveries.csv</code> into a jar called <code>deliveries</code>. Print the <b>percentage</b> of missing values in the <code>delivery_date</code> column, <b>rounded to 1 decimal place</b>. You should see <code>13.0</code>.</p>
<p><b>Think before you type:</b> pick the column, chain <code>.isnull().mean()</code>, multiply by 100 and round.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `deliveries["delivery_date"].isnull().mean() gives the fraction. Multiply by 100, then round to 1 decimal.`,
        `import pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\nprint(round(deliveries["delivery_date"].isnull().mean() * 100, 1))`
      ],
      solution: `import pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\nprint(round(deliveries["delivery_date"].isnull().mean() * 100, 1))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Now ask why: the delivery dates',
      body: `<p>So 13% of delivery dates are missing, and that is not small. Before you think about filling or dropping anything, apply the rule from the start of this lesson and ask <b>why</b>. The deliveries table has a <code>delivery_status</code> column, which may explain it. Let’s look at only the rows with a missing delivery date, and count their statuses, using the pattern you just learned plus <code>value_counts</code> from lesson 2.3.</p>`
    },
    {
      type: 'try',
      title: 'Why are those delivery dates missing?',
      body: `<p>The answer is tidy: all 1,239 missing dates belong to deliveries with the status <b>In Transit</b> (966) or <b>Failed</b> (273). A parcel on the road has no arrival date yet, and a failed delivery never arrived. These blanks are not mistakes. They are the truth, written as an empty cell. If you had “fixed” them by filling in an invented date, you would have <b>made your data wrong</b>. This is exactly why we ask why before we act.</p>`,
      code: `import pandas as pd

deliveries = pd.read_csv("deliveries.csv")

missing = deliveries[deliveries["delivery_date"].isnull()]
print(missing["delivery_status"].value_counts())`
    },
    {
      id: 'py-3-1-c1',
      type: 'check',
      title: 'Delivery dates are missing for parcels that are still In Transit. What is the best decision?',
      body: `<p>Remember the three reasons a value can be missing.</p>`,
      options: ['Fill them with today’s date', 'Leave them empty, because the blank is the truth: they have not arrived yet', 'Delete all of those deliveries', 'Fill them with the average delivery date'],
      answer: 1,
      why: [
        'A made-up arrival date would claim something that did not happen. That makes the data wrong.',
        'Yes! The value does not exist yet, so the empty cell is honest. Filling it would invent a fact. Keep it, and remember it when you calculate delivery times.',
        'Deleting them would throw away real deliveries, and make the delivery times look better than they really are.',
        'An average arrival date for a parcel that never arrived is an invention.'
      ]
    },
    {
      type: 'explain',
      title: 'Option 1: drop the rows',
      body: `<p>Sometimes a missing value really is a mistake, or the row is useless without it. Then you can <b>drop</b> it with <code>.dropna()</code>:</p>
<ul>
<li><code>customers.dropna()</code> removes every row that has a missing value in <b>any</b> column.</li>
<li><code>customers.dropna(subset=["email"])</code> removes rows only if the <b>email</b> is missing. Other columns are ignored. This is almost always what you actually want.</li>
</ul>
<p>Two warnings. First, <b>dropping is deleting</b>. Your table gets shorter, your counts change, and any total you work out afterwards covers fewer rows. Always check the shape before and after. Second, as with strings in lesson 1.3, <code>.dropna()</code> does <b>not change the original</b>. It hands back a new table. If you want to keep it, store it: <code>customers = customers.dropna(subset=["email"])</code>.</p>`
    },
    {
      type: 'try',
      title: 'The cost of dropping',
      body: `<p>The original customers table has 2000 rows. Dropping rows with a missing email, by either method, gives <b>1942</b>: we lose the 58 customers. For deliveries, look at the last result: a blind <code>.dropna()</code> leaves <b>8261</b> rows out of 9500. That is the 1,239 deliveries we just proved were perfectly normal. Dropping them would have deleted every parcel still on the road, and made TradeFlow’s deliveries look much faster and more successful than they are. Dropping blindly can <b>bias</b> your results, not only shrink them.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
deliveries = pd.read_csv("deliveries.csv")

print(customers.shape)
print(customers.dropna().shape)
print(customers.dropna(subset=["email"]).shape)
print(deliveries.shape)
print(deliveries.dropna().shape)`
    },
    {
      id: 'py-3-1-ex2',
      type: 'exercise',
      title: 'Your turn: drop customers without an email',
      body: `<p>The marketing manager only wants customers with an email. Load <code>customers.csv</code> into a jar called <code>customers</code>, drop the rows where <b>only the email</b> is missing, and print the <b>shape</b> of the result. You should see <code>(1942, 6)</code>.</p>
<p><b>Think before you type:</b> <code>.dropna(subset=["email"])</code>, then <code>.shape</code>. Remember to put the result inside a print.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `customers.dropna(subset=["email"]) gives a new table. Add .shape and print it.`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nprint(customers.dropna(subset=["email"]).shape)`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nprint(customers.dropna(subset=["email"]).shape)`,
      ordered: true
    },
    {
      id: 'py-3-1-ex3',
      type: 'exercise',
      title: 'Your turn: how many rows would a blind dropna lose?',
      body: `<p>Load <code>deliveries.csv</code> into a jar called <code>deliveries</code>. Work out how many rows <code>.dropna()</code> would <b>remove</b>: the number of rows in the table, minus the number of rows left after dropping. Print that number. You should see <code>1239</code>.</p>
<p><b>Think before you type:</b> <code>len(deliveries)</code> counts the rows. <code>len(deliveries.dropna())</code> counts the rows that remain. Subtract one from the other.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `You need len(deliveries) minus len(deliveries.dropna()).`,
        `import pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\nprint(len(deliveries) - len(deliveries.dropna()))`
      ],
      solution: `import pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\nprint(len(deliveries) - len(deliveries.dropna()))`,
      ordered: true
    },
    {
      id: 'py-3-1-c2',
      type: 'check',
      title: 'You run customers.dropna(subset=["email"]) on its own line. What happens to the customers table?',
      body: `<p>Think about what you learned about methods that return new things.</p>`,
      options: ['It is permanently changed, with 58 rows removed', 'Nothing: the result is created but not stored, so customers is unchanged', 'It raises an error', 'The 58 rows are moved to the bottom'],
      answer: 1,
      why: [
        'Only if you store the result back: customers = customers.dropna(...). On its own, the line changes nothing.',
        'Yes! Like string methods, dropna returns a new table. Without storing it in a jar, the result is thrown away and the original stays as it was.',
        'The line is valid. It just does not do anything lasting.',
        'dropna removes rows. It never moves them.'
      ]
    },
    {
      type: 'explain',
      title: 'Option 2: fill the gaps',
      body: `<p>The third tool is <code>.fillna(value)</code>, which puts a value into every empty cell. For <b>text</b>, the usual practice is a clear placeholder, such as <code>"no_email"</code> or <code>"unknown"</code>, so that nobody mistakes it for real data. Pick a word that will not be confused with a genuine value.</p>
<p>For <b>numbers</b>, you can fill with something typical, like the average or the median of the column. This is called <b>imputing</b>. Handle it with care, for two reasons:</p>
<ul>
<li>You are <b>inventing</b> data. It looks as real as every other value afterwards, so your later statistics now include made-up numbers.</li>
<li>Filling with the average makes the column look <b>less spread out</b> than it truly is, since you have added many values exactly at the middle.</li>
</ul>
<p>If you fill, <b>tell your reader</b>. A short note, such as “58 missing emails filled with no_email”, keeps the analysis honest. It is the same “never silently fix” rule you used in the SQL data audit.</p>`
    },
    {
      type: 'try',
      title: 'Filling the missing emails',
      body: `<p>We fill the missing emails with <code>"no_email"</code> and store the result back into the column. Look at the first five rows: customer 3 now shows <b>no_email</b> instead of NaN. The last line checks our work: after filling, <b>0</b> emails are missing. Notice that we did not delete anyone. Every customer is still in the table, and anybody can see which ones had no email.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

customers["email"] = customers["email"].fillna("no_email")

print(customers[["customer_id", "email"]].head())
print(customers["email"].isnull().sum())`
    },
    {
      id: 'py-3-1-ex4',
      type: 'exercise',
      title: 'Your turn: fill the gaps with a placeholder',
      body: `<p>Load <code>customers.csv</code> into a jar called <code>customers</code>. Fill the missing emails with <code>"no_email"</code>, storing the result back in the <code>email</code> column. Then show the <code>customer_id</code> and <code>email</code> columns for the <b>first 5</b> customers, on the last line. Customer 3 should show <code>no_email</code>.</p>
<p><b>Think before you type:</b> the same pattern as the example: <code>customers["email"] = customers["email"].fillna(...)</code>, then double brackets and <code>.head()</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `customers["email"] = customers["email"].fillna("no_email"), then the last line customers[["customer_id", "email"]].head().`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\ncustomers["email"] = customers["email"].fillna("no_email")\ncustomers[["customer_id", "email"]].head()`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\ncustomers["email"] = customers["email"].fillna("no_email")\ncustomers[["customer_id", "email"]].head()`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Filling numbers: mean or median? A small practice table',
      body: `<p>TradeFlow’s tables have no missing numbers, so to practise filling numbers safely, we will build a tiny table of our own. You make a DataFrame from a <b>dictionary of lists</b>, which you will recognise from lesson 1.5: each <b>key</b> becomes a column name, and each <b>list</b> becomes that column’s values. Python’s <code>None</code> becomes a missing value.</p>
<p><code>pd.DataFrame({"order_id": [1, 2, 3, 4, 5], "amount": [120, None, 300, 180, None]})</code></p>
<p>Five orders, two of them with no amount. What would you fill the gaps with? The <b>mean</b> of the known amounts is 200. The <b>median</b> is 180. Which one is better? In lesson 2.2 you saw that a few very large values can drag the mean upwards, while the median stays in the middle. So for money, the median is usually the safer choice.</p>`
    },
    {
      type: 'try',
      title: 'Mean fill against median fill',
      body: `<p>The table has two missing amounts. The second line shows the known amounts’ mean (<b>200</b>) and median (<b>180</b>). Then we fill with each. Filling with the median gives <b>[120, 180, 300, 180, 180]</b>. Filling with the mean gives <b>[120, 200, 300, 180, 200]</b>. A small difference here, but with a few very large values in a real column, the gap can be big. Whichever you choose, say so in your notes.</p>`,
      code: `import pandas as pd

table = pd.DataFrame({
    "order_id": [1, 2, 3, 4, 5],
    "amount": [120, None, 300, 180, None]
})

print(table["amount"].mean(), table["amount"].median())
print(table["amount"].fillna(table["amount"].median()).tolist())
print(table["amount"].fillna(table["amount"].mean()).tolist())`
    },
    {
      id: 'py-3-1-c3',
      type: 'check',
      title: 'Why is the median usually safer than the mean when filling missing payments?',
      body: `<p>Remember the payments you described in lesson 2.2.</p>`,
      options: ['The median is easier to type', 'A few very large payments pull the mean up, so the median is closer to a typical payment', 'The mean cannot be calculated when values are missing', 'The median is always exactly equal to the mean'],
      answer: 1,
      why: [
        'Typing effort is not the reason.',
        'Yes! Payments have a few huge values. They drag the mean far above a typical payment, while the median stays near the middle.',
        'Pandas ignores missing values when it works out a mean, so it can be calculated.',
        'They are only equal in perfectly balanced data. In the payments, the mean is 158198 and the median 127828.'
      ]
    },
    {
      id: 'py-3-1-ex5',
      type: 'exercise',
      title: 'Challenge: fill with the median',
      body: `<p>The table <code>table</code> is built for you in the box, with two missing amounts. Fill the missing values of the <code>amount</code> column with the <b>median</b> of that column, and print the filled column as a <b>list</b> with <code>.tolist()</code>. You should see <code>[120.0, 180.0, 300.0, 180.0, 180.0]</code>.</p>
<p><b>Think before you type:</b> <code>table["amount"].fillna( the median )</code>, where the median is <code>table["amount"].median()</code>. Then <code>.tolist()</code> and print.</p>`,
      starter: `import pandas as pd\n\ntable = pd.DataFrame({\n    "order_id": [1, 2, 3, 4, 5],\n    "amount": [120, None, 300, 180, None]\n})\n\n# Write your code below\n`,
      hints: [
        `table["amount"].fillna(table["amount"].median()) fills the gaps. Add .tolist() and put it in a print.`,
        `import pandas as pd\ntable = pd.DataFrame({"order_id": [1, 2, 3, 4, 5], "amount": [120, None, 300, 180, None]})\nprint(table["amount"].fillna(table["amount"].median()).tolist())`
      ],
      solution: `import pandas as pd\ntable = pd.DataFrame({"order_id": [1, 2, 3, 4, 5], "amount": [120, None, 300, 180, None]})\nprint(table["amount"].fillna(table["amount"].median()).tolist())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>Cleaning missing values is mostly judgement, and you now have both the tools and the questions. You can:</p>
<ul>
<li>Measure the problem with <code>.isnull().sum()</code> and the share with <code>.isnull().mean()</code></li>
<li>Look at just the rows with missing values, using a True/False column inside square brackets</li>
<li>Ask <b>why</b> a value is missing (unknown, not applicable yet, or a mistake) before acting</li>
<li><b>Leave</b> a blank that tells the truth, <b>drop</b> rows with <code>.dropna()</code> (using <code>subset</code>), or <b>fill</b> with <code>.fillna()</code></li>
<li>Know the risks: dropping can bias results, and filling invents data, so always tell your reader</li>
<li>Build a small DataFrame from a dictionary of lists, and choose between a mean and a median fill</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>How do you decide whether to drop or fill a missing value?</li>
<li>What is the difference between <code>dropna()</code> and <code>dropna(subset=[...])</code>?</li>
<li>What are the risks of filling missing numbers with the mean?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I first find out why it is missing and how much is missing. If the blank is the truth, as with a delivery date for a parcel not yet delivered, I leave it. If a small number of rows is unusable, I may drop them, and I check the effect on the row count and for bias. If I need the row, I fill it, with a clear placeholder for text or a defensible value such as the median for numbers, and I document it.</p>
<p><b>2.</b> dropna() removes any row with a missing value in any column. With subset, it only considers the listed columns, so only rows missing those specific values are removed.</p>
<p><b>3.</b> It invents values that look real, it can pull the column towards the middle and make it look less variable than it really is, and if the column has outliers, the mean is not a typical value. The median is often safer, and in either case the fill should be documented.</p>
</details>
<p><b>Coming next, in lesson 3.2:</b> fixing data types. You have already noticed that the dates in TradeFlow’s tables are stored as plain text. That means you cannot work out how long a delivery took, or ask which month an order was placed in. Next, you will turn text dates into real dates, and numbers stored as text into real numbers, and open up a whole new set of questions you can ask.</p>`
    }
  ]
},
{
  id: 'py-3-2',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries'],
  setup: '',
  title: '3.2 Fixing data types: real dates and real numbers',
  tables: [],
  intro: `The operations director asks a simple question: <i>“How long does a delivery take, on average?”</i> You open the deliveries table. Each row has a dispatch date and a delivery date. Subtract one from the other, you think, and take the average. Easy.<br><br>You try it, and Python refuses. The dates look like dates to your eyes, but Python sees them as <b>plain text</b>, like the word “banana”. You cannot subtract one word from another. You noticed this in lesson 2.2: the check-up showed <code>object</code> for every date column. Now it is time to fix it.<br><br>Fixing data types is a small job with a big payoff. Once a date is a real date, Python can tell you the month, the weekday, and the number of days between two of them. Once a number stored as text becomes a real number, you can add it up. By the end of this lesson, you will answer the operations director’s question in two lines.`,
  steps: [
    {
      type: 'explain',
      title: 'Why a date stored as text is not really a date',
      body: `<p>Think about how you read “2024-04-02”. Your brain knows it is the second of April, and that 2024-04-15 is later. To Python, it is just a row of characters: a 2, a 0, a 2, a 4, a dash, and so on. It looks like a date, but it behaves like a word.</p>
<p>A date stored as text can still be <b>sorted</b>, because this year-first format happens to sort correctly alphabetically. That is why it seems fine at first. But it cannot do any real date work:</p>
<ul>
<li>You cannot <b>subtract</b> two of them to get a number of days.</li>
<li>You cannot ask for the <b>month</b>, the <b>year</b> or the <b>weekday</b>.</li>
<li>You cannot <b>add 30 days</b> to find a due date.</li>
</ul>
<p>Let’s watch the failure happen, so you recognise it.</p>`
    },
    {
      type: 'try',
      title: 'Subtracting two dates stored as text',
      body: `<p>Run it. We take the second and the first order dates from the table and try to subtract them. Python stops with a <b>TypeError</b>: it does not know how to subtract one string from another. The message names both types: <code>'str' and 'str'</code>. That <code>str</code> is the clue. It tells you the dates are text.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")

first = orders["order_date"].iloc[0]
second = orders["order_date"].iloc[1]
print(first, second)
print(second - first)`
    },
    {
      type: 'explain',
      title: 'to_datetime: turning text into real dates',
      body: `<p>The tool for the job is <code>pd.to_datetime()</code>. You give it a column of text, and you tell it <b>what the dates look like</b> with a short pattern called a <b>format</b>:</p>
<p><code>orders["order_date"] = pd.to_datetime(orders["order_date"], format="%Y-%m-%d")</code></p>
<p>The pattern uses little codes: <code>%Y</code> is a four-digit year, <code>%m</code> is the month number, <code>%d</code> is the day. So <code>"%Y-%m-%d"</code> describes <code>2024-04-02</code> exactly: year, dash, month, dash, day. Giving the format is the professional habit, for two reasons. It is <b>faster</b>, and it is <b>safe</b>: Pandas will not guess, and will not quietly read 03/04/2024 as the wrong day.</p>
<p>Notice the line stores the result <b>back into the same column</b>, replacing the text with real dates. Afterwards, the column’s type is <code>datetime64[ns]</code>, Pandas’ name for a real date and time.</p>`
    },
    {
      type: 'try',
      title: 'Converting and checking',
      body: `<p>Run it. First we print the type before: <b>object</b> (text). Then we convert, and print again: <b>datetime64[ns]</b>, a real date. Now Pandas can do date maths. The last two lines show the earliest and latest orders (2023-01-01 and 2026-06-30), and the length of the whole period, <b>1276 days</b>, found by simply subtracting the two dates. Compare that with the TypeError a minute ago.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")

print(orders["order_date"].dtype)

orders["order_date"] = pd.to_datetime(orders["order_date"], format="%Y-%m-%d")

print(orders["order_date"].dtype)
print(orders["order_date"].min(), orders["order_date"].max())
print((orders["order_date"].max() - orders["order_date"].min()).days)`
    },
    {
      id: 'py-3-2-c1',
      type: 'check',
      title: 'Why convert a text column of dates into real dates?',
      body: `<p>Think about what you could and could not do with text.</p>`,
      options: ['So the dates look nicer', 'So Python can do date work: subtract dates, find months and weekdays', 'Because Pandas cannot print text', 'To make the file smaller on disk'],
      answer: 1,
      why: [
        'Looks have nothing to do with it. The point is what you can calculate.',
        'Yes! Real dates can be subtracted, grouped by month or weekday, and compared properly. Text cannot.',
        'Pandas prints text perfectly well.',
        'The file on disk does not change at all. Only how Pandas understands the column changes.'
      ]
    },
    {
      id: 'py-3-2-ex1',
      type: 'exercise',
      title: 'Your turn: convert the order dates',
      body: `<p>Load <code>orders.csv</code> into a jar called <code>orders</code>. Convert the <code>order_date</code> column into real dates with <code>pd.to_datetime</code>, using the format <code>"%Y-%m-%d"</code>, and store the result back in the same column. Then print the <b>dtype</b> of the column. You should see <code>datetime64[ns]</code>.</p>
<p><b>Think before you type:</b> load, convert and store, then <code>print(orders["order_date"].dtype)</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `orders["order_date"] = pd.to_datetime(orders["order_date"], format="%Y-%m-%d"), then print its dtype.`,
        `import pandas as pd\norders = pd.read_csv("orders.csv")\norders["order_date"] = pd.to_datetime(orders["order_date"], format="%Y-%m-%d")\nprint(orders["order_date"].dtype)`
      ],
      solution: `import pandas as pd\norders = pd.read_csv("orders.csv")\norders["order_date"] = pd.to_datetime(orders["order_date"], format="%Y-%m-%d")\nprint(orders["order_date"].dtype)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The .dt drawer: year, month, weekday',
      body: `<p>Once a column holds real dates, a whole drawer of date tools opens. You reach it with <code>.dt</code>, the way you reached the text tools in lesson 1.3 with a dot after a string. Some of the most useful:</p>
<table class="mini">
<tr><th>Tool</th><th>What it gives</th></tr>
<tr><td><code>.dt.year</code></td><td>the year of each date, such as 2024</td></tr>
<tr><td><code>.dt.month</code></td><td>the month number, 1 to 12</td></tr>
<tr><td><code>.dt.day</code></td><td>the day of the month</td></tr>
<tr><td><code>.dt.day_name()</code></td><td>the weekday, such as Wednesday</td></tr>
</table>
<p>Combine them with <code>value_counts</code> from lesson 2.3, and you can answer questions like “how many orders per year?” or “which weekday is busiest?” in a single line. One small extra: <code>.sort_index()</code> sorts the counts by their <b>labels</b> (here the years, in order) instead of by size.</p>`
    },
    {
      type: 'try',
      title: 'Orders per year, and the busiest weekday',
      body: `<p>The first result counts orders for each year, in year order: <b>2023: 2850, 2024: 2865, 2025: 2879</b> and <b>2026: 1406</b>. The year 2026 is smaller because our data stops at the end of June. The second shows the weekdays, busiest first: <b>Wednesday</b> with 1509 orders is the top. Without conversion, none of these questions could have been asked.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")
orders["order_date"] = pd.to_datetime(orders["order_date"], format="%Y-%m-%d")

print(orders["order_date"].dt.year.value_counts().sort_index())
print(orders["order_date"].dt.day_name().value_counts())`
    },
    {
      type: 'try',
      title: 'The drawer stays locked on text',
      body: `<p>This is what happens if you forget to convert. The <code>.dt</code> drawer only opens for real dates, so Pandas raises an <b>AttributeError</b>: “Can only use .dt accessor with datetimelike values.” In plain words: “this column is not holding dates, so it has no date tools”. If you ever see this message, the cure is always the same: convert the column with <code>to_datetime</code> first.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")

print(orders["order_date"].dt.year)`
    },
    {
      id: 'py-3-2-ex2',
      type: 'exercise',
      title: 'Your turn: orders per year',
      body: `<p>Load <code>orders.csv</code>, convert <code>order_date</code> into real dates (format <code>"%Y-%m-%d"</code>), and show the <b>number of orders in each year</b>, in year order, on the last line of your code. You should see 2023 with 2850, 2024 with 2865, 2025 with 2879 and 2026 with 1406.</p>
<p><b>Think before you type:</b> after converting, use <code>.dt.year</code>, then <code>.value_counts()</code>, then <code>.sort_index()</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `After the conversion, the last line is orders["order_date"].dt.year.value_counts().sort_index().`,
        `import pandas as pd\norders = pd.read_csv("orders.csv")\norders["order_date"] = pd.to_datetime(orders["order_date"], format="%Y-%m-%d")\norders["order_date"].dt.year.value_counts().sort_index()`
      ],
      solution: `import pandas as pd\norders = pd.read_csv("orders.csv")\norders["order_date"] = pd.to_datetime(orders["order_date"], format="%Y-%m-%d")\norders["order_date"].dt.year.value_counts().sort_index()`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Subtracting dates: the operations director’s question',
      body: `<p>Now you can answer how long a delivery takes. Convert both date columns, then subtract. The result is a column of <b>time gaps</b> (Pandas calls them <i>timedeltas</i>), and a final <code>.dt.days</code> turns each gap into a plain number of days.</p>
<p><code>days = (deliveries["delivery_date"] - deliveries["dispatch_date"]).dt.days</code></p>
<p>What about the 1,239 deliveries with no arrival date? Their gap is missing too, and the good news is that <code>.mean()</code>, <code>.min()</code> and <code>.max()</code> simply <b>skip missing values</b>. So the average is worked out only over the deliveries that actually arrived. That is exactly what we want, and it is one more reason why we left those blanks alone in the last lesson.</p>`
    },
    {
      type: 'try',
      title: 'How long does a delivery take?',
      body: `<p>Run it. Out of 9500 deliveries, <b>8261</b> have both dates, and Pandas worked only with those. The average delivery takes <b>5.51 days</b>, the fastest took <b>1</b> day and the slowest <b>10</b>. Two lines of real work gave the operations director a number she can quote. (If you watch the TradeFlow videos, 5.51 days is a figure that comes back in the exploratory analysis.)</p>`,
      code: `import pandas as pd

deliveries = pd.read_csv("deliveries.csv")

deliveries["dispatch_date"] = pd.to_datetime(deliveries["dispatch_date"], format="%Y-%m-%d")
deliveries["delivery_date"] = pd.to_datetime(deliveries["delivery_date"], format="%Y-%m-%d")

days = (deliveries["delivery_date"] - deliveries["dispatch_date"]).dt.days

print(days.count())
print(round(days.mean(), 2))
print(days.min(), days.max())`
    },
    {
      id: 'py-3-2-ex3',
      type: 'exercise',
      title: 'Your turn: the average delivery time',
      body: `<p>Load <code>deliveries.csv</code> into a jar called <code>deliveries</code>. Convert <code>dispatch_date</code> and <code>delivery_date</code> into real dates (format <code>"%Y-%m-%d"</code>). Then print the <b>average number of days</b> between dispatch and delivery, <b>rounded to 2 decimals</b>. You should see <code>5.51</code>.</p>
<p><b>Think before you type:</b> two conversions, then subtract the dispatch date from the delivery date, take <code>.dt.days</code>, then <code>.mean()</code> and <code>round</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `Convert both columns with pd.to_datetime(..., format="%Y-%m-%d"). Then (deliveries["delivery_date"] - deliveries["dispatch_date"]).dt.days.mean().`,
        `import pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\ndeliveries["dispatch_date"] = pd.to_datetime(deliveries["dispatch_date"], format="%Y-%m-%d")\ndeliveries["delivery_date"] = pd.to_datetime(deliveries["delivery_date"], format="%Y-%m-%d")\nprint(round((deliveries["delivery_date"] - deliveries["dispatch_date"]).dt.days.mean(), 2))`
      ],
      solution: `import pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\ndeliveries["dispatch_date"] = pd.to_datetime(deliveries["dispatch_date"], format="%Y-%m-%d")\ndeliveries["delivery_date"] = pd.to_datetime(deliveries["delivery_date"], format="%Y-%m-%d")\nprint(round((deliveries["delivery_date"] - deliveries["dispatch_date"]).dt.days.mean(), 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Numbers hiding as text',
      body: `<p>Dates are not the only thing that arrives as text. Numbers often do too, especially when someone typed them into a spreadsheet, or when a cell contains a stray “N/A”. One text value in a column makes Pandas read the <b>entire column</b> as text.</p>
<p>The tool to fix it is <code>pd.to_numeric()</code>. By default, it stops with an error the moment it meets something that is not a number. But you can ask it to be gentle with one option: <code>errors="coerce"</code>. “Coerce” means “force”: anything that cannot be turned into a number becomes a missing value (<b>NaN</b>) instead of crashing.</p>
<p>If that sounds familiar, it should. It is the same idea as the <code>try</code> and <code>except</code> safety net from lesson 1.8, built into one option. Instead of counting the bad values by hand, Pandas turns them into NaN, and you can then count them with <code>.isnull().sum()</code>.</p>`
    },
    {
      type: 'try',
      title: 'A column of numbers stored as text',
      body: `<p>Here is a small column of text values, with one rogue <code>"N/A"</code>. The first conversion, with <code>errors="coerce"</code>, gives <b>[100.0, nan, 250.5]</b>: the two real numbers converted, and the “N/A” became a missing value. The last line counts how many values failed to convert: <b>1</b>. Without <code>errors="coerce"</code>, Pandas would have stopped with a ValueError at the first bad value.</p>`,
      code: `import pandas as pd

raw = pd.Series(["100", "N/A", "250.5"])

clean = pd.to_numeric(raw, errors="coerce")
print(clean.tolist())
print(clean.isnull().sum())`
    },
    {
      id: 'py-3-2-c2',
      type: 'check',
      title: 'What does errors="coerce" do in pd.to_numeric?',
      body: `<p>Think about the value "N/A" in a column of numbers.</p>`,
      options: ['It deletes the rows that cannot be converted', 'It turns values that cannot be converted into NaN instead of raising an error', 'It converts "N/A" into the number 0', 'It stops the program'],
      answer: 1,
      why: [
        'No rows are deleted. The bad values become NaN, and the rows stay.',
        'Yes! Values that are not numbers become NaN (missing), so one bad value does not crash the whole conversion.',
        'It never invents a zero. It marks the value as missing.',
        'The opposite. Without it, the program would stop at the first bad value.'
      ]
    },
    {
      id: 'py-3-2-ex4',
      type: 'exercise',
      title: 'Your turn: convert text to numbers, gently',
      body: `<p>The Series <code>raw</code> holds four text values. Convert it into numbers with <code>pd.to_numeric</code>, turning anything invalid into NaN, and print the result as a <b>list</b>. You should see <code>[1200.0, nan, 15.5, nan]</code>.</p>
<p><b>Think before you type:</b> <code>pd.to_numeric(raw, errors="coerce")</code>, then <code>.tolist()</code>, inside a print.</p>`,
      starter: `import pandas as pd\n\nraw = pd.Series(["1200", "unknown", "15.5", ""])\n\n# Write your code below\n`,
      hints: [
        `pd.to_numeric(raw, errors="coerce") does the conversion. Add .tolist() and print it.`,
        `import pandas as pd\nraw = pd.Series(["1200", "unknown", "15.5", ""])\nprint(pd.to_numeric(raw, errors="coerce").tolist())`
      ],
      solution: `import pandas as pd\nraw = pd.Series(["1200", "unknown", "15.5", ""])\nprint(pd.to_numeric(raw, errors="coerce").tolist())`,
      ordered: true
    },
    {
      id: 'py-3-2-c3',
      type: 'check',
      title: 'Why do professionals write format="%Y-%m-%d" in to_datetime, instead of letting Pandas guess?',
      body: `<p>Think about a date written as 03/04/2024.</p>`,
      options: ['Because Pandas cannot guess at all', 'It is faster, and it removes the risk of Pandas misreading ambiguous dates such as 03/04/2024 (March 4th or 3rd of April?)', 'Because the format makes the dates look prettier', 'Because without it, the column becomes text'],
      answer: 1,
      why: [
        'Pandas can guess, and often guesses well. The danger is when it guesses wrongly without telling you.',
        'Yes! Stating the format is explicit, faster, and safe. Ambiguous dates are a classic source of silent errors in analysis.',
        'The format affects how the text is read, not how the result looks.',
        'The column becomes real dates either way. The format only controls how the text is understood.'
      ]
    },
    {
      id: 'py-3-2-ex5',
      type: 'exercise',
      title: 'Challenge: how many orders in 2025?',
      body: `<p>Load <code>orders.csv</code> into a jar called <code>orders</code>, convert <code>order_date</code> into real dates (format <code>"%Y-%m-%d"</code>), and print the <b>number of orders placed in the year 2025</b>. You should see <code>2879</code>.</p>
<p><b>Think before you type:</b> <code>orders["order_date"].dt.year == 2025</code> gives a True or False for every order. Remember from lesson 2.2 that <code>.sum()</code> adds up Trues as 1 each.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `After converting, (orders["order_date"].dt.year == 2025).sum() counts the orders from 2025.`,
        `import pandas as pd\norders = pd.read_csv("orders.csv")\norders["order_date"] = pd.to_datetime(orders["order_date"], format="%Y-%m-%d")\nprint((orders["order_date"].dt.year == 2025).sum())`
      ],
      solution: `import pandas as pd\norders = pd.read_csv("orders.csv")\norders["order_date"] = pd.to_datetime(orders["order_date"], format="%Y-%m-%d")\nprint((orders["order_date"].dt.year == 2025).sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>Fixing a data type is small work with a big payoff. You can now:</p>
<ul>
<li>Explain why a date stored as text cannot be subtracted or broken into parts, and recognise the <b>TypeError</b> and <b>AttributeError</b> that give it away</li>
<li>Convert text into real dates with <code>pd.to_datetime(..., format="%Y-%m-%d")</code>, and know why stating the format is the professional habit</li>
<li>Open the <b>.dt</b> drawer for <code>year</code>, <code>month</code>, <code>day</code> and <code>day_name()</code>, and combine it with <code>value_counts</code> and <code>sort_index</code></li>
<li>Subtract two dates to get a gap, turn it into days with <code>.dt.days</code>, and rely on missing values being skipped by <code>mean</code>, <code>min</code> and <code>max</code></li>
<li>Turn numbers stored as text into real numbers with <code>pd.to_numeric(errors="coerce")</code>, and connect it to the try and except net from Module 1</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>Why should dates be converted to a datetime type before analysis?</li>
<li>How would you find the average number of days between two date columns?</li>
<li>What does <code>errors="coerce"</code> do?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Dates stored as text cannot be subtracted, compared properly across formats, or broken into year, month and weekday. Converting to a datetime type enables date arithmetic, grouping by period, and correct sorting, and it also validates that every value really is a date.</p>
<p><b>2.</b> Convert both columns with pd.to_datetime, subtract one from the other to get a timedelta column, take .dt.days to get plain numbers, and call .mean(). Pandas skips missing values automatically.</p>
<p><b>3.</b> With pd.to_numeric or pd.to_datetime, errors="coerce" turns any value that cannot be converted into NaN or NaT instead of raising an error, so a few bad values do not stop the whole conversion, and I can then count them and decide what to do.</p>
</details>
<p><b>Coming next, in lesson 3.3:</b> duplicates. TradeFlow’s order lines have 147 combinations of order and product that appear more than once. Are they mistakes, or real purchases? You will learn to find repeated rows, to remove true duplicates, and, even more importantly, to know when <b>not</b> to remove them.</p>`
    }
  ]
}
);
