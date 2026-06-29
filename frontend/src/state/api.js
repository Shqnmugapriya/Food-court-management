const BACKEND_URL = 'http://localhost:8080';
const WS_URL = 'ws://localhost:8080/ws-sync';

export function getCurrentUser() {
  const user = sessionStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

export async function loginUser(email, password) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem('currentUser', JSON.stringify(data.user));
      sessionStorage.setItem('token', data.token);
    }
    return data;
  } catch (e) {
    return { success: false, message: 'Server connection failed.' };
  }
}

export async function registerUser(username, email, password, role) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Registration failed.' };
  }
}

export function logoutUser() {
  sessionStorage.removeItem('currentUser');
  sessionStorage.removeItem('token');
}

export async function claimDailyCheckin(email) {
  const res = await fetch(`${BACKEND_URL}/api/auth/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (res.ok) {
    const user = await res.json();
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }
  throw new Error('Checkin failed');
}

// Unified Database Sync Fetcher
export async function fetchDatabase() {
  try {
    const [foods, categories, inventory, orders, roster, wasteLog, coupons, auditLogs, users] = await Promise.all([
      fetch(`${BACKEND_URL}/api/foods`).then(r => r.json()),
      fetch(`${BACKEND_URL}/api/foods/categories`).then(r => r.json()),
      fetch(`${BACKEND_URL}/api/foods/inventory`).then(r => r.json()),
      fetch(`${BACKEND_URL}/api/orders`).then(r => r.json()),
      fetch(`${BACKEND_URL}/api/admin/roster`).then(r => r.json()),
      fetch(`${BACKEND_URL}/api/admin/waste-logs`).then(r => r.json()),
      fetch(`${BACKEND_URL}/api/admin/coupons`).then(r => r.json()),
      fetch(`${BACKEND_URL}/api/admin/audit-logs`).then(r => r.json()),
      fetch(`${BACKEND_URL}/api/auth/ranking`).then(r => r.json())
    ]);

    return { foods, categories, inventory, orders, roster, wasteLog, coupons, auditLogs, allUsers: users };
  } catch (e) {
    console.error('Error fetching database:', e);
    return null;
  }
}

// REST CRUD Operations
export async function checkoutOrder(order) {
  const res = await fetch(`${BACKEND_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
  return await res.json();
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return await res.json();
}

export async function updateInventoryStock(itemId, stock) {
  const res = await fetch(`${BACKEND_URL}/api/foods/inventory/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock })
  });
  return await res.json();
}

export async function saveShiftRoster(roster) {
  const res = await fetch(`${BACKEND_URL}/api/admin/roster`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roster)
  });
  return await res.json();
}

export async function deleteShiftRoster(id) {
  await fetch(`${BACKEND_URL}/api/admin/roster/${id}`, { method: 'DELETE' });
}

export async function saveWasteLog(log) {
  const res = await fetch(`${BACKEND_URL}/api/admin/waste-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log)
  });
  return await res.json();
}

export async function saveCoupon(coupon) {
  const res = await fetch(`${BACKEND_URL}/api/admin/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coupon)
  });
  return await res.json();
}

export async function saveCategory(name) {
  const res = await fetch(`${BACKEND_URL}/api/foods/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return await res.json();
}

export async function deleteCategory(name) {
  await fetch(`${BACKEND_URL}/api/foods/categories/${name}`, { method: 'DELETE' });
}

export async function saveFoodItem(food) {
  const method = food.id && !food.id.startsWith('f-') ? 'PUT' : 'POST';
  const url = method === 'PUT' ? `${BACKEND_URL}/api/foods/${food.id}` : `${BACKEND_URL}/api/foods`;
  
  const res = await fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(food)
  });
  return await res.json();
}

export async function deleteFoodItem(id) {
  await fetch(`${BACKEND_URL}/api/foods/${id}`, { method: 'DELETE' });
}

// WebSocket connection
let ws = null;
export function subscribeToUpdates(onUpdate) {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  function connect() {
    ws = new WebSocket(WS_URL);
    
    ws.onmessage = (event) => {
      if (event.data === 'reload') {
        onUpdate();
      }
    };

    ws.onclose = () => {
      // Auto-reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      ws.close();
    };
  }

  connect();
}
