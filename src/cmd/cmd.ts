import { spawn } from "child_process";
import { timeUtil } from "@btang/ts-toolbox";
import out from "./out.js";

/**
 * Node.js only.
 */
export class CmdSet {
    public fullCmd: string = "";
    public cwd: string = "";
    public title: string = "";
    public listeners: { [name: string]: Function | undefined } = {
        onStdout: undefined,
        onStderr: undefined,
        onError: undefined,
    };
}

class Cmd {
    public verbal: boolean = false;
    public printStderr: boolean = false;

    public exec(
        fullCmd: string,
        cwd?: string,
        title?: string,
        listeners?: { [name: string]: Function | undefined }
    ): Promise<any> {
        const startTime = new Date().getTime();

        if (title) {
            out.line("   " + title, true, false);
            if (!this.verbal) out.startSpinner(true);
        }

        if (this.verbal) {
            out.line("[yellow][SPAWN]:[/yellow] " + fullCmd);
        }

        const [cmd, argv] = this.parseCmd(fullCmd),
            options: { [key: string]: any } = {};
        if (cwd) options.cwd = cwd;

        return new Promise((resolve, reject) => {
            const proc = spawn(cmd, argv, options);
            proc.stdout.on("data", (data) => {
                if (this.verbal) out.line(data, false, false);
                listeners?.onStdout?.call(null, data.toString());
            });
            proc.stderr.on("data", (data) => {
                if (this.printStderr) {
                    out.line("[red]stderr:[/red] " + data, false, false);
                }
                listeners?.onStderr?.call(null, data.toString());
            });
            proc.on("error", (err) => listeners?.onError?.call(null, err));
            proc.on("close", (code) => {
                if (this.verbal) {
                    out.line("[SPAWN Close]: " + code);
                }
                if (code === 0) {
                    // end without error.
                    if (!this.verbal) {
                        const endTime = new Date().getTime(),
                            durStr = timeUtil.formatDuring(endTime - startTime),
                            duration = `[${durStr}]`;
                        out.stopSpinner();
                        out.prefix(out.successMark);
                        out.append(duration, true);
                    }
                    resolve(code);
                } else {
                    // end with error.
                    if (!this.verbal) {
                        out.stopSpinner();
                        out.prefix(out.failedMark, true);
                    }
                    reject(code);
                }
            });
        });
    }

    public parseCmd(fullCmd: string): [string, string[]] {
        const input = fullCmd
                .split(" ")
                .map((s) => String(s || "").trim())
                .filter((s) => s),
            cmd = input[0],
            args = input.slice(1);
        return [cmd, args];
    }

    public serial(cmds: any[]): Promise<any> {
        let result = Promise.resolve();
        cmds.forEach((d: any[]) => {
            result = result.then(() => this.exec(d[0], d[1], d[2], d[3]));
        });
        return result;
    }
}

const cmd = new Cmd();
export default cmd;
