LESSONS.push(
{
  id: 'st-2-1',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'matplotlib'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: `import pandas as pd
import numpy as np

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
products = pd.read_csv("products.csv")
payments = pd.read_csv("payments.csv")
deliveries = pd.read_csv("deliveries.csv")
order_items = pd.read_csv("order_items.csv")

deliveries["transit_days"] = (pd.to_datetime(deliveries["delivery_date"]) - pd.to_datetime(deliveries["dispatch_date"])).dt.days

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
`,
  preloaded: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items', 'master', 'orders_pay', 'has_delivery'],
  title: '2.1 Probability from counts: events, complements and addition',
  tables: [],
  intro: `The operations lead taps the orders screen. <i>“If I pull one order at random, what is the chance it is cancelled? And what is the chance it is a problem order, cancelled or returned? Don’t give me a feeling. Count.”</i><br><br>That request is the whole of this lesson. A probability, in the work you actually do, is a share you can point at: this many rows out of that many rows. By the end you will be able to turn a yes-or-no question about TradeFlow into a number between 0 and 1, and you will know the two rules that stop people double-counting. <code>orders_pay</code> is ready: one row per order, with its payment attached.`,
  steps: [
    {
      type: 'explain',
      title: 'A probability is a share, not a mood',
      body: `<p>When the operations lead says “the chance an order is cancelled”, she is not asking how worried you are. She is asking this:</p>
<p><b>If we kept pulling orders at random, forever, what share of them would be cancelled?</b></p>
<p>That long-run share is the <b>probability</b>. Because she said <i>at random</i>, every one of the 10,000 orders is on the same footing. None is more likely to be pulled than another. So the long-run share is just today’s count:</p>
<p><b>probability = rows in the event ÷ rows you could have pulled.</b></p>
<p>Three words make this precise, and then we can put them down.</p>
<ul>
<li>The <b>sample space</b> is the list of everything that could come up. Here it is the 10,000 orders.</li>
<li>An <b>outcome</b> is one item on that list. One order.</li>
<li>An <b>event</b> is a description that picks out some of the outcomes. “Cancelled” is an event. “Cancelled or returned” is a bigger event. “Order 1” is an event with a single outcome.</li>
</ul>
<p>Write the probability of an event A as <b>P(A)</b>. It is a number from 0 to 1. Zero means the event never happens. One means it happens every time. A half means it happens on half the pulls. Multiply by 100 if someone wants a percent: 0.05 is 5 percent. Same fact, different clothes.</p>
<div class="callout analogy"><b>A barrel of tickets.</b> Picture 10,000 tickets, one per order, shaken in a barrel. The probability of an event is the share of tickets that match it. You do not guess how full the barrel feels. You count the tickets.</div>
<div class="callout watch"><b>“At random” is doing the work.</b> The division is fair only because every order can be pulled. If the lead had said “an order I happen to remember”, the tickets would not be equal and the share would not be the probability she asked for.</div>`
    },
    {
      type: 'try',
      title: 'Count the cancelled orders',
      body: `<p>There are <b>529</b> cancelled orders out of 10,000. The share is <b>0.0529</b>, or 5.29 percent.</p>
<p>The second line is the one you will use all week. <code>.eq("Cancelled")</code> builds a column of True and False. True counts as 1 and False counts as 0, so the <b>mean of that column is the share of Trues</b>. That share is P(Cancelled).</p>`,
      code: `cancelled = orders_pay["order_status"].eq("Cancelled")

print(int(cancelled.sum()))
print(round(float(cancelled.mean()), 4))
`
    },
    {
      type: 'explain',
      title: 'Read 0.0529 in a sentence',
      body: `<p>The number 0.0529 is not “low” and not “high” until you say what decision it feeds. It does say something exact: <b>about 1 order in 19 is cancelled</b>, because 1 ÷ 19 is close to 0.053. In a tray of 100 random orders you should expect around 5 cancellations, and you should not be surprised by 3 or by 8. You would be surprised by 40.</p>
<p>Completed orders are a different event: 7,412 of them, probability 0.7412. People sometimes glance at a list of statuses and treat each status as equally likely, the way the faces of a die are equally likely. TradeFlow’s statuses are not faces of a die. Completed is about fourteen times as common as cancelled. The data, not the number of labels, sets the probability.</p>
<div class="callout tip"><b>Say the population in the same breath as the probability.</b> “5.29 percent of orders are cancelled” is a different claim from “5.29 percent of customers have a cancelled order”. Same word, different barrel of tickets. This lesson stays with orders unless it says otherwise.</div>`
    },
    {
      id: 'st-2-1-c1',
      type: 'check',
      title: 'A colleague says cancelled and completed are equally likely, because an order has to be one status or another and there are two words on the slide. What is wrong?',
      body: `<p>Think about what “equally likely” requires.</p>`,
      options: [
        'Nothing. Two outcomes are always a half each',
        'The labels are not a fair die. Equal likelihood has to be earned, by symmetry we built or by a count. The count says completed is far more common',
        'Probabilities cannot be calculated for words like Cancelled',
        'Completed should be ignored because it is the normal case'
      ],
      answer: 1,
      why: [
        'Two labels give you two events, not two equal probabilities. A fair coin is equal because we made it so, or because we checked. A status field is neither until you count.',
        'Right. Completed is 7,412 orders and cancelled is 529. The slide having two words does not put the same number of tickets in each pile.',
        'You just calculated one. Any event you can mark with True or False on the rows has a probability.',
        'The normal case is the most important probability in the business, not one to drop. “Most orders complete” is a probability statement.'
      ]
    },
    {
      type: 'explain',
      title: 'The complement: the event that is left over',
      body: `<p>The <b>complement</b> of an event is everything else in the sample space. The complement of “cancelled” is “not cancelled”.</p>
<p>These two events split the tickets with nothing left over and nothing in both piles. So their probabilities add to 1:</p>
<p><b>P(not A) = 1 − P(A).</b></p>
<p>For cancellations, 1 − 0.0529 = <b>0.9471</b>. If the lead asks “what is the chance this random order is still alive, not cancelled?”, you do not need a new count. You already have it.</p>
<p>The complement is also a guard against a silly answer. If someone reports a probability of 1.3, or of −0.2, the arithmetic has left the barrel. A share of tickets cannot do that.</p>
<div class="callout analogy"><b>The light switch.</b> If the light is not on, it is off. You do not need a separate theory of “off”. One minus the other is the whole switch.</div>`
    },
    {
      type: 'try',
      title: 'The complement of cancelled',
      body: `<p>The first number is P(Cancelled), <b>0.0529</b>. The second is its complement, <b>0.9471</b>. The third is their sum, <b>1.0</b>. If that third number were anything else, the tickets would have been counted twice or missed.</p>`,
      code: `p = orders_pay["order_status"].eq("Cancelled").mean()

print(round(float(p), 4))
print(round(float(1 - p), 4))
print(round(float(p + (1 - p)), 4))
`
    },
    {
      id: 'st-2-1-ex1',
      type: 'exercise',
      title: 'Your turn: returned, and not returned',
      body: `<p>An order is <b>returned</b> or it is not. Print P(Returned), then P(not Returned), each with 4 decimal places.</p>
<p>You should see <code>0.0505</code> and then <code>0.9495</code>.</p>
<p><b>Think before you type:</b> <code>.eq("Returned").mean()</code> is the probability. The complement is 1 minus that number. <code>"{:.4f}".format(number)</code> forces 4 decimal places.</p>`,
      starter: `# orders_pay is already loaded, one row per order\n\n# Write your code below\n`,
      hints: [
        'P(Returned) is the mean of orders_pay["order_status"].eq("Returned"). Print it, then print 1 minus it, both with 4 decimals.',
        'p = orders_pay["order_status"].eq("Returned").mean()\nprint("{:.4f}".format(p))\nprint("{:.4f}".format(1 - p))\n'
      ],
      solution: `p = orders_pay["order_status"].eq("Returned").mean()
print("{:.4f}".format(p))
print("{:.4f}".format(1 - p))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Addition when the piles cannot overlap',
      body: `<p>The lead’s second question was the <b>problem order</b>: cancelled or returned. An order has one status, so it cannot be both. Events that cannot happen together are <b>mutually exclusive</b>.</p>
<p>When A and B are mutually exclusive, you add:</p>
<p><b>P(A or B) = P(A) + P(B).</b></p>
<p>Nothing is in both piles, so nothing is counted twice. 529 cancelled plus 505 returned is 1,034 problem orders, and 1,034 ÷ 10,000 = <b>0.1034</b>. About 1 order in 10 is a problem order. That is the number she asked for, and it is bigger than either piece alone, which is what “or” should do.</p>
<div class="callout watch"><b>Exclusive is a fact about the world, not a style of writing.</b> “Cancelled” and “returned” are exclusive because the status column holds one value. “Paid” and “Card” are not exclusive: a payment can be both. You may add the first pair. You may not add the second pair, and the next section shows the damage.</div>`
    },
    {
      type: 'try',
      title: 'Problem orders, by adding',
      body: `<p>The overlap is <b>0</b>. The two probabilities add to <b>0.1034</b>. The direct count, using <code>.isin</code>, gives the same 0.1034. Two roads, one number. When they disagree, the events were not exclusive and the addition was illegal.</p>`,
      code: `cancelled = orders_pay["order_status"].eq("Cancelled")
returned = orders_pay["order_status"].eq("Returned")

print(int((cancelled & returned).sum()))
print("{:.4f}".format(cancelled.mean() + returned.mean()))
print("{:.4f}".format(orders_pay["order_status"].isin(["Cancelled", "Returned"]).mean()))
`
    },
    {
      id: 'st-2-1-ex2',
      type: 'exercise',
      title: 'Your turn: failed or refunded',
      body: `<p>A payment has one status, so <b>Failed</b> and <b>Refunded</b> cannot both be true. Print P(Failed or Refunded) with 4 decimal places.</p>
<p>You should see <code>0.0935</code>.</p>
<p><b>Think before you type:</b> either add the two means, or take the mean of <code>.isin(["Failed", "Refunded"])</code>. They match because the overlap is empty.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'orders_pay["payment_status"].isin(["Failed", "Refunded"]).mean() is the share. Print it with 4 decimals.',
        'p = orders_pay["payment_status"].isin(["Failed", "Refunded"]).mean()\nprint("{:.4f}".format(p))\n'
      ],
      solution: `p = orders_pay["payment_status"].isin(["Failed", "Refunded"]).mean()
print("{:.4f}".format(p))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Addition when the piles overlap',
      body: `<p>Now a question people add up by habit: <i>what is the chance a payment is Paid, or is made by Card?</i></p>
<p>These events overlap. A card payment can be paid. If you add P(Paid) and P(Card), every paid card payment is counted in both piles.</p>
<p>The repair is to put the overlap back once:</p>
<p><b>P(A or B) = P(A) + P(B) − P(A and B).</b></p>
<p>This is the rule to memorise. The exclusive version is just this rule on a day when P(A and B) is zero.</p>
<p>On TradeFlow, P(Paid) is 0.8461 and P(Card) is 0.2523. Added raw, that is <b>1.0984</b>. A probability over 1 means you have counted tickets that are not in the barrel. The overlap, P(Paid and Card), is 0.2149. Take it off once: 0.8461 + 0.2523 − 0.2149 = <b>0.8835</b>. That is a legal probability. 8,835 of the 10,000 payments are paid, or card, or both.</p>
<div class="callout analogy"><b>Two guest lists.</b> You invite everyone in Finance and everyone on the card-project team. Adding the two headcounts double-counts the people who are in Finance and on the team. Subtract them once and the room count is right.</div>
<div class="callout work"><b>At work:</b> “or” questions show up as coverage. What share of orders were either discounted or fulfilled by a partner? What share of users hit page A or page B? Always ask whether a row can be in both groups before you add.</div>`
    },
    {
      type: 'try',
      title: 'Paid or Card, the wrong sum and the right one',
      body: `<p>The first print is the illegal sum, <b>1.0984</b>. The second is P(Paid and Card), <b>0.2149</b>. The third is the legal probability, <b>0.8835</b>. The last line repeats it by counting the rows directly, so you can see the formula is only a rearrangement of a count.</p>`,
      code: `paid = orders_pay["payment_status"].eq("Paid")
card = orders_pay["payment_method"].eq("Card")

print("{:.4f}".format(paid.mean() + card.mean()))
print("{:.4f}".format((paid & card).mean()))
print("{:.4f}".format(paid.mean() + card.mean() - (paid & card).mean()))
print("{:.4f}".format((paid | card).mean()))
`
    },
    {
      id: 'st-2-1-c2',
      type: 'check',
      title: 'Why is P(Paid) + P(Card) equal to 1.0984, which cannot be a probability?',
      body: `<p>Look at where a paid card payment would be counted.</p>`,
      options: [
        'Card payments are not real orders, so the sum is allowed to exceed 1',
        'Paid card payments sit in both events, so adding counts them twice. The repair is to subtract that overlap once',
        'Pandas means are only approximate, and the extra 0.0984 is rounding',
        'Probabilities are allowed to exceed 1 when the events are important'
      ],
      answer: 1,
      why: [
        'Card payments are 2,523 real rows. The problem is not whether they exist. It is that some of them are also Paid.',
        'Right. There are 2,149 payments that are both paid and card. They were in both piles. Subtract them once and the result falls back to 0.8835, which matches a direct count.',
        '0.8461 and 0.2523 are exact shares of 10,000. Their sum really is 1.0984. Rounding is not the culprit.',
        'A probability is a share of the sample space. A share cannot exceed 1. When the arithmetic does, the arithmetic is wrong, not the definition.'
      ]
    },
    {
      id: 'st-2-1-ex3',
      type: 'exercise',
      title: 'Your turn: Paid or Mobile Money',
      body: `<p>Print two numbers, each with 4 decimal places. First the <b>wrong</b> sum, P(Paid) + P(Mobile Money). Then the <b>right</b> probability, P(Paid or Mobile Money), using the addition rule or a direct count.</p>
<p>You should see <code>1.1008</code> and then <code>0.8879</code>.</p>
<p><b>Think before you type:</b> Mobile Money is a value of <code>payment_method</code>. The overlap is paid and Mobile Money. Subtract it, or use <code>|</code> between the two True/False columns and take the mean.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'Build paid and mm as True/False columns. Print the sum of the means, then print the mean of (paid | mm).',
        'paid = orders_pay["payment_status"].eq("Paid")\nmm = orders_pay["payment_method"].eq("Mobile Money")\nprint("{:.4f}".format(paid.mean() + mm.mean()))\nprint("{:.4f}".format((paid | mm).mean()))\n'
      ],
      solution: `paid = orders_pay["payment_status"].eq("Paid")
mm = orders_pay["payment_method"].eq("Mobile Money")
print("{:.4f}".format(paid.mean() + mm.mean()))
print("{:.4f}".format((paid | mm).mean()))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A probability we design, and a probability we measure',
      body: `<p>There are two ways a probability gets its number, and analysts mix them up.</p>
<ul>
<li><b>We design it.</b> A fair coin has P(heads) = 0.5 because that is what “fair” means. A fair die has P(6) = 1/6. We did not measure those. We declared them, and a simulation should wander near them.</li>
<li><b>We measure it.</b> P(Cancelled) = 0.0529 because we counted TradeFlow. Nobody designed cancellations to be 5.29 percent. If the business changes, the probability changes. You have to count again.</li>
</ul>
<p>The die below is the designed kind. Twelve thousand rolls, seed 1, so the result is repeatable. The share of sixes comes out at <b>0.1674</b>. The designed probability is 1/6 ≈ <b>0.1667</b>. Close, not identical. That gap is the noise from Module 1, sitting on top of a probability we already know. With more rolls the share would sit closer. It does not have to hit 0.1667 on a finite run, and a colleague who demands that it must has forgotten noise.</p>
<div class="callout tip"><b>Name which kind you are holding.</b> “There is a 10 percent chance the campaign works” is a designed judgement, or a measured rate, or a guess wearing a number. Those are three different objects. Ask which one is on the table before you use it.</div>`
    },
    {
      type: 'try',
      title: 'A fair die, and the noise around 1/6',
      body: `<p><code>rng.integers(1, 7, size=12000)</code> rolls a die that shows 1, 2, 3, 4, 5 or 6 with equal designed probability. The first print is the share of sixes in this run, <b>0.1674</b>. The second is the designed value, <b>0.1667</b>. The difference is small, and it is supposed to be there.</p>`,
      code: `import numpy as np

rng = np.random.default_rng(1)
rolls = rng.integers(1, 7, size=12000)

print("{:.4f}".format((rolls == 6).mean()))
print("{:.4f}".format(1 / 6))
`
    },
    {
      id: 'st-2-1-ex4',
      type: 'exercise',
      title: 'Your turn: two different Rwanda probabilities',
      body: `<p>The word “Rwanda” can point at two barrels. Print P(a random <b>customer</b> is in Rwanda), then P(a random <b>order</b> belongs to a customer in Rwanda). Four decimal places each.</p>
<p>You should see <code>0.2190</code> and then <code>0.2191</code>.</p>
<p><b>Think before you type:</b> customers live in <code>customers</code>. Orders do not carry a country, so attach <code>country</code> with a merge on <code>customer_id</code>, then take the mean of <code>.eq("Rwanda")</code>. The two shares are close here and are still not the same question.</p>`,
      starter: `# customers and orders_pay are already loaded\n\n# Write your code below\n`,
      hints: [
        'First mean: customers["country"].eq("Rwanda"). For orders, merge customers[["customer_id", "country"]] onto orders_pay, then take the same mean.',
        'p_customers = customers["country"].eq("Rwanda").mean()\norders_country = orders_pay.merge(customers[["customer_id", "country"]], on="customer_id")\np_orders = orders_country["country"].eq("Rwanda").mean()\nprint("{:.4f}".format(p_customers))\nprint("{:.4f}".format(p_orders))\n'
      ],
      solution: `p_customers = customers["country"].eq("Rwanda").mean()
orders_country = orders_pay.merge(customers[["customer_id", "country"]], on="customer_id")
p_orders = orders_country["country"].eq("Rwanda").mean()
print("{:.4f}".format(p_customers))
print("{:.4f}".format(p_orders))
`,
      ordered: true
    },
    {
      id: 'st-2-1-ex5',
      type: 'exercise',
      title: 'Your turn: ten thousand fair coins',
      body: `<p>Design a fair coin and flip it 10,000 times with seed <b>1</b>. A flip is heads when <code>rng.random(10000) < 0.5</code>. Print the share of heads with 4 decimal places.</p>
<p>You should see <code>0.4953</code>. The designed probability is 0.5. The gap is noise, not a broken coin.</p>
<p><b>Think before you type:</b> <code>rng = np.random.default_rng(1)</code> must come before the flips. The mean of the True/False result is the share.</p>`,
      starter: `import numpy as np\n\n# Write your code below\n`,
      hints: [
        'rng = np.random.default_rng(1), then heads = rng.random(10000) < 0.5, then print the mean with 4 decimals.',
        'import numpy as np\n\nrng = np.random.default_rng(1)\nheads = rng.random(10000) < 0.5\nprint("{:.4f}".format(heads.mean()))\n'
      ],
      solution: `import numpy as np

rng = np.random.default_rng(1)
heads = rng.random(10000) < 0.5
print("{:.4f}".format(heads.mean()))
`,
      ordered: true
    },
    {
      id: 'st-2-1-c3',
      type: 'check',
      title: 'The coin came out at 0.4953 heads, not 0.5000. The cancellation rate is 0.0529. Which description is right?',
      body: `<p>One of these numbers was declared. The other was counted.</p>`,
      options: [
        'Both are broken, because a real probability must land on a round number',
        '0.5 is the designed probability of the fair coin, and 0.4953 is one noisy run of it. 0.0529 is a measured share of TradeFlow’s orders, and it is exact for this table',
        '0.0529 was designed by TradeFlow, and the coin was measured from customers',
        '0.4953 replaces 0.5. The coin should be treated as biased from now on'
      ],
      answer: 1,
      why: [
        'Round numbers are not more real. 1/6 is an honest designed probability and it is not a terminating decimal. 0.0529 is an honest measured one.',
        'Right. The coin’s 0.5 is what “fair” means, and 10,000 flips are allowed to miss it slightly. The 0.0529 is 529 divided by 10,000. It describes this file, not a coin we invented.',
        'Swapped. Nobody set the cancellation rate to 0.0529 in advance. We found it. The 0.5 was set in advance, by calling the coin fair.',
        'A single miss of 0.0047 in 10,000 flips is ordinary noise. Declaring the coin biased from one run is the Module 1 mistake: calling noise a signal.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>You can now defend a probability without waving your hands.</p>
<ul>
<li>A <b>probability</b> is the long-run share of a sample space. When every row is equally likely, it is a count divided by a count</li>
<li>P(not A) = <b>1 − P(A)</b>, the complement</li>
<li>If A and B cannot happen together, <b>P(A or B) = P(A) + P(B)</b></li>
<li>If they can, <b>P(A or B) = P(A) + P(B) − P(A and B)</b>. A sum past 1 means the overlap was forgotten</li>
<li>A probability we <b>design</b> (a fair coin) and a probability we <b>measure</b> (a cancellation rate) are different objects. A finite run sits near a designed probability. It does not have to hit it</li>
<li>The barrel matters: 21.90 percent of <b>customers</b> are in Rwanda, and 21.91 percent of <b>orders</b> belong to them. Close, and not the same sentence</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What does it mean to say the probability that a TradeFlow order is cancelled is 0.0529?</li>
<li>When is it legal to add two probabilities, and what do you subtract when it is not?</li>
<li>A colleague adds “the chance the user is new” and “the chance the user paid” and gets 1.2. What do you tell them?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> If we pull orders at random, over and over, 5.29 percent of the pulls are cancelled. On this table that is exactly 529 out of 10,000. It is a measured share, not a feeling, and it describes orders, not customers.</p>
<p><b>2.</b> You may add when the two events cannot happen on the same row, because nothing is counted twice. When a row can be in both, add the two probabilities and subtract the overlap once. The exclusive case is the same rule with an overlap of zero.</p>
<p><b>3.</b> A probability cannot be 1.2. Some users are both new and paying, and those users were counted in both piles. Subtract that overlap and the result will fall back to a number between 0 and 1. I would also ask them to name the population: users, sessions, or orders.</p>
</details>
<p><b>Coming next, in lesson 2.2:</b> the word that changes the barrel. “Cancelled” has probability 0.0529. “Cancelled, given that the order has no delivery record” is a different question, with a different denominator. Conditional probability is how every segmented rate in a business is actually built, and it is where a true sentence and a false one can use the same words in a different order.</p>`
    }
  ]
},
{
  id: 'st-2-2',
  track: 'statistics',
  lang: 'python',
  packages: ['pandas', 'numpy', 'matplotlib'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: `import pandas as pd
import numpy as np

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
products = pd.read_csv("products.csv")
payments = pd.read_csv("payments.csv")
deliveries = pd.read_csv("deliveries.csv")
order_items = pd.read_csv("order_items.csv")

deliveries["transit_days"] = (pd.to_datetime(deliveries["delivery_date"]) - pd.to_datetime(deliveries["dispatch_date"])).dt.days

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
`,
  preloaded: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items', 'master', 'orders_pay', 'has_delivery'],
  title: '2.2 Conditional probability: given changes the question',
  tables: [],
  intro: `Two sentences land in the same email from operations. <i>“If an order has no delivery record, it was cancelled.”</i> And: <i>“If an order was cancelled, the customer never paid.”</i><br><br>One of those is almost a fact at TradeFlow. The other is false. They feel like the same idea because both talk about cancellations. They are not the same idea. The word <b>given</b> throws away part of the table, and which part you throw away is the whole question. <code>has_delivery</code> is one row per order, with the delivery columns empty when no delivery was recorded. <code>orders_pay</code> is still one row per order, with the payment attached.`,
  steps: [
    {
      type: 'explain',
      title: 'Given: throw away every row that does not qualify',
      body: `<p>P(Cancelled) asks: out of <b>all</b> orders, what share are cancelled? The denominator is 10,000.</p>
<p>P(Cancelled <b>given</b> no delivery record) asks a narrower question. First keep only the orders with no delivery. Then, inside that smaller pile, what share are cancelled? The denominator is no longer 10,000. It is the size of the pile you kept.</p>
<p>The notation is <b>P(A | B)</b>, read “probability of A given B”. The bar means “given”. B is the pile you kept. A is what you count inside it.</p>
<p><b>P(A | B) = (rows that are both A and B) ÷ (rows that are B).</b></p>
<p>In Pandas this is a filter, then a mean. You already know how to filter. The new part is noticing that a filtered mean is a conditional probability, and that swapping A and B builds a different filter.</p>
<div class="callout analogy"><b>The waiting room.</b> “What share of people in the building are wearing a coat?” uses everyone in the building as the denominator. “What share of people in the waiting room are wearing a coat?” uses only the waiting room. Walking into the waiting room did not change the coats. It changed who counts.</div>`
    },
    {
      type: 'try',
      title: 'The same 500 orders, two denominators',
      body: `<p>Five hundred orders have no delivery record, and all 500 of them are cancelled. There are 529 cancelled orders in total, so 29 cancelled orders do have a delivery record.</p>
<p>The first print is P(no delivery | Cancelled) = 500 ÷ 529 = <b>0.9452</b>. Among cancelled orders, 94.52 percent have no delivery row.</p>
<p>The second is P(Cancelled | no delivery) = 500 ÷ 500 = <b>1.0000</b>. Among orders with no delivery row, every one is cancelled.</p>
<p>Same 500 orders in the numerator. Different piles underneath. One answer is “almost always”. The other is “always”.</p>`,
      code: `cancelled = has_delivery["order_status"].eq("Cancelled")
no_delivery = has_delivery["delivery_id"].isna()

print("{:.4f}".format(no_delivery[cancelled].mean()))
print("{:.4f}".format(cancelled[no_delivery].mean()))
print(int((no_delivery & cancelled).sum()), int(cancelled.sum()), int(no_delivery.sum()))
`
    },
    {
      type: 'explain',
      title: 'Why the order of the words matters',
      body: `<p>Read the two results as sentences a manager can use.</p>
<ul>
<li><b>Given that an order was cancelled</b>, the chance it has no delivery record is 0.9452. High. The data dictionary warned you: the 500 missing deliveries are cancelled orders. A cancelled order usually never got as far as a delivery row.</li>
<li><b>Given that there is no delivery record</b>, the chance the order was cancelled is 1. You do not need to investigate further statuses. The missing row is a cancelled order, every time, in this table.</li>
</ul>
<p>Now the second sentence from the email, the one that feels related and is not. People expect a cancelled order to be unpaid. Test it instead of nodding. P(Paid) overall is 0.8461. P(Paid | Cancelled) is 460 ÷ 529 = <b>0.8696</b>. Among cancelled orders, about 87 percent are still marked Paid. That is slightly <i>higher</i> than the base rate, not lower. The hunch is backwards on this table.</p>
<p>This is the data-quality fact from the dictionary, said as a probability: 460 cancelled orders carry a payment marked Paid. Conditional probability did not cause that. It made it impossible to miss.</p>
<div class="callout watch"><b>Swapping the condition is a different question.</b> P(A | B) and P(B | A) share a numerator and not a denominator. They are equal only by coincidence. “Most cancelled orders lack a delivery” does not, by itself, tell you “most missing deliveries are cancelled”, even though in this particular table the second one happens to be true too. You still have to divide by the right pile.</div>`
    },
    {
      id: 'st-2-2-ex1',
      type: 'exercise',
      title: 'Your turn: the two delivery questions',
      body: `<p>Using <code>has_delivery</code>, print P(no delivery | Cancelled), then P(Cancelled | no delivery). Four decimal places.</p>
<p>You should see <code>0.9452</code> and then <code>1.0000</code>.</p>
<p><b>Think before you type:</b> build the two True/False columns. <code>no_delivery[cancelled].mean()</code> keeps the cancelled rows and asks what share have no delivery. Swap the brackets to swap the question.</p>`,
      starter: `# has_delivery is already loaded\n\n# Write your code below\n`,
      hints: [
        'cancelled = has_delivery["order_status"].eq("Cancelled"), and no_delivery = has_delivery["delivery_id"].isna(). Print the mean of no_delivery inside cancelled, then the mean of cancelled inside no_delivery.',
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
      id: 'st-2-2-c1',
      type: 'check',
      title: 'You want P(no delivery | Cancelled). What is the denominator?',
      body: `<p>The condition is the pile you keep.</p>`,
      options: [
        'All 10,000 orders',
        'The 529 cancelled orders',
        'The 500 orders with no delivery record',
        'The 29 cancelled orders that do have a delivery'
      ],
      answer: 1,
      why: [
        'That is the denominator of P(no delivery), with no condition. The bar in the notation throws most of those rows away.',
        'Right. “Given cancelled” means the only orders still in the room are the 529 cancelled ones. 500 of them have no delivery, and 500 ÷ 529 is 0.9452.',
        'That pile is the denominator of the swapped question, P(Cancelled | no delivery), which equals 1.',
        'Those 29 are the cancelled orders that fail the “no delivery” description. They sit in the denominator and not in the numerator. They are not the denominator by themselves.'
      ]
    },
    {
      id: 'st-2-2-ex2',
      type: 'exercise',
      title: 'Your turn: did cancelled orders go unpaid?',
      body: `<p>Print P(Paid | Cancelled), then P(Paid) with no condition. Four decimal places. Use <code>orders_pay</code>.</p>
<p>You should see <code>0.8696</code> and then <code>0.8461</code>. Read them before you move on. Cancelling did not make payment less likely.</p>
<p><b>Think before you type:</b> <code>paid[cancelled].mean()</code> is the conditional. <code>paid.mean()</code> is the base rate.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'paid = orders_pay["payment_status"].eq("Paid"), cancelled = orders_pay["order_status"].eq("Cancelled"). Print the mean of paid inside cancelled, then the mean of paid.',
        'paid = orders_pay["payment_status"].eq("Paid")\ncancelled = orders_pay["order_status"].eq("Cancelled")\nprint("{:.4f}".format(paid[cancelled].mean()))\nprint("{:.4f}".format(paid.mean()))\n'
      ],
      solution: `paid = orders_pay["payment_status"].eq("Paid")
cancelled = orders_pay["order_status"].eq("Cancelled")
print("{:.4f}".format(paid[cancelled].mean()))
print("{:.4f}".format(paid.mean()))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Independence: the condition changes nothing',
      body: `<p>Sometimes the waiting room looks like the rest of the building. Then the condition was not news.</p>
<p>A and B are <b>independent</b> when <b>P(A | B) = P(A)</b>. Knowing B happened does not move the probability of A. There is a second way to say the same thing, often easier to check:</p>
<p><b>P(A and B) = P(A) × P(B).</b></p>
<p>If the joint share equals the product of the shares, the events are independent. If it does not, they carry information about each other.</p>
<p>Card and Paid are almost independent here. P(Card | Paid) is 2,149 ÷ 8,461 = <b>0.2540</b>. P(Card) is <b>0.2523</b>. The joint share is <b>0.2149</b>. The product P(Card) × P(Paid) is <b>0.2135</b>. A gap of 0.0014 on a probability is nothing you would change a policy over. Payment method and “was it paid?” are, on this table, nearly separate facts.</p>
<div class="callout tip"><b>Independence is a result, not a hope.</b> It is tempting to multiply because the formula is short. Multiply only after you have checked, or because a real process makes the events separate (two different coins, two different customers). “It would be convenient if they were independent” is not a check.</div>`
    },
    {
      type: 'try',
      title: 'Card and Paid, a check rather than a guess',
      body: `<p>Four numbers. P(Card | Paid) is <b>0.2540</b>. P(Card) is <b>0.2523</b>. Those two being close is the conditional test of independence. The joint is <b>0.2149</b> and the product is <b>0.2135</b>. Those two being close is the multiplication test. Same conclusion either way.</p>`,
      code: `paid = orders_pay["payment_status"].eq("Paid")
card = orders_pay["payment_method"].eq("Card")

print("{:.4f}".format(card[paid].mean()))
print("{:.4f}".format(card.mean()))
print("{:.4f}".format((card & paid).mean()))
print("{:.4f}".format(card.mean() * paid.mean()))
`
    },
    {
      id: 'st-2-2-ex3',
      type: 'exercise',
      title: 'Your turn: the product test for Card and Paid',
      body: `<p>Print the joint probability P(Card and Paid), then the product P(Card) × P(Paid). Four decimal places.</p>
<p>You should see <code>0.2149</code> and then <code>0.2135</code>.</p>
<p><b>Think before you type:</b> the joint is the mean of <code>card & paid</code>. The product is the two means multiplied. You are comparing a count with a forecast that assumes independence.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'Build the two True/False columns. Print (card & paid).mean(), then card.mean() * paid.mean().',
        'paid = orders_pay["payment_status"].eq("Paid")\ncard = orders_pay["payment_method"].eq("Card")\nprint("{:.4f}".format((card & paid).mean()))\nprint("{:.4f}".format(card.mean() * paid.mean()))\n'
      ],
      solution: `paid = orders_pay["payment_status"].eq("Paid")
card = orders_pay["payment_method"].eq("Card")
print("{:.4f}".format((card & paid).mean()))
print("{:.4f}".format(card.mean() * paid.mean()))
`,
      ordered: true
    },
    {
      type: 'try',
      title: 'Cancelled rules returned out',
      body: `<p>The first number is P(Returned | Cancelled): <b>0.0000</b>. The second is P(Returned) with no condition: <b>0.0505</b>. They are not equal. Knowing the order was cancelled does not leave the probability of “returned” where it was. It drives it to zero, because one order cannot be both. That is dependence, and the next section names it.</p>`,
      code: `cancelled = orders_pay["order_status"].eq("Cancelled")
returned = orders_pay["order_status"].eq("Returned")

print("{:.4f}".format(returned[cancelled].mean()))
print("{:.4f}".format(returned.mean()))
`
    },
    {
      type: 'explain',
      title: 'Mutually exclusive is not independence',
      body: `<p>This confusion is old, and it still shows up in interviews.</p>
<p><b>Mutually exclusive</b> means the overlap is empty. If A happened, B did not. So P(B | A) = 0.</p>
<p><b>Independent</b> means knowing A does not move B. So P(B | A) = P(B).</p>
<p>Those are opposite situations whenever both events can actually happen. If P(B) is not zero, then P(B | A) cannot be both 0 and P(B). Exclusive events that are possible are <b>dependent</b>. They are dependent in the strongest practical way: one of them rules the other out.</p>
<p>Cancelled and returned are exclusive. P(Returned | Cancelled) = 0, while P(Returned) = 0.0505. Knowing the order was cancelled tells you, with certainty, that it was not returned. That is information. Information is dependence.</p>
<p>The multiplication rule is the one to keep beside this:</p>
<p><b>P(A and B) = P(A) × P(B | A).</b></p>
<p>It is always true. It is a rearrangement of the definition of conditional probability. Independence is the special case where you may replace P(B | A) with P(B).</p>
<p>Watch it rebuild a count you already trust. P(Cancelled) × P(no delivery | Cancelled) = 0.0529 × 0.9452 = <b>0.0500</b>. And 500 ÷ 10,000 = 0.0500. The rule reproduced the joint. It did not need independence to do it.</p>
<div class="callout watch"><b>Do not multiply exclusive events.</b> P(Cancelled) × P(Returned) is about 0.0027. The true joint is 0, because an order cannot be both. The product is the independence forecast, and these two events are nothing like independent.</div>`
    },
    {
      id: 'st-2-2-c2',
      type: 'check',
      title: 'Cancelled and returned cannot happen on the same order. Which statement is right?',
      body: `<p>Use the two definitions, not the sound of the words.</p>`,
      options: [
        'They are independent, because they are different statuses',
        'They are mutually exclusive, and therefore dependent: knowing one happened forces the probability of the other to 0',
        'They are both independent and mutually exclusive',
        'They are neither, because both probabilities are near 0.05'
      ],
      answer: 1,
      why: [
        'Different names do not create independence. Independence is P(Returned | Cancelled) equalling P(Returned). Here the conditional probability is 0 and the base rate is 0.0505.',
        'Right. The overlap is empty, so they are mutually exclusive. And because one rules the other out, the condition changes the probability. That is dependence.',
        'Impossible for events that can each occur. Exclusive pushes the conditional probability to 0. Independence demands it stay at the base rate. Zero is not 0.0505.',
        'The size of the two probabilities does not decide this. A rare event and another rare event can be exclusive, independent, or neither. The overlap decides exclusive. The conditional probability decides independent.'
      ]
    },
    {
      id: 'st-2-2-ex4',
      type: 'exercise',
      title: 'Your turn: rebuild the joint from the multiplication rule',
      body: `<p>Print P(Cancelled) × P(no delivery | Cancelled), then print P(Cancelled and no delivery) from the rows. Four decimal places, using <code>has_delivery</code>.</p>
<p>You should see <code>0.0500</code> twice. The rule is not a new fact. It is the definition, rearranged.</p>
<p><b>Think before you type:</b> the conditional is <code>no_delivery[cancelled].mean()</code>. Multiply by <code>cancelled.mean()</code>. The joint is <code>(cancelled & no_delivery).mean()</code>.</p>`,
      starter: `# has_delivery is already loaded\n\n# Write your code below\n`,
      hints: [
        'Make the two True/False columns from order_status and delivery_id. Print the product of cancelled.mean() and no_delivery[cancelled].mean(), then the mean of the & of the two columns.',
        'cancelled = has_delivery["order_status"].eq("Cancelled")\nno_delivery = has_delivery["delivery_id"].isna()\nprint("{:.4f}".format(cancelled.mean() * no_delivery[cancelled].mean()))\nprint("{:.4f}".format((cancelled & no_delivery).mean()))\n'
      ],
      solution: `cancelled = has_delivery["order_status"].eq("Cancelled")
no_delivery = has_delivery["delivery_id"].isna()
print("{:.4f}".format(cancelled.mean() * no_delivery[cancelled].mean()))
print("{:.4f}".format((cancelled & no_delivery).mean()))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A small difference is still a real difference, and it may not be the one in the story',
      body: `<p>Not every dependence is a missing delivery row that settles the question. Most business slices move the probability a little. Your job is to measure the move and not invent a larger one.</p>
<p>Failure of the payment is the rare unpleasant status: P(Failed) = <b>0.0423</b>, 423 payments. Split by method:</p>
<table class="mini">
<tr><th>Method</th><th>Failed payments</th><th>P(Failed | method)</th></tr>
<tr><td>Bank Transfer</td><td>124 of 2,471</td><td><b>0.0502</b></td></tr>
<tr><td>Mobile Money</td><td>112 of 2,547</td><td>0.0440</td></tr>
<tr><td>Cash on Delivery</td><td>98 of 2,459</td><td><b>0.0399</b></td></tr>
<tr><td>Card</td><td>89 of 2,523</td><td>0.0353</td></tr>
</table>
<p>Cash on delivery is the method people point at. In this table it fails <b>less</b> often than average, not more. Bank transfer is the high one, and even that lift is modest: 0.0502 against 0.0423. About one extra failure in a hundred payments. Worth knowing. Not worth a slogan.</p>
<p>The habit is: write P(A | B) and P(A) side by side, in numbers, before the meeting. If they match, say “no news”. If they differ, say by how much, and name the denominator so nobody swaps the sentence.</p>
<div class="callout work"><b>At work:</b> every “rate by segment” slide is a stack of conditional probabilities. Conversion given channel. Churn given plan. Default given region. The base rate belongs on the same slide, or the segment looks dramatic when it is ordinary.</div>`
    },
    {
      id: 'st-2-2-ex5',
      type: 'exercise',
      title: 'Your turn: the bank-transfer failure rate',
      body: `<p>Print P(Failed | Bank Transfer), then P(Failed). Four decimal places.</p>
<p>You should see <code>0.0502</code> and then <code>0.0423</code>.</p>
<p><b>Think before you type:</b> the condition is <code>payment_method</code> equal to <code>"Bank Transfer"</code>. The event is <code>payment_status</code> equal to <code>"Failed"</code>. Filter, then take the mean. The second print has no filter.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'failed[bank].mean() is the conditional, with bank marking Bank Transfer. failed.mean() is the base rate.',
        'failed = orders_pay["payment_status"].eq("Failed")\nbank = orders_pay["payment_method"].eq("Bank Transfer")\nprint("{:.4f}".format(failed[bank].mean()))\nprint("{:.4f}".format(failed.mean()))\n'
      ],
      solution: `failed = orders_pay["payment_status"].eq("Failed")
bank = orders_pay["payment_method"].eq("Bank Transfer")
print("{:.4f}".format(failed[bank].mean()))
print("{:.4f}".format(failed.mean()))
`,
      ordered: true
    },
    {
      id: 'st-2-2-c3',
      type: 'check',
      title: 'Someone on the commercial team says cash on delivery is the risky payment method, because the customer pays later. What does the table say?',
      body: `<p>Risk here means P(Failed | method), set next to P(Failed).</p>`,
      options: [
        'They are right: cash on delivery fails more often than every other method',
        'Cash on delivery fails less often than the overall 0.0423. Bank transfer is the method above the base rate. The story named the wrong method',
        'The table cannot say, because conditional probability needs a designed experiment',
        'All four methods have the same failure probability, so the story does not matter'
      ],
      answer: 1,
      why: [
        'The count goes the other way. Cash on delivery fails on 98 of 2,459 payments, a rate of 0.0399, which is below the overall 0.0423. Card is lower still. Bank transfer is the one above the base rate.',
        'Right. 0.0399 against a base rate of 0.0423 is a small difference in the safe direction. The method the slogan worries about is not the method the failures concentrate in. Bank transfer, at 0.0502, is.',
        'A conditional probability here is a share of rows. You do not need an experiment to compute it. You need an experiment, or more care, before you claim the method caused the failures. The rate itself is just a count.',
        'They are not the same. Card is 0.0353 and bank transfer is 0.0502. The gaps are small, and small is not identical. Report the gap rather than flattening it.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>You can change the denominator on purpose, and you can tell when someone has changed it by accident.</p>
<ul>
<li><b>P(A | B)</b> is the share of B-rows that are also A. The condition picks the denominator</li>
<li>P(A | B) and P(B | A) are different questions. The delivery table makes this concrete: 0.9452 one way, 1.0000 the other</li>
<li>A cancelled order is still usually paid: P(Paid | Cancelled) is 0.8696 against a base rate of 0.8461</li>
<li><b>Independent</b> means the condition changes nothing: P(A | B) = P(A), or equivalently P(A and B) = P(A) × P(B). Card and Paid nearly pass that test</li>
<li><b>Mutually exclusive</b> is not independence. If both events are possible, exclusive events are dependent, because one of them forces the other to probability 0</li>
<li>The multiplication rule P(A and B) = P(A) × P(B | A) is always legal. Replacing P(B | A) by P(B) is legal only after an independence check</li>
<li>Small gaps are still gaps. Bank transfer fails at 0.0502 against 0.0423. Cash on delivery, the method in the story, fails at 0.0399</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>In plain words, what is a conditional probability, and why is P(A | B) not the same number as P(B | A)?</li>
<li>What is the difference between “mutually exclusive” and “independent”?</li>
<li>You are shown a slide that says the failure rate for one channel is 8 percent. What else do you ask for before you react?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> P(A | B) is the share of cases where B is true that also have A true. The denominator is the B pile, not the whole population. Swapping A and B swaps which pile you divide by, so the numbers differ unless the piles happen to be the same size. I would give the delivery example: among cancelled orders, 94.52 percent have no delivery row, but among orders with no delivery row, 100 percent are cancelled.</p>
<p><b>2.</b> Mutually exclusive means the two events cannot happen together, so the overlap is empty and each forces the other’s conditional probability to 0. Independent means knowing one happened does not change the probability of the other, so the joint probability equals the product of the two probabilities. If both events can occur, they cannot be both exclusive and independent. Exclusive events are dependent.</p>
<p><b>3.</b> I ask for the base rate, the denominator, and the counts. Eight percent might be 4 failures out of 50, which is a noisy slice, or 800 out of 10,000. I ask whether 8 percent is higher or lower than the rate for everyone else, because a segment rate without the base rate has no news in it. I also ask whether the channel was chosen by the customer in a way that mixes up cause and effect. The conditional probability is the rate. It is not yet a reason.</p>
</details>
<p><b>Coming next, in lesson 2.3:</b> the situation where you are not handed the rows. A vendor tells you P(alert | failure) and calls it “90 percent accuracy”, and what you needed was P(failure | alert). Bayes’ rule is the multiplication rule turned around so you can recover the probability you were actually asked for. The base rate decides whether that 90 percent is good news.</p>`
    }
  ]
}
);
