import { CharStreams, CommonTokenStream } from "antlr4ts";
import { GroovyLangLexer as GroovyLexer } from "./GroovyLangLexer";
import { GroovyParserVisitor } from "./parsers/GroovyParserVisitor";
import { GroovyParserListener } from "./parsers/GroovyParserListener";
import MinimalAstBuilder from "./ast/MinimalAstBuilder";
import { GroovyParser } from "./parsers/GroovyParser";
import ListOfStatements from "./ast/stmt/ListOfStatements";
import MethodStatement from "./ast/stmt/MethodStatement";

function getStatements(text: string): ListOfStatements {
    const lexer = parseText(text);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new GroovyParser(tokenStream);
    let astBuilder = new MinimalAstBuilder();
    let result = astBuilder.visit(parser.compilationUnit());
    if (result instanceof ListOfStatements) {
        return result;
    } else {
        throw new Error(`Unexpected result of parsing ${result}`);
    }
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
    let statements = getStatements(text).statements;
    let methods = statements.filter((s) => s instanceof MethodStatement);
    console.log(methods);
}

export {
    GroovyLexer,
    GroovyParser,
    GroovyParserVisitor,
    GroovyParserListener,
    parseText,
    getStatements,
    findMethods
}