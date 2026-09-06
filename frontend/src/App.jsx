import { useEffect, useState } from 'react'
import './App.css'

const apiUrl = 'http://localhost:5000/api'
const emptyAuth = { name: '', email: '', password: '' }
const emptyMenu = { name: '', category: '', price: '' }
const formatDate = (value) => new Date(value).toLocaleString('en-IN')

function AuthPage({ onLogin }) {
  const [registerMode, setRegisterMode] = useState(false)
  const [form, setForm] = useState(emptyAuth)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    const endpoint = registerMode ? 'register' : 'login'
    const body = registerMode ? form : { email: form.email, password: form.password }
    const response = await fetch(`${apiUrl}/auth/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await response.json()
    setError(!response.ok)
    setMessage(data.message)
    if (response.ok) { setForm(emptyAuth); if (!registerMode) onLogin() }
  }

  const changeMode = (mode) => { setRegisterMode(mode); setForm(emptyAuth); setMessage('') }

  return <main className="auth-page"><section className="auth-card">
    <div className="brand"><span className="brand-icon">A</span><div><h1>Anant Resto</h1><p>Restaurant Management System</p></div></div>
    <div className="tabs"><button className={!registerMode ? 'active' : ''} onClick={() => changeMode(false)}>Login</button><button className={registerMode ? 'active' : ''} onClick={() => changeMode(true)}>Register</button></div>
    <h2>{registerMode ? 'Create account' : 'Welcome back'}</h2><p className="intro">{registerMode ? 'Register once to use the system.' : 'Login to manage your restaurant.'}</p>
    <form onSubmit={submit}>
      {registerMode && <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter your name" required /></label>}
      <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter your email" required /></label>
      <label>Password<input type="password" minLength="4" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 4 characters" required /></label>
      {message && <p className={error ? 'message error' : 'message success'}>{message}</p>}
      <button className="primary-button" type="submit">{registerMode ? 'Register' : 'Login'}</button>
    </form>
  </section></main>
}

function MenuPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyMenu)
  const [message, setMessage] = useState('')
  const loadItems = async () => { const response = await fetch(`${apiUrl}/menu`); setItems(await response.json()) }
  useEffect(() => { loadItems() }, [])
  const addItem = async (event) => {
    event.preventDefault()
    const response = await fetch(`${apiUrl}/menu`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await response.json()
    if (response.ok) { setForm(emptyMenu); setMessage('Menu item added successfully.'); loadItems() } else setMessage(data.message)
  }
  const deleteItem = async (id) => { await fetch(`${apiUrl}/menu/${id}`, { method: 'DELETE' }); setMessage('Menu item deleted.'); loadItems() }
  return <section className="page-content"><h2>Menu Management</h2><p className="page-note">Add food items that can later be selected while creating an order.</p>
    <div className="two-column"><form className="simple-form" onSubmit={addItem}><h3>Add Menu Item</h3>
      <label>Food Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Example: Paneer Tikka" required /></label>
      <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Example: Main Course" required /></label>
      <label>Price (₹)<input type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Example: 180" required /></label>
      <button className="primary-button" type="submit">Add Item</button>{message && <p className="small-message">{message}</p>}
    </form>
    <div className="list-box"><h3>Menu Items</h3>{items.length === 0 ? <p className="empty">No menu item added yet.</p> : <table><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Action</th></tr></thead><tbody>{items.map((item) => <tr key={item._id}><td>{item.name}</td><td>{item.category}</td><td>₹{item.price}</td><td><button className="delete-button" onClick={() => deleteItem(item._id)}>Delete</button></td></tr>)}</tbody></table>}</div>
    </div>
  </section>
}

function TablesPage() {
  const [tables, setTables] = useState([])
  const loadTables = async () => { const response = await fetch(`${apiUrl}/tables`); setTables(await response.json()) }
  useEffect(() => { loadTables() }, [])
  const changeStatus = async (table) => { const status = table.status === 'Available' ? 'Occupied' : 'Available'; await fetch(`${apiUrl}/tables/${table._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); loadTables() }
  return <section className="page-content"><h2>Table Status</h2><p className="page-note">Click a table button to change its status. A placed order automatically marks its table as occupied.</p>
    <div className="table-grid">{tables.map((table) => <article className={`table-card ${table.status.toLowerCase()}`} key={table._id}><h3>Table {table.tableNumber}</h3><p>{table.status}</p><button className={table.status === 'Available' ? 'occupied-button' : 'available-button'} onClick={() => changeStatus(table)}>Mark {table.status === 'Available' ? 'Occupied' : 'Available'}</button></article>)}</div>
  </section>
}

function OrderPage() {
  const [menuItems, setMenuItems] = useState([])
  const [tables, setTables] = useState([])
  const [orders, setOrders] = useState([])
  const [tableId, setTableId] = useState('')
  const [selectedItemId, setSelectedItemId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState([])
  const [message, setMessage] = useState('')
  const loadData = async () => {
    const [menuResponse, tableResponse, orderResponse] = await Promise.all([fetch(`${apiUrl}/menu`), fetch(`${apiUrl}/tables`), fetch(`${apiUrl}/orders`)])
    setMenuItems(await menuResponse.json()); setTables(await tableResponse.json()); setOrders(await orderResponse.json())
  }
  useEffect(() => { loadData() }, [])
  const addToCart = () => {
    const item = menuItems.find((menuItem) => menuItem._id === selectedItemId)
    if (!item) return setMessage('Select a food item first.')
    const itemQuantity = Number(quantity)
    if (itemQuantity < 1) return setMessage('Quantity must be at least 1.')
    const existing = cart.find((cartItem) => cartItem.menuItemId === item._id)
    if (existing) setCart(cart.map((cartItem) => cartItem.menuItemId === item._id ? { ...cartItem, quantity: cartItem.quantity + itemQuantity } : cartItem))
    else setCart([...cart, { menuItemId: item._id, name: item.name, price: item.price, quantity: itemQuantity }])
    setSelectedItemId(''); setQuantity(1); setMessage('')
  }
  const removeFromCart = (id) => setCart(cart.filter((item) => item.menuItemId !== id))
  const orderTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const placeOrder = async () => {
    const response = await fetch(`${apiUrl}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tableId, items: cart.map(({ menuItemId, quantity: itemQuantity }) => ({ menuItemId, quantity: itemQuantity })) }) })
    const data = await response.json()
    if (response.ok) { setMessage(`Order ${data.orderNumber} placed successfully.`); setTableId(''); setCart([]); loadData() } else setMessage(data.message)
  }
  const updateStatus = async (id, status) => { await fetch(`${apiUrl}/orders/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); loadData() }
  const availableTables = tables.filter((table) => table.status === 'Available')
  return <section className="page-content"><h2>Order Management</h2><p className="page-note">Create a simple order by choosing one available table and food items from the menu.</p>
    <div className="two-column order-columns"><div className="simple-form order-form"><h3>New Order</h3>
      <label>Available Table<select value={tableId} onChange={(e) => setTableId(e.target.value)} required><option value="">Select table</option>{availableTables.map((table) => <option key={table._id} value={table._id}>Table {table.tableNumber}</option>)}</select></label>
      <label>Food Item<select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)}><option value="">Select food item</option>{menuItems.map((item) => <option key={item._id} value={item._id}>{item.name} — ₹{item.price}</option>)}</select></label>
      <label>Quantity<input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
      <button className="secondary-button" onClick={addToCart} type="button">Add to Order</button>
      {message && <p className="small-message">{message}</p>}
    </div><div className="list-box"><h3>Current Order</h3>{cart.length === 0 ? <p className="empty">No food item selected yet.</p> : <><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th><th></th></tr></thead><tbody>{cart.map((item) => <tr key={item.menuItemId}><td>{item.name}</td><td>{item.quantity}</td><td>₹{item.price}</td><td>₹{item.price * item.quantity}</td><td><button className="delete-button" onClick={() => removeFromCart(item.menuItemId)}>Remove</button></td></tr>)}</tbody></table><div className="total-line"><strong>Total</strong><strong>₹{orderTotal}</strong></div><button className="primary-button" onClick={placeOrder} type="button">Place Order</button></>}</div></div>
    <div className="list-box orders-list"><h3>Existing Orders</h3>{orders.length === 0 ? <p className="empty">No order placed yet.</p> : <table><thead><tr><th>Order ID</th><th>Table</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td>{order.orderNumber}</td><td>{order.tableId?.tableNumber || '-'}</td><td>{order.items.map((item) => `${item.name} × ${item.quantity} (₹${item.price}, sub: ₹${item.subtotal})`).join(', ')}</td><td>₹{order.totalAmount}</td><td>{order.billed ? 'Billed' : <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}><option>Pending</option><option>Completed</option></select>}</td></tr>)}</tbody></table>}</div>
  </section>
}

function BillingPage() {
  const [orders, setOrders] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [message, setMessage] = useState('')
  const loadOrders = async () => { const response = await fetch(`${apiUrl}/orders`); const data = await response.json(); setOrders(data.filter((order) => !order.billed)) }
  useEffect(() => { loadOrders() }, [])
  const order = orders.find((item) => item._id === selectedOrderId)
  const gst = order ? Number((order.totalAmount * 0.05).toFixed(2)) : 0
  const grandTotal = order ? order.totalAmount + gst : 0
  const finishBill = async () => {
    const response = await fetch(`${apiUrl}/orders/${order._id}/bill`, { method: 'PATCH' })
    const data = await response.json(); setMessage(data.message)
    if (response.ok) { setSelectedOrderId(''); loadOrders() }
  }
  return <section className="page-content"><h2>Billing & Receipt</h2><p className="page-note">Select a completed order to generate a simple receipt. GST is fixed at 5% for this project.</p>
    <div className="bill-select"><label>Select Order<select value={selectedOrderId} onChange={(e) => { setSelectedOrderId(e.target.value); setMessage('') }}><option value="">Select completed order</option>{orders.filter((item) => item.status === 'Completed').map((item) => <option key={item._id} value={item._id}>{item.orderNumber} — Table {item.tableId?.tableNumber}</option>)}</select></label></div>
    {order && <article className="receipt"><div className="receipt-head"><div><h2>Anant Resto</h2><p>Restaurant Management System</p></div><div><strong>Receipt</strong><p>{formatDate(order.createdAt)}</p></div></div><div className="receipt-info"><span><strong>Bill / Order No:</strong> {order.orderNumber}</span><span><strong>Table No:</strong> {order.tableId?.tableNumber}</span></div><table><thead><tr><th>Food Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.menuItemId}><td>{item.name}</td><td>{item.quantity}</td><td>₹{item.price}</td><td>₹{item.subtotal}</td></tr>)}</tbody></table><div className="bill-totals"><p>Subtotal <strong>₹{order.totalAmount}</strong></p><p>GST (5%) <strong>₹{gst.toFixed(2)}</strong></p><p className="grand-total">Grand Total <strong>₹{grandTotal.toFixed(2)}</strong></p></div><div className="receipt-actions"><button className="secondary-button" onClick={() => window.print()}>Print Receipt</button><button className="primary-button" onClick={finishBill}>Finish Bill & Free Table</button></div>{message && <p className="small-message">{message}</p>}</article>}
  </section>
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [page, setPage] = useState('menu')
  if (!loggedIn) return <AuthPage onLogin={() => setLoggedIn(true)} />
  const pages = { menu: <MenuPage />, tables: <TablesPage />, orders: <OrderPage />, billing: <BillingPage /> }
  return <main className="app-shell"><header><div className="brand"><span className="brand-icon">A</span><strong>Anant Resto</strong></div><nav>{[['menu', 'Menu'], ['tables', 'Tables'], ['orders', 'Orders'], ['billing', 'Billing']].map(([id, label]) => <button className={page === id ? 'selected' : ''} onClick={() => setPage(id)} key={id}>{label}</button>)}</nav><button className="logout-button" onClick={() => setLoggedIn(false)}>Logout</button></header>{pages[page]}</main>
}

export default App
