
LESSONS.push(
{
  id: 'st-4-3',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'matplotlib'],
  loopGuard: true,
  files: ['deliveries'],
  setup: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

deliveries = pd.read_csv("deliveries.csv")
deliveries["dispatch_date"] = pd.to_datetime(deliveries["dispatch_date"], errors="coerce")
deliveries["delivery_date"] = pd.to_datetime(deliveries["delivery_date"], errors="coerce")
deliveries["transit_days"] = (
    deliveries["delivery_date"] - deliveries["dispatch_date"]
).dt.days

transit = deliveries.loc[
    deliveries["transit_days"].notna() & (deliveries["transit_days"] >= 0),
    "transit_days"
].astype(float).reset_index(drop=True)

rng = np.random.default_rng(4303)
`,
  preloaded: ['deliveries', 'transit', 'rng'],
  title: '4.3 Point estimates and confidence intervals',
  tables: [],
  intro: `TradeFlow's management team does not want an estimate without context. If the analytics team reports that average delivery time is 5.4 days, management naturally asks: <i>“How precise is that estimate? What range of population values is consistent with our sample?”</i><br><br>A confidence interval combines a point estimate with a margin of error. In this lesson, you will build confidence intervals for a population mean and a population proportion, interpret confidence levels correctly, and understand how sample size and variability affect interval width. You will also learn why a confidence interval is not a guarantee that the true value lies inside one particular interval.`,
  steps: [
    {
      type: 'explain',
      title: 'A point estimate gives one best estimate',
      body: `<p>A <b>point estimate</b> is a single value calculated from sample data and used to estimate an unknown population parameter.</p>
<p>For a population mean μ, the usual point estimate is the sample mean x̄. For a population proportion p, the usual point estimate is the sample proportion p̂ (p-hat).</p>
<table class="mini"><tr><th>Population parameter</th><th>Point estimate</th><th>Example</th></tr>
<tr><td>Population mean μ</td><td>Sample mean x̄</td><td>Average delivery time</td></tr>
<tr><td>Population proportion p</td><td>Sample proportion p̂</td><td>Share of deliveries completed within a target</td></tr></table>
<p>A point estimate is useful, but it does not show how much it might vary from sample to sample. Two samples can produce different means or proportions. A confidence interval adds an uncertainty range around the point estimate.</p>
<p>A common confidence interval has this structure:</p>
<p><b>Point estimate ± margin of error</b></p>
<p>The margin of error is usually a critical value multiplied by a standard error. The critical value reflects the chosen confidence level and the reference distribution. The standard error reflects the estimator's sampling variability.</p>`
    },
    {
      type: 'explain',
      title: 'Confidence intervals for a population mean',
      body: `<p>For a sample mean, a large-sample confidence interval often takes the form:</p>
<p><b>x̄ ± z* × (s / √n)</b></p>
<ul><li><b>x̄:</b> the sample mean, our point estimate.</li><li><b>z*:</b> the critical value from the standard normal distribution.</li><li><b>s:</b> the sample standard deviation.</li><li><b>n:</b> the sample size.</li><li><b>s / √n:</b> the estimated standard error of the sample mean.</li></ul>
<p>For a two-sided 95% interval using the standard normal reference, z* is approximately 1.96. The interval extends about 1.96 estimated standard errors below and above the sample mean.</p>
<p>When the population standard deviation is unknown and the population is approximately normal—especially with a small sample—the more appropriate reference distribution is often Student's t distribution, with n−1 degrees of freedom. The t critical value is larger than the corresponding normal critical value for small samples, reflecting extra uncertainty from estimating the standard deviation. As sample size grows, the t distribution approaches the standard normal distribution.</p>
<div class="callout watch"><b>Our calculation in this lesson:</b> we will use the large-sample normal approximation with z* = 1.96. This is a teaching calculation, not a claim that every sample automatically qualifies. For small samples or highly unusual data, use an appropriate t-based or resampling method and examine the assumptions.</div>`
    },
    {
      type: 'try',
      title: 'Build a 95% confidence interval for mean delivery time',
      body: `<p>Draw a simple random sample of 400 delivery durations. Calculate the sample mean, sample standard deviation and estimated standard error. Then construct a 95% normal-approximation confidence interval using z* = 1.96.</p>
<p>The interval's lower endpoint is the sample mean minus the margin of error. The upper endpoint is the sample mean plus the margin of error.</p>
<p><b>Python connection:</b> <code>np.sqrt(n)</code> calculates the square root of the sample size. <code>1.96 * se</code> calculates the margin of error. We add and subtract that value from the point estimate.</p>`,
      code: `sample = rng.choice(transit.to_numpy(), size=400, replace=False)

n = len(sample)
x_bar = sample.mean()
s = sample.std(ddof=1)
se = s / np.sqrt(n)
z_star = 1.96
margin = z_star * se

lower = x_bar - margin
upper = x_bar + margin

print("Sample mean:", round(x_bar, 3))
print("Standard error:", round(se, 3))
print("Margin of error:", round(margin, 3))
print("95% CI:", (round(lower, 3), round(upper, 3)))`
    },
    {
      type: 'explain',
      title: 'What “95% confidence” actually means',
      body: `<p>The phrase <b>95% confidence</b> has a precise repeated-sampling interpretation.</p>
<p>Imagine repeating the same sampling procedure many times. Each sample produces a new confidence interval. If the method's assumptions hold, approximately 95% of the intervals produced by that procedure will contain the fixed population parameter in the long run.</p>
<p>The population mean is treated as fixed. The interval changes because the sample changes.</p>
<div class="callout analogy"><b>Think of a fishing net.</b> A well-designed netting method catches the fish's location in about 95% of repeated attempts. Once one particular net has been thrown and retrieved, it either contains the fish or it does not. The 95% describes the long-run performance of the method, not a probability assigned to the fixed fish location after the interval has been calculated.</div>
<p>In the frequentist interpretation, it is therefore not quite correct to say: “There is a 95% probability that the true population mean lies inside this calculated interval.” The parameter is fixed; the interval is random before sampling and fixed after the data are observed.</p>
<p>A careful report might say: <i>“The estimated mean delivery time is 5.4 days, with a 95% confidence interval from 5.1 to 5.7 days, calculated using a large-sample normal approximation.”</i> The method and assumptions should be stated, especially when the result will guide an operational decision.</p>`
    },
    {
      type: 'try',
      title: 'See how sample size changes the margin of error',
      body: `<p>Use the same estimated standard deviation to compare the margin of error for sample sizes 100, 400 and 900. We use the formula 1.96 × s / √n.</p>
<p>Notice that increasing n from 100 to 400 divides the margin of error by about 2. Increasing n from 100 to 900 divides it by about 3.</p>
<p>This is why collecting more data improves precision, but with diminishing returns. To halve the margin of error, the sample size must be multiplied by approximately four, assuming the same variability and sampling design.</p>`,
      code: `s = transit.std(ddof=1)

for n in [100, 400, 900]:
    se = s / np.sqrt(n)
    margin = 1.96 * se
    print("n =", n, "| margin of error =", round(margin, 3), "days")`
    },
    {
      id: 'st-4-3-c1',
      type: 'check',
      title: 'Which interpretation of a 95% confidence interval is correct?',
      body: `<p>Assume the interval was constructed using a valid method and its assumptions hold.</p>`,
      options: [
        'There is a 95% probability that the fixed population mean is inside this particular calculated interval',
        'About 95% of intervals produced by this procedure over repeated samples would contain the fixed population mean',
        '95% of individual delivery times fall inside the interval',
        'The sample mean has a 95% chance of being correct'
      ],
      answer: 1,
      why: [
        'This is not the standard frequentist interpretation. Once calculated, the interval either contains the fixed parameter or it does not.',
        'Correct. The confidence level describes the long-run coverage of the interval procedure under its assumptions.',
        'A confidence interval for a mean is not an interval intended to contain 95% of individual observations.',
        'A confidence interval does not assign a probability that the sample mean is correct.'
      ]
    },
    {
      type: 'explain',
      title: 'Confidence intervals for a population proportion',
      body: `<p>TradeFlow may also want to estimate a proportion, such as the share of deliveries completed within a service target.</p>
<p>Suppose each eligible delivery is classified as either meeting or missing the target. If x of n sampled deliveries meet the target, the sample proportion is:</p>
<p><b>p̂ = x / n</b></p>
<p>A common large-sample normal-approximation interval is:</p>
<p><b>p̂ ± z* × √(p̂(1 − p̂) / n)</b></p>
<p>The quantity under the square root is the estimated variance of the sample proportion. Dividing by n gives the estimated variance of the proportion; taking the square root gives its standard error.</p>
<p>This is often called the Wald interval. It is simple, but it can perform poorly when the sample is small or the estimated proportion is close to 0 or 1. In those situations, Wilson or exact binomial intervals are often preferable. The lesson uses the Wald formula to teach the relationship between a proportion, its standard error and a margin of error.</p>
<p>We must also define the event carefully. For this exercise, “on time” will mean a recorded transit duration of 5 days or less. That is an illustrative operational threshold, not a claim that TradeFlow's official service-level agreement uses five days.</p>`
    },
    {
      type: 'try',
      title: 'Estimate the share of deliveries completed within five days',
      body: `<p>Draw a random sample of 500 delivery durations. Count how many are no more than five days. Divide that count by the sample size to calculate the sample proportion, then construct a 95% Wald interval.</p>
<p><b>Python connection:</b> the condition <code>sample <= 5</code> creates a Boolean array. In NumPy, <code>True</code> behaves like 1 and <code>False</code> like 0 in a numerical mean, so <code>(sample <= 5).mean()</code> calculates the share meeting the condition.</p>`,
      code: `sample = rng.choice(transit.to_numpy(), size=500, replace=False)

on_time = sample <= 5
p_hat = on_time.mean()
n = len(sample)

se_p = np.sqrt(p_hat * (1 - p_hat) / n)
margin_p = 1.96 * se_p

lower_p = p_hat - margin_p
upper_p = p_hat + margin_p

print("On-time count:", int(on_time.sum()))
print("Sample proportion:", round(p_hat, 4))
print("95% Wald interval:", (round(lower_p, 4), round(upper_p, 4)))`
    },
    {
      id: 'st-4-3-ex1',
      type: 'exercise',
      title: 'Your turn: calculate a confidence interval for a mean',
      body: `<p>Draw a random sample of 300 delivery durations without replacement. Calculate its sample mean and a 95% normal-approximation confidence interval. Store the endpoints as <code>mean_lower</code> and <code>mean_upper</code>. Print both to three decimal places.</p>
<p>Use the sample standard deviation with <code>ddof=1</code> and z* = 1.96.</p>
<p><b>Python connection:</b> the standard error is the sample standard deviation divided by the square root of n. The margin of error is 1.96 times that standard error.</p>`,
      starter: `# transit and rng are already loaded

# Write your code below
`,
      hints: [
        'Draw 300 observations. Calculate x_bar, s, se and margin before calculating the two endpoints.',
        'sample_300 = rng.choice(transit.to_numpy(), size=300, replace=False)\nn = len(sample_300)\nx_bar = sample_300.mean()\ns = sample_300.std(ddof=1)\nse = s / np.sqrt(n)\nmargin = 1.96 * se\nmean_lower = x_bar - margin\nmean_upper = x_bar + margin\nprint("Lower:", round(mean_lower, 3))\nprint("Upper:", round(mean_upper, 3))\n'
      ],
      solution: `sample_300 = rng.choice(transit.to_numpy(), size=300, replace=False)
n = len(sample_300)
x_bar = sample_300.mean()
s = sample_300.std(ddof=1)
se = s / np.sqrt(n)
margin = 1.96 * se
mean_lower = x_bar - margin
mean_upper = x_bar + margin
print("Lower:", round(mean_lower, 3))
print("Upper:", round(mean_upper, 3))
`,
      ordered: true
    },
    {
      id: 'st-4-3-ex2',
      type: 'exercise',
      title: 'Your turn: calculate a confidence interval for a proportion',
      body: `<p>Using <code>sample_300</code>, estimate the proportion of delivery durations that are five days or less. Calculate a 95% Wald confidence interval and store the endpoints as <code>prop_lower</code> and <code>prop_upper</code>.</p>
<p>Print the sample proportion and both interval endpoints to four decimal places.</p>
<p><b>Python connection:</b> a Boolean comparison creates True/False values; taking their mean gives the fraction that are True.</p>`,
      starter: `# sample_300 is already loaded

# Write your code below
`,
      hints: [
        'Use (sample_300 <= 5).mean() to calculate p_hat.',
        'on_time = sample_300 <= 5\np_hat = on_time.mean()\nn = len(sample_300)\nse_p = np.sqrt(p_hat * (1 - p_hat) / n)\nmargin_p = 1.96 * se_p\nprop_lower = p_hat - margin_p\nprop_upper = p_hat + margin_p\nprint("Proportion:", round(p_hat, 4))\nprint("Lower:", round(prop_lower, 4))\nprint("Upper:", round(prop_upper, 4))\n'
      ],
      solution: `on_time = sample_300 <= 5
p_hat = on_time.mean()
n = len(sample_300)
se_p = np.sqrt(p_hat * (1 - p_hat) / n)
margin_p = 1.96 * se_p
prop_lower = p_hat - margin_p
prop_upper = p_hat + margin_p
print("Proportion:", round(p_hat, 4))
print("Lower:", round(prop_lower, 4))
print("Upper:", round(prop_upper, 4))
`,
      ordered: true
    },
    {
      id: 'st-4-3-c2',
      type: 'check',
      title: 'TradeFlow wants a narrower confidence interval. What is the most direct option?',
      body: `<p>Assume the sampling method and population variability remain comparable.</p>`,
      options: [
        'Reduce the sample size',
        'Increase the sample size',
        'Change the sample mean until it is closer to the target',
        'Round all delivery times to whole numbers'
      ],
      answer: 1,
      why: [
        'Reducing sample size increases standard error and usually widens the interval.',
        'Correct. A larger sample reduces standard error, so the interval is generally narrower.',
        'Changing the estimate to suit a target is not valid statistical analysis.',
        'Rounding observations does not reliably reduce sampling uncertainty and may discard information.'
      ]
    },
    {
      id: 'st-4-3-ex3',
      type: 'exercise',
      title: 'Your turn: calculate the margin of error',
      body: `<p>Using <code>sample_300</code>, calculate the 95% margin of error for its mean delivery time. Store the result as <code>mean_margin</code> and print it to four decimal places.</p>
<p>Do not calculate the endpoints for this exercise. Focus on the distance from the sample mean to either endpoint.</p>
<p><b>Python connection:</b> margin of error = critical value × standard error.</p>`,
      starter: `# sample_300 is already loaded

# Write your code below
`,
      hints: [
        'Calculate the sample standard deviation with ddof=1, divide by sqrt(n), and multiply by 1.96.',
        'n = len(sample_300)\ns = sample_300.std(ddof=1)\nse = s / np.sqrt(n)\nmean_margin = 1.96 * se\nprint("Margin of error:", round(mean_margin, 4))\n'
      ],
      solution: `n = len(sample_300)
s = sample_300.std(ddof=1)
se = s / np.sqrt(n)
mean_margin = 1.96 * se
print("Margin of error:", round(mean_margin, 4))
`,
      ordered: true
    },
    {
      id: 'st-4-3-ex4',
      type: 'exercise',
      title: 'Your turn: compare 90% and 95% confidence intervals',
      body: `<p>Using <code>sample_300</code>, calculate the margin of error for both a 90% interval (z* = 1.645) and a 95% interval (z* = 1.96). Store them as <code>margin_90</code> and <code>margin_95</code>.</p>
<p>Print both margins. The 95% interval should be wider because a higher confidence level requires a larger critical value.</p>
<p><b>Python connection:</b> the sample and standard error stay the same. Only the critical value changes.</p>`,
      starter: `# sample_300 is already loaded

# Write your code below
`,
      hints: [
        'Calculate the standard error once, then multiply it by each critical value.',
        'n = len(sample_300)\nse = sample_300.std(ddof=1) / np.sqrt(n)\nmargin_90 = 1.645 * se\nmargin_95 = 1.96 * se\nprint("90% margin:", round(margin_90, 4))\nprint("95% margin:", round(margin_95, 4))\n'
      ],
      solution: `n = len(sample_300)
se = sample_300.std(ddof=1) / np.sqrt(n)
margin_90 = 1.645 * se
margin_95 = 1.96 * se
print("90% margin:", round(margin_90, 4))
print("95% margin:", round(margin_95, 4))
`,
      ordered: true
    },
    {
      id: 'st-4-3-ex5',
      type: 'exercise',
      title: 'Your turn: report a confidence interval in context',
      body: `<p>Using the values already calculated for <code>mean_lower</code> and <code>mean_upper</code>, print a sentence that reports the interval in days.</p>
<p>Your sentence should identify the parameter being estimated and the confidence level. Do not say that 95% of individual deliveries fall inside the interval.</p>
<p><b>Python connection:</b> an f-string lets you insert variable values inside a string. The expression <code>{mean_lower:.2f}</code> displays a value to two decimal places.</p>`,
      starter: `# mean_lower and mean_upper are already loaded

# Write your code below
`,
      hints: [
        'Use an f-string and format both endpoints to two decimal places.',
        'print(f"We estimate the population mean delivery time with a 95% confidence interval from {mean_lower:.2f} to {mean_upper:.2f} days.")\n'
      ],
      solution: `print(f"We estimate the population mean delivery time with a 95% confidence interval from {mean_lower:.2f} to {mean_upper:.2f} days.")
`,
      ordered: true
    },
    {
      id: 'st-4-3-c3',
      type: 'check',
      title: 'Why might a 95% interval be wider than a 90% interval from the same sample?',
      body: `<p>The sample estimate and standard error are unchanged.</p>`,
      options: [
        'The 95% interval uses a larger critical value to achieve higher long-run coverage',
        'The 95% interval has a smaller sample size',
        'The population mean becomes more variable after the sample is collected',
        'A 95% interval always contains 95% of the sample observations'
      ],
      answer: 0,
      why: [
        'Correct. A higher confidence level requires a larger critical value and therefore a wider interval when the standard error is unchanged.',
        'The sample is the same in both calculations.',
        'The population parameter is treated as fixed; it does not change after the sample is collected.',
        'A confidence interval for a mean is not a range designed to contain a specified percentage of individual observations.'
      ]
    },
    {
      type: 'explain',
      title: 'Limits and good reporting practice',
      body: `<p>A confidence interval is only as trustworthy as the design and assumptions behind it.</p>
<ul><li><b>Sampling bias:</b> a narrow interval from a biased sample can be precisely wrong.</li><li><b>Dependence:</b> clustered observations can make a simple standard error too small.</li><li><b>Small samples:</b> the normal approximation for a proportion can be unreliable when successes or failures are rare.</li><li><b>Skew and outliers:</b> a small-sample mean interval may be sensitive to extreme values.</li><li><b>Measurement error:</b> an interval does not correct inaccurate timestamps or inconsistent definitions.</li></ul>
<p>When reporting an interval, state the quantity, the population, the sample size, the confidence level, the method and any important limitations. Avoid reporting a confidence interval as if it were a service guarantee.</p>
<p>For example, if TradeFlow's sample covers only completed deliveries, report that the interval estimates the mean among eligible completed deliveries. Do not silently extend the conclusion to cancelled orders or orders with no recorded delivery.</p>`
    },
    {
      type: 'explain',
      title: 'What you should take away from Lesson 4.3',
      body: `<p>You can now calculate and interpret confidence intervals for a population mean and a population proportion using large-sample normal approximations.</p>
<ul><li>A <b>point estimate</b> is one sample-based estimate of a population parameter.</li><li>A <b>standard error</b> describes the estimator's sampling variability.</li><li>A <b>critical value</b> sets how many standard errors are included on either side of the estimate.</li><li>A <b>margin of error</b> is the critical value multiplied by the standard error.</li><li>A <b>confidence level</b> describes the long-run coverage of the interval procedure.</li></ul>
<p>In the final lesson, we will use the bootstrap to estimate uncertainty by repeatedly resampling from the data we actually observed.</p>`
    }
  ]
}
);

LESSONS.push(
{
  id: 'st-4-4',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'matplotlib'],
  loopGuard: true,
  files: ['deliveries'],
  setup: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

deliveries = pd.read_csv("deliveries.csv")
deliveries["dispatch_date"] = pd.to_datetime(deliveries["dispatch_date"], errors="coerce")
deliveries["delivery_date"] = pd.to_datetime(deliveries["delivery_date"], errors="coerce")
deliveries["transit_days"] = (
    deliveries["delivery_date"] - deliveries["dispatch_date"]
).dt.days

transit = deliveries.loc[
    deliveries["transit_days"].notna() & (deliveries["transit_days"] >= 0),
    "transit_days"
].astype(float).reset_index(drop=True)

rng = np.random.default_rng(4404)
`,
  preloaded: ['deliveries', 'transit', 'rng'],
  title: '4.4 Bootstrap estimation: learning uncertainty from the data',
  tables: [],
  intro: `A conventional confidence interval uses a formula for the estimator's standard error and a reference distribution such as the normal or t distribution. But what if the estimator is complicated, the population shape is unusual, or a simple formula is difficult to derive? The <b>bootstrap</b> offers another approach.<br><br>In this lesson, you will learn how resampling with replacement approximates the sampling distribution of a statistic. You will construct bootstrap distributions and percentile confidence intervals for TradeFlow delivery times, compare bootstrap and normal-approximation results, and learn when bootstrap methods can—and cannot—be trusted.`,
  steps: [
    {
      type: 'explain',
      title: 'The central idea: treat the sample as a stand-in for the population',
      body: `<p>The bootstrap is a resampling method. Instead of repeatedly drawing new samples from the true population—which we usually cannot do because we do not know the entire population—we repeatedly draw new samples from the sample we already have.</p>
<p>Each bootstrap sample is drawn <b>with replacement</b>. This means the same observation can appear more than once in a bootstrap sample, while another observation may not appear at all.</p>
<p>The basic procedure is:</p>
<ol><li>Draw an original sample from the population.</li><li>Draw a bootstrap sample of the same size from the original sample, with replacement.</li><li>Calculate the statistic of interest, such as the mean or median.</li><li>Repeat many times to create a bootstrap distribution of the statistic.</li><li>Use the bootstrap distribution to estimate standard errors or confidence intervals.</li></ol>
<div class="callout analogy"><b>Think of a bag of numbered tickets.</b> Your original sample supplies the tickets. For each bootstrap draw, you pick a ticket and put it back before picking again. Some tickets may appear several times; others may not appear at all. Each new bag of selected tickets gives you a new estimate.</div>
<p>The bootstrap does not create new information about the population. It uses the information in the observed sample to approximate how the statistic might vary under repeated sampling.</p>`
    },
    {
      type: 'explain',
      title: 'Why bootstrap samples use replacement',
      body: `<p>Suppose the original sample contains 100 delivery durations. A bootstrap sample also contains 100 values, but each selection is made from the same original set of 100 values.</p>
<p>Because we replace each selected value before the next draw, the bootstrap sample can contain repeated observations. That is intentional. It allows the resampled datasets to vary in their composition while keeping the same sample size.</p>
<p>If we sampled without replacement from the original sample and selected all 100 observations, every resample would contain exactly the same values. The bootstrap distribution would collapse to one statistic and tell us nothing about sampling variability.</p>
<p>In NumPy, <code>rng.choice(sample, size=n, replace=True)</code> performs this resampling. We repeat it many times and calculate the statistic for each resample.</p>
<div class="callout watch"><b>Bootstrap is not magic.</b> If the original sample is biased, the bootstrap generally reproduces that bias. If the original sample misses a rare but important part of the population, resampling cannot invent those missing observations.</div>`
    },
    {
      type: 'try',
      title: 'Create a bootstrap distribution of the mean',
      body: `<p>First, draw an original sample of 300 delivery durations. Then create 2,000 bootstrap samples of size 300, each drawn with replacement from that original sample. Calculate the mean of each bootstrap sample.</p>
<p>The resulting array, <code>boot_means</code>, is a bootstrap distribution of the sample mean.</p>
<p><b>Python connection:</b> the call to <code>rng.choice()</code> returns a two-dimensional array with 2,000 rows and 300 values per row. Calling <code>.mean(axis=1)</code> produces one mean for each bootstrap row.</p>`,
      code: `original_sample = rng.choice(transit.to_numpy(), size=300, replace=False)

bootstrap_draws = rng.choice(
    original_sample,
    size=(2000, len(original_sample)),
    replace=True
)

boot_means = bootstrap_draws.mean(axis=1)

print("Bootstrap repetitions:", len(boot_means))
print("Original sample mean:", round(original_sample.mean(), 3))
print("Bootstrap mean:", round(boot_means.mean(), 3))
print("Bootstrap standard error:", round(boot_means.std(ddof=1), 3))`
    },
    {
      type: 'try',
      title: 'Visualise the bootstrap distribution',
      body: `<p>Plot the 2,000 bootstrap means. The distribution should be centred near the original sample mean. Its spread estimates the sampling variability of the mean.</p>
<p>We add a vertical line at the original sample mean so that the centre of the bootstrap distribution is easy to compare with the observed estimate.</p>
<p><b>Python connection:</b> <code>plt.axvline()</code> draws a vertical reference line. The <code>label</code> argument names it in the legend. <code>plt.legend()</code> displays that label.</p>`,
      code: `plt.figure(figsize=(8, 4))
plt.hist(boot_means, bins=30, density=True)
plt.axvline(
    original_sample.mean(),
    label="Original sample mean"
)
plt.title("Bootstrap distribution of the mean")
plt.xlabel("Bootstrap mean (days)")
plt.ylabel("Density")
plt.legend()
plt.show()`
    },
    {
      type: 'explain',
      title: 'The percentile bootstrap confidence interval',
      body: `<p>One simple bootstrap interval is the <b>percentile interval</b>. For a 95% interval, take the 2.5th percentile and the 97.5th percentile of the bootstrap statistics.</p>
<p>In Python, <code>np.quantile(boot_means, [0.025, 0.975])</code> returns those two quantiles. The interval is formed directly from the bootstrap distribution.</p>
<p>This method is intuitive: it keeps the central 95% of the bootstrap estimates. It does not require us to assume that the bootstrap distribution is perfectly normal.</p>
<p>However, percentile intervals are not universally best. They can be inaccurate when the estimator's sampling distribution is strongly biased or asymmetric, when the sample is small, or when the original data do not represent the target population. More advanced methods—such as BCa intervals—adjust for bias and skewness, but also require additional calculations and assumptions.</p>
<div class="callout tip"><b>Important distinction:</b> a bootstrap percentile interval is built from the resampled statistic. It is not simply the 2.5th and 97.5th percentiles of the original individual delivery times. We are taking quantiles of <code>boot_means</code>, not quantiles of <code>transit</code>.</div>`
    },
    {
      type: 'try',
      title: 'Calculate a 95% bootstrap confidence interval',
      body: `<p>Use the bootstrap distribution already stored in <code>boot_means</code>. Calculate its 2.5th and 97.5th percentiles and print them as the lower and upper endpoints of a 95% percentile bootstrap interval.</p>
<p><b>Python connection:</b> <code>np.quantile()</code> returns values at requested cumulative proportions. The list <code>[0.025, 0.975]</code> asks for the lower and upper cut-offs that leave 2.5% in each tail.</p>`,
      code: `boot_lower, boot_upper = np.quantile(boot_means, [0.025, 0.975])

print("95% bootstrap interval:")
print(round(boot_lower, 3), "to", round(boot_upper, 3), "days")`
    },
    {
      id: 'st-4-4-c1',
      type: 'check',
      title: 'Why does the bootstrap sample with replacement?',
      body: `<p>We want repeated resamples to differ in which original observations they contain.</p>`,
      options: [
        'To make every bootstrap sample contain new observations never seen before',
        'To allow observations to appear more than once and create variation between resamples',
        'To guarantee that the bootstrap distribution is normal',
        'To remove bias from the original sample'
      ],
      answer: 1,
      why: [
        'Bootstrap samples are drawn from the original sample, so they do not introduce unseen observations.',
        'Correct. Replacement allows repeated selections and omissions, creating variation in the resampled statistic.',
        'A bootstrap distribution does not have to be normal. Its shape depends on the statistic and the data.',
        'Resampling cannot generally remove selection bias in the original sample.'
      ]
    },
    {
      type: 'explain',
      title: 'Compare bootstrap and normal-approximation intervals',
      body: `<p>We can compare two intervals for the same original sample:</p>
<ul><li>A normal-approximation interval uses the sample mean plus or minus 1.96 times the estimated standard error.</li><li>A percentile bootstrap interval uses the 2.5th and 97.5th percentiles of the bootstrap means.</li></ul>
<p>If the bootstrap distribution is approximately symmetric and the sample is reasonably well behaved, the intervals may be similar. If they differ substantially, that is a reason to investigate the shape of the bootstrap distribution and the sensitivity of the estimate.</p>
<p>Do not select whichever interval gives the more convenient business answer. Choose a method because its assumptions and performance are appropriate for the question.</p>`
    },
    {
      type: 'try',
      title: 'Compare the two intervals for the same sample',
      body: `<p>Calculate a 95% normal-approximation interval for the mean of <code>original_sample</code>, then compare it with the bootstrap percentile interval.</p>
<p>Both intervals estimate the same population mean from the same original sample. They differ in how they approximate uncertainty.</p>`,
      code: `x_bar = original_sample.mean()
s = original_sample.std(ddof=1)
se = s / np.sqrt(len(original_sample))

normal_lower = x_bar - 1.96 * se
normal_upper = x_bar + 1.96 * se

boot_lower, boot_upper = np.quantile(boot_means, [0.025, 0.975])

print("Normal interval:", (round(normal_lower, 3), round(normal_upper, 3)))
print("Bootstrap interval:", (round(boot_lower, 3), round(boot_upper, 3)))`
    },
    {
      id: 'st-4-4-ex1',
      type: 'exercise',
      title: 'Your turn: bootstrap the median',
      body: `<p>Using <code>original_sample</code>, generate 1,500 bootstrap samples of the same size with replacement. Calculate the median of each bootstrap sample and store the results in <code>boot_medians</code>.</p>
<p>Print the mean and standard deviation of the bootstrap medians to three decimal places.</p>
<p><b>Why this matters:</b> the bootstrap is useful for statistics beyond the mean. Here we are estimating the sampling variability of the median.</p>`,
      starter: `# original_sample and rng are already loaded

# Write your code below
`,
      hints: [
        'Use size=(1500, len(original_sample)) and replace=True, then calculate np.median(..., axis=1).',
        'median_draws = rng.choice(original_sample, size=(1500, len(original_sample)), replace=True)\nboot_medians = np.median(median_draws, axis=1)\nprint("Mean bootstrap median:", round(boot_medians.mean(), 3))\nprint("SD of bootstrap medians:", round(boot_medians.std(ddof=1), 3))\n'
      ],
      solution: `median_draws = rng.choice(original_sample, size=(1500, len(original_sample)), replace=True)
boot_medians = np.median(median_draws, axis=1)
print("Mean bootstrap median:", round(boot_medians.mean(), 3))
print("SD of bootstrap medians:", round(boot_medians.std(ddof=1), 3))
`,
      ordered: true
    },
    {
      id: 'st-4-4-ex2',
      type: 'exercise',
      title: 'Your turn: build a bootstrap interval for the median',
      body: `<p>Using <code>boot_medians</code>, calculate a 95% percentile bootstrap interval for the population median. Store the endpoints as <code>median_lower</code> and <code>median_upper</code>. Print both to three decimal places.</p>
<p><b>Python connection:</b> use the 0.025 and 0.975 quantiles of the bootstrap statistic distribution, not the original observations.</p>`,
      starter: `# boot_medians is already loaded

# Write your code below
`,
      hints: [
        'Use np.quantile(boot_medians, [0.025, 0.975]) and unpack the two values.',
        'median_lower, median_upper = np.quantile(boot_medians, [0.025, 0.975])\nprint("Lower:", round(median_lower, 3))\nprint("Upper:", round(median_upper, 3))\n'
      ],
      solution: `median_lower, median_upper = np.quantile(boot_medians, [0.025, 0.975])
print("Lower:", round(median_lower, 3))
print("Upper:", round(median_upper, 3))
`,
      ordered: true
    },
    {
      id: 'st-4-4-ex2b',
      type: 'check',
      title: 'Which values form a percentile bootstrap interval for the mean?',
      body: `<p>The bootstrap distribution contains one sample mean for each resample.</p>`,
      options: [
        'The 2.5th and 97.5th percentiles of the original delivery observations',
        'The 2.5th and 97.5th percentiles of the bootstrap means',
        'The minimum and maximum of the original sample',
        'The population mean plus or minus the population standard deviation'
      ],
      answer: 1,
      why: [
        'Those are quantiles of individual observations, not of the bootstrap statistic.',
        'Correct. A percentile bootstrap interval uses quantiles of the resampled statistic—in this case, the bootstrap means.',
        'The minimum and maximum are not a 95% bootstrap interval.',
        'This is not the percentile bootstrap method and does not describe a confidence interval for the mean.'
      ]
    },
    {
      id: 'st-4-4-ex3',
      type: 'exercise',
      title: 'Your turn: estimate bootstrap standard error',
      body: `<p>Calculate the standard deviation of <code>boot_medians</code> using <code>ddof=1</code>. Store it as <code>median_boot_se</code> and print it to four decimal places.</p>
<p>This is the bootstrap estimate of the standard error of the sample median for the observed original sample.</p>`,
      starter: `# boot_medians is already loaded

# Write your code below
`,
      hints: [
        'Use boot_medians.std(ddof=1).',
        'median_boot_se = boot_medians.std(ddof=1)\nprint("Bootstrap SE of median:", round(median_boot_se, 4))\n'
      ],
      solution: `median_boot_se = boot_medians.std(ddof=1)
print("Bootstrap SE of median:", round(median_boot_se, 4))
`,
      ordered: true
    },
    {
      id: 'st-4-4-ex4',
      type: 'exercise',
      title: 'Your turn: inspect the bootstrap distribution',
      body: `<p>Plot a histogram of <code>boot_medians</code> using 25 bins. Add a title and label the x-axis as “Bootstrap median (days)”.</p>
<p>Look at the shape. Is it approximately symmetric, skewed or unusually irregular? The plot is a diagnostic aid, not a formal proof that the bootstrap interval has correct coverage.</p>
<p><b>Python connection:</b> <code>plt.hist()</code> displays the distribution, while <code>plt.title()</code> and <code>plt.xlabel()</code> add explanatory labels.</p>`,
      starter: `# boot_medians is already loaded

# Write your code below
`,
      hints: [
        'Call plt.figure(), plt.hist(boot_medians, bins=25), add the title and x-axis label, then call plt.show().',
        'plt.figure(figsize=(7, 4))\nplt.hist(boot_medians, bins=25)\nplt.title("Bootstrap distribution of the median")\nplt.xlabel("Bootstrap median (days)")\nplt.ylabel("Frequency")\nplt.show()\n'
      ],
      solution: `plt.figure(figsize=(7, 4))
plt.hist(boot_medians, bins=25)
plt.title("Bootstrap distribution of the median")
plt.xlabel("Bootstrap median (days)")
plt.ylabel("Frequency")
plt.show()
`,
      ordered: true
    },
    {
      id: 'st-4-4-ex5',
      type: 'exercise',
      title: 'Your turn: report the bootstrap interval in context',
      body: `<p>Using <code>median_lower</code> and <code>median_upper</code>, print a sentence reporting the 95% bootstrap percentile interval for the population median delivery time.</p>
<p>Use an f-string and show each endpoint to two decimal places. State that the interval concerns the population median, not the population mean.</p>`,
      starter: `# median_lower and median_upper are already loaded

# Write your code below
`,
      hints: [
        'Use an f-string with {median_lower:.2f} and {median_upper:.2f}.',
        'print(f"The 95% bootstrap percentile interval for the population median delivery time is {median_lower:.2f} to {median_upper:.2f} days.")\n'
      ],
      solution: `print(f"The 95% bootstrap percentile interval for the population median delivery time is {median_lower:.2f} to {median_upper:.2f} days.")
`,
      ordered: true
    },
    {
      id: 'st-4-4-c1',
      type: 'check',
      title: 'What is a major limitation of the bootstrap?',
      body: `<p>The bootstrap repeatedly resamples from the original sample.</p>`,
      options: [
        'It can repair any bias in the original sample',
        'It cannot reliably represent important population features that the original sample failed to capture',
        'It works only when the original observations are normally distributed',
        'It always produces a narrower interval than a normal approximation'
      ],
      answer: 1,
      why: [
        'Resampling generally reproduces features and limitations of the original sample; it does not automatically remove bias.',
        'Correct. The bootstrap cannot create information about groups or rare events missing from the original sample.',
        'The bootstrap can be used with many non-normal distributions, subject to its own assumptions and limitations.',
        'Bootstrap intervals may be wider or narrower; there is no universal rule.'
      ]
    },
    {
      type: 'explain',
      title: 'When bootstrap methods are useful—and when they are not',
      body: `<p>Bootstrap methods are particularly useful when:</p>
<ul><li>The sampling distribution of a statistic is difficult to derive analytically.</li><li>The statistic is more complicated than a simple mean, such as a median or a percentile.</li><li>The analyst wants to examine the shape and variability of an estimator using the observed data.</li></ul>
<p>But bootstrap methods have limitations:</p>
<ul><li><b>Unrepresentative samples:</b> resampling cannot repair selection bias.</li><li><b>Very small samples:</b> the observed sample may not contain enough information to represent the population's variation.</li><li><b>Rare events:</b> if a rare event never appears in the original sample, ordinary resampling cannot generate it.</li><li><b>Dependence:</b> resampling individual rows independently can destroy clusters or time structure. Cluster or block bootstrap methods may be needed.</li><li><b>Boundary problems:</b> some statistics and distributions require specialised bootstrap methods.</li></ul>
<p>For TradeFlow, if deliveries are grouped by warehouse or affected by shared outages, resampling individual delivery rows may understate uncertainty. A cluster bootstrap that resamples warehouses, or a block bootstrap that preserves time dependence, may be more appropriate.</p>
<p>Bootstrap is a method for quantifying uncertainty—not a substitute for understanding how the data were generated.</p>`
    },
    {
      type: 'explain',
      title: 'Module 4 complete: from samples to defensible estimates',
      body: `<p>You have completed the move from descriptive statistics to statistical estimation. You can now explain how a sample can provide evidence about a larger population, and how to communicate the uncertainty in that evidence.</p>
<ul><li><b>4.1 Sampling and estimation:</b> define populations and samples, distinguish parameters from statistics, and recognise sampling variability and selection bias.</li><li><b>4.2 Sampling distributions:</b> explain the sampling distribution of the mean, calculate standard errors, simulate repeated samples and apply the Central Limit Theorem carefully.</li><li><b>4.3 Confidence intervals:</b> construct large-sample intervals for means and proportions, interpret confidence levels and explain the effect of sample size.</li><li><b>4.4 Bootstrap methods:</b> resample with replacement, estimate bootstrap standard errors, construct percentile intervals and recognise the method's limitations.</li></ul>
<p>The most important lesson is this: an estimate is not just a number. A responsible analyst explains what population it refers to, how the sample was selected, how much uncertainty remains, and which assumptions support the conclusion.</p>
<p>In Module 5, we will use these foundations to study hypothesis testing: how analysts assess evidence against a specific claim without confusing statistical significance with business importance.</p>`
    }
  ]
}
);
