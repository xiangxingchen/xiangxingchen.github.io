---
title: git实用命令
date: 2018-07-06 19:23:00
tags: [git]
---

回退命令：

```bash
$ git reset --hard HEAD^         回退到上个版本
$ git reset --hard HEAD~3        回退到前3次提交之前，以此类推，回退到n次提交之前
$ git reset --hard commit_id     退到/进到 指定commit的sha码
```
强推到远程：
```bash
$ git push origin HEAD --force
```