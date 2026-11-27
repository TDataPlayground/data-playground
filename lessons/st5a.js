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

rng = np.random.default_rng(5301)
`,
  preloaded: ['deliveries', 'transit', 'rng'],
  title: '5.1 Hypothesis testing: questions, evidence and decisions',
  tables: [],
  intro: `A business analyst rarely works with data simply to describe what has already happened. Management often has a specific claim that needs to be evaluated.

<p>Suppose TradeFlow's operations team believes that its average delivery time is five days. A sample of completed deliveries produces an average of 5.4 days. Is that difference meaningful evidence that the true average delivery time is greater than five days, or could a difference of this size reasonably occur because the team happened to observe a particular sample?</p>

<p>That is the kind of question <b>hypothesis testing</b> is designed to investigate.</p>

<p>In this lesson, you will learn how to formulate hypotheses, understand the logic behind a test statistic and a p-value, distinguish statistical significance from practical importance, and interpret a test without overstating what the data establish.</p>

<p>We will also examine the two major ways a hypothesis test can lead to an incorrect decision: Type I and Type II errors. These ideas are essential because statistical decisions are made under uncertainty. A hypothesis test does not eliminate uncertainty; it provides a disciplined way to reason about evidence.</p>`,
  steps: [
    {
      type: 'explain',
      title: 'Why hypothesis testing is necessary',
      body: `<p>In Module 4, we learned that a sample can be used to estimate an unknown population parameter. We also learned that estimates vary from sample to sample.</p>

<p>That sampling variability creates an important problem. Imagine that TradeFlow wants to determine whether its average delivery time exceeds five days.</p>

<p>The analytics team cannot normally measure every delivery that TradeFlow will ever complete. Instead, it observes a sample and calculates a sample mean.</p>

<p>Suppose the sample mean is 5.4 days. There are at least two possible explanations:</p>

<ol>
<li><b>The population mean really is greater than five days.</b> The sample has revealed evidence of a genuine difference.</li>
<li><b>The population mean is still five days.</b> The sample happened to produce a mean of 5.4 because of ordinary sampling variation.</li>
</ol>

<p>The sample mean alone cannot tell us which explanation is more convincing. We need to compare the observed result with the results we would expect if the original claim were true.</p>

<p>This is the fundamental logic of hypothesis testing:</p>

<ol>
<li>Begin with a clearly defined claim about a population parameter.</li>
<li>Assume, temporarily, that the claim is true.</li>
<li>Determine what kinds of sample results would be expected under that assumption.</li>
<li>Compare the actual sample result with those expected results.</li>
<li>Decide whether the observed evidence is sufficiently unusual to reject the original claim.</li>
</ol>

<p>Notice the logic: we do not begin by proving that our preferred explanation is correct. We begin by asking whether the observed data are compatible with a specific reference claim.</p>

<p><b>Hypothesis testing is therefore a framework for evaluating evidence, not a machine that proves business claims to be true or false.</b></p>`
    },
    {
      type: 'explain',
      title: 'The null and alternative hypotheses',
      body: `<p>Every conventional hypothesis test begins with two competing statements about a population parameter.</p>

<p>The first is the <b>null hypothesis</b>, written as H₀. It represents the reference position that the test evaluates. It commonly expresses no difference, no effect, no change, or a specific benchmark value.</p>

<p>The second is the <b>alternative hypothesis</b>, written as H₁ or Hₐ. It represents the direction or type of difference that the analyst wants to investigate.</p>

<p>Suppose TradeFlow wants to investigate whether its population mean delivery time is greater than five days. Let μ represent the true population mean delivery time.</p>

<table class="mini">
<tr><th>Hypothesis</th><th>Statement</th><th>Meaning</th></tr>
<tr><td>Null, H₀</td><td>μ = 5</td><td>The population mean is five days.</td></tr>
<tr><td>Alternative, H₁</td><td>μ &gt; 5</td><td>The population mean is greater than five days.</td></tr>
</table>

<p>The null hypothesis is not necessarily what management believes. It is the reference claim against which the sample evidence is evaluated.</p>

<p><b>Three common forms of the alternative hypothesis</b></p>

<p>The alternative hypothesis determines which results count as evidence against H₀.</p>

<ul>
<li><b>Right-tailed test:</b> H₁: μ &gt; 5. We are investigating whether the population mean is greater than the benchmark.</li>
<li><b>Left-tailed test:</b> H₁: μ &lt; 5. We are investigating whether the population mean is lower than the benchmark.</li>
<li><b>Two-tailed test:</b> H₁: μ ≠ 5. We are investigating whether the population mean differs from the benchmark in either direction.</li>
</ul>

<p>The direction matters. If the business question is whether delivery time has increased, a result below five days is not evidence of an increase. A right-tailed test reflects that question.</p>

<p>For a two-tailed test, deviations in either direction matter. A mean of 4.6 days and a mean of 5.4 days are both departures from five days.</p>

<p><b>Why must the alternative be chosen before examining the result?</b></p>

<p>Choosing the direction after seeing the data creates an opportunity to manipulate the analysis. For example, an analyst might initially plan a two-tailed test but switch to a right-tailed test only because the sample mean happens to be above the benchmark. That can make the evidence appear stronger than it really is.</p>

<p>The hypothesis should be determined by the research question, business context and analysis plan—not by whichever result produces the smallest p-value.</p>

<p><b>Important distinction:</b> hypotheses are statements about population parameters, not sample statistics. We do not test whether the sample mean equals five. We use the sample mean to evaluate a claim about the unknown population mean.</p>`
    },
    {
      type: 'check',
      title: 'Check your understanding: identify the hypotheses',
      question: 'TradeFlow wants to investigate whether its true average delivery time is lower than a benchmark of six days. Which hypotheses represent this question?',
      options: [
        'H₀: μ = 6; H₁: μ < 6',
        'H₀: x̄ = 6; H₁: x̄ < 6',
        'H₀: μ < 6; H₁: μ = 6',
        'H₀: μ = 6; H₁: μ ≠ 6'
      ],
      answer: 0,
      why: [
        'Correct. The null hypothesis specifies the benchmark population mean, while the alternative states that the population mean is lower.',
        'The hypotheses should describe population parameters. x̄ is a sample statistic, not the unknown population mean.',
        'The null hypothesis is normally the reference claim, and the alternative represents the departure being investigated.',
        'This is a two-tailed alternative. It asks whether the mean differs in either direction, not specifically whether it is lower.'
      ]
    },
    {
      type: 'explain',
      title: 'The significance level: deciding how demanding the evidence must be',
      body: `<p>Before conducting a test, analysts commonly choose a <b>significance level</b>, represented by the Greek letter α (alpha).</p>

<p>The significance level is the maximum probability of a Type I error that the testing procedure is designed to tolerate, assuming the test's assumptions hold.</p>

<p>A commonly used value is:</p>

<p><b>α = 0.05</b></p>

<p>This means that the analyst is using a procedure with a 5% Type I error rate under the null hypothesis, in the long run, when the test assumptions are satisfied.</p>

<p>It does <b>not</b> mean:</p>

<ul>
<li>There is a 5% probability that the null hypothesis is true.</li>
<li>There is a 95% probability that the alternative hypothesis is true.</li>
<li>The result has a 95% chance of being correct.</li>
<li>There is only a 5% chance that the result occurred randomly.</li>
</ul>

<p>Those interpretations confuse the probability of observing data under a hypothesis with the probability that the hypothesis itself is true.</p>

<p><b>How α controls the decision threshold</b></p>

<p>A smaller significance level requires stronger evidence before rejecting H₀.</p>

<table class="mini">
<tr><th>Significance level</th><th>General interpretation</th></tr>
<tr><td>0.10</td><td>A 10% long-run Type I error rate.</td></tr>
<tr><td>0.05</td><td>A 5% long-run Type I error rate.</td></tr>
<tr><td>0.01</td><td>A 1% long-run Type I error rate.</td></tr>
</table>

<p>For example, using α = 0.01 rather than α = 0.05 makes it harder to reject the null hypothesis. This can reduce false positive decisions, but it can also make real effects harder to detect unless the sample size is sufficiently large.</p>

<p>The significance level should be selected before the results are examined. Choosing it afterwards because it makes a result appear significant undermines the integrity of the test.</p>

<p><b>Business interpretation:</b> a company investigating a potentially costly operational change may require particularly strong evidence before acting. However, the choice of α should reflect the consequences of errors, the study design and accepted analytical standards—not an arbitrary desire to obtain a significant result.</p>`
    },
    {
      type: 'explain',
      title: 'The test statistic: measuring how far the evidence is from the null claim',
      body: `<p>A hypothesis test needs a way to measure how unusual the observed sample result is under the null hypothesis.</p>

<p>This is the purpose of a <b>test statistic</b>.</p>

<p>A test statistic transforms the observed data into a number that can be compared with a probability distribution expected under H₀.</p>

<p>For a one-sample test of a population mean when the population standard deviation is unknown, the one-sample t-statistic is:</p>

<p><b>t = (x̄ − μ₀) / (s / √n)</b></p>

<p>Where:</p>

<ul>
<li><b>x̄:</b> the observed sample mean.</li>
<li><b>μ₀:</b> the population mean specified by the null hypothesis.</li>
<li><b>s:</b> the sample standard deviation.</li>
<li><b>n:</b> the sample size.</li>
<li><b>s / √n:</b> the estimated standard error of the sample mean.</li>
</ul>

<p>The numerator measures the difference between the observed sample mean and the benchmark. The denominator measures the amount of sampling variability expected in the sample mean.</p>

<p>This ratio is important because a difference cannot be judged properly without considering uncertainty.</p>

<p>Consider two hypothetical investigations:</p>

<table class="mini">
<tr><th>Investigation</th><th>Difference from benchmark</th><th>Standard error</th><th>t-statistic</th></tr>
<tr><td>A</td><td>0.4 days</td><td>0.1 days</td><td>4.0</td></tr>
<tr><td>B</td><td>0.4 days</td><td>0.5 days</td><td>0.8</td></tr>
</table>

<p>Both samples are 0.4 days above the benchmark. However, the first difference is large relative to its standard error, while the second is small relative to its standard error.</p>

<p>Investigation A therefore provides stronger evidence against the null hypothesis than Investigation B, assuming the tests are otherwise comparable.</p>

<p><b>The key principle:</b> statistical evidence depends not only on the size of an observed difference, but also on the uncertainty surrounding that difference.</p>

<p>For a t-test, the reference distribution is a Student's t-distribution. Its shape depends on the degrees of freedom, which for a one-sample t-test are n − 1.</p>

<p>When the sample is small, the t-distribution has heavier tails than the standard normal distribution. As the degrees of freedom increase, it becomes increasingly similar to the standard normal distribution.</p>`
    },
    {
      type: 'explain',
      title: 'The p-value: what it actually tells us',
      body: `<p>The <b>p-value</b> is one of the most important—and most frequently misunderstood—ideas in statistical analysis.</p>

<p>A p-value is the probability, calculated under the assumption that the null hypothesis is true, of obtaining a test statistic at least as extreme as the one observed, in the direction or directions specified by the alternative hypothesis.</p>

<p>In simpler language, it asks:</p>

<p><b>If the null hypothesis were true, how surprising would a result like ours be?</b></p>

<p>Suppose a right-tailed test investigates whether the average delivery time exceeds five days. If the test produces a p-value of 0.02, this means that, assuming the population mean is five days and the model assumptions hold, there is a 2% probability of obtaining a test statistic at least as large as the observed one.</p>

<p>It does not mean there is a 2% probability that the null hypothesis is true.</p>

<p><b>How to interpret a p-value</b></p>

<table class="mini">
<tr><th>p-value</th><th>Interpretation at α = 0.05</th></tr>
<tr><td>0.001</td><td>Strong evidence against H₀; reject H₀.</td></tr>
<tr><td>0.020</td><td>Evidence against H₀; reject H₀.</td></tr>
<tr><td>0.049</td><td>Evidence just below the chosen threshold; reject H₀.</td></tr>
<tr><td>0.051</td><td>Does not cross the chosen threshold; fail to reject H₀.</td></tr>
<tr><td>0.400</td><td>Little evidence against H₀; fail to reject H₀.</td></tr>
</table>

<p><b>The decision rule</b></p>

<ul>
<li>If p ≤ α, reject the null hypothesis.</li>
<li>If p &gt; α, fail to reject the null hypothesis.</li>
</ul>

<p>At the exact boundary, p = α, the conventional rule is to reject H₀.</p>

<p><b>Why do we say “fail to reject” instead of “accept”?</b></p>

<p>Failing to reject H₀ does not prove that H₀ is true. It simply means that the observed data did not provide sufficiently strong evidence against it under the chosen testing procedure.</p>

<p>A study with a small sample may fail to detect an important difference because it has insufficient statistical power. A study with a large sample may detect a very small difference that has little practical importance.</p>

<p>Consequently, the p-value must be interpreted alongside the estimated effect, confidence interval, sample size, assumptions and business context.</p>

<p><b>Never interpret a p-value as the probability that your result happened “by chance”.</b> The p-value is calculated under a specified null model. It does not separate chance from every possible source of bias, measurement error or confounding.</p>`
    },
    {
      type: 'check',
      title: 'Check your understanding: interpreting a p-value',
      question: 'A valid hypothesis test produces a p-value of 0.03. The preselected significance level is 0.05. Which conclusion is correct?',
      options: [
        'There is a 3% probability that the null hypothesis is true.',
        'There is a 97% probability that the alternative hypothesis is true.',
        'Reject the null hypothesis because 0.03 is below 0.05.',
        'Accept the null hypothesis because the p-value is close to 0.05.'
      ],
      answer: 2,
      why: [
        'A p-value is calculated assuming the null hypothesis is true. It is not the probability that the null hypothesis is true.',
        'A p-value does not provide the probability that the alternative hypothesis is true.',
        'Correct. Since p = 0.03 is below α = 0.05, the conventional decision rule is to reject H₀.',
        'The p-value is below the significance level, so the decision is to reject H₀. We also do not normally say that a null hypothesis has been accepted.'
      ]
    },
    {
      type: 'explain',
      title: 'Type I and Type II errors: why statistical decisions can be wrong',
      body: `<p>A hypothesis test does not reveal the truth with certainty. It produces a decision based on incomplete information.</p>

<p>Because the population parameter is generally unknown, that decision can be incorrect.</p>

<p>There are two fundamental types of decision error.</p>

<p><b>Type I error: a false positive</b></p>

<p>A Type I error occurs when we reject a null hypothesis that is actually true.</p>

<p>Imagine that TradeFlow's true average delivery time is exactly five days. A sample produces unusually high delivery times, and the test rejects H₀. The analyst concludes that there is evidence of an increase, even though the population mean has not increased.</p>

<p>That is a Type I error.</p>

<p>The probability of a Type I error is controlled by the significance level α, provided the test assumptions hold. At α = 0.05, the test procedure is designed to have a 5% Type I error rate under H₀.</p>

<p><b>Type II error: a false negative</b></p>

<p>A Type II error occurs when we fail to reject a null hypothesis that is actually false.</p>

<p>Suppose TradeFlow's true average delivery time has increased to 5.5 days, but the sample is too small or too variable to provide sufficiently strong evidence. The analyst fails to reject H₀.</p>

<p>That is a Type II error.</p>

<p>The probability of a Type II error is represented by β (beta).</p>

<p><b>Statistical power</b></p>

<p>The power of a test is the probability of correctly rejecting a false null hypothesis.</p>

<p><b>Power = 1 − β</b></p>

<p>If a test has 80% power to detect a particular effect, then, under the specified assumptions and when that effect is truly present, the test has an 80% probability of rejecting the null hypothesis.</p>

<table class="mini">
<tr><th>Reality</th><th>Decision</th><th>Outcome</th></tr>
<tr><td>H₀ is true</td><td>Fail to reject H₀</td><td>Correct decision</td></tr>
<tr><td>H₀ is true</td><td>Reject H₀</td><td>Type I error</td></tr>
<tr><td>H₀ is false</td><td>Reject H₀</td><td>Correct decision; power</td></tr>
<tr><td>H₀ is false</td><td>Fail to reject H₀</td><td>Type II error</td></tr>
</table>

<p><b>What influences statistical power?</b></p>

<ul>
<li><b>Sample size:</b> larger samples generally reduce the standard error and make real effects easier to detect.</li>
<li><b>Effect size:</b> larger differences from the null value are generally easier to detect.</li>
<li><b>Variability:</b> lower population variability generally makes differences easier to detect.</li>
<li><b>Significance level:</b> a higher α generally increases power but also increases the Type I error rate.</li>
<li><b>Study design:</b> better measurement, appropriate sampling and reduced noise can improve the ability to detect real effects.</li>
</ul>

<p>There is an important trade-off. Making a test more demanding can reduce false positives but may increase false negatives if the sample size and other design features remain unchanged.</p>

<p>For this reason, researchers often conduct a <b>power analysis</b> before collecting data. It helps estimate the sample size required to detect an effect of a specified magnitude at a chosen significance level and desired power.</p>`
    },
    {
      type: 'check',
      title: 'Check your understanding: identify the error',
      question: 'TradeFlow's true average delivery time is greater than five days. However, a study fails to reject the null hypothesis that the mean is five days. What kind of outcome has occurred?',
      options: [
        'Type I error',
        'Type II error',
        'A correct rejection',
        'A guaranteed proof that the mean is five days'
      ],
      answer: 1,
      why: [
        'Type I error means rejecting a null hypothesis that is actually true.',
        'Correct. The null hypothesis is false, but the test failed to reject it. This is a Type II error.',
        'A correct rejection occurs when the null hypothesis is false and the test rejects it.',
        'Failing to reject a null hypothesis does not prove that it is true.'
      ]
    },
    {
      type: 'explain',
      title: 'Statistical significance is not the same as business importance',
      body: `<p>One of the most important responsibilities of an analyst is to distinguish <b>statistical significance</b> from <b>practical significance</b>.</p>

<p>Statistical significance describes whether the observed evidence crosses a chosen statistical decision threshold. Practical significance describes whether the size of the effect matters in the real world.</p>

<p>Consider two hypothetical TradeFlow studies.</p>

<p><b>Study A:</b> A very large sample produces evidence that average delivery time has increased by 0.02 days. The p-value is 0.001.</p>

<p><b>Study B:</b> A smaller sample suggests that average delivery time has increased by 1.5 days. The p-value is 0.08.</p>

<p>Study A is statistically significant at the 5% level, while Study B is not. But the operational impact of a 1.5-day increase could be much more important than a 0.02-day increase.</p>

<p>This illustrates why the p-value cannot be the only measure used to evaluate a result.</p>

<p><b>Effect size</b></p>

<p>An effect size describes the magnitude of a difference or relationship. In a one-sample mean test, the raw difference from the benchmark is:</p>

<p><b>Observed difference = x̄ − μ₀</b></p>

<p>For a comparison of means, Cohen's d is one standardised effect-size measure:</p>

<p><b>d = (x̄ − μ₀) / s</b></p>

<p>It expresses the difference in units of the sample standard deviation. Standardised measures can help compare effects measured on different scales, but they should not replace the original units when those units have direct business meaning.</p>

<p><b>Confidence intervals add useful context</b></p>

<p>A confidence interval helps communicate the range of effect sizes compatible with the data under the method's assumptions. It can show whether the plausible effects are tiny, substantial or too uncertain to judge.</p>

<p>For example, an estimated increase of 0.2 days with a narrow confidence interval from 0.1 to 0.3 days suggests a small but precisely estimated increase. An estimated increase of 1.2 days with a wide interval from −0.3 to 2.7 days is much less precise.</p>

<p><b>What an analyst should report</b></p>

<ul>
<li>The question and hypotheses tested.</li>
<li>The sample size and how the observations were obtained.</li>
<li>The estimated effect in meaningful original units.</li>
<li>The test statistic and p-value.</li>
<li>The confidence interval, where appropriate.</li>
<li>The assumptions and limitations of the test.</li>
<li>The practical implications of the result.</li>
</ul>

<p>A statistically significant result is not automatically important, and a non-significant result is not proof that there is no meaningful effect. Good analysis communicates both what the evidence suggests and what it cannot establish.</p>`
    },
    {
      type: 'exercise',
      title: 'Exercise 1: formulate a test for a delivery-time benchmark',
      body: `<p>TradeFlow's operations team wants to investigate whether the population mean delivery time is greater than five days.</p>

<p>Before conducting a test, formulate the hypotheses correctly. The parameter of interest is the population mean, μ.</p>

<p>Complete the code by assigning the null benchmark and writing the direction of the alternative hypothesis in a comment. Then print the hypotheses in a readable form.</p>`,
      starter: `# The population mean delivery time is represented by mu.
# The benchmark is five days.

mu_0 = 5

# Write the null and alternative hypotheses in comments.
# H0:
# H1:

print("Null hypothesis: mu =", mu_0)
print("Alternative hypothesis: mu > ", mu_0)`,
      hints: [
        'The null hypothesis is the reference benchmark.',
        'The question asks whether the population mean is greater than five, so this is a right-tailed test.',
        'Use μ for the population mean, not x̄ for the sample mean.'
      ],
      solution: `mu_0 = 5

# H0: mu = 5
# H1: mu > 5

print("Null hypothesis: mu =", mu_0)
print("Alternative hypothesis: mu > ", mu_0)`,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 2: compare an observed difference with its standard error',
      body: `<p>Consider a hypothetical sample with a mean delivery time of 5.4 days, a sample standard deviation of 2 days and 100 observations.</p>

<p>Calculate the standard error and the one-sample t-statistic for testing a benchmark of five days.</p>

<p>Do not use a statistical testing function yet. Calculate the components directly so that you understand what the test statistic measures.</p>`,
      starter: `import numpy as np

sample_mean = 5.4
mu_0 = 5
sample_std = 2
sample_size = 100

# Calculate the standard error.
standard_error =

# Calculate the t-statistic.
t_statistic =

print("Standard error:", standard_error)
print("t-statistic:", t_statistic)`,
      hints: [
        'The standard error is the sample standard deviation divided by the square root of the sample size.',
        'The t-statistic is the difference between the sample mean and the null benchmark divided by the standard error.',
        'Use np.sqrt(sample_size) for the square root.'
      ],
      solution: `import numpy as np

sample_mean = 5.4
mu_0 = 5
sample_std = 2
sample_size = 100

standard_error = sample_std / np.sqrt(sample_size)

t_statistic = (sample_mean - mu_0) / standard_error

print("Standard error:", standard_error)
print("t-statistic:", t_statistic)`,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 3: simulate sampling variation under a null hypothesis',
      body: `<p>Suppose the null hypothesis states that the population mean delivery time is five days. We can investigate sampling variation by repeatedly drawing samples from a hypothetical normal population with mean five days and standard deviation two days.</p>

<p>This is a simulation, not a claim that TradeFlow's actual delivery times follow a normal distribution. Its purpose is to show how sample means behave when the null model is assumed to be true.</p>

<p>Generate 10,000 sample means, each based on a sample of 100 observations. Then calculate the proportion of simulated sample means that are at least 5.4 days.</p>

<p>This proportion is an illustrative simulated tail probability for the sample mean under the specified model. It is not a substitute for a properly specified t-test.</p>`,
      starter: `import numpy as np

rng_sim = np.random.default_rng(5302)

null_mean = 5
population_std = 2
sample_size = 100
number_of_simulations = 10000

simulated_means =

# Calculate the proportion of means at least 5.4.
tail_proportion =

print("Simulated mean:", simulated_means.mean())
print("Simulated standard deviation:", simulated_means.std(ddof=1))
print("Proportion at least 5.4:", tail_proportion)`,
      hints: [
        'Use rng_sim.normal() to generate values from the hypothetical normal population.',
        'Generate a two-dimensional array with shape (number_of_simulations, sample_size).',
        'Use axis=1 when calculating the mean of each simulated sample.',
        'The final proportion is the mean of a Boolean comparison.'
      ],
      solution: `import numpy as np

rng_sim = np.random.default_rng(5302)

null_mean = 5
population_std = 2
sample_size = 100
number_of_simulations = 10000

simulated_samples = rng_sim.normal(
    loc=null_mean,
    scale=population_std,
    size=(number_of_simulations, sample_size)
)

simulated_means = simulated_samples.mean(axis=1)

tail_proportion = np.mean(simulated_means >= 5.4)

print("Simulated mean:", simulated_means.mean())
print("Simulated standard deviation:", simulated_means.std(ddof=1))
print("Proportion at least 5.4:", tail_proportion)`,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 4: visualise the null distribution of sample means',
      body: `<p>Using the same hypothetical model, create a histogram of the simulated sample means. Add a vertical line at the null mean of five days and another at the observed sample mean of 5.4 days.</p>

<p>The purpose of this graph is to make the null distribution easier to understand. Most sample means should cluster around the null mean. The observed value can then be viewed relative to that distribution.</p>

<p>Remember that the simulation represents a specific hypothetical model. Its shape and spread depend on the assumptions and sample size used.</p>`,
      starter: `import numpy as np
import matplotlib.pyplot as plt

rng_sim = np.random.default_rng(5303)

simulated_samples = rng_sim.normal(
    loc=5,
    scale=2,
    size=(10000, 100)
)

simulated_means =

plt.figure(figsize=(10, 5))

# Draw the histogram.

# Add the null mean and observed mean lines.

plt.title("Simulated null distribution of sample means")
plt.xlabel("Sample mean delivery time (days)")
plt.ylabel("Frequency")
plt.legend()
plt.tight_layout()
plt.show()`,
      hints: [
        'Calculate one mean per simulated sample with axis=1.',
        'Use plt.hist() to draw the histogram.',
        'Use plt.axvline() for the vertical reference lines.',
        'Give each vertical line a label so the legend can identify it.'
      ],
      solution: `import numpy as np
import matplotlib.pyplot as plt

rng_sim = np.random.default_rng(5303)

simulated_samples = rng_sim.normal(
    loc=5,
    scale=2,
    size=(10000, 100)
)

simulated_means = simulated_samples.mean(axis=1)

plt.figure(figsize=(10, 5))

plt.hist(
    simulated_means,
    bins=35,
    edgecolor="black",
    alpha=0.75
)

plt.axvline(
    5,
    linestyle="--",
    linewidth=2,
    label="Null mean: 5 days"
)

plt.axvline(
    5.4,
    linestyle="-",
    linewidth=2,
    label="Observed mean: 5.4 days"
)

plt.title("Simulated null distribution of sample means")
plt.xlabel("Sample mean delivery time (days)")
plt.ylabel("Frequency")
plt.legend()
plt.tight_layout()
plt.show()`,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 5: make a decision using the p-value rule',
      body: `<p>Suppose a properly conducted test produces a p-value of 0.032. The analyst selected a significance level of 0.05 before examining the data.</p>

<p>Write code that compares the p-value with the significance level and prints the appropriate statistical decision.</p>

<p>Your code must distinguish between rejecting the null hypothesis and failing to reject it. Do not print that the null hypothesis has been proven or accepted.</p>`,
      starter: `p_value = 0.032
alpha = 0.05

if :
    print()
else:
    print()`,
      hints: [
        'The rejection rule is p-value less than or equal to alpha.',
        'Use an if/else statement.',
        'Use “Reject the null hypothesis” and “Fail to reject the null hypothesis” as the decision messages.'
      ],
      solution: `p_value = 0.032
alpha = 0.05

if p_value <= alpha:
    print("Reject the null hypothesis.")
else:
    print("Fail to reject the null hypothesis.")`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Module 5.1 summary: the logic behind a hypothesis test',
      body: `<p>You have now learned the reasoning framework behind conventional hypothesis testing.</p>

<ul>
<li><b>Null hypothesis:</b> the reference claim about a population parameter.</li>
<li><b>Alternative hypothesis:</b> the departure from the reference claim that the analyst wants to investigate.</li>
<li><b>Significance level:</b> the preselected threshold controlling the test's Type I error rate.</li>
<li><b>Test statistic:</b> a numerical measure of how far the sample result is from what the null hypothesis predicts, relative to sampling variability.</li>
<li><b>p-value:</b> the probability, assuming H₀ and the model assumptions, of a result at least as extreme as the observed result.</li>
<li><b>Type I error:</b> rejecting a true null hypothesis.</li>
<li><b>Type II error:</b> failing to reject a false null hypothesis.</li>
<li><b>Power:</b> the probability of rejecting a false null hypothesis for a specified effect and set of assumptions.</li>
</ul>

<p>The most important habit is to keep the statistical conclusion appropriately limited. Rejecting H₀ provides evidence against the null model; it does not prove the alternative hypothesis beyond doubt. Failing to reject H₀ means the evidence was insufficient under the chosen procedure; it does not establish that the null hypothesis is true.</p>

<p>In Lesson 5.2, we will put this framework into practice using one-sample tests for means and proportions. You will learn how to calculate the test statistic and p-value with Python, examine the assumptions behind each test, and interpret the results in the context of TradeFlow's operations.</p>`
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

rng = np.random.default_rng(5304)
`,
  preloaded: ['deliveries', 'transit', 'rng'],
  title: '5.2 One-sample tests: testing means and proportions',
  tables: [],
  intro: `In Lesson 5.1, we established the logic of hypothesis testing. We learned how to formulate a null and alternative hypothesis, interpret a p-value, and make a decision using a preselected significance level.

<p>Now we will apply that framework to two common business questions:</p>

<ul>
<li>Is the population mean of a numerical variable different from a specified benchmark?</li>
<li>Is the population proportion of observations with a particular outcome different from a specified benchmark?</li>
</ul>

<p>These questions require different statistical procedures. A one-sample t-test is commonly used to test a population mean when the population standard deviation is unknown. A one-sample exact binomial test can be used to test a population proportion when observations represent independent Bernoulli trials.</p>

<p>We will use TradeFlow's completed-delivery data to investigate average transit time and the proportion of deliveries completed within an illustrative five-day target.</p>

<p><b>Important data note:</b> five days is an illustrative benchmark for this lesson. It is not being presented as TradeFlow's actual service-level agreement. The dataset contains completed deliveries, and conclusions about all deliveries or future performance require consideration of missing, incomplete, delayed or otherwise unobserved records.</p>`,
  steps: [
    {
      type: 'explain',
      title: 'Choosing the right one-sample test',
      body: `<p>A one-sample hypothesis test compares a sample statistic with a specified population benchmark.</p>

<p>The correct test depends on the type of outcome and the assumptions that can reasonably be made about the data.</p>

<table class="mini">
<tr><th>Research question</th><th>Data type</th><th>Common test</th></tr>
<tr><td>Is average delivery time different from five days?</td><td>Numerical</td><td>One-sample t-test</td></tr>
<tr><td>Is the share of deliveries completed within five days different from 80%?</td><td>Binary outcome</td><td>One-sample binomial test</td></tr>
</table>

<p>A numerical variable can take a range of values, such as delivery time, order value or processing duration. A binary outcome has two possible categories, such as on-time versus late, approved versus rejected, or paid versus unpaid.</p>

<p><b>Why not use the same test for both?</b></p>

<p>A mean describes the centre of a numerical distribution. A proportion describes the fraction of observations belonging to a particular category.</p>

<p>Their sampling distributions and standard errors are different. Consequently, the statistical procedures used to evaluate them are also different.</p>

<p>For the mean, we will use the t-distribution to account for the fact that the population standard deviation is unknown and must be estimated from the sample.</p>

<p>For the proportion, we will use the binomial distribution. The exact binomial test calculates probabilities directly from the binomial model instead of relying on a large-sample normal approximation.</p>

<p>Choosing a statistical test is not a matter of selecting whichever Python function is easiest to run. It begins with understanding the question, the parameter being tested, the measurement scale and the assumptions behind the method.</p>`
    },
    {
      type: 'explain',
      title: 'The one-sample t-test for a population mean',
      body: `<p>Suppose TradeFlow wants to investigate whether its population mean delivery time differs from five days.</p>

<p>Let μ represent the population mean transit time. The hypotheses for a two-tailed test are:</p>

<p><b>H₀: μ = 5</b></p>
<p><b>H₁: μ ≠ 5</b></p>

<p>The one-sample t-test calculates the test statistic:</p>

<p><b>t = (x̄ − μ₀) / (s / √n)</b></p>

<p>Here, μ₀ is the benchmark value specified in the null hypothesis.</p>

<p>The denominator is the estimated standard error of the sample mean. It measures how much the sample mean is expected to vary across repeated samples under the model.</p>

<p>The test statistic is compared with a Student's t-distribution with n − 1 degrees of freedom.</p>

<p><b>Why use a t-distribution?</b></p>

<p>In many practical investigations, the population standard deviation σ is unknown. We therefore estimate it using the sample standard deviation s.</p>

<p>Using an estimated standard deviation introduces additional uncertainty. The t-distribution accounts for that uncertainty when the assumptions of the one-sample t-test are appropriate.</p>

<p>For large degrees of freedom, the t-distribution becomes similar to the standard normal distribution. For smaller samples, it has heavier tails.</p>

<p><b>When is a one-sample t-test appropriate?</b></p>

<ul>
<li>The outcome is numerical and the sample observations are independent.</li>
<li>The sample is obtained in a way that supports the population inference being made.</li>
<li>The population distribution is approximately normal, particularly when the sample is small, or the sample is large enough for the sampling distribution of the mean to be reasonably approximated by a normal distribution.</li>
<li>The data do not contain extreme outliers that make the sample mean and standard deviation misleading.</li>
</ul>

<p>The t-test is often reasonably robust to moderate departures from normality when the sample is sufficiently large. However, a large sample does not repair selection bias, dependence between observations or serious data-quality problems.</p>

<p><b>Important:</b> the test does not require the observed sample itself to look perfectly normal in every situation. What matters is whether the sampling distribution of the mean is adequately represented by the t-based procedure. For small samples, strong skewness and extreme outliers can make the test unreliable.</p>`
    },
    {
      type: 'explain',
      title: 'Run a one-sample t-test with SciPy',
      body: `<p>Python's SciPy library provides the <code>ttest_1samp()</code> function for a one-sample t-test.</p>

<p>Its basic structure is:</p>

<pre><code>stats.ttest_1samp(
    sample,
    popmean=benchmark,
    alternative="two-sided"
)</code></pre>

<p>Let's understand the arguments:</p>

<ul>
<li><b>sample:</b> the numerical observations being tested.</li>
<li><b>popmean:</b> the population mean specified by the null hypothesis.</li>
<li><b>alternative:</b> the alternative hypothesis. It can be <code>"two-sided"</code>, <code>"greater"</code> or <code>"less"</code>.</li>
</ul>

<p>The function returns a result containing the t-statistic and p-value.</p>

<p>For example, if the research question is whether average delivery time is greater than five days, use:</p>

<pre><code>stats.ttest_1samp(
    transit,
    popmean=5,
    alternative="greater"
)</code></pre>

<p>This is a right-tailed test. It evaluates evidence that the population mean exceeds five days.</p>

<p>If the question is whether the mean differs from five days in either direction, use <code>alternative="two-sided"</code>.</p>

<p>If the question is whether the mean is lower than five days, use <code>alternative="less"</code>.</p>

<p><b>Do not choose the alternative argument after looking at the result.</b> The research question determines the direction before the test is conducted.</p>

<p><b>What does the output mean?</b></p>

<ul>
<li><b>Statistic:</b> the calculated t-statistic. Its sign indicates whether the sample mean is above or below the benchmark.</li>
<li><b>pvalue:</b> the probability, under the null hypothesis and test assumptions, of obtaining a test statistic at least as extreme as the observed statistic in the specified direction.</li>
<li><b>df:</b> degrees of freedom, which for a one-sample t-test equal n − 1.</li>
</ul>

<p>The p-value must be interpreted using the significance level chosen before the analysis. The statistic alone does not determine whether a result is statistically significant.</p>`
    },
    {
      type: 'try',
      title: 'Demonstration: test the mean delivery time',
      body: `<p>Let's investigate whether the population mean delivery time differs from five days.</p>

<p>We will first examine the sample size, mean and standard deviation. We will then conduct a two-tailed one-sample t-test.</p>

<p>Notice that the code uses the <code>transit</code> series created in the lesson setup. The test is applied only to valid, non-negative transit times calculated from records with usable dispatch and delivery dates.</p>`,
      code: `# Describe the sample.
sample_size = len(transit)
sample_mean = transit.mean()
sample_std = transit.std(ddof=1)

print("Number of observations:", sample_size)
print("Sample mean:", round(sample_mean, 3), "days")
print("Sample standard deviation:", round(sample_std, 3), "days")

# Test whether the population mean differs from five days.
test_result = stats.ttest_1samp(
    transit,
    popmean=5,
    alternative="two-sided"
)

print("\\nOne-sample t-test")
print("t-statistic:", round(test_result.statistic, 4))
print("p-value:", round(test_result.pvalue, 6))
print("Degrees of freedom:", test_result.df)`,
      explanation: `<p><b>Step 1: Describe the sample.</b></p>
<p><code>len(transit)</code> returns the number of valid observations. The mean and sample standard deviation describe the observed delivery times.</p>

<p><b>Step 2: Run the test.</b></p>
<p><code>stats.ttest_1samp()</code> compares the sample mean with the benchmark of five days. The <code>alternative="two-sided"</code> argument means that differences in either direction count as evidence against the null hypothesis.</p>

<p><b>Step 3: Interpret the output.</b></p>
<p>The t-statistic measures the difference from five days in estimated standard-error units. The p-value measures how unusual a result at least this extreme would be under the null model.</p>

<p>The actual conclusion must be based on the output produced by your dataset. Do not assume the result is significant simply because the sample mean is above five days.</p>`
    },
    {
      type: 'explain',
      title: 'One-tailed and two-tailed tests in practice',
      body: `<p>The alternative hypothesis determines which part of the reference distribution contributes to the p-value.</p>

<p>For a two-tailed test, evidence in either direction matters. For a one-tailed test, evidence matters in one specified direction.</p>

<p>Consider the following three questions:</p>

<table class="mini">
<tr><th>Business question</th><th>Alternative hypothesis</th><th>SciPy argument</th></tr>
<tr><td>Is the mean different from five days?</td><td>μ ≠ 5</td><td><code>two-sided</code></td></tr>
<tr><td>Is the mean greater than five days?</td><td>μ &gt; 5</td><td><code>greater</code></td></tr>
<tr><td>Is the mean less than five days?</td><td>μ &lt; 5</td><td><code>less</code></td></tr>
</table>

<p>Suppose the observed t-statistic is positive. That means the sample mean is above the benchmark.</p>

<p>For a right-tailed test, a positive t-statistic is in the direction of the alternative. For a left-tailed test, the same positive statistic is in the opposite direction and therefore does not provide evidence for the stated alternative.</p>

<p><b>Why can a one-tailed test produce a smaller p-value?</b></p>

<p>A two-tailed test considers extreme results on both sides of the reference distribution. A one-tailed test considers only the specified direction. When the observed statistic is in that direction, the one-tailed p-value can be smaller.</p>

<p>However, a one-tailed test is not a shortcut for obtaining statistical significance. It is justified only when the research question genuinely concerns one direction and an effect in the opposite direction would not count as evidence for the stated claim.</p>

<p>For example, if management is investigating whether delivery times have become worse, a right-tailed test may be appropriate. If management wants to know whether delivery times have changed in either direction, a two-tailed test is more appropriate.</p>

<p><b>Pre-specification is essential.</b> The choice between a one-tailed and two-tailed test should be made before examining the observed result. Choosing the direction afterwards inflates the false-positive risk.</p>`
    },
    {
      type: 'check',
      title: 'Check your understanding: choose the correct alternative',
      question: 'A logistics analyst wants to test whether average delivery time has increased above a benchmark of five days. Which SciPy argument is appropriate?',
      options: [
        'alternative="less"',
        'alternative="greater"',
        'alternative="two-sided"',
        'alternative="equal"'
      ],
      answer: 1,
      why: [
        'The less alternative tests whether the population mean is below the benchmark.',
        'Correct. The question asks whether the population mean is greater than five days, so the right-tailed alternative is appropriate.',
        'The two-sided alternative tests for a difference in either direction.',
        'Equal is not a valid alternative argument for this SciPy test.'
      ]
    },
    {
      type: 'explain',
      title: 'Testing a population proportion with the binomial distribution',
      body: `<p>Not every business question concerns an average. Many operational questions concern a proportion.</p>

<p>Suppose TradeFlow wants to investigate whether at least 80% of its deliveries are completed within five days. We can create a binary outcome for each delivery:</p>

<ul>
<li>1 means the delivery took five days or fewer.</li>
<li>0 means the delivery took more than five days.</li>
</ul>

<p>Let p represent the true population proportion of deliveries completed within five days.</p>

<p>For an illustrative two-sided test against an 80% benchmark:</p>

<p><b>H₀: p = 0.80</b></p>
<p><b>H₁: p ≠ 0.80</b></p>

<p>The sample proportion is:</p>

<p><b>p̂ = x / n</b></p>

<p>Where:</p>

<ul>
<li><b>x:</b> the number of observations classified as successes.</li>
<li><b>n:</b> the total number of valid observations.</li>
<li><b>p̂:</b> the observed sample proportion.</li>
</ul>

<p>For example, if 160 out of 200 deliveries meet the illustrative target, the sample proportion is 160 / 200 = 0.80, or 80%.</p>

<p>However, observing a sample proportion of 80% does not prove that the population proportion is exactly 80%. Another sample could produce a different proportion even if the population proportion were unchanged.</p>

<p><b>Why the binomial distribution?</b></p>

<p>If each observation is an independent trial with the same probability p of success, the number of successes X in n trials follows a binomial distribution:</p>

<p><b>X ~ Binomial(n, p)</b></p>

<p>The probability of observing exactly x successes is:</p>

<p><b>P(X = x) = C(n, x) pˣ (1 − p)ⁿ⁻ˣ</b></p>

<p>The binomial model gives us a way to calculate how likely an observed number of successes would be if the null proportion were true.</p>

<p><b>When is the binomial model appropriate?</b></p>

<ul>
<li>Each observation can be classified as a success or failure.</li>
<li>The number of trials is fixed or clearly defined.</li>
<li>The observations are independent, or independence is a reasonable approximation.</li>
<li>The probability of success is constant across the trials under the model.</li>
</ul>

<p>These assumptions deserve attention. Deliveries from the same warehouse, route or period may share conditions and therefore may not be independent. If delivery performance changes substantially over time or across locations, a simple binomial test may not adequately represent the data-generating process.</p>`
    },
    {
      type: 'explain',
      title: 'The exact binomial test with SciPy',
      body: `<p>SciPy provides <code>stats.binomtest()</code> for an exact one-sample binomial test.</p>

<p>Its basic structure is:</p>

<pre><code>stats.binomtest(
    k=successes,
    n=trials,
    p=benchmark,
    alternative="two-sided"
)</code></pre>

<p>The arguments are:</p>

<ul>
<li><b>k:</b> the observed number of successes.</li>
<li><b>n:</b> the total number of trials.</li>
<li><b>p:</b> the success probability specified by the null hypothesis.</li>
<li><b>alternative:</b> the direction of the alternative hypothesis.</li>
</ul>

<p>For the illustrative five-day target, we can define success as a delivery taking five days or fewer.</p>

<p>In Python:</p>

<pre><code>on_time = transit <= 5
successes = on_time.sum()
trials = len(on_time)

result = stats.binomtest(
    k=successes,
    n=trials,
    p=0.80,
    alternative="two-sided"
)</code></pre>

<p><b>Why is this called an exact test?</b></p>

<p>It calculates the p-value using the binomial probability model rather than relying on a normal approximation to the binomial distribution.</p>

<p>Normal approximations can be useful for sufficiently large samples and suitable probability values. But they can be inaccurate when the sample is small or the benchmark proportion is close to zero or one.</p>

<p>The exact binomial test avoids that particular approximation. However, it does not eliminate the need for the binomial assumptions. An exact calculation under an inappropriate model can still lead to a misleading conclusion.</p>

<p><b>Interpreting the result</b></p>

<p>The result contains the observed sample proportion and a p-value. SciPy also provides a method for calculating a confidence interval for the population proportion.</p>

<p>A statistically significant result against p = 0.80 indicates evidence that the population proportion differs from 80% under the binomial model. It does not, by itself, explain why the proportion differs or establish whether the difference is operationally important.</p>`
    },
    {
      type: 'try',
      title: 'Demonstration: test the proportion of deliveries completed within five days',
      body: `<p>We will now apply an exact binomial test to the valid transit-time observations.</p>

<p>For this lesson, a delivery is classified as meeting the illustrative target when its transit time is five days or fewer.</p>

<p>We will test whether the population proportion differs from 80%. Remember that this is an educational benchmark, not an assertion about TradeFlow's actual contractual service target.</p>`,
      code: `# Define success as a delivery taking five days or fewer.
on_time = transit <= 5

# Count successes and total trials.
successes = int(on_time.sum())
trials = len(on_time)

# Calculate the observed sample proportion.
sample_proportion = successes / trials

print("Deliveries meeting the illustrative target:", successes)
print("Total valid deliveries:", trials)
print("Observed proportion:", round(sample_proportion, 4))

# Exact binomial test against an 80% benchmark.
binomial_result = stats.binomtest(
    k=successes,
    n=trials,
    p=0.80,
    alternative="two-sided"
)

print("\\nExact binomial test")
print("p-value:", round(binomial_result.pvalue, 6))
print("Estimated proportion:", round(binomial_result.statistic, 4))

# Calculate a 95% confidence interval.
confidence_interval = binomial_result.proportion_ci(
    confidence_level=0.95,
    method="exact"
)

print(
    "95% confidence interval:",
    round(confidence_interval.low, 4),
    "to",
    round(confidence_interval.high, 4)
)`,
      explanation: `<p><b>Step 1: Define success.</b></p>
<p><code>transit <= 5</code> creates a Boolean Series. Each valid delivery is classified as either meeting the illustrative target or not meeting it.</p>

<p><b>Step 2: Count successes and trials.</b></p>
<p><code>on_time.sum()</code> counts the True values because Python treats True as 1 and False as 0 in numerical operations. <code>len(on_time)</code> returns the total number of observations.</p>

<p><b>Step 3: Calculate the sample proportion.</b></p>
<p>Dividing the number of successes by the total number of trials gives the observed proportion.</p>

<p><b>Step 4: Conduct the test.</b></p>
<p><code>stats.binomtest()</code> compares the observed number of successes with what would be expected under a population success probability of 0.80.</p>

<p><b>Step 5: Calculate an interval.</b></p>
<p><code>proportion_ci()</code> returns an interval for the population proportion. The <code>method="exact"</code> argument requests an exact binomial interval.</p>

<p>Read the p-value and confidence interval together. The p-value evaluates the benchmark claim, while the interval communicates uncertainty around the population proportion.</p>`
    },
    {
      type: 'explain',
      title: 'Understanding the assumptions and limitations of one-sample tests',
      body: `<p>Statistical software can calculate a test statistic and p-value in a fraction of a second. That does not mean the result is automatically valid.</p>

<p>The analyst must assess whether the data and study design support the test being used.</p>

<p><b>1. Independence of observations</b></p>

<p>Many conventional one-sample procedures assume that observations are independent. One delivery's transit time should not provide unaccounted-for information about another delivery's transit time.</p>

<p>This assumption can be questionable when deliveries share a warehouse, vehicle, driver, route, supplier or disruption. For example, a warehouse outage may delay many deliveries simultaneously.</p>

<p>If observations are clustered, treating every delivery as fully independent can make the standard error too small and the evidence appear stronger than it should. Depending on the research question, a clustered analysis, multilevel model or cluster-aware resampling procedure may be more appropriate.</p>

<p><b>2. Sampling and representativeness</b></p>

<p>A statistical test cannot automatically correct a biased sample. If the dataset contains only completed deliveries, it may exclude deliveries that are still in transit, cancelled or otherwise missing.</p>

<p>Those exclusions can matter. If unusually delayed deliveries are more likely to remain incomplete, the observed completed-delivery times may understate the delivery time that would be seen across all dispatched orders.</p>

<p>The population to which a result applies must therefore be defined carefully. A result based on completed deliveries should not automatically be described as a result for every delivery ever dispatched.</p>

<p><b>3. Distributional assumptions for the t-test</b></p>

<p>The one-sample t-test is most sensitive to distributional problems when the sample is small. Strong skewness, extreme outliers and heavy tails can undermine the reliability of the test.</p>

<p>For large samples, the sampling distribution of the mean may be approximately normal under suitable conditions, but this does not solve every problem. Severe dependence, selection bias and data errors remain serious concerns.</p>

<p><b>4. Constant success probability for the binomial test</b></p>

<p>The simple binomial model assumes that every trial has the same probability of success under the model. If one region has much better delivery performance than another, combining all regions into one proportion may hide important differences.</p>

<p>Likewise, if performance changes over time, the assumption of a constant success probability may be unrealistic.</p>

<p><b>5. Measurement and data quality</b></p>

<p>Incorrect dates, inconsistent definitions of delivery completion, duplicated records and unusual data-entry errors can all affect the result. Statistical testing does not make poor-quality data reliable.</p>

<p><b>6. Multiple testing</b></p>

<p>If an analyst conducts many hypothesis tests, the probability of obtaining at least one false positive can increase. For example, testing dozens of routes, warehouses and customer segments separately at α = 0.05 creates a multiple-comparisons problem.</p>

<p>When many tests are planned, analysts may need procedures such as the Bonferroni correction or false discovery rate control. The appropriate approach depends on the analysis objective and the consequences of false discoveries.</p>

<p><b>The professional standard:</b> a test result is only as credible as the assumptions, measurement process, sampling design and interpretation that support it.</p>`
    },
    {
      type: 'check',
      title: 'Check your understanding: evaluate the test assumptions',
      question: 'TradeFlow combines deliveries from several warehouses. Deliveries from the same warehouse are affected by shared equipment failures and staffing shortages. Why might an ordinary one-sample test be problematic?',
      options: [
        'Because delivery time is always a categorical variable.',
        'Because observations may be dependent, violating the independence assumption.',
        'Because a large sample automatically makes all observations independent.',
        'Because hypothesis tests cannot be used with operational data.'
      ],
      answer: 1,
      why: [
        'Delivery time is numerical. It can be used in a one-sample mean test when the relevant assumptions are appropriate.',
        'Correct. Shared warehouse conditions can make delivery outcomes related. Ignoring this dependence can understate uncertainty.',
        'A large sample does not automatically remove dependence between observations.',
        'Hypothesis tests can be used with operational data, but the test design must reflect how the data were generated.'
      ]
    },
    {
      type: 'exercise',
      title: 'Exercise 1: calculate a one-sample t-statistic manually',
      body: `<p>Use a hypothetical sample to calculate the standard error and t-statistic for a test of whether the population mean differs from five days.</p>

<p>The sample has a mean of 5.6 days, a standard deviation of 2.4 days and 64 observations.</p>

<p>Calculate the values manually before using SciPy. This reinforces the relationship between the observed difference, sample variability and sample size.</p>`,
      starter: `import numpy as np

sample_mean = 5.6
benchmark = 5
sample_std = 2.4
n = 64

# Calculate the standard error.
standard_error =

# Calculate the t-statistic.
t_statistic =

print("Standard error:", standard_error)
print("t-statistic:", t_statistic)`,
      hints: [
        'The standard error is sample_std divided by the square root of n.',
        'The t-statistic is (sample_mean - benchmark) divided by the standard error.',
        'Use np.sqrt(n) to calculate the square root.'
      ],
      solution: `import numpy as np

sample_mean = 5.6
benchmark = 5
sample_std = 2.4
n = 64

standard_error = sample_std / np.sqrt(n)

t_statistic = (sample_mean - benchmark) / standard_error

print("Standard error:", standard_error)
print("t-statistic:", t_statistic)`,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 2: conduct a right-tailed one-sample t-test',
      body: `<p>TradeFlow's operations team wants to know whether average delivery time is greater than five days.</p>

<p>Use the <code>transit</code> data to conduct a right-tailed one-sample t-test.</p>

<p>Print the t-statistic, p-value and degrees of freedom. Then use a significance level of 0.05 to print the correct decision.</p>`,
      starter: `benchmark = 5
alpha = 0.05

# Conduct a right-tailed one-sample t-test.
result =

print("t-statistic:", result.statistic)
print("p-value:", result.pvalue)
print("Degrees of freedom:", result.df)

# Make the statistical decision.
if :
    print()
else:
    print()`,
      hints: [
        'Use stats.ttest_1samp(transit, popmean=benchmark, alternative="greater").',
        'The p-value is stored in result.pvalue.',
        'Reject the null hypothesis when the p-value is less than or equal to alpha.',
        'Use “Fail to reject the null hypothesis” when the p-value exceeds alpha.'
      ],
      solution: `benchmark = 5
alpha = 0.05

result = stats.ttest_1samp(
    transit,
    popmean=benchmark,
    alternative="greater"
)

print("t-statistic:", result.statistic)
print("p-value:", result.pvalue)
print("Degrees of freedom:", result.df)

if result.pvalue <= alpha:
    print("Reject the null hypothesis.")
else:
    print("Fail to reject the null hypothesis.")`,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 3: compare one-tailed and two-tailed questions',
      body: `<p>Use the same valid delivery-time sample to conduct two tests against the five-day benchmark:</p>

<ul>
<li>A two-tailed test asking whether the mean differs from five days.</li>
<li>A right-tailed test asking whether the mean is greater than five days.</li>
</ul>

<p>Print both p-values. Explain in a code comment why the two questions are not interchangeable.</p>

<p>The test direction must be chosen from the research question. The fact that both tests use the same data does not make them answer the same question.</p>`,
      starter: `benchmark = 5

two_sided_result =

right_tailed_result =

print("Two-tailed p-value:", two_sided_result.pvalue)
print("Right-tailed p-value:", right_tailed_result.pvalue)

# Explain the difference between the two research questions here.`,
      hints: [
        'Use alternative="two-sided" for the first test.',
        'Use alternative="greater" for the second test.',
        'The two-tailed test considers evidence in both directions; the right-tailed test considers evidence that the mean is greater than the benchmark.'
      ],
      solution: `benchmark = 5

two_sided_result = stats.ttest_1samp(
    transit,
    popmean=benchmark,
    alternative="two-sided"
)

right_tailed_result = stats.ttest_1samp(
    transit,
    popmean=benchmark,
    alternative="greater"
)

print("Two-tailed p-value:", two_sided_result.pvalue)
print("Right-tailed p-value:", right_tailed_result.pvalue)

# The two-tailed test asks whether the mean differs in either direction.
# The right-tailed test asks specifically whether the mean is greater.
# The research question must determine the alternative before testing.`,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 4: conduct an exact binomial test',
      body: `<p>Define a successful delivery as one completed within five days or fewer. Test whether the population proportion differs from the illustrative benchmark of 80%.</p>

<p>Use <code>stats.binomtest()</code> to calculate the exact p-value. Also calculate the observed sample proportion and a 95% exact confidence interval.</p>

<p>Make sure you count both the number of successes and the total number of valid observations.</p>`,
      starter: `on_time = transit <= 5

successes =
trials =

sample_proportion =

result = stats.binomtest(
    k=,
    n=,
    p=0.80,
    alternative="two-sided"
)

confidence_interval = result.proportion_ci(
    confidence_level=0.95,
    method="exact"
)

print("Successes:", successes)
print("Trials:", trials)
print("Sample proportion:", sample_proportion)
print("p-value:", result.pvalue)
print("95% confidence interval:")
print(confidence_interval)`,
      hints: [
        'Use int(on_time.sum()) to count successes.',
        'Use len(on_time) to count trials.',
        'The sample proportion is successes divided by trials.',
        'Pass successes and trials into the k and n arguments.'
      ],
      solution: `on_time = transit <= 5

successes = int(on_time.sum())
trials = len(on_time)

sample_proportion = successes / trials

result = stats.binomtest(
    k=successes,
    n=trials,
    p=0.80,
    alternative="two-sided"
)

confidence_interval = result.proportion_ci(
    confidence_level=0.95,
    method="exact"
)

print("Successes:", successes)
print("Trials:", trials)
print("Sample proportion:", sample_proportion)
print("p-value:", result.pvalue)
print("95% confidence interval:")
print(confidence_interval)`,
      ordered: true
    },
    {
      type: 'exercise',
      title: 'Exercise 5: interpret a proportion test without overstating the result',
      body: `<p>Suppose an exact binomial test produces a p-value of 0.018 against a benchmark population proportion of 0.80. The significance level was selected as 0.05.</p>

<p>Write a short decision-making program that prints the appropriate statistical conclusion.</p>

<p>Your conclusion must state that the result provides evidence that the population proportion differs from 80%. It must not claim that the population proportion is definitely different or that the test has identified the cause.</p>`,
      starter: `p_value = 0.018
alpha = 0.05

if :
    print()
else:
    print()`,
      hints: [
        'Compare p_value with alpha.',
        'The alternative hypothesis is two-sided, so the conclusion concerns a difference in either direction.',
        'A statistical test does not identify the cause of a difference.'
      ],
      solution: `p_value = 0.018
alpha = 0.05

if p_value <= alpha:
    print(
        "Reject the null hypothesis. "
        "The sample provides evidence that the population proportion "
        "differs from 80%."
    )
else:
    print(
        "Fail to reject the null hypothesis. "
        "The sample does not provide sufficient evidence that the "
        "population proportion differs from 80%."
    )`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Module 5.2 summary: testing means and proportions',
      body: `<p>You can now apply hypothesis testing to two important types of business outcome.</p>

<p><b>One-sample t-test</b></p>

<ul>
<li>Use it to test a claim about a population mean when the population standard deviation is unknown.</li>
<li>Calculate the t-statistic using the difference between the sample mean and benchmark divided by the estimated standard error.</li>
<li>Use the t-distribution with n − 1 degrees of freedom.</li>
<li>Choose a two-tailed, right-tailed or left-tailed test according to the research question.</li>
<li>Assess independence, sampling quality, outliers and distributional conditions.</li>
</ul>

<p><b>Exact binomial test</b></p>

<ul>
<li>Use it to test a claim about a population proportion when the outcome is binary and the binomial assumptions are reasonable.</li>
<li>Count the number of successes and total trials.</li>
<li>Compare the observed count with the binomial distribution under the null probability.</li>
<li>Use the exact p-value and, where appropriate, an exact confidence interval.</li>
<li>Assess independence and whether the probability of success can reasonably be treated as constant.</li>
</ul>

<p><b>The wider lesson</b></p>

<p>A hypothesis test is not just a Python function. It is a structured argument:</p>

<ol>
<li>Define the population and parameter of interest.</li>
<li>State the null and alternative hypotheses.</li>
<li>Choose the test that matches the data and research question.</li>
<li>Check whether the assumptions are reasonable.</li>
<li>Calculate and interpret the test statistic and p-value.</li>
<li>Make a decision using a preselected significance level.</li>
<li>Explain the estimated effect, uncertainty, limitations and practical importance.</li>
</ol>

<p>In the next part of Module 5, we will deepen this understanding by examining how statistical decisions are made in more complex settings, including comparisons between groups, the relationship between confidence intervals and hypothesis tests, and the consequences of conducting multiple tests.</p>`
    }
  ]
}
);
