
LESSONS.push({
  id: 'st-5-3',
  track: 'statistics',
  lang: 'python',
  packages: ['numpy', 'pandas', 'scipy'],
  loopGuard: true,
  files: [],
  setup: `
import numpy as np
import pandas as pd
from scipy import stats

print("Lesson 5.3: Two-sample hypothesis tests")
print("Libraries loaded successfully.")
`,
  title: '5.3 Two-sample hypothesis tests: comparing groups',
  intro: `
    <p>Many important business questions require us to compare two groups rather than evaluate a single population.</p>
    <p>TradeFlow might want to know whether two distribution centres have different average delivery times, whether a new training programme improves employee productivity, or whether two marketing campaigns generate different average order values.</p>
    <p>This lesson develops the statistical methods used to answer these questions. You will learn to distinguish independent from paired samples, conduct Welch's t-test and paired t-tests, calculate confidence intervals, measure effect sizes, and interpret statistical evidence in practical terms.</p>
    <p>All datasets created in this lesson are illustrative training data, not actual TradeFlow operational records.</p>
  `,
  steps: [
    {
      type: 'explain',
      title: '1. Understanding two-sample hypothesis testing',
      body: `
        <p>A one-sample hypothesis test evaluates a claim about one population parameter. A two-sample test evaluates whether two populations differ.</p>
        <p>Suppose TradeFlow compares the average delivery transit times of Centre A and Centre B. The population means are represented by μ₁ and μ₂.</p>
        <p>The difference of interest is:</p>
        <p><strong>μ₁ − μ₂</strong></p>
        <p>A common null hypothesis is:</p>
        <p><strong>H₀: μ₁ − μ₂ = 0</strong></p>
        <p>The two-sided alternative is:</p>
        <p><strong>H₁: μ₁ − μ₂ ≠ 0</strong></p>
        <p>The null hypothesis says the population means are equal. The alternative says they differ.</p>
        <p>We do not usually observe the entire populations. Instead, we calculate sample means and use statistical inference to evaluate whether the observed difference provides convincing evidence of a population difference.</p>
        <p>It is important to distinguish a sample difference from a population difference. A sample difference can occur by chance even when the population means are equal.</p>
      `
    },
    {
      type: 'explain',
      title: '2. Independent samples and Welch’s t-test',
      body: `
        <p>Two samples are independent when the observations in one group are not naturally paired with observations in the other group.</p>
        <p>For example, if Centre A handles one set of deliveries and Centre B handles a different set, the delivery records are independent samples, provided the sampling process does not create additional dependencies.</p>
        <p>Welch's two-sample t-test is used to compare two independent population means. It is particularly useful because it does not assume that the population variances are equal.</p>
        <p>The test statistic is:</p>
        <p><strong>t = (x̄₁ − x̄₂) / SE</strong></p>
        <p>where:</p>
        <p><strong>SE = √(s₁²/n₁ + s₂²/n₂)</strong></p>
        <p>Here, x̄ represents a sample mean, s² represents a sample variance, and n represents the sample size.</p>
        <p>Welch's method also estimates degrees of freedom using the sample sizes and variances. These degrees of freedom need not be whole numbers.</p>
        <p>In SciPy, we use <code>stats.ttest_ind(group_a, group_b, equal_var=False)</code>. The argument <code>equal_var=False</code> tells Python to perform Welch's test rather than the equal-variance version of the independent-samples t-test.</p>
      `
    },
    {
      type: 'try',
      title: 'Demonstration: comparing two distribution centres',
      body: `
        <p>We will simulate delivery transit times for two independent groups. Examine the sample means before interpreting the test result.</p>
      `,
      code: `
import numpy as np
from scipy import stats

rng = np.random.default_rng(5301)

centre_a = rng.normal(4.8, 1.2, 45)
centre_b = rng.normal(5.4, 1.5, 50)

mean_a = np.mean(centre_a)
mean_b = np.mean(centre_b)

result = stats.ttest_ind(
    centre_a,
    centre_b,
    equal_var=False,
    alternative="two-sided"
)

print("Centre A mean:", round(mean_a, 3))
print("Centre B mean:", round(mean_b, 3))
print("Difference A - B:", round(mean_a - mean_b, 3))
print("t-statistic:", round(result.statistic, 3))
print("p-value:", round(result.pvalue, 4))
      `
    },
    {
      type: 'explain',
      title: '3. Paired samples and repeated measurements',
      body: `
        <p>Sometimes two groups are not independent. Each observation in one group is connected to an observation in the other group.</p>
        <p>Suppose TradeFlow measures the processing time of the same employees before and after a training programme. Each employee contributes two measurements.</p>
        <p>These are paired observations. We calculate a difference for each employee:</p>
        <p><strong>dᵢ = Afterᵢ − Beforeᵢ</strong></p>
        <p>We then test whether the population mean of these differences is zero.</p>
        <p>The paired t-test statistic is:</p>
        <p><strong>t = d̄ / (s<sub>d</sub> / √n)</strong></p>
        <p>Here, d̄ is the mean of the paired differences, s<sub>d</sub> is their sample standard deviation, and n is the number of pairs.</p>
        <p>In SciPy, <code>stats.ttest_rel(after, before)</code> performs a paired t-test.</p>
        <p>Do not choose a paired test simply because two samples have equal sizes. There must be a genuine relationship between the observations, such as repeated measurements on the same individuals or deliberately matched units.</p>
      `
    },
    {
      type: 'try',
      title: 'Demonstration: before-and-after measurements',
      body: `
        <p>We will measure the same employees before and after training. A negative difference means processing time decreased.</p>
      `,
      code: `
import numpy as np
from scipy import stats

rng = np.random.default_rng(5302)

before = rng.normal(52, 7, 30)
improvement = rng.normal(5, 3, 30)
after = before - improvement

differences = after - before

result = stats.ttest_rel(
    after,
    before,
    alternative="less"
)

print("Mean before:", round(np.mean(before), 2))
print("Mean after:", round(np.mean(after), 2))
print("Mean difference:", round(np.mean(differences), 2))
print("t-statistic:", round(result.statistic, 3))
print("p-value:", round(result.pvalue, 4))
      `
    },
    {
      type: 'explain',
      title: '4. Confidence intervals for differences between means',
      body: `
        <p>A hypothesis test provides evidence about a null hypothesis. A confidence interval provides an estimated range for the population difference.</p>
        <p>For independent samples, the estimated difference is:</p>
        <p><strong>x̄₁ − x̄₂</strong></p>
        <p>A confidence interval is constructed by adding and subtracting a margin of error:</p>
        <p><strong>Estimated difference ± critical value × standard error</strong></p>
        <p>For Welch's method, the standard error is:</p>
        <p><strong>SE = √(s₁²/n₁ + s₂²/n₂)</strong></p>
        <p>The degrees of freedom are estimated using the Welch-Satterthwaite equation. We can obtain the critical t-value using <code>stats.t.ppf(0.975, df)</code> for a two-sided 95% confidence interval.</p>
        <p>If the interval contains zero, the data are compatible with no population mean difference at the corresponding two-sided 5% significance level, under the test assumptions.</p>
        <p>If the interval excludes zero, it indicates evidence of a difference at that level.</p>
        <p>A confidence interval is more informative than a p-value alone because it communicates the direction, magnitude, and uncertainty of the estimated difference.</p>
      `
    },
    {
      type: 'explain',
      title: '5. Effect sizes and practical significance',
      body: `
        <p>A statistically significant difference is not necessarily an important business difference.</p>
        <p>Imagine that a very large sample reveals that Centre A is faster than Centre B by only 0.05 days. The difference might be statistically significant, but its operational importance could be negligible.</p>
        <p>Cohen's d expresses a difference between independent group means in standard deviation units:</p>
        <p><strong>d = (x̄₁ − x̄₂) / s<sub>pooled</sub></strong></p>
        <p>The pooled standard deviation is:</p>
        <p><strong>s<sub>pooled</sub> = √[((n₁ − 1)s₁² + (n₂ − 1)s₂²) / (n₁ + n₂ − 2)]</strong></p>
        <p>The sign tells us the direction of the difference. The absolute value indicates its standardised magnitude.</p>
        <p>Common rough reference points are 0.2 for a small effect, 0.5 for a medium effect, and 0.8 for a large effect. These are conventions, not universal rules. Business decisions should also consider the actual units, costs, risks, and operational context.</p>
      `
    },
    {
      type: 'exercise',
      title: 'Exercise 1: Conduct an independent-samples test',
      body: `
        <p>TradeFlow compares transit times from two independent distribution centres.</p>
        <p>Use Welch's t-test to determine whether the population means differ.</p>
        <p>Your tasks:</p>
        <ol>
          <li>Calculate both sample means.</li>
          <li>Calculate the difference between the means, using A minus B.</li>
          <li>Conduct Welch's two-sample t-test.</li>
          <li>Interpret the p-value at the 5% significance level.</li>
        </ol>
      `,
      starter: `
import numpy as np
from scipy import stats

centre_a = np.array([4.2, 5.1, 4.8, 5.0, 4.5, 4.7, 5.3, 4.4, 4.9, 5.2])
centre_b = np.array([5.4, 5.8, 5.1, 6.2, 5.6, 5.9, 5.3, 6.0, 5.7, 5.5])

# Calculate the two sample means.


# Calculate the difference between the means.


# Conduct Welch's t-test.


# Interpret the p-value.
`,
      hints: [
        'Use np.mean() for each group.',
        'Use stats.ttest_ind() with equal_var=False.',
        'A p-value below 0.05 is evidence against the null hypothesis at the 5% level.'
      ],
      solution: `
import numpy as np
from scipy import stats

centre_a = np.array([4.2, 5.1, 4.8, 5.0, 4.5, 4.7, 5.3, 4.4, 4.9, 5.2])
centre_b = np.array([5.4, 5.8, 5.1, 6.2, 5.6, 5.9, 5.3, 6.0, 5.7, 5.5])

mean_a = np.mean(centre_a)
mean_b = np.mean(centre_b)
difference = mean_a - mean_b

result = stats.ttest_ind(
    centre_a,
    centre_b,
    equal_var=False,
    alternative="two-sided"
)

print("Centre A mean:", round(mean_a, 3))
print("Centre B mean:", round(mean_b, 3))
print("Difference A - B:", round(difference, 3))
print("t-statistic:", round(result.statistic, 3))
print("p-value:", round(result.pvalue, 4))

if result.pvalue < 0.05:
    print("Reject H0: evidence of a difference in population means.")
else:
    print("Fail to reject H0: insufficient evidence of a difference.")
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 2: Calculate Cohen’s d',
      body: `
        <p>Two customer groups receive different fulfilment processes. Their processing times are recorded below.</p>
        <p>Calculate each sample mean, each sample standard deviation, the pooled standard deviation, and Cohen's d.</p>
        <p>Explain what the sign and magnitude of the effect size indicate. Remember that Cohen's d describes a standardised difference, not a direct business saving.</p>
      `,
      starter: `
import numpy as np

group_a = np.array([42, 45, 47, 44, 43, 46, 48, 45])
group_b = np.array([49, 51, 50, 47, 53, 52, 48, 54])

# Calculate sample sizes and means.


# Calculate sample standard deviations using ddof=1.


# Calculate the pooled variance and pooled standard deviation.


# Calculate Cohen's d.


# Print and interpret your results.
`,
      hints: [
        'Use np.std(group, ddof=1) for sample standard deviation.',
        'Weight each sample variance by its degrees of freedom when calculating pooled variance.',
        'Cohen\\'s d is the difference in means divided by the pooled standard deviation.'
      ],
      solution: `
import numpy as np

group_a = np.array([42, 45, 47, 44, 43, 46, 48, 45])
group_b = np.array([49, 51, 50, 47, 53, 52, 48, 54])

n_a = len(group_a)
n_b = len(group_b)

mean_a = np.mean(group_a)
mean_b = np.mean(group_b)

sd_a = np.std(group_a, ddof=1)
sd_b = np.std(group_b, ddof=1)

pooled_variance = (
    (n_a - 1) * sd_a**2 +
    (n_b - 1) * sd_b**2
) / (n_a + n_b - 2)

pooled_sd = np.sqrt(pooled_variance)
cohens_d = (mean_a - mean_b) / pooled_sd

print("Group A mean:", round(mean_a, 3))
print("Group B mean:", round(mean_b, 3))
print("Group A SD:", round(sd_a, 3))
print("Group B SD:", round(sd_b, 3))
print("Pooled SD:", round(pooled_sd, 3))
print("Cohen's d:", round(cohens_d, 3))
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 3: Conduct a paired t-test',
      body: `
        <p>TradeFlow measures the processing time of the same ten employees before and after a workflow improvement.</p>
        <p>Because the same employees were measured twice, these are paired observations.</p>
        <p>Your tasks:</p>
        <ol>
          <li>Calculate the paired differences as after minus before.</li>
          <li>Calculate the mean difference.</li>
          <li>Conduct a two-sided paired t-test.</li>
          <li>Interpret the p-value and direction of the change.</li>
        </ol>
      `,
      starter: `
import numpy as np
from scipy import stats

before = np.array([48, 52, 55, 49, 61, 57, 53, 50, 59, 54])
after = np.array([44, 49, 50, 47, 55, 53, 51, 46, 54, 51])

# Calculate paired differences.


# Calculate the average difference.


# Run a paired t-test.


# Interpret the result.
`,
      hints: [
        'Subtract before from after to calculate each employee\\'s difference.',
        'Use stats.ttest_rel(after, before).',
        'A negative mean difference means the recorded time decreased.'
      ],
      solution: `
import numpy as np
from scipy import stats

before = np.array([48, 52, 55, 49, 61, 57, 53, 50, 59, 54])
after = np.array([44, 49, 50, 47, 55, 53, 51, 46, 54, 51])

differences = after - before

result = stats.ttest_rel(
    after,
    before,
    alternative="two-sided"
)

print("Paired differences:", differences)
print("Mean difference:", round(np.mean(differences), 3))
print("t-statistic:", round(result.statistic, 3))
print("p-value:", round(result.pvalue, 4))

if result.pvalue < 0.05:
    print("Reject H0: evidence of a change in average processing time.")
else:
    print("Fail to reject H0: insufficient evidence of a change.")
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 4: Construct a 95% confidence interval',
      body: `
        <p>TradeFlow wants to estimate the difference in average transit time between two independent groups.</p>
        <p>Calculate a 95% Welch confidence interval for Group A minus Group B.</p>
        <p>Your tasks:</p>
        <ol>
          <li>Calculate the mean difference.</li>
          <li>Calculate the Welch standard error.</li>
          <li>Calculate the Welch-Satterthwaite degrees of freedom.</li>
          <li>Calculate the 95% confidence interval.</li>
          <li>Explain what it means if the interval contains zero.</li>
        </ol>
      `,
      starter: `
import numpy as np
from scipy import stats

group_a = np.array([6.1, 5.8, 6.4, 5.9, 6.2, 6.0, 5.7, 6.3, 6.1, 5.9])
group_b = np.array([6.8, 6.5, 6.9, 6.2, 6.6, 6.7, 6.4, 6.8, 6.3, 6.5])

# Calculate sample sizes, means and variances.


# Calculate the mean difference and standard error.


# Calculate Welch degrees of freedom.


# Calculate the critical t-value.


# Construct and interpret the 95% confidence interval.
`,
      hints: [
        'Use np.var(group, ddof=1) for sample variance.',
        'Welch SE = sqrt(var1/n1 + var2/n2).',
        'Use stats.t.ppf(0.975, df) for a two-sided 95% interval.'
      ],
      solution: `
import numpy as np
from scipy import stats

group_a = np.array([6.1, 5.8, 6.4, 5.9, 6.2, 6.0, 5.7, 6.3, 6.1, 5.9])
group_b = np.array([6.8, 6.5, 6.9, 6.2, 6.6, 6.7, 6.4, 6.8, 6.3, 6.5])

n1 = len(group_a)
n2 = len(group_b)

mean_difference = np.mean(group_a) - np.mean(group_b)
var1 = np.var(group_a, ddof=1)
var2 = np.var(group_b, ddof=1)

se = np.sqrt(var1 / n1 + var2 / n2)

df = (var1 / n1 + var2 / n2) ** 2 / (
    (var1 / n1) ** 2 / (n1 - 1) +
    (var2 / n2) ** 2 / (n2 - 1)
)

critical = stats.t.ppf(0.975, df)

lower = mean_difference - critical * se
upper = mean_difference + critical * se

print("Mean difference A - B:", round(mean_difference, 3))
print("Standard error:", round(se, 3))
print("Welch degrees of freedom:", round(df, 3))
print("95% confidence interval:", round(lower, 3), "to", round(upper, 3))

if lower <= 0 <= upper:
    print("The interval contains zero.")
else:
    print("The interval excludes zero.")
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 5: Select and justify the correct test',
      body: `
        <p>Consider three TradeFlow research scenarios.</p>
        <ol>
          <li>Compare delivery times from two centres handling different deliveries.</li>
          <li>Compare employee processing times before and after training, using the same employees.</li>
          <li>Compare average order values from two customer groups, where each customer receives only one promotional offer.</li>
        </ol>
        <p>Identify whether each scenario involves independent or paired observations. Then run the appropriate test using the supplied illustrative data.</p>
        <p>Finally, explain why choosing the test based on the data collection design is essential.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

centre_a = np.array([4.1, 4.5, 4.8, 4.4, 4.9, 4.6, 4.2, 4.7])
centre_b = np.array([5.0, 5.3, 5.1, 5.6, 5.2, 5.4, 5.0, 5.5])

before = np.array([55, 52, 58, 61, 54, 57, 60, 53])
after = np.array([51, 50, 53, 57, 50, 54, 55, 51])

offer_a = np.array([120, 135, 128, 140, 125, 132, 138, 130])
offer_b = np.array([145, 150, 138, 155, 142, 148, 152, 146])

# Run Welch's test for Scenario 1.


# Run a paired t-test for Scenario 2.


# Run Welch's test for Scenario 3.


# Print and interpret the three p-values.
`,
      hints: [
        'Scenarios 1 and 3 involve independent samples.',
        'Scenario 2 involves paired measurements.',
        'Use ttest_ind with equal_var=False for independent groups and ttest_rel for paired groups.'
      ],
      solution: `
import numpy as np
from scipy import stats

centre_a = np.array([4.1, 4.5, 4.8, 4.4, 4.9, 4.6, 4.2, 4.7])
centre_b = np.array([5.0, 5.3, 5.1, 5.6, 5.2, 5.4, 5.0, 5.5])

before = np.array([55, 52, 58, 61, 54, 57, 60, 53])
after = np.array([51, 50, 53, 57, 50, 54, 55, 51])

offer_a = np.array([120, 135, 128, 140, 125, 132, 138, 130])
offer_b = np.array([145, 150, 138, 155, 142, 148, 152, 146])

scenario_1 = stats.ttest_ind(centre_a, centre_b, equal_var=False)
scenario_2 = stats.ttest_rel(after, before)
scenario_3 = stats.ttest_ind(offer_a, offer_b, equal_var=False)

print("Scenario 1: independent delivery groups")
print("p-value:", round(scenario_1.pvalue, 4))

print("\\nScenario 2: paired employee measurements")
print("p-value:", round(scenario_2.pvalue, 4))

print("\\nScenario 3: independent customer groups")
print("p-value:", round(scenario_3.pvalue, 4))
      `,
      ordered: true
    }
  ]
});


LESSONS.push({
  id: 'st-5-4',
  track: 'statistics',
  lang: 'python',
  packages: ['numpy', 'pandas', 'scipy'],
  loopGuard: true,
  files: [],
  setup: `
import numpy as np
import pandas as pd
from scipy import stats

print("Lesson 5.4: Hypothesis tests for categorical data")
print("Libraries loaded successfully.")
`,
  title: '5.4 Hypothesis tests for categorical data',
  intro: `
    <p>Not every business question concerns averages or numerical measurements. Many important questions involve categories, counts, and proportions.</p>
    <p>TradeFlow may want to know whether delivery outcomes follow an expected distribution, whether delivery status is associated with distribution centre, or whether payment method is related to order cancellation.</p>
    <p>This lesson introduces three important methods: the chi-square goodness-of-fit test, the chi-square test of independence, and Fisher's exact test. You will also learn how to evaluate expected frequencies and measure the strength of categorical associations.</p>
  `,
  steps: [
    {
      type: 'explain',
      title: '1. Understanding categorical data',
      body: `
        <p>Categorical variables represent groups or labels rather than numerical measurements.</p>
        <p>Examples in a logistics business include:</p>
        <ul>
          <li>Delivery status: successful, delayed, or failed.</li>
          <li>Payment method: card, transfer, or cash.</li>
          <li>Distribution centre: Centre A, Centre B, or Centre C.</li>
          <li>Customer segment: retail, wholesale, or corporate.</li>
        </ul>
        <p>Analysts commonly summarise categorical variables using frequency counts. A frequency is the number of observations belonging to a category.</p>
        <p>For example, 720 successful deliveries, 210 delayed deliveries, and 70 failed deliveries form a frequency distribution.</p>
        <p>Hypothesis tests for categorical data compare observed frequencies with frequencies expected under a statistical model or null hypothesis.</p>
      `
    },
    {
      type: 'explain',
      title: '2. Chi-square goodness-of-fit test',
      body: `
        <p>A chi-square goodness-of-fit test evaluates whether an observed categorical distribution is consistent with a specified probability distribution.</p>
        <p>Suppose TradeFlow expects 70% of deliveries to be successful, 20% to be delayed, and 10% to fail.</p>
        <p>If 1,000 deliveries are observed, the expected frequencies are 700, 200, and 100.</p>
        <p>The test statistic is:</p>
        <p><strong>χ² = Σ (O − E)² / E</strong></p>
        <p>O represents the observed frequency and E represents the expected frequency.</p>
        <p>The null hypothesis states that the population proportions follow the specified distribution. The alternative states that the distribution differs in at least one category.</p>
        <p>When there are k categories and no distribution parameters are estimated from the sample, the degrees of freedom are k − 1.</p>
        <p>A significant result tells us that the overall distribution differs from the expected distribution. It does not automatically identify which category is responsible. To investigate that, compare the observed and expected counts.</p>
      `
    },
    {
      type: 'try',
      title: 'Demonstration: testing delivery outcomes',
      body: `
        <p>Test whether the observed delivery outcomes match the expected proportions of 70%, 20%, and 10%.</p>
      `,
      code: `
import numpy as np
from scipy import stats

observed = np.array([720, 210, 70])
expected_proportions = np.array([0.70, 0.20, 0.10])

expected = observed.sum() * expected_proportions

result = stats.chisquare(
    f_obs=observed,
    f_exp=expected
)

print("Observed:", observed)
print("Expected:", expected)
print("Chi-square statistic:", round(result.statistic, 3))
print("p-value:", round(result.pvalue, 4))
      `
    },
    {
      type: 'explain',
      title: '3. Chi-square test of independence',
      body: `
        <p>A chi-square test of independence evaluates whether two categorical variables are associated.</p>
        <p>For example, TradeFlow might investigate whether delivery status is associated with distribution centre.</p>
        <p>The data can be arranged in a contingency table:</p>
        <table>
          <tr><th>Centre</th><th>Successful</th><th>Delayed</th><th>Failed</th></tr>
          <tr><td>A</td><td>180</td><td>45</td><td>15</td></tr>
          <tr><td>B</td><td>150</td><td>70</td><td>30</td></tr>
          <tr><td>C</td><td>190</td><td>45</td><td>15</td></tr>
        </table>
        <p>The null hypothesis states that the variables are independent. The alternative states that they are associated.</p>
        <p>The expected frequency in each cell is:</p>
        <p><strong>Expected count = (Row total × Column total) / Grand total</strong></p>
        <p>For a table with r rows and c columns, the degrees of freedom are:</p>
        <p><strong>df = (r − 1)(c − 1)</strong></p>
        <p>A significant result suggests an association. It does not establish causation, and it does not tell us how strong the association is.</p>
      `
    },
    {
      type: 'try',
      title: 'Demonstration: distribution centre and delivery status',
      body: `
        <p>Use a contingency table to investigate whether delivery status and distribution centre are independent.</p>
      `,
      code: `
import numpy as np
from scipy import stats

table = np.array([
    [180, 45, 15],
    [150, 70, 30],
    [190, 45, 15]
])

chi2, p_value, df, expected = stats.chi2_contingency(
    table,
    correction=False
)

print("Observed counts:")
print(table)

print("\\nExpected counts:")
print(np.round(expected, 2))

print("\\nChi-square statistic:", round(chi2, 3))
print("Degrees of freedom:", df)
print("p-value:", round(p_value, 4))
      `
    },
    {
      type: 'explain',
      title: '4. Expected frequencies and assumptions',
      body: `
        <p>The chi-square test uses a theoretical probability distribution to approximate the sampling distribution of its test statistic. This approximation is more reliable when expected frequencies are not too small.</p>
        <p>A commonly used guideline is that expected counts should generally be at least 5 in every cell. More detailed guidance permits some smaller counts under particular conditions, but many very small expected frequencies can make the approximation unreliable.</p>
        <p>Other important assumptions include:</p>
        <ul>
          <li>Each observation contributes to one cell only.</li>
          <li>Observations are independent at the relevant sampling unit.</li>
          <li>Categories are mutually exclusive and clearly defined.</li>
          <li>Expected counts are calculated under the null hypothesis.</li>
        </ul>
        <p>If expected counts are too small, a standard chi-square approximation may not be appropriate. For a 2 × 2 table, Fisher's exact test is often a suitable alternative.</p>
      `
    },
    {
      type: 'explain',
      title: '5. Fisher’s exact test',
      body: `
        <p>Fisher's exact test evaluates the association between two categorical variables in a 2 × 2 contingency table.</p>
        <p>It is especially useful when sample sizes are small and expected cell frequencies are low.</p>
        <p>Consider a table comparing payment method and cancellation:</p>
        <table>
          <tr><th></th><th>Cancelled</th><th>Not cancelled</th></tr>
          <tr><td>Payment A</td><td>2</td><td>8</td></tr>
          <tr><td>Payment B</td><td>7</td><td>3</td></tr>
        </table>
        <p>Fisher's exact test calculates probabilities from possible tables under the null hypothesis, conditional on the observed row and column totals.</p>
        <p>The test also returns an odds ratio. An odds ratio of 1 indicates equal odds. An odds ratio greater than 1 indicates higher odds for the first row relative to the second for the first column outcome. A value below 1 indicates lower odds.</p>
        <p>Always check the arrangement of the rows and columns before interpreting the direction of an odds ratio.</p>
      `
    },
    {
      type: 'explain',
      title: '6. Measuring association with Cramér’s V',
      body: `
        <p>A chi-square p-value tells us whether there is evidence of an association. It does not measure the strength of that association.</p>
        <p>Cramér's V is a common measure of association strength for a contingency table:</p>
        <p><strong>V = √(χ² / (n × min(r − 1, c − 1)))</strong></p>
        <p>Here, χ² is the chi-square statistic, n is the total number of observations, r is the number of rows, and c is the number of columns.</p>
        <p>Cramér's V ranges from 0 to 1. A value near 0 indicates little association, while a value closer to 1 indicates stronger association.</p>
        <p>Interpretation depends on the dimensions of the table and the subject area. Do not treat generic cut-offs as universal business rules.</p>
        <p>Finally, an association does not establish causation. If one distribution centre has a higher proportion of delayed deliveries, route difficulty, shipment type, staffing, or other variables may explain the difference.</p>
      `
    },
    {
      type: 'exercise',
      title: 'Exercise 1: Chi-square goodness-of-fit test',
      body: `
        <p>TradeFlow expects delivery outcomes to follow these proportions: successful 65%, delayed 25%, and failed 10%.</p>
        <p>A sample of 500 deliveries produces observed counts of 340 successful, 115 delayed, and 45 failed deliveries.</p>
        <p>Calculate the expected frequencies, conduct a chi-square goodness-of-fit test, report the degrees of freedom and p-value, and interpret the result at the 5% significance level.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

observed = np.array([340, 115, 45])
expected_proportions = np.array([0.65, 0.25, 0.10])

# Calculate expected frequencies.


# Conduct the goodness-of-fit test.


# Report the statistic, degrees of freedom and p-value.


# Interpret the result.
`,
      hints: [
        'Multiply the total observed count by each expected proportion.',
        'Use stats.chisquare(f_obs=observed, f_exp=expected).',
        'There are three categories, so the degrees of freedom are two.'
      ],
      solution: `
import numpy as np
from scipy import stats

observed = np.array([340, 115, 45])
expected_proportions = np.array([0.65, 0.25, 0.10])

total = observed.sum()
expected = total * expected_proportions

result = stats.chisquare(
    f_obs=observed,
    f_exp=expected
)

print("Total:", total)
print("Observed:", observed)
print("Expected:", expected)
print("Chi-square statistic:", round(result.statistic, 3))
print("Degrees of freedom:", len(observed) - 1)
print("p-value:", round(result.pvalue, 4))

if result.pvalue < 0.05:
    print("Reject H0: evidence that the distribution differs from expectation.")
else:
    print("Fail to reject H0: insufficient evidence of a difference.")
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 2: Chi-square test of independence',
      body: `
        <p>TradeFlow records delivery status across three distribution centres. Management wants to investigate whether delivery status is associated with distribution centre.</p>
        <p>Run a chi-square test of independence using the supplied contingency table.</p>
        <p>Display the expected frequencies, test statistic, degrees of freedom, and p-value. Interpret the result at the 5% significance level.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

observed = np.array([
    [120, 30, 10],
    [100, 45, 15],
    [130, 25, 5]
])

# Conduct the chi-square test of independence.


# Display expected frequencies.


# Report the test statistic, degrees of freedom and p-value.


# Interpret the result.
`,
      hints: [
        'Use stats.chi2_contingency().',
        'The function returns the statistic, p-value, degrees of freedom, and expected frequencies.',
        'The null hypothesis states that distribution centre and delivery status are independent.'
      ],
      solution: `
import numpy as np
from scipy import stats

observed = np.array([
    [120, 30, 10],
    [100, 45, 15],
    [130, 25, 5]
])

chi2, p_value, df, expected = stats.chi2_contingency(
    observed,
    correction=False
)

print("Observed table:")
print(observed)

print("\\nExpected frequencies:")
print(np.round(expected, 2))

print("\\nChi-square statistic:", round(chi2, 3))
print("Degrees of freedom:", df)
print("p-value:", round(p_value, 4))

if p_value < 0.05:
    print("Reject H0: evidence of an association.")
else:
    print("Fail to reject H0: insufficient evidence of an association.")
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 3: Evaluate expected frequencies',
      body: `
        <p>Before interpreting a chi-square test, an analyst should inspect the expected frequencies.</p>
        <p>Use the supplied 2 × 2 table to conduct a chi-square test. Display the expected frequencies, identify the smallest expected count, and explain whether the common guideline of at least 5 per cell is satisfied.</p>
        <p>If the expected counts are too small, identify a more suitable test for this table.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

observed = np.array([
    [3, 7],
    [8, 2]
])

# Run the chi-square test.


# Display the expected frequencies.


# Find the smallest expected count.


# Evaluate the expected-count guideline.
`,
      hints: [
        'Use stats.chi2_contingency(observed, correction=False).',
        'Use np.min(expected) to find the smallest expected frequency.',
        'Fisher\\'s exact test is often suitable for a small 2 × 2 table.'
      ],
      solution: `
import numpy as np
from scipy import stats

observed = np.array([
    [3, 7],
    [8, 2]
])

chi2, p_value, df, expected = stats.chi2_contingency(
    observed,
    correction=False
)

smallest = np.min(expected)

print("Expected frequencies:")
print(np.round(expected, 3))
print("Smallest expected count:", round(smallest, 3))
print("Chi-square statistic:", round(chi2, 3))
print("p-value:", round(p_value, 4))

if smallest < 5:
    print("At least one expected count is below 5.")
    print("The chi-square approximation may be unreliable.")
    print("Consider Fisher's exact test for this 2 x 2 table.")
else:
    print("Every expected count is at least 5.")
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 4: Fisher’s exact test and odds ratios',
      body: `
        <p>TradeFlow investigates whether payment method is associated with order cancellation.</p>
        <p>The table contains two payment methods and two cancellation outcomes.</p>
        <p>Run a two-sided Fisher's exact test. Report the odds ratio and p-value. Interpret the direction of the odds ratio carefully, using the row and column order provided.</p>
        <p>Finally, determine whether there is sufficient evidence of an association at the 5% significance level.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

table = np.array([
    [2, 8],
    [7, 3]
])

# Run Fisher's exact test.


# Report the odds ratio and p-value.


# Interpret the odds ratio and statistical result.
`,
      hints: [
        'Use stats.fisher_exact(table, alternative="two-sided").',
        'The first row is Payment A and the second is Payment B.',
        'The first column is the cancellation outcome.'
      ],
      solution: `
import numpy as np
from scipy import stats

table = np.array([
    [2, 8],
    [7, 3]
])

odds_ratio, p_value = stats.fisher_exact(
    table,
    alternative="two-sided"
)

print("Odds ratio:", round(odds_ratio, 3))
print("p-value:", round(p_value, 4))

if odds_ratio > 1:
    print("The odds of cancellation are higher for Payment A than Payment B.")
elif odds_ratio < 1:
    print("The odds of cancellation are lower for Payment A than Payment B.")
else:
    print("The estimated cancellation odds are equal.")

if p_value < 0.05:
    print("Reject H0: evidence of an association.")
else:
    print("Fail to reject H0: insufficient evidence of an association.")
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 5: Calculate and interpret Cramér’s V',
      body: `
        <p>A chi-square test can identify evidence of an association, but its p-value does not measure the strength of the relationship.</p>
        <p>Use the contingency table to:</p>
        <ol>
          <li>Conduct a chi-square test of independence.</li>
          <li>Calculate the total sample size.</li>
          <li>Determine the number of rows and columns.</li>
          <li>Calculate Cramér's V using the chi-square statistic.</li>
          <li>Interpret the p-value and Cramér's V separately.</li>
        </ol>
        <p>Explain why the presence of an association does not establish that one variable causes the other.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

table = np.array([
    [150, 40, 10],
    [110, 60, 30],
    [140, 45, 15]
])

# Conduct the chi-square test.


# Calculate the total sample size.


# Obtain the table dimensions.


# Calculate Cramér's V.


# Print and interpret the results.
`,
      hints: [
        'Use stats.chi2_contingency() to obtain the chi-square statistic and p-value.',
        'The total sample size is table.sum().',
        'Use min(rows - 1, columns - 1) in the denominator of Cramér\\'s V.'
      ],
      solution: `
import numpy as np
from scipy import stats

table = np.array([
    [150, 40, 10],
    [110, 60, 30],
    [140, 45, 15]
])

chi2, p_value, df, expected = stats.chi2_contingency(
    table,
    correction=False
)

n = table.sum()
rows, columns = table.shape

cramers_v = np.sqrt(
    chi2 / (n * min(rows - 1, columns - 1))
)

print("Chi-square statistic:", round(chi2, 3))
print("Degrees of freedom:", df)
print("p-value:", round(p_value, 4))
print("Sample size:", n)
print("Cramer's V:", round(cramers_v, 3))

if p_value < 0.05:
    print("There is evidence of an association.")
else:
    print("There is insufficient evidence of an association.")

print("Cramer's V measures association strength.")
print("Association alone does not establish causation.")
      `,
      ordered: true
    }
  ]
});
