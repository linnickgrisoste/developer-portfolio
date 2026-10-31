// O script que decide, antes da primeira pintura, se o nome do hero entra em 3D. Fica fora do arquivo
// "use client" porque o layout (do servidor) o embute no <head> como texto.

/** Atributo no <html> com o estado da entrada em 3D (ver hero-intro.ts). */
export const HERO_INTRO_ATTRIBUTE = "data-hero3d";

/**
 * Mesmas condições de `useStageAllowed` + mouse: desktop com WebGL 2, sem movimento reduzido e sem
 * economia de dados. O contexto WebGL de teste é liberado em seguida.
 */
export const HERO_INTRO_SCRIPT = `(function(){try{var m=function(q){return window.matchMedia(q).matches};var c=navigator.connection;if(!m("(hover: hover) and (pointer: fine)")||m("(prefers-reduced-motion: reduce)")||(c&&c.saveData))return;var g=document.createElement("canvas").getContext("webgl2");if(!g)return;var x=g.getExtension("WEBGL_lose_context");if(x)x.loseContext();document.documentElement.setAttribute("${HERO_INTRO_ATTRIBUTE}","pending")}catch(e){}})();`;
