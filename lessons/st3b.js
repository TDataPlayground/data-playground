LESSONS.push(
{
  id: 'st-3-3',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'matplotlib'],
  loopGuard: true,
  files: ['deliveries'],
  setup: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math

deliveries = pd.read_csv("deliveries.csv")
deliveries["dispatch_date"] = pd.to_datetime(deliveries["dispatch_date"], errors="coerce")
deliveries["delivery_date"] = pd.to_datetime(deliveries["delivery_date"], errors="coerce")
deliveries["transit_days"] = (deliveries["delivery_date"] - deliveries["dispatch_date"]).dt.days
transit = deliveries["transit_days"].dropna()

# The normal CDF: probability accumulated to the left of z in a standard normal model.
def normal_cdf(z):
    return 0.5 * (1 + math.erf(z / math.sqrt(2)))
`,
  preloaded: ['deliveries', 'transit', 'normal_cdf'],
  title: '3.3 The normal distribution: the bell curve and standard scores',
  tables: [],
  intro: `TradeFlow's operations director is planning a new express-delivery lane. The team wants a way to describe variation around a target delivery time and estimate the share that may finish before a service deadline. A bell-shaped model is often useful for that kind of planning—but only when the process and the data support it.<br><br>In this lesson, you will learn what makes a normal distribution special, how its mean and standard deviation determine its shape, why probability is area under the curve, and how a z-score puts values onto a common scale. You will calculate probabilities with the normal cumulative distribution and use the normal curve to approximate a binomial count. We will also compare a normal reference model with TradeFlow's actual delivery-time distribution, so you learn when <b>not</b> to use the bell curve.`,
  steps: [
    {
      type: 'explain',
      title: 'What makes a normal distribution special?',
      body: `<p>The <b>normal distribution</b> is a continuous, symmetric, bell-shaped probability distribution. Values close to the centre are most common. Values farther from the centre become progressively less common, with matching left and right tails.</p>
<p>A normal distribution is determined by two parameters:</p>
<ul><li><b>Mean (μ):</b> the centre of the distribution.</li><li><b>Standard deviation (σ):</b> the scale of spread. A larger σ makes the curve wider and flatter; a smaller σ makes it narrower and taller.</li></ul>
<p>We write X ~ Normal(μ, σ²). The second parameter is the variance, σ², although people often describe the model using its standard deviation. In a normal distribution, the mean, median and mode are all equal because the curve is perfectly symmetric.</p>
<p>The normal curve is important because many measurement errors and process variations are approximately symmetric, and because averages of many suitable random observations often become approximately normal. It is also used as an approximation to other distributions under appropriate conditions.</p>
<div class="callout watch"><b>Do not assume every large dataset is normal.</b> A large number of observations makes a histogram more detailed; it does not force the underlying distribution to become bell-shaped. TradeFlow's payment amounts are strongly right-skewed, and its recorded delivery days are close to flat. Neither is automatically normal just because there are thousands of rows.</div>`
    },
    {
      type: 'explain',
      title: 'A TradeFlow planning model: six days on average, two days of spread',
      body: `<p>Suppose TradeFlow is planning an express-delivery process and the operations team proposes the following <b>planning assumption</b>: delivery duration for the new lane can be approximated by a normal distribution with mean 6 days and standard deviation 2 days.</p>
<p>This is a hypothetical model for the proposed process, not a fitted description of the current delivery records. The purpose is to learn how a normal model answers service-level questions. Later, the team would compare actual pilot results with this assumption before using it operationally.</p>
<p>Under this model:</p>
<ul><li>μ = 6 days: the centre is 6 days.</li><li>σ = 2 days: the standard deviation is 2 days.</li><li>μ − σ = 4 days and μ + σ = 8 days.</li></ul>
<p>The normal model is symmetric around 6. If the assumptions were reasonable, a delivery time 2 days below the mean would be as far from the centre as one 2 days above it. The curve does not say that every delivery takes 6 days; it describes how probability is distributed around that centre.</p>
<div class="callout work"><b>TradeFlow decision question:</b> if the proposed process has this distribution, what share of deliveries should finish between 4 and 8 days? We will calculate that using the area under the normal curve.</div>`
    },
    {
      type: 'try',
      title: 'Draw the proposed normal model',
      body: `<p>The curve below is a normal model with mean 6 days and standard deviation 2 days. The x-axis shows delivery duration; the y-axis shows probability density, not probability at a single day.</p>
<p><b>Python walkthrough:</b> <code>np.linspace(-2, 14, 400)</code> creates 400 evenly spaced x-values from -2 to 14. The function <code>normal_pdf()</code> calculates the height of the normal density at each x-value. <code>plt.plot()</code> draws the curve. The dashed vertical line marks the mean.</p>
<p>The negative part of the mathematical curve is a limitation for a time variable: a real delivery duration cannot be negative. With this particular illustrative mean and spread, the negative tail is small, but the model is still an approximation that should be checked against actual process data.</p>`,
      code: `def normal_pdf(x, mu, sigma):
    z = (x - mu) / sigma
    return (1 / (sigma * math.sqrt(2 * math.pi))) * np.exp(-0.5 * z ** 2)

mu = 6
sigma = 2
x_values = np.linspace(-2, 14, 400)
density = normal_pdf(x_values, mu, sigma)

plt.figure(figsize=(8, 4))
plt.plot(x_values, density, label="Normal model: mean 6, SD 2")
plt.axvline(mu, color="red", linestyle="--", label="Mean = 6 days")
plt.xlabel("Delivery duration (days)")
plt.ylabel("Probability density")
plt.title("TradeFlow express-lane planning model")
plt.legend()
plt.tight_layout()
`
    },
    {
      type: 'explain',
      title: 'Why probability is area, not height',
      body: `<p>For a continuous normal variable, the height of the curve at a particular x-value is a <b>density</b>. It is not the probability of that exact value. The probability of a range is the area under the curve across that range.</p>
<p>For the proposed TradeFlow model, the probability that a delivery takes between 4 and 8 days is the area from 4 to 8 under the curve. Because 4 and 8 are one standard deviation below and above the mean, this area is approximately 0.6827, or 68.27%.</p>
<p>Similarly, the area between 2 and 10 days is about 95.45%, and the area between 0 and 12 days is about 99.73%. These are the familiar <b>68–95–99.7 rule</b> for a normal distribution:</p>
<table class="mini"><tr><th>Range</th><th>Approximate share</th></tr>
<tr><td>Within 1 standard deviation of the mean</td><td>68.27%</td></tr>
<tr><td>Within 2 standard deviations</td><td>95.45%</td></tr>
<tr><td>Within 3 standard deviations</td><td>99.73%</td></tr></table>
<p>The rule applies to a normal distribution. It is not a universal law for all data. Do not apply it to a strongly skewed payment distribution just because you know the mean and standard deviation.</p>`
    },
    {
      type: 'explain',
      title: 'A z-score puts a value on a common scale',
      body: `<p>A <b>z-score</b> tells us how many standard deviations a value is above or below the mean:</p>
<p><b>z = (x − μ) ÷ σ.</b></p>
<p>For the proposed delivery model, a delivery time of 8 days has z = (8 − 6) ÷ 2 = 1. It is one standard deviation above the mean. A delivery time of 4 days has z = (4 − 6) ÷ 2 = −1. It is one standard deviation below the mean.</p>
<p>The z-score removes the original unit and expresses position relative to the distribution's centre and spread. This lets analysts compare values measured in different units, provided the reference mean and standard deviation are meaningful.</p>
<ul><li>z = 0: exactly at the mean.</li><li>z = 1: one standard deviation above the mean.</li><li>z = −2: two standard deviations below the mean.</li></ul>
<p>A z-score is not itself a probability. It is a standardised position. We use the standard normal distribution to convert that position into a probability.</p>`
    },
    {
      type: 'try',
      title: 'Standardise an eight-day delivery',
      body: `<p>Use the proposed model, with mean 6 and standard deviation 2. The z-score for 8 days should be 1.0.</p>
<p><b>Python walkthrough:</b> the variables <code>mu</code> and <code>sigma</code> hold the model's mean and standard deviation. Subtracting <code>mu</code> from the value measures the distance from the centre. Dividing by <code>sigma</code> expresses that distance in standard-deviation units. The result has no days attached to it.</p>`,
      code: `mu = 6
sigma = 2
x = 8
z = (x - mu) / sigma
print("{:.2f}".format(z))
`
    },
    {
      id: 'st-3-3-ex1',
      type: 'exercise',
      title: 'Your turn: calculate the z-score of a nine-day delivery',
      body: `<p>Under the proposed TradeFlow express-lane model, the mean is 6 days and the standard deviation is 2 days. Calculate the z-score for a delivery that takes 9 days.</p>
<p>Print the result to two decimal places. You should see <code>1.50</code>.</p>
<p><b>Think before you type:</b> subtract the mean from the observed value, then divide by the standard deviation. The result tells you how many standard deviations above the mean the delivery time lies.</p>
<p><b>Python connection:</b> the formula uses ordinary subtraction and division. Keep the order of operations clear: (x − μ) first, then divide by σ.</p>`,
      starter: `mu = 6
sigma = 2
x = 9

# Write your code below
`,
      hints: [
        'Calculate (x - mu) / sigma.',
        'z = (x - mu) / sigma\nprint("{:.2f}".format(z))\n'
      ],
      solution: `mu = 6
sigma = 2
x = 9

z = (x - mu) / sigma
print("{:.2f}".format(z))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The standard normal CDF converts z-scores into probabilities',
      body: `<p>The <b>standard normal distribution</b> is the normal distribution with mean 0 and standard deviation 1. Every normal variable can be converted to this common scale using its z-score.</p>
<p>Its cumulative distribution function, written Φ(z), gives the probability that a standard normal value is less than or equal to z. For example, Φ(1) is approximately 0.8413. This means about 84.13% of the standard normal distribution lies to the left of z = 1.</p>
<p>Python's standard <code>math</code> library includes the error function <code>erf()</code>, which lets us calculate the standard normal CDF without adding SciPy as a dependency:</p>
<p><code>Φ(z) = 0.5 × [1 + erf(z / √2)]</code></p>
<p>The setup has already defined <code>normal_cdf(z)</code> for this lesson. It takes a z-score and returns the cumulative probability to its left. To calculate P(a &lt; X ≤ b), calculate the CDF at b and subtract the CDF at a.</p>
<p>For the eight-day deadline, z = 1, so P(X ≤ 8) = Φ(1) ≈ 0.8413. This is the model's estimated share of deliveries completed in eight days or less.</p>
<div class="callout tip"><b>Left tail, interval, right tail:</b> P(X ≤ b) = Φ(z<sub>b</sub>); P(a &lt; X ≤ b) = Φ(z<sub>b</sub>) − Φ(z<sub>a</sub>); P(X &gt; a) = 1 − Φ(z<sub>a</sub>).</div>`
    },
    {
      type: 'try',
      title: 'Calculate the model probability of delivery within eight days',
      body: `<p>Under the illustrative model, eight days is one standard deviation above the mean. The normal CDF at z = 1 is approximately 0.8413, so the model assigns about an 84.13% probability to a delivery finishing in eight days or less.</p>
<p><b>Python walkthrough:</b> first standardise the eight-day deadline. Then pass the z-score into <code>normal_cdf()</code>. The function returns the area to the left of that deadline. The returned number is a probability because it is an accumulated area.</p>`,
      code: `mu = 6
sigma = 2
deadline = 8
z_deadline = (deadline - mu) / sigma
p_within_deadline = normal_cdf(z_deadline)
print("{:.4f}".format(p_within_deadline))
`
    },
    {
      id: 'st-3-3-ex2',
      type: 'exercise',
      title: 'Your turn: calculate the probability of delivery within eight days',
      body: `<p>Use the normal model with mean 6 days and standard deviation 2 days. Calculate the probability that a delivery takes 8 days or less.</p>
<p>Print the answer to four decimal places. You should see <code>0.8413</code>.</p>
<p><b>Think before you type:</b> calculate the z-score for 8 days, then use the prepared <code>normal_cdf()</code> function.</p>
<p><b>Python connection:</b> <code>normal_cdf()</code> returns the probability accumulated to the left of its input z-score. It does not accept the delivery time directly; standardise the time first.</p>`,
      starter: `mu = 6
sigma = 2
deadline = 8

# Write your code below
`,
      hints: [
        'Calculate z = (deadline - mu) / sigma, then call normal_cdf(z).',
        'z = (deadline - mu) / sigma\np = normal_cdf(z)\nprint("{:.4f}".format(p))\n'
      ],
      solution: `mu = 6
sigma = 2
deadline = 8

z = (deadline - mu) / sigma
p = normal_cdf(z)
print("{:.4f}".format(p))
`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Calculate the share within one standard deviation',
      body: `<p>For a normal model, the interval from μ − σ to μ + σ contains approximately 68.27% of the probability. For our illustrative process, that is from 4 to 8 days.</p>
<p>The code calculates the z-score at both endpoints, evaluates the CDF at each endpoint, and subtracts the lower cumulative probability from the upper one. This gives the area between the two values.</p>`,
      code: `mu = 6
sigma = 2
lower = mu - sigma
upper = mu + sigma
z_lower = (lower - mu) / sigma
z_upper = (upper - mu) / sigma
p_between = normal_cdf(z_upper) - normal_cdf(z_lower)
print("{:.4f}".format(p_between))
`
    },
    {
      id: 'st-3-3-ex3',
      type: 'exercise',
      title: 'Your turn: find the probability between four and eight days',
      body: `<p>Under the TradeFlow planning model, calculate the probability that a delivery duration is between 4 and 8 days.</p>
<p>Print the answer to four decimal places. You should see <code>0.6827</code>.</p>
<p><b>Think before you type:</b> calculate the z-score at 4 and at 8. Evaluate the CDF at both endpoints. Subtract the lower CDF from the upper CDF.</p>
<p><b>Python connection:</b> the difference of two cumulative probabilities gives the probability in the interval between their thresholds. Do not add the two CDF values.</p>`,
      starter: `mu = 6
sigma = 2
lower = 4
upper = 8

# Write your code below
`,
      hints: [
        'Find z_lower and z_upper. Then subtract normal_cdf(z_lower) from normal_cdf(z_upper).',
        'z_lower = (lower - mu) / sigma\nz_upper = (upper - mu) / sigma\np_between = normal_cdf(z_upper) - normal_cdf(z_lower)\nprint("{:.4f}".format(p_between))\n'
      ],
      solution: `mu = 6
sigma = 2
lower = 4
upper = 8

z_lower = (lower - mu) / sigma
z_upper = (upper - mu) / sigma
p_between = normal_cdf(z_upper) - normal_cdf(z_lower)
print("{:.4f}".format(p_between))
`,
      ordered: true
    },
    {
      id: 'st-3-3-c1',
      type: 'check',
      title: 'Under a continuous normal model, what is the probability of a delivery taking exactly 6.000000 days?',
      body: `<p>Think about the difference between a density height and probability at one exact point.</p>`,
      options: [
        '0.5, because the mean splits the distribution in half',
        '1, because 6 days is the mean',
        '0, because a continuous distribution assigns probability to intervals, not individual points',
        'It is equal to the standard deviation'
      ],
      answer: 2,
      why: [
        'The probability of being at or below the mean is 0.5, but the probability of exactly the mean is zero in a continuous model.',
        'The mean is the centre, not a guaranteed outcome. A single exact point has probability zero.',
        'Correct. Probability for a continuous variable is area over an interval. A single point has zero width and therefore zero probability.',
        'Standard deviation measures spread. It is not a point probability.'
      ]
    },
    {
      type: 'explain',
      title: 'A normal approximation to a binomial allocation count',
      body: `<p>TradeFlow is planning a controlled pilot in which each of 100 eligible orders is assigned independently to Group A with probability 0.5. Let X be the number assigned to Group A. This is a binomial count with n = 100 and p = 0.5.</p>
<p>Its mean is np = 50 and its standard deviation is √[np(1 − p)] = 5. The binomial distribution is discrete, but when both np and n(1 − p) are sufficiently large, a normal distribution can approximate its shape.</p>
<p>A practical rule of thumb is to check that np and n(1 − p) are each at least around 10. This is not a mathematical guarantee, but it helps avoid using the approximation when the distribution is too lopsided or too concentrated near zero.</p>
<p>To estimate P(45 ≤ X ≤ 55), we use a <b>continuity correction</b>. The binomial count takes whole numbers. The normal curve is continuous. The integers 45 through 55 are represented by the continuous interval from 44.5 to 55.5, not 45 to 55. This half-unit adjustment usually improves the approximation.</p>
<p>The normal approximation gives about 0.7287, very close to the exact binomial probability of about 0.7287 for this example. This is a useful bridge between discrete counts and the continuous normal curve.</p>`
    },
    {
      type: 'try',
      title: 'Compare the exact and normal-approximated pilot allocation probability',
      body: `<p>Calculate P(45 ≤ X ≤ 55) for a Binomial(100, 0.5) model in two ways. First, add the exact binomial probabilities for counts 45 through 55. Then use the normal approximation with mean 50, standard deviation 5 and continuity-corrected boundaries 44.5 and 55.5.</p>
<p>The two results should be very close. This is an example where the normal approximation is reasonable because the expected number in each outcome group is 50.</p>
<p><b>Python walkthrough:</b> the loop visits each integer k from 45 to 55. <code>range(45, 56)</code> stops before 56, so it includes 55. Each exact probability is calculated using <code>math.comb()</code>. The normal approximation uses the CDF difference at the corrected boundaries.</p>`,
      code: `n = 100
p = 0.5
mu = n * p
sigma = math.sqrt(n * p * (1 - p))

exact = sum(
    math.comb(n, k) * (p ** k) * ((1 - p) ** (n - k))
    for k in range(45, 56)
)

lower_z = (44.5 - mu) / sigma
upper_z = (55.5 - mu) / sigma
approximation = normal_cdf(upper_z) - normal_cdf(lower_z)

print("Exact binomial:", round(exact, 4))
print("Normal approximation:", round(approximation, 4))
`
    },
    {
      id: 'st-3-3-ex4',
      type: 'exercise',
      title: 'Your turn: approximate the chance of 45 to 55 Group A assignments',
      body: `<p>TradeFlow assigns 100 orders independently to Group A with probability 0.5. Use a normal approximation to estimate the probability that between 45 and 55 orders, inclusive, are assigned to Group A.</p>
<p>Use the continuity-corrected interval from 44.5 to 55.5. Print the approximation to four decimal places. You should see <code>0.7287</code>.</p>
<p><b>Think before you type:</b> the binomial mean is 50 and its standard deviation is 5. Convert each corrected endpoint into a z-score and subtract the lower CDF from the upper CDF.</p>
<p><b>Python connection:</b> the continuity correction shifts a discrete count boundary by half a unit because the normal model is continuous. The CDF difference returns the probability between those adjusted boundaries.</p>`,
      starter: `import math

n = 100
p = 0.5

# Write your code below
`,
      hints: [
        'Calculate mu = n*p and sigma = sqrt(n*p*(1-p)). Use z-scores for 44.5 and 55.5.',
        'mu = n * p\nsigma = math.sqrt(n * p * (1 - p))\nlo = (44.5 - mu) / sigma\nhi = (55.5 - mu) / sigma\nprint("{:.4f}".format(normal_cdf(hi) - normal_cdf(lo)))\n'
      ],
      solution: `import math

n = 100
p = 0.5

mu = n * p
sigma = math.sqrt(n * p * (1 - p))
lo = (44.5 - mu) / sigma
hi = (55.5 - mu) / sigma
print("{:.4f}".format(normal_cdf(hi) - normal_cdf(lo)))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Check the normal assumption against actual TradeFlow delivery times',
      body: `<p>We have used a normal model for a proposed process. Now compare it with the current TradeFlow delivery records. The 8,261 observed transit times are whole numbers from 1 to 10 days, and the counts for those days are almost level. That is a roughly uniform discrete shape, not a bell-shaped curve.</p>
<p>If we use the observed mean and standard deviation to create a normal reference curve, it predicts a different share of deliveries taking 3 days or less. Because the recorded duration is in whole days, the continuity-corrected normal boundary is 3.5 days. The normal reference model gives about 24.07%, while the empirical data show 29.85%.</p>
<p>This difference is not a reason to alter the observations to fit the normal curve. It is evidence that the normal model may not describe this particular variable well. A model must be checked against the shape and the business process; a familiar formula is not a substitute for that check.</p>
<div class="callout watch"><b>Model, then diagnose.</b> A normal model can be useful for a proposed process, measurement error or a suitable approximation. But the current TradeFlow delivery-time distribution is close to flat. We should not use a normal model for its individual delivery times without stronger evidence.</div>`
    },
    {
      id: 'st-3-3-ex5',
      type: 'exercise',
      title: 'Your turn: compare the empirical and normal-reference shares of short deliveries',
      body: `<p>Use the observed TradeFlow transit times. Calculate the empirical share of recorded deliveries taking 3 days or less. Then calculate the normal-reference approximation using the observed mean and standard deviation, with a continuity-corrected boundary of 3.5 days.</p>
<p>Print both probabilities to four decimal places. You should see approximately <code>0.2985</code> and <code>0.2407</code>.</p>
<p><b>Think before you type:</b> the empirical probability is the mean of <code>transit <= 3</code>. For the normal approximation, standardise 3.5 using the observed mean and standard deviation, then evaluate the CDF.</p>
<p><b>Python connection:</b> <code>transit.mean()</code> and <code>transit.std()</code> estimate the centre and spread. The first probability is directly observed. The second is calculated from a normal reference model. The gap helps assess whether that model represents the observed shape.</p>`,
      starter: `# transit is already loaded

# Write your code below
`,
      hints: [
        'Use (transit <= 3).mean() for the empirical proportion. Then calculate z = (3.5 - transit.mean()) / transit.std() and call normal_cdf(z).',
        'empirical = (transit <= 3).mean()\nmu = transit.mean()\nsigma = transit.std()\nz = (3.5 - mu) / sigma\nnormal_reference = normal_cdf(z)\nprint("{:.4f}".format(empirical))\nprint("{:.4f}".format(normal_reference))\n'
      ],
      solution: `empirical = (transit <= 3).mean()
mu = transit.mean()
sigma = transit.std()
z = (3.5 - mu) / sigma
normal_reference = normal_cdf(z)
print("{:.4f}".format(empirical))
print("{:.4f}".format(normal_reference))
`,
      ordered: true
    },
    {
      id: 'st-3-3-c2',
      type: 'check',
      title: 'Why do we apply a continuity correction when using a normal curve to approximate a binomial count?',
      body: `<p>The binomial count takes whole-number values. The normal distribution is continuous.</p>`,
      options: [
        'To make the binomial probability equal to exactly 0.5',
        'To shift count boundaries by half a unit so the continuous interval represents the intended integer values',
        'To remove the need to calculate the mean and standard deviation',
        'To convert the binomial distribution into a uniform distribution'
      ],
      answer: 1,
      why: [
        'A continuity correction does not force a probability to 0.5. It adjusts the boundary between discrete and continuous representations.',
        'Correct. For example, integer counts 45 through 55 are represented by the continuous interval 44.5 through 55.5.',
        'The normal approximation still needs the binomial mean and standard deviation.',
        'The correction does not change the model family to uniform.'
      ]
    },
    {
      id: 'st-3-3-c3',
      type: 'check',
      title: 'TradeFlow’s delivery times are nearly flat from 1 to 10 days. Should we automatically model individual delivery times as normal?',
      body: `<p>Use the observed shape, not the popularity of the normal distribution, to choose a model.</p>`,
      options: [
        'Yes. Any numeric variable with thousands of records is approximately normal',
        'Yes. The mean and standard deviation are enough to prove normality',
        'No. The observed shape is close to flat, so a normal model would need evidence before being used',
        'No. Normal distributions can only model counts'
      ],
      answer: 2,
      why: [
        'A large dataset does not force the underlying variable to become normal.',
        'Many different distributions can share the same mean and standard deviation. Shape and process assumptions still matter.',
        'Correct. The observed distribution is close to flat across 1 to 10 days, which is not the bell-shaped pattern required by a normal model.',
        'Normal distributions are continuous models. They are not limited to counts.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>You can now use the normal distribution as a model rather than treating it as a default assumption.</p>
<ul><li>You can describe a normal distribution using its mean and standard deviation.</li><li>You can explain why probabilities are areas under the curve.</li><li>You can standardise an observation with a z-score and convert it into a cumulative probability.</li><li>You can use the 68–95–99.7 rule when the normal model is appropriate.</li><li>You can use a continuity correction when approximating a suitable binomial count.</li><li>You can compare a model with the observed shape and recognise when a normal assumption is not credible.</li></ul>
<p>Next, we return to TradeFlow's payment amounts. Those amounts have a long right tail. We will examine why positive business values often have skewed distributions, what a lognormal model assumes, and why transforming data does not automatically make a model correct.</p>`
    }
  ]
},
{
  id: 'st-3-4',
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
amount = payments["amount"].dropna()
log_amount = np.log(amount)

def normal_cdf(z):
    return 0.5 * (1 + math.erf(z / math.sqrt(2)))
`,
  preloaded: ['payments', 'amount', 'log_amount', 'normal_cdf'],
  title: '3.4 Skewed distributions: long tails, lognormal models and business risk',
  tables: [],
  intro: `The Finance Director at TradeFlow is reviewing payment values. The average payment is higher than the median, and a small number of transactions are several times larger than a typical payment. The director asks: <i>“Can we describe the pattern with a probability model, and can we estimate how often unusually large payments occur?”</i><br><br>In Module 1, you learned to recognise skew and investigate outliers. Here we go further: we will connect skewed shapes to the probability distributions that often produce them. You will examine the lognormal model, compare it with actual TradeFlow payment amounts, and learn why a transformation can make a distribution look more balanced without proving that a particular model fits. We will finish with a practical model-selection checklist for business analysis.`,
  steps: [
    {
      type: 'explain',
      title: 'Why many business quantities are right-skewed',
      body: `<p>TradeFlow's payment amounts are positive. Most payments sit in the lower and middle part of the range, while a small number are much larger. The distribution has a long tail to the right. This is called <b>right skew</b>.</p>
<p>The current data show an average payment amount of about 158,198 amount units and a median of about 127,828. The mean is larger because large payments pull the arithmetic average upward. The 99th percentile is about 529,242, and the largest payment is above 1 million. These are not necessarily errors; they are part of the observed distribution and should be investigated in context.</p>
<p>Right-skewed distributions appear in many business settings: order values, transaction sizes, customer lifetime value, insurance claims, repair costs and web traffic. A small number of very large values can matter greatly to revenue or risk, even when they are uncommon.</p>
<p>Module 1 introduced skewness as a measure of asymmetry. In this module, we connect that shape to model families. We are not just asking whether the data are lopsided; we are asking what process could plausibly generate the values and what probability model can describe their behaviour.</p>
<div class="callout watch"><b>Do not delete the tail because it is inconvenient.</b> A high payment might be a real large order. First investigate whether the record is valid. If it is genuine, it is part of the business and may be exactly what the risk team needs to understand.</div>`
    },
    {
      type: 'try',
      title: 'Summarise the TradeFlow payment distribution',
      body: `<p>Use <code>.mean()</code>, <code>.median()</code>, <code>.quantile()</code> and <code>.skew()</code> to summarise the payment amounts. The large difference between mean and median is a clue that the distribution has a right tail. Skewness gives a numerical measure of that asymmetry.</p>
<p><b>Python connection:</b> <code>quantile(0.99)</code> returns the 99th percentile, not the 99th largest payment. <code>max()</code> returns the single largest observed value. These statistics describe different parts of the distribution.</p>`,
      code: `print("Mean:", round(amount.mean(), 2))
print("Median:", round(amount.median(), 2))
print("90th percentile:", round(amount.quantile(0.90), 2))
print("99th percentile:", round(amount.quantile(0.99), 2))
print("Maximum:", round(amount.max(), 2))
print("Skewness:", round(amount.skew(), 4))
`
    },
    {
      id: 'st-3-4-ex1',
      type: 'exercise',
      title: 'Your turn: calculate the skewness of TradeFlow payment amounts',
      body: `<p>Calculate the skewness of the <code>amount</code> Series and print it to four decimal places.</p>
<p>You should see approximately <code>1.3894</code>.</p>
<p><b>Think before you type:</b> use the Pandas <code>.skew()</code> method on the payment amount Series. A positive value indicates a longer right tail.</p>
<p><b>Python connection:</b> <code>.skew()</code> calculates a measure of asymmetry from the observed values. It returns one number summarising the direction and degree of skew; it does not identify a probability model by itself.</p>`,
      starter: `# amount is already loaded

# Write your code below
`,
      hints: [
        'Call amount.skew() and format the result to four decimal places.',
        'payment_skew = amount.skew()\nprint("{:.4f}".format(payment_skew))\n'
      ],
      solution: `payment_skew = amount.skew()
print("{:.4f}".format(payment_skew))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The lognormal distribution: when multiplying factors build the outcome',
      body: `<p>A common model for positive, right-skewed quantities is the <b>lognormal distribution</b>. A positive random variable X is lognormal when its natural logarithm, ln(X), follows a normal distribution.</p>
<p>In symbols: if Y = ln(X) is normally distributed, then X = exp(Y) is lognormally distributed. The original variable is positive and can have a long right tail, even though its logarithm has a more symmetric bell-shaped distribution.</p>
<p>Why can this happen? Some business quantities are shaped by <b>multiplicative</b> effects. An order value may depend on the number of items, the product mix, quantity, price level and customer behaviour. Multiplying several positive factors can create a distribution with many moderate values and a few very large ones. The log transform turns multiplication into addition, which can make the result easier to model.</p>
<p>Other skewed distribution families have different mechanisms:</p>
<table class="mini"><tr><th>Family</th><th>Typical support and shape</th><th>Business examples</th></tr>
<tr><td><b>Lognormal</b></td><td>Positive values; often right-skewed</td><td>Transaction sizes, order values, claim amounts when multiplicative effects are plausible</td></tr>
<tr><td><b>Exponential</b></td><td>Non-negative waiting times with a constant event rate</td><td>Time between independent arrivals in a constant-rate process</td></tr>
<tr><td><b>Gamma</b></td><td>Positive, often right-skewed</td><td>Waiting time to several events, service durations and positive cost amounts</td></tr>
<tr><td><b>Pareto / heavy-tail models</b></td><td>Positive values with a particularly long upper tail</td><td>Concentration of sales, extreme claims, very large transaction or customer values</td></tr></table>
<p>These are model families, not labels to attach by appearance alone. The data type, support, process and tail behaviour all matter. A payment amount cannot be negative, which already makes a normal model with support over all real numbers less natural as a direct model for individual payments.</p>`
    },
    {
      type: 'try',
      title: 'Transform payment amounts with a natural logarithm',
      body: `<p>The setup has created <code>log_amount</code> by applying NumPy's natural logarithm to each positive payment amount. <code>np.log()</code> applies the logarithm element by element to the whole Series.</p>
<p>Compare the skewness before and after transformation. TradeFlow's payment amount skewness is about 1.3894. The log values have skewness about -0.6223, so the transformation reduces the strong right skew and slightly tips the shape to the left.</p>
<p>This is useful, but it is not proof that the logged values are normally distributed. A transformed histogram, tail checks and model diagnostics are still required. A logarithm changes the scale; it does not guarantee a perfect bell curve.</p>`,
      code: `print("Original skewness:", round(amount.skew(), 4))
print("Log-scale skewness:", round(log_amount.skew(), 4))

fig, axes = plt.subplots(1, 2, figsize=(11, 4))
axes[0].hist(amount / 1000, bins=30, edgecolor="black")
axes[0].set_title("Payment amounts: original scale")
axes[0].set_xlabel("Amount (thousands)")
axes[1].hist(log_amount, bins=30, edgecolor="black")
axes[1].set_title("Natural log of payment amounts")
axes[1].set_xlabel("Log amount")
for ax in axes:
    ax.set_ylabel("Number of payments")
plt.tight_layout()
`
    },
    {
      id: 'st-3-4-ex2',
      type: 'exercise',
      title: 'Your turn: measure the share of very large payments',
      body: `<p>Calculate the empirical probability that a TradeFlow payment amount is greater than 500,000 amount units.</p>
<p>Print the result to four decimal places. You should see <code>0.0140</code>.</p>
<p><b>Think before you type:</b> use the strict greater-than comparison. The mean of the Boolean result is the share of records above the threshold.</p>
<p><b>Python connection:</b> this is an empirical upper-tail probability. The comparison identifies each payment in the tail; taking the mean gives the fraction of all observed payments in that tail.</p>`,
      starter: `# amount is already loaded

# Write your code below
`,
      hints: [
        'Use (amount > 500000).mean() and format the result to four decimal places.',
        'p_above_500k = (amount > 500000).mean()\nprint("{:.4f}".format(p_above_500k))\n'
      ],
      solution: `p_above_500k = (amount > 500000).mean()
print("{:.4f}".format(p_above_500k))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A lognormal model is a hypothesis to test, not an automatic conclusion',
      body: `<p>Because the log of payment amounts is more balanced than the original amounts, we can examine a simple lognormal model. To fit this model by the usual moment approach, estimate the mean and standard deviation of the log amounts. Those become the mean and standard deviation of the normal distribution for ln(X).</p>
<p>Let μ<sub>log</sub> be the mean of the log amounts and σ<sub>log</sub> their standard deviation. To estimate the chance of a payment exceeding a threshold T under the fitted lognormal model:</p>
<ol><li>Take the natural log of T.</li><li>Standardise it: z = [ln(T) − μ<sub>log</sub>] ÷ σ<sub>log</sub>.</li><li>Calculate the normal probability to the right: 1 − Φ(z).</li></ol>
<p>For TradeFlow's 500,000 threshold, the fitted lognormal model estimates a tail probability of about 3.90%. But the empirical share above that threshold is only 1.40%. That is a material difference. This simple lognormal fit overstates the observed upper-tail frequency at this threshold.</p>
<p>That gap is exactly why we validate a distribution model rather than choosing it because a transformation makes the histogram look nicer. The model may be useful for some purposes and poor for others. Tail risk often matters most to finance and risk teams, so tail fit deserves particular attention.</p>
<div class="callout watch"><b>A more symmetric log scale is not the same as a confirmed lognormal model.</b> The log amounts still have skewness around -0.62, and the fitted model overestimates the observed share above 500,000. Keep the empirical rate visible and do not use the model as a reliable tail forecast without further validation.</div>`
    },
    {
      type: 'try',
      title: 'Compare the empirical and fitted-lognormal tail probabilities',
      body: `<p>We calculate the empirical share above 500,000 directly from the observed amounts. Then we fit the simple lognormal reference by taking the mean and standard deviation of the log amounts and using the normal CDF for the logged threshold.</p>
<p><b>Python walkthrough:</b> <code>np.log(500000)</code> transforms the threshold to the log scale. The z-score measures how far it is above the average log amount. <code>1 - normal_cdf(z)</code> gives the right-tail probability under the fitted model. Compare that with the empirical proportion.</p>`,
      code: `threshold = 500000
empirical_tail = (amount > threshold).mean()
mu_log = log_amount.mean()
sigma_log = log_amount.std()
z_threshold = (np.log(threshold) - mu_log) / sigma_log
lognormal_tail = 1 - normal_cdf(z_threshold)

print("Empirical tail:", round(empirical_tail, 4))
print("Fitted lognormal tail:", round(lognormal_tail, 4))
`
    },
    {
      id: 'st-3-4-ex3',
      type: 'exercise',
      title: 'Your turn: calculate the fitted-lognormal probability above 500,000',
      body: `<p>Use the log amount mean and standard deviation to calculate the fitted-lognormal probability that a payment exceeds 500,000 amount units.</p>
<p>Print the result to four decimal places. You should see approximately <code>0.0390</code>.</p>
<p><b>Think before you type:</b> take the natural logarithm of 500,000, calculate its z-score using the log-scale mean and standard deviation, then subtract the normal CDF from 1.</p>
<p><b>Python connection:</b> the lognormal upper-tail probability becomes a normal upper-tail probability after applying the natural logarithm. The function <code>normal_cdf()</code> returns the area to the left, so we subtract it from 1 to obtain the right tail.</p>`,
      starter: `# amount, log_amount and normal_cdf are already loaded

# Write your code below
`,
      hints: [
        'Calculate mu_log and sigma_log from log_amount. Then standardise np.log(500000) and use 1 - normal_cdf(z).',
        'mu_log = log_amount.mean()\nsigma_log = log_amount.std()\nz = (np.log(500000) - mu_log) / sigma_log\np_tail = 1 - normal_cdf(z)\nprint("{:.4f}".format(p_tail))\n'
      ],
      solution: `mu_log = log_amount.mean()
sigma_log = log_amount.std()
z = (np.log(500000) - mu_log) / sigma_log
p_tail = 1 - normal_cdf(z)
print("{:.4f}".format(p_tail))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Compare percentiles as well as tail probabilities',
      body: `<p>A model should be checked at more than one threshold. A useful second comparison is the 90th percentile.</p>
<p>For the fitted lognormal model, the 90th percentile is exp(μ<sub>log</sub> + 1.2816σ<sub>log</sub>). The number 1.2816 is the standard normal z-score with 90% of its area to the left.</p>
<p>For TradeFlow, the empirical 90th percentile is about 317,507 amount units. The simple fitted-lognormal reference gives about 337,890. The model is higher at this percentile and also overstates the share above 500,000. These comparisons suggest the fit is not exact.</p>
<p>In a professional analysis, you would examine a range of percentiles, compare the empirical and model CDFs, inspect tail behaviour, and validate using a later period or a holdout sample. A model that describes the centre well may still be poor at the extreme values that matter most to risk management.</p>
<div class="callout work"><b>How to communicate this to Finance:</b> “The lognormal model is a useful reference, but at the 500,000 threshold it predicts 3.90% of payments above the limit, while the observed share is 1.40%. We should not use this fit for high-value payment forecasts without further validation.”</div>`
    },
    {
      id: 'st-3-4-ex4',
      type: 'exercise',
      title: 'Your turn: calculate the fitted-lognormal 90th percentile',
      body: `<p>Calculate the 90th percentile implied by the simple lognormal reference model, using the mean and standard deviation of <code>log_amount</code>. Use the standard normal 90th-percentile z-score of 1.2815516.</p>
<p>Print the result to two decimal places. You should see approximately <code>337890.16</code>.</p>
<p><b>Think before you type:</b> calculate μ<sub>log</sub> + 1.2815516 × σ<sub>log</sub>, then exponentiate to return to the original payment-amount scale.</p>
<p><b>Python connection:</b> <code>np.exp()</code> is the inverse of the natural logarithm. We use it to transform the model percentile back into amount units. Do not report the log-scale value as a payment amount.</p>`,
      starter: `# log_amount is already loaded

# Write your code below
`,
      hints: [
        'Use mu_log = log_amount.mean(), sigma_log = log_amount.std(), then np.exp(mu_log + 1.2815516 * sigma_log).',
        'mu_log = log_amount.mean()\nsigma_log = log_amount.std()\nq90_model = np.exp(mu_log + 1.2815516 * sigma_log)\nprint("{:.2f}".format(q90_model))\n'
      ],
      solution: `mu_log = log_amount.mean()
sigma_log = log_amount.std()
q90_model = np.exp(mu_log + 1.2815516 * sigma_log)
print("{:.2f}".format(q90_model))
`,
      ordered: true
    },
    {
      id: 'st-3-4-c1',
      type: 'check',
      title: 'Why is a normal distribution usually a poor direct model for positive payment amounts with a long right tail?',
      body: `<p>Think about the support and shape of the two distributions.</p>`,
      options: [
        'A normal distribution is always discrete',
        'A normal distribution is symmetric and extends over negative and positive values, while payment amounts are positive and strongly right-skewed',
        'A normal distribution has no mean or standard deviation',
        'A normal distribution cannot be used in business analysis'
      ],
      answer: 1,
      why: [
        'A normal distribution is continuous, not discrete.',
        'Correct. The symmetry and negative support of a normal model do not naturally match a positive, right-skewed payment amount distribution.',
        'A normal distribution is defined by its mean and standard deviation.',
        'Normal models are widely useful in business when the variable and assumptions suit them. The issue is fit to this particular payment variable.'
      ]
    },
    {
      type: 'explain',
      title: 'A practical checklist for choosing a distribution',
      body: `<p>Choosing a distribution should begin with the business question and the way the data are generated. Use this checklist before fitting a model:</p>
<ol><li><b>Identify the variable.</b> Is it a count, a positive amount, a duration, a proportion, or a measurement error?</li><li><b>Check its support.</b> Can it be negative? Must it be a whole number? Is there a natural upper bound?</li><li><b>Inspect the shape.</b> Is it symmetric, skewed, flat, multi-peaked or heavy-tailed? Use a histogram and summary statistics.</li><li><b>Understand the process.</b> Do outcomes arise from a fixed number of trials, events over time, additive measurement errors, or multiplicative factors?</li><li><b>Check assumptions.</b> Are events independent? Is the rate stable? Is the population comparable across groups and time?</li><li><b>Validate the model.</b> Compare predicted probabilities, percentiles and tail frequencies with observed data, ideally on data not used to fit the model.</li></ol>
<p>Some useful starting points are:</p>
<table class="mini"><tr><th>Business question</th><th>Possible model family</th><th>Important check</th></tr>
<tr><td>How many failures occur in 100 independent payments?</td><td>Binomial</td><td>Fixed n, same p, independent trials</td></tr>
<tr><td>How many independent incidents arrive per hour at a stable rate?</td><td>Poisson</td><td>Stable rate and limited clustering</td></tr>
<tr><td>How do symmetric measurement errors vary around a target?</td><td>Normal</td><td>Approximately symmetric shape and suitable process assumptions</td></tr>
<tr><td>How are positive transaction sizes distributed when multiplicative factors matter?</td><td>Lognormal may be a candidate</td><td>Log-scale fit and tail validation</td></tr></table>
<p>A distribution is a model of uncertainty, not a decoration for a chart. It should earn its place by matching the variable, the process and the decision.</p>`
    },
    {
      id: 'st-3-4-ex5',
      type: 'exercise',
      title: 'Your turn: compare the empirical and modelled 90th percentiles',
      body: `<p>Calculate the empirical 90th percentile of TradeFlow payment amounts and the 90th percentile implied by the simple lognormal reference. Print both to two decimal places.</p>
<p>You should see approximately <code>317507.28</code> and <code>337890.16</code>.</p>
<p><b>Think before you type:</b> use <code>amount.quantile(0.90)</code> for the empirical percentile. For the modelled percentile, use the log-scale mean and standard deviation with z = 1.2815516, then apply <code>np.exp()</code>.</p>
<p><b>Python connection:</b> the empirical quantile ranks the observed payment amounts. The model quantile uses the fitted normal distribution of log amounts and transforms the result back. The difference is evidence to evaluate, not a value to hide.</p>`,
      starter: `# amount and log_amount are already loaded

# Write your code below
`,
      hints: [
        'Calculate q90_empirical = amount.quantile(0.90). For the model, use np.exp(log_amount.mean() + 1.2815516 * log_amount.std()).',
        'q90_empirical = amount.quantile(0.90)\nq90_model = np.exp(log_amount.mean() + 1.2815516 * log_amount.std())\nprint("{:.2f}".format(q90_empirical))\nprint("{:.2f}".format(q90_model))\n'
      ],
      solution: `q90_empirical = amount.quantile(0.90)
q90_model = np.exp(log_amount.mean() + 1.2815516 * log_amount.std())
print("{:.2f}".format(q90_empirical))
print("{:.2f}".format(q90_model))
`,
      ordered: true
    },
    {
      id: 'st-3-4-c2',
      type: 'check',
      title: 'The log transform makes payment amounts look more symmetric. Does that prove they follow a lognormal distribution?',
      body: `<p>Think about the difference between a helpful transformation and a validated probability model.</p>`,
      options: [
        'Yes. Any positive variable becomes exactly normal after taking logs',
        'Yes. A histogram that looks balanced is enough to prove a model fits',
        'No. The log shape, tails, quantiles and out-of-sample predictions still need to be checked',
        'No. Logarithms cannot be used with payment amounts'
      ],
      answer: 2,
      why: [
        'A logarithm changes the scale but does not guarantee a normal distribution.',
        'A histogram is useful but sensitive to bin choices and sample size. It is not a complete model validation.',
        'Correct. A lognormal model requires the log values to be suitably normal, and the model should reproduce relevant probabilities and tail behaviour.',
        'Logarithms can be used for positive payment amounts. They are undefined for zero or negative values, which is why support must be checked first.'
      ]
    },
    {
      id: 'st-3-4-c3',
      type: 'check',
      title: 'The fitted lognormal predicts 3.90% of payments above 500,000, but the observed share is 1.40%. What should the analyst do?',
      body: `<p>The model substantially overstates the observed tail at this threshold.</p>`,
      options: [
        'Use the model anyway because a theoretical distribution is always more reliable than observed data',
        'Change the observed values until they match the model',
        'Report the mismatch, investigate the fit and avoid using this model for tail forecasts until it is validated or improved',
        'Delete all payments above 500,000 because they cause the mismatch'
      ],
      answer: 2,
      why: [
        'A model is only useful when its assumptions and predictions are credible for the intended decision.',
        'Observed data should not be altered to force agreement with a model.',
        'Correct. A material tail mismatch should be reported and investigated before the model is used for high-value payment forecasts.',
        'Large payments may be legitimate. They should be investigated, not deleted merely because the model struggles with them.'
      ]
    },
    {
      type: 'explain',
      title: 'Module 3 complete: what you can now do with distributions',
      body: `<p>You have moved from describing individual events to modelling the full pattern of uncertainty.</p>
<ul><li><b>3.1 Distributions:</b> distinguish discrete and continuous variables, understand PMFs, PDFs and CDFs, and read percentiles as cumulative thresholds.</li><li><b>3.2 Binomial and Poisson:</b> model counts of events, check assumptions, calculate probabilities and simulate possible outcomes.</li><li><b>3.3 Normal:</b> understand the bell curve, standardise observations, calculate probabilities and use a normal approximation when conditions support it.</li><li><b>3.4 Skewed distributions:</b> recognise long-tailed business values, understand lognormal reasoning and validate fitted models against observed tails and percentiles.</li></ul>
<p>The most important habit is not memorising which distribution goes with which formula. It is learning to ask: what kind of quantity is this, what process creates it, what assumptions would a model require, and do the model's predictions agree with the evidence?</p>
<p>In Module 4, we will move from describing distributions to using samples to learn about a larger population. We will study sampling distributions, standard errors, estimation and confidence intervals. The ideas you have just learned—especially variability, normal models and the behaviour of sample averages—will become essential.</p>`
    }
  ]
}
);
