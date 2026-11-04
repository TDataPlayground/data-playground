# Data Playground

**Learn data analysis by doing it.** Real lessons, real data, everything running in your browser. Nothing to install.

**Live site:** https://tdataplayground.github.io/data-playground/

## What you can do here

- **Learn** with hands-on lessons. Each lesson tells a story, explains the idea in plain language, lets you run real code and checks your answers automatically.
- **Analyse** your own CSV files with the SQL Workbench and the Python Workbench, and chart the results.
- **Join the community** of learners and analysts on Telegram: https://t.me/+Qukyau3o5CliZGY8

## The learning path

Eight tracks that follow the book *The Complete Data Analyst*, from your first question to presenting to executives.

| # | Track | Status |
|---|-------|--------|
| 1 | Analyst Foundations | Coming soon |
| 2 | Spreadsheets | Coming soon |
| 3 | SQL for Data Analysis | **Live: 38 lessons, 180 exercises** |
| 4 | Python for Data Analysis | Next |
| 5 | Statistics and Probability | Coming soon |
| 6 | Visualisation and Storytelling | Coming soon |
| 7 | Advanced Analytics | Coming soon |
| 8 | The Professional Analyst | Coming soon |

The SQL track runs from relational databases and SELECT, through joins, subqueries, CTEs, window functions and query optimisation, to real business work: revenue metrics, cohorts, funnels, customer segmentation, data-quality audits and interview problems.

## The dataset: TradeFlow

Every lesson uses **TradeFlow**, a fictional e-commerce business trading across Nigeria, Ghana, Kenya, South Africa and Rwanda. You play its analyst. The data is deliberately a little messy, like real data. See [`data/README.md`](data/README.md) for the full data dictionary.

## How it works

Data Playground is a static website with no server and no sign-up.

- **SQL** runs in your browser with [sql.js](https://github.com/sql-js/sql.js) (SQLite compiled to WebAssembly)
- **Python** runs in your browser with [Pyodide](https://pyodide.org) (Pandas, NumPy, Matplotlib)
- **Charts** are drawn with [Chart.js](https://www.chartjs.org)
- **Progress** is saved in your own browser

## What is in this repository

| Path | What it is |
|------|------------|
| `index.html` | Home page |
| `learn.html` | The learning path, with progress |
| `lessons.html` | The lesson engine |
| `lessons-data.js` | The track list, the lesson catalogue and Module 1 |
| `lessons/` | One file per batch of lessons, loaded on demand |
| `workbench.html` | SQL Workbench |
| `python.html` | Python Workbench |
| `data/` | The eight TradeFlow CSV files |

## Run it on your own computer

Browsers block some features on files opened directly, so serve the folder with a tiny local server:

```
python -m http.server 8000
```

Then open http://localhost:8000

## Roadmap

1. Python track, mirroring the book and the video series
2. Accounts, points and a leaderboard
3. The remaining tracks, then a full review pass over every lesson
