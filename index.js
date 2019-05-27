'use strict';

const EventEmitter = require('events');
const axios = require('axios');
const WebSocket = require('ws');

const queries = {
	AddModerator: linoUsername => `{"operationName":"AddModerator","variables":{"username":"${linoUsername}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"b88215618f960182d73af646dac60f93a542e1d10ac93e14a988a38cb2fb87fd"}}}`,
	BanStreamChatUser: (username, streamer) => `{"operationName":"BanStreamChatUser","variables":{"streamer":"${streamer}","username":"${username}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"4eaeb20cba25dddc95df6f2acf8018b09a4a699cde468d1e8075d99bb00bacc4"}}}`,
	BrowsePageSearchCategory: (first, text) => `{"operationName":"BrowsePageSearchCategory","variables":{"text":"${text}","first":${first}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"3e7231352e1802ba18027591ee411d2ca59030bdfd490b6d54c8d67971001ece"}}}`,
	CoinbaseToken: item => `{"operationName":"CoinbaseToken","variables":{"item":"${item}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"ae57c263b4127fe95cf89f68dfb4863f26045b8ec7802f3ff32b0cf8a651b986"}}}`,
	CreateXsollaToken: (item, language) => `{"operationName":"CreateXsollaToken","variables":{"language":${language},"item":"${item}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"62f447ba8aa988f69ffa92cc6a4bdaa618d11279e961823931dbf3d7d08ea886"}}}`,
	DeleteChat: (linoUsername, id) => `{"operationName":"DeleteChat","variables":{"streamer":"${linoUsername}","id":"${id}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"7ae6f96161b89d9831dcf217f11f67c1edf5bb311d8819101345ed8eb38f6ed9"}}}`,
	EmoteBan: (linoUsername, emoteStr) => `{"operationName":"EmoteBan","variables":{"emoteStr":"${emoteStr}","streamer":"${linoUsername}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"ba0c6a172eb57160fc681d477e65015275103ec023b60299943203ea75384fa8"}}}`,
	EmoteDelete: (name, level, type) => `{"operationName":"EmoteDelete","variables":{"input":{"name":"${name}","level":"${level}","type":"${type}"}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"80cb5931bcaa0a880e81995278c65814d8ad1ae667119bef69fae61661c1c894"}}}`,
	EmoteSave: (name, level, type) => `{"operationName":"EmoteSave","variables":{"input":{"name":"${name}","level":"${level}","myLevel":"${level}","type":"${type}"}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"51ce734e85a15e6a5eb3ac61583660219e7a5bfc42ad70c2d9c29be8ca721c83"}}}`,
	FollowUser: displayName => `{"operationName":"FollowUser","variables":{"streamer":"${displayName}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"daf146d77e754b6b5a7acd945ff005ae028b33feaa3c79e04e71505190003a5d"}}}`,
	FollowingPageLivestreams: first => `{"operationName":"FollowingPageLivestreams","variables":{"first":${first},"after":"4"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"160a6ac4f2f7d81fb8b9c41119961d5f33cc6bed53c0357a786194babb1ba3ea"}}}`,
	GlobalInformation: () => '{"operationName":"GlobalInformation","variables":{},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"b9760d0a3a09e4c6efb8007d543d2e61cf31e8672ead0e37df0b192c65d42ea8"}}}',
	HomePageLivestream: (categoryID, first, languageID, ShowNSFW, userLanguageCode) => `{"operationName":"HomePageLivestream","variables":{"first":${first},"languageID":${languageID},"categoryID":${categoryID},"showNSFW":${ShowNSFW},"userLanguageCode":"${userLanguageCode}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"cd4d049ad52f012e129e2c7e7c7697d9b3c7a4acddf7ae27e004dceca1fe5df5"}}}`,
	LivestreamPage: displayName => `{"operationName":"LivestreamPage","variables":{"displayname":"${displayName}","add":false,"isLoggedIn":false},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"18e1c6e0e3f6a5165aff009fdef0581b54366c7d9ff4871f7879724c08b2468c"}}}`,
	LivestreamProfileFollowers: (displayName, first, sortedBy) => `{"operationName":"LivestreamProfileFollowers","variables":{"displayname":"${displayName}","sortedBy":"${sortedBy}","first":${first},"isLoggedIn":true},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"594aa2d7a4e70735554973197cfdc11956accdaa3f0af7e7a6d9f6501b597842"}}}`,
	LivestreamProfileFollowing: (displayName, first, sortedBy) => `{"operationName":"LivestreamProfileFollowing","variables":{"displayname":"${displayName}","sortedBy":"${sortedBy}","first":${first},"isLoggedIn":true},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"67d0a40d2062372fe6c4240e374dd4fa1c0e3ac843bb79ee48ad36458f98fb58"}}}`,
	LivestreamProfileReplay: displayName => `{"operationName":"LivestreamProfileReplay","variables":{"displayname":"${displayName}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"7a1525ab66dfb3af5a2d5877db840b7222222665202aa034a51b95f7a7ed9fe0"}}}`,
	LivestreamProfileVideo: (displayName, sortedBy, first) => `{"operationName":"LivestreamProfileVideo","variables":{"displayname":"${displayName}","sortedBy":"${sortedBy}","first":${first}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"df2b8483dbe1fb13ef47e3cf6af8d230571061d7038625587c7ed066bdbdddd3"}}}`,
	LivestreamTreasureChestWinners: displayName => `{"operationName":"LivestreamTreasureChestWinners","variables":{"displayname":"${displayName}","isLoggedIn":true},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"d4bf8568e7ba9db7acc44269c2c08b18ccfb7a271c376eb4a5d6d9485acd51c3"}}}`,
	MeBalance: () => '{"operationName":"MeBalance","variables":{},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"6e6794dcd570ff8ed544d45483971969db2c8e968a3a082645ae92efa124f3ec"}}}',
	MeDashboard: () => '{"operationName":"MeDashboard","variables":{"isLoggedIn":true},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"8a4f67c0945b443f547d545c8d15e20548624308857e17b027f15d8f7cacfa97"}}}',
	MeGlobal: () => '{"operationName":"MeGlobal","variables":{},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"c69723c66973bb8f544f11fcf375be71217ffd932ff72cc40f22252a076f84e2"}}}',
	MeLivestream: () => '{"operationName":"MeLivestream","variables":{"isLoggedIn":true},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"73453911d90c67a6ba7d9fec2a5be05cc035c09d96b9b01016bd3e7210336cd6"}}}',
	MePartnerProgress: isNotGlobalPartner => `{"operationName":"MePartnerProgress","variables":{"isNotGlobalPartner":${isNotGlobalPartner}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"2b7bb8b4437d68c4bc93d48af58b9a426b427b9003858235f7b13005aa85a86a"}}}`,
	MeSidebar: first => `{"operationName":"MeSidebar","variables":{"folowingFirst":${first}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"394a0e72d9e488ae4812925c3c5d0b261de66110953c2759a7e4ea823a68cb81"}}}`,
	MeSubscribing: first => `{"operationName":"MeSubscribing","variables":{"first":${first}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"7529cb69c79422d532d5c2ea5e80c066d15f383c8e9af98e2790a057876cec4b"}}}`,
	PaybrosPrices: () => '{"operationName":"PaybrosPrices","variables":{},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"9f9c1b9eacf2617a5139ecf6eacdb678bf6ce2c5f02c3383c34bb299695e254e"}}}',
	RemoveModerator: (linoUsername) => `{"operationName":"RemoveModerator","variables":{"username":"${linoUsername}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"ed89114819f8ac9d2a62e4260842dd6c7c32f5a3edfa564e3d4dda1eeb0ba7c6"}}}`,
	SendStreamChatMessage: (linoUsername, message) => `{"operationName":"SendStreamChatMessage","variables":{"input":{"streamer":"${linoUsername}","message":"${message}","roomRole":"Owner","subscribing":true}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"c7cbec82e7b7a81698232874d2686f51bec3ac448194ec9dd4ff480beff9907c"}}}`,
	SetChatInterval: seconds => `{"operationName":"SetChatInterval","variables":{"seconds":${seconds}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"353fa9498a47532deb97680ea72647cba960ab1a90bda4cdf78da7b2d4d3e4b0"}}}`,
	StreamChatModerators: (displayName, first, search) => `{"operationName":"StreamChatModerators","variables":{"displayname":"${displayName}","first":${first},"search":"${search}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"aa2d1796cb4d043d5c96bee48f8399e4d2a62079b45f40bdc7063b08b9da9711"}}}`,
	StreamDonate: (permLink, type, count) => `{"operationName":"StreamDonate","variables":{"input":{"permlink":"${permLink}","type":"${type}","count":${count}}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"42dbd0f6f50503b37cd48e4cc76aa7d0bb9f6c3f3dea48567951e856b4d93788"}}}`,
	StreamMessageSubscription: linoUsername => `{"type":"start","payload":{"variables":{"streamer":"${linoUsername}"},"operationName":"StreamMessageSubscription","query":"subscription StreamMessageSubscription($streamer:String!){streamMessageReceived(streamer:$streamer){type ... on ChatGift{id gift amount recentCount expireDuration ...VStreamChatSenderInfoFrag}... on ChatHost{id viewer...VStreamChatSenderInfoFrag}... on ChatSubscription{id month...VStreamChatSenderInfoFrag}... on ChatChangeMode{mode}... on ChatText{id content ...VStreamChatSenderInfoFrag}... on ChatFollow{id ...VStreamChatSenderInfoFrag}... on ChatDelete{ids}... on ChatBan{id ...VStreamChatSenderInfoFrag}... on ChatModerator{id ...VStreamChatSenderInfoFrag add}... on ChatEmoteAdd{id ...VStreamChatSenderInfoFrag emote}}}fragment VStreamChatSenderInfoFrag on SenderInfo{subscribing role roomRole sender{id username displayname avatar partnerStatus}}"}}`,
	TopContributors: (displayName, first, rule) => `{"operationName":"TopContributors","variables":{"displayname":"${displayName}","first":${first},"rule":"${rule}","queryStream":false},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"e0b23582f5f8fecb9ccdc607cc9a0b56572af37692915e6fe3ac4daf21bb389b"}}}`,
	UnbanStreamChatUser: (displayName, linoUsername) => `{"operationName":"UnbanStreamChatUser","variables":{"streamer":"${linoUsername}","username":"${displayName}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"574e9a8db47ff719844359964d6108320e4d35f0378d7f983651d87b315d4008"}}}`,
	UnfollowUser: displayName => `{"operationName":"UnfollowUser","variables":{"streamer":"${displayName}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"681ef3737bb34799ffe779b420db05b7f83bc8c3f17cdd17c7181bd7eca9859c"}}}`,
	chatEmoteModeSet: (NoAllEmote, NoGlobalEmote, NoMineEmote) => `{"operationName":"chatEmoteModeSet","variables":{"emoteMode":{"NoMineEmote":${NoMineEmote},"NoGlobalEmote":${NoGlobalEmote},"NoAllEmote":${NoAllEmote}}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"e48c0db8189ca7bf1a36a3be94f142a1764f194e00dd190837f943b1e3009b9d"}}}`,
	HomePageLeaderboard: () => '{"operationName":"HomePageLeaderboard","variables":{},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"b91545806fb283c94ee881686678709097134f08ff263b887b9837781f5a818a"}}}'

};

/**
 * POST request to Dlive
 * @param {string} authorization - Your authentication key
 * @param {string} data - stringified JSON POST data
 * @returns {object} - Axios response object
 */
const request = (authorization, data) => new Promise(resolve => {
	axios({
		url: 'https://graphigo.prd.dlive.tv:443',
		method: 'post',
		headers: { authorization },
		data
	}).then(res => {
		if (res.errors !== undefined) throw new Error(res.errors);
		resolve(res.data);
	}).catch(e => {
		throw new Error('Request error: ' + e);
	});
});

/**
 * Dlive class definition
 */
module.exports = class Dlive extends EventEmitter {

	/**
	 * @param {string} authKey - Your authentication key
	 * @param {string} displayName - Your Dlive username.
	 */
	constructor(authKey, displayName = null) {
		super();
		this.start(displayName, authKey);
	}

	/**
	 * @param {string} displayName - The Dlive username of who you intend to mute/ban.
	 * @param {string} linoUsername - Lino username of the stream you wish to ban the displayName from. Defaults to your channel
	 * @returns {Promise} - Was the displayName successfully banned from linoUsername's stream?
	 */
	async ban(displayName, linoUsername = this.linoUsername) {
		if (displayName === null) throw new Error('ban: Please supply a DisplayName to mute.');
		if (!linoUsername) linoUsername = await this.getLinoUsername(this.displayName);
		displayName = await this.getLinoUsername(displayName);
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.BanStreamChatUser(displayName, linoUsername)).then(res => {
				res.data.streamchatUserBan.err === null ? resolve(true) : reject(res.data.streamchatUserBan.err);
			});
		});
	}

	/**
	 * @param {Number} first - Amount of entries to return
	 * @param {String} text - search term, defaults to blank (returns all)
	 * @returns {Promise} - Returns categories matching the {text} criteria
	 */
	browsePageSearchCategory(first, text = '') {
		if (first === null) throw new Error('browsePageSearchCategory: Please supply a `first` starting count.');

		const data = JSON.stringify({
			operationName: 'BrowsePageSearchCategory',
			query: 'query BrowsePageSearchCategory($text:String!,$first:Int,$after:String){search(text:$text){trendingCategories(first:$first,after:$after){...HomeCategoriesFrag __typename}__typename}}fragment HomeCategoriesFrag on CategoryConnection{pageInfo{endCursor hasNextPage __typename}list{...VCategoryCardFrag __typename}__typename}fragment VCategoryCardFrag on Category{id backendID title imgUrl watchingCount __typename}',
			variables: { first, text }
		});

		return new Promise((resolve, reject) => {
			request(this.authKey, data).then(res => {
				res.errors === undefined ? resolve(res.data.search.trendingCategories) : reject(res.errors);
			});
		});
	}

	/**
	 * @param {String} id - ID of the message you wish to delete
	 * @param {String} linoUsername - Lino Username of the channel from which to delete the message. Defaults to your channel
	 * @returns {Promise} - Was the message deleted succesfully?
	 */
	async deleteChat(id, linoUsername = this.linoUsername) {
		if (id === null) throw new Error('deleteChat: Please provide an ID of the message you wish to delete');
		if (!linoUsername) linoUsername = await this.getLinoUsername(this.displayName);

		return new Promise((resolve, reject) => {
			request(this.authKey, queries.deleteChat(id, linoUsername)).then(res => {
				res.data.chatDelete.err === null ? resolve(true) : reject(res.data.chatDelete.err);
			});
		});
	}

	/**
	 * @param {String} permLink - String ID of the stream/video you wish to donate to.
	 * @param {string} type - String representation of the giftto send, default: LEMON, options: LEMON, ICE_CREAM, DIAMOND, NINJAGHINI, NINJET
	 * @param {Number} count - the amount of 'type' to send.
	 * @returns {Promise} - Was the donation sent succesfully?
	 */
	donate(permLink, type = 'LEMON', count = 1) {
		if (!permLink) throw new Error('donate: permLink is required.');

		return new Promise((resolve, reject) => {
			request(this.authKey, queries.StreamDonate(permLink, type, count)).then(res => {
				res.data.donate.err === null ? resolve(true) : reject(res.data.donate.err);
			});
		});
	}

	/**
	 * @param {String} emoteStr - String ID of the emote to ban
	 * @param {String} linoUsername - Lino Username of the channel from which to ban the emote. Defaults to your channel
	 * @returns {Promise} - Was the emote banned succesfully?
	 */
	async emoteBan(emoteStr, linoUsername) {
		if (emoteStr === null) throw new Error('emoteBanInit: Please provide an EmojiStr you wish to ban.');
		if (!linoUsername) linoUsername = await this.getLinoUsername(this.displayName);

		return new Promise((resolve, reject) => {
			request(this.authKey, queries.emoteBan(emoteStr, linoUsername)).then(res => {
				res.data.emoteBan.err === null ? resolve(true) : reject(res.data.emoteBan.err);
			});
		});
	}

	/**
	 * @param {String} name - Emote ID to delete
	 * @param {String} level - Level from which to delete the emote
	 * @param {String} type - Type of emote to delete. Defaults to 'EMOTE'
	 * @returns {Promise} - Was the emote deleted succesfully?
	 */
	emoteDelete(name, level, type = 'EMOTE') {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.emoteDelete(name, level, type)).then(res => {
				res.data.deleteEmote.err === null ? resolve(true) : reject(res.data.deleteEmote.err);
			});
		});
	}

	/**
	 * @param {String} name - Emote ID to save
	 * @param {String} level - Level in which to save the emote
	 * @param {String} type - Type of emote to save. Defaults to 'EMOTE'
	 * @returns {Promise} - Was the emote saved succesfully?
	 */
	emoteSave(name, level, type) {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.emoteSave(name, level, type)).then(res => {
				res.data.saveEmote.err === null ? resolve(true) : reject(res.data.saveEmote.err);
			});
		});
	}

	/**
	 * @param {String} displayName - Dlive username of the user you wish to follow
	 * @returns {Promise} - Was the user succesfully followed?
	 */
	followUser(displayName) {
		if (displayName === null) throw new Error('Please specify the user you wish to follow');

		return new Promise((resolve, reject) => {
			request(this.authKey, queries.followUser(displayName)).then(res => {
				res.data.deleteEmote.err === null ? resolve(true) : reject(res.data.deleteEmote.err);
			});
		});

	}

	/**
	 * @param {String} item - Name of the item you wish to generate a token for
	 * @returns {Promise} - Returns a coinbase token
	 */
	getCoinbaseToken(item = 'C88LINOPOINTS') {
		if (item === null) throw new Error('getCoinbaseToken: Please specify which item you intend to recieve a token for.');

		return new Promise((resolve, reject) => {
			request(this.authKey, queries.CoinbaseToken(item)).then(res => {
				res.data.coinbaseToken.err === null ? resolve(res.data.coinbaseToken.token) : reject(res.data.coinbaseToken.err);
			});
		});
	}

	/**
	 * @param {Number} first - Amount of entries to return
	 * @returns {Promise} - Returns livestreams from your following page
	 */
	getFollowingPageLivestreams(first = 20) {
		return new Promise(resolve => {
			request(this.authKey, queries.FollowingPageLivestreams(first)).then(res => {
				resolve(res.data.livestreamsFollowing);
			});
		});
	}

	/**
	 * @returns {Promise} - Returns global information including languages
	 */
	getGlobalInformation() {
		return new Promise(resolve => {
			request(this.authKey, queries.GlobalInformation()).then(res => {
				resolve(res.data.globalInfo);
			});
		});
	}

	/**
	 * @returns {Promise} - Returns home page leaderboard array
	 */
	getHomePageLeaderboard() {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.HomePageLeaderboard()).then(res => {
				res.data.leaderboard.err ? reject(res.data.leaderboard.err) : resolve(res.data.leaderboard.list);
			});
		});
	}

	/**
	 * @param {String} categoryID - ID of the category to filter by. Defaults to null (none)
	 * @param {Number} first - Amount of results to return, defaults to 20
	 * @param {String} languageID - ID of the language to filter by. Default to null (none)
	 * @param {Boolean} showNSFW - Show NSFW results? Defaults to false.
	 * @param {String} userLanguageCode - Language code of the language to return, defaults to 'en'
	 * @returns {Promise} - Object containing list of livestreams
	 */
	getHomePageLivestream(categoryID = null, first = 20, languageID = null, showNSFW = false, userLanguageCode = 'en') {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.HomePageLivestream(categoryID, first, languageID, showNSFW, userLanguageCode)).then(res => {
				res.data.livestreams.err ? reject(res.data.livestreams.err) : resolve(res.data.livestreams);
			});
		});
	}

	/**
	 * @param {String} displayName - Dlive username of the user you wish to find the Lino Username of
	 * @returns {Promise} - Lino username of the given displayName
	 */
	getLinoUsername(displayName = this.displayName) {
		return this.getLivestreamPage(displayName).then(res => res.username).catch(err => err);
	}

	/**
	 * @returns {Promise} - Returns Display Name of the authKey.
	 */
	getMeDisplayName() {
		return this.getMeGlobal().then(res => res.me.displayname).catch(err => err);
	}

	/**
	 * @param {String} displayName - Dlive username to get the livestream page data of
	 * @returns {Promise} - Livestream page data of the given displayName
	 */
	async getLivestreamPage(displayName = this.displayName) {
		if (!displayName) displayName = await this.getMeDisplayName();
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.LivestreamPage(displayName)).then(res => {
				res.data.userByDisplayName.err === undefined ? resolve(res.data.userByDisplayName) : reject(res.data.userByDisplayName.err);
			});
		});
	}

	/**
	 * @param {String} displayName - Dlive username to return the followers of
	 * @param {Number} first - Number of results to return
	 * @param {string} sortedBy - Sort method, default: AZ
	 * @returns {Promise} - list of followers
	 */
	async getLivestreamProfileFollowers(displayName = this.displayName, first = 20, sortedBy = 'AZ') {
		if (!displayName) displayName = await this.getMeDisplayName();
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.LivestreamProfileFollowers(displayName, first, sortedBy)).then(res => {
				res.errors === undefined ? resolve(res.data.userByDisplayName.followers) : reject(res.errors);
			});
		});
	}

	/**
	 * @param {String} displayName - Dlive username to return the following of
	 * @param {Number} first - Number of results to return. Default: 20
	 * @param {string} sortedBy - Sort method, default: AZ
	 * @returns {Promise} - List of users who are following displayName
	 */
	async getLivestreamProfileFollowing(displayName = this.displayName, first = 20, sortedBy = 'AZ') {
		if (!displayName) displayName = await this.getMeDisplayName();
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.LivestreamProfileFollowing(displayName, first, sortedBy)).then(res => {
				res.errors === undefined ? resolve(res.data.userByDisplayName.following) : reject(res.errors);
			});
		});
	}

	/**
	 * @param {String} displayName - Dlive username to return the replays of. Defaults to your channel
	 * @returns {Promise} - List of displayNames replays
	 */
	async getLivestreamProfileReplay(displayName = this.displayName) {
		if (!displayName) displayName = await this.getMeDisplayName();
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.LivestreamProfileReplay(displayName)).then(res => {
				res.errors === undefined ? resolve(res.data.userByDisplayName.pastBroadcasts) : reject(res.errors);
			});
		});
	}

	/**
	 * @param {String} displayName - Dlive username to return the videos of. Defaults to your channel
	 * @param {Number} first - Amount of videos to return, defaults to 20
	 * @param {String} sortedBy - What to sort the videos by. Defaults to 'Trending'
	 * @returns {Promise} - List of displayNames videos
	 */
	async getLivestreamProfileVideo(displayName = this.displayName, first = 20, sortedBy = 'Trending') {
		if (!displayName) displayName = await this.getMeDisplayName();
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.LivestreamProfileVideo(displayName, first, sortedBy)).then(res => {
				res.errors === undefined ? resolve(res.data.userByDisplayName.videos) : reject(res.errors);
			});
		});
	}

	/**
	 * @param {String} displayName - Dlive username to check the chest of
	 * @returns {Promise} - Chest winners list
	 */
	async getLivestreamTreasureChestWinners(displayName = this.displayName) {
		if (!displayName) displayName = await this.getMeDisplayName();
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.LivestreamTreasureChestWinners(displayName)).then(res => {
				res.errors === undefined ? resolve(res.data.userByDisplayName.treasureChest) : reject(res.errors);
			});
		});
	}

	/**
	 * @returns {Promise} - Returns your wallets balance
	 */
	getMeBalance() {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.MeBalance()).then(res => {
				res.errors === undefined ? resolve(res.data.me.wallet.balance) : reject(res.errors);
			});
		});
	}

	/**
	 * @returns {Promise} - Returns your dashboard information
	 */
	getMeDashboard() {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.MeDashboard()).then(res => {
				res.errors === undefined ? resolve(res.data) : reject(res.errors);
			});
		});
	}

	/**
	 * @returns {Promise} - Returns your global data
	 */
	getMeGlobal() {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.MeGlobal()).then(res => {
				res.errors === undefined ? resolve(res.data) : reject(res.errors);
			});
		});
	}

	/**
	 * @returns {Promise} - Returns your livestream data
	 */
	getMeLivestream() {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.MeLivestream()).then(res => {
				res.errors === undefined ? resolve(res.data.me) : reject(res.errors);
			});
		});
	}

	/**
	 * @param {Boolean} isNotGlobalPartner - Are you a global partner? Defaults to false
	 * @returns {Promise} Returns your partner progress data
	 */
	getMePartnerProgress(isNotGlobalPartner = true) {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.MePartnerProgress(isNotGlobalPartner)).then(res => {
				res.errors === undefined ? resolve(res.data.me) : reject(res.errors);
			});
		});
	}

	/**
	 * @param {Number} first - Amount of followers to return in the follow feed
	 * @returns {Promise} - Your Sidebar data
	 */
	getMeSidebar(first = 1) {
		return new Promise(resolve => {
			request(this.authKey, queries.MeSidebar(first)).then(res => {
				resolve(res.data.me);
			});
		});
	}

	/**
	 * @param {Number} first - Amount of people you're subscrihbe to to return
	 * @returns {Promise} - Returns a list of users you're subscribed to
	 */
	getMeSubscribing(first = 20) {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.MeSubscribing(first)).then(res => {
				res.errors === undefined ? resolve(res.data.me.private.subscribing) : reject(res.errors);
			});
		});
	}

	/**
	 * @returns {Promise} - Returns LINO prices
	 */
	getPaybrosPrices() {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.PaybrosPrices()).then(res => {
				res.errors === undefined ? resolve(res.data.globalInfo.paybrosPrices) : reject(res.errors);
			});
		});
	}

	/**
	 * @param {String} displayName - displayName of the stream from which to receive moderators.
	 * @param {Number} first - amount of moderators to return, default: 20
	 * @param {String} search - String to search moderator names for, default: ''
	 * @returns {Promise} - Returns array of chat moderators
	 */
	async getStreamModerators(displayName = this.displayName, first = 20, search = '') {
		if (!displayName) displayName = await this.getMeDisplayName();
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.StreamChatModerators(displayName, first, search)).then(res => {
				res.errors === undefined ? resolve(res.data.userByDisplayName.chatModerators) : reject(res.errors);
			});
		});
	}

	/**
	 * @param {String} displayName - Dlive username to return top contributors of
	 * @param {Number} first - Amount of top contributors to return. Defaults to 3
	 * @param {String} rule - Rule of contributors to return. Defaults to 'ALL_TIME'
	 * @returns {Promise} - List of top contributors
	 */
	async getTopContributors(displayName = this.displayName, first = 3, rule = 'ALL_TIME') {
		if (!displayName) displayName = await this.getMeDisplayName();
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.TopContributors(displayName, first, rule)).then(res => {
				res.errors === undefined ? resolve(res.data.userByDisplayName.topContributions) : reject(res.errors);
			});
		});
	}

	/**
	 * @param {String} item - Item to get a Xsolla token for
	 * @param {String} language - Language to return details of the token in. Default to 'null' (English)
	 * @returns {Promise} - Returns an Xsolla token
	 */
	getXsollaToken(item = 'X88LINOPOINTS', language = null) {
		if (item === null) throw new Error('getXsollaToken: Please specify which item you intend to recieve a token for.');

		return new Promise((resolve, reject) => {
			request(this.authKey, queries.xsollaToken(item, language)).then(res => {
				res.data.xsollaToken.err === null ? resolve(res.data.xsollaToken.token) : reject(res.data.xsollaToken.err);
			});
		});
	}

	/**
	 * @param {String} linoUsername - LINO username of the user to demote
	 * @returns {Promise} - Was the moderator role removed succesfully?
	 */
	removeModerator(linoUsername) {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.removeModerator(linoUsername)).then(res => {
				res.errors === undefined ? resolve(true) : reject(res.errors);
			});
		});
	}

	/**
	 * @param {String} message - Message to send
	 * @param {String} linoUsername - username of the channel in which to send the message. Defaults to your channel
	 * @returns {Promise} Returns ID of sent message
	 */
	async sendMessage(message, linoUsername = this.linoUsername) {
		if (message === null) throw new Error('sendMessage: Message cannot be null');
		if (!linoUsername) linoUsername = await this.getLinoUsername(this.displayName);

		return new Promise((resolve, reject) => {
			request(this.authKey, queries.SendStreamChatMessage(linoUsername, message)).then(res => {
				res.data.sendStreamchatMessage.err ? reject(res.data.sendStreamchatMessage.err) : resolve(res.data.sendStreamchatMessage.message.id);
			});
		});

	}

	/**
	 * @param {Boolean} NoAllEmote - Disable usage of all emotes? Overrides NoGlobalEmote and NoMineEmote
	 * @param {Boolean} NoGlobalEmote - Disable usage of global emotes?
	 * @param {Boolean} NoMineEmote - Disable usage of your channels emotes?
	 * @returns {Promise} - Was the Emote mode updated?
	 */
	setChatEmoteMode(NoAllEmote = true, NoGlobalEmote = false, NoMineEmote = false) {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.chatEmoteModeSet(NoAllEmote, NoGlobalEmote, NoMineEmote)).then(res => {
				res.data.emoteModeSet.err ? reject(res.data.emoteModeSet.err) : resolve(true);
			});
		});
	}

	/**
	 * @param {Number} seconds - Seconds to change chat interval to. Defaults to '2'
	 * @returns {Promise} - Was the chat interval changed?
	 */
	setChatInterval(seconds = 2) {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.SetChatInterval(seconds)).then(res => {
				res.data.chatIntervalSet.err ? reject(res.data.chatIntervalSet.err) : resolve(true);
			});
		});
	}

	/**
	 * @param {String} linoUsername - LINO username of the user you wish to promote
	 * @returns {Promise} - Was the moderator role added successfully?
	 */
	setModerator(linoUsername) {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.AddModerator(linoUsername)).then(res => {
				res.data.moderatorAdd.err ? reject(res.data.moderatorAdd.err) : resolve(true);
			});
		});
	}

	/**
	 * @param {String} displayName - Display name to start the class with
	 * @param {string} authKey - Your authentication key
	 * @returns {client} - New Dlive class instance
	 */
	async start(displayName, authKey) {
		const _this = this;
		_this.authKey = authKey;
		if (displayName === null) displayName = await this.getMeDisplayName();
		_this.displayName = displayName;
		_this.linoUsername = await this.getLinoUsername(_this.displayName);

		_this.client = new WebSocket('wss://graphigostream.prd.dlive.tv', [ 'graphql-ws' ]);
		_this.client.on('open', () => {
			_this.client.send('{"type": "connection_init"}');
			_this.client.send(queries.StreamMessageSubscription(_this.linoUsername));

			_this.client.on('message', msg => {
				msg = JSON.parse(msg);
				if (msg && msg.type === 'data') {
					if (msg.payload !== undefined) {
						const [ res ] = msg.payload.data.streamMessageReceived;
						if (typeof res !== 'undefined') _this.emit(res.__typename, res);
					}
				}
			});

			_this.client.on('close', () => {
				throw new Error('Disconnected');
			});
		});
	}

	/**
	 * @param {String} displayName - Dlive username to remove the moderator role of
	 * @param {String} linoUsername - LINO username of the streamer in which to unban the chat user
	 * @returns {Promise} - Was the user unbanned?
	 */
	async unbanUser(displayName, linoUsername = this.linoUsername) {
		if (!linoUsername) linoUsername = await this.getLinoUsername(this.displayName);
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.UnbanStreamChatUser(displayName, linoUsername)).then(res => {
				res.data.streamchatUserBan.err ? reject(res.data.streamchatUserBan.err) : resolve(true);
			});
		});
	}

	/**
	 * @param {String} displayName - Dlive username to remove the moderator role of
	 * @returns {Promise} - Was the user unfollowed?
	 */
	unfollowUser(displayName) {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.UnfollowUser(displayName)).then(res => {
				res.data.unfollow.err ? reject(res.data.unfollow.err) : resolve(true);
			});
		});
	}
};
