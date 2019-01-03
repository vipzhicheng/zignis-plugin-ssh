# zignis-plugin-ssh

zignis-plugin-ssh 顾名思义，这是一个用来管理 ssh 账号的命令行工具，基于 `Zignis`，能够完成添加账户，列表和查询账户，登录账户等操作，而且具有一定的安全性

# 安装和使用

```
$ npm i -g zignis zignis-plugin-ssh
$ zignis ssh add
$ zignis ssh list
$ zignis ssh login
```

# 密钥管理

密钥用多种管理方式，其中常用的一种是放在 `Zignis` 本机通用配置中：`~/.zignis/.zignisrc.json`

```
{
    "commandDefault": {
        "ssh": {
            "key": "Any string can be used to be key, longer is better.",
        },
    }
}
```

这样，所有的账户都会使用这个 key 进行加解密。

另外，我们也可以把这个 key 隐藏起来，比如放到自己的云笔记里，这样，无论是创建账户加密时还是登录账户解密时都会询问等待输入 key，这样甚至可以做到不同的账户使用不同的 key 进行加密，当然这样管理起来就比较麻烦，不推荐使用；还可以通过命令的 `--key` 选项提供 key，这是最不推荐的一种方式，但是可以工作。

关于 Key 的选择，如果配置在配置文件中或者记在笔记里，可以设置的长一些，如果是自己记在心里，那就不宜过长。

密钥文件会放到 `~/.zignis/.ssh-accounts，但是由于是加密的，所以相对比较安全

# 依赖和兼容性

这个工具依赖机器有安装 openssh 和 expect 命令行工具，因此基本上大多数 Linux 以及 MacOS 都应该是支持的，Windows 就不支持了。

# 协议

MIT