import { Washerwoman } from './washerwoman';
import { Librarian } from './librarian';
import { Investigator } from './investigator';
import { Chef } from './chef';
import { Empath } from './empath';
import { Fortuneteller } from './fortuneteller';
import { Undertaker } from './undertaker';
import { Monk } from './monk';
import { Ravenkeeper } from './ravenkeeper';
import { Virgin } from './virgin';
import { Slayer } from './slayer';
import { Soldier } from './soldier';
import { Mayor } from './mayor';
import { Butler } from './butler';
import { Drunk } from './drunk';
import { Recluse } from './recluse';
import { Saint } from './saint';
import { Poisoner } from './poisoner';
import { Spy } from './spy';
import { Scarletwoman } from './scarletwoman';
import { Baron } from './baron';
import { Imp } from './imp';
import { Bureaucrat } from './bureaucrat';
import { Thief } from './thief';
import { Gunslinger } from './gunslinger';
import { Scapegoat } from './scapegoat';
import { Beggar } from './beggar';
import { Grandmother } from './grandmother';
import { Sailor } from './sailor';
import { Chambermaid } from './chambermaid';
import { Exorcist } from './exorcist';
import { Innkeeper } from './innkeeper';
import { Gambler } from './gambler';
import { Gossip } from './gossip';
import { Courtier } from './courtier';
import { Professor } from './professor';
import { Minstrel } from './minstrel';
import { Tealady } from './tealady';
import { Pacifist } from './pacifist';
import { Fool } from './fool';
import { Tinker } from './tinker';
import { Moonchild } from './moonchild';
import { Goon } from './goon';
import { Lunatic } from './lunatic';
import { Godfather } from './godfather';
import { Devilsadvocate } from './devilsadvocate';
import { Assassin } from './assassin';
import { Mastermind } from './mastermind';
import { Zombuul } from './zombuul';
import { Pukka } from './pukka';
import { Shabaloth } from './shabaloth';
import { Po } from './po';
import { Apprentice } from './apprentice';
import { Matron } from './matron';
import { Judge } from './judge';
import { Bishop } from './bishop';
import { Voudon } from './voudon';
import { Clockmaker } from './clockmaker';
import { Dreamer } from './dreamer';
import { Snakecharmer } from './snakecharmer';
import { Mathematician } from './mathematician';
import { Flowergirl } from './flowergirl';
import { Towncrier } from './towncrier';
import { Oracle } from './oracle';
import { Savant } from './savant';
import { Seamstress } from './seamstress';
import { Philosopher } from './philosopher';
import { Artist } from './artist';
import { Juggler } from './juggler';
import { Sage } from './sage';
import { Mutant } from './mutant';
import { Sweetheart } from './sweetheart';
import { Barber } from './barber';
import { Klutz } from './klutz';
import { Eviltwin } from './eviltwin';
import { Witch } from './witch';
import { Cerenovus } from './cerenovus';
import { Pithag } from './pithag';
import { Fanggu } from './fanggu';
import { Vigormortis } from './vigormortis';
import { Nodashii } from './nodashii';
import { Vortox } from './vortox';
import { Barista } from './barista';
import { Harlot } from './harlot';
import { Butcher } from './butcher';
import { Bonecollector } from './bonecollector';
import { Deviant } from './deviant';
import { Noble } from './noble';
import { Bountyhunter } from './bountyhunter';
import { Pixie } from './pixie';
import { General } from './general';
import { Preacher } from './preacher';
import { King } from './king';
import { Balloonist } from './balloonist';
import { Cultleader } from './cultleader';
import { Lycanthrope } from './lycanthrope';
import { Amnesiac } from './amnesiac';
import { Nightwatchman } from './nightwatchman';
import { Engineer } from './engineer';
import { Fisherman } from './fisherman';
import { Huntsman } from './huntsman';
import { Alchemist } from './alchemist';
import { Farmer } from './farmer';
import { Magician } from './magician';
import { Choirboy } from './choirboy';
import { Poppygrower } from './poppygrower';
import { Atheist } from './atheist';
import { Cannibal } from './cannibal';
import { Snitch } from './snitch';
import { Acrobat } from './acrobat';
import { Puzzlemaster } from './puzzlemaster';
import { Heretic } from './heretic';
import { Damsel } from './damsel';
import { Golem } from './golem';
import { Politician } from './politician';
import { Widow } from './widow';
import { Fearmonger } from './fearmonger';
import { Psychopath } from './psychopath';
import { Goblin } from './goblin';
import { Mephit } from './mephit';
import { Mezepheles } from './mezepheles';
import { Marionette } from './marionette';
import { Boomdandy } from './boomdandy';
import { Lilmonsta } from './lilmonsta';
import { Lleech } from './lleech';
import { Alhadikhia } from './alhadikhia';
import { Legion } from './legion';
import { Leviathan } from './leviathan';
import { Riot } from './riot';
import { Gangster } from './gangster';
import { Angel } from './angel';
import { Buddhist } from './buddhist';
import { Djinn } from './djinn';
import { Doomsayer } from './doomsayer';
import { Duchess } from './duchess';
import { Fibbin } from './fibbin';
import { Fiddler } from './fiddler';
import { Hellslibrarian } from './hellslibrarian';
import { Revolutionary } from './revolutionary';
import { Sentinel } from './sentinel';
import { Spiritofivory } from './spiritofivory';
import { Stormcatcher } from './stormcatcher';
import { Toymaker } from './toymaker';
import { Character } from '~/game/character';

export const ID_TO_CHARACTER: Map<string, typeof Character> = new Map();
ID_TO_CHARACTER.set('washerwoman', Washerwoman);
ID_TO_CHARACTER.set('librarian', Librarian);
ID_TO_CHARACTER.set('investigator', Investigator);
ID_TO_CHARACTER.set('chef', Chef);
ID_TO_CHARACTER.set('empath', Empath);
ID_TO_CHARACTER.set('fortuneteller', Fortuneteller);
ID_TO_CHARACTER.set('undertaker', Undertaker);
ID_TO_CHARACTER.set('monk', Monk);
ID_TO_CHARACTER.set('ravenkeeper', Ravenkeeper);
ID_TO_CHARACTER.set('virgin', Virgin);
ID_TO_CHARACTER.set('slayer', Slayer);
ID_TO_CHARACTER.set('soldier', Soldier);
ID_TO_CHARACTER.set('mayor', Mayor);
ID_TO_CHARACTER.set('butler', Butler);
ID_TO_CHARACTER.set('drunk', Drunk);
ID_TO_CHARACTER.set('recluse', Recluse);
ID_TO_CHARACTER.set('saint', Saint);
ID_TO_CHARACTER.set('poisoner', Poisoner);
ID_TO_CHARACTER.set('spy', Spy);
ID_TO_CHARACTER.set('scarletwoman', Scarletwoman);
ID_TO_CHARACTER.set('baron', Baron);
ID_TO_CHARACTER.set('imp', Imp);
ID_TO_CHARACTER.set('bureaucrat', Bureaucrat);
ID_TO_CHARACTER.set('thief', Thief);
ID_TO_CHARACTER.set('gunslinger', Gunslinger);
ID_TO_CHARACTER.set('scapegoat', Scapegoat);
ID_TO_CHARACTER.set('beggar', Beggar);
ID_TO_CHARACTER.set('grandmother', Grandmother);
ID_TO_CHARACTER.set('sailor', Sailor);
ID_TO_CHARACTER.set('chambermaid', Chambermaid);
ID_TO_CHARACTER.set('exorcist', Exorcist);
ID_TO_CHARACTER.set('innkeeper', Innkeeper);
ID_TO_CHARACTER.set('gambler', Gambler);
ID_TO_CHARACTER.set('gossip', Gossip);
ID_TO_CHARACTER.set('courtier', Courtier);
ID_TO_CHARACTER.set('professor', Professor);
ID_TO_CHARACTER.set('minstrel', Minstrel);
ID_TO_CHARACTER.set('tealady', Tealady);
ID_TO_CHARACTER.set('pacifist', Pacifist);
ID_TO_CHARACTER.set('fool', Fool);
ID_TO_CHARACTER.set('tinker', Tinker);
ID_TO_CHARACTER.set('moonchild', Moonchild);
ID_TO_CHARACTER.set('goon', Goon);
ID_TO_CHARACTER.set('lunatic', Lunatic);
ID_TO_CHARACTER.set('godfather', Godfather);
ID_TO_CHARACTER.set('devilsadvocate', Devilsadvocate);
ID_TO_CHARACTER.set('assassin', Assassin);
ID_TO_CHARACTER.set('mastermind', Mastermind);
ID_TO_CHARACTER.set('zombuul', Zombuul);
ID_TO_CHARACTER.set('pukka', Pukka);
ID_TO_CHARACTER.set('shabaloth', Shabaloth);
ID_TO_CHARACTER.set('po', Po);
ID_TO_CHARACTER.set('apprentice', Apprentice);
ID_TO_CHARACTER.set('matron', Matron);
ID_TO_CHARACTER.set('judge', Judge);
ID_TO_CHARACTER.set('bishop', Bishop);
ID_TO_CHARACTER.set('voudon', Voudon);
ID_TO_CHARACTER.set('clockmaker', Clockmaker);
ID_TO_CHARACTER.set('dreamer', Dreamer);
ID_TO_CHARACTER.set('snakecharmer', Snakecharmer);
ID_TO_CHARACTER.set('mathematician', Mathematician);
ID_TO_CHARACTER.set('flowergirl', Flowergirl);
ID_TO_CHARACTER.set('towncrier', Towncrier);
ID_TO_CHARACTER.set('oracle', Oracle);
ID_TO_CHARACTER.set('savant', Savant);
ID_TO_CHARACTER.set('seamstress', Seamstress);
ID_TO_CHARACTER.set('philosopher', Philosopher);
ID_TO_CHARACTER.set('artist', Artist);
ID_TO_CHARACTER.set('juggler', Juggler);
ID_TO_CHARACTER.set('sage', Sage);
ID_TO_CHARACTER.set('mutant', Mutant);
ID_TO_CHARACTER.set('sweetheart', Sweetheart);
ID_TO_CHARACTER.set('barber', Barber);
ID_TO_CHARACTER.set('klutz', Klutz);
ID_TO_CHARACTER.set('eviltwin', Eviltwin);
ID_TO_CHARACTER.set('witch', Witch);
ID_TO_CHARACTER.set('cerenovus', Cerenovus);
ID_TO_CHARACTER.set('pithag', Pithag);
ID_TO_CHARACTER.set('fanggu', Fanggu);
ID_TO_CHARACTER.set('vigormortis', Vigormortis);
ID_TO_CHARACTER.set('nodashii', Nodashii);
ID_TO_CHARACTER.set('vortox', Vortox);
ID_TO_CHARACTER.set('barista', Barista);
ID_TO_CHARACTER.set('harlot', Harlot);
ID_TO_CHARACTER.set('butcher', Butcher);
ID_TO_CHARACTER.set('bonecollector', Bonecollector);
ID_TO_CHARACTER.set('deviant', Deviant);
ID_TO_CHARACTER.set('noble', Noble);
ID_TO_CHARACTER.set('bountyhunter', Bountyhunter);
ID_TO_CHARACTER.set('pixie', Pixie);
ID_TO_CHARACTER.set('general', General);
ID_TO_CHARACTER.set('preacher', Preacher);
ID_TO_CHARACTER.set('king', King);
ID_TO_CHARACTER.set('balloonist', Balloonist);
ID_TO_CHARACTER.set('cultleader', Cultleader);
ID_TO_CHARACTER.set('lycanthrope', Lycanthrope);
ID_TO_CHARACTER.set('amnesiac', Amnesiac);
ID_TO_CHARACTER.set('nightwatchman', Nightwatchman);
ID_TO_CHARACTER.set('engineer', Engineer);
ID_TO_CHARACTER.set('fisherman', Fisherman);
ID_TO_CHARACTER.set('huntsman', Huntsman);
ID_TO_CHARACTER.set('alchemist', Alchemist);
ID_TO_CHARACTER.set('farmer', Farmer);
ID_TO_CHARACTER.set('magician', Magician);
ID_TO_CHARACTER.set('choirboy', Choirboy);
ID_TO_CHARACTER.set('poppygrower', Poppygrower);
ID_TO_CHARACTER.set('atheist', Atheist);
ID_TO_CHARACTER.set('cannibal', Cannibal);
ID_TO_CHARACTER.set('snitch', Snitch);
ID_TO_CHARACTER.set('acrobat', Acrobat);
ID_TO_CHARACTER.set('puzzlemaster', Puzzlemaster);
ID_TO_CHARACTER.set('heretic', Heretic);
ID_TO_CHARACTER.set('damsel', Damsel);
ID_TO_CHARACTER.set('golem', Golem);
ID_TO_CHARACTER.set('politician', Politician);
ID_TO_CHARACTER.set('widow', Widow);
ID_TO_CHARACTER.set('fearmonger', Fearmonger);
ID_TO_CHARACTER.set('psychopath', Psychopath);
ID_TO_CHARACTER.set('goblin', Goblin);
ID_TO_CHARACTER.set('mephit', Mephit);
ID_TO_CHARACTER.set('mezepheles', Mezepheles);
ID_TO_CHARACTER.set('marionette', Marionette);
ID_TO_CHARACTER.set('boomdandy', Boomdandy);
ID_TO_CHARACTER.set('lilmonsta', Lilmonsta);
ID_TO_CHARACTER.set('lleech', Lleech);
ID_TO_CHARACTER.set('alhadikhia', Alhadikhia);
ID_TO_CHARACTER.set('legion', Legion);
ID_TO_CHARACTER.set('leviathan', Leviathan);
ID_TO_CHARACTER.set('riot', Riot);
ID_TO_CHARACTER.set('gangster', Gangster);
ID_TO_CHARACTER.set('angel', Angel);
ID_TO_CHARACTER.set('buddhist', Buddhist);
ID_TO_CHARACTER.set('djinn', Djinn);
ID_TO_CHARACTER.set('doomsayer', Doomsayer);
ID_TO_CHARACTER.set('duchess', Duchess);
ID_TO_CHARACTER.set('fibbin', Fibbin);
ID_TO_CHARACTER.set('fiddler', Fiddler);
ID_TO_CHARACTER.set('hellslibrarian', Hellslibrarian);
ID_TO_CHARACTER.set('revolutionary', Revolutionary);
ID_TO_CHARACTER.set('sentinel', Sentinel);
ID_TO_CHARACTER.set('spiritofivory', Spiritofivory);
ID_TO_CHARACTER.set('stormcatcher', Stormcatcher);
ID_TO_CHARACTER.set('toymaker', Toymaker);