LESSONS.push(
{
  id: 'py-1-2',
  track: 'python',
  lang: 'python',
  packages: [],
  files: [],
  setup: '',
  title: '1.2 Variables and data types: giving Python a memory',
  tables: [],
  intro: `The Head of Data looks over your shoulder at yesterday’s practice code. <i>“You typed 10000 in four different places. Now imagine next Monday TradeFlow has 10,214 orders. How many lines do you have to change? And what happens if you miss one?”</i><br><br>You count. Four lines to change, and one of them is easy to forget. She nods. <i>“That is how wrong numbers end up in reports. There is a better way. You write the number down once, give it a name, and from then on you just use the name.”</i><br><br>That idea is called a <b>variable</b>, and it is the most important idea in this whole track. Pandas, charts, automation: all of it stands on variables. We will take it slowly. By the end you will know how to store things, change them, name them well, and understand the four basic kinds of value Python works with. You will also meet your first real data headaches, because TradeFlow’s data likes to arrive as the wrong kind of value.`,
  steps: [
    {
      type: 'explain',
      title: 'The problem with typing the same number again and again',
      body: `<p>Look at this little script. It reports on TradeFlow’s orders in four places.</p>
<p><code>print("Orders:", 10000)</code><br><code>print("Half of orders:", 10000 / 2)</code><br><code>print("Not completed:", 10000 - 7412)</code><br><code>print("Per country:", 10000 / 5)</code></p>
<p>If the number of orders changes, you have to hunt down every 10000 and fix it. Miss one, and your report quietly disagrees with itself. Nobody gets an error message. The report just looks fine and is wrong. That is the worst kind of mistake in analysis.</p>
<p>The fix is simple. Write the number <b>once</b>, put a name on it, and use the name everywhere. Change it in one spot and every line updates by itself.</p>`
    },
    {
      type: 'explain',
      title: 'A variable is a labelled jar',
      body: `<div class="callout analogy"><b>The big idea:</b> think of the jars in a kitchen. One jar has a sticky label that says <i>sugar</i>, and inside is sugar. If you want sugar, you do not describe it, you just say “pass me the sugar jar”. A variable is exactly that: <b>a jar with a label, holding a value</b>. The label is the variable’s name. What is inside is its value.</div>
<p>In Python you make a jar like this:</p>
<p><code>orders = 10000</code></p>
<p>Read it from the right to the left: <i>“put 10000 into a jar labelled orders.”</i> That is all. From now on, whenever Python sees the word <code>orders</code>, it opens the jar and uses what is inside.</p>
<div class="callout watch"><b>Watch out for the equals sign.</b> In maths, <code>=</code> means “is equal to”. In Python, a single <code>=</code> means <b>“put this into that jar”</b>. It is an action, not a statement. So <code>orders = 10000</code> is not a claim about the universe. It is an instruction: store 10000 under the name orders. (Later you will meet <code>==</code>, with two signs, which really does mean “is equal to”.)</div>`
    },
    {
      type: 'try',
      title: 'Your first variable',
      body: `<p>Run it. The first <code>print</code> shows the number inside the jar. The second shows a label next to it. Now look closely at one thing: <b>there are no quotation marks around <code>orders</code></b>. In lesson 1.1, quotation marks meant “this is text”. Without them, Python treats a word as the name of a jar and goes to look inside. That is exactly why <code>print(Hello)</code> gave a NameError last time: there was no jar called Hello.</p>
<p>Change 10000 to 10214 and run it again. One change, and both lines update.</p>`,
      code: `orders = 10000
print(orders)
print("Orders:", orders)`
    },
    {
      type: 'try',
      title: 'Jars can work together',
      body: `<p>Here are two jars, <code>orders</code> and <code>completed</code>. The third line does a calculation with them and puts the answer into a <b>new jar</b>, <code>not_completed</code>. Then we print the new jar and the share of orders that were completed.</p>
<p>This is how real analysis grows. You calculate something, store it, then use it in the next step. Each step is small and easy to check.</p>`,
      code: `orders = 10000
completed = 7412
not_completed = orders - completed
print(not_completed)
print(completed / orders)`
    },
    {
      type: 'explain',
      title: 'Changing what is inside a jar',
      body: `<p>A jar is not sealed forever. You can empty it and put something new in. Just use the same label again:</p>
<p><code>orders = 10000</code><br><code>orders = 10001</code></p>
<p>After the second line, the jar holds 10001. The old value is gone. The label did not change, only the contents.</p>
<p>The most common thing you will do is <b>update a jar using its own contents</b>. A new order arrives, so you want orders to go up by one:</p>
<p><code>orders = orders + 1</code></p>
<p>Many beginners squint at that line and think “a number can’t equal itself plus one!” Remember, <code>=</code> is not maths here. Python does the <b>right side first</b>: it opens the jar, takes out the current number, adds 1. Only then does it put the result back into the jar. Right side first, then store. That order explains every variable line you will ever write.</p>`
    },
    {
      type: 'try',
      title: 'Watch a jar change',
      body: `<p>Three prints, three different answers, and we only ever used one jar. The first print shows 10000. After we put 10001 in, the second print shows 10001. The last line takes the current value and adds one, so the third print shows 10002.</p>`,
      code: `orders = 10000
print(orders)

orders = 10001
print(orders)

orders = orders + 1
print(orders)`
    },
    {
      id: 'py-1-2-c1',
      type: 'check',
      title: 'What does b hold at the end?',
      body: `<p><code>a = 5</code><br><code>b = a</code><br><code>a = 9</code></p>
<p>Think about the jars. When <code>b = a</code> runs, Python opens jar a, looks at what is inside, and puts a copy of it into jar b.</p>`,
      options: ['9, because b follows a', '5, because b took a copy of the value at that moment', 'Nothing, it is an error', 'Both a and b hold 14'],
      answer: 1,
      why: [
        'b does not follow a around. When b = a ran, a held 5, so b received 5. Changing a afterwards does not reach back into b.',
        'Yes! b = a means “take whatever is in jar a right now and put a copy in jar b”. Later, a changes to 9, but b keeps the 5 it already got. The jars are separate.',
        'This is perfectly valid Python. Jars can be filled from other jars.',
        'Nothing in the code adds the two numbers.'
      ]
    },
    {
      id: 'py-1-2-ex1',
      type: 'exercise',
      title: 'Your turn: make a variable and print it',
      body: `<p>Create a variable called <code>customers</code> that holds <code>2000</code>, then print it. Your code should print just the number.</p>
<p><b>Think before you type:</b> two lines. The first puts 2000 into a jar called customers. The second prints the jar. Remember: no quotation marks around the jar name, and none around the number.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `The first line has the shape name = value. The second line is print(name).`,
        `customers = 2000\nprint(customers)`
      ],
      solution: `customers = 2000\nprint(customers)`,
      ordered: true
    },
    {
      id: 'py-1-2-ex2',
      type: 'exercise',
      title: 'Your turn: use two jars to make a third',
      body: `<p>The two jars <code>orders</code> and <code>completed</code> are already in the box below. Add two lines: first, make a new variable called <code>not_completed</code> that holds the orders minus the completed ones. Second, print it. You should see <code>2588</code>.</p>
<p><b>Think before you type:</b> this is the same pattern as the “Jars can work together” example. Right side first: orders minus completed. Then the result goes into the new jar.</p>`,
      starter: `orders = 10000\ncompleted = 7412\n\n# Add your two lines below\n`,
      hints: [
        `The new line looks like not_completed = (one jar) - (the other jar).`,
        `not_completed = orders - completed\nprint(not_completed)`
      ],
      solution: `orders = 10000\ncompleted = 7412\nnot_completed = orders - completed\nprint(not_completed)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Choosing good names',
      body: `<p>You choose the label, so choose one that a stranger could understand. There are a few firm rules, and then a few friendly habits that professionals follow.</p>
<p><b>The rules (break these and Python complains):</b></p>
<ul>
<li>A name can contain letters, digits and underscores. No spaces, no dashes.</li>
<li>It cannot start with a digit. <code>2023_orders</code> is not allowed, <code>orders_2023</code> is.</li>
<li>Capital letters matter. <code>Orders</code> and <code>orders</code> are two different jars. (Misspelling a name by one capital letter is a classic source of NameError.)</li>
<li>Python keeps a few words for itself, such as <code>if</code>, <code>for</code> and <code>True</code>. You cannot use them as names.</li>
</ul>
<p><b>The habits (industry standard, from Python’s official style guide, called PEP 8):</b></p>
<ul>
<li>Write names in <b>lowercase with underscores</b> between words: <code>total_orders</code>, <code>average_order_value</code>. This style is called snake_case.</li>
<li>Make the name <b>say what is inside</b>. <code>total_revenue</code> beats <code>tr</code>, and both beat <code>x</code>. In six months, future you will be grateful.</li>
<li>Do not reuse the names of Python’s own tools. If you write <code>print = 5</code>, you have just thrown away the printer. The same goes for <code>list</code>, <code>sum</code>, <code>max</code> and <code>min</code>.</li>
</ul>
<p>One small kindness for big numbers: Python lets you put underscores inside a number to make it readable. <code>10_000</code> is the same as <code>10000</code>, and <code>1_581_981_450</code> is much easier to read than <code>1581981450</code>.</p>`
    },
    {
      id: 'py-1-2-c2',
      type: 'check',
      title: 'Which variable name is both allowed and well chosen?',
      body: `<p>You want a jar for the number of orders TradeFlow shipped.</p>`,
      options: ['total orders', '2023_orders', 'total_orders', 'x'],
      answer: 2,
      why: [
        'A space splits it into two words, so Python reads it as two names and gets confused. Use an underscore.',
        'A name cannot start with a digit. You could write orders_2023 instead.',
        'Yes! Allowed, lowercase, words joined with underscores, and it says what is inside.',
        'x is allowed, but nobody can tell what it holds. Good names save you from guessing later.'
      ]
    },
    {
      id: 'py-1-2-ex3',
      type: 'exercise',
      title: 'Your turn: update a jar',
      body: `<p>TradeFlow stocks 150 products, and the buyers have just added 10 more. The jar <code>products</code> is already created for you. Add one line that <b>adds 10 to the number inside</b>, then print it. You should see <code>160</code>.</p>
<p><b>Think before you type:</b> remember “right side first”. The line you need has the same shape as <code>orders = orders + 1</code>.</p>`,
      starter: `products = 150\n\n# Add your lines below\n`,
      hints: [
        `You want products = products + 10, then a print line.`,
        `products = 150\nproducts = products + 10\nprint(products)`
      ],
      solution: `products = 150\nproducts = products + 10\nprint(products)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Every value has a type',
      body: `<p>Back in the kitchen: jars come in kinds. You would not pour soup into a flour jar. Python also has kinds of values, and it needs to know which kind it is dealing with, because <b>the same sign can mean different things for different kinds</b>. The kind of a value is called its <b>type</b>.</p>
<p>Python has four basic types you will use all the time:</p>
<table class="mini">
<tr><th>Type</th><th>What it holds</th><th>A TradeFlow example</th></tr>
<tr><td><b>int</b></td><td>Whole numbers</td><td><code>10000</code> orders</td></tr>
<tr><td><b>float</b></td><td>Numbers with a decimal point</td><td><code>24500.50</code> a unit price</td></tr>
<tr><td><b>str</b></td><td>Text (short for “string”)</td><td><code>"Nigeria"</code> a country</td></tr>
<tr><td><b>bool</b></td><td>Yes or no: <code>True</code> or <code>False</code></td><td>Is the order Completed?</td></tr>
</table>
<p>There is also a fifth, special one called <code>None</code>. It means “nothing here”, an empty jar. If you have followed the SQL track, you already know this idea: it is Python’s version of <b>NULL</b>, the blank email you found in 58 customers.</p>
<p>And the thing to remember from SQL Lesson 1.3 still holds: a value can <i>look</i> like one type and secretly be another. <code>2000</code> is a number. <code>"2000"</code> in quotation marks is text that happens to contain digits. They look the same on screen and behave completely differently. A tool called <code>type()</code> tells you which is which.</p>`
    },
    {
      type: 'try',
      title: 'Asking Python for a value’s type',
      body: `<p>Read the answers. <code>int</code>, <code>float</code>, <code>str</code>, <code>bool</code>, and finally <code>NoneType</code>, which is the type of “nothing”. Notice the third line: <code>"2000"</code> prints as <code>str</code>, even though it looks like a number. Python goes by the quotation marks.</p>
<p>Also notice that <code>True</code> and <code>False</code> start with a capital letter. Python is strict about that: <code>true</code> would be a NameError.</p>`,
      code: `print(type(2000))
print(type(24500.50))
print(type("2000"))
print(type("Nigeria"))
print(type(True))
print(type(None))`
    },
    {
      type: 'try',
      title: 'The same sign, two different jobs',
      body: `<p>Both lines use <code>+</code>. With numbers, <code>+</code> adds, so <code>5 + 5</code> is 10. With text, <code>+</code> glues the pieces together, so <code>"5" + "5"</code> is <code>55</code>. Python looks at the types and decides what the sign should do. This is why types matter: a number that is secretly text will quietly give you nonsense.</p>`,
      code: `print(5 + 5)
print("5" + "5")`
    },
    {
      type: 'try',
      title: 'When types clash: TypeError',
      body: `<p>Run it. The jar <code>orders</code> holds the <b>text</b> <code>"10000"</code>, and we ask Python to add the <b>number</b> 1. Python cannot mix them, so it stops with a <b>TypeError</b>. In plain words the message says: “you asked me to glue a number onto some text, and I do not know how.”</p>
<p>This is not a rare accident. In real work, data often arrives as text, even when it looks like numbers. Spreadsheets and CSV files are full of it. You will meet exactly this problem again when we load TradeFlow’s files into Pandas.</p>`,
      code: `orders = "10000"
print(orders + 1)`
    },
    {
      type: 'explain',
      title: 'Converting from one type to another',
      body: `<p>When a value is the wrong type, you convert it. Python gives you one converter for each type, named after the type itself:</p>
<ul>
<li><code>int("10000")</code> turns text into a whole number: <b>10000</b></li>
<li><code>float("24500.50")</code> turns text into a decimal number: <b>24500.5</b></li>
<li><code>str(2000)</code> turns a number into text: <b>"2000"</b></li>
</ul>
<p>Two things worth knowing. The conversion gives you a <b>new</b> value; the original jar is not changed unless you store the result back. And you can only convert something that makes sense: <code>int("hello")</code> fails with a ValueError, because “hello” is not a number in any language.</p>`
    },
    {
      type: 'try',
      title: 'Converting in action',
      body: `<p>Line one fixes the problem from the TypeError example: we convert the text to a number first, then add 1, and get <b>10001</b>. Line two turns text into a decimal. Line three goes the other way: we turn the number 2000 into text so that we can glue the word “customers” after it. (Without <code>str()</code>, the last line would be a TypeError too.)</p>`,
      code: `print(int("10000") + 1)
print(float("24500.50"))
print(str(2000) + " customers")`
    },
    {
      id: 'py-1-2-c3',
      type: 'check',
      title: 'What is the type of "2000"?',
      body: `<p>Look carefully at the quotation marks.</p>`,
      options: ['int', 'float', 'str', 'bool'],
      answer: 2,
      why: [
        'Without quotation marks, 2000 would be an int. With them, Python reads it as text.',
        'A float has a decimal point. This has none, and it is in quotation marks.',
        'Yes! Anything inside quotation marks is a str, even if it is made only of digits.',
        'bool means True or False only.'
      ]
    },
    {
      id: 'py-1-2-ex4',
      type: 'exercise',
      title: 'Your turn: fix the type clash',
      body: `<p>This code gives a TypeError, because <code>orders</code> holds text. Fix it so that it prints <code>10001</code>.</p>
<p><b>Think before you type:</b> run it once and read the message. Then convert the text to a number with <code>int()</code> before adding. You can change the print line, or you can change how the jar is filled.</p>`,
      starter: `orders = "10000"\nprint(orders + 1)\n`,
      hints: [
        `You need the number 10000, not the text. int(orders) turns the text into a whole number.`,
        `orders = "10000"\nprint(int(orders) + 1)`
      ],
      solution: `orders = "10000"\nprint(int(orders) + 1)`,
      ordered: true
    },
    {
      id: 'py-1-2-ex5',
      type: 'exercise',
      title: 'Challenge: a total from two jars',
      body: `<p>A customer buys <b>3</b> units of a product that costs <b>24500.50</b> each. Create a jar called <code>price</code> for the unit price, a jar called <code>quantity</code> for the number of units, and a jar called <code>total</code> that multiplies them. Then print <code>total</code>. You should see <code>73501.5</code>.</p>
<p><b>Think before you type:</b> three jars, then one print. The multiplication sign is <code>*</code>. Python will drop the trailing zero, and print 73501.5.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `price = 24500.50, then quantity = 3, then total = price * quantity.`,
        `price = 24500.50\nquantity = 3\ntotal = price * quantity\nprint(total)`
      ],
      solution: `price = 24500.50\nquantity = 3\ntotal = price * quantity\nprint(total)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>That was a big lesson, and it is the foundation of everything else. You can now:</p>
<ul>
<li>Store a value in a <b>variable</b>, and read the line <code>name = value</code> from right to left</li>
<li><b>Change</b> a variable, and update it using its own contents with <code>orders = orders + 1</code></li>
<li>Choose <b>good names</b> in snake_case, and avoid the traps (no spaces, no leading digit, no borrowed Python words)</li>
<li>Name the four basic <b>types</b> (int, float, str, bool) and the special <code>None</code>, and check them with <code>type()</code></li>
<li>Recognise a <b>TypeError</b>, and fix a mismatch with <code>int()</code>, <code>float()</code> and <code>str()</code></li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is a variable?</li>
<li>What does the line <code>count = count + 1</code> do?</li>
<li>Why does <code>"5" + 5</code> give an error, while <code>"5" + "5"</code> does not?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A variable is a name attached to a value, so the program can store that value and use it again later by name. It works like a labelled jar: the name is the label, the value is what is inside, and you can replace what is inside whenever you like.</p>
<p><b>2.</b> Python works out the right side first: it reads the current value of count and adds 1. Then it stores that result back under the name count. So the variable goes up by one each time the line runs.</p>
<p><b>3.</b> The first line mixes a string and an integer, and Python does not guess how to combine them, so it raises a TypeError. The second line has two strings, and + on two strings means “join them”, so the answer is the string "55".</p>
</details>
<p><b>Coming next, in lesson 1.3:</b> arithmetic and text. How do you work out TradeFlow’s average order value? How do you clean an email address that someone typed in capital letters? Those are the same problems you found in the SQL audit, and now you will solve them in Python.</p>`
    }
  ]
},
{
  id: 'py-1-3',
  track: 'python',
  lang: 'python',
  packages: [],
  files: [],
  setup: '',
  title: '1.3 Arithmetic and text: calculating and cleaning',
  tables: [],
  intro: `Two questions land on your desk on the same morning. TradeFlow’s CEO asks: <i>“What does the average order bring in?”</i> Then the marketing manager says: <i>“Half of these email addresses are in capital letters, and some customer names start with Dr. or Mrs. Can you tidy them before I send the newsletter?”</i><br><br>One question is about numbers. The other is about text. Between them, they cover most of what analysts do in a normal week: calculate things, and clean things. You met both problems in the SQL track, and you solved them with queries. Now you will learn the Python way, and you will see why the habits you built in SQL carry straight over.<br><br>This lesson has two halves. First the calculator: all the arithmetic signs, including two clever ones most beginners never learn. Then the text tools: a small set of commands that fix most messy text in seconds.`,
  steps: [
    {
      type: 'explain',
      title: 'Python’s calculator has a few extra buttons',
      body: `<p>You already know <code>+</code>, <code>-</code>, <code>*</code> and <code>/</code>. Python adds three more that analysts use constantly. Here is the full set, with TradeFlow numbers:</p>
<table class="mini">
<tr><th>Sign</th><th>What it does</th><th>Example</th><th>Answer</th></tr>
<tr><td><code>+</code></td><td>add</td><td><code>7412 + 2588</code></td><td>10000</td></tr>
<tr><td><code>-</code></td><td>subtract</td><td><code>10000 - 7412</code></td><td>2588</td></tr>
<tr><td><code>*</code></td><td>multiply</td><td><code>3 * 24500.5</code></td><td>73501.5</td></tr>
<tr><td><code>/</code></td><td>divide (always gives a decimal)</td><td><code>10000 / 4</code></td><td>2500.0</td></tr>
<tr><td><code>//</code></td><td>divide and keep only the <b>whole</b> part</td><td><code>17 // 5</code></td><td>3</td></tr>
<tr><td><code>%</code></td><td>the <b>leftover</b> after dividing</td><td><code>17 % 5</code></td><td>2</td></tr>
<tr><td><code>**</code></td><td>power</td><td><code>2 ** 10</code></td><td>1024</td></tr>
</table>
<p>Do not be put off by <code>//</code> and <code>%</code>. They have a very ordinary meaning, and the next example will make it click.</p>`
    },
    {
      type: 'explain',
      title: 'Whole boxes and leftovers',
      body: `<div class="callout analogy"><b>The big idea:</b> imagine TradeFlow’s warehouse packing 10,000 orders into delivery boxes, 300 orders to a box. How many boxes are completely full? And how many orders are left over for a last, half-empty box? That is exactly what <code>//</code> and <code>%</code> answer. <code>//</code> counts the <b>full boxes</b>. <code>%</code> tells you the <b>leftover</b>.</div>
<p>Try it with the numbers: 300 goes into 10,000 a total of 33 whole times (33 × 300 = 9,900), and 100 are left over.</p>
<p>The leftover sign, <code>%</code>, has a few jobs that come up in real analysis: finding every 10th row, checking whether a number is even (a leftover of 0 when you divide by 2), and splitting data into equal batches. We will use it again in the loops lesson.</p>`
    },
    {
      type: 'try',
      title: 'Packing orders into boxes',
      body: `<p>The first print gives <b>33</b> full boxes. The second gives <b>100</b> orders left over. Together they tell the whole story: 33 boxes of 300, plus 100 more, makes 10,000. Change <code>batch_size</code> to 250 and run it again to see how the answers move.</p>`,
      code: `orders = 10000
batch_size = 300

print(orders // batch_size)
print(orders % batch_size)`
    },
    {
      id: 'py-1-3-c1',
      type: 'check',
      title: 'What are 17 // 5 and 17 % 5?',
      body: `<p>Think of 17 sweets shared among groups of 5.</p>`,
      options: ['3 and 2', '3.4 and 2', '2 and 3', '5 and 17'],
      answer: 0,
      why: [
        'Yes! 5 goes into 17 three whole times (that is 15), and 2 sweets are left over.',
        '3.4 is what plain 17 / 5 gives. The double slash drops the decimal part and keeps just the 3.',
        'You swapped them. // is the number of whole groups (3), % is the leftover (2).',
        'Those are just the numbers you started from.'
      ]
    },
    {
      id: 'py-1-3-ex1',
      type: 'exercise',
      title: 'Your turn: boxes and leftovers',
      body: `<p>The jars <code>orders</code> (10000) and <code>batch_size</code> (300) are already filled in. Print the number of full batches on one line, then the leftover orders on the next line. You should see <code>33</code> and then <code>100</code>.</p>
<p><b>Think before you type:</b> two print lines. Full batches use <code>//</code>, leftovers use <code>%</code>.</p>`,
      starter: `orders = 10000\nbatch_size = 300\n\n# Add your two print lines below\n`,
      hints: [
        `The first line is print(orders // batch_size). The second uses the other sign.`,
        `orders = 10000\nbatch_size = 300\nprint(orders // batch_size)\nprint(orders % batch_size)`
      ],
      solution: `orders = 10000\nbatch_size = 300\nprint(orders // batch_size)\nprint(orders % batch_size)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Which part gets worked out first?',
      body: `<p>What is <code>10 + 2 * 3</code>? If you go left to right, you get 36. If you do the multiplication first, you get 16. Python follows the same rule as school maths: <b>brackets first, then powers, then multiplication and division, then addition and subtraction</b>. So the answer is 16.</p>
<p>The easiest habit is the safest one: <b>when in doubt, add brackets</b>. They cost nothing, they force the order you meant, and they tell the next reader what you were thinking.</p>`
    },
    {
      type: 'try',
      title: 'Brackets change the answer',
      body: `<p>Same numbers, different brackets, different answers: 16 and 36. Then a real example, the share of orders that are Completed, written as a percentage. We multiply by 100 and then divide by the orders. The result is <b>74.12</b>, meaning 74.12% of orders were completed.</p>`,
      code: `print(10 + 2 * 3)
print((10 + 2) * 3)

completed = 7412
orders = 10000
print(completed * 100 / orders)`
    },
    {
      type: 'explain',
      title: 'The CEO’s question: the average order value',
      body: `<p>Now for the CEO’s question. The <b>average order value</b> is the total money divided by the number of orders. TradeFlow’s payments add up to 1,581,981,450.50, across 10,000 orders. (You calculated both in the SQL track.)</p>
<p>The answer will have a long string of decimals, so we need a tool to tidy it: <code>round(number, places)</code>. It rounds a number to as many decimal places as you ask for. <code>round(3.14159, 2)</code> gives <code>3.14</code>.</p>`
    },
    {
      type: 'try',
      title: 'Average order value',
      body: `<p>The raw answer is <b>158198.14505</b>, with five decimals nobody needs. After <code>round(average, 2)</code>, the CEO gets <b>158198.15</b>, a number with the two decimals of ordinary money. Notice we worked in three small steps: a jar for revenue, a jar for orders, a jar for the average. Each step is easy to read and easy to check.</p>
<p>This matches the average payment you found with SQL. Same data, same answer, different tool.</p>`,
      code: `revenue = 1581981450.5
orders = 10000

average = revenue / orders
print(average)
print(round(average, 2))`
    },
    {
      id: 'py-1-3-ex2',
      type: 'exercise',
      title: 'Your turn: average order value',
      body: `<p>The jars <code>revenue</code> and <code>orders</code> are already filled in. Print the average order value, <b>rounded to 2 decimal places</b>. You should see <code>158198.15</code>.</p>
<p><b>Think before you type:</b> divide first, then round. You can do both inside one print, or use a jar for the average like the example did.</p>`,
      starter: `revenue = 1581981450.5\norders = 10000\n\n# Write your code below\n`,
      hints: [
        `The average is revenue / orders. Wrap it in round( ..., 2 ).`,
        `revenue = 1581981450.5\norders = 10000\nprint(round(revenue / orders, 2))`
      ],
      solution: `revenue = 1581981450.5\norders = 10000\nprint(round(revenue / orders, 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A small surprise: computers and decimals',
      body: `<p>Try this one in your head: what is 0.1 + 0.2? Three-tenths, 0.3, obviously. Now ask Python.</p>`
    },
    {
      type: 'try',
      title: 'Python says 0.1 + 0.2 is not 0.3',
      body: `<p>You will see <b>0.30000000000000004</b>. Python is not broken. Every programming language does this, from Excel to the software that runs banks.</p>
<p>Here is why. People count in tens, so we can write one-tenth exactly as 0.1. Computers count in twos. In their world, 0.1 is like one-third is for us: <b>0.3333...</b> and it never finishes. The computer stores a very close approximation, and when you add two approximations, a tiny error, far out in the seventeenth decimal place, shows up.</p>
<p>What do analysts do? For reports, we <b>round</b> to the places we need, as the second line shows. For serious money work, real systems store whole cents as integers (so 24500.50 becomes 2450050 cents), or use a special exact-decimal tool. For us, the lesson is simple: <b>never be shocked by a tiny error, and always round before you show a number.</b></p>
<p>One more curiosity that surprises people: Python’s <code>round(2.5)</code> gives 2, and <code>round(3.5)</code> gives 4. When a number is exactly halfway, Python rounds to the nearest <i>even</i> number. It is called banker’s rounding, and it keeps large totals fair, because halves go up as often as they go down.</p>`,
      code: `print(0.1 + 0.2)
print(round(0.1 + 0.2, 2))

print(round(2.5))
print(round(3.5))`
    },
    {
      id: 'py-1-3-c2',
      type: 'check',
      title: 'Why is 0.1 + 0.2 not exactly 0.3 in Python?',
      body: `<p>Think about how computers count.</p>`,
      options: ['Python has a bug that nobody has fixed', 'Computers store decimals in base two, where 0.1 cannot be written exactly, so tiny errors appear', 'Python cannot add decimals', 'The numbers are stored as text'],
      answer: 1,
      why: [
        'It is not a bug. Almost every language behaves the same way.',
        'Exactly! Base two cannot write 0.1 exactly, in the same way that base ten cannot write one-third exactly. Rounding before you display a number hides the tiny error.',
        'Python adds decimals perfectly well. The approximation is in how 0.1 is stored.',
        'They are floats, not text.'
      ]
    },
    {
      type: 'explain',
      title: 'Now the other half: text',
      body: `<p>Think about the last time you filled in an online form. Some people type their name in capitals. Some leave a space at the end. Some add a title. A human reading that does not care, but a computer sees <code>"GHANA"</code>, <code>"ghana"</code> and <code>"Ghana "</code> (with a trailing space) as <b>three different countries</b>. Cleaning text is a huge part of an analyst’s job, which is why this is not a side topic.</p>
<p>A piece of text is called a <b>string</b>, and Python treats it as a <b>row of characters</b>, like beads on a thread. Three basic moves:</p>
<ul>
<li><code>+</code> joins two strings: <code>"Trade" + "Flow"</code> gives <code>"TradeFlow"</code></li>
<li><code>*</code> repeats a string: <code>"=" * 20</code> gives a line of twenty equals signs, handy for underlining a title</li>
<li><code>len()</code> counts the characters, spaces included: <code>len("South Africa")</code> is 12</li>
</ul>`
    },
    {
      type: 'try',
      title: 'Joining, repeating and counting',
      body: `<p>Run it. You get <code>TradeFlow</code>, then a line of dashes, then the number 12. Notice that the space in “South Africa” counts as a character, like any other. Count them: S-o-u-t-h (5), the space (1), A-f-r-i-c-a (6). That is 12.</p>`,
      code: `print("Trade" + "Flow")
print("-" * 20)
print(len("South Africa"))`
    },
    {
      type: 'explain',
      title: 'Text tools: methods',
      body: `<p>Strings come with a small toolbox of ready-made fixers. You use a tool by writing the text, then a dot, then the tool’s name with brackets: <code>text.lower()</code>. Read the dot as <i>“and now ask this text to…”</i>. These tools are called <b>methods</b>.</p>
<p>If you wrote SQL, you already know the idea. Here is the translation:</p>
<table class="mini">
<tr><th>Python</th><th>What it does</th><th>SQL cousin</th></tr>
<tr><td><code>text.lower()</code></td><td>all small letters</td><td><code>LOWER(text)</code></td></tr>
<tr><td><code>text.upper()</code></td><td>ALL CAPITALS</td><td><code>UPPER(text)</code></td></tr>
<tr><td><code>text.title()</code></td><td>Capital Letter On Each Word</td><td>(none)</td></tr>
<tr><td><code>text.strip()</code></td><td>removes spaces from both ends</td><td><code>TRIM(text)</code></td></tr>
<tr><td><code>text.replace("old", "new")</code></td><td>swaps one piece for another</td><td><code>REPLACE(text, 'old', 'new')</code></td></tr>
<tr><td><code>text.split(",")</code></td><td>cuts the text into a list of pieces</td><td>(none)</td></tr>
</table>
<div class="callout watch"><b>One important rule:</b> a method never changes the original. It hands you back a <b>new</b> piece of text. If you want to keep the cleaned version, you must store it in a jar. Forgetting this is the number one beginner mistake with strings. (Strings in Python are “immutable”, which is a grand word for “they can’t be edited in place”.)</div>`
    },
    {
      type: 'try',
      title: 'The original does not change',
      body: `<p>Look at the output. The first print is the cleaned text. The second print shows <code>name</code> <b>unchanged</b>, still in capitals, because we never stored the result. The third line fixes it: the cleaned text goes into <code>clean_name</code>.</p>`,
      code: `name = "  EUGENE WALTON "

print(name.strip().title())
print(name)

clean_name = name.strip().title()
print(clean_name)`
    },
    {
      type: 'try',
      title: 'Cleaning real TradeFlow mess',
      body: `<p>These are the problems from the SQL audit, solved in four lines. Customer 27’s email was typed in capitals, so we make it lowercase. “Dr. Steven Martin” has a title we want to remove, so we replace <code>"Dr. "</code> with nothing (an empty pair of quotation marks). A country with stray spaces gets stripped. And one that came in lowercase gets proper capital letters. You can also chain methods, one after another, and read them left to right.</p>`,
      code: `print("EUGENE.WALTON941@GMAIL.COM".lower())
print("Dr. Steven Martin".replace("Dr. ", ""))
print("  Ghana ".strip())
print("south africa".title())`
    },
    {
      id: 'py-1-3-ex3',
      type: 'exercise',
      title: 'Your turn: tidy an email',
      body: `<p>Customer 27’s email is stored in the jar <code>email</code>, in capital letters. Print it in lowercase. You should see <code>eugene.walton941@gmail.com</code>.</p>
<p><b>Think before you type:</b> use the lowercase method on the jar. A method is “jar, dot, method name, brackets”.</p>`,
      starter: `email = "EUGENE.WALTON941@GMAIL.COM"\n\n# Write your code below\n`,
      hints: [
        `The method is called lower, and it needs empty brackets.`,
        `email = "EUGENE.WALTON941@GMAIL.COM"\nprint(email.lower())`
      ],
      solution: `email = "EUGENE.WALTON941@GMAIL.COM"\nprint(email.lower())`,
      ordered: true
    },
    {
      id: 'py-1-3-ex4',
      type: 'exercise',
      title: 'Your turn: remove the title from a name',
      body: `<p>The jar <code>name</code> holds <code>"Dr. Steven Martin"</code>. Print the name <b>without</b> the title, so that you see <code>Steven Martin</code>.</p>
<p><b>Think before you type:</b> replace the piece <code>"Dr. "</code> (with the dot and the space after it) with an empty piece of text <code>""</code>.</p>`,
      starter: `name = "Dr. Steven Martin"\n\n# Write your code below\n`,
      hints: [
        `The method is replace. It needs two things in its brackets: what to find and what to put instead, separated by a comma.`,
        `name = "Dr. Steven Martin"\nprint(name.replace("Dr. ", ""))`
      ],
      solution: `name = "Dr. Steven Martin"\nprint(name.replace("Dr. ", ""))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Picking pieces out of text: slicing',
      body: `<p>Sometimes you need only part of a string, say the first three letters of a country to make a short code. Every character in a string has a <b>position number</b>, and here is the one rule that trips everybody up: <b>counting starts at 0</b>, not 1. Think of a ruler. The very first mark is 0, not 1.</p>
<p>So in <code>"Nigeria"</code>: N is position 0, i is position 1, g is 2, and so on. You pick with square brackets:</p>
<ul>
<li><code>text[0]</code> is the first character, <code>"N"</code></li>
<li><code>text[-1]</code> is the <b>last</b> character, <code>"a"</code>. Negative numbers count from the end.</li>
<li><code>text[0:3]</code> is a <b>slice</b>: from position 0 up to, but <b>not including</b>, position 3. That gives <code>"Nig"</code>.</li>
</ul>
<p>The “up to but not including” part feels odd for a day or two, then it becomes natural. It means <code>text[0:3]</code> has exactly 3 characters, which is 3 minus 0.</p>`
    },
    {
      type: 'try',
      title: 'Slicing a country name',
      body: `<p>You get <code>N</code>, then <code>a</code>, then <code>Nig</code>. Change the slice to <code>[0:4]</code> and run it again to watch it grow by one letter.</p>`,
      code: `country = "Nigeria"
print(country[0])
print(country[-1])
print(country[0:3])`
    },
    {
      id: 'py-1-3-c3',
      type: 'check',
      title: 'What is "Nigeria"[1]?',
      body: `<p>Remember: counting starts at 0.</p>`,
      options: ['"N"', '"i"', '"g"', 'An error'],
      answer: 1,
      why: [
        'N is at position 0, the very first one.',
        'Yes! Position 0 is N, and position 1 is the second letter, i.',
        'g is at position 2.',
        'Position 1 exists, so there is no error.'
      ]
    },
    {
      type: 'explain',
      title: 'Building sentences the professional way: f-strings',
      body: `<p>So far we have built output with commas inside print. That works, but when you write reports, you want full, nicely formatted sentences. The industry-standard tool is the <b>f-string</b>: put the letter <code>f</code> just before the opening quotation mark, then put any jar in curly brackets inside the text. Python swaps each one for its contents.</p>
<p><code>f"{country} has {customers} customers"</code></p>
<p>It reads like the sentence you want, which is the whole point. And f-strings can <b>format numbers</b> as they insert them. You write a colon and a short code after the jar:</p>
<table class="mini">
<tr><th>Code</th><th>What it does</th><th>Example</th><th>Result</th></tr>
<tr><td><code>:,</code></td><td>adds thousand separators</td><td><code>{10000:,}</code></td><td>10,000</td></tr>
<tr><td><code>:.2f</code></td><td>exactly 2 decimals</td><td><code>{73501.5:.2f}</code></td><td>73501.50</td></tr>
<tr><td><code>:,.2f</code></td><td>both together</td><td><code>{1581981450.5:,.2f}</code></td><td>1,581,981,450.50</td></tr>
<tr><td><code>:.1%</code></td><td>turns 0.7412 into a percentage</td><td><code>{0.7412:.1%}</code></td><td>74.1%</td></tr>
</table>
<p>This matters in real life. A finance director reading 1581981450.5 has to count digits. Reading 1,581,981,450.50 takes one second.</p>`
    },
    {
      type: 'try',
      title: 'f-strings in action',
      body: `<p>Three sentences, built from jars. Kenya has 393 customers, and the number slots into the sentence. The revenue is shown with commas and two decimals, and the completion rate shows as a percentage. When a number is shown to a human, format it.</p>`,
      code: `country = "Kenya"
customers = 393
revenue = 1581981450.5
rate = 0.7412

print(f"{country} has {customers} customers")
print(f"Total revenue: {revenue:,.2f}")
print(f"Completion rate: {rate:.1%}")`
    },
    {
      id: 'py-1-3-ex5',
      type: 'exercise',
      title: 'Challenge: a report line for the CEO',
      body: `<p>The jar <code>revenue</code> holds <code>1581981450.5</code>. Print this exact line, using an f-string with thousand separators and two decimals:</p>
<p><code>Total revenue: 1,581,981,450.50</code></p>
<p><b>Think before you type:</b> start with <code>f"</code>, write <code>Total revenue: </code>, then the jar in curly brackets with the formatting code <code>:,.2f</code> after its name.</p>`,
      starter: `revenue = 1581981450.5\n\n# Write your code below\n`,
      hints: [
        `The shape is print(f"Total revenue: {revenue:...}"). The code after the colon is a comma, a dot, 2 and f.`,
        `revenue = 1581981450.5\nprint(f"Total revenue: {revenue:,.2f}")`
      ],
      solution: `revenue = 1581981450.5\nprint(f"Total revenue: {revenue:,.2f}")`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You now have both halves of everyday analysis. You can:</p>
<ul>
<li>Use all seven <b>arithmetic signs</b>, including <code>//</code> for whole boxes and <code>%</code> for leftovers, and control the order with brackets</li>
<li>Work out an <b>average</b> and tidy it with <code>round()</code></li>
<li>Explain why <b>0.1 + 0.2</b> looks odd, and what analysts do about it</li>
<li>Join, repeat and measure text, and clean it with <b>methods</b> such as <code>lower()</code>, <code>strip()</code> and <code>replace()</code></li>
<li>Pick pieces with <b>slicing</b>, remembering that counting starts at 0</li>
<li>Build clear, formatted report lines with <b>f-strings</b></li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is the difference between <code>/</code> and <code>//</code>?</li>
<li>Why does Python say <code>0.1 + 0.2</code> is 0.30000000000000004?</li>
<li>You call <code>name.strip()</code> but the original text is unchanged. Why?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> The single slash is normal division and always returns a decimal, so 17 / 5 is 3.4. The double slash is floor division: it drops the fractional part and returns only the whole number of times the divisor fits, so 17 // 5 is 3.</p>
<p><b>2.</b> Computers store decimal numbers in binary, and many everyday decimals, such as 0.1, have no exact binary form. The stored value is a very close approximation, and adding two approximations leaves a tiny error. It is normal in every language, and for reports you round the result.</p>
<p><b>3.</b> Strings are immutable: they cannot be edited in place. Methods return a new string and leave the original alone. To keep the cleaned version, store it in a variable, for example clean_name = name.strip().</p>
</details>
<p><b>Coming next, in lesson 1.4:</b> lists. So far each jar holds one value. But TradeFlow has 10,000 orders, and a column of prices, and a set of countries. How do you keep a whole collection in a single jar, and pick things out of it? That is the doorway to working with real data.</p>`
    }
  ]
}
);
