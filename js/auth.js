const USERS_KEY = 'tradevault_users';
const SESSION_KEY = 'tradevault_session';

const Auth = {
  _getUsers() {
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  _saveUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  },

  _getSession() {
    try {
      const data = sessionStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  _setSession(session) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  },

  _clearSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  },

  _isValidGmail(email) {
    return /^[^\s@]+@gmail\.com$/i.test(email);
  },

  login(email, password) {
    const e = email.trim().toLowerCase();
    if (!e || !password) return { ok: false, error: 'Please enter email and password.' };
    if (!this._isValidGmail(e)) return { ok: false, error: 'Please use a valid @gmail.com address.' };

    const users = this._getUsers();
    if (!users[e]) return { ok: false, error: 'No account found with this email. Please register first.' };

    if (users[e].password !== password) return { ok: false, error: 'Incorrect password.' };

    this._setSession({ email: e, username: users[e].username });
    Store.setUsername(users[e].username);
    return { ok: true, username: users[e].username };
  },

  register(username, email, password, phone) {
    const e = email.trim().toLowerCase();
    const u = username.trim();

    if (!u || !e || !password) return { ok: false, error: 'All fields are required.' };
    if (u.length < 3) return { ok: false, error: 'Username must be at least 3 characters.' };
    if (!this._isValidGmail(e)) return { ok: false, error: 'Please use a valid @gmail.com address.' };
    if (password.length < 4) return { ok: false, error: 'Password must be at least 4 characters.' };

    const users = this._getUsers();
    if (users[e]) return { ok: false, error: 'An account with this email already exists. Please sign in.' };

    const duplicate = Object.values(users).some(u2 => u2.username === u);
    if (duplicate) return { ok: false, error: 'This username is already taken.' };

    users[e] = { username: u, email: e, password, phone: phone || '', createdAt: new Date().toISOString() };
    this._saveUsers(users);

    this._setSession({ email: e, username: u });
    Store.setUsername(u);
    return { ok: true, username: u };
  },

  logout() {
    this._clearSession();
  },

  isLoggedIn() {
    return !!this._getSession();
  },

  getCurrentUser() {
    const session = this._getSession();
    return session ? session.username : null;
  }
};
