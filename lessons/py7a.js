LESSONS.push(
{
  id: 'py-7-1',
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
  title: '7.1 Your first charts: lines for change over time',
  tables: [],
  intro: `The CEO stops you in the corridor. <i>“I have three minutes on stage at the board meeting,”</i> she says. <i>“I cannot read out a table to forty people. Give me one picture that shows how the business has been moving.”</i><br><br>You have spent six modules getting the numbers right. Now comes the part the audience actually sees. A good chart does not decorate an analysis. It <b>is</b> the analysis, delivered in the one form a room full of busy people can take in at a glance.<br><br>In this lesson you learn to draw the most useful chart in business, the <b>line chart</b>, which shows how something changes over time. You will draw TradeFlow’s orders and revenue month by month, smooth out the noise, mark the best month, and learn the one trick that can make the same data look calm or alarming. The master table is already loaded, exactly as in Module 6.`,
  steps: [
    {
      type: 'explain',
      title: 'A chart is an argument made with ink',
      body: `<p>Think of a chart as a sentence the reader understands without reading. A table says “here are 42 numbers, work it out yourself”. A line chart says “look, this went up, then flattened”. The work of spotting the pattern moves from the reader’s head to the picture.</p>
<p>Python draws charts with a library called <b>Matplotlib</b>. By long habit, everyone imports its drawing module under the short name <code>plt</code>:</p>
<p><code>import matplotlib.pyplot as plt</code></p>
<p>Every chart is built from the same few parts, and it helps to know their names:</p>
<table class="mini">
<tr><th>Part</th><th>What it is</th><th>The picture</th></tr>
<tr><td><b>Figure</b></td><td>The whole sheet of paper</td><td><code>plt.figure(figsize=(9, 4))</code> makes it 9 wide and 4 tall</td></tr>
<tr><td><b>Axes</b></td><td>The drawing area with its two rulers</td><td>Created for you when you draw</td></tr>
<tr><td><b>Line</b></td><td>The data itself</td><td><code>plt.plot(x, y)</code></td></tr>
<tr><td><b>Title</b></td><td>What the chart is about</td><td><code>plt.title("...")</code></td></tr>
<tr><td><b>Axis labels</b></td><td>What each ruler measures, with units</td><td><code>plt.xlabel("...")</code> and <code>plt.ylabel("...")</code></td></tr>
</table>
<p>Every chart in this module follows the same five-step recipe: make the figure, draw the data, add the title, add the labels, and finish with <code>plt.tight_layout()</code>. That last line tidies the spacing so that no label is cut off at the edge.</p>
<div class="callout watch"><b>Three house rules on this platform.</b> First, do not write <code>plt.show()</code>. The platform shows your chart automatically when your code finishes. Second, always end a chart with <code>plt.tight_layout()</code> as the last line. Third, the very first chart of a session takes longer, because the drawing library has to load into your browser. Be patient once, and it is quick afterwards.</div>
<div class="callout work"><b>At work:</b> in a real notebook you would write <code>plt.show()</code> at the end, and you will see it in most tutorials. It is harmless to know. Here the platform does it for you.</div>`
    },
    {
      type: 'try',
      title: 'Your very first chart',
      body: `<p>Start small, so that every line is clear. These are the orders TradeFlow received in the first six months of 2023, one number per month. You supply two lists: the positions along the bottom (<code>months</code>) and the heights (<code>orders</code>). <code>plt.plot</code> joins the dots.</p>
<p>Press <b>Run</b>. The first chart takes a moment to load. Then read it: the line dips in February to 206 orders and jumps to 263 in March. That is the whole story of the first quarter, visible in one second.</p>`,
      code: `import matplotlib.pyplot as plt

months = [1, 2, 3, 4, 5, 6]
orders = [241, 206, 263, 230, 249, 234]

plt.figure(figsize=(7, 3.5))
plt.plot(months, orders)
plt.title("Orders, January to June 2023")
plt.xlabel("Month number")
plt.ylabel("Orders")
plt.tight_layout()`
    },
    {
      type: 'explain',
      title: 'Putting time along the bottom',
      body: `<p>A <b>line chart</b> is for one job: showing how something changes <b>over time</b>. Time goes along the bottom, left to right, the way we read. The value goes up the side. Joining the dots tells the eye “these points belong in this order”. That is why you would not use a line for countries: Ghana is not “before” Kenya, so a line between them would say something false. Lesson 7.2 gives categories their own chart.</p>
<p>To draw a month-by-month line you first need a <b>monthly series</b>: one number per month. You already know how to build one. Group the master table by month, and count the different orders in each:</p>
<p><code>monthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()</code></p>
<p>Read it aloud: “take the master table, group it by the month of the order date, and in each group count the different order IDs.” The word <code>nunique</code> matters. An order has between 2 and 7 lines, so counting rows would count the same order several times. Counting <b>different order IDs</b> gives real orders.</p>
<p>The result is a series of <b>42 numbers</b>, from January 2023 to June 2026, and its labels are <b>periods</b>, which are months in Pandas’ own format. Matplotlib wants real dates along the bottom, so you convert them with <code>monthly.index.to_timestamp()</code>. Then <code>plt.plot(dates, monthly.values)</code> draws the line, where <code>.values</code> gives just the numbers, without labels.</p>
<div class="callout analogy"><b>Two lists, one picture.</b> Every line chart is a list of “where along the bottom” and a list of “how high”. They must be the same length, like a row of dots on a ruler and a row of heights. If they differ, Matplotlib stops with an error that says the shapes do not match. Check the lengths first when that happens.</div>`
    },
    {
      type: 'try',
      title: 'Orders per month, all 42 months',
      body: `<p>Here is the CEO’s first picture. Read the code line by line: build the monthly series, turn its labels into dates, then draw.</p>
<p>What do you see? Orders wander between about 206 and 274 a month. There is no staircase going up and no cliff going down. The business is <b>steady</b>, with noise around a middle of 238 orders. That is a real finding, and you reached it with one chart rather than a page of figures.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

monthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()
dates = monthly.index.to_timestamp()

plt.figure(figsize=(9, 4))
plt.plot(dates, monthly.values)
plt.title("Orders per month")
plt.xlabel("Month")
plt.ylabel("Orders")
plt.tight_layout()`
    },
    {
      id: 'py-7-1-ex1',
      type: 'exercise',
      title: 'Your turn: the second half of 2023',
      body: `<p>The Head of Data wants to look at <b>July to December 2023</b> only. The monthly series is already built for you in the starter code. Cut out those six months, then draw them as a line chart with exactly these texts:</p>
<ul>
<li>Title: <code>Orders per month, second half of 2023</code></li>
<li>X label: <code>Month</code></li>
<li>Y label: <code>Orders</code></li>
</ul>
<p>Do not print anything. You should see a chart with <b>one line</b>.</p>
<p><b>Think before you type:</b> a monthly series can be cut with two month labels written as text, like <code>monthly["2023-07":"2023-12"]</code>. After the cut, convert its labels with <code>.index.to_timestamp()</code> and plot them against <code>.values</code>.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()\n\n# Write your code below\n`,
      hints: [
        `Cut with half = monthly["2023-07":"2023-12"]. Then plt.plot(half.index.to_timestamp(), half.values), add the title and the two labels, and end with plt.tight_layout().`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()\nhalf = monthly["2023-07":"2023-12"]\n\nplt.figure(figsize=(8, 4))\nplt.plot(half.index.to_timestamp(), half.values)\nplt.title("Orders per month, second half of 2023")\nplt.xlabel("Month")\nplt.ylabel("Orders")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()\nhalf = monthly["2023-07":"2023-12"]\n\nplt.figure(figsize=(8, 4))\nplt.plot(half.index.to_timestamp(), half.values)\nplt.title("Orders per month, second half of 2023")\nplt.xlabel("Month")\nplt.ylabel("Orders")\nplt.tight_layout()`,
      ordered: true
    },
    {
      id: 'py-7-1-ex2',
      type: 'exercise',
      title: 'Your turn: the whole story, built from scratch',
      body: `<p>Now do the full job yourself, including the monthly series. Draw <b>orders per month for all 42 months</b> as a line chart with these texts:</p>
<ul>
<li>Title: <code>Orders per month, January 2023 to June 2026</code></li>
<li>X label: <code>Month</code></li>
<li>Y label: <code>Orders</code></li>
</ul>
<p>No printing. You should see <b>one line</b>.</p>
<p><b>Think before you type:</b> three small jobs in order. Build the series (group by month, count different order IDs). Convert its labels to dates. Draw, label and tidy.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\n# Write your code below\n`,
      hints: [
        `Start with monthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique(). Then plot monthly.index.to_timestamp() against monthly.values.`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()\n\nplt.figure(figsize=(9, 4))\nplt.plot(monthly.index.to_timestamp(), monthly.values)\nplt.title("Orders per month, January 2023 to June 2026")\nplt.xlabel("Month")\nplt.ylabel("Orders")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()\n\nplt.figure(figsize=(9, 4))\nplt.plot(monthly.index.to_timestamp(), monthly.values)\nplt.title("Orders per month, January 2023 to June 2026")\nplt.xlabel("Month")\nplt.ylabel("Orders")\nplt.tight_layout()`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Noise and signal: the moving average',
      body: `<p>Look again at the monthly chart. It zigzags. February 2023 has 206 orders and the very next month has 263. Did the business change in a month? No. Most of that zigzag is <b>noise</b>: ordinary ups and downs that mean nothing, like the way a tea kettle rattles before it boils. If there is a real direction underneath, it is the <b>signal</b>.</p>
<p>The standard way to separate them is a <b>moving average</b>, sometimes called a rolling average. For each month you do not use that month alone. You use the <b>average of the last few months</b>. A single odd month gets diluted by its neighbours, and the zigzag calms down.</p>
<p>In Pandas it is one short phrase: <code>monthly.rolling(3).mean()</code>. Read it aloud: “look at a window of 3 months at a time, and take the average of each window.” The window slides along one month at a time, which is why it is called moving.</p>
<p>The length of the window is a choice, and it is a trade:</p>
<table class="mini">
<tr><th>Window</th><th>Range of the smoothed line, in orders</th><th>What it does</th></tr>
<tr><td>None (raw months)</td><td>206 to 274</td><td>Shows everything, including noise</td></tr>
<tr><td>3 months</td><td>224 to 257</td><td>Calmer, still reacts quickly</td></tr>
<tr><td>6 months</td><td>228 to 248</td><td>Clearly smoother</td></tr>
<tr><td>12 months</td><td>235 to 244</td><td>Almost flat, but slow to notice any change</td></tr>
</table>
<p>A short window follows the data closely but stays jumpy. A long window is smooth but late. For a board chart, three to six months is the usual sweet spot.</p>
<div class="callout watch"><b>The first months are blank, on purpose.</b> A 3-month average needs three months of history, so January and February 2023 have no average yet. Pandas leaves them empty (<code>NaN</code>) and Matplotlib simply starts the line later. The smoothed line is always a little shorter than the raw one.</div>
<div class="callout tip"><b>Always keep the raw line too.</b> If you show only the smooth line, you hide how bumpy the real data is. Draw both: the raw line thin and quiet, the average thicker. The reader sees the signal and still knows the truth.</div>`
    },
    {
      type: 'try',
      title: 'Add a 3-month average',
      body: `<p>Two <code>plt.plot</code> lines on the same chart give two lines on the same axes. The <code>label</code> of each is what the legend shows, and <code>plt.legend()</code> draws the key. The thicker line is made with <code>linewidth=3</code>.</p>
<p>Compare them. The thin line jumps around, and the thick one drifts gently between about 224 and 257. It never trends up or down for long. The signal agrees with what you saw before: <b>steady</b>.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

monthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()
average = monthly.rolling(3).mean()
dates = monthly.index.to_timestamp()

plt.figure(figsize=(9, 4))
plt.plot(dates, monthly.values, label="Orders each month")
plt.plot(dates, average.values, label="3-month average", linewidth=3)
plt.legend()
plt.title("Orders per month with a 3-month average")
plt.xlabel("Month")
plt.ylabel("Orders")
plt.tight_layout()`
    },
    {
      id: 'py-7-1-ex3',
      type: 'exercise',
      title: 'Your turn: a 6-month average',
      body: `<p>The finance director finds the 3-month line still too jumpy. Draw the orders per month <b>together with a 6-month moving average</b>, as two lines on one chart, with these texts:</p>
<ul>
<li>Title: <code>Orders per month with a 6-month average</code></li>
<li>X label: <code>Month</code></li>
<li>Y label: <code>Orders</code></li>
</ul>
<p>Add a legend with <code>plt.legend()</code> and give each line a <code>label</code>. No printing. You should see <b>two lines</b>.</p>
<p><b>Think before you type:</b> the only change from the try card is the window, <code>rolling(6)</code>, and the texts. The average is a Series with its own values and the same dates.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()\n\n# Write your code below\n`,
      hints: [
        `average = monthly.rolling(6).mean(). Draw monthly.values and average.values against dates = monthly.index.to_timestamp(), each with a label, then plt.legend().`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()\naverage = monthly.rolling(6).mean()\ndates = monthly.index.to_timestamp()\n\nplt.figure(figsize=(9, 4))\nplt.plot(dates, monthly.values, label="Orders each month")\nplt.plot(dates, average.values, label="6-month average", linewidth=3)\nplt.legend()\nplt.title("Orders per month with a 6-month average")\nplt.xlabel("Month")\nplt.ylabel("Orders")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()\naverage = monthly.rolling(6).mean()\ndates = monthly.index.to_timestamp()\n\nplt.figure(figsize=(9, 4))\nplt.plot(dates, monthly.values, label="Orders each month")\nplt.plot(dates, average.values, label="6-month average", linewidth=3)\nplt.legend()\nplt.title("Orders per month with a 6-month average")\nplt.xlabel("Month")\nplt.ylabel("Orders")\nplt.tight_layout()`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A reference line, and one point worth marking',
      body: `<p>A line on its own answers “what happened”. A board member’s next question is usually “is that good or bad?”. To answer, give the eye something to compare against. The simplest comparison is the <b>average</b>, drawn as a flat horizontal line across the whole chart. Months above it were strong, months below it were weak.</p>
<p>That is <code>plt.axhline(value)</code>, where “h” stands for horizontal. You can style it: <code>linestyle="--"</code> makes it dashed, so that it looks like a guide rather than data, and <code>color="#f5b301"</code> gives it the amber of the house palette.</p>
<p>Next, <b>mark the one thing you want people to see</b>. Two small tools do it. <code>plt.scatter([x], [y])</code> places a single dot at an exact position. <code>plt.annotate("text", xy=(x, y), ...)</code> writes a note that points at it. The best month in the whole series was <b>May 2024, with 274 orders</b>. The average is about <b>238</b>.</p>
<p>The rule behind both is simple: a chart should have <b>one clear message</b>, and the viewer’s eye should land on it first. A reference line and one marked point turn a squiggle into a sentence.</p>
<div class="callout analogy"><b>The sports pitch.</b> A football pitch has a halfway line. Nothing happens on the line itself, yet it helps you read everything else on the pitch. Your average line works the same way.</div>
<div class="callout watch"><b>Add lines carefully.</b> Each extra line adds to the line count of the chart. A flat reference line counts as one line, while a marked dot and a note count as none. This matters later, because the platform checks your charts by counting.</div>`
    },
    {
      type: 'try',
      title: 'The average and the best month, marked',
      body: `<p>This is the CEO’s second picture. Read the new lines one at a time. <code>monthly.idxmax()</code> gives the month with the highest count, and <code>.to_timestamp()</code> turns it into a date. <code>zorder=3</code> puts the dot on top of the line instead of underneath. In <code>annotate</code>, <code>xytext=(14, -3)</code> places the note 14 points to the right of the dot.</p>
<p>Notice what the picture says without a word of explanation: most months sit close to the dashed line, and May 2024 is the highest peak. Nothing here suggests a crisis or a boom.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

monthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()
dates = monthly.index.to_timestamp()
best = monthly.idxmax().to_timestamp()

plt.figure(figsize=(9, 4))
plt.plot(dates, monthly.values)
plt.axhline(monthly.mean(), linestyle="--", color="#f5b301", label="Average: 238 orders")
plt.scatter([best], [monthly.max()], zorder=3, color="#ef9a9a")
plt.annotate("Best month: 274 orders", xy=(best, monthly.max()), xytext=(14, -3), textcoords="offset points")
plt.legend()
plt.title("Orders per month, with the average and the best month")
plt.xlabel("Month")
plt.ylabel("Orders")
plt.tight_layout()`
    },
    {
      id: 'py-7-1-ex4',
      type: 'exercise',
      title: 'Your turn: orders against their own average',
      body: `<p>Draw the orders per month with a <b>dashed horizontal line at the average</b>. Use these texts:</p>
<ul>
<li>Title: <code>Orders per month against the average</code></li>
<li>X label: <code>Month</code></li>
<li>Y label: <code>Orders</code></li>
</ul>
<p>Use <code>plt.axhline(monthly.mean(), linestyle="--")</code> for the dashed line. No printing. You should see <b>two lines</b>: the data and the average.</p>
<p><b>Think before you type:</b> the data line is the one you have drawn three times already. The new line is a single call with the average as its only required piece.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()\n\n# Write your code below\n`,
      hints: [
        `Draw the series with plt.plot(monthly.index.to_timestamp(), monthly.values). Then add plt.axhline(monthly.mean(), linestyle="--"). Then the title, the labels and plt.tight_layout().`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()\n\nplt.figure(figsize=(9, 4))\nplt.plot(monthly.index.to_timestamp(), monthly.values)\nplt.axhline(monthly.mean(), linestyle="--")\nplt.title("Orders per month against the average")\nplt.xlabel("Month")\nplt.ylabel("Orders")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()\n\nplt.figure(figsize=(9, 4))\nplt.plot(monthly.index.to_timestamp(), monthly.values)\nplt.axhline(monthly.mean(), linestyle="--")\nplt.title("Orders per month against the average")\nplt.xlabel("Month")\nplt.ylabel("Orders")\nplt.tight_layout()`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The axis can lie: where the bottom of the chart starts',
      body: `<p>Here is a trick that catches even experienced analysts. The numbers in a chart are fixed. But <b>how much room the chart gives them</b> is a choice, and that choice changes what a viewer feels.</p>
<p>When you do not say otherwise, Matplotlib picks the vertical range to fit the data. For orders, that is roughly 206 to 274. The line then fills the whole picture, and a 15 percent swing looks like a mountain range. If you instead tell it to start at zero, with <code>plt.ylim(0, 300)</code>, the same line looks like a calm road. <b>Nothing in the data changed.</b> Only the ruler did.</p>
<p>Which one is “right”? For a <b>line chart</b>, both can be honest, because the reader follows the shape and the numbers on the axis. A line chart does not have to start at zero. But you must <b>choose on purpose</b>, and the choice must fit the message:</p>
<ul>
<li>If the point is “small ups and downs around a steady middle”, an axis starting at zero shows that truthfully.</li>
<li>If you must show small changes that matter, such as a temperature in a mill, a zoomed axis is fair, as long as the numbers on the axis are easy to read.</li>
<li>If a zoomed axis makes ordinary noise look like a crisis, it misleads, even though every point is correct.</li>
</ul>
<div class="callout watch"><b>The test for a board slide.</b> Ask: “Would someone who looks for two seconds and reads no numbers take away the right feeling?” A 13 percent dip in one month is real, but it is not a collapse. If your picture feels like a collapse, change the axis or change the picture.</div>
<p>Bars are stricter. In lesson 7.2 you will see why a bar chart <b>must</b> start at zero, always.</p>`
    },
    {
      type: 'try',
      title: 'The same data, two rulers',
      body: `<p>This code draws the same 42 numbers twice, side by side. <code>plt.subplots(1, 2)</code> makes one row with two drawing areas, and <code>axes[0]</code> and <code>axes[1]</code> are the left and the right one. On the right, <code>set_ylim(0, 300)</code> forces the axis to start at zero.</p>
<p>Look at the left picture: wild swings. Look at the right: a gentle ripple. A viewer who sees only one of them would walk away with a completely different opinion, from exactly the same data.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

monthly = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()
dates = monthly.index.to_timestamp()

fig, axes = plt.subplots(1, 2, figsize=(11, 4))
axes[0].plot(dates, monthly.values)
axes[0].set_title("Axis chosen by matplotlib")
axes[1].plot(dates, monthly.values)
axes[1].set_ylim(0, 300)
axes[1].set_title("Axis starting at zero")
for ax in axes:
    ax.set_ylabel("Orders")
    ax.tick_params(axis="x", labelrotation=45)
plt.tight_layout()`
    },
    {
      id: 'py-7-1-c1',
      type: 'check',
      title: 'The left chart looks like a roller coaster and the right one looks calm. Both use the same 42 monthly order counts. What is the fair conclusion?',
      body: `<p>Think about what changed between the two pictures, and what did not.</p>`,
      options: [
        'The left chart is the true one, and the right chart hides the swings',
        'The data is identical. Only the starting point of the vertical axis differs, so the choice must be made on purpose and fit the message. Here the months stay within about 15 percent of the average of 238, which is ordinary noise rather than a crisis',
        'Matplotlib made a mistake on the left chart',
        'Line charts must always start at zero, so the left chart is wrong'
      ],
      answer: 1,
      why: [
        'Neither is more true. Every point is in the right place in both. The left chart simply uses all of its height on a narrow range, which makes the swings feel large.',
        'Right! The honest approach is to decide the axis deliberately and to ask what the viewer will feel. The orders range from 206 to 274 around an average of 238, which is about 13 percent below to 15 percent above. That is normal month-to-month noise, so the calm picture is the fairer summary for a board.',
        'Matplotlib did what it always does when you give it no instruction: it fitted the axis to the data. The choice of ruler is yours to make.',
        'For line charts that is a common guideline but not a rule. A zoomed axis can be honest when small changes matter and the axis is easy to read. It is bar charts that must always start at zero.'
      ]
    },
    {
      type: 'explain',
      title: 'Several lines: comparing the years',
      body: `<p>One line shows <b>one story</b>. Often the better question is a comparison: “Is this year doing better than last year?” The classic answer is to draw <b>one line per year</b> on the same chart, with the months January to December along the bottom. The lines lie on top of each other, so the eye can compare the same month across years: March against March, September against September.</p>
<p>To build it, you need a small table with months as rows and years as columns. You already have the tools. Group by the month number and the year, add up the line totals, and use <code>.unstack()</code> to turn the years into columns. Divide by a million so that the numbers on the axis are small and readable:</p>
<p><code>rev = master.groupby([master["order_date"].dt.month, "order_year"])["line_total"].sum().unstack() / 1000000</code></p>
<p>Then a loop draws one line per column, and <code>label=str(year)</code> names it for the legend. In this chart the best month is <b>March 2023 at 43.57 million</b> and the weakest is <b>September 2024 at 32.65 million</b>. Across all 42 months, revenue stays inside a band of about 33 to 44 million. That is the picture of a flat business.</p>
<p>A word about <b>colour</b>. The platform’s default colours repeat after four, and two of those four look alike. With four years you are safe, but give each line its own colour on purpose. For five or more lines, set a list of colours yourself, as the code below does.</p>
<div class="callout watch"><b>The 2026 line is shorter, and that is the point.</b> TradeFlow’s data ends on 30 June 2026. The 2026 line has six points while the others have twelve. It is not a collapse. It is a half year. Compare 2026 with the first six months of the other years, never with their full twelve. If you add 2026’s six months up and set them against the full year 2025, you get a drop of 51 percent, a number that is arithmetically right and completely misleading. The fair comparison, January to June against January to June, is a fall of only 3.8 percent.</div>
<div class="callout tip"><b>How many lines are too many?</b> Up to four or five lines can be read. Beyond that the chart turns into spaghetti. If you need more, draw several small charts side by side, which you will do in lesson 7.4.</div>`
    },
    {
      type: 'try',
      title: 'Revenue by month, one line per year',
      body: `<p>The CEO’s third picture. The loop <code>for year, colour in zip(rev.columns, colours)</code> walks along the years and the colours together, one pair at a time. <code>ax.set_xticks(range(1, 13))</code> puts a tick on every month number. <code>ax.set_ylim(31, 47)</code> leaves room at the top so that the legend does not sit on top of a line.</p>
<p>Read it as a manager would. The four lines weave through each other and no year sits clearly above the rest. The pink 2026 line stops at June. It starts in the same area as the others, so the business has not collapsed. The lines also share no clear busy season. March is above its own year’s average in all four years, but it is the top month in only two of them.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

rev = master.groupby([master["order_date"].dt.month, "order_year"])["line_total"].sum().unstack() / 1000000
colours = ["#4fc3f7", "#81c784", "#f5b301", "#ef9a9a"]

fig, ax = plt.subplots(figsize=(9, 4))
for year, colour in zip(rev.columns, colours):
    ax.plot(rev.index, rev[year], label=str(year), color=colour)
ax.set_xticks(range(1, 13))
ax.set_ylim(31, 47)
ax.legend(title="Year", ncol=4, loc="upper center")
ax.set_title("Revenue by month, one line per year")
ax.set_xlabel("Month")
ax.set_ylabel("Revenue (millions)")
plt.tight_layout()`
    },
    {
      id: 'py-7-1-ex5',
      type: 'exercise',
      title: 'Challenge: one line per year',
      body: `<p>Build the year-by-year revenue chart yourself. Start from the master table and make <b>one line per year</b>, with the month number along the bottom and revenue in millions up the side. Use these texts:</p>
<ul>
<li>Title: <code>Revenue by month, one line per year</code></li>
<li>X label: <code>Month</code></li>
<li>Y label: <code>Revenue (millions)</code></li>
</ul>
<p>Add a legend. No printing. You should see <b>four lines</b>, one for each of 2023, 2024, 2025 and 2026.</p>
<p><b>Think before you type:</b> first the small table (months as rows, years as columns, in millions). Then a loop over its columns, with one <code>plot</code> call and one label per year. Colours are optional here.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\n# Write your code below\n`,
      hints: [
        `rev = master.groupby([master["order_date"].dt.month, "order_year"])["line_total"].sum().unstack() / 1000000. Then for year in rev.columns: plot rev.index against rev[year] with label=str(year).`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\nrev = master.groupby([master["order_date"].dt.month, "order_year"])["line_total"].sum().unstack() / 1000000\n\nfig, ax = plt.subplots(figsize=(9, 4))\nfor year in rev.columns:\n    ax.plot(rev.index, rev[year], label=str(year))\nax.legend()\nax.set_title("Revenue by month, one line per year")\nax.set_xlabel("Month")\nax.set_ylabel("Revenue (millions)")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nrev = master.groupby([master["order_date"].dt.month, "order_year"])["line_total"].sum().unstack() / 1000000\n\nfig, ax = plt.subplots(figsize=(9, 4))\nfor year in rev.columns:\n    ax.plot(rev.index, rev[year], label=str(year))\nax.legend()\nax.set_title("Revenue by month, one line per year")\nax.set_xlabel("Month")\nax.set_ylabel("Revenue (millions)")\nplt.tight_layout()`,
      ordered: true
    },
    {
      id: 'py-7-1-c2',
      type: 'check',
      title: 'Which title is best for the revenue-by-month chart on a board slide?',
      body: `<p>Remember that the audience gives the slide about three seconds before they listen to you.</p>`,
      options: [
        'Chart 1',
        'Revenue by month',
        'Monthly revenue has stayed between 33 and 44 million for 42 months',
        'Monthly revenue in millions, split by year, January to December, 2023 to 2026'
      ],
      answer: 2,
      why: [
        'This tells the audience nothing. A number is for the file name, not for the slide.',
        'It describes what is drawn, which is acceptable for a technical appendix. But the board has to work out the message for itself.',
        'Right! A good title states the <b>finding</b>, so a viewer who reads only the title still gets the point. It is also checkable: the weakest month is 32.65 million and the strongest 43.57 million, which round to 33 and 44.',
        'It is accurate and thorough, but it reads like a database label. The viewer must still decide what to conclude.'
      ]
    },
    {
      id: 'py-7-1-c3',
      type: 'check',
      title: 'On the one-line-per-year chart, the 2026 line stops after June while the other three run to December. How should you read it?',
      body: `<p>Think about when the data was collected, not about what the picture looks like.</p>`,
      options: [
        'Revenue stopped in July 2026, which is a serious warning',
        'There is an error in the code that cut the line short',
        'The data ends on 30 June 2026, so the year is only half over. Compare 2026 with January to June of earlier years, and say so on the slide',
        'The 2026 line should be removed because it is incomplete'
      ],
      answer: 2,
      why: [
        'Nothing stopped. The dataset simply ends on 30 June 2026. Treating missing future months as zero is one of the most common ways to scare a boardroom for nothing.',
        'The code is fine. A line has only as many points as the data has months, and the data has six months of 2026.',
        'Right! Same months against same months is the fair comparison. January to June 2026 brought in 226.37 million against 235.30 million for the same months of 2025, a fall of 3.8 percent, not the 51 percent that a full-year comparison would suggest.',
        'Removing it throws away the most recent information. Keep it, and explain that it covers half a year.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You have drawn your first charts, and you did it the way analysts do: small, checked, and with an eye on what the viewer will feel. You can:</p>
<ul>
<li>Draw a line chart with the <b>five-step recipe</b>: figure, data, title, labels, <code>tight_layout</code></li>
<li>Build a <b>monthly series</b> with <code>groupby</code>, <code>to_period</code> and <code>nunique</code>, and turn its labels into real dates with <code>to_timestamp</code></li>
<li>Separate <b>noise from signal</b> with a moving average, and explain the trade-off in the window length</li>
<li>Add a <b>reference line</b> with <code>axhline</code>, and mark and label one point with <code>scatter</code> and <code>annotate</code></li>
<li>Explain how the <b>axis range</b> changes the feeling of a chart, and choose it on purpose</li>
<li>Draw <b>one line per year</b>, and handle a year that is only half complete</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>When is a line chart the right choice, and when is it the wrong one?</li>
<li>What is a moving average, and what does the window length control?</li>
<li>Someone shows you a chart in which sales “collapse”. What do you check before you believe it?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A line chart is right when the horizontal axis is ordered, usually time, and the question is how something changes along it. The line tells the eye that the points are connected in sequence. It is wrong for unordered categories such as countries or products, because a line between them suggests a sequence that does not exist. A bar chart is the right choice there.</p>
<p><b>2.</b> A moving average replaces each point with the average of the last few points, which dilutes one-off ups and downs so that the underlying direction shows. The window length controls the trade-off: a short window follows the data closely but stays jumpy, and a long window is smooth but slow to notice a real change. I would also keep the raw line on the chart, so that the reader can see how noisy the data really is.</p>
<p><b>3.</b> I check the axis first: where does it start, and is a small change being stretched to fill the whole picture? Then I check the period: is the final point a full month or year, or a partial one, as with a half year compared against a full year? Then I check whether the drop is unusual compared with earlier months, using a moving average and the normal range. Many “collapses” turn out to be a zoomed axis or an incomplete period.</p>
</details>
<p><b>Coming next, in lesson 7.2:</b> bar charts. Lines show change over time. The CEO’s next question is about <i>comparison</i>: which country brings in the most, which product category leads, how do the order statuses split? Bars are the tool for that, and they come with one iron rule that you can already guess from today’s lesson: they must start at zero.</p>`
    }
  ]
},
{
  id: 'py-7-2',
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
  title: '7.2 Bar charts: comparing categories honestly',
  tables: [],
  intro: `The CEO liked the line charts. Now she has a different question. <i>“Which of our five countries should I thank on stage, and which one should I be asking hard questions?”</i><br><br>That is not a question about time. It is a question about <b>comparison</b>: Rwanda against Nigeria against Ghana, side by side, at one moment. For that, the tool is the <b>bar chart</b>. Each category gets a bar, and the length of the bar is the number. The eye compares lengths faster and more accurately than almost anything else it can do.<br><br>That simplicity is also why bar charts are the easiest charts to use dishonestly, and why a careful analyst treats them with respect. In this lesson you draw bars upright and sideways, label them, stack them, group them, and learn the iron rule: <b>a bar must start at zero</b>.`,
  steps: [
    {
      type: 'explain',
      title: 'Bars compare things, lines follow time',
      body: `<p>A <b>bar chart</b> gives each category its own bar. The height (or length) of the bar is the value. Because every bar starts from the same flat baseline, your eye can compare any two of them instantly: “this one is longer”.</p>
<p>Use bars when the thing along the bottom is a <b>set of separate categories</b>: countries, product categories, order statuses. Use a line when it is <b>time</b>. Keep that one distinction in mind and you will pick the right chart ninety times out of a hundred.</p>
<p>In Matplotlib the call is <code>plt.bar(names, heights)</code>. Like the line chart, it needs two lists of equal length: the <b>names</b> along the bottom and the <b>heights</b>. With a Pandas Series you get both for free: <code>counts.index</code> holds the names and <code>counts.values</code> holds the numbers.</p>
<table class="mini">
<tr><th>Your question</th><th>The chart</th><th>The call</th></tr>
<tr><td>How does something change over time?</td><td>Line</td><td><code>plt.plot(x, y)</code></td></tr>
<tr><td>Which category is bigger?</td><td>Bars, upright</td><td><code>plt.bar(names, heights)</code></td></tr>
<tr><td>Same, but the names are long</td><td>Bars, sideways</td><td><code>ax.barh(names, lengths)</code></td></tr>
</table>
<p>Before you type a single line, ask yourself three questions. They take ten seconds and save you from drawing the wrong chart.</p>
<ol>
<li><b>What comparison am I making?</b> Rwanda against Nigeria is a different chart from Rwanda this year against Rwanda last year.</li>
<li><b>How many categories are there?</b> Five bars read at a glance. Fifty bars become a wall, and a sorted table or a “top 10” is kinder to the reader.</li>
<li><b>What is the one message?</b> If you cannot finish the sentence “the chart shows that...”, you are not ready to draw it.</li>
</ol>
<p>The same five-step recipe from lesson 7.1 still applies: make the figure, draw the data, add the title, add the labels, and finish with <code>plt.tight_layout()</code>. Still no <code>plt.show()</code> and no printing in a chart exercise.</p>`
    },
    {
      type: 'try',
      title: 'Customers by country',
      body: `<p>Start with the simplest comparison: how many customers does TradeFlow have in each country? <code>value_counts()</code> counts them and sorts the result from biggest to smallest, which is exactly the order you want on a bar chart.</p>
<p>Press <b>Run</b> and read it. Rwanda leads with <b>438</b> customers, and South Africa has the fewest with <b>378</b>. Notice that the bars are close in height. The five countries are of broadly similar size, and the chart tells you that in a glance.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

counts = customers["country"].value_counts()

plt.figure(figsize=(7, 4))
plt.bar(counts.index, counts.values)
plt.title("Customers by country")
plt.xlabel("Country")
plt.ylabel("Customers")
plt.tight_layout()`
    },
    {
      type: 'explain',
      title: 'Three habits that make a bar chart easy to read',
      body: `<p><b>Habit 1: sort the bars.</b> A chart sorted from biggest to smallest reads like a league table. A chart in alphabetical order makes the reader hunt for the winner. The only exception is when the categories have a natural order of their own, such as months or age bands.</p>
<p><b>Habit 2: go sideways when the names are long.</b> Names like “Books &amp; Stationery” do not fit under a narrow upright bar. They get squashed or tilted, and tilted text is tiring to read. Turn the chart on its side with <code>ax.barh(...)</code>, where “h” is for horizontal, and the names run along the left in plain reading order.</p>
<p>A sideways chart has one quirk: it draws the first category at the <b>bottom</b>. You want the biggest at the top, so you add <code>ax.invert_yaxis()</code>, which flips the order.</p>
<p><b>Habit 3: write the number on the bar.</b> If the exact value matters, print it on the bar and the reader does not have to squint at the axis. One line does it: <code>ax.bar_label(bars, fmt="%.0f")</code>. The <code>fmt</code> says how to write the number: <code>%.0f</code> means “a number with no decimals”. The word <code>padding</code> adds a little space between the bar end and its number.</p>
<p>There is one more change in how the code is written. For sideways bars and labels you need to keep hold of the bars you draw, so you create the figure and its drawing area together with <code>fig, ax = plt.subplots()</code>, and then draw on <code>ax</code>, with <code>ax.set_title(...)</code>, <code>ax.set_xlabel(...)</code> and so on. It does the same job as the <code>plt.</code> version, with a name for the drawing area, so you can work on it.</p>
<div class="callout analogy"><b>The league table.</b> Nobody reads a football table in alphabetical order. Sorting bars gives the same instant answer to “who is top?”.</div>
<div class="callout tip"><b>Divide by a million.</b> Revenue of 349,560,000 is hard to read on an axis. Divide by 1,000,000 and write “(millions)” in the label: the axis shows 350, and nobody counts zeros.</div>`
    },
    {
      type: 'try',
      title: 'Revenue by country, sorted and labelled',
      body: `<p>This is the CEO’s answer to her question. Read the code in order: add up the revenue of each country, sort it largest first, and divide by a million. Then draw sideways bars, write the value on each, and flip the order so that the leader is at the top.</p>
<p>Rwanda leads with <b>350 million</b> (about 22 percent of the total), then Nigeria and Ghana almost level at 320 and 319, then Kenya at 305, and South Africa at 289. The gap between top and bottom is about 21 percent. It is a spread, not a gulf.</p>
<p>Notice Nigeria and Ghana. Their real figures are 319.68 and 318.76 million: a difference of 0.3 percent. The bars look identical, and they should. An honest analyst would not tell the board that Nigeria “beats” Ghana. The chart is quietly protecting you from claiming a ranking the data does not support.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

revenue = master.groupby("country")["line_total"].sum().sort_values(ascending=False) / 1000000

fig, ax = plt.subplots(figsize=(8, 4))
bars = ax.barh(revenue.index, revenue.values)
ax.bar_label(bars, fmt="%.0f", padding=4)
ax.invert_yaxis()
ax.set_title("Revenue by country (millions)")
ax.set_xlabel("Revenue (millions)")
ax.set_ylabel("Country")
plt.tight_layout()`
    },
    {
      id: 'py-7-2-ex1',
      type: 'exercise',
      title: 'Your turn: customers by country',
      body: `<p>Draw the number of <b>customers per country</b> as upright bars, from the <code>customers</code> table, with these texts:</p>
<ul>
<li>Title: <code>Customers by country</code></li>
<li>X label: <code>Country</code></li>
<li>Y label: <code>Customers</code></li>
</ul>
<p>No printing. You should see a chart with <b>five bars</b>.</p>
<p><b>Think before you type:</b> count the customers in each country with <code>value_counts()</code>. Its index holds the country names and its values hold the counts, which are exactly the two things <code>plt.bar</code> needs.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\n# Write your code below\n`,
      hints: [
        `counts = customers["country"].value_counts(). Then plt.bar(counts.index, counts.values), the title, the two labels, and plt.tight_layout().`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\ncounts = customers["country"].value_counts()\n\nplt.figure(figsize=(7, 4))\nplt.bar(counts.index, counts.values)\nplt.title("Customers by country")\nplt.xlabel("Country")\nplt.ylabel("Customers")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\ncounts = customers["country"].value_counts()\n\nplt.figure(figsize=(7, 4))\nplt.bar(counts.index, counts.values)\nplt.title("Customers by country")\nplt.xlabel("Country")\nplt.ylabel("Customers")\nplt.tight_layout()`,
      ordered: true
    },
    {
      id: 'py-7-2-ex2',
      type: 'exercise',
      title: 'Your turn: sideways bars with the numbers on them',
      body: `<p>Now the revenue chart, built by you. Draw <b>revenue per country in millions</b> as <b>sideways bars</b>, largest at the top, with the value written on each bar (no decimals). Use these texts:</p>
<ul>
<li>Title: <code>Revenue by country (millions)</code></li>
<li>X label: <code>Revenue (millions)</code></li>
<li>Y label: <code>Country</code></li>
</ul>
<p>No printing. You should see a chart with <b>five bars</b>.</p>
<p><b>Think before you type:</b> five small jobs. Add up <code>line_total</code> by country. Sort largest first. Divide by 1,000,000. Draw with <code>ax.barh</code> and label with <code>ax.bar_label</code>. Flip the order with <code>ax.invert_yaxis()</code>.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\n# Write your code below\n`,
      hints: [
        `revenue = master.groupby("country")["line_total"].sum().sort_values(ascending=False) / 1000000. Then fig, ax = plt.subplots(), bars = ax.barh(revenue.index, revenue.values), ax.bar_label(bars, fmt="%.0f"), ax.invert_yaxis().`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\nrevenue = master.groupby("country")["line_total"].sum().sort_values(ascending=False) / 1000000\n\nfig, ax = plt.subplots(figsize=(8, 4))\nbars = ax.barh(revenue.index, revenue.values)\nax.bar_label(bars, fmt="%.0f", padding=4)\nax.invert_yaxis()\nax.set_title("Revenue by country (millions)")\nax.set_xlabel("Revenue (millions)")\nax.set_ylabel("Country")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nrevenue = master.groupby("country")["line_total"].sum().sort_values(ascending=False) / 1000000\n\nfig, ax = plt.subplots(figsize=(8, 4))\nbars = ax.barh(revenue.index, revenue.values)\nax.bar_label(bars, fmt="%.0f", padding=4)\nax.invert_yaxis()\nax.set_title("Revenue by country (millions)")\nax.set_xlabel("Revenue (millions)")\nax.set_ylabel("Country")\nplt.tight_layout()`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The iron rule: a bar starts at zero',
      body: `<p>With a bar, the <b>length is the message</b>. If one bar is twice as long as another, the eye reads “twice as much”. That only works if every bar starts from the same honest starting line: <b>zero</b>.</p>
<p>Here is how the rule gets broken. Suppose you want to compare two product categories, Home &amp; Kitchen at <b>349.45 million</b> and Fashion at <b>334.02 million</b>. The real gap is 15.43 million, or <b>4.6 percent</b>. If you cut off the bottom of the chart and start the axis at 325 instead of zero, the visible part of Home &amp; Kitchen is 24.45 units tall and the visible part of Fashion is 9.02. The first bar now looks <b>2.7 times as tall</b> as the second. The numbers did not change, but a 4.6 percent difference now looks like a landslide.</p>
<p>This is the oldest trick in misleading charts, and it is often done without bad intent, because a zoomed axis makes small differences “more visible”. The right way to make a small difference visible is to <b>say it in words</b> (“Home &amp; Kitchen leads Fashion by 4.6 percent”) or to switch to a chart where a zoomed axis is honest, such as a line.</p>
<p>Why is the eye so easily fooled? Because we do not read bars by their numbers. We read them by their <b>shape</b>. The brain looks at two rectangles and quickly estimates how much bigger one is than the other, long before it reads the axis. That is what makes bars so fast to understand, and it is exactly why the starting point matters so much: the brain cannot see the missing part of the bar that was cut off.</p>
<p>A simple self-check before you share any bar chart: take the tallest bar and the shortest bar, work out their real ratio (for example 349 divided by 334, about 1.05), and ask whether the picture <i>feels</i> like that ratio. If the picture shouts and the ratio whispers, the axis is lying.</p>
<div class="callout watch"><b>Two kinds of axis, two sets of rules.</b> On a <b>line chart</b> the eye follows the shape and the position of points, so a zoomed axis can be fair if the numbers are easy to read (lesson 7.1). On a <b>bar chart</b> the eye compares lengths, so the axis must start at zero, with no exceptions. Matplotlib starts bars at zero by default. The danger is the line of code that overrides it: <code>set_ylim</code> with a first number above zero.</div>
<div class="callout work"><b>At work:</b> finance teams and newspapers have been caught out by this. When you review someone else’s bar chart, look at the first number on the vertical axis before you look at anything else.</div>`
    },
    {
      type: 'try',
      title: 'The same two bars, with and without a zero',
      body: `<p>The left chart starts the axis at 325 with <code>set_ylim(325, 355)</code>. The right chart starts at zero with <code>set_ylim(0, 400)</code>. Both draw exactly the same two numbers.</p>
<p>The left one shouts “Home &amp; Kitchen is far ahead!”. The right one says, truthfully, “they are about the same, with a small lead”. Which one would you rather defend in front of the finance director?</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

cat = master.groupby("category")["line_total"].sum() / 1000000
two = cat[["Home & Kitchen", "Fashion"]]

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].bar(two.index, two.values, color="#4fc3f7")
axes[0].set_ylim(325, 355)
axes[0].set_title("Axis starts at 325")
axes[1].bar(two.index, two.values, color="#4fc3f7")
axes[1].set_ylim(0, 400)
axes[1].set_title("Axis starts at zero")
for ax in axes:
    ax.set_ylabel("Revenue (millions)")
plt.tight_layout()`
    },
    {
      id: 'py-7-2-c2',
      type: 'check',
      title: 'In the left chart, Home & Kitchen looks nearly three times as tall as Fashion, yet its revenue is only 4.6 percent higher. What went wrong?',
      body: `<p>Remember what the length of a bar is supposed to mean.</p>`,
      options: [
        'The data is wrong, because the bar heights should be equal',
        'The axis starts at 325, so the bar lengths no longer match the real values. A bar chart must start at zero for its lengths to be comparable',
        'The chart needs more colours',
        'Nothing went wrong, because zooming in always makes a chart clearer'
      ],
      answer: 1,
      why: [
        'The data is correct: 349.45 and 334.02 million. The heights should be close, not equal, and on a zero-based axis they are.',
        'Right! A bar’s length is the value only if it starts at zero. Cut off the bottom, and you are comparing 24 units against 9 instead of 349 against 334. The fix is to start at zero and state the 4.6 percent gap in words.',
        'Colour has nothing to do with it. The problem is the position of the axis.',
        'Zooming makes small differences look big, which is the opposite of clarity when the differences are small. That is exactly what misleads the reader.'
      ]
    },
    {
      type: 'explain',
      title: 'Stacked bars and grouped bars',
      body: `<p>So far each bar has been one number. Real questions often have <b>two dimensions</b>: orders per year <i>and</i> by status, or revenue per country <i>and</i> per year. There are two standard ways to draw that, and they answer different questions.</p>
<table class="mini">
<tr><th></th><th>Stacked</th><th>Grouped (side by side)</th></tr>
<tr><td><b>How it looks</b></td><td>One tall bar per group, cut into coloured slices</td><td>A small cluster of bars for each group</td></tr>
<tr><td><b>Best at showing</b></td><td>The <b>total</b>, and the parts of it</td><td>A fair <b>comparison</b> of the parts</td></tr>
<tr><td><b>Weakness</b></td><td>Only the bottom slice sits on the baseline, so the others are hard to compare</td><td>Gets crowded with more than 3 or 4 bars per cluster</td></tr>
<tr><td><b>Pandas call</b></td><td><code>.plot(kind="bar", stacked=True)</code></td><td><code>.plot(kind="bar")</code></td></tr>
</table>
<p>Pandas can draw both straight from a table. You give it a small table with one row per group and one column per slice, and it does the rest. Get that table with <code>.unstack()</code>, as you did in lesson 7.1. You then tell Pandas which drawing area to use, with <code>ax=ax</code>, and keep the labels horizontal with <code>rot=0</code>.</p>
<p>A warning about <b>colours</b>. The platform’s default colours repeat after four, and two of the four look alike. With four slices it works, but give each slice its own colour on purpose. With five or more categories you must supply the list yourself, for example <code>["#4fc3f7", "#81c784", "#f5b301", "#ba68c8", "#ef9a9a"]</code>. Without it, two different categories would share a colour and the chart would lie.</p>
<p>Two more habits keep these charts honest. First, <b>keep the slices in a sensible order</b> and the same order in every bar, so that the reader learns where to look. Second, <b>do not stack more than four or five slices</b>. After that, the middle slices float with no baseline, and the reader cannot tell how big they are. If you have many categories, show only the top few and group the rest as “Other”, or draw small separate charts.</p>
<p>Stacked bars have one more weak spot that you will see in a moment: if one bar is much shorter than the others, the reader’s first thought is “something dropped”. Always ask whether the shorter bar covers the same stretch of time as the rest.</p>
<div class="callout analogy"><b>A tower and a row.</b> A stacked bar is a tower of blocks: easy to see how tall the tower is, hard to say whether the third block of one tower is bigger than the third block of another. A grouped chart is a row of separate towers beside each other: easy to compare, but you lose the total.</div>`
    },
    {
      type: 'try',
      title: 'Orders per year, split by status',
      body: `<p>TradeFlow’s orders end in one of four ways: Completed, Processing, Cancelled or Returned. This chart stacks them per year. The table behind it has four rows (the years) and four columns (the statuses). Each bar is cut into four coloured slices, which makes 16 pieces in total.</p>
<p>Read it. The Completed slice (blue) is the large majority every year, and the Cancelled and Returned slices at the top and bottom are small. In 2023 there were 2,850 orders in total, and 2,103 of them were Completed.</p>
<p>Now look at 2026. The bar is about half the height of the others.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

status = master.groupby(["order_year", "order_status"])["order_id"].nunique().unstack()
colours = ["#ef9a9a", "#4fc3f7", "#f5b301", "#ba68c8"]

fig, ax = plt.subplots(figsize=(8, 4))
status.plot(kind="bar", stacked=True, ax=ax, rot=0, color=colours)
ax.set_title("Orders per year, by status")
ax.set_xlabel("Year")
ax.set_ylabel("Orders")
plt.tight_layout()`
    },
    {
      id: 'py-7-2-ex3',
      type: 'exercise',
      title: 'Your turn: the stacked chart',
      body: `<p>Draw <b>orders per year, split by order status</b>, as a stacked bar chart. Count different orders (<code>order_id</code>) with <code>nunique</code>, never rows. Use these texts:</p>
<ul>
<li>Title: <code>Orders per year, by status</code></li>
<li>X label: <code>Year</code></li>
<li>Y label: <code>Orders</code></li>
</ul>
<p>No printing. You should see a chart with <b>16 bars</b> (four years, four statuses). Colours are optional.</p>
<p><b>Think before you type:</b> group by two things, year and status. Count different order IDs. Use <code>.unstack()</code> to turn the statuses into columns. Then let Pandas draw it with <code>kind="bar"</code> and <code>stacked=True</code>.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\n# Write your code below\n`,
      hints: [
        `status = master.groupby(["order_year", "order_status"])["order_id"].nunique().unstack(). Then fig, ax = plt.subplots() and status.plot(kind="bar", stacked=True, ax=ax, rot=0).`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\nstatus = master.groupby(["order_year", "order_status"])["order_id"].nunique().unstack()\n\nfig, ax = plt.subplots(figsize=(8, 4))\nstatus.plot(kind="bar", stacked=True, ax=ax, rot=0)\nax.set_title("Orders per year, by status")\nax.set_xlabel("Year")\nax.set_ylabel("Orders")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nstatus = master.groupby(["order_year", "order_status"])["order_id"].nunique().unstack()\n\nfig, ax = plt.subplots(figsize=(8, 4))\nstatus.plot(kind="bar", stacked=True, ax=ax, rot=0)\nax.set_title("Orders per year, by status")\nax.set_xlabel("Year")\nax.set_ylabel("Orders")\nplt.tight_layout()`,
      ordered: true
    },
    {
      id: 'py-7-2-c1',
      type: 'check',
      title: 'On the stacked chart, the 2026 bar is about half the height of the 2025 bar. What does that tell you?',
      body: `<p>Think about what period the 2026 bar covers.</p>`,
      options: [
        'Orders halved in 2026, which is an emergency',
        'The data ends on 30 June 2026, so the 2026 bar covers only six months (1,406 orders) against a full twelve months for 2025 (2,879 orders). It shows an incomplete year, not a collapse',
        'The 2026 data contains an error that removed half the orders',
        'Stacked charts always make the last bar shorter'
      ],
      answer: 1,
      why: [
        'Nothing halved. The bar is short because the year is only half over in the data. Compare six months with six months before you raise any alarm.',
        'Right! The same trap appeared in lesson 7.1. Bars carry the same risk as lines: an incomplete period looks like a drop. For a fair comparison you would put January to June 2026 beside January to June of earlier years, or label the bar “2026 (Jan to Jun)”.',
        'The data is complete up to the end of June 2026. There is nothing missing inside that period.',
        'Stacked charts do not shrink any bar. The bar is short because there are fewer orders in it.'
      ]
    },
    {
      type: 'try',
      title: 'Revenue by country: 2024 against 2025',
      body: `<p>Grouped bars answer the question stacked bars cannot: <b>did each country go up or down?</b> The code keeps only the years 2024 and 2025 with <code>isin([2024, 2025])</code>, adds up revenue for each country and year, and unstacks the years into two columns. Pandas then draws a cluster of two bars for each country: 10 bars in total.</p>
<p>Read each cluster. South Africa grew the most, up 10.9 percent (78.09 to 86.63 million), and Ghana is next at 8.5 percent. Kenya fell 3.4 percent, and Nigeria and Rwanda are almost flat, down under 1 percent. The company total grew only 2.6 percent, but inside it the countries moved in different directions. That is a finding the single total could never show.</p>
<p>The new line <code>ax.set_ylim(0, 125)</code> is there only to leave room for the legend. It starts at zero, so the rule is kept.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt

two = master[master["order_year"].isin([2024, 2025])]
by = two.groupby(["country", "order_year"])["line_total"].sum().unstack() / 1000000

fig, ax = plt.subplots(figsize=(9, 4))
by.plot(kind="bar", ax=ax, rot=0, color=["#4fc3f7", "#f5b301"])
ax.set_ylim(0, 125)
ax.legend(title="Year", ncol=2, loc="upper center")
ax.set_title("Revenue by country, 2024 against 2025")
ax.set_xlabel("Country")
ax.set_ylabel("Revenue (millions)")
plt.tight_layout()`
    },
    {
      id: 'py-7-2-ex4',
      type: 'exercise',
      title: 'Your turn: grouped bars',
      body: `<p>Draw <b>revenue by country for 2024 and 2025</b> as grouped bars, in millions. Use these texts:</p>
<ul>
<li>Title: <code>Revenue by country, 2024 against 2025</code></li>
<li>X label: <code>Country</code></li>
<li>Y label: <code>Revenue (millions)</code></li>
</ul>
<p>No printing. You should see a chart with <b>ten bars</b> (five countries, two years).</p>
<p><b>Think before you type:</b> first keep only the two years. Then group by country and year, add up <code>line_total</code>, unstack, and divide by a million. Then <code>kind="bar"</code> without <code>stacked</code>.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\n# Write your code below\n`,
      hints: [
        `two = master[master["order_year"].isin([2024, 2025])]. Then by = two.groupby(["country", "order_year"])["line_total"].sum().unstack() / 1000000. Then by.plot(kind="bar", ax=ax, rot=0).`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\ntwo = master[master["order_year"].isin([2024, 2025])]\nby = two.groupby(["country", "order_year"])["line_total"].sum().unstack() / 1000000\n\nfig, ax = plt.subplots(figsize=(9, 4))\nby.plot(kind="bar", ax=ax, rot=0)\nax.set_title("Revenue by country, 2024 against 2025")\nax.set_xlabel("Country")\nax.set_ylabel("Revenue (millions)")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\ntwo = master[master["order_year"].isin([2024, 2025])]\nby = two.groupby(["country", "order_year"])["line_total"].sum().unstack() / 1000000\n\nfig, ax = plt.subplots(figsize=(9, 4))\nby.plot(kind="bar", ax=ax, rot=0)\nax.set_title("Revenue by country, 2024 against 2025")\nax.set_xlabel("Country")\nax.set_ylabel("Revenue (millions)")\nplt.tight_layout()`,
      ordered: true
    },
    {
      id: 'py-7-2-ex5',
      type: 'exercise',
      title: 'Challenge: how much of each country’s revenue is Electronics?',
      body: `<p>Electronics is TradeFlow’s star category: 38.5 percent of all revenue. The operations director asks: <i>“Is that true in every country, or does one country carry it?”</i> Answer with a chart. Draw the <b>Electronics share of revenue for each country</b>, in percent, as upright bars. Use these texts:</p>
<ul>
<li>Title: <code>Electronics share of revenue by country</code></li>
<li>X label: <code>Country</code></li>
<li>Y label: <code>Share of revenue (%)</code></li>
</ul>
<p>No printing. You should see a chart with <b>five bars</b>.</p>
<p><b>Think before you type:</b> a share is a part divided by a whole, times 100. The part is Electronics revenue per country. The whole is total revenue per country. Both are Series indexed by country, so dividing them lines the countries up for you.</p>`,
      starter: `import pandas as pd\nimport matplotlib.pyplot as plt\n\n# Write your code below\n`,
      hints: [
        `total = master.groupby("country")["line_total"].sum(). electronics = master[master["category"] == "Electronics"].groupby("country")["line_total"].sum(). share = electronics / total * 100. Then plt.bar(share.index, share.values).`,
        `import pandas as pd\nimport matplotlib.pyplot as plt\n\ntotal = master.groupby("country")["line_total"].sum()\nelectronics = master[master["category"] == "Electronics"].groupby("country")["line_total"].sum()\nshare = electronics / total * 100\n\nfig, ax = plt.subplots(figsize=(8, 4))\nax.bar(share.index, share.values)\nax.set_title("Electronics share of revenue by country")\nax.set_xlabel("Country")\nax.set_ylabel("Share of revenue (%)")\nplt.tight_layout()`
      ],
      solution: `import pandas as pd\nimport matplotlib.pyplot as plt\n\ntotal = master.groupby("country")["line_total"].sum()\nelectronics = master[master["category"] == "Electronics"].groupby("country")["line_total"].sum()\nshare = electronics / total * 100\n\nfig, ax = plt.subplots(figsize=(8, 4))\nax.bar(share.index, share.values)\nax.set_title("Electronics share of revenue by country")\nax.set_xlabel("Country")\nax.set_ylabel("Share of revenue (%)")\nplt.tight_layout()`,
      ordered: true
    },
    {
      id: 'py-7-2-c3',
      type: 'check',
      title: 'Completed orders are 74.1 percent of TradeFlow’s orders, Processing 15.5, Cancelled 5.3 and Returned 5.1. Which chart shows this mix most clearly?',
      body: `<p>Think about which pairs the reader will want to compare, and how well the eye can judge each kind of shape.</p>`,
      options: [
        'A 3D pie chart with a slice for each status',
        'A pie chart with four slices',
        'A sorted sideways bar chart with the percentage written on each bar',
        'A line chart with the four statuses along the bottom'
      ],
      answer: 2,
      why: [
        'The 3D effect distorts the slices, so the ones at the front look bigger than they are. It is one of the least honest chart types there is.',
        'The eye is poor at comparing angles. Nobody can tell by looking whether the Cancelled slice (5.3) is bigger than the Returned slice (5.1). Pies work for two or three very different slices at most.',
        'Right! Bars sit on a common baseline, so lengths compare instantly. Sorting gives a league table, and the written numbers settle close calls such as 5.3 against 5.1. It is plain, and for a board slide plain is a strength.',
        'A line would suggest the statuses follow each other in time, but they do not. Lines are for ordered axes such as months.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You can now compare categories the honest way, and you know the traps that make bar charts mislead. You can:</p>
<ul>
<li>Choose between a <b>line</b> (change over time) and <b>bars</b> (comparing categories)</li>
<li>Draw upright bars with <code>plt.bar</code> and sideways bars with <code>ax.barh</code>, <b>sorted</b>, with the values written on them by <code>bar_label</code></li>
<li>State the <b>iron rule</b>: a bar starts at zero, and explain how a cut-off axis turns 4.6 percent into “nearly three times”</li>
<li>Draw <b>stacked</b> bars for totals and parts, and <b>grouped</b> bars for fair comparison, straight from a table made with <code>unstack</code></li>
<li>Spot an <b>incomplete period</b> in a bar chart, and supply your own colours when you have more than four categories</li>
<li>Say why a bar chart usually beats a pie for a mix of categories</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>Why must a bar chart start at zero, while a line chart does not have to?</li>
<li>When would you choose a grouped bar chart over a stacked one?</li>
<li>A colleague sends you a bar chart where the tallest bar is three times the shortest. What do you check?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> In a bar chart the reader compares the lengths of bars, so the length has to be proportional to the value, and that is only true when every bar starts at zero. A line chart is read by its shape and the positions of its points against the axis, so a zoomed axis can be fair if the scale is clear. I would still choose the axis on purpose and make sure it does not turn ordinary noise into a drama.</p>
<p><b>2.</b> I use a stacked chart when the question is about the total and how it breaks into parts, since the tower height is the total. I use a grouped chart when the question is how the parts compare with each other, since every bar sits on the baseline. With only a few groups and slices, grouped is easier to read. With many slices, I would reconsider and use small separate charts.</p>
<p><b>3.</b> I look at the first number on the vertical axis. If it is not zero, the bars may exaggerate the difference. Then I check the real values, for example by writing them on the bars, and work out the actual ratio. Finally I check that the periods are comparable, because a short bar might simply be an incomplete year.</p>
</details>
<p><b>Coming next, in lesson 7.3:</b> distributions and relationships. Bars and lines compare totals. But the CEO’s deeper questions are about <i>shape</i>: how big is a typical order, and how often is one huge? Do customers who buy more units spend more? You will meet the histogram, which shows the shape of a whole column of numbers, and the scatter plot, which shows whether two columns move together.</p>`
    }
  ]
}
);
