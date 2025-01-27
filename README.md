# gmc

- 自动签到，支持多帐号及多角色
- 支持币的签到和每日任务
- 支持接入人人打码
- 每天早上 7:00 执行
- 部分失败不会使整体流程终止，并且你会收到一封来自 GitHub 的 Actions 失败提醒邮件（如果收不到可以配置 webhook，见下文）
- 运行时会自动同步该上游仓库，并使用上游仓库文件解决冲突，如有自定义需求请自行修改 workflow

## 使用方法

**在 GitHub Actions 中使用：**

1. Fork 本项目
2. 前往 Actions 页面启用 GitHub Actions
3. 构造 json 配置文件，创建 [gist](https://gist.github.com/) 并获取源文件链接
   1. description 随便，filename 以 `.json` 结尾（或者 `.jsonc`，本项目也支持），例如 `gmc-config.json`
   2. 填入配置文件内容
   3. 点击“Create secret gist”创建私有 gist
   4. 右击右上角“Raw”，复制链接地址，将这个链接最后的 `/raw/xxx/yyy.json` 部分中的 `xxx/` 删除，即变为 `/raw/yyy.json`，就得到我们要的源文件链接了
   5. 以后如果想要修改配置文件就直接修改这个 gist 即可
4. 将配置文件链接写入 `CONFIG_URL` secrets

> 这类 GitHub Actions 使用方式实际上违反了 TOS，建议有条件的使用阿里云或腾讯云的云函数

**在本地使用：**

1. 安装 Node.js
2. Clone 本项目
3. `npm i`
4. 构造 json 配置文件，命名为 `config.json`（或者 `config.jsonc`，本项目也支持）并置于项目根目录
5. `npm start`

### 自动同步上游

每日执行前会自动同步主仓库，主仓库可能会修改 workflow 配置文件，而 GitHub Actions 默认提供的 token 只有 repo 权限而没有 workflow 权限，此时会同步失败

有两种解决方案：

1. [点击此处](https://github.com/settings/tokens/new?description=genshin-mys-checkin&scopes=workflow)打开 personal token 生成页，默认会帮你填好 note 和自动勾选 workflow scope，生成然后写入 `ACCESS_TOKEN` secrets  
2. 如果你不愿意或不放心使用 token，可以自行同步主仓库，现在 GitHub 网页端添加了一个“Fetch upstream”功能，你可以直接在网页端完成同步

## 配置

```json
{
  "users": [
    {
      "cookie": "",
      "stoken": "",
      "ua": ""
    }
  ],
  "failedWebhook": "",
  "rrocrAppkey": "",
  "savingMode": false
}
```

### `cookie` & `stoken`

1. 打开你的浏览器,进入**无痕/隐身模式**
2. 打开 `https://www.miyoushe.com/ys/` 并登录
3. 在上一步登入完成后新建标签页，打开 `http://user.mihoyo.com/` 并登录
4. <kbd>F12</kbd> 打开开发者工具，点击上方 Network 选项卡，然后刷新页面
5. 点击下方网络请求列表最上面第一项 `user.mihoyo.com`，在右侧面板往下滚找到 Request Headers 中的 cookie，后面的内容即为 `cookie`
6. 点击上方 Console 选项卡，粘贴下方代码并回车，输出的内容即为 `stoken`

   ```js
   (async cookie => {
     const ret = await fetch(`https://api-takumi.mihoyo.com/auth/api/getMultiTokenByLoginTicket?login_ticket=${cookie.login_ticket}&token_types=3&uid=${cookie.login_uid}`).then(r => r.json());
     console.log(ret.data.list.find(({ name }) => name === 'stoken').token);
   })(Object.fromEntries(document.cookie.split(/;\s*/).map(str => str.split('='))));
   ```

### `ua`

选填，以前为了应对验证码风控而新增的配置，但目前脚本签到出现验证码几乎是必然情况，此配置可以认为没有作用，请使用 `rrocrAppkey` 解决

UA 获取方法：使用 MYS APP 扫以下二维码获取 UA，填入配置文件中

[![](https://user-images.githubusercontent.com/24877906/188344519-8b969898-6071-4642-9da2-27c64149f76b.png)](https://tool.ip138.com/useragent/)

### `failedWebhook`

当运行出错时会自动以 GET 方式请求，可选

### `rrocrAppkey`

人人打码自动过验证码，dddd

### `savingMode`

节约模式，如果使用打码服务并设置 `savingMode` 为 `true`，那么当本月原石奖励拿齐后将不再继续签到
