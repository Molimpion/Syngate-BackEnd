export const renderScalar = (openapiSpecification: any) => `
  <!doctype html>
  <html>
    <head>
      <title>Syngate API Reference</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { margin: 0; }
      </style>
    </head>
    <body>
      <script
        id="api-reference"
        data-configuration='${JSON.stringify({
          spec: { content: openapiSpecification },
          theme: 'deepSpace',
          layout: 'modern',
        })}'></script>
      <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    </body>
  </html>
`;