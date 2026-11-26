
LESSONS.push(
{
  id: 'st-4-1',
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

# A usable delivery-time observation needs both dates and a non-negative duration.
transit = deliveries.loc[
    deliveries["transit_days"].notna() & (deliveries["transit_days"] >= 0),
    "transit_days"
].astype(float).reset_index(drop=True)

rng = np.random.default_rng(2026)
`,
  preloaded: ['deliveries', 'transit', 'rng'],
  title: '4.1 From populations to samples: learning from part of the data',
  tables: [],
  intro: `TradeFlow's Head of Operations asks a deceptively simple question: <i>“What is the average delivery time across all the orders we handle?”</i> The analytics team could calculate an average from every recorded delivery with a usable dispatch and delivery date. But imagine the team is asked to estimate performance before all records have arrived, or to audit only a manageable selection of deliveries. How much can a sample tell us about the larger group?<br><br>In Module 1, you learned the difference between a population and a sample. Now we make that distinction precise. You will learn the language of parameters and statistics, see why two samples can produce different answers, compare random and biased sampling, and use Python to draw and describe samples from TradeFlow's delivery records.`,
  steps: [
    {
      type: 'explain',
      title: 'The population is the group we want to understand',
      body: `<p>Suppose TradeFlow wants to understand delivery time for every delivery completed during a particular quarter. That clearly defined group is the <b>population of interest</b>.</p>
<p>A population is not necessarily every record in a database. It is the complete group that answers the business question. If the question is about deliveries completed in October, November and December, then deliveries from other months do not belong to that population.</p>
<p>A <b>sample</b> is a subset of that population selected for analysis. Analysts use samples because collecting, checking or processing every possible observation may be expensive, slow or impossible.</p>
<table class="mini"><tr><th>Term</th><th>Meaning</th><th>TradeFlow example</th></tr>
<tr><td>Population</td><td>The full group the question concerns</td><td>All eligible deliveries in the quarter</td></tr>
<tr><td>Sample</td><td>The selected observations we actually analyse</td><td>400 deliveries selected from that quarter</td></tr>
<tr><td>Parameter</td><td>A numerical feature of the population</td><td>The true mean delivery time of all eligible deliveries</td></tr>
<tr><td>Statistic</td><td>A numerical feature calculated from a sample</td><td>The mean delivery time among the 400 selected deliveries</td></tr></table>
<p>The distinction between a parameter and a statistic is fundamental. A parameter describes the population. A statistic describes the sample. We often use a statistic to estimate a parameter because the parameter is unknown or not yet available.</p>
<div class="callout analogy"><b>Think of tasting a pot of soup.</b> The whole pot is the population. One spoonful is the sample. The taste of the spoonful is evidence about the whole pot—but only if the soup has been stirred and the spoonful is not taken from an unusual corner.</div>
<p>In statistical notation, the population mean is commonly written as μ (mu), while the sample mean is written as x̄ (x-bar). We use symbols to distinguish the quantity we want to know from the quantity we have calculated.</p>`
    },
    {
      type: 'explain',
      title: 'A statistic is an estimate, not the population truth',
      body: `<p>Suppose the true average delivery time in the target population is 5.4 days. If we select 100 deliveries and calculate an average of 5.1 days, our sample mean is 5.1 days. It does not change the population mean to 5.1. It is an estimate of that unknown value.</p>
<p>Another random sample of 100 deliveries might produce 5.6 days. A third might produce 5.3 days. These differences are not automatically evidence of a coding error. They are a natural consequence of observing different subsets of a variable population.</p>
<p>This is called <b>sampling variability</b>: a statistic changes from sample to sample, even when every sample is drawn from the same population using the same method.</p>
<div class="callout watch"><b>Important:</b> a sample can be large and still be biased. If TradeFlow samples only deliveries from Lagos, increasing that Lagos-only sample from 100 to 10,000 does not make it representative of deliveries across all operating countries. Sample size reduces random sampling uncertainty; it does not automatically remove selection bias.</div>
<p>We therefore need to ask two separate questions:</p>
<ol><li><b>Was the sample selected in a way that represents the target population?</b> This concerns bias and the sampling design.</li><li><b>How much would the statistic vary across repeated samples?</b> This concerns sampling variability and precision.</li></ol>
<p>A trustworthy estimate needs both a sensible design and an honest account of uncertainty.</p>`
    },
    {
      type: 'try',
      title: 'Inspect the population available in this lesson',
      body: `<p>The setup has calculated a delivery duration from the dispatch and delivery dates. It has excluded records with missing dates and negative durations. The remaining <code>transit</code> Series is the analysis population available in this lesson—not necessarily every delivery TradeFlow has ever attempted.</p>
<p>Run the code and inspect the number of eligible observations, their mean and their median. The mean and median are population summaries for this lesson's available records. We will pretend we do not know the population mean when we begin drawing samples.</p>
<p><b>Read the Python carefully:</b> <code>len(transit)</code> counts observations. <code>transit.mean()</code> calculates the arithmetic mean. <code>transit.median()</code> finds the middle value after ordering the observations.</p>`,
      code: `print("Eligible deliveries:", len(transit))
print("Population mean:", round(transit.mean(), 3))
print("Population median:", round(transit.median(), 3))`
    },
    {
      id: 'st-4-1-c1',
      type: 'check',
      title: 'Which quantity is a population parameter?',
      body: `<p>TradeFlow wants the average transit time across every eligible delivery in the target quarter.</p>`,
      options: [
        'The average transit time calculated from 80 sampled deliveries',
        'The true average transit time across all eligible deliveries in the quarter',
        'The number of rows in the sample',
        'The median of one randomly selected sample'
      ],
      answer: 1,
      why: [
        'That is a sample statistic because it is calculated from a subset.',
        'Correct. A population parameter describes the entire defined population, whether or not we know its value.',
        'A row count is a sample-size description, not the population mean.',
        'That is a sample statistic, not the population parameter.'
      ]
    },
    {
      type: 'explain',
      title: 'Random sampling: giving eligible observations a fair chance',
      body: `<p>A simple random sample of size n gives every possible sample of that size an equal chance of selection. In practice, a random-number generator can select row positions from a prepared population.</p>
<p>For a simple random sample without replacement, an observation cannot be selected twice in the same sample. That matches many audit situations: if the team selects 100 distinct delivery records, it does not want the same delivery counted repeatedly.</p>
<p>In Python, <code>rng.choice()</code> selects values from an array or sequence. Its <code>size</code> argument controls how many values to select. Setting <code>replace=False</code> means sampling without replacement. The random generator was created with a fixed seed in the setup, so the same sequence of random choices can be reproduced when the code is run again.</p>
<div class="callout tip"><b>Why use a seed?</b> A seed makes a simulation reproducible. It is useful for teaching, debugging and comparing results. It does not make the sample more representative, and it should not be confused with a guarantee that a particular sample is unbiased in every practical sense.</div>
<p>Random selection is only meaningful after the population has been defined correctly. If the source file omits a region, a random sample from that file cannot represent the missing region.</p>`
    },
    {
      type: 'try',
      title: 'Draw a random sample of 100 deliveries',
      body: `<p>We will draw 100 delivery durations without replacement. Then we will compare the sample mean with the population mean. The difference is the sample's estimation error for this particular draw.</p>
<p>Run the code more than once only if you also recreate the random generator or change the seed. With the current fixed generator, repeated calls advance its state and generate new samples.</p>
<p><b>Python connection:</b> <code>transit.to_numpy()</code> converts the Pandas Series into a NumPy array. <code>rng.choice(..., size=100, replace=False)</code> selects 100 distinct values. <code>sample.mean()</code> calculates the sample average.</p>`,
      code: `sample = rng.choice(transit.to_numpy(), size=100, replace=False)

sample_mean = sample.mean()
population_mean = transit.mean()

print("Sample size:", len(sample))
print("Sample mean:", round(sample_mean, 3))
print("Population mean:", round(population_mean, 3))
print("Estimation error:", round(sample_mean - population_mean, 3))`
    },
    {
      id: 'st-4-1-ex1',
      type: 'exercise',
      title: 'Your turn: take a different sample',
      body: `<p>Draw a new simple random sample of 250 delivery durations without replacement. Store it in <code>sample_250</code>. Print its size and its mean to three decimal places.</p>
<p><b>Think before you type:</b> use <code>rng.choice()</code> with <code>size=250</code> and <code>replace=False</code>. Convert <code>transit</code> to a NumPy array first.</p>
<p><b>Python connection:</b> <code>len()</code> counts the selected values; <code>.mean()</code> calculates their average; <code>round(value, 3)</code> rounds the displayed result to three decimal places.</p>`,
      starter: `# transit and rng are already loaded

# Write your code below
`,
      hints: [
        'Use rng.choice(transit.to_numpy(), size=250, replace=False).',
        'sample_250 = rng.choice(transit.to_numpy(), size=250, replace=False)\nprint("Sample size:", len(sample_250))\nprint("Sample mean:", round(sample_250.mean(), 3))\n'
      ],
      solution: `sample_250 = rng.choice(transit.to_numpy(), size=250, replace=False)
print("Sample size:", len(sample_250))
print("Sample mean:", round(sample_250.mean(), 3))
`,
      ordered: true
    },
    {
      id: 'st-4-1-ex2',
      type: 'exercise',
      title: 'Your turn: calculate a sample statistic',
      body: `<p>Use the existing <code>sample_250</code> array to calculate its median and standard deviation. Print both to three decimal places.</p>
<p>Use NumPy's <code>np.median()</code> and <code>np.std()</code>. For this exercise, use the population-form standard deviation by setting <code>ddof=0</code>. We will discuss why the choice of denominator matters later.</p>
<p><b>Python connection:</b> <code>ddof</code> means “delta degrees of freedom”. NumPy divides by n minus <code>ddof</code>. With <code>ddof=0</code>, it divides by n; with <code>ddof=1</code>, it divides by n−1.</p>`,
      starter: `# sample_250 is already loaded

# Write your code below
`,
      hints: [
        'Calculate median_250 = np.median(sample_250) and sd_250 = np.std(sample_250, ddof=0).',
        'median_250 = np.median(sample_250)\nsd_250 = np.std(sample_250, ddof=0)\nprint("Median:", round(median_250, 3))\nprint("Standard deviation:", round(sd_250, 3))\n'
      ],
      solution: `median_250 = np.median(sample_250)
sd_250 = np.std(sample_250, ddof=0)
print("Median:", round(median_250, 3))
print("Standard deviation:", round(sd_250, 3))
`,
      ordered: true
    },
    {
      id: 'st-4-1-c2',
      type: 'check',
      title: 'TradeFlow samples only deliveries from one city. What is the main concern?',
      body: `<p>The team wants to estimate average delivery time across all five countries where TradeFlow operates.</p>`,
      options: [
        'The sample may suffer from selection bias and fail to represent the target population',
        'The sample mean must equal the population mean',
        'The sample is automatically representative if it contains more than 100 rows',
        'The standard deviation will become zero'
      ],
      answer: 0,
      why: [
        'Correct. A city-only sample may systematically exclude different operating conditions elsewhere. A larger sample from the same restricted group does not solve that problem.',
        'A sample mean will generally differ from the population mean due to sampling variability.',
        'There is no universal sample-size threshold that removes selection bias.',
        'Sampling from one city does not make every delivery time identical.'
      ]
    },
    {
      id: 'st-4-1-ex3',
      type: 'exercise',
      title: 'Your turn: compare two independent samples',
      body: `<p>Draw two independent samples of 150 delivery durations each, without replacement within either sample. Store them as <code>sample_a</code> and <code>sample_b</code>. Print both sample means.</p>
<p>The two samples should be drawn separately. They may overlap with each other; the no-replacement rule applies within each sample.</p>
<p><b>Python connection:</b> each call to <code>rng.choice()</code> advances the generator's internal state, producing a new random selection. Store each result so the two samples can be compared.</p>`,
      starter: `# transit and rng are already loaded

# Write your code below
`,
      hints: [
        'Call rng.choice() twice, each time with size=150 and replace=False.',
        'sample_a = rng.choice(transit.to_numpy(), size=150, replace=False)\nsample_b = rng.choice(transit.to_numpy(), size=150, replace=False)\nprint("Sample A mean:", round(sample_a.mean(), 3))\nprint("Sample B mean:", round(sample_b.mean(), 3))\n'
      ],
      solution: `sample_a = rng.choice(transit.to_numpy(), size=150, replace=False)
sample_b = rng.choice(transit.to_numpy(), size=150, replace=False)
print("Sample A mean:", round(sample_a.mean(), 3))
print("Sample B mean:", round(sample_b.mean(), 3))
`,
      ordered: true
    },
    {
      id: 'st-4-1-ex4',
      type: 'exercise',
      title: 'Your turn: quantify the difference between samples',
      body: `<p>Using <code>sample_a</code> and <code>sample_b</code>, calculate the absolute difference between their means. Store it as <code>mean_gap</code> and print it to three decimal places.</p>
<p>The absolute difference is useful because it measures the size of the gap without retaining its direction.</p>
<p><b>Python connection:</b> <code>abs()</code> returns the non-negative magnitude of a number. The expression <code>sample_a.mean() - sample_b.mean()</code> is signed; wrapping it in <code>abs()</code> removes the sign.</p>`,
      starter: `# sample_a and sample_b are already loaded

# Write your code below
`,
      hints: [
        'Subtract the two means, then pass the result to abs().',
        'mean_gap = abs(sample_a.mean() - sample_b.mean())\nprint("Absolute mean difference:", round(mean_gap, 3))\n'
      ],
      solution: `mean_gap = abs(sample_a.mean() - sample_b.mean())
print("Absolute mean difference:", round(mean_gap, 3))
`,
      ordered: true
    },
    {
      id: 'st-4-1-ex5',
      type: 'exercise',
      title: 'Your turn: compare a sample estimate with the population value',
      body: `<p>Calculate the estimation error for <code>sample_a</code>. Store the signed difference between its mean and the population mean in <code>error_a</code>. Then print the signed error and its absolute value.</p>
<p>A positive error means the sample overestimated the population mean. A negative error means it underestimated it.</p>
<p><b>Python connection:</b> subtraction preserves direction; <code>abs()</code> reports magnitude. These answer two different questions, so calculate both.</p>`,
      starter: `# sample_a and transit are already loaded

# Write your code below
`,
      hints: [
        'Subtract transit.mean() from sample_a.mean().',
        'error_a = sample_a.mean() - transit.mean()\nprint("Signed error:", round(error_a, 3))\nprint("Absolute error:", round(abs(error_a), 3))\n'
      ],
      solution: `error_a = sample_a.mean() - transit.mean()
print("Signed error:", round(error_a, 3))
print("Absolute error:", round(abs(error_a), 3))
`,
      ordered: true
    },
    {
      id: 'st-4-1-c3',
      type: 'check',
      title: 'Why can two fair random samples have different means?',
      body: `<p>Both samples were selected from the same population using the same method.</p>`,
      options: [
        'Because the population mean changes every time a sample is drawn',
        'Because different samples contain different observations, creating sampling variability',
        'Because random sampling always creates bias',
        'Because a sample mean is not a statistic'
      ],
      answer: 1,
      why: [
        'The population is fixed for the question. Its parameter does not change when we draw a sample.',
        'Correct. Different random selections usually contain different values, so their statistics vary.',
        'Random sampling does not automatically create systematic bias. It creates sampling variability.',
        'A sample mean is a statistic: a numerical summary calculated from sample data.'
      ]
    },
    {
      type: 'explain',
      title: 'Stratified sampling: making sure important groups are represented',
      body: `<p>Suppose delivery times differ by country. A simple random sample might, by chance, contain relatively few deliveries from a smaller market. If the team needs reliable country-level comparisons, it may use <b>stratified sampling</b>.</p>
<p>In stratified sampling, the population is divided into meaningful non-overlapping groups called strata. The analyst then samples from each stratum. For example, TradeFlow could divide deliveries by country and select a sample from each country.</p>
<p>There are different allocation strategies. Proportional allocation selects a sample from each stratum in proportion to its population size. Equal allocation selects the same number from each stratum, which can be useful for comparisons but may require weights when estimating an overall population mean.</p>
<p><b>Do not confuse stratified sampling with convenience sampling.</b> Stratification is a deliberate design that ensures coverage of defined groups. Convenience sampling simply selects what is easiest to access and can systematically miss important parts of the population.</p>
<div class="callout watch"><b>Scope matters:</b> a sample of completed deliveries estimates delivery time among completed deliveries. It does not automatically estimate delivery time for all orders, including orders that were cancelled or never dispatched. The target population must match the decision.</div>`
    },
    {
      type: 'explain',
      title: 'What you should take away from Lesson 4.1',
      body: `<p>You now have the language needed to describe an estimation problem precisely:</p>
<ul><li>The <b>population</b> is the full group the question concerns.</li><li>A <b>sample</b> is the subset actually observed.</li><li>A <b>parameter</b> describes the population; a <b>statistic</b> describes the sample.</li><li><b>Sampling variability</b> explains why statistics differ across random samples.</li><li><b>Selection bias</b> can make a sample systematically unrepresentative, even when it is large.</li><li><b>Stratified sampling</b> can ensure important population groups are represented.</li></ul>
<p>Next, we will stop looking at just one sample. We will imagine drawing many samples and study the distribution of the statistics they produce. That distribution is the key to standard errors and confidence intervals.</p>`
    }
  ]
}
);

LESSONS.push(
{
  id: 'st-4-2',
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

rng = np.random.default_rng(4202)
`,
  preloaded: ['deliveries', 'transit', 'rng'],
  title: '4.2 Sampling distributions and the Central Limit Theorem',
  tables: [],
  intro: `A single sample gives TradeFlow one estimate of average delivery time. But how much would that estimate change if the team repeated the sampling process? This is the question behind a <b>sampling distribution</b>.<br><br>In this lesson, you will learn why a sampling distribution is not the same as the distribution of individual delivery times. You will simulate repeated samples, calculate the standard error of the mean, and investigate the Central Limit Theorem. You will also learn why the theorem does not say that every dataset becomes normal, and why dependence, extreme skew and small samples require care.`,
  steps: [
    {
      type: 'explain',
      title: 'Three distributions that analysts must not confuse',
      body: `<p>There are three different distributions in this topic. They sound similar, but they describe different things.</p>
<table class="mini"><tr><th>Distribution</th><th>What varies?</th><th>TradeFlow example</th></tr>
<tr><td>Population distribution</td><td>Individual observations in the population</td><td>Delivery times across eligible deliveries</td></tr>
<tr><td>Sample distribution</td><td>Individual observations in one selected sample</td><td>Delivery times among 100 selected deliveries</td></tr>
<tr><td>Sampling distribution</td><td>A statistic across repeated samples</td><td>The sample mean from thousands of samples of 100 deliveries each</td></tr></table>
<p>The sampling distribution of the mean is created conceptually by repeatedly drawing samples of the same size and calculating the mean each time. Each repeated sample produces one mean. The collection of those means forms a distribution.</p>
<p>It is a distribution of <b>estimates</b>, not a distribution of individual delivery times. That distinction is central to inference.</p>
<div class="callout analogy"><b>Imagine repeatedly weighing different baskets of fruit.</b> The population distribution describes the weights of individual fruits. Each basket's average weight is one sample mean. The sampling distribution describes how those basket averages vary across many baskets.</div>
<p>In real work, we usually observe only one sample. Simulation helps us understand what the repeated-sampling process would look like under a known population or a specified model.</p>`
    },
    {
      type: 'explain',
      title: 'Why sample means vary less than individual observations',
      body: `<p>Suppose delivery times vary substantially from one order to another. A sample mean averages many of those individual values. Very high and very low observations can partly balance one another, so the sample mean usually varies less than a single observation.</p>
<p>If observations are independent and have population standard deviation σ, the standard deviation of the sample mean is:</p>
<p><b>Standard error of the mean = σ / √n</b></p>
<p>Here, σ describes the spread of individual population observations, while n is the sample size. The square root is important: increasing the sample size reduces the standard error, but not in a one-for-one way.</p>
<ul><li>Multiply sample size by 4: standard error is divided by 2.</li><li>Multiply sample size by 9: standard error is divided by 3.</li><li>Multiply sample size by 100: standard error is divided by 10.</li></ul>
<p>When σ is unknown—as it usually is—we estimate the standard error using the sample standard deviation s:</p>
<p><b>Estimated standard error = s / √n</b></p>
<p>This estimate is a measure of the expected sampling variability of the sample mean under the sampling assumptions. It is not the standard deviation of individual delivery times.</p>
<div class="callout watch"><b>Do not mix up the units or meanings.</b> Standard deviation describes the spread of observations. Standard error describes the spread of a statistic across repeated samples. Both may be measured in days here, but they answer different questions.</div>`
    },
    {
      type: 'try',
      title: 'Simulate a sampling distribution',
      body: `<p>We will draw 2,000 samples, each containing 100 delivery durations, and calculate the mean of each sample. The resulting 2,000 means approximate the sampling distribution of the sample mean for this population and sample size.</p>
<p>In the code, <code>size=(2000, 100)</code> asks NumPy for a two-dimensional array: 2,000 rows and 100 sampled values in each row. <code>axis=1</code> tells <code>np.mean()</code> to calculate one mean across each row.</p>
<p>Because sampling is without replacement within each sample, a delivery cannot appear twice in the same sample. Different simulated samples may share observations.</p>`,
      code: `population_values = transit.to_numpy()
simulated_samples = rng.choice(
    population_values,
    size=(2000, 100),
    replace=True
)

sample_means = simulated_samples.mean(axis=1)

print("Number of simulated sample means:", len(sample_means))
print("Mean of simulated means:", round(sample_means.mean(), 3))
print("Population mean:", round(transit.mean(), 3))
print("SD of simulated means:", round(sample_means.std(ddof=1), 3))`
    },
    {
      type: 'explain',
      title: 'Why this simulation samples with replacement',
      body: `<p>The simulation above uses <code>replace=True</code>. That means a delivery duration can appear more than once in a simulated sample. This is a common way to approximate repeated independent sampling from an empirical population distribution.</p>
<p>For a finite population, an actual simple random sample without replacement has a slightly different standard error because selecting one observation changes which observations remain available. When the sample is a substantial fraction of the population, this finite-population effect can matter.</p>
<p>For a sample mean from a finite population sampled without replacement, a common correction is:</p>
<p><b>SE = (s / √n) × √((N − n) / (N − 1))</b></p>
<p>Here N is the population size. The square-root term is called the finite population correction. It approaches 1 when n is small relative to N, and it approaches 0 when the sample contains the entire population.</p>
<p>Our repeated bootstrap-style simulation uses replacement to focus on the core sampling-distribution idea. It is not claiming that every real survey or audit samples with replacement. The sampling design must match the real data collection process.</p>`
    },
    {
      type: 'try',
      title: 'Visualise the sampling distribution',
      body: `<p>Plot the distribution of the 2,000 sample means. Compare its shape with the distribution of individual delivery durations.</p>
<p>The two histograms describe different quantities. The first shows individual deliveries; the second shows averages of 100 deliveries. You should see that the sample means are more concentrated around the population mean.</p>
<p><b>Python connection:</b> <code>plt.hist()</code> groups numeric values into bins and displays their frequencies. <code>bins=25</code> requests 25 intervals. <code>alpha</code> controls transparency, and <code>density=True</code> scales the histogram so its total area is approximately 1 rather than showing raw counts.</p>`,
      code: `plt.figure(figsize=(10, 4))

plt.subplot(1, 2, 1)
plt.hist(transit, bins=20, density=True)
plt.title("Individual delivery times")
plt.xlabel("Transit days")
plt.ylabel("Density")

plt.subplot(1, 2, 2)
plt.hist(sample_means, bins=25, density=True)
plt.title("Means of samples of 100")
plt.xlabel("Sample mean (days)")
plt.ylabel("Density")

plt.tight_layout()
plt.show()`
    },
    {
      id: 'st-4-2-c1',
      type: 'check',
      title: 'What does the sampling distribution of the mean describe?',
      body: `<p>Assume we repeatedly draw samples of the same size and calculate each sample mean.</p>`,
      options: [
        'The distribution of all individual observations in the population',
        'The distribution of sample means across repeated samples',
        'The distribution of missing values in the dataset',
        'The distribution of sample sizes'
      ],
      answer: 1,
      why: [
        'That is the population distribution of individual observations.',
        'Correct. Each repeated sample produces one mean, and the distribution of those means is the sampling distribution.',
        'Missing values are a data-quality issue, not the definition of a sampling distribution.',
        'In this setting, sample size is held constant rather than being the statistic whose distribution we study.'
      ]
    },
    {
      type: 'explain',
      title: 'The Central Limit Theorem: why averages often become approximately normal',
      body: `<p>The <b>Central Limit Theorem (CLT)</b> explains a remarkable pattern. Under suitable conditions, the sampling distribution of the sample mean becomes approximately normal as sample size increases—even when the population distribution itself is not normal.</p>
<p>For independent observations drawn from a population with a finite mean and finite variance, the standardised sample mean approaches a standard normal distribution as n grows:</p>
<p><b>(x̄ − μ) / (σ / √n)</b></p>
<p>This expression measures how many standard errors the sample mean lies above or below the population mean. If the CLT approximation is appropriate, its distribution is approximately standard normal.</p>
<p>The CLT does <b>not</b> say that the raw observations become normal. TradeFlow's payment amounts do not become bell-shaped just because the analyst collects more payment records. The theorem concerns the distribution of a suitable sample statistic, such as the mean.</p>
<p>It also does not provide one universal sample-size rule. Strong skewness, heavy tails, dependence and unusual sampling designs can require much larger samples or a different method. The quality of the approximation depends on the population and the sampling process.</p>
<div class="callout watch"><b>Independence matters.</b> If several deliveries are affected by the same warehouse outage, their durations may be correlated. Treating all of them as independent observations can make a standard error too small and confidence intervals too narrow.</div>`
    },
    {
      type: 'try',
      title: 'Compare standard deviation and standard error',
      body: `<p>Calculate the sample standard deviation of the individual delivery times, then estimate the standard error of the mean for a sample size of 100.</p>
<p>We use <code>ddof=1</code> for the sample standard deviation. This divides the sum of squared deviations by n−1, a conventional estimator of population variance under independent random sampling.</p>
<p>The standard error estimate divides that sample standard deviation by the square root of the sample size.</p>`,
      code: `s = transit.std(ddof=1)
n = 100
se = s / np.sqrt(n)

print("Sample standard deviation:", round(s, 3), "days")
print("Estimated standard error:", round(se, 3), "days")`
    },
    {
      id: 'st-4-2-ex1',
      type: 'exercise',
      title: 'Your turn: calculate a standard error',
      body: `<p>Use the full <code>transit</code> Series to estimate the standard error of a sample mean when the planned sample size is 64. Store the result in <code>se_64</code> and print it to four decimal places.</p>
<p>Use the sample standard deviation with <code>ddof=1</code>, then divide by the square root of 64.</p>
<p><b>Python connection:</b> <code>np.sqrt(64)</code> calculates the square root. The standard error is a standard deviation divided by the square root of the sample size.</p>`,
      starter: `# transit is already loaded

# Write your code below
`,
      hints: [
        'Calculate s = transit.std(ddof=1), then se_64 = s / np.sqrt(64).',
        's = transit.std(ddof=1)\nse_64 = s / np.sqrt(64)\nprint("Estimated SE:", round(se_64, 4))\n'
      ],
      solution: `s = transit.std(ddof=1)
se_64 = s / np.sqrt(64)
print("Estimated SE:", round(se_64, 4))
`,
      ordered: true
    },
    {
      id: 'st-4-2-ex2',
      type: 'exercise',
      title: 'Your turn: see what happens when sample size grows',
      body: `<p>Calculate estimated standard errors for sample sizes 64 and 256. Store them as <code>se_64</code> and <code>se_256</code>. Print both values and their ratio.</p>
<p>The standard error at n = 256 should be about half the standard error at n = 64, because the sample size has quadrupled.</p>
<p><b>Python connection:</b> dividing by <code>np.sqrt(n)</code> makes the standard error shrink with the square root of n, not directly with n.</p>`,
      starter: `# transit is already loaded

# Write your code below
`,
      hints: [
        'Use the same sample standard deviation for both calculations.',
        's = transit.std(ddof=1)\nse_64 = s / np.sqrt(64)\nse_256 = s / np.sqrt(256)\nprint("SE at 64:", round(se_64, 4))\nprint("SE at 256:", round(se_256, 4))\nprint("Ratio:", round(se_64 / se_256, 2))\n'
      ],
      solution: `s = transit.std(ddof=1)
se_64 = s / np.sqrt(64)
se_256 = s / np.sqrt(256)
print("SE at 64:", round(se_64, 4))
print("SE at 256:", round(se_256, 4))
print("Ratio:", round(se_64 / se_256, 2))
`,
      ordered: true
    },
    {
      id: 'st-4-2-c2',
      type: 'check',
      title: 'Which statement correctly describes the Central Limit Theorem?',
      body: `<p>Assume independent observations with finite mean and variance.</p>`,
      options: [
        'The population data always become normal when the dataset is large',
        'The sampling distribution of the sample mean becomes approximately normal as sample size grows',
        'The sample mean becomes exactly equal to the population mean for every large sample',
        'The theorem removes selection bias and measurement error'
      ],
      answer: 1,
      why: [
        'The CLT concerns the sampling distribution of a statistic, not the shape of the raw population data.',
        'Correct. Under suitable conditions, the standardised sample mean has an approximately standard normal sampling distribution.',
        'Larger samples generally improve precision, but the sample mean will not be exactly equal to the population mean in every sample.',
        'The CLT does not repair a poor sampling design or inaccurate measurements.'
      ]
    },
    {
      id: 'st-4-2-ex3',
      type: 'exercise',
      title: 'Your turn: simulate a larger sampling distribution',
      body: `<p>Use <code>rng</code> to draw 1,000 samples of size 64 with replacement from <code>transit</code>. Calculate one mean per sample and store the results in <code>means_64</code>. Print the mean and standard deviation of those simulated means.</p>
<p><b>Python connection:</b> the two-dimensional sample array has 1,000 rows and 64 columns. <code>axis=1</code> calculates a mean across each row, producing 1,000 sample means.</p>`,
      starter: `# transit and rng are already loaded

# Write your code below
`,
      hints: [
        'Use rng.choice(transit.to_numpy(), size=(1000, 64), replace=True), then call .mean(axis=1).',
        'draws_64 = rng.choice(transit.to_numpy(), size=(1000, 64), replace=True)\nmeans_64 = draws_64.mean(axis=1)\nprint("Mean of means:", round(means_64.mean(), 3))\nprint("SD of means:", round(means_64.std(ddof=1), 3))\n'
      ],
      solution: `draws_64 = rng.choice(transit.to_numpy(), size=(1000, 64), replace=True)
means_64 = draws_64.mean(axis=1)
print("Mean of means:", round(means_64.mean(), 3))
print("SD of means:", round(means_64.std(ddof=1), 3))
`,
      ordered: true
    },
    {
      id: 'st-4-2-ex4',
      type: 'exercise',
      title: 'Your turn: compare simulated and theoretical standard errors',
      body: `<p>Estimate the theoretical standard error for a sample mean of size 64 using <code>transit.std(ddof=1) / np.sqrt(64)</code>. Compare it with the standard deviation of the simulated means in <code>means_64</code>.</p>
<p>Print both values to four decimal places. They will not necessarily be identical because the simulated sampling distribution is based on a finite number of repeated samples.</p>
<p><b>Python connection:</b> this is a comparison between a formula-based estimate and a Monte Carlo estimate from simulated repeated samples.</p>`,
      starter: `# transit and means_64 are already loaded

# Write your code below
`,
      hints: [
        'Calculate theoretical_se and simulated_se separately.',
        'theoretical_se = transit.std(ddof=1) / np.sqrt(64)\nsimulated_se = means_64.std(ddof=1)\nprint("Theoretical SE:", round(theoretical_se, 4))\nprint("Simulated SE:", round(simulated_se, 4))\n'
      ],
      solution: `theoretical_se = transit.std(ddof=1) / np.sqrt(64)
simulated_se = means_64.std(ddof=1)
print("Theoretical SE:", round(theoretical_se, 4))
print("Simulated SE:", round(simulated_se, 4))
`,
      ordered: true
    },
    {
      id: 'st-4-2-ex5',
      type: 'exercise',
      title: 'Your turn: calculate a standardised sample mean',
      body: `<p>Take one sample of 100 delivery durations without replacement. Calculate its sample mean and standardise it using the population mean and the estimated standard error based on the population standard deviation for this teaching exercise.</p>
<p>Store the standardised value in <code>z_mean</code> and print it to three decimal places.</p>
<p><b>Python connection:</b> subtracting the population mean centres the estimate; dividing by the standard error expresses the difference in standard-error units.</p>`,
      starter: `# transit and rng are already loaded

# Write your code below
`,
      hints: [
        'Draw 100 values, calculate their mean, then divide the difference from transit.mean() by transit.std(ddof=0) / np.sqrt(100).',
        'one_sample = rng.choice(transit.to_numpy(), size=100, replace=False)\nx_bar = one_sample.mean()\nse_population = transit.std(ddof=0) / np.sqrt(100)\nz_mean = (x_bar - transit.mean()) / se_population\nprint("Standardised sample mean:", round(z_mean, 3))\n'
      ],
      solution: `one_sample = rng.choice(transit.to_numpy(), size=100, replace=False)
x_bar = one_sample.mean()
se_population = transit.std(ddof=0) / np.sqrt(100)
z_mean = (x_bar - transit.mean()) / se_population
print("Standardised sample mean:", round(z_mean, 3))
`,
      ordered: true
    },
    {
      id: 'st-4-2-c3',
      type: 'check',
      title: 'TradeFlow deliveries are clustered by warehouse and day. Why does that matter?',
      body: `<p>Several deliveries may share the same operational disruption, so their times are not independent.</p>`,
      options: [
        'The standard error formula may understate uncertainty if dependence is ignored',
        'The Central Limit Theorem proves that dependence never matters',
        'The sample mean is no longer a statistic',
        'The population standard deviation must be zero'
      ],
      answer: 0,
      why: [
        'Correct. Correlated observations contain less independent information than the same number of independent observations. A method that ignores clustering can produce overly narrow uncertainty estimates.',
        'The usual simple CLT statement relies on independence or other carefully specified dependence conditions. Dependence cannot simply be ignored.',
        'The sample mean remains a statistic even when observations are dependent.',
        'Dependence does not imply that all delivery times are identical.'
      ]
    },
    {
      type: 'explain',
      title: 'When the CLT approximation needs extra care',
      body: `<p>The CLT is powerful, but an analyst must check whether the assumptions are plausible.</p>
<ul><li><b>Independent or suitably weakly dependent observations:</b> repeated observations from the same customer, warehouse or outage may be correlated.</li><li><b>Finite variance:</b> extremely heavy-tailed populations can make convergence slow or invalidate simple versions of the theorem.</li><li><b>Random or defensible sampling:</b> the CLT does not correct a sample that systematically excludes part of the population.</li><li><b>Sample size appropriate to the shape:</b> strongly skewed populations can require larger samples before the sample-mean distribution looks approximately normal.</li></ul>
<p>In applied work, analysts may use a histogram or quantile plot of the observations, inspect the sampling design, look for clusters, and compare standard-error estimates under alternative assumptions.</p>
<p>For clustered business data, the correct analysis may need cluster-level sampling or cluster-robust standard errors. Those methods are beyond this lesson's calculations, but the warning is important: the number of rows is not always the same as the number of independent pieces of information.</p>`
    },
    {
      type: 'explain',
      title: 'What you should take away from Lesson 4.2',
      body: `<p>You can now distinguish the population distribution, a sample distribution and a sampling distribution. You have simulated repeated samples and seen how the distribution of sample means is more concentrated than the distribution of individual observations.</p>
<ul><li>The <b>standard error</b> measures the sampling variability of an estimator.</li><li>For a sample mean under independent sampling, the estimated standard error is commonly s / √n.</li><li>The <b>Central Limit Theorem</b> explains why the sampling distribution of a mean is often approximately normal for sufficiently large samples under suitable conditions.</li><li>The CLT does not make raw data normal and does not remove bias, dependence or measurement error.</li></ul>
<p>In the next lesson, we will use standard errors and critical values to build confidence intervals—ranges that communicate both an estimate and its uncertainty.</p>`
    }
  ]
}
);
