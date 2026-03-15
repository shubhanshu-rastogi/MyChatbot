import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const getDataDir = (): string =>
  process.env.CAPTURE_DATA_DIR || path.join(process.cwd(), "data", "submissions");

const resolvePath = (fileName: string): string => path.join(getDataDir(), fileName);

const ensureDir = async (): Promise<void> => {
  await mkdir(getDataDir(), { recursive: true });
};

export const readJsonArray = async <T>(fileName: string): Promise<T[]> => {
  await ensureDir();
  const filePath = resolvePath(fileName);

  try {
    const content = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

export const writeJsonArray = async <T>(fileName: string, payload: T[]): Promise<void> => {
  await ensureDir();
  const filePath = resolvePath(fileName);
  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8");
};

export const appendJsonEntry = async <T>(fileName: string, entry: T): Promise<void> => {
  const list = await readJsonArray<T>(fileName);
  list.push(entry);
  await writeJsonArray(fileName, list);
};
