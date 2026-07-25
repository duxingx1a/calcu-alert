const API_BASE = 'https://8.137.187.63';

async function requestJson(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 35000);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      signal: controller.signal
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `请求失败（${response.status}）`);
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function getMetadata() {
  return requestJson('/api/v1/metadata');
}

async function getHealth() {
  return requestJson('/api/v1/health', { timeout: 5000 });
}

async function predict(features) {
  return requestJson('/api/v1/predict', {
    method: 'POST',
    body: JSON.stringify({ features })
  });
}

async function getExamples() {
  return requestJson('/api/v1/examples');
}

export { getExamples, getHealth, getMetadata, predict };
