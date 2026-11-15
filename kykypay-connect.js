/* ============================================================
   KykyWorld × KykyPay — connexion avec un compte KykyPay
   À ajouter juste avant </body> de la page KykyWorld :
   <script src="kykypay-connect.js"></script>
   ============================================================ */
(function(){
  /* ====== À RÉGLER : adresse de ton site KykyPay ====== */
  var KYKYPAY_URL = "kykypay.vercel.app";

  var ROOT = "kykypay";
  var firebaseConfig = {
    apiKey: "AIzaSyBPq6Wfxzq02MfK69BFxHm9_FUjDGTmAcw",
    authDomain: "kykychat-24c7f.firebaseapp.com",
    databaseURL: "https://kykychat-24c7f-default-rtdb.firebaseio.com",
    projectId: "kykychat-24c7f",
    storageBucket: "kykychat-24c7f.firebasestorage.app",
    messagingSenderId: "342562811927",
    appId: "1:342562811927:web:0fed1e1f511c4fddcfec52"
  };

  /* ---------- Style (reprend les couleurs de la page) ---------- */
  var css = [
    ".kp-slot{display:flex;align-items:center;gap:.6rem;margin-left:auto}",
    ".kp-btn{background:none;border:1px solid var(--pri,#8b5cf6);color:var(--txt,#efe9fb);font:600 .95rem Oxanium,Inter,sans-serif;padding:.5rem 1.1rem;border-radius:999px;cursor:pointer;transition:.2s}",
    ".kp-btn:hover{background:var(--pri,#8b5cf6);color:#fff}",
    ".kp-pill{display:inline-flex;align-items:center;gap:.55rem;background:linear-gradient(180deg,#24103f,var(--surf,#150c26));border:1px solid var(--line,#2d1b4e);color:#fff;border-radius:999px;padding:.3rem 1rem .3rem .35rem;cursor:pointer;font:800 1rem Oxanium,Inter,sans-serif;font-variant-numeric:tabular-nums;transition:.2s}",
    ".kp-pill:hover{border-color:var(--pri,#8b5cf6);box-shadow:0 0 24px #8b5cf655}",
    ".kp-coin{width:28px;height:28px;border-radius:50%;background:#ffc247;color:#150f35;display:grid;place-items:center;font:800 .95rem Oxanium,sans-serif}",
    ".kp-pill.neg{color:#ff8b9b}",
    ".kp-out{background:none;border:0;color:var(--mut,#a99bc7);font:400 .85rem Inter,sans-serif;cursor:pointer;text-decoration:underline;padding:.3rem}",
    ".kp-out:hover{color:var(--txt,#efe9fb)}",
    ".kp-ov{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:1rem;background:rgba(8,4,20,.75);backdrop-filter:blur(4px)}",
    ".kp-ov.open{display:flex}",
    ".kp-md{width:100%;max-width:24rem;background:var(--surf,#150c26);border:1px solid var(--line,#2d1b4e);border-radius:18px;padding:1.6rem}",
    ".kp-md h3{font:800 1.4rem Oxanium,sans-serif;margin:0 0 .3rem}",
    ".kp-md p{margin:0 0 1.2rem;color:var(--mut,#a99bc7);font-size:.95rem}",
    ".kp-md label{display:block;font-size:.85rem;color:var(--mut,#a99bc7);margin-bottom:1rem}",
    ".kp-md input{width:100%;margin-top:.35rem;background:var(--bg,#0b0614);border:1px solid var(--line,#2d1b4e);color:var(--txt,#efe9fb);border-radius:10px;padding:.7rem .8rem;font:inherit}",
    ".kp-md input:focus{outline:2px solid var(--pri2,#c4b5fd);outline-offset:1px}",
    ".kp-go{width:100%;background:var(--pri,#8b5cf6);color:#fff;border:0;border-radius:12px;padding:.8rem;font:700 1rem Oxanium,sans-serif;cursor:pointer}",
    ".kp-go:disabled{opacity:.55;cursor:wait}",
    ".kp-cancel{width:100%;margin-top:.5rem;background:none;border:0;color:var(--mut,#a99bc7);padding:.5rem;cursor:pointer;font:inherit}",
    ".kp-err{color:#ff8b9b;font-size:.9rem;min-height:1.3rem;margin-bottom:.4rem}"
  ].join("");
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- Interface ---------- */
  var slot = document.createElement("div");
  slot.className = "kp-slot";
  slot.innerHTML = '<button type="button" class="kp-btn" id="kpLogin">Connexion KykyPay</button>';
  var nav = document.querySelector("nav");
  (nav || document.body).appendChild(slot);

  var ov = document.createElement("div");
  ov.className = "kp-ov";
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-modal", "true");
  ov.setAttribute("aria-label", "Connexion KykyPay");
  ov.innerHTML =
    '<div class="kp-md">' +
      '<h3>Connexion KykyPay</h3>' +
      '<p>Utilise ton compte KykyPay pour retrouver ton solde ici.</p>' +
      '<div class="kp-err" id="kpErr"></div>' +
      '<form id="kpForm">' +
        '<label>Adresse email<input type="email" id="kpEmail" required autocomplete="username"></label>' +
        '<label>Mot de passe<input type="password" id="kpPass" required autocomplete="current-password"></label>' +
        '<button class="kp-go" type="submit" id="kpGo">Se connecter</button>' +
      '</form>' +
      '<button type="button" class="kp-cancel" id="kpCancel">Annuler</button>' +
    '</div>';
  document.body.appendChild(ov);

  function $(id){ return document.getElementById(id); }
  function openModal(){ $("kpErr").textContent = ""; ov.classList.add("open"); setTimeout(function(){ $("kpEmail").focus(); }, 30); }
  function closeModal(){ ov.classList.remove("open"); }
  $("kpLogin").addEventListener("click", openModal);
  $("kpCancel").addEventListener("click", closeModal);
  ov.addEventListener("click", function(e){ if (e.target === ov) closeModal(); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeModal(); });

  function fmt(n){
    return new Intl.NumberFormat("fr-FR", {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(Number(n) || 0) + " K";
  }

  function showLoggedOut(){
    slot.innerHTML = '<button type="button" class="kp-btn" id="kpLogin">Connexion KykyPay</button>';
    $("kpLogin").addEventListener("click", openModal);
  }
  function showLoggedIn(){
    slot.innerHTML =
      '<button type="button" class="kp-pill" id="kpPill" title="Ouvrir KykyPay" aria-label="Solde KykyPay, ouvrir KykyPay">' +
        '<span class="kp-coin">K</span><span id="kpBal">…</span>' +
      '</button>' +
      '<button type="button" class="kp-out" id="kpOut">Déconnexion</button>';
    $("kpPill").addEventListener("click", function(){ window.location.href = KYKYPAY_URL; });
    $("kpOut").addEventListener("click", function(){ firebase.auth().signOut(); });
  }

  /* ---------- Chargement de Firebase puis logique ---------- */
  function loadScript(src){
    return new Promise(function(ok, ko){
      var s = document.createElement("script");
      s.src = src; s.onload = ok; s.onerror = function(){ ko(new Error(src)); };
      document.head.appendChild(s);
    });
  }
  var base = "https://www.gstatic.com/firebasejs/10.12.2/";
  loadScript(base + "firebase-app-compat.js")
    .then(function(){ return loadScript(base + "firebase-auth-compat.js"); })
    .then(function(){ return loadScript(base + "firebase-database-compat.js"); })
    .then(start)
    .catch(function(){ /* hors ligne : le bouton reste, la connexion affichera une erreur */
      $("kpGo").disabled = true;
      $("kpErr").textContent = "Impossible de charger la connexion. Recharge la page.";
    });

  function start(){
    firebase.initializeApp(firebaseConfig);
    var auth = firebase.auth(), db = firebase.database();
    var balRef = null;

    var errors = {
      "auth/invalid-email": "Adresse email invalide.",
      "auth/user-not-found": "Aucun compte ne correspond à cet email.",
      "auth/wrong-password": "Mot de passe incorrect.",
      "auth/invalid-credential": "Email ou mot de passe incorrect.",
      "auth/too-many-requests": "Trop de tentatives. Réessaie plus tard.",
      "auth/network-request-failed": "Problème de connexion. Réessaie."
    };

    $("kpForm").addEventListener("submit", function(e){
      e.preventDefault();
      $("kpErr").textContent = "";
      $("kpGo").disabled = true;
      auth.signInWithEmailAndPassword($("kpEmail").value.trim(), $("kpPass").value)
        .then(function(){ $("kpForm").reset(); closeModal(); })
        .catch(function(err){ $("kpErr").textContent = errors[err.code] || "Connexion impossible. Réessaie."; })
        .then(function(){ $("kpGo").disabled = false; });
    });

    auth.onAuthStateChanged(function(user){
      if (balRef){ balRef.off(); balRef = null; }
      if (!user){ showLoggedOut(); return; }

      db.ref(ROOT + "/users/" + user.uid).once("value").then(function(snap){
        var p = snap.val();
        if (!p || p.disabled){
          auth.signOut();
          if (p && p.disabled){ openModal(); $("kpErr").textContent = "Ce compte a été suspendu par un administrateur."; }
          else { openModal(); $("kpErr").textContent = "Ce compte n’est pas un compte KykyPay."; }
          return;
        }
        showLoggedIn();
        balRef = db.ref(ROOT + "/users/" + user.uid + "/solde");
        balRef.on("value", function(s){
          var v = s.val() || 0, pill = $("kpPill"), out = $("kpBal");
          if (!pill || !out) return;
          out.textContent = fmt(v);
          pill.classList.toggle("neg", v < 0);
        });
      });
    });
  }
})();
