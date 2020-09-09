import execa from "execa";
import { join } from "path";
import { remove, copy, pathExists } from "fs-extra";

export interface GenerateLocalesParams {
  gitRepo: string;
  path: string;
  tempDir?: string;
  defaultLang?: string;
  cacheBust?: boolean;
}

/**
 * Generate locales from a remote git repo
 * @param params - Options
 */
export const generateLocales = async (params: GenerateLocalesParams) => {
  const tempDir = params.tempDir || "__i18n-temp";

  // Use cached translations
  if (
    !params.cacheBust &&
    (await pathExists(
      join(
        ".",
        tempDir,
        params.defaultLang ? `${params.defaultLang}.json` : "en-ch.json"
      )
    ))
  )
    return;
  await remove(join(".", "locales"));

  console.log("Generating i18n files...");
  await remove(join(".", tempDir));
  await execa("git", ["clone", "--depth", "1", params.gitRepo, tempDir]);
  await copy(join(".", tempDir, "locales"), join(".", "locales"));
};
