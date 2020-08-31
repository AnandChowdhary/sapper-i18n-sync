import {} from "fs-extra";
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
