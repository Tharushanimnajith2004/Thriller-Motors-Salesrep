import dns from 'dns';
import dnsPromises from 'dns/promises';

console.log("[DNS Bypass] Initializing Cloudflare DNS-over-HTTPS (DoH) engine...");

const originalPromisesLookup = dnsPromises.lookup;

async function dohResolveSrv(name) {
  try {
    const res = await fetch(`https://1.1.1.1/dns-query?name=${name}&type=SRV`, {
      headers: { 'accept': 'application/dns-json' }
    });
    const data = await res.json();
    if (!data.Answer || data.Answer.length === 0) {
      throw new Error(`ENODATA: No SRV record found for ${name}`);
    }
    return data.Answer.map(ans => {
      const parts = ans.data.split(/\s+/);
      return { name: parts[3].replace(/\.$/, ''), port: parseInt(parts[2]), priority: parseInt(parts[0]), weight: parseInt(parts[1]) };
    });
  } catch (err) {
    console.error(`[DNS Bypass] SRV resolve failed for ${name}:`, err.message);
    throw err;
  }
}

async function dohResolveTxt(name) {
  try {
    const res = await fetch(`https://1.1.1.1/dns-query?name=${name}&type=TXT`, {
      headers: { 'accept': 'application/dns-json' }
    });
    const data = await res.json();
    if (!data.Answer || data.Answer.length === 0) {
      throw new Error(`ENODATA: No TXT record found for ${name}`);
    }
    return data.Answer.map(ans => [ans.data.replace(/^"|"$/g, '')]);
  } catch (err) {
    console.error(`[DNS Bypass] TXT resolve failed for ${name}:`, err.message);
    throw err;
  }
}

async function dohLookup(hostname, options) {
  const isAll = options && options.all;
  if (hostname.endsWith('mongodb.net')) {
    try {
      const res = await fetch(`https://1.1.1.1/dns-query?name=${hostname}&type=A`, {
        headers: { 'accept': 'application/dns-json' }
      });
      const data = await res.json();
      if (data.Answer && data.Answer.length > 0) {
        const aRecords = data.Answer.filter(ans => ans.type === 1 && ans.data);
        if (aRecords.length > 0) {
          console.log(`[DNS Bypass] Resolved ${hostname} via DoH ->`, aRecords.map(r => r.data));
          if (isAll) {
            return aRecords.map(rec => ({ address: rec.data, family: 4 }));
          } else {
            return { address: aRecords[0].data, family: 4 };
          }
        }
      }
    } catch (e) {
      console.error(`[DNS Bypass] Lookup failed for ${hostname}:`, e.message);
    }
  }
  return await originalPromisesLookup(hostname, options);
}

// Monkey-patch BOTH dns.promises and dns/promises
dns.promises.resolveSrv = dohResolveSrv;
dns.promises.resolveTxt = dohResolveTxt;
dns.promises.lookup = dohLookup;

dnsPromises.resolveSrv = dohResolveSrv;
dnsPromises.resolveTxt = dohResolveTxt;
dnsPromises.lookup = dohLookup;

// Also patch the callback-based wrappers
dns.resolveSrv = (name, callback) => {
  dohResolveSrv(name).then(res => callback(null, res)).catch(callback);
};

dns.resolveTxt = (name, callback) => {
  dohResolveTxt(name).then(res => callback(null, res)).catch(callback);
};

dns.lookup = (hostname, options, callback) => {
  const cb = typeof options === 'function' ? options : callback;
  const opts = typeof options === 'object' ? options : {};
  dohLookup(hostname, opts)
    .then(res => {
      if (opts.all) {
        cb(null, res);
      } else {
        cb(null, res.address, res.family);
      }
    })
    .catch(err => {
      originalPromisesLookup(hostname, opts)
        .then(native => {
          if (opts.all) {
            cb(null, native);
          } else {
            cb(null, native.address, native.family);
          }
        })
        .catch(e => cb(e));
    });
};

console.log("[DNS Bypass] Cloudflare DoH engine successfully injected.");
