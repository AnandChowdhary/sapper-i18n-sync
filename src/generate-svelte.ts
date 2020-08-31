import {
  ensureDir,
  ensureFile,
  readdir,
  readFile,
  readJson,
  remove,
  writeFile,
  writeJson,
} from "fs-extra";
import marked from "marked";
import { join } from "path";
import read from "recursive-readdir";

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
export const generateLanguageFile = async (languages: string[]) => {
  const translations: any = {};
  const languageObject: { [index: string]: string } = {};
  for await (const language of languages) {
    translations[language] = {};
    languageObject[language] = language;
    translations[language] = await readJson(
      join(".", "locales", `${language}.json`)
    );
    translations[language] = await readJson(
      join(".", "locales", `${language}.json`)
    );
    languageObject[language] = translations[language]["language.name"];
  }
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
export const updateFile = async (
  file: string,
  languages: string[],
  translations: KV
) => {
  // File paths are like src/_components/File.svelte or src/_routes/path.svelte
  // So we normalize them to src/components/File.svelte and src/routes/path.svelte
  let normalizedFilePath = file.split("src/_")[1];
  const prefix = normalizedFilePath.startsWith("routes/")
    ? "routes"
    : "components";
  normalizedFilePath = normalizedFilePath.split(`${prefix}/`)[1];

  const fileContents = await readFile(file, "utf8");

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

export const generateSvelte = async () => {
  console.log("Generating components and routes...");

  // Find all languages from the "locales" directory
  const languages = (await readdir(join(".", "locales"))).map(
    (lang) => lang.split(".")[0]
  );

  await emptyDirectories();
  const { translations } = await generateLanguageFile(languages);

  // Find all components and routes and run i18n helpers on them
  const files = [
    ...(await read(join(".", "src", "_components"))),
    ...(await read(join(".", "src", "_routes"))),
  ];
  for await (const file of files) {
    await updateFile(file, languages, translations);
  }

  // A special directory "_routes/root" exists that has routes that don't
  // require any i18n, these are copied to "routes directly"
  const rootRoutes = await read(join(".", "src", "_routes", "root"));
  for await (const route of rootRoutes) {
    const routePath = route.split("src/_routes/root/")[1];
    const fileContents = await readFile(
      join(".", "src", "_routes", "root", routePath),
      "utf8"
    );
    // Change "@/" imports to relative imports using "../../" repetition
    let routeFileComponents = fileContents.replace(
      new RegExp("@/", "g"),
      `${"../".repeat(routePath.split("/").length)}`
    );
    await ensureFile(join(".", "src", "routes", routePath));
    await writeFile(join(".", "src", "routes", routePath), routeFileComponents);
  }

  // A special directory "src/_generated" is used for routes that are
  // generated from API services, we copy these to "routes/:lang" as well
  const generatedRoutes = await read(join(".", "src", "_generated"));
  for await (const route of generatedRoutes) {
    const routePath = route.split("src/_generated/")[1];
    const fileContents = await readFile(
      join(".", "src", "_generated", routePath),
      "utf8"
    );
    for await (const language of languages) {
      await ensureFile(join(".", "src", "routes", language, routePath));
      await writeFile(
        join(".", "src", "routes", language, routePath),
        fileContents
      );
    }
  }

  // Lastly, we remove the language root and generated routes
  for await (const language of languages) {
    await remove(join(".", "src", "routes", language, "root"));
    await remove(join(".", "src", "routes", language, "generated"));
  }
};
generateSvelte();
