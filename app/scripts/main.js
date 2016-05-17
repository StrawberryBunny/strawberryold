'use strict';

/**
 * App Data ====================================================================================================================
 */

var App = {
    connection: null, // The WebSocket connection
    characters: {},
    ops: [],
    publicChannels: {},
    privateChannels: {},
    dom: {
        openChannelList: null,
        channelContents: null,
        userlist: null,
        userlistTopBar: null,
        userlistTitle: null,
        noChannelImage: null,
        mainTextEntry: null,
        mainTextEntryButton: null,
        buttonList: [],
        channelListScrolling: {
            channelScrollingInterval: null,
            curBottomMargin: 0,
            channelMouseDistance: 0.5
        }
    },
    user: { // Collection for items related to the user.
        account: '',            // String (account name)
        ticket: '',             // String (the api ticket aquired at log in)
        characters: [],         // Array of String (character names)
        loggedInAs: '',
        ignoreList: [],
        friendsList: {},         // Format: { "sourcecharacter": [ "friend1", "friend2"], "sourcechatacter2": [ "friend1", "friend2"] }
        bookmarks: []
    },
    state: { // Collection of items related to the dom
        currentTool: '',
        openChannels: [],
        openPMs: [],
        selectedChannel: '', // If this is 'pm' then refer to selectedPM
        selectedPM: '',
        logInReadyInfo: {
            loadingDelay: true,
            ready: false,
            identified: false,
            initialCharacterCount: -1,
            listedCharacters: 0,
            listComplete: false,
            serverInfoRetrieved: false,
            friendsListRetrieved: false,
            bookmarksRetrieved: false            
        },
        lastMessageSentAt: 99999999
    },
    tools: { // A place to store things for each tool: (all tools have a button and content entry for their respective dom elements.)
       status: {
            dropdown: null,
            textarea: null,
            updatebutton: null
        },
        channels: {
            entryPush: null,
            refreshbutton: null,
            channelEntries: []
        },
        feed: {
            currentlyDisplaying: false,
            scroller: null,
            messagePush: null,
            queue: [],
            filterInfo: false,
            filterPMs: false,
            filterAlerts: false,
            filterMentions: false,
            filterErrors: false,
            uniqueID: 0
        },
        viewer: {
            target: ''
        },
        settings: {
            genderColourPickers: {}
        }
    },
    consts: {
        version: '0.5',
        logInTimeout: 2500,
        icons: {
            loading: [
                ['fa-rocket', 'Preparing to blast off.'],
                ['fa-hourglass', 'Please wait.'],
                ['fa-hourglass-o', 'Please wait.'],
                ['fa-dashboard', 'Accelerating to 88mph.'],
                ['fa-cog', 'Grinding gears.'],
                ['fa-cubes', 'Assembling flat-pack voxels.'],
                ['fa-flash', 'Ah-Aaaaaah. Saviour of the universe.'],
                ['fa-flask', 'Brewing unspeakable concoctions.'],
                ['fa-gamepad', 'dncornholio'],
                ['fa-life-ring', 'Preserving artifical life forms in the stack.'],
                ['fa-meh-o', 'Meh'],
                ['fa-paw', 'Arf! Who\'s a good client?'],
                ['fa-puzzle-piece', 'Strawberry\'l figure it out.'],
                ['fa-random', 'Loading modules using Math.random()'],
                ['fa-spinner', 'Right-round, baby.'],
                ['fa-star', 'Counting stars.'],
                ['fa-truck', 'Breaker 1-9er. Got a meat wagon on my donkey. 10-6.'],
                ['fa-intersex', 'Checking for bulge.'],
                ['fa-mars', 'Weighing balls.'],
                ['fa-mercury', 'WTF gender icon is this?'],
                ['fa-neuter', 'I have no strong feelings one way or the other!'],
                ['fa-transgender', 'Fuck da police.'],
                ['fa-transgender-alt', 'Fuck \'em and their law.'],
                ['fa-venus-mars', 'The way your parents did it.'],
                ['fa-mars-double', 'Dicks!'],
                ['fa-venus-double', 'No dicks!'],
                ['fa-circle-o-notch', 'Please wait.'],
                ['fa-pie-chart', 'Making a pie chart to display how much I love pie, charts and pie charts.'],
                ['fa-floppy-o', 'Please wait. Lost the little key to the disk box.'],
                ['fa-link', 'Informing Link that his princess is in another castle and that he\'s in the wrong game.'],
                ['fa-paperclip', 'One moment. Just giving Clippy his annual beating so he remembers his place.']
            ]
        },
        tools: {
            feed:       { name: 'feed',         title: 'Feed',              icon: 'fa-feed',                    show: 'toolShowFeed' },
            status:     { name: 'status',       title: 'Status',            icon: 'fa-list-alt',                show: 'toolShowStatus' },
            channels:   { name: 'channels',     title: 'Channel List',      icon: 'fa-th',                      show: 'toolShowChannelList' },
            viewer:     { name: 'viewer',       title: 'Viewer',            icon: 'fa-eye',                     show: 'toolShowViewer' },
            pictures:   { name: 'pictures',     title: 'Pictures',          icon: 'fa-image',                   show: 'toolShowPictures' },
            friends:    { name: 'friends',      title: 'Friends',           icon: 'fa-users',                   show: 'toolShowFriends' },
            pms:        { name: 'pms',          title: 'Private Messages',  icon: 'fa-comments',                show: 'toolShowPMs' },            
            info:       { name: 'info',         title: 'Info',              icon: 'fa-question',                show: 'toolShowInfo' },
            settings:   { name: 'settings',     title: 'Settings',          icon: 'fa-gears',                   show: 'toolShowSettings' },
            logout:     { name: 'logout',       title: 'Logout',            icon: 'fa-sign-out',                show: 'toolShowLogout' }
        },
        channelListScrollingSpeed: 25,
        feed: {
            types: {
                info: 'info',
                alert: 'alert',
                error: 'error',
                pm: 'pm',
                mention: 'mention'
            }
        }
    },
    serverVars: {
        chat_max: -1,
        priv_max: -1,
        lfrp_max: -1,
        lfrp_flood: -1,
        msg_flood: -1,
        permissions: -1,
        icon_blacklist: []
    },
    defaults: {
        genderColours: {
            male: 			['#5895df', 'Male'],
			female:			['#ea6fbd', 'Female'],
			herm:			['#c148f3', 'Herm'],
			shemale:		['#e52591', 'Shemale'],
			cuntboy:		['#27b011', 'Cuntboy'],
			maleherm:		['#1e22bf', 'Male-Herm'],
			none:			['#e2e797', 'None'],
			transgender: 	['#e86937', 'Transgender']
        }
    },
    options: {
		genderColours: {
			male: 			['#5895df', 'Male'],
			female:			['#ea6fbd', 'Female'],
			herm:			['#c148f3', 'Herm'],
			shemale:		['#e52591', 'Shemale'],
			cuntboy:		['#27b011', 'Cuntboy'],
			maleherm:		['#1e22bf', 'Male-Herm'],
			none:			['#e2e797', 'None'],
			transgender: 	['#e86937', 'Transgender']
		},
		timestamps: true
	},
    changelog: [
        ['0.2', ['First changelog! Woo!', 'Nothing\'s really changed yet, though.', 'Moved from a simple notepad++ set-up to using Gulp to build my files and Bower for dependency management.']],
        ['0.3', ['Channel buttons now include a label.', 'Locked and unlocked rooms now display.', 'Implemented /makeroom, /openroom, /code, /invite and /setdescription commands for private channels.', 'Various sweeping fixus and tweaks.']],
        ['0.4', ['Fix for scrollbars at the bottom jumping up a little when the tool panel is opened.', 'Fix for users entering/leaving rooms messing up the userlist.', 'Userlists now sort better.', 'Fix for channel labels overflowing buttons.', 'Fixed channel list not updating correctly when users join a channel', 'Fix for channel buttons not stopping flashing when selected.', 'User\'s own messages now highlighted.', 'Feed messages now appear in the active channel.', 'Fix for viewer scrolling to memo strangeness.', 'Site title now updates to show logged in character and number of unread messages.', 'Fix for Male-Herm and Cunt-boy. We forgot about the dashes.', 'Fix for open channel buttons not being visiable after closing some when the list is scrolled down.']],
        ['0.5', ['Fix to stop status update button being clicked during timeout phase.', 'Max lengths added to text entries.', 'Message flood prevention implemented.', 'Closing feed messages now closes all instances of that message.', 'WebM videos added to picture viewer']]
    ],
    commands: [
        {
            name: 'help',
            usage: '/help <command>',
            description: 'Displays help information for a given command. Do not include the <> brackets',
            examples: ['/help clear', '/help bookmark'],
            alias: ['h'],
            func: function(e){ 
                if(typeof e === 'undefined' || e.length === 0){
                    App.commands[0].func('help');
                    return false;
                }			
                
                for(var i = 0; i < App.commands.length; i++){
                    if(App.commands[i]['name'] === e){
                        var msg = '[b]' + escapeHtml(App.commands[i]['name']) + '[/b][ul][li][i][color=cyan]Usage[/color][/i]: ' + escapeHtml(App.commands[i]['usage']) + '[/li][li][i][color=cyan]Description[/color][/i]: ' + escapeHtml(App.commands[i]['description']) + '[/li][li][i][color=cyan]Examples[/color][/i]: ';
                        
                        var dat = App.commands[i]['examples'];
                        var examples = '[ul]';
                        for(var j = 0; j < dat.length; j++){
                            examples += '[li]';
                                examples += escapeHtml(dat[j]);
                            examples += '[/li]';
                        }                     
                        examples += '[/ul]';
                        msg += examples;
                        
                        msg += '[/li][li][i][color=cyan]Aliases[/color][/i]: ';
                        
                        dat = App.commands[i]['alias'];
                        var alis = '[ul]';
                        for(var k = 0; k < dat.length; k++){
                            alis += '[li]';
                                alis += '/' + escapeHtml(dat[k]);
                            alis += '[/li]';
                        }
                        alis += '[/ul]';
                        msg += alis;
                        
                        msg += '[/li][/ul]';
                                                
                        pushFeedItem(App.consts.feed.types.info, msg);
                        return true;
                    }
                }		
                
                pushFeedItem(App.consts.feed.types.error, 'There is no command called \'' + e + '\'');
                
                return false;			
            }
        },
        {
            name: 'commands',
            usage: '/commands',
            description: 'Lists all available commands.',
            examples: ['/commands'],
            alias: ['c'],
            func: function(e){
                var msg = '[ul]';
                for(var i = 0; i < App.commands.length; i++){
                    msg += '[li]/' + App.commands[i].name + '[/li]';
                }
                msg += '[/ul]';
                pushFeedItem(App.consts.feed.types.info, msg, true);
                return true;
            }
        },
        {
            name: 'clear',
            usage: '/clear',
            description: 'Clears the currently active channel window.',
            examples: ['/clear'],
            alias: ['cls'],
            func: function(e){
                if(App.state.selectedChannel === ''){
                    return false;
                }
                
                var isPM = App.state.selectedChannel === 'pm';
                if(isPM){
                    var isPublic = App.state.selectedChannel.substr(0, 3) === 'ADH';
                    var channels = isPublic ? App.publicChannels : App.privateChannels;
                    channels[App.state.selectedChannel].messageDom.empty();
                }
                else {
                    App.characters[App.state.selectedPM].pms.messageDom.empty();
                }
                
                return true;
            }
        },
        {
            name: 'join',
            usage: '/join <channel name>',
            description: 'Attempts to join the given channel. If the channel is private you must use the channel\'s code instead of it\'s name. The channel code can be obtained by typing /code in the channel or by asking a channel operator. Do not include the <> brackets.',
            examples: ['/join Dragons', '/join Cum Lovers', '/join ADH-91001d20bf2b4e2d4a61'],
            alias: ['j'],
            func: function(e){
                if(typeof e === 'undefined' || e.length === 0){
                    App.commands[0].func('join');
                    return false;
                }
                
                // Try to join the channel.
                joinChannel(e);
                
                return true;
            }
        },
        {
            name: 'part',
            usage: '/part <channel name>',
            description: 'Attempts to leave the given channel. If the channel is private you must use the channel\'s code instead of it\'s name. The channel code can be obtained by typing /code in the channel or by asking a channel operator. Do not include the <> brackets.',
            examples: ['/part Dragons', '/part Cum Lovers', '/part ADH-91001d20bf2b4e2d4a61'],
            alias: ['p', 'leave', 'l'],
            func: function(e){
                if(typeof e === 'undefined' || e.length === 0){
                    App.commands[0].func('part');
                    return false;
                }
                
                // Try to leave the channel
                leaveChannel(e);
                
                return true;
            }
        },
        {
            name: 'me',
            usage: '/me <action>',
            description: 'Sends an in-character action to the active channel. Do not include the <> brackets.',
            examples: ['/me rolls around.', '/me flop on a couch.', '/me says something witty.'],
            alias: ['me\'', 'me\'s'],
            func: function(e){
                if(App.state.selectedChannel === ''){
                    return false;
                }
                
                sendChatMessageToActiveWindow(e, true);
                
                return true;
            }           
        },
        {
            name: 'view',
            usage: '/view <character name>',
            description: 'Opens the viewer to display the given character. Do not include <> brackets.',
            examples: ['/view Strawberry'],
            alias: ['v'],
            func: function(e){
                if(typeof e === 'undefined' || e.length === 0){
                    App.commands[0].func('view');
                    return false;
                }
                
                targetViewerFor(e);
                if(App.state.currentTool !== 'viewer'){
                    toggleTool('viewer');
                }
                return true;
            }
        },
        {
            name: 'status',
            usage: '/status [get|set] [online|looking|busy|away|dnd] <message>',
            description: 'Gets or sets the status for the currently logged in character. Select either get or set. Only if setting: Select one of online, looking, busy, away or dnd as your status. Everything typed after that is considered to be your status message. Do not include the [] or <> brackets.',
            examples: ['/status get', '/status set looking Time for some fun.', '/status set dnd Leave me alone!'],
            alias: ['s'],
            func: function(e){
                if(typeof e === 'undefined' || e.length === 0){
                    App.commands[0].func('status');
                    return false;
                }
                
                var split = e.split(' ');
                
                if(split[0] === 'get'){
                    pushFeedItem(App.consts.feed.types.info, 'Your status is currently: ' + App.characters[App.user.loggedInAs].status + ' - ' + App.characters[App.user.loggedInAs].statusmsg);
                    return true;
                }
                
                if(split[0] === 'set'){
                    if(split.length > 1 && split[1].length > 0){
                        var status = split[1].toLowerCase();
                        if(status !== 'online' && status !== 'looking' && status !== 'busy' && status !== 'away' && status !== 'dnd'){
                            // incorrect status.
                            pushFeedItem(App.consts.feed.types.error, 'The status you entered is not an acceptable value.');
                            App.commands[0].func('status');
                            return false;
                        }
                        
                        var message = e.substr(5 + status.length);
                        
                        sendMessageToServer('STA {"status": "' + status + '", "statusmsg": "' + message + '" }');
                        return true;
                    }
                    
                    return false;
                }
            }
        },
        {
            name: 'preview',
            usage: '/preview <message>',
            description: 'Posts a preview message into the active chat window that only you can see. Used for testing out BBCode before posting it for real. Do not include the <> brackets.',
            examples: ['/preview [b][i]Whoops![/b][/i]'],
            alias: ['pr'],
            func: function(e){
                if(App.state.selectedChannel !== ''){
                    receiveMessage(App.state.selectedChannel, 'preview', e, false);
                    return true;
                }
                return false;
            }
        },
        {
            name: 'code',
            usage: '/code',
            description: 'Pushes a feed item with the current private channel\'s code so you can link the room to other people.',
            examples: ['/code'],
            alias: [],
            func: function(e){
                if(App.state.selectedChannel === 'pm'){
                    pushFeedItem('error', 'The /code command only works in private channels.');
                    return true;
                }
                
                var isPublic = App.state.selectedChannel.substr(0, 3) !== 'ADH';
                
                if(isPublic){
                    pushFeedItem('error', 'The /code command only works in private channels.');
                    return true;
                }
                
                var channels = isPublic ? App.publicChannels : App.privateChannels;
                pushFeedItem('info', '[ul][li]The code for ' + channels[App.state.selectedChannel].title + ' is ' + App.state.selectedChannel + '[/li][li]To link to the room use [noparse][session=' + channels[App.state.selectedChannel].title + ']' + App.state.selectedChannel + '[/session][/noparse][/li][/ul]');
                
                return true;
            }
        },
        {
            name: 'makeroom',
            usage: '/makeroom <channel name>',
            description: 'Creates a new private, invite only channel which you can invite other characters to or open to the public.',
            examples: ['/makeroom Some Channel Name', '/makeroom Vork for President'],
            alias: [],
            func: function(e){
                if(typeof e === 'undefined' || e.length === 0){
                    App.commands[0].func('makeroom');
                    return false;
                }
                
                sendMessageToServer('CCR { "channel": "' + e + '" }');
                return true;
            }
        },
        {
            name: 'invite',
            usage: '/invite <character name>',
            description: 'Invite a character into the active channel. You must be a channel owner or operator for the channel to use this command.',
            examples: ['/invite Strawberry', '/invite Kira'],
            alias: [],
            func: function(e){
                if(typeof e === 'undefined' || e.length === 0){
                    App.commands[0].func('invite');
                    return false;
                }
                
                // If PM
                if(App.state.selectedChannel === '' || App.state.selectChannel === 'pm'){
                    pushFeedItem('error', 'You can only invite people into a channel. To chat with more than one person create a room with the /makeroom command. You must use /invite from the channel you wish to invite people to.');
                    return true;
                }
                
                // Is our logged in user an op or higher in the current channel
                var isPublic = App.state.selectedChannel.substr(0, 3) !== 'ADH';
                var channels = isPublic ? App.publicChannels : App.privateChannels;
                if(channels[App.state.selectedChannel].ops.indexOf(App.user.loggedInAs) === -1){
                    pushFeedItem('error', 'You must be a channel owner or operator to invite people into the channel.');
                    return true;
                }                
                
                sendMessageToServer('CIU { "channel": "' + App.state.selectedChannel + '", "character": "' + e + '" }')
                return true;
            }
        },
        {
            name: 'setdescription',
            usage: '/setdescription <description>',
            description: 'Sets the description for a private channel. You must be a channel owner or operator for the channel to use this command.',
            examples: ['/setdescription Here you can do all the things!', '[noparse]/setdescription [b]The Best Channel[/b] A non descript place where you can do things [icon]Strawberry[/icon][/noparse]'],
            alias: [],
            func: function(e){
                if(typeof e === 'undefined' || e.length === 0){
                    App.commands[0].func('setdescription');
                    return false;
                }
                
                // if PM
                if(App.state.selectedChannel === '' && App.state.selectedChannel === 'pm'){
                    pushFeedItem('error', 'You can only use /setdescription in a private channel in which you are owner or operator.');
                    return true;
                }
                
                // Is our logged in user in the current channel
                var isPublic = App.state.selectedChannel.substr(0, 3) !== 'ADH';
                var channels = isPublic ? App.publicChannels : App.privateChannels;
                if(channels[App.state.selectedChannel].ops.indexOf(App.user.loggedInAs) === -1){
                    pushFeedItem('error', 'You must be the onwer or operator to invite people into the channel.');
                    return true;
                }
                
                sendMessageToServer('CDS { "channel": "' + App.state.selectedChannel + '", "description": "' + escapeJson(e) + '" }');
                return true;
            }
        },
        {
            name: 'openroom',
            usage: '/openroom',
            description: 'Opens up the active private channel. Other users will then be able to see the room in their channel list. You must be a channel owner or operator to use this command.',
            examples: ['/openroom'],
            alias: [],
            func: function(e){
                // Ensure the active channel is a private room.
                if(App.state.selectedChannel === '' || App.state.selectedChannel === 'pm'){
                    pushFeedItem('error', 'You can only use /openroom in a private channel in which you are owner or operator.');
                    return true;
                }
                
                // Is our logged in user in the current channel
                var isPublic = App.state.selectedChannel.substr(0, 3) !== 'ADH';
                var channels = isPublic ? App.publicChannels : App.privateChannels;
                if(channels[App.state.selectedChannel].ops.indexOf(App.user.loggedInAs) === -1){
                    pushFeedItem('error', 'You must be the owner or operator to invate people into the channel.');
                    return true;
                }
                
                sendMessageToServer('RST { "channel": "' + App.state.selectedChannel + '", "status": "public" }');
                return true;
            }
        }
    ]
};

var TLDs = ["ac", "ad", "ae", "aero", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "arpa", "as", "asia", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "biz", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cat", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "com", "coop", "cr", "cu", "cv", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "edu", "ee", "eg", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gov", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "info", "int", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jobs", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mil", "mk", "ml", "mm", "mn", "mo", "mobi", "mp", "mq", "mr", "ms", "mt", "mu", "museum", "mv", "mw", "mx", "my", "mz", "na", "name", "nc", "ne", "net", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "org", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "pro", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "st", "su", "sv", "sy", "sz", "tc", "td", "tel", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "travel", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "xn--0zwm56d", "xn--11b5bs3a9aj6g", "xn--3e0b707e", "xn--45brj9c", "xn--80akhbyknj4f", "xn--90a3ac", "xn--9t4b11yi5a", "xn--clchc0ea0b2g2a9gcd", "xn--deba0ad", "xn--fiqs8s", "xn--fiqz9s", "xn--fpcrj9c3d", "xn--fzc2c9e2c", "xn--g6w251d", "xn--gecrj9c", "xn--h2brj9c", "xn--hgbk6aj7f53bba", "xn--hlcj6aya9esc7a", "xn--j6w193g", "xn--jxalpdlp", "xn--kgbechtv", "xn--kprw13d", "xn--kpry57d", "xn--lgbbat1ad8j", "xn--mgbaam7a8h", "xn--mgbayh7gpa", "xn--mgbbh1a71e", "xn--mgbc0a9azcg", "xn--mgberp4a5d4ar", "xn--o3cw4h", "xn--ogbpf8fl", "xn--p1ai", "xn--pgbs0dh", "xn--s9brj9c", "xn--wgbh1c", "xn--wgbl6a", "xn--xkc2al3hye2a", "xn--xkc2dl3a5ee0h", "xn--yfro4i67o", "xn--ygbi2ammx", "xn--zckzah", "xxx", "ye", "yt", "za", "zm", "zw"].join()

/**
 * Global Functions ============================================================================================================
 */

function checkForReadyStatus(){
    // Has the list of online users finished being received?
    if(App.state.logInReadyInfo.listComplete && App.state.logInReadyInfo.bookmarksRetrieved && App.state.logInReadyInfo.friendsListRetrieved && App.state.logInReadyInfo.identified){
        // Switch to the chat.
        
        // Set the loading texts
        $('#loadingtext').text('Log in successful!');
        $('#loadingtext2').text('Enjoy using Strawberry v' + App.consts.version + '!');
        
        // Replace hand
        $('.loginloadingcontent span').removeClass();
        var rpslz = [ 'fa-hand-rock-o', 'fa-hand-paper-o', 'fa-hand-scissors-o', 'fa-hand-lizard-o', 'fa-hand-spock-o'];
        $('.loginloadingcontent span').addClass('fa ' + rpslz[Math.floor(Math.random() * rpslz.length)]);
        $('.loginloadingcontent span').attr('title', 'SCISSORS cuts PAPER covers ROCK crushes LIZARD poisons SPOCK smashes SCISSORS decapitates LIZARD eats PAPER disproves SPOCK vaporizes ROCK crushes SCISSORS');
            
        // Delay and goto main.    
        setTimeout(function(){
            // Remove login loading content
            $('.maincontainer').remove();

            // Switch to the chat.
            $('body').append(createDomMainChat());
            
            // Options
            loadOptionsCookie();
            
            // Refresh channel list
            refreshChannels();  
            
            // Update feed counter.
            updateFeedQueueCounter();
        }, App.consts.logInTimeout);
    }    
    else {
        // Keep waiting.
        // Server is still receiving LIS messages with the user list. 
        // Once it's complete, checkForReadyStatus() will be called again.
    }   
}

function logInComplete(account, ticket, characters){
    // Store the data we got back
    App.user.account = account;
    App.user.ticket = ticket;
    App.user.characters = characters;

    // Hide the login container
    $('.maincontainer').remove();

    // Create the login character selector dom
    $('body').append(createDomLoginCharacterSelector());
    
    // Save to cookie
    cookie.set('session', account + '|' + ticket + '|' + characters, { expires: 1 });
}

function loadOptionsCookie(){
    // Load options cookie.
    var ckOptions = JSON.parse(cookie.get('options', JSON.stringify({})));
    
    // Gender colours.
    if(typeof ckOptions.genderColours !== 'undefined'){
        for(var key in ckOptions.genderColours){
            App.options.genderColours[key][0] = ckOptions.genderColours[key];
        }        
    }
    
    // Mentions
    if(typeof ckOptions.mentions !== 'undefined'){
        App.options.mentions = ckOptions.mentions;
        var str = '';
        for(var i = 0; i < App.options.mentions.length; i++){
            str += App.options.mentions[i];
            if(i !== App.options.mentions.length - 1){
                str += ',';
            }
        }
        App.tools['settings'].mentionsInput.val(str);
    }
    
    // Start-up channels.
    if(typeof ckOptions.startUpChannels !== 'undefined'){
        //console.log("Start-up channels: " + ckOptions.startUpChannels);
        var str = '';
        for(var j = 0; j < ckOptions.startUpChannels.length; j++){
            if(ckOptions.startUpChannels[j].length > 0){
                joinChannel(ckOptions.startUpChannels[j]);
                str += ckOptions.startUpChannels[j];
                if(j != ckOptions.startUpChannels.length - 1){
                    str += ',';
                }
            }
        }
        App.tools['settings'].startUpChannelsInput.val(str);
    }
}

function throwError(message){
    pushFeedItem(App.consts.feed.types.error, message);
}

function sendChatMessageToActiveWindow(message, skipCommandCheck){
    // Catch commands.
    if(!skipCommandCheck && message.charAt(0) === '/'){
        var split = message.split(' ');
        var command = split[0].substr(1);
        
        for(var i = 0; i < App.commands.length; i++){
            if(App.commands[i].name === command){
                return App.commands[i].func(command !== 'me' ? message.substring(command.length + 2) : message);
            }
            
            for(var j = 0; j < App.commands[i].alias.length; j++){
                if(App.commands[i].alias[j] === command){
                    return App.commands[i].func(command !== "me'" && command !== "me's" ? message.substring(command.length + 2) : message);                    
                }
            }
        }        
        
        // TODO unrecognized command?
         
        return false;
    }
    
    // Check for flood
    if(checkForMsgFlood()){
        return false;
    }
    
    return sendMessage(message, App.state.selectedChannel === 'pm', App.state.selectedChannel === 'pm' ? App.state.selectedPM : App.state.selectedChannel);
}

function sendMessage(message, isPM, chanchar){
    // Check for bullcrap
    var strippedMessage = stripWhitespace(message);
    if(message === null || typeof message === 'undefined' || message === '' || strippedMessage === '' || strippedMessage.length === 0 || chanchar === '' || chanchar.length === 0){
        return false;
    }
    
    // Check for malformed bbcode
    var bb = XBBCODE.process({
        text: message
    });
    
    if(bb.error){
        var errorMessage = '[ul]';
        for(var i = 0; i < bb.errorQueue.length; i++){
            errorMessage += '[li]' + bb.errorQueue[i] + '[/li]';        
        }
        errorMessage += '[/ul]';
        pushFeedItem(App.consts.feed.types.error, errorMessage);
        return false;
    }
    
    // Is it /me?
    var serverMessage = message;
    if(message.substr(0, 5) === "/me's"){
        serverMessage = '/me ' + message.substr(3);
    }
    else if(message.substr(0, 4) === "/me'"){
        serverMessage = '/me ' + message.substr(3);
    }
    
    if(isPM){
        // Send message to server
        sendMessageToServer('PRI { "recipient": "' + chanchar + '", "message": "' + escapeJson(serverMessage) + '" }');
        
        // Add the message to the chat window
        receivePM(chanchar, message, App.user.loggedInAs);
    }
    else {
        // Send message to server
        sendMessageToServer('MSG { "channel": "' + chanchar + '", "message": "' + escapeJson(serverMessage) + '" }');

        // Add the message to the chat window
        receiveMessage(chanchar, App.user.loggedInAs, message, false);
    }
    
    // Set last message time.
    App.state.lastMessageSentAt = new Date().getTime();
    
    // Return success.
    return true;
}

function updateStatus(character, status, statusmsg){
    App.characters[character].status = status;
    App.characters[character].statusmsg = statusmsg;
    
    // If us
    if(character === App.user.loggedInAs){
        //pushFeedItem(App.consts.feed.types.info, 'Your status has been updated successfully.'); ( No need for feed item anymore. Status panel gives good feedback.");
        App.tools['status'].progressIcon.removeClass();
        App.tools['status'].progressIcon.addClass('fa fa-check');
    }
    
    // Update all instances of userentry for this character.
    $('.userentry').each(function(){
        var nameplate = $(this).children('.nameplate');
        if(nameplate.text() === character){
            var statusimg = $(this).find('.statusimg');
            statusimg.attr('src', 'images/status-small-' + status.toLowerCase() + '.png');
            statusimg.attr('title', stylizeStatus(status));
            nameplate.attr('title', statusmsg);
        }
    });
    
    for(var i = 0; i < App.state.openChannels.length; i++){
        var isPublic = App.state.openChannels[i].substr(0, 3) !== 'ADH';
        var channels = isPublic ? App.publicChannels : App.privateChannels;
        channels[App.state.openChannels[i]].messageDom.find('.userentry').each(function(e){
            var nameplate = $(this).children('.nameplate');
            if(nameplate.text() === character){
                var statusimg = $(this).find('.statusimg');
                statusimg.attr('src', 'images/status-small-' + status.toLowerCase() + '.png');
                statusimg.attr('title', stylizeStatus(status));
                nameplate.attr('title', statusmsg);
            }
        });
        channels[App.state.openChannels[i]].userlistDom.find('.userentry').each(function(e){
            var nameplate = $(this).children('.nameplate');
            if(nameplate.text() === character){
                var statusimg = $(this).find('.statusimg');
                statusimg.attr('src', 'images/status-small-' + status.toLowerCase() + '.png');
                statusimg.attr('title', stylizeStatus(status));
                nameplate.attr('title', statusmsg);
            }
        });
    }
    
    for(var j = 0; j < App.state.openPMs.length; j++){
        App.characters[App.state.openPMs[j]].pms.messageDom.find('.userentry').each(function(e){
            var nameplate = $(this).children('.nameplate');
            if(nameplate.text() === character){
                var statusimg = $(this).find('.statusimg');
                statusimg.attr('src', 'images/status-small-' + status.toLowerCase() + '.png');
                statusimg.attr('title', stylizeStatus(status));
                nameplate.attr('title', statusmsg);
            }
        });
    }
}

function updateTypingStatus(character, status){
    // We don't need our own typing status.
    if(character === App.user.loggedInAs) return;
    
    // Find any open PM channels for this character.
    if(App.state.openPMs.indexOf(character) !== -1){
        var statusSpan = App.characters[character].pms.buttonDom.find('#typingstatus');
        if(status === 'typing'){
            statusSpan.removeClass();
            statusSpan.addClass('fa fa-keyboard-o fa-spin');
            statusSpan.fadeIn();
        }
        else if(status === 'paused'){
            statusSpan.removeClass();
            statusSpan.addClass('fa fa-keyboard-o');
            statusSpan.fadeIn();
        }
        else if(status === 'clear'){
            statusSpan.removeClass();
            statusSpan.addClass('fa fa-keyboard-o');
            statusSpan.fadeOut();
        }
        else {
            throwError('Sent erroneous typing status: ' + JSON.stringify(status));
        }        
    }
}

function characterWentOffline(character){
    // Remove this user's entry in any channel user lists and remove their userentry from the doms.
    var removed;
    for(var key in App.publicChannels){
        if(typeof App.publicChannels[key].users !== 'undefined'){
            removed = App.publicChannels[key].users.splice(character, 1); 
            if(typeof removed !== 'undefined'){
                App.publicChannels[key].userlistDom.children('.userentry').each(function(){
                    if($(this).attr('title') === character){
                        $(this).remove();
                    }
                });
            }
        }
    }
    
    for(key in App.privateChannels){
        if(typeof App.privateChannels[key].users !== 'undefined'){
            removed = App.privateChannels[key].users.splice(character, 1); 
            if(typeof removed !== 'undefined'){
                App.privateChannels[key].userlistDom.children('.userentry').each(function(){
                    if($(this).attr('title') === character){
                        $(this).remove();
                    }
                });
            }
        }
    }
    
    // Update any remianing userentries for this character.
    updateStatus(character, 'offline', '');    
    
    // Was this character our friend or bookmark?
    var shout = false;
    if(typeof App.user.friendsList[App.user.loggedInAs] !== 'undefined'){
        if(App.user.friendsList[App.user.loggedInAs].indexOf(character) !== -1){
            pushFeedItem(App.consts.feed.types.alert, 'Your friend [icon]' + character + '[/icon] has gone offline.');
            shout = true;
        }
    }
    if(!shout && typeof App.user.bookmarks !== 'undefined'){
        if(App.user.bookmarks.indexOf(character) !== -1){
            pushFeedItem(App.consts.feed.types.alert, 'Your bookmark [icon]' + character + '[/icon] has gone offline.');
        }
    }
}

function selectPreviousChannelOrPM(index){
    if($('#channellist').children().length === 0){
        selectChannel('');
    }
    else {
        index -= 1;
        if(index < 0){
            index = 0;
        }
        
        var newButton = App.dom.buttonList[index];
        var isPM = newButton.attr('id').split('-')[0] === 'pm';
        var title = newButton.find('#data').attr('title');
        
        if(isPM){
            selectPM(title);
        }
        else {
            selectChannel(title);
        }
        
        // Ensure the open channel list is not scrolled odly
        
    }
}

function updateAllUserEntries(){
    $('.userentry').each(function(e){
		$(this).find('.nameplate').css('color', App.options.genderColours[App.characters[$(this).attr('title')].gender.toLowerCase()][0]);        
	});
    
    // '.userentries' that aren't attached to the dom right now
    for(var i = 0; i < App.state.openChannels.length; i++){
        var isPublic = App.state.openChannels[i].substr(0, 3) !== 'ADH';
        var channels = isPublic ? App.publicChannels : App.privateChannels;
        channels[App.state.openChannels[i]].messageDom.find('.userentry').each(function(e){
            $(this).find('.nameplate').css('color', App.options.genderColours[App.characters[$(this).attr('title')].gender.toLowerCase()][0]);
            $(this).find('.statusimg').attr('title', App.characters[$(this).attr('title')]);
            $(this).find('.nameplate').attr('title', App.characters[$(this).attr('title')].statusmsg);
        });
        channels[App.state.openChannels[i]].userlistDom.find('.userentry').each(function(e){
            $(this).find('.nameplate').css('color', App.options.genderColours[App.characters[$(this).attr('title')].gender.toLowerCase()][0]);
            $(this).find('.statusimg').attr('title', App.characters[$(this).attr('title')]);
            $(this).find('.nameplate').attr('title', App.characters[$(this).attr('title')].statusmsg);
        });
    }
    
    for(var j = 0; j < App.state.openPMs.length; j++){
        App.characters[App.state.openPMs[j]].pms.messageDom.find('.userentry').each(function(e){
            $(this).find('.nameplate').css('color', App.options.genderColours[App.characters[$(this).attr('title')].gender.toLowerCase()][0]);
            $(this).find('.statusimg').attr('title', App.characters[$(this).attr('title')]);
            $(this).find('.nameplate').attr('title', App.characters[$(this).attr('title')].statusmsg);
        });
    }
}

function updateTitle(){
    var count = countQueuedFeedItems();
    var title = '';
    if(count > 0){
        title += '[' + count + '] ';
    }
    
    if(App.user.loggedInAs !== '' && typeof App.user.loggedInAs !== 'undefined'){
        title += App.user.loggedInAs;
    }
    
    if(title.length < 8){
        title += ' Strawberry';
    }
    
    document.title = title;
}

function checkForMsgFlood(){
    if(new Date().getTime() - App.state.lastMessageSentAt > App.serverVars['msg_flood'] * 1000){
        return false;
    }
    
    pushFeedItem(App.consts.feed.types.error, 'You must wait at least ' + App.serverVars['msg_flood'] + ' seconds between messages.');
    return true;    
}

/**
 * Channels ========================================================================================================================
 */

function selectChannel(name){
    // is this current already selected?
    if(App.state.selectedChannel === name){
        // Do nothing.
        return;
    }

    // Turn off the currently selected channel?
    turnOffSelectedChannel();

    // Turn on the new channel.
    if(name === ''){
        // Attach the no channel bg
        App.dom.channelContents.append(App.dom.noChannelWrapper);
                
        // Attach no channel text area.
        App.dom.textAreaHolder.append(App.dom.noChannelTextEntry);
        var textArea = App.dom.noChannelTextEntry.find('textarea');
        textArea.on('keypress', createChannelTextAreaOnKeyUpCallback(textArea, name)); 
        var button = App.dom.noChannelTextEntry.find('.textentrybutton');
        button.on('click', createChannelSendButtonOnKeyUpCallback(textArea, name));
        
        // Hide user list title.
        App.dom.userlistTopBar.hide();
        
        // Focus the text area.
        textArea.focus();
    }
    else {
        // Is the new chanel public or private?
        var isPublic = name.substr(0, 3) !== 'ADH';

        // Get the channel list
        var channels = isPublic ? App.publicChannels : App.privateChannels;

        // Attach the scroller
        App.dom.channelContents.append(channels[name].scroller);

        // Attach the text area.
        App.dom.textAreaHolder.append(channels[name].textEntry);
        // Listener
        var textArea = channels[name].textEntry.find('textarea');
        textArea.on('keypress', createChannelTextAreaOnKeyUpCallback(textArea, name)); 
        var button = channels[name].textEntry.find('.textentrybutton');
        button.on('click', createChannelSendButtonOnKeyUpCallback(textArea, name));

        // Attach the userlist
        App.dom.userlist.append(channels[name].userlistDom);

        // Select the channel's button
        channels[name].buttonDom.addClass('fabuttonselected');

        // Change the current title.
        App.dom.userlistTitle.text(channels[name].title);

        // Ensure the userlist title bar is showing
        App.dom.userlistTopBar.css('display', 'flex');
        
        // Focus the text area.
        textArea.focus();
        
        // Reset the scroll position
        channels[name].scroller.scrollTop(channels[name].scrollTop);
        
        // Turn off aniamtions.
        channels[name].buttonDom.stop();
        channels[name].buttonDom.css('background-color', '');
    }

    // Set newly selected channel
    App.state.selectedChannel = name;
}

function joinChannel(name){
    // Send the join request to the server.
    sendMessageToServer('JCH { "channel": "' + name + '" }');
}

function openChannel(name){
    // Is this channel already open?
    if(App.state.openChannels.indexOf(name) !== -1){
        throwError('Trying to open a channel that is already open: ' + name); 
        return;
    }
    
    // Is this a public or private channel?
    var isPublic = name.substr(0, 3) !== 'ADH';

    // Get the list of channels.
    var channels = isPublic ? App.publicChannels : App.privateChannels;

    // Push into the list of open channels.
    App.state.openChannels.push(name);

    // Do we need to create doms for this channel?
    if(typeof channels[name].userlistDom === 'undefined'){
        var domUserlist = createDomChannelUserlist();
        channels[name].userlistDom = domUserlist;
    }

    if(typeof channels[name].buttonDom === 'undefined'){
        var domButton = createDomChannelButton(isPublic, name, channels[name].title);
        channels[name].buttonDom = domButton;
    }
    
    if(typeof channels[name].scroller === 'undefined'){
        var domScroller = createDomChannelScroller();
        channels[name].scroller = domScroller;
    }
    
    if(typeof channels[name].textEntry === 'undefined'){
        var domTextEntry = createDomChannelTextEntry();
        var textArea = domTextEntry.find('textarea');
        channels[name].textEntry = domTextEntry;
    }
    
    if(typeof channels[name].messageDom === 'undefined'){
        var domMessages = createDomChannelContents();
        channels[name].messageDom = domMessages;
        
        // Append this to the channel's scroller.
        channels[name].scroller.append(domMessages);        
    }
    
    // Append the dom button to the channel list.
    App.dom.openChannelList.append(channels[name].buttonDom);
    
    // Add to array
    App.dom.buttonList.push(channels[name].buttonDom);

    // Add the click listener to the dom button
    channels[name].buttonDom.click(function(){
        var channelName = $(this).find('#data').attr('title');
        selectChannel(channelName);
    });

    // Sort the userlist.
    sortUserList(name);

    // (Re)Create the userlist
    channels[name].userlistDom.empty();
    for(var i = 0; i < channels[name].users.length; i++){
        var charName = channels[name].users[i];
        var dom = createDomUserEntry(charName, App.characters[charName].gender, App.characters[charName].status, App.characters[charName].statusmsg, false, name);
        channels[name].userlistDom.append(dom);
    }
        
    // How do I know if this room is private & locked?    
        
    // If this channel is listed (Ie not a private/locked room.);
    if(typeof channels[name].listEntry !== 'undefined'){
        // Set this channel's entry in the room list to on.
        channels[name].listEntry.addClass('selected');    
    
        // Update this channel's entry in the room list's char count
        var count = parseInt(channels[name].listEntry.find('#charcount').text());
        channels[name].listEntry.find('#charcount').text(count + 1);
    }

    // If no channel is selected, select this one
    if(App.state.selectedChannel === ''){
        selectChannel(name);
    }
    
    // Update any userentries we can find in the message dom.
    channels[name].messageDom.find('.userentry').each(function(){
        var nameplate = $(this).children('.nameplate');
        var character = nameplate.text();
        
        var statusimg = $(this).find('.statusimg');
        statusimg.attr('src', 'images/status-small-' + App.characters[character].status.toLowerCase() + '.png');
        statusimg.attr('title', stylizeStatus(App.characters[character].status));
        nameplate.attr('title', App.characters[character].statusmsg);
    });
    
}

function leaveChannel(name){
    sendMessageToServer('LCH { "channel": "' + name + '" }');
}

function closeChannel(name){
    // If this channel isn't in the list of open channels.
    if(App.state.openChannels.indexOf(name) === -1){
        //console.log('Error: Trying to close a channel that isn\'t open: ' + name);
        console.log(JSON.stringify(App.state.openChannels));
        pushFeedItem(App.consts.feed.types.error, 'Tried to close channel ' + name + ' when it isn\'t open.');
        return;
    }

    // Was the channel public?
    var isPublic = name.substr(0, 3) !== 'ADH';
    var channels = isPublic ? App.publicChannels : App.privateChannels;

    // Remove doms.
    channels[name].buttonDom.remove();
    channels[name].scroller.remove();
    channels[name].userlistDom.remove();   
    
    // remove form open channel list
    App.state.openChannels.splice(App.state.openChannels.indexOf(name), 1);
    
    // Unselect this channel's entry in the channel list
    if(typeof channels[name].listEntry !== 'undefined'){
        channels[name].listEntry.removeClass('selected');    
        
        // Update this channel's entry in the room list's char count
        var count = parseInt(channels[name].listEntry.find('#charcount').text());
        channels[name].listEntry.find('#charcount').text(count - 1);
    }
    
    // Remove button from button list
    var index = App.dom.buttonList.indexOf(channels[name].buttonDom);
    App.dom.buttonList.splice(index, 1);
    
    // What next?
    selectPreviousChannelOrPM(index);
    
    // Ensure the open channel list is scrolled correctly.
    var domChannels = $('.channels');   
    var domChanList = $('#channellist');
    
     // Is the content now offcscreen?
     if(domChanList.height() < domChannels.height()){
         domChanList.css('margin-top', 0);
     }
     else if(domChanList.height() < domChannels.height() - domChanList.css('margin-top').replace(/[^-\d\.]/g, '')){
         domChanList.css('margin-top', -(domChanList.height() - domChannels.height()));
     }
}

function receiveMessage(channel, character, message, buzz){
    var isPublic = channel.substr(0, 3) !== 'ADH';
    var channels = isPublic ? App.publicChannels : App.privateChannels;
    if(typeof channels[channel].messages === 'undefined'){
        channels[channel].messages = [];
    }
    channels[channel].messages.push([character, message]);

    // Check for anything we want to affect
    
    // Create dom
    var dom = createDomMessage(character, message, channel);
    
    // Check for dom interupts.
    checkForDomInterupts(dom, false, channel, character);
    
    // Is the scrollbar at the bottom?
    var domScroller = channels[channel].scroller;
    var autoScroll = domScroller.scrollTop() >= domScroller[0].scrollHeight - domScroller.height() - (20); // (20 == padding?)
    
    // Append dom.
    channels[channel].messageDom.append(dom);
        
    // if the scrollbar is already at the bottom..Scroll down the channel to the new message
    if(autoScroll){
        channels[channel].scroller.stop(true);        
        channels[channel].scroller.animate({
            scrollTop: channels[channel].scroller[0].scrollHeight
        }, 1000);
    }
    
    // If this channel isn't selected.
    if(buzz){
        if(App.state.selectedChannel !== channel){
            // Select this button
            animateButtonBuzz(channels[channel].buttonDom, true);
        }
    }
}

function animateButtonBuzz(button, up){
    //#4f8de1
    button.animate({
        backgroundColor: (up ? '#666666' : '#333333')
    }, 1500, up ? 'easeOutExpo' : 'easeInExpo', function(){
        animateButtonBuzz(button, !up);
    });
}

function characterJoinedChannel(character, channel){
    var isPublic = channel.substr(0, 3) !== 'ADH';
    var channels = isPublic ? App.publicChannels : App.privateChannels;
    
    // Add to list..
    channels[channel].users.push(character);
    channels[channel].users.sort();
    
    // Figure out which userlistentry (that's already in the dom) comes before the one we want to add.
    var newIndex = channels[channel].users.indexOf(character);
    var prevIndex = newIndex - 1;
    if(prevIndex < 0){
        prevIndex = 0;
    }
    
    // Create dom.
    var dom = createDomUserEntry(character, App.characters[character].gender, App.characters[character].status, App.characters[character].statusmsg, false, channel);
    
    // Get the userentry at the index we found and append this new user entry after it.
    channels[channel].userlistDom.find('.userentry').eq(prevIndex).after(dom);
        
    // Update this channel's entry in the channel list. (The room is private and not opened it won't be in the channel list.)
    if(typeof channels[channel].listEntry !== 'undefined'){
        channels[channel].listEntry.find('#charcount').text(channels[channel].users.length);
    }
}

function characterLeftChannel(character, channel){
    var isPublic = channel.substr(0, 3) !== 'ADH';
    var channels = isPublic ? App.publicChannels : App.privateChannels;
    
    // Remove from list
    var removed = channels[channel].users.splice(channels[channel].users.indexOf(character), 1);
    if(typeof removed === 'undefined'){
        // Tried to remove a character from a room but they weren't in there? Wtf.
        pushFeedItem(App.consts.feed.types.error, 'Server informed us that ' + character + ' left ' + channel + ' but we did not have them listed.');
        return;
    }
    
    // Remove the userlist entry.
    var userEntryDom = channels[channel].userlistDom.find('.userentry[title=' + character + ']');
    if(typeof userEntryDom === 'undefined' || userEntryDom.length === 0){
        pushFeedItem(App.consts.feed.types.error, character + ' left ' + channel + ' but we could not find their entry in the userlist.');
        return;
    }
    else if(userEntryDom.length > 1){
        pushFeedItem(App.consts.feed.types.error, character + ' left ' + channel + ' but we matched more than one entry to them in the userlist.');
        return;
    }
    else {
        userEntryDom.remove();
    }    
    
    // Update this channel's entry in the channel list.
    if(typeof channels[channel].listEntry !== 'undefined'){
        var count = parseInt(channels[channel].listEntry.find('#charcount').text());
        channels[channel].listEntry.find('#charcount').text(count - 1);
    }
}

function checkForMessageInterupts(message){
    
}

function checkForDomInterupts(dom, isPM, chanchar){
    // Auto-opening url links.
    /*dom.children('.urllink').each(function(){
        // If this url link is to a picture.
        var url = $(this).attr('title');
        var msg = $(this).text();
        if(isImageViewerUrl(url)){
            // Push this item into the picture
            pushImageToPictures(url, character, msg); 
        }
    });*/
    
    console.log("checking for placeholders.");
    
    // Check for urlplaceholders.
    dom.find('.messagetext').children('.urlplaceholder').each(function(){
        console.log("found one.");
        
        // Get the url
        var url = $(this).attr('title');
        
        // Is this a direct link to an image or video.
        if(url.match(/\.(jpeg|jpg|gif|gifv|png|webm)$/) !== null){
            // Is a direct image/video link.
            if(url.match(/\.(jpeg|jpg|gif|gifv|png)$/) !== null){
                // Create an image link.
                var elem = $('<span class="imagelink" title="' + url + '"><span class="fa fa-image"></span>' + $(this).text() +'</span>');
                $(this).after(elem);
                $(this).remove();
            }
            else if(url.match(/\.(webm)$/)) {
                // Create a video link.
                var elem = $('<span class="videolink" title="' + url + '"><span class="fa fa-film"></span>' + $(this).text() + '</span>');
                $(this).after(elem);
                $(this).remove();
            }
            else {
                pushFeedItem(App.consts.feed.types.error, 'URL matched one of our direct link extensions but could not determine which one.');
                return;
            }
        }
        
        // Check for domains.
        var uri = new URI(url);
        var domain = uri.domain();
        
        if(domain === 'youtube.com'){
            
        }
    });
}

function getBooruID(url){
    var uri = new URI(url);
    
}

function isImageViewerUrl(url){
    return(url.match(/\.(jpeg|jpg|gif|png|webm)$/) != null);
}

function isImageUrl(url){
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

function isWebmUrl(url){
    return(url.match(/\.(webm)$/) != null);
}

function createChannelTextAreaOnKeyUpCallback(textArea, channel){
    return function(e){
        if(e.which === 13 && !e.shiftKey){
            e.preventDefault();
            var result = sendChatMessageToActiveWindow(textArea.val());
            if(result){
                textArea.val('');
            }
            return;
        }
    };
}

function createChannelSendButtonOnKeyUpCallback(textArea, channel){
    return function(){
        var result = sendChatMessageToActiveWindow(textArea.val());
        if(result){
            textArea.val('');
        }
    }
}

function turnOffSelectedChannel(){
    if(App.state.selectedChannel !== ''){
        // If this is a pm
        if(App.state.selectedChannel === 'pm'){
            // Record the current scrolltop
            App.characters[App.state.selectedPM].pms.scrollTop = App.characters[App.state.selectedPM].pms.scroller.scrollTop();
            
            // Remove the message dom.
            App.characters[App.state.selectedPM].pms.scroller.remove();
            
            // Remove the text area
            App.characters[App.state.selectedPM].pms.textEntry.remove();
            
            // Deselect the pm's button.
            App.characters[App.state.selectedPM].pms.buttonDom.removeClass('fabuttonselected');
            
            // Return
            return;
        }
        
        // Is the selected channel public or private?
        var isPublic = App.state.selectedChannel.substr(0, 3) !== 'ADH';

        // get the channel list it belongs to
        var channels = isPublic ? App.publicChannels : App.privateChannels;

        // Record the current scrollTop
        channels[App.state.selectedChannel].scrollTop = channels[App.state.selectedChannel].scroller.scrollTop();

        // Remove the message dom.
        channels[App.state.selectedChannel].scroller.remove();
        
        // Remove the text area
        channels[App.state.selectedChannel].textEntry.remove();

        // Remove the userlist
        channels[App.state.selectedChannel].userlistDom.remove();

        // Deselect the channel's button
        channels[App.state.selectedChannel].buttonDom.removeClass('fabuttonselected');
    }
    else {
        // Turn off the no-channel bg
        App.dom.noChannelWrapper.remove();
        
        // TextArea
        App.dom.noChannelTextEntry.remove();
    }
}

/**
 * PMs =============================================================================================================================
 */

function selectPM(character){
    // Is this PM already selected?
    if(App.state.selectedChannel === 'pm' && App.state.selectedPM === character){
        // Do nothing
        return;
    }
    
    // Turn off the currently selected channel?
    turnOffSelectedChannel();

    // Turn on the new channel.
    if(character === ''){
        App.dom.channelContents.append(App.dom.noChannelWrapper);
        App.dom.userlistTopBar.hide();
    }
    else {
        // Attach the message dom
        App.dom.channelContents.append(App.characters[character].pms.scroller);
        
        // Select the channel's button
        App.characters[character].pms.buttonDom.addClass('fabuttonselected');
        
        // Attach the text area.
        App.dom.textAreaHolder.append(App.characters[character].pms.textEntry);
        // Listener
        var textArea = App.characters[character].pms.textEntry.find('textarea');
        textArea.on('keypress', createChannelTextAreaOnKeyUpCallback(textArea, name)); 
        var button = App.characters[character].pms.textEntry.find('.textentrybutton');
        button.on('click', createChannelSendButtonOnKeyUpCallback(textArea, name));
        
        // Change the current title.
        App.dom.userlistTitle.text(character);

        // Ensure the userlist title bar is showing
        App.dom.userlistTopBar.css('display', 'flex');
        
        // Reset the scroll position
        App.characters[character].pms.scroller.scrollTop(App.characters[character].pms.scrollTop);
        
        // Focus the text area.
        textArea.focus();
    }
    
    // Set newly selected channel
    App.state.selectedChannel = 'pm';
    App.state.selectedPM = character;
    
    // Turn off aniamtions.
    App.characters[character].pms.buttonDom.stop(true);
    App.characters[character].pms.buttonDom.css('background-color', '');
    
    // If any feed messages are pending for this character, remove them.
    
    // Remove form the queue.
    for(var i = 0; i < App.tools['feed'].queue.length; i++){
        var feedEntry = App.tools['feed'].queue[i];
        if(feedEntry[0] === App.consts.feed.types.pm){
            // Is this pm from the same person as this PM channel?
            if(feedEntry[3] === character){
                // Remove this feed entry.
                App.tools['feed'].queue.splice(i, 1);
                i--;
            }
        }
    }
    
    // Update the number.
    updateFeedQueueCounter();
        
    // TODO Remove any messages already in the dom?
}

function openPM(character){
    // Is this channel already open?
    if(App.state.openPMs.indexOf(character) !== -1){
        throwError('Trying to open a PM that is already open.');
        return;
    }

    // Push into the list of open pms;
    App.state.openPMs.push(character);

    // Do we need to create doms for this channel?
    if(typeof App.characters[character].pms.scroller === 'undefined'){
        var domScroller = createDomPMScroller();
        App.characters[character].pms.scroller = domScroller;
    }
    
    if(typeof App.characters[character].pms.messageDom === 'undefined'){
        var domMessages = createDomPMContents();
        App.characters[character].pms.messageDom = domMessages;
        App.characters[character].pms.scroller.append(domMessages);
    }
    
    if(typeof App.characters[character].pms.textEntry === 'undefined'){
        var domTextEntry = createDomPMTextEntry();
        App.characters[character].pms.textEntry = domTextEntry;
    }

    if(typeof App.characters[character].pms.buttonDom === 'undefined'){
        var domButton = createDomPMButton(character);
        App.characters[character].pms.buttonDom = domButton;
    }

    // Append the dom button to the channel list.
    App.dom.openChannelList.append(App.characters[character].pms.buttonDom);
    
    // Add to array
    App.dom.buttonList.push(App.characters[character].pms.buttonDom);

    // Add the click listener to the dom button
    App.characters[character].pms.buttonDom.click(function(){
        var characterName = $(this).find('#data').attr('title');
        selectPM(character);
    });
        
    // If no channel is selected, select this one
    if(App.state.selectedChannel === ''){
        selectPM(character);
    }
}

function closePM(character){
    // If this channel isn't in the list of open channels.
    if(App.state.openPMs.indexOf(character) === -1){
        console.log('Error: Trying to close a PM that isn\'t open: ' +character);
        console.log(JSON.stringify(App.state.openPMs));
        pushFeedItem(App.consts.feed.types.error, 'Tried to close PM for ' + character + ' when it isn\'t open.');
        return;
    }
    
    // Record the current scroll position
    App.characters[character].pms.scrollTop = App.characters[character].pms.scroller.scrollTop();
          
    // Remove doms.
    App.characters[character].pms.buttonDom.remove();
    App.characters[character].pms.scroller.remove();
    App.characters[character].pms.textEntry.remove();
    
    //App.characters[character].pms.userlistDom.remove();
    
    // Remove from open pm list
    App.state.openPMs.splice(App.state.openPMs.indexOf(character), 1);
    
    // remove button from button list.
    var index = App.dom.buttonList.indexOf(App.characters[character].pms.buttonDom);
    App.dom.buttonList.splice(index, 1);
    
    // What Next?
    selectPreviousChannelOrPM(index);
}


function receivePM(character, message, sender){
    // Is a pm for this character open?
    if(App.state.openPMs.indexOf(character) === -1){
        // Open a PM for this character.
        openPM(character);
    }
    
    // List
    if(typeof App.characters[character].pms.messages === 'undefined'){
        App.characters[character].pms.messages = [];
    }
    App.characters[character].pms.messages.push(message);
    
    // Is the scrollbar at the bottom?
    var domScroller = App.characters[character].pms.scroller;
    var autoScroll = domScroller.scrollTop() >= domScroller[0].scrollHeight - domScroller.height() - (20); // (20 == padding?)
    
    // Create dom
    var dom = createDomMessage(sender, message);
    App.characters[character].pms.messageDom.append(dom);
    
    // if the scrollbar is already at the bottom..Scroll down the channel to the new message
    if(autoScroll){
        App.characters[character].pms.scroller.stop(true);
        App.characters[character].pms.scroller.animate({
            scrollTop: App.characters[character].pms.scroller[0].scrollHeight
        }, 1000);
    }
    
    // Feed
    if(sender !== App.user.loggedInAs && (App.state.selectedChannel !== 'pm' || App.state.selectedPM !== sender)){
        pushFeedItem(App.consts.feed.types.pm, message, sender);
    }
    
    // typing status
    updateTypingStatus(sender, 'clear');
    
    if(App.state.selectedChannel !== 'pm' || App.state.selectedPM !== character){
        // Select this button
        animateButtonBuzz(App.characters[character].pms.buttonDom, true);
    }
}

/**
 * Tool Actions =====================================================================================================================
 */

/* Channel List */
function refreshChannels(){
    // Start the refesh button spinning
    App.tools['channels'].refreshbutton.addClass('fa-spin');

    // Send request message
    sendMessageToServer('CHA');
}

function channelListUpdated(){ // Called from parseServerMessage() when the public & private channel lists has been updated
    // Stop the refresh button spinning
    App.tools['channels'].refreshbutton.removeClass('fa-spin');

    // Clear any existing channel dom entries
    App.tools['channels'].entryPush.empty();
    App.tools['channels'].channelEntries = [];

    // Add a title seperator for "Public Channels"
    var sepDom = $('<div class="channellistseperator">Public Channels</div>');
    App.tools['channels'].entryPush.append(sepDom);

    var publicList = [];
    // Sort the entries
    for(var key in App.publicChannels){
        publicList.push(key);
    }
    publicList.sort();

    // Create entries for each channel
    var dom;
    for(var i = 0; i < publicList.length; i++){
        dom = createDomChannelListEntry(App.publicChannels[publicList[i]].name, App.publicChannels[publicList[i]].name, App.publicChannels[publicList[i]].characterCount);
        App.tools['channels'].entryPush.append(dom);
        App.publicChannels[publicList[i]].listEntry = dom;
        
        // is this room open?
        if(App.state.openChannels.indexOf(publicList[i]) !== -1){
            dom.addClass('selected');
        }
    }

    // Add a title seperator for "Private Channels"
    sepDom = $('<div class="channellistseperator">Private Channels</div>');
    App.tools['channels'].entryPush.append(sepDom);

    var privateList = [];
    for(key in App.privateChannels){
        // Only open channels.
        if(App.privateChannels[key].locked === false && !App.privateChannels[key].invalidated){
            privateList.push([App.privateChannels[key].title, key]);
        }
    }
    privateList.sort(function(a, b){
        var titleA = a[0].toLowerCase();
        var titleB = b[0].toLowerCase();

        if(titleA < titleB){
            return -1;
        }
        if(titleA > titleB){
            return 1;
        }
        return 0;
    });

    // Create entires
    for(i = 0; i < privateList.length; i++){
        dom = createDomChannelListEntry(privateList[i][1], privateList[i][0], App.privateChannels[privateList[i][1]].characterCount);
        App.tools['channels'].entryPush.append(dom);
        App.privateChannels[privateList[i][1]].listEntry = dom;
        
        // Is this room open?
        if(App.state.openChannels.indexOf(privateList[i][1]) !== -1){
            dom.addClass('selected');
        }
    }
}

/* Feed */
function pushFeedItem(type, message, sender){
    // Process BBCODE
    var bb = XBBCODE.process({
        text: message
    });

    // Get a unique ID for this feed item.
    var id = App.tools['feed'].uniqueID;
    App.tools['feed'].uniqueID++;

    // Push message into queue
    var queueObj = [type, id, bb.html, sender];
    App.tools['feed'].queue.push(queueObj);

    // Should we count this type of message?

    // If the feed is open, display the message immediately.
    if(App.state.currentTool === 'feed' && App.tools['feed'].currentlyDisplaying === false){
        displayQueuedFeedMessages();
    }
       
    // If the feed panel isn't open..
    // Show this message in the chat?
    if(App.state.currentTool !== 'feed' && App.state.selectedChannel !== '' && type !== App.consts.feed.types.pm){
        var domMsg = createDomToolFeedMessage(queueObj[0], queueObj[1], queueObj[2], queueObj[3]);
        var messageDom;
        if(App.state.selectedChannel === 'pm'){
            messageDom = App.characters[App.state.selectedPM].pms.messageDom;
        }
        else {
            var isPublic = App.state.selectedChannel.substr(0, 3) !== 'ADH';
            var channels = isPublic ? App.publicChannels : App.privateChannels;
            messageDom = channels[App.state.selectedChannel].messageDom;
        }
        
        messageDom.append(domMsg);
    }
    
    // Update queue.
    updateFeedQueueCounter();
}

function countQueuedFeedItems(){
    var x = 0;
    for(var i = 0; i < App.tools['feed'].queue.length; i++){
        var feedEntry = App.tools['feed'].queue[i];
        if(countFeedItemType(feedEntry[0])){
            x++;
        }
    }
    return x;
}

function updateFeedQueueCounter(){
    if(typeof App.tools['feed'].counter !== 'undefined'){
        var count = countQueuedFeedItems();
        App.tools['feed'].counter.text.text(count);
        
        if(count === 0){
            App.tools['feed'].counter.image.fadeOut();
            App.tools['feed'].counter.text.fadeOut();
        }
        else {
            App.tools['feed'].counter.image.fadeIn();
            App.tools['feed'].counter.text.fadeIn();
        }
    }
    
    // Update title.
    updateTitle();
}

function countFeedItemType(type){
    return type === App.consts.feed.types.alert || type === App.consts.feed.types.error || type === App.consts.feed.types.mention || type === App.consts.feed.types.pm;
}

function displayQueuedFeedMessages(){
    // if we're already displaying, don't bother
    if(App.tools['feed'].currentlyDisplaying){
        return;
    }

    if(App.tools['feed'].queue.length > 0){
        App.tools['feed'].currentlyDisplaying = true;
        displayNextFeedMessage(true);
    }

}

function displayNextFeedMessage(iterate){
    // Check that we actually have a new message
    if(App.tools['feed'].queue.length === 0){
        return;
    } 
    
    // Get scroller
    var domScroller = App.tools['feed'].scroller;
    var domMessageContainer = App.tools['feed'].messagePush;

    // Is the scrollbar at the bottom?
    var autoScroll = domScroller.scrollTop() >= domScroller[0].scrollHeight - domScroller.height();

    // Create dom
    var feedEntry = App.tools['feed'].queue.shift();
    var domMsg = createDomToolFeedMessage(feedEntry[0], feedEntry[1], feedEntry[2], feedEntry[3]);

    // Append dom to feed content.
    App.tools['feed'].messagePush.append(domMsg);

    // Fade in new message
    domMsg.hide();
    domMsg.fadeIn(500, function(){
        // Decrement the feed counter
        var curCount = parseInt(App.tools['feed'].counter.text.text());
        App.tools['feed'].counter.text.text(App.tools['feed'].queue.length + 1);
        if(App.tools['feed'].queue.length <= 0){
            // fade out
            App.tools['feed'].counter.image.fadeOut();
            App.tools['feed'].counter.text.fadeOut();
        }
    });

    // if the scrollbar is already at the bottom..Scroll down the feed to the new message
    if(autoScroll){
        App.tools['feed'].scroller.stop(true);
        App.tools['feed'].scroller.animate({
            scrollTop: App.tools['feed'].messagePush.height()
        }, 1000);
    }

    // If iterate
    if(iterate && App.tools['feed'].queue.length > 0){
        setTimeout(createNextFeedMessageTimeoutCallback(iterate), 200);
    }
    else {
        App.tools['feed'].currentlyDisplaying = false;
    }
    
    // Should this message be filtered out?
    var type = feedEntry[0];
    if((type === 'pm' && App.tools['feed'].filterPMs) || (type === 'info' && App.tools['feed'].filterInfo) || (type === 'friendinfo' && App.tools['feed'].filterFriendActivity) || 
        (type === 'bookmarkinfo' && App.tools['feed'].filterBookmarkActivity) || (type === 'error' && App.tools['feed'].filterErrors) || (type === 'mention' && App.tools['feed'].filterMentions)){
        domMsg.delay(2000).slideUp();
    }
    
    // If this was a PM, stop the PM channel button flashing.
    if(type === App.consts.feed.types.pm){
        App.characters[feedEntry[3]].pms.buttonDom.stop(true);
        App.characters[feedEntry[3]].pms.buttonDom.css('background-color', '');
    }
    
    // Recount
    updateFeedQueueCounter();
}

function createNextFeedMessageTimeoutCallback(iterate){
    return function(){
        displayNextFeedMessage(iterate);
    };
}

/* Viewer */
function targetViewerFor(target){
    // Set our target
    App.tools['viewer'].target = target;
    
    // Turn on/off the buttons.
    
    // PM
    if(target !== App.user.loggedInAs && isCharacterOnline(target)){
        App.tools['viewer'].buttonPM.show();
    }
    else {
         App.tools['viewer'].buttonPM.hide();       
    }
    
    // Bookmarks
    if(target !== App.user.loggedInAs){
        App.tools['viewer'].buttonBookmark.show();
        App.tools['viewer'].buttonBookmark.removeClass();
        
        var isBookmarked = isCharacterBookmarked(target);
        App.tools['viewer'].buttonBookmark.addClass('faicon fa ' + (isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'));
        App.tools['viewer'].buttonBookmark.attr('title', isBookmarked ? 'Remove Bookmark' : 'Add Bookmark');
    }
    else {
        App.tools['viewer'].buttonBookmark.hide();
    }
    
    // Friends
    if(target !== App.user.loggedInAs){
        App.tools['viewer'].buttonFriend.show();
        App.tools['viewer'].buttonFriend.removeClass();
        
        var isFriend = isCharacterOurFriend(target, false);
        App.tools['viewer'].buttonFriend.addClass('faicon fa ' + (isFriend ? 'fa-user-times' : 'fa-user-plus'));
        App.tools['viewer'].buttonFriend.attr('title', isFriend ? 'Un-friend' : 'Send Friend Request');
    }    
    else {
        App.tools['viewer'].buttonFriend.hide();
    }
    
    // Memo & Note
    if(target !== App.user.loggedInAs){
        App.tools['viewer'].buttonMemo.show();
        App.tools['viewer'].buttonNote.show();
    }
    else {
        App.tools['viewer'].buttonMemo.hide();
        App.tools['viewer'].buttonNote.hide();
    }
    
    // Disable all buttons
    //App.tools['viewer'].buttonPM.addClass('disabled');
    App.tools['viewer'].buttonBookmark.addClass('disabled');
    App.tools['viewer'].buttonFriend.addClass('disabled');
    App.tools['viewer'].buttonMemo.addClass('disabled');
    App.tools['viewer'].buttonNote.addClass('disabled');
    
    // Actual profile content.
    postForCharacter(target);
}

function viewerUpdateCharacterBasic(data){
    // Get character name
    var characterName = data.character.name;
    
    // Fetch container.
    var container = $('.toolviewerarea');
    
    // Clear any current data.
    container.empty();
    
    // Create avatar thumb.
    var domAvatar = $('<div class="toolviewerthumb"><img class="img-rounded" src="https://static.f-list.net/images/avatar/' + escapeHtml(characterName).toLowerCase() + '.png" title="' + characterName + '"/></div>');
    container.append(domAvatar);
    
    // Name
    container.append('<h1><b>' + characterName + '</b></h1>');
    
    // Description
    container.append('<p><b>Description</b></p>');
    var bb = XBBCODE.process({
        text: data.character.description
    });
    container.append('<p>' + bb.html + '</p>');    
}

function viewerUpdateCharacterInfo(data){
   // Fetch container
    var container = $('.toolviewerarea');
    
    // Contact details/sites.
    if(typeof data.info !== 'undefined'){
        var list;
        if(typeof data.info[1] !== 'undefined'){
            var contactDetails = data.info[1].items;
            if(contactDetails.length > 0){
                container.append('<p><b>Contact Details / Sites</b></p>');
                list = '<ul>';
                for(var i = 0; i < contactDetails[i].length; i++){
                    list += '<li><b>' + contactDetails[i].name + '</b>: ' + contactDetails[i].value + '</li>';
                }
                list += '</ul>';
                container.append(list);
            }
        }
        
        // Sexual Details
        if(typeof data.info[2] !== 'undefined'){
            var sexualDetails = data.info[2].items;
            if(sexualDetails.length > 0){
                container.append('<p><b>Sexual Details</b></p>');
                list = '<ul>';
                for(i = 0; i < sexualDetails.length; i++){
                    list += '<li><b>' + sexualDetails[i].name + '</b>: ' + sexualDetails[i].value + '</li>';
                }
                list += '</ul>';
                container.append(list);
            }
        }
        
        // General Details
        if(typeof data.info[3] !== 'undefined'){
            var generalDetails = data.info[3].items;
            if(generalDetails.length > 0){
                container.append('<p><b>General Details</b></p>');
                list = '<ul>';
                for(i = 0; i < generalDetails.length; i++){
                    list += '<li><b>' + generalDetails[i].name + '</b>: ' + generalDetails[i].value + '</li>';
                }
                list += '</ul>';
                container.append(list);
            }
        }
        
        // RPing Preferences.
        if(typeof data.info[5] !== 'undefined'){
            var rpingPrefs = data.info[5].items;
            if(rpingPrefs.length > 0){
                container.append('<p><b>RPing Preferences</b></p>');
                list = '<ul>';
                for(i = 0; i < rpingPrefs.length; i++){
                    list += '<li><b>' + rpingPrefs[i].name + '</b>: ' + rpingPrefs[i].value + '</li>';
                }
                list += '</ul>';
                container.append(list);
            }
        }
    }
}

function viewerUpdatePictures(data){
    if(typeof data.images !== 'undefined'){
        // fetch container
        var container = $('.toolviewerarea');
            
        // Loop images    
        for(var i = 0; i < data.images.length; i++){
            var domImage = $('<div class="viewerimage"></div>');
            
            domImage.append('<a href="' + data.images[i].url + '" target="_blank"><img class="img-responsive" src="' + data.images[i].url + '" title="' + data.images[i].description + '"/></a>');
            
            if(data.images[i].description.length > 0){
                domImage.append('<span class="viewerimagedescription">' + data.images[i].description + '</span></div>');
            }
            
            container.append(domImage);
        }
        
        // Re-enable buttons.
        //App.tools['viewer'].buttonPM.removeClass('disabled');
        App.tools['viewer'].buttonBookmark.removeClass('disabled');
        App.tools['viewer'].buttonFriend.removeClass('disabled');
        App.tools['viewer'].buttonMemo.removeClass('disabled');
        App.tools['viewer'].buttonNote.removeClass('disabled');
    }
}

/* Pictures */
function pushImageToPictures(url, sender, message, showPictures){
    var dom = createDomToolPicturesEntry(url, sender, message);
    App.tools['pictures'].scrollerContent.append(dom);
    if(showPictures && App.state.currentTool !== 'pictures'){
        toggleTool('pictures');
    }
    
    // Scroll pictures content to new element.
    App.tools['pictures'].scroller.stop(true);
    App.tools['pictures'].scroller.animate({
        scrollTop: App.tools['pictures'].scrollerContent.height()
    }, 2000);
}

/**
 * Tool Show Functions ==========================================================================================================
 * Fired from toggleTool(*) but only if the user clicked on a button to initiate it.
 */
function toolShowStatus(){
    
}

function toolShowChannelList(){
    // If we don't already have a channel list, fetch one automatically
    if(App.tools['channels'].entryPush.children().length === 0){
        refreshChannels();
    }
}

function toolShowViewer(){
    // refresh (set the target to the target it already has.)
    targetViewerFor(App.tools['viewer'].target);
}

function toolShowFriends(){

}

function toolShowPMs(){

}

function toolShowFeed(){
    displayQueuedFeedMessages();
}

function toolShowPictures(){
    
}

function toolShowInfo(){

}

function toolShowSettings(){

}

function toolShowLogout(){

}


/**
 * Layout & Navigation  =========================================================================================================
 */

function toggleTool(toolName, manual){
    if(App.state.currentTool === toolName){
        toolName = '';
    }
    
    // Is a channel open?
    var isScrollerAtBottom = false;
    if(App.state.selectedChannel !== ''){
        var isPM = App.state.selectedChannel === 'pm';
        var scrollingDom;
        if(!isPM){
            var isPublic = App.state.selectedChannel.substr(0, 3) !== 'ADH';
            var channels = isPublic ? App.publicChannels : App.privateChannels;
            scrollingDom = channels[App.state.selectedChannel].scroller;
        }
        else {
            scrollingDom = App.characters[App.state.selectedPM].pms.scroller;
        }
        
        // Is the scrolling dom at the bottom?
        isScrollerAtBottom = scrollingDom.scrollTop() >= scrollingDom[0].scrollHeight - scrollingDom.height() - (20);
    }

    // Turn off the old tool
    if(App.state.currentTool !== ''){
        // Hide the content dom
        App.tools[App.state.currentTool].content.hide();

        // Turn off the button highlight
        App.tools[App.state.currentTool].button.removeClass('fabuttonselected');
    }

    // Turn on new tool
    if(toolName !== ''){
        // Show the content dom
        App.tools[toolName].content.show();

        // Turn on the button highlight
        App.tools[toolName].button.addClass('fabuttonselected');
    }

    // Set as current tool
    App.state.currentTool = toolName;

    // Let this tool perform anything it needs to do when it's shown.
    if(toolName !== '' && manual){
        window[App.consts.tools[toolName].show]();
    }

    // Layout
    layout();
    
    // If the scroller was at the bottom before this..
    if(App.state.selectedChannel !== '' && isScrollerAtBottom){
        // Ensure it's still at the bottom
        var isPM = App.state.selectedChannel === 'pm';
        if(!isPM){
            var isPublic = App.state.selectedChannel.substr(0, 3) !== 'ADH';
            var channels = isPublic ? App.publicChannels : App.privateChannels;
            channels[App.state.selectedChannel].scroller.stop(true);
            channels[App.state.selectedChannel].scroller.scrollTop(channels[App.state.selectedChannel].scroller[0].scrollHeight);
        }
        else {
            App.characters[App.state.selectedPM].pms.scroller.scrollTop(App.characters[App.state.selectedPM].pms.scroller[0].scrollHeight);
        }
    }
}

function layout(){
    var containerWidth = $('.chatcontainer').width();
    if(App.state.currentTool !== ''){
        var newToolPanelWidth = containerWidth - (containerWidth * 0.6) - 64;
        $('.toolpanel').width((newToolPanelWidth / containerWidth * 100) + '%');
        $('.main').width('60%');
    }
    else {
        $('.main').width(((containerWidth - 64) / containerWidth * 100) + '%');
        $('.toolpanel').width('0%');
    }
}

function gotoNextChannel(){
    // If no channels/pms open.
    if(App.state.selectedChannel === ''){
        return;
    }
    
    // Find the current button.
    var buttonDom;
    var isPM = App.state.selectedChannel === 'pm';
    if(isPM){
        buttonDom = App.characters[App.state.selectedPM].pms.buttonDom;
    }
    else {
        var isPublic = App.state.selectedChannel.substr(0, 3) !== 'ADH';
        var channels = isPublic ? App.publicChannels : App.privateChannels;
        buttonDom = channels[App.state.selectedChannel].buttonDom;
    }
    
    // get the index of the button in the list.
    var currentIndex = App.dom.buttonList.indexOf(buttonDom);
    
    // Calculate the new index.
    var newIndex = currentIndex + 1;    
    if(newIndex >= App.dom.buttonList.length){
        newIndex = 0;
    }
    
    // Read the channel/pm name from the new button and check for PMs.
    var newButtonDom = App.dom.buttonList[newIndex];
    isPM = newButtonDom.attr('id').split('-')[0] === 'pm';
    var newName = newButtonDom.find('#data').attr('title');
    
    // Select the new channel/pm.
    if(isPM){
        selectPM(newName);
    }
    else {
        selectChannel(newName);
    }
}

/** 
 * Helper Functions ==========================================================================================================
 */

function isCharacterOnline(character){
    return typeof App.characters[character] !== 'undefined' && App.characters[character].status.toLowerCase() !== 'offline';
}

function isCharacterBookmarked(character){
    return App.user.bookmarks.indexOf(character) !== -1;
}

function isCharacterOurFriend(character, allCharacters){
    if(allCharacters){
        for(var key in App.user.friendsList){
            if(typeof App.user.friendsList[key] !== 'undefined' && App.user.friendsList[key].indexOf(character) !== -1){
                return true;
            }
        }        
    }
    else if(typeof App.user.friendsList[App.user.loggedInAs] !== 'undefined' && App.user.friendsList[App.user.loggedInAs].indexOf(character) !== -1){
         return true;
    }   
    
    return false;
}

function sortUserList(channelName){
    var isPublic = channelName.substr(0, 3) !== 'ADH';
    var channels = isPublic ? App.publicChannels : App.privateChannels;
    channels[channelName].users.sort(function(a, b){
        // Is this user a global admin?
		var isAdminA = App.ops.indexOf(a) != -1;
		var isAdminB = App.ops.indexOf(b) != -1;
		var isChatOpA = channels[channelName]['ops'].indexOf(a) != -1;
		var isChatOpB = channels[channelName]['ops'].indexOf(b) != -1;
		
		if(isAdminA && isAdminB){
			// Sort on alpha
			if(a < b) return 1
			else if(a > b) return -1;
			else return 0;
		}
		else if(isChatOpA && isChatOpB){
			// Sort on alpha
			if(a < b) return 1
			else if(a > b) return -1;
			else return 0;
		}
		else if(isAdminA && !isAdminB) return -1;
		else if(!isAdminA && isAdminB) return 1;
		else if(isChatOpA && !isChatOpB) return -1;
		else if(!isChatOpA && isChatOpB) return 1;
		else {
			// sort on alpha
			if(a < b) return -1
			else if(a > b) return 1;
			else return 0;
		}		
    });
}

function fixGender(genderFromServer){
    if(genderFromServer === 'Cunt-boy'){
        genderFromServer = 'Cuntboy';
    }
    else if(genderFromServer === 'Male-Herm'){
        genderFromServer = 'Maleherm';
    }
    return genderFromServer;
}

/**
 * Utility Functions ===========================================================================================================
 */

var entityMap = {
	'&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
    '/': '&#x2F;'
};

function escapeHtml(string) {
	return String(string).replace(/[&<>"'\/]/g, function (s) {
		return entityMap[s];
    });
}

function unescapeHtml(string){
    var e = document.createElement('div');
    e.innerHTML = string;
    return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
}

function escapeJson(string){
	return string
	.replace(/[\\]/g, '\\\\')
    .replace(/[\"]/g, '\\\"')
    .replace(/[\/]/g, '\\/')
    .replace(/[\b]/g, '\\b')
    .replace(/[\f]/g, '\\f')
    .replace(/[\n]/g, '\\n')
    .replace(/[\r]/g, '\\r')
    .replace(/[\t]/g, '\\t');
}

function getHumanReadableTimestampForNow(){
    var date = new Date();
    return padNumberToTwoDigits(date.getHours()) + ':' + padNumberToTwoDigits(date.getMinutes()) + ':' + padNumberToTwoDigits(date.getSeconds());
}

function padNumberToTwoDigits(number){
    return number < 10 ? '0' + number : number;
}

function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100);
    var seconds = parseInt((duration/1000)%60);
    var minutes = parseInt((duration/(1000*60))%60);
    var hours = parseInt((duration/(1000*60*60))%24);
    var days = parseInt((duration/(1000*60*60*24)));

    return days + ' day' + numberEnding(days) + ', ' + hours + ' hour' + numberEnding(hours) + ', ' + minutes + ' minute' + numberEnding(minutes) + ' & ' + seconds + ' second' + numberEnding(seconds) + '.';
}

function numberEnding (number) {
    return (number > 1) ? 's' : '';
}

function stripWhitespace(str){
	return str.replace(/ /g, '').replace(/[^\w\s]/gi, '');
}

function stylizeStatus(status){
    status = status.toLowerCase();
    if(status === 'dnd'){
        status = 'DND';
    }
    else {
        status = status.charAt(0).toUpperCase() + status.substr(1);
    }
    return status;
}

function arrayMove(array, from, to){
    array.splice(to, 0, array.splice(from, 1)[0]);
}


function checkUrlForPictureViewer(url){
    if(url.match(/\.(jpeg|jpg|gif|png|gifv)$/) !== null){
        return 'imagedirect';
    }
    else if(url.match(/\.(webm)$/) !== null){
        return 'webmdirect';
    }
    else if(extractDomain(url) === 'youtube'){
        return 'youtube';
    }
    else {
        return 'none';
    }
}



$.fn.selectRange = function(start, end) {
    if(end === undefined) {
        end = start;
    }
    return this.each(function() {
        if('selectionStart' in this) {
            this.selectionStart = start;
            this.selectionEnd = end;
        } else if(this.setSelectionRange) {
            this.setSelectionRange(start, end);
        } else if(this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};

String.prototype.splice = function(idx, rem, str){
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
}

/**
 * JSON Endpoint Helpers ===========================================================================================================
 */

function postForTicket(account, password){
    $.post('https://www.f-list.net/json/getApiTicket.php', 'account=' + account + '&password=' + password,
		function(data){
            // Handle errors.
            if(data.error.length > 0){
                // Show an alert
                var alertDom = createDomAlert(data.error);
                $('.loginalert').append(alertDom);
                alertDom.delay(5000).fadeOut(2000, function(){
                    $(this).remove();
                });
            }
            else {
                logInComplete(account, data.ticket, data.characters);
            }
        }
    );
}

function postForFriendsList(){
    $.post('https://www.f-list.net/json/api/friend-list.php', 
		'ticket=' + App.user.ticket + '&account=' + App.user.account,
		function(data){			
            var friends = data.friends;
			App.user.friendsList = {};
			for(var i = 0; i < friends.length; i++){
				var source = friends[i].source;
				var dest = friends[i].dest;
				if(typeof App.user.friendsList[source] === 'undefined'){
					App.user.friendsList[source] = [];
				}
				App.user.friendsList[source].push(dest);                
			}
                        
            App.state.logInReadyInfo.friendsListRetrieved = true;
            
            $('#loadingtext').text('Friends list received.');
            $('#loadingtext2').text('Requesting bookmarks list...');
            
            // Continuie on with log in process.
            postForBookmarks();        
		}
	);
}

function postForBookmarks(){
	$.post('https://www.f-list.net/json/api/bookmark-list.php', 
		'ticket=' + App.user.ticket + '&account=' + App.user.account,
		function(data){
            App.user.bookmarks = data.characters;
            App.state.logInReadyInfo.bookmarksRetrieved = true;
            
            $('#loadingtext').text('Bookmarks received.');
            $('#loadingtext2').text('Waiting for full user list to download... ' + App.state.logInReadyInfo.listedCharacters + ' / ' + App.state.logInReadyInfo.initialCharacterCount);
            
            // Log in process complete (except for full user list)
            checkForReadyStatus();                       
		}
	);
}

function postForCharacter(character){
	$.post('https://www.f-list.net/json/api/character-get.php',
		'name=' + escapeHtml(character).toLowerCase(),
		function(data){
			viewerUpdateCharacterBasic(data);
            postForCharacterInfo(character);
		}
	);
}

function postForCharacterInfo(character){
	$.post('https://www.f-list.net/json/api/character-info.php',
		'name=' + escapeHtml(character) + '&ticket=' + App.user.ticket + '&account=' + App.user.account,
		function(data){
            viewerUpdateCharacterInfo(data);
            postForPictures(character);
		}
	);
}

function postForPictures(character){
	$.post('https://www.f-list.net/json/api/character-images.php',
		'name=' + escapeHtml(character) + '&ticket=' + App.user.ticket + '&account=' + App.user.account,
		function(data){
            data['character'] = character;
			viewerUpdatePictures(data);
		}
	);
}

function postForGetMemo(character){
    $.post('https://www.f-list.net/json/api/character-memo-get.json', 
        'target=' + escapeHtml(character) + '&ticket=' + App.user.ticket + '&account=' + App.user.account,
        function(data){
            // Create the note dom
            var domNote = createDomMemo(App.tools['viewer'].target, data.note, data.id);
            $('.toolviewerarea').append(domNote);
            
            // Stop the button spinning
            App.tools['viewer'].buttonMemo.removeClass('fa-spin');
            
            // Scroll down to the note.
            $('.toolviewerscroller').animate({
                scrollTop: domNote.offset().top
            }, 2000);
        }
    );
}

function postForSetMemo(characterID, note){
    $.post('https://www.f-list.net/json/api/character-memo-save.json', 
        //'target=' + escapeHtml(character) + '&ticket=' + App.user.ticket + '&account=' + App.user.account + '&note=' + note,
        'target=' + characterID + '&ticket=' + App.user.ticket + '&account=' + App.user.account + '&note=' + escapeHtml(note),
        function(data){
            // Re-enable the button
            $('#memosend').prop('disabled', false);
            
            // Error check
            var prog;
            if(data.error.length > 0){
                // Oh dear.
                prog = $('#memoprogress');
                prog.removeClass();
                prog.addClass('fa fa-times');
                prog.show();  
                
                // Feed
                pushFeedItem(App.consts.feed.types.error, 'There was a problem saving the memo: ' + data.error);
            }
            else {
                // Change the progress to show the result.
                prog = $('#memoprogress');
                prog.removeClass();
                prog.addClass('fa fa-check');
                prog.show();  
            }
        }
    );
}

/**
 * createDom functions construct final dom elements using parameters and return a jQuery ============================================
 */

/* Login */
function createDomLogin(){
    // Construct HTML
    var html = '<div class="maincontainer">';
        html += '<div class="maincontent">';
            html += '<div>';
                html += '<img src="images/strawberry-alpha.png"/>';
            html += '</div>';
            html += '<div class="loginform">';
                html += '<form id="loginform" class="form-inline" role="form">';
                    html += '<input id="acc" type="text" class="form-control" placeholder="Account" required autofocus>';
                    html += '<input id="pwd" type="password" class="form-control" placeholder="Password" required>';
                    html += '<button id="btnsubmit" type="submit" class="btn btn-custom">Login</button>';
                html += '</form>';
            html += '</div>';
            html += '<div class="loginalert"></div>';
        html += '</div>';
    html += '</div>';

    // Create dom
    var dom = $(html);

    // Add listeners
    dom.find('#btnsubmit').click(function(e){
        // Prevent default button behaviour
        e.preventDefault();

        // Attempt to log in
        postForTicket($('#acc').val(), $('#pwd').val());
    });

    // Done
    return dom;
}

function createDomLoginCharacterSelector(){
    // Sort the user list
    App.user.characters.sort();

    // Construct DOM
    var domContainer = $('<div class="maincontainer"></div>');
    var domContent = $('<div class="maincontent"></div>');

    domContainer.append(domContent);

    // Loop and create character icon clickers.
    for(var i = 0; i < App.user.characters.length; i++){
        var characterName = App.user.characters[i];
        var escapedName = escapeHtml(characterName).toLowerCase();
        var domImage = $('<img class="charicon img-rounded" title="' + characterName + '" src="https://static.f-list.net/images/avatar/' + escapedName + '.png" width="100px" height="100px"/>');
        domContent.append(domImage);

        // listener
        domImage.click(createLoginCharListImageClickListener(characterName));
    }

    return domContainer;
}

function createLoginCharListImageClickListener(characterName){
    return function(){
        // Hide the login char list
        $('.maincontainer').remove();

        // Show the loading dom
        $('body').append(createDomLoginLoading());

        // Open the websocket
        $('#loadingtext').text('Attempting to connect to server.');
        openWebSocket(App.user.account, App.user.ticket, characterName);
    };
}

/* Login Loading */
function createDomLoginLoading(){
    // Construct dom
    var domContainer = $('<div class="maincontainer"></div>');
    var domContent = $('<div class="maincontent"></div>');
    var domLL = $('<div class="loginloadingcontent"></div>');

    domContainer.append(domContent);
    domContent.append(domLL);

    // select a random loading icon + flavour text to display.
    var index = Math.floor(Math.random() * App.consts.icons.loading.length);
    domLL.append('<span class="loadingicon fa fa-spin ' + App.consts.icons.loading[index][0] + '"></span>');
    domLL.append('<p id="loadingtext">Attempting to identify with server.</p>');
    domLL.append('<p id="loadingtext2">' + App.consts.icons.loading[index][1] + '</p>');

    return domContainer;
}

/* Main Area */
function createDomMainChat(){
    var domChatContainer = $('<div class="chatcontainer"></div>');

    var domMain = createDomMain();
    var domToolPanel = createDomToolPanel();
    var domMainMenu = createDomMainMenu();

    domChatContainer.append(domMain);
    domChatContainer.append(domToolPanel);
    domChatContainer.append(domMainMenu);

    // Create tools
    for(var key in App.consts.tools){
        createDomsTool(domMainMenu, domToolPanel, key);
    }

    // Special case the feed counter
    createFeedMessageCounter();

    // Create tool contents.
    createDomToolStatus();
    createDomToolChannelList();
    createDomToolFeed();
    createDomToolViewer();
    createDomToolFriendsList();
    createDomToolInfo();
    createDomToolPictures();
    createDomToolSettings();

    // ret
    return domChatContainer;
}

function createDomMain(){
    var domMain = $('<div class="main"></div>');

        var domChatArea = $('<div class="chatarea"></div>');
        domMain.append(domChatArea);

            var domChannels = $('<div class="channels"></div>');
            domChatArea.append(domChannels);
            
            
                var domChannelList = $('<div id="channellist"></div>');
                domChannels.append(domChannelList);
                App.dom.openChannelList = domChannelList;
                
                // Make channel list sortable.
                domChannelList.sortable({
                    start: function(event, ui){
                        ui.item.data('start', ui.item.index());
                    },
                    update: function(event, ui) {
                        // Move this item.
                        arrayMove(App.dom.buttonList, ui.item.data('start'), ui.item.index());
                    }
                });
                
                
                // Make open channel list scrollable
                domChannels.mouseenter(function(e){
                   // Start listening for mouse move events
                    domChannels.on('mousemove', function(e2){
                        // Caclulate the distance down the channel list
                        var parentOffset = domChannels.parent().offset();
                        App.dom.channelListScrolling.channelMouseDistance = (e2.pageY - parentOffset.top) / domChannels.height();					
                    });
                    App.dom.channelListScrolling.channelScrollingInterval = setInterval(function(){
                        var chanList = domChannelList;
                        var val, amount;
                        if(chanList.height() > domChannels.height()){
                            if(App.dom.channelListScrolling.channelMouseDistance < 0.1){
                                val = 1 - (App.dom.channelListScrolling.channelMouseDistance / 0.1);
                                amount = App.consts.channelListScrollingSpeed * val;
                                App.dom.channelListScrolling.curBottomMargin += amount;					
                            }
                            else if(App.dom.channelListScrolling.channelMouseDistance > 0.9) {
                                val = (App.dom.channelListScrolling.channelMouseDistance - 0.9) / 0.1;
                                amount = App.consts.channelListScrollingSpeed * val;
                                App.dom.channelListScrolling.curBottomMargin -= amount;					
                            }
                            
                            // Limit				
                            if( App.dom.channelListScrolling.curBottomMargin > 0){
                                 App.dom.channelListScrolling.curBottomMargin = 0;
                            }
                            else if( App.dom.channelListScrolling.curBottomMargin < domChannels.height() - chanList.height()){
                                 App.dom.channelListScrolling.curBottomMargin = domChannels.height() - chanList.height();
                            }
                            chanList.css('margin-top',  App.dom.channelListScrolling.curBottomMargin);
                        }		
                    }, 50);
                });
                domChannels.mouseleave(function(e){
                    // Stop listening for mouse move events
                    domChannels.off('mousemove');
                    // Kill interval
                    clearInterval(App.dom.channelListScrolling.channelScrollingInterval);
                });
                               
            // Channels.
            var domChannel = $('<div class="channel"></div>');
            domChatArea.append(domChannel);

                var domChannelContents = $('<div class="channelcontents"></div>');
                domChannel.append(domChannelContents);
                App.dom.channelContents = domChannelContents;
                    // Append each channel's scroller + message content to this.

                    // NOChannel Area
                    var domNoChannelWrapper = $('<div class="nochannelwrapper"></div>');
                    App.dom.noChannelWrapper = domNoChannelWrapper;
                    App.dom.channelContents.append(domNoChannelWrapper);

                        domNoChannelWrapper.append('<img id="nochannelimage" src="images/strawberry-alpha.png"/>');

            // Userlist.
            var domUserList = $('<div class="userlist"></div>');
            domChatArea.append(domUserList);

                var domUserListTopBar = $('<div class="userlisttopbar"></div>');
                domUserList.append(domUserListTopBar);
                App.dom.userlistTopBar = domUserListTopBar;

                    var domUserListTitle = $('<span id="userlistchanneltitle">An even longer title than before</span>');
                    domUserListTopBar.append(domUserListTitle);
                    App.dom.userlistTitle = domUserListTitle;

                    var domUserListCloseButton = $('<span id="userlistclosebutton" class="famuted fa fa-remove" title="Close Channel"></span>');
                    domUserListTopBar.append(domUserListCloseButton);
                    domUserListCloseButton.click(createUserListCloseButtonClickCallback());

                var domUserListScroller = $('<div class="userlistscroller"></div>');
                domUserList.append(domUserListScroller);
                App.dom.userlist = domUserListScroller;

    // Text Entry.
    var domTextEntry = $('<div class="textentry"></div>');
    domMain.append(domTextEntry);
    
        var domMainInput = $('<div class="maininputcontainer"></div>');
        domTextEntry.append(domMainInput);
        App.dom.textAreaHolder = domMainInput;
        
            // NoChannel Text Area..
            var domNoChannelTextEntry = createDomChannelTextEntry();
            var taNoChannel = domNoChannelTextEntry.find('textarea');
            App.dom.noChannelTextEntry = domNoChannelTextEntry; 
            App.dom.textAreaHolder.append(domNoChannelTextEntry);
            
            // Attach listener so the user can enter /commands even with no channel open.
            
            taNoChannel.on('keypress', createChannelTextAreaOnKeyUpCallback(taNoChannel, ''));
            
            // No channel button.

            /*
            var domTextArea = $('<textarea id="maininput"></textarea>');
            domMainInput.append(domTextArea);
            App.dom.mainTextEntry = domTextArea;
            domTextArea.on('keypress', function(e){
                if(e.which === 13 && !e.shiftKey){
                    e.preventDefault();
                    var result = sendChatMessageToActiveWindow(App.dom.mainTextEntry.val());
                    if(result){
                        App.dom.mainTextEntry.val('');
                    }
                    return;
                }
                else if(e.which !== 16){
                    if(App.state.selectedChannel === 'pm'){
                        var pmsObj = App.characters[App.state.selectedPM].pms;
                        if(pmsObj.typingTimeout === 'undefined' || pmsObj.typingTimeout === null){
                            // Send message
                            sendMessageToServer('TPN { "character": "' + App.state.selectedPM + '", "status": "typing" }');
                            // Set timeout
                            pmsObj.typingTimeout = setTimeout(createTypingStatusTimeoutCallback(App.state.selectedPM), 5000);
                            // Record character
                        }
                        else {
                            
                            
                            // Just extend the timeout for this character
                            clearTimeout(pmsObj.typingTimeout);
                            
                            // Set new timeout
                            pmsObj.typingTimeout = setTimeout(createTypingStatusTimeoutCallback(App.state.selectedPM), 5000);
                        }
                    }
                }
            });*/

    /*
        var domBottomButtons = $('<div class="bottombuttons"></div>');
        domTextEntry.append(domBottomButtons);
        
            
            var domTextEntryButton = $('<button id="btnsendmessage" type="submit" class="btn btn-default" autocomplete="off">Send</button>');
            domBottomButtons.append(domTextEntryButton);
            App.dom.mainTextEntryButton = domTextEntryButton;
            domTextEntryButton.click(function(e){
                e.preventDefault();
                
                // Clear the typing status timeout
                if(App.state.selectedChannel === 'pm'){
                    clearTimeout(App.characters[App.state.selectedPM].pms.typingTimeout);
                }
                
                var result = sendChatMessageToActiveWindow(App.dom.mainTextEntry.val());
                if(result){
                    App.dom.mainTextEntry.val('');
                }
            });
            */

    return domMain;
}

function createUserListCloseButtonClickCallback(){
    return function(){
        if(App.state.selectedChannel !== 'pm'){
            leaveChannel(App.state.selectedChannel);
        }
        else {
            closePM(App.state.selectedPM);
        }
    };
}

function createTypingStatusTimeoutCallback(character){
    return function(){
        // Send message
        sendMessageToServer('TPN { "character": "' + character + '", "status": "paused" }');
        // Clear timeout
        App.characters[character].pms.typingTimeout = null;
    };
}

function createDomMainMenu(){
    var domMainMenu = $('<div class="mainmenu"></div>');
    return domMainMenu;
}

function createDomToolPanel(){
    var domToolPanel = $('<div class="toolpanel"></div>');
    return domToolPanel;
}

/* All Tools */
function createDomsTool(domMainMenu, domToolPanel, name){
    // Create the doms
    var buttonDom = $('<div class="fabutton" title="' + App.consts.tools[name].title + '"></div>');
    
    var domIcon = $('<span class="fa ' + App.consts.tools[name].icon + '"></span>');
    buttonDom.append(domIcon);
    
    var domTint = $('<div class="hovertint"></div>');
    buttonDom.append(domTint);    
    
    var contentDom = $('<div class="toolcontainer tool' + name + '"></div>');

    // Append these doms.
    domMainMenu.append(buttonDom);
    domToolPanel.append(contentDom);

    // Store this tool's doms.
    if(typeof App.tools[name] === 'undefined'){
         App.tools[name] = {};
    }
    App.tools[name].button = buttonDom;
    App.tools[name].content = contentDom;

    // Attach click listener
    buttonDom.click(createToolClickListener(name));
}

function createToolClickListener(name){
    return function(){
        toggleTool(name, true);
    };
}

function createFeedMessageCounter(){
    App.tools['feed'].counter = {};

    var domCounter = $('<img class="feedcounter" src="images/feed-counter.png"/>');
    App.tools['feed'].button.append(domCounter);
    App.tools['feed'].counter.image = domCounter;

    var domText = $('<div class="feedcountnumber"></div>');
    App.tools['feed'].button.append(domText);
    App.tools['feed'].counter.text = domText;

    // Hide both for now.
    domCounter.hide();
    domText.hide();
    
    // Should we show them already?
    App.tools['feed'].counter.text.text('0');
    
    /*if(App.tools['feed'].queue.length > 0){
        App.tools['feed'].counter.text.text(App.tools['feed'].queue.length);
        App.tools['feed'].counter.image.fadeIn();
        App.tools['feed'].counter.text.fadeIn();
    }*/
}

/* Individual Tools */
function createDomToolStatus(){

    // Top content (avatar / dropdown + messagebox)
    var domContent = $('<div id="toolstatuscontenttop"></div>');

    var domAvatar = $('<img id="statusavatar" class="img-rounded" src="https://static.f-list.net/images/avatar/' + escapeHtml(App.user.loggedInAs).toLowerCase() + '.png" title="' + App.user.loggedInAs + '"/>');
    domContent.append(domAvatar);

    var domFormContainer = $('<div id="statusform"></div>');
    domContent.append(domFormContainer);

    var domDropDown = $('<select id="statusdd" name="status"><option value="online">Online</option><option value="looking">Looking</option><option value="busy">Busy</option><option value="away">Away</option><option value="dnd">DND</option></select>');
    domFormContainer.append(domDropDown);
    domDropDown.on('change', function(e){
        App.tools['status'].progressIcon.fadeOut();
    });

    var domTextArea = $('<textarea id="statusmessage" maxlength="255"></textarea>');
    domFormContainer.append(domTextArea);
    domTextArea.on('keydown', function(e){
        App.tools['status'].progressIcon.fadeOut();
    });

    // Append
    App.tools['status'].content.append(domContent);

    // bottom content
    var botContent = $('<div id="toolstatuscontentbottom"></div>');
    App.tools['status'].content.append(botContent);

    var btnReset = $('<button id="btnstatusreset" type="submit" class="btn btn-default">Reset</button>');
    botContent.append(btnReset);
    btnReset.click(function(){
        App.tools['status'].dropdown.val(App.characters[App.user.loggedInAs].status.toLowerCase());
        App.tools['status'].textarea.val(App.characters[App.user.loggedInAs].statusmsg);
    });
    
    var domCont = $('<div></div>');
    var domInProgressConfirm = $('<span id="statusprogress" class="fa fa-spinner fa-spin"></span>');
    domCont.append(domInProgressConfirm);
    domInProgressConfirm.hide();
    var btnUpdate = $('<button id="btnstatusupdate" type="submit" class="btn btn-default">Update</button>');
    domCont.append(btnUpdate);
    btnUpdate.click(function(){
        // Is the button disabled?
        if(!$(this).hasClass('disabled')){
            // Send Message
            sendMessageToServer('STA { "status": "' + App.tools['status'].dropdown.val() + '", "statusmsg": "' + escapeJson(App.tools['status'].textarea.val()) + '" }');
            
            // Show progress spinner.
            App.tools['status'].progressIcon.removeClass();
            App.tools['status'].progressIcon.addClass('fa fa-spinner fa-spin');
            App.tools['status'].progressIcon.show();
            
            // Disable Update button
            App.tools['status'].updatebutton.addClass('disabled');
            
            // Timeouts
            setTimeout(function(){
                App.tools['status'].progressIcon.fadeOut();
                App.tools['status'].updatebutton.removeClass('disabled');           
            }, 5000);
        }
    });
    
    botContent.append(domCont);

    // store
    App.tools['status'].dropdown = domDropDown;
    App.tools['status'].textarea = domTextArea;
    App.tools['status'].updatebutton = btnUpdate;
    App.tools['status'].progressIcon = domInProgressConfirm;
}

function createDomToolChannelList(){
    // Title Bar
    var domTitleBar = $('<div class="tooltopbar"></div>');
    App.tools['channels'].content.append(domTitleBar);

    // buttons
    var btnNew = $('<span class="faicon fa fa-plus" title="New Channel"></span>');
    domTitleBar.append(btnNew);

    var btnRefresh = $('<span class="faicon fa fa-refresh" title="Refresh"></span>');
    domTitleBar.append(btnRefresh);
    App.tools['channels'].refreshbutton = btnRefresh;
    btnRefresh.click(function(){
        refreshChannels();
    });

    // Scroller
    var domScroller = $('<div class="toolchannellistscroller"></div>');
    App.tools['channels'].content.append(domScroller);

    // Push
    var domEntryPush = $('<div class="toolchannellistentries"></div>');
    domScroller.append(domEntryPush);
    App.tools['channels'].entryPush = domEntryPush;
}

function createDomChannelListEntry(channelName, channelTitle, characterCount){
    var domContainer = $('<div class="channellistentry"></div>');

    var domRoomName = $('<span>' + channelTitle + '</span>');
    domContainer.append(domRoomName);

    var domCharCount = $('<span id="charcount">' + characterCount + '</span>');
    domContainer.append(domCharCount);

    var domHidden = $('<span id="data" title="' + channelName + '" style="display: none;"></span>');
    domContainer.append(domHidden);
    
    var domTint = $('<div class="hovertint"></div>');
    domContainer.append(domTint);
    
    domContainer.click(function(){
        // Get the hidden data.
        var chanName = $(this).find('#data').attr('title');
        
        // Is this channel open already?
        if(App.state.openChannels.indexOf(chanName) === -1){
            joinChannel(chanName);
        }
        else {
            leaveChannel(chanName);
        }
    });

    return domContainer;
}

function createDomToolFeed(){
    var domTitleBar = $('<div class="tooltopbar feedtopbar"></div>');
    App.tools['feed'].content.append(domTitleBar);

    // buttons
    var domMainButtons = $('<div class="feedmainbuttons"></div>');
    domTitleBar.append(domMainButtons);
    
    var domOtherButtons = $('<div class="feedotherbuttons"></div>');
    domTitleBar.append(domOtherButtons);
    
    var btnFilterInfo = $('<span class="faicon fa fa-info-circle" title="Hide Info"></span>');
    domMainButtons.append(btnFilterInfo);
    btnFilterInfo.click(function(){
        if($(this).hasClass('fa-info-circle')){
            $(this).removeClass('fa-info-circle');
            $(this).addClass('fa-circle-o');
            $(this).attr('title', 'Show Info');
            // Loop through pms and hide any that are pms.
            $('.toolfeedmessages').children('.finfo').each(function(e){
                $(this).slideUp();            
            });
            App.tools['feed'].filterInfo = true;
        }
        else {
            $(this).removeClass('fa-circle-o');
            $(this).addClass('fa-info-circle');
            $(this).attr('title', 'Hide Info');
            // Loop through pms and hide any that are pms.
            $('.toolfeedmessages').children('.finfo').each(function(e){
                $(this).slideDown();            
            });
            App.tools['feed'].filterInfo = false;
        }
    });
    
    var btnFilterPM = $('<span class="faicon fa fa-comments" title="Hide PMs"></span>');
    domMainButtons.append(btnFilterPM);
    btnFilterPM.click(function(){
        if($(this).hasClass('fa-comments')){
            $(this).removeClass('fa-comments');
            $(this).addClass('fa-comments-o');
            $(this).attr('title', 'Show PMs');
            // Loop through pms and hide any that are pms.
            $('.toolfeedmessages').children('.fpm').each(function(e){
                $(this).slideUp();            
            });
            App.tools['feed'].filterPMs = true;
        }
        else {
            $(this).removeClass('fa-comments-o');
            $(this).addClass('fa-comments');
            $(this).attr('title', 'Hide PMs');
            // Loop through pms and show any that are pms.
            $('.toolfeedmessages').children('.fpm').each(function(e){
                $(this).slideDown();
            });
            App.tools['feed'].filterPMs = false;
        }
    });
    
    var btnFilterAlerts = $('<span class="faicon fa fa-exclamation-circle" title="Hide Alerts"></span>');
    domMainButtons.append(btnFilterAlerts);
    btnFilterAlerts.click(function(){
        if($(this).hasClass('fa-exclamation-circle')){
            $(this).removeClass('fa-exclamation-circle');
            $(this).addClass('fa-circle-o');
            $(this).attr('title', 'Show Alerts');
            // Loop through feed items and slidedown
            $('.toolfeedmessages').children('.falert').each(function(e){
                $(this).slideUp();
            });
            App.tools['feed'].filterAlerts = true;
        }
        else {
            $(this).removeClass('fa-circle-o');
            $(this).addClass('fa-exclamation-circle');
            $(this).attr('title', 'Hide Alerts');
            // Loop through feed items and slidedown
            $('.toolfeedmessages').children('.falert').each(function(e){
                $(this).slideDown();
            });
            App.tools['feed'].filterAlerts = false;
        }
    });

    var btnFilterMentions = $('<span class="faicon fa fa-commenting" title="Hide Mentions"></span>');
    domMainButtons.append(btnFilterMentions);
    btnFilterMentions.click(function(){
        if($(this).hasClass('fa-commenting')){
            $(this).removeClass('fa-commenting');
            $(this).addClass('fa-commenting-o');
            $(this).attr('title', 'Show Mentions');
            // Loop through feed items and slidedown
            $('.toolfeedmessages').children('.fmention').each(function(e){
                $(this).slideUp();
            });
            App.tools['feed'].filterMentions = true;
        }
        else {
            $(this).removeClass('fa-commenting-o');
            $(this).addClass('fa-commenting');
            $(this).attr('title', 'Hide Mentions');
            // Loop through feed items and slidedown
            $('.toolfeedmessages').children('.fmention').each(function(e){
                $(this).slideDown();
            });
            App.tools['feed'].filterMentions = false;
        }
    });

    var btnFilterErrors = $('<span class="faicon fa fa-exclamation-circle" title="Hide Errors"></span>');
    domMainButtons.append(btnFilterErrors);
    btnFilterErrors.click(function(){
        if($(this).hasClass('fa-exclamation-circle')){
            $(this).removeClass('fa-exclamation-circle');
            $(this).addClass('fa-circle-o');
            $(this).attr('title', 'Show Errors');
            // Loop through feed items and slidedown
            $('.toolfeedmessages').children('.ferror').each(function(e){
                $(this).slideUp();
            });
            App.tools['feed'].filterErrors = true;
        }
        else {
            $(this).removeClass('fa-circle-o');
            $(this).addClass('fa-exclamation-circle');
            $(this).attr('title', 'Hide Errors');
            // Loop through feed items and slidedown
            $('.toolfeedmessages').children('.ferror').each(function(e){
                $(this).slideDown();
            });
            App.tools['feed'].filterErrors = false;
        }
    });
    
    var btnTrashAll = $('<span class="faicon fa fa-trash" title="Trash All"></span>');
    domOtherButtons.append(btnTrashAll);
    btnTrashAll.click(function(){
        App.tools['feed'].currentlyDisplaying = false;
        App.tools['feed'].counter.text.text('');
        App.tools['feed'].counter.text.fadeOut();
        App.tools['feed'].counter.image.fadeOut();
        App.tools['feed'].queue = [];
        App.tools['feed'].messagePush.children().slideUp(function(){
            $(this).remove();
        });
    });

    // scroller
    var domScroller = $('<div class="toolfeedscroller"></div>');
    App.tools['feed'].content.append(domScroller);
    App.tools['feed'].scroller = domScroller;

    // Push
    var domMessages = $('<div class="toolfeedmessages"></div>');
    domScroller.append(domMessages);
    App.tools['feed'].messagePush = domMessages;
}

function createDomToolFeedMessage(type, id, message, sender){    
    // Create a message dom for this message.
    var domMsg = $('<div class="feedmessage" title="' + id +'"></div>');
    
    var domContainer = $('<div class="feedcontainer"></div>');
    domMsg.append(domContainer);   
    
    var domTitle = $('<div class="feedtitle"></div>');
    domContainer.append(domTitle);
    
     var domMessage = $('<div class="feedpmmessage"></div>');
    domContainer.append(domMessage);
    
    // Stuff to add before buttons get added.
    if(type === 'pm'){
        // data
        var domData = $('<span id="data" title="' + sender + '"></span>');
        domMsg.append(domData);
        
        var domAvatar = $('<img class="pmavatar img-rounded" title="' + sender + '" src="https://static.f-list.net/images/avatar/' + escapeHtml(sender).toLowerCase() + '.png">');
        domMessage.append(domAvatar);
    }
    
    // buttons
    var domRightButtons = $('<div class="feedpmbuttons"></div>');
    domContainer.append(domRightButtons);
    
    var domRBTwo = $('<div class="feedpmsbuttonstretch"></div>');
    domRightButtons.append(domRBTwo);
    
    var domTopButtons = $('<div></div>');
    domRBTwo.append(domTopButtons);
    
    var domBtnClose = $('<span class="faicon fa fa-times" title="Close Message"></span>');
    domTopButtons.append(domBtnClose);
    domBtnClose.click(function(){
        $(this).closest('.feedmessage').slideUp('slow', function(){
            $(this).remove();
            
            // Remove this feed item from the feed queue, feed push dom and channels.
            removeAllFeedItemsWithID(parseInt($(this).closest('.feedmessage').attr('title')));
        });
    });    
       
    var ttl = getHumanReadableTimestampForNow() + ' - ';
    switch(type){
        case 'info':
            ttl += 'Info';
            break;
        case 'error':
            ttl += 'Error';
            break;
        case 'alert':
            ttl += 'Alert';
            break;
        case 'mention':
            ttl += 'Mention';
            break;
        case 'pm':
            ttl += sender;
            break;
    }        
    
    domTitle.append(ttl);
        
    if(type === 'pm'){   
        message = ': ' + message;
        
        var domBtnView = $('<span class="faicon fa fa-eye" title="View ' + sender + '"></span>');
        domTopButtons.append(domBtnView);
        domBtnView.click(function(){
            targetViewerFor($(this).parent().parent().parent().parent().parent().find('#data').attr('title')); // parentception
            toggleTool('viewer');
        });
        
        var domBtnPM = $('<span class="faicon fa fa-comments" title="Goto PM"></span>');
        domTopButtons.append(domBtnPM);
        domBtnPM.click(createFeedPMGotoPMButtonClickCallback(sender, domMsg));
        
        var domBtnReply = $('<span class="faicon fa fa-reply" title="Reply Here"></span>');
        domRBTwo.append(domBtnReply);
        domBtnReply.click(function(){
            // Append the reply box
            var domReply = $('<div></div>');
            
            var domTA = $('<textarea class="replytextarea"></textarea>');
            domReply.append(domTA);
            
            var domTASend = $('<button class="btn btn-default">Send</button>');
            domReply.append(domTASend);
            domTASend.click(function(){
                // Can we send a message yet?
                if(checkForMsgFlood()){
                    return;
                }
                
                var textArea = $(this).parent().find('.replytextarea');
                var recipient = $(this).parent().parent().find('#data').attr('title');
                var result = sendMessage(textArea.val(), true, recipient);
                if(result){
                    // Disable the send button.
                    $(this).addClass('disabled');
                    
                    // Remove the text area and replace.
                    var sentMessage = $('<div class="feedsentmessage"></div>');
                    sentMessage.append('> ' + textArea.val());
                    textArea.parent().append(sentMessage);
                    sentMessage.hide();
                    sentMessage.fadeIn();
                    
                    textArea.fadeOut(function(){
                        $(this).remove();
                    });
                    
                    $(this).fadeOut(function(){
                        $(this).remove();
                    });
                }
            });
            
            $(this).closest('.fpm').append(domReply);
            domReply.hide();
            domReply.slideDown();
            
            $(this).fadeOut();
        });
        
        var domUserEntry = createDomUserEntry(sender, App.characters[sender].gender, App.characters[sender].status, App.characters[sender].statusmsg);
        domMessage.append(domUserEntry);
    }
    
    domMessage.append(message);
        
    // Extra classes
    switch(type){
        case 'pm':
            domMsg.addClass('fpm');
            break;
        case 'info':
            domMsg.addClass('finfo');
            break;
        case 'error':
            domMsg.addClass('ferror');
            break;
        case 'alert':
            domMsg.addClass('falert');
            break;
        case 'mention':
            domMsg.addClass('fmention');
            break;
    }
    
    // return
    return domMsg;
}

function removeAllFeedItemsWithID(id){
    // Remove from the queue.
    for(var i = 0; i < App.tools['feed'].queue.length; i++){
        var feedEntry = App.tools['feed'].queue[i];
        if(feedEntry[1] === id){
            App.tools['feed'].queue.splice(i, 1);
            i--;
        }
    }
    
    // Remove from feed dom.
    $('.toolfeedmessages').children('.feedmessage[title="' + id + '"]').slideUp(function(){
        $(this).remove();
    });
    
    // Remove from channels.
    for(var i = 0; i < App.state.openChannels.length; i++){
        var isPublic = App.state.openChannels[i].substr(0, 3) !== 'ADH';
        var channels = isPublic ? App.publicChannels : App.privateChannels;
        channels[App.state.openChannels[i]].messageDom.children('.feedmessage[title="' + id + '"]').slideUp(function(){
            $(this).remove();
        });
    }
    
    // Reset the feed counter
    updateFeedQueueCounter();
}

function createFeedPMGotoPMButtonClickCallback(sender, dom){
    return function(){
        // If the PM isn't open..
        if(App.state.openPMs.indexOf(sender) === -1){
            openPM(sender);
        }
        else {
            // Just select the open PM.
            selectPM(sender);
        }
        
        // Close the dom.
        dom.slideUp(function(){
            $(this).remove();
        });
    };
}

function createDomToolViewer(){
    var domTitleBar = $('<div class="tooltopbar"></div>');
    App.tools['viewer'].content.append(domTitleBar);
    
    // buttons
    var btnOpenProfile = $('<span class="faicon fa fa-external-link" title="Open Profile"></span>');
    domTitleBar.append(btnOpenProfile);
    App.tools['viewer'].buttonProfile = btnOpenProfile;
    btnOpenProfile.click(function(){
        window.open('https://www.f-list.net/c/' + escapeHtml(App.tools['viewer'].target), '_blank');
    });
    
    var btnSendNote = $('<span class="faicon fa fa-envelope" title="Send Note"></span>');
    domTitleBar.append(btnSendNote);
    App.tools['viewer'].buttonNote = btnSendNote;
    btnSendNote.click(function(){
        // No way to send notes via jsonendpoints or client commands so just open the PM url.
        window.open('https://www.f-list.net/read_notes.php?send=' + escapeHtml(App.tools['viewer'].target), '_blank');        
    });
    
    var btnMemo = $('<span class="faicon fa fa-sticky-note" title="View/Edit Memo"></span>');
    domTitleBar.append(btnMemo);
    App.tools['viewer'].buttonMemo = btnMemo;
    btnMemo.click(function(){
        // If this button isn't disbaled.
        if(!$(this).hasClass('disabled')){
            // If the memo container doesn't already exist
            if($('.toolviewerarea').find('.memocontainer').length === 0){
                // Post for the memo
                postForGetMemo(App.tools['viewer'].target);
                
                // Spin the note icon
                $(this).addClass('fa-spin');
            }
            else {
                var scr = $('.toolviewerscroller');
                scr.stop(true);
                scr.animate({
                    scrollTop: scr[0].scrollHeight
                }, 2000);
            }
        }
    });
    
    var btnFriend = $('<span class="faicon fa fa-user-plus" title="Send Friend Request"></span>');
    domTitleBar.append(btnFriend);
    App.tools['viewer'].buttonFriend = btnFriend;
    
    var btnBookmark = $('<span class="faicon fa fa-bookmark-o" title="Bookmark"></span>');
    domTitleBar.append(btnBookmark);   
    App.tools['viewer'].buttonBookmark = btnBookmark;
    
    var btnOpenPM = $('<span class="faicon fa fa-comments" title="Open PM"></span>');
    domTitleBar.append(btnOpenPM);
    App.tools['viewer'].buttonPM = btnOpenPM;
    btnOpenPM.click(function(){
        if(App.state.openPMs.indexOf(App.tools['viewer'].target) === -1){
            openPM(App.tools['viewer'].target);
        }
        selectPM(App.tools['viewer'].target);
    });
    
    // Scroller
    var domScroller = $('<div class="toolviewerscroller"></div>');
    App.tools['viewer'].content.append(domScroller);
    App.tools['viewer'].scroller = domScroller;
    
    // Push
    var domContent = $('<div class="toolviewerarea"></div>');
    domScroller.append(domContent);
    App.tools['viewer'].scrollerContent = domContent; 
}

function createDomMemo(recipient, note, recipientID){
    var domContainer = $('<div class="memocontainer"></div>');
    
    domContainer.append('<p>Your memo for ' + recipient + '.</p>');
       
    var domForm = domContainer.append('<div class="noteform"><textarea id="memotextarea">' + note + '</textarea></div>');
    domContainer.append(domForm);
    
    var domBtnCancel = $('<button id="memocancel" class="btn btn-default">Hide</button>');
    var domInProgressConfirm = $('<span id="memoprogress" class="fa fa-spinner fa-spin"></span>');
    var domBtnSubmit = $('<button id="memosend" class="btn btn-default">Update</button>');
    
    var domButtonContainer = $('<div class="memobuttons"></div>');
    domButtonContainer.append(domBtnCancel);
    
    var domButtonCollection = $('<div></div>');
    domButtonCollection.append(domInProgressConfirm);
    domButtonCollection.append(domBtnSubmit);
    
    domInProgressConfirm.hide();
    
    domButtonContainer.append(domButtonCollection);
    
    domContainer.append(domButtonContainer);
    
    domBtnCancel.click(function(){
        $(this).parent().parent().slideUp(1000, function(){
            $(this).remove();
        });
    });
    
    domBtnSubmit.click(createMemoSubmitClickCallback(recipientID));
        
    return domContainer;
}

function createMemoSubmitClickCallback(recipientID){
    return function(){
        // Disable the submit button.
        $(this).prop('disabled', true);
        
        // Show the progress spinner
        var prog = $('#memoprogress');
        prog.removeClass();
        prog.addClass('fa fa-spinner fa-spin');
        prog.show();        
        
        postForSetMemo(recipientID, $('#memotextarea').val());
    };
}

function createDomToolFriendsList(){
    // Title bar
    var domTitleBar = $('<div class="tooltopbar"></div>');
    App.tools['friends'].content.append(domTitleBar);
    
    // buttons
    var btnAll = $('<span class="faicon fa fa-check-circle-o" title="All Characters"></span>');
    domTitleBar.append(btnAll);
    App.tools['friends'].allCharacters = btnAll;
    btnAll.click(function(){
        if($(this).hasClass('fa-check-circle-o')){
            $(this).removeClass('fa-check-circle-o');
            $(this).addClass('fa-check-circle');
            $(this).attr('title', 'Current Charcter Only');
        }
        else {
            $(this).removeClass('fa-check-circle');
            $(this).addClass('fa-check-circle-o');
            $(this).attr('title', 'All Characters');
        }
        
        // Clean up existing dom.
        App.tools['friends'].scrollerContent.empty();
        
        // Create new
        createDomFriendsListContents();        
    });
    
    // Scroller
    var domScroller = $('<div class="toolfriendsscroller"></div>');
    App.tools['friends'].content.append(domScroller);
    
    // Scroller content
    var domScrollerContent = $('<div class="toolfriendsscrollercontent"></div>');
    domScroller.append(domScrollerContent);
    
    // Store
    App.tools['friends'].scroller = domScroller;
    App.tools['friends'].scrollerContent = domScrollerContent;
    
    // Create friend entries
    createDomFriendsListContents();
}

function createDomFriendsListContents(){
    // Sort our characters in alphabetical order
    var keyOrder = [];
    for(var key in App.user.friendsList){
        keyOrder.push(key);
    }
    keyOrder.sort();
        
    // Add the logged in character's friends first.
    createDomFriendsListContentsForCharacter(App.user.loggedInAs);
        
    // If All Characters check box is selected..
    if(App.tools['friends'].allCharacters.hasClass('fa-check-circle')){
        for(var j = 0; j < keyOrder.length; j++){
            if(keyOrder[j] !== App.user.loggedInAs){
                createDomFriendsListContentsForCharacter(keyOrder[j]);
            }
        }
    }
}

function createDomFriendsListContentsForCharacter(character){
    if(typeof App.user.friendsList[character] !== 'undefined'){
        // Sort this character's friends.
        App.user.friendsList[character].sort();
        
        // Loop and create doms.
        for(var i = 0; i < App.user.friendsList[character].length; i++){
            var dom = createDomFriendsListEntry(character, App.user.friendsList[character][i]);
            App.tools['friends'].scrollerContent.append(dom);
            dom.click(function(){
                targetViewerFor($(this).attr('title'));
                toggleTool('viewer');
            });
        }
    }
}

function createDomFriendsListEntry(sourceName, friendName){
    var escapedSourceName = escapeHtml(sourceName).toLowerCase();
    var escapedFriendName = escapeHtml(friendName).toLowerCase();
    
    var stat = 'Offline';
    var statusmsg = '';
    
    if(typeof App.characters[friendName] !== 'undefined'){
        stat = App.characters[friendName].status;
        statusmsg = App.characters[friendName].statusmsg;
    }
    
    // Dom
    var domContainer = $('<div class="friendentry" title="' + friendName + '"></div>');
    
    // Avatar
    var domAvatar = $('<div class="friendentryavatar"></div>');
    domContainer.append(domAvatar);
    
    var domAvatarUnderImage = $('<img class="avatarunderimage img-rounded" src="https://static.f-list.net/images/avatar/' + escapedFriendName + '.png" title="' + friendName + '"/>');
    domAvatar.append(domAvatarUnderImage);
    var domAvatarOverStatus = $('<img class="avataroverstatus" src="images/status-large-' + stat.toLowerCase() + '.png" title="' + stat + '"/>');
    domAvatar.append(domAvatarOverStatus);
    var domAvatarSourceThumb = $('<img class="avatarsourcethumb img-circle" src="https://static.f-list.net/images/avatar/' + escapedSourceName + '.png" title="' + sourceName + '"/>');
    domAvatar.append(domAvatarSourceThumb);
    
    // Text    
    var domFriendEntryText = $('<div class="friendentrytext"><p><b>' + friendName + '</b></p><p><table style="table-layout: fixed; width: 100%; word-wrap: break-word;"><td>' + statusmsg + '</td></table></p></div>');    
    domContainer.append(domFriendEntryText);
    
    return domContainer;   
}

function createDomToolInfo(){
    var domScroller = $('<div class="toolinfoscroller"></div>');
    App.tools['info'].content.append(domScroller);
    
    var domScrollerContents = $('<div class="toolinfoscrollercontents"></div>');
    domScroller.append(domScrollerContents);
    
    // Help
    
    var domHelp = $('<div class="helpcontainer"></div>');
    domScrollerContents.append(domHelp);
    domHelp.append('<h3><b>Help</b></h3>');
    var list = '<ul>';
    
    list += '<li>To view a character\'s profile click on their name.</li>';
    list += '<li>Use the viewer to open a PM, set or unset a bookmark, friend or unfriend, view or edit memos and send notes.</li>';
    list += '<li>Hold Ctrl/Command and press spacebar to switch to the next channel.</li>';
    list += '<li>You can use /preview before your message to preview any BBCode you\'ve used, though there\'s no need to worry.. If you\'re BBCode is invalid, it will not be sent anyway.</li>';
    list += '<li>To see a full list of available commands, type /commands</li>';
    list += '<li>The feed will allow you to monitor incoming PMs and reply to them straight from there, as well as alerting you to incoming notes, friend requests, mentions and possible issues.</li>';
    list += '<li>You can filter what kind of feed messages you\'re seeing. Having something hidden will not make the feed icon buzz or show unread messages.</li>';
    list += '<li>The settings panel will allow you to set your desired colours for different genders, turn on and off alerts & sounds as well as let you configure what words, names and/or phrases fire a mention alert.</li>';
    
    list += '</ul>';
    domHelp.append(list);
    
    // GitHub
    var domGit = $('<div class="gitcontainer"></div>');
    domScrollerContents.append(domGit);
    domGit.append('<h3><b>GitHub</b></h3>');
    
    domGit.append('<p>Strawberry is up on GitHub <a href="https://github.com/StrawberryBunny/strawberry" target="_blank">here</a>. You can make <a href="https://github.com/StrawberryBunny/strawberry/issues" target="_blank"><span style="color: #ff0000;"><span class="fa fa-bug"></span> bug reports</span></a> there. Comments, suggestions and pull requests welcome.</p>');
    
    // Change log
    var domChangeLog = $('<div class="changelogcontainer"></div>');
    domScrollerContents.append(domChangeLog);
    
    domChangeLog.append('<h3><b>Changelog</b></h3>');
    for(var i = App.changelog.length - 1; i >= 0; i--){
        var dom = $('<div class="changelogentry"></div>');
        
        var html = '<p><b>' + App.changelog[i][0] + '</b></p><ul>';
        
        for(var j = 0; j < App.changelog[i][1].length; j++){
            html += '<li>' + XBBCODE.process({ text: App.changelog[i][1][j] }).html + '</li>';
        }
                
        html += '</ul>';
        
        dom.html(html);
        
        domChangeLog.append(dom);
    }
}

function createDomToolPictures(){
    var domTitleBar = $('<div class="tooltopbar"></div>');
    App.tools['pictures'].content.append(domTitleBar);
    
    var domInput = $('<input id="toolpicturesinput" type="text" placeholder="Add URLs here"></input>');
    domTitleBar.append(domInput);
    
    var domBtnAdd = $('<span class="faicon fa fa-plus" title="Add Image"></span>');
    domTitleBar.append(domBtnAdd);
    domBtnAdd.click(function(){
        var inputVal = $('#toolpicturesinput').val();
        if(typeof inputVal === 'undefined' || inputVal.length === 0 || stripWhitespace(inputVal).length === 0){
            console.log("Input val not workable: " + inputVal);
            return;
        }
        
        // Does the inputVal end with an image extension?
        if(!isImageViewerUrl(inputVal)){
            return;
        }
        
        // Try and load the image.
        pushImageToPictures(inputVal, App.user.loggedInAs);
    });
    
    var domScroller = $('<div class="toolpicturesscroller"></div>');
    App.tools['pictures'].content.append(domScroller);
    
    var domContent = $('<div class="toolpicturesscrollercontent"></div>');
    domScroller.append(domContent);
    
    var info = $('<p>When an [url] link ends in an image extension (I.E png, jpeg or gif), clicking on it will open images here in pictures. Only images from sites that allow hotlinking will work.</p>');
    domContent.append(info);
    
    App.tools['pictures'].scroller = domScroller;
    App.tools['pictures'].scrollerContent = domContent;
}

function createDomToolPicturesEntry(url, sender, message){
    // Fix GIFV urls.
    var uri = new URI(url);
    if(uri.suffix() === 'gifv'){
        uri.suffix('gif');
        url = uri.href();
    }
        
    var domMain = $('<div class="picturesentry" title="' + url + '"></div>');
   
    var domButtons = $('<div class="picturesentrybuttons"></div>');
    domMain.append(domButtons);
    
    var domButtonsWrapper = $('<div class="picturesentrybuttonswrapper"></div>');
    domButtons.append(domButtonsWrapper);
    
    var domBtnShare = $('<span class="faicon fa fa-share-alt"></span>');
    domButtonsWrapper.append(domBtnShare);
    domBtnShare.click(function(){
        
        var textArea;
        if(App.state.selectedChannel === ''){
            textArea = App.dom.noChannelTextEntry.find('.textentrytextarea');
        }
        else {
            var isPublic = App.state.selectedChannel !== 'ADH';
            var channels = isPublic ? App.publicChannels : App.privateChannels;
            textArea = channels[App.state.selectedChannel].textEntry.find('.textentrytextarea');
        }     
        
        var str = '[url=' + $(this).closest('.picturesentry').attr('title') + ']';
        var strEnd = '[/url]';
        var textVal = textArea.val();
        var caretPos = textArea.prop('selectionStart');
        
        var selectionStart = textArea.prop('selectionStart');
        var selectionLength = textArea.prop('selectionEnd') - selectionStart;
        
        // If nothing is selected
        if(selectionLength === 0){
            // Insert at caret position
            var final = textVal.splice(caretPos, 0, str + strEnd);
            textArea.val(final);
            
            // Focus the text area.
            textArea.focus();
            
            // Place the caret in the middle of our [url] tags.
            textArea.selectRange(caretPos + str.length);
        }
        // else if a word/more is selected.
        else {
            // Retrieve the selected text. 
            var selection = textArea.val().substr(selectionStart, selectionLength);
            
            // Construct the string we're going to replce the selection with.
            var strToAdd = str + selection + strEnd;
            
            // Replace the selection.
            var newVal = textArea.val().splice(selectionStart, selectionLength, strToAdd);
            
            // Set
            textArea.val(newVal);
        }
    });
    
    var domBtnOpen = $('<span class="faicon fa fa-external-link"></span>');
    domButtonsWrapper.append(domBtnOpen);
    domBtnOpen.click(function(){
        // get url from title.
        var url = $(this).closest('.picturesentry').attr('title');
        window.open(url, '_blank');
    });   
    
    var domBtnClose = $('<span class="faicon fa fa-times"></span>');
    domButtonsWrapper.append(domBtnClose);
    domBtnClose.click(function(){
        $(this).parent().parent().parent().slideUp(function(){
            $(this).remove();
        });
    });
    
    var domTitle = $(createDomUserEntry(sender, App.characters[sender].gender, App.characters[sender].status, App.characters[sender].statusmsg));
    domMain.append(domTitle);
    
    if(typeof message !== 'undefined'){
        var domMessage = $('<div>: ' + message + '</div>');
        domMain.append(domMessage);
    }
        
    var domImage = createDomImageOrVideo(url);
    domMain.append(domImage);
    
    return domMain;
}

function createDomImageOrVideo(url){
    var dom;
    if(isImageUrl(url)){
        dom =$('<img class="img-responsive" src="' + url + '"/>');
    }
    else if(isWebmUrl(url)){
        dom = $('<video controls muted autoplay="" loop="" style="width: 100%; height: auto;"><source src="' + url + '" type="video/webm" class="webmsource"></video>');
    }    
    return dom;
}

function createDomToolSettings(){
    var domScroller = $('<div class="toolsettingsscroller"></div>');
    App.tools['settings'].content.append(domScroller);
    
    var domContents = $('<div class="toolsettingsscrollercontents"></div>');
    domScroller.append(domContents);
    
    // Gender Colours.
    
    var domColours = $('<div class="toolsettingspanel"></div>');
    domContents.append(domColours);
    
    domColours.append('<h3><b>Gender Colours</b></h3>');
       
    var domList = $('<ul></ul>');
    domColours.append(domList); 
        
    var dom;
    for(var key in App.options.genderColours){
        var domLi = $('<li></li>');
        domList.append(domLi);
              
        dom = $('<li><div class="gendercolorentry"></div></li>');
        domLi.append(dom);
               
        var domInput = $('<input id="cpGenderColor" type="text"/>');
        dom.append(domInput);
        domInput.spectrum({
            color: App.options.genderColours[key][0],
            change: createGenderColorCPChangeCallback(key)
        });
        dom.append(domInput);
        
        dom.append(App.options.genderColours[key][1]);
        
        App.tools['settings'].genderColourPickers[key] = domInput;
    }
    
    // Defaults button.
    var domButtons = $('<div class="panelbuttons"></div>');
    domColours.append(domButtons);
    
    var domBtnDefault = $('<button class="btn btn-default">Reset to Defaults</button>');
    domButtons.append(domBtnDefault);
    domBtnDefault.click(function(){
        // Reset colours & color pickers
        for(var key in App.options.genderColours){
            App.options.genderColours[key][0] = App.defaults.genderColours[key][0];
            App.tools['settings'].genderColourPickers[key].spectrum('set', App.options.genderColours[key][0]);
        }
        
        // User entries
        updateAllUserEntries();
        
        // Save to cookie.
        var ckOptions = JSON.parse(cookie.get('options', JSON.stringify({}), { expires: 999999 }));
        
        var genderColours = {
            male:           App.options.genderColours['male'][0],
            female:         App.options.genderColours['female'][0],
            herm:           App.options.genderColours['herm'][0],
            shemale:        App.options.genderColours['shemale'][0],
            cuntboy:        App.options.genderColours['cuntboy'][0],
            maleherm:       App.options.genderColours['maleherm'][0],
            none:           App.options.genderColours['none'][0],
            transgender:    App.options.genderColours['transgender'][0]
        };
        
        ckOptions.genderColours = genderColours;
        
        cookie.set('options', JSON.stringify(ckOptions), { expires: 999999 });
    });
    
    // Mentions
    
    var domMentions = $('<div class="toolsettingspanel"></div>');
    domContents.append(domMentions);
    
    domMentions.append('<h3><b>Mentions</b></h3>');
    
    var domHelpText = $('<ul><li>A comma seperated list of words and/or phrases that will fire off an alert.</li><li>For example:</li><li>Strawberry,CASe doES NoT MatTeR,Warhammer,Tracer,something with spaces,etc</li></ul>');
    domMentions.append(domHelpText);
    
    var domInput = $('<input type="text" id="mentionsinput" value="' + App.user.loggedInAs + '"></input>');
    domMentions.append(domInput);
    App.tools['settings'].mentionsInput = domInput;
    domInput.on('keyup', function(e){
        // Load the options.
        var ckOptions = JSON.parse(cookie.get('options', JSON.stringify({})));
        ckOptions.mentions = $(this).val().split(',');
        cookie.set('options', JSON.stringify(ckOptions), { expires: 999999 });
        
        // Set new options.
        App.options.mentions = $(this).val().split(',');
    });
    
    // Start Channels
    
    var domStartChannels = $('<div class="toolsettingspanel"></div>');
    domContents.append(domStartChannels);
    
    domStartChannels.append('<h3><b>Start-Up Channels</b></h3>');
    
    domStartChannels.append('<ul><li>A comma seperated list of channels to join when Strawberry starts up.</li>' + 
        '<li>For private channels you will need their code which you can get by typing /code in the channel.</li>' +
        '<li>For example...</li>' +
        '<li>Cum Lovers,Femboy,Femdom,Monster\'s Lair,ADH-491cbcdbbbe8039e87cb</li>' + 
        '</ul>');
        
    var domStartupInput = $('<input type="text" id="startupchannelsinput" value=""></input>');
    domStartChannels.append(domStartupInput);
    App.tools['settings'].startUpChannelsInput = domStartupInput;
    domStartupInput.on('keyup', function(e){
        var ckOptions = JSON.parse(cookie.get('options', JSON.stringify({})));
        ckOptions.startUpChannels = $(this).val().split(',');
        cookie.set('options', JSON.stringify(ckOptions), { expires: 999999 });
    });
}

function createGenderColorCPChangeCallback(gender){
    return function(color) {
        App.options.genderColours[gender][0] = color.toHexString();
        updateAllUserEntries();
        
        // Save changes in cookie.
        
        // get options cookie.
        var ckOptions = JSON.parse(cookie.get('options', JSON.stringify({})));
        
        var genderColours = {
            male:           App.options.genderColours['male'][0],
            female:         App.options.genderColours['female'][0],
            herm:           App.options.genderColours['herm'][0],
            shemale:        App.options.genderColours['shemale'][0],
            cuntboy:        App.options.genderColours['cuntboy'][0],
            maleherm:       App.options.genderColours['maleherm'][0],
            none:           App.options.genderColours['none'][0],
            transgender:    App.options.genderColours['transgender'][0]
        };
        
        ckOptions.genderColours = genderColours;
        
        // Save the options cookie.
        cookie.set('options', JSON.stringify(ckOptions), { expires: 999999 });
    }
}

/* Channels */
function createDomChannelContents(){
    return $('<div class="channelmessages"></div>');
}

function createDomChannelUserlist(){
    return $('<div class="userlistcontents"></div>');
}

function createDomChannelButton(isPublic, channelName, channelTitle){
    var domMain = $('<div id="channel-' + stripWhitespace(channelName) + '" class="fabutton" title="' + channelTitle + '"></div>');
        
    var domIcon = $('<span id="data" title="' + channelName + '"></span><span class="fa ' + (isPublic ? 'fa-th' : App.privateChannels[channelName].locked ? 'fa-lock' : 'fa-unlock') + '"></span>');
    domMain.append(domIcon);
    
    var domTint = $('<div class="hovertint"></div>');
    domMain.append(domTint);
    
    var domLabel = $('<div class="channellabel">' + channelTitle + '</div>')
    domMain.append(domLabel);
    
    return domMain;
}

function createDomChannelScroller(){
    return $('<div class="channelscroller"></div>');
}

function createDomChannelTextEntry(){
    var domContainer = $('<div class="textentrycontainer"></div>');
    
    var domTA = $('<textarea class="textentrytextarea" maxlength="' + App.serverVars['chat_max'] + '"></textarea>');
    domContainer.append(domTA);
    
    var domTextEntryButton = $('<button type="submit" class="textentrybutton btn btn-default" autocomplete="off">Send</button>');
    domContainer.append(domTextEntryButton);
    
    return domContainer;
}

/* PMs */
function createDomPMContents(){
    return $('<div class="pmmessages"></div>');
}

function createDomPMButton(character){
    var domMain = $('<div id="pm-' + stripWhitespace(character) + '" class="fabutton pm" title="' + character + '"></div>');
    
    var domImage = $('<img id="data" class="avatarbutton img-rounded" src="https://static.f-list.net/images/avatar/' + escapeHtml(character).toLowerCase() + '.png" title="' + character + '"/>');
    domMain.append(domImage);
    
    var domTint = $('<div class="hovertint"></div>');
    domMain.append(domTint);
    
    var domLabel = $('<div class="channellabel">' + character + '</div>');
    domMain.append(domLabel);
    
    var domTypingStatus = $('<span id="typingstatus" class="fa fa-keyboard-o"></span>');
    domMain.append(domTypingStatus);
    domTypingStatus.hide();
    
    return domMain;
}

function createDomPMTextEntry(){
    var domContainer = $('<div class="textentrycontainer"></div>');
    
    var domTA = $('<textarea class="textentrytextarea" maxlength="' + App.serverVars['priv_max'] + '"></textarea>');
    domContainer.append(domTA);
    
    var domTextEntryButton = $('<button type="submit" class="textentrybutton btn btn-default" autocomplete="off">Send</button>');
    domContainer.append(domTextEntryButton);
    
    return domContainer;
}

/* Others */

function createDomAlert(message){
    return $('<div class="alert alert-danger fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Error!</strong> ' + message + '</div>');
}

function createDomUserEntry(name, gender, status, statusmsg, slashMe, channel){
    var domContainer = $('<div class="userentry" title="' + name + '"></div>');

    var genderColour = '#444444';
    
    if(name !== 'Description'){
        // Status image.
        var domImg = $('<img class="statusimg" src="images/status-small-' + status.toLowerCase() + '.png" title="' + status + '"/>');
        domContainer.append(domImg);
        
        // is this char an op in this room?
        if(typeof channel !== 'undefined'){
            var isPublic = channel.substr(0, 3) !== 'ADH';
            var channels = isPublic ? App.publicChannels : App.privateChannels;
                      
            // Is this user the owner?
            var isOwner = channels[channel].ops.indexOf(name) === 0;
            
            // Make image dom.
            if(isPublic){
                // Is the user an op in this channel?
                if(App.ops.indexOf(name) !== -1){
                    var domOpImg = $('<img class="opimage" src="images/gem-small-op.png" title="Global Operator"/>');
                    domContainer.append(domOpImg);
                }
                else if(channels[channel].ops.indexOf(name) !== -1){
                    // Is the user a global admin?
                    var domOpImg = $('<img class="opimage" src="images/gem-small-admin.png" title="Channel Operator"/>');
                    domContainer.append(domOpImg);
                }
            }
            else {
                // is the user an op in this channel?
                if(channels[channel].ops.indexOf(name) !== -1){
                    var domOpImg = $('<img class="opimage" src="images/chevron-small-' + (isOwner ? 'owner' : 'op') + '.png" title="' + (isOwner ? 'Channel Owner' : 'Channel Operator') + '"/>');
                    domContainer.append(domOpImg);                
                }
            }
        }
        
        // Gender colour.
        genderColour = App.options.genderColours[App.characters[name].gender.toLowerCase()][0];
    }

    domContainer.append('<div class="nameplate" style="color: ' + genderColour + '" title="' + statusmsg + '">' + (slashMe ? '<i>' : '') + name + (slashMe ? '</i>' : '') + '</i></div>');
    
    return domContainer;
}

function createDomMessage(character, message, channel){
    var isMe = message.substr(0, 3) === '/me';
    
    var domContainer = $('<div class="message"></div>');
    
    // Is this our message?
    if(character === App.user.loggedInAs){
        domContainer.addClass('ourmessage');
    }    
    
    if(character.toLowerCase() === 'description'){
        message = '[b]Description[/b]: ' + message;
    }
    else if(character.toLowerCase() === 'preview'){
        message = '[b]Preview[/b]: ' + message;
    }
    else {
        var gender = App.characters[character].gender;
        var status = App.characters[character].status;
        var statusmsg = App.characters[character].statusmsg;
        var userEntry = createDomUserEntry(character, gender, status, statusmsg, isMe, channel);
        domContainer.append(userEntry);
        if(!isMe){
            message = ': ' + message;
        }
        else {
            if(message.substr(3, 2) === "'s"){
                 message = "[i]'s"  + message.substr(5) + '[/i]';
            }
            else if(message.charAt(3) === "'"){
                message = "[i]'"  + message.substr(4) + '[/i]';
            }
            else if(message.charAt(4) === "'"){
                message = '[i]' + message.substr(4) + '[/i]';
            }
            else {
                message = '[i] ' + message.substr(4) + '[/i]';
            }
        }
    }
    
    var bb = XBBCODE.process({
        text: message
    });
        
    domContainer.append('<div class="messagetext">' + bb.html + '</div>');

    return domContainer;
}

function createDomPMScroller(){
    return $('<div class="pmscroller"></div>');
}

/**
 * WebSocket =====================================================================================================================
 */

function sendMessageToServer(message){
    App.connection.send(message);
}

function openWebSocket(account, ticket, characterName){
    // Create websocket
    App.connection = new WebSocket('ws://chat.f-list.net:8722'); // Test Server
    //App.connection = new WebSocket('ws://chat.f-list.net:9722'); // Proper Server

    // Add listeners
    App.connection.onopen = function(){
        // Attempt to identify with the server
        var command = 'IDN { "method": "ticket", "account": "' + account + '", "ticket": "' + ticket + '", "character": "' + characterName + '", "cname": "strawberry", "cversion": "' + App.consts.version + '" }';
        sendMessageToServer(command);

        // Log in state
        App.state.logInReadyInfo.identified = true;

        // Update message
        $('#loadingtext').text('Attempting to identify with server.');
    };

    App.connection.onerror = function(error){
        // TODO (Do we need to take action?)
        console.log('WebSocket error: ' + JSON.stringify(error));
        pushFeedItem(App.consts.feed.types.error, 'WebSocket error: ' + error);
    };

    App.connection.onmessage = function(e){
        parseServerMessage(e.data);
    };

    App.connection.onclose = function(e){
        var msg = 'WebSocket closed with code: ' + e.code + ', reason: ' + e.reason + ', wasClean: ' + e.wasClean;
        console.log(msg);
        pushFeedItem(App.consts.feed.types.error, msg);
        
        startAgain();
        var alertDom = createDomAlert(msg);
        $('.loginalert').append(alertDom);
        alertDom.delay(5000).fadeOut(2000, function(){
            $(this).remove();
        });
    };
}

/* Server Messages */

function parseServerMessage(message){
    var tag = message.substr(0, 3);

    if(message.length > 3){
        var obj = JSON.parse(message.substr(3));
    }

    var dontLog = ['PIN', 'IDN', 'VAR', 'HLO', 'ORS', 'CON', 'FRL', 'IGN', 'ADL', 'UPT', 'CHA', 'ICH', 'CDS', 'COL', 'JCH', 'NLN', 'JCH', 'LCH', 'ERR', 'FLN', 'PRI', 'TPN', 'MSG', 'STA',
                    'COA', 'COR', 'SYS', 'LIS'];
    if(dontLog.indexOf(tag) === -1){
        console.log(message);
    }
    
    var isPublic, channels, i, msg;

    switch(tag){
        case 'ADL':
            // Receives the current list of chatops
            App.ops = obj.ops;
            break;
        case 'AOP':
            // The given character has been promoted to chatop.
            break;
        case 'BRO':
            // Incoming admin broadcast
            pushFeedItem(App.consts.feed.types.info, '<b>Admin Broadcast</b>: ' + obj.message);
            break;
        case 'CDS':
            // A channel's description has changed. (Also sent in response to JCH)
            isPublic = obj.channel.substr(0, 3) !== 'ADH';
            channels = isPublic ? App.publicChannels : App.privateChannels;
            var showNewDescription = typeof channels[obj.channel].description === 'undefined' || channels[obj.channel].description !== obj.description;
            if(showNewDescription){            
                receiveMessage(obj.channel, 'Description', obj.description, false);
            }
            // Store description
            channels[obj.channel].description = obj.description;
            break;
        case 'CHA':
            // Receiving a list of all public channels.

            // Update our list of channels.
            for(i = 0; i < obj.channels.length; i++){
                if(typeof App.publicChannels[obj.channels[i].name] === 'undefined'){
                    App.publicChannels[obj.channels[i].name] = {};
                }

                App.publicChannels[obj.channels[i].name].name = obj.channels[i].name;
                App.publicChannels[obj.channels[i].name].title = obj.channels[i].name;
                App.publicChannels[obj.channels[i].name].mode = obj.channels[i].mode;
                App.publicChannels[obj.channels[i].name].characterCount = obj.channels[i].characters;
            }

            // Now request a list of all private channels.
            sendMessageToServer('ORS');
            break;
        case 'CIU':
            // Receiving an invite to a channel.
            // Store title
            isPublic = obj.name.substr(0, 3) !== 'ADH';
            channels = isPublic ? App.publicChannels : App.privateChannels;
            if(typeof channels[obj.name] === 'undefined'){
                channels[obj.name] = {};
                if(!isPublic){
                    channels[obj.name].locked = true;
                }
            }
            channels[obj.name].name = obj.name;
            channels[obj.name].title = obj.title;            
                    
            pushFeedItem(App.consts.feed.types.alert, obj.sender + ' has invited you to [session=' + obj.title + ']' + obj.name + '[/session]');
            break;
        case 'CBU':
            // Removes a user from a channel and prevents them from entering. (This just happened or.. what?)
            break;
        case 'CKU':
            // Kicks a user from a channel (this just happened or our client should act on it.. i.e remove the kicked user from user list / close the room if it's us?)
            break;
        case 'COA':
            // Promotes a user to channel operator
            
            // Update .userentry in channel.
            var isPublic = obj.channel.substr(0, 3) !== 'ADH';
            var channels = isPublic ? App.publicChannels : App.privateChannels;
            
            // userlist.
            channels[obj.channel].userlistDom.find('.userentry').each(function(){
                var nameplate = $(this).children('.nameplate');
                if(nameplate.text() === obj.character){
                    $(this).find('.statusimg').after('<img class="opimage" src="images/chevron-small-op.png" title="Channel Operator"/>');
                }
            });
                 
            // Messagedom
            channels[obj.channel].messageDom.find('.userentry').each(function(){
                var nameplate = $(this).children('.nameplate');
                if(nameplate.text() === obj.character){
                    $(this).find('.statusimg').after('<img class="opimage" src="images/chevron-small-op.png" title="Channel Operator"/>');
                }
            });
                       
            // Feed
            pushFeedItem('info', obj.character + ' was given op status in ' + channels[obj.channel].title);
            break;
        case 'COL':
            // Gives a list of chat ops. Sent in response to JCH
            isPublic = obj.channel.substr(0, 3) !== 'ADH';
            channels = isPublic ? App.publicChannels : App.privateChannels;
            
            if(typeof channels[obj.channel] === 'undefined'){
                channels[obj.channel] = {};
                if(!isPublic){
                    channels[obj.channel].locked = true;
                }
            }
            
            channels[obj.channel].ops = obj.oplist;            
            break;
        case 'CON':
            // The number of connected users. Received after connecting and identifying.
            pushFeedItem(App.consts.feed.types.info, 'There are currently ' + obj.count + ' users logged in.');
            App.state.logInReadyInfo.initialCharacterCount = obj.count;
            break;
        case 'COR':
            // Removes a channel operator.
            
            // Update .userentry in channel
            var isPublic = obj.channel.substr(0, 3) !== 'ADH';
            var channels = isPublic ? App.publicChannels : App.privateChannels;
            
            // userlist.
            channels[obj.channel].userlistDom.find('.userentry').each(function(){
                var nameplate = $(this).find('.nameplate');
                if(nameplate.text() === obj.character){
                    $(this).find('.opimage').remove();
                }
            });
            
            // Message dom
            channels[obj.channel].messageDom.find('.userentry').each(function(){
                var nameplate = $(this).find('.nameplate');
                if(nameplate.text() === obj.character){
                    $(this).find('.opimage').remove();
                }
            });
            
            // Feed
            pushFeedItem('info', obj.character + "'s op status in " + channels[obj.channel].title + " was revoked.");            
            break;
        case 'CSO':
            // Sets the owner of the current channel to the character provided.
            break;
        case 'CTU':
            // Temporarily bans a user from the channel for 1-90 minutes. A channel timeout.
            break;
        case 'DOP':
            // The given character has been stripped of chat op status.
            break;
        case 'ERR':
            // Switch for specific errors
            switch(obj.number){
                case 4:
                    // Indentification failed.
                    servErrorIdentification();
                    break;
                case 26:
                    console.log(message);
                    throwError('Could not locate the requested channel.');
                    break;
                case 28:
                    throwError('You are already in the requested channel.');
                    break;
                default:
                    console.log('================== ERROR ===================');
                    console.log(message);
                    console.log('============================================');
                    break;                
            }
            break;
        case 'FKS':
            // Send as a response to the client's FKS command, containing the results of the search.
            break;
        case 'FLN':
            // Send by the server to inform the client that a given character went offline.
            characterWentOffline(obj.character);
            break;
        case 'FRL':
            // Initial friends list. (not used)
            break;
        case 'HLO':
            // Server hello command. Tells which server version is running and who wrote it.
            pushFeedItem(App.consts.feed.types.info, obj.message);
            break;
        case 'ICH':
            // Initial channel data. Received in response to JCH along with CDS. (userlist, channelname, mode)
            
            // Is this channel public or private?
            isPublic = obj.channel.substr(0, 3) !== 'ADH';
            channels = isPublic ? App.publicChannels : App.privateChannels;

            // If the room is private
            
                // If the room is in our list of private channels, it must be open but that list might not be up to date..
                
                // We can set it as locked but then update it's status when we receive a message that the room has been opened or we bring down a new channel list and this room is in it.
                

            // Do we have any info for this channel?
            if(typeof channels[obj.channel] === 'undefined'){
                channels[obj.channel] = {};
                if(!isPublic){
                    channels[obj.channel].locked = true;
                }
            }
            
            channels[obj.channel].mode = obj.mode;
            channels[obj.channel].name = obj.channel;
            if(isPublic){
                channels[obj.channel].title = obj.channel;
            }
            
            
            /*
            else if(obj.channel in App.privateChannels){
                channels[obj.channel].locked = false;
            }
            else {
                channels[obj.channel].locked = true;
            }*/

            // Store user list. Wipe out any existing userlist, we're getting a new, whole one.
            channels[obj.channel].users = [];
            for(i = 0; i < obj.users.length; i++){
                channels[obj.channel].users.push(obj.users[i].identity);
            }

            // Open this channel.
            openChannel(obj.channel);
            break;
        case 'IDN':
            // Used to inform the client their identification is successful and handily sends their character name along with it.
            
            // Set logged in user
            App.user.loggedInAs = obj.character;
            
            // The the viewer target to our character
            App.tools['viewer'].target = obj.character;

            // Set the loading texts
            $('#loadingtext').text('Identification successful.');
            $('#loadingtext2').text('Requesting server information...');
            
            // Request server information
            sendMessageToServer('UPT');
            break;
        case 'IGN':
            // Handles the ignore list
            switch(obj.action){
                case 'init': // The initial ignore list.
                    App.user.ignoreList = obj.characters;
                    break;
                case 'add': // Acknoledges the addition of an ignore.
                    break;
                case 'delete': // Acknoledges the deletion of an ignore.
                    break;
                case 'list': // ?
                    pushFeedItem(App.consts.feed.types.info, 'Received an IGN with action: list');
                    break;
                case 'notify': // ?
                    pushFeedItem(App.consts.feed.types.info, 'Received an IGN with action: notify');
                    break;
            }

            break;
        case 'JCH':
            // Indicates the given user has joined the given channel. This my also be the client's character.
            // Don't use to know when we've joined a room. Use ICH.
            
            isPublic = obj.channel.substr(0, 3) !== 'ADH';
            if(obj.character.identity !== App.user.loggedInAs){
                characterJoinedChannel(obj.character.identity, obj.channel);
            }   
            // If this is a private/locked room.         
            else if(!isPublic && typeof App.privateChannels[obj.channel] === 'undefined'){
                App.privateChannels[obj.channel] = {
                    name: obj.channel,
                    title: obj.title,
                    locked: true
                };
            }
            break;
        case 'KID':
            // Kinks data in response to a KIN command.
            break;
        case 'LCH':
            // Indicates that the given user has left the given channel. This may also be the client's character.
            if(App.state.openChannels.indexOf(obj.channel) !== -1){
                if(obj.character === App.user.loggedInAs){
                    closeChannel(obj.channel);
                }
                else {
                    characterLeftChannel(obj.character, obj.channel);
                }
            }
            break;
        case 'LIS':
            // Receives an array of all the online characters and their gender, status and status msg. (often sent in batches. Use CON to know when we have them all)
            for(i = 0; i < obj.characters.length; i++){
                App.characters[obj.characters[i][0]] = {
                    gender: fixGender(obj.characters[i][1]),
                    status: stylizeStatus(obj.characters[i][2]),
                    statusmsg: obj.characters[i][3],
                    pms: {}
                };
                App.state.logInReadyInfo.listedCharacters++;
            }

            // If the amount of characters now matches or is greater than con, we've received the full user list.
            //console.log("Listed characters: " + App.state.logInReadyInfo.listedCharacters + ", Count: " + App.state.logInReadyInfo.initialCharacterCount);
            if(App.state.logInReadyInfo.listedCharacters >= App.state.logInReadyInfo.initialCharacterCount){
                App.state.logInReadyInfo.listComplete = true;
                checkForReadyStatus();
            }
            break;
        case 'LRP':
            // A roleplay ad is received from a user in a channel.
            break;
        case 'MSG':
            // A message is received from a user in a channel.
            receiveMessage(obj.channel, obj.character, obj.message, true);
            break;
        case 'NLN':
            // A user connected.
            if(App.characters[obj.identity] === null || typeof App.characters[obj.identity] === 'undefined'){
                App.characters[obj.identity] = {};
            }
            App.characters[obj.identity].gender = fixGender(obj.gender);
            
            App.characters[obj.identity].status = stylizeStatus(obj.status);
            if(typeof App.characters[obj.identity].pms === 'undefined'){ 
                App.characters[obj.identity].pms = {};
            }

            // Was this character our friend or bookmark? (If we're logged in yet..)
            if(typeof App.user.loggedInAs !== 'undefined' && typeof App.user.friendsList !== 'undefined'){
                if(obj.identity !== App.user.loggedInAs && typeof App.user.friendsList[App.user.loggedInAs] !== 'undefined' && typeof App.user.bookmarks !== 'undefined'){
                    if(App.user.friendsList[App.user.loggedInAs].indexOf(obj.identity) !== -1){
                        pushFeedItem(App.consts.feed.types.alert, 'Your friend [icon]' + obj.identity + '[/icon] has come online.');
                    }
                    else if(App.user.bookmarks.indexOf(obj.identity) !== -1){
                        pushFeedItem(App.consts.feed.types.alert, 'Your bookmark [icon]' + obj.identity + '[/icon] has come online.');
                    }
                }
            }
            
            // Do a status update.
            if(obj.identity !== App.user.loggedInAs){
                updateStatus(obj.identity, 'online', '');
            }            
            break;
        case 'ORS':
            // A list of open private rooms.
            
            // If we have an unlocked, private room in our list and it's not on this incoming list, don't list it.
            
            for(var key in App.privateChannels){
                App.privateChannels[key].invalidated = true;
            }
            
             // Update our list of channels.
            for(i = 0; i < obj.channels.length; i++){
                if(typeof App.privateChannels[obj.channels[i].name] === 'undefined'){
                    App.privateChannels[obj.channels[i].name] = {};
                }

                App.privateChannels[obj.channels[i].name].name = obj.channels[i].name;
                App.privateChannels[obj.channels[i].name].title = obj.channels[i].title;
                App.privateChannels[obj.channels[i].name].mode = obj.channels[i].mode;
                App.privateChannels[obj.channels[i].name].characterCount = obj.channels[i].characters;
                App.privateChannels[obj.channels[i].name].locked = false;
                App.privateChannels[obj.channels[i].name].invalidated = false;
                
                // If this channel is open already.
                if(App.state.openChannels.indexOf(obj.channels[i].name) !== -1){
                    // Update button dom.
                    var icon = App.privateChannels[obj.channels[i].name].buttonDom.find('.fa');
                    icon.removeClass();
                    icon.addClass('fa fa-unlock');
                }                
            }

            // Update dom.
            channelListUpdated();
            break;
        case 'PIN':
            // Respond to pings
            sendMessageToServer('PIN');
            break;
        case 'PRD':
            // Profile data commands send in resposne to PRO client command.
            break;
        case 'PRI':
            // A private message is received from another user.
            receivePM(obj.character, obj.message, obj.character);
            break;
        case 'RLL':
            // Results of a dice roll
            break;
        case 'RMO':
            // A room changed mode.
            break;
        case 'RTB':
            // Real-time bridge. Indicates the user received a note or message, right at the very moment this is received.
            pushFeedItem(App.consts.feed.types.alert, 'Real-Time Bridge - Received ' + obj.type + ' from ' + obj.character + '.');
            break;
        case 'SFC':
            // Alerts admins and chatops of an issue.
            break;
        case 'STA':
            // A user changed their status.
            updateStatus(obj.character, obj.status, obj.statusmsg);
            break;
        case 'SYS':
            // System message from the server.
            if(obj.message.indexOf("This channel is now [b]public.[/b]") !== -1){
                var channelName = obj.channel.substr(0, 3).toUpperCase() + obj.channel.substr(3);
                App.privateChannels[channelName].locked = false;
                                
                // Update button dom.
                var icon = App.privateChannels[channelName].buttonDom.find('.fa');
                icon.removeClass();
                icon.addClass('fa fa-unlock');
                
                pushFeedItem('info', App.privateChannels[channelName].title + ' is now [b]public.[/b]');
                
                return;
            }
            else if(obj.message.indexOf('Your invitation has been sent.') !== -1){
                pushFeedItem('info', 'Your invitation has been sent.');
                return;
            }
            else if(obj.message.indexOf("has been removed from the moderator list for") === -1 && obj.message.indexOf("has been added to the moderator list for") === -1){
                console.log(message);
                return;
            }            
            break;
        case 'TPN':
            // A user informs us of their typing status.
            updateTypingStatus(obj.character, obj.status);
            break;
        case 'UPT':
            // Informs the client of the server's self-tracked online time and a few other bits of information.
            msg = '[b]System Information[/b]';
            msg += '[ul]';
                msg += '[li]Uptime: ' + msToTime(new Date().getTime() - (parseInt(obj.starttime) * 1000)) + '[/li]';
                msg += '[li]Channels: ' + obj.channels + '[/li]';
                msg += '[li]Users: ' + obj.users + '[/li]';
				msg += '[li]Max simultaneous users since last restart: ' + obj.maxusers + '[/li]';
				msg += '[li]Accepted Connections: ' + obj.accepted + '[/li]';
            msg += '[/ul]';
            pushFeedItem(App.consts.feed.types.info, msg);
            
            // Server info retrieved
            App.state.logInReadyInfo.serverInfoRetrieved = true;
            
            // Set the loading texts
            $('#loadingtext').text('Server information retrieved.');
            $('#loadingtext2').text('Requesting friends list...');
            
            // Continue on with log in process
            postForFriendsList();
            break;
        case 'VAR':
            // Variables the server sends to inform the client about server variables.
            App.serverVars[obj.variable] = obj.value;
            break;
        default:
            msg = 'Server received an unhandled message: ' + message;
            console.log(msg);
            pushFeedItem(App.consts.feed.types.error, msg);
            break;
    }
}

/* Server Errors */

function servErrorIdentification(){
    // Set the text in the first line
    $('#loadingtext').text('Identification failed. Your session may have timed out.');

    // Turn the second line into a link by adding errorlink class.
    var secondLine = $('#loadingtext2');
    secondLine.text('Try logging in again.');
    secondLine.addClass('errorlink');

    // Add click listener
    secondLine.click(function(){
        // Remove the loading content
        $('.maincontainer').remove();

        // Re-add the login form
        $('body').append(createDomLogin());
    });

    // Stop the spinning peace hand and replcae with static stop hand.
    $('.loginloadingcontent span').removeClass('fa-spin fa-hand-peace-o');
    $('.loginloadingcontent span').addClass('fa-hand-stop-o');
}

/** 
 * Resetting ========================================================================================================================
 */

function resetAll(){
    // State
    App.state.currentTool = '';
    App.state.openChannels = [];
    App.state.openPMs = [];
    App.state.selectedChannel = '';
    App.state.selectedPM = '';
    App.state.logInReadyInfo.ready = false;
    App.state.logInReadyInfo.identified = false;
    App.state.logInReadyInfo.initialCharacterCount = -1;
    App.state.logInReadyInfo.listedCharacters = 0;
    App.state.logInReadyInfo.listComplete = false;
    App.state.logInReadyInfo.serverInfoRetrieved = false;
    App.state.logInReadyInfo.friendsListRetrieved = false;
    App.state.logInReadyInfo.bookmarksRetrieved = false;
    
    // Users
    App.user.account = '';
    App.user.ticket = '';
    App.user.characters = [];
    App.user.loggedInAs = '';
    App.user.ignoreList = [];
    App.user.friendList = {};
    App.user.bookmarks = [];
    
    // Tools
    App.tools.status.dropdown = null;
    App.tools.status.textarea = null;
    App.tools.status.updatebutton = null;
    App.tools.channels.entryPush = null;
    App.tools.channels.refreshButton = null;
    App.tools.channels.channelEntries = [];
    App.tools.feed.currentlyDisplaying = false;
    App.tools.feed.scroller = null;
    App.tools.feed.messagePush = null;
    App.tools.feed.queue = [];
    App.tools.feed.filterPMs = null;
    App.tools.feed.filterMentions = null;
    App.tools.feed.filterAlerts = null;
    App.tools.viewer.target = '';
    
    // Dom
    App.dom.openChannelList = null;
    App.dom.channelContents = null;
    App.dom.userlist = null;
    App.dom.userlistTopBar = null;
    App.dom.userlistTitle = null;
    App.dom.nochannelImage = null;
    App.dom.mainTextEntry = null;
    App.dom.mainTextEntry = null;
    App.dom.buttonList = [];
    clearInterval(App.dom.channelListScrolling.channelScrollingInterval);
    App.dom.channelListScrolling.channelScrollingInterval = null;
    App.dom.channelListScrolling.curBottomMargin = 0;
    App.dom.channelListScrolling.channelMouseDistance = 0.5;
}

function startAgain(){
    $('body').empty();
    resetAll();
    $('body').append(createDomLogin());
}


/**
 * Main Entry Point ===================================================================================================================
 */

$(document).ready(function(){
    // Resize
    $(window).resize(function(){
        layout();
    });
       
    // Changing channels with a key.
    $(document).on('keyup', function(e){
        // Ctrl+Space to switch channels.
        if(e.which === 32 && e.ctrlKey){
            // Go to next channel
            gotoNextChannel();            
        }
    });
       
    // Future session links.
    $(document).on('click', '.sessionlink', function(e){
        joinChannel($(this).attr('id'));
    });
    
    // Future user links
    $(document).on('click', '.userlink', function(e){
        targetViewerFor($(this).attr('id'));
        if(App.state.currentTool !== 'viewer'){
            toggleTool('viewer');
        }
    });
    
    // Future icon links
    $(document).on('click', '.iconlink', function(e){
        targetViewerFor($(this).attr('title'));
        if(App.state.currentTool !== 'viewer'){
            toggleTool('viewer');
        }
    });
    
    // Future nameplate links.
    $(document).on('click', '.nameplate', function(e){
        targetViewerFor($(this).text());
        if(App.state.currentTool !== 'viewer') {
            toggleTool('viewer');
        }
    });
    
    // Future urllink links
    $(document).on('click', '.urllink', function(e){
        var url = $(this).attr('title');
        var msg = $(this).text();
        if(isImageViewerUrl(url)){
            // Show in dreamer.
            // Search for an owner of this url.
            var owner = App.user.loggedInAs;
            if(typeof $(this).parent().parent() !== 'undefined'){
                var uEn = $(this).parent().parent().find('.userentry');
                if(typeof uEn !== 'undefined'){
                    owner = $(this).parent().parent().find('.userentry').attr('title');
                }
            }
            
            pushImageToPictures(url, owner, msg, true);
        }
        else {
            // Open in new tab.
            window.open(url, '_blank');
        }
    });
    
    // Future imagelinks
    $(document).on('click', '.imagelink', function(e){
        var url = $(this).attr('title');
        var msg = $(this).text();
        
        // Check the message this element is in for an owner.
        var owner = App.user.loggedInAs;
        if(typeof $(this).parent().parent() !== 'undefined'){
            var uEn = $(this).parent().parent().find('.imagelink');
            if(typeof uEn !== 'undefined'){
                owner = $(this).parent().parent().find('.userentry').attr('title');
            }
        }
        
        pushImageToPictures(url, owner, msg, true);
    });
    
    // Future videolinks.
    $(document).on('click', '.videolink', function(e){
        var url = $(this).attr('title');
        var msg = $(this).text();
        
        // Check the message this element is in for an owner.
        var owner = App.user.loggedInAs;
        if(typeof $(this).parent().parent() !== 'undefined'){
            var uEn = $(this).parent().parent().find('.videolink');
            if(typeof uEn !== 'undefined'){
                owner = $(this).parent().parent().find('.userentry').attr('title');
            }
        }
        
        pushImageToPictures(url, owner, msg, true);
    });
        
    // Do we have session a cookie?
    var ckSession = cookie.get('session', 'none');
    if(ckSession === 'none'){
        // Create the login dom
        $('body').append(createDomLogin());
    }
    else {
        var split = ckSession.split('|');
        logInComplete(split[0], split[1], split[2].split(','));
    }
});
