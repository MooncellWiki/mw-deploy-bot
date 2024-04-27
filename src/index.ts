import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { argv } from "node:process";
import { Octokit } from "@octokit/rest";
import { EnvHttpProxyAgent, fetch, setGlobalDispatcher } from "undici";
setGlobalDispatcher(new EnvHttpProxyAgent());
const octokit = new Octokit({
  request: {
    fetch,
  },
  log: console,
});
const owner = "MooncellWiki";
const repo = "mw";
mkdirSync("releases", { recursive: true });
if (!argv[2]) {
  throw new Error("must set target dir");
}
const target = argv[2];
if (!argv[3]) {
  throw new Error("must set tag");
}
const tag = argv[3];
async function getReleaseByTag() {
  return octokit.rest.repos.getReleaseByTag({
    owner,
    repo,
    tag,
  });
}
async function download(url: string) {
  const resp = await octokit.request(url, {
    headers: {
      accept: "application/octet-stream",
    },
  });
  writeFileSync(`releases/${tag}.tgz`, Buffer.from(resp.data));
}
async function main() {
  if (!existsSync(`releases/${tag}.tgz`)) {
    console.log(`${tag} not found in local, try download`);
    const release = await getReleaseByTag();
    const asset = release.data.assets.find((v) => v.name === "dist.tgz");
    if (!asset) {
      throw new Error(`${tag}'s asset not found`);
    }
    await download(asset.url);
  } else {
    console.log(`${tag} found in local`);
  }
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }
  const tar = spawn("tar", [
    "--strip-components=1",
    "-xzvf",
    `releases/${tag}.tgz`,
    "-C",
    target,
  ]);
  tar.stdout.on("data", (data) => {
    console.log(data);
  });
  tar.stderr.on("data", (data) => {
    console.error(data);
  });
  tar.on("close", (code) => {
    console.log(`tar exited with code ${code}`);
  });
}

main();
