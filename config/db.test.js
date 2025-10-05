const mockConnect = jest.fn();

jest.mock("mongoose", () => ({
  connect: mockConnect,
}));

String.prototype.bgMagenta = function () {
  return this; // returns the string itself
};
String.prototype.bgRed = function () {
  return this;
};
String.prototype.white = function () {
  return this;
};

// Import connectDB after mocking
const connectDB = require("./db.js");

describe("connectDB", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("logs success message when connection succeeds", async () => {
    mockConnect.mockResolvedValue({
      connection: { host: "mockhost123" },
    });

    await connectDB();

    expect(mockConnect).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Connected To Mongodb Database mockhost123")
    );
  });

  it("logs error message when connection fails", async () => {
    const fakeError = new Error("Failed to connect");
    mockConnect.mockRejectedValue(fakeError);

    await connectDB();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Error in Mongodb ${fakeError}`)
    );
  });
});
