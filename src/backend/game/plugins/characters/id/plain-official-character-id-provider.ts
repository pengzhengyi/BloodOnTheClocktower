import type { IOfficialCharacterIdProvider } from './official-character-id-provider';

export enum CHARACTERS {
    Washerwoman = 'washerwoman',
    Librarian = 'librarian',
    Investigator = 'investigator',
    Chef = 'chef',
    Empath = 'empath',
    FortuneTeller = 'fortuneteller',
    Undertaker = 'undertaker',
    Monk = 'monk',
    Ravenkeeper = 'ravenkeeper',
    Virgin = 'virgin',
    Slayer = 'slayer',
    Soldier = 'soldier',
    Mayor = 'mayor',
    Butler = 'butler',
    Drunk = 'drunk',
    Recluse = 'recluse',
    Saint = 'saint',
    Poisoner = 'poisoner',
    Spy = 'spy',
    ScarletWoman = 'scarletwoman',
    Baron = 'baron',
    Imp = 'imp',
    Bureaucrat = 'bureaucrat',
    Thief = 'thief',
    Gunslinger = 'gunslinger',
    Scapegoat = 'scapegoat',
    Beggar = 'beggar',
    Grandmother = 'grandmother',
    Sailor = 'sailor',
    Chambermaid = 'chambermaid',
    Exorcist = 'exorcist',
    Innkeeper = 'innkeeper',
    Gambler = 'gambler',
    Gossip = 'gossip',
    Courtier = 'courtier',
    Professor = 'professor',
    Minstrel = 'minstrel',
    TeaLady = 'tealady',
    Pacifist = 'pacifist',
    Fool = 'fool',
    Tinker = 'tinker',
    Moonchild = 'moonchild',
    Goon = 'goon',
    Lunatic = 'lunatic',
    Godfather = 'godfather',
    DevilsAdvocate = 'devilsadvocate',
    Assassin = 'assassin',
    Mastermind = 'mastermind',
    Zombuul = 'zombuul',
    Pukka = 'pukka',
    Shabaloth = 'shabaloth',
    Po = 'po',
    Apprentice = 'apprentice',
    Matron = 'matron',
    Judge = 'judge',
    Bishop = 'bishop',
    Voudon = 'voudon',
    Clockmaker = 'clockmaker',
    Dreamer = 'dreamer',
    SnakeCharmer = 'snakecharmer',
    Mathematician = 'mathematician',
    Flowergirl = 'flowergirl',
    TownCrier = 'towncrier',
    Oracle = 'oracle',
    Savant = 'savant',
    Seamstress = 'seamstress',
    Philosopher = 'philosopher',
    Artist = 'artist',
    Juggler = 'juggler',
    Sage = 'sage',
    Mutant = 'mutant',
    Sweetheart = 'sweetheart',
    Barber = 'barber',
    Klutz = 'klutz',
    EvilTwin = 'eviltwin',
    Witch = 'witch',
    Cerenovus = 'cerenovus',
    PitHag = 'pithag',
    FangGu = 'fanggu',
    Vigormortis = 'vigormortis',
    NoDashii = 'nodashii',
    Vortox = 'vortox',
    Barista = 'barista',
    Harlot = 'harlot',
    Butcher = 'butcher',
    BoneCollector = 'bonecollector',
    Deviant = 'deviant',
    Noble = 'noble',
    BountyHunter = 'bountyhunter',
    Pixie = 'pixie',
    General = 'general',
    Preacher = 'preacher',
    King = 'king',
    Balloonist = 'balloonist',
    CultLeader = 'cultleader',
    Lycanthrope = 'lycanthrope',
    Amnesiac = 'amnesiac',
    Nightwatchman = 'nightwatchman',
    Engineer = 'engineer',
    Fisherman = 'fisherman',
    Huntsman = 'huntsman',
    Alchemist = 'alchemist',
    Farmer = 'farmer',
    Magician = 'magician',
    Choirboy = 'choirboy',
    PoppyGrower = 'poppygrower',
    Atheist = 'atheist',
    Cannibal = 'cannibal',
    Snitch = 'snitch',
    Acrobat = 'acrobat',
    Puzzlemaster = 'puzzlemaster',
    Heretic = 'heretic',
    Damsel = 'damsel',
    Golem = 'golem',
    Politician = 'politician',
    Widow = 'widow',
    Fearmonger = 'fearmonger',
    Psychopath = 'psychopath',
    Goblin = 'goblin',
    Mephit = 'mephit',
    Mezepheles = 'mezepheles',
    Marionette = 'marionette',
    Boomdandy = 'boomdandy',
    LilMonsta = 'lilmonsta',
    Lleech = 'lleech',
    AlHadikhia = 'alhadikhia',
    Legion = 'legion',
    Leviathan = 'leviathan',
    Riot = 'riot',
    Gangster = 'gangster',
    Angel = 'angel',
    Buddhist = 'buddhist',
    Djinn = 'djinn',
    Doomsayer = 'doomsayer',
    Duchess = 'duchess',
    Fibbin = 'fibbin',
    Fiddler = 'fiddler',
    HellsLibrarian = 'hellslibrarian',
    Revolutionary = 'revolutionary',
    Sentinel = 'sentinel',
    SpiritOfIvory = 'spiritofivory',
    StormCatcher = 'stormcatcher',
    Toymaker = 'toymaker',
}

export abstract class PlainOfficialCharacterIdProvider
    implements IOfficialCharacterIdProvider
{
    getOfficialCharacterIds(): Promise<Set<string>> {
        const characterIds = new Set<string>(Object.values(CHARACTERS));

        return Promise.resolve(characterIds);
    }

    async isOfficialCharacterId(id: string): Promise<boolean> {
        const characterIds: Set<string> = await this.getOfficialCharacterIds();

        return characterIds.has(id);
    }
}
