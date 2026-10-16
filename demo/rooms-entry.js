import {publicEntryRedirect} from './hall-game-catalog.js';
const target=publicEntryRedirect(location.search);
if(target)location.replace(target);else await import('./rooms.js');
