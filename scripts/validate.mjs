import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFile, readdir, realpath } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import process from "node:process";

const require = createRequire(import.meta.url);
const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const errors = [];

function fail(message) {
  errors.push(message);
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(resolve(root, path), "utf8"));
  } catch (error) {
    fail(`${path}: ${error.message}`);
    return null;
  }
}

function validateSchema(schemaPath, data, label) {
  if (data === null) return;
  const schema = require(resolve(root, schemaPath));
  const ajv = new Ajv({ allErrors: true, strict: true });
  addFormats(ajv);
  const valid = ajv.validate(schema, data);
  if (!valid) {
    for (const error of ajv.errors ?? []) {
      fail(`${label}: ${error.instancePath || "/"} ${error.message}`);
    }
  }
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function validatePackagePaths() {
  const rootReal = await realpath(root);
  async function walk(path) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const current = resolve(path, entry.name);
      let target;
      try {
        target = await realpath(current);
      } catch (error) {
        fail(`package path ${relative(root, current)} cannot be resolved: ${error.message}`);
        continue;
      }
      if (relative(rootReal, target).startsWith("..")) {
        fail(`package path escapes plugin root: ${relative(root, current)} -> ${target}`);
      }
      if (entry.isDirectory() && !entry.isSymbolicLink()) await walk(current);
    }
  }
  await walk(root);
}

function validateConfigSafety(mcp) {
  for (const [name, server] of Object.entries(mcp?.mcpServers ?? {})) {
    if (server.cwd !== undefined && !server.cwd.startsWith("./")) {
      fail(`mcpServers.${name}.cwd must start with "./"`);
    }
    if (server.headers) {
      for (const [header, value] of Object.entries(server.headers)) {
        const key = header.toLowerCase();
        if (/(authorization|api[-_]?key|token|secret|password|credential|cookie|session)/i.test(key)) {
          fail(`mcpServers.${name}.headers.${header} looks like a credential header`);
        }
        if (/(bearer\s|basic\s|sk[-_]|secret|password|token|\$\{|<[^>]+>)/i.test(value)) {
          fail(`mcpServers.${name}.headers.${header} looks like a credential value`);
        }
      }
    }
  }
}

const plugin = await readJson("plugin.json");
const mcp = await readJson("mcp.json");
const compatibilityMcp = await readJson(".mcp.json");
validateSchema("schemas/1.0.0/plugin.schema.json", plugin, "plugin.json");
validateSchema("schemas/1.0.0/mcp.schema.json", mcp, "mcp.json");
validateConfigSafety(mcp);
if (!isObject(compatibilityMcp) || !isObject(compatibilityMcp.mcpServers)) {
  fail(".mcp.json: mcpServers must be an object");
} else if (isObject(mcp?.mcpServers)) {
  const standardServers = mcp.mcpServers;
  const compatibilityServers = compatibilityMcp.mcpServers;
  const standardNames = Object.keys(standardServers).sort();
  const compatibilityNames = Object.keys(compatibilityServers).sort();
  if (JSON.stringify(standardNames) !== JSON.stringify(compatibilityNames)) {
    fail(".mcp.json: server names must match mcp.json");
  }
  for (const name of standardNames) {
    const standard = standardServers[name];
    const compatibility = compatibilityServers[name];
    if (!isObject(compatibility)) {
      fail(`.mcp.json: server "${name}" must be an object`);
      continue;
    }
    if (standard.url !== compatibility.url) {
      fail(`.mcp.json: server "${name}" URL must match mcp.json`);
    }
    const transports = {
      "streamable-http": "http",
      sse: "sse",
      stdio: "stdio",
    };
    if (transports[standard.type] !== compatibility.type) {
      fail(`.mcp.json: server "${name}" transport does not correspond to mcp.json`);
    }
  }
}
await validatePackagePaths();

if (errors.length > 0) {
  console.error(`FAIL: ${errors.length} validation error${errors.length === 1 ? "" : "s"}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("PASS: plugin.json schema");
  console.log("PASS: mcp.json schema");
  console.log("PASS: package path containment");
  console.log("PASS: MCP header credential safety");
  console.log("Validation passed.");
}
