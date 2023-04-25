import { html, useState } from "https://cdn.jsdelivr.net/npm/htm@3.1.1/preact/standalone.mjs";

export const defaultForm = {
  AssessID: "",
  AssOpID: "",
  ActSort: "",
  DualID: "",
}

export default function InputForm({options, loading, onSubmit, onReset }) {
  const [form, setForm] = useState(defaultForm);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (onSubmit)
      onSubmit(form);
  }

  function handleReset(event) {
    event.preventDefault();
    setForm(defaultForm);
    if (onReset)
      onReset();
  }

  return html`
    <form onSubmit=${handleSubmit} onReset=${handleReset}>
      <fieldset disabled=${loading}>
  
        <div class="mb-4">
          <label class="form-label fw-semibold" for="AssessID">AssessID</label>
          <select class="form-select" id="AssessID" name="AssessID" value=${form.AssessID} onChange=${handleChange}>
            <option selected>All Assessment IDs</option>
            ${options?.AssessID?.map(id => html`<option value="${id}">${id}</option>`)}
          </select>
        </div>
  
        <div class="mb-4">
          <label class="form-label fw-semibold" for="AssOpID">AssOpID</label>
          <select class="form-select" id="AssOpID" name="AssOpID" value=${form.AssOpID} onChange=${handleChange}>
            <option selected>All Assessment Operation IDs</option>
            ${options?.AssOpID?.map(id => html`<option value="${id}">${id}</option>`)}
          </select>
        </div>
  
        <div class="mb-4">
          <label class="form-label fw-semibold" for="ActSort">ActSort</label>
          <select class="form-select" id="ActSort" name="ActSort" value=${form.ActSort} onChange=${handleChange}>
            <option selected>All Activity Sort Levels</option>
            ${options?.ActSort?.map(id => html`<option value="${id}">${id}</option>`)}
          </select>
        </div>
  
        <div class="mb-4">
          <label class="form-label fw-semibold" for="DualID">DualID</label>
          <select class="form-select" id="DualID" name="DualID" value=${form.DualID} onChange=${handleChange}>
            <option selected>All Dual IDs</option>
            ${options?.DualID?.map(id => html`<option value="${id}">${id}</option>`)}
          </select>
        </div>
      </fieldset>
      
      <div class="mb-4 text-end">
        <button class="btn btn-outline-danger me-1" type="reset" disabled=${loading}>Reset</button>
        <button class="btn btn-primary" type="submit" disabled=${loading}>Submit</button>
      </div>
    </form>
  `
}
