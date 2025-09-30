// Ticket Management System (vanilla JS + localStorage)
const LS_KEY = 'tms:tickets';

const el = {
  grid: document.getElementById('tickets'),
  search: document.getElementById('search'),
  statusFilter: document.getElementById('statusFilter'),
  sortBy: document.getElementById('sortBy'),
  newTicketBtn: document.getElementById('newTicketBtn'),
  modal: document.getElementById('ticketModal'),
  form: document.getElementById('ticketForm'),
  modalTitle: document.getElementById('modalTitle'),
  fields: {
    id: document.getElementById('ticketId'),
    title: document.getElementById('title'),
    description: document.getElementById('description'),
    assignee: document.getElementById('assignee'),
    priority: document.getElementById('priority'),
    tags: document.getElementById('tags'),
    status: document.getElementById('status'),
  },
  stats: {
    all: document.getElementById('countAll'),
    open: document.getElementById('countOpen'),
    inProgress: document.getElementById('countInProgress'),
    resolved: document.getElementById('countResolved'),
    closed: document.getElementById('countClosed'),
  }
};

function uid(){ return Math.random().toString(36).slice(2,8).toUpperCase(); }
function now(){ return new Date().toISOString(); }

function load(){
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch{ return []; }
}
function save(list){ localStorage.setItem(LS_KEY, JSON.stringify(list)); }

function seed(){
  const demo = [
    { id: 'TKT-' + uid(), title:'Venue Wi‑Fi Issues', description:'Attendees report intermittent Wi‑Fi drops.', assignee:'Alex', priority:1, status:'IN_PROGRESS', tags:['infra','venue'], createdAt: now() },
    { id: 'TKT-' + uid(), title:'Registration Form Bug', description:'Submit button disabled after first attempt.', assignee:'Mara', priority:0, status:'OPEN', tags:['frontend','bug'], createdAt: now() },
    { id: 'TKT-' + uid(), title:'Speaker Schedule Update', description:'Update keynote time to 10:30.', assignee:'Cosmin', priority:2, status:'RESOLVED', tags:['content'], createdAt: now() },
  ];
  save(demo);
  return demo;
}

let tickets = load();
if(tickets.length === 0) tickets = seed();

function render(){
  const q = el.search.value.trim().toLowerCase();
  const status = el.statusFilter.value;

  let filtered = tickets.filter(t => {
    const hay = [t.id, t.title, t.assignee, (t.tags||[]).join(' ')].join(' ').toLowerCase();
    const matchQ = q ? hay.includes(q) : true;
    const matchS = status === 'ALL' ? true : t.status === status;
    return matchQ && matchS;
  });

  const [key, dir] = el.sortBy.value.split('_');
  filtered.sort((a,b)=>{
    if(key === 'createdAt'){
      return dir==='desc' ? (new Date(b.createdAt)-new Date(a.createdAt)) : (new Date(a.createdAt)-new Date(b.createdAt));
    }
    if(key === 'priority'){
      return dir==='desc' ? (a.priority-b.priority) : (b.priority-a.priority);
    }
    return 0;
  });

  // Stats
  el.stats.all.textContent = tickets.length;
  el.stats.open.textContent = tickets.filter(t=>t.status==='OPEN').length;
  el.stats.inProgress.textContent = tickets.filter(t=>t.status==='IN_PROGRESS').length;
  el.stats.resolved.textContent = tickets.filter(t=>t.status==='RESOLVED').length;
  el.stats.closed.textContent = tickets.filter(t=>t.status==='CLOSED').length;

  // Grid
  el.grid.innerHTML = '';
  const tpl = document.getElementById('ticketTpl');
  filtered.forEach(t => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.badge.id').textContent = t.id;
    const sBadge = node.querySelector('.badge.status');
    sBadge.textContent = t.status.replace('_',' ');
    sBadge.dataset.v = t.status;
    const pBadge = node.querySelector('.badge.priority');
    pBadge.textContent = ['Critical','High','Medium','Low'][t.priority] || t.priority;
    pBadge.dataset.v = t.priority;

    node.querySelector('.title').textContent = t.title;
    node.querySelector('.desc').textContent = t.description || '';
    node.querySelector('.assignee').textContent = t.assignee ? '👤 ' + t.assignee : '👤 Unassigned';
    node.querySelector('.date').textContent = '🗓 ' + new Date(t.createdAt).toLocaleString();

    const tagWrap = node.querySelector('.tags');
    (t.tags||[]).forEach(tag=>{
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tag;
      tagWrap.appendChild(span);
    });

    node.querySelector('.edit').addEventListener('click', () => openModal(t));
    node.querySelector('.resolve').addEventListener('click', () => { updateTicket(t.id, { status:'RESOLVED' }); });
    node.querySelector('.close').addEventListener('click', () => { updateTicket(t.id, { status:'CLOSED' }); });
    node.querySelector('.del').addEventListener('click', () => { delTicket(t.id); });

    el.grid.appendChild(node);
  });
}

function openModal(ticket=null){
  if(ticket){
    el.modalTitle.textContent = 'Edit Ticket';
    el.fields.id.value = ticket.id;
    el.fields.title.value = ticket.title;
    el.fields.description.value = ticket.description || '';
    el.fields.assignee.value = ticket.assignee || '';
    el.fields.priority.value = ticket.priority;
    el.fields.tags.value = (ticket.tags||[]).join(', ');
    el.fields.status.value = ticket.status;
  } else {
    el.modalTitle.textContent = 'New Ticket';
    el.fields.id.value = '';
    el.form.reset();
    el.fields.priority.value = '2';
    el.fields.status.value = 'OPEN';
  }
  el.modal.showModal();
}

function upsertFromForm(){
  const id = el.fields.id.value || ('TKT-' + uid());
  const payload = {
    id,
    title: el.fields.title.value.trim(),
    description: el.fields.description.value.trim(),
    assignee: el.fields.assignee.value.trim(),
    priority: Number(el.fields.priority.value),
    status: el.fields.status.value,
    tags: el.fields.tags.value.split(',').map(s=>s.trim()).filter(Boolean),
    createdAt: el.fields.id.value ? tickets.find(t=>t.id===id).createdAt : now()
  };
  if(!payload.title) { alert('Title is required'); return; }
  const idx = tickets.findIndex(t=>t.id===id);
  if(idx>=0) tickets[idx]=payload; else tickets.unshift(payload);
  save(tickets);
  el.modal.close();
  render();
}

function updateTicket(id, patch){
  const idx = tickets.findIndex(t=>t.id===id);
  if(idx<0) return;
  tickets[idx] = { ...tickets[idx], ...patch };
  save(tickets);
  render();
}
function delTicket(id){
  if(!confirm('Delete ticket ' + id + '?')) return;
  tickets = tickets.filter(t=>t.id!==id);
  save(tickets);
  render();
}

// Events
el.newTicketBtn.addEventListener('click', ()=>openModal(null));
el.form.addEventListener('submit', (e)=>{ e.preventDefault(); upsertFromForm(); });
el.search.addEventListener('input', render);
el.statusFilter.addEventListener('change', render);
el.sortBy.addEventListener('change', render);

render();
