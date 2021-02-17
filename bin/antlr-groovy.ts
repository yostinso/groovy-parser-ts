#!/usr/bin/env node

import * as fs from "fs";
import { parseText, createTree, findMethods } from "../index";
import { program } from "commander";

program
.command("parseTree <filename>")
.action((filename: string) => {
    const text = fs.readFileSync(filename).toString();
    const statements = createTree(text);
    console.log(statements);
});

program
.command("findMethods <filename>")
.action((filename: string) => {
    const text = fs.readFileSync(filename).toString();
    console.log(findMethods(text));
});


console.log("Hello");
program.parse();
console.log("Goodbye");