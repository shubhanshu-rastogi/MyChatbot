import { mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";

export const setupCaptureSandbox = async (): Promise<string> => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "profile-chatbot-capture-"));
  await writeFile(path.join(dir, "unknown-questions.json"), "[]", "utf-8");
  await writeFile(path.join(dir, "contacts.json"), "[]", "utf-8");
  process.env.CAPTURE_DATA_DIR = dir;
  return dir;
};

export const teardownCaptureSandbox = async (dir: string): Promise<void> => {
  await rm(dir, { recursive: true, force: true });
  delete process.env.CAPTURE_DATA_DIR;
};
