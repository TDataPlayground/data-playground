LESSONS.push(
{
  id: 'st-3-1',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'matplotlib'],
  loopGuard: true,
  files: ['payments', 'deliveries'],
  setup: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

payments = pd.read_csv("payments.csv")
deliveries = pd.read_csv("deliveries.csv")
deliveries["dispatch_date"] = pd.to_datetime(deliveries["dispatch_date"], errors="coerce")
deliveries["delivery_date"] = pd.to_datetime(deliveries["delivery_date"], errors="coerce")
deliveries["transit_days"] = (deliveries["delivery_date"] - deliveries["dispatch_date"]).dt.days

# Missing dates do not mean zero-day deliveries.
transit = deliveries["transit_days"].dropna()
amount = payments["amount"].dropna()
`,
  preloaded: ['payments', 'deliveries', 'transit', 'amount'],
  title: '3.1 Distributions: the shape of uncertainty',
  tables: [],
  intro: `The Head of Operations at TradeFlow has two questions for the analytics team. First: <i>“How long do our deliveries usually take, and how much variation should we expect?”</i> Second: <i>“Why do a small number of orders account for such large payment amounts?”</i><br><br>In Module 1, you learned to describe a column using its centre, spread and shape. In Module 2, you learned to assign probabilities to events. A <b>probability distribution</b> brings those ideas together: it describes the possible values of a quantity and how probability is spread across them. It tells us much more than one average can. You will use TradeFlow's delivery times and payment amounts to distinguish discrete from continuous quantities, read probability mass and density, and calculate cumulative probabilities and percentiles.`,
  steps: [
    {
      type: 'explain',
      title: 'A distribution describes the whole set of possible values',
      body: `<p>Imagine that the operations director asks for the average delivery time. You calculate 5.5 days. That is useful, but it leaves several questions unanswered:</p>
<ul><li>Are most deliveries close to 5.5 days, or are there many very quick deliveries and a smaller number of very slow ones?</li><li>Can a delivery take 12 days, or does the process stop at 10 days?</li><li>What is the chance that a delivery takes no more than 3 days?</li><li>How unusual is a delivery that takes 9 days?</li></ul>
<p>A mean cannot answer all of those questions. A <b>probability distribution</b> describes how possible values share probability. It tells us which values can occur, which values are common, which values are rare, and how the probability accumulates across a range.</p>
<p>For a discrete variable, a distribution assigns a probability to each possible value. For a continuous variable, it describes probability across intervals of values. In both cases, the total probability across the entire range is 1.</p>
<div class="callout analogy"><b>Think of a map, not a single pin.</b> The mean is one pin showing the centre of TradeFlow's delivery times. The distribution is the whole map: where the deliveries cluster, how far they spread and where the unusual cases sit.</div>
<p>There are two kinds of variable you will meet repeatedly:</p>
<table class="mini"><tr><th>Type</th><th>Possible values</th><th>TradeFlow example</th></tr>
<tr><td><b>Discrete</b></td><td>Separate, countable values, often whole numbers</td><td>Number of failed payments in a batch; number of whole days recorded for a delivery</td></tr>
<tr><td><b>Continuous</b></td><td>Any value within an interval, including decimals</td><td>True processing time or delivery duration measured on a sufficiently fine time scale</td></tr></table>
<p>The type of variable matters because it determines how we calculate probabilities. A discrete distribution can assign probability to one exact value. A continuous distribution assigns probability to intervals; the probability of one exact point is zero.</p>`
    },
    {
      type: 'explain',
      title: 'Meet the two TradeFlow distributions in this lesson',
      body: `<p>The lesson setup has prepared two useful variables:</p>
<table class="mini"><tr><th>Python name</th><th>What it contains</th><th>How to read one row</th></tr>
<tr><td><code>transit</code></td><td>Delivery time in days, calculated by subtracting dispatch date from delivery date</td><td>One completed delivery with usable dates</td></tr>
<tr><td><code>amount</code></td><td>Payment amount from <code>payments.csv</code></td><td>One payment amount recorded by TradeFlow</td></tr></table>
<p>The setup converts the two delivery date columns into dates with <code>pd.to_datetime()</code>. It uses <code>errors="coerce"</code>, which turns an invalid or missing date into a missing-value marker rather than stopping the whole lesson. It then subtracts dispatch date from delivery date. The result is a duration in days.</p>
<p>The final <code>.dropna()</code> removes records where a delivery duration or payment amount cannot be calculated. It does <b>not</b> turn missing delivery dates into zero. A zero-day delivery would be an actual recorded duration; a missing duration means we do not have the information needed to calculate one.</p>
<p>TradeFlow has 9,500 delivery records, but only 8,261 have both dates needed for a transit-time calculation. The distribution of those 8,261 observed durations is close to flat across whole-day values from 1 to 10. In contrast, payment amounts are positive and strongly right-skewed. Those differences will help us see why a distribution is more informative than an average alone.</p>
<div class="callout watch"><b>Always understand what was excluded.</b> The 1,239 deliveries without a calculated transit time are not 1,239 zero-day deliveries. Many are still in transit or have no final delivery date. Our transit-time distribution describes the deliveries for which both dates are available, not every delivery record.</div>`
    },
    {
      type: 'try',
      title: 'Look at the delivery-time distribution as a frequency table',
      body: `<p>Start with counts. <code>value_counts()</code> counts how often each distinct value appears. <code>sort_index()</code> puts the day values in numerical order rather than sorting them by how common they are. <code>normalize=True</code> converts the counts into proportions by dividing each count by the number of non-missing observations.</p>
<p>In TradeFlow, the observed counts for 1 through 10 days are all fairly similar. No single day dominates. This is a roughly uniform-looking discrete distribution, not a bell-shaped normal distribution.</p>
<p>The code prints a table of both the count and the proportion. The proportions should add to 1, apart from tiny rounding differences if they are displayed rounded.</p>`,
      code: `day_counts = transit.value_counts().sort_index()
day_probabilities = transit.value_counts(normalize=True).sort_index()

summary = pd.DataFrame({
    "count": day_counts,
    "probability": day_probabilities
})

print(summary.round(4).to_string())
print("Total probability:", round(day_probabilities.sum(), 4))
`
    },
    {
      type: 'explain',
      title: 'The probability mass function: probability at each discrete value',
      body: `<p>For a discrete random variable, the probability assigned to each possible value is called its <b>probability mass function</b>, usually shortened to <b>PMF</b>.</p>
<p>Let X be the number of transit days recorded for a randomly selected completed delivery. The PMF answers questions such as P(X = 6): the probability that the selected delivery took exactly 6 recorded days.</p>
<p>From the TradeFlow data, 848 of the 8,261 deliveries with usable dates took 6 days. The empirical probability is 848 ÷ 8,261 = <b>0.1027</b>, or about 10.27%.</p>
<p>A valid discrete PMF must satisfy two conditions: every probability is between 0 and 1, and the probabilities across all possible values add to 1.</p>
<p>Why do we call it <i>empirical</i>? We have estimated the probability using observed frequencies. A theoretical model might instead say that each of ten possible delivery-day values is equally likely, giving each probability 0.10. TradeFlow's observed frequencies are close to that pattern, but they are not exactly equal. The data do not prove that the underlying delivery process is perfectly uniform.</p>
<div class="callout tip"><b>Use a PMF when the outcome is countable.</b> Examples include the number of failed payments in a batch, the number of items in an order, or the number of whole days in a delivery-time record.</div>`
    },
    {
      type: 'try',
      title: 'Plot the delivery-time distribution',
      body: `<p>A frequency table gives exact counts. A histogram gives a quick visual picture. Because transit time is recorded in whole days, we set the bin edges so that each bar is centred on one integer day: 0.5 to 1.5 for day 1, 1.5 to 2.5 for day 2, and so on.</p>
<p>In <code>plt.hist()</code>, <code>bins</code> controls the intervals used to group values. <code>edgecolor</code> adds a border so neighbouring bars are easier to distinguish. The axis labels tell the reader what is being counted.</p>
<p>Notice the roughly level set of bars. It is not a smooth bell. The shape is part of the evidence about which distribution family may be appropriate.</p>`,
      code: `plt.figure(figsize=(8, 4))
plt.hist(transit, bins=np.arange(0.5, 11.5, 1), edgecolor="black")
plt.title("TradeFlow delivery time: observed whole-day frequencies")
plt.xlabel("Transit time (days)")
plt.ylabel("Number of deliveries")
plt.tight_layout()
`
    },
    {
      id: 'st-3-1-ex1',
      type: 'exercise',
      title: 'Your turn: estimate the probability of a six-day delivery',
      body: `<p>Use the <code>transit</code> Series to calculate the empirical probability that a delivery with a recorded transit time took exactly 6 days.</p>
<p>Print the answer to four decimal places. You should see <code>0.1027</code>.</p>
<p><b>Think before you type:</b> compare every value with 6. The resulting Boolean Series marks the six-day deliveries. Its mean is the share of observed deliveries in that group.</p>
<p><b>Python connection:</b> <code>transit == 6</code> performs an element-by-element comparison. It returns True/False values. Taking the mean of those flags calculates the empirical probability.</p>`,
      starter: `# transit is already loaded

# Write your code below
`,
      hints: [
        'Compare transit with 6 and take the mean of the resulting Boolean Series.',
        'p_six_days = (transit == 6).mean()\nprint("{:.4f}".format(p_six_days))\n'
      ],
      solution: `p_six_days = (transit == 6).mean()
print("{:.4f}".format(p_six_days))
`,
      ordered: true
    },
    {
      id: 'st-3-1-c1',
      type: 'check',
      title: 'Which statement correctly describes a discrete probability distribution?',
      body: `<p>Think about what values it assigns probabilities to, and what the probabilities must add up to.</p>`,
      options: [
        'It assigns a probability to every possible interval but never to an exact value',
        'It assigns probabilities to countable values, each between 0 and 1, and the total across all possible values is 1',
        'It can only describe values that are negative',
        'Its probabilities do not need to add up to 1'
      ],
      answer: 1,
      why: [
        'That describes interval probabilities for continuous variables more closely. A discrete PMF assigns probability to individual countable values.',
        'Correct. A valid PMF gives each possible value a probability and the probabilities across the complete support add to 1.',
        'Discrete variables can be positive, negative or zero. The type is about separate countable values, not their sign.',
        'A probability distribution must account for the entire sample space, so its total probability must be 1.'
      ]
    },
    {
      type: 'explain',
      title: 'Continuous variables need a different idea: probability density',
      body: `<p>Payment amount is recorded to the nearest cent, so it is technically discrete at that smallest unit. In many business models, however, the cent is tiny compared with the range of possible transaction sizes, so analysts often treat payment amount as approximately continuous. A duration measured very precisely is also commonly modelled as continuous. A continuous variable can take any value in a range, rather than only separate whole-number points.</p>
<p>For a continuous variable, statisticians use a <b>probability density function</b>, or <b>PDF</b>. The PDF describes how densely probability is concentrated along the number line. Probability is found by measuring the <b>area under the density curve</b> across an interval.</p>
<p>This creates a subtle but important difference. For a discrete variable, P(X = 6) can be 0.1027. For a continuous variable, P(X = one exact amount) is 0. The probability of falling within a range, such as P(100,000 ≤ X ≤ 150,000), can be positive.</p>
<p>A density value is not itself a probability. A PDF can even have a height greater than 1, provided the total area under the curve is 1. It is the area over an interval, not the height at one point, that gives probability.</p>
<div class="callout analogy"><b>Density is like people in a queue.</b> A tall section of the curve means many values are concentrated around that region. To find the probability of an interval, you measure the whole area across the interval, not just the height at one point.</div>
<p>When we draw a histogram of values treated as continuous with <code>density=True</code>, the bar heights are scaled so that the total bar area is 1. This makes the histogram a visual estimate of a density. It does not make each bar height a probability.</p>`
    },
    {
      type: 'try',
      title: 'Look at the distribution of TradeFlow payment amounts',
      body: `<p>Payment amounts have a very different shape from whole-day transit times. Most amounts are in the lower and middle part of the range, while a smaller number of payments are much larger. This creates a long tail to the right.</p>
<p>For this broad range of payment amounts, we use the common continuous approximation: the cent is tiny relative to the full range of values. The histogram below uses <code>density=True</code>. That scales the bars as a density, so the total area of the bars is approximately 1. The bins are grouped in thousands of amount units to make the scale easier to read.</p>
<p>Do not interpret a bar's height as “the probability of that exact amount”. The area of a bar approximates the probability of falling within that bin.</p>`,
      code: `plt.figure(figsize=(8, 4))
plt.hist(amount / 1000, bins=30, density=True, edgecolor="black", alpha=0.75)
plt.title("TradeFlow payment amounts: a right-skewed distribution")
plt.xlabel("Payment amount (thousands of amount units)")
plt.ylabel("Estimated probability density")
plt.tight_layout()
`
    },
    {
      type: 'explain',
      title: 'The cumulative distribution: probability up to a value',
      body: `<p>Whether a variable is discrete or continuous, we can ask a common question: what is the probability that its value is <b>at most</b> some threshold?</p>
<p>The function that answers this is the <b>cumulative distribution function</b>, or <b>CDF</b>. For a value x, it is written F(x) = P(X ≤ x). It accumulates all probability from the smallest possible value up to and including x.</p>
<p>For TradeFlow, the empirical CDF of payment amounts answers questions such as: “What share of payments were 300,000 amount units or less?” The code for an empirical CDF is often simple: compare each value with the threshold and take the mean of the True/False results.</p>
<p>A CDF never decreases as x increases, its values stay between 0 and 1, and it approaches 0 at the far left and 1 at the far right. For a discrete variable, it rises in steps. For a continuous variable, it is usually smooth when the density is smooth.</p>
<p>The CDF is useful in operations because it translates a distribution into service-level questions: what share is completed by a deadline, what share is below a risk threshold, or what share of payments is under a review limit?</p>`
    },
    {
      type: 'try',
      title: 'Calculate a TradeFlow payment CDF value',
      body: `<p>Calculate the share of payment amounts that are 300,000 amount units or less. There are 8,801 such payments out of 10,000, giving an empirical cumulative probability of <b>0.8801</b>.</p>
<p><b>Read the expression:</b> <code>amount <= 300000</code> checks every payment amount against the threshold. It returns True for amounts at or below the threshold and False for larger amounts. The mean of those flags is the proportion at or below 300,000. This is the empirical CDF at 300,000.</p>`,
      code: `p_at_most_300k = (amount <= 300000).mean()
print("{:.4f}".format(p_at_most_300k))
`
    },
    {
      id: 'st-3-1-ex2',
      type: 'exercise',
      title: 'Your turn: calculate the share of payments at or below 200,000',
      body: `<p>Use the <code>amount</code> Series to calculate the empirical probability that a randomly selected TradeFlow payment is no more than 200,000 amount units.</p>
<p>Print the result to four decimal places. You should see <code>0.7172</code>.</p>
<p><b>Think before you type:</b> use the less-than-or-equal comparison. The CDF includes values exactly equal to the threshold as well as values below it.</p>
<p><b>Python connection:</b> the comparison returns a Boolean Series, and its mean is the fraction of payment rows meeting the threshold. This is the empirical CDF evaluated at 200,000.</p>`,
      starter: `# amount is already loaded

# Write your code below
`,
      hints: [
        'Use (amount <= 200000).mean() and format the result to four decimal places.',
        'p_at_most_200k = (amount <= 200000).mean()\nprint("{:.4f}".format(p_at_most_200k))\n'
      ],
      solution: `p_at_most_200k = (amount <= 200000).mean()
print("{:.4f}".format(p_at_most_200k))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Percentiles are values read from the cumulative distribution',
      body: `<p>A <b>percentile</b> reverses the CDF question. Instead of asking “what share of payments is below 300,000?”, we ask “what payment amount marks the 90th percentile?”</p>
<p>The 90th percentile is a value at or below which approximately 90% of observations fall. In Pandas, <code>Series.quantile(0.90)</code> estimates that value. The argument is a proportion between 0 and 1, not a number between 0 and 100.</p>
<p>TradeFlow's 90th percentile payment amount is approximately <b>317,507.28</b> amount units. This means about 90% of the observed payments are at or below that value, and about 10% are above it. It does not mean that 90% of payments equal that amount.</p>
<p>Percentiles are especially useful when distributions are skewed. They describe positions in the distribution without requiring the shape to be symmetric. They also help operations teams define review thresholds, service targets and capacity bands.</p>
<div class="callout tip"><b>Translate the percentile into a sentence.</b> “The 90th percentile payment amount is about 317,507” is clearer than “Q90 is 317,507”. The sentence tells a manager what the number means.</div>`
    },
    {
      id: 'st-3-1-ex3',
      type: 'exercise',
      title: 'Your turn: find the 90th percentile payment amount',
      body: `<p>Use <code>amount.quantile(0.90)</code> to calculate the 90th percentile of TradeFlow's payment amounts. Print the result to two decimal places.</p>
<p>You should see <code>317507.28</code>.</p>
<p><b>Think before you type:</b> the quantile argument is 0.90 because it represents 90% as a proportion. Do not divide the result by 100 or use 90 as the argument.</p>
<p><b>Python connection:</b> <code>.quantile()</code> asks Pandas to find the value corresponding to a cumulative proportion. The function handles the ordering and interpolation needed between observed values.</p>`,
      starter: `# amount is already loaded

# Write your code below
`,
      hints: [
        'Call amount.quantile(0.90), then format it to two decimal places.',
        'q90 = amount.quantile(0.90)\nprint("{:.2f}".format(q90))\n'
      ],
      solution: `q90 = amount.quantile(0.90)
print("{:.2f}".format(q90))
`,
      ordered: true
    },
    {
      id: 'st-3-1-c2',
      type: 'check',
      title: 'A continuous payment amount has a density of 0.000004 at 100,000. What does that number mean?',
      body: `<p>Remember that a density is not itself a probability. Probability comes from area across an interval.</p>`,
      options: [
        'The probability of a payment being exactly 100,000 is 0.000004',
        'The density describes concentration near 100,000; probability is found by integrating or approximating area over an interval',
        'The probability of every payment being above 100,000 is 0.000004',
        'The density must be between 0 and 1 because it is a probability'
      ],
      answer: 1,
      why: [
        'For a continuous variable, the probability of one exact point is zero. A density value is not the point probability.',
        'Correct. The area under the density over an interval gives the probability of falling in that interval.',
        'A density at one point does not give the entire upper-tail probability. The area across all values above the threshold is needed.',
        'A density can be greater than 1. The total area, not the height, must equal 1.'
      ]
    },
    {
      id: 'st-3-1-ex4',
      type: 'exercise',
      title: 'Your turn: find the share of deliveries completed within three recorded days',
      body: `<p>Use <code>transit</code> to calculate the empirical probability that a delivery with a recorded transit time took 3 days or less.</p>
<p>Print the result to four decimal places. You should see <code>0.2985</code>.</p>
<p><b>Think before you type:</b> the phrase “3 days or less” includes day 3. Use <code><=</code>, not just <code><</code>.</p>
<p><b>Python connection:</b> this is a CDF calculation for the discrete delivery-time variable. The comparison creates a flag for every observed delivery, and the mean gives the proportion meeting the deadline.</p>`,
      starter: `# transit is already loaded

# Write your code below
`,
      hints: [
        'Use (transit <= 3).mean() and format to four decimal places.',
        'p_within_three = (transit <= 3).mean()\nprint("{:.4f}".format(p_within_three))\n'
      ],
      solution: `p_within_three = (transit <= 3).mean()
print("{:.4f}".format(p_within_three))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Choose the right distribution language for the question',
      body: `<p>You now have three connected ways to describe a distribution:</p>
<table class="mini"><tr><th>Tool</th><th>What it tells you</th><th>Typical question</th></tr>
<tr><td><b>PMF</b></td><td>Probability at each discrete value</td><td>What is the chance of exactly 6 delivery days?</td></tr>
<tr><td><b>PDF</b></td><td>Density across a continuous range; probability is area</td><td>How concentrated are payment amounts around this range?</td></tr>
<tr><td><b>CDF</b></td><td>Probability accumulated up to a threshold</td><td>What share of payments are 200,000 or less?</td></tr></table>
<p>These are not competing methods. They are different descriptions of the same distribution. A CDF can be constructed from a PMF or a PDF. A percentile is a value read by reversing the cumulative question.</p>
<p>In the next lesson, we will move from describing observed distributions to choosing probability models for counts. TradeFlow needs to estimate how many failures may appear in a fixed batch of payments. That brings us to Bernoulli trials, the binomial distribution and the Poisson model.</p>`
    },
    {
      id: 'st-3-1-ex5',
      type: 'exercise',
      title: 'Your turn: classify the TradeFlow quantity',
      body: `<p>Decide whether each of the following is naturally modelled as a discrete or continuous variable:</p>
<ul><li>Number of failed payments in a batch of 100</li><li>True processing time measured on a fine scale</li><li>Number of whole days in a delivery-time record</li></ul>
<p>Create a Python list called <code>answers</code> containing the three strings <code>"discrete"</code>, <code>"continuous"</code>, <code>"discrete"</code>, in that order. Then print the list.</p>
<p><b>Python connection:</b> a list stores several values in order. The strings are written in quotation marks. The list itself does not calculate a distribution; it records your classification of the three variables.</p>`,
      starter: `# Write your code below
`,
      hints: [
        'Use a list with three strings, one for each variable in the order given.',
        'answers = ["discrete", "continuous", "discrete"]\nprint(answers)\n'
      ],
      solution: `answers = ["discrete", "continuous", "discrete"]
print(answers)
`,
      ordered: true
    },
    {
      id: 'st-3-1-c3',
      type: 'check',
      title: 'The 90th percentile payment amount is 317,507.28. Which interpretation is correct?',
      body: `<p>Think about the cumulative proportion represented by a percentile.</p>`,
      options: [
        '90% of payments have exactly that amount',
        'About 90% of observed payments are at or below that amount',
        'The amount is 90% of the mean payment',
        'Every payment above that amount is an error'
      ],
      answer: 1,
      why: [
        'A percentile is a cut-off value, not a value that 90% of observations must equal.',
        'Correct. The 90th percentile is the value at or below which approximately 90% of observations lie.',
        'The percentile is calculated from the ranked values, not as a percentage of the mean.',
        'A high payment may be legitimate. A percentile describes position, not data quality or error status.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>You can now describe a distribution as a whole, rather than relying on a single average.</p>
<ul><li>You can distinguish discrete and continuous variables.</li><li>You can explain the difference between a PMF, a PDF and a CDF.</li><li>You can calculate empirical probabilities from observed frequencies.</li><li>You can read percentiles as thresholds in a cumulative distribution.</li><li>You can explain why TradeFlow's delivery times and payment amounts have different distribution shapes.</li></ul>
<p>Keep the key distinction in mind: a distribution describes where probability lies across possible values. The next lesson introduces probability models for counts, so TradeFlow can reason about how many failures may appear in a fixed batch of payments.</p>`
    }
  ]
},
{
  id: 'st-3-2',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'matplotlib'],
  loopGuard: true,
  files: ['payments'],
  setup: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math

payments = pd.read_csv("payments.csv")
failed = payments["payment_status"].eq("Failed")
p_fail = failed.mean()
`,
  preloaded: ['payments', 'failed', 'p_fail'],
  title: '3.2 Counting outcomes: Bernoulli, Binomial and Poisson models',
  tables: [],
  intro: `TradeFlow's payments manager is preparing a review queue for the next 100 transactions. The team needs to plan staffing before the payments arrive. The question is not whether one particular payment will fail; it is how many failures the team might see in a batch of 100.<br><br>Module 2 taught you how to calculate the probability of one payment failing and how to reason about expected values. Now we will build a distribution for the <b>number of failures</b> in a fixed batch. You will learn the Bernoulli model for one yes-or-no trial, the binomial model for a fixed number of trials, and the Poisson model for counts of events over a fixed interval or exposure. We will also see when these models are useful and when their assumptions are too strong for the business data in front of us.`,
  steps: [
    {
      type: 'explain',
      title: 'One payment is a Bernoulli trial',
      body: `<p>For the payments manager, each transaction has two outcomes for the question we are studying:</p><ul><li><b>Failure:</b> the payment status is Failed.</li><li><b>Not failure:</b> the payment status is not Failed.</li></ul>
<p>A single trial with two possible outcomes is called a <b>Bernoulli trial</b>. We often code the event of interest as 1 and its absence as 0. Here, let X = 1 if a payment fails and X = 0 otherwise.</p>
<p>A Bernoulli distribution is determined by one number, p: the probability of success. In this context, we define “success” as the event we are counting, which is a payment failure. That wording may sound unusual, but it is common in probability: success means the event of interest, not necessarily a good business outcome. The probability of failure is p, and the probability of no failure is 1 − p.</p>
<p>From the supplied TradeFlow records, 423 of 10,000 payments are Failed. The observed rate is therefore p = 0.0423. This is our historical baseline for the model, not a guarantee that the next 100 payments will have exactly the same rate.</p>
<div class="callout watch"><b>Define the event before choosing the word “success”.</b> In this lesson, success means “payment failure occurred” because we are counting failures. In a different lesson, success might mean a payment cleared or an order was delivered.</div>`
    },
    {
      type: 'try',
      title: 'Calculate TradeFlow’s historical failure probability',
      body: `<p>The setup has created a Boolean Series called <code>failed</code>. It contains True for a payment whose status is Failed and False otherwise. The mean of this Series is the observed failure proportion, which we use as the binomial model's baseline probability p.</p>
<p><b>Python connection:</b> <code>.eq("Failed")</code> compares the entire payment-status column with the category. <code>.mean()</code> calculates the share of True values. The variable name <code>p_fail</code> is a short label for that estimated probability.</p>`,
      code: `print(int(failed.sum()))
print("{:.4f}".format(p_fail))
print("{:.2%}".format(p_fail))
`
    },
    {
      type: 'explain',
      title: 'From one Bernoulli trial to a binomial count',
      body: `<p>Now imagine that TradeFlow processes exactly 100 payments and counts how many are Failed. Let X be that count. X can be 0, 1, 2, …, 100. It is no longer a yes-or-no variable; it is a count of yes-or-no trials.</p>
<p>If the following four conditions are reasonable, X follows a <b>binomial distribution</b>:</p>
<ol><li><b>Fixed number of trials:</b> we know how many payments are in the batch. Here, n = 100.</li><li><b>Two outcomes per trial:</b> each payment is either Failed or not Failed for this question.</li><li><b>Same probability:</b> each payment has the same probability p of failure.</li><li><b>Independence:</b> one payment's outcome does not change another payment's outcome.</li></ol>
<p>The parameters are n, the number of trials, and p, the probability of the event on each trial. We write X ~ Binomial(n, p).</p>
<p>The assumptions are a model, not facts we can automatically read from a CSV file. In a real payment system, failures may cluster by provider, country, network outage, customer or time of day. If risk differs by segment or one outage affects many payments together, identical probability and independence may not hold. We use a binomial model here as a transparent starting point and keep its limitations visible.</p>
<div class="callout work"><b>Business use:</b> a binomial model can help a team plan how many exceptions might arrive in a fixed batch, estimate the chance of exceeding review capacity, or compare likely defect counts across production runs—provided the assumptions are checked.</div>`
    },
    {
      type: 'explain',
      title: 'The binomial probability formula, one piece at a time',
      body: `<p>The probability of observing exactly k failures in n independent trials, each with failure probability p, is:</p>
<p><b>P(X = k) = C(n, k) × p<sup>k</sup> × (1 − p)<sup>n−k</sup>.</b></p>
<p>Each part has a job:</p><ul><li><b>C(n, k)</b> counts how many different ways the k failures can be arranged among the n payment trials.</li><li><b>p<sup>k</sup></b> is the probability of the k failures occurring in a particular arrangement.</li><li><b>(1 − p)<sup>n−k</sup></b> is the probability that the remaining trials do not fail.</li></ul>
<p>For example, “exactly five failures” means five payments fail and 95 do not. There are many different positions the five failures can occupy in a 100-payment batch. The combination term counts those arrangements, and the two probability terms give the chance of each arrangement. Multiply them to obtain the total probability.</p>
<p>The formula uses combinations because the order of the payments does not matter when we only care about the total count. Python's <code>math.comb(n, k)</code> calculates C(n, k). The exponent operator <code>**</code> means “raise to the power”.</p>
<div class="callout tip"><b>Exactly, at most and at least are different questions.</b> “Exactly five” is one binomial probability. “At most five” adds probabilities from zero through five. “At least five” adds probabilities from five through n. Read the wording before coding.</div>`
    },
    {
      type: 'try',
      title: 'Calculate the probability of exactly five failures',
      body: `<p>Use n = 100 and the TradeFlow baseline p = 0.0423. We calculate the probability of exactly five failed payments with Python's standard <code>math.comb()</code> function.</p>
<p><b>Read the code:</b> <code>math.comb(100, 5)</code> counts the ways to choose which five of the 100 payments fail. <code>p_fail ** 5</code> is the probability of those five failures in one particular arrangement. <code>(1 - p_fail) ** 95</code> is the probability that the other 95 payments do not fail. The product is the probability of exactly five failures, regardless of which five positions they occupy.</p>
<p>The answer is approximately <b>0.1680</b>, or 16.80%.</p>`,
      code: `n = 100
k = 5
p_exactly_five = math.comb(n, k) * (p_fail ** k) * ((1 - p_fail) ** (n - k))
print("{:.4f}".format(p_exactly_five))
`
    },
    {
      id: 'st-3-2-ex1',
      type: 'exercise',
      title: 'Your turn: probability of exactly three failures in 100 payments',
      body: `<p>Using the TradeFlow failure probability and a batch size of 100, calculate the probability of exactly three Failed payments.</p>
<p>Print the result to four decimal places. You should see <code>0.1849</code>.</p>
<p><b>Think before you type:</b> use the binomial formula with k = 3. The combination term counts the ways to choose three failed payments from 100. The other 97 payments must not fail.</p>
<p><b>Python connection:</b> <code>math.comb(100, 3)</code> counts possible positions for the three failures. The two power terms calculate the chance of one such arrangement. Multiplication combines the arrangement count with the probability of each arrangement.</p>`,
      starter: `import math

# p_fail is already loaded from TradeFlow

# Write your code below
`,
      hints: [
        'Set n = 100 and k = 3, then apply math.comb(n, k) * p_fail**k * (1-p_fail)**(n-k).',
        'n = 100\nk = 3\np_exactly_three = math.comb(n, k) * (p_fail ** k) * ((1 - p_fail) ** (n - k))\nprint("{:.4f}".format(p_exactly_three))\n'
      ],
      solution: `n = 100
k = 3
p_exactly_three = math.comb(n, k) * (p_fail ** k) * ((1 - p_fail) ** (n - k))
print("{:.4f}".format(p_exactly_three))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Expected count and variance in a binomial model',
      body: `<p>One useful feature of a binomial distribution is that we can calculate its centre and spread directly from its two parameters:</p>
<ul><li><b>Expected count:</b> E(X) = np.</li><li><b>Variance:</b> Var(X) = np(1 − p).</li><li><b>Standard deviation:</b> SD(X) = √[np(1 − p)].</li></ul>
<p>For a batch of 100 TradeFlow payments, n = 100 and p = 0.0423. The expected number of failures is 100 × 0.0423 = <b>4.23</b>. The standard deviation is approximately <b>2.01</b> failures.</p>
<p>Expected value does not need to be a whole number. It is a long-run average across many comparable batches. A single batch cannot contain 4.23 failed payments; it can contain 4 or 5, or another whole-number count. The expectation describes the centre of the distribution across repeated batches.</p>
<p>Variance is measured in squared counts, which is why standard deviation is often easier to interpret: it returns to the original unit, number of failed payments. It describes the typical scale of variation around the expected count, not a guarantee that every batch will fall within one standard deviation.</p>
<div class="callout watch"><b>Do not confuse the probability with the expected count.</b> p = 0.0423 is the chance of failure for one modelled payment. np = 4.23 is the expected number of failures in a batch of 100.</div>`
    },
    {
      type: 'try',
      title: 'Calculate the expected count and standard deviation',
      body: `<p>The formulas use only the batch size and the per-payment failure probability. Compare the expected count with the standard deviation to understand both the centre and the typical spread of possible counts.</p>
<p><b>Python connection:</b> multiplication calculates np and np(1−p). <code>math.sqrt()</code> takes the square root of the variance to put the standard deviation back in units of payments.</p>`,
      code: `n = 100
expected_failures = n * p_fail
variance = n * p_fail * (1 - p_fail)
standard_deviation = math.sqrt(variance)
print("Expected failures:", round(expected_failures, 2))
print("Variance:", round(variance, 4))
print("Standard deviation:", round(standard_deviation, 4))
`
    },
    {
      id: 'st-3-2-c1',
      type: 'check',
      title: 'Which condition is required for a standard binomial model?',
      body: `<p>Think about what makes the number of successes follow a binomial distribution.</p>`,
      options: [
        'The number of trials can change after every result',
        'Each trial must have the same probability of the event and the trials must be independent',
        'The event must happen on exactly half of the trials',
        'The outcomes must be continuous values between 0 and 1'
      ],
      answer: 1,
      why: [
        'A binomial model has a fixed number of trials. A changing number of opportunities is a different model.',
        'Correct. A standard binomial model assumes a fixed n, two outcomes per trial, the same event probability p and independent trials.',
        'The event probability can be any value from 0 to 1. It does not have to be 0.5.',
        'Each trial is binary for the event being counted. The total count is discrete, not continuous.'
      ]
    },
    {
      type: 'explain',
      title: 'At least one failure: use the complement',
      body: `<p>Suppose the payments manager asks: “What is the chance that at least one of the next 100 payments fails?” We could add the probabilities of exactly 1 failure, exactly 2 failures, and so on up to 100. That is correct but unnecessarily long.</p>
<p>The easier route is the complement:</p><p><b>P(at least one failure) = 1 − P(no failures).</b></p>
<p>For a binomial model, zero failures means all 100 payments are non-failures. Its probability is (1 − p)<sup>100</sup>. Therefore <b>P(X ≥ 1) = 1 − (1 − p)<sup>100</sup></b>.</p>
<p>With p = 0.0423, this probability is approximately <b>0.9867</b>. So the model says there is about a 98.67% chance of at least one failure in a batch of 100, under the stated assumptions.</p>
<p>This is a useful example of the complement rule from Module 2. The complement is often simpler when the question uses “at least one”, “any”, or “none”.</p>`
    },
    {
      id: 'st-3-2-ex2',
      type: 'exercise',
      title: 'Your turn: calculate the chance of at least one failed payment',
      body: `<p>Using the TradeFlow failure probability, calculate the chance of at least one Failed payment in a batch of 100.</p>
<p>Print the result to four decimal places. You should see <code>0.9867</code>.</p>
<p><b>Think before you type:</b> calculate the probability of zero failures first, then subtract it from 1. The chance of zero failures is the chance that all 100 payments are non-failures.</p>
<p><b>Python connection:</b> <code>(1 - p_fail) ** n</code> raises the probability of no failure on one payment to the 100th power, because the model assumes independent trials with the same probability. Subtracting from 1 gives the complement.</p>`,
      starter: `# p_fail is already loaded

# Write your code below
`,
      hints: [
        'Use 1 - (1 - p_fail)**100.',
        'p_at_least_one = 1 - (1 - p_fail) ** 100\nprint("{:.4f}".format(p_at_least_one))\n'
      ],
      solution: `p_at_least_one = 1 - (1 - p_fail) ** 100
print("{:.4f}".format(p_at_least_one))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Simulate many batches to see the binomial distribution',
      body: `<p>A formula gives us an exact model probability. A simulation helps us see the range of counts the model can produce.</p>
<p>NumPy's <code>rng.binomial(n, p, size)</code> generates repeated binomial counts. The first argument is the number of trials in each batch, the second is the event probability on each trial, and <code>size</code> is the number of batches to simulate.</p>
<p>For example, <code>rng.binomial(100, p_fail, size=10000)</code> simulates 10,000 separate batches, each containing 100 payments. It returns 10,000 counts: one count of failures per simulated batch.</p>
<p>The average of those simulated counts should be close to the theoretical expected value of 4.23. It will not usually be exactly 4.23 because a finite simulation has its own random variation.</p>
<p><code>np.random.default_rng(2026)</code> creates a random-number generator with a fixed seed. The seed makes the demonstration reproducible. It does not make the outcomes less random or validate the binomial assumptions.</p>`
    },
    {
      type: 'try',
      title: 'Simulate 10,000 payment batches',
      body: `<p>Each simulated batch contains 100 payments. The histogram shows how often the model produces 0, 1, 2, 3 and more failures. Most batches are expected to contain only a small number of failures, because the per-payment probability is 4.23%.</p>
<p>The dashed vertical line marks the theoretical mean of 4.23. The simulated average should be close to it. The bars represent a discrete count distribution, so each integer count is a separate possible outcome.</p>`,
      code: `rng = np.random.default_rng(2026)
batches = rng.binomial(100, p_fail, size=10000)
print("Simulated mean:", round(batches.mean(), 3))
print("Theoretical mean:", round(100 * p_fail, 3))
plt.figure(figsize=(8, 4))
plt.hist(batches, bins=np.arange(-0.5, batches.max() + 1.5, 1), edgecolor="black")
plt.axvline(100 * p_fail, color="red", linestyle="--", label="Theoretical mean")
plt.title("TradeFlow: simulated failed payments per 100-payment batch")
plt.xlabel("Number of failed payments in a batch")
plt.ylabel("Number of simulated batches")
plt.legend()
plt.tight_layout()
`
    },
    {
      id: 'st-3-2-ex3',
      type: 'exercise',
      title: 'Your turn: simulate 5,000 batches and compare the average with theory',
      body: `<p>Use random seed 2026 to simulate 5,000 batches of 100 payments, using the TradeFlow failure probability. Print the simulated mean number of failures to three decimal places, then print the theoretical expected count to three decimal places.</p>
<p>The simulated result should be close to <code>4.23</code>; the theoretical result must be <code>4.230</code>. Do not expect the two numbers to be identical.</p>
<p><b>Think before you type:</b> use one generator, call <code>binomial(100, p_fail, size=5000)</code>, and take the mean of the resulting array.</p>
<p><b>Python connection:</b> the <code>size</code> argument controls the number of independent batches simulated, not the number of payments inside each batch. Each output element is already the count for one 100-payment batch.</p>`,
      starter: `import numpy as np

# p_fail is already loaded

# Write your code below
`,
      hints: [
        'Create rng = np.random.default_rng(2026), simulate 5,000 counts, and compare their mean with 100 * p_fail.',
        'rng = np.random.default_rng(2026)\nbatches = rng.binomial(100, p_fail, size=5000)\nprint("{:.3f}".format(batches.mean()))\nprint("{:.3f}".format(100 * p_fail))\n'
      ],
      solution: `rng = np.random.default_rng(2026)
batches = rng.binomial(100, p_fail, size=5000)
print("{:.3f}".format(batches.mean()))
print("{:.3f}".format(100 * p_fail))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The Poisson distribution: counts in a fixed interval',
      body: `<p>TradeFlow also wants to forecast how many payment failures may arrive during a fixed period. A common model for counts of events over a fixed interval or exposure is the <b>Poisson distribution</b>.</p>
<p>Let X be the number of events in that interval. The model has one parameter, λ (lambda), which is the expected number of events in the interval:</p>
<p><b>P(X = k) = e<sup>−λ</sup> × λ<sup>k</sup> ÷ k!</b></p>
<p>Here, k is a non-negative whole-number count, e is the mathematical constant approximately 2.71828, and k! is the factorial of k. A factorial means multiply the positive integers from 1 up to k; by definition, 0! = 1.</p>
<p>The Poisson model is often used when events occur at an approximately stable average rate, each event is counted once, and occurrences are independent enough that one event does not cause another. The interval or exposure must be defined: per hour, per day, per kilometre, per batch, or another fixed unit.</p>
<p>For the 100-payment batch, we can use λ = np = 100 × 0.0423 = 4.23 as a Poisson approximation to the binomial count. This approximation is useful when n is reasonably large, p is small, and the product np is moderate. The exact binomial model remains the reference when its assumptions hold; the Poisson model is a convenient approximation for rare-event counts.</p>
<div class="callout watch"><b>Do not use Poisson just because the outcome is a count.</b> The average event rate should be reasonably stable over the defined exposure, and event counts should not be strongly clustered. If monthly payment volume or failure risk changes sharply, one constant λ may be misleading.</div>`
    },
    {
      type: 'try',
      title: 'Compare the binomial and Poisson probability of five failures',
      body: `<p>We can compare two models for the same 100-payment batch: exact binomial with n = 100 and p = 0.0423, and a Poisson approximation with λ = np = 4.23.</p>
<p>The binomial probability of exactly five failures is about 0.1680. The Poisson approximation is about 0.1642. They are close, but not identical. The difference comes from using an approximation rather than the exact binomial model.</p>
<p><b>Python connection:</b> <code>math.exp(-lam)</code> calculates e raised to negative lambda. <code>lam ** k</code> raises lambda to k. <code>math.factorial(k)</code> calculates k factorial. The formula combines these terms to calculate the Poisson probability for exactly k events.</p>`,
      code: `n = 100
k = 5
lam = n * p_fail
binomial_p5 = math.comb(n, k) * (p_fail ** k) * ((1 - p_fail) ** (n - k))
poisson_p5 = math.exp(-lam) * (lam ** k) / math.factorial(k)
print("Binomial:", round(binomial_p5, 4))
print("Poisson approximation:", round(poisson_p5, 4))
`
    },
    {
      id: 'st-3-2-ex4',
      type: 'exercise',
      title: 'Your turn: calculate the Poisson probability of exactly four failures',
      body: `<p>Use λ = 100 × <code>p_fail</code> to calculate the Poisson probability of exactly four failed payments in a batch of 100.</p>
<p>Print the result to four decimal places. You should see <code>0.1941</code>.</p>
<p><b>Think before you type:</b> use the Poisson PMF, not the binomial formula. The factorial is <code>math.factorial(4)</code>.</p>
<p><b>Python connection:</b> <code>math.exp()</code> calculates the exponential function, <code>**</code> raises lambda to the power k, and <code>math.factorial()</code> returns k!. These are the three parts of the Poisson formula.</p>`,
      starter: `import math

# p_fail is already loaded

# Write your code below
`,
      hints: [
        'Calculate lam = 100 * p_fail, then use exp(-lam) * lam**4 / factorial(4).',
        'lam = 100 * p_fail\nk = 4\np_four = math.exp(-lam) * (lam ** k) / math.factorial(k)\nprint("{:.4f}".format(p_four))\n'
      ],
      solution: `lam = 100 * p_fail
k = 4
p_four = math.exp(-lam) * (lam ** k) / math.factorial(k)
print("{:.4f}".format(p_four))
`,
      ordered: true
    },
    {
      id: 'st-3-2-ex5',
      type: 'exercise',
      title: 'Your turn: compare the chance of at least one failure under both models',
      body: `<p>Calculate the probability of at least one failure in a batch of 100 using the exact binomial complement and the Poisson complement.</p>
<p>Print both results to four decimal places. You should see approximately <code>0.9867</code> and <code>0.9854</code>.</p>
<p><b>Think before you type:</b> under the binomial model, P(0) = (1 − p)<sup>100</sup>. Under the Poisson model, P(0) = e<sup>−λ</sup>. Subtract each from 1.</p>
<p><b>Python connection:</b> the first expression uses the probability of 100 non-failures. The second uses the Poisson probability of zero events. The complement rule turns each zero-event probability into an at-least-one probability.</p>`,
      starter: `import math

# p_fail is already loaded

# Write your code below
`,
      hints: [
        'Use lam = 100 * p_fail. Binomial: 1 - (1-p_fail)**100. Poisson: 1 - math.exp(-lam).',
        'lam = 100 * p_fail\np_binomial = 1 - (1 - p_fail) ** 100\np_poisson = 1 - math.exp(-lam)\nprint("{:.4f}".format(p_binomial))\nprint("{:.4f}".format(p_poisson))\n'
      ],
      solution: `lam = 100 * p_fail
p_binomial = 1 - (1 - p_fail) ** 100
p_poisson = 1 - math.exp(-lam)
print("{:.4f}".format(p_binomial))
print("{:.4f}".format(p_poisson))
`,
      ordered: true
    },
    {
      id: 'st-3-2-c2',
      type: 'check',
      title: 'When is a Poisson approximation to a binomial count most useful?',
      body: `<p>Think about the number of trials, how rare the event is, and whether the average count remains manageable.</p>`,
      options: [
        'When n is small and p is close to 1',
        'When n is reasonably large, p is small, and λ = np is moderate',
        'When every event is guaranteed to occur',
        'Whenever the data are continuous measurements'
      ],
      answer: 1,
      why: [
        'That is not the usual rare-event setting for the Poisson approximation.',
        'Correct. The approximation is commonly useful for a large number of trials with a small event probability and a moderate expected count.',
        'If every event is certain, the count is fixed. A Poisson model is not appropriate.',
        'The Poisson distribution describes non-negative integer counts, not continuous measurements.'
      ]
    },
    {
      id: 'st-3-2-c3',
      type: 'check',
      title: 'TradeFlow sees failed payments cluster during provider outages. What does that suggest about the simple binomial model?',
      body: `<p>Recall that the binomial model assumes each payment has the same failure probability and that payment outcomes are independent.</p>`,
      options: [
        'The model is automatically more accurate because failures occur together',
        'The independence assumption may fail, so a single binomial model may understate clustering',
        'A binomial model requires the failure probability to be zero',
        'The model becomes continuous rather than discrete'
      ],
      answer: 1,
      why: [
        'Clustering is not evidence that the simple independence assumption is more accurate. It may be a reason to revise the model.',
        'Correct. A provider outage can affect several payments at once, making outcomes dependent. The team may need a model that reflects outages or separate regimes.',
        'A binomial model allows any event probability from 0 to 1, subject to its assumptions.',
        'The number of failures remains a discrete count. Dependence changes the model assumptions, not the type of variable.'
      ]
    },
    {
      type: 'explain',
      title: 'What the model assumptions mean for TradeFlow',
      body: `<p>The binomial and Poisson models are powerful because they simplify a complex process into a small number of parameters. That simplicity is also their weakness if the assumptions do not match the business.</p>
<p>TradeFlow's overall historical payment failure rate is 4.23%. But failure rates differ by payment method. A batch containing mostly Bank Transfer payments may not have the same failure probability as a batch containing mostly Card payments. A network outage may also cause several failures close together, violating independence.</p>
<p>An analyst can respond by estimating separate probabilities for meaningful segments, defining exposure carefully, checking whether the observed count variance is much larger than the Poisson mean, and validating the model against later periods.</p>
<p>Our model is therefore a planning baseline, not a guarantee about next week's payment queue. The purpose of probability modelling is to make assumptions explicit, calculate what follows from them, and then test whether those assumptions are credible.</p>`
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>You can now model the number of events in a fixed group or exposure:</p>
<ul><li>You can recognise a Bernoulli trial and define the event being counted.</li><li>You can check the four assumptions behind a binomial model.</li><li>You can calculate exact binomial probabilities, expected counts and standard deviations.</li><li>You can simulate many batches and compare simulated results with theory.</li><li>You can explain when a Poisson model is appropriate and when it is a useful approximation to a binomial count.</li><li>You can identify business conditions—such as clustering or changing segment rates—that make a simple model questionable.</li></ul>
<p>Next, we turn to a continuous bell-shaped model. The normal distribution is widely used in measurement, process control and approximation—but it is useful only when its shape and assumptions make sense.</p>`
    }
  ]
}
);
