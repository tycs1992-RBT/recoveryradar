@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #f8fafc;
  color: #0f172a;
}

::selection {
  background: #dbeafe;
}

.input {
  @apply w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100;
}

.label {
  @apply text-sm font-medium text-slate-700;
}

.card {
  @apply rounded-3xl border border-slate-200 bg-white p-6 shadow-soft;
}

.badge {
  @apply inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700;
}
