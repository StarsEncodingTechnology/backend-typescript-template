import path from "path";
import os from "os";

export enum CUSTOM_VALIDATION {
  DUPLICATED = "DUPLICATED",
}

export const tempDir = path.resolve(os.tmpdir());
