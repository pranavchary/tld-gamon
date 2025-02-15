if (!process.env.NODE_ENV) require('dotenv').config();
const NodeCache = require('node-cache');
const {
    CACHE_TTL: stdTTL,
    CACHE_CHECK_PERIOD: checkperiod,
    CACHE_MAX_KEYS: maxKeys
} = process.env;

let cache;

const initializeCache = () => {
    cache = new NodeCache({ stdTTL, checkperiod, maxKeys });
    cache.on('expired', (key, value) => {
        console.info(`[CACHE] Expired entry found: { ${key}: ${value} }`);
        cache.del(key);
        console.info(`[CACHE] Cache entry ${key} has been deleted`);
    });
    console.info('[CACHE] New cache initialized');
};

const setCache = (key, value) => {
    const success = cache.set(key, value);
    if (success) {
        console.info(`[CACHE] Successfully cached key-value pair: { ${key}: ${value} }`);
    } else {
        console.warn(`[CACHE] Unable to cache key-value pair: { ${key}: ${value} }`);
    }
};

const getCache = (key) => {
    if (!cache.has(key)) {
        console.info(`[CACHE] Value not found for key ${key}`);
    }
    return cache.get(key);
};

module.exports = {
    initializeCache,
    setCache,
    getCache
};
