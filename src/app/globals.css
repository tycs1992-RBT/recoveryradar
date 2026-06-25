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

/* Workspace shell polish: prevents awkward horizontal page scroll and supports a collapsible sidebar. */
body {
  overflow-x: hidden;
}

.workspace-main {
  min-width: 0;
}

@media (min-width: 1024px) {
  #workspace-sidebar-toggle:checked ~ .workspace-sidebar {
    width: 6rem;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  #workspace-sidebar-toggle:checked ~ .workspace-sidebar .workspace-brand {
    padding: 1rem 0.75rem;
  }

  #workspace-sidebar-toggle:checked ~ .workspace-sidebar .sidebar-full-text,
  #workspace-sidebar-toggle:checked ~ .workspace-sidebar .sidebar-label,
  #workspace-sidebar-toggle:checked ~ .workspace-sidebar .sidebar-eyebrow {
    display: none;
  }

  #workspace-sidebar-toggle:checked ~ .workspace-sidebar .sidebar-collapsed-text {
    display: block;
  }

  #workspace-sidebar-toggle:checked ~ .workspace-sidebar .workspace-nav-item {
    justify-content: center;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    min-height: 3rem;
  }

  #workspace-sidebar-toggle:checked ~ .workspace-sidebar .sidebar-collapsed-nav-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 9999px;
    background: #f1f5f9;
    color: #0f172a;
    font-size: 0.7rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    text-transform: uppercase;
  }

  #workspace-sidebar-toggle:checked ~ .workspace-sidebar .workspace-account {
    padding: 0.6rem;
  }

  #workspace-sidebar-toggle:checked ~ .workspace-sidebar .workspace-account summary {
    justify-content: center;
    padding-left: 0;
    padding-right: 0;
  }

  #workspace-sidebar-toggle:checked ~ .workspace-main {
    padding-left: 6rem;
  }
}

.keyword-control-panel {
  min-width: 0;
}

.keyword-results-panel {
  min-width: 0;
}
