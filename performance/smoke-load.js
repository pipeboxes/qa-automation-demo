// Prueba de carga liviana (smoke load) con k6.
// Uso: k6 run performance/smoke-load.js
//      k6 run -e BASE_URL=https://otra-api performance/smoke-load.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://jsonplaceholder.typicode.com';

export const options = {
  stages: [
    { duration: '15s', target: 5 }, // subida
    { duration: '30s', target: 5 }, // carga sostenida
    { duration: '10s', target: 0 }, // bajada
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // < 1% de errores
    http_req_duration: ['p(95)<800'], // p95 bajo 800 ms
    checks: ['rate>0.99'],
  },
};

export default function () {
  group('listar posts', () => {
    const res = http.get(`${BASE_URL}/posts`);
    check(res, {
      'status 200': (r) => r.status === 200,
      'devuelve 100 posts': (r) => r.json().length === 100,
    });
  });

  group('obtener post', () => {
    const id = Math.floor(Math.random() * 100) + 1;
    const res = http.get(`${BASE_URL}/posts/${id}`);
    check(res, {
      'status 200': (r) => r.status === 200,
      'id correcto': (r) => r.json('id') === id,
    });
  });

  group('crear post', () => {
    const payload = JSON.stringify({ title: 'k6', body: 'carga', userId: 1 });
    const res = http.post(`${BASE_URL}/posts`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, { 'status 201': (r) => r.status === 201 });
  });

  sleep(1);
}
