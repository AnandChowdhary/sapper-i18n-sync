import { options } from "yargs";
import { generateLocales } from "./generate-locales";
import { generateSvelte } from "./generate-svelte";

const argv = options({
  gitRepo: { type: "string" },
  path: { type: "string" },
  tempDir: { type: "string" },
  defaultLang: { type: "string" },
  cacheBust: { type: "boolean" },
}).argv;

if (argv._[0] === "generate-locales") {
  if (argv.gitRepo && argv.path)
    generateLocales({
      gitRepo: argv.gitRepo,
      path: argv.path,
      tempDir: argv.tempDir,
      defaultLang: argv.defaultLang,
      cacheBust: argv.cacheBust,
    });
  else throw new Error("Path and git repo are required");
} else if (argv._[0] === "generate-svelte") {
  generateSvelte();
}

export * from "./generate-locales";
export * from "./generate-svelte";
