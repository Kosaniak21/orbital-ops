// Temporary DOM manipulation. Belongs in a hook, but kept here during refactor.
export function flashAlert() {
  const el = document.querySelector('.alert-banner');
  if (el) {
    el.classList.add('alert-flash');
    setTimeout(() => el?.classList.remove('alert-flash'), 600);
  }
}
