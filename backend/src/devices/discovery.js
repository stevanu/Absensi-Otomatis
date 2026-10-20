import os from "os";
import net from "net";
import { config } from "../config/index.js";

function ipv4ToInt(ip) {
  return ip
    .split(".")
    .map(Number)
    .reduce((n, part) => ((n << 8) | part) >>> 0, 0);
}

function intToIpv4(value) {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255,
  ].join(".");
}

function maskToPrefix(mask) {
  return mask
    .split(".")
    .map(Number)
    .reduce((bits, octet) => {
      let n = octet;
      let count = 0;

      while (n > 0) {
        count += n & 1;
        n >>>= 1;
      }

      return bits + count;
    }, 0);
}

function localSubnets() {
  const result = [];
  const interfaces = os.networkInterfaces();

  for (const [name, entries] of Object.entries(interfaces)) {
    for (const iface of entries || []) {
      if (iface.family !== "IPv4" || iface.internal) continue;

      const ipInt = ipv4ToInt(iface.address);
      const maskInt = ipv4ToInt(iface.netmask);
      const prefix = maskToPrefix(iface.netmask);

      if (prefix >= 31) continue;

      const network = (ipInt & maskInt) >>> 0;
      const broadcast = (network | (~maskInt >>> 0)) >>> 0;

      result.push({
        name,
        ip: iface.address,
        netmask: iface.netmask,
        prefix,
        network,
        broadcast,
      });
    }
  }

  return result;
}

function probe(ip, port, timeoutMs) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;

      socket.removeAllListeners();
      socket.destroy();

      resolve(result);
    };

    socket.setTimeout(timeoutMs);

    socket.once("connect", () => {
      finish({
        open: true,
        ip,
        port,
      });
    });

    socket.once("error", (error) => {
      finish({
        open: false,
        ip,
        port,
        error: error.message,
      });
    });

    socket.once("timeout", () => {
      finish({
        open: false,
        ip,
        port,
        error: "timeout",
      });
    });

    socket.connect(Number(port), ip);
  });
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function runner() {
    while (true) {
      const index = cursor++;

      if (index >= items.length) return;

      try {
        results[index] = await worker(items[index], index);
      } catch (error) {
        results[index] = {
          error: error.message,
        };
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    runner(),
  );

  await Promise.all(workers);

  return results;
}

export async function discoverLAN() {
  if (config.device.simulate) {
    return [];
  }

  const ports = [...new Set(config.device.discoveryPorts)]
    .map(Number)
    .filter((port) => port > 0 && port <= 65535);

  if (!ports.length) return [];

  const timeout = Math.max(100, Number(config.device.discoveryTimeout || 600));

  const hosts = [];

  for (const subnet of localSubnets()) {
    const firstHost = subnet.network + 1;
    const lastHost = subnet.broadcast - 1;

    if (lastHost < firstHost) continue;

    // Safety limit. A /8 network should never trigger millions of probes.
    const maxHosts = 1024;
    const totalHosts = lastHost - firstHost + 1;

    if (totalHosts > maxHosts) {
      continue;
    }

    for (let current = firstHost; current <= lastHost; current++) {
      const ip = intToIpv4(current);

      // Jangan scan IP komputer server sendiri.
      if (ip === subnet.ip) continue;

      hosts.push(ip);
    }
  }

  const uniqueHosts = [...new Set(hosts)];

  const results = await mapLimit(uniqueHosts, 32, async (ip) => {
    const probes = await Promise.all(
      ports.map((port) => probe(ip, port, timeout)),
    );

    const openPorts = probes
      .filter((result) => result.open)
      .map((result) => result.port);

    if (!openPorts.length) return null;

    return {
      ip,
      ports: openPorts,
      reachable: true,
      via: "lan-scan",
    };
  });

  return results.filter(Boolean);
}

export { localSubnets };
