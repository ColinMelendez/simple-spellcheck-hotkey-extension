import antfu from "@antfu/eslint-config";

export default antfu({
  // formatters: true,
  react: true,
  rules: {
    // allow console.logs
    "no-console": "off",
    // enforce semicolons at the end of statements
    "style/semi": ["off", "always"],
  },
});
