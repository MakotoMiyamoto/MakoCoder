const Discord = require('discord.js');
const Command = require('../command');
const { ProgramMeta, languages } = require('../langutils');
const { Session, sessionMeta } = require('../session/sessionutils');

const fs = require('fs');
const path = require('path');

/** @param {string} content @return {string[]} */
const getCodeBlocks = (content) => {
    let arr = [];
    content = content.replace(/```(.|\n|\r\n)+?```/g, (match) => {
        arr.push(match);
        return '';
    });
    return arr;
};

// i hate this language.
const run = new Command(
    '/run',
    /** @param {Discord.Message} message */ (message) => {
        const blocks = getCodeBlocks(message.content);
        if (blocks.length < 1) {
            message.channel.send({
                embed: {
                    description: 'this is meant to be a helpful embed.',
                },
            });
            return;
        }

        const programMeta = ProgramMeta.resolve(message.content);
        const lang = languages[programMeta.language];
        if (lang) {
            // create session
            // compile
            // todo: option to read compiler stdout
            // if compiler error, send error
            // otherwise, send stdout
            // another todo: compiler args
            // /run c_args="-DUNICODE --static-libc++ std=c++14" cmd_args="--compiler --no-run"
            const session = new Session(message, programMeta);
            const sessionContext = session
                .create()
                .then((dir) => {
                    // build files
                    const programFilepath = `${dir}${path.sep}a.${programMeta.language}`;
                    fs.writeFileSync(programFilepath, programMeta.code, { encoding: 'utf-8' });
                    programMeta.blocks.forEach((block) => {
                        const blockFilepath = `${dir}${path.sep}${block.header}`;
                        // console.log(blockFilepath);
                        fs.writeFileSync(blockFilepath, block.content, { encoding: 'utf-8' });
                    });
                    return dir;
                })
                .catch((err) => console.error(err));
            //sessionContext.then(console.log);
        } else {
            message.channel.send({
                embed: {
                    title: 'Error',
                    description: `${programMeta.language} is not a supported language!`,
                },
            });
        }
    }
);

module.exports = run;
