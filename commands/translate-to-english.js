const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

require('dotenv').config();

const OxfordApi = require('oxford-dictionaries-api');
const app_id = process.env.OXFORD_ID;
const app_key = process.env.OXFORD_KEY;
const oxford = new OxfordApi(app_id, app_key);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription("Translation for a word")
        .addStringOption(option => option.setName('word').setDescription("Word to be translated"))
        .addStringOption(option => option.setName('language').setDescription("Form of the word")),

    execute: async (interaction) => {
        await interaction.deferReply();

        const word = interaction.options.getString('word');
        let language = interaction.options.getString('language');
        
        language = normalizeLanguage(language);

        let data, results;

        try {
            data = await oxford.translation({source_lang: language.toLowerCase(), target_lang: 'en', word_id: word.toLowerCase()});
            results = getResults(data);
        }
        catch(error) {
            console.log(`Cannot retrieve data for '${word.toLowerCase()}'`);
        }
        
        const embeds = createTranslationUI(data, results);

        if (embeds.length === 0) {
            return await interaction.editReply(`Cannot find any translation for the word **${word.toLowerCase()}** with the given language`);
        }

        let currentPage = 0; 
        let buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('buttonPrev')
                .setDisabled(true)
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('buttonNext')
                .setLabel('Next')
                .setDisabled((embeds.length === 1) ? true : false)
                .setStyle(ButtonStyle.Primary),
        )


        const firstPage = await interaction.editReply({
        embeds: [embeds[currentPage]],
        components: [buttonRow],
        })
        let pageFilter = i => i.customId === ('buttonPrev' || 'buttonNext') && i.user.id === interaction.user.id;
        let pageCollector = await firstPage.createMessageComponentCollector({pageFilter});
        pageCollector.on('collect', async (i) => {
            if (i.customId === 'buttonPrev') {
                currentPage--;
                if (buttonRow.components[1].data.disabled) {
                    buttonRow.components[1].setDisabled(false);
                }
                if (currentPage === 0) {
                    buttonRow.components[0].setDisabled(true);
                }
            }
            else if (i.customId === 'buttonNext') {
                currentPage++;
                if (buttonRow.components[0].data.disabled) {
                    buttonRow.components[0].setDisabled(false);
                }
                //last page
                if (currentPage === embeds.length-1) {
                    buttonRow.components[1].setDisabled(true);
                }
            }

            //update
            await i.update({
                embeds: [embeds[currentPage]],
                components: [buttonRow],
            })
        })
    }
}

function getResults(data) {
    let results = [];

    data.results.forEach(result => {
        results.push(result);
    })

    return results;
}

function getLexicalEntry(result) {
    let lexicalEntry;

    lexicalEntry = result.lexicalEntries[0];

    return lexicalEntry;
}

function createTranslationUI(data, results) {
    let embeds = [];
    let form;

    for (let i = 0; i < results.length; i++) {
        let lexicalEntry = getLexicalEntry(results[i]);

        if (lexicalEntry === undefined) {
            continue;
        }

        form = lexicalEntry.lexicalCategory.text.toLowerCase();
        let translationSubLists = [];
        let translationList = listTranslations(lexicalEntry);
        //split list into n sublists (value of a field can only be at max 1024 characters long)
        const requiredTranslationSubLists = Math.ceil(translationList.length/950);
        //index of last character in previous sublist
        let jPrev;
        for (let i = 0; i < requiredTranslationSubLists; i++) {
            let j = 1;
            if (translationList[(i+1)*950] != ('' || '\n')) {
                while (translationList[(i+1)*950-j] != ('' || '\n')) {
                    //index is currently on an example
                    if (translationList[(i+1)*950-j] === '*' && translationList[(i+1)*950-j-4] === '•') {
                        //move index backwards to the first character before example
                        j += 5;
                        break;
                    }
                    
                    j++;   
                }
            }
            let translationSubList;
            if (i === 0) {
                translationSubList = translationList.slice(0, (i+1)*950-j);
            }
            else {
                translationSubList = translationList.slice((i+1)*950 - 950 - jPrev, (i+1)*950-j);
            }
            jPrev = j;
            translationSubLists.push(translationSubList);
        }

        let embed = new EmbedBuilder()
            .setTitle(`${data.word} (*${form}*)`)

        for (let i = 0; i < requiredTranslationSubLists; i++) {
            embed.addFields(
                {
                    name: (i === 0) ? 'Definitions' : '\u200b',
                    value: translationSubLists[i],
                }
            )
        }
        embeds.push(embed);
    }

    return embeds;
}

function listTranslations(lexicalEntry) {
    let translationList = "";
    let count = 1;
    let senses = [];

    lexicalEntry.entries.forEach(entry => {
        entry.senses.forEach(sense => {
            senses.push(sense);
        })
    })

    senses.forEach(sense => {
        //there are subsenses
        if (sense.subsenses) {
            sense.subsenses.forEach(subsense => {
                if (subsense.translations) {
                    subsense.translations.forEach(translation => {
                        translationList += `${count++}. ${translation.text}\n\n`;
                        //there are examples
                        if (subsense.examples) { 
                            let exampleCount = 0;
                            //max of 2 examples for each subsense
                            while (exampleCount < subsense.examples.length && exampleCount < 2) {
                                let example = subsense.examples[exampleCount];
                                translationList += `‎ ‎ ‎ ‎ • ‎ ‎ *${capitalizeFirstLetter(example.text)}*\n\n`;
                                exampleCount++;
                            }
                        }
                    })
                }
            })
        }
        else {
            if (sense.translations) {
                sense.translations.forEach(translation => {
                    translationList += `${count++}. ${translation.text}\n\n`;
                    if (sense.examples) {
                        sense.examples.forEach(example => {
                            translationList += `‎ ‎ ‎ ‎ • ‎ ‎ *${capitalizeFirstLetter(example.text)}*\n\n`;
                        })
                    }
                })
            }
        }
    })

    return translationList;
}

function capitalizeFirstLetter(string) {
    let newString = string[0].toUpperCase() + string.slice(1);
    return newString;
}

function normalizeLanguage(language) {
    switch (language.toLowerCase()) {
        case 'ger':
        case 'german':
            language = 'de';
            break;

        case 'spanish':
            language = 'es';
            break;

        case 'russian':
            language = 'ru';
            break;
    }

    return language;
}