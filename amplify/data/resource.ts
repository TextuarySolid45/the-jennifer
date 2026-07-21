import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  Chef: a
    .model({
      visits: a.date().array(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  Item: a
    .model({
      name: a.string().required(),
      description: a.string().required(),
      orderItems: a.hasMany("OrderItem", "itemId"),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  OrderItem: a
    .model({
      itemId: a.id(),
      item: a.belongsTo("Item", "itemId"),
      orderId: a.id(),
      order: a.belongsTo("Order", "orderId"),
      quantity: a.integer().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  Order: a
    .model({
      items: a.hasMany("OrderItem", "orderId"),
      name: a.string().required(),
      household: a.string().required(),
      expectedDeliveryDate: a.date().required(),
      notes: a.string().required().default(""),
      status: a.enum([
        "ORDERED",
        "PREPARING",
        "READY",
        "DELIVERING",
        "DELIVERED",
      ]),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});
