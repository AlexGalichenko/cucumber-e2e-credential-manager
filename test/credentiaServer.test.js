const CredentialManager = require("../lib/ServerCredentialManager");

beforeAll(async () => {
    await CredentialManager.start();
});

beforeEach(async () => {
    await CredentialManager.createPool([
        {
            username: "user1",
            password: "password"
        },
        {
            username: "user2",
            password: "password"
        }]
    )
});

test("get user", async () => {
    const user = await CredentialManager.getCredentials();
    expect(user.username).toBe("user1");
    expect(user.password).toBe("password");
});

afterAll(async () => {
    await CredentialManager.stop();
});
