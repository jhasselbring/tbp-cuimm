#!/usr/bin/env node

import minimist from 'minimist';
const args = minimist(process.argv.slice(2), {
    alias: {
        f: 'file',
        d: 'directory'
    }
});


if (args.file || args.f) {
    const filePath = args.file || args.f;
    if (shouldSkipFile(filePath)) {
        console.log(`Skipping: ${filePath} (unsupported file type)`);
    } else {
        console.log(`Processing single file: ${filePath}`);
        searchModelByHash(filePath);
    }
} else if (args.directory || args.d) {
    const dirPath = args.directory || args.d;
    console.log(`Processing directory: ${dirPath}`);
    processDirectory(dirPath);
} else {
    // Use current working directory as default
    const currentDir = process.cwd();
    console.log(`No arguments provided. Using current directory: ${currentDir}`);
    processDirectory(currentDir);
}
