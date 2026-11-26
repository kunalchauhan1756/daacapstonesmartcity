// Demo login for the offline version. This check runs in the browser, so it only
// keeps casual visitors out. For real security use the Flask version (password is checked on the server).
const CREDENTIALS = { username: "admin", password: "smartcity123" };
function getUser() { try { return sessionStorage.getItem("user"); } catch (e) { return null; } }
function setUser(name) { try { sessionStorage.setItem("user", name); } catch (e) {} }
function clearUser() { try { sessionStorage.removeItem("user"); } catch (e) {} }
