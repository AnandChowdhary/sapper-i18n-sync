# 🌐 Sapper I18N Sync

Utilities for localized URLs in Sapper with built-in i18n support.

## ⭐️ Features

- Use `|slug|`s in Svelte files for i18n
- Language prefixes for URL localization
- Fetch your i18n files from a remote git repository

### Why this package exists

There is no "right" way to do i18n in Sapper (see [sveltejs/sapper#576](https://github.com/sveltejs/sapper/issues/576)). This package is a temporary utility that adds support for language prefixes in URLs and i18n helpers.

For example:

```html
<p>|helloWorld|</p>
```

Is rendered to the English page http://example.com/en/hello:

```html
<p>Hello, world!</p>
```

To do this, the main features are: (i) replacing `|slug|` with translations, and (ii) generating components and routes.

## 💻 Get started

To get started, install the package from npm:

```bash
npm install sapper-i18n-sync
```

Create a script in your Sapper app, for example `scripts/sync-i18n.js`:

```js
const { generateLocales, generateSvelte } = require("sapper-i18n-sync");

async function main() {
  await generateLocales({
    gitRepo: "https://github.com/koj-co/i18n",
    path: "locales",
  });

  await generateSvelte();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

Then add it to your app's `package.json`:

```json
{
  "scripts": {
    "sync:i18n": "node scripts/sync-i18n.js"
  }
}
```

Run `npm run sync:i18n` before your Sapper build/export step. The script clones the remote repository's `locales` directory into your app, then generates localized Svelte components and routes from `src/_components`, `src/_routes`, and `src/_generated`.

## 📄 License

[MIT](./LICENSE) © [Anand Chowdhary](https://anandchowdhary.com)
