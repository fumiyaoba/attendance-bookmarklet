const fs = require("fs");
const path = require("path");

const srcPath = path.join(__dirname, "src", "main.js");
const distPath = path.join(__dirname, "dist", "bookmarklet.txt");

let code = fs.readFileSync(srcPath, "utf8");

// コメント除去
code = code.replace(/\/\/.*$/gm, "");

// 改行除去（CRLF / LF 両対応）
code = code.replace(/[\r\n]+/g, "");

// 余分な空白を整理
code = code.replace(/\s+/g, " ");

const bookmarklet =
  `javascript:void(async()=>{${code};await main();})();`;

fs.mkdirSync(path.dirname(distPath), { recursive: true });
fs.writeFileSync(distPath, bookmarklet);

console.log("✔ bookmarklet.txt generated");
