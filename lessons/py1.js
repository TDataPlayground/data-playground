LESSONS.push(
{
  id: 'py-1-1',
  track: 'python',
  lang: 'python',
  packages: [],
  files: [],
  setup: '',
  title: '1.1 Meet Python: your first lines of code',
  tables: [],
  intro: `You have spent weeks asking TradeFlow’s database questions in SQL, and you are good at it. Now TradeFlow’s Head of Data pulls a chair up beside your desk. <i>“Last week the CEO asked for the same report four times, each time with one small change. Every time, you rebuilt it by hand. I want to show you a tool that remembers your recipe, so the computer does the repeating and you do the thinking. It is called Python.”</i><br><br>Maybe the word “programming” makes you nervous. Take a breath. For an analyst, Python is not about building apps or becoming a software engineer. It is about <b>writing instructions in plain, readable lines and letting the computer follow them exactly</b>. In this first lesson you will write your very first lines, see what happens when you make a mistake (everybody does, and it is completely safe), and finish by doing a small calculation on real TradeFlow numbers. Nothing to install: the code runs right here on this page.`,
  steps: [
    {
      type: 'explain',
      title: 'What is Python, and why do analysts use it?',
      body: `<div class="callout analogy"><b>The big idea:</b> think about two ways of getting a meal. With <b>SQL</b>, you walk up to a counter and ask for something specific: “the ten biggest orders from Kenya, please.” The database hands it over. With <b>Python</b>, you are given a whole kitchen and a tireless assistant who follows your written recipe, word for word, as many times as you like. You can ask for that same dish tomorrow, or for a hundred variations of it, and the assistant never gets tired.</div>
<p>Spreadsheets and SQL are wonderful, and you will keep using them. But here is where Python earns its place in an analyst’s toolbox:</p>
<ul>
<li><b>Repeat without rebuilding.</b> Write the steps once. Run them again on tomorrow’s data with one click.</li>
<li><b>Clean and reshape data</b> far more flexibly than a single query can.</li>
<li><b>Draw charts, run statistics and build models</b> in the same place.</li>
<li><b>Automate.</b> The weekly report that takes an hour by hand becomes a script that runs in seconds.</li>
</ul>
<p>One small note about the videos: there we write Python in Google Colab, a free notebook from Google. On this platform you write it right inside the lesson. <b>The code is identical</b>, so everything you learn here works in Colab too.</p>`
    },
    {
      type: 'explain',
      title: 'Python reads your instructions from top to bottom, exactly as written',
      body: `<p>Picture a very obedient helper who has never cooked before. You hand over a recipe card. The helper reads line one, does it. Reads line two, does it. And so on, to the end. The helper never guesses what you meant and never skips ahead. If you write “add the salt” and there is no salt in the list, the helper stops and tells you so.</p>
<p>That is Python. A program is just <b>a list of instructions, one per line, carried out in order</b>. The instructions use ordinary English words, which is one reason Python is famous for being friendly to beginners.</p>
<p>The first instruction every programmer learns is <code>print</code>. It means: <i>“show this on the screen.”</i></p>`
    },
    {
      type: 'try',
      title: 'Your very first program',
      body: `<p>Press <b>Run</b>. You should see <code>Hello, TradeFlow!</code> appear. Congratulations, you are a programmer. Let’s read the line out loud, piece by piece:</p>
<ol>
<li><b>print</b>: “show something on the screen.” It is a <i>function</i>, a ready-made tool that Python already knows how to use.</li>
<li><b>( )</b>: the brackets are where you hand the tool the thing you want it to work on. Whatever sits inside the brackets is what gets printed.</li>
<li><b>"Hello, TradeFlow!"</b>: the actual message. The quotation marks tell Python “this is plain text, not an instruction.”</li>
</ol>
<p>Try changing the message to your own name and run it again. You cannot break anything.</p>`,
      code: `print("Hello, TradeFlow!")`
    },
    {
      type: 'explain',
      title: 'Why text needs quotation marks',
      body: `<p>Imagine writing a note to a colleague: <i>Please send Hello to the team.</i> Is “Hello” a word you want sent, or a thing, like a file called Hello? Humans work it out from context. Python cannot. So it needs a clear signal: <b>anything wrapped in quotation marks is text.</b> Anything without quotes, Python treats as a <i>name</i> it is supposed to already know.</p>
<p>Programmers call a piece of text a <b>string</b> (a string of characters, strung together like beads). You can use double quotes <code>"like this"</code> or single quotes <code>'like this'</code>. Both work. Just open and close with the same kind.</p>
<p>Let’s run several print lines together and watch Python obey them in order.</p>`
    },
    {
      type: 'try',
      title: 'Three instructions, three lines, in order',
      body: `<p>Python runs the top line first, then the next, then the next. Each <code>print</code> puts its message on a new line. Try swapping two of the lines around and running again: the output changes order too, because Python does exactly what you wrote, in the order you wrote it.</p>`,
      code: `print("TradeFlow sells in 5 countries")
print("It has 2000 customers")
print("And 10000 orders")`
    },
    {
      id: 'py-1-1-ex1',
      type: 'exercise',
      title: 'Your turn: a welcome message',
      body: `<p>Write one line of Python that prints exactly this message:</p>
<p><code>Welcome to TradeFlow</code></p>
<p><b>Think before you type:</b> you need the word <code>print</code>, then brackets, and inside the brackets the message wrapped in quotation marks. Capital letters and spaces matter: Python prints exactly what you give it.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `The shape is print("...") with your message between the quotation marks.`,
        `print("Welcome to TradeFlow")`
      ],
      solution: `print("Welcome to TradeFlow")`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Printing text and numbers together',
      body: `<p>Real analysis mixes words and numbers: “Customers: 2000”. Python lets you put several things inside one <code>print</code>, <b>separated by commas</b>, and it prints them on one line with a single space between each.</p>
<p>One important difference: <b>numbers do not need quotation marks.</b> <code>2000</code> is a number Python understands as a quantity. <code>"2000"</code> in quotes would just be the characters 2, 0, 0, 0 as text. For now, you simply write numbers bare.</p>`
    },
    {
      type: 'try',
      title: 'A label and a number on one line',
      body: `<p>Notice the comma between the text and the number, and that Python adds the space for you. Change <code>2000</code> to <code>2001</code> and run it again.</p>`,
      code: `print("Customers:", 2000)
print("Orders:", 10000)`
    },
    {
      id: 'py-1-1-ex2',
      type: 'exercise',
      title: 'Your turn: a label and a number',
      body: `<p>TradeFlow has 150 products. Print exactly this on <b>one line</b>:</p>
<p><code>Products: 150</code></p>
<p><b>Think before you type:</b> the label is text, so it needs quotation marks. The number does not. Put a comma between them, inside the print brackets.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `print("Products:", ...) then the number 150 with no quotation marks.`,
        `print("Products:", 150)`
      ],
      solution: `print("Products:", 150)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Comments: notes for humans',
      body: `<p>Soon your code will grow, and a month from now you will not remember why you wrote a line. Good analysts leave notes. In Python, anything after a <code>#</code> sign is a <b>comment</b>: Python ignores it completely, and it is there only for the humans reading the code.</p>
<div class="callout work"><b>At work:</b> a short comment such as <code># exclude cancelled orders</code> saves a colleague (or future you) from guessing what the line is for. Comments explain <i>why</i>, the code already says <i>what</i>.</div>`
    },
    {
      type: 'try',
      title: 'Python skips comments',
      body: `<p>Run this. Only two lines appear, even though there are four lines of text. The two lines beginning with <code>#</code> are comments, so Python skipped them. You can even put a comment at the end of a line, after the code.</p>`,
      code: `# This line is only a note for humans
print("Comments are ignored")  # so is this part
# print("This line would not run")
print("Only code runs")`
    },
    {
      id: 'py-1-1-c1',
      type: 'check',
      title: 'Which of these lines will Python actually run?',
      body: `<p>Think about what the <code>#</code> sign does.</p>`,
      options: ['# print("Hello")', 'print("Hello")  # say hello', 'both lines', 'neither line'],
      answer: 1,
      why: [
        'This line starts with #, so the whole line is a comment. Python skips it.',
        'Yes! The code comes before the #, so Python runs print("Hello") and ignores only the note at the end.',
        'Only the second one runs. The first is entirely a comment.',
        'The second line has real code before the #, so it does run.'
      ]
    },
    {
      type: 'explain',
      title: 'Mistakes are part of the job (and Python is kind about them)',
      body: `<p>Here is something nobody tells beginners: <b>professional programmers see error messages every single day.</b> An error is not a failure. It is Python politely saying “I got stuck here, and this is why.” Learning to read those messages is the most useful early skill you can build.</p>
<p>Every message in this platform tells you three things: the <b>kind</b> of problem, the <b>line number</b>, and a short <b>explanation</b>. Let’s cause two of the most common errors on purpose, so you recognise them when they appear.</p>`
    },
    {
      type: 'try',
      title: 'Error 1: a missing quotation mark (SyntaxError)',
      body: `<p>Run it. The message says <b>SyntaxError</b> on line 1 and mentions an <b>unterminated string literal</b>. In plain words: “you opened a piece of text with a quotation mark, but never closed it, so I cannot tell where the text ends.” A SyntaxError means the sentence is not written in a way Python can read, like a sentence with a missing full stop.</p>
<p>Fix it by adding the missing closing quotation mark after the exclamation mark, then run it again.</p>`,
      code: `print("Hello, TradeFlow!)`
    },
    {
      type: 'try',
      title: 'Error 2: forgetting the quotation marks (NameError)',
      body: `<p>This time the message says <b>NameError: name 'Hello' is not defined</b>. Remember our rule: without quotation marks, Python assumes <code>Hello</code> is the <i>name</i> of something it should already know. It looks for something called Hello, finds nothing, and tells you. The cure is to put the text in quotation marks.</p>
<p>When you see a NameError, ask yourself two questions: <i>did I forget quotation marks around text?</i> and <i>did I misspell a name?</i> That solves most of them.</p>`,
      code: `print(Hello)`
    },
    {
      id: 'py-1-1-c2',
      type: 'check',
      title: 'Python says: NameError: name \'Welcome\' is not defined. What is the most likely cause?',
      body: `<p>The code was <code>print(Welcome to TradeFlow)</code>.</p>`,
      options: ['Python is broken', 'The text was not wrapped in quotation marks, so Python took Welcome as a name it should know', 'The word print is spelled wrongly', 'Numbers are not allowed in print'],
      answer: 1,
      why: [
        'Python is fine. It is doing exactly what you wrote.',
        'Exactly! Without quotation marks Python thinks Welcome is a name, looks for it, and cannot find it. Wrapping the message in quotation marks fixes it.',
        'If print were misspelled, the NameError would name print, not Welcome.',
        'Numbers are fine in print. The problem is the missing quotation marks.'
      ]
    },
    {
      id: 'py-1-1-ex3',
      type: 'exercise',
      title: 'Your turn: fix the broken code',
      body: `<p>A colleague wrote this line, but it will not run. Find the mistake and fix it so that it prints:</p>
<p><code>TradeFlow sells in 5 countries</code></p>
<p><b>Think before you type:</b> run the broken code first and read the error message. It tells you the kind of error and the line number. What is missing?</p>`,
      starter: `print("TradeFlow sells in 5 countries)\n`,
      hints: [
        `Run it first. The message mentions an unterminated string literal: a quotation mark was opened but never closed.`,
        `print("TradeFlow sells in 5 countries")`
      ],
      solution: `print("TradeFlow sells in 5 countries")`,
      ordered: true
    },
    {
      id: 'py-1-1-ex4',
      type: 'exercise',
      title: 'Your turn: the five countries',
      body: `<p>TradeFlow trades in five countries. Print them, <b>one per line</b>, in exactly this order:</p>
<p><code>Nigeria</code>, <code>Ghana</code>, <code>Kenya</code>, <code>South Africa</code>, <code>Rwanda</code></p>
<p><b>Think before you type:</b> each print puts its message on a new line, so you need five print instructions, one under another. Remember the quotation marks around each country, and that “South Africa” is one piece of text with a space inside.</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `Five lines, each shaped like print("Nigeria"). Keep the order from the task.`,
        `print("Nigeria")\nprint("Ghana")\nprint("Kenya")\nprint("South Africa")\nprint("Rwanda")`
      ],
      solution: `print("Nigeria")\nprint("Ghana")\nprint("Kenya")\nprint("South Africa")\nprint("Rwanda")`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Python is also a very patient calculator',
      body: `<p>Because Python understands numbers, it can do arithmetic inside <code>print</code>. The signs are what you would expect, with <code>*</code> for multiply and <code>/</code> for divide. We will explore calculations properly in lesson 1.3. For now, here is a first taste, using a real TradeFlow fact: of the 10,000 orders, <b>7,412</b> are Completed.</p>`
    },
    {
      type: 'try',
      title: 'A first calculation on TradeFlow numbers',
      body: `<p>Two answers appear. <b>0.7412</b> is the share of orders that are Completed, as a decimal (74.12%). <b>2588</b> is how many orders are <i>not</i> Completed (still Processing, Cancelled or Returned). Python worked these out instantly, and it would do it just as quickly with ten million orders. Notice there are no quotation marks around the calculations: Python works them out first, and then prints the answer.</p>`,
      code: `print(7412 / 10000)
print(10000 - 7412)`
    },
    {
      id: 'py-1-1-ex5',
      type: 'exercise',
      title: 'Challenge: a calculation of your own',
      body: `<p>TradeFlow has <b>2,000 customers</b>, and <b>1,982</b> of them have placed at least one order. Print how many customers have <b>never ordered</b>. Your code should print just the number.</p>
<p><b>Think before you type:</b> “never ordered” means the customers who are left after you take away those who ordered. Which arithmetic sign takes one number away from another? Put the calculation inside <code>print</code>. (This matches the 18 customers we met in the SQL track.)</p>`,
      starter: `# Write your code below\n\n`,
      hints: [
        `You want 2000 minus 1982. The minus sign is -.`,
        `print(2000 - 1982)`
      ],
      solution: `print(2000 - 1982)`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>Look at what you just learned. In one short lesson you:</p>
<ul>
<li>Understood <b>why analysts use Python</b> alongside SQL and spreadsheets</li>
<li>Wrote instructions that Python runs <b>from top to bottom</b></li>
<li>Used <code>print</code> to show <b>text</b> (in quotation marks), <b>numbers</b> and <b>both together</b> with commas</li>
<li>Left <b>comments</b> with <code>#</code> for future you</li>
<li>Read two real <b>error messages</b> (SyntaxError and NameError) and fixed them</li>
<li>Used Python as a <b>calculator</b> on real TradeFlow numbers</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>Why would an analyst use Python when they already know SQL?</li>
<li>What does the <code>print</code> function do?</li>
<li>What is the difference between <code>print("Hello")</code> and <code>print(Hello)</code>?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> SQL is excellent for asking a database questions. Python covers everything around that: cleaning and reshaping data in flexible ways, running statistics, drawing charts, and above all automating work so a repeated report can be rerun in seconds instead of rebuilt by hand.</p>
<p><b>2.</b> <code>print</code> displays a value on the screen. You put what you want shown inside the brackets, and you can print text, numbers, or several things at once separated by commas.</p>
<p><b>3.</b> With quotation marks, <code>"Hello"</code> is text, so Python prints the word Hello. Without them, Python treats <code>Hello</code> as the name of something it should already know, cannot find it, and raises a NameError.</p>
</details>
<p><b>Coming next, in lesson 1.2:</b> variables. How do you make Python <i>remember</i> a number, such as TradeFlow’s 10,000 orders, so you can use it again and again without typing it every time? That single idea is the foundation of everything in Pandas.</p>`
    }
  ]
}
);
