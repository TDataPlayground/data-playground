LESSONS.push(
{
  id: 'py-1-8',
  track: 'python',
  lang: 'python',
  packages: [],
  files: [],
  setup: '',
  title: '1.8 Writing Python like a professional',
  tables: [],
  intro: `The Head of Data reads through your loop code from last week. <i>“It works, and that is what matters first. Now I want to show you how people who write Python every day would write the same thing. Shorter, easier to read, and safer when the data is messy.”</i><br><br>You raise an eyebrow. Shorter? Your loops are already only a few lines. She grins. <i>“Wait until you see a four-line loop turn into one line that reads like a sentence.”</i><br><br>Here is a truth about professional code: it is read far more often than it is written. A colleague will open your file months from now, and what they need is clarity. The four habits in this lesson are exactly what makes Python code look clean and experienced: <b>list comprehensions</b>, <b>enumerate</b>, <b>zip</b> and <b>try / except</b>. None of them is hard. They are just shortcuts for jobs you already know how to do the long way.`,
  steps: [
    {
      type: 'explain',
      title: 'List comprehensions: a loop folded into one line',
      body: `<div class="callout analogy"><b>The big idea:</b> picture a conveyor belt in a factory. Items roll along. At one end, a worker does something to every item (paint it, stamp it). The finished items come off the other end onto a new tray. A <b>list comprehension</b> is that whole belt, described in one line: “take every item from this list, do this to it, and give me a new list.”</div>
<p>You already know how to do it with a loop. Say you want the emails in lowercase:</p>
<p><code>clean = []</code><br><code>for email in emails:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;clean.append(email.lower())</code></p>
<p>Four lines: make an empty tray, walk the belt, do the job, put the result on the tray. The comprehension says the same thing in one line, inside square brackets:</p>
<p><code>clean = [email.lower() for email in emails]</code></p>
<p>Read it left to right like a sentence: <i>“email lowercased, for each email in emails.”</i> The part before <code>for</code> says <b>what to make</b>. The part after says <b>where the items come from</b>. The square brackets say “and collect it all in a new list.”</p>`
    },
    {
      type: 'try',
      title: 'The loop and the comprehension, side by side',
      body: `<p>Run it. Both ways give the same list of lowercase emails, one made by the four-line loop and one by the single-line comprehension. When you are comfortable with loops, the comprehension is simply the loop written more tightly. The original list is not changed, as usual with methods that return new things.</p>`,
      code: `emails = ["EUGENE.WALTON941@GMAIL.COM", "BRITTNEY.CAMPBELL347@GMAIL.COM", "alex.spencer760@hotmail.com"]

clean_a = []
for email in emails:
    clean_a.append(email.lower())
print(clean_a)

clean_b = [email.lower() for email in emails]
print(clean_b)`
    },
    {
      type: 'explain',
      title: 'Adding a quality inspector',
      body: `<p>On a real factory belt there is often an inspector who removes the items that do not pass. A comprehension can do that too. You add an <code>if</code> at the very end, and only the items that pass the test make it onto the new tray:</p>
<p><code>large = [amount for amount in amounts if amount &gt; 100000]</code></p>
<p>Read it as: <i>“amount, for each amount in amounts, if the amount is above 100000.”</i> This is a filter, the same job as the SQL <code>WHERE</code>. You can also combine both ideas: change each item <b>and</b> filter, such as <code>[a * 2 for a in amounts if a &gt; 100000]</code>.</p>`
    },
    {
      type: 'try',
      title: 'Filtering with a comprehension',
      body: `<p>Of the eight payments, six are above 100,000. The first line builds the filtered list. The second counts how many passed with <code>len()</code>. The third combines the two ideas: it keeps the large payments and shows each one in thousands, rounded to a whole number, a typical report-friendly change.</p>`,
      code: `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]

large = [amount for amount in amounts if amount > 100000]
print(large)
print(len(large))

in_thousands = [round(amount / 1000) for amount in amounts if amount > 100000]
print(in_thousands)`
    },
    {
      id: 'py-1-8-c1',
      type: 'check',
      title: 'What does this give?',
      body: `<p><code>[x * 2 for x in [1, 2, 3]]</code></p>
<p>Read it like a sentence: “x doubled, for each x in the list.”</p>`,
      options: ['[1, 2, 3, 1, 2, 3]', '[2, 4, 6]', '6', '[1, 2, 3]'],
      answer: 1,
      why: [
        'That would be the list repeated twice (list * 2). Here, each item is doubled, one by one.',
        'Yes! Each x is doubled, and the results are collected in a new list: [2, 4, 6].',
        'A comprehension builds a list, not a single total. Use sum() if you want the total.',
        'The items are doubled, so the list changes.'
      ]
    },
    {
      id: 'py-1-8-ex1',
      type: 'exercise',
      title: 'Your turn: clean a list of emails',
      body: `<p>The list <code>emails</code> is in the box. Use a list comprehension to make a new list with every email in <b>lowercase</b>, and print it. You should see <code>['eugene.walton941@gmail.com', 'brittney.campbell347@gmail.com', 'alex.spencer760@hotmail.com']</code>.</p>
<p><b>Think before you type:</b> the shape is <code>[ what to make  for item in list ]</code>. What you make is <code>email.lower()</code>.</p>`,
      starter: `emails = ["EUGENE.WALTON941@GMAIL.COM", "BRITTNEY.CAMPBELL347@GMAIL.COM", "alex.spencer760@hotmail.com"]\n\n# Write your code below\n`,
      hints: [
        `Inside square brackets: email.lower() for email in emails`,
        `emails = ["EUGENE.WALTON941@GMAIL.COM", "BRITTNEY.CAMPBELL347@GMAIL.COM", "alex.spencer760@hotmail.com"]\nprint([email.lower() for email in emails])`
      ],
      solution: `emails = ["EUGENE.WALTON941@GMAIL.COM", "BRITTNEY.CAMPBELL347@GMAIL.COM", "alex.spencer760@hotmail.com"]\nprint([email.lower() for email in emails])`,
      ordered: true
    },
    {
      id: 'py-1-8-ex2',
      type: 'exercise',
      title: 'Your turn: keep only the large payments',
      body: `<p>The list <code>amounts</code> is in the box. Use a list comprehension to keep only the amounts <b>above 100000</b>, and print the new list. You should see <code>[246702.23, 325801.21, 115761.21, 143623.93, 146008.08, 505665.9]</code>.</p>
<p><b>Think before you type:</b> “amount, for each amount in amounts, if amount is above 100000”.</p>`,
      starter: `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\n\n# Write your code below\n`,
      hints: [
        `The inspector goes at the end: [amount for amount in amounts if ... ]`,
        `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\nprint([amount for amount in amounts if amount > 100000])`
      ],
      solution: `amounts = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\nprint([amount for amount in amounts if amount > 100000])`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A word of caution: shorter is not always better',
      body: `<p>Comprehensions are lovely for <b>one simple job</b>: change each item, or filter, or both. But the point is readability. If you find yourself squeezing three conditions and a calculation into one line, and a colleague would need a minute to decode it, <b>go back to a plain loop</b>. A longer loop that anyone can read beats a clever one-liner that nobody can. Professionals choose clarity every time.</p>`
    },
    {
      type: 'explain',
      title: 'enumerate: a loop that also counts',
      body: `<p>Sometimes, while looping, you also want to know the <b>position</b>: “1. Nigeria, 2. Ghana…”. You could keep your own counter, but Python has a tool for it: <code>enumerate</code>. Picture the numbered tickets handed out at a bank: each person in the queue gets the next number. <code>enumerate</code> hands out the numbers while you walk through the list.</p>
<p><code>for number, country in enumerate(countries):</code></p>
<p>It gives you <b>two things on every pass</b>: the number and the item, caught in two jars. By default, counting starts at <b>0</b>, as everything in Python does. For a list that people will read, you usually want to start at 1, so you add <code>start=1</code>.</p>`
    },
    {
      type: 'try',
      title: 'Numbering a list',
      body: `<p>The first loop uses the default and starts at 0. The second uses <code>start=1</code> and builds a nice numbered line with an f-string. Compare the two. For a report that people will read, the second is the one you want.</p>`,
      code: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]

for number, country in enumerate(countries):
    print(number, country)

print("---")

for number, country in enumerate(countries, start=1):
    print(f"{number}. {country}")`
    },
    {
      id: 'py-1-8-c2',
      type: 'check',
      title: 'What is the first number that enumerate gives, with no start given?',
      body: `<p><code>for i, c in enumerate(["a", "b"]):</code></p>`,
      options: ['0', '1', 'a', 'It depends on the list'],
      answer: 0,
      why: [
        'Yes! Python counts from 0 unless you say start=1.',
        'That is only true if you write start=1.',
        'The letter “a” is the item, not the number.',
        'The count always begins at 0 by default, whatever is in the list.'
      ]
    },
    {
      id: 'py-1-8-ex3',
      type: 'exercise',
      title: 'Your turn: a numbered list',
      body: `<p>The list <code>countries</code> is in the box. Print each country on its own line, numbered from 1, like <code>1. Nigeria</code>, <code>2. Ghana</code> and so on, using <code>enumerate</code> with <code>start=1</code>.</p>
<p><b>Think before you type:</b> a for loop with two jars (<code>number</code> and <code>country</code>), then an f-string to build each line: a number, a full stop, a space, then the country.</p>`,
      starter: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\n\n# Write your code below\n`,
      hints: [
        `for number, country in enumerate(countries, start=1): then a pushed-in print with an f-string.`,
        `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\nfor number, country in enumerate(countries, start=1):\n    print(f"{number}. {country}")`
      ],
      solution: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\nfor number, country in enumerate(countries, start=1):\n    print(f"{number}. {country}")`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'zip: walking two lists side by side',
      body: `<p>Think of the zip on a jacket. Two rows of teeth come together, one tooth from the left matched with one tooth from the right. Python’s <code>zip</code> does the same with two lists: it pairs the first item of one with the first item of the other, the second with the second, and so on.</p>
<p>This is useful when your data arrives as separate columns. You might have a list of countries and a separate list of customer counts. With <code>zip</code>, you can walk them together:</p>
<p><code>for country, count in zip(countries, counts):</code></p>
<p>And it gives you a beautiful shortcut for something from lesson 1.5. Wrapping a zip in <code>dict()</code> builds a dictionary, using the first list as keys and the second list as values: <code>dict(zip(countries, counts))</code>. One short line, and two columns have become a lookup table.</p>`
    },
    {
      type: 'try',
      title: 'Zipping two lists',
      body: `<p>The loop prints each country next to its count, pulling one item from each list on every pass. The last line turns the same two lists into a dictionary in one go. The lists must line up: if one is longer than the other, <code>zip</code> stops when the shorter one runs out, quietly, so it is worth checking that the lengths match.</p>`,
      code: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]
counts = [400, 391, 393, 378, 438]

for country, count in zip(countries, counts):
    print(country, count)

print(dict(zip(countries, counts)))`
    },
    {
      id: 'py-1-8-ex4',
      type: 'exercise',
      title: 'Your turn: two lists become a dictionary',
      body: `<p>The lists <code>countries</code> and <code>customers</code> are in the box. Build a dictionary from them (countries as keys, customer counts as values), and print it. You should see <code>{'Nigeria': 400, 'Ghana': 391, 'Kenya': 393, 'South Africa': 378, 'Rwanda': 438}</code>.</p>
<p><b>Think before you type:</b> <code>zip</code> pairs the lists, and <code>dict</code> turns the pairs into a dictionary.</p>`,
      starter: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\ncustomers = [400, 391, 393, 378, 438]\n\n# Write your code below\n`,
      hints: [
        `dict(zip(first_list, second_list)) wrapped inside a print.`,
        `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\ncustomers = [400, 391, 393, 378, 438]\nprint(dict(zip(countries, customers)))`
      ],
      solution: `countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda"]\ncustomers = [400, 391, 393, 378, 438]\nprint(dict(zip(countries, customers)))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'try and except: a safety net for messy data',
      body: `<p>Real data is messy. A column that should hold numbers might contain <code>"N/A"</code>, an empty cell, or a stray letter. When Python meets one of those while converting, it raises an error and the whole program stops. One bad cell out of a million stops everything.</p>
<div class="callout analogy"><b>The big idea:</b> think of a trapeze artist working with a safety net below. She tries a risky move. If it goes wrong, she does not crash on the floor. She lands in the net, and the show goes on. <code>try</code> and <code>except</code> are that net.</div>
<p><code>try:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;number = float(text)</code><br><code>except ValueError:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print("Could not convert", text)</code></p>
<p>Python <b>tries</b> the risky line. If it works, the <code>except</code> part is skipped. If it fails with a ValueError, Python jumps to the <code>except</code> part, deals with it, and carries on.</p>
<p>Notice the words after <code>except</code>: <code>ValueError</code>. You should <b>name the kind of error you expect</b>. A bare <code>except:</code> with nothing after it catches <i>every</i> possible problem, including your own typing mistakes, and quietly hides them. That is dangerous: it can make a broken program look like it works. Catch only the specific thing you know how to handle.</p>`
    },
    {
      type: 'try',
      title: 'Without the net, and with it',
      body: `<p>First the crash: converting <code>"N/A"</code> to a number raises a <b>ValueError</b>, and the program stops at that line. Now the version with the net, in the next card. (If you want to see the crash in full, run this card as it is. Then use the next card.)</p>`,
      code: `text = "N/A"
number = float(text)
print(number)`
    },
    {
      type: 'try',
      title: 'Cleaning messy values, safely',
      body: `<p>Here is a messy column, the kind of thing a real file might give you: valid numbers mixed with <code>"N/A"</code> and an empty cell. The loop tries to convert each one. Good values are added to the total. Bad ones land in the net, and we count them instead of crashing. At the end we know both the total of the good values (<b>372462.28</b>) and how many bad ones we met (<b>2</b>). This is how real cleaning code starts, and you will use this idea again in the cleaning module.</p>`,
      code: `raw = ["246702.23", "N/A", "9998.84", "", "115761.21"]

total = 0
bad = 0

for text in raw:
    try:
        total += float(text)
    except ValueError:
        bad += 1

print("Total:", round(total, 2))
print("Bad values:", bad)`
    },
    {
      id: 'py-1-8-c3',
      type: 'check',
      title: 'Which is the better way to write the safety net?',
      body: `<p>You are converting text to numbers, and you expect that some of the values may not be numbers.</p>`,
      options: ['except:   (nothing after it, catch everything)', 'except ValueError:   (catch only the problem you expect)', 'No try at all, just hope the data is clean', 'except Exception:   (catch absolutely everything quietly)'],
      answer: 1,
      why: [
        'This catches every error, including bugs you have not noticed yet, and hides them. A broken program can then look like a working one.',
        'Yes! Naming the exact error means you only handle the problem you expected. Anything else still stops the program loudly, which is what you want.',
        'Real data is rarely clean. One bad value would stop the whole run.',
        'Catching everything is the same problem as a bare except. Be specific.'
      ]
    },
    {
      id: 'py-1-8-ex5',
      type: 'exercise',
      title: 'Challenge: total the good values, count the bad',
      body: `<p>The list <code>raw</code> holds text values, some of them not numbers. Use a loop with <code>try</code> and <code>except ValueError</code> to add up the valid ones and count the invalid ones. Print two lines: <code>Total:</code> followed by the total rounded to 2 decimals, and <code>Bad values:</code> followed by the count. You should see <code>Total: 372462.28</code> and then <code>Bad values: 2</code>.</p>
<p><b>Think before you type:</b> two tallies at 0 before the loop. Inside the loop, <code>try</code> to add <code>float(text)</code> to the total, and in <code>except ValueError</code> add 1 to the bad count.</p>`,
      starter: `raw = ["246702.23", "N/A", "9998.84", "", "115761.21"]\n\n# Write your code below\n`,
      hints: [
        `total = 0 and bad = 0 first. Then for text in raw: with try: total += float(text) and except ValueError: bad += 1.`,
        `raw = ["246702.23", "N/A", "9998.84", "", "115761.21"]\ntotal = 0\nbad = 0\nfor text in raw:\n    try:\n        total += float(text)\n    except ValueError:\n        bad += 1\nprint("Total:", round(total, 2))\nprint("Bad values:", bad)`
      ],
      solution: `raw = ["246702.23", "N/A", "9998.84", "", "115761.21"]\ntotal = 0\nbad = 0\nfor text in raw:\n    try:\n        total += float(text)\n    except ValueError:\n        bad += 1\nprint("Total:", round(total, 2))\nprint("Bad values:", bad)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>These four habits are the difference between code that works and code that looks like it was written by someone experienced. You can now:</p>
<ul>
<li>Write a <b>list comprehension</b> to change every item, or to filter, and know when a plain loop is the kinder choice</li>
<li>Number items with <code>enumerate</code>, and start from 1 with <code>start=1</code></li>
<li>Walk two lists together with <code>zip</code>, and turn them into a dictionary with <code>dict(zip(...))</code></li>
<li>Protect a risky line with <code>try</code> and <code>except</code>, naming the specific error, and count the bad values instead of crashing</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is a list comprehension, and when would you avoid one?</li>
<li>What does <code>zip</code> do?</li>
<li>Why is a bare <code>except:</code> considered bad practice?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A list comprehension builds a new list from an existing one in a single expression, optionally changing each item and filtering with an if. I avoid it when the logic is complicated enough that a plain loop would be easier for a colleague to read.</p>
<p><b>2.</b> zip pairs up items from two or more sequences by position, so that you can loop over them together, or build a dictionary from a list of keys and a list of values. It stops at the shortest sequence.</p>
<p><b>3.</b> A bare except catches every exception, including bugs and typing mistakes that you did not expect, and silently hides them. It is better to catch only the specific exception you know how to handle, so that unexpected problems still show up.</p>
</details>
<p><b>Coming next, in lesson 1.9, the last lesson of this module:</b> functions. So far you have written code that runs once, top to bottom. A function lets you give a piece of code a name, so that you can use it again and again, anywhere. It is the last big idea before you meet Pandas.</p>`
    }
  ]
},
{
  id: 'py-1-9',
  track: 'python',
  lang: 'python',
  packages: [],
  files: [],
  setup: '',
  title: '1.9 Functions: building your own tools',
  tables: [],
  intro: `A colleague from the marketing team stops by. <i>“Can you clean the emails in this customer list? Lowercase, no stray spaces.”</i> You do it. An hour later, someone from finance asks for the same cleaning on a different list. Then the sales team. By the end of the week, you have pasted the same three lines of cleaning code into five different places.<br><br>Then the Head of Data changes the rule: <i>“We also want to strip out any dots at the end.”</i> Now you must find and edit all five copies. Miss one, and your reports disagree with each other.<br><br>There is a much better way. You write the cleaning steps <b>once</b>, give them a name, and from then on you just use the name. Change the rule in one place, and every report follows. That is a <b>function</b>. It is also the very last big idea in the Python basics, and once you have it, you are ready for Pandas. Let’s finish this module properly.`,
  steps: [
    {
      type: 'explain',
      title: 'A function is a recipe card',
      body: `<div class="callout analogy"><b>The big idea:</b> think of a vending machine. You put something in (money and a button press), the machine does its internal work, and something comes out (a snack). You do not need to know how the machine works inside. You just use it, again and again. A function is a little machine you build yourself: <b>something goes in, some work happens, something comes out.</b> Or think of a recipe card: you write the steps once, and cook the dish whenever you like.</div>
<p>You have been using other people’s functions since lesson 1.1: <code>print</code>, <code>len</code>, <code>sum</code>, <code>round</code>. They are machines someone built for you. Now you will build your own.</p>
<p>You make one with the word <code>def</code> (short for “define”):</p>
<p><code>def greet(country):</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;return "Welcome to " + country</code></p>
<ol>
<li><code>def</code> starts the recipe card.</li>
<li><code>greet</code> is the function’s <b>name</b>. Choose one that says what it does, usually a verb.</li>
<li><code>(country)</code> is the <b>input slot</b>, called a <b>parameter</b>. It is a jar that exists only while the function runs.</li>
<li>The colon and the pushed-in lines work as they always do. Everything indented is the function’s body.</li>
<li><code>return</code> is the <b>output chute</b>: it hands a value back to whoever called the function.</li>
</ol>
<p>One very important point: <b>writing the def line does not run anything.</b> It only writes the recipe card. To cook the dish, you <b>call</b> the function by its name, with the real value in brackets: <code>greet("Kenya")</code>.</p>`
    },
    {
      type: 'try',
      title: 'Define once, use many times',
      body: `<p>Run it. The first three lines write the recipe card, and nothing prints yet. Then we call the function twice, with two different countries, and get two different answers from the same recipe. Call it with <code>"Ghana"</code> as well, and watch it work again with no more typing of the steps.</p>`,
      code: `def greet(country):
    return "Welcome to " + country

print(greet("Kenya"))
print(greet("Rwanda"))`
    },
    {
      id: 'py-1-9-c1',
      type: 'check',
      title: 'What does this code print?',
      body: `<p><code>def shout(text):</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print(text.upper())</code></p>
<p>That is all of the code. Nothing else.</p>`,
      options: ['The text in capital letters', 'Nothing, because the function was defined but never called', 'An error', 'None'],
      answer: 1,
      why: [
        'The function would only print if somebody called it, as in shout("hi"). There is no call here.',
        'Yes! The def line only writes the recipe card. Nothing runs until you call the function by name.',
        'The code is valid. It just never gets used.',
        'None only appears if you print the result of a call. There is no call at all.'
      ]
    },
    {
      id: 'py-1-9-ex1',
      type: 'exercise',
      title: 'Your turn: your first function',
      body: `<p>Write a function called <code>greet</code> that takes one parameter, <code>country</code>, and <b>returns</b> the text <code>Welcome to</code> followed by a space and the country. Then call it with <code>"Kenya"</code> and print the result. You should see <code>Welcome to Kenya</code>.</p>
<p><b>Think before you type:</b> the def line with a colon, a pushed-in return line, and then, back at the left margin, a print that calls the function.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `def greet(country): on the first line. Then a pushed-in line that begins with return.`,
        `def greet(country):\n    return "Welcome to " + country\n\nprint(greet("Kenya"))`
      ],
      solution: `def greet(country):\n    return "Welcome to " + country\n\nprint(greet("Kenya"))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'print versus return: the most confusing pair',
      body: `<p>Beginners mix up <code>print</code> and <code>return</code> more than anything else in this lesson, so let’s be very clear.</p>
<ul>
<li><code>print</code> <b>shows</b> something on the screen, for a human to read. After it has shown the thing, the value is gone.</li>
<li><code>return</code> <b>hands</b> a value back to the code that called the function, so that the code can <b>use</b> it: store it in a jar, add it to something, pass it to another function.</li>
</ul>
<p>Back to the vending machine: <code>print</code> is the machine showing you a picture of the snack on its display. <code>return</code> is the snack dropping into the tray so that you can actually take it with you.</p>
<p>And if a function has no <code>return</code> at all, Python quietly hands back <code>None</code> (the “nothing” from lesson 1.2). So a function that only prints gives you nothing to work with afterwards.</p>`
    },
    {
      type: 'try',
      title: 'The difference you can see',
      body: `<p>Two functions that look similar. <code>double_print</code> only shows the answer, so when we try to store its result, the jar gets <code>None</code>. <code>double_return</code> hands the answer back, so the jar gets 20, and we can use it in more arithmetic. The first function wasted the answer. The second let us use it.</p>`,
      code: `def double_print(x):
    print(x * 2)

def double_return(x):
    return x * 2

a = double_print(10)
print("a holds:", a)

b = double_return(10)
print("b holds:", b)
print(b + 5)`
    },
    {
      id: 'py-1-9-c2',
      type: 'check',
      title: 'What does y hold at the end?',
      body: `<p><code>def add_one(x):</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print(x + 1)</code><br><code>y = add_one(5)</code></p>`,
      options: ['6', 'None', '5', 'An error'],
      answer: 1,
      why: [
        'The 6 is printed to the screen, but the function does not hand it back. It has no return.',
        'Yes! The function prints 6 but returns nothing, so y holds None. Use return when you want to use the answer later.',
        'The input was 5, but the function does not return it.',
        'The code is valid. It only surprises people who expected y to be 6.'
      ]
    },
    {
      id: 'py-1-9-ex2',
      type: 'exercise',
      title: 'Your turn: a cleaning tool',
      body: `<p>Build the tool from this lesson’s story. Write a function called <code>clean_email</code> that takes <code>email</code>, removes the spaces at both ends and makes it lowercase, and <b>returns</b> the result. Then print <code>clean_email("  EUGENE.WALTON941@GMAIL.COM ")</code>. You should see <code>eugene.walton941@gmail.com</code>.</p>
<p><b>Think before you type:</b> you already know the two methods from lesson 1.3. Chain them: <code>email.strip().lower()</code>. The function wraps that in a name.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `def clean_email(email): and then a pushed-in return line using strip and lower.`,
        `def clean_email(email):\n    return email.strip().lower()\n\nprint(clean_email("  EUGENE.WALTON941@GMAIL.COM "))`
      ],
      solution: `def clean_email(email):\n    return email.strip().lower()\n\nprint(clean_email("  EUGENE.WALTON941@GMAIL.COM "))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Functions that make decisions',
      body: `<p>Everything you learned earlier fits inside a function. A function can contain an <code>if</code>, a loop, anything. The most useful pattern is a function that <b>looks at its input and decides what to return</b>. Remember the Large, Medium and Small payment labels from lesson 1.6? That chain of questions can live inside a function:</p>
<p><code>def label_amount(amount):</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;if amount &gt;= 500000:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return "Large"</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;elif amount &gt;= 100000:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return "Medium"</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;return "Small"</code></p>
<p>Notice something neat. The moment Python reaches a <code>return</code>, the function <b>ends</b> and hands back that value. So once “Large” has been returned, the later lines are never read. That is why the last line does not need an <code>else</code>: if we got that far, the amount must be small.</p>
<p>Now you can label any payment with one short call, and the rule lives in just one place.</p>`
    },
    {
      type: 'try',
      title: 'One rule, used on a whole list',
      body: `<p>The function holds the rule once. The loop calls it for each payment, and you get a label for each: Medium, Medium, Small, and so on. If TradeFlow changes its definition of “Large” next month, you edit a single number in one place, and everything that uses the function follows. That is the whole point of functions.</p>`,
      code: `def label_amount(amount):
    if amount >= 500000:
        return "Large"
    elif amount >= 100000:
        return "Medium"
    return "Small"

amounts = [246702.23, 9998.84, 505665.9, 115761.21]

for amount in amounts:
    print(amount, label_amount(amount))`
    },
    {
      id: 'py-1-9-ex3',
      type: 'exercise',
      title: 'Your turn: a labelling function',
      body: `<p>Write a function called <code>label_amount</code> that takes <code>amount</code> and <b>returns</b> <code>"Large"</code> if it is 500000 or more, <code>"Medium"</code> if it is 100000 or more, and <code>"Small"</code> otherwise. Then print the labels for <code>115761.21</code>, <code>600000</code> and <code>5000</code>, one per line. You should see <code>Medium</code>, <code>Large</code> and <code>Small</code>.</p>
<p><b>Think before you type:</b> the strictest question first. Use <code>return</code>, not <code>print</code>, inside the function. Then three print lines that call it.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `Inside the function: if amount >= 500000: return "Large", then elif amount >= 100000: return "Medium", then a final return "Small".`,
        `def label_amount(amount):\n    if amount >= 500000:\n        return "Large"\n    elif amount >= 100000:\n        return "Medium"\n    return "Small"\n\nprint(label_amount(115761.21))\nprint(label_amount(600000))\nprint(label_amount(5000))`
      ],
      solution: `def label_amount(amount):\n    if amount >= 500000:\n        return "Large"\n    elif amount >= 100000:\n        return "Medium"\n    return "Small"\n\nprint(label_amount(115761.21))\nprint(label_amount(600000))\nprint(label_amount(5000))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Default values and named arguments',
      body: `<p>Sometimes an input has a sensible usual value. You can give a parameter a <b>default</b>, so callers only mention it when they want something different:</p>
<p><code>def average(numbers, digits=2):</code></p>
<p>Now <code>average(prices)</code> rounds to 2 decimals, because nobody said otherwise. But <code>average(prices, 1)</code> rounds to 1. You can also name the argument when you call, which makes the call read like a sentence and removes any doubt: <code>average(prices, digits=1)</code>.</p>
<p>A tidy habit for the first line inside a function is a <b>docstring</b>: a short sentence in triple quotation marks that says what the function does. It does not affect how the code runs, but it tells the next reader (and future you) what the function is for.</p>`
    },
    {
      type: 'try',
      title: 'A function with a default',
      body: `<p>The function has a one-line docstring. Called with just the list, it uses the default of 2 decimals and gives <b>18.33</b>. Called with <code>digits=1</code>, it gives <b>18.3</b>. Same function, two behaviours, chosen by the caller.</p>`,
      code: `def average(numbers, digits=2):
    """Return the average of a list, rounded to a number of decimals."""
    return round(sum(numbers) / len(numbers), digits)

print(average([10, 20, 25]))
print(average([10, 20, 25], digits=1))`
    },
    {
      id: 'py-1-9-ex4',
      type: 'exercise',
      title: 'Your turn: an average with a default',
      body: `<p>Write a function called <code>average</code> with two parameters: <code>numbers</code> and <code>digits</code>, where <code>digits</code> has a <b>default of 2</b>. It should return the average of the numbers, rounded to that many decimals. Then print <code>average([10, 20, 25])</code> and <code>average([10, 20, 25], 1)</code>. You should see <code>18.33</code> and then <code>18.3</code>.</p>
<p><b>Think before you type:</b> the average is <code>sum(numbers) / len(numbers)</code>. Wrap it in <code>round( ..., digits )</code> and <code>return</code> it.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `The def line is def average(numbers, digits=2): and the body is a single return line.`,
        `def average(numbers, digits=2):\n    return round(sum(numbers) / len(numbers), digits)\n\nprint(average([10, 20, 25]))\nprint(average([10, 20, 25], 1))`
      ],
      solution: `def average(numbers, digits=2):\n    return round(sum(numbers) / len(numbers), digits)\n\nprint(average([10, 20, 25]))\nprint(average([10, 20, 25], 1))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A function is a closed room',
      body: `<p>One more idea, and it prevents a whole family of confusing bugs. The jars you create <b>inside</b> a function exist only <b>inside</b> it. Think of the function as a closed room: while it runs, it has its own jars. When it finishes, the room is swept clean and those jars are gone. Code outside cannot see into the room.</p>
<p>This is called <b>scope</b>, and it is a feature, not a flaw. It means the jars inside your function can never clash with jars of the same name elsewhere in your program. The only way to get something out of the room is the <code>return</code> chute.</p>`
    },
    {
      type: 'try',
      title: 'The jar that is not there',
      body: `<p>Run it. Inside the function, <code>result</code> exists and is calculated correctly. But after the function finishes, the room is swept clean, so asking for <code>result</code> outside gives a <b>NameError</b>. The fix is to <code>return</code> the value, and catch it in a jar outside: <code>answer = double(5)</code>.</p>`,
      code: `def double(x):
    result = x * 2
    return result

double(5)
print(result)`
    },
    {
      id: 'py-1-9-c3',
      type: 'check',
      title: 'Why does print(result) fail in the code above?',
      body: `<p>The variable <code>result</code> was created inside the function <code>double</code>.</p>`,
      options: ['The function was called with the wrong number', 'Variables created inside a function exist only inside it, and disappear when it finishes', 'print cannot show numbers', 'result is a reserved word'],
      answer: 1,
      why: [
        'The number passed in was fine. The problem is about where result lives.',
        'Yes! That is scope. The function’s own jars vanish when it ends, so code outside cannot see result. To get a value out, return it.',
        'print can show numbers perfectly well.',
        'result is just an ordinary name. It would work fine inside the function.'
      ]
    },
    {
      type: 'explain',
      title: 'Returning more than one fact',
      body: `<p>A function can only return <b>one</b> thing, but that one thing can be a dictionary holding several facts. This is a very common and very tidy pattern: a function that looks at a list and hands back a small report.</p>
<p><code>return {"total": ..., "average": ..., "largest": ...}</code></p>
<p>Your report comes back as one neat package, and you read each fact by its label, as you learned in lesson 1.5.</p>`
    },
    {
      type: 'try',
      title: 'A function that returns a report',
      body: `<p>The function looks at a list of amounts and returns a dictionary with three facts. We call it once and print the whole report, then pick out a single fact by its label. Notice how the earlier lessons all show up here: <code>sum</code>, <code>len</code>, <code>max</code>, <code>round</code>, a dictionary, and a function.</p>`,
      code: `def summarise(amounts):
    """Return the total, average and largest of a list of amounts."""
    return {
        "total": round(sum(amounts), 2),
        "average": round(sum(amounts) / len(amounts), 2),
        "largest": max(amounts)
    }

payments = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]

report = summarise(payments)
print(report)
print(report["largest"])`
    },
    {
      id: 'py-1-9-ex5',
      type: 'exercise',
      title: 'Challenge: a report function',
      body: `<p>Write a function called <code>summarise</code> that takes a list of <code>amounts</code> and <b>returns</b> a dictionary with three keys: <code>"total"</code> (the sum, rounded to 2 decimals), <code>"average"</code> (the average, rounded to 2 decimals) and <code>"largest"</code> (the biggest amount). Then call it on the list <code>payments</code> and print the result. You should see <code>{'total': 1553347.2, 'average': 194168.4, 'largest': 505665.9}</code>.</p>
<p><b>Think before you type:</b> a dictionary written inside a return line. Each fact uses a tool you already know: <code>sum</code>, <code>len</code>, <code>max</code> and <code>round</code>.</p>`,
      starter: `payments = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\n\n# Write your code below\n`,
      hints: [
        `def summarise(amounts): then return { "total": ..., "average": ..., "largest": ... }`,
        `payments = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\ndef summarise(amounts):\n    return {"total": round(sum(amounts), 2), "average": round(sum(amounts) / len(amounts), 2), "largest": max(amounts)}\n\nprint(summarise(payments))`
      ],
      solution: `payments = [246702.23, 325801.21, 9998.84, 115761.21, 59785.8, 143623.93, 146008.08, 505665.9]\ndef summarise(amounts):\n    return {"total": round(sum(amounts), 2), "average": round(sum(amounts) / len(amounts), 2), "largest": max(amounts)}\n\nprint(summarise(payments))`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Module 1 is complete',
      body: `<div class="callout tip"><b>Stop for a moment and look at what you have built.</b> A few weeks ago you had never written a line of Python. Now you can store data, make decisions, repeat jobs, handle messy values, and package your own tools. That is the whole foundation, and the best part is that everything in the next modules is built from exactly these pieces.</div>
<p>In this lesson you learned to:</p>
<ul>
<li>Define a function with <code>def</code>, give it parameters, and <b>call</b> it by name</li>
<li>Tell <code>print</code> (show on screen) from <code>return</code> (hand back a value), and know that no return means <code>None</code></li>
<li>Put decisions inside functions and use an early <code>return</code></li>
<li>Use <b>default parameters</b>, named arguments and docstrings</li>
<li>Understand <b>scope</b>: a function’s jars are private to it</li>
<li>Return a dictionary to package several facts</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What is the difference between <code>print</code> and <code>return</code>?</li>
<li>Why do we write functions instead of copying code?</li>
<li>What does a function return if it has no return statement?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> print writes a value to the screen for a human to read, and the value is not available afterwards. return sends a value back to the caller, so the program can store it and keep using it. A function that only prints cannot be used as part of further calculations.</p>
<p><b>2.</b> A function holds a piece of logic in one place, so it can be reused anywhere, and a change to the rule only has to be made once. Copied code drifts apart over time, and the copies disagree. Functions also give a name to an idea, which makes code easier to read and test.</p>
<p><b>3.</b> It returns None, Python’s value for “nothing”. This is why assigning the result of a function that only prints gives you None.</p>
</details>
<p><b>Coming next, in Module 2:</b> Pandas. Until now you have typed small lists and dictionaries by hand. Next you will load TradeFlow’s real CSV files, all 10,000 orders, into a DataFrame, and look at them with a handful of commands. Everything you learned here, the lists, the dictionaries, the loops and the functions, is what Pandas is made of underneath.</p>`
    }
  ]
}
);
