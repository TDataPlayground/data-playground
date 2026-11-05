LESSONS.push(
{
  id: 'py-1-4',
  track: 'python',
  lang: 'python',
  packages: [],
  files: [],
  setup: '',
  title: '1.4 Lists: keeping many things in one jar',
  tables: [],
  intro: `The Head of Data asks you a small question. <i>“TradeFlow sells in five countries. If you wanted to store all five country names in jars, how many jars would you need?”</i><br><br>Five, you say. <i>“And if I asked you to store all 10,000 order amounts?”</i><br><br>You laugh. Ten thousand jars, each with its own name? Nobody could keep track of that. And you would have to write ten thousand lines just to set them up. She smiles. <i>“Right. So what we need is one jar that can hold many things, in order. Python has exactly that, and it is called a list.”</i><br><br>Lists are everywhere in data work. A column of prices is a list. A set of customer names is a list. When you meet Pandas later, you will see that it is built from this very idea. So we will go slowly, and we will use real TradeFlow numbers throughout.`,
  steps: [
    {
      type: 'explain',
      title: 'One jar, many things',
      body: `<div class="callout analogy"><b>The big idea:</b> picture a shelf in TradeFlow’s warehouse, with a row of numbered slots. Each slot holds one item, and the slots are numbered in order: 0, 1, 2, 3 and so on. You do not need a separate name for every slot. You name the <b>whole shelf</b> once, and then say which slot you want. A Python list is that shelf.</div>
<p>You build one with square brackets, putting the items inside and separating them with commas:</p>
<p><code>countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]</code></p>
<p>That is one jar, called <code>countries</code>, holding five pieces of text. The items stay in the order you gave them. And a list can hold any kind of value: text, numbers, even other lists. In data work you will most often see a list where every item is the same kind of thing, such as a list of prices.</p>`
    },
    {
      type: 'try',
      title: 'Your first list',
      body: `<p>Run it. The first line prints the whole list, square brackets and all. The second tells you how many items it holds, using <code>len()</code>, which you met with text in lesson 1.3. The third confirms that Python calls this kind of thing a <code>list</code>.</p>
<p>Add a sixth country to the list, such as <code>"Egypt"</code>, and run it again. The count updates by itself.</p>`,
      code: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]
print(countries)
print(len(countries))
print(type(countries))`
    },
    {
      type: 'explain',
      title: 'Picking items out of a list',
      body: `<p>If you did lesson 1.3, you already know how this works, because lists and text use the same rules. Each slot has a position number, and <b>counting starts at 0</b>. Square brackets pick things out:</p>
<ul>
<li><code>countries[0]</code> is the first item, <code>"Nigeria"</code></li>
<li><code>countries[2]</code> is the third item, <code>"Kenya"</code></li>
<li><code>countries[-1]</code> is the <b>last</b> item, <code>"Rwanda"</code>. Negative numbers count from the end, which is handy when you do not know how long the list is.</li>
<li><code>countries[1:3]</code> is a <b>slice</b>: from position 1 up to, but not including, position 3. You get a smaller list, <code>["Ghana", "Kenya"]</code>.</li>
</ul>
<p>Leaving out a number in a slice means “from the very start” or “to the very end”. So <code>countries[:2]</code> is the first two, and <code>countries[2:]</code> is everything from position 2 onwards.</p>`
    },
    {
      type: 'try',
      title: 'Indexing and slicing',
      body: `<p>Read each answer against the picture of the shelf. Position 0 is Nigeria, position 2 is Kenya, and the last slot is Rwanda. The slices give you smaller lists. Try a few of your own: what do you think <code>countries[3:]</code> gives? Run it and check your guess.</p>`,
      code: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]
print(countries[0])
print(countries[2])
print(countries[-1])
print(countries[1:3])
print(countries[:2])
print(countries[2:])`
    },
    {
      id: 'py-1-4-c1',
      type: 'check',
      title: 'What does shelf[1] give?',
      body: `<p><code>shelf = [10, 20, 30, 40]</code></p>
<p>Remember where the counting starts.</p>`,
      options: ['10', '20', '30', 'An error'],
      answer: 1,
      why: [
        '10 is at position 0, the very first slot.',
        'Yes! Position 0 holds 10, so position 1 holds 20.',
        '30 is at position 2.',
        'Position 1 exists in this list, so there is no error.'
      ]
    },
    {
      id: 'py-1-4-ex1',
      type: 'exercise',
      title: 'Your turn: build a list',
      body: `<p>Make a list called <code>countries</code> holding TradeFlow’s five countries, in this order: Nigeria, Ghana, Kenya, South Africa, Rwanda. Then print the whole list. You should see <code>['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Rwanda']</code>.</p>
<p><b>Think before you type:</b> square brackets, text in quotation marks, commas between items. Python will print the quotation marks as single quotes, and that is fine.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `The shape is countries = ["...", "...", ...] on one line, then print(countries).`,
        `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\nprint(countries)`
      ],
      solution: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\nprint(countries)`,
      ordered: true
    },
    {
      id: 'py-1-4-ex2',
      type: 'exercise',
      title: 'Your turn: the first and the last',
      body: `<p>The list <code>countries</code> is already in the box. Print its <b>first</b> item on one line and its <b>last</b> item on the next. You should see <code>Nigeria</code> and then <code>Rwanda</code>.</p>
<p><b>Think before you type:</b> the first item is at position 0. For the last one, a negative position is the easy way.</p>`,
      starter: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\n\n# Write your code below\n`,
      hints: [
        `Two print lines: print(countries[...]) with a different position in each.`,
        `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\nprint(countries[0])\nprint(countries[-1])`
      ],
      solution: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\nprint(countries[0])\nprint(countries[-1])`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Lists can change',
      body: `<p>Here is a real difference from text. In lesson 1.3 you learned that a string cannot be edited in place. A list <b>can</b>. You can swap an item, add one, take one out. The word for this is <b>mutable</b>, which just means “changeable”.</p>
<table class="mini">
<tr><th>What you want</th><th>How you write it</th></tr>
<tr><td>Replace the item in a slot</td><td><code>countries[1] = "Ivory Coast"</code></td></tr>
<tr><td>Add an item at the end</td><td><code>countries.append("Egypt")</code></td></tr>
<tr><td>Add an item at a chosen position</td><td><code>countries.insert(0, "Egypt")</code></td></tr>
<tr><td>Remove an item by its value</td><td><code>countries.remove("Ghana")</code></td></tr>
<tr><td>Take out the last item (and get it back)</td><td><code>countries.pop()</code></td></tr>
<tr><td>Check whether something is in the list</td><td><code>"Kenya" in countries</code></td></tr>
<tr><td>Join two lists into one</td><td><code>["Egypt"] + ["Mali"]</code></td></tr>
<tr><td>Find the position of an item</td><td><code>countries.index("Kenya")</code></td></tr>
<tr><td>Count how many times an item appears</td><td><code>countries.count("Kenya")</code></td></tr>
</table>
<p>Two small things to know. <code>remove</code> takes out only the <b>first</b> match, and it fails with an error if the value is not there, so check with <code>in</code> first when you are not sure. And these changes happen <b>to the list itself</b>, with no need to store the result in a new jar.</p>
<p>One more thing worth knowing: a list keeps <b>duplicates</b>. If you add <code>"Kenya"</code> twice, it sits in two slots, and <code>.count("Kenya")</code> says 2. That is exactly what you want when the list is a column of order amounts, where the same amount can honestly appear more than once.</p>`
    },
    {
      type: 'try',
      title: 'Changing a list',
      body: `<p>After each change, we print the list so that you can see the effect. Rwanda is added at the end, Ghana is removed, the first slot is swapped for Egypt, and <code>in</code> answers a yes-or-no question with <code>True</code> or <code>False</code>. Notice that we never wrote <code>countries = ...</code> after the first line. The list changed in place.</p>`,
      code: `countries = ["Nigeria", "Ghana", "Kenya"]

countries.append("Rwanda")
print(countries)

countries.remove("Ghana")
print(countries)

countries[0] = "Egypt"
print(countries)

print("Kenya" in countries)
print("Ghana" in countries)`
    },
    {
      id: 'py-1-4-ex3',
      type: 'exercise',
      title: 'Your turn: add and remove',
      body: `<p>TradeFlow stops trading in Ghana and starts trading in Egypt. The list <code>countries</code> is in the box. Remove <code>"Ghana"</code>, add <code>"Egypt"</code> at the end, then print the list. You should see <code>['Nigeria', 'Kenya', 'South Africa', 'Rwanda', 'Egypt']</code>.</p>
<p><b>Think before you type:</b> two methods, then a print. Both methods change the list directly.</p>`,
      starter: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\n\n# Write your code below\n`,
      hints: [
        `Use countries.remove(...) and countries.append(...), each with the text in quotation marks.`,
        `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\ncountries.remove("Ghana")\ncountries.append("Egypt")\nprint(countries)`
      ],
      solution: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\ncountries.remove("Ghana")\ncountries.append("Egypt")\nprint(countries)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Lists of numbers: your first real analysis',
      body: `<p>Now for what analysts do all day: work with columns of numbers. Python has ready-made tools for a list of numbers, and you only need to know five:</p>
<table class="mini">
<tr><th>Tool</th><th>What you get</th></tr>
<tr><td><code>len(amounts)</code></td><td>how many numbers</td></tr>
<tr><td><code>sum(amounts)</code></td><td>the total</td></tr>
<tr><td><code>max(amounts)</code></td><td>the biggest</td></tr>
<tr><td><code>min(amounts)</code></td><td>the smallest</td></tr>
<tr><td><code>sorted(amounts)</code></td><td>a new list, in order from smallest to biggest</td></tr>
</table>
<p>And with just <code>sum</code> and <code>len</code> you can work out an <b>average</b>: the total divided by the count. Let’s do it on real data. These are the first eight payments in TradeFlow’s payments table, the same ones you would see with <code>SELECT amount FROM payments LIMIT 8</code> in SQL.</p>`
    },
    {
      type: 'try',
      title: 'Total, biggest, smallest and average',
      body: `<p>Four lines of analysis. The eight payments add up to <b>1553347.2</b>, the biggest is <b>505665.9</b> (payment 8), the smallest is <b>9998.84</b> (payment 3), and the average comes to <b>194168.4</b>. Notice how readable it is: <code>sum(amounts) / len(amounts)</code> says “the total divided by how many”, exactly as you would say it aloud.</p>`,
      code: `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]

print(round(sum(amounts), 2))
print(max(amounts))
print(min(amounts))
print(round(sum(amounts) / len(amounts), 2))`
    },
    {
      id: 'py-1-4-ex4',
      type: 'exercise',
      title: 'Your turn: a mini report',
      body: `<p>The list <code>amounts</code> is in the box. Print three lines: the <b>total</b> (rounded to 2 decimals), the <b>biggest</b> amount, and the <b>average</b> (rounded to 2 decimals). You should see <code>1553347.2</code>, then <code>505665.9</code>, then <code>194168.4</code>.</p>
<p><b>Think before you type:</b> <code>sum</code> for the total, <code>max</code> for the biggest, and <code>sum</code> divided by <code>len</code> for the average. Wrap the total and the average in <code>round( ..., 2 )</code>.</p>`,
      starter: `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\n\n# Write your code below\n`,
      hints: [
        `Three print lines. The first is print(round(sum(amounts), 2)).`,
        `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\nprint(round(sum(amounts), 2))\nprint(max(amounts))\nprint(round(sum(amounts) / len(amounts), 2))`
      ],
      solution: `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\nprint(round(sum(amounts), 2))\nprint(max(amounts))\nprint(round(sum(amounts) / len(amounts), 2))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Sorting, and a trap that catches everyone once',
      body: `<p>There are two ways to sort a list, and they behave differently.</p>
<ul>
<li><code>sorted(amounts)</code> hands you a <b>new</b> sorted list and leaves the original alone.</li>
<li><code>amounts.sort()</code> sorts the <b>original list itself</b>, and hands back nothing at all.</li>
</ul>
<p>That last part is the trap. Because <code>.sort()</code> returns nothing (Python’s <code>None</code>, the “empty jar” from lesson 1.2), writing <code>top = amounts.sort()</code> puts <b>nothing</b> into <code>top</code>. Almost everybody does this once, then stares at <code>None</code> wondering where their list went. Now you know.</p>
<p>To sort from biggest to smallest, add <code>reverse=True</code>: <code>sorted(amounts, reverse=True)</code>.</p>`
    },
    {
      type: 'try',
      title: 'sorted() versus .sort()',
      body: `<p>The first print shows a sorted copy, and the original is untouched in the second print. Then <code>amounts.sort()</code> sorts the list itself, so the third print shows the original, now in order. The last line shows the trap: <code>oops</code> is <code>None</code>. The sorting happened to <code>amounts</code>, and <code>oops</code> received nothing.</p>`,
      code: `amounts = [30, 10, 20]

print(sorted(amounts))
print(amounts)

amounts.sort()
print(amounts)

oops = [3, 1, 2].sort()
print(oops)`
    },
    {
      id: 'py-1-4-c2',
      type: 'check',
      title: 'What does x hold after this line?',
      body: `<p><code>x = [3, 1, 2].sort()</code></p>
<p>Remember what .sort() hands back.</p>`,
      options: ['[1, 2, 3]', '[3, 1, 2]', 'None', 'An error'],
      answer: 2,
      why: [
        'That is what sorted([3, 1, 2]) would give. The .sort() method sorts the list itself and returns nothing.',
        'The list is not stored anywhere, and .sort() does not hand it back.',
        'Yes! .sort() changes the list in place and returns None, so x is None. Use sorted(...) when you want the sorted list back.',
        'The code is valid. It just does not do what a beginner expects.'
      ]
    },
    {
      id: 'py-1-4-ex5',
      type: 'exercise',
      title: 'Challenge: the top three payments',
      body: `<p>The list <code>amounts</code> is in the box. Print the <b>three biggest</b> amounts as a list, with the biggest first. You should see <code>[505665.9, 325801.21, 246702.23]</code>.</p>
<p><b>Think before you type:</b> two tools you just learned work together. Sort the list from biggest to smallest, then take a slice of the first three items.</p>`,
      starter: `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\n\n# Write your code below\n`,
      hints: [
        `sorted(amounts, reverse=True) gives the list from biggest to smallest.`,
        `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\nprint(sorted(amounts, reverse=True)[:3])`
      ],
      solution: `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\nprint(sorted(amounts, reverse=True)[:3])`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A surprise about copying lists',
      body: `<p>Back in lesson 1.2, you saw that <code>b = a</code> made a copy of the number. Lists behave differently, and here is the honest picture. A jar holding a small thing like a number holds the thing itself. But a list can be big, so Python does something smarter: the jar holds a <b>sticky note that points to the shelf</b>. When you write <code>b = a</code> with lists, Python copies the sticky note, not the shelf. Now you have <b>two labels pointing at the same shelf</b>.</p>
<p>That means a change made through one label shows up through the other. Surprising the first time, and a real source of bugs in data code. If you want a true, independent copy, ask for one: <code>a.copy()</code>.</p>`
    },
    {
      type: 'try',
      title: 'Two labels, one shelf',
      body: `<p>First we write <code>b = a</code>, then add 4 through the label <code>b</code>. Printing <code>a</code> shows the 4 too, because <code>a</code> and <code>b</code> are the same list. Then we make <code>c = a.copy()</code>, a true copy. Adding 99 to <code>c</code> does not touch <code>a</code>. The last two prints show the difference.</p>`,
      code: `a = [1, 2, 3]
b = a
b.append(4)
print(a)

c = a.copy()
c.append(99)
print(a)
print(c)`
    },
    {
      id: 'py-1-4-c3',
      type: 'check',
      title: 'What does this print?',
      body: `<p><code>a = [1, 2]</code><br><code>b = a</code><br><code>b.append(3)</code><br><code>print(a)</code></p>`,
      options: ['[1, 2]', '[1, 2, 3]', '[3]', 'An error'],
      answer: 1,
      why: [
        'That would be right for numbers, but a and b are two labels on the same list, so the change shows through both.',
        'Yes! b = a does not copy the list, it adds a second label to it. Appending through b changes the one shared list, which a also points to.',
        'The list was not replaced. It only grew.',
        'This is valid Python.'
      ]
    },
    {
      type: 'explain',
      title: 'A table is a list of lists',
      body: `<p>Items in a list can be lists too. And that gives you a way to hold a whole <b>table</b>: each row is a small list, and the table is a list of rows. The first two TradeFlow payments, with their ids and amounts, look like this:</p>
<p><code>rows = [[1, 246702.23], [2, 325801.21]]</code></p>
<p>To reach one cell you use <b>two positions</b>: first the row, then the item inside it. <code>rows[1][0]</code> means “row 1, item 0”, which is the id <code>2</code>. This is how a spreadsheet looks to Python: rows inside a list, cells inside each row. When you meet Pandas, you will find a friendlier box wrapped around exactly this idea.</p>`
    },
    {
      type: 'try',
      title: 'Reaching into a list of lists',
      body: `<p>Four payments as a table. <code>rows[0]</code> is a whole row. <code>rows[0][1]</code> is one cell: the amount in the first row. <code>rows[-1][0]</code> is the id in the last row. And <code>len(rows)</code> counts the rows. Change a position and watch a different cell appear.</p>`,
      code: `rows = [[1, 246702.23], [2, 325801.21], [3, 9998.84], [4, 115761.21]]

print(rows[0])
print(rows[0][1])
print(rows[-1][0])
print(len(rows))`
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>One new type of jar, and a lot more power. You can now:</p>
<ul>
<li>Build a <b>list</b> and read its items by <b>position</b>, counting from 0, with negative positions and slices</li>
<li><b>Change</b> a list with <code>append</code>, <code>insert</code>, <code>remove</code> and <code>pop</code>, and test membership with <code>in</code></li>
<li>Analyse a list of numbers with <code>len</code>, <code>sum</code>, <code>max</code>, <code>min</code> and <code>sorted</code>, and build an average</li>
<li>Avoid the <b>two classic traps</b>: <code>.sort()</code> returning nothing, and <code>b = a</code> sharing one list between two labels</li>
<li>Hold a <b>table</b> as a list of lists, and reach any cell with two positions</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is the difference between a list and a string?</li>
<li>What is the difference between <code>sorted(x)</code> and <code>x.sort()</code>?</li>
<li>If <code>b = a</code> and a is a list, what happens when you change b?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Both are ordered sequences you can index and slice. A string holds only characters and is immutable, so you cannot change it in place. A list can hold any mix of values and is mutable, so you can add, remove and replace items directly.</p>
<p><b>2.</b> <code>sorted(x)</code> returns a new sorted list and leaves x alone. <code>x.sort()</code> sorts x itself and returns None, so it should not be assigned to a variable.</p>
<p><b>3.</b> Assignment does not copy a list, it makes a second name for the same list object. So a change made through b is visible through a. To get an independent copy, use <code>a.copy()</code> or <code>list(a)</code>.</p>
</details>
<p><b>Coming next, in lesson 1.5:</b> dictionaries. A list answers “what is in slot 2?” But a manager asks “how many customers do we have in Kenya?” What you want is to look things up by name instead of by position. That is what a dictionary does, and it is the shape most real-world data arrives in.</p>`
    }
  ]
},
{
  id: 'py-1-5',
  track: 'python',
  lang: 'python',
  packages: [],
  files: [],
  setup: '',
  title: '1.5 Dictionaries: looking things up by name',
  tables: [],
  intro: `The CEO sends you a one-line message: <i>“How many customers do we have in Kenya?”</i><br><br>You already have the numbers stored in a list: <code>[400, 391, 393, 378, 438]</code>. But which one is Kenya? You have to remember that the countries are in the order Nigeria, Ghana, Kenya, South Africa, Rwanda, and that Kenya is the third one, which means position 2. That works for five numbers. It falls apart for fifty, and it is a mistake waiting to happen at any size.<br><br>What you want is to ask <b>by name</b>: “Kenya, how many?” Python has a tool for exactly that. It is called a <b>dictionary</b>, and it may well be the most useful structure in the whole language for analysts. Most data that travels around the internet arrives in this shape, so by the end of this lesson you will be able to read it.`,
  steps: [
    {
      type: 'explain',
      title: 'Look it up by name',
      body: `<div class="callout analogy"><b>The big idea:</b> think of a filing cabinet where every drawer has a label. You do not say “open the third drawer”. You say “open the drawer marked Kenya”, and inside you find the answer. Or think of the contacts in your phone: you look up a <i>name</i> and get a <i>number</i>. A dictionary is exactly that. Each entry has a <b>key</b> (the label on the drawer) and a <b>value</b> (what is inside).</div>
<p>You write a dictionary with curly brackets. Each entry is <code>key: value</code>, and entries are separated by commas:</p>
<p><code>customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}</code></p>
<p>To look something up, use square brackets with the <b>key</b> inside: <code>customers_by_country["Kenya"]</code> gives <code>393</code>. No counting positions, no remembering any order. Just ask by name.</p>
<p>One rule: <b>every key must be different</b>. You cannot have two drawers both labelled Kenya. The values can be anything, and they can repeat as much as they like.</p>`
    },
    {
      type: 'try',
      title: 'Your first dictionary',
      body: `<p>Run it. We look up Kenya (393) and Rwanda (438) by name, and count the entries with <code>len()</code>, which counts the keys. Notice that the order of the entries does not matter for looking things up. Try replacing <code>"Kenya"</code> with <code>"Ghana"</code> and see what comes back.</p>`,
      code: `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}

print(customers_by_country["Kenya"])
print(customers_by_country["Rwanda"])
print(len(customers_by_country))`
    },
    {
      type: 'explain',
      title: 'Adding, changing and removing entries',
      body: `<p>Dictionaries can change, just like lists. And the same square-bracket notation does most of the work:</p>
<table class="mini">
<tr><th>What you want</th><th>How you write it</th></tr>
<tr><td>Add a new entry</td><td><code>customers_by_country["Egypt"] = 0</code></td></tr>
<tr><td>Change an existing value</td><td><code>customers_by_country["Nigeria"] = 401</code></td></tr>
<tr><td>Remove an entry</td><td><code>customers_by_country.pop("Egypt")</code></td></tr>
<tr><td>Check whether a key exists</td><td><code>"Kenya" in customers_by_country</code></td></tr>
<tr><td>Merge in several entries at once</td><td><code>customers_by_country.update({"Egypt": 0, "Mali": 3})</code></td></tr>
</table>
<p>Adding and changing are the <b>same line</b>. If the key is already there, its value is replaced. If it is new, a new drawer is created. Python works it out for you. And notice that <code>in</code> checks the <b>keys</b>, the labels, not the values inside.</p>
<p>One reminder from the list lesson: dictionaries also work with the <b>sticky-note rule</b>. Writing <code>b = a</code> does not copy the dictionary, it puts a second label on the same one. When you need an independent copy, use <code>a.copy()</code>.</p>`
    },
    {
      type: 'try',
      title: 'Changing a dictionary',
      body: `<p>We add Egypt with 0 customers, then a new customer signs up in Nigeria, so we change 400 to 401. We check which keys exist, then remove Egypt again. After every step we print the dictionary so you can watch it change. Notice <code>"Kenya" in customers_by_country</code> gives <code>True</code> and <code>"Mali" in customers_by_country</code> gives <code>False</code>.</p>`,
      code: `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393}

customers_by_country["Egypt"] = 0
print(customers_by_country)

customers_by_country["Nigeria"] = 401
print(customers_by_country)

print("Kenya" in customers_by_country)
print("Mali" in customers_by_country)

customers_by_country.pop("Egypt")
print(customers_by_country)`
    },
    {
      type: 'explain',
      title: 'What is allowed to be a key?',
      body: `<div class="callout analogy"><b>The idea:</b> Python finds a drawer instantly by turning the label into an address. For that to work, the label must <b>never change</b>. If you could scribble on a label after sticking it on, the drawer would get lost. So keys must be things that cannot change: text, numbers (and a few others you will meet later). A <b>list cannot be a key</b>, because a list can be changed.</div>
<p>In practice you will nearly always use text (a country, a product name) or whole numbers (an id), and that works perfectly. Just know that if you ever try a list, Python will refuse.</p>
<p>A final detail: modern Python remembers the <b>order in which you added the entries</b>, so printing a dictionary shows them in that order. But do not build your thinking around position. The whole point of a dictionary is that you ask by name.</p>`
    },
    {
      type: 'try',
      title: 'A list cannot be a key',
      body: `<p>Run it. The message says <b>TypeError: unhashable type: 'list'</b>. “Unhashable” is the technical word for “cannot be turned into a fixed address”, which is the reason we just explained. Replace the list <code>[1, 2]</code> with the text <code>"one_two"</code> and it works.</p>`,
      code: `lookup = {[1, 2]: "a list as a key"}
print(lookup)`
    },
    {
      id: 'py-1-5-ex1',
      type: 'exercise',
      title: 'Your turn: look up by name',
      body: `<p>The dictionary <code>customers_by_country</code> is in the box. Print how many customers TradeFlow has in <b>Rwanda</b>. You should see <code>438</code>.</p>
<p><b>Think before you type:</b> square brackets, with the key as text inside, right after the dictionary’s name.</p>`,
      starter: `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}\n\n# Write your code below\n`,
      hints: [
        `print(customers_by_country[ ... ]) with the country in quotation marks inside the brackets.`,
        `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}\nprint(customers_by_country["Rwanda"])`
      ],
      solution: `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}\nprint(customers_by_country["Rwanda"])`,
      ordered: true
    },
    {
      id: 'py-1-5-ex2',
      type: 'exercise',
      title: 'Your turn: one more customer',
      body: `<p>A new customer signs up in Ghana. Increase Ghana’s count by 1, then print it. You should see <code>392</code>.</p>
<p><b>Think before you type:</b> this is the same pattern as <code>orders = orders + 1</code> from lesson 1.2, but the jar is now a drawer. Right side first: look up the current number and add 1. Then store the result under the same key.</p>`,
      starter: `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}\n\n# Write your code below\n`,
      hints: [
        `The line has the shape customers_by_country["Ghana"] = customers_by_country["Ghana"] + 1.`,
        `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}\ncustomers_by_country["Ghana"] = customers_by_country["Ghana"] + 1\nprint(customers_by_country["Ghana"])`
      ],
      solution: `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}\ncustomers_by_country["Ghana"] = customers_by_country["Ghana"] + 1\nprint(customers_by_country["Ghana"])`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What if the drawer does not exist?',
      body: `<p>Ask for a key that is not in the dictionary and Python stops with a <b>KeyError</b>. It is the dictionary version of “there is no drawer with that label.” Let’s trigger one on purpose so that you recognise it.</p>`
    },
    {
      type: 'try',
      title: 'A KeyError',
      body: `<p>Run it. The message says <b>KeyError: 'Egypt'</b>, and it names the missing key. In plain words: “you asked me for the drawer marked Egypt, and there is no such drawer.” Two usual causes: the key really is missing, or it is <b>spelled differently</b> (a capital letter, a stray space). The second one is common with real data, which is why the text cleaning you learned in 1.3 matters.</p>`,
      code: `customers_by_country = {"Nigeria": 400, "Kenya": 393}
print(customers_by_country["Egypt"])`
    },
    {
      id: 'py-1-5-c1',
      type: 'check',
      title: 'What happens when you ask for a key that is not there?',
      body: `<p><code>d = {"Kenya": 393}</code><br><code>print(d["Egypt"])</code></p>`,
      options: ['It prints 0', 'It prints None', 'Python raises a KeyError', 'It adds Egypt automatically'],
      answer: 2,
      why: [
        'Python does not guess a default. It stops and tells you the drawer is missing.',
        'That is what d.get("Egypt") would give. Square brackets are stricter.',
        'Yes! Square brackets with a missing key raise a KeyError. That is useful: a missing key is often a bug, and the error tells you straight away.',
        'Reading a missing key never creates it. Only assigning does: d["Egypt"] = 0.'
      ]
    },
    {
      type: 'explain',
      title: 'A gentler way to ask: .get()',
      body: `<p>Sometimes a missing key is not a bug. It is a normal situation, and you just want a sensible answer. For that, dictionaries have <code>.get(key, default)</code>: “look up this key, and if it is not there, give me this default instead.” No error.</p>
<ul>
<li><code>d.get("Egypt", 0)</code> gives <code>0</code> when Egypt is missing, and the real value when it exists</li>
<li><code>d.get("Egypt")</code> with no default gives <code>None</code> when it is missing</li>
</ul>
<p>Here is a good rule for choosing. Use <b>square brackets</b> when the key <i>should</i> be there, because a missing one is a problem you want to hear about loudly. Use <b>.get()</b> when a missing key is perfectly normal and you have a sensible fallback. You will use <code>.get(key, 0)</code> all the time when you start counting things in lesson 1.7.</p>`
    },
    {
      type: 'try',
      title: 'Safe lookups with .get()',
      body: `<p>Kenya is there, so we get 393. Egypt is missing, so the default <code>0</code> comes back. And with no default, a missing key gives <code>None</code>, Python’s “nothing here”, the same idea as SQL’s NULL.</p>`,
      code: `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393}

print(customers_by_country.get("Kenya", 0))
print(customers_by_country.get("Egypt", 0))
print(customers_by_country.get("Egypt"))`
    },
    {
      id: 'py-1-5-c2',
      type: 'check',
      title: 'What does d.get("Egypt") give, when Egypt is not a key?',
      body: `<p>There is no default in the brackets.</p>`,
      options: ['0', 'A KeyError', 'None', 'An empty string'],
      answer: 2,
      why: [
        'You only get 0 if you ask for it: d.get("Egypt", 0).',
        'KeyError is what square brackets give. .get() is the polite version that never raises it.',
        'Yes! With no default supplied, .get() returns None when the key is missing.',
        'It returns Python’s None, not an empty string.'
      ]
    },
    {
      id: 'py-1-5-ex3',
      type: 'exercise',
      title: 'Your turn: a safe lookup',
      body: `<p>Use <code>.get()</code> to print the number of customers in <b>Egypt</b>, with a default of <code>0</code>, and then the number in <b>Kenya</b>. You should see <code>0</code> and then <code>393</code>, on two lines.</p>
<p><b>Think before you type:</b> two print lines, each using <code>.get(key, 0)</code>. Egypt is not a key, so you will get the default.</p>`,
      starter: `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}\n\n# Write your code below\n`,
      hints: [
        `The shape is print(customers_by_country.get("...", 0)).`,
        `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}\nprint(customers_by_country.get("Egypt", 0))\nprint(customers_by_country.get("Kenya", 0))`
      ],
      solution: `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}\nprint(customers_by_country.get("Egypt", 0))\nprint(customers_by_country.get("Kenya", 0))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Looking at all the keys, all the values, or both',
      body: `<p>Sometimes you want to look at the whole dictionary at once. Three small tools give you the pieces:</p>
<ul>
<li><code>d.keys()</code> are all the labels</li>
<li><code>d.values()</code> are all the values</li>
<li><code>d.items()</code> are the pairs, as (key, value). Each pair is written in round brackets, a cousin of the list called a <b>tuple</b>, which is simply a list that cannot be changed</li>
</ul>
<p>The one you will use most for analysis is <code>.values()</code>, because the values are usually the numbers you want to total up. <code>sum(d.values())</code> adds every value in one go. In lesson 1.7 you will learn loops, and <code>.items()</code> will become your best friend there.</p>`
    },
    {
      type: 'try',
      title: 'Totals and pieces',
      body: `<p>The five countries’ customers add up to <b>2000</b>, which matches the 2,000 customers in the TradeFlow customers table. A good habit: when a dictionary’s numbers should add up to a known total, check that they do. We also see the labels and the pairs. (Python wraps them in a label such as <code>dict_keys</code> when it prints them. Putting them inside <code>list()</code> gives a plain list.)</p>`,
      code: `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}

print(sum(customers_by_country.values()))
print(list(customers_by_country.keys()))
print(list(customers_by_country.items()))`
    },
    {
      id: 'py-1-5-ex4',
      type: 'exercise',
      title: 'Your turn: total and count',
      body: `<p>Print the <b>total number of customers</b> across all countries on one line, and the <b>number of countries</b> on the next. You should see <code>2000</code> and then <code>5</code>.</p>
<p><b>Think before you type:</b> <code>sum()</code> with <code>.values()</code> for the total, and <code>len()</code> for the number of entries.</p>`,
      starter: `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}\n\n# Write your code below\n`,
      hints: [
        `print(sum(customers_by_country.values())) gives the total. Then print the length of the dictionary.`,
        `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}\nprint(sum(customers_by_country.values()))\nprint(len(customers_by_country))`
      ],
      solution: `customers_by_country = {"Nigeria": 400, "Ghana": 391, "Kenya": 393, "South Africa": 378, "Rwanda": 438}\nprint(sum(customers_by_country.values()))\nprint(len(customers_by_country))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Dictionaries inside lists: how real data arrives',
      body: `<p>A value in a dictionary can be anything, including a list or another dictionary. That is what makes dictionaries powerful. The most common pattern in the real world is a <b>record</b>: one dictionary describing one thing, with a label for each fact. Here is customer 27 from TradeFlow:</p>
<p><code>{"customer_id": 27, "customer_name": "Eugene Walton", "email": "EUGENE.WALTON941@GMAIL.COM", "country": "Rwanda"}</code></p>
<p>Now put many records in a <b>list</b>, and you have a whole table, where every row carries its own column labels. A list of dictionaries is the shape that data usually has when it comes from a website or an app, in a format called <b>JSON</b>. When you read data from the web as an analyst, this is what you get back.</p>
<p>To reach one fact you use two lookups: first the position in the list, then the key. <code>customers[0]["customer_name"]</code> reads as “the first customer’s name”. Compare that with the list-of-lists table from lesson 1.4, where you had to remember that the name was in position 1. Labels are much kinder than positions.</p>`
    },
    {
      type: 'try',
      title: 'A list of records',
      body: `<p>Three real TradeFlow customers, each as a dictionary. <code>customers[0]["customer_name"]</code> is Alex Spencer. <code>customers[1]["country"]</code> is Rwanda. And look at the third customer: their email is <code>None</code>, because that customer’s email is blank in the data. It is the same blank you counted in the SQL audit, and here it shows up as Python’s “nothing”.</p>`,
      code: `customers = [
    {"customer_id": 1, "customer_name": "Alex Spencer", "country": "Rwanda", "email": "alex.spencer760@hotmail.com"},
    {"customer_id": 2, "customer_name": "Benjamin Welch", "country": "Rwanda", "email": "benjamin.welch759@gmail.com"},
    {"customer_id": 3, "customer_name": "Andre Rivera", "country": "Kenya", "email": None},
]

print(customers[0]["customer_name"])
print(customers[1]["country"])
print(customers[2]["email"])
print(len(customers))`
    },
    {
      id: 'py-1-5-c3',
      type: 'check',
      title: 'Which structure suits “find a product’s price by its name”?',
      body: `<p>You have 150 products and you often ask: “what does the Smartphone Charger cost?”</p>`,
      options: ['A list of prices, remembering each position', 'A dictionary with product names as keys and prices as values', 'One variable per product', 'A single long string'],
      answer: 1,
      why: [
        'This works, but you would have to remember which position belongs to which product. That is the exact problem dictionaries solve.',
        'Yes! When you look things up by a name, a dictionary is the right tool: prices["Smartphone Charger"] gives the price straight away.',
        'One variable per product means 150 variables. That is the problem lists and dictionaries were invented to avoid.',
        'You could not reliably pull a price out of a long piece of text.'
      ]
    },
    {
      id: 'py-1-5-ex5',
      type: 'exercise',
      title: 'Challenge: read a record',
      body: `<p>The dictionary <code>customer</code> holds customer 27. Print this exact line, built with an f-string from the record’s facts, with the email in <b>lowercase</b>:</p>
<p><code>Eugene Walton (customer 27): eugene.walton941@gmail.com</code></p>
<p><b>Think before you type:</b> an f-string with three lookups inside the curly brackets: the name, the id and the email. For the email, add <code>.lower()</code> after the lookup. One small thing: inside an f-string that uses double quotation marks, write the keys with <b>single</b> quotation marks, for example <code>customer['customer_name']</code>, so the quotes do not collide.</p>`,
      starter: `customer = {"customer_id": 27, "customer_name": "Eugene Walton", "country": "Rwanda", "email": "EUGENE.WALTON941@GMAIL.COM"}\n\n# Write your code below\n`,
      hints: [
        `The shape is print(f"{customer['customer_name']} (customer {customer['customer_id']}): {...}"). The last part is the email lookup with .lower().`,
        `customer = {"customer_id": 27, "customer_name": "Eugene Walton", "country": "Rwanda", "email": "EUGENE.WALTON941@GMAIL.COM"}\nprint(f"{customer['customer_name']} (customer {customer['customer_id']}): {customer['email'].lower()}")`
      ],
      solution: `customer = {"customer_id": 27, "customer_name": "Eugene Walton", "country": "Rwanda", "email": "EUGENE.WALTON941@GMAIL.COM"}\nprint(f"{customer['customer_name']} (customer {customer['customer_id']}): {customer['email'].lower()}")`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You have just learned the structure that most real data arrives in. You can now:</p>
<ul>
<li>Build a <b>dictionary</b> of key and value pairs, and look things up <b>by name</b> instead of by position</li>
<li><b>Add, change and remove</b> entries, and check for a key with <code>in</code></li>
<li>Choose between square brackets (a missing key is a <b>KeyError</b>) and <code>.get(key, default)</code> (a missing key is fine)</li>
<li>Use <code>.keys()</code>, <code>.values()</code> and <code>.items()</code>, and total up the values with <code>sum</code></li>
<li>Read a <b>record</b> and a <b>list of records</b>, the shape of web and app data (JSON)</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>When would you use a dictionary instead of a list?</li>
<li>What is the difference between <code>d["x"]</code> and <code>d.get("x")</code>?</li>
<li>Can two keys in a dictionary be the same?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A list is right when the order or the position matters. A dictionary is right when you look things up by a meaningful label, such as a country, a product name or an id, because lookup by key is direct and does not depend on remembering positions.</p>
<p><b>2.</b> <code>d["x"]</code> raises a KeyError if the key is missing. <code>d.get("x")</code> returns None instead (or a default you supply), so it never raises. I use brackets when the key should exist and a missing one signals a bug, and get when a missing key is normal.</p>
<p><b>3.</b> No. Keys must be unique. If you assign to a key that already exists, the old value is replaced. Values, on the other hand, can repeat freely.</p>
</details>
<p><b>Coming next, in lesson 1.6:</b> making decisions. So far, Python has followed every line, no matter what. But analysts constantly ask “if this order is large, flag it; otherwise, do not.” Conditions let your code choose between paths, and they are the first step towards code that thinks.</p>`
    }
  ]
}
);
