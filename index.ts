import { CharStreams, CommonTokenStream } from "antlr4ts";
import { GroovyLangLexer as GroovyLexer } from "./GroovyLangLexer";
import { GroovyParserVisitor } from "./parsers/GroovyParserVisitor";
import { GroovyParserListener } from "./parsers/GroovyParserListener";
import MinimalAstBuilder from "./ast/MinimalAstBuilder";
import { GroovyParser } from "./parsers/GroovyParser";

function createTree(text: string): any {
    const lexer = parseText(text);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new GroovyParser(tokenStream);
    let astBuilder = new MinimalAstBuilder(lexer);
    return astBuilder.visit(parser.compilationUnit());
}

function parseText(text: string): GroovyLexer {
    const stream = CharStreams.fromString(text);
    const lexer = new GroovyLexer(stream);
    return lexer;
}


interface MethodLocation {
    line: number,
    char: number,
    method: string,
    args: string[]
}

interface MethodLocations {
    [line: number]: {
        [char: number]: MethodLocation
    }
}

function findMethods(text: string) {
    const lexer = parseText(text);
    const parser = new GroovyParser(new CommonTokenStream(lexer));
    let astBuilder = new MinimalAstBuilder(lexer);
    let ast = astBuilder.visit(parser.compilationUnit());
    console.log(ast);
}

export {
    GroovyLexer,
    GroovyParser,
    GroovyParserVisitor,
    GroovyParserListener,
    parseText,
    createTree,
    findMethods
}