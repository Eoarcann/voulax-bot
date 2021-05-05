const Discord = require('discord.js');
const client = new Discord.Client();

const prefix = '~';
const factsChannels = ['839048973301448754', '818548564132233267', '838891558740688906']; // Test , voulax-land , flood
lastFactsIds = [0, 0, 0];

const timerMin = 3600000;   // 1h
const timerMax = 14400000;  // 4h

facts = [];

// reads Facts file
var fs = require('fs');
fs.readFile     
(
    'Facts.txt', 
    'utf8', 
    function(err, contents) 
    {
        facts = contents.split('\n');   // Splits the file in an array. Each array entry is a fact.
    }
);

function GetIndexFromChannelId(id)
{
    switch(id)
    {
        case '839048973301448754':
            return 0;
        case '818548564132233267':
            return 1;
        case '838891558740688906':
            return 2;
        default:
            console.log("GetIndexFromChannelId : Error");
    }
}

// Formats a milliseconds time in a "xh ym zs" format. Debug purpose only.
function FormatTime(value)  
{
    valueSeconds = value / 1000;
    valueSeconds = Math.round(valueSeconds);
    seconds = valueSeconds % 60;
    minutes = valueSeconds / 60;
    minutes = Math.trunc(minutes);
    hours = minutes / 60;
    hours = Math.trunc(hours);
    minutes = minutes % 60;

    return hours + 'h ' + minutes + 'm ' + seconds + 's';
}

// Sends a random fact to every channel wanted
function SendFactToEveryChannel()
{
    for (i = 0; i < factsChannels.length; i++)
    {
        // Picks a random fact
        const randomIndex = Math.floor(Math.random() * (facts.length));
        const fact = facts[randomIndex];
        
        // Finds the wanted channel and sends the fact to that channel
        const channel = client.channels.cache.get(factsChannels[i])
        if (channel)
        {
            channel.send(fact);
            lastFactsIds[i] = randomIndex;
        }
    }
}

// Sends a random fact to a channel
function SendFactToChannel(channel)
{
    // Picks a random fact
    const randomIndex = Math.floor(Math.random() * (facts.length));
    const fact = facts[randomIndex];

    if (channel)
    {
        channel.send(fact);
        lastFactsIds[GetIndexFromChannelId(channel.id)] = randomIndex;
    }
}

// Sends a precise fact to a channel
function SendFactToChannelWithID(channel, id)
{
    const fact = facts[id];

    if (channel)
    {
        channel.send(fact);
        lastFactsIds[GetIndexFromChannelId(channel.id)] = id;
    }
}

// Recursive loop that sends a fact, then wait for a random time before calling itself again
function loop() 
{
    SendFactToEveryChannel();
    var rand = Math.round(Math.random() * (timerMax - timerMin)) + timerMin;
    console.log('Next fact in : ' + FormatTime(rand));
    setTimeout(loop, rand);
}

// Called at launch
client.once
(
    'ready', () => 
    {
        client.user.setActivity('spammer des random facts.\n~help si t\'as besoin d\'aide.');
        loop(); // Starts the first loop, sending the first fact.
    }
)

// Called when a message is sent
client.on
(
    'message', message =>
    {
        // If the prefix is wrong or the message is sent by the bot itself, just ignore it and return
        if (!message.content.startsWith(prefix) || message.author.bot)
        {
            return;
        }

        // If the channel isn't one of the authorized ones, just ignore it and return
        canContinue = false;
        for (i = 0; i < factsChannels.length; i++)
        {
            if (message.channel.id === factsChannels[i])
            {
                canContinue = true;
            }
        }

        if (canContinue)
        {
            const args = message.content.slice(prefix.length).split(/ +/); // I don't get that tbh
            const command = args.shift().toLowerCase();

            if (command === 'fact')     // It's a fact request : send a fact.
            {
                SendFactToChannel(message.channel);

            }
            else if (command === 'factid')
            {
                if (args[0] > 0 && args[0] <= facts.length)
                {
                    SendFactToChannelWithID(message.channel, args[0] - 1);
                }
                else
                {
                    message.channel.send("Vous utilisez mal la commande.\n\n*~factid **x** - **x** étant un nombre compris entre 1 et " + facts.length + "*");
                }
            }
            else if (command === 'getlastfactid')
            {
                const lastId = lastFactsIds[GetIndexFromChannelId(message.channel.id)] + 1;
                message.channel.send("L'ID du dernier fact envoyé est : " + lastId);
            }
            else if (command === 'help')
            {
                message.channel.send("Ce bot enverra un fact aléatoire toutes les " + timerMin / 3600000 + " à " + timerMax / 3600000 + " heures.\n\n**Commandes :**\n*~help* : Vous venez de l'utiliser. Bouffon.\n*~fact* : Envoie un fact aléatoire, manuellement.\n*~factid **x** - **x** étant un nombre compris entre 1 et " + facts.length + "* : Envoie un fact précis, utilisant son ID.\n*~getlastfactid* : Affiche l'ID du dernier fact envoyé.");
            }
            else
            {
                message.channel.send("Voulax ne connait pas cette commande.\nFaites *~help* pour que Voulax vous explique comment se servir du bot.");
            }
        }
    }
)

client.login(process.env.TOKEN);