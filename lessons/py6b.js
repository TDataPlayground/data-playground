LESSONS.push(
{
  id: 'py-6-3',
  track: 'python',
  lang: 'python',
  packages: ['pandas', 'numpy'],
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
  title: '6.3 Time and relationships: trends, correlation and what is not there',
  tables: [],
  intro: `The CEO has two questions left before the board meeting. The first: <i>“Is the business growing?”</i> The second: <i>“What drives the size of an order? Is it what people buy, how they pay, where they live, how fast we deliver?”</i><br><br>Those are the next two stops of the check-up. <b>Time</b> asks how the business moves through the months and years, and how to tell a real trend from ordinary ups and downs. <b>Relationships</b> asks what goes together with what, and it comes with a famous warning: a strong relationship proves less than it seems, and a <i>missing</i> relationship, which people rarely report, often proves more.<br><br>In this lesson you will build a monthly series, measure its trend with a line fitted in NumPy, correct for the length of months, and use the correlation coefficient to separate real relationships from imaginary ones. Along the way you will find that this business is remarkably steady, and that most of the things the CEO suspects drive order size do not.`,
  steps: [
    {
      type: 'explain',
      title: 'Stop 5: time, one month at a time',
      body: `<p>To study change over time, you first need a <b>time series</b>: one number for each period. Here it is the revenue of each month. To build it, Pandas offers a convenient tool: <code>dt.to_period("M")</code> turns a date into a <b>month label</b> such as <code>2024-03</code>, so that every date in March 2024 falls in the same group. Group by that label, add up the revenue, and you have the series.</p>
<p>A series has three ingredients, and good analysts learn to separate them:</p>
<ul>
<li><b>Trend</b>: a slow, lasting drift upwards or downwards.</li>
<li><b>Season</b>: a pattern that repeats every year, like a busy December.</li>
<li><b>Noise</b>: random ups and downs with no meaning.</li>
</ul>
<p>The most common mistake in reading time series is to mistake <b>noise for news</b>. A month that is 8 percent below the last one feels like an event. Whether it is one depends on how much the series normally bounces around. We will measure that, before we say anything about growth.</p>`
    },
    {
      type: 'try',
      title: 'Forty-two months of revenue',
      body: `<p>The series has <b>42</b> months, from <b>2023-01</b> to <b>2026-06</b>, as you would expect from three and a half years of data.</p>
<p>The average month brings in <b>37.67</b> million, and the standard deviation, the typical distance from that average, is <b>3.07</b> million. That is about 8 percent. The best month in the whole series is <b>2023-03</b> with <b>43.57</b> million, and the weakest is <b>2024-09</b> with <b>32.65</b> million.</p>
<p>Notice that the best month came in the first year, and the worst in the second. If the business were growing strongly, you would expect the best months to be recent. They are not.</p>`,
      code: `import pandas as pd

monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum()

print(len(monthly), monthly.index.min(), monthly.index.max())
print(round(monthly.mean() / 1e6, 2), round(monthly.std() / 1e6, 2))
print(monthly.idxmax(), round(monthly.max() / 1e6, 2))
print(monthly.idxmin(), round(monthly.min() / 1e6, 2))`
    },
    {
      id: 'py-6-3-ex1',
      type: 'exercise',
      title: 'Your turn: which month was the best?',
      body: `<p>Build the monthly revenue series, and print the <b>month with the highest revenue</b>. You should see <code>2023-03</code>.</p>
<p><b>Think before you type:</b> group <code>master["line_total"]</code> by <code>master["order_date"].dt.to_period("M")</code> and add up. Then <code>.idxmax()</code> gives the label of the biggest month.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum(). Then print(monthly.idxmax()).`,
        `import pandas as pd\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum()\nprint(monthly.idxmax())`
      ],
      solution: `import pandas as pd\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum()\nprint(monthly.idxmax())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'How much does the series bounce? Changes and rolling averages',
      body: `<p>Two tools measure the bounce and smooth it out:</p>
<ul>
<li><b><code>.pct_change()</code></b> gives the percentage change from each period to the one before. Multiply by 100 for percent. The first period has nothing before it, so it is missing (NaN).</li>
<li><b><code>.rolling(3).mean()</code></b> gives a <b>rolling average</b>: for every month, the average of that month and the two before it. It smooths out the noise, so that the underlying level is easier to see. The first two months are missing, because they do not yet have three months behind them.</li>
</ul>
<p>The standard deviation of the percentage changes is a good measure of “how much does this series normally jump from one month to the next?” If it is 13 percent, then a month that is 8 percent down is perfectly ordinary and says nothing at all.</p>`
    },
    {
      type: 'try',
      title: 'Normal bounce, and the smoothed level',
      body: `<p>The first line shows the month-on-month changes for the first six months: <b>nan, -4.8, 21.8, -22.6, 7.3, 8.2</b> percent. Look at the size of those swings: a jump of 21.8 percent in March 2023, followed by a drop of 22.6 percent in April.</p>
<p>The second line puts a number on the bounce. The standard deviation of the monthly changes is <b>12.8</b> percent. The biggest fall in the series is <b>-22.6</b> percent and the biggest rise is <b>28.8</b> percent. So a change of ten percent, up or down, is nothing unusual for this business.</p>
<p>The last line shows the rolling average for the last four months: <b>38.5, 38.3, 39.3 and 37.0</b> million. Compare that with the monthly values, which swing between 32 and 43. The rolling average moves in a narrow band, and the underlying level is steady.</p>`,
      code: `import pandas as pd

monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum()

change = monthly.pct_change() * 100
print(change.round(1).head(6).tolist())
print(round(change.std(), 1), round(change.min(), 1), round(change.max(), 1))

rolling = monthly.rolling(3).mean()
print((rolling / 1e6).round(1).tail(4).tolist())`
    },
    {
      id: 'py-6-3-ex2',
      type: 'exercise',
      title: 'Your turn: how big is the normal monthly swing?',
      body: `<p>Build the monthly revenue series, calculate the month-on-month percentage changes, and print their <b>standard deviation</b>, rounded to 1 decimal. You should see <code>12.8</code>.</p>
<p><b>Think before you type:</b> <code>monthly.pct_change() * 100</code> gives the changes in percent. <code>.std()</code> skips the first missing value by itself, and <code>round(..., 1)</code> keeps one decimal.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum(). change = monthly.pct_change() * 100. Then round(change.std(), 1).`,
        `import pandas as pd\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum()\nchange = monthly.pct_change() * 100\nprint(round(change.std(), 1))`
      ],
      solution: `import pandas as pd\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum()\nchange = monthly.pct_change() * 100\nprint(round(change.std(), 1))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Is there a trend? Fit a line',
      body: `<p>To answer “is the business growing?” properly, fit a <b>straight line</b> through the whole series and read its slope. NumPy does it in one call:</p>
<p><code>slope, intercept = np.polyfit(x, y, 1)</code></p>
<p>Here <code>x</code> is the time (we use the month number: 0, 1, 2, …, 41) and <code>y</code> is the revenue. The <code>1</code> means a straight line. The result is the line that comes closest to all the points: the <b>slope</b> says how much the line rises per month, and the <b>intercept</b> is where it starts.</p>
<p>Two checks make the slope meaningful:</p>
<ul>
<li><b>Compare it with the level.</b> A slope of 0.5 million a month sounds big, until you learn the average month is 3,000 million. Express the yearly rise as a percentage of the average month.</li>
<li><b>Look at the correlation</b> between time and revenue, <code>np.corrcoef(x, y)[0, 1]</code>. It ranges from -1 to +1. Near 0 means the points do not line up along any line, which is the signature of a series without a trend.</li>
</ul>`
    },
    {
      type: 'try',
      title: 'Is TradeFlow growing?',
      body: `<p>The fitted line starts at <b>37.39</b> million (the intercept) and rises by only <b>0.014</b> million per month (the slope). Over a year that is <b>0.16</b> million, which is just <b>0.43</b> percent of the average month. Nothing to write home about.</p>
<p>The last line is the correlation between time and revenue: <b>0.054</b>. That is very close to zero. The points are scattered around a flat line, and the line itself barely tilts.</p>
<p>The conclusion is a finding, even though it contains no “growth”: <b>TradeFlow’s revenue is flat</b>. Over three and a half years it has hovered around 37 to 38 million a month, with ordinary noise of about 8 percent. That also explains why the first-half comparisons in lesson 4.6 moved by only a few percent in either direction.</p>`,
      code: `import numpy as np
import pandas as pd

monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum()

x = np.arange(len(monthly))
y = monthly.to_numpy() / 1e6

slope, intercept = np.polyfit(x, y, 1)

print(round(slope, 3), round(intercept, 2))
print(round(slope * 12, 2))
print(round(np.corrcoef(x, y)[0, 1], 3))
print(round(slope * 12 / y.mean() * 100, 2))`
    },
    {
      id: 'py-6-3-c1',
      type: 'check',
      title: 'The fitted line rises by 0.16 million a year on an average month of 37.67 million, and the correlation between time and revenue is 0.054. What do you tell the CEO?',
      body: `<p>Compare the size of the rise with the size of the business and the size of the noise.</p>`,
      options: [
        'Revenue is growing steadily, because the slope is positive',
        'Revenue is flat: the yearly rise is about 0.4 percent, well inside the normal monthly bounce of about 8 percent, and the correlation with time is near zero',
        'Revenue is falling',
        'No conclusion is possible without more data'
      ],
      answer: 1,
      why: [
        'A positive slope is not enough. What matters is its size compared with the level and the noise. A rise of 0.4 percent a year is far too small to call growth.',
        'Right! A flat line with ordinary noise. Saying “the business is stable, with no growth trend” is a real finding, and it is one the CEO needs to hear, since it affects plans and expectations.',
        'The slope is slightly positive, not negative, and in any case too small to matter.',
        'You have 42 months of data, which is enough to say that there is no strong trend. Being honest about “no trend” is a conclusion.'
      ]
    },
    {
      id: 'py-6-3-ex3',
      type: 'exercise',
      title: 'Your turn: the yearly slope',
      body: `<p>Build the monthly revenue series in <b>millions</b> (divide by 1,000,000), fit a straight line with <code>np.polyfit</code> using the month number as <code>x</code>, and print the <b>slope per year</b> (the slope times 12), rounded to 2 decimals. You should see <code>0.16</code>.</p>
<p><b>Think before you type:</b> <code>x = np.arange(len(monthly))</code> and <code>y = monthly.to_numpy() / 1e6</code>. Then <code>slope, intercept = np.polyfit(x, y, 1)</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\n# Write your code below\n`,
      hints: [
        `monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum(). x = np.arange(len(monthly)). y = monthly.to_numpy() / 1e6. slope, intercept = np.polyfit(x, y, 1). Then round(slope * 12, 2).`,
        `import numpy as np\nimport pandas as pd\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum()\nx = np.arange(len(monthly))\ny = monthly.to_numpy() / 1e6\nslope, intercept = np.polyfit(x, y, 1)\nprint(round(slope * 12, 2))`
      ],
      solution: `import numpy as np\nimport pandas as pd\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum()\nx = np.arange(len(monthly))\ny = monthly.to_numpy() / 1e6\nslope, intercept = np.polyfit(x, y, 1)\nprint(round(slope * 12, 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Seasons, and the length of the month',
      body: `<p>In lesson 5.3 you saw that February was the weakest month, with 7.68 percent of the year’s revenue, and March the strongest at 9.09 percent. Is February really weak, or is it just short?</p>
<p>February has 28 days, March has 31. If every day brings in about the same, February will be about 10 percent smaller <i>for no business reason at all</i>. The fix is to compare <b>revenue per day</b>: divide each month’s revenue by the number of days in that month. A period label has the number built in: <code>monthly.index.days_in_month</code>.</p>
<p>Then, for each calendar month, average the revenue per day over the years. We use only the three complete years, 2023 to 2025, so that no month is counted more times than another. This is the like-for-like principle again.</p>`
    },
    {
      type: 'try',
      title: 'Revenue per day, month by month',
      body: `<p>The first line shows the average revenue per day in millions, for January to December: <b>1.232, 1.226, 1.325, 1.266, 1.259, 1.316, 1.179, 1.122, 1.185, 1.29, 1.189, 1.253</b>.</p>
<p>Look at February, the second value: <b>1.226</b>. Per day, February is <b>not weak at all</b>. It sits right in the middle of the pack, close to January. Its low monthly total was simply because it is the shortest month.</p>
<p>The second line shows the real extremes: the strongest month per day is <b>3</b> (March, 1.325) and the weakest is <b>8</b> (August, 1.122). The third line gives the gap: the best month per day is <b>1.181</b> times the weakest, about 18 percent. With only three observations for each month, an 18 percent gap is hard to tell apart from noise, so the right wording is “a mild and uncertain seasonal pattern”.</p>`,
      code: `import pandas as pd

monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum()

full_years = monthly[monthly.index.year <= 2025]
per_day = full_years / full_years.index.days_in_month
by_month = per_day.groupby(full_years.index.month).mean() / 1e6

print(by_month.round(3).tolist())
print(by_month.idxmax(), by_month.idxmin())
print(round(by_month.max() / by_month.min(), 3))`
    },
    {
      id: 'py-6-3-ex4',
      type: 'exercise',
      title: 'Your turn: February, per day',
      body: `<p>Using only the years up to and including 2025, calculate the <b>average revenue per day in February</b>, in millions, rounded to 3 decimals. You should see <code>1.226</code>.</p>
<p><b>Think before you type:</b> build <code>monthly</code>, keep <code>monthly.index.year &lt;= 2025</code>, divide by <code>.index.days_in_month</code>, group by month with <code>.groupby(...index.month).mean()</code>, divide by 1e6, and read February with <code>.loc[2]</code>.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `full = monthly[monthly.index.year <= 2025]. per_day = full / full.index.days_in_month. by_month = per_day.groupby(full.index.month).mean() / 1e6. Then round(by_month.loc[2], 3).`,
        `import pandas as pd\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum()\nfull = monthly[monthly.index.year <= 2025]\nper_day = full / full.index.days_in_month\nby_month = per_day.groupby(full.index.month).mean() / 1e6\nprint(round(by_month.loc[2], 3))`
      ],
      solution: `import pandas as pd\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum()\nfull = monthly[monthly.index.year <= 2025]\nper_day = full / full.index.days_in_month\nby_month = per_day.groupby(full.index.month).mean() / 1e6\nprint(round(by_month.loc[2], 3))`,
      ordered: true
    },
    {
      id: 'py-6-3-c2',
      type: 'check',
      title: 'February has the smallest monthly total but a typical revenue per day. What does that tell you?',
      body: `<p>Think about what a monthly total contains.</p>`,
      options: [
        'February is a weak month for the business',
        'February looks small mostly because it is the shortest month. Per day it is about average, so the “weakness” is an artefact of month length',
        'The days in February are less busy',
        'The data for February is incomplete'
      ],
      answer: 1,
      why: [
        'Per day it is average. The total is lower mainly because there are fewer days in it.',
        'Exactly. Before you read a seasonal pattern into month totals, adjust for the length of the month. It is the same idea as comparing like with like.',
        'The revenue per day in February (1.226 million) is close to January (1.232) and above August (1.122).',
        'All twelve months are present for 2023 to 2025.'
      ]
    },
    {
      type: 'explain',
      title: 'Stop 6: relationships and the correlation coefficient',
      body: `<p>Now the CEO’s second question: what goes with what? The standard measure is the <b>correlation coefficient</b>, written <b>r</b>. It compares two columns and gives a number from <b>-1 to +1</b>:</p>
<table class="mini">
<tr><th>r near…</th><th>Meaning</th></tr>
<tr><td><b>+1</b></td><td>when one is high, the other is high (a rising line)</td></tr>
<tr><td><b>0</b></td><td>no straight-line relationship at all</td></tr>
<tr><td><b>-1</b></td><td>when one is high, the other is low (a falling line)</td></tr>
</table>
<p>In Pandas: <code>table.corr()</code> gives the correlation of every pair of numeric columns, and <code>a.corr(b)</code> gives one pair. A common rule of thumb is that below 0.2 is negligible, around 0.5 is moderate, and above 0.8 is strong. Squaring r gives the share of the variation that one column “explains” in the other: r = 0.5 means 25 percent.</p>
<p>Four warnings go with r, and they are the most important part of this stop:</p>
<ol>
<li><b>Correlation is not causation.</b> Two things that go together may both be caused by a third, or one may cause the other, or it may be a coincidence. EDA finds the pattern. It does not explain it.</li>
<li><b>Built-in relationships are not discoveries.</b> <code>line_total</code> is <i>defined</i> as quantity times price. Of course it correlates with them.</li>
<li><b>r only sees straight-line patterns.</b> A curved relationship can have r near zero.</li>
<li><b>A missing relationship is a finding.</b> “Delivery time makes no difference to order size” is useful to know.</li>
</ol>`
    },
    {
      type: 'try',
      title: 'Price, quantity and line total',
      body: `<p>The table shows the correlations among three columns of the master table.</p>
<ul>
<li><b>quantity and unit_price: -0.001.</b> No relationship at all. People do not buy fewer of the expensive things, or more of the cheap ones. In real shops, you would usually expect a negative value here. That this one is zero is another sign that the dataset was generated.</li>
<li><b>line_total and unit_price: 0.809</b>, and <b>line_total and quantity: 0.444.</b> Strong and moderate, but this is not a discovery. The line total is calculated from the other two, so it must move with them. Price matters more because prices vary a lot more (from 577 to 84,082) than quantities (1 to 5).</li>
</ul>
<p>The lesson: a high correlation between a calculated column and its own ingredients tells you nothing. Do not put it in a report as an insight.</p>`,
      code: `import pandas as pd

print(master[["quantity", "unit_price", "line_total"]].corr().round(3))`
    },
    {
      id: 'py-6-3-c3',
      type: 'check',
      title: 'A colleague reports: “Line total is strongly correlated with unit price (r = 0.81), so price drives revenue.” What is wrong with this?',
      body: `<p>Think about how line_total is created.</p>`,
      options: [
        'Nothing, 0.81 is a strong correlation',
        'Line total is calculated as quantity times unit price, so it must move with its ingredients. The correlation is built in, and it says nothing about what drives revenue in the real world',
        'The correlation should be negative',
        'Correlation cannot be calculated on prices'
      ],
      answer: 1,
      why: [
        'The size of r is not the issue. The relationship is true by definition, which makes it uninformative.',
        'Exactly. A genuine finding would be a relationship between things that are not defined from each other, such as price and quantity (which, here, have none).',
        'There is no reason for a negative sign. The mistake is in treating a built-in relationship as a finding.',
        'Correlation can be calculated on any two numeric columns. The question is whether the result means anything.'
      ]
    },
    {
      type: 'try',
      title: 'What goes with the size of an order?',
      body: `<p>Now relationships that are <b>not</b> built in. The first table is at the level of orders. <b>Lines and value: 0.398.</b> <b>Units and value: 0.563.</b> Orders with more items cost more, which makes sense, but the relationship is moderate, not strong, because prices vary so much. Using <b>rank correlation</b>, which is less sensitive to a skewed shape, the units and value correlation is <b>0.566</b>, almost the same. The result holds up. (Rank correlation is just the ordinary correlation of the <i>ranks</i>: replace each value by its position in the sorted list with <code>.rank()</code>, then correlate. It is also called Spearman’s correlation.)</p>
<p>Then the relationships the CEO suspected. <b>Delivery time and order value: 0.007.</b> Nothing: bigger orders are not delivered slower or faster. <b>Orders and revenue per customer: 0.798.</b> Strong, but expected: more orders mean more revenue. This one is close to built-in.</p>
<p>And one more fact from the same family: a customer’s signup year has a correlation of just <b>0.002</b> with how many orders they place, so long-standing customers are not more active than new ones.</p>`,
      code: `import pandas as pd

order_level = master.groupby("order_id").agg(
    lines=("line_total", "size"),
    units=("quantity", "sum"),
    value=("line_total", "sum")
)
print(order_level.corr().round(3))
print(round(order_level["value"].rank().corr(order_level["units"].rank()), 3))

delivered = deliveries.copy()
delivered["days"] = (pd.to_datetime(delivered["delivery_date"]) - pd.to_datetime(delivered["dispatch_date"])).dt.days
joined = delivered.merge(order_level.reset_index(), on="order_id")
print(round(joined["days"].corr(joined["value"]), 3))

per_customer = master.groupby("customer_id").agg(orders=("order_id", "nunique"), revenue=("line_total", "sum"))
print(round(per_customer["orders"].corr(per_customer["revenue"]), 3))`
    },
    {
      id: 'py-6-3-ex5',
      type: 'exercise',
      title: 'Challenge: units and order value',
      body: `<p>Calculate, for each order, the <b>number of units</b> (the sum of <code>quantity</code>) and the <b>order value</b> (the sum of <code>line_total</code>). Print the correlation between them, rounded to 3 decimals. You should see <code>0.563</code>.</p>
<p><b>Think before you type:</b> use <code>master.groupby("order_id").agg(units=("quantity", "sum"), value=("line_total", "sum"))</code>. Then <code>order_level["units"].corr(order_level["value"])</code>.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `order_level = master.groupby("order_id").agg(units=("quantity", "sum"), value=("line_total", "sum")). Then round(order_level["units"].corr(order_level["value"]), 3).`,
        `import pandas as pd\norder_level = master.groupby("order_id").agg(units=("quantity", "sum"), value=("line_total", "sum"))\nprint(round(order_level["units"].corr(order_level["value"]), 3))`
      ],
      solution: `import pandas as pd\norder_level = master.groupby("order_id").agg(units=("quantity", "sum"), value=("line_total", "sum"))\nprint(round(order_level["units"].corr(order_level["value"]), 3))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You have taken stops 5 and 6, and you have answered both of the CEO’s questions. The business is <b>flat, not growing</b>. And order size is not driven by payment method, delivery time or customer age. You can:</p>
<ul>
<li>Build a <b>monthly time series</b> with <code>to_period("M")</code>, and name its three ingredients: trend, season and noise</li>
<li>Measure how much a series bounces with <code>pct_change</code>, and smooth it with <code>rolling(3).mean()</code></li>
<li>Fit a <b>trend line</b> with <code>np.polyfit</code>, and judge the slope against the level and the noise</li>
<li>Correct for the <b>length of the month</b> by looking at revenue per day</li>
<li>Read the <b>correlation coefficient</b>, and name its four warnings</li>
<li>Report a <b>missing relationship</b> as a finding, and recognise a built-in one as no finding at all</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>How would you check whether a business is growing?</li>
<li>What does a correlation of 0.8 tell you, and what does it not?</li>
<li>Sales fell 8 percent last month. What do you check before raising an alarm?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I build a monthly series and compare like with like, for example the same months in each year. I fit a trend line and look at the slope relative to the average level, and at the correlation between time and the measure. I also measure the normal month-to-month bounce, so I know whether a change is bigger than noise. Here the yearly rise is about 0.4 percent, with monthly swings of about 13 percent, so I would say that revenue is flat.</p>
<p><b>2.</b> A correlation of 0.8 says that the two columns move together along a straight line, and that the first explains about 64 percent of the variation in the second. It does not say that one causes the other, and it does not rule out that the relationship is built in, caused by a third factor or a coincidence. It also says nothing about curved relationships.</p>
<p><b>3.</b> I check the size of the normal monthly bounce, since an 8 percent change may be routine. I check whether the months have the same number of days and the same number of trading days, whether the data for the month is complete, and what the same month looked like in previous years. Only if the fall stands out against all that do I investigate causes.</p>
</details>
<p><b>Coming next, in lesson 6.4:</b> the last two stops. You now have a collection of findings. Stop 7 is to <b>challenge</b> them: does each one hold in every year, under every definition and in every segment? Some will survive and some will not. Stop 8 is to <b>write the report</b>: findings, evidence, confidence, and the questions that remain. It is the lesson where the EDA becomes something a CEO can read.</p>`
    }
  ]
},
{
  id: 'py-6-4',
  track: 'python',
  lang: 'python',
  packages: ['pandas', 'numpy'],
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
  title: '6.4 Challenge your findings, then write the report',
  tables: [],
  intro: `The board meeting is tomorrow. You have a pile of findings: the numbers tie out, Electronics leads, the 80/20 belief is false, repeat buying is high, Rwanda is the biggest country, revenue is flat. The Head of Data looks at your list. <i>“Good,”</i> he says. <i>“Now try to break every one of them.”</i><br><br>It sounds odd to attack your own work, and it is the most valuable habit in analysis. A finding that has survived your best attempts to break it is one you can defend in front of a board. A finding that fails your own attack is one that would have embarrassed you in the room.<br><br>This lesson covers the last two stops. <b>Challenge</b>: test each finding on different years, different definitions and different windows. <b>Report</b>: write down what you found, the evidence, how sure you are, and what you still do not know. Some of your findings will survive untouched. One will need a more careful wording, and one will change its meaning altogether.`,
  steps: [
    {
      type: 'explain',
      title: 'Stop 7: how to attack a finding',
      body: `<p>A finding is a claim with a number. To challenge it, change the conditions and see whether it still stands. Four attacks cover most of what can go wrong:</p>
<table class="mini">
<tr><th>Attack</th><th>The question</th><th>Example</th></tr>
<tr><td><b>Different time slice</b></td><td>Does it hold in every year, not only overall?</td><td>Is Electronics first in 2023, 2024, 2025 and 2026?</td></tr>
<tr><td><b>Different definition</b></td><td>Does it survive a reasonable alternative definition?</td><td>Gross or net revenue, all orders or Completed only</td></tr>
<tr><td><b>Different window</b></td><td>Does the number depend on how long a period it covers?</td><td>Repeat rate over 3.5 years or within one year</td></tr>
<tr><td><b>Noise check</b></td><td>Is the difference bigger than the natural variation?</td><td>Rwanda’s lead against how much rankings move from year to year</td></tr>
</table>
<p>Each attack ends with one of three outcomes: the finding <b>survives</b> and your confidence rises, it <b>survives with a qualification</b> and you word it more carefully, or it <b>fails</b> and you drop it or turn it into a question. All three outcomes are good news. They mean you found out in private and not in the board room.</p>
<p>To keep track, analysts keep a <b>findings log</b>: a short table of claims and numbers. Let’s start one, with every number <b>calculated from the data</b> rather than typed, so that the log can be rerun when the data changes.</p>`
    },
    {
      type: 'try',
      title: 'The findings log, version one',
      body: `<p>Six lines, each one a claim and the number behind it. <b>Revenue ties to payments (difference): 0.0.</b> <b>Top category: Electronics</b>, with <b>38.45</b> percent of revenue. <b>The top 20 percent of customers bring 36.08 percent</b> of revenue. <b>Top country: Rwanda</b>, with <b>22.1</b> percent.</p>
<p>Look at how the table is built: every value is computed by code, from <code>master</code> and <code>payments</code>. Nothing is typed in by hand. If next month’s data arrives, running the code produces a fresh log. That is the difference between an analysis and a one-off calculation.</p>
<p>Now the challenges begin, starting with the most common attack: <b>is it true in every year?</b></p>`,
      code: `import pandas as pd

gross = master["line_total"].sum()
paid_total = payments["amount"].sum()
category = master.groupby("category")["line_total"].sum()
by_customer = master.groupby("customer_id")["line_total"].sum().sort_values(ascending=False)
top20 = by_customer.head(396).sum() / by_customer.sum() * 100
by_country = master.groupby("country")["line_total"].sum()

log = pd.DataFrame([
    ("Revenue ties to payments (difference)", round(gross - paid_total, 2)),
    ("Top category", category.idxmax()),
    ("Top category share of revenue (%)", round(category.max() / category.sum() * 100, 2)),
    ("Top 20% of customers, share of revenue (%)", round(top20, 2)),
    ("Top country", by_country.idxmax()),
    ("Top country share of revenue (%)", round(by_country.max() / by_country.sum() * 100, 2))
], columns=["finding", "value"])

print(log)`
    },
    {
      type: 'explain',
      title: 'Attack 1: hold the finding up against every year',
      body: `<p>An overall number can hide a story. A finding that is true on average could be driven by a single remarkable year, or it could have reversed halfway through. To test it, calculate the same thing <b>year by year</b>.</p>
<p>The recipe uses what you know. Group by <b>two columns</b>, the year and the thing you are ranking, and use <code>unstack()</code> to turn the second one into columns (lesson 4.4). Then convert each row to shares of its own total with <code>.div(..., axis=0)</code>, so that years of different length can be compared. Finally, <code>idxmax(axis=1)</code> names the winner in each row.</p>
<p>Keep the rule from lesson 4.6 in mind: <b>2026 has only six months</b>. A share is safe to compare, because it is a proportion of its own year. A total would not be.</p>`
    },
    {
      type: 'try',
      title: 'Does Electronics lead in every year?',
      body: `<p>The first table shows Electronics’ share of revenue by year: <b>38.37</b> (2023), <b>38.87</b> (2024), <b>38.39</b> (2025) and <b>37.9</b> (2026, half a year). The share barely moves.</p>
<p>The second line names the top category in each year. It is <b>Electronics, Electronics, Electronics, Electronics</b>, four out of four. The third line measures the spread: the highest share and the lowest differ by only <b>0.98</b> percentage points.</p>
<p>The finding <b>survives, and strongly</b>. Not only is Electronics first overall, it is first in every single year, with a share that stays within one point of 38 percent. You can now say that with a lot of confidence.</p>`,
      code: `import pandas as pd

by_year = master.groupby(["order_year", "category"])["line_total"].sum().unstack()
share = by_year.div(by_year.sum(axis=1), axis=0) * 100

print(share["Electronics"].round(2))
print(by_year.idxmax(axis=1).tolist())
print(round(share["Electronics"].max() - share["Electronics"].min(), 2))`
    },
    {
      id: 'py-6-4-ex1',
      type: 'exercise',
      title: 'Your turn: Electronics in 2024',
      body: `<p>Calculate the <b>share of revenue</b> that Electronics brought in the year <b>2024</b>, as a percentage rounded to 2 decimals. You should see <code>38.87</code>.</p>
<p><b>Think before you type:</b> group by <code>["order_year", "category"]</code> and sum <code>line_total</code>, then <code>unstack()</code>. Divide each row by its own total with <code>.div(by_year.sum(axis=1), axis=0)</code>, multiply by 100, and read <code>.loc[2024, "Electronics"]</code>.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `by_year = master.groupby(["order_year", "category"])["line_total"].sum().unstack(). share = by_year.div(by_year.sum(axis=1), axis=0) * 100. Then round(share.loc[2024, "Electronics"], 2).`,
        `import pandas as pd\nby_year = master.groupby(["order_year", "category"])["line_total"].sum().unstack()\nshare = by_year.div(by_year.sum(axis=1), axis=0) * 100\nprint(round(share.loc[2024, "Electronics"], 2))`
      ],
      solution: `import pandas as pd\nby_year = master.groupby(["order_year", "category"])["line_total"].sum().unstack()\nshare = by_year.div(by_year.sum(axis=1), axis=0) * 100\nprint(round(share.loc[2024, "Electronics"], 2))`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Does Rwanda lead in every year?',
      body: `<p>The same attack on countries. The table gives revenue by year and country, in millions. Read down the Rwanda column: <b>93.47, 101.85, 101.11 and 53.12</b>. Compare it with Nigeria: <b>93.64, 93.41, 92.68 and 39.94</b>.</p>
<p>The second line names the leader of each year: <b>Nigeria, Rwanda, Rwanda, Rwanda</b>. The third counts Rwanda’s wins: <b>3</b> out of 4. In <b>2023, Nigeria came first</b>, though the gap was tiny: <b>172485.86</b>, which is 0.18 percent of Rwanda’s revenue that year. In the later years Rwanda pulled clearly ahead, by about 9 percent in 2024.</p>
<p>So this finding <b>survives with a qualification</b>. “Rwanda is the biggest country” is true overall and in the last three years. It was not true in 2023, when the two were practically level. Worth saying exactly like that.</p>`,
      code: `import pandas as pd

by_country = master.groupby(["order_year", "country"])["line_total"].sum().unstack()
print((by_country / 1e6).round(2))

leaders = by_country.idxmax(axis=1)
print(leaders.tolist())
print((leaders == "Rwanda").sum())
print(round(by_country.loc[2023, "Nigeria"] - by_country.loc[2023, "Rwanda"], 2))`
    },
    {
      id: 'py-6-4-ex2',
      type: 'exercise',
      title: 'Your turn: who led in 2023?',
      body: `<p>Calculate the revenue of each country in <b>2023</b>, and print the <b>name of the country</b> with the highest revenue that year. You should see <code>Nigeria</code>.</p>
<p><b>Think before you type:</b> keep the rows with <code>master["order_year"] == 2023</code>, group by <code>country</code>, sum the <code>line_total</code>, and use <code>.idxmax()</code>.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `rows = master[master["order_year"] == 2023]. Then rows.groupby("country")["line_total"].sum().idxmax().`,
        `import pandas as pd\nrows = master[master["order_year"] == 2023]\nprint(rows.groupby("country")["line_total"].sum().idxmax())`
      ],
      solution: `import pandas as pd\nrows = master[master["order_year"] == 2023]\nprint(rows.groupby("country")["line_total"].sum().idxmax())`,
      ordered: true
    },
    {
      id: 'py-6-4-c1',
      type: 'check',
      title: 'Rwanda leads overall and in three of the four years, but in 2023 Nigeria was ahead by 0.18 percent. What does that do to the finding “Rwanda is the biggest country”?',
      body: `<p>Think about how to word a finding that mostly, but not always, holds.</p>`,
      options: [
        'It destroys the finding, so you should drop it',
        'It qualifies the finding: Rwanda is the biggest country overall and led in 2024, 2025 and 2026, while in 2023 the two were practically level. You report it with that wording, and with medium confidence',
        'It changes nothing, because overall totals are all that matter',
        'It proves that Nigeria is the biggest country'
      ],
      answer: 1,
      why: [
        'The finding is mostly intact. Three of four years, and the overall total, favour Rwanda. Dropping it would throw away real information.',
        'Exactly. Qualified findings are the most common kind. Giving the exact wording and an honest confidence level tells the reader how much weight to put on it.',
        'The yearly check exists precisely because overall totals can hide changes. The 2023 result is part of the true picture.',
        'A 0.18 percent edge in a single year proves nothing about who is biggest overall.'
      ]
    },
    {
      type: 'explain',
      title: 'Attack 2: the window decides the number',
      body: `<p>Some findings depend on how long a period they cover. The repeat rate is the classic case. In lesson 6.1 you found that 97 percent of buyers placed two or more orders. But over <b>what period</b>? That figure counted every order across three and a half years. How many customers order twice <b>within a single year</b>?</p>
<p>To find out, repeat the calculation separately for each year. And do the same for the 80/20 test from lesson 6.2: if the top 20 percent of customers bring only 36 percent of revenue over the whole period, what do they bring in a single year? A shorter window gives each customer fewer orders, which changes both numbers.</p>
<p>The loop below runs both calculations for each year. It uses only what you already know: filter, group, count, and sort.</p>`
    },
    {
      type: 'try',
      title: 'Repeat rate and concentration, year by year',
      body: `<p>Each line gives the year, the number of buyers, the repeat rate and the share of revenue of the top 20 percent of customers.</p>
<ul>
<li><b>2023</b>: 1520 buyers, repeat rate <b>55.07</b> percent, top 20 percent bring <b>44.32</b> percent.</li>
<li><b>2024</b>: 1534 buyers, <b>55.67</b> percent, <b>43.75</b> percent.</li>
<li><b>2025</b>: 1547 buyers, <b>54.17</b> percent, <b>44.14</b> percent.</li>
<li><b>2026</b>: 1006 buyers, <b>30.82</b> percent, <b>45.62</b> percent.</li>
</ul>
<p>Two very different outcomes. First, the <b>repeat rate is not 97 percent within a year: it is about 55 percent</b>. The 97 percent was true only for the whole period of three and a half years. In 2026 it is 31 percent only because the year is half over. Second, <b>the 80/20 belief fails in every window</b>: in a single year the top 20 percent bring 44 to 46 percent, higher than the 36 percent over the full period, but nowhere near 80.</p>`,
      code: `import pandas as pd

for year in [2023, 2024, 2025, 2026]:
    rows = master[master["order_year"] == year]
    per_customer = rows.groupby("customer_id")["order_id"].nunique()
    by_customer = rows.groupby("customer_id")["line_total"].sum().sort_values(ascending=False)
    top = int(round(len(by_customer) * 0.2))
    print(year, len(per_customer), round((per_customer >= 2).mean() * 100, 2), round(by_customer.head(top).sum() / by_customer.sum() * 100, 2))`
    },
    {
      id: 'py-6-4-ex3',
      type: 'exercise',
      title: 'Your turn: the repeat rate within 2025',
      body: `<p>Keep only the order lines of <b>2025</b>. Among the customers who bought in 2025, print the <b>percentage who placed two or more different orders in 2025</b>, rounded to 2 decimals. You should see <code>54.17</code>.</p>
<p><b>Think before you type:</b> filter with <code>master["order_year"] == 2025</code>. Group by <code>customer_id</code> and count the different <code>order_id</code> values. The share with <code>&gt;= 2</code> is the <code>.mean()</code> of the mask. Multiply by 100 and round.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `rows = master[master["order_year"] == 2025]. per_customer = rows.groupby("customer_id")["order_id"].nunique(). Then round((per_customer >= 2).mean() * 100, 2).`,
        `import pandas as pd\nrows = master[master["order_year"] == 2025]\nper_customer = rows.groupby("customer_id")["order_id"].nunique()\nprint(round((per_customer >= 2).mean() * 100, 2))`
      ],
      solution: `import pandas as pd\nrows = master[master["order_year"] == 2025]\nper_customer = rows.groupby("customer_id")["order_id"].nunique()\nprint(round((per_customer >= 2).mean() * 100, 2))`,
      ordered: true
    },
    {
      id: 'py-6-4-c2',
      type: 'check',
      title: 'A slide says “97 percent of our customers are repeat buyers”. After your windows check, what must you add to it?',
      body: `<p>Remember what the 97 percent counted.</p>`,
      options: [
        'Nothing, 97 percent is a fact',
        'The window and the definition: 97 percent of buyers placed at least two orders over the 3.5 years of data, counting every order. Within any single year it is about 55 percent, and over the 3.5 years counting only Completed orders it is 91 percent',
        'That the figure is wrong and should be removed',
        'A note that repeat rates are always high'
      ],
      answer: 1,
      why: [
        'The figure is true for its definition and window. Without them, the reader will assume a much stronger claim than the data supports.',
        'Exactly. The same data supports 97, 91 and 55 percent, depending on the question. The honest slide says which question it answers, and the reader can decide what they need.',
        'It is not wrong. It answers a particular question, and the problem is that the question was not stated.',
        'There is no such rule. In many businesses repeat rates are far lower, and this dataset is unusually high.'
      ]
    },
    {
      type: 'explain',
      title: 'Attack 3: what is not there, and why it is also a finding',
      body: `<p>Not every investigation ends in a pattern. Some of the most useful results in EDA are <b>things you looked for and did not find</b>. If the CEO suspects that customers who pay by card spend more, or that cancelled orders are smaller, the best answer might be: <i>“We looked, and there is no meaningful difference.”</i></p>
<p>To report an absence responsibly, put a number on “no difference”. Compare the groups and express the gap as a percentage of the smaller one. A gap of 2 percent between groups, in a measure that varies by 70 percent from one order to the next, is nothing. A good rule: if the gap between groups is much smaller than the natural spread of the measure, it is noise.</p>
<p>Two comparisons are worth making here, because they are the ones people most often assume matter:</p>
<ul>
<li>Does the <b>payment method</b> change the size of a payment?</li>
<li>Does the <b>order status</b> (Completed, Cancelled and so on) go with the size of an order? In particular: are cancelled orders smaller, or bigger?</li>
</ul>`
    },
    {
      type: 'try',
      title: 'No difference in payment size or order size',
      body: `<p>The first table gives the average payment for each method: <b>Bank Transfer 156389.50</b>, <b>Card 158191.86</b>, <b>Cash on Delivery 159043.99</b> and <b>Mobile Money 159142.42</b>. The highest is only <b>1.76</b> percent above the lowest, which is 2,753 on a payment of 157,000, while individual payments range from 1,295 to over a million. There is no meaningful difference between payment methods.</p>
<p>The second table gives the average order value by status: <b>Cancelled 157353.18</b>, <b>Completed 157926.30</b>, <b>Processing 160431.33</b> and <b>Returned 156201.12</b>. The spread is <b>2.71</b> percent. Cancelled and returned orders are <b>not smaller or bigger</b> than the rest. Customers do not cancel because the order is large, and they do not return because it is small.</p>
<p>That is a clear and useful finding, and it was only visible because you checked.</p>`,
      code: `import pandas as pd

print(payments.groupby("payment_method")["amount"].mean().round(2))

order_value = master.groupby(["order_id", "order_status"])["line_total"].sum().reset_index()
print(order_value.groupby("order_status")["line_total"].mean().round(2))`
    },
    {
      id: 'py-6-4-ex4',
      type: 'exercise',
      title: 'Your turn: how big is the gap between payment methods?',
      body: `<p>Calculate the average payment <code>amount</code> for each <code>payment_method</code>. Print how many <b>percent</b> the highest average is above the lowest average, rounded to 2 decimals. You should see <code>1.76</code>.</p>
<p><b>Think before you type:</b> <code>averages = payments.groupby("payment_method")["amount"].mean()</code>. Then <code>(averages.max() / averages.min() - 1) * 100</code>, inside <code>round(..., 2)</code>.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `averages = payments.groupby("payment_method")["amount"].mean(). Then round((averages.max() / averages.min() - 1) * 100, 2).`,
        `import pandas as pd\naverages = payments.groupby("payment_method")["amount"].mean()\nprint(round((averages.max() / averages.min() - 1) * 100, 2))`
      ],
      solution: `import pandas as pd\naverages = payments.groupby("payment_method")["amount"].mean()\nprint(round((averages.max() / averages.min() - 1) * 100, 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Stop 8: the report, and how sure you are',
      body: `<p>You now have findings that have been attacked. The last step is to write them down in a form that a busy reader can use. A good EDA report is not a pile of tables. It is a short list, and each entry has four parts:</p>
<ol>
<li><b>The finding</b>, in one plain sentence.</li>
<li><b>The evidence</b>: the number, with its definition and window.</li>
<li><b>Where it holds</b>: the attacks it survived, or the qualification that goes with it.</li>
<li><b>The confidence</b>: <b>High</b> if it held under every attack, <b>Medium</b> if it held with a qualification or depends on a definition, <b>Low</b> if it rests on little data or only one view.</li>
</ol>
<p>Two more things belong in a report, and they separate a trustworthy one from a flattering one. <b>What you did not find</b>, the absences. And <b>what you still do not know</b>, the open questions: why does “Delayed” not mean a longer transit? Who should check the 460 cancelled orders that show a Paid payment?</p>
<p>The wording matters as much as the numbers. Use the exact figures, state the definition, never claim a cause you have not shown, and do not round away a qualification.</p>`
    },
    {
      type: 'try',
      title: 'The EDA report',
      body: `<p>Seven findings, written the way a board would read them. The code is just a list of entries and a loop to print them neatly: <code>enumerate(report, start=1)</code> numbers them from 1.</p>
<p>Notice the confidence levels. <b>High</b> for the tie-out, for Electronics (held in every year and under both definitions), for the 80/20 result (failed in every window) and for “no relationship” with order size (all comparisons within a few percent). <b>Medium</b> for repeat buying (which depends on the definition and the window), for Rwanda (three of four years) and for the flat trend (a short series with a lot of bounce).</p>
<p>Each entry carries the numbers you worked out over this module. In a real report you would pull them from variables in the code, as in the findings log earlier. Here they are written out so that you can read the final result.</p>`,
      code: `import pandas as pd

report = [
    ("Revenue and payments agree", "10,000 of 10,000 orders tie out to the cent; total 1,581,981,450.50", "every order", "High"),
    ("Electronics earns the most", "38.45% of revenue from 20.43% of lines (37.9% to 38.9% by year)", "every year, gross and net", "High"),
    ("The 80/20 rule does not hold", "top 20% of customers bring 36.08% of revenue (44% to 46% within a year)", "every window tested", "High"),
    ("Repeat buying is high, and depends on the window", "97.12% over 3.5 years, 91.41% counting Completed only, about 55% within a year", "depends on definition", "Medium"),
    ("Rwanda is the largest country", "22.1% of revenue; first in 2024, 2025 and 2026; level with Nigeria in 2023", "3 of 4 years", "Medium"),
    ("Revenue is flat", "about +0.4% a year; monthly swings of about 13%; correlation with time 0.05", "whole period", "Medium"),
    ("Order size is unrelated to payment method, status or delivery time", "gaps of 3% or less; correlation with delivery time 0.01", "all comparisons", "High")
]

for number, (finding, evidence, holds, confidence) in enumerate(report, start=1):
    print(number, finding)
    print("   Evidence:", evidence)
    print("   Holds:", holds, "| Confidence:", confidence)`
    },
    {
      id: 'py-6-4-ex5',
      type: 'exercise',
      title: 'Challenge: in how many years was Electronics above 38 percent?',
      body: `<p>Calculate Electronics’ share of revenue in each year (as in the first challenge), and print <b>how many of the four years</b> had a share <b>above 38 percent</b>. You should see <code>3</code>. The odd one out is the half year of 2026.</p>
<p><b>Think before you type:</b> build <code>share</code> by year as before. Then <code>share["Electronics"] &gt; 38</code> gives a True/False for each year, and <code>.sum()</code> counts the Trues.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `by_year = master.groupby(["order_year", "category"])["line_total"].sum().unstack(). share = by_year.div(by_year.sum(axis=1), axis=0) * 100. Then (share["Electronics"] > 38).sum().`,
        `import pandas as pd\nby_year = master.groupby(["order_year", "category"])["line_total"].sum().unstack()\nshare = by_year.div(by_year.sum(axis=1), axis=0) * 100\nprint((share["Electronics"] > 38).sum())`
      ],
      solution: `import pandas as pd\nby_year = master.groupby(["order_year", "category"])["line_total"].sum().unstack()\nshare = by_year.div(by_year.sum(axis=1), axis=0) * 100\nprint((share["Electronics"] > 38).sum())`,
      ordered: true
    },
    {
      id: 'py-6-4-c3',
      type: 'check',
      title: 'Which sentence about Rwanda belongs in the report?',
      body: `<p>Choose the wording that is accurate and tells the reader how much to rely on it.</p>`,
      options: [
        'Rwanda is the top country.',
        'Rwanda is the largest country, with 22.1 percent of revenue. It led in 2024, 2025 and 2026, and was level with Nigeria in 2023. Confidence: medium.',
        'Rwanda always leads, in every year.',
        'Rwanda beats every other country on every measure.'
      ],
      answer: 1,
      why: [
        'This is short, but it leaves out the number, the years and the qualification. A reader cannot tell how firmly it holds.',
        'Yes! It states the finding, the evidence, where it holds, and the confidence. It is longer than the first, and it is the one a careful reader can use.',
        'This is false: Nigeria led in 2023. Overstating a finding is the fastest way to lose trust.',
        'Rwanda leads on revenue because it has the most buyers, but per buyer Ghana is ahead (lesson 6.2). “Every measure” is not supported.'
      ]
    },
    {
      type: 'explain',
      title: 'Module 6 is complete',
      body: `<div class="callout tip"><b>Look at what you did.</b> The CEO’s email had no question mark. You turned it into eight stops: the first look and the tie-out (6.1), distributions and concentration (6.2), time and relationships (6.3), and finally the challenge and the report (6.4). Along the way you showed that a headline repeat rate of 97 percent is really 91 or 55 percent depending on the question, that the 80/20 belief is false here, that the business is flat rather than growing, that February is not weak once you count days, and that order size has nothing to do with how people pay. You also found that Electronics leads in every year, and that Rwanda leads in three of four. That is what an exploratory analysis looks like when it is done properly: a short list of findings, each with its evidence and its limits.</div>
<p>In this lesson you learned to:</p>
<ul>
<li>Attack a finding with <b>four tests</b>: a different time slice, definition, window, and a noise check</li>
<li>Test a claim <b>year by year</b> with a two-column group-by, <code>unstack</code>, row shares and <code>idxmax(axis=1)</code></li>
<li>Keep a <b>findings log</b> whose numbers are calculated and not typed</li>
<li>Report an <b>absence</b> with a number, and recognise it as a finding</li>
<li>Write a report in which every entry has a <b>finding, evidence, scope and confidence</b>, and a list of open questions</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>Walk me through how you would explore a dataset you have never seen.</li>
<li>How do you make sure a finding is trustworthy before presenting it?</li>
<li>You found no relationship between two variables. Is that worth reporting?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I start with the first look: size, types, missing values and distinct counts, and what one row stands for. Then I reconcile the totals against another source. Next I look at distributions, who or what drives the totals, change over time and relationships between columns. Finally I challenge each finding and write a report with the evidence and a confidence level for each one. I keep a log of findings as I go, with numbers calculated by code.</p>
<p><b>2.</b> I try to break it. I recalculate it for each year, under an alternative definition, over a different window, and I compare any difference with the normal variation in the data. If it survives, my confidence rises. If it survives with a qualification, I word it more carefully. If it fails, I drop it or turn it into a question. I also state the definition and window with every number.</p>
<p><b>3.</b> Yes. It tells the business what does not matter, which saves effort and corrects assumptions. For example, if payment method does not change the payment size, nobody needs to plan around it. I would report it with the size of the gap relative to the natural spread of the measure, so that “no relationship” is backed by a number and not just by silence.</p>
</details>
<p><b>Coming next, in Module 7:</b> visualisation. Everything in this module was done with tables and numbers, and a good analysis often needs a picture. You will learn to draw with matplotlib, the one charting library that comes with the platform: line charts for time, bars for comparisons, histograms for distributions, and scatter plots for relationships. You will choose the right chart for each question, make it readable, and turn the findings of this module into the charts that a board can understand at a glance.</p>`
    }
  ]
}
);
