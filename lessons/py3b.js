LESSONS.push(
{
  id: 'py-3-3',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: '',
  title: '3.3 Duplicates: find them, and know when not to remove them',
  tables: [],
  intro: `The finance director walks over with a printout. <i>“I found duplicates in the order lines,”</i> she says. <i>“Delete them before you send me the revenue figure.”</i> The Head of Data looks at you and raises an eyebrow. <i>“Before you delete anything,”</i> he says, <i>“make sure they really are duplicates.”</i><br><br>That sounds like a strange thing to say. Surely a duplicate is a duplicate? Here is the surprise of this lesson: <b>a repeated row is not always a mistake.</b> Sometimes it is a copy that got saved twice, and removing it is right. Sometimes it is two real events that happen to look alike, and removing one quietly deletes real money from your report.<br><br>You will learn how to find repeated rows, how to count them and how to remove them. Most importantly, you will learn how to decide whether you should. By the end, you will have an answer for the finance director, backed by numbers she cannot argue with.`,
  steps: [
    {
      type: 'explain',
      title: 'Three kinds of “the same”',
      body: `<p>Ask ten people what a duplicate is and nine will say “the same thing twice”. True, but “the same” can mean three quite different things, and each one calls for a different decision:</p>
<table class="mini">
<tr><th>Kind</th><th>What it looks like</th><th>TradeFlow example</th><th>Usual decision</th></tr>
<tr><td><b>Exact copy</b></td><td>Every column identical</td><td>A payment saved twice because someone double-clicked</td><td>Remove the extra copy</td></tr>
<tr><td><b>Same key</b></td><td>One identifier that should appear once appears twice</td><td>The same customer ID on two rows</td><td>Investigate first</td></tr>
<tr><td><b>Look-alike</b></td><td>Different things that happen to resemble each other</td><td>Two different customers who are both called David Jones</td><td>Usually keep both</td></tr>
</table>
<div class="callout analogy"><b>Picture an attendance sheet.</b> If one student’s signature appears twice at exactly 9:00:01, the pen slipped: that is a copy, so cross one out. If two different students are both called David, that is not a mistake at all, and crossing one out would mark a real student absent. The hard part of removing duplicates is never the code. It is telling a slipped pen from two Davids.</div>
<p>Pandas gives you a small set of tools to find repeated rows, count them and remove them. Let’s meet them on a list so tiny that you can check every answer by eye.</p>`
    },
    {
      type: 'try',
      title: 'Duplicates in a list of six names',
      body: `<p>Run it and read the three lines of output against the list <b>Ada, Ben, Ada, Chi, Ben, Ada</b>.</p>
<ol>
<li><code>duplicated()</code> goes down the list asking each item: “have I seen you earlier?”. The first Ada gets <b>False</b>, the second Ada gets <b>True</b>, the third Ada gets <b>True</b>. You get <code>[False, False, True, False, True, True]</code>. The <b>first</b> time a value appears is never marked.</li>
<li><code>duplicated(keep=False)</code> marks <b>every</b> member of a repeated group, the first one included. Only Chi, who appears once, stays False: <code>[True, True, True, False, True, True]</code>.</li>
<li><code>drop_duplicates()</code> keeps the first of each value and removes the rest, leaving <code>['Ada', 'Ben', 'Chi']</code>.</li>
</ol>
<p>The code ends each line with <code>.tolist()</code> only so the answers print in one tidy row.</p>`,
      code: `import pandas as pd

names = pd.Series(["Ada", "Ben", "Ada", "Chi", "Ben", "Ada"])

print(names.duplicated().tolist())
print(names.duplicated(keep=False).tolist())
print(names.drop_duplicates().tolist())`
    },
    {
      type: 'explain',
      title: 'The tools, and two arguments that steer them',
      body: `<p>On a whole table the same tools work. You steer them with two arguments:</p>
<table class="mini">
<tr><th>Tool</th><th>What it does</th></tr>
<tr><td><code>table.duplicated()</code></td><td>A True/False column: True for every row that repeats an earlier row</td></tr>
<tr><td><code>table.duplicated().sum()</code></td><td>How many <b>extra copies</b> there are (three Adas count as 2, not 3)</td></tr>
<tr><td><code>subset=["a", "b"]</code></td><td>Judge “the same” using only these columns and ignore the rest</td></tr>
<tr><td><code>keep=False</code></td><td>Mark every member of a repeated group, so you can look at all of them</td></tr>
<tr><td><code>table.drop_duplicates()</code></td><td>Give back a new table without the extra copies</td></tr>
</table>
<p>Two habits to build right now. First, <b>count before you remove</b>. Looking is free, deleting is not. Second, remember what you learned in lesson 3.1: <code>drop_duplicates()</code> hands back a new table and leaves the original alone, so to keep the result you must store it: <code>table = table.drop_duplicates()</code>.</p>
<p>Now let’s ask the real TradeFlow tables the first question: are there any rows that are exact copies?</p>`
    },
    {
      type: 'try',
      title: 'Exact copies in TradeFlow, and the name tag that hides twins',
      body: `<p>The first three lines are reassuring: <b>0</b> exact copies in orders, customers and order lines. But the last line reveals something important.</p>
<p>The order lines table has a column called <code>order_item_id</code>, a unique number on every row. Because of that, <b>no two rows can ever be identical</b>, even if they describe the very same purchase. The ID works like a name tag that stops twins from looking alike.</p>
<p>So we removed the tag with <code>.drop(columns=["order_item_id"])</code>, which returns a copy of the table without that column, and asked again. Now there are <b>28</b> rows that match an earlier row in every remaining column: same order, same product, same quantity, same price. An ID column is a label, not information, so when you hunt for duplicates, always ask whether the ID should be ignored.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")
customers = pd.read_csv("customers.csv")
order_items = pd.read_csv("order_items.csv")

print("orders:", orders.duplicated().sum())
print("customers:", customers.duplicated().sum())
print("order_items:", order_items.duplicated().sum())

without_id = order_items.drop(columns=["order_item_id"])
print("order_items without the ID column:", without_id.duplicated().sum())`
    },
    {
      id: 'py-3-3-ex1',
      type: 'exercise',
      title: 'Your turn: exact copies in payments',
      body: `<p>Load <code>payments.csv</code> into a jar called <code>payments</code> and print how many <b>exact duplicate rows</b> it contains. You should see <code>0</code>.</p>
<p><b>Think before you type:</b> load the file, then <code>.duplicated()</code> gives a True/False value for each row, and <code>.sum()</code> counts the Trues.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `payments.duplicated() marks each repeated row with True. Add .sum() to count them and print the result.`,
        `import pandas as pd\npayments = pd.read_csv("payments.csv")\nprint(payments.duplicated().sum())`
      ],
      solution: `import pandas as pd\npayments = pd.read_csv("payments.csv")\nprint(payments.duplicated().sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What does one row stand for? Find the grain',
      body: `<p>Think about how a sensible order system stores a purchase. If a customer buys three mugs and one lamp, you would expect <b>two lines</b>: mug with quantity 3, lamp with quantity 1. One line per product per order. That means the pair <code>order_id</code> and <code>product_id</code> should never repeat.</p>
<p>Analysts call “what one row stands for” the <b>grain</b> of a table. Here the grain is: <i>one product in one order</i>. The columns that identify a row at that grain are its <b>business key</b>, and they are exactly what you pass to <code>subset</code>.</p>
<p>Make it a habit: before you hunt for duplicates in any table, write the grain in one sentence. Then use <code>subset</code> with those columns. Without the grain, “duplicate” has no clear meaning.</p>
<p>Let’s look at every order line that breaks the grain, both partners of each pair, side by side.</p>`
    },
    {
      type: 'try',
      title: 'The order lines that break the grain',
      body: `<p>The first number is <b>294</b>. That is how many rows take part in a repeat, because <code>keep=False</code> flags both members of every pair. Hold that thought: it means there are 147 pairs, and you will count the extra copies yourself in the next exercise.</p>
<p>Then you see the top six rows, sorted so that partners sit next to each other. (<code>sort_values</code> sorts a table by the columns you name. It gets a proper lesson in the next module. Here, read it as “put partners side by side”.)</p>
<p>Read the first pair. In order <b>6</b>, product <b>60</b> appears on two lines: one with quantity 2 and one with quantity 1, at the same price of 33321.91. A glitch that saved a line twice would normally copy the quantity too. This looks more like a customer who added the same product in two separate moves. Orders 29 and 61 show the same pattern, with different quantities on the two lines. In fact, 119 of the 147 pairs have different quantities. That is a strong clue, but a clue is not proof.</p>`,
      code: `import pandas as pd

order_items = pd.read_csv("order_items.csv")

repeated = order_items[order_items.duplicated(subset=["order_id", "product_id"], keep=False)]
repeated = repeated.sort_values(["order_id", "product_id"])

print(len(repeated))
print(repeated.head(6))`
    },
    {
      id: 'py-3-3-ex2',
      type: 'exercise',
      title: 'Your turn: count the repeated order lines',
      body: `<p>Load <code>order_items.csv</code> and print how many order lines <b>repeat an earlier (order_id, product_id) pair</b>. You should see <code>147</code>.</p>
<p><b>Think before you type:</b> use <code>duplicated</code> with <code>subset=["order_id", "product_id"]</code>, then <code>.sum()</code>. Do not use <code>keep=False</code> this time: we want the number of extra copies, not every member of every pair.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `order_items.duplicated(subset=["order_id", "product_id"]) marks the repeats. Add .sum() and print it.`,
        `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\nprint(order_items.duplicated(subset=["order_id", "product_id"]).sum())`
      ],
      solution: `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\nprint(order_items.duplicated(subset=["order_id", "product_id"]).sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Mistake or real purchase? Let the money decide',
      body: `<p>So 147 order lines repeat an order-and-product pair, and the finance director wants them deleted. Before anyone touches the data, let’s test two competing theories:</p>
<ul>
<li><b>Theory A, a mistake:</b> the system saved some lines twice. If so, customers were <i>not</i> billed for the extra lines.</li>
<li><b>Theory B, real purchases:</b> customers really did buy the same product on two separate lines. If so, they <i>were</i> billed.</li>
</ul>
<p>A second source of truth can settle it. The payments table records the amount billed for each order. If the repeated lines are real, the payments should add up to the total of <b>all</b> order lines. If they are mistakes, the payments should match the lines <b>without</b> the repeats. Comparing two independent sources that should agree is called <b>reconciliation</b>, and it is how accountants and auditors catch problems.</p>
<div class="callout work"><b>At work:</b> a reconciliation is the strongest thing an analyst can bring to a meeting. “I think they are real” is an opinion. “The billed amount only matches when they are included” is evidence.</div>
<p>One new step: the value of a line is quantity times price. You can calculate it for every row at once with <code>order_items["quantity"] * order_items["unit_price"]</code>. It is the same multiplication you know from lesson 1.3, applied to two whole columns.</p>`
    },
    {
      type: 'try',
      title: 'Two totals that do not agree',
      body: `<p>Two numbers appear, and they disagree:</p>
<ul>
<li>Customers were billed <b>1581981450.5</b> in total.</li>
<li>The order lines left after dropping the 147 repeats add up to <b>1572992161.18</b>.</li>
</ul>
<p>The lines without the repeats fall about 9 million short of what the payments table says. If the repeats were mistakes, the payments would match the smaller number. They do not. Now it is your turn to finish the reconciliation.</p>
<p>(Here <code>drop_duplicates(subset=[...])</code> kept the first line of each pair, and <code>round(..., 2)</code> keeps two decimals. We store the line values in a new column called <code>line_total</code> so we can reuse them.)</p>`,
      code: `import pandas as pd

payments = pd.read_csv("payments.csv")
order_items = pd.read_csv("order_items.csv")

order_items["line_total"] = order_items["quantity"] * order_items["unit_price"]
kept = order_items.drop_duplicates(subset=["order_id", "product_id"])

print("Billed in payments:", round(payments["amount"].sum(), 2))
print("Order lines after dropping the repeats:", round(kept["line_total"].sum(), 2))`
    },
    {
      id: 'py-3-3-ex3',
      type: 'exercise',
      title: 'Your turn: the total of all order lines',
      body: `<p>Load <code>order_items.csv</code> and print the total of <b>all 25,000</b> order lines, with nothing removed: quantity times unit price on every row, summed, rounded to 2 decimals. You should see <code>1581981450.5</code>. Compare it with what customers were billed. They are the same number.</p>
<p><b>Think before you type:</b> multiply the two columns, call <code>.sum()</code> on the result, and wrap it in <code>round(..., 2)</code>. No dropping at all.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `(order_items["quantity"] * order_items["unit_price"]) gives the value of each line. Add .sum(), then round to 2 decimals.`,
        `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\nprint(round((order_items["quantity"] * order_items["unit_price"]).sum(), 2))`
      ],
      solution: `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\nprint(round((order_items["quantity"] * order_items["unit_price"]).sum(), 2))`,
      ordered: true
    },
    {
      id: 'py-3-3-ex4',
      type: 'exercise',
      title: 'Challenge: how much money would the clean-up delete?',
      body: `<p>The totals now agree only when the repeats are included, so dropping them would delete real revenue. Measure the damage. Print the total of all lines <b>minus</b> the total of the lines kept after <code>drop_duplicates(subset=["order_id", "product_id"])</code>, rounded to 2 decimals. You should see <code>8989289.32</code>.</p>
<p><b>Think before you type:</b> you need two totals, so create a <code>line_total</code> column first. Then subtract the “kept” total from the “all lines” total.</p>`,
      starter: `import pandas as pd\n\norder_items = pd.read_csv("order_items.csv")\n\n# Write your code below\n`,
      hints: [
        `Make order_items["line_total"] = quantity * unit_price. Then kept = order_items.drop_duplicates(subset=["order_id", "product_id"]). Subtract the two sums.`,
        `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\nkept = order_items.drop_duplicates(subset=["order_id", "product_id"])\nprint(round(order_items["line_total"].sum() - kept["line_total"].sum(), 2))`
      ],
      solution: `import pandas as pd\norder_items = pd.read_csv("order_items.csv")\norder_items["line_total"] = order_items["quantity"] * order_items["unit_price"]\nkept = order_items.drop_duplicates(subset=["order_id", "product_id"])\nprint(round(order_items["line_total"].sum() - kept["line_total"].sum(), 2))`,
      ordered: true
    },
    {
      id: 'py-3-3-c1',
      type: 'check',
      title: 'The finance director repeats her request: “delete the 147 repeated lines”. What do you tell her?',
      body: `<p>Use the reconciliation you just completed.</p>`,
      options: [
        'Go ahead: repeated rows are always mistakes',
        'Do not delete them: the billed total matches only when they are included, so they were real purchases and deleting them would remove about 9 million of revenue',
        'Delete only the 28 exact copies, because those are certainly mistakes',
        'Nobody can tell, so flip a coin'
      ],
      answer: 1,
      why: [
        'It sounds tidy, but it is wrong here. A repeated row is only a mistake if the evidence says so, and the evidence says the opposite.',
        'Yes! The payments only add up when the repeats are counted, so customers were billed for them. Deleting them would make revenue look about 9 million smaller than the truth. You can show her the two totals.',
        'Even the 28 lines that match in every other column are part of the billed total. A customer can buy two of the same thing on two lines. Matching is a clue, not proof.',
        'A coin is not needed. The reconciliation gave you evidence, and good analysts use it.'
      ]
    },
    {
      type: 'explain',
      title: 'When dropping duplicates is the right call',
      body: `<p>None of this means you should never remove duplicates. Often you must. The point is to remove them for a <b>reason you can defend</b>. Here is a simple checklist:</p>
<table class="mini">
<tr><th>Drop the extra rows when…</th><th>Keep the rows when…</th></tr>
<tr><td>Every column matches, including time stamps and any ID that should be unique</td><td>The rows differ in something that matters: a quantity, a time, a status</td></tr>
<tr><td>It is believable that one event was recorded twice (a double click, a repeated import)</td><td>It is believable that two real events happened (two purchases, two people)</td></tr>
<tr><td>A second source agrees with the smaller, cleaned count</td><td>A second source only agrees when the rows are included</td></tr>
</table>
<p>When you do drop, use <code>drop_duplicates</code> with the right <code>subset</code>, store the result, and print the number of rows before and after. Then <b>write down what you did</b>: how many rows, which columns and why. Analysts call this a cleaning log, and it is the first thing a manager or an auditor will ask you for.</p>
<div class="callout tip"><b>Tip:</b> keep the original table in its own jar and do your cleaning on a copy. If a decision turns out to be wrong, you can start again from the original.</div>`
    },
    {
      type: 'try',
      title: 'A case where dropping is right: the double click',
      body: `<p>Here is a small made-up payments log. Payment <b>102</b> appears twice, with the same order, the same amount and the same second it was saved. A payment ID should never repeat, and everything else matches, so this really does look like one click recorded twice.</p>
<p><code>drop_duplicates()</code> with no <code>subset</code> compares whole rows. It removes the second copy and the row count falls from 4 to 3. Notice the row labels on the left of the cleaned table: <b>0, 1, 3</b>. The label 2 is gone and the others were not renumbered. That is normal. If you want fresh labels, add <code>.reset_index(drop=True)</code>.</p>`,
      code: `import pandas as pd

payments_log = pd.DataFrame({
    "payment_id": [101, 102, 102, 103],
    "order_id": [5001, 5002, 5002, 5003],
    "amount": [4500, 12000, 12000, 800],
    "saved_at": ["09:14:02", "09:15:40", "09:15:40", "09:16:11"]
})

print(payments_log)
print("Rows before:", len(payments_log))

cleaned = payments_log.drop_duplicates()
print(cleaned)
print("Rows after:", len(cleaned))`
    },
    {
      id: 'py-3-3-c2',
      type: 'check',
      title: 'Why is the double-clicked payment safe to drop, while the 147 order lines were not?',
      body: `<p>Compare the two cases.</p>`,
      options: [
        'There is no difference: both should be treated the same way',
        'The payment rows match in every column, including the exact second, and a payment ID that should be unique appears twice. The order lines differ in quantity and are backed by the billed total',
        'Payments are always mistakes and order lines are never mistakes',
        'Small tables can be cleaned and big tables cannot'
      ],
      answer: 1,
      why: [
        'The same tool, drop_duplicates, is used for both, but the decision behind it is different, and the evidence decides.',
        'Exactly. In the payment log, every column matches and an ID repeats, which points to one event recorded twice. For the order lines, the quantities often differ and the money only reconciles with the repeats included.',
        'No row type is automatically a mistake. Each case needs its own evidence.',
        'Size does not matter. The evidence about each row does.'
      ]
    },
    {
      type: 'explain',
      title: 'The third kind: look-alikes that are different people',
      body: `<p>Now the customers table. It has 2,000 rows and the <code>customer_id</code> never repeats. But what about names? If you count the different names, you do not get 2,000. You get <b>1,976</b>. That means 24 rows carry a name that already appeared on an earlier row.</p>
<p>Are those 24 customers duplicates that should be deleted? Think about it for a moment. Names are not keys. They are labels that people share. Plenty of real people are called David Jones, just as plenty are called Maria Garcia or Wei Zhang. The real test is to compare the other columns: if two rows share a name but have different IDs, different emails and live in different countries, they are different people.</p>
<p>If you removed rows because the names matched, you would delete real customers, and all of their orders would point to someone who no longer exists. Later in this module you will learn to catch exactly that kind of broken link.</p>
<p>(There is a harder cousin of this problem: the <i>same</i> person typed in two slightly different ways, like “Jon Smith” and “John Smith”. Spotting those needs text cleaning, which is the topic of the next lesson.)</p>`
    },
    {
      type: 'try',
      title: 'Same name, different people',
      body: `<p>Customer IDs never repeat (<b>0</b>), but 24 names do. Now look at the three rows called David Jones: customers 552, 557 and 1608. They have different IDs, different emails (a hotmail, a yahoo and another hotmail address with different numbers), different regions, and two live in Ghana while one lives in Rwanda, and they signed up on three different dates. These are three real people who share a name. Deleting two of them would have been a costly mistake.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

print("Repeated customer IDs:", customers["customer_id"].duplicated().sum())
print("Repeated customer names:", customers["customer_name"].duplicated().sum())

print(customers[customers["customer_name"] == "David Jones"])`
    },
    {
      id: 'py-3-3-c3',
      type: 'check',
      title: 'Two customers are both called David Jones, with different emails and countries. What do you do?',
      body: `<p>Think about the three kinds of “the same” from the start of the lesson.</p>`,
      options: [
        'Delete one of them, because the name is duplicated',
        'Keep both: a shared name is not a duplicate, and the ID, email and country show they are different people',
        'Merge them into a single customer and add up their orders',
        'Delete both, to be safe'
      ],
      answer: 1,
      why: [
        'Deleting one removes a real customer and breaks the link to their orders.',
        'Right. This is a look-alike, not a copy. The customer ID is the key, and the other columns confirm they are different people.',
        'Merging would blend two people’s orders into one, which would make each customer look more valuable than they are.',
        'Deleting both makes things worse. You would lose two real customers.'
      ]
    },
    {
      id: 'py-3-3-ex5',
      type: 'exercise',
      title: 'Challenge: two checks on the customers table',
      body: `<p>Load <code>customers.csv</code> and print two numbers, each on its own line: first the number of repeated <code>customer_id</code> values, then the number of repeated <code>customer_name</code> values. You should see <code>0</code> and then <code>24</code>.</p>
<p><b>Think before you type:</b> pick one column, call <code>.duplicated()</code> on it, add <code>.sum()</code>, and put it in a print. Do it twice, with a different column each time.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `customers["customer_id"].duplicated().sum() gives the first number. Do the same with "customer_name" for the second. Use two print lines.`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nprint(customers["customer_id"].duplicated().sum())\nprint(customers["customer_name"].duplicated().sum())`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nprint(customers["customer_id"].duplicated().sum())\nprint(customers["customer_name"].duplicated().sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You now know that removing duplicates is a decision, not a reflex. You can:</p>
<ul>
<li>Find repeated rows with <code>duplicated()</code>, count the extra copies with <code>.sum()</code> and see every member of a group with <code>keep=False</code></li>
<li>Tell the three kinds of “the same” apart: exact copy, same key and look-alike</li>
<li>Spot the ID trap: a unique ID column hides twins, so drop it from the comparison or use <code>subset</code></li>
<li>Write down the <b>grain</b> of a table and use it to choose the columns for <code>subset</code></li>
<li>Reconcile two sources to decide whether repeats are real, and measure what dropping would cost</li>
<li>Remove true duplicates with <code>drop_duplicates()</code>, store the result and keep a cleaning log</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>How do you find and remove duplicates in Pandas?</li>
<li>When is removing duplicates the wrong thing to do?</li>
<li>What is the “grain” of a table, and why does it matter for de-duplication?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I use <code>duplicated()</code> to flag repeats and <code>.sum()</code> to count them, with <code>subset</code> if only some columns define “the same”, and <code>keep=False</code> to look at every member of a group. To remove them I use <code>drop_duplicates()</code> with the same arguments and store the result, because it returns a new table.</p>
<p><b>2.</b> When the repeated rows are separate real events or different people. For example, a customer can buy the same product on two lines, and two customers can share a name. Removing those would delete real data and distort totals. I check the evidence first, for example by reconciling against another source, and I only drop rows I can justify.</p>
<p><b>3.</b> The grain is what one row represents, such as one product in one order. It matters because it tells me which columns define a duplicate. Without it I might compare all columns, including a unique ID that hides copies, or too few columns and flag different records as the same.</p>
</details>
<p><b>Coming next, in lesson 3.4:</b> messy text. The marketing manager counted 602 Gmail customers in her sheet, but the Head of Data’s dashboard shows 618. Both counted honestly, so where did 16 customers go? You will learn to clean text with Pandas, standardise emails, pull out the domain, and strip titles like “Dr.” and suffixes like “PhD” from names, using a small but powerful pattern language called regular expressions.</p>`
    }
  ]
},
{
  id: 'py-3-4',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: '',
  title: '3.4 Cleaning messy text: emails, names and categories',
  tables: [],
  intro: `The marketing manager is planning a campaign for Gmail users. She filters her customer sheet for “gmail” and counts <b>602</b> people. Then the Head of Data shows her the dashboard, and it says <b>618</b>. She turns to you: <i>“One of you is wrong. Which one?”</i><br><br>Here is the twist: <b>nobody is wrong.</b> Both counts were honest. They differ because 16 customers typed their email in capital letters, and a computer that compares text letter by letter does not see <code>GMAIL.COM</code> and <code>gmail.com</code> as the same word.<br><br>Text is the messiest kind of data, because people type it freely: extra spaces, odd capitals, titles in front of names, suffixes at the end. In this lesson you will learn the Pandas tools for cleaning text, find the missing 16 customers, pull the domain out of every email, and strip “Dr.” and “PhD” from names using a small pattern language called regular expressions. We will build it up from zero, one idea at a time.`,
  steps: [
    {
      type: 'explain',
      title: 'Why the same word can count as four different words',
      body: `<p>To you, “Ghana”, “ghana”, “GHANA” and “ Ghana” (with a space in front) are obviously the same country. To Python, they are <b>four different values</b>, because it compares text exactly, character by character. A capital G is a different character from a small g, and a space is a character too.</p>
<p>The damage shows up when you count or group. A table of customers per country would list four “countries” that are really one, and each would carry a fraction of the true number.</p>
<div class="callout analogy"><b>Think of a library.</b> If the librarian files one copy of a book under “Smith, J.” and another under “smith j” and a third under “SMITH, J”, a reader who looks on one shelf finds one third of the books. Cleaning text is the librarian’s job of choosing one spelling and making every label follow it.</div>
<p>Cleaning text usually means three moves: <b>trim</b> stray spaces, <b>fix the case</b> so everything is lower or upper or title case, and <b>fix patterns</b> such as titles and suffixes. Let’s do the first two on a tiny example.</p>`
    },
    {
      type: 'try',
      title: 'Three spellings, one country',
      body: `<p>The first number is <b>3</b>: Python sees three different values. Then we clean in two steps. <code>.str.strip()</code> removes spaces from both ends, and <code>.str.title()</code> gives every word a capital first letter and small letters after it. All three become <code>Ghana</code>, and the count of different values drops to <b>1</b>.</p>
<p>Notice the pattern <code>.str.strip().str.title()</code>: each step returns a new column of text, so you can chain another step straight after it. And notice the <code>.str</code> in front of every step. That is the subject of the next section.</p>`,
      code: `import pandas as pd

countries = pd.Series(["  Ghana ", "ghana", "GHANA"])

print(countries.nunique())

cleaned = countries.str.strip().str.title()
print(cleaned.tolist())
print(cleaned.nunique())`
    },
    {
      type: 'explain',
      title: 'The .str drawer: text tools for a whole column',
      body: `<p>A Pandas column is not a single piece of text, so it does not have text tools of its own. Instead, the text tools live in a drawer called <b><code>.str</code></b>. You open the drawer, pick a tool, and it is applied to <b>every value in the column at once</b>. Here are the ones you will use most, with their SQL cousins:</p>
<table class="mini">
<tr><th>Pandas</th><th>What it does</th><th>SQL cousin</th></tr>
<tr><td><code>.str.lower()</code> / <code>.str.upper()</code></td><td>All small letters / all capitals</td><td><code>LOWER</code> / <code>UPPER</code></td></tr>
<tr><td><code>.str.title()</code></td><td>Capital first letter of each word</td><td>none in SQLite</td></tr>
<tr><td><code>.str.strip()</code></td><td>Remove spaces at both ends</td><td><code>TRIM</code></td></tr>
<tr><td><code>.str.replace("a", "b")</code></td><td>Swap one piece of text for another</td><td><code>REPLACE</code></td></tr>
<tr><td><code>.str.contains("x")</code></td><td>True where the text includes “x”</td><td><code>LIKE '%x%'</code></td></tr>
<tr><td><code>.str.split("x")</code></td><td>Cut each text at “x” into pieces</td><td>no simple cousin</td></tr>
<tr><td><code>.str.len()</code></td><td>Number of characters</td><td><code>LENGTH</code></td></tr>
</table>
<p>Three rules to remember. First, forgetting <code>.str</code> is the most common beginner error, and Python complains that the column has no such method. Second, every tool returns a <b>new column</b> and leaves the original alone, as you saw with <code>dropna</code>. Third, a <b>missing value stays missing</b>: nothing happens to it and nothing breaks. You will see that on the customers who have no email.</p>`
    },
    {
      type: 'try',
      title: 'The error you will meet, and the fix',
      body: `<p>The first block is wrapped in <code>try</code> and <code>except</code>, the safety net from Module 1, so we can show the error without stopping. Calling <code>.lower()</code> straight on the column fails with <code>'Series' object has no attribute 'lower'</code>. Python is saying: “a column does not know how to lowercase itself”. The fix is to open the <code>.str</code> drawer first.</p>
<p>The second line shows the fix on the first three emails. Look at the third item: <code>nan</code>. That is customer 3, Andre Rivera, who has no email. The missing value passed through untouched, exactly as promised.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

try:
    customers["email"].lower()
except AttributeError as error:
    print("Error:", error)

print(customers["email"].str.lower().head(3).tolist())`
    },
    {
      type: 'explain',
      title: 'Searching inside text with contains',
      body: `<p><code>.str.contains("text")</code> answers “does this value include this text?” for every row, and you can put the answer in square brackets to filter, just as you did with <code>isnull()</code> in lesson 3.1. Two things catch beginners out:</p>
<ul>
<li><b>It is case-sensitive.</b> Searching for <code>"@gmail.com"</code> will not find <code>"@GMAIL.COM"</code>. You can add <code>case=False</code>, or lowercase the column first.</li>
<li><b>Missing values give a missing answer.</b> For a customer with no email, <code>contains</code> returns neither True nor False but <code>NaN</code>. A filter cannot decide what to do with “neither”, and Pandas may stop with an error. The fix is <code>na=False</code>, which means “count a missing email as not containing the text”.</li>
</ul>
<p>Let’s run the search three ways and watch the marketing manager’s mystery solve itself.</p>`
    },
    {
      type: 'try',
      title: 'Solving the 602 versus 618 mystery',
      body: `<p>The first line shows what <code>contains</code> returns for the first four customers: <code>[False, True, nan, False]</code>. The <code>nan</code> belongs to customer 3, who has no email.</p>
<p>The second line gives three counts. A plain search finds <b>602</b>, which is exactly what the marketing manager got. Searching with <code>case=False</code> finds <b>618</b>, and so does lowercasing first and then searching. So her sheet was missing <b>16 Gmail customers</b>, the ones whose addresses are in capitals, like customer 27’s <code>EUGENE.WALTON941@GMAIL.COM</code>. The dashboard was counting them. Both people were honest, and the data was messy.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

print(customers["email"].str.contains("@gmail.com").head(4).tolist())

plain = customers["email"].str.contains("@gmail.com", na=False).sum()
ignore_case = customers["email"].str.contains("@gmail.com", case=False, na=False).sum()
lowered = customers["email"].str.lower().str.contains("@gmail.com", na=False).sum()

print(plain, ignore_case, lowered)`
    },
    {
      id: 'py-3-4-c1',
      type: 'check',
      title: 'The marketing manager counted 602 Gmail users and the dashboard shows 618. What explains the gap of 16?',
      body: `<p>Think about how <code>contains</code> compares text.</p>`,
      options: [
        'The dashboard counts some customers twice',
        'Sixteen customers typed their email in capitals (GMAIL.COM), and a case-sensitive search does not match them',
        'Sixteen customers have no email at all',
        'The marketing manager looked at the wrong column'
      ],
      answer: 1,
      why: [
        'We checked for duplicates in 3.3 and the customer IDs do not repeat, so double counting is not the cause.',
        'Yes! A search for “@gmail.com” does not match “@GMAIL.COM”. Ignoring the case, or lowercasing first, finds all 618 and explains the 16.',
        'Missing emails are a different problem: 58 customers have none. They are not counted as Gmail in either number.',
        'She used the email column. The problem is how the text was typed inside it.'
      ]
    },
    {
      id: 'py-3-4-ex1',
      type: 'exercise',
      title: 'Your turn: count the Gmail customers properly',
      body: `<p>Load <code>customers.csv</code>. Lowercase the <code>email</code> column, then print how many emails contain <code>"@gmail.com"</code>. You should see <code>618</code>.</p>
<p><b>Think before you type:</b> chain <code>.str.lower()</code>, then <code>.str.contains("@gmail.com", na=False)</code>, then <code>.sum()</code>. Do not forget the <code>.str</code> before each tool, and <code>na=False</code> for the customers with no email.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `customers["email"].str.lower().str.contains("@gmail.com", na=False) gives True/False for each customer. Add .sum() and print.`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nprint(customers["email"].str.lower().str.contains("@gmail.com", na=False).sum())`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nprint(customers["email"].str.lower().str.contains("@gmail.com", na=False).sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Cutting text apart: the domain of every email',
      body: `<p>The marketing manager’s next question is bigger: <i>“Which email providers do our customers use?”</i> The provider is the part after the <code>@</code>. To get it, cut each email in two at the <code>@</code> and keep the second piece.</p>
<p><code>.str.split("@")</code> cuts each email into a <b>list of pieces</b>. For <code>benjamin.welch759@gmail.com</code> you get <code>['benjamin.welch759', 'gmail.com']</code>. Then <code>.str[1]</code> says “from every list, take the item in position 1”. Positions start at 0, as you learned with Python lists in Module 1, so position 1 is the second piece, the domain.</p>
<p>Finally, <code>.value_counts()</code>, which you know from lesson 2.3, counts how many customers use each domain. Do this <b>before</b> cleaning, and the capitals will split the answer into extra rows. Do it after lowercasing, and each provider shows up once.</p>`
    },
    {
      type: 'try',
      title: 'Six domains before cleaning, three after',
      body: `<p>The first table has <b>six</b> rows: <code>hotmail.com</code> 649, <code>yahoo.com</code> 641, <code>gmail.com</code> 602, and then <code>YAHOO.COM</code> 20, <code>GMAIL.COM</code> 16 and <code>HOTMAIL.COM</code> 14. There are really three providers, and the capitals scattered them into six.</p>
<p>The second table lowercases the domains first, and the true picture appears: <code>hotmail.com</code> <b>663</b>, <code>yahoo.com</code> <b>661</b>, <code>gmail.com</code> <b>618</b>. Gmail is the smallest of the three, not the “602” the marketing manager believed. That is a business fact you can only trust after cleaning.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

domains = customers["email"].str.split("@").str[1]

print(domains.value_counts())
print(domains.str.lower().value_counts())`
    },
    {
      id: 'py-3-4-ex2',
      type: 'exercise',
      title: 'Your turn: customers per email provider',
      body: `<p>Load <code>customers.csv</code>. Lowercase the emails, take the part after the <code>@</code>, and count customers per domain. Put the <code>value_counts()</code> <b>on the last line, without a print</b>, so you get a table. You should see hotmail.com 663, yahoo.com 661, gmail.com 618.</p>
<p><b>Think before you type:</b> the chain is <code>.str.lower()</code>, then <code>.str.split("@")</code>, then <code>.str[1]</code>, then <code>.value_counts()</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `customers["email"].str.lower().str.split("@").str[1] gives the domain of each customer. End with .value_counts().`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\ncustomers["email"].str.lower().str.split("@").str[1].value_counts()`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\ncustomers["email"].str.lower().str.split("@").str[1].value_counts()`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Patterns: a tiny language for describing text',
      body: `<p>Now names. Some customer names carry a title at the front (“Dr. Steven Martin”) or a suffix at the end (“Krista Bell MD”). For analysis you want just “Steven Martin” and “Krista Bell”. A title can be one of several words, so a plain <code>replace</code> would need many separate steps. Instead, we describe the pattern once.</p>
<p>The pattern language is called <b>regular expressions</b>, or <b>regex</b>. It is like the wildcards you may have used when searching files on a computer: a compact way to say “text that looks like this”. We need only five symbols:</p>
<table class="mini">
<tr><th>Symbol</th><th>Meaning</th><th>Example</th></tr>
<tr><td><code>^</code></td><td>the very <b>start</b> of the text</td><td><code>^Dr</code> matches “Dr” only at the beginning</td></tr>
<tr><td><code>$</code></td><td>the very <b>end</b> of the text</td><td><code>MD$</code> matches “MD” only at the end</td></tr>
<tr><td><code>|</code></td><td><b>or</b></td><td><code>Mr|Ms</code> matches “Mr” or “Ms”</td></tr>
<tr><td><code>( )</code></td><td>group things together</td><td><code>(Mr|Ms) </code> is “Mr or Ms, then a space”</td></tr>
<tr><td><code>\\.</code></td><td>a real <b>dot</b></td><td>a bare <code>.</code> means “any character”, so a real dot needs the backslash</td></tr>
</table>
<p>So the pattern <code>^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) </code> reads: “at the start, one of Dr., Mr., Mrs., Ms. or Miss, followed by a space”. When we use it with <code>.str.replace(pattern, "", regex=True)</code>, whatever it matches is replaced by nothing, so the title disappears.</p>
<p>One more detail: we write the pattern as <code>r"..."</code>, with an <code>r</code> in front of the quote. It tells Python to take every backslash literally, so <code>\\.</code> reaches the pattern tool intact.</p>
<div class="callout watch"><b>Watch out:</b> a pattern is powerful and can match more than you intend. Always count how many values change, and read a few before and after. Never trust a pattern you have not looked at.</div>`
    },
    {
      type: 'try',
      title: 'Removing titles: 38 names change',
      body: `<p>The first number is <b>38</b>: that many customer names begin with a title. Then we place four of them <b>before</b> and <b>after</b> in a small table. “Dr. Steven Martin” becomes “Steven Martin”. The trailing space is part of the pattern, so no stray space is left behind.</p>
<p>Look at the fourth row: “Miss Debra Williams PhD” becomes “Debra Williams PhD”. The title is gone, but the suffix stays. That needs a second pattern, coming up next. This is also why we look at examples: a pattern does exactly what it says, no more.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

title = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "

has_title = customers["customer_name"].str.contains(title, regex=True)
print(has_title.sum())

before = customers.loc[has_title, "customer_name"].head(4)
after = before.str.replace(title, "", regex=True)
print(pd.DataFrame({"before": before, "after": after}))`
    },
    {
      id: 'py-3-4-ex3',
      type: 'exercise',
      title: 'Your turn: how many names change when titles are removed?',
      body: `<p>The title pattern is already stored in <code>title</code> for you. Print how many customer names <b>change</b> after removing the title: compare the cleaned names with the original names and count the differences. You should see <code>38</code>.</p>
<p><b>Think before you type:</b> clean with <code>customers["customer_name"].str.replace(title, "", regex=True)</code>. Then compare it with <code>customers["customer_name"]</code> using <code>!=</code>, which gives True where they differ, and use <code>.sum()</code>.</p>`,
      starter: `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\ntitle = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "\n\n# Write your code below\n`,
      hints: [
        `Make cleaned = customers["customer_name"].str.replace(title, "", regex=True). Then (cleaned != customers["customer_name"]).sum() counts the names that changed.`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\ntitle = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "\ncleaned = customers["customer_name"].str.replace(title, "", regex=True)\nprint((cleaned != customers["customer_name"]).sum())`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\ntitle = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "\ncleaned = customers["customer_name"].str.replace(title, "", regex=True)\nprint((cleaned != customers["customer_name"]).sum())`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Suffixes at the end, and both patterns together',
      body: `<p>The suffix pattern is a mirror image of the title pattern. It starts with a space, lists the suffixes with <code>|</code>, and ends with <code>$</code>, so it can only match at the very end of a name. It finds <b>41</b> names.</p>
<p>Then we chain both cleanups, <code>.str.replace(title, ...)</code> followed by <code>.str.replace(suffix, ...)</code>, and count the names that changed: <b>71</b>. Why not 38 plus 41, which is 79? Because 8 names have <i>both</i>, like “Dr. Jessica Rodriguez DDS”, and they are only counted once as changed names.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

title = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "
suffix = r" (MD|PhD|DDS|DVM|Jr\\.|II|III|IV)$"

print(customers["customer_name"].str.contains(suffix, regex=True).sum())

clean = customers["customer_name"].str.replace(title, "", regex=True).str.replace(suffix, "", regex=True)
print((clean != customers["customer_name"]).sum())`
    },
    {
      id: 'py-3-4-ex4',
      type: 'exercise',
      title: 'Your turn: count the names with a suffix',
      body: `<p>The suffix pattern is stored in <code>suffix</code> for you. Print how many customer names <b>end with a suffix</b>. You should see <code>41</code>.</p>
<p><b>Think before you type:</b> this time use <code>.str.contains(suffix, regex=True)</code> on the name column, then <code>.sum()</code> to count the Trues.</p>`,
      starter: `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\nsuffix = r" (MD|PhD|DDS|DVM|Jr\\.|II|III|IV)$"\n\n# Write your code below\n`,
      hints: [
        `customers["customer_name"].str.contains(suffix, regex=True) gives True for names with a suffix. Add .sum() and print it.`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nsuffix = r" (MD|PhD|DDS|DVM|Jr\\.|II|III|IV)$"\nprint(customers["customer_name"].str.contains(suffix, regex=True).sum())`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nsuffix = r" (MD|PhD|DDS|DVM|Jr\\.|II|III|IV)$"\nprint(customers["customer_name"].str.contains(suffix, regex=True).sum())`,
      ordered: true
    },
    {
      id: 'py-3-4-c2',
      type: 'check',
      title: 'Why does the title pattern start with ^ and the suffix pattern end with $?',
      body: `<p>Look back at what the two symbols mean.</p>`,
      options: [
        'They make the pattern ignore capital letters',
        'They pin the match to the start or the end of the name, so a “Dr.” or an “MD” in the middle of a name is never removed',
        'They tell Python to read the pattern as a regular expression',
        'They remove spaces from the name'
      ],
      answer: 1,
      why: [
        'Case is not controlled by these symbols. They are about position.',
        'Right! ^ means “only at the very start” and $ means “only at the very end”. Without them, a pattern could cut text out of the middle of a name.',
        'That is what regex=True does. The symbols ^ and $ are part of the pattern itself.',
        'Spaces are handled by the space written inside the pattern, not by ^ or $.'
      ]
    },
    {
      type: 'try',
      title: 'Did cleaning change the number of different customers?',
      body: `<p>Before cleaning there are <b>1976</b> different names. After removing titles and suffixes there are <b>1973</b>. Three names merged: somewhere there is a “Dr. Someone” and a plain “Someone”, or a “Someone Jr.” and a “Someone”, which now look identical.</p>
<p>Careful with what that means. Remember the lesson on look-alikes: two customers can share a name and still be different people. These three merges are <b>leads</b>, not proof. They are the right place to start asking questions: do those two rows share an email, a country, a signup date? Only then can you decide whether it is one person entered twice.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

title = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "
suffix = r" (MD|PhD|DDS|DVM|Jr\\.|II|III|IV)$"

clean = customers["customer_name"].str.replace(title, "", regex=True).str.replace(suffix, "", regex=True)

print(customers["customer_name"].nunique())
print(clean.nunique())`
    },
    {
      id: 'py-3-4-c3',
      type: 'check',
      title: 'After cleaning, three pairs of names have become identical. What should you do?',
      body: `<p>Think back to the three kinds of “the same” from lesson 3.3.</p>`,
      options: [
        'Merge each pair into one customer straight away',
        'Treat them as leads: compare the IDs, emails and countries of each pair before deciding, and delete nothing yet',
        'Delete the newer customer in each pair',
        'Ignore them, since names do not matter'
      ],
      answer: 1,
      why: [
        'A matching name is not enough. It might be two different people, as with the three David Joneses.',
        'Exactly. A match after cleaning is a reason to look closer, not a verdict. Compare the other columns, and keep a note of what you decide and why.',
        'Deleting a customer because of a name match could remove a real person and the orders linked to them.',
        'Names matter a great deal for finding people entered twice. They just need careful checking.'
      ]
    },
    {
      id: 'py-3-4-ex5',
      type: 'exercise',
      title: 'Challenge: unique names before and after cleaning',
      body: `<p>Both patterns are stored for you. Clean the <code>customer_name</code> column by removing the title and then the suffix. Print two numbers, each on its own line: first the number of different names <b>before</b> cleaning, then <b>after</b>. You should see <code>1976</code> and then <code>1973</code>.</p>
<p><b>Think before you type:</b> <code>.nunique()</code> counts different values. Use it on the original column for the first number, and on the cleaned column for the second.</p>`,
      starter: `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\ntitle = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "\nsuffix = r" (MD|PhD|DDS|DVM|Jr\\.|II|III|IV)$"\n\n# Write your code below\n`,
      hints: [
        `Build clean = customers["customer_name"].str.replace(title, "", regex=True).str.replace(suffix, "", regex=True). Then print customers["customer_name"].nunique() and clean.nunique().`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\ntitle = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "\nsuffix = r" (MD|PhD|DDS|DVM|Jr\\.|II|III|IV)$"\nclean = customers["customer_name"].str.replace(title, "", regex=True).str.replace(suffix, "", regex=True)\nprint(customers["customer_name"].nunique())\nprint(clean.nunique())`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\ntitle = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "\nsuffix = r" (MD|PhD|DDS|DVM|Jr\\.|II|III|IV)$"\nclean = customers["customer_name"].str.replace(title, "", regex=True).str.replace(suffix, "", regex=True)\nprint(customers["customer_name"].nunique())\nprint(clean.nunique())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>Text is where messy data lives, and you now have a method for it. You can:</p>
<ul>
<li>Explain why “Ghana” and “GHANA” count as different values, and fix it with <code>.str.strip()</code>, <code>.str.lower()</code> and <code>.str.title()</code></li>
<li>Open the <code>.str</code> drawer for <code>replace</code>, <code>contains</code>, <code>split</code> and <code>len</code>, and recognise the AttributeError you get when you forget it</li>
<li>Search with <code>contains</code>, handling capitals with <code>case=False</code> and missing values with <code>na=False</code></li>
<li>Cut text apart with <code>split</code> and pick a piece with <code>.str[1]</code>, to extract the domain from every email</li>
<li>Read and write simple patterns using <code>^</code>, <code>$</code>, <code>|</code>, <code>( )</code> and <code>\\.</code>, and remove titles and suffixes with <code>replace(..., regex=True)</code></li>
<li>Treat matches after cleaning as leads to investigate, not proof to act on</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>How would you standardise a column of text categories that has inconsistent spelling and capitals?</li>
<li>What is a regular expression, and what should you watch out for when using one?</li>
<li>Why do you need <code>.str</code>, and what does <code>na=False</code> do in <code>contains</code>?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I first look at the distinct values with <code>value_counts()</code> to see the variants. Then I trim spaces with <code>.str.strip()</code> and set one case with <code>.str.lower()</code> or <code>.str.title()</code>. If some labels still differ, I map them to one agreed spelling with <code>replace</code>. Afterwards I run <code>value_counts()</code> again to confirm the variants have merged, and I record the rules I used.</p>
<p><b>2.</b> A regular expression is a compact pattern language for describing text, for example “a title at the start of a name”. The risk is that a pattern can match more than intended, so I count how many values change, look at before and after examples, and anchor the pattern with <code>^</code> or <code>$</code> when position matters.</p>
<p><b>3.</b> A Pandas column does not have text methods itself, so they live under <code>.str</code> and apply to every value in the column. In <code>contains</code>, a missing value returns NaN, which cannot be used as a True/False filter, so <code>na=False</code> treats missing values as “does not contain”.</p>
</details>
<p><b>Coming next, in lesson 3.5:</b> validation. You have fixed missing values, data types, duplicates and messy text. But how do you <i>prove</i> the data is ready? You will write automatic checks, the way an engineer tests a bridge before opening it: unique IDs that really are unique, amounts inside a sensible range, orders that point to customers who exist, and a final validation report. Then you will assemble the cleaned dataset that the rest of this track builds on.</p>`
    }
  ]
}
);
