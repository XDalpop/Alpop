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

  login(username, password) {
    const users = this._getUsers();
    const trimmedUser = username.trim().toLowerCase();
    if (!trimmedUser || !password) return { ok: false, error: 'يرجى إدخال اسم المستخدم وكلمة المرور.' };

    if (users[trimmedUser]) {
      if (users[trimmedUser] !== password) {
        return { ok: false, error: 'كلمة المرور غير صحيحة.' };
      }
    } else {
      users[trimmedUser] = password;
      this._saveUsers(users);
    }

    this._setSession({ username: trimmedUser });
    Store.setUsername(trimmedUser);
    return { ok: true };
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
