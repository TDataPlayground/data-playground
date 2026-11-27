# Data Playground

**Learn data analysis by doing it.** Real lessons, real data, everything running in your browser. Nothing to install.

> **Live site:** https://tdataplayground.github.io/data-playground/

## What you can do here

- **Learn** with hands-on lessons. Each lesson tells a story, explains the idea in plain language, lets you run real code and checks your answers automatically.
- **Analyse** your own CSV files with the SQL Workbench and the Python Workbench, and chart the results.
- **Join the community** of learners and analysts on Telegram: https://t.me/+Qukyau3o5CliZGY8

## The learning path

Eight tracks that follow the book *The Complete Data Analyst*, from your first question to presenting to executives. Two are complete and a third is in progress, with **93 lessons, 455 exercises and 218 knowledge checks** so far.

| # | Track | Status |
|---|-------|--------|
| 1 | Analyst Foundations | Coming soon |
| 2 | Spreadsheets | Coming soon |
| 3 | SQL for Data Analysis | **Live: 38 lessons, 180 exercises** |
| 4 | Python for Data Analysis | **Live: 39 lessons, 195 exercises** |
| 5 | Statistics and Probability | **In progress: 16 lessons, 80 exercises (Modules 1 to 4 of 8)** |
| 6 | Visualisation and Storytelling | Coming soon |
| 7 | Advanced Analytics | Coming soon |
| 8 | The Professional Analyst | Coming soon |

### SQL for Data Analysis

The SQL track runs from relational databases and SELECT, through joins, subqueries, CTEs, window functions and query optimisation, to real business work: revenue metrics, cohorts, funnels, customer segmentation, data-quality audits and interview problems.

### Python for Data Analysis

The Python track takes you from your first line of code to an automated reporting pipeline.

| Module | Topic | Lessons |
|--------|-------|--------:|
| 1 | Python basics for analysts | 9 |
| 2 | Pandas: loading and understanding your data | 3 |
| 3 | Data cleaning: missing values, types, duplicates, text and validation | 5 |
| 4 | Data transformation: filters, grouping, joins and the master table | 6 |
| 5 | NumPy: arrays, percentiles, z-scores and outlier detection | 4 |
| 6 | Exploratory data analysis | 4 |
| 7 | Visualisation: lines, bars, histograms, scatter plots and a board pack | 4 |
| 8 | Automating analyst workflows: functions, pipelines, configuration and scheduled reports | 4 |

### Statistics and Probability

The Statistics track teaches you to separate signal from noise, using real TradeFlow questions such as "is that drop in revenue real?" and "how long do deliveries really take?". Modules 1 to 4 are live. Hypothesis testing, correlation and regression, A/B testing and statistics in practice are coming next.

| Module | Topic | Lessons |
|--------|-------|--------:|
| 1 | Thinking statistically: signal and noise, centre and spread, shape and outliers, samples and bias | 4 |
| 2 | Probability: events, conditional probability, Bayes and expected value | 4 |
| 3 | Distributions: Binomial, Poisson, the normal curve and skewed data | 4 |
| 4 | Estimation: sampling, the Central Limit Theorem, confidence intervals and the bootstrap | 4 |
| 5 to 8 | Hypothesis testing, correlation and regression, A/B testing, statistics in practice | Coming soon |

### How a lesson works

- A short story from TradeFlow sets the question, and you play the analyst.
- Every idea is explained from scratch, then you run it on real data.
- Exercises give you a goal and a "think before you type" prompt, with two hints, and your answer is checked automatically.
- Knowledge checks explain why each wrong answer is wrong.
- Lessons end with a recap of what you can now do and interview-style questions with model answers.

## The dataset: TradeFlow

Every lesson uses **TradeFlow**, a fictional e-commerce business trading across Nigeria, Ghana, Kenya, South Africa and Rwanda. You play its analyst. The data is deliberately a little messy, like real data. See [`data/README.md`](data/README.md) for the full data dictionary.

## How it works

Data Playground is a static website with no server and no sign-up.

- **SQL** runs in your browser with [sql.js](https://github.com/sql-js/sql.js) (SQLite compiled to WebAssembly)
- **Python** runs in your browser with [Pyodide](https://pyodide.org) (Pandas, NumPy, Matplotlib)
- **Charts** are drawn with [Chart.js](https://www.chartjs.org)
- **Progress** is saved in your own browser, so it does not follow you between devices, and clearing the site's data resets it

These libraries load from public content delivery networks, so you need an internet connection. The first Python run takes a few seconds while Pandas loads.

## What is in this repository

| Path | What it is |
|------|------------|
| `index.html` | Home page |
| `learn.html` | The learning path, with progress |
| `lessons.html` | The lesson engine |
| `lessons-data.js` | The track list, the lesson catalogue and the SQL Module 1 lessons |
| `lessons/` | One file per batch of lessons, loaded on demand |
| `dp-python.js` | The Python engine: runs your code, captures charts and checks answers |
| `workbench.html` | SQL Workbench |
| `python.html` | Python Workbench |
| `data/` | The eight TradeFlow CSV files and their data dictionary |
| `og-image.png` | The preview image used when the site is shared |

## Run it on your own computer

Browsers block some features on files opened directly, so serve the folder with a tiny local server:

```
python -m http.server 8000
```

(On some systems the command is `python3`.) Then open http://localhost:8000

## Roadmap

- [x] SQL track
- [x] Python track
- [ ] Accounts, points and a leaderboard
- [ ] A full testing pass over every lesson, and a teaching-depth pass on the SQL track
- [ ] Statistics and Probability: Modules 5 to 8 (Modules 1 to 4 are live)
- [ ] The remaining tracks: Analyst Foundations, Spreadsheets, Visualisation and Storytelling, Advanced Analytics and The Professional Analyst
