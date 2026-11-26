// Entry point: show who is signed in, wire up Sign out, draw the first route
const who = getUser() || "";
document.getElementById("uname").textContent = who;
document.getElementById("av").textContent = who.charAt(0);
document.getElementById("logout").addEventListener("click", () => { clearUser(); location.replace("login.html"); });
render();
