import { html, render, useState, useEffect } from "./lib/preact.js";
import InputForm from "./input-form.js";
import ResultsTable from "./results-table.js";
import {asNumericValues, query} from "./utils.js";

const baseUrl = window.location.hostname === "localhost" ? "http://localhost:7001/iioac" : ".";

render(html`<${App} />`, window.app);

function App() {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({});
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({});

  useEffect(async () => {
    setOptions(await query(`${baseUrl}/api/options`));
  }, []);

  useEffect(async () => {
    try {
      setLoading(true);
      setResults([]);
      const results = await query(`${baseUrl}/api/query`, form);
      setResults(asNumericValues(results));
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [form]);

  function handleSubmit(form) {
    setForm(form);
  }

  function handleReset() {
    setForm({});
  }

  return html`
    <div class="row">
      <div class="col-lg-2 col-md-3">
          <h2 class="h5 mb-4">Assessment Options</h2>
          <${InputForm} options=${options} loading=${loading} onSubmit=${handleSubmit} onReset=${handleReset} />

      </div>
      <div class="col-lg-10 col-md-9">
          <h2 class="h5 mb-4">Model Parameters</h2>
          <${ResultsTable} results=${results} loading=${loading} />
      </div>
    </div>
  `;
}
