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
    dom: {
        openChannelList: null,
        channelContents: null,
        userlist: null,
        userlistTopBar: null,
        userlistTitle: null,
        noChannelImage: null,
        mainTextEntry: null,
        mainTextEntryButton: null
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
        selectedChannel: '',
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
        }
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
            filterPMs: null,
            filterMentions: null,
            filterAlerts: null
        }
    },
    consts: {
        version: '0.2',
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
                ['fa-floppy', 'Please wait. Lost the little key to the disk box.'],
                ['fa-link', 'Informing Link that his princess is in another castle and that he\'s in the wrong game.'],
                ['fa-paperclip', 'One moment. Just giving Clippy his annual beating so he remembers his place.']
            ]
        },
        tools: {
            feed:       { name: 'feed',         title: 'Feed',              icon: 'fa-feed',                    show: 'toolShowFeed' },
            status:     { name: 'status',       title: 'Status',            icon: 'fa-list-alt',                show: 'toolShowStatus' },
            channels:   { name: 'channels',     title: 'Channel List',      icon: 'fa-th',                      show: 'toolShowChannelList' },
            viewer:     { name: 'viewer',       title: 'Viewer',            icon: 'fa-eye',                     show: 'toolShowViewer' },
            friends:    { name: 'friends',      title: 'Friends',           icon: 'fa-users',                   show: 'toolShowFriends' },
            pms:        { name: 'pms',          title: 'Private Messages',  icon: 'fa-comments',                show: 'toolShowPMs' },
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
    },
    options: {
		genderColours: {
			male: 			'#5895df',
			female:			'#ea6fbd',
			herm:			'#c148f3',
			shemale:		'#e52591',
			cuntboy:		'#27b011',
			maleherm:		'#1e22bf',
			none:			'#e2e797',
			transgender: 	'#e86937'
		},
		timestamps: true
	}
};

/**
 * Global
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
            
        setTimeout(function(){
            // Remove login loading content
            $('.maincontainer').remove();

            // Switch to the chat.
            $('body').append(createDomMainChat());
        }, App.consts.logInTimeout);
    }    
    else {
        // Keep waiting.
        // Server is still receiving LIS messages with the user list. 
        // Once it's complete, checkForReadyStatus() will be called again.
    }   
}

function throwError(message){
    console.log(message);
    pushFeedItem('error', message);
}

function sendChatMessageToActiveWindow(message){
    return sendChatMessage(message, App.state.selectedChannel);
}

function sendChatMessage(message, channel){
    // Check for bullcrap
    var strippedMessage = stripWhitespace(message);
    if(message == '' || strippedMessage == '' || strippedMessage.length == 0 || channel == '' || channel.length == 0){
        return false;
    }

    // Check for malformed BBCODE
    var bb = XBBCODE.process({
        text: message
    });

    if(bb.error){
        var errorMessage = '[ul]';
        for(var i = 0; i < bb.errorQueue.length; i++){
            errorMessage += '[li]' + bb.errorQueue[i] + '[/li]';        
        }
        errorMessage += '[/ul]'
        pushFeedItem('error', errorMessage);
        return false;
    }

    // Send message to server
    sendMessageToServer('MSG { "channel": "' + channel + '", "message": "' + escapeJson(message) + '" }')

    // Add the message to the chat window
    receiveMessage(channel, App.user.loggedInAs, message);
    
    // Return success
    return true;
}

function updateStatus(character, status, statusmsg){
    App.characters[character].status = status;
    App.characters[character].statusmsg = statusmsg;

    // If us
    if(character === App.user.loggedInAs){
        pushFeedItem('info', 'Your status has been updated successfully.');
    }
    
    // Update all instances of userentry for this character.
    $('.userentry').each(function(){
        var nameplate = $(this).children('.nameplate');
        if(nameplate.text() == character){
            var statusimg = $(this).children('.statusimg');
            statusimg.attr('src', 'images/status-small-' + status.toLowerCase() + '.png');
            statusimg.attr('title', stylizeStatus(status));
            nameplate.attr('title', statusmsg);
        }
    });
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
    if(App.state.selectedChannel !== ''){
        // Is the selected channel public or private?
        var isPublic = App.state.selectedChannel.substr(0, 3) !== 'ADH';

        // get the channel list it belongs to
        var channels = isPublic ? App.publicChannels : App.privateChannels;

        // Remove the message dom.
        channels[App.state.selectedChannel].messageDom.remove();

        // Remove the userlist
        channels[App.state.selectedChannel].userlistDom.remove();

        // Deselect the channel's button
        channels[App.state.selectedChannel].buttonDom.removeClass('fabuttonselected');
    }
    else {
        // Turn off the no-channel stuff
        App.dom.noChannelImage.hide();
    }

    // Turn on the new channel.
    if(name == ''){
        App.dom.noChannelImage.show();
        App.dom.userlistTitle.hide();
    }
    else {
        // Is the new chanel public or private?
        var isPublic = name.substr(0, 3) !== 'ADH';

        // Get the channel list
        var channels = isPublic ? App.publicChannels : App.privateChannels;

        // Attach the message dom
        App.dom.channelContents.append(channels[name].messageDom);

        // Attach the userlist
        App.dom.userlist.append(channels[name].userlistDom);

        // Select the channel's button
        channels[name].buttonDom.addClass('fabuttonselected');

        // Change the current title.
        App.dom.userlistTitle.text(channels[name].title);

        // Ensure the userlist title bar is showing
        App.dom.userlistTopBar.css('display', 'flex');
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
        throwError('Trying to open a channel that is already open.');
        return;
    }

    // Is this a public or private channel?
    var isPublic = name.substr(0, 3) !== 'ADH';

    // Get the list of channels.
    var channels = isPublic ? App.publicChannels : App.privateChannels;

    // Push into the list of open channels.
    App.state.openChannels.push(name);

    // Do we need to create doms for this channel?
    if(typeof channels[name].messageDom === 'undefined'){
        var domMessages = createDomChannelContents();
        channels[name].messageDom = domMessages;
    }

    if(typeof channels[name].userlistDom === 'undefined'){
        var domUserlist = createDomChannelUserlist();
        channels[name].userlistDom = domUserlist;
    }

    if(typeof channels[name].buttonDom === 'undefined'){
        var domButton = createDomChannelButton(isPublic, name, channels[name].title);
        channels[name].buttonDom = domButton;
    }

    // Append the dom button to the channel list.
    App.dom.openChannelList.append(channels[name].buttonDom);

    // Add the click listener to the dom button
    channels[name].buttonDom.click(function(){
        var channelName = $(this).find('#data').attr('title');
        selectChannel(channelName);
    });

    // (Re)Create the userlist
    channels[name].userlistDom.empty();
    for(var i = 0; i < channels[name].users.length; i++){
        var charName = channels[name].users[i];
        var dom = createDomUserEntry(charName, App.characters[charName].gender, App.characters[charName].status, App.characters[charName].statusmsg);
        channels[name].userlistDom.append(dom);
    }

    // If no channel is selected, select this one
    if(App.state.selectedChannel == ''){
        selectChannel(name);
    }
}

function leaveChannel(name){
    sendMessageToServer('LCH { "channel": "' + name + '" }');
}

function closeChannel(name){
    // If this channel isn't in the list of open channels.
    if(App.state.openChannels.indexOf(name) === -1){
        console.log("Trying to close a channel that isn't open.");
        pushFeedItem('error', 'Tried to close channel ' + name + ' when it isn\'t open.');
        return;
    }

    // Was the channel public?
    var isPublic = name.substr(0, 3) !== 'ADH';
    var channels = isPublic ? App.publicChannels : App.privateChannels;

    // Get the index of our button in the list of buttons.
    var removeIndex = App.state.openChannels.indexOf(name);

    // Remove doms.
    channels[name].buttonDom.remove();
    channels[name].messageDom.remove();
    channels[name].userlistDom.remove();

    // remove form open channel list
    App.state.openChannels.splice(removeIndex, 1);

    // If there are no channels to move to show the no channel stuff.
    if(App.state.openChannels.length == 0){
        App.dom.noChannelImage.show();
        App.dom.userlistTopBar.hide();
        App.state.selectedChannel = '';
    }
    else {
        // what channel should we select next?
        removeIndex -= 1;
        if(removeIndex < 0) removeIndex = 0;

        // get the button dom
        var newChannelName = App.state.openChannels[removeIndex];

        // Select the channel
        selectChannel(newChannelName);
    }
}

function receiveMessage(channel, character, message){
    var isPublic = channel.substr(0, 3) !== 'ADH';
    var channels = isPublic ? App.publicChannels : App.privateChannels;
    if(typeof channels[channel].messages === 'undefined'){
        channels[channel].messages = [];
    }
    channels[channel].messages.push([character, message]);

    // Create dom
    var dom = createDomMessage(character, message);
    channels[channel].messageDom.append(dom);
}

/**
 * Tool Actions =====================================================================================================================
 */

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
    for(var i = 0; i < publicList.length; i++){
        var dom = createDomChannelListEntry(App.publicChannels[publicList[i]].name, App.publicChannels[publicList[i]].name, App.publicChannels[publicList[i]].characterCount);
        App.tools['channels'].entryPush.append(dom);
    }

    // Add a title seperator for "Private Channels"
    var sepDom = $('<div class="channellistseperator">Private Channels</div>');
    App.tools['channels'].entryPush.append(sepDom);

    var privateList = [];
    for(var key in App.privateChannels){
        privateList.push([App.privateChannels[key].title, key]);
    }
    privateList.sort(function(a, b){
        var titleA = a[0].toLowerCase();
        var titleB = b[0].toLowerCase();

        if(titleA < titleB) return -1;
        if(titleA > titleB) return 1;
        return 0;
    });

    // Create entires
    for(var i = 0; i < privateList.length; i++){
        var dom = createDomChannelListEntry(privateList[i][1], privateList[i][0], App.privateChannels[privateList[i][1]].characterCount);
        App.tools['channels'].entryPush.append(dom);
    }
}

/* Feed */
function pushFeedItem(type, message){
    // Process BBCODE
    var bb = XBBCODE.process({
        text: message
    });

    // Push message into queue
    App.tools['feed'].queue.push([type, bb.html]);

    // If the feed is open, display the message immediately.
    if(App.state.currentTool == 'feed' && App.tools['feed'].currentlyDisplaying === false){
        displayQueuedFeedMessages();
    }
    else {
        // Increment and show the counter.
        if(typeof App.tools['feed'].counter !== 'undefined'){
            App.tools['feed'].counter.text.text(App.tools['feed'].queue.length);
            App.tools['feed'].counter.image.fadeIn();
            App.tools['feed'].counter.text.fadeIn();

        }
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
    domMsg.fadeIn(1000, function(){
        // Decrement the feed counter
        var curCount = App.tools['feed'].counter.text.text();
        App.tools['feed'].counter.text.text(curCount - 1);
        if(curCount - 1 <= 0){
            // fade out
            App.tools['feed'].counter.image.fadeOut();
            App.tools['feed'].counter.text.fadeOut();
        }
    });

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

function stripWhitespace(str){
	return str.replace(/ /g,'').replace(/[^\w\s]/gi, '');
}

function stylizeStatus(status){
    status = status.toLowerCase();
    if(status == 'dnd'){
        status = 'DND';
    }
    else {
        status = status.charAt(0).toUpperCase() + status.substr(1);
    }
    return status;
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

    createDomToolStatus();
    createDomToolChannelList();
    createDomToolFeed();
    createDomToolViewer();
    createDomToolFriendsList();

    return domChatContainer;
}

function createDomMain(){
    var domMain = $('<div class="main"></div>');

        var domChatArea = $('<div class="chatarea"></div>');
        domMain.append(domChatArea);

            var domChannels = $('<div class="channels"></div>');
            domChatArea.append(domChannels);

                var domChannelList = $('<div id="channenlist"></div>');
                domChannels.append(domChannelList);
                App.dom.openChannelList = domChannelList;
                domChannelList.sortable();

            var domChannel = $('<div class="channel"></div>');
            domChatArea.append(domChannel);

                var domChannelContents = $('<div class="channelcontents"></div>');
                domChannel.append(domChannelContents);
                App.dom.channelContents = domChannelContents;

                    var domNoChannelWrapper = $('<div class="nochannelwrapper"></div>');
                    domChannelContents.append(domNoChannelWrapper);
                    App.dom.noChannelImage = domNoChannelWrapper;

                        domNoChannelWrapper.append('<img id="nochannelimage" src="images/strawberry-alpha.png"/>');

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

    var domTextEntry = $('<div class="textentry"></div>');
    domMain.append(domTextEntry);

        var domMainInput = $('<div class="maininputcontainer"></div>');
        domTextEntry.append(domMainInput);

            var domTextArea = $('<textarea id="maininput"></textarea>');
            domMainInput.append(domTextArea);
            App.dom.mainTextEntry = domTextArea;
            domTextArea.on('keypress', function(e){
                if(e.which == 13 && !e.shiftKey){
                    e.preventDefault();
                    var result = sendChatMessageToActiveWindow(App.dom.mainTextEntry.val());
                    if(result){
                        App.dom.mainTextEntry.val("");
                    }
                }
            });

        var domBottomButtons = $('<div class="bottombuttons"></div>');
        domTextEntry.append(domBottomButtons);

            var domTextEntryButton = $('<button id="btnsendmessage" type="submit" class="btn btn-default" autocomplete="off">Send</button>');
            domBottomButtons.append(domTextEntryButton);
            App.dom.mainTextEntryButton = domTextEntryButton;
            domTextEntryButton.click(function(e){
                e.preventDefault();
                var result = sendChatMessageToActiveWindow(App.dom.mainTextEntry.val());
                if(result){
                    App.dom.mainTextEntry.val("");
                }
            });

    return domMain;
}

function createUserListCloseButtonClickCallback(){
    return function(){
        leaveChannel(App.state.selectedChannel);
    }
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
}

/* Individual Tools */
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

function createDomChannelListEntry(channelName, channelTitle, characterCount){
    var domContainer = $('<div class="channellistentry"></div>');

    var domRoomName = $('<div>' + channelTitle + '</div>');
    domContainer.append(domRoomName);

    var domCharCount = $('<div>' + characterCount + '</div>');
    domContainer.append(domCharCount);

    var domHidden = $('<span id="data" title="' + channelName + '" style="display: none;"></span>')
    domContainer.append(domHidden);

    domContainer.click(function(){
        // Get the hidden data.
        var channelName = $(this).find("#data").attr('title');
        joinChannel(channelName);
    });

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
    var typeText = type;
    switch(type){
        case 'info':
            typeText = getHumanReadableTimestampForNow();
            break;
        case 'error':
            typeText = 'Error';
            break;
    }


    var title = $('<span class="feedtitle">' + typeText + '</span>');
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

    // Extra classes
    switch(type){
        case 'error':
            domMsg.addClass('error');
            break;
    }

    // return
    return domMsg;
}

function createDomToolViewer(){
    var domTitleBar = $('<div class="tooltopbar"></div>');
    App.tools['viewer'].content.append(domTitleBar);
    
    // buttons
    var btnOpenProfile = $('<span class="faicon fa fa-external-link" title="Open Profile"></span>');
    domTitleBar.append(btnOpenProfile);
    
    var btnSendNote = $('<span class="faicon fa fa-envelope" title="Send Note"></span>');
    domTitleBar.append(btnSendNote);
    
    var btnMemo = $('<span class="faicon fa fa-sticky-note" title="View/Edit Memo"></span>')
    domTitleBar.append(btnMemo);
    
    var btnFriend = $('<span class="faicon fa fa-user-plus" title="Send Friend Request"></span>');
    domTitleBar.append(btnFriend);
    
    var btnBookmark = $('<span class="faicon fa fa-bookmark-o" title="Bookmark"></span>');
    domTitleBar.append(btnBookmark);   
    
    var btnOpenPM = $('<span class="faicon fa fa-comments" title="Open PM"></span>');
    domTitleBar.append(btnOpenPM);
    
    // Scroller
    var domScroller = $('<div class="toolviewerscroller"></div>');
    App.tools['viewer'].content.append(domScroller);
    App.tools['viewer'].scroller = domScroller;
    
    // Push
    var domContent = $('<div class="toolviewerarea"></div>');
    domScroller.append(domContent);
    App.tools['viewer'].scrollerContent = domContent; 
}

function createDomToolFriendsList(){
    
    // Title bar
    var domTitleBar = $('<div class="tooltopbar"></div>');
    App.tools['friends'].content.append(domTitleBar);
    
    // buttons
    var btnAll = $('<span class="faicon fa fa-check-circle-o" title="All Characters"></span>');
    domTitleBar.append(btnAll);
    
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
    var order = [];
    for(var key in App.user.friendsList){
        order.push(key);
        // Sort this list of friends.
        App.user.friendsList[key].sort();
    }
    order.sort();
    
    // Add the logged in character's friends first.
    for(var i = 0; i < App.user.friendsList[App.user.loggedInAs].length; i++){
        var dom = createDomFriendsListEntry(App.user.loggedInAs, App.user.friendsList[App.user.loggedInAs][i]);
        App.tools['friends'].scrollerContent.append(dom);
        dom.click(function(){
            // TODO Open viewer for this character
            console.log("Viewer: " + $(this).attr('title'));
        });
    }
}

function createDomFriendsListEntry(sourceName, friendName){
    var escapedSourceName = escapeHtml(sourceName).toLowerCase();
    var escapedFriendName = escapeHtml(friendName).toLowerCase();
    
    var stat = "Offline";
    var statusmsg = "";
    
    if(typeof App.characters[friendName] != 'undefined'){
        stat = App.characters[friendName].status;
        statusmsg = App.characters[friendName].statusmsg;
    }
    
    // Dom
    var domContainer = $('<div class="friendentry" title="' + friendName + '"></div>');
    
    // Avatar
    var domAvatar = $('<div class="friendentryavatar"></div>');
    domContainer.append(domAvatar);
    
    var domAvatarUnderImage = $('<img class="avatarunderimage img-rounded" src="https://static.f-list.net/images/avatar/' + escapedFriendName + '.png" title="' + friendName + '"/>')
    domAvatar.append(domAvatarUnderImage);
    var domAvatarOverStatus = $('<img class="avataroverstatus" src="images/status-large-' + stat + '.png" title="' + stat + '"/>');
    domAvatar.append(domAvatarOverStatus);
    var domAvatarSourceThumb = $('<img class="avatarsourcethumb img-circle" src="https://static.f-list.net/images/avatar/' + escapedSourceName + '.png" title="' + sourceName + '"/>')
    domAvatar.append(domAvatarSourceThumb);
    
    // Text    
    var domFriendEntryText = $('<div class="friendentrytext"><p><b>' + friendName + '</b></p><p><table style="table-layout: fixed; width: 100%; word-wrap: break-word;"><td>' + statusmsg + '</td></table></p></div>');    
    domContainer.append(domFriendEntryText);
    
    return domContainer;   
}

/* Channels */
function createDomChannelContents(){
    return $('<div class="channelmessages"></div>');
}

function createDomChannelUserlist(){
    return $('<div class="userlistcontents"></div>');
}

function createDomChannelButton(isPublic, channelName, channelTitle){
    return $('<div class="fabutton" title="' + channelTitle + '"><span id="data" title="' + channelName + '"></span><span class="fa ' + (isPublic ? 'fa-th' : 'fa-key') + '"></span></div>');
}

/* Others */

function createDomAlert(message){
    return $('<div class="alert alert-danger fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Error!</strong> ' + message + '</div>');
}

function createDomUserEntry(name, gender, status, statusmsg){
    var domContainer = $('<div class="userentry"></div>');

    var genderColour = '#444444';
    if(name != 'Description'){
        var domImg = $('<img class="statusimg" src="images/status-small-' + status.toLowerCase() + '.png" title="' + status + '"/>');
        domContainer.append(domImg);
        genderColour = App.options.genderColours[App.characters[name].gender.toLowerCase()];
    }

    domContainer.append('<div class="nameplate" style="color: ' + genderColour + '" title="' + statusmsg + '">' + name + '</div>');

    return domContainer;
}

function createDomMessage(character, message){
    var domContainer = $('<div class="message"></div>');
    
    var finalMessage = '';
    if(character.toLowerCase() != 'description'){
        var gender = App.characters[character].gender;
        var status = App.characters[character].status;
        var statusmsg = App.characters[character].statusmsg;
        var userEntry = createDomUserEntry(character, gender, status, statusmsg);
        domContainer.append(userEntry);
        finalMessage = ': ';
    }
    else {
        finalMessage = '<b>Description</b>: ';
    }
    
    var bb = XBBCODE.process({
        text: message
    });
    
    finalMessage += bb.html;    

    domContainer.append('<div class="messagetext">' + finalMessage + '</div>');

    return domContainer;
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

        // Log in state
        App.state.logInReadyInfo.identified = true;

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

    var dontLog = ['PIN', 'IDN', 'VAR', 'HLO', 'CON', 'FRL', 'IGN', 'ADL', 'UPT', 'CHA', 'ICH', 'CDS', 'COL', 'JCH', 'LIS', 'NLN', 'JCH'];
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
            pushFeedItem('info', '<b>Admin Broadcast</b>: ' + obj.message);
            break;
        case 'CDS':
            // A channel's description has changed. (Also sent in response to JCH)
            var isPublic = obj.channel.substr(0, 3) !== 'ADH';
            var channels = isPublic ? App.publicChannels : App.privateChannels;
            var showNewDescription = typeof channels[obj.channel].description === 'undefined' || channels[obj.channel].description != obj.description;
            console.log("Showing description: " + showNewDescription);
            if(showNewDescription){            
                receiveMessage(obj.channel, 'Description', obj.description);
            }
            // Store description
            channels[obj.channel].description = obj.description;
            break;
        case 'CHA':
            // Receiving a list of all public channels.

            // Update our list of channels.
            for(var i = 0; i < obj.channels.length; i++){
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
            pushFeedItem('info', obj.sender + ' has invited you to ' + obj.title);
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
            var isPublic = obj.channel.substr(0, 3) !== 'ADH';
            var channels = isPublic ? App.publicChannels : App.privateChannels;
            channels[obj.channel].ops = obj.oplist;
            break;
        case 'CON':
            // The number of connected users. Received after connecting and identifying.
            pushFeedItem('info', 'There are currently ' + obj.count + ' users logged in.');
            App.state.logInReadyInfo.initialCharacterCount = obj.count;
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
            // TODO Remove user from any rooms he/she was in (including userlist entries)
            // TODO update any exsiting userentries on messages to reflect new status.
            break;
        case 'FRL':
            // Initial friends list. (not used)
            break;
        case 'HLO':
            // Server hello command. Tells which server version is running and who wrote it.
            pushFeedItem('info', obj.message);
            break;
        case 'ICH':
            // Initial channel data. Received in response to JCH along with CDS. (userlist, channelname, mode)

            // Is this channel public or private?
            var isPublic = obj.channel.substr(0, 3) !== 'ADH';
            var channels = isPublic ? App.publicChannels : App.privateChannels;

            // Do we have any info for this channel?
            if(typeof channels[obj.channel] === 'undefined'){
                channels[obj.channel] = {
                    name: name,
                    title: isPublic ? name : 'unknown',
                    mode: 'unknown'
                };
            }

            // Store user list. Wipe out any existing userlist, we're getting a new, whole one.
            channels[obj.channel].users = [];
            for(var i = 0; i < obj.users.length; i++){
                channels[obj.channel].users.push(obj.users[i].identity);
            }

            // Open this channel.
            openChannel(obj.channel);
            break;
        case 'IDN':
            // Used to inform the client their identification is successful and handily sends their character name along with it.
            
            // Set logged in user
            App.user.loggedInAs = obj.character;

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
                    pushFeedItem('info', 'Received an IGN with action: list');
                    break;
                case 'notify': // ?
                    pushFeedItem('info', 'Received an IGN with action: notify');
                    break;
            }

            break;
        case 'JCH':
            // Indicates the given user has joined the given channel. This my also be the client's character.
            // Don't use to know when we've joined a room. Use ICH.
            break;
        case 'KID':
            // Kinks data in response to a KIN command.
            break;
        case 'LCH':
            // Indicates that the given user has left the given channel. This may also be the client's character.
            if(obj.character === App.user.loggedInAs){
                closeChannel(obj.channel);
            }
            break;
        case 'LIS':
            // Receives an array of all the online characters and their gender, status and status msg. (often sent in batches. Use CON to know when we have them all)
            for(var i = 0; i < obj.characters.length; i++){
                App.characters[obj.characters[i][0]] = {
                    gender: obj.characters[i][1],
                    status: stylizeStatus(obj.characters[i][2]),
                    statusmsg: obj.characters[i][3]
                };
                App.state.logInReadyInfo.listedCharacters++;
            }

            pushFeedItem('info', 'Received character payload of ' + obj.characters.length + ' character' + (obj.characters.length > 1 ? 's' : '') + '.');

            // If the amount of characters now matches or is greater than con, we've received the full user list.
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
            receiveMessage(obj.channel, obj.character, obj.message);
            break;
        case 'NLN':
            // A user connected.
            if(App.characters[obj.identity] === null || typeof App.characters[obj.identity] === 'undefined'){
                App.characters[obj.identity] = {};
            }
            App.characters[obj.identity].gender = obj.gender;
            App.characters[obj.identity].status = stylizeStatus(obj.status);

            // TODO Show a feed item if this user is our friend.
            break;
        case 'ORS':
            // A list of open private rooms.

             // Update our list of channels.
            for(var i = 0; i < obj.channels.length; i++){
                if(typeof App.privateChannels[obj.channels[i].name] === 'undefined'){
                    App.privateChannels[obj.channels[i].name] = {};
                }

                App.privateChannels[obj.channels[i].name].name = obj.channels[i].name;
                App.privateChannels[obj.channels[i].name].title = obj.channels[i].title;
                App.privateChannels[obj.channels[i].name].mode = obj.channels[i].mode;
                App.privateChannels[obj.channels[i].name].characterCount = obj.channels[i].characters;
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
            break;
        case 'RLL':
            // Results of a dice roll
            break;
        case 'RMO':
            // A room changed mode.
            break;
        case 'RTB':
            // Real-time bridge. Indicates the user received a note or message, right at the very moment this is received.
            pushFeedItem('info', 'Real-Time Bridge - Received ' + obj.type + ' from ' + obj.character + '.');
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
            console.log(message);
            break;
        case 'TPN':
            // A user informs us of their typing status.
            console.log(message);
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
            pushFeedItem('info', msg);
            
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
            if(obj.variable === 'permissions' && obj.value !== '0'){
                pushFeedItem('info', 'Welcome F-List Staff member! Let me know if there\'s anything Strawberry can do to help you out!');
            }
            break;
        default:
            var msg = "Server received an unhandled message: " + message;
            console.log(msg);
            pushFeedItem('error', msg);
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
 * Post Helpers ======================================================================================================================
 */

function postForFriendsList(){
    $.post('https://www.f-list.net/json/api/friend-list.php', 
		'ticket=' + App.user.ticket + '&account=' + App.user.account,
		function(data){			
			var friends = data.friends;
			App.user.friendsList = {};
			for(var i = 0; i < friends.length; i++){
				var source = friends[i].source;
				var dest = friends[i].dest;
				if(typeof App.user.friendsList[source] == 'undefined'){
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
            $('#loadingtext2').text('Waiting for full user list to download... ' + App.state.logInReadyInfo.listedCharacters + " / " + App.state.logInReadyInfo.initialCharacterCount);
            
            // Log in process complete (except for full user list)
            checkForReadyStatus();                       
		}
	);
}

/**
 * Main Entry Point ===================================================================================================================
 */

$(document).ready(function(){
    // Create the login dom
    $('body').append(createDomLogin());
});
