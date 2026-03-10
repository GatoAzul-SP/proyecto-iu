declare function isOnAdmin(): boolean;

declare function loadSetting(name: string): any;

declare function saveSetting(name: string, setting: any): void;

declare function openDB(name: string, ver: number,
                        cb_upgrade: (e: IDBVersionChangeEvent) => void): Promise<IDBDatabase>;

declare function getDBObject(store: IDBObjectStore, key: any): Promise<any>;

interface SiteColors {
	"accent-1"?: string;
	"accent-2"?: string;
	foreground?: string;
	background?: string;
	"background-shadowed"?: string;
	[name: string]: string | undefined;
}

declare function applySiteColors(root: HTMLElement, colors: SiteColors): void;

interface SiteFonts {
	primary?: string;
	secondary?: string;
	titleSize?: number;
	subtitleSize?: number;
	paragraphSize?: number;
}

declare function applySiteFonts(root: HTMLElement, fonts: SiteFonts)
