
LESSONS.push(
{
  id: 'st-5-1',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'scipy'],
  loopGuard: true,
  files: ['deliveries'],
  setup: `import pandas as pd
import numpy as np
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

rng = np.random.default_rng(5101)
`,
  preloaded: ['deliveries', 'transit', 'rng'],
  title: '5.1 Hypothesis testing: questions, evidence and decisions',
  tables: [],
  intro: `In Module 4, you learned how to estimate population quantities and communicate uncertainty using confidence intervals. We now take the next step: using sample evidence to evaluate a specific claim about a population.

<p>Imagine that TradeFlow's operations team introduces a new delivery process. Management wants to know whether the average delivery time is different from a hypothetical benchmark of five days. The analytics team has delivery records, but observing a sample average is not enough to settle the question. We need a structured way to assess whether the observed difference is sufficiently unusual under a clearly stated claim.</p>

<p>That is the purpose of <b>hypothesis testing</b>. It is a formal statistical procedure for evaluating how compatible sample evidence is with a proposed population claim.</p>

<p>In this lesson, you will learn how to formulate null and alternative hypotheses, understand test statistics and p-values, choose a significance level, distinguish statistical from practical significance, and make decisions without overstating what the data prove.</p>

<p>The five-day benchmark used in this lesson is an <b>illustrative analytical benchmark</b>. It is not being presented as TradeFlow's actual delivery service-level agreement.</p>`,
  steps: [
    {
      type: 'explain',
      title: 'Why hypothesis testing exists',
      body: `<p>Suppose a sample of completed TradeFlow deliveries has an average transit time of 5.4 days. Is the population average really greater than five days, or could the difference have occurred because this particular sample happened to contain slower deliveries?</p>

<p>This is a question about <b>sampling variability</b>. If we repeatedly selected samples from the same population, we would not obtain exactly the same sample mean every time. Some samples would have means below the population mean; others would have means above it.</p>

<p>Hypothesis testing provides a framework for asking whether an observed sample result would be unusual if a particular population claim were true.</p>

<p>A hypothesis test does not directly reveal the truth about a population. It evaluates the strength of sample evidence against a specified statistical model and its assumptions.</p>

<div class="callout analogy"><b>An analogy:</b> Imagine that a quality-control team receives a shipment containing thousands of products. It cannot inspect every product, so it inspects a sample. If the sample contains an unusually high number of defective products, the team has reason to question the claim that the shipment meets the required quality standard. The sample does not prove that every product is defective; it provides evidence that the shipment may not meet the standard.</div>

<p>In business analytics, hypothesis testing can help investigate questions such as:</p>
<ul>
<li>Is the average delivery time different from a stated benchmark?</li>
<li>Has the proportion of orders delivered on time changed?</li>
<li>Does a new process appear to reduce average processing time?</li>
<li>Is the observed difference between two groups larger than we would reasonably expect from sampling variation alone?</li>
</ul>

<p>Notice that these questions refer to population characteristics, not merely the values observed in one dataset.</p>`
    },
    {
      type: 'explain',
      title: 'The null and alternative hypotheses',
      body: `<p>Every conventional hypothesis test begins by specifying two competing statements about a population parameter.</p>

<p>The <b>null hypothesis</b>, written as H₀, is the reference claim used to construct the statistical test. It commonly represents no difference, no effect, or a particular benchmark value.</p>

<p>The <b>alternative hypothesis</b>, written as H₁ or Hₐ, describes the direction or type of departure from the null hypothesis that the analyst wants to investigate.</p>

<p>Suppose μ represents the population mean transit time for the population of deliveries under study. If the illustrative benchmark is five days, a two-sided test is written as:</p>

<p><b>H₀: μ = 5</b></p>
<p><b>H₁: μ ≠ 5</b></p>

<p>The null hypothesis says that the population mean is five days. The alternative says that it is different from five days, whether higher or lower.</p>

<p>There are three common forms of alternative hypothesis:</p>

<table class="mini">
<tr><th>Test type</th><th>Null hypothesis</th><th>Alternative hypothesis</th></tr>
<tr><td>Two-sided</td><td>μ = 5</td><td>μ ≠ 5</td></tr>
<tr><td>Right-tailed</td><td>μ = 5</td><td>μ &gt; 5</td></tr>
<tr><td>Left-tailed</td><td>μ = 5</td><td>μ &lt; 5</td></tr>
</table>

<p>A <b>two-sided test</b> looks for evidence of a difference in either direction. A <b>right-tailed test</b> looks for evidence that the population parameter is greater than the benchmark. A <b>left-tailed test</b> looks for evidence that it is lower.</p>

<p>The direction must be selected from the research question before examining the test result. Choosing a one-sided test only after seeing which direction the sample moved can inflate the false-positive risk.</p>

<p>Another important distinction is that hypotheses concern population parameters. The sample mean is not the null hypothesis; it is a statistic calculated from observed data.</p>

<p>For example:</p>
<ul>
<li>μ is the unknown population mean transit time.</li>
<li>x̄ is the mean transit time calculated from the sample.</li>
<li>H₀: μ = 5 is a claim about the population.</li>
<li>x̄ = 5.4 is an observed sample result, if that is what the data produce.</li>
</ul>

<p>We use the sample statistic to evaluate the population claim. We do not confuse the two.</p>`
    },
    {
      type: 'explain',
      title: 'The test statistic: measuring how unusual the sample result is',
      body: `<p>A test statistic converts the sample evidence into a numerical quantity that can be compared with a probability distribution specified by the null hypothesis.</p>

<p>For a one-sample test of a population mean when the population standard deviation is unknown, the common test statistic is the one-sample t-statistic:</p>

<p><b>t = (x̄ − μ₀) / (s / √n)</b></p>

<p>Each part has a specific meaning:</p>
<ul>
<li><b>x̄:</b> the sample mean.</li>
<li><b>μ₀:</b> the mean specified by the null hypothesis.</li>
<li><b>s:</b> the sample standard deviation.</li>
<li><b>n:</b> the sample size.</li>
<li><b>s / √n:</b> the estimated standard error of the sample mean.</li>
</ul>

<p>The numerator measures the difference between the observed sample mean and the benchmark. The denominator measures the typical sampling variability of the sample mean under the model.</p>

<p>This means the t-statistic expresses the observed difference in standard-error units.</p>

<p>Suppose a sample mean is 5.4 days, the null value is five days, and the standard error is 0.1 day. The t-statistic would be:</p>

<p><b>t = (5.4 − 5) / 0.1 = 4</b></p>

<p>The sample mean is four estimated standard errors above the null value. That is a relatively large departure under the null model, although the actual p-value must be obtained from the appropriate t-distribution and degrees of freedom.</p>

<p>For a one-sample t-test, the degrees of freedom are n − 1. The t-distribution accounts for the additional uncertainty created by estimating the population standard deviation using the sample.</p>

<p>As the sample size increases, the t-distribution approaches the standard normal distribution. However, the t-distribution is the appropriate reference distribution for the conventional one-sample t-test when its assumptions are satisfied.</p>`
    },
    {
      type: 'explain',
      title: 'The p-value: what it does and does not tell us',
      body: `<p>The <b>p-value</b> is one of the most misunderstood ideas in statistics.</p>

<p>In a hypothesis test, the p-value is the probability, calculated under the assumption that the null hypothesis is true, of obtaining a test statistic at least as extreme as the one observed, in the direction or directions specified by the alternative hypothesis.</p>

<p>In simpler language, it asks:</p>

<div class="callout analogy"><b>If the null hypothesis were true, how surprising would our observed result be, or a result even more extreme?</b></div>

<p>A small p-value means that the observed result would be relatively unusual under the null model. It therefore provides evidence against the null hypothesis.</p>

<p>A large p-value means that the sample result is not especially unusual under the null model. It does not establish that the null hypothesis is true.</p>

<p>For a two-sided test, extremeness is assessed in both directions. For a right-tailed test, it is assessed in the upper tail. For a left-tailed test, it is assessed in the lower tail.</p>

<p>Consider the following interpretations:</p>
<ul>
<li><b>p = 0.03:</b> assuming the null hypothesis and model assumptions are correct, results at least this extreme would occur with probability 0.03 under the specified test.</li>
<li><b>p = 0.40:</b> the observed result is not particularly unusual under the null model.</li>
</ul>

<p>Neither statement means that there is a 3% or 40% probability that the null hypothesis is true.</p>

<p>The p-value is not:</p>
<ul>
<li>The probability that the null hypothesis is true.</li>
<li>The probability that the alternative hypothesis is true.</li>
<li>The probability that the result happened purely by chance.</li>
<li>A measure of the size or business importance of an effect.</li>
<li>A guarantee that a finding will replicate in another sample.</li>
</ul>

<p>A p-value is conditional on the null hypothesis and the statistical model. If the sample was biased, observations were dependent, or measurements were inaccurate, a small p-value does not repair those problems.</p>`
    },
    {
      type: 'explain',
      title: 'The significance level and the decision rule',
      body: `<p>Before conducting a test, analysts commonly select a <b>significance level</b>, represented by the Greek letter α (alpha).</p>

<p>The significance level is the maximum long-run probability of rejecting a true null hypothesis that the test procedure is designed to tolerate, assuming its conditions hold.</p>

<p>A frequently used significance level is α = 0.05. This is a convention, not a universal law. Some high-stakes applications require a smaller threshold, while exploratory work may use a different pre-specified approach.</p>

<p>The conventional decision rule is:</p>

<ul>
<li>If p-value ≤ α, reject H₀.</li>
<li>If p-value &gt; α, fail to reject H₀.</li>
</ul>

<p>Suppose α = 0.05:</p>

<table class="mini">
<tr><th>p-value</th><th>Decision</th></tr>
<tr><td>0.01</td><td>Reject H₀</td></tr>
<tr><td>0.04</td><td>Reject H₀</td></tr>
<tr><td>0.05</td><td>Reject H₀ under the conventional ≤ rule</td></tr>
<tr><td>0.08</td><td>Fail to reject H₀</td></tr>
<tr><td>0.31</td><td>Fail to reject H₀</td></tr>
</table>

<p>Be careful with the phrase <b>fail to reject</b>. It does not mean that we have proved or accepted the null hypothesis. It means that the available evidence did not cross the chosen threshold for rejecting it.</p>

<p>A test may fail to reject H₀ because the null hypothesis is close to the truth, because the sample is small, because variability is high, or because the effect is difficult to detect. The p-value alone cannot distinguish these explanations.</p>`
    },
    {
      type: 'explain',
      title: 'Type I error, Type II error and statistical power',
      body: `<p>Every hypothesis-testing procedure involves the possibility of making an incorrect decision.</p>

<table class="mini">
<tr><th>Reality</th><th>Decision</th><th>Outcome</th></tr>
<tr><td>H₀ is true</td><td>Reject H₀</td><td>Type I error</td></tr>
<tr><td>H₀ is true</td><td>Fail to reject H₀</td><td>Correct decision</td></tr>
<tr><td>H₀ is false</td><td>Reject H₀</td><td>Correct decision</td></tr>
<tr><td>H₀ is false</td><td>Fail to reject H₀</td><td>Type II error</td></tr>
</table>

<p>A <b>Type I error</b> occurs when we reject a null hypothesis that is actually true. Its long-run probability is controlled by the significance level α, provided the test assumptions hold.</p>

<p>A <b>Type II error</b> occurs when we fail to reject a null hypothesis that is actually false. Its probability is represented by β.</p>

<p><b>Statistical power</b> is the probability that a test correctly rejects the null hypothesis when a particular alternative is true:</p>

<p><b>Power = 1 − β</b></p>

<p>Power is not one fixed number for every possible alternative. It depends on the actual effect size, sample size, variability, significance level and test design.</p>

<p>Power generally increases when:</p>
<ul>
<li>The sample size increases.</li>
<li>The true effect is larger.</li>
<li>Measurement variability decreases.</li>
<li>The measurement process becomes more reliable.</li>
</ul>

<p>There is often a trade-off between Type I and Type II errors. If we make the significance threshold more stringent while keeping everything else fixed, we generally reduce the probability of a Type I error but may increase the probability of a Type II error.</p>

<p>In a delivery-performance investigation, a Type I error could lead management to believe that average delivery time has changed when it has not. A Type II error could cause management to overlook a genuine deterioration in delivery performance.</p>`
    },
    {
      type: 'explain',
      title: 'Statistical significance is not practical significance',
      body: `<p>A result can be statistically significant without being important to the business.</p>

<p>Imagine that a very large sample allows an analyst to detect a mean delivery-time difference of 0.02 days. The p-value might be small because the standard error is extremely small. But a difference of 0.02 days is less than half an hour. Management may decide that this difference has little operational value.</p>

<p>Now imagine a smaller sample produces an estimated difference of 1.5 days, but the p-value is 0.08. The effect could be operationally important, even though the test does not cross a conventional 5% significance threshold.</p>

<p>These are different questions:</p>
<ul>
<li><b>Statistical question:</b> Is the observed evidence sufficiently inconsistent with the null model?</li>
<li><b>Practical question:</b> Is the estimated difference large enough to matter in the real-world decision?</li>
</ul>

<p>Analysts should report the estimated effect size and a confidence interval alongside the p-value. This helps readers understand the direction, magnitude and uncertainty of the result.</p>

<p>For business decisions, the analyst should also consider costs, operational constraints, customer experience and the consequences of acting or not acting.</p>`
    },
    {
      type: 'exercise',
      id: 'st-5-1-ex1',
      title: 'Translate a business question into hypotheses',
      body: `<p>TradeFlow is investigating whether the population mean transit time differs from an illustrative five-day benchmark.</p>
<p>Let μ represent the population mean transit time. Write the null and alternative hypotheses for a two-sided test.</p>`,
      starter: `# Write the null and alternative hypotheses as comments.

# H0:

# H1:
`,
      hints: [
        'The null hypothesis contains the benchmark equality.',
        'A two-sided alternative uses the not-equal symbol (≠).'
      ],
      solution: `# H0: mu = 5
# H1: mu != 5`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-1-ex2',
      title: 'Calculate a one-sample t-statistic manually',
      body: `<p>Suppose an independent sample has a mean transit time of 5.4 days, a sample standard deviation of 1.2 days, and 36 observations. The null mean is five days.</p>
<p>Calculate the standard error and t-statistic. Define every variable in this exercise rather than relying on variables from another exercise.</p>`,
      starter: `import numpy as np

sample_mean = 5.4
null_mean = 5.0
sample_std = 1.2
sample_size = 36

# Calculate the standard error.

# Calculate the t-statistic.

# Print both values.
`,
      hints: [
        'The standard error is sample_std divided by the square root of sample_size.',
        'Subtract the null mean from the sample mean, then divide by the standard error.'
      ],
      solution: `import numpy as np

sample_mean = 5.4
null_mean = 5.0
sample_std = 1.2
sample_size = 36

standard_error = sample_std / np.sqrt(sample_size)
t_statistic = (sample_mean - null_mean) / standard_error

print("Standard error:", round(standard_error, 4))
print("t-statistic:", round(t_statistic, 4))`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-1-ex3',
      title: 'Interpret a p-value correctly',
      body: `<p>An analyst reports a two-sided p-value of 0.032.</p>
<p>Assuming the null hypothesis and test assumptions are correct, calculate the percentage probability represented by this p-value. Then print a careful interpretation.</p>`,
      starter: `p_value = 0.032

# Convert the p-value to a percentage.

# Print an interpretation that begins with:
# "Assuming the null hypothesis is true..."
`,
      hints: [
        'Multiply the p-value by 100 to convert it to a percentage.',
        'Do not describe the result as the probability that the null hypothesis is true.'
      ],
      solution: `p_value = 0.032

percentage = p_value * 100

print(
    f"Assuming the null hypothesis and test assumptions are correct, "
    f"a result at least as extreme as the observed one would occur "
    f"with probability {percentage:.1f}% under the specified test."
)`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-1-ex4',
      title: 'Apply a significance threshold',
      body: `<p>Use a significance level of 0.05 to make the conventional decision for a test with a p-value of 0.041.</p>
<p>Store the decision in a variable and print it.</p>`,
      starter: `alpha = 0.05
p_value = 0.041

# Use an if/else statement to make the decision.

`,
      hints: [
        'Compare p_value with alpha.',
        'If p_value is less than or equal to alpha, reject the null hypothesis.'
      ],
      solution: `alpha = 0.05
p_value = 0.041

if p_value <= alpha:
    decision = "Reject the null hypothesis"
else:
    decision = "Fail to reject the null hypothesis"

print(decision)`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-1-ex5',
      title: 'Calculate statistical power',
      body: `<p>A proposed test has a Type II error probability of 0.20 for a particular effect size.</p>
<p>Calculate its statistical power and print the result as a percentage.</p>`,
      starter: `beta = 0.20

# Calculate power.

# Convert it to a percentage and print it.
`,
      hints: [
        'Power is equal to one minus beta.',
        'Multiply the resulting proportion by 100 to express it as a percentage.'
      ],
      solution: `beta = 0.20

power = 1 - beta
power_percentage = power * 100

print(f"Statistical power: {power_percentage:.1f}%")`,
      ordered: true
    },
    {
      type: 'check',
      id: 'st-5-1-c1',
      title: 'What does the null hypothesis represent?',
      body: `<p>In a conventional hypothesis test, what is the role of the null hypothesis?</p>`,
      options: [
        'It is always the claim that the business wants to prove.',
        'It is the reference claim used to construct the statistical test.',
        'It is the sample mean calculated from the dataset.',
        'It is the probability that the alternative hypothesis is true.'
      ],
      answer: 1,
      why: [
        'The null hypothesis is not necessarily the business claim the analyst hopes to support.',
        'Correct. The null hypothesis supplies the reference condition under which the test statistic and p-value are evaluated.',
        'The sample mean is a statistic, not a hypothesis about the population.',
        'A null hypothesis is not a probability statement about the alternative.'
      ]
    },
    {
      type: 'check',
      id: 'st-5-1-c2',
      title: 'What does a p-value of 0.03 mean?',
      body: `<p>Assume the test is correctly specified and the null hypothesis is true. Which interpretation is correct?</p>`,
      options: [
        'There is a 3% probability that the null hypothesis is true.',
        'There is a 97% probability that the alternative hypothesis is true.',
        'The probability of obtaining a result at least as extreme as the observed result is 3% under the null model.',
        'The sample result is 3% larger than the population value.'
      ],
      answer: 2,
      why: [
        'A p-value is not the probability that the null hypothesis is true.',
        'A p-value does not calculate the probability that the alternative hypothesis is true.',
        'Correct. This is the conditional probability represented by the p-value.',
        'A p-value is not a percentage difference between sample and population values.'
      ]
    },
    {
      type: 'check',
      id: 'st-5-1-c3',
      title: 'What is a Type II error?',
      body: `<p>Which situation describes a Type II error?</p>`,
      options: [
        'Rejecting a null hypothesis that is true.',
        'Failing to reject a null hypothesis that is false.',
        'Rejecting a null hypothesis that is false.',
        'Failing to reject a null hypothesis that is true.'
      ],
      answer: 1,
      why: [
        'This is a Type I error.',
        'Correct. A Type II error occurs when a real departure from the null hypothesis is not detected by the test.',
        'This is a correct rejection.',
        'This is a correct non-rejection.'
      ]
    },
    {
      type: 'explain',
      title: 'The discipline of making a statistical decision',
      body: `<p>A defensible hypothesis test follows a sequence rather than jumping directly to a p-value.</p>
<ol>
<li>Define the population and the quantity being investigated.</li>
<li>Specify the null and alternative hypotheses.</li>
<li>Choose the significance level and test direction before examining the result.</li>
<li>Select a test whose assumptions match the data and research question.</li>
<li>Calculate the test statistic and p-value.</li>
<li>Make the reject or fail-to-reject decision.</li>
<li>Report the effect size, uncertainty, assumptions and practical implications.</li>
</ol>
<p>The conclusion must remain within the scope of the data. A test based on completed deliveries does not automatically describe deliveries that are still in transit, failed, cancelled or missing from the dataset.</p>

<p>In particular, the TradeFlow dataset contains completed delivery records and other delivery records with missing delivery dates. Analysing only completed records may introduce selection bias if the completed deliveries differ systematically from the full population of interest. The test cannot correct that design limitation.</p>

<p>Hypothesis testing is a method for evaluating evidence. It is not a substitute for understanding how the observations were collected.</p>`
    },
    {
      type: 'explain',
      title: 'Lesson 5.1 complete: evidence, uncertainty and decisions',
      body: `<p>You should now be able to explain the logic behind hypothesis testing rather than treating it as a button that produces a p-value.</p>
<ul>
<li>A null hypothesis defines the reference claim.</li>
<li>An alternative hypothesis specifies the departure being investigated.</li>
<li>A test statistic measures the observed departure relative to its expected sampling variability.</li>
<li>A p-value measures how extreme the observed evidence is under the null model.</li>
<li>The significance level establishes a decision threshold.</li>
<li>Type I and Type II errors describe two different ways a decision can be wrong.</li>
<li>Statistical significance and practical importance are not the same thing.</li>
</ul>
<p>In Lesson 5.2, you will implement hypothesis tests in Python, including a one-sample t-test for a population mean and an exact binomial test for a population proportion.</p>`
    }
  ]
}
);

LESSONS.push(
{
  id: 'st-5-2',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'scipy'],
  loopGuard: true,
  files: ['deliveries'],
  setup: `import pandas as pd
import numpy as np
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

rng = np.random.default_rng(5202)
`,
  preloaded: ['deliveries', 'transit', 'rng'],
  title: '5.2 One-sample tests: testing means and proportions',
  tables: [],
  intro: `In Lesson 5.1, you learned the logic of hypothesis testing: formulate a claim, measure how far the sample departs from it, calculate a p-value and make a carefully qualified decision.

<p>Now we will put that logic into practice using Python.</p>

<p>Many business questions involve either an average or a proportion. For example, TradeFlow may want to investigate whether the average delivery duration differs from a benchmark, or whether the proportion of completed deliveries meeting an illustrative delivery target differs from a stated percentage.</p>

<p>These questions require different statistical tests. A mean describes the average value of a numerical variable. A proportion describes the share of observations belonging to a specified category or meeting a condition.</p>

<p>In this lesson, you will use the <b>one-sample t-test</b> to test a population mean and the <b>exact binomial test</b> to test a population proportion. You will learn how to define the sample correctly, interpret the output, check assumptions and communicate the results responsibly.</p>

<p>The five-day delivery target and 80% benchmark used in examples are illustrative analytical values, not verified TradeFlow service commitments.</p>`,
  steps: [
    {
      type: 'explain',
      title: 'Choose the test based on the parameter',
      body: `<p>Before selecting a statistical test, identify the population parameter in the research question.</p>

<table class="mini">
<tr><th>Question</th><th>Parameter</th><th>Typical one-sample test</th></tr>
<tr><td>Is the average delivery time different from five days?</td><td>Population mean μ</td><td>One-sample t-test</td></tr>
<tr><td>Is the proportion of on-time deliveries different from 80%?</td><td>Population proportion p</td><td>One-sample binomial test</td></tr>
</table>

<p>A one-sample test compares information from one sample with a specified population benchmark. It does not compare two independent groups. Tests comparing two groups are covered later in the course.</p>

<p>For a mean, the data must be numerical. For a proportion, each observation must be classifiable into one of two outcomes for the condition being tested: success or failure.</p>

<p>For example, we can define a successful delivery as one completed within five days. Each eligible delivery then contributes either:</p>
<ul>
<li>Success: transit time is five days or less.</li>
<li>Failure: transit time is greater than five days.</li>
</ul>

<p>The definition of success must be explicit. Changing the threshold changes the outcome being measured and therefore changes the population proportion under investigation.</p>`
    },
    {
      type: 'explain',
      title: 'The one-sample t-test for a population mean',
      body: `<p>The one-sample t-test evaluates whether a sample provides sufficient evidence that a population mean differs from a specified benchmark.</p>

<p>Its hypotheses for a two-sided test are:</p>
<p><b>H₀: μ = μ₀</b></p>
<p><b>H₁: μ ≠ μ₀</b></p>

<p>The test statistic is:</p>
<p><b>t = (x̄ − μ₀) / (s / √n)</b></p>

<p>Under the null hypothesis, the statistic follows a t-distribution with n − 1 degrees of freedom when the usual model assumptions are satisfied.</p>

<p>The test is particularly useful when the population standard deviation is unknown and is estimated from the sample. This is common in practical analytics.</p>

<p>The conventional assumptions and considerations include:</p>
<ul>
<li><b>Quantitative outcome:</b> the variable should be numerical, such as transit time measured in days.</li>
<li><b>Independence:</b> observations should be independent, or the sampling design must be accounted for.</li>
<li><b>Sampling design:</b> the sample should support inference to the population being discussed.</li>
<li><b>Distribution:</b> for small samples, the population distribution should be reasonably compatible with the t-test assumptions, without severe skewness or influential outliers.</li>
<li><b>Larger samples:</b> the sampling distribution of the mean can often be approximated by the t model under broader population shapes, but extreme outliers, dependence and selection bias remain concerns.</li>
</ul>

<p>The t-test does not require the raw observations to be perfectly normally distributed in every practical application. However, a small sample with extreme skewness or influential outliers deserves careful investigation.</p>`
    },
    {
      type: 'explain',
      title: 'Run a one-sample t-test with SciPy',
      body: `<p>Python's SciPy library provides the function <code>scipy.stats.ttest_1samp()</code>.</p>

<p>Its basic form is:</p>
<pre><code>stats.ttest_1samp(sample, popmean=benchmark, alternative="two-sided")</code></pre>

<p>The important arguments are:</p>
<ul>
<li><b>sample:</b> the numerical observations being tested.</li>
<li><b>popmean:</b> the value specified by the null hypothesis.</li>
<li><b>alternative:</b> the alternative hypothesis. Common values are "two-sided", "greater" and "less".</li>
</ul>

<p>The returned result includes a t-statistic and a p-value. The statistic describes the sample's standardised departure from the null value. The p-value measures how extreme that statistic is under the null model and the chosen alternative.</p>

<p>For a two-sided test, the function evaluates departures in both directions. For a greater test, it evaluates evidence that the population mean is greater than the benchmark. For a less test, it evaluates evidence that the population mean is lower.</p>

<p>Use the alternative that matches the research question established before inspecting the result. Do not switch the direction merely because one result produces a smaller p-value.</p>`
    },
    {
      type: 'explain',
      title: 'The one-sample binomial test for a population proportion',
      body: `<p>A proportion is the fraction of population observations that meet a clearly defined condition.</p>

<p>Suppose p represents the population proportion of eligible deliveries completed within five days. If the illustrative benchmark is 0.80, a two-sided test is:</p>

<p><b>H₀: p = 0.80</b></p>
<p><b>H₁: p ≠ 0.80</b></p>

<p>Each observation is classified as a success or failure. If n independent observations are sampled and each has the same success probability p, the number of successes X follows a binomial distribution:</p>

<p><b>X ~ Binomial(n, p)</b></p>

<p>The exact binomial test evaluates how unusual the observed number of successes would be under the null proportion.</p>

<p>SciPy provides <code>stats.binomtest()</code>. Its basic form is:</p>

<pre><code>stats.binomtest(
    k=successes,
    n=sample_size,
    p=benchmark,
    alternative="two-sided"
)</code></pre>

<p>Here:</p>
<ul>
<li><b>k:</b> the observed number of successes.</li>
<li><b>n:</b> the number of eligible observations.</li>
<li><b>p:</b> the proportion specified by the null hypothesis.</li>
<li><b>alternative:</b> the direction of the test.</li>
</ul>

<p>The exact binomial test is useful because it does not rely on the large-sample normal approximation to the binomial distribution. This is particularly valuable when the sample is small or the benchmark proportion is close to zero or one.</p>

<p>Its assumptions still matter. The observations should be independent and the success definition should be consistent. If observations are clustered by warehouse or route, a simple binomial model may understate uncertainty.</p>`
    },
    {
      type: 'explain',
      title: 'Why the exact binomial test matters',
      body: `<p>For sufficiently large samples, analysts sometimes approximate a sample proportion's distribution using a normal distribution. A common standard error under the null hypothesis is:</p>

<p><b>SE = √(p₀(1 − p₀) / n)</b></p>

<p>The corresponding normal test statistic is:</p>
<p><b>z = (p̂ − p₀) / √(p₀(1 − p₀) / n)</b></p>

<p>This approximation can be useful when the expected numbers of successes and failures are sufficiently large. But it can be inaccurate when the sample is small or the benchmark is near zero or one.</p>

<p>The exact binomial test calculates probabilities using the binomial distribution itself rather than relying on the normal approximation.</p>

<p>For a two-sided exact binomial test, the calculation accounts for outcomes at least as incompatible with the null proportion as the observed result, according to the test's two-sided probability definition.</p>

<p>For most ordinary analyst workflows, using SciPy's tested implementation is safer than manually summing binomial probabilities. It also makes the alternative hypothesis explicit.</p>`
    },
    {
      type: 'explain',
      title: 'Prepare the TradeFlow sample carefully',
      body: `<p>Before running either test, we need to understand what the dataset actually contains.</p>

<p>The <code>transit</code> variable in the lesson setup is calculated from records with valid dispatch and delivery dates and non-negative transit durations.</p>

<p>This is a sample of deliveries with recorded completion dates. It does not automatically represent every order, every attempted delivery or every delivery that was still in transit.</p>

<p>That distinction matters because the missing delivery dates in the source data are not necessarily random. Some records may represent deliveries still in transit or failed deliveries. Excluding them can change the population to which the analysis applies.</p>

<p>For the mean test, we investigate the mean transit time among the eligible completed deliveries represented by the sample.</p>

<p>For the proportion test, we define an on-time success as a completed delivery with transit time of five days or less. The resulting proportion is conditional on the eligible completed-delivery sample.</p>

<p>Do not silently generalise either result to all orders. A more complete operational analysis would examine incomplete deliveries, failed deliveries, routes, warehouses, time periods and other potential sources of systematic differences.</p>`
    },
    {
      type: 'exercise',
      id: 'st-5-2-ex1',
      title: 'Inspect the delivery-time sample',
      body: `<p>Use the preloaded <code>transit</code> sample to calculate its size, mean and sample standard deviation. These are descriptive statistics, not hypothesis-test conclusions.</p>`,
      starter: `# Use the preloaded transit Series.

# Calculate the sample size.

# Calculate the sample mean.

# Calculate the sample standard deviation using ddof=1.

# Print all three results.
`,
      hints: [
        'Use len(transit) for the number of observations.',
        'Use transit.mean() and transit.std(ddof=1) for the mean and sample standard deviation.'
      ],
      solution: `sample_size = len(transit)
sample_mean = transit.mean()
sample_std = transit.std(ddof=1)

print("Sample size:", sample_size)
print("Sample mean:", round(sample_mean, 3), "days")
print("Sample standard deviation:", round(sample_std, 3), "days")`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-2-ex2',
      title: 'Conduct a two-sided one-sample t-test',
      body: `<p>Test whether the population mean transit time differs from the illustrative five-day benchmark.</p>
<p>Use the preloaded <code>transit</code> data and SciPy's <code>ttest_1samp()</code>. Print the t-statistic and p-value.</p>`,
      starter: `benchmark = 5.0

# Run the two-sided one-sample t-test.

# Print the t-statistic.

# Print the p-value.
`,
      hints: [
        'Call stats.ttest_1samp(transit, popmean=benchmark, alternative="two-sided").',
        'The returned object has statistic and pvalue attributes.'
      ],
      solution: `benchmark = 5.0

test_result = stats.ttest_1samp(
    transit,
    popmean=benchmark,
    alternative="two-sided"
)

print("t-statistic:", round(test_result.statistic, 4))
print("p-value:", test_result.pvalue)`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-2-ex3',
      title: 'Make and communicate the t-test decision',
      body: `<p>Repeat the two-sided test against the five-day benchmark. Use a significance level of 0.05.</p>
<p>Print the decision and a short statement that identifies the population quantity being investigated.</p>`,
      starter: `benchmark = 5.0
alpha = 0.05

test_result = stats.ttest_1samp(
    transit,
    popmean=benchmark,
    alternative="two-sided"
)

# Compare the p-value with alpha.

# Print the decision and a qualified conclusion.
`,
      hints: [
        'Use test_result.pvalue <= alpha for the rejection rule.',
        'Describe the conclusion as evidence about the mean among eligible completed deliveries, not all orders.'
      ],
      solution: `benchmark = 5.0
alpha = 0.05

test_result = stats.ttest_1samp(
    transit,
    popmean=benchmark,
    alternative="two-sided"
)

if test_result.pvalue <= alpha:
    decision = "Reject the null hypothesis"
    conclusion = (
        "There is statistically significant evidence that the "
        "population mean transit time for the eligible completed "
        "deliveries differs from five days."
    )
else:
    decision = "Fail to reject the null hypothesis"
    conclusion = (
        "The sample does not provide sufficient evidence that the "
        "population mean transit time for the eligible completed "
        "deliveries differs from five days."
    )

print("Decision:", decision)
print("Conclusion:", conclusion)
print("p-value:", test_result.pvalue)`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-2-ex4',
      title: 'Create a binary on-time outcome',
      body: `<p>For this exercise, define an eligible completed delivery as on time when its transit duration is five days or less.</p>
<p>Create a Boolean outcome, calculate the number of successes and the observed sample proportion, and print the results.</p>`,
      starter: `# Define the illustrative target.

target_days = 5

# Create a Boolean Series identifying on-time deliveries.

# Count the successes.

# Calculate the observed proportion.

# Print the results.
`,
      hints: [
        'Use transit <= target_days to create the Boolean Series.',
        'Use sum() to count True values and mean() to calculate the proportion of True values.'
      ],
      solution: `target_days = 5

on_time = transit <= target_days

successes = int(on_time.sum())
sample_size = len(on_time)
sample_proportion = on_time.mean()

print("On-time deliveries:", successes)
print("Eligible completed deliveries:", sample_size)
print("Observed on-time proportion:", round(sample_proportion, 4))
print("Observed on-time percentage:", round(sample_proportion * 100, 2), "%")`,
      ordered: true
    },
    {
      type: 'exercise',
      id: 'st-5-2-ex5',
      title: 'Conduct an exact binomial test',
      body: `<p>Test whether the population proportion of eligible completed deliveries meeting the illustrative five-day target differs from 80%.</p>
<p>Use the success count and sample size calculated directly from <code>transit</code> within this exercise. Run a two-sided exact binomial test and print the p-value and decision at α = 0.05.</p>`,
      starter: `target_days = 5
benchmark_proportion = 0.80
alpha = 0.05

# Define the on-time outcomes.

# Calculate the number of successes and sample size.

# Run stats.binomtest().

# Print the observed proportion, p-value and decision.
`,
      hints: [
        'Create on_time = transit <= target_days, then calculate successes with on_time.sum().',
        'Use stats.binomtest(k=successes, n=sample_size, p=benchmark_proportion, alternative="two-sided").'
      ],
      solution: `target_days = 5
benchmark_proportion = 0.80
alpha = 0.05

on_time = transit <= target_days

successes = int(on_time.sum())
sample_size = len(on_time)
sample_proportion = successes / sample_size

proportion_test = stats.binomtest(
    k=successes,
    n=sample_size,
    p=benchmark_proportion,
    alternative="two-sided"
)

if proportion_test.pvalue <= alpha:
    decision = "Reject the null hypothesis"
else:
    decision = "Fail to reject the null hypothesis"

print("Successes:", successes)
print("Sample size:", sample_size)
print("Observed proportion:", round(sample_proportion, 4))
print("p-value:", proportion_test.pvalue)
print("Decision:", decision)`,
      ordered: true
    },
    {
      type: 'check',
      id: 'st-5-2-c1',
      title: 'Which test investigates a population mean?',
      body: `<p>An analyst wants to determine whether the average transit duration differs from five days. Which test is the appropriate one-sample procedure when the population standard deviation is unknown?</p>`,
      options: [
        'A one-sample t-test',
        'An exact binomial test',
        'A chi-square test of independence',
        'A test of two independent means'
      ],
      answer: 0,
      why: [
        'Correct. A one-sample t-test evaluates a numerical sample mean against a specified population mean.',
        'A binomial test evaluates a proportion or success probability, not a numerical mean.',
        'A chi-square test of independence investigates relationships between categorical variables.',
        'A two-independent-means test compares two separate groups rather than one sample with a benchmark.'
      ]
    },
    {
      type: 'check',
      id: 'st-5-2-c2',
      title: 'Why use an exact binomial test?',
      body: `<p>Why might an analyst prefer an exact binomial test to a normal approximation when testing a population proportion?</p>`,
      options: [
        'It removes the need for independent observations.',
        'It automatically corrects selection bias.',
        'It calculates probabilities from the binomial distribution without relying on the large-sample normal approximation.',
        'It proves that the benchmark proportion is correct.'
      ],
      answer: 2,
      why: [
        'The binomial model still relies on an appropriate independence assumption.',
        'No statistical test automatically repairs selection bias.',
        'Correct. The exact procedure uses the binomial distribution directly, which is particularly useful for small samples or proportions near the boundaries.',
        'A test evaluates evidence against a benchmark; it does not prove the benchmark is correct.'
      ]
    },
    {
      type: 'check',
      id: 'st-5-2-c3',
      title: 'What does a non-significant result establish?',
      body: `<p>A one-sample t-test produces a p-value of 0.12 at a significance level of 0.05. What is the correct conclusion?</p>`,
      options: [
        'The population mean is definitely equal to the benchmark.',
        'The null hypothesis has been proven.',
        'The sample does not provide sufficient evidence to reject the null hypothesis at the chosen significance level.',
        'The probability that the null hypothesis is true is 12%.'
      ],
      answer: 2,
      why: [
        'A non-significant result does not prove exact equality.',
        'Hypothesis tests do not prove the null hypothesis.',
        'Correct. The p-value exceeds the pre-specified significance level, so we fail to reject the null hypothesis.',
        'The p-value is not the probability that the null hypothesis is true.'
      ]
    },
    {
      type: 'explain',
      title: 'Interpreting the results responsibly',
      body: `<p>When you report a one-sample test, do not report only the p-value. A useful report should include:</p>
<ul>
<li>The population quantity and benchmark being tested.</li>
<li>The sample size and the definition of the eligible sample.</li>
<li>The observed sample mean or proportion.</li>
<li>The test statistic and p-value.</li>
<li>The significance level and decision.</li>
<li>An effect estimate and, where appropriate, a confidence interval.</li>
<li>The assumptions and limitations that affect interpretation.</li>
</ul>

<p>For a mean, the observed difference from the benchmark is useful alongside the p-value. For a proportion, report the observed proportion and its difference from the benchmark. A confidence interval can help communicate the plausible range of population values.</p>

<p>Remember that a statistically significant result is not necessarily operationally important. Likewise, a non-significant result does not prove that no meaningful difference exists.</p>

<p>In the TradeFlow example, the tests concern the completed deliveries represented in the sample. The results should not be described as evidence about every order or every delivery attempt without a stronger sampling design and a clear treatment of incomplete and failed deliveries.</p>`
    },
    {
      type: 'explain',
      title: 'Module 5 complete: from claims to statistical evidence',
      body: `<p>You have now moved from describing data and estimating population quantities to formally evaluating statistical claims.</p>

<p>You can now:</p>
<ul>
<li>Formulate null and alternative hypotheses.</li>
<li>Distinguish one-sided and two-sided tests.</li>
<li>Explain test statistics, p-values and significance levels.</li>
<li>Identify Type I and Type II errors and explain statistical power.</li>
<li>Distinguish statistical significance from practical importance.</li>
<li>Run a one-sample t-test for a population mean.</li>
<li>Run an exact binomial test for a population proportion.</li>
<li>Interpret results in the context of sampling assumptions and data limitations.</li>
</ul>

<p>The next module builds on these ideas by examining relationships between variables. You will learn how correlation describes association and how simple linear regression models the relationship between a numerical outcome and a predictor.</p>`
    }
  ]
}
);
