import execa from "execa";
import { join } from "path";
import { remove, copy, pathExists } from "fs-extra";

export interface GenerateLocalesParams {
  gitRepo: string;
  path: string;
}

export const generateLocales = async (params: GenerateLocalesParams) => {
  join("");
};
