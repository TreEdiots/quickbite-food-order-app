import { useState, useEffect } from "react";
import "./App.css";

const menuItems = [
  { id: 1, name: "Classic Burger", category: "Burgers", price: 149, image: "./images/burger.png" },
  { id: 2, name: "Margherita Pizza", category: "Pizza", price: 249, image: "./images/pizza.png" },
  { id: 3, name: "Crispy French Fries", category: "Sides", price: 99, image: "./images/fries.png" },
  { id: 4, name: "Chicken Sandwich", category: "Sandwiches", price: 179, image: "./images/sandwich.png" },
  { id: 5, name: "Chocolate Milkshake", category: "Drinks", price: 129, image: "./images/milkshake.png" },
  { id: 6, name: "Fresh Salad", category: "Healthy", price: 159, image: "./images/salad.png" },
];

const orderStatusMap = {
  1: "Order Received",
  2: "Preparing",
  3: "Out for Delivery",
  4: "Delivered",
};

function App() {
  const [cart, setCart] = useState([]);

  const [customer, setCustomer] = useState({
    customer_name: "",
    address: "",
    phone: "",
  });

  const [orderMessage, setOrderMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);


  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);


  const [lastOrderId, setLastOrderId] = useState(null);

  const trackOrder = async (event) => {
    event.preventDefault();

    setTrackedOrder(null);
    setTrackingError("");

    // Validate Order ID before calling the API
    if (
      !trackOrderId.trim() ||
      !/^\d+$/.test(trackOrderId.trim()) ||
      Number(trackOrderId) <= 0
    ) {
      setTrackingError("Please enter a valid order ID");
      return;
    }

    try {
      setTrackingLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/orders/${trackOrderId.trim()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order not found");
      }

      setTrackedOrder(data.order);
    } catch (error) {
      setTrackingError(error.message || "Unable to fetch order.");
    } finally {
      setTrackingLoading(false);
    }
  };

  const addToCart = (item) => {
    setOrderMessage("");
    setCart((currentCart) => {
      const existing = currentCart.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existing) {
        return currentCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...currentCart, { ...item, quantity: 1 }];
    });
  };

  const changeQuantity = (id, amount) => {
    setOrderMessage("");

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const placeOrder = async (event) => {
    event.preventDefault();
    setOrderMessage("");
    setMessageType("");

    if (cart.length === 0) {
      setOrderMessage("Please add at least one item to your cart.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...customer,
            items: cart.map((item) => ({
              item_name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to place order");
      }


      setLastOrderId(data.order.id);
      setTrackOrderId(String(data.order.id));
      setTrackedOrder(data.order);
      setOrderMessage(
        `Order placed successfully! Order ID: ${data.order.id}`
      );
      setMessageType("success");


      setCart([]);
      setCustomer({
        customer_name: "",
        address: "",
        phone: "",
      });
    } catch (error) {
      setOrderMessage(
        error.message || "Unable to connect to the server."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!trackedOrder?.id) return;

    const refreshOrderStatus = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/orders/${trackedOrder.id}`
        );

        if (!response.ok) return;

        const data = await response.json();

        if (data.order) {
          setTrackedOrder(data.order);
        }
      } catch (error) {
        console.error("Status refresh failed:", error);
      }
    };

    const timer = setInterval(refreshOrderStatus, 500);

    return () => clearInterval(timer);
  }, [trackedOrder?.id]);


  useEffect(() => {
    if (!trackedOrder?.id || !trackedOrder?.created_at) return;

    const updateCountdown = () => {
      const createdAt = new Date(
        trackedOrder.created_at
      ).getTime();

      const elapsed = Math.max(
        0,
        Math.floor((Date.now() - createdAt) / 1000)
      );

      const nextChange = [5, 10, 15].find(
        (seconds) => elapsed < seconds
      );

      setRemainingSeconds(
        nextChange === undefined ? 0 : nextChange - elapsed
      );
    };

    updateCountdown();

    const timer = setInterval(updateCountdown, 500);

    return () => clearInterval(timer);
  }, [trackedOrder?.id, trackedOrder?.created_at]);

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#">
          🍽️ QuickBite
        </a>

        <span className="cart-count">
          Cart · {cart.reduce((n, item) => n + item.quantity, 0)}
        </span>
      </header>

      <main className="content">
        <section className="hero">
          <div>
            <p className="eyebrow">FRESH · FAST · DELICIOUS</p>
            <h1>
              Good food,
              <br />
              good mood.
            </h1>
            <p className="hero-description">
              Your favourites, freshly prepared and delivered to your door.
            </p>
          </div>

          <div className="hero-emoji" aria-hidden="true">
            🍕
          </div>
        </section>

        <div className="section-heading">
          <div>
            <p className="eyebrow">OUR MENU</p>
            <h2>Explore popular dishes</h2>
          </div>

          <span className="item-count">{menuItems.length} items</span>
        </div>

        <div className="layout">
          <section className="menu-grid" aria-label="Food menu">
            {menuItems.map((item) => (
              <article className="food-card" key={item.id}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="food-image"
                />

                <div className="food-info">
                  <span className="category">{item.category}</span>
                  <h3>{item.name}</h3>

                  <div className="food-footer">
                    <strong>₹{item.price}</strong>

                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="cart-panel">
            <h2>Your order</h2>

            {cart.length === 0 ? (
              <p className="empty-cart">
                Your cart is empty. Add a dish to get started!
              </p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <p>₹{item.price} each</p>
                      </div>

                      <div className="quantity">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name}`}
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          aria-label={`Increase ${item.name}`}
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="total-row">
                  <span>Total</span>
                  <strong>₹{total}</strong>
                </div>

                <form className="checkout-form" onSubmit={placeOrder}>
                  <h3>Delivery details</h3>

                  <input
                    type="text"
                    placeholder="Customer name"
                    value={customer.customer_name}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        customer_name: e.target.value,
                      })
                    }
                    required
                  />

                  <textarea
                    placeholder="Delivery address"
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        address: e.target.value,
                      })
                    }
                    required
                  />

                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        phone: e.target.value,
                      })
                    }
                    pattern="[0-9]{10}"
                    title="Enter a 10-digit phone number"
                    required
                  />

                  <button
                    className="checkout-button"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Placing order..." : "Place order"}
                  </button>
                </form>
              </>
            )}
          </aside>
        </div>

        {orderMessage && (
          <p
            className={`order-message ${messageType}`}
            role="status"
            aria-live="polite"
          >
            {orderMessage}
          </p>
        )}


        {lastOrderId && (
          <section className="tracking-panel">
            <h2>Track Your Order</h2>

            <p>
              Your order has been placed successfully!
            </p>

            <p>
              Order ID: <strong>#{lastOrderId}</strong>
            </p>

            <form className="tracking-form" onSubmit={trackOrder}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Order ID"
                value={trackOrderId}
                onChange={(e) => setTrackOrderId(e.target.value)}
                required
              />

              <button type="submit" disabled={trackingLoading}>
                {trackingLoading ? "Checking..." : "Track Order"}
              </button>
            </form>

            {trackingError && (
              <p className="order-message error" role="alert">
                {trackingError}
              </p>
            )}


            {trackedOrder && (
              <div className="tracked-order">
                <h3>Order #{trackedOrder.id}</h3>

                <p>
                  Current Status:{" "}
                  <strong>
                    {orderStatusMap[Number(trackedOrder.status)]}
                  </strong>
                </p>

                {remainingSeconds > 0 ? (
                  <p>
                    Next status update in:{" "}
                    <strong>
                      {Math.floor(remainingSeconds / 60)}:
                      {String(remainingSeconds % 60).padStart(2, "0")}
                    </strong>
                  </p>
                ) : (
                  <p>Order delivered or awaiting status confirmation.</p>
                )}


                <div className="tracking-timeline">
                  {Object.entries(orderStatusMap).map(([number, label]) => {
                    const step = Number(number);
                    const currentStatus = Number(trackedOrder.status);

                    return (
                      <div
                        key={number}
                        className={`timeline-item ${step < currentStatus
                          ? "completed"
                          : step === currentStatus
                            ? "current"
                            : ""
                          }`}
                      >
                        <div className="timeline-marker">
                          {step < currentStatus ? "✓" : step}
                        </div>

                        <div className="timeline-content">
                          <h4>{label}</h4>
                          <p>
                            {step === 1 && "Your order has been received."}
                            {step === 2 && "Your food is being prepared."}
                            {step === 3 && "Your order is out for delivery."}
                            {step === 4 && "Your order has been delivered."}
                          </p>

                          {step === currentStatus && (
                            <span className="timeline-current">
                              Current status
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}
        {/*  <section className="order-status-guide">
          <h2>Order status guide</h2>

          <div className="status-list">
            {Object.entries(orderStatusMap).map(([number, label]) => (
              <div className="status-guide-item" key={number}>
                <span className="status-number">{number}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section> */}
      </main>
    </div>
  );
}

export default App;