declare namespace WebAssembly {
    interface Module {}

    function compile(bufferSource: ArrayBuffer): Promise<Module>;
    function compileStreaming(buffer: Response | Promise<Response>): Promise<Module>;
}

declare interface Window {
    MonacoEnvironment: object;
}
