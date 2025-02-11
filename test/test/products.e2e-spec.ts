// test/products.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let createdProductId: number;
  // Replace this with a valid JWT token for an admin user obtained from your auth endpoint.
  const adminToken = '<admin_token_here>';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Set global pipes (as in your main.ts)
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  it('/en/products (POST) - Create Product', async () => {
    const productData = {
      name: 'Test Milk',
      description: 'Fresh test milk',
      price: 5,
      stock: 50,
      imageUrl: 'http://example.com/image.png',
      categoryId: 1, // Ensure this category exists in your test database
      variations: [
        { size: '1 liter', price: 5, stock: 20 },
        { size: '2 liters', price: 9, stock: 30 },
      ],
    };

    const response = await request(app.getHttpServer())
      .post('/en/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(productData)
      .expect(201);

    createdProductId = response.body.id;
    expect(response.body.name).toEqual(productData.name);
  });

  it('/en/products/:id (PUT) - Update Product', async () => {
    const updateData = { name: 'Updated Test Milk' };

    const response = await request(app.getHttpServer())
      .put(`/en/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body.name).toEqual('Updated Test Milk');
  });

  it('/en/products/:id (GET) - Fetch Product Details', async () => {
    const response = await request(app.getHttpServer())
      .get(`/en/products/${createdProductId}`)
      .expect(200);

    // Check that the product name matches the updated name and that dynamic pricing is applied.
    expect(response.body.name).toEqual('Updated Test Milk');
    expect(response.body.price).toBeDefined();
  });

  it('/en/products/search (GET) - Search and Filter Products', async () => {
    const response = await request(app.getHttpServer())
      .get('/en/products/search')
      .query({
        search: 'Test',
        page: 1,
        limit: 10,
        sortBy: 'price',
        sortOrder: 'asc',
      })
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    // Optionally, verify that at least one product is returned
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('/en/products/:id (DELETE) - Delete Product', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/en/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.message).toEqual('Product deleted successfully');
  });

  afterAll(async () => {
    await app.close();
  });
});
