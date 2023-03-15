const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

require('dotenv').config();

const OxfordApi = require('oxford-dictionaries-api');
const app_id = process.env.OXFORD_ID;
const app_key = process.env.OXFORD_KEY;
const oxford = new OxfordApi(app_id, app_key);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('define')
        .setDescription("Look up definition of a word")
        .addStringOption(option => option.setName('word').setDescription("Word to be defined"))
        .addStringOption(option => option.setName('form').setDescription("Form of the word").setRequired(false)),

    execute: async (interaction) => {
        await interaction.deferReply();
        
        const word = interaction.options.getString('word');
        const form = interaction.options.getString('form');

        let lemmas;
        try {
            lemmas = await oxford.lemmas({word_id: word.toLowerCase()}); 
            word = lemmas.results[0].lexicalEntries[0].inflectionOf[0].id;
        }
        catch(error) {
            console.log(`Requested by ${interaction.user.tag}: lemmas for word '${word.toLowerCase()}' not found`)
        }
        
        let data, results;
        try {
            if (form) {
               data = await oxford.entries({word_id: word.toLowerCase(), lexicalCategory: [`${form.toLowerCase()}`]});
            }
            else {
                data = await oxford.entries({word_id: word.toLowerCase()});
            }
            results = getResults(data);   
        }
        catch(error) {
            console.log(`Cannot retrieve data for '${word.toLowerCase()}'`);
            return;
        }
        
        //synonyms and antonyms 
        let thesaurus, thesaurusResults;

        try {
            thesaurus = await oxford.thesaurus({word_id: word.toLowerCase()});
            thesaurusResults = getThesaurusResults(thesaurus);
        }
        catch(error) {
            console.log(`Requested by ${interaction.user.tag}: synonyms and antonyms for word '${word.toLowerCase()}' not found`);
        }
        const embeds = createDictionaryUI(data, results, thesaurusResults);

        if (embeds.length === 0) {
            return await interaction.editReply(`Cannot find any entry of the word **${word.toLowerCase()}** with the given form`);
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
        if (embeds[embeds.length-1].data.fields[0].name === 'Idioms' || embeds.length >= 2 && embeds[embeds.length-2].data.fields[0].name === 'Idioms') {
            buttonRow.addComponents(
                new ButtonBuilder()
                    .setCustomId('buttonPhrases')
                    .setLabel('Idioms/Phrases')
                    .setStyle(ButtonStyle.Secondary),
            )
        }
        if (embeds[embeds.length-1].data.fields[0].name === 'Phrasal Verbs') {
            buttonRow.addComponents(
                new ButtonBuilder()
                    .setCustomId('buttonPhrasalVerbs')
                    .setLabel('Phrasal Verbs')
                    .setStyle(ButtonStyle.Secondary),
            )
        }
        
        const firstPage = await interaction.editReply({
            embeds: [embeds[currentPage]],
            components: [buttonRow],
        })
        let pageFilter = i => i.customId === ('buttonPrev' || 'buttonNext' || 'buttonPhrases' || 'buttonPhrasalVerbs')  && i.user.id === interaction.user.id;
        let pageCollector = await firstPage.createMessageComponentCollector({pageFilter});
        pageCollector.on('collect', async (i) => {
            if (i.customId === 'buttonPrev') {
                if (buttonRow.components[1].data.disabled) {
                    buttonRow.components[1].setDisabled(false);
                }

                if (embeds[currentPage].data.fields[0].name === 'Idioms') {
                    buttonRow.components[2].setDisabled(false);
                }
                else if (embeds[currentPage].data.fields[0].name === 'Phrasal Verbs') {
                    //disable phrases (move to phrases lol)
                    buttonRow.components[2].setDisabled(true);
                    buttonRow.components[3].setDisabled(false);
                }

                currentPage--;
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
                if (embeds[currentPage].data.fields[0].name === 'Idioms') {
                    buttonRow.components[2].setDisabled(true);
                }
                else if (embeds[currentPage].data.fields[0].name === 'Phrasal Verbs') {
                    //there are idioms => 4 buttons
                    if (embeds[currentPage-1].data.fields[0].name === 'Idioms') {
                        buttonRow.components[3].setDisabled(true);
                        buttonRow.components[2].setDisabled(false);
                    }
                    //no idiom => 3 buttons 
                    else {
                        buttonRow.components[2].setDisabled(true);
                        buttonRow.components[1].setDisabled(true);
                    }
                }
            }
            else if (i.customId === 'buttonPhrases') {
                //disable phrases
                buttonRow.components[2].setDisabled(true);
                if (buttonRow.components[0].data.disabled) {
                    buttonRow.components[0].setDisabled(false);
                }

                if (embeds[embeds.length-1].data.fields[0].name === 'Idioms') {
                    currentPage = embeds.length-1;
                    //disable next
                    buttonRow.components[1].setDisabled(true);
                }

                else if (embeds[embeds.length-2].data.fields[0].name === 'Idioms') {
                    currentPage = embeds.length-2;
                    if (buttonRow.components[1].data.disabled) {
                        buttonRow.components[1].setDisabled(false);
                    }
                    if (buttonRow.components[3].data.disabled) {
                        buttonRow.components[3].setDisabled(false);
                    }
                }
            }
            else if (i.customId === 'buttonPhrasalVerbs') {
                currentPage = embeds.length-1;
                
                buttonRow.components[1].setDisabled(true);
                //there are idioms => 4 buttons
                if (embeds[currentPage-1].data.fields[0].name === 'Idioms') {
                    buttonRow.components[3].setDisabled(true);
                    if (buttonRow.components[2].data.disabled) {
                        buttonRow.components[2].setDisabled(false);
                    }
                }
                else {
                    buttonRow.components[2].setDisabled(true);
                }
                if (buttonRow.components[0].data.disabled) {
                    buttonRow.components[0].setDisabled(false);
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

function getThesaurusResults(thesaurus) {
    let results = [];
    
    thesaurus.results.forEach(result => {
        results.push(result);
    })

    return results;
}

function getLexicalEntry(result) {
    let lexicalEntry;

    lexicalEntry = result.lexicalEntries[0];

    return lexicalEntry;
}

function createDictionaryUI(data, results, thesaurusResults) {
    let embeds = [];
    let form;

    for (let i = 0; i < results.length; i++) {
        let lexicalEntry = getLexicalEntry(results[i]);
        //there can be fewer thesaurus results than results
        let thesaurusLexicalEntry;
        if (thesaurusResults && thesaurusResults[i] != undefined) {
            thesaurusLexicalEntry = getLexicalEntry(thesaurusResults[i]);
        }
        if (lexicalEntry === undefined) {
            continue;
        }

        form = lexicalEntry.lexicalCategory.text.toLowerCase();
        let definitionSubLists = [];
        let definitionList = listDefinitions(lexicalEntry);
        //split list into n sublists (value of a field can only be at max 1024 characters long)
        const requiredDefinitionSubLists = Math.ceil(definitionList.length/950);
        //index of last character in previous sublist
        let jPrev;
        for (let i = 0; i < requiredDefinitionSubLists; i++) {
            let j = 1;
            if (definitionList[(i+1)*950] != ('' || '\n')) {
                while (definitionList[(i+1)*950-j] != ('' || '\n')) {
                    //index is currently on an example
                    if (definitionList[(i+1)*950-j] === '*' && definitionList[(i+1)*950-j-4] === '•') {
                        //move index backwards to the first character before example
                        j += 5;
                        break;
                    }
                    
                    j++;   
                }
            }
            let definitionSubList;
            if (i === 0) {
                definitionSubList = definitionList.slice(0, (i+1)*950-j);
            }
            else {
                definitionSubList = definitionList.slice((i+1)*950 - 950 - jPrev, (i+1)*950-j);
            }
            jPrev = j;
            definitionSubLists.push(definitionSubList);
        }

        let embed = new EmbedBuilder()
            .setTitle(`${data.word} (*${form}*)`)
            .addFields(
                {
                    name: 'Pronunciations',
                    value: (lexicalEntry.lexicalCategory.id != 'residual') ? `${listPronunciations(lexicalEntry)}` : "\u200b", 
                }, 
            )
        for (let i = 0; i < requiredDefinitionSubLists; i++) {
            embed.addFields(
                {
                    name: (i === 0) ? 'Definitions' : '\u200b',
                    value: definitionSubLists[i],
                }
            )
        }

        let synonymList = (thesaurusLexicalEntry != undefined) ? listSynonyms(thesaurusLexicalEntry) : "";
        let antonymList = (thesaurusLexicalEntry != undefined) ? listAntonyms(thesaurusLexicalEntry) : "";
        if (synonymList.length != 0) {
            embed.addFields(
                {
                    name: 'Synonyms',
                    value: synonymList,
                },
            )
        }

        if (antonymList.length != 0) {
            embed.addFields(
                {
                    name: 'Antonyms',
                    value: antonymList,
                }
            )
        }        
        embeds.push(embed);
    }

    let phrasalList = listIdiomsAndPhrasalVerbs(results);
    if (phrasalList.idiomList.length != 0) {
        let idiomSubLists = [];
        const requiredIdiomSubLists = Math.ceil(phrasalList.idiomList.length/950);
        for (let i = 0; i < requiredIdiomSubLists; i++) {
            let j = 1;
            if (phrasalList.idiomList[(i+1)*950] != ('' || '\n')) {
                while (phrasalList.idiomList[(i+1)*950-j] != ('' || '\n')) {        
                    j++;   
                }
            }
            let idiomSubList;
            if (i === 0) {
                idiomSubList = phrasalList.idiomList.slice(0, (i+1)*950-j);
            }
            else {
                idiomSubList = phrasalList.idiomList.slice((i+1)*950 - 950 - jPrev, (i+1)*950-j);
            }
            jPrev = j;
            idiomSubLists.push(idiomSubList);
        }

        let embedIdioms = new EmbedBuilder()
            .setTitle(`${data.word} (*${form}*)`)

        for (let i = 0; i < requiredIdiomSubLists; i++) {
            embedIdioms.addFields(
                {
                    name: (i === 0) ? 'Idioms' : '\u200b',
                    value: idiomSubLists[i],
                }
            )
        }
        embeds.push(embedIdioms);
    }
    if (phrasalList.phrasalVerbList.length != 0) {
        let embedPhrasalVerbs = new EmbedBuilder()
            .setTitle(`${data.word} (*${form}*)`)
            .addFields(
                {
                    name: 'Phrasal Verbs',
                    value: phrasalList.phrasalVerbList,
                }, 
            )
        embeds.push(embedPhrasalVerbs);
    }

    return embeds;
}

function listPronunciations(lexicalEntry) {
    let pronunciationList = "";
    let pronunciations = [];
    if (lexicalEntry.lexicalCategory.id != 'residual') {
        lexicalEntry.entries.forEach(entry => {
            entry.pronunciations.forEach(pronunciation => {
                pronunciations.push(pronunciation);
            })  
        })
    }

    pronunciations.forEach(pronunciation => {
        pronunciationList += `/${pronunciation.phoneticSpelling}/\n`;
    })

    return pronunciationList;
}

function listDefinitions(lexicalEntry) {
    let definitionList = "";
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
                if (subsense.definitions) {
                    subsense.definitions.forEach(definition => {
                        definitionList += `${count++}. ${definition}\n\n`;
                        //there are examples
                        if (subsense.examples) { 
                            let exampleCount = 0;
                            //max of 2 examples for each subsense
                            while (exampleCount < subsense.examples.length && exampleCount < 2) {
                                let example = subsense.examples[exampleCount];
                                definitionList += `‎ ‎ ‎ ‎ • ‎ ‎ *${capitalizeFirstLetter(example.text)}*\n\n`;
                                exampleCount++;
                            }
                        }
                    })
                }
            })
        }
        else {
            if (sense.definitions) {
                sense.definitions.forEach(definition => {
                    definitionList += `${count++}. ${definition}\n\n`;
                    if (sense.examples) {
                        sense.examples.forEach(example => {
                            definitionList += `‎ ‎ ‎ ‎ • ‎ ‎ *${capitalizeFirstLetter(example.text)}*\n\n`;
                        })
                    }
                })
            }
        }
    })

    return definitionList;
}

function listSynonyms(lexicalEntry) {
    let synonymList = "";
    let synonymCount = 0;
    let senses = [];
    lexicalEntry.entries.forEach(entry => {
        entry.senses.forEach(sense => {
            senses.push(sense);
        })
    })

    senses.forEach(sense => {
        if (sense.subsenses) {
            sense.subsenses.forEach(subsense => {
                if (subsense.synonyms) {
                    for (let i = 0; i < subsense.synonyms.length; i++) {
                        if (synonymCount === 15) break;
                        const synonym = subsense.synonyms[i];
                        synonymList += `${synonym.text}, `;
                        synonymCount++;
                    }
                }
            })
        }
        if (sense.synonyms) {
            for (let i = 0; i < sense.synonyms.length; i++) {
                if (synonymCount === 15) break;
                const synonym = sense.synonyms[i];                
                synonymList += `${synonym.text}, `;
                synonymCount++;
            }
        }
    })

    return synonymList;
}

function listAntonyms(lexicalEntry) {
    let antonymList = "";
    let antonymCount = 0;
    let senses = [];
    lexicalEntry.entries.forEach(entry => {
        entry.senses.forEach(sense => {
            senses.push(sense);
        })
    })

    senses.forEach(sense => {
        if (sense.subsenses) {
            sense.subsenses.forEach(subsense => {
                if (subsense.antonyms) {
                    for (let i = 0; i < subsense.antonyms.length; i++) {
                        if (antonymCount === 15) break;
                        const antonym = subsense.antonyms[i];
                        antonymList += `${antonym.text}, `;
                        antonymCount++;
                    }
                }
            })
        }
        if (sense.antonyms) {
            for (let i = 0; i < sense.antonyms.length; i++) {
                if (antonymCount === 15) break;
                const antonym = sense.antonyms[i];                
                antonymList += `${antonym.text}, `;
                antonymCount++;
            }
        }
    })

    return antonymList;
}

function listIdiomsAndPhrasalVerbs(results) {
    let idiomList = "", phrasalVerbList = "";
    let idiomCount, phrasalVerbCount;
    idiomCount = phrasalVerbCount = 1;

    results.forEach(result => {
        let lexicalEntry = getLexicalEntry(result);
        if (lexicalEntry && lexicalEntry.phrases) {
            lexicalEntry.phrases.forEach(phrase => {
                idiomList += `${idiomCount++}. ${phrase.text}\n\n`;
            })
        }
        if (lexicalEntry && lexicalEntry.phrasalVerbs) {
            lexicalEntry.phrasalVerbs.forEach(phrasalVerb => {
                phrasalVerbList += `${phrasalVerbCount++}. ${phrasalVerb.text}\n\n`;
            })
        }
    })
    return {idiomList, phrasalVerbList};
}

function capitalizeFirstLetter(string) {
    let newString = string[0].toUpperCase() + string.slice(1);
    return newString;
}