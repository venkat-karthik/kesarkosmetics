module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules = webpackConfig.module.rules.map((rule) => {
        // Fix 1: Disable source-map-loader for firebase to fix ESM path errors
        if (rule.enforce === "pre" && rule.use) {
          const uses = Array.isArray(rule.use) ? rule.use : [rule.use];
          const hasSourceMapLoader = uses.some(
            (u) => (typeof u === "string" && u.includes("source-map-loader")) ||
                   (u && u.loader && u.loader.includes("source-map-loader"))
          );
          if (hasSourceMapLoader) {
            return {
              ...rule,
              exclude: [
                ...(Array.isArray(rule.exclude) ? rule.exclude : rule.exclude ? [rule.exclude] : []),
                /node_modules\/firebase/,
                /node_modules\/@firebase/,
              ],
            };
          }
        }

        // Fix 2: Disable url() resolution in css-loader so absolute public/ paths
        // like url('/background1.jpeg') are not treated as webpack modules.
        // We must only patch the css-loader entry, not postcss-loader.
        if (rule.oneOf) {
          rule.oneOf = rule.oneOf.map((oneOfRule) => {
            if (!oneOfRule.use) return oneOfRule;
            const uses = Array.isArray(oneOfRule.use) ? oneOfRule.use : [oneOfRule.use];
            const hasCssLoader = uses.some(
              (u) =>
                (typeof u === "string" && u.includes("css-loader") && !u.includes("postcss")) ||
                (u && u.loader && u.loader.includes("css-loader") && !u.loader.includes("postcss"))
            );
            if (!hasCssLoader) return oneOfRule;

            return {
              ...oneOfRule,
              use: uses.map((u) => {
                const loaderPath =
                  typeof u === "string" ? u : u && u.loader ? u.loader : "";
                // Only patch css-loader, not postcss-loader
                if (loaderPath.includes("css-loader") && !loaderPath.includes("postcss")) {
                  return {
                    ...(typeof u === "object" ? u : { loader: u }),
                    options: {
                      ...((typeof u === "object" && u.options) || {}),
                      url: false,
                    },
                  };
                }
                return u;
              }),
            };
          });
        }

        return rule;
      });
      return webpackConfig;
    },
  },
};
