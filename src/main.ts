import * as monaco from 'monaco-editor';
import * as lc from 'monaco-languageclient';

const LANGUAGE_ID = 'dreammaker';
const MODEL_URI = 'inmemory://model.dm';
const MONACO_URI = monaco.Uri.parse(MODEL_URI);

let editor: monaco.editor.IStandaloneCodeEditor;

(window as any).MonacoEnvironment = {
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
    monaco.languages.register({
        id: LANGUAGE_ID,
        aliases: ["dreammaker", "dm"],
        extensions: [".dm", ".dme", ".dmm"],
    });

    editor = monaco.editor.create(document.getElementById("editor-container")!, {
        value: "meme",
        language: "dreammaker",
        glyphMargin: true,
    });
    layout();
    window.addEventListener('resize', layout);

    lc.MonacoServices.install(editor);
}

function layout() {
    editor.layout({
        width: window.innerWidth,
        height: window.innerHeight - 50,
    });
}

function getModel(): monaco.editor.IModel {
    return monaco.editor.getModel(MONACO_URI)!;
}

function createDocument(model: monaco.editor.IReadOnlyModel) {
    return lc.TextDocument.create(MODEL_URI, model.getModeId(), model.getVersionId(), model.getValue());
}

window.addEventListener('load', start);
