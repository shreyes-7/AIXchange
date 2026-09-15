import test from "node:test";
import assert from "node:assert/strict";
import paymentService from "../src/services/payment.service.js";
import Order from "../src/models/order.model.js";

test("paymentService.getPricing() returns fixed 50 INR price and standard bundles", () => {
    const pricing = paymentService.getPricing();
    assert.equal(pricing.tokenPriceInr, 50);
    assert.equal(pricing.currency, "INR");
    assert.ok(Array.isArray(pricing.bundles));
    assert.equal(pricing.bundles.length, 4);

    const starter = pricing.bundles.find((b) => b.id === "starter");
    assert.ok(starter);
    assert.equal(starter.tokens, 5);
    assert.equal(starter.inr, 250);

    const builder = pricing.bundles.find((b) => b.id === "builder");
    assert.ok(builder);
    assert.equal(builder.tokens, 10);
    assert.equal(builder.inr, 500);
});

test("Order model schema validates required fields and defaults", () => {
    const order = new Order({
        orderId: "order_test_123",
        userId: "507f191e810c19729de860ea",
        walletAddress: "0x0000000000000000000000000000000000000001",
        tokenAmount: 10,
        fiatAmount: 500,
        currency: "INR",
        status: "PENDING",
    });

    assert.equal(order.validateSync(), undefined);
    assert.equal(order.status, "PENDING");
    assert.equal(order.currency, "INR");
});

test("paymentService.createOrder rejects if user has no connected wallet", async () => {
    await assert.rejects(
        () => paymentService.createOrder({ name: "Alice" }, { tokenAmount: 10 }),
        /Please connect a MetaMask wallet/
    );
});

test("paymentService.createOrder rejects invalid token amounts (< 1 or non-integer)", async () => {
    const mockUser = {
        _id: "507f191e810c19729de860ea",
        wallet: { address: "0x0000000000000000000000000000000000000001", verified: true },
    };

    await assert.rejects(
        () => paymentService.createOrder(mockUser, { tokenAmount: 0 }),
        /Token amount must be a whole number/
    );

    await assert.rejects(
        () => paymentService.createOrder(mockUser, { tokenAmount: -5 }),
        /Token amount must be a whole number/
    );
});
