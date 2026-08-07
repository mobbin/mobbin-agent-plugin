import Ajv from "ajv/dist/2020.js";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
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
  const valid = ajv.validate(schema, data);
  if (!valid) {
    for (const error of ajv.errors ?? []) {
      fail(`${label}: ${error.instancePath || "/"} ${error.message}`);
    }
  }
}

const plugin = await readJson("plugin.json");
const mcp = await readJson("mcp.json");
validateSchema("schemas/1.0.0/plugin.schema.json", plugin, "plugin.json");
validateSchema("schemas/1.0.0/mcp.schema.json", mcp, "mcp.json");

if (errors.length > 0) {
  console.error(`FAIL: ${errors.length} validation error${errors.length === 1 ? "" : "s"}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("PASS: plugin.json schema");
  console.log("PASS: mcp.json schema");
  console.log("Validation passed.");
}
