// Interactive bulb with rope dark mode toggle
document.addEventListener('DOMContentLoaded', function() {
  const bulbToggle = document.getElementById('bulb-toggle');
  const bulbSvg = document.getElementById('bulb-svg');
  const bulbCord = document.getElementById('bulb-cord');
  const bulbCordKnob = document.getElementById('bulb-cord-knob');
  let dragging = false;
  let dragStart = {x: 0, y: 0};
  let dragEnd = {x: 0, y: 0};
  let isLit = !document.body.classList.contains('login-dark');

  function setLoginTheme(light) {
    if (light) {
      document.body.classList.remove('login-dark');
      localStorage.setItem('login-theme', 'light');
      bulbToggle.classList.add('lit');
    } else {
      document.body.classList.add('login-dark');
      localStorage.setItem('login-theme', 'dark');
      bulbToggle.classList.remove('lit');
    }
    isLit = light;
  }

  // Set initial theme
  const saved = localStorage.getItem('login-theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    setLoginTheme(false);
  } else {
    setLoginTheme(true);
  }

  function getSvgCoords(e) {
    const rect = bulbSvg.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function onDragStart(e) {
    e.preventDefault();
    dragging = true;
    bulbToggle.classList.add('dragging');
    const coords = getSvgCoords(e);
    dragStart = coords;
    dragEnd = coords;
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove);
    document.addEventListener('touchend', onDragEnd);
  }

  // Rope physics state
  let rope = {
    x: 30,
    y: 88,
    vx: 0,
    vy: 0,
    restX: 30,
    restY: 88,
    dragging: false
  };

  function onDragMove(e) {
    if (!dragging) return;
    dragEnd = getSvgCoords(e);
    // Allow rope to extend up to 2.2x its rest length for elastic effect
    const dx = dragEnd.x - 30;
    const dy = dragEnd.y - 50;
    let dist = Math.sqrt(dx*dx + dy*dy);
    let restLen = 38;
    let maxLen = restLen * 2.2; // allow extension
    let len = Math.min(dist, maxLen);
    let x2 = 30 + (dx/dist)*len;
    let y2 = 50 + (dy/dist)*len;
    // Clamp y2 to not go above the bulb
    y2 = Math.max(50, y2);
    if (isNaN(x2) || isNaN(y2)) { x2 = 30; y2 = 88; }
    bulbCord.setAttribute('x2', x2);
    bulbCord.setAttribute('y2', y2);
    bulbCordKnob.setAttribute('cx', x2);
    bulbCordKnob.setAttribute('cy', y2);
    // Update rope state for physics
    rope.x = x2;
    rope.y = y2;
    rope.vx = 0;
    rope.vy = 0;
    rope.dragging = true;
  }

  function onDragEnd(e) {
    if (!dragging) return;
    dragging = false;
    bulbToggle.classList.remove('dragging');
    rope.dragging = false;
    // Toggle theme
    setLoginTheme(!isLit);
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
  }

  // Animate rope with elasticity and gravity
  function animateRope() {
    if (!rope.dragging) {
      // Spring force toward rest
      let dx = rope.restX - rope.x;
      let dy = rope.restY - rope.y;
      let spring = 0.08;
      let gravity = 0.7;
      let friction = 0.85;
      rope.vx += dx * spring;
      rope.vy += dy * spring + gravity;
      rope.vx *= friction;
      rope.vy *= friction;
      rope.x += rope.vx;
      rope.y += rope.vy;
      // Clamp to max rope length
      let dx2 = rope.x - 30;
      let dy2 = rope.y - 50;
      let dist = Math.sqrt(dx2*dx2 + dy2*dy2);
      let maxLen = 50;
      if (dist > maxLen) {
        let ratio = maxLen / dist;
        rope.x = 30 + dx2 * ratio;
        rope.y = 50 + dy2 * ratio;
        rope.vx *= 0.7;
        rope.vy *= 0.7;
      }
      // Clamp y to not go above bulb
      rope.y = Math.max(50, Math.min(rope.y, 88));
      if (isNaN(rope.x) || isNaN(rope.y)) {
        rope.x = 30;
        rope.y = 88;
      }
      bulbCord.setAttribute('x2', rope.x);
      bulbCord.setAttribute('y2', rope.y);
      bulbCordKnob.setAttribute('cx', rope.x);
      bulbCordKnob.setAttribute('cy', rope.y);
    }
    requestAnimationFrame(animateRope);
  }
  animateRope();

  if (bulbCordKnob) {
    bulbCordKnob.addEventListener('mousedown', onDragStart);
    bulbCordKnob.addEventListener('touchstart', onDragStart);
  }
});
// Bulb dark mode visual sync
document.addEventListener('DOMContentLoaded', function() {
  const bulbToggle = document.getElementById('bulb-toggle');
  function updateBulbLitClass() {
    if (document.body.classList.contains('login-dark')) {
      bulbToggle.classList.remove('lit');
    } else {
      bulbToggle.classList.add('lit');
    }
  }
  updateBulbLitClass();
  // Listen for theme changes (if toggled elsewhere)
  const observer = new MutationObserver(updateBulbLitClass);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
});
// Floating cash with wings follows cursor with very strong lag
document.addEventListener('DOMContentLoaded', function() {
  const cashFollower = document.getElementById('cash-follower');
  if (cashFollower) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;
    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    function animateFollower() {
      // Very strong lag: move only 2% of the way each frame
      followerX += (mouseX - followerX) * 0.02;
      followerY += (mouseY - followerY) * 0.02;
      cashFollower.style.left = followerX + 'px';
      cashFollower.style.top = followerY + 'px';
      requestAnimationFrame(animateFollower);
    }
    animateFollower();
  }
});
// Interactive bulb with rope dark mode toggle
document.addEventListener('DOMContentLoaded', function() {
  const bulbToggle = document.getElementById('bulb-toggle');
  const bulbSvg = document.getElementById('bulb-svg');
  const bulbCord = document.getElementById('bulb-cord');
  const bulbBody = document.getElementById('bulb-body');
  let dragging = false;
  let dragStart = {x: 0, y: 0};
  let dragEnd = {x: 0, y: 0};
  let isLit = false;

  function setLoginTheme(light) {
    if (light) {
      document.body.classList.remove('login-dark');
      localStorage.setItem('login-theme', 'light');
      bulbToggle.classList.add('lit');
    } else {
      document.body.classList.add('login-dark');
      localStorage.setItem('login-theme', 'dark');
      bulbToggle.classList.remove('lit');
    }
    isLit = light;
  }

  // Set initial theme
  const saved = localStorage.getItem('login-theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    setLoginTheme(false);
  } else {
    setLoginTheme(true);
  }

  function getSvgCoords(e) {
    const rect = bulbSvg.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function onDragStart(e) {
    e.preventDefault();
    dragging = true;
    bulbToggle.classList.add('dragging');
    const coords = getSvgCoords(e);
    dragStart = coords;
    dragEnd = coords;
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove);
    document.addEventListener('touchend', onDragEnd);
  }

  function onDragMove(e) {
    if (!dragging) return;
    dragEnd = getSvgCoords(e);
    // Limit cord length
    const dx = dragEnd.x - 30;
    const dy = dragEnd.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    let maxLen = 60;
    let x2 = 30 + (dx/dist)*Math.min(dist, maxLen);
    let y2 = Math.max(40, Math.min(40 + (dy/dist)*Math.min(dist, maxLen), 80));
    if (isNaN(x2) || isNaN(y2)) { x2 = 30; y2 = 40; }
    bulbCord.setAttribute('x2', x2);
    bulbCord.setAttribute('y2', y2);
  }

  function onDragEnd(e) {
    if (!dragging) return;
    dragging = false;
    bulbToggle.classList.remove('dragging');
    // Animate cord back
    bulbCord.setAttribute('x2', 30);
    bulbCord.setAttribute('y2', 40);
    // Toggle theme
    setLoginTheme(!isLit);
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
  }

  if (bulbCord) {
    bulbCord.addEventListener('mousedown', onDragStart);
    bulbCord.addEventListener('touchstart', onDragStart);
  }
});
// Auth handling: signup / signin using localStorage
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('login-form');
  const errorDiv = document.getElementById('login-error');
  const toggleToSignup = document.getElementById('toggle-to-signup');
  const toggleToSignin = document.getElementById('toggle-to-signin');
  const fullnameGroup = document.getElementById('fullname-group');
  const confirmGroup = document.getElementById('confirm-group');
  const authTitle = document.getElementById('auth-title');
  const authSubmit = document.getElementById('auth-submit');
  const authModeInput = document.getElementById('auth-mode');

  function getUsers() {
    try { return JSON.parse(localStorage.getItem('users') || '[]'); } catch (e) { return []; }
  }
  function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }
  function findUser(email) {
    if (!email) return null;
    return getUsers().find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  }
  function setLoggedIn(email) {
    localStorage.setItem('loggedInUser', email);
  }

  // If already logged in, redirect to index
  if (localStorage.getItem('loggedInUser')) {
    try {
      const path = location.pathname.toLowerCase();
      if (path.endsWith('login.html') || path === '/' || path.endsWith('index.html')) {
        location.href = 'index.html';
      }
    } catch (e) { /* ignore */ }
  }

  // Toggle UI
  toggleToSignup && toggleToSignup.addEventListener('click', function(e) {
    e.preventDefault();
    authModeInput.value = 'signup';
    fullnameGroup.style.display = '';
    confirmGroup.style.display = '';
    toggleToSignup.style.display = 'none';
    toggleToSignin.style.display = '';
    authTitle.textContent = 'Create Account';
    authSubmit.textContent = 'Sign Up';
    errorDiv.style.display = 'none';
  });
  toggleToSignin && toggleToSignin.addEventListener('click', function(e) {
    e.preventDefault();
    authModeInput.value = 'signin';
    fullnameGroup.style.display = 'none';
    confirmGroup.style.display = 'none';
    toggleToSignup.style.display = '';
    toggleToSignin.style.display = 'none';
    authTitle.textContent = 'Sign In';
    authSubmit.textContent = 'Login';
    errorDiv.style.display = 'none';
  });

  form && form.addEventListener('submit', function(e) {
    e.preventDefault();
    errorDiv.style.display = 'none';
    const mode = (authModeInput && authModeInput.value) || 'signin';
    const email = (document.getElementById('username').value || '').trim();
    const password = document.getElementById('password').value || '';
    if (!email || !password) {
      errorDiv.textContent = 'Please enter email and password.';
      errorDiv.style.display = 'block';
      return;
    }
    if (mode === 'signup') {
      const fullname = (document.getElementById('fullname').value || '').trim();
      const passwordConfirm = document.getElementById('password-confirm').value || '';
      if (!fullname) { errorDiv.textContent = 'Please enter your full name.'; errorDiv.style.display = 'block'; return; }
      if (password !== passwordConfirm) { errorDiv.textContent = 'Passwords do not match.'; errorDiv.style.display = 'block'; return; }
      if (findUser(email)) { errorDiv.textContent = 'An account with this email already exists.'; errorDiv.style.display = 'block'; return; }
      const users = getUsers();
      users.push({ id: 'u_' + Date.now(), email: email, name: fullname, password: password });
      saveUsers(users);
      setLoggedIn(email);
      location.href = 'index.html';
    } else {
      const user = findUser(email);
      if (!user || user.password !== password) {
        errorDiv.textContent = 'Invalid email or password.';
        errorDiv.style.display = 'block';
        return;
      }
      setLoggedIn(email);
      location.href = 'index.html';
    }
  });

});
