# DLive-api

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0841123e02614d64a04ddd72435ed2e6)](https://www.codacy.com/app/lkd70/dlivetv-api?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=lkd70/dlivetv-api&amp;utm_campaign=Badge_Grade)
[![License: MIT](https://img.shields.io/badge/License-MIT-1BCC1B.svg)](https://opensource.org/licenses/MIT)
[![npm downloads per week](https://img.shields.io/npm/dw/dlivetv-api.svg?color=1BCC1B)](https://www.npmjs.com/package/dlivetv-api)
[![npm version](https://img.shields.io/npm/v/dlivetv-api.svg?color=1BCC1B)](https://www.npmjs.com/package/dlivetv-api)
[![code size](https://img.shields.io/github/languages/code-size/lkd70/dlivetv-api.svg?color=1BCC1B)](https://www.npmjs.com/package/dlivetv-api)

[![logo](https://raw.githubusercontent.com/lkd70/dlive-images/master/dlive_discord_ninja_api_300_300.png)](https://www.npmjs.com/package/dlivetv-api)

[![npm](https://nodei.co/npm/dlivetv-api.png?compact=true)](https://nodei.co/npm/dlivetv-api.png?compact=true)

[![Discord Banner 1](https://discordapp.com/api/guilds/580728133460688896/widget.png?style=banner2)](https://invite.gg/dlivetvapi)

## [Documentation](https://dlivetv-api.readme.io)

## Example

```js
const Dlive = require('dlivetv-api');

const key = 'MyReallyLongAuthenticationKey'; // Not sure where to get your auth key? Check the documentation link above!

// Create a bot instence on LKD70's channel
const bot = new Dlive(key, 'LKD70');

// Monitor for 'ChatText' events
bot.on('ChatText', msg => {
    // Log every message recieved to the console
    console.log(`[${msg.sender.displayname}]: ${msg.content}`);

    // If someone says "hello" in our stream, greet then with a message
    if (msg.content.toLowerCase() === 'hello') {
        bot.sendMessage(`Hi there ${msg.sender.displayname}! Welcome to the stream`);
    }
});
```

## Support

Need help with something? Or just want to hang out? Or maybe even offer a helping hand with the project?
Feel free to check out [my Discord server](https://invite.gg/dlivetvapi), everyone is welcome to contribute to the project as long as they follow the eslint and editorconfig standards!

## Credits

Though this project is currently only coded and maintained by myself, I wouldn't have got to this point without the guidance of several other people and repositories. Here's some repos that have helped me out that you should also check out for yourself:

* [Dlivetv-api-js](https://dlive.timedot.cc/node-js) - The origin of the earlier versions of this project and inspiration for this project. Created and maintained by the [DLive-APIs team](https://github.com/dlive-apis)
* [dlive-js](https://www.npmjs.com/package/dlive-js) - A very diverse broad reaching API that ventures in to a LINO API as well as a Dlive API by the amazing [CreativeBuilds](https://dlive.tv/CreativeBuilds)
* [DliveBot](https://dlivebot.com) - A nifty bot for Dlive that is easy to use and comes with tonnes of functionality, credits to [Dan Scott](https://dlive.tv/DanScott) for introducing me to this bot
