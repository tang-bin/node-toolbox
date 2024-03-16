/**
 * Node.js only.
 */
export declare class CmdSet {
    fullCmd: string;
    cwd: string;
    title: string;
    listeners: {
        [name: string]: Function | undefined;
    };
}
declare class Cmd {
    verbal: boolean;
    printStderr: boolean;
    exec(fullCmd: string, cwd?: string, title?: string, listeners?: {
        [name: string]: Function | undefined;
    }): Promise<any>;
    parseCmd(fullCmd: string): [string, string[]];
    serial(cmds: any[]): Promise<any>;
}
declare const cmd: Cmd;
export default cmd;
