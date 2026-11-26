LESSONS.push(
{
  id: 'st-2-3',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'matplotlib'],
  loopGuard: true,
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: `import pandas as pd
import numpy as np

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
products = pd.read_csv("products.csv")
payments = pd.read_csv("payments.csv")
deliveries = pd.read_csv("deliveries.csv")
order_items = pd.read_csv("order_items.csv")

master = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")
master = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")
master = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
master["line_total"] = master["quantity"] * master["unit_price"]
master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")
master["order_year"] = master["order_date"].dt.year

orders_pay = orders.merge(payments, on="order_id", validate="one_to_one")
orders_pay["cash_kept"] = np.where(orders_pay["payment_status"].eq("Paid"), orders_pay["amount"], 0.0)
has_delivery = orders.merge(
    deliveries[["delivery_id", "order_id", "delivery_status", "dispatch_date", "delivery_date"]],
    on="order_id", how="left", validate="one_to_one")
orders_customers = orders.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
`,
  preloaded: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items', 'master', 'orders_pay', 'has_delivery', 'orders_customers'],
  title: '2.3 Bayes and the base rate: most alerts are not the rare event',
  tables: [],
  intro: `A payments vendor sends the CFO a confident proposal: <i>“Our screening system catches 90% of failed payments and incorrectly flags only 5% of healthy payments.”</i> The CFO asks the data team one question: <i>“When the system raises an alert, what is the chance the payment has actually failed?”</i><br><br>The vendor has described the system's behaviour when the true status is already known. The CFO is asking for the reverse: the probability of failure after seeing an alert. Those are not the same probability. Bayes' rule connects them, but it cannot do so without the base rate. This lesson builds the answer from counts first, then derives the rule, then examines the measures used to judge a screening system when the event being detected is rare.`,
  steps: [
    {
      type: 'explain',
      title: 'The base rate comes before the impressive percentage',
      body: `<p>Begin with what is known about TradeFlow's 10,000 historical payments. There are <b>423 Failed</b> payments and <b>9,577 that are not Failed</b>. The observed failure rate is therefore 4.23%.</p>
<p>This overall rate is called the <b>base rate</b> or <b>prevalence</b> of the event. It is the probability of failure before we know anything about a screening result.</p>
<p>Now take the vendor's claims as assumptions for a hypothetical screening system:</p>
<ul>
<li>It flags 90% of genuinely failed payments. This is its <b>sensitivity</b>, also called the true positive rate.</li>
<li>It incorrectly flags 5% of payments that did not fail. This is the <b>false positive rate</b>. Its specificity is therefore 95%.</li>
</ul>
<p>Apply those rates to 10,000 payments. These are <b>expected counts</b>, so decimals are acceptable; they are not claims about particular fractional transactions.</p>
<table class="mini">
<tr><th>Actual status</th><th>Flagged</th><th>Not flagged</th><th>Total</th></tr>
<tr><td><b>Failed</b></td><td>380.70</td><td>42.30</td><td>423.00</td></tr>
<tr><td><b>Not Failed</b></td><td>478.85</td><td>9,098.15</td><td>9,577.00</td></tr>
<tr><td><b>Total</b></td><td>859.55</td><td>9,140.45</td><td>10,000.00</td></tr>
</table>
<p>Of the roughly 860 alerts, only about 381 relate to failed payments. The share of alerts that are genuine failures is 380.70 ÷ 859.55 = <b>44.29%</b>. More than half the alerts are false alarms, even though the system catches 90% of real failures.</p>
<p>The system has not contradicted itself. “Catches 90% of failures” and “44% of alerts are failures” describe different directions through the same table.</p>
<div class="callout analogy"><b>A small signal in a very large crowd.</b> Imagine searching for a rare item in a warehouse. A detector can find most of the rare items and still produce more false alarms than true alarms if there are vastly more ordinary items than rare ones. The size of the ordinary group matters.</div>`
    },
    {
      type: 'try',
      title: 'Build the screening counts from the real base rate',
      body: `<p>Use the failure rate in the actual payment records. The screening system's 90% sensitivity and 5% false positive rate are hypothetical performance assumptions. Do not pretend the TradeFlow data contain historical screening outcomes; they do not.</p>
<p>The expected true alerts are 380.70, the expected false alerts are 478.85, and the probability that an alert is a real failure is <b>0.4429</b>.</p>`,
      code: `failed = orders_pay["payment_status"].eq("Failed")
p_failed = failed.mean()
p_healthy = 1 - p_failed

true_alerts = p_failed * 0.90 * len(orders_pay)
false_alerts = p_healthy * 0.05 * len(orders_pay)

print("{:.2f}".format(true_alerts))
print("{:.2f}".format(false_alerts))
print("{:.4f}".format(true_alerts / (true_alerts + false_alerts)))
`
    },
    {
      type: 'explain',
      title: 'Bayes’ rule reverses the condition',
      body: `<p>Let F mean “the payment has Failed” and A mean “the screening system raises an Alert”. The vendor gives us P(A | F): the chance of an alert among payments known to have failed. The CFO needs P(F | A): the chance of failure among payments known to have triggered an alert.</p>
<p>We can derive the answer from the multiplication rule you learned in lesson 2.2:</p>
<p>P(F and A) = P(F) × P(A | F)</p>
<p>The same joint event can also be written:</p>
<p>P(F and A) = P(A) × P(F | A)</p>
<p>Because both expressions describe the same overlap, set them equal and divide by P(A):</p>
<p><b>P(F | A) = [P(A | F) × P(F)] ÷ P(A).</b></p>
<p>This is <b>Bayes' rule</b>. It says that the probability of F after observing A depends on three pieces: how common F was before the alert, how often the alert appears when F is true, and how common alerts are overall.</p>
<p>We still need P(A), the overall alert rate. An alert can arise in two ways: a failed payment is flagged, or a healthy payment is incorrectly flagged. Those routes do not overlap, so:</p>
<p><b>P(A) = P(A | F)P(F) + P(A | not F)P(not F).</b></p>
<p>The expression for P(A) is an instance of the <b>law of total probability</b>: split the population into mutually exclusive groups that cover everyone, calculate the probability of the evidence within each group, weight each by the group's base rate, and add the routes together.</p>
<p>For this system:</p>
<ul>
<li>P(A | F) = 0.90</li>
<li>P(F) = 0.0423</li>
<li>P(A | not F) = 0.05</li>
<li>P(not F) = 0.9577</li>
</ul>
<p>Substituting gives 0.90 × 0.0423 divided by (0.90 × 0.0423 + 0.05 × 0.9577), which is <b>0.4429</b>.</p>
<p><b>An equivalent view uses odds.</b> The prior odds of failure are P(Failed) divided by P(Not Failed). A positive alert has a likelihood ratio of 0.90 ÷ 0.05 = 18: under the stated model, an alert is 18 times as likely when a payment has failed as when it has not. Multiply the prior odds by 18 to obtain the posterior odds, then convert those odds back to a probability. You get the same 44.29%. This form is common in diagnostic testing and risk analysis; the probability form above is usually easier to read when first learning the idea.</p>
<div class="callout tip"><b>Use natural frequencies before formulas.</b> “Out of 10,000 payments, about 381 true failures are flagged and about 479 healthy payments are flagged.” That count makes the answer visible. Bayes' rule is the compact mathematical expression of the same reasoning.</div>`
    },
    {
      id: 'st-2-3-ex1-v2',
      type: 'exercise',
      title: 'Your turn: calculate the share of alerts that are real',
      body: `<p>Using the observed TradeFlow failure rate and the vendor's hypothetical 90% sensitivity and 5% false positive rate, calculate P(Failed | Alert).</p>
<p>Print the answer to four decimal places. You should see <code>0.4429</code>.</p>
<p><b>Think before you type:</b> the alert rate includes both true alerts and false alerts. The numerator contains only true alerts. Do not divide 0.90 by the base rate or treat 0.90 as the answer.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'First calculate p_failed from the payment_status column. Then calculate p_alert as 0.90 * p_failed + 0.05 * (1 - p_failed).',
        'p_failed = orders_pay["payment_status"].eq("Failed").mean()\np_alert = 0.90 * p_failed + 0.05 * (1 - p_failed)\nprint("{:.4f}".format(0.90 * p_failed / p_alert))\n'
      ],
      solution: `p_failed = orders_pay["payment_status"].eq("Failed").mean()
p_alert = 0.90 * p_failed + 0.05 * (1 - p_failed)
print("{:.4f}".format(0.90 * p_failed / p_alert))
`,
      ordered: true
    },
    {
      id: 'st-2-3-c1-v2',
      type: 'check',
      title: 'The vendor says the system catches 90% of failed payments. Which probability is that?',
      body: `<p>Pay attention to what is known before the percentage is calculated.</p>`,
      options: [
        'P(Failed | Alert): the share of alerts that are genuine failures',
        'P(Alert | Failed): the share of genuine failures that the system flags',
        'P(Failed): the overall failure rate in the payment population',
        'P(Alert): the share of all payments that the system flags'
      ],
      answer: 1,
      why: [
        'That is the quantity the CFO needs. It is approximately 44.29% under the stated assumptions, not 90%.',
        'Correct. “Catches 90% of failed payments” starts with the failed payments and asks what share are flagged. The condition is Failed.',
        'The base rate is the observed 4.23% of payments that failed. It is not the screening system\'s sensitivity.',
        'The alert rate includes both true alerts and false alerts. It is approximately 8.60% under the stated assumptions.'
      ]
    },
    {
      type: 'explain',
      title: 'The base rate can change the answer dramatically',
      body: `<p>Keep the screening system exactly the same: 90% sensitivity and 95% specificity. Now imagine that the event is common rather than rare. Suppose half of all payments truly fail.</p>
<p>Out of 10,000 payments, 5,000 would fail. The system would raise about 4,500 true alerts. Of the 5,000 healthy payments, it would incorrectly flag 5%, or 250. The alert queue would contain 4,750 alerts, of which 4,500 are genuine. The share of alerts that are genuine would be:</p>
<p>4,500 ÷ 4,750 = <b>94.74%</b>.</p>
<p>The system did not improve. Only the base rate changed. When failure is rare, the large healthy population can produce many false alerts even at a small false positive rate. When failure is common, true alerts make up a much larger share of the queue.</p>
<p>This is why a screening result cannot be interpreted in isolation. A 90% sensitivity figure does not tell a manager how many alerts will be genuine in the population where the system is deployed.</p>
<div class="callout work"><b>Before deploying a risk score:</b> estimate prevalence in the actual operating population, test sensitivity and specificity on an appropriate holdout set, and calculate the expected number of true and false alerts at the expected volume. A result from a different country, product or time period may not transfer.</div>`
    },
    {
      id: 'st-2-3-ex2-v2',
      type: 'exercise',
      title: 'Your turn: change the base rate, not the screening system',
      body: `<p>Keep sensitivity at 0.90 and the false positive rate at 0.05. Change only the base rate to 0.50.</p>
<p>Calculate P(Failed | Alert) and print it to four decimal places. You should see <code>0.9474</code>.</p>
<p><b>Think before you type:</b> the alert probability is 0.90 × prevalence plus 0.05 × the share that did not fail. The numerator is 0.90 × prevalence.</p>`,
      starter: `# Use the stated model assumptions\n\n# Write your code below\n`,
      hints: [
        'Set p_failed = 0.50. Calculate p_alert from the two routes into an alert, then divide the true-alert probability by p_alert.',
        'p_failed = 0.50\np_alert = 0.90 * p_failed + 0.05 * (1 - p_failed)\nprint("{:.4f}".format(0.90 * p_failed / p_alert))\n'
      ],
      solution: `p_failed = 0.50
p_alert = 0.90 * p_failed + 0.05 * (1 - p_failed)
print("{:.4f}".format(0.90 * p_failed / p_alert))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Read the confusion matrix like an operations report',
      body: `<p>Screening systems and binary classifiers are often assessed with a <b>confusion matrix</b>. Its rows show what really happened; its columns show what the model predicted.</p>
<table class="mini">
<tr><th>Actual outcome</th><th>Model flags</th><th>Model does not flag</th></tr>
<tr><td><b>Failed</b></td><td>True positive (TP)</td><td>False negative (FN)</td></tr>
<tr><td><b>Not Failed</b></td><td>False positive (FP)</td><td>True negative (TN)</td></tr>
</table>
<p>Each cell represents a different operational outcome:</p>
<ul>
<li><b>True positive:</b> a real failure is flagged. This is a case the system catches.</li>
<li><b>False negative:</b> a real failure is not flagged. This is a missed failure.</li>
<li><b>False positive:</b> a healthy payment is flagged. This consumes investigation time and may inconvenience a customer.</li>
<li><b>True negative:</b> a healthy payment is correctly left alone.</li>
</ul>
<p>Several performance measures are built from these four cells:</p>
<table class="mini">
<tr><th>Measure</th><th>Definition</th><th>Question it answers</th></tr>
<tr><td><b>Sensitivity / recall</b></td><td>TP ÷ (TP + FN)</td><td>Of the real failures, what share did we catch?</td></tr>
<tr><td><b>Specificity</b></td><td>TN ÷ (TN + FP)</td><td>Of the healthy payments, what share did we leave unflagged?</td></tr>
<tr><td><b>Precision / positive predictive value</b></td><td>TP ÷ (TP + FP)</td><td>Of the alerts, what share were real failures?</td></tr>
<tr><td><b>Negative predictive value</b></td><td>TN ÷ (TN + FN)</td><td>Of the payments not flagged, what share were healthy?</td></tr>
<tr><td><b>F1 score</b></td><td>2 × precision × recall ÷ (precision + recall)</td><td>What is the harmonic mean of precision and recall?</td></tr>
<tr><td><b>Balanced accuracy</b></td><td>(sensitivity + specificity) ÷ 2</td><td>What is the average of the two class-specific hit rates?</td></tr>
<tr><td><b>Accuracy</b></td><td>(TP + TN) ÷ total</td><td>What share of all predictions were correct?</td></tr>
</table>
<p>For this hypothetical screen, precision is 44.29%, recall is 90%, specificity is 95%, negative predictive value is about 99.54%, overall accuracy is about 94.79%, F1 is about 59.37%, and balanced accuracy is 92.50%.</p>
<p>F1 is useful when you need one summary of precision and recall, but it ignores true negatives. Balanced accuracy gives equal weight to the positive and negative class rates, which can be more revealing than ordinary accuracy when the classes are imbalanced. Neither replaces the confusion matrix or the business cost of each error.</p>
<p>Why can precision be low while recall is high? Because failure is rare. There are 9,577 healthy payments available to generate false alerts, compared with only 423 failed payments available to generate true alerts.</p>
<div class="callout watch"><b>Accuracy can be misleading when the event is rare.</b> A system that never flags anything would be correct for all 9,577 healthy payments, giving 95.77% accuracy. It would also miss every failed payment, giving 0% recall. That is not a useful failure-screening system just because its accuracy number looks high.</div>`
    },
    {
      id: 'st-2-3-ex3-v2',
      type: 'exercise',
      title: 'Your turn: calculate the accuracy of doing nothing',
      body: `<p>Imagine a useless screening system that never flags a payment. Every payment is predicted to be Not Failed.</p>
<p>Using the actual <code>orders_pay</code> labels, calculate its accuracy and its recall for Failed payments. Print both to four decimal places. You should see <code>0.9577</code> and <code>0.0000</code>.</p>
<p><b>Think before you type:</b> it gets every non-failed payment right and every failed payment wrong. Its recall is zero because it catches no failures at all.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'The accuracy is the share that are not Failed. The recall is the share of Failed cases that the system catches; a system that never flags has recall zero.',
        'failed = orders_pay["payment_status"].eq("Failed")\naccuracy = (~failed).mean()\nrecall = 0.0\nprint("{:.4f}".format(accuracy))\nprint("{:.4f}".format(recall))\n'
      ],
      solution: `failed = orders_pay["payment_status"].eq("Failed")
accuracy = (~failed).mean()
recall = 0.0
print("{:.4f}".format(accuracy))
print("{:.4f}".format(recall))
`,
      ordered: true
    },
    {
      id: 'st-2-3-c2-v2',
      type: 'check',
      title: 'A system that never flags a payment is 95.77% accurate. Why is that not a good reason to deploy it?',
      body: `<p>Ask what happens to the rare event that the system was built to detect.</p>`,
      options: [
        'Accuracy is always the wrong metric, regardless of the problem',
        'It misses every failed payment, so its recall for the target event is zero',
        'It must have 95.77% precision because its accuracy is 95.77%',
        'A model with high accuracy cannot have any false negatives'
      ],
      answer: 1,
      why: [
        'Accuracy is useful in some settings. The problem is relying on it alone when one class is much rarer than the other.',
        'Correct. The system predicts Not Failed for every row. It is correct on the healthy majority but catches none of the failures.',
        'Precision and accuracy use different denominators. This system produces no positive alerts, so its precision is undefined rather than 95.77%.',
        'A model can have high accuracy and still miss every instance of a rare class. That is exactly what happens here.'
      ]
    },
    {
      type: 'explain',
      title: 'Choose the metric that matches the operational cost',
      body: `<p>There is no single metric that makes every screening system good. The correct balance depends on what a false alarm and a missed failure cost the business.</p>
<p>If missing a failed payment is extremely expensive, management may prefer high recall, even if that sends more healthy payments for review. If every alert triggers a costly manual investigation, the team may need higher precision. Specificity helps describe how often healthy payments are left alone. Precision and negative predictive value answer what the alert and non-alert queues contain.</p>
<p>In machine learning, the decision threshold matters. A model might produce a score between 0 and 1. Lowering the threshold usually flags more records: recall often rises, but false positives may rise too. Raising the threshold usually reduces alerts but can miss more real cases. The best threshold is a business decision informed by validation data and the costs of each error.</p>
<p>For rare events, precision-recall measures are often more informative than accuracy alone. In practice, analysts also inspect the confusion matrix at the chosen threshold, examine results by important segment, check calibration and test the model on data it did not train on.</p>
<p>One more caution: the calculations in this lesson use the observed 4.23% TradeFlow failure rate but <b>assume</b> screening performance of 90% sensitivity and 95% specificity. The supplied CSV files do not contain predictions from a real screening model. We have therefore calculated what such a system would be expected to do under those assumptions, not measured an existing model.</p>
<div class="callout work"><b>Questions to ask a vendor:</b> What is the base rate in the deployment population? What are sensitivity and specificity on a representative holdout set? How many alerts should we expect at our volume? What are precision and recall at the proposed threshold? What does each type of error cost? How will performance be monitored after launch?</div>`
    },
    {
      id: 'st-2-3-ex4-v2',
      type: 'exercise',
      title: 'Your turn: calculate precision and negative predictive value',
      body: `<p>Use the actual failure base rate of 4.23% and the hypothetical model assumptions: 90% sensitivity and 95% specificity.</p>
<p>Calculate and print:</p>
<ul>
<li>Precision, or P(Failed | Alert)</li>
<li>Negative predictive value, or P(Not Failed | No Alert)</li>
</ul>
<p>Print both to four decimal places. You should see <code>0.4429</code> and <code>0.9954</code>.</p>
<p><b>Think before you type:</b> the false positive rate is 1 − specificity, or 0.05. The no-alert probability must include both missed failures and correctly unflagged healthy payments.</p>`,
      starter: `# Use the observed base rate and stated model assumptions\n\n# Write your code below\n`,
      hints: [
        'Set p_failed from the data. True alerts are 0.90 * p_failed; false alerts are 0.05 * (1 - p_failed). No-alerts combine 0.10 * p_failed and 0.95 * (1 - p_failed).',
        'p_failed = orders_pay["payment_status"].eq("Failed").mean()\ntp = 0.90 * p_failed\nfp = 0.05 * (1 - p_failed)\nfn = 0.10 * p_failed\ntn = 0.95 * (1 - p_failed)\nprint("{:.4f}".format(tp / (tp + fp)))\nprint("{:.4f}".format(tn / (tn + fn)))\n'
      ],
      solution: `p_failed = orders_pay["payment_status"].eq("Failed").mean()
tp = 0.90 * p_failed
fp = 0.05 * (1 - p_failed)
fn = 0.10 * p_failed
tn = 0.95 * (1 - p_failed)
print("{:.4f}".format(tp / (tp + fp)))
print("{:.4f}".format(tn / (tn + fn)))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A change in prevalence changes precision even when the model does not change',
      body: `<p>Suppose the same screening system moves from a payment population with a 4.23% failure rate to a new environment where only 1% of payments fail. Its sensitivity and specificity remain 90% and 95%.</p>
<p>With a 1% base rate, the share of alerts that are genuine failures is:</p>
<p>(0.90 × 0.01) ÷ [(0.90 × 0.01) + (0.05 × 0.99)] = <b>15.38%</b>.</p>
<p>That is much lower than 44.29%, even though the model's sensitivity and specificity have not changed. This is called <b>prevalence dependence</b> of predictive values. Precision and negative predictive value depend on how common the event is in the population where the system is used.</p>
<p>This has a direct operational consequence. A screening model validated in one market may produce a very different alert queue in another market. The team should not simply carry over the old precision figure. It should re-estimate prevalence and validate the model under the new conditions.</p>
<div class="callout watch"><b>Model performance is not one permanent number.</b> Sensitivity and specificity can also change when the population or data process changes. Monitor the model after deployment rather than treating a validation report as a lifetime guarantee.</div>`
    },
    {
      id: 'st-2-3-ex5-v2',
      type: 'exercise',
      title: 'Your turn: estimate precision in a low-prevalence population',
      body: `<p>Set the failure prevalence to 1%, sensitivity to 90% and false positive rate to 5%. Calculate P(Failed | Alert).</p>
<p>Print the result to four decimal places. You should see <code>0.1538</code>.</p>
<p><b>Think before you type:</b> use the same Bayes calculation as before. Only the base rate changes.</p>`,
      starter: `# Use the stated model assumptions\n\n# Write your code below\n`,
      hints: [
        'Set p_failed to 0.01. The alert probability is 0.90 * p_failed + 0.05 * (1 - p_failed).',
        'p_failed = 0.01\np_alert = 0.90 * p_failed + 0.05 * (1 - p_failed)\nprint("{:.4f}".format(0.90 * p_failed / p_alert))\n'
      ],
      solution: `p_failed = 0.01
p_alert = 0.90 * p_failed + 0.05 * (1 - p_failed)
print("{:.4f}".format(0.90 * p_failed / p_alert))
`,
      ordered: true
    },
    {
      id: 'st-2-3-c3-v2',
      type: 'check',
      title: 'The same model is moved to a population where failures are rarer. Why can precision fall?',
      body: `<p>Think about the number of healthy records available to generate false alerts.</p>`,
      options: [
        'Sensitivity automatically falls whenever prevalence falls',
        'The model becomes less accurate because its code changes',
        'A much larger healthy population can produce many false alerts, so a smaller share of all alerts may be genuine',
        'Bayes’ rule no longer applies when the event is rare'
      ],
      answer: 2,
      why: [
        'Sensitivity is a conditional rate among actual failures. A lower prevalence does not mathematically force sensitivity to change, although real-world performance can drift.',
        'The model code has not changed in this example. The mix of cases in the population has changed.',
        'Correct. Even a small false positive rate applied to a very large healthy group can produce many false alerts compared with the rare true failures.',
        'Bayes’ rule applies to rare events too. Rare events are exactly where base rates are especially important.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>You can now reverse a conditional probability when the base rate and the screening characteristics are known.</p>
<ul>
<li>You can distinguish sensitivity, specificity, false positive rate, precision and negative predictive value.</li>
<li>You can build a confusion matrix from rates and expected counts.</li>
<li>You can use Bayes' rule to calculate the probability that an alert is genuine.</li>
<li>You can explain why the base rate has a large effect when the target event is rare.</li>
<li>You can identify why accuracy alone may reward a system that ignores the event it was built to detect.</li>
<li>You can choose metrics with the costs of false alerts and missed cases in mind.</li>
</ul>
<p>The key question is not “How accurate is the model?” It is “Which cases does it get right, which cases does it get wrong, how often does each happen in our population, and what does each error cost?”</p>
<p>In the final lesson of this module, we will turn probabilities into a decision measure. When an outcome has several possible values, each with its own probability, the expected value gives us the long-run average payoff. It is a powerful way to compare decisions, provided we understand what it does—and does not—tell us.</p>`
    }
  ]
},
{
  id: 'st-2-4',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'matplotlib'],
  loopGuard: true,
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: `import pandas as pd
import numpy as np

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
products = pd.read_csv("products.csv")
payments = pd.read_csv("payments.csv")
deliveries = pd.read_csv("deliveries.csv")
order_items = pd.read_csv("order_items.csv")

master = order_items.merge(products[["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")
master = master.merge(orders[["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")
master = master.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
master["line_total"] = master["quantity"] * master["unit_price"]
master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")
master["order_year"] = master["order_date"].dt.year

orders_pay = orders.merge(payments, on="order_id", validate="one_to_one")
orders_pay["cash_kept"] = np.where(orders_pay["payment_status"].eq("Paid"), orders_pay["amount"], 0.0)
has_delivery = orders.merge(
    deliveries[["delivery_id", "order_id", "delivery_status", "dispatch_date", "delivery_date"]],
    on="order_id", how="left", validate="one_to_one")
orders_customers = orders.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
`,
  preloaded: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items', 'master', 'orders_pay', 'has_delivery', 'orders_customers'],
  title: '2.4 Expected value: the long-run average of a decision',
  tables: [],
  intro: `A finance manager is comparing two ways to handle a payment failure. One option is to stop immediately and record no recovery. The other is to attempt a retry, which costs money but may recover the payment. The manager asks: <i>“On average, what is each option worth, and what assumptions would make the retry worthwhile?”</i><br><br>Expected value is the answer to a carefully defined question of that kind. It is a probability-weighted average of the possible outcomes. It does not tell you what will happen to the next individual transaction, and it does not remove risk. In this lesson you will calculate expected values from the TradeFlow records, build a decision from explicit assumptions, and see why a long-run average is not the same thing as a guaranteed result.`,
  steps: [
    {
      type: 'explain',
      title: 'A random variable assigns a number to an uncertain outcome',
      body: `<p>Probability describes how likely events are. Expected value lets us attach a numerical outcome to those events.</p>
<p>A <b>random variable</b> is a rule that assigns a number to each possible outcome of a random experiment. The letter X is commonly used for a random variable.</p>
<p>Imagine selecting one payment at random. Define X as the amount of cash retained under this simple rule:</p>
<ul>
<li>If the payment status is Paid, X is the payment amount.</li>
<li>If the payment status is Failed, Pending or Refunded, X is zero.</li>
</ul>
<p>This is a deliberately simplified measure of cash retained in the supplied records. It is not accounting revenue, profit or a complete cash-flow measure: it does not include operating costs, the timing of settlement, later adjustments or other accounting rules. We define it clearly so the probability calculation has a precise outcome.</p>
<p>A random variable can take different values on different trials. We do not know which payment will be selected, so we do not know the value of X in advance. But we can calculate the average value we would expect across repeated selections from the same population.</p>
<div class="callout analogy"><b>One draw, one amount.</b> Put every payment record in a box. Some tickets carry a positive cash-kept amount; the others carry zero under our rule. Drawing one ticket gives one value of X. Drawing many tickets gives a collection of values whose average can be studied.</div>`
    },
    {
      type: 'try',
      title: 'Create the cash-kept outcome for each payment',
      body: `<p>The setup has already created <code>cash_kept</code>: the recorded amount for Paid transactions and zero for the other statuses. The mean is the average cash-kept value per payment record in this dataset.</p>
<p>The result is <b>134,139.47 amount units per payment</b>. The data dictionary does not specify a currency, so we will not attach a currency symbol.</p>`,
      code: `print("{:.2f}".format(orders_pay["cash_kept"].mean()))
print("{:.2f}".format(orders_pay["cash_kept"].sum()))
`
    },
    {
      type: 'explain',
      title: 'Expected value is a probability-weighted average',
      body: `<p>For a discrete random variable X with possible values x₁, x₂, …, xₙ, expected value is:</p>
<p><b>E(X) = x₁P(X = x₁) + x₂P(X = x₂) + … + xₙP(X = xₙ).</b></p>
<p>Each possible value is multiplied by the probability of receiving that value. The products are then added. This is a weighted average: outcomes that occur more often contribute more to the result.</p>
<p>Consider a simple example. A delivery bonus pays 0 amount units with probability 0.7 and 1,000 amount units with probability 0.3. Its expected value is 0 × 0.7 + 1,000 × 0.3 = 300 amount units. The expected value is not one of the possible payments. Nobody receives 300 on an individual trial. It is the average payoff per trial over many repetitions under the stated model.</p>
<p>For the TradeFlow cash-kept variable, each payment status is a group of outcomes. The simplified cash-kept value is zero for three statuses and equal to the recorded payment amount for Paid. We can calculate the mean directly from the 10,000 rows, or reconstruct it by weighting the conditional mean in each status group by that status's probability.</p>
<table class="mini">
<tr><th>Payment status</th><th>Probability</th><th>Cash kept under our rule</th></tr>
<tr><td>Paid</td><td>0.8461</td><td>Recorded amount</td></tr>
<tr><td>Pending</td><td>0.0604</td><td>0</td></tr>
<tr><td>Refunded</td><td>0.0512</td><td>0</td></tr>
<tr><td>Failed</td><td>0.0423</td><td>0</td></tr>
</table>
<p>Because amount varies within the Paid group, the contribution from Paid is its probability multiplied by its average amount among Paid payments. The other statuses contribute zero under this definition. This is exactly the logic of the weighted-average formula.</p>
<div class="callout watch"><b>Expected value is attached to a defined outcome.</b> Change what counts as “cash kept” and the expected value changes. A pending payment is not automatically cash received simply because it may clear later. State the rule before reporting the number.</div>`
    },
    {
      id: 'st-2-4-ex1-v2',
      type: 'exercise',
      title: 'Your turn: calculate the average cash kept per payment',
      body: `<p>Use the prepared <code>cash_kept</code> column to calculate the mean amount retained per payment record. Print it to two decimal places.</p>
<p>You should see <code>134139.47</code>.</p>
<p><b>Think before you type:</b> the expected value of the empirical distribution is the arithmetic mean of its observed outcomes. Do not average only the Paid rows; the experiment selects from all 10,000 payment records.</p>`,
      starter: `# orders_pay["cash_kept"] is already prepared\n\n# Write your code below\n`,
      hints: [
        'Take the mean of orders_pay["cash_kept"] and format it to two decimal places.',
        'print("{:.2f}".format(orders_pay["cash_kept"].mean()))\n'
      ],
      solution: `print("{:.2f}".format(orders_pay["cash_kept"].mean()))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Reconstruct the mean from the outcome groups',
      body: `<p>The same expected value can be assembled from groups. This is useful when the outcome is described by categories rather than supplied as one ready-made numerical column.</p>
<p>For each payment status, calculate two things:</p>
<ol>
<li>The probability of selecting a payment with that status: group count divided by 10,000.</li>
<li>The average cash-kept value within that status group.</li>
</ol>
<p>Multiply those two values for each group, then add the contributions. For Paid, the probability is 0.8461 and the average amount is about 158,538.56. Its contribution is about 134,139.47. The other three status groups contribute zero because of the simplified definition of cash kept.</p>
<p>This is the law of total expectation in a practical form: the overall mean is the weighted average of the group means, with group probabilities as weights. It is a useful bridge between probability tables and real business summaries.</p>
<p>It also exposes a common mistake: calculating the average amount among successful payments and reporting it as the expected amount per payment. The first number answers “how much is retained when a payment is Paid?” The second answers “how much is retained per payment selected from the whole population?” They use different denominators.</p>`
    },
    {
      type: 'try',
      title: 'Calculate the group probabilities and weighted contributions',
      body: `<p>The code groups payments by status, calculates the probability of each status and the mean cash-kept value in that group, then multiplies and sums the contributions. It should match the direct column mean.</p>`,
      code: `grouped = orders_pay.groupby("payment_status")["cash_kept"]
probabilities = grouped.size() / len(orders_pay)
conditional_means = grouped.mean()

weighted_value = (probabilities * conditional_means).sum()
print("{:.2f}".format(weighted_value))
print(probabilities.round(4).to_dict())
`
    },
    {
      id: 'st-2-4-ex2-v2',
      type: 'exercise',
      title: 'Your turn: calculate expected cash kept from the status groups',
      body: `<p>Use <code>groupby</code> to calculate the probability of each payment status and the mean cash-kept value within that status. Multiply each probability by its group mean, then add the contributions.</p>
<p>Print the weighted expected value to two decimal places. It should be <code>134139.47</code>.</p>
<p><b>Think before you type:</b> group size divided by the total number of payments gives the probability weight. The mean of cash_kept within each group gives the conditional mean. Multiply the two Series and sum.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'Use grouped = orders_pay.groupby("payment_status")["cash_kept"]. Then create probabilities with grouped.size() / len(orders_pay) and group means with grouped.mean().',
        'grouped = orders_pay.groupby("payment_status")["cash_kept"]\nprobabilities = grouped.size() / len(orders_pay)\nconditional_means = grouped.mean()\nexpected_value = (probabilities * conditional_means).sum()\nprint("{:.2f}".format(expected_value))\n'
      ],
      solution: `grouped = orders_pay.groupby("payment_status")["cash_kept"]
probabilities = grouped.size() / len(orders_pay)
conditional_means = grouped.mean()
expected_value = (probabilities * conditional_means).sum()
print("{:.2f}".format(expected_value))
`,
      ordered: true
    },
    {
      id: 'st-2-4-c1-v2',
      type: 'check',
      title: 'The expected cash-kept value is 134,139.47 amount units. What is the correct interpretation?',
      body: `<p>Expected value is an average over repeated selections, not a promise about the next record.</p>`,
      options: [
        'Every payment record retains exactly 134,139.47 amount units',
        'The next randomly selected payment is guaranteed to retain 134,139.47 amount units',
        'Across many selections from the same defined population, the average cash-kept value per payment is expected to be close to 134,139.47',
        'The company makes 134,139.47 amount units of profit on every order'
      ],
      answer: 2,
      why: [
        'Individual records vary. Some retain a positive amount; others have zero under our simplified definition.',
        'Expected value does not predict the exact result of one trial. A single payment can be far above or below the average.',
        'Correct. It is the probability-weighted long-run average under the specified experiment and cash-kept rule.',
        'The dataset does not define profit, and the expected value is not a per-order guarantee. Costs and accounting treatment are outside this simplified variable.'
      ]
    },
    {
      type: 'explain',
      title: 'Use expected value to compare a decision',
      body: `<p>Expected value becomes useful for decisions when we define the possible payoffs, their probabilities and the costs that go with each outcome.</p>
<p>Consider a hypothetical retry policy for failed payments. The TradeFlow records show that the average amount attached to a Failed payment is about <b>156,665.86 amount units</b>. The supplied data do not tell us whether a retry would succeed, so we must state an assumption rather than invent a measured success rate.</p>
<p>Suppose a proposed retry process has these assumptions:</p>
<ul>
<li>A retry succeeds with probability 0.40.</li>
<li>If it succeeds, the business recovers the full average failed-payment amount of 156,665.86.</li>
<li>Each retry costs 8,000 amount units, whether or not it succeeds.</li>
</ul>
<p>There are two possible net outcomes:</p>
<table class="mini">
<tr><th>Outcome</th><th>Probability</th><th>Net value</th></tr>
<tr><td>Retry succeeds</td><td>0.40</td><td>156,665.86 − 8,000</td></tr>
<tr><td>Retry fails</td><td>0.60</td><td>−8,000</td></tr>
</table>
<p>The expected net value is:</p>
<p>0.40 × 156,665.86 − 8,000 = <b>54,666.34 amount units</b>.</p>
<p>Under those assumptions, a retry has a positive expected value compared with doing nothing, whose incremental value is zero. But this is not proof that the retry process should be launched. The 40% success rate is an assumption. A proper decision would test it, include staff time and customer effects, account for duplicate charges or other harms, and examine how the outcome varies across payment types.</p>
<div class="callout watch"><b>Separate observed inputs from assumed inputs.</b> The average amount on failed payments comes from TradeFlow. The retry success probability and cost are hypothetical. A sound analyst labels each clearly so that a scenario is never mistaken for measured performance.</div>`
    },
    {
      id: 'st-2-4-ex3-v2',
      type: 'exercise',
      title: 'Your turn: calculate the expected net value of a retry',
      body: `<p>Use the actual average payment amount among Failed payments. Under the stated hypothetical policy, a retry succeeds with probability 0.40 and costs 8,000 amount units per attempt.</p>
<p>Calculate the expected net value: success probability × average failed amount − retry cost. Print the result to two decimal places. You should see <code>54666.34</code>.</p>
<p><b>Think before you type:</b> the cost is paid whether the retry succeeds or fails, so subtract it once from the expected recovery. Do not multiply the cost by the success probability.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'Filter amount to Failed payments and take its mean. Multiply by 0.40, then subtract 8000.',
        'failed_amount = orders_pay.loc[orders_pay["payment_status"].eq("Failed"), "amount"].mean()\nexpected_net = 0.40 * failed_amount - 8000\nprint("{:.2f}".format(expected_net))\n'
      ],
      solution: `failed_amount = orders_pay.loc[orders_pay["payment_status"].eq("Failed"), "amount"].mean()
expected_net = 0.40 * failed_amount - 8000
print("{:.2f}".format(expected_net))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Find the break-even probability before recommending the retry',
      body: `<p>The previous example used a 40% retry success probability. What success rate would make the policy break even?</p>
<p>Set expected net value equal to zero:</p>
<p>p × average recovery − retry cost = 0.</p>
<p>Rearrange:</p>
<p><b>Break-even success probability = retry cost ÷ average recovery.</b></p>
<p>Using 8,000 divided by 156,665.86 gives about <b>0.0511, or 5.11%</b>. If the true success probability is higher than this, the simplified expected value is positive. If it is lower, the simplified expected value is negative.</p>
<p>This is a useful decision threshold, but it is only as reliable as the assumptions. The average amount may differ among the failed payments selected for retry. The cost may vary. A retry can also create consequences not represented in the two-outcome model. Analysts should test the policy with a pilot or a controlled experiment and replace assumptions with observed results.</p>
<div class="callout work"><b>At work:</b> break-even calculations help a team decide what evidence it needs. If the policy only works when 70% of retries succeed, but comparable operations achieve 10%, the idea is unlikely to be viable. If it works above 5%, even a modest success rate may justify a measured pilot.</div>`
    },
    {
      id: 'st-2-4-ex4-v2',
      type: 'exercise',
      title: 'Your turn: find the break-even retry success rate',
      body: `<p>Calculate the break-even success probability using the actual average amount for Failed payments and the hypothetical retry cost of 8,000 amount units.</p>
<p>Print the probability to four decimal places. You should see <code>0.0511</code>.</p>
<p><b>Think before you type:</b> break-even occurs when expected recovery equals retry cost. Divide the cost by the average amount that would be recovered on success.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'Calculate the mean amount among Failed payments, then divide 8000 by that mean.',
        'failed_amount = orders_pay.loc[orders_pay["payment_status"].eq("Failed"), "amount"].mean()\nbreak_even = 8000 / failed_amount\nprint("{:.4f}".format(break_even))\n'
      ],
      solution: `failed_amount = orders_pay.loc[orders_pay["payment_status"].eq("Failed"), "amount"].mean()
break_even = 8000 / failed_amount
print("{:.4f}".format(break_even))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The law of large numbers: why the average settles down',
      body: `<p>Expected value is a long-run average. The <b>law of large numbers</b> explains why sample averages tend to get closer to the expected value as the number of independent, identically distributed observations grows, provided the expected value exists.</p>
<p>Imagine drawing payment records at random, with replacement, from the same population. A sample of 20 records may contain an unusually large payment or several zero cash-kept outcomes. Its average can be far from 134,139.47. A sample of 2,000 records is less easily dominated by a handful of unusual outcomes, so its average will usually be closer.</p>
<p>There are two important qualifications:</p>
<ul>
<li><b>It is a tendency, not a guarantee for every sample size.</b> A sample of 2,000 can be farther from the expected value than a particular sample of 200. The result does not improve in a perfectly straight line.</li>
<li><b>The process must remain comparable.</b> If payment methods, customer behaviour or settlement rules change, repeated samples from the future may no longer come from the same distribution as the historical data.</li>
</ul>
<p>The law of large numbers does not say that a short-run loss must be followed by a gain. It does not make an individual outcome predictable. It describes what happens to averages across many repetitions of a stable process.</p>
<div class="callout watch"><b>Do not use the law of large numbers as a gambler's fallacy.</b> If a fair coin produces five Heads in a row, the next flip is still 50% Heads. The coin does not owe you Tails. Long-run balance is not a force that corrects the next result.</div>`
    },
    {
      type: 'try',
      title: 'Compare a small and a large sample',
      body: `<p>We draw payment outcomes from the empirical cash-kept column with replacement. A fixed random seed makes this demonstration repeatable.</p>
<p>The sample average for 20 records is noticeably different from the full-data mean. The average for 2,000 records is much closer in this run. A different seed may produce a different pattern; the lesson is about the general tendency, not a guarantee about every draw.</p>`,
      code: `values = orders_pay["cash_kept"].to_numpy()
rng = np.random.default_rng(26)

small = rng.choice(values, size=20, replace=True)
medium = rng.choice(values, size=200, replace=True)
large = rng.choice(values, size=2000, replace=True)

print("{:.2f}".format(values.mean()))
print("{:.2f}".format(small.mean()))
print("{:.2f}".format(medium.mean()))
print("{:.2f}".format(large.mean()))
`
    },
    {
      id: 'st-2-4-ex5-v2',
      type: 'exercise',
      title: 'Your turn: simulate the long-run average',
      body: `<p>Repeat the sampling experiment with random seed 26. Draw samples with replacement from <code>orders_pay["cash_kept"]</code>, with sizes 20, 200 and 2,000.</p>
<p>Print the mean of each sample, in that order, to two decimal places. You should see:</p>
<ul>
<li><code>113371.56</code></li>
<li><code>135698.04</code></li>
<li><code>133978.55</code></li>
</ul>
<p><b>Think before you type:</b> make one generator and use it for the three draws in order. Reinitialising the generator before each sample changes the sequence.</p>`,
      starter: `import numpy as np\n\n# Write your code below\n`,
      hints: [
        'Convert cash_kept to a NumPy array, create default_rng(26), and call choice three times with replace=True.',
        'values = orders_pay["cash_kept"].to_numpy()\nrng = np.random.default_rng(26)\nfor size in [20, 200, 2000]:\n    sample = rng.choice(values, size=size, replace=True)\n    print("{:.2f}".format(sample.mean()))\n'
      ],
      solution: `values = orders_pay["cash_kept"].to_numpy()
rng = np.random.default_rng(26)
for size in [20, 200, 2000]:
    sample = rng.choice(values, size=size, replace=True)
    print("{:.2f}".format(sample.mean()))
`,
      ordered: true
    },
    {
      id: 'st-2-4-c2-v2',
      type: 'check',
      title: 'A sample of 20 payments has an average cash-kept value far below the expected value. Does that prove the expected value is wrong?',
      body: `<p>Think about how much variation is possible in a small sample and what the law of large numbers actually says.</p>`,
      options: [
        'Yes. Every sample average must equal the expected value exactly',
        'No. A small sample can differ substantially; the law of large numbers describes the long-run behaviour of averages, not a guarantee for one sample',
        'Yes. A low sample average means the next sample must be high to compensate',
        'No. Expected value is only valid for samples larger than 2,000'
      ],
      answer: 1,
      why: [
        'Individual sample averages vary. Exact equality is not expected except by coincidence.',
        'Correct. A sample of 20 can be unrepresentative. Larger repeated samples tend to give more stable averages under a stable sampling process.',
        'That is the gambler’s fallacy. The next sample does not owe the previous sample a correction.',
        'There is no universal minimum sample size for expected value. It is defined by the probability distribution; sample size affects how precisely we estimate it.'
      ]
    },
    {
      type: 'explain',
      title: 'Two decisions can have the same expected value and very different risk',
      body: `<p>Expected value is important, but it does not describe the entire distribution of outcomes. Consider two hypothetical projects:</p>
<table class="mini">
<tr><th>Project</th><th>Possible outcome</th><th>Probability</th></tr>
<tr><td><b>A</b></td><td>Receive 100 amount units</td><td>1.00</td></tr>
<tr><td><b>B</b></td><td>Receive 0 amount units</td><td>0.50</td></tr>
<tr><td><b>B</b></td><td>Receive 200 amount units</td><td>0.50</td></tr>
</table>
<p>Both have expected value 100. Project A always pays 100. Project B has a 50% chance of paying nothing and a 50% chance of paying 200. The average is identical, but the uncertainty is not.</p>
<p>A risk-neutral decision-maker comparing these isolated payoffs may be indifferent on expected value alone. A business with a strict cash requirement, limited reserves or a penalty for falling below a target may prefer the certain project. Another business may accept the variable project because it has the capacity to absorb the downside.</p>
<p>Expected value is therefore a starting point for decision-making, not a complete decision rule. Analysts should also examine spread, downside risk, timing, constraints and the consequences of extreme outcomes. You will study how probability distributions describe that spread in the next module.</p>
<p>One final distinction: expected value is <b>linear</b>. If X and Y are random outcomes, E(X + Y) = E(X) + E(Y), even when they are dependent, provided the expectations exist. But the variability of X + Y depends on how X and Y move together. That is one reason why knowing only the expected value is not enough for portfolio, inventory or operational risk decisions.</p>
<div class="callout work"><b>At work:</b> report the expected payoff with the assumptions that produced it, then add a description of the range and downside. A decision brief that shows only the average hides the outcomes management may care about most.</div>`
    },
    {
      id: 'st-2-4-c3-v2',
      type: 'check',
      title: 'Two projects both have an expected value of 100. One always pays 100; the other pays 0 or 200 with equal probability. What can you conclude?',
      body: `<p>The expected values are equal, but the possible outcomes are not.</p>`,
      options: [
        'The projects have identical risk because their expected values match',
        'The variable project must be better because it can pay 200',
        'They have the same expected value but different variability, so the decision may depend on risk tolerance and constraints',
        'Expected value cannot be used when more than one outcome is possible'
      ],
      answer: 2,
      why: [
        'Equal averages do not imply equal distributions. One outcome is certain; the other is variable.',
        'The possibility of a higher payoff does not remove the possibility of receiving zero. Both outcomes matter.',
        'Correct. Expected value summarises the long-run average, while risk depends on how outcomes are spread and on the cost of downside outcomes.',
        'Expected value is specifically designed to summarise uncertain outcomes with probabilities.'
      ]
    },
    {
      type: 'explain',
      title: 'Module 2 complete: what you can now do with probability',
      body: `<p>You have built the four foundations of probability-based analysis:</p>
<ul>
<li><b>2.1 Events and probability rules:</b> define the experiment, count events, calculate complements and combine events without double-counting.</li>
<li><b>2.2 Conditional probability:</b> read the denominator correctly, reverse neither the condition nor the question, calculate joint probabilities and distinguish independence from mutual exclusivity.</li>
<li><b>2.3 Bayes and base rates:</b> update a probability when evidence arrives, interpret screening systems and evaluate rare-event classifiers with measures that match the decision.</li>
<li><b>2.4 Expected value:</b> calculate probability-weighted payoffs, compare decisions under stated assumptions and understand why a long-run average is not a single outcome.</li>
</ul>
<p>The common thread is disciplined reasoning. State the population. Name the event. Identify what is known. Use the correct denominator. Make assumptions visible. Then translate the number into the decision it can support.</p>
<p>Probability does not make uncertainty disappear. It gives you a language for describing it and a set of rules for reasoning consistently when outcomes are not certain.</p>
<p>In Module 3, we will study probability distributions. We will move from individual events and averages to the full shape of uncertainty: how values cluster, how tails behave, why the normal distribution appears so often, and when a binomial model is appropriate. That is where the ideas in this module become working models for forecasting, quality control and risk.</p>`
    }
  ]
}
);
