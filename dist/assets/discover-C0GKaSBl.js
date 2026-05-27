function s(e){return e.replace(/<br\s*\/?>/gi,`
`).replace(/<\/?(p|div)[^>]*>/gi,`
`).replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\n{3,}/g,`

`).trim()}function l(e){const t=e.title.romaji||e.title.native||e.title.english||`#${e.id}`,r=e.title.english&&e.title.english!==t?e.title.english:void 0,n=e.description?s(e.description):void 0,o=(e.tags??[]).filter(i=>!i.isAdult&&!i.isMediaSpoiler).sort((i,a)=>a.rank-i.rank).map(i=>i.name);return{anilistId:e.id,title:t,titleEnglish:r,imageUrl:e.coverImage.large||e.coverImage.medium,description:n||void 0,tags:o,format:e.format??void 0,episodes:e.episodes??void 0,averageScore:e.averageScore??void 0,startDate:e.startDate??void 0,nextAiringEpisode:e.nextAiringEpisode?.episode??void 0,nextAiringAt:e.nextAiringEpisode?.airingAt??void 0}}export{l as toDiscoverItem};
