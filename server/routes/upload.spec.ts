import { describe, it, expect, vi, beforeAll } from "vitest";
import { createServer } from "../index";
import request from "supertest";

// Mock Cloudinary
vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn().mockResolvedValue({
        secure_url: "https://res.cloudinary.com/test/image/upload/test.jpg",
        public_id: "test-public-id",
      }),
    },
  },
}));

describe("Upload API", () => {
  let app: ReturnType<typeof createServer>;

  beforeAll(() => {
    app = createServer();
  });

  it("should upload an image successfully", async () => {
    const base64Image =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const response = await request(app)
      .post("/api/upload")
      .send({ file: base64Image })
      .expect(200);

    expect(response.body).toHaveProperty("url");
    expect(response.body).toHaveProperty("publicId");
    expect(response.body.url).toContain("cloudinary.com");
  });

  it("should return 400 if no file is provided", async () => {
    const response = await request(app)
      .post("/api/upload")
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("No file provided");
  });
});
