// Data Playground Python lesson engine (used by lessons.html v6).
// Runs Python in the browser with Pyodide. Safe to update without touching lessons.html.

    const PY_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
    const PY_HELPER = String.raw`import sys, io, json, ast, time, base64, traceback, contextlib, types, copy

_DP = {'snap': None}


def dp_style():
    import matplotlib
    matplotlib.use('AGG')
    import matplotlib.pyplot as plt
    from cycler import cycler
    plt.rcParams.update({
        'figure.facecolor': '#112b52', 'axes.facecolor': '#112b52', 'savefig.facecolor': '#112b52',
        'text.color': '#e6f1ff', 'axes.labelcolor': '#e6f1ff', 'xtick.color': '#cfd8e3',
        'ytick.color': '#cfd8e3', 'axes.edgecolor': '#2a4c80', 'grid.color': '#1f3a66',
        'axes.prop_cycle': cycler(color=['#4fc3f7', '#f5b301', '#81d4fa', '#ffd54f'])
    })
    return 'ok'


def dp_prepare(setup_code):
    ns = {'__name__': '__main__'}
    if setup_code and setup_code.strip():
        exec(compile(setup_code, '<setup>', 'exec'), ns)
    _DP['snap'] = ns
    return 'ok'


def _fresh():
    ns = {}
    for k, v in _DP['snap'].items():
        if k == '__builtins__':
            continue
        if isinstance(v, (types.ModuleType, types.FunctionType, type)):
            ns[k] = v
            continue
        try:
            if isinstance(v, (dict, list, set)):
                ns[k] = copy.deepcopy(v)
            elif hasattr(v, 'copy'):
                ns[k] = v.copy()
            else:
                ns[k] = copy.deepcopy(v)
        except Exception:
            ns[k] = v
    ns['__name__'] = '__main__'
    return ns


def _to_py(v):
    if v is None or isinstance(v, bool) or isinstance(v, int):
        return v
    if isinstance(v, float):
        return None if v != v else round(v, 4)
    if isinstance(v, str):
        return v
    np = sys.modules.get('numpy')
    pd = sys.modules.get('pandas')
    if np is not None:
        if isinstance(v, np.generic):
            return _to_py(v.item())
        if isinstance(v, np.ndarray):
            return _to_py(v.tolist())
    if pd is not None:
        if v is pd.NaT:
            return None
        if isinstance(v, pd.Timestamp):
            return str(v)
    if isinstance(v, (list, tuple)):
        return [_to_py(x) for x in v]
    if isinstance(v, (set, frozenset)):
        return sorted([_to_py(x) for x in v], key=lambda z: json.dumps(z, default=str))
    if isinstance(v, dict):
        return {str(k): _to_py(x) for k, x in v.items()}
    return str(v)


def _clean_text(s):
    return '\n'.join(line.rstrip() for line in s.strip().splitlines())


def _norm(value, stdout, figsig):
    pd = sys.modules.get('pandas')
    if value is not None:
        if pd is not None and isinstance(value, pd.Series):
            value = value.to_frame() if isinstance(value.index, pd.RangeIndex) else value.reset_index()
        if pd is not None and isinstance(value, pd.DataFrame):
            df = value
            if not isinstance(df.index, pd.RangeIndex):
                df = df.reset_index()
            return {'kind': 'table', 'ncols': int(df.shape[1]), 'rows': _to_py(df.values.tolist())}
        return {'kind': 'value', 'value': _to_py(value)}
    if stdout.strip():
        return {'kind': 'text', 'text': _clean_text(stdout)}
    if figsig:
        return {'kind': 'figure', 'sig': figsig}
    return {'kind': 'none'}


def _render(value):
    pd = sys.modules.get('pandas')
    if value is None:
        return None, None
    if pd is not None and isinstance(value, pd.Series):
        total = len(value)
        html = value.head(50).to_frame().to_html(border=0, na_rep='NaN')
        note = '%d value%s' % (total, '' if total == 1 else 's') + (' (showing the first 50)' if total > 50 else '')
        return html + '<div class="note">' + note + '</div>', None
    if pd is not None and isinstance(value, pd.DataFrame):
        r, c = value.shape
        html = value.head(50).to_html(border=0, max_cols=40, na_rep='NaN')
        note = '%d row%s x %d column%s' % (r, '' if r == 1 else 's', c, '' if c == 1 else 's') + (' (showing the first 50 rows)' if r > 50 else '')
        return html + '<div class="note">' + note + '</div>', None
    text = repr(value)
    if len(text) > 5000:
        text = text[:5000] + ' ...'
    return None, text


def _fmt_error(e, code):
    lines = code.splitlines()
    if isinstance(e, SyntaxError):
        ln = e.lineno
        s = 'SyntaxError on line %s: %s' % (ln, e.msg)
        if ln and 1 <= ln <= len(lines):
            s += '\n    ' + lines[ln - 1].strip()
        return s
    ln = None
    for fr in traceback.extract_tb(e.__traceback__):
        if fr.filename == '<your code>':
            ln = fr.lineno
    name = type(e).__name__
    if ln:
        s = '%s on line %d: %s' % (name, ln, e)
        if 1 <= ln <= len(lines):
            s += '\n    ' + lines[ln - 1].strip()
        return s
    return '%s: %s' % (name, e)


def _collect_figs():
    figs, sigs = [], []
    plt = sys.modules.get('matplotlib.pyplot')
    if plt is None:
        return figs, sigs
    for n in plt.get_fignums():
        fig = plt.figure(n)
        axes = fig.axes
        sig = {'axes': len(axes), 'title': '', 'xlabel': '', 'ylabel': '', 'lines': 0, 'bars': 0}
        if axes:
            ax = axes[0]
            sig['title'] = ax.get_title()
            sig['xlabel'] = ax.get_xlabel()
            sig['ylabel'] = ax.get_ylabel()
            sig['lines'] = len(ax.lines)
            sig['bars'] = len(ax.patches)
        sigs.append(sig)
        b = io.BytesIO()
        fig.savefig(b, format='png', dpi=110, bbox_inches='tight')
        figs.append(base64.b64encode(b.getvalue()).decode())
    plt.close('all')
    return figs, sigs


def dp_run(code, guard=True, limit=8.0):
    out, err = io.StringIO(), io.StringIO()
    res = {'stdout': '', 'error': None, 'result_html': None, 'result_text': None,
           'norm': {'kind': 'none'}, 'figs': []}
    ns = _fresh()
    value = None
    state = {'n': 0, 't0': time.time()}

    def tracer(frame, event, arg):
        state['n'] += 1
        if state['n'] % 400 == 0 and time.time() - state['t0'] > limit:
            raise TimeoutError('Your code ran for more than %d seconds and was stopped. A loop that never ends is the usual cause: check that something inside the loop changes, so the loop can finish.' % int(limit))
        return tracer

    try:
        tree = ast.parse(code, '<your code>', 'exec')
        last = None
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            last = ast.Expression(tree.body.pop().value)
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            if guard:
                sys.settrace(tracer)
            try:
                exec(compile(tree, '<your code>', 'exec'), ns)
                if last is not None:
                    value = eval(compile(last, '<your code>', 'eval'), ns)
            finally:
                sys.settrace(None)
    except BaseException as e:
        if isinstance(e, (KeyboardInterrupt, SystemExit)):
            res['error'] = type(e).__name__
        else:
            res['error'] = _fmt_error(e, code)
    res['stdout'] = out.getvalue() + err.getvalue()
    try:
        figs, sigs = _collect_figs()
        res['figs'] = figs
        if figs and value is not None and type(value).__module__.startswith('matplotlib'):
            value = None
        if res['error'] is None:
            res['result_html'], res['result_text'] = _render(value)
            res['norm'] = _norm(value, out.getvalue(), sigs)
    except Exception as e:
        res['error'] = 'Could not display the result: %s: %s' % (type(e).__name__, e)
    return json.dumps(res)
`;

let pyodide = null;
let pyHelperReady = false;

    async function ensurePython(lesson) {
      if (!pyodide) {
        setStatus('Starting Python. The first visit can take a minute or two, later visits are much quicker...');
        if (typeof loadPyodide === 'undefined') await loadScript(PY_URL);
        pyodide = await loadPyodide();
      }
      const pk = lesson.packages || [];
      if (pk.length) {
        setStatus('Loading ' + pk.join(', ') + '. This only takes long the first time...');
        await pyodide.loadPackage(pk);
      }
      if (!pyHelperReady) {
        await pyodide.runPythonAsync(PY_HELPER);
        pyHelperReady = true;
      }
      if (pk.indexOf('matplotlib') >= 0) await pyodide.runPythonAsync('dp_style()');
      await pyodide.runPythonAsync("import os\nos.chdir('/home/pyodide')");
      lesson._fileInfo = [];
      for (const name of (lesson.files || [])) {
        setStatus('Loading data file ' + name + '.csv...');
        const res = await fetch('data/' + name + '.csv');
        if (!res.ok) throw new Error('Could not load data/' + name + '.csv (status ' + res.status + ')');
        const text = (await res.text()).replace(/^\uFEFF/, '');
        pyodide.FS.writeFile('/home/pyodide/' + name + '.csv', text);
        const lines = text.split(/\r?\n/).filter(l => l.length);
        lesson._fileInfo.push({ name: name, cols: lines[0].split(','), rows: lines.length - 1 });
      }
      pyodide.globals.set('_dp_setup', lesson.setup || '');
      await pyodide.runPythonAsync('dp_prepare(_dp_setup)');
    }

    function pyGuardOn() {
      if (currentLesson && currentLesson.loopGuard !== undefined) return !!currentLesson.loopGuard;
      return !(currentLesson && (currentLesson.packages || []).indexOf('pandas') >= 0);
    }
    async function runPy(code) {
      pyodide.globals.set('_dp_code', code);
      const raw = await pyodide.runPythonAsync('dp_run(_dp_code, ' + (pyGuardOn() ? 'True' : 'False') + ')');
      return JSON.parse(raw);
    }
    function showPy(out, r) {
      let h = '';
      if (r.stdout) h += '<pre class="pyout">' + escHtml(r.stdout) + '</pre>';
      if (r.error) h += '<pre class="pyout pyerr">' + escHtml(r.error) + '</pre>';
      else if (r.result_html) h += '<div class="scroll">' + r.result_html + '</div>';
      else if (r.result_text !== null && r.result_text !== undefined) h += '<pre class="pyout">' + escHtml(r.result_text) + '</pre>';
      if (r.figs && r.figs.length) h += '<div class="pyfig">' + r.figs.map(b => '<img alt="Chart" src="data:image/png;base64,' + b + '">').join('') + '</div>';
      if (!h) h = '<div class="note">Your code ran, but it did not print or return anything. Use print(...) or put a value on the last line to see it.</div>';
      out.innerHTML = h;
    }

    async function runStepPy(el, s) {
      const code = el.querySelector('textarea').value;
      const out = el.querySelector('.out');
      const fb = el.querySelector('.feedback');
      const btn = el.querySelector('.run');
      fb.textContent = ''; fb.className = 'feedback';
      if (code.trim() === '') { fb.textContent = 'Write some code first, then run it.'; fb.className = 'feedback err'; return; }
      btn.disabled = true; btn.textContent = 'Running...';
      try {
        const r = await runPy(code);
        showPy(out, r);
        if (r.error) {
          fb.textContent = 'That is a Python error message. It is not scary: it tells you the line and what went wrong.';
          fb.className = 'feedback err';
        }
      } catch (e) {
        fb.textContent = 'Something went wrong while running your code: ' + (e.message || e);
        fb.className = 'feedback err';
      } finally {
        btn.disabled = false; btn.textContent = 'Run (Ctrl+Enter)';
      }
    }

    function plainText(n) {
      if (n.kind === 'text') return n.text;
      if (n.kind === 'value') {
        const v = n.value;
        if (v === null) return 'None';
        if (typeof v === 'boolean') return v ? 'True' : 'False';
        if (typeof v === 'number' || typeof v === 'string') return String(v);
      }
      return null;
    }
    function approxEq(a, b) {
      if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-4 + 1e-9 * Math.abs(b);
      return a === b;
    }
    function deepEq(a, b, unordered) {
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        let x = a, y = b;
        if (unordered) { x = a.slice().sort((p, q) => JSON.stringify(p) < JSON.stringify(q) ? -1 : 1); y = b.slice().sort((p, q) => JSON.stringify(p) < JSON.stringify(q) ? -1 : 1); }
        for (let i = 0; i < x.length; i++) if (!deepEq(x[i], y[i], unordered)) return false;
        return true;
      }
      if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
        const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
        if (ka.length !== kb.length) return false;
        for (let i = 0; i < ka.length; i++) { if (ka[i] !== kb[i]) return false; if (!deepEq(a[ka[i]], b[kb[i]], unordered)) return false; }
        return true;
      }
      return approxEq(a, b);
    }
    function compareAnswers(got, exp, s) {
      const unordered = s.ordered === false;
      if (got.kind === 'none') {
        return { ok: false, msg: exp.kind === 'text'
          ? 'Your code did not print anything. This task expects printed output, so use print(...).'
          : 'Your code produced nothing to check. Put your answer on the last line of the code box (or print it).' };
      }
      if (got.kind !== exp.kind) {
        const g = plainText(got), e = plainText(exp);
        if (g !== null && e !== null && (g === e || (!isNaN(parseFloat(g)) && !isNaN(parseFloat(e)) && approxEq(parseFloat(g), parseFloat(e))))) return { ok: true };
        if (exp.kind === 'table') return { ok: false, msg: 'The task expects a table (a DataFrame or Series) as the result. Put it on the last line of your code.' };
        if (exp.kind === 'text') return { ok: false, msg: 'The task expects printed output. Use print(...) to show your answer.' };
        if (exp.kind === 'figure') return { ok: false, msg: 'The task expects a chart. Check that your code draws one.' };
        return { ok: false, msg: 'Your code gave a ' + got.kind + ' but the task expects a different kind of result. Re-read what the task asks you to show.' };
      }
      if (got.kind === 'table') {
        if (got.ncols !== exp.ncols) return { ok: false, msg: 'Your table has ' + got.ncols + ' column(s) but the task needs ' + exp.ncols + '. Re-read which columns are asked for, in order.' };
        if (got.rows.length !== exp.rows.length) return { ok: false, msg: 'Your table has ' + got.rows.length + ' rows but the expected answer has ' + exp.rows.length + '. Check your filters.' };
        if (deepEq(got.rows, exp.rows, unordered)) return { ok: true };
        return { ok: false, msg: unordered ? 'Right shape, but some values differ. Check your columns and conditions.' : 'Right shape, but the values or their order differ. Check your sorting and conditions.' };
      }
      if (got.kind === 'value') {
        if (deepEq(got.value, exp.value, unordered)) return { ok: true };
        return { ok: false, msg: 'That is not the value the task expects. Re-read the task and check your steps.' };
      }
      if (got.kind === 'text') {
        if (got.text === exp.text) return { ok: true };
        return { ok: false, msg: 'Your printed output does not match exactly. Compare it with the task, character by character: spaces, capital letters and punctuation all matter.' };
      }
      if (got.kind === 'figure') {
        const a = got.sig[0] || {}, b = exp.sig[0] || {};
        if (got.sig.length !== exp.sig.length) return { ok: false, msg: 'The task expects ' + exp.sig.length + ' chart(s), but your code drew ' + got.sig.length + '.' };
        if (a.lines !== b.lines || a.bars !== b.bars) return { ok: false, msg: 'Your chart has a different number of bars or lines than the task expects. Check the kind of chart and the data you plot.' };
        const same = (x, y) => !y || String(x || '').trim().toLowerCase() === String(y).trim().toLowerCase();
        if (!same(a.title, b.title)) return { ok: false, msg: 'Check the chart title: the task asks for a specific one.' };
        if (!same(a.xlabel, b.xlabel) || !same(a.ylabel, b.ylabel)) return { ok: false, msg: 'Check the axis labels: the task asks for specific ones.' };
        return { ok: true };
      }
      return { ok: false, msg: 'Could not compare your answer.' };
    }

    async function checkStepPy(el, s) {
      const code = el.querySelector('textarea').value;
      const out = el.querySelector('.out');
      const fb = el.querySelector('.feedback');
      const btn = el.querySelector('.check');
      fb.className = 'feedback err';
      if (code.trim() === '') { fb.textContent = 'Write some code first, then check it.'; return; }
      btn.disabled = true;
      try {
        const got = await runPy(code);
        showPy(out, got);
        if (got.error) { fb.textContent = 'Python found an error in your code. Read the message above: it names the line and the problem.'; return; }
        const exp = await runPy(s.solution);
        if (exp.error) { fb.textContent = 'This exercise has a problem on our side (' + exp.error + '). Please tell the author.'; return; }
        const verdict = compareAnswers(got.norm, exp.norm, s);
        if (!verdict.ok) { fb.textContent = verdict.msg; return; }
        fb.className = 'feedback ok';
        fb.textContent = 'Correct! Nicely done.';
        markSolved(el, s);
      } catch (e) {
        fb.textContent = 'Something went wrong while checking: ' + (e.message || e);
      } finally {
        btn.disabled = false;
      }
    }

    function renderSchemaPy(lesson) {
      const panel = document.getElementById('schemaPanel');
      const body = document.getElementById('schemaBody');
      panel.querySelector('summary').textContent = 'Data files in this lesson (tap to open)';
      let html = '';
      if (lesson.preloaded && lesson.preloaded.length) {
        html += '<div class="tbl">Already loaded for you as variables: <b>' + lesson.preloaded.map(escHtml).join(', ') + '</b>. Every code box starts fresh with them.</div>';
      }
      (lesson._fileInfo || []).forEach(f => {
        html += '<div class="tbl"><b>' + escHtml(f.name) + '.csv</b> (' + f.rows.toLocaleString() + ' rows)<br>' + f.cols.map(escHtml).join(', ') + '</div>';
      });
      body.innerHTML = html;
      panel.style.display = html ? 'block' : 'none';
    }
