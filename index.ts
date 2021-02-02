import { CharStreams, CommonTokenStream } from "antlr4ts";
import { GroovyLangLexer as GroovyLexer } from "./GroovyLangLexer";
import { CompilationUnitContext, GroovyParser } from "./parsers/GroovyParser";

function createTree(text: string): CompilationUnitContext {
    const lexer = parseText(text);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new GroovyParser(tokenStream);
    return parser.compilationUnit();
}

function parseText(text: string): GroovyLexer {
    const stream = CharStreams.fromString(text);
    const lexer = new GroovyLexer(stream);
    return lexer;
}


export {
    GroovyLexer,
    GroovyParser,
    parseText,
    createTree
}