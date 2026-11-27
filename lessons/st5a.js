LESSONS.push(
{
 "id": "st-5-1",
 "track": "statistics",
 "lang": "python",
 "packages": [
  "pandas",
  "numpy",
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
 "setup": "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\ndeliveries = pd.read_csv(\"deliveries.csv\")\norders = pd.read_csv(\"orders.csv\")\ncustomers = pd.read_csv(\"customers.csv\")\norder_items = pd.read_csv(\"order_items.csv\")\nproducts = pd.read_csv(\"products.csv\")\n\n# Days in transit for every delivery that has both a dispatch date and a delivery date.\ndeliveries[\"dispatch_date\"] = pd.to_datetime(deliveries[\"dispatch_date\"], errors=\"coerce\")\ndeliveries[\"delivery_date\"] = pd.to_datetime(deliveries[\"delivery_date\"], errors=\"coerce\")\ndeliveries[\"transit_days\"] = (\n    deliveries[\"delivery_date\"] - deliveries[\"dispatch_date\"]\n).dt.days\n\n# trips: one row per finished delivery (status Delivered or Delayed), with the customer's country.\ntrips = (\n    deliveries.loc[deliveries[\"transit_days\"].notna() & (deliveries[\"transit_days\"] >= 0)]\n    .merge(orders[[\"order_id\", \"customer_id\"]], on=\"order_id\", validate=\"many_to_one\")\n    .merge(customers[[\"customer_id\", \"country\"]], on=\"customer_id\", validate=\"many_to_one\")\n    .reset_index(drop=True)\n)\n\n# lines: one row per order line, with its value and product category.\nlines = order_items.merge(\n    products[[\"product_id\", \"category\"]], on=\"product_id\", validate=\"many_to_one\"\n)\nlines[\"line_value\"] = lines[\"quantity\"] * lines[\"unit_price\"]\nlines[\"is_electronics\"] = lines[\"category\"] == \"Electronics\"\n\nrng = np.random.default_rng(5101)\n",
 "preloaded": [
  "trips",
  "lines",
  "rng"
 ],
 "title": "5.1 The logic of hypothesis testing: null, p-value and the permutation test",
 "tables": [],
 "intro": "TradeFlow's Finance Director has spotted something odd in the courier invoices. The courier marks 655 deliveries as <b>Delayed</b>, and the contract lets TradeFlow claim a penalty on every one of them. “Before I send a claim,” she says, “show me that Delayed parcels really did take longer than the others.”<br><br>The Operations Director has his own belief: customers in Kenya wait longer than customers in Ghana. And the pricing manager is sure that Electronics lines are worth far more than everything else.<br><br>Three claims. Each sounds reasonable. Each can be checked against the data. But there is a catch that trips up beginners and professionals alike: <b>two groups never have exactly the same average, even when nothing is going on</b>. So the real question is never “are the averages different?” (they always are) but “is the difference bigger than luck alone would produce?”<br><br>That question is what a <b>hypothesis test</b> answers. In this lesson you will learn the whole logic from scratch: the null and alternative hypothesis, the test statistic, the p-value, the significance level, and how to say your conclusion in plain words. You will build the test yourself by shuffling TradeFlow's own data, so every idea is something you can see and run, not a formula to memorise.",
 "steps": [
  {
   "type": "explain",
   "title": "Three claims, one problem: averages are never identical",
   "body": "<p>Let's start with the Finance Director's claim, because it hides the whole problem in one number.</p>\n<p>Out of TradeFlow's finished deliveries, 655 are flagged <b>Delayed</b> and 7,606 are flagged <b>Delivered</b>. The average time in transit for Delayed parcels is 5.508 days. For Delivered parcels it is 5.514 days.</p>\n<p>Those two numbers are not identical. Does that mean something is going on? Not by itself. Imagine measuring the height of two random groups of people from the same town. Their averages will differ in the second or third decimal place, simply because different people ended up in each group. Nobody would conclude that one group is “really” taller.</p>\n<div class=\"callout analogy\"><b>Think of two handfuls of rice.</b> Scoop two handfuls from the same sack and weigh the grains in each. The totals will not match exactly, and nobody blames the sack. The difference is just <i>which grains happened to land in which hand</i>. Statisticians call this <b>sampling variation</b>: the natural wobble you get from the luck of the draw.</div>\n<p>A hypothesis test is a careful way of asking: <b>is the gap I see bigger than the wobble I would get anyway?</b> If it is much bigger, I have real evidence. If it is about the same size, the gap tells me nothing.</p>"
  },
  {
   "type": "explain",
   "title": "The courtroom idea: the null hypothesis",
   "body": "<p>Every hypothesis test starts by writing down two competing stories.</p>\n<p>The first story is the boring one: <b>nothing is going on</b>. It is called the <b>null hypothesis</b> and written <b>H₀</b> (say “H-naught” or “H-zero”). “Null” just means “no effect, no difference”.</p>\n<p>The second story is the interesting one: <b>something is going on</b>. It is called the <b>alternative hypothesis</b> and written <b>H₁</b>. It is the claim you suspect is true and want evidence for.</p>\n<div class=\"callout analogy\"><b>Think of a courtroom.</b> The accused is presumed innocent (that is H₀). The prosecutor must bring evidence strong enough to convince the jury beyond reasonable doubt (that is H₁). If the evidence is weak, the verdict is “not guilty”. Notice that “not guilty” does <i>not</i> mean “proven innocent”. It means “the prosecutor did not prove their case”. Hypothesis testing works exactly the same way, and we will come back to this point because it matters a lot.</div>\n<p>Here are TradeFlow's three claims written as hypotheses:</p>\n<table class=\"mini\"><tr><th>Who</th><th>Claim in words</th><th>H₀ (nothing going on)</th><th>H₁ (something going on)</th></tr>\n<tr><td>Finance Director</td><td>Delayed parcels really take longer</td><td>Delayed and Delivered parcels take the same time on average</td><td>Delayed parcels take longer on average</td></tr>\n<tr><td>Operations Director</td><td>Kenya waits longer than Ghana</td><td>Kenya and Ghana have the same average transit time</td><td>The averages are different</td></tr>\n<tr><td>Pricing manager</td><td>Electronics lines are worth more</td><td>Electronics and other lines have the same average value</td><td>The averages are different</td></tr></table>\n<p>Look at how each H₀ is written: always as “the same”, “no difference”. That is on purpose. We pretend H₀ is true, and then ask how surprised we should be by the data we actually collected.</p>"
  },
  {
   "type": "try",
   "title": "Step 1: measure the gap we actually saw",
   "body": "<p>Before any testing, we need the exact size of the gap in the real data. We will call it the <b>observed gap</b>. It is our <b>test statistic</b>: the single number that summarises how far the data is from “nothing going on”.</p>\n<p>Press <b>Run</b> and read the output. Then read the explanation underneath, line by line, until every line makes sense.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>delayed = trips.loc[trips[\"delivery_status\"] == \"Delayed\", \"transit_days\"]</code>: <code>trips</code> is a table with one row per finished delivery. <code>.loc[ rows, column ]</code> picks rows and a column. The rows are the ones where the status equals “Delayed”, and the column is <code>transit_days</code>. The result is a list of numbers, one per Delayed delivery, stored under the name <code>delayed</code>.</li><li><code>delivered = trips.loc[trips[\"delivery_status\"] == \"Delivered\", \"transit_days\"]</code>: The same idea for Delivered parcels.</li><li><code>mean_delayed = delayed.mean()</code>: <code>.mean()</code> adds the numbers up and divides by how many there are: the average.</li><li><code>mean_delivered = delivered.mean()</code>: The average for the Delivered group.</li><li><code>observed_gap = mean_delayed - mean_delivered</code>: Subtract one average from the other. A positive answer would mean Delayed parcels are slower. A negative answer would mean they are faster. Zero would mean identical.</li><li><code>print(\"Delayed deliveries:\", len(delayed))</code>: <code>len(...)</code> counts how many items are in the list. <code>print</code> shows it on screen. We always print the group sizes: a test means little if you do not know how many rows are behind it.</li><li><code>round(mean_delayed, 3)</code>: <code>round(x, 3)</code> trims a number to 3 decimal places so it is easy to read.</li></ol>",
   "code": "delayed = trips.loc[trips[\"delivery_status\"] == \"Delayed\", \"transit_days\"]\ndelivered = trips.loc[trips[\"delivery_status\"] == \"Delivered\", \"transit_days\"]\n\nmean_delayed = delayed.mean()\nmean_delivered = delivered.mean()\nobserved_gap = mean_delayed - mean_delivered\n\nprint(\"Delayed deliveries:\", len(delayed))\nprint(\"Delivered deliveries:\", len(delivered))\nprint(\"Average days, Delayed:\", round(mean_delayed, 3))\nprint(\"Average days, Delivered:\", round(mean_delivered, 3))\nprint(\"Observed gap (Delayed minus Delivered):\", round(observed_gap, 4))\n"
  },
  {
   "type": "explain",
   "title": "The key question: what would luck alone produce?",
   "body": "<p>The observed gap is -0.0059 days. Is that big or small? We cannot tell from the number alone. We need a yardstick: <b>how big do gaps get when there is truly no difference?</b></p>\n<p>Here is a clever way to build that yardstick using nothing but the data we already have.</p>\n<div class=\"callout analogy\"><b>Think of name tags in a hat.</b> Imagine every one of the 8,261 deliveries wrote its transit time on a card. Each card also has a name tag: “Delayed” or “Delivered”. If H₀ is true, the name tag is <i>meaningless</i>. It tells you nothing about the transit time. So if we tear off all the name tags, throw them in a hat, and stick them back onto the cards at random, we get a world that is just as believable as the real one, because the tags never mattered anyway.</div>\n<p>That gives us a recipe. It is called a <b>permutation test</b> (a “permutation” is just a reshuffling):</p>\n<ol><li>Measure the real gap. (Done in Step 1.)</li>\n<li>Shuffle the name tags at random, keeping the same number of Delayed and Delivered tags. Measure the gap again. This is one “what luck produces” gap.</li>\n<li>Repeat step 2 thousands of times. You now have thousands of gaps from a world where H₀ is true.</li>\n<li>Look where the real gap sits among them. If the real gap is out in the far tail, luck rarely produces it, so H₀ looks doubtful. If it sits in the middle of the pile, luck produces gaps like it all the time, so the real gap proves nothing.</li></ol>\n<p>Why do professionals like this method? Because it needs no formulas and no assumptions about bell curves. It works on whatever shape your data has, and it explains exactly what a p-value <i>means</i>. In the next lesson we will meet the classic formula shortcut, the t-test, and you will see that it answers the same question.</p>"
  },
  {
   "type": "try",
   "title": "Step 2: shuffle the name tags once",
   "body": "<p>Let's do one single shuffle and compare it with the real gap.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>days = trips[\"transit_days\"].to_numpy()</code>: Take the transit times and turn them into a plain NumPy array. Arrays are fast and let us shuffle and slice easily.</li><li><code>is_delayed = (trips[\"delivery_status\"] == \"Delayed\").to_numpy()</code>: For every delivery this gives True (the tag says Delayed) or False. This list of True/False values <i>is</i> the name tags.</li><li><code>n_delayed = is_delayed.sum()</code>: Python treats True as 1 and False as 0, so adding them up counts the Delayed parcels. We need this number to give the right number of tags back after shuffling.</li><li><code>observed_gap = days[is_delayed].mean() - days[~is_delayed].mean()</code>: <code>days[is_delayed]</code> keeps only the times where the tag is True. The <code>~</code> symbol means “not”, so <code>days[~is_delayed]</code> keeps the others. The result is the same gap as before.</li><li><code>shuffled_days = rng.permutation(days)</code>: <code>rng</code> is our random number generator (it has a fixed seed, so you get the same answer every time you run). <code>.permutation(days)</code> returns the same numbers in a random new order. Shuffling the times while leaving the tags in place is the same as shuffling the tags.</li><li><code>fake_delayed = shuffled_days[:n_delayed]</code>: The square brackets <code>[:n_delayed]</code> mean “the first n_delayed items”. After shuffling, these play the role of the Delayed group.</li><li><code>fake_delivered = shuffled_days[n_delayed:]</code>: <code>[n_delayed:]</code> means “everything after the first n_delayed items”. These play the Delivered group.</li><li><code>fake_gap = fake_delayed.mean() - fake_delivered.mean()</code>: The gap in the shuffled world, where tags mean nothing.</li></ol>\n<p>Because the random generator has a fixed seed, running this box again gives the same shuffle, so do not expect new numbers. The point is the idea: in a world where the tags mean nothing, we still got a gap that is not zero. Luck alone makes the two groups differ a little.</p>",
   "code": "days = trips[\"transit_days\"].to_numpy()\nis_delayed = (trips[\"delivery_status\"] == \"Delayed\").to_numpy()\nn_delayed = is_delayed.sum()\n\nobserved_gap = days[is_delayed].mean() - days[~is_delayed].mean()\n\nshuffled_days = rng.permutation(days)\nfake_delayed = shuffled_days[:n_delayed]\nfake_delivered = shuffled_days[n_delayed:]\nfake_gap = fake_delayed.mean() - fake_delivered.mean()\n\nprint(\"Real gap:\", round(observed_gap, 4))\nprint(\"Gap after one shuffle:\", round(fake_gap, 4))\n"
  },
  {
   "type": "try",
   "title": "Step 3: shuffle 5,000 times and look at the pile",
   "body": "<p>One shuffle tells us little. Five thousand shuffles give us a proper yardstick. This code repeats the shuffle in a <b>loop</b>, saves every gap, and draws a histogram (a bar chart that counts how many gaps fall in each range).</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>n_shuffles = 5000</code>: How many times we repeat. More shuffles give a steadier answer. 5,000 is plenty for everyday work.</li><li><code>shuffled_gaps = np.empty(n_shuffles)</code>: Make an empty box with 5,000 slots to hold the gaps we are about to measure.</li><li><code>for i in range(n_shuffles):</code>: A loop. <code>range(5000)</code> counts 0, 1, 2 ... 4999 and the lines indented underneath run once for each count. <code>i</code> is the current count.</li><li><code>    shuffled = rng.permutation(days)</code>: Shuffle the times, exactly like Step 2.</li><li><code>    shuffled_gaps[i] = ...</code>: Measure the shuffled gap and put it in slot number <code>i</code> of the box.</li><li><code>as_extreme = np.sum(np.abs(shuffled_gaps) &gt;= abs(observed_gap))</code>: <code>abs</code> drops the minus sign, so we measure the <i>size</i> of a gap whichever direction it points. The comparison <code>&gt;=</code> gives True for every shuffle whose gap is at least as big as the real one. <code>np.sum</code> counts the True values. So this is: “in how many shuffles did luck do at least as well as reality?”</li><li><code>p_value = (as_extreme + 1) / (n_shuffles + 1)</code>: The share of shuffles that were that extreme. The “+ 1” on top and bottom is the professional convention: the real arrangement is itself one possible arrangement, so the count can never honestly be zero. We will say more about it in a moment.</li><li><code>plt.hist(...)</code>: Draw the histogram of all 5,000 shuffled gaps.</li><li><code>plt.axvline(observed_gap, ...)</code>: Draw a vertical red line where the real gap sits, so you can see it against the pile.</li></ol>\n<p><b>What to look for:</b> the pile is centred on zero, as it should be when tags mean nothing. Where does the red line sit?</p>",
   "code": "days = trips[\"transit_days\"].to_numpy()\nis_delayed = (trips[\"delivery_status\"] == \"Delayed\").to_numpy()\nn_delayed = is_delayed.sum()\nobserved_gap = days[is_delayed].mean() - days[~is_delayed].mean()\n\nn_shuffles = 5000\nshuffled_gaps = np.empty(n_shuffles)\nfor i in range(n_shuffles):\n    shuffled = rng.permutation(days)\n    shuffled_gaps[i] = shuffled[:n_delayed].mean() - shuffled[n_delayed:].mean()\n\nas_extreme = np.sum(np.abs(shuffled_gaps) >= abs(observed_gap))\np_value = (as_extreme + 1) / (n_shuffles + 1)\n\nprint(\"Shuffles at least as extreme as the real gap:\", as_extreme)\nprint(\"p-value (two-sided):\", round(p_value, 4))\n\nplt.hist(shuffled_gaps, bins=40, color=\"#4fc3f7\")\nplt.axvline(observed_gap, color=\"#ff7b7b\", linewidth=2, label=\"Real gap\")\nplt.title(\"Gaps produced by luck alone (5,000 shuffles)\")\nplt.xlabel(\"Average days, Delayed minus Delivered\")\nplt.ylabel(\"Number of shuffles\")\nplt.legend()\nplt.show()\n"
  },
  {
   "type": "explain",
   "title": "The p-value in plain words",
   "body": "<p>The number you just printed is the famous <b>p-value</b>. Here is its meaning in one careful sentence:</p>\n<div class=\"callout tip\"><b>Definition.</b> The p-value is the probability of seeing a gap <i>at least this big</i> if the null hypothesis were true and luck alone were at work.</div>\n<p>Our result: <b>4,778 out of 5,000</b> shuffles produced a gap at least as large as the real one (0.0059 days). The p-value is therefore about <b>0.96</b>. In words: if the Delayed flag meant nothing, we would see a gap this small or bigger in about 96 out of every 100 random reshuffles. That is completely ordinary. The real gap sits right in the middle of the pile, and the data gives no sign that Delayed parcels are slower.</p>\n<p>Small p-values mean “luck rarely does this, so I doubt H₀”. Large p-values mean “luck does this all the time, so the data cannot argue against H₀”.</p>\n<div class=\"callout watch\"><b>What a p-value is NOT.</b> It is <b>not</b> the probability that H₀ is true. It is <b>not</b> the probability that your result happened “by chance”. It says nothing about how <i>big</i> or <i>important</i> an effect is. It only measures how surprising the data would be <i>if</i> H₀ were true. Many published mistakes come from forgetting this.</div>\n<p><b>One-sided or two-sided?</b> The Finance Director cares only about Delayed being <i>slower</i>. A <b>one-sided</b> test counts only shuffles with a gap as large <i>in that direction</i>. The Operations Director just said “different”, in either direction, which needs a <b>two-sided</b> test: count shuffles that are extreme in either direction, which is what <code>abs</code> does. Choose before you look at the data. If you pick the side after peeking, you cheat yourself.</p>\n<p><b>The “+ 1” rule.</b> Suppose none of 5,000 shuffles beat the real gap. Writing p = 0 would claim the impossible. The honest statement is “p is less than about 1 in 5,001”. Adding one to the count and one to the total gives exactly that, and it is the standard used in industry.</p>"
  },
  {
   "id": "st-5-1-c1",
   "type": "check",
   "title": "What does p ≈ 0.96 tell the Finance Director?",
   "body": "<p>The two-sided permutation p-value for the Delayed versus Delivered gap came out near 0.96.</p>",
   "options": [
    "There is a 96% chance that the Delayed flag is meaningless",
    "If the flag were meaningless, gaps at least this large would turn up in about 96% of random shuffles, so the data gives no evidence that Delayed parcels are slower",
    "TradeFlow has proven that the courier is flagging parcels wrongly",
    "There is a 4% chance that Delayed parcels are slower"
   ],
   "answer": 1,
   "why": [
    "A p-value is not the probability that a hypothesis is true. It describes how surprising the data is <i>if</i> H₀ were true.",
    "Correct. A large p-value means the gap is the kind of thing luck produces easily. It is not strong evidence against H₀.",
    "Too strong. Having no evidence of a difference is not proof of anything about the courier. The flag may be based on something else, such as a promised delivery date.",
    "This turns the p-value upside down. It is not a probability about the hypothesis, in either direction."
   ]
  },
  {
   "id": "st-5-1-ex1",
   "type": "exercise",
   "title": "Your turn: measure the observed gap",
   "body": "<p>Calculate the observed gap between the average transit time of <b>Delayed</b> deliveries and <b>Delivered</b> deliveries in the <code>trips</code> table. Take Delayed <b>minus</b> Delivered, and print it rounded to 4 decimal places.</p>\n<p>Your output should be <code>-0.0059</code>.</p>\n<p><b>Think before you type:</b> you need two lists of numbers, one per status, then two averages, then one subtraction. Step 1 of the lesson did exactly this.</p>\n<p><b>Python connection:</b> <code>trips.loc[condition, \"column\"]</code> keeps the rows where the condition is True and returns one column. <code>round(x, 4)</code> keeps four decimals.</p>",
   "starter": "# trips is already loaded\n\n# Write your code below\n",
   "hints": [
    "Make two lists: trips.loc[trips[\"delivery_status\"] == \"Delayed\", \"transit_days\"] and the same with \"Delivered\". Take .mean() of each.",
    "delayed = trips.loc[trips[\"delivery_status\"] == \"Delayed\", \"transit_days\"]\ndelivered = trips.loc[trips[\"delivery_status\"] == \"Delivered\", \"transit_days\"]\nobserved_gap = delayed.mean() - delivered.mean()\nprint(round(observed_gap, 4))\n"
   ],
   "solution": "delayed = trips.loc[trips[\"delivery_status\"] == \"Delayed\", \"transit_days\"]\ndelivered = trips.loc[trips[\"delivery_status\"] == \"Delivered\", \"transit_days\"]\nobserved_gap = delayed.mean() - delivered.mean()\nprint(round(observed_gap, 4))\n",
   "ordered": true
  },
  {
   "id": "st-5-1-ex2",
   "type": "exercise",
   "title": "Your turn: Kenya against Ghana",
   "body": "<p>The Operations Director believes Kenya waits longer than Ghana. Run a <b>two-sided permutation test</b> and print the p-value rounded to 2 decimals. Follow these steps exactly, so your random shuffles match the checker's:</p>\n<ol><li>Keep only the rows where <code>country</code> is Kenya or Ghana: <code>pair = trips[trips[\"country\"].isin([\"Kenya\", \"Ghana\"])]</code>.</li>\n<li>Get <code>days</code> (the transit times as an array) and <code>is_kenya</code> (True for Kenya rows), and <code>n_kenya = is_kenya.sum()</code>.</li>\n<li>The observed gap is the Kenya average minus the Ghana average.</li>\n<li>Do 5,000 shuffles with <code>rng.permutation(days)</code>. In each, the <b>first <code>n_kenya</code></b> shuffled values play Kenya and the rest play Ghana.</li>\n<li>Count shuffles whose gap is at least as big in size as the real gap (use <code>abs</code>), then <code>p = (count + 1) / (5000 + 1)</code>.</li></ol>\n<p>Your output should be <code>0.14</code>.</p>\n<p><b>Python connection:</b> this is the Step 3 code with a different pair of groups. <code>.isin([...])</code> asks “is this value in the list?” for every row.</p>",
   "starter": "# trips and rng are already loaded\npair = trips[trips[\"country\"].isin([\"Kenya\", \"Ghana\"])]\n\n# 1. days (array), is_kenya (True/False array), n_kenya\n# 2. observed_gap: Kenya average minus Ghana average\n# 3. loop 5,000 times: shuffle days, measure the gap\n# 4. count the shuffles at least as extreme, then the p-value\n",
   "hints": [
    "Copy the structure of Step 3. Replace the Delayed tags with is_kenya, and use n_kenya instead of n_delayed.",
    "pair = trips[trips[\"country\"].isin([\"Kenya\", \"Ghana\"])]\ndays = pair[\"transit_days\"].to_numpy()\nis_kenya = (pair[\"country\"] == \"Kenya\").to_numpy()\nn_kenya = is_kenya.sum()\nobserved_gap = days[is_kenya].mean() - days[~is_kenya].mean()\n\nn_shuffles = 5000\nshuffled_gaps = np.empty(n_shuffles)\nfor i in range(n_shuffles):\n    shuffled = rng.permutation(days)\n    shuffled_gaps[i] = shuffled[:n_kenya].mean() - shuffled[n_kenya:].mean()\n\nas_extreme = np.sum(np.abs(shuffled_gaps) >= abs(observed_gap))\np_value = (as_extreme + 1) / (n_shuffles + 1)\nprint(round(p_value, 2))\n"
   ],
   "solution": "pair = trips[trips[\"country\"].isin([\"Kenya\", \"Ghana\"])]\ndays = pair[\"transit_days\"].to_numpy()\nis_kenya = (pair[\"country\"] == \"Kenya\").to_numpy()\nn_kenya = is_kenya.sum()\nobserved_gap = days[is_kenya].mean() - days[~is_kenya].mean()\n\nn_shuffles = 5000\nshuffled_gaps = np.empty(n_shuffles)\nfor i in range(n_shuffles):\n    shuffled = rng.permutation(days)\n    shuffled_gaps[i] = shuffled[:n_kenya].mean() - shuffled[n_kenya:].mean()\n\nas_extreme = np.sum(np.abs(shuffled_gaps) >= abs(observed_gap))\np_value = (as_extreme + 1) / (n_shuffles + 1)\nprint(round(p_value, 2))\n",
   "ordered": true
  },
  {
   "type": "explain",
   "title": "Making the call: the significance level",
   "body": "<p>The Kenya versus Ghana p-value is about <b>0.14</b>. Kenya's average transit is 5.588 days and Ghana's is 5.440, a gap of 0.148 days. Is that convincing enough to tell the Operations Director he is right?</p>\n<p>To make the call consistently, analysts agree on a cut-off <i>before</i> looking at the data. It is called the <b>significance level</b>, written <b>α</b> (alpha). The usual choice is <b>α = 0.05</b>, meaning: “I will only claim a difference if luck would produce a gap this big less than 5% of the time.” The rule is:</p>\n<table class=\"mini\"><tr><th>If the p-value is…</th><th>Decision</th><th>Plain-words meaning</th></tr>\n<tr><td>at or below α (≤ 0.05)</td><td><b>Reject H₀</b></td><td>The gap is too big to blame on luck. The data supports H₁.</td></tr>\n<tr><td>above α (&gt; 0.05)</td><td><b>Fail to reject H₀</b></td><td>The gap is the kind of thing luck produces. The data does not support H₁.</td></tr></table>\n<p>For Kenya versus Ghana, 0.14 is above 0.05, so we <b>fail to reject H₀</b>: “We do not have enough evidence that Kenya's deliveries take longer than Ghana's.”</p>\n<div class=\"callout watch\"><b>Never write “accept H₀”.</b> Remember the courtroom: “not guilty” is not “innocent”. Failing to reject H₀ means “the evidence was not strong enough”, not “we proved the two countries are identical”. There might be a small real difference that our data was too limited to detect. The correct wording is always <i>reject</i> or <i>fail to reject</i>.</div>\n<p>Why 0.05? It is a convention, not a law of nature. Some fields use 0.01 when a wrong claim is costly (medicine), and some use 0.10 for early exploration. What matters is choosing α <i>before</i> looking at the p-value and not shopping around for whichever cut-off gives the answer you wanted.</p>"
  },
  {
   "id": "st-5-1-c2",
   "type": "check",
   "title": "Kenya versus Ghana: p ≈ 0.14 at α = 0.05. What is the correct statement?",
   "body": "<p>Choose the wording a careful analyst would put in the report to the Operations Director.</p>",
   "options": [
    "Kenya and Ghana have exactly the same delivery times",
    "We do not have enough evidence at the 5% level to say Kenya's average transit time differs from Ghana's. This does not prove they are the same",
    "There is a 14% chance that Kenya is slower",
    "We accept the null hypothesis, so the Operations Director is wrong"
   ],
   "answer": 1,
   "why": [
    "The data cannot prove exact equality. The observed averages differ by about 0.15 days. We simply cannot rule out that luck produced that.",
    "Correct. This is the honest “fail to reject” wording: no evidence of a difference, which is different from evidence of no difference.",
    "p-values are not probabilities about the hypothesis. Also 14% describes how often luck produces such a gap, if H₀ is true.",
    "We never “accept” H₀. We only fail to find enough evidence against it, and that does not mean the Operations Director is wrong."
   ]
  },
  {
   "id": "st-5-1-ex3",
   "type": "exercise",
   "title": "Your turn: a one-sided test for the Finance Director",
   "body": "<p>The Finance Director's claim is one-directional: Delayed parcels take <b>longer</b>. That calls for a <b>one-sided</b> p-value. Using all 5,000 shuffles of Delayed versus Delivered, count the shuffles whose gap is <b>greater than or equal to the observed gap</b> (no <code>abs</code> this time) and print <code>(count + 1) / (5000 + 1)</code> rounded to 2 decimals.</p>\n<p>Your output should be <code>0.51</code>.</p>\n<p><b>Think before you type:</b> in the two-sided test we compared sizes with <code>abs</code>. A one-sided test looks at only one tail, so we compare the gaps themselves. Because the real gap is slightly <i>negative</i>, about half of all shuffled gaps are bigger than it, so the one-sided p is near one half.</p>\n<p><b>Python connection:</b> <code>shuffled_gaps &gt;= observed_gap</code> compares each of the 5,000 gaps with the real one and gives True or False for each. <code>np.sum</code> counts the True values.</p>",
   "starter": "# trips and rng are already loaded\ndays = trips[\"transit_days\"].to_numpy()\nis_delayed = (trips[\"delivery_status\"] == \"Delayed\").to_numpy()\nn_delayed = is_delayed.sum()\nobserved_gap = days[is_delayed].mean() - days[~is_delayed].mean()\n\n# Write your code below: 5,000 shuffles, then the one-sided p-value\n",
   "hints": [
    "Use the same loop as Step 3. Only the counting line changes: np.sum(shuffled_gaps >= observed_gap).",
    "days = trips[\"transit_days\"].to_numpy()\nis_delayed = (trips[\"delivery_status\"] == \"Delayed\").to_numpy()\nn_delayed = is_delayed.sum()\nobserved_gap = days[is_delayed].mean() - days[~is_delayed].mean()\n\nn_shuffles = 5000\nshuffled_gaps = np.empty(n_shuffles)\nfor i in range(n_shuffles):\n    shuffled = rng.permutation(days)\n    shuffled_gaps[i] = shuffled[:n_delayed].mean() - shuffled[n_delayed:].mean()\n\nas_extreme = np.sum(shuffled_gaps >= observed_gap)\np_one_sided = (as_extreme + 1) / (n_shuffles + 1)\nprint(round(p_one_sided, 2))\n"
   ],
   "solution": "days = trips[\"transit_days\"].to_numpy()\nis_delayed = (trips[\"delivery_status\"] == \"Delayed\").to_numpy()\nn_delayed = is_delayed.sum()\nobserved_gap = days[is_delayed].mean() - days[~is_delayed].mean()\n\nn_shuffles = 5000\nshuffled_gaps = np.empty(n_shuffles)\nfor i in range(n_shuffles):\n    shuffled = rng.permutation(days)\n    shuffled_gaps[i] = shuffled[:n_delayed].mean() - shuffled[n_delayed:].mean()\n\nas_extreme = np.sum(shuffled_gaps >= observed_gap)\np_one_sided = (as_extreme + 1) / (n_shuffles + 1)\nprint(round(p_one_sided, 2))\n",
   "ordered": true
  },
  {
   "type": "explain",
   "title": "Now a real signal: Electronics lines",
   "body": "<p>So far the data has said “nothing to see here” twice. Hypothesis tests are only useful if they also say “yes” when something real is happening. So let's test the pricing manager's claim.</p>\n<p>TradeFlow has 5,107 Electronics order lines and 19,893 lines in other categories. Electronics lines average <b>119,108</b> and the others average <b>48,947</b>. The gap is about <b>70,161</b>.</p>\n<p>H₀: Electronics and other lines have the same average value. H₁: the averages differ. Same recipe, different columns: shuffle the “Electronics / not Electronics” tags over the line values and see how big a gap luck can produce. (We use 2,000 shuffles here because there are 25,000 lines to shuffle each time.)</p>"
  },
  {
   "type": "try",
   "title": "Test the Electronics claim",
   "body": "<p>This code is the Step 3 recipe applied to order-line values. The new lines are explained below.</p>\n<p><b>Reading the code, line by line</b></p><ol><li><code>values = lines[\"line_value\"].to_numpy()</code>: <code>lines</code> has one row per order line, with <code>line_value</code> = quantity × unit price. We take that column as an array.</li><li><code>is_elec = lines[\"is_electronics\"].to_numpy()</code>: True when the line's product category is Electronics. These are our name tags this time.</li><li><code>n_elec = is_elec.sum()</code>: How many Electronics lines there are, so each shuffle hands out the right number.</li><li><code>observed_gap = values[is_elec].mean() - values[~is_elec].mean()</code>: Electronics average minus everyone else's average.</li><li><code>np.abs(shuffled_gaps).max()</code>: The single biggest gap luck managed in all the shuffles. Comparing it with the real gap makes the point vividly.</li></ol>",
   "code": "values = lines[\"line_value\"].to_numpy()\nis_elec = lines[\"is_electronics\"].to_numpy()\nn_elec = is_elec.sum()\nobserved_gap = values[is_elec].mean() - values[~is_elec].mean()\n\nn_shuffles = 2000\nshuffled_gaps = np.empty(n_shuffles)\nfor i in range(n_shuffles):\n    shuffled = rng.permutation(values)\n    shuffled_gaps[i] = shuffled[:n_elec].mean() - shuffled[n_elec:].mean()\n\nas_extreme = np.sum(np.abs(shuffled_gaps) >= abs(observed_gap))\np_value = (as_extreme + 1) / (n_shuffles + 1)\n\nprint(\"Real gap in average line value:\", round(observed_gap))\nprint(\"Biggest gap luck produced in 2,000 shuffles:\", round(np.abs(shuffled_gaps).max()))\nprint(\"Shuffles at least as extreme as the real gap:\", as_extreme)\nprint(\"p-value (two-sided):\", round(p_value, 4))\n"
  },
  {
   "id": "st-5-1-ex4",
   "type": "exercise",
   "title": "Your turn: report the Electronics result",
   "body": "<p>Run the Electronics permutation test with <b>2,000 shuffles</b> (use <code>rng.permutation(values)</code>, the first <code>n_elec</code> shuffled values play Electronics). Print two lines: first the observed gap rounded to a whole number, then the two-sided p-value (using the <code>+ 1</code> rule) rounded to 4 decimals.</p>\n<p>Your output should be <code>70161</code> on the first line, followed by <code>0.0005</code>.</p>\n<p><b>Think before you type:</b> not one of the 2,000 shuffles beats the real gap, so the count is 0. The smallest p-value this method can report is 1 / 2,001. That is why the answer is 0.0005 and not 0. In a report you would write “p &lt; 0.001”.</p>",
   "starter": "# lines and rng are already loaded\nvalues = lines[\"line_value\"].to_numpy()\nis_elec = lines[\"is_electronics\"].to_numpy()\nn_elec = is_elec.sum()\n\n# Write your code below\n",
   "hints": [
    "Copy the structure of the Electronics code box. Print round(observed_gap) first, then round(p_value, 4).",
    "values = lines[\"line_value\"].to_numpy()\nis_elec = lines[\"is_electronics\"].to_numpy()\nn_elec = is_elec.sum()\nobserved_gap = values[is_elec].mean() - values[~is_elec].mean()\n\nn_shuffles = 2000\nshuffled_gaps = np.empty(n_shuffles)\nfor i in range(n_shuffles):\n    shuffled = rng.permutation(values)\n    shuffled_gaps[i] = shuffled[:n_elec].mean() - shuffled[n_elec:].mean()\n\nas_extreme = np.sum(np.abs(shuffled_gaps) >= abs(observed_gap))\np_value = (as_extreme + 1) / (n_shuffles + 1)\nprint(round(observed_gap))\nprint(round(p_value, 4))\n"
   ],
   "solution": "values = lines[\"line_value\"].to_numpy()\nis_elec = lines[\"is_electronics\"].to_numpy()\nn_elec = is_elec.sum()\nobserved_gap = values[is_elec].mean() - values[~is_elec].mean()\n\nn_shuffles = 2000\nshuffled_gaps = np.empty(n_shuffles)\nfor i in range(n_shuffles):\n    shuffled = rng.permutation(values)\n    shuffled_gaps[i] = shuffled[:n_elec].mean() - shuffled[n_elec:].mean()\n\nas_extreme = np.sum(np.abs(shuffled_gaps) >= abs(observed_gap))\np_value = (as_extreme + 1) / (n_shuffles + 1)\nprint(round(observed_gap))\nprint(round(p_value, 4))\n",
   "ordered": true
  },
  {
   "id": "st-5-1-ex5",
   "type": "exercise",
   "title": "Your turn: turn the decision rule into a function",
   "body": "<p>Analysts apply the same rule many times, so it belongs in a <b>function</b>. Write <code>decide(p_value, alpha=0.05)</code> that returns the text <code>\"Reject the null hypothesis\"</code> when <code>p_value</code> is at or below alpha, and <code>\"Fail to reject the null hypothesis\"</code> otherwise. Then print the decision for the three p-values we found: 0.96 (Delayed flag), 0.14 (Kenya versus Ghana) and 0.0005 (Electronics).</p>\n<p>Your output should be three lines: Fail to reject, Fail to reject, Reject.</p>\n<p><b>Python connection:</b> <code>def name(inputs):</code> defines a reusable recipe. <code>alpha=0.05</code> is a default value that is used when you do not supply one. <code>return</code> hands the answer back. <code>if ... :</code> runs the indented line only when the condition is True.</p>",
   "starter": "# Write your code below\ndef decide(p_value, alpha=0.05):\n    pass\n\n\nprint(decide(0.96))\n",
   "hints": [
    "Inside the function use: if p_value <= alpha: return \"Reject the null hypothesis\", then a second return for the other case.",
    "def decide(p_value, alpha=0.05):\n    if p_value <= alpha:\n        return \"Reject the null hypothesis\"\n    return \"Fail to reject the null hypothesis\"\n\nprint(decide(0.96))\nprint(decide(0.14))\nprint(decide(0.0005))\n"
   ],
   "solution": "def decide(p_value, alpha=0.05):\n    if p_value <= alpha:\n        return \"Reject the null hypothesis\"\n    return \"Fail to reject the null hypothesis\"\n\nprint(decide(0.96))\nprint(decide(0.14))\nprint(decide(0.0005))\n",
   "ordered": true
  },
  {
   "id": "st-5-1-c3",
   "type": "check",
   "title": "Why do analysts say “fail to reject” instead of “accept” the null hypothesis?",
   "body": "<p>Think of the courtroom again.</p>",
   "options": [
    "Because it sounds more scientific",
    "Because a large p-value only shows that our data could not rule H₀ out. A real effect might exist that the data was too limited to detect",
    "Because the p-value is exactly 0.05 in such cases",
    "Because the null hypothesis is always false"
   ],
   "answer": 1,
   "why": [
    "It is a matter of logic, not style.",
    "Correct. Absence of evidence is not evidence of absence. A small or noisy sample can hide a real difference.",
    "Failing to reject happens for any p-value above α, not only at 0.05.",
    "H₀ is often true. The point is that the data cannot prove it."
   ]
  },
  {
   "type": "explain",
   "title": "Good practice, and the traps to avoid",
   "body": "<p>Hypothesis tests are powerful, and they are also the most misused tool in analytics. Keep these rules.</p>\n<ul><li><b>Write H₀, H₁ and α before you run the test.</b> Deciding after you see the result is how people fool themselves.</li>\n<li><b>Report the size of the effect, not just the p-value.</b> “Electronics lines average about 70,161 more than other lines (p &lt; 0.001)” is useful. “p &lt; 0.001” alone is not.</li>\n<li><b>Significant is not the same as important.</b> With enough data even a trivial gap becomes statistically significant. Ask whether the gap matters to the business: is half a day of transit worth the cost of changing carriers?</li>\n<li><b>Beware of running many tests.</b> At α = 0.05, about 1 in 20 tests of nothing will “succeed” by luck alone. If you test twenty things and report the one that worked, you have fooled yourself and your audience. Lesson 5.4 covers how to handle this.</li>\n<li><b>A permutation test needs the groups to be exchangeable under H₀</b>, meaning that if H₀ is true the labels really can be swapped. It is not suitable if, for example, the same customer appears in both groups in a linked way.</li></ul>\n<div class=\"callout work\"><b>What to tell the Finance Director.</b> “Delayed parcels average 5.508 days in transit and Delivered parcels 5.514 days, a gap of 0.006 days. A permutation test gives p ≈ 0.96, so there is no evidence that Delayed parcels actually took longer. I would not send penalty claims on the strength of the transit data alone. It may be worth checking how the courier decides what counts as ‘Delayed’.”</div>"
  },
  {
   "type": "explain",
   "title": "What you should take away from Lesson 5.1",
   "body": "<p>You can now run a complete hypothesis test from first principles.</p>\n<ul><li>The <b>null hypothesis (H₀)</b> says nothing is going on. The <b>alternative (H₁)</b> says something is.</li>\n<li>A <b>test statistic</b> condenses the data into one number, such as the gap between two averages.</li>\n<li>A <b>permutation test</b> shuffles the labels many times to show what luck alone produces.</li>\n<li>The <b>p-value</b> is how often luck produces a result at least as extreme as the real one if H₀ is true. It is not the probability that H₀ is true.</li>\n<li>The <b>significance level α</b> is the cut-off you choose in advance. At or below it you <i>reject</i> H₀, above it you <i>fail to reject</i> H₀.</li>\n<li><b>One-sided</b> tests care about one direction, <b>two-sided</b> tests about either.</li></ul>\n<p><b>Interview questions to practise</b></p>\n<ol><li><i>“Explain a p-value to a non-technical manager.”</i> Model answer: “If nothing were really going on, how often would luck alone give us a result at least this striking? A small p-value means rarely, so we doubt that nothing is going on.”</li>\n<li><i>“Does p = 0.04 mean there is a 96% chance the effect is real?”</i> Model answer: “No. The p-value is calculated assuming H₀ is true. It is not the probability that either hypothesis is true.”</li>\n<li><i>“Why do we fail to reject instead of accepting H₀?”</i> Model answer: “Because the data may simply lack the power to detect a real difference. No evidence is not proof of no effect.”</li></ol>\n<p>In Lesson 5.2 we meet the classic shortcut, the <b>t-test</b>. It answers the same question as the shuffling test using a formula instead of thousands of shuffles, and it also tells you how precisely the gap is measured.</p>"
  }
 ]
}
);
