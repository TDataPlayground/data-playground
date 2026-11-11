LESSONS.push(
{
  id: 'py-4-3',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: '',
  title: '4.3 Sorting: the top ten, the bottom ten and everything in between',
  tables: [],
  intro: `The CEO replies to your revenue definition with a new request: <i>“Good. Now show me the top ten. The biggest orders, the most expensive products, the largest payments. And the bottom of the list too, I want to know what is running out.”</i><br><br>Nobody wants to read 25,000 rows. People want the extremes: the best, the worst, the first, the last. To produce them you need to put rows <b>in order</b>, and that is what sorting does. It is step three of the CEO’s question.<br><br>Sorting looks simple, and it is, but it hides three details that catch beginners out: what happens when two rows <b>tie</b>, where <b>missing values</b> go, and what happens to the <b>row labels</b>. You will meet all three in this lesson, and by the end you will be able to produce a reliable top-N list from any table.`,
  steps: [
    {
      type: 'explain',
      title: 'sort_values: put the rows in order',
      body: `<p>The tool is <code>table.sort_values("column")</code>. It puts the rows in order of the column you name, smallest first by default. Add <code>ascending=False</code> to put the biggest first.</p>
<table class="mini">
<tr><th>Pandas</th><th>SQL</th><th>In a spreadsheet</th></tr>
<tr><td><code>table.sort_values("price")</code></td><td><code>ORDER BY price</code></td><td>Sort A to Z</td></tr>
<tr><td><code>table.sort_values("price", ascending=False)</code></td><td><code>ORDER BY price DESC</code></td><td>Sort Z to A</td></tr>
</table>
<p>Three facts to hold on to:</p>
<ul>
<li><b>Like every Pandas tool so far, it returns a new table.</b> The original keeps its old order. To keep the sorted version, store it in a jar.</li>
<li><b>Whole rows move together.</b> The prices do not move away from their product names. Every row travels as a unit.</li>
<li><b>Row labels travel with the rows.</b> The label on the left of each row stays attached to it, so after sorting the labels will no longer run 0, 1, 2. That is useful: you can always see where a row came from.</li>
</ul>
<p>Let’s see all three on five products you can check by eye.</p>`
    },
    {
      type: 'try',
      title: 'Five products, sorted two ways',
      body: `<p>The first table is sorted by price, smallest first: Mug (800), Lamp (4500), Radio (6200), Fan (9500), Kettle (12000). The second is the same table, biggest first.</p>
<p>Look at the labels on the left of the first table: <b>2, 0, 4, 3, 1</b>. The Mug was originally row 2, so it keeps its label 2 even though it now sits at the top. The prices stayed attached to their products. Only the order changed.</p>`,
      code: `import pandas as pd

shelf = pd.DataFrame({
    "product": ["Lamp", "Kettle", "Mug", "Fan", "Radio"],
    "price": [4500, 12000, 800, 9500, 6200]
})

print(shelf.sort_values("price"))
print(shelf.sort_values("price", ascending=False))`
    },
    {
      type: 'explain',
      title: 'Top-N lists: sort, then take the first few',
      body: `<p>A top-N list is a two-step recipe you already know: <b>sort</b> so the best rows come first, then keep only the first N rows with <code>.head(N)</code>.</p>
<p><code>products.sort_values("unit_price", ascending=False).head(5)</code> is the five most expensive products.</p>
<p>Because top-N lists are so common, Pandas has two shortcuts that do both steps at once:</p>
<ul>
<li><code>table.nlargest(5, "unit_price")</code>: the 5 rows with the <b>largest</b> values</li>
<li><code>table.nsmallest(5, "unit_price")</code>: the 5 rows with the <b>smallest</b> values</li>
</ul>
<p>They give the same answer as sort plus head, in one short line that says exactly what you mean. Use <code>nlargest</code> and <code>nsmallest</code> when you want the top or bottom of a single number column. Use <code>sort_values</code> when you want to sort by several columns, or sort text.</p>
<p>Let’s answer the CEO’s first request on the real product table.</p>`
    },
    {
      type: 'try',
      title: 'Most expensive, cheapest, and running out',
      body: `<p>The first table is the five most expensive products. Every one of them is in the Electronics category: Power Bank 10000mAh (84081.85), Smart Plug, Rechargeable Batteries Pack, HDMI Cable (V2) and Phone Tripod Stand.</p>
<p>The second table is the three cheapest: Desk Organizer (577.07), Novel - Fiction (612.96) and Diary (682.08), found with <code>nsmallest</code>. The third answers the CEO’s question about what is running out: the three products with the least stock are Cutlery Set (V2) with only <b>5</b> units, Ring Light with 12 and Jogger Pants with 16.</p>
<p>Notice how we show only some columns with double brackets at the end. A top-N list is easier to read when it carries only the columns the reader needs.</p>`,
      code: `import pandas as pd

products = pd.read_csv("products.csv")

top5 = products.sort_values("unit_price", ascending=False).head(5)
print(top5[["product_name", "category", "unit_price"]])

cheapest = products.nsmallest(3, "unit_price")
print(cheapest[["product_name", "unit_price"]])

low_stock = products.nsmallest(3, "stock_quantity")
print(low_stock[["product_name", "stock_quantity"]])`
    },
    {
      id: 'py-4-3-ex1',
      type: 'exercise',
      title: 'Your turn: the most expensive product',
      body: `<p>Load <code>products.csv</code> and print the <b>name</b> of the product with the highest <code>unit_price</code>. You should see <code>Power Bank 10000mAh</code>.</p>
<p><b>Think before you type:</b> <code>nlargest(1, "unit_price")</code> gives a table with one row. Pick the <code>"product_name"</code> column from it, then take the first value with <code>.iloc[0]</code>, which you met in lesson 2.3.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `products.nlargest(1, "unit_price") is a one-row table. Take ["product_name"] from it and then .iloc[0] to get the text itself.`,
        `import pandas as pd\nproducts = pd.read_csv("products.csv")\nprint(products.nlargest(1, "unit_price")["product_name"].iloc[0])`
      ],
      solution: `import pandas as pd\nproducts = pd.read_csv("products.csv")\nprint(products.nlargest(1, "unit_price")["product_name"].iloc[0])`,
      ordered: true
    },
    {
      id: 'py-4-3-ex2',
      type: 'exercise',
      title: 'Your turn: the three products closest to selling out',
      body: `<p>Load <code>products.csv</code> and print the <b>names</b> of the three products with the smallest <code>stock_quantity</code>, as a list. You should see <code>['Cutlery Set (V2)', 'Ring Light', 'Jogger Pants']</code>.</p>
<p><b>Think before you type:</b> <code>nsmallest(3, "stock_quantity")</code> gives the three rows. Pick the <code>"product_name"</code> column and finish with <code>.tolist()</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `products.nsmallest(3, "stock_quantity") keeps the three rows with the least stock. Add ["product_name"].tolist() and print it.`,
        `import pandas as pd\nproducts = pd.read_csv("products.csv")\nprint(products.nsmallest(3, "stock_quantity")["product_name"].tolist())`
      ],
      solution: `import pandas as pd\nproducts = pd.read_csv("products.csv")\nprint(products.nsmallest(3, "stock_quantity")["product_name"].tolist())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Ties, and sorting by more than one column',
      body: `<p>What happens when two rows have the <b>same</b> value in the sort column? That is a <b>tie</b>, and it matters more than you would expect. If you sort by price and three products cost exactly 500, which one comes first? Pandas does not promise an order for ties. Two runs, or two different tools, can show them in a different order. For a report that people will compare from one day to the next, that is a problem.</p>
<p>The fix is to give the sort a <b>tiebreaker</b>: a second column that decides between tied rows. Pass a <b>list</b> of columns: <code>sort_values(["line_total", "order_item_id"])</code>. Pandas sorts by the first column, and only looks at the second when the first is tied.</p>
<p>To sort each column in its own direction, pass a list for <code>ascending</code> too: <code>sort_values(["country", "customer_name"], ascending=[True, False])</code> means country A to Z, and within each country, names Z to A.</p>
<div class="callout work"><b>At work:</b> a top-N list with a tiebreaker is a <b>reproducible</b> list. When a manager asks “why is this order missing from the list I saw yesterday?”, you want the answer to be “the data changed”, never “the sort shuffled the ties”.</div>
<p>Let’s see a real tie. It is bigger than you might think.</p>`
    },
    {
      type: 'try',
      title: 'Thirty-one lines tie for first place',
      body: `<p>The first number is <b>31</b>: thirty-one order lines share the biggest line total in the whole table, <b>420409.25</b>. The reason is clear in the table: every one of them is product 5 (the Power Bank, at 84081.85) with quantity 5, and the biggest possible quantity times the most expensive product always gives the same number.</p>
<p>With 31 rows tied, “the top ten lines” has no single correct answer. So we added a tiebreaker, <code>order_item_id</code> ascending, and the top three are always lines 1162, 2076 and 2770. Anyone who runs this gets the same list.</p>
<p>The last table sorts customers by country and then by name, so inside each country they appear A to Z. The first four are all in Ghana: Aaron Miller, Adam Mccoy, Adam Wong and Alexandria Holmes.</p>`,
      code: `import pandas as pd

order_items = pd.read_csv("order_items.csv")
order_items["line_total"] = order_items["quantity"] * order_items["unit_price"]

print((order_items["line_total"] == order_items["line_total"].max()).sum())

top = order_items.sort_values(["line_total", "order_item_id"], ascending=[False, True]).head(3)
print(top[["order_item_id", "product_id", "quantity", "line_total"]])

customers = pd.read_csv("customers.csv")
by_name = customers.sort_values(["country", "customer_name"]).head(4)
print(by_name[["customer_id", "customer_name", "country"]])`
    },
    {
      id: 'py-4-3-c1',
      type: 'check',
      title: 'You ask for the top 10 order lines by line_total and all ten rows show exactly 420409.25. Is something wrong?',
      body: `<p>Think about the 31 tied lines.</p>`,
      options: [
        'Yes: the sort is broken, because the values should all be different',
        'No: 31 lines tie for the maximum, so the top ten are all tied. A tiebreaker column makes the list reproducible',
        'Yes: the data must contain duplicates, which should be deleted',
        'No: but nlargest would give ten different values'
      ],
      answer: 1,
      why: [
        'Nothing is broken. Many different rows can legitimately share the same value, and a sort simply puts them side by side.',
        'Right! The maximum possible line total is reached by 31 different lines. For a stable, repeatable list, add a second sort column such as order_item_id.',
        'These are different order lines (different order numbers). We saw in lesson 3.3 that repeated values are not the same as duplicates. They are real, separate purchases.',
        'nlargest also returns tied rows. It cannot invent different values that do not exist in the data.'
      ]
    },
    {
      id: 'py-4-3-ex3',
      type: 'exercise',
      title: 'Your turn: the largest payment that was actually paid',
      body: `<p>Load <code>payments.csv</code>. Keep only the payments with status <code>"Paid"</code>, then print the <code>payment_id</code> of the one with the <b>largest amount</b>. You should see <code>622</code>.</p>
<p><b>Think before you type:</b> two steps you already know: filter with <code>payments[payments["payment_status"] == "Paid"]</code>, then <code>nlargest(1, "amount")</code>. Pick <code>"payment_id"</code> and take <code>.iloc[0]</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `paid = payments[payments["payment_status"] == "Paid"]. Then paid.nlargest(1, "amount")["payment_id"].iloc[0].`,
        `import pandas as pd\npayments = pd.read_csv("payments.csv")\npaid = payments[payments["payment_status"] == "Paid"]\nprint(paid.nlargest(1, "amount")["payment_id"].iloc[0])`
      ],
      solution: `import pandas as pd\npayments = pd.read_csv("payments.csv")\npaid = payments[payments["payment_status"] == "Paid"]\nprint(paid.nlargest(1, "amount")["payment_id"].iloc[0])`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Missing values, row labels and finding the winning row',
      body: `<p>Three more details, each of which will save you a confusing afternoon.</p>
<p><b>Where do missing values go?</b> When you sort a column that contains missing values, Pandas puts them <b>last</b>, whichever direction you sort. That is usually what you want. If you need them first, add <code>na_position="first"</code>.</p>
<p><b>The labels are no longer 0, 1, 2.</b> After sorting or filtering, the left-hand labels follow their rows. For a clean, numbered top-N table, add <code>.reset_index(drop=True)</code>: it renumbers from 0, and <code>drop=True</code> throws away the old labels instead of keeping them as a new column.</p>
<p><b>Finding the row with the biggest value.</b> <code>.max()</code> gives the biggest value, but often you want to know <i>which row</i> holds it. <code>.idxmax()</code> returns the label of that row, and <code>.idxmin()</code> the label of the smallest. Then <code>.loc[label, "column"]</code> reads any other column from that row.</p>`
    },
    {
      type: 'try',
      title: 'Missing dates go last, labels reset, and the winning row',
      body: `<p>First, the deliveries sorted by <code>delivery_date</code> from newest to oldest. The first two dates are both <b>2026-07-12</b>, the latest arrival in the table. Then the proof about missing values: the last 1,239 rows are <b>all</b> missing dates (True), and none of the first 1,239 are missing (False). The missing dates went to the bottom, even though we sorted newest first. With <code>na_position="first"</code> they all come to the top instead (True).</p>
<p>Then labels. The top three products by price keep their old labels, <b>[4, 19, 17]</b>. After <code>reset_index(drop=True)</code> they are <b>[0, 1, 2]</b>.</p>
<p>The last line finds the product with the most money tied up in stock. <code>idxmax()</code> returns row <b>14</b>, and <code>.loc</code> reads its name: <b>Phone Tripod Stand</b>.</p>`,
      code: `import pandas as pd

deliveries = pd.read_csv("deliveries.csv")
newest = deliveries.sort_values("delivery_date", ascending=False)

print(newest["delivery_date"].head(2).tolist())
print(newest["delivery_date"].isnull().tail(1239).all())
print(newest["delivery_date"].isnull().head(1239).any())

missing_first = deliveries.sort_values("delivery_date", na_position="first")
print(missing_first["delivery_date"].isnull().head(1239).all())

products = pd.read_csv("products.csv")
ranked = products.sort_values("unit_price", ascending=False).head(3)
print(ranked.index.tolist())
ranked = ranked.reset_index(drop=True)
print(ranked.index.tolist())

products["stock_value"] = products["unit_price"] * products["stock_quantity"]
row = products["stock_value"].idxmax()
print(row, products.loc[row, "product_name"])`
    },
    {
      id: 'py-4-3-c2',
      type: 'check',
      title: 'You sort the deliveries by delivery_date from newest to oldest. Where do the 1,239 rows with a missing date end up?',
      body: `<p>Think about the default behaviour for missing values.</p>`,
      options: [
        'At the top, because missing is “bigger” than any date',
        'At the bottom, because missing values go last by default, whichever way you sort',
        'They are removed by the sort',
        'They are scattered randomly'
      ],
      answer: 1,
      why: [
        'Pandas does not treat missing as bigger or smaller. It simply places missing values at the end unless you ask otherwise.',
        'Right. Missing values go last by default, even when you sort descending. Add na_position="first" to bring them to the top.',
        'A sort never removes rows. All 9,500 deliveries are still there.',
        'Their position is predictable: all together, at the end.'
      ]
    },
    {
      id: 'py-4-3-ex4',
      type: 'exercise',
      title: 'Your turn: sort by country, then by name backwards',
      body: `<p>Load <code>customers.csv</code>. Sort by <code>country</code> from A to Z and, within each country, by <code>customer_name</code> from <b>Z to A</b>. Print the <code>customer_name</code> in the first row. You should see <code>Zachary Stephens</code>.</p>
<p><b>Think before you type:</b> pass two lists to <code>sort_values</code>: the columns <code>["country", "customer_name"]</code> and <code>ascending=[True, False]</code>. Then take <code>["customer_name"].iloc[0]</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `customers.sort_values(["country", "customer_name"], ascending=[True, False]) sorts country A to Z and names Z to A. Then ["customer_name"].iloc[0].`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nsorted_customers = customers.sort_values(["country", "customer_name"], ascending=[True, False])\nprint(sorted_customers["customer_name"].iloc[0])`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nsorted_customers = customers.sort_values(["country", "customer_name"], ascending=[True, False])\nprint(sorted_customers["customer_name"].iloc[0])`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Sorting shows the extremes. It does not describe the whole',
      body: `<p>A top-ten list is exciting, and it is also easy to misread. A list of the ten biggest things tells you about <b>the biggest things</b>. It does not tell you how much of the business they represent.</p>
<p>The way to put a top-N list in context is to compare it with the total. How much of all revenue do the ten biggest lines make up? If it is 40 percent, the business leans on a few giants, and losing one customer would hurt. If it is 0.3 percent, revenue is spread across thousands of ordinary lines and no single line matters much.</p>
<p>That one comparison, <b>top-N total divided by the grand total</b>, is one of the most useful ideas in analysis. It uses only things you already know: <code>nlargest</code>, <code>.sum()</code> and division.</p>`
    },
    {
      type: 'try',
      title: 'How much of the revenue is in the ten biggest lines?',
      body: `<p>The ten biggest lines add up to <b>4204092.5</b>, which is ten times the maximum line total of 420409.25. All ten are tied at the top. Divided by the revenue of all 25,000 lines, they are only <b>0.2657</b> percent.</p>
<p>That is a real insight for the CEO. The biggest lines in the table are worth less than three tenths of one percent of revenue. The business does not depend on a handful of giant lines. It is made of thousands of ordinary ones. To understand those, we will need to <b>group</b> the lines, which is the next lesson.</p>`,
      code: `import pandas as pd

order_items = pd.read_csv("order_items.csv")
order_items["line_total"] = order_items["quantity"] * order_items["unit_price"]

top10 = order_items.nlargest(10, "line_total")

print(round(top10["line_total"].sum(), 2))
print(round(top10["line_total"].sum() / order_items["line_total"].sum() * 100, 4))`
    },
    {
      id: 'py-4-3-ex5',
      type: 'exercise',
      title: 'Challenge: the share of the ten biggest lines',
      body: `<p>Load <code>order_items.csv</code>, create <code>line_total</code>, and print the <b>percentage of total revenue</b> that the 10 largest lines make up, rounded to <b>2 decimals</b>. You should see <code>0.27</code>.</p>
<p><b>Think before you type:</b> take <code>nlargest(10, "line_total")</code> and sum its <code>line_total</code>. Divide by the sum of <i>all</i> line totals, multiply by 100, and round.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `top10 = order_items.nlargest(10, "line_total"). Then top10["line_total"].sum() / order_items["line_total"].sum() * 100, inside round(..., 2).`,
        `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\ntop10 = order_items.nlargest(10, "line_total")\nprint(round(top10["line_total"].sum() / order_items["line_total"].sum() * 100, 2))`
      ],
      solution: `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\ntop10 = order_items.nlargest(10, "line_total")\nprint(round(top10["line_total"].sum() / order_items["line_total"].sum() * 100, 2))`,
      ordered: true
    },
    {
      id: 'py-4-3-c3',
      type: 'check',
      title: 'Which line gives the five cheapest products?',
      body: `<p>Look carefully at the direction of each sort.</p>`,
      options: [
        'products.sort_values("unit_price").head(5)',
        'products.sort_values("unit_price", ascending=False).head(5)',
        'products.nlargest(5, "unit_price")',
        'products.head(5).sort_values("unit_price")'
      ],
      answer: 0,
      why: [
        'Yes! Sorting ascending puts the smallest prices first, and head(5) keeps the first five. products.nsmallest(5, "unit_price") would give the same answer.',
        'This is the opposite: descending puts the biggest prices first, so you get the five most expensive.',
        'nlargest gives the five largest values, the most expensive products.',
        'This takes the first five rows of the original table and only then sorts them. It sorts five random products, not the whole table.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>Step three of the CEO’s question is done: you can produce a reliable ranked list from any table. You can:</p>
<ul>
<li>Sort with <code>sort_values</code>, in either direction, and remember that rows move as units and keep their labels</li>
<li>Build top-N lists with sort plus <code>head</code>, or with <code>nlargest</code> and <code>nsmallest</code></li>
<li>Sort by several columns with a list, and add a <b>tiebreaker</b> so the result is reproducible</li>
<li>Know that missing values go last by default, and use <code>na_position</code> to change that</li>
<li>Renumber with <code>reset_index(drop=True)</code>, and find the winning row with <code>idxmax</code> and <code>idxmin</code></li>
<li>Put a top-N list in context by dividing it by the total</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>How do you find the top 10 rows by a column in Pandas?</li>
<li>What is a tie in a sort, and why does it matter for reports?</li>
<li>You are shown a list of the top 10 customers by revenue. What is the first question you ask?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I use <code>df.nlargest(10, "column")</code>, or <code>df.sort_values("column", ascending=False).head(10)</code>. The first is shorter and says what I mean. I use <code>sort_values</code> when I need several sort columns or a specific tiebreaker.</p>
<p><b>2.</b> A tie is when several rows share the same sort value. Pandas does not guarantee their order, so a top-N list could change between runs even when the data has not. I add a tiebreaker column in the sort, such as an ID, so the result is reproducible.</p>
<p><b>3.</b> I ask how much of the total those ten represent, which is their total divided by the grand total. A top-10 list can look dramatic and still be a tiny share of the business, or it can reveal a risky dependence on a few customers. The context decides what the list means.</p>
</details>
<p><b>Coming next, in lesson 4.4:</b> grouping. You found the ten biggest lines and saw that they are a tiny share of revenue. So where does the revenue come from? From thousands of ordinary lines, spread across 150 products. To see that, you need to <i>add up the lines for each product</i>, one answer per group. The tool is <code>groupby</code>, the most powerful idea in this module, and the one that replaces your loop from lesson 4.2.</p>`
    }
  ]
},
{
  id: 'py-4-4',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: '',
  title: '4.4 Grouping and summarising: one answer per group',
  tables: [],
  intro: `The CEO looks at your top-ten list and asks the question you were hoping she would ask: <i>“If the biggest lines are such a small part of revenue, where does the money actually come from?”</i><br><br>The honest answer is: from thousands of ordinary order lines, spread across 150 products. To see the pattern you need to <b>add up the lines for each product</b>, and do the same for every other group in the business: each payment method, each country, each year. You need <b>one answer per group</b>.<br><br>In lesson 4.2 you did this with a loop: for each payment status, filter, count, add up. It worked, but it was long, and it only handled one grouping at a time. Pandas has a single tool that replaces the whole loop: <code>groupby</code>. It is the most powerful idea in this module, and it is the same idea as <code>GROUP BY</code> in SQL and a pivot table in a spreadsheet. By the end of the lesson you will know which product earns the most money.`,
  steps: [
    {
      type: 'explain',
      title: 'Split, apply, combine',
      body: `<p>Every group-by, in any tool, does the same three things:</p>
<ol>
<li><b>Split</b> the rows into piles, one pile per value of a column. All the Ghana rows in one pile, all the Kenya rows in another.</li>
<li><b>Apply</b> a calculation to each pile: add up an amount, count the rows, find the average.</li>
<li><b>Combine</b> the answers into one small table: one row per pile.</li>
</ol>
<div class="callout analogy"><b>Think of sorting the post.</b> A postman tips a bag of letters on a table and puts each letter into a pigeonhole by town. Then he counts the letters in each hole. Splitting is the sorting, applying is the counting, and combining is the list of counts he writes down at the end. <code>groupby</code> is the postman, and it is fast enough to sort 25,000 letters instantly.</div>
<table class="mini">
<tr><th>Pandas</th><th>SQL</th><th>In a spreadsheet</th></tr>
<tr><td><code>table.groupby("country")["amount"].sum()</code></td><td><code>SELECT country, SUM(amount) … GROUP BY country</code></td><td>Pivot table: country in rows, sum of amount in values</td></tr>
</table>
<p>Let’s watch it work on a table of five sales that you can check in your head.</p>`
    },
    {
      type: 'try',
      title: 'Five sales, grouped by country',
      body: `<p>Three lines of output, one for each calculation. In every case the groups are the countries, Ghana and Kenya.</p>
<ul>
<li><b>Sum:</b> Ghana has three sales (100, 300 and 200), which add up to <b>600</b>. Kenya has two (250 and 50), which add up to <b>300</b>.</li>
<li><b>Mean:</b> the average Ghana sale is 600 divided by 3, which is <b>200</b>. The average Kenya sale is 300 divided by 2, which is <b>150</b>.</li>
<li><b>Size:</b> the number of rows in each group: Ghana <b>3</b>, Kenya <b>2</b>.</li>
</ul>
<p>The answer to each is a column with one row per group, and the group names are the labels on the left.</p>`,
      code: `import pandas as pd

sales = pd.DataFrame({
    "country": ["Ghana", "Kenya", "Ghana", "Kenya", "Ghana"],
    "amount": [100, 250, 300, 50, 200]
})

print(sales.groupby("country")["amount"].sum())
print(sales.groupby("country")["amount"].mean())
print(sales.groupby("country").size())`
    },
    {
      type: 'explain',
      title: 'The anatomy of a group-by line',
      body: `<p>Read <code>table.groupby("country")["amount"].sum()</code> from left to right:</p>
<ol>
<li><code>table.groupby("country")</code>: split into piles by the values in <code>country</code>.</li>
<li><code>["amount"]</code>: of each pile, look only at the <code>amount</code> column.</li>
<li><code>.sum()</code>: apply this calculation to it.</li>
</ol>
<p>The calculations you can put at the end:</p>
<table class="mini">
<tr><th>Calculation</th><th>What it gives for each group</th></tr>
<tr><td><code>.sum()</code></td><td>the total</td></tr>
<tr><td><code>.mean()</code>, <code>.median()</code></td><td>the average, the middle value</td></tr>
<tr><td><code>.min()</code>, <code>.max()</code></td><td>the smallest, the largest</td></tr>
<tr><td><code>.size()</code></td><td>the number of rows (no column needed)</td></tr>
<tr><td><code>.count()</code></td><td>the number of <b>non-missing</b> values in the chosen column</td></tr>
<tr><td><code>.nunique()</code></td><td>the number of different values</td></tr>
</table>
<p>The result is a column whose <b>labels are the group names</b>. That means you can pick one group’s answer with square brackets, <code>result["Ghana"]</code>, and use <code>.idxmax()</code> to ask which group has the biggest answer.</p>
<p>Now the real thing. In lesson 4.2 you needed a four-line loop to total the payments by status. Here it is in one line.</p>`
    },
    {
      type: 'try',
      title: 'The loop from lesson 4.2, in one line',
      body: `<p>The first table is the one you built with a loop in lesson 4.2, now in a single line: <b>Failed</b> 66269656.96, <b>Paid</b> 1341394728.95, <b>Pending</b> 94669524.58 and <b>Refunded</b> 79647540.01. The groups come out in alphabetical order, and the numbers match the loop to the cent.</p>
<p>The second table counts orders by status with <code>.size()</code>: <b>Cancelled</b> 529, <b>Completed</b> 7412, <b>Processing</b> 1554, <b>Returned</b> 505. No column was needed, because <code>size</code> just counts rows.</p>
<p>That is the whole idea. Everything else in this lesson is variations on these two lines.</p>`,
      code: `import pandas as pd

payments = pd.read_csv("payments.csv")
orders = pd.read_csv("orders.csv")

print(payments.groupby("payment_status")["amount"].sum().round(2))

print(orders.groupby("order_status").size())`
    },
    {
      id: 'py-4-4-ex1',
      type: 'exercise',
      title: 'Your turn: customers in Rwanda',
      body: `<p>Load <code>customers.csv</code>. Group the customers by <code>country</code>, count the rows in each group, and print the number for <b>Rwanda</b>. You should see <code>438</code>.</p>
<p><b>Think before you type:</b> <code>customers.groupby("country").size()</code> gives one count per country. Because the labels are the country names, you can pick one with square brackets: <code>["Rwanda"]</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `customers.groupby("country").size() counts the rows in each country. Add ["Rwanda"] at the end to pick one, and print it.`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nprint(customers.groupby("country").size()["Rwanda"])`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nprint(customers.groupby("country").size()["Rwanda"])`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'size versus count: a difference that matters',
      body: `<p>Two tools look alike and are not: <code>.size()</code> and <code>.count()</code>.</p>
<ul>
<li><code>.size()</code> counts <b>every row</b> in each group.</li>
<li><code>.count()</code> counts only the rows where the chosen column is <b>not missing</b>.</li>
</ul>
<p>When the column has no missing values, they agree. When it does have missing values, the difference tells you something. And you know a column with missing values: the delivery date. In lesson 3.1 you proved that the 1,239 deliveries with no arrival date are exactly the ones In Transit or Failed. A group-by can show the same fact without any filtering.</p>`
    },
    {
      type: 'try',
      title: 'Rows in each group versus dates present',
      body: `<p>The first table uses <code>size</code> and counts all 9,500 deliveries by status: <b>Delayed</b> 655, <b>Delivered</b> 7606, <b>Failed</b> 273 and <b>In Transit</b> 966.</p>
<p>The second table uses <code>count</code> on the <code>delivery_date</code> column. Delayed (655) and Delivered (7606) are unchanged, because every one of them has an arrival date. But <b>Failed</b> and <b>In Transit</b> drop to <b>0</b>: not one of them has a date. Add the missing rows, 273 plus 966, and you get the 1,239 from lesson 3.1. Two lines of group-by gave you the same proof that took several steps before.</p>`,
      code: `import pandas as pd

deliveries = pd.read_csv("deliveries.csv")

print(deliveries.groupby("delivery_status").size())

print(deliveries.groupby("delivery_status")["delivery_date"].count())`
    },
    {
      id: 'py-4-4-c1',
      type: 'check',
      title: 'For the status Failed, size gives 273 and count of delivery_date gives 0. What does the difference tell you?',
      body: `<p>Remember what <code>count</code> counts.</p>`,
      options: [
        'Pandas made an error: both should give 273',
        'There are 273 failed deliveries, and none of them has an arrival date, because count only counts values that are present',
        'There are no failed deliveries',
        'Count always gives 0 for text statuses'
      ],
      answer: 1,
      why: [
        'Both are correct. They answer different questions: how many rows, and how many present values.',
        'Exactly. size counts rows (273 failed deliveries). count counts the non-missing dates, and a failed delivery never arrived, so its date is missing.',
        'There are 273 of them. size shows that clearly. It is only the arrival date that is absent.',
        'The count is of the delivery_date column, not of the status. It gives 0 for Failed because every one of those dates is missing.'
      ]
    },
    {
      type: 'explain',
      title: 'Many numbers at once: agg and named results',
      body: `<p>Usually you want more than one number per group: how many payments, how much money, what average. Instead of three separate lines, use <code>.agg(...)</code>, short for aggregate, and give each result a name:</p>
<p><code>table.groupby("payment_method").agg(payments=("amount", "size"), total=("amount", "sum"), average=("amount", "mean"))</code></p>
<p>Each piece inside the brackets reads: <code>new_name=("column to use", "calculation")</code>. The result is a small <b>table</b>, with one row per group and one column per result. The names you choose become the column headings, so choose names a reader will understand.</p>
<p>Two finishing touches you will use every time:</p>
<ul>
<li><b>Sort the result</b> with <code>.sort_values("total", ascending=False)</code>, to put the biggest group first. You know this tool from lesson 4.3.</li>
<li><b><code>.reset_index()</code></b> turns the group names from labels back into an ordinary column. You need that when you want to use the result as a normal table, or combine it with another table, which you will do in lesson 4.5.</li>
</ul>`
    },
    {
      type: 'try',
      title: 'A summary of payments by method',
      body: `<p>The first table has one row per payment method and three named columns. <b>Mobile Money</b> has 2547 payments totalling 405335741.97 and averaging 159142.42. The other methods are close behind: Card 399118068.84, Cash on Delivery 391089175.47 and Bank Transfer 386438464.22.</p>
<p>The second table sorts by <code>total</code>, biggest first, and then uses <code>reset_index()</code>, so <code>payment_method</code> becomes an ordinary column and the labels become 0, 1, 2, 3. It is now a clean, presentable summary. The four methods are within about 5 percent of each other, so customers do not strongly prefer one way to pay.</p>`,
      code: `import pandas as pd

payments = pd.read_csv("payments.csv")

by_method = payments.groupby("payment_method").agg(
    payments=("amount", "size"),
    total=("amount", "sum"),
    average=("amount", "mean")
).round(2)
print(by_method)

by_method = by_method.sort_values("total", ascending=False).reset_index()
print(by_method)`
    },
    {
      id: 'py-4-4-ex2',
      type: 'exercise',
      title: 'Your turn: which product earns the most?',
      body: `<p>Load <code>order_items.csv</code> and create <code>line_total</code>. Group by <code>product_id</code>, add up the <code>line_total</code> for each product, and print the <code>product_id</code> that earns the <b>most</b>. You should see <code>18</code>.</p>
<p><b>Think before you type:</b> <code>groupby("product_id")["line_total"].sum()</code> gives one total per product, and its labels are the product IDs. Finish with <code>.idxmax()</code>, which returns the label of the biggest value.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `order_items["line_total"] = quantity * unit_price. Then order_items.groupby("product_id")["line_total"].sum().idxmax().`,
        `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\nprint(order_items.groupby("product_id")["line_total"].sum().idxmax())`
      ],
      solution: `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\nprint(order_items.groupby("product_id")["line_total"].sum().idxmax())`,
      ordered: true
    },
    {
      id: 'py-4-4-ex3',
      type: 'exercise',
      title: 'Your turn: the method with the highest average payment',
      body: `<p>Load <code>payments.csv</code>. Group by <code>payment_method</code>, take the <b>average</b> of <code>amount</code> in each group, and print the name of the method with the <b>highest average</b>. You should see <code>Mobile Money</code>.</p>
<p><b>Think before you type:</b> the same pattern as the last exercise, with <code>.mean()</code> instead of <code>.sum()</code>, and <code>.idxmax()</code> at the end.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `payments.groupby("payment_method")["amount"].mean() gives one average per method. Add .idxmax() to get the name of the biggest.`,
        `import pandas as pd\npayments = pd.read_csv("payments.csv")\nprint(payments.groupby("payment_method")["amount"].mean().idxmax())`
      ],
      solution: `import pandas as pd\npayments = pd.read_csv("payments.csv")\nprint(payments.groupby("payment_method")["amount"].mean().idxmax())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Grouping by two columns',
      body: `<p>You can split by <b>two</b> columns at once by passing a list: <code>groupby(["order_year", "order_status"])</code>. Now each pile is one combination: Completed orders of 2024, Cancelled orders of 2025, and so on.</p>
<p>The result has two levels of labels, which is hard to read. A short finishing move fixes it: <b><code>.unstack()</code></b> takes the second grouping column and turns its values into column headings. The result is a grid with years down the side and statuses across the top. If you have ever built a <b>pivot table</b>, this is exactly that grid.</p>
<p>Which should go down the side and which across the top? Put the column with more values down the side, and the one with few values across the top, so the grid stays narrow enough to read.</p>`
    },
    {
      type: 'try',
      title: 'Orders by year and status, as a grid',
      body: `<p>A grid with the four years down the side and the four statuses across the top. Read any cell as “how many orders of this status were placed in this year”. For 2025: <b>137</b> cancelled, <b>2154</b> completed, <b>451</b> processing and <b>137</b> returned.</p>
<p>Now you can answer the CEO’s question about 2026 properly, which she raised in lesson 4.1. The 2026 row is smaller because the data stops in June. But look at the <i>mix</i>: Completed orders were 1018 out of 1406 in 2026, about 72 percent, close to the 74 to 75 percent of the earlier years. Grouping lets you compare shares, and not only totals.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")
orders["order_year"] = pd.to_datetime(orders["order_date"]).dt.year

grid = orders.groupby(["order_year", "order_status"]).size().unstack()
print(grid)`
    },
    {
      id: 'py-4-4-ex4',
      type: 'exercise',
      title: 'Your turn: the most orders by a single customer',
      body: `<p>Load <code>orders.csv</code>. Group the orders by <code>customer_id</code>, count how many orders each customer placed, and print the <b>largest count</b>. You should see <code>15</code>.</p>
<p><b>Think before you type:</b> <code>groupby("customer_id").size()</code> gives one count per customer. Finish with <code>.max()</code> to get the biggest count.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `orders.groupby("customer_id").size() counts the orders of each customer. Add .max() at the end and print it.`,
        `import pandas as pd\norders = pd.read_csv("orders.csv")\nprint(orders.groupby("customer_id").size().max())`
      ],
      solution: `import pandas as pd\norders = pd.read_csv("orders.csv")\nprint(orders.groupby("customer_id").size().max())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Grouping finds questions you did not know to ask',
      body: `<p>A good group-by does more than answer the question you asked. It often shows you something you did not expect. Here is a case from the operations director, who has been worried about <b>Delayed</b> deliveries. In lesson 3.2 you calculated the number of days each delivery took, from dispatch to arrival, and the overall average was 5.51 days.</p>
<p>The natural next question: <i>“Do Delayed deliveries really take longer than Delivered ones?”</i> One group-by answers it: group by delivery status, and ask for the count, the average, the shortest and the longest delivery time in each group.</p>
<p>Remember that the average of a column <b>skips missing values</b>. Failed and In Transit deliveries have no arrival date, so they have no delivery time, and they will simply show as empty.</p>`
    },
    {
      type: 'try',
      title: 'Do Delayed deliveries take longer?',
      body: `<p>Look carefully at the first two rows. <b>Delayed</b>: 655 deliveries, average <b>5.51</b> days, shortest 1, longest 10. <b>Delivered</b>: 7606 deliveries, average <b>5.51</b> days, shortest 1, longest 10. The two groups are <b>identical</b>. A delivery marked Delayed took, on average, exactly as long in transit as one marked Delivered.</p>
<p>Failed and In Transit show <b>0</b> for the count and NaN (missing) for the rest, as expected: no arrival date, no delivery time.</p>
<p>That is surprising. If “Delayed” meant “took longer in transit”, its average would be higher. It is not, so the label must come from something else.</p>`,
      code: `import pandas as pd

deliveries = pd.read_csv("deliveries.csv")

deliveries["days"] = (pd.to_datetime(deliveries["delivery_date"]) - pd.to_datetime(deliveries["dispatch_date"])).dt.days

print(deliveries.groupby("delivery_status")["days"].agg(["count", "mean", "min", "max"]).round(2))`
    },
    {
      id: 'py-4-4-c2',
      type: 'check',
      title: 'Delayed and Delivered deliveries both average 5.51 days in transit. What is the best conclusion?',
      body: `<p>Think about what the data can and cannot tell you.</p>`,
      options: [
        'The Delayed label is meaningless and should be removed from the data',
        'The label does not seem to be based on transit time alone. It may compare against a promised date that this table does not hold, so the right move is to ask the operations team how it is defined',
        'Delayed deliveries are actually faster than the others',
        'The delivery dates are wrong, so the whole analysis is useless'
      ],
      answer: 1,
      why: [
        'That is a leap. The label may well be meaningful, for example if it compares the arrival with a promised date. We only know that transit time alone does not explain it.',
        'Exactly. The data shows a surprise, not an answer. A good analyst reports the finding, says what it rules out, and asks the owner of the process how the label is defined before drawing conclusions.',
        'The two averages are identical, so Delayed is neither faster nor slower on this measure.',
        'Nothing suggests the dates are wrong. They passed the validation checks in lesson 3.5. The surprise is about what the status label means.'
      ]
    },
    {
      type: 'explain',
      title: 'Group, then rank: the answer to the CEO',
      body: `<p>You now have every tool for step four of the CEO’s question. The recipe is three moves you already know, in a new order:</p>
<ol>
<li><b>Group</b> the order lines by product and add up the line totals.</li>
<li><b>Sort</b> the result, biggest first (lesson 4.3).</li>
<li><b>Keep the top</b> with <code>.head(3)</code>, and tidy it with <code>reset_index()</code> and a clear column name.</li>
</ol>
<p>Be clear about what this will answer. The CEO asked about <b>product categories</b>, but the order lines only carry a <code>product_id</code>. The category is stored in a different table, products. So the group-by can tell us which <i>products</i> earn the most, but not yet which <i>categories</i>. For that we need to bring the two tables together, and that is the next lesson.</p>`
    },
    {
      type: 'try',
      title: 'The three products that earn the most',
      body: `<p>The table shows the three biggest earners. <b>Product 18</b> brings in 43406465.76, <b>product 5</b> 40611533.55 and <b>product 15</b> 37782522.85. Product 5 is the Power Bank, the most expensive product you found in lesson 4.3.</p>
<p>Now put these in context, using the idea from lesson 4.3. There are 150 products, and an average product earns about 10.5 million. The top three earn roughly four times that. Together they are only about 7.7 percent of all revenue, which you will calculate yourself in a moment. So revenue is well spread: no small group of products carries the business.</p>`,
      code: `import pandas as pd

order_items = pd.read_csv("order_items.csv")
order_items["line_total"] = order_items["quantity"] * order_items["unit_price"]

revenue = order_items.groupby("product_id")["line_total"].sum()
top3 = revenue.sort_values(ascending=False).head(3).round(2).reset_index()
top3 = top3.rename(columns={"line_total": "revenue"})

print(top3)`
    },
    {
      id: 'py-4-4-ex5',
      type: 'exercise',
      title: 'Challenge: how concentrated is the revenue?',
      body: `<p>Load <code>order_items.csv</code> and create <code>line_total</code>. Add up the revenue of each product. Print the <b>percentage of total revenue</b> that the <b>three</b> best products make up, rounded to 2 decimals. You should see <code>7.7</code>.</p>
<p><b>Think before you type:</b> the revenue per product is <code>groupby("product_id")["line_total"].sum()</code>. Use <code>.nlargest(3)</code> on it and sum those three. Divide by the sum of <i>all</i> the product revenues, multiply by 100, and round.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `revenue = order_items.groupby("product_id")["line_total"].sum(). Then revenue.nlargest(3).sum() / revenue.sum() * 100, inside round(..., 2).`,
        `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\nrevenue = order_items.groupby("product_id")["line_total"].sum()\nprint(round(revenue.nlargest(3).sum() / revenue.sum() * 100, 2))`
      ],
      solution: `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\nrevenue = order_items.groupby("product_id")["line_total"].sum()\nprint(round(revenue.nlargest(3).sum() / revenue.sum() * 100, 2))`,
      ordered: true
    },
    {
      id: 'py-4-4-c3',
      type: 'check',
      title: 'Which line gives the total line_total for each product?',
      body: `<p>Read each line from left to right: what is split, which column is used, and what is calculated.</p>`,
      options: [
        'order_items.groupby("line_total")["product_id"].sum()',
        'order_items.groupby("product_id")["line_total"].sum()',
        'order_items["product_id"].groupby("line_total").sum()',
        'order_items.sum("product_id")'
      ],
      answer: 1,
      why: [
        'This splits by line_total and adds up product IDs, which is the wrong way round. You would get a meaningless total of product numbers.',
        'Yes! Split by product_id, look at line_total in each pile, and add it up. The group goes in groupby(...), and the thing to calculate goes in the square brackets.',
        'This puts the pieces in the wrong order. The column to split by belongs to groupby on the whole table.',
        'sum does not take a column name like this. The grouping must be done with groupby first.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>Step four of the CEO’s question is done, and you have the most important tool in the module. You can:</p>
<ul>
<li>Explain <b>split, apply, combine</b>, and write <code>table.groupby("col")["x"].sum()</code> without hesitating</li>
<li>Choose the calculation: <code>sum</code>, <code>mean</code>, <code>median</code>, <code>min</code>, <code>max</code>, <code>size</code>, <code>count</code> and <code>nunique</code></li>
<li>Tell <code>size</code> (rows) from <code>count</code> (non-missing values) and use the difference to learn about missing data</li>
<li>Build a multi-column summary with <code>.agg(name=("column", "calculation"))</code>, then <code>sort_values</code> and <code>reset_index</code></li>
<li>Group by two columns and turn the result into a grid with <code>.unstack()</code></li>
<li>Combine group-by with <code>idxmax</code> and <code>nlargest</code> to find the top groups, and read a surprising result as a question to ask, not a conclusion</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What does <code>groupby</code> do, and how does it relate to SQL?</li>
<li>What is the difference between <code>size</code> and <code>count</code>?</li>
<li>You group by a column and find a result that surprises you. What do you do?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> <code>groupby</code> splits a table into groups by the values of one or more columns, applies a calculation such as a sum or an average to each group, and combines the results into one row per group. It is the same idea as <code>GROUP BY</code> with aggregate functions in SQL, or a pivot table in a spreadsheet.</p>
<p><b>2.</b> <code>size</code> counts every row in each group, including rows with missing values. <code>count</code> counts only the non-missing values in a chosen column. If they differ, the column has missing values, which can itself be a finding.</p>
<p><b>3.</b> I first check that the result is real: that I grouped on the right column, that the filters are right, and that the data passed validation. Then I report it as a finding, say what it rules out, and ask the owner of the process what the label or measure means before drawing a conclusion.</p>
</details>
<p><b>Coming next, in lesson 4.5:</b> joining tables. You now know which <i>products</i> earn the most. But the CEO asked about <i>categories</i>, and the category lives in a different table. You will learn <code>merge</code>, the Pandas version of a SQL join and a spreadsheet VLOOKUP, with its different join types. You will find the 500 cancelled orders that have no delivery, and finally answer the question that started this module.</p>`
    }
  ]
}
);
