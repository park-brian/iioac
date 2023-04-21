import { html, render, useState, useEffect } from "https://cdn.jsdelivr.net/npm/htm@3.1.1/preact/standalone.mjs";
import InputForm from "./input-form.js";
import ResultsTable from "./results-table.js";
import {asNumericValues, query} from "./utils.js";

const baseUrl = window.location.hostname === "localhost" ? "http://localhost:7001/iioac" : ".";

render(html`<${App} />`, window.app);

function App() {
  const [options, setOptions] = useState({});
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({});

  useEffect(async () => {
    setOptions(await query(`${baseUrl}/api/options`));
  }, []);

  useEffect(async () => {
    setResults(asNumericValues(await query(`${baseUrl}/api/query`, form)));
  }, [form]);

  function handleSubmit(form) {
    setForm(form);
  }

  function handleReset() {
    setForm({});
  }

  return html`
    <div class="row">
      <div class="col-lg-3">
        <div class="card shadow mb-4">
          <div class="card-header bg-primary text-light">
            <h2 class="h5 mb-0">Assessment Options</h2>
          </div>
          <div class="card-body">
            <${InputForm} options=${options} onSubmit=${handleSubmit} onReset=${handleReset} />
          </div>
        </div>
      </div>
      <div class="col-lg-9">
        <div class="card shadow mb-4">
          <div class="card-header bg-primary text-light">
            <h2 class="h5 mb-0">Model Parameters</h2>
          </div>
          <div class="card-body">
            <${ResultsTable} results=${results} />
          </div>
        </div>
      </div>
    </div>
  `;
}
