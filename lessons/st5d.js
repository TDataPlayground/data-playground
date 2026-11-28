LESSONS.push(
{
 "id": "st-5-4",
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
  "payments"
 ],
 "setup": "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom scipy import stats\n\ndeliveries = pd.read_csv(\"deliveries.csv\")\norders = pd.read_csv(\"orders.csv\")\ncustomers = pd.read_csv(\"customers.csv\")\npayments = pd.read_csv(\"payments.csv\")\n\n# transit: days in transit for every finished delivery, as a plain array.\ndeliveries[\"dispatch_date\"] = pd.to_datetime(deliveries[\"dispatch_date\"], errors=\"coerce\")\ndeliveries[\"delivery_date\"] = pd.to_datetime(deliveries[\"delivery_date\"], errors=\"coerce\")\ndeliveries[\"transit_days\"] = (\n    deliveries[\"delivery_date\"] - deliveries[\"dispatch_date\"]\n).dt.days\ntransit = deliveries.loc[\n    deliveries[\"transit_days\"].notna() & (deliveries[\"transit_days\"] >= 0), \"transit_days\"\n].astype(float).to_numpy()\n\n# master: one row per order, with the customer's country, the payment method and a cancelled flag.\norders[\"cancelled\"] = orders[\"order_status\"] == \"Cancelled\"\nmaster = (\n    orders.merge(customers[[\"customer_id\", \"country\"]], on=\"customer_id\", validate=\"many_to_one\")\n    .merge(payments[[\"order_id\", \"payment_method\"]], on=\"order_id\", validate=\"one_to_one\")\n)\n\ndef welch_p_values(a, b):\n    \"\"\"Welch's t-test for many simulated experiments at once.\n    a and b are 2-D arrays: one row per experiment, one column per delivery.\"\"\"\n    n1, n2 = a.shape[1], b.shape[1]\n    v1 = a.var(axis=1, ddof=1) / n1\n    v2 = b.var(axis=1, ddof=1) / n2\n    t = (a.mean(axis=1) - b.mean(axis=1)) / np.sqrt(v1 + v2)\n    df = (v1 + v2) ** 2 / (v1 ** 2 / (n1 - 1) + v2 ** 2 / (n2 - 1))\n    return 2 * stats.t.sf(np.abs(t), df)\n\n# slice_tests: for each country and payment-method combination, is its cancellation rate\n# different from the rate in all other orders? (20 separate tests)\ncells = master.groupby([\"country\", \"payment_method\"])[\"cancelled\"].agg([\"sum\", \"count\"]).reset_index()\nc1 = cells[\"sum\"].to_numpy()\nn1 = cells[\"count\"].to_numpy()\nc2 = master[\"cancelled\"].sum() - c1\nn2 = len(master) - n1\npooled = (c1 + c2) / (n1 + n2)\nz = (c1 / n1 - c2 / n2) / np.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))\ncells[\"rate\"] = c1 / n1\ncells[\"p_value\"] = 2 * stats.norm.sf(np.abs(z))\nslice_tests = cells.rename(columns={\"count\": \"orders\"}).drop(columns=\"sum\")\nslice_tests = slice_tests.sort_values(\"p_value\").reset_index(drop=True)\n\nrng = np.random.default_rng(5404)\n",
 "preloaded": [
  "transit",
  "master",
  "slice_tests",
  "welch_p_values",
  "rng"
 ],
 "title": "5.4 How tests go wrong: errors, power and the multiple-testing trap",
 "tables": [],
 "intro": "TradeFlow's Operations Director wants to pilot a new <b>express lane</b> for deliveries. If it cuts the average transit time by half a day, it is worth the extra cost. Before the pilot starts she asks three questions that every analyst must be able to answer:<br><br>1. “If the express lane does nothing, how often will your test <i>wrongly</i> tell me it works?”<br>2. “If it really does save half a day, how likely is your test to <i>notice</i>?”<br>3. “How many deliveries do we have to put through the pilot?”<br><br>Hypothesis tests do not just say yes or no. They can <b>go wrong in two different ways</b>, and a professional analyst plans for both <i>before</i> collecting any data. In this lesson you will learn Type I and Type II errors, the <b>power</b> of a test, how to size a pilot, and the trap that has embarrassed more analysts than any other: <b>running many tests and reporting the one that “worked”</b>. You will see each idea happen by simulating hundreds of thousands of experiments on TradeFlow's own delivery data.",
 "steps": [
  {
   "type": "explain",
   "title": "Two ways a test can be wrong",
   "body": "<p>When you decide “reject H₀” or “fail to reject H₀”, the truth is either that H₀ is really true or that H₁ is. That gives four situations:</p>\n<table class=\"mini\"><tr><th></th><th>Truth: express lane does nothing (H₀ true)</th><th>Truth: express lane really works (H₁ true)</th></tr>\n<tr><td><b>Test says “it works” (reject H₀)</b></td><td><b>Type I error.</b> A false alarm. TradeFlow pays for an express lane that does nothing.</td><td>Correct. A real discovery.</td></tr>\n<tr><td><b>Test says “no evidence” (fail to reject)</b></td><td>Correct.</td><td><b>Type II error.</b> A missed discovery. TradeFlow abandons an express lane that would have saved half a day.</td></tr></table>\n<p>Think of the smoke alarm in a kitchen. A <b>false alarm</b> (it screams when you burn toast) is a Type I error. A <b>missed fire</b> (silence while the kitchen burns) is a Type II error. You can make the alarm very sensitive and accept more false alarms, or very relaxed and accept the risk of missing a fire. You cannot get rid of both for free.</p>\n<ul><li>The chance of a Type I error is the significance level <b>α</b> you choose in advance. At α = 0.05, a test of a <i>truly useless</i> change cries “it works!” about 5% of the time. That is not a flaw. That is what α means.</li>\n<li>The chance of a Type II error is written <b>β</b>.</li>\n<li><b>Power = 1 − β</b> is the chance that the test <i>detects</i> a real effect of a given size. Analysts usually aim for <b>80% power</b>.</li></ul>\n<div class=\"callout work\"><b>Which error costs more?</b> At TradeFlow a false alarm means paying for a useless express lane. A miss means keeping a slower service. Different businesses weigh these differently, which is why α and the target power are decisions about the <i>business</i>, not only about statistics.</div>"
  },
  {
   "type": "try",
   "title": "Watch false alarms happen: an A/A experiment",
   "body": "<p>We can see α in action. In an <b>A/A experiment</b> both groups come from exactly the same source, so H₀ is true by construction. We run 5,000 such experiments and count how often a t-test says p &lt; 0.05.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>n_experiments = 5000</code>: We will simulate 5,000 separate mini-studies.</li><li><code>n_per_group = 200</code>: Each mini-study has two groups of 200 deliveries.</li><li><code>group_a = rng.choice(transit, size=(n_experiments, n_per_group))</code>: <code>transit</code> is the array of all real transit times. <code>rng.choice</code> picks values at random from it (with replacement). <code>size=(5000, 200)</code> asks for a grid: 5,000 rows (one per experiment) and 200 columns (the deliveries in that experiment). Everything is drawn in one go, which is far faster than a loop.</li><li><code>group_b = rng.choice(transit, size=(n_experiments, n_per_group))</code>: A second grid from the <i>same</i> source. Any difference between group A and group B is pure luck.</li><li><code>p_values = welch_p_values(group_a, group_b)</code>: A helper function (already defined for you) runs Welch's t-test on every row at once and returns 5,000 p-values.</li><li><code>false_alarms = (p_values &lt; 0.05).sum()</code>: <code>p_values &lt; 0.05</code> is True for each experiment that would have been called “significant”. <code>.sum()</code> counts the Trues.</li><li><code>plt.hist(p_values, bins=20, ...)</code>: Histogram of the 5,000 p-values: how many fall in each slice of 0 to 1.</li></ol>\n<p>The false alarm rate comes out at about 5.1%, almost exactly the 5% that α promises. Look at the histogram too: when H₀ is true, p-values are <b>spread evenly</b> between 0 and 1. A p-value of 0.03 is just as likely as 0.93. That flat shape is the reason a cut-off of 0.05 gives a 5% false alarm rate.</p>",
   "code": "n_experiments = 5000\nn_per_group = 200\n\n# Two groups drawn from the SAME deliveries: any difference is pure luck.\ngroup_a = rng.choice(transit, size=(n_experiments, n_per_group))\ngroup_b = rng.choice(transit, size=(n_experiments, n_per_group))\n\np_values = welch_p_values(group_a, group_b)\nfalse_alarms = (p_values < 0.05).sum()\n\nprint(\"Experiments run:\", n_experiments)\nprint(\"False alarms (p < 0.05):\", false_alarms)\nprint(\"False alarm rate:\", round(false_alarms / n_experiments, 4))\n\nplt.hist(p_values, bins=20, color=\"#4fc3f7\", edgecolor=\"#0b1d3a\")\nplt.axvline(0.05, color=\"#ff7b7b\", linewidth=2, label=\"alpha = 0.05\")\nplt.title(\"p-values when there is truly no difference\")\nplt.xlabel(\"p-value\")\nplt.ylabel(\"Number of experiments\")\nplt.legend()\nplt.show()\n"
  },
  {
   "type": "explain",
   "title": "Power: the chance of catching a real effect",
   "body": "<p>Now flip the situation. Suppose the express lane <i>really does</i> save 0.5 days on average. If we run a pilot, will our test notice? That depends on four things:</p>\n<ul><li><b>Sample size.</b> More deliveries make the average steadier (smaller standard error), so a real gap stands out. This is the lever you control.</li>\n<li><b>Effect size.</b> A big real gap is easier to catch than a tiny one.</li>\n<li><b>Noise.</b> Delivery times vary by about 2.9 days from one parcel to the next. More variation hides a gap.</li>\n<li><b>Significance level α.</b> A stricter α (such as 0.01) makes false alarms rarer but also makes real effects harder to catch.</li></ul>\n<div class=\"callout analogy\"><b>Think of spotting a small difference in two radio stations.</b> A faint signal in a lot of static is hard to hear. You can listen for longer (bigger sample), ask for a stronger signal (bigger effect), reduce the static (less noise), or lower your standard for what counts as “I heard it” (higher α, with more false alarms).</div>\n<p>We can measure power directly by simulation: invent a world where the express lane really does cut 0.5 days, run the pilot thousands of times, and count how often the test says “significant”.</p>"
  },
  {
   "type": "try",
   "title": "How big must the pilot be? Power by simulation",
   "body": "<p>For five different pilot sizes we simulate 2,000 pilots in a world where the express lane truly saves 0.5 days, and record how often the test detects it.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>true_gain = 0.5</code>: The real improvement we are pretending exists, in days.</li><li><code>sizes = [50, 100, 200, 400, 800]</code>: A list of pilot sizes (deliveries per group) to compare.</li><li><code>for n in sizes:</code>: A loop. The lines indented below run once for each pilot size, with <code>n</code> set to that size.</li><li><code>standard = rng.choice(transit, size=(2000, n))</code>: 2,000 simulated pilots, each with n deliveries on the standard service.</li><li><code>express = rng.choice(transit, size=(2000, n)) - true_gain</code>: 2,000 simulated pilots, each with n deliveries on the express lane. Subtracting 0.5 from every value gives each express delivery a real half-day saving.</li><li><code>power.append((p_values &lt; 0.05).mean())</code>: The share of pilots whose p-value is below 0.05 is the power at that sample size. <code>.append</code> adds it to the list. The mean of True/False values is the share of Trues.</li><li><code>plt.axhline(0.8, ...)</code>: A dashed line at 80% power, the usual goal.</li></ol>\n<p>With 50 deliveries per group the pilot would find a real half-day saving only about 13% of the time. At 400 it works about 70% of the time. Only at 800 per group does it reach roughly 95%. <b>A small pilot that “finds nothing” proves nothing</b>: it may simply have been too small to notice.</p>",
   "code": "true_gain = 0.5\nsizes = [50, 100, 200, 400, 800]\npower = []\n\nfor n in sizes:\n    standard = rng.choice(transit, size=(2000, n))\n    express = rng.choice(transit, size=(2000, n)) - true_gain\n    p_values = welch_p_values(standard, express)\n    power.append((p_values < 0.05).mean())\n    print(\"Deliveries per group:\", n, \"| chance of detecting the gain:\", round(power[-1], 3))\n\nplt.plot(sizes, power, marker=\"o\", color=\"#4fc3f7\")\nplt.axhline(0.8, color=\"#ff7b7b\", linestyle=\"--\", label=\"80% power\")\nplt.title(\"A real 0.5-day gain: how often does the test find it?\")\nplt.xlabel(\"Deliveries per group\")\nplt.ylabel(\"Power (share of experiments that detect it)\")\nplt.legend()\nplt.show()\n"
  },
  {
   "type": "explain",
   "title": "A formula for the sample size",
   "body": "<p>Simulation is flexible, but there is also a standard formula for how many observations each group needs to compare two averages:</p>\n<p style=\"text-align:center\"><b>n per group = 2 × ( (z<sub>α</sub> + z<sub>power</sub>) × σ ÷ Δ )²</b></p>\n<ul><li><b>σ</b> (sigma) is the standard deviation of the thing you measure (2.86 days for transit time).</li>\n<li><b>Δ</b> (delta) is the smallest real difference you care about detecting. This is a <i>business</i> decision. For the express lane, half a day.</li>\n<li><b>z<sub>α</sub></b> is the normal-curve value that cuts off α/2 in each tail. For α = 0.05 it is 1.96.</li>\n<li><b>z<sub>power</sub></b> is the normal-curve value that gives the power you want. For 80% power it is 0.84.</li></ul>\n<p>Notice how the formula behaves. Halve the gap you want to detect (Δ) and the required sample size becomes <b>four times</b> bigger because Δ is squared. Noisier data (bigger σ) also needs more deliveries. Detecting tiny effects is expensive.</p>"
  },
  {
   "type": "try",
   "title": "Size the express-lane pilot with the formula",
   "body": "<p>This box turns the formula into code.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>sd = transit.std(ddof=1)</code>: The standard deviation (σ) of all transit times, the noise level. <code>ddof=1</code> is the sample version.</li><li><code>gain = 0.5</code>: Δ: the smallest improvement worth detecting, half a day.</li><li><code>z_alpha = stats.norm.ppf(1 - 0.05 / 2)</code>: <code>stats.norm.ppf(q)</code> is the inverse of the normal curve: it answers “what z value has this much area to its left?”. Using 1 − 0.05/2 = 0.975 gives the value that leaves 2.5% in each tail, about 1.96.</li><li><code>z_power = stats.norm.ppf(0.80)</code>: The z value for 80% power: about 0.84.</li><li><code>n_per_group = 2 * ((z_alpha + z_power) * sd / gain) ** 2</code>: The formula. <code>**</code> means “to the power of”, so <code>** 2</code> squares the bracket.</li><li><code>int(np.ceil(n_per_group))</code>: <code>np.ceil</code> rounds up to the next whole number, because you cannot recruit 513.6 deliveries. <code>int</code> makes it a plain integer.</li></ol>\n<p>Result: about <b>514 deliveries per group</b>. This matches the simulation: at 400 per group power was 70% and at 800 it was 95%, so 80% falls in between.</p>",
   "code": "sd = transit.std(ddof=1)\ngain = 0.5\n\nz_alpha = stats.norm.ppf(1 - 0.05 / 2)\nz_power = stats.norm.ppf(0.80)\n\nn_per_group = 2 * ((z_alpha + z_power) * sd / gain) ** 2\n\nprint(\"Standard deviation of transit time:\", round(sd, 3))\nprint(\"z for alpha = 0.05 (two-sided):\", round(z_alpha, 3))\nprint(\"z for 80% power:\", round(z_power, 3))\nprint(\"Deliveries needed per group:\", int(np.ceil(n_per_group)))\n"
  },
  {
   "id": "st-5-4-c1",
   "type": "check",
   "title": "Which is a Type II error in the express-lane pilot?",
   "body": "<p>Remember: Type I is a false alarm, Type II is a miss.</p>",
   "options": [
    "The pilot shows a significant saving, but the express lane actually changes nothing",
    "The pilot shows no significant saving, but the express lane really does save time",
    "The pilot is too expensive to run",
    "The pilot's p-value is exactly 0.05"
   ],
   "answer": 1,
   "why": [
    "That is a Type I error: a false alarm, rejecting a true H₀.",
    "Correct. A Type II error means failing to reject H₀ when H₁ is true: a real effect that the test missed.",
    "Cost is a practical issue, not a type of statistical error.",
    "A p-value at the threshold is not an error. It is just the boundary of the decision rule."
   ]
  },
  {
   "id": "st-5-4-ex1",
   "type": "exercise",
   "title": "Your turn: measure the false alarm rate with 100 per group",
   "body": "<p>Run an A/A experiment like the one in the lesson, but with <b>3,000 experiments</b> and <b>100 deliveries per group</b>. Draw <code>group_a</code> first and then <code>group_b</code> (in that order), both from <code>transit</code> with <code>rng.choice(transit, size=(3000, 100))</code>. Get the p-values with <code>welch_p_values</code> and print the share of p-values below 0.05, rounded to 3 decimals.</p>\n<p>Your output should be <code>0.046</code>, close to the 0.05 that α promises.</p>\n<p><b>Python connection:</b> <code>(p_values &lt; 0.05).mean()</code> turns each p-value into True or False and averages them, which gives the share that are True.</p>",
   "starter": "# transit, rng and welch_p_values are already loaded\n\n# Write your code below\n",
   "hints": [
    "group_a = rng.choice(transit, size=(3000, 100)); then group_b the same way; then p_values = welch_p_values(group_a, group_b).",
    "group_a = rng.choice(transit, size=(3000, 100))\ngroup_b = rng.choice(transit, size=(3000, 100))\np_values = welch_p_values(group_a, group_b)\nprint(round((p_values < 0.05).mean(), 3))\n"
   ],
   "solution": "group_a = rng.choice(transit, size=(3000, 100))\ngroup_b = rng.choice(transit, size=(3000, 100))\np_values = welch_p_values(group_a, group_b)\nprint(round((p_values < 0.05).mean(), 3))\n",
   "ordered": true
  },
  {
   "id": "st-5-4-ex2",
   "type": "exercise",
   "title": "Your turn: size a pilot for a 0.4-day gain",
   "body": "<p>The Operations Director now says even a <b>0.4-day</b> saving would justify the express lane. Use the sample-size formula with 5% significance (two-sided), 80% power and σ = the standard deviation of <code>transit</code>. Print the number of deliveries needed per group, rounded <b>up</b> to a whole number.</p>\n<p>Your output should be <code>803</code>.</p>\n<p><b>Think before you type:</b> compare with the 514 needed for 0.5 days. A slightly smaller gap pushed the requirement up a lot, because the gap is squared in the formula.</p>",
   "starter": "# transit, np and stats are already loaded\n\n# Write your code below\n",
   "hints": [
    "sd = transit.std(ddof=1); z_alpha = stats.norm.ppf(0.975); z_power = stats.norm.ppf(0.80); n = 2 * ((z_alpha + z_power) * sd / 0.4) ** 2; print(int(np.ceil(n))).",
    "sd = transit.std(ddof=1)\nz_alpha = stats.norm.ppf(1 - 0.05 / 2)\nz_power = stats.norm.ppf(0.80)\nn_per_group = 2 * ((z_alpha + z_power) * sd / 0.4) ** 2\nprint(int(np.ceil(n_per_group)))\n"
   ],
   "solution": "sd = transit.std(ddof=1)\nz_alpha = stats.norm.ppf(1 - 0.05 / 2)\nz_power = stats.norm.ppf(0.80)\nn_per_group = 2 * ((z_alpha + z_power) * sd / 0.4) ** 2\nprint(int(np.ceil(n_per_group)))\n",
   "ordered": true
  },
  {
   "id": "st-5-4-ex3",
   "type": "exercise",
   "title": "Your turn: the power of a 300-delivery pilot",
   "body": "<p>What if TradeFlow can only afford <b>300 deliveries per group</b>? Simulate <b>2,000 pilots</b> in which the express lane truly saves 0.5 days. Follow this order exactly: first <code>standard = rng.choice(transit, size=(2000, 300))</code>, then <code>express = rng.choice(transit, size=(2000, 300)) - 0.5</code>. Get the p-values with <code>welch_p_values(standard, express)</code> and print the share below 0.05 (the power), rounded to 2 decimals.</p>\n<p>Your output should be <code>0.58</code>.</p>\n<p><b>Think before you type:</b> the lesson found 40% power at 200 per group and 70% at 400. Your answer should fall between them, and well short of the 80% target.</p>",
   "starter": "# transit, rng and welch_p_values are already loaded\n\n# Write your code below\n",
   "hints": [
    "Subtract the true gain from the express group: rng.choice(...) - 0.5. Then power = (p_values < 0.05).mean().",
    "standard = rng.choice(transit, size=(2000, 300))\nexpress = rng.choice(transit, size=(2000, 300)) - 0.5\np_values = welch_p_values(standard, express)\nprint(round((p_values < 0.05).mean(), 2))\n"
   ],
   "solution": "standard = rng.choice(transit, size=(2000, 300))\nexpress = rng.choice(transit, size=(2000, 300)) - 0.5\np_values = welch_p_values(standard, express)\nprint(round((p_values < 0.05).mean(), 2))\n",
   "ordered": true
  },
  {
   "type": "explain",
   "title": "The multiple-testing trap",
   "body": "<p>Here is the most important warning in this whole module. Suppose you run <b>one</b> test at α = 0.05 on something where nothing is going on. The chance of a false alarm is 5%. Now suppose you run <b>20</b> such tests. The chance that <i>at least one</i> comes out “significant” by luck is:</p>\n<p style=\"text-align:center\"><b>1 − (1 − 0.05)<sup>20</sup> ≈ 64%</b></p>\n<p>That is better than a coin flip. If you slice your data twenty ways and announce the one that looks interesting, you will usually “find” something, and it will usually be luck. This habit has many names: <b>p-hacking</b>, <b>data dredging</b>, the <b>garden of forking paths</b>. It is rarely deliberate. Analysts look at many cuts of the data and only remember the interesting one.</p>\n<div class=\"callout analogy\"><b>Think of a lottery.</b> Each ticket has a tiny chance of winning, but if you buy 20 tickets, the chance that one of them wins is much bigger. Each extra test is another ticket in the “false alarm” lottery.</div>\n<p>Let's see it on real TradeFlow data. There are 5 countries and 4 payment methods, so 20 combinations. For each combination we ask: <i>is its cancellation rate different from the rest of the orders?</i> That is twenty tests of the two-proportion kind you met in Lesson 5.3.</p>"
  },
  {
   "type": "try",
   "title": "Twenty slices of the data: can one be special by luck alone?",
   "body": "<p>This box runs all 20 tests at once, then applies the two most common corrections. Do not worry about the length: every step is explained below.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>cells = master.groupby([\"country\", \"payment_method\"])[\"cancelled\"].agg([\"sum\", \"count\"]).reset_index()</code>: Group the orders by country and payment method (20 groups). For each group count the cancelled orders (<code>sum</code>) and all orders (<code>count</code>). <code>.reset_index()</code> turns the group labels back into ordinary columns.</li><li><code>c2 = master[\"cancelled\"].sum() - c1</code>: For each group, the number of cancelled orders <i>outside</i> that group: the total minus the group's own count. (<code>c1</code> and <code>n1</code> are arrays holding all 20 groups' counts, so every calculation is done for all 20 groups at once.)</li><li><code>z = (c1 / n1 - c2 / n2) / np.sqrt(...)</code>: The two-proportion z statistic from Lesson 5.3, calculated for all 20 groups in a single line.</li><li><code>cells[\"p_value\"] = 2 * stats.norm.sf(np.abs(z))</code>: Two-sided p-value for each group.</li><li><code>tests = cells.sort_values(\"p_value\")...</code>: Put the most “significant” result first.</li><li><code>bonferroni_cut = alpha / m</code>: <b>Bonferroni correction</b>: with m tests, only call a result significant if its p-value is below α divided by m. Here 0.05 ÷ 20 = 0.0025. It is simple and strict.</li><li><code>bh_cuts = ranks / m * alpha</code>: The <b>Benjamini-Hochberg</b> idea: instead of one threshold, compare the smallest p-value with α ÷ m, the second smallest with 2α ÷ m, and so on. It controls the share of false discoveries among your discoveries and is gentler than Bonferroni when you expect several real effects.</li><li><code>plt.plot(ranks, tests[\"p_value\"], \"o\", ...)</code>: Plot the sorted p-values as dots, with the correction lines for comparison. A result counts as a discovery only if its dot sits <i>below</i> the line.</li></ol>\n<p>The smallest p-value belongs to <b>South Africa customers paying by Mobile Money</b>: 487 orders with a cancellation rate of 7.6% against the overall 5.3%, p ≈ 0.020. Without correction that is one “significant” result out of 20, which is almost exactly the one false alarm we expect from 20 tests at α = 0.05. With Bonferroni's threshold of 0.0025 nothing survives, and neither does anything under Benjamini-Hochberg. A headline “South Africa Mobile Money customers cancel more!” would have been a false alarm.</p>",
   "code": "cells = master.groupby([\"country\", \"payment_method\"])[\"cancelled\"].agg([\"sum\", \"count\"]).reset_index()\n\nc1 = cells[\"sum\"].to_numpy()\nn1 = cells[\"count\"].to_numpy()\nc2 = master[\"cancelled\"].sum() - c1\nn2 = len(master) - n1\n\npooled = (c1 + c2) / (n1 + n2)\nz = (c1 / n1 - c2 / n2) / np.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))\ncells[\"rate\"] = c1 / n1\ncells[\"p_value\"] = 2 * stats.norm.sf(np.abs(z))\ntests = cells.sort_values(\"p_value\").reset_index(drop=True)\n\nm = len(tests)\nalpha = 0.05\nbonferroni_cut = alpha / m\nranks = np.arange(1, m + 1)\nbh_cuts = ranks / m * alpha\n\nprint(\"Number of tests:\", m)\nprint(\"Significant at 0.05 with no correction:\", (tests[\"p_value\"] < alpha).sum())\nprint(\"Bonferroni threshold:\", round(bonferroni_cut, 4))\nprint(\"Significant after Bonferroni:\", (tests[\"p_value\"] < bonferroni_cut).sum())\nprint(\"Smallest p-value:\", round(tests[\"p_value\"].iloc[0], 4))\nprint(tests.head(3).round(4))\n\nplt.plot(ranks, tests[\"p_value\"], \"o\", color=\"#4fc3f7\", label=\"Observed p-values (sorted)\")\nplt.plot(ranks, bh_cuts, color=\"#81c784\", label=\"Benjamini-Hochberg line\")\nplt.axhline(bonferroni_cut, color=\"#ff7b7b\", linestyle=\"--\", label=\"Bonferroni threshold\")\nplt.axhline(alpha, color=\"#f5b301\", linestyle=\":\", label=\"Naive 0.05\")\nplt.title(\"20 slices of the data: is any result really special?\")\nplt.xlabel(\"Test rank (smallest p-value first)\")\nplt.ylabel(\"p-value\")\nplt.legend()\nplt.show()\n"
  },
  {
   "type": "explain",
   "title": "How to stay honest when you test many things",
   "body": "<ul><li><b>Decide your questions before looking.</b> Write down the hypotheses you plan to test. A single pre-planned test needs no correction.</li>\n<li><b>Count your tests.</b> Every cut of the data you looked at counts, even the ones you did not report. “Significant” results found by exploring are <b>leads to confirm</b>, not conclusions.</li>\n<li><b>Use a correction when you test a family of questions.</b> Bonferroni (divide α by the number of tests) is simple and cautious. Benjamini-Hochberg is better when you test many things and accept that a few discoveries might be false. SciPy offers it as <code>stats.false_discovery_control</code>, and the statsmodels library offers several more.</li>\n<li><b>Confirm on new data.</b> If a slice looks special, test that single idea on fresh data (next quarter's orders, say). If it is real it will show up again.</li>\n<li><b>Plan sample size first.</b> An under-sized pilot wastes money either way: it misses real effects (low power) and its few “significant” findings are more likely to be false alarms or exaggerated.</li>\n<li><b>Report all the tests you ran</b>, not just the one that worked.</li></ul>\n<div class=\"callout watch\"><b>Small p-value, big claim, no replication.</b> If a result appears only because you looked in twenty places, it will almost never appear again. That is how headlines about miracle foods and magic hours of the day come and go.</div>"
  },
  {
   "id": "st-5-4-c2",
   "type": "check",
   "title": "The pilot used 50 deliveries per group and found no significant difference. The Operations Director concludes “the express lane doesn't work”. What is the best response?",
   "body": "<p>Use what you saw in the power simulation.</p>",
   "options": [
    "Agree: p was above 0.05, so the express lane does nothing",
    "Point out that with only 50 per group the test had low power, so it would often miss even a real half-day saving. The result is inconclusive, not negative",
    "Switch to α = 0.5 so the result becomes significant",
    "Run the test again until it comes out significant"
   ],
   "answer": 1,
   "why": [
    "Failing to reject is not proof of no effect, especially when the test had little chance of detecting one.",
    "Correct. Low power means a non-significant result carries little information. Either enlarge the pilot or report the result as inconclusive.",
    "Raising α to 0.5 would make false alarms 50% likely. That is not a test any more.",
    "Repeating until you get significance is p-hacking and makes the false alarm rate far higher than 5%."
   ]
  },
  {
   "id": "st-5-4-c3",
   "type": "check",
   "title": "An analyst tests 20 customer segments and finds one with p = 0.02. What should she report?",
   "body": "<p>All 20 tests were chosen after looking at the data.</p>",
   "options": [
    "“Segment 7 behaves differently (p = 0.02).” Nothing more is needed",
    "That one of 20 exploratory tests reached p = 0.02, which is about what chance alone produces, so it is a lead to confirm on new data and not a finding",
    "That the other 19 segments are all identical",
    "Nothing, because p-values are meaningless"
   ],
   "answer": 1,
   "why": [
    "Dropping the other 19 tests hides how many chances there were to get a false alarm.",
    "Correct. With 20 tests, about one false alarm is expected at α = 0.05. A correction such as Bonferroni would set the bar at 0.0025.",
    "We have no evidence about the other segments being “identical”. We only failed to find differences.",
    "p-values are useful when planned and interpreted correctly. The problem here is the number of tests."
   ]
  },
  {
   "id": "st-5-4-ex4",
   "type": "exercise",
   "title": "Your turn: count the discoveries with and without correction",
   "body": "<p>The table <code>slice_tests</code> already holds the 20 country-by-payment-method tests, with a <code>p_value</code> column. Print two lines: first the number of tests with p below 0.05 (no correction), then the number with p below the <b>Bonferroni threshold</b> 0.05 ÷ (number of tests). Print each as a whole number.</p>\n<p>Your output should be <code>1</code> then <code>0</code>.</p>\n<p><b>Python connection:</b> <code>(slice_tests[\"p_value\"] &lt; 0.05).sum()</code> counts the rows where the condition is True. <code>len(slice_tests)</code> is the number of rows. <code>int(...)</code> turns the count into a plain whole number.</p>",
   "starter": "# slice_tests is already loaded: 20 rows, with a p_value column\n\n# Write your code below\n",
   "hints": [
    "m = len(slice_tests); the first count uses 0.05, the second uses 0.05 / m. Wrap each in int(...) before printing.",
    "m = len(slice_tests)\nprint(int((slice_tests[\"p_value\"] < 0.05).sum()))\nprint(int((slice_tests[\"p_value\"] < 0.05 / m).sum()))\n"
   ],
   "solution": "m = len(slice_tests)\nprint(int((slice_tests[\"p_value\"] < 0.05).sum()))\nprint(int((slice_tests[\"p_value\"] < 0.05 / m).sum()))\n",
   "ordered": true
  },
  {
   "id": "st-5-4-ex5",
   "type": "exercise",
   "title": "Your turn: how likely is a false alarm among 20 tests?",
   "body": "<p>With m = 20 independent tests, calculate and print three numbers, each on its own line and rounded to 4 decimals:</p>\n<ol><li>the probability of at least one false alarm at α = 0.05: <code>1 - (1 - 0.05) ** m</code></li>\n<li>the Bonferroni threshold: <code>0.05 / m</code></li>\n<li>the probability of at least one false alarm when each test uses the Bonferroni threshold: <code>1 - (1 - 0.05 / m) ** m</code></li></ol>\n<p>Your output should be <code>0.6415</code>, <code>0.0025</code>, <code>0.0488</code>.</p>\n<p><b>Think before you type:</b> the first number is the 64% you read about. The third shows what Bonferroni buys: the chance of any false alarm drops back to roughly 5% for the whole family of tests.</p>",
   "starter": "# Write your code below\nm = 20\n",
   "hints": [
    "Probability of no false alarm in one test is 1 - alpha. For m independent tests it is (1 - alpha) ** m. At least one is 1 minus that.",
    "m = 20\nprint(round(1 - (1 - 0.05) ** m, 4))\nprint(round(0.05 / m, 4))\nprint(round(1 - (1 - 0.05 / m) ** m, 4))\n"
   ],
   "solution": "m = 20\nprint(round(1 - (1 - 0.05) ** m, 4))\nprint(round(0.05 / m, 4))\nprint(round(1 - (1 - 0.05 / m) ** m, 4))\n",
   "ordered": true
  },
  {
   "type": "explain",
   "title": "What you should take away from Lesson 5.4",
   "body": "<ul><li>A <b>Type I error</b> is a false alarm (rejecting a true H₀). Its probability is α. A <b>Type II error</b> is a miss, with probability β. <b>Power = 1 − β</b>.</li>\n<li>When H₀ is true, p-values are spread evenly between 0 and 1, which is why α = 0.05 means 5% false alarms.</li>\n<li>Power rises with <b>sample size</b>, with the <b>size of the real effect</b>, with less <b>noise</b> and with a larger <b>α</b>. Plan the sample size <i>before</i> the pilot: n per group = 2 × ((z<sub>α</sub> + z<sub>power</sub>) × σ ÷ Δ)².</li>\n<li>A non-significant result from a low-power test is <b>inconclusive</b>, not negative.</li>\n<li>With many tests the false alarm chance explodes (about 64% for 20 tests). Use <b>Bonferroni</b> or <b>Benjamini-Hochberg</b>, confirm leads on new data, and report every test you ran.</li></ul>\n<p><b>Interview questions to practise</b></p>\n<ol><li><i>“What is the difference between Type I and Type II errors?”</i> Model answer: “Type I is a false positive: acting on an effect that is not there. Type II is a false negative: missing an effect that is. α controls the first. Power controls the second.”</li>\n<li><i>“How do you decide the sample size for an experiment?”</i> Model answer: “I fix α and the power I want (usually 5% and 80%), estimate the noise from past data, and decide the smallest effect worth detecting. The formula or a simulation then gives the sample size.”</li>\n<li><i>“We tested 15 metrics and one is significant at 0.04. Is it real?”</i> Model answer: “Probably not on its own. With 15 tests we expect about one false alarm. I would apply a correction and confirm on new data before acting.”</li></ol>\n<h4>Module 5 recap</h4>\n<ul><li><b>5.1</b> The logic of hypothesis testing: H₀, H₁, test statistics, p-values and the permutation test.</li>\n<li><b>5.2</b> t-tests for one and two averages, with confidence intervals and effect sizes.</li>\n<li><b>5.3</b> Tests for proportions and for relationships between categories.</li>\n<li><b>5.4</b> How tests go wrong: errors, power, sample size and multiple testing.</li></ul>\n<p>The most important lesson of the module: a hypothesis test is an <b>argument</b>, not an oracle. A good analyst states the claim before looking, chooses a fair comparison, reports the size of the effect with its uncertainty, and says honestly how many things were tried.</p>\n<p>In Module 6 we move from “is there a difference?” to “how are two numbers <b>related</b>?”, with correlation and regression: how does order value change with quantity, and can we predict delivery time?</p>"
  }
 ]
}
);
