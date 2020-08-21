# vue_shop 电商后台管理系统

## 前言

该项目为前后端分离项目的前端部分，后端项目地址：[传送门](https://github.com/macrozheng/mall)。

## 项目介绍

`vue_shop`是一个电商后台管理系统的前端项目，基于Vue+Element实现。主要包括商品管理、订单管理、用户管理、权限管理、用户权限、数据报表等功能。


### 技术选型

技术 | 说明 | 官网
----|----|----
Vue | 前端框架 | [https://vuejs.org/](https://vuejs.org/)
Vue-router | 路由框架 | [https://router.vuejs.org/](https://router.vuejs.org/)
Element | 前端UI框架 | [https://element.eleme.io/](https://element.eleme.io/)
Axios | 前端HTTP框架 | [https://github.com/axios/axios](https://github.com/axios/axios)
e-charts | Echarts图表框架 | [https://echarts.apache.org](https://echarts.apache.org)
lodash | JS工具库 | [https://lodash.com/](https://lodash.com/)
nprogress | 进度条控件 | [https://github.com/rstacruz/nprogress](https://github.com/rstacruz/nprogress)
vue-quill-editor | 富文本编辑器 | [https://github.com/surmon-china/vue-quill-editor#readme](https://github.com/surmon-china/vue-quill-editor#readme)
vue-table-with-tree-grid | 树状表格工具 | [https://github.com/MisterTaki/vue-table-with-tree-grid](https://github.com/MisterTaki/vue-table-with-tree-grid)
vue-cli | 项目脚手架参考 | [https://cli.vuejs.org/](https://cli.vuejs.org/)

### 项目布局

``` lua
src -- 源码目录
├── api -- axios网络请求定义
├── assets -- 静态图片资源文件
├── components -- 通用组件封装
├── router -- vue-router路由配置
├── plugins -- 全局css样式
└── views -- 前端页面
    ├── login -- 登录页
    ├── home -- 首页
    ├── layout -- 通用页面加载框架
    ├── users -- 用户管理
    ├── roles -- 添加角色
    ├── goods -- 商品管理
        ├── list -- 商品列表
        ├── params -- 商品分类参数
        ├── categories -- 商品分类
    ├── orders -- 订单管理
    └── reports -- 数据报表
```
