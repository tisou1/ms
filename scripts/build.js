#!/usr/bin/env node
// @ts-check
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import ts from 'typescript';

const DIR = './dist';

try {
  rmSync(DIR, { recursive: true });
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
// 创建文件夹
mkdirSync(DIR);

// 读取ts配置文件
const { config } = ts.readConfigFile('tsconfig.json', (fileName) => {
  return readFileSync(fileName).toString();
});

// 文件路径
// const sourceFile = join('src', 'index.ts');
const sourceFile = 'src/index.ts';
// cjs
compile([sourceFile], { module: ts.ModuleKind.CommonJS });
// es
compile([sourceFile], {
  module: ts.ModuleKind.ES2020,
  declaration: true,
});

function compile(files, options) {
  const compilerOptions = { ...config.compilerOptions, ...options };
  const host = ts.createCompilerHost(compilerOptions);

  host.writeFile = (fileName, contents) => {
    const isDts = fileName.endsWith('.d.ts');
    // sep 不能兼容windows, 在mac上是可以正常和join进行匹配的
    let path = join(DIR, fileName.split('/')[1]);
    if (!isDts) {
      switch (compilerOptions.module) {
        case ts.ModuleKind.CommonJS: {
          contents +=
            'module.exports = exports.default;\nmodule.exports.default = exports.default;\n';
          path = path.replace(/\.js$/, '.cjs');
          break;
        }
        case ts.ModuleKind.ES2020: {
          path = path.replace(/\.js$/, '.mjs');
          break;
        }
        default:
          throw new Error('Unhandled module type');
      }
    }

    writeFile(path, contents)
      .then(() => {
        console.log('Built', path);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const program = ts.createProgram(files, compilerOptions, host);

  program.emit();
}
