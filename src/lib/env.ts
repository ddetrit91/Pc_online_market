import fs from 'fs';
import path from 'path';

/**
 * Reads an environment variable from process.env or falls back to .env.local / .env files.
 */
export function readEnvVar(name: string): string {
  const fromProcess = process.env[name];
  if (fromProcess && fromProcess.trim()) {
    return fromProcess.trim().replace(/^["']|["']$/g, '');
  }

  try {
    for (const file of ['.env.local', '.env']) {
      const envPath = path.resolve(process.cwd(), file);
      if (!fs.existsSync(envPath)) continue;
      const content = fs.readFileSync(envPath, 'utf8');
      const regex = new RegExp(`^${name}=["']?([^"'\\r\\n]+)["']?`, 'm');
      const match = content.match(regex);
      if (match?.[1]) {
        return match[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch {}

  return '';
}
