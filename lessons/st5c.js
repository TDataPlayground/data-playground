LESSONS.push(
{
 "id": "st-5-3",
 "track": "statistics",
 "lang": "python",
 "packages": [
  "pandas",
  "numpy",
  "scipy",
  "matplotlib"
 ],
 "loopGuard": true,
 "files": [
  "orders",
  "customers",
  "payments",
  "deliveries"
 ],
 "setup": "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom scipy import stats\n\norders = pd.read_csv(\"orders.csv\")\ncustomers = pd.read_csv(\"customers.csv\")\npayments = pd.read_csv(\"payments.csv\")\ndeliveries = pd.read_csv(\"deliveries.csv\")\n\norders[\"order_date\"] = pd.to_datetime(orders[\"order_date\"], errors=\"coerce\")\norders[\"year\"] = orders[\"order_date\"].dt.year\norders[\"first_half\"] = orders[\"order_date\"].dt.month <= 6\norders[\"cancelled\"] = orders[\"order_status\"] == \"Cancelled\"\n\n# master: one row per order, with the customer's country and the payment method.\nmaster = (\n    orders.merge(customers[[\"customer_id\", \"country\"]], on=\"customer_id\", validate=\"many_to_one\")\n    .merge(payments[[\"order_id\", \"payment_method\"]], on=\"order_id\", validate=\"one_to_one\")\n)\n\n# deliv: one row per delivery record, with the customer's country.\ndeliv = deliveries.merge(master[[\"order_id\", \"country\"]], on=\"order_id\", validate=\"many_to_one\")\n",
 "preloaded": [
  "master",
  "deliv",
  "stats"
 ],
 "title": "5.3 Testing proportions and categories: z-tests and the chi-square test",
 "tables": [],
 "intro": "TradeFlow's Customer Care Director has a rule: <b>cancelled orders must stay at or below 5% of all orders</b>. She has two worries. First, is the company really meeting that target? Second, cancellations in the first half of 2026 <i>look</i> higher than in previous years. Is that a real deterioration, or just the normal ups and downs?<br><br>Meanwhile the Payments lead wonders whether the way a customer pays has anything to do with what happens to their order (completed, cancelled, returned, still processing).<br><br>None of these questions is about an <i>average</i>. They are about <b>proportions</b> (“what share of orders were cancelled?”) and <b>categories</b> (“is order status related to payment method?”). Lesson 5.2's t-tests do not fit. In this lesson you will learn three tools that do: the <b>one-proportion test</b> (a share against a target), the <b>two-proportion test</b> (a share in one group against another) and the <b>chi-square test of independence</b> (are two category columns related?). As always, you will build the formulas from first principles in code before using SciPy.",
 "steps": [
  {
   "type": "explain",
   "title": "Counting yes/no outcomes: proportions",
   "body": "<p>A <b>proportion</b> is the share of rows that have a particular property. For TradeFlow: the proportion of orders that were cancelled. If 529 of 10,000 orders were cancelled, the sample proportion, written <b>p̂</b> (“p-hat”), is 529 ÷ 10,000 = 0.0529, or 5.29%.</p>\n<p>The Customer Care Director's target is 5%. We write the target as <b>p₀</b> (“p-zero”). The hypotheses are:</p>\n<p><b>H₀:</b> the true cancellation rate is 5% (p = 0.05). <b>H₁:</b> the true rate is different from 5%.</p>\n<p>As in every test, the statistic is <b>signal ÷ noise</b>. The signal is the gap p̂ − p₀. The noise is the standard error: how much a sample proportion wobbles by luck alone. For a yes/no outcome this has a neat formula:</p>\n<p style=\"text-align:center\"><b>standard error = √( p₀ × (1 − p₀) ÷ n )</b></p>\n<p>Notice we do not need to estimate a separate standard deviation. For yes/no data, the spread is fixed once you know the proportion. (That is also why we use the normal curve and a <b>z</b> statistic here, not the t distribution.) We use the <i>target</i> p₀ in the formula because the test pretends H₀ is true, and under H₀ the rate is 5%.</p>\n<div class=\"callout analogy\"><b>Think of flipping a slightly biased coin.</b> If a coin lands heads 5% of the time and you flip it 10,000 times, you expect about 500 heads, but not exactly 500. The standard error tells you the typical size of the miss. Our real count is 529. The question is whether a miss of 29 is typical of luck or too big for it.</div>"
  },
  {
   "type": "try",
   "title": "Test the 5% target",
   "body": "<p>Run the box, then read the explanation. It does the test two ways: by hand with the z formula, and with SciPy's <b>exact binomial test</b> (which counts coin-flip outcomes directly and does not rely on the bell curve).</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>n = len(master)</code>: <code>master</code> has one row per order. <code>len</code> counts the rows: 10,000 orders.</li><li><code>cancelled = master[\"cancelled\"].sum()</code>: <code>cancelled</code> is a True/False column (True when the order status is Cancelled). Python counts True as 1, so <code>.sum()</code> counts the cancelled orders.</li><li><code>p_hat = cancelled / n</code>: The sample proportion: cancelled orders divided by all orders.</li><li><code>target = 0.05</code>: The Customer Care Director's rule, 5% written as a decimal.</li><li><code>std_error = np.sqrt(target * (1 - target) / n)</code>: The noise: the typical wobble of a sample proportion if the true rate were exactly the target.</li><li><code>z = (p_hat - target) / std_error</code>: Signal over noise: how many standard errors our rate sits from the target.</li><li><code>p_value = 2 * stats.norm.sf(abs(z))</code>: <code>stats.norm.sf(x)</code> gives the area in the right tail of the normal curve beyond x. We take <code>abs(z)</code> and multiply by 2 to count both tails, which makes this a two-sided p-value.</li><li><code>stats.binomtest(int(cancelled), n, target)</code>: The exact test: out of n orders, how likely is a count this far from 500 if each order has a 5% chance of cancelling? <code>int(...)</code> turns the count into a whole number, which this function requires.</li><li><code>exact.proportion_ci(confidence_level=0.95)</code>: A 95% confidence interval for the true cancellation rate: the range of rates that are plausible given our data.</li></ol>\n<p>Read the results: z ≈ 1.33 and p ≈ 0.18. The z-test and the exact test agree to three decimals.</p>",
   "code": "n = len(master)\ncancelled = master[\"cancelled\"].sum()\np_hat = cancelled / n\ntarget = 0.05\n\nstd_error = np.sqrt(target * (1 - target) / n)\nz = (p_hat - target) / std_error\np_value = 2 * stats.norm.sf(abs(z))\n\nexact = stats.binomtest(int(cancelled), n, target)\n\nprint(\"Orders:\", n)\nprint(\"Cancelled orders:\", cancelled)\nprint(\"Cancellation rate:\", round(p_hat, 4))\nprint(\"z statistic:\", round(z, 3))\nprint(\"p-value (z-test):\", round(p_value, 4))\nprint(\"p-value (exact binomial test):\", round(exact.pvalue, 4))\nlow, high = exact.proportion_ci(confidence_level=0.95)\nprint(\"95% interval for the true rate:\", (round(low, 4), round(high, 4)))\n"
  },
  {
   "type": "try",
   "title": "First look at the pattern over time",
   "body": "<p>Before testing the 2026 worry, always look at the data. This chart shows the cancellation rate for the first half (January to June) of each year, with the 5% target as a red line. We compare January to June only because 2026 contains no orders after June. Comparing six months with twelve would mix in seasonal differences.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>first_half = master[master[\"first_half\"]]</code>: Keep only orders placed between January and June. Putting a True/False column inside the square brackets keeps the rows where it is True.</li><li><code>rate_by_year = first_half.groupby(\"year\")[\"cancelled\"].mean()</code>: Group the orders by year, and for each year take the mean of the cancelled column. The mean of a True/False column is the share that are True, which is exactly the cancellation rate.</li><li><code>plt.bar(..., rate_by_year.values * 100, ...)</code>: Draw one bar per year. Multiplying by 100 shows percentages.</li><li><code>plt.axhline(5, ...)</code>: Draw a horizontal red line at 5%, the target.</li></ol>\n<p>What stands out: the rates move around from year to year (4.78%, 5.83%, 4.18%), and 2026 is the highest at 6.54%. Is 2026's rise more than ordinary movement? We will test it.</p>",
   "code": "first_half = master[master[\"first_half\"]]\nrate_by_year = first_half.groupby(\"year\")[\"cancelled\"].mean()\n\nplt.bar(rate_by_year.index.astype(str), rate_by_year.values * 100, color=\"#4fc3f7\")\nplt.axhline(5, color=\"#ff7b7b\", linewidth=2, label=\"5% target\")\nplt.title(\"Cancellation rate, January to June of each year\")\nplt.xlabel(\"Year\")\nplt.ylabel(\"Cancelled orders (%)\")\nplt.legend()\nplt.show()\n\nprint((rate_by_year * 100).round(2))\n"
  },
  {
   "type": "explain",
   "title": "Comparing two proportions",
   "body": "<p>To test “is 2026 worse than before?” we compare two proportions. In H₀ language: <b>H₀:</b> the true cancellation rate is the same in 2026 as in earlier January-to-June periods. <b>H₁:</b> the rates differ.</p>\n<p>We use the same signal ÷ noise recipe. Signal: p̂₁ − p̂₂ (2026 rate minus earlier rate). Noise: the standard error of that gap. Because H₀ says both groups share <i>one</i> true rate, we estimate that shared rate by <b>pooling</b> the two groups into one:</p>\n<p style=\"text-align:center\"><b>pooled p = (c₁ + c₂) ÷ (n₁ + n₂)</b>, and <b>standard error = √( pooled p × (1 − pooled p) × (1/n₁ + 1/n₂) )</b></p>\n<p>Here c₁ and c₂ are the counts of cancelled orders and n₁ and n₂ are the numbers of orders in the two groups. Read the standard error like this: “the wobble of one rate, built from the shared proportion, with a bigger wobble when either group is small”.</p>\n<div class=\"callout watch\"><b>Compare like with like.</b> Why only January to June of earlier years? Because 2026 only covers January to June. If cancellations were seasonal (higher in the second half of the year), comparing 2026 with whole earlier years would blame a seasonal pattern on a “deterioration”. Choosing the right baseline is half of the analysis.</div>\n<p>After the test we also want a <b>confidence interval for the gap</b>, using the unpooled standard error √( p̂₁(1−p̂₁)/n₁ + p̂₂(1−p̂₂)/n₂ ), because for an interval we are not pretending the rates are equal.</p>"
  },
  {
   "type": "try",
   "title": "Is 2026 really worse? The two-proportion test",
   "body": "<p>This box compares the January-to-June 2026 cancellation rate with the January-to-June rate of 2023 to 2025 combined.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>recent = master[master[\"year\"] == 2026]</code>: Orders placed in 2026 (all of them fall between January and June).</li><li><code>earlier = master[(master[\"year\"] &lt; 2026) &amp; master[\"first_half\"]]</code>: Orders from earlier years, but only those placed January to June. The <code>&amp;</code> means “and”: both conditions must hold. The brackets around each condition are required.</li><li><code>c1, n1 = recent[\"cancelled\"].sum(), len(recent)</code>: For 2026: the number of cancelled orders (c1) and the number of orders (n1), stored together in one line.</li><li><code>p1, p2 = c1 / n1, c2 / n2</code>: The two cancellation rates.</li><li><code>pooled = (c1 + c2) / (n1 + n2)</code>: The shared rate H₀ talks about: all the cancelled orders divided by all the orders, ignoring which group they came from.</li><li><code>std_error = np.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))</code>: The noise of the gap between two proportions.</li><li><code>z = (p1 - p2) / std_error</code>: Signal over noise.</li><li><code>se_gap = np.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)</code>: The unpooled version of the noise, used only for the confidence interval.</li><li><code>low = (p1 - p2) - 1.96 * se_gap</code>: The lower end of the 95% interval: the gap minus 1.96 standard errors. The upper end adds 1.96 standard errors instead.</li></ol>\n<p>The p-value is about 0.019, which is below 0.05, so at α = 0.05 we <b>reject H₀</b>. The gap is about 1.6 percentage points and its 95% interval runs from 0.2 to 3.1 points. In plain words: January-to-June cancellations in 2026 are higher than in earlier years, and this is unlikely to be luck alone. The size is modest, and the interval shows the true gap could be as small as a sixth of a point or as large as three points.</p>",
   "code": "recent = master[master[\"year\"] == 2026]\nearlier = master[(master[\"year\"] < 2026) & master[\"first_half\"]]\n\nc1, n1 = recent[\"cancelled\"].sum(), len(recent)\nc2, n2 = earlier[\"cancelled\"].sum(), len(earlier)\np1, p2 = c1 / n1, c2 / n2\n\npooled = (c1 + c2) / (n1 + n2)\nstd_error = np.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))\nz = (p1 - p2) / std_error\np_value = 2 * stats.norm.sf(abs(z))\n\nse_gap = np.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)\nlow = (p1 - p2) - 1.96 * se_gap\nhigh = (p1 - p2) + 1.96 * se_gap\n\nprint(\"2026 (Jan-Jun):\", c1, \"of\", n1, \"cancelled =\", round(p1 * 100, 2), \"%\")\nprint(\"Earlier Jan-Jun periods:\", c2, \"of\", n2, \"cancelled =\", round(p2 * 100, 2), \"%\")\nprint(\"Gap in percentage points:\", round((p1 - p2) * 100, 2))\nprint(\"z statistic:\", round(z, 3))\nprint(\"p-value (two-sided):\", round(p_value, 4))\nprint(\"95% interval for the gap (points):\", (round(low * 100, 2), round(high * 100, 2)))\n"
  },
  {
   "id": "st-5-3-c1",
   "type": "check",
   "title": "The 2026 versus earlier comparison gave z ≈ 2.34 and p ≈ 0.019. What can you say to the Customer Care Director?",
   "body": "<p>Use α = 0.05 and remember what a test can and cannot show.</p>",
   "options": [
    "The test proves that a change in the cancellation process caused the increase",
    "January-to-June 2026 cancellations are higher than in earlier years by a margin unlikely to be luck alone, but the test does not tell us why, and the gap is modest",
    "There is a 1.9% chance that the true rates are equal",
    "Cancellation rates are now above 5%, so we have broken our target"
   ],
   "answer": 1,
   "why": [
    "A test of a difference says nothing about cause. Many things could explain it: pricing, stock, a promotion, a change in who buys.",
    "Correct. It rejects “no change” but explains nothing, and the interval shows how small the gap might be.",
    "The p-value is not the probability that H₀ is true. It is how surprising the data would be if H₀ were true.",
    "The target test in the first box looked at all years. Whether 2026 alone is above 5% is a different question that this test did not answer."
   ]
  },
  {
   "id": "st-5-3-ex1",
   "type": "exercise",
   "title": "Your turn: the z statistic for the 5% target",
   "body": "<p>Calculate the z statistic for testing whether the overall cancellation rate differs from the 5% target. Use the <code>master</code> table, the target 0.05 and the standard error formula √( p₀ × (1 − p₀) ÷ n ). Print z rounded to 3 decimals.</p>\n<p>Your output should be <code>1.331</code>.</p>\n<p><b>Think before you type:</b> signal over noise. Signal: the observed proportion minus the target. Noise: the standard error that uses the <i>target</i>, not the observed rate.</p>\n<p><b>Python connection:</b> <code>master[\"cancelled\"].sum()</code> counts the cancelled orders. <code>np.sqrt(x)</code> is the square root.</p>",
   "starter": "# master, np and stats are already loaded\n\n# Write your code below\n",
   "hints": [
    "p_hat = master[\"cancelled\"].sum() / len(master); std_error = np.sqrt(0.05 * 0.95 / len(master)); z = (p_hat - 0.05) / std_error.",
    "n = len(master)\np_hat = master[\"cancelled\"].sum() / n\ntarget = 0.05\nstd_error = np.sqrt(target * (1 - target) / n)\nz = (p_hat - target) / std_error\nprint(round(z, 3))\n"
   ],
   "solution": "n = len(master)\np_hat = master[\"cancelled\"].sum() / n\ntarget = 0.05\nstd_error = np.sqrt(target * (1 - target) / n)\nz = (p_hat - target) / std_error\nprint(round(z, 3))\n",
   "ordered": true
  },
  {
   "id": "st-5-3-ex2",
   "type": "exercise",
   "title": "Your turn: the exact binomial test",
   "body": "<p>Use <code>stats.binomtest</code> to test the same claim exactly. Print the two-sided p-value rounded to 4 decimals.</p>\n<p>Your output should be <code>0.1833</code>.</p>\n<p><b>Python connection:</b> <code>stats.binomtest(k, n, p)</code> takes the count of successes <code>k</code> (a whole number, so wrap the sum in <code>int(...)</code>), the number of trials <code>n</code> and the claimed probability <code>p</code>. The answer object has a <code>.pvalue</code> part.</p>",
   "starter": "# master and stats are already loaded\n\n# Write your code below\n",
   "hints": [
    "cancelled = int(master[\"cancelled\"].sum()); result = stats.binomtest(cancelled, len(master), 0.05); print(round(result.pvalue, 4)).",
    "cancelled = int(master[\"cancelled\"].sum())\nresult = stats.binomtest(cancelled, len(master), 0.05)\nprint(round(result.pvalue, 4))\n"
   ],
   "solution": "cancelled = int(master[\"cancelled\"].sum())\nresult = stats.binomtest(cancelled, len(master), 0.05)\nprint(round(result.pvalue, 4))\n",
   "ordered": true
  },
  {
   "id": "st-5-3-ex3",
   "type": "exercise",
   "title": "Your turn: 2026 against earlier years",
   "body": "<p>Run the two-proportion test yourself. Group 1 is all 2026 orders. Group 2 is orders from 2023 to 2025 placed January to June. Print two lines: the z statistic (3 decimals), then the two-sided p-value (4 decimals).</p>\n<p>Your output should be <code>2.342</code> then <code>0.0192</code>.</p>\n<p><b>Think before you type:</b> count the cancelled orders and the orders in each group, pool them to get one shared rate, build the standard error from that, then divide the gap by it.</p>",
   "starter": "# master, np and stats are already loaded\nrecent = master[master[\"year\"] == 2026]\nearlier = master[(master[\"year\"] < 2026) & master[\"first_half\"]]\n\n# Write your code below\n",
   "hints": [
    "c1, n1 = recent[\"cancelled\"].sum(), len(recent) and the same for earlier. pooled = (c1 + c2) / (n1 + n2). std_error = np.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2)).",
    "recent = master[master[\"year\"] == 2026]\nearlier = master[(master[\"year\"] < 2026) & master[\"first_half\"]]\n\nc1, n1 = recent[\"cancelled\"].sum(), len(recent)\nc2, n2 = earlier[\"cancelled\"].sum(), len(earlier)\n\npooled = (c1 + c2) / (n1 + n2)\nstd_error = np.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))\nz = (c1 / n1 - c2 / n2) / std_error\np_value = 2 * stats.norm.sf(abs(z))\n\nprint(round(z, 3))\nprint(round(p_value, 4))\n"
   ],
   "solution": "recent = master[master[\"year\"] == 2026]\nearlier = master[(master[\"year\"] < 2026) & master[\"first_half\"]]\n\nc1, n1 = recent[\"cancelled\"].sum(), len(recent)\nc2, n2 = earlier[\"cancelled\"].sum(), len(earlier)\n\npooled = (c1 + c2) / (n1 + n2)\nstd_error = np.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))\nz = (c1 / n1 - c2 / n2) / std_error\np_value = 2 * stats.norm.sf(abs(z))\n\nprint(round(z, 3))\nprint(round(p_value, 4))\n",
   "ordered": true
  },
  {
   "type": "explain",
   "title": "Are two category columns related? The chi-square test",
   "body": "<p>Now the Payments lead's question: is <b>order status</b> (Completed, Cancelled, Returned, Processing) related to <b>payment method</b> (Card, Bank Transfer, Mobile Money, Cash on Delivery)? Both columns are <b>categories</b>, so we cannot average them. Instead we count how many orders fall in each combination. A table of counts like this is called a <b>contingency table</b> (or cross-tab).</p>\n<p><b>H₀:</b> status and payment method are <b>independent</b>: knowing how someone paid tells you nothing about what happened to the order. <b>H₁:</b> they are related.</p>\n<p>The idea is beautifully simple. If H₀ is true, we can calculate how many orders we <i>would expect</i> in each cell of the table. Then we measure how far the real counts are from those expectations.</p>\n<ul><li><b>Expected count for a cell</b> = (row total × column total) ÷ grand total. Think: if 5.29% of all orders are cancelled and 25.2% of all orders were paid by card, then under independence about 5.29% of 25.2% of all orders should be cancelled card orders.</li>\n<li><b>Chi-square statistic</b> χ² = the sum over all cells of (observed − expected)² ÷ expected. Each cell adds a bit when its real count differs from its expected count. We square the difference so that misses in either direction add up instead of cancelling, and divide by the expected count so that a miss of 10 matters more in a small cell than in a huge one.</li>\n<li><b>Degrees of freedom</b> = (rows − 1) × (columns − 1). For 4 statuses and 4 payment methods that is 3 × 3 = 9. It says how many cells of the table are “free” once the row and column totals are fixed.</li></ul>\n<div class=\"callout analogy\"><b>Think of a seating plan.</b> Imagine a wedding where guests were seated at random. You would expect each table to have roughly the same mix of the bride's and groom's families. The chi-square statistic measures how far the real seating is from “mixed at random”. A small value means about what chance produces. A big value means clustering that chance rarely creates.</div>\n<p>The p-value is then the chance of a χ² at least this large if H₀ were true. Like the t distribution, the chi-square distribution depends on the degrees of freedom, and SciPy looks it up for us.</p>"
  },
  {
   "type": "try",
   "title": "Is order status related to payment method?",
   "body": "<p>SciPy does the whole calculation in one call. We also print the expected counts so you can see exactly what the test compares.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>table = pd.crosstab(master[\"order_status\"], master[\"payment_method\"])</code>: <code>pd.crosstab</code> counts how many orders fall into each combination of the two columns: statuses down the side, payment methods across the top.</li><li><code>chi2, p_value, dof, expected = stats.chi2_contingency(table)</code>: One call returns four things: the chi-square statistic, the p-value, the degrees of freedom and a table of expected counts. Writing four names on the left stores each one.</li><li><code>expected = pd.DataFrame(expected, index=table.index, columns=table.columns)</code>: SciPy gives the expected counts as a bare array. This line puts the row and column labels back on, so the table is readable.</li><li><code>expected.round(1)</code>: Round the expected counts to one decimal place. They are rarely whole numbers, and that is fine: an expectation is an average.</li></ol>\n<p>The statistic is 8.26 with 9 degrees of freedom, and the p-value is 0.51. Compare the two tables: for example, 129 Cancelled orders were paid by Card against 133.5 expected. That is close, and so is nearly every other cell. We <b>fail to reject H₀</b>: there is no evidence that payment method is related to order status.</p>",
   "code": "table = pd.crosstab(master[\"order_status\"], master[\"payment_method\"])\nchi2, p_value, dof, expected = stats.chi2_contingency(table)\nexpected = pd.DataFrame(expected, index=table.index, columns=table.columns)\n\nprint(\"Observed counts:\")\nprint(table)\nprint()\nprint(\"Expected counts if status and payment method were unrelated:\")\nprint(expected.round(1))\nprint()\nprint(\"chi-square statistic:\", round(chi2, 2))\nprint(\"degrees of freedom:\", dof)\nprint(\"p-value:\", round(p_value, 4))\n"
  },
  {
   "id": "st-5-3-c2",
   "type": "check",
   "title": "The chi-square test gave χ² ≈ 8.3, df = 9, p ≈ 0.51. What does this mean for the Payments lead?",
   "body": "<p>Think about what H₀ says and what “fail to reject” means.</p>",
   "options": [
    "Payment method has no effect at all on order outcomes",
    "The data gives no evidence that order status depends on payment method: the observed counts are about what independence would produce",
    "The result proves that Card customers cancel exactly as often as Cash on Delivery customers",
    "The test is invalid because p-values above 0.05 cannot be trusted"
   ],
   "answer": 1,
   "why": [
    "“No effect at all” is too strong. A small real relationship could exist that this data cannot detect.",
    "Correct. We found no evidence of a relationship. That is different from proving there is none.",
    "Exact equality cannot be proven. The observed rates differ a little, and the test says that is consistent with luck.",
    "p-values above 0.05 are perfectly valid. They just mean the data does not provide enough evidence against H₀."
   ]
  },
  {
   "id": "st-5-3-ex4",
   "type": "exercise",
   "title": "Your turn: is delivery status related to country?",
   "body": "<p>The <code>deliv</code> table has one row per delivery record, with <code>delivery_status</code> (Delivered, Delayed, In Transit, Failed) and the customer's <code>country</code>. Test whether delivery status is independent of country. Build the cross-tab, run <code>stats.chi2_contingency</code>, and print two lines: the chi-square statistic (2 decimals), then the p-value (4 decimals).</p>\n<p>Your output should be <code>7.42</code> then <code>0.8286</code>.</p>\n<p><b>Python connection:</b> <code>pd.crosstab(a, b)</code> counts combinations. <code>stats.chi2_contingency(table)</code> returns four values; you only need the first two, but you must still unpack all four (<code>chi2, p_value, dof, expected = ...</code>).</p>",
   "starter": "# deliv, pd and stats are already loaded\n\n# Write your code below\n",
   "hints": [
    "table = pd.crosstab(deliv[\"delivery_status\"], deliv[\"country\"]), then chi2, p_value, dof, expected = stats.chi2_contingency(table).",
    "table = pd.crosstab(deliv[\"delivery_status\"], deliv[\"country\"])\nchi2, p_value, dof, expected = stats.chi2_contingency(table)\nprint(round(chi2, 2))\nprint(round(p_value, 4))\n"
   ],
   "solution": "table = pd.crosstab(deliv[\"delivery_status\"], deliv[\"country\"])\nchi2, p_value, dof, expected = stats.chi2_contingency(table)\nprint(round(chi2, 2))\nprint(round(p_value, 4))\n",
   "ordered": true
  },
  {
   "id": "st-5-3-ex5",
   "type": "exercise",
   "title": "Your turn: one expected count by hand",
   "body": "<p>Calculate by hand the number of <b>Cancelled</b> orders we would <i>expect</i> to be paid by <b>Card</b> if status and payment method were independent. Use (row total × column total) ÷ grand total from the cross-tab of <code>order_status</code> and <code>payment_method</code>. Print the result rounded to 1 decimal.</p>\n<p>Your output should be <code>133.5</code>.</p>\n<p><b>Think before you type:</b> the row total is all Cancelled orders (529). The column total is all Card orders (2,523). The grand total is every order (10,000).</p>\n<p><b>Python connection:</b> <code>table.loc[\"Cancelled\"].sum()</code> adds up the Cancelled row. <code>table[\"Card\"].sum()</code> adds up the Card column. <code>table.to_numpy().sum()</code> adds up every cell.</p>",
   "starter": "# master and pd are already loaded\ntable = pd.crosstab(master[\"order_status\"], master[\"payment_method\"])\n\n# Write your code below\n",
   "hints": [
    "row_total = table.loc[\"Cancelled\"].sum(); column_total = table[\"Card\"].sum(); grand_total = table.to_numpy().sum(). Then row_total * column_total / grand_total.",
    "table = pd.crosstab(master[\"order_status\"], master[\"payment_method\"])\nrow_total = table.loc[\"Cancelled\"].sum()\ncolumn_total = table[\"Card\"].sum()\ngrand_total = table.to_numpy().sum()\nexpected = row_total * column_total / grand_total\nprint(round(expected, 1))\n"
   ],
   "solution": "table = pd.crosstab(master[\"order_status\"], master[\"payment_method\"])\nrow_total = table.loc[\"Cancelled\"].sum()\ncolumn_total = table[\"Card\"].sum()\ngrand_total = table.to_numpy().sum()\nexpected = row_total * column_total / grand_total\nprint(round(expected, 1))\n",
   "ordered": true
  },
  {
   "id": "st-5-3-c3",
   "type": "check",
   "title": "Why compare January-to-June 2026 with January-to-June of earlier years rather than with whole earlier years?",
   "body": "<p>2026 data ends on 30 June.</p>",
   "options": [
    "Because it makes the p-value smaller",
    "Because comparing six months with twelve months could blame a seasonal pattern on a real change. Like must be compared with like",
    "Because the two-proportion test only works on half-year data",
    "Because earlier whole years contain too many orders"
   ],
   "answer": 1,
   "why": [
    "Choosing a baseline to make p smaller is exactly the kind of cheating a test is meant to prevent.",
    "Correct. The comparison group must match the period and conditions of the group you are testing.",
    "The test works on any two groups. The issue is the fairness of the comparison.",
    "More data is not a problem. A mismatched period is."
   ]
  },
  {
   "type": "explain",
   "title": "Good practice, and when these tests fail",
   "body": "<ul><li><b>Check the counts are big enough.</b> The z-tests need enough successes <i>and</i> failures in each group, roughly at least 10 of each. The chi-square test needs expected counts of about 5 or more in nearly every cell. With small counts use the <b>exact</b> tools: <code>stats.binomtest</code> for one proportion and <code>stats.fisher_exact</code> for a 2×2 table.</li>\n<li><b>Orders must be independent observations.</b> If one customer places 20 orders and they all get cancelled together, the 20 orders are not 20 independent pieces of evidence.</li>\n<li><b>The chi-square test says “related”, not “how” or “how strongly”.</b> After a significant result, look at the table and the cells that differ most from their expected counts.</li>\n<li><b>Report an interval, not only a p-value.</b> “2026 cancellations were 1.6 points higher (95% interval 0.2 to 3.1)” tells the Director how big the issue might be. “p = 0.019” does not.</li>\n<li><b>One p just below 0.05 is a nudge, not a verdict.</b> The 2026 result is the kind of finding you investigate (what changed?), not one you announce. In Lesson 5.4 you will see why a single p of 0.02 among many tests deserves extra caution.</li></ul>\n<div class=\"callout work\"><b>What to tell the Customer Care Director.</b> “Across all 10,000 orders the cancellation rate is 5.29% (95% interval 4.86% to 5.75%). That is consistent with the 5% target (p = 0.18). However, January-to-June 2026 shows 6.54% against 4.93% in earlier January-to-June periods, a gap of about 1.6 points (p = 0.019). I recommend we look into what changed in 2026 before drawing conclusions.”</div>"
  },
  {
   "type": "explain",
   "title": "What you should take away from Lesson 5.3",
   "body": "<p>You can now test shares and categories.</p>\n<ul><li>A <b>proportion</b> p̂ is the share of rows with some property. For a target p₀ the noise is √(p₀(1−p₀)/n), and the test is a <b>z-test</b> (or the <b>exact binomial test</b>).</li>\n<li>To compare two proportions, <b>pool</b> them to build the standard error for the test, and use the unpooled version for the confidence interval.</li>\n<li>The <b>chi-square test of independence</b> compares a contingency table with the counts expected if the two columns were unrelated. Expected = row total × column total ÷ grand total, and df = (rows − 1) × (columns − 1).</li>\n<li>Always compare <b>like with like</b>, and check the counts are large enough.</li></ul>\n<p><b>Interview questions to practise</b></p>\n<ol><li><i>“How would you check whether our cancellation rate meets a 5% target?”</i> Model answer: “A one-proportion test: compare the observed share with 5%, using the standard error built from 5%, and report the confidence interval as well as the p-value.”</li>\n<li><i>“What does the chi-square test of independence tell you?”</i> Model answer: “Whether two categorical variables are related. It compares the observed counts with those expected if they were unrelated. It does not tell you the direction or strength of the relationship.”</li>\n<li><i>“A rate went from 4.9% to 6.5% and p = 0.02. Do you announce a problem?”</i> Model answer: “I treat it as a flag to investigate. I would check the baseline is fair, look at the interval for the size of the change, and consider how many other comparisons were made.”</li></ol>\n<p>That last point is the subject of the final lesson of this module. In Lesson 5.4 we study <b>how tests go wrong</b>: false alarms, missed effects, the power of a test to find a real difference, how big a pilot must be, and why testing twenty things and reporting the one that “worked” fools everyone.</p>"
  }
 ]
}
);
