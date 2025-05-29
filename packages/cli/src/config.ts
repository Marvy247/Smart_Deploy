import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import Ajv from 'ajv';

const ajv = new Ajv();

export interface ProjectConfig {
  network: string;
  deployment: {
    privateKey: string;
    rpcUrl: string;
  };
}

const schema = {
  type: 'object',
  properties: {
    network: { type: 'string' },
    deployment: {
      type: 'object',
      properties: {
        privateKey: { type: 'string' },
        rpcUrl: { type: 'string' }
      },
      required: ['privateKey', 'rpcUrl'],
      additionalProperties: false
    }
  },
  required: ['network', 'deployment'],
  additionalProperties: false
};

export function loadConfig(configPath: string): ProjectConfig {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  const ext = path.extname(configPath).toLowerCase();
  let configData: any;

  if (ext === '.json') {
    const raw = fs.readFileSync(configPath, 'utf-8');
    configData = JSON.parse(raw);
  } else if (ext === '.yaml' || ext === '.yml') {
    const raw = fs.readFileSync(configPath, 'utf-8');
    configData = yaml.load(raw);
  } else {
    throw new Error('Unsupported config file format. Use JSON or YAML.');
  }

  const validate = ajv.compile(schema);
  const valid = validate(configData);

  if (!valid) {
    throw new Error('Invalid config file: ' + ajv.errorsText(validate.errors));
  }

  return configData as ProjectConfig;
}
