import { defineRailway, github, postgres, preserve, project, service } from "railway/iac";

export default defineRailway(() => {
  const database = postgres("Postgres");

  const web = service("36Stories", {
    source: github("Jamongkad/36Stories", { branch: "main" }),
    build: "npm run build",
    start: "npm start",
    preDeploy: "npm run deploy:prepare",
    healthcheck: "/api/health",
    healthcheckTimeout: 100,
    deploy: {
      restartPolicyType: "ON_FAILURE",
    },
    env: {
      DATABASE_URL: database.env.DATABASE_URL,
      RAILPACK_NODE_NPM_INSTALL: "npm ci",

      // Safe to commit: this is the public production origin.
      BETTER_AUTH_URL: "https://36stories.app",

      // These secrets stay in Railway and are retained by IaC without exposing them here.
      BETTER_AUTH_SECRET: preserve(),
      NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: preserve(),
    },
  });

  return project("36Stories", { resources: [database, web] });
});
