LESSONS.push(
{
  id: 'st-2-1',
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
has_delivery = orders.merge(
    deliveries[["delivery_id", "order_id", "delivery_status", "dispatch_date", "delivery_date"]],
    on="order_id", how="left", validate="one_to_one")
orders_customers = orders.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
`,
  preloaded: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items', 'master', 'orders_pay', 'has_delivery', 'orders_customers'],
  title: '2.1 Probability from counts: events, complements and addition',
  tables: [],
  intro: `The operations director is reviewing the weekly order report. She points to the status column and asks: <i>“If I select one order at random, how likely is it to be cancelled? And what is the chance it is either cancelled or returned?”</i><br><br>Those sound like simple questions. They are simple once the question is stated precisely. The difficulty is not dividing two numbers; it is knowing which records belong in the numerator, which records belong in the denominator, and whether two events can overlap. This lesson builds that foundation. You will work with all 10,000 TradeFlow orders and payments, then use a fair die to see the difference between a probability we can calculate from a model and a rate we estimate from data.`,
  steps: [
    {
      type: 'explain',
      title: 'Start by naming the experiment and the possible outcomes',
      body: `<p>Probability begins with a carefully stated experiment. Here is ours:</p>
<p><b>Experiment:</b> select one record uniformly at random from the 10,000 rows in <code>orders</code>, then inspect its <code>order_status</code>.</p>
<p>The phrase <i>uniformly at random</i> matters. It means every order row has the same chance of being selected: one chance in 10,000. We are not selecting a customer, a payment amount or a delivery. We are selecting an <b>order</b>. That choice determines the population we are talking about.</p>
<p>Three terms make the experiment precise:</p>
<ul>
<li><b>Sample space</b>, written S: the set of all possible outcomes of the experiment. In this case, it is the 10,000 order records that could be selected.</li>
<li><b>Outcome</b>: one result of the experiment. For example, selecting order 1042, whose status is Completed.</li>
<li><b>Event</b>: a set of outcomes that meet a condition. Let C be the event “the selected order is Cancelled”. Every selected row either belongs to C or it does not.</li>
</ul>
<p>An event can contain one outcome, many outcomes or no outcomes at all. “Order 1042 is selected” is a one-outcome event. “The order is Completed” is an event containing thousands of possible order records. “The order has a status of Lost” is an empty event in this dataset.</p>
<div class="callout analogy"><b>Think of a box of labelled tickets.</b> Put one ticket in a box for every order. Each ticket carries that order's status. Selecting an order at random is drawing one ticket without favouring any ticket. An event is the collection of tickets that satisfy a condition.</div>
<div class="callout watch"><b>Never leave the population implicit.</b> “The probability of cancellation is 5.29%” is incomplete unless the denominator is understood. It could mean orders, customers, deliveries or payment attempts. Those are different experiments and can have different probabilities.</div>`
    },
    {
      type: 'try',
      title: 'Count the cancelled orders',
      body: `<p>TradeFlow has <b>10,000 orders</b>, of which <b>529 are Cancelled</b>. The observed share is 529 divided by 10,000, or <b>0.0529 (5.29%)</b>.</p>
<p>In Pandas, <code>.eq("Cancelled")</code> creates a Boolean Series: one True or False for every order. When a Boolean Series is summed, True counts as 1 and False counts as 0. Its mean is therefore the share of rows that are True. That gives us the empirical probability directly.</p>`,
      code: `cancelled = orders["order_status"].eq("Cancelled")

print(int(cancelled.sum()))
print("{:.4f}".format(cancelled.mean()))
`
    },
    {
      type: 'explain',
      title: 'From a count to a probability',
      body: `<p>For a uniformly selected row from a finite dataset, the empirical probability of an event is:</p>
<p><b>Empirical probability = number of rows in the event ÷ total number of eligible rows.</b></p>
<p>For cancellation, that is 529 ÷ 10,000 = 0.0529. A probability is a number from 0 to 1:</p>
<ul>
<li><b>0</b> means the event is impossible under the stated experiment.</li>
<li><b>1</b> means the event is certain.</li>
<li><b>0.25</b> means a 25% chance, or one quarter of the probability mass.</li>
<li><b>0.0529</b> means 5.29%, roughly 5 cancellations in every 100 randomly selected orders over the long run.</li>
</ul>
<p>There are three common ways an analyst obtains a probability. They are related, but they are not interchangeable:</p>
<table class="mini">
<tr><th>Approach</th><th>How it is obtained</th><th>Example</th></tr>
<tr><td><b>Theoretical</b></td><td>From a defined model whose outcomes and assumptions are known</td><td>A fair six-sided die has a 1/6 chance of showing a six</td></tr>
<tr><td><b>Empirical</b></td><td>From observed relative frequencies in data</td><td>529 of 10,000 TradeFlow orders were cancelled</td></tr>
<tr><td><b>Model-based</b></td><td>From a statistical or predictive model fitted to evidence and assumptions</td><td>A calibrated risk model estimates a 7% chance that a customer will miss a payment</td></tr>
</table>
<p>The 5.29% we just calculated is an <b>empirical rate for this dataset</b>. It is not a promise that exactly 5.29% of next month's orders will be cancelled. Future orders may come from different customers, different countries or different operating conditions. Before using a historical rate as a forecast, an analyst checks whether the data are relevant to the future population and whether the process has changed.</p>
<div class="callout work"><b>How to report it at work:</b> say “529 of the 10,000 orders in this extract were cancelled, an observed rate of 5.29%.” That sentence gives the event, denominator, count and rate. It is more useful than reporting 5.29% alone.</div>`
    },
    {
      type: 'explain',
      title: 'The rules every probability must obey',
      body: `<p>The calculations so far are not separate tricks. They follow from a small set of rules, often called the <b>axioms of probability</b>. Every valid probability model must obey them.</p>
<ol>
<li><b>Non-negativity:</b> for any event A, P(A) is at least 0. A share of outcomes cannot be negative.</li>
<li><b>Normalisation:</b> the probability of the entire sample space is 1. Something in the defined sample space must happen.</li>
<li><b>Countable additivity:</b> for any countable collection of pairwise mutually exclusive events, the probability of their union is the sum of their probabilities. For two events, P(A or B) = P(A) + P(B).</li>
</ol>
<p>The complement rule follows from these axioms. A and not-A are mutually exclusive and together cover the sample space, so P(A) + P(not A) = 1. Rearranging gives P(not A) = 1 − P(A).</p>
<p>The general addition rule also follows from the same logic. When A and B overlap, split their union into three disjoint pieces: A without B, B without A, and the intersection. Adding those pieces once gives P(A or B) = P(A) + P(B) − P(A and B).</p>
<p>These rules give you basic checks for your work:</p>
<ul>
<li>Every event probability must be between 0 and 1.</li>
<li>The probabilities of all outcomes in a complete sample space must add to 1.</li>
<li>Disjoint categories may be added directly; overlapping events require an adjustment.</li>
</ul>
<div class="callout watch"><b>A probability above 1 or below 0 is not an unusual result.</b> It is a sign that the event, denominator, assumptions or arithmetic needs to be checked.</div>`
    },
    {
      id: 'st-2-1-c1-v2',
      type: 'check',
      title: 'The status column has four possible labels. Does that make each status equally likely?',
      body: `<p>Think about the difference between the number of labels and the number of records in each category.</p>`,
      options: [
        'Yes. Four labels mean each status has probability 0.25',
        'No. The probability depends on how many records fall into each status, unless the experiment or model makes the outcomes equally likely',
        'Yes, provided the dataset contains at least 1,000 rows',
        'No. A probability cannot be calculated from categories'
      ],
      answer: 1,
      why: [
        'A list of four labels does not make a fair four-outcome experiment. Equal likelihood must come from the design or the evidence, not from the number of category names.',
        'Correct. TradeFlow has 7,412 Completed orders but only 529 Cancelled orders. The observed probabilities are very different.',
        'Dataset size does not make categories equally common. A larger dataset usually makes an empirical rate more stable, but it does not force each category to have a quarter of the rows.',
        'A category that can be marked on each row is an event. Its probability can be estimated by counting the rows that satisfy it.'
      ]
    },
    {
      type: 'explain',
      title: 'The complement: the event that is not A',
      body: `<p>Every event has a <b>complement</b>: all outcomes in the sample space that are not in the event. If C means “Cancelled”, then C-complement means “not Cancelled”. These two groups cover every order and do not overlap.</p>
<p>Because one of the two must happen, their probabilities add to 1:</p>
<p><b>P(not A) = 1 − P(A).</b></p>
<p>So the probability that an order is not cancelled is 1 − 0.0529 = <b>0.9471</b>, or 94.71%. Notice what the phrase means: it includes Completed, Processing and Returned orders. It does not mean “Completed”. A complement is defined by what is excluded, not by a convenient category name.</p>
<p>The complement is often the quickest route to an answer. Suppose a system has a 2% probability of producing at least one error in a batch. The probability of no error is 1 − 0.02 = 0.98. We do not need to list every possible error-free outcome.</p>
<div class="callout watch"><b>“Not cancelled” is not the same as “completed”.</b> A returned order is not cancelled, but it is not completed either. Read the exact event before writing the code.</div>`
    },
    {
      type: 'try',
      title: 'Calculate the complement',
      body: `<p>The first value is the cancellation probability. The second is the probability of not being cancelled. The two must sum to exactly 1, apart from any rounding used for display.</p>`,
      code: `p_cancelled = orders["order_status"].eq("Cancelled").mean()
p_not_cancelled = 1 - p_cancelled

print("{:.4f}".format(p_cancelled))
print("{:.4f}".format(p_not_cancelled))
print("{:.4f}".format(p_cancelled + p_not_cancelled))
`
    },
    {
      id: 'st-2-1-ex1-v2',
      type: 'exercise',
      title: 'Your turn: returned, and not returned',
      body: `<p>Use the <code>orders</code> table to calculate the probability that a randomly selected order is Returned and the probability that it is <b>not</b> Returned.</p>
<p>Print the two probabilities, each to four decimal places, on separate lines. Your output should be <code>0.0505</code> followed by <code>0.9495</code>.</p>
<p><b>Think before you type:</b> create a Boolean Series for Returned, take its mean, and subtract that value from 1 for the complement. Do not use the Completed count: not Returned includes Cancelled and Processing orders too.</p>`,
      starter: `# orders is already loaded\n\n# Write your code below\n`,
      hints: [
        'Use orders["order_status"].eq("Returned").mean() for the event. The complement is 1 minus that result.',
        'p_returned = orders["order_status"].eq("Returned").mean()\nprint("{:.4f}".format(p_returned))\nprint("{:.4f}".format(1 - p_returned))\n'
      ],
      solution: `p_returned = orders["order_status"].eq("Returned").mean()
print("{:.4f}".format(p_returned))
print("{:.4f}".format(1 - p_returned))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Two events can overlap, or they can be kept apart',
      body: `<p>Probability becomes more interesting when a question contains the word <b>or</b>. Let A be “the order is Paid” and B be “the payment method is Card”. An order can satisfy both conditions at once. It can also satisfy one without satisfying the other.</p>
<p>Two symbols help keep the questions straight:</p>
<ul>
<li><b>A and B</b>, also called the intersection, means both conditions are true for the same record.</li>
<li><b>A or B</b>, also called the union, means at least one condition is true. In probability, “or” is inclusive unless the question says otherwise: A, B, or both.</li>
</ul>
<p>Some events are <b>mutually exclusive</b>: they cannot happen together in the same trial. A single order cannot have both the status Cancelled and the status Returned. Their intersection is empty. For mutually exclusive events, the addition rule is simple:</p>
<p><b>P(A or B) = P(A) + P(B).</b></p>
<p>That simple version is safe only when there is no overlap. If events can happen together, adding their probabilities counts the overlap twice. We must subtract it once:</p>
<p><b>P(A or B) = P(A) + P(B) − P(A and B).</b></p>
<p>This is the general addition rule. It works whether or not the events overlap. It is one of the most useful protections against double-counting in business reporting.</p>
<div class="callout analogy"><b>Two guest lists.</b> Imagine one list of people who paid by card and another list of people whose payment cleared. If you add the list sizes, anyone who is on both lists is counted twice. To count everyone on either list exactly once, subtract the people appearing on both.</div>`
    },
    {
      type: 'try',
      title: 'Cancelled or returned: two separate status groups',
      body: `<p>Order status is a single category for each order, so Cancelled and Returned cannot overlap. TradeFlow has 529 Cancelled orders and 505 Returned orders. The combined event contains 1,034 orders, so its probability is <b>0.1034</b>.</p>
<p>Use the direct count and the addition rule. They should agree. When they do, you have checked the result two ways.</p>`,
      code: `cancelled = orders["order_status"].eq("Cancelled")
returned = orders["order_status"].eq("Returned")

p_direct = (cancelled | returned).mean()
p_add = cancelled.mean() + returned.mean()

print("{:.4f}".format(p_direct))
print("{:.4f}".format(p_add))
`
    },
    {
      id: 'st-2-1-ex2-v2',
      type: 'exercise',
      title: 'Your turn: failed or refunded',
      body: `<p>Use the <code>payments</code> table to calculate the probability that a randomly selected payment is either Failed or Refunded.</p>
<p>Print the direct probability and the result from adding the two separate probabilities. Both should be <code>0.0935</code>.</p>
<p><b>Think before you type:</b> each payment has exactly one payment status, so Failed and Refunded are mutually exclusive. Use the Boolean operator <code>|</code> for the direct “either event” count.</p>`,
      starter: `# payments is already loaded\n\n# Write your code below\n`,
      hints: [
        'Create failed and refunded Boolean Series. The direct event is failed | refunded. The addition rule is failed.mean() + refunded.mean().',
        'failed = payments["payment_status"].eq("Failed")\nrefunded = payments["payment_status"].eq("Refunded")\nprint("{:.4f}".format((failed | refunded).mean()))\nprint("{:.4f}".format(failed.mean() + refunded.mean()))\n'
      ],
      solution: `failed = payments["payment_status"].eq("Failed")
refunded = payments["payment_status"].eq("Refunded")
print("{:.4f}".format((failed | refunded).mean()))
print("{:.4f}".format(failed.mean() + refunded.mean()))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'When the events overlap, subtract the intersection',
      body: `<p>Now consider “Paid or Card”. Those events overlap because many Card payments are Paid. Adding P(Paid) and P(Card) without adjustment would count those joint records twice.</p>
<p>The counts make the issue visible:</p>
<table class="mini">
<tr><th>Payment record</th><th>Count</th></tr>
<tr><td>Paid</td><td>8,461</td></tr>
<tr><td>Card</td><td>2,523</td></tr>
<tr><td>Both Paid and Card</td><td>2,149</td></tr>
<tr><td>Paid or Card</td><td>8,835</td></tr>
</table>
<p>The calculation is (8,461 + 2,523 − 2,149) ÷ 10,000 = <b>0.8835</b>. Without subtracting the overlap, the sum would be 1.0984. That cannot be the probability of an event because it is greater than 1. The impossible answer is a warning that we counted the same records twice.</p>
<p>In Pandas, <code>&amp;</code> means both conditions are true, while <code>|</code> means at least one is true. Parentheses matter when combining conditions: write <code>(paid) | (card)</code>, not an unparenthesised expression that mixes comparisons and operators.</p>
<div class="callout tip"><b>Before adding two rates, ask one question:</b> can a single row belong to both groups? If yes, use the general addition rule. If no, the simple addition rule is valid.</div>`
    },
    {
      type: 'try',
      title: 'Calculate Paid or Card without double-counting',
      body: `<p>Run the three lines of reasoning separately: the two individual probabilities, their overlap, and the final union. The answer must be 0.8835, not 1.0984.</p>`,
      code: `paid = orders_pay["payment_status"].eq("Paid")
card = orders_pay["payment_method"].eq("Card")

p_paid = paid.mean()
p_card = card.mean()
p_both = (paid & card).mean()
p_either = p_paid + p_card - p_both

print("{:.4f}".format(p_paid + p_card))
print("{:.4f}".format(p_both))
print("{:.4f}".format(p_either))
`
    },
    {
      id: 'st-2-1-c2-v2',
      type: 'check',
      title: 'Why is P(Paid) + P(Card) not the probability of Paid or Card?',
      body: `<p>One payment can be both Paid and Card. What does the extra term represent?</p>`,
      options: [
        'It adds the same joint records twice, so the overlap must be subtracted once',
        'It counts payments with missing amounts, so all missing amounts must be removed',
        'The two events are mutually exclusive, so the union has probability zero',
        'The addition rule only works when both probabilities are below 0.5'
      ],
      answer: 0,
      why: [
        'Correct. The sum counts every Paid record and every Card record. A record satisfying both is included twice, so subtract the intersection once.',
        'The issue is overlap between the event definitions, not missing values in the amount column.',
        'They are not mutually exclusive. The dataset has 2,149 payments that are both Paid and Card.',
        'There is no 0.5 restriction. The general addition rule works for any valid event probabilities.'
      ]
    },
    {
      id: 'st-2-1-ex3-v2',
      type: 'exercise',
      title: 'Your turn: Paid or Mobile Money',
      body: `<p>Calculate the probability that a randomly selected payment is Paid or was made using Mobile Money. These events overlap, so use the general addition rule.</p>
<p>Print the direct union probability and the probability calculated from the addition rule. Both should be <code>0.8879</code>.</p>
<p><b>Think before you type:</b> identify <code>paid</code>, <code>mobile</code> and <code>paid &amp; mobile</code>. The rule is P(Paid) + P(Mobile Money) − P(both).</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'Use payment_status for Paid and payment_method for Mobile Money. Compare (paid | mobile).mean() with the three-part addition rule.',
        'paid = orders_pay["payment_status"].eq("Paid")\nmobile = orders_pay["payment_method"].eq("Mobile Money")\np_union = paid.mean() + mobile.mean() - (paid & mobile).mean()\nprint("{:.4f}".format((paid | mobile).mean()))\nprint("{:.4f}".format(p_union))\n'
      ],
      solution: `paid = orders_pay["payment_status"].eq("Paid")
mobile = orders_pay["payment_method"].eq("Mobile Money")
p_union = paid.mean() + mobile.mean() - (paid & mobile).mean()
print("{:.4f}".format((paid | mobile).mean()))
print("{:.4f}".format(p_union))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A measured probability is only as good as the way rows were selected',
      body: `<p>We have treated every row in <code>orders</code> as equally likely to be selected. That is a clear mathematical experiment. But an analyst must also ask whether the rows represent the population they want to describe.</p>
<p>Suppose the question is “What share of TradeFlow orders are cancelled?” The full order extract is a natural starting point. Suppose instead the question is “What share of next quarter's orders will be cancelled?” The historical rate is evidence, but the future rate may differ if the customer mix, product mix, payment rules or operating process changes.</p>
<p>There are two separate sources of uncertainty here:</p>
<ul>
<li><b>Random variation:</b> even if the underlying process stays the same, a new sample will not have exactly the same proportion.</li>
<li><b>Selection or process bias:</b> the data may over-represent some types of records, omit others or come from a process that has changed. A larger sample does not automatically fix this.</li>
</ul>
<p>For example, if an analyst calculates cancellation probability using only orders that reached the delivery system, the 500 cancelled orders with no delivery record disappear from the denominator. That is not a small technical choice. It changes the experiment from “select an order” to “select an order that has a delivery record”.</p>
<p>Always write the experiment in a sentence before calculating. State the unit, the eligible population and how the selection is made. That discipline prevents many rate errors before they reach a dashboard.</p>
<div class="callout watch"><b>Historical frequency is not automatically a future guarantee.</b> Use the observed rate as a forecast only when the historical data are relevant and the underlying process is sufficiently stable. If the business changes, revisit the estimate.</div>`
    },
    {
      type: 'try',
      title: 'The theoretical probability of a fair die',
      body: `<p>A fair six-sided die has six equally likely faces. Only one face is a six, so the theoretical probability is 1/6, or approximately <b>0.1667</b>.</p>
<p>Now roll the die 10,000 times in a simulation. The observed frequency will usually be close to 1/6, but it will not be exactly 1/6. The simulation is not proving that the die is fair; we made fairness an assumption when we built the model.</p>`,
      code: `rng = np.random.default_rng(2026)
rolls = rng.integers(1, 7, size=10000)

print("{:.4f}".format(1 / 6))
print("{:.4f}".format((rolls == 6).mean()))
print(np.bincount(rolls, minlength=7)[1:].tolist())
`
    },
    {
      type: 'explain',
      title: 'Counting outcomes when the possibilities are equally likely',
      body: `<p>Sometimes an analyst is given a designed experiment rather than a historical dataset. If every elementary outcome is equally likely, probability can be found by counting:</p>
<p><b>Probability = number of favourable outcomes ÷ number of possible outcomes.</b></p>
<p>The difficult part is often counting the possible outcomes correctly. Two ideas help:</p>
<ul>
<li><b>Multiplication principle:</b> when a process has stages, multiply the number of available choices at each stage. A three-digit code with ten choices (0–9) at each position has 10 × 10 × 10 = 1,000 possible codes if digits may repeat.</li>
<li><b>Combinations:</b> use these when selecting a group and the order does not matter. The number of ways to choose r items from n distinct items is n! divided by r!(n−r)!. In Python, <code>math.comb(n, r)</code> calculates it.</li>
</ul>
<p>Suppose a sealed audit envelope contains five tickets: two marked Red and three marked Blue. Two tickets are selected without replacement, and we care only whether both are Red, not which ticket was first. There are 5 choose 2 = 10 equally likely pairs. Only one pair contains both Red tickets. The probability is 1/10 = 0.10.</p>
<p>We can reach the same answer sequentially: the first ticket is Red with probability 2/5. After one Red ticket is removed, one Red remains among four tickets, so the probability the second is Red is 1/4. Multiply: (2/5) × (1/4) = 0.10. This is the multiplication rule from the previous lesson, now applied to a sequence without replacement.</p>
<p>Counting is only valid when the elementary outcomes you count are equally likely. If the tickets are weighted or the selection process favours some records, counting outcomes alone is not enough; you must use their actual probabilities.</p>`
    },
    {
      type: 'try',
      title: 'Count pairs, then verify with sequential probabilities',
      body: `<p>Use <code>math.comb</code> to count all unordered pairs and the favourable pair. Then calculate the same probability by drawing the two Red tickets in sequence without replacement. The two answers should agree at 0.1000.</p>`,
      code: `import math

total_pairs = math.comb(5, 2)
favourable_pairs = math.comb(2, 2)
p_counting = favourable_pairs / total_pairs
p_sequential = (2 / 5) * (1 / 4)

print("{:.4f}".format(p_counting))
print("{:.4f}".format(p_sequential))
`
    },
    {
      id: 'st-2-1-ex4-v2',
      type: 'exercise',
      title: 'Your turn: the probability of a Rwanda order',
      body: `<p>Use <code>orders_customers</code> to estimate the probability that a randomly selected TradeFlow order belongs to a customer in Rwanda.</p>
<p>Print the probability to four decimal places. You should see <code>0.2191</code>.</p>
<p><b>Think before you type:</b> the unit is an order, not a customer. Each order is joined to its customer's country. Count rows whose country is Rwanda, then divide by the full joined order table. Do not divide by the number of customers.</p>`,
      starter: `# orders_customers is already loaded\n\n# Write your code below\n`,
      hints: [
        'Build a Boolean Series from orders_customers["country"].eq("Rwanda") and take its mean.',
        'p_rwanda_order = orders_customers["country"].eq("Rwanda").mean()\nprint("{:.4f}".format(p_rwanda_order))\n'
      ],
      solution: `p_rwanda_order = orders_customers["country"].eq("Rwanda").mean()
print("{:.4f}".format(p_rwanda_order))
`,
      ordered: true
    },
    {
      id: 'st-2-1-ex5-v2',
      type: 'exercise',
      title: 'Your turn: simulate a fair coin',
      body: `<p>Simulate 10,000 flips of a fair coin. Represent Heads as 1 and Tails as 0. Use random seed 2026 so that the result is reproducible.</p>
<p>Print the theoretical probability of Heads, then the simulated proportion of Heads, each to four decimal places. The first value must be <code>0.5000</code>. The second should be <code>0.5065</code>.</p>
<p><b>Think before you type:</b> use <code>rng.binomial(1, 0.5, size=10000)</code> to generate the flips. The mean of a 0/1 array is the proportion of ones.</p>`,
      starter: `import numpy as np\n\n# Write your code below\n`,
      hints: [
        'Start with rng = np.random.default_rng(2026), then generate 10,000 outcomes with rng.binomial(1, 0.5, size=10000).',
        'rng = np.random.default_rng(2026)\nflips = rng.binomial(1, 0.5, size=10000)\nprint("{:.4f}".format(0.5))\nprint("{:.4f}".format(flips.mean()))\n'
      ],
      solution: `rng = np.random.default_rng(2026)
flips = rng.binomial(1, 0.5, size=10000)
print("{:.4f}".format(0.5))
print("{:.4f}".format(flips.mean()))
`,
      ordered: true
    },
    {
      id: 'st-2-1-c3-v2',
      type: 'check',
      title: 'A fair coin simulation produces 0.4953 Heads. The theoretical probability is 0.5000. Which statement is correct?',
      body: `<p>Separate the model's probability from one finite run of the experiment.</p>`,
      options: [
        'The coin is unfair because the simulated proportion is not exactly 0.5',
        'The theoretical probability is 0.5, while 0.4953 is the observed proportion in this particular simulation',
        'The theoretical probability must be replaced by the most recent simulated proportion',
        'The simulation is invalid because a random result must be unpredictable and therefore cannot be repeated'
      ],
      answer: 1,
      why: [
        'A finite set of fair flips will almost never produce exactly half Heads. Small differences are expected under a fair-coin model.',
        'Correct. The model says P(Heads) = 0.5. The simulation records one finite run, whose observed proportion is 0.4953.',
        'One simulation is not enough to replace the model. A different run would produce a different observed proportion.',
        'A fixed seed makes a simulation reproducible for teaching and checking. Reproducibility does not change the probability model.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>You can now turn a clearly stated event into a probability, and you know how to check whether the calculation matches the event being described.</p>
<ul>
<li>You can name the experiment, sample space, outcome and event before touching the data.</li>
<li>You can estimate an empirical probability from counts, and distinguish it from a theoretical or model-based probability.</li>
<li>You can calculate a complement without counting the remaining rows again.</li>
<li>You can tell when two events are mutually exclusive and when they overlap.</li>
<li>You can use the general addition rule without double-counting records.</li>
<li>You can explain why an observed rate is evidence about a population, not a guarantee about the next batch.</li>
</ul>
<p>Keep one habit: every probability needs a denominator and a clearly named event. “Five percent” is not a complete analytical statement. “Five percent of orders in this extract were cancelled” is.</p>
<p>In the next lesson, we will keep the same events but change the question. Instead of asking how likely an event is overall, we will ask how likely it is <b>after we learn something else</b>. That is conditional probability, and it is at the centre of segmentation, risk analysis and diagnostic testing.</p>`
    }
  ]
},
{
  id: 'st-2-2',
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
has_delivery = orders.merge(
    deliveries[["delivery_id", "order_id", "delivery_status", "dispatch_date", "delivery_date"]],
    on="order_id", how="left", validate="one_to_one")
orders_customers = orders.merge(customers[["customer_id", "country"]], on="customer_id", validate="many_to_one")
`,
  preloaded: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items', 'master', 'orders_pay', 'has_delivery', 'orders_customers'],
  title: '2.2 Conditional probability: given changes the question',
  tables: [],
  intro: `The fulfilment manager sees that 500 cancelled orders have no delivery record. She asks two questions: <i>“If an order is cancelled, how likely is it to have no delivery? And if an order has no delivery record, how likely is it to be cancelled?”</i><br><br>The same two facts appear in both questions. The answers are not the same, because the group we start from is different. This is the central discipline of conditional probability: the word <b>given</b> changes the denominator. You will learn to read the direction of a conditional probability, build it from a two-way table, use the multiplication rule and test whether two events are independent.`,
  steps: [
    {
      type: 'explain',
      title: 'Given means that the eligible group has changed',
      body: `<p>Start with all 10,000 orders. Now imagine the manager tells you that the selected order is definitely Cancelled. You no longer need to consider every order in the dataset. The eligible group has shrunk to the 529 cancelled orders.</p>
<p>Inside that smaller group, 500 orders have no matching delivery row. So the probability of no delivery <b>given that the order is cancelled</b> is 500 out of 529, or 0.9452.</p>
<p>We write this as <b>P(no delivery | Cancelled)</b>. The vertical bar means “given”. Read from left to right: probability of no delivery, given that the order is cancelled.</p>
<p>The definition is:</p>
<p><b>P(A | B) = P(A and B) ÷ P(B)</b>, provided P(B) is greater than zero.</p>
<p>The event to the right of the bar, B, defines the eligible group and therefore the denominator. The numerator is the overlap: records that satisfy both A and B.</p>
<table class="mini">
<tr><th>Question</th><th>Numerator</th><th>Denominator</th></tr>
<tr><td>P(no delivery | Cancelled)</td><td>500 orders that are Cancelled and have no delivery</td><td>529 Cancelled orders</td></tr>
<tr><td>P(Cancelled | no delivery)</td><td>500 orders that are Cancelled and have no delivery</td><td>500 orders with no delivery record</td></tr>
</table>
<p>The numerator is the same, but the denominator changes. The first answer is 500 ÷ 529 = 94.52%. The second is 500 ÷ 500 = 100%.</p>
<div class="callout analogy"><b>Two different questions about the same room.</b> “What share of managers are women?” starts with all managers. “What share of women are managers?” starts with all women. The word order tells you which group belongs in the denominator.</div>`
    },
    {
      type: 'try',
      title: 'The same 500 orders, two denominators',
      body: `<p>The joined table <code>has_delivery</code> has one row per order. A missing <code>delivery_id</code> means that the order has no matching delivery record. Calculate both directions directly from the rows.</p>
<p>You should obtain <b>0.9452</b> and <b>1.0000</b>. The results differ because the conditions define different eligible groups.</p>`,
      code: `cancelled = has_delivery["order_status"].eq("Cancelled")
no_delivery = has_delivery["delivery_id"].isna()

print("{:.4f}".format(no_delivery[cancelled].mean()))
print("{:.4f}".format(cancelled[no_delivery].mean()))
`
    },
    {
      type: 'explain',
      title: 'A two-way table makes the denominator visible',
      body: `<p>When two yes-or-no events are involved, a 2 × 2 contingency table is one of the clearest ways to organise the evidence.</p>
<table class="mini">
<tr><th>Order status</th><th>No delivery</th><th>Has delivery</th><th>Total</th></tr>
<tr><td><b>Cancelled</b></td><td>500</td><td>29</td><td>529</td></tr>
<tr><td><b>Not cancelled</b></td><td>0</td><td>9,471</td><td>9,471</td></tr>
<tr><td><b>Total</b></td><td>500</td><td>9,500</td><td>10,000</td></tr>
</table>
<p>Read across a row when the condition is the row category. Read down a column when the condition is the column category. For example:</p>
<ul>
<li>Among Cancelled orders, 500 of 529 have no delivery record: 500 ÷ 529 = 94.52%.</li>
<li>Among orders with no delivery record, 500 of 500 are Cancelled: 500 ÷ 500 = 100%.</li>
</ul>
<p>A percentage is meaningless without its denominator. A table of counts is often the safest starting point because the reader can see the denominator before the percentage hides it.</p>
<p>In Pandas, <code>pd.crosstab(row_variable, column_variable)</code> creates this table. Add <code>normalize="index"</code> to convert each row into proportions that sum to 1, or <code>normalize="columns"</code> to convert each column into proportions that sum to 1. Those are different conditional distributions.</p>
<div class="callout tip"><b>Dashboard rule:</b> label the denominator in the chart title or subtitle. “Cancellation rate by country” should mean cancelled orders divided by all eligible orders in each country, not each country's share of all cancellations.</div>`
    },
    {
      type: 'try',
      title: 'Build the contingency table in Pandas',
      body: `<p>A table of counts makes the two directions of a conditional visible before any percentages are calculated. Here, the rows indicate whether an order was Cancelled and the columns indicate whether it has a delivery record.</p>
<p><code>margins=True</code> adds row and column totals. Read the 500 in the Cancelled / No delivery cell as the overlap. The row total 529 and column total 500 are the two different denominators used in the previous example.</p>`,
      code: `cancelled_label = has_delivery["order_status"].eq("Cancelled").map({True: "Cancelled", False: "Not Cancelled"})
no_delivery_label = has_delivery["delivery_id"].isna().map({True: "No delivery", False: "Has delivery"})

table = pd.crosstab(cancelled_label, no_delivery_label, margins=True)
print(table.to_string())
`
    },
    {
      id: 'st-2-2-ex1-v2',
      type: 'exercise',
      title: 'Your turn: calculate both delivery probabilities',
      body: `<p>Using <code>has_delivery</code>, print P(no delivery | Cancelled), then P(Cancelled | no delivery), each to four decimal places.</p>
<p>Your output should be <code>0.9452</code> and <code>1.0000</code>.</p>
<p><b>Think before you type:</b> filtering with <code>no_delivery[cancelled]</code> keeps only the cancelled rows before measuring the no-delivery share. Reversing the filter changes the denominator.</p>`,
      starter: `# has_delivery is already loaded\n\n# Write your code below\n`,
      hints: [
        'Create cancelled from order_status and no_delivery from the missing delivery_id. Take the mean of the relevant Boolean Series after filtering.',
        'cancelled = has_delivery["order_status"].eq("Cancelled")\nno_delivery = has_delivery["delivery_id"].isna()\nprint("{:.4f}".format(no_delivery[cancelled].mean()))\nprint("{:.4f}".format(cancelled[no_delivery].mean()))\n'
      ],
      solution: `cancelled = has_delivery["order_status"].eq("Cancelled")
no_delivery = has_delivery["delivery_id"].isna()
print("{:.4f}".format(no_delivery[cancelled].mean()))
print("{:.4f}".format(cancelled[no_delivery].mean()))
`,
      ordered: true
    },
    {
      id: 'st-2-2-c1-v2',
      type: 'check',
      title: 'You need P(no delivery | Cancelled). Which number belongs in the denominator?',
      body: `<p>The condition is the phrase to the right of the vertical bar.</p>`,
      options: [
        'All 10,000 orders',
        'All 9,500 orders that have a delivery record',
        'The 529 orders whose status is Cancelled',
        'The 500 orders that are both Cancelled and have no delivery'
      ],
      answer: 2,
      why: [
        'That denominator would calculate the unconditional probability of no delivery, not the probability given Cancelled.',
        'The question is not about orders that have a delivery record. It is about orders known to be Cancelled.',
        'Correct. Cancelled is the condition, so only the 529 cancelled orders are eligible. The 500 with no delivery form the numerator.',
        'The overlap is the numerator. Dividing it by itself would answer the reverse conditional in this dataset.'
      ]
    },
    {
      type: 'explain',
      title: 'Conditional probabilities are not reversible',
      body: `<p>A common analytical error is to treat P(A | B) as though it were P(B | A). They share the same overlap in the numerator, but they divide by different totals.</p>
<p>Consider a more familiar example. Suppose 80% of people who bought a product saw an advert. That does not tell you that 80% of people who saw the advert bought the product. The first percentage starts with buyers. The second starts with everyone who saw the advert. To reverse a conditional, you need additional information about the sizes of the groups.</p>
<p>In the TradeFlow table, P(no delivery | Cancelled) is 94.52%, while P(Cancelled | no delivery) is 100%. Neither is a correction of the other. They answer different questions.</p>
<p>Write the event names in full before calculating. For example:</p>
<ul>
<li>“Among Bank Transfer payments, what share failed?” is P(Failed | Bank Transfer).</li>
<li>“Among failed payments, what share used Bank Transfer?” is P(Bank Transfer | Failed).</li>
</ul>
<p>The second can be much larger or smaller than the first. It is not enough to know that a payment method has a high failure rate; the number of payments made using that method also matters.</p>
<div class="callout watch"><b>Do not reverse a rate in a presentation.</b> “Most failed payments used Bank Transfer” does not mean “most Bank Transfer payments failed.” The first conditions on failures; the second conditions on Bank Transfer. Bayes' rule, in the next lesson, shows how to move between them when the required information is available.</div>`
    },
    {
      id: 'st-2-2-ex2-v2',
      type: 'exercise',
      title: 'Your turn: failure by method, and method among failures',
      body: `<p>Calculate two probabilities from <code>orders_pay</code>:</p>
<ul>
<li>P(Failed | Bank Transfer)</li>
<li>P(Bank Transfer | Failed)</li>
</ul>
<p>Print them in that order, to four decimal places. You should see <code>0.0502</code> and <code>0.2931</code>.</p>
<p><b>Think before you type:</b> the first filters to Bank Transfer and measures failures inside that group. The second filters to Failed and measures Bank Transfer inside that group.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'Create bank and failed Boolean Series. Use failed[bank].mean() for the first conditional and bank[failed].mean() for the second.',
        'bank = orders_pay["payment_method"].eq("Bank Transfer")\nfailed = orders_pay["payment_status"].eq("Failed")\nprint("{:.4f}".format(failed[bank].mean()))\nprint("{:.4f}".format(bank[failed].mean()))\n'
      ],
      solution: `bank = orders_pay["payment_method"].eq("Bank Transfer")
failed = orders_pay["payment_status"].eq("Failed")
print("{:.4f}".format(failed[bank].mean()))
print("{:.4f}".format(bank[failed].mean()))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The multiplication rule connects a joint event to a conditional event',
      body: `<p>Conditional probability also gives us a rule for calculating the probability that two events happen together.</p>
<p>Start with the definition:</p>
<p>P(B | A) = P(A and B) ÷ P(A).</p>
<p>Multiply both sides by P(A):</p>
<p><b>P(A and B) = P(A) × P(B | A).</b></p>
<p>This is the <b>multiplication rule</b>. It is always valid when P(A) is defined and non-zero. It does not require independence.</p>
<p>For TradeFlow, let A be “the order is Cancelled” and B be “the order has no delivery record”. The chance of both is:</p>
<p>0.0529 × 0.9452 = <b>0.0500</b>.</p>
<p>That is also 500 ÷ 10,000 = 0.0500, which is the direct joint probability. The rule simply rebuilds the joint event from the probability of entering A and the probability of B within A.</p>
<p>For three events, the same idea can be extended:</p>
<p><b>P(A and B and C) = P(A) × P(B | A) × P(C | A and B).</b></p>
<p>This is useful for a sequence of dependent events. For example, the probability that an application is approved, the customer accepts the offer and the first payment clears can be built from each stage's conditional probability. Do not multiply three overall rates unless the events are independent.</p>
<div class="callout work"><b>Operational use:</b> funnel conversion is a chain of conditional probabilities. A visitor must reach the product page, add an item, begin checkout and complete payment. Each stage uses the people who reached the previous stage as its denominator.</div>`
    },
    {
      type: 'try',
      title: 'Rebuild the joint event from the two parts',
      body: `<p>The first value uses the multiplication rule. The second counts the joint event directly. Both should equal 0.0500.</p>`,
      code: `cancelled = has_delivery["order_status"].eq("Cancelled")
no_delivery = has_delivery["delivery_id"].isna()

p_rule = cancelled.mean() * no_delivery[cancelled].mean()
p_direct = (cancelled & no_delivery).mean()

print("{:.4f}".format(p_rule))
print("{:.4f}".format(p_direct))
`
    },
    {
      type: 'explain',
      title: 'A probability tree follows each possible path',
      body: `<p>A <b>probability tree</b> is another way to display a sequence of events. Each branch shows a conditional probability. To find the probability of reaching the end of a path, multiply the probabilities along that path.</p>
<p>For the delivery example, the first split is whether an order is Cancelled. The next split is whether a delivery record exists, conditional on that first result:</p>
<table class="mini">
<tr><th>Path</th><th>Multiply along the path</th><th>Joint probability</th></tr>
<tr><td>Cancelled, then no delivery</td><td>0.0529 × 0.9452</td><td><b>0.0500</b></td></tr>
<tr><td>Cancelled, then has delivery</td><td>0.0529 × 0.0548</td><td>0.0029</td></tr>
<tr><td>Not cancelled, then no delivery</td><td>0.9471 × 0.0000</td><td>0.0000</td></tr>
<tr><td>Not cancelled, then has delivery</td><td>0.9471 × 1.0000</td><td>0.9471</td></tr>
</table>
<p>The four end paths cover every order and do not overlap. Their joint probabilities therefore add to 1. This is useful for multi-stage processes such as onboarding, claims handling, payment collection and delivery fulfilment.</p>
<p>At each split, the branch probabilities must add to 1. Along a path, multiply. Across separate paths that describe mutually exclusive outcomes, add. That combination of multiplication and addition is the foundation of tree calculations.</p>`
    },
    {
      type: 'explain',
      title: 'Independence means the condition makes no difference',
      body: `<p>Two events A and B are <b>independent</b> when knowing that one occurred does not change the probability of the other.</p>
<p>In symbols, if P(A) is positive:</p>
<p><b>P(B | A) = P(B).</b></p>
<p>The equivalent multiplication statement is:</p>
<p><b>P(A and B) = P(A) × P(B).</b></p>
<p>Use TradeFlow's Card and Paid events. P(Paid) is 0.8461. Among Card payments, P(Paid | Card) is 0.8518. The two rates are close, but not exactly equal. The joint probability is 0.2149; multiplying the separate probabilities gives 0.2135. The small difference suggests a weak relationship in this dataset, but a formal decision about whether the difference is distinguishable from sampling variation belongs to later inference work.</p>
<p>Do not confuse <b>independent</b> with <b>mutually exclusive</b>:</p>
<table class="mini">
<tr><th>Term</th><th>Meaning</th><th>What it says about the overlap</th></tr>
<tr><td><b>Mutually exclusive</b></td><td>The events cannot happen together</td><td>P(A and B) = 0</td></tr>
<tr><td><b>Independent</b></td><td>Knowing one event occurred does not change the probability of the other</td><td>P(A and B) = P(A) × P(B)</td></tr>
</table>
<p>Cancelled and Returned are mutually exclusive because one order cannot have both statuses. They are not independent: once an order is known to be Cancelled, the probability that it is Returned is zero, not the overall returned rate of 5.05%.</p>
<div class="callout watch"><b>Mutually exclusive events with positive probabilities cannot be independent.</b> If A rules out B, knowing A has happened changes the probability of B to zero. Independence would require it to remain at its original positive probability.</div>`
    },
    {
      id: 'st-2-2-ex3-v2',
      type: 'exercise',
      title: 'Your turn: test the independence of Card and Paid',
      body: `<p>Calculate P(Paid | Card), then P(Paid). Print both values to four decimal places. You should see <code>0.8518</code> and <code>0.8461</code>.</p>
<p>The two values are close, but do not call them exactly equal. In a real analysis, you would quantify the uncertainty around the difference before making a strong claim.</p>
<p><b>Think before you type:</b> the conditional rate filters the Paid Boolean Series to Card payments. The unconditional rate takes the mean across all payments.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'paid[card].mean() is P(Paid | Card). paid.mean() is P(Paid).',
        'paid = orders_pay["payment_status"].eq("Paid")\ncard = orders_pay["payment_method"].eq("Card")\nprint("{:.4f}".format(paid[card].mean()))\nprint("{:.4f}".format(paid.mean()))\n'
      ],
      solution: `paid = orders_pay["payment_status"].eq("Paid")
card = orders_pay["payment_method"].eq("Card")
print("{:.4f}".format(paid[card].mean()))
print("{:.4f}".format(paid.mean()))
`,
      ordered: true
    },
    {
      id: 'st-2-2-c2-v2',
      type: 'check',
      title: 'Cancelled and Returned cannot occur on the same order. What does that tell you?',
      body: `<p>Use the definitions of mutual exclusivity and independence. They describe different properties.</p>`,
      options: [
        'They are independent because their labels are different',
        'They are mutually exclusive and dependent, because knowing one occurred rules out the other',
        'They are both independent and mutually exclusive',
        'They are neither, because both events have probabilities near 0.05'
      ],
      answer: 1,
      why: [
        'Different labels do not establish independence. Independence is about whether conditioning changes a probability.',
        'Correct. Their intersection is empty, so they are mutually exclusive. Knowing one occurred makes the other impossible, so they are dependent.',
        'If both events have positive probabilities, mutual exclusivity forces the conditional probability to zero, while independence would leave it unchanged. Both cannot hold.',
        'The sizes of the probabilities do not decide the relationship. The overlap and conditional probability do.'
      ]
    },
    {
      type: 'explain',
      title: 'Measure the size of the difference, not just its direction',
      body: `<p>Conditional probabilities are often used to compare business segments: failure by payment method, churn by plan, return rate by product category or conversion by marketing channel.</p>
<p>For payment failure, the observed rates are:</p>
<table class="mini">
<tr><th>Payment method</th><th>Failed payments</th><th>Total payments</th><th>Failure rate</th></tr>
<tr><td>Bank Transfer</td><td>124</td><td>2,471</td><td><b>5.02%</b></td></tr>
<tr><td>Mobile Money</td><td>112</td><td>2,547</td><td>4.40%</td></tr>
<tr><td>Cash on Delivery</td><td>98</td><td>2,459</td><td>3.99%</td></tr>
<tr><td>Card</td><td>89</td><td>2,523</td><td>3.53%</td></tr>
<tr><td><b>All methods</b></td><td><b>423</b></td><td><b>10,000</b></td><td><b>4.23%</b></td></tr>
</table>
<p>Bank Transfer has the highest observed failure rate, but it is 5.02%, not 50.2%. The gap against the overall rate is 0.79 percentage points. A percentage-point difference is found by subtraction: 5.02% − 4.23% = 0.79 percentage points. A relative increase is a different calculation: 0.79 ÷ 4.23 is about 18.7% higher than the overall rate.</p>
<p>Neither comparison proves that the payment method causes failures. Customers using different methods may differ in country, order size or other characteristics. Conditional probability describes an observed relationship. It does not, by itself, identify a cause.</p>
<div class="callout work"><b>At work:</b> always show the segment denominator beside the rate. A 20% failure rate based on five transactions is not as stable as a 5% rate based on five thousand transactions. Later modules will give you the tools to quantify that uncertainty.</div>`
    },
    {
      id: 'st-2-2-ex4-v2',
      type: 'exercise',
      title: 'Your turn: compare Bank Transfer with the overall failure rate',
      body: `<p>Print P(Failed | Bank Transfer), then the overall P(Failed), each to four decimal places. You should see <code>0.0502</code> and <code>0.0423</code>.</p>
<p>Then calculate the difference in percentage points and print it to two decimal places. You should see <code>0.79</code>.</p>
<p><b>Think before you type:</b> subtract the two probabilities and multiply by 100 to express the result in percentage points. Do not divide by the overall rate; that would calculate a relative percentage increase.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'Create failed and bank. Calculate failed[bank].mean() and failed.mean(). For percentage points, subtract the two probabilities and multiply by 100.',
        'failed = orders_pay["payment_status"].eq("Failed")\nbank = orders_pay["payment_method"].eq("Bank Transfer")\np_segment = failed[bank].mean()\np_all = failed.mean()\nprint("{:.4f}".format(p_segment))\nprint("{:.4f}".format(p_all))\nprint("{:.2f}".format((p_segment - p_all) * 100))\n'
      ],
      solution: `failed = orders_pay["payment_status"].eq("Failed")
bank = orders_pay["payment_method"].eq("Bank Transfer")
p_segment = failed[bank].mean()
p_all = failed.mean()
print("{:.4f}".format(p_segment))
print("{:.4f}".format(p_all))
print("{:.2f}".format((p_segment - p_all) * 100))
`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Check independence with the joint probability',
      body: `<p>Independence can be checked in two equivalent ways. Compare P(Paid | Card) with P(Paid), or compare P(Paid and Card) with P(Paid) × P(Card).</p>
<p>The next code prints the joint probability and the product of the two marginal probabilities. They are close but not identical: <b>0.2149</b> versus <b>0.2135</b>.</p>`,
      code: `paid = orders_pay["payment_status"].eq("Paid")
card = orders_pay["payment_method"].eq("Card")

p_joint = (paid & card).mean()
p_product = paid.mean() * card.mean()

print("{:.4f}".format(p_joint))
print("{:.4f}".format(p_product))
`
    },
    {
      id: 'st-2-2-ex5-v2',
      type: 'exercise',
      title: 'Your turn: reconstruct the joint probability',
      body: `<p>Calculate the probability that a randomly selected payment is both Bank Transfer and Failed in two ways:</p>
<ul>
<li>Directly, from the rows satisfying both conditions.</li>
<li>Using P(Bank Transfer) × P(Failed | Bank Transfer).</li>
</ul>
<p>Print both values to four decimal places. They should both be <code>0.0124</code>.</p>
<p><b>Think before you type:</b> the second expression uses the multiplication rule, not an independence assumption. The conditional term is the failure rate among Bank Transfer payments.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'Build bank and failed. The direct joint is (bank & failed).mean(). The rule is bank.mean() * failed[bank].mean().',
        'bank = orders_pay["payment_method"].eq("Bank Transfer")\nfailed = orders_pay["payment_status"].eq("Failed")\np_direct = (bank & failed).mean()\np_rule = bank.mean() * failed[bank].mean()\nprint("{:.4f}".format(p_direct))\nprint("{:.4f}".format(p_rule))\n'
      ],
      solution: `bank = orders_pay["payment_method"].eq("Bank Transfer")
failed = orders_pay["payment_status"].eq("Failed")
p_direct = (bank & failed).mean()
p_rule = bank.mean() * failed[bank].mean()
print("{:.4f}".format(p_direct))
print("{:.4f}".format(p_rule))
`,
      ordered: true
    },
    {
      id: 'st-2-2-c3-v2',
      type: 'check',
      title: 'A colleague says Cash on Delivery is the riskiest method because payment happens later. What does the observed table support?',
      body: `<p>Compare the failure rates, not the story attached to the method.</p>`,
      options: [
        'Cash on Delivery is highest because it sounds riskier',
        'Bank Transfer has the highest observed failure rate at 5.02%; Cash on Delivery is 3.99%',
        'All methods have the same failure rate because they have similar numbers of payments',
        'The table proves Bank Transfer causes payment failure'
      ],
      answer: 1,
      why: [
        'A plausible explanation is not a substitute for the conditional rate. The observed data do not support this claim.',
        'Correct. Bank Transfer is 5.02%, compared with 3.99% for Cash on Delivery. The difference is descriptive; it does not establish why it exists.',
        'Similar denominators do not force identical numerators or rates. The observed rates differ.',
        'The table shows an association. Customers who choose Bank Transfer may differ from other customers, so causation needs a stronger design.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>You can now move confidently between an overall probability, a probability within a subgroup and the probability of two events occurring together.</p>
<ul>
<li>You can read P(A | B) in the correct direction and identify its denominator.</li>
<li>You can build conditional probabilities from a 2 × 2 table or a filtered dataset.</li>
<li>You can distinguish a conditional rate from its reverse.</li>
<li>You can use the multiplication rule to calculate a joint probability without assuming independence.</li>
<li>You can test the definition of independence and explain why it is different from mutual exclusivity.</li>
<li>You can describe segment differences without turning an observed association into a causal claim.</li>
</ul>
<p>One sentence is worth keeping beside your notebook: <b>the condition tells you which records are eligible, and eligible records determine the denominator.</b></p>
<p>Next, we will solve the problem that conditional probability leaves open: how do you reverse a conditional when the information arrives in the opposite direction? A screening system may tell us how often it flags a real failure. Management wants to know how often a flag is actually a failure. That is Bayes' rule.</p>`
    }
  ]
}
);
