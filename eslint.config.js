import antfu from '@antfu/eslint-config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import oxlint from 'eslint-plugin-oxlint'

// TIP: to view which rules are enabled, run `pnpx @eslint/config-inspector`

export default antfu({
  // additional plugins
  plugins: {
    'better-tailwindcss': eslintPluginBetterTailwindcss,
  },
  settings: {
    'better-tailwindcss': {
      entryPoint: 'assets/tailwind.css',
    },
  },
  // Use prettier to format files that eslint can not handle (html, css, markdown)
  formatters: {
    html: 'prettier',
    css: 'prettier',
    markdown: 'prettier',
  },
  // Define path to tsconfig to enable type-aware rules
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  // Enable react rules
  react: true,
  // Modify or add specific rule settings for eslint rules & packages covered by antfu-eslint
  rules: {
    // allow console.logs
    'no-console': 'off',

    // lambda functions should always use argument parenthesis (two overlapping rules)
    'style/arrow-parens': ['error', 'always'],

    // I prefer to use arrow-functions at all times
    'antfu/top-level-function': 'off',

    // I prefer to control when I omit "new" when throwing errors
    'unicorn/throw-new-error': 'off',

    // make unused values warnings instead of errors for less visual noise while coding
    'unused-imports/no-unused-vars': 'warn',

    // allow for redeclarations to enable type and interface shadowing (useful for schemas)
    'ts/no-redeclare': 'off',

    // allow for things to be called "use" because it's a common effect pattern
    'react-hooks-extra/no-unnecessary-use-prefix': 'off',

    // allow inline type import specifiers
    'import/consistent-type-specifier-style': 'off',

    // use the recommended rules from the better-tailwindcss plugin
    ...eslintPluginBetterTailwindcss.configs.recommended.rules,

    // break tailwindcss classnames into multiple lines when they have different group prefixes
    'better-tailwindcss/enforce-consistent-line-wrapping': ['warn', {
      printWidth: 200,
      classesPerLine: 0,
      group: 'newLine',
    }],

    // force all external variables used in tailwindcss classnames to use the same syntax pattern
    'better-tailwindcss/enforce-consistent-variable-syntax': ['warn', {
      syntax: 'arbitrary',
    }],
  },
}).append(
  // oxlint compat plugin needs to come after everything else so that it can properly override rules
  oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
)
