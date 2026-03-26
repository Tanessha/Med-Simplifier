module.exports = {
  apps: [
    {
      name: "scan-scribe-api",
      cwd: "./backend",
      script: "index.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 8082,
      },
    },
  ],
};
