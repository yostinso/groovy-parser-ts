#!/usr/bin/env node

import * as fs from "fs";
import { parseText, createTree } from "../index";
import { program } from "commander";

const tokenTypes: [string, number][] = [ ["StringLiteral", 1], ["GStringBegin", 2], ["GStringEnd", 3], ["GStringPart", 4], ["GStringPathPart", 5], ["RollBackOne", 6], ["AS", 7], ["DEF", 8], ["IN", 9], ["TRAIT", 10], ["THREADSAFE", 11], ["VAR", 12], ["BuiltInPrimitiveType", 13], ["ABSTRACT", 14], ["ASSERT", 15], ["BREAK", 16], ["CASE", 17], ["CATCH", 18], ["CLASS", 19], ["CONST", 20], ["CONTINUE", 21], ["DEFAULT", 22], ["DO", 23], ["ELSE", 24], ["ENUM", 25], ["EXTENDS", 26], ["FINAL", 27], ["FINALLY", 28], ["FOR", 29], ["IF", 30], ["GOTO", 31], ["IMPLEMENTS", 32], ["IMPORT", 33], ["INSTANCEOF", 34], ["INTERFACE", 35], ["NATIVE", 36], ["NEW", 37], ["PACKAGE", 38], ["PRIVATE", 39], ["PROTECTED", 40], ["PUBLIC", 41], ["RETURN", 42], ["STATIC", 43], ["STRICTFP", 44], ["SUPER", 45], ["SWITCH", 46], ["SYNCHRONIZED", 47], ["THIS", 48], ["THROW", 49], ["THROWS", 50], ["TRANSIENT", 51], ["TRY", 52], ["VOID", 53], ["VOLATILE", 54], ["WHILE", 55], ["IntegerLiteral", 56], ["FloatingPointLiteral", 57], ["BooleanLiteral", 58], ["NullLiteral", 59], ["RANGE_INCLUSIVE", 60], ["RANGE_EXCLUSIVE", 61], ["SPREAD_DOT", 62], ["SAFE_DOT", 63], ["SAFE_CHAIN_DOT", 64], ["ELVIS", 65], ["METHOD_POINTER", 66], ["METHOD_REFERENCE", 67], ["REGEX_FIND", 68], ["REGEX_MATCH", 69], ["POWER", 70], ["POWER_ASSIGN", 71], ["SPACESHIP", 72], ["IDENTICAL", 73], ["NOT_IDENTICAL", 74], ["ARROW", 75], ["NOT_INSTANCEOF", 76], ["NOT_IN", 77], ["LPAREN", 78], ["RPAREN", 79], ["LBRACE", 80], ["RBRACE", 81], ["LBRACK", 82], ["RBRACK", 83], ["SEMI", 84], ["COMMA", 85], ["DOT", 86], ["ASSIGN", 87], ["GT", 88], ["LT", 89], ["NOT", 90], ["BITNOT", 91], ["QUESTION", 92], ["COLON", 93], ["EQUAL", 94], ["LE", 95], ["GE", 96], ["NOTEQUAL", 97], ["AND", 98], ["OR", 99], ["INC", 100], ["DEC", 101], ["ADD", 102], ["SUB", 103], ["MUL", 104], ["DIV", 105], ["BITAND", 106], ["BITOR", 107], ["XOR", 108], ["MOD", 109], ["ADD_ASSIGN", 110], ["SUB_ASSIGN", 111], ["MUL_ASSIGN", 112], ["DIV_ASSIGN", 113], ["AND_ASSIGN", 114], ["OR_ASSIGN", 115], ["XOR_ASSIGN", 116], ["MOD_ASSIGN", 117], ["LSHIFT_ASSIGN", 118], ["RSHIFT_ASSIGN", 119], ["URSHIFT_ASSIGN", 120], ["ELVIS_ASSIGN", 121], ["CapitalizedIdentifier", 122], ["Identifier", 123], ["AT", 124], ["ELLIPSIS", 125], ["WS", 126], ["NL", 127], ["SH_COMMENT", 128], ["UNEXPECTED_CHAR", 129], ["DQ_GSTRING_MODE", 1], ["TDQ_GSTRING_MODE", 2], ["SLASHY_GSTRING_MODE", 3], ["DOLLAR_SLASHY_GSTRING_MODE", 4], ["GSTRING_TYPE_SELECTOR_MODE", 5], ["GSTRING_PATH_MODE", 6] ];
const typeLookup: { [n: number]: string } = tokenTypes.reduce((h, vk) => {
    return { [vk[1]]: vk[0], ...h };
}, {})


program
.command("parse <file>")
.action((filename: string) => {
    const text = fs.readFileSync(filename).toString();
    const lexer = parseText(text);
    while (!lexer._hitEOF) {
        const oldMode = lexer._mode;
        const t = lexer.nextToken();
        const tType = typeLookup[t.type] || t.type;
        console.log(`>> ${lexer.modeNames[oldMode]}: ${tType}: ${t.text}`);
    }
});

program
.command("parseTree <filename>")
.action((filename: string) => {
    const text = fs.readFileSync(filename).toString();
    const ast = createTree(text);
    //console.log(ast);
});

console.log("Hello");
program.parse();
console.log("Goodbye");