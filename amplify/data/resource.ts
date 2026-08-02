import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  Chef: a
    .model({
      visits: a.date().array(),
    })
    .authorization((allow) => [allow.authenticated("identityPool")]),
  Item: a
    .model({
      name: a.string().required(),
      description: a.string().required(),
      deletedAt: a.string(),
      orderItems: a.hasMany("OrderItem", "itemId"),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated("identityPool").to(["create", "read", "update", "delete"]),
    ]),
  OrderItem: a
    .model({
      itemId: a.id(),
      item: a.belongsTo("Item", "itemId"),
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
