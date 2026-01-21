# 企业微信详细配置指南

本文档将指导您完成企业微信 (WeChat Work) 的后台配置，以支持 classPlatform 的免登登录和移动端访问功能。

## 1. 准备工作

您需要拥有一个企业微信管理员账号，并登录 [企业微信管理后台](https://work.weixin.qq.com/wework_admin/frame)。

## 2. 创建自建应用

1.  登录管理后台，点击 **应用管理**。
2.  在"自建"栏目下，点击 **+ 创建应用**。
3.  填写应用信息：
    *   **应用 Logo**: 上传 classPlatform 的 Logo。
    *   **应用名称**: `classPlatform` (或您喜欢的名字)。
    *   **应用介绍**: `电磁学智能辅导平台`。
    *   **可见范围**: 选择可以使用该应用的用户或部门（建议选择全员）。
4.  点击 **创建应用**。

## 3. 获取关键凭证

创建成功后，在应用详情页可以获取以下信息，请妥善保存：

*   **AgentId**: 应用 ID（例如 `1000001`）。
*   **Secret**: 应用密钥。点击"查看"，需要在企业微信 App 上确认操作才能获取。

此外，点击 **我的企业** -> **企业信息**，获取：

*   **CorpId**: 企业 ID（例如 `ww1a2b3c4d5e6f7g8h`）。

## 4. 后端环境配置

将获取到的凭证配置到后端服务的环境变量中。

如果是 Docker 部署，请修改 `code/deployment/docker/.env` 或 `docker-compose.yml`：

```yaml
environment:
  - WECOM_CORPID=ww1a2b3c4d5e6f7g8h      # 您的企业ID
  - WECOM_AGENTID=1000001                # 您的应用AgentId
  - WECOM_SECRET=xxxx_xxxxxxxxxxxxxxxxx  # 您的应用Secret
```

如果是本地开发，请导出环境变量：

```bash
export WECOM_CORPID=ww1a2b3c4d5e6f7g8h
export WECOM_AGENTID=1000001
export WECOM_SECRET=xxxx_xxxxxxxxxxxxxxxxx
```

## 5. 配置网页授权与 JS-SDK

为了让前端能够进行 OAuth 登录和调用 JS-SDK，必须配置"可信域名"。

1.  在应用详情页，找到 **开发者接口** 部分。
2.  点击 **网页授权及 JS-SDK** 后的 "申请域名校验"（如果你有域名文件上传权限）或直接设置。
3.  **设置可信域名**:
    *   填写您前端部署的域名（**不带** `http://` 或 `https://`），例如 `class.example.com`。
    *   **重要**: 必须确保该域名已备案且可公网访问（企业微信要求）。
    *   如果是本地调试，可以使用 `内网穿透` 工具（如 ngrok, frp）将本地端口映射到公网域名。
4.  **下载校验文件** (若需要): 将下载的 `.txt` 文件放置在前端构建产物的根目录 (`dist/` 或 `public/`) 下，确保可以通过 `https://class.example.com/WW_verify_blahblah.txt` 访问到。
5.  点击 **确定** 保存。

## 6. 配置应用主页

为了让用户在企业微信手机端点击应用直接进入平台：

1.  在应用详情页，找到 **应用主页**。
2.  点击 **设置应用主页**。
3.  填写前端首页地址：`https://class.example.com/`。
4.  保存。

## 7. 配置自定义菜单 (可选)

您可以为应用设置底部菜单，方便用户快速跳转。

1.  在应用详情页，点击 **菜单配置**。
2.  添加菜单项，例如：
    *   **进入课堂**: 跳转网页 `https://class.example.com/`
    *   **个人中心**: 跳转网页 `https://class.example.com/profile`
3.  发布菜单。

## 8. 前端部署验证

1.  确保前端代码已构建并部署到上述域名。
2.  在企业微信手机 App 中，点击 **工作台** -> **classPlatform**。
3.  应用应自动跳转登录，无需输入账号密码。
4.  测试侧边栏菜单和聊天功能是否适配正常。

## 常见问题

**Q: 提示 "redirect_uri 域名与后台配置不一致"？**
A: 请检查步骤 5 中的可信域名设置，确保与您访问的 URL 域名完全一致。

**Q: 提示 "no_wecom_code"？**
A: 这意味着 OAuth 跳转失败或未携带 code。请确保是通过企业微信环境访问，且应用主页 URL 配置正确。
