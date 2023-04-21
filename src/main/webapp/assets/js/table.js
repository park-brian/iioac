import { html, useState, useEffect, useRef } from "https://cdn.jsdelivr.net/npm/htm@3.1.1/preact/standalone.mjs";
import { createTable } from "https://cdn.jsdelivr.net/npm/@tanstack/table-core@8.8.4/+esm";

export function flexRender(Comp, props) {
  return !Comp ? null : html`<${Comp} ...${props} />`;
}

export function useTable(options) {
  // Compose in the generic options to the user options
  const resolvedOptions = {
    state: {}, // Dummy state
    onStateChange: () => {}, // noop
    renderFallbackValue: null,
    ...options,
  };

  // Create a new table and store it in state
  const [tableRef] = useState(() => ({
    current: createTable(resolvedOptions),
  }));

  // By default, manage table state here using the table's initial state
  const [state, setState] = useState(() => tableRef.current.initialState);

  // Compose the default state above with any user state. This will allow the user
  // to only control a subset of the state if desired.
  tableRef.current.setOptions((prev) => ({
    ...prev,
    ...options,
    state: {
      ...state,
      ...options.state,
    },
    // Similarly, we'll maintain both our internal state and any user-provided
    // state.
    onStateChange: (updater) => {
      setState(updater);
      options.onStateChange?.(updater);
    },
  }));

  return tableRef.current;
}

export function IndeterminateCheckbox({
  indeterminate,
  ...rest
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return (
    html`<input
      type="checkbox"
      role="button"
      ref=${ref}
      ...${rest}
    />`
  )
}