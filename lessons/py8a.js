LESSONS.push(
{
  id: 'py-8-1',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: ``,
  title: '8.1 From recipes to tools: functions that work on tables',
  tables: [],
  intro: `It is Friday afternoon, and the CEO stops at your desk. <i>“Every Monday at eight I want the same pack from you: revenue, orders and the country table. Last week it took you three hours. Can it take three minutes?”</i><br><br>The Head of Data smiles. <i>“Every time you copy and paste the same ten lines, you can make a mistake. Write them once, give them a name, and call the name.”</i><br><br>This is the first lesson of Module 8, the last module of the Python track. You already know how to clean, merge, summarise and chart TradeFlow’s data by hand. Now you teach Python to do the repeatable parts for you. We start with the smallest unit of automation, the function, and bend it to the job an analyst does all day: taking a table in and handing a better one back.`,
  steps: [
    {
      type: 'explain',
      title: 'Why a three-hour report should not stay a three-hour report',
      body: `<p>Think about what you did last time you built a TradeFlow report. You loaded the tables. You cleaned the emails. You merged four tables into the master table. You checked that the totals agreed. You worked out the numbers. Maybe ten steps, written one after another in a notebook. It took three hours, and a good part of that time you were copying lines you had already written for an earlier report, and changing a name here and a year there.</p>
<p>That way of working has three quiet costs.</p>
<ul>
<li><b>Time.</b> Anything you do every Monday, you will do fifty times a year. Three hours becomes a hundred and fifty.</li>
<li><b>Mistakes.</b> Every copy is a chance to forget something. One report forgets the <code>validate</code> check on a merge, another uses a different definition of revenue, and nobody notices until a director asks why two slides disagree.</li>
<li><b>No memory.</b> When the CEO asks “how did you get that number?”, the honest answer is “somewhere in a notebook, I think”.</li>
</ul>
<p>The cure is something you already know from lesson 1.9: the <b>function</b>, which is a recipe card. You write the recipe once, give it a clear name, and from then on you just say the name. The big step in this module is to use functions on <b>tables</b>. A function that takes a messy table and hands back a clean one is a <b>tool</b>, and a handful of tools in a fixed order is a <b>pipeline</b>, which is where lesson 8.2 is heading.</p>
<p>Good analyst tools share five habits. Learn them now, because every function you write for the rest of your career will be better for them:</p>
<table class="mini">
<tr><th>Habit</th><th>What it means</th><th>Example</th></tr>
<tr><td><b>One job</b></td><td>The function does one thing, and you can say what in one sentence</td><td>“Make emails lowercase”</td></tr>
<tr><td><b>A verb for a name</b></td><td>The name says what happens</td><td><code>clean_emails</code>, <code>build_master</code></td></tr>
<tr><td><b>Inputs in, answer out</b></td><td>Everything it needs arrives as an argument, and the result comes back with <code>return</code></td><td><code>def net_revenue(master): ... return total</code></td></tr>
<tr><td><b>No surprises</b></td><td>It never changes the table you gave it</td><td>It works on a <code>.copy()</code></td></tr>
<tr><td><b>A one-line explanation</b></td><td>A short <b>docstring</b>, written between triple quotes as the first line inside</td><td><code>"""Make emails lowercase."""</code></td></tr>
</table>
<div class="callout analogy"><b>The kitchen drawer.</b> A messy cook has one enormous knife for everything. A good cook has a small drawer of tools, each labelled by what it does: peeler, whisk, grater. Next week’s dish takes a minute to start, because the tools are already in the drawer. That drawer is what you are about to build for TradeFlow.</div>`
    },
    {
      type: 'try',
      title: 'The same cleaning, written as a tool',
      body: `<p>Here is the email cleaning from lesson 3.4, first as a loose line and then as a function. Read the function aloud: “<code>clean_emails</code> takes a column of emails, strips the spaces and makes everything lowercase, and gives the result back.”</p>
<p>The payoff shows in the two numbers. Before cleaning, <b>602</b> customers look like Gmail users. After cleaning, <b>618</b> do, because 16 Gmail addresses were typed with capital letters. Marketing’s old number and the dashboard’s number were both correct. They just used different rules, which is exactly the kind of disagreement a shared tool prevents.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")
raw = customers["email"]

def clean_emails(emails):
    return emails.str.strip().str.lower()

print(raw.str.contains("@gmail.com", na=False).sum())
print(clean_emails(raw).str.contains("@gmail.com", na=False).sum())
`
    },
    {
      type: 'explain',
      title: 'Tools that take a table and give one back',
      body: `<p>A function in lesson 1.9 took a number or a list and gave something back. Analyst functions do the same with <b>tables</b> and <b>columns</b>. The table goes in as an argument, and a new table or number comes out through <code>return</code>.</p>
<p>That sounds obvious, and yet there is one trap here that has cost real companies real money. It is called a <b>side effect</b>.</p>
<p>When you hand a table to a function, you do not hand over a photocopy. You hand over the <b>table itself</b>. Think of lending a colleague your actual notebook instead of a photocopy of a page. If the function writes into it, the writing stays in your notebook after the function is finished, even though you never wrote anything yourself. Pandas tables behave like this: if a function does <code>table["email"] = ...</code> on the table it received, the caller’s table changes too.</p>
<p>The fix is a habit of one short line. The first thing a careful function does is <code>result = table.copy()</code>, and from then on it works on <code>result</code>. The original stays exactly as it was. The function becomes <b>predictable</b>: the same input always gives the same output, and nothing else in the program is touched.</p>
<p>Why does this matter for a Monday report? Imagine the pipeline cleans the emails in step 2, and a colleague’s function in step 5 quietly changes the same table again. Now the numbers on the slide depend on what order things ran in, and nobody can explain why. Predictable functions are what let you trust a report you did not watch being made.</p>
<div class="callout watch"><b>The signs of a side effect.</b> A function that changes its input usually looks innocent: it assigns into the table it received, or it calls <code>inplace=True</code>, or it sorts in place. If a function returns a table, let it return a <b>new</b> table and leave the old one alone.</div>
<div class="callout tip"><b>Copy once, at the top.</b> You do not need a copy before every line. One <code>.copy()</code> at the start of the function is enough, and then you can change <code>result</code> as much as you like.</div>`
    },
    {
      type: 'try',
      title: 'The careless function and the careful one',
      body: `<p>Two functions that do the same job of lowercasing emails. The careful one copies first. The careless one writes straight into the table it was given.</p>
<p>Watch the three printed lines. At the start, <b>50</b> customers have a capital letter in their email. After the careful function, the result has none and the original <b>still has 50</b>, untouched. After the careless function, the result has none, but look at the original: it has <b>0</b> as well. You never assigned anything to <code>customers</code>, and yet the table changed behind your back.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

def count_uppercase(table):
    return table["email"].str.contains("[A-Z]", na=False).sum()

def careful_lower(table):
    result = table.copy()
    result["email"] = result["email"].str.lower()
    return result

def careless_lower(table):
    table["email"] = table["email"].str.lower()
    return table

print("Original, to start with:", count_uppercase(customers))

fixed = careful_lower(customers)
print("After the careful function:", count_uppercase(fixed), "in the result,", count_uppercase(customers), "in the original")

fixed = careless_lower(customers)
print("After the careless function:", count_uppercase(fixed), "in the result,", count_uppercase(customers), "in the original")
`
    },
    {
      id: 'py-8-1-ex1',
      type: 'exercise',
      title: 'Your turn: your first table tool',
      body: `<p>The marketing manager still wants a clean Gmail count, and she wants it from a tool she can reuse. Write a function called <code>clean_emails</code> that takes a column of emails and returns it with the spaces stripped and every letter in lowercase. Then use it on <code>customers["email"]</code> and print how many cleaned emails contain <code>@gmail.com</code>.</p>
<p>You should see one number on one line.</p>
<p><b>Think before you type:</b> the function needs one argument and one <code>return</code>. Inside, chain <code>.str.strip()</code> and <code>.str.lower()</code>. To count, use <code>.str.contains("@gmail.com", na=False).sum()</code> on the returned column. The <code>na=False</code> tells Pandas that a missing email is not a Gmail address.</p>`,
      starter: `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\n\n# Write your code below\n`,
      hints: [
        `Write def clean_emails(emails): then return emails.str.strip().str.lower(). Then cleaned = clean_emails(customers["email"]) and print(cleaned.str.contains("@gmail.com", na=False).sum()).`,
        `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\n\ndef clean_emails(emails):\n    return emails.str.strip().str.lower()\n\ncleaned = clean_emails(customers["email"])\nprint(cleaned.str.contains("@gmail.com", na=False).sum())\n`
      ],
      solution: `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\n\ndef clean_emails(emails):\n    return emails.str.strip().str.lower()\n\ncleaned = clean_emails(customers["email"])\nprint(cleaned.str.contains("@gmail.com", na=False).sum())\n`,
      ordered: true
    },
    {
      id: 'py-8-1-c1',
      type: 'check',
      title: 'Months after a colleague wrote a cleaning function, someone notices that the original customers table, which nobody cleaned, now has lowercase emails. What is the most likely cause?',
      body: `<p>Think about what a function receives when you give it a table.</p>`,
      options: [
        'The function wrote into the table it received instead of working on a copy',
        'Pandas lowercases emails automatically when a file is read',
        'The customers file on disk was changed by the function',
        'Lowercase emails always appear after a table is printed'
      ],
      answer: 0,
      why: [
        'Right! A function receives the table itself, not a photocopy. If it assigns into that table, the caller’s table changes too. The fix is one line at the top of the function: <code>result = table.copy()</code>, then work on <code>result</code>.',
        'Pandas never changes the text it reads. Capital letters stay capital until something in your code changes them.',
        'The function works on the table in memory. The file on disk is not touched unless you save the table back to it.',
        'Printing a table only shows it. It does not change a single value.'
      ]
    },
    {
      type: 'explain',
      title: 'A toolkit, one job at a time',
      body: `<p>Now plan the whole drawer. Everything you did by hand in Modules 3 and 4 falls into four jobs, and each job becomes one function:</p>
<table class="mini">
<tr><th>Job</th><th>Function</th><th>Takes</th><th>Gives back</th></tr>
<tr><td>Read the files</td><td><code>load_tables()</code></td><td>Nothing</td><td>A dictionary of six tables</td></tr>
<tr><td>Tidy the text</td><td><code>clean_emails(emails)</code>, <code>add_clean_name(customers)</code></td><td>A column or a table</td><td>A clean column or a new table</td></tr>
<tr><td>Join into one table</td><td><code>build_master(tables)</code></td><td>The dictionary of tables</td><td>The master table</td></tr>
<tr><td>Work out a number</td><td><code>net_revenue(master)</code></td><td>The master table</td><td>One number</td></tr>
</table>
<p>Look at <code>load_tables</code> first. It has no inputs, because the files are always the same six. It returns a <b>dictionary</b> (lesson 1.5) with the table name as the key and the table as the value, so <code>tables["orders"]</code> is the orders table. Why a dictionary and not six separate variables? Because it travels as <b>one thing</b>. The next function can take <code>tables</code> as a single argument instead of six, and adding a seventh table later changes nothing about how the others are called.</p>
<p>Inside it uses a loop (lesson 1.7) over the six names. For each name it reads <code>name + ".csv"</code> and stores the table under that name. Notice the docstring on the first line inside the function. It is a sentence in triple quotes, it costs nothing to run, and in six months it is the reason you still remember what the function does.</p>
<p>Notice too what the function does <b>not</b> do. It does not print anything and it does not clean anything. It reads. Cleaning is another function’s job. Small, single-purpose tools are easier to name, easier to test and easier to reuse in a different report.</p>
<div class="callout work"><b>At work:</b> in a real company <code>load_tables</code> would call a database or an export from the finance system. When that source changes, you change <b>one function</b>, and every report that uses it keeps working. That is the real reason to put reading in its own tool.</div>`
    },
    {
      type: 'try',
      title: 'load_tables: six tables, one dictionary',
      body: `<p>First the function, then a loop over the dictionary with <code>.items()</code>, which hands you each name with its table. <code>table.shape</code> gives the rows and columns.</p>
<p>Check the numbers against the data you already know: 2,000 customers, 10,000 orders, 150 products, 10,000 payments, 9,500 deliveries and 25,000 order lines.</p>`,
      code: `import pandas as pd

def load_tables():
    """Read the six TradeFlow tables and return them in one dictionary."""
    tables = {}
    for name in ["customers", "orders", "products", "payments", "deliveries", "order_items"]:
        tables[name] = pd.read_csv(name + ".csv")
    return tables

tables = load_tables()
for name, table in tables.items():
    print(name, table.shape)
`
    },
    {
      id: 'py-8-1-ex2',
      type: 'exercise',
      title: 'Your turn: write load_tables yourself',
      body: `<p>Write the <code>load_tables</code> function from the card above, without looking back. It should return a dictionary with the six tables. Then call it and print the <b>total number of rows</b> across all six tables.</p>
<p>You should see one number on one line.</p>
<p><b>Think before you type:</b> start with an empty dictionary. Loop over the six table names, read each file with <code>pd.read_csv(name + ".csv")</code>, and store it with <code>tables[name] = ...</code>. Return the dictionary. To count the rows afterwards, add up <code>len(table)</code> for every table in <code>tables.values()</code>.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `Start with tables = {} inside def load_tables():. Loop for name in [the six names], then tables[name] = pd.read_csv(name + ".csv"). Finish with return tables. Then total = sum(len(table) for table in tables.values()).`,
        `import pandas as pd\n\ndef load_tables():\n    tables = {}\n    for name in ["customers", "orders", "products", "payments", "deliveries", "order_items"]:\n        tables[name] = pd.read_csv(name + ".csv")\n    return tables\n\ntables = load_tables()\nprint(sum(len(table) for table in tables.values()))\n`
      ],
      solution: `import pandas as pd\n\ndef load_tables():\n    tables = {}\n    for name in ["customers", "orders", "products", "payments", "deliveries", "order_items"]:\n        tables[name] = pd.read_csv(name + ".csv")\n    return tables\n\ntables = load_tables()\nprint(sum(len(table) for table in tables.values()))\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A cleaning tool that adds, never overwrites',
      body: `<p>In lesson 3.4 you removed titles such as <code>Dr.</code> and suffixes such as <code>PhD</code> from customer names, and counted that <b>71</b> of the 2,000 names change. Turning that into a function is a good chance to learn one more professional habit: <b>add a new column, do not overwrite the old one</b>.</p>
<p>Why? Because cleaning is an opinion. You decided that “Dr. Erica Oconnell” and “Erica Oconnell” are the same text for matching purposes. A year later someone may need the original, for a letter that must say “Dr.”. If you wrote over the column, the original is gone. If you added a column called <code>clean_name</code>, both exist, and you can always trace one back to the other.</p>
<p>Look at what the function below does, line by line:</p>
<ol>
<li>It keeps the two patterns from lesson 3.4 for titles at the start (<code>^</code>) and suffixes at the end (<code>$</code>).</li>
<li>It makes a copy of the table, so the caller’s table is left alone.</li>
<li>It creates the new column by stripping the title and then the suffix.</li>
<li>It returns the copy.</li>
</ol>
<p>One more lesson from 3.4 deserves repeating here. After cleaning, the number of different names falls from <b>1,976</b> to <b>1,973</b>, because three pairs of customers became identical on paper. That does <b>not</b> mean they are the same person. The customer ID, not the name, is what identifies someone. A tool that cleans names for display or matching must never be used to merge customers.</p>
<div class="callout watch"><b>Keep the patterns inside the function.</b> You will often see patterns written at the top of a file as capitalised constants, such as <code>TITLE</code> and <code>SUFFIX</code>. That is fine, and the exercise below does it. Just remember what the capitals mean: a value that never changes while the program runs.</div>`
    },
    {
      type: 'try',
      title: 'add_clean_name at work',
      body: `<p>Run it and read the four printed facts. First the 71 names that changed. Then a peek at the first four changed rows, with the original beside the clean version. Then the different-name counts before and after, 1,976 and 1,973. The last line asks whether the <i>original</i> customers table now has a <code>clean_name</code> column, and the answer is <code>False</code>, because the function worked on a copy.</p>`,
      code: `import pandas as pd

customers = pd.read_csv("customers.csv")

def add_clean_name(customers):
    """Return a copy of the customers table with a clean_name column (no titles, no suffixes)."""
    title = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "
    suffix = r" (MD|PhD|DDS|DVM|Jr\\.|II|III|IV)$"
    result = customers.copy()
    result["clean_name"] = result["customer_name"].str.replace(title, "", regex=True).str.replace(suffix, "", regex=True)
    return result

tidy = add_clean_name(customers)

changed = tidy[tidy["clean_name"] != tidy["customer_name"]]
print(len(changed))
print(changed[["customer_name", "clean_name"]].head(4))
print(customers["customer_name"].nunique(), tidy["clean_name"].nunique())
print("clean_name" in customers.columns)
`
    },
    {
      id: 'py-8-1-ex3',
      type: 'exercise',
      title: 'Your turn: add_clean_name, with a proof that it is safe',
      body: `<p>The two patterns are in the starter as capitalised constants. Write a function <code>add_clean_name(customers)</code> that returns a <b>copy</b> of the table with a new <code>clean_name</code> column, where the title and the suffix have been removed. Then call it and print two things, each on its own line:</p>
<ul>
<li>how many names changed (where <code>clean_name</code> differs from <code>customer_name</code>)</li>
<li>whether the <b>original</b> <code>customers</code> table has a <code>clean_name</code> column</li>
</ul>
<p>You should see <code>71</code> and then <code>False</code>.</p>
<p><b>Think before you type:</b> the first line of the function is the copy. Then add the column with two <code>.str.replace(..., "", regex=True)</code> calls chained. Return the copy. For the second fact, <code>"clean_name" in customers.columns</code> gives True or False.</p>`,
      starter: `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\n\nTITLE = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "\nSUFFIX = r" (MD|PhD|DDS|DVM|Jr\\.|II|III|IV)$"\n\n# Write your code below\n`,
      hints: [
        `Begin with result = customers.copy(). Then result["clean_name"] = result["customer_name"].str.replace(TITLE, "", regex=True).str.replace(SUFFIX, "", regex=True). End with return result.`,
        `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\n\nTITLE = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "\nSUFFIX = r" (MD|PhD|DDS|DVM|Jr\\.|II|III|IV)$"\n\ndef add_clean_name(customers):\n    result = customers.copy()\n    result["clean_name"] = result["customer_name"].str.replace(TITLE, "", regex=True).str.replace(SUFFIX, "", regex=True)\n    return result\n\ntidy = add_clean_name(customers)\nprint((tidy["clean_name"] != tidy["customer_name"]).sum())\nprint("clean_name" in customers.columns)\n`
      ],
      solution: `import pandas as pd\n\ncustomers = pd.read_csv("customers.csv")\n\nTITLE = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "\nSUFFIX = r" (MD|PhD|DDS|DVM|Jr\\.|II|III|IV)$"\n\ndef add_clean_name(customers):\n    result = customers.copy()\n    result["clean_name"] = result["customer_name"].str.replace(TITLE, "", regex=True).str.replace(SUFFIX, "", regex=True)\n    return result\n\ntidy = add_clean_name(customers)\nprint((tidy["clean_name"] != tidy["customer_name"]).sum())\nprint("clean_name" in customers.columns)\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The merge recipe becomes one call',
      body: `<p>The biggest recipe of all is the one from lesson 4.6: three merges, one multiplication and two date steps that produce the <b>master table</b>. You have probably copied those ten lines into several notebooks. Now they become one function, <code>build_master(tables)</code>.</p>
<p>It takes the dictionary from <code>load_tables</code> and returns the master table: one row per order line, with the product name and category, the order date and status, the country, and a <code>line_total</code> column. Read the body as the story you already know: take the order lines, attach the product facts, attach the order facts, attach the customer’s country, work out each line’s total, turn the dates into real dates, and add the year.</p>
<p>Two details are worth pointing out because they are what make it a <b>professional</b> function.</p>
<p><b>First, <code>validate="many_to_one"</code> on every merge.</b> It says “many order lines belong to one product, and I insist that each product appears only once in the products table”. If someone ever hands you a products table with a repeated product, Pandas stops with an error instead of quietly multiplying your rows and inflating your revenue. You will see that save the day in lesson 8.2.</p>
<p><b>Second, it returns the master table without printing a thing.</b> Showing the shape or the revenue is the job of the code that <i>uses</i> the tool. The tool just builds.</p>
<p>When the function is right, the long recipe disappears from your notebook. Your report starts with <code>master = build_master(load_tables())</code> and you can read the intent at a glance.</p>
<div class="callout work"><b>At work:</b> every analytics team has a function like this, often called something like <code>build_base_table</code>. When the finance team changes the rule for revenue, one person edits one function, and every dashboard picks up the change the next morning.</div>`
    },
    {
      type: 'try',
      title: 'build_master, and a tie-out to prove it',
      body: `<p>The two functions together, then a tie-out in the style of lesson 6.1: does the master table’s revenue match the payments table’s total?</p>
<p>The shape is <b>(25000, 13)</b>: all 25,000 order lines survived the merges, with 13 columns. Both totals come to <b>1,581,981,450.50</b>, to the cent, so the last line prints <code>True</code>. A tool that passes its tie-out is a tool you can trust.</p>`,
      code: `import pandas as pd

def load_tables():
    """Read the six TradeFlow tables and return them in one dictionary."""
    tables = {}
    for name in ["customers", "orders", "products", "payments", "deliveries", "order_items"]:
        tables[name] = pd.read_csv(name + ".csv")
    return tables

def build_master(tables):
    """One row per order line, with product, order and customer facts and a line_total."""
    master = tables["order_items"].merge(tables["products"][["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")
    master = master.merge(tables["orders"][["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")
    master = master.merge(tables["customers"][["customer_id", "country"]], on="customer_id", validate="many_to_one")
    master["line_total"] = master["quantity"] * master["unit_price"]
    master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")
    master["order_year"] = master["order_date"].dt.year
    return master

tables = load_tables()
master = build_master(tables)

print(master.shape)
print(round(master["line_total"].sum(), 2))
print(round(tables["payments"]["amount"].sum(), 2))
print(round(master["line_total"].sum(), 2) == round(tables["payments"]["amount"].sum(), 2))
`
    },
    {
      id: 'py-8-1-ex4',
      type: 'exercise',
      title: 'Your turn: write build_master',
      body: `<p>The starter already has <code>load_tables</code> and the loaded <code>tables</code>. Write <code>build_master(tables)</code>. It should merge the order lines with the products (<code>product_id</code>, <code>product_name</code>, <code>category</code>), then with the orders (<code>order_id</code>, <code>customer_id</code>, <code>order_date</code>, <code>order_status</code>), then with the customers (<code>customer_id</code>, <code>country</code>), each with <code>validate="many_to_one"</code>. Then add <code>line_total</code> (quantity times unit price), convert <code>order_date</code> with the format <code>%Y-%m-%d</code>, add <code>order_year</code>, and return the result.</p>
<p>Then print the shape of the master table and its total revenue rounded to 2 decimals. You should see <code>(25000, 13)</code> and then <code>1581981450.5</code>.</p>
<p><b>Think before you type:</b> this is the recipe from lesson 4.6, with <code>tables["order_items"]</code> in place of <code>order_items</code> and so on. Do the work inside the function and finish with <code>return master</code>.</p>`,
      starter: `import pandas as pd\n\ndef load_tables():\n    tables = {}\n    for name in ["customers", "orders", "products", "payments", "deliveries", "order_items"]:\n        tables[name] = pd.read_csv(name + ".csv")\n    return tables\n\ntables = load_tables()\n\n# Write your code below\n`,
      hints: [
        `Start with master = tables["order_items"].merge(tables["products"][["product_id", "product_name", "category"]], on="product_id", validate="many_to_one"). Merge in the orders and the customers the same way, then add line_total, the dates and order_year. End with return master.`,
        `import pandas as pd\n\ndef load_tables():\n    tables = {}\n    for name in ["customers", "orders", "products", "payments", "deliveries", "order_items"]:\n        tables[name] = pd.read_csv(name + ".csv")\n    return tables\n\ntables = load_tables()\n\ndef build_master(tables):\n    master = tables["order_items"].merge(tables["products"][["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")\n    master = master.merge(tables["orders"][["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")\n    master = master.merge(tables["customers"][["customer_id", "country"]], on="customer_id", validate="many_to_one")\n    master["line_total"] = master["quantity"] * master["unit_price"]\n    master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")\n    master["order_year"] = master["order_date"].dt.year\n    return master\n\nmaster = build_master(tables)\nprint(master.shape)\nprint(round(master["line_total"].sum(), 2))\n`
      ],
      solution: `import pandas as pd\n\ndef load_tables():\n    tables = {}\n    for name in ["customers", "orders", "products", "payments", "deliveries", "order_items"]:\n        tables[name] = pd.read_csv(name + ".csv")\n    return tables\n\ntables = load_tables()\n\ndef build_master(tables):\n    master = tables["order_items"].merge(tables["products"][["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")\n    master = master.merge(tables["orders"][["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")\n    master = master.merge(tables["customers"][["customer_id", "country"]], on="customer_id", validate="many_to_one")\n    master["line_total"] = master["quantity"] * master["unit_price"]\n    master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")\n    master["order_year"] = master["order_date"].dt.year\n    return master\n\nmaster = build_master(tables)\nprint(master.shape)\nprint(round(master["line_total"].sum(), 2))\n`,
      ordered: true
    },
    {
      id: 'py-8-1-c2',
      type: 'check',
      title: 'A colleague writes net_revenue so that it prints the total instead of returning it. What goes wrong when a pipeline calls it?',
      body: `<p>Remember the difference between showing a value to a person and handing it back to the code.</p>`,
      options: [
        'Nothing, because print and return do the same thing',
        'The next step receives nothing (None), because print only shows the value to a human, and a pipeline needs the value handed back with return',
        'The function runs twice',
        'Python converts the printed text into a number automatically'
      ],
      answer: 1,
      why: [
        'They look alike on the screen, but they are different. A printed value goes to the screen and disappears. A returned value can be stored, tested and passed to the next step.',
        'Right! <code>print</code> is for people and <code>return</code> is for code. Inside a pipeline, the result of <code>net_revenue(master)</code> is stored or checked by the next line. If the function only prints, that line gets <code>None</code> and everything after it breaks or silently shows nothing.',
        'The function runs once. The problem is what it hands back, which is nothing.',
        'Python never turns printed text into a value. Once something is printed, the program cannot use it any more.'
      ]
    },
    {
      type: 'explain',
      title: 'A function you have not tested is a guess',
      body: `<p>You now have four tools. Before they go anywhere near the CEO’s report, you must ask the honest question: <b>do they actually do what you think they do?</b></p>
<p>Running a function on 25,000 rows and seeing a number tells you almost nothing. If <code>net_revenue</code> returns 1,419,860,053, is that right? You cannot add up 25,000 lines in your head. If it were quietly wrong, the number would look just as believable.</p>
<p>The professional answer is the <b>tiny test</b>. You build a table with a handful of rows, so small that you can work out the right answer by hand, and you check that the function agrees. For <code>net_revenue</code>:</p>
<ul>
<li>A tiny table of four orders, one in each status, with line totals 100, 50, 25 and 10.</li>
<li>Only Completed (100) and Processing (25) count, so the answer must be <b>125</b>. Cancelled (50) and Returned (10) must be left out.</li>
</ul>
<p>The check itself is the <code>assert</code> statement you met in lesson 3.5: <code>assert net_revenue(tiny) == 125, "message"</code>. If the function is right, nothing happens. If it is wrong, the program stops and shows your message.</p>
<p>Good tests ask three kinds of question:</p>
<table class="mini">
<tr><th>Kind of test</th><th>The question</th><th>Example for net_revenue</th></tr>
<tr><td><b>Normal</b></td><td>Does it give the right answer for ordinary input?</td><td>The four-row table gives 125</td></tr>
<tr><td><b>Edge</b></td><td>What happens at the extremes?</td><td>An empty table gives 0, not an error</td></tr>
<tr><td><b>Failure</b></td><td>Does a wrong expectation get caught?</td><td>An assert that must fail does fail</td></tr>
</table>
<p>The habit costs five minutes and saves days. When you change a function next month, you run the same tests again, and in two seconds you know whether you broke something.</p>
<div class="callout analogy"><b>The scale in the kitchen.</b> A baker checks a new scale by weighing a one-kilo bag of flour. If it reads one kilo, she trusts it with the real recipe. If it reads 1.2, she has saved the whole batch. The tiny table is your one-kilo bag.</div>`
    },
    {
      type: 'try',
      title: 'Three tests, one that fails on purpose',
      body: `<p>The first test checks the normal case, the second the edge case (an empty table), and the third is a test that is <b>wrong on purpose</b>, to show you what a failing test looks like. It is wrapped in <code>try</code> and <code>except AssertionError</code> so that the program prints the message and carries on, as you learned in lesson 3.5.</p>
<p>Notice that the tests need no files and run instantly. That is the beauty of a tiny table.</p>`,
      code: `import pandas as pd

def net_revenue(master):
    """Revenue of Completed and Processing orders only."""
    kept = master[master["order_status"].isin(["Completed", "Processing"])]
    return kept["line_total"].sum()

tiny = pd.DataFrame({
    "order_status": ["Completed", "Cancelled", "Processing", "Returned"],
    "line_total": [100, 50, 25, 10]
})

assert net_revenue(tiny) == 125, "net revenue should be 100 + 25"
print("Test 1 passed: Cancelled and Returned are left out")

empty = tiny.iloc[0:0]
assert net_revenue(empty) == 0, "an empty table should give zero"
print("Test 2 passed: an empty table gives zero")

try:
    assert net_revenue(tiny) == 185, "this test is wrong on purpose"
except AssertionError as error:
    print("Test 3 failed, as planned:", error)
`
    },
    {
      id: 'py-8-1-c3',
      type: 'check',
      title: 'Why do you test net_revenue on a tiny four-row table before you trust it on the 25,000-line master table?',
      body: `<p>Think about whether you can tell if a big number is right.</p>`,
      options: [
        'Tiny tables run faster, and speed is the only reason',
        'Because the real master table cannot be used in a test',
        'On four rows you can work out the correct answer by hand, so a wrong function is caught at once. On 25,000 rows nobody can tell whether the number is right',
        'Functions only work on tables with fewer than ten rows'
      ],
      answer: 2,
      why: [
        'Speed is a nice side effect, but it is not the reason. The reason is that you can <b>verify</b> the answer.',
        'The master table can be used in many ways. The point is that a test needs an answer you already know.',
        'Right! A test is only useful if you know the correct answer in advance. A four-row table gives you that, because 100 + 25 = 125 is easy to check. A wrong function shows itself immediately.',
        'Functions work on tables of any size. The tiny table is chosen for a different reason: you can check it by hand.'
      ]
    },
    {
      id: 'py-8-1-ex5',
      type: 'exercise',
      title: 'Challenge: write net_revenue and prove it',
      body: `<p>The starter has <code>load_tables</code>, <code>build_master</code> and a real <code>master</code> table, plus a <code>tiny</code> table with a known answer. Write the function <code>net_revenue(master)</code>, which returns the total <code>line_total</code> of orders whose status is Completed or Processing. Then:</p>
<ol>
<li>Test it on <code>tiny</code> with an <code>assert</code> that the answer is 125, and print <code>Test passed</code>.</li>
<li>Print the net revenue of the real master table, rounded to 2 decimals.</li>
</ol>
<p>You should see <code>Test passed</code> and then <code>1419860053.32</code>.</p>
<p><b>Think before you type:</b> filter first with <code>master["order_status"].isin(["Completed", "Processing"])</code>, then add up <code>line_total</code> of the kept rows, and <code>return</code> it. Write the test <b>before</b> you run the function on the real data.</p>`,
      starter: `import pandas as pd\n\ndef load_tables():\n    tables = {}\n    for name in ["customers", "orders", "products", "payments", "deliveries", "order_items"]:\n        tables[name] = pd.read_csv(name + ".csv")\n    return tables\n\ndef build_master(tables):\n    master = tables["order_items"].merge(tables["products"][["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")\n    master = master.merge(tables["orders"][["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")\n    master = master.merge(tables["customers"][["customer_id", "country"]], on="customer_id", validate="many_to_one")\n    master["line_total"] = master["quantity"] * master["unit_price"]\n    master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")\n    master["order_year"] = master["order_date"].dt.year\n    return master\n\nmaster = build_master(load_tables())\n\ntiny = pd.DataFrame({\n    "order_status": ["Completed", "Cancelled", "Processing", "Returned"],\n    "line_total": [100, 50, 25, 10]\n})\n\n# Write your function and your test below\n`,
      hints: [
        `def net_revenue(master): kept = master[master["order_status"].isin(["Completed", "Processing"])], then return kept["line_total"].sum(). Test with assert net_revenue(tiny) == 125, "..." and print("Test passed").`,
        `import pandas as pd\n\ndef load_tables():\n    tables = {}\n    for name in ["customers", "orders", "products", "payments", "deliveries", "order_items"]:\n        tables[name] = pd.read_csv(name + ".csv")\n    return tables\n\ndef build_master(tables):\n    master = tables["order_items"].merge(tables["products"][["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")\n    master = master.merge(tables["orders"][["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")\n    master = master.merge(tables["customers"][["customer_id", "country"]], on="customer_id", validate="many_to_one")\n    master["line_total"] = master["quantity"] * master["unit_price"]\n    master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")\n    master["order_year"] = master["order_date"].dt.year\n    return master\n\nmaster = build_master(load_tables())\n\ntiny = pd.DataFrame({\n    "order_status": ["Completed", "Cancelled", "Processing", "Returned"],\n    "line_total": [100, 50, 25, 10]\n})\n\ndef net_revenue(master):\n    kept = master[master["order_status"].isin(["Completed", "Processing"])]\n    return kept["line_total"].sum()\n\nassert net_revenue(tiny) == 125, "net revenue of the tiny table should be 125"\nprint("Test passed")\nprint(round(net_revenue(master), 2))\n`
      ],
      solution: `import pandas as pd\n\ndef load_tables():\n    tables = {}\n    for name in ["customers", "orders", "products", "payments", "deliveries", "order_items"]:\n        tables[name] = pd.read_csv(name + ".csv")\n    return tables\n\ndef build_master(tables):\n    master = tables["order_items"].merge(tables["products"][["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")\n    master = master.merge(tables["orders"][["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")\n    master = master.merge(tables["customers"][["customer_id", "country"]], on="customer_id", validate="many_to_one")\n    master["line_total"] = master["quantity"] * master["unit_price"]\n    master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")\n    master["order_year"] = master["order_date"].dt.year\n    return master\n\nmaster = build_master(load_tables())\n\ntiny = pd.DataFrame({\n    "order_status": ["Completed", "Cancelled", "Processing", "Returned"],\n    "line_total": [100, 50, 25, 10]\n})\n\ndef net_revenue(master):\n    kept = master[master["order_status"].isin(["Completed", "Processing"])]\n    return kept["line_total"].sum()\n\nassert net_revenue(tiny) == 125, "net revenue of the tiny table should be 125"\nprint("Test passed")\nprint(round(net_revenue(master), 2))\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You have turned a three-hour notebook into the beginnings of a toolkit. You can:</p>
<ul>
<li>Explain the <b>cost of copy-paste</b>: time, mistakes and no memory of how a number was made</li>
<li>Write a function that <b>takes a table or column and returns a new one</b>, with a docstring and a verb for a name</li>
<li>Avoid <b>side effects</b> by working on a <code>.copy()</code>, and show with a test that the original is untouched</li>
<li>Write <code>load_tables</code>, <code>clean_emails</code>, <code>add_clean_name</code>, <code>build_master</code> and <code>net_revenue</code>, each with <b>one job</b></li>
<li>Add a <b>new column</b> for a cleaned value instead of overwriting the original</li>
<li>Use <code>return</code> for the code and <code>print</code> only for people</li>
<li>Write <b>tiny tests</b> with a known answer, covering a normal case, an edge case and a failure</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>Why would you turn a recipe you use often into a function?</li>
<li>What is a side effect in a function that works on a table, and how do you avoid it?</li>
<li>How would you test a function that calculates revenue?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> A function writes the logic once, so every report uses the same rule and there is one place to fix it when the rule changes. It saves time on repeated work, it removes the mistakes that creep in when code is copied, and it gives the logic a name that explains what it does. A copy-pasted recipe drifts apart across notebooks, and then two reports disagree and nobody knows why.</p>
<p><b>2.</b> A side effect is when a function changes something outside itself. With tables, the usual one is writing into the table that was passed in, which also changes the caller’s table, because Python passes the table itself rather than a photocopy. I avoid it by making a copy at the top of the function and working on the copy, and I can prove it with a test that checks the original has not changed.</p>
<p><b>3.</b> I would build a tiny table with a few rows where I can work out the answer by hand, including at least one row that must be excluded, such as a cancelled order, and assert that the function returns that known value. I would add an edge case such as an empty table, and I would check the total against an independent figure, such as the payments table total, when I run it on the real data.</p>
</details>
<p><b>Coming next, in lesson 8.2:</b> pipelines. You have the tools. Now you will connect them into a chain that loads, cleans, builds and checks, with guard rails between the stations so that bad data stops the line before it reaches the CEO’s slide. You will also learn how to log what a run did, and how to chain table functions neatly with <code>.pipe()</code>.</p>`
    }
  ]
},
{
  id: 'py-8-2',
  track: 'python',
  lang: 'python',
  packages: ['pandas'],
  files: ['customers', 'orders', 'products', 'payments', 'deliveries', 'order_items'],
  setup: `import pandas as pd

def load_tables():
    """Read the six TradeFlow tables and return them in one dictionary."""
    tables = {}
    for name in ["customers", "orders", "products", "payments", "deliveries", "order_items"]:
        tables[name] = pd.read_csv(name + ".csv")
    return tables

def clean_emails(emails):
    """Strip spaces and make every email lowercase. Missing emails stay missing."""
    return emails.str.strip().str.lower()

def add_clean_name(customers):
    """Return a copy of the customers table with a clean_name column (no titles, no suffixes)."""
    title = r"^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Miss) "
    suffix = r" (MD|PhD|DDS|DVM|Jr\\.|II|III|IV)$"
    result = customers.copy()
    result["clean_name"] = result["customer_name"].str.replace(title, "", regex=True).str.replace(suffix, "", regex=True)
    return result

def build_master(tables):
    """One row per order line, with product, order and customer facts and a line_total."""
    master = tables["order_items"].merge(tables["products"][["product_id", "product_name", "category"]], on="product_id", validate="many_to_one")
    master = master.merge(tables["orders"][["order_id", "customer_id", "order_date", "order_status"]], on="order_id", validate="many_to_one")
    master = master.merge(tables["customers"][["customer_id", "country"]], on="customer_id", validate="many_to_one")
    master["line_total"] = master["quantity"] * master["unit_price"]
    master["order_date"] = pd.to_datetime(master["order_date"], format="%Y-%m-%d")
    master["order_year"] = master["order_date"].dt.year
    return master

def net_revenue(master):
    """Revenue of Completed and Processing orders only."""
    kept = master[master["order_status"].isin(["Completed", "Processing"])]
    return kept["line_total"].sum()
`,
  preloaded: ['load_tables', 'clean_emails', 'add_clean_name', 'build_master', 'net_revenue'],
  title: '8.2 Pipelines: chain the steps, and let bad data stop the line',
  tables: [],
  intro: `Monday morning, ten minutes before the board meeting. The finance director leans over your shoulder and asks a question you have been dreading. <i>“Is this number right? Last time a file arrived a little off, and nobody noticed until the slide was already on the screen.”</i><br><br>You have the tools from lesson 8.1. This lesson turns them into something far more valuable than speed: a <b>pipeline you can trust</b>. A pipeline is a chain of steps that run in a fixed order, with <b>inspectors</b> between the steps that stop the line when the data is wrong. By the end you will have a single call, <code>run_pipeline()</code>, that loads, tidies, builds and checks the TradeFlow data, writes a log of what it did, and refuses to hand over a number it cannot stand behind.<br><br>Your toolkit from lesson 8.1 is already loaded for you: <code>load_tables</code>, <code>clean_emails</code>, <code>add_clean_name</code>, <code>build_master</code> and <code>net_revenue</code>.`,
  steps: [
    {
      type: 'explain',
      title: 'A pipeline is a conveyor belt with inspectors',
      body: `<p>In lesson 8.1 you built four tools. A tool on its own still needs a person to pick it up, point it at the right thing, and check what came out. A <b>pipeline</b> removes the person from the middle. It is a fixed chain of steps, where the output of each one becomes the input of the next, run in the same order every time.</p>
<p>The best picture is a factory conveyor belt. Raw material goes in at one end. It passes through stations: one washes, one cuts, one assembles. At the other end comes a finished product. In a good factory there are also <b>inspectors</b> standing between the stations, who pull a faulty item off the belt before it reaches the box. A pipeline for TradeFlow looks like this:</p>
<table class="mini">
<tr><th>Station</th><th>Tool</th><th>The inspector’s question</th></tr>
<tr><td><b>1. Load</b></td><td><code>load_tables()</code></td><td>Did all six tables arrive, and with the row counts we expect?</td></tr>
<tr><td><b>2. Clean</b></td><td><code>add_clean_name</code>, <code>clean_emails</code></td><td>Did cleaning keep every row?</td></tr>
<tr><td><b>3. Build</b></td><td><code>build_master(tables)</code></td><td>Does the master table have as many lines as the order items?</td></tr>
<tr><td><b>4. Check</b></td><td>The tie-out and the validation report</td><td>Do the totals agree to the cent? Is anything impossible?</td></tr>
<tr><td><b>5. Report</b></td><td><code>net_revenue</code> and friends</td><td>Is the number worth showing?</td></tr>
</table>
<p>The inspectors are the part that makes a pipeline <b>trustworthy</b>. Without them, a pipeline is just a faster way to produce a wrong number, and a faster wrong number is worse than a slow one. Picture the scenario: a file arrives on Monday morning with a few product rows repeated by mistake. A pipeline without inspectors runs happily, and the CEO’s slide shows revenue that looks about 2.7 percent too high. Nobody sees it until a director asks why the numbers have drifted from finance’s. You will see that exact failure in a moment, and you will see how a single inspector stops it.</p>
<p>The rule of this whole lesson fits in one line: <b>never show a number you have not checked, and let bad data stop the line</b>.</p>
<div class="callout work"><b>At work:</b> professional teams build pipelines with tools such as Airflow, dbt or scheduled notebooks. The ideas are the ones you are about to practise: stations, inspectors, a log, and a loud failure. Learn them in plain Python, and the tools will look familiar.</div>`
    },
    {
      type: 'try',
      title: 'Your toolkit, run as a chain',
      body: `<p>The toolkit from lesson 8.1 is already loaded for you in this lesson: <code>load_tables</code>, <code>clean_emails</code>, <code>add_clean_name</code>, <code>build_master</code> and <code>net_revenue</code>. You can use them without defining them.</p>
<p>Read the code as the first three stations of the belt. Load the tables. Tidy the customers (the new table has <b>7</b> columns, one more than the original 6). Build the master table: <b>25,000 lines, 13 columns</b>. Then the report station gives the net revenue, <b>1,419,860,053.32</b>. Five lines replace the whole notebook.</p>`,
      code: `import pandas as pd

tables = load_tables()
customers = add_clean_name(tables["customers"])
master = build_master(tables)

print(customers.shape)
print(master.shape)
print(round(net_revenue(master), 2))
`
    },
    {
      type: 'explain',
      title: 'Guard rails: three inspectors that catch most disasters',
      body: `<p>What should an inspector check? In practice three kinds of checks catch most of the damage, and each one costs only a line or two of code.</p>
<p><b>1. The row-count guard.</b> Many steps should <b>keep every row</b>. A merge of order lines with the product table should still have 25,000 lines afterwards. If the count changes, something went wrong: lines were dropped by a failed match, or multiplied by a repeated key. The check compares “rows before” with “rows after” and stops if they differ.</p>
<p><b>2. The range guard.</b> Some values are simply impossible: a payment of zero or less, a quantity of 50 when every order line has one to five, a delivery date before the dispatch date. You met these in lesson 3.5. In a pipeline you do not print them for a person to read. You make them <b>stop the line</b>.</p>
<p><b>3. The tie-out guard.</b> The master table’s total revenue must equal the payments table’s total, to the cent, because every order’s payment equals its line total. This one check proves that three tables and two merges all agree with each other. It is the strongest inspector on the belt.</p>
<p>How does an inspector “stop the line”? In lesson 3.5 you used <code>assert</code>. A pipeline usually prefers a plainer tool: <b>raise an error yourself</b>. The line <code>raise ValueError("a message")</code> stops the program at once and shows your message. The difference matters for two reasons:</p>
<ul>
<li>Python can be run in a mode that <b>switches every <code>assert</code> off</b>. A guard that can be switched off by a setting is not a guard. A <code>raise</code> always runs.</li>
<li>The kind of error carries meaning. <code>ValueError</code> says “the value I was given is not acceptable”, which is exactly what bad data is. You can catch precisely that kind of problem with <code>except ValueError</code> and let other, unexpected errors still crash loudly.</li>
</ul>
<p>The last ingredient is the message. A message such as “check failed” is useless at eight in the morning. A good message names the <b>step</b> and the <b>numbers</b>: “build_master: row count changed from 25,000 to 25,512”. The person reading it knows where to look before they have finished their coffee. An f-string with <code>{value:,}</code> puts the thousands commas in for you.</p>
<div class="callout watch"><b>Fail early, fail loudly.</b> It feels bad when a pipeline stops. It is far worse when it finishes. A pipeline that stops with a clear message costs you ten minutes. A pipeline that finishes with a wrong number can cost the company a decision.</div>`
    },
    {
      type: 'try',
      title: 'The join that silently multiplies your revenue',
      body: `<p>This is the failure from the story, made on purpose. The code copies the products table and glues the first three products on again at the bottom, as if a bad file had repeated them. Then it merges the order lines with this dirty table in two ways.</p>
<p><b>Without</b> <code>validate</code>, Pandas obeys quietly. The 25,000 lines become <b>25,512</b>, because every line of those three products is duplicated. Revenue grows by <b>42,166,806.24</b>, which is 2.67 percent, from nothing but a repeated row. <b>With</b> <code>validate="many_to_one"</code>, the merge refuses and raises a <code>MergeError</code> that says exactly what is wrong. The last line prints <code>True</code>: <code>MergeError</code> is a kind of <code>ValueError</code>, which will be useful in a moment.</p>
<p>This is why every merge inside <code>build_master</code> carries <code>validate</code>. It is an inspector built into the tool.</p>`,
      code: `import pandas as pd

tables = load_tables()
products = tables["products"]
order_items = tables["order_items"]

dirty = pd.concat([products, products.head(3)], ignore_index=True)

loose = order_items.merge(dirty[["product_id", "category"]], on="product_id")
print("Without validate:", len(order_items), "lines became", len(loose))

true_total = (order_items["quantity"] * order_items["unit_price"]).sum()
loose_total = (loose["quantity"] * loose["unit_price"]).sum()
print("Revenue grew by", round(loose_total - true_total, 2), "which is", round((loose_total / true_total - 1) * 100, 2), "percent")

try:
    order_items.merge(dirty[["product_id", "category"]], on="product_id", validate="many_to_one")
except Exception as error:
    print("With validate:", type(error).__name__, "-", error)

print(issubclass(pd.errors.MergeError, ValueError))
`
    },
    {
      id: 'py-8-2-ex1',
      type: 'exercise',
      title: 'Your turn: the row-count guard',
      body: `<p>Write a function <code>check_same_rows(before, after, step)</code>. If <code>before</code> and <code>after</code> are equal it does nothing. If they differ it raises a <code>ValueError</code> whose message reads, for example, <code>merge: row count changed from 25000 to 25512</code> (the step name, then the two numbers).</p>
<p>The starter tests it with two cases. You should see:</p>
<ul>
<li><code>OK: 25000 rows kept</code></li>
<li><code>STOPPED: merge: row count changed from 25000 to 25512</code></li>
</ul>
<p><b>Think before you type:</b> an <code>if before != after:</code> and a <code>raise ValueError(...)</code> with an f-string inside. The starter’s <code>try</code> and <code>except ValueError as error</code> catch the problem and print <code>error</code>, which is your message.</p>`,
      starter: `import pandas as pd\n\n# Write your function below\n\n\nfor before, after in [(25000, 25000), (25000, 25512)]:\n    try:\n        check_same_rows(before, after, "merge")\n        print("OK:", before, "rows kept")\n    except ValueError as error:\n        print("STOPPED:", error)\n`,
      hints: [
        `def check_same_rows(before, after, step): if before != after: raise ValueError(f"{step}: row count changed from {before} to {after}"). Nothing else is needed when the numbers match.`,
        `import pandas as pd\n\ndef check_same_rows(before, after, step):\n    if before != after:\n        raise ValueError(f"{step}: row count changed from {before} to {after}")\n\nfor before, after in [(25000, 25000), (25000, 25512)]:\n    try:\n        check_same_rows(before, after, "merge")\n        print("OK:", before, "rows kept")\n    except ValueError as error:\n        print("STOPPED:", error)\n`
      ],
      solution: `import pandas as pd\n\ndef check_same_rows(before, after, step):\n    if before != after:\n        raise ValueError(f"{step}: row count changed from {before} to {after}")\n\nfor before, after in [(25000, 25000), (25000, 25512)]:\n    try:\n        check_same_rows(before, after, "merge")\n        print("OK:", before, "rows kept")\n    except ValueError as error:\n        print("STOPPED:", error)\n`,
      ordered: true
    },
    {
      id: 'py-8-2-ex2',
      type: 'exercise',
      title: 'Your turn: the tie-out guard',
      body: `<p>The starter builds the master table with your toolkit and makes a <code>tampered</code> copy of the payments table in which one payment is 5.00 too high. Write a function <code>tie_out_gap(master, payments)</code> that returns the <b>absolute difference</b> between the total <code>line_total</code> of the master table and the total <code>amount</code> of the payments, rounded to 2 decimals. Print the gap for the honest payments, and then for the tampered ones.</p>
<p>You should see <code>0.0</code> and then <code>5.0</code>.</p>
<p><b>Think before you type:</b> two sums, one subtraction, and <code>abs(...)</code> to ignore the sign. Round the whole thing with <code>round(..., 2)</code> and <code>return</code> it.</p>`,
      starter: `import pandas as pd\n\ntables = load_tables()\nmaster = build_master(tables)\npayments = tables["payments"]\n\ntampered = payments.copy()\ntampered.loc[0, "amount"] = tampered.loc[0, "amount"] + 5\n\n# Write your function below, then print the gap for both tables\n`,
      hints: [
        `return round(abs(master["line_total"].sum() - payments["amount"].sum()), 2). Then print(tie_out_gap(master, payments)) and print(tie_out_gap(master, tampered)).`,
        `import pandas as pd\n\ntables = load_tables()\nmaster = build_master(tables)\npayments = tables["payments"]\n\ntampered = payments.copy()\ntampered.loc[0, "amount"] = tampered.loc[0, "amount"] + 5\n\ndef tie_out_gap(master, payments):\n    return round(abs(master["line_total"].sum() - payments["amount"].sum()), 2)\n\nprint(tie_out_gap(master, payments))\nprint(tie_out_gap(master, tampered))\n`
      ],
      solution: `import pandas as pd\n\ntables = load_tables()\nmaster = build_master(tables)\npayments = tables["payments"]\n\ntampered = payments.copy()\ntampered.loc[0, "amount"] = tampered.loc[0, "amount"] + 5\n\ndef tie_out_gap(master, payments):\n    return round(abs(master["line_total"].sum() - payments["amount"].sum()), 2)\n\nprint(tie_out_gap(master, payments))\nprint(tie_out_gap(master, tampered))\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Stop the line, or note it and carry on?',
      body: `<p>Here is a question that separates beginners from professionals. In lesson 3.5 you found that TradeFlow’s data fails several checks: 58 customers have no email, 5,037 orders are dated before the customer signed up, and 147 order lines repeat a product within an order. If the pipeline stopped for every one of those, it would <b>never run</b>. You decided in earlier lessons that they are known features of this dataset, not new damage.</p>
<p>So not every failed check deserves the same response. Professionals give each check a <b>severity</b>:</p>
<table class="mini">
<tr><th>Severity</th><th>Meaning</th><th>What the pipeline does</th><th>TradeFlow examples</th></tr>
<tr><td><b>Blocker</b></td><td>If this fails, the numbers cannot be trusted</td><td>Stops the line</td><td>Duplicate keys, orders for customers that do not exist, payments of zero or less, revenue that does not tie out</td></tr>
<tr><td><b>Warning</b></td><td>A known or tolerable problem that people should be told about</td><td>Carries on, and lists it in the report</td><td>58 missing emails, 5,037 orders before signup, 147 repeated lines (real purchases)</td></tr>
</table>
<p>The rule that decides is a question: <b>“If this check fails, could the number on the CEO’s slide be wrong?”</b> If yes, it is a blocker. If the problem is real but does not touch the headline numbers, it is a warning, and it must still appear in the report so that nobody discovers it by accident.</p>
<p>Technically it is a small upgrade to the <code>check</code> function from lesson 3.5. It now takes a <code>severity</code> as well as a name, a pass or fail and a detail. The report table gets a <code>severity</code> column. The pipeline’s decision becomes one line of Pandas: count the rows where the result is <code>FAIL</code> and the severity is <code>blocker</code>. If the count is above zero, stop.</p>
<div class="callout watch"><b>Do not downgrade a blocker to make the pipeline pass.</b> The temptation on a deadline is to relabel an awkward blocker as a warning. Do it only when you have a documented reason, as with the known quirks above, and write the reason in the detail column.</div>`
    },
    {
      type: 'try',
      title: 'A validation report with severity',
      body: `<p>The eleven checks of a real pipeline. Eight are blockers and three are warnings. The <code>check</code> function appends one row each time it is called, just as in lesson 3.5, with the new <code>severity</code> argument.</p>
<p>Read the result table, then the two summary lines. <b>No blocker failed</b>, so the line may continue. <b>Three warnings</b> were raised: the 58 missing emails, the 5,037 early orders and the 147 repeated lines. They are all things you already knew about, and the report keeps them visible.</p>`,
      code: `import pandas as pd

tables = load_tables()
master = build_master(tables)
customers = tables["customers"]
orders = tables["orders"]
products = tables["products"]
order_items = tables["order_items"]
payments = tables["payments"]

results = []

def check(name, passed, severity, detail=""):
    results.append({"check": name, "severity": severity, "result": "PASS" if passed else "FAIL", "detail": detail})

signup = orders["customer_id"].map(customers.set_index("customer_id")["signup_date"])
early = int((pd.to_datetime(orders["order_date"]) < pd.to_datetime(signup)).sum())
no_email = int(customers["email"].isnull().sum())
repeats = int(order_items.duplicated(subset=["order_id", "product_id"]).sum())
gap = abs(master["line_total"].sum() - payments["amount"].sum())

check("customer_id is unique", customers["customer_id"].is_unique, "blocker")
check("order_id is unique", orders["order_id"].is_unique, "blocker")
check("product_id is unique", products["product_id"].is_unique, "blocker")
check("orders point to real customers", orders["customer_id"].isin(customers["customer_id"]).all(), "blocker")
check("order lines point to real orders", order_items["order_id"].isin(orders["order_id"]).all(), "blocker")
check("order lines point to real products", order_items["product_id"].isin(products["product_id"]).all(), "blocker")
check("payment amounts are above zero", (payments["amount"] > 0).all(), "blocker")
check("revenue ties out to payments", gap < 0.01, "blocker", f"gap {round(gap, 2)}")
check("every customer has an email", no_email == 0, "warning", f"{no_email} customers have no email")
check("orders are on or after signup", early == 0, "warning", f"{early} orders dated before signup")
check("one line per product per order", repeats == 0, "warning", f"{repeats} repeats, real purchases (lesson 3.3)")

report = pd.DataFrame(results)
print(report)

failed = report[report["result"] == "FAIL"]
print("Blockers failed:", (failed["severity"] == "blocker").sum())
print("Warnings raised:", (failed["severity"] == "warning").sum())
`
    },
    {
      id: 'py-8-2-ex3',
      type: 'exercise',
      title: 'Your turn: the pipeline’s decision',
      body: `<p>The starter has a small report with four checks. Write a function <code>count_blockers(report)</code> that returns how many rows have <b>both</b> <code>result</code> equal to <code>"FAIL"</code> <b>and</b> <code>severity</code> equal to <code>"blocker"</code>. Then print the count, and if it is above zero also print <code>STOP: fix the blockers first</code>.</p>
<p>You should see <code>1</code> and then <code>STOP: fix the blockers first</code>.</p>
<p><b>Think before you type:</b> build a True/False column with the two conditions joined by <code>&amp;</code>, each in its own brackets, as in lesson 4.2: <code>(report["result"] == "FAIL") &amp; (report["severity"] == "blocker")</code>. Then <code>.sum()</code> counts the Trues.</p>`,
      starter: `import pandas as pd\n\nreport = pd.DataFrame({\n    "check": ["keys are unique", "amounts above zero", "emails present", "orders after signup"],\n    "severity": ["blocker", "blocker", "warning", "warning"],\n    "result": ["PASS", "FAIL", "FAIL", "PASS"]\n})\n\n# Write your function below, then use it\n`,
      hints: [
        `Inside the function: failed_blockers = (report["result"] == "FAIL") & (report["severity"] == "blocker"), then return failed_blockers.sum(). Outside: count = count_blockers(report), print(count), and an if count > 0: with the STOP message.`,
        `import pandas as pd\n\nreport = pd.DataFrame({\n    "check": ["keys are unique", "amounts above zero", "emails present", "orders after signup"],\n    "severity": ["blocker", "blocker", "warning", "warning"],\n    "result": ["PASS", "FAIL", "FAIL", "PASS"]\n})\n\ndef count_blockers(report):\n    failed_blockers = (report["result"] == "FAIL") & (report["severity"] == "blocker")\n    return failed_blockers.sum()\n\ncount = count_blockers(report)\nprint(count)\nif count > 0:\n    print("STOP: fix the blockers first")\n`
      ],
      solution: `import pandas as pd\n\nreport = pd.DataFrame({\n    "check": ["keys are unique", "amounts above zero", "emails present", "orders after signup"],\n    "severity": ["blocker", "blocker", "warning", "warning"],\n    "result": ["PASS", "FAIL", "FAIL", "PASS"]\n})\n\ndef count_blockers(report):\n    failed_blockers = (report["result"] == "FAIL") & (report["severity"] == "blocker")\n    return failed_blockers.sum()\n\ncount = count_blockers(report)\nprint(count)\nif count > 0:\n    print("STOP: fix the blockers first")\n`,
      ordered: true
    },
    {
      id: 'py-8-2-c1',
      type: 'check',
      title: 'Which of these problems should be a blocker in TradeFlow’s pipeline?',
      body: `<p>Ask the question: could the number on the CEO’s slide be wrong?</p>`,
      options: [
        '58 customers have no email address',
        'The orders table contains a customer ID that does not exist in the customers table',
        '5,037 orders are dated before the customer’s signup date',
        '1,239 deliveries have no delivery date, because they are still in transit or failed'
      ],
      answer: 1,
      why: [
        'Missing emails matter for marketing, not for revenue. It is a known quirk, so it belongs in the report as a warning.',
        'Right! An order for a customer that is not in the customers table has no country, so the merge in <code>build_master</code> either drops its lines or fails. Revenue could be wrong, so the line must stop. It is a classic orphan, the kind of check from lesson 3.5.',
        'This is a real puzzle, but a known one that you decided to document in lesson 3.5. It does not change any revenue figure, so it is a warning that stays visible.',
        'A parcel in transit has no delivery date yet, and that is expected. It is a known feature of the data, not a fault that changes revenue.'
      ]
    },
    {
      type: 'explain',
      title: '.pipe(): reading a pipeline from left to right',
      body: `<p>Look at how stations are called so far. Written step by step, each one sits on its own line with its own variable. Written as nested calls, the order of the stations reads <b>inside out</b>, as in <code>revenue_by(only_year(only_net(master), 2025), "country")</code>. To understand it you must start at the innermost bracket and work outward, which is not how people read.</p>
<p>Pandas has a method made for this: <code>.pipe()</code>. It says “take this table and hand it to this function”. Because every table function you write takes a table and returns a table, you can chain them in the order they happen:</p>
<p><code>master.pipe(only_net).pipe(only_year, 2025).pipe(revenue_by, "country")</code></p>
<p>Read it aloud, left to right, and it is a sentence: “take the master table, keep only the net orders, keep only 2025, and give the revenue by country.” Extra arguments go after the function name. In <code>.pipe(only_year, 2025)</code>, the table goes in first and <code>2025</code> follows as the second argument. This is the same <i>idea</i> as the chain of CTEs in SQL, where each step feeds the next and the final query reads as a story.</p>
<p>Why bother? Three reasons. The order of the steps is <b>visible</b>. A step can be <b>added or removed</b> by changing one link. And each link is a small function you can test on its own, as you learned in 8.1. A pipeline built this way is the easiest kind to explain to a colleague, because it reads like the recipe.</p>
<div class="callout analogy"><b>The assembly line again.</b> <code>.pipe()</code> is the conveyor itself. Each function is a station, and the table is the item travelling along. If you want an extra station between two others, you slot it in, and nothing else changes.</div>
<div class="callout tip"><b>Keep each link small.</b> One function, one job, as in lesson 8.1. If a link grows to twenty lines, split it into two. A chain of five short functions is easier to read than one long one.</div>`
    },
    {
      type: 'try',
      title: 'Net revenue by year, in one chain',
      body: `<p>Two small table functions, then a chain. <code>only_net</code> keeps the Completed and Processing orders. <code>revenue_by</code> adds up the line totals by whatever column you name and shows them in millions.</p>
<p>Notice how the last line reads: master, only the net orders, revenue by year. The result is <b>400.44, 402.80, 414.01</b> and <b>202.62</b> million for 2023 to 2026, the same net figures as before, and the same trap as before: 2026 is only half a year, so it is not a collapse.</p>`,
      code: `import pandas as pd

def only_net(df):
    return df[df["order_status"].isin(["Completed", "Processing"])]

def revenue_by(df, column):
    return (df.groupby(column)["line_total"].sum() / 1000000).round(2)

master = build_master(load_tables())
print(master.pipe(only_net).pipe(revenue_by, "order_year"))
`
    },
    {
      id: 'py-8-2-ex4',
      type: 'exercise',
      title: 'Your turn: add a link to the chain',
      body: `<p>The starter has <code>only_net</code> and <code>revenue_by</code> and the master table. Write one more link, <code>only_year(df, year)</code>, which keeps the rows whose <code>order_year</code> equals <code>year</code>. Then build one chain with <code>.pipe()</code> that gives the <b>net revenue by country for 2025</b> in millions, <b>largest first</b>, and print it.</p>
<p>You should see five countries with Rwanda at the top (92.42) and Kenya at the bottom (73.45).</p>
<p><b>Think before you type:</b> the chain is <code>master.pipe(only_net).pipe(only_year, 2025).pipe(revenue_by, "country")</code>. Sorting is a normal Series method, so add <code>.sort_values(ascending=False)</code> at the end, and wrap the whole thing in <code>print(...)</code>.</p>`,
      starter: `import pandas as pd\n\ndef only_net(df):\n    return df[df["order_status"].isin(["Completed", "Processing"])]\n\ndef revenue_by(df, column):\n    return (df.groupby(column)["line_total"].sum() / 1000000).round(2)\n\nmaster = build_master(load_tables())\n\n# Write your code below\n`,
      hints: [
        `def only_year(df, year): return df[df["order_year"] == year]. Then result = master.pipe(only_net).pipe(only_year, 2025).pipe(revenue_by, "country").sort_values(ascending=False) and print(result).`,
        `import pandas as pd\n\ndef only_net(df):\n    return df[df["order_status"].isin(["Completed", "Processing"])]\n\ndef revenue_by(df, column):\n    return (df.groupby(column)["line_total"].sum() / 1000000).round(2)\n\nmaster = build_master(load_tables())\n\ndef only_year(df, year):\n    return df[df["order_year"] == year]\n\nresult = master.pipe(only_net).pipe(only_year, 2025).pipe(revenue_by, "country").sort_values(ascending=False)\nprint(result)\n`
      ],
      solution: `import pandas as pd\n\ndef only_net(df):\n    return df[df["order_status"].isin(["Completed", "Processing"])]\n\ndef revenue_by(df, column):\n    return (df.groupby(column)["line_total"].sum() / 1000000).round(2)\n\nmaster = build_master(load_tables())\n\ndef only_year(df, year):\n    return df[df["order_year"] == year]\n\nresult = master.pipe(only_net).pipe(only_year, 2025).pipe(revenue_by, "country").sort_values(ascending=False)\nprint(result)\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'The whole run in one function, with a log',
      body: `<p>You now have stations, inspectors and a way to chain them. The last step is to wrap the whole run in <b>one function</b>, so that the Monday report becomes a single call: <code>run_pipeline()</code>. Four design choices make that function professional.</p>
<p><b>1. A log of what happened.</b> A list called <code>log</code> collects one sentence per station: “Loaded 6 tables, 56,650 rows”, “Built the master table: 25,000 lines”. At the end you print it, and anyone can see what the run did, in order. When the CEO asks “how was this made?”, you show the log.</p>
<p><b>2. Inspectors inside the run.</b> After the build comes the row-count guard. After the row-count guard comes the tie-out. Each one raises a <code>ValueError</code> with a message that names the step and the numbers.</p>
<p><b>3. One safety net around everything.</b> The whole run sits inside a <code>try</code> block. If any inspector raises a <code>ValueError</code>, the <code>except ValueError</code> branch catches it, adds a line to the log that starts with <code>STOPPED:</code>, and marks the status as stopped. And here is the payoff from earlier: <code>MergeError</code>, the complaint that <code>validate</code> makes in <code>build_master</code>, is a kind of <code>ValueError</code>, so the same safety net catches a bad merge as well. Errors that are <i>not</i> about the data, such as a typo in your own code, still crash loudly, which is what you want.</p>
<p><b>4. A dictionary as the answer.</b> The function returns <code>{"status": ..., "log": ..., "master": ...}</code>. That is the “returning more than one fact” trick from lesson 1.9. The caller can check the status first, and only use the master table if the status says finished.</p>
<p>One more convenience: the function takes an optional <code>tables</code> argument whose default is <code>None</code>. Normally you call <code>run_pipeline()</code> and it loads the real files. For testing, you can pass in your own tables, including <b>deliberately broken ones</b>, to prove the inspectors really stop the line. A guard you have never seen fail is a guard you do not know works.</p>
<div class="callout work"><b>At work:</b> real pipelines also email someone when the status is stopped. You are building the part that decides; the sending is one more function at the end.</div>`
    },
    {
      type: 'try',
      title: 'run_pipeline: a good run and a tampered one',
      body: `<p>The whole pipeline in one function, with two inspectors: the row-count guard and the tie-out. Run 1 uses the real data and the log reads like a short story: tables loaded, names tidied (71 changed), the master table built from 25,000 lines, revenue tying out with a gap of zero. The status is <b>finished</b>.</p>
<p>Run 2 passes in a copy of the tables where one payment has been made 5.00 too high, just as in the exercise. The first three stations are fine, but the tie-out inspector finds the gap, raises the error, and the log ends with <b>STOPPED</b> and a message that tells you the size of the gap. The pipeline refused to produce a number it could not stand behind.</p>`,
      code: `import pandas as pd

def check_same_rows(before, after, step):
    if before != after:
        raise ValueError(f"{step}: row count changed from {before:,} to {after:,}")

def tie_out_gap(master, payments):
    return round(abs(master["line_total"].sum() - payments["amount"].sum()), 2)

def run_pipeline(tables=None):
    log = []
    try:
        if tables is None:
            tables = load_tables()
        rows = sum(len(table) for table in tables.values())
        log.append(f"Loaded {len(tables)} tables, {rows:,} rows")

        customers = add_clean_name(tables["customers"])
        changed = int((customers["clean_name"] != customers["customer_name"]).sum())
        log.append(f"Tidied customer names: {changed} changed")

        master = build_master(tables)
        check_same_rows(len(tables["order_items"]), len(master), "build_master")
        log.append(f"Built the master table: {len(master):,} lines")

        gap = tie_out_gap(master, tables["payments"])
        if gap > 0.01:
            raise ValueError(f"revenue does not tie out to payments: gap {gap}")
        log.append(f"Revenue ties out to payments (gap {gap})")
        status = "finished"
    except ValueError as error:
        log.append("STOPPED: " + str(error))
        master = None
        status = "stopped"
    return {"status": status, "log": log, "master": master}

def show(result):
    for number, line in enumerate(result["log"], start=1):
        print(number, line)
    print("Status:", result["status"])

print("Run 1: the real data")
show(run_pipeline())

print()
print("Run 2: one payment tampered with")
bad = load_tables()
bad["payments"].loc[0, "amount"] += 5
show(run_pipeline(bad))
`
    },
    {
      id: 'py-8-2-c2',
      type: 'check',
      title: 'Why does a pipeline usually stop bad data with raise ValueError(...) instead of assert?',
      body: `<p>Think about what can happen to an assert, and what an error type tells the reader.</p>`,
      options: [
        'Because assert is slower than raise',
        'Because Python does not allow assert inside functions',
        'Because assert can be switched off when Python runs in an optimised mode, so the guard might silently vanish, and a ValueError says clearly that the data was unacceptable',
        'Because raise stops the program and assert never does'
      ],
      answer: 2,
      why: [
        'Speed is not the issue. Both are instant.',
        'You can use assert anywhere, including functions. It is perfectly good for quick checks and tests, as in lesson 8.1.',
        'Right! A guard that can be turned off by a setting is not a guard. <code>raise</code> always runs. The error type also tells you what kind of problem you hit, so <code>except ValueError</code> catches data problems while real bugs still crash.',
        'Both stop the program when they fail. The difference is that assert can be disabled and raise cannot.'
      ]
    },
    {
      id: 'py-8-2-ex5',
      type: 'exercise',
      title: 'Challenge: add the missing inspector',
      body: `<p>The starter has a pipeline with the row-count guard and the tie-out, but no guard for impossible payments. Add one <b>right after the line that logs the loading</b>: if any payment <code>amount</code> is zero or less, raise a <code>ValueError</code> whose message is the count followed by <code>payment amounts are zero or negative</code>, for example <code>1 payment amounts are zero or negative</code>.</p>
<p>The starter then runs the pipeline twice, on the real data and on a copy where the first payment was changed to -100. You should see:</p>
<ul>
<li>Run 1: five log lines ending with <code>Status: finished</code></li>
<li>Run 2: two log lines, the second being <code>2 STOPPED: 1 payment amounts are zero or negative</code>, then <code>Status: stopped</code></li>
</ul>
<p><b>Think before you type:</b> count the bad rows with <code>(tables["payments"]["amount"] &lt;= 0).sum()</code>, store it in a variable, and use <code>if bad &gt; 0:</code> followed by <code>raise ValueError(f"...")</code>. Wrap the count in <code>int(...)</code> so the message prints a plain number.</p>`,
      starter: `import pandas as pd\n\ndef check_same_rows(before, after, step):\n    if before != after:\n        raise ValueError(f"{step}: row count changed from {before:,} to {after:,}")\n\ndef tie_out_gap(master, payments):\n    return round(abs(master["line_total"].sum() - payments["amount"].sum()), 2)\n\ndef run_pipeline(tables=None):\n    log = []\n    try:\n        if tables is None:\n            tables = load_tables()\n        rows = sum(len(table) for table in tables.values())\n        log.append(f"Loaded {len(tables)} tables, {rows:,} rows")\n\n        # Add your guard for impossible payments here\n\n        customers = add_clean_name(tables["customers"])\n        changed = int((customers["clean_name"] != customers["customer_name"]).sum())\n        log.append(f"Tidied customer names: {changed} changed")\n\n        master = build_master(tables)\n        check_same_rows(len(tables["order_items"]), len(master), "build_master")\n        log.append(f"Built the master table: {len(master):,} lines")\n\n        gap = tie_out_gap(master, tables["payments"])\n        if gap > 0.01:\n            raise ValueError(f"revenue does not tie out to payments: gap {gap}")\n        log.append(f"Revenue ties out to payments (gap {gap})")\n        status = "finished"\n    except ValueError as error:\n        log.append("STOPPED: " + str(error))\n        status = "stopped"\n    return {"status": status, "log": log}\n\ndef show(result):\n    for number, line in enumerate(result["log"], start=1):\n        print(number, line)\n    print("Status:", result["status"])\n\nprint("Run 1")\nshow(run_pipeline())\n\nprint("Run 2")\nbroken = load_tables()\nbroken["payments"].loc[0, "amount"] = -100\nshow(run_pipeline(broken))\n`,
      hints: [
        `After the line that logs the loading, write bad = int((tables["payments"]["amount"] <= 0).sum()), then if bad > 0: raise ValueError(f"{bad} payment amounts are zero or negative"). The existing except branch will catch it and log it.`,
        `import pandas as pd\n\ndef check_same_rows(before, after, step):\n    if before != after:\n        raise ValueError(f"{step}: row count changed from {before:,} to {after:,}")\n\ndef tie_out_gap(master, payments):\n    return round(abs(master["line_total"].sum() - payments["amount"].sum()), 2)\n\ndef run_pipeline(tables=None):\n    log = []\n    try:\n        if tables is None:\n            tables = load_tables()\n        rows = sum(len(table) for table in tables.values())\n        log.append(f"Loaded {len(tables)} tables, {rows:,} rows")\n\n        bad = int((tables["payments"]["amount"] <= 0).sum())\n        if bad > 0:\n            raise ValueError(f"{bad} payment amounts are zero or negative")\n\n        customers = add_clean_name(tables["customers"])\n        changed = int((customers["clean_name"] != customers["customer_name"]).sum())\n        log.append(f"Tidied customer names: {changed} changed")\n\n        master = build_master(tables)\n        check_same_rows(len(tables["order_items"]), len(master), "build_master")\n        log.append(f"Built the master table: {len(master):,} lines")\n\n        gap = tie_out_gap(master, tables["payments"])\n        if gap > 0.01:\n            raise ValueError(f"revenue does not tie out to payments: gap {gap}")\n        log.append(f"Revenue ties out to payments (gap {gap})")\n        status = "finished"\n    except ValueError as error:\n        log.append("STOPPED: " + str(error))\n        status = "stopped"\n    return {"status": status, "log": log}\n\ndef show(result):\n    for number, line in enumerate(result["log"], start=1):\n        print(number, line)\n    print("Status:", result["status"])\n\nprint("Run 1")\nshow(run_pipeline())\n\nprint("Run 2")\nbroken = load_tables()\nbroken["payments"].loc[0, "amount"] = -100\nshow(run_pipeline(broken))\n`
      ],
      solution: `import pandas as pd\n\ndef check_same_rows(before, after, step):\n    if before != after:\n        raise ValueError(f"{step}: row count changed from {before:,} to {after:,}")\n\ndef tie_out_gap(master, payments):\n    return round(abs(master["line_total"].sum() - payments["amount"].sum()), 2)\n\ndef run_pipeline(tables=None):\n    log = []\n    try:\n        if tables is None:\n            tables = load_tables()\n        rows = sum(len(table) for table in tables.values())\n        log.append(f"Loaded {len(tables)} tables, {rows:,} rows")\n\n        bad = int((tables["payments"]["amount"] <= 0).sum())\n        if bad > 0:\n            raise ValueError(f"{bad} payment amounts are zero or negative")\n\n        customers = add_clean_name(tables["customers"])\n        changed = int((customers["clean_name"] != customers["customer_name"]).sum())\n        log.append(f"Tidied customer names: {changed} changed")\n\n        master = build_master(tables)\n        check_same_rows(len(tables["order_items"]), len(master), "build_master")\n        log.append(f"Built the master table: {len(master):,} lines")\n\n        gap = tie_out_gap(master, tables["payments"])\n        if gap > 0.01:\n            raise ValueError(f"revenue does not tie out to payments: gap {gap}")\n        log.append(f"Revenue ties out to payments (gap {gap})")\n        status = "finished"\n    except ValueError as error:\n        log.append("STOPPED: " + str(error))\n        status = "stopped"\n    return {"status": status, "log": log}\n\ndef show(result):\n    for number, line in enumerate(result["log"], start=1):\n        print(number, line)\n    print("Status:", result["status"])\n\nprint("Run 1")\nshow(run_pipeline())\n\nprint("Run 2")\nbroken = load_tables()\nbroken["payments"].loc[0, "amount"] = -100\nshow(run_pipeline(broken))\n`,
      ordered: true
    },
    {
      id: 'py-8-2-c3',
      type: 'check',
      title: 'The tie-out check fails by 5.00 ten minutes before the CEO’s pack is due. Revenue is 1.58 billion, so the gap is tiny. What should a good pipeline do?',
      body: `<p>Think about why the check demands agreement to the cent.</p>`,
      options: [
        'Ignore it, because 5.00 is almost nothing next to 1.58 billion',
        'Quietly adjust one of the totals so that they agree',
        'Delete the payments table and carry on without it',
        'Stop the line, report the size and the step where it was found, and release no numbers until someone has looked'
      ],
      answer: 3,
      why: [
        'A small gap can be a sign of a big problem. Two large errors in opposite directions can cancel out and leave a tiny difference. That is exactly why the check demands agreement to the cent.',
        'Adjusting a total to make a check pass hides the problem. The check exists to tell you the truth, not to be satisfied.',
        'Deleting data to avoid a failing check is the opposite of what an analyst does. It removes the evidence.',
        'Right! A tie-out that fails means some line, somewhere, is wrong. A good pipeline stops, says by how much and where, and releases nothing until a person has looked. If the CEO needs something in ten minutes, send the previous checked pack, clearly dated, rather than a number you cannot stand behind.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You have gone from a set of tools to a pipeline that can look after itself. You can:</p>
<ul>
<li>Describe a pipeline as <b>stations with inspectors</b>, and explain why the inspectors matter more than the speed</li>
<li>Add the three standard guards: <b>row count</b>, <b>range</b> and <b>tie-out</b></li>
<li>Stop a run with <code>raise ValueError(...)</code> and a message that names the step and the numbers, and say why that beats <code>assert</code> in a pipeline</li>
<li>Use <code>validate="many_to_one"</code> to turn a silent 2.67 percent revenue inflation into a loud error</li>
<li>Give each check a <b>severity</b>, and decide when the line must stop and when to warn and carry on</li>
<li>Chain table functions neatly with <code>.pipe()</code></li>
<li>Wrap a whole run in <code>run_pipeline()</code> with a <b>log</b>, a safety net and a dictionary result, and <b>test it with deliberately broken data</b></li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>What checks would you build into an automated reporting pipeline, and why?</li>
<li>A check that has passed for months suddenly fails. What does the pipeline do, and what do you do?</li>
<li>How do you decide whether a failed check should stop the pipeline or only produce a warning?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I would check the row counts after each step that should keep every row, such as merges. I would check ranges for impossible values, such as zero or negative payments. I would add a tie-out between sources that must agree, such as the revenue in the master table against the payments total, to the cent. And I would check keys and links between tables, so that no merge can drop or multiply rows silently. These checks catch most real failures, and each costs one or two lines of code.</p>
<p><b>2.</b> The pipeline stops, logs a clear message that names the step and the numbers, and releases no new figures. It does not try to fix the data on its own. I then read the log, find which station failed, and look at the source: a repeated key in a file, a missing table, a changed export. I fix the cause, add a test with a tiny example of the failure so that it cannot sneak back, and rerun.</p>
<p><b>3.</b> I ask whether the failure could make a headline number wrong. If so, it is a blocker and the pipeline stops. If it is a real but known issue that does not touch the headline numbers, for example missing emails when the report is about revenue, it is a warning that stays visible in the report so nobody is surprised later. I never downgrade a check just to make a pipeline pass, and I write down the reason whenever a check is classed as a warning.</p>
</details>
<p><b>Coming next, in lesson 8.3:</b> configuration and parameters. Right now the pipeline always does the same thing. The marketing manager wants the same report for Ghana only, the finance director wants gross instead of net revenue, and the CEO wants 2025 against 2024. You will learn to put those choices in a <b>configuration dictionary</b>, to write functions with parameters and defaults, and to make one pipeline produce many different reports without copying a single line.</p>`
    }
  ]
}
);
