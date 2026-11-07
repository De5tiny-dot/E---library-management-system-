// Shelf E-Library: shared code. Data lives in this browser's localStorage (demo only, no server).
const LOAN_DAYS = 14, KEY = 'shelf_db', SKEY = 'shelf_session';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today = () => new Date().toISOString().slice(0, 10);
const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

function seed() {
  const b = (id, title, author, total) => ({ id, title, author, cover: '', total, avail: total });
  return {
    nextId: 100,
    users: [{ id: 1, name: 'Library Admin', studentId: 'ADMIN', email: 'admin@elibrary.test', password: 'password', role: 'admin', created: today() }],
    books: [b(1,'Things Fall Apart','Chinua Achebe',3), b(2,'Half of a Yellow Sun','Chimamanda Ngozi Adichie',2),
            b(3,'Introduction to Algorithms','Thomas H. Cormen',2), b(4,'Clean Code','Robert C. Martin',1),
            b(5,'A Brief History of Time','Stephen Hawking',2)],
    loans: []
  };
}
let db;
try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
if (!db) { db = seed(); save(); }
function save() { localStorage.setItem(KEY, JSON.stringify(db)); }
const me = () => db.users.find(u => String(u.id) === localStorage.getItem(SKEY)) || null;
function requireLogin(role) {
  const u = me();
  if (!u || (role && u.role !== role)) { location.href = 'login.html'; return null; }
  return u;
}
function flash(msg) { sessionStorage.setItem('flash', msg); }
function takeFlash() { const m = sessionStorage.getItem('flash') || ''; sessionStorage.removeItem('flash'); return m; }
function cover(b) {
  if (b.cover) return `<img class="cover" src="${esc(b.cover)}" alt="Cover of ${esc(b.title)}">`;
  return `<div class="cover" style="--h:${(b.id * 47) % 360}"><span>${esc(b.title.charAt(0))}</span></div>`;
}
function returnBook(loanId, userId) {
  const l = db.loans.find(x => x.id === loanId && !x.returned && (!userId || x.userId === userId));
  if (!l) return false;
  l.returned = today();
  db.books.find(b => b.id === l.bookId).avail++;
  save(); return true;
}
function layout() {
  const u = me();
  const nav = `<a href="index.html">Home</a><a href="books.html">Books</a>` + (u
    ? `<a href="${u.role === 'admin' ? 'admin.html' : 'dashboard.html'}">${u.role === 'admin' ? 'Admin' : 'My books'}</a><a href="#" id="logout">Log out</a>`
    : `<a href="login.html">Log in</a><a class="btn small" href="register.html">Register</a>`);
  document.getElementById('hdr').innerHTML = `<a class="brand" href="index.html">Shelf<span>E-Library</span></a><nav>${nav}</nav>`;
  document.getElementById('ftr').innerHTML = `<p>Shelf E-Library &middot; Borrow for ${LOAN_DAYS} days, return when you're done.</p><p>Questions? Ask the librarian at the front desk.</p>`;
  const lo = document.getElementById('logout');
  if (lo) lo.onclick = e => { e.preventDefault(); localStorage.removeItem(SKEY); location.href = 'index.html'; };
}
