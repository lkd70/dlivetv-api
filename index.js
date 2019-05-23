'use strict';

const EventEmitter = require('events');
const axios = require('axios');
const { client } = require('websocket');

const queries = {
	AddModerator: displayName => `{"operationName":"AddModerator","query":"mutation AddModerator($username:String!){moderatorAdd(username:$username){err{code __typename}__typename}}","variables":{"username":"${displayName}"}}`,
	BanStreamChatUser: (username, streamer) => `{"operationName":"BanStreamChatUser","variables":{"streamer":"${streamer}","username":"${username}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"4eaeb20cba25dddc95df6f2acf8018b09a4a699cde468d1e8075d99bb00bacc4"}}}`,
	BrowsePageSearchCategory: (first, text) => `{"operationName":"BrowsePageSearchCategory","query":"query BrowsePageSearchCategory($text:String!,$first:Int,$after:String){search(text:$text){trendingCategories(first:$first,after:$after){...HomeCategoriesFrag __typename}__typename}}fragment HomeCategoriesFrag on CategoryConnection{pageInfo{endCursor hasNextPage __typename}list{...VCategoryCardFrag __typename}__typename}fragment VCategoryCardFrag on Category{id backendID title imgUrl watchingCount __typename}","variables":{"first":"${first}","text":"${text}"}}`,
	CoinbaseToken: item => `{"operationName":"CoinbaseToken","query":"mutation CoinbaseToken($item:CoinbaseItemType!){coinbaseToken(item:$item){token err{code message __typename}__typename}}","variables":{"item":"${item}"}}`,
	CreateXsollaToken: (item, language) => `{"operationName":"CreateXsollaToken","query":"mutation CreateXsollaToken($language:String,$item:XsollaItemType!){xsollaToken(language:$language,item:$item){token err{code __typename}__typename}}","variables":{"item":"${item}","language":"${language}"}}`,
	DeleteChat: (linoUsername, id) => `{"operationName":"DeleteChat","query":"mutation DeleteChat($streamer:String!,$id:String!){chatDelete(streamer:$streamer,id:$id){err{code message __typename}__typename}}","variables":{"streamer":"${linoUsername}","id":"${id}"}}`,
	EmoteBan: (linoUsername, emoteStr) => `{"operationName":"EmoteBan","query":"mutation EmoteBan($emoteStr:String!,$streamer:String!){emoteBan(emoteStr:$emoteStr,streamer:$streamer){err{code message __typename}__typename}}","variables":{"streamer":"${linoUsername}","emoteStr":"${emoteStr}"}}`,
	EmoteDelete: (name, level, type) => `{"operationName":"EmoteDelete","query":"mutation EmoteDelete($input:DeleteEmoteInput!){deleteEmote(input:$input){err{code message __typename}__typename}}","variables":{"input":{"name":"${name}","level":"${level}","type":"${type}"}}}`,
	EmoteSave: (name, level, type) => `{"operationName":"EmoteSave","query":"mutation EmoteSave($input:SaveEmoteInput!){saveEmote(input:$input){emote{name username sourceURL mimeType level type __typename}err{code message __typename}__typename}}","variables":{"input":{"name":"${name}","level":"${level}","myLevel":"${level}","type":"${type}"}}}`,
	FollowUser: displayName => `{"operationName":"FollowUser","query":"mutation FollowUser($streamer:String!){follow(streamer:$streamer){err{code message __typename}__typename}}","variables":{"streamer":"${displayName}"}}`,
	FollowingPageLivestreams: first => `{"operationName":"FollowingPageLivestreams","variables":{"first":"${first}"},"query":"query FollowingPageLivestreams($first:Int,$after:String){livestreamsFollowing(first:$first,after:$after){...FollowingLivestreamsFrag __typename}}fragment FollowingLivestreamsFrag on LivestreamConnection{pageInfo{endCursor hasNextPage __typename}list{...VLivestreamSnapFrag __typename}__typename}fragment VLivestreamSnapFrag on Livestream{id creator{username displayname ...VDliveAvatarFrag ...VDliveNameFrag __typename}title totalReward watchingCount thumbnailUrl lastUpdatedAt __typename}fragment VDliveAvatarFrag on User{avatar __typename}fragment VDliveNameFrag on User{displayname partnerStatus __typename}"}`,
	GlobalInformation: () => '{"operationName":"GlobalInformation","variables":{},"query":"query GlobalInformation{globalInfo{languages{id backendID language code __typename}__typename}}"}',
	LivestreamPage: displayName => `{"operationName":"LivestreamPage","query":"query LivestreamPage($displayname:String!,$add:Boolean!,$isLoggedIn:Boolean!){userByDisplayName(displayname:$displayname){id ...VDliveAvatarFrag ...VDliveNameFrag ...VFollowFrag ...VSubscriptionFrag banStatus about avatar myRoomRole @include(if:$isLoggedIn)isMe @include(if:$isLoggedIn)isSubscribing @include(if:$isLoggedIn)livestream{id permlink watchTime(add:$add)...LivestreamInfoFrag ...VVideoPlayerFrag __typename}hostingLivestream{id creator{...VDliveAvatarFrag displayname username __typename}...VVideoPlayerFrag __typename}...LivestreamProfileFrag __typename}}fragment LivestreamInfoFrag on Livestream{category{title imgUrl id backendID __typename}title watchingCount totalReward ...VDonationGiftFrag ...VPostInfoShareFrag __typename}fragment VDonationGiftFrag on Post{permlink creator{username __typename}__typename}fragment VPostInfoShareFrag on Post{permlink title content category{id backendID title __typename}__typename}fragment VDliveAvatarFrag on User{avatar __typename}fragment VDliveNameFrag on User{displayname partnerStatus __typename}fragment LivestreamProfileFrag on User{isMe @include(if:$isLoggedIn)canSubscribe private @include(if:$isLoggedIn){subscribers{totalCount __typename}__typename}videos{totalCount __typename}pastBroadcasts{totalCount __typename}followers{totalCount __typename}following{totalCount __typename}...ProfileAboutFrag __typename}fragment ProfileAboutFrag on User{id about __typename}fragment VVideoPlayerFrag on Livestream{disableAlert category{id title __typename}language{language __typename}__typename}fragment VFollowFrag on User{id username displayname isFollowing @include(if:$isLoggedIn)isMe @include(if:$isLoggedIn)followers{totalCount __typename}__typename}fragment VSubscriptionFrag on User{id username displayname isSubscribing @include(if:$isLoggedIn)canSubscribe isMe @include(if:$isLoggedIn)__typename}","variables":{"displayname":"${displayName}","add":false,"isLoggedIn":true}}`,
	LivestreamProfileFollowers: (displayName, first, sortedBy) => `{"operationName":"LivestreamProfileFollowers","variables":{"displayname":"${displayName}","first":"${first}","isLoggedIn":true,"sortedBy":"${sortedBy}"},"query":"query LivestreamProfileFollowers($displayname:String!,$sortedBy:RelationSortOrder,$first:Int,$after:String,$isLoggedIn:Boolean!){userByDisplayName(displayname:$displayname){id displayname followers(sortedBy:$sortedBy,first:$first,after:$after){pageInfo{endCursor hasNextPage __typename}list{...VDliveAvatarFrag ...VDliveNameFrag ...VFollowFrag __typename}__typename}__typename}}fragment VDliveAvatarFrag on User{avatar __typename}fragment VDliveNameFrag on User{displayname partnerStatus __typename}fragment VFollowFrag on User{id username displayname isFollowing @include(if:$isLoggedIn)isMe @include(if:$isLoggedIn)followers{totalCount __typename}__typename}"}`,
	LivestreamProfileFollowing: (displayName, first, sortedBy) => `{"operationName":"LivestreamProfileFollowing","variables":{"displayname":"${displayName}","first":"${first}","isLoggedIn":true,"sortedBy":"${sortedBy}"},"query":"query LivestreamProfileFollowing($displayname:String!,$sortedBy:RelationSortOrder,$first:Int,$after:String,$isLoggedIn:Boolean!){userByDisplayName(displayname:$displayname){id displayname following(sortedBy:$sortedBy,first:$first,after:$after){pageInfo{endCursor hasNextPage __typename}list{...VDliveAvatarFrag ...VDliveNameFrag ...VFollowFrag __typename}__typename}__typename}}fragment VDliveAvatarFrag on User{avatar __typename}fragment VDliveNameFrag on User{displayname partnerStatus __typename}fragment VFollowFrag on User{id username displayname isFollowing @include(if:$isLoggedIn)isMe @include(if:$isLoggedIn)followers{totalCount __typename}__typename}"}`,
	LivestreamProfileReplay: displayName => `{"operationName":"LivestreamProfileReplay","variables":{"displayname":"${displayName}"},"query":"query LivestreamProfileReplay($displayname:String!,$first:Int,$after:String){userByDisplayName(displayname:$displayname){id pastBroadcasts(first:$first,after:$after){pageInfo{endCursor hasNextPage __typename}list{...ProfileReplaySnapFrag __typename}__typename}username __typename}}fragment ProfileReplaySnapFrag on PastBroadcast{permlink thumbnailUrl title totalReward createdAt viewCount playbackUrl creator{displayname __typename}resolution{resolution url __typename}__typename}"}`,
	LivestreamProfileVideo: (displayName, sortedBy, first) => `{"operationName":"LivestreamProfileVideo","variables":{"displayname":"${displayName}","sortedBy":"${sortedBy}","first":"${first}"},"query":"query LivestreamProfileVideo($displayname:String!,$sortedBy:VideoSortOrder,$first:Int,$after:String){userByDisplayName(displayname:$displayname){id videos(sortedBy:$sortedBy,first:$first,after:$after){pageInfo{endCursor hasNextPage __typename}list{...ProfileVideoSnapFrag __typename}__typename}username __typename}}fragment ProfileVideoSnapFrag on Video{permlink thumbnailUrl titletotalReward createdAt viewCount length creator{displayname __typename}__typename}"}`,
	LivestreamTreasureChestWinners: displayName => `{"operationName":"LivestreamTreasureChestWinners","variables":{"displayname":"${displayName}","isLoggedIn":true},"query":"query LivestreamTreasureChestWinners($displayname: String!,$isLoggedIn: Boolean!){userByDisplayName(displayname:$displayname){id ...TreasureChestWinnersFrag __typename}}fragment TreasureChestWinnersFrag on User{id username isMe @include(if:$isLoggedIn)treasureChest{lastGiveawayWin @include(if:$isLoggedIn)lastGiveawayWinners{value user{...VDliveAvatarFrag displayname __typename}__typename}__typename}__typename}fragment VDliveAvatarFrag on User{avatar __typename}"}`,
	MeBalance: () => '{"operationName":"MeBalance","variables":{},"query":"query MeBalance {me {...MeBalanceFrag __typename}} fragment MeBalanceFrag on User {id\twallet {balance __typename} __typename}"}',
	MeDashboard: () => '{"operationName":"MeDashboard","variables":{"isLoggedIn":true},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"620eb5c12e57ff0e3fea83915e796c6fb8fd26aec928c5fffcdd6154f77b374a"}}}',
	MeGlobal: () => '{"operationName":"MeGlobal","variables":{},"query":"query MeGlobal{me{...MeGlobalFrag __typename}}fragment MeGlobalFrag on User{id username ...VDliveAvatarFrag displayname partnerStatus role private{accessToken insecure email phone nextDisplayNameChangeTime language showSubSettingTab __typename}...SettingsSubscribeFrag __typename}fragment VDliveAvatarFrag on User{avatar __typename}fragment SettingsSubscribeFrag on User{id subSetting{badgeColor badgeText textColor __typename}__typename}"}',
	MeLivestream: () => '{"operationName":"MeLivestream","variables":{"isLoggedIn":true},"query":"query MeLivestream($isLoggedIn:Boolean!){me{...MeLivestreamFrag __typename}}fragment MeLivestreamFrag on User{id ...MeLivestreamChatroomFrag __typename}fragment MeLivestreamChatroomFrag on User{id username role ...MeEmoteFrag __typename}fragment MeEmoteFrag on User{id role @include(if:$isLoggedIn)emote{...EmoteMineFrag ...EmoteChannelFrag __typename}__typename}fragment EmoteMineFrag on AllEmotes{mine{list{name username sourceURL mimeType level type __typename}__typename}__typename}fragment EmoteChannelFrag on AllEmotes{channel{list{name username sourceURL mimeType level type __typename}__typename}__typename}"}',
	MePartnerProgress: isNotGlobalPartner => `{"operationName":"MePartnerProgress","variables":{"isNotGlobalPartner":"${isNotGlobalPartner}"},"query":"query MePartnerProgress{me{...MePartnerProgressFrag __typename}} fragment MePartnerProgressFrag on User{id followers{totalCount __typename}private{previousStats{partnerStats{streamingHours streamingDays donationReceived __typename}contentBonus __typename}partnerProgress{partnerStatus current{followerCount streamingHours streamingDays donationReceived lockPoint __typename}target{followerCount streamingHours streamingDays donationReceived lockPoint __typename}eligible __typename}__typename}__typename}"}`,
	MeSidebar: first => `{"operationName":"MeSidebar","variables":{"folowingFirst":"${first}"},"query":"query MeSidebar($folowingFirst:Int!){me{...MeSidebarFrag __typename}}fragment MeSidebarFrag on User{id username displayname wallet{balance __typename}private{followeeFeed(first:$folowingFirst){list{...VDliveAvatarFrag ...VDliveNameFrag livestream{id category{id title __typename}__typename}__typename}__typename}__typename}__typename}fragment VDliveAvatarFrag on User{avatar __typename}fragment VDliveNameFrag on User{displayname partnerStatus __typename}"}`,
	MeSubscribing: first => `{"operationName":"MeSubscribing","variables":{"first":"${first}"},"query":"query MeSubscribing($first:Int!,$after:String){me{...MeSubscribingFrag __typename}}fragment MeSubscribingFrag on User{id private{subscribing(first:$first,after:$after){totalCount pageInfo{startCursor endCursor hasNextPage hasPreviousPage __typename}list{streamer{username displayname avatar partnerStatus __typename}tier status lastBilledDate subscribedAt month __typename}__typename}__typename}__typename}"}`,
	PaybrosPrices: () => '{"operationName":"PaybrosPrices","variables":{},"query":"query PaybrosPrices{globalInfo{paybrosPrices{price88Points price288Points price688Points price1188Points price2888Points price7888Points price78888Points __typename}__typename}}"}',
	PaymentAddEmail: email => `{"operationName":"PaymentAddEmail","variables":{"email":"${email}"},"query":"mutation PaymentAddEmail($email:String!){paymentEmailAdd(email:$email){err{code message __typename}__typename}}"}`,
	RemoveModerator: (displayName) => `{"operationName":"RemoveModerator","variables":{"username":"${displayName}"},"query":"mutation RemoveModerator($username:String!){moderatorRemove(username:$username){err{code message __typename}__typename}}"}`,
	SendStreamChatMessage: (linoUsername, message) => `{"operationName":"SendStreamChatMessage","variables":{"input":{"streamer":"${linoUsername}","message":"${message}","roomRole":"Moderator","subscribing":true}},"query":"mutation SendStreamChatMessage($input:SendStreamchatMessageInput!){sendStreamchatMessage(input:$input){err{code __typename}message{type ... on ChatText{id content ...VStreamChatSenderInfoFrag __typename}__typename}__typename}}fragment VStreamChatSenderInfoFrag on SenderInfo{subscribing role roomRole sender{id username displayname avatar partnerStatus __typename}__typename}"}`,
	SetChatInterval: seconds => `{"operationName":"SetChatInterval","query":"mutation SetChatInterval($seconds:Int!){chatIntervalSet(seconds:$seconds){err{code __typename}__typename}}","variables":{"seconds":"${seconds}"}}`,
	StreamChatModerators: (displayName, first, search) => `{"operationName":"StreamChatModerators","variables":{"displayname":"${displayName}","first":${first},"search":"${search}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"f9f495fec83d29d67b016c44d162869bff207f1dc53ba7436116743c4a1387be"}}}`,
	StreamDonate: (permLink, type, count) => `{"operationName":"StreamDonate","variables":{"input":{"permlink":"${permLink}","type":"${type}","count":${count}}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"42dbd0f6f50503b37cd48e4cc76aa7d0bb9f6c3f3dea48567951e856b4d93788"}}}`,
	StreamMessageSubscription: linoUsername => `{"type":"start","payload":{"variables":{"streamer":"${linoUsername}"},"operationName":"StreamMessageSubscription","query":"subscription StreamMessageSubscription($streamer:String!){streamMessageReceived(streamer:$streamer){type ... on ChatGift{id gift amount recentCount expireDuration ...VStreamChatSenderInfoFrag}... on ChatHost{id viewer...VStreamChatSenderInfoFrag}... on ChatSubscription{id month...VStreamChatSenderInfoFrag}... on ChatChangeMode{mode}... on ChatText{id content ...VStreamChatSenderInfoFrag}... on ChatFollow{id ...VStreamChatSenderInfoFrag}... on ChatDelete{ids}... on ChatBan{id ...VStreamChatSenderInfoFrag}... on ChatModerator{id ...VStreamChatSenderInfoFrag add}... on ChatEmoteAdd{id ...VStreamChatSenderInfoFrag emote}}}fragment VStreamChatSenderInfoFrag on SenderInfo{subscribing role roomRole sender{id username displayname avatar partnerStatus}}"}}`,
	TopContributors: (displayName, first, rule) => `{"operationName":"TopContributors","variables":{"displayname":"${displayName}","first":"${first}","rule":"${rule}","queryStream":false},"query":"query TopContributors($displayname:String!,$rule:ContributionSummaryRule,$first:Int,$after:String,$queryStream:Boolean!){userByDisplayName(displayname:$displayname){id ...TopContributorsOfStreamerFrag @skip(if:$queryStream)livestream @include(if:$queryStream){...TopContributorsOfLivestreamFrag __typename}__typename}}fragment TopContributorsOfStreamerFrag on User{id topContributions(rule:$rule,first:$first,after:$after){pageInfo{endCursor hasNextPage __typename}list{amount contributor{id ...VDliveNameFrag ...VDliveAvatarFrag __typename}__typename}__typename}__typename}fragment VDliveNameFrag on User{displayname partnerStatus __typename}fragment VDliveAvatarFrag on User{avatar __typename}fragment TopContributorsOfLivestreamFrag on Livestream{id topContributions(first:$first,after:$after){pageInfo{endCursor hasNextPage __typename}list{amount contributor{id ...VDliveNameFrag ...VDliveAvatarFrag __typename}__typename}__typename}__typename}"}`,
	UnbanStreamChatUser: (displayName, linoUsername) => `{"operationName":"UnbanStreamChatUser","query":"mutation UnbanStreamChatUser($streamer:String!,$username:String!){streamchatUserUnban(streamer:$streamer,username:$username){err{code message __typename}__typename}}","variables":{"streamer":"${linoUsername}","username":"${displayName}"}}`,
	UnfollowUser: displayName => `{"operationName":"UnfollowUser","query":"mutation UnfollowUser($streamer:String!){unfollow(streamer:$streamer){err{code message __typename}__typename}}","variables":{"streamer":"${displayName}"}}`,
	chatEmoteModeSet: (NoAllEmote, NoGlobalEmote, NoMineEmote) => `{"operationName":"chatEmoteModeSet","query":"mutation chatEmoteModeSet($emoteMode:SetEmoteModeInput!){emoteModeSet(emoteMode:$emoteMode){err{code message __typename}__typename}}","variables":{"emoteMode":{"NoAllEmote":"${NoAllEmote}","NoGlobalEmote":"${NoGlobalEmote}","NoMineEmote":"${NoMineEmote}"}}}`,
};

/**
 * POST request to Dlive
 * @param {string} authorization - Your authentication key
 * @param {string} data - stringified JSON POST data
 * @returns {object} - Axios response object
 */
const request = (authorization, data) => axios({
	url: 'https://graphigo.prd.dlive.tv:443',
	method: 'post',
	headers: { authorization },
	data
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
	 * @param {string} email - The Email address you wish to add
	 * @returns {Promise} - adding email succeeded?
	 */
	addPaymentEmail(email) {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.PaymentAddEmail(email)).then(res => {
				res.data.data.paymentEmailAdd.err === null ? resolve(true) : reject(res.data.data.paymentEmailAdd.err);
			});
		});
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
				res.data.data.streamchatUserBan.err === null ? resolve(true) : reject(res.data.data.streamchatUserBan.err);
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
				res.errors === undefined ? resolve(res.data.data.search.trendingCategories) : reject(res.errors);
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
				res.data.data.chatDelete.err === null ? resolve(true) : reject(res.data.data.chatDelete.err);
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
				res.data.data.donate.err === null ? resolve(true) : reject(res.data.data.donate.err);
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
				res.data.data.emoteBan.err === null ? resolve(true) : reject(res.data.data.emoteBan.err);
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
				res.data.data.deleteEmote.err === null ? resolve(true) : reject(res.data.data.deleteEmote.err);
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
				res.data.data.saveEmote.err === null ? resolve(true) : reject(res.data.data.saveEmote.err);
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
				res.data.data.deleteEmote.err === null ? resolve(true) : reject(res.data.data.deleteEmote.err);
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
			request(this.authKey, queries.coinbaseToken(item)).then(res => {
				res.data.data.coinbaseToken.err === null ? resolve(res.data.data.coinbaseToken.token) : reject(res.data.data.coinbaseToken.err);
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
				resolve(res.data.data.livestreamsFollowing);
			});
		});
	}

	/**
	 * @returns {Promise} - Returns global information including languages
	 */
	getGlobalInformation() {
		return new Promise(resolve => {
			request(this.authKey, queries.GlobalInformation()).then(res => {
				resolve(res.data.data.globalInfo);
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
				res.data.data.userByDisplayName.err === undefined ? resolve(res.data.data.userByDisplayName) : reject(res.data.data.userByDisplayName.err);
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
				res.data.errors === undefined ? resolve(res.data.data.userByDisplayName.followers) : reject(res.data.errors);
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
				res.data.errors === undefined ? resolve(res.data.data.userByDisplayName.following) : reject(res.data.errors);
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
				res.data.errors === undefined ? resolve(res.data.data.userByDisplayName.pastBroadcasts) : reject(res.data.errors);
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
				res.data.errors === undefined ? resolve(res.data.data.userByDisplayName.videos) : reject(res.data.errors);
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
				res.data.errors === undefined ? resolve(res.data.data.userByDisplayName.treasureChest) : reject(res.data.errors);
			});
		});
	}

	/**
	 * @returns {Promise} - Returns your wallets balance
	 */
	getMeBalance() {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.MeBalance()).then(res => {
				res.data.errors === undefined ? resolve(res.data.data.me.wallet.balance) : reject(res.data.errors);
			});
		});
	}

	/**
	 * @returns {Promise} - Returns your dashboard information
	 */
	getMeDashboard() {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.MeDashboard()).then(res => {
				res.data.errors === undefined ? resolve(res.data.data) : reject(res.data.errors);
			});
		});
	}

	/**
	 * @returns {Promise} - Returns your global data
	 */
	getMeGlobal() {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.MeGlobal()).then(res => {
				res.data.errors === undefined ? resolve(res.data.data) : reject(res.data.errors);
			});
		});
	}

	/**
	 * @returns {Promise} - Returns your livestream data
	 */
	getMeLivestream() {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.MeLivestream()).then(res => {
				res.data.errors === undefined ? resolve(res.data.data.me) : reject(res.data.errors);
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
				res.data.errors === undefined ? resolve(res.data.data.me) : reject(res.data.errors);
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
				resolve(res.data.data.me);
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
				res.data.errors === undefined ? resolve(res.data.data.me.private.subscribing) : reject(res.data.errors);
			});
		});
	}

	/**
	 * @returns {Promise} - Returns LINO prices
	 */
	getPaybrosPrices() {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.PaybrosPrices()).then(res => {
				res.data.errors === undefined ? resolve(res.data.data.globalInfo.paybrosPrices) : reject(res.data.errors);
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
				res.data.errors === undefined ? resolve(res.data.data.userByDisplayName.chatModerators) : reject(res.data.errors);
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
				res.data.errors === undefined ? resolve(res.data.data.userByDisplayName.topContributions) : reject(res.data.errors);
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
				res.data.data.xsollaToken.err === null ? resolve(res.data.data.xsollaToken.token) : reject(res.data.data.xsollaToken.err);
			});
		});
	}

	/**
	 * @param {String} displayName - Dlive username to remove the moderator role of
	 * @returns {Promise} - Was the moderator role removed succesfully?
	 */
	removeModerator(displayName) {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.removeModerator(displayName)).then(res => {
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
				res.data.data.sendStreamchatMessage.err ? reject(res.data.data.sendStreamchatMessage.err) : resolve(res.data.data.sendStreamchatMessage.message.id);
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
				res.data.data.emoteModeSet.err ? reject(res.data.data.emoteModeSet.err) : resolve(true);
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
				res.data.data.chatIntervalSet.err ? reject(res.data.data.chatIntervalSet.err) : resolve(true);
			});
		});
	}

	/**
	 * @param {String} displayName - Dlive username to add moderator of
	 * @returns {Promise} - Was the moderator role added successfully?
	 */
	setModerator(displayName) {
		return new Promise((resolve, reject) => {
			request(this.authKey, queries.AddModerator(displayName)).then(res => {
				res.data.data.moderatorAdd.err ? reject(res.data.data.moderatorAdd.err) : resolve(true);
			});
		});
	}

	/**
	 * @param {String} displayName - Display name to start the class with
	 * @param {string} authKey - Your authentication key
	 * @returns {client} - New Dlive class instance
	 */
	async start(displayName, authKey) {
		this.client = new client();
		const _this = this;
		_this.authKey = authKey;
		if (displayName === null) displayName = await this.getMeDisplayName();
		_this.displayName = displayName;
		_this.linoUsername = await this.getLinoUsername(_this.displayName);

		_this.client.on('connect', async conn => {
			conn.sendUTF('{"type": "connection_init"}');
			await conn.sendUTF(queries.StreamMessageSubscription(_this.linoUsername));

			conn.on('message', message => {
				if (message && message.type === 'utf8') {
					message = JSON.parse(message.utf8Data);
					if (message.payload !== undefined) {
						const res = message.payload.data.streamMessageReceived['0'];
						if (typeof res !== 'undefined') _this.emit(res.__typename, res);
					}
				}
			});
		});

		_this.client.on('connectFailed', error => {
			throw new Error(`Connect error: ${error.toString()}`);
		});

		_this.client.connect('wss://graphigostream.prd.dlive.tv');
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
				res.data.data.streamchatUserBan.err ? reject(res.data.data.streamchatUserBan.err) : resolve(true);
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
				res.data.data.unfollow.err ? reject(res.data.data.unfollow.err) : resolve(true);
			});
		});
	}
};
