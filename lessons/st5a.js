LESSONS.push(
{
  id: 'st-5-1',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'matplotlib', 'scipy'],
  loopGuard: true,
  files: ['deliveries'],
  setup: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

deliveries = pd.read_csv("deliveries.csv")

deliveries["dispatch_date"] = pd.to_datetime(
    deliveries["dispatch_date"],
    errors="coerce"
)

deliveries["delivery_date"] = pd.to_datetime(
    deliveries["delivery_date"],
    errors="coerce"
)

deliveries["transit_days"] = (
    deliveries["delivery_date"] - deliveries["dispatch_date"]
).dt.days

transit = deliveries.loc[
    deliveries["transit_days"].notna()
    & (deliveries["transit_days"] >= 0),
    "transit_days"
].astype(float).reset_index(drop=True)

rng = np.random.default_rng(5101)
`,
  preloaded: ['deliveries', 'transit', 'rng'],
  title: '5.1 The logic of hypothesis testing',
  tables: [],
  intro: `In Module 4, we learned how to estimate population values and quantify uncertainty using confidence intervals and bootstrap methods. But business analysts face another important question: <b>when the data appear to disagree with a claim, is the difference meaningful evidence, or could it reasonably have occurred through ordinary sampling variation?</b><br><br>Imagine that TradeFlow's operations team claims that the average delivery time is five days. An analyst examines delivery records and obtains a sample mean of 5.4 days. Is that enough evidence to challenge the claim? Not necessarily. A sample mean will rarely equal a population mean exactly. The difference might simply reflect random variation.<br><br><b>Hypothesis testing</b> gives us a disciplined way to evaluate claims using sample evidence. In this lesson, you will learn how hypotheses are constructed, how test statistics measure disagreement with a claim, how p-values quantify evidence, and how analysts make decisions without confusing statistical significance with certainty.`,
  steps: [
    {
      type: 'explain',
      title: 'Why hypothesis testing exists: samples naturally vary',
      body: `<p>Suppose TradeFlow's operations director says that the population mean delivery time is five days. The analytics team takes a sample of deliveries and calculates its mean.</p>
<p>Even if the director's claim were exactly correct, the sample mean would not necessarily equal five. A different sample would probably produce a slightly different mean.</p>
<p>This is the same <b>sampling variability</b> you studied in Module 4. A statistic calculated from a sample changes from sample to sample, even when the underlying population parameter remains fixed.</p>
<p>That creates an important problem. If the sample mean is 5.3 days, is the difference from five days evidence that the population mean is different? Or is 5.3 a result that could reasonably occur when the population mean really is five?</p>
<p>Hypothesis testing answers this question by comparing the observed data with what we would expect to see if a particular population claim were true.</p>
<div class="callout analogy"><b>A useful way to think about it:</b> imagine a fair coin. Getting seven heads in ten tosses does not prove that the coin is unfair. A fair coin can produce seven heads by chance. But getting 700 heads in 1,000 tosses would be much harder to explain as ordinary random variation. The evidence depends not only on how far the result is from the claim, but also on how much variation we would expect.</div>
<p>Hypothesis testing is therefore not a search for any difference between a sample result and a claimed value. It is a method for judging whether the observed difference is unusually large relative to the variation expected under the claim.</p>
<p><b>The central question is:</b> if the claim were true, how surprising would the evidence we observed be?</p>`
    },
    {
      type: 'explain',
      title: 'The null hypothesis: the claim we evaluate',
      body: `<p>A hypothesis is a statement about a population parameter or probability distribution. In classical hypothesis testing, we begin by specifying two competing statements.</p>
<p>The first is the <b>null hypothesis</b>, written as H₀ (H-zero). It is the reference claim against which the sample evidence will be evaluated.</p>
<p>For TradeFlow's delivery-time example, let μ represent the true population mean delivery time. If the operations director claims that the mean is five days, we can write:</p>
<p><b>H₀: μ = 5 days</b></p>
<p>The symbol μ represents a population mean, not the mean of the particular sample we happened to collect. The null hypothesis is about the underlying process or population we want to understand.</p>
<p>Why do we start with this statement? Because we need a clear reference model. We calculate what kinds of sample results would be expected if the null hypothesis were true, and then compare our actual result with that reference.</p>
<p>The null hypothesis does not have to be a claim that nobody believes. It can represent a current standard, a benchmark, a claimed performance level, or a no-effect position.</p>
<table class="mini">
<tr><th>Business question</th><th>Possible null hypothesis</th></tr>
<tr><td>Is average delivery time five days?</td><td>H₀: μ = 5</td></tr>
<tr><td>Is the late-delivery rate 10%?</td><td>H₀: p = 0.10</td></tr>
<tr><td>Does a new process change average handling time?</td><td>H₀: μ<sub>new</sub> − μ<sub>old</sub> = 0</td></tr>
<tr><td>Are two payment methods equally successful?</td><td>H₀: p<sub>card</sub> − p<sub>mobile</sub> = 0</td></tr>
</table>
<p>Notice that the null hypothesis is normally written using equality. Equality gives us a precise reference value from which to derive the sampling distribution of a test statistic.</p>
<div class="callout watch"><b>Important:</b> the null hypothesis is not automatically true just because we begin by assuming it for the calculation. It is a working reference position. The evidence may or may not be strong enough to reject it.</div>`
    },
    {
      type: 'explain',
      title: 'The alternative hypothesis: what the evidence may support',
      body: `<p>The second statement is the <b>alternative hypothesis</b>, written as H₁ or Hₐ. It describes the direction or kind of difference we want the test to detect.</p>
<p>For the five-day delivery claim, there are three common possibilities.</p>
<table class="mini">
<tr><th>Alternative</th><th>Meaning</th><th>Test direction</th></tr>
<tr><td>Hₐ: μ ≠ 5</td><td>The population mean is different from five days</td><td>Two-sided</td></tr>
<tr><td>Hₐ: μ &gt; 5</td><td>The population mean is greater than five days</td><td>Right-sided</td></tr>
<tr><td>Hₐ: μ &lt; 5</td><td>The population mean is less than five days</td><td>Left-sided</td></tr>
</table>
<p>A <b>two-sided test</b> looks for evidence of a difference in either direction. It is appropriate when values that are either higher or lower than the benchmark would matter to the research question.</p>
<p>A <b>one-sided test</b> looks for evidence in one specified direction. For example, if the only question is whether delivery time exceeds five days, the alternative can be Hₐ: μ &gt; 5.</p>
<p>The direction must be chosen before examining the result. An analyst must not look at the sample, see which direction produces a smaller p-value, and then select that direction after the fact. Doing so changes the probability of a false positive and makes the reported test misleading.</p>
<div class="callout work"><b>TradeFlow example:</b> If management is concerned specifically about deliveries becoming slower, a right-sided test may match the operational question. If management wants to know whether the average has changed in either direction, a two-sided test is more appropriate.</div>
<p>There is also a subtle but important point: failing to find evidence that the mean is greater than five does not establish that the mean is five or less. A test can fail to detect a difference because the true difference is small, the sample is noisy, or the sample is not sufficiently informative.</p>`
    },
    {
      type: 'explain',
      title: 'Why the null hypothesis is treated as the reference',
      body: `<p>Classical hypothesis testing follows a particular logical structure:</p>
<ol>
<li>State the null and alternative hypotheses before analysing the result.</li>
<li>Temporarily assume the null hypothesis is true.</li>
<li>Determine how much sample-to-sample variation we would expect under that assumption.</li>
<li>Measure how far the observed sample result is from the null value.</li>
<li>Assess how unusual that result would be if the null hypothesis were true.</li>
<li>Decide whether the evidence is sufficiently inconsistent with the null hypothesis to reject it.</li>
</ol>
<p>This approach is sometimes compared with a legal trial. A court starts with a presumption of innocence and evaluates the evidence against that position. The evidence must be sufficiently strong before the presumption is rejected.</p>
<p>The analogy is useful, but it has limits. Statistical hypothesis testing does not establish truth in the same way that a court makes a legal decision. A statistical test quantifies evidence under a mathematical model and its assumptions. It does not prove that a hypothesis is true or false.</p>
<p>When we assume H₀ for the calculation, we are not claiming that H₀ is certainly true. We are asking a conditional question:</p>
<p><b>If H₀ were true, how unusual would our observed result be?</b></p>
<p>This conditional reasoning is the foundation of the p-value.</p>`
    },
    {
      type: 'explain',
      title: 'The test statistic: measuring disagreement with the null',
      body: `<p>We need a way to measure how far our observed result is from the value predicted by the null hypothesis. That is the job of a <b>test statistic</b>.</p>
<p>For a one-sample test of a population mean when the population standard deviation is unknown, the common test statistic is:</p>
<p><b>t = (x̄ − μ₀) / (s / √n)</b></p>
<ul>
<li><b>x̄:</b> the observed sample mean.</li>
<li><b>μ₀:</b> the population mean specified by the null hypothesis.</li>
<li><b>s:</b> the sample standard deviation.</li>
<li><b>n:</b> the sample size.</li>
<li><b>s / √n:</b> the estimated standard error of the sample mean.</li>
</ul>
<p>The numerator, x̄ − μ₀, is the difference between the observed sample mean and the null value. The denominator measures how much the sample mean would typically vary from sample to sample under the model.</p>
<p>The t-statistic therefore expresses the observed difference in standard-error units.</p>
<p>For example, a t-statistic of 2 means the sample mean is two estimated standard errors above the null value. A t-statistic of −2 means it is two estimated standard errors below the null value.</p>
<p>A value near zero means the sample mean is close to the null value relative to its estimated sampling variability. A large absolute value means the observed result is relatively far from the null value.</p>
<div class="callout analogy"><b>Think in standard-error units:</b> a difference of 0.5 days may be large if the standard error is 0.1 days, but small if the standard error is 2 days. The raw difference alone does not tell us how surprising the result is.</div>
<p>This is why test statistics combine the observed difference with a measure of uncertainty. They help distinguish a large difference with high uncertainty from a smaller difference measured very precisely.</p>`
    },
    {
      type: 'try',
      title: 'Calculate a test statistic by hand',
      body: `<p>Use the observed TradeFlow delivery-time records to calculate the sample mean, sample standard deviation, standard error and t-statistic for the null hypothesis that the population mean is five days.</p>
<p>We use all valid recorded transit durations in the available dataset. The five-day value is an illustrative benchmark for teaching; it is not being presented as TradeFlow's verified service-level agreement.</p>
<p>Read the calculation carefully:</p>
<ul>
<li><code>transit.mean()</code> calculates the observed sample mean.</li>
<li><code>transit.std(ddof=1)</code> calculates the sample standard deviation using n−1 in the denominator.</li>
<li><code>np.sqrt(n)</code> calculates the square root of the sample size.</li>
<li><code>(x_bar - mu_0) / standard_error</code> expresses the observed difference in standard-error units.</li>
</ul>
<p>The sign tells us the direction of the difference. The absolute value tells us its distance from zero in standard-error units.</p>`,
      code: `sample = transit.to_numpy()

n = len(sample)
x_bar = sample.mean()
s = sample.std(ddof=1)

mu_0 = 5
standard_error = s / np.sqrt(n)

t_statistic = (x_bar - mu_0) / standard_error

print("Sample size:", n)
print("Sample mean:", round(x_bar, 4))
print("Sample standard deviation:", round(s, 4))
print("Standard error:", round(standard_error, 4))
print("t-statistic:", round(t_statistic, 4))`
    },
    {
      type: 'explain',
      title: 'The null distribution: what results would look like if H₀ were true',
      body: `<p>A test statistic has a probability distribution under the null hypothesis. This is called its <b>null distribution</b>.</p>
<p>For a one-sample t-test, when the observations are independent and the population is normally distributed—or when the sample is sufficiently large for the approximation to be reliable—the test statistic follows a Student's t distribution with n−1 degrees of freedom under H₀.</p>
<p>Why do we need this distribution? Because the test statistic alone is not yet a probability. A t-statistic of 2.1 does not tell us, by itself, whether the evidence is unusual. We need to know how frequently values that far from zero would occur under the null model.</p>
<p>The Student's t distribution resembles the standard normal distribution but has heavier tails, particularly when the sample is small. Those heavier tails account for the extra uncertainty introduced by estimating the population standard deviation using the sample standard deviation.</p>
<p>As the degrees of freedom increase, the t distribution becomes closer to the standard normal distribution.</p>
<p>For a one-sample t-test:</p>
<p><b>Degrees of freedom = n − 1</b></p>
<p>The degrees of freedom describe how much independent information remains after estimating the sample mean. The n−1 result arises because the deviations from the sample mean must sum to zero, so only n−1 of them can vary independently.</p>
<p>The null distribution is not the distribution of the original delivery observations. It is the distribution of the <b>test statistic</b> that would arise across repeated samples if the null hypothesis were true.</p>`
    },
    {
      type: 'explain',
      title: 'The p-value: measuring how unusual the evidence is',
      body: `<p>The <b>p-value</b> is the probability, assuming the null hypothesis and the test's assumptions are true, of obtaining a test statistic at least as extreme as the one observed, in the direction or directions specified by the alternative hypothesis.</p>
<p>For a two-sided test, “at least as extreme” means a test statistic at least as far from zero in either direction. For a right-sided test, it means a value at least as large as the observed statistic. For a left-sided test, it means a value at least as small.</p>
<p>A small p-value means that the observed result would be relatively unusual if the null hypothesis were true. A large p-value means the result is not particularly unusual under the null model.</p>
<p>For a two-sided t-test, the p-value can be calculated from the t distribution:</p>
<p><b>p = 2 × P(T ≥ |t observed|)</b></p>
<p>The factor of two accounts for extreme results in both tails of the distribution.</p>
<p>In SciPy, <code>stats.t.sf()</code> calculates a survival probability: the probability of observing a value greater than a specified point. We use it to calculate the upper-tail probability and multiply by two for a two-sided test.</p>
<div class="callout watch"><b>One of the most important rules in statistics:</b> the p-value is NOT the probability that the null hypothesis is true. It is calculated under the assumption that the null hypothesis is true. It also does not tell us the probability that the result occurred “by chance” in the everyday sense.</div>
<p>A p-value of 0.03 means that, under the null hypothesis and the model assumptions, results at least as extreme as the observed result would occur about 3% of the time in repeated samples. It does not mean there is a 3% probability that H₀ is true.</p>`
    },
    {
      type: 'try',
      title: 'Calculate a two-sided p-value',
      body: `<p>Use the t-statistic calculated from the available delivery records. The test evaluates H₀: μ = 5 against Hₐ: μ ≠ 5.</p>
<p><code>stats.t.sf()</code> calculates the upper-tail probability of the t distribution. We pass the absolute value of the test statistic because a two-sided test considers extreme values in either direction.</p>
<p><code>df = n - 1</code> supplies the degrees of freedom. Multiplying the one-tail probability by two gives the two-sided p-value.</p>
<p>We also use <code>stats.ttest_1samp()</code> as a software cross-check. The manually calculated p-value and SciPy's result should agree apart from tiny numerical differences.</p>`,
      code: `sample = transit.to_numpy()

n = len(sample)
x_bar = sample.mean()
s = sample.std(ddof=1)

mu_0 = 5
se = s / np.sqrt(n)
t_statistic = (x_bar - mu_0) / se
df = n - 1

p_value_manual = 2 * stats.t.sf(
    abs(t_statistic),
    df=df
)

test_result = stats.ttest_1samp(
    sample,
    popmean=mu_0
)

print("Manual t-statistic:", round(t_statistic, 5))
print("Manual two-sided p-value:", p_value_manual)
print("SciPy t-statistic:", test_result.statistic)
print("SciPy p-value:", test_result.pvalue)`
    },
    {
      type: 'explain',
      title: 'The significance level: deciding how much evidence is enough',
      body: `<p>Before conducting a test, analysts often choose a <b>significance level</b>, written as α (alpha).</p>
<p>The significance level is the maximum probability of a Type I error that the test procedure is designed to tolerate under its assumptions. A Type I error occurs when we reject a null hypothesis that is actually true.</p>
<p>A common choice is α = 0.05. This means the analyst is using a procedure designed to have a 5% Type I error rate in the long run when the null hypothesis is true and the test assumptions hold.</p>
<p>The conventional decision rule is:</p>
<ul>
<li>If p-value ≤ α, reject H₀.</li>
<li>If p-value &gt; α, fail to reject H₀.</li>
</ul>
<p>Suppose α = 0.05:</p>
<table class="mini">
<tr><th>p-value</th><th>Decision</th><th>Interpretation</th></tr>
<tr><td>0.002</td><td>Reject H₀</td><td>Strong evidence against the null model</td></tr>
<tr><td>0.031</td><td>Reject H₀</td><td>Evidence is statistically significant at 5%</td></tr>
<tr><td>0.049</td><td>Reject H₀</td><td>Just below the chosen threshold</td></tr>
<tr><td>0.051</td><td>Fail to reject H₀</td><td>Does not meet the chosen threshold</td></tr>
<tr><td>0.420</td><td>Fail to reject H₀</td><td>Not unusual under the null model</td></tr>
</table>
<p>The difference between 0.049 and 0.051 is not scientifically dramatic. The threshold creates a decision rule, but evidence does not suddenly become fundamentally different when a p-value crosses 0.05.</p>
<p>For this reason, responsible analysts report the exact p-value, effect estimate and uncertainty interval rather than reporting only “significant” or “not significant.”</p>
<div class="callout watch"><b>Failing to reject is not accepting:</b> when p &gt; α, we have not obtained sufficiently strong evidence to reject H₀ using the chosen procedure. We have not proved H₀ true, and we have not shown that the population parameter exactly equals the null value.</div>`
    },
    {
      type: 'explain',
      title: 'One-sided and two-sided p-values',
      body: `<p>The alternative hypothesis determines which parts of the null distribution count as evidence against H₀.</p>
<p>Suppose the null value is five days and the observed sample mean is above five.</p>
<ul>
<li><b>Two-sided test:</b> counts results at least as far from five in either direction.</li>
<li><b>Right-sided test:</b> counts results at least as high as the observed result.</li>
<li><b>Left-sided test:</b> counts results at least as low as the observed result.</li>
</ul>
<p>If the test statistic is positive, the right-sided p-value is the upper-tail probability. The two-sided p-value is twice that probability when the t distribution is symmetric.</p>
<p>If the test statistic is negative, the left-sided p-value is the lower-tail probability. The two-sided p-value is twice that probability.</p>
<p>One-sided tests can be more powerful for detecting an effect in the specified direction, but they cannot be used as a convenient way to obtain a smaller p-value after seeing the data. The direction must be justified by the research question and specified before examining the result.</p>
<p>There is also a practical issue. If an analyst uses a right-sided test because only slower delivery times matter, a result showing significantly faster delivery times does not count as evidence against the null under that test. That may be appropriate for the stated question, but it would be inappropriate if the actual business question was whether delivery times had changed in either direction.</p>`
    },
    {
      type: 'try',
      title: 'Compare one-sided and two-sided p-values',
      body: `<p>Calculate three p-values from the same t-statistic: a right-sided p-value, a left-sided p-value and a two-sided p-value.</p>
<p>The null hypothesis is H₀: μ = 5. The alternative determines which tail is used. We do not change the observed data or test statistic; only the research question changes.</p>
<p>For a t distribution, <code>stats.t.cdf()</code> calculates the lower-tail probability and <code>stats.t.sf()</code> calculates the upper-tail probability.</p>
<p>Compare the three values and explain why the two-sided p-value is not always exactly twice the right-sided p-value. It is twice the smaller tail only when the observed statistic is on the corresponding side and the distribution is symmetric.</p>`,
      code: `sample = transit.to_numpy()

n = len(sample)
x_bar = sample.mean()
s = sample.std(ddof=1)
mu_0 = 5

t_statistic = (x_bar - mu_0) / (s / np.sqrt(n))
df = n - 1

p_right = stats.t.sf(t_statistic, df=df)
p_left = stats.t.cdf(t_statistic, df=df)
p_two_sided = 2 * stats.t.sf(abs(t_statistic), df=df)

print("t-statistic:", round(t_statistic, 5))
print("Right-sided p-value:", p_right)
print("Left-sided p-value:", p_left)
print("Two-sided p-value:", p_two_sided)`
    },
    {
      id: 'st-5-1-c1',
      type: 'check',
      title: 'What does a p-value of 0.03 mean?',
      body: `<p>Assume the test was correctly specified and its assumptions hold.</p>`,
      options: [
        'There is a 3% probability that the null hypothesis is true',
        'There is a 3% probability that the alternative hypothesis is true',
        'If the null hypothesis were true, results at least as extreme as the observed result would occur about 3% of the time under the test model',
        'There is a 97% probability that the sample result will be repeated'
      ],
      answer: 2,
      why: [
        'A p-value is not the probability that the null hypothesis is true.',
        'A p-value does not directly calculate the probability that the alternative hypothesis is true.',
        'Correct. The p-value is a conditional probability calculated under the null hypothesis and the test assumptions.',
        'A p-value does not predict the probability that a future sample will reproduce the observed result.'
      ]
    },
    {
      id: 'st-5-1-c2',
      type: 'check',
      title: 'Why must the alternative hypothesis be chosen before looking at the result?',
      body: `<p>Consider an analyst who is free to choose either a left-sided or right-sided test after seeing the sample mean.</p>`,
      options: [
        'Because the sample mean cannot be calculated until the alternative is selected',
        'Because choosing the direction after seeing the data can inflate the false-positive rate and make the p-value misleading',
        'Because one-sided tests are always invalid',
        'Because the null hypothesis changes whenever the sample mean changes'
      ],
      answer: 1,
      why: [
        'The sample mean can be calculated independently of the alternative hypothesis.',
        'Correct. Selecting the most favourable direction after inspecting the data changes the testing procedure and can increase the chance of a false positive.',
        'One-sided tests can be valid when the research question justifies a directional alternative in advance.',
        'The null hypothesis is a statement about a population parameter, not a value that changes with each sample.'
      ]
    },
    {
      type: 'check',
      id: 'st-5-1-c3',
      title: 'A test produces p = 0.12 with α = 0.05. What is the correct conclusion?',
      body: `<p>Use the conventional significance decision rule.</p>`,
      options: [
        'Accept that the null hypothesis is definitely true',
        'Reject the null hypothesis because 12% is greater than 5%',
        'Fail to reject the null hypothesis because the p-value exceeds the significance level',
        'Conclude that the alternative hypothesis has a 12% probability of being true'
      ],
      answer: 2,
      why: [
        'Failing to reject does not prove the null hypothesis true.',
        'The conventional rule rejects when the p-value is less than or equal to alpha, not greater.',
        'Correct. The evidence does not meet the chosen 5% significance threshold.',
        'A p-value is not the probability that the alternative hypothesis is true.'
      ]
    },
    {
      type: 'exercise',
      id: 'st-5-1-ex1',
      title: 'Your turn: write the hypotheses for a business question',
      body: `<p>TradeFlow's operations team wants to know whether the population mean delivery time differs from five days.</p>
<p>Write the null hypothesis as <code>H0</code> and the alternative hypothesis as <code>Ha</code>. Store each as a string and print them.</p>
<p>This is a two-sided research question because the team wants to detect either slower or faster average delivery times. Do not use the observed sample mean to choose the direction.</p>`,
      starter: `# Write the null and alternative hypotheses as strings.
# Then print both statements.`,
      hints: [
        'The null hypothesis uses equality. The alternative uses not-equal because either direction matters.',
        'H0 = "mu = 5 days"\nHa = "mu != 5 days"\nprint("Null hypothesis:", H0)\nprint("Alternative hypothesis:", Ha)'
      ],
      solution: `H0 = "mu = 5 days"
Ha = "mu != 5 days"

print("Null hypothesis:", H0)
print("Alternative hypothesis:", Ha)`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-1-ex2',
      title: 'Your turn: calculate a one-sample t-statistic',
      body: `<p>Use the available valid delivery-time observations. Test the benchmark μ₀ = 5 days by calculating the sample mean, sample standard deviation, standard error and t-statistic.</p>
<p>Store the test statistic as <code>t_stat</code> and print it to four decimal places. Use <code>ddof=1</code> when calculating the sample standard deviation.</p>
<p>Your solution must calculate the statistic from the data, not type in a result from the lesson demonstration.</p>`,
      starter: `# Calculate the one-sample t-statistic from transit.
# Store it as t_stat.`,
      hints: [
        'Convert transit to a NumPy array, calculate its mean and sample standard deviation, then divide the difference from five by the standard error.',
        'sample = transit.to_numpy()\nn = len(sample)\nx_bar = sample.mean()\ns = sample.std(ddof=1)\nse = s / np.sqrt(n)\nt_stat = (x_bar - 5) / se\nprint("t-statistic:", round(t_stat, 4))'
      ],
      solution: `sample = transit.to_numpy()
n = len(sample)
x_bar = sample.mean()
s = sample.std(ddof=1)
se = s / np.sqrt(n)
t_stat = (x_bar - 5) / se

print("t-statistic:", round(t_stat, 4))`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-1-ex3',
      title: 'Your turn: calculate a two-sided p-value',
      body: `<p>Calculate the two-sided p-value for the one-sample t-test of H₀: μ = 5 days using the available delivery-time observations.</p>
<p>Store the result as <code>p_value</code>. Use the Student's t distribution with n−1 degrees of freedom. Print the p-value without rounding it so that you can inspect its precision.</p>
<p>Remember: the two-sided test counts extreme results in both tails.</p>`,
      starter: `# Calculate the t-statistic and its two-sided p-value.
# Store the p-value as p_value.`,
      hints: [
        'Calculate t_stat and df first. Then use the survival function at abs(t_stat), multiplied by two.',
        'sample = transit.to_numpy()\nn = len(sample)\nt_stat = (sample.mean() - 5) / (sample.std(ddof=1) / np.sqrt(n))\ndf = n - 1\np_value = 2 * stats.t.sf(abs(t_stat), df=df)\nprint("Two-sided p-value:", p_value)'
      ],
      solution: `sample = transit.to_numpy()
n = len(sample)
t_stat = (sample.mean() - 5) / (
    sample.std(ddof=1) / np.sqrt(n)
)
df = n - 1

p_value = 2 * stats.t.sf(abs(t_stat), df=df)

print("Two-sided p-value:", p_value)`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-1-ex4',
      title: 'Your turn: apply a significance level',
      body: `<p>Use the two-sided p-value for the test of μ = 5 days. Compare it with a significance level of 0.05.</p>
<p>Store the significance level as <code>alpha</code>. Store the decision as <code>decision</code>, using the exact text <code>"Reject H0"</code> or <code>"Fail to reject H0"</code>. Print both the p-value and the decision.</p>
<p>Do not use the word “accept” when the p-value exceeds alpha. A failure to reject does not prove that the null hypothesis is true.</p>`,
      starter: `# Calculate the p-value, then apply alpha = 0.05.
# Store the decision as decision.`,
      hints: [
        'Calculate the two-sided p-value first. Then compare it with alpha using <=.',
        'sample = transit.to_numpy()\nn = len(sample)\nt_stat = (sample.mean() - 5) / (sample.std(ddof=1) / np.sqrt(n))\np_value = 2 * stats.t.sf(abs(t_stat), df=n - 1)\nalpha = 0.05\nif p_value <= alpha:\n    decision = "Reject H0"\nelse:\n    decision = "Fail to reject H0"\nprint("p-value:", p_value)\nprint("Decision:", decision)'
      ],
      solution: `sample = transit.to_numpy()
n = len(sample)
t_stat = (sample.mean() - 5) / (
    sample.std(ddof=1) / np.sqrt(n)
)
p_value = 2 * stats.t.sf(abs(t_stat), df=n - 1)

alpha = 0.05

if p_value <= alpha:
    decision = "Reject H0"
else:
    decision = "Fail to reject H0"

print("p-value:", p_value)
print("Decision:", decision)`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-1-ex5',
      title: 'Your turn: compare one-sided and two-sided evidence',
      body: `<p>Calculate the right-sided and two-sided p-values for the test of H₀: μ = 5 days. Store them as <code>p_right</code> and <code>p_two</code>.</p>
<p>Use the same sample and test statistic for both calculations. Print both values and explain in a Python comment which research question each test answers.</p>
<p>The right-sided alternative is Hₐ: μ &gt; 5. The two-sided alternative is Hₐ: μ ≠ 5.</p>`,
      starter: `# Calculate both p-values from the same t-statistic.
# Add a comment explaining each alternative.`,
      hints: [
        'Use stats.t.sf(t_stat, df) for the right tail and twice stats.t.sf(abs(t_stat), df) for the two-sided test.',
        'sample = transit.to_numpy()\nn = len(sample)\nt_stat = (sample.mean() - 5) / (sample.std(ddof=1) / np.sqrt(n))\ndf = n - 1\np_right = stats.t.sf(t_stat, df=df)\np_two = 2 * stats.t.sf(abs(t_stat), df=df)\nprint("Right-sided:", p_right)\nprint("Two-sided:", p_two)'
      ],
      solution: `sample = transit.to_numpy()
n = len(sample)
t_stat = (sample.mean() - 5) / (
    sample.std(ddof=1) / np.sqrt(n)
)
df = n - 1

# Right-sided: tests whether the population mean exceeds five days.
p_right = stats.t.sf(t_stat, df=df)

# Two-sided: tests whether the population mean differs from five days.
p_two = 2 * stats.t.sf(abs(t_stat), df=df)

print("Right-sided:", p_right)
print("Two-sided:", p_two)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What a hypothesis test can—and cannot—tell management',
      body: `<p>A hypothesis test provides evidence relative to a specified null model. It does not produce a final business decision automatically.</p>
<p>Suppose a test rejects H₀: μ = 5 days. The statistical conclusion is that the sample provides evidence against the claim that the population mean is five days, under the assumptions of the test.</p>
<p>That conclusion does not tell management:</p>
<ul>
<li>Whether the difference is large enough to matter financially.</li>
<li>Whether the difference was caused by a new policy or operational change.</li>
<li>Whether every country, warehouse or delivery category has the same pattern.</li>
<li>Whether the result will continue in future months.</li>
<li>Whether the sample was representative of the target population.</li>
</ul>
<p>A small p-value can accompany a very small effect when the sample is large. A large p-value can accompany a practically important effect when the sample is small or highly variable.</p>
<p>That is why statistical significance must be considered alongside the estimated effect size, confidence interval, sample design, data quality and business consequences.</p>
<p>In the next lesson, we will put these ideas into practice using formal tests for a population mean and a population proportion.</p>`
    }
  ]
}
);

LESSONS.push(
{
  id: 'st-5-2',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'matplotlib', 'scipy'],
  loopGuard: true,
  files: ['deliveries'],
  setup: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

deliveries = pd.read_csv("deliveries.csv")

deliveries["dispatch_date"] = pd.to_datetime(
    deliveries["dispatch_date"],
    errors="coerce"
)

deliveries["delivery_date"] = pd.to_datetime(
    deliveries["delivery_date"],
    errors="coerce"
)

deliveries["transit_days"] = (
    deliveries["delivery_date"] - deliveries["dispatch_date"]
).dt.days

transit = deliveries.loc[
    deliveries["transit_days"].notna()
    & (deliveries["transit_days"] >= 0),
    "transit_days"
].astype(float).reset_index(drop=True)

rng = np.random.default_rng(5202)
`,
  preloaded: ['deliveries', 'transit', 'rng'],
  title: '5.2 Testing claims about a population',
  tables: [],
  intro: `In Lesson 5.1, you learned the logic of hypothesis testing: state a claim, calculate a test statistic, measure how unusual the evidence would be under the null hypothesis, and apply a decision rule. Now we will carry out formal tests on two kinds of population parameters.<br><br>First, we will test a claim about a <b>population mean</b> using a one-sample t-test. Then we will test a claim about a <b>population proportion</b> using an exact binomial test. These methods answer different kinds of questions, and choosing the correct one depends on the variable and parameter being studied.<br><br>Throughout the lesson, we will distinguish the mathematical result from the business interpretation. A statistically significant result is evidence against a specified null hypothesis; it is not automatically proof of a business problem, a causal explanation or a practically important effect.`,
  steps: [
    {
      type: 'explain',
      title: 'Choose the test based on the parameter you are investigating',
      body: `<p>Before selecting a statistical test, identify the population parameter in the research question. The test must match the type of quantity being studied.</p>
<table class="mini">
<tr><th>Question</th><th>Parameter</th><th>Typical test</th></tr>
<tr><td>Is average delivery time five days?</td><td>Population mean μ</td><td>One-sample t-test</td></tr>
<tr><td>Is the proportion of deliveries within five days 80%?</td><td>Population proportion p</td><td>One-proportion test</td></tr>
<tr><td>Is the average delivery time different between two independent groups?</td><td>Difference in population means</td><td>Independent-samples t-test</td></tr>
<tr><td>Did the same warehouses improve after a change?</td><td>Mean of paired differences</td><td>Paired t-test</td></tr>
</table>
<p>A mean describes the average value of a numerical variable. A proportion describes the share of observations that satisfy a binary condition.</p>
<p>For example, delivery time in days is numerical, so a question about its average concerns μ. Whether a delivery took five days or less is a yes/no outcome, so a question about the share meeting that threshold concerns p.</p>
<p>Do not choose a test because its name looks familiar. Start with the research question, identify the parameter, and then choose a method whose assumptions match the data and sampling design.</p>
<div class="callout work"><b>TradeFlow example:</b> “Is the average delivery time different from five days?” is a question about a mean. “Is at least 80% of eligible deliveries completed within five days?” is a question about a proportion. These are not interchangeable analyses, even though they use the same delivery records.</div>`
    },
    {
      type: 'explain',
      title: 'The one-sample t-test: testing a population mean',
      body: `<p>A <b>one-sample t-test</b> evaluates whether the population mean is equal to a specified reference value.</p>
<p>For the delivery-time example, we can define:</p>
<ul>
<li>H₀: μ = 5 days</li>
<li>Hₐ: μ ≠ 5 days</li>
</ul>
<p>The test statistic is:</p>
<p><b>t = (x̄ − μ₀) / (s / √n)</b></p>
<p>The statistic compares the difference between the observed sample mean and the hypothesised population mean with the estimated standard error of the sample mean.</p>
<p>We use the t distribution rather than the standard normal distribution because the population standard deviation σ is generally unknown. We estimate it using the sample standard deviation s, which introduces additional uncertainty.</p>
<p>The test has n−1 degrees of freedom. Under the null hypothesis and the model assumptions, the t-statistic follows a Student's t distribution with those degrees of freedom.</p>
<p>In SciPy, <code>stats.ttest_1samp()</code> performs this calculation. Its <code>popmean</code> argument is the value specified by the null hypothesis. The function returns a result containing the test statistic and p-value.</p>
<p>The function does not decide whether the result matters to TradeFlow. It calculates the statistical evidence under the test model. The analyst remains responsible for checking assumptions and interpreting the result.</p>`
    },
    {
      type: 'explain',
      title: 'Assumptions of the one-sample t-test',
      body: `<p>A statistical test is not automatically valid just because Python returns a p-value. We must consider whether the assumptions behind the method are reasonable.</p>
<p>The main assumptions and conditions for a conventional one-sample t-test are:</p>
<ol>
<li><b>Quantitative observations:</b> the variable should be numerical and meaningful for calculating a mean. Delivery time in days is numerical.</li>
<li><b>Independence:</b> observations should be independent, or the sampling design must be accounted for. If several deliveries are affected by the same warehouse outage, they may share a common cause and be correlated.</li>
<li><b>Representative sampling:</b> the sample should provide a defensible basis for learning about the target population. A large convenience sample can still be biased.</li>
<li><b>Distributional condition:</b> for a small sample, the population distribution of the observations should be reasonably close to normal and should not contain severe outliers. With larger samples, the sampling distribution of the mean often becomes more nearly normal, but extreme skewness, dependence and influential observations still deserve attention.</li>
</ol>
<p>The t-test is reasonably robust to moderate departures from normality in many settings, particularly with larger samples. That does not mean that sample size makes every problem disappear.</p>
<p>For example, if a dataset contains only deliveries that were completed and excludes deliveries still in transit, the resulting mean describes completed deliveries in the extract. It may not describe the average time for all orders initiated during the same period.</p>
<div class="callout watch"><b>TradeFlow data limitation:</b> the dataset contains deliveries without a recorded delivery date. The variable <code>transit</code> includes only records with valid dispatch and delivery dates and nonnegative transit times. Any inference from this variable must be described as applying to the eligible recorded deliveries, not automatically to every order or every delivery attempt.</div>`
    },
    {
      type: 'try',
      title: 'Run a one-sample t-test on delivery times',
      body: `<p>Test whether the mean transit time among eligible recorded deliveries differs from the illustrative five-day benchmark.</p>
<p>We specify a two-sided alternative because we want to detect either an increase or a decrease in the population mean.</p>
<p><b>Python connection:</b></p>
<ul>
<li><code>transit.to_numpy()</code> converts the Pandas Series into a NumPy array.</li>
<li><code>stats.ttest_1samp()</code> runs the one-sample t-test.</li>
<li><code>popmean=5</code> supplies the reference value in the null hypothesis.</li>
<li><code>alternative="two-sided"</code> asks whether the population mean differs in either direction.</li>
<li><code>result.statistic</code> retrieves the t-statistic.</li>
<li><code>result.pvalue</code> retrieves the p-value.</li>
</ul>
<p>We also calculate the sample mean and the difference from the benchmark. These are important because a p-value alone does not tell management the size or direction of the observed difference.</p>`,
      code: `sample = transit.to_numpy()

result = stats.ttest_1samp(
    sample,
    popmean=5,
    alternative="two-sided"
)

sample_mean = sample.mean()
difference = sample_mean - 5

print("Sample size:", len(sample))
print("Sample mean:", round(sample_mean, 4), "days")
print("Difference from benchmark:", round(difference, 4), "days")
print("t-statistic:", round(result.statistic, 5))
print("p-value:", result.pvalue)`
    },
    {
      type: 'explain',
      title: 'Interpret the test without overstating the conclusion',
      body: `<p>Suppose the p-value from a test is smaller than the chosen significance level of 0.05. The conventional decision is to reject H₀.</p>
<p>A careful interpretation would be:</p>
<p><b>“The observed delivery-time data provide statistically significant evidence that the population mean transit time among the target population differs from five days, under the assumptions of the one-sample t-test.”</b></p>
<p>That sentence is deliberately precise. It identifies the evidence, the parameter, the direction covered by the alternative, the reference value and the assumptions.</p>
<p>It does not say that every delivery takes more than five days. It does not say that the process is inefficient. It does not establish why the mean differs from five days.</p>
<p>If the p-value is greater than 0.05, the appropriate conclusion is that the test did not provide sufficient evidence to reject H₀ at the 5% level. It is not correct to claim that the mean has been proved equal to five days.</p>
<p>In either case, report the observed sample mean and its difference from the benchmark. An estimate of 5.02 days and an estimate of 7.00 days may both produce statistically significant tests in sufficiently large samples, but they have very different operational implications.</p>
<div class="callout work"><b>Analyst's responsibility:</b> translate the statistical result into a business statement without adding a causal explanation or an operational conclusion that the test did not establish.</div>`
    },
    {
      type: 'explain',
      title: 'Testing a population proportion',
      body: `<p>Now consider a different question: is 80% of TradeFlow's eligible recorded deliveries completed within five days?</p>
<p>This is not a question about the average number of days. It is a question about the proportion of observations meeting a yes/no condition.</p>
<p>Define a success as a recorded delivery with a transit time of five days or less. For each eligible delivery:</p>
<ul>
<li>Success = 1 if transit time is at most five days.</li>
<li>Failure = 0 if transit time is greater than five days.</li>
</ul>
<p>If x successes are observed among n eligible deliveries, the sample proportion is:</p>
<p><b>p̂ = x / n</b></p>
<p>To test a benchmark of 80%, the hypotheses can be:</p>
<ul>
<li>H₀: p = 0.80</li>
<li>Hₐ: p ≠ 0.80</li>
</ul>
<p>The observed count of successes is modelled using a binomial distribution when observations are independent and each observation has the same success probability p.</p>
<p>Under H₀, the number of successes X follows:</p>
<p><b>X ~ Binomial(n, 0.80)</b></p>
<p>This gives us a direct way to calculate how unusual the observed number of successes would be if the population proportion were really 80%.</p>
<p>The 80% target is an illustrative teaching benchmark. It should not be interpreted as a verified TradeFlow service commitment.</p>`
    },
    {
      type: 'explain',
      title: 'The exact binomial test',
      body: `<p>For a one-proportion hypothesis test, one option is the <b>exact binomial test</b>.</p>
<p>Under the null hypothesis, the probability of observing exactly x successes out of n independent trials is:</p>
<p><b>P(X = x) = C(n, x) p₀ˣ (1 − p₀)ⁿ⁻ˣ</b></p>
<p>Here:</p>
<ul>
<li><b>n:</b> the number of eligible observations.</li>
<li><b>x:</b> the number of observed successes.</li>
<li><b>p₀:</b> the success probability specified by H₀.</li>
<li><b>C(n, x):</b> the number of ways to choose x successes from n observations.</li>
</ul>
<p>The exact binomial test uses the binomial distribution to calculate a p-value for the observed count. It does not rely on the normal approximation to the sampling distribution of the sample proportion.</p>
<p>In SciPy, <code>stats.binomtest()</code> performs this test. We provide the observed success count, total number of observations, hypothesised probability and alternative direction.</p>
<p>The exact method is particularly useful when the sample is small or the hypothesised proportion is near zero or one, where a simple normal approximation may be unreliable.</p>
<p>For very large samples, exact calculations can be computationally more demanding, and the difference between exact and suitable approximate methods may be small. The choice should be based on the problem and the required accuracy.</p>
<div class="callout watch"><b>Independence still matters:</b> the word “exact” refers to the probability calculation under the binomial model. It does not mean the test is immune to biased sampling, clustered observations, changing success probabilities or other violations of the model.</div>`
    },
    {
      type: 'try',
      title: 'Test whether the five-day completion proportion is 80%',
      body: `<p>Classify each eligible delivery as meeting or missing the illustrative five-day threshold. Count the successes, calculate the observed sample proportion, and perform a two-sided exact binomial test of p = 0.80.</p>
<p><b>Python connection:</b></p>
<ul>
<li><code>sample <= 5</code> creates a Boolean array.</li>
<li><code>.sum()</code> counts the True values because True is treated as 1 and False as 0 in a numerical sum.</li>
<li><code>len(sample)</code> returns the number of eligible observations.</li>
<li><code>stats.binomtest()</code> calculates the exact test.</li>
<li><code>result.proportion_estimate</code> gives the observed sample proportion.</li>
</ul>
<p>Keep the observed proportion separate from the p-value. The observed proportion describes the data; the p-value describes how unusual the count would be under the null model.</p>`,
      code: `sample = transit.to_numpy()

on_time = sample <= 5

successes = int(on_time.sum())
n = len(sample)
p_hat = successes / n

result = stats.binomtest(
    k=successes,
    n=n,
    p=0.80,
    alternative="two-sided"
)

print("Eligible deliveries:", n)
print("Deliveries within five days:", successes)
print("Observed proportion:", round(p_hat, 4))
print("Observed percentage:", round(p_hat * 100, 2), "%")
print("Exact binomial p-value:", result.pvalue)`
    },
    {
      type: 'explain',
      title: 'Normal approximation versus exact binomial testing',
      body: `<p>You may also encounter a one-proportion z-test. It uses a normal approximation to the binomial distribution.</p>
<p>Under H₀: p = p₀, the test statistic is:</p>
<p><b>z = (p̂ − p₀) / √(p₀(1 − p₀) / n)</b></p>
<p>Notice that the standard error uses p₀, the hypothesised proportion, rather than p̂. This is because the test statistic is calculated under the null hypothesis.</p>
<p>This differs from the common confidence-interval standard error for a proportion, which uses the observed sample proportion p̂.</p>
<p>The normal approximation is most reliable when the expected numbers of successes and failures under H₀ are sufficiently large. A common introductory rule checks that:</p>
<ul>
<li>n × p₀ is at least 10.</li>
<li>n × (1 − p₀) is at least 10.</li>
</ul>
<p>These are practical guidelines, not universal guarantees. The exact binomial test avoids this particular normal-approximation requirement, although it still depends on the binomial model.</p>
<p>In this course, we use the exact binomial test for the main analysis because it is straightforward to implement with SciPy and makes the probability model explicit.</p>`
    },
    {
      type: 'try',
      title: 'Calculate the one-proportion z-statistic',
      body: `<p>Calculate the normal-approximation z-statistic for the same 80% benchmark. Compare it with the exact binomial result from the previous demonstration.</p>
<p>We use the null standard error:</p>
<p><b>√(p₀(1 − p₀) / n)</b></p>
<p>This is the standard error under H₀. Do not replace p₀ with the observed proportion in this test calculation.</p>
<p>The z-statistic tells us how many null-standard-error units separate the observed proportion from the hypothesised proportion. It is not itself a p-value.</p>`,
      code: `sample = transit.to_numpy()

successes = int((sample <= 5).sum())
n = len(sample)

p_hat = successes / n
p_0 = 0.80

null_se = np.sqrt(p_0 * (1 - p_0) / n)
z_statistic = (p_hat - p_0) / null_se

p_value_normal = 2 * stats.norm.sf(abs(z_statistic))

exact_result = stats.binomtest(
    k=successes,
    n=n,
    p=p_0,
    alternative="two-sided"
)

print("Observed proportion:", round(p_hat, 4))
print("Null standard error:", round(null_se, 5))
print("z-statistic:", round(z_statistic, 5))
print("Normal-approximation p-value:", p_value_normal)
print("Exact binomial p-value:", exact_result.pvalue)`
    },
    {
      type: 'explain',
      title: 'How hypothesis tests and confidence intervals work together',
      body: `<p>Hypothesis tests and confidence intervals are closely connected. They are two ways of using sample data to reason about a population parameter.</p>
<p>For a two-sided test at significance level α = 0.05, the corresponding 95% confidence interval and test generally give matching conclusions when they use the same model and method.</p>
<ul>
<li>If the null value is outside the 95% confidence interval, the corresponding two-sided test rejects H₀ at the 5% level.</li>
<li>If the null value is inside the 95% confidence interval, the corresponding test does not reject H₀ at the 5% level.</li>
</ul>
<p>For example, suppose the null hypothesis is μ = 5 days. If a valid 95% confidence interval for μ is 5.2 to 5.8 days, the value five is outside the interval. The corresponding two-sided test at α = 0.05 would reject H₀.</p>
<p>If the interval is 4.7 to 5.5 days, the value five is inside the interval. The corresponding test would fail to reject H₀ at the 5% level.</p>
<p>The confidence interval gives more information than a simple reject/fail-to-reject decision. It shows a range of parameter values compatible with the data and method, making it easier to assess the size and precision of the estimated effect.</p>
<div class="callout work"><b>Good reporting practice:</b> report the estimated difference, a confidence interval and the p-value. This gives readers information about direction, magnitude, uncertainty and statistical evidence.</div>
<p>Remember that the correspondence depends on matching the test and interval methods. An exact binomial test should be paired with a compatible binomial confidence interval, not automatically with a Wald interval from a different approximation.</p>`
    },
    {
      id: 'st-5-2-c1',
      type: 'check',
      title: 'Which test is appropriate for a question about average delivery time?',
      body: `<p>The analyst wants to compare the population mean delivery time with a five-day benchmark.</p>`,
      options: [
        'A one-sample t-test',
        'An exact binomial test',
        'A chi-square test of independence',
        'A test of a population proportion'
      ],
      answer: 0,
      why: [
        'Correct. The question concerns a numerical population mean, so a one-sample t-test is an appropriate method when its assumptions are reasonable.',
        'A binomial test is designed for a count of successes in binary trials, not a numerical mean.',
        'A chi-square test of independence examines association between categorical variables.',
        'A proportion test answers a question about the share of observations meeting a binary condition.'
      ]
    },
    {
      id: 'st-5-2-c2',
      type: 'check',
      title: 'Why does the exact binomial test not require a normal approximation?',
      body: `<p>Consider a test of a population proportion based on independent binary outcomes.</p>`,
      options: [
        'It assumes every observation has a different success probability',
        'It calculates probabilities directly from the binomial distribution',
        'It removes the need for a representative sample',
        'It automatically corrects for dependence between observations'
      ],
      answer: 1,
      why: [
        'The standard binomial model assumes a common success probability for the trials.',
        'Correct. The exact binomial test uses the binomial probability model directly rather than relying on a normal approximation.',
        'The test does not correct biased sampling. Representativeness remains a design issue.',
        'The ordinary binomial test assumes independent trials and does not automatically correct dependence.'
      ]
    },
    {
      id: 'st-5-2-c3',
      type: 'check',
      title: 'A 95% confidence interval contains the null value. What does that imply?',
      body: `<p>Assume it is a two-sided 95% interval constructed using the same method as a 5% hypothesis test.</p>`,
      options: [
        'The null hypothesis has been proved true',
        'The corresponding test would fail to reject the null hypothesis at the 5% level',
        'The alternative hypothesis has a 95% probability of being false',
        'The sample contains 95% of the population'
      ],
      answer: 1,
      why: [
        'A confidence interval containing the null value does not prove that the null hypothesis is true.',
        'Correct. With matching methods, a null value inside the 95% interval corresponds to a two-sided test that does not reject at the 5% level.',
        'A confidence interval does not assign a probability to the truth of the alternative hypothesis.',
        'A confidence interval concerns a population parameter, not the percentage of population records included in the sample.'
      ]
    },
    {
      type: 'exercise',
      id: 'st-5-2-ex1',
      title: 'Your turn: run a one-sample t-test',
      body: `<p>Use the valid delivery-time observations to test H₀: μ = 5 against Hₐ: μ ≠ 5.</p>
<p>Run <code>stats.ttest_1samp()</code>, store the result as <code>mean_test</code>, and print its test statistic and p-value to five decimal places.</p>
<p>Also print the observed sample mean. This is important because the p-value does not tell us the direction or practical size of the difference.</p>`,
      starter: `# Run a one-sample t-test on transit.
# Store the returned result as mean_test.`,
      hints: [
        'Convert transit to a NumPy array, then pass it to stats.ttest_1samp with popmean=5.',
        'sample = transit.to_numpy()\nmean_test = stats.ttest_1samp(sample, popmean=5, alternative="two-sided")\nprint("Sample mean:", round(sample.mean(), 4))\nprint("t-statistic:", round(mean_test.statistic, 5))\nprint("p-value:", round(mean_test.pvalue, 5))'
      ],
      solution: `sample = transit.to_numpy()

mean_test = stats.ttest_1samp(
    sample,
    popmean=5,
    alternative="two-sided"
)

print("Sample mean:", round(sample.mean(), 4))
print("t-statistic:", round(mean_test.statistic, 5))
print("p-value:", round(mean_test.pvalue, 5))`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-2-ex2',
      title: 'Your turn: calculate the effect relative to the benchmark',
      body: `<p>Calculate the difference between the observed mean delivery time and the five-day benchmark.</p>
<p>Store the result as <code>mean_difference</code>. A positive value means the observed mean is above five days; a negative value means it is below five days.</p>
<p>Print the difference to four decimal places and label the unit as days. Do not use the p-value as a substitute for this effect estimate.</p>`,
      starter: `# Calculate the observed mean minus the benchmark.
# Store the difference as mean_difference.`,
      hints: [
        'Calculate transit.mean(), then subtract 5.',
        'sample = transit.to_numpy()\nmean_difference = sample.mean() - 5\nprint("Difference from five-day benchmark:", round(mean_difference, 4), "days")'
      ],
      solution: `sample = transit.to_numpy()

mean_difference = sample.mean() - 5

print(
    "Difference from five-day benchmark:",
    round(mean_difference, 4),
    "days"
)`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-2-ex3',
      title: 'Your turn: run an exact binomial test',
      body: `<p>Define a success as a delivery completed within five days. Test H₀: p = 0.80 against Hₐ: p ≠ 0.80 using the exact binomial test.</p>
<p>Store the result as <code>proportion_test</code>. Print the number of successes, the total number of eligible observations, the observed proportion and the exact p-value.</p>
<p>Use <code>stats.binomtest()</code>. Do not substitute the sample proportion for the hypothesised probability in the test's <code>p</code> argument.</p>`,
      starter: `# Count deliveries within five days.
# Run the exact binomial test and print its result.`,
      hints: [
        'Create a Boolean condition, sum it to count successes, and use len(sample) as n.',
        'sample = transit.to_numpy()\nsuccesses = int((sample <= 5).sum())\nn = len(sample)\np_hat = successes / n\nproportion_test = stats.binomtest(successes, n, p=0.80, alternative="two-sided")\nprint("Successes:", successes)\nprint("Total:", n)\nprint("Observed proportion:", round(p_hat, 4))\nprint("Exact p-value:", proportion_test.pvalue)'
      ],
      solution: `sample = transit.to_numpy()

successes = int((sample <= 5).sum())
n = len(sample)
p_hat = successes / n

proportion_test = stats.binomtest(
    successes,
    n,
    p=0.80,
    alternative="two-sided"
)

print("Successes:", successes)
print("Total:", n)
print("Observed proportion:", round(p_hat, 4))
print("Exact p-value:", proportion_test.pvalue)`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-2-ex4',
      title: 'Your turn: calculate a one-proportion z-statistic',
      body: `<p>Using the same five-day success definition, calculate the one-proportion z-statistic for H₀: p = 0.80.</p>
<p>Store the statistic as <code>z_stat</code> and the two-sided normal-approximation p-value as <code>z_p_value</code>.</p>
<p>Use the null standard error √(p₀(1 − p₀) / n). The hypothesised value p₀ belongs in this standard error because the calculation is made under H₀.</p>`,
      starter: `# Calculate the observed proportion and null standard error.
# Store the z-statistic and p-value.`,
      hints: [
        'Calculate p_hat from the observed successes. Then calculate the standard error using p_0=0.80.',
        'sample = transit.to_numpy()\nsuccesses = int((sample <= 5).sum())\nn = len(sample)\np_hat = successes / n\np_0 = 0.80\nnull_se = np.sqrt(p_0 * (1 - p_0) / n)\nz_stat = (p_hat - p_0) / null_se\nz_p_value = 2 * stats.norm.sf(abs(z_stat))\nprint("z-statistic:", round(z_stat, 5))\nprint("p-value:", z_p_value)'
      ],
      solution: `sample = transit.to_numpy()

successes = int((sample <= 5).sum())
n = len(sample)
p_hat = successes / n
p_0 = 0.80

null_se = np.sqrt(p_0 * (1 - p_0) / n)

z_stat = (p_hat - p_0) / null_se
z_p_value = 2 * stats.norm.sf(abs(z_stat))

print("z-statistic:", round(z_stat, 5))
print("p-value:", z_p_value)`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-2-ex5',
      title: 'Your turn: write a statistically responsible conclusion',
      body: `<p>Run the one-sample t-test of H₀: μ = 5 days against Hₐ: μ ≠ 5 days. Then write a short report containing:</p>
<ul>
<li>The sample mean delivery time.</li>
<li>The difference from the five-day benchmark.</li>
<li>The p-value.</li>
<li>The decision at α = 0.05.</li>
<li>A conclusion that refers only to eligible recorded deliveries and does not claim causation.</li>
</ul>
<p>Store the final report as <code>report</code> and print it. Use an f-string to format the numerical results to three decimal places.</p>`,
      starter: `# Run the test and construct a short, careful report.
# Store the report as report.`,
      hints: [
        'Calculate the sample mean, difference and t-test result. Use an if statement to select the decision wording.',
        'sample = transit.to_numpy()\nmean_value = sample.mean()\ndifference = mean_value - 5\nresult = stats.ttest_1samp(sample, popmean=5, alternative="two-sided")\nalpha = 0.05\nif result.pvalue <= alpha:\n    decision = "reject the five-day null hypothesis"\nelse:\n    decision = "fail to reject the five-day null hypothesis"\nreport = f"The eligible recorded deliveries have a sample mean transit time of {mean_value:.3f} days, which is {difference:.3f} days from the five-day benchmark. The two-sided test produced p = {result.pvalue:.5f}; at alpha = 0.05, we {decision}. This result describes the eligible recorded deliveries and does not establish a cause for the observed difference."\nprint(report)'
      ],
      solution: `sample = transit.to_numpy()

mean_value = sample.mean()
difference = mean_value - 5

result = stats.ttest_1samp(
    sample,
    popmean=5,
    alternative="two-sided"
)

alpha = 0.05

if result.pvalue <= alpha:
    decision = "reject the five-day null hypothesis"
else:
    decision = "fail to reject the five-day null hypothesis"

report = (
    f"The eligible recorded deliveries have a sample mean "
    f"transit time of {mean_value:.3f} days, which is "
    f"{difference:.3f} days from the five-day benchmark. "
    f"The two-sided test produced p = {result.pvalue:.5f}; "
    f"at alpha = 0.05, we {decision}. This result describes "
    f"the eligible recorded deliveries and does not establish "
    f"a cause for the observed difference."
)

print(report)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The limits of inference: what the data actually represent',
      body: `<p>Before reporting a test result, an analyst must define the population to which the conclusion is intended to apply.</p>
<p>The TradeFlow delivery file contains 9,500 delivery records, but not every record has a valid delivery date. Our <code>transit</code> variable excludes missing dates and negative transit durations. The resulting analysis therefore concerns eligible records with usable dispatch and delivery dates.</p>
<p>This matters because missingness may not be random. Deliveries still in transit, failed deliveries and records with incomplete timestamps may differ systematically from completed deliveries. If those records are excluded, the mean and proportion calculated from the remaining records may not represent all delivery attempts.</p>
<p>There are also possible dependence issues. Several deliveries may be handled by the same warehouse, occur during the same disruption, or be affected by the same operational policy. Treating every row as independent may understate uncertainty if observations are clustered.</p>
<p>Finally, the dataset is a historical extract. Even if the sample accurately represents the recorded period, the delivery process may change over time. A result from one period does not guarantee the same performance in a later period.</p>
<p>A responsible report should therefore identify:</p>
<ul>
<li>The population or operational group being studied.</li>
<li>The eligibility rule used to select observations.</li>
<li>The sample size and period covered.</li>
<li>The estimated effect and its uncertainty.</li>
<li>The test method and its assumptions.</li>
<li>Any important missing-data, selection or dependence limitations.</li>
</ul>
<p>Statistical testing is only one part of good analysis. A technically correct p-value cannot rescue a poorly defined population or a biased data collection process.</p>`
    },
    {
      type: 'explain',
      title: 'What you should take away from Lesson 5.2',
      body: `<p>You can now match a hypothesis test to the population parameter being investigated and run two common tests in Python.</p>
<ul>
<li><b>One-sample t-test:</b> evaluates a claim about a population mean when the population standard deviation is unknown.</li>
<li><b>Exact binomial test:</b> evaluates a claim about a population proportion using the binomial probability model.</li>
<li><b>One-proportion z-test:</b> uses a normal approximation and the null standard error when its conditions are adequate.</li>
<li><b>Assumptions:</b> independence, a defensible sampling process and suitable distributional conditions remain essential.</li>
<li><b>Interpretation:</b> report the estimate, effect size, p-value and limitations rather than relying on a significant/not-significant label.</li>
</ul>
<p>In the next lesson, we will move from testing one population to comparing two groups. We will learn how to distinguish independent samples from paired observations and why that distinction changes the correct statistical method.</p>`
    }
  ]
}
);
