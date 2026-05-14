import { config } from 'dotenv';

const mountPath = process.env.MOUNT_ENV_PATH;

if (mountPath) {
  const result = config({ path: mountPath, override: true });
  if (result.error) {
    throw new Error(
      `Failed to load env from ${mountPath}: ${result.error.message}`,
    );
  }
} else {
  config();
}
