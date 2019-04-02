import * as monaco from 'monaco-editor';

let editor: monaco.editor.IStandaloneCodeEditor;

window.MonacoEnvironment = {
	getWorkerUrl: function (_moduleId: any, label: string) {
		if (label === 'json') {
			return 'dist/json.worker.bundle.js';
		}
		if (label === 'css') {
			return 'dist/css.worker.bundle.js';
		}
		if (label === 'html') {
			return 'dist/html.worker.bundle.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return 'dist/ts.worker.bundle.js';
		}
		return 'dist/editor.worker.bundle.js';
    }
};

function start() {
    editor = monaco.editor.create(document.getElementById("editor-container")!, {
        value: "meme",
        language: "javascript"
    });
    layout();
}

function layout() {
    if (editor) {
        editor.layout({
            width: window.innerWidth,
            height: window.innerHeight - 50,
        });
    }
}

window.addEventListener('load', start);
window.addEventListener('resize', layout);
