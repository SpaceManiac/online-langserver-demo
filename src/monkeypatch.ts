import * as monaco from 'monaco-editor';
import {
    MonacoToProtocolConverter, MonacoLanguages, DocumentSelector, CompletionItemProvider,
    MonacoModelIdentifier, ProtocolToMonacoConverter, CompletionItem, CompletionList,
    CompletionTriggerKind
} from 'monaco-languageclient';

// Monkey-patch various protocol conversion from monaco-languageclient which
// appear to be outdated against monaco 0.16 (suspect it is targeting 0.14).

export default function() {
    // `TypeError: monaco.languages.SuggestTriggerKind is undefined`
    // It kind of looks like the Proxy in MonacoLanguageClient constructor is
    // supposed to not ever call this, but it's called anyways.
    MonacoToProtocolConverter.prototype.asTriggerKind = () => CompletionTriggerKind.Invoked;
    MonacoToProtocolConverter.prototype.asCompletionParams = function(model: monaco.editor.IReadOnlyModel, position: monaco.Position, context: monaco.languages.CompletionContext) {
        return Object.assign(this.asTextDocumentPositionParams(model, position), {
            context: this.asCompletionContext(context)
        });
    };

    let asCompletionItem_orig = ProtocolToMonacoConverter.prototype.asCompletionItem;
    ProtocolToMonacoConverter.prototype.asCompletionItem = function(item: CompletionItem): CompletionItem {
        let result: CompletionItem = asCompletionItem_orig.call(this, item) as CompletionItem;
        if (!result.insertText) {
            result.insertText = result.label;
        }
        return result;
    }

    // Outdated: isIncomplete -> incomplete, items -> suggestions.
    ProtocolToMonacoConverter.prototype.asCompletionResult = function(result: CompletionItem[] | CompletionList | null | undefined): monaco.languages.CompletionList {
        if (!result) {
            return {
                incomplete: false,
                suggestions: []
            }
        }
        if (Array.isArray(result)) {
            const suggestions = result.map(item => this.asCompletionItem(item));
            return {
                incomplete: false,
                // @ts-ignore
                suggestions
            }
        }
        return {
            incomplete: result.isIncomplete,
            // @ts-ignore
            suggestions: result.items.map(this.asCompletionItem.bind(this))
        }
    }

    class MonacoLanguagesPatch extends MonacoLanguages {
        createCompletionProvider(selector: DocumentSelector, provider: CompletionItemProvider, ...triggerCharacters: string[]): monaco.languages.CompletionItemProvider {
            return {
                triggerCharacters,
                // monaco-language-client is outdated wrt. monaco: `token` and `context` are switched...
                provideCompletionItems: async (model, position, context, token): Promise<monaco.languages.CompletionList> => {
                    if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                        return this.p2m.asCompletionResult([]);
                    }
                    const params = this.m2p.asCompletionParams(model, position, context);
                    let stuff = await provider.provideCompletionItems(params, token);
                    return await this.p2m.asCompletionResult(stuff);
                },
                // ...and model and position parameters are new here.
                resolveCompletionItem: provider.resolveCompletionItem ? async (model, position, item, token) => {
                    const protocolItem = this.m2p.asCompletionItem(item);
                    const resolvedItem = await provider.resolveCompletionItem!(protocolItem, token);
                    const resolvedCompletionItem = this.p2m.asCompletionItem(resolvedItem);
                    Object.assign(item, resolvedCompletionItem);
                    return item;
                } : undefined
            };
        }
    }
    MonacoLanguages.prototype = MonacoLanguagesPatch.prototype;
}
