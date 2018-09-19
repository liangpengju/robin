#!/usr/bin/env node
const program = require('commander');
const glob = require('glob');
const chalk = require('chalk');
const symbols = require('log-symbols');
const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');

program.parse(process.argv);

const contracts = glob.sync('contract/*.ts');
if(!contracts.length){
    console.log(symbols.error,chalk.red('can not found smart contract.'))
    return;
}

// clean token
const buildDir = path.join(process.cwd(),'build');
if(fs.existsSync(buildDir)){
    fs.emptyDirSync(buildDir);
    fs.rmdirSync(buildDir);
    console.log(symbols.success,'trash token');
}

// create token
if(!fs.existsSync(buildDir)){
    fs.mkdirSync(buildDir);
    console.log(symbols.success,'makedir token');
}

for(let i in contracts){
    const contractName = path.parse(contracts[i]).name;
    const cmdArgs = [
        contracts[i],
        '-b',
        `build/${contractName}.wasm`,
        '-g',
        `build/${contractName}.abi`,
        '-O',
        '-t',
        `build/${contractName}.wast`,
        '--validate',
        '--optimize',
        '--noDebug',
        '-l'
    ];
    
    const rs = spawnSync('usc',cmdArgs,{cwd:process.cwd()});
    if(rs.stderr && rs.stderr !== ''){
        let isWarning = false;
        console.log(`warning:${rs.stderr.indexOf('WARNING')}`);
        if(rs.stderr.indexOf('WARNING') !== -1)
            isWarning = true;
        
        if(!isWarning)
            return console.log(symbols.error,chalk.yellow(rs.stderr));

        console.log(symbols.warning,chalk.yellow(rs.stderr));
    }

    if(rs.error){
        console.log(symbols.error,chalk.red(rs.error));
        return false;
    }
}

console.log(symbols.success,'token success');

