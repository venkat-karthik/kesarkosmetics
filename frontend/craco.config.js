module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable source-map-loader for firebase to fix ESM path errors
      webpackConfig.module.rules = webpackConfig.module.rules.map((rule) => {
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
        return rule;
      });
      return webpackConfig;
    },
  },
};
