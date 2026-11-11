LESSONS.push(
{
  id: 'py-4-1',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: '',
  title: '4.1 Calculated columns: making new facts from old ones',
  tables: [],
  intro: `The CEO sends you one question for the quarterly review: <i>“Which product category earns the most money?”</i><br><br>You open the order lines table, and the first problem appears straight away. It has a <code>quantity</code> and a <code>unit_price</code>, but there is <b>no column called revenue</b>. Nobody ever typed revenue into the data. It has to be <i>calculated</i>.<br><br>That is the story of the whole module. The CEO’s question is a five-step path, and you will take one step per lesson: calculate the revenue of every line (this lesson), keep only the right rows (4.2), sort them (4.3), group and total them (4.4), and finally link each line to its product category (4.5). By the end of the module you will have the answer.<br><br>Step one is the most useful trick in all of data analysis: creating a <b>new column from the columns you already have</b>.`,
  steps: [
    {
      type: 'explain',
      title: 'A calculated column is a formula you write once',
      body: `<p>Raw data stores what was recorded: a quantity, a price, a date. Analysis needs <b>derived facts</b>: the revenue of a line, the year of an order, whether a payment is large. A <b>calculated column</b> is a new column whose values are worked out from existing ones. In Pandas it is one line:</p>
<p><code>table["new_column"] = some expression using other columns</code></p>
<p>Three kinds of calculated column cover most of what analysts build:</p>
<table class="mini">
<tr><th>Kind</th><th>Example</th><th>What you get</th></tr>
<tr><td><b>Arithmetic</b></td><td>quantity times unit_price</td><td>a number, like the revenue of a line</td></tr>
<tr><td><b>Flag</b></td><td>line_total above 100000</td><td>True or False for every row</td></tr>
<tr><td><b>Date part</b></td><td>the year of an order date</td><td>2023, 2024, 2025…</td></tr>
</table>
<div class="callout analogy"><b>If you have used a spreadsheet,</b> you already know this. You type a formula such as <code>=B2*C2</code> in the first cell, then drag it down 25,000 rows. Pandas does the dragging for you. You write the formula once, and it applies to every row at the same moment.</div>
<p>Let’s see it on a table so small that you can check every answer in your head.</p>`
    },
    {
      type: 'try',
      title: 'Four order lines, one formula',
      body: `<p>The table has four lines. The line <code>tiny["total"] = tiny["quantity"] * tiny["price"]</code> creates a new column called <code>total</code>. Pandas multiplies the two columns <b>row by row</b>: 2 times 100 is 200, 1 times 250 is 250, and so on.</p>
<p>Compare it with what you would have written in Module 1: a loop that walks down the rows, multiplies, and appends to a list. The loop version works, and it gives the same four answers, but it is longer and, on 25,000 rows, slower. Whenever you can describe a calculation as “this column times that column”, <b>write it on the columns, not in a loop</b>. This is called working with whole columns at once.</p>`,
      code: `import pandas as pd

tiny = pd.DataFrame({
    "quantity": [2, 1, 3, 5],
    "price": [100, 250, 80, 40]
})

totals = []
for row in range(len(tiny)):
    totals.append(tiny["quantity"][row] * tiny["price"][row])
print("Loop version:", totals)

tiny["total"] = tiny["quantity"] * tiny["price"]
print(tiny)`
    },
    {
      type: 'explain',
      title: 'Four rules for creating columns',
      body: `<p>Before we use this on the real data, four rules that will save you from the most common surprises:</p>
<ol>
<li><b>Assigning creates or overwrites.</b> If the column name does not exist, a new column appears at the right-hand end. If it <i>does</i> exist, its old values are replaced, silently, with no warning.</li>
<li><b>You change the table in memory, not the file.</b> Your CSV stays exactly as it was. Run the code again tomorrow and you get the same result.</li>
<li><b>Missing values spread.</b> If one of the inputs is missing in a row, the calculated value for that row is missing too. Pandas does not guess.</li>
<li><b>Give columns clear names.</b> <code>line_total</code> tells the next reader what it is. <code>x2</code> does not.</li>
</ol>
<div class="callout watch"><b>Watch out for rule 1.</b> Writing <code>table["quantity"] = table["quantity"] * 2</code> does not add a column. It <i>replaces</i> the quantity with a doubled version, and the original numbers are gone from your table. When in doubt, give the result a new name.</div>
<p>Now the real thing: the revenue of every one of the 25,000 order lines.</p>`
    },
    {
      type: 'try',
      title: 'Revenue for every order line',
      body: `<p>One line of code gave all 25,000 order lines a revenue figure. The first row is order 1, product 98: quantity 1 at 12384.57, so a line total of 12384.57. The second row has quantity 2, so its total is exactly double its unit price.</p>
<p>Look at the three numbers underneath. The total of the new column is <b>1581981450.5</b>, which you will recognise from lesson 3.3 as exactly what customers were billed. The largest single line is <b>420409.25</b>, and the average line is <b>63279.26</b>. In one line you turned two ingredient columns into the number the CEO cares about.</p>`,
      code: `import pandas as pd

order_items = pd.read_csv("order_items.csv")

order_items["line_total"] = order_items["quantity"] * order_items["unit_price"]

print(order_items.head(4))
print(round(order_items["line_total"].sum(), 2))
print(round(order_items["line_total"].max(), 2))
print(round(order_items["line_total"].mean(), 2))`
    },
    {
      id: 'py-4-1-ex1',
      type: 'exercise',
      title: 'Your turn: the biggest single line',
      body: `<p>Load <code>order_items.csv</code>, create the <code>line_total</code> column, and print the <b>largest line total</b>, rounded to 2 decimals. You should see <code>420409.25</code>.</p>
<p><b>Think before you type:</b> first the formula, <code>quantity</code> times <code>unit_price</code>, stored in a new column. Then <code>.max()</code> on that column, wrapped in <code>round(..., 2)</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `order_items["line_total"] = order_items["quantity"] * order_items["unit_price"]. Then print(round(order_items["line_total"].max(), 2)).`,
        `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\nprint(round(order_items["line_total"].max(), 2))`
      ],
      solution: `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\nprint(round(order_items["line_total"].max(), 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Flags: a column of True and False',
      body: `<p>Not every calculated column is a number. A <b>flag</b> answers a yes-or-no question about every row. You make one with a comparison:</p>
<p><code>table["is_big"] = table["line_total"] &gt; 100000</code></p>
<p>The new column holds True where the line total is above 100000 and False everywhere else. Flags are the raw material of filtering (next lesson) and of every “how many” and “what share” question.</p>
<p>Two tricks make flags powerful. Pandas treats <b>True as 1 and False as 0</b>, so:</p>
<ul>
<li><code>.sum()</code> on a flag <b>counts</b> the Trues: how many big lines.</li>
<li><code>.mean()</code> on a flag gives the <b>share</b> of Trues, as a number between 0 and 1: what fraction of lines are big. Multiply by 100 for a percentage.</li>
</ul>
<p>Between them, these two give the answers to a huge number of business questions.</p>`
    },
    {
      type: 'try',
      title: 'How many lines are big?',
      body: `<p>The flag <code>is_big</code> marks every line with a total above 100000. The count is <b>4971</b> lines. The mean is <b>0.19884</b>, which means 19.884 percent of all lines are big: about one in five. We multiply by 100 and round to get <b>19.88</b>.</p>
<p>Notice how short this is. “How many?” is <code>.sum()</code>. “What share?” is <code>.mean()</code>. You will use that pair again and again.</p>`,
      code: `import pandas as pd

order_items = pd.read_csv("order_items.csv")
order_items["line_total"] = order_items["quantity"] * order_items["unit_price"]

order_items["is_big"] = order_items["line_total"] > 100000

print(order_items["is_big"].sum())
print(order_items["is_big"].mean())
print(round(order_items["is_big"].mean() * 100, 2))
print(order_items[["line_total", "is_big"]].head(3))`
    },
    {
      id: 'py-4-1-c1',
      type: 'check',
      title: 'A True/False column has a mean of 0.19884. What does that number tell you?',
      body: `<p>Remember that True counts as 1 and False counts as 0.</p>`,
      options: [
        'The average line total is 0.19884',
        'About 19.9 percent of the rows are True',
        'There are 0.19884 big lines',
        'It is an error, because you cannot average True and False'
      ],
      answer: 1,
      why: [
        'The column holds True and False, not money. The mean of ones and zeros is the share of ones.',
        'Right! Add up the ones (the Trues) and divide by the number of rows. That is the share of Trues: 0.19884, or about 19.9 percent.',
        'A count would be a whole number. 4971 is the count of big lines, and that comes from .sum().',
        'Pandas happily treats True as 1 and False as 0, which is exactly what makes .mean() so useful on flags.'
      ]
    },
    {
      id: 'py-4-1-ex2',
      type: 'exercise',
      title: 'Your turn: the value of the stock on the shelves',
      body: `<p>The warehouse manager asks: <i>“How much money is sitting on our shelves?”</i> Load <code>products.csv</code>. Create a column called <code>stock_value</code> equal to <code>unit_price</code> times <code>stock_quantity</code>. Print the <b>total of that column</b>, rounded to 2 decimals. You should see <code>804248691.32</code>.</p>
<p><b>Think before you type:</b> the same pattern as the line total: a formula on two columns, stored in a new column, then <code>.sum()</code> and <code>round(..., 2)</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `products["stock_value"] = products["unit_price"] * products["stock_quantity"]. Then print(round(products["stock_value"].sum(), 2)).`,
        `import pandas as pd\nproducts = pd.read_csv("products.csv")\nproducts["stock_value"] = products["unit_price"] * products["stock_quantity"]\nprint(round(products["stock_value"].sum(), 2))`
      ],
      solution: `import pandas as pd\nproducts = pd.read_csv("products.csv")\nproducts["stock_value"] = products["unit_price"] * products["stock_quantity"]\nprint(round(products["stock_value"].sum(), 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Date parts: the year, the month, the weekday',
      body: `<p>In lesson 3.2 you learned to turn text dates into real dates with <code>pd.to_datetime</code>. Real dates have a drawer called <b><code>.dt</code></b>, much like the <code>.str</code> drawer for text, and inside it sit the parts of a date:</p>
<table class="mini">
<tr><th>Tool</th><th>What it gives</th></tr>
<tr><td><code>.dt.year</code></td><td>2023, 2024…</td></tr>
<tr><td><code>.dt.month</code></td><td>1 to 12</td></tr>
<tr><td><code>.dt.day_name()</code></td><td>“Monday”, “Tuesday”… (note the brackets)</td></tr>
</table>
<p>Each of these creates a new column you can count, filter or group by. “Orders per year”, “sales per month”, “the busiest weekday” all start with a date part.</p>
<p>To count how many times each value appears, use <code>.value_counts()</code>. It sorts by the biggest count. If you would rather see the years in order, add <code>.sort_index()</code>, which sorts by the labels instead.</p>`
    },
    {
      type: 'try',
      title: 'Orders per year, and the busiest weekdays',
      body: `<p>The first table shows orders per year: <b>2023: 2850</b>, <b>2024: 2865</b>, <b>2025: 2879</b> and <b>2026: 1406</b>. The second shows the three busiest weekdays: <b>Wednesday 1509</b>, then Thursday 1453 and Saturday 1434.</p>
<p>Look at 2026. It has only about half the orders of the other years. Does that mean the business collapsed? Hold that question for the next check.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")

orders["order_date"] = pd.to_datetime(orders["order_date"], format="%Y-%m-%d")
orders["order_year"] = orders["order_date"].dt.year
orders["order_weekday"] = orders["order_date"].dt.day_name()

print(orders["order_year"].value_counts().sort_index())
print(orders["order_weekday"].value_counts().head(3))`
    },
    {
      id: 'py-4-1-c2',
      type: 'check',
      title: 'The CEO sees 1,406 orders for 2026 against 2,879 for 2025 and says: “Our business has halved.” What do you say?',
      body: `<p>Think about the dates in the data. The earliest order is 1 January 2023 and the latest is 30 June 2026.</p>`,
      options: [
        'She is right, so we should report a 50 percent fall',
        'The data stops on 30 June 2026, so 2026 holds only half a year. To compare fairly, we must use the same months in each year',
        'The 2026 numbers must be wrong, so delete them',
        'Orders always fall in the second half of the year'
      ],
      answer: 1,
      why: [
        'A full year is being compared with half a year. The fall is an illusion created by the calendar.',
        'Exactly. Always check <i>what period</i> a number covers. Compare January to June of each year, and the picture is very different.',
        'Nothing is wrong with the 2026 data. It is just incomplete as a year, and that is a fact about the calendar.',
        'There is nothing in the data that says so. The reason is simpler: the data ends in June.'
      ]
    },
    {
      id: 'py-4-1-ex3',
      type: 'exercise',
      title: 'Your turn: how many March orders?',
      body: `<p>Load <code>orders.csv</code>, convert <code>order_date</code> to a real date, and print how many orders were placed in <b>March</b> (month number 3), across all years. You should see <code>1017</code>.</p>
<p><b>Think before you type:</b> use <code>pd.to_datetime</code> first. Then take <code>.dt.month</code>, compare it with <code>== 3</code> to get a flag, and count the Trues with <code>.sum()</code>. Remember: two equals signs to compare.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `orders["order_date"] = pd.to_datetime(orders["order_date"]). Then (orders["order_date"].dt.month == 3).sum().`,
        `import pandas as pd\norders = pd.read_csv("orders.csv")\norders["order_date"] = pd.to_datetime(orders["order_date"], format="%Y-%m-%d")\nprint((orders["order_date"].dt.month == 3).sum())`
      ],
      solution: `import pandas as pd\norders = pd.read_csv("orders.csv")\norders["order_date"] = pd.to_datetime(orders["order_date"], format="%Y-%m-%d")\nprint((orders["order_date"].dt.month == 3).sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Shares, and columns built from text',
      body: `<p>Two more patterns you will use constantly.</p>
<p><b>A share of the total.</b> To say what percentage of the whole each row represents, divide the row’s value by the column’s total: <code>table["amount"] / table["amount"].sum() * 100</code>. The sum is one number, and the division is applied to every row. The shares of all rows must add up to 100, which gives you a built-in check.</p>
<p><b>A column from text.</b> You can feed the text tools from lesson 3.4 straight into a new column: <code>customers["email_domain"] = customers["email"].str.lower().str.split("@").str[1]</code> gives every customer a column with their email provider, ready to count.</p>
<div class="callout work"><b>At work:</b> calculated columns are how a team writes down its definitions. “Revenue is quantity times unit price” becomes one line of code. Everyone who uses that column uses the same definition, and when the definition changes, you change one line. That is far safer than every analyst keeping their own version in their head.</div>`
    },
    {
      type: 'try',
      title: 'Each payment as a share of the total, and a domain column',
      body: `<p>Each payment now has a <code>share_pct</code>. The first payment, 246702.23, is only about <b>0.0156</b> percent of the grand total, because there are 10,000 payments. The last line before the table, <b>100.0</b>, is the built-in check: all the shares add up to 100 percent.</p>
<p>Then a new column built from text: <code>email_domain</code>. Counting it gives the same three providers you found in lesson 3.4: hotmail.com <b>663</b>, yahoo.com <b>661</b>, gmail.com <b>618</b>. (The customers with no email stay missing, so they are not counted.)</p>`,
      code: `import pandas as pd

payments = pd.read_csv("payments.csv")
customers = pd.read_csv("customers.csv")

payments["share_pct"] = payments["amount"] / payments["amount"].sum() * 100

print(round(payments["share_pct"].sum(), 2))
print(payments[["amount", "share_pct"]].head(3))

customers["email_domain"] = customers["email"].str.lower().str.split("@").str[1]
print(customers["email_domain"].value_counts())`
    },
    {
      id: 'py-4-1-c3',
      type: 'check',
      title: 'You write order_items["quantity"] = order_items["quantity"] * order_items["unit_price"]. What goes wrong?',
      body: `<p>Think about rule 1 of creating columns.</p>`,
      options: [
        'Nothing: it creates a new column called quantity',
        'It overwrites the quantity column with the line totals, so the real quantities are lost from the table and the column name now lies',
        'Python shows an error because the column already exists',
        'It changes the original CSV file'
      ],
      answer: 1,
      why: [
        'There is already a column called quantity, so no new column is created. The old one is replaced.',
        'Right. Assigning to an existing name replaces it silently. The quantities are gone, and “quantity” now holds money. Always give a calculated result a new, clear name.',
        'Pandas does not complain. It replaces the column without any warning, which is exactly why it is dangerous.',
        'The file on disk is never changed. Only the table in memory changes. Reload the CSV and the original quantities come back.'
      ]
    },
    {
      type: 'explain',
      title: 'Tidying: rename, drop and choose columns',
      body: `<p>As you add columns, tables get untidy. Three small tools keep them in order:</p>
<table class="mini">
<tr><th>Tool</th><th>What it does</th></tr>
<tr><td><code>table.rename(columns={"old": "new"})</code></td><td>Gives a column a new name. You pass a dictionary from Module 1: old name on the left, new name on the right</td></tr>
<tr><td><code>table.drop(columns=["a", "b"])</code></td><td>Removes columns you do not need</td></tr>
<tr><td><code>table[["a", "b"]]</code></td><td>Keeps only the columns you list, in the order you list them (double brackets, from lesson 2.3)</td></tr>
</table>
<p>All three return a <b>new table</b> and leave the original alone, just like <code>drop_duplicates</code> in lesson 3.3. To keep the result, store it: <code>tidy = table.rename(...)</code>.</p>
<p>A good habit: rename columns to the names the business uses. If everyone says “market” and the table says “country”, rename it, and your reports will read in the same language as your audience.</p>`
    },
    {
      type: 'try',
      title: 'Rename, then drop',
      body: `<p>First we rename <code>unit_price</code> to <code>price_each</code> and drop <code>order_item_id</code>. The first list shows the tidy table’s columns: <code>order_id</code>, <code>product_id</code>, <code>quantity</code>, <code>price_each</code>, <code>line_total</code>.</p>
<p>The second list proves the original was not touched: it still has <code>order_item_id</code> and <code>unit_price</code>. Because we stored the result in a new jar, <code>tidy</code>, we now have both versions side by side.</p>`,
      code: `import pandas as pd

order_items = pd.read_csv("order_items.csv")
order_items["line_total"] = order_items["quantity"] * order_items["unit_price"]

tidy = order_items.rename(columns={"unit_price": "price_each"})
tidy = tidy.drop(columns=["order_item_id"])

print(tidy.columns.tolist())
print(order_items.columns.tolist())`
    },
    {
      id: 'py-4-1-ex4',
      type: 'exercise',
      title: 'Your turn: speak the business’s language',
      body: `<p>Load <code>customers.csv</code>. Rename <code>customer_name</code> to <code>name</code> and <code>country</code> to <code>market</code>. Print the list of column names of the renamed table. You should see <code>['customer_id', 'name', 'email', 'market', 'region_id', 'signup_date']</code>.</p>
<p><b>Think before you type:</b> <code>.rename(columns={...})</code> takes a dictionary with two pairs. Put <code>.columns.tolist()</code> at the end to get the list.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `customers.rename(columns={"customer_name": "name", "country": "market"}) returns the renamed table. Add .columns.tolist() and print it.`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nrenamed = customers.rename(columns={"customer_name": "name", "country": "market"})\nprint(renamed.columns.tolist())`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nrenamed = customers.rename(columns={"customer_name": "name", "country": "market"})\nprint(renamed.columns.tolist())`,
      ordered: true
    },
    {
      id: 'py-4-1-ex5',
      type: 'exercise',
      title: 'Challenge: what share of lines are big?',
      body: `<p>Put the pieces together. Load <code>order_items.csv</code>. Create <code>line_total</code>, then a flag column <code>is_big</code> that is True when the line total is <b>above 100000</b>. Print the <b>percentage</b> of lines that are big, rounded to 2 decimals. You should see <code>19.88</code>.</p>
<p><b>Think before you type:</b> three steps in order: line total, then the flag with <code>&gt;</code>, then <code>.mean() * 100</code> inside <code>round(..., 2)</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `order_items["line_total"] = quantity * unit_price. order_items["is_big"] = order_items["line_total"] > 100000. Then round(order_items["is_big"].mean() * 100, 2).`,
        `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\norder_items["is_big"] = order_items["line_total"] > 100000\nprint(round(order_items["is_big"].mean() * 100, 2))`
      ],
      solution: `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\norder_items["is_big"] = order_items["line_total"] > 100000\nprint(round(order_items["is_big"].mean() * 100, 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You have taken step one of the CEO’s question: every order line now has a revenue figure. You can:</p>
<ul>
<li>Create a <b>calculated column</b> from existing columns, and explain why working on whole columns beats a loop</li>
<li>Remember the rules: assigning <b>overwrites</b> an existing name, the file never changes, and missing values spread</li>
<li>Build <b>flags</b> with comparisons, count them with <code>.sum()</code> and measure their share with <code>.mean()</code></li>
<li>Pull <b>date parts</b> with <code>.dt.year</code>, <code>.dt.month</code> and <code>.dt.day_name()</code>, and count them with <code>value_counts().sort_index()</code></li>
<li>Calculate a <b>share of the total</b>, and build columns from text with <code>.str</code></li>
<li><b>Rename</b>, <b>drop</b> and <b>choose</b> columns to keep tables tidy</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is a calculated (derived) column, and how do you create one in Pandas?</li>
<li>Why is it better to use column arithmetic than a loop?</li>
<li>How would you find the percentage of rows that meet a condition?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A derived column is a new column computed from existing ones, such as revenue = quantity times unit price. In Pandas I assign to a new column name, for example <code>df["line_total"] = df["quantity"] * df["unit_price"]</code>. I give it a clear name, because assigning to an existing name would silently overwrite that column.</p>
<p><b>2.</b> Column arithmetic expresses the calculation in one readable line, and Pandas applies it to every row at once, which is much faster than a Python loop on large tables. It also leaves less room for mistakes, and the formula doubles as documentation of the definition.</p>
<p><b>3.</b> I write the condition as a comparison, which gives a True/False column, and take its <code>.mean()</code>, since True counts as 1 and False as 0. Multiplying by 100 gives the percentage. <code>.sum()</code> would give the count instead.</p>
</details>
<p><b>Coming next, in lesson 4.2:</b> filtering. The CEO’s question was “which category earns the most money?”, but a sharp finance director will ask: <i>“Do cancelled orders count? And refunded payments?”</i> A number without a definition is a rumour. You will learn to keep only the rows that belong in the question, using <code>&amp;</code>, <code>|</code> and <code>~</code>, and you will see that “revenue” can honestly mean four different amounts.</p>`
    }
  ]
},
{
  id: 'py-4-2',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: '',
  title: '4.2 Filtering rows: keep only what answers the question',
  tables: [],
  intro: `You send the CEO a first number for revenue, and the finance director replies within minutes: <i>“Does that include the cancelled orders? And the refunded payments?”</i> The Head of Data nods. <i>“A number without a definition is a rumour,”</i> he says.<br><br>She is right. Behind the single word “revenue” hide several different amounts, depending on <b>which rows you decide to include</b>. Choosing the rows is called <b>filtering</b>, and it is step two of the CEO’s question.<br><br>In this lesson you will learn the two-step recipe behind every filter, how to combine conditions with <code>&amp;</code>, <code>|</code> and <code>~</code>, and how to avoid the one error that every analyst hits at least once. Then you will use filters to show the finance director that “revenue” has four honest answers, and why she needs to choose one.`,
  steps: [
    {
      type: 'explain',
      title: 'A filter is a question plus a keep',
      body: `<p>Every filter in Pandas has two steps, and once you see them you will never forget them:</p>
<ol>
<li><b>Ask a question about every row.</b> “Is the status Completed?” The answer is a column of True and False, one per row. Analysts call this column a <b>mask</b>, because it works like a stencil: it lets some rows through and blocks the others.</li>
<li><b>Keep the rows where the answer is True</b> by putting the mask inside square brackets: <code>table[mask]</code>.</li>
</ol>
<p>In one line it looks like this: <code>orders[orders["order_status"] == "Completed"]</code>. Read it from the inside out: the inner part is the question, the outer brackets do the keeping.</p>
<div class="callout analogy"><b>It is the filter button in a spreadsheet.</b> When you click a column header and tick “Completed”, the spreadsheet hides every other row. Pandas does the same, except that it builds a <i>new table</i> of the rows you kept, and you can count, add up or analyse it straight away.</div>
<p>If you know SQL, the mask is your <code>WHERE</code> clause. Let’s see it on five orders.</p>`
    },
    {
      type: 'try',
      title: 'A mask and a filter on five orders',
      body: `<p>The mask is printed first: <code>[True, False, True, False, False]</code>. Rows 0 and 2 are Completed, and the other three are not. Then <code>table[mask]</code> keeps exactly those two rows: orders 1 and 3.</p>
<p>Look at the row labels in the result: <b>0 and 2</b>. A filter keeps the original labels of the rows it lets through, so you can always tell which rows of the original table they came from. The labels are not renumbered.</p>`,
      code: `import pandas as pd

small = pd.DataFrame({
    "order_id": [1, 2, 3, 4, 5],
    "status": ["Completed", "Cancelled", "Completed", "Returned", "Processing"]
})

mask = small["status"] == "Completed"
print(mask.tolist())

print(small[mask])`
    },
    {
      type: 'explain',
      title: 'The questions you can ask',
      body: `<p>The question inside a filter can take several shapes. Here are the ones you will use most:</p>
<table class="mini">
<tr><th>Question</th><th>How to write it</th></tr>
<tr><td>Equal to</td><td><code>table["col"] == "Completed"</code></td></tr>
<tr><td>Not equal to</td><td><code>table["col"] != "Completed"</code></td></tr>
<tr><td>Greater, smaller</td><td><code>&gt;</code>, <code>&gt;=</code>, <code>&lt;</code>, <code>&lt;=</code></td></tr>
<tr><td>One of several values</td><td><code>table["col"].isin(["Nigeria", "Ghana"])</code></td></tr>
<tr><td>Inside a range</td><td><code>table["col"].between(100, 200)</code></td></tr>
<tr><td>Text contains something</td><td><code>table["col"].str.contains("gmail", na=False)</code></td></tr>
<tr><td>Is missing</td><td><code>table["col"].isnull()</code></td></tr>
</table>
<div class="callout watch"><b>Two equals signs, not one.</b> A single <code>=</code> means “store this in a jar”. Two, <code>==</code>, means “is it equal to?”. Mixing them up is the classic beginner mistake. Remember: the question uses two.</div>
<p>You have already met most of these in lessons 3.1, 3.4 and 3.5. What is new is using them <i>inside square brackets</i> to keep rows. Let’s try it on the real tables.</p>`
    },
    {
      type: 'try',
      title: 'Cancelled orders and paid payments',
      body: `<p>The first number, <b>529</b>, is how many orders were cancelled. We get it by filtering and then asking for the length of the result with <code>len(...)</code>. The table shows the first three cancelled orders: orders 2, 10 and 27.</p>
<p>The last line filters the payments table for the status “Paid” and counts <b>8461</b> rows. In SQL you would write <code>WHERE payment_status = 'Paid'</code>. Here the same idea sits inside the square brackets.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")
payments = pd.read_csv("payments.csv")

cancelled = orders[orders["order_status"] == "Cancelled"]

print(len(cancelled))
print(cancelled.head(3))

paid = payments[payments["payment_status"] == "Paid"]
print(len(paid))`
    },
    {
      id: 'py-4-2-ex1',
      type: 'exercise',
      title: 'Your turn: count the refunded payments',
      body: `<p>Load <code>payments.csv</code> and print how many payments have the status <code>"Refunded"</code>. You should see <code>512</code>.</p>
<p><b>Think before you type:</b> the question is <code>payments["payment_status"] == "Refunded"</code>. Put it inside square brackets to keep those rows, then take the length with <code>len(...)</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `payments[payments["payment_status"] == "Refunded"] keeps the refunded rows. Wrap it in len(...) and print it.`,
        `import pandas as pd\npayments = pd.read_csv("payments.csv")\nrefunded = payments[payments["payment_status"] == "Refunded"]\nprint(len(refunded))`
      ],
      solution: `import pandas as pd\npayments = pd.read_csv("payments.csv")\nrefunded = payments[payments["payment_status"] == "Refunded"]\nprint(len(refunded))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Combining questions with &, | and ~',
      body: `<p>Real questions have more than one condition: “Cancelled <i>and</i> placed in 2024”, “Cancelled <i>or</i> Returned”, “<i>not</i> Completed”. Pandas has three symbols for these:</p>
<table class="mini">
<tr><th>Meaning</th><th>Symbol</th><th>Example</th></tr>
<tr><td><b>and</b> (both must be true)</td><td><code>&amp;</code></td><td><code>(a == 1) &amp; (b == 2)</code></td></tr>
<tr><td><b>or</b> (at least one is true)</td><td><code>|</code></td><td><code>(a == 1) | (b == 2)</code></td></tr>
<tr><td><b>not</b> (flip True and False)</td><td><code>~</code></td><td><code>~(a == 1)</code></td></tr>
</table>
<p>Two rules, and both matter:</p>
<ul>
<li><b>Put every condition in its own brackets.</b> Without them, Python reads the symbols in the wrong order and fails.</li>
<li><b>Never use the words <code>and</code> and <code>or</code>.</b> They look natural, but they only work on a single True or False, and a column is thousands of them. Python stops with an error that says the truth value of a Series is “ambiguous”. It is Python’s way of saying: “you gave me a whole column, and I do not know whether to answer yes or no.”</li>
</ul>
<p>You met <code>~</code> in lesson 3.5 as “flip”. Now it is part of your everyday toolkit.</p>`
    },
    {
      type: 'try',
      title: 'The famous error, and the right way',
      body: `<p>The first block shows the error on purpose, wrapped in <code>try</code> and <code>except</code>. Using the word <code>and</code> between two conditions fails with: <code>The truth value of a Series is ambiguous...</code>. If you ever see that message, you have used <code>and</code>, <code>or</code> or <code>not</code> on a column. Replace them with <code>&amp;</code>, <code>|</code> and <code>~</code>.</p>
<p>Then the three correct versions. Cancelled <b>and</b> in 2024 gives <b>147</b> orders. Cancelled <b>or</b> Returned gives <b>1034</b>. <b>Not</b> Completed gives <b>2588</b>. Each condition has its own brackets.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")
orders["order_year"] = pd.to_datetime(orders["order_date"]).dt.year

try:
    orders[(orders["order_status"] == "Cancelled") and (orders["order_year"] == 2024)]
except ValueError as error:
    print("Error:", error)

both = orders[(orders["order_status"] == "Cancelled") & (orders["order_year"] == 2024)]
either = orders[(orders["order_status"] == "Cancelled") | (orders["order_status"] == "Returned")]
not_done = orders[~(orders["order_status"] == "Completed")]

print(len(both), len(either), len(not_done))`
    },
    {
      id: 'py-4-2-c1',
      type: 'check',
      title: 'Which line correctly keeps the payments that are Paid and made by Card?',
      body: `<p>Look for brackets around each condition and the right symbol.</p>`,
      options: [
        'payments[payments["payment_status"] == "Paid" & payments["payment_method"] == "Card"]',
        'payments[(payments["payment_status"] == "Paid") & (payments["payment_method"] == "Card")]',
        'payments[(payments["payment_status"] == "Paid") and (payments["payment_method"] == "Card")]',
        'payments[payments["payment_status"] == "Paid", payments["payment_method"] == "Card"]'
      ],
      answer: 1,
      why: [
        'The brackets are missing. Python reads the &amp; first, mixing up the conditions, and the line fails.',
        'Yes! Each condition sits in its own brackets, and &amp; means both must be true.',
        'The word and does not work on columns. It gives the “truth value of a Series is ambiguous” error.',
        'A comma inside the square brackets is not how you combine conditions. Use &amp; between bracketed conditions.'
      ]
    },
    {
      id: 'py-4-2-ex2',
      type: 'exercise',
      title: 'Your turn: large Mobile Money payments that were paid',
      body: `<p>Load <code>payments.csv</code>. Keep the payments where <b>all three</b> are true: the status is <code>"Paid"</code>, the method is <code>"Mobile Money"</code>, and the <code>amount</code> is <b>above 200000</b>. Print how many there are. You should see <code>615</code>.</p>
<p><b>Think before you type:</b> three conditions, each in its own brackets, joined with <code>&amp;</code>. Then <code>len(...)</code> of the result.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `payments[(status == "Paid") & (method == "Mobile Money") & (amount > 200000)], with payments["column"] in each condition. Take len() of the result.`,
        `import pandas as pd\npayments = pd.read_csv("payments.csv")\nrows = payments[(payments["payment_status"] == "Paid") & (payments["payment_method"] == "Mobile Money") & (payments["amount"] > 200000)]\nprint(len(rows))`
      ],
      solution: `import pandas as pd\npayments = pd.read_csv("payments.csv")\nrows = payments[(payments["payment_status"] == "Paid") & (payments["payment_method"] == "Mobile Money") & (payments["amount"] > 200000)]\nprint(len(rows))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Filter first, then add up: four meanings of “revenue”',
      body: `<p>Filtering becomes powerful when you follow it with a calculation. The pattern is: <b>filter the rows, pick the column, then sum or count</b>. For example: <code>payments[payments["payment_status"] == "Paid"]["amount"].sum()</code>.</p>
<p>Now return to the finance director’s question. The payments table has a status for every payment, and each status tells a different story:</p>
<ul>
<li><b>Paid</b>: the money arrived.</li>
<li><b>Pending</b>: billed, not yet received.</li>
<li><b>Refunded</b>: the money arrived and was given back.</li>
<li><b>Failed</b>: the payment attempt did not work.</li>
</ul>
<p>So “revenue” could mean the total <b>billed</b> (everything), the total <b>collected</b> (only Paid), or a total that leaves out refunds. None of these is wrong. They answer different questions, and your job is to be clear about which one you are reporting.</p>
<p>To see all four statuses together, we can use a loop from Module 1: for each status, filter, count, and add up. (In lesson 4.4 you will learn a one-line replacement called <code>groupby</code>.)</p>`
    },
    {
      type: 'try',
      title: 'The money behind each payment status',
      body: `<p>The loop prints one line per status: its name, the number of payments, and their total.</p>
<ul>
<li><b>Paid:</b> 8461 payments, 1341394728.95</li>
<li><b>Pending:</b> 604 payments, 94669524.58</li>
<li><b>Refunded:</b> 512 payments, 79647540.01</li>
<li><b>Failed:</b> 423 payments, 66269656.96</li>
</ul>
<p>Add the four totals and you get 1581981450.5, the billed total from lesson 3.3. So “revenue” can honestly be <b>1.58 billion</b> (billed), or <b>1.34 billion</b> (collected). That gap of about 240 million is not an error. It is the difference between two definitions, and the finance director needs to pick one.</p>`,
      code: `import pandas as pd

payments = pd.read_csv("payments.csv")

for status in ["Paid", "Pending", "Refunded", "Failed"]:
    rows = payments[payments["payment_status"] == status]
    print(status, len(rows), round(rows["amount"].sum(), 2))

print("All payments:", round(payments["amount"].sum(), 2))`
    },
    {
      id: 'py-4-2-c2',
      type: 'check',
      title: 'The CEO asks: “What was our revenue?” What is the best answer?',
      body: `<p>You have four honest totals and they range from about 1.34 billion to 1.58 billion.</p>`,
      options: [
        'Give the biggest number, because it sounds best',
        'Pick any one of the numbers and do not mention the others',
        'State the number together with its definition, for example “1.34 billion collected (status Paid)”, and offer the other definitions if she needs them',
        'Say that revenue cannot be calculated'
      ],
      answer: 2,
      why: [
        'Choosing a number because it looks good is how reports lose trust. Report what the question needs.',
        'Hiding the definition leaves her unable to compare your number with anyone else’s. Two people can then both be “right” and still disagree.',
        'Exactly. A number plus its definition is a fact. A number alone is a rumour. Offering the other versions shows that you understand the data.',
        'It can be calculated, in several honest ways. The skill is saying which one you used.'
      ]
    },
    {
      id: 'py-4-2-ex3',
      type: 'exercise',
      title: 'Your turn: money collected',
      body: `<p>Load <code>payments.csv</code>. Keep only the payments whose status is <code>"Paid"</code>, and print the <b>total of their amounts</b>, rounded to 2 decimals. You should see <code>1341394728.95</code>.</p>
<p><b>Think before you type:</b> filter first, then pick the <code>"amount"</code> column, then <code>.sum()</code>, then <code>round(..., 2)</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `paid = payments[payments["payment_status"] == "Paid"]. Then round(paid["amount"].sum(), 2).`,
        `import pandas as pd\npayments = pd.read_csv("payments.csv")\npaid = payments[payments["payment_status"] == "Paid"]\nprint(round(paid["amount"].sum(), 2))`
      ],
      solution: `import pandas as pd\npayments = pd.read_csv("payments.csv")\npaid = payments[payments["payment_status"] == "Paid"]\nprint(round(paid["amount"].sum(), 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Shares, lists and picking columns while filtering',
      body: `<p>Three handy extras that you will use every week.</p>
<p><b>The share of rows that pass a test.</b> A mask is a True/False column, so its <code>.mean()</code> is the share of Trues, as you learned in lesson 4.1. <code>(orders["order_status"] == "Completed").mean()</code> gives the fraction of orders that are Completed, with no filter needed.</p>
<p><b>Filtering by a list.</b> <code>table["country"].isin(["Nigeria", "Ghana"])</code> is far shorter than two conditions joined by <code>|</code>.</p>
<p><b>Filtering rows and choosing columns in one step.</b> Lesson 2.3 introduced <code>.loc</code>. It takes the rows first and the columns second: <code>table.loc[mask, ["col_a", "col_b"]]</code>. It keeps the rows where the mask is True <i>and</i> returns only the columns you list.</p>
<p>One more important fact: <b>a filter never changes the original table.</b> <code>done = orders[orders["order_status"] == "Completed"]</code> builds a <i>new</i> table in the jar <code>done</code>. The table <code>orders</code> still has all its rows.</p>`
    },
    {
      type: 'try',
      title: 'Share, list and loc together',
      body: `<p>The share of Completed orders is <b>74.12</b> percent: about three orders in four. Next, the customers in Nigeria or Ghana, found with a list: <b>791</b>.</p>
<p>Then <code>.loc</code> in action: the payments that are Paid <i>and</i> above 500000 number <b>119</b>, and we keep just two columns, <code>payment_id</code> and <code>amount</code>. The top three rows are payments 8, 26 and 283. Finally, the last line proves the point about originals: the orders table still has <b>10000</b> rows after all that filtering.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")
payments = pd.read_csv("payments.csv")
customers = pd.read_csv("customers.csv")

print(round((orders["order_status"] == "Completed").mean() * 100, 2))

print(len(customers[customers["country"].isin(["Nigeria", "Ghana"])]))

big_paid = payments.loc[(payments["payment_status"] == "Paid") & (payments["amount"] > 500000), ["payment_id", "amount"]]
print(len(big_paid))
print(big_paid.head(3))

done = orders[orders["order_status"] == "Completed"]
print(len(orders))`
    },
    {
      id: 'py-4-2-ex4',
      type: 'exercise',
      title: 'Your turn: the share of orders that are not Completed',
      body: `<p>Load <code>orders.csv</code>. Print the <b>percentage of orders that are not Completed</b>, rounded to 2 decimals. Use the <code>~</code> sign. You should see <code>25.88</code>.</p>
<p><b>Think before you type:</b> build the mask <code>orders["order_status"] == "Completed"</code>, flip it with <code>~</code> (in brackets), take its <code>.mean()</code>, multiply by 100 and round.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `~(orders["order_status"] == "Completed") is True for orders that are not Completed. Take .mean(), multiply by 100, and round to 2 decimals.`,
        `import pandas as pd\norders = pd.read_csv("orders.csv")\nnot_done = ~(orders["order_status"] == "Completed")\nprint(round(not_done.mean() * 100, 2))`
      ],
      solution: `import pandas as pd\norders = pd.read_csv("orders.csv")\nnot_done = ~(orders["order_status"] == "Completed")\nprint(round(not_done.mean() * 100, 2))`,
      ordered: true
    },
    {
      id: 'py-4-2-ex5',
      type: 'exercise',
      title: 'Challenge: delayed or failed deliveries in 2025',
      body: `<p>The operations director wants to know how many deliveries went wrong in 2025. Load <code>deliveries.csv</code>. Count the deliveries whose <code>delivery_status</code> is <b>Delayed or Failed</b> and whose <code>dispatch_date</code> falls in the year <b>2025</b>. You should see <code>264</code>.</p>
<p><b>Think before you type:</b> convert <code>dispatch_date</code> with <code>pd.to_datetime</code> and take <code>.dt.year</code>. Use <code>.isin(["Delayed", "Failed"])</code> for the status. Join the two conditions with <code>&amp;</code>, each in its own brackets, and take the <code>len</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `year = pd.to_datetime(deliveries["dispatch_date"]).dt.year. Then deliveries[(deliveries["delivery_status"].isin(["Delayed", "Failed"])) & (year == 2025)].`,
        `import pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\nyear = pd.to_datetime(deliveries["dispatch_date"]).dt.year\nrows = deliveries[(deliveries["delivery_status"].isin(["Delayed", "Failed"])) & (year == 2025)]\nprint(len(rows))`
      ],
      solution: `import pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\nyear = pd.to_datetime(deliveries["dispatch_date"]).dt.year\nrows = deliveries[(deliveries["delivery_status"].isin(["Delayed", "Failed"])) & (year == 2025)]\nprint(len(rows))`,
      ordered: true
    },
    {
      id: 'py-4-2-c3',
      type: 'check',
      title: 'You run done = orders[orders["order_status"] == "Completed"]. How many rows does the table orders still have?',
      body: `<p>Think about whether a filter changes the table it starts from.</p>`,
      options: [
        'Only the Completed rows: 7412',
        'All of its rows: 10000, because the filter built a new table called done',
        'None: the filter deletes the table',
        'It depends on whether you used .loc'
      ],
      answer: 1,
      why: [
        'The filtered rows went into the new jar done. The original jar was not touched.',
        'Right! A filter creates a new table and leaves the original alone. That is what makes it safe to try as many filters as you like.',
        'Filtering never deletes anything. It builds a new table.',
        'Both ways of filtering build a new table. Neither changes the original.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You have taken step two of the CEO’s question, and you have learned that a number without a definition is a rumour. You can:</p>
<ul>
<li>Filter with the two-step recipe: build a <b>mask</b> with a question, then keep the rows with <code>table[mask]</code></li>
<li>Ask questions with <code>==</code>, <code>!=</code>, comparisons, <code>.isin()</code>, <code>.between()</code>, <code>.str.contains()</code> and <code>.isnull()</code></li>
<li>Combine conditions with <code>&amp;</code>, <code>|</code> and <code>~</code>, each condition in its own brackets, and recognise the “truth value is ambiguous” error</li>
<li>Filter first and then add up or count, and see that “revenue” has several honest meanings</li>
<li>Use <code>.mean()</code> on a mask for a share, and <code>.loc</code> to filter rows and choose columns together</li>
<li>Rely on the fact that a filter builds a new table and never changes the original</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>How do you filter a DataFrame on two conditions?</li>
<li>Why does using <code>and</code> between two column conditions fail?</li>
<li>If a stakeholder asks for “revenue”, what do you do?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I write each condition as a comparison, wrap each one in its own brackets, and join them with <code>&amp;</code> for and, or <code>|</code> for or. I put the combined expression inside square brackets on the DataFrame, for example <code>df[(df["a"] == 1) &amp; (df["b"] &gt; 5)]</code>.</p>
<p><b>2.</b> Python’s <code>and</code> expects a single True or False, but a column comparison gives a whole Series of them, so Pandas raises an error that the truth value of a Series is ambiguous. The element-wise operators <code>&amp;</code>, <code>|</code> and <code>~</code> work row by row and are the right tools.</p>
<p><b>3.</b> I ask which definition they mean, for example billed, collected or net of refunds, and which rows should count, such as whether cancelled orders are included. I report the number together with its definition, and I can show the alternatives, because an undefined number invites two people to be right and still disagree.</p>
</details>
<p><b>Coming next, in lesson 4.3:</b> sorting. The CEO will not want a list of 25,000 lines. She wants the top ten, the best and the worst. You will learn <code>sort_values</code> to put rows in order, <code>head</code> to keep the top of the list, and <code>nlargest</code> as a shortcut, and you will find the biggest orders and the most expensive products.</p>`
    }
  ]
}
);
