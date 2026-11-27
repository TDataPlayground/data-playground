LESSONS.push(
{
 "id": "st-5-2",
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
  "deliveries",
  "orders",
  "customers",
  "order_items",
  "products"
 ],
 "setup": "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom scipy import stats\n\ndeliveries = pd.read_csv(\"deliveries.csv\")\norders = pd.read_csv(\"orders.csv\")\ncustomers = pd.read_csv(\"customers.csv\")\norder_items = pd.read_csv(\"order_items.csv\")\nproducts = pd.read_csv(\"products.csv\")\n\n# Days in transit for every delivery that has both a dispatch date and a delivery date.\ndeliveries[\"dispatch_date\"] = pd.to_datetime(deliveries[\"dispatch_date\"], errors=\"coerce\")\ndeliveries[\"delivery_date\"] = pd.to_datetime(deliveries[\"delivery_date\"], errors=\"coerce\")\ndeliveries[\"transit_days\"] = (\n    deliveries[\"delivery_date\"] - deliveries[\"dispatch_date\"]\n).dt.days\n\n# trips: one row per finished delivery (Delivered or Delayed), with the customer's country.\ntrips = (\n    deliveries.loc[deliveries[\"transit_days\"].notna() & (deliveries[\"transit_days\"] >= 0)]\n    .merge(orders[[\"order_id\", \"customer_id\"]], on=\"order_id\", validate=\"many_to_one\")\n    .merge(customers[[\"customer_id\", \"country\"]], on=\"customer_id\", validate=\"many_to_one\")\n    .reset_index(drop=True)\n)\n\n# lines: one row per order line, with its value and whether the product is Electronics.\nlines = order_items.merge(\n    products[[\"product_id\", \"category\"]], on=\"product_id\", validate=\"many_to_one\"\n)\nlines[\"line_value\"] = lines[\"quantity\"] * lines[\"unit_price\"]\nlines[\"is_electronics\"] = lines[\"category\"] == \"Electronics\"\n\n# audit: the 150 deliveries the audit team pulled at random last week.\naudit = np.random.default_rng(5202).choice(\n    trips[\"transit_days\"].to_numpy(), size=150, replace=False\n)\n",
 "preloaded": [
  "trips",
  "lines",
  "audit",
  "stats"
 ],
 "title": "5.2 Comparing averages: one-sample and Welch's t-tests",
 "tables": [],
 "intro": "TradeFlow's website promises customers: “delivered in about 5 days on average”. Last week the audit team pulled <b>150 deliveries at random</b> and timed them. Their average was <b>5.713 days</b>. The Operations Director asks a sharp question: “Is that a real problem, or did the audit team just draw an unlucky batch?”<br><br>In the last lesson you answered this kind of question by shuffling labels thousands of times. That method is honest and easy to understand, but it can be slow, and every analyst you will ever work with also knows the faster classic: the <b>t-test</b>. It uses a formula to give the same kind of answer in one line of code, and it also reports how precisely we measured the gap.<br><br>In this lesson you will learn what the <b>t statistic</b> really is (it is just “signal divided by noise”), why we use the t distribution instead of the normal curve, how to compare one average with a promise (one-sample t-test), how to compare two groups (Welch's t-test, the industry default), and why a p-value must always travel with a confidence interval and an effect size. The code uses <b>SciPy</b>, Python's scientific toolbox. The first run in this lesson loads it, which can take a minute.",
 "steps": [
  {
   "type": "explain",
   "title": "From shuffling to a formula: the t statistic is signal divided by noise",
   "body": "<p>Every test statistic in this module has the same shape:</p>\n<p style=\"text-align:center\"><b>t = (what we observed − what the claim says) ÷ the noise in our estimate</b></p>\n<p>Take the audit. The <b>signal</b> is how far the audit average (5.713) sits from the promised 5 days: 0.713 days. The <b>noise</b> is the wobble we expect in an average of 150 deliveries, even if the promise were exactly true. You met that wobble in Module 4: it is the <b>standard error</b>, the sample standard deviation divided by the square root of the sample size.</p>\n<div class=\"callout analogy\"><b>Think of a radio.</b> The signal is the song you want to hear. The noise is the static. A song that is only slightly louder than the static is hard to be sure about. A song far louder than the static is unmistakable. The t statistic is that loudness ratio. A t near 0 means “just static”. The bigger |t| gets, the harder it is to blame luck.</div>\n<p>So t simply answers: <b>“How many standard errors away from the claim is my sample average?”</b> A t of 3 means three standard errors away, which is a long way for luck to travel.</p>"
  },
  {
   "type": "explain",
   "title": "Why t and not the normal curve? Estimating the spread costs something",
   "body": "<p>In Module 3 you met the bell-shaped normal curve. If we <i>knew</i> the true spread of delivery times, the ratio above would follow it exactly. But we do not know the true spread. We only have an <i>estimate</i> from 150 deliveries, and a small sample can misjudge the spread a little. That extra uncertainty makes extreme values somewhat more likely than the normal curve says.</p>\n<p>The <b>t distribution</b> is the normal curve corrected for that. It looks like the bell curve with slightly <b>fatter tails</b>. How fat depends on one number, the <b>degrees of freedom</b> (df). For a one-sample test, df = n − 1.</p>\n<div class=\"callout analogy\"><b>Think of degrees of freedom as “free pieces of information”.</b> Suppose five numbers must average 10. You can pick the first four freely, but the fifth is then forced. So five numbers give only four free choices. Once we have used the data to estimate the average, one piece of information is spent, leaving n − 1 free ones for judging the spread.</div>\n<p>The more data, the closer t gets to the normal curve. Here is the value that marks off the middle 95%:</p>\n<table class=\"mini\"><tr><th>Degrees of freedom</th><th>Critical value for 95%</th><th>Meaning</th></tr>\n<tr><td>5</td><td>2.571</td><td>Tiny sample: tails are wide</td></tr>\n<tr><td>30</td><td>2.042</td><td>Moderate sample</td></tr>\n<tr><td>149 (our audit)</td><td>1.976</td><td>Close to normal</td></tr>\n<tr><td>Huge</td><td>1.960</td><td>Same as the normal curve (the familiar 1.96)</td></tr></table>\n<p>Practical lesson: with a few thousand rows the t-test and the normal-curve shortcut agree. With small samples the t-test is the honest choice.</p>"
  },
  {
   "type": "try",
   "title": "Build the t statistic by hand",
   "body": "<p>Before using any library, build the t statistic yourself so it is never a mystery.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>claimed = 5</code>: The promise on the website: 5 days. This is what H₀ says the true average is.</li><li><code>n = len(audit)</code>: <code>audit</code> is the array of 150 audited transit times. <code>len</code> counts them.</li><li><code>sample_mean = audit.mean()</code>: The average of the audit sample: our best single guess for the real average.</li><li><code>sample_sd = audit.std(ddof=1)</code>: The standard deviation of the audit times. <code>ddof=1</code> tells NumPy to divide by n − 1 instead of n, which is the correct choice when we are estimating the spread of a larger group from a sample.</li><li><code>std_error = sample_sd / np.sqrt(n)</code>: The noise: the typical wobble of an average of n deliveries. <code>np.sqrt</code> is the square root.</li><li><code>t_stat = (sample_mean - claimed) / std_error</code>: Signal divided by noise. Top: how far the sample average is from the promise. Bottom: the wobble.</li></ol>\n<p>Read the output: a t statistic of about 3.17 means the audit average sits more than three standard errors above the promised 5 days.</p>",
   "code": "claimed = 5\nn = len(audit)\nsample_mean = audit.mean()\nsample_sd = audit.std(ddof=1)\nstd_error = sample_sd / np.sqrt(n)\nt_stat = (sample_mean - claimed) / std_error\n\nprint(\"Deliveries audited:\", n)\nprint(\"Sample mean:\", round(sample_mean, 3))\nprint(\"Sample standard deviation:\", round(sample_sd, 3))\nprint(\"Standard error:\", round(std_error, 3))\nprint(\"t statistic:\", round(t_stat, 3))\n"
  },
  {
   "type": "try",
   "title": "The same test in one line with SciPy",
   "body": "<p>Real analysts use a library so they do not retype formulas. <code>stats.ttest_1samp</code> does everything from the last box and also finds the p-value.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>from scipy import stats</code>: Already done for you in the lesson setup. It loads SciPy's statistics toolbox and calls it <code>stats</code>.</li><li><code>stats.ttest_1samp(audit, popmean=5)</code>: “Test one sample against a claimed population mean.” We give it the data and the promise (H₀ says the mean is 5). It returns an answer object holding the t statistic and the p-value.</li><li><code>result.statistic</code>: The t statistic. It matches the one we built by hand.</li><li><code>result.pvalue</code>: The two-sided p-value: the chance, if the true average really were 5, of getting a t as far from 0 as this one in <i>either</i> direction.</li><li><code>alternative=\"greater\"</code>: This asks a one-sided question: “is the true mean <i>above</i> 5?” That is the Operations Director's worry, since being slower than promised is the problem. The one-sided p-value is half the two-sided one here, because only one tail counts.</li></ol>\n<p>Our result: p ≈ 0.0018 (two-sided). If the true average delivery time were exactly 5 days, an audit this far off would happen about 2 times in 1,000. That is rare, so we <b>reject H₀</b> at α = 0.05.</p>",
   "code": "result = stats.ttest_1samp(audit, popmean=5)\nprint(\"t statistic:\", round(result.statistic, 3))\nprint(\"p-value (two-sided):\", round(result.pvalue, 4))\n\none_sided = stats.ttest_1samp(audit, popmean=5, alternative=\"greater\")\nprint(\"p-value (one-sided, mean above 5):\", round(one_sided.pvalue, 4))\n"
  },
  {
   "type": "try",
   "title": "See the p-value as an area under the t curve",
   "body": "<p>A p-value is an <b>area</b>. This chart draws the t distribution for our audit (the curve of t values luck would produce if the promise were exactly true) and shades the tails that are at least as extreme as our t statistic. The shaded area <i>is</i> the p-value.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>df = len(audit) - 1</code>: Degrees of freedom: 149.</li><li><code>x = np.linspace(-4.5, 4.5, 400)</code>: 400 evenly spaced t values from −4.5 to 4.5: the horizontal positions for drawing the curve.</li><li><code>density = stats.t.pdf(x, df)</code>: <code>pdf</code> (probability density function) gives the height of the t curve at each position.</li><li><code>plt.fill_between(x, density, where=(np.abs(x) &gt;= abs(t_stat)), ...)</code>: Colour the area under the curve only where |x| is at least as large as our |t|. That covers both tails, which is why it is the two-sided p-value.</li><li><code>plt.axvline(t_stat, ...)</code>: A vertical line at our t statistic.</li></ol>\n<p>The tiny red slivers in the far tails are the reason the p-value is small: very little of the curve lies out there.</p>",
   "code": "df = len(audit) - 1\nt_stat = stats.ttest_1samp(audit, popmean=5).statistic\n\nx = np.linspace(-4.5, 4.5, 400)\ndensity = stats.t.pdf(x, df)\n\nplt.plot(x, density, color=\"#4fc3f7\")\nplt.fill_between(x, density, where=(np.abs(x) >= abs(t_stat)), color=\"#ff7b7b\", alpha=0.7)\nplt.axvline(t_stat, color=\"#ff7b7b\", linewidth=2, label=\"Audit t statistic\")\nplt.title(\"If the true average were 5 days: what t values does luck produce?\")\nplt.xlabel(\"t statistic\")\nplt.ylabel(\"Density\")\nplt.legend()\nplt.show()\n"
  },
  {
   "id": "st-5-2-c1",
   "type": "check",
   "title": "The audit gave t ≈ 3.17 and p ≈ 0.0018. What is the right reading?",
   "body": "<p>The test was two-sided with α = 0.05 and the promise was 5 days.</p>",
   "options": [
    "There is a 0.18% chance that TradeFlow's delivery promise is true",
    "If the true average really were 5 days, a sample this far from 5 would turn up only about 0.18% of the time, so we reject the promise as stated",
    "TradeFlow's average delivery time is exactly 5.71 days",
    "The audit proved that every delivery takes longer than 5 days"
   ],
   "answer": 1,
   "why": [
    "The p-value is not the probability that H₀ is true. It is the probability of data this extreme if H₀ were true.",
    "Correct. A small p-value says luck alone rarely produces a gap this size. We reject H₀ and say the data is inconsistent with an average of exactly 5 days.",
    "5.71 is the average of the audited sample. The true average is unknown. The confidence interval in this lesson shows the range of plausible values.",
    "A test about an average says nothing about every single delivery. Many individual deliveries were still faster than 5 days."
   ]
  },
  {
   "id": "st-5-2-ex1",
   "type": "exercise",
   "title": "Your turn: build the t statistic by hand",
   "body": "<p>The audit sample is stored as the array <code>audit</code>. H₀ says the true average is <b>5</b> days. Calculate the t statistic by hand and print it rounded to 3 decimals.</p>\n<p>Your output should be <code>3.171</code>.</p>\n<p><b>Think before you type:</b> signal over noise. Signal: sample mean minus 5. Noise: standard deviation (with <code>ddof=1</code>) divided by the square root of the sample size.</p>\n<p><b>Python connection:</b> <code>np.sqrt(n)</code> is the square root. Brackets matter: <code>(a - b) / c</code> subtracts first, then divides.</p>",
   "starter": "# audit is already loaded (150 audited transit times)\n\n# Write your code below\n",
   "hints": [
    "standard error = audit.std(ddof=1) / np.sqrt(len(audit)); then t = (audit.mean() - 5) / standard error.",
    "claimed = 5\nn = len(audit)\nstd_error = audit.std(ddof=1) / np.sqrt(n)\nt_stat = (audit.mean() - claimed) / std_error\nprint(round(t_stat, 3))\n"
   ],
   "solution": "claimed = 5\nn = len(audit)\nstd_error = audit.std(ddof=1) / np.sqrt(n)\nt_stat = (audit.mean() - claimed) / std_error\nprint(round(t_stat, 3))\n",
   "ordered": true
  },
  {
   "id": "st-5-2-ex2",
   "type": "exercise",
   "title": "Your turn: let SciPy find the p-value",
   "body": "<p>Use <code>stats.ttest_1samp</code> to test whether the true average transit time differs from 5 days (two-sided). Print the p-value rounded to 4 decimals.</p>\n<p>Your output should be <code>0.0018</code>.</p>\n<p><b>Python connection:</b> <code>stats.ttest_1samp(data, popmean=claim)</code> returns an object. Its <code>.pvalue</code> part is the number you want.</p>",
   "starter": "# audit and stats are already loaded\n\n# Write your code below\n",
   "hints": [
    "result = stats.ttest_1samp(audit, popmean=5), then print(round(result.pvalue, 4)).",
    "result = stats.ttest_1samp(audit, popmean=5)\nprint(round(result.pvalue, 4))\n"
   ],
   "solution": "result = stats.ttest_1samp(audit, popmean=5)\nprint(round(result.pvalue, 4))\n",
   "ordered": true
  },
  {
   "type": "explain",
   "title": "Comparing two groups: Welch's t-test",
   "body": "<p>The Operations Director's other questions compare <b>two groups</b>, such as Delayed and Delivered parcels, or Kenya and Ghana. The signal is now the gap between the two averages. The noise has to include the wobble of <i>both</i> averages:</p>\n<p style=\"text-align:center\"><b>t = (average₁ − average₂) ÷ √( s₁²/n₁ + s₂²/n₂ )</b></p>\n<p>Read the bottom part as “the combined wobble of two averages”. Here s₁ and s₂ are the two groups' standard deviations and n₁ and n₂ are their sizes. Each group contributes its own spread divided by its own size: a big, steady group adds little noise, a small, jumpy group adds a lot.</p>\n<p>This version is called <b>Welch's t-test</b>. It does <b>not</b> assume the two groups have the same spread. The older “pooled” version does assume that, and gives wrong answers when it is false. Because you rarely know the spreads are equal, the industry default is Welch: in SciPy, <code>stats.ttest_ind(a, b, equal_var=False)</code>. (“ind” means the two groups are <b>ind</b>ependent: no row in one group is linked to a row in the other.)</p>\n<div class=\"callout tip\"><b>Link back to Lesson 5.1.</b> The shuffling test and Welch's t-test answer the same question. On the next screen you will see them give almost the same p-value for the Delayed flag.</div>"
  },
  {
   "type": "try",
   "title": "Delayed versus Delivered with Welch's t-test",
   "body": "<p>Here is the Finance Director's claim again, now with the formula method. We calculate t by hand, then check SciPy agrees.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>delayed = trips.loc[trips[\"delivery_status\"] == \"Delayed\", \"transit_days\"]</code>: The transit times of Delayed parcels.</li><li><code>gap = delayed.mean() - delivered.mean()</code>: The signal: difference between the two averages.</li><li><code>delayed.var(ddof=1) / len(delayed)</code>: The variance (standard deviation squared) divided by the group size: this group's share of the noise. <code>ddof=1</code> again means “estimate from a sample”.</li><li><code>np.sqrt( ... + ... )</code>: Add the two groups' shares of noise and take the square root: the standard error of the gap.</li><li><code>t_by_hand = gap / std_error</code>: Signal over noise.</li><li><code>stats.ttest_ind(delayed, delivered, equal_var=False)</code>: SciPy does the same, and also gives the p-value. <code>equal_var=False</code> is what makes it Welch's version.</li></ol>\n<p>The p-value is about 0.96, almost identical to the 0.96 from the shuffling test. Two completely different methods, the same conclusion: no evidence that Delayed parcels take longer.</p>",
   "code": "delayed = trips.loc[trips[\"delivery_status\"] == \"Delayed\", \"transit_days\"]\ndelivered = trips.loc[trips[\"delivery_status\"] == \"Delivered\", \"transit_days\"]\n\n# By hand\ngap = delayed.mean() - delivered.mean()\nstd_error = np.sqrt(delayed.var(ddof=1) / len(delayed) + delivered.var(ddof=1) / len(delivered))\nt_by_hand = gap / std_error\n\n# With scipy\nresult = stats.ttest_ind(delayed, delivered, equal_var=False)\n\nprint(\"Gap (Delayed minus Delivered):\", round(gap, 4))\nprint(\"t by hand:\", round(t_by_hand, 3))\nprint(\"t from scipy:\", round(result.statistic, 3))\nprint(\"p-value from scipy:\", round(result.pvalue, 4))\n"
  },
  {
   "id": "st-5-2-ex3",
   "type": "exercise",
   "title": "Your turn: Kenya against Ghana with Welch's test",
   "body": "<p>Use Welch's t-test to compare transit times for <b>Kenya</b> and <b>Ghana</b>. Print two lines: the t statistic rounded to 3 decimals, then the two-sided p-value rounded to 3 decimals.</p>\n<p>Your output should be <code>1.466</code> then <code>0.143</code>.</p>\n<p><b>Think before you type:</b> pick Kenya's transit times and Ghana's transit times into two variables, then give both to <code>stats.ttest_ind</code> with <code>equal_var=False</code>. Compare the p-value with the permutation result from Lesson 5.1.</p>\n<p><b>Python connection:</b> <code>trips.loc[trips[\"country\"] == \"Kenya\", \"transit_days\"]</code> keeps Kenya's rows and the one column you need.</p>",
   "starter": "# trips and stats are already loaded\n\n# Write your code below\n",
   "hints": [
    "kenya = trips.loc[trips[\"country\"] == \"Kenya\", \"transit_days\"] and ghana likewise. result = stats.ttest_ind(kenya, ghana, equal_var=False).",
    "kenya = trips.loc[trips[\"country\"] == \"Kenya\", \"transit_days\"]\nghana = trips.loc[trips[\"country\"] == \"Ghana\", \"transit_days\"]\nresult = stats.ttest_ind(kenya, ghana, equal_var=False)\nprint(round(result.statistic, 3))\nprint(round(result.pvalue, 3))\n"
   ],
   "solution": "kenya = trips.loc[trips[\"country\"] == \"Kenya\", \"transit_days\"]\nghana = trips.loc[trips[\"country\"] == \"Ghana\", \"transit_days\"]\nresult = stats.ttest_ind(kenya, ghana, equal_var=False)\nprint(round(result.statistic, 3))\nprint(round(result.pvalue, 3))\n",
   "ordered": true
  },
  {
   "type": "explain",
   "title": "Beyond the p-value: confidence intervals and effect sizes",
   "body": "<p>A p-value answers one narrow question: “is the gap bigger than luck?” A decision maker also needs two more answers.</p>\n<p><b>1. How big could the gap really be? Use a confidence interval.</b> Kenya's average is 5.588 days against Ghana's 5.440, a gap of 0.148 days. The 95% confidence interval for the true gap runs from <b>-0.050</b> to <b>0.345</b> days. In plain words: the real gap could plausibly be anywhere from a little in Ghana's favour to about a third of a day in Kenya's disfavour. Notice that the interval <b>includes 0</b>. That is the same message as p &gt; 0.05, but it is more informative, because it shows how large the gap could still be.</p>\n<p><b>2. Is the gap big enough to matter? Use an effect size.</b> <b>Cohen's d</b> measures the gap in units of the typical spread of the data: d = gap ÷ pooled standard deviation. It lets you compare gaps measured in different units, such as days and naira. Common rules of thumb: about 0.2 is small, 0.5 medium, 0.8 large. They are guides, not laws: what counts as big depends on the business.</p>\n<table class=\"mini\"><tr><th>Comparison</th><th>Gap</th><th>Cohen's d</th><th>Reading</th></tr>\n<tr><td>Kenya vs Ghana transit</td><td>0.148 days</td><td>0.05</td><td>Tiny: a tenth of a typical spread at most</td></tr>\n<tr><td>Electronics vs other line values</td><td>70,161</td><td>1.15</td><td>Very large</td></tr></table>\n<div class=\"callout watch\"><b>Significant does not mean important.</b> Run the promise test on <i>all</i> 8,261 finished deliveries instead of the audit sample and you get an average of 5.514 days, t ≈ 16.3 and a p-value smaller than 1 in a trillion trillion. The gap from 5 days is about 0.51 days, the same order of size as the audit's 0.71. Only the <i>certainty</i> grew, because more data shrinks the standard error. Statistical significance tells you a gap is real. It never tells you the gap matters. Always ask: is half a day worth acting on?</div>"
  },
  {
   "type": "try",
   "title": "Confidence interval and effect size in code",
   "body": "<p>This box produces everything a proper report on Kenya versus Ghana needs: the gap, its 95% confidence interval, the p-value and Cohen's d.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>result = stats.ttest_ind(kenya, ghana, equal_var=False)</code>: Welch's test, as before.</li><li><code>low, high = result.confidence_interval(confidence_level=0.95)</code>: Ask the result for a 95% confidence interval of the gap. It returns two numbers: the low end and the high end. Writing <code>low, high = ...</code> stores each in its own variable.</li><li><code>pooled_sd = np.sqrt(((n1 - 1) * kenya.var(ddof=1) + (n2 - 1) * ghana.var(ddof=1)) / (n1 + n2 - 2))</code>: One combined standard deviation for both groups. Each group's variance is weighted by its size (minus one), added together, divided by the total, then square-rooted.</li><li><code>cohens_d = gap / pooled_sd</code>: The gap measured in “typical spreads”. A d of 0.05 means the gap is only five hundredths of one typical spread.</li></ol>",
   "code": "kenya = trips.loc[trips[\"country\"] == \"Kenya\", \"transit_days\"]\nghana = trips.loc[trips[\"country\"] == \"Ghana\", \"transit_days\"]\n\nresult = stats.ttest_ind(kenya, ghana, equal_var=False)\nlow, high = result.confidence_interval(confidence_level=0.95)\ngap = kenya.mean() - ghana.mean()\n\nn1, n2 = len(kenya), len(ghana)\npooled_sd = np.sqrt(((n1 - 1) * kenya.var(ddof=1) + (n2 - 1) * ghana.var(ddof=1)) / (n1 + n2 - 2))\ncohens_d = gap / pooled_sd\n\nprint(\"Gap (Kenya minus Ghana):\", round(gap, 3), \"days\")\nprint(\"95% confidence interval for the gap:\", (round(low, 3), round(high, 3)))\nprint(\"p-value:\", round(result.pvalue, 3))\nprint(\"Cohen's d:\", round(cohens_d, 2))\n"
  },
  {
   "id": "st-5-2-ex4",
   "type": "exercise",
   "title": "Your turn: the confidence interval for the gap",
   "body": "<p>Using Welch's test on Kenya and Ghana transit times, get the <b>95% confidence interval</b> for the gap (Kenya minus Ghana). Print the low end then the high end, each rounded to 3 decimals, on separate lines.</p>\n<p>Your output should be <code>-0.05</code> then <code>0.345</code>.</p>\n<p><b>Python connection:</b> <code>low, high = result.confidence_interval(confidence_level=0.95)</code> unpacks the pair of numbers into two variables.</p>",
   "starter": "# trips and stats are already loaded\nkenya = trips.loc[trips[\"country\"] == \"Kenya\", \"transit_days\"]\nghana = trips.loc[trips[\"country\"] == \"Ghana\", \"transit_days\"]\n\n# Write your code below\n",
   "hints": [
    "Run stats.ttest_ind(kenya, ghana, equal_var=False) and call .confidence_interval(confidence_level=0.95) on the result.",
    "kenya = trips.loc[trips[\"country\"] == \"Kenya\", \"transit_days\"]\nghana = trips.loc[trips[\"country\"] == \"Ghana\", \"transit_days\"]\nresult = stats.ttest_ind(kenya, ghana, equal_var=False)\nlow, high = result.confidence_interval(confidence_level=0.95)\nprint(round(low, 3))\nprint(round(high, 3))\n"
   ],
   "solution": "kenya = trips.loc[trips[\"country\"] == \"Kenya\", \"transit_days\"]\nghana = trips.loc[trips[\"country\"] == \"Ghana\", \"transit_days\"]\nresult = stats.ttest_ind(kenya, ghana, equal_var=False)\nlow, high = result.confidence_interval(confidence_level=0.95)\nprint(round(low, 3))\nprint(round(high, 3))\n",
   "ordered": true
  },
  {
   "id": "st-5-2-ex5",
   "type": "exercise",
   "title": "Your turn: how big is the Kenya–Ghana gap?",
   "body": "<p>Calculate <b>Cohen's d</b> for Kenya versus Ghana: the gap (Kenya mean minus Ghana mean) divided by the pooled standard deviation. Print it rounded to 2 decimals.</p>\n<p>Your output should be <code>0.05</code>.</p>\n<p><b>Think before you type:</b> the pooled standard deviation is <code>np.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))</code>, where the variances use <code>ddof=1</code>. A value this small tells you the gap is trivial even before you look at the p-value.</p>",
   "starter": "# trips and np are already loaded\nkenya = trips.loc[trips[\"country\"] == \"Kenya\", \"transit_days\"]\nghana = trips.loc[trips[\"country\"] == \"Ghana\", \"transit_days\"]\n\n# Write your code below\n",
   "hints": [
    "n1 = len(kenya), n2 = len(ghana); variances with .var(ddof=1); build pooled_sd with np.sqrt(...); then (kenya.mean() - ghana.mean()) / pooled_sd.",
    "kenya = trips.loc[trips[\"country\"] == \"Kenya\", \"transit_days\"]\nghana = trips.loc[trips[\"country\"] == \"Ghana\", \"transit_days\"]\nn1, n2 = len(kenya), len(ghana)\npooled_sd = np.sqrt(((n1 - 1) * kenya.var(ddof=1) + (n2 - 1) * ghana.var(ddof=1)) / (n1 + n2 - 2))\ncohens_d = (kenya.mean() - ghana.mean()) / pooled_sd\nprint(round(cohens_d, 2))\n"
   ],
   "solution": "kenya = trips.loc[trips[\"country\"] == \"Kenya\", \"transit_days\"]\nghana = trips.loc[trips[\"country\"] == \"Ghana\", \"transit_days\"]\nn1, n2 = len(kenya), len(ghana)\npooled_sd = np.sqrt(((n1 - 1) * kenya.var(ddof=1) + (n2 - 1) * ghana.var(ddof=1)) / (n1 + n2 - 2))\ncohens_d = (kenya.mean() - ghana.mean()) / pooled_sd\nprint(round(cohens_d, 2))\n",
   "ordered": true
  },
  {
   "id": "st-5-2-c2",
   "type": "check",
   "title": "A carrier comparison on 500,000 TradeFlow parcels finds a 0.02-day difference with p = 0.001. What should you tell management?",
   "body": "<p>Delivery times are measured in days and the typical spread is almost 3 days.</p>",
   "options": [
    "The carriers are clearly different, so switch carrier immediately",
    "The gap is statistically detectable, but at about 0.02 days it is almost certainly too small to matter commercially, so the decision should rest on cost and reliability, not on this p-value",
    "p = 0.001 means a 99.9% chance the carriers differ",
    "The test must be wrong because the gap is so small"
   ],
   "answer": 1,
   "why": [
    "A tiny p-value only says the gap is unlikely to be pure luck. It does not say the gap is worth acting on.",
    "Correct. With a huge sample even a trivial gap becomes significant. Effect size and business cost decide whether it matters.",
    "p-values are not probabilities that the hypothesis is true.",
    "The test can be perfectly right. A tiny gap can be real and still be irrelevant."
   ]
  },
  {
   "type": "explain",
   "title": "When a t-test can mislead you",
   "body": "<p>A t-test makes a few assumptions. Know them, because every one of them has a TradeFlow example.</p>\n<ul><li><b>Independence.</b> Each row must carry its own information. If one customer places 30 orders and you treat them as 30 separate observations, the test acts as if it has more evidence than it does and p-values come out too small.</li>\n<li><b>The average must be a sensible summary and roughly bell-shaped in repeated samples.</b> With thousands of rows the Central Limit Theorem (Lesson 4.2) rescues you. With a <i>small</i> sample of heavily skewed data, such as payment amounts with a few huge orders, the t-test can mislead. Use a <b>permutation test</b> or the <b>bootstrap</b> from the earlier lessons, or test the <b>logarithm</b> of the amounts.</li>\n<li><b>Outliers.</b> A single extreme value can drag an average and inflate the noise. Check the data first (Module 3 of Statistics and the EDA lessons in Python).</li>\n<li><b>One test, one question.</b> The same p &lt; 0.05 rule applies per test. Running many tests raises the chance of a false alarm, which is the subject of Lesson 5.4.</li></ul>\n<div class=\"callout work\"><b>A report line the Operations Director can use.</b> “Audit of 150 random deliveries: average 5.713 days (95% confidence interval 5.269 to 6.158). That is above the promised 5 days (one-sample t-test, t = 3.17, p = 0.002). The promise of ‘about 5 days’ is not supported by the audit.”</div>\n<p>Notice the shape of that sentence: the estimate, its interval, the test, the p-value, and a conclusion in plain words. Use it every time.</p>"
  },
  {
   "id": "st-5-2-c3",
   "type": "check",
   "title": "Which situation should make you least comfortable using a standard t-test?",
   "body": "<p>Think about the assumptions you just read.</p>",
   "options": [
    "Comparing average transit time between Kenya and Ghana using more than 1,500 deliveries in each country",
    "Comparing average order payment amounts across two payment methods using only 12 orders each, where a few orders are far larger than the rest",
    "Testing whether the audit average differs from 5 days with 150 random deliveries",
    "Comparing Delayed and Delivered parcels with hundreds of rows each"
   ],
   "answer": 1,
   "why": [
    "Large samples make the t-test dependable here: the Central Limit Theorem does the work.",
    "Correct. Tiny samples plus extreme, skewed values break the assumption that the average behaves nicely. A permutation test, a bootstrap, or a log transform is safer.",
    "150 random draws is a decent sample and delivery times are not wildly skewed.",
    "Hundreds of rows in each group is plenty."
   ]
  },
  {
   "type": "explain",
   "title": "What you should take away from Lesson 5.2",
   "body": "<p>You can now run, read and report a t-test.</p>\n<ul><li><b>t = signal ÷ noise</b>: the observed gap divided by the standard error. It counts how many standard errors the data sits from the claim.</li>\n<li>The <b>t distribution</b> is the normal curve with fatter tails for small samples. Its shape depends on the <b>degrees of freedom</b>.</li>\n<li><code>stats.ttest_1samp</code> compares one average with a claimed value. <code>stats.ttest_ind(a, b, equal_var=False)</code> is <b>Welch's t-test</b>, the default for comparing two independent groups.</li>\n<li>Always report the <b>gap, its confidence interval, the p-value and an effect size</b>, and say what it means in plain words.</li>\n<li>A small p-value means “not luck”. It does not mean “big” or “important”.</li></ul>\n<p><b>Interview questions to practise</b></p>\n<ol><li><i>“What is the difference between a one-sample and a two-sample t-test?”</i> Model answer: “One-sample compares a single average with a claimed value, such as a promised delivery time. Two-sample compares the averages of two independent groups.”</li>\n<li><i>“Why use Welch's test instead of the standard pooled t-test?”</i> Model answer: “Welch does not assume the two groups have equal spread. If the assumption is false, the pooled test can give misleading p-values, while Welch costs almost nothing when the assumption is true.”</li>\n<li><i>“A result has p = 0.001. Is the effect large?”</i> Model answer: “Not necessarily. The p-value measures how surprising the data is under H₀, not the size of the effect. I would check the confidence interval and an effect size.”</li></ol>\n<p>So far we have compared <i>averages</i>. In Lesson 5.3 we compare <b>proportions and categories</b>: is the cancellation rate really different between payment methods, and is the order status mix really independent of country? That needs a different tool, the <b>chi-square test</b>.</p>"
  }
 ]
}
);
