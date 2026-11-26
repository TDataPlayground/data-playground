LESSONS.push(
{
  id: 'st-2-3',
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
  title: '2.3 Bayes and the base rate: most alerts are not the rare event',
  tables: [],
  intro: `A vendor writes to the CFO. <i>“Our screen catches 90 percent of failed payments, and it only flags 5 percent of healthy ones. Accuracy you can take to the board.”</i> The CFO forwards it to you with one line: <i>“Do we buy this?”</i><br><br>You cannot answer from the 90. The 90 is P(flag | failed). The decision needs P(failed | flag): of the payments that would light up on the screen, what share are actually failed? Those are the two sentences from lesson 2.2, and this time nobody is going to hand you the filtered rows. You get the pieces. Bayes’ rule is how you put the pieces back into the probability you were asked for. The base rate does most of the talking.`,
  steps: [
    {
      type: 'explain',
      title: 'Count the tickets before you admire the percentage',
      body: `<p>TradeFlow has 10,000 payments. <b>423</b> failed. The other <b>9,577</b> did not. Failure is uncommon. That single fact is the <b>base rate</b>, P(Failed) = 0.0423, and it will dominate the vendor’s pitch.</p>
<p>Take the pitch literally, as a long-run share, and apply it to these piles. You do not need a formula yet.</p>
<ul>
<li>The screen catches 9 out of 10 failed payments. Out of 423, that is 423 × 0.9 = <b>380.7</b> true alarms. The “.7” is fine: this is an expected count, the long-run average, not a claim that a payment can be seven tenths of a row.</li>
<li>The screen also flags 1 out of 20 healthy payments. Out of 9,577, that is 9,577 × 0.05 = <b>478.85</b> false alarms.</li>
</ul>
<p>Alarms in total: about <b>859.6</b>. True failures among them: 380.7. So only about <b>44 percent</b> of the alarms are real failures. More than half the alerts a reviewer would open are healthy payments.</p>
<p>Nothing about the screen is “broken”. It does what the vendor said. The 90 percent answered a different question from the one the CFO asked. The vendor quoted the hit rate <b>among failures</b>. The inbox fills with the hit rate <b>among alarms</b>.</p>
<div class="callout analogy"><b>Searching a quiet street.</b> Suppose almost nobody on a street is carrying a stolen wallet, and your detector beeps on most of the people who are, and also on a small share of everyone else. Most of the beeps will be ordinary people, because ordinary people are nearly the whole street. A sensitive detector does not repeal a rare event.</div>`
    },
    {
      type: 'try',
      title: 'The 44 percent, from the real column',
      body: `<p>Count the piles, then apply the vendor’s rates. The first line is the raw split, <b>423</b> failed and <b>9,577</b> healthy. The next two lines are the expected alarms: <b>380.70</b> true ones, <b>478.85</b> false ones. The last line is the inbox rate, <b>0.4429</b>. The false alarms outnumber the true ones. That is the whole pitch, undone by a count.</p>`,
      code: `failed = orders_pay["payment_status"].eq("Failed")
n_failed = failed.sum()
n_healthy = (~failed).sum()
caught = n_failed * 0.9
false_alarms = n_healthy * 0.05

print(int(n_failed), int(n_healthy))
print("{:.2f}".format(caught))
print("{:.2f}".format(false_alarms))
print("{:.4f}".format(caught / (caught + false_alarms)))
`
    },
    {
      type: 'explain',
      title: 'The same count, written as a rule',
      body: `<p>You already did Bayes’ rule. Here it is in letters, so you can use it when the problem arrives as rates rather than as a table.</p>
<p><b>P(A | B) = P(B | A) × P(A) ÷ P(B).</b></p>
<p>In the vendor’s problem, A is “failed” and B is “flagged”.</p>
<ul>
<li>P(B | A) = P(flag | failed) = 0.9. This is what they advertised. Its name in testing is the <b>true positive rate</b>, or sensitivity.</li>
<li>P(A) = P(Failed) = 0.0423. The base rate. Leave it out and the answer is fiction.</li>
<li>P(B) = P(flag) has to add up every way a flag can happen: flags among failures, plus flags among healthy payments. <b>P(flag) = 0.9 × P(Failed) + 0.05 × P(not failed).</b> The 0.05 is the <b>false positive rate</b>.</li>
</ul>
<p>Divide, and you get 0.4429. The formula did not add information. It stopped you using 0.9 as if it were the answer.</p>
<p>One check that the algebra is honest: use it on a case where you already know the rows. From lesson 2.2, P(no delivery | Cancelled) = 0.9452, P(Cancelled) = 0.0529, P(no delivery) = 0.0500. Multiply the first two and divide by the third. You get <b>1.0000</b>, which is exactly P(Cancelled | no delivery), the number you counted directly as 500 ÷ 500. When the formula disagrees with a count you can do by hand, trust the count and look for the arithmetic error.</p>
<div class="callout tip"><b>Natural frequencies first.</b> “Out of 10,000 payments, 423 failed, about 381 of those are flagged, and about 479 healthy payments are flagged too.” Anyone in the room can see that 381 is smaller than 479. Lead with that picture. Put the formula underneath as the compressed version, for the day the counts arrive as percentages.</div>`
    },
    {
      id: 'st-2-3-ex1',
      type: 'exercise',
      title: 'Your turn: the share of alarms that are real',
      body: `<p>Using the real failure base rate in <code>orders_pay</code>, and the vendor’s rates of 0.9 and 0.05, print P(Failed | flag) with 4 decimal places.</p>
<p>You should see <code>0.4429</code>.</p>
<p><b>Think before you type:</b> <code>p_flag = 0.9 * p_failed + 0.05 * (1 - p_failed)</code>. The answer is <code>0.9 * p_failed / p_flag</code>. Count <code>p_failed</code> from the column. Do not type 0.0423.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'p_failed = orders_pay["payment_status"].eq("Failed").mean(). Build p_flag from both routes into a flag, then divide 0.9 * p_failed by p_flag.',
        'p_failed = orders_pay["payment_status"].eq("Failed").mean()\np_flag = 0.9 * p_failed + 0.05 * (1 - p_failed)\nprint("{:.4f}".format(0.9 * p_failed / p_flag))\n'
      ],
      solution: `p_failed = orders_pay["payment_status"].eq("Failed").mean()
p_flag = 0.9 * p_failed + 0.05 * (1 - p_failed)
print("{:.4f}".format(0.9 * p_failed / p_flag))
`,
      ordered: true
    },
    {
      id: 'st-2-3-c1',
      type: 'check',
      title: 'The vendor’s “90 percent” is which probability?',
      body: `<p>Look at which event is the condition.</p>`,
      options: [
        'P(Failed | flag): the share of alarms that are real failures',
        'P(flag | Failed): the share of real failures that the screen catches',
        'P(Failed): the base rate',
        'The share of all payments that are flagged'
      ],
      answer: 1,
      why: [
        'That is the number the CFO needs, and it is 0.4429, not 0.90. The pitch never stated it.',
        'Right. “Catches 90 percent of failed payments” keeps only the failed payments, then asks what share of them are flagged. The condition is “failed”. The inbox question conditions on “flagged” instead.',
        'The base rate is 0.0423. The 90 percent would be a disaster as a base rate, and it is not one.',
        'That is P(flag), which comes out near 0.086 once you add true alarms and false alarms. The vendor did not quote that either.'
      ]
    },
    {
      id: 'st-2-3-ex2',
      type: 'exercise',
      title: 'Your turn: recover the delivery answer with the rule',
      body: `<p>You already know, from a direct count, that P(Cancelled | no delivery) is 1. Recover it with Bayes’ rule from <code>has_delivery</code>, and print it with 4 decimal places.</p>
<p>You should see <code>1.0000</code>. If you see anything else, the pieces went in backwards.</p>
<p><b>Think before you type:</b> A is cancelled, B is no delivery. You need P(no delivery | Cancelled), P(Cancelled) and P(no delivery). Multiply the first two and divide by the third.</p>`,
      starter: `# has_delivery is already loaded\n\n# Write your code below\n`,
      hints: [
        'cancelled marks the status. no_delivery marks a missing delivery_id. P(B|A) is no_delivery[cancelled].mean(). Multiply by cancelled.mean() and divide by no_delivery.mean().',
        'cancelled = has_delivery["order_status"].eq("Cancelled")\nno_delivery = has_delivery["delivery_id"].isna()\np = no_delivery[cancelled].mean() * cancelled.mean() / no_delivery.mean()\nprint("{:.4f}".format(p))\n'
      ],
      solution: `cancelled = has_delivery["order_status"].eq("Cancelled")
no_delivery = has_delivery["delivery_id"].isna()
p = no_delivery[cancelled].mean() * cancelled.mean() / no_delivery.mean()
print("{:.4f}".format(p))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Change the base rate, and the same screen changes its mind',
      body: `<p>Keep every property of the screen fixed. It still catches 90 percent of failures. It still flags 5 percent of healthy payments. Change only how common failure is.</p>
<p>Suppose half of all payments failed. Then:</p>
<p>P(Failed | flag) = (0.9 × 0.5) ÷ (0.9 × 0.5 + 0.05 × 0.5) = <b>0.9474</b>.</p>
<p>Same screen. About 95 percent of alarms would now be real. The machine did not get smarter between this paragraph and the last one. The street got more crowded with the thing it is looking for, so a beep became news.</p>
<p>That is the <b>base-rate</b> lesson, and it is the part people skip because the 90 is a louder number. On TradeFlow’s real base rate of 4.23 percent, most alarms are false. On a 50 percent base rate, almost none are. Quoting the screen without the base rate is quoting a property of the tool as if it were a property of the inbox.</p>
<div class="callout work"><b>At work this is the whole conversation about rare events.</b> Fraud, serious disease, a customer who will default, a truly abusive review, a broken part on a quiet production line. The event is rare, so a test can be “right” about the rare cases and still fill the queue with false alarms. Ask for three numbers before anyone says “90 percent”: the base rate, the true positive rate, and the false positive rate. From those three, the inbox rate is arithmetic.</div>`
    },
    {
      id: 'st-2-3-ex3',
      type: 'exercise',
      title: 'Your turn: the same screen if failure were common',
      body: `<p>Keep the rates 0.9 and 0.05, but set the base rate to a half. Print P(Failed | flag) with 4 decimal places.</p>
<p>You should see <code>0.9474</code>.</p>
<p><b>Think before you type:</b> the expression is <code>(0.9 * 0.5) / (0.9 * 0.5 + 0.05 * 0.5)</code>. No column is required. You are changing the world, not the screen.</p>`,
      starter: `# Write your code below\n`,
      hints: [
        'Numerator 0.9 * 0.5. Denominator adds the false-alarm route, 0.05 * 0.5.',
        'p = (0.9 * 0.5) / (0.9 * 0.5 + 0.05 * 0.5)\nprint("{:.4f}".format(p))\n'
      ],
      solution: `p = (0.9 * 0.5) / (0.9 * 0.5 + 0.05 * 0.5)
print("{:.4f}".format(p))
`,
      ordered: true
    },
    {
      id: 'st-2-3-c2',
      type: 'check',
      title: 'Why does the same 90 percent screen look excellent when half of payments fail, and mediocre on TradeFlow?',
      body: `<p>The screen’s two rates did not change.</p>`,
      options: [
        'Because Bayes’ rule only works on rare events',
        'Because the base rate changed. Alarms are mostly true when the event is common, and mostly false when the event is rare, even if the screen is unchanged',
        'Because a 50 percent base rate makes the false positive rate fall from 0.05 to 0',
        'Because TradeFlow’s payments are too messy for a percentage'
      ],
      answer: 1,
      why: [
        'You just used it on both worlds, and it reproduced the delivery count exactly. The rule does not care whether the event is rare. The result does.',
        'Right. Rarity means the healthy pile is huge, so 5 percent of a huge pile is more tickets than 90 percent of a tiny pile. Make the piles equal and 90 percent of one of them wins. The screen was constant. The street changed.',
        'The false positive rate stayed at 0.05 in the arithmetic. What fell was the number of false alarms relative to true ones, because there were fewer healthy payments to raise them from.',
        'The 0.4429 came from a clean base rate of 423 in 10,000 and two stated rates. Messiness is not required to get a disappointing inbox.'
      ]
    },
    {
      type: 'explain',
      title: 'The accuracy trap',
      body: `<p>There is a worse number than the vendor’s 90, and dashboards love it. <b>Accuracy</b>: the share of all rows the rule labels correctly.</p>
<p>Consider the laziest possible screen. It flags nobody. Every payment is called healthy.</p>
<ul>
<li>It is wrong on all 423 failures.</li>
<li>It is right on all 9,577 healthy payments.</li>
</ul>
<p>Accuracy is 9,577 ÷ 10,000 = <b>0.9577</b>. A rule that catches nothing scores 95.77 percent, because the rare event was small enough to ignore and still look clever.</p>
<p>Any pitch that leads with accuracy, on a rare event, is using this trick whether or not the author noticed. Ask instead for the two rates that accuracy glues together and hides: of the failures, how many did we catch, and of the healthy rows, how many did we disturb. Then ask the inbox question, which is Bayes.</p>
<div class="callout watch"><b>A high accuracy can be a refusal to look.</b> If 99 percent of parts are fine, calling every part fine is 99 percent accurate and operationally useless. Accuracy is the wrong headline whenever one class dwarfs the other.</div>`
    },
    {
      id: 'st-2-3-ex4',
      type: 'exercise',
      title: 'Your turn: the accuracy of doing nothing',
      body: `<p>Print the accuracy of a screen that never flags, on <code>orders_pay</code>. That is the share of payments that are not Failed. Four decimal places.</p>
<p>You should see <code>0.9577</code>.</p>
<p><b>Think before you type:</b> the mean of <code>payment_status</code> not equal to <code>"Failed"</code>. One line.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'The opposite of Failed is ~orders_pay["payment_status"].eq("Failed"), or .ne("Failed"). Take the mean and format it to 4 decimals.',
        'p = orders_pay["payment_status"].ne("Failed").mean()\nprint("{:.4f}".format(p))\n'
      ],
      solution: `p = orders_pay["payment_status"].ne("Failed").mean()
print("{:.4f}".format(p))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you ask for before anyone buys the screen',
      body: `<p>Four questions, in this order. They are enough.</p>
<ol>
<li><b>What is the base rate</b> of the event in our data, not in the vendor’s demo set? Their demo is often built so the event is common, which is the 0.9474 world, not yours.</li>
<li><b>Of the real events, what share do you catch?</b> That is P(flag | event). Ask over what period, and on whose labels.</li>
<li><b>Of the quiet rows, what share do you flag?</b> That is the false positive rate. This is the number pitches bury.</li>
<li><b>Of the flags, what share are real?</b> Make them compute it on your base rate, or compute it yourself. This is the only number that describes the queue your team will actually work.</li>
</ol>
<p>Then ask what a false alarm costs and what a miss costs. A fraud queue can afford a different false-alarm rate than a decision to freeze a customer’s account. Bayes gives you the mix of alarms. It does not decide the cost. You still have to.</p>
<p>For the vendor in the inbox: out of 10,000 TradeFlow payments you should expect about 860 flags, and only about 44 percent of them are failed payments. That can still be worth buying if a reviewer is cheap and a missed failure is expensive. It is not “90 percent accuracy”. Say so.</p>
<div class="callout tip"><b>Keep their words and your words apart.</b> Write both probabilities in a sentence before the meeting: “They catch 90 percent of failures. About 44 percent of what we would review is a failure.” If those two sentences cannot both fit on the slide, the slide is hiding one of them.</div>`
    },
    {
      id: 'st-2-3-ex5',
      type: 'exercise',
      title: 'Your turn: the share of alarms that are innocent',
      body: `<p>Using TradeFlow’s real base rate and the vendor’s rates of 0.9 and 0.05, print the share of flags that are <b>not</b> failures. Four decimal places.</p>
<p>You should see <code>0.5571</code>. This is the complement of the 0.4429 you already computed. It is the number to put next to “how much review time do we buy?”</p>
<p><b>Think before you type:</b> build P(Failed | flag) the same way as before, then print 1 minus it.</p>`,
      starter: `# orders_pay is already loaded\n\n# Write your code below\n`,
      hints: [
        'p_failed from the column, p_flag = 0.9 * p_failed + 0.05 * (1 - p_failed), posterior = 0.9 * p_failed / p_flag, then print 1 - posterior.',
        'p_failed = orders_pay["payment_status"].eq("Failed").mean()\np_flag = 0.9 * p_failed + 0.05 * (1 - p_failed)\nposterior = 0.9 * p_failed / p_flag\nprint("{:.4f}".format(1 - posterior))\n'
      ],
      solution: `p_failed = orders_pay["payment_status"].eq("Failed").mean()
p_flag = 0.9 * p_failed + 0.05 * (1 - p_failed)
posterior = 0.9 * p_failed / p_flag
print("{:.4f}".format(1 - posterior))
`,
      ordered: true
    },
    {
      id: 'st-2-3-c3',
      type: 'check',
      title: 'A screen that flags nothing is 95.77 percent accurate on TradeFlow payments. Why is that a bad reason to trust it?',
      body: `<p>Think about which rows make up the 95.77 percent.</p>`,
      options: [
        'It is not a bad reason. 95.77 percent accuracy is better than the vendor’s 90 percent',
        'Almost all payments are healthy, so calling every payment healthy is right most of the time and still catches no failures. Accuracy is high because the event is rare, not because the screen works',
        '95.77 percent is impossible, so the calculation must be wrong',
        'Accuracy always equals the base rate, so the number contains no trick'
      ],
      answer: 1,
      why: [
        'The 90 and the 95.77 are not comparable. The 90 is a share of failures caught. The 95.77 is a share of all rows labelled “healthy” correctly by never looking. A higher accuracy here belongs to the worse screen.',
        'Right. The 9,577 healthy payments are marked correct, the 423 failures are marked wrong, and the headline still looks excellent. On a rare event, accuracy rewards ignoring the event. Ask for the catch rate and the false-alarm rate instead.',
        '9,577 ÷ 10,000 is exactly 0.9577. The arithmetic is right. The interpretation is what fails.',
        'Accuracy equals the share of non-events only for the do-nothing rule. A real screen has a different accuracy, and that accuracy can still look flattering for the same reason. The point is to stop using accuracy as the headline.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now',
      body: `<p>You can take a confident percentage apart and rebuild the probability the decision actually needs.</p>
<ul>
<li>P(flag | failed) and P(failed | flag) are different. The vendor’s 90 percent is the first. The inbox is the second, and on this base rate it is <b>0.4429</b></li>
<li><b>Bayes’ rule</b>, P(A | B) = P(B | A) × P(A) ÷ P(B), is the multiplication rule turned around. It matched the delivery count exactly: 1.0000</li>
<li>P(flag) has to include false alarms, or the denominator is too small and the answer is too kind</li>
<li>The <b>base rate</b> can matter more than the advertised hit rate. The same screen is 0.4429 on TradeFlow and 0.9474 if half of payments failed</li>
<li><b>Accuracy</b> on a rare event congratulates a screen that does nothing: 0.9577 here. Ask for the catch rate, the false-alarm rate, and the base rate</li>
<li>About <b>55.71 percent</b> of this vendor’s flags would be healthy payments. That can be a reasonable buy. It is not the sentence in the email</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>A model “detects 95 percent of fraud”. What else do you need before you can say how often an alert is real?</li>
<li>Why can a classifier show high accuracy and still be useless?</li>
<li>State Bayes’ rule in words, and give a business example of P(A | B) and P(B | A) being different.</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I need the base rate of fraud, and the false positive rate: of the legitimate cases, what share are flagged. Detection is P(flag | fraud). The share of alerts that are real fraud is P(fraud | flag), and it depends on how rare fraud is. If fraud is 1 in 1,000, even a small false positive rate produces far more false alerts than true ones. I would compute that on our base rate, not on the vendor’s demo.</p>
<p><b>2.</b> If one class is almost the whole dataset, a rule that always predicts that class scores a high accuracy while never finding the rare class. TradeFlow payments are 95.77 percent healthy, so “never flag” is 95.77 percent accurate and catches none of the 423 failures. Accuracy blends the common case and the rare case into one compliment. I would report the catch rate and the false-alarm rate separately.</p>
<p><b>3.</b> The probability of A given B equals the probability of B given A, times the probability of A, divided by the probability of B. The delivery case is the clean example: the probability of no delivery given cancelled is 0.9452, but the probability of cancelled given no delivery is 1. A medical or fraud example works the same way: the probability the test fires given the disease is not the probability of the disease given that the test fired.</p>
</details>
<p><b>Coming next, in lesson 2.4:</b> from “will this happen?” to “what is it worth?”. A probability becomes a decision when you attach a number to each outcome and take the long-run average. That average is the expected value, and it is the reason the ordinary mean has been following you since Module 1.</p>`
    }
  ]
},
{
  id: 'st-2-4',
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
  title: '2.4 Expected value: the long-run average of a decision',
  tables: [],
  intro: `Commercial wants a push toward card payments. <i>“Cash on delivery feels riskier. The customer might never pay. Should we steer people off it?”</i><br><br>A feeling is not a policy. Attach a number to each order, the money TradeFlow actually keeps, and ask what that number averages to in the long run for each payment method. The long-run average has a name: the <b>expected value</b>. It will not tell you what the next order does. It will tell you what a thousand orders like it are worth, which is the question behind a policy. <code>cash_kept</code> is already on <code>orders_pay</code>: the payment amount when the status is Paid, and 0 otherwise.`,
  steps: [
    {
      type: 'explain',
      title: 'A random variable is a number on each outcome',
      body: `<p>Status is a label. You cannot average a label in a way that means money. A <b>random variable</b> is a rule that puts a number on each outcome.</p>
<p>Here is the rule commercial actually cares about, written down so it can be argued with:</p>
<ul>
<li>If the payment status is <b>Paid</b>, cash kept is the amount.</li>
<li>If the status is <b>Pending</b>, <b>Failed</b> or <b>Refunded</b>, cash kept is 0. Pending has not arrived. Failed never arrived. Refunded came back.</li>
</ul>
<p>That rule is a choice. A different analyst might treat Pending as money that will probably arrive, or Refunded as a negative amount because of the cost of sending it back. Changing the rule changes the answer. The honest move is to show the rule, not to hide it inside a word like “revenue”.</p>
<p>Once every order has a number, you can ask for the probability-weighted average of those numbers. That is the <b>expected value</b>.</p>
<p><b>Expected value = (value of outcome 1 × its probability) + (value of outcome 2 × its probability) + …</b></p>
<p>When every order is equally likely, each probability is 1 ÷ 10,000, and the weighted sum is the ordinary mean of the column. This is why the mean kept turning up in Module 1. The mean is not a second idea. It is the expected value of “pick a row at random”.</p>
<div class="callout analogy"><b>The price of a lottery ticket.</b> A ticket pays 0 most of the time and a prize occasionally. You do not ask “what will this ticket pay?”. You ask what tickets like this pay per ticket, over a long run of them. That average, including the zeros, is what the ticket is worth. Cash kept is the same object, with TradeFlow’s payments as the tickets.</div>`
    },
    {
      type: 'try',
      title: 'What one random order is worth',
      body: `<p>The mean of <code>amount</code> is <b>158,198.15</b>. That is the expected size of the bill. The mean of <code>cash_kept</code> is <b>134,139.47</b>. That is the expected money TradeFlow keeps, after unpaid and refunded payments contribute zero.</p>
<p>The gap, about 24,000 per order, is not a leak in the average. It is the unpaid share, weighted in. If you reported 158,198 as “what we keep”, you would be answering a different random variable from the one commercial asked about.</p>`,
      code: `print("{:.2f}".format(orders_pay["amount"].mean()))
print("{:.2f}".format(orders_pay["cash_kept"].mean()))
`
    },
    {
      id: 'st-2-4-ex1',
      type: 'exercise',
      title: 'Your turn: bill size, and cash actually kept',
      body: `<p>Print the expected bill, which is the mean of <code>amount</code>, then the expected cash kept, which is the mean of <code>cash_kept</code>. Two decimal places.</p>
<p>You should see <code>158198.15</code> and then <code>134139.47</code>.</p>
<p><b>Think before you type:</b> both columns are already on <code>orders_pay</code>. Format with <code>"{:.2f}".format(...)</code> so the second decimal place is printed.</p>`,
      starter: `# orders_pay is already loaded, including cash_kept\n\n# Write your code below\n`,
      hints: [
        'Print orders_pay["amount"].mean() and orders_pay["cash_kept"].mean(), each formatted to 2 decimals.',
        'print("{:.2f}".format(orders_pay["amount"].mean()))\nprint("{:.2f}".format(orders_pay["cash_kept"].mean()))\n'
      ],
      solution: `print("{:.2f}".format(orders_pay["amount"].mean()))
print("{:.2f}".format(orders_pay["cash_kept"].mean()))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'See the weights, on a score you can do by hand',
      body: `<p>Cash kept mixes a probability with a different amount on every order, so the weights hide inside the mean. Strip the amounts off, and the definition is visible.</p>
<p>Give every payment a <b>score</b>:</p>
<ul>
<li>Paid: <b>+1</b>. We ended ahead.</li>
<li>Refunded: <b>−1</b>. The sale was undone.</li>
<li>Pending or Failed: <b>0</b>. Nothing was kept.</li>
</ul>
<p>The expected score is the sum of value times probability. You already know the four probabilities from lesson 2.1.</p>
<p>0.8461 × 1 + 0.0512 × (−1) + 0.0604 × 0 + 0.0423 × 0 = 0.8461 − 0.0512 = <b>0.7949</b>.</p>
<p>The zeros do not add money. They still belong in the sentence, because those outcomes happen and they pull the average down by existing. Dropping them and averaging only the Paid rows would answer “what is a paid order worth?” and quietly change the question.</p>
<div class="callout watch"><b>Leaving the failures out inflates the value.</b> The expected value of a policy includes the orders where the policy pays nothing. A conversion rate times a revenue, with the non-converters missing from the average, is how a campaign gets priced above what it returns.</div>`
    },
    {
      type: 'try',
      title: 'The weighted sum matches the column mean',
      body: `<p>The first print builds the score with <code>np.where</code> and takes its mean: <b>0.7949</b>. The second print is the hand calculation from the four probabilities: also <b>0.7949</b>. Same definition, two writings. Use the column when the values differ by row. Use the weighted sum when someone has given you a small table of scenarios instead of the rows.</p>`,
      code: `import numpy as np

status = orders_pay["payment_status"]
score = np.where(status.eq("Paid"), 1.0, np.where(status.eq("Refunded"), -1.0, 0.0))
by_hand = 0.8461 * 1 + 0.0512 * (-1) + 0.0604 * 0 + 0.0423 * 0

print("{:.4f}".format(score.mean()))
print("{:.4f}".format(by_hand))
`
    },
    {
      id: 'st-2-4-ex2',
      type: 'exercise',
      title: 'Your turn: the expected score',
      body: `<p>Build the score yourself from <code>payment_status</code>: 1 if Paid, −1 if Refunded, 0 otherwise. Print its mean with 4 decimal places.</p>
<p>You should see <code>0.7949</code>.</p>
<p><b>Think before you type:</b> nested <code>np.where</code> is enough. The mean of that column is the expected value, because each order is equally likely.</p>`,
      starter: `import numpy as np\n\n# Write your code below\n`,
      hints: [
        'np.where(status.eq("Paid"), 1.0, np.where(status.eq("Refunded"), -1.0, 0.0)), then take the mean.',
        'import numpy as np\n\nstatus = orders_pay["payment_status"]\nscore = np.where(status.eq("Paid"), 1.0, np.where(status.eq("Refunded"), -1.0, 0.0))\nprint("{:.4f}".format(score.mean()))\n'
      ],
      solution: `import numpy as np

status = orders_pay["payment_status"]
score = np.where(status.eq("Paid"), 1.0, np.where(status.eq("Refunded"), -1.0, 0.0))
print("{:.4f}".format(score.mean()))
`,
      ordered: true
    },
    {
      id: 'st-2-4-c1',
      type: 'check',
      title: 'Which sentence is the expected cash kept of 134,139.47?',
      body: `<p>Be careful what a long-run average promises.</p>`,
      options: [
        'The next order will keep exactly 134,139.47',
        'The most common order keeps 134,139.47',
        'If we keep drawing orders like these, the average cash kept per order settles at 134,139.47. A single order can be far from it',
        '134,139.47 is the largest amount TradeFlow can keep on an order'
      ],
      answer: 2,
      why: [
        'The next order is one draw. It might be unpaid, so cash kept is 0, or it might be a very large paid order. The expected value is not a forecast of one row.',
        'That would be a mode, and only if a single amount occurred more than the others. 134,139.47 is an average, and looking at the column you will not find it repeated as a typical bill.',
        'Right. Expected value is the average per draw over a long run of draws like these. Use it to price a policy that will be repeated. Do not tell a customer their order “should” be this number.',
        'Many paid orders are larger than this, and the average is pulled down by the zeros. An average is not a maximum.'
      ]
    },
    {
      type: 'explain',
      title: 'Put the expected value next to the decision',
      body: `<p>Commercial’s proposal was about payment methods. Compute the expected cash kept <b>given</b> the method. A group mean is a conditional expected value: the long-run average inside one pile.</p>
<table class="mini">
<tr><th>Method</th><th>Expected cash kept</th></tr>
<tr><td>Cash on Delivery</td><td><b>137,138.67</b></td></tr>
<tr><td>Card</td><td>134,573.15</td></tr>
<tr><td>Mobile Money</td><td>132,692.50</td></tr>
<tr><td>Bank Transfer</td><td><b>132,203.51</b></td></tr>
</table>
<p>Cash on delivery is the <b>highest</b>, not the lowest. Bank transfer is the lowest. This lines up with lesson 2.2, where cash on delivery failed less often than average and bank transfer failed more often. The feeling named the wrong method.</p>
<p>The gap between the top and the bottom is <b>4,935.15</b> per order, in expected cash kept. Over many orders that is real money. It is still not a reason, by itself, to ban a method: customers who choose bank transfer may differ in other ways, and steering people off a method can lose the order entirely. What you can say in the meeting, without bluffing, is: <i>on the orders we already have, cash on delivery keeps more money per order than bank transfer, by about 4,935 in the long run. The risk story is not in this column.</i></p>
<div class="callout work"><b>At work:</b> pricing, credit limits, staffing a support queue, and “is this promotion worth it?” are expected-value problems. Write the payoff for each outcome, including the outcome where nothing happens, weight by the probability, and compare the averages. A story about one vivid failure is not a substitute for that sum.</div>`
    },
    {
      type: 'try',
      title: 'Expected cash kept, by method',
      body: `<p>The four means, largest first. Cash on delivery <b>137,138.67</b>, card <b>134,573.15</b>, mobile money <b>132,692.50</b>, bank transfer <b>132,203.51</b>. The sort is only for reading. The numbers are the policy comparison.</p>`,
      code: `means = orders_pay.groupby("payment_method")["cash_kept"].mean().sort_values(ascending=False)

for method, value in means.items():
    print(method, "{:.2f}".format(value))
`
    },
    {
      id: 'st-2-4-ex3',
      type: 'exercise',
      title: 'Your turn: the two methods in the argument',
      body: `<p>Print the expected cash kept for <b>Cash on Delivery</b>, then for <b>Bank Transfer</b>. Two decimal places.</p>
<p>You should see <code>137138.67</code> and then <code>132203.51</code>.</p>
<p><b>Think before you type:</b> <code>groupby("payment_method")["cash_kept"].mean()</code> gives you all four. Pick the two keys. Mind the spelling: <code>"Cash on Delivery"</code> and <code>"Bank Transfer"</code>.</p>`,
      starter: `# orders_pay is already loaded, including cash_kept\n\n# Write your code below\n`,
      hints: [
        'means = orders_pay.groupby("payment_method")["cash_kept"].mean(), then print means["Cash on Delivery"] and means["Bank Transfer"] formatted to 2 decimals.',
        'means = orders_pay.groupby("payment_method")["cash_kept"].mean()\nprint("{:.2f}".format(means["Cash on Delivery"]))\nprint("{:.2f}".format(means["Bank Transfer"]))\n'
      ],
      solution: `means = orders_pay.groupby("payment_method")["cash_kept"].mean()
print("{:.2f}".format(means["Cash on Delivery"]))
print("{:.2f}".format(means["Bank Transfer"]))
`,
      ordered: true
    },
    {
      id: 'st-2-4-ex4',
      type: 'exercise',
      title: 'Your turn: the long-run gap',
      body: `<p>Print the difference: expected cash kept for Cash on Delivery, minus expected cash kept for Bank Transfer. Two decimal places.</p>
<p>You should see <code>4935.15</code>. That is how much more one cash-on-delivery order is worth than one bank-transfer order, as a long-run average, under the cash-kept rule.</p>
<p><b>Think before you type:</b> subtract the two group means, then format. Do not subtract the already-rounded numbers in your head and type the result. Let the column do it.</p>`,
      starter: `# orders_pay is already loaded, including cash_kept\n\n# Write your code below\n`,
      hints: [
        'From the group means, subtract Bank Transfer from Cash on Delivery and format to 2 decimals.',
        'means = orders_pay.groupby("payment_method")["cash_kept"].mean()\ngap = means["Cash on Delivery"] - means["Bank Transfer"]\nprint("{:.2f}".format(gap))\n'
      ],
      solution: `means = orders_pay.groupby("payment_method")["cash_kept"].mean()
gap = means["Cash on Delivery"] - means["Bank Transfer"]
print("{:.2f}".format(gap))
`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The long run is long: the law of large numbers',
      body: `<p>Expected value is a promise about an average, and the promise comes due slowly. This is the <b>law of large numbers</b>: if you draw independent outcomes from the same process, the average of the draws moves toward the expected value as the number of draws grows. It does not say the next draw will be close. It says the average will be.</p>
<p>Pull random orders from <code>cash_kept</code>, with replacement, seed 7, so the demonstration is repeatable. Each sample size gets its own fresh generator, so the small sample is not hidden inside the big one.</p>
<table class="mini">
<tr><th>Orders averaged</th><th>Average cash kept</th></tr>
<tr><td>20</td><td>103,561.18</td></tr>
<tr><td>200</td><td>126,693.28</td></tr>
<tr><td>2,000</td><td>129,107.91</td></tr>
<tr><td>The expected value</td><td>134,139.47</td></tr>
</table>
<p>Twenty orders land more than 30,000 away from the expected value. Two thousand are closer, and still a few thousand short. Someone watching a week of orders and declaring the expected value “wrong” is looking at noise. Someone watching a week of orders and declaring a new policy from that week is doing the same thing.</p>
<p>You met this shape in Module 1, when sample averages sat in a hill around the truth. The expected value is the centre of that hill. Probability is what made “the truth” a precise object.</p>
<div class="callout watch"><b>One ugly order does not refute an expected value.</b> A single zero is inside the average already. It was priced in when we defined cash kept. What would refute it is a long run of orders whose average refuses to approach 134,139.47, which would mean the world has changed and the old probabilities no longer apply.</div>`
    },
    {
      type: 'try',
      title: 'Twenty orders, two hundred, two thousand',
      body: `<p>Three averages, each from its own seed-7 generator: <b>103561.18</b>, <b>126693.28</b>, <b>129107.91</b>. Then the expected value, <b>134139.47</b>. The averages walk toward it. They do not sprint.</p>`,
      code: `import numpy as np

cash = orders_pay["cash_kept"].to_numpy()

for n in (20, 200, 2000):
    rng = np.random.default_rng(7)
    draw = rng.choice(cash, size=n, replace=True)
    print("{:.2f}".format(draw.mean()))

print("{:.2f}".format(cash.mean()))
`
    },
    {
      id: 'st-2-4-ex5',
      type: 'exercise',
      title: 'Your turn: a short run and a longer one',
      body: `<p>Draw cash-kept values with replacement. Print the average of <b>20</b> draws, then the average of <b>2,000</b> draws. Give each sample its own <code>np.random.default_rng(7)</code>. Two decimal places.</p>
<p>You should see <code>103561.18</code> and then <code>129107.91</code>.</p>
<p><b>Think before you type:</b> if you reuse one generator for both samples, the second sample continues the random sequence and will not match. Build a new generator with the same seed before each <code>choice</code>.</p>`,
      starter: `import numpy as np\n\ncash = orders_pay["cash_kept"].to_numpy()\n\n# Write your code below\n`,
      hints: [
        'For each sample size, rng = np.random.default_rng(7), then rng.choice(cash, size=n, replace=True).mean(). Print 20 first, then 2000.',
        'import numpy as np\n\ncash = orders_pay["cash_kept"].to_numpy()\n\nrng = np.random.default_rng(7)\nprint("{:.2f}".format(rng.choice(cash, size=20, replace=True).mean()))\nrng = np.random.default_rng(7)\nprint("{:.2f}".format(rng.choice(cash, size=2000, replace=True).mean()))\n'
      ],
      solution: `import numpy as np

cash = orders_pay["cash_kept"].to_numpy()

rng = np.random.default_rng(7)
print("{:.2f}".format(rng.choice(cash, size=20, replace=True).mean()))
rng = np.random.default_rng(7)
print("{:.2f}".format(rng.choice(cash, size=2000, replace=True).mean()))
`,
      ordered: true
    },
    {
      id: 'st-2-4-c2',
      type: 'check',
      title: 'A colleague pulls 20 orders and gets an average cash kept of 103,561. They say the expected value of 134,139 must be wrong. What do you tell them?',
      body: `<p>Remember what the law of large numbers promises, and what it does not.</p>`,
      options: [
        'They are right. Any sample that misses the expected value disproves it',
        'Twenty draws are a short run. The law of large numbers says the average settles as the number of draws grows. One sample of 20 is allowed to sit far away, and this one does',
        'The seed was unlucky, so change the seed until a sample of 20 hits 134,139',
        'Expected value only applies to coins, not to money'
      ],
      answer: 1,
      why: [
        'A short sample missing the centre is the ordinary case, not a disproof. The expected value was computed from all 10,000 orders. Twenty orders do not replace that count.',
        'Right. We just watched samples of 20, 200 and 2,000 walk toward 134,139.47 without equalling it. The colleague saw the first step and treated it as a verdict. Ask them to look at a much longer run before they throw out the average.',
        'Hunting for a seed that flatters you is hiding noise, not removing it. The seed is there so someone else can repeat the demonstration, not so you can shop for a result.',
        'Money kept on a random order is a perfectly ordinary random variable. Expected value is the weighted average of its outcomes, whatever unit those outcomes are in.'
      ]
    },
    {
      type: 'explain',
      title: 'The number is only as honest as the payoff',
      body: `<p>Expected value will give a crisp ranking to any decision you can write as numbers. That crispness is a risk. If the payoff is the wrong payoff, the ranking is confidently wrong.</p>
<p>Three checks before you take a ranking into a meeting:</p>
<ul>
<li><b>What does 0 mean?</b> In cash kept, 0 means “we did not keep the bill”. It does not mean “this order was free to serve”. Delivery cost, support time and fraud review are not in the column. If those costs differ by method, the ranking can move.</li>
<li><b>What did you drop?</b> Averaging only Paid rows drops the failures. That answers a narrower question. Say which question you answered.</li>
<li><b>Will this decision be repeated?</b> A payment method used thousands of times is an expected-value decision. A one-off bet, a single large contract, a launch you cannot rerun, is not priced by the average alone. You also need the spread: how bad a single draw can be. That is the next part of the track. Expected value tells you the centre. It does not tell you the risk around it.</li>
</ul>
<p>Used with those checks, it is the cleanest decision tool in this module. Commercial’s feeling said cash on delivery was the risky method. Under a stated rule, on the orders TradeFlow actually has, it is the method with the highest cash kept per order. The feeling can still be right about costs we have not measured. It is not right about this column, and you can show the column.</p>
<div class="callout tip"><b>Write the payoff in one line above the number.</b> “Cash kept = amount if Paid, else 0. Expected value by method, per order.” A reader who disagrees with the line can disagree in the open. A reader who is only shown the ranking cannot.</div>`
    },
    {
      id: 'st-2-4-c3',
      type: 'check',
      title: 'You recompute cash kept and this time count Pending as money kept, because most pending payments eventually clear. What has changed?',
      body: `<p>Think about the rule, not about Pandas.</p>`,
      options: [
        'Nothing important. Pending is rare, so the expected value cannot move',
        'You changed the random variable. The new number answers a different question, and it may rerank the methods. It is not a correction of the old number unless the old payoff was a mistake',
        'The law of large numbers stops applying, because you touched the column',
        'Pending must be left out, because a probability cannot describe money that has not arrived'
      ],
      answer: 1,
      why: [
        'Rare is not weightless. Pending is 6.04 percent of payments, and if those amounts are large the mean moves. You have to recompute, not wave.',
        'Right. Expected value is the average of a defined payoff. Counting Pending as kept is a legitimate different definition if you believe those payments arrive. It is a new question. Put both definitions on the page if the room is split, rather than swapping the rule in silence.',
        'The law of large numbers applies to whatever number you attached to the outcomes. Changing the number changes the target the average walks toward. It does not cancel the law.',
        'You can attach any number you can defend, including an amount you expect to arrive later. The discipline is to defend it, not to pretend unpaid money is forbidden as a concept.'
      ]
    },
    {
      type: 'explain',
      title: 'Module 2 complete: what you can do now',
      body: `<p>You started this module with a count. You can now turn counts into the probabilities a decision needs, and turn those probabilities into a value.</p>
<table class="mini">
<tr><th>Lesson</th><th>The idea</th><th>The sentence you can now say</th></tr>
<tr><td><b>2.1 Counts and addition</b></td><td>A probability is a share of a named pile</td><td>“5.29 percent of orders are cancelled. Paid or Card is 0.8835, not 1.10, because 2,149 payments are both.”</td></tr>
<tr><td><b>2.2 Conditional probability</b></td><td>The condition picks the denominator</td><td>“Every order with no delivery record is cancelled. A cancelled order is still paid 87 percent of the time.”</td></tr>
<tr><td><b>2.3 Bayes and base rates</b></td><td>The advertised hit rate is not the inbox</td><td>“They catch 90 percent of failures. On our base rate, 44 percent of the flags are failures. Never-flagging would score 96 percent accuracy.”</td></tr>
<tr><td><b>2.4 Expected value</b></td><td>Weight the payoffs, and say what 0 means</td><td>“Under cash kept = amount if Paid else 0, cash on delivery is worth about 4,935 more per order than bank transfer, in the long run.”</td></tr>
</table>
<p>Across the module, you can:</p>
<ul>
<li>Compute a probability as a mean of True and False, and say which population the tickets came from</li>
<li>Use the complement, add exclusive events, and subtract the overlap when events are not exclusive</li>
<li>Tell a probability you designed from a probability you measured</li>
<li>Compute P(A | B), and refuse to swap it with P(B | A)</li>
<li>Test independence with a conditional probability or with a product, and not confuse it with “mutually exclusive”</li>
<li>Invert a conditional probability with Bayes’ rule, and put the base rate in the sentence</li>
<li>Ignore accuracy when one class is almost the whole table</li>
<li>Define a payoff, take its expected value, compare groups, and not treat a short sample as a verdict</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>Give the definition of expected value, and explain why it equals a column mean when every row is equally likely.</li>
<li>A manager says a channel “feels risky” and wants it removed. What do you compute before you agree?</li>
<li>Why is a sample of 20 orders a bad objection to an expected value computed from 10,000?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> The expected value is the sum of each outcome’s value times that outcome’s probability. It is the average result per draw over a long run. If I have one row per equally likely order, each probability is 1 over the number of rows, so the weighted sum is the total of the column divided by the number of rows, which is the mean. The mean is the expected value of picking a row at random.</p>
<p><b>2.</b> I write down the payoff first, including what happens when the bad case occurs and when nothing occurs. Then I compute the expected payoff given that channel and given the other channels, and I put the base rates beside them. On TradeFlow, cash on delivery was the channel people worried about, and under “amount if paid, else zero” it had the highest expected cash kept. I would also say which costs are missing, because a feeling about risk is sometimes a real cost that is not in the column. I would not remove a channel on the feeling alone.</p>
<p><b>3.</b> Expected value is a fact about the long-run average, not about one small batch. The law of large numbers says the average of independent draws moves toward the expected value as the number of draws grows, and a batch of 20 can sit a long way off. We saw a seed-7 sample of 20 land at 103,561 against an expected value of 134,139. That sample is noise. A long stretch of orders whose average refused to approach the expected value would be evidence that the process had changed.</p>
</details>
<p><b>Coming next, in Module 3:</b> distributions. A probability answers one event. A distribution is the full list: every value a random variable can take, and the probability of each. You will meet the short list of shapes that keep reappearing in business data, and you will use them to go from “this is the expected value” to “this is how far a real week can land from it”.</p>`
    }
  ]
}
);
