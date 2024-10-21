/*
Copyright 2022 HolyCorn Software
The Donor Forms Project
This is the first script that is started
*/



import colors from 'colors'
colors.enable()
console.log(`\x1Bc
        ${'Copyright 2023'.blue} ${'HolyCorn Software'.cyan}

                The ${'eHealthi'.cyan.bold} Project
`)

if (!import.meta.url) {
    setTimeout(() => {
        console.log(`Run with flag --experimental-import-meta`)
        process.exit()
    }, 2000)
}


import { BasePlatform } from './system/base/platform.mjs';
let platform = new BasePlatform();

import utils from './system/comm/utils/utils.mjs';
import fs from 'fs';
import path from 'path';
const __dirname = path.resolve('.');




//Starting a faculty is very easy
//However, creating a method like this is to ensure that we start faculties just by specifying their names
//That is... provided the faculties are located in /faculty/
let start_faculty = async (faculty_name) => {
    platform.faculties.add(`${__dirname}/faculty/${faculty_name}`)
}


const start = async () => {

    //Initialize the base platform
    await platform.init({ port: await utils.findOpenPort() });

    console.log(`
    Starting faculties
    `)

    //Find and run all faculties
    let faculties = fs.readdirSync('./faculty').filter(x => fs.statSync(`./faculty/${x}`).isDirectory()) //Find them... And filter only the folders

    for (var faculty of faculties) {
        try {
            if (faculty.startsWith('.')) {
                continue
            }
            //Then start them
            start_faculty(faculty);
            await new Promise(x => setTimeout(x, 10))
        } catch (e) { console.log(e) }
    }

    await import('./main.mjs');


}


//Start the system
//However, if there's an error during startup...
start().catch((error) => {
    setTimeout(async () => {
        console.log(`\n\n\tShutting system because of critical error\n\n${error.stack || error.message || error}\n`.bgRed.black)
        platform.exit()
    }, 500); //Then exit gracefully
});

