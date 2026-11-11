LESSONS.push(
{
  id: 'py-3-5',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: '',
  title: '3.5 Validation: prove the data is ready',
  tables: [],
  intro: `Next week the CEO reviews the quarter. The Head of Data stops at your desk. <i>“You have spent four lessons cleaning the data,”</i> he says. <i>“Good. Now I need proof that it is ready. Not ‘I looked at it and it seemed fine’. Proof I can show to someone who was not in the room.”</i><br><br>This is the last step of a cleaning job, and it is the step that separates careful analysts from hopeful ones. Cleaning is what you <i>do</i> to the data. <b>Validation</b> is how you <i>prove</i> the data is in good shape, and how you find the problems you did not know to look for.<br><br>In this lesson you will write checks in four families: unique keys, sensible ranges, links between tables that really exist, and business rules. Some will pass. Some will fail, and you will see why a failed check is not bad news but a successful discovery. Then you will gather everything into one validation report, and assemble the cleaned dataset that the rest of this track will build on.`,
  steps: [
    {
      type: 'explain',
      title: 'Why a checklist beats a good eye',
      body: `<p>A pilot who has flown a thousand times still reads the pre-flight checklist before take-off. Not because the pilot forgot how to fly, but because memory and attention fail, and the checklist does not. Data deserves the same respect.</p>
<p>A <b>validation check</b> is a yes-or-no question about your data, written as code: <i>“Is every order ID unique?”</i> <i>“Is any payment zero or negative?”</i> Because it is code, you can run it today, run it again tomorrow when new rows arrive, and hand it to a colleague. Four families of checks cover most of what goes wrong:</p>
<table class="mini">
<tr><th>Family</th><th>The question</th><th>TradeFlow example</th><th>Main Pandas tool</th></tr>
<tr><td><b>Unique keys</b></td><td>Does every row have its own ID?</td><td>No two orders share an <code>order_id</code></td><td><code>.is_unique</code></td></tr>
<tr><td><b>Ranges and allowed values</b></td><td>Are the values sensible?</td><td>Quantities between 1 and 5, status is one of four words</td><td><code>.between()</code>, <code>.isin()</code></td></tr>
<tr><td><b>Links between tables</b></td><td>Does every reference point to something real?</td><td>Every order belongs to a customer who exists</td><td><code>.isin()</code> on another table</td></tr>
<tr><td><b>Business rules</b></td><td>Do the columns agree with each other?</td><td>A delivery cannot arrive before it was dispatched</td><td>comparisons between columns</td></tr>
</table>
<div class="callout analogy"><b>Think of a bridge inspection.</b> Engineers do not walk across a bridge and say “feels solid”. They run a list of tests: the cables, the joints, the load limits. Each test passes or fails, and the report is what lets the public trust the bridge. A validation report does the same job for your data.</div>
<p>Let’s start with the first family, and the easiest one to understand.</p>`
    },
    {
      type: 'try',
      title: 'Are the keys really unique?',
      body: `<p>Every table has a column that should act like a fingerprint: one value per row, never repeated. Pandas has a shortcut for checking it, <code>.is_unique</code>, which answers <b>True</b> or <b>False</b> for a whole column. All four come back True here: no two customers share a <code>customer_id</code>, no two orders share an <code>order_id</code>, and likewise for payments and order lines.</p>
<p>The last line asks a different question: does the <i>pair</i> <code>order_id</code> and <code>product_id</code> repeat in the order lines? The answer is <b>147</b>. You know this number from lesson 3.3. It is a failed check, but not a data error: those were real purchases that you proved with a reconciliation. So the check stays in the report, with a note that explains it. A check that fails for a known and documented reason is still useful, because tomorrow it will tell you if the number <i>changes</i>.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
payments = pd.read_csv("payments.csv")
order_items = pd.read_csv("order_items.csv")

print("customer_id unique:", customers["customer_id"].is_unique)
print("order_id unique:", orders["order_id"].is_unique)
print("payment_id unique:", payments["payment_id"].is_unique)
print("order_item_id unique:", order_items["order_item_id"].is_unique)

print("Repeated order and product pairs:", order_items.duplicated(subset=["order_id", "product_id"]).sum())`
    },
    {
      id: 'py-3-5-ex1',
      type: 'exercise',
      title: 'Your turn: is the product key unique?',
      body: `<p>Load <code>products.csv</code> and print whether the <code>product_id</code> column is unique. You should see <code>True</code>.</p>
<p><b>Think before you type:</b> pick the column, then add <code>.is_unique</code> at the end. It is a property, so it has no brackets after it.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `products["product_id"].is_unique answers True or False. Put it inside print(...).`,
        `import pandas as pd\nproducts = pd.read_csv("products.csv")\nprint(products["product_id"].is_unique)`
      ],
      solution: `import pandas as pd\nproducts = pd.read_csv("products.csv")\nprint(products["product_id"].is_unique)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Ranges and allowed values: are the numbers sensible?',
      body: `<p>A range check asks whether a value makes sense to someone who knows the business. A quantity of zero or minus three on an order line is nonsense. So is a price of zero, or a product with minus five items in stock. Your tools:</p>
<ul>
<li><code>.min()</code> and <code>.max()</code> show the two extremes of a column, the fastest way to spot something strange.</li>
<li><code>.between(low, high)</code> gives True for every value inside the range, <b>including both ends</b>.</li>
<li><code>.isin([...])</code> gives True for every value that appears in a list you provide. It is perfect for columns that should only hold a few known words, like an order status.</li>
</ul>
<p>Each of these gives a column of True and False, one per row. You usually want a single verdict, so you add one of two small words:</p>
<ul>
<li><code>.all()</code> asks: <b>is it True for every row?</b></li>
<li><code>.any()</code> asks: <b>is it True for at least one row?</b></li>
</ul>
<p>To <i>count</i> the rows that break a rule, write the rule as a comparison and use <code>.sum()</code>, for example <code>(payments["amount"] &lt;= 0).sum()</code>, the number of payments at or below zero. A good range check gives <b>0</b>.</p>
<div class="callout watch"><b>Watch out:</b> a range check can tell you a value is unusual, but not that it is wrong. A very large payment may be a real big customer. Treat out-of-range as “please look”, not automatically as “delete”.</div>`
    },
    {
      type: 'try',
      title: 'Five range checks on TradeFlow',
      body: `<p>All five come back clean. The quantity on every order line runs from <b>1 to 5</b>, so the <code>between(1, 5).all()</code> check is True. No payment is at or below zero (<b>0</b>), no product has negative stock (<b>0</b>), and every order status is one of the four allowed words.</p>
<p>Notice the pattern in the last check: we first put the allowed words in a list called <code>allowed</code>, which keeps the line short and easy to read. When business rules change (say, a new status “On Hold” is added), you change one list.</p>`,
      code: `import pandas as pd

order_items = pd.read_csv("order_items.csv")
payments = pd.read_csv("payments.csv")
products = pd.read_csv("products.csv")
orders = pd.read_csv("orders.csv")

print("Quantity range:", order_items["quantity"].min(), "to", order_items["quantity"].max())
print("All quantities between 1 and 5:", order_items["quantity"].between(1, 5).all())
print("Payments at or below zero:", (payments["amount"] <= 0).sum())
print("Products with negative stock:", (products["stock_quantity"] < 0).sum())

allowed = ["Completed", "Processing", "Cancelled", "Returned"]
print("Order statuses all allowed:", orders["order_status"].isin(allowed).all())`
    },
    {
      id: 'py-3-5-ex2',
      type: 'exercise',
      title: 'Your turn: flag the unusually large payments',
      body: `<p>The Head of Data wants a list of payments to look at by hand. Load <code>payments.csv</code> and print how many payments have an <code>amount</code> <b>above 500000</b>. You should see <code>140</code>. These are not errors, only unusually large payments that someone should glance at.</p>
<p><b>Think before you type:</b> write the rule as a comparison, <code>payments["amount"] &gt; 500000</code>, wrap it in brackets and add <code>.sum()</code> to count the Trues.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `(payments["amount"] > 500000) gives True for each big payment. Add .sum() to count them, and print it.`,
        `import pandas as pd\npayments = pd.read_csv("payments.csv")\nprint((payments["amount"] > 500000).sum())`
      ],
      solution: `import pandas as pd\npayments = pd.read_csv("payments.csv")\nprint((payments["amount"] > 500000).sum())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Links between tables: no orphans allowed',
      body: `<p>Now the check that catches the most expensive mistakes. TradeFlow stores customers in one table and orders in another. Each order carries a <code>customer_id</code> that points back to a row in the customers table. In database language, customers is the <b>parent</b>, orders is the <b>child</b>, and that <code>customer_id</code> in the orders table is a <b>foreign key</b>.</p>
<p>An <b>orphan</b> is a child row that points to a parent that does not exist: an order for customer 99999, when only customers 1 to 2000 exist. Orphans are dangerous because they fail <i>silently</i>. When you later combine the two tables, the orphan order simply vanishes from your report, and your revenue comes out too low without any error message.</p>
<div class="callout analogy"><b>Think of a guest list at a party.</b> Every name on a delivery slip should be on the guest list. If a slip carries a name that is not there, somebody made a mistake, and a delivery will go missing. Checking links is checking every slip against the list.</div>
<p>The tool is <code>.isin()</code>, this time pointed at a column from another table: <code>orders["customer_id"].isin(customers["customer_id"])</code> gives True for each order whose customer exists. To count orphans, flip every True to False with the <code>~</code> sign (read it as “not”) and add <code>.sum()</code>: <code>(~orders["customer_id"].isin(customers["customer_id"])).sum()</code>. A healthy link gives <b>0</b>. (The next module teaches <code>~</code> properly. For now, read it as “flip”.)</p>
<p>One direction matters, the other is usually harmless. A <b>child without a parent</b> is an error. A <b>parent without children</b>, such as a customer with no orders, is often perfectly normal.</p>`
    },
    {
      type: 'try',
      title: 'Hunting orphans, in both directions',
      body: `<p>The first five lines count orphans: orders without a real customer, order lines without a real order or product, payments and deliveries without a real order. All five are <b>0</b>. The links in TradeFlow’s data are sound.</p>
<p>Then we look the other way round. <b>18 customers</b> have never placed an order. Is that an error? No: they signed up and never bought, which happens in every business. And <b>500 orders</b> have no delivery record. The last table shows why: every one of those 500 has the status <b>Cancelled</b>. An order that was cancelled never needed a delivery. The “missing” rows are the truth, not a fault. A check that explains itself like this is the best kind.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
order_items = pd.read_csv("order_items.csv")
products = pd.read_csv("products.csv")
payments = pd.read_csv("payments.csv")
deliveries = pd.read_csv("deliveries.csv")

print("Orders with no real customer:", (~orders["customer_id"].isin(customers["customer_id"])).sum())
print("Order lines with no real order:", (~order_items["order_id"].isin(orders["order_id"])).sum())
print("Order lines with no real product:", (~order_items["product_id"].isin(products["product_id"])).sum())
print("Payments with no real order:", (~payments["order_id"].isin(orders["order_id"])).sum())
print("Deliveries with no real order:", (~deliveries["order_id"].isin(orders["order_id"])).sum())

print("Customers who never ordered:", (~customers["customer_id"].isin(orders["customer_id"])).sum())

no_delivery = orders[~orders["order_id"].isin(deliveries["order_id"])]
print(no_delivery["order_status"].value_counts())`
    },
    {
      id: 'py-3-5-ex3',
      type: 'exercise',
      title: 'Your turn: customers who never ordered',
      body: `<p>Load <code>customers.csv</code> and <code>orders.csv</code>. Print how many customers have <b>never placed an order</b>, meaning their <code>customer_id</code> does not appear in the orders table. You should see <code>18</code>.</p>
<p><b>Think before you type:</b> the parent is customers, the child is orders. Use <code>customers["customer_id"].isin(orders["customer_id"])</code>, flip it with <code>~</code>, and count with <code>.sum()</code>.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `~customers["customer_id"].isin(orders["customer_id"]) is True for customers who never ordered. Put it in brackets, add .sum(), and print it.`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\nprint((~customers["customer_id"].isin(orders["customer_id"])).sum())`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\nprint((~customers["customer_id"].isin(orders["customer_id"])).sum())`,
      ordered: true
    },
    {
      id: 'py-3-5-c1',
      type: 'check',
      title: 'Eighteen customers have never placed an order. Does that fail the “links between tables” check?',
      body: `<p>Think about which table is the parent and which is the child.</p>`,
      options: [
        'Yes: every customer must have at least one order',
        'No: the check is about child rows pointing at parents that do not exist. A parent with no children, like a customer who has not bought yet, is normal',
        'Yes: those 18 customers should be deleted',
        'No: but only because 18 is a small number'
      ],
      answer: 1,
      why: [
        'Nothing in the business says a customer must buy. People sign up and never order, so this is not an error.',
        'Right! An orphan is a child pointing to a missing parent. A customer without orders is a parent without children, which is expected. Keep them.',
        'Deleting them would throw away real people, and it fixes nothing, because nothing is broken.',
        'Size is not the reason. Even if it were 500 customers, the check would still be about direction: orphans are the problem, childless parents are not.'
      ]
    },
    {
      type: 'explain',
      title: 'Business rules: do the columns agree with each other?',
      body: `<p>The fourth family is the most interesting, because no technical tool can find these problems on its own. A <b>business rule</b> is a fact about how the world works, for example:</p>
<ul>
<li>A delivery cannot arrive <b>before</b> it was dispatched.</li>
<li>A payment cannot be dated <b>before</b> its order exists.</li>
<li>A customer cannot place an order <b>before</b> they signed up.</li>
</ul>
<p>To check a date rule, convert the text dates to real dates (lesson 3.2), then compare the two columns with <code>&lt;</code>. A True means “the rule is broken in this row”, and <code>.sum()</code> counts the breaks.</p>
<p>Often the two dates live in <b>different tables</b>. A payment has a <code>payment_date</code>, but the order date sits in the orders table. To bring it across, use <code>.map()</code>. First build a lookup: <code>orders.set_index("order_id")["order_date"]</code> is a column of dates whose labels are order IDs. Then <code>payments["order_id"].map(lookup)</code> goes down the payments, and for each <code>order_id</code> looks up the matching date. If you have used <b>VLOOKUP</b> in a spreadsheet, this is exactly that. (The next module shows a more powerful way to combine tables, called <code>merge</code>.)</p>
<p>One quiet detail: a <b>missing</b> date is not earlier or later than anything, so a comparison with a missing date simply gives False. For deliveries that are still in transit, that is the right answer. Just be aware of it.</p>`
    },
    {
      type: 'try',
      title: 'Two date rules that hold',
      body: `<p>Both rules pass. <b>0</b> deliveries arrive before they were dispatched, and <b>0</b> payments are dated before their order. The 1,239 deliveries with no arrival date are not counted as breaks, because a missing date compares as False, which is correct for parcels that are still on the road.</p>
<p>Read the middle of the code slowly. <code>orders.set_index("order_id")["order_date"]</code> builds the lookup table. <code>.map(...)</code> uses it to attach to every payment the date of its own order. Then it is an ordinary date comparison. This pattern, <i>look up, then compare</i>, is the backbone of cross-table business rules.</p>`,
      code: `import pandas as pd

orders = pd.read_csv("orders.csv")
payments = pd.read_csv("payments.csv")
deliveries = pd.read_csv("deliveries.csv")

dispatch = pd.to_datetime(deliveries["dispatch_date"])
arrival = pd.to_datetime(deliveries["delivery_date"])
print("Deliveries arriving before dispatch:", (arrival < dispatch).sum())

lookup = orders.set_index("order_id")["order_date"]
order_date_of_payment = payments["order_id"].map(lookup)

paid_early = pd.to_datetime(payments["payment_date"]) < pd.to_datetime(order_date_of_payment)
print("Payments dated before their order:", paid_early.sum())`
    },
    {
      id: 'py-3-5-ex4',
      type: 'exercise',
      title: 'Challenge: orders placed before the customer signed up',
      body: `<p>Apply the same idea to a third rule. Load <code>customers.csv</code> and <code>orders.csv</code>. Print how many orders are dated <b>before</b> their customer’s <code>signup_date</code>. Brace yourself for the number: you should see <code>5037</code>.</p>
<p><b>Think before you type:</b> build a lookup with <code>customers.set_index("customer_id")["signup_date"]</code>. Use <code>.map</code> on the orders’ <code>customer_id</code> to get each order’s signup date. Convert both dates with <code>pd.to_datetime</code>, compare with <code>&lt;</code>, and count with <code>.sum()</code>.</p>`,
      starter: `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\n\n# Write your code below\n`,
      hints: [
        `signup = customers.set_index("customer_id")["signup_date"], then signup_of_order = orders["customer_id"].map(signup). Compare pd.to_datetime(orders["order_date"]) with pd.to_datetime(signup_of_order).`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\nsignup = customers.set_index("customer_id")["signup_date"]\nsignup_of_order = orders["customer_id"].map(signup)\nearly = pd.to_datetime(orders["order_date"]) < pd.to_datetime(signup_of_order)\nprint(early.sum())`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\norders = pd.read_csv("orders.csv")\nsignup = customers.set_index("customer_id")["signup_date"]\nsignup_of_order = orders["customer_id"].map(signup)\nearly = pd.to_datetime(orders["order_date"]) < pd.to_datetime(signup_of_order)\nprint(early.sum())`,
      ordered: true
    },
    {
      id: 'py-3-5-c2',
      type: 'check',
      title: 'Your check found 5,037 orders, about half of all orders, dated before the customer signed up. What do you do?',
      body: `<p>Think like an analyst who has to defend every number in front of the CEO.</p>`,
      options: [
        'Quietly change each signup date to match the customer’s first order, so the check passes',
        'Delete those 5,037 orders, because they are obviously wrong',
        'Report it: give the count and a few example rows to whoever owns the data, leave the data unchanged for now, and record it in the validation report',
        'Ignore it, because the totals still add up'
      ],
      answer: 2,
      why: [
        'This makes the report look better and the data worse. You would be inventing signup dates without knowing the real story, and nobody would know you had done it.',
        'Deleting half of the orders would destroy real sales. Even if the dates are odd, the money in the payments is real.',
        'Exactly. A check cannot tell you <i>why</i> something is wrong. There may be a good explanation, for example that signup_date records a later account upgrade, or that orders were imported from an older system. Your job is to find it, size it, show evidence, and let the owner decide. Do not guess, and do not hide it.',
        'The totals adding up tells you the money is consistent. It says nothing about whether the dates mean what the column name claims. Both facts matter.'
      ]
    },
    {
      type: 'explain',
      title: 'Letting the code speak: assert and the validation report',
      body: `<p>You now have checks in all four families. How do you run many of them, and show the result to someone else? There are two common styles.</p>
<p><b>Style 1, the alarm: <code>assert</code>.</b> The line <code>assert condition, "message"</code> does nothing if the condition is True. If it is False, Python <b>stops immediately</b> and shows your message. It works like a smoke alarm: perfect inside an automatic pipeline, where bad data must stop the line before it reaches a report. (Because it stops at the first failure, you wrap it in <code>try</code> and <code>except AssertionError</code> if you want to carry on after the message.)</p>
<p><b>Style 2, the report.</b> Often you want <b>every</b> check to run, pass or fail, and then see the full picture. For that you collect the results in a list as you go. Each result is a small dictionary, from Module 1: the check name, PASS or FAIL, and a note. At the end you turn the list into a table with <code>pd.DataFrame(results)</code>. To keep the code tidy, you write a small function, <code>check(name, passed, detail)</code>, that adds one result each time you call it. Functions, again from Module 1: one place for the logic, many easy calls.</p>
<div class="callout work"><b>At work:</b> a validation report is something you send along with the numbers. When the CEO asks “can we trust this figure?”, you do not say “yes, I think so”. You send the report, and every failed check already has an explanation next to it.</div>`
    },
    {
      type: 'try',
      title: 'The alarm: assert stops at the first failure',
      body: `<p>Three checks sit inside a <code>try</code> block. Check 1 (order IDs unique) passes and prints its message. Check 2, “every customer has an email”, <b>fails</b>: 58 customers have none. The <code>assert</code> raises an error with your message, the code jumps to <code>except</code>, and prints <b>STOPPED</b> with the message.</p>
<p>See what did <i>not</i> happen: check 3 never ran, even though it would have passed. That is the nature of an alarm: it stops the line at the first problem. It is the right tool for a pipeline, and the wrong tool for a report, where you want to know about <b>all</b> the problems at once. That is what we build next.</p>
<p>(<code>.notna()</code> is the opposite of <code>.isnull()</code>: True where a value is present. The <code>f</code> before the quote in the message lets you place a calculated value inside curly braces.)</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
payments = pd.read_csv("payments.csv")

try:
    assert orders["order_id"].is_unique, "Some order IDs repeat"
    print("Check 1 passed: order IDs are unique")

    assert customers["email"].notna().all(), f"{customers['email'].isnull().sum()} customers have no email"
    print("Check 2 passed: every customer has an email")

    assert (payments["amount"] > 0).all(), "A payment is zero or negative"
    print("Check 3 passed: all payment amounts are above zero")
except AssertionError as error:
    print("STOPPED:", error)`
    },
    {
      type: 'try',
      title: 'The validation report: ten checks, one table',
      body: `<p>This is the whole lesson in one table. Ten checks ran, and <b>every one</b> got an answer: <b>7 PASS</b> and <b>3 FAIL</b>. The FAIL rows carry a note:</p>
<ul>
<li><b>58 customers have no email.</b> A known gap in the customers table, and one the marketing team must be told about.</li>
<li><b>5,037 orders are dated before signup.</b> The new finding. It goes to the data owner with examples.</li>
<li><b>147 repeated order lines.</b> The 3.3 case, with a note: real purchases, billed, keep.</li>
</ul>
<p>Look at how the code is built. The function <code>check</code> is defined once and called ten times. Slow calculations such as <code>early</code> are done <i>before</i> the check lines, so each check line stays short and readable. Anyone can add an eleventh check by copying one line.</p>
<p>The last line counts the PASS and FAIL results with <code>value_counts()</code>, a summary you can put at the top of an email.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
order_items = pd.read_csv("order_items.csv")
products = pd.read_csv("products.csv")
payments = pd.read_csv("payments.csv")
deliveries = pd.read_csv("deliveries.csv")

results = []

def check(name, passed, detail=""):
    results.append({"check": name, "result": "PASS" if passed else "FAIL", "detail": detail})

signup = orders["customer_id"].map(customers.set_index("customer_id")["signup_date"])
early = (pd.to_datetime(orders["order_date"]) < pd.to_datetime(signup)).sum()
no_email = customers["email"].isnull().sum()
repeats = order_items.duplicated(subset=["order_id", "product_id"]).sum()
backwards = (pd.to_datetime(deliveries["delivery_date"]) < pd.to_datetime(deliveries["dispatch_date"])).sum()

check("customer_id is unique", customers["customer_id"].is_unique)
check("order_id is unique", orders["order_id"].is_unique)
check("quantities are between 1 and 5", order_items["quantity"].between(1, 5).all())
check("payment amounts are above zero", (payments["amount"] > 0).all())
check("orders point to real customers", orders["customer_id"].isin(customers["customer_id"]).all())
check("order lines point to real products", order_items["product_id"].isin(products["product_id"]).all())
check("deliveries never arrive before dispatch", backwards == 0)
check("every customer has an email", no_email == 0, f"{no_email} customers have no email")
check("orders are on or after signup", early == 0, f"{early} orders are dated before signup")
check("one line per product per order", repeats == 0, f"{repeats} repeats, real purchases (lesson 3.3)")

report = pd.DataFrame(results)
print(report)
print(report["result"].value_counts())`
    },
    {
      id: 'py-3-5-ex5',
      type: 'exercise',
      title: 'Challenge: write your own mini report',
      body: `<p>The box already contains the <code>check</code> function and an empty <code>results</code> list. Add <b>three checks</b>, in this order:</p>
<ol>
<li><code>product_id</code> in products is unique</li>
<li>no product has a negative <code>stock_quantity</code></li>
<li>every customer has an email</li>
</ol>
<p>The last line prints the results as a list. You should see <code>['PASS', 'PASS', 'FAIL']</code>.</p>
<p><b>Think before you type:</b> each check is one line like <code>check("name", condition)</code>. The condition must be True or False: <code>.is_unique</code> for the first, <code>(...&lt; 0).sum() == 0</code> for the second, and <code>.notna().all()</code> for the third.</p>`,
      starter: `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\nproducts = pd.read_csv("products.csv")\n\nresults = []\n\ndef check(name, passed):\n    results.append({"check": name, "result": "PASS" if passed else "FAIL"})\n\n# Add your three checks below\n\n\nreport = pd.DataFrame(results)\nprint(report["result"].tolist())\n`,
      hints: [
        `Three lines, each starting with check("...", ...). Use products["product_id"].is_unique, (products["stock_quantity"] < 0).sum() == 0, and customers["email"].notna().all().`,
        `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nproducts = pd.read_csv("products.csv")\nresults = []\ndef check(name, passed):\n    results.append({"check": name, "result": "PASS" if passed else "FAIL"})\ncheck("product_id is unique", products["product_id"].is_unique)\ncheck("no negative stock", (products["stock_quantity"] < 0).sum() == 0)\ncheck("every customer has an email", customers["email"].notna().all())\nreport = pd.DataFrame(results)\nprint(report["result"].tolist())`
      ],
      solution: `import pandas as pd\ncustomers = pd.read_csv("customers.csv")\nproducts = pd.read_csv("products.csv")\nresults = []\ndef check(name, passed):\n    results.append({"check": name, "result": "PASS" if passed else "FAIL"})\ncheck("product_id is unique", products["product_id"].is_unique)\ncheck("no negative stock", (products["stock_quantity"] < 0).sum() == 0)\ncheck("every customer has an email", customers["email"].notna().all())\nreport = pd.DataFrame(results)\nprint(report["result"].tolist())`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Assembling the cleaned dataset',
      body: `<p>You have cleaned, and you have validated. The last job is to <b>assemble</b> the cleaned tables, so every later lesson starts from data you can trust. Here is how a professional does it: not as a pile of loose commands, but as a small <b>recipe</b> for each table, written as a function. You write the recipe once, and anyone can run it on fresh data tomorrow and get the same result.</p>
<p>Three design choices, each one a lesson from this module:</p>
<ul>
<li><b>Work on a copy.</b> Each recipe starts with <code>.copy()</code>, so the original table stays untouched. If a decision turns out wrong, you start again from the original (lesson 3.3).</li>
<li><b>Add, do not overwrite, when you are unsure.</b> We clean the email in place, because lowercasing loses no information. But for names we add a <b>new column</b>, <code>name_clean</code>, and keep the original <code>customer_name</code>. Lesson 3.4 taught that name matches are leads, not proof, so the original must stay available.</li>
<li><b>Do not touch what you proved real.</b> The order lines are left exactly as they are: all <b>25,000</b> of them, repeats included. The reconciliation in 3.3 showed they were billed.</li>
</ul>
<p>The recipes use <code>pd.to_datetime</code> for dates (3.2), <code>.str</code> tools and patterns for text (3.4), and a new column for the number of days a delivery took. Missing values are left missing, because for a delivery still in transit the blank is the truth (3.1).</p>`
    },
    {
      type: 'try',
      title: 'Running the recipes',
      body: `<p>The three recipes run, and the facts of the clean dataset appear:</p>
<ul>
<li>customers has <b>2000 rows and 7 columns</b> (the original six plus <code>name_clean</code>). Orders keep their 10,000 rows, deliveries keep 9,500 plus one extra column, <code>delivery_days</code>.</li>
<li>The order lines are intact: <b>25000</b> rows, and the total of quantity times price is still <b>1581981450.5</b>, the same as the billed total.</li>
<li>The email fix shows its worth: <b>618</b> Gmail customers, found with a plain search.</li>
<li>Cleaning names leaves <b>1973</b> different names, as in 3.4.</li>
<li>The delivery times average <b>5.51</b> days, the same delivery time you calculated in lesson 3.2, now sitting in a ready-made column.</li>
<li>The signup date is a real date: its type is <code>datetime64[ns]</code>.</li>
</ul>
<p>Every number here matches something you proved earlier in this module. That is the best proof that the recipes do what you meant.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
deliveries = pd.read_csv("deliveries.csv")
order_items = pd.read_csv("order_items.csv")

title = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "
suffix = r" (MD|PhD|DDS|DVM|Jr\\.|II|III|IV)$"

def clean_customers(table):
    table = table.copy()
    table["email"] = table["email"].str.lower()
    table["name_clean"] = table["customer_name"].str.replace(title, "", regex=True).str.replace(suffix, "", regex=True)
    table["signup_date"] = pd.to_datetime(table["signup_date"], format="%Y-%m-%d")
    return table

def clean_orders(table):
    table = table.copy()
    table["order_date"] = pd.to_datetime(table["order_date"], format="%Y-%m-%d")
    return table

def clean_deliveries(table):
    table = table.copy()
    table["dispatch_date"] = pd.to_datetime(table["dispatch_date"], format="%Y-%m-%d")
    table["delivery_date"] = pd.to_datetime(table["delivery_date"], format="%Y-%m-%d")
    table["delivery_days"] = (table["delivery_date"] - table["dispatch_date"]).dt.days
    return table

customers_clean = clean_customers(customers)
orders_clean = clean_orders(orders)
deliveries_clean = clean_deliveries(deliveries)

print("customers:", customers_clean.shape)
print("orders:", orders_clean.shape)
print("deliveries:", deliveries_clean.shape)
print("order_items kept whole:", len(order_items))
print("Order lines total:", round((order_items["quantity"] * order_items["unit_price"]).sum(), 2))
print("Gmail customers:", customers_clean["email"].str.contains("@gmail.com", na=False).sum())
print("Different names:", customers_clean["name_clean"].nunique())
print("Average delivery days:", round(deliveries_clean["delivery_days"].mean(), 2))
print("signup_date type:", customers_clean["signup_date"].dtype)`
    },
    {
      id: 'py-3-5-c3',
      type: 'check',
      title: 'Why does the cleaned dataset keep all 25,000 order lines, including the 147 repeats?',
      body: `<p>Think back to the finance director’s request in lesson 3.3.</p>`,
      options: [
        'Because deleting rows is not allowed in Pandas',
        'Because the reconciliation proved the repeats were billed, so they are real purchases, and removing them would delete about 9 million of revenue',
        'Because the repeats are too small to matter',
        'Because nobody checked whether they were duplicates'
      ],
      answer: 1,
      why: [
        'Pandas can delete rows easily. We chose to keep them for a reason.',
        'Yes. The payments only matched the order lines when the repeats were included, so they are real. A good cleaning decision is one you can defend with evidence, and you have it.',
        'About 9 million is not small, and size would not be the right reason anyway. Evidence is.',
        'The opposite: we checked carefully, in lesson 3.3, and the evidence said to keep them.'
      ]
    },
    {
      type: 'explain',
      title: 'Module 3 is complete',
      body: `<div class="callout tip"><b>Look at what you can do now.</b> Five lessons ago, a messy table was a mystery. Now you can interrogate any table: find what is missing and understand why, fix types so dates behave like dates, tell real duplicates from look-alikes, tidy text with patterns, and finally <b>prove</b> the result with a validation report that a manager can read. That is what many analysts mean when they say they have “cleaned” a dataset, and far fewer of them can show the proof.</div>
<p>In this lesson you learned to:</p>
<ul>
<li>Check <b>unique keys</b> with <code>.is_unique</code>, and see that a documented failure is still useful</li>
<li>Check <b>ranges and allowed values</b> with <code>.min()</code>, <code>.max()</code>, <code>.between()</code> and <code>.isin()</code>, and turn many True/False values into one verdict with <code>.all()</code> and <code>.any()</code></li>
<li>Find <b>orphans</b> with <code>~child.isin(parent)</code>, and tell them from harmless parents without children</li>
<li>Test <b>business rules</b> across columns and across tables, using <code>.map()</code> as a lookup, like VLOOKUP</li>
<li>Stop a pipeline with <code>assert</code>, or collect every result in a <b>validation report</b></li>
<li>Assemble the cleaned tables with <b>recipe functions</b> that work on a copy, add rather than overwrite when unsure, and keep what you proved real</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is data validation, and what kinds of checks would you run on a new dataset?</li>
<li>What is an orphan record, and why is it dangerous?</li>
<li>One of your validation checks fails. What do you do?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Validation is a set of automated, repeatable checks that prove a dataset is fit for use. I run four families: unique keys, ranges and allowed values, referential integrity between tables, and business rules across columns, such as a delivery never arriving before dispatch. I collect the results in a report with PASS or FAIL and a note, so anyone can see the state of the data.</p>
<p><b>2.</b> An orphan is a child row whose foreign key points to a parent that does not exist, like an order for a customer who is not in the customers table. It is dangerous because it fails silently: when tables are combined, orphan rows drop out of the result, and totals come out too low without any error.</p>
<p><b>3.</b> I first work out whether it is a real problem or a known and explainable one. I size it, with counts and examples, and look for the cause. I do not silently change the data to make the check pass. I report it to the data owner, record it in the validation report with a note, and keep the check so I can see if the number changes later.</p>
</details>
<p><b>Coming next, in Module 4:</b> data transformation. The tables are clean and proven. Now comes the moment you have been working towards: asking business questions. You will build new calculated columns, filter rows with <code>&amp;</code>, <code>|</code> and <code>~</code>, sort, group and summarise, and combine tables properly with <code>merge</code>. The first question on the list is one the CEO asks every quarter: which product category earns the most money?</p>`
    }
  ]
}
);
