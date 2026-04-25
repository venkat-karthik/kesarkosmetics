<?php
$pageTitle = 'Checkout — Kesar Kosmetics';
$cssPath = 'css/style.css';
$loadRazorpay = true;
include 'includes/head.php';
include 'includes/header.php';
?>

<div class="min-h-screen bg-gradient-to-br from-[#FAF7F2] to-[#F5EEE6] py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- Step indicator -->
    <div class="step-indicator mb-12">
      <div class="step">
        <div class="step-num active" id="step-num-1">1</div>
        <span class="step-label active" id="step-label-1">Shipping</span>
      </div>
      <div class="step-line" id="step-line-1"></div>
      <div class="step">
        <div class="step-num" id="step-num-2">2</div>
        <span class="step-label" id="step-label-2">Review</span>
      </div>
      <div class="step-line" id="step-line-2"></div>
      <div class="step">
        <div class="step-num" id="step-num-3">3</div>
        <span class="step-label" id="step-label-3">Payment</span>
      </div>
    </div>

    <div class="flex flex-col gap-8">
      <!-- Step 1: Shipping -->
      <div id="step-shipping" class="w-full">
        <form id="shipping-form" class="bg-white p-8 rounded-3xl border-2 border-[#E0D8C8] shadow-lg">
          <h2 class="font-heading text-3xl font-bold text-[#3E2723] mb-8 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg>
            Shipping Address
          </h2>
          <div class="grid sm:grid-cols-2 gap-6 mb-6">
            <div class="form-group"><label class="form-label">Full Name *</label><input type="text" id="f-name" class="form-input" placeholder="Your full name" required /></div>
            <div class="form-group"><label class="form-label">Phone Number *</label><input type="tel" id="f-phone" class="form-input" placeholder="+91 98765 43210" required /></div>
          </div>
          <div class="form-group mb-6"><label class="form-label">Street Address *</label><input type="text" id="f-address" class="form-input" placeholder="House no., Street, Area" required /></div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="form-group"><label class="form-label">City *</label><input type="text" id="f-city" class="form-input" placeholder="City" required /></div>
            <div class="form-group">
              <label class="form-label">Country *</label>
              <select id="f-country" class="form-input" required>
                <option value="India" selected>India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="United Arab Emirates">UAE</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">State *</label>
              <select id="f-state" class="form-input" required>
                <option value="">Select state</option>
                <?php
                $states = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh"];
                foreach ($states as $s): ?>
                <option value="<?= htmlspecialchars($s) ?>"><?= htmlspecialchars($s) ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Pincode *</label><input type="text" id="f-pincode" class="form-input" placeholder="Pincode" required /></div>
          </div>
          <div class="mb-8">
            <p class="mb-3 text-sm font-semibold text-[#3E2723]">Address Type *</p>
            <div class="grid grid-cols-3 gap-3">
              <?php foreach ([['home','Home','Residential address'],['office','Office','Work location'],['others','Others','Any other address']] as [$val,$label,$sub]): ?>
              <button type="button" onclick="selectAddressType('<?= $val ?>')" id="addr-<?= $val ?>" class="addr-type-btn flex items-center gap-3 rounded-2xl border-2 border-[#E0D8C8] bg-white px-4 py-4 text-left transition-all hover:border-[#D97736]">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5EEE6] text-[#3E2723] shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
                </div>
                <div><p class="font-semibold text-[#1E1E1D] text-sm"><?= $label ?></p><p class="text-xs text-[#6B5B52]"><?= $sub ?></p></div>
              </button>
              <?php endforeach; ?>
            </div>
            <p id="addr-type-error" class="hidden mt-2 text-xs font-medium text-red-600">Please select one address type to continue.</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-4">
            <a href="cart.php" class="btn btn-primary w-full sm:w-1/2 justify-center">← Back</a>
            <button type="submit" class="btn btn-primary w-full sm:w-1/2 justify-center">Continue to Review →</button>
          </div>
        </form>
      </div>

      <!-- Step 2: Review -->
      <div id="step-review" class="hidden w-full space-y-6">
        <div class="bg-white p-8 rounded-3xl border-2 border-[#E0D8C8] shadow-lg">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-heading text-2xl font-bold text-[#3E2723]">Shipping Address</h3>
            <button onclick="goToStep('shipping')" class="text-[#D97736] hover:text-[#C96626] font-medium">Edit</button>
          </div>
          <div id="review-address" class="grid sm:grid-cols-2 gap-4 text-[#5D4037] text-sm"></div>
        </div>
        <div class="bg-white p-8 rounded-3xl border-2 border-[#E0D8C8] shadow-lg">
          <h3 class="font-heading text-2xl font-bold text-[#3E2723] mb-6">Order Items</h3>
          <div id="review-items" class="space-y-4"></div>
          <div id="review-totals" class="mt-6 pt-6 border-t-2 border-[#E0D8C8] space-y-3 text-sm text-[#5D4037]"></div>
          <div class="mt-6 flex flex-col sm:flex-row gap-4">
            <button onclick="goToStep('shipping')" class="btn btn-primary w-full sm:w-1/2 justify-center">← Back</button>
            <button onclick="goToStep('payment')" class="btn btn-primary w-full sm:w-1/2 justify-center">Continue to Payment →</button>
          </div>
        </div>
      </div>

      <!-- Step 3: Payment -->
      <div id="step-payment" class="hidden w-full">
        <form id="payment-form" class="bg-white p-8 rounded-3xl border-2 border-[#E0D8C8] shadow-lg">
          <h2 class="font-heading text-3xl font-bold text-[#3E2723] mb-8 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"/></svg>
            Choose Payment Method
          </h2>
          <div class="grid sm:grid-cols-2 gap-4 mb-8">
            <?php
            $methods = [
              ['cod','Cash on Delivery','Pay at doorstep','from-orange-50 to-amber-50'],
              ['online','Debit/Credit Card','Powered by Razorpay','from-blue-50 to-cyan-50'],
              ['upi','UPI / Google Pay','Powered by Razorpay','from-green-50 to-emerald-50'],
              ['bank','Net Banking','Powered by Razorpay','from-purple-50 to-pink-50'],
            ];
            foreach ($methods as [$id,$name,$desc,$grad]): ?>
            <label class="cursor-pointer payment-method-label" data-method="<?= $id ?>">
              <input type="radio" name="payment" value="<?= $id ?>" class="sr-only" <?= $id==='cod'?'checked':'' ?> />
              <div class="p-6 rounded-2xl border-2 border-[#E0D8C8] hover:border-[#D97736] transition-all bg-gradient-to-br <?= $grad ?>" id="pm-<?= $id ?>">
                <p class="font-bold text-[#3E2723] text-sm"><?= $name ?></p>
                <p class="text-xs text-[#5D4037] mt-1"><?= $desc ?></p>
              </div>
            </label>
            <?php endforeach; ?>
          </div>
          <div class="flex flex-col gap-3 mb-8">
            <button type="submit" id="buy-btn" class="btn btn-primary w-full justify-center h-12 text-base">Buy Now</button>
            <button type="button" onclick="goToStep('review')" class="btn btn-dark w-full justify-center h-12 text-base">← Back to Review</button>
          </div>
          <div class="flex items-center justify-center gap-3 text-sm text-[#5D4037]">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
            Your payment information is 100% secure
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<?php include 'includes/footer.php'; ?>

<script type="module">
import { readCart, getCartTotal, clearCart, formatPrice } from './js/cart.js';
import { getCurrentUser, onUserChange, db, collection, addDoc, serverTimestamp } from './js/firebase-config.js';

const BACKEND_URL = 'api';
let currentUser = null;
let shippingForm = {};
let selectedPayment = 'cod';
let discountApplied = 0;
const TAX_RATE = 0.12;

onUserChange(u => {
  currentUser = u;
  if (!u) { window.location.href = 'login.php?redirect=checkout.php'; return; }
  const items = readCart();
  if (items.length === 0) { window.location.href = 'cart.php'; return; }
  // Pre-fill name/phone
  document.getElementById('f-name').value = u.name || '';
  document.getElementById('f-phone').value = u.phone || '';
});

// ── Address type selection ────────────────────────────────────────────────
let selectedAddressType = '';
window.selectAddressType = (type) => {
  selectedAddressType = type;
  document.querySelectorAll('.addr-type-btn').forEach(btn => {
    const isActive = btn.id === 'addr-' + type;
    btn.className = `addr-type-btn flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-all ${isActive?'border-[#D97736] bg-[#FFF4E8] shadow-sm':'border-[#E0D8C8] bg-white hover:border-[#D97736]'}`;
    btn.querySelector('.flex.h-10').className = `flex h-10 w-10 items-center justify-center rounded-full ${isActive?'bg-[#D97736] text-white':'bg-[#F5EEE6] text-[#3E2723]'} shrink-0`;
  });
  document.getElementById('addr-type-error').classList.add('hidden');
};

// ── Payment method selection ──────────────────────────────────────────────
document.querySelectorAll('.payment-method-label').forEach(label => {
  label.addEventListener('click', () => {
    selectedPayment = label.dataset.method;
    document.querySelectorAll('[id^="pm-"]').forEach(el => {
      el.className = el.className.replace('ring-2 ring-[#D97736] shadow-lg','');
    });
    document.getElementById('pm-' + selectedPayment).className += ' ring-2 ring-[#D97736] shadow-lg';
  });
});

// ── Step navigation ───────────────────────────────────────────────────────
window.goToStep = (step) => {
  ['shipping','review','payment'].forEach(s => {
    document.getElementById('step-' + s).classList.toggle('hidden', s !== step);
  });
  const steps = ['shipping','review','payment'];
  const idx = steps.indexOf(step);
  steps.forEach((s, i) => {
    const numEl = document.getElementById('step-num-' + (i+1));
    const labelEl = document.getElementById('step-label-' + (i+1));
    const lineEl = document.getElementById('step-line-' + (i+1));
    if (numEl) numEl.className = `step-num${i<=idx?' active':''}`;
    if (labelEl) labelEl.className = `step-label${i<=idx?' active':''}`;
    if (lineEl) lineEl.className = `step-line${i<idx?' active':''}`;
  });
  if (step === 'review') renderReview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ── Shipping form submit ──────────────────────────────────────────────────
document.getElementById('shipping-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!selectedAddressType) {
    document.getElementById('addr-type-error').classList.remove('hidden');
    return;
  }
  shippingForm = {
    name: document.getElementById('f-name').value.trim(),
    phone: document.getElementById('f-phone').value.trim(),
    address: document.getElementById('f-address').value.trim(),
    city: document.getElementById('f-city').value.trim(),
    country: document.getElementById('f-country').value,
    state: document.getElementById('f-state').value,
    pincode: document.getElementById('f-pincode').value.trim(),
    addressType: selectedAddressType,
  };
  goToStep('review');
});

// ── Render review step ────────────────────────────────────────────────────
function renderReview() {
  const items = readCart();
  const subtotal = getCartTotal(items);
  const shipping = subtotal >= 2000 ? 0 : 100;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  document.getElementById('review-address').innerHTML = Object.entries({
    Name: shippingForm.name, Phone: shippingForm.phone,
    Address: shippingForm.address, City: shippingForm.city,
    Country: shippingForm.country, State: shippingForm.state,
    'Address Type': shippingForm.addressType, Pincode: shippingForm.pincode,
  }).map(([k,v]) => `<p><span class="font-medium">${k}:</span> ${v||'—'}</p>`).join('');

  document.getElementById('review-items').innerHTML = items.map(item => `
    <div class="flex gap-3 p-3 rounded-xl border border-[#E9E0D2] bg-[#FCFAF7]">
      <img src="${item.product?.images?.[0]||'assets/main_logo.png'}" alt="${item.product?.name||''}" class="w-16 h-16 object-cover rounded-xl shrink-0" />
      <div class="flex-1">
        <p class="font-semibold text-[#3E2723]">${item.product?.name||'Product'}</p>
        <p class="text-sm text-[#5D4037]">Qty: ${item.quantity} × ${formatPrice(item.product?.price||0)}</p>
        <p class="font-bold text-[#3E2723]">${formatPrice((item.product?.price||0)*item.quantity)}</p>
      </div>
    </div>
  `).join('');

  document.getElementById('review-totals').innerHTML = `
    <div class="flex justify-between"><span>Subtotal</span><span class="font-medium">${formatPrice(subtotal)}</span></div>
    <div class="flex justify-between"><span>Tax (12% GST)</span><span class="font-medium">${formatPrice(tax)}</span></div>
    <div class="flex justify-between"><span>Shipping</span><span class="font-medium">${shipping===0?'<span class="text-green-600">FREE</span>':formatPrice(shipping)}</span></div>
    <div class="flex justify-between pt-3 border-t-2 border-[#D97736] text-lg font-bold text-[#3E2723]"><span>Total</span><span class="text-[#D97736]">${formatPrice(total)}</span></div>
  `;
}

// ── Payment form submit ───────────────────────────────────────────────────
document.getElementById('payment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) { window.location.href = 'login.php?redirect=checkout.php'; return; }

  const items = readCart();
  const subtotal = getCartTotal(items);
  const shipping = subtotal >= 2000 ? 0 : 100;
  const tax = subtotal * TAX_RATE;
  const grandTotal = subtotal + shipping + tax;

  const payload = {
    items: items.map(i => ({
      product_id: i.product_id,
      product_name: i.product?.name || 'Product',
      quantity: i.quantity,
      price: i.product?.price || 0,
      variant: i.variant || null,
      image: i.product?.images?.[0] || null,
    })),
    shipping_address: shippingForm,
    payment_method: selectedPayment,
    total: grandTotal,
    discount: discountApplied,
    user_id: currentUser._id,
    user_email: currentUser.email,
    user_name: currentUser.name,
    user_phone: currentUser.phone || shippingForm.phone,
  };

  const btn = document.getElementById('buy-btn');
  btn.disabled = true; btn.textContent = 'Processing…';

  const saveToFirestore = async (orderId, status = 'confirmed') => {
    try {
      await addDoc(collection(db, 'orders'), {
        orderId, userId: currentUser._id, userEmail: currentUser.email,
        userName: currentUser.name, items: payload.items,
        shippingAddress: shippingForm, paymentMethod: selectedPayment,
        subtotal, discount: discountApplied, shipping, tax, total: grandTotal,
        status, createdAt: serverTimestamp(),
      });
    } catch(err) { console.error('Firestore save error:', err); }
  };

  try {
    if (selectedPayment === 'cod') {
      const res = await fetch('api/orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      await saveToFirestore(data.id, 'confirmed');
      await clearCart();
      showToast('Order placed successfully!', 'success');
      window.location.href = 'order-success.php?orderId=' + data.id;
    } else {
      // Razorpay
      const res = await fetch('api/razorpay-create.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.demo) {
        showToast('Demo payment successful!', 'success');
        await saveToFirestore(data.order.id, 'paid');
        await clearCart();
        window.location.href = 'order-success.php?orderId=' + data.order.id;
        return;
      }

      if (!data.razorpay?.key_id || !window.Razorpay) {
        throw new Error('Razorpay not available');
      }

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: data.razorpay.key_id,
          amount: data.razorpay.amount,
          currency: data.razorpay.currency,
          name: 'Kesar Kosmetics',
          description: 'Order payment',
          order_id: data.razorpay.order_id,
          prefill: { name: shippingForm.name, email: currentUser.email, contact: shippingForm.phone },
          theme: { color: '#D97736' },
          handler: async (response) => {
            try {
              const vRes = await fetch('api/razorpay-verify.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  user_id: currentUser._id,
                  user_email: currentUser.email,
                }),
              });
              const vData = await vRes.json();
              showToast('Payment verified!', 'success');
              await saveToFirestore(vData.id || data.order.id, 'paid');
              await clearCart();
              window.location.href = 'order-success.php?orderId=' + (vData.id || data.order.id);
              resolve();
            } catch(err) { showToast('Payment verification failed', 'error'); reject(err); }
          },
          modal: { ondismiss: () => { showToast('Payment cancelled', 'error'); reject(new Error('cancelled')); } },
        });
        rzp.on('payment.failed', (r) => { showToast(r?.error?.description || 'Payment failed', 'error'); reject(new Error('failed')); });
        rzp.open();
      });
    }
  } catch(err) {
    console.error('Order error:', err);
    if (err.message !== 'cancelled' && err.message !== 'failed') {
      showToast('Could not place order. Please try again.', 'error');
    }
  } finally {
    btn.disabled = false; btn.textContent = 'Buy Now';
  }
});
</script>

<?php include 'includes/scripts.php'; ?>
</body>
</html>
