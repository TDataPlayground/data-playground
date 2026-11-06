LESSONS.push(
{
  id: 'py-1-6',
  track: 'python',
  lang: 'python',
  packages: [],
  files: [],
  setup: '',
  title: '1.6 Making decisions: if, elif and else',
  tables: [],
  intro: `Remember the data audit you ran in the SQL track? One of the findings was that 460 orders were <b>Cancelled</b> but still had a payment marked <b>Paid</b>. To find them, you wrote a condition: <i>keep the rows where the order is cancelled and the payment is paid.</i><br><br>Now the Head of Data has a new request. <i>“I want a script that looks at one order and tells me what to do with it. If the money looks wrong, flag it. If the order is big, mark it as a large one. Otherwise, leave it alone.”</i><br><br>Until now, Python has done every line you gave it, in order, without any choice. Today it learns to <b>decide</b>. You will teach it to ask a yes-or-no question and then take one road or another, depending on the answer. It is the same thinking you used in SQL’s WHERE and CASE WHEN, with a different spelling.`,
  steps: [
    {
      type: 'explain',
      title: 'Questions that have a yes or no answer',
      body: `<p>Every decision starts with a question that can only be answered <b>yes or no</b>. Is the payment above 300,000? Is the order status Cancelled? In Python the answer to such a question is a <b>bool</b>, a value you met in lesson 1.2: <code>True</code> or <code>False</code>. You ask the question with a <b>comparison sign</b>:</p>
<table class="mini">
<tr><th>Sign</th><th>The question it asks</th><th>Example</th><th>Answer</th></tr>
<tr><td><code>==</code></td><td>is it equal to?</td><td><code>"Paid" == "Paid"</code></td><td>True</td></tr>
<tr><td><code>!=</code></td><td>is it different from?</td><td><code>"Paid" != "Failed"</code></td><td>True</td></tr>
<tr><td><code>&gt;</code></td><td>is it bigger than?</td><td><code>325801.21 &gt; 300000</code></td><td>True</td></tr>
<tr><td><code>&lt;</code></td><td>is it smaller than?</td><td><code>9998.84 &lt; 10000</code></td><td>True</td></tr>
<tr><td><code>&gt;=</code></td><td>is it bigger than or equal to?</td><td><code>100000 &gt;= 100000</code></td><td>True</td></tr>
<tr><td><code>&lt;=</code></td><td>is it smaller than or equal to?</td><td><code>5 &lt;= 4</code></td><td>False</td></tr>
</table>
<div class="callout watch"><b>Two equals signs, not one.</b> In lesson 1.2 you learned that a single <code>=</code> means “put this into that jar”. To ask “are these equal?” you need <b>two</b>: <code>==</code>. Mixing them up is the most common slip in this whole topic. One sign stores. Two signs ask.</div>`
    },
    {
      type: 'try',
      title: 'Asking questions, getting True or False',
      body: `<p>Run it and read the answers one by one. The first three are numbers. The last two are text, and this is where you should pay attention: Python compares text <b>exactly</b>, letter by letter. So <code>"Kenya" == "kenya"</code> is <code>False</code>, because the capital K is a different character from the small k. This is the very reason that cleaning text (lesson 1.3) matters so much before you compare it.</p>`,
      code: `print(325801.21 > 300000)
print(9998.84 > 300000)
print(10000 == 10000)
print("Kenya" == "Kenya")
print("Kenya" == "kenya")`
    },
    {
      id: 'py-1-6-c1',
      type: 'check',
      title: 'What does "Kenya" == "kenya" give?',
      body: `<p>Think about how exactly Python compares text.</p>`,
      options: ['True, because it is the same country', 'False, because the capital letter makes them different', 'An error', 'None'],
      answer: 1,
      why: [
        'We humans see the same country. Python only sees characters, and K and k are different characters.',
        'Yes! Python compares text exactly, capital letters included. To compare fairly, clean both sides first, for example with .lower().',
        'The comparison is perfectly valid. It just answers no.',
        'A comparison always gives True or False, never None.'
      ]
    },
    {
      type: 'explain',
      title: 'The if statement: a door that opens only when the answer is yes',
      body: `<div class="callout analogy"><b>The big idea:</b> picture a door with a sign: “Enter only if the order is large.” A guard checks the order. If the answer is yes, the door opens and the lines behind it run. If the answer is no, the door stays shut and Python walks straight past. That is an <b>if statement</b>.</div>
<p>It has four parts, and every one matters:</p>
<p><code>if amount &gt; 300000:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print("Large order")</code></p>
<ol>
<li>The word <code>if</code>.</li>
<li>The <b>condition</b>, a question with a yes-or-no answer.</li>
<li>A <b>colon</b> <code>:</code> at the end of the line. It means “here comes what to do”. Forgetting it is a very common error.</li>
<li>The lines behind the door, <b>pushed in</b> by four spaces. This pushing-in is called <b>indentation</b>.</li>
</ol>
<p>Indentation is how Python knows <b>which lines belong behind the door</b>. Many other languages use brackets for this. Python uses the spacing itself, which makes code look tidy, but means the spaces are not decoration. Lines pushed in belong to the <code>if</code>. A line that goes back to the left margin is outside, and it runs no matter what.</p>`
    },
    {
      type: 'try',
      title: 'Your first if',
      body: `<p>The payment is 325,801.21, which is above 300,000, so the door opens: you see <b>Large order</b>. The last line is not pushed in, so it is outside the door and always runs: <b>Order checked</b>.</p>
<p>Now change <code>amount</code> to 9998.84 and run it again. This time only “Order checked” appears, because the door stayed shut.</p>`,
      code: `amount = 325801.21

if amount > 300000:
    print("Large order")

print("Order checked")`
    },
    {
      id: 'py-1-6-ex1',
      type: 'exercise',
      title: 'Your turn: flag a large order',
      body: `<p>The jar <code>amount</code> holds <code>325801.21</code>. Write an <code>if</code> that prints <code>Large order</code> when the amount is <b>above 300000</b>. You should see <code>Large order</code>.</p>
<p><b>Think before you type:</b> the word if, the condition, a colon, then the print line pushed in by four spaces. In this platform the Tab key puts in four spaces for you.</p>`,
      starter: `amount = 325801.21\n\n# Write your code below\n`,
      hints: [
        `The shape is: if amount > 300000: (then a new line, four spaces, then the print).`,
        `amount = 325801.21\nif amount > 300000:\n    print("Large order")`
      ],
      solution: `amount = 325801.21\nif amount > 300000:\n    print("Large order")`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'else: what to do when the answer is no',
      body: `<p>An <code>if</code> on its own only handles the “yes” road. If you also want something to happen on the “no” road, add an <code>else</code>. It has no condition, because it simply means “in every other case”. It lines up under the <code>if</code>, ends with a colon, and has its own pushed-in lines.</p>
<p>Exactly one of the two roads runs: never both, never neither.</p>`
    },
    {
      type: 'try',
      title: 'Two roads',
      body: `<p>The payment status is <code>"Pending"</code>, so the question “is it Paid?” gets the answer no, and Python takes the <code>else</code> road: <b>Money not received yet</b>. Change <code>payment_status</code> to <code>"Paid"</code> and run it again to take the other road.</p>`,
      code: `payment_status = "Pending"

if payment_status == "Paid":
    print("Money received")
else:
    print("Money not received yet")`
    },
    {
      id: 'py-1-6-ex2',
      type: 'exercise',
      title: 'Your turn: two roads',
      body: `<p>The jar <code>payment_status</code> holds <code>"Pending"</code>. Write an <code>if</code> and <code>else</code>: if the status is <code>"Paid"</code>, print <code>Money received</code>. Otherwise print <code>Money not received</code>. You should see <code>Money not received</code>.</p>
<p><b>Think before you type:</b> remember the two equals signs for the question, and a colon after both the if line and the else line.</p>`,
      starter: `payment_status = "Pending"\n\n# Write your code below\n`,
      hints: [
        `if payment_status == "Paid": then a pushed-in print. Then else: and another pushed-in print.`,
        `payment_status = "Pending"\nif payment_status == "Paid":\n    print("Money received")\nelse:\n    print("Money not received")`
      ],
      solution: `payment_status = "Pending"\nif payment_status == "Paid":\n    print("Money received")\nelse:\n    print("Money not received")`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'elif: more than two roads',
      body: `<p>Often there are more than two outcomes. TradeFlow wants to label each payment as <b>Large</b>, <b>Medium</b> or <b>Small</b>. For that, put as many <code>elif</code> lines as you need between the <code>if</code> and the <code>else</code>. The word is short for “else, if”.</p>
<p>Python goes down the list from top to bottom and asks each question in turn. The <b>first one that gets a yes</b> wins: its lines run, and Python skips all the others. Does that remind you of anything? It is exactly how <code>CASE WHEN</code> works in SQL, where the first matching rule wins and the order of the rules matters. (In lesson 8.4, the “bouncer with a list” was the same idea.)</p>
<table class="mini">
<tr><th>Amount</th><th>Label</th></tr>
<tr><td>500,000 or more</td><td>Large</td></tr>
<tr><td>100,000 to under 500,000</td><td>Medium</td></tr>
<tr><td>under 100,000</td><td>Small</td></tr>
</table>
<p>Because the first match wins, the <b>most demanding question must come first</b>. You will see why in a moment.</p>`
    },
    {
      type: 'try',
      title: 'Labelling a payment',
      body: `<p>The amount is 115,761.21. Python asks: is it 500,000 or more? No. Is it 100,000 or more? Yes, so it prints <b>Medium</b> and never looks at the <code>else</code>. Change the amount to 600000 (you should see Large) and to 5000 (Small).</p>`,
      code: `amount = 115761.21

if amount >= 500000:
    print("Large")
elif amount >= 100000:
    print("Medium")
else:
    print("Small")`
    },
    {
      id: 'py-1-6-c2',
      type: 'check',
      title: 'The order of the questions matters. What does this print?',
      body: `<p><code>amount = 600000</code><br><code>if amount &gt;= 100000:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print("Medium")</code><br><code>elif amount &gt;= 500000:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print("Large")</code></p>`,
      options: ['Large', 'Medium', 'Both Medium and Large', 'Nothing'],
      answer: 1,
      why: [
        'It would be a sensible answer, but 600000 is also at least 100000, so the first question already says yes, and Python stops there.',
        'Yes! The first condition (100000 or more) is true for 600000, so Python prints Medium and skips the rest. The strictest question must come first.',
        'Only one branch ever runs in an if / elif chain.',
        'The first condition is true, so something does run.'
      ]
    },
    {
      id: 'py-1-6-ex3',
      type: 'exercise',
      title: 'Your turn: three labels',
      body: `<p>The jar <code>amount</code> holds <code>115761.21</code>. Print <code>Large</code> if the amount is 500000 or more, <code>Medium</code> if it is 100000 or more (but below 500000), and <code>Small</code> otherwise. You should see <code>Medium</code>.</p>
<p><b>Think before you type:</b> an <code>if</code>, one <code>elif</code>, and an <code>else</code>, with the strictest question first.</p>`,
      starter: `amount = 115761.21\n\n# Write your code below\n`,
      hints: [
        `Start with if amount >= 500000: then elif amount >= 100000: then else:`,
        `amount = 115761.21\nif amount >= 500000:\n    print("Large")\nelif amount >= 100000:\n    print("Medium")\nelse:\n    print("Small")`
      ],
      solution: `amount = 115761.21\nif amount >= 500000:\n    print("Large")\nelif amount >= 100000:\n    print("Medium")\nelse:\n    print("Small")`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Combining questions: and, or, not',
      body: `<p>Real rules usually combine several facts. Three small words do the combining:</p>
<ul>
<li><code>and</code>: <b>both</b> must be true. “The order is Cancelled <b>and</b> the payment is Paid.”</li>
<li><code>or</code>: <b>at least one</b> must be true. “The payment is Failed <b>or</b> Pending.”</li>
<li><code>not</code>: <b>flips</b> the answer. <code>not True</code> is <code>False</code>.</li>
</ul>
<p>There is also the word <code>in</code>, which you met with lists: it asks “is this value somewhere in that list?” <code>status in ["Completed", "Processing"]</code> is a tidy way to say “the status is one of these two”.</p>
<div class="callout watch"><b>A trap that catches nearly everyone.</b> In English you say “if the status is Completed or Processing”. It is tempting to write <code>status == "Completed" or "Processing"</code>. That looks right and is <b>wrong</b>. Python reads it as two separate questions: “is status equal to Completed?” and then just the bare word <code>"Processing"</code>, which counts as “yes” on its own, because any non-empty text is treated as true. So the whole thing is true for every status. Write the full question each time: <code>status == "Completed" or status == "Processing"</code>, or use <code>in</code> as above.</div>`
    },
    {
      type: 'try',
      title: 'Combining conditions',
      body: `<p>The first line is the audit rule from the SQL track, written in Python. Both parts are true, so you get <code>True</code>. The second line uses <code>or</code>: the status is Failed, which is one of the two, so True. The third line uses <code>in</code>. The fourth line uses <code>not</code>. Then a full decision joins <code>and</code> with <code>in</code>: this order is Completed, but its delivery is still In Transit, so we flag it. (It is the same “Completed but not delivered” finding you counted as 994 in the SQL audit.)</p>`,
      code: `order_status = "Cancelled"
payment_status = "Paid"

print(order_status == "Cancelled" and payment_status == "Paid")
print(payment_status == "Failed" or payment_status == "Pending")
print(payment_status in ["Paid", "Refunded"])
print(not (order_status == "Completed"))

order_status = "Completed"
delivery_status = "In Transit"

if order_status == "Completed" and delivery_status in ["In Transit", "Failed"]:
    print("Flag: completed but not delivered")`
    },
    {
      id: 'py-1-6-c3',
      type: 'check',
      title: 'Which condition correctly means “Completed or Processing”?',
      body: `<p>This is the same definition of “net revenue” you used in the SQL track. You want the condition to be true for exactly these two statuses.</p>`,
      options: ['status == "Completed" or "Processing"', 'status == "Completed" and status == "Processing"', 'status in ["Completed", "Processing"]', 'status = "Completed" or "Processing"'],
      answer: 2,
      why: [
        'The tempting one, and wrong: the bare word "Processing" counts as true all by itself, so this is true for every status.',
        'A status cannot be two different things at once, so this is never true.',
        'Yes! The in test asks exactly what you mean. (Writing status == "Completed" or status == "Processing" in full would also work.)',
        'A single = is the “put into a jar” sign, so this is not a condition. Python would refuse it.'
      ]
    },
    {
      id: 'py-1-6-ex4',
      type: 'exercise',
      title: 'Your turn: money that needs a follow-up',
      body: `<p>The jar <code>payment_status</code> holds <code>"Pending"</code>. Print <code>Follow up</code> if the status is <code>"Failed"</code> <b>or</b> <code>"Pending"</code>. Otherwise print <code>No action</code>. You should see <code>Follow up</code>.</p>
<p><b>Think before you type:</b> write the full question on both sides of the <code>or</code>, to avoid the trap above. Then add an <code>else</code> for the other road.</p>`,
      starter: `payment_status = "Pending"\n\n# Write your code below\n`,
      hints: [
        `if payment_status == "Failed" or payment_status == "Pending": is the condition. Then else:`,
        `payment_status = "Pending"\nif payment_status == "Failed" or payment_status == "Pending":\n    print("Follow up")\nelse:\n    print("No action")`
      ],
      solution: `payment_status = "Pending"\nif payment_status == "Failed" or payment_status == "Pending":\n    print("Follow up")\nelse:\n    print("No action")`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'When the spacing is wrong',
      body: `<p>Because indentation carries meaning, getting it wrong is an error. Two to know:</p>
<ul>
<li><b>IndentationError: expected an indented block.</b> You wrote the <code>if</code> line, but the line after it is not pushed in, so the door has nothing behind it.</li>
<li>A <b>missing colon</b> at the end of the <code>if</code> line gives a SyntaxError that says “expected ':'”.</li>
</ul>
<p>Both are easy to fix once you recognise them. Let’s cause the first one on purpose.</p>`
    },
    {
      type: 'try',
      title: 'An IndentationError',
      body: `<p>Run it. Python tells you it “expected an indented block” after the if on line 2, and it points at line 3 as the culprit. Fix it by pushing the print line in with four spaces (press Tab), then run it again.</p>`,
      code: `amount = 325801.21
if amount > 300000:
print("Large order")`
    },
    {
      id: 'py-1-6-ex5',
      type: 'exercise',
      title: 'Challenge: the audit rule, in Python',
      body: `<p>The jars <code>order_status</code> (<code>"Completed"</code>) and <code>delivery_status</code> (<code>"In Transit"</code>) are in the box. Print <code>Completed but not delivered</code> if the order is Completed <b>and</b> the delivery status is either <code>"In Transit"</code> or <code>"Failed"</code>. Otherwise print <code>Fine</code>. You should see <code>Completed but not delivered</code>.</p>
<p><b>Think before you type:</b> join two questions with <code>and</code>. For the delivery part, the <code>in</code> test with a list is the cleanest way.</p>`,
      starter: `order_status = "Completed"\ndelivery_status = "In Transit"\n\n# Write your code below\n`,
      hints: [
        `The condition has the shape: order_status == "Completed" and delivery_status in [ ... ].`,
        `order_status = "Completed"\ndelivery_status = "In Transit"\nif order_status == "Completed" and delivery_status in ["In Transit", "Failed"]:\n    print("Completed but not delivered")\nelse:\n    print("Fine")`
      ],
      solution: `order_status = "Completed"\ndelivery_status = "In Transit"\nif order_status == "Completed" and delivery_status in ["In Transit", "Failed"]:\n    print("Completed but not delivered")\nelse:\n    print("Fine")`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>Your code can now choose. You can:</p>
<ul>
<li>Ask yes-or-no questions with <code>==</code>, <code>!=</code>, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code> and <code>&lt;=</code>, and never mix up <code>=</code> with <code>==</code></li>
<li>Write <code>if</code>, <code>elif</code> and <code>else</code>, with a colon and <b>four spaces</b> of indentation</li>
<li>Remember that the <b>first matching branch wins</b>, so the strictest question goes first</li>
<li>Combine questions with <code>and</code>, <code>or</code>, <code>not</code> and <code>in</code>, and avoid the “== a or b” trap</li>
<li>Read an <b>IndentationError</b> when it appears</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is the difference between <code>=</code> and <code>==</code>?</li>
<li>In an if / elif / else chain, what happens when two conditions are true?</li>
<li>Why is <code>x == "a" or "b"</code> a bug?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A single equals sign is assignment: it stores a value in a variable. Two equals signs are a comparison: they ask whether two values are equal and give back True or False.</p>
<p><b>2.</b> Only the first true branch runs. Python checks the conditions from top to bottom and stops at the first one that is true, so the order of the conditions matters, and the most specific one should come first.</p>
<p><b>3.</b> Python reads it as <code>(x == "a") or "b"</code>. A non-empty string counts as true, so the expression is true no matter what x is. The correct forms are <code>x == "a" or x == "b"</code>, or <code>x in ["a", "b"]</code>.</p>
</details>
<p><b>Coming next, in lesson 1.7:</b> loops. You can now make one decision about one order. But TradeFlow has 10,000 orders. A loop lets you repeat the same instructions for every item in a list, which is how you turn one decision into ten thousand without typing it ten thousand times.</p>`
    }
  ]
},
{
  id: 'py-1-7',
  track: 'python',
  lang: 'python',
  packages: [],
  files: [],
  setup: '',
  title: '1.7 Loops: doing the same job again and again',
  tables: [],
  intro: `The Head of Data has seen your decision-making code and she likes it. <i>“Now run it on the whole month. There are about 330 orders. Do I need to see 330 copies of your if statement?”</i><br><br>You picture it: the same few lines pasted 330 times, and one tiny change meaning 330 edits. It would be dreadful. She smiles. <i>“This is what computers are for. They do not get bored of repeating things. You write the job <b>once</b>, and tell Python to do it for every item.”</i><br><br>That is a <b>loop</b>, and it may be the single biggest reason people learn to code. Think about a shop cashier. She does not invent a new method for each item. She does the same thing, scan and beep, for every item in the basket, until the basket is empty. A loop is that cashier. By the end of this lesson, you will be able to total up payments, count orders by status, and tally anything, in a handful of lines.`,
  steps: [
    {
      type: 'explain',
      title: 'The for loop: do this for each item',
      body: `<div class="callout analogy"><b>The big idea:</b> imagine a postman with a bag of letters. He takes the first letter, delivers it. Takes the next, delivers it. He repeats the <i>same</i> job for <i>each</i> letter in the bag, and stops when the bag is empty. A <code>for</code> loop is that postman.</div>
<p>It reads almost like English:</p>
<p><code>for country in countries:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print("Welcome to", country)</code></p>
<p><i>“For each country in the list of countries, print a welcome.”</i> There are three things to notice:</p>
<ol>
<li><code>countries</code> is the list you are walking through, the bag of letters.</li>
<li><code>country</code> is a jar that Python <b>fills in for you</b> on every pass. On the first pass it holds the first item, on the second pass the second item, and so on. You can call it anything. A good habit is to name it as the singular of the list: <code>for order in orders</code>.</li>
<li>The colon and the pushed-in lines work exactly as they did in the if statement. <b>Everything indented belongs to the loop</b> and runs once for each item.</li>
</ol>`
    },
    {
      type: 'try',
      title: 'Your first loop',
      body: `<p>Five countries, five lines, and you wrote the print only once. On the first pass <code>country</code> holds <code>"Nigeria"</code>, on the second <code>"Ghana"</code>, and so on, until the list runs out. Add <code>"Egypt"</code> to the list and run it again: the loop handles six countries without any other change. That is the real power: the loop does not care how long the list is.</p>`,
      code: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]

for country in countries:
    print("Welcome to", country)`
    },
    {
      type: 'try',
      title: 'Watching the loop jar change',
      body: `<p>Here the loop does a small calculation on each number. Read the output as a record of the passes: first pass <code>number</code> is 10 (so 20 is printed), second pass it is 20 (so 40), third pass 30 (so 60). The line after the loop is not pushed in, so it runs <b>once</b>, after all the passes are finished.</p>`,
      code: `for number in [10, 20, 30]:
    print(number * 2)

print("Loop finished")`
    },
    {
      id: 'py-1-7-ex1',
      type: 'exercise',
      title: 'Your turn: a greeting for each country',
      body: `<p>The list <code>countries</code> is in the box. Write a loop that prints <code>Welcome to</code> followed by the country, once for each country, so that you get five lines, starting with <code>Welcome to Nigeria</code>.</p>
<p><b>Think before you type:</b> <code>for country in countries:</code> then, pushed in by four spaces, the print line. You can build the message with a comma, as in the example above.</p>`,
      starter: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\n\n# Write your code below\n`,
      hints: [
        `The loop line is for country in countries: and the print line goes underneath, pushed in.`,
        `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\nfor country in countries:\n    print("Welcome to", country)`
      ],
      solution: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\nfor country in countries:\n    print("Welcome to", country)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'range: loops that count',
      body: `<p>Sometimes you do not have a list. You just want to do something a set number of times, or count. For that Python has <code>range()</code>, which makes a sequence of numbers on demand.</p>
<ul>
<li><code>range(5)</code> gives <b>0, 1, 2, 3, 4</b>. Five numbers, starting at 0 and stopping <b>before</b> 5.</li>
<li><code>range(1, 6)</code> gives <b>1, 2, 3, 4, 5</b>. From 1 up to, but not including, 6.</li>
<li><code>range(0, 10, 3)</code> gives <b>0, 3, 6, 9</b>. The third number is the <b>step</b>.</li>
</ul>
<p>The “stop before” rule is the same one you met in slicing, so it should feel familiar. To see what <code>range</code> makes, wrap it in <code>list()</code>.</p>`
    },
    {
      type: 'try',
      title: 'What range produces',
      body: `<p>The first three lines show the sequences. Then a loop uses <code>range(1, 4)</code> to count the first three days of a report. And the last loop brings back the leftover sign from lesson 1.3: <code>number % 3 == 0</code> asks “is the leftover zero when dividing by 3?”, which picks out every third number. A loop plus a decision gives you a filter.</p>`,
      code: `print(list(range(5)))
print(list(range(1, 6)))
print(list(range(0, 10, 3)))

for day in range(1, 4):
    print("Report for day", day)

for number in range(1, 11):
    if number % 3 == 0:
        print(number, "is a multiple of 3")`
    },
    {
      id: 'py-1-7-c1',
      type: 'check',
      title: 'What does this print?',
      body: `<p><code>for i in range(3):</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print(i)</code></p>`,
      options: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '3'],
      answer: 1,
      why: [
        'That would be range(1, 4). A single number in range starts at 0.',
        'Yes! range(3) gives three numbers starting at 0 and stopping before 3: 0, 1, 2.',
        'That is four numbers. range(3) stops before 3.',
        'The loop runs three times, so more than one line is printed.'
      ]
    },
    {
      type: 'explain',
      title: 'The running total: the pattern behind a lot of analysis',
      body: `<p>You already know <code>sum()</code>. So why learn to add things up by hand? Because the same pattern, once you own it, handles all the jobs that <code>sum()</code> cannot: total only the paid orders, count only the large ones, track the biggest so far. It is called an <b>accumulator</b>.</p>
<p>Picture a clipboard with a tally on it. You start the tally at zero. Then you walk through the items, and for each one you update the tally. At the end, you read the clipboard.</p>
<p><code>total = 0</code><br><code>for amount in amounts:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;total = total + amount</code><br><code>print(total)</code></p>
<p>Three things: <b>set the tally before the loop</b> (if you put <code>total = 0</code> inside the loop, it would reset to zero every pass), <b>update it inside the loop</b>, and <b>read it after the loop</b>. Python also has a shorthand, <code>total += amount</code>, which means exactly the same as <code>total = total + amount</code>.</p>`
    },
    {
      type: 'try',
      title: 'Totals and counts, the loop way',
      body: `<p>The first loop adds up the eight payments from lesson 1.4, and gets <b>1553347.2</b>, the same answer <code>sum()</code> gave. The second loop does something <code>sum()</code> cannot do on its own: it counts only the payments above 100,000, by putting an <code>if</code> inside the loop. The answer is <b>6</b>. See how the pieces you learned in the last two lessons now work together.</p>`,
      code: `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]

total = 0
for amount in amounts:
    total += amount
print(round(total, 2))

large_count = 0
for amount in amounts:
    if amount > 100000:
        large_count += 1
print(large_count)`
    },
    {
      id: 'py-1-7-ex2',
      type: 'exercise',
      title: 'Your turn: add them up with a loop',
      body: `<p>The list <code>amounts</code> is in the box. Use a loop with a running total to add up all the amounts, then print the total <b>rounded to 2 decimals</b>. You should see <code>1553347.2</code>.</p>
<p><b>Think before you type:</b> start the tally at 0 before the loop. Inside the loop, add the current amount. After the loop (not pushed in), print.</p>`,
      starter: `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\n\n# Write your code below\n`,
      hints: [
        `Three parts: total = 0, then for amount in amounts: with total += amount inside, then print(round(total, 2)) at the left margin.`,
        `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\ntotal = 0\nfor amount in amounts:\n    total += amount\nprint(round(total, 2))`
      ],
      solution: `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\ntotal = 0\nfor amount in amounts:\n    total += amount\nprint(round(total, 2))`,
      ordered: true
    },
    {
      id: 'py-1-7-ex3',
      type: 'exercise',
      title: 'Your turn: count the small payments',
      body: `<p>Using the same list, count how many payments are <b>below 100000</b>, and print the count. You should see <code>2</code>.</p>
<p><b>Think before you type:</b> this is the counting pattern: a tally at 0, a loop, an <code>if</code> inside the loop, and <code>+= 1</code> inside the if.</p>`,
      starter: `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\n\n# Write your code below\n`,
      hints: [
        `small_count = 0 before the loop. Inside the loop: if amount < 100000: then small_count += 1 pushed in again.`,
        `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\nsmall_count = 0\nfor amount in amounts:\n    if amount < 100000:\n        small_count += 1\nprint(small_count)`
      ],
      solution: `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\nsmall_count = 0\nfor amount in amounts:\n    if amount < 100000:\n        small_count += 1\nprint(small_count)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Looping through a dictionary',
      body: `<p>In lesson 1.5 you met <code>.items()</code> and were promised it would become your best friend. Here is why. A loop over <code>.items()</code> gives you <b>both</b> the key and the value on every pass, and you can name two jars to catch them:</p>
<p><code>for country, customers in customers_by_country.items():</code></p>
<p>On each pass, <code>country</code> holds the label and <code>customers</code> holds the number. That makes reports easy to write.</p>`
    },
    {
      type: 'try',
      title: 'A report from a dictionary',
      body: `<p>First we work out the total (2000, the number of customers in TradeFlow). Then the second loop prints one line per country, with the share of the total as a percentage, formatted with the f-string code <code>:.1%</code> that you learned in lesson 1.3. Nigeria has 400 of 2000 customers, which is 20.0%. Everything here comes from pieces you already own.</p>`,
      code: `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}

total = sum(customers_by_country.values())
print("Total customers:", total)

for country, customers in customers_by_country.items():
    share = customers / total
    print(f"{country}: {customers} customers ({share:.1%})")`
    },
    {
      type: 'explain',
      title: 'The tally sheet: counting with a dictionary',
      body: `<p>Now for the pattern that pays off from lesson 1.5. Say you have a list of order statuses and you want to <b>count how many of each</b>. In SQL that is <code>GROUP BY order_status</code> with a <code>COUNT(*)</code>. In Python, you keep a <b>tally sheet</b>: a dictionary where each key is a status and each value is its count so far.</p>
<p>For every status in the list, you do one line:</p>
<p><code>counts[status] = counts.get(status, 0) + 1</code></p>
<p>Read it right side first, as always: “look up this status in the tally, or use 0 if it is not there yet; add 1; put the result back.” The first time a status appears, <code>.get</code> falls back to 0, so it starts at 1. After that, it counts upwards. This one line is the Python version of GROUP BY and COUNT, and you will use it constantly.</p>`
    },
    {
      type: 'try',
      title: 'Counting order statuses',
      body: `<p>These are the real statuses of TradeFlow’s first twelve orders. The loop walks through them and keeps the tally. The result is <b>{'Completed': 6, 'Cancelled': 2, 'Returned': 2, 'Processing': 2}</b>. Check it against the list by eye: six Completed, and two of each of the rest. Notice the dictionary lists the statuses in the order they first appeared.</p>`,
      code: `statuses = ["Completed", "Cancelled", "Returned", "Completed", "Completed", "Completed",
            "Processing", "Completed", "Processing", "Cancelled", "Returned", "Completed"]

counts = {}
for status in statuses:
    counts[status] = counts.get(status, 0) + 1

print(counts)`
    },
    {
      id: 'py-1-7-ex4',
      type: 'exercise',
      title: 'Your turn: count the payment methods',
      body: `<p>The list <code>methods</code> holds the payment method of six orders. Build a dictionary called <code>counts</code> that holds how many times each method appears, then print it. You should see <code>{'Card': 3, 'Bank Transfer': 2, 'Mobile Money': 1}</code>.</p>
<p><b>Think before you type:</b> start with an empty dictionary <code>counts = {}</code>. Then loop, and use the one-line tally from above. Print at the left margin, after the loop.</p>`,
      starter: `methods = ["Card", "Bank Transfer", "Card", "Mobile Money", "Card", "Bank Transfer"]\n\n# Write your code below\n`,
      hints: [
        `counts = {} first. Then for method in methods: and the line counts[method] = counts.get(method, 0) + 1 pushed in.`,
        `methods = ["Card", "Bank Transfer", "Card", "Mobile Money", "Card", "Bank Transfer"]\ncounts = {}\nfor method in methods:\n    counts[method] = counts.get(method, 0) + 1\nprint(counts)`
      ],
      solution: `methods = ["Card", "Bank Transfer", "Card", "Mobile Money", "Card", "Bank Transfer"]\ncounts = {}\nfor method in methods:\n    counts[method] = counts.get(method, 0) + 1\nprint(counts)`,
      ordered: true
    },
    {
      id: 'py-1-7-c2',
      type: 'check',
      title: 'Where should the line total = 0 go?',
      body: `<p>You are adding up a list of amounts with a loop.</p>`,
      options: ['Inside the loop, as the first line', 'Before the loop', 'After the loop', 'Anywhere, it makes no difference'],
      answer: 1,
      why: [
        'Inside the loop it would reset the tally to zero on every pass, so you would only ever get the last amount.',
        'Yes! The tally has to start once, before the loop. Then the loop adds to it, pass after pass.',
        'The loop would try to add to a jar that does not exist yet, and Python would stop with a NameError.',
        'It makes a big difference. The position decides whether the tally is reset every pass or kept.'
      ]
    },
    {
      type: 'explain',
      title: 'The while loop: keep going until something changes',
      body: `<p>A <code>for</code> loop walks through a list that already exists. A <b>while</b> loop is different: it keeps repeating <b>as long as a condition stays true</b>. You use it when you do not know in advance how many passes you will need.</p>
<p>Remember the warehouse from lesson 1.3? TradeFlow must pack 10,000 orders into boxes of 300. How many boxes? A while loop can act it out: <i>while there are orders left, fill another box, and count it.</i></p>
<div class="callout watch"><b>The danger of while loops.</b> The condition must be able to turn false. Something inside the loop has to change, like the number of orders remaining going down. If nothing changes, the condition stays true forever, and the loop never stops. That is called an <b>infinite loop</b>, and on a real computer it makes the program hang. On this platform, a safety net stops your code after 8 seconds, but in real work you would have to kill the program yourself. So always check: <i>what changes inside my loop, so that it can finish?</i></div>`
    },
    {
      type: 'try',
      title: 'Counting boxes with a while loop',
      body: `<p>Each pass takes 300 orders off the pile and adds one to the box count. When the remaining number reaches 0 or below, the condition <code>remaining &gt; 0</code> turns false, and the loop ends. The answer is <b>34</b>: 33 full boxes plus one last box for the 100 left over. That matches what <code>//</code> and <code>%</code> told you in lesson 1.3 (33 and a remainder of 100), so you can round up by one.</p>`,
      code: `remaining = 10000
boxes = 0

while remaining > 0:
    remaining -= 300
    boxes += 1

print(boxes)`
    },
    {
      type: 'try',
      title: 'A loop that never ends (safely)',
      body: `<p>Here the condition is <code>True</code>, which is always true, and nothing inside can change that. On a normal computer this would hang forever. Here you will see the platform wait about 8 seconds, then stop the loop and show a friendly message. We deliberately have no print inside, so nothing floods the screen. Run it once so you recognise the message when you cause an accidental one.</p>`,
      code: `count = 0
while True:
    count = count + 1`
    },
    {
      id: 'py-1-7-ex5',
      type: 'exercise',
      title: 'Challenge: packing boxes',
      body: `<p>TradeFlow now packs <b>250</b> orders per box, and there are <b>10000</b> orders. Use a <code>while</code> loop to work out how many boxes are needed, and print the number. You should see <code>40</code>.</p>
<p><b>Think before you type:</b> two starting jars: <code>remaining</code> (10000) and <code>boxes</code> (0). Loop while <code>remaining &gt; 0</code>. Inside, take 250 off and add 1 to boxes. Print after the loop.</p>`,
      starter: `remaining = 10000\nboxes = 0\n\n# Write your code below\n`,
      hints: [
        `while remaining > 0: then two pushed-in lines: remaining -= 250 and boxes += 1.`,
        `remaining = 10000\nboxes = 0\nwhile remaining > 0:\n    remaining -= 250\n    boxes += 1\nprint(boxes)`
      ],
      solution: `remaining = 10000\nboxes = 0\nwhile remaining > 0:\n    remaining -= 250\n    boxes += 1\nprint(boxes)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'break and continue: steering a loop',
      body: `<p>Two small words give you control over a loop from the inside:</p>
<ul>
<li><code>break</code> means “stop the whole loop right now.” Useful when you have found what you were looking for.</li>
<li><code>continue</code> means “skip the rest of this pass and go on to the next item.” Useful for skipping items you do not want.</li>
</ul>
<p>Imagine searching for the first payment above 300,000. Once you find it, there is no reason to keep reading the rest of the list. That is a job for <code>break</code>.</p>`
    },
    {
      type: 'try',
      title: 'Stop when you find it',
      body: `<p>The loop walks through the amounts. The first one, 246,702.23, is not above 300,000, so nothing happens. The second is 325,801.21, so it prints “First big payment”, and then <code>break</code> ends the loop. The remaining six amounts are never looked at. Remove the <code>break</code> line and run again to see the difference.</p>`,
      code: `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]

for amount in amounts:
    if amount > 300000:
        print("First big payment:", amount)
        break`
    },
    {
      id: 'py-1-7-c3',
      type: 'check',
      title: 'How many times is the total printed?',
      body: `<p><code>total = 0</code><br><code>for a in [1, 2, 3]:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;total += a</code><br><code>print(total)</code></p>
<p>Look carefully at where the print line sits.</p>`,
      options: ['Three times: 1, 3, 6', 'Once: 6', 'Once: 3', 'It never prints'],
      answer: 1,
      why: [
        'That would happen if the print were pushed in, inside the loop. Here it sits at the left margin, so it is outside.',
        'Yes! The print is not indented, so it runs once, after the loop finishes. By then total has become 1 + 2 + 3 = 6.',
        'The tally keeps adding on every pass, so it ends at 6, not 3.',
        'The print line is valid and runs once the loop is done.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>This lesson turns Python from a calculator into a worker. You can now:</p>
<ul>
<li>Repeat a job for every item with a <b>for loop</b>, and read what the loop jar holds on each pass</li>
<li>Count with <code>range()</code>, remembering that it stops before the last number</li>
<li>Build an <b>accumulator</b>: a tally that starts before the loop, grows inside it, and is read after it</li>
<li>Put an <b>if inside a loop</b> to count or total only the items you care about</li>
<li>Loop through a dictionary with <code>.items()</code>, and keep a <b>tally sheet</b> with <code>counts.get(key, 0) + 1</code> (Python’s GROUP BY and COUNT)</li>
<li>Use a <b>while loop</b> safely, and steer loops with <code>break</code></li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>When would you use a <code>while</code> loop instead of a <code>for</code> loop?</li>
<li>What does <code>range(1, 5)</code> produce?</li>
<li>How would you count how many times each value appears in a list?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A for loop is for walking through a known collection, or doing something a known number of times. A while loop is for repeating until a condition changes, when you cannot say in advance how many passes it will take. A while loop needs something inside it that eventually makes the condition false.</p>
<p><b>2.</b> The numbers 1, 2, 3 and 4. The start is included and the stop value is excluded.</p>
<p><b>3.</b> Create an empty dictionary, loop over the list, and for each value do <code>counts[value] = counts.get(value, 0) + 1</code>. The get call supplies 0 the first time a value appears. (Later, in the standard library, there is a ready-made tool called Counter that does the same, and in Pandas it is value_counts.)</p>
</details>
<p><b>Coming next, in lesson 1.8:</b> professional Python patterns. You can now write loops, but the people who write the best Python write them in a shorter, tidier way. You will meet list comprehensions, <code>enumerate</code>, <code>zip</code> and <code>try</code> / <code>except</code>, the habits that make code look like it was written by a professional.</p>`
    }
  ]
}
);
