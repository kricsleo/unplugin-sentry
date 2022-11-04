import * as sentryRuntime from 'virtual-unplugin-sentry-runtime'

function component() {
  const element = document.createElement('pre');
  element.innerHTML = JSON.stringify(sentryRuntime, null, 2);
  return element;
}

document.body.appendChild(component());
