# 世界美术史视觉学习站公开部署说明

这个项目是纯前端静态网站。只要把 `npm run build` 生成的 `dist/` 发布到公网静态托管服务，其他人就可以通过互联网访问。

## 推荐方式：Vercel

1. 把 `art-history-learning-site` 上传到 GitHub、GitLab 或 Bitbucket。
2. 登录 Vercel，新建项目并导入该仓库。
3. Vercel 会读取 `vercel.json`：
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 部署完成后，Vercel 会给你一个公开网址，例如 `https://your-site.vercel.app`。

## 备用方式：Netlify

1. 把项目上传到 Git 仓库，或直接拖拽 `dist/` 文件夹到 Netlify。
2. 使用仓库部署时，Netlify 会读取 `netlify.toml`：
   - Build command: `npm run build`
   - Publish directory: `dist`
3. 部署完成后，Netlify 会给你一个公开网址。

## GitHub Pages

项目已经包含 `.github/workflows/deploy.yml`。推送到 GitHub 后：

1. 打开仓库的 Settings。
2. 进入 Pages。
3. Source 选择 GitHub Actions。
4. 推送到 `main` 分支或手动运行工作流。

注意：当前图片路径按需求保持为 `/art/topic01/page01.png` 这种根路径。GitHub Pages 如果部署在 `https://用户名.github.io/仓库名/` 子路径下，图片会找不到。建议使用 Vercel、Netlify，或给 GitHub Pages 绑定自定义域名。

## 本地构建

```bash
npm install
npm run build
```

生成结果在：

```text
dist/
```

## 图片位置

公网部署时图片会一起打包，源文件仍放在：

```text
public/art/topic01/page01.png
public/art/topic02/page01.png
public/art/topic03/page01.png
```

新增专题时，再添加对应的新素材目录和 `src/data.js` 配置。
