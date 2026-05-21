const net = require('net');

const memoryCache = new Map();

function getRedisConfig() {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 6379,
      password: parsed.password || null
    };
  } catch (err) {
    console.error('Invalid REDIS_URL:', err.message);
    return null;
  }
}

function encodeCommand(args) {
  return `*${args.length}\r\n${args.map(arg => {
    const value = String(arg);
    return `$${Buffer.byteLength(value)}\r\n${value}\r\n`;
  }).join('')}`;
}

function parseResp(buffer) {
  const text = buffer.toString();
  if (text.startsWith('$-1')) return null;
  if (text.startsWith('$')) {
    const splitAt = text.indexOf('\r\n');
    const length = parseInt(text.slice(1, splitAt), 10);
    return text.slice(splitAt + 2, splitAt + 2 + length);
  }
  if (text.startsWith('*')) {
    return text
      .split('\r\n')
      .filter((part, index) => index > 0 && index % 2 === 0 && part.length > 0);
  }
  if (text.startsWith(':')) return parseInt(text.slice(1), 10);
  if (text.startsWith('+')) return text.slice(1).trim();
  if (text.startsWith('-')) throw new Error(text.slice(1).trim());
  return null;
}

function redisCommand(args) {
  const config = getRedisConfig();
  if (!config) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: config.host, port: config.port });
    const chunks = [];
    const commands = [];
    if (config.password) commands.push(['AUTH', config.password]);
    commands.push(args);

    socket.setTimeout(750);
    socket.on('connect', () => socket.write(commands.map(encodeCommand).join('')));
    socket.on('data', chunk => {
      chunks.push(chunk);
      if (!config.password) {
        try {
          resolve(parseResp(Buffer.concat(chunks)));
        } catch (err) {
          reject(err);
        } finally {
          socket.end();
        }
      }
    });
    socket.on('end', () => {
      try {
        resolve(parseResp(Buffer.concat(chunks)));
      } catch (err) {
        reject(err);
      }
    });
    socket.on('timeout', () => socket.destroy(new Error('Redis timeout')));
    socket.on('error', reject);
  });
}

class CacheService {
  static async getJson(key) {
    const cached = memoryCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    if (cached) memoryCache.delete(key);

    try {
      const value = await redisCommand(['GET', key]);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error('Redis GET failed:', err.message);
      return null;
    }
  }

  static async setJson(key, value, ttlSeconds) {
    memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });

    try {
      await redisCommand(['SETEX', key, ttlSeconds, JSON.stringify(value)]);
    } catch (err) {
      console.error('Redis SETEX failed:', err.message);
    }
  }

  static async invalidatePattern(prefix) {
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) memoryCache.delete(key);
    }

    try {
      const keys = await redisCommand(['KEYS', `${prefix}*`]);
      if (Array.isArray(keys) && keys.length > 0) {
        await redisCommand(['DEL', ...keys]);
      }
    } catch (err) {
      console.error('Redis invalidation failed:', err.message);
    }
  }
}

module.exports = CacheService;
