window.onload = function () {
  // Get current hostname (works on localhost & Vercel)
  const apiUrl = `${window.location.origin}/swagger.json`;

  // Initialize Swagger UI
  window.ui = SwaggerUIBundle({
    url: apiUrl,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: 'StandaloneLayout',
  });
};
