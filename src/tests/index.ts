import test from "node:test";
import * as child_process from "child_process";
import * as path from "path";
import assert from "assert";
import { SuperviseControl, SuperviseStatus } from "../api.js";

const _wait = (ms: number) => new Promise(r => setTimeout(r,ms));

process.chdir("services");
const svscan = child_process.fork(path.join(__dirname, "../svscan.js"));
test.describe("Test status", async t => {
    await _wait(2000);
    const directory = path.join(process.cwd(), "testService2");
    await test.it("Default state", async (t) => {
        const status = await SuperviseStatus.checkStatus(directory);
        assert.strictEqual(status.is, "down");
        assert.strictEqual(status.wants, "down");
        assert.strictEqual(status.pid, -1);
        assert.strictEqual(status.time, 0);
    });
    await test.it("Set wants to true", async () => {
        await SuperviseControl.setWants(directory, true);
        await _wait(6000);
        const status = await SuperviseStatus.checkStatus(directory);
        assert.strictEqual(status.is, "down");
        assert.strictEqual(status.wants, "up");
        assert.strictEqual(status.pid, -1);
        assert.strictEqual(status.time, 0);
    });
    await test.it("Start", async (t) => {
        await SuperviseControl.start(directory);
        await _wait(6000);
        const status = await SuperviseStatus.checkStatus(directory);
        assert.strictEqual(status.is, "up");
        assert.strictEqual(status.wants, "up");
    });
    await test.it("Sets wants to down", async () => {
        await SuperviseControl.setWants(directory, false);
        await _wait(6000);
        const status = await SuperviseStatus.checkStatus(directory);
        assert.strictEqual(status.is, "up");
        assert.strictEqual(status.wants, "down");
    });
    await test.it("Kill it with SIGTERM", async () => {
        await SuperviseControl.kill(directory, "SIGTERM");
        await _wait(6000);
        const status = await SuperviseStatus.checkStatus(directory);
        assert.strictEqual(status.is, "down");
        assert.strictEqual(status.wants, "down");
    });
    await test.it("Kill it with SIGINT", { skip: true }, async () => {
        // DEACTIVATED DUE TO BASH SHENANIGANS
        await SuperviseControl.start(directory);
        await _wait(6000);
        await SuperviseControl.kill(directory, "SIGINT");
        await _wait(6000);
        const status = await SuperviseStatus.checkStatus(directory);
        assert.strictEqual(status.is, "down");
        assert.strictEqual(status.wants, "down");
    });
    await test.it("Kill it with SIGKILL", async () => {
        await SuperviseControl.start(directory);
        await _wait(6000);
        await SuperviseControl.kill(directory, "SIGKILL");
        await _wait(6000);
        const status = await SuperviseStatus.checkStatus(directory);
        assert.strictEqual(status.is, "down");
        assert.strictEqual(status.wants, "down");
    });
}).then(() => {
    svscan.kill("SIGTERM");
});