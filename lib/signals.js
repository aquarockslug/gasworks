const signal = (_) => ({ value: _ });
const computed = (fn) => ({ value: fn() });

export { signal, computed };
