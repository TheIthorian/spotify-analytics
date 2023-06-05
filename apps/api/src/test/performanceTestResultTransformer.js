/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const data = require(__dirname + '/performanceTesting/performance.json');

const filteredData = [];

for (const test of data) {
    let maxUsage = 0;
    let maxMem;
    if (test.memLog) {
        for (const mem of test.memLog) {
            maxUsage = Math.max(maxUsage, mem.memory.rss);
            maxMem = mem.memory.heapUsed;
        }

        test.maxMem = maxMem / 1024 / 1024;
        delete test.memLog;
        filteredData.push(test);
    }
}

process.stdout.write(filteredData);
fs.writeFileSync(__dirname + '/performanceTesting/performance.json', JSON.stringify(filteredData, null, 2));
