'use strict';
const {profile,projects}=window.PORTFOLIO;
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function gallery(p){return p.gallery?.length?`<section class="detail-section"><p class="eyebrow">PROJECT VISUALS</p><h2>From the project</h2><div class="project-gallery">${p.gallery.map(g=>`<figure><img src="${e(g.src)}" alt="${e(g.alt)}" loading="lazy"><figcaption>${e(g.caption)}</figcaption></figure>`).join('')}</div></section>`:'';}
function links(p){return p.links?.length?`<section class="detail-section"><h2>Explore the work</h2><div class="project-links">${p.links.map(l=>`<a class="text-link" href="${e(l.url)}" target="_blank" rel="noopener">${e(l.label)} ↗</a>`).join('')}</div></section>`:'';}
function figure(g) {
  const href = e(g.source || g.src);
  const action = g.source ? 'Open PDF' : 'View full size';
  const markup = `<figure class="case-figure">
    <a href="${href}" target="_blank" rel="noopener" aria-label="${action}: ${e(g.alt)}"><img src="${e(g.src)}" alt="${e(g.alt)}" loading="lazy"></a>
    <figcaption>${e(g.caption)} <a href="${href}" target="_blank" rel="noopener">${action} ↗</a></figcaption>
  </figure>`;
  if (g.motion || g.disclosure) {
    return `<details class="case-demo"><summary>${e(g.disclosure || g.demoLabel || 'Play demonstration')}</summary>${markup}</details>`;
  }
  return markup;
}

function renderVideos(videos = [], sectionId) {
  if (!videos.length) return '';
  return `<div class="case-videos">${videos.map((video, index) => {
    const captionId = `${sectionId}-video-${index}`;
    return `<figure class="case-video">
      <h3>${e(video.title)}</h3>
      <video controls playsinline preload="none" poster="${e(video.poster)}" aria-label="${e(video.title)}" aria-describedby="${e(captionId)}">
        <source src="${e(video.src)}" type="video/mp4"><p><a href="${e(video.src)}">Open the recording</a></p>
      </video>
      <figcaption id="${e(captionId)}">${e(video.description)}</figcaption>
      <a class="text-link" href="${e(video.src)}" download>Download video · ${e(video.duration)} ↓</a>
    </figure>`;
  }).join('')}</div>`;
}

function renderResources(resources = []) {
  if (!resources.length) return '';
  return `<ul class="resource-grid">${resources.map(file => {
    const download = file.format !== 'PDF';
    const size = file.bytes >= 1000000 ? `${(file.bytes / 1000000).toFixed(1)} MB` : `${Math.round(file.bytes / 1000)} KB`;
    return `<li><a class="resource-card" href="${e(file.src)}" ${download ? 'download' : 'target="_blank" rel="noopener"'}>
      <span class="resource-meta">${e(file.format)} · ${size}<span aria-hidden="true">${download ? '↓' : '↗'}</span></span>
      <strong>${e(file.title)}</strong><span class="resource-description">${e(file.description)}</span>
      <span class="resource-action">${download ? 'Download' : 'Open'} ${e(file.format)}</span>
    </a></li>`;
  }).join('')}</ul>`;
}

function renderTable(table) {
  if (!table) return '';
  const columns = table.columns.map(c => `<th scope="col">${e(c)}</th>`).join('');
  const rows = table.rows.map(([label, ...cells]) => `<tr><th scope="row">${e(label)}</th>${cells.map(c => `<td>${e(c)}</td>`).join('')}</tr>`).join('');
  return `<div class="case-table" role="region" tabindex="0" aria-label="${e(table.caption)}"><table>
    <caption>${e(table.caption)}</caption><thead><tr>${columns}</tr></thead><tbody>${rows}</tbody>
  </table></div>`;
}

function caseStudy(p) {
  return p.caseStudy.map((s, index) => {
    const sectionId = `case-${p.id}-${s.id}`;
    const paragraphs = (s.paragraphs || []).map(t => `<p>${e(t)}</p>`).join('');
    const bullets = s.bullets?.length ? `<ul>${s.bullets.map(t => `<li>${e(t)}</li>`).join('')}</ul>` : '';
    const items = (s.items || []).map((item, i) => `<article class="case-item">
      <span class="case-step" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${e(item.title)}</h3><p>${e(item.text)}</p>
      ${item.observation ? `<p class="case-observation">${e(item.observation)}</p>` : ''}${item.figure ? figure(item.figure) : ''}
    </article>`).join('');
    const figures = (s.figures || []).map(figure).join('');
    return `<section class="detail-section case-section" id="${e(sectionId)}">
      <p class="eyebrow">${String(index + 1).padStart(2, '0')} / ${e(s.label.toUpperCase())}</p><h2 tabindex="-1">${e(s.title)}</h2>
      ${paragraphs}${bullets}${renderTable(s.table)}${items ? `<div class="case-items">${items}</div>` : ''}
      ${figures ? `<div class="case-figures ${s.figures.length > 1 && !s.figures.some(g => g.disclosure) ? 'paired' : ''}">${figures}</div>` : ''}
      ${renderVideos(s.videos, sectionId)}${renderResources(s.resources)}
    </section>`;
  }).join('');
}
function caseNavigation(p) {
  return p.caseStudy?`<nav class="case-nav" aria-label="In this project"><span class="meta-label">IN THIS PROJECT</span><div>${p.caseStudy.map((s,i)=>`<button type="button" data-jump="case-${e(p.id)}-${e(s.id)}">${String(i+1).padStart(2,'0')} ${e(s.label)}</button>`).join('')}</div></nav>`:'';
}
const grid = document.querySelector('#project-grid');
const featuredGrid = document.querySelector('#featured-grid');
const search = document.querySelector('#project-search');
let activeFilter = 'all';

function projectCard(p, collection, wide = false) {
  const titleId = `${collection}-title-${e(p.id)}`;
  const illustration = p.image || `assets/generated/${p.id}-system.svg`;
  const caption = p.image ? (p.imageCaption || 'Project photograph') : p.figureCaption.split(' · ')[0];
  const year = p.era === 'earlier' ? 'EARLIER WORK' : (p.period.match(/\b(?:19|20)\d{2}\b/) || [''])[0];
  return `<a class="project-card${wide ? ' wide' : ''}" href="#project/${e(p.id)}" aria-labelledby="${titleId}">
    <div class="card-visual">
      <div class="card-visual-meta"><span>PROJECT / ${e(p.number)}</span><span>${e(p.status.toUpperCase())}</span></div>
      <img class="project-illustration" src="${e(illustration)}" alt="" loading="lazy">
      <span class="card-visual-caption">${e(caption)}</span>
    </div>
    <div class="card-content">
      <div class="card-topline"><span>${e(p.category)}</span><span>${e(year)}</span></div>
      <h3 id="${titleId}">${e(p.title)}</h3><p>${e(p.description)}</p>
      <div class="card-bottom"><div class="tag-list">${p.tags.slice(0,3).map(t => `<span class="tag">${e(t)}</span>`).join('')}</div><span class="card-arrow" aria-hidden="true">↗</span></div>
      <div class="card-outcome">${e(p.cardOutcome)}</div>
    </div></a>`;
}

function renderCards() {
  const query = search.value.trim().toLocaleLowerCase();
  const visible = projects.filter(p =>
    (activeFilter === 'all' || p.categories.includes(activeFilter)) &&
    [p.title, p.subtitle, p.category, p.description, ...p.tools, ...p.tags].join(' ').toLocaleLowerCase().includes(query)
  );
  grid.innerHTML = visible.map(p => projectCard(p, 'archive', p.wideCard && activeFilter === 'all' && !query)).join('');
  document.querySelector('#results-count').textContent = `${visible.length} ${visible.length === 1 ? 'project' : 'projects'}${activeFilter === 'all' ? '' : ' · ' + activeFilter}`;
  document.querySelector('#empty-state').hidden = visible.length !== 0;
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  activeFilter=button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  renderCards();
}));
search.addEventListener('input',renderCards);
document.querySelector('#reset-filters').addEventListener('click',()=>{
  search.value='';document.querySelector('[data-filter="all"]').click();search.focus();
});
const home = document.querySelector('#home-view');
const detail = document.querySelector('#project-view');
const archive = document.querySelector('#archive-view');
let returnCard = null;
for (const list of [featuredGrid, grid]) {
  list.addEventListener('click', event => {
    const card = event.target.closest('.project-card');
    if (card && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      returnCard = {hash: list === grid ? '#all-projects' : '#projects', href: card.hash, scroll: window.scrollY};
    }
  });
}
detail.addEventListener('click',event=>{
  const jump=event.target.closest('button[data-jump]');
  if(!jump)return;
  const section=document.getElementById(jump.dataset.jump);
  section?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  section?.querySelector('h2')?.focus({preventScroll:true});
});
function renderDetail(p) {
  const next=projects[(projects.indexOf(p)+1)%projects.length];
  const mood = p.id==='synabond'?`<div class="mood-table" aria-label="Pet mood by habits completed"><div class="mood" style="--mood:#e58d8a"><span class="mood-dot"></span><strong>CRITICAL</strong><span>0–1</span></div><div class="mood" style="--mood:#e6ac70"><span class="mood-dot"></span><strong>NEGLECTED</strong><span>2–3</span></div><div class="mood" style="--mood:#e1d48a"><span class="mood-dot"></span><strong>OKAY</strong><span>4–5</span></div><div class="mood" style="--mood:#9dd9a1"><span class="mood-dot"></span><strong>HAPPY</strong><span>6–7</span></div><div class="mood" style="--mood:#8dd8dc"><span class="mood-dot"></span><strong>THRIVING</strong><span>8–9</span></div></div>`:'';
  detail.innerHTML=`<div class="detail-breadcrumb"><a class="detail-back" href="${returnCard?.hash || '#all-projects'}">← ${returnCard?.hash === '#projects' ? 'Selected work' : 'All projects'}</a><span>${e(p.number)} / ${e(p.category.toUpperCase())}</span></div><header class="detail-header"><p class="eyebrow">${e(p.subtitle.toUpperCase())}</p><h1 tabindex="-1" id="detail-title">${e(p.title)}</h1><p>${e(p.summary)}</p></header><div class="detail-meta"><div><span class="meta-label">MY ROLE</span><span class="meta-value">${e(p.role)}</span></div><div><span class="meta-label">TIMELINE</span><span class="meta-value">${e(p.period)}</span></div><div><span class="meta-label">CONTEXT</span><span class="meta-value">${e(p.scope)}</span></div></div><div class="detail-visual" role="img" aria-label="${e(p.image ? p.imageAlt : p.figureLabel)}"><span class="card-visual-meta"><span>SYSTEM / ${e(p.number)}</span><span>${e(p.status.toUpperCase())}</span></span><img class="project-illustration" src="${e(p.image || `assets/generated/${e(p.id)}-system.svg`)}" alt="" loading="lazy"><span class="card-visual-caption">${e(p.image ? (p.imageCaption || 'Project photograph') : p.figureCaption)}</span></div>${caseNavigation(p)}<div class="detail-layout"><div>${p.caseStudy?caseStudy(p):`<section class="detail-section"><p class="eyebrow">01 / THE CONTEXT</p><h2>The problem & the approach</h2><p>${e(p.context)}</p></section><section class="detail-section"><p class="eyebrow">02 / MY CONTRIBUTION</p><h2>What I worked on</h2><p>${e(p.contribution)}</p></section><section class="detail-section"><p class="eyebrow">03 / UNDER THE HOOD</p><h2>The technical work</h2><ul>${p.work.map(s=>`<li>${e(s)}</li>`).join('')}</ul></section><section class="detail-section"><p class="eyebrow">04 / SYSTEM THINKING</p><h2>How the pieces connect</h2><p>${e(p.architecture)}</p>${mood}</section><section class="detail-section"><p class="eyebrow">05 / DESIGN DECISIONS</p><h2>Why this approach</h2><p>${e(p.decision)}</p></section><section class="detail-section"><p class="eyebrow">06 / OUTCOME</p><h2>What came out of the work</h2><p>${e(p.result)}</p></section>${gallery(p)}`}${links(p)}</div><aside class="detail-aside" aria-label="Project at a glance"><div class="outcome-panel"><span class="meta-label">PROJECT OUTCOME</span><strong class="outcome-value">${e(p.outcome)}</strong><p>${e(p.outcomeText)}</p></div><div class="aside-block"><span class="meta-label">TOOLS & TECHNOLOGIES</span><div class="tag-list">${p.tools.map(t=>`<span class="tag">${e(t)}</span>`).join('')}</div></div><div class="aside-block"><span class="meta-label">PROJECT SCOPE</span><p>${e(p.note)}</p></div></aside></div><a class="detail-next" href="#project/${e(next.id)}"><div><p class="eyebrow">NEXT PROJECT / ${e(next.number)}</p><strong>${e(next.title)}</strong></div><span aria-hidden="true">↗</span></a>`;
}
function route(initial = false) {
  detail.querySelectorAll('video').forEach(video => video.pause());
  if (location.hash === '#project/smart-cane') {
    history.replaceState(history.state, '', '#project/streetsense');
  }
  const hash = location.hash;
  const wasDetail = !detail.hidden;
  const isArchive = hash === '#all-projects';
  const isProject = hash.startsWith('#project/');
  home.hidden = isArchive || isProject;
  archive.hidden = !isArchive;
  detail.hidden = !isProject;

  if (isProject) {
    const p = projects.find(project => '#project/' + project.id === hash);
    if (p) {
      renderDetail(p);
      document.title = `${p.title} | ${profile.name}`;
    } else {
      document.title = `Project not found | ${profile.name}`;
      detail.innerHTML = '<div class="not-found"><h1 id="detail-title" tabindex="-1">Project not found.</h1><a class="button primary" href="#all-projects">Browse all projects →</a></div>';
    }
    window.scrollTo({top: 0, behavior: 'instant'});
    if (!initial) document.querySelector('#detail-title').focus({preventScroll: true});
    return;
  }

  document.title = isArchive ? `All projects | ${profile.name}` : `${profile.name} | Engineering Portfolio`;
  if (isArchive) renderCards();
  if (wasDetail && returnCard?.hash === hash) {
    const list = isArchive ? grid : featuredGrid;
    const card = [...list.querySelectorAll('.project-card')].find(a => a.hash === returnCard.href);
    window.scrollTo({top: returnCard.scroll, behavior: 'instant'});
    card?.focus({preventScroll: true});
  } else if (isArchive) {
    window.scrollTo({top: 0, behavior: 'instant'});
    if (!initial) document.querySelector('#archive-heading').focus({preventScroll: true});
  } else {
    const target = document.getElementById(hash.slice(1));
    if (target) {
      target.scrollIntoView({behavior: 'instant'});
      if (!initial) (target.querySelector('h1, h2') || target).focus({preventScroll: true});
    } else {
      window.scrollTo({top: 0, behavior: 'instant'});
    }
  }
  returnCard = null;
}

featuredGrid.innerHTML = projects.slice(0, 3).map(p => projectCard(p, 'featured')).join('');
window.addEventListener('hashchange', () => route());
route(true);
