LESSONS.push(
{
  id: 'st-1-3',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'matplotlib'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: `import pandas as pd
import numpy as np

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
products = pd.read_csv("products.csv")
payments = pd.read_csv("payments.csv")
deliveries = pd.read_csv("deliveries.csv")
order_items = pd.read_csv("order_items.csv")

deliveries["transit_days"] = (pd.to_datetime(deliveries["delivery_date"]) - pd.to_datetime(deliveries["dispatch_date"])).dt.days

master = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")
master = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")
master = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
master["line_total"] = master["quantity"] * master["unit_price"]
master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")
master["order_year"] = master["order_date"].dt.year
`,
  preloaded: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items', 'master'],
  title: '1.3 Shape, skew and outliers',
  tables: [],
  intro: `The finance director comes to your desk with a printout and a worried look. <i>“There is an order here worth 1,071,796. That is nearly seven times a typical order. Is that a typo? Should we take it out of the figures?”</i><br><br>Your first instinct might be to answer from the number alone. A better instinct is the one you are about to build: look at the <b>shape</b> of the data, decide what “unusual” should mean for data of that shape, and then <b>investigate</b> before you delete anything.<br><br>In this lesson you will learn to describe the shape of a column, measure how lopsided it is, spot outliers with two standard rules, and decide what to do about them without fooling yourself. You will also meet the logarithm, a simple way to tame a long tail. The TradeFlow tables are loaded, as before.`,
  steps: [
    {
      type: 'explain',
      title: 'Shape: the third thing about any column',
      body: `<p>In the last lesson you learned two ways to describe a column of numbers: where its <b>middle</b> is, and how <b>spread out</b> it is. There is a third thing that matters just as much, and it is the easiest of the three to see: its <b>shape</b>.</p>
<p>Imagine you could pour all the values of a column into a pile, like sand, with the small values on the left and the big values on the right. The <b>shape of the pile</b> is the shape of the data. That picture is exactly what a histogram draws. Piles come in a few common forms:</p>
<table class="mini">
<tr><th>Shape</th><th>What the pile looks like</th><th>Where the mean and median sit</th><th>At TradeFlow</th></tr>
<tr><td><b>Symmetric</b></td><td>The same shape on both sides of the middle, often a hill</td><td>Together, in the middle</td><td>Monthly revenue (only 42 months, so the pile looks lumpy)</td></tr>
<tr><td><b>Right-skewed</b></td><td>A hill on the left with a long thin tail stretching to the right</td><td>Mean is to the right of the median</td><td>Order value, unit price</td></tr>
<tr><td><b>Left-skewed</b></td><td>A hill on the right with a long thin tail stretching to the left</td><td>Mean is to the left of the median</td><td>(not common in sales data)</td></tr>
<tr><td><b>Flat</b></td><td>A table-top, every value about equally common</td><td>Together, in the middle</td><td>Delivery time (1 to 10 days), quantity (1 to 5)</td></tr>
</table>
<p>The word <b>skew</b> simply means “lopsided”, and the side it names is the side of the <b>long tail</b>, not the side of the hill. A “right-skewed” column has its tail on the right: a few unusually large values.</p>
<p>Why does the shape matter so much? Because almost every statistical tool has a hidden assumption about it.</p>
<ul>
<li>The <b>mean and standard deviation</b> describe a symmetric pile well, and mislead on a lopsided one, as you saw in lesson 1.2.</li>
<li>Many of the <b>tests</b> you will meet later, such as the t-test, work best when the data is roughly bell-shaped, or when you have a lot of it.</li>
<li>A <b>rule for spotting outliers</b> that works on a bell shape can raise hundreds of false alarms on a tail.</li>
</ul>
<p>So the habit to build is simple: <b>before you summarise or test a column, look at its shape.</b> It takes one line of code and saves you from quietly using a tool on data it was not made for.</p>
<div class="callout analogy"><b>The shapes of a hill.</b> A symmetric column is a hill equally steep on both sides. A right-skewed column is a hill with a long gentle slope trailing away on one side, like a ski run. A flat column is a plateau. Describing which one you are standing on tells a stranger more than any single number.</div>
<div class="callout tip"><b>Mean against median is a quick hint.</b> If the mean is clearly larger than the median, the column is right-skewed. If it is clearly smaller, the column is left-skewed. If they are about equal, the column is probably symmetric. You still draw the histogram to be sure.</div>`
    },
    {
      type: 'try',
      title: 'Three columns, three shapes',
      body: `<p>Three histograms side by side. On the left is the value of each order. In the middle is how long each delivery took. On the right is each month’s revenue. The code is the histogram call you already know, repeated three times.</p>
<p>Look at the shapes before you read anything else. <b>Order value</b> is a tall hump on the left with a long thin tail stretching far to the right: right-skewed. <b>Delivery time</b> is a flat table-top, because each of the 10 days is about equally common. <b>Monthly revenue</b> is the most balanced: it has no long tail on either side. With only 42 months the bars look lumpy, because a small pile of data never makes a smooth hill. Three different columns of the same business, and three quite different piles. The first chart of a session loads slowly, so be patient.</p>`,
      code: `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

amount = payments["amount"] / 1000
transit = deliveries["transit_days"].dropna()
monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000

fig, axes = plt.subplots(1, 3, figsize=(13, 4))
axes[0].hist(amount, bins=30, edgecolor="#0f2744")
axes[0].set_title("Order value: long tail to the right")
axes[0].set_xlabel("Order value (thousands)")
axes[1].hist(transit, bins=np.arange(0.5, 11.5, 1), edgecolor="#0f2744")
axes[1].set_title("Delivery time: flat")
axes[1].set_xlabel("Days")
axes[2].hist(monthly, bins=10, edgecolor="#0f2744")
axes[2].set_title("Monthly revenue: balanced, no tail")
axes[2].set_xlabel("Revenue (millions)")
for ax in axes:
    ax.set_ylabel("Count")
plt.tight_layout()
`
    },
    {
      type: 'explain',
      title: 'Putting a number on the shape',
      body: `<p>A picture is the best way to see a shape, but sometimes you need a number: to compare many columns at once, or to put in a report. Statisticians have two simple ones.</p>
<p><b>Skewness</b> measures how lopsided the pile is. Read it like a pointer on a dial:</p>
<ul>
<li><b>Near 0</b> means symmetric. The two sides balance.</li>
<li><b>Positive</b> means a tail to the <b>right</b> (right-skewed).</li>
<li><b>Negative</b> means a tail to the <b>left</b> (left-skewed).</li>
</ul>
<p>As a rough guide, a skewness between -0.5 and +0.5 is “close enough to symmetric”, from 0.5 to 1 is moderately lopsided, and beyond 1 is strongly lopsided. These cut-offs are habits, not laws, but they keep your descriptions consistent. In Pandas it is one word: <code>column.skew()</code>.</p>
<p><b>Kurtosis</b> measures something different: how <b>heavy the tails</b> are, compared with a bell curve. Do not let the name frighten you. Think of it as “how many extreme values does this column produce?” Pandas reports it as a number centred on a bell curve, so that:</p>
<ul>
<li><b>Near 0</b> means tails like a bell curve.</li>
<li><b>Positive</b> means <b>heavier tails</b>: more extreme values than a bell curve would give.</li>
<li><b>Negative</b> means <b>lighter tails</b>, and usually a flatter shape. A flat table-top has no extreme values at all, because everything stops at the edge.</li>
</ul>
<p>In Pandas it is <code>column.kurt()</code>.</p>
<p>For TradeFlow, the numbers match the pictures from the last card:</p>
<table class="mini">
<tr><th>Column</th><th>Skewness</th><th>Kurtosis</th><th>Reading</th></tr>
<tr><td>Order value</td><td><b>1.39</b></td><td>2.55</td><td>Strongly right-skewed, with heavy tails</td></tr>
<tr><td>Delivery time</td><td>-0.01</td><td>-1.22</td><td>Symmetric but flat</td></tr>
<tr><td>Monthly revenue</td><td>0.06</td><td>-1.13</td><td>Symmetric</td></tr>
</table>
<p>Notice what each number tells you that the mean and standard deviation could not. Order value and delivery time both have a big standard deviation, yet one is a tail and the other is a plateau, and the skewness says so immediately.</p>
<div class="callout watch"><b>With little data, shape numbers wobble.</b> Monthly revenue has only 42 values, so its skewness and kurtosis are rough. Always look at the histogram as well, and be modest about conclusions from small columns.</div>`
    },
    {
      type: 'try',
      title: 'Skewness and kurtosis of five columns',
      body: `<p>The code loops over five columns, puts each one’s skewness and kurtosis in a row, and builds a table from the rows, the same loop-and-table pattern you used in Module 8 of the Python track.</p>
<p>Read it row by row. <b>Order value</b> (1.39 and 2.55) and <b>unit price</b> (1.35 and 1.46) are right-skewed with heavy tails. <b>Quantity</b> (-0.01 and -1.31) and <b>delivery days</b> (-0.01 and -1.22) are symmetric and flat, as you would expect from numbers spread evenly over a short range. <b>Monthly revenue</b> (0.06) is close to symmetric. One glance at a table replaces five separate histograms.</p>`,
      code: `import pandas as pd

monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum()

columns = {
    "order value": payments["amount"],
    "unit price": master["unit_price"],
    "quantity": master["quantity"],
    "delivery days": deliveries["transit_days"].dropna(),
    "monthly revenue": monthly,
}

rows = []
for name, values in columns.items():
    rows.append({"column": name, "skew": round(values.skew(), 2), "kurtosis": round(values.kurt(), 2)})

print(pd.DataFrame(rows))
`
    },
    {
      id: 'st-1-3-ex1',
      type: 'exercise',
      title: 'Your turn: how lopsided are three columns?',
      body: `<p>The starter gives you <code>amount</code> (the value of each order) and <code>transit</code> (the delivery time in days). Print the <b>skewness</b> of <code>amount</code>, of <code>transit</code>, and of the <b>quantity</b> column of the master table, in that order, each rounded to 2 decimals.</p>
<p>You should see <code>1.39</code>, <code>-0.01</code> and <code>-0.01</code>. One strongly lopsided column and two symmetric ones.</p>
<p><b>Think before you type:</b> every column has a <code>.skew()</code> method. The quantity column is <code>master["quantity"]</code>.</p>`,
      starter: `import pandas as pd\n\namount = payments["amount"]\ntransit = deliveries["transit_days"].dropna()\n\n# Write your code below\n`,
      hints: [
        `print(round(amount.skew(), 2)), print(round(transit.skew(), 2)) and print(round(master["quantity"].skew(), 2)).`,
        `import pandas as pd\n\namount = payments["amount"]\ntransit = deliveries["transit_days"].dropna()\n\nprint(round(amount.skew(), 2))\nprint(round(transit.skew(), 2))\nprint(round(master["quantity"].skew(), 2))\n`
      ],
      solution: `import pandas as pd\n\namount = payments["amount"]\ntransit = deliveries["transit_days"].dropna()\n\nprint(round(amount.skew(), 2))\nprint(round(transit.skew(), 2))\nprint(round(master["quantity"].skew(), 2))\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What is an outlier, and how do we spot one?',
      body: `<p>An <b>outlier</b> is a value that sits far away from the rest of the data. The finance director has noticed one at TradeFlow: <i>“There is an order worth 1,071,796. Is that a typo?”</i> To answer that, you first need a fair way to say what “far away” means. Two simple rules are in everyday use. Both are <b>screening tools</b>: they point at values worth a look. They do not say that a value is wrong.</p>
<p><b>Rule 1: the IQR fence.</b> You met the interquartile range (IQR) in lesson 1.2, the width of the middle half of the data. The fence rule says that a value is unusual if it lies more than <b>1.5 IQRs beyond the quartiles</b>:</p>
<ul>
<li><b>Upper fence</b> = Q3 + 1.5 times the IQR</li>
<li><b>Lower fence</b> = Q1 - 1.5 times the IQR</li>
</ul>
<p>Anything above the upper fence or below the lower fence is flagged. This is the rule behind the “whiskers” of a box plot. Because it is built from quartiles, it is not dragged around by the extreme values themselves, which makes it a good choice for lopsided data.</p>
<p><b>Rule 2: the z-score rule.</b> A <b>z-score</b> says how many standard deviations a value is away from the mean: subtract the mean, then divide by the standard deviation. A z-score of 3 means “three typical stray-distances above the average”. The rule flags values with a z-score beyond 3. It is easy to explain, but it leans on the mean and the standard deviation, which are themselves pulled by outliers, and it was designed for bell-shaped data.</p>
<table class="mini">
<tr><th>Rule</th><th>Built from</th><th>Best for</th><th>Weak spot</th></tr>
<tr><td><b>IQR fence</b></td><td>Quartiles</td><td>Skewed data, or data that already has outliers</td><td>On a long tail it flags many values that are simply part of the tail</td></tr>
<tr><td><b>z-score beyond 3</b></td><td>Mean and standard deviation</td><td>Roughly bell-shaped data</td><td>The outliers inflate the very numbers used to find them</td></tr>
</table>
<p>For TradeFlow’s order values the fences are about -141,059 and <b>430,586</b>. The lower fence is below zero, so nothing can fall under it, because no order has a negative value. Above the upper fence sit <b>328 orders</b>. The z-score rule flags values above about 505,700, and finds <b>128 orders</b>.</p>
<p>Why do the two rules disagree? Each has a different idea of “far”. Neither is correct in an absolute sense. That is the first lesson about outliers: <b>the answer depends on the rule you chose</b>, so say which rule you used.</p>
<p>Here is a second, deeper lesson. In a perfect bell curve, only about 0.13 percent of values lie more than 3 standard deviations above the mean. For 10,000 orders that would be about <b>13</b>. TradeFlow has <b>128</b>, ten times as many. That is the long tail doing its work, not a sign that 128 orders are mistakes. A tail makes rare big values <i>normal</i> for this kind of data.</p>
<div class="callout watch"><b>Flagged does not mean wrong.</b> Both rules only say “this is unusual compared with the rest”. A big customer placing a big order is unusual and perfectly real. Treat a flag as a question, never as a verdict.</div>`
    },
    {
      type: 'try',
      title: 'Two rules, two answers',
      body: `<p>The code works out the quartiles and the IQR, builds the upper fence, and counts the orders above it. It then builds z-scores for every order and counts those above 3.</p>
<p>The fence is <b>430,585.79</b>, and <b>328</b> orders (3.28 percent of all orders) lie above it. Together they bring in <b>10.6 percent</b> of all revenue. The z-score rule flags <b>128</b> orders, which are <b>4.8 percent</b> of revenue. These are not rare scraps: a few hundred orders carry a tenth of the money. That is a very good reason not to throw them away.</p>`,
      code: `import pandas as pd

amount = payments["amount"]

q1 = amount.quantile(0.25)
q3 = amount.quantile(0.75)
iqr = q3 - q1
upper_fence = q3 + 1.5 * iqr
by_fence = amount[amount > upper_fence]

z = (amount - amount.mean()) / amount.std()
by_z = amount[z > 3]

print(round(upper_fence, 2), len(by_fence), round(by_fence.sum() / amount.sum() * 100, 1))
print(len(by_z), round(by_z.sum() / amount.sum() * 100, 1))
`
    },
    {
      id: 'st-1-3-ex2',
      type: 'exercise',
      title: 'Your turn: the IQR fence',
      body: `<p>The starter gives you <code>amount</code>. Work out the <b>upper IQR fence</b> (the third quartile plus 1.5 times the IQR), then print two things: the fence rounded to 2 decimals, and the <b>number of orders above it</b>.</p>
<p>You should see <code>430585.79</code> and then <code>328</code>.</p>
<p><b>Think before you type:</b> first <code>q1 = amount.quantile(0.25)</code> and <code>q3 = amount.quantile(0.75)</code>. The IQR is <code>q3 - q1</code>. The fence is <code>q3 + 1.5 * iqr</code>. To count the values above it, <code>(amount &gt; fence).sum()</code> adds up the True results.</p>`,
      starter: `import pandas as pd\n\namount = payments["amount"]\n\n# Write your code below\n`,
      hints: [
        `q1 = amount.quantile(0.25), q3 = amount.quantile(0.75), iqr = q3 - q1, fence = q3 + 1.5 * iqr. Then print(round(fence, 2)) and print((amount > fence).sum()).`,
        `import pandas as pd\n\namount = payments["amount"]\n\nq1 = amount.quantile(0.25)\nq3 = amount.quantile(0.75)\niqr = q3 - q1\nfence = q3 + 1.5 * iqr\n\nprint(round(fence, 2))\nprint((amount > fence).sum())\n`
      ],
      solution: `import pandas as pd\n\namount = payments["amount"]\n\nq1 = amount.quantile(0.25)\nq3 = amount.quantile(0.75)\niqr = q3 - q1\nfence = q3 + 1.5 * iqr\n\nprint(round(fence, 2))\nprint((amount > fence).sum())\n`,
      ordered: true
    },
    {
      id: 'st-1-3-ex3',
      type: 'exercise',
      title: 'Your turn: the z-score rule',
      body: `<p>Using the same <code>amount</code> column, work out the <b>z-score</b> of every order (subtract the mean, divide by the standard deviation). Print the <b>number of orders with a z-score above 3</b>, and then the <b>percentage of all revenue</b> that those orders bring in, rounded to 1 decimal.</p>
<p>You should see <code>128</code> and then <code>4.8</code>.</p>
<p><b>Think before you type:</b> <code>z = (amount - amount.mean()) / amount.std()</code>. The flagged orders are <code>amount[z &gt; 3]</code>. Their share of revenue is their sum divided by the sum of all amounts, times 100.</p>`,
      starter: `import pandas as pd\n\namount = payments["amount"]\n\n# Write your code below\n`,
      hints: [
        `z = (amount - amount.mean()) / amount.std(), flagged = amount[z > 3]. Then print(len(flagged)) and print(round(flagged.sum() / amount.sum() * 100, 1)).`,
        `import pandas as pd\n\namount = payments["amount"]\n\nz = (amount - amount.mean()) / amount.std()\nflagged = amount[z > 3]\n\nprint(len(flagged))\nprint(round(flagged.sum() / amount.sum() * 100, 1))\n`
      ],
      solution: `import pandas as pd\n\namount = payments["amount"]\n\nz = (amount - amount.mean()) / amount.std()\nflagged = amount[z > 3]\n\nprint(len(flagged))\nprint(round(flagged.sum() / amount.sum() * 100, 1))\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Investigate first, decide second',
      body: `<p>Now back to the finance director’s question: is the 1,071,796 order a typo? The temptation is to answer from the number alone: “that is nearly seven times the typical order, so it must be a mistake”. A good analyst does not guess. A good analyst <b>investigates</b>.</p>
<p>Here is a simple checklist to run on any suspicious value:</p>
<ol>
<li><b>Is it possible?</b> A negative age, a delivery before the order, or a quantity of 4,000 when the maximum is 5 are impossible. Those are errors.</li>
<li><b>Does it add up?</b> At TradeFlow every order’s payment equals the sum of its lines, to the cent. If the lines support the total, nothing is mistyped.</li>
<li><b>Does the story make sense?</b> Look at what is in the order, who placed it and when. Is the product expensive? Are there many units?</li>
<li><b>Does it behave like the rest of its group?</b> A value that is odd for a customer but ordinary for the product it contains is probably real.</li>
</ol>
<p>Every suspicious value then falls into one of three boxes, and each box has a different action:</p>
<table class="mini">
<tr><th>Verdict</th><th>Example</th><th>What to do</th></tr>
<tr><td><b>An error</b></td><td>A price typed with an extra zero</td><td>Correct it if you can find the true value. Otherwise exclude it, and write down that you did</td></tr>
<tr><td><b>Real but extreme</b></td><td>A big customer buying a lot of expensive items</td><td>Keep it. It is part of the business</td></tr>
<tr><td><b>A different kind of case</b></td><td>A one-off wholesale deal that will never repeat</td><td>Keep it in the totals, but consider reporting it separately</td></tr>
</table>
<p>For the big order, the checklist is easy to run. Order 622 is worth 1,071,796.61. It has five lines and 17 units. Almost all of it, <b>1,021,677</b>, comes from Electronics, the most expensive category, and the rest is Fashion. It was Completed, for a Kenyan customer. Every part of it is possible and consistent. This is <b>real but extreme</b>: a big basket of costly items, not a typo.</p>
<p>When you are unsure whether to keep unusual values, there is a safe habit called a <b>sensitivity check</b>: do the analysis <b>both ways</b>, with the values and without them, and report both. If the answer barely changes, the question is settled. If it flips, you have learned that your conclusion rests on a handful of orders, and your reader needs to know.</p>
<div class="callout watch"><b>Never delete a value only because it is large.</b> Deleting inconvenient data to get tidier numbers is one of the most common ways analysts fool themselves and others. Whatever you decide, write it down.</div>
<div class="callout tip"><b>The detective question.</b> Ask “what would have to be true for this value to be real?” If you can answer it, check whether it is. If you cannot, you may have found an error.</div>`
    },
    {
      type: 'try',
      title: 'The biggest order, line by line',
      body: `<p>The code finds the order with the largest payment, using <code>idxmax()</code>, which returns the position of the biggest value. It then pulls out that order’s lines from the master table.</p>
<p>Read the table of lines. There are <b>five</b> lines, adding up to <b>1,071,796.61</b>, which is exactly the payment. The four Electronics lines are worth <b>1,021,677</b> between them, and a single Fashion line adds the rest. The order was Completed, for a customer in Kenya. A real basket of expensive goods, so it stays.</p>`,
      code: `import pandas as pd

top = payments.loc[payments["amount"].idxmax()]
lines = master[master["order_id"] == top["order_id"]]

print(round(top["amount"], 2))
print(lines[["category", "product_name", "quantity", "unit_price", "line_total"]])
print(lines.groupby("category")["line_total"].sum().round(0))
print(lines["order_status"].iloc[0], lines["country"].iloc[0])
`
    },
    {
      id: 'st-1-3-ex4',
      type: 'exercise',
      title: 'Your turn: investigate the biggest order',
      body: `<p>Do the investigation yourself. Find the order with the <b>largest payment</b>, pick out its lines from the master table, and print three facts, each on its own line: the payment rounded to 2 decimals, the <b>number of lines</b> in the order, and the <b>total units</b> (the sum of the quantities).</p>
<p>You should see <code>1071796.61</code>, <code>5</code> and <code>17</code>.</p>
<p><b>Think before you type:</b> <code>payments["amount"].idxmax()</code> gives the position of the largest payment, and <code>payments.loc[...]</code> turns that position into the row. The lines of that order are <code>master[master["order_id"] == top["order_id"]]</code>. <code>len(lines)</code> counts them.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `top = payments.loc[payments["amount"].idxmax()], lines = master[master["order_id"] == top["order_id"]]. Then print(round(top["amount"], 2)), print(len(lines)) and print(lines["quantity"].sum()).`,
        `import pandas as pd\n\ntop = payments.loc[payments["amount"].idxmax()]\nlines = master[master["order_id"] == top["order_id"]]\n\nprint(round(top["amount"], 2))\nprint(len(lines))\nprint(lines["quantity"].sum())\n`
      ],
      solution: `import pandas as pd\n\ntop = payments.loc[payments["amount"].idxmax()]\nlines = master[master["order_id"] == top["order_id"]]\n\nprint(round(top["amount"], 2))\nprint(len(lines))\nprint(lines["quantity"].sum())\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Taming a long tail with a logarithm',
      body: `<p>A long tail makes life awkward. It drags the mean, inflates the standard deviation, and floods the outlier rules with false alarms. A common remedy is to change the <b>scale</b> you measure on, using a <b>logarithm</b>, or <b>log</b> for short.</p>
<p>You do not need to remember any school maths to use it. Here is the idea in plain words. On the normal scale, the gap between 10,000 and 20,000 is 10,000, and the gap between 500,000 and 510,000 is also 10,000, so the two gaps count the same. But in real life, <b>doubling</b> an order from 10,000 to 20,000 is a bigger deal than adding 10,000 to half a million. The log scale agrees: it measures <b>how many times bigger</b> instead of <b>how much bigger</b>.</p>
<p>On the log scale, every doubling adds the same fixed amount (about 0.69):</p>
<table class="mini">
<tr><th>Order value</th><th>Its log</th><th>Step from the one above</th></tr>
<tr><td>10,000</td><td>9.21</td><td>-</td></tr>
<tr><td>20,000 (doubled)</td><td>9.90</td><td>+0.69</td></tr>
<tr><td>40,000 (doubled again)</td><td>10.60</td><td>+0.69</td></tr>
<tr><td>80,000 (and again)</td><td>11.29</td><td>+0.69</td></tr>
</table>
<p>The effect is to <b>squeeze the long tail</b>: huge values come in and the small values spread out. In NumPy it is one function, <code>np.log(column)</code>. For TradeFlow, the skewness of order value drops from <b>1.39</b> to <b>-0.62</b>. It is much closer to symmetric, although it has now tipped slightly the other way, with a small tail on the left.</p>
<p>That tilt matters for outliers too. Run the IQR fence rule on the <b>logged</b> values and the verdict changes completely. Nothing is flagged on the high side at all, so the 328 “big orders” are no longer outliers. Instead <b>131 small orders</b>, below about 14,472, are flagged on the low side. The same data, a different scale, a different set of “outliers”.</p>
<p>Take that lesson seriously. Whether a value counts as an outlier depends on <b>the scale, the rule and the question</b>. The log scale is not “the truth”. It is a different view, useful when you care about <b>percentage differences</b> rather than raw amounts, and when a long tail is getting in the way of a method that likes symmetric data.</p>
<div class="callout watch"><b>Remember what you measured.</b> A number on the log scale is not in currency any more. A mean of log values is not the mean order. When you report results from a log scale, translate them back into plain terms for your reader.</div>
<div class="callout analogy"><b>The spirit level and the magnifying glass.</b> A log scale is like a magnifying glass that makes small things bigger and shrinks giants. It helps you see small values in detail, but you must never forget that you are looking through the glass.</div>`
    },
    {
      type: 'try',
      title: 'Before and after the logarithm',
      body: `<p>Two histograms of the same 10,000 orders. On the left are the plain values, with the long tail you already know. On the right are their <b>logs</b>.</p>
<p>The tail has gone. The right-hand picture is a nearly symmetric hump, a little longer on the left than on the right. This is the same data, only measured by “how many times bigger” instead of “how much bigger”. If a method needs a bell-like shape, the log version is far kinder to it.</p>`,
      code: `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

amount = payments["amount"]

fig, axes = plt.subplots(1, 2, figsize=(11, 4))
axes[0].hist(amount / 1000, bins=30, edgecolor="#0f2744")
axes[0].set_title("Order value (skewness 1.39)")
axes[0].set_xlabel("Order value (thousands)")
axes[1].hist(np.log(amount), bins=30, edgecolor="#0f2744")
axes[1].set_title("Log of order value (skewness -0.62)")
axes[1].set_xlabel("Log of order value")
for ax in axes:
    ax.set_ylabel("Number of orders")
plt.tight_layout()
`
    },
    {
      id: 'st-1-3-ex5',
      type: 'exercise',
      title: 'Challenge: outliers on the log scale',
      body: `<p>The starter gives you <code>amount</code> and NumPy. Take the <b>log</b> of every order value, then print two things: the <b>skewness</b> of the logged values rounded to 2 decimals, and the <b>number of logged values below the lower IQR fence</b> (the first quartile minus 1.5 times the IQR, all computed on the logged values).</p>
<p>You should see <code>-0.62</code> and then <code>131</code>.</p>
<p><b>Think before you type:</b> <code>logged = np.log(amount)</code>. Then the same recipe as the earlier exercise, applied to <code>logged</code>: quartiles, IQR, and this time the <b>lower</b> fence <code>q1 - 1.5 * iqr</code>. <code>(logged &lt; fence).sum()</code> counts the values below it.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\namount = payments["amount"]\n\n# Write your code below\n`,
      hints: [
        `logged = np.log(amount). q1 = logged.quantile(0.25), q3 = logged.quantile(0.75), iqr = q3 - q1, fence = q1 - 1.5 * iqr. Then print(round(logged.skew(), 2)) and print((logged < fence).sum()).`,
        `import numpy as np\nimport pandas as pd\n\namount = payments["amount"]\n\nlogged = np.log(amount)\nq1 = logged.quantile(0.25)\nq3 = logged.quantile(0.75)\niqr = q3 - q1\nfence = q1 - 1.5 * iqr\n\nprint(round(logged.skew(), 2))\nprint((logged < fence).sum())\n`
      ],
      solution: `import numpy as np\nimport pandas as pd\n\namount = payments["amount"]\n\nlogged = np.log(amount)\nq1 = logged.quantile(0.25)\nq3 = logged.quantile(0.75)\niqr = q3 - q1\nfence = q1 - 1.5 * iqr\n\nprint(round(logged.skew(), 2))\nprint((logged < fence).sum())\n`,
      ordered: true
    },
    {
      id: 'st-1-3-c1',
      type: 'check',
      title: 'Order values have a skewness of 1.39 and delivery times have a skewness of -0.01. What does that tell you?',
      body: `<p>Think about what a skewness near zero means, and what a large positive one means.</p>`,
      options: [
        'Delivery times are the more spread out of the two',
        'Order values are lopsided with a long tail of large values on the right, while delivery times are roughly symmetric',
        'Order values are symmetric and delivery times have a long tail',
        'The two columns have the same shape'
      ],
      answer: 1,
      why: [
        'Skewness is not a measure of spread. It measures lopsidedness. Spread is the job of the standard deviation or the IQR.',
        'Right! A large positive skewness (1.39) means a long tail on the right, a few unusually big orders. A value near zero (-0.01) means the two sides balance, as with delivery times.',
        'It is the other way round. Order values are the lopsided column, and delivery times are the symmetric one.',
        'The values are very different, and so are the histograms: one has a long tail, and the other is a flat, balanced table-top.'
      ]
    },
    {
      id: 'st-1-3-c2',
      type: 'check',
      title: 'An order is worth 7 times the median order, and both outlier rules flag it. What is the best first step?',
      body: `<p>Think about what a flag really tells you.</p>`,
      options: [
        'Delete it, because outliers always distort the results',
        'Investigate it: check that it is possible and that its lines add up, and if it is real, keep it and consider reporting results with and without it',
        'Ignore it, because outlier rules are always wrong',
        'Replace it with the median so the data looks tidier'
      ],
      answer: 1,
      why: [
        'Outliers do not always distort results, and many are real and important. Deleting them without checking can remove a real part of the business.',
        'Right! A flag is a question, not a verdict. Check whether the value is possible and consistent. If it is real, keep it, and a with-and-without comparison shows how much your conclusion depends on it.',
        'The rules are useful screening tools. They are not always wrong. They are only not the final word.',
        'Replacing a real value with the median invents data. It hides the real behaviour of the business and breaks totals.'
      ]
    },
    {
      id: 'st-1-3-c3',
      type: 'check',
      title: 'On the plain scale the IQR rule flags 328 big orders. On the log scale it flags no big orders, but flags 131 small ones. What does this teach you?',
      body: `<p>The data did not change between the two views. Only the scale did.</p>`,
      options: [
        'One of the two calculations must be wrong',
        'Whether a value counts as an outlier depends on the scale and the rule you use, so the flags are prompts to look closer, not facts about the data',
        'The log scale is the truth and the plain scale is wrong',
        'Outliers do not really exist'
      ],
      answer: 1,
      why: [
        'Both calculations are correct. They simply look at the data through different scales.',
        'Right! On a log scale, distance means “how many times bigger”, so a giant order stops looking extreme while a very small order starts to. Neither view is the truth. Always say which rule and scale you used.',
        'The log scale is a different view that helps with some questions, such as percentage differences. It does not replace the plain scale.',
        'Outliers exist, in the sense that some values are far from the rest. The point is that “far” depends on how you measure it.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You can now look at a column the way a statistician does, with the three questions together: where is it, how spread out is it, and what shape is it? You can:</p>
<ul>
<li>Recognise the common <b>shapes</b>: symmetric, right-skewed, left-skewed and flat, and say what each means for the mean and the median</li>
<li>Measure shape with <b>skewness</b> (lopsidedness) and <b>kurtosis</b> (tail weight), and read both in plain words</li>
<li>Find outliers with the <b>IQR fence</b> and the <b>z-score</b> rule, and explain why they can disagree</li>
<li>Treat a flagged value as a <b>question, not a verdict</b>, and investigate whether it is an error, real but extreme, or a different kind of case</li>
<li>Run a <b>sensitivity check</b>: report results with and without the unusual values</li>
<li>Use a <b>logarithm</b> to tame a long tail, and explain that the outliers change when the scale changes</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What does skewness tell you, and what would you do with a strongly skewed variable?</li>
<li>How do you find outliers, and what do you do when you find them?</li>
<li>A manager says an order “must be an error” because it is seven times the typical order. How do you respond?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Skewness measures how lopsided a distribution is. A positive value means a long tail to the right, and a negative value a tail to the left. With a strongly skewed variable I would report the median and the interquartile range alongside, or instead of, the mean and standard deviation. If a method needs symmetric data, I might use a log transformation, and I would translate any result back into plain terms for my reader.</p>
<p><b>2.</b> I screen with a rule, usually the IQR fence for skewed data or a z-score rule for bell-shaped data, and I state which one I used. A flagged value is a question, so I then check whether it is possible, whether it ties out to its parts, and whether the story makes sense. If it is an error I correct or exclude it and document that. If it is real, I keep it, and I check how much my conclusions change with and without it.</p>
<p><b>3.</b> I would say that being large is not enough to call it an error, and that I will check. Then I would look at the order’s lines, whether the payment matches their total, and whether the products and quantities are plausible. If it is a big basket of expensive items, such as 17 units of mostly Electronics, it is a real order. I would keep it, and I would show the manager the result with and without it.</p>
</details>
<p><b>Coming next, in lesson 1.4:</b> populations, samples and bias. So far you have described all the data you have. But most of the time in real work you only see a <b>sample</b>, a small part of a bigger picture, and you want to say something about the whole. The next lesson shows, with simulations you can run yourself, how much a sample can be trusted, how that depends on its size, and how to avoid the sneakiest trap of all: a sample that is biased.</p>`
    }
  ]
},
{
  id: 'st-1-4',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'matplotlib'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: `import pandas as pd
import numpy as np

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
products = pd.read_csv("products.csv")
payments = pd.read_csv("payments.csv")
deliveries = pd.read_csv("deliveries.csv")
order_items = pd.read_csv("order_items.csv")

deliveries["transit_days"] = (pd.to_datetime(deliveries["delivery_date"]) - pd.to_datetime(deliveries["dispatch_date"])).dt.days

master = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")
master = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")
master = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
master["line_total"] = master["quantity"] * master["unit_price"]
master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")
master["order_year"] = master["order_date"].dt.year
`,
  preloaded: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items', 'master'],
  title: '1.4 Populations, samples and bias',
  tables: [],
  intro: `The marketing manager has a practical worry. <i>“We cannot check every order, and we cannot survey every customer. If I look at only 200, can I trust the average I find? And what if I only look at the big ones, because they are quicker to find?”</i><br><br>Those two questions are the heart of this lesson, and they are some of the most important questions in all of data work. The first is about <b>luck</b>: how much does a small sample wobble? The second is about something sneakier, called <b>bias</b>: a sample can be wrong in a way that no amount of extra data will repair.<br><br>You will explore both with simulations you can run yourself. TradeFlow’s 10,000 orders will be the whole population, so you will know the true answer and can measure exactly how far each sample strays. This is the last lesson of Module 1.`,
  steps: [
    {
      type: 'explain',
      title: 'The whole pot and the spoonful',
      body: `<p>Picture a big pot of soup. You want to know whether it needs more salt. You do not drink the whole pot. You stir it, take <b>one spoonful</b>, taste it, and decide. If the spoonful tastes right, you assume the pot does.</p>
<p>That is the whole idea of this lesson, and of a large part of statistics. It has a few names worth learning, because you will use them for the rest of your career:</p>
<table class="mini">
<tr><th>Word</th><th>Plain meaning</th><th>In the soup</th><th>At TradeFlow</th></tr>
<tr><td><b>Population</b></td><td>Everything you want to know about</td><td>The whole pot</td><td>All 10,000 orders</td></tr>
<tr><td><b>Sample</b></td><td>The part you actually look at</td><td>The spoonful</td><td>The 200 orders you check</td></tr>
<tr><td><b>Parameter</b></td><td>The true value for the whole population, which is usually unknown</td><td>The real saltiness of the pot</td><td>The true average order value</td></tr>
<tr><td><b>Statistic</b></td><td>The value you work out from the sample, used as an estimate of the parameter</td><td>The saltiness of the spoonful</td><td>The average of your 200 orders</td></tr>
</table>
<p>Why would anyone settle for a sample? Because the whole population is often impossible, too slow or too expensive to examine. A survey cannot ask every customer. An auditor cannot check every invoice. A factory cannot test every item if the test destroys it.</p>
<p>In this lesson we will do something you can almost never do in real life. TradeFlow’s 10,000 orders will be our whole “pot”, so <b>we know the true answer</b>: the real average order value is <b>158,198.15</b>. We will then pretend we could only look at a small sample, and see how well the sample finds the truth. Because we know the truth, we can measure exactly how far off each sample is. In real work you never know the true answer, and that is exactly why you need to understand how samples behave.</p>
<p>One honest note. In real life, TradeFlow’s past 10,000 orders are also a sample, of a business that keeps trading. If you want to predict next year, the orders so far are a <b>sample of the process</b>, not the whole of it. The same ideas apply.</p>
<div class="callout analogy"><b>Stir before you taste.</b> The spoonful only tells you about the pot if the soup is well mixed. If the salt is all at the bottom and you skim the top, your spoonful lies to you. Much of this lesson is about how to stir properly, which statisticians call <b>random sampling</b>.</div>`
    },
    {
      type: 'try',
      title: 'One sample against the truth',
      body: `<p>The code takes a <b>random sample of 200 orders</b> from the 10,000. <code>rng.choice(amount, size=200, replace=False)</code> means “pick 200 different orders at random”. The <code>replace=False</code> says that an order cannot be picked twice. The seed 42 makes the pick repeatable.</p>
<p>It prints three things: the true average (<b>158,198.15</b>), the average of the sample (<b>158,240.46</b>) and the difference (<b>42.32</b>). The sample landed within 42 of the truth, which is remarkably close. But hold on to your hat: this is one sample, and it was a lucky one. The next card shows why you cannot count on that.</p>`,
      code: `import numpy as np

amount = payments["amount"].values

rng = np.random.default_rng(42)
sample = rng.choice(amount, size=200, replace=False)

print(round(amount.mean(), 2))
print(round(sample.mean(), 2))
print(round(sample.mean() - amount.mean(), 2))
`
    },
    {
      type: 'explain',
      title: 'Another sample, another answer',
      body: `<p>Imagine a colleague takes <b>another</b> random sample of 200 orders, and works out the average. Will she get 158,240.46 too? Almost certainly not. A different random draw picks different orders, so it gives a different average. And a third colleague gets a third answer.</p>
<p>This difference between samples is called <b>sampling error</b>. The word “error” is unfortunate, because nobody has made a mistake. It simply means “the difference between what the sample says and what is true, caused purely by which items happened to be picked”. It is the luck of the draw, and it is not a fault in the method. Every honest sample has it.</p>
<p>Here is the key idea that makes the whole subject work. Although each sample gives a different answer, <b>the answers are not random in a wild way</b>. If you took thousands of samples and wrote down each average, you would see them pile up in a hill. The hill would be centred on the true value, and it would have a certain width. That hill has a name, the <b>sampling distribution</b>, and its width tells you how far off a typical sample is likely to be.</p>
<p>You will build this hill yourself with a loop, taking 1,000 samples. In real life you only ever get one sample, never the thousand. The beauty of statistics is that the thousand-sample picture lets you predict how wrong your one sample is likely to be, without ever repeating it. That is the topic of Module 4. For now, build the picture, because understanding it makes everything later feel natural.</p>
<div class="callout watch"><b>One sample is one throw of the dice.</b> A single sample can be lucky or unlucky, and you cannot tell which from inside it. This is why a statistic should always come with a sense of how far off it might be.</div>
<div class="callout tip"><b>Say it this way.</b> “The average order in our sample was 158 thousand” is a fact about the sample. “The average order is about 158 thousand, give or take a number” is a statement about the population, and that second form is what statistics lets you say honestly.</div>`
    },
    {
      type: 'try',
      title: 'A thousand samples of fifty',
      body: `<p>The loop takes <b>1,000 different random samples</b>, each of 50 orders, and stores the average of each. That gives 1,000 averages: 1,000 colleagues, each looking at 50 orders.</p>
<p>Read the four numbers. The average of the averages is <b>158,060.61</b>, almost exactly the truth (158,198.15). So samples are <b>right on average</b>. The spread of the averages is <b>17,017.56</b>, which is the typical miss. And individual samples ranged from about <b>105,315</b> to <b>218,304</b>: one unlucky colleague would have reported an average a third too low, and another almost 40 percent too high, both doing everything correctly. Finally, <b>95.6 percent</b> of the sample averages fell within two typical misses of the truth. Hold on to that last fact, because it is the seed of confidence intervals, in Module 4.</p>`,
      code: `import numpy as np

amount = payments["amount"].values

rng = np.random.default_rng(42)
means = np.empty(1000)
for i in range(1000):
    means[i] = rng.choice(amount, size=50, replace=False).mean()

print(round(means.mean(), 2))
print(round(means.std(ddof=1), 2))
print(int(means.min()), int(means.max()))
print(round(((means > amount.mean() - 2 * means.std(ddof=1)) & (means < amount.mean() + 2 * means.std(ddof=1))).mean() * 100, 1))
`
    },
    {
      id: 'st-1-4-ex1',
      type: 'exercise',
      title: 'Your turn: one sample against the truth',
      body: `<p>The starter gives you <code>amount</code>, all 10,000 order values as a NumPy array. Make a random generator with the seed <b>42</b>, take a <b>random sample of 200</b> orders without replacement, and print three numbers, each on its own line and each rounded to 2 decimals: the <b>true average</b>, the <b>sample average</b>, and the <b>difference</b> (sample minus true).</p>
<p>You should see <code>158198.15</code>, <code>158240.46</code> and <code>42.32</code>.</p>
<p><b>Think before you type:</b> <code>rng = np.random.default_rng(42)</code> and then <code>sample = rng.choice(amount, size=200, replace=False)</code>. A NumPy array has a <code>.mean()</code> method.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\n\n# Write your code below\n`,
      hints: [
        `rng = np.random.default_rng(42). sample = rng.choice(amount, size=200, replace=False). Then print(round(amount.mean(), 2)), print(round(sample.mean(), 2)) and print(round(sample.mean() - amount.mean(), 2)).`,
        `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\n\nrng = np.random.default_rng(42)\nsample = rng.choice(amount, size=200, replace=False)\n\nprint(round(amount.mean(), 2))\nprint(round(sample.mean(), 2))\nprint(round(sample.mean() - amount.mean(), 2))\n`
      ],
      solution: `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\n\nrng = np.random.default_rng(42)\nsample = rng.choice(amount, size=200, replace=False)\n\nprint(round(amount.mean(), 2))\nprint(round(sample.mean(), 2))\nprint(round(sample.mean() - amount.mean(), 2))\n`,
      ordered: true
    },
    {
      id: 'st-1-4-ex2',
      type: 'exercise',
      title: 'Your turn: build the hill of sample averages',
      body: `<p>Repeat the sampling <b>1,000 times</b>, each time taking a random sample of <b>50</b> orders and storing its average. Use a generator with the seed <b>42</b> and make it <b>once</b>, before the loop. Print two numbers: the <b>average of the 1,000 sample averages</b> and their <b>standard deviation</b> (with <code>ddof=1</code>), each rounded to 2 decimals.</p>
<p>You should see <code>158060.61</code> and then <code>17017.56</code>.</p>
<p><b>Think before you type:</b> make an empty array with <code>np.empty(1000)</code>. Loop <code>for i in range(1000):</code>. Inside the loop, <code>means[i] = rng.choice(amount, size=50, replace=False).mean()</code>. After the loop, <code>means.mean()</code> and <code>means.std(ddof=1)</code> give the two answers.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\n\n# Write your code below\n`,
      hints: [
        `rng = np.random.default_rng(42) and means = np.empty(1000). In the loop: means[i] = rng.choice(amount, size=50, replace=False).mean(). Then print(round(means.mean(), 2)) and print(round(means.std(ddof=1), 2)).`,
        `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\n\nrng = np.random.default_rng(42)\nmeans = np.empty(1000)\nfor i in range(1000):\n    means[i] = rng.choice(amount, size=50, replace=False).mean()\n\nprint(round(means.mean(), 2))\nprint(round(means.std(ddof=1), 2))\n`
      ],
      solution: `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\n\nrng = np.random.default_rng(42)\nmeans = np.empty(1000)\nfor i in range(1000):\n    means[i] = rng.choice(amount, size=50, replace=False).mean()\n\nprint(round(means.mean(), 2))\nprint(round(means.std(ddof=1), 2))\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Bigger samples, smaller misses',
      body: `<p>The natural question is: how does the typical miss change when the sample gets bigger? Common sense says it should shrink, and it does. What is surprising is <b>how</b> it shrinks.</p>
<p>The typical miss falls with the <b>square root</b> of the sample size. The square root sounds technical, so here is what it means in practice, in a single line you can remember:</p>
<p><b>To cut your typical miss in half, you need four times as many items in your sample.</b></p>
<p>Look at TradeFlow’s numbers from the experiment in the next card. With 10 orders the typical miss is about 36,600. With 50 orders it drops to about 17,000. With 200 it is about 8,000, and with 1,000 it is about 3,600. Each time the sample grows by a large factor, the miss shrinks by a smaller one. Going from 200 to 1,000 (five times the work) only cut the miss from 8,000 to 3,600.</p>
<p>That gives a very practical lesson about <b>diminishing returns</b>. The first few dozen items buy you a great deal of accuracy. Each extra item buys a little less. Past a certain point, collecting more costs far more than it improves the answer. The sensible question is not “how big can the sample be?” but “how accurate do we need to be?”, and you will answer that properly in Module 7 when you plan an experiment.</p>
<p>There is also a handy formula that matches what you see. The typical miss of an average is approximately:</p>
<p><b>the spread of the data divided by the square root of the sample size</b></p>
<p>For TradeFlow, the spread of order values is about 115,841, so with 50 orders the formula gives 115,841 divided by the square root of 50, which is about 16,400. The experiment gave 17,018, close enough given that the experiment itself is a bit random. Statisticians call this typical miss the <b>standard error</b>, and Module 4 builds everything on it. You do not need to remember the name yet. You only need the idea: <b>it shrinks with the square root of the sample size</b>.</p>
<div class="callout analogy"><b>Tasting more spoonfuls.</b> The first spoonful tells you a lot about the pot. A tenth spoonful tells you a little more. A hundredth tells you almost nothing new. More tasting always helps, but each taste helps less than the one before.</div>
<div class="callout watch"><b>The population size barely matters.</b> Whether TradeFlow has 10,000 orders or ten million, a random sample of 200 has about the same typical miss. What matters is the size of the sample and the spread of the data, not the size of the population.</div>`
    },
    {
      type: 'try',
      title: 'The miss shrinks as the sample grows',
      body: `<p>The code repeats the 1,000-sample experiment for four sample sizes: 10, 50, 200 and 1,000. For each, it prints the spread of the sample averages (the typical miss) next to the formula’s estimate.</p>
<p>Read the table. For 10 orders the typical miss is <b>36,633</b>, and the formula says 36,632: nearly perfect. For 50 it is <b>17,018</b> against 16,382. For 200 it is <b>7,998</b> against 8,191, and for 1,000 it is <b>3,585</b> against 3,663. The simulation and the formula agree closely, and both show the miss shrinking by about the square root rule.</p>`,
      code: `import numpy as np
import pandas as pd

amount = payments["amount"].values

rows = []
for n in [10, 50, 200, 1000]:
    rng = np.random.default_rng(42)
    means = np.empty(1000)
    for i in range(1000):
        means[i] = rng.choice(amount, size=n, replace=False).mean()
    rows.append({"sample size": n, "spread of sample means": int(round(means.std(ddof=1))), "formula": int(round(amount.std(ddof=0) / np.sqrt(n)))})

print(pd.DataFrame(rows))
`
    },
    {
      id: 'st-1-4-ex3',
      type: 'exercise',
      title: 'Your turn: quadruple the sample, halve the miss',
      body: `<p>Check the square-root rule yourself. For each sample size in the list <b>[25, 40, 160]</b>, repeat the experiment: <b>1,000 samples</b>, each of that size, and the standard deviation (<code>ddof=1</code>) of their averages. Create a <b>fresh</b> generator seeded with <b>42</b> inside the outer loop, so each size starts from the same point. Print the three results as whole numbers, one per line.</p>
<p>You should see <code>23641</code>, <code>17763</code> and <code>8958</code>. Notice that 160 is four times 40, and the miss fell from 17,763 to 8,958, almost exactly half.</p>
<p><b>Think before you type:</b> an outer loop <code>for n in [25, 40, 160]:</code>, then <code>rng = np.random.default_rng(42)</code>, then an inner loop of 1,000 samples as in the last exercise, with <code>size=n</code>. Print <code>int(round(means.std(ddof=1)))</code> after each inner loop.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\n\n# Write your code below\n`,
      hints: [
        `for n in [25, 40, 160]: create rng = np.random.default_rng(42) and means = np.empty(1000). Inner loop: means[i] = rng.choice(amount, size=n, replace=False).mean(). Then print(int(round(means.std(ddof=1)))).`,
        `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\n\nfor n in [25, 40, 160]:\n    rng = np.random.default_rng(42)\n    means = np.empty(1000)\n    for i in range(1000):\n        means[i] = rng.choice(amount, size=n, replace=False).mean()\n    print(int(round(means.std(ddof=1))))\n`
      ],
      solution: `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\n\nfor n in [25, 40, 160]:\n    rng = np.random.default_rng(42)\n    means = np.empty(1000)\n    for i in range(1000):\n        means[i] = rng.choice(amount, size=n, replace=False).mean()\n    print(int(round(means.std(ddof=1))))\n`,
      ordered: true
    },
    {
      type: 'try',
      title: 'An honest sample that still misses',
      body: `<p>Pandas can take a random sample for you, with <code>.sample(200, random_state=1)</code>. The <code>random_state</code> plays the same role as a seed.</p>
<p>This time the sample average is <b>174,294.05</b>, against a true average of <b>158,198.15</b>. The sample missed by <b>16,095.90</b>, about 10 percent. Is the method broken? No. The last line divides the miss by the typical miss for samples of 200 (about 8,191) and gets <b>1.97</b>: this sample was almost exactly <b>two typical misses</b> away from the truth. That is an unlucky sample, but not an impossible one. Roughly one honest random sample in twenty misses by that much or more. <b>This is sampling error: honest, random and unavoidable.</b> It is different in kind from the sneaky problem coming next.</p>`,
      code: `import pandas as pd

sample = payments["amount"].sample(200, random_state=1)

print(round(sample.mean(), 2))
print(round(payments["amount"].mean(), 2))
print(round(sample.mean() - payments["amount"].mean(), 2))
print(round((sample.mean() - payments["amount"].mean()) / (payments["amount"].std(ddof=0) / 200 ** 0.5), 2))
`
    },
    {
      type: 'explain',
      title: 'Bias: when the miss always points the same way',
      body: `<p>Sampling error is random: sometimes your sample is too high, sometimes too low, and on average it is right. There is a second, much nastier kind of miss called <b>bias</b>. A biased sample misses in <b>the same direction every time</b>. It is not luck. It is a flaw in <b>how the sample was chosen</b>.</p>
<p>Here is the difference in one picture. Imagine two archers, each firing many arrows at a target. The first archer’s arrows scatter all around the bullseye, some high, some low, some left, some right. That is <b>sampling error</b>. The second archer’s arrows all land in a tight cluster, but in the top-left corner, away from the bullseye. That is <b>bias</b>. The second archer looks more precise, yet is more wrong.</p>
<table class="mini">
<tr><th></th><th>Sampling error</th><th>Bias</th></tr>
<tr><td><b>Direction of the miss</b></td><td>Random: sometimes high, sometimes low</td><td>Always the same direction</td></tr>
<tr><td><b>Cause</b></td><td>The luck of which items were picked</td><td>A flaw in how items were chosen</td></tr>
<tr><td><b>Does a bigger sample fix it?</b></td><td><b>Yes</b>, it shrinks with the square root of the size</td><td><b>No</b>, a huge biased sample is just a very confident wrong answer</td></tr>
</table>
<p>That last row is the most important sentence in this lesson. <b>No amount of extra data repairs a biased way of choosing it.</b></p>
<p>Bias creeps in through a few familiar doors:</p>
<ul>
<li><b>Convenience sampling.</b> You pick what is easy to reach: the first 200 rows, the nearest customers, the biggest and tidiest orders. Whatever is easy to reach is rarely typical.</li>
<li><b>Self-selection and non-response.</b> Only some people reply to a survey, and those who reply are usually the ones with the strongest feelings, very happy or very angry. The quiet middle stays silent.</li>
<li><b>Survivorship.</b> You only look at what “survived” to be counted. At TradeFlow, 1,239 of the 9,500 deliveries (13 percent) have no delivery time, because they are still in transit or failed. An average delivery time calculated only from parcels that arrived leaves those out.</li>
<li><b>Measurement.</b> The way you record the thing leans one way: a question worded to invite “yes”, or a sensor that always reads a little high.</li>
</ul>
<p>The cure for most of these is the same, and it is the soup-stirring idea from the start: <b>random sampling</b>. If every item has an equal chance of being picked, your choice cannot lean in any direction, and bias has nowhere to hide. That is why you used <code>rng.choice</code> and <code>.sample()</code>, rather than taking the first 200 rows.</p>
<div class="callout watch"><b>Ask: who is missing?</b> The single best question for spotting bias is “who or what did not make it into this sample, and why?” If the missing items differ from the included ones in a way that matters, you have bias.</div>
<div class="callout analogy"><b>The wonky scales.</b> If a set of kitchen scales reads 100 grams too heavy, weighing a thousand bags of flour gives you a very precise, very wrong answer. Taking more measurements never cures the broken scale.</div>`
    },
    {
      type: 'try',
      title: 'A biased sample that stays wrong',
      body: `<p>Imagine a lazy auditor who only checks <b>big orders</b>, those worth more than 100,000, because they are quicker to find. That group is <b>6,218 orders</b>, 62.2 percent of all orders, and its average is <b>218,642.96</b>.</p>
<p>The code compares two ways of sampling, at two sample sizes (50 and 500), repeating each 500 times and averaging. The <b>fair</b> random sample averages <b>157,597</b> at size 50 and <b>158,007</b> at size 500: the truth is 158,198, and it creeps closer as the sample grows. The <b>biased</b> sample averages <b>219,205</b> and then <b>218,735</b>. Tenfold more data and the miss barely moved. It is stuck about 60,000 too high. More data made the auditor more certain, not more correct.</p>`,
      code: `import numpy as np
import pandas as pd

amount = payments["amount"].values
big = amount[amount > 100000]
print(len(big), round(len(big) / len(amount) * 100, 1), round(big.mean(), 2))

rows = []
for n in [50, 500]:
    rng = np.random.default_rng(42)
    fair = np.array([rng.choice(amount, size=n, replace=False).mean() for i in range(500)])
    rng = np.random.default_rng(42)
    skewed = np.array([rng.choice(big, size=n, replace=False).mean() for i in range(500)])
    rows.append({"sample size": n, "fair average": int(round(fair.mean())), "biased average": int(round(skewed.mean()))})

print(pd.DataFrame(rows))
print(int(round(amount.mean())))
`
    },
    {
      id: 'st-1-4-ex4',
      type: 'exercise',
      title: 'Your turn: measure a bias',
      body: `<p>The starter builds <code>big</code>: only the orders worth more than 100,000. Take <b>500 random samples of 50</b> orders from <code>big</code> (a generator seeded with <b>42</b>, made once before the loop), and store each sample’s average. Then print two whole numbers: the <b>average of the 500 sample averages</b>, and the <b>bias</b>, which is that average minus the true average of <b>all</b> orders.</p>
<p>You should see <code>219205</code> and then <code>61007</code>.</p>
<p><b>Think before you type:</b> this is the same loop as before, with <code>big</code> in place of <code>amount</code> inside <code>rng.choice</code>, 500 repeats and a size of 50. The bias is <code>means.mean() - amount.mean()</code>, where <code>amount</code> is the full array. Wrap each print in <code>int(round(...))</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\nbig = amount[amount > 100000]\n\n# Write your code below\n`,
      hints: [
        `rng = np.random.default_rng(42), means = np.empty(500). Loop 500 times: means[i] = rng.choice(big, size=50, replace=False).mean(). Then print(int(round(means.mean()))) and print(int(round(means.mean() - amount.mean()))).`,
        `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\nbig = amount[amount > 100000]\n\nrng = np.random.default_rng(42)\nmeans = np.empty(500)\nfor i in range(500):\n    means[i] = rng.choice(big, size=50, replace=False).mean()\n\nprint(int(round(means.mean())))\nprint(int(round(means.mean() - amount.mean())))\n`
      ],
      solution: `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\nbig = amount[amount > 100000]\n\nrng = np.random.default_rng(42)\nmeans = np.empty(500)\nfor i in range(500):\n    means[i] = rng.choice(big, size=50, replace=False).mean()\n\nprint(int(round(means.mean())))\nprint(int(round(means.mean() - amount.mean())))\n`,
      ordered: true
    },
    {
      id: 'st-1-4-ex5',
      type: 'exercise',
      title: 'Challenge: does a bigger biased sample help?',
      body: `<p>Prove for yourself that more data does not cure bias. Using the same biased group <code>big</code>, loop over the sample sizes <b>[50, 500, 2000]</b>. For each size, make a <b>fresh</b> generator seeded with <b>42</b>, take <b>500 random samples</b> of that size from <code>big</code>, and print the <b>bias</b> as a whole number: the average of the sample averages, minus the true average of all orders.</p>
<p>You should see <code>61007</code>, <code>60537</code> and <code>60522</code>. Forty times more data and the bias is still above 60,000.</p>
<p><b>Think before you type:</b> an outer loop <code>for n in [50, 500, 2000]:</code> that creates a new generator and an empty array of 500 slots, an inner loop that fills it with averages, and a print of <code>int(round(means.mean() - amount.mean()))</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\nbig = amount[amount > 100000]\n\n# Write your code below\n`,
      hints: [
        `for n in [50, 500, 2000]: rng = np.random.default_rng(42), means = np.empty(500), an inner loop with means[i] = rng.choice(big, size=n, replace=False).mean(), then print(int(round(means.mean() - amount.mean()))).`,
        `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\nbig = amount[amount > 100000]\n\nfor n in [50, 500, 2000]:\n    rng = np.random.default_rng(42)\n    means = np.empty(500)\n    for i in range(500):\n        means[i] = rng.choice(big, size=n, replace=False).mean()\n    print(int(round(means.mean() - amount.mean())))\n`
      ],
      solution: `import numpy as np\nimport pandas as pd\n\namount = payments["amount"].values\nbig = amount[amount > 100000]\n\nfor n in [50, 500, 2000]:\n    rng = np.random.default_rng(42)\n    means = np.empty(500)\n    for i in range(500):\n        means[i] = rng.choice(big, size=n, replace=False).mean()\n    print(int(round(means.mean() - amount.mean())))\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Taking a good sample in practice',
      body: `<p>You now know the two enemies of a sample: random luck, which a bigger sample shrinks, and bias, which no size can fix. Here is how that turns into good habits when you have to sample for real.</p>
<p><b>1. Pick at random.</b> A <b>simple random sample</b> gives every item the same chance of being chosen. In Pandas it is <code>table.sample(n, random_state=1)</code>. Always set the <code>random_state</code> so that the sample can be repeated and checked.</p>
<p><b>2. Consider splitting into groups first.</b> Suppose you want a survey that represents all five of TradeFlow’s countries. A purely random sample might, by chance, contain very few customers from the smallest country. A <b>stratified sample</b> avoids that: you split the population into groups, called <b>strata</b>, such as the five countries, and take a random sample <b>within each group</b>. That guarantees every group is represented, and it usually gives a tighter estimate.</p>
<p><b>3. Ask who is missing, every time.</b> Before trusting any sample, run through a short checklist:</p>
<table class="mini">
<tr><th>Ask</th><th>What you are looking for</th></tr>
<tr><td>How was it chosen?</td><td>Anything other than a random draw, such as “whoever was easy to reach”</td></tr>
<tr><td>Who chose to take part?</td><td>Self-selection: only the keen, the angry or the idle respond</td></tr>
<tr><td>What was left out, and why?</td><td>Survivorship: missing, failed or unfinished cases dropped quietly</td></tr>
<tr><td>Could the way we measured lean one way?</td><td>Leading questions, a sensor that reads high, or a definition that favours one outcome</td></tr>
</table>
<p><b>4. If you cannot avoid bias, say so.</b> Sometimes you cannot sample properly: you inherit data from a system where only some customers appear. In that case, the honest path is to describe exactly what the sample covers, and to avoid claims about the people it leaves out.</p>
<p><b>5. Choose the size on purpose.</b> How many items you need depends on how accurate you must be and how spread out the data is. You now know the shape of that answer: the miss shrinks with the square root of the sample size. Modules 4 and 7 turn it into a calculation.</p>
<div class="callout work"><b>At work:</b> most arguments about a survey or a dashboard are really arguments about bias. “Who answered?” and “who is not in this data?” are among the most useful questions you can ask in any meeting.</div>
<div class="callout tip"><b>Keep the receipt.</b> Whenever you take a sample, write down how you chose it, the seed and the date. A sample you cannot reproduce is a sample you cannot defend.</div>`
    },
    {
      id: 'st-1-4-c1',
      type: 'check',
      title: 'You take two honest random samples of orders. The first has an average 4 percent above the true average, and the second 3 percent below it. What does this show?',
      body: `<p>Think about the direction of the misses.</p>`,
      options: [
        'Bias, because both samples differ from the truth',
        'Sampling error, because the misses are random: one is too high and one too low, and on average samples land on the truth',
        'Measurement error, because the orders must have been recorded wrongly',
        'Nothing, because honest samples should always match the truth exactly'
      ],
      answer: 1,
      why: [
        'Differing from the truth alone is not bias. Bias is a miss that leans the same way every time. Here the misses went in opposite directions.',
        'Right! This is the luck of the draw. Random misses that go both ways, and average out to nothing, are sampling error. A larger sample would shrink them.',
        'Nothing in the story suggests a recording problem. Different random samples simply contain different orders.',
        'No honest sample matches exactly. Some difference is unavoidable, and measuring how big it is likely to be is a major job of statistics.'
      ]
    },
    {
      id: 'st-1-4-c2',
      type: 'check',
      title: 'A sample of 100 orders gives you an average with a typical miss of 12,000. About how large a sample would you need to cut that typical miss to 6,000?',
      body: `<p>Remember the one-line rule about square roots.</p>`,
      options: [
        '200 orders, because twice the sample gives half the miss',
        '300 orders, because it is three times the work for half the miss',
        '400 orders, because the miss falls with the square root of the sample size, so halving it needs four times the sample',
        '1,000 orders, because ten times the sample is always needed'
      ],
      answer: 2,
      why: [
        'Doubling the sample cuts the miss by only about 29 percent (to about 8,500), not by half. The miss falls with the square root of the sample size, not in direct proportion.',
        'Tripling the sample cuts the miss to about 58 percent of its size, not 50. The rule is about four times, not three.',
        'Right! The typical miss shrinks with the square root of the sample size, so to cut it in half you need four times as much data. This is why accuracy gets expensive: each halving costs four times as much.',
        'Ten times the sample would cut the miss to about 32 percent of its size, far more than needed. The rule says four times is enough for half.'
      ]
    },
    {
      id: 'st-1-4-c3',
      type: 'check',
      title: 'TradeFlow emails a satisfaction survey to all customers. Only 8 percent reply, mostly very happy or very angry customers. Why is the average score unreliable?',
      body: `<p>Think about who chose to answer, and who did not.</p>`,
      options: [
        'Because 8 percent is too small a number to calculate an average',
        'Because the people who reply choose themselves, and they differ from the silent majority. This is self-selection bias, and collecting more replies of the same kind would not fix it',
        'Because surveys always have sampling error, so they are worthless',
        'Because the average cannot be calculated from emails'
      ],
      answer: 1,
      why: [
        'An average can be calculated from any number of replies. The problem is not the count of replies but who they came from.',
        'Right! The customers decided for themselves whether to answer, and the ones with strong feelings were most likely to. The quiet middle is missing. Extra replies from the same type of customer would not help. Better would be to chase a random subset of non-responders, or to sample customers at random and follow them up.',
        'Sampling error is real but small compared with this bias, and an honest survey with a proper random sample is useful. The problem here is bias, not the existence of error.',
        'Averages can be computed from any numeric scores. The weakness is in who is in the data.'
      ]
    },
    {
      type: 'explain',
      title: 'Module 1 complete: what you can do now',
      body: `<p>You have finished Module 1, <b>Thinking Statistically</b>. Four lessons ago you could say that a number moved. Now you can say whether it means anything, how to describe a column properly, and how far to trust a sample. Look at what you gained across the module:</p>
<table class="mini">
<tr><th>Lesson</th><th>The idea</th><th>The sentence you can now say</th></tr>
<tr><td><b>1.1 Signal and noise</b></td><td>Numbers move even when nothing changes</td><td>“A fall this size happens about one time in five by luck alone, so it does not show a decline yet.”</td></tr>
<tr><td><b>1.2 Centre and spread</b></td><td>A middle needs a spread</td><td>“The typical order is 128 thousand, and order values vary more than delivery times, relative to their size.”</td></tr>
<tr><td><b>1.3 Shape and outliers</b></td><td>Look at the shape, and treat a flag as a question</td><td>“That order is unusual but real: 17 units, mostly Electronics.”</td></tr>
<tr><td><b>1.4 Samples and bias</b></td><td>Random misses shrink, biased misses do not</td><td>“Our sample of 200 is within about 8,000 of the truth, as long as it was chosen at random.”</td></tr>
</table>
<p>In this lesson specifically, you can:</p>
<ul>
<li>Define <b>population, sample, parameter and statistic</b> in plain words</li>
<li>Take a <b>random sample</b> in NumPy and Pandas, and make it repeatable with a seed</li>
<li>Explain <b>sampling error</b> as the luck of the draw, and build the hill of sample averages by simulation</li>
<li>State the <b>square-root rule</b>: halving the miss needs four times the sample</li>
<li>Tell <b>sampling error from bias</b>, name the common sources of bias, and explain why a bigger biased sample does not help</li>
<li>Use the <b>“who is missing?”</b> checklist on any sample</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is the difference between a population and a sample, and between a parameter and a statistic?</li>
<li>What is the difference between sampling error and bias, and which one does a larger sample fix?</li>
<li>A colleague surveyed 500 customers who volunteered, and found 90 percent satisfaction. How would you assess that result?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> The population is everything we want to know about, and the sample is the part we actually observe. A parameter is a true value about the population, usually unknown, such as the real average order value. A statistic is a value calculated from the sample, such as the sample average, which we use as an estimate of the parameter.</p>
<p><b>2.</b> Sampling error is the random difference between a sample and the population caused by which items happened to be picked. It goes in both directions and shrinks as the sample grows, roughly with the square root of its size. Bias is a systematic miss in one direction, caused by how the sample was chosen, such as convenience or self-selection. A larger sample reduces sampling error, but it does not fix bias, so a large biased sample is just a precise wrong answer.</p>
<p><b>3.</b> I would be cautious, because volunteers choose themselves, and people who volunteer tend to differ from those who do not, often by having stronger or more positive feelings. That is self-selection bias, and the sample size of 500 does not cure it. I would ask how the customers were invited, what share replied, and whether the repliers look like all customers in country, spend and tenure. To check, I would compare repliers with known figures for all customers, or follow up with a random sample of non-responders. Until then, I would describe the 90 percent as the satisfaction of those who chose to reply, not of all customers.</p>
</details>
<p><b>Coming next, in Module 2:</b> probability. You have seen, again and again, that the way numbers vary is not wild: it follows patterns, like the hill of sample averages. Probability is the language that describes those patterns exactly. In Lesson 2.1 you will learn what a probability is, how to work out the chance of events like “this order is cancelled” or “this customer is in Rwanda”, and the few simple rules that everything else is built on. You will meet them with TradeFlow’s real order statuses, and with dice and coins you can simulate yourself.</p>`
    }
  ]
}
);
