LESSONS.push(
{
  id: 'st-1-1',
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
  title: '1.1 Signal, noise and uncertainty: is that drop real?',
  tables: [],
  intro: `The CEO has the half-year figures on her desk, and she is not smiling. <i>“Revenue for January to June is 3.8 percent below the same months last year. Is this real, or is it noise? Do I need to change anything?”</i><br><br>The Head of Data answers carefully. <i>“That is not an arithmetic question. Arithmetic says it fell by 3.8 percent, and it is right. What it cannot say is whether the fall means anything. That is a statistics question.”</i><br><br>This is the first lesson of the Statistics and Probability track. You already know how to compute, clean, chart and automate. Statistics adds the missing skill: <b>deciding well when you cannot be certain</b>. In this lesson you will build, with a few lines of code and no formulas, the most important tool for that job: a way to see how big ordinary luck is, so that you can tell whether a change stands out from it. The master table is loaded, and the TradeFlow tables are available, as before.`,
  steps: [
    {
      type: 'explain',
      title: 'A number moved. Did anything change?',
      body: `<p>The CEO has the first-half numbers on her desk. Revenue for January to June 2026 is <b>3.8 percent below</b> the same six months of 2025. She asks the question every executive asks of every dip: <i>“Is this real, or is this just noise?”</i></p>
<p>That is not an arithmetic question. Arithmetic can tell you that the figure fell by 3.8 percent, and it will tell you that correctly every time. What arithmetic cannot tell you is <b>what the fall means</b>. The answer needs a different kind of thinking, and learning it is what this whole track is for.</p>
<p>Start with the basic fact that makes statistics necessary: <b>numbers move even when nothing has changed</b>. Sales are made by thousands of customers, each deciding on their own, and no month is ever a copy of the last. So every business figure is made of two things mixed together:</p>
<ul>
<li><b>Signal</b>: a real change in the business, such as a lost customer, a price rise or a new market. It is the thing you want to find.</li>
<li><b>Noise</b>: the ordinary wobble that comes from chance. A few customers happen to order a week earlier, or a big buyer skips a month. It means nothing, and it is always there.</li>
</ul>
<p>A single number, such as “down 3.8 percent”, does not tell you how much of it is signal and how much is noise. To decide, you need a <b>yardstick</b>: a sense of how big the noise normally is. If ordinary wobble can produce swings of 10 percent, then 3.8 percent is nothing. If ordinary wobble never exceeds 1 percent, then 3.8 percent is a serious alarm.</p>
<p><b>Statistics is the discipline of deciding well when you cannot be certain.</b> It does not remove the uncertainty. It measures it, so that you can say how sure you are, and so that you do not panic over noise or miss a real signal.</p>
<p>In this lesson you will build that yardstick yourself, with a simple idea and a few lines of code: ask “what would the numbers look like if <b>nothing at all</b> had changed?”, and then see whether the 3.8 percent looks out of place in that world. No formulas are needed. By the end you will be able to answer the CEO honestly.</p>
<div class="callout analogy"><b>The weather forecaster.</b> A forecaster who says “30 percent chance of rain” is not being vague. They are telling you exactly how uncertain they are, and that is what lets you decide whether to carry an umbrella. Good analysts do the same with business numbers.</div>`
    },
    {
      type: 'try',
      title: 'Noise with nothing going on',
      body: `<p>Before looking at TradeFlow, a small experiment where we <b>know</b> nothing changes: a fair coin. Each batch is 100 flips of a coin that lands heads exactly half the time. We repeat the batch ten times.</p>
<p>The line <code>rng.binomial(100, 0.5, size=10)</code> means “ten times, flip a fair coin 100 times and count the heads”. <code>np.random.default_rng(42)</code> is a random number generator started from the <b>seed</b> 42. A seed makes the “random” numbers repeatable: anyone who runs this gets the same ten counts.</p>
<p>Look at the result. The coin is fair, yet the head counts range from <b>40 to 56</b>. If you ran only two batches and saw 55 and 40, you might be tempted to say the coin changed. It did not. That swing is pure noise, and it is exactly the kind of thing that hides inside business numbers.</p>`,
      code: `import numpy as np

rng = np.random.default_rng(42)
heads = rng.binomial(100, 0.5, size=10)

print(heads)
print(heads.min(), heads.max())
`
    },
    {
      type: 'explain',
      title: 'Variation is normal',
      body: `<p>The coin shows the idea in its purest form. Nothing about the coin changed between batches, and still the counts differed by 16 heads from the lowest batch to the highest. The numbers varied because <b>chance varies</b>.</p>
<p>It helps to be clear about where variation in business data comes from. There are three main sources:</p>
<table class="mini">
<tr><th>Source</th><th>What it is</th><th>Example at TradeFlow</th></tr>
<tr><td><b>Chance</b></td><td>Many independent decisions that never add up the same way twice</td><td>One month has 263 orders and the next 206, with no change in the business</td></tr>
<tr><td><b>Measurement</b></td><td>The way something is recorded differs a little each time</td><td>A delivery date logged a day late by a warehouse clerk</td></tr>
<tr><td><b>Real change</b></td><td>Something about the business actually changed</td><td>A price rise, a lost key customer, a new country</td></tr>
</table>
<p>Only the last row is the <b>signal</b> you are hunting for. The first two are noise. A good analyst never assumes that a movement is real just because it happened, and never assumes that it is noise just because it is small. Both mistakes are expensive.</p>
<p>The word <b>random</b> deserves a note, because it is often misunderstood. Random does not mean “anything can happen” or “there is no pattern”. A fair coin is random, and yet its pattern is very predictable over many flips: close to half heads. Random processes have <b>shapes</b>. Learning to describe those shapes is most of what you will do in this track, and the shape of the noise is what lets you decide whether a number is out of the ordinary.</p>
<div class="callout watch"><b>Two opposite mistakes.</b> Calling noise a signal means chasing ghosts: a team spends a month fixing a problem that never existed. Calling a signal noise means missing the real thing until it is too late. Statistics gives you a way to steer between them.</div>
<div class="callout tip"><b>Seeds make randomness repeatable.</b> When you simulate chance in code, always set a seed, as in <code>default_rng(42)</code>. Then your results can be checked by anyone, and a result you quote in a meeting will not change when you rerun it.</div>`
    },
    {
      type: 'try',
      title: 'The real numbers: first half of each year',
      body: `<p>Now the actual TradeFlow figures. The code adds up the monthly revenue (in millions) for January to June of each year, and then works out the percentage change from one year to the next.</p>
<p>The first-half totals are <b>226.02, 230.05, 235.30 and 226.37</b> million for 2023 to 2026. The changes are <b>+1.78, +2.28 and -3.79</b> percent. Look closely: the figure the CEO is worried about, 2026, is the first year to show a fall, and it is a little larger in size than the rises before it. Is that a signal? Notice that you cannot tell by looking. You need the yardstick.</p>`,
      code: `import pandas as pd

monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000

first_half = monthly[monthly.index.month <= 6]
h1 = first_half.groupby(first_half.index.year).sum()

print(h1.round(2))
print((h1.pct_change() * 100).round(2))
`
    },
    {
      id: 'st-1-1-ex1',
      type: 'exercise',
      title: 'Your turn: the first-half changes',
      body: `<p>The monthly revenue series (in millions) is built in the starter. Work out the <b>first-half revenue of each year</b> (January to June), then the <b>percentage change from each year to the next</b>, and print the changes as a list, rounded to 1 decimal. Drop the missing first value, because 2023 has no earlier year to compare with.</p>
<p>You should see <code>[1.8, 2.3, -3.8]</code>.</p>
<p><b>Think before you type:</b> keep only the months up to June with <code>monthly.index.month &lt;= 6</code>. Group those months by their year with <code>.groupby(first_half.index.year).sum()</code>. <code>.pct_change()</code> gives each year’s change as a fraction, so multiply by 100. <code>.dropna()</code> removes the missing first value, and <code>.tolist()</code> turns the result into a list.</p>`,
      starter: `import pandas as pd\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\n\n# Write your code below\n`,
      hints: [
        `first_half = monthly[monthly.index.month <= 6]. h1 = first_half.groupby(first_half.index.year).sum(). Then print((h1.pct_change().dropna() * 100).round(1).tolist()).`,
        `import pandas as pd\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\n\nfirst_half = monthly[monthly.index.month <= 6]\nh1 = first_half.groupby(first_half.index.year).sum()\nprint((h1.pct_change().dropna() * 100).round(1).tolist())\n`
      ],
      solution: `import pandas as pd\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\n\nfirst_half = monthly[monthly.index.month <= 6]\nh1 = first_half.groupby(first_half.index.year).sum()\nprint((h1.pct_change().dropna() * 100).round(1).tolist())\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'How big is the ordinary wobble?',
      body: `<p>To judge a change you need to know how much the numbers usually move. The simplest first look is at the <b>month-to-month wobble</b> of revenue.</p>
<p>Over 42 months, TradeFlow’s monthly revenue has averaged <b>37.67 million</b>. Individual months scatter around that average. A standard measure of how far they typically scatter is the <b>standard deviation</b>, and here it is <b>3.07 million</b>. You will study it properly in the next lesson. For now, read it in plain words: “a typical month lands about 3 million above or below the average”.</p>
<p>To compare wobble across things of different sizes, you can express it as a share of the average. 3.07 divided by 37.67 is about <b>8.1 percent</b>. So a normal TradeFlow month is within roughly 8 percent of the average, with no change in the business at all.</p>
<p>Now look back at the CEO’s number. The drop is 3.8 percent, and it compares <b>six months added together</b> against six months added together. That adds a subtlety. When you add up several months, the ups and downs partly cancel, so the total wobbles less, in relative terms, than a single month does. How much less is not obvious from a formula you can do in your head. This is exactly the kind of question that a simulation answers well, and it is where the lesson goes next.</p>
<div class="callout watch"><b>An average of noise is still noisy.</b> Adding months together calms the noise but never removes it. A total over six months has a wobble of its own, and any comparison between two totals has to be judged against that wobble, not against zero.</div>`
    },
    {
      type: 'try',
      title: 'The ordinary wobble in numbers',
      body: `<p>Three numbers describe how monthly revenue behaves: its average (<b>37.67</b> million), its standard deviation (<b>3.07</b> million) and the standard deviation as a percent of the average (<b>8.1</b>). The code uses <code>.mean()</code> and <code>.std()</code>, which you know from Module 6 of the Python track.</p>
<p>Keep the 8.1 percent in mind. It tells you that month-to-month swings of several percent are the normal state of this business.</p>`,
      code: `import pandas as pd

monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000

print(round(monthly.mean(), 2))
print(round(monthly.std(), 2))
print(round(monthly.std() / monthly.mean() * 100, 1))
`
    },
    {
      id: 'st-1-1-ex2',
      type: 'exercise',
      title: 'Your turn: measure the wobble',
      body: `<p>The monthly revenue series is built in the starter. Print, each on its own line: the <b>mean</b>, the <b>standard deviation</b>, and the standard deviation as a <b>percentage of the mean</b>. Round the first two to 2 decimals and the third to 1 decimal.</p>
<p>You should see <code>37.67</code>, then <code>3.07</code>, then <code>8.1</code>.</p>
<p><b>Think before you type:</b> Pandas gives you <code>.mean()</code> and <code>.std()</code> directly. The percentage is the standard deviation divided by the mean, times 100.</p>`,
      starter: `import pandas as pd\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\n\n# Write your code below\n`,
      hints: [
        `print(round(monthly.mean(), 2)), print(round(monthly.std(), 2)), and print(round(monthly.std() / monthly.mean() * 100, 1)).`,
        `import pandas as pd\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\n\nprint(round(monthly.mean(), 2))\nprint(round(monthly.std(), 2))\nprint(round(monthly.std() / monthly.mean() * 100, 1))\n`
      ],
      solution: `import pandas as pd\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\n\nprint(round(monthly.mean(), 2))\nprint(round(monthly.std(), 2))\nprint(round(monthly.std() / monthly.mean() * 100, 1))\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The “what if nothing changed?” experiment',
      body: `<p>Here is the central idea of the lesson, and one of the most useful ideas in all of statistics. To decide whether the 3.8 percent fall is out of the ordinary, we build a world in which <b>nothing has changed</b>, and see how big a fall that world produces just by chance.</p>
<p>How do you build such a world from real data? You use a clever trick called <b>shuffling</b>, or <b>permutation</b>:</p>
<ol>
<li>Take the 42 real monthly revenue figures.</li>
<li>Throw them in a hat and deal them back out to the 42 calendar slots, <b>at random</b>. The January 2023 slot might now hold the figure that was really March 2025, and so on.</li>
<li>Work out the first-half change from 2025 to 2026 in this shuffled calendar.</li>
</ol>
<p>Why does shuffling build a “nothing changed” world? Because after shuffling, the figures are <b>no longer tied to any date</b>. Whatever happened in the real business, the shuffle breaks the link between a figure and its year. Any “change” between 2025 and 2026 that appears is therefore pure luck of the draw: it cannot come from a real trend, because there is no trend left to find. The shuffled world contains exactly the same figures as the real one, with the same wobble, but no signal.</p>
<p>One shuffle gives you one imaginary fall or rise. That alone tells you little, since it is a single draw. The power comes from doing it <b>thousands of times</b>. You then see the whole range of changes that luck alone produces, and you can ask where the real 3.8 percent fall sits inside that range.</p>
<p>In code, three pieces make this work:</p>
<ul>
<li><code>rng = np.random.default_rng(1)</code> starts the random generator from a seed.</li>
<li><code>rng.permutation(values)</code> returns the values in a random order, which is the shuffle.</li>
<li><b>Masks</b> such as <code>in_2026</code> pick out which slots belong to the first half of 2026 or of 2025, using the true or false trick from Module 5 of the Python track.</li>
</ul>
<div class="callout analogy"><b>The lottery of the calendar.</b> Imagine writing each month’s revenue on a ticket and drawing the tickets out for each month of the calendar at random. If a fall as big as 3.8 percent keeps appearing in these random draws, it clearly does not need a real cause.</div>
<div class="callout tip"><b>This is a general method.</b> Shuffling to build a “nothing is going on” world works for many questions, not only revenue. You will meet it again as the permutation test in Module 5, where it is turned into a formal answer.</div>`
    },
    {
      type: 'try',
      title: 'One shuffle',
      body: `<p>First the preparation. <code>values</code> holds the 42 monthly figures. The two masks <code>in_2025</code> and <code>in_2026</code> mark which slots are the first half of each year. <code>observed</code> is the real change from 2025 to 2026, <b>-3.79 percent</b>, which is printed first.</p>
<p>Then one shuffle with the seed 1. The shuffled calendar produces a first-half change of <b>+0.34 percent</b>. In this imaginary world there is no trend at all, and yet it shows a small rise. Run again with a different seed and you would get a different number. One draw is only one possible outcome, so it settles nothing.</p>`,
      code: `import numpy as np
import pandas as pd

monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000
values = monthly.values
years = monthly.index.year.values
first_half = monthly.index.month.values <= 6
in_2025 = (years == 2025) & first_half
in_2026 = (years == 2026) & first_half

observed = values[in_2026].sum() / values[in_2025].sum() - 1

rng = np.random.default_rng(1)
shuffled = rng.permutation(values)
change = shuffled[in_2026].sum() / shuffled[in_2025].sum() - 1

print(round(observed * 100, 2))
print(round(change * 100, 2))
`
    },
    {
      id: 'st-1-1-ex3',
      type: 'exercise',
      title: 'Your turn: one shuffle of your own',
      body: `<p>The preparation is in the starter: the monthly figures in <code>values</code>, the masks <code>in_2025</code> and <code>in_2026</code>, and the real change in <code>observed</code>. Make a random number generator with the seed <b>1</b>, shuffle <code>values</code> once, work out the first-half change from 2025 to 2026 in the shuffled calendar, and print it as a percentage rounded to 2 decimals.</p>
<p>You should see <code>0.34</code>.</p>
<p><b>Think before you type:</b> <code>rng = np.random.default_rng(1)</code>, then <code>shuffled = rng.permutation(values)</code>. The change is the 2026 sum divided by the 2025 sum, minus 1, using the masks: <code>shuffled[in_2026].sum() / shuffled[in_2025].sum() - 1</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\nvalues = monthly.values\nyears = monthly.index.year.values\nfirst_half = monthly.index.month.values <= 6\nin_2025 = (years == 2025) & first_half\nin_2026 = (years == 2026) & first_half\n\nobserved = values[in_2026].sum() / values[in_2025].sum() - 1\n\n# Write your code below\n`,
      hints: [
        `rng = np.random.default_rng(1). shuffled = rng.permutation(values). change = shuffled[in_2026].sum() / shuffled[in_2025].sum() - 1. print(round(change * 100, 2)).`,
        `import numpy as np\nimport pandas as pd\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\nvalues = monthly.values\nyears = monthly.index.year.values\nfirst_half = monthly.index.month.values <= 6\nin_2025 = (years == 2025) & first_half\nin_2026 = (years == 2026) & first_half\n\nobserved = values[in_2026].sum() / values[in_2025].sum() - 1\n\nrng = np.random.default_rng(1)\nshuffled = rng.permutation(values)\nchange = shuffled[in_2026].sum() / shuffled[in_2025].sum() - 1\nprint(round(change * 100, 2))\n`
      ],
      solution: `import numpy as np\nimport pandas as pd\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\nvalues = monthly.values\nyears = monthly.index.year.values\nfirst_half = monthly.index.month.values <= 6\nin_2025 = (years == 2025) & first_half\nin_2026 = (years == 2026) & first_half\n\nobserved = values[in_2026].sum() / values[in_2025].sum() - 1\n\nrng = np.random.default_rng(1)\nshuffled = rng.permutation(values)\nchange = shuffled[in_2026].sum() / shuffled[in_2025].sum() - 1\nprint(round(change * 100, 2))\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Do it five thousand times',
      body: `<p>One shuffle is a single draw from the lottery. To see the <b>shape of luck</b>, you repeat it many times. A loop does this in a blink: shuffle, work out the change, store it, and repeat 5,000 times. You then have 5,000 imaginary first-half changes, every one produced in a world where nothing real changed.</p>
<p>Two questions then answer the CEO.</p>
<p><b>First: how big does the noise get?</b> The spread of those 5,000 changes tells you the size of ordinary luck. For TradeFlow, the standard deviation of the shuffled changes comes out at about <b>4.7 percent</b>, and individual shuffles range from roughly <b>-15 to +17 percent</b>. In a world with no real change at all, first-half revenue can easily rise or fall by several percent from one year to the next.</p>
<p><b>Second: how often does luck alone produce a fall at least as big as ours?</b> Count the shuffles with a change at or below -3.79 percent, and divide by 5,000. That share comes out at about <b>0.21</b>, or roughly <b>one time in five</b>.</p>
<p>That second number is one of the most important ideas in statistics, and it has a name: it is a <b>p-value</b>. Do not worry about the name yet. You will meet it properly in Module 5. For now keep the plain-language meaning: <b>“if nothing had really changed, how often would luck alone produce something at least this extreme?”</b> A small share means “rarely, so this is probably real”. A large share means “often, so this could easily be luck”. Here the share is about one in five. That is common enough that the 3.8 percent fall <b>cannot be told apart from ordinary wobble</b>.</p>
<p>Compare this with the yardstick from earlier. Ordinary noise moves this measure by about 4.7 percent either way, and the observed change of 3.8 percent is <b>smaller than that</b>. It is not that the fall is imaginary. It is that the business is simply too noisy for a fall this size to stand out.</p>
<div class="callout watch"><b>Notice what we did not do.</b> We did not prove that nothing changed, and we did not prove that revenue is falling. We measured how surprising the fall is, in a world with no change. That is a more honest statement than yes or no, and the next lesson cards turn it into plain English for the CEO.</div>
<div class="callout tip"><b>Use enough shuffles.</b> A thousand is a bare minimum, and five thousand or more makes the answer stable. With too few, the share jumps around from run to run.</div>`
    },
    {
      type: 'try',
      title: 'Five thousand shuffles: the numbers',
      body: `<p>The loop shuffles the months 5,000 times and stores each first-half change in an array. Then three summary lines: the standard deviation of the shuffled changes (<b>4.69</b> percent), their smallest and largest values (<b>-15.4</b> and <b>17.4</b> percent), and the share of shuffles that fell at least as far as the real change (<b>0.2086</b>).</p>
<p>So about <b>21 percent</b> of the time, a world where nothing changed produces a first-half fall of 3.8 percent or more. The CEO’s fall is something luck does about one time in five.</p>`,
      code: `import numpy as np
import pandas as pd

monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000
values = monthly.values
years = monthly.index.year.values
first_half = monthly.index.month.values <= 6
in_2025 = (years == 2025) & first_half
in_2026 = (years == 2026) & first_half

observed = values[in_2026].sum() / values[in_2025].sum() - 1

rng = np.random.default_rng(1)
changes = np.empty(5000)
for i in range(5000):
    shuffled = rng.permutation(values)
    changes[i] = shuffled[in_2026].sum() / shuffled[in_2025].sum() - 1

print(round(changes.std() * 100, 2))
print(round(changes.min() * 100, 1), round(changes.max() * 100, 1))
print(round((changes <= observed).mean(), 4))
`
    },
    {
      type: 'try',
      title: 'Five thousand shuffles: the picture',
      body: `<p>The same experiment drawn as a histogram, which is the shape of luck. Each bar counts how many of the 5,000 shuffles produced a change in that range. The dashed amber line marks what we actually saw, <b>-3.8 percent</b>.</p>
<p>Read it as a whole. The shuffles form a bell-like hump centred near zero, spread from about -15 to +17. The amber line sits well inside the hump, not out in a thin tail. Compare this with a fall of, say, 12 percent, which would sit far out on the left where almost no shuffle reaches. That is the difference between noise and a signal that stands out. The first chart of a session loads slowly, so be patient.</p>`,
      code: `import numpy as np
import pandas as pd

monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000
values = monthly.values
years = monthly.index.year.values
first_half = monthly.index.month.values <= 6
in_2025 = (years == 2025) & first_half
in_2026 = (years == 2026) & first_half

observed = values[in_2026].sum() / values[in_2025].sum() - 1
import matplotlib.pyplot as plt

rng = np.random.default_rng(1)
changes = np.empty(5000)
for i in range(5000):
    shuffled = rng.permutation(values)
    changes[i] = shuffled[in_2026].sum() / shuffled[in_2025].sum() - 1

fig, ax = plt.subplots(figsize=(9, 4))
ax.hist(changes * 100, bins=40, edgecolor="#0f2744")
ax.axvline(observed * 100, color="#f5b301", linestyle="--", label="What we saw: -3.8%")
ax.legend()
ax.set_title("First-half revenue change when nothing has changed (5,000 shuffles)")
ax.set_xlabel("Change in first-half revenue (%)")
ax.set_ylabel("Number of shuffles")
plt.tight_layout()
`
    },
    {
      id: 'st-1-1-ex4',
      type: 'exercise',
      title: 'Your turn: how often is luck this bad?',
      body: `<p>The preparation is in the starter. Repeat the shuffle <b>5,000 times</b> with a generator seeded with <b>1</b>, store each first-half change, and print the <b>share of shuffles whose change was at or below the observed change</b>, rounded to 4 decimals.</p>
<p>You should see <code>0.2086</code>.</p>
<p><b>Think before you type:</b> make an empty array with <code>np.empty(5000)</code>, then loop <code>for i in range(5000):</code>. Inside the loop shuffle with <code>rng.permutation(values)</code> and store the change in <code>changes[i]</code>. After the loop, <code>(changes &lt;= observed).mean()</code> gives the share, because the mean of a column of True and False values is the share of True.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\nvalues = monthly.values\nyears = monthly.index.year.values\nfirst_half = monthly.index.month.values <= 6\nin_2025 = (years == 2025) & first_half\nin_2026 = (years == 2026) & first_half\n\nobserved = values[in_2026].sum() / values[in_2025].sum() - 1\n\n# Write your code below\n`,
      hints: [
        `rng = np.random.default_rng(1) and changes = np.empty(5000). In the loop: shuffled = rng.permutation(values) and changes[i] = shuffled[in_2026].sum() / shuffled[in_2025].sum() - 1. Then print(round((changes <= observed).mean(), 4)).`,
        `import numpy as np\nimport pandas as pd\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\nvalues = monthly.values\nyears = monthly.index.year.values\nfirst_half = monthly.index.month.values <= 6\nin_2025 = (years == 2025) & first_half\nin_2026 = (years == 2026) & first_half\n\nobserved = values[in_2026].sum() / values[in_2025].sum() - 1\n\nrng = np.random.default_rng(1)\nchanges = np.empty(5000)\nfor i in range(5000):\n    shuffled = rng.permutation(values)\n    changes[i] = shuffled[in_2026].sum() / shuffled[in_2025].sum() - 1\n\nprint(round((changes <= observed).mean(), 4))\n`
      ],
      solution: `import numpy as np\nimport pandas as pd\n\nmonthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000\nvalues = monthly.values\nyears = monthly.index.year.values\nfirst_half = monthly.index.month.values <= 6\nin_2025 = (years == 2025) & first_half\nin_2026 = (years == 2026) & first_half\n\nobserved = values[in_2026].sum() / values[in_2025].sum() - 1\n\nrng = np.random.default_rng(1)\nchanges = np.empty(5000)\nfor i in range(5000):\n    shuffled = rng.permutation(values)\n    changes[i] = shuffled[in_2026].sum() / shuffled[in_2025].sum() - 1\n\nprint(round((changes <= observed).mean(), 4))\n`,
      ordered: true
    },
    {
      id: 'st-1-1-c1',
      type: 'check',
      title: 'In a shuffled world where nothing has changed, a first-half fall of 3.8 percent or more happens about 21 percent of the time. What is the best reading of the real 3.8 percent fall?',
      body: `<p>Think about whether luck alone could easily have produced it.</p>`,
      options: [
        'Revenue is definitely falling, so the strategy must change now',
        'Revenue is definitely not falling, because the shuffles prove nothing changed',
        'A fall this size is something luck does about one time in five, so this figure alone does not show a real decline, although it does not rule one out',
        '3.8 percent is a small number, so there is no point examining it at all'
      ],
      answer: 2,
      why: [
        'Too strong. If chance alone produces a fall this big about one time in five, the number alone cannot support “definitely”.',
        'Also too strong. The shuffles do not prove that nothing changed. They show what a world with no change looks like, and that the real figure fits comfortably inside it.',
        'Right! The fall fits easily inside ordinary wobble, so on this evidence alone we cannot call it a real decline. But we cannot rule out a small real decline either, since a genuine small drop could hide inside noise this large.',
        'Size alone does not decide it. A small fall can be a real signal if the noise is smaller, and a large one can be noise if the noise is larger. The yardstick matters, not the number by itself.'
      ]
    },
    {
      type: 'explain',
      title: 'Three honest answers: yes, no and not yet',
      body: `<p>A boardroom wants “yes” or “no”. Statistics is more honest, and more useful, because it gives you <b>three</b> possible answers.</p>
<table class="mini">
<tr><th>Answer</th><th>What the data says</th><th>What you tell the CEO</th></tr>
<tr><td><b>Yes, it looks real</b></td><td>Luck alone would almost never produce this</td><td>“This is very unlikely to be noise. Let us find the cause.”</td></tr>
<tr><td><b>No, it fits noise</b></td><td>Luck often produces this, and we have enough data to be confident that any real change is small</td><td>“This is within normal variation. No action needed.”</td></tr>
<tr><td><b>We cannot tell yet</b></td><td>Luck can easily produce this, and the data is too limited to rule out a real change</td><td>“This could be noise or a small real decline. Here is what would settle it.”</td></tr>
</table>
<p>TradeFlow’s 3.8 percent fall belongs in the third row. The fall is smaller than the ordinary wobble, so it does not show a decline. But six months of noisy data cannot rule out a small genuine decline either. Saying so is not weakness. It is precision.</p>
<p>A useful way to say it to an executive is a short, concrete message:</p>
<p><i>“First-half revenue is 3.8 percent lower than last year. Revenue at this scale normally wobbles by around 4 to 5 percent from year to year with no real change, so this fall is within normal variation. It does not show that the business is declining, but it does not prove it is healthy either. If the next quarter is also below last year, the case for a real decline becomes much stronger. I will track it monthly.”</i></p>
<p>Notice what that message does. It states the fact, gives the yardstick, says what the fact does and does not prove, and proposes the next step. It never claims more certainty than the data holds.</p>
<p>The way to turn “cannot tell yet” into “yes” or “no” is <b>more evidence</b>. More months means less noise in each total. A bigger effect is easier to see. A longer record gives a better yardstick. Throughout this track you will learn to plan for that: how much data you need to settle a question.</p>
<div class="callout watch"><b>Not significant does not mean not real.</b> “We cannot tell” is a statement about the evidence, not about the world. A real decline could exist and still hide in the noise. Never turn “no evidence of a fall” into “evidence of no fall”.</div>
<div class="callout work"><b>At work:</b> a leader who hears “it is probably noise, but here is what we will watch” trusts you far more, a few weeks later, than one who heard “it is definitely fine” and then saw the numbers keep falling.</div>`
    },
    {
      id: 'st-1-1-ex5',
      type: 'exercise',
      title: 'Challenge: is the fall in orders any different?',
      body: `<p>The finance director asks: <i>“Revenue was within the noise. What about the number of orders?”</i> Run the same experiment on <b>orders per month</b>. The starter builds <code>values</code> (the number of different orders in each of the 42 months) and the two masks. Work out the real change in first-half orders from 2025 to 2026, then shuffle the months <b>5,000 times</b> with a generator seeded with <b>7</b>, and print two lines: the real change as a percentage rounded to 2 decimals, and the share of shuffles at or below it, rounded to 4 decimals.</p>
<p>You should see <code>-3.76</code> and then <code>0.1702</code>.</p>
<p><b>Think before you type:</b> it is the same recipe as the last exercise, with <code>values</code> now holding order counts and a different seed. The real change is <code>values[in_2026].sum() / values[in_2025].sum() - 1</code>.</p>`,
      starter: `import numpy as np\nimport pandas as pd\n\nmonthly_orders = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()\nvalues = monthly_orders.values\nyears = monthly_orders.index.year.values\nfirst_half = monthly_orders.index.month.values <= 6\nin_2025 = (years == 2025) & first_half\nin_2026 = (years == 2026) & first_half\n\n# Write your code below\n`,
      hints: [
        `observed = values[in_2026].sum() / values[in_2025].sum() - 1. Then rng = np.random.default_rng(7), a loop of 5000 shuffles filling changes, and print(round(observed * 100, 2)) followed by print(round((changes <= observed).mean(), 4)).`,
        `import numpy as np\nimport pandas as pd\n\nmonthly_orders = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()\nvalues = monthly_orders.values\nyears = monthly_orders.index.year.values\nfirst_half = monthly_orders.index.month.values <= 6\nin_2025 = (years == 2025) & first_half\nin_2026 = (years == 2026) & first_half\n\nobserved = values[in_2026].sum() / values[in_2025].sum() - 1\n\nrng = np.random.default_rng(7)\nchanges = np.empty(5000)\nfor i in range(5000):\n    shuffled = rng.permutation(values)\n    changes[i] = shuffled[in_2026].sum() / shuffled[in_2025].sum() - 1\n\nprint(round(observed * 100, 2))\nprint(round((changes <= observed).mean(), 4))\n`
      ],
      solution: `import numpy as np\nimport pandas as pd\n\nmonthly_orders = master.groupby(master["order_date"].dt.to_period("M"))["order_id"].nunique()\nvalues = monthly_orders.values\nyears = monthly_orders.index.year.values\nfirst_half = monthly_orders.index.month.values <= 6\nin_2025 = (years == 2025) & first_half\nin_2026 = (years == 2026) & first_half\n\nobserved = values[in_2026].sum() / values[in_2025].sum() - 1\n\nrng = np.random.default_rng(7)\nchanges = np.empty(5000)\nfor i in range(5000):\n    shuffled = rng.permutation(values)\n    changes[i] = shuffled[in_2026].sum() / shuffled[in_2025].sum() - 1\n\nprint(round(observed * 100, 2))\nprint(round((changes <= observed).mean(), 4))\n`,
      ordered: true
    },
    {
      id: 'st-1-1-c2',
      type: 'check',
      title: 'Why do we shuffle the months before measuring the first-half change?',
      body: `<p>Think about what the shuffle does to the link between a figure and its date.</p>`,
      options: [
        'To make the real data more accurate',
        'To build a world in which the figures are no longer tied to their dates, so any change we see is pure luck, which gives us a yardstick for how big luck can be',
        'To remove the months that look unusual',
        'To prove that revenue is falling'
      ],
      answer: 1,
      why: [
        'Shuffling does not change the data’s accuracy. It deliberately breaks its connection to time.',
        'Right! After shuffling, no real trend can survive, because each figure is dealt to a random date. Whatever change appears is luck. Repeating it thousands of times shows how big luck gets, and that is the yardstick.',
        'Nothing is removed. Every real figure is kept, only dealt to random slots.',
        'The shuffle cannot prove a fall. It tells us how often a fall of that size happens when nothing real is going on.'
      ]
    },
    {
      id: 'st-1-1-c3',
      type: 'check',
      title: 'A colleague says: “The test could not show a real decline, so we can be sure there is none.” What is wrong with that sentence?',
      body: `<p>Think about the difference between “no evidence of” and “evidence of no”.</p>`,
      options: [
        'Nothing is wrong. If the test finds nothing, there is nothing to find',
        'It treats a lack of evidence as proof of absence. With six noisy months, a small real decline could easily be hiding inside the noise',
        'It should say that the decline is definitely real',
        'Tests can only ever prove things, never fail to show them'
      ],
      answer: 1,
      why: [
        'A test can fail to find something that is really there, especially when the data is noisy or limited.',
        'Right! “We could not show it” is a statement about our evidence. A small real decline would produce results that look much like noise in six months of data. The honest statement is “we cannot tell yet”, not “there is none”.',
        'The opposite error. The shuffles show a fall this size happens often by luck, so it cannot be called definitely real either.',
        'Tests can fail to detect real effects. This is exactly the reason statisticians plan how much data they need.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You have taken your first step into statistical thinking, and you did it by building the idea yourself instead of memorising a rule. You can:</p>
<ul>
<li>Explain <b>signal and noise</b>, and why a single number cannot tell them apart</li>
<li>Name the sources of variation: <b>chance, measurement and real change</b></li>
<li>Use a <b>seeded random generator</b> so that simulated results are repeatable</li>
<li>Measure the <b>ordinary wobble</b> of a business figure with the mean, the standard deviation and the standard deviation as a share of the mean</li>
<li>Build a <b>“what if nothing changed?” world</b> by shuffling, and measure the change in it thousands of times</li>
<li>Read the result as <b>“how often would luck alone do this?”</b>, which is the idea behind the p-value</li>
<li>Give an executive one of <b>three honest answers</b>: it looks real, it fits noise, or we cannot tell yet</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>Revenue is down 4 percent on last quarter. How do you decide whether that is a real problem?</li>
<li>What is the difference between signal and noise?</li>
<li>How can you test whether a change is just luck without using a formula?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I first check how much that figure normally moves with no real change, using the history of the same measure. If ordinary variation can easily produce a 4 percent move, the fall alone does not show a problem. I would then look for a cause that explains it, such as a lost customer, and I would watch the next period. I would tell the stakeholder what the data does and does not show, rather than giving a yes or no.</p>
<p><b>2.</b> Signal is a real change in the underlying business, such as a price change or a lost customer. Noise is the ordinary random variation that exists even when nothing changes. Any single number mixes the two, so you need a yardstick for how big the noise normally is before you can judge a change.</p>
<p><b>3.</b> I can build a world where nothing has changed by shuffling the data, for example dealing the monthly figures to random dates. I measure the statistic of interest in each shuffled version, repeat it thousands of times, and see how often luck alone produces a change at least as big as the one I actually observed. If that happens often, the real change is easily explained by chance. If it almost never happens, the change is probably real.</p>
</details>
<p><b>Coming next, in lesson 1.2:</b> centre and spread. You used the average and the standard deviation here without opening them up. Next you will learn exactly what the mean, the median, the standard deviation and the interquartile range measure, when each one misleads you, and how to choose between them for the CEO’s question about how steady TradeFlow’s deliveries really are.</p>`
    }
  ]
},
{
  id: 'st-1-2',
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
  title: '1.2 Centre and spread: mean, median, standard deviation and IQR',
  tables: [],
  intro: `The operations director catches you in the corridor. <i>“Our average delivery takes 5.5 days. That is fine, is it not?”</i><br><br>You pause. An average on its own is only half a sentence. It says where the middle is, and says nothing about whether every parcel arrives on day 5 or half of them arrive on day 1 and half on day 9. To answer her properly you need two ideas that sit under almost everything in statistics: <b>centre</b>, where the data is, and <b>spread</b>, how far it strays.<br><br>In this lesson you will learn what the mean, the median, the standard deviation and the interquartile range really measure, how to choose between them, how to compare spread across different units, and how much a few extreme values can distort each one. The TradeFlow tables are loaded, and the <code>deliveries</code> table already has a <code>transit_days</code> column, the number of days between dispatch and delivery.`,
  steps: [
    {
      type: 'explain',
      title: 'Two questions about any column of numbers',
      body: `<p>The operations director has a simple message for you. <i>“Our average delivery takes 5.5 days. That is fine, right?”</i></p>
<p>It sounds fine, and it is half an answer. An average tells you <b>where the middle of the data is</b>. It tells you nothing about <b>how far the values stray from that middle</b>. Two delivery routes can share the same average and be completely different experiences: one where every parcel arrives on day 5, and one where half arrive on day 1 and half on day 9. A customer on the second route would not call the service reliable.</p>
<p>So describing any column of numbers needs two answers, and statisticians have names for them:</p>
<table class="mini">
<tr><th>The question</th><th>The idea</th><th>The tools</th></tr>
<tr><td><b>Where is the middle?</b></td><td><b>Centre</b>, also called location or central tendency</td><td>Mean, median, mode</td></tr>
<tr><td><b>How spread out is it?</b></td><td><b>Spread</b>, also called variation or dispersion</td><td>Range, standard deviation, interquartile range</td></tr>
</table>
<p>Quoting a centre without a spread is like quoting a temperature without saying whether it is the day’s high or the night’s low. In this lesson you will learn what each of those tools actually measures, which one to trust for which data, and how to compare spread between things measured in different units, such as days and money.</p>
<p>This is more than vocabulary. In lesson 1.1 you used a standard deviation to describe the wobble of monthly revenue. Here you will open it up, so that you know what it is made of. Everything that follows in this track, from confidence intervals to regression, is built on these two ideas.</p>
<div class="callout analogy"><b>Two archers.</b> Both archers hit the centre of the target on average. One scatters tightly around the bullseye, and the other fires wildly in every direction, with misses cancelling out. Their averages are identical, and nobody would pick the second archer for a competition. Centre says where the arrows are aimed. Spread says how reliably they land there.</div>`
    },
    {
      type: 'try',
      title: 'Same average, different story',
      body: `<p>Two small delivery routes with five parcels each, written as columns of transit days. Route A delivers every parcel in exactly 5 days. Route B delivers some in 1 day and some in 9.</p>
<p>The first line shows the means: both are <b>5.0</b>. The second line shows the standard deviations: <b>0.0</b> for route A, because nothing varies, and <b>4.0</b> for route B. The last two lines show the fastest and slowest parcel on each. If you had only been told “the average is 5 days”, you could not have distinguished a dependable route from a gamble.</p>`,
      code: `import pandas as pd

route_a = pd.Series([5, 5, 5, 5, 5])
route_b = pd.Series([1, 9, 1, 9, 5])

print(route_a.mean(), route_b.mean())
print(route_a.std(), route_b.std())
print(route_a.min(), route_a.max())
print(route_b.min(), route_b.max())
`
    },
    {
      type: 'explain',
      title: 'Three ways to find the middle',
      body: `<p>There is no single “middle”. There are three common ones, and each answers a slightly different question.</p>
<p><b>The mean</b> is the average: add all the values and divide by how many there are. It is the balance point of the data, like the spot where a see-saw would balance if every value were a weight. Every value counts, including extreme ones, and that is both its strength and its weakness. One enormous value drags the mean towards it.</p>
<p><b>The median</b> is the middle value when you line the data up from smallest to largest. Half the values are below it and half above. The median pays attention to the <b>order</b> of the values, not their size, so a single extreme value barely moves it.</p>
<p><b>The mode</b> is the value that occurs most often. It is the only one of the three that also works for <b>categories</b>, as in “the most common payment method”. For numbers that take only a few different values, such as units per order, the mode is informative. For numbers with many distinct values, it is usually not.</p>
<table class="mini">
<tr><th>Centre</th><th>Best used when</th><th>Weakness</th></tr>
<tr><td><b>Mean</b></td><td>The data is roughly symmetric, and you care about totals (total = mean times count)</td><td>Pulled by extreme values</td></tr>
<tr><td><b>Median</b></td><td>The data is skewed, or has outliers, and you want a typical case</td><td>Ignores how large the large values are, so it cannot be turned back into a total</td></tr>
<tr><td><b>Mode</b></td><td>Categories, or numbers with few distinct values</td><td>Unreliable when every value is nearly unique</td></tr>
</table>
<p>You met this in lesson 7.3 of the Python track: TradeFlow’s mean order value is 158,198 and the median is 127,828, because a few huge orders pull the mean up. The skew was visible in the histogram. The distance between the mean and the median is a quick warning sign that the distribution is lopsided.</p>
<div class="callout watch"><b>The “average” is ambiguous.</b> When someone says “the average order”, ask whether they mean the mean or the median. In skewed data the two can differ by 20 percent or more, and quoting the wrong one misleads.</div>
<div class="callout tip"><b>Report both when they differ.</b> “The average order is 158 thousand, but the typical order is closer to 128 thousand” is one honest sentence, and it tells the reader about the shape of the data as well.</div>`
    },
    {
      type: 'try',
      title: 'Three centres of units per order',
      body: `<p>Each order has a number of units (the sum of the quantities of its lines). The code computes that for all 10,000 orders and then prints three centres: the mean, the median and the mode.</p>
<p>The mean is <b>7.52</b>, the median is <b>7</b> and the mode is <b>6</b>. They differ a little, which tells you the distribution has a tail towards larger orders. Notice that the mean, 7.52, is not even a possible order size, because an order cannot have a fraction of a unit. The mean is a balance point, not a typical order. The mode, 6, is the most common single size. <code>.mode()</code> returns a column, because there can be ties, so we take its first entry with <code>.iloc[0]</code>.</p>`,
      code: `import pandas as pd

units = master.groupby("order_id")["quantity"].sum()

print(round(units.mean(), 2))
print(units.median())
print(units.mode().iloc[0])
`
    },
    {
      id: 'st-1-2-ex1',
      type: 'exercise',
      title: 'Your turn: the centre of delivery times',
      body: `<p>The starter builds <code>transit</code>, the delivery time in days of every delivered parcel. Print its <b>mean</b> (rounded to 2 decimals), its <b>median</b> and its <b>mode</b>, each on its own line.</p>
<p>You should see <code>5.51</code>, <code>6.0</code> and <code>6.0</code>.</p>
<p><b>Think before you type:</b> <code>.mean()</code> and <code>.median()</code> are straight methods. <code>.mode()</code> returns a column because ties are possible, so take its first value with <code>.iloc[0]</code>.</p>`,
      starter: `import pandas as pd\n\ntransit = deliveries["transit_days"].dropna()\n\n# Write your code below\n`,
      hints: [
        `print(round(transit.mean(), 2)), then print(transit.median()), then print(transit.mode().iloc[0]).`,
        `import pandas as pd\n\ntransit = deliveries["transit_days"].dropna()\n\nprint(round(transit.mean(), 2))\nprint(transit.median())\nprint(transit.mode().iloc[0])\n`
      ],
      solution: `import pandas as pd\n\ntransit = deliveries["transit_days"].dropna()\n\nprint(round(transit.mean(), 2))\nprint(transit.median())\nprint(transit.mode().iloc[0])\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Spread: the standard deviation, step by step',
      body: `<p>Now the second question: how far do values stray from the middle? The simplest answer is the <b>range</b>, the largest value minus the smallest. It is easy to read and easy to fool: one odd value stretches it. A better measure uses <b>every</b> value. The most important such measure is the <b>standard deviation</b>, and it is built in four easy steps.</p>
<ol>
<li><b>Find the mean.</b> That is your reference point.</li>
<li><b>Work out each value’s deviation</b>: how far it sits from the mean, above or below.</li>
<li><b>Square the deviations</b>, so that values below the mean (negative deviations) cannot cancel values above it. Add the squares and divide by the count. The result is the <b>variance</b>.</li>
<li><b>Take the square root of the variance.</b> Squaring changed the units (days became days squared), and the root brings you back to the original units.</li>
</ol>
<p>The result, the <b>standard deviation</b>, has a friendly reading: <b>roughly how far a typical value is from the mean</b>. Because it is in the same units as the data, you can say “transit times typically stray about 2.9 days from the 5.5-day average”.</p>
<p>There is one fine point that causes confusion, because two answers appear in practice. In step 3, do you divide by <b>n</b>, the number of values, or by <b>n minus 1</b>?</p>
<ul>
<li>Divide by <b>n</b> when your data is the <b>whole population</b> you care about: every value that exists.</li>
<li>Divide by <b>n minus 1</b> when your data is a <b>sample</b> from a larger population, and you want to estimate the spread of that population. The mean you used in step 1 was computed from this very sample, which makes the deviations come out slightly too small, and dividing by n minus 1 corrects for it.</li>
</ul>
<p>In code this switch is the argument <code>ddof</code>, short for “delta degrees of freedom”: <code>ddof=0</code> divides by n and <code>ddof=1</code> divides by n minus 1. <b>Pandas uses <code>ddof=1</code> by default and NumPy uses <code>ddof=0</code>.</b> That is why the same column can give two slightly different answers, as you saw in Module 5 of the Python track. With thousands of values, the gap is tiny. With only a handful, it matters.</p>
<div class="callout watch"><b>The standard deviation is only as good as the shape.</b> A common rule says that about 68 percent of values lie within one standard deviation of the mean. That is true only for bell-shaped data. For skewed or flat data, the share differs, as you will see in a moment.</div>
<div class="callout analogy"><b>The average distance from home.</b> Imagine measuring how far each of your friends lives from the middle of town. The standard deviation is the “typical” distance. A small value means everyone lives near the centre, and a large one means they are scattered.</div>`
    },
    {
      type: 'try',
      title: 'The standard deviation, by hand and by machine',
      body: `<p>A tiny list of eight numbers, so that every step can be checked by eye: <code>2, 4, 4, 4, 5, 5, 7, 9</code>. The code goes through the four steps one at a time.</p>
<p>The mean is <b>5.0</b>. The deviations are -3, -1, -1, -1, 0, 0, 2 and 4. Squared, they are 9, 1, 1, 1, 0, 0, 4 and 16, which add to <b>32</b>. Dividing by n (8) gives a variance of <b>4.0</b> and a standard deviation of <b>2.0</b>. Dividing by n minus 1 (7) gives a variance of about <b>4.57</b> and a standard deviation of about <b>2.14</b>. The last two lines confirm both answers with Pandas, using <code>ddof</code>.</p>`,
      code: `import pandas as pd

x = pd.Series([2, 4, 4, 4, 5, 5, 7, 9])

mean = x.mean()
deviations = x - mean
squares = deviations ** 2

print(mean)
print(deviations.tolist())
print(squares.tolist(), squares.sum())
print("divide by n:", squares.sum() / len(x), (squares.sum() / len(x)) ** 0.5)
print("divide by n - 1:", round(squares.sum() / (len(x) - 1), 4), round((squares.sum() / (len(x) - 1)) ** 0.5, 4))
print(x.std(ddof=0), round(x.std(ddof=1), 4))
`
    },
    {
      id: 'st-1-2-ex2',
      type: 'exercise',
      title: 'Your turn: two standard deviations of the same column',
      body: `<p>The starter gives you <code>amount</code>, the payment amount of each of the 10,000 orders. Print its standard deviation twice, each rounded to 2 decimals: first dividing by <b>n</b> (<code>ddof=0</code>), then dividing by <b>n minus 1</b> (<code>ddof=1</code>).</p>
<p>You should see <code>115841.05</code> and then <code>115846.84</code>. With 10,000 values the two differ by only about 5 in 115,000, which is why large samples rarely worry about the choice.</p>
<p><b>Think before you type:</b> <code>amount.std(ddof=0)</code> and <code>amount.std(ddof=1)</code>.</p>`,
      starter: `import pandas as pd\n\namount = payments["amount"]\n\n# Write your code below\n`,
      hints: [
        `print(round(amount.std(ddof=0), 2)) and then print(round(amount.std(ddof=1), 2)).`,
        `import pandas as pd\n\namount = payments["amount"]\n\nprint(round(amount.std(ddof=0), 2))\nprint(round(amount.std(ddof=1), 2))\n`
      ],
      solution: `import pandas as pd\n\namount = payments["amount"]\n\nprint(round(amount.std(ddof=0), 2))\nprint(round(amount.std(ddof=1), 2))\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Quartiles and the interquartile range',
      body: `<p>The standard deviation uses every value and squares the deviations, so a few very large values can inflate it. When the data is skewed, you want a measure of spread that, like the median, pays attention to <b>order</b> rather than size. That measure is built from <b>quartiles</b>.</p>
<p>Line the data up from smallest to largest and cut it into four equal groups:</p>
<ul>
<li>The <b>first quartile (Q1)</b> is the value that a quarter of the data sits below.</li>
<li>The <b>second quartile</b> is the median, the halfway point.</li>
<li>The <b>third quartile (Q3)</b> is the value that three quarters of the data sits below.</li>
</ul>
<p>The <b>interquartile range</b>, written <b>IQR</b>, is <b>Q3 minus Q1</b>. It is the width of the <b>middle half</b> of the data: it ignores the lowest quarter and the highest quarter completely. A handful of extreme values cannot move it, because they live in the ignored quarters.</p>
<p>For TradeFlow’s order values, Q1 is about 73,308 and Q3 is about 216,219, so the IQR is about <b>142,911</b>. Half of all orders fall in a band that wide.</p>
<p>Quartiles are special cases of <b>percentiles</b>: the 25th percentile is Q1, the 50th is the median, the 75th is Q3. In Pandas, <code>.quantile(0.25)</code> gives the 25th percentile.</p>
<p>Which spread should you quote? Use this guide:</p>
<table class="mini">
<tr><th>Data</th><th>Prefer</th><th>Why</th></tr>
<tr><td>Roughly symmetric, few outliers</td><td>Mean and standard deviation</td><td>They use all the information and connect to many later tools</td></tr>
<tr><td>Skewed, or with outliers</td><td>Median and IQR</td><td>They describe the typical middle without being dragged by the tail</td></tr>
</table>
<p>One more reading of the standard deviation shows why shape matters. For TradeFlow’s order values, <b>74.1 percent</b> of orders sit within one standard deviation of the mean. For the delivery times, only <b>60.5 percent</b> do. Neither is the textbook 68 percent, because neither is bell-shaped: order values are skewed, and transit times are flat across 1 to 10 days. The “68 percent” rule belongs to the bell curve, which you will meet in Module 3.</p>
<div class="callout tip"><b>describe() gives you most of this at once.</b> <code>column.describe()</code> prints the count, mean, standard deviation, minimum, the three quartiles and the maximum. It is the first thing to run on any new column.</div>`
    },
    {
      type: 'try',
      title: 'describe, the IQR and the one-standard-deviation share',
      body: `<p>First <code>describe()</code> on the order amounts. Read it as a profile: <b>10,000</b> orders, a mean of <b>158,198</b>, a standard deviation of <b>115,847</b>, a minimum of 1,295 and a maximum of 1,071,797, with the quartiles in between.</p>
<p>Then the IQR, <b>142,911.28</b>. Then the two shares: <b>74.1</b> percent of order amounts lie within one standard deviation of the mean, and <b>60.5</b> percent of delivery times do. Neither is 68, because neither is bell-shaped.</p>`,
      code: `import pandas as pd

amount = payments["amount"]
transit = deliveries["transit_days"].dropna()

print(amount.describe().round(2))
print(round(amount.quantile(0.75) - amount.quantile(0.25), 2))
print(round(((amount - amount.mean()).abs() <= amount.std()).mean() * 100, 1))
print(round(((transit - transit.mean()).abs() <= transit.std()).mean() * 100, 1))
`
    },
    {
      id: 'st-1-2-ex3',
      type: 'exercise',
      title: 'Your turn: the middle half of delivery times',
      body: `<p>Using the starter’s <code>transit</code> series (delivery time in days), print the <b>first quartile</b>, the <b>third quartile</b> and the <b>interquartile range</b>, each on its own line.</p>
<p>You should see <code>3.0</code>, <code>8.0</code> and <code>5.0</code>. So the middle half of all deliveries take between 3 and 8 days, a band five days wide.</p>
<p><b>Think before you type:</b> <code>transit.quantile(0.25)</code> and <code>transit.quantile(0.75)</code>. The IQR is the difference between them.</p>`,
      starter: `import pandas as pd\n\ntransit = deliveries["transit_days"].dropna()\n\n# Write your code below\n`,
      hints: [
        `q1 = transit.quantile(0.25) and q3 = transit.quantile(0.75). Then print(q1), print(q3) and print(q3 - q1).`,
        `import pandas as pd\n\ntransit = deliveries["transit_days"].dropna()\n\nq1 = transit.quantile(0.25)\nq3 = transit.quantile(0.75)\nprint(q1)\nprint(q3)\nprint(q3 - q1)\n`
      ],
      solution: `import pandas as pd\n\ntransit = deliveries["transit_days"].dropna()\n\nq1 = transit.quantile(0.25)\nq3 = transit.quantile(0.75)\nprint(q1)\nprint(q3)\nprint(q3 - q1)\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Comparing spread across different units',
      body: `<p>The operations director asks a fair question: <i>“Which is more variable at TradeFlow: how long deliveries take, or how much orders are worth?”</i></p>
<p>You cannot answer it by comparing the standard deviations. The delivery standard deviation is 2.86 <b>days</b> and the order-value one is 115,847 <b>currency units</b>. Comparing 2.86 with 115,847 is meaningless, like asking whether a kilometre is bigger than a kilogram. Even for two columns in the same units, a standard deviation of 3 means something very different when the average is 10 than when it is 1,000.</p>
<p>The fix is to measure the spread <b>relative to the size of the typical value</b>. The tool is the <b>coefficient of variation</b>, usually written <b>CV</b>:</p>
<p><b>CV = standard deviation divided by the mean</b></p>
<p>It has no units, because the units cancel, so you can compare anything with anything. A CV of 0.1 means “the typical stray is about 10 percent of the average”. For TradeFlow:</p>
<table class="mini">
<tr><th>Column</th><th>Mean</th><th>Standard deviation</th><th>CV</th></tr>
<tr><td>Monthly revenue (millions)</td><td>37.67</td><td>3.07</td><td><b>0.08</b></td></tr>
<tr><td>Delivery time (days)</td><td>5.51</td><td>2.86</td><td><b>0.52</b></td></tr>
<tr><td>Order value</td><td>158,198</td><td>115,847</td><td><b>0.73</b></td></tr>
</table>
<p>Now the director’s question has an answer. <b>Order value is the most variable</b> relative to its size, delivery time comes next, and monthly revenue is the steadiest by far. A business with a monthly revenue CV of 0.08 is predictable in aggregate, even though its individual orders swing wildly. That is a very useful thing to know, and a CV makes it visible at once.</p>
<div class="callout watch"><b>Use CV only on positive, ratio-type data.</b> The CV divides by the mean, so it breaks when the mean is zero or close to it, and it makes little sense for values that can be negative, such as profit or temperature in degrees Celsius. For quantities that start at a true zero, such as money, days and counts, it is fine.</div>
<div class="callout tip"><b>Say it in words.</b> “Orders vary more than deliveries, relative to their size” is a statement an executive can use. “The standard deviation is bigger” is not, because it is not even a fair comparison.</div>`
    },
    {
      type: 'try',
      title: 'A table of coefficients of variation',
      body: `<p>The code builds the three series, puts their means and standard deviations in a small table, and adds the CV as a column. The CV for monthly revenue is <b>0.08</b>, for delivery time <b>0.52</b> and for order value <b>0.73</b>.</p>
<p>Two different units of measure (millions, days and plain currency) sit in one table, and the CV column puts them on equal footing. That is what a good summary statistic does.</p>`,
      code: `import pandas as pd

monthly = master.groupby(master["order_date"].dt.to_period("M"))["line_total"].sum() / 1000000
transit = deliveries["transit_days"].dropna()
amount = payments["amount"]

summary = pd.DataFrame({
    "mean": [monthly.mean(), transit.mean(), amount.mean()],
    "std": [monthly.std(), transit.std(), amount.std()],
}, index=["monthly revenue (millions)", "delivery time (days)", "order value"])
summary["cv"] = (summary["std"] / summary["mean"]).round(3)

print(summary.round(2))
`
    },
    {
      id: 'st-1-2-ex4',
      type: 'exercise',
      title: 'Your turn: price against quantity',
      body: `<p>On the order-line level, which varies more relative to its size: the <b>quantity</b> bought or the <b>unit price</b>? Using the master table, print the coefficient of variation of <code>quantity</code> and then of <code>unit_price</code>, each rounded to 3 decimals.</p>
<p>You should see <code>0.472</code> and then <code>0.861</code>. Prices vary far more, relative to their average, than quantities do.</p>
<p><b>Think before you type:</b> for each column the CV is <code>master["column"].std() / master["column"].mean()</code>. Wrap each in <code>round(..., 3)</code>.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `print(round(master["quantity"].std() / master["quantity"].mean(), 3)) and the same for "unit_price".`,
        `import pandas as pd\n\nprint(round(master["quantity"].std() / master["quantity"].mean(), 3))\nprint(round(master["unit_price"].std() / master["unit_price"].mean(), 3))\n`
      ],
      solution: `import pandas as pd\n\nprint(round(master["quantity"].std() / master["quantity"].mean(), 3))\nprint(round(master["unit_price"].std() / master["unit_price"].mean(), 3))\n`,
      ordered: true
    },
    {
      id: 'st-1-2-c1',
      type: 'check',
      title: 'TradeFlow’s mean order value is 158 thousand and its median is 128 thousand. The CEO asks, “What does a typical order look like?” Which figure is the better answer?',
      body: `<p>Think about which one is pulled by a small number of very large orders.</p>`,
      options: [
        'The mean, because every order counts in it, so it is always the best figure',
        'The median, because a few very large orders pull the mean up, and the median describes the middle order better',
        'The mode, because it is the most frequent value, and order values have a clear mode',
        'Neither, because averages should never be quoted'
      ],
      answer: 1,
      why: [
        'The mean does use every order, which makes it right for totals. But for a typical order in skewed data, that same sensitivity pulls it upward.',
        'Right! Order values have a long tail of large orders. They raise the mean but barely move the median, so the median is the better description of a typical order. It is good practice to quote the mean as well, and to say that they differ.',
        'Order values are almost all different from each other, so there is no meaningful mode. The mode is for categories or numbers with few distinct values.',
        'Averages are useful. The skill is choosing the right one and saying which it is.'
      ]
    },
    {
      type: 'explain',
      title: 'Which numbers resist outliers?',
      body: `<p>You have heard that the median “resists outliers” and the mean “does not”. Let us look at how big the difference is, with a real experiment on TradeFlow’s data. It is a good habit to test a claim before relying on it.</p>
<p>The experiment is simple: <b>remove the biggest 1 percent of orders</b>, that is, the top 100 of the 10,000, and see how much each summary changes. If a statistic is resistant to outliers, removing a few extreme values should hardly move it.</p>
<p>The cut-off is the 99th percentile, 529,242. Dropping the orders above it leaves 9,900 orders, and the results are:</p>
<table class="mini">
<tr><th>Statistic</th><th>Before</th><th>After removing the top 1%</th><th>Change</th></tr>
<tr><td>Mean</td><td>158,198</td><td>153,610</td><td><b>-2.9%</b></td></tr>
<tr><td>Median</td><td>127,828</td><td>126,657</td><td><b>-0.9%</b></td></tr>
<tr><td>Standard deviation</td><td>115,847</td><td>106,645</td><td><b>-7.9%</b></td></tr>
</table>
<p>The pattern is clear. The <b>median barely moves</b>: it shifts by under one percent. The <b>mean moves three times as much</b>. And the <b>standard deviation moves most of all</b>, by nearly eight percent, because it squares the deviations, so the largest values carry the most weight.</p>
<p>That gives you a practical rule. When the data has outliers or a long tail, the median and the IQR describe the typical middle steadily, while the mean and the standard deviation are strongly shaped by a few extreme values. Neither is “wrong”. They answer different questions: the mean answers “what is the total per order?” and the median answers “what is a typical order?”.</p>
<div class="callout watch"><b>Do not delete outliers just to tidy the numbers.</b> The top 1 percent of orders are real purchases, and they carry real revenue. Removing them is an experiment to show how a statistic behaves, not a cleaning step. Whether to exclude an extreme value is a decision for the question you are asking, and it must be stated, never hidden.</div>`
    },
    {
      type: 'try',
      title: 'Removing the top 1% of orders',
      body: `<p>The code finds the 99th percentile with <code>.quantile(0.99)</code> and keeps the orders at or below it. Then it prints the mean, the median and the standard deviation before and after.</p>
<p>The cut-off is <b>529,242.25</b>, and <b>9,900</b> orders remain. The mean moves from 158,198.15 to 153,609.69, the median from 127,828.29 to 126,656.58 and the standard deviation from 115,846.84 to 106,644.65. Compare these shifts with the percentage changes in the table above.</p>`,
      code: `import pandas as pd

amount = payments["amount"]
cut = amount.quantile(0.99)
trimmed = amount[amount <= cut]

print(round(cut, 2), len(trimmed))
print(round(amount.mean(), 2), round(trimmed.mean(), 2))
print(round(amount.median(), 2), round(trimmed.median(), 2))
print(round(amount.std(), 2), round(trimmed.std(), 2))
`
    },
    {
      id: 'st-1-2-ex5',
      type: 'exercise',
      title: 'Challenge: how much does each statistic move?',
      body: `<p>The starter builds <code>amount</code> (the 10,000 order amounts). Remove the <b>top 1 percent</b> of orders (keep those at or below the 99th percentile), then print the <b>percentage change</b> caused by that removal in the <b>mean</b>, the <b>median</b> and the <b>standard deviation</b>, in that order, each rounded to 2 decimals. A percentage change is <code>(after / before - 1) * 100</code>.</p>
<p>You should see <code>-2.9</code>, <code>-0.92</code> and <code>-7.94</code>.</p>
<p><b>Think before you type:</b> make <code>trimmed = amount[amount &lt;= amount.quantile(0.99)]</code>. Write a small function <code>pct_change(before, after)</code> and call it three times, once for each statistic. Compare the same statistic before and after, for example <code>amount.mean()</code> against <code>trimmed.mean()</code>.</p>`,
      starter: `import pandas as pd\n\namount = payments["amount"]\n\n# Write your code below\n`,
      hints: [
        `trimmed = amount[amount <= amount.quantile(0.99)]. def pct_change(before, after): return round((after / before - 1) * 100, 2). Then print(pct_change(amount.mean(), trimmed.mean())) and the same for median and std.`,
        `import pandas as pd\n\namount = payments["amount"]\n\ntrimmed = amount[amount <= amount.quantile(0.99)]\n\ndef pct_change(before, after):\n    return round((after / before - 1) * 100, 2)\n\nprint(pct_change(amount.mean(), trimmed.mean()))\nprint(pct_change(amount.median(), trimmed.median()))\nprint(pct_change(amount.std(), trimmed.std()))\n`
      ],
      solution: `import pandas as pd\n\namount = payments["amount"]\n\ntrimmed = amount[amount <= amount.quantile(0.99)]\n\ndef pct_change(before, after):\n    return round((after / before - 1) * 100, 2)\n\nprint(pct_change(amount.mean(), trimmed.mean()))\nprint(pct_change(amount.median(), trimmed.median()))\nprint(pct_change(amount.std(), trimmed.std()))\n`,
      ordered: true
    },
    {
      id: 'st-1-2-c2',
      type: 'check',
      title: 'Pandas gives a standard deviation of 115,846.84 for the order amounts, and NumPy gives 115,841.05 for the same column. Why do they differ?',
      body: `<p>Remember the fine point in step 3 of the standard deviation.</p>`,
      options: [
        'One of them has a bug',
        'They use different rounding rules',
        'Pandas divides by n minus 1 by default (treating the data as a sample) and NumPy divides by n (treating it as the whole population)',
        'Pandas ignores the largest values'
      ],
      answer: 2,
      why: [
        'Neither has a bug. Both are correct for what they compute.',
        'Rounding is not the cause. The unrounded values differ.',
        'Right! The argument <code>ddof</code> decides the divisor: <code>ddof=1</code> divides by n minus 1 and <code>ddof=0</code> divides by n. Pandas defaults to 1 and NumPy to 0, so you must know which one you are getting. With 10,000 values the gap is tiny.',
        'Neither tool ignores values. They use every value, and only the divisor differs.'
      ]
    },
    {
      id: 'st-1-2-c3',
      type: 'check',
      title: 'Delivery times have a mean of 5.5 days and a standard deviation of 2.9 days. Order values have a mean of 158 thousand and a standard deviation of 116 thousand. Which is more variable?',
      body: `<p>The two standard deviations are in different units, so they cannot be compared directly.</p>`,
      options: [
        'Order value, because its coefficient of variation (0.73) is larger than that of delivery time (0.52)',
        'Delivery time, because 2.9 is a smaller number than 116 thousand, which means it must vary more',
        'Order value, because 116 thousand is a larger number than 2.9',
        'They cannot be compared in any way'
      ],
      answer: 0,
      why: [
        'Right! The coefficient of variation divides each standard deviation by its own mean, so the units cancel. 0.73 against 0.52 says that order values stray proportionally further from their average than delivery times do.',
        'The size of a standard deviation depends on the units. A small number in days says nothing about a large number in currency.',
        'The conclusion happens to be right, but the reasoning is wrong. Comparing 116 thousand with 2.9 is meaningless because the units differ. The coefficient of variation is the fair comparison.',
        'They can be compared fairly, once you express each spread relative to its own average, which is what the coefficient of variation does.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You now know how to describe a column of numbers properly, with both of the answers it needs. You can:</p>
<ul>
<li>Explain why a <b>centre needs a spread</b>, and show with an example how two columns with the same mean can behave completely differently</li>
<li>Choose between the <b>mean, the median and the mode</b>, and say which is pulled by extreme values</li>
<li>Build the <b>standard deviation</b> from deviations, squares and a square root, and read it as a typical distance from the mean</li>
<li>Explain the <b>n against n minus 1</b> choice, and set it with <code>ddof</code> in Pandas and NumPy</li>
<li>Use <b>quartiles and the interquartile range</b> for skewed data, and run <code>describe()</code> as a first look</li>
<li>Compare spread across different units with the <b>coefficient of variation</b></li>
<li>Test how much each statistic is moved by outliers, and explain why the <b>median and IQR resist them</b></li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>When would you report the median instead of the mean?</li>
<li>What does a standard deviation tell you, and why do some formulas divide by n minus 1?</li>
<li>How would you compare the variability of delivery time in days with the variability of order value in money?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> When the data is skewed or has outliers, because a few very large values pull the mean away from a typical case while the median stays in the middle. Order values and incomes are good examples. I would mention the mean as well when the two differ, since the gap itself tells the reader the data is lopsided, and since the mean is the right figure for totals.</p>
<p><b>2.</b> The standard deviation is roughly how far a typical value lies from the mean, in the same units as the data. It is the square root of the average squared deviation. When the data is a sample from a bigger population, the deviations are measured from a mean that was estimated from the same sample, which makes them slightly too small, so the sum of squares is divided by n minus 1 instead of n to correct for that. With large samples the difference is negligible.</p>
<p><b>3.</b> Their standard deviations are in different units, so I would not compare them directly. I would compute the coefficient of variation for each, the standard deviation divided by the mean, which has no units. A larger coefficient means more variability relative to the typical size. At TradeFlow that gives about 0.73 for order value and 0.52 for delivery time, so order value is the more variable of the two.</p>
</details>
<p><b>Coming next, in lesson 1.3:</b> shape, skew and outliers. Centre and spread describe where the data sits and how widely it scatters. The next lesson adds the third ingredient, the <b>shape</b>: whether the data is symmetric or lopsided, how to measure it, how to spot outliers with a rule rather than a guess, and what to do about them without fooling yourself.</p>`
    }
  ]
}
);
