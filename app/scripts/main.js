'use strict';

/**
 * App Data
 */

var App = {
    connection: null, // The WebSocket connection
    characters: {},
    ops: [],
    publicChannels: {},
    privateChannels: {},
    user: { // Collection for items related to the user.
        account: '',            // String (account name)
        ticket: '',             // String (the api ticket aquired at log in)
        characters: [],         // Array of String (character names)
        loggedInAs: '',
        ignoreList: []
    },
    state: { // Collection of items related to the dom
        currentTool: '',
        loggedInCount: -1, // The user count at log in.
        listedCount: 0
    },
    tools: { // A place to store things for each tool: (all tools have a button and content entry for their respective dom elements.) 
        console: {    
            currentlyDisplaying: false,     
            scroller: null, // The dom that needs to scroll 
            messagePush: null, // The dom to append new messages too. (child of the scroller)
            queue: [] // A queue of messages that haven't been displayed yet.
        },
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
            filterPMs: null,
            filterMentions: null,
            filterAlerts: null            
        }
    },
    consts: {
        version: '0.2',
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
                ['fa-floppy', 'Please wait. Lost the little key to the disk box.'],
                ['fa-link', 'Informing Link that his princess is in another castle and that he\'s in the wrong game.'],
                ['fa-paperclip', 'One moment. Just giving Clippy his annual beating so he remembers his place.']
            ]      
        },
        tools: {
            console:    { name: 'console',      title: 'Console',           icon: 'fa-desktop',                 show: 'toolShowConsole' }, 
            status:     { name: 'status',       title: 'Status',            icon: 'fa-list-alt',                show: 'toolShowStatus' },
            channels:   { name: 'channels',     title: 'Channel List',      icon: 'fa-th',                      show: 'toolShowChannelList' },
            viewer:     { name: 'viewer',       title: 'Viewer',            icon: 'fa-eye',                     show: 'toolShowViewer' },
            friends:    { name: 'friends',      title: 'Friends',           icon: 'fa-users',                   show: 'toolShowFriends' },
            pms:        { name: 'pms',          title: 'Private Messages',  icon: 'fa-comments',                show: 'toolShowPMs' },
            feed:       { name: 'feed',         title: 'Feed',              icon: 'fa-feed',                    show: 'toolShowFeed' },
            info:       { name: 'info',         title: 'Info',              icon: 'fa-question',                show: 'toolShowInfo' },
            settings:   { name: 'settings',     title: 'Settings',          icon: 'fa-gears',                   show: 'toolShowSettings' },
            logout:     { name: 'logout',       title: 'Logout',            icon: 'fa-sign-out',                show: 'toolShowLogout' }
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
    }
};

/**
 * Tool Actions =====================================================================================================================
 */

/* Console */

function pushMessageToConsole(message){
    // Get the current time so we can timestamp this messge.
    var timestamp = getHumanReadableTimestampForNow();
    
    // Process BBCODE
    var bb = XBBCODE.process({
        text: message
    });
    
    // Push this message into the message queue
    App.tools['console'].queue.push('<b>' + timestamp + '</b><br/>' + bb.html);
    
    // If the console is open, display the message immediately.
    if(App.state.currentTool === 'console' && App.tools['console'].currentlyDisplaying === false){
        displayQueuedConsoleMessages();
    }
    
    
    // TEST Also to feed
    pushFeedItem('console', message);
}

function displayQueuedConsoleMessages(){
    // if we're already displaying, don't bother.
    if(App.tools['console'].currentlyDisplaying){
         return;
    }
    
    if(App.tools['console'].queue.length > 0){
        App.tools['console'].currentlyDisplaying = true;
        displayNextConsoleMessage(true);
    }
}

function displayNextConsoleMessage(iterate){
    // Get scroller
    var domScroller = App.tools['console'].scroller;
    var domMessageContainer = App.tools['console'].messagePush;
    
    // Is the scrollbar at the bottom?
    var autoScroll = domScroller.scrollTop() >= domScroller[0].scrollHeight - domScroller.height();
    
    // Create a message dom for this message.
    var domMsg = $('<div class="consolemessage"></div>');
        
    // Push the message into the dom
    domMsg.append(App.tools['console'].queue.shift());
    
    // Append dom to console content.
    App.tools['console'].messagePush.append(domMsg);
    
    // Fade in new message
    domMsg.hide();
    domMsg.fadeIn(1000);
    
    // if the scrollbar is already at the bottom..Scroll down the console to the new message
    if(autoScroll){
        App.tools['console'].scroller.stop();
        App.tools['console'].scroller.animate({
            scrollTop: App.tools['console'].messagePush.height()
        }, 1000);
    }
    
    // If iterate
    if(iterate && App.tools['console'].queue.length > 0){
        setTimeout(createNextConsoleMessageTimeoutCallback(iterate), 800);
    }
    else {
        App.tools['console'].currentlyDisplaying = false;
    }
}

function createNextConsoleMessageTimeoutCallback(iterate){
    return function(){
        displayNextConsoleMessage(iterate);
    };
}

/* Status */
function updateStatusForm(){
    App.tools.status.dropdown.val(App.characters[App.user.loggedInAs].status);
    App.tools.status.textarea.val(App.characters[App.user.loggedInAs].statusmsg);
}

/* Channel List */
function refreshChannels(){
    // Start the refesh button spinning
    App.tools['channels'].refreshbutton.addClass('fa-spin');
    
    // Send request message
    sendMessageToServer('CHA');
}

function channelListUpdated(){ // Called from parseServerMessage() when the channel list has been updated
    // Stop the refresh button spinning
    App.tools['channels'].refreshbutton.removeClass("fa-spin");
    
    // Clear any existing channel entries
    App.tools['channels'].entryPush.empty();
    App.tools['channels'].channelEntries = [];
    
    // Sort the entries
    var list = [];
    for(var key in App.publicChannels){
        list.push(key);
    }
    list.sort();   
    
    // Create entries for each channel
    for(var i = 0; i < list.length; i++){
        var dom = createDomChannelListEntry(App.publicChannels[list[i]].name, App.publicChannels[list[i]].characterCount);
        App.tools['channels'].entryPush.append(dom);
    }
}

/* Feed */
function pushFeedItem(type, message){
    var bb = XBBCODE.process({
        text: message
    });
    
    var fullMessage = '';
    
    switch(type){
        case 'console':
            fullMessage += '<p><b>' + getHumanReadableTimestampForNow() + '</b></p>';
            break;
    }
    
    fullMessage += bb.html;
    
    // Process BBCODE
    
        
    // Push message into queue
    App.tools['feed'].queue.push([type, fullMessage]);
    
    // If the feed is open, display the message immediately.
    if(App.state.currentTool == 'feed' && App.tools['feed'].currentlyDisplaying === false){
        displayQueuedFeedMessages();
    }
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
    // Get scroller
    var domScroller = App.tools['feed'].scroller;
    var domMessageContainer = App.tools['feed'].messagePush;
    
    // Is the scrollbar at the bottom?
    var autoScroll = domScroller.scrollTop() >= domScroller[0].scrollHeight - domScroller.height();
    
    // Create dom
    var feedEntry = App.tools['feed'].queue.shift();
    var domMsg = createDomToolFeedMessage(feedEntry[0], feedEntry[1]);
    
    // Append dom to feed content.
    App.tools['feed'].messagePush.append(domMsg);
    
    // Fade in new message
    domMsg.hide();
    domMsg.fadeIn(1000);
    
    // if the scrollbar is already at the bottom..Scroll down the feed to the new message
    if(autoScroll){
        App.tools['feed'].scroller.stop();
        App.tools['feed'].scroller.animate({
            scrollTop: App.tools['feed'].messagePush.height()
        }, 1000);
    }
    
    // If iterate
    if(iterate && App.tools['feed'].queue.length > 0){
        setTimeout(createNextFeedMessageTimeoutCallback(iterate), 800);
    }
    else {
        App.tools['feed'].currentlyDisplaying = false;
    }
}

function createNextFeedMessageTimeoutCallback(iterate){
    return function(){
        displayNextFeedMessage(iterate);
    };
}

/**
 * Tool Show Functions ==========================================================================================================
 */

function toolShowConsole(){
    displayQueuedConsoleMessages();
}

function toolShowStatus(){
    // Update the form to match our currently maintained status.
    updateStatusForm();
}

function toolShowChannelList(){
    // If we don't already have a channel list, fetch one automatically
    if(App.tools['channels'].entryPush.children().length == 0){
        refreshChannels();
    }
}

function toolShowViewer(){
    
}

function toolShowFriends(){
    
}

function toolShowPMs(){
    
}

function toolShowFeed(){
    displayQueuedFeedMessages();
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

function logInComplete(character){
    // Set logged in user
    App.user.loggedInAs = character;
    
    // Set the loading texts
    $('#loadingtext').text('Identification successful.');
    $('#loadingtext2').text('Enjoy using Strawberry!');
    
    // Replace hand
    $('.loginloadingcontent span').removeClass();
    var rpslz = [ 'fa-hand-rock-o', 'fa-hand-paper-o', 'fa-hand-scissors-o', 'fa-hand-lizard-o', 'fa-hand-spock-o'];
    $('.loginloadingcontent span').addClass('fa ' + rpslz[Math.floor(Math.random() * rpslz.length)]);
    $('.loginloadingcontent span').attr('title', 'SCISSORS cuts PAPER covers ROCK crushes LIZARD poisons SPOCK smashes SCISSORS decapitates LIZARD eats PAPER disproves SPOCK vaporizes ROCK crushes SCISSORS');
    
    // Request server information
    sendMessageToServer('UPT');
    
    // Push message
    pushMessageToConsole('Logged in as [icon]' + character + '[/icon]');
    
    // Wait for rest of server data to be brought down.
}

function toggleTool(toolName){
    if(App.state.currentTool === toolName){
        toolName = '';
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
    if(toolName !== ''){
        window[App.consts.tools[toolName].show]();
    }
    
    // Layout
    layout();
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

function getHumanReadableTimestampForNow(){
    var date = new Date();
    return padNumberToTwoDigits(date.getHours()) + ':' + padNumberToTwoDigits(date.getMinutes()) + ':' + padNumberToTwoDigits(date.getSeconds());
}

function padNumberToTwoDigits(number){
    return number < 10 ? '0' + number : number;
}

function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24)
        , days = parseInt((duration/(1000*60*60*24)));

    hours = (hours < 10) ? '0' + hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;

    return days + ' days ' + hours + ' hours, ' + minutes + ' minutes, ' + seconds + ' seconds';
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
                // Store the data we got back
                App.user.account = account;
                App.user.ticket = data.ticket;
                App.user.characters = data.characters;
                
                // Hide the login container
                $('.maincontainer').remove();
                    
                // Create the login character selector dom
                $('body').append(createDomLoginCharacterSelector());
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
        //openWebSocket(App.user.account, App.user.ticket, characterName);
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
    domLL.append('<p id="loadingtext">Attempting to identify with server.<p>');
    domLL.append('<p id="loadingtext2">' + App.consts.icons.loading[index][1] + '</p>');
    
    return domContainer;
}

/* Main Chat */

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
    
    createDomToolConsole();
    createDomToolStatus();    
    createDomToolChannelList();
    createDomToolFeed();
        
    return domChatContainer;
}

function createDomMain(){
    var domMain = $('<div class="main"></div>');
    
        var domChatArea = $('<div class="chatarea"></div>');
        domMain.append(domChatArea);
        
            var domChannels = $('<div class="channels"></div>');
            domChatArea.append(domChannels);
            
                var domChannelList = $('<ul id="channenlist"></ul>');
                domChannels.append(domChannelList);
        
            var domChannel = $('<div class="channel"></div>');
            domChatArea.append(domChannel);
        
                var domChannelContents = $('<div class="channelcontents"></div>');
                domChannel.append(domChannelContents);
                
                    var domNoChannelWrapper = $('<div class="nochannelwrapper"></div>');
                    domChannelContents.append(domNoChannelWrapper);                
                    
                        domNoChannelWrapper.append('<img id="nochannelimage" src="images/strawberry-alpha.png"/>');
        
            var domUserList = $('<div class="userlist"></div>');
            domChatArea.append(domUserList);
        
                var domUserListTopBar = $('<div class="userlisttopbar"></div>');
                domUserList.append(domUserListTopBar);
                
                    domUserListTopBar.append('<span id="userlistchanneltitle">An even longer title than before</span>');
                    domUserListTopBar.append('<span id="userlistclosebutton" class="fabutton fa fa-remove" title="Close Channel"></span>');
        
                var domUserListScroller = $('<div class="userlistscroller"></div>');
                domUserList.append(domUserListScroller);
                
    var domTextEntry = $('<div class="textentry"></div>');
    domMain.append(domTextEntry);
    
        var domMainInput = $('<div class="maininputcontainer"></div>');
        domTextEntry.append(domMainInput);
        
            domMainInput.append('<textarea id="maininput"></textarea>');
        
        var domBottomButtons = $('<div class="bottombuttons"></div>');
        domTextEntry.append(domBottomButtons);
        
            domBottomButtons.append('<button id="btnsendmessage" type="submit" class="btn btn-default" autocomplete="off">Send</button>');
            
    
    return domMain;    
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
    var buttonDom = $('<div class="fabutton" title="' + App.consts.tools[name].title + '"><span class="fa ' + App.consts.tools[name].icon + '"></span></div>');
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
        toggleTool(name);
    };
}

/* Individual Tools */

function createDomToolConsole(){
    var domScroller = $('<div class="toolconsolescroller"></div>');
    var domScrollerContent = $('<div class="toolconsolescrollermessages"></div>');
    domScroller.append(domScrollerContent);
    
    App.tools['console'].content.append(domScroller);
    
    // Store
    App.tools['console'].scroller = domScroller;
    App.tools['console'].messagePush = domScrollerContent;
}

function createDomToolStatus(){
    
    // Top content (avatar / dropdown + messagebox)
    var domContent = $('<div id="toolstatuscontenttop"></div>');
    
    var domAvatar = $('<img id="statusavatar" class="img-rounded" src="https://static.f-list.net/images/avatar/strawberry.png" title="Strawberry"/>');
    domContent.append(domAvatar);    
    
    var domFormContainer = $('<div id="statusform"></div>');
    domContent.append(domFormContainer);
    
    var domDropDown = $('<select id="statusdd" name="status"><option value="online">Online</option><option value="looking">Looking</option><option value="busy">Busy</option><option value="away">Away</option><option value="dnd">DND</option></select>');
    domFormContainer.append(domDropDown);
    
    var domTextArea = $('<textarea id="statusmessage"></textarea>');
    domFormContainer.append(domTextArea);
    
    // Append
    App.tools['status'].content.append(domContent);
    
    // bottom content
    var botContent = $('<div id="toolstatuscontentbottom"></div>');
    App.tools['status'].content.append(botContent);
    
    var btnReset = $('<button id="btnstatusreset" type="submit" class="btn btn-default">Reset</button>');
    botContent.append(btnReset);
    btnReset.click(function(){
        updateStatusForm();
    });
    
    var btnUpdate = $('<button id="btnstatusupdate" type="submit" class="btn btn-default">Update</button>');
    botContent.append(btnUpdate);
    btnUpdate.click(function(){
        // Send Message
        sendMessageToServer('STA { "status": "' + App.tools['status'].dropdown.val() + '", "statusmsg": "' + App.tools['status'].textarea.val() + '" }');
        
        // Disable Update button
        App.tools['status'].updatebutton.addClass('disabled');
        
        // Timeout
        setTimeout(function(){
            App.tools['status'].updatebutton.removeClass('disabled');
        }, 5000);
    });
    
    // store
    App.tools['status'].dropdown = domDropDown;
    App.tools['status'].textarea = domTextArea;
    App.tools['status'].updatebutton = btnUpdate;
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

function createDomChannelListEntry(channelName, characterCount){
    var domContainer = $('<div class="channellistentry"></div>');
    
    var domRoomName = $('<div>' + channelName + '</div>');
    domContainer.append(domRoomName);
    
    var domCharCount = $('<div>' + characterCount + '</div>');
    domContainer.append(domCharCount);
        
    return domContainer;
}

function createDomToolFeed(){
    var domTitleBar = $('<div class="tooltopbar"></div>');
    App.tools['feed'].content.append(domTitleBar);
    
    // buttons
    var btnFilterPM = $('<span class="faicon fa fa-comments" title="Turn off PMs"></span>');
    domTitleBar.append(btnFilterPM);
    
    var btnFilterMentions = $('<span class="faicon fa fa-commenting" title="Turn off Mentions"></span>');
    domTitleBar.append(btnFilterMentions);
    
    var btnFilterAlerts = $('<span class="faicon fa fa-exclamation-triangle" title="Turn off Alerts"></span>');
    domTitleBar.append(btnFilterAlerts);
    
    // scroller
    var domScroller = $('<div class="toolfeedscroller"></div>');
    App.tools['feed'].content.append(domScroller);    
    App.tools['feed'].scroller = domScroller;
    
    // Push
    var domMessages = $('<div class="toolfeedmessages"></div>');
    domScroller.append(domMessages);
    App.tools['feed'].messagePush = domMessages;
}

function createDomToolFeedMessage(type, message){
    // Create a message dom for this message.
    var domMsg = $('<div class="feedmessage"></div>');
        
    // Top bar    
    var topBar = $('<div class="feedmessagetopbar"></div>');
    domMsg.append(topBar);
    
    // Title
    var title = $('<span class="feedtitle">' + type + '</span>');
    topBar.append(title);
        
    // Close button
    var btnClose = $('<span class="famuted fa fa-times"></div>');
    topBar.append(btnClose);   
    btnClose.click(function(){
        $(this).parent().parent().slideUp("slow", function(){
            $(this).remove();
        });
    });
    
    // Message
    var msg = $('<div class="feedmessagemessage">' + message + '</div>');
    domMsg.append(msg);
    
    // return 
    return domMsg;
}

/* Others */

function createDomAlert(message){
    return $('<div class="alert alert-danger fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Error!</strong> ' + message + '</div>');
}

/**
 * WebSocket =====================================================================================================================
 */

function sendMessageToServer(message){
    App.connection.send(message);
}

function openWebSocket(account, ticket, characterName){
    // Create websocket
    App.connection = new WebSocket('ws://chat.f-list.net:8722');
    
    // Add listeners
    App.connection.onopen = function(){
        // Attempt to identify with the server
        var command = 'IDN { "method": "ticket", "account": "' + account + '", "ticket": "' + ticket + '", "character": "' + characterName + '", "cname": "strawberry", "cversion": "' + App.consts.version + '" }';
        sendMessageToServer(command);
        
        // Update message
        $('#loadingtext').text('Attempting to identify with server.');
    };
    
    App.connection.onerror = function(error){
        // TODO Display this error.
        console.log('WebSocket error: ' + error);
    };
    
    App.connection.onmessage = function(e){
        parseServerMessage(e.data); 
    };
    
    App.connection.onclose = function(e){
        // TODO Alert the user.
        console.log('WebSocket closed with code: ' + e.code + ', reason: ' + e.reason + ', wasClean: ' + e.wasClean);
    };
}

/* Server Messages */

function parseServerMessage(message){
    var tag = message.substr(0, 3);
           
    if(message.length > 3){
        var obj = JSON.parse(message.substr(3));
    }
    
    var dontLog = ['PIN', 'IDN', 'VAR', 'HLO', 'CON', 'FRL', 'IGN', 'ADL', 'LIS', 'UPT'];    
    if(dontLog.indexOf(tag) === -1){
        console.log(message);
    }
        
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
            pushMessageToConsole('<b>Admin Broadcast</b>: ' + obj.message);
            break;
        case 'CDS':
            // A channel's description has changed. (Also sent in response to JCH)
            break;
        case 'CHA':
            // Receiving a list of all public channels.
            
            // Update our list of channels.
            for(var i = 0; i < obj.channels.length; i++){
                if(typeof App.publicChannels[obj.channels[i].name] === 'undefined'){
                    App.publicChannels[obj.channels[i].name] = {};
                }
                
                App.publicChannels[obj.channels[i].name].name = obj.channels[i].name;
                App.publicChannels[obj.channels[i].name].mode = obj.channels[i].mode;
                App.publicChannels[obj.channels[i].name].characterCount = obj.channels[i].characters;
            }            
            
            // Inform dom
            channelListUpdated();
            break;
        case 'CIU':
            // Receiving an invite to a channel.
            pushMessageToConsole(obj.sender + ' has invited you to ' + obj.title);
            break;
        case 'CBU':
            // Removes a user from a channel and prevents them from entering. (This just happened or.. what?)
            break;
        case 'CKU':
            // Kicks a user from a channel (this just happened or our client should act on it.. i.e remove the kicked user from user list / close the room if it's us?)
            break;
        case 'COA':
            // Promotes a user to channel operator
            break;
        case 'COL':
            // Gives a list of chat ops. Sent in response to JCH
            break;
        case 'CON':
            // The number of connected users. Received after connecting and identifying.
            pushMessageToConsole('There are currently ' + obj.count + ' users logged in.');
            App.state.loggedInCount = obj.count;
            break;
        case 'COR':
            // Removes a channel operator.
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
            console.log('================== ERROR ===================');
            console.log(message);
            console.log('============================================');
            // Switch for specific errors
            switch(obj.number){
                case 4:
                    // Indentification failed.
                    servErrorIdentification();
                    break;
            }             
            break;
        case 'FKS':
            // Send as a response to the client's FKS command, containing the results of the search.
            break;
        case 'FLN':
            // Send by the server to inform the client that a given character went offline.
            App.characters[obj.character].status = 'offline';
            break;
        case 'FRL':
            // Initial friends list.
            break;
        case 'HLO':
            // Server hello command. Tells which server version is running and who wrote it.
            pushMessageToConsole(obj.message);
            break;
        case 'ICH':
            // Initial channel data. Received in response to JCH along with CDS. (userlist, channelname, mode)
            break;
        case 'IDN':
            // Used to inform the client their identification is successful and handily sends their character name along with it.
            logInComplete(obj.character);            
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
                    pushMessageToConsole('Received an IGN with action: list');
                    break;
                case 'notify': // ?
                    pushMessageToConsole('Received an IGN with action: notify');
                    break;
            }
            
            break;
        case 'JCH':
            // Indicates the given user has joined the given channel. This my also be the client's character.
            break;
        case 'KID':
            // Kinks data in response to a KIN command.
            break;
        case 'LCH':
            // Indicates that the given user has left the given channel. This may also be the client's character.
            break;
        case 'LIS':
            // Receives an array of all the online characters and their gender, status and status msg. (often sent in batches. Use CON to know when we have them all)
            for(var i = 0; i < obj.characters.length; i++){
                App.characters[obj.characters[i][0]] = {
                    gender: obj.characters[i][1],
                    status: obj.characters[i][2],
                    statusmsg: obj.characters[i][3]
                };
                App.state.listedCount++;
            }    
            
            pushMessageToConsole('Received character payload of ' + obj.characters.length + ' character' + (obj.characters.length > 1 ? 's' : '') + '.');
            
            // If the amount of characters now matches or is greater than con, we've received the full user list.
            if(App.state.listedCount >= App.state.loggedInCount){
                // All received.
                // Remove login loading content
                $('.maincontainer').remove();
                    
                // Switch to the chat.
                $('body').append(createDomMainChat());
            }
                    
            break;
        case 'NLN':
            // A user connected.
            if(App.characters[obj.identity] === null || typeof App.characters[obj.identity] === 'undefined'){
                App.characters[obj.identity] = {};
            }            
            App.characters[obj.identity].gender = obj.gender;
            App.characters[obj.identity].status = obj.status;
            break;
        case 'ORS':
            // A list of open private rooms.
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
            break;
        case 'MSG':
            // A message is received from a user in a channel.
            break;
        case 'LRP':
            // A roleplay ad is received from a user in a channel.
            break;
        case 'RLL':
            // Results of a dice roll
            break;
        case 'RMO':
            // A room changed mode.
            break;
        case 'RTB':
            // Real-time bridge. Indicates the user received a note or message, right at the very moment this is received.
            pushMessageToConsole('Real-Time Bridge - Received ' + obj.type + ' from ' + obj.character + '.');
            break;
        case 'SFC':
            // Alerts admins and chatops of an issue.
            break;
        case 'STA':
            // A user changed their status.
            App.characters[obj.character].status = obj.status;
            App.characters[obj.character].statusmsg = obj.statusmsg;
            
            // If us
            if(obj.character === App.user.loggedInAs){
                pushMessageToConsole('Your status has been updated successfully.');
            }
            break;
        case 'SYS':
            // System message from the server.
            console.log(message);
            break;
        case 'TPN':
            // A user informs us of their typing status.
            break;
        case 'UPT':
            // Informs the client of the server's self-tracked online time and a few other bits of information.
            var msg = '[b]System Information[/b]';
            msg += '[ul]';
                msg += '[li]Uptime: ' + msToTime(Math.round(new Date().getTime() / 1000) - parseInt(obj.starttime)) + '[/li]';
                msg += '[li]Channels: ' + obj.channels + '[/li]';
                msg += '[li]Users: ' + obj.users + '[/li]';
				msg += '[li]Max simultaneous users since last restart: ' + obj.maxusers + '[/li]';
				msg += '[li]Accepted Connections: ' + obj.accepted + '[/li]';
            msg += '[/ul]';
            pushMessageToConsole(msg);
            break;
        case 'VAR':
            // Variables the server sends to inform the client about server variables.
            App.serverVars[obj.variable] = obj.value;
            if(obj.variable === 'permissions' && obj.value !== '0'){
                pushMessageToConsole('Welcome F-List Staff member! Let me know if there\'s anything Strawberry can do to help you out!');
            }
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
 * Main Entry Point ===================================================================================================================
 */

$(document).ready(function(){
    // Create the login dom
    $('body').append(createDomLogin());
});
