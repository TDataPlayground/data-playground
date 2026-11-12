LESSONS.push(
{
  id: 'py-5-3',
  track: 'python',
  lang: 'python',
  packages: ['pandas', 'numpy'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: '',
  title: '5.3 Axes, missing values and spread: summarising a grid',
  tables: [],
  intro: `The detector’s first version used fixed thresholds: 500,000 for High, 2,000 for Low. The finance team liked it, then asked the obvious question: <i>“Who decided on 500,000? What if payments grow next year?”</i> A better detector would learn what “normal” looks like from the data itself. To do that, you need to <b>summarise</b>: the average, the typical spread, the shape of the whole.<br><br>This lesson gives you the three skills behind every summary. First, <b>axis</b>: how to summarise a grid by rows or by columns, such as revenue by year and month. Second, <b>NaN</b>, NumPy’s mark for a missing number, which has a nasty habit of infecting every sum it touches. Third, <b>spread</b>: how far values typically sit from their average, and the quiet version problem that makes NumPy and Pandas disagree about it.<br><br>On the way you will walk into the same trap as in lesson 4.6, the half-empty year, and this time you will see exactly how it happens inside the numbers.`,
  steps: [
    {
      type: 'explain',
      title: 'axis: which direction do you squash?',
      body: `<p>A 2D array is a grid with rows and columns. When you summarise it, you must say <b>which direction to collapse</b>, and that is the job of the <code>axis</code> argument.</p>
<ul>
<li><code>axis=0</code>: collapse the <b>rows</b>. You go down each column and get <b>one answer per column</b>.</li>
<li><code>axis=1</code>: collapse the <b>columns</b>. You go along each row and get <b>one answer per row</b>.</li>
<li>No axis at all: collapse everything into <b>one number</b>.</li>
</ul>
<div class="callout analogy"><b>A trick to remember it:</b> the axis you name is the one that <i>disappears</i>. A 3 by 4 grid summed over <code>axis=0</code> loses its 3 rows and keeps its 4 columns, so you get 4 answers. Summed over <code>axis=1</code>, it loses its 4 columns and keeps its 3 rows, so you get 3 answers.</div>
<p>If you have used a spreadsheet, it is the <b>total row</b> at the bottom (axis 0: one total per column) and the <b>total column</b> at the right (axis 1: one total per row). Let’s check it on a grid small enough to add up by eye.</p>`
    },
    {
      type: 'try',
      title: 'A grid of twelve numbers, three ways',
      body: `<p>The grid holds the numbers 1 to 12 in 3 rows and 4 columns: <code>[1 2 3 4]</code>, <code>[5 6 7 8]</code> and <code>[9 10 11 12]</code>.</p>
<ul>
<li><code>grid.sum()</code> collapses everything: 1 + 2 + … + 12 = <b>78</b>.</li>
<li><code>grid.sum(axis=0)</code> goes down the columns: 1+5+9 = 15, 2+6+10 = 18, 3+7+11 = 21, 4+8+12 = 24. You get <b>[15 18 21 24]</b>, four answers, one per column.</li>
<li><code>grid.sum(axis=1)</code> goes along the rows: 1+2+3+4 = 10, then 26, then 42. You get <b>[10 26 42]</b>, three answers, one per row.</li>
</ul>
<p>The same <code>axis</code> argument works for <code>.mean()</code>, <code>.min()</code>, <code>.max()</code>, <code>.std()</code> and <code>np.argmax</code>.</p>`,
      code: `import numpy as np

grid = np.arange(1, 13).reshape(3, 4)
print(grid)

print(grid.sum())
print(grid.sum(axis=0))
print(grid.sum(axis=1))`
    },
    {
      type: 'explain',
      title: 'A real grid: revenue by year and month',
      body: `<p>Grids appear naturally in business: years down the side, months across the top. You built a table like this in lesson 4.4 with <code>groupby</code> and <code>unstack</code>. Add <code>.to_numpy()</code> at the end and you have a NumPy grid, ready for fast maths.</p>
<p>Our grid has <b>4 rows</b> (2023, 2024, 2025, 2026) and <b>12 columns</b> (January to December), and each cell is the revenue of that month. But remember the data stops on 30 June 2026. What goes in the cells for July to December 2026? Nothing happened yet, so there is no number. <code>groupby</code> leaves those cells <b>missing</b>, and NumPy shows a missing number as <code>nan</code>.</p>
<p>That gives us a grid with six genuine gaps, which is exactly what we need to learn about <code>nan</code>.</p>`
    },
    {
      type: 'try',
      title: 'Building the revenue grid',
      body: `<p>The code joins each order line to its order date, calculates the revenue, takes the year and month, and groups. The result has the shape <b>(4, 12)</b>, with years 2023 to 2026 down the side.</p>
<p>The printed grid is in millions, rounded to one decimal. Read the first row: January 2023 earned 37.6 million, February 35.8 million, March 43.6 million, and so on. Now look at the last row. The first six months of 2026 have numbers, and then six <b>nan</b> values, July to December. Those are the six gaps.</p>`,
      code: `import numpy as np
import pandas as pd

order_items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv")

lines = order_items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")
lines["line_total"] = lines["quantity"] * lines["unit_price"]
lines["order_date"] = pd.to_datetime(lines["order_date"], format="%Y-%m-%d")
lines["year"] = lines["order_date"].dt.year
lines["month"] = lines["order_date"].dt.month

table = lines.groupby(["year", "month"])["line_total"].sum().unstack()
grid = table.to_numpy()

print(grid.shape)
print(table.index.tolist())
print(np.round(grid / 1e6, 1))`
    },
    {
      type: 'explain',
      title: 'NaN: the number that infects everything',
      body: `<p><b>NaN</b> stands for “not a number”. It is how decimal arrays record a missing value. It has three behaviours you must know:</p>
<ol>
<li><b>It spreads.</b> Any arithmetic that touches a NaN gives NaN. The sum of a thousand good numbers and one NaN is NaN. One bad cell infects the whole answer.</li>
<li><b>It is not equal to anything, not even itself.</b> <code>np.nan == np.nan</code> is <b>False</b>. So you cannot find NaNs with <code>== np.nan</code>. Use <code>np.isnan(array)</code>, which gives a True/False mask.</li>
<li><b>NumPy does not skip it, but Pandas does.</b> In Pandas, <code>.sum()</code> and <code>.mean()</code> quietly skip missing values. NumPy’s <code>.sum()</code> and <code>.mean()</code> do not. They return NaN.</li>
</ol>
<p>The fix is a family of functions that <b>ignore</b> NaN: <code>np.nansum</code>, <code>np.nanmean</code>, <code>np.nanmedian</code>, <code>np.nanmin</code>, <code>np.nanmax</code>, <code>np.nanstd</code> and <code>np.nanargmax</code>. Each does the same job as its normal cousin, and treats NaN cells as if they were not there.</p>
<p>To <b>count</b> missing values, use the mask: <code>np.isnan(grid).sum()</code>. To <b>remove</b> them, use the mask with a flip: <code>values[~np.isnan(values)]</code>.</p>
<div class="callout watch"><b>Silent skipping is a choice.</b> The nan functions make the gaps invisible. Before you use them, ask whether the gaps are harmless (a future month that has not happened) or meaningful (a delivery that failed). We will meet both.</div>`
    },
    {
      type: 'try',
      title: 'One infection, one cure',
      body: `<p>The plain <code>grid.sum()</code> returns <b>nan</b>. Six empty cells in a grid of 48 were enough to ruin the total.</p>
<p><code>np.nansum(grid)</code> skips the gaps and returns <b>1581981450.5</b>, the revenue you know from lesson 3.3. The six missing months contribute nothing, so the grand total is right.</p>
<p><code>np.isnan(grid).sum()</code> counts the gaps: <b>6</b>. Adding <code>axis=1</code> counts them per row: <b>[0 0 0 6]</b>. The first three years are complete, and 2026 has six empty months. The last line shows the oddest fact: <code>np.nan == np.nan</code> is <b>False</b>.</p>`,
      code: `import numpy as np
import pandas as pd

order_items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv")

lines = order_items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")
lines["line_total"] = lines["quantity"] * lines["unit_price"]
lines["order_date"] = pd.to_datetime(lines["order_date"], format="%Y-%m-%d")
lines["year"] = lines["order_date"].dt.year
lines["month"] = lines["order_date"].dt.month
grid = lines.groupby(["year", "month"])["line_total"].sum().unstack().to_numpy()

print(grid.sum())
print(round(np.nansum(grid), 2))
print(np.isnan(grid).sum())
print(np.isnan(grid).sum(axis=1))
print(np.nan == np.nan)`
    },
    {
      id: 'py-5-3-ex1',
      type: 'exercise',
      title: 'Your turn: which year has the gaps?',
      body: `<p>The revenue grid is built for you in the box. Print the <b>number of missing cells in the last row</b> (the year 2026). You should see <code>6</code>.</p>
<p><b>Think before you type:</b> <code>grid[3]</code> is the fourth row. Build the mask with <code>np.isnan(grid[3])</code> and count its Trues with <code>.sum()</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\norder_items = pd.read_csv("order_items.csv")\norders = pd.read_csv("orders.csv")\n\nlines = order_items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")\nlines["line_total"] = lines["quantity"] * lines["unit_price"]\nlines["order_date"] = pd.to_datetime(lines["order_date"], format="%Y-%m-%d")\nlines["year"] = lines["order_date"].dt.year\nlines["month"] = lines["order_date"].dt.month\ngrid = lines.groupby(["year", "month"])["line_total"].sum().unstack().to_numpy()\n\n# Write your code below\n`,
      hints: [
        `np.isnan(grid[3]) is True for every missing cell in the fourth row. Add .sum() and print it.`,
        `import numpy as np\nimport pandas as pd\norder_items = pd.read_csv("order_items.csv")\norders = pd.read_csv("orders.csv")\nlines = order_items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")\nlines["line_total"] = lines["quantity"] * lines["unit_price"]\nlines["order_date"] = pd.to_datetime(lines["order_date"], format="%Y-%m-%d")\nlines["year"] = lines["order_date"].dt.year\nlines["month"] = lines["order_date"].dt.month\ngrid = lines.groupby(["year", "month"])["line_total"].sum().unstack().to_numpy()\nprint(np.isnan(grid[3]).sum())`
      ],
      solution: `import numpy as np\nimport pandas as pd\norder_items = pd.read_csv("order_items.csv")\norders = pd.read_csv("orders.csv")\nlines = order_items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")\nlines["line_total"] = lines["quantity"] * lines["unit_price"]\nlines["order_date"] = pd.to_datetime(lines["order_date"], format="%Y-%m-%d")\nlines["year"] = lines["order_date"].dt.year\nlines["month"] = lines["order_date"].dt.month\ngrid = lines.groupby(["year", "month"])["line_total"].sum().unstack().to_numpy()\nprint(np.isnan(grid[3]).sum())`,
      ordered: true
    },
    {
      id: 'py-5-3-c1',
      type: 'check',
      title: 'An array has 999 normal numbers and one NaN. What does arr.sum() return?',
      body: `<p>Remember how NaN behaves in arithmetic.</p>`,
      options: [
        'The sum of the 999 normal numbers',
        'nan',
        '0',
        'An error message'
      ],
      answer: 1,
      why: [
        'That is what np.nansum would return. The plain .sum() does not skip NaN.',
        'Yes! NaN spreads through arithmetic, so one NaN makes the whole sum NaN. Use np.nansum to skip it, or filter it out with a mask.',
        'It is not 0. NaN does not turn into zero. It stays NaN.',
        'NumPy does not raise an error. It quietly returns nan, which is why you must watch for it.'
      ]
    },
    {
      type: 'explain',
      title: 'Totals and averages by year and month',
      body: `<p>Now we can use <code>axis</code> and the <code>nan</code> functions together on the revenue grid:</p>
<ul>
<li><code>np.nansum(grid, axis=1)</code>: one total <b>per year</b> (collapse the months).</li>
<li><code>np.nansum(grid, axis=0)</code>: one total <b>per month</b> (collapse the years).</li>
<li><code>np.nanmean(grid, axis=0)</code>: one <b>average per month</b>.</li>
<li><code>np.nanargmax(grid, axis=0)</code>: the position of the best year for each month. Add 1 to a month position to get the month number.</li>
</ul>
<p>One of these will mislead you if you are not careful. Can you guess which? Think about the six empty cells before you read on. We will print both the totals per month and the averages per month, and compare.</p>`
    },
    {
      type: 'try',
      title: 'Monthly totals against monthly averages',
      body: `<p>The first line is the revenue per year in millions: <b>449.4, 447.3, 458.9 and 226.4</b>. The last is half a year, as you know.</p>
<p>The second line, the total per month across all years, looks like a story: January to June between about <b>137 and 165</b> million, July to December between about <b>104 and 120</b> million. It seems to say that the second half of the year is much weaker. <b>That is not true.</b> The first six months add up four years (2023 to 2026). The last six months add up only three years, because 2026 has not happened yet. We are comparing four numbers added together with three numbers added together.</p>
<p>The third line fixes it: the <b>average</b> per month, which divides by the number of years each month actually has. Now July to December are around <b>35 to 40</b> million, in line with the rest. The apparent weakness vanishes. It was the same trap as in lesson 4.6, a half-empty year, and this time you have caught it in the arithmetic.</p>`,
      code: `import numpy as np
import pandas as pd

order_items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv")

lines = order_items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")
lines["line_total"] = lines["quantity"] * lines["unit_price"]
lines["order_date"] = pd.to_datetime(lines["order_date"], format="%Y-%m-%d")
lines["year"] = lines["order_date"].dt.year
lines["month"] = lines["order_date"].dt.month
grid = lines.groupby(["year", "month"])["line_total"].sum().unstack().to_numpy()

print(np.round(np.nansum(grid, axis=1) / 1e6, 1))
print(np.round(np.nansum(grid, axis=0) / 1e6, 1))
print(np.round(np.nanmean(grid, axis=0) / 1e6, 1))`
    },
    {
      id: 'py-5-3-c2',
      type: 'check',
      title: 'The monthly totals for July to December are much lower than for January to June. Why should you not conclude that the second half of the year is weak?',
      body: `<p>Count how many years each column adds up.</p>`,
      options: [
        'Because NumPy cannot add up more than six months',
        'Because July to December add up only three years (2026 is missing), while January to June add up four, so the totals are not comparable. The monthly averages are',
        'Because the second half of the year has fewer days',
        'Because the missing cells were counted as negative numbers'
      ],
      answer: 1,
      why: [
        'NumPy adds up any number of cells. The problem is what the totals contain.',
        'Exactly. A total depends on how many years went into it. When the counts differ, compare averages or like-for-like periods, not totals.',
        'Both halves of the year have about the same number of days. The gap is far too big for that.',
        'nansum ignores the missing cells. They contribute nothing, not a negative number.'
      ]
    },
    {
      id: 'py-5-3-ex2',
      type: 'exercise',
      title: 'Your turn: which month is the best on average?',
      body: `<p>The revenue grid is built for you. Work out the <b>average revenue per month</b> (collapse the years, skipping the missing cells), find the month with the <b>highest</b> average, and print its <b>month number</b> (January is 1). You should see <code>3</code>, which is March.</p>
<p><b>Think before you type:</b> <code>np.nanmean(grid, axis=0)</code> gives 12 averages. <code>np.nanargmax(...)</code> gives the position of the biggest, counting from 0. Add 1 to turn the position into a month number.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\norder_items = pd.read_csv("order_items.csv")\norders = pd.read_csv("orders.csv")\n\nlines = order_items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")\nlines["line_total"] = lines["quantity"] * lines["unit_price"]\nlines["order_date"] = pd.to_datetime(lines["order_date"], format="%Y-%m-%d")\nlines["year"] = lines["order_date"].dt.year\nlines["month"] = lines["order_date"].dt.month\ngrid = lines.groupby(["year", "month"])["line_total"].sum().unstack().to_numpy()\n\n# Write your code below\n`,
      hints: [
        `averages = np.nanmean(grid, axis=0). Then print(np.nanargmax(averages) + 1).`,
        `import numpy as np\nimport pandas as pd\norder_items = pd.read_csv("order_items.csv")\norders = pd.read_csv("orders.csv")\nlines = order_items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")\nlines["line_total"] = lines["quantity"] * lines["unit_price"]\nlines["order_date"] = pd.to_datetime(lines["order_date"], format="%Y-%m-%d")\nlines["year"] = lines["order_date"].dt.year\nlines["month"] = lines["order_date"].dt.month\ngrid = lines.groupby(["year", "month"])["line_total"].sum().unstack().to_numpy()\naverages = np.nanmean(grid, axis=0)\nprint(np.nanargmax(averages) + 1)`
      ],
      solution: `import numpy as np\nimport pandas as pd\norder_items = pd.read_csv("order_items.csv")\norders = pd.read_csv("orders.csv")\nlines = order_items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")\nlines["line_total"] = lines["quantity"] * lines["unit_price"]\nlines["order_date"] = pd.to_datetime(lines["order_date"], format="%Y-%m-%d")\nlines["year"] = lines["order_date"].dt.year\nlines["month"] = lines["order_date"].dt.month\ngrid = lines.groupby(["year", "month"])["line_total"].sum().unstack().to_numpy()\naverages = np.nanmean(grid, axis=0)\nprint(np.nanargmax(averages) + 1)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Shares of a total: keepdims and broadcasting',
      body: `<p>A common question is: <i>“Which share of each year’s revenue came in each month?”</i> To answer it, divide every cell by its <b>own row’s total</b>. That is a grid of shape (4, 12) divided by a column of four totals, shape (4,).</p>
<p>Here NumPy’s <b>broadcasting</b> rule applies. Two shapes can be combined when, going from the right, each pair of sizes is equal or one of them is 1. A grid of (4, 12) and a column of (4, 1) fit together: the column is stretched across the 12 months. But a flat array of (4,) does not line up, because NumPy would try to match 4 with the 12 months.</p>
<p>The fix is <code>keepdims=True</code>: <code>np.nansum(grid, axis=1, keepdims=True)</code> keeps the collapsed direction as a size-1 dimension, giving shape (4, 1), which is ready to divide.</p>
<p>So <code>grid / np.nansum(grid, axis=1, keepdims=True)</code> gives every month’s <b>share of its year</b>. Each row of shares adds up to 1. You do not need a loop, and you do not need to build anything by hand.</p>`
    },
    {
      type: 'try',
      title: 'How the year divides into months',
      body: `<p>The first line shows 2023’s months as a percentage of the year: <b>8.4, 8.0, 9.7, 7.5, 8.1, 8.7, 7.5, 7.9, 8.3, 9.1, 8.2, 8.7</b>. Twelve equal months would each be 8.33 percent, so the months are close to equal, with March (9.7) the biggest.</p>
<p>The second line is the check: every row of shares adds up to <b>1.0</b>. Even the 2026 row does, because its six known months are divided by their own total, so they share the whole.</p>
<p>The last two lines average the shares of the three complete years (2023 to 2025). March is the biggest month, with <b>9.09</b> percent. February is the smallest, with <b>7.68</b> percent, and February is also the shortest month. The seasonal swing is mild: the best month is only about 18 percent bigger than the weakest.</p>`,
      code: `import numpy as np
import pandas as pd

order_items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv")

lines = order_items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")
lines["line_total"] = lines["quantity"] * lines["unit_price"]
lines["order_date"] = pd.to_datetime(lines["order_date"], format="%Y-%m-%d")
lines["year"] = lines["order_date"].dt.year
lines["month"] = lines["order_date"].dt.month
grid = lines.groupby(["year", "month"])["line_total"].sum().unstack().to_numpy()

share = grid / np.nansum(grid, axis=1, keepdims=True)

print(np.round(share[0] * 100, 1))
print(np.round(np.nansum(share, axis=1), 3))

typical = share[:3].mean(axis=0) * 100
print(np.round(typical, 2))
print(typical.argmax() + 1, typical.argmin() + 1)`
    },
    {
      id: 'py-5-3-ex3',
      type: 'exercise',
      title: 'Your turn: like with like, again',
      body: `<p>The revenue grid is built for you. Using only the <b>first six columns</b> (January to June) of each year, work out the <b>percentage change in revenue from the first half of 2025 to the first half of 2026</b>, rounded to 2 decimals. You should see <code>-3.79</code>, the same answer you found with Pandas in lesson 4.6.</p>
<p><b>Think before you type:</b> <code>grid[:, :6]</code> keeps all the rows and the first six columns. Collapse the months with <code>np.nansum(..., axis=1)</code>, which gives one total per year. Years sit at positions 2 (2025) and 3 (2026). Then <code>(new / old - 1) * 100</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\norder_items = pd.read_csv("order_items.csv")\norders = pd.read_csv("orders.csv")\n\nlines = order_items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")\nlines["line_total"] = lines["quantity"] * lines["unit_price"]\nlines["order_date"] = pd.to_datetime(lines["order_date"], format="%Y-%m-%d")\nlines["year"] = lines["order_date"].dt.year\nlines["month"] = lines["order_date"].dt.month\ngrid = lines.groupby(["year", "month"])["line_total"].sum().unstack().to_numpy()\n\n# Write your code below\n`,
      hints: [
        `h1 = np.nansum(grid[:, :6], axis=1). Then (h1[3] / h1[2] - 1) * 100, inside round(..., 2).`,
        `import numpy as np\nimport pandas as pd\norder_items = pd.read_csv("order_items.csv")\norders = pd.read_csv("orders.csv")\nlines = order_items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")\nlines["line_total"] = lines["quantity"] * lines["unit_price"]\nlines["order_date"] = pd.to_datetime(lines["order_date"], format="%Y-%m-%d")\nlines["year"] = lines["order_date"].dt.year\nlines["month"] = lines["order_date"].dt.month\ngrid = lines.groupby(["year", "month"])["line_total"].sum().unstack().to_numpy()\nh1 = np.nansum(grid[:, :6], axis=1)\nprint(round((h1[3] / h1[2] - 1) * 100, 2))`
      ],
      solution: `import numpy as np\nimport pandas as pd\norder_items = pd.read_csv("order_items.csv")\norders = pd.read_csv("orders.csv")\nlines = order_items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")\nlines["line_total"] = lines["quantity"] * lines["unit_price"]\nlines["order_date"] = pd.to_datetime(lines["order_date"], format="%Y-%m-%d")\nlines["year"] = lines["order_date"].dt.year\nlines["month"] = lines["order_date"].dt.month\ngrid = lines.groupby(["year", "month"])["line_total"].sum().unstack().to_numpy()\nh1 = np.nansum(grid[:, :6], axis=1)\nprint(round((h1[3] / h1[2] - 1) * 100, 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Spread: how far from the average is typical?',
      body: `<p>An average alone tells you very little. Two sets of payments can share an average of 150,000 and be completely different: one with every payment close to 150,000, the other with payments from 1,000 to a million. What separates them is the <b>spread</b>.</p>
<p>The standard measure of spread is the <b>standard deviation</b>, written <b>std</b>. It answers: <i>“How far does a typical value sit from the average?”</i> To calculate it: take each value’s distance from the mean, square the distances so they are all positive, average the squares (that is the <b>variance</b>), and take the square root to get back to the original units.</p>
<p>A big std means a wide spread. A std near zero means everything is close to the average.</p>
<div class="callout watch"><b>The version problem.</b> There are two versions of the formula, and the two tools disagree about the default:</div>
<ul>
<li><b>NumPy</b>, <code>arr.std()</code>: divides by <b>n</b>, the number of items. This treats your data as the <i>whole population</i>. It corresponds to <code>ddof=0</code>.</li>
<li><b>Pandas</b>, <code>series.std()</code>: divides by <b>n minus 1</b>. This treats your data as a <i>sample</i> of something bigger, and corrects for the fact that a sample understates spread. It corresponds to <code>ddof=1</code>.</li>
</ul>
<p>“ddof” means “delta degrees of freedom”, the number you subtract from n. You can change it in NumPy with <code>arr.std(ddof=1)</code>. With thousands of items the two versions are almost identical. With ten items, they are visibly different. You must know which one a tool uses before you compare numbers from two tools.</p>`
    },
    {
      type: 'try',
      title: 'The same data, two answers',
      body: `<p>A famous small example: the eight numbers <b>2, 4, 4, 4, 5, 5, 7, 9</b>. Their mean is <b>5.0</b>. Their distances from 5 are −3, −1, −1, −1, 0, 0, 2, 4. The squares average to 4.0, so the NumPy standard deviation is <b>2.0</b> (the population version). But with <code>ddof=1</code>, we divide by 7 instead of 8, and the answer becomes <b>2.1381</b>. A difference of seven percent.</p>
<p>Now the payments. NumPy’s default gives <b>115841.05</b>. With <code>ddof=1</code> it gives <b>115846.84</b>, and Pandas gives the same <b>115846.84</b> without being asked. With 10,000 items, the two versions differ by about five thousandths of a percent. The version problem matters for small data, not for big data.</p>`,
      code: `import numpy as np
import pandas as pd

small = np.array([2, 4, 4, 4, 5, 5, 7, 9], dtype=float)
print(small.mean())
print(small.std())
print(round(small.std(ddof=1), 4))

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].to_numpy()
print(round(amounts.std(), 2))
print(round(amounts.std(ddof=1), 2))
print(round(payments["amount"].std(), 2))`
    },
    {
      id: 'py-5-3-c3',
      type: 'check',
      title: 'You get 115841.05 from NumPy and 115846.84 from Pandas for the same payments. What is going on?',
      body: `<p>Think about the default for the divisor.</p>`,
      options: [
        'One of the tools has a bug',
        'NumPy divides by n (ddof=0) by default, and Pandas divides by n minus 1 (ddof=1). Setting ddof=1 in NumPy gives the Pandas answer',
        'The payments changed between the two calculations',
        'NumPy rounds more aggressively'
      ],
      answer: 1,
      why: [
        'Neither tool has a bug. They use different default formulas, and both are valid in the right setting.',
        'Exactly. Different defaults, same data. Know which version a tool uses, and set ddof explicitly when you compare results.',
        'The data is the same in both calculations. Only the formula differs.',
        'The difference is in the formula, not in rounding.'
      ]
    },
    {
      type: 'try',
      title: 'Delivery times, with real gaps',
      body: `<p>Missing values do not come only from empty future months. The deliveries that are In Transit or Failed have no arrival date, so their delivery time is missing. Here we calculate the days from dispatch to arrival, convert them to a decimal array, and the gaps become NaN.</p>
<p>The array has <b>9500</b> items and type <b>float64</b>. <b>1239</b> of them are NaN, which is <b>13.04</b> percent. The plain <code>days.mean()</code> gives <b>nan</b>, as you would expect. <code>np.nanmean(days)</code> gives <b>5.51</b>, the average delivery time you found back in lesson 3.2. The median is <b>6.0</b>, and the times range from <b>1</b> to <b>10</b> days.</p>
<p>Notice what is hidden. The nan functions say nothing about the 13 percent of deliveries that have no time at all. A report that shows only “average delivery 5.51 days” should also say <i>“for the 87 percent of deliveries that arrived”</i>.</p>`,
      code: `import numpy as np
import pandas as pd

deliveries = pd.read_csv("deliveries.csv")

days = (pd.to_datetime(deliveries["delivery_date"]) - pd.to_datetime(deliveries["dispatch_date"])).dt.days.to_numpy(dtype=float)

print(days.dtype, days.shape)
print(np.isnan(days).sum(), round(np.isnan(days).mean() * 100, 2))
print(days.mean())
print(round(np.nanmean(days), 2), np.nanmedian(days))
print(np.nanmin(days), np.nanmax(days))`
    },
    {
      id: 'py-5-3-ex4',
      type: 'exercise',
      title: 'Your turn: the typical delivery time',
      body: `<p>The delivery times, with their gaps, are built for you as the array <code>days</code>. Print the <b>average delivery time in days</b>, ignoring the missing values, rounded to 2 decimals. You should see <code>5.51</code>.</p>
<p><b>Think before you type:</b> a plain <code>days.mean()</code> would give nan. Use the function that skips NaN, and wrap it in <code>round(..., 2)</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\ndeliveries = pd.read_csv("deliveries.csv")\ndays = (pd.to_datetime(deliveries["delivery_date"]) - pd.to_datetime(deliveries["dispatch_date"])).dt.days.to_numpy(dtype=float)\n\n# Write your code below\n`,
      hints: [
        `np.nanmean(days) is the average that skips the missing values. Wrap it in round(..., 2) and print it.`,
        `import numpy as np\nimport pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\ndays = (pd.to_datetime(deliveries["delivery_date"]) - pd.to_datetime(deliveries["dispatch_date"])).dt.days.to_numpy(dtype=float)\nprint(round(np.nanmean(days), 2))`
      ],
      solution: `import numpy as np\nimport pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\ndays = (pd.to_datetime(deliveries["delivery_date"]) - pd.to_datetime(deliveries["dispatch_date"])).dt.days.to_numpy(dtype=float)\nprint(round(np.nanmean(days), 2))`,
      ordered: true
    },
    {
      id: 'py-5-3-ex5',
      type: 'exercise',
      title: 'Challenge: how much of the data is missing?',
      body: `<p>Using the same <code>days</code> array, print the <b>percentage of deliveries that have no delivery time</b>, rounded to 2 decimals. You should see <code>13.04</code>.</p>
<p><b>Think before you type:</b> <code>np.isnan(days)</code> gives a True/False mask. The <code>.mean()</code> of a mask is the share of Trues (lesson 4.1). Multiply by 100 and round.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\ndeliveries = pd.read_csv("deliveries.csv")\ndays = (pd.to_datetime(deliveries["delivery_date"]) - pd.to_datetime(deliveries["dispatch_date"])).dt.days.to_numpy(dtype=float)\n\n# Write your code below\n`,
      hints: [
        `np.isnan(days).mean() is the share of missing values, between 0 and 1. Multiply by 100 and round to 2 decimals.`,
        `import numpy as np\nimport pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\ndays = (pd.to_datetime(deliveries["delivery_date"]) - pd.to_datetime(deliveries["dispatch_date"])).dt.days.to_numpy(dtype=float)\nprint(round(np.isnan(days).mean() * 100, 2))`
      ],
      solution: `import numpy as np\nimport pandas as pd\ndeliveries = pd.read_csv("deliveries.csv")\ndays = (pd.to_datetime(deliveries["delivery_date"]) - pd.to_datetime(deliveries["dispatch_date"])).dt.days.to_numpy(dtype=float)\nprint(round(np.isnan(days).mean() * 100, 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You can summarise any grid and any array, and you know the traps. You can:</p>
<ul>
<li>Choose the <code>axis</code>: <code>axis=0</code> gives one answer per column, <code>axis=1</code> one per row, and the axis you name is the one that disappears</li>
<li>Build a year-by-month grid from a table with <code>groupby</code>, <code>unstack</code> and <code>.to_numpy()</code></li>
<li>Explain <b>NaN</b>: it spreads, it is not equal to itself, and NumPy does not skip it as Pandas does</li>
<li>Use <code>np.isnan</code> to find and count gaps, and the <code>np.nan...</code> functions to skip them</li>
<li>Spot a <b>biased total</b> (unequal numbers of years behind each column) and use averages instead</li>
<li>Calculate <b>shares of a total</b> with <code>keepdims=True</code> and broadcasting</li>
<li>Explain the <b>standard deviation</b>, and the <code>ddof</code> difference between NumPy and Pandas</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What does <code>axis=0</code> mean in NumPy?</li>
<li>Why does <code>np.mean</code> return nan, and how do you fix it?</li>
<li>Why do NumPy and Pandas give different standard deviations?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> <code>axis=0</code> means the operation collapses the rows and runs down each column, so a 2D array gives one result per column. <code>axis=1</code> runs along each row and gives one result per row. The axis you name is the dimension that disappears from the result.</p>
<p><b>2.</b> NaN is contagious: any calculation that touches it returns NaN, and NumPy’s <code>mean</code> does not skip missing values, unlike Pandas. I either use <code>np.nanmean</code>, or I filter the missing values out with a mask such as <code>arr[~np.isnan(arr)]</code>. Before skipping them I check why they are missing, because the gaps can matter.</p>
<p><b>3.</b> NumPy’s <code>std</code> divides by n by default (<code>ddof=0</code>, the population formula), while Pandas divides by n minus 1 (<code>ddof=1</code>, the sample formula). The difference is large for small datasets and negligible for large ones. I set <code>ddof</code> explicitly when I compare results across tools.</p>
</details>
<p><b>Coming next, in lesson 5.4:</b> the finished detector. You now know how to describe a typical payment: its average, its middle and its spread. You will learn percentiles and the interquartile range, the z-score, and a rule that learns its own thresholds from the data. You will compare three detectors on the same 10,000 payments, see which one flags which payment, and finish Module 5 with a detector you could really hand to the finance team.</p>`
    }
  ]
},
{
  id: 'py-5-4',
  track: 'python',
  lang: 'python',
  packages: ['pandas', 'numpy'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: '',
  title: '5.4 Percentiles, z-scores and the finished detector',
  tables: [],
  intro: `The finance team has reviewed your first detector, and the manager has one more question: <i>“Your rule says 500,000 is unusual. Why not 400,000? Why not 600,000? If you can show me why a number is unusual, <b>from the payments themselves</b>, I will trust it.”</i><br><br>That is the right question, and in this lesson you will answer it in two different ways. The first uses <b>percentiles</b>: it asks where a payment stands in the ranking of all payments. The second uses the <b>z-score</b>: it asks how many standard deviations from the average a payment sits. Both let the data set its own threshold, instead of a number somebody picked.<br><br>Then you will do what real analysts do. You will run three detectors on the same 10,000 payments, see exactly which payments each one flags, and decide which to hand over. By the end of the lesson you will have finished the detector, and Module 5.`,
  steps: [
    {
      type: 'explain',
      title: 'Percentiles: where does a value stand in the ranking?',
      body: `<p>The <b>median</b> is the value in the middle: half the payments are below it and half are above. A <b>percentile</b> generalises that idea. The 90th percentile is the value that 90 percent of payments fall below. The 99th percentile is the value that only 1 percent of payments exceed.</p>
<p>Three percentiles have names and appear everywhere:</p>
<table class="mini">
<tr><th>Name</th><th>Percentile</th><th>Meaning</th></tr>
<tr><td><b>Q1</b>, first quartile</td><td>25th</td><td>a quarter of values are below it</td></tr>
<tr><td><b>Q2</b>, the median</td><td>50th</td><td>half are below it</td></tr>
<tr><td><b>Q3</b>, third quartile</td><td>75th</td><td>three quarters are below it</td></tr>
</table>
<p>In NumPy: <code>np.percentile(array, [25, 50, 75])</code>. You give it the array and a list of percentiles, and you get back one value for each. (Note the numbers go from 0 to 100, not from 0 to 1.)</p>
<p>The reason percentiles are so useful for money data is that they are not pulled around by extreme values. A single payment of ten million would change the mean enormously, but it would barely move the median or the quartiles.</p>`
    },
    {
      type: 'try',
      title: 'The shape of 10,000 payments, in percentiles',
      body: `<p>The first line gives the quartiles: <b>Q1 is 73307.58</b>, <b>the median is 127828.29</b> (exactly what <code>np.median</code> gave you in lesson 5.1), and <b>Q3 is 216218.87</b>. A quarter of all payments are below 73,308, and a quarter are above 216,219.</p>
<p>The second line looks at the extremes: the 1st percentile is <b>12789.21</b>, the 5th is <b>27648.79</b>, the 95th is <b>390286.23</b> and the 99th is <b>529242.25</b>. So only 1 percent of payments are above about 529,000. The finance team’s fixed rule of 500,000 sits close to that: it flags 1.4 percent of payments.</p>
<p>The last line is the 90th percentile: <b>317507.28</b>. One payment in ten is above that.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].to_numpy()

print(np.round(np.percentile(amounts, [25, 50, 75]), 2))
print(np.round(np.percentile(amounts, [1, 5, 95, 99]), 2))
print(round(np.percentile(amounts, 90), 2))`
    },
    {
      id: 'py-5-4-ex1',
      type: 'exercise',
      title: 'Your turn: the three quartiles as a list',
      body: `<p>The payments are loaded as the array <code>amounts</code> in the box. Print the three quartiles (the 25th, 50th and 75th percentiles) as a Python list, each rounded to 2 decimals. You should see <code>[73307.58, 127828.29, 216218.87]</code>.</p>
<p><b>Think before you type:</b> <code>np.percentile(amounts, [25, 50, 75])</code> gives the three values. Round them with <code>np.round(..., 2)</code>, and finish with <code>.tolist()</code> to get a plain list.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\n\n# Write your code below\n`,
      hints: [
        `np.round(np.percentile(amounts, [25, 50, 75]), 2) gives the rounded quartiles. Add .tolist() and print it.`,
        `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nprint(np.round(np.percentile(amounts, [25, 50, 75]), 2).tolist())`
      ],
      solution: `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nprint(np.round(np.percentile(amounts, [25, 50, 75]), 2).tolist())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The IQR rule: fences that the data builds',
      body: `<p>The distance from Q1 to Q3 is called the <b>interquartile range</b>, or <b>IQR</b>. It is the width of the middle half of the data, and it tells you how spread out the “normal” payments are.</p>
<p>A classic rule from the statistician John Tukey turns it into a detector. A value is unusual if it lies more than <b>1.5 IQRs beyond</b> the quartiles:</p>
<ul>
<li><b>Upper fence</b> = Q3 + 1.5 × IQR. Anything above it is unusually <b>high</b>.</li>
<li><b>Lower fence</b> = Q1 − 1.5 × IQR. Anything below it is unusually <b>low</b>.</li>
</ul>
<p>The 1.5 is a convention, and you can change it. A bigger number gives wider fences and flags fewer values. A smaller number flags more.</p>
<p>Because the fences come from the quartiles, they adapt. If payments grow next year, the quartiles grow, and the fences move with them. Nobody has to choose a threshold. And because quartiles are not dragged around by the extremes, the rule stays steady even when there are some wild values in the data.</p>`
    },
    {
      type: 'try',
      title: 'Fences for the payments',
      body: `<p>The IQR is <b>142911.28</b>: the middle half of payments is spread over about 143 thousand. The upper fence is Q3 plus 1.5 IQRs: <b>430585.79</b>. The lower fence is Q1 minus 1.5 IQRs: <b>-141059.34</b>.</p>
<p>That lower fence is a <b>negative number</b>, and no payment can be negative. The rule is telling you that on this data there is no such thing as an unusually low payment: even the smallest payment, 1295.04, sits well inside the fence. So the count below the lower fence is <b>0</b>. The count above the upper fence is <b>328</b>.</p>
<p>So the data-driven rule flags more payments than the fixed 500,000 rule did (140). We will look closely at the difference.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].to_numpy()

q1, q3 = np.percentile(amounts, [25, 75])
iqr = q3 - q1
upper = q3 + 1.5 * iqr
lower = q1 - 1.5 * iqr

print(round(iqr, 2))
print(round(upper, 2), round(lower, 2))
print((amounts > upper).sum(), (amounts < lower).sum())`
    },
    {
      id: 'py-5-4-ex2',
      type: 'exercise',
      title: 'Your turn: the interquartile range',
      body: `<p>Print the <b>IQR</b> of the payment amounts, which is Q3 minus Q1, rounded to 2 decimals. You should see <code>142911.28</code>.</p>
<p><b>Think before you type:</b> <code>q1, q3 = np.percentile(amounts, [25, 75])</code> gives both quartiles at once. Subtract, then round.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\n\n# Write your code below\n`,
      hints: [
        `q1, q3 = np.percentile(amounts, [25, 75]). Then print(round(q3 - q1, 2)).`,
        `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nq1, q3 = np.percentile(amounts, [25, 75])\nprint(round(q3 - q1, 2))`
      ],
      solution: `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nq1, q3 = np.percentile(amounts, [25, 75])\nprint(round(q3 - q1, 2))`,
      ordered: true
    },
    {
      id: 'py-5-4-ex3',
      type: 'exercise',
      title: 'Your turn: how many payments are above the upper fence?',
      body: `<p>Calculate the upper fence, Q3 plus 1.5 times the IQR, and print how many payments are <b>above</b> it. You should see <code>328</code>.</p>
<p><b>Think before you type:</b> from the quartiles, <code>upper = q3 + 1.5 * (q3 - q1)</code>. Then the mask <code>amounts &gt; upper</code> and its <code>.sum()</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\n\n# Write your code below\n`,
      hints: [
        `q1, q3 = np.percentile(amounts, [25, 75]). upper = q3 + 1.5 * (q3 - q1). Then print((amounts > upper).sum()).`,
        `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nq1, q3 = np.percentile(amounts, [25, 75])\nupper = q3 + 1.5 * (q3 - q1)\nprint((amounts > upper).sum())`
      ],
      solution: `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nq1, q3 = np.percentile(amounts, [25, 75])\nupper = q3 + 1.5 * (q3 - q1)\nprint((amounts > upper).sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Z-scores: how many standard deviations away?',
      body: `<p>The second way to measure “unusual” uses the average and the standard deviation from lesson 5.3. The <b>z-score</b> of a value is:</p>
<p><code>z = (value - mean) / std</code></p>
<p>It answers: <i>“How many standard deviations is this value from the average?”</i> A z-score of 0 means exactly average. A z-score of +2 means two standard deviations above. A z-score of −1 means one below.</p>
<p>In NumPy it is one vectorised line: <code>(amounts - amounts.mean()) / amounts.std()</code> gives a z-score for every payment at once. The common convention is to call a value unusual when its z-score is beyond <b>3 in either direction</b>.</p>
<p>A warning about a famous rule of thumb. For a perfectly bell-shaped set of data, about 68 percent of values lie within 1 std of the mean, 95 percent within 2, and 99.7 percent within 3. <b>Money data is rarely bell-shaped</b>. It is lopsided, with a long tail of big values, as you saw in lesson 5.1. The numbers will differ, and you should check them rather than assume.</p>`
    },
    {
      type: 'try',
      title: 'Z-scores for every payment',
      body: `<p>The biggest z-score is <b>7.89</b>: the largest payment is almost eight standard deviations above the average. The smallest is <b>-1.35</b>, only a little below it. Nothing is far below, because the payments cannot go below zero and the average is 158,198.</p>
<p>The number of payments with a z-score beyond 3, in either direction, is <b>128</b>. And the average plus three standard deviations is <b>505721.28</b>. Notice that: the finance team’s rule of 500,000 is almost exactly “3 standard deviations above average”. Their rule of thumb was sound, and now you know why.</p>
<p>Finally, the loop checks the bell-curve rule of thumb. Within 1 std: <b>74.05</b> percent (a bell curve would give 68). Within 2: <b>94.99</b> (a bell curve gives 95). Within 3: <b>98.72</b> (a bell curve gives 99.7). The payments are not bell-shaped, and the 3-std rule keeps more of the tail in the “normal” group than a bell curve would.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].to_numpy()

mean = amounts.mean()
std = amounts.std()
z = (amounts - mean) / std

print(round(z.max(), 2), round(z.min(), 2))
print((np.abs(z) > 3).sum())
print(round(mean + 3 * std, 2))

for k in [1, 2, 3]:
    print(k, round((np.abs(z) <= k).mean() * 100, 2))`
    },
    {
      id: 'py-5-4-c1',
      type: 'check',
      title: 'The largest payment has a z-score of 7.89. What does that mean?',
      body: `<p>Remember the definition of the z-score.</p>`,
      options: [
        'The payment is 7.89 times the average',
        'The payment is about 7.89 standard deviations above the average, which is extremely far out compared with the spread of the other payments',
        'The payment is the 7.89th largest',
        'The payment is 7.89 percent of the total'
      ],
      answer: 1,
      why: [
        'That would be a ratio to the mean. A z-score measures the distance from the mean in units of the standard deviation, not in multiples of the mean.',
        'Yes! The z-score counts standard deviations from the mean. A value almost eight of them away is extremely unusual.',
        'A z-score is not a rank. The ranking would come from sorting.',
        'A z-score is not a share. It is a distance measured in standard deviations.'
      ]
    },
    {
      id: 'py-5-4-ex4',
      type: 'exercise',
      title: 'Your turn: the z-score detector',
      body: `<p>Calculate the z-score of every payment (using NumPy’s default <code>std</code>) and print how many payments have a z-score <b>above 3 or below -3</b>. You should see <code>128</code>.</p>
<p><b>Think before you type:</b> <code>z = (amounts - amounts.mean()) / amounts.std()</code>. Then <code>np.abs(z) &gt; 3</code> flags both ends in one mask. Count the Trues with <code>.sum()</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\n\n# Write your code below\n`,
      hints: [
        `z = (amounts - amounts.mean()) / amounts.std(). Then print((np.abs(z) > 3).sum()).`,
        `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nz = (amounts - amounts.mean()) / amounts.std()\nprint((np.abs(z) > 3).sum())`
      ],
      solution: `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nz = (amounts - amounts.mean()) / amounts.std()\nprint((np.abs(z) > 3).sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Three detectors, one dataset: comparing rules',
      body: `<p>You now have three rules for “unusual”:</p>
<ul>
<li><b>Fixed</b>: a payment above 500,000 (the finance team’s rule).</li>
<li><b>Z-score</b>: a z-score above 3.</li>
<li><b>IQR</b>: a payment above Q3 plus 1.5 IQRs.</li>
</ul>
<p>Which is best? There is no answer key. Nobody has labelled the payments as “truly unusual”, so you cannot measure accuracy. What you <i>can</i> do is compare the rules with each other, by counting the <b>overlaps</b>, using masks and the <code>&amp;</code> and <code>~</code> operators.</p>
<p>The useful questions are: how many does each rule flag? Does one rule flag everything another one does, plus more? And which payments are flagged by one rule only? The last question is the most important, because those are the payments where the rules disagree, and a human should look at them.</p>
<p>The choice then depends on cost. If the finance team can review about 150 payments a week, a rule that flags 330 is too much work. If missing a suspicious payment is very costly, a rule that flags more may be worth it. The analyst’s job is to put the options and the trade-off in front of the people who decide.</p>`
    },
    {
      type: 'try',
      title: 'Who flags what?',
      body: `<p>The first line counts the flags: the fixed rule flags <b>140</b>, the z-score rule <b>128</b>, and the IQR rule <b>328</b>.</p>
<p>The second line shows how they overlap. All <b>128</b> of the z-score payments are also fixed-rule payments. And all <b>140</b> of the fixed-rule payments are also IQR payments. So the rules are <b>nested</b>, like Russian dolls: the z-score flags are inside the fixed flags, which are inside the IQR flags.</p>
<p>The third line counts the payments the IQR rule flags but the fixed rule does not: <b>188</b>. The last line shows what they look like: payments from <b>430946.97</b> to <b>499172.74</b>. They are high, but below 500,000, so the fixed rule missed them. They are exactly the payments the finance team might want to know about.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].to_numpy()

z = (amounts - amounts.mean()) / amounts.std()
q1, q3 = np.percentile(amounts, [25, 75])
upper = q3 + 1.5 * (q3 - q1)

fixed = amounts > 500000
by_z = z > 3
by_iqr = amounts > upper

print(fixed.sum(), by_z.sum(), by_iqr.sum())
print((fixed & by_z).sum(), (fixed & by_iqr).sum())
print((by_iqr & ~fixed).sum())

extra = amounts[by_iqr & ~fixed]
print(round(extra.min(), 2), round(extra.max(), 2))`
    },
    {
      id: 'py-5-4-c2',
      type: 'check',
      title: 'Every payment flagged by the fixed rule is also flagged by the IQR rule, but the IQR rule flags 188 more. What does that tell you?',
      body: `<p>Think about the word “nested”.</p>`,
      options: [
        'The IQR rule is broken, because it disagrees with the fixed rule',
        'The IQR rule is more sensitive: it flags everything the fixed rule does, plus 188 high payments that sit between about 431 thousand and 499 thousand. Whether that is useful depends on how much review the finance team can handle',
        'The fixed rule is always right',
        'The 188 extra payments are errors'
      ],
      answer: 1,
      why: [
        'Neither rule is broken. They use different thresholds, and one of them is lower.',
        'Exactly. More sensitive means more flags, including more false alarms. The right choice depends on the cost of reviewing a payment against the cost of missing a suspicious one.',
        'The fixed rule is a good rule of thumb (it is nearly 3 standard deviations), but it is also arbitrary, and it misses payments just under the line.',
        'They are not errors. They are payments that are unusually high compared with the rest, which is a reason to look at them.'
      ]
    },
    {
      id: 'py-5-4-ex5',
      type: 'exercise',
      title: 'Challenge: where do the fixed and z-score rules disagree?',
      body: `<p>Calculate the z-scores and the fixed flag. Print how many payments are flagged by the <b>fixed</b> rule (above 500000) but <b>not</b> by the <b>z-score</b> rule (z above 3). You should see <code>12</code>.</p>
<p><b>Think before you type:</b> two masks: <code>fixed = amounts &gt; 500000</code> and <code>by_z = z &gt; 3</code>. Then <code>fixed &amp; ~by_z</code> gives the payments the first flags and the second does not. Count its Trues.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\n\n# Write your code below\n`,
      hints: [
        `z = (amounts - amounts.mean()) / amounts.std(). fixed = amounts > 500000. by_z = z > 3. Then (fixed & ~by_z).sum().`,
        `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nz = (amounts - amounts.mean()) / amounts.std()\nfixed = amounts > 500000\nby_z = z > 3\nprint((fixed & ~by_z).sum())`
      ],
      solution: `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nz = (amounts - amounts.mean()) / amounts.std()\nfixed = amounts > 500000\nby_z = z > 3\nprint((fixed & ~by_z).sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Thresholds that learn: one rule for any year',
      body: `<p>The finance manager’s original worry was: <i>“What if payments grow next year?”</i> A fixed 500,000 line would drift out of date. A rule built from quartiles does not, because it recomputes its fences from whatever data you give it.</p>
<p>To see this, calculate the IQR fence separately for each year. Payments have a <code>payment_date</code>, so we can pick out each year’s payments with a mask, and apply the same rule to each group. If the rule is stable, the fences will be similar and the share of flagged payments will be about the same each year. If payments grew a lot, the fences would grow with them.</p>
<p>This is also the right moment to turn the rule into a <b>function</b>, the tool from Module 1 that lets you write a piece of logic once and use it anywhere. A function called <code>detect</code> will take any array of payments and return a label for each one. That is the finished detector.</p>`
    },
    {
      type: 'try',
      title: 'The fence, year by year',
      body: `<p>For each year the loop prints the year, the number of payments, the upper fence, and how many payments are above it.</p>
<ul>
<li><b>2023</b>: 2850 payments, fence 432204.36, <b>92</b> flagged (3.2 percent)</li>
<li><b>2024</b>: 2865 payments, fence 412975.32, <b>106</b> flagged (3.7 percent)</li>
<li><b>2025</b>: 2879 payments, fence 442307.76, <b>85</b> flagged (3.0 percent)</li>
<li><b>2026</b>: 1406 payments, fence 439997.88, <b>43</b> flagged (3.1 percent)</li>
</ul>
<p>The fences differ by up to about 7 percent from year to year, because each year has its own quartiles. The share flagged stays between 3 and 3.7 percent, whatever the year. And 2026, with only half a year of data, gets a sensible fence without any special treatment. The rule adapts, and a fixed 500,000 could not.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].to_numpy()
year = pd.to_datetime(payments["payment_date"]).dt.year.to_numpy()

for y in [2023, 2024, 2025, 2026]:
    part = amounts[year == y]
    p1, p3 = np.percentile(part, [25, 75])
    fence = p3 + 1.5 * (p3 - p1)
    print(y, len(part), round(fence, 2), (part > fence).sum())`
    },
    {
      id: 'py-5-4-c3',
      type: 'check',
      title: 'Why is a threshold calculated from quartiles better than a fixed 500,000 for a detector that runs every week for years?',
      body: `<p>Think about what happens when the business changes.</p>`,
      options: [
        'Because quartiles are always larger than 500,000',
        'Because the fences recalculate from the current data, so the rule adapts when payment sizes change, while a fixed number gradually becomes too tight or too loose',
        'Because a fixed number can never be changed',
        'Because quartiles never flag any payment'
      ],
      answer: 1,
      why: [
        'Q3 is about 216 thousand and the upper fence about 431 thousand, both below 500,000.',
        'Right! The rule keeps asking “unusual compared with the rest of the data”, so it keeps its meaning as the business grows. You still need to review its output from time to time, but you do not have to keep re-choosing a number.',
        'You can change a fixed number any time. The problem is that someone must remember to do so.',
        'The IQR rule flags about 3 percent of the payments.'
      ]
    },
    {
      type: 'explain',
      title: 'The finished detector',
      body: `<p>Here is the detector as a function. It is short on purpose:</p>
<ol>
<li>Calculate Q1 and Q3 from the values you give it.</li>
<li>Build the fences, using a setting <code>k</code> (default 1.5) for how wide they are.</li>
<li>Label each value “High”, “Low” or “Normal” with a nested <code>np.where</code>.</li>
</ol>
<p>The setting <code>k</code> is a <b>dial</b>. At 1.5 you have the classic rule. At 3, the fences are twice as far from the middle, and the rule flags only the <i>extreme</i> payments. The finance team can turn the dial to match their review capacity, with no change to the code.</p>
<p>Because the function takes any array, you can also run it on a single year, a single payment method, or the payments of a single week, and get fences that suit that group. That is the detector the manager asked for: automatic, repeatable, fast, and explained in terms of the data itself.</p>`
    },
    {
      type: 'try',
      title: 'Running the detector',
      body: `<p>On all 10,000 payments, with the classic <code>k = 1.5</code>: <b>High 328</b> and <b>Normal 9672</b>. There is no “Low” label in the output at all, because none of the payments fall below the (negative) lower fence.</p>
<p>On the payments of 2025 only, the same function builds fences from that year’s quartiles: <b>High 85</b> and <b>Normal 2794</b>, matching the 85 you saw in the year-by-year table.</p>
<p>With the dial turned up to <code>k = 3</code>, the rule flags only <b>25</b> payments, the really extreme ones, all above 644952.72. The same ten lines of code gave you a loose detector, a tight one, and one for each year, and that is what a good function does.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].to_numpy()
year = pd.to_datetime(payments["payment_date"]).dt.year.to_numpy()

def detect(values, k=1.5):
    q1, q3 = np.percentile(values, [25, 75])
    spread = q3 - q1
    upper = q3 + k * spread
    lower = q1 - k * spread
    return np.where(values > upper, "High", np.where(values < lower, "Low", "Normal"))

print(np.unique(detect(amounts), return_counts=True))
print(np.unique(detect(amounts[year == 2025]), return_counts=True))
print(np.unique(detect(amounts, k=3), return_counts=True))`
    },
    {
      type: 'explain',
      title: 'Module 5 is complete',
      body: `<div class="callout tip"><b>Look at what you have built.</b> At the start of the module, the Head of Data asked for an unusual payment detector. You learned what a NumPy array is and why it is fast (5.1), how to pick out and label values with slices, masks and <code>np.where</code> (5.2), how to summarise a grid along an axis, handle <code>nan</code> and measure spread (5.3), and how to let the data set its own thresholds with percentiles and z-scores (5.4). The result is a function you can run on any array of payments, that explains itself in terms of the data, and that you can tune with one number. Along the way you found a mean that sits above about 61 percent of the payments, a month-total trap caused by a half-empty year, and a NumPy-versus-Pandas disagreement that turned out to be a formula default.</div>
<p>In this lesson you learned to:</p>
<ul>
<li>Describe a distribution with <b>percentiles</b>, <b>quartiles</b> and the <b>IQR</b></li>
<li>Build <b>fences</b> from the quartiles, and explain why they adapt as data changes</li>
<li>Calculate <b>z-scores</b> in one vectorised line, and check the bell-curve rule of thumb instead of trusting it</li>
<li>Compare detectors by their <b>overlaps</b>, using masks and <code>&amp;</code> and <code>~</code></li>
<li>Package the rule as a <b>function</b> with a dial, and run it on any slice of the data</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>How would you detect outliers in a column of numbers?</li>
<li>What is the difference between the IQR method and the z-score method?</li>
<li>Why might you prefer the median to the mean for payment data?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I would look at the distribution first. Then I would use a rule such as the IQR fences, flagging values below Q1 minus 1.5 IQRs or above Q3 plus 1.5 IQRs, or z-scores beyond 3. I would count how many values each rule flags, look at examples, and decide with the business what to do with them, because an outlier is a reason to look, not automatically an error.</p>
<p><b>2.</b> The z-score method uses the mean and the standard deviation and is most natural for roughly bell-shaped data. The IQR method uses quartiles, which are less affected by extreme values and by skew, so it suits lopsided data such as payments. In practice I compare them on the same data and look at where they disagree.</p>
<p><b>3.</b> Payments are skewed: many ordinary amounts and a few very large ones. The large ones pull the mean upwards, so the mean describes a payment that few customers actually make. The median is the middle value and is not dragged around by the extremes, so it describes the typical payment better.</p>
</details>
<p><b>Coming next, in Module 6:</b> Exploratory Data Analysis. You now own the full toolkit: Python basics, Pandas, cleaning, transformation and NumPy. Module 6 puts it all to work in the way real analysts do. You will start with a raw dataset and a vague question, and use a systematic method to understand it: reconcile the totals, hunt for patterns, check each finding against a second view, and write up what you found and how sure you are. It is the module where the numbers start to tell a story.</p>`
    }
  ]
}
);
