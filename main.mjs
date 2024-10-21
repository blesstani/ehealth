/*
Copyright 2021 HolyCorn Software
The BGI Swap Project
This module is the entry point for custom code

*/

import fs from 'node:fs'
import libPath from 'path';
import url from 'url';


try {
    await (async () => {

        let init_dir = `${url.fileURLToPath(libPath.dirname(import.meta.url))}/common/init`;

        if (!fs.existsSync('./common/init/')) {
            return console.log(`\n\n\tscripts could be placed in ${init_dir.cyan} that automatically run at system startup \n\n`.bgCyan);
        }

        let scripts = fs.readdirSync(init_dir).map(x => `${init_dir}/${x}`);

        for (var script of scripts) {
            try {
                await import(script);
            } catch (e) {
                console.log(`Error with init script\n${script.red}\n${e.stack || e.message || e}`);
            }
        }

    })()

} catch (e) {
    throw e;
}
