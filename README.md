<div align="center">
<img src="docs/icon_256.png" alt="" />
<h1>ZeppTasks</h1>
<p>
<a title="Crowdin" target="_blank" href="https://crowdin.com/project/zepptasks"><img src="https://badges.crowdin.net/zepptasks/localized.svg"></a>
</p>
<p>Task list for ZeppOS. In sync with Google Tasks</p>
</div>

- [📀 Homepage & Download](https://melianmiko.ru/en/zepp/tasks/)
- [❤️ Make a donation](https://melianmiko.ru/en/donate/)
- [🌎 Help with localization](https://crowdin.com/project/zepptasks)

## Build instructions

Required software:
- Python 3.10+
- NodeJS and [ZeppOS CLI Tools](https://docs.zepp.com/docs/guides/tools/cli/)

First, you must register in Google Cloud and create a project
to obtain OAuth keys.
1. Create new project in Google Cloud console
2. Enable Google Tasks API
3. Create & publish some page that will be able to show obtained token, use it as callback URL
4. Configure OAuth screen, add self as test user, don't forgot to add `tasks` scope
5. Create "OAuth 2.0 Client IDs" in credentials
6. Copy `app-side/Config.js.example` to `app-side/Config.js` and paste your credentials and callback URL into them

Clone this project **recursively**:
```bash
git clone --recursive https://github.com/melianmiko/ZeppOS-Tasks.git
```

Then, you should build assets for all devices. To do that,
run `prepare_all.py` script in that project dir.
```bash
python3 prepare_all.py
```

Now, you'll be able to build project using zeus toolchain.
```bash
zeus preview
```
