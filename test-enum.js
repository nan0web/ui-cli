class ModelAsApp { generateHelp() { } }
class StatusCommand extends ModelAsApp {}
class PullCommand extends ModelAsApp {}

class TestApp extends ModelAsApp {
    static alias = 'testcli'
    static UI = { usageTitle: 'Usage:' }
    static command = {
        positional: true,
        type: [StatusCommand, PullCommand],
    }
}

const Class = TestApp;
for (const key in Class) {
    const meta = Class[key];
    console.log(key, meta?.positional);
}
