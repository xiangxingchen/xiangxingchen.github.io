---
title: linux下使用docker搭建sentry
date: 2018-06-11 19:31:52
tags: [linux, docker, sentry]
---

# 准备工作
## 安装docker
可以通过apt-get或者wget安装
```bash
$ wget -qO- https://get.docker.com/ | sh
```
通过docker --version可以查看版本号并确认是否安装成功。
## 安装docker-compose
Compose是用于定义和运行复杂Docker应用的工具。你可以在一个文件中定义一个多容器的应用，然后使用一条命令来启动你的应用，然后所有相关的操作都会被自动完成。
通过curl从github上获取最新的版本，**这个命令需要使用sudo -i切换到root用户**。
```bash
curl -L https://github.com/docker/compose/releases/download/1.9.0/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```
执行完成后通过`exit`退出root用户。
可以通过`docker-compose --version`查看版本号并确定是否安装成功。

# 正式搭建sentry
## 获取sentry
从github上可以获取最新的sentry。
```bash
git clone https://github.com/getsentry/onpremise.git
```
## 搭建sentry
第一步: 制作我们的本地数据库和sentry配置目录。
```bash
mkdir  -p data/{sentry,postgres}
```
第二步: 生成一个密钥。将其作为SENTRY_SECRET_KEY添加到dock中的docker-compose.yml中。
```bash
docker-compose run --rm web config generate-secret-key
```
第三步：建立数据库。使用交互式提示创建用户帐户。
```bash
docker-compose run --rm web upgrade
```
第四步：启动所有服务
```bash
docker-compose up -d
```
至此，就可以访问本机的9000端口，使用之前填写的邮箱和口令进入sentry平台了。
{% asset_img 11.png  sentry效果图 %}

# 邮箱配置
修改 sentry.config.py文件的配置

```bash
#email = env('SENTRY_EMAIL_HOST') or (env('SMTP_PORT_25_TCP_ADDR') and 'smtp')
#if email:
#    SENTRY_OPTIONS['mail.backend'] = 'smtp'
#    SENTRY_OPTIONS['mail.host'] = email
#    SENTRY_OPTIONS['mail.password'] = env('SENTRY_EMAIL_PASSWORD') or ''
#    SENTRY_OPTIONS['mail.username'] = env('SENTRY_EMAIL_USER') or ''
#    SENTRY_OPTIONS['mail.port'] = int(env('SENTRY_EMAIL_PORT') or 25)
#    SENTRY_OPTIONS['mail.use-tls'] = env('SENTRY_EMAIL_USE_TLS', False)

SENTRY_OPTIONS['mail.backend'] = 'smtp'
SENTRY_OPTIONS['mail.host'] = 'smtp.qq.com'
SENTRY_OPTIONS['mail.password'] = '*******'
SENTRY_OPTIONS['mail.username'] = 'sentry@**.com'
SENTRY_OPTIONS['mail.port'] = 587
SENTRY_OPTIONS['mail.use-tls'] = True
```
然后重新启动服务
```bash
docker-compose down（关闭删除容器）
docker-compose build （重新编译镜像）
make build （拷贝配置文件，可以不需要）
docker-compose up -d  （运行）
```

# 参考
[linux和mac下搭建前端监控系统(基于sentry)](https://blog.csdn.net/itkingone/article/details/79005959)