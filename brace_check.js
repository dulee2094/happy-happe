const fs = require('fs');
const code = fs.readFileSync('dashboard.js', 'utf8');
const lines = code.split('\n');
let d = 0;
for(let i=0; i<lines.length; i++) {
    const line = lines[i];
    // skip comments roughly
    if(line.trim().startsWith('//')) continue;
    let m = (line.match(/\{/g) || []).length;
    let m2 = (line.match(/\}/g) || []).length;
    d += m;
    d -= m2;
    if(d < 0) {
        console.log('Mismatch at line ' + (i+1));
        break;
    }
}
console.log('Final depth: ' + d);
