import path from "path";
import { fileURLToPath } from "url";

export default function getProjectFile(...parts: string[]): string {
  const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
  const __dirname = path.dirname(__filename); // get the name of the directory
  return path.join(__dirname, "..", "..", ...parts);
}
