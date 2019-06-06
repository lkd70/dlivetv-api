'use strict';

/* tslint:disable typedef-whitespace*/

export interface IBrowsePageSearchCategory {
	search: ISearch;
}

export interface ISearch {
	trendingCategories: ITrendingCategories;
	__typename:         string;
}

export interface ITrendingCategories {
	pageInfo:   IPageInfo;
	list:       IList[];
	__typename: string;
}

export interface IList {
	id:            string;
	backendID:     number;
	title:         string;
	imgUrl:        string;
	watchingCount: number;
	__typename:    string;
}

export interface IPageInfo {
	endCursor:   string;
	hasNextPage: boolean;
	__typename:  string;
}

export interface IGetFollowingPageLivestreams {
	pageInfo:   IPageInfo;
	list:       IList[];
	__typename: string;
}

export interface IList {
	id:            string;
	creator:       ICreator;
	title:         string;
	totalReward:   string;
	watchingCount: number;
	thumbnailUrl:  string;
	lastUpdatedAt: string;
	__typename:    string;
}

export interface ICreator {
	username:      string;
	displayname:   string;
	avatar:        string;
	__typename:    string;
	partnerStatus: string;
}

export interface IPageInfo {
	endCursor:   string;
	hasNextPage: boolean;
	__typename:  string;
}

export interface IGetLivestreamProfileFollowers {
	pageInfo:   IPageInfo;
	list:       IList[];
	__typename: string;
}

export interface IList {
	avatar:        string;
	__typename:    string;
	displayname:   string;
	partnerStatus: IPartnerStatus;
	id:            string;
	username:      string;
	isFollowing:   boolean;
	isMe:          boolean;
	followers:     IFollowers;
}

export interface IFollowers {
	totalCount: number;
	__typename: string;
}

export enum IPartnerStatus {
	None = 'NONE',
	VerifiedPartner = 'VERIFIED_PARTNER',
}

export interface IPageInfo {
	endCursor:   string;
	hasNextPage: boolean;
	__typename:  string;
}

export interface IGetGlobalInformation {
	data: IData;
}

export interface IData {
	globalInfo: IGlobalInfo;
}

export interface IGlobalInfo {
	languages:  ILanguage[];
	__typename: string;
}

export interface ILanguage {
	id:         string;
	backendID:  number;
	language:   string;
	code:       string;
	__typename: string;
}

export interface IGetLivestreamPage {
	id:                string;
	avatar:            string;
	__typename:        string;
	displayname:       string;
	partnerStatus:     string;
	username:          string;
	isFollowing:       boolean;
	isMe:              boolean;
	followers:         IFollowers;
	isSubscribing:     boolean;
	canSubscribe:      boolean;
	banStatus:         string;
	about:             string;
	myRoomRole:        string;
	livestream:        null;
	hostingLivestream: null;
	private:           null;
	videos:            IFollowers;
	pastBroadcasts:    IFollowers;
	following:         IFollowers;
}

export interface IFollowers {
	totalCount: number;
	__typename: string;
}

export interface IGetLivestreamTreasureChestWinners {
	lastGiveawayWin:     string;
	lastGiveawayWinners: ILastGiveawayWinner[];
	__typename:          string;
}

export interface ILastGiveawayWinner {
	value:      string;
	user:       IUser;
	__typename: string;
}

export interface IUser {
	avatar:      string;
	__typename:  string;
	displayname: string;
}

export interface IGetMeDashboard {
	me: IMe;
}

export interface IMe {
	id:                string;
	livestream:        null;
	hostingLivestream: null;
	private:           IPrivate;
	__typename:        string;
	followers:         IErs;
	wallet:            IWallet;
	username:          string;
	role:              string;
	myChatBadges:      any[];
	emote:             IEmote;
}

export interface IEmote {
	mine:       IChannel;
	__typename: string;
	channel:    IChannel;
	global:     IChannel;
}

export interface IChannel {
	list:       IList[];
	__typename: string;
}

export interface IList {
	name:       string;
	username:   string;
	sourceURL:  string;
	mimeType:   string;
	level:      string;
	type:       string;
	__typename: string;
}

export interface IErs {
	totalCount: number;
	__typename: string;
}

export interface IPrivate {
	streamTemplate: IStreamTemplate;
	filterWords:    any[];
	__typename:     string;
	subscribers:    IErs;
}

export interface IStreamTemplate {
	title:          string;
	ageRestriction: boolean;
	thumbnailUrl:   string;
	disableAlert:   boolean;
	category:       ICategory;
	language:       ILanguage;
	__typename:     string;
}

export interface ICategory {
	id:         string;
	backendID:  number;
	title:      string;
	__typename: string;
}

export interface ILanguage {
	id:         string;
	backendID:  number;
	code:       string;
	language:   string;
	__typename: string;
}

export interface IWallet {
	totalEarning: string;
	__typename:   string;
}

export interface IGetMeLivestream {
	id:         string;
	username:   string;
	role:       string;
	emote:      IEmote;
	__typename: string;
}

export interface IEmote {
	mine:       IChannel;
	__typename: string;
	channel:    IChannel;
}

export interface IChannel {
	list:       IList[];
	__typename: string;
}

export interface IList {
	name:       string;
	username:   string;
	sourceURL:  string;
	mimeType:   string;
	level:      string;
	type:       string;
	__typename: string;
}


export interface ICategoryLivestreamsPage {
	data: IData;
}

export interface IData {
	category: IDataCategory;
}

export interface IDataCategory {
	id:            string;
	backendID:     number;
	title:         string;
	imgUrl:        string;
	coverImgUrl:   string;
	watchingCount: number;
	languages:     ILanguage[];
	livestreams:   ILivestreams;
	__typename:    string;
}

export interface ILanguage {
	id:         string;
	backendID: number;
	language:   string;
	__typename: string;
}

export interface ILivestreams {
	pageInfo:   IPageInfo;
	list:       IList[];
	__typename: string;
}

export interface IList {
	permlink:       string;
	ageRestriction: boolean;
	id:             string;
	creator:        ICreator;
	title:          string;
	totalReward:    string;
	watchingCount:  number;
	thumbnailUrl:   string;
	lastUpdatedAt:  string;
	category:       IListCategory;
	language:       ILanguage;
	__typename:     string;
}

export interface IListCategory {
	id:         string;
	title:      string;
	__typename: string;
}

export interface ICreator {
	id:            string;
	username:      string;
	displayname:   string;
	avatar:        string;
	__typename:    string;
	partnerStatus: string;
}

export interface IPageInfo {
	endCursor:   string;
	hasNextPage: boolean;
	__typename:  string;
}
