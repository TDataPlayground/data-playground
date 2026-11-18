LESSONS.push(
{
  id: 'py-7-3',
  track: 'python',
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

master = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")
master = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")
master = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
master["line_total"] = master["quantity"] * master["unit_price"]
master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")
master["order_year"] = master["order_date"].dt.year
`,
  preloaded: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items', 'master'],
  title: '7.3 Distributions and relationships: the shape of your data',
  tables: [],
  intro: `The operations director catches you after the board pack review. <i>“You told me our average order is about 158 thousand. But what does a normal order look like? And how often do we get a monster?”</i> Then the finance director adds a second question: <i>“When a customer buys more items, do they actually spend more?”</i><br><br>Both are questions about <b>shape</b>. An average squeezes ten thousand orders into one number and throws the shape away. A <b>histogram</b> keeps it: it shows how the whole column of order values is spread out. A <b>scatter plot</b> keeps it too: it shows whether two columns move together.<br><br>In this lesson you draw both, you learn why the mean and the median can disagree, you meet the log scale for lopsided data, and you learn to read a correlation without being fooled by it. The master table is loaded as before.`,
  steps: [
    {
      type: 'explain',
      title: 'An average hides the shape',
      body: `<p>Suppose ten people sit in a room. Nine earn 100 thousand a year and one earns 10 million. The average income in that room is almost 1.1 million. Nobody in the room earns anything close to that number. The average is true, and it is also useless for describing the room. What you needed was the <b>shape</b>: nine people in one place and one far away.</p>
<p>The technical word for the shape of a column of numbers is its <b>distribution</b>. It answers three plain questions: where do most of the values sit, how widely are they spread, and are there strange ones far from the rest?</p>
<p>The chart for a distribution is the <b>histogram</b>. The idea is simple enough to do with your hands. Take all the order values and sort them into buckets by size: 0 to 50 thousand, 50 to 100 thousand, 100 to 150 thousand, and so on. Count how many orders fall into each bucket. Then draw one bar per bucket, as tall as its count. The tall bars show where orders pile up, and the short bars show where they thin out.</p>
<p>A histogram looks like a bar chart but it is a different animal. In a bar chart each bar is a separate category, such as Ghana or Kenya, and the order of the bars is up to you. In a histogram the bars are <b>slices of one continuous number line</b>, so they sit side by side in a fixed order and they touch. Each slice is called a <b>bin</b>.</p>
<table class="mini">
<tr><th></th><th>Bar chart</th><th>Histogram</th></tr>
<tr><td><b>What is along the bottom</b></td><td>Separate categories</td><td>One number line cut into bins</td></tr>
<tr><td><b>What the height means</b></td><td>A value for that category</td><td>How many items fall in that bin</td></tr>
<tr><td><b>Order of the bars</b></td><td>Your choice (sort them)</td><td>Fixed, from small to large</td></tr>
<tr><td><b>Matplotlib call</b></td><td><code>ax.bar(names, heights)</code></td><td><code>ax.hist(values, bins=20)</code></td></tr>
</table>
<p>One more thing before you draw. The unit of an “order value” is not a line of the master table but a whole <b>order</b>, and an order has between 2 and 7 lines. So the first job is to add up the line totals for each order: <code>master.groupby("order_id")["line_total"].sum()</code>. That gives 10,000 numbers, one per order. We divide by 1,000 so that the axis reads in thousands.</p>
<div class="callout analogy"><b>The height chart at school.</b> Imagine all the children in a school lining up by height in rows of 5 centimetres: those between 120 and 125 in one row, 125 to 130 in the next. The longest row shows the most common height. That picture of rows is a histogram.</div>`
    },
    {
      type: 'try',
      title: 'How big is an order?',
      body: `<p>Read the code from the top: add up each order’s lines, divide by a thousand, then <code>ax.hist(values, bins=20)</code> sorts the 10,000 orders into 20 equal-width buckets and draws one bar for each. The <code>edgecolor</code> only draws a thin outline so you can see where one bar ends and the next begins.</p>
<p>Now read the picture the way you would read it to the operations director. The tallest bar sits just above 50 thousand: <b>2,545 orders</b> are worth between about 55 and 108 thousand. Most orders live below 300 thousand. And then the right side thins into a long tail that stretches all the way to 1,072 thousand, more than one million. A normal order is small. A monster is rare, but it exists.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

values = master.groupby("order_id")["line_total"].sum() / 1000

fig, ax = plt.subplots(figsize=(9, 4))
ax.hist(values, bins=20, edgecolor="#0f2744")
ax.set_title("How big is an order?")
ax.set_xlabel("Order value (thousands)")
ax.set_ylabel("Number of orders")
plt.tight_layout()`
    },
    {
      type: 'explain',
      title: 'Choosing the number of bins',
      body: `<p>You chose 20 buckets. Why 20? There is no magic number. The number of bins is a choice, and it changes the picture, a bit like the zoom on a camera.</p>
<ul>
<li><b>Too few bins</b> and the bars are fat. Detail vanishes: you see a lump and nothing else.</li>
<li><b>Too many bins</b> and the bars are thin spikes. Each one holds only a few orders, so the picture jumps around from chance alone and you start seeing patterns that are not there.</li>
</ul>
<p>With 20 bins over a range from 1.3 thousand to 1,072 thousand, each bin is about <b>53.5 thousand wide</b>. A practical way to choose is to try three values and see which one tells the cleanest story. For ten thousand orders, something between 20 and 50 usually works.</p>
<p>One more reading skill: the <b>heights are counts</b>, so the total of all the bars is the number of orders you started with. The first bin holds 1,614 orders, the second 2,545, the third 2,014, and the counts shrink from there until a single order sits in the last bin on the far right.</p>
<div class="callout watch"><b>Do not mix up the two charts.</b> If someone gives you a column of numbers and asks for a “bar chart”, they very likely mean a histogram. If someone gives you a few named groups and asks for a “histogram”, they mean a bar chart. Ask what they want to see, and pick by the question, not the word.</div>
<div class="callout tip"><b>Say what the bins are.</b> A reader should never have to guess how wide a bar is. State it in the axis label or the title, for example “each bar covers about 54 thousand”.</div>`
    },
    {
      type: 'try',
      title: 'Too few bins, too many bins',
      body: `<p>Same 10,000 orders, drawn twice. On the left there are only 5 bins, and on the right there are 80. Look at what each hides or invents.</p>
<p>The left chart tells you that orders are mostly small, and that is all. The right chart tells you the same, but the tops of the bars are ragged, and the rough edges are noise rather than facts. The middle road, with 20 to 30 bins, is the one a board will find easiest to read.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

values = master.groupby("order_id")["line_total"].sum() / 1000

fig, axes = plt.subplots(1, 2, figsize=(11, 4))
axes[0].hist(values, bins=5, edgecolor="#0f2744")
axes[0].set_title("5 bins: too coarse")
axes[1].hist(values, bins=80, edgecolor="#0f2744")
axes[1].set_title("80 bins: too fussy")
for ax in axes:
    ax.set_xlabel("Order value (thousands)")
    ax.set_ylabel("Number of orders")
plt.tight_layout()`
    },
    {
      id: 'py-7-3-ex1',
      type: 'exercise',
      title: 'Your turn: the shape of order value',
      body: `<p>Draw a histogram of <b>order value in thousands</b>, using <b>20 bins</b>, with these texts:</p>
<ul>
<li>Title: <code>Order value distribution</code></li>
<li>X label: <code>Order value (thousands)</code></li>
<li>Y label: <code>Number of orders</code></li>
</ul>
<p>No printing. You should see a chart with <b>20 bars</b>.</p>
<p><b>Think before you type:</b> the value of an order is the sum of its lines. Group the master table by <code>order_id</code>, add up <code>line_total</code>, divide by 1,000, and pass that Series to <code>ax.hist</code>.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\n# Write your code below\n`,
      hints: [
        `values = master.groupby("order_id")["line_total"].sum() / 1000. Then fig, ax = plt.subplots() and ax.hist(values, bins=20). Add the title and the two labels, and end with plt.tight_layout().`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\nvalues = master.groupby("order_id")["line_total"].sum() / 1000\n\nfig, ax = plt.subplots(figsize=(9, 4))\nax.hist(values, bins=20)\nax.set_title("Order value distribution")\nax.set_xlabel("Order value (thousands)")\nax.set_ylabel("Number of orders")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nvalues = master.groupby("order_id")["line_total"].sum() / 1000\n\nfig, ax = plt.subplots(figsize=(9, 4))\nax.hist(values, bins=20)\nax.set_title("Order value distribution")\nax.set_xlabel("Order value (thousands)")\nax.set_ylabel("Number of orders")\nplt.tight_layout()`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Mean, median and the long tail',
      body: `<p>Look at your histogram again. It is lopsided: a tall hump on the left and a long tail dragging to the right. Statisticians call this a <b>right-skewed</b> distribution, meaning the tail points to the right. The skew measure for TradeFlow’s order values is <b>1.39</b>, clearly positive.</p>
<p>That shape has a consequence for the two famous “middles” of a column of numbers:</p>
<ul>
<li>The <b>mean</b> is the average: add everything up and divide by the count. It is <b>sensitive</b>: one million-unit order pulls it to the right.</li>
<li>The <b>median</b> is the middle value: line all the orders up from smallest to largest and take the one in the centre. It <b>ignores</b> how extreme the extremes are.</li>
</ul>
<p>For order value, the mean is <b>158,198</b> and the median is <b>127,828</b>. The mean is higher by about 30 thousand, because a few giant orders pull it up. You can feel the effect in one number: <b>60.7 percent of all orders are worth less than the mean</b>. If the board hears “the average order is 158 thousand”, they imagine most orders being near that. The truth is that the typical order is nearer 128 thousand, and the average is inflated by the tail.</p>
<table class="mini">
<tr><th>Shape of the histogram</th><th>Mean against median</th><th>Which one describes a typical case?</th></tr>
<tr><td>Balanced hump (symmetric)</td><td>About equal</td><td>Either</td></tr>
<tr><td>Long tail to the right (like order value)</td><td>Mean is higher</td><td>The median</td></tr>
<tr><td>Long tail to the left</td><td>Mean is lower</td><td>The median</td></tr>
</table>
<p>A simple habit follows: <b>when you report an average, check the median too</b>. If they are far apart, the data is skewed, and you should say so. You can mark both on the histogram with a vertical line each. That is <code>ax.axvline(value)</code>, “v” for vertical, and it works like the <code>axhline</code> you met in lesson 7.1.</p>
<div class="callout work"><b>At work:</b> incomes, house prices, order values, hospital bills and website visit times are all right-skewed. Reports that use the median for these quantities are being careful, not fussy.</div>`
    },
    {
      type: 'try',
      title: 'Mean and median on the histogram',
      body: `<p>Two vertical dashed lines mark the mean in amber and the median in pink. Each one adds one line to the chart, and the legend labels them. Look at the gap between them. That gap is the tail’s pull, drawn.</p>
<p>The median sits inside the tall bars, where the typical order lives. The mean sits to its right. If you showed the board only the amber line, you would be telling them the typical order is bigger than it is.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

values = master.groupby("order_id")["line_total"].sum() / 1000

fig, ax = plt.subplots(figsize=(9, 4))
ax.hist(values, bins=20, edgecolor="#0f2744")
ax.axvline(values.mean(), color="#f5b301", linestyle="--", label="Mean: 158")
ax.axvline(values.median(), color="#ef9a9a", linestyle="--", label="Median: 128")
ax.legend()
ax.set_title("Order value, with the mean and the median")
ax.set_xlabel("Order value (thousands)")
ax.set_ylabel("Number of orders")
plt.tight_layout()`
    },
    {
      id: 'py-7-3-ex2',
      type: 'exercise',
      title: 'Your turn: mark the mean and the median',
      body: `<p>The order values are already built in the starter code. Draw the histogram with <b>25 bins</b>, then add a <b>vertical dashed line at the mean</b> and another <b>at the median</b>. Use these texts:</p>
<ul>
<li>Title: <code>Order value with mean and median</code></li>
<li>X label: <code>Order value (thousands)</code></li>
<li>Y label: <code>Number of orders</code></li>
</ul>
<p>No printing. You should see <b>25 bars and two lines</b>.</p>
<p><b>Think before you type:</b> the histogram is the same call as before with a different number of bins. Each reference line is one <code>ax.axvline(...)</code>, with <code>values.mean()</code> and <code>values.median()</code> as the positions.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nvalues = master.groupby("order_id")["line_total"].sum() / 1000\n\n# Write your code below\n`,
      hints: [
        `fig, ax = plt.subplots(), then ax.hist(values, bins=25). Then ax.axvline(values.mean(), linestyle="--") and ax.axvline(values.median(), linestyle="--"). Then the title, the labels and plt.tight_layout().`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\nvalues = master.groupby("order_id")["line_total"].sum() / 1000\n\nfig, ax = plt.subplots(figsize=(9, 4))\nax.hist(values, bins=25)\nax.axvline(values.mean(), linestyle="--")\nax.axvline(values.median(), linestyle="--")\nax.set_title("Order value with mean and median")\nax.set_xlabel("Order value (thousands)")\nax.set_ylabel("Number of orders")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nvalues = master.groupby("order_id")["line_total"].sum() / 1000\n\nfig, ax = plt.subplots(figsize=(9, 4))\nax.hist(values, bins=25)\nax.axvline(values.mean(), linestyle="--")\nax.axvline(values.median(), linestyle="--")\nax.set_title("Order value with mean and median")\nax.set_xlabel("Order value (thousands)")\nax.set_ylabel("Number of orders")\nplt.tight_layout()`,
      ordered: true
    },
    {
      id: 'py-7-3-c1',
      type: 'check',
      title: 'TradeFlow’s mean order value is 158 thousand and the median is 128 thousand. What does that tell you?',
      body: `<p>Think about what pulls a mean away from the middle.</p>`,
      options: [
        'The data has an error, because the mean and median should always match',
        'A few very large orders pull the mean up, so the distribution is right-skewed and the median describes a typical order better',
        'Half of all orders are worth exactly 158 thousand',
        'The median is wrong because it ignores the biggest orders'
      ],
      answer: 1,
      why: [
        'They match only when the distribution is symmetric. Real money data is almost never symmetric, so a gap between mean and median is normal and informative.',
        'Right! The long tail of large orders raises the mean without moving the median. A useful check is that 60.7 percent of orders are worth less than the mean. For skewed data like this, report the median as the typical value and the mean as the total divided by the count, and be clear which one you mean.',
        'The mean is a calculated balance point, and almost no real order sits exactly on it. Fewer orders sit near the mean than near the median.',
        'Ignoring extremes is exactly what makes the median a steady description of a typical case. It is a feature, not a flaw, for skewed data.'
      ]
    },
    {
      type: 'explain',
      title: 'When the tail is too long: the log scale',
      body: `<p>Sometimes the tail is so long that the main hump is squashed into the corner of the chart, and nobody can see the detail where most of the data lives. Your order histogram is a mild case: the biggest order is 1,072 thousand, and the picture spends half its width on a handful of orders.</p>
<p>The standard remedy is a <b>log scale</b>. On a normal ruler the steps are equal in <i>amount</i>: 100, 200, 300. On a log ruler the steps are equal in <i>multiples</i>: 1, 10, 100, 1,000, each step ten times the one before. Each step stands for “ten times bigger”, so a gap between 10 and 100 takes the same width as the gap between 100 and 1,000.</p>
<p>This suits data that grows by multiples rather than by amounts, such as incomes, populations and order sizes. It also stretches the crowded small values apart and pulls the long tail in.</p>
<p>In Matplotlib you do two things. First you switch the ruler with <code>ax.set_xscale("log")</code>. Second, you change the bins. Equal-width bins look lopsided on a log ruler, so you ask for bins that are equal in multiples with <code>np.logspace</code>:</p>
<p><code>bins = np.logspace(np.log10(values.min()), np.log10(values.max()), 21)</code></p>
<p>Read it aloud: “make 21 edges, evenly spaced on the log ruler, from the smallest order to the biggest”. Twenty-one edges give twenty bins. NumPy’s <code>log10</code> turns a value into its power of ten, and <code>logspace</code> works the other way round to turn evenly spaced powers back into values.</p>
<div class="callout watch"><b>A log axis must be labelled as one.</b> A reader who does not notice the ruler is logarithmic will misread distances. Say “log scale” in the axis label. A log scale also cannot show zero or negative values, because there is no multiple that reaches them, so the data must be all above zero. Order values are, so we are safe.</div>
<div class="callout tip"><b>Use it sparingly with a board.</b> A log chart is a great tool for the analyst. For a non-technical audience, a plain histogram plus the median in words (“a typical order is 128 thousand, and a few exceed 500 thousand”) is usually clearer.</div>`
    },
    {
      type: 'try',
      title: 'The same orders on a log scale',
      body: `<p>On the left is the histogram you know, with the long tail. On the right the same orders are drawn on a log ruler with log-spaced bins. Watch the shape change: the right chart is a single, balanced hump, with typical orders in the middle and the very small and very large ones thinning out on both sides. The tail that dominated the left chart is now just one side of a hump.</p>
<p>The ticks along the bottom read 10, 100 and 1,000 (thousands). Each step is ten times the previous one.</p>`,
      code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

values = master.groupby("order_id")["line_total"].sum() / 1000
bins = np.logspace(np.log10(values.min()), np.log10(values.max()), 21)

fig, axes = plt.subplots(1, 2, figsize=(11, 4))
axes[0].hist(values, bins=20, edgecolor="#0f2744")
axes[0].set_title("Normal scale")
axes[1].hist(values, bins=bins, edgecolor="#0f2744")
axes[1].set_xscale("log")
axes[1].set_title("Log scale")
for ax in axes:
    ax.set_xlabel("Order value (thousands)")
    ax.set_ylabel("Number of orders")
plt.tight_layout()`
    },
    {
      id: 'py-7-3-ex3',
      type: 'exercise',
      title: 'Your turn: the log-scale histogram',
      body: `<p>The order values and the NumPy import are in the starter. Draw the histogram on a <b>log scale</b> with <b>20 log-spaced bins</b>. Use these texts:</p>
<ul>
<li>Title: <code>Order value on a log scale</code></li>
<li>X label: <code>Order value (thousands, log scale)</code></li>
<li>Y label: <code>Number of orders</code></li>
</ul>
<p>No printing. You should see a chart with <b>20 bars</b> and no lines.</p>
<p><b>Think before you type:</b> three small jobs. Build the edges with <code>np.logspace</code> (21 edges make 20 bins). Draw with <code>ax.hist(values, bins=bins)</code>. Switch the ruler with <code>ax.set_xscale("log")</code>.</p>`,
      starter: `import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\nvalues = master.groupby("order_id")["line_total"].sum() / 1000\n\n# Write your code below\n`,
      hints: [
        `bins = np.logspace(np.log10(values.min()), np.log10(values.max()), 21). Then ax.hist(values, bins=bins) and ax.set_xscale("log").`,
        `import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\nvalues = master.groupby("order_id")["line_total"].sum() / 1000\nbins = np.logspace(np.log10(values.min()), np.log10(values.max()), 21)\n\nfig, ax = plt.subplots(figsize=(9, 4))\nax.hist(values, bins=bins)\nax.set_xscale("log")\nax.set_title("Order value on a log scale")\nax.set_xlabel("Order value (thousands, log scale)")\nax.set_ylabel("Number of orders")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\nvalues = master.groupby("order_id")["line_total"].sum() / 1000\nbins = np.logspace(np.log10(values.min()), np.log10(values.max()), 21)\n\nfig, ax = plt.subplots(figsize=(9, 4))\nax.hist(values, bins=bins)\nax.set_xscale("log")\nax.set_title("Order value on a log scale")\nax.set_xlabel("Order value (thousands, log scale)")\nax.set_ylabel("Number of orders")\nplt.tight_layout()`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Two columns at once: the scatter plot and correlation',
      body: `<p>A histogram looks at one column. The finance director’s question is about <b>two</b>: do orders with more items cost more? For that you need a <b>scatter plot</b>.</p>
<p>The idea is plain. Every order becomes one dot. Its position left to right is the number of units in the order. Its height is the order value. If larger baskets really cost more, the dots will drift upward as you move to the right. If there is no link, the dots form a shapeless cloud.</p>
<p>First you need one row per order with both numbers. The <code>agg</code> method does two sums in one go:</p>
<p><code>totals = master.groupby("order_id").agg(units=("quantity", "sum"), value=("line_total", "sum"))</code></p>
<p>Read it aloud: “for each order, add up the quantities and call that <b>units</b>, and add up the line totals and call that <b>value</b>.” Then <code>ax.scatter(x, y)</code> draws the dots.</p>
<p>A picture gives a feeling. To put a number on the feeling you use the <b>correlation coefficient</b>, written <b>r</b>. It always lies between −1 and +1:</p>
<table class="mini">
<tr><th>r is near</th><th>Meaning</th><th>The dots look like</th></tr>
<tr><td><b>+1</b></td><td>When one goes up, the other goes up, in a perfect straight line</td><td>A tight upward line</td></tr>
<tr><td><b>0</b></td><td>No straight-line link at all</td><td>A shapeless cloud</td></tr>
<tr><td><b>−1</b></td><td>When one goes up, the other goes down, perfectly</td><td>A tight downward line</td></tr>
</table>
<p>Pandas computes it in one phrase: <code>totals["units"].corr(totals["value"])</code>. For TradeFlow the answer is <b>r = 0.56</b>. A rough guide to read it: below 0.1 is nothing, 0.1 to 0.3 is weak, 0.3 to 0.5 is moderate, 0.5 to 0.7 is fairly strong, and above 0.7 is strong. These bands are conventions, not laws, but they keep conversations honest.</p>
<p>There is a second, even more useful way to hear r: square it. 0.56 squared is about <b>0.32</b>, so the number of units explains roughly <b>a third</b> of why order values differ. The other two thirds come from something else: mostly which products are in the basket, since one unit of a cheap product and one unit of an expensive product are very different.</p>
<div class="callout watch"><b>Correlation is not causation.</b> r tells you two things move together. It does not tell you why. Ice cream sales and sunburn both rise in summer, but ice cream does not cause sunburn. The sun causes both. Before you say “more units cause higher value”, ask whether a third thing sits behind both.</div>`
    },
    {
      type: 'try',
      title: 'Units per order against order value',
      body: `<p>Each dot is one of the 10,000 orders. We put r in the title using an f-string: <code>f"... {r:.2f}"</code> writes the number with two decimals. The settings <code>s=8</code> and <code>alpha=0.25</code> make the dots small and see-through, which we explain in a moment.</p>
<p>Read the picture. The dots form a rising band, narrow on the left and wide on the right. Orders with 4 units never go above about 300 thousand, and nine in ten stay under 190 thousand. Orders with 15 units mostly fall between about 130 and 510 thousand, a far wider range. That widening is a real finding: <b>more units make a big bill possible, but they do not make it certain</b>. The vertical stripes are because units are whole numbers: you cannot have 7.3 units.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

totals = master.groupby("order_id").agg(units=("quantity", "sum"), value=("line_total", "sum"))
r = totals["units"].corr(totals["value"])

fig, ax = plt.subplots(figsize=(8, 5))
ax.scatter(totals["units"], totals["value"] / 1000, s=8, alpha=0.25)
ax.set_title(f"Units per order against order value (r = {r:.2f})")
ax.set_xlabel("Units per order")
ax.set_ylabel("Order value (thousands)")
plt.tight_layout()`
    },
    {
      id: 'py-7-3-ex4',
      type: 'exercise',
      title: 'Your turn: your first scatter plot',
      body: `<p>Draw the scatter plot of <b>units per order</b> (along the bottom) against <b>order value in thousands</b> (up the side), one dot per order. Use these texts:</p>
<ul>
<li>Title: <code>Units per order against order value</code></li>
<li>X label: <code>Units per order</code></li>
<li>Y label: <code>Order value (thousands)</code></li>
</ul>
<p>No printing. A scatter has no bars and no lines, so the checker sees a chart with <b>zero of each</b>. It checks your title and labels.</p>
<p><b>Think before you type:</b> build one row per order with <code>agg</code>, units and value. Then <code>ax.scatter</code> with units as x and value divided by 1,000 as y. Make the dots small and see-through with <code>s=8, alpha=0.25</code>.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\n# Write your code below\n`,
      hints: [
        `totals = master.groupby("order_id").agg(units=("quantity", "sum"), value=("line_total", "sum")). Then ax.scatter(totals["units"], totals["value"] / 1000, s=8, alpha=0.25).`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\ntotals = master.groupby("order_id").agg(units=("quantity", "sum"), value=("line_total", "sum"))\n\nfig, ax = plt.subplots(figsize=(8, 5))\nax.scatter(totals["units"], totals["value"] / 1000, s=8, alpha=0.25)\nax.set_title("Units per order against order value")\nax.set_xlabel("Units per order")\nax.set_ylabel("Order value (thousands)")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\ntotals = master.groupby("order_id").agg(units=("quantity", "sum"), value=("line_total", "sum"))\n\nfig, ax = plt.subplots(figsize=(8, 5))\nax.scatter(totals["units"], totals["value"] / 1000, s=8, alpha=0.25)\nax.set_title("Units per order against order value")\nax.set_xlabel("Units per order")\nax.set_ylabel("Order value (thousands)")\nplt.tight_layout()`,
      ordered: true
    },
    {
      id: 'py-7-3-c2',
      type: 'check',
      title: 'The correlation between units per order and order value is r = 0.56. Which statement is the best reading?',
      body: `<p>Remember what r measures, and what squaring it tells you.</p>`,
      options: [
        'Every extra unit adds 56 percent to the order value',
        'Orders with more units tend to be worth more, but the link is only moderate: units explain about a third of the differences in order value, so the products in the basket matter a lot too',
        '56 percent of orders have a high value',
        'Units cause value, so adding units to a basket will raise the bill by the same rate'
      ],
      answer: 1,
      why: [
        'r is not a growth rate. It measures how tightly the dots follow a straight line, not how steep the line is.',
        'Right! r = 0.56 means a clear upward tendency with plenty of scatter. Squared, it is 0.32, so about a third of the variation is explained by units alone. The rest depends on what is in the basket.',
        'r is not a percentage of orders. It is a number between −1 and +1 describing how two columns move together.',
        'A correlation does not prove cause, and it does not give a fixed rate of increase. A customer who adds one cheap item and a customer who adds one expensive item raise the bill by very different amounts.'
      ]
    },
    {
      type: 'explain',
      title: 'When there is nothing there, and when there are too many dots',
      body: `<p>Not every pair of columns is linked, and a scatter plot that shows <b>nothing</b> is not a failure. It is a finding, and often a valuable one. Here are two real examples from TradeFlow:</p>
<ul>
<li><b>Quantity against unit price</b> (25,000 order lines): r = −0.001. Customers do not buy more of cheaper products and fewer of dearer ones. Quantity is a random 1 to 5, whatever the price.</li>
<li><b>Delivery days against order value</b> (8,261 delivered orders): r = 0.007. Bigger orders do not take longer to deliver. Every delivery takes between 1 and 10 days, 5.51 on average, whatever is in the parcel.</li>
</ul>
<p>An r that close to zero, with a cloud that has no tilt, tells the operations director something useful: <b>no need to plan special slower routes for big orders</b>.</p>
<p>The second problem is the opposite: <b>too many dots</b>. When 10,000 or 25,000 dots are drawn, many land on top of each other, and the picture becomes a solid blob where you cannot tell a crowd from a few. This is called <b>overplotting</b>. Two fixes:</p>
<ol>
<li><b>Transparency.</b> Set <code>alpha</code> between 0 and 1. A dot with <code>alpha=0.25</code> is 75 percent see-through, so where many dots overlap, the colour builds up and darkens. Dense areas look dense.</li>
<li><b>Sampling.</b> Draw a random subset. <code>master.sample(3000, random_state=1)</code> picks 3,000 random lines. The <code>random_state</code> fixes the dice so you get the same sample every time. Compute r on the full data, and draw only the sample.</li>
</ol>
<p>You also cut the dot size with <code>s=</code>. Smaller dots overlap less.</p>
<div class="callout watch"><b>Whole numbers make stripes.</b> When a column holds only a few different values, like quantity from 1 to 5 or delivery days from 1 to 10, the dots line up in vertical stripes. That is normal. Set <code>ax.set_xticks(range(1, 6))</code> so the axis shows only the whole numbers that exist, not values like 1.5.</div>
<div class="callout tip"><b>A zero is a result.</b> Do not hide a chart because it shows no pattern. “We checked, and there is no link” can save a team from a month of chasing a ghost.</div>`
    },
    {
      type: 'try',
      title: 'Quantity against unit price: a cloud with no tilt',
      body: `<p>We draw a random sample of 3,000 lines with <code>sample</code>, but compute r on all 25,000. The five columns are the five possible quantities. In each column the dots reach from cheap products to expensive ones in the same way. Nothing tilts: the columns are copies of each other.</p>
<p>That is what “no relationship” looks like. Compare it with the rising band in the last scatter and you will never confuse the two again.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

sample = master.sample(3000, random_state=1)
r = master["quantity"].corr(master["unit_price"])

fig, ax = plt.subplots(figsize=(8, 5))
ax.scatter(sample["quantity"], sample["unit_price"] / 1000, s=10, alpha=0.3)
ax.set_xticks(range(1, 6))
ax.set_title(f"Quantity against unit price (r = {r:.3f})")
ax.set_xlabel("Quantity on the line")
ax.set_ylabel("Unit price (thousands)")
plt.tight_layout()`
    },
    {
      id: 'py-7-3-ex5',
      type: 'exercise',
      title: 'Challenge: do big orders take longer to deliver?',
      body: `<p>The operations director asks: <i>“Do bigger orders take longer to arrive?”</i> Answer with a scatter plot. The starter code already finds the delivery time in days for every delivered order, in a table called <code>d</code> with columns <code>order_id</code> and <code>days</code>. Your job is to add the <b>order value in thousands</b> to <code>d</code> and draw <b>days along the bottom, value up the side</b>. Use these texts:</p>
<ul>
<li>Title: <code>Delivery days against order value</code></li>
<li>X label: <code>Days from dispatch to delivery</code></li>
<li>Y label: <code>Order value (thousands)</code></li>
</ul>
<p>No printing. Use <code>s=8</code> and <code>alpha=0.25</code> for the dots.</p>
<p><b>Think before you type:</b> you need one value per order: <code>master.groupby("order_id")["line_total"].sum()</code>. The <code>map</code> method looks up each order ID of <code>d</code> in that Series: <code>d["order_id"].map(totals)</code>.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nd = deliveries.dropna(subset=["delivery_date"]).copy()\nd["days"] = (pd.to_datetime(d["delivery_date"]) - pd.to_datetime(d["dispatch_date"])).dt.days\n\n# Write your code below\n`,
      hints: [
        `totals = master.groupby("order_id")["line_total"].sum(). Then d["value"] = d["order_id"].map(totals) / 1000. Then ax.scatter(d["days"], d["value"], s=8, alpha=0.25).`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\nd = deliveries.dropna(subset=["delivery_date"]).copy()\nd["days"] = (pd.to_datetime(d["delivery_date"]) - pd.to_datetime(d["dispatch_date"])).dt.days\n\ntotals = master.groupby("order_id")["line_total"].sum()\nd["value"] = d["order_id"].map(totals) / 1000\n\nfig, ax = plt.subplots(figsize=(8, 5))\nax.scatter(d["days"], d["value"], s=8, alpha=0.25)\nax.set_xticks(range(1, 11))\nax.set_title("Delivery days against order value")\nax.set_xlabel("Days from dispatch to delivery")\nax.set_ylabel("Order value (thousands)")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nd = deliveries.dropna(subset=["delivery_date"]).copy()\nd["days"] = (pd.to_datetime(d["delivery_date"]) - pd.to_datetime(d["dispatch_date"])).dt.days\n\ntotals = master.groupby("order_id")["line_total"].sum()\nd["value"] = d["order_id"].map(totals) / 1000\n\nfig, ax = plt.subplots(figsize=(8, 5))\nax.scatter(d["days"], d["value"], s=8, alpha=0.25)\nax.set_xticks(range(1, 11))\nax.set_title("Delivery days against order value")\nax.set_xlabel("Days from dispatch to delivery")\nax.set_ylabel("Order value (thousands)")\nplt.tight_layout()`,
      ordered: true
    },
    {
      id: 'py-7-3-c3',
      type: 'check',
      title: 'Your delivery scatter shows ten identical columns with no tilt, and r = 0.007. What do you tell the operations director?',
      body: `<p>Think about what a flat, shapeless cloud means for the question that was asked.</p>`,
      options: [
        'The chart failed, so we need different data',
        'There is no link between order value and delivery time: big orders are not slower, so there is no case for special handling based on size',
        'Delivery time causes order value to stay low',
        'Delivery times are all identical'
      ],
      answer: 1,
      why: [
        'The chart worked perfectly. A cloud with no tilt is the answer to the question, not a failure of the chart.',
        'Right! r is almost exactly zero and the columns for 1 to 10 days look the same, so order size does not predict delivery time. If the director wanted to slow-track big orders, the data gives no reason to do so.',
        'With r at zero there is no link in either direction, so there is nothing to explain with cause.',
        'Delivery times vary from 1 to 10 days (5.51 on average). What is the same across the columns is the spread of order values, not the days.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You can now look at the shape of data and the links between columns, which is the heart of exploring a dataset. You can:</p>
<ul>
<li>Draw a <b>histogram</b> with <code>ax.hist</code>, choose the number of <b>bins</b> sensibly, and say what the heights mean</li>
<li>Explain why a <b>mean</b> and a <b>median</b> differ on skewed data, and mark both with <code>axvline</code></li>
<li>Use a <b>log scale</b> with <code>set_xscale("log")</code> and <code>np.logspace</code> bins for a long tail, and label it honestly</li>
<li>Draw a <b>scatter plot</b>, compute <b>r</b> with <code>.corr()</code>, and read it with its square in mind</li>
<li>Handle <b>overplotting</b> with <code>alpha</code>, small dots and <code>sample</code></li>
<li>Recognise that <b>no relationship</b> is a real finding, and that correlation is not causation</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is the difference between a histogram and a bar chart?</li>
<li>A dataset has a mean much higher than its median. What does that suggest, and what would you report?</li>
<li>Two columns have a correlation of 0.6. What can you say, and what can you not say?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A bar chart compares separate categories, each with its own bar, and the order of the bars is a choice. A histogram shows the distribution of one continuous number: the number line is cut into equal bins, the bars touch, and each height is how many values fall in that bin. The bar chart answers “which is bigger”, the histogram answers “how are the values spread”.</p>
<p><b>2.</b> It suggests a right-skewed distribution: a few very large values are pulling the mean up. For a typical case I would report the median, and I would mention the mean too, and state clearly that they differ and why. I would also look at the histogram to see how long the tail is, and whether the large values are real or errors.</p>
<p><b>3.</b> I can say the two columns tend to rise together, with a fairly strong link, and that the first one explains roughly a third of the variation in the second, since 0.6 squared is 0.36. I cannot say that one causes the other, that the link holds for every individual case, or that the relationship is a straight line unless the scatter plot shows one. I would draw the scatter plot to check for a curve, clusters or outliers before trusting the number.</p>
</details>
<p><b>Coming next, in lesson 7.4:</b> chart design and the board pack. You now know how to draw the right chart. The last lesson of Module 7 is about drawing it <i>well</i>: titles that state a finding, colour that points the eye, small multiples, a curve that tests the famous 80/20 rule on TradeFlow’s customers, and finally a four-panel board pack that you put together yourself.</p>`
    }
  ]
},
{
  id: 'py-7-4',
  track: 'python',
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

master = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")
master = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")
master = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
master["line_total"] = master["quantity"] * master["unit_price"]
master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")
master["order_year"] = master["order_date"].dt.year
`,
  preloaded: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items', 'master'],
  title: '7.4 Chart design and the board pack',
  tables: [],
  intro: `The board meeting is on Thursday. The CEO has one request: <i>“One page. Four pictures. If a director reads nothing else, they should still leave knowing what TradeFlow looks like.”</i><br><br>You can already draw the right chart for a question. This last lesson of Module 7 is about drawing it <b>well</b>, because the same numbers can leave a director confused or convinced, depending on a few design choices. You will learn how to make a chart that points at its own message, how to put several small charts side by side, and how to test one of business’s favourite sayings, the 80/20 rule, on TradeFlow’s real customers.<br><br>Then comes the finale of the module: you build the CEO’s one-page board pack, four panels on a single figure, entirely from code. The master table is loaded, as before.`,
  steps: [
    {
      type: 'explain',
      title: 'How charts mislead, and the one rule that prevents it',
      body: `<p>Most misleading charts are not made by liars. They are made by tired people who accepted a default. Here are the traps, with the fix for each. Check every chart you make against this list before it leaves your hands.</p>
<table class="mini">
<tr><th>The trap</th><th>Why it misleads</th><th>The fix</th></tr>
<tr><td><b>Bars that do not start at zero</b></td><td>Lengths stop matching values (lesson 7.2)</td><td>Start at zero, state the gap in words</td></tr>
<tr><td><b>A stretched or squeezed axis on a line</b></td><td>Noise looks like a crisis, or a real change looks flat (lesson 7.1)</td><td>Choose the range on purpose and keep numbers readable</td></tr>
<tr><td><b>Two vertical axes (dual axes)</b></td><td>The author controls both ranges, so lines can be made to cross or match at will</td><td>Draw two charts one above the other</td></tr>
<tr><td><b>3D effects</b></td><td>Depth distorts size: the front looks bigger</td><td>Keep every chart flat</td></tr>
<tr><td><b>Pies with many slices</b></td><td>The eye cannot compare angles</td><td>Sorted bars with labels</td></tr>
<tr><td><b>An incomplete period</b></td><td>A half year looks like a collapse (the 2026 trap)</td><td>Compare like with like, label the period</td></tr>
<tr><td><b>Rainbow colours</b></td><td>Colour suggests meaning that is not there</td><td>One colour for the main thing, grey for the rest</td></tr>
</table>
<p>Behind the list stands one rule, and it is the best piece of advice in this module: <b>one chart, one message</b>. Before you draw, finish this sentence: “The chart shows that ...”. If you cannot, the chart is not ready. If you can, that sentence is probably your title.</p>
<p>That brings us to titles. Compare two titles for the same chart:</p>
<ul>
<li><b>A label title:</b> “Revenue by category”. It names the picture. The reader must work out the message.</li>
<li><b>A finding title:</b> “Electronics earns 38% of revenue”. It states the message. The reader who reads only the title still understands.</li>
</ul>
<p>In a board pack, use finding titles. Keep label titles for technical appendices. A finding title must be <b>true and checkable</b>: Electronics’ share is 38.45 percent, so “38%” is honest.</p>
<div class="callout analogy"><b>The newspaper headline.</b> Editors do not head an article “Events of Tuesday”. They write “Council votes to close the market”. A chart title is the headline of the picture.</div>`
    },
    {
      type: 'try',
      title: 'The same numbers, before and after design',
      body: `<p>Both panels show the same five categories. The left one is the default: vertical bars in alphabetical order, every bar the same blue, a label title, and tilted names. It is correct, but it makes the reader work.</p>
<p>The right one applies the habits you are about to learn: bars sorted so that the biggest comes first, <b>one colour for the one thing that matters</b> (Electronics in amber) and grey-blue for the rest, the value written on each bar, no top or right frame lines, and a title that states the finding. A director understands the right chart in two seconds.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

share = master.groupby("category")["line_total"].sum() / master["line_total"].sum() * 100
ranked = share.sort_values()
colours = ["#f5b301" if name == "Electronics" else "#5f7d9c" for name in ranked.index]

fig, axes = plt.subplots(1, 2, figsize=(12, 4))
axes[0].bar(share.index, share.values)
axes[0].set_title("Revenue by category")
axes[0].tick_params(axis="x", labelrotation=30)

bars = axes[1].barh(ranked.index, ranked.values, color=colours)
axes[1].bar_label(bars, fmt="%.0f%%", padding=3)
axes[1].set_xlim(0, 45)
axes[1].set_title("Electronics earns 38% of revenue")
for side in ["top", "right"]:
    axes[1].spines[side].set_visible(False)
plt.tight_layout()`
    },
    {
      type: 'explain',
      title: 'Six small moves that make a chart say something',
      body: `<p>Look at what changed in the right panel above. Each change is small, and together they turn a picture into a message.</p>
<p><b>1. Sort.</b> Biggest first, as in lesson 7.2. For sideways bars there is a trick: if you sort <i>ascending</i> before drawing, the biggest bar lands at the top without any <code>invert_yaxis</code>.</p>
<p><b>2. Use colour as a spotlight.</b> Choose one bright colour, the amber <code>#f5b301</code>, for the thing you want people to look at, and one quiet colour, the grey-blue <code>#5f7d9c</code>, for everything else. You build the list with a short loop written on one line: <code>["#f5b301" if name == "Electronics" else "#5f7d9c" for name in ranked.index]</code>. Read it aloud: “for each category name, use amber if it is Electronics, otherwise grey-blue”. Then pass it with <code>color=colours</code>. Colour should <b>mean</b> something, and it should mean the same thing in every chart of the same pack.</p>
<p><b>3. Write the number on the bar.</b> You know <code>bar_label</code> already. The format <code>"%.0f%%"</code> prints a whole number followed by a percent sign: the doubled <code>%%</code> is how you write a literal percent sign in this format.</p>
<p><b>4. Remove clutter.</b> Frame lines on the top and the right carry no information. <code>ax.spines["top"].set_visible(False)</code> removes one. Every pixel that does not carry information is a pixel competing with the message that does.</p>
<p><b>5. Title the finding.</b> As discussed: a short sentence with a number in it.</p>
<p><b>6. Annotate the one thing.</b> From lesson 7.1: <code>scatter</code> for a dot and <code>annotate</code> for a note. A chart with a spotlight and a note guides the eye in a way a bare chart never can.</p>
<table class="mini">
<tr><th>Move</th><th>Code</th></tr>
<tr><td>Spotlight colour</td><td><code>color=colours</code> with a list built from the names</td></tr>
<tr><td>Numbers on bars</td><td><code>ax.bar_label(bars, fmt="%.0f%%", padding=3)</code></td></tr>
<tr><td>Remove frame lines</td><td><code>ax.spines["top"].set_visible(False)</code></td></tr>
<tr><td>Make room for labels</td><td><code>ax.set_xlim(0, 45)</code></td></tr>
<tr><td>Note with an arrow</td><td><code>ax.annotate("text", xy=(x, y), xytext=(...))</code></td></tr>
</table>
<div class="callout watch"><b>Restraint.</b> More colour and more decoration is not better design. If everything is highlighted, nothing is. One spotlight per chart, and no more than three or four colours across a whole pack.</div>`
    },
    {
      id: 'py-7-4-ex1',
      type: 'exercise',
      title: 'Your turn: mark the weakest month',
      body: `<p>The finance director asks: <i>“When was our weakest month, and how weak?”</i> Draw <b>monthly revenue in millions</b> as one line, mark the <b>weakest month</b> with a dot, and write a note next to it. Use these texts:</p>
<ul>
<li>Title: <code>Monthly revenue and its weakest month</code></li>
<li>X label: <code>Month</code></li>
<li>Y label: <code>Revenue (millions)</code></li>
</ul>
<p>The note should read <code>Weakest month: 32.65 million</code>. No printing. You should see a chart with <b>one line</b> (the dot and the note add none).</p>
<p><b>Think before you type:</b> the monthly series comes from grouping by month and summing <code>line_total</code>, divided by 1,000,000. <code>monthly.idxmin()</code> gives the weakest month, and <code>.to_timestamp()</code> turns it into a date for the dot.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\n# Write your code below\n`,
      hints: [
        `monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000. worst = monthly.idxmin().to_timestamp(). Then draw the line, ax.scatter([worst], [monthly.min()]) and ax.annotate(...).`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\nworst = monthly.idxmin().to_timestamp()\n\nfig, ax = plt.subplots(figsize=(9, 4))\nax.plot(monthly.index.to_timestamp(), monthly.values)\nax.scatter([worst], [monthly.min()], zorder=3, color="#ef9a9a")\nax.annotate("Weakest month: 32.65 million", xy=(worst, monthly.min()), xytext=(14, 6), textcoords="offset points")\nax.set_title("Monthly revenue and its weakest month")\nax.set_xlabel("Month")\nax.set_ylabel("Revenue (millions)")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\nworst = monthly.idxmin().to_timestamp()\n\nfig, ax = plt.subplots(figsize=(9, 4))\nax.plot(monthly.index.to_timestamp(), monthly.values)\nax.scatter([worst], [monthly.min()], zorder=3, color="#ef9a9a")\nax.annotate("Weakest month: 32.65 million", xy=(worst, monthly.min()), xytext=(14, 6), textcoords="offset points")\nax.set_title("Monthly revenue and its weakest month")\nax.set_xlabel("Month")\nax.set_ylabel("Revenue (millions)")\nplt.tight_layout()`,
      ordered: true
    },
    {
      id: 'py-7-4-ex2',
      type: 'exercise',
      title: 'Your turn: a spotlight on the status mix',
      body: `<p>In lesson 7.2 you learned that sideways bars beat a pie for the order status mix. Now make that chart board-ready. Draw the <b>share of orders by status</b> as sideways bars, sorted so that the biggest is at the top, with <b>Completed in amber</b> and the others in grey-blue, and the percentage written on each bar. Use these texts:</p>
<ul>
<li>Title: <code>74% of orders end as Completed</code></li>
<li>X label: <code>Share of orders (%)</code></li>
<li>Y label: <code>Order status</code></li>
</ul>
<p>No printing. You should see a chart with <b>four bars</b>.</p>
<p><b>Think before you type:</b> count different orders per status with <code>nunique</code>, divide by the total and multiply by 100, then <code>sort_values()</code> ascending so that the biggest ends at the top. Build the colour list with the one-line loop, then <code>ax.barh(..., color=colours)</code> and <code>ax.bar_label</code>.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\n# Write your code below\n`,
      hints: [
        `st = master.groupby("order_status")["order_id"].nunique(). share = (st / st.sum() * 100).sort_values(). colours = ["#f5b301" if name == "Completed" else "#5f7d9c" for name in share.index]. Then ax.barh(share.index, share.values, color=colours).`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\nst = master.groupby("order_status")["order_id"].nunique()\nshare = (st / st.sum() * 100).sort_values()\ncolours = ["#f5b301" if name == "Completed" else "#5f7d9c" for name in share.index]\n\nfig, ax = plt.subplots(figsize=(8, 4))\nbars = ax.barh(share.index, share.values, color=colours)\nax.bar_label(bars, fmt="%.1f%%", padding=3)\nax.set_xlim(0, 85)\nax.set_title("74% of orders end as Completed")\nax.set_xlabel("Share of orders (%)")\nax.set_ylabel("Order status")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nst = master.groupby("order_status")["order_id"].nunique()\nshare = (st / st.sum() * 100).sort_values()\ncolours = ["#f5b301" if name == "Completed" else "#5f7d9c" for name in share.index]\n\nfig, ax = plt.subplots(figsize=(8, 4))\nbars = ax.barh(share.index, share.values, color=colours)\nax.bar_label(bars, fmt="%.1f%%", padding=3)\nax.set_xlim(0, 85)\nax.set_title("74% of orders end as Completed")\nax.set_xlabel("Share of orders (%)")\nax.set_ylabel("Order status")\nplt.tight_layout()`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Several charts on one page: the grid and small multiples',
      body: `<p>Everything so far has been one chart per figure, or two side by side with <code>plt.subplots(1, 2)</code>. A board pack needs more. <code>plt.subplots(rows, columns)</code> builds a whole grid in one call. With <code>plt.subplots(2, 2)</code> you get four drawing areas, two rows by two columns. You receive them as <code>fig, axes = plt.subplots(2, 2, figsize=(12, 8))</code>.</p>
<p>You reach one panel by its position: <code>axes[0, 0]</code> is top left, <code>axes[0, 1]</code> is top right, <code>axes[1, 0]</code> is bottom left and <code>axes[1, 1]</code> is bottom right. The first number is the row and the second is the column, counting from zero, like the lists in Module 1. On each panel you use the same methods as before, with <code>ax.</code> in front: <code>plot</code>, <code>bar</code>, <code>hist</code>, <code>set_title</code>, <code>set_xlabel</code>.</p>
<p>If you want to loop over the panels, <code>axes.flat</code> hands them over one at a time in reading order, so <code>for ax, year in zip(axes.flat, years)</code> pairs each panel with a year.</p>
<p>The grid makes a powerful idea possible, called <b>small multiples</b>: <b>the same chart repeated once per group, side by side</b>. Remember the chart with four coloured lines, one per year? With four lines it was readable. With twelve, it would be spaghetti. The fix is to draw twelve tiny charts, each with one line. Because all the panels are built the same way, the eye learns the pattern from the first and compares the rest at a glance.</p>
<p>For that comparison to be fair, the panels must share a ruler. <code>sharey=True</code> in the <code>subplots</code> call forces every panel to use the same vertical scale. Without it, each panel would stretch to fill its own space, and a small wobble in one could look bigger than a large one in another.</p>
<div class="callout watch"><b>Mind the clutter.</b> Four panels have four titles, four sets of labels and four sets of ticks. Keep titles short (“2023”), put a long label only where it helps, and leave generous space with <code>plt.tight_layout()</code>.</div>
<div class="callout tip"><b>Use the same x range in every panel.</b> <code>ax.set_xlim(0.5, 12.5)</code> makes the January to December axis identical, so the half-year of 2026 is visibly half empty instead of being stretched to fill its panel.</div>`
    },
    {
      type: 'try',
      title: 'Orders per month, one small chart per year',
      body: `<p>Four panels, one per year, with a shared vertical ruler. The loop pairs each panel with a column of the table. <code>set_xlim(0.5, 12.5)</code> gives every panel the same twelve-month width.</p>
<p>Read across the page. Each year wobbles between about 205 and 275 orders and none stands out. The 2026 panel stops in June, and the shared ruler tells you honestly that its values are the same size as the others, so it is a shorter year, not a weaker one. This is the same finding as before, now seen four ways at once.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

orders_year = master.groupby([master["order_date"].dt.month, "order_year"])["order_id"].nunique().unstack()

fig, axes = plt.subplots(2, 2, figsize=(10, 6), sharey=True)
for ax, year in zip(axes.flat, orders_year.columns):
    ax.plot(orders_year.index, orders_year[year])
    ax.set_title(str(year))
    ax.set_xlim(0.5, 12.5)
    ax.set_xticks([1, 3, 5, 7, 9, 11])
    ax.set_ylabel("Orders")
plt.tight_layout()`
    },
    {
      id: 'py-7-4-ex3',
      type: 'exercise',
      title: 'Your turn: revenue in four small charts',
      body: `<p>Draw <b>monthly revenue in millions</b>, one panel for each year, in a 2 by 2 grid that <b>shares the vertical axis</b>. The title of each panel is its year, and each panel has the y label <code>Revenue (millions)</code>. The first panel is 2023, so that is the one the checker reads: its title must be <code>2023</code>, its y label <code>Revenue (millions)</code>.</p>
<p>No printing. You should see a figure whose first panel has <b>one line</b>.</p>
<p><b>Think before you type:</b> build the small table as in lesson 7.1, months as rows and years as columns, in millions. Make the grid with <code>sharey=True</code>. Loop with <code>zip(axes.flat, rev.columns)</code>. In the loop plot, title the panel with <code>str(year)</code>, set the y label, and set <code>ax.set_xlim(0.5, 12.5)</code>.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\n# Write your code below\n`,
      hints: [
        `rev = master.groupby([master["order_date"].dt.month, "order_year"])["line_total"].sum().unstack() / 1000000. Then fig, axes = plt.subplots(2, 2, figsize=(10, 6), sharey=True) and for ax, year in zip(axes.flat, rev.columns): ...`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\nrev = master.groupby([master["order_date"].dt.month, "order_year"])["line_total"].sum().unstack() / 1000000\n\nfig, axes = plt.subplots(2, 2, figsize=(10, 6), sharey=True)\nfor ax, year in zip(axes.flat, rev.columns):\n    ax.plot(rev.index, rev[year])\n    ax.set_title(str(year))\n    ax.set_xlim(0.5, 12.5)\n    ax.set_xticks([1, 3, 5, 7, 9, 11])\n    ax.set_ylabel("Revenue (millions)")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nrev = master.groupby([master["order_date"].dt.month, "order_year"])["line_total"].sum().unstack() / 1000000\n\nfig, axes = plt.subplots(2, 2, figsize=(10, 6), sharey=True)\nfor ax, year in zip(axes.flat, rev.columns):\n    ax.plot(rev.index, rev[year])\n    ax.set_title(str(year))\n    ax.set_xlim(0.5, 12.5)\n    ax.set_xticks([1, 3, 5, 7, 9, 11])\n    ax.set_ylabel("Revenue (millions)")\nplt.tight_layout()`,
      ordered: true
    },
    {
      id: 'py-7-4-c1',
      type: 'check',
      title: 'You must compare the monthly sales of 12 different products over three years. Which approach reads best?',
      body: `<p>Think about what happens to a chart with twelve lines on it.</p>`,
      options: [
        'One chart with twelve lines in twelve colours',
        'Twelve small charts, one per product, in a grid with a shared vertical axis',
        'A 3D chart with twelve slices',
        'A pie chart with one slice per product'
      ],
      answer: 1,
      why: [
        'Twelve lines tangle into spaghetti, and twelve colours cannot be told apart. The reader would have to trace each line by hand.',
        'Right! Small multiples give each product its own readable line, and a shared vertical ruler keeps the comparison fair. The reader learns the layout once and then compares at a glance.',
        '3D distorts values and a pie shows a share at one moment, not sales over time.',
        'A pie shows how a total splits at one moment. It cannot show change over three years.'
      ]
    },
    {
      type: 'explain',
      title: 'The 80/20 rule, tested: the concentration curve',
      body: `<p>A famous business saying claims that <b>20 percent of customers bring in 80 percent of revenue</b>. It is called the Pareto principle, after the economist who noticed a similar pattern in land ownership. Managers love it because it suggests a simple strategy: find the golden 20 percent and look after them. But is it true for TradeFlow? We do not argue, we measure.</p>
<p>The right chart is a <b>concentration curve</b>. Here is how to read one, and how it is built.</p>
<p>Sort the customers from the biggest spender to the smallest. Walk down the list, keeping a running total of revenue. At each step, ask two questions: “what share of the customers have I counted so far?” (the bottom axis) and “what share of the revenue do they account for?” (the side axis). Join those pairs and you get a curve that starts at the bottom left (nobody counted, no revenue) and ends at the top right (everybody counted, all the revenue).</p>
<p>A dashed diagonal line from corner to corner shows what <b>perfect equality</b> would look like: if every customer spent the same, the top 20 percent would bring in exactly 20 percent. The <b>more the curve bows above the diagonal, the more concentrated the revenue</b>. If the curve hugs the diagonal, revenue is spread evenly.</p>
<p>In code, the three steps are:</p>
<ol>
<li><code>cust = master.groupby("customer_id")["line_total"].sum().sort_values(ascending=False)</code>: the revenue of each customer, biggest first.</li>
<li><code>curve = np.concatenate([[0], cust.cumsum().values / cust.sum() * 100])</code>: the running total as a percent of all revenue, with a 0 stuck on the front so that the curve starts at the corner. <code>cumsum()</code> is the running total.</li>
<li><code>x = np.linspace(0, 100, len(cust) + 1)</code>: evenly spaced positions from 0 to 100 percent, one for each point of the curve.</li>
</ol>
<p>The curve has two lines on it, the data and the dashed diagonal, and the diagonal is drawn with <code>ax.plot([0, 100], [0, 100], linestyle="--")</code>.</p>
<div class="callout analogy"><b>Sharing a pizza.</b> If ten friends split a pizza equally, the biggest 2 friends eat 20 percent of it. If two greedy friends eat 80 percent, the curve bows steeply upward. The bow is the measure of how unfair the sharing is.</div>
<div class="callout work"><b>At work:</b> the Gini coefficient, used to measure income inequality, is a single number computed from a close cousin of this curve. Now you can draw the kind of picture behind it.</div>`
    },
    {
      type: 'try',
      title: 'Do 20% of products bring in 80% of revenue?',
      body: `<p>First, TradeFlow’s 150 products. The blue curve rises above the diagonal, so revenue is somewhat concentrated. The pink dot marks the 20 percent point: <b>the top 30 products earn 49 percent of revenue</b>. That is a long way from 80. Products are moderately concentrated, but the 80/20 rule is not what the data shows.</p>
<p>Read the code as a recipe. Sort, running total, spaced positions, draw both lines, mark one point. The note uses <code>arrowprops</code> to draw an arrow from the text to the dot.</p>`,
      code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

prod = master.groupby("product_id")["line_total"].sum().sort_values(ascending=False)
curve = np.concatenate([[0], prod.cumsum().values / prod.sum() * 100])
x = np.linspace(0, 100, len(prod) + 1)

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(x, curve, label="Actual products")
ax.plot([0, 100], [0, 100], linestyle="--", color="#f5b301", label="If every product earned the same")
ax.scatter([20], [curve[30]], zorder=3, color="#ef9a9a")
ax.annotate("Top 20% of products: 49% of revenue", xy=(20, curve[30]), xytext=(38, 18), arrowprops={"arrowstyle": "->", "color": "#e8f1fb"})
ax.legend(loc="lower right")
ax.set_title("Share of revenue earned by the top products")
ax.set_xlabel("Share of products (%)")
ax.set_ylabel("Share of revenue (%)")
plt.tight_layout()`
    },
    {
      id: 'py-7-4-ex4',
      type: 'exercise',
      title: 'Challenge: the same test for customers',
      body: `<p>The marketing manager asks the real question: <i>“Do a small number of customers carry the business?”</i> Draw the concentration curve for <b>customers</b>, with the dashed line for equal spending, using these texts:</p>
<ul>
<li>Title: <code>Share of revenue earned by the top customers</code></li>
<li>X label: <code>Share of customers (%)</code></li>
<li>Y label: <code>Share of revenue (%)</code></li>
</ul>
<p>No printing. You should see a chart with <b>two lines</b>: the curve and the dashed diagonal. Add a legend if you like.</p>
<p><b>Think before you type:</b> the recipe is the one from the try card, with customers in place of products. Group by <code>customer_id</code>, sort largest first, take the running total as a percent, concatenate a 0 at the front, and use <code>np.linspace(0, 100, len(cust) + 1)</code> for the x positions.</p>`,
      starter: `import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# Write your code below\n`,
      hints: [
        `cust = master.groupby("customer_id")["line_total"].sum().sort_values(ascending=False). curve = np.concatenate([[0], cust.cumsum().values / cust.sum() * 100]). x = np.linspace(0, 100, len(cust) + 1). Then ax.plot(x, curve) and ax.plot([0, 100], [0, 100], linestyle="--").`,
        `import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\ncust = master.groupby("customer_id")["line_total"].sum().sort_values(ascending=False)\ncurve = np.concatenate([[0], cust.cumsum().values / cust.sum() * 100])\nx = np.linspace(0, 100, len(cust) + 1)\n\nfig, ax = plt.subplots(figsize=(8, 5))\nax.plot(x, curve, label="Actual customers")\nax.plot([0, 100], [0, 100], linestyle="--", color="#f5b301", label="If every customer spent the same")\nax.legend(loc="lower right")\nax.set_title("Share of revenue earned by the top customers")\nax.set_xlabel("Share of customers (%)")\nax.set_ylabel("Share of revenue (%)")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\ncust = master.groupby("customer_id")["line_total"].sum().sort_values(ascending=False)\ncurve = np.concatenate([[0], cust.cumsum().values / cust.sum() * 100])\nx = np.linspace(0, 100, len(cust) + 1)\n\nfig, ax = plt.subplots(figsize=(8, 5))\nax.plot(x, curve, label="Actual customers")\nax.plot([0, 100], [0, 100], linestyle="--", color="#f5b301", label="If every customer spent the same")\nax.legend(loc="lower right")\nax.set_title("Share of revenue earned by the top customers")\nax.set_xlabel("Share of customers (%)")\nax.set_ylabel("Share of revenue (%)")\nplt.tight_layout()`,
      ordered: true
    },
    {
      id: 'py-7-4-c2',
      type: 'check',
      title: 'Your customer curve shows that the top 10% of customers earn 20.6% of revenue, the top 20% earn 36.1%, and you need 60.4% of customers to reach 80%. What is the conclusion?',
      body: `<p>Compare those figures with what the 80/20 rule claims.</p>`,
      options: [
        'The 80/20 rule holds: 20% of customers bring in 80% of revenue',
        'The 80/20 rule does not hold here. Revenue is only mildly concentrated, so TradeFlow does not depend on a small group of customers',
        'The data must be wrong, because the 80/20 rule is always true',
        'The curve is above the diagonal, so every customer spends the same'
      ],
      answer: 1,
      why: [
        'The top 20 percent bring in 36.1 percent, not 80. To reach 80 percent of revenue you need more than 60 percent of the customers.',
        'Right! The curve bows only gently above the diagonal. The top 10 percent earn about double their share (20.6 against 10), which is a real but modest tilt. The risk of losing a handful of big accounts is small, and a loyalty programme aimed at a tiny elite would miss most of the revenue.',
        'The 80/20 pattern is a rough observation that holds in some businesses and fails in others. The data decides, and here it says no.',
        'The diagonal represents equal spending. A curve above it means unequal spending. Here the gap is modest.'
      ]
    },
    {
      type: 'explain',
      title: 'Building the board pack',
      body: `<p>You now have every ingredient for the CEO’s one-page pack. What remains is composition, deciding what goes where. A few principles guide a good page.</p>
<ul>
<li><b>One message per panel.</b> Four panels, four findings. Each has a finding title.</li>
<li><b>The most important panel goes top left.</b> Western readers start there. For TradeFlow the headline is the product mix: Electronics.</li>
<li><b>Mix the chart types.</b> A bar chart, a line, a histogram and a curve each answer a different kind of question, and together they sketch the business: what it sells, how it moves, what an order looks like, and who it depends on.</li>
<li><b>Use the palette consistently.</b> Amber is the spotlight, grey-blue is the background, light blue is the default line. A director learns the code from the first panel.</li>
<li><b>Give the page a heading.</b> <code>fig.suptitle("...")</code> adds one title over the whole figure. Then <code>plt.tight_layout(rect=[0, 0, 1, 0.96])</code> leaves the top 4 percent of the page free so the heading does not collide with the panel titles.</li>
</ul>
<p>Here are the four panels and their findings, each of which you have already verified in this module:</p>
<table class="mini">
<tr><th>Panel</th><th>Chart</th><th>Finding title</th></tr>
<tr><td>Top left</td><td>Bars, Electronics in amber</td><td>Electronics earns 38% of revenue</td></tr>
<tr><td>Top right</td><td>Line, axis from zero</td><td>Revenue is flat: 33 to 44 million a month</td></tr>
<tr><td>Bottom left</td><td>Histogram</td><td>Most orders are small, a few are very large</td></tr>
<tr><td>Bottom right</td><td>Concentration curve</td><td>The top 20% of customers earn 36% of revenue</td></tr>
</table>
<p>A choice worth explaining: the top-right line uses <code>ax.set_ylim(0, 50)</code>, starting at zero. The title says “flat”, and a zoomed axis would make the same data look anything but. The honest axis supports the honest message.</p>
<div class="callout watch"><b>The first panel is the one the checker reads.</b> In the exercise that follows, your first panel (<code>axes[0, 0]</code>) must carry the exact title and labels in the task. The other three should be built the same way, but they are yours to judge by eye.</div>
<div class="callout tip"><b>Longer is not better.</b> A page with four clear findings beats a page with twelve. If a director can state the four findings back to you after thirty seconds, the pack has worked.</div>`
    },
    {
      type: 'try',
      title: 'The finished board pack',
      body: `<p>This is the full page. Read the code from top to bottom. The first block prepares the data, using only recipes you have already met. The second block draws the four panels, one at a time, on their grid positions. The last two lines add the heading and tidy the spacing.</p>
<p>Take a minute with the picture and say the four findings out loud: <i>Electronics earns 38 percent. Revenue is flat. Most orders are small and a few are very large. The top 20 percent of customers earn 36 percent, not 80.</i> That is the whole business on one page, and you drew all of it.</p>`,
      code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

share = (master.groupby("category")["line_total"].sum() / master["line_total"].sum() * 100).sort_values(ascending=False)
monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000
values = master.groupby("order_id")["line_total"].sum() / 1000
cust = master.groupby("customer_id")["line_total"].sum().sort_values(ascending=False)
curve = np.concatenate([[0], cust.cumsum().values / cust.sum() * 100])
x = np.linspace(0, 100, len(cust) + 1)
colours = ["#f5b301", "#5f7d9c", "#5f7d9c", "#5f7d9c", "#5f7d9c"]

fig, axes = plt.subplots(2, 2, figsize=(12, 8))

axes[0, 0].bar(share.index, share.values, color=colours)
axes[0, 0].tick_params(axis="x", labelrotation=20)
axes[0, 0].set_title("Electronics earns 38% of revenue")
axes[0, 0].set_xlabel("Category")
axes[0, 0].set_ylabel("Share of revenue (%)")

axes[0, 1].plot(monthly.index.to_timestamp(), monthly.values)
axes[0, 1].set_ylim(0, 50)
axes[0, 1].set_title("Revenue is flat: 33 to 44 million a month")
axes[0, 1].set_xlabel("Month")
axes[0, 1].set_ylabel("Revenue (millions)")

axes[1, 0].hist(values, bins=20, edgecolor="#0f2744")
axes[1, 0].set_title("Most orders are small, a few are very large")
axes[1, 0].set_xlabel("Order value (thousands)")
axes[1, 0].set_ylabel("Number of orders")

axes[1, 1].plot(x, curve)
axes[1, 1].plot([0, 100], [0, 100], linestyle="--", color="#f5b301")
axes[1, 1].set_title("The top 20% of customers earn 36% of revenue")
axes[1, 1].set_xlabel("Share of customers (%)")
axes[1, 1].set_ylabel("Share of revenue (%)")

fig.suptitle("TradeFlow board pack: four findings from the data", fontsize=14)
plt.tight_layout(rect=[0, 0, 1, 0.96])`
    },
    {
      id: 'py-7-4-ex5',
      type: 'exercise',
      title: 'Final challenge: build the board pack',
      body: `<p>Now you build it. The starter code prepares all the data for you: <code>share</code> (category shares, biggest first), <code>monthly</code> (monthly revenue in millions), <code>values</code> (order values in thousands), and <code>curve</code> with <code>x</code> (the customer concentration curve). Your job is the <b>2 by 2 grid</b>.</p>
<p>Build the four panels as in the table of the last explain card. The first panel, top left, is the one the checker reads, so use exactly these texts for it:</p>
<ul>
<li>Title: <code>Electronics earns 38% of revenue</code></li>
<li>X label: <code>Category</code></li>
<li>Y label: <code>Share of revenue (%)</code></li>
</ul>
<p>It must be a bar chart with <b>five bars</b>, Electronics in amber. For the other panels use the titles from the table, a line for revenue with its y axis starting at zero (<code>set_ylim(0, 50)</code>), a histogram of 20 bins, and the curve with its dashed diagonal. Finish with <code>fig.suptitle</code> and <code>plt.tight_layout(rect=[0, 0, 1, 0.96])</code>. No printing.</p>
<p><b>Think before you type:</b> make the grid first. Then work panel by panel, each as its own small block, using <code>axes[row, column]</code>. Draw, title, label, and move on to the next. The recipe for every panel is already in your hands from lessons 7.1 to 7.3.</p>`,
      starter: `import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\nshare = (master.groupby("category")["line_total"].sum() / master["line_total"].sum() * 100).sort_values(ascending=False)\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\nvalues = master.groupby("order_id")["line_total"].sum() / 1000\ncust = master.groupby("customer_id")["line_total"].sum().sort_values(ascending=False)\ncurve = np.concatenate([[0], cust.cumsum().values / cust.sum() * 100])\nx = np.linspace(0, 100, len(cust) + 1)\n\n# Write your code below\n`,
      hints: [
        `Start with fig, axes = plt.subplots(2, 2, figsize=(12, 8)). Top left: axes[0, 0].bar(share.index, share.values, color=[...amber first, then grey-blue...]) with the title and the labels from the task. Then do axes[0, 1], axes[1, 0] and axes[1, 1] one at a time.`,
        `import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\nshare = (master.groupby("category")["line_total"].sum() / master["line_total"].sum() * 100).sort_values(ascending=False)\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\nvalues = master.groupby("order_id")["line_total"].sum() / 1000\ncust = master.groupby("customer_id")["line_total"].sum().sort_values(ascending=False)\ncurve = np.concatenate([[0], cust.cumsum().values / cust.sum() * 100])\nx = np.linspace(0, 100, len(cust) + 1)\ncolours = ["#f5b301", "#5f7d9c", "#5f7d9c", "#5f7d9c", "#5f7d9c"]\n\nfig, axes = plt.subplots(2, 2, figsize=(12, 8))\n\naxes[0, 0].bar(share.index, share.values, color=colours)\naxes[0, 0].tick_params(axis="x", labelrotation=20)\naxes[0, 0].set_title("Electronics earns 38% of revenue")\naxes[0, 0].set_xlabel("Category")\naxes[0, 0].set_ylabel("Share of revenue (%)")\n\naxes[0, 1].plot(monthly.index.to_timestamp(), monthly.values)\naxes[0, 1].set_ylim(0, 50)\naxes[0, 1].set_title("Revenue is flat: 33 to 44 million a month")\naxes[0, 1].set_xlabel("Month")\naxes[0, 1].set_ylabel("Revenue (millions)")\n\naxes[1, 0].hist(values, bins=20, edgecolor="#0f2744")\naxes[1, 0].set_title("Most orders are small, a few are very large")\naxes[1, 0].set_xlabel("Order value (thousands)")\naxes[1, 0].set_ylabel("Number of orders")\n\naxes[1, 1].plot(x, curve)\naxes[1, 1].plot([0, 100], [0, 100], linestyle="--", color="#f5b301")\naxes[1, 1].set_title("The top 20% of customers earn 36% of revenue")\naxes[1, 1].set_xlabel("Share of customers (%)")\naxes[1, 1].set_ylabel("Share of revenue (%)")\n\nfig.suptitle("TradeFlow board pack: four findings from the data", fontsize=14)\nplt.tight_layout(rect=[0, 0, 1, 0.96])`
      ],
      solution: `import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\nshare = (master.groupby("category")["line_total"].sum() / master["line_total"].sum() * 100).sort_values(ascending=False)\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\nvalues = master.groupby("order_id")["line_total"].sum() / 1000\ncust = master.groupby("customer_id")["line_total"].sum().sort_values(ascending=False)\ncurve = np.concatenate([[0], cust.cumsum().values / cust.sum() * 100])\nx = np.linspace(0, 100, len(cust) + 1)\ncolours = ["#f5b301", "#5f7d9c", "#5f7d9c", "#5f7d9c", "#5f7d9c"]\n\nfig, axes = plt.subplots(2, 2, figsize=(12, 8))\n\naxes[0, 0].bar(share.index, share.values, color=colours)\naxes[0, 0].tick_params(axis="x", labelrotation=20)\naxes[0, 0].set_title("Electronics earns 38% of revenue")\naxes[0, 0].set_xlabel("Category")\naxes[0, 0].set_ylabel("Share of revenue (%)")\n\naxes[0, 1].plot(monthly.index.to_timestamp(), monthly.values)\naxes[0, 1].set_ylim(0, 50)\naxes[0, 1].set_title("Revenue is flat: 33 to 44 million a month")\naxes[0, 1].set_xlabel("Month")\naxes[0, 1].set_ylabel("Revenue (millions)")\n\naxes[1, 0].hist(values, bins=20, edgecolor="#0f2744")\naxes[1, 0].set_title("Most orders are small, a few are very large")\naxes[1, 0].set_xlabel("Order value (thousands)")\naxes[1, 0].set_ylabel("Number of orders")\n\naxes[1, 1].plot(x, curve)\naxes[1, 1].plot([0, 100], [0, 100], linestyle="--", color="#f5b301")\naxes[1, 1].set_title("The top 20% of customers earn 36% of revenue")\naxes[1, 1].set_xlabel("Share of customers (%)")\naxes[1, 1].set_ylabel("Share of revenue (%)")\n\nfig.suptitle("TradeFlow board pack: four findings from the data", fontsize=14)\nplt.tight_layout(rect=[0, 0, 1, 0.96])`,
      ordered: true
    },
    {
      id: 'py-7-4-c3',
      type: 'check',
      title: 'A colleague draws monthly revenue as bars on a left axis (0 to 50 million) and monthly orders as a line on a right axis (200 to 280). The two seem to move together. What is the main risk of this dual-axis chart?',
      body: `<p>Think about who chooses the two ranges.</p>`,
      options: [
        'None. Dual axes are the standard way to compare two measures',
        'The author picks both ranges, so the two series can be made to look linked, crossing or tracking each other, just by the choice of scales. The apparent relationship may be created by the axes, not the data',
        'The right axis cannot start above zero',
        'Bars and lines can never be drawn on the same figure'
      ],
      answer: 1,
      why: [
        'Dual axes are common, which is the problem. They invite the reader to see a link that the ranges created.',
        'Right! Change the right axis from 200 to 280 into 150 to 300, and the line moves. A viewer who sees the line and bars rise and fall together may believe they are linked. If you want to compare two measures, draw two charts stacked above each other with the same months, or compute r and check it.',
        'A line axis may start anywhere. That freedom is exactly what makes dual axes easy to abuse.',
        'They can be combined. The issue is the two independent rulers, not the mix of chart types.'
      ]
    },
    {
      type: 'explain',
      title: 'Module 7 complete: what you can do now',
      body: `<p>Module 7 is finished. You started with a three-minute slot on stage and a request for one picture. You now have a full charting toolkit, and, more importantly, a habit: asking what a chart will make people feel before it goes in front of them. You can:</p>
<ul>
<li>Draw <b>lines</b> for change over time, smooth them with a <b>moving average</b>, and add a <b>reference line</b> and a marked point</li>
<li>Draw <b>bars</b> (upright, sideways, stacked, grouped) and obey the <b>zero rule</b></li>
<li>Draw <b>histograms</b> and choose bins, compare <b>mean and median</b>, and use a <b>log scale</b> for a long tail</li>
<li>Draw <b>scatter plots</b>, compute and read <b>r</b>, and handle <b>overplotting</b></li>
<li>Design for the reader: <b>finding titles</b>, a <b>spotlight colour</b>, numbers on bars, less clutter</li>
<li>Build <b>small multiples</b> and a full <b>2 by 2 board pack</b> with <code>plt.subplots</code></li>
<li>Test the <b>80/20 rule</b> with a concentration curve, and report what the data actually says</li>
<li>Spot the standard <b>chart traps</b>: truncated axes, dual axes, 3D, crowded pies, partial periods</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>How do you decide which chart type to use for a given question?</li>
<li>What makes a chart “board-ready”?</li>
<li>Someone tells you “20 percent of our customers bring 80 percent of our revenue”. How would you check it?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I start from the question, not the chart. Change over time points to a line. Comparing categories points to bars, sorted and starting at zero. The shape of one numeric column points to a histogram. The link between two numeric columns points to a scatter plot, with r to put a number on it. A part-to-whole mix with only a few categories can be a sorted bar chart. I then check the chart against the traps: axis, period, colour and clutter.</p>
<p><b>2.</b> It carries one clear message, stated in a finding title that is true and checkable. It uses one spotlight colour for the point and quiet colours for the rest. Its axes are labelled with units, the bars start at zero, the periods compare like with like, and there is no decoration that does not carry information. A director should understand it in a few seconds without a speaker.</p>
<p><b>3.</b> I would sort customers by revenue, take the running total as a share of all revenue, and plot it against the share of customers, with a diagonal showing equal spending. Then I would read the revenue share at the 20 percent mark and the customer share needed to reach 80 percent. For TradeFlow the top 20 percent earn about 36 percent, and about 60 percent of customers are needed to reach 80 percent, so the rule does not hold.</p>
</details>
<p><b>Coming next: Module 8, Automating Analyst Workflows.</b> This is the last module of the Python track. You have done the analysis many times by hand. Now you teach Python to do it for you. You will turn your recipes into <b>functions</b>, check your own data with <b>assert</b> statements, and build a pipeline that cleans the data, runs the checks and produces the full report in one command, the way a professional analyst saves hours every week.</p>`
    }
  ]
}
);
