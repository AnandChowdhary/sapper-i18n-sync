import {
  readFile,
  readJson,
  ensureDir,
  writeJson,
  remove,
  ensureFile,
  writeFile,
} from "fs-extra";
import read from "recursive-readdir";
import { join } from "path";
import marked from "marked";

marked.setOptions({
  renderer: new marked.Renderer(),
  pedantic: false,
  gfm: true,
  breaks: true,
  smartypants: true,
});

interface KV {
  [index: string]: string | KV;
}
let languages: string[] = [];

/**
 * Generate the language file for Svelte usage
 * Reads the `locales` directory and generates a list of languages in data/generated
 */
export const generateLanguageFile = async () => {
  const translations: any = {};
  const languageObject: { [index: string]: string } = {};
  languages.forEach((language) => {
    translations[language] = {};
    languageObject[language] = language;
    try {
      translations[language] = readJson(
        join(".", "locales", `${language}.json`)
      );
      languageObject[language] = translations[language]["language.name"];
    } catch (error) {}
  });
  ensureDir(join(".", "src", "data", "generated"));
  writeJson(
    join(".", "src", "data", "generated", "languages.json"),
    languageObject
  );
  return { translations, languageObject };
};

/**
 * Empty components and routes directories
 */
const emptyDirectories = async () => {
  remove(join(".", "src", "components"));
  remove(join(".", "src", "routes"));
  ensureDir(join(".", "src", "components"));
  ensureDir(join(".", "src", "routes"));
};

/**
 * Update a .svelte file with translations
 * @param file - Path to .svelte file
 * @param translations - List of translations
 */
export const updateFile = async (file: string, translations: KV) => {
  // File paths are like src/_components/File.svelte or src/_routes/path.svelte
  // So we normalize them to src/components/File.svelte and src/routes/path.svelte
  let normalizedFilePath = file.split("src/_")[1];
  const prefix = normalizedFilePath.startsWith("routes/")
    ? "routes"
    : "components";
  normalizedFilePath = normalizedFilePath.split(`${prefix}/`)[1];

  let fileContents = await readFile(file, "utf8");

  // Loop through each language and generate corresponding .svelte file
  for await (const language of languages) {
    // Import lines are like `import File from "@/components/File.svelte"`
    // We change it to "components/File.svelte" first, removing the "@"
    let languageFileComponents = fileContents.replace(
      new RegExp("@/", "g"),
      `${"../".repeat(normalizedFilePath.split("/").length)}../`
    );

    // Next, we add the language prefix, so "components/en/File.svelte"
    languageFileComponents = languageFileComponents.replace(
      new RegExp("/components/", "g"),
      `/components/${language}/`
    );

    // Temporarily replace all "||" (logcal OR) with "__or__"
    languageFileComponents = languageFileComponents.replace("||", "__or__");

    // Add translations, e.g., "|hello|" is replaced with "Hello" from i18n files
    // We use marked to support markdown and smart quotes in text
    languageFileComponents = languageFileComponents.replace(
      /\|(.*?)\|/g,
      (_, term) => {
        const val = ((translations[language] as KV)[term] ||
          (translations["en-ch"] as KV)[term]) as string;
        if (val)
          return marked(val)
            .replace(new RegExp("<p>", "g"), "")
            .replace(new RegExp("</p>", "g"), "")
            .replace(/'\b/g, "\u2018")
            .replace(/\b'/g, "\u2019")
            .trim();
        return term === "" ? "||" : term;
      }
    );

    // Revert the replacement back to "||"
    languageFileComponents = languageFileComponents.replace("__or__", "||");

    await ensureFile(join(".", "src", prefix, language, normalizedFilePath));
    await writeFile(
      join(".", "src", prefix, language, normalizedFilePath),
      languageFileComponents
    );
  }
};
