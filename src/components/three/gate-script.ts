// A regra de `useStageAllowed` decidida antes da primeira pintura, por um script que o layout embute no <head>.
// Marca o <html> para o CSS já esconder o que o 3D substitui: a vitrine da sala e, com mouse, o nome do hero.

/** Estado da entrada do nome do hero em 3D (ver sections/hero/hero-intro.ts). */
export const HERO_INTRO_ATTRIBUTE = "data-hero3d";

const STAGE_ATTRIBUTE = "data-stage3d";

export const STAGE_SCRIPT = `(function(){try{var m=function(q){return window.matchMedia(q).matches};var c=navigator.connection;if(m("(prefers-reduced-motion: reduce)")||(c&&c.saveData))return;var g=document.createElement("canvas").getContext("webgl2");if(!g)return;var x=g.getExtension("WEBGL_lose_context");if(x)x.loseContext();var d=document.documentElement;d.setAttribute("${STAGE_ATTRIBUTE}","");if(m("(hover: hover) and (pointer: fine)"))d.setAttribute("${HERO_INTRO_ATTRIBUTE}","pending")}catch(e){}})();`;
