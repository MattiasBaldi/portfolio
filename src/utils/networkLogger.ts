/**
 * Network Logger
 * Intercepts fetch and XMLHttpRequest to log all network activity to console
 */

export function enableNetworkLogging() {
  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [resource, config] = args;
    const url = typeof resource === 'string' ? resource : resource.url;
    const method = config?.method || 'GET';

    console.log(`[Network] ${method} ${url}`, {
      url,
      method,
      headers: config?.headers,
      body: config?.body,
    });

    try {
      const response = await originalFetch(...args);
      console.log(`[Network] ${method} ${url} → ${response.status} ${response.statusText}`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
      });
      return response;
    } catch (error) {
      console.error(`[Network] ${method} ${url} → ERROR`, error);
      throw error;
    }
  };

  // Intercept XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
    (this as any)._method = method;
    (this as any)._url = url.toString();
    console.log(`[Network] XHR ${method} ${url}`);
    return originalOpen.apply(this, [method, url, ...rest] as any);
  };

  XMLHttpRequest.prototype.send = function(...args: any[]) {
    this.addEventListener('load', function() {
      const method = (this as any)._method || 'GET';
      const url = (this as any)._url || this.responseURL;
      console.log(`[Network] XHR ${method} ${url} → ${this.status} ${this.statusText}`, {
        status: this.status,
        statusText: this.statusText,
        response: this.response,
      });
    });

    this.addEventListener('error', function() {
      const method = (this as any)._method || 'GET';
      const url = (this as any)._url || this.responseURL;
      console.error(`[Network] XHR ${method} ${url} → ERROR`);
    });

    return originalSend.apply(this, args);
  };

  console.log('[Network Logger] Enabled - All network requests will be logged');
}
