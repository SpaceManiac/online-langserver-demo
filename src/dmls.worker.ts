import langserver from '../bin/dm_langserver.js';

let backlog: MessageEvent[] = [];
onmessage = (event: MessageEvent) => backlog.push(event);

function realOnMessage(event: MessageEvent) {
    let source = new TextEncoder().encode(event.data);
    let len = source.byteLength;
    let ptr = Module._malloc(len);
    let target = new Uint8Array(Module.wasmMemory.buffer, ptr, len);
    target.set(source);
    Module._handle_input(ptr, len);
    Module._free(ptr);
}

interface Module {
    wasmMemory: {
        buffer: ArrayBuffer;
    };

    // imports
    _handle_input(ptr: number, len: number): void;
    _malloc(size: number): number;
    _free(ptr: number): void;
}

let Module: Module = langserver({
    locateFile: (x: string) => "../bin/" + x,
    postRun: () => {
        for (let message of backlog) {
            realOnMessage(message);
        }
        onmessage = realOnMessage;
        backlog = [];
    },

    // exports
    handle_output: (ptr: number, len: number) => {
        postMessage(new TextDecoder("utf-8").decode(new Uint8Array(Module.wasmMemory.buffer, ptr, len)));
    },
});
