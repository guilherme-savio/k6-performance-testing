import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getShowsDuration = new Trend('get_shows', true);
export const RateContentOK = new Rate('content_OK');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'],
    get_shows: ['p(95)<5700'],
    content_OK: ['rate>0.88']
  },
  stages: [
    
    { duration: '20s', target: 10 },
    { duration: '40s', target: 20 },
    { duration: '15s', target: 40 },
    { duration: '30s', target: 40 },
    { duration: '20s', target: 80 },
    { duration: '40s', target: 80 },
    { duration: '135s', target: 300 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'http://api.tvmaze.com/search/shows?q=postman';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getShowsDuration.add(res.timings.duration);

  RateContentOK.add(res.status === OK);

  check(res, {
    'GET TV Shows - Status 200': () => res.status === OK
  });
}
