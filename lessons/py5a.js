LESSONS.push(
{
  id: 'py-5-1',
  track: 'python',
  lang: 'python',
  packages: ['pandas', 'numpy'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: '',
  title: '5.1 Arrays: why NumPy is fast and how it thinks',
  tables: [],
  intro: `The Head of Data stops at your desk with a new request. <i>“The finance team wants an <b>unusual payment detector</b>. Every week it should look at all 10,000 payments and flag the odd ones: suspiciously large, suspiciously small. It has to be automatic, repeatable and fast.”</i> He pauses. <i>“You have used Pandas for four modules. To build this properly, you need to know what Pandas stands on.”</i><br><br>What Pandas stands on is <b>NumPy</b>. Every column of every table you have worked with is secretly a NumPy <b>array</b>, and the speed that made <code>groupby</code> and column arithmetic feel instant comes from there. In this module you will meet the engine under the bonnet, and by the end you will have built the detector.<br><br>This first lesson answers three questions: what is an array, why is it so much faster than the lists you used in Module 1, and how do you move between arrays and Pandas columns?`,
  steps: [
    {
      type: 'explain',
      title: 'A list is a shopping bag. An array is an egg tray.',
      body: `<p>In Module 1 you stored numbers in a Python <b>list</b>. A list is wonderfully flexible: it can hold a number, then a word, then another list. That flexibility has a price. Every item is a separate little package, and Python has to open each one to find out what is inside before it can do anything with it.</p>
<p>A NumPy <b>array</b> makes the opposite bargain. It holds <b>one type of thing only</b>, such as all whole numbers or all decimals, packed side by side in a single block of memory. Because everything is the same type, NumPy never has to ask “what are you?” again. It can race straight down the block.</p>
<div class="callout analogy"><b>A shopping bag against an egg tray.</b> A bag can hold anything, but to count the eggs you must rummage through it. An egg tray holds only eggs, in neat slots, so you can count a whole tray at a glance. Arrays are egg trays.</div>
<table class="mini">
<tr><th></th><th>Python list</th><th>NumPy array</th></tr>
<tr><td>Holds</td><td>anything, mixed</td><td>one type for all items</td></tr>
<tr><td>Memory</td><td>separate objects</td><td>one packed block</td></tr>
<tr><td><code>* 2</code> means</td><td>repeat the list twice</td><td>double every number</td></tr>
<tr><td>Maths on every item</td><td>needs a loop</td><td>one short line, done in compiled code</td></tr>
</table>
<p>The third row is the one that surprises people. Let’s see it.</p>`
    },
    {
      type: 'try',
      title: 'The same symbols, different meanings',
      body: `<p>Three prices go into a list, and the same three into an array. Now compare.</p>
<ul>
<li><code>prices_list * 2</code> <b>repeats</b> the list: <code>[100, 250, 80, 100, 250, 80]</code>. Six items, nothing doubled.</li>
<li><code>prices_array * 2</code> <b>doubles every price</b>: <code>[200 500 160]</code>.</li>
<li><code>list + list</code> <b>glues</b> two lists end to end. <code>array + array</code> <b>adds them item by item</b>: 100 plus 1, 250 plus 2, 80 plus 3.</li>
</ul>
<p>Notice that arrays print without commas. That is a quick way to tell them apart from lists on screen. Arrays are built for arithmetic, and the symbols <code>+</code> and <code>*</code> do arithmetic on them. That is the whole idea of NumPy.</p>`,
      code: `import numpy as np

prices_list = [100, 250, 80]
prices_array = np.array([100, 250, 80])

print(prices_list * 2)
print(prices_array * 2)

print(prices_list + [1, 2, 3])
print(prices_array + np.array([1, 2, 3]))`
    },
    {
      type: 'explain',
      title: 'Making arrays, and describing them',
      body: `<p>You can make an array in several ways:</p>
<table class="mini">
<tr><th>Tool</th><th>What it makes</th></tr>
<tr><td><code>np.array([1, 2, 3])</code></td><td>an array from a list you already have</td></tr>
<tr><td><code>np.arange(0, 10, 2)</code></td><td>numbers from 0 up to <b>but not including</b> 10, in steps of 2: <code>0 2 4 6 8</code></td></tr>
<tr><td><code>np.zeros(3)</code>, <code>np.ones(3)</code></td><td>arrays filled with zeros or ones</td></tr>
<tr><td><code>np.linspace(0, 1, 5)</code></td><td>5 evenly spaced numbers from 0 to 1, <b>including</b> both ends</td></tr>
</table>
<p>Every array can describe itself, with attributes (no brackets after them): <code>.shape</code> is its size in each direction, <code>.size</code> is how many items it has, and <code>.dtype</code> is the <b>type</b> of its items. The dtype matters, because the whole array shares it:</p>
<ul>
<li><code>float64</code>: decimal numbers. This is the default for decimals on every computer.</li>
<li><code>int64</code>: whole numbers, 64 bits wide, big enough for anything in this course.</li>
</ul>
<div class="callout watch"><b>A portability warning.</b> On some computers, including inside a web browser, the default type for whole numbers is a smaller one, <code>int32</code>, which overflows past about 2 billion. Sums of big whole numbers can silently go wrong there. When it matters, ask for the type you want: <code>dtype="int64"</code>. We do so in this lesson, so that everyone sees the same results.</div>
<p>If you mix whole numbers and decimals in one array, NumPy converts everything to decimals, because the array must have one type. Let’s see that.</p>`
    },
    {
      type: 'try',
      title: 'Shape, type and the upgrade to decimals',
      body: `<p>First, <code>np.arange(0, 10, 2, dtype="int64")</code> gives <code>[0 2 4 6 8]</code>. Its shape is <b>(5,)</b>, meaning one direction with 5 items (the comma is Python’s way of writing a one-item tuple), and its type is <b>int64</b>.</p>
<p>Then the mixed array. We gave it <code>1</code>, <code>2.5</code> and <code>3</code>. NumPy printed <code>[1.  2.5 3. ]</code> and set the type to <b>float64</b>. The 1 and the 3 were quietly <b>upgraded</b> to 1.0 and 3.0, so that all three items share one type. The same thing is happening whenever a Pandas column of whole numbers gets one decimal.</p>
<p>Last, <code>np.zeros(3)</code> and <code>np.linspace(0, 1, 5)</code>, which gives <code>0, 0.25, 0.5, 0.75, 1</code>: five points, both ends included.</p>`,
      code: `import numpy as np

whole = np.arange(0, 10, 2, dtype="int64")
print(whole, whole.shape, whole.dtype)

mixed = np.array([1, 2.5, 3])
print(mixed, mixed.dtype)

print(np.zeros(3))
print(np.linspace(0, 1, 5))`
    },
    {
      id: 'py-5-1-ex1',
      type: 'exercise',
      title: 'Your turn: the first eight payments as an array',
      body: `<p>The box loads <code>payments.csv</code> for you. Take the first 8 values of the <code>amount</code> column as a NumPy array with <code>.head(8).to_numpy()</code>, and print their <b>sum</b>, rounded to 2 decimals. You should see <code>1553347.2</code>.</p>
<p><b>Think before you type:</b> <code>.to_numpy()</code> turns a Pandas column into an array. Arrays have a <code>.sum()</code> method. Wrap it in <code>round(..., 2)</code>, because decimal sums can show tiny rounding crumbs.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\npayments = pd.read_csv("payments.csv")\n\n# Write your code below\n`,
      hints: [
        `amounts = payments["amount"].head(8).to_numpy(). Then print(round(amounts.sum(), 2)).`,
        `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].head(8).to_numpy()\nprint(round(amounts.sum(), 2))`
      ],
      solution: `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].head(8).to_numpy()\nprint(round(amounts.sum(), 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Vectorisation: do it to everything at once',
      body: `<p>The big idea of NumPy has a long name, <b>vectorisation</b>, and a simple meaning: <b>an operation on an array happens to every item at once, with no loop</b>. You have been doing it with Pandas columns since lesson 4.1. Now you see where it comes from.</p>
<ul>
<li><b>Array with a single number</b>: <code>amounts / 1000</code> divides every item by 1000. The single number is stretched across the array. NumPy calls that <b>broadcasting</b>.</li>
<li><b>Array with an array of the same size</b>: <code>quantities * prices</code> multiplies item by item.</li>
<li><b>Comparisons</b>: <code>amounts &gt; 150000</code> gives an array of True and False, one per item. That is the mask you built in lesson 4.2.</li>
<li><b>Functions</b>: <code>np.sqrt</code>, <code>np.abs</code>, <code>np.round</code> and many more work on whole arrays.</li>
<li><b>Summaries</b>: <code>.sum()</code>, <code>.mean()</code>, <code>.min()</code>, <code>.max()</code> shrink an array to one number.</li>
</ul>
<p>A tiny but powerful pattern: <code>amounts - amounts.mean()</code>. The array minus its own average tells you, for each item, how far it sits from typical. You will use that exact idea to build the detector.</p>`
    },
    {
      type: 'try',
      title: 'Four ways to treat eight payments',
      body: `<p>The eight payments are the first rows of the payments table. Four vectorised lines:</p>
<ul>
<li><code>amounts / 1000</code>: every payment in thousands, so the first is <code>246.70223</code>.</li>
<li><code>amounts - amounts.mean()</code>: how far each payment is from the average of 194168.4. The first is 52533.83 above average, and the third, 9998.84, is 184169.56 <b>below</b> it (a negative number).</li>
<li><code>amounts &gt; 150000</code>: a True/False for each, <code>[True True False False False False False True]</code>.</li>
<li>The last line counts the Trues with <code>.sum()</code>: <b>3</b>.</li>
</ul>
<p>Not one loop. Every line works on all eight items at once, and it would work the same on all 10,000.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].head(8).to_numpy()

print(amounts / 1000)
print(np.round(amounts - amounts.mean(), 2))
print(amounts > 150000)
print((amounts > 150000).sum())`
    },
    {
      id: 'py-5-1-ex2',
      type: 'exercise',
      title: 'Your turn: how many units did TradeFlow sell?',
      body: `<p>Load <code>order_items.csv</code> in the box. Take the <code>quantity</code> column as a NumPy array and print the <b>total number of units sold</b>. You should see <code>75156</code>.</p>
<p><b>Think before you type:</b> pick the column, use <code>.to_numpy()</code>, then <code>.sum()</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\norder_items = pd.read_csv("order_items.csv")\n\n# Write your code below\n`,
      hints: [
        `quantities = order_items["quantity"].to_numpy(). Then print(quantities.sum()).`,
        `import numpy as np\nimport pandas as pd\norder_items = pd.read_csv("order_items.csv")\nquantities = order_items["quantity"].to_numpy()\nprint(quantities.sum())`
      ],
      solution: `import numpy as np\nimport pandas as pd\norder_items = pd.read_csv("order_items.csv")\nquantities = order_items["quantity"].to_numpy()\nprint(quantities.sum())`,
      ordered: true
    },
    {
      id: 'py-5-1-c1',
      type: 'check',
      title: 'What do [1, 2, 3] * 2 and np.array([1, 2, 3]) * 2 give?',
      body: `<p>Think about which one is built for arithmetic.</p>`,
      options: [
        'Both give [2, 4, 6]',
        'The list gives [1, 2, 3, 1, 2, 3]. The array gives [2 4 6]',
        'The list gives [2, 4, 6]. The array gives [1 2 3 1 2 3]',
        'Both raise an error'
      ],
      answer: 1,
      why: [
        'Only the array doubles each item. A list treats * 2 as “repeat the list twice”.',
        'Right! The list repeats itself, and the array does arithmetic on every item. The array printed without commas is how you recognise it.',
        'This is the wrong way round. Arrays do arithmetic, and lists repeat.',
        'Both work, but they mean different things.'
      ]
    },
    {
      type: 'explain',
      title: 'Why arrays are fast',
      body: `<p>Let’s explain the speed, because it is the reason NumPy exists. When Python loops over a list and calculates <code>x * x</code>, it does a surprising amount of work <i>for every item</i>: find the item, check its type, look up how to multiply that type, do the multiplication, wrap the answer in a new Python object. Thousands of tiny decisions.</p>
<p>A NumPy array removes the decisions. All the items have the same type, so NumPy makes the decision <b>once</b>, then hands the whole block to a tight loop written in the language C, which runs straight down the numbers. The loop still exists. It just does not run in Python.</p>
<p>How much faster? It depends on the computer and the job, and on a large table the difference is often <b>tens or hundreds of times</b>. Do not memorise a ratio. Learn the habit: <b>when you can write something as arithmetic on whole arrays, do so instead of looping.</b></p>
<p>You can measure it yourself with <code>time.perf_counter()</code>, which reads a very precise clock. Take the time before, take the time after, and subtract. Let’s race a loop against an array.</p>`
    },
    {
      type: 'try',
      title: 'A loop against an array',
      body: `<p>Both runners add up the squares of the numbers 0 to 19,999. The Python loop multiplies and adds one item at a time. NumPy squares the whole array in one go with <code>array * array</code>, and sums it.</p>
<p>The first line checks that they agree: <b>Same answer: True</b>. Speed means nothing if the answer is wrong. The second line shows the race result: <b>NumPy faster: True</b>.</p>
<p>We print only whether NumPy won, not the exact times, because times change from one computer to the next. On your own machine you can print <code>loop_time</code> and <code>numpy_time</code> and see by how much. Note that the array was made with <code>dtype=float</code>, so the sum cannot overflow on any computer.</p>`,
      code: `import time
import numpy as np

numbers = list(range(20000))
array = np.arange(20000, dtype=float)

start = time.perf_counter()
loop_total = 0
for x in numbers:
    loop_total = loop_total + x * x
loop_time = time.perf_counter() - start

start = time.perf_counter()
numpy_total = (array * array).sum()
numpy_time = time.perf_counter() - start

print("Same answer:", loop_total == numpy_total)
print("NumPy faster:", numpy_time < loop_time)`
    },
    {
      id: 'py-5-1-c2',
      type: 'check',
      title: 'Why is the NumPy version faster than the Python loop?',
      body: `<p>Think about the egg tray.</p>`,
      options: [
        'NumPy uses a smarter formula that skips most of the numbers',
        'All items share one type, so NumPy decides how to do the maths once and runs a compiled loop over a packed block of numbers, instead of re-deciding for every item',
        'NumPy runs on a faster computer',
        'Python loops are always wrong'
      ],
      answer: 1,
      why: [
        'Both versions do every multiplication. The difference is how much work surrounds each one.',
        'Exactly. One type, one decision, and a tight loop written in C. The loop is still there, but it is no longer paying Python’s per-item cost.',
        'Both ran on the same computer, in the same session.',
        'Python loops are fine. They are simply slower than array operations for number crunching, and they are the right tool for many other jobs.'
      ]
    },
    {
      type: 'explain',
      title: 'Two directions: rows and columns',
      body: `<p>So far our arrays have had one direction, like a single row of eggs. Arrays can have two (rows and columns), three, or more. A <b>2D array</b> is a grid, just like a table or a spreadsheet range, with one rule: <b>every cell has the same type</b>.</p>
<p>The <code>.shape</code> of a 2D array has two numbers: <code>(rows, columns)</code>. A 2 by 4 grid has shape <code>(2, 4)</code>.</p>
<p>To turn a flat array into a grid, use <code>.reshape(rows, columns)</code>. The total number of cells must stay the same: 8 items can become 2 by 4 or 4 by 2, but not 3 by 3.</p>
<p>To read from a grid, give the <b>row first, then the column</b>, inside one pair of brackets:</p>
<ul>
<li><code>grid[1, 3]</code>: row 1, column 3 (counting from 0, as always).</li>
<li><code>grid[0]</code>: the whole first row.</li>
<li><code>grid[:, 0]</code>: the whole first column. The colon means “every row”.</li>
</ul>`
    },
    {
      type: 'try',
      title: 'Eight payments in a 2 by 4 grid',
      body: `<p>The eight payments become two rows of four. The first row is payments 1 to 4, the second is payments 5 to 8. The shape is <b>(2, 4)</b>.</p>
<p><code>grid[0]</code> is the first row. <code>grid[:, 0]</code> is the first column: <code>[246702.23 59785.8]</code>, the first payment of each row. And <code>grid[1, 3]</code> is row 1, column 3: <b>505665.9</b>, the last payment, and the biggest of the eight.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].head(8).to_numpy()

grid = amounts.reshape(2, 4)
print(grid)
print(grid.shape)
print(grid[0])
print(grid[:, 0])
print(grid[1, 3])`
    },
    {
      id: 'py-5-1-ex3',
      type: 'exercise',
      title: 'Your turn: the total of the second row',
      body: `<p>The box loads the payments. Take the first 8 amounts as an array, reshape them into <b>2 rows and 4 columns</b>, and print the <b>sum of the second row</b>, rounded to 2 decimals. You should see <code>855083.71</code>.</p>
<p><b>Think before you type:</b> <code>.reshape(2, 4)</code> makes the grid. The second row is <code>grid[1]</code>, because rows count from 0. Then <code>.sum()</code> and <code>round(..., 2)</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].head(8).to_numpy()\n\n# Write your code below\n`,
      hints: [
        `grid = amounts.reshape(2, 4). The second row is grid[1]. Print round(grid[1].sum(), 2).`,
        `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].head(8).to_numpy()\ngrid = amounts.reshape(2, 4)\nprint(round(grid[1].sum(), 2))`
      ],
      solution: `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].head(8).to_numpy()\ngrid = amounts.reshape(2, 4)\nprint(round(grid[1].sum(), 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'From Pandas to NumPy and back',
      body: `<p>You now see the relationship. A Pandas <b>DataFrame</b> is a collection of columns. Each column is a <b>Series</b>, which is a NumPy array plus labels (the row numbers) and a name. Pandas adds the labels, the missing-value handling and the convenient tools, and NumPy supplies the speed.</p>
<ul>
<li><b>Pandas to NumPy:</b> <code>table["amount"].to_numpy()</code> gives the plain array without the labels.</li>
<li><b>NumPy to Pandas:</b> <code>pd.Series(array)</code> wraps an array in a Series again.</li>
</ul>
<p>When should you drop to NumPy? When you want raw speed for maths, when you work with grids, or when a tool such as a statistics or machine learning library asks for arrays. For labelled tables, grouping and joining, stay in Pandas.</p>
<div class="callout watch"><b>One trap, which we will study in the next lesson.</b> <code>to_numpy()</code> does not always make a copy. The array may <i>share memory</i> with the table, so changing the array can change the table behind your back. When you plan to change values, add <code>.copy()</code>.</div>`
    },
    {
      type: 'try',
      title: 'All 10,000 payments as one array',
      body: `<p>The column becomes an array of type <code>numpy.ndarray</code> (“n-dimensional array”). Its shape is <b>(10000,)</b>, one direction with 10,000 items, and its type is <b>float64</b>.</p>
<p>The summaries run in a blink: the smallest payment is <b>1295.04</b>, the largest is <b>1071796.61</b>, and the mean is <b>158198.15</b>. Those are the same numbers you would get from Pandas, because the Pandas column <i>is</i> an array underneath.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].to_numpy()

print(type(amounts))
print(amounts.shape, amounts.dtype)
print(amounts.min(), amounts.max())
print(round(amounts.mean(), 2))`
    },
    {
      id: 'py-5-1-ex4',
      type: 'exercise',
      title: 'Your turn: the middle payment',
      body: `<p>Load the payments in the box. Take the <code>amount</code> column as an array and print its <b>median</b>, the middle value, rounded to 2 decimals. Use NumPy’s <code>np.median(...)</code>. You should see <code>127828.29</code>.</p>
<p><b>Think before you type:</b> <code>np.median(array)</code> is a function that takes the array as its argument. Wrap the result in <code>round(..., 2)</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\npayments = pd.read_csv("payments.csv")\n\n# Write your code below\n`,
      hints: [
        `amounts = payments["amount"].to_numpy(). Then print(round(np.median(amounts), 2)).`,
        `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nprint(round(np.median(amounts), 2))`
      ],
      solution: `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nprint(round(np.median(amounts), 2))`,
      ordered: true
    },
    {
      id: 'py-5-1-ex5',
      type: 'exercise',
      title: 'Challenge: what share of payments are above the average?',
      body: `<p>Print the <b>percentage of payments whose amount is above the mean</b> of all payments, rounded to 2 decimals. You should see <code>39.32</code>.</p>
<p><b>Think before you type:</b> the mean is <code>amounts.mean()</code>. The question <code>amounts &gt; amounts.mean()</code> gives a True/False array. Remember from lesson 4.1: the <code>.mean()</code> of True/False values is the share of Trues. Multiply by 100 and round.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\n\n# Write your code below\n`,
      hints: [
        `above = amounts > amounts.mean(). Then round(above.mean() * 100, 2).`,
        `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nabove = amounts > amounts.mean()\nprint(round(above.mean() * 100, 2))`
      ],
      solution: `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nabove = amounts > amounts.mean()\nprint(round(above.mean() * 100, 2))`,
      ordered: true
    },
    {
      id: 'py-5-1-c3',
      type: 'check',
      title: 'The mean payment is 158,198 and the median is 127,828. Only about 39 percent of payments are above the mean. What does this tell you?',
      body: `<p>If the mean were in the middle, about half of the payments would be above it.</p>`,
      options: [
        'The data contains an error',
        'A minority of very large payments pulls the mean upwards, so the typical (median) payment is lower than the mean',
        'NumPy calculates the mean incorrectly',
        'Most payments are exactly equal to the mean'
      ],
      answer: 1,
      why: [
        'There is no error. This is a very common shape for money data: lots of ordinary amounts and a few big ones.',
        'Right! A few big payments (up to over a million) drag the average up, while the median ignores how big the biggest ones are. For skewed data like this, the median describes the “typical” payment better than the mean.',
        'The mean is the same as in Pandas. The pattern is in the data, not in the tool.',
        'Payments are scattered across a wide range, from 1295 to over a million. Hardly any equal the mean.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You have looked under the bonnet. You can:</p>
<ul>
<li>Explain what a NumPy <b>array</b> is, and how it differs from a list: one type, packed together, arithmetic on every item</li>
<li>Create arrays with <code>np.array</code>, <code>np.arange</code>, <code>np.zeros</code>, <code>np.ones</code> and <code>np.linspace</code>, and describe them with <code>.shape</code>, <code>.size</code> and <code>.dtype</code></li>
<li>Know that mixing whole numbers and decimals <b>upgrades</b> everything to decimals, and ask for <code>dtype="int64"</code> when whole-number size matters</li>
<li>Use <b>vectorised</b> arithmetic, comparisons and summaries, with no loops</li>
<li>Explain <b>why</b> arrays are fast, and race a loop against an array</li>
<li>Build and read <b>2D grids</b> with <code>reshape</code> and <code>grid[row, column]</code></li>
<li>Move between Pandas and NumPy with <code>.to_numpy()</code>, and spot skew by comparing the mean and the median</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>Why is NumPy faster than a Python loop?</li>
<li>What is vectorisation?</li>
<li>What is the relationship between Pandas and NumPy?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A NumPy array holds items of one type in a contiguous block of memory, so NumPy can run a compiled loop in C over the whole block, without the per-item type checks and object handling that a Python loop pays. The same operation on a large array can be tens or hundreds of times faster.</p>
<p><b>2.</b> Vectorisation means writing an operation so that it applies to a whole array at once, such as <code>prices * quantities</code>, instead of looping item by item. It is shorter, clearer and much faster.</p>
<p><b>3.</b> Pandas is built on top of NumPy. Each column in a DataFrame is a Series, which is a NumPy array plus an index and a name. Pandas adds labels, missing-value handling, grouping and joining, and NumPy provides the fast numeric engine underneath.</p>
</details>
<p><b>Coming next, in lesson 5.2:</b> choosing values. The detector must <i>pick out</i> the unusual payments and <i>label</i> them. You will learn indexing and slicing, boolean masks for filtering arrays, <code>np.where</code> to label every item in one line, and the views-versus-copies trap that makes arrays sometimes change behind your back.</p>`
    }
  ]
},
{
  id: 'py-5-2',
  track: 'python',
  lang: 'python',
  packages: ['pandas', 'numpy'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: '',
  title: '5.2 Choosing and labelling values: slices, masks and np.where',
  tables: [],
  intro: `The unusual payment detector needs two abilities. First, it must <b>pick out</b> the payments that look odd: the very large ones, the very small ones. Second, it must <b>label</b> every payment, so that the finance team sees “High”, “Low” or “Normal” next to each one.<br><br>In NumPy, picking out is done with <b>indexing, slicing and masks</b>, and labelling is done with <b>np.where</b>. You already know the ideas from Pandas: a mask is the same True/False stencil from lesson 4.2. But arrays have one behaviour that has surprised every analyst at least once: <b>a slice is a window onto the original, not a copy</b>. Change the window, and you change the original. In this lesson you will meet that trap safely, with small numbers, so that you never meet it by accident with real money.`,
  steps: [
    {
      type: 'explain',
      title: 'Positions, negative positions and slices',
      body: `<p>Items in an array have <b>positions</b>, counted from 0 as with lists in Module 1. The tools are the ones you already know:</p>
<table class="mini">
<tr><th>Write</th><th>You get</th></tr>
<tr><td><code>arr[0]</code></td><td>the first item</td></tr>
<tr><td><code>arr[-1]</code></td><td>the last item (negative numbers count from the end)</td></tr>
<tr><td><code>arr[2:5]</code></td><td>positions 2, 3 and 4. A slice <b>stops before</b> its end position</td></tr>
<tr><td><code>arr[:3]</code></td><td>the first three items</td></tr>
<tr><td><code>arr[::2]</code></td><td>every second item (the last number is the step)</td></tr>
<tr><td><code>arr[::-1]</code></td><td>the whole array in reverse</td></tr>
</table>
<p>You used the same ideas with lists and with <code>iloc</code> in Pandas. What is new in NumPy is what a slice <i>is</i>. We will meet that in a moment. First, the slices themselves, on the first eight payments.</p>`
    },
    {
      type: 'try',
      title: 'First, last, middle and every other',
      body: `<p>The eight payments again. <code>amounts[0]</code> is the first: <b>246702.23</b>. <code>amounts[-1]</code> is the last: <b>505665.9</b>. <code>amounts[2:5]</code> is positions 2, 3 and 4: <b>9998.84, 115761.21, 59785.8</b>. And <code>amounts[::2]</code> takes every second payment, starting at the first: <b>246702.23, 9998.84, 59785.8, 146008.08</b>.</p>
<p>That is all indexing is. Now to the trap.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].head(8).to_numpy()

print(amounts[0])
print(amounts[-1])
print(amounts[2:5])
print(amounts[::2])`
    },
    {
      type: 'explain',
      title: 'A slice is a window, not a copy',
      body: `<p>Picture a long wall with a row of windows. A <b>slice</b> in NumPy is a window cut into the wall: you look through it at the <i>same</i> wall. It does not photograph the wall. If you paint something through the window, the wall itself changes.</p>
<p>In NumPy terms, a slice is a <b>view</b>: it shares memory with the original array. <b>Changing a value through the view changes the original.</b> A <b>copy</b>, made with <code>.copy()</code>, is an independent photograph.</p>
<p>Why does NumPy work this way? Speed and memory. Copying a million numbers every time you take a slice would be wasteful, so NumPy hands you a window by default.</p>
<div class="callout watch"><b>Where this bites.</b> You take the first three payments to “try something”, set one to zero, and later discover that the original array has a zero in it too. Or worse: <code>table["amount"].to_numpy()</code> can also share memory with the Pandas table, so editing the array can change the table. <b>Rule: whenever you plan to change values, make a copy first.</b></div>
<p>Let’s see the trap with our own eyes, using small numbers.</p>`
    },
    {
      type: 'try',
      title: 'Painting through the window',
      body: `<p>We start with five payments, copied so that the table is safe. The first line prints the first three: <code>[246702.23 325801.21 9998.84]</code>.</p>
<p>Then we take a <b>window</b>: <code>window = amounts[:3]</code>, and set its first item to 0. The next print shows the <i>original</i> array, and the first value there has become <b>0</b>. We never touched <code>amounts</code> directly. The window changed it.</p>
<p>Finally we make a true copy with <code>.copy()</code>, change its second item to -1, and print the original once more. This time <b>nothing changed</b>: the original still shows <code>[0. 325801.21 9998.84]</code> (with the zero from the first mistake). The copy is independent.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].head(5).to_numpy().copy()
print(amounts[:3])

window = amounts[:3]
window[0] = 0
print(amounts[:3])

safe = amounts[:3].copy()
safe[1] = -1
print(amounts[:3])`
    },
    {
      id: 'py-5-2-c1',
      type: 'check',
      title: 'You write part = amounts[:3], then part[0] = 0. What happens to amounts?',
      body: `<p>Remember the window in the wall.</p>`,
      options: [
        'Nothing: part is a separate copy',
        'amounts[0] also becomes 0, because the slice is a view that shares memory with amounts',
        'Python raises an error because slices cannot be changed',
        'The whole array becomes zeros'
      ],
      answer: 1,
      why: [
        'A slice is not a copy. To get a copy you must write amounts[:3].copy().',
        'Yes! A slice is a window onto the original. Changing the window changes the original. Use .copy() when you want to change values safely.',
        'Slices can be changed, which is exactly why this is a trap.',
        'Only the position you changed is affected, and it is the same position in both.'
      ]
    },
    {
      id: 'py-5-2-ex1',
      type: 'exercise',
      title: 'Your turn: every other payment',
      body: `<p>The box loads the payments. Take the first 8 amounts as an array, pick <b>every second payment starting from the first</b> with a slice, and print their sum, rounded to 2 decimals. You should see <code>462494.95</code>.</p>
<p><b>Think before you type:</b> the slice <code>[::2]</code> takes every second item. Then <code>.sum()</code> and <code>round(..., 2)</code>. You are only reading, not changing, so no copy is needed.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].head(8).to_numpy()\n\n# Write your code below\n`,
      hints: [
        `amounts[::2] picks positions 0, 2, 4 and 6. Add .sum() and wrap in round(..., 2).`,
        `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].head(8).to_numpy()\nprint(round(amounts[::2].sum(), 2))`
      ],
      solution: `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].head(8).to_numpy()\nprint(round(amounts[::2].sum(), 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Boolean masks: the stencil, in NumPy',
      body: `<p>A comparison on an array gives an array of True and False, one per item: that is a <b>mask</b>, exactly as in lesson 4.2. Put a mask inside square brackets and you keep only the items where it is True:</p>
<p><code>amounts[amounts &gt; 500000]</code> is the payments above 500,000, and nothing else.</p>
<p>Everything else carries over from Pandas:</p>
<ul>
<li>Combine masks with <code>&amp;</code> (and), <code>|</code> (or) and <code>~</code> (not), with <b>each condition in its own brackets</b>. The words <code>and</code> and <code>or</code> fail with the same “truth value is ambiguous” error you know.</li>
<li><code>mask.sum()</code> counts the Trues. <code>mask.mean()</code> is their share. <code>mask.any()</code> asks “is at least one True?”, and <code>mask.all()</code> asks “are they all True?”.</li>
<li>You can use one mask to pick values from <i>another</i> array of the same length. This is how you find, say, the amounts of the payments that were Paid.</li>
</ul>
<p>One difference from Pandas: an array has no labels, so a filtered array is just a shorter array.</p>`
    },
    {
      type: 'try',
      title: 'Picking out the big and the middle payments',
      body: `<p>The first mask, <code>amounts &gt; 500000</code>, is True for <b>140</b> payments. The average of those 140 is <b>584238.46</b>, found by using the mask to keep only the big ones and then taking their mean. They are <b>1.4</b> percent of all payments, using <code>.mean()</code> on the mask.</p>
<p>Then a combined mask: payments from 100000 to 200000, with <code>&amp;</code> and each condition in brackets. There are <b>3390</b> of them. Four lines, and all 10,000 payments were examined in each.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].to_numpy()

big = amounts > 500000
print(big.sum())
print(round(amounts[big].mean(), 2))
print(round(big.mean() * 100, 2))

middle = (amounts >= 100000) & (amounts <= 200000)
print(middle.sum())`
    },
    {
      id: 'py-5-2-ex2',
      type: 'exercise',
      title: 'Your turn: how many small payments?',
      body: `<p>Load the payments in the box. Print how many payments have an amount <b>below 5000</b>. You should see <code>13</code>.</p>
<p><b>Think before you type:</b> build the mask <code>amounts &lt; 5000</code> and count its Trues with <code>.sum()</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\n\n# Write your code below\n`,
      hints: [
        `(amounts < 5000) is a True/False array. Add .sum() to count the Trues, and print it.`,
        `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nprint((amounts < 5000).sum())`
      ],
      solution: `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nprint((amounts < 5000).sum())`,
      ordered: true
    },
    {
      id: 'py-5-2-c2',
      type: 'check',
      title: 'Which expression keeps the payments between 100000 and 200000, both included?',
      body: `<p>Look for brackets and the right symbol.</p>`,
      options: [
        'amounts[amounts >= 100000 & amounts <= 200000]',
        'amounts[(amounts >= 100000) & (amounts <= 200000)]',
        'amounts[(amounts >= 100000) and (amounts <= 200000)]',
        'amounts[100000:200000]'
      ],
      answer: 1,
      why: [
        'The brackets are missing, so Python mixes up the order of the symbols and fails.',
        'Yes! Each condition has its own brackets, and &amp; means both must be true.',
        'The word and does not work on arrays. It gives the “truth value is ambiguous” error.',
        'This is a slice by <i>position</i>: items 100000 to 199999, not values between 100000 and 200000.'
      ]
    },
    {
      type: 'explain',
      title: 'np.where: label every item in one line',
      body: `<p>A mask picks items and throws the rest away. But the detector needs a <b>label for every payment</b>, not a shorter list. The tool is <code>np.where</code>, and it comes in two forms.</p>
<p><b>Three arguments: choose between two values.</b></p>
<p><code>np.where(condition, value_if_true, value_if_false)</code></p>
<p>For every item, NumPy checks the condition and writes one value or the other. The result has the <b>same length</b> as the input. <code>np.where(amounts &gt; 500000, "Large", "Normal")</code> gives a label for each of the 10,000 payments.</p>
<p><b>Nesting for three or more labels.</b> The “false” value can itself be another <code>np.where</code>, which gives a chain like <code>if … elif … else</code>: <code>np.where(a, "Small", np.where(b, "Medium", "Large"))</code>.</p>
<p><b>One argument: where are the Trues?</b> <code>np.where(condition)</code> alone returns the <b>positions</b> where the condition is True. Because the result comes wrapped in a tuple, you take <code>[0]</code> to get the positions themselves.</p>
<p>You built the same size bands in lesson 4.6, with <code>apply</code> and <code>pd.cut</code>. <code>np.where</code> is a third way, and it is the one to use when the labels depend on a condition between arrays.</p>`
    },
    {
      type: 'try',
      title: 'Labelling all 10,000 payments',
      body: `<p>First, two labels. <code>np.unique(..., return_counts=True)</code> lists the different labels and how many of each: <b>Large 140</b> and <b>Normal 9860</b>.</p>
<p>The second line uses the one-argument form: the positions of the first five large payments, <b>7, 25, 199, 233 and 282</b>. Position 7 is payment number 8, and position 25 is payment number 26, the same payments you found in lesson 4.2.</p>
<p>The last line nests two <code>np.where</code> calls to make three bands: <b>Large 1199</b>, <b>Medium 5019</b> and <b>Small 3782</b>. These are the same counts as <code>pd.cut</code> gave in lesson 4.6, from a different tool. Two paths, one answer.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].to_numpy()

label = np.where(amounts > 500000, "Large", "Normal")
print(np.unique(label, return_counts=True))

print(np.where(amounts > 500000)[0][:5])

size = np.where(amounts <= 100000, "Small", np.where(amounts <= 300000, "Medium", "Large"))
print(np.unique(size, return_counts=True))`
    },
    {
      id: 'py-5-2-ex3',
      type: 'exercise',
      title: 'Your turn: count the small payments with np.where',
      body: `<p>Load the payments in the box. Use a nested <code>np.where</code> to label each payment <code>"Small"</code> (up to and including 100000), <code>"Medium"</code> (up to and including 300000) or <code>"Large"</code>. Print how many payments are labelled <b>Small</b>. You should see <code>3782</code>.</p>
<p><b>Think before you type:</b> store the labels in a jar, compare them with <code>== "Small"</code>, and count with <code>.sum()</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\n\n# Write your code below\n`,
      hints: [
        `size = np.where(amounts <= 100000, "Small", np.where(amounts <= 300000, "Medium", "Large")). Then (size == "Small").sum().`,
        `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nsize = np.where(amounts <= 100000, "Small", np.where(amounts <= 300000, "Medium", "Large"))\nprint((size == "Small").sum())`
      ],
      solution: `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nsize = np.where(amounts <= 100000, "Small", np.where(amounts <= 300000, "Medium", "Large"))\nprint((size == "Small").sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Sorting, ranking and counting with arrays',
      body: `<p>Four more tools complete the kit:</p>
<ul>
<li><code>np.sort(arr)</code> returns the values in order.</li>
<li><code>np.argsort(arr)</code> returns the <b>positions</b> that would sort the array. It is how you find <i>which</i> items are the biggest, not only <i>how big</i> they are. Add <code>[::-1]</code> to reverse it, and <code>[:3]</code> to keep the first three.</li>
<li><code>np.argmax(arr)</code> and <code>np.argmin(arr)</code> give the position of the largest and the smallest item. They are the array versions of <code>idxmax</code> and <code>idxmin</code> from lesson 4.3.</li>
<li><code>np.unique(arr, return_counts=True)</code> lists the different values and how many times each appears. It works like <code>value_counts</code> in Pandas.</li>
</ul>
<p>The pattern for a top-N list is: sort the positions, reverse, take the first N, then <b>use those positions to read the values</b>: <code>amounts[positions]</code>. Giving an array a list of positions picks exactly those items, in that order.</p>`
    },
    {
      type: 'try',
      title: 'The three largest payments, and the statuses',
      body: `<p><code>np.argsort(amounts)[::-1][:3]</code> gives the positions of the three largest payments: <b>621, 9588 and 6066</b>. Reading the amounts at those positions gives <b>1071796.61, 877276.2 and 859041.15</b>. The largest payment of all, <b>1071796.61</b>, sits at position 621 (payment number 622, the same one you found in lesson 4.3).</p>
<p><code>np.argmax</code> confirms position <b>621</b>, and <code>np.argmin</code> gives position <b>9911</b> for the smallest payment, 1295.04.</p>
<p>The last line counts the payment statuses: <b>Failed 423, Paid 8461, Pending 604, Refunded 512</b>, the same numbers you got with <code>groupby</code> in lesson 4.4.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].to_numpy()

order = np.argsort(amounts)[::-1][:3]
print(order)
print(amounts[order])
print(np.argmax(amounts), np.argmin(amounts))

status = payments["payment_status"].to_numpy()
print(np.unique(status, return_counts=True))`
    },
    {
      id: 'py-5-2-ex4',
      type: 'exercise',
      title: 'Your turn: the ID of the smallest payment',
      body: `<p>The box loads the payments. Find the <b>position</b> of the smallest <code>amount</code> with <code>np.argmin</code>, and use that position to read the <code>payment_id</code> at the same place. Print the ID. You should see <code>9912</code>.</p>
<p><b>Think before you type:</b> take both columns as arrays with <code>.to_numpy()</code>. Their positions line up row by row. The position from <code>np.argmin(amounts)</code> inside the square brackets of the <code>payment_id</code> array gives the ID.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nids = payments["payment_id"].to_numpy()\n\n# Write your code below\n`,
      hints: [
        `position = np.argmin(amounts). Then print(ids[position]).`,
        `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nids = payments["payment_id"].to_numpy()\nposition = np.argmin(amounts)\nprint(ids[position])`
      ],
      solution: `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nids = payments["payment_id"].to_numpy()\nposition = np.argmin(amounts)\nprint(ids[position])`,
      ordered: true
    },
    {
      id: 'py-5-2-c3',
      type: 'check',
      title: 'What is the difference between amounts[amounts > 5] and np.where(amounts > 5, 1, 0)?',
      body: `<p>Think about the length of each result.</p>`,
      options: [
        'There is no difference',
        'The first returns only the items above 5, a shorter array. The second returns an array of 1s and 0s, one for every item, the same length as amounts',
        'The first returns 1s and 0s and the second returns the items above 5',
        'The first changes amounts and the second does not'
      ],
      answer: 1,
      why: [
        'They answer different questions. One filters, and the other labels.',
        'Exactly. A mask filter keeps some items and drops the rest. np.where keeps every item and writes a label for each one.',
        'This is the wrong way round.',
        'Neither changes amounts. Both build a new array.'
      ]
    },
    {
      type: 'explain',
      title: 'Building the detector: a rule, then labels',
      body: `<p>You now have every part for the first version of the detector. A detector is a <b>rule</b>, and a rule is a condition with labels. The finance team gave you one:</p>
<ul>
<li>A payment above <b>500,000</b> is <b>High</b>: someone should check it.</li>
<li>A payment below <b>2,000</b> is <b>Low</b>: it may be a test payment or an error.</li>
<li>Everything else is <b>Normal</b>.</li>
</ul>
<p>In code, that is a nested <code>np.where</code>. The strength of writing it as code is that the rule is <b>explicit and repeatable</b>. You can run it every Monday, show it to an auditor, and change the thresholds in one place.</p>
<p>Because the labels line up with the payments by position, you can combine them with other arrays. For example, with a mask on the payment status, you can ask how many of the High payments were actually <b>Paid</b>, and how many were not (maybe refunded, or failed).</p>`
    },
    {
      type: 'try',
      title: 'The first version of the detector',
      body: `<p>The rule labels all 10,000 payments: <b>High 140</b>, <b>Low 3</b> and <b>Normal 9857</b>. Three low payments out of 10,000 is a small list for a human to check. They are 1373.29, 1856.11 and the smallest payment of all, 1295.04.</p>
<p>The last line combines two masks. Of the 140 High payments, <b>119</b> have the status Paid, and together they add up to <b>69214414.38</b>. That is about 4.4 percent of all the money billed, concentrated in 119 payments, which is a good reason to have them checked.</p>`,
      code: `import numpy as np
import pandas as pd

payments = pd.read_csv("payments.csv")
amounts = payments["amount"].to_numpy()
status = payments["payment_status"].to_numpy()

unusual = np.where(amounts > 500000, "High", np.where(amounts < 2000, "Low", "Normal"))
print(np.unique(unusual, return_counts=True))

paid = status == "Paid"
high_paid = paid & (amounts > 500000)
print(round(amounts[high_paid].sum(), 2), high_paid.sum())`
    },
    {
      id: 'py-5-2-ex5',
      type: 'exercise',
      title: 'Challenge: the High payments that were not paid',
      body: `<p>The box loads the payments. Count how many of the <b>High</b> payments (amount above 500000) do <b>not</b> have the status <code>"Paid"</code>. You should see <code>21</code>.</p>
<p><b>Think before you type:</b> there are 140 High payments and 119 of them are Paid. Build the mask <code>(amounts &gt; 500000) &amp; (status != "Paid")</code>, each condition in brackets, and count the Trues with <code>.sum()</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nstatus = payments["payment_status"].to_numpy()\n\n# Write your code below\n`,
      hints: [
        `mask = (amounts > 500000) & (status != "Paid"). Then print(mask.sum()).`,
        `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nstatus = payments["payment_status"].to_numpy()\nmask = (amounts > 500000) & (status != "Paid")\nprint(mask.sum())`
      ],
      solution: `import numpy as np\nimport pandas as pd\npayments = pd.read_csv("payments.csv")\namounts = payments["amount"].to_numpy()\nstatus = payments["payment_status"].to_numpy()\nmask = (amounts > 500000) & (status != "Paid")\nprint(mask.sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>The detector now has a rule and labels. You can:</p>
<ul>
<li>Read single items and <b>slices</b> with <code>arr[0]</code>, <code>arr[-1]</code>, <code>arr[2:5]</code> and <code>arr[::2]</code></li>
<li>Explain that a slice is a <b>view</b>, a window on the original, and use <code>.copy()</code> before changing values</li>
<li>Filter with <b>masks</b>, combine them with <code>&amp;</code>, <code>|</code> and <code>~</code>, and count them with <code>.sum()</code></li>
<li>Label every item with <code>np.where</code>, nest it for three bands, and find positions with its one-argument form</li>
<li>Rank and count with <code>np.argsort</code>, <code>np.argmax</code>, <code>np.argmin</code> and <code>np.unique</code></li>
<li>Write a business rule as a clear, repeatable piece of code</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is the difference between a view and a copy in NumPy?</li>
<li>When would you use <code>np.where</code> rather than a boolean mask?</li>
<li>How would you find the top 5 values of an array, and where they are?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A view shares memory with the original array, so changing the view changes the original. Slices are views. A copy has its own memory and is independent. I call <code>.copy()</code> when I plan to modify values and do not want to affect the original.</p>
<p><b>2.</b> A boolean mask filters: it keeps the items that match and returns a shorter array. <code>np.where</code> labels: it returns an array of the same length, with one value where the condition is true and another where it is false. I use it to build a new column of labels or categories, and I can nest it for several bands.</p>
<p><b>3.</b> I use <code>np.argsort(arr)[::-1][:5]</code> to get the positions of the 5 largest values, and then <code>arr[positions]</code> to read the values. <code>np.argmax</code> gives the position of the single largest one.</p>
</details>
<p><b>Coming next, in lesson 5.3:</b> aggregating across rows and columns. The detector so far uses fixed thresholds like 500,000, which somebody had to choose. A better detector learns what is normal from the data itself, using the mean, the standard deviation and the percentiles. First you will learn to summarise a grid along its <code>axis</code>, handle missing values with <code>nan</code>, and see why the “standard deviation” has a version problem that can trip up an analyst.</p>`
    }
  ]
}
);
