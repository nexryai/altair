const fs = require("fs");

(async () => {
    fs.rmSync(__dirname + "/../packages/backend/built", { recursive: true, force: true });
    fs.rmSync(__dirname + "/../packages/backend/node_modules", { recursive: true, force: true });

    fs.rmSync(__dirname + "/../packages/client/built", { recursive: true, force: true });
    fs.rmSync(__dirname + "/../packages/client/node_modules", { recursive: true, force: true });

    fs.rmSync(__dirname + "/../packages/misskey-js/built", { recursive: true, force: true });
    fs.rmSync(__dirname + "/../packages/misskey-js/node_modules", { recursive: true, force: true });

    fs.rmSync(__dirname + "/../built", { recursive: true, force: true });
    fs.rmSync(__dirname + "/../node_modules", { recursive: true, force: true });
})();
