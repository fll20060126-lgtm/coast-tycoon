# 海岸大亨

手机横屏、电脑浏览器可玩的单人大富翁游戏。

## 发布

把本目录推送到 GitHub 仓库的 main 分支。打开仓库 Settings → Pages，将 Source 设置为 GitHub Actions，运行 Publish game 工作流。

成功后在 Pages 页面获得实际游戏链接。每次向 main 更新文件会自动部署。

也可选择 Deploy from a branch，选择 main /docs，无需工作流即可发布。

## 更新

游戏文件在 docs/。service-worker.js 已支持 GitHub Pages 的仓库子路径。
更新内容时同时调整 version.json、update.js 中的版本标识和 service-worker.js 缓存版本。

## 存档

进度保存在当前浏览器。新的 GitHub 域名不会自动继承旧域名的本地存档。
本次发布不加载原 WorkBuddy 云同步，避免第三方域名授权和 SDK 加载影响试玩。
