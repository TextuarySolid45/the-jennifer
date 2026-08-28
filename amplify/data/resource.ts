import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  Visit: a
    .model({
      startDate: a.date().required(),
      endDate: a.date().required(),
      label: a.string(),
      orders: a.hasMany("Order", "visitId"),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated("identityPool").to(["create", "read", "update", "delete"]),
    ]),
  Item: a
    .model({
      name: a.string().required(),
      description: a.string().required(),
      deletedAt: a.string(),
      orderItems: a.hasMany("OrderItem", "itemId"),
      flavors: a.hasMany("Flavor", "itemId"),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated("identityPool").to(["create", "read", "update", "delete"]),
    ]),
  // A named variant of an Item (e.g. "Garlic" on a bagel). `available` is a soft-delete
  // toggle, not a row-value auth condition — Amplify Gen2 can't gate read by a field's own
  // value, so guests hiding unavailable flavors happens client-side (filter in the UI), not here.
  Flavor: a
    .model({
      name: a.string().required(),
      available: a.boolean().required().default(true),
      itemId: a.id(),
      item: a.belongsTo("Item", "itemId"),
      orderItems: a.hasMany("OrderItem", "flavorId"),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated("identityPool").to(["create", "read", "update", "delete"]),
    ]),
  OrderItem: a
    .model({
      itemId: a.id(),
      item: a.belongsTo("Item", "itemId"),
      flavorId: a.id(),
      flavor: a.belongsTo("Flavor", "flavorId"),
      orderId: a.id(),
      order: a.belongsTo("Order", "orderId"),
      quantity: a.integer().required(),
    })
    .authorization((allow) => [
      allow.guest().to(["create", "read", "update", "delete"]),
      allow.authenticated("identityPool").to(["create", "read", "update", "delete"]),
    ]),
  Order: a
    .model({
      items: a.hasMany("OrderItem", "orderId"),
      name: a.string().required(),
      household: a.string().required(),
      expectedDeliveryDate: a.date().required(),
      notes: a.string().required().default(""),
      // Which of the aunt's visits this order is being fulfilled on. Guests can see
      // it (so they know which trip their order is attached to) but only the aunt
      // assigns/changes it — same pattern as `status` below.
      visitId: a
        .id()
        .authorization((allow) => [
          allow.guest().to(["read"]),
          allow.authenticated("identityPool").to(["create", "read", "update"]),
        ]),
      visit: a.belongsTo("Visit", "visitId"),
      // Guests may only flip this timestamp to submit their own order (ORDERING -> ORDERED);
      // everything past that is driven by `status`, which guests can read but never write.
      submittedAt: a
        .string()
        .authorization((allow) => [
          allow.guest().to(["read", "update"]),
          allow.authenticated("identityPool").to(["read", "update"]),
        ]),
      status: a
        .string()
        .authorization((allow) => [
          allow.guest().to(["read"]),
          allow.authenticated("identityPool").to(["create", "read", "update"]),
        ]),
    })
    .authorization((allow) => [
      allow.guest().to(["create", "read", "update", "delete"]),
      allow.authenticated("identityPool").to(["create", "read", "update", "delete"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "identityPool",
  },
});
