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

To create a `locales` directory from a remote git repository:

```ts
import { generateLocales } from "sapper-i18n-sync";
generateLocales({
  gitRepo: "https://github.com/koj-co/i18n",
  path: "locales",
})
```

Then, generate:

```ts
import { generateSvelte } from "sapper-i18n-sync";
generateSvelte();
```

## 📄 License

[MIT](./LICENSE) © [Anand Chowdhary](https://anandchowdhary.com)
