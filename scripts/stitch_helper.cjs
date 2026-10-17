#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const STITCH_ENDPOINT = 'https://stitch.googleapis.com/mcp';

function getApiKey() {
  if (process.env.STITCH_API_KEY) return process.env.STITCH_API_KEY;
  const searchPaths = [
    path.resolve('.stitch/mcp_config.json'),
    path.resolve('.agents/mcp_config.json'),
    path.resolve('../.agents/mcp_config.json')
  ];
  for (const cfg of searchPaths) {
    try {
      if (fs.existsSync(cfg)) {
        const parsed = JSON.parse(fs.readFileSync(cfg, 'utf8'));
        const key = parsed?.mcpServers?.stitch?.headers?.['X-Goog-Api-Key'];
        if (key) return key;
      }
    } catch (_) {}
  }
  return '';
}

async function callStitch(methodName, args = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('No Stitch API Key found. Define STITCH_API_KEY or configure .stitch/mcp_config.json');
  }
  const payload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: methodName,
      arguments: args
    }
  };

  const res = await fetch(STITCH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Stitch MCP HTTP ${res.status}: ${errorText}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(`Stitch MCP Error [${json.error.code}]: ${json.error.message}`);
  }

  return json.result;
}

async function main() {
  const [,, cmd, ...rest] = process.argv;

  if (!cmd || cmd === 'help') {
    console.log(`
Google Stitch MCP Helper CLI
=============================
Usage:
  node scripts/stitch_helper.cjs list-projects
  node scripts/stitch_helper.cjs create-project <title>
  node scripts/stitch_helper.cjs list-screens <projectId>
  node scripts/stitch_helper.cjs get-screen <screenNameOrId>
  node scripts/stitch_helper.cjs generate-screen <projectId> <prompt>
  node scripts/stitch_helper.cjs upload-design-md <projectId> [pathToDesignMd]
    `);
    return;
  }

  try {
    switch (cmd) {
      case 'list-projects': {
        const result = await callStitch('list_projects', {});
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case 'create-project': {
        const title = rest.join(' ') || 'ComandaFast Luxury POS';
        const result = await callStitch('create_project', { title });
        console.log('Project created:', JSON.stringify(result, null, 2));
        break;
      }
      case 'list-screens': {
        const projectId = rest[0];
        if (!projectId) throw new Error('Missing projectId argument');
        const result = await callStitch('list_screens', { projectName: projectId });
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case 'get-screen': {
        const screenName = rest[0];
        if (!screenName) throw new Error('Missing screenName argument');
        const result = await callStitch('get_screen', { screenName });
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case 'generate-screen': {
        const projectId = rest[0];
        const prompt = rest.slice(1).join(' ');
        if (!projectId || !prompt) throw new Error('Usage: generate-screen <projectId> <prompt>');
        console.log(`Generating screen in project ${projectId}...`);
        const result = await callStitch('generate_screen_from_text', {
          projectId,
          prompt,
          deviceType: 'DESKTOP'
        });
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case 'upload-design-md': {
        let projectId = rest[0];
        if (projectId && projectId.startsWith('projects/')) {
          projectId = projectId.replace('projects/', '');
        }
        const filePath = rest[1] || path.resolve('.stitch/DESIGN.md');
        if (!projectId) throw new Error('Usage: upload-design-md <projectId> [filePath]');
        const content = fs.readFileSync(filePath, 'utf8');
        const designMdBase64 = Buffer.from(content, 'utf8').toString('base64');
        console.log(`Uploading ${filePath} to project ${projectId}...`);
        const result = await callStitch('upload_design_md', {
          projectId,
          designMdBase64
        });
        console.log('Upload result:', JSON.stringify(result, null, 2));
        break;
      }
      default:
        console.error('Unknown command:', cmd);
    }
  } catch (err) {
    console.error('Execution failed:', err.message);
    process.exit(1);
  }
}

main();
