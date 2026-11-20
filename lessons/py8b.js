LESSONS.push(
{
  id: 'py-8-3',
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

master = build_master(load_tables())

DEFINITIONS = {
    "gross": ["Completed", "Processing", "Cancelled", "Returned"],
    "net": ["Completed", "Processing"],
    "completed": ["Completed"],
}

def revenue(master, definition="net", year=None, country=None):
    """Total line_total for one revenue definition, optionally for one year and one country."""
    if definition not in DEFINITIONS:
        raise ValueError(f"unknown definition '{definition}'. Choose from: {', '.join(DEFINITIONS)}")
    kept = master[master["order_status"].isin(DEFINITIONS[definition])]
    if year is not None:
        kept = kept[kept["order_year"] == year]
    if country is not None:
        kept = kept[kept["country"] == country]
    return kept["line_total"].sum()
`,
  preloaded: ['master', 'DEFINITIONS', 'revenue', 'load_tables', 'build_master', 'add_clean_name', 'clean_emails', 'net_revenue'],
  title: '8.3 Configuration and parameters: one pipeline, many reports',
  tables: [],
  intro: `The Monday pack was a success, and by Tuesday morning three new requests have arrived. The marketing manager wants the same numbers for Ghana only. The finance director wants gross revenue shown beside net. The CEO has just said: <i>“Next month I will want 2026 instead of 2025.”</i><br><br>You could copy the code three times and change a word in each copy. You also know exactly where that road leads: three versions, slowly drifting apart. This lesson shows the better road. You will turn the values that might change into <b>parameters</b>, gather the settings in a <b>config dictionary</b>, and teach one function to produce as many different reports as anyone asks for.<br><br>Your toolkit is loaded, together with <code>master</code> (the master table, already built), the dictionary <code>DEFINITIONS</code> and the <code>revenue</code> function that this lesson is about to explain.`,
  steps: [
    {
      type: 'explain',
      title: 'Three requests, one function',
      body: `<p>The Monday pack went down well. By Tuesday morning three new requests have landed on your desk.</p>
<ul>
<li>The marketing manager: <i>“Can I have the same numbers for Ghana only?”</i></li>
<li>The finance director: <i>“Show me gross revenue as well, not only net.”</i></li>
<li>The CEO: <i>“And next month I will want 2026 instead of 2025.”</i></li>
</ul>
<p>The tempting answer is to copy last week’s code three times and change a word in each copy: <code>"Ghana"</code> in one, <code>"gross"</code> in another, <code>2026</code> in the third. It works today. In two months you have three slightly different versions, and when finance changes what counts as revenue you have to remember to fix all three. That is exactly the drift you set out to remove in lesson 8.1.</p>
<p>The cure is to look at the code and ask: <b>which values in here might someone want to change?</b> Every such value is a <b>hard-coded value</b>: a number or a piece of text written straight into the middle of the logic. Pull it out, give it a name, and let the caller supply it. Then it becomes a <b>parameter</b>, a dial on the function.</p>
<table class="mini">
<tr><th>The request</th><th>The hard-coded value</th><th>The dial (parameter)</th></tr>
<tr><td>“Ghana only”</td><td><code>"Ghana"</code></td><td><code>country</code></td></tr>
<tr><td>“Gross as well as net”</td><td><code>["Completed", "Processing"]</code></td><td><code>definition</code></td></tr>
<tr><td>“2026 instead of 2025”</td><td><code>2025</code></td><td><code>year</code></td></tr>
</table>
<p>One function with three dials answers all three requests, and every future request of the same kind. The logic is written once and tested once. What changes between reports is only <b>the settings</b>, never the code.</p>
<p>A good function is like a good kettle. It has a few clearly labelled controls, such as the temperature and the amount, and sensible settings if you touch nothing. You never open the kettle to rewire it just because you want green tea instead of black.</p>
<div class="callout analogy"><b>The radio.</b> A radio does not need to be rebuilt to change the station. It has one dial and one logic inside. Your function has the same design: the dial is the parameter, and what is behind it never moves.</div>
<div class="callout watch"><b>Not everything should be a dial.</b> A function with fifteen parameters is as confusing as the copy-paste you escaped. Make a value a parameter only when you can name a realistic request that would change it. Three or four dials is a healthy number.</div>`
    },
    {
      type: 'try',
      title: 'One function, three dials',
      body: `<p>Here is the function written out in full, so you can read it. From the next card onward it is already loaded for you, together with the master table (<code>master</code>) and the dictionary <code>DEFINITIONS</code> that says which order statuses count for each definition of revenue.</p>
<p>Read the body in the order the data flows: first check the definition is one we know, then keep only the orders whose status counts, then, <b>if</b> a year was given, keep only that year, and <b>if</b> a country was given, keep only that country. Finally add up the line totals.</p>
<p>The four calls show the dials in use. With nothing set you get the net figure, <b>1,419,860,053.32</b>. Turn the definition to <code>"gross"</code> and you get <b>1,581,981,450.50</b>, to <code>"completed"</code> and you get <b>1,170,549,762.97</b>. And with a year and a country, Ghana’s net revenue for 2025 is <b>87,945,970.70</b>.</p>`,
      code: `import pandas as pd

DEFINITIONS = {
    "gross": ["Completed", "Processing", "Cancelled", "Returned"],
    "net": ["Completed", "Processing"],
    "completed": ["Completed"],
}

def revenue(master, definition="net", year=None, country=None):
    """Total line_total for one revenue definition, optionally for one year and one country."""
    if definition not in DEFINITIONS:
        raise ValueError(f"unknown definition '{definition}'. Choose from: {', '.join(DEFINITIONS)}")
    kept = master[master["order_status"].isin(DEFINITIONS[definition])]
    if year is not None:
        kept = kept[kept["order_year"] == year]
    if country is not None:
        kept = kept[kept["country"] == country]
    return kept["line_total"].sum()

print(round(revenue(master), 2))
print(round(revenue(master, "gross"), 2))
print(round(revenue(master, "completed"), 2))
print(round(revenue(master, year=2025, country="Ghana"), 2))
`
    },
    {
      type: 'explain',
      title: 'Defaults, None, and how to call a function',
      body: `<p>Look at the first line of the function: <code>def revenue(master, definition="net", year=None, country=None):</code>. It has two kinds of parameter, and the difference is the heart of this lesson.</p>
<p><b>A parameter with no default</b>, like <code>master</code>, is required. The function cannot work without it, so the caller must always provide it.</p>
<p><b>A parameter with a default</b>, like <code>definition="net"</code>, is optional. If the caller says nothing, the default is used. Python insists that the required parameters come first and the optional ones after, so that it never has to guess which is which.</p>
<p>Now the clever part: the defaults for <code>year</code> and <code>country</code> are <code>None</code>. <code>None</code> is Python’s way of saying “nothing here”. The body reads it as “no filter”: <code>if year is not None:</code> means “if the caller gave a year, keep only that year”. With the default, the filter is skipped, and the function covers every year. You will see this <code>None</code> pattern in almost every function that has optional filters.</p>
<p>There are two ways to pass what you want:</p>
<table class="mini">
<tr><th>Style</th><th>Example</th><th>How Python matches</th></tr>
<tr><td><b>Positional</b></td><td><code>revenue(master, "net", 2025)</code></td><td>By position: first, second, third</td></tr>
<tr><td><b>Keyword</b></td><td><code>revenue(master, year=2025, country="Ghana")</code></td><td>By name, in any order</td></tr>
</table>
<p>Prefer <b>keywords</b> for the optional dials. Compare <code>revenue(master, "net", 2025, "Ghana")</code> with <code>revenue(master, definition="net", year=2025, country="Ghana")</code>. The second one can be read by a colleague who has never seen the function, and it cannot be broken by swapping two arguments.</p>
<p>If you misspell a dial, Python tells you immediately and clearly: <code>revenue() got an unexpected keyword argument 'region'</code>. That is a gift. It is far better than silently ignoring the typo and handing back the wrong number.</p>
<div class="callout watch"><b>One trap to avoid.</b> Never use a list or a table as a default value, as in <code>def f(items=[])</code>. Python builds that default only once, and every call shares it. Use <code>None</code> and create the list inside the function.</div>
<div class="callout tip"><b>Name the dials like the question.</b> <code>year</code>, <code>country</code> and <code>definition</code> are words the CEO would use. If your parameters sound like the business, your function calls read like the requests.</div>`
    },
    {
      type: 'try',
      title: 'Three ways to ask for the same number',
      body: `<p>Positional, keywords, and keywords in a different order. All three ask for net revenue in 2025, and all three give <b>414,006,832.36</b>.</p>
<p>The last block asks for a dial that does not exist, <code>region</code>, and Python answers with a <code>TypeError</code> that names the mistake. The <code>try</code> and <code>except</code> catch it so the program can print the message and carry on.</p>`,
      code: `import pandas as pd

print(round(revenue(master, "net", 2025), 2))
print(round(revenue(master, definition="net", year=2025), 2))
print(round(revenue(master, year=2025, definition="net"), 2))

try:
    revenue(master, region="Ghana")
except TypeError as error:
    print("TypeError:", error)
`
    },
    {
      id: 'py-8-3-ex1',
      type: 'exercise',
      title: 'Your turn: a function that uses the dials',
      body: `<p>The finance director wants to know each country’s <b>share</b> of revenue. Write a function <code>revenue_share(master, country, definition="net", year=None)</code> that returns the revenue of the given country divided by the revenue of <b>all</b> countries, for the same definition and the same year. Use the <code>revenue</code> function that is already loaded for you.</p>
<p>Then print the share for Ghana over all years, and for Ghana in 2025, each rounded to 4 decimals. You should see <code>0.2005</code> and then <code>0.2124</code>.</p>
<p><b>Think before you type:</b> you need two calls to <code>revenue</code>: one with the <code>country</code> filled in, and one without it. Both get the same <code>definition</code> and <code>year</code>. Divide the first by the second and <code>return</code> the result.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `Inside the function: part = revenue(master, definition=definition, year=year, country=country) and whole = revenue(master, definition=definition, year=year). Return part / whole.`,
        `import pandas as pd\n\ndef revenue_share(master, country, definition="net", year=None):\n    part = revenue(master, definition=definition, year=year, country=country)\n    whole = revenue(master, definition=definition, year=year)\n    return part / whole\n\nprint(round(revenue_share(master, "Ghana"), 4))\nprint(round(revenue_share(master, "Ghana", year=2025), 4))\n`
      ],
      solution: `import pandas as pd\n\ndef revenue_share(master, country, definition="net", year=None):\n    part = revenue(master, definition=definition, year=year, country=country)\n    whole = revenue(master, definition=definition, year=year)\n    return part / whole\n\nprint(round(revenue_share(master, "Ghana"), 4))\nprint(round(revenue_share(master, "Ghana", year=2025), 4))\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A bad dial should stop the machine',
      body: `<p>Remember the rule from lesson 8.2: <b>fail early, fail loudly</b>. It applies to dials as well. What if someone types <code>definition="netto"</code>, or asks for the year 2030, which is not in the data? Without a check, the function might quietly return zero, and a zero on a slide looks like a fact.</p>
<p>So the first lines of the function check the dials and refuse anything unreasonable, with a message that helps:</p>
<p><code>raise ValueError(f"unknown definition '{definition}'. Choose from: {', '.join(DEFINITIONS)}")</code></p>
<p>Read it as a sentence for the person who made the typo: “I do not know that definition, and here are the ones I do know.” The part <code>', '.join(DEFINITIONS)</code> joins the keys of the dictionary into one readable line: <code>gross, net, completed</code>.</p>
<p>Look at how the definitions are stored, because this is a small design choice with a big payoff. They live in <b>one dictionary</b>, <code>DEFINITIONS</code>, where each name points to the list of order statuses that count. There is no tangle of <code>if</code> and <code>elif</code> inside the function. When finance introduces a fourth definition tomorrow, say “paid orders only”, you add <b>one line</b> to the dictionary, and the function, the error message and every report that uses it learn about it at once. A dictionary like this is a <b>single source of truth</b>: the one place where a business rule is written down.</p>
<div class="callout work"><b>At work:</b> definitions of business terms such as “active customer” or “net revenue” are the most argued-over numbers in any company. Keeping each in one named place means the argument happens once, and the answer is recorded.</div>
<div class="callout tip"><b>Check the dials first.</b> Put the validation at the very top of the function, before any work is done. If a dial is wrong, you want to find out in the first millisecond, not after the slow part.</div>`
    },
    {
      type: 'try',
      title: 'What a bad dial looks like',
      body: `<p>Two bad calls, each caught. The first has a mistyped definition, <code>"netto"</code>, and the error message lists the three valid ones. The second tries the year 2030 with a small check function of its own, written inline, which says that the data runs from 2023 to 2026.</p>
<p>Notice that both messages tell the reader what to do next. A message that only said “error” would send them hunting through the code.</p>`,
      code: `import pandas as pd

try:
    revenue(master, "netto")
except ValueError as error:
    print("ValueError:", error)

def check_year(year, allowed):
    if year not in allowed:
        raise ValueError(f"year {year} is not in the data ({min(allowed)} to {max(allowed)})")

allowed = sorted(master["order_year"].unique())
try:
    check_year(2030, allowed)
except ValueError as error:
    print("ValueError:", error)
`
    },
    {
      id: 'py-8-3-ex2',
      type: 'exercise',
      title: 'Your turn: validate the year',
      body: `<p>Write a function <code>check_year(year, allowed)</code> that does nothing if <code>year</code> is in the list <code>allowed</code>, and otherwise raises a <code>ValueError</code> with the message <code>year 2030 is not in the data (2023 to 2026)</code>, where 2030 is the year that was asked for, and 2023 and 2026 are the smallest and largest allowed years.</p>
<p>The starter tests it with 2025 and 2030. You should see:</p>
<ul>
<li><code>OK: 2025</code></li>
<li><code>STOPPED: year 2030 is not in the data (2023 to 2026)</code></li>
</ul>
<p><b>Think before you type:</b> <code>if year not in allowed:</code> and then a <code>raise ValueError(f"...")</code>. Python’s <code>min(allowed)</code> and <code>max(allowed)</code> give the two ends of the range.</p>`,
      starter: `import pandas as pd\n\nallowed = [2023, 2024, 2025, 2026]\n\n# Write your function below\n\n\nfor year in [2025, 2030]:\n    try:\n        check_year(year, allowed)\n        print("OK:", year)\n    except ValueError as error:\n        print("STOPPED:", error)\n`,
      hints: [
        `def check_year(year, allowed): if year not in allowed: raise ValueError(f"year {year} is not in the data ({min(allowed)} to {max(allowed)})").`,
        `import pandas as pd\n\nallowed = [2023, 2024, 2025, 2026]\n\ndef check_year(year, allowed):\n    if year not in allowed:\n        raise ValueError(f"year {year} is not in the data ({min(allowed)} to {max(allowed)})")\n\nfor year in [2025, 2030]:\n    try:\n        check_year(year, allowed)\n        print("OK:", year)\n    except ValueError as error:\n        print("STOPPED:", error)\n`
      ],
      solution: `import pandas as pd\n\nallowed = [2023, 2024, 2025, 2026]\n\ndef check_year(year, allowed):\n    if year not in allowed:\n        raise ValueError(f"year {year} is not in the data ({min(allowed)} to {max(allowed)})")\n\nfor year in [2025, 2030]:\n    try:\n        check_year(year, allowed)\n        print("OK:", year)\n    except ValueError as error:\n        print("STOPPED:", error)\n`,
      ordered: true
    },
    {
      id: 'py-8-3-c1',
      type: 'check',
      title: 'In the revenue function, year=None and country=None are defaults. What does None mean to the function body?',
      body: `<p>Think about what the lines <code>if year is not None:</code> do when the caller says nothing.</p>`,
      options: [
        'The function must return zero when it receives None',
        'The year is 0 and the country is an empty string',
        'The caller did not ask for that filter, so the function skips it and covers every year or every country',
        'Python raises an error because None is not allowed as a default'
      ],
      answer: 2,
      why: [
        'The function does not return zero. When no filter is given, it simply adds up everything that matches the other rules.',
        'None is not 0 and it is not an empty string. It is a special value that means “nothing was given”, which is exactly why it can be told apart from any real year.',
        'Right! <code>None</code> is the signal for “no filter”. <code>if year is not None:</code> only filters when the caller really supplied a year. That is why one function can answer “all years” and “2025 only” without two versions of the code.',
        'None is perfectly allowed as a default, and it is the standard way to say “optional, nothing chosen”.'
      ]
    },
    {
      type: 'explain',
      title: 'The settings slip: a config dictionary',
      body: `<p>You now have a function with several dials. A report needs the dials set to particular values, and the report may need ten or twenty settings by the time it is finished: the year, the country, the definition, how many countries to list, which chart to draw. If you scatter these values through your script, you are back at the original problem, with changeable values hiding in the middle of the code.</p>
<p>The professional answer is to gather every setting in <b>one dictionary</b>, at the top, in plain sight. It is called a <b>configuration</b>, or <b>config</b> for short:</p>
<p><code>config = {"definition": "net", "year": 2025, "country": "Ghana"}</code></p>
<p>Think of a restaurant’s order slip. The waiter writes down what you want, and the kitchen follows the slip. The kitchen never asks you to rewrite its recipes. The config is your order slip, and the functions are the kitchen.</p>
<p>The payoff is that on Monday, when the CEO says “2026 instead of 2025”, you change <b>one number in one place</b>, and the whole report follows. Nobody has to read the logic to find the year.</p>
<p>There is a Python trick that makes the slip and the function click together: the <b>double star</b>, <code>**</code>. Written in a call, <code>revenue(master, **config)</code>, it means “take this dictionary and spread it out into named arguments”. Python turns the line into exactly this:</p>
<p><code>revenue(master, definition="net", year=2025, country="Ghana")</code></p>
<p>The keys of the dictionary must match the names of the parameters. If the config has a key the function does not know, such as <code>"region"</code>, Python raises the same helpful <code>TypeError</code> you saw earlier, so a mistyped setting cannot slip through.</p>
<div class="callout work"><b>At work:</b> real teams keep configs in a small text file, usually in a format called JSON or YAML, so that a manager can change a setting without touching the code. Python reads such a file straight into a dictionary, so everything you learn here carries over unchanged.</div>
<div class="callout watch"><b>Do not change the config inside a function.</b> A function that quietly edits the dictionary it was given is a side effect, as in lesson 8.1. If you need a changed version, make a copy first with <code>config.copy()</code>.</div>`
    },
    {
      type: 'try',
      title: 'The config drives the function',
      body: `<p>First the config is spread into the call with <code>**config</code>. Then the same call is written out in full to show they are identical: both give <b>87,945,970.70</b>. Finally the year in the config is changed to 2024 and the <b>same line of code</b> now gives Ghana’s net revenue for 2024. Nothing in the logic moved.</p>`,
      code: `import pandas as pd

config = {"definition": "net", "year": 2025, "country": "Ghana"}

print(round(revenue(master, **config), 2))
print(round(revenue(master, definition="net", year=2025, country="Ghana"), 2))

config["year"] = 2024
print(round(revenue(master, **config), 2))
`
    },
    {
      id: 'py-8-3-ex3',
      type: 'exercise',
      title: 'Your turn: one line per configuration',
      body: `<p>Write a function <code>report_line(master, config)</code> that takes a master table and a config dictionary and returns one sentence in this form: <code>Ghana, 2025, net revenue: 87,945,971</code>. That is the country, the year, the definition, the word <code>revenue</code>, and the revenue rounded to a whole number with commas.</p>
<p>The starter has two configs. Print the report line for each. You should see two lines, the second being for Rwanda, 2024, gross.</p>
<p><b>Think before you type:</b> get the number with <code>revenue(master, **config)</code>. Build the sentence with an f-string. Inside an f-string, <code>{value:,.0f}</code> means “this number, with commas, and no decimals”. To read a value from the dictionary use <code>config["country"]</code>, written with single quotes inside a double-quoted f-string, as in <code>f"{config['country']}"</code>.</p>`,
      starter: `import pandas as pd\n\nconfigs = [\n    {"definition": "net", "year": 2025, "country": "Ghana"},\n    {"definition": "gross", "year": 2024, "country": "Rwanda"},\n]\n\n# Write your function below, then print one line per config\n`,
      hints: [
        `value = revenue(master, **config). Then return f"{config['country']}, {config['year']}, {config['definition']} revenue: {value:,.0f}". Loop for config in configs: and print(report_line(master, config)).`,
        `import pandas as pd\n\nconfigs = [\n    {"definition": "net", "year": 2025, "country": "Ghana"},\n    {"definition": "gross", "year": 2024, "country": "Rwanda"},\n]\n\ndef report_line(master, config):\n    value = revenue(master, **config)\n    return f"{config['country']}, {config['year']}, {config['definition']} revenue: {value:,.0f}"\n\nfor config in configs:\n    print(report_line(master, config))\n`
      ],
      solution: `import pandas as pd\n\nconfigs = [\n    {"definition": "net", "year": 2025, "country": "Ghana"},\n    {"definition": "gross", "year": 2024, "country": "Rwanda"},\n]\n\ndef report_line(master, config):\n    value = revenue(master, **config)\n    return f"{config['country']}, {config['year']}, {config['definition']} revenue: {value:,.0f}"\n\nfor config in configs:\n    print(report_line(master, config))\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Many reports from one list of settings',
      body: `<p>Here is where all this effort pays off. Once a report is driven by a config, producing <b>many reports</b> is just a loop over many configs. You do not write a function per report. You write one function and a list of slips.</p>
<p>The pattern for collecting the results is one you know from earlier lessons, now at a larger scale:</p>
<ol>
<li>Make an empty list, <code>rows = []</code>.</li>
<li>Loop over the things you want a report for: the countries, the definitions, the years.</li>
<li>In each pass, work out the numbers and <b>append one dictionary</b> to the list, one dictionary per row of the final table.</li>
<li>After the loop, turn the list of dictionaries into a table with <code>pd.DataFrame(rows)</code>.</li>
</ol>
<p>That last step is a handy trick. A list of dictionaries with the same keys becomes a table where each key is a column and each dictionary is a row. It is the easiest way to build a small summary table in a loop.</p>
<p>Which loop is right depends on the question. Looping over the five countries gives a <b>country table</b>. Looping over the three definitions gives a <b>reconciliation table</b> that shows finance how gross, net and completed revenue relate. Looping over years gives a trend. The logic inside never changes: it is always “call <code>revenue</code> with the right dials”.</p>
<p>There is one more benefit that is easy to miss. Because every row came from the same function, <b>the rows are comparable by construction</b>. Nobody can accuse the Ghana row of using a different definition from the Rwanda row, because there is no place in the code where that difference could have crept in.</p>
<div class="callout analogy"><b>The photocopier.</b> One original and a button, and ten copies come out identical. If the original has an error, every copy has it, and you fix it once. A loop over configs is the button on the photocopier.</div>
<div class="callout tip"><b>Sort the loop on purpose.</b> If you loop over <code>master["country"].unique()</code>, the order depends on the data. Use <code>sorted(...)</code> so the rows come out in the same order every Monday.</div>`
    },
    {
      type: 'try',
      title: 'A country table from a loop',
      body: `<p>For each country the loop asks the same function twice, once for 2024 and once for 2025, and appends one dictionary with the two figures in millions and the percentage change. Then <code>pd.DataFrame(rows)</code> turns the list into a table.</p>
<p>Read the table the way the CEO would. Ghana is up <b>12.9 percent</b> (77.91 to 87.95 million) and South Africa up <b>7.9 percent</b>. Kenya is down <b>4.0 percent</b>, Nigeria down <b>1.8 percent</b>, and Rwanda is level at <b>+0.2 percent</b>. The company total moved only +2.8 percent, and this table shows the five different stories hiding inside it.</p>`,
      code: `import pandas as pd

rows = []
for country in sorted(master["country"].unique()):
    before = revenue(master, year=2024, country=country)
    after = revenue(master, year=2025, country=country)
    rows.append({
        "country": country,
        "net_2024": round(before / 1000000, 2),
        "net_2025": round(after / 1000000, 2),
        "change_pct": round((after / before - 1) * 100, 1),
    })

table = pd.DataFrame(rows)
print(table)
`
    },
    {
      id: 'py-8-3-ex4',
      type: 'exercise',
      title: 'Your turn: one row per revenue definition',
      body: `<p>Finance wants to see how the three definitions of revenue relate. Loop over the definitions in <code>DEFINITIONS</code>, call <code>revenue</code> for the year 2025 for each, and build a table with two columns: <code>definition</code> and <code>revenue_m</code> (the revenue in millions, rounded to 2 decimals). Print the table.</p>
<p>You should see three rows: gross 458.93, net 414.01 and completed 339.56.</p>
<p><b>Think before you type:</b> <code>for definition in DEFINITIONS:</code> walks through the three keys. In each pass append <code>{"definition": definition, "revenue_m": round(revenue(master, definition=definition, year=2025) / 1000000, 2)}</code> to a list, and turn the list into a table after the loop.</p>`,
      starter: `import pandas as pd\n\n# Write your code below\n`,
      hints: [
        `Start with rows = []. In the loop: rows.append({"definition": definition, "revenue_m": round(revenue(master, definition=definition, year=2025) / 1000000, 2)}). After it: table = pd.DataFrame(rows) and print(table).`,
        `import pandas as pd\n\nrows = []\nfor definition in DEFINITIONS:\n    rows.append({"definition": definition, "revenue_m": round(revenue(master, definition=definition, year=2025) / 1000000, 2)})\n\ntable = pd.DataFrame(rows)\nprint(table)\n`
      ],
      solution: `import pandas as pd\n\nrows = []\nfor definition in DEFINITIONS:\n    rows.append({"definition": definition, "revenue_m": round(revenue(master, definition=definition, year=2025) / 1000000, 2)})\n\ntable = pd.DataFrame(rows)\nprint(table)\n`,
      ordered: true
    },
    {
      id: 'py-8-3-c2',
      type: 'check',
      title: 'It is Monday morning and the CEO says: “Run the same pack, but for 2026.” Where should you make the change?',
      body: `<p>Think about where the changeable values should live.</p>`,
      options: [
        'In every function that mentions the year, one by one',
        'In the config dictionary, in the single place where the year is set',
        'In the raw CSV files, by changing the dates',
        'Nowhere, because a pipeline cannot be rerun with a different year'
      ],
      answer: 1,
      why: [
        'Hunting through the functions is exactly the copy-and-patch habit you are leaving behind. If the year is a parameter, the functions never need to change.',
        'Right! A year is a setting, so it lives in the config. One edit, in one place, and every report that reads the config follows. The functions stay untouched, and so do their tests.',
        'Changing the data to change the report is the wrong way round. The data is the data. The settings decide what to look at.',
        'A well-designed pipeline can be rerun with any valid setting. That is what parameters are for.'
      ]
    },
    {
      type: 'explain',
      title: 'Reports that people can read',
      body: `<p>The numbers are right, and now they need to be <b>readable</b>. A director who sees <code>87945970.7</code> has to count digits. A director who sees <code>87,945,971</code> reads it at a glance. Formatting is the last mile between a correct figure and a useful one.</p>
<p>You already use f-strings. Inside the curly brackets you can add a <b>format specifier</b> after a colon. These are the ones you will use every week:</p>
<table class="mini">
<tr><th>Write</th><th>Meaning</th><th>Example result</th></tr>
<tr><td><code>{value:,.0f}</code></td><td>Commas for thousands, no decimals</td><td><code>87,945,971</code></td></tr>
<tr><td><code>{value:,.2f}</code></td><td>Commas, two decimals</td><td><code>87,945,970.70</code></td></tr>
<tr><td><code>{share:.1%}</code></td><td>A fraction as a percent with one decimal</td><td>0.2124 becomes <code>21.2%</code></td></tr>
<tr><td><code>{change:+.1f}%</code></td><td>Always show the sign, one decimal</td><td><code>+12.9%</code></td></tr>
</table>
<p>Note the <code>%</code> format: it multiplies by 100 for you, so you give it the <b>fraction</b> 0.2124, not 21.24.</p>
<p>A few habits keep a report trustworthy to read:</p>
<ul>
<li><b>Say the unit.</b> “Revenue: 87,945,971” is clearer than a bare number, and “(millions)” is clearer still.</li>
<li><b>Be consistent.</b> If money is rounded to the unit in one line, it is rounded to the unit in all of them. Do not mix 87.9 million with 87,945,971.</li>
<li><b>Round only at the end.</b> Do your sums on the full numbers and round only when you format them for display. Rounding early lets small errors build up.</li>
<li><b>Build the report as a list of lines</b>, then join them with <code>"\\n".join(lines)</code>, where <code>\\n</code> means “start a new line”. A list of lines is easy to extend, test and send in an email.</li>
</ul>
<div class="callout watch"><b>Format at the edge.</b> Keep the numbers as numbers inside your functions, so that they can be added, compared and tested. Turn them into text only in the last step, the one that makes the report. A number that has already become <code>"87,945,971"</code> text can no longer be added to anything.</div>`
    },
    {
      type: 'try',
      title: 'A readable report from a config',
      body: `<p>The config is turned into four lines: a title, the definition, the revenue with commas, and Ghana’s share of the year’s total as a percent. The lines are collected in a list and joined with <code>"\\n".join(lines)</code>.</p>
<p>Look at the share, <b>21.2%</b>. It is computed from two calls to <code>revenue</code>, one with the country filled in and one without. The same dials, the same function, a report a director can read in five seconds.</p>`,
      code: `import pandas as pd

config = {"definition": "net", "year": 2025, "country": "Ghana"}

value = revenue(master, **config)
total = revenue(master, definition=config["definition"], year=config["year"])

lines = [
    f"Revenue report: {config['country']}, {config['year']}",
    f"Definition: {config['definition']}",
    f"Revenue: {value:,.0f}",
    f"Share of all countries: {value / total:.1%}",
]
print("\\n".join(lines))
`
    },
    {
      id: 'py-8-3-ex5',
      type: 'exercise',
      title: 'Challenge: a report function',
      body: `<p>Turn the previous card into a function. Write <code>format_report(master, config)</code> that returns the four-line report as <b>one string</b>, with the lines in exactly this form (for Ghana, 2025, net):</p>
<ul>
<li><code>Revenue report: Ghana, 2025</code></li>
<li><code>Definition: net</code></li>
<li><code>Revenue: 87,945,971</code></li>
<li><code>Share of all countries: 21.2%</code></li>
</ul>
<p>The starter has two configs, the second for Rwanda in 2024, gross. Print the report for each, with an empty line between them (a bare <code>print()</code> does that).</p>
<p><b>Think before you type:</b> the share is the country’s revenue divided by the revenue of all countries for the <b>same definition and year</b>. Collect the four f-strings in a list called <code>lines</code> and <code>return "\\n".join(lines)</code>.</p>`,
      starter: `import pandas as pd\n\nconfigs = [\n    {"definition": "net", "year": 2025, "country": "Ghana"},\n    {"definition": "gross", "year": 2024, "country": "Rwanda"},\n]\n\n# Write your function below, then print both reports\n`,
      hints: [
        `Inside: value = revenue(master, **config) and total = revenue(master, definition=config["definition"], year=config["year"]). Build lines = [four f-strings] and return "\\n".join(lines). Outside: print(format_report(master, configs[0])), then print(), then the second report.`,
        `import pandas as pd\n\nconfigs = [\n    {"definition": "net", "year": 2025, "country": "Ghana"},\n    {"definition": "gross", "year": 2024, "country": "Rwanda"},\n]\n\ndef format_report(master, config):\n    value = revenue(master, **config)\n    total = revenue(master, definition=config["definition"], year=config["year"])\n    lines = [\n        f"Revenue report: {config['country']}, {config['year']}",\n        f"Definition: {config['definition']}",\n        f"Revenue: {value:,.0f}",\n        f"Share of all countries: {value / total:.1%}",\n    ]\n    return "\\n".join(lines)\n\nprint(format_report(master, configs[0]))\nprint()\nprint(format_report(master, configs[1]))\n`
      ],
      solution: `import pandas as pd\n\nconfigs = [\n    {"definition": "net", "year": 2025, "country": "Ghana"},\n    {"definition": "gross", "year": 2024, "country": "Rwanda"},\n]\n\ndef format_report(master, config):\n    value = revenue(master, **config)\n    total = revenue(master, definition=config["definition"], year=config["year"])\n    lines = [\n        f"Revenue report: {config['country']}, {config['year']}",\n        f"Definition: {config['definition']}",\n        f"Revenue: {value:,.0f}",\n        f"Share of all countries: {value / total:.1%}",\n    ]\n    return "\\n".join(lines)\n\nprint(format_report(master, configs[0]))\nprint()\nprint(format_report(master, configs[1]))\n`,
      ordered: true
    },
    {
      id: 'py-8-3-c3',
      type: 'check',
      title: 'What does revenue(master, **{"year": 2025, "country": "Ghana"}) do?',
      body: `<p>Think about what the double star does to a dictionary in a call.</p>`,
      options: [
        'It multiplies the year by the country',
        'It spreads the dictionary into named arguments, so it is the same as revenue(master, year=2025, country="Ghana")',
        'It raises an error, because a dictionary cannot be used in a call',
        'It passes the dictionary as the first argument, in place of master'
      ],
      answer: 1,
      why: [
        'The double star does not multiply anything. It unpacks.',
        'Right! <code>**</code> takes each key and value of the dictionary and passes them as <code>key=value</code>. That is what lets one config dictionary drive a whole function call.',
        'It works well. Spreading a dictionary into named arguments is a standard Python feature, and the only requirement is that every key matches a parameter name.',
        'The dictionary is spread into the named arguments <code>year</code> and <code>country</code>. <code>master</code> is still passed as the first argument, as written.'
      ]
    },
    {
      type: 'explain',
      title: 'What you can do now, and what comes next',
      body: `<p>You have turned a fixed report into a flexible one. You can:</p>
<ul>
<li>Spot a <b>hard-coded value</b> and turn it into a <b>parameter</b>, a dial with a name the business would use</li>
<li>Give parameters <b>defaults</b>, use <code>None</code> as “no filter”, and call functions with <b>keyword arguments</b></li>
<li>Check the dials first and <b>raise a helpful ValueError</b> for a bad setting, with the valid choices in the message</li>
<li>Store a business rule in one dictionary, a <b>single source of truth</b>, such as <code>DEFINITIONS</code></li>
<li>Gather settings in a <b>config dictionary</b> and drive a function with <code>**config</code></li>
<li>Produce <b>many reports</b> by looping over configs and collecting rows into a table with <code>pd.DataFrame(rows)</code></li>
<li>Format numbers for people with <code>{value:,.0f}</code> and <code>{share:.1%}</code>, and build a report as a list of lines</li>
</ul>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>Why would you move hard-coded values into parameters or a config?</li>
<li>What does the <code>**</code> do in <code>f(**config)</code>?</li>
<li>Two analysts report different “net revenue” numbers. How would your code design prevent that?</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> Hard-coded values hide the choices that someone may want to change, such as a year, a country or a definition, deep inside the logic. If they are parameters or live in a config, one function serves many requests, the change is made in one visible place, the code is tested once, and nobody has to edit the logic to run a different report. It also makes the report reproducible, because the settings used are written down.</p>
<p><b>2.</b> It unpacks a dictionary into keyword arguments. <code>f(**{"a": 1, "b": 2})</code> is the same as <code>f(a=1, b=2)</code>. It lets a config dictionary drive a function call, as long as the keys match the parameter names, and a key that does not match raises a clear error.</p>
<p><b>3.</b> I would write the definition of net revenue in one place, as a dictionary entry or a single function, and make every report call that. Then two analysts using the same code cannot get different definitions, and a change of rule is made once. I would also print the definition and the config on the report itself, so that anyone reading the number knows exactly what it means.</p>
</details>
<p><b>Coming next, in lesson 8.4:</b> the finale of the Python track. You will assemble everything from Modules 1 to 8 into one complete automated pipeline, the Monday report. It loads, checks, builds, calculates, writes its findings in plain sentences, draws a chart, and saves its results. You will also learn how a real script is structured, with a <code>main()</code> function, and how a company runs it on a schedule so it lands in the CEO’s inbox without you.</p>`
    }
  ]
},
{
  id: 'py-8-4',
  track: 'python',
  lang: 'python',
  packages: ['pandas', 'numpy', 'matplotlib'],
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

DEFINITIONS = {
    "gross": ["Completed", "Processing", "Cancelled", "Returned"],
    "net": ["Completed", "Processing"],
    "completed": ["Completed"],
}

def revenue(master, definition="net", year=None, country=None):
    """Total line_total for one revenue definition, optionally for one year and one country."""
    if definition not in DEFINITIONS:
        raise ValueError(f"unknown definition '{definition}'. Choose from: {', '.join(DEFINITIONS)}")
    kept = master[master["order_status"].isin(DEFINITIONS[definition])]
    if year is not None:
        kept = kept[kept["order_year"] == year]
    if country is not None:
        kept = kept[kept["country"] == country]
    return kept["line_total"].sum()

def check_same_rows(before, after, step):
    if before != after:
        raise ValueError(f"{step}: row count changed from {before:,} to {after:,}")

def tie_out_gap(master, payments):
    return round(abs(master["line_total"].sum() - payments["amount"].sum()), 2)

def run_checks(tables, master):
    """Run the eleven checks of lesson 8.2 and return the report as a table."""
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
    gap = tie_out_gap(master, payments)

    check("customer_id is unique", customers["customer_id"].is_unique, "blocker")
    check("order_id is unique", orders["order_id"].is_unique, "blocker")
    check("product_id is unique", products["product_id"].is_unique, "blocker")
    check("orders point to real customers", orders["customer_id"].isin(customers["customer_id"]).all(), "blocker")
    check("order lines point to real orders", order_items["order_id"].isin(orders["order_id"]).all(), "blocker")
    check("order lines point to real products", order_items["product_id"].isin(products["product_id"]).all(), "blocker")
    check("payment amounts are above zero", (payments["amount"] > 0).all(), "blocker")
    check("revenue ties out to payments", gap < 0.01, "blocker", f"gap {gap}")
    check("every customer has an email", no_email == 0, "warning", f"{no_email} customers have no email")
    check("orders are on or after signup", early == 0, "warning", f"{early} orders dated before signup")
    check("one line per product per order", repeats == 0, "warning", f"{repeats} repeats, real purchases (lesson 3.3)")
    return pd.DataFrame(results)

def check_year(year, allowed):
    if year not in allowed:
        raise ValueError(f"year {year} is not in the data ({min(allowed)} to {max(allowed)})")

def count_blockers(report):
    failed_blockers = (report["result"] == "FAIL") & (report["severity"] == "blocker")
    return int(failed_blockers.sum())
`,
  preloaded: ['load_tables', 'build_master', 'revenue', 'DEFINITIONS', 'check_same_rows', 'tie_out_gap', 'run_checks', 'check_year', 'count_blockers', 'add_clean_name', 'clean_emails', 'net_revenue'],
  title: '8.4 The Monday report: a complete automated pipeline',
  tables: [],
  intro: `Thursday evening. The CEO stops at your desk once more. <i>“The pack is good. Next Monday I would like it to be in my inbox at seven, without me asking you. Can you make it so?”</i><br><br>The Head of Data nods. <i>“Then you build a script that runs without us, and checks itself before it speaks.”</i><br><br>This is the last lesson of the Python track, and you have every piece you need. In 8.1 you built tools. In 8.2 you chained them into a pipeline with inspectors. In 8.3 you gave it dials and a config. Now you assemble them into one finished system: a script with a <code>main()</code>, a report that explains itself, files that are saved and read back, a chart that draws itself, and a schedule that lets it run while you sleep.<br><br>Your toolkit is loaded: <code>load_tables</code>, <code>build_master</code>, <code>revenue</code>, <code>DEFINITIONS</code>, the guards <code>check_same_rows</code>, <code>tie_out_gap</code> and <code>check_year</code>, the checks <code>run_checks</code> and <code>count_blockers</code>, and the cleaning tools from 8.1.`,
  steps: [
    {
      type: 'explain',
      title: 'From a notebook to a script',
      body: `<p>Until now you have worked in a notebook-like place: you write a little code, press Run, look at the result, change something, run again. That is perfect for <b>exploring</b>, because you can try an idea in seconds. It is a poor way to <b>produce the Monday report</b>, for three reasons.</p>
<ul>
<li><b>Hidden state.</b> A notebook remembers every cell you ran, in the order you ran them. If you changed a cell and forgot to rerun the one below, the numbers on the screen come from two different moments. Nobody can see that from outside.</li>
<li><b>It needs you.</b> Somebody has to open it and press the buttons. At seven on Monday that somebody is you, or nobody.</li>
<li><b>It is hard to check.</b> Two hundred cells in a notebook are a story. A script is a recipe: one file, read from the top to the bottom, always in the same order.</li>
</ul>
<p>A <b>script</b> is a file of Python that runs from start to finish, with no one pressing buttons. Turning your work into one is mostly a matter of putting things in the right order. Professional scripts follow the same shape, and you can recognise it in any company’s code:</p>
<table class="mini">
<tr><th>Part</th><th>What goes there</th><th>In the Monday report</th></tr>
<tr><td><b>1. Imports</b></td><td>The libraries it needs</td><td><code>import pandas as pd</code></td></tr>
<tr><td><b>2. Settings</b></td><td>Constants and the config, at the top, in plain sight</td><td><code>config = {"year": 2025}</code></td></tr>
<tr><td><b>3. Functions</b></td><td>All the tools, one job each</td><td>Everything from lessons 8.1 to 8.3</td></tr>
<tr><td><b>4. main()</b></td><td>One function that runs the pipeline in order</td><td><code>run_monday_report(config)</code></td></tr>
<tr><td><b>5. The guard</b></td><td>The line that starts <code>main()</code> when the file is run</td><td><code>if __name__ == "__main__":</code></td></tr>
</table>
<p>Read that table once more, because it is the whole lesson in miniature. Settings at the top, tools in the middle, one conductor at the bottom. A colleague opening your file should be able to say what it does in thirty seconds, just by reading the names.</p>
<div class="callout analogy"><b>The workbench and the production line.</b> A notebook is a workbench: messy, flexible, full of half-finished things, ideal for inventing. A script is the production line that your invention becomes: the same steps, in the same order, every time, with nobody at the controls.</div>
<div class="callout tip"><b>The notebook is still useful.</b> Most analysts explore in a notebook and then move the finished logic into functions in a script. The skills in this module are exactly what makes that move easy.</div>`
    },
    {
      type: 'try',
      title: 'The shape of a script',
      body: `<p>A tiny script with all five parts: an import, a constant at the top (<code>TITLE</code>), a function, a <code>main()</code> that runs things in order, and the guard at the bottom. The last two lines are the interesting ones.</p>
<p>Run it. The report title prints, and then the line <code>__name__ is __main__</code>. That strange name is what the guard checks, and the next card explains it.</p>`,
      code: `import pandas as pd

TITLE = "TradeFlow Monday report"

def build_title(config):
    return f"{TITLE}: {config['year']}"

def main():
    config = {"year": 2025}
    print(build_title(config))
    print("__name__ is", __name__)

if __name__ == "__main__":
    main()
`
    },
    {
      type: 'explain',
      title: 'The two lines at the bottom of every script',
      body: `<p>Almost every professional Python script ends with these two lines, and almost every beginner wonders what they are. The idea is simpler than it looks.</p>
<p>Every Python file has a built-in variable called <code>__name__</code>, which holds the name of the file as Python sees it. There are two situations:</p>
<ul>
<li>When you <b>run the file directly</b>, for example from a scheduler at seven on Monday, Python sets <code>__name__</code> to the special text <code>"__main__"</code>.</li>
<li>When <b>another file imports it</b>, to use one of its functions, <code>__name__</code> is just the file’s own name.</li>
</ul>
<p>So the line <code>if __name__ == "__main__":</code> reads as: “only do the next thing if I am being run directly, not if somebody is merely borrowing my functions.”</p>
<p>Why does it matter? Imagine you write a test file that wants to borrow <code>tie_out_gap</code> from your report script, in order to test it on a tiny table, as you learned in lesson 8.1. Without the guard, the moment the test file imports your script, the <b>whole report would start running</b>: loading files, building tables, saving results. With the guard, the import only picks up the functions, and nothing runs until somebody really means it.</p>
<div class="callout analogy"><b>The cookbook.</b> A cookbook is full of recipes, and opening it does not cook dinner. Cooking happens only when someone decides to follow a recipe. The guard is the line that says “start cooking only if I was opened to cook”.</div>
<div class="callout watch"><b>In this browser, the code is always run directly.</b> So here <code>__name__</code> is always <code>"__main__"</code> and the guard always lets <code>main()</code> through. You are practising the shape that works unchanged on a real computer.</div>
<div class="callout tip"><b>Keep main() thin.</b> A good <code>main()</code> reads like the table of contents of the report: load, check, compute, save. The real work lives in the functions it calls.</div>`
    },
    {
      id: 'py-8-4-ex1',
      type: 'exercise',
      title: 'Your turn: main() and the guard',
      body: `<p>The starter has a function <code>greet(config)</code>. Write a <code>main()</code> function that does three things in order: it makes the config <code>{"year": 2025}</code>, prints <code>greet(config)</code>, and then prints <code>Report finished</code>. Then add the guard at the bottom so that <code>main()</code> runs when the file is run directly.</p>
<p>You should see two lines: <code>Report for 2025 started</code> and <code>Report finished</code>.</p>
<p><b>Think before you type:</b> <code>def main():</code> with the three statements indented. At the very bottom, with no indentation, write <code>if __name__ == "__main__":</code> and call <code>main()</code> on the line below, indented.</p>`,
      starter: `import pandas as pd\n\ndef greet(config):\n    return f"Report for {config['year']} started"\n\n# Write your main() function and the guard below\n`,
      hints: [
        `def main(): config = {"year": 2025}, then print(greet(config)) and print("Report finished"). At the bottom: if __name__ == "__main__": and, indented, main().`,
        `import pandas as pd\n\ndef greet(config):\n    return f"Report for {config['year']} started"\n\ndef main():\n    config = {"year": 2025}\n    print(greet(config))\n    print("Report finished")\n\nif __name__ == "__main__":\n    main()\n`
      ],
      solution: `import pandas as pd\n\ndef greet(config):\n    return f"Report for {config['year']} started"\n\ndef main():\n    config = {"year": 2025}\n    print(greet(config))\n    print("Report finished")\n\nif __name__ == "__main__":\n    main()\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Results that outlive the run',
      body: `<p>A report that only prints to the screen vanishes the moment the program ends. A report that runs at seven on Monday with nobody watching must leave something behind: a file the CEO can open, a table finance can load, a record that proves it ran. So the pipeline needs a <b>save</b> step.</p>
<p>Two kinds of output cover most needs.</p>
<p><b>Tables go to CSV.</b> You already read CSV files with <code>pd.read_csv</code>. Its twin is <code>table.to_csv("name.csv", index=False)</code>. The <code>index=False</code> keeps Pandas from adding a useless extra column of row numbers.</p>
<p><b>Text goes to a text file.</b> For the written findings, Python’s way of writing a file is the <code>with</code> block:</p>
<p><code>with open("report.txt", "w") as file:</code> and then, indented, <code>file.write(text)</code>.</p>
<p>Read it as: “open this file for <b>w</b>riting, call it <code>file</code> while I am inside this block, and when I leave the block close it properly”. The <code>with</code> matters because it closes the file for you even when something goes wrong in the middle, so you never leave a half-written file open. The letter <code>"w"</code> is the mode: <code>"w"</code> writes and <b>replaces</b> anything already there, <code>"a"</code> adds to the end, and <code>"r"</code>, the default, reads.</p>
<p>Three habits make saved files safe to rely on:</p>
<ul>
<li><b>Put the settings in the file name.</b> <code>f"report_{year}.csv"</code> means this Monday’s file does not overwrite last year’s. Mode <code>"w"</code> replaces silently, so a fixed name such as <code>report.csv</code> destroys yesterday’s result without a word.</li>
<li><b>Read it back and compare.</b> A save step you never check is a guess. Reading the file back with <code>pd.read_csv</code> and testing <code>back.equals(table)</code> proves the file holds what you meant to save.</li>
<li><b>Check that the file exists</b> with <code>os.path.exists(name)</code> before you tell anyone the report is ready.</li>
</ul>
<div class="callout watch"><b>Files in this browser are temporary.</b> The files you write in these lessons live in a small space that disappears when you reload the page. On a real computer or a server, they stay where you put them. The code is exactly the same.</div>
<div class="callout work"><b>At work:</b> output often goes to a shared folder, a database table, or an email attachment instead. Each is one more function at the end of the pipeline, and the rest of the script does not change.</div>`
    },
    {
      type: 'try',
      title: 'Save it, then read it back',
      body: `<p>The code builds a small country table for 2025, saves it as a CSV, writes a two-line text file with a <code>with</code> block, and then proves both files exist. Then it reads the CSV back and asks whether it equals the original table. The answer, <code>True</code>, is the proof that the save worked.</p>
<p>Finally the text file is read back and printed. A save step you have read back is a save step you can trust.</p>`,
      code: `import os
import pandas as pd

tables = load_tables()
master = build_master(tables)

rows = []
for country in sorted(master["country"].unique()):
    rows.append({"country": country, "revenue_m": round(revenue(master, year=2025, country=country) / 1000000, 2)})
table = pd.DataFrame(rows)

table.to_csv("report_2025.csv", index=False)

lines = ["TradeFlow Monday report: 2025", "Rows saved: " + str(len(table))]
with open("report_2025.txt", "w") as file:
    file.write("\\n".join(lines))

for name in ["report_2025.csv", "report_2025.txt"]:
    print(name, os.path.exists(name))

back = pd.read_csv("report_2025.csv")
print(back.equals(table))
with open("report_2025.txt") as file:
    print(file.read())
`
    },
    {
      id: 'py-8-4-ex2',
      type: 'exercise',
      title: 'Your turn: a save you can trust',
      body: `<p>The starter builds <code>table</code>: net revenue in millions per country for 2025, largest first. Save only the <b>top three rows</b> to a CSV called <code>top3.csv</code> (without the index), read the file back into a table called <code>back</code>, and print two things: the shape of <code>back</code>, and its <code>country</code> column as a list.</p>
<p>You should see <code>(3, 2)</code> and then <code>['Rwanda', 'Ghana', 'Nigeria']</code>.</p>
<p><b>Think before you type:</b> <code>table.head(3).to_csv("top3.csv", index=False)</code> does the saving. <code>pd.read_csv("top3.csv")</code> reads it back. A column becomes a list with <code>.tolist()</code>.</p>`,
      starter: `import pandas as pd\n\ntables = load_tables()\nmaster = build_master(tables)\n\nrows = []\nfor country in sorted(master["country"].unique()):\n    rows.append({"country": country, "revenue_m": round(revenue(master, year=2025, country=country) / 1000000, 2)})\ntable = pd.DataFrame(rows).sort_values("revenue_m", ascending=False)\n\n# Write your code below\n`,
      hints: [
        `table.head(3).to_csv("top3.csv", index=False). Then back = pd.read_csv("top3.csv"), print(back.shape) and print(back["country"].tolist()).`,
        `import pandas as pd\n\ntables = load_tables()\nmaster = build_master(tables)\n\nrows = []\nfor country in sorted(master["country"].unique()):\n    rows.append({"country": country, "revenue_m": round(revenue(master, year=2025, country=country) / 1000000, 2)})\ntable = pd.DataFrame(rows).sort_values("revenue_m", ascending=False)\n\ntable.head(3).to_csv("top3.csv", index=False)\nback = pd.read_csv("top3.csv")\nprint(back.shape)\nprint(back["country"].tolist())\n`
      ],
      solution: `import pandas as pd\n\ntables = load_tables()\nmaster = build_master(tables)\n\nrows = []\nfor country in sorted(master["country"].unique()):\n    rows.append({"country": country, "revenue_m": round(revenue(master, year=2025, country=country) / 1000000, 2)})\ntable = pd.DataFrame(rows).sort_values("revenue_m", ascending=False)\n\ntable.head(3).to_csv("top3.csv", index=False)\nback = pd.read_csv("top3.csv")\nprint(back.shape)\nprint(back["country"].tolist())\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A report you can reproduce',
      body: `<p>Imagine that in March a director asks: “The report you sent in January said 414 million. Can you show me how you got that?” If the answer is “I think I used the 2025 setting, and I may have changed the filter a bit”, the report is worth very little. A trustworthy report can be <b>reproduced</b>: given the same code, the same settings and the same data, it gives the same numbers, every time, for anyone.</p>
<p>Three things break reproducibility, and each has a simple cure.</p>
<ul>
<li><b>Hidden inputs.</b> A line such as <code>datetime.now()</code> buried inside a function makes the report depend on the day it was run. If the date matters, put it in the config as <code>"as_of": "2026-06-30"</code>, so it is visible and repeatable.</li>
<li><b>Hidden randomness.</b> A random sample without a fixed seed changes every run. Always set the seed, as with <code>random_state=1</code> in lesson 7.3.</li>
<li><b>Silent settings.</b> If the year is chosen somewhere deep in the code, a reader cannot know what the report covers. The cure is to <b>print the config at the top of the report</b>.</li>
</ul>
<p>A good report therefore carries its own <b>receipt</b>: a header with the settings, such as “Monday report for 2025”, and a short log of what the run saw: how many rows were loaded, how many checks passed and failed, how many warnings were raised. Anyone reading the report can see what it covers, and whether its data was healthy.</p>
<p>This is also why the config should be the <b>only</b> way to change a report. If a number in the report ever surprises someone, you rerun the script with the same config and show that it comes out the same, then walk them through the log. That conversation is short and calm. The alternative conversation, with no config and no log, is neither.</p>
<div class="callout analogy"><b>The recipe card with the oven setting.</b> A recipe that says “bake until done” cannot be repeated. A recipe that says “180 degrees for 25 minutes” can. The config is the oven setting of your report.</div>`
    },
    {
      id: 'py-8-4-c1',
      type: 'check',
      title: 'Why should the report print the config it ran with, for example “Monday report for 2025”, at the top?',
      body: `<p>Think about the director who asks, three months later, how the number was produced.</p>`,
      options: [
        'Because Python refuses to run a script without a heading',
        'So that anyone reading it can see exactly what it covers, and so that the run can be repeated with the same settings and give the same numbers',
        'Because the config makes the numbers more accurate',
        'Only to make the report look longer'
      ],
      answer: 1,
      why: [
        'Python does not require a heading. The reason is about the reader, not the language.',
        'Right! A report that states its settings can be checked and reproduced. The same code, the same config and the same data give the same numbers, and the log shows what the data looked like on the day.',
        'The config does not change the accuracy of the numbers. It records what the numbers are about.',
        'Length is not the point. A short header that states the settings and the health of the data is one of the most valuable lines in the report.'
      ]
    },
    {
      type: 'explain',
      title: 'The finished design: layers and one conductor',
      body: `<p>You have everything you need, so it is time to look at the whole machine. The Monday report has six <b>layers</b>, and each is a function you have already written or are about to write:</p>
<table class="mini">
<tr><th>Layer</th><th>The job</th><th>The tool</th></tr>
<tr><td><b>Load</b></td><td>Read the six tables</td><td><code>load_tables()</code></td></tr>
<tr><td><b>Build</b></td><td>Make the master table, guard the row count</td><td><code>build_master()</code>, <code>check_same_rows()</code></td></tr>
<tr><td><b>Check</b></td><td>Validate the settings and the data, stop on blockers</td><td><code>check_year()</code>, <code>run_checks()</code>, <code>count_blockers()</code></td></tr>
<tr><td><b>Compute</b></td><td>Work out the table and the findings</td><td><code>kpi_table()</code>, <code>findings()</code></td></tr>
<tr><td><b>Format</b></td><td>Turn numbers into readable sentences</td><td>f-strings, <code>"\\n".join(lines)</code></td></tr>
<tr><td><b>Save</b></td><td>Write the files, read them back</td><td><code>to_csv</code>, <code>with open(...)</code></td></tr>
</table>
<p>Above the layers sits one <b>conductor</b>, <code>run_monday_report(config)</code>. A conductor does not play any instrument. Its job is to say who plays when, and to stop the orchestra if something goes wrong. In code that means the conductor has <b>almost no logic of its own</b>. It calls the layers in order, collects what they return, and wraps everything in the <code>try</code> and <code>except ValueError</code> safety net from lesson 8.2, so that any inspector’s complaint becomes a clean <code>STOPPED</code> message and not a crash. If you can read the conductor aloud as a recipe, it is well designed.</p>
<p>Two small pieces of Python appear in the next card and deserve a word.</p>
<p><b><code>max(by_country, key=by_country.get)</code></b> finds the country with the largest revenue. <code>by_country</code> is a dictionary that maps each country to its revenue. Normally <code>max</code> on a dictionary compares the keys, which are names. The <code>key=by_country.get</code> tells <code>max</code>: “compare them by their values instead”. The result is the name of the country with the biggest number.</p>
<p><b><code>lines.extend(findings(...))</code></b> adds <b>every item</b> of a list to another list. <code>append</code> would add the whole list as one item. The difference is exactly the one between putting three eggs into a basket and putting a box of three eggs into it.</p>
<div class="callout watch"><b>The conductor decides, the layers do.</b> If your conductor starts to contain filters, sums and formatting, move them into functions. A long conductor is the first sign of a pipeline that will be hard to change.</div>`
    },
    {
      type: 'try',
      title: 'The Monday report, end to end',
      body: `<p>This is the whole pipeline in one cell. Your toolkit from the last three lessons is loaded, so the cell only adds the new pieces: <code>kpi_table</code> (revenue by country and definition), <code>findings</code> (three sentences) and the conductor <code>run_monday_report</code>.</p>
<p>Run it and read the result like a director. The status is <b>finished</b>. The checks line says <b>0 blockers failed, 3 warnings raised</b>, the three known quirks. Then the findings: net revenue in 2025 was <b>414.01 million</b>, <b>Rwanda</b> was the top country with 92.42 million (22.3 percent), and net revenue changed by <b>+2.8 percent</b> against 2024. Underneath sits the table, with the three definitions side by side for every country. Everything in this output came from one call.</p>`,
      code: `import pandas as pd

def kpi_table(master, year):
    rows = []
    for country in sorted(master["country"].unique()):
        row = {"country": country}
        for definition in DEFINITIONS:
            row[definition] = round(revenue(master, definition=definition, year=year, country=country) / 1000000, 2)
        rows.append(row)
    return pd.DataFrame(rows)

def findings(master, year):
    this_year = revenue(master, year=year)
    last_year = revenue(master, year=year - 1)
    by_country = {}
    for country in sorted(master["country"].unique()):
        by_country[country] = revenue(master, year=year, country=country)
    top = max(by_country, key=by_country.get)
    return [
        f"Net revenue in {year} was {this_year / 1000000:.2f} million.",
        f"{top} was the top country with {by_country[top] / 1000000:.2f} million ({by_country[top] / this_year:.1%} of the total).",
        f"Net revenue changed by {(this_year / last_year - 1) * 100:+.1f}% against {year - 1}.",
    ]

def run_monday_report(config):
    lines = []
    try:
        tables = load_tables()
        master = build_master(tables)
        check_same_rows(len(tables["order_items"]), len(master), "build_master")
        check_year(config["year"], sorted(master["order_year"].unique().tolist()))

        report = run_checks(tables, master)
        blockers = count_blockers(report)
        warnings = int(((report["result"] == "FAIL") & (report["severity"] == "warning")).sum())
        if blockers > 0:
            raise ValueError(f"{blockers} blocker checks failed")

        lines.append(f"Monday report for {config['year']}")
        lines.append(f"Checks: {blockers} blockers failed, {warnings} warnings raised")
        lines.extend(findings(master, config["year"]))
        table = kpi_table(master, config["year"])
        status = "finished"
    except ValueError as error:
        lines = ["STOPPED: " + str(error)]
        table = None
        status = "stopped"
    return {"status": status, "lines": lines, "table": table}

result = run_monday_report({"year": 2025})
print(result["status"])
print("\\n".join(result["lines"]))
print(result["table"])
`
    },
    {
      id: 'py-8-4-ex3',
      type: 'exercise',
      title: 'Your turn: the KPI table for another year',
      body: `<p>The CEO asks for last year’s table as well. Write <code>kpi_table(master, year)</code>. It should return a table with one row per country (in alphabetical order) and four columns: <code>country</code>, then one column per definition in <code>DEFINITIONS</code> (<code>gross</code>, <code>net</code>, <code>completed</code>), each holding the revenue in millions rounded to 2 decimals. Then print the table for <b>2024</b>.</p>
<p>You should see five rows, from Ghana to South Africa. Rwanda’s gross revenue for 2024 is 101.85.</p>
<p><b>Think before you type:</b> the same pattern as the loop in lesson 8.3: a list <code>rows</code>, a loop over <code>sorted(master["country"].unique())</code>, a dictionary <code>row = {"country": country}</code>, an inner loop over <code>DEFINITIONS</code> that adds one key per definition, then <code>rows.append(row)</code>, and finally <code>pd.DataFrame(rows)</code>.</p>`,
      starter: `import pandas as pd\n\nmaster = build_master(load_tables())\n\n# Write your function below, then print kpi_table(master, 2024)\n`,
      hints: [
        `Loop for country in sorted(master["country"].unique()): row = {"country": country}. Inner loop for definition in DEFINITIONS: row[definition] = round(revenue(master, definition=definition, year=year, country=country) / 1000000, 2). Then rows.append(row). Return pd.DataFrame(rows).`,
        `import pandas as pd\n\nmaster = build_master(load_tables())\n\ndef kpi_table(master, year):\n    rows = []\n    for country in sorted(master["country"].unique()):\n        row = {"country": country}\n        for definition in DEFINITIONS:\n            row[definition] = round(revenue(master, definition=definition, year=year, country=country) / 1000000, 2)\n        rows.append(row)\n    return pd.DataFrame(rows)\n\nprint(kpi_table(master, 2024))\n`
      ],
      solution: `import pandas as pd\n\nmaster = build_master(load_tables())\n\ndef kpi_table(master, year):\n    rows = []\n    for country in sorted(master["country"].unique()):\n        row = {"country": country}\n        for definition in DEFINITIONS:\n            row[definition] = round(revenue(master, definition=definition, year=year, country=country) / 1000000, 2)\n        rows.append(row)\n    return pd.DataFrame(rows)\n\nprint(kpi_table(master, 2024))\n`,
      ordered: true
    },
    {
      id: 'py-8-4-ex4',
      type: 'exercise',
      title: 'Your turn: a finding about categories',
      body: `<p>The marketing manager wants a sentence about products, not countries. Write <code>top_category_line(master, year)</code> that finds the <b>net</b> revenue (statuses in <code>DEFINITIONS["net"]</code>) of each product category in the given year and returns one sentence in this form:</p>
<p><code>Electronics was the top category with 158.53 million (38.3% of the total).</code></p>
<p>Print the sentence for 2025 and then for 2024. You should see two sentences, both about Electronics, with the shares 38.3% and 39.4%.</p>
<p><b>Think before you type:</b> filter the master table with two conditions joined by <code>&amp;</code>: the status is in <code>DEFINITIONS["net"]</code> and <code>order_year</code> equals <code>year</code>. Then <code>groupby("category")["line_total"].sum()</code>. The top category is <code>.idxmax()</code>, its value is <code>.max()</code>, and the total of all categories is <code>.sum()</code>.</p>`,
      starter: `import pandas as pd\n\nmaster = build_master(load_tables())\n\n# Write your function below, then print the sentence for 2025 and for 2024\n`,
      hints: [
        `kept = master[master["order_status"].isin(DEFINITIONS["net"]) & (master["order_year"] == year)]. by_category = kept.groupby("category")["line_total"].sum(). top = by_category.idxmax(). Return f"{top} was the top category with {by_category.max() / 1000000:.2f} million ({by_category.max() / by_category.sum():.1%} of the total).".`,
        `import pandas as pd\n\nmaster = build_master(load_tables())\n\ndef top_category_line(master, year):\n    kept = master[master["order_status"].isin(DEFINITIONS["net"]) & (master["order_year"] == year)]\n    by_category = kept.groupby("category")["line_total"].sum()\n    top = by_category.idxmax()\n    return f"{top} was the top category with {by_category.max() / 1000000:.2f} million ({by_category.max() / by_category.sum():.1%} of the total)."\n\nprint(top_category_line(master, 2025))\nprint(top_category_line(master, 2024))\n`
      ],
      solution: `import pandas as pd\n\nmaster = build_master(load_tables())\n\ndef top_category_line(master, year):\n    kept = master[master["order_status"].isin(DEFINITIONS["net"]) & (master["order_year"] == year)]\n    by_category = kept.groupby("category")["line_total"].sum()\n    top = by_category.idxmax()\n    return f"{top} was the top category with {by_category.max() / 1000000:.2f} million ({by_category.max() / by_category.sum():.1%} of the total)."\n\nprint(top_category_line(master, 2025))\nprint(top_category_line(master, 2024))\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'A chart that draws itself',
      body: `<p>The Monday report should include a picture, and by now you know exactly what a good one looks like: a finding in the title, one spotlight colour, numbers on the bars, labelled axes. What is new is that nobody is watching when it is drawn. That changes three small things.</p>
<p><b>1. The chart becomes a function that returns the figure.</b> In lesson 7.4 you built charts directly in a cell. In a pipeline a chart is a tool like any other: <code>plot_countries(master, year)</code> takes the data and the year, draws, and <b>returns</b> the figure object <code>fig</code>. The caller decides what to do with it.</p>
<p><b>2. It is saved to a file, not shown on a screen.</b> <code>fig.savefig("report_2025_chart.png")</code> writes the picture to disk. A scheduler has no screen, so there is no <code>plt.show()</code> in a pipeline. The same rule you follow on this platform is the rule on a server.</p>
<p><b>3. It must be complete on its own.</b> At seven in the morning nobody can ask you what the chart means. So the title includes the year and the unit, the axes are labelled, and the settings come from the config, never typed into the chart code. The chart for 2026 must come out of the same function with a different config.</p>
<p>One more habit for a real server: if the script draws many charts in a loop, call <code>plt.close(fig)</code> after saving each one. Otherwise Matplotlib keeps them all in memory. In a lesson cell we leave the figure open so that you can see it.</p>
<div class="callout tip"><b>Reuse your design.</b> The spotlight bar, the numbers on the bars and the finding-style title all come straight from lesson 7.4. A pipeline is where your earlier skills stop being exercises and start being tools.</div>`
    },
    {
      type: 'try',
      title: 'A chart function that saves its own picture',
      body: `<p>The function builds a dictionary of revenue by country, sorts it, picks the amber spotlight for the leader and grey-blue for the rest, draws sideways bars with numbers, and <b>returns the figure</b>. The three lines after the function call it for 2025, save the picture to a file, and print whether the file exists.</p>
<p>The chart shows Rwanda in amber at <b>92</b> million, then Ghana 88, Nigeria 83, South Africa 77 and Kenya 73. The last line prints <code>True</code>: the picture is saved, ready for an email or a folder. The first chart of a session takes a moment to load.</p>`,
      code: `import pandas as pd
import matplotlib.pyplot as plt
import os

def plot_countries(master, year):
    values = {}
    for country in sorted(master["country"].unique()):
        values[country] = revenue(master, year=year, country=country) / 1000000
    ranked = pd.Series(values).sort_values()
    colours = ["#f5b301" if name == ranked.index[-1] else "#5f7d9c" for name in ranked.index]

    fig, ax = plt.subplots(figsize=(8, 4))
    bars = ax.barh(ranked.index, ranked.values, color=colours)
    ax.bar_label(bars, fmt="%.0f", padding=4)
    ax.set_xlim(0, ranked.max() * 1.15)
    ax.set_title(f"Net revenue by country, {year} (millions)")
    ax.set_xlabel("Net revenue (millions)")
    ax.set_ylabel("Country")
    plt.tight_layout()
    return fig

master = build_master(load_tables())
fig = plot_countries(master, 2025)
fig.savefig("report_2025_chart.png")
print(os.path.exists("report_2025_chart.png"))
`
    },
    {
      id: 'py-8-4-ex5',
      type: 'exercise',
      title: 'Final challenge: the conductor',
      body: `<p>Everything the conductor needs is already loaded: <code>load_tables</code>, <code>build_master</code>, <code>check_year</code>, <code>run_checks</code>, <code>count_blockers</code> and <code>revenue</code>. Write <code>run_report_pipeline(config)</code>. It should:</p>
<ol>
<li>load the tables and build the master table</li>
<li>check that <code>config["year"]</code> is one of the years in the data (<code>sorted(master["order_year"].unique().tolist())</code>)</li>
<li>run the checks, and raise a <code>ValueError</code> with the message <code>N blocker checks failed</code> if any blocker failed</li>
<li>return a dictionary with <code>"status"</code> (<code>"finished"</code>) and <code>"lines"</code>: the three lines <code>Monday report for 2025</code>, <code>Checks: 0 blockers failed, 3 warnings raised</code> and <code>Net revenue in 2025 was 414.01 million.</code></li>
<li>catch a <code>ValueError</code> and return <code>"status": "stopped"</code> with the single line <code>STOPPED: ...</code> and the message</li>
</ol>
<p>The starter runs it for 2025 and for 2030. You should see <code>finished</code> and the three lines, then <code>stopped</code> and <code>STOPPED: year 2030 is not in the data (2023 to 2026)</code>.</p>
<p><b>Think before you type:</b> put the whole body inside <code>try:</code>, return the finished dictionary at the end of the <code>try</code> block, and return the stopped dictionary inside <code>except ValueError as error:</code>. Count the warnings with <code>((report["result"] == "FAIL") &amp; (report["severity"] == "warning")).sum()</code>, wrapped in <code>int(...)</code>.</p>`,
      starter: `import pandas as pd\n\n# Write your function below\n\n\nfor year in [2025, 2030]:\n    result = run_report_pipeline({"year": year})\n    print(result["status"])\n    for line in result["lines"]:\n        print(line)\n`,
      hints: [
        `Inside try: tables = load_tables(), master = build_master(tables), check_year(config["year"], sorted(master["order_year"].unique().tolist())), report = run_checks(tables, master), blockers = count_blockers(report), warnings = int(((report["result"] == "FAIL") & (report["severity"] == "warning")).sum()). Raise ValueError if blockers > 0. Return the finished dictionary. In except ValueError as error: return the stopped dictionary.`,
        `import pandas as pd\n\ndef run_report_pipeline(config):\n    try:\n        tables = load_tables()\n        master = build_master(tables)\n        check_year(config["year"], sorted(master["order_year"].unique().tolist()))\n        report = run_checks(tables, master)\n        blockers = count_blockers(report)\n        warnings = int(((report["result"] == "FAIL") & (report["severity"] == "warning")).sum())\n        if blockers > 0:\n            raise ValueError(f"{blockers} blocker checks failed")\n        lines = [\n            f"Monday report for {config['year']}",\n            f"Checks: {blockers} blockers failed, {warnings} warnings raised",\n            f"Net revenue in {config['year']} was {revenue(master, year=config['year']) / 1000000:.2f} million.",\n        ]\n        return {"status": "finished", "lines": lines}\n    except ValueError as error:\n        return {"status": "stopped", "lines": ["STOPPED: " + str(error)]}\n\nfor year in [2025, 2030]:\n    result = run_report_pipeline({"year": year})\n    print(result["status"])\n    for line in result["lines"]:\n        print(line)\n`
      ],
      solution: `import pandas as pd\n\ndef run_report_pipeline(config):\n    try:\n        tables = load_tables()\n        master = build_master(tables)\n        check_year(config["year"], sorted(master["order_year"].unique().tolist()))\n        report = run_checks(tables, master)\n        blockers = count_blockers(report)\n        warnings = int(((report["result"] == "FAIL") & (report["severity"] == "warning")).sum())\n        if blockers > 0:\n            raise ValueError(f"{blockers} blocker checks failed")\n        lines = [\n            f"Monday report for {config['year']}",\n            f"Checks: {blockers} blockers failed, {warnings} warnings raised",\n            f"Net revenue in {config['year']} was {revenue(master, year=config['year']) / 1000000:.2f} million.",\n        ]\n        return {"status": "finished", "lines": lines}\n    except ValueError as error:\n        return {"status": "stopped", "lines": ["STOPPED: " + str(error)]}\n\nfor year in [2025, 2030]:\n    result = run_report_pipeline({"year": year})\n    print(result["status"])\n    for line in result["lines"]:\n        print(line)\n`,
      ordered: true
    },
    {
      type: 'explain',
      title: 'Running without you: schedules and alerts',
      body: `<p>One thing is left, and it is the whole point of the module: the report must run <b>without you</b>. You cannot do that inside this browser page, which is a classroom. But the script you have just written is the same script that runs on a real machine. What changes is only where it lives and who presses the button.</p>
<p>A scheduled report needs three ingredients:</p>
<table class="mini">
<tr><th>Ingredient</th><th>What it is</th><th>Common choices</th></tr>
<tr><td><b>A machine that is on</b></td><td>Somewhere to run the script at seven on Monday</td><td>A company server, a cloud machine, or a free runner from a service such as GitHub Actions</td></tr>
<tr><td><b>A trigger</b></td><td>The rule that says when to start</td><td><code>cron</code> on Linux and Mac, Task Scheduler on Windows, a workflow schedule on GitHub, Airflow in big teams</td></tr>
<tr><td><b>A delivery</b></td><td>How the result reaches people</td><td>An email with the files attached, a message in a chat channel, a shared folder</td></tr>
</table>
<p>The trigger is usually one short line. The classic format, called a <b>cron expression</b>, has five fields:</p>
<p><code>minute  hour  day-of-month  month  day-of-week</code></p>
<p>So <code>0 7 * * 1</code> reads: minute 0, hour 7, any day of the month, any month, day of the week 1 (Monday). In plain words: <b>at 07:00 every Monday</b>. A star means “every”. A GitHub workflow holds the same expression as <code>cron: "0 7 * * 1"</code> under a <code>schedule</code> setting. One caution: cloud schedulers usually run on UTC time, so convert from the time zone of the person who will read the report.</p>
<p>A schedule without watching is a trap, so two more ingredients are essential:</p>
<ul>
<li><b>Alerts.</b> When the pipeline stops, a person must be told. The <code>STOPPED</code> message in your log is exactly what to send. A pipeline that fails silently is worse than no pipeline, because people assume the missing report means nothing changed.</li>
<li><b>Secrets stay out of the code.</b> A database password or an email key never goes into the script. It lives in the scheduler’s protected settings, and the script reads it from there.</li>
</ul>
<p>And remember the three guards you learned in lesson 8.2. They are what make it safe for the report to run while you sleep: if the data is wrong, the line stops, the alert goes out, and no wrong number reaches the CEO.</p>
<div class="callout work"><b>At work:</b> the usual order of events is to run the script by hand until it is boringly reliable, then schedule it, then watch the first few runs. The log you built is how you watch them.</div>
<div class="callout watch"><b>Test the failure path.</b> Before you trust a schedule, break something on purpose, as you did with the tampered payment in lesson 8.2, and confirm that the alert really arrives. An alert you have never seen fire is an alert you do not know works.</div>`
    },
    {
      id: 'py-8-4-c2',
      type: 'check',
      title: 'Which cron expression runs a script at 07:00 every Monday?',
      body: `<p>The five fields are: minute, hour, day of the month, month, day of the week (Monday is 1).</p>`,
      options: [
        '7 0 * * 1',
        '0 7 * * 1',
        '0 7 1 * *',
        '* 7 * * 1'
      ],
      answer: 1,
      why: [
        'That is minute 7 of hour 0, which is seven minutes past midnight, every Monday.',
        'Right! Minute 0, hour 7, any day of the month, any month, and day of the week 1, which is Monday. Read the five fields from left to right: minute, hour, day of month, month, day of week.',
        'That is 07:00 on the first day of every month, not every Monday.',
        'A star in the minute field means every minute, so this runs 60 times between 07:00 and 07:59 on Mondays.'
      ]
    },
    {
      id: 'py-8-4-c3',
      type: 'check',
      title: 'At 07:01 on Monday the pipeline finds a blocker and stops. What should happen next?',
      body: `<p>Think about who needs to know, and what they should and should not receive.</p>`,
      options: [
        'Nothing: the CEO will notice if the report does not arrive',
        'The pipeline writes STOPPED and the reason to its log and sends an alert to the analyst, and no numbers are released until the cause is fixed',
        'The pipeline sends the partial results to the CEO anyway, marked as a draft',
        'The pipeline deletes the old report so that nobody sees outdated numbers'
      ],
      answer: 1,
      why: [
        'A missing report is easy to misread. People assume “no news means no change”. A silent failure is the most dangerous kind, so somebody must be told.',
        'Right! The log records what happened and why, an alert reaches a person who can act, and the rest of the line waits. No wrong or partial number reaches the CEO, which is the whole reason for the inspectors.',
        'Partial results from a run that failed its own checks cannot be trusted, even with a label. Draft numbers have a way of ending up on slides.',
        'Deleting evidence is never the answer. Keep the last good report, clearly dated, and fix the cause.'
      ]
    },
    {
      type: 'explain',
      title: 'Module 8 and the Python track: complete',
      body: `<p>You have finished the last lesson of the last module of the Python track. Look at what you can do now, because it is a great deal.</p>
<p><b>This lesson.</b> You can:</p>
<ul>
<li>Structure a <b>script</b> in five parts: imports, settings, functions, <code>main()</code> and the <code>__name__</code> guard</li>
<li>Explain what <code>if __name__ == "__main__":</code> does, and why a thin <code>main()</code> is good design</li>
<li><b>Save</b> tables and text with <code>to_csv</code> and <code>with open(...)</code>, name files by their settings, and <b>read them back</b> to prove the save worked</li>
<li>Make a report <b>reproducible</b>: settings in the config, no hidden inputs, a header and a log that act as a receipt</li>
<li>Build a pipeline of layers with <b>one conductor</b> that stops cleanly on any inspector’s complaint</li>
<li>Write a chart as a <b>function that returns a figure</b> and saves it</li>
<li>Explain how a script is <b>scheduled</b> with a cron expression, delivered, monitored and alerted</li>
</ul>
<p><b>The whole track.</b> Eight modules, 39 lessons, and one thread through all of them:</p>
<table class="mini">
<tr><th>Module</th><th>What you gained</th></tr>
<tr><td><b>1. Python basics</b></td><td>Variables, lists, dictionaries, conditions, loops, functions</td></tr>
<tr><td><b>2. Pandas</b></td><td>Loading, inspecting and selecting data</td></tr>
<tr><td><b>3. Cleaning</b></td><td>Missing values, types, duplicates, text, validation</td></tr>
<tr><td><b>4. Transformation</b></td><td>Calculated columns, filters, sorting, grouping, joins, the master table</td></tr>
<tr><td><b>5. NumPy</b></td><td>Arrays, masks, percentiles, z-scores, outlier detection</td></tr>
<tr><td><b>6. EDA</b></td><td>Distributions, segments, time, correlation, a full report</td></tr>
<tr><td><b>7. Visualisation</b></td><td>Lines, bars, histograms, scatter plots, design, the board pack</td></tr>
<tr><td><b>8. Automation</b></td><td>Tools, pipelines, guards, config, scripts and schedules</td></tr>
</table>
<p>You started by printing a sentence. You finish by building a system that checks its own data, explains itself, and delivers a report to a CEO while you sleep. That is the difference between someone who knows Python and someone who works as an analyst.</p>
<p><b>Interview-style questions to practise saying out loud:</b></p>
<ol>
<li>When would you use a notebook, and when a script?</li>
<li>What does <code>if __name__ == "__main__":</code> do, and why do professionals use it?</li>
<li>Walk me through how you would automate a weekly report, from the data to the inbox.</li>
</ol>
<details><summary>Show model answers</summary>
<p><b>1.</b> I use a notebook to explore: trying ideas quickly, looking at data, drawing draft charts. I use a script for anything that must run repeatedly or without me, because a script runs from top to bottom in a fixed order, has no hidden state, can be scheduled, and is easy to review and test. Usually I explore in a notebook and then move the finished logic into functions in a script.</p>
<p><b>2.</b> It runs the code beneath it only when the file is run directly, not when another file imports it. Python sets <code>__name__</code> to <code>"__main__"</code> in the first case. Professionals use it so that functions in the file can be imported into tests or other scripts without starting the whole job as a side effect.</p>
<p><b>3.</b> I would turn the manual steps into small functions with one job each, loaded in a toolkit: load, clean, build, check, compute, format, save. I would put every changeable setting in a config. I would add guards, with a row count, ranges and a tie-out, and stop the line on blockers while listing known warnings. A thin <code>main()</code> would run the layers in order and write a log. Then I would run it by hand until it is reliable, schedule it with cron or a workflow, deliver the files by email or to a shared folder, and set up an alert so that a failure reaches a person. Finally I would test the failure path with deliberately broken data.</p>
</details>
<p><b>Coming next:</b> the Python track is finished, which is the whole of Part 4 of your learning path. You can already compute means, medians, correlations and outliers in code. The next track on the learning path, Statistics and Probability, tells you what those numbers mean, when they can be trusted, and when they are fooling you. Everything you have built here is the toolbox it will use.</p>`
    }
  ]
}
);
