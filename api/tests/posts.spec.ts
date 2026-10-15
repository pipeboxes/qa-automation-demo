import { test, expect } from '@playwright/test';

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

test.describe('API /posts', () => {
  test('GET /posts devuelve la lista completa @smoke', async ({ request }) => {
    const response = await request.get('/posts');

    expect(response.status()).toBe(200);
    const posts: Post[] = await response.json();
    expect(posts).toHaveLength(100);
    expect(posts[0]).toEqual(
      expect.objectContaining({
        userId: expect.any(Number),
        id: expect.any(Number),
        title: expect.any(String),
        body: expect.any(String),
      }),
    );
  });

  test('GET /posts/1 devuelve un post existente @smoke', async ({ request }) => {
    const response = await request.get('/posts/1');

    expect(response.ok()).toBeTruthy();
    const post: Post = await response.json();
    expect(post.id).toBe(1);
    expect(post.userId).toBe(1);
  });

  test('GET /posts?userId=1 filtra por usuario', async ({ request }) => {
    const response = await request.get('/posts', { params: { userId: 1 } });

    expect(response.status()).toBe(200);
    const posts: Post[] = await response.json();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      expect(post.userId).toBe(1);
    }
  });

  test('GET /posts/9999 devuelve 404', async ({ request }) => {
    const response = await request.get('/posts/9999');

    expect(response.status()).toBe(404);
  });

  test('POST /posts crea un post', async ({ request }) => {
    const nuevo = { title: 'QA demo', body: 'Creado por Playwright', userId: 1 };

    const response = await request.post('/posts', { data: nuevo });

    expect(response.status()).toBe(201);
    const creado: Post = await response.json();
    expect(creado).toMatchObject(nuevo);
    expect(creado.id).toBeDefined();
  });

  test('PUT /posts/1 actualiza un post', async ({ request }) => {
    const actualizado = { id: 1, title: 'Título actualizado', body: 'Cuerpo actualizado', userId: 1 };

    const response = await request.put('/posts/1', { data: actualizado });

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject(actualizado);
  });

  test('DELETE /posts/1 elimina un post', async ({ request }) => {
    const response = await request.delete('/posts/1');

    expect(response.status()).toBe(200);
  });
});
