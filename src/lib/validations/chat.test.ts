import {
  conversationsQuerySchema,
  messagesQuerySchema,
  sendMessageSchema,
} from "./chat";

const CHANNEL_ID = "123e4567-e89b-12d3-a456-426614174000";

describe("conversationsQuerySchema", () => {
  it("accepts a valid channel UUID", () => {
    expect(
      conversationsQuerySchema.safeParse({ channelId: CHANNEL_ID }).success,
    ).toBe(true);
  });

  it("rejects a non-UUID channelId", () => {
    const result = conversationsQuerySchema.safeParse({ channelId: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Selecione um canal válido.");
    }
  });
});

describe("messagesQuerySchema", () => {
  it("defaults page/limit", () => {
    const result = messagesQuerySchema.safeParse({ channelId: CHANNEL_ID });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(30);
    }
  });

  it("rejects a limit above 100", () => {
    expect(
      messagesQuerySchema.safeParse({ channelId: CHANNEL_ID, limit: "150" })
        .success,
    ).toBe(false);
  });
});

describe("sendMessageSchema", () => {
  it("accepts a valid outbound message", () => {
    expect(
      sendMessageSchema.safeParse({
        channelId: CHANNEL_ID,
        content: "Olá, tudo bem?",
      }).success,
    ).toBe(true);
  });

  it("rejects an empty message", () => {
    const result = sendMessageSchema.safeParse({
      channelId: CHANNEL_ID,
      content: "   ",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Digite uma mensagem.");
    }
  });

  it("rejects a message longer than 4096 characters", () => {
    expect(
      sendMessageSchema.safeParse({
        channelId: CHANNEL_ID,
        content: "a".repeat(4097),
      }).success,
    ).toBe(false);
  });
});
