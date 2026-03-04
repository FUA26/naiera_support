// Mock data for system metrics (not available in database)

export function generateMockApiRequests(days: number = 7) {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    data.push({
      date: date.toISOString().split("T")[0],
      requests: Math.floor(Math.random() * 5000) + 5000,
      successRate: 85 + Math.random() * 14,
      avgResponseTime: Math.floor(Math.random() * 200) + 50,
    });
  }

  return data;
}

export function generateMockResponseTime() {
  return [
    { range: "0-100ms", count: Math.floor(Math.random() * 5000) + 8000 },
    { range: "100-500ms", count: Math.floor(Math.random() * 2000) + 1000 },
    { range: "500ms-1s", count: Math.floor(Math.random() * 500) + 100 },
    { range: "1s+", count: Math.floor(Math.random() * 100) + 10 },
  ];
}

export function generateMockCacheHitRate() {
  return {
    hitRate: 85 + Math.floor(Math.random() * 10),
    hits: Math.floor(Math.random() * 50000) + 50000,
    total: Math.floor(Math.random() * 10000) + 60000,
  };
}

export function generateMockLoginActivity(days: number = 7) {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    data.push({
      date: date.toISOString().split("T")[0],
      successful: Math.floor(Math.random() * 100) + 50,
      failed: Math.floor(Math.random() * 20) + 5,
    });
  }

  return data;
}

export function generateMockBandwidth() {
  const data = [];
  const now = new Date();

  for (let i = 0; i < 20; i++) {
    const date = new Date(now);
    date.setHours(date.getHours() - i);

    data.push({
      time: date.toISOString(),
      fileSize: Math.floor(Math.random() * 10000000) + 100000,
      requests: Math.floor(Math.random() * 100) + 10,
      fileType: ["image", "document", "video", "other"][Math.floor(Math.random() * 4)],
    });
  }

  return data;
}

// Active sessions (simulated)
export function getActiveSessions() {
  return {
    current: Math.floor(Math.random() * 50) + 10,
    peak: Math.floor(Math.random() * 100) + 50,
    capacity: 200,
  };
}
