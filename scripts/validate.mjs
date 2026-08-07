import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFile, readdir, realpath } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import process from "node:process";
import YAML from "yaml";

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

function validateSkillFrontmatter(path, source) {
  if (!source.startsWith("---\n")) {
    fail(`${path}: missing YAML frontmatter`);
    return;
  }
  const end = source.indexOf("\n---", 4);
  if (end === -1) {
    fail(`${path}: unterminated YAML frontmatter`);
    return;
  }

  let frontmatter;
  try {
    frontmatter = YAML.parse(source.slice(4, end));
  } catch (error) {
    fail(`${path}: invalid YAML frontmatter: ${error.message}`);
    return;
  }
  if (!isObject(frontmatter)) {
    fail(`${path}: frontmatter must be a YAML mapping`);
    return;
  }

  const allowed = new Set([
    "name",
    "description",
    "license",
    "compatibility",
    "metadata",
    "allowed-tools",
  ]);
  for (const key of Object.keys(frontmatter)) {
    if (!allowed.has(key)) fail(`${path}: unsupported frontmatter field "${key}"`);
  }

  const skillDir = path.split("/").at(-2);
  const name = frontmatter.name;
  if (
    typeof name !== "string" ||
    name.length < 1 ||
    name.length > 64 ||
    !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(name) ||
    name.includes("--")
  ) {
    fail(`${path}: name must be 1-64 lowercase letters, numbers, and single hyphens`);
  } else if (name !== skillDir) {
    fail(`${path}: name must match parent directory "${skillDir}"`);
  }

  const description = frontmatter.description;
  if (typeof description !== "string" || description.trim() === "" || description.length > 1024) {
    fail(`${path}: description must be non-empty and at most 1024 characters`);
  }
  if (frontmatter.license !== undefined && typeof frontmatter.license !== "string") {
    fail(`${path}: license must be a string`);
  }
  if (
    frontmatter.compatibility !== undefined &&
    (typeof frontmatter.compatibility !== "string" || frontmatter.compatibility.length > 500)
  ) {
    fail(`${path}: compatibility must be a string of at most 500 characters`);
  }
  if (frontmatter.metadata !== undefined) {
    if (!isObject(frontmatter.metadata)) fail(`${path}: metadata must be a mapping`);
    else {
      for (const [key, value] of Object.entries(frontmatter.metadata)) {
        if (typeof key !== "string" || typeof value !== "string") {
          fail(`${path}: metadata keys and values must be strings`);
        }
      }
    }
  }
  if (frontmatter["allowed-tools"] !== undefined && typeof frontmatter["allowed-tools"] !== "string") {
    fail(`${path}: allowed-tools must be a space-separated string`);
  }
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
validateSchema("schemas/1.0.0/plugin.schema.json", plugin, "plugin.json");
validateSchema("schemas/1.0.0/mcp.schema.json", mcp, "mcp.json");
validateConfigSafety(mcp);
await validatePackagePaths();

try {
  for (const entry of await readdir(resolve(root, "skills"), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = `skills/${entry.name}/SKILL.md`;
    try {
      validateSkillFrontmatter(path, await readFile(resolve(root, path), "utf8"));
    } catch (error) {
      fail(`${path}: ${error.message}`);
    }
  }
} catch (error) {
  fail(`skills/: ${error.message}`);
}

if (errors.length > 0) {
  console.error(`FAIL: ${errors.length} validation error${errors.length === 1 ? "" : "s"}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("PASS: plugin.json schema");
  console.log("PASS: mcp.json schema");
  console.log("PASS: skill frontmatter");
  console.log("PASS: package path containment");
  console.log("PASS: MCP header credential safety");
  console.log("Validation passed.");
}
