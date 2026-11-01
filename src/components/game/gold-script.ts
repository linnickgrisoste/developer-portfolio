import { GOLD_ATTRIBUTE } from "@/lib/palette";
import { STORAGE_KEY } from "./storage";

/** Aplica o modo dourado antes da primeira pintura, lendo o progresso salvo (ver store.ts). Vai inline no <head>. */
export const GOLD_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem("${STORAGE_KEY}")||"null");if(s&&s.goldMode)document.documentElement.setAttribute("${GOLD_ATTRIBUTE}","")}catch(e){}})();`;
