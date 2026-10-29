import { spawn, type ChildProcess } from "node:child_process";

const serverContext = {
  process: undefined as ChildProcess | undefined,
};

function startTestServer() {
  return new Promise<ChildProcess>((resolve, reject) => {
    const serverProcess = spawn("node", ["src/server.ts"], {
      env: { ...process.env, NODE_ENV: "test" },
    });

    serverProcess.stdout?.on("data", (data: Buffer) => {
      if (data.toString().includes("API server listening")) {
        resolve(serverProcess);
      }
    });

    serverProcess.stderr?.on("data", (data: Buffer) => {
      console.error(`[Server Error]: ${data.toString()}`);
    });

    serverProcess.on("error", reject);
  });
}

export async function globalSetup() {
  serverContext.process = await startTestServer();

  process.env.BASE_URL = "http://localhost:4000";
  process.env.APPLICATION_USER_ID =
    process.env.APPLICATION_USER_IDS?.split(",", 1)[0] ?? "";
}

export async function globalTeardown() {
  if (serverContext.process) {
    serverContext.process.kill();
  }
}
