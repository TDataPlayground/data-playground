LESSONS.push({
  id: 'st-5-3',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'scipy'],
  loopGuard: true,
  files: ['deliveries'],
  preloaded: ['deliveries', 'transit', 'rng'],
  title: '5.3 Two-sample hypothesis tests: comparing groups',
  intro: `
    <h2>Moving from one group to two</h2>
    <p>In the previous lessons, we learned how to use hypothesis tests to investigate claims about a single population mean or proportion.</p>
    <p>Operational decisions, however, frequently require comparisons. Does one delivery service produce shorter transit times than another? Did a route optimisation reduce delivery delays? Is the difference between two warehouses large enough to be statistically convincing?</p>
    <p>These questions require us to compare groups. This lesson develops the statistical reasoning behind independent-samples and paired-samples tests, with particular attention to the assumptions that determine which test is appropriate.</p>
    <p>We will use simulated TradeFlow operational data for some demonstrations. These examples are deliberately labelled as simulated: they are teaching examples, not claims about TradeFlow's actual service performance.</p>
  `,
  setup: `
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

deliveries = pd.read_csv("deliveries.csv")

deliveries["dispatch_date"] = pd.to_datetime(
    deliveries["dispatch_date"], errors="coerce"
)

deliveries["delivery_date"] = pd.to_datetime(
    deliveries["delivery_date"], errors="coerce"
)

deliveries["transit_days"] = (
    deliveries["delivery_date"] - deliveries["dispatch_date"]
).dt.days

transit = deliveries.loc[
    deliveries["transit_days"].notna()
    & (deliveries["transit_days"] >= 0),
    "transit_days"
].astype(float).reset_index(drop=True)

rng = np.random.default_rng(5303)
  `,
  steps: [
    {
      type: 'explain',
      title: '1. Why compare two groups?',
      body: `
        <h3>The questions behind two-sample tests</h3>
        <p>Suppose TradeFlow is evaluating two delivery arrangements. Management wants to know whether the average transit time under Arrangement A differs from the average transit time under Arrangement B.</p>
        <p>We are no longer investigating one population mean. We are investigating a <strong>difference between two population means</strong>.</p>

        <p>Let:</p>
        <ul>
          <li><strong>μ₁</strong> represent the population mean for Group 1.</li>
          <li><strong>μ₂</strong> represent the population mean for Group 2.</li>
          <li><strong>μ₁ − μ₂</strong> represent the difference between the two population means.</li>
        </ul>

        <h3>Writing the hypotheses</h3>
        <p>If our question is whether the groups have different average transit times, we write:</p>
        <p><strong>Null hypothesis:</strong> H₀: μ₁ − μ₂ = 0</p>
        <p><strong>Alternative hypothesis:</strong> H₁: μ₁ − μ₂ ≠ 0</p>
        <p>The null hypothesis says that the population means are equal. The alternative says that they differ.</p>

        <p>If management has a specific directional question, the alternative hypothesis can be directional:</p>
        <ul>
          <li>H₁: μ₁ − μ₂ &lt; 0 means Group 1 has a lower population mean.</li>
          <li>H₁: μ₁ − μ₂ &gt; 0 means Group 1 has a higher population mean.</li>
        </ul>

        <h3>Three questions we must answer before choosing a test</h3>
        <ol>
          <li>Are the observations in the two groups independent, or are they paired?</li>
          <li>Are we comparing means, proportions, or some other quantity?</li>
          <li>Are the assumptions of the selected statistical test reasonably satisfied?</li>
        </ol>

        <p>The first question is especially important. Independent groups and paired observations require different statistical procedures.</p>
      `
    },
    {
      type: 'explain',
      title: '2. Independent samples versus paired samples',
      body: `
        <h3>Independent samples</h3>
        <p>Two samples are independent when the observations in one group are not naturally matched to particular observations in the other group.</p>
        <p>Imagine TradeFlow randomly selects 40 deliveries handled by one delivery arrangement and a different 40 deliveries handled by another arrangement. Each delivery belongs to one group. There is no deliberate one-to-one matching between the deliveries.</p>
        <p>These are independent samples, provided the sampling and operational design support that assumption.</p>

        <h3>Paired samples</h3>
        <p>Paired samples occur when each observation in one condition is naturally connected to an observation in the other condition.</p>
        <p>For example, suppose TradeFlow measures the delivery time for 30 routes before an optimisation project and then measures the same 30 routes after the project. Each route has a before measurement and an after measurement.</p>
        <p>The two measurements for each route are related. Treating them as independent would ignore this relationship.</p>

        <h3>Why the distinction matters</h3>
        <p>For independent samples, we compare the two groups using their separate sample means and variability.</p>
        <p>For paired samples, we calculate a difference for every pair and analyse the resulting differences.</p>
        <p>In a paired design, the statistical analysis focuses on:</p>
        <p><strong>dᵢ = Afterᵢ − Beforeᵢ</strong></p>
        <p>We then test whether the population mean of these paired differences is zero.</p>

        <h3>A practical decision rule</h3>
        <ul>
          <li>Different customers, products, deliveries, or independently sampled units: potentially independent samples.</li>
          <li>The same customers, routes, branches, or machines measured twice: paired samples.</li>
          <li>Two measurements deliberately matched by a characteristic: potentially paired samples.</li>
        </ul>
        <p>Do not choose a paired test merely because the sample sizes are equal. Pairing must come from the design of the data collection.</p>
      `
    },
    {
      type: 'check',
      title: 'Check your understanding: identifying the design',
      question: 'TradeFlow records the delivery time of 25 routes before a scheduling change and the delivery time of those exact same 25 routes after the change. Which design is appropriate?',
      options: [
        'Two independent samples because there are two sets of measurements',
        'Paired samples because each route has a before-and-after measurement',
        'A one-sample test because only 25 routes were studied',
        'A chi-square test because the data come from routes'
      ],
      answer: 1,
      why: [
        'The two sets of measurements are not independent: each route appears in both conditions.',
        'Correct. Each route provides a matched pair of observations, so we analyse the within-route differences.',
        'There are two related measurements per route. A one-sample test on the differences may be used, but this is conceptually a paired-samples analysis.',
        'The outcome is delivery time, a numerical variable. The fact that routes are involved does not make this a categorical-data problem.'
      ]
    },
    {
      type: 'explain',
      title: '3. The independent-samples t-test',
      body: `
        <h3>Comparing two population means</h3>
        <p>When we have two independent samples and want to investigate a difference between their population means, a two-sample t-test is often appropriate.</p>
        <p>Let:</p>
        <ul>
          <li>x̄₁ and x̄₂ be the two sample means.</li>
          <li>s₁ and s₂ be the two sample standard deviations.</li>
          <li>n₁ and n₂ be the two sample sizes.</li>
        </ul>

        <p>The observed difference between the sample means is:</p>
        <p><strong>x̄₁ − x̄₂</strong></p>

        <p>The central idea of the test is to compare this observed difference with the amount of sampling variation we would reasonably expect if the population means were equal.</p>

        <h3>Welch's t-test</h3>
        <p>Welch's t-test is a widely recommended method for comparing two independent population means. It does not require us to assume that the two population variances are equal.</p>
        <p>Its test statistic is:</p>
        <p><strong>t = (x̄₁ − x̄₂) / SE</strong></p>
        <p>where the estimated standard error is:</p>
        <p><strong>SE = √(s₁²/n₁ + s₂²/n₂)</strong></p>

        <p>The denominator measures the estimated sampling uncertainty in the difference between the sample means.</p>
        <p>If the observed difference is large relative to its standard error, the absolute t-statistic becomes large. That provides stronger evidence against the null hypothesis.</p>

        <h3>Why Welch's test is useful</h3>
        <p>The older pooled two-sample t-test assumes equal population variances. Welch's test allows the variances to differ and adjusts its degrees of freedom accordingly.</p>
        <p>Unless there is a sound reason to assume equal variances, Welch's test is generally a sensible default for independent-group mean comparisons.</p>

        <h3>Important assumptions</h3>
        <ul>
          <li>The outcome is numerical.</li>
          <li>The two groups are independent.</li>
          <li>Observations within each group are independent, subject to the sampling design.</li>
          <li>The sample distributions are sufficiently well behaved for t-based inference. Severe skewness or extreme outliers can be problematic, particularly with small samples.</li>
        </ul>
        <p>The t-test does not require the two groups to have identical distributions or equal variances. It is the sampling behaviour of the mean difference that matters.</p>
      `
    },
    {
      type: 'try',
      title: '4. Run a Welch two-sample t-test',
      body: `
        <p>We will simulate two independent groups of delivery times. Group A represents a standard delivery arrangement, while Group B represents a priority arrangement.</p>
        <p>The numbers are simulated for teaching purposes. They are not extracted from TradeFlow's actual delivery records.</p>
        <p>First, inspect the two samples and calculate their descriptive statistics. Then run Welch's t-test.</p>
      `,
      starter: `
# Simulated independent samples of delivery times
rng = np.random.default_rng(5303)

standard = rng.normal(loc=5.8, scale=1.7, size=45)
priority = rng.normal(loc=4.9, scale=1.5, size=42)

# Calculate descriptive statistics
print("Standard mean:", standard.mean())
print("Priority mean:", priority.mean())

print("Standard standard deviation:", standard.std(ddof=1))
print("Priority standard deviation:", priority.std(ddof=1))

print("Observed mean difference:", standard.mean() - priority.mean())

# Welch's independent-samples t-test
result = stats.ttest_ind(
    standard,
    priority,
    equal_var=False,
    alternative="two-sided"
)

print("t-statistic:", result.statistic)
print("p-value:", result.pvalue)
      `,
      hints: [
        'The sample mean is calculated with .mean().',
        'Use .std(ddof=1) for the sample standard deviation.',
        'The equal_var=False argument tells SciPy to use Welch’s version of the independent-samples t-test.',
        'A two-sided alternative investigates whether the means differ in either direction.'
      ],
      solution: `
rng = np.random.default_rng(5303)

standard = rng.normal(loc=5.8, scale=1.7, size=45)
priority = rng.normal(loc=4.9, scale=1.5, size=42)

print("Standard mean:", standard.mean())
print("Priority mean:", priority.mean())

print("Standard standard deviation:", standard.std(ddof=1))
print("Priority standard deviation:", priority.std(ddof=1))

mean_difference = standard.mean() - priority.mean()
print("Observed mean difference:", mean_difference)

result = stats.ttest_ind(
    standard,
    priority,
    equal_var=False,
    alternative="two-sided"
)

print("t-statistic:", result.statistic)
print("p-value:", result.pvalue)
      `
    },
    {
      type: 'explain',
      title: '5. Interpreting the test correctly',
      body: `
        <h3>The p-value is evidence, not a verdict</h3>
        <p>Suppose we use a significance level of α = 0.05.</p>
        <ul>
          <li>If p ≤ 0.05, we reject the null hypothesis at the 5% significance level.</li>
          <li>If p &gt; 0.05, we fail to reject the null hypothesis at the 5% significance level.</li>
        </ul>

        <p>Rejecting the null hypothesis means that the observed data provide evidence against equal population means under the assumptions of the test.</p>
        <p>Failing to reject the null hypothesis does not prove that the population means are equal. It means the evidence is insufficient to reject equality at the chosen significance level.</p>

        <h3>Statistical significance versus operational importance</h3>
        <p>Imagine a test detects an average difference of 0.08 days between two delivery arrangements. With a very large sample, that difference might produce a small p-value.</p>
        <p>However, a statistically detectable difference may be too small to justify the cost of changing the delivery arrangement.</p>
        <p>Conversely, a potentially important difference may fail to reach statistical significance if the sample is too small or the data are highly variable.</p>

        <h3>Always examine the size of the difference</h3>
        <p>Report the estimated difference in the original measurement units, such as days, alongside the p-value.</p>
        <p>A confidence interval for the difference is also valuable because it shows the range of population differences reasonably compatible with the data and model.</p>

        <h3>Practical interpretation</h3>
        <p>A strong operational report should answer three separate questions:</p>
        <ol>
          <li>What difference did the sample show?</li>
          <li>How uncertain is the estimated difference?</li>
          <li>Is the size of the difference meaningful for the business decision?</li>
        </ol>
      `
    },
    {
      type: 'exercise',
      title: '6. Independent-group analysis',
      body: `
        <p>TradeFlow is evaluating two independently sampled delivery arrangements. Use the simulated observations below to investigate whether their population mean transit times differ.</p>
        <p>Complete the analysis by calculating the group means, estimating the mean difference, running Welch's t-test, and interpreting the result at α = 0.05.</p>
        <p>Use a two-sided alternative. Do not conclude that the groups are equal merely because a result is not statistically significant.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

rng = np.random.default_rng(5310)

arrangement_a = rng.normal(loc=6.0, scale=1.8, size=55)
arrangement_b = rng.normal(loc=5.4, scale=1.6, size=50)

# 1. Calculate both sample means

# 2. Calculate the observed difference in means

# 3. Run Welch's two-sample t-test

# 4. Print the t-statistic and p-value

# 5. Make a decision using alpha = 0.05

# 6. Write a conclusion in the context of delivery times
      `,
      hints: [
        'Use .mean() to calculate each sample mean.',
        'Subtract the second group mean from the first group mean. State the order clearly.',
        'Use stats.ttest_ind(arrangement_a, arrangement_b, equal_var=False).',
        'Compare the returned p-value with 0.05.',
        'Your conclusion should refer to evidence about population mean transit times, not just the sample values.'
      ],
      solution: `
import numpy as np
from scipy import stats

rng = np.random.default_rng(5310)

arrangement_a = rng.normal(loc=6.0, scale=1.8, size=55)
arrangement_b = rng.normal(loc=5.4, scale=1.6, size=50)

mean_a = arrangement_a.mean()
mean_b = arrangement_b.mean()

difference = mean_a - mean_b

result = stats.ttest_ind(
    arrangement_a,
    arrangement_b,
    equal_var=False,
    alternative="two-sided"
)

print("Mean for arrangement A:", mean_a)
print("Mean for arrangement B:", mean_b)
print("Mean difference (A - B):", difference)
print("t-statistic:", result.statistic)
print("p-value:", result.pvalue)

alpha = 0.05

if result.pvalue <= alpha:
    print("Decision: Reject the null hypothesis.")
    print("There is evidence of a difference in population mean transit times.")
else:
    print("Decision: Fail to reject the null hypothesis.")
    print("The evidence is insufficient to establish a difference in population mean transit times.")
      `,
      ordered: true
    },
    {
      type: 'check',
      title: 'Check your understanding: Welch’s test',
      question: 'Why is equal_var=False used in scipy.stats.ttest_ind() when performing Welch’s t-test?',
      options: [
        'It tells Python to ignore the sample sizes',
        'It removes the need for independent observations',
        'It avoids assuming that the two population variances are equal',
        'It automatically converts a two-sided test into a one-sided test'
      ],
      answer: 2,
      why: [
        'Sample sizes remain part of the calculation of the standard error and degrees of freedom.',
        'Independence remains an important assumption for the independent-samples test.',
        'Correct. Welch’s method accommodates unequal population variances and adjusts the degrees of freedom.',
        'The alternative argument controls the direction of the test, not equal_var.'
      ]
    },
    {
      type: 'explain',
      title: '7. The paired-samples t-test',
      body: `
        <h3>Why analyse differences within pairs?</h3>
        <p>Suppose TradeFlow measures the transit time of the same 30 routes before and after a scheduling improvement.</p>
        <p>Routes naturally differ. Some are short, some are long, and some experience more congestion. Comparing the before and after averages without accounting for the matching can discard useful information about each route.</p>
        <p>Instead, calculate one difference per route:</p>
        <p><strong>dᵢ = Afterᵢ − Beforeᵢ</strong></p>
        <p>Then test whether the population mean difference is zero.</p>

        <h3>Hypotheses for a paired test</h3>
        <p>For a two-sided test:</p>
        <ul>
          <li>H₀: μd = 0</li>
          <li>H₁: μd ≠ 0</li>
        </ul>
        <p>Here, μd is the population mean of the paired differences.</p>

        <h3>The test statistic</h3>
        <p>The paired t-test is mathematically a one-sample t-test applied to the differences:</p>
        <p><strong>t = d̄ / (sᵈ / √n)</strong></p>
        <p>where d̄ is the sample mean difference, sᵈ is the sample standard deviation of the differences, and n is the number of pairs.</p>
        <p>The degrees of freedom are n − 1.</p>

        <h3>Assumptions</h3>
        <ul>
          <li>The observations are correctly matched.</li>
          <li>Different pairs are independent of one another.</li>
          <li>The outcome differences are numerical.</li>
          <li>The distribution of the differences is sufficiently well behaved for t-based inference, particularly when the number of pairs is small.</li>
        </ul>
        <p>Notice that the normality consideration applies to the distribution of the differences, not necessarily to the before and after measurements separately.</p>
      `
    },
    {
      type: 'try',
      title: '8. Run a paired-samples t-test',
      body: `
        <p>We will simulate transit times for the same routes before and after a scheduling improvement.</p>
        <p>Each position in the two arrays represents the same route. The paired structure is therefore deliberate.</p>
        <p>We will define the difference as after minus before. A negative mean difference indicates that transit times decreased after the change.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

rng = np.random.default_rng(5320)

before = rng.normal(loc=6.2, scale=1.3, size=35)
improvement = rng.normal(loc=0.8, scale=0.5, size=35)
after = before - improvement

# Calculate paired differences
differences = after - before

print("Mean before:", before.mean())
print("Mean after:", after.mean())
print("Mean paired difference:", differences.mean())

# Paired-samples t-test
result = stats.ttest_rel(
    after,
    before,
    alternative="less"
)

print("t-statistic:", result.statistic)
print("p-value:", result.pvalue)
      `,
      hints: [
        'The two arrays must preserve the same route order.',
        'Calculate after - before to make a reduction negative.',
        'Use stats.ttest_rel(after, before).',
        'The alternative="less" argument tests whether the population mean after measurement is lower than the before measurement.'
      ],
      solution: `
import numpy as np
from scipy import stats

rng = np.random.default_rng(5320)

before = rng.normal(loc=6.2, scale=1.3, size=35)
improvement = rng.normal(loc=0.8, scale=0.5, size=35)
after = before - improvement

differences = after - before

print("Mean before:", before.mean())
print("Mean after:", after.mean())
print("Mean paired difference:", differences.mean())

result = stats.ttest_rel(
    after,
    before,
    alternative="less"
)

print("t-statistic:", result.statistic)
print("p-value:", result.pvalue)
      `
    },
    {
      type: 'exercise',
      title: '9. Evaluate a route optimisation',
      body: `
        <p>TradeFlow has introduced a route optimisation process and wants to investigate whether it reduced average transit time across a group of routes.</p>
        <p>The same routes were measured before and after the intervention. The data below are simulated.</p>
        <p>Perform a paired-samples t-test. Define the difference as after minus before, and use a one-sided alternative to investigate a reduction.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

rng = np.random.default_rng(5330)

before = rng.normal(loc=7.0, scale=1.5, size=40)
after = before - rng.normal(loc=0.6, scale=0.7, size=40)

# 1. Calculate the paired differences: after - before

# 2. Calculate the mean difference

# 3. Calculate the standard deviation of the differences

# 4. Run a paired t-test for a reduction

# 5. Interpret the p-value using alpha = 0.05
      `,
      hints: [
        'The differences are calculated by subtracting before from after.',
        'Use differences.mean() and differences.std(ddof=1).',
        'Use stats.ttest_rel(after, before, alternative="less").',
        'A negative mean difference represents a reduction.',
        'Explain what the result says about the population mean change, not just the routes in the sample.'
      ],
      solution: `
import numpy as np
from scipy import stats

rng = np.random.default_rng(5330)

before = rng.normal(loc=7.0, scale=1.5, size=40)
after = before - rng.normal(loc=0.6, scale=0.7, size=40)

differences = after - before

print("Mean difference:", differences.mean())
print("Standard deviation of differences:", differences.std(ddof=1))

result = stats.ttest_rel(
    after,
    before,
    alternative="less"
)

print("t-statistic:", result.statistic)
print("p-value:", result.pvalue)

alpha = 0.05

if result.pvalue <= alpha:
    print("Decision: Reject the null hypothesis.")
    print("There is evidence that the intervention reduced population mean transit time.")
else:
    print("Decision: Fail to reject the null hypothesis.")
    print("There is insufficient evidence to establish a reduction in population mean transit time.")
      `,
      ordered: true
    },
    {
      type: 'check',
      title: 'Check your understanding: choosing the correct test',
      question: 'A researcher measures the same 50 customers’ delivery satisfaction scores before and after a service improvement. Which test is most appropriate if the scores are treated as numerical measurements and the differences satisfy the test assumptions?',
      options: [
        'Welch’s independent-samples t-test',
        'Paired-samples t-test',
        'Chi-square goodness-of-fit test',
        'Independent two-proportion test'
      ],
      answer: 1,
      why: [
        'Welch’s test is for independent groups, whereas these observations are matched.',
        'Correct. Each customer supplies a before-and-after pair, so the analysis should use the within-customer differences.',
        'A chi-square goodness-of-fit test is designed for categorical frequency counts.',
        'This is not a comparison of two independent proportions.'
      ]
    },
    {
      type: 'explain',
      title: '10. Confidence intervals and effect size',
      body: `
        <h3>A p-value alone is not enough</h3>
        <p>Two studies can produce the same p-value while estimating very different differences. A useful analysis therefore reports the estimated difference and its uncertainty.</p>
        <p>For independent groups, the estimated difference might be:</p>
        <p><strong>x̄₁ − x̄₂</strong></p>
        <p>For paired groups, it is:</p>
        <p><strong>d̄</strong></p>

        <h3>Confidence intervals for Welch's test</h3>
        <p>SciPy's ttest_ind result provides the test statistic and p-value. In current SciPy versions, the result also provides a confidence_interval() method.</p>
        <p>For example:</p>
        <pre><code>result = stats.ttest_ind(
    standard,
    priority,
    equal_var=False
)

interval = result.confidence_interval(confidence_level=0.95)

print(interval.low)
print(interval.high)</code></pre>
        <p>The interval estimates a range of plausible values for the population mean difference, using the same group order supplied to the test.</p>

        <h3>Confidence intervals for paired tests</h3>
        <p>For paired data, the interval is calculated from the sample of within-pair differences. It estimates the population mean paired difference.</p>
        <pre><code>result = stats.ttest_rel(after, before)

interval = result.confidence_interval(confidence_level=0.95)

print(interval.low)
print(interval.high)</code></pre>

        <h3>Interpreting the interval</h3>
        <p>If a two-sided 95% confidence interval for a mean difference excludes zero, it corresponds to rejecting the equal-means null hypothesis at the 5% level under the same test assumptions.</p>
        <p>If the interval includes zero, the data are compatible with no difference at that confidence level. This does not prove that the true difference is exactly zero.</p>
        <p>Also examine the size of the interval. A very wide interval indicates substantial uncertainty, even if the point estimate looks interesting.</p>

        <h3>Effect size</h3>
        <p>An effect size expresses the magnitude of a difference. The raw mean difference is often the most directly useful effect size for business decisions because it remains in the original units.</p>
        <p>For example, a reduction of 0.7 days is easier for an operations manager to interpret than a standardised effect size alone.</p>
        <p>Standardised measures such as Cohen's d can be useful when comparing effects across outcomes measured on different scales, but the choice of standardisation must be appropriate to the design.</p>
      `
    }
  ]
});


LESSONS.push({
  id: 'st-5-4',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'scipy'],
  loopGuard: true,
  files: ['deliveries'],
  preloaded: ['deliveries', 'transit', 'rng'],
  title: '5.4 Hypothesis tests for categorical data',
  intro: `
    <h2>When the outcome is a category rather than a measurement</h2>
    <p>Not every business question concerns averages. TradeFlow may want to know whether delivery outcomes are distributed as expected, whether delay rates differ across service categories, or whether delivery status is associated with a particular operational factor.</p>
    <p>These questions involve categorical variables and frequency counts. The statistical tools are therefore different from the t-tests used to compare numerical means.</p>
    <p>This lesson develops three important procedures: the chi-square goodness-of-fit test, the chi-square test of independence, and Fisher's exact test.</p>
  `,
  setup: `
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

deliveries = pd.read_csv("deliveries.csv")

deliveries["dispatch_date"] = pd.to_datetime(
    deliveries["dispatch_date"], errors="coerce"
)

deliveries["delivery_date"] = pd.to_datetime(
    deliveries["delivery_date"], errors="coerce"
)

deliveries["transit_days"] = (
    deliveries["delivery_date"] - deliveries["dispatch_date"]
).dt.days

transit = deliveries.loc[
    deliveries["transit_days"].notna()
    & (deliveries["transit_days"] >= 0),
    "transit_days"
].astype(float).reset_index(drop=True)

rng = np.random.default_rng(5404)
  `,
  steps: [
    {
      type: 'explain',
      title: '1. Numerical variables and categorical variables',
      body: `
        <h3>Two different kinds of questions</h3>
        <p>Consider two possible TradeFlow questions:</p>
        <ul>
          <li>What is the average delivery time? This concerns a numerical variable.</li>
          <li>What proportion of deliveries are completed, delayed, or cancelled? This concerns categories.</li>
        </ul>
        <p>A numerical variable can be summarised using means, medians, variances, and other numerical measures. A categorical variable is usually summarised using counts or proportions in each category.</p>

        <h3>Frequency tables</h3>
        <p>A frequency table records how many observations fall into each category.</p>
        <p>Imagine 200 deliveries are classified into three mutually exclusive outcome categories:</p>
        <ul>
          <li>Completed on time: 120</li>
          <li>Completed late: 60</li>
          <li>Cancelled: 20</li>
        </ul>
        <p>The counts add up to 200. The corresponding proportions are 60%, 30%, and 10%.</p>

        <h3>Why use a chi-square test?</h3>
        <p>A chi-square test compares observed category counts with counts that would be expected under a specified null hypothesis.</p>
        <p>The general idea is straightforward:</p>
        <ol>
          <li>State what pattern the null hypothesis predicts.</li>
          <li>Calculate the expected counts under that hypothesis.</li>
          <li>Compare observed counts with expected counts.</li>
          <li>Assess whether the differences are larger than would reasonably be expected from random variation alone.</li>
        </ol>
        <p>These tests analyse frequencies, not averages. Applying a t-test directly to category labels such as "late" and "on time" is not an appropriate substitute.</p>
      `
    },
    {
      type: 'explain',
      title: '2. The chi-square goodness-of-fit test',
      body: `
        <h3>Does one categorical variable follow a specified distribution?</h3>
        <p>The chi-square goodness-of-fit test investigates whether the observed distribution of one categorical variable is consistent with a specified probability distribution.</p>
        <p>Suppose TradeFlow has a planning model that predicts the following distribution of delivery outcomes:</p>
        <ul>
          <li>On time: 60%</li>
          <li>Late: 30%</li>
          <li>Cancelled: 10%</li>
        </ul>
        <p>We collect 200 observations and count the outcomes. We can test whether the observed distribution is consistent with the planning model.</p>

        <h3>Hypotheses</h3>
        <p><strong>H₀:</strong> The population category proportions follow the specified distribution.</p>
        <p><strong>H₁:</strong> The population category proportions do not follow the specified distribution.</p>

        <h3>Expected counts</h3>
        <p>The expected count for a category is:</p>
        <p><strong>Expected count = Total sample size × Expected proportion</strong></p>
        <p>With 200 deliveries, the expected counts are:</p>
        <ul>
          <li>On time: 200 × 0.60 = 120</li>
          <li>Late: 200 × 0.30 = 60</li>
          <li>Cancelled: 200 × 0.10 = 20</li>
        </ul>

        <h3>The chi-square statistic</h3>
        <p><strong>χ² = Σ (Observed − Expected)² / Expected</strong></p>
        <p>The calculation is performed for every category, and the contributions are added together.</p>
        <p>A category with a large difference between observed and expected counts contributes more to the statistic. The squared difference ensures that positive and negative deviations do not cancel each other out.</p>

        <h3>Degrees of freedom</h3>
        <p>For a goodness-of-fit test with k categories and fully specified expected probabilities, the degrees of freedom are:</p>
        <p><strong>df = k − 1</strong></p>
        <p>If parameters are estimated from the same data, the degrees of freedom may need further adjustment. The simple formula should not be applied blindly to every fitted distribution.</p>

        <h3>Conditions</h3>
        <ul>
          <li>Observations should be independent.</li>
          <li>Categories should be mutually exclusive and collectively exhaustive for the analysis.</li>
          <li>Expected counts should be sufficiently large for the chi-square approximation to be reliable. A common practical guideline is that expected counts should generally be at least 5.</li>
        </ul>
      `
    },
    {
      type: 'try',
      title: '3. Perform a goodness-of-fit test',
      body: `
        <p>We will test whether simulated delivery outcome counts are consistent with a planning distribution of 60% on time, 30% late, and 10% cancelled.</p>
        <p>Notice that we supply observed counts and expected counts to SciPy. The expected counts must be calculated from the hypothesised proportions and the observed total sample size.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

observed = np.array([108, 72, 20])

expected_proportions = np.array([0.60, 0.30, 0.10])

total = observed.sum()
expected = total * expected_proportions

print("Observed counts:", observed)
print("Expected counts:", expected)

result = stats.chisquare(
    f_obs=observed,
    f_exp=expected
)

print("Chi-square statistic:", result.statistic)
print("p-value:", result.pvalue)
      `,
      hints: [
        'The observed counts should be stored in a numerical array.',
        'Multiply each expected proportion by the total number of observations.',
        'Use stats.chisquare(f_obs=observed, f_exp=expected).',
        'A small p-value indicates that the observed distribution is difficult to reconcile with the specified proportions under the test assumptions.'
      ],
      solution: `
import numpy as np
from scipy import stats

observed = np.array([108, 72, 20])
expected_proportions = np.array([0.60, 0.30, 0.10])

total = observed.sum()
expected = total * expected_proportions

print("Observed counts:", observed)
print("Expected counts:", expected)

result = stats.chisquare(
    f_obs=observed,
    f_exp=expected
)

print("Chi-square statistic:", result.statistic)
print("p-value:", result.pvalue)
      `
    },
    {
      type: 'check',
      title: 'Check your understanding: expected counts',
      question: 'A company expects 40% of its deliveries to be completed in the morning. If 250 deliveries are observed, what is the expected morning count under this model?',
      options: [
        '40',
        '100',
        '150',
        '210'
      ],
      answer: 1,
      why: [
        '40 is the percentage value, not the expected count.',
        'Correct. 250 × 0.40 = 100 expected morning deliveries.',
        '150 is the expected count for the remaining 60%, not the morning category.',
        'This value does not follow from the specified expected proportion.'
      ]
    },
    {
      type: 'explain',
      title: '4. The chi-square test of independence',
      body: `
        <h3>Are two categorical variables associated?</h3>
        <p>The chi-square test of independence investigates whether two categorical variables are associated in a population.</p>
        <p>Imagine TradeFlow wants to investigate whether delivery outcome is associated with service type.</p>
        <p>Each delivery is classified according to:</p>
        <ul>
          <li>Service type: Standard or Priority.</li>
          <li>Delivery outcome: On time or Late.</li>
        </ul>

        <h3>A contingency table</h3>
        <p>A contingency table records the number of observations in every combination of categories.</p>
        <p>For example, the following simulated counts could be observed:</p>
        <table>
          <thead>
            <tr><th></th><th>On time</th><th>Late</th><th>Total</th></tr>
          </thead>
          <tbody>
            <tr><td>Standard</td><td>70</td><td>30</td><td>100</td></tr>
            <tr><td>Priority</td><td>90</td><td>10</td><td>100</td></tr>
            <tr><td>Total</td><td>160</td><td>40</td><td>200</td></tr>
          </tbody>
        </table>

        <h3>Hypotheses</h3>
        <p><strong>H₀:</strong> The two categorical variables are independent in the population.</p>
        <p><strong>H₁:</strong> The two categorical variables are associated in the population.</p>
        <p>Independence means that knowing the service type does not provide information about the delivery outcome probabilities.</p>

        <h3>Calculating expected counts</h3>
        <p>Under independence, the expected count in a cell is:</p>
        <p><strong>Expected count = (Row total × Column total) / Grand total</strong></p>
        <p>For the Standard and On-time cell:</p>
        <p><strong>Expected = (100 × 160) / 200 = 80</strong></p>
        <p>We repeat this calculation for every cell in the table.</p>

        <h3>The chi-square statistic</h3>
        <p>Once the expected counts are calculated, we use:</p>
        <p><strong>χ² = Σ (Observed − Expected)² / Expected</strong></p>
        <p>For a contingency table with r rows and c columns, the degrees of freedom are:</p>
        <p><strong>df = (r − 1)(c − 1)</strong></p>

        <h3>What the result can and cannot tell us</h3>
        <p>A statistically significant result provides evidence of an association between the variables. It does not prove that one variable causes the other.</p>
        <p>For example, a relationship between service type and delivery outcome could be influenced by customer location, dispatch time, route difficulty, or other factors.</p>
        <p>We must also examine the actual proportions and the study design before making operational recommendations.</p>
      `
    },
    {
      type: 'try',
      title: '5. Test for an association',
      body: `
        <p>Use the simulated contingency table below to investigate whether service type and delivery outcome are statistically associated.</p>
        <p>We will use scipy.stats.chi2_contingency(). The function calculates the expected counts and returns the chi-square statistic, p-value, degrees of freedom, and expected frequency table.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

observed_table = np.array([
    [70, 30],
    [90, 10]
])

result = stats.chi2_contingency(
    observed_table,
    correction=False
)

print("Chi-square statistic:", result.statistic)
print("p-value:", result.pvalue)
print("Degrees of freedom:", result.dof)

print("Expected frequencies:")
print(result.expected_freq)
      `,
      hints: [
        'Rows represent service types and columns represent delivery outcomes.',
        'Pass the observed frequency table to stats.chi2_contingency().',
        'The correction=False argument disables Yates’ continuity correction for this demonstration.',
        'Inspect expected_freq to check whether the expected-count condition is satisfied.'
      ],
      solution: `
import numpy as np
from scipy import stats

observed_table = np.array([
    [70, 30],
    [90, 10]
])

result = stats.chi2_contingency(
    observed_table,
    correction=False
)

print("Chi-square statistic:", result.statistic)
print("p-value:", result.pvalue)
print("Degrees of freedom:", result.dof)

print("Expected frequencies:")
print(result.expected_freq)
      `
    },
    {
      type: 'explain',
      title: '6. Understanding expected frequencies and limitations',
      body: `
        <h3>Why expected frequencies matter</h3>
        <p>The chi-square test uses an approximation to the sampling distribution of the test statistic. That approximation becomes less reliable when expected cell counts are too small.</p>
        <p>A commonly used practical guideline is that expected counts should generally be at least 5. This is a guideline, not a universal mathematical guarantee.</p>
        <p>When expected counts are small, the analyst should consider an exact method or another appropriate approach rather than relying automatically on the chi-square approximation.</p>

        <h3>Independence is about the observations</h3>
        <p>The chi-square test of independence assumes that each observation contributes to one cell of the contingency table and that observations are independent.</p>
        <p>If the same customer appears repeatedly, or if many deliveries are clustered within a small number of routes or branches, the observations may not be independent.</p>
        <p>Simply counting more rows does not solve a dependence problem. The sampling design must be considered.</p>

        <h3>Association is not causation</h3>
        <p>A significant association between service type and delivery outcome does not establish that service type caused the difference.</p>
        <p>Customers choosing priority service may live in different locations, have different delivery requirements, or be served by different operational teams. These factors may contribute to the observed association.</p>

        <h3>Measure the size and direction of the relationship</h3>
        <p>The chi-square statistic and p-value do not fully describe the relationship.</p>
        <p>For a two-by-two table, compare the proportions in each group. For larger tables, examine row or column percentages and consider an appropriate effect-size measure such as Cramér's V.</p>
        <p>A statistically significant relationship can still be weak in practical terms. A non-significant result can also reflect insufficient sample size rather than the complete absence of an association.</p>
      `
    },
    {
      type: 'explain',
      title: '7. Fisher’s exact test',
      body: `
        <h3>What if the sample is small?</h3>
        <p>For a two-by-two contingency table with small expected counts, Fisher's exact test is an important alternative to the chi-square approximation.</p>
        <p>Consider a small pilot study comparing two service arrangements. The observed counts might be:</p>
        <table>
          <thead>
            <tr><th></th><th>On time</th><th>Late</th></tr>
          </thead>
          <tbody>
            <tr><td>Standard</td><td>8</td><td>2</td></tr>
            <tr><td>Priority</td><td>9</td><td>1</td></tr>
          </tbody>
        </table>
        <p>With a small table, the expected frequencies may be too low for the usual chi-square approximation to be dependable.</p>

        <h3>How Fisher's exact test works</h3>
        <p>Fisher's exact test calculates probabilities based on the observed table under the null hypothesis of no association, conditional on the table's marginal totals.</p>
        <p>Unlike the ordinary chi-square test, it does not rely on the same large-sample approximation.</p>

        <h3>Using SciPy</h3>
        <pre><code>table = np.array([
    [8, 2],
    [9, 1]
])

result = stats.fisher_exact(
    table,
    alternative="two-sided"
)

print(result.statistic)
print(result.pvalue)</code></pre>

        <p>For a two-by-two table, SciPy returns an odds ratio as the statistic and the exact-test p-value.</p>

        <h3>Understanding the odds ratio</h3>
        <p>The odds ratio compares the odds of an outcome in one group with the odds in the other group.</p>
        <p>An odds ratio of 1 indicates equal odds. Values above 1 indicate higher odds for the first row relative to the second row under the table's arrangement; values below 1 indicate lower odds.</p>
        <p>Always inspect the arrangement of rows and columns before interpreting the direction of an odds ratio.</p>

        <h3>Important limitation</h3>
        <p>Fisher's exact test is especially familiar for two-by-two tables. Do not assume that every categorical problem can be handled by passing an arbitrary table to the same function. Larger tables may require other exact or simulation-based procedures.</p>
      `
    },
    {
      type: 'try',
      title: '8. Run Fisher’s exact test',
      body: `
        <p>Use Fisher's exact test on a small simulated two-by-two table. Interpret the p-value as evidence about association and the odds ratio as a measure of the direction and magnitude of the relationship.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

observed_table = np.array([
    [8, 2],
    [9, 1]
])

result = stats.fisher_exact(
    observed_table,
    alternative="two-sided"
)

print("Odds ratio:", result.statistic)
print("Exact p-value:", result.pvalue)
      `,
      hints: [
        'The table must contain non-negative frequency counts.',
        'Use stats.fisher_exact() for this two-by-two table.',
        'The default two-sided question checks for an association in either direction.',
        'Do not interpret the odds ratio without considering which group is in the first row and which outcome is in the first column.'
      ],
      solution: `
import numpy as np
from scipy import stats

observed_table = np.array([
    [8, 2],
    [9, 1]
])

result = stats.fisher_exact(
    observed_table,
    alternative="two-sided"
)

print("Odds ratio:", result.statistic)
print("Exact p-value:", result.pvalue)
      `
    },
    {
      type: 'check',
      title: 'Check your understanding: choosing Fisher’s exact test',
      question: 'A researcher has a two-by-two contingency table with very small expected cell counts. Which method is particularly suitable for testing association in this situation?',
      options: [
        'Welch’s t-test',
        'Paired-samples t-test',
        'Fisher’s exact test',
        'A one-sample z-test for a mean'
      ],
      answer: 2,
      why: [
        'Welch’s t-test compares independent numerical means.',
        'A paired t-test analyses numerical differences within matched pairs.',
        'Correct. Fisher’s exact test is useful for two-by-two tables when small expected counts make the chi-square approximation questionable.',
        'A one-sample z-test for a mean does not test association between categorical variables.'
      ]
    },
    {
      type: 'exercise',
      title: '9. Investigate a categorical association',
      body: `
        <p>TradeFlow conducts a simulated pilot study to investigate whether delivery outcome is associated with service type.</p>
        <p>Use the supplied two-by-two table to:</p>
        <ol>
          <li>Calculate the row totals and column totals.</li>
          <li>Run the chi-square test of independence.</li>
          <li>Inspect the expected frequencies.</li>
          <li>Run Fisher's exact test.</li>
          <li>Compare the two p-values and explain why the choice of method matters.</li>
        </ol>
        <p>Do not treat the two tests as interchangeable in every situation. Discuss the expected counts and the assumptions behind each method.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

observed_table = np.array([
    [12, 8],
    [17, 3]
])

# 1. Calculate row totals and column totals

# 2. Run the chi-square test

# 3. Print its expected frequencies

# 4. Run Fisher's exact test

# 5. Compare the p-values and explain which result
#    you would rely on for this small table
      `,
      hints: [
        'Use .sum(axis=1) for row totals and .sum(axis=0) for column totals.',
        'Use stats.chi2_contingency(observed_table, correction=False).',
        'The expected frequency table is available as result.expected_freq.',
        'Use stats.fisher_exact(observed_table, alternative="two-sided").',
        'The small expected counts are important when deciding whether the chi-square approximation is reliable.'
      ],
      solution: `
import numpy as np
from scipy import stats

observed_table = np.array([
    [12, 8],
    [17, 3]
])

row_totals = observed_table.sum(axis=1)
column_totals = observed_table.sum(axis=0)

print("Row totals:", row_totals)
print("Column totals:", column_totals)

chi_result = stats.chi2_contingency(
    observed_table,
    correction=False
)

print("Chi-square statistic:", chi_result.statistic)
print("Chi-square p-value:", chi_result.pvalue)
print("Expected frequencies:")
print(chi_result.expected_freq)

fisher_result = stats.fisher_exact(
    observed_table,
    alternative="two-sided"
)

print("Fisher odds ratio:", fisher_result.statistic)
print("Fisher exact p-value:", fisher_result.pvalue)

print("Compare the expected counts with the usual practical guideline.")
print("For this small table, Fisher's exact test is particularly useful.")
      `,
      ordered: true
    },
    {
      type: 'explain',
      title: '10. Selecting the right categorical test',
      body: `
        <h3>Three tests, three different questions</h3>
        <p>These procedures all involve categorical data, but they do not answer exactly the same question.</p>

        <table>
          <thead>
            <tr><th>Test</th><th>Question</th><th>Typical use</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Chi-square goodness-of-fit</td>
              <td>Does one categorical variable follow a specified distribution?</td>
              <td>Comparing observed delivery outcomes with expected proportions.</td>
            </tr>
            <tr>
              <td>Chi-square independence</td>
              <td>Are two categorical variables associated?</td>
              <td>Investigating whether service type and delivery outcome are related.</td>
            </tr>
            <tr>
              <td>Fisher's exact</td>
              <td>Is there evidence of association in a small two-by-two table?</td>
              <td>Analysing a small pilot study with low expected counts.</td>
            </tr>
          </tbody>
        </table>

        <h3>A practical decision process</h3>
        <ol>
          <li>Identify whether your data are categorical counts.</li>
          <li>Determine whether you have one categorical variable or two.</li>
          <li>If you have one variable and a specified expected distribution, consider goodness-of-fit.</li>
          <li>If you have two variables and want to test association, consider a chi-square test of independence.</li>
          <li>For a small two-by-two table with low expected counts, consider Fisher's exact test.</li>
          <li>Check whether the observations are independent and whether the sampling design supports the intended inference.</li>
        </ol>

        <h3>Do not confuse association with operational impact</h3>
        <p>Suppose a test indicates an association between service type and delivery outcome. That does not automatically mean changing service type will improve delivery performance.</p>
        <p>The association may reflect other differences between the groups. A controlled experiment or a more carefully designed observational analysis may be needed to investigate causality.</p>

        <h3>Reporting results professionally</h3>
        <p>A useful report identifies the variables, the method, the test statistic, the degrees of freedom where applicable, the p-value, and the observed pattern in the data.</p>
        <p>For a two-by-two table, report the group proportions and an appropriate effect-size measure, such as an odds ratio, where relevant.</p>
        <p>Finally, explain what the evidence means for the business question without overstating what the study can establish.</p>
      `
    },
    {
      type: 'exercise',
      title: '11. Final categorical-data investigation',
      body: `
        <p>You are analysing a simulated TradeFlow quality-control study. The operations team wants to know whether the distribution of recorded delivery outcomes is consistent with its planning model.</p>
        <p>The model specifies 65% on time, 25% late, and 10% cancelled. The observed sample contains 300 deliveries.</p>
        <p>Complete a goodness-of-fit analysis, interpret the p-value at the 5% significance level, and explain what the result does and does not establish.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

observed = np.array([175, 95, 30])

expected_proportions = np.array([0.65, 0.25, 0.10])

# 1. Calculate the total number of observations

# 2. Calculate expected counts

# 3. Run the chi-square goodness-of-fit test

# 4. Print the statistic, degrees of freedom, and p-value

# 5. Make a decision at alpha = 0.05

# 6. Write a careful business interpretation
      `,
      hints: [
        'The total is the sum of all observed category counts.',
        'Expected counts equal the total multiplied by the expected proportions.',
        'Use stats.chisquare(observed, expected).',
        'With three categories and fully specified expected proportions, the degrees of freedom are two.',
        'A rejection means the observed distribution is inconsistent with the specified model; it does not identify the cause of the difference.'
      ],
      solution: `
import numpy as np
from scipy import stats

observed = np.array([175, 95, 30])
expected_proportions = np.array([0.65, 0.25, 0.10])

total = observed.sum()
expected = total * expected_proportions

print("Total observations:", total)
print("Observed counts:", observed)
print("Expected counts:", expected)

result = stats.chisquare(
    f_obs=observed,
    f_exp=expected
)

print("Chi-square statistic:", result.statistic)
print("Degrees of freedom:", len(observed) - 1)
print("p-value:", result.pvalue)

alpha = 0.05

if result.pvalue <= alpha:
    print("Decision: Reject the null hypothesis.")
    print("The observed outcome distribution differs from the specified planning distribution.")
else:
    print("Decision: Fail to reject the null hypothesis.")
    print("There is insufficient evidence that the outcome distribution differs from the specified planning distribution.")

print("This test does not identify why any difference occurred.")
      `,
      ordered: true
    }
  ]
});
