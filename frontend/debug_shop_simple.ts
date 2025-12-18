
// Standalone script, no imports
async function testPublicAccess() {
    try {
        const slug = "2ak54a56269a";
        const BASE_URL = "https://api.elegant.ux.wimsup.com";
        const ITEMS_BOOKINGS_URL = "https://api.elegant.admin.wimsup.com"; // Admin URL for bookings

        console.log(`Fetching booking for slug: ${slug}`);

        const headers = {
            "X-Elegant-Domain": "mrudgandh.in",
            "X-Elegant-Auth": "b7e1d4f2-2c9a-4a8e-bd3f-6c1e9a2f7d8c",
            "Content-Type": "application/json"
        };

        // 1. Get Public Token
        const authResponse = await fetch(`${BASE_URL}/auth/me`, { headers });
        if (!authResponse.ok) {
            console.log("Auth failed");
            return;
        }
        const authData = await authResponse.json();
        const token = authData.authToken;
        console.log("Got Public Token:", token ? "Yes" : "No");

        // 2. Get Booking
        const bookingUrl = `${BASE_URL}/booking_by_slug/${slug}`;
        console.log("Fetching booking from:", bookingUrl);
        const bookingResponse = await fetch(bookingUrl, {
            headers: { ...headers, "Authorization": `Bearer ${token}` }
        });

        if (!bookingResponse.ok) {
            console.log("Booking fetch failed:", bookingResponse.status);
            return;
        }

        const bookings = await bookingResponse.json();
        if (!bookings.length) {
            console.log("No booking found");
            return;
        }

        const booking = bookings[0];
        console.log("Booking found. Shop ID:", booking.shops_id);

        // 3. Try /shops/{id} (using ITEMS_BOOKINGS_URL because that's where shops usually are)
        const shopUrl = `${ITEMS_BOOKINGS_URL}/shops/${booking.shops_id}`;
        console.log("Fetching shop from:", shopUrl);

        const shopResponse = await fetch(shopUrl, {
            headers: { ...headers, "Authorization": `Bearer ${token}` }
        });

        if (shopResponse.ok) {
            const shopData = await shopResponse.json();
            console.log("Shop Data Keys:", Object.keys(shopData));
            // Check if settings are inside?
            console.log(JSON.stringify(shopData, null, 2));
        } else {
            console.log("Shop fetch failed:", shopResponse.status);
            const text = await shopResponse.text();
            console.log("Response:", text);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

testPublicAccess();
