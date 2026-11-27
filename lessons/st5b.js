LESSONS.push({
  id: 'st-5-3',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'scipy'],
  loopGuard: true,
  files: [],
  setup: `
import pandas as pd
import numpy as np
from scipy import stats

print("Statistics Module 5.3: Two-sample hypothesis tests")
print("Required libraries loaded successfully.")
`,
  title: '5.3 Two-sample hypothesis tests: comparing groups',
  intro: `
    <p>In the previous lessons, we examined how hypothesis tests help us evaluate claims about a single population. In business and research, however, many important questions involve comparing two groups.</p>

    <p>For example:</p>
    <ul>
      <li>Does a new delivery process reduce average transit time?</li>
      <li>Do two distribution centres have different average processing times?</li>
      <li>Did a training programme improve employees' productivity?</li>
      <li>Does one marketing campaign generate a higher average order value than another?</li>
    </ul>

    <p>These questions require methods that account for the relationship between the groups being compared. This lesson develops the statistical tools for making those comparisons.</p>
  `,
  steps: [
    {
      type: 'explain',
      title: '1. Why compare two groups?',
      body: `
        <p>A one-sample test evaluates a claim about one population parameter. A two-sample test evaluates whether two populations differ in some meaningful way.</p>

        <p>Suppose TradeFlow wants to compare average delivery transit times between two distribution centres. Let:</p>
        <ul>
          <li>Population 1 represent deliveries handled by Centre A.</li>
          <li>Population 2 represent deliveries handled by Centre B.</li>
        </ul>

        <p>The parameter of interest is the difference between their population means:</p>
        <p><strong>Difference = μ₁ − μ₂</strong></p>

        <p>The null hypothesis usually states that there is no population difference:</p>
        <p><strong>H₀: μ₁ − μ₂ = 0</strong></p>

        <p>The alternative hypothesis states that a difference exists:</p>
        <p><strong>H₁: μ₁ − μ₂ ≠ 0</strong></p>

        <p>This is a two-sided test. If the research question specifically predicts that Centre A is faster, the alternative could instead be H₁: μ₁ − μ₂ &lt; 0.</p>

        <p>Notice the distinction between the sample means and population means. We observe sample data, but the hypothesis concerns the underlying populations. The test evaluates whether the observed sample difference is sufficiently inconsistent with the null hypothesis.</p>
      `
    },
    {
      type: 'explain',
      title: '2. Independent samples and Welch’s t-test',
      body: `
        <p>Two samples are independent when observations in one group are not naturally paired with observations in the other group.</p>

        <p>For example, deliveries handled by Centre A and Centre B may involve different shipments, customers, and routes. One delivery in Centre A does not correspond to a particular delivery in Centre B.</p>

        <p>When comparing two independent population means, Welch’s two-sample t-test is a strong default choice.</p>

        <p>Welch’s test does not require the two populations to have equal variances. This matters because two groups can have different levels of variability even when their means are similar.</p>

        <p>The test statistic is:</p>
        <p><strong>t = (x̄₁ − x̄₂) / SE</strong></p>

        <p>where the standard error is:</p>
        <p><strong>SE = √(s₁²/n₁ + s₂²/n₂)</strong></p>

        <p>Here, x̄ represents a sample mean, s² represents a sample variance, and n represents the sample size.</p>

        <p>Welch’s test estimates its degrees of freedom using the sample sizes and variances. This is why its degrees of freedom may not be a whole number.</p>
      `
    },
    {
      type: 'try',
      title: 'Demonstration: comparing two independent groups',
      body: `
        <p>We will simulate delivery times from two distribution centres. The data are illustrative, not actual TradeFlow operational records.</p>
        <p>First, calculate the sample means and standard deviations. Then use Welch’s t-test to evaluate whether the population means differ.</p>
      `,
      code: `
import numpy as np
from scipy import stats

rng = np.random.default_rng(5301)

centre_a = rng.normal(loc=4.8, scale=1.2, size=45)
centre_b = rng.normal(loc=5.4, scale=1.5, size=50)

print("Centre A mean:", round(np.mean(centre_a), 3))
print("Centre B mean:", round(np.mean(centre_b), 3))

result = stats.ttest_ind(
    centre_a,
    centre_b,
    equal_var=False,
    alternative="two-sided"
)

print("Welch t-statistic:", round(result.statistic, 3))
print("p-value:", round(result.pvalue, 4))
      `
    },
    {
      type: 'explain',
      title: '3. Statistical significance is not practical significance',
      body: `
        <p>A small p-value provides evidence against the null hypothesis. It does not tell us whether the difference is important in business terms.</p>

        <p>Consider two distribution centres with average transit times of 4.8 and 4.9 days. With a sufficiently large sample, a difference of 0.1 days might be statistically significant.</p>

        <p>However, a difference of 0.1 days may not justify the cost of changing the delivery process.</p>

        <p>For this reason, analysts should report at least three things:</p>
        <ol>
          <li>The estimated difference between the group means.</li>
          <li>A confidence interval describing uncertainty around that difference.</li>
          <li>A measure of effect size describing the magnitude of the difference.</li>
        </ol>

        <p>One commonly used effect size is Cohen's d:</p>
        <p><strong>d = (x̄₁ − x̄₂) / s<sub>pooled</sub></strong></p>

        <p>For independent groups, the pooled standard deviation is:</p>
        <p><strong>s<sub>pooled</sub> = √[((n₁ − 1)s₁² + (n₂ − 1)s₂²) / (n₁ + n₂ − 2)]</strong></p>

        <p>Cohen's d expresses the mean difference in standard deviation units. It is useful for describing magnitude, but its interpretation depends on the context. A small standardized effect can still matter operationally, while a large standardized effect may have limited financial importance.</p>
      `
    },
    {
      type: 'explain',
      title: '4. Paired samples and repeated measurements',
      body: `
        <p>Not every comparison involves independent groups. Sometimes each observation in one group is directly connected to an observation in the other group.</p>

        <p>Suppose TradeFlow measures the processing time of the same 20 employees before and after a training programme. Each employee contributes two measurements.</p>

        <p>These measurements are paired because they come from the same individuals.</p>

        <p>A paired t-test does not treat the before and after measurements as two unrelated groups. Instead, it calculates the difference for each individual:</p>

        <p><strong>dᵢ = Afterᵢ − Beforeᵢ</strong></p>

        <p>It then tests whether the population mean of these differences is zero.</p>

        <p>The test statistic is:</p>
        <p><strong>t = d̄ / (s<sub>d</sub> / √n)</strong></p>

        <p>where d̄ is the average paired difference, s<sub>d</sub> is the standard deviation of the differences, and n is the number of pairs.</p>

        <p>The pairing is important because each individual acts as their own comparison. This can reduce the influence of differences between individuals.</p>

        <p>A paired test is appropriate only when the observations are genuinely matched. It should not be used merely because two groups have the same sample size.</p>
      `
    },
    {
      type: 'try',
      title: 'Demonstration: testing a before-and-after improvement',
      body: `
        <p>Suppose processing times are recorded for the same employees before and after training. A negative difference means that processing time decreased after training.</p>
      `,
      code: `
import numpy as np
from scipy import stats

rng = np.random.default_rng(5302)

before = rng.normal(loc=52, scale=7, size=30)
improvement = rng.normal(loc=5, scale=3, size=30)
after = before - improvement

differences = after - before

print("Average time before:", round(np.mean(before), 2))
print("Average time after:", round(np.mean(after), 2))
print("Average paired difference:", round(np.mean(differences), 2))

result = stats.ttest_rel(
    after,
    before,
    alternative="less"
)

print("t-statistic:", round(result.statistic, 3))
print("p-value:", round(result.pvalue, 4))
      `
    },
    {
      type: 'explain',
      title: '5. Choosing the correct two-sample test',
      body: `
        <p>The correct test depends on how the data were collected.</p>

        <ul>
          <li><strong>Independent groups:</strong> use Welch's t-test when comparing two independent population means.</li>
          <li><strong>Paired observations:</strong> use a paired t-test when each observation in one condition is matched to an observation in the other condition.</li>
        </ul>

        <p>Both tests rely on assumptions. The observations should be appropriately sampled and independent at the relevant unit of analysis. The t-test also requires the relevant sampling distribution to be sufficiently well behaved. With small samples, extreme skewness and outliers can make results unreliable.</p>

        <p>For paired tests, the distribution of the paired differences is especially important. For Welch's test, the two groups do not need equal variances.</p>

        <p>Finally, a statistically significant difference does not establish that the group membership caused the difference. If customers, routes, or shipment types differ systematically between centres, those differences may explain some or all of the observed result.</p>
      `
    },

    {
      type: 'exercise',
      title: 'Exercise 1: Compare two independent groups',
      body: `
        <p>TradeFlow wants to compare delivery transit times between two distribution centres. The samples below represent independent deliveries.</p>

        <p>Use Welch's t-test to determine whether there is evidence of a difference in average transit time.</p>

        <p>Complete the following tasks:</p>
        <ol>
          <li>Calculate each group's sample mean.</li>
          <li>Calculate the difference between the sample means.</li>
          <li>Run Welch's two-sample t-test.</li>
          <li>Interpret the p-value using a 5% significance level.</li>
        </ol>
      `,
      starter: `
import numpy as np
from scipy import stats

centre_a = np.array([4.2, 5.1, 4.8, 5.0, 4.5, 4.7, 5.3, 4.4, 4.9, 5.2])
centre_b = np.array([5.4, 5.8, 5.1, 6.2, 5.6, 5.9, 5.3, 6.0, 5.7, 5.5])

# 1. Calculate the sample means.


# 2. Calculate the difference between the means.


# 3. Run Welch's t-test.


# 4. Interpret the p-value at the 5% significance level.

`,
      hints: [
        'Use np.mean() to calculate each sample mean.',
        'Use stats.ttest_ind() with equal_var=False.',
        'A p-value below 0.05 provides evidence against the null hypothesis at the 5% significance level.'
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
print("Difference (A - B):", round(difference, 3))
print("t-statistic:", round(result.statistic, 3))
print("p-value:", round(result.pvalue, 4))

if result.pvalue < 0.05:
    print("Reject H0: there is evidence of a difference in population means.")
else:
    print("Fail to reject H0: there is insufficient evidence of a difference.")
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 2: Calculate and interpret an effect size',
      body: `
        <p>A statistically significant result does not automatically imply a large or operationally important difference.</p>

        <p>Using the two independent groups below:</p>
        <ol>
          <li>Calculate both sample means.</li>
          <li>Calculate the pooled standard deviation.</li>
          <li>Calculate Cohen's d.</li>
          <li>Explain what the sign and magnitude of Cohen's d tell you.</li>
        </ol>
      `,
      starter: `
import numpy as np

group_a = np.array([42, 45, 47, 44, 43, 46, 48, 45])
group_b = np.array([49, 51, 50, 47, 53, 52, 48, 54])

# 1. Calculate the group means.


# 2. Calculate the sample standard deviations.


# 3. Calculate the pooled standard deviation.


# 4. Calculate Cohen's d.


# 5. Interpret the result.

`,
      hints: [
        'Use np.std(group, ddof=1) for the sample standard deviation.',
        'The pooled variance is a weighted average of the two sample variances.',
        'Cohen\\'s d is the difference between the means divided by the pooled standard deviation.'
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
    ((n_a - 1) * sd_a**2) +
    ((n_b - 1) * sd_b**2)
) / (n_a + n_b - 2)

pooled_sd = np.sqrt(pooled_variance)

cohens_d = (mean_a - mean_b) / pooled_sd

print("Group A mean:", round(mean_a, 3))
print("Group B mean:", round(mean_b, 3))
print("Pooled standard deviation:", round(pooled_sd, 3))
print("Cohen's d:", round(cohens_d, 3))
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 3: Analyse paired observations',
      body: `
        <p>TradeFlow introduces a new workflow for a group of employees. Each employee's processing time is measured before and after the intervention.</p>

        <p>The observations are paired because the same employees are measured twice.</p>

        <p>Complete these tasks:</p>
        <ol>
          <li>Calculate the difference for each employee as after minus before.</li>
          <li>Calculate the average difference.</li>
          <li>Run a paired t-test using a two-sided alternative.</li>
          <li>Interpret the result at the 5% significance level.</li>
        </ol>
      `,
      starter: `
import numpy as np
from scipy import stats

before = np.array([48, 52, 55, 49, 61, 57, 53, 50, 59, 54])
after = np.array([44, 49, 50, 47, 55, 53, 51, 46, 54, 51])

# 1. Calculate the paired differences.


# 2. Calculate the average difference.


# 3. Run a paired t-test.


# 4. Interpret the p-value.

`,
      hints: [
        'Subtract before from after for each employee.',
        'Use stats.ttest_rel(after, before).',
        'A negative average difference means processing time decreased after the intervention.'
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
print("Average difference:", round(np.mean(differences), 3))
print("t-statistic:", round(result.statistic, 3))
print("p-value:", round(result.pvalue, 4))

if result.pvalue < 0.05:
    print("Reject H0: there is evidence of a change in average processing time.")
else:
    print("Fail to reject H0: there is insufficient evidence of a change.")
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 4: Construct a confidence interval for the difference',
      body: `
        <p>A hypothesis test tells us whether the observed evidence is inconsistent with a null hypothesis. A confidence interval provides additional information about the plausible size of the population difference.</p>

        <p>Using the two independent samples below:</p>
        <ol>
          <li>Calculate the difference between the sample means.</li>
          <li>Calculate the Welch standard error.</li>
          <li>Calculate the Welch-Satterthwaite degrees of freedom.</li>
          <li>Construct a 95% confidence interval for the population mean difference.</li>
          <li>Explain whether the interval contains zero.</li>
        </ol>

        <p>Use the difference as Group A minus Group B.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

group_a = np.array([6.1, 5.8, 6.4, 5.9, 6.2, 6.0, 5.7, 6.3, 6.1, 5.9])
group_b = np.array([6.8, 6.5, 6.9, 6.2, 6.6, 6.7, 6.4, 6.8, 6.3, 6.5])

# 1. Calculate the difference between sample means.


# 2. Calculate the Welch standard error.


# 3. Calculate the Welch degrees of freedom.


# 4. Calculate the 95% confidence interval.


# 5. Interpret the interval.

`,
      hints: [
        'The Welch standard error is sqrt(s1^2/n1 + s2^2/n2).',
        'Use stats.t.ppf(0.975, df) to obtain the critical t-value.',
        'The interval is the estimated difference plus or minus the critical value multiplied by the standard error.'
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

df = (
    (var1 / n1 + var2 / n2) ** 2
) / (
    ((var1 / n1) ** 2 / (n1 - 1)) +
    ((var2 / n2) ** 2 / (n2 - 1))
)

critical_value = stats.t.ppf(0.975, df)

lower = mean_difference - critical_value * se
upper = mean_difference + critical_value * se

print("Mean difference:", round(mean_difference, 3))
print("Standard error:", round(se, 3))
print("Welch degrees of freedom:", round(df, 3))
print("95% confidence interval:", round(lower, 3), "to", round(upper, 3))

if lower <= 0 <= upper:
    print("The interval contains zero.")
else:
    print("The interval does not contain zero.")
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 5: Choose the appropriate test and defend your decision',
      body: `
        <p>Consider the following three business scenarios:</p>

        <ol>
          <li>TradeFlow compares delivery times from two different distribution centres. Each delivery belongs to only one centre.</li>
          <li>TradeFlow records the processing time of the same employees before and after training.</li>
          <li>TradeFlow compares average order values from two groups of customers who received different promotional offers. Each customer receives only one offer.</li>
        </ol>

        <p>For each scenario, identify whether the observations are independent or paired and select an appropriate statistical test.</p>

        <p>Then use Python to run the appropriate tests on the illustrative data below. The data are designed to demonstrate test selection, not to represent actual company results.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

# Scenario 1: two independent delivery-centre samples
centre_a = np.array([4.1, 4.5, 4.8, 4.4, 4.9, 4.6, 4.2, 4.7])
centre_b = np.array([5.0, 5.3, 5.1, 5.6, 5.2, 5.4, 5.0, 5.5])

# Scenario 2: the same employees before and after training
before = np.array([55, 52, 58, 61, 54, 57, 60, 53])
after = np.array([51, 50, 53, 57, 50, 54, 55, 51])

# Scenario 3: two independent customer groups
offer_a = np.array([120, 135, 128, 140, 125, 132, 138, 130])
offer_b = np.array([145, 150, 138, 155, 142, 148, 152, 146])

# 1. Run Welch's t-test for Scenario 1.


# 2. Run a paired t-test for Scenario 2.


# 3. Run Welch's t-test for Scenario 3.


# 4. Print and interpret the p-values.

`,
      hints: [
        'Scenarios 1 and 3 involve independent groups.',
        'Scenario 2 involves repeated measurements on the same employees.',
        'Use stats.ttest_ind(..., equal_var=False) for independent groups and stats.ttest_rel() for paired observations.'
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

scenario_1 = stats.ttest_ind(
    centre_a,
    centre_b,
    equal_var=False
)

scenario_2 = stats.ttest_rel(
    after,
    before
)

scenario_3 = stats.ttest_ind(
    offer_a,
    offer_b,
    equal_var=False
)

print("Scenario 1: Independent delivery-centre samples")
print("p-value:", round(scenario_1.pvalue, 4))

print("\\nScenario 2: Paired employee measurements")
print("p-value:", round(scenario_2.pvalue, 4))

print("\\nScenario 3: Independent customer groups")
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
  packages: ['pandas', 'numpy', 'scipy'],
  loopGuard: true,
  files: [],
  setup: `
import pandas as pd
import numpy as np
from scipy import stats

print("Statistics Module 5.4: Hypothesis tests for categorical data")
print("Required libraries loaded successfully.")
`,
  title: '5.4 Hypothesis tests for categorical data',
  intro: `
    <p>Not every business question concerns averages or numerical measurements. Many important questions involve categories, counts, and proportions.</p>

    <p>For example, TradeFlow might want to investigate:</p>
    <ul>
      <li>Whether delivery outcomes follow an expected distribution.</li>
      <li>Whether delivery status is associated with distribution centre.</li>
      <li>Whether payment method is related to order cancellation.</li>
      <li>Whether the proportion of successful deliveries differs from a target.</li>
    </ul>

    <p>These questions require methods designed for categorical data. In this lesson, we will study chi-square goodness-of-fit tests, chi-square tests of independence, and Fisher's exact test.</p>
  `,
  steps: [
    {
      type: 'explain',
      title: '1. Numerical data versus categorical data',
      body: `
        <p>Numerical variables represent measurable quantities, such as delivery time, revenue, or order value.</p>

        <p>Categorical variables represent groups or labels, such as:</p>
        <ul>
          <li>Delivery status: successful, delayed, or failed.</li>
          <li>Payment method: card, bank transfer, or cash.</li>
          <li>Distribution centre: Centre A, Centre B, or Centre C.</li>
          <li>Customer segment: retail, wholesale, or corporate.</li>
        </ul>

        <p>For categorical data, analysts often work with frequency counts. A frequency count tells us how many observations belong to each category.</p>

        <p>For example:</p>
        <table>
          <tr><th>Delivery status</th><th>Number of deliveries</th></tr>
          <tr><td>Successful</td><td>720</td></tr>
          <tr><td>Delayed</td><td>210</td></tr>
          <tr><td>Failed</td><td>70</td></tr>
        </table>

        <p>These counts can be used to evaluate whether an observed distribution is consistent with a proposed population distribution.</p>
      `
    },
    {
      type: 'explain',
      title: '2. The chi-square goodness-of-fit test',
      body: `
        <p>A chi-square goodness-of-fit test evaluates whether observed category frequencies differ from frequencies expected under a specified probability distribution.</p>

        <p>Suppose TradeFlow expects delivery outcomes to follow these proportions:</p>
        <ul>
          <li>Successful: 70%</li>
          <li>Delayed: 20%</li>
          <li>Failed: 10%</li>
        </ul>

        <p>If 1,000 deliveries are observed, the expected frequencies are:</p>
        <ul>
          <li>Successful: 700</li>
          <li>Delayed: 200</li>
          <li>Failed: 100</li>
        </ul>

        <p>The chi-square test statistic is:</p>
        <p><strong>χ² = Σ (O − E)² / E</strong></p>

        <p>Where O is an observed frequency and E is its expected frequency.</p>

        <p>The null hypothesis states that the population category proportions follow the specified distribution. The alternative hypothesis states that at least one category proportion differs.</p>

        <p>For a goodness-of-fit test with k categories and no parameters estimated from the sample, the degrees of freedom are:</p>
        <p><strong>df = k − 1</strong></p>

        <p>The test evaluates the overall distribution. A significant result does not automatically identify which category is responsible for the difference. Analysts should examine the observed and expected counts to understand where the discrepancies occur.</p>
      `
    },
    {
      type: 'try',
      title: 'Demonstration: testing an expected delivery distribution',
      body: `
        <p>Suppose TradeFlow observes 1,000 deliveries. We want to test whether the delivery outcome distribution matches the expected proportions of 70%, 20%, and 10%.</p>
      `,
      code: `
import numpy as np
from scipy import stats

observed = np.array([720, 210, 70])
expected_proportions = np.array([0.70, 0.20, 0.10])

total = observed.sum()
expected = total * expected_proportions

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
      title: '3. The chi-square test of independence',
      body: `
        <p>A chi-square test of independence evaluates whether two categorical variables are associated.</p>

        <p>Suppose TradeFlow wants to investigate whether delivery status is associated with distribution centre.</p>

        <p>We can organise the observations in a contingency table:</p>

        <table>
          <tr><th>Centre</th><th>Successful</th><th>Delayed</th><th>Failed</th></tr>
          <tr><td>A</td><td>180</td><td>45</td><td>15</td></tr>
          <tr><td>B</td><td>150</td><td>70</td><td>30</td></tr>
          <tr><td>C</td><td>190</td><td>45</td><td>15</td></tr>
        </table>

        <p>The null hypothesis states that the two categorical variables are independent. The alternative hypothesis states that they are associated.</p>

        <p>The expected count for each cell is calculated as:</p>
        <p><strong>Expected count = (Row total × Column total) / Grand total</strong></p>

        <p>The test then compares observed counts with expected counts using the chi-square statistic.</p>

        <p>For a contingency table with r rows and c columns, the degrees of freedom are:</p>
        <p><strong>df = (r − 1)(c − 1)</strong></p>

        <p>A significant result suggests an association, but it does not establish causation. It also does not tell us how strong the association is or which specific cells contribute most to it.</p>
      `
    },
    {
      type: 'try',
      title: 'Demonstration: testing whether centre and delivery status are associated',
      body: `
        <p>Use a contingency table to test whether delivery status and distribution centre are independent.</p>
      `,
      code: `
import numpy as np
from scipy import stats

table = np.array([
    [180, 45, 15],
    [150, 70, 30],
    [190, 45, 15]
])

chi2, p_value, degrees_freedom, expected = stats.chi2_contingency(
    table,
    correction=False
)

print("Observed counts:")
print(table)

print("\\nExpected counts:")
print(np.round(expected, 2))

print("\\nChi-square statistic:", round(chi2, 3))
print("Degrees of freedom:", degrees_freedom)
print("p-value:", round(p_value, 4))
      `
    },
    {
      type: 'explain',
      title: '4. Expected frequencies and the assumptions of the chi-square test',
      body: `
        <p>The chi-square approximation works best when expected cell frequencies are sufficiently large.</p>

        <p>A commonly used guideline is that expected counts should generally be at least 5 in each cell. More detailed rules allow some smaller expected counts, provided that very small expected frequencies are uncommon and none are extremely low.</p>

        <p>This is a guideline for evaluating the approximation, not an absolute law that makes every result with a count below 5 automatically invalid.</p>

        <p>Other important considerations include:</p>
        <ul>
          <li>Each observation should contribute to only one cell in the contingency table.</li>
          <li>Observations should be independent, unless a method designed for dependent data is used.</li>
          <li>Categories should be clearly defined and mutually exclusive.</li>
          <li>Expected counts should be calculated from the null hypothesis, not substituted with observed counts.</li>
        </ul>

        <p>If the expected counts are too small, a standard chi-square approximation may be unreliable. For a 2 × 2 contingency table, Fisher's exact test is often an appropriate alternative.</p>
      `
    },
    {
      type: 'explain',
      title: '5. Fisher’s exact test',
      body: `
        <p>Fisher's exact test evaluates the association between two categorical variables in a 2 × 2 contingency table.</p>

        <p>Unlike the chi-square test, which relies on an approximation, Fisher's exact test calculates probabilities from the possible tables under the null hypothesis, conditional on the observed row and column totals.</p>

        <p>Consider this illustrative table:</p>

        <table>
          <tr><th></th><th>Cancelled</th><th>Not cancelled</th></tr>
          <tr><td>Payment A</td><td>2</td><td>8</td></tr>
          <tr><td>Payment B</td><td>7</td><td>3</td></tr>
        </table>

        <p>The expected counts may be small, making Fisher's exact test useful.</p>

        <p>The test returns a p-value and an odds ratio. The odds ratio compares the odds of an outcome between two groups.</p>

        <p>An odds ratio of 1 indicates equal odds. An odds ratio above 1 indicates higher odds in the first group relative to the second, given the table's arrangement. An odds ratio below 1 indicates lower odds.</p>

        <p>Always inspect the order of rows and columns before interpreting the odds ratio. Reversing the groups or outcome categories changes its direction.</p>
      `
    },
    {
      type: 'explain',
      title: '6. Statistical association, strength, and business interpretation',
      body: `
        <p>A statistically significant chi-square test indicates evidence of an association between categorical variables. It does not tell us how strong the association is.</p>

        <p>For a contingency table, Cramér's V is a common measure of association strength:</p>

        <p><strong>V = √(χ² / (n × min(r − 1, c − 1)))</strong></p>

        <p>Where χ² is the chi-square statistic, n is the total sample size, r is the number of rows, and c is the number of columns.</p>

        <p>Cramér's V ranges from 0 to 1. Values closer to 0 indicate weaker association, while values closer to 1 indicate stronger association.</p>

        <p>Interpretation depends on the table dimensions and subject area. Do not treat universal cut-offs as definitive measures of business importance.</p>

        <p>For example, a statistically significant relationship between distribution centre and delivery status could be useful for identifying operational differences. But further investigation would be required to determine whether staffing, route complexity, shipment type, or other factors explain the relationship.</p>
      `
    },

    {
      type: 'exercise',
      title: 'Exercise 1: Perform a chi-square goodness-of-fit test',
      body: `
        <p>TradeFlow expects its deliveries to have the following outcome distribution:</p>
        <ul>
          <li>Successful: 65%</li>
          <li>Delayed: 25%</li>
          <li>Failed: 10%</li>
        </ul>

        <p>A sample of 500 deliveries produces these observed counts:</p>
        <ul>
          <li>Successful: 340</li>
          <li>Delayed: 115</li>
          <li>Failed: 45</li>
        </ul>

        <p>Use a chi-square goodness-of-fit test to determine whether the observed distribution differs from the expected distribution.</p>

        <p>Calculate the expected frequencies, test statistic, degrees of freedom, and p-value. Interpret the result at the 5% significance level.</p>
      `,
      starter: `
import numpy as np
from scipy import stats

observed = np.array([340, 115, 45])
expected_proportions = np.array([0.65, 0.25, 0.10])

# 1. Calculate the total number of observations.


# 2. Calculate the expected frequencies.


# 3. Run the chi-square goodness-of-fit test.


# 4. Print the statistic and p-value.


# 5. Interpret the result.

`,
      hints: [
        'The expected frequency is the total sample size multiplied by the expected proportion.',
        'Use stats.chisquare(f_obs=observed, f_exp=expected).',
        'There are three categories, so the degrees of freedom are 3 - 1.'
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

print("Total observations:", total)
print("Observed frequencies:", observed)
print("Expected frequencies:", expected)
print("Chi-square statistic:", round(result.statistic, 3))
print("Degrees of freedom:", len(observed) - 1)
print("p-value:", round(result.pvalue, 4))

if result.pvalue < 0.05:
    print("Reject H0: the observed distribution differs from the expected distribution.")
else:
    print("Fail to reject H0: there is insufficient evidence of a difference.")
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 2: Test for an association between two categorical variables',
      body: `
        <p>TradeFlow records delivery status across three distribution centres. Management wants to determine whether delivery status is associated with the distribution centre.</p>

        <p>The observed contingency table is provided below.</p>

        <p>Complete the following:</p>
        <ol>
          <li>Calculate the expected frequencies.</li>
          <li>Run the chi-square test of independence.</li>
          <li>Report the degrees of freedom and p-value.</li>
          <li>Interpret the result at the 5% significance level.</li>
        </ol>
      `,
      starter: `
import numpy as np
from scipy import stats

observed = np.array([
    [120, 30, 10],
    [100, 45, 15],
    [130, 25, 5]
])

# 1. Run the chi-square test of independence.


# 2. Display the expected frequencies.


# 3. Display the test statistic, degrees of freedom, and p-value.


# 4. Interpret the result.

`,
      hints: [
        'Use stats.chi2_contingency().',
        'The function returns the chi-square statistic, p-value, degrees of freedom, and expected frequencies.',
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
    print("Reject H0: there is evidence of an association.")
else:
    print("Fail to reject H0: there is insufficient evidence of an association.")
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 3: Inspect expected frequencies and evaluate test suitability',
      body: `
        <p>Before interpreting a chi-square test, an analyst should examine its expected frequencies.</p>

        <p>Consider this small contingency table showing cancellation status across two payment methods.</p>

        <p>Complete these tasks:</p>
        <ol>
          <li>Run a chi-square test of independence.</li>
          <li>Display the expected frequencies.</li>
          <li>Identify the smallest expected frequency.</li>
          <li>Evaluate whether the chi-square approximation is appropriate using the common expected-count guideline.</li>
          <li>Explain why a different test may be more suitable if expected frequencies are too small.</li>
        </ol>
      `,
      starter: `
import numpy as np
from scipy import stats

observed = np.array([
    [3, 7],
    [8, 2]
])

# 1. Run the chi-square test.


# 2. Display the expected frequencies.


# 3. Find the smallest expected frequency.


# 4. Evaluate whether the expected counts satisfy the common guideline.

`,
      hints: [
        'Use stats.chi2_contingency(observed, correction=False).',
        'Use np.min(expected) to find the smallest expected count.',
        'For a 2 × 2 table with small expected frequencies, consider Fisher\\'s exact test.'
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

smallest_expected = np.min(expected)

print("Expected frequencies:")
print(np.round(expected, 3))
print("Smallest expected frequency:", round(smallest_expected, 3))
print("Chi-square statistic:", round(chi2, 3))
print("p-value:", round(p_value, 4))

if smallest_expected < 5:
    print("Warning: at least one expected count is below 5.")
    print("The chi-square approximation may be unreliable.")
    print("Consider Fisher's exact test for this 2 x 2 table.")
else:
    print("All expected counts are at least 5.")
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 4: Apply Fisher’s exact test',
      body: `
        <p>TradeFlow investigates whether cancellation is associated with payment method. The sample is small, so some expected frequencies are low.</p>

        <p>Use Fisher's exact test on the following 2 × 2 contingency table:</p>

        <table>
          <tr><th></th><th>Cancelled</th><th>Not cancelled</th></tr>
          <tr><td>Payment A</td><td>2</td><td>8</td></tr>
          <tr><td>Payment B</td><td>7</td><td>3</td></tr>
        </table>

        <p>Complete these tasks:</p>
        <ol>
          <li>Run a two-sided Fisher's exact test.</li>
          <li>Report the odds ratio and p-value.</li>
          <li>Interpret the direction of the odds ratio using the table's row and column order.</li>
          <li>Explain whether there is sufficient evidence of an association at the 5% significance level.</li>
        </ol>
      `,
      starter: `
import numpy as np
from scipy import stats

table = np.array([
    [2, 8],
    [7, 3]
])

# 1. Run Fisher's exact test.


# 2. Print the odds ratio and p-value.


# 3. Interpret the result.

`,
      hints: [
        'Use stats.fisher_exact(table, alternative="two-sided").',
        'The first row is Payment A and the second row is Payment B.',
        'An odds ratio above 1 indicates higher odds for the first row relative to the second, based on the first column outcome.'
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
    print("The odds of the first-column outcome are higher in Payment A than Payment B.")
elif odds_ratio < 1:
    print("The odds of the first-column outcome are lower in Payment A than Payment B.")
else:
    print("The estimated odds are equal between the two payment methods.")

if p_value < 0.05:
    print("Reject H0: there is evidence of an association.")
else:
    print("Fail to reject H0: there is insufficient evidence of an association.")
      `,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 5: Measure and interpret association strength',
      body: `
        <p>A chi-square test can identify evidence of an association, but the p-value alone does not measure its strength.</p>

        <p>Use the contingency table below to:</p>
        <ol>
          <li>Run a chi-square test of independence.</li>
          <li>Calculate the total number of observations.</li>
          <li>Calculate Cramér's V.</li>
          <li>Interpret the p-value and Cramér's V separately.</li>
          <li>Explain why statistical association does not establish causation.</li>
        </ol>

        <p>Use the formula:</p>
        <p><strong>V = √(χ² / (n × min(r − 1, c − 1)))</strong></p>
      `,
      starter: `
import numpy as np
from scipy import stats

table = np.array([
    [150, 40, 10],
    [110, 60, 30],
    [140, 45, 15]
])

# 1. Run the chi-square test of independence.


# 2. Calculate the total sample size.


# 3. Determine the number of rows and columns.


# 4. Calculate Cramér's V.


# 5. Print and interpret the results.

`,
      hints: [
        'Use stats.chi2_contingency() to obtain the chi-square statistic and p-value.',
        'The sample size is the sum of all cells in the table.',
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
    print("There is evidence of an association between the variables.")
else:
    print("There is insufficient evidence of an association.")

print("Cramer's V describes the strength of the association.")
print("The result does not establish that one variable causes the other.")
      `,
      ordered: true
    }
  ]
});
