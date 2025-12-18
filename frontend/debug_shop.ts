
import { getBookingBySlugWithPublicAuth, getBookingWithPublicAuth, authManager } from './src/services/api';

async function testPublicAccess() {
    try {
        const slug = "2ak54a56269a";
        console.log(`Fetching booking for slug: ${slug}`);

        // 1. Get Booking
        const bookings = await getBookingBySlugWithPublicAuth(slug);
        if (!bookings.length) {
            console.log("No booking found");
            return;
        }

        const booking = bookings[0];
        console.log("Booking found:", booking.id, "Shop ID:", booking.shops_id);

        // 2. Try to fetch Shop details using public token
        // We need to manually construct this fetch because we don't have a function for it yet
        // and we want to see what /shops/:id returns

        // Public Token extraction (simulated from api.ts logic)
        const authResponse = await fetch("https://api.elegant.ux.wimsup.com/auth/me", {
            headers: {
                "X-Elegant-Domain": "mrudgandh.in",
                "X-Elegant-Auth": "b7e1d4f2-2c9a-4a8e-bd3f-6c1e9a2f7d8c",
                "Content-Type": "application/json"
            }
        });
        const authData = await authResponse.json();
        const token = authData.authToken;
        console.log("Got Public Token");

        // Try /shops/{id}
        const shopUrl = `https://api.elegant.admin.wimsup.com/shops/${booking.shops_id}`;
        console.log("Fetching shop from:", shopUrl);

        const shopResponse = await fetch(shopUrl, {
            headers: {
                "X-Elegant-Domain": "mrudgandh.in",
                "X-Elegant-Auth": "b7e1d4f2-2c9a-4a8e-bd3f-6c1e9a2f7d8c",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (shopResponse.ok) {
            const shopData = await shopResponse.json();
            console.log("Shop Data Keys:", Object.keys(shopData));
            console.log("Shop Data:", JSON.stringify(shopData, null, 2));
        } else {
            console.log("Shop fetch failed:", shopResponse.status, shopResponse.statusText);
            const text = await shopResponse.text();
            console.log("Response:", text);
        }

        // Try /shop_info with query param?
        const shopInfoUrl = `https://api.elegant.admin.wimsup.com/shop_info?shops_id=${booking.shops_id}`;
        console.log("Fetching shop_info from (guess):", shopInfoUrl);

        const shopInfoResponse = await fetch(shopInfoUrl, {
            headers: {
                "X-Elegant-Domain": "mrudgandh.in",
                "X-Elegant-Auth": "b7e1d4f2-2c9a-4a8e-bd3f-6c1e9a2f7d8c",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (shopInfoResponse.ok) {
            const infoData = await shopInfoResponse.json();
            console.log("Shop Info Data Keys:", Object.keys(infoData));
        } else {
            console.log("Shop Info fetch failed:", shopInfoResponse.status);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

testPublicAccess();
