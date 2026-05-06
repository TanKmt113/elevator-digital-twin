import { describe, expect, it } from 'vitest';
import { createApp, getOpenApiSpec, renderSwaggerUiHtml } from '../../src/api/server.js';

describe('swagger contract', () => {
  it('defines docs routes and exposes the backend OpenAPI contract', () => {
    const { app } = createApp({ seedAnalytics: false, bootstrapTwin: false });
    const router = (
      app as unknown as {
        _router?: {
          stack: Array<{ route?: { path?: string } }>;
        };
      }
    )._router;
    const routes =
      router?.stack.flatMap((layer) => (layer.route?.path ? [layer.route.path] : [])) ?? [];

    expect(routes).toContain('/openapi.yaml');
    expect(routes).toContain('/docs');
    expect(getOpenApiSpec()).toContain('openapi: 3.1.0');
  });

  it('renders a Swagger UI document page that points to the YAML contract', () => {
    const html = renderSwaggerUiHtml();
    expect(html).toContain('swagger-ui');
    expect(html).toContain('/openapi.yaml');
  });
});
